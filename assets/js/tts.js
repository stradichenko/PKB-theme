/**
 * TTS (Text-to-Speech) Module
 * Provides speech synthesis with text highlighting and speed control
 */

class TTSController {
  constructor() {
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentRate = 1;
    this.currentText = '';
    this.currentPosition = 0;
    this.sentences = [];
    this.currentSentenceIndex = 0;
    this.pausedSentenceIndex = null; // Track which sentence was paused
    this.voice = null;
    this.isNeuralVoiceAvailable = false;
    this.voicesLoaded = false;
    this.voiceLoadingAttempts = 0;
    this.browserOptimizations = this.getBrowserOptimizations();
    
    // Find TTS elements, prioritizing the one in page metadata
    this.button = document.querySelector('.page-metadata #tts-button') || document.getElementById('tts-button');
    this.controlBar = document.getElementById('tts-control-bar');
    this.playPauseBtn = document.getElementById('tts-play-pause');
    this.stopBtn = document.getElementById('tts-stop');
    this.skipBtn = document.getElementById('tts-skip-forward');
    this.closeBtn = document.getElementById('tts-close');
    this.speedSlider = document.getElementById('tts-speed');
    this.speedValue = document.querySelector('.tts-speed-value');
    this.progressFill = document.querySelector('.tts-progress-fill');
    this.progressText = document.querySelector('.tts-progress-text');
    this.overlay = document.getElementById('tts-overlay');
    
    this.init();
  }
  
