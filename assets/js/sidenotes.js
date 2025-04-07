document.addEventListener('DOMContentLoaded', () => {
  // Find the sidenote section
  const sidenoteSection = document.querySelector('.sidenote-section');
  
  if (!sidenoteSection) return;
  
  // Get all sidenotes from the content
  const sidenotes = document.querySelectorAll('.sidenote');
  
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
    
    // Position the sidenote based on placeholder
    positionSidenote(placeholder, sidenote);
  });
  
  // Add scroll event listener to reposition sidenotes during scrolling
  window.addEventListener('scroll', () => {
    document.querySelectorAll('.sidenote-placeholder').forEach(placeholder => {
      const sidenoteId = placeholder.dataset.sidenoteId;
      const sidenote = document.getElementById(sidenoteId);
      
      if (sidenote) {
        positionSidenote(placeholder, sidenote);
      }
    });
  });
  
  // Also reposition on window resize
  window.addEventListener('resize', () => {
    document.querySelectorAll('.sidenote-placeholder').forEach(placeholder => {
      const sidenoteId = placeholder.dataset.sidenoteId;
      const sidenote = document.getElementById(sidenoteId);
      
      if (sidenote) {
        positionSidenote(placeholder, sidenote);
      }
    });
  });
});

// Function to position a sidenote relative to its placeholder
function positionSidenote(placeholder, sidenote) {
  // Get the vertical position of the placeholder
  const placeholderRect = placeholder.getBoundingClientRect();
  const sidenoteSection = document.querySelector('.sidenote-section');
  const sidenoteSectionRect = sidenoteSection.getBoundingClientRect();
  
  // Calculate the top position for the sidenote
  // This positions it at the same vertical level as the placeholder
  const topPosition = placeholderRect.top - sidenoteSectionRect.top;
  
  // Apply positioning to the sidenote
  sidenote.style.position = 'absolute';
  sidenote.style.top = `${Math.max(0, topPosition)}px`;
  sidenote.style.width = 'calc(100% - 20px)'; // Allow for padding
}
