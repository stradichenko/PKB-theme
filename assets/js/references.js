document.addEventListener('DOMContentLoaded', () => {
  // Check if we're in print mode or about to print
  const isInPrintMode = window.matchMedia && window.matchMedia('print').matches;

  // Don't initialize if we're already in print mode
  if (isInPrintMode) {
    return;
  }

  let initialized = false;
  const safeInit = () => {
    if (initialized) return;
    initialized = true;
    initReferences();
  };

  // Primary trigger: sidenotes.js dispatches `sidenotes-ready` once positioning
  // settles. We also accept the legacy `sidenotesProcessed` event for safety.
  document.addEventListener('sidenotes-ready', safeInit, { once: true });
  document.addEventListener('sidenotesProcessed', safeInit, { once: true });

  // Defensive fallback: if neither event fires (e.g. sidenotes.js failed),
  // initialize after window load so references still render.
  window.addEventListener('load', safeInit);

  // Print layout is handled entirely by pdf-generator.js
  // Do NOT re-create references in beforeprint — it would duplicate them
});

function initReferences() {
  // Check if we're in the middle of printing or print prep
  if ((window.matchMedia && window.matchMedia('print').matches) ||
      document.body.classList.contains('pdf-printing')) {
    return;
  }

  // Find all sidenotes on the page - specifically look in sidenote-section for better reliability
  const sidenoteSection = document.querySelector('.sidenote-section');
  if (!sidenoteSection) {
    return;
  }

  const sidenotes = sidenoteSection.querySelectorAll('.sidenote');

  // Only proceed if sidenotes exist
  if (!sidenotes.length) return;

  // Remove any existing references section first
  const existingReferences = document.getElementById('sidenotes-references');
  if (existingReferences) {
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
  sidenotes.forEach((sidenote) => {
    const listItem = document.createElement('li');

    // Clone the sidenote content
    listItem.innerHTML = sidenote.innerHTML;

    // Remove any sidenote-specific classes from the cloned content
    const classesToRemove = ['sidenote', 'sidenote-hidden'];
    listItem.querySelectorAll('*').forEach((element) => {
      classesToRemove.forEach((className) => {
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
    // Append to main content, before comments if any
    const commentsSection = document.querySelector('.remark42-container');
    if (commentsSection) {
      commentsSection.insertAdjacentElement('beforebegin', referencesContainer);
    } else {
      mainContent.appendChild(referencesContainer);
    }
  }
}
