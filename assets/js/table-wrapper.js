document.addEventListener('DOMContentLoaded', function() {
  // Find all tables in the content
  const tables = document.querySelectorAll('.post-content table');
  
  // Wrap each table with a div for horizontal scrolling on mobile
  tables.forEach(function(table) {
    // Skip if the table is already wrapped
    if (table.parentNode.classList.contains('table-container')) {
      return;
    }
    
    // Create a wrapper div
    const wrapper = document.createElement('div');
    wrapper.classList.add('table-container');
    
    // Replace the table with the wrapper
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
    
    console.log('Table wrapped for responsive display');
  });
});
