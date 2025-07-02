(function() {
  'use strict';
  
  const DEBUG = true;
  
  const CONFIG = {
    selectors: {
      button: 'pdf-generate-btn'
    }
  };

  // Prevent multiple instances
  if (window.PDFGeneratorInstance) {
    if (DEBUG) console.log('PDF Generator: Instance already exists');
    return;
  }

  class PDFGenerator {
    constructor() {
      this.button = null;
      this.initialized = false;
      this.isProcessing = false;
      this.boundHandleClick = null;
      this.boundHandleKeydown = null;
      this.init();
    }

    init() {
      if (this.initialized) return;

      setTimeout(() => {
        this.findButton();
        if (!this.button) {
          if (DEBUG) console.warn('PDF button not found:', CONFIG.selectors.button);
          return;
        }

        this.bindEvents();
        this.initialized = true;
        if (DEBUG) console.log('PDF generator initialized');
      }, 100);
    }

    findButton() {
      this.button = document.getElementById(CONFIG.selectors.button);
    }

    bindEvents() {
      // Remove any existing listeners first
      this.unbindEvents();
      
      // Create bound functions to enable proper removal
      this.boundHandleClick = this.handleClick.bind(this);
      this.boundHandleKeydown = this.handleKeydown.bind(this);
      
      this.button.addEventListener('click', this.boundHandleClick);
      this.button.addEventListener('keydown', this.boundHandleKeydown);
      
      if (DEBUG) console.log('PDF generator events bound');
    }
    
    unbindEvents() {
      if (this.button && this.boundHandleClick) {
        this.button.removeEventListener('click', this.boundHandleClick);
        this.button.removeEventListener('keydown', this.boundHandleKeydown);
        if (DEBUG) console.log('PDF generator events unbound');
      }
    }
    
    handleKeydown(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleClick(e);
      }
    }

    handleClick(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      if (DEBUG) console.log('PDF button clicked, processing:', this.isProcessing);
      
      // Prevent multiple simultaneous calls
      if (this.isProcessing || this.button.disabled) {
        if (DEBUG) console.log('PDF generation already in progress, ignoring click');
        return;
      }
      
      this.isProcessing = true;
      
      // Debounce mechanism - prevent rapid clicks
      setTimeout(() => {
        try {
          if (DEBUG) console.log('Triggering print dialog');
          window.print();
        } catch (error) {
          console.error('Error triggering print:', error);
        } finally {
          // Reset processing state after a short delay
          setTimeout(() => {
            this.isProcessing = false;
            if (DEBUG) console.log('PDF processing state reset');
          }, 1000);
        }
      }, 50);
    }

    showLoading() {
      this.button.disabled = true;
      const loadingSpan = this.button.querySelector('.pdf-loading');
      const svg = this.button.querySelector('svg:not(.pdf-loading svg)');
      
      if (svg) svg.style.display = 'none';
      if (loadingSpan) loadingSpan.style.display = 'inline-block';
      
      this.button.setAttribute('aria-label', 'Preparing PDF...');
    }

    hideLoading() {
      // Immediate return to normal state
      this.button.disabled = false;
      const loadingSpan = this.button.querySelector('.pdf-loading');
      const svg = this.button.querySelector('svg:not(.pdf-loading svg)');
      
      if (svg) svg.style.display = 'inline-block';
      if (loadingSpan) loadingSpan.style.display = 'none';
      
      this.button.setAttribute('aria-label', 'Generate PDF from current page');
    }
    
    destroy() {
      this.unbindEvents();
      this.button = null;
      this.initialized = false;
      this.isProcessing = false;
      if (DEBUG) console.log('PDF generator destroyed');
    }
  }

  function init() {
    try {
      // Clean up any existing instance
      if (window.PDFGeneratorInstance && typeof window.PDFGeneratorInstance.destroy === 'function') {
        window.PDFGeneratorInstance.destroy();
      }
      
      window.PDFGeneratorInstance = new PDFGenerator();
    } catch (error) {
      console.error('PDF Generator initialization failed:', error);
    }
  }

  // Use a flag to prevent multiple DOMContentLoaded bindings
  if (!window.PDFGeneratorDOMLoaded) {
    window.PDFGeneratorDOMLoaded = true;
    
    document.addEventListener('DOMContentLoaded', function() {
      // Only run on single pages (not list pages)
      const isListPage = document.body.classList.contains('list') || 
                        document.querySelector('.post-list') || 
                        document.querySelector('.posts-list') ||
                        document.querySelector('[data-page-type="list"]');
      
      if (isListPage) {
          return; // Exit early for list pages
      }
      
      const pdfButton = document.getElementById('pdf-generate-btn');
      
      if (!pdfButton) {
          // Silent return - no error logging for missing button
          return;
      }
      
      init();
    });
  }
})();
