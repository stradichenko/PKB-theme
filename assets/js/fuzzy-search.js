(function () {
  'use strict';

  function FuzzySearch(options) {
    this.threshold = (options && options.threshold) || 0.3;
    this.maxResults = (options && options.maxResults) || 10;
    this.searchData = [];
    this.searchIndex = null;
    this.loadPromise = null;
    this.setupSearchHandlers();
  }

  // Compute the index URL once, supporting subpath deployments (e.g. GitHub Pages).
  FuzzySearch.prototype.getIndexUrl = function () {
    const currentPath = window.location.pathname;
    let basePath = '';
    if (currentPath !== '/' && currentPath.indexOf('/') === 0) {
      const pathParts = currentPath.split('/').filter((part) => part.length > 0);
      if (pathParts.length > 0 && currentPath.startsWith('/' + pathParts[0] + '/')) {
        basePath = '/' + pathParts[0];
      }
    }
    return basePath + '/index.json';
  };

  // Lazy-load: returns a cached promise so multiple inputs share one fetch.
  FuzzySearch.prototype.ensureLoaded = function () {
    if (this.loadPromise) return this.loadPromise;
    const self = this;
    const indexUrl = this.getIndexUrl();

    this.loadPromise = fetch(indexUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Search index not found (HTTP ' + response.status + ') at ' + indexUrl);
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          self.searchData = data;
        } else {
          self.searchData = [];
        }
        self.buildSearchIndex();
      })
      .catch((error) => {
        console.warn('Could not load search data:', error.message);
        self.searchData = [];
        self.buildSearchIndex();
      });

    return this.loadPromise;
  };

  FuzzySearch.prototype.buildSearchIndex = function () {
    const self = this;
    this.searchIndex = this.searchData.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      summary: item.summary,
      url: item.url,
      date: item.date,
      tags: item.tags,
      categories: item.categories,
      section: item.section,
      type: item.type,
      searchText: (item.title + ' ' + item.content + ' ' + (item.tags || []).join(' ') + ' ' + (item.categories || []).join(' ')).toLowerCase(),
      titleWords: self.tokenize(item.title.toLowerCase()),
      contentWords: self.tokenize((item.content || '').toLowerCase())
    }));
  };

  FuzzySearch.prototype.tokenize = function (text) {
    return text.split(/\s+/).filter((word) => word.length > 2);
  };

  FuzzySearch.prototype.fuzzyMatch = function (pattern, text) {
    const patternLength = pattern.length;
    const textLength = text.length;

    if (patternLength === 0) return { score: 1, matches: [] };
    if (textLength === 0) return { score: 0, matches: [] };

    const matches = [];
    let patternIndex = 0;
    let score = 0;
    let consecutiveMatches = 0;
    let maxConsecutive = 0;

    for (let textIndex = 0; textIndex < textLength && patternIndex < patternLength; textIndex++) {
      if (pattern[patternIndex] === text[textIndex]) {
        matches.push(textIndex);
        patternIndex++;
        consecutiveMatches++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveMatches);
        score += consecutiveMatches;
      } else {
        consecutiveMatches = 0;
      }
    }

    if (patternIndex !== patternLength) {
      return { score: 0, matches: [] };
    }

    const matchRatio = patternLength / textLength;
    const consecutiveBonus = maxConsecutive / patternLength;
    const finalScore = (score / (textLength * patternLength)) + matchRatio + consecutiveBonus;

    return { score: finalScore, matches: matches };
  };

  FuzzySearch.prototype.calculateWordScore = function (queryWords, itemWords) {
    const self = this;
    let score = 0;
    for (let i = 0; i < queryWords.length; i++) {
      for (let j = 0; j < itemWords.length; j++) {
        const match = self.fuzzyMatch(queryWords[i], itemWords[j]);
        score += match.score;
      }
    }
    return score;
  };

  FuzzySearch.prototype.highlightMatches = function (text, query) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('(' + escapedQuery + ')', 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  FuzzySearch.prototype.search = function (query) {
    if (!query || query.length < 2) return [];

    if (!this.searchIndex || this.searchIndex.length === 0) {
      return [{
        id: 'no-index',
        title: 'Search index not available',
        content: 'For GitHub Pages: Check hugo.toml outputs.home includes JSON, verify layouts/index.json exists, and ensure content exists in mainSections.',
        summary: 'Search requires proper Hugo configuration and content',
        url: '#',
        type: 'info',
        score: 1,
        highlight: 'Search index not available'
      }];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = this.tokenize(normalizedQuery);
    const results = [];
    const self = this;

    for (let i = 0; i < this.searchIndex.length; i++) {
      const item = this.searchIndex[i];
      if (item.url === window.location.pathname) continue;

      let totalScore = 0;

      const directMatch = self.fuzzyMatch(normalizedQuery, item.searchText);
      if (directMatch.score > 0) {
        totalScore += directMatch.score * 2;
      }

      const titleScore = self.calculateWordScore(queryWords, item.titleWords) * 3;
      const contentScore = self.calculateWordScore(queryWords, item.contentWords);

      totalScore += titleScore + contentScore;

      if (item.title.toLowerCase().indexOf(normalizedQuery) !== -1) {
        totalScore += 5;
      }

      const escapedQuery = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundaryRegex = new RegExp('\\b' + escapedQuery, 'i');
      if (wordBoundaryRegex.test(item.title) || wordBoundaryRegex.test(item.content)) {
        totalScore += 2;
      }

      if (totalScore > self.threshold) {
        results.push({
          id: item.id,
          title: item.title,
          content: item.content,
          summary: item.summary,
          url: item.url,
          section: item.section,
          type: item.type,
          score: totalScore,
          highlight: self.highlightMatches(item.title, normalizedQuery)
        });
      }
    }

    results.sort((a, b) => b.score - a.score);

    return results.slice(0, this.maxResults);
  };

  FuzzySearch.prototype.setupSearchHandlers = function () {
    const desktopInput = document.getElementById('search-input');
    const mobileInput = document.getElementById('mobile-search-input');

    if (desktopInput) {
      this.setupSearchInput(desktopInput, 'desktop');
    }

    if (mobileInput) {
      this.setupSearchInput(mobileInput, 'mobile');
    }
  };

  FuzzySearch.prototype.setupSearchInput = function (input, type) {
    const self = this;
    let timeoutId;
    const resultsContainer = this.createResultsContainer(input, type);

    // Lazy load: kick off fetch on first focus rather than on page load.
    input.addEventListener('focus', () => { self.ensureLoaded(); }, { once: true });

    input.addEventListener('input', (e) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
          self.ensureLoaded().then(() => {
            const results = self.search(query);
            self.displayResults(results, resultsContainer, query);
          });
        } else {
          self.hideResults(resultsContainer);
        }
      }, 200);
    });

    input.addEventListener('keydown', (e) => {
      self.handleKeyboardNavigation(e, resultsContainer);
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
        self.hideResults(resultsContainer);
      }
    });

    const form = input.closest('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = input.value.trim();
        if (query) {
          self.performSearch(query);
        }
      });
    }
  };

  FuzzySearch.prototype.createResultsContainer = function (input, type) {
    const container = document.createElement('div');
    container.className = 'search-results search-results-' + type;
    container.style.cssText = 'position: absolute; top: 100%; left: 0; right: 0; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--border-radius); box-shadow: var(--shadow-lg); max-height: 400px; overflow-y: auto; z-index: var(--z-index-dropdown); display: none;';

    const wrapper = input.closest('.header-search, .mobile-search-form');
    if (wrapper) {
      wrapper.style.position = 'relative';
      wrapper.appendChild(container);
    }

    return container;
  };

  FuzzySearch.prototype.displayResults = function (results, container, query) {
    if (results.length === 0) {
      container.innerHTML = '<div class="search-no-results" style="padding: var(--spacing-md); color: var(--color-text-secondary); text-align: center;">No pages found for "' + query + '"</div>';
    } else if (results.length === 1 && results[0].id === 'no-index') {
      const result = results[0];
      container.innerHTML = '<div class="search-no-results" style="padding: var(--spacing-md); color: var(--color-text-secondary); text-align: center;"><div style="font-weight: var(--font-weight-medium); margin-bottom: var(--spacing-xs);">' + result.title + '</div><div style="font-size: var(--font-size-sm);">' + result.summary + '</div></div>';
    } else {
      let resultsHTML = '';
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const bgColor = i === 0 ? 'background-color: var(--color-background);' : '';
        const displayText = result.summary || result.content || '';
        const truncatedText = this.truncateText(displayText, 100);

        resultsHTML += '<div class="search-result" style="padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--color-border); cursor: pointer; transition: background-color 0.2s; ' + bgColor + '" data-url="' + result.url + '" data-index="' + i + '">';
        resultsHTML += '<div class="search-result-title" style="font-weight: var(--font-weight-medium); color: var(--color-text-primary); margin-bottom: var(--spacing-xs);">' + result.highlight + '</div>';
        resultsHTML += '<div class="search-result-content" style="font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.4;">' + truncatedText + '</div>';
        resultsHTML += '<div class="search-result-type" style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--spacing-xs); text-transform: uppercase; letter-spacing: 0.5px;">PAGE</div>';
        resultsHTML += '</div>';
      }

      container.innerHTML = resultsHTML;

      const resultItems = container.querySelectorAll('.search-result');
      for (let j = 0; j < resultItems.length; j++) {
        this.attachResultHandlers(resultItems[j], container);
      }
    }

    container.style.display = 'block';
  };

  FuzzySearch.prototype.attachResultHandlers = function (item, container) {
    const self = this;
    if (item.dataset.url !== '#') {
      item.addEventListener('click', function () {
        window.location.href = this.dataset.url;
      });

      item.addEventListener('mouseenter', function () {
        self.setActiveResult(container, parseInt(this.dataset.index));
      });
    }
  };

  FuzzySearch.prototype.hideResults = function (container) {
    container.style.display = 'none';
  };

  FuzzySearch.prototype.handleKeyboardNavigation = function (e, container) {
    const results = container.querySelectorAll('.search-result');
    if (results.length === 0) return;

    const activeIndex = this.getActiveResultIndex(container);
    let newIndex = activeIndex;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        newIndex = activeIndex < results.length - 1 ? activeIndex + 1 : 0;
        break;
      case 'ArrowUp':
        e.preventDefault();
        newIndex = activeIndex > 0 ? activeIndex - 1 : results.length - 1;
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          window.location.href = results[activeIndex].dataset.url;
        }
        break;
      case 'Escape':
        this.hideResults(container);
        break;
    }

    if (newIndex !== activeIndex) {
      this.setActiveResult(container, newIndex);
    }
  };

  FuzzySearch.prototype.getActiveResultIndex = function (container) {
    const activeResult = container.querySelector('.search-result[style*="background-color"]');
    return activeResult ? parseInt(activeResult.dataset.index) : -1;
  };

  FuzzySearch.prototype.setActiveResult = function (container, index) {
    container.querySelectorAll('.search-result').forEach((item, i) => {
      if (i === index) {
        item.style.backgroundColor = 'var(--color-background)';
      } else {
        item.style.backgroundColor = '';
      }
    });
  };

  FuzzySearch.prototype.truncateText = function (text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  FuzzySearch.prototype.performSearch = function (query) {
    const searchUrl = '/search/?q=' + encodeURIComponent(query);
    window.location.href = searchUrl;
  };

  document.addEventListener('DOMContentLoaded', () => {
    new FuzzySearch({
      threshold: 0.2,
      maxResults: 8
    });
  });
})();
