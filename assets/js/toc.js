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
});