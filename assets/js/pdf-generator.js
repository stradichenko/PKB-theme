(function() {
  'use strict';
  
  // Debug flag - set to true to see what's happening
  const DEBUG = true;
  
  // Add immediate console log to verify script is loading
  if (DEBUG) {
    console.log('🔍 PDF Generator: Script file loaded at', new Date().toLocaleTimeString());
    console.log('🔍 PDF Generator: Document ready state:', document.readyState);
    console.log('🔍 PDF Generator: Script execution context:', window.location.href);
  }
  
  const CONFIG = {
    selectors: {
      button: 'pdf-generate-btn', // Match existing ID
      title: '.post-title',
      content: '.post-content', 
      metadata: '.page-metadata'
    },
    display: {
      windowFeatures: 'width=1024,height=768,scrollbars=yes,resizable=yes',
      loadTimeout: 1000
    }
  };

  class PDFGenerator {
    constructor() {
      if (DEBUG) console.log('🔍 PDF Generator: Constructor called');
      this.button = null;
      this.init();
    }

    init() {
      if (DEBUG) {
        console.log('🔍 PDF Generator: init() called');
        console.log('🔍 PDF Generator: Document body exists:', !!document.body);
        console.log('🔍 PDF Generator: Total elements in DOM:', document.querySelectorAll('*').length);
      }

      // Wait a bit for DOM to be fully ready
      setTimeout(() => {
        this.findButton();
        if (!this.button) {
          if (DEBUG) {
            console.warn('❌ PDF generator: button not found with ID:', CONFIG.selectors.button);
            this.debugDOMState();
          }
          return;
        }

        this.bindEvents();
        if (DEBUG) console.log('✅ PDF generator: initialized successfully');
      }, 100);
    }

    debugDOMState() {
      if (!DEBUG) return;
      
      console.group('🔍 PDF Generator: DOM Debug Info');
      
      // Check if we're on a single post page
      const isSinglePage = document.querySelector('.main-content') || document.querySelector('article');
      console.log('- Is single post page:', !!isSinglePage);
      
      // List all elements with IDs
      const elementsWithIds = Array.from(document.querySelectorAll('[id]'));
      console.log('- Elements with IDs:', elementsWithIds.map(el => ({
        id: el.id,
        tagName: el.tagName,
        className: el.className
      })));
      
      // List all buttons
      const allButtons = Array.from(document.querySelectorAll('button'));
      console.log('- All buttons found:', allButtons.map(b => ({
        id: b.id || 'no-id',
        className: b.className,
        text: b.textContent.trim(),
        innerHTML: b.innerHTML.substring(0, 100)
      })));
      
      // Check for post-actions container
      const postActions = document.querySelector('.post-actions');
      console.log('- Post actions container:', !!postActions);
      if (postActions) {
        console.log('- Post actions content:', postActions.innerHTML);
      }
      
      // Check for PDF partial
      const pdfElements = document.querySelectorAll('[class*="pdf"], [id*="pdf"]');
      console.log('- PDF-related elements:', Array.from(pdfElements).map(el => ({
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        text: el.textContent.trim()
      })));
      
      // Check if Hugo has rendered the partial
      const postHeader = document.querySelector('.post-header');
      console.log('- Post header exists:', !!postHeader);
      if (postHeader) {
        console.log('- Post header HTML:', postHeader.innerHTML.substring(0, 500));
      }
      
      console.groupEnd();
    }

    findButton() {
      if (DEBUG) console.log('🔍 PDF Generator: Looking for button with ID:', CONFIG.selectors.button);
      
      this.button = document.getElementById(CONFIG.selectors.button);
      
      if (DEBUG) {
        if (this.button) {
          console.log('✅ PDF generator: found button', this.button);
          console.log('✅ Button details:', {
            id: this.button.id,
            className: this.button.className,
            tagName: this.button.tagName,
            parentElement: this.button.parentElement?.className,
            isVisible: this.button.offsetParent !== null,
            isEnabled: !this.button.disabled
          });
        } else {
          console.log('❌ PDF generator: button not found');
        }
      }
    }

    bindEvents() {
      if (DEBUG) console.log('🔍 PDF Generator: Binding events to button');
      
      this.button.addEventListener('click', this.handleClick.bind(this));
      
      // Add keyboard support
      this.button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleClick(e);
        }
      });
      
      if (DEBUG) console.log('✅ PDF Generator: Events bound successfully');
    }

    handleClick(e) {
      e.preventDefault();
      
      if (DEBUG) console.log('PDF generator: button clicked');
      
      try {
        this.showLoading();
        this.generatePDF();
      } catch (error) {
        console.error('PDF generation failed:', error);
        this.showError('Failed to generate PDF: ' + error.message);
      } finally {
        // Use timeout to ensure loading state is visible
        setTimeout(() => this.hideLoading(), 1000);
      }
    }

    generatePDF() {
      if (DEBUG) console.log('PDF generator: preparing content');
      
      const printContent = this.preparePrintContent();
      
      if (DEBUG) {
        console.log('PDF generator: opening display window');
        console.log('PDF generator: content length:', printContent.length);
      }
      
      // Create display window - opens in new tab
      const displayWindow = window.open('', '_blank');
      
      if (!displayWindow) {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const errorMsg = isLocalhost 
          ? 'Could not open display window. This might be a browser popup blocker. Try allowing popups for localhost.'
          : 'Could not open display window. Please check popup blockers.';
        throw new Error(errorMsg);
      }

      displayWindow.document.write(printContent);
      displayWindow.document.close();
      
      // Wait for content to load, then focus window
      displayWindow.onload = () => {
        if (DEBUG) console.log('PDF generator: display window loaded');
        displayWindow.focus();
      };

      // Fallback timeout in case onload doesn't fire
      setTimeout(() => {
        if (displayWindow && !displayWindow.closed) {
          if (DEBUG) console.log('PDF generator: fallback focus triggered');
          displayWindow.focus();
        }
      }, CONFIG.display.loadTimeout);
    }

    preparePrintContent() {
      // Get content using your actual template structure
      const title = this.getTitle();
      const content = this.getContent();
      const metadata = this.getMetadata();
      
      if (DEBUG) {
        console.log('PDF generator: extracted content', {
          title: title ? 'found' : 'missing',
          content: content ? 'found' : 'missing', 
          metadata: metadata ? 'found' : 'missing'
        });
        
        // Log actual content selectors for debugging
        console.log('PDF generator: selector check', {
          titleElement: document.querySelector(CONFIG.selectors.title),
          contentElement: document.querySelector(CONFIG.selectors.content),
          metadataElement: document.querySelector(CONFIG.selectors.metadata)
        });
      }

      if (!content) {
        throw new Error('No content found to convert to PDF. Make sure you are on a page with a .post-content element.');
      }

      const template = this.getTemplate();
      
      return template
        .replace(/\{\{TITLE\}\}/g, this.escapeHtml(title))
        .replace(/\{\{METADATA\}\}/g, metadata || '')
        .replace(/\{\{CONTENT\}\}/g, content)
        .replace(/\{\{STYLES\}\}/g, this.getPDFStyles());
    }

    getTitle() {
      const titleEl = document.querySelector(CONFIG.selectors.title);
      return titleEl ? titleEl.textContent.trim() : document.title;
    }

    getContent() {
      const contentEl = document.querySelector(CONFIG.selectors.content);
      return contentEl ? contentEl.outerHTML : null;
    }

    getMetadata() {
      const metadataEl = document.querySelector(CONFIG.selectors.metadata);
      return metadataEl ? metadataEl.outerHTML : '';
    }

    getTemplate() {
      // Check for custom template in localStorage first
      const customTemplate = localStorage.getItem('pdf-template');
      if (customTemplate) {
        if (DEBUG) console.log('PDF generator: using custom template');
        return customTemplate;
      }
      
      // Default template optimized for PKB theme content
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{{TITLE}}</title>
  <style>{{STYLES}}</style>
</head>
<body>
  <header class="pdf-header">
    <h1>{{TITLE}}</h1>
    <div class="pdf-metadata">{{METADATA}}</div>
  </header>
  <main class="pdf-content">
    {{CONTENT}}
  </main>
  <footer class="pdf-footer">
    <p>Generated from PKB Theme</p>
  </footer>
</body>
</html>`;
    }

    getPDFStyles() {
      const customStyles = localStorage.getItem('pdf-custom-styles') || '';
      
      return `
        @page {
          margin: 2cm;
          size: A4;
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          line-height: 1.6;
          color: #000;
          background: #fff;
          margin: 0;
          padding: 1rem;
          max-width: none;
        }
        
        .pdf-header {
          border-bottom: 2px solid #4a90e2;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
        }
        
        .pdf-header h1 {
          margin: 0 0 1rem 0;
          font-size: 28px;
          font-weight: bold;
          color: #1a2633;
        }
        
        .pdf-metadata {
          font-size: 12px;
          color: #666;
        }
        
        .pdf-metadata svg {
          display: none;
        }
        
        .pdf-metadata .page-author,
        .pdf-metadata .page-date,
        .pdf-metadata .page-updated,
        .pdf-metadata .page-categories,
        .pdf-metadata .page-tags {
          display: inline-block;
          margin-right: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .pdf-content {
          font-size: 14px;
          line-height: 1.7;
          max-width: 800px;
          margin: 0 auto;
        }
        
        /* Typography */
        .pdf-content h1 { 
          font-size: 24px; 
          margin: 2rem 0 1rem 0; 
          color: #1a2633;
          border-bottom: 1px solid #ddd;
          padding-bottom: 0.5rem;
        }
        
        .pdf-content h2 { 
          font-size: 20px; 
          margin: 1.5rem 0 0.75rem 0; 
          color: #1a2633;
        }
        
        .pdf-content h3 { 
          font-size: 18px; 
          margin: 1.25rem 0 0.5rem 0; 
          color: #1a2633;
        }
        
        .pdf-content h4 { 
          font-size: 16px; 
          margin: 1rem 0 0.5rem 0; 
          color: #1a2633;
        }
        
        .pdf-content p {
          margin: 0.75rem 0;
          text-align: justify;
        }
        
        /* Code blocks */
        .pdf-content pre {
          background: #f8f8f8;
          border: 1px solid #e0e0e0;
          border-left: 4px solid #4a90e2;
          padding: 1rem;
          font-size: 12px;
          overflow: visible;
          white-space: pre-wrap;
          margin: 1rem 0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        
        .pdf-content code {
          background: #f0f0f0;
          padding: 0.2rem 0.4rem;
          font-size: 13px;
          border-radius: 3px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        
        /* Tables */
        .pdf-content table {
          border-collapse: collapse;
          width: 100%;
          font-size: 12px;
          margin: 1rem 0;
        }
        
        .pdf-content th,
        .pdf-content td {
          border: 1px solid #ddd;
          padding: 0.5rem;
          text-align: left;
        }
        
        .pdf-content th {
          background: #f5f5f5;
          font-weight: bold;
          color: #1a2633;
        }
        
        .pdf-content tr:nth-child(even) {
          background: #fafafa;
        }
        
        /* Lists */
        .pdf-content ul,
        .pdf-content ol {
          margin: 0.75rem 0;
          padding-left: 2rem;
        }
        
        .pdf-content li {
          margin: 0.25rem 0;
        }
        
        /* Images */
        .pdf-content img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1rem auto;
        }
        
        /* Links */
        .pdf-content a {
          color: #4a90e2;
          text-decoration: none;
        }
        
        .pdf-content a::after {
          content: " (" attr(href) ")";
          font-size: 11px;
          color: #666;
        }
        
        /* Hide elements that shouldn't appear in display */
        .pdf-button,
        .post-actions,
        .toc-sidebar,
        .sidenote-section,
        .tooltip,
        nav:not(.pdf-nav),
        header:not(.pdf-header),
        footer:not(.pdf-footer) {
          display: none !important;
        }
        
        .pdf-footer {
          margin-top: 3rem;
          padding-top: 1rem;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        
        /* Custom user styles */
        ${customStyles}
      `;
    }

    showLoading() {
      if (!this.button) return;
      
      this.button.disabled = true;
      this.button.innerHTML = 'Generating...';
      this.button.classList.add('loading');
      
      if (DEBUG) console.log('PDF generator: showing loading state');
    }

    hideLoading() {
      if (!this.button) return;
      
      this.button.disabled = false;
      this.button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
          <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361.01.022.02.036.026.044a.266.266 0 0 0 .035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 0 0 .45-.606zm1.64-1.33a12.71 12.71 0 0 1 1.01-.193 11.744 11.744 0 0 1-.51-.858 20.801 20.801 0 0 1-.5 1.05zm2.446.45c.15.163.296.3.435.41.24.19.407.253.498.256a.107.107 0 0 0 .07-.015.307.307 0 0 0 .094-.125.436.436 0 0 0 .059-.2.095.095 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a3.876 3.876 0 0 0-.612-.053zM8.078 7.8a6.7 6.7 0 0 0 .2-.828c.031-.188.043-.343.038-.465a.613.613 0 0 0-.032-.198.517.517 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822.024.111.054.227.09.346z"/>
        </svg>
        PDF
      `;
      this.button.classList.remove('loading');
      
      if (DEBUG) console.log('PDF generator: hiding loading state');
    }

    showError(message) {
      console.error('PDF Error:', message);
      
      // Create temporary error notification
      const errorEl = document.createElement('div');
      errorEl.className = 'pdf-error';
      errorEl.textContent = message;
      errorEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        z-index: 9999;
        max-width: 300px;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        cursor: pointer;
      `;
      
      // Add click to dismiss
      errorEl.addEventListener('click', () => {
        if (errorEl.parentNode) {
          errorEl.parentNode.removeChild(errorEl);
        }
      });
      
      document.body.appendChild(errorEl);
      setTimeout(() => {
        if (errorEl.parentNode) {
          errorEl.parentNode.removeChild(errorEl);
        }
      }, 5000);
    }

    escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Enhanced initialization with multiple checks
  function init() {
    if (DEBUG) {
      console.log('🔍 PDF Generator: init() function called');
      console.log('🔍 PDF Generator: DOM ready state:', document.readyState);
      console.log('🔍 PDF Generator: current URL:', window.location.href);
      console.log('🔍 PDF Generator: body exists:', !!document.body);
    }
    
    // Try multiple initialization strategies
    const tryInit = () => {
      if (DEBUG) console.log('🔍 PDF Generator: Attempting to create PDFGenerator instance');
      try {
        new PDFGenerator();
      } catch (error) {
        console.error('❌ PDF Generator: Initialization failed:', error);
      }
    };
    
    // Immediate attempt
    tryInit();
    
    // Backup attempts with delays
    setTimeout(tryInit, 250);
    setTimeout(tryInit, 500);
    setTimeout(tryInit, 1000);
  }

  // Multiple initialization strategies
  if (document.readyState === 'loading') {
    if (DEBUG) console.log('🔍 PDF Generator: DOM still loading, adding DOMContentLoaded listener');
    document.addEventListener('DOMContentLoaded', init);
  } else {
    if (DEBUG) console.log('🔍 PDF Generator: DOM already ready, initializing immediately');
    init();
  }
  
  // Additional fallback for SPA-like behavior
  if (window.addEventListener) {
    window.addEventListener('load', () => {
      if (DEBUG) console.log('🔍 PDF Generator: Window load event fired, attempting late init');
      setTimeout(init, 100);
    });
  }

  // Export for debugging
  if (DEBUG) {
    window.PDFGenerator = PDFGenerator;
    window.debugPDF = function() {
      console.group('🔍 PDF Debug Helper');
      console.log('- Button exists:', !!document.getElementById('generate-pdf'));
      console.log('- Content exists:', !!document.querySelector('.post-content'));
      console.log('- Title exists:', !!document.querySelector('.post-title'));
      console.log('- Metadata exists:', !!document.querySelector('.page-metadata'));
      console.log('- Post actions exists:', !!document.querySelector('.post-actions'));
      console.log('- Script loaded:', typeof window.PDFGenerator !== 'undefined');
      
      // Force manual initialization
      console.log('🔧 Attempting manual initialization...');
      new PDFGenerator();
      console.groupEnd();
    };
    
    // Global check function
    window.checkPDFSetup = function() {
      console.group('🔍 PDF Setup Check');
      
      // Check if partial exists
      fetch(window.location.href)
        .then(response => response.text())
        .then(html => {
          const hasPartial = html.includes('pdf-button.html') || html.includes('generate-pdf');
          console.log('- PDF partial in HTML:', hasPartial);
          
          if (!hasPartial) {
            console.warn('❌ PDF button partial may not be included in the template');
          }
        })
        .catch(error => console.error('Error checking HTML:', error));
      
      console.groupEnd();
    };
  }
})();
