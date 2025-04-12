/**
 * Critical JavaScript that needs to run before page rendering
 */
(function() {
  // Theme initialization
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = localStorage.getItem('theme') || 
                      (prefersDarkScheme.matches ? 'dark' : 'light');
  
  // Apply theme to document
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  // Apply critical colors directly to prevent flash
  document.documentElement.style.backgroundColor = 
    currentTheme === 'dark' ? '#1a202c' : '#275f85';
  document.documentElement.style.color = 
    currentTheme === 'dark' ? '#e2e8ff' : '#cad6ff';
    
  // Listen for theme preference changes
  prefersDarkScheme.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.setAttribute(
        'data-theme', 
        e.matches ? 'dark' : 'light'
      );
    }
  });
})();
