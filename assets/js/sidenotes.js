document.addEventListener('DOMContentLoaded', () => {
  // Find the sidenote section
  const sidenoteSection = document.querySelector('.sidenote-section');
  
  if (!sidenoteSection) return;
  
  // Get all sidenotes from the content
  const sidenotes = document.querySelectorAll('.sidenote');
  
  // Move each sidenote to the sidenote section
  sidenotes.forEach(sidenote => {
    // Clone the sidenote to keep a reference for positioning
    const placeholder = document.createElement('span');
    placeholder.classList.add('sidenote-placeholder');
    placeholder.dataset.sidenoteId = `sidenote-${Math.random().toString(36).substring(2, 9)}`;
    
    // Insert placeholder where the sidenote was
    sidenote.parentNode.insertBefore(placeholder, sidenote);
    
    // Move the actual sidenote to the sidenote section
    sidenoteSection.appendChild(sidenote);
  });
});
