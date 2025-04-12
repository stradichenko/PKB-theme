document.addEventListener('DOMContentLoaded', function () {
  // Select all list items within the TOC that have nested sub-lists.
  const tocItems = document.querySelectorAll('nav#TableOfContents li');

  tocItems.forEach(function (item) {
    const subList = item.querySelector('ul');
    if (subList) {
      // Check if this item is a top-level TOC entry.
      // If its parent <ul> is the direct child of nav#TableOfContents, skip adding a toggle.
      if (item.parentElement && item.parentElement.parentElement && item.parentElement.parentElement.id === 'TableOfContents') {
        return; // Do not add toggle for top-level H1/H2 entries.
      }

      // Create a toggle button with an inline Bootstrap SVG icon (chevron).
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'toc-toggle';
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.style.border = 'none';
      toggleBtn.style.background = 'none';
      toggleBtn.style.cursor = 'pointer';
      toggleBtn.style.marginRight = '0.5rem';
      toggleBtn.innerHTML = `
<div>
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
  </svg>
</div>`;

      // Prepend the toggle button to the current item.
      item.insertBefore(toggleBtn, item.firstChild);

      // Attach click event to handle toggling.
      toggleBtn.addEventListener('click', function (e) {
        e.stopPropagation(); // Prevent event bubbling.
        const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';

        toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
        // Toggle the display of the nested sub-list.
        subList.style.display = isExpanded ? 'none' : 'block';

        // Rotate the icon for a visual indicator.
        toggleBtn.querySelector('svg').style.transform = isExpanded ? 'rotate(-90deg)' : 'rotate(0deg)';
        toggleBtn.querySelector('svg').style.transition = 'transform 0.3s';
      });
    }
  });

  // Initialize heading tracking functionality
  initHeadingTracking();
});

// Function to track current headings and update the TOC
function initHeadingTracking() {
  // Get all headings in the content
  const headings = document.querySelectorAll('.post-content h1, .post-content h2, .post-content h3, .post-content h4, .post-content h5, .post-content h6');
  if (!headings.length) return;
  
  // Get all links in the TOC
  const tocLinks = document.querySelectorAll('nav#TableOfContents a');
  if (!tocLinks.length) return;
  
  // Create a mapping of heading IDs to TOC links
  const idToTOCLink = {};
  tocLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      const id = href.substring(1);
      idToTOCLink[id] = link;
    }
  });
  
  // Function to update active TOC item
  const updateActiveTOC = () => {
    // Find which heading is currently in view
    let currentHeading = null;
    const viewportHeight = window.innerHeight;
    const scrollPosition = window.scrollY;
    
    // Consider a heading "active" if it's in the top third of the viewport
    const activeZoneTop = scrollPosition;
    const activeZoneBottom = scrollPosition + (viewportHeight / 3);
    
    // Check each heading to see if it's in the active zone
    for (const heading of headings) {
      const rect = heading.getBoundingClientRect();
      const headingTop = rect.top + scrollPosition;
      
      // If heading is in active zone, or we've passed it and no other heading is active
      if ((headingTop >= activeZoneTop && headingTop <= activeZoneBottom) || 
          (headingTop < activeZoneTop && !currentHeading)) {
        currentHeading = heading;
      }
    }
    
    // Remove active class from all TOC links
    tocLinks.forEach(link => link.classList.remove('active'));
    
    // Add active class to the matching TOC link
    if (currentHeading && currentHeading.id) {
      const activeLink = idToTOCLink[currentHeading.id];
      if (activeLink) {
        activeLink.classList.add('active');
        
        // Expand parent items if they're collapsed
        expandParentItems(activeLink);
      }
    }
  };
  
  // Function to expand parent TOC items for the active link
  const expandParentItems = (activeLink) => {
    let parent = activeLink.parentElement;
    while (parent) {
      // If this is a list item with a toggle button
      if (parent.tagName === 'LI') {
        const toggleBtn = parent.querySelector('.toc-toggle');
        if (toggleBtn && toggleBtn.getAttribute('aria-expanded') === 'false') {
          // Simulate a click to expand
          toggleBtn.click();
        }
      }
      
      // If we found a ul that's hidden, make it visible
      if (parent.tagName === 'UL' && parent.style.display === 'none') {
        parent.style.display = 'block';
      }
      
      parent = parent.parentElement;
    }
  };
  
  // Use a throttled scroll event to improve performance
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActiveTOC();
        ticking = false;
      });
      ticking = true;
    }
  });
  
  // Initialize on page load
  updateActiveTOC();
}