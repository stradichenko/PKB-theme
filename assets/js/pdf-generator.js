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
      this.button.addEventListener('click', this.handleClick.bind(this));
      this.button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleClick(e);
        }
      });
    }

    handleClick(e) {
      e.preventDefault();
      
      if (this.button.disabled) return;
      
      // Direct print without loading animation
      window.print();
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
  }

  function init() {
    try {
      window.PDFGeneratorInstance = new PDFGenerator();
    } catch (error) {
      console.error('PDF Generator initialization failed:', error);
    }
  }

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
})();
