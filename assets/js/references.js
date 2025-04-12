document.addEventListener('DOMContentLoaded', () => {
  console.log('References script loaded');
  
  // Create references with a delay to ensure the DOM is ready
  setTimeout(initReferences, 1000);
  
  // Also handle the custom event
  document.addEventListener('sidenotesProcessed', () => {
    console.log('Sidenotes processed event received');
    setTimeout(initReferences, 500);
  });
  
  // Listen for load event as well
  window.addEventListener('load', () => {
    console.log('Window loaded');
    setTimeout(initReferences, 500);
  });
});

function initReferences() {
  console.log('Initializing references');
  
  // Find all sidenotes on the page
  const sidenotes = document.querySelectorAll('.sidenote');
  console.log(`Found ${sidenotes.length} sidenotes`);
  
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
  // First check for post-content
  const postContent = document.querySelector('.post-content');
  if (postContent) {
    console.log('Found post-content, appending after it');
    // Insert after post-content
    postContent.insertAdjacentElement('afterend', referencesContainer);
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
