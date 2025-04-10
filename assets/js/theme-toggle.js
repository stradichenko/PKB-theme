// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  // Apply the theme
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Force critical colors directly
    if (theme === 'dark') {
      document.documentElement.style.setProperty('--body-bg-color', '#1a202c', 'important');
      document.documentElement.style.setProperty('--main-bg-color', '#1a202c', 'important');
      document.documentElement.style.backgroundColor = '#1a202c';
      
      // Force critical container elements
      document.querySelectorAll('.container, .main-content, .layout-container, .content-container').forEach(el => {
        el.style.backgroundColor = '#1a202c';
        el.style.color = '#e2e8ff';
      });
    } else {
      document.documentElement.style.setProperty('--body-bg-color', '#275f85', 'important');
      document.documentElement.style.setProperty('--main-bg-color', '#275f85', 'important');
      document.documentElement.style.backgroundColor = '#275f85';
      
      // Reset forced styling
      document.querySelectorAll('.container, .main-content, .layout-container, .content-container').forEach(el => {
        el.style.backgroundColor = '';
        el.style.color = '';
      });
    }
    
    updateThemeToggleIcon(theme);
  }
  
  function updateThemeToggleIcon(theme) {
    if (theme === 'dark') {
      themeToggle.classList.add('dark-mode');
    } else {
      themeToggle.classList.remove('dark-mode');
    }
  }
  
  // Initialize with current theme
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(currentTheme);
  
  // Toggle theme when button is clicked
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
  });
});
