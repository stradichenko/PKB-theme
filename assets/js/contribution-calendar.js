document.addEventListener('DOMContentLoaded', function() {
  // Find all calendar cells
  const calendarCells = document.querySelectorAll('.calendar-cell');
  
  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'cell-tooltip';
  tooltip.style.display = 'none';
  document.body.appendChild(tooltip);
  
  // Add event listeners to cells
  calendarCells.forEach(cell => {
    cell.addEventListener('mouseover', function(e) {
      const date = this.getAttribute('data-date');
      const count = this.getAttribute('data-count');
      
      // Format date for display
      const formattedDate = new Date(date).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Set tooltip content
      tooltip.innerHTML = `
        <strong>${formattedDate}</strong><br>
        ${count} contribution${count !== '1' ? 's' : ''}
      `;
      
      // Position tooltip near mouse cursor
      tooltip.style.display = 'block';
      tooltip.style.left = (e.pageX + 10) + 'px';
      tooltip.style.top = (e.pageY + 10) + 'px';
    });
    
    cell.addEventListener('mousemove', function(e) {
      // Move tooltip with cursor
      tooltip.style.left = (e.pageX + 10) + 'px';
      tooltip.style.top = (e.pageY + 10) + 'px';
    });
    
    cell.addEventListener('mouseout', function() {
      // Hide tooltip
      tooltip.style.display = 'none';
    });
  });
  
  // Fix for mobile scrolling with month labels
  const calendarContainer = document.querySelector('.calendar-container');
  if (calendarContainer) {
    calendarContainer.addEventListener('scroll', function() {
      // This ensures month labels stay aligned when scrolling horizontally
      const scrollLeft = this.scrollLeft;
      const monthsContainer = this.querySelector('.calendar-months');
      if (monthsContainer) {
        monthsContainer.style.transform = `translateX(${scrollLeft}px)`;
      }
    });
  }
});
