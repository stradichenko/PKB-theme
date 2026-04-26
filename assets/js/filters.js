// Filters widget — categories/tags filter chips for site listings.
// Extracted from layouts/partials/filters.html.
(function () {
  'use strict';

  function init() {
    const categoryFilter = document.getElementById('category-filter');
    const tagFilter = document.getElementById('tag-filter');
    const activeFilters = document.getElementById('active-filters');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const posts = document.querySelectorAll('.post-card');
    const filteredCount = document.getElementById('filtered-count');
    const filteredPosts = document.getElementById('filtered-posts');
    const initialMessage = document.getElementById('initial-message');
    const filterStats = document.getElementById('filter-stats');

    if (!categoryFilter || !tagFilter || !activeFilters || !clearFiltersBtn) return;

    const graphColors = [
      'var(--graph-category-1)', 'var(--graph-category-2)',
      'var(--graph-category-3)', 'var(--graph-category-4)',
      'var(--graph-category-5)', 'var(--graph-category-6)',
      'var(--graph-category-7)', 'var(--graph-category-8)'
    ];

    const activeFilterMap = new Map();
    const chipColorMap = new Map();

    const getRandomColor = () =>
      graphColors[Math.floor(Math.random() * graphColors.length)];

    function updateFilterStats() {
      const visiblePosts = document.querySelectorAll('.post-card[style="display: block;"]');
      if (filteredCount) filteredCount.textContent = String(visiblePosts.length);
    }

    function createFilterChip(type, value) {
      if (!chipColorMap.has(value)) chipColorMap.set(value, getRandomColor());
      const chip = document.createElement('span');
      chip.classList.add('filter-chip');
      chip.style.backgroundColor = chipColorMap.get(value);
      chip.textContent = value;
      chip.dataset.type = type;
      chip.dataset.value = value;

      const closeBtn = document.createElement('button');
      closeBtn.classList.add('chip-close');
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', () => removeFilter(type, value));
      chip.appendChild(closeBtn);
      return chip;
    }

    function updateSelectOptions() {
      [
        { select: categoryFilter, type: 'category' },
        { select: tagFilter, type: 'tag' }
      ].forEach(({ select, type }) => {
        const filters = activeFilterMap.get(type) || new Set();
        Array.from(select.options).forEach(option => {
          if (option.value && filters.has(option.value)) {
            option.disabled = true;
            option.style.display = 'none';
          } else {
            option.disabled = false;
            option.style.display = '';
          }
        });
      });
    }

    function addFilter(type, value) {
      if (!value) return;
      if (!activeFilterMap.has(type)) activeFilterMap.set(type, new Set());
      activeFilterMap.get(type).add(value);

      activeFilters.appendChild(createFilterChip(type, value));
      updateVisibility();
      updateSelectOptions();

      if (type === 'category') categoryFilter.value = '';
      if (type === 'tag') tagFilter.value = '';
    }

    function removeFilter(type, value) {
      const filters = activeFilterMap.get(type);
      if (filters) {
        filters.delete(value);
        if (filters.size === 0) activeFilterMap.delete(type);
      }

      const chip = activeFilters.querySelector(`[data-type="${type}"][data-value="${value}"]`);
      if (chip) chip.remove();

      updateVisibility();
      updateSelectOptions();
    }

    function updateVisibility() {
      const hasActiveFilters = activeFilterMap.size > 0;
      if (initialMessage) initialMessage.style.display = hasActiveFilters ? 'none' : 'flex';
      if (filteredPosts) filteredPosts.style.display = hasActiveFilters ? 'block' : 'none';
      if (filterStats) filterStats.classList.toggle('hidden', !hasActiveFilters);

      if (!hasActiveFilters) return;

      posts.forEach(post => {
        const categories = (post.dataset.categories || '').split(',').filter(Boolean);
        const tags = (post.dataset.tags || '').split(',').filter(Boolean);
        let visible = true;

        if (activeFilterMap.has('category')) {
          visible = visible && Array.from(activeFilterMap.get('category'))
            .some(cat => categories.includes(cat));
        }
        if (activeFilterMap.has('tag')) {
          visible = visible && Array.from(activeFilterMap.get('tag'))
            .some(tag => tags.includes(tag));
        }

        post.style.display = visible ? 'block' : 'none';
        post.classList.toggle('post-card-visible', visible);
        post.classList.toggle('post-card-hidden', !visible);
      });
      updateFilterStats();
    }

    function clearFilters() {
      activeFilterMap.clear();
      chipColorMap.clear();
      activeFilters.innerHTML = '';
      categoryFilter.value = '';
      tagFilter.value = '';
      updateVisibility();
      updateSelectOptions();
    }

    categoryFilter.addEventListener('change', e => addFilter('category', e.target.value));
    tagFilter.addEventListener('change', e => addFilter('tag', e.target.value));
    clearFiltersBtn.addEventListener('click', clearFilters);

    updateFilterStats();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
