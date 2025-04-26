document.addEventListener('DOMContentLoaded', function() {
  const burger = document.getElementById('burger-menu');
  const nav = document.getElementById('main-nav');
  const mediaQuery = window.matchMedia('(max-width: 768px)');

  function toggleMenu() {
    const isExpanded = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', !isExpanded);
    nav.classList.toggle('active');
    // Prevent body scroll when menu is open
    document.body.style.overflow = isExpanded ? '' : 'hidden';
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
