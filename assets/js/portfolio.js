class PortfolioManager {
  constructor() {
    this.portfolioData = null;
    this.currentImages = [];
    this.currentIndex = 0;
    this.masonryGrid = null;
    this.observer = null;
    this.isLoading = false;
    this.currentFilter = 'all';
    
    this.init();
  }

  async init() {
    try {
      await this.loadPortfolioData();
      this.setupElements();
      this.createMasonryGrid();
      this.setupLazyLoading();
      this.setupEventListeners();
      this.hideLoading();
    } catch (error) {
      console.error('Portfolio initialization failed:', error);
      this.showError('Failed to load portfolio');
    }
  }

  async loadPortfolioData() {
    const grid = document.getElementById('portfolioGrid');
    const jsonUrl = grid.dataset.jsonUrl;
    
    if (!jsonUrl) {
      throw new Error('Portfolio JSON URL not found');
    }

    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to load portfolio data: ${response.status}`);
    }
    
    this.portfolioData = await response.json();
    this.currentImages = [...this.portfolioData.images];
  }

  setupElements() {
    this.elements = {
      grid: document.getElementById('portfolioGrid'),
      overlay: document.getElementById('portfolioOverlay'),
      overlayImage: document.getElementById('overlayImage'),
      overlayClose: document.getElementById('overlayClose'),
      metadataContent: document.getElementById('metadataContent'),
      navPrev: document.getElementById('navPrev'),
      navNext: document.getElementById('navNext'),
      loading: document.querySelector('.portfolio-loading'),
      filterBtns: document.querySelectorAll('.filter-btn')
    };
  }

  createMasonryGrid() {
    this.elements.grid.innerHTML = '';
    
    // Create masonry columns
    const columnCount = this.getColumnCount();
    const columns = [];
    
    for (let i = 0; i < columnCount; i++) {
      const column = document.createElement('div');
      column.className = 'masonry-column';
      this.elements.grid.appendChild(column);
      columns.push(column);
    }

    // Distribute images across columns
    this.currentImages.forEach((image, index) => {
      const item = this.createGridItem(image, index);
      const shortestColumn = this.getShortestColumn(columns);
      shortestColumn.appendChild(item);
    });
  }

  createGridItem(image, index) {
    const item = document.createElement('div');
    item.className = `portfolio-item ${image.pkb_orientation}`;
    item.dataset.category = image.pkb_category;
    item.dataset.index = index;
    
    // Use smallest thumbnail for grid display
    const thumbnail = image.pkb_thumbnail_300_300;
    const aspectRatio = thumbnail.height / thumbnail.width;
    
    item.innerHTML = `
      <div class="item-container" style="aspect-ratio: ${1/aspectRatio}">
        <img 
          class="portfolio-image lazy-load" 
          data-src="${thumbnail.url}"
          data-full="${image.pkb_optimized_webp.url}"
          alt="${image.pkb_filename}"
          loading="lazy"
        >
        <div class="item-overlay">
          <div class="item-info">
            <span class="item-category">${this.humanize(image.pkb_category)}</span>
            <span class="item-dimensions">${image.pkb_original_width}×${image.pkb_original_height}</span>
          </div>
        </div>
        <div class="loading-placeholder">
          <div class="placeholder-shimmer"></div>
        </div>
      </div>
    `;

    // Add click handler
    item.addEventListener('click', () => this.openOverlay(index));
    
    return item;
  }

  getShortestColumn(columns) {
    return columns.reduce((shortest, column) => 
      column.offsetHeight < shortest.offsetHeight ? column : shortest
    );
  }

  getColumnCount() {
    const width = window.innerWidth;
    if (width >= 1200) return 4;
    if (width >= 768) return 3;
    if (width >= 480) return 2;
    return 1;
  }

  setupLazyLoading() {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    // Observe all lazy-load images
    this.observeLazyImages();
  }

  observeLazyImages() {
    const lazyImages = document.querySelectorAll('.lazy-load');
    lazyImages.forEach(img => this.observer.observe(img));
  }

  loadImage(img) {
    const placeholder = img.parentElement.querySelector('.loading-placeholder');
    
    img.addEventListener('load', () => {
      img.classList.add('loaded');
      if (placeholder) placeholder.style.display = 'none';
    });

    img.addEventListener('error', () => {
      img.classList.add('error');
      if (placeholder) placeholder.innerHTML = '<span class="error-text">Failed to load</span>';
    });

    img.src = img.dataset.src;
  }

  setupEventListeners() {
    // Filter buttons
    this.elements.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleFilter(e));
    });

    // Overlay controls
    this.elements.overlayClose.addEventListener('click', () => this.closeOverlay());
    this.elements.navPrev.addEventListener('click', () => this.navigateImage(-1));
    this.elements.navNext.addEventListener('click', () => this.navigateImage(1));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Close overlay on background click
    this.elements.overlay.addEventListener('click', (e) => {
      if (e.target === this.elements.overlay) this.closeOverlay();
    });

    // Window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.handleResize(), 250);
    });
  }

  handleFilter(e) {
    const filter = e.target.dataset.filter;
    this.currentFilter = filter;

    // Update active button
    this.elements.filterBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    // Filter images
    if (filter === 'all') {
      this.currentImages = [...this.portfolioData.images];
    } else {
      this.currentImages = this.portfolioData.images.filter(img => 
        img.pkb_category === filter
      );
    }

    // Recreate grid
    this.createMasonryGrid();
    this.observeLazyImages();
  }

  openOverlay(index) {
    this.currentIndex = index;
    const image = this.currentImages[index];
    
    this.elements.overlay.classList.add('active');
    document.body.classList.add('overlay-open');
    
    this.loadOverlayImage(image);
    this.updateMetadata(image);
    this.updateNavigation();
  }

  closeOverlay() {
    this.elements.overlay.classList.remove('active');
    document.body.classList.remove('overlay-open');
  }

  loadOverlayImage(image) {
    const img = this.elements.overlayImage;
    
    // Show loading state
    img.classList.add('loading');
    
    // Use WebP if supported, fallback to JPEG
    const imageUrl = this.supportsWebP() ? 
      image.pkb_optimized_webp.url : 
      image.pkb_optimized_jpeg.url;
    
    img.addEventListener('load', () => {
      img.classList.remove('loading');
    }, { once: true });
    
    img.src = imageUrl;
    img.alt = image.pkb_filename;
  }

  updateMetadata(image) {
    const metadata = this.generateMetadataHTML(image);
    this.elements.metadataContent.innerHTML = metadata;
  }

  generateMetadataHTML(image) {
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return `
      <div class="metadata-section">
        <h4>File Information</h4>
        <div class="metadata-item">
          <span class="label">Filename:</span>
          <span class="value">${image.pkb_filename}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Category:</span>
          <span class="value">${this.humanize(image.pkb_category)}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Dimensions:</span>
          <span class="value">${image.pkb_original_width} × ${image.pkb_original_height}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Format:</span>
          <span class="value">${image.pkb_format.toUpperCase()}</span>
        </div>
        <div class="metadata-item">
          <span class="label">File Size:</span>
          <span class="value">${formatFileSize(image.pkb_file_size)}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Aspect Ratio:</span>
          <span class="value">${image.pkb_aspect_ratio.toFixed(2)}</span>
        </div>
      </div>
      
      ${image.pkb_exif_make ? `
        <div class="metadata-section">
          <h4>EXIF Data</h4>
          ${image.pkb_exif_make ? `
            <div class="metadata-item">
              <span class="label">Camera:</span>
              <span class="value">${image.pkb_exif_make} ${image.pkb_exif_model || ''}</span>
            </div>
          ` : ''}
          ${image.pkb_exif_lens_model ? `
            <div class="metadata-item">
              <span class="label">Lens:</span>
              <span class="value">${image.pkb_exif_lens_model}</span>
            </div>
          ` : ''}
          ${image.pkb_exif_exposure_time ? `
            <div class="metadata-item">
              <span class="label">Exposure:</span>
              <span class="value">${image.pkb_exif_exposure_time}s</span>
            </div>
          ` : ''}
          ${image.pkb_exif_f_number ? `
            <div class="metadata-item">
              <span class="label">Aperture:</span>
              <span class="value">f/${image.pkb_exif_f_number}</span>
            </div>
          ` : ''}
          ${image.pkb_exif_iso ? `
            <div class="metadata-item">
              <span class="label">ISO:</span>
              <span class="value">${image.pkb_exif_iso}</span>
            </div>
          ` : ''}
          ${image.pkb_exif_date ? `
            <div class="metadata-item">
              <span class="label">Date Taken:</span>
              <span class="value">${new Date(image.pkb_exif_date).toLocaleString()}</span>
            </div>
          ` : ''}
        </div>
      ` : ''}
      
      <div class="metadata-section">
        <h4>Colors</h4>
        <div class="color-palette">
          ${image.pkb_dominant_colors.map(color => 
            `<div class="color-swatch" style="background-color: ${color}" title="${color}"></div>`
          ).join('')}
        </div>
      </div>
    `;
  }

  updateNavigation() {
    const hasPrev = this.currentIndex > 0;
    const hasNext = this.currentIndex < this.currentImages.length - 1;
    
    this.elements.navPrev.style.display = hasPrev ? 'block' : 'none';
    this.elements.navNext.style.display = hasNext ? 'block' : 'none';
  }

  navigateImage(direction) {
    const newIndex = this.currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < this.currentImages.length) {
      this.currentIndex = newIndex;
      const image = this.currentImages[this.currentIndex];
      
      this.loadOverlayImage(image);
      this.updateMetadata(image);
      this.updateNavigation();
    }
  }

  handleKeyboard(e) {
    if (!this.elements.overlay.classList.contains('active')) return;
    
    switch (e.key) {
      case 'Escape':
        this.closeOverlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.navigateImage(-1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.navigateImage(1);
        break;
    }
  }

  handleResize() {
    // Recreate grid with new column count
    this.createMasonryGrid();
    this.observeLazyImages();
  }

  hideLoading() {
    this.elements.loading.style.display = 'none';
  }

  showError(message) {
    this.elements.loading.innerHTML = `
      <div class="error-message">
        <p>${message}</p>
        <button onclick="location.reload()">Retry</button>
      </div>
    `;
  }

  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  humanize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/[-_]/g, ' ');
  }
}

// Initialize portfolio when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioManager();
});
