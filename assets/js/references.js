document.addEventListener('DOMContentLoaded', () => {
  console.log('References script loaded');
  
  // Check if we're in print mode or about to print
  const isInPrintMode = window.matchMedia && window.matchMedia('print').matches;
  
  // Don't initialize if we're already in print mode
  if (isInPrintMode) {
    console.log('Print mode detected, skipping references initialization');
    return;
  }
  
  // Create references with a delay to ensure the DOM is ready
  setTimeout(initReferences, 1500);
  
  // Also handle the custom event
  document.addEventListener('sidenotesProcessed', () => {
    console.log('sidenotesProcessed event received');
    setTimeout(initReferences, 800);
  });
  
  // Listen for load event as well
  window.addEventListener('load', () => {
    console.log('Window loaded');
    setTimeout(initReferences, 800);
  });
  
  // Print layout is handled entirely by pdf-generator.js
  // Do NOT re-create references in beforeprint — it would duplicate them
});

function initReferences() {
  console.log('Initializing references');
  
  // Check if we're in the middle of printing or print prep
  if ((window.matchMedia && window.matchMedia('print').matches) ||
      document.body.classList.contains('pdf-printing')) {
    console.log('Print mode active, skipping dynamic references creation');
    return;
  }
  
  // Find all sidenotes on the page - specifically look in sidenote-section for better reliability
  const sidenoteSection = document.querySelector('.sidenote-section');
  if (!sidenoteSection) {
    console.error('No sidenote section found');
    return;
  }
  
  const sidenotes = sidenoteSection.querySelectorAll('.sidenote');
  console.log(`Found ${sidenotes.length} sidenotes in sidenote section`);
  
  // Only proceed if sidenotes exist
  if (!sidenotes.length) return;
  
  // Remove any existing references section first
  const existingReferences = document.getElementById('sidenotes-references');
  if (existingReferences) {
    console.log('Removing existing references');
    existingReferences.remove();
  }
  
  // Create new references container
  const referencesContainer = document.createElement('div');
  referencesContainer.id = 'sidenotes-references';
  referencesContainer.className = 'references-container';
  
  // Add print-friendly attributes
  referencesContainer.setAttribute('data-print-ready', 'true');
  
  // Add heading
  const heading = document.createElement('h3');
  heading.className = 'references-title';
  heading.textContent = 'References';
  referencesContainer.appendChild(heading);
  
  // Create ordered list for the references
  const referencesList = document.createElement('ol');
  referencesList.className = 'references-list';
  
  // Add each sidenote to the list
  sidenotes.forEach((sidenote, index) => {
    const listItem = document.createElement('li');
    
    // Clone the sidenote content
    listItem.innerHTML = sidenote.innerHTML;
    
    // Remove any sidenote-specific classes from the cloned content
    const classesToRemove = ['sidenote', 'sidenote-hidden'];
    listItem.querySelectorAll('*').forEach(element => {
      classesToRemove.forEach(className => {
        if (element.classList.contains(className)) {
          element.classList.remove(className);
        }
      });
    });
    
    referencesList.appendChild(listItem);
  });
  
  // Add the list to the container
  referencesContainer.appendChild(referencesList);
  
  // Find the best place to insert the references
  const postContent = document.querySelector('.post-content');
  if (postContent) {
    console.log('Found post-content, appending after it');
    // Insert after post-content
    postContent.insertAdjacentElement('afterend', referencesContainer);
    
    // Force a layout recalculation to ensure visibility
    referencesContainer.offsetHeight;
    
    // Make sure the container is visible
    referencesContainer.style.display = 'block';
    
    // Mark as ready for print
    referencesContainer.classList.add('print-ready');
    
    return;
  }
  
  // Fallback to main-content
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    console.log('Found main-content, appending to it');
    // Append to main content, before comments if any
    const commentsSection = document.querySelector('.remark42-container');
    if (commentsSection) {
      console.log('Found comments section, inserting before it');
      commentsSection.insertAdjacentElement('beforebegin', referencesContainer);
    } else {
      console.log('No comments section found, appending to main content');
      mainContent.appendChild(referencesContainer);
    }
    return;
  }
  
  console.log('Could not find a suitable container for references');
}
