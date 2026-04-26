// Portfolio page filters / masonry grid renderer.
// Extracted from inline <script> in layouts/portfolio/portfolio.html.

(async () => {
  const gridEl = document.getElementById('portfolioGrid');
  if (!gridEl) return;

  const url = gridEl.getAttribute('data-json-url');
  if (!url) return;

  const resp = await fetch(url);
  const data = await resp.json();

  const filtersEl = document.getElementById('portfolioFilters');
  const formatSelect = document.getElementById('formatSelect');
  const orientationSelect = document.getElementById('orientationSelect');
  const cameraSelect = document.getElementById('cameraSelect');
  const colorSelect = document.getElementById('colorSelect');

  const formats = new Set();
  const cameras = new Set();
  const colors = new Set();

  (data.portfolio_metadata.category_list || []).forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.filter = cat;
    btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    filtersEl.appendChild(btn);
  });

  (data.images || []).forEach(img => {
    formats.add(img.pkb_format);
    if (img.pkb_exif_model) cameras.add(img.pkb_exif_model);
    (img.pkb_dominant_colors || []).forEach(c => colors.add(c));
  });

  [...formats].sort().forEach(fmt => {
    const option = document.createElement('option');
    option.value = fmt;
    option.textContent = (fmt || '').toUpperCase();
    formatSelect.appendChild(option);
  });

  [...cameras].sort().forEach(cam => {
    const option = document.createElement('option');
    option.value = cam;
    option.textContent = cam;
    cameraSelect.appendChild(option);
  });

  [...colors].sort().forEach(clr => {
    const option = document.createElement('option');
    option.value = clr;
    option.textContent = clr;
    colorSelect.appendChild(option);
  });

  const statsEl = document.getElementById('portfolioStats');
  statsEl.innerHTML = `
    <span class="stat-item"><strong>${data.portfolio_metadata.total_images}</strong> Images</span>
    <span class="stat-item"><strong>${(data.portfolio_metadata.category_list || []).length}</strong> Categories</span>
  `;

  function getColumnCount() {
    if (window.innerWidth < 600) return 1;
    if (window.innerWidth < 900) return 2;
    if (window.innerWidth < 1200) return 3;
    return 4;
  }

  function distributeToColumns(items, colCount) {
    const cols = Array.from({ length: colCount }, () => []);
    items.forEach((item, idx) => {
      cols[idx % colCount].push(item);
    });
    return cols;
  }

  function renderGrid(category, format, orientation, camera, color) {
    const filtered = (data.images || []).filter(img => {
      const catMatch = category === 'all' || img.pkb_category === category;
      const fmtMatch = format === 'all' || img.pkb_format === format;
      const oriMatch = orientation === 'all' || img.pkb_orientation === orientation;
      const camMatch = camera === 'all' || img.pkb_exif_model === camera;
      const clrMatch = color === 'all' || (img.pkb_dominant_colors || []).includes(color);
      return catMatch && fmtMatch && oriMatch && camMatch && clrMatch;
    });

    const colCount = getColumnCount();
    const columns = distributeToColumns(filtered, colCount);

    gridEl.innerHTML = columns.map(colImgs => `
      <div class="masonry-column">
        ${colImgs.map(img => {
          const width = img.pkb_original_width || 1;
          const height = img.pkb_original_height || 1;
          const thumb = img.pkb_thumbnail_300_300 || {};
          return `
            <div class="portfolio-item" data-category="${img.pkb_category}" data-format="${img.pkb_format}" style="width: 100%;">
              <div class="item-container" style="aspect-ratio: ${width} / ${height}; width: 100%;">
                <img class="portfolio-image" src="${thumb.url || ''}" alt="${img.pkb_filename || ''}" loading="lazy" style="width: 100%; height: 100%;" />
                <div class="item-overlay">
                  <div class="item-info">
                    <span class="item-category">${img.pkb_category}</span>
                    <span class="item-dimensions">${width}×${height}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `).join('');

    gridEl.querySelectorAll('.portfolio-image').forEach(img => {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', () => img.classList.add('loaded'));
        img.addEventListener('error', () => img.classList.add('error'));
      }
    });
  }

  let activeCategory = 'all';
  let activeFormat = 'all';
  let activeOrientation = 'all';
  let activeCamera = 'all';
  let activeColor = 'all';

  renderGrid(activeCategory, activeFormat, activeOrientation, activeCamera, activeColor);

  filtersEl.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.filter;
      renderGrid(activeCategory, activeFormat, activeOrientation, activeCamera, activeColor);
    });
  });

  formatSelect.addEventListener('change', e => {
    activeFormat = e.target.value;
    renderGrid(activeCategory, activeFormat, activeOrientation, activeCamera, activeColor);
  });

  orientationSelect.addEventListener('change', e => {
    activeOrientation = e.target.value;
    renderGrid(activeCategory, activeFormat, activeOrientation, activeCamera, activeColor);
  });

  cameraSelect.addEventListener('change', e => {
    activeCamera = e.target.value;
    renderGrid(activeCategory, activeFormat, activeOrientation, activeCamera, activeColor);
  });

  colorSelect.addEventListener('change', e => {
    activeColor = e.target.value;
    renderGrid(activeCategory, activeFormat, activeOrientation, activeCamera, activeColor);
  });

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      renderGrid(activeCategory, activeFormat, activeOrientation, activeCamera, activeColor);
    }, 150);
  });

  const loading = document.getElementById('portfolioLoading');
  if (loading) loading.style.display = 'none';
})();
