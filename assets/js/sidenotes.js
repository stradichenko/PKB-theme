const sidenoteState = {
  processedNotes: new Set(),
  ready: false,
  positions: new Map(),
  pendingUpdates: [],
  citationsReady: false,
};

const sidenoteEvents = {
  emit(event, data) {
    document.dispatchEvent(new CustomEvent(`sidenote:${event}`, { detail: data }));
  },
  on(event, callback) {
    document.addEventListener(`sidenote:${event}`, (e) => callback(e.detail));
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Find the sidenote section
  const sidenoteSection = document.querySelector('.sidenote-section');

  if (!sidenoteSection) {
    return;
  }

  // Get all sidenotes from the content
  const sidenotes = document.querySelectorAll('.sidenote');

  // Make sure all sidenotes are hidden initially
  sidenotes.forEach((sidenote) => {
    if (!sidenote.classList.contains('sidenote-hidden')) {
      sidenote.classList.add('sidenote-hidden');
    }
  });

  // Process each sidenote
  sidenotes.forEach((sidenote, index) => {
    // Create a unique ID for this sidenote if it doesn't have one
    const sidenoteId = `sidenote-${index}`;

    // Create a placeholder where the sidenote was
    const placeholder = document.createElement('span');
    placeholder.classList.add('sidenote-placeholder');
    placeholder.dataset.sidenoteId = sidenoteId;

    // Insert placeholder where the sidenote was
    sidenote.parentNode.insertBefore(placeholder, sidenote);

    // Move the actual sidenote to the sidenote section
    sidenoteSection.appendChild(sidenote);

    // Add ID to the sidenote for reference
    sidenote.id = sidenoteId;
  });

  // Configuration for positioning
  const minSpacingBetweenNotes = 20; // Minimum space between sidenotes in pixels
  let isPositioning = false; // Lock to prevent concurrent repositioning
  let initialPositioningComplete = false; // Track initial positioning

  // Position sidenotes with improved algorithm
  const positionAllSidenotes = () => {
    if (!sidenoteSection || isPositioning) return;

    // Set positioning lock
    isPositioning = true;

    // Make sure all sidenotes are hidden during positioning if this is initial positioning
    if (!initialPositioningComplete) {
      sidenotes.forEach((sidenote) => {
        if (!sidenote.classList.contains('sidenote-hidden')) {
          sidenote.classList.add('sidenote-hidden');
        }
      });
    }

    // Get sidenote section position
    const sectionRect = sidenoteSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // First, gather all sidenotes with their ideal positions
    const notesWithInfo = [];

    document.querySelectorAll('.sidenote-placeholder').forEach((placeholder) => {
      const sidenoteId = placeholder.dataset.sidenoteId;
      const sidenote = document.getElementById(sidenoteId);

      if (sidenote) {
        // Calculate the ideal position where this note would appear without adjustments
        const placeholderRect = placeholder.getBoundingClientRect();
        const idealTop = placeholderRect.top - sectionRect.top;

        // Check if placeholder is in the viewport
        const isPlaceholderVisible =
          placeholderRect.top < viewportHeight &&
          placeholderRect.bottom > 0;

        notesWithInfo.push({
          sidenote,
          idealTop,
          height: sidenote.offsetHeight,
          isVisible: isPlaceholderVisible
        });

        // Hide sidenote if reference point is not visible
        if (!isPlaceholderVisible && !sidenote.classList.contains('sidenote-hidden')) {
          sidenote.classList.add('sidenote-hidden');
        } else if (isPlaceholderVisible && initialPositioningComplete &&
                  sidenote.classList.contains('sidenote-hidden')) {
          sidenote.classList.remove('sidenote-hidden');
        }
      }
    });

    // Sort by ideal position to process from top to bottom
    notesWithInfo.sort((a, b) => a.idealTop - b.idealTop);

    // Position each sidenote, adjusting only when needed
    let lastBottom = -Infinity;

    notesWithInfo.forEach(({ sidenote, idealTop, height }) => {
      // The note should appear at its ideal position unless it would overlap
      let finalTop = idealTop;

      // If this would overlap with a previous note, move down
      if (lastBottom !== -Infinity && finalTop < lastBottom + minSpacingBetweenNotes) {
        finalTop = lastBottom + minSpacingBetweenNotes;
      }

      // Apply positioning
      sidenote.style.position = 'absolute';
      sidenote.style.top = `${Math.max(0, finalTop)}px`;

      // Update the bottom position for next note
      lastBottom = finalTop + height;

      // Emit position updates
      sidenoteState.positions.set(sidenote.id, finalTop);
      sidenoteEvents.emit('positionUpdate', {
        id: sidenote.id,
        position: finalTop
      });
    });

    // Ensure the sidenote section is tall enough
    if (lastBottom > 0) {
      sidenoteSection.style.minHeight = `${lastBottom + 50}px`;
    }

    // Apply theme styling
    updateSidenoteThemes();

    // Release positioning lock
    isPositioning = false;

    // Reveal sidenotes after a shorter delay to ensure all positioning is complete
    if (!initialPositioningComplete) {
      setTimeout(() => {
        sidenotes.forEach((sidenote) => {
          sidenote.classList.remove('sidenote-hidden');
        });
        initialPositioningComplete = true;

        // Dispatch ready events for downstream listeners (references.js, etc.)
        document.dispatchEvent(new CustomEvent('sidenotesProcessed'));
        document.dispatchEvent(new CustomEvent('sidenotes-ready'));
      }, 150);
    }

    if (!sidenoteState.ready) {
      sidenoteState.ready = true;
      sidenoteEvents.emit('ready', true);
    }
  };

  // Wait for citations to render (if any) before initial positioning.
  // Replaces the previous fixed 350ms setTimeout with an event/observer based
  // approach that resolves as soon as the relevant DOM exists.
  const waitForCitations = () => new Promise((resolve) => {
    // No citation sidenotes -> nothing to wait for.
    if (!document.querySelector('.citation-sidenote')) {
      resolve();
      return;
    }
    if (sidenoteState.citationsReady) {
      resolve();
      return;
    }

    // Resolve when bibtex.js dispatches citationsProcessed, OR when the DOM
    // shows citations have been replaced (fallback observer), OR after a hard
    // safety cap so positioning never blocks forever.
    let resolved = false;
    const finish = () => {
      if (resolved) return;
      resolved = true;
      observer.disconnect();
      document.removeEventListener('citationsProcessed', finish);
      clearTimeout(safetyCap);
      resolve();
    };

    document.addEventListener('citationsProcessed', finish, { once: true });

    const observer = new MutationObserver(() => {
      // Heuristic: once any citation-sidenote contains rendered children
      // (i.e. bibtex.js has processed it), proceed.
      const populated = document.querySelector('.citation-sidenote.citation-processed, .citation-sidenote [data-citation-processed]');
      if (populated) finish();
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true });

    // Safety cap so first positioning still happens on broken bibtex setups.
    const safetyCap = setTimeout(finish, 1500);
  });

  waitForCitations().then(positionAllSidenotes);

  // Add citation ready event listener
  document.addEventListener('citationsProcessed', () => {
    sidenoteState.citationsReady = true;
    positionAllSidenotes();
  });

  // Handle scroll events efficiently
  let scrollTimeout = null;
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    // Skip if already processing or minimal scroll change
    if (isPositioning || Math.abs(lastScrollY - window.scrollY) < 10) return;

    lastScrollY = window.scrollY;

    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }

    // Only reposition if section is in viewport
    scrollTimeout = window.requestAnimationFrame(() => {
      const sectionRect = sidenoteSection.getBoundingClientRect();
      if (sectionRect.top < window.innerHeight && sectionRect.bottom > 0) {
        positionAllSidenotes();
      }
      scrollTimeout = null;
    });
  });

  // Debounce function for handling events efficiently
  function debounce(func, wait) {
    let timeout;
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, arguments), wait);
    };
  }

  // Handle window resize with faster response
  window.addEventListener('resize', debounce(positionAllSidenotes, 150));

  // Handle image loading
  document.querySelectorAll('img, video, iframe').forEach((media) => {
    if (!media.complete) {
      media.addEventListener('load', debounce(positionAllSidenotes, 150));
    }
  });

  // Theme changes listener
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        updateSidenoteThemes();
        debounce(positionAllSidenotes, 150)();
      }
    });
  });

  // Start observing theme changes
  observer.observe(document.documentElement, { attributes: true });
});

