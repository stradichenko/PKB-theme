/**
 * Piper TTS Backend — HD Voice module
 * Wraps @diffusionstudio/vits-web (MIT) for lightweight neural TTS in the browser.
 *
 * Architecture: Uses Piper VITS models (~6 M params) via ONNX runtime WASM.
 * 10-50× faster than Kokoro-82M on WASM — generates speech at real-time
 * speed or faster, even without WebGPU.
 *
 * Model files are auto-cached in the browser's Origin Private File System
 * (OPFS) after the first download.  Subsequent page loads reuse the cache.
 *
 * Models: Rhasspy Piper voices (MIT License) — hosted on HuggingFace.
 *
 * CSP requirements (if your site uses a Content-Security-Policy header):
 *   script-src  'self' 'unsafe-inline' 'unsafe-eval'
 *               https://cdnjs.cloudflare.com https://cdn.jsdelivr.net
 *   connect-src 'self' blob:
 *               https://cdn.jsdelivr.net https://cdnjs.cloudflare.com
 *               https://huggingface.co https://*.huggingface.co
 *   media-src   'self' blob:
 *   worker-src  'self' blob:
 */
(() => {
  'use strict';

  /* ── Configuration ─────────────────────────────────────────────── */
  const VITS_CDN = 'https://cdn.jsdelivr.net/npm/@diffusionstudio/vits-web@1.0.3/+esm';

  /* ── Curated English voices ────────────────────────────────────── */
  const VOICES = [
    // US English — Medium quality (~63 MB model)
    { id: 'en_US-hfc_female-medium',  name: 'HFC Female',  accent: 'US', gender: 'F', quality: 'medium' },
    { id: 'en_US-lessac-medium',      name: 'Lessac',      accent: 'US', gender: 'F', quality: 'medium' },
    { id: 'en_US-amy-medium',         name: 'Amy',         accent: 'US', gender: 'F', quality: 'medium' },
    { id: 'en_US-kristin-medium',     name: 'Kristin',     accent: 'US', gender: 'F', quality: 'medium' },
    { id: 'en_US-hfc_male-medium',    name: 'HFC Male',    accent: 'US', gender: 'M', quality: 'medium' },
    { id: 'en_US-joe-medium',         name: 'Joe',         accent: 'US', gender: 'M', quality: 'medium' },
    { id: 'en_US-ryan-medium',        name: 'Ryan',        accent: 'US', gender: 'M', quality: 'medium' },
    // GB English — Medium quality
    { id: 'en_GB-alba-medium',        name: 'Alba',        accent: 'GB', gender: 'F', quality: 'medium' },
    { id: 'en_GB-cori-medium',        name: 'Cori',        accent: 'GB', gender: 'F', quality: 'medium' },
    { id: 'en_GB-jenny_dioco-medium', name: 'Jenny',       accent: 'GB', gender: 'F', quality: 'medium' },
    { id: 'en_GB-alan-medium',        name: 'Alan',        accent: 'GB', gender: 'M', quality: 'medium' },
    { id: 'en_GB-northern_english_male-medium', name: 'Northern', accent: 'GB', gender: 'M', quality: 'medium' },
    // US English — Low quality (faster download, ~18 MB model)
    { id: 'en_US-lessac-low',         name: 'Lessac Lite', accent: 'US', gender: 'F', quality: 'low' },
    { id: 'en_US-amy-low',            name: 'Amy Lite',    accent: 'US', gender: 'F', quality: 'low' },
    { id: 'en_US-danny-low',          name: 'Danny Lite',  accent: 'US', gender: 'M', quality: 'low' },
    { id: 'en_US-ryan-low',           name: 'Ryan Lite',   accent: 'US', gender: 'M', quality: 'low' },
  ];

  const DEFAULT_VOICE = 'en_US-hfc_female-medium';

  /* ── Module loader ─────────────────────────────────────────────── */
  let _vitsModule = null;

  /**
   * Load the vits-web library from CDN.
   * Tries dynamic import() first; falls back to <script type="module"> tag
   * injection (same pattern that worked for the previous kokoro-js backend).
   */
  async function loadVitsModule() {
    if (_vitsModule) return _vitsModule;

    try {
      console.log('[piper] Trying dynamic import()…');
      const m = await import(/* webpackIgnore: true */ VITS_CDN);
      if (m && (m.predict || m.default?.predict)) {
        _vitsModule = m.predict ? m : m.default;
        console.log('[piper] import() succeeded');
        return _vitsModule;
      }
    } catch (importErr) {
      console.warn('[piper] import() failed, trying <script type=module> fallback:', importErr.message);
    }

    // Fallback: inject a module script tag
    return new Promise((resolve, reject) => {
      const nonce = '__piper_' + Date.now();
      const script = document.createElement('script');
      script.type = 'module';
      script.textContent = [
        "import * as mod from '" + VITS_CDN + "';",
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
        if (mod && mod.predict) {
          console.log('[piper] <script type=module> fallback succeeded');
          _vitsModule = mod;
          resolve(mod);
        } else {
          reject(new Error(
            'vits-web predict() not found in fallback module — keys: ' +
            Object.keys(mod || {}).join(', ')
          ));
        }
      }

      window.addEventListener(nonce, onReady, { once: true });
      document.head.appendChild(script);
    });
  }

  /* ── Backend class ─────────────────────────────────────────────── */
  class PiperBackend {
    constructor() {
      /* Model state */
      this._tts           = null;   // vits-web module reference
      this._ready          = false;
      this._loading        = false;
      this._failCount      = 0;
      this._lastError      = null;

      /* Playback state */
      this.currentAudio    = null;
      this.selectedVoice   = DEFAULT_VOICE;
      this._rate           = 1.0;
    }

    /* ---- getters ---- */
    isReady()      { return this._ready; }
    isLoading()    { return this._loading; }
    getVoices()    { return VOICES; }
    getDevice()    { return 'wasm'; }
    usesWorker()   { return false; }
    getLastError() { return this._lastError; }

    /** Reset failure state so the user can retry. */
    resetFailures() { this._failCount = 0; this._lastError = null; }

    /* ──────────────────────────────────────────────────────────────
     *  Lifecycle
     * ────────────────────────────────────────────────────────────── */

    /**
     * Download the library + voice model.
     * The model (~18-63 MB depending on quality) is cached in OPFS
     * after the first download — subsequent inits are near-instant.
     *
     * @param {function} [onProgress] Called with
     *   { status: 'initiate'|'download'|'progress'|'done', progress: 0-100, … }
     */
    async init(onProgress) {
      if (this._ready)   return;
      if (this._loading) return;

      if (this._failCount >= 3) {
        const msg = `Too many failures (${this._failCount}). ` +
                    `Last: ${this._lastError || 'unknown'}. Reload the page to retry.`;
        console.warn('[piper]', msg);
        const err = new Error(msg);
        err._piperDetail = msg;
        throw err;
      }

      this._loading = true;

      try {
        // Step 1 — Load the library from CDN
        onProgress?.({ status: 'initiate', progress: 0 });
        console.log('[piper] Loading vits-web library from CDN…');
        this._tts = await loadVitsModule();
        console.log('[piper] Library loaded ✅');

        // Step 2 — Pre-download voice model (with real progress %)
        onProgress?.({ status: 'download', progress: 5 });
        console.log(`[piper] Downloading voice model: ${this.selectedVoice}…`);

        await this._tts.download(this.selectedVoice, (p) => {
          if (p.total > 0) {
            const pct = Math.round((p.loaded / p.total) * 90) + 5; // 5-95 %
            onProgress?.({ status: 'progress', progress: Math.min(pct, 95), ...p });
          }
        });
        console.log('[piper] Voice model downloaded & cached in OPFS ✅');

        // Step 3 — Warm-up inference (compiles WASM, creates ONNX session)
        onProgress?.({ status: 'progress', progress: 96 });
        console.log('[piper] Warming up inference pipeline…');
        const t0 = performance.now();
        await this._tts.predict({ text: 'Ready.', voiceId: this.selectedVoice });
        console.log(`[piper] Warm-up done in ${(performance.now() - t0).toFixed(0)} ms`);

        onProgress?.({ status: 'done', progress: 100 });
        this._ready = true;
        console.log('[piper] Backend ready ✅');

      } catch (err) {
        this._failCount++;
        this._lastError = err.message || String(err);
        console.error(`[piper] Init failed (attempt ${this._failCount}/3):`, err);
        err._piperDetail = err.message || String(err);
        throw err;
      } finally {
        this._loading = false;
      }
    }

    /* ──────────────────────────────────────────────────────────────
     *  Audio generation
     * ────────────────────────────────────────────────────────────── */

    /**
     * Generate audio for the given text.
     * Returns { url, audio } ready for playback.
     */
    async generate(text, voice) {
      if (!this._ready) throw new Error('not-ready');

      const voiceId = voice || this.selectedVoice;
      const t0      = performance.now();
      const preview = text.length > 60 ? text.slice(0, 60) + '…' : text;
      console.log(`[piper-gen] ⏳ START (${text.length} chars) "${preview}"`);

      const wav   = await this._tts.predict({ text, voiceId });
      const url   = URL.createObjectURL(wav);
      const audio = new Audio(url);
      audio.playbackRate = this._rate;

      console.log(`[piper-gen] ✅ Done in ${(performance.now() - t0).toFixed(0)} ms`);
      return { url, audio };
    }

    /* ──────────────────────────────────────────────────────────────
     *  Playback (manages HTMLAudioElement)
     * ────────────────────────────────────────────────────────────── */

    /**
     * Play pre-generated or on-the-spot audio.
     * @param {string}   text
     * @param {object}   opts
     * @param {object}   [opts.prefetched]  Result of generate()
     * @param {string}   [opts.voice]
     * @param {number}   [opts.rate]
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
          console.log('[piper-speak] ♻️ Using PREFETCHED audio');
          url   = prefetched.url;
          audio = prefetched.audio;
          audio.playbackRate = rate ?? this._rate;
        } else {
          console.log('[piper-speak] 🐌 No prefetch — generating now…');
          const result = await this.generate(text, voice);
          url   = result.url;
          audio = result.audio;
          audio.playbackRate = rate ?? this._rate;
          console.log(`[piper-speak] 🐌 On-the-spot took ${(performance.now() - speakT0).toFixed(0)} ms`);
        }

        this.currentAudio = audio;

        audio.addEventListener('play',  () => onStart?.(), { once: true });
        audio.addEventListener('ended', () => { this._revokeURL(url); onEnd?.(); },  { once: true });
        audio.addEventListener('error', (e) => { this._revokeURL(url); onError?.(e); }, { once: true });

        await audio.play();
      } catch (err) {
        console.error('[piper] speak() error:', err);
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
      // Pre-download the new voice model in the background if not cached
      if (this._tts && this._ready) {
        this._tts.download(v).catch(err => {
          console.warn('[piper] Background download for voice', v, 'failed:', err.message);
        });
      }
    }

    /* ---- private helpers ---- */

    _revokeURL(url) {
      try { URL.revokeObjectURL(url); } catch { /* noop */ }
      this.currentAudio = null;
    }
  }

  /* ── Expose singleton ──────────────────────────────────────────── */
  window.piperBackend = new PiperBackend();
})();
