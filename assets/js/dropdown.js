/**
 * Dropdown Menu Functionality
 * Handles opening/closing of dropdown menus with keyboard and mouse support
 */

class DropdownManager {
  constructor() {
    this.dropdowns = [];
    this.init();
  }

  init() {
    // Find all dropdown elements
    const dropdownElements = document.querySelectorAll('.dropdown');
    
    dropdownElements.forEach(dropdown => {
      const toggle = dropdown.querySelector('.dropdown-toggle, [data-dropdown-toggle]');
      const menu = dropdown.querySelector('.dropdown-menu');
      
      if (toggle && menu) {
        this.dropdowns.push({ dropdown, toggle, menu });
        this.setupDropdown({ dropdown, toggle, menu });
      }
    });

    // Global click handler to close dropdowns
    document.addEventListener('click', this.handleGlobalClick.bind(this));
    
    // Global keyboard handler
    document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
  }

  setupDropdown({ dropdown, toggle, menu }) {
    // Click handler for toggle
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleDropdown(dropdown, toggle, menu);
    });

    // Keyboard navigation for toggle
    toggle.addEventListener('keydown', (e) => {
      this.handleToggleKeydown(e, dropdown, toggle, menu);
    });

    // Setup menu items
    const menuItems = menu.querySelectorAll('.dropdown-item');
    menuItems.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        this.handleMenuItemKeydown(e, menuItems, index, dropdown, toggle, menu);
      });
    });
  }

  toggleDropdown(dropdown, toggle, menu) {
    const isOpen = dropdown.classList.contains('open');
    
    // Close all other dropdowns first
    this.closeAllDropdowns();
    
    if (!isOpen) {
      this.openDropdown(dropdown, toggle, menu);
    } else {
      this.closeDropdown(dropdown, toggle, menu);
    }
  }

  openDropdown(dropdown, toggle, menu) {
    dropdown.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    
    // Focus first menu item
    const firstItem = menu.querySelector('.dropdown-item');
    if (firstItem) {
      setTimeout(() => firstItem.focus(), 100);
    }
  }

  closeDropdown(dropdown, toggle, menu) {
    dropdown.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  closeAllDropdowns() {
    this.dropdowns.forEach(({ dropdown, toggle, menu }) => {
      this.closeDropdown(dropdown, toggle, menu);
    });
  }

  handleGlobalClick(e) {
    // Close dropdowns if clicking outside
    if (!e.target.closest('.dropdown')) {
      this.closeAllDropdowns();
    }
  }

  handleGlobalKeydown(e) {
    if (e.key === 'Escape') {
      this.closeAllDropdowns();
      
      // Return focus to the last opened toggle
      const openDropdown = document.querySelector('.dropdown.open');
      if (openDropdown) {
        const toggle = openDropdown.querySelector('.dropdown-toggle, [data-dropdown-toggle]');
        if (toggle) toggle.focus();
      }
    }
  }

  handleToggleKeydown(e, dropdown, toggle, menu) {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.toggleDropdown(dropdown, toggle, menu);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!dropdown.classList.contains('open')) {
          this.openDropdown(dropdown, toggle, menu);
        } else {
          const firstItem = menu.querySelector('.dropdown-item');
          if (firstItem) firstItem.focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (dropdown.classList.contains('open')) {
          const lastItem = menu.querySelector('.dropdown-item:last-child');
          if (lastItem) lastItem.focus();
        }
        break;
    }
  }

  handleMenuItemKeydown(e, menuItems, currentIndex, dropdown, toggle, menu) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % menuItems.length;
        menuItems[nextIndex].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = currentIndex === 0 ? menuItems.length - 1 : currentIndex - 1;
        menuItems[prevIndex].focus();
        break;
      case 'Tab':
        if (!e.shiftKey && currentIndex === menuItems.length - 1) {
          this.closeDropdown(dropdown, toggle, menu);
        } else if (e.shiftKey && currentIndex === 0) {
          e.preventDefault();
          toggle.focus();
          this.closeDropdown(dropdown, toggle, menu);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        e.target.click();
        break;
    }
  }
}

// Initialize dropdown functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new DropdownManager();
});

// Re-initialize when new content is loaded (for dynamic content)
window.addEventListener('load', () => {
  // Check if dropdowns were already initialized
  if (!window.dropdownManager) {
    window.dropdownManager = new DropdownManager();
  }
});