// Function to force theme application to sidenotes
function updateSidenoteThemes() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const sidenotes = document.querySelectorAll('.sidenote');

  sidenotes.forEach((sidenote) => {
    // Clear any inline background/color styling that might interfere
    sidenote.style.removeProperty('background-color');
    sidenote.style.removeProperty('color');
    sidenote.style.removeProperty('border-color');

    // Apply theme-specific styling directly
    if (currentTheme === 'dark') {
      sidenote.style.backgroundColor = '#1e2a38';
      sidenote.style.color = '#e2e8ff';
      sidenote.style.borderColor = '#3a4755';
    } else {
      sidenote.style.backgroundColor = '';
      sidenote.style.color = '';
      sidenote.style.borderColor = '';
    }
  });
}

// Add citation synchronization
sidenoteEvents.on('citation:sync', (processedCitations) => {
  const relatedSidenotes = document.querySelectorAll('.sidenote[data-citation-key]');
  relatedSidenotes.forEach((sidenote) => {
    if (processedCitations.has(sidenote.dataset.citationKey)) {
      updateSidenoteWithCitation(sidenote);
    }
  });
});

// Handle citation updates
sidenoteEvents.on('citation:update', ({ key, data }) => {
  const sidenote = document.querySelector(`.sidenote[data-citation-key="${key}"]`);
  if (sidenote) {
    updateSidenoteContent(sidenote, data);
  }
});

// Add helper functions for updates
function updateSidenoteWithCitation(sidenote) {
  if (!sidenote.classList.contains('citation-linked')) {
    sidenote.classList.add('citation-linked');
    sidenoteEvents.emit('sidenoteLinked', {
      id: sidenote.id,
      citationKey: sidenote.dataset.citationKey
    });
  }
}
