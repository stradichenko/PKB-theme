(function() {
  'use strict';

  function FuzzySearch(options) {
    this.threshold = (options && options.threshold) || 0.3;
    this.maxResults = (options && options.maxResults) || 10;
    this.searchData = [];
    this.searchIndex = null;
    this.init();
  }

  FuzzySearch.prototype.init = function() {
    var self = this;
    this.loadSearchData().then(function() {
      self.setupSearchHandlers();
    });
  };

  FuzzySearch.prototype.loadSearchData = function() {
    var self = this;
    
    // Get base URL from Hugo-generated meta tag
    var metaBaseUrl = document.querySelector('meta[name="site-base-url"]');
    var basePath = metaBaseUrl ? metaBaseUrl.getAttribute('content').replace(/\/$/, '') : '';
    
    // Fallback for development environment
    if (!basePath && window.location.hostname === 'localhost') {
      basePath = '';
    }
    
    var indexUrl = basePath + '/index.json';
    var currentPath = window.location.pathname; // Define currentPath here
    
    return fetch(indexUrl)
      .then(function(response) {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Search index not found (HTTP ' + response.status + ') at ' + window.location.origin + indexUrl);
        }
      })
      .then(function(data) {
        if (Array.isArray(data) && data.length > 0) {
          // Check if we got debug info indicating no real content
          if (data.length === 1 && data[0].id === 'debug-info') {
            console.warn('Search index contains only debug info:', data[0].content);
            self.searchData = [];
          } else {
            self.searchData = data;
            console.log('Search index loaded with ' + data.length + ' pages');
          }
        } else {
          console.warn('Search index is empty or invalid');
          self.searchData = [];
        }
        self.buildSearchIndex();
      })
      .catch(function(error) {
        console.warn('Could not load search data:', error.message);
        console.info('GitHub Pages Debug: Ensure these Hugo config settings:');
        console.info('1. In hugo.toml: outputs.home = ["HTML", "RSS", "JSON"]');
        console.info('2. In params.toml: taxonomies.mainSections = ["posts", "docs", etc.]');
        console.info('3. File exists: layouts/index.json');
        console.info('4. Content exists in mainSections directories');
        console.info('5. For GitHub Pages: baseURL should match your site URL exactly');
        console.info('Current pathname:', currentPath);
        console.info('Constructed base path:', basePath);
        console.info('Final fetch URL:', window.location.origin + indexUrl);
        self.searchData = [];
        self.buildSearchIndex();
      });
  };

  FuzzySearch.prototype.buildSearchIndex = function() {
    var self = this;
    this.searchIndex = this.searchData.map(function(item) {
      return {
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
      };
    });
  };

  FuzzySearch.prototype.tokenize = function(text) {
    return text.split(/\s+/).filter(function(word) {
      return word.length > 2;
    });
  };

  FuzzySearch.prototype.fuzzyMatch = function(pattern, text) {
    var patternLength = pattern.length;
    var textLength = text.length;
    
    if (patternLength === 0) return { score: 1, matches: [] };
    if (textLength === 0) return { score: 0, matches: [] };
    
    var matches = [];
    var patternIndex = 0;
    var score = 0;
    var consecutiveMatches = 0;
    var maxConsecutive = 0;
    
    for (var textIndex = 0; textIndex < textLength && patternIndex < patternLength; textIndex++) {
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
    
    var matchRatio = patternLength / textLength;
    var consecutiveBonus = maxConsecutive / patternLength;
    var finalScore = (score / (textLength * patternLength)) + matchRatio + consecutiveBonus;
    
    return { score: finalScore, matches: matches };
  };

  FuzzySearch.prototype.calculateWordScore = function(queryWords, itemWords) {
    var self = this;
    var score = 0;
    for (var i = 0; i < queryWords.length; i++) {
      for (var j = 0; j < itemWords.length; j++) {
        var match = self.fuzzyMatch(queryWords[i], itemWords[j]);
        score += match.score;
      }
    }
    return score;
  };

  FuzzySearch.prototype.highlightMatches = function(text, query) {
    var escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var regex = new RegExp('(' + escapedQuery + ')', 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  FuzzySearch.prototype.search = function(query) {
    if (!query || query.length < 2) return [];
    
    if (this.searchIndex.length === 0) {
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
    
    var normalizedQuery = query.toLowerCase().trim();
    var queryWords = this.tokenize(normalizedQuery);
    var results = [];
    var self = this;

    for (var i = 0; i < this.searchIndex.length; i++) {
      var item = this.searchIndex[i];
      if (item.url === window.location.pathname) continue;
      
      var totalScore = 0;
      
      var directMatch = self.fuzzyMatch(normalizedQuery, item.searchText);
      if (directMatch.score > 0) {
        totalScore += directMatch.score * 2;
      }
      
      var titleScore = self.calculateWordScore(queryWords, item.titleWords) * 3;
      var contentScore = self.calculateWordScore(queryWords, item.contentWords);
      
      totalScore += titleScore + contentScore;
      
      if (item.title.toLowerCase().indexOf(normalizedQuery) !== -1) {
        totalScore += 5;
      }
      
      var escapedQuery = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var wordBoundaryRegex = new RegExp('\\b' + escapedQuery, 'i');
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

    results.sort(function(a, b) { 
      return b.score - a.score; 
    });
    
    return results.slice(0, this.maxResults);
  };

  FuzzySearch.prototype.setupSearchHandlers = function() {
    var desktopInput = document.getElementById('search-input');
    var mobileInput = document.getElementById('mobile-search-input');
    
    if (desktopInput) {
      this.setupSearchInput(desktopInput, 'desktop');
    }
    
    if (mobileInput) {
      this.setupSearchInput(mobileInput, 'mobile');
    }
  };

  FuzzySearch.prototype.setupSearchInput = function(input, type) {
    var self = this;
    var timeoutId;
    var resultsContainer = this.createResultsContainer(input, type);

    input.addEventListener('input', function(e) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function() {
        var query = e.target.value.trim();
        if (query.length >= 2) {
          var results = self.search(query);
          self.displayResults(results, resultsContainer, query);
        } else {
          self.hideResults(resultsContainer);
        }
      }, 200);
    });

    input.addEventListener('keydown', function(e) {
      self.handleKeyboardNavigation(e, resultsContainer);
    });

    document.addEventListener('click', function(e) {
      if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
        self.hideResults(resultsContainer);
      }
    });

    var form = input.closest('form');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var query = input.value.trim();
        if (query) {
          self.performSearch(query);
        }
      });
    }
  };

  FuzzySearch.prototype.createResultsContainer = function(input, type) {
    var container = document.createElement('div');
    container.className = 'search-results search-results-' + type;
    container.style.cssText = 'position: absolute; top: 100%; left: 0; right: 0; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--border-radius); box-shadow: var(--shadow-lg); max-height: 400px; overflow-y: auto; z-index: var(--z-index-dropdown); display: none;';

    var wrapper = input.closest('.header-search, .mobile-search-form');
    if (wrapper) {
      wrapper.style.position = 'relative';
      wrapper.appendChild(container);
    }

    return container;
  };

  FuzzySearch.prototype.displayResults = function(results, container, query) {
    var self = this;
    if (results.length === 0) {
      container.innerHTML = '<div class="search-no-results" style="padding: var(--spacing-md); color: var(--color-text-secondary); text-align: center;">No pages found for "' + query + '"</div>';
    } else if (results.length === 1 && results[0].id === 'no-index') {
      var result = results[0];
      container.innerHTML = '<div class="search-no-results" style="padding: var(--spacing-md); color: var(--color-text-secondary); text-align: center;"><div style="font-weight: var(--font-weight-medium); margin-bottom: var(--spacing-xs);">' + result.title + '</div><div style="font-size: var(--font-size-sm);">' + result.summary + '</div></div>';
    } else {
      var resultsHTML = '';
      for (var i = 0; i < results.length; i++) {
        var result = results[i];
        var bgColor = i === 0 ? 'background-color: var(--color-background);' : '';
        var displayText = result.summary || result.content || '';
        var truncatedText = this.truncateText(displayText, 100);
        
        resultsHTML += '<div class="search-result" style="padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--color-border); cursor: pointer; transition: background-color 0.2s; ' + bgColor + '" data-url="' + result.url + '" data-index="' + i + '">';
        resultsHTML += '<div class="search-result-title" style="font-weight: var(--font-weight-medium); color: var(--color-text-primary); margin-bottom: var(--spacing-xs);">' + result.highlight + '</div>';
        resultsHTML += '<div class="search-result-content" style="font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.4;">' + truncatedText + '</div>';
        resultsHTML += '<div class="search-result-type" style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--spacing-xs); text-transform: uppercase; letter-spacing: 0.5px;">PAGE</div>';
        resultsHTML += '</div>';
      }
      
      container.innerHTML = resultsHTML;

      var resultItems = container.querySelectorAll('.search-result');
      for (var j = 0; j < resultItems.length; j++) {
        this.attachResultHandlers(resultItems[j], container);
      }
    }

    container.style.display = 'block';
  };

  FuzzySearch.prototype.attachResultHandlers = function(item, container) {
    var self = this;
    if (item.dataset.url !== '#') {
      item.addEventListener('click', function() {
        window.location.href = this.dataset.url;
      });

      item.addEventListener('mouseenter', function() {
        self.setActiveResult(container, parseInt(this.dataset.index));
      });
    }
  };

  FuzzySearch.prototype.hideResults = function(container) {
    container.style.display = 'none';
  };

  FuzzySearch.prototype.handleKeyboardNavigation = function(e, container) {
    var results = container.querySelectorAll('.search-result');
    if (results.length === 0) return;

    var activeIndex = this.getActiveResultIndex(container);
    var newIndex = activeIndex;

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

  FuzzySearch.prototype.getActiveResultIndex = function(container) {
    var activeResult = container.querySelector('.search-result[style*="background-color"]');
    return activeResult ? parseInt(activeResult.dataset.index) : -1;
  };

  FuzzySearch.prototype.setActiveResult = function(container, index) {
    container.querySelectorAll('.search-result').forEach(function(item, i) {
      if (i === index) {
        item.style.backgroundColor = 'var(--color-background)';
      } else {
        item.style.backgroundColor = '';
      }
    });
  };

  FuzzySearch.prototype.truncateText = function(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  FuzzySearch.prototype.performSearch = function(query) {
    var searchUrl = '/search/?q=' + encodeURIComponent(query);
    window.location.href = searchUrl;
  };

  document.addEventListener('DOMContentLoaded', function() {
    new FuzzySearch({
      threshold: 0.2,
      maxResults: 8
    });
  });

})();
