// Consolidated theme handling
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  // Build SVG icon nodes once and clone them on each toggle, instead of
  // re-parsing innerHTML every time the user flips the theme.
  const svgNS = 'http://www.w3.org/2000/svg';

  const buildSvg = (children) => {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'toggle-icon');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    children.forEach((child) => svg.appendChild(child));
    return svg;
  };

  const line = (x1, y1, x2, y2) => {
    const el = document.createElementNS(svgNS, 'line');
    el.setAttribute('x1', x1);
    el.setAttribute('y1', y1);
    el.setAttribute('x2', x2);
    el.setAttribute('y2', y2);
    return el;
  };

  const sunIconTemplate = (() => {
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '12');
    circle.setAttribute('r', '5');
    return buildSvg([
      circle,
      line('12', '1', '12', '3'),
      line('12', '21', '12', '23'),
      line('4.22', '4.22', '5.64', '5.64'),
      line('18.36', '18.36', '19.78', '19.78'),
      line('1', '12', '3', '12'),
      line('21', '12', '23', '12'),
      line('4.22', '19.78', '5.64', '18.36'),
      line('18.36', '5.64', '19.78', '4.22'),
    ]);
  })();

  const moonIconTemplate = (() => {
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
    return buildSvg([path]);
  })();

  // ThemeManager object with shared functionality
  const ThemeManager = {
    // Get current theme with proper priority order
    getCurrentTheme() {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme;

      const htmlTheme = document.documentElement.getAttribute('data-theme');
      if (htmlTheme) return htmlTheme;

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

        document.querySelectorAll('.container, .main-content, .layout-container, .content-container').forEach((el) => {
          el.style.backgroundColor = 'var(--dark-background)';
          el.style.color = 'var(--dark-text-primary)';
        });
      } else {
        document.documentElement.style.setProperty('--body-bg-color', 'var(--light-background)', 'important');
        document.documentElement.style.setProperty('--main-bg-color', 'var(--light-background)', 'important');
        document.documentElement.style.backgroundColor = 'var(--light-background)';

        document.querySelectorAll('.container, .main-content, .layout-container, .content-container').forEach((el) => {
          el.style.backgroundColor = '';
          el.style.color = '';
        });
      }

      this.updateThemeToggleIcon(theme);
    },

    // Update toggle button appearance
    updateThemeToggleIcon(theme) {
      // Replace existing icon by cloning a pre-built SVG node.
      themeToggle.replaceChildren();

      const icon = theme === 'dark'
        ? sunIconTemplate.cloneNode(true)
        : moonIconTemplate.cloneNode(true);
      icon.style.color = 'var(--toggle-btn-color)';
      themeToggle.appendChild(icon);

      const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      themeToggle.setAttribute('aria-label', label);
      themeToggle.setAttribute('title', label);
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
