/**
 * Critical JavaScript that needs to run before page rendering.
 * SINGLE SOURCE OF TRUTH for theme initialization.
 *
 * Loaded inline via partials/head/critical-css.html using safeJS so it
 * executes before stylesheets paint and avoids a flash of wrong theme.
 */
(function() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = savedTheme || (prefersDarkScheme.matches ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', currentTheme);

  const rootStyle = document.documentElement.style;
  if (currentTheme === 'dark') {
    rootStyle.setProperty('--critical-bg', 'var(--dark-background, #1a202c)');
    rootStyle.setProperty('--critical-text', 'var(--dark-text-primary, #e2e8ff)');
    rootStyle.backgroundColor = '#1a202c';
    rootStyle.color = '#e2e8ff';
  } else {
    rootStyle.setProperty('--critical-bg', 'var(--light-background, #275f85)');
    rootStyle.setProperty('--critical-text', 'var(--light-text-secondary, #cad6ff)');
    rootStyle.backgroundColor = '#275f85';
    rootStyle.color = '#cad6ff';
  }

  if (!savedTheme) {
    localStorage.setItem('theme', currentTheme);
  }

  // Track system preference only when the user hasn't picked a theme.
  prefersDarkScheme.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
})();