  init() {
    console.log('TTS Init - Button:', this.button, 'Control Bar:', this.controlBar);
    if (!this.button || !this.controlBar) {
      console.warn('TTS elements not found');
      return;
    }
    
    // Bind event listeners
    this.button.addEventListener('click', (e) => {
      console.log('TTS button clicked');
      // Ensure user gesture for Chrome
      if (this.browserOptimizations.requiresUserGesture) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.toggleTTS();
    });
    this.playPauseBtn?.addEventListener('click', () => this.togglePlayPause());
    this.stopBtn?.addEventListener('click', () => this.stop());
    this.skipBtn?.addEventListener('click', () => this.skipForward());
    this.closeBtn?.addEventListener('click', () => this.closeTTS());
    this.speedSlider?.addEventListener('input', (e) => this.updateSpeed(e.target.value));
    
    // Handle text selection for starting from cursor position
    // document.addEventListener('click', (e) => this.handleTextClick(e));
    
    // Handle speech synthesis events with proper timing for Chrome
    if (this.synth.getVoices().length === 0) {
      this.synth.addEventListener('voiceschanged', () => this.setupVoices());
    } else {
      // Voices already loaded
      this.setupVoices();
    }
    
    // Close control bar when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.controlBar.contains(e.target) && !this.button.contains(e.target)) {
        // Don't close if clicking on content area for reading from position
        if (!e.target.closest('.post-content, .main-content')) {
          // this.closeTTS();
        }
      }
    });
  }
  
  setupVoices() {
    console.log('setupVoices called, voicesLoaded:', this.voicesLoaded, 'attempts:', this.voiceLoadingAttempts);
    
    // Only add listener if not already added
    if (!this.voicesLoaded && this.voiceLoadingAttempts === 0) {
      this.synth.addEventListener('voiceschanged', () => {
        console.log('Voices changed event fired');
        const voices = this.synth.getVoices();
        console.log('Available voices:', voices.length, voices.map(v => v.name));
        if (voices.length > 0) {
          this.selectOptimalVoice(voices);
          this.voicesLoaded = true;
        }
      });
    }
    
    this.voiceLoadingAttempts++;
    
    // Also call immediately in case voices are already loaded
    const voices = this.synth.getVoices();
    console.log('Initial voices check:', voices.length, voices.map(v => v.name));
    if (voices.length > 0) {
      this.selectOptimalVoice(voices);
      this.voicesLoaded = true;
    } else if (this.voiceLoadingAttempts < 3) {
      // Force trigger voices loading in Chrome with multiple strategies
      console.log('No voices found initially, triggering voice load...');
      
      // Strategy 1: Empty utterance
      const utterance = new SpeechSynthesisUtterance('');
      this.synth.speak(utterance);
      this.synth.cancel();
      
      // Strategy 2: Try after short delay
      setTimeout(() => {
        const delayedVoices = this.synth.getVoices();
        console.log('Delayed voices check:', delayedVoices.length);
        if (delayedVoices.length > 0 && !this.voicesLoaded) {
          this.selectOptimalVoice(delayedVoices);
          this.voicesLoaded = true;
        }
      }, 100);
      
      // Strategy 3: Longer delay for slow loading
      setTimeout(() => {
        if (!this.voicesLoaded) {
          const laterVoices = this.synth.getVoices();
          console.log('Later voices check:', laterVoices.length);
          if (laterVoices.length > 0) {
            this.selectOptimalVoice(laterVoices);
            this.voicesLoaded = true;
          }
        }
      }, 500);
    }
  }
  
  selectOptimalVoice(voices) {
    // Neural voice indicators (partial list)
    const neuralIndicators = [
      'neural', 'premium', 'enhanced', 'wavenet', 
      'natural', 'journey', 'alloy', 'echo', 'fable'
    ];
    
    // High-quality voice names to prioritize
    const highQualityVoices = [
      'Google US English', 'Google UK English', 'Microsoft Zira',
      'Microsoft David', 'Alex', 'Samantha', 'Karen', 'Daniel'
    ];
    
    // Selection priority hierarchy
    this.voice = 
      // 1. Neural/Premium voices (Chrome online)
      voices.find(v => 
        v.lang.startsWith('en') && 
        neuralIndicators.some(indicator => 
          v.name.toLowerCase().includes(indicator)
        )
      ) ||
      
      // 2. High-quality named voices
      voices.find(v => 
        v.lang.startsWith('en') && 
        highQualityVoices.some(name => v.name.includes(name))
      ) ||
      
      // 3. Google voices (Chrome)
      voices.find(v => 
        v.lang.startsWith('en') && 
        v.name.includes('Google')
      ) ||
      
      // 4. Microsoft voices (Windows/Edge)
      voices.find(v => 
        v.lang.startsWith('en') && 
        v.name.includes('Microsoft')
      ) ||
      
      // 5. System default English
      voices.find(v => v.lang.startsWith('en') && v.default) ||
      
      // 6. Any English voice
      voices.find(v => v.lang.startsWith('en')) ||
      
      // 7. Fallback to first available
      voices[0];
    
    // Check if we got a neural voice
    this.isNeuralVoiceAvailable = this.voice && 
      neuralIndicators.some(indicator => 
        this.voice.name.toLowerCase().includes(indicator)
      );
    
    console.log(`Selected voice: ${this.voice?.name}, Neural: ${this.isNeuralVoiceAvailable}`);
    console.log(`Voice quality: ${this.getVoiceQuality()}`);
  }
  
  toggleTTS() {
    console.log('Toggle TTS called, control bar active:', this.controlBar.classList.contains('active'));
    if (!this.controlBar.classList.contains('active')) {
      this.openTTS();
    } else {
      this.closeTTS();
    }
  }
  
  openTTS() {
    console.log('Opening TTS');
    this.button.classList.add('active');
    this.controlBar.classList.add('active');
    this.prepareText();
    this.updateProgressText('Ready to speak');
    
    // Automatically start playing when TTS is opened
    setTimeout(() => {
      this.play();
    }, 100); // Small delay to ensure everything is initialized
  }
  
  closeTTS() {
    console.log('Closing TTS');
    this.button.classList.remove('active');
    this.controlBar.classList.remove('active');
    this.stop();
    this.clearHighlights();
  }
  
  prepareText() {
    // Get post title from metadata and content
    const metadataTitleElement = document.querySelector('.page-metadata .post-title, .page-metadata h1');
    const contentTitleElement = document.querySelector('.post-content .post-title, .post-content h1');
    const contentElement = document.querySelector('.post-content');
    
    if (!metadataTitleElement && !contentTitleElement && !contentElement) {
      console.warn('No post title or content found');
      return;
    }
    
    let fullText = '';
    
    // Add title from metadata first, then from content if metadata title doesn't exist
    const titleElement = metadataTitleElement || contentTitleElement;
    if (titleElement) {
      const titleText = titleElement.textContent || titleElement.innerText || '';
      fullText += titleText.trim() + '. '; // Add period and space after title
    }
    
    // Add content if it exists
    if (contentElement) {
      const contentText = this.extractTextContent(contentElement);
      fullText += contentText;
    }
    
    this.currentText = fullText;
    this.sentences = this.splitIntoSentences(this.currentText);
    this.currentSentenceIndex = 0;
    
    console.log('Prepared text length:', this.currentText.length, 'Sentences:', this.sentences.length);
  }
  
  extractTextContent(element) {
    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true);
    
    // Remove unwanted elements from the clone
    const unwantedElements = clone.querySelectorAll(`
      script, style, 
      .tts-control-bar, .tts-overlay,
      .page-metadata, .post-header,
      .site-title, .logo,
      .sidenote, .marginnote,
      .sidenote-ref, .citation-ref,
      .citation-text, .citation,
      .footnote, .reference,
      nav, .toc, .table-of-contents,
      .comments, .comment-section,
      .social-share, .share-buttons,
      .tag-list, .category-list,
      .author-bio, .related-posts,
      .navigation, .pagination,
      .sidebar, aside:not(.sidenote-section),
      img, figure, .image-caption,
      pre, .code-block, .highlight,
      .math, .katex, .mathjax,
      .table-wrapper, table,
      .video, iframe, video, audio,
      .download-link, .pdf-button, .tts-button,
      .edit-link, .github-link,
      .breadcrumb, .post-nav
    `);
    
    unwantedElements.forEach(el => el.remove());
    
    // Process headings and line breaks to add pauses
    this.addPausesToStructuralElements(clone);
    
    // Get clean text content (this will preserve inline code)
    return clone.textContent || clone.innerText || '';
  }
  
  splitIntoSentences(text) {
    // Improved sentence splitting - handles more edge cases and pauses
    const sentences = text.match(/[^\.!?]*[\.!?]+/g) || [];
    
    // If no sentences found with punctuation, split by line breaks or return full text
    if (sentences.length === 0) {
      const lines = text.split(/\n+/).filter(line => line.trim().length > 0);
      return lines.length > 0 ? lines : [text];
    }
    
    // Clean up sentences and filter out very short ones
    const cleanSentences = sentences
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 3);
    
    console.log('Split into sentences:', cleanSentences.length);
    console.log('First 3 sentences:', cleanSentences.slice(0, 3));
    
    return cleanSentences.length > 0 ? cleanSentences : [text];
  }
  
  // Add pause markers after headings and line breaks
  addPausesToStructuralElements(element) {
    // Add pause markers after headings
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
      const pauseMarker = document.createTextNode(' [HEADING_PAUSE] ');
      if (heading.nextSibling) {
        heading.parentNode.insertBefore(pauseMarker, heading.nextSibling);
      } else {
        heading.parentNode.appendChild(pauseMarker);
      }
    });
    
    // Add pause markers after paragraphs and div elements
    const blocks = element.querySelectorAll('p, div, li, blockquote');
    blocks.forEach(block => {
      const pauseMarker = document.createTextNode(' [LINE_PAUSE] ');
      if (block.nextSibling) {
        block.parentNode.insertBefore(pauseMarker, block.nextSibling);
      } else {
        block.parentNode.appendChild(pauseMarker);
      }
    });
    
    // Add pause markers after line breaks
    const lineBreaks = element.querySelectorAll('br');
    lineBreaks.forEach(br => {
      const pauseMarker = document.createTextNode(' [LINE_PAUSE] ');
      if (br.nextSibling) {
        br.parentNode.insertBefore(pauseMarker, br.nextSibling);
      } else {
        br.parentNode.appendChild(pauseMarker);
      }
    });
  }
  
  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }
  
  play() {
    console.log('Play called - Voice available:', !!this.voice, 'Voice name:', this.voice?.name);
    
    // PRIORITY 1: Check for user-selected text first (overrides everything)
    const selectedText = this.getSelectedText();
    if (selectedText) {
      console.log('User text selected, starting from selection:', selectedText.substring(0, 50) + '...');
      // Clear paused state since we're starting from a new position
      this.isPaused = false;
      this.pausedSentenceIndex = null;
      this.startFromSelectedText(selectedText);
      return;
    }
    
    // PRIORITY 2: Handle resume/restart logic only if no text is selected
    console.log('No text selected, using resume/restart logic');
    console.log('Current state - isPaused:', this.isPaused, 'pausedSentenceIndex:', this.pausedSentenceIndex);
    
    // Force voice loading on user interaction (critical for Chrome)
    this.forceVoiceLoading().then(() => {
      if (this.voice) {
        console.log('Voice loaded successfully, starting playback');
        this.playAfterVoiceSetup();
      } else {
        console.warn('No voice available after forced loading');
        this.updateProgressText('Loading voices...');
        
        // Last resort: try again with longer delay
        setTimeout(() => {
          const voices = this.synth.getVoices();
          console.log('Final voice check:', voices.length);
          if (voices.length > 0) {
            this.voice = voices[0];
            console.log(`Using emergency voice: ${this.voice.name}`);
            this.playAfterVoiceSetup();
          } else {
            this.updateProgressText('Voice not available in this browser');
          }
        }, 1000);
      }
    });
  }
  
  // Get currently selected text
  getSelectedText() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const selectedText = selection.toString().trim();
      if (selectedText.length > 0) {
        return selectedText;
      }
    }
    return null;
  }
  
  // Start reading from user-selected text
  startFromSelectedText(selectedText) {
    console.log('Starting TTS from selected text');
    console.log('Selected text:', selectedText);
    console.log('Total sentences:', this.sentences.length);
    
    // Try multiple matching strategies to find the sentence
    let matchingSentenceIndex = -1;
    
    // Strategy 1: Look for exact substring match
    matchingSentenceIndex = this.sentences.findIndex(sentence => 
      sentence.toLowerCase().includes(selectedText.toLowerCase())
    );
    
    if (matchingSentenceIndex === -1) {
      // Strategy 2: Look for partial match with first 30 characters
      const searchText = selectedText.substring(0, 30).toLowerCase();
      matchingSentenceIndex = this.sentences.findIndex(sentence => 
        sentence.toLowerCase().includes(searchText)
      );
    }
    
    if (matchingSentenceIndex === -1) {
      // Strategy 3: Look for match with cleaned text (remove punctuation)
      const cleanSelectedText = selectedText.replace(/[^\w\s]/g, '').toLowerCase();
      matchingSentenceIndex = this.sentences.findIndex(sentence => {
        const cleanSentence = sentence.replace(/[^\w\s]/g, '').toLowerCase();
        return cleanSentence.includes(cleanSelectedText.substring(0, 30));
      });
    }
    
    if (matchingSentenceIndex === -1) {
      // Strategy 4: Word-by-word matching
      const selectedWords = selectedText.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      if (selectedWords.length > 0) {
        matchingSentenceIndex = this.sentences.findIndex(sentence => {
          const sentenceLower = sentence.toLowerCase();
          return selectedWords.some(word => sentenceLower.includes(word));
        });
      }
    }
    
    if (matchingSentenceIndex !== -1) {
      console.log(`Found matching sentence at index: ${matchingSentenceIndex}`);
      console.log(`Matching sentence: "${this.sentences[matchingSentenceIndex].substring(0, 100)}..."`);
      this.currentSentenceIndex = matchingSentenceIndex;
    } else {
      console.log('Selected text not found in any sentence, starting from beginning');
      console.log('First few sentences for debugging:');
      this.sentences.slice(0, 3).forEach((sentence, index) => {
        console.log(`Sentence ${index}: "${sentence.substring(0, 100)}..."`);
      });
      this.currentSentenceIndex = 0;
    }
    
    // Clear the selection after use
    window.getSelection().removeAllRanges();
    
    // Force voice loading and start speaking
    this.forceVoiceLoading().then(() => {
      if (this.voice) {
        this.playAfterVoiceSetup();
      } else {
        // Fallback handling
        setTimeout(() => {
          const voices = this.synth.getVoices();
          if (voices.length > 0) {
            this.voice = voices[0];
            this.playAfterVoiceSetup();
          } else {
            this.updateProgressText('Voice not available in this browser');
          }
        }, 1000);
      }
    });
  }
  
  async forceVoiceLoading() {
    console.log('Force voice loading started');
    
    // If voices already loaded, return immediately
    if (this.voice && this.voicesLoaded) {
      console.log('Voices already loaded');
      return;
    }
    
    // Multiple strategies to force voice loading
    return new Promise((resolve) => {
      let resolved = false;
      const resolveOnce = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };
      
      // Strategy 1: Direct check
      const directVoices = this.synth.getVoices();
      if (directVoices.length > 0) {
        console.log('Direct voices found:', directVoices.length);
        this.selectOptimalVoice(directVoices);
        this.voicesLoaded = true;
        resolveOnce();
        return;
      }
      
      // Strategy 2: Trigger loading with user interaction
      console.log('Triggering voice loading with user interaction');
      const triggerUtterance = new SpeechSynthesisUtterance(' ');
      triggerUtterance.volume = 0;
      
      triggerUtterance.onstart = () => {
        console.log('Trigger utterance started');
        this.synth.cancel();
      };
      
      this.synth.speak(triggerUtterance);
      this.synth.cancel();
      
      // Strategy 3: Wait for voices changed event
      const voicesChangedHandler = () => {
        console.log('Voices changed during force loading');
        const voices = this.synth.getVoices();
        if (voices.length > 0) {
          this.selectOptimalVoice(voices);
          this.voicesLoaded = true;
          this.synth.removeEventListener('voiceschanged', voicesChangedHandler);
          resolveOnce();
        }
      };
      
      this.synth.addEventListener('voiceschanged', voicesChangedHandler);
      
      // Strategy 4: Periodic checking
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        const voices = this.synth.getVoices();
        console.log(`Voice check attempt ${attempts}:`, voices.length);
        
        if (voices.length > 0) {
          this.selectOptimalVoice(voices);
          this.voicesLoaded = true;
          clearInterval(checkInterval);
          this.synth.removeEventListener('voiceschanged', voicesChangedHandler);
          resolveOnce();
        } else if (attempts >= 10) {
          console.warn('Max voice loading attempts reached');
          clearInterval(checkInterval);
          this.synth.removeEventListener('voiceschanged', voicesChangedHandler);
          resolveOnce();
        }
      }, 100);
      
      // Timeout after 3 seconds
      setTimeout(() => {
        console.warn('Voice loading timeout');
        clearInterval(checkInterval);
        this.synth.removeEventListener('voiceschanged', voicesChangedHandler);
        resolveOnce();
      }, 3000);
    });
  }
  
  playAfterVoiceSetup() {
    if (this.isPaused && this.pausedSentenceIndex !== null) {
      // Resume from paused state - restart from the paused sentence
      this.currentSentenceIndex = this.pausedSentenceIndex;
      this.isPaused = false;
      this.pausedSentenceIndex = null;
    }
    // Always start speaking from currentSentenceIndex (whether resuming or starting fresh)
    this.startSpeaking();
    this.updatePlayPauseButton(true);
    this.updateProgressText('Speaking...');
  }
  
  pause() {
    // Store the current sentence index for proper resume
    this.pausedSentenceIndex = this.currentSentenceIndex;
    
    // Immediate cancellation for better responsiveness
    this.synth.cancel();
    this.isPlaying = false;
    this.isPaused = true;
    this.updatePlayPauseButton(false);
    this.updateProgressText('Paused');
    
    // Clear any pending timeouts to prevent unwanted continuation
    if (this.continuationTimeout) {
      clearTimeout(this.continuationTimeout);
      this.continuationTimeout = null;
    }
  }
  
  stop() {
    this.synth.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.currentSentenceIndex = 0;
    this.pausedSentenceIndex = null; // Clear paused position completely
    this.updatePlayPauseButton(false);
    this.updateProgressText('Stopped');
    this.updateProgress(0);
    this.clearHighlights();
    
    // Clear any pending timeouts
    if (this.continuationTimeout) {
      clearTimeout(this.continuationTimeout);
      this.continuationTimeout = null;
    }
  }
  
  skipForward() {
    if (this.currentSentenceIndex < this.sentences.length - 1) {
      this.currentSentenceIndex++;
      if (this.isPlaying) {
        this.synth.cancel();
        this.startSpeaking();
      }
    }
  }
  
  startSpeaking() {
    if (this.currentSentenceIndex >= this.sentences.length) {
      this.stop();
      this.updateProgressText('Finished');
      return;
    }
    
    const sentence = this.sentences[this.currentSentenceIndex];
    let cleanSentence = sentence.trim();
    
    // Skip empty sentences
    if (!cleanSentence) {
      this.currentSentenceIndex++;
      this.startSpeaking();
      return;
    }
    
    // Check for pause markers and handle them
    let pauseDuration = 0;
    if (cleanSentence.includes('[HEADING_PAUSE]')) {
      cleanSentence = cleanSentence.replace(/\[HEADING_PAUSE\]/g, '');
      pauseDuration = 1200; // 1200ms pause after headings (increased from 800ms)
    } else if (cleanSentence.includes('[LINE_PAUSE]')) {
      cleanSentence = cleanSentence.replace(/\[LINE_PAUSE\]/g, '');
      pauseDuration = 1100; // 1100ms pause after paragraphs/line breaks (increased from 900ms)
    }
    
    cleanSentence = cleanSentence.trim();
    
    // If sentence is empty after removing pause markers, skip it
    if (!cleanSentence) {
      this.currentSentenceIndex++;
      if (pauseDuration > 0) {
        // Add pause before next sentence
        setTimeout(() => {
          if (this.isPlaying) {
            this.startSpeaking();
          }
        }, pauseDuration);
      } else {
        this.startSpeaking();
      }
      return;
    }
    
    this.utterance = new SpeechSynthesisUtterance(cleanSentence);
    
    // Set voice with optimal settings - validate voice is available
    if (this.voice && this.voice.name) {
      // Double-check voice is still available
      const availableVoices = this.synth.getVoices();
      const voiceStillExists = availableVoices.find(v => v.name === this.voice.name);
      
      if (voiceStillExists) {
        this.utterance.voice = this.voice;
      } else {
        console.log('Primary voice no longer available, re-selecting...');
        this.selectOptimalVoice(availableVoices);
        if (this.voice) {
          this.utterance.voice = this.voice;
        }
      }
    } else {
      // No voice selected, try to select one now
      console.log('No voice selected, attempting to select one...');
      const voices = this.synth.getVoices();
      this.selectOptimalVoice(voices);
      if (this.voice) {
        this.utterance.voice = this.voice;
      }
    }
    
    // Optimize settings based on voice quality and browser for natural sound
    if (this.isNeuralVoiceAvailable) {
      // Neural voices: use settings optimized for naturalness
      this.utterance.rate = Math.max(0.1, Math.min(2.0, this.currentRate * 0.95)); // Faster
      this.utterance.pitch = 0.9; // Lower pitch for less robotic sound
    } else {
      // System voices: more aggressive adjustments for better naturalness
      this.utterance.rate = Math.max(0.1, Math.min(2.0, this.currentRate * 0.85)); // Faster
      this.utterance.pitch = 0.8; // Lower pitch for warmer sound
    }
    
    // Browser-specific optimizations for naturalness
    if (this.browserOptimizations.limitedPitchControl) {
      this.utterance.pitch = 0.95; // Safari: slight pitch reduction within limits
      this.utterance.rate = Math.max(0.1, Math.min(2.0, this.currentRate * 0.9)); // Faster rate for Safari
    }
    
    // Set volume (Chrome sometimes has issues with this)
    this.utterance.volume = 1.0;
    
    // Event handlers with Chrome-specific fixes
    this.utterance.onstart = () => {
      this.isPlaying = true;
      this.highlightCurrentSentence();
    };
    
    this.utterance.onend = () => {
      this.currentSentenceIndex++;
      this.updateProgress((this.currentSentenceIndex / this.sentences.length) * 100);
      
      if (this.currentSentenceIndex < this.sentences.length) {
        // Add pause if needed, then continue to next sentence
        const delay = pauseDuration > 0 ? pauseDuration + 150 : 150; // Chrome stability delay + pause (increased from 100ms)
        this.continuationTimeout = setTimeout(() => {
          if (this.isPlaying) {
            this.startSpeaking();
          }
        }, delay);
      } else {
        // Finished all sentences
        this.stop();
        this.updateProgressText('Finished');
      }
    };
    
    this.utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error, 'Voice:', this.voice?.name);
      
      // Handle different Chrome error types
      if (event.error === 'synthesis-failed' || event.error === 'voice-unavailable') {
        console.log('Attempting fallback voice...');
        this.fallbackToSystemVoice(cleanSentence);
      } else if (event.error === 'interrupted') {
        // User stopped or interrupted - this is normal
        console.log('Speech interrupted by user');
      } else {
        // Other errors - try to continue with next sentence
        console.log('Skipping sentence due to error, continuing...');
        this.currentSentenceIndex++;
        if (this.currentSentenceIndex < this.sentences.length) {
          setTimeout(() => {
            if (this.isPlaying) {
              this.startSpeaking();
            }
          }, 100);
        } else {
          this.stop();
          this.updateProgressText('Completed with errors');
        }
      }
    };
    
    // Chrome-specific: Ensure synthesis is not busy before speaking
    if (this.synth.speaking) {
      this.synth.cancel();
      setTimeout(() => {
        // Final validation before speaking
        if (!this.utterance.voice) {
          console.error('No voice available for utterance, attempting fallback...');
          this.fallbackToSystemVoice(cleanSentence);
        } else {
          this.synth.speak(this.utterance);
        }
      }, 50);
    } else {
      // Final validation before speaking
      if (!this.utterance.voice) {
        console.error('No voice available for utterance, attempting fallback...');
        this.fallbackToSystemVoice(cleanSentence);
      } else {
        this.synth.speak(this.utterance);
      }
    }
  }
  
  updateSpeed(value) {
    this.currentRate = parseFloat(value);
    this.speedValue.textContent = `${value}x`;
    
    // If currently speaking, update the rate
    if (this.utterance) {
      this.utterance.rate = this.currentRate;
    }
  }
  
  updatePlayPauseButton(isPlaying) {
    const playIcon = this.playPauseBtn.querySelector('.tts-play-icon');
    const pauseIcon = this.playPauseBtn.querySelector('.tts-pause-icon');
    
    if (isPlaying) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      this.playPauseBtn.title = 'Pause';
    } else {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      this.playPauseBtn.title = 'Play';
    }
  }
  
  updateProgress(percentage) {
    this.progressFill.style.width = `${percentage}%`;
  }
  
  updateProgressText(text) {
    this.progressText.textContent = text;
  }
  
  highlightCurrentSentence() {
    this.clearHighlights();
    
    // Find and highlight the current sentence in the title, headings, or content
    const titleElement = document.querySelector('.post-title, h1');
    const contentElement = document.querySelector('.post-content');
    
    if (!this.sentences[this.currentSentenceIndex]) return;
    
    const sentence = this.sentences[this.currentSentenceIndex].trim();
    
    // Try to highlight in title first, then headings, then content
    let highlighted = false;
    
    if (titleElement) {
      highlighted = this.highlightTextInElement(titleElement, sentence);
    }
    
    // If not found in title, try headings in content
    if (!highlighted && contentElement) {
      const headings = contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
      for (const heading of headings) {
        highlighted = this.highlightTextInElement(heading, sentence);
        if (highlighted) break;
      }
    }
    
    // If not found in headings, try all content
    if (!highlighted && contentElement) {
      this.highlightTextInElement(contentElement, sentence);
    }
  }
  
  highlightTextInElement(element, targetText) {
    // Simple text highlighting - can be improved for better accuracy
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent;
      if (text.includes(targetText.substring(0, 50))) { // Match first 50 chars
        const parent = node.parentNode;
        if (parent && !parent.classList.contains('tts-highlight')) {
          parent.classList.add('tts-current-sentence');
          // Scroll to highlighted text
          parent.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return true; // Successfully highlighted
        }
      }
    }
    return false; // Not found/highlighted
  }
  
  clearHighlights() {
    document.querySelectorAll('.tts-highlight, .tts-current-sentence').forEach(el => {
      el.classList.remove('tts-highlight', 'tts-current-sentence');
    });
  }
  
  handleTextClick(event) {
    // Only handle clicks when TTS is active
    if (!this.controlBar.classList.contains('active')) return;
    
    // Check if clicked element is within title or content area
    const titleElement = document.querySelector('.post-title, h1');
    const contentElement = document.querySelector('.post-content');
    
    const isInTitle = titleElement && titleElement.contains(event.target);
    const isInContent = contentElement && contentElement.contains(event.target);
    
    if (!isInTitle && !isInContent) return;
    
    // Find the clicked sentence and start reading from there
    const clickedText = this.getClickedSentence(event.target);
    if (clickedText) {
      const sentenceIndex = this.sentences.findIndex(sentence => 
        sentence.trim().includes(clickedText.substring(0, 50))
      );
      
      if (sentenceIndex !== -1) {
        this.currentSentenceIndex = sentenceIndex;
        if (this.isPlaying) {
          this.synth.cancel();
          this.startSpeaking();
        }
      }
    }
  }
  
  getClickedSentence(element) {
    // Get the text content of the clicked element or its parent paragraph
    let textElement = element;
    while (textElement && textElement.tagName !== 'P' && textElement.tagName !== 'DIV') {
      textElement = textElement.parentNode;
    }
    
    return textElement ? textElement.textContent : '';
  }
  
  // Voice quality assessment
  getVoiceQuality() {
    if (!this.voice) return 'unavailable';
    
    if (this.isNeuralVoiceAvailable) return 'neural';
    if (this.voice.name.includes('Google')) return 'cloud';
    if (this.voice.name.includes('Microsoft')) return 'system-premium';
    if (this.voice.name.includes('Alex') || this.voice.name.includes('Samantha')) return 'system-high';
    
    return 'system-basic';
  }
  
  // Browser-specific optimizations
  getBrowserOptimizations() {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) {
      return {
        preferGoogleVoices: true,
        requiresUserGesture: true,
        supportsBackgroundPlayback: true,
        limitedPitchControl: false
      };
    } else if (userAgent.includes('Firefox')) {
      return {
        preferSystemVoices: true,
        requiresUserGesture: false,
        supportsBackgroundPlayback: false,
        limitedPitchControl: false
      };
    } else if (userAgent.includes('Safari')) {
      return {
        preferSystemVoices: true,
        requiresUserGesture: true,
        supportsBackgroundPlayback: false,
        limitedPitchControl: true
      };
    }
    
    return {
      preferSystemVoices: true,
      requiresUserGesture: true,
      supportsBackgroundPlayback: false,
      limitedPitchControl: false
    };
  }
  
  // Fallback to system voice when primary voice fails
  fallbackToSystemVoice(text) {
    console.log('Attempting fallback to system voice...');
    const voices = this.synth.getVoices();
    console.log('Voices available for fallback:', voices.length, voices.map(v => `${v.name} (${v.lang})`));
    
    // If still no voices, this might be a Chrome-specific issue
    if (voices.length === 0) {
      console.log('No voices detected - checking if this is Chrome with voice access issues');
      if (navigator.userAgent.includes('Chrome')) {
        console.log('Chrome detected with no voices - attempting alternative approach');
        this.handleChromeVoiceIssue(text);
        return;
      }
    }
    
    // Try different fallback strategies with more detailed logging
    let systemVoice = voices.find(v => v.default);
    console.log('Default voice:', systemVoice?.name);
    
    if (!systemVoice) {
      systemVoice = voices.find(v => v.lang.startsWith('en') && v.localService !== false);
      console.log('English local voice:', systemVoice?.name);
    }
    
    if (!systemVoice) {
      systemVoice = voices.find(v => v.lang.startsWith('en'));
      console.log('Any English voice:', systemVoice?.name);
    }
    
    if (!systemVoice) {
      systemVoice = voices[0];
      console.log('First available voice:', systemVoice?.name);
    }
    
    if (systemVoice) {
      console.log(`Using fallback voice: ${systemVoice.name} (${systemVoice.lang})`);
      
      // Create new utterance with safer settings
      const fallbackUtterance = new SpeechSynthesisUtterance(text);
      fallbackUtterance.voice = systemVoice;
      fallbackUtterance.rate = Math.max(0.6, Math.min(1.5, this.currentRate * 0.8)); // Faster
      fallbackUtterance.pitch = 0.75; // Lower pitch for warmth
      fallbackUtterance.volume = 1.0;
      
      // Re-attach event handlers for fallback utterance
      fallbackUtterance.onstart = () => {
        this.isPlaying = true;
        this.highlightCurrentSentence();
      };
      
      fallbackUtterance.onend = () => {
        this.currentSentenceIndex++;
        this.updateProgress((this.currentSentenceIndex / this.sentences.length) * 100);
        
        if (this.currentSentenceIndex < this.sentences.length) {
          setTimeout(() => {
            if (this.isPlaying) {
              this.startSpeaking();
            }
          }, 100);
        } else {
          this.stop();
          this.updateProgressText('Finished');
        }
      };
      
      fallbackUtterance.onerror = (event) => {
        console.error('Fallback voice also failed:', event.error);
        // Skip this sentence and continue
        this.currentSentenceIndex++;
        if (this.currentSentenceIndex < this.sentences.length) {
          setTimeout(() => {
            if (this.isPlaying) {
              this.startSpeaking();
            }
          }, 100);
        } else {
          this.stop();
          this.updateProgressText('Completed with errors');
        }
      };
      
      // Ensure synthesis is ready before speaking
      if (this.synth.speaking) {
        this.synth.cancel();
      }
      
      setTimeout(() => {
        this.synth.speak(fallbackUtterance);
      }, 100);
    } else {
      console.error('No suitable fallback voice found - no voices available at all');
      this.handleChromeVoiceIssue(text);
    }
  }
  
  // Handle Chrome-specific voice issues
  handleChromeVoiceIssue(text) {
    console.log('Handling Chrome voice access issue');
    
    // Try speaking without specifying a voice (let browser choose)
    const basicUtterance = new SpeechSynthesisUtterance(text);
    // Don't set voice - let Chrome use default
    basicUtterance.rate = 0.85; // Higher rate for better pace
    basicUtterance.pitch = 0.7; // Lower pitch for less robotic sound
    basicUtterance.volume = 1.0;
    
    basicUtterance.onstart = () => {
      console.log('Basic utterance started successfully');
      this.isPlaying = true;
      this.highlightCurrentSentence();
    };
    
    basicUtterance.onend = () => {
      console.log('Basic utterance ended');
      this.currentSentenceIndex++;
      this.updateProgress((this.currentSentenceIndex / this.sentences.length) * 100);
      
      if (this.currentSentenceIndex < this.sentences.length) {
        setTimeout(() => {
          if (this.isPlaying) {
            this.startSpeaking();
          }
        }, 100);
      } else {
        this.stop();
        this.updateProgressText('Finished');
      }
    };
    
    basicUtterance.onerror = (event) => {
      console.error('Basic utterance also failed:', event.error);
      // Skip this sentence and continue
      this.currentSentenceIndex++;
      if (this.currentSentenceIndex < this.sentences.length) {
        setTimeout(() => {
          if (this.isPlaying) {
            this.startSpeaking();
          }
        }, 100);
      } else {
        this.stop();
        this.updateProgressText('Browser TTS not available');
      }
    };
    
    console.log('Attempting to speak with basic utterance (no voice specified)');
    this.synth.speak(basicUtterance);
  }
}

// Initialize TTS when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing TTS...');
  
  // Wait a bit to ensure all resources are loaded
  setTimeout(() => {
    const ttsController = new TTSController();
    console.log('TTS Controller created:', ttsController);
    
    // Test if elements exist
    const button = document.querySelector('.page-metadata #tts-button') || document.getElementById('tts-button');
    const controlBar = document.getElementById('tts-control-bar');
    console.log('TTS Button found:', button);
    console.log('TTS Control Bar found:', controlBar);
  }, 100);
});

// Handle page navigation
window.addEventListener('beforeunload', () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
});