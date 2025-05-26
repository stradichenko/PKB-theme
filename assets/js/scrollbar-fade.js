/**
 * Scrollbar fade functionality for Chromium browsers
 * Makes scrollbars transparent when not active, maintains overlay positioning
 */

(function() {
  let scrollTimeouts = new Map();
  
  function addScrollingClass(element) {
    element.classList.add('scrolling');
    
    // Clear existing timeout for this element
    if (scrollTimeouts.has(element)) {
      clearTimeout(scrollTimeouts.get(element));
    }
    
    // Set timeout to make scrollbar transparent after scrolling stops
    const timeout = setTimeout(() => {
      element.classList.add('scrolling-fade');
      scrollTimeouts.delete(element);
    }, 500); // Faster fade - reduced from 1000ms to 500ms
    
    // Remove fade class when actively scrolling
    element.classList.remove('scrolling-fade');
    
    scrollTimeouts.set(element, timeout);
  }
  
  function handleScroll(event) {
    const element = event.target === document ? document.documentElement : event.target;
    
    // Only add scrolling class if element is actually scrollable
    if (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) {
      addScrollingClass(element);
    }
  }
  
  // Add scroll listeners using capture phase to catch all scroll events
  document.addEventListener('scroll', handleScroll, true);
  
  // Handle window scroll separately for body/html
  window.addEventListener('scroll', () => {
    addScrollingClass(document.documentElement);
  });
  
  // Handle mouse wheel events to show scrollbar immediately when user starts scrolling
  document.addEventListener('wheel', (event) => {
    const element = event.target.closest('*');
    if (element && (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth)) {
      addScrollingClass(element);
    }
  }, true);
  
  // Handle touch events for mobile scrolling
  let touchStartY = 0;
  let touchStartX = 0;
  
  document.addEventListener('touchstart', (event) => {
    touchStartY = event.touches[0].clientY;
    touchStartX = event.touches[0].clientX;
  }, true);
  
  document.addEventListener('touchmove', (event) => {
    const touchY = event.touches[0].clientY;
    const touchX = event.touches[0].clientX;
    const deltaY = Math.abs(touchY - touchStartY);
    const deltaX = Math.abs(touchX - touchStartX);
    
    // Only show scrollbar if there's significant movement
    if (deltaY > 5 || deltaX > 5) {
      const element = event.target.closest('*');
      if (element && (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth)) {
        addScrollingClass(element);
      }
    }
  }, true);
  
  // Handle keyboard navigation (arrow keys, page up/down, etc.)
  document.addEventListener('keydown', (event) => {
    const scrollKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'];
    
    if (scrollKeys.includes(event.key)) {
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.scrollHeight > activeElement.clientHeight || activeElement.scrollWidth > activeElement.clientWidth)) {
        addScrollingClass(activeElement);
      } else {
        // If no specific element is focused, apply to document
        addScrollingClass(document.documentElement);
      }
    }
  });
  
  // Cleanup function for when elements are removed from DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && scrollTimeouts.has(node)) {
          clearTimeout(scrollTimeouts.get(node));
          scrollTimeouts.delete(node);
        }
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
})();
