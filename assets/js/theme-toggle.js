// Consolidated theme handling
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  // ThemeManager object with shared functionality
  const ThemeManager = {
    // Get current theme or default to user preference
    getCurrentTheme() {
      return document.documentElement.getAttribute('data-theme') || 
             (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    },
    
    // Apply theme to document and store in localStorage
    applyTheme(theme) {
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
      
      this.updateThemeToggleIcon(theme);
    },
    
    // Update toggle button appearance
    updateThemeToggleIcon(theme) {
      if (themeToggle) {
        if (theme === 'dark') {
          themeToggle.classList.add('dark-mode');
        } else {
          themeToggle.classList.remove('dark-mode');
        }
      }
    },
    
    // Toggle between light and dark themes
    toggleTheme() {
      const currentTheme = this.getCurrentTheme();
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      this.applyTheme(newTheme);
    }
  };
  
  // Initialize with current theme
  ThemeManager.applyTheme(ThemeManager.getCurrentTheme());
  
  // Set up event listener for toggle
  themeToggle.addEventListener('click', () => ThemeManager.toggleTheme());
  
  // Export for use in other scripts
  window.ThemeManager = ThemeManager;
});
