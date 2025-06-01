// ✅ Constants organization
const CALENDAR_CONFIG = {
  TOOLTIP_OFFSET: 10,
  SCROLL_DEBOUNCE_MS: 16, // 60fps for smooth scrolling
  CELL_SELECTOR: '.calendar-cell',
  CONTAINER_SELECTOR: '.calendar-container',
  MONTHS_SELECTOR: '.calendar-months'
};

const TOOLTIP_STYLES = {
  display: 'none',
  position: 'absolute',
  zIndex: '1000',
  pointerEvents: 'none'
};

// ✅ Utility functions with error handling
const createTooltip = () => {
  const tooltip = document.createElement('div');
  tooltip.className = 'cell-tooltip';
  Object.assign(tooltip.style, TOOLTIP_STYLES);
  document.body.appendChild(tooltip);
  return tooltip;
};

const formatContributionDate = date => {
  try {
    return new Date(date).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting failed:', error);
    return 'Invalid date';
  }
};

const createTooltipContent = (date, count) => {
  const formattedDate = formatContributionDate(date);
  const plural = count !== '1' ? 's' : '';
  return `<strong>${formattedDate}</strong><br>${count} contribution${plural}`;
};

// ✅ Performance helper - debounced scroll
const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
};

// ✅ Tooltip position with boundary checking
const positionTooltip = (tooltip, x, y) => {
  const { innerWidth, innerHeight } = window;
  const rect = tooltip.getBoundingClientRect();
  
  const left = Math.min(x + CALENDAR_CONFIG.TOOLTIP_OFFSET, innerWidth - rect.width - 10);
  const top = Math.min(y + CALENDAR_CONFIG.TOOLTIP_OFFSET, innerHeight - rect.height - 10);
  
  Object.assign(tooltip.style, {
    left: `${Math.max(10, left)}px`,
    top: `${Math.max(10, top)}px`
  });
};

// ✅ Main calendar functionality with error boundaries
const initializeCalendar = () => {
  try {
    const calendarCells = document.querySelectorAll(CALENDAR_CONFIG.CELL_SELECTOR);
    if (!calendarCells.length) {
      console.warn('No calendar cells found');
      return;
    }

    const tooltip = createTooltip();
    
    // ✅ Event delegation for better performance
    document.addEventListener('mouseover', e => {
      const cell = e.target.closest(CALENDAR_CONFIG.CELL_SELECTOR);
      if (!cell) return;
      
      const { date, count } = cell.dataset;
      if (!date || count === undefined) return;
      
      tooltip.innerHTML = createTooltipContent(date, count);
      tooltip.style.display = 'block';
      positionTooltip(tooltip, e.pageX, e.pageY);
    });
    
    document.addEventListener('mousemove', e => {
      const cell = e.target.closest(CALENDAR_CONFIG.CELL_SELECTOR);
      if (!cell || tooltip.style.display === 'none') return;
      
      positionTooltip(tooltip, e.pageX, e.pageY);
    });
    
    document.addEventListener('mouseout', e => {
      const cell = e.target.closest(CALENDAR_CONFIG.CELL_SELECTOR);
      if (!cell) return;
      
      tooltip.style.display = 'none';
    });
    
    initializeScrollSync();
    
  } catch (error) {
    console.error('Calendar initialization failed:', error);
  }
};

// ✅ Scroll synchronization with performance optimization
const initializeScrollSync = () => {
  const calendarContainer = document.querySelector(CALENDAR_CONFIG.CONTAINER_SELECTOR);
  if (!calendarContainer) return;
  
  const monthsContainer = calendarContainer.querySelector(CALENDAR_CONFIG.MONTHS_SELECTOR);
  if (!monthsContainer) return;
  
  const handleScroll = debounce(() => {
    const { scrollLeft } = calendarContainer;
    monthsContainer.style.transform = `translateX(${scrollLeft}px)`;
  }, CALENDAR_CONFIG.SCROLL_DEBOUNCE_MS);
  
  calendarContainer.addEventListener('scroll', handleScroll, { passive: true });
};

// ✅ DOM ready with modern approach
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCalendar);
} else {
  initializeCalendar();
}

// ✅ Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initializeCalendar, formatContributionDate };
}
