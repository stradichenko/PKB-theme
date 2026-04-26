// Search input clear-icon handling for the header search field.
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const clearSearch = document.getElementById('clear-search');

  if (!searchInput || !clearSearch) return;

  // Show clear icon when input has text
  if (searchInput.value.length > 0) {
    clearSearch.style.display = 'flex';
  }

  // Toggle clear icon based on input value
  searchInput.addEventListener('input', () => {
    clearSearch.style.display = searchInput.value.length > 0 ? 'flex' : 'none';
  });

  // Clear the search input when the cancel icon is clicked
  clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    clearSearch.style.display = 'none';
    searchInput.focus();
  });
});
