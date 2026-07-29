/**
 * Kokoro TTS Backend — HD Voice module
 * Wraps kokoro-js (Apache-2.0) for neural text-to-speech in the browser.
 *
 * Architecture: ONNX inference runs in a Web Worker so it never blocks
 * the main thread — audio events, UI updates, and playback transitions
 * stay responsive even while the model generates audio.
 *
 * Model: onnx-community/Kokoro-82M-v1.0-ONNX  (~87 MB q8)
 * The ONNX weights are downloaded once on user opt-in and cached
 * automatically by the @huggingface/transformers Cache API layer.
 *
 * CSP requirements (if your site uses a Content-Security-Policy header):
 *   script-src  'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net
 *   connect-src 'self' https://huggingface.co https://*.huggingface.co https://*.hf.co
 *   worker-src  'self' blob:
 *   media-src   'self' blob:
 */
(() => {
  'use strict';

  /* ── Configuration ─────────────────────────────────────────────── */
  const KOKORO_CDN = 'https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js';
  const MODEL_ID   = 'onnx-community/Kokoro-82M-v1.0-ONNX';
  const DTYPE       = 'q8';

  /* ── Available voices ──────────────────────────────────────────── */
  const VOICES = [
    { id: 'af_heart',    name: 'Heart',    accent: 'US', gender: 'F' },
    { id: 'af_bella',    name: 'Bella',    accent: 'US', gender: 'F' },
    { id: 'af_nicole',   name: 'Nicole',   accent: 'US', gender: 'F' },
    { id: 'af_sarah',    name: 'Sarah',    accent: 'US', gender: 'F' },
    { id: 'af_sky',      name: 'Sky',      accent: 'US', gender: 'F' },
    { id: 'am_adam',     name: 'Adam',     accent: 'US', gender: 'M' },
    { id: 'am_michael',  name: 'Michael',  accent: 'US', gender: 'M' },
    { id: 'bf_emma',     name: 'Emma',     accent: 'GB', gender: 'F' },
    { id: 'bf_isabella', name: 'Isabella', accent: 'GB', gender: 'F' },
    { id: 'bm_george',   name: 'George',   accent: 'GB', gender: 'M' },
    { id: 'bm_lewis',    name: 'Lewis',    accent: 'GB', gender: 'M' },
  ];

  /* ── WebGPU probe ──────────────────────────────────────────────── */

  /**
   * Probe for a usable WebGPU adapter.
   * Returns 'webgpu' if a real adapter is obtained, otherwise 'wasm'.
   * Brave exposes navigator.gpu but requestAdapter() returns null.
   */
  async function detectDevice() {
    if (typeof navigator !== 'undefined' && navigator.gpu) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
          console.log('[kokoro] WebGPU adapter obtained ✅ — will use GPU inference');
          return 'webgpu';
        }
        console.log('[kokoro] navigator.gpu exists but requestAdapter() returned null — using WASM');
      } catch (e) {
        console.warn('[kokoro] WebGPU probe failed:', e.message, '— using WASM');
      }
    } else {
      console.log('[kokoro] No navigator.gpu — using WASM');
    }
    return 'wasm';
  }

  /* ── Worker source code ────────────────────────────────────────── */

  /**
   * Build the JavaScript source for the inference Web Worker.
   * The worker loads kokoro-js from CDN, initialises the ONNX model,
   * and handles generate / set-voice messages.
   *
   * Communication protocol (postMessage):
   *   Main → Worker:
   *     { type:'init',       id, modelId, dtype, device }
   *     { type:'generate',   id, text, voice }
   *     { type:'set-voice',  voice }
   *   Worker → Main:
   *     { type:'progress',   status, progress, … }    (during init)
   *     { type:'init-done',  id, device }
   *     { type:'generated',  id, samples:Float32Array, samplingRate, genMs }
   *     { type:'error',      id, error:string }
   */
  function buildWorkerSource() {
    // Use array join to avoid template-literal issues in Hugo's js.Build
    return [
      "import { KokoroTTS } from '" + KOKORO_CDN + "';",
      "",
      "let tts = null;",
      "let currentVoice = 'af_heart';",
      "",
      "self.onmessage = async (e) => {",
      "  const { type, id } = e.data;",
      "  try {",
      "    if (type === 'init') {",
      "      let device = e.data.device;",
      "      try {",
      "        tts = await KokoroTTS.from_pretrained(e.data.modelId, {",
      "          dtype: e.data.dtype,",
      "          device: device,",
      "          progress_callback: (p) => self.postMessage({ type: 'progress', ...p }),",
      "        });",
      "      } catch (devErr) {",
      "        if (device === 'webgpu') {",
      "          device = 'wasm';",
      "          tts = await KokoroTTS.from_pretrained(e.data.modelId, {",
      "            dtype: e.data.dtype,",
      "            device: 'wasm',",
      "            progress_callback: (p) => self.postMessage({ type: 'progress', ...p }),",
      "          });",
      "        } else { throw devErr; }",
      "      }",
      "      self.postMessage({ type: 'init-done', id, device });",
      "    } else if (type === 'generate') {",
      "      const t0 = performance.now();",
      "      const raw = await tts.generate(e.data.text, { voice: e.data.voice || currentVoice });",
      "      const genMs = performance.now() - t0;",
      "      const samples = new Float32Array(raw.audio);",
      "      self.postMessage(",
      "        { type: 'generated', id, samples, samplingRate: raw.sampling_rate, genMs },",
      "        [samples.buffer]",
      "      );",
      "    } else if (type === 'set-voice') {",
      "      currentVoice = e.data.voice;",
      "    }",
      "  } catch (err) {",
      "    self.postMessage({ type: 'error', id, error: err.message || String(err) });",
      "  }",
      "};",
    ].join('\n');
  }

  /* ── Main-thread module loader (fallback only) ─────────────────── */

  /**
   * Try dynamic import() first. If the browser blocks it, fall back to
   * injecting a <script type="module"> tag. Only used when Worker fails.
   */
  async function loadKokoroModule() {
    try {
      console.log('[kokoro] Trying dynamic import()…');
      const m = await import(/* webpackIgnore: true */ KOKORO_CDN);
      if (m && m.KokoroTTS) {
        console.log('[kokoro] import() succeeded');
        return m;
      }
    } catch (importErr) {
      console.warn('[kokoro] import() failed, trying <script type=module> fallback:', importErr.message);
    }

    return new Promise((resolve, reject) => {
      const nonce = '__kokoro_' + Date.now();
      const script = document.createElement('script');
      script.type = 'module';
      script.textContent = [
        "import * as mod from '" + KOKORO_CDN + "';",
        "window['" + nonce + "'] = mod;",
        "window.dispatchEvent(new CustomEvent('" + nonce + "'));",
      ].join('\n');

      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Module script load timed out after 30 s'));
      }, 30000);

      function cleanup() {
        clearTimeout(timeout);
        window.removeEventListener(nonce, onReady);
        script.remove();
      }

      function onReady() {
        cleanup();
        const mod = window[nonce];
        delete window[nonce];
        if (mod && mod.KokoroTTS) {
          console.log('[kokoro] <script type=module> fallback succeeded');
          resolve(mod);
        } else {
          reject(new Error('KokoroTTS not found in fallback module — keys: ' + Object.keys(mod || {}).join(', ')));
        }
      }

      window.addEventListener(nonce, onReady, { once: true });
      document.head.appendChild(script);
    });
  }

  /* ── Backend class ─────────────────────────────────────────────── */
  class KokoroBackend {
    constructor() {
      /* Model state */
      this.tts           = null;   // KokoroTTS instance (main-thread fallback only)
      this._ready        = false;
      this._loading      = false;
      this._failCount    = 0;
      this._lastError    = null;
      this._device       = null;   // 'webgpu' or 'wasm'

      /* Worker state */
      this._worker       = null;   // Worker instance (preferred path)
      this._useWorker    = false;
      this._msgId        = 0;      // auto-incrementing message id
      this._pending      = new Map(); // id → { resolve, reject }

      /* Playback state */
      this.currentAudio  = null;
      this.selectedVoice = 'af_heart';
      this._rate         = 1.0;
    }

    /* ---- getters ---- */
    isReady()      { return this._ready; }
    isLoading()    { return this._loading; }
    getVoices()    { return VOICES; }
    getDevice()    { return this._device; }
    usesWorker()   { return this._useWorker; }
    getLastError() { return this._lastError; }

    /** Reset failure state so the user can retry. */
    resetFailures() { this._failCount = 0; this._lastError = null; }

    /* ──────────────────────────────────────────────────────────────
     *  Lifecycle
     * ────────────────────────────────────────────────────────────── */

    /**
     * Download the kokoro-js library + ONNX model.
     * Tries Web Worker first (off-thread inference). Falls back to
     * main-thread if Worker creation or init fails.
     *
     * @param {function} [onProgress] Called with
     *   { status: 'initiate'|'download'|'progress'|'done', progress: 0-100, … }
     */
    async init(onProgress) {
      if (this._ready)   return;
      if (this._loading) return;

      if (this._failCount >= 3) {
        const msg = `Too many failures (${this._failCount}). Last: ${this._lastError || 'unknown'}. Reload the page to retry.`;
        console.warn('[kokoro]', msg);
        const err = new Error(msg);
        err._kokoroDetail = msg;
        throw err;
      }

      this._loading = true;

      try {
        const device = await detectDevice();

        /* ── Strategy 1: Web Worker (preferred) ── */
        const workerOk = await this._tryWorkerInit(device, onProgress);
        if (workerOk) {
          this._useWorker = true;
          this._ready     = true;
          console.log(`[kokoro] Model loaded — ready (device: ${this._device}, worker: true ✅)`);
          return;
        }

        /* ── Strategy 2: Main-thread fallback ── */
        console.warn('[kokoro] Worker unavailable — falling back to main-thread inference');

        console.log('[kokoro] Pre-flight check: fetching CDN…');
        try {
          const probe = await fetch(KOKORO_CDN, { method: 'HEAD', mode: 'cors' });
          console.log('[kokoro] CDN reachable:', probe.status, probe.statusText);
        } catch (fetchErr) {
          console.warn('[kokoro] CDN pre-flight failed:', fetchErr.message);
        }

        console.log('[kokoro] Loading library from CDN…');
        const module = await loadKokoroModule();
        const { KokoroTTS } = module;
        if (!KokoroTTS) throw new Error('KokoroTTS export not found');

        console.log(`[kokoro] Library loaded, downloading ONNX model (device: ${device})…`);
        let loadedDevice = device;
        try {
          this.tts = await KokoroTTS.from_pretrained(MODEL_ID, {
            dtype: DTYPE, device, progress_callback: onProgress || undefined,
          });
        } catch (devErr) {
          if (device === 'webgpu') {
            console.warn('[kokoro] WebGPU model load failed, retrying WASM:', devErr.message);
            loadedDevice = 'wasm';
            this.tts = await KokoroTTS.from_pretrained(MODEL_ID, {
              dtype: DTYPE, device: 'wasm', progress_callback: onProgress || undefined,
            });
          } else { throw devErr; }
        }

        this._device = loadedDevice;
        this._ready  = true;
        console.log(`[kokoro] Model loaded — ready (device: ${loadedDevice}, worker: false)`);

      } catch (err) {
        this._failCount++;
        this._lastError = err.message || String(err);
        console.error(`[kokoro] Init failed (attempt ${this._failCount}/3):`, err);
        err._kokoroDetail = err.message || String(err);
        throw err;
      } finally {
        this._loading = false;
      }
    }

    /* ──────────────────────────────────────────────────────────────
     *  Worker management
     * ────────────────────────────────────────────────────────────── */

    /**
     * Create an inline module Worker, load the model inside it, and
     * wire up message handling.  Returns true on success, false on failure.
     */
    async _tryWorkerInit(device, onProgress) {
      try {
        const src  = buildWorkerSource();
        const blob = new Blob([src], { type: 'application/javascript' });
        const url  = URL.createObjectURL(blob);
        let worker;
        try {
          worker = new Worker(url, { type: 'module' });
        } catch (workerErr) {
          console.warn('[kokoro] Module Worker creation failed:', workerErr.message);
          URL.revokeObjectURL(url);
          return false;
        }
        URL.revokeObjectURL(url);

        console.log('[kokoro] Worker created — sending init…');
        return await new Promise((resolve) => {
          const id = ++this._msgId;
          const timeout = setTimeout(() => {
            console.warn('[kokoro] Worker init timed out after 3 min');
            worker.terminate();
            resolve(false);
          }, 180000);

          worker.onmessage = (e) => {
            const d = e.data;
            if (d.type === 'progress') {
              onProgress?.(d);
            } else if (d.type === 'init-done' && d.id === id) {
              clearTimeout(timeout);
              this._worker = worker;
              this._device = d.device || device;
              worker.onmessage = (ev) => this._onWorkerMessage(ev);
              resolve(true);
            } else if (d.type === 'error' && d.id === id) {
              clearTimeout(timeout);
              console.warn('[kokoro] Worker init error:', d.error);
              worker.terminate();
              resolve(false);
            }
          };

          worker.onerror = (err) => {
            clearTimeout(timeout);
            console.warn('[kokoro] Worker onerror during init:', err.message || err);
            worker.terminate();
            resolve(false);
          };

          worker.postMessage({ type: 'init', id, modelId: MODEL_ID, dtype: DTYPE, device });
        });
      } catch (e) {
        console.warn('[kokoro] _tryWorkerInit exception:', e.message);
        return false;
      }
    }

    /** Handle messages from the running inference worker. */
    _onWorkerMessage(e) {
      const { type, id } = e.data;
      const pending = this._pending.get(id);
      if (!pending) return;

      if (type === 'generated') {
        this._pending.delete(id);
        pending.resolve({
          samples:      e.data.samples,
          samplingRate: e.data.samplingRate,
          genMs:        e.data.genMs,
        });
      } else if (type === 'error') {
        this._pending.delete(id);
        pending.reject(new Error(e.data.error));
      }
    }

    /** Send a generate request to the worker and return a Promise. */
    _workerGenerate(text, voice) {
      return new Promise((resolve, reject) => {
        const id = ++this._msgId;
        const timeout = setTimeout(() => {
          this._pending.delete(id);
          reject(new Error('Worker generate timed out (5 min)'));
        }, 300000);

        this._pending.set(id, {
          resolve: (r) => { clearTimeout(timeout); resolve(r); },
          reject:  (e) => { clearTimeout(timeout); reject(e); },
        });

        this._worker.postMessage({
          type: 'generate', id, text, voice: voice || this.selectedVoice,
        });
      });
    }

    /* ──────────────────────────────────────────────────────────────
     *  Audio generation
     * ────────────────────────────────────────────────────────────── */

    /**
     * Generate audio for the given text.
     * Routes to Worker (off-thread) or main-thread based on init path.
     * Returns { url, audio } ready for playback.
     */
    async generate(text, voice) {
      if (!this._ready) throw new Error('not-ready');

      const t0      = performance.now();
      const preview = text.length > 60 ? text.slice(0, 60) + '…' : text;
      console.log(`[kokoro-gen] ⏳ START generate (${text.length} chars) "${preview}"`);

      let samples, samplingRate;

      if (this._useWorker && this._worker) {
        /* Off-thread path — main thread stays free */
        const result = await this._workerGenerate(text, voice);
        samples      = result.samples;
        samplingRate = result.samplingRate;
        const dur    = (samples.length / samplingRate).toFixed(1);
        console.log(`[kokoro-gen] ✅ WORKER done in ${result.genMs.toFixed(0)} ms (wall ${(performance.now() - t0).toFixed(0)} ms) — ${dur}s audio`);
      } else {
        /* Main-thread fallback */
        const voiceId = voice || this.selectedVoice;
        const raw     = await this.tts.generate(text, { voice: voiceId });
        samples       = raw.audio;
        samplingRate  = raw.sampling_rate;
        const dur     = (samples.length / samplingRate).toFixed(1);
        console.log(`[kokoro-gen] ✅ MAIN-THREAD done in ${(performance.now() - t0).toFixed(0)} ms — ${dur}s audio`);
      }

      const wav   = this._float32ToWav(samples, samplingRate);
      const url   = URL.createObjectURL(wav);
      const audio = new Audio(url);
      audio.playbackRate = this._rate;
      console.log(`[kokoro-gen] 🔊 WAV blob ready in ${(performance.now() - t0).toFixed(0)} ms total`);
      return { url, audio };
    }

    /* ──────────────────────────────────────────────────────────────
     *  Playback (always on main thread — manages HTMLAudioElement)
     * ────────────────────────────────────────────────────────────── */

    /**
     * Play pre-generated or on-the-spot audio.
     * @param {string}  text
     * @param {object}  opts
     * @param {object}  [opts.prefetched]  Result of generate()
     * @param {string}  [opts.voice]
     * @param {number}  [opts.rate]
     * @param {function} [opts.onStart]
     * @param {function} [opts.onEnd]
     * @param {function} [opts.onError]
     */
    async speak(text, { prefetched, voice, rate, onStart, onEnd, onError } = {}) {
      if (!this._ready) {
        onError?.({ error: 'not-ready' });
        return;
      }

      this.stop();

      try {
        let url, audio;
        const speakT0 = performance.now();

        if (prefetched) {
          console.log('[kokoro-speak] ♻️ Using PREFETCHED audio');
          url   = prefetched.url;
          audio = prefetched.audio;
          audio.playbackRate = rate ?? this._rate;
        } else {
          console.log('[kokoro-speak] 🐌 No prefetch — generating on-the-spot…');
          const result = await this.generate(text, voice);
          url   = result.url;
          audio = result.audio;
          audio.playbackRate = rate ?? this._rate;
          console.log(`[kokoro-speak] 🐌 On-the-spot took ${(performance.now() - speakT0).toFixed(0)} ms`);
        }

        this.currentAudio = audio;

        audio.addEventListener('play',  () => onStart?.(), { once: true });
        audio.addEventListener('ended', () => { this._revokeURL(url); onEnd?.(); },  { once: true });
        audio.addEventListener('error', (e) => { this._revokeURL(url); onError?.(e); }, { once: true });

        await audio.play();
      } catch (err) {
        console.error('[kokoro] speak() error:', err);
        onError?.({ error: err.message || String(err) });
      }
    }

    pause() {
      if (this.currentAudio && !this.currentAudio.paused) {
        this.currentAudio.pause();
      }
    }

    resume() {
      if (this.currentAudio?.paused) {
        this.currentAudio.play();
      }
    }

    stop() {
      if (this.currentAudio) {
        this.currentAudio.pause();
        if (this.currentAudio.src) URL.revokeObjectURL(this.currentAudio.src);
        this.currentAudio = null;
      }
    }

    /** Revoke all blob URLs in a prefetch cache (Map<index, Promise<{url,audio}>>). */
    flushPrefetch(cache) {
      if (!cache) return;
      for (const [, promise] of cache) {
        promise.then(({ url }) => {
          try { URL.revokeObjectURL(url); } catch { /* noop */ }
        }).catch(() => {});
      }
      cache.clear();
    }

    setRate(r) {
      this._rate = r;
      if (this.currentAudio) this.currentAudio.playbackRate = r;
    }

    setVoice(v) {
      this.selectedVoice = v;
      if (this._worker) this._worker.postMessage({ type: 'set-voice', voice: v });
    }

    /* ---- private helpers ---- */

    _revokeURL(url) {
      try { URL.revokeObjectURL(url); } catch { /* noop */ }
      this.currentAudio = null;
    }

    /**
     * Encode mono Float32 PCM samples into a 16-bit WAV Blob.
     */
    _float32ToWav(samples, sampleRate) {
      const numSamples = samples.length;
      const dataBytes  = numSamples * 2;
      const buffer     = new ArrayBuffer(44 + dataBytes);
      const view       = new DataView(buffer);

      const writeStr = (off, str) => {
        for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
      };

      writeStr(0, 'RIFF');
      view.setUint32(4, 36 + dataBytes, true);
      writeStr(8, 'WAVE');

      writeStr(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20,  1, true);
      view.setUint16(22,  1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);

      writeStr(36, 'data');
      view.setUint32(40, dataBytes, true);

      let off = 44;
      for (let i = 0; i < numSamples; i++, off += 2) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }

      return new Blob([buffer], { type: 'audio/wav' });
    }
  }

  /* ── Expose singleton ──────────────────────────────────────────── */
  window.kokoroBackend = new KokoroBackend();
})();
