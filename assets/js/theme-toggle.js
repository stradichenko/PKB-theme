// Consolidated theme handling
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  // ThemeManager object with shared functionality
  const ThemeManager = {
    // Get current theme with proper priority order
    getCurrentTheme() {
      // First check localStorage for saved user preference
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme;
      }
      
      // Then check data-theme attribute
      const htmlTheme = document.documentElement.getAttribute('data-theme');
      if (htmlTheme) {
        return htmlTheme;
      }
      
      // Finally fall back to system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },
    
    // Apply theme to document and store in localStorage
    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      
      // Force critical colors directly based on core theme colors
      if (theme === 'dark') {
        document.documentElement.style.setProperty('--body-bg-color', 'var(--dark-background)', 'important');
        document.documentElement.style.setProperty('--main-bg-color', 'var(--dark-background)', 'important');
        document.documentElement.style.backgroundColor = 'var(--dark-background)';
        
        // Force critical container elements
        document.querySelectorAll('.container, .main-content, .layout-container, .content-container').forEach(el => {
          el.style.backgroundColor = 'var(--dark-background)';
          el.style.color = 'var(--dark-text-primary)';
        });
      } else {
        document.documentElement.style.setProperty('--body-bg-color', 'var(--light-background)', 'important');
        document.documentElement.style.setProperty('--main-bg-color', 'var(--light-background)', 'important');
        document.documentElement.style.backgroundColor = 'var(--light-background)';
        
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
        // Clear any existing content
        themeToggle.innerHTML = '';
        
        // Set appropriate icon based on current theme
        if (theme === 'dark') {
          // In dark mode, show sun icon (to switch to light)
          themeToggle.innerHTML = `
            <svg class="toggle-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          `;
          themeToggle.setAttribute('aria-label', 'Switch to light mode');
          themeToggle.setAttribute('title', 'Switch to light mode');
        } else {
          // In light mode, show moon icon (to switch to dark)
          themeToggle.innerHTML = `
            <svg class="toggle-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          `;
          themeToggle.setAttribute('aria-label', 'Switch to dark mode');
          themeToggle.setAttribute('title', 'Switch to dark mode');
        }
        
        // Apply theme-specific color to the icon
        const icon = themeToggle.querySelector('.toggle-icon');
        if (icon) {
          icon.style.color = 'var(--toggle-btn-color)';
        }
      }
    },
    
    // Toggle between light and dark themes
    toggleTheme() {
      const currentTheme = this.getCurrentTheme();
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      // Add transition class only when user clicks
      document.documentElement.classList.add('theme-transition');
      
      // Apply the new theme
      this.applyTheme(newTheme);
      
      // Remove transition class after animation completes
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 500);
    }
  };
  
  // Initialize with current theme - no animations on page load
  ThemeManager.applyTheme(ThemeManager.getCurrentTheme());
  
  // Set up event listener for toggle
  themeToggle.addEventListener('click', () => ThemeManager.toggleTheme());
  
  // Export for use in other scripts
  window.ThemeManager = ThemeManager;
});
