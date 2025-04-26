document.addEventListener('DOMContentLoaded', function() {
  const burger = document.getElementById('burger-menu');
  const nav = document.getElementById('main-nav');
  const mediaQuery = window.matchMedia('(max-width: 768px)');

  function toggleMenu() {
    const isExpanded = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', !isExpanded);
    
    // Toggle menu visibility
    if (!isExpanded) {
      nav.style.display = 'block';
      // Force reflow
      nav.offsetHeight;
      nav.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      nav.classList.remove('active');
      // Wait for transition before hiding
      setTimeout(() => {
        if (!nav.classList.contains('active')) {
          nav.style.display = 'none';
        }
      }, 300);
      document.body.style.overflow = '';
    }
  }

  function closeMenu() {
    burger.setAttribute('aria-expanded', 'false');
    nav.classList.remove('active');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (mediaQuery.matches && !nav.contains(e.target) && !burger.contains(e.target)) {
      closeMenu();
    }
  });

  // Close menu when pressing Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });

  // Close menu when screen size changes to desktop
  mediaQuery.addEventListener('change', (e) => {
    if (!e.matches) {
      closeMenu();
    }
  });
});
