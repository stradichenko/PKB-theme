function initializeZipfsLaw(allWords) {
  // Clean and normalize words (remove punctuation, articles, etc.)
  const stopWords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as', 'of', 'this', 'that', 'these', 'those']);
  const cleanedWords = allWords
    .map(word => word.replace(/[^\w\s]|_/g, "").trim().toLowerCase())
    .filter(word => word.length > 2) // Filter out short words
    .filter(word => !stopWords.has(word)); // Filter out stop words
  
  // Count word frequencies
  const wordCounts = {};
  cleanedWords.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Calculate TOTAL words in entire corpus for accurate frequency representation
  const totalCorpusWords = cleanedWords.length;
  
  // Convert to array for sorting
  let wordArray = Object.entries(wordCounts).map(([word, count]) => ({ word, count }));
  
  // Sort by frequency (descending)
  wordArray.sort((a, b) => b.count - a.count);
  
  // Keep only top 150 words
  wordArray = wordArray.slice(0, 150);
  
  // Calculate total for percentage among the top words
  const totalTopWords = wordArray.reduce((sum, item) => sum + item.count, 0);
  
  // Add rank, percentage and ideal Zipf values
  wordArray.forEach((item, index) => {
    item.rank = index + 1;
    item.percentage = (item.count / totalTopWords * 100).toFixed(2);
    
    // Calculate ideal Zipf's Law value
    if (index === 0) {
      item.ideal = item.count;
      item.idealPercentage = item.percentage;
    } else {
      item.ideal = (wordArray[0].count / item.rank).toFixed(1);
      item.idealPercentage = (item.ideal / totalTopWords * 100).toFixed(2);
    }
  });
  
  // Populate the table
  populateZipfTable(wordArray, totalCorpusWords);
  
  // Create the Zipf's law chart
  createZipfChart(wordArray, 'zipf-chart');
  
  // Set up event listeners
  setupZipfEventListeners(wordArray);
}

function populateZipfTable(wordArray, totalCorpusWords) {
  const tableBody = document.querySelector('#zipf-data tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  wordArray.forEach(item => {
    const row = document.createElement('tr');
    
    // Add class if this is very close to the ideal Zipf's Law value
    const ratio = item.count / parseFloat(item.ideal);
    if (ratio > 0.9 && ratio < 1.1) {
      row.classList.add('zipf-ideal-row');
    }
    
    // Update frequency column to show count / total corpus words
    row.innerHTML = `
      <td>${item.rank}</td>
      <td>${item.word}</td>
      <td>${item.count} / ${totalCorpusWords} <small>(${(item.count/totalCorpusWords*100).toFixed(4)}%)</small></td>
      <td>${item.percentage}%</td>
      <td>${item.ideal} <small>(${item.idealPercentage}%)</small></td>
    `;
    tableBody.appendChild(row);
  });
  
  // Update the heading of the frequency column to indicate what it represents
  const tableHeader = document.querySelector('#zipf-data thead tr');
  if (tableHeader) {
    tableHeader.innerHTML = `
      <th>Rank</th>
      <th>Word</th>
      <th>Freq (n/${totalCorpusWords})</th>
      <th>Pr(%)</th>
      <th>Ideal</th>
    `;
  }
}

function setupZipfEventListeners(wordArray) {
  // Add resize listener for responsiveness
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      // Re-render chart when container size changes
      if (entry.target.id === 'zipf-chart') {
        createZipfChart(wordArray, 'zipf-chart');
      } else if (entry.target.id === 'zipf-fullscreen-chart' && 
                document.getElementById('zipf-fullscreen-overlay').classList.contains('active')) {
        createZipfChart(wordArray, 'zipf-fullscreen-chart');
      }
    }
  });
  
  // Observe chart containers for size changes
  const chartContainer = document.getElementById('zipf-chart');
  if (chartContainer) resizeObserver.observe(chartContainer);
  
  const fullscreenContainer = document.getElementById('zipf-fullscreen-chart');
  if (fullscreenContainer) resizeObserver.observe(fullscreenContainer);
  
  // Set up fullscreen functionality
  setupZipfFullscreen(wordArray);
  
  // Set up save functionality
  setupZipfSave();
}

function createZipfChart(data, containerId) {
  // Get current dimensions of the container
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const rect = container.getBoundingClientRect();
  const width = rect.width || 800; // Default width if rect is 0
  const height = containerId === 'zipf-fullscreen-chart' ? 
    window.innerHeight - 120 : 
    Math.max(400, rect.height || 400); // Use container height or default
  
  // Calculate margins based on container size
  // Use percentages for responsiveness, with minimums
  const marginPercent = {
    top: 0.05,    // 5% of height
    right: 0.05,  // 5% of width
    bottom: 0.1,  // 10% of height
    left: 0.1     // 10% of width
  };
  
  const margin = {
    top: Math.max(20, height * marginPercent.top),
    right: Math.max(30, width * marginPercent.right),
    bottom: Math.max(50, height * marginPercent.bottom),
    left: Math.max(60, width * marginPercent.left)
  };
  
  // Clear any existing SVG in the container
  container.innerHTML = '';
  
  // Create SVG with viewBox for better scaling
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%'); // Take full container width
  svg.setAttribute('height', '100%'); // Take full container height
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  container.appendChild(svg);
  
  // Create scales (using log scales for Zipf's law)
  const xScale = logScale(1, data.length, margin.left, width - margin.right);
  const yScale = logScale(1, data[0].count, height - margin.bottom, margin.top);
  
  // Create axes - with responsive tick sizes
  const tickSize = Math.max(1, Math.min(width, height) / 100); // Scale tick size based on chart size
  createAxis(svg, 'x', xScale, 'Rank', width, height, margin, tickSize);
  createAxis(svg, 'y', yScale, 'Frequency', width, height, margin, tickSize);
  
  // Create main content group with proper transform
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(g);
  
  // Calculate point radius based on chart size
  const basePointRadius = Math.max(3, Math.min(width, height) / 150);
  
  data.forEach(item => {
    // Create dot with responsive size
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', xScale(item.rank));
    circle.setAttribute('cy', yScale(item.count));
    circle.setAttribute('r', basePointRadius);
    circle.setAttribute('fill', 'var(--color-primary)');
    circle.setAttribute('class', 'zipf-point');
    
    // Add tooltip text
    circle.setAttribute('data-word', item.word);
    circle.setAttribute('data-freq', item.count);
    
    // Add word label for top words - with responsive font size
    if (item.rank <= 20) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', xScale(item.rank) + basePointRadius * 2);
      text.setAttribute('y', yScale(item.count));
      text.setAttribute('class', 'zipf-label');
      text.setAttribute('font-size', `${Math.max(8, width / 100)}px`); // Responsive font size
      text.textContent = item.word;
      g.appendChild(text);
    }
    
    // Add hover effects
    circle.addEventListener('mouseover', function(e) {
      this.setAttribute('r', basePointRadius * 1.5);
      showTooltip(e, item);
    });
    
    circle.addEventListener('mouseout', function() {
      this.setAttribute('r', basePointRadius);
      hideTooltip();
    });
    
    g.appendChild(circle);
  });
  
  // Add the best-fit line for Zipf's law - CONSTRAINED TO CHART BOUNDS
  const idealData = data.map((item, i) => {
    const idealCount = data[0].count / (i + 1);
    return { 
      rank: item.rank, 
      count: idealCount,
      // Ensure y-value is constrained within the chart boundaries
      constrainedCount: Math.max(1, Math.min(idealCount, data[0].count)) 
    };
  });
  
  // Create path element for the line
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  let d = `M ${xScale(idealData[0].rank)} ${yScale(idealData[0].constrainedCount)}`;
  
  for (let i = 1; i < idealData.length; i++) {
    // Only draw the line within the visible area
    const x = xScale(idealData[i].rank);
    const y = yScale(idealData[i].constrainedCount);
    
    // Check if the point is within the chart boundaries
    if (x >= margin.left && x <= (width - margin.right) && 
        y >= margin.top && y <= (height - margin.bottom)) {
      d += ` L ${x} ${y}`;
    }
  }
  
  line.setAttribute('d', d);
  line.setAttribute('stroke', 'var(--color-secondary)');
  line.setAttribute('stroke-width', tickSize); // Responsive line width
  line.setAttribute('fill', 'none');
  line.setAttribute('stroke-dasharray', `${tickSize*2.5},${tickSize*2.5}`); // Responsive dash pattern
  g.appendChild(line);
  
  // Add legend in the top-left corner to avoid button overlap
  const legendG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(legendG);
  
  // Calculate responsive legend position and size
  const legendWidth = width * 0.2; // 20% of chart width
  const legendHeight = height * 0.15; // 15% of chart height
  const legendX = margin.left + 10;
  const legendY = margin.top + 10;
  const legendFontSize = Math.max(8, width / 100); // Responsive font size
  
  // Legend background
  const legendBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  legendBg.setAttribute('x', legendX);
  legendBg.setAttribute('y', legendY);
  legendBg.setAttribute('width', legendWidth);
  legendBg.setAttribute('height', legendHeight);
  legendBg.setAttribute('fill', 'rgba(255,255,255,0.8)');
  legendBg.setAttribute('rx', '5');
  legendG.appendChild(legendBg);
  
  // Actual data point
  const dot1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  dot1.setAttribute('cx', legendX + legendWidth * 0.15);
  dot1.setAttribute('cy', legendY + legendHeight * 0.3);
  dot1.setAttribute('r', basePointRadius);
  dot1.setAttribute('fill', 'var(--color-primary)');
  legendG.appendChild(dot1);
  
  // Label for actual data
  const label1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  label1.setAttribute('x', legendX + legendWidth * 0.25);
  label1.setAttribute('y', legendY + legendHeight * 0.35);
  label1.setAttribute('class', 'zipf-label');
  label1.setAttribute('font-size', legendFontSize);
  label1.textContent = 'Actual Words';
  legendG.appendChild(label1);
  
  // Ideal line
  const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line1.setAttribute('x1', legendX + legendWidth * 0.05);
  line1.setAttribute('y1', legendY + legendHeight * 0.7);
  line1.setAttribute('x2', legendX + legendWidth * 0.2);
  line1.setAttribute('y2', legendY + legendHeight * 0.7);
  line1.setAttribute('stroke', 'var(--color-secondary)');
  line1.setAttribute('stroke-width', tickSize);
  line1.setAttribute('stroke-dasharray', `${tickSize*2.5},${tickSize*2.5}`);
  legendG.appendChild(line1);
  
  // Label for ideal line
  const label2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  label2.setAttribute('x', legendX + legendWidth * 0.25);
  label2.setAttribute('y', legendY + legendHeight * 0.75);
  label2.setAttribute('class', 'zipf-label');
  label2.setAttribute('font-size', legendFontSize);
  label2.textContent = 'Ideal Zipf\'s Law';
  legendG.appendChild(label2);
  
  return svg;
}

function createAxis(svg, type, scale, label, width, height, margin, tickSize) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(g);
  
  // Calculate font size based on chart dimensions
  const axisLabelSize = Math.max(8, Math.min(width, height) / 60);
  const axisTitleSize = Math.max(10, Math.min(width, height) / 50);
  
  if (type === 'x') {
    // Create x-axis line
    const axis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axis.setAttribute('x1', margin.left);
    axis.setAttribute('y1', height - margin.bottom);
    axis.setAttribute('x2', width - margin.right);
    axis.setAttribute('y2', height - margin.bottom);
    axis.setAttribute('stroke', 'var(--graph-text-color)');
    axis.setAttribute('stroke-width', tickSize);
    g.appendChild(axis);
    
    // Create tick marks and labels
    [1, 2, 5, 10, 20, 50, 100].forEach(tick => {
      if (tick <= 100) {
        const x = scale(tick);
        
        // Only draw if within the visible area
        if (x >= margin.left && x <= (width - margin.right)) {
          // Tick mark
          const tickMark = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          tickMark.setAttribute('x1', x);
          tickMark.setAttribute('y1', height - margin.bottom);
          tickMark.setAttribute('x2', x);
          tickMark.setAttribute('y2', height - margin.bottom + 6);
          tickMark.setAttribute('stroke', 'var(--graph-text-color)');
          tickMark.setAttribute('stroke-width', tickSize);
          g.appendChild(tickMark);
          
          // Label
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', x);
          text.setAttribute('y', height - margin.bottom + 20);
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('class', 'axis-label');
          text.setAttribute('font-size', axisLabelSize);
          text.textContent = tick;
          g.appendChild(text);
        }
      }
    });
    
    // Axis label
    const axisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    axisLabel.setAttribute('x', (width - margin.left - margin.right) / 2 + margin.left);
    axisLabel.setAttribute('y', height - margin.bottom / 3);
    axisLabel.setAttribute('text-anchor', 'middle');
    axisLabel.setAttribute('class', 'axis-title');
    axisLabel.setAttribute('font-size', axisTitleSize);
    axisLabel.textContent = label;
    g.appendChild(axisLabel);
    
  } else if (type === 'y') {
    // Create y-axis line
    const axis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axis.setAttribute('x1', margin.left);
    axis.setAttribute('y1', margin.top);
    axis.setAttribute('x2', margin.left);
    axis.setAttribute('y2', height - margin.bottom);
    axis.setAttribute('stroke', 'var(--graph-text-color)');
    axis.setAttribute('stroke-width', tickSize);
    g.appendChild(axis);
    
    // Create logarithmic tick marks
    [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000].forEach(tick => {
      const y = scale(tick);
      
      if (y >= margin.top && y <= height - margin.bottom) {
        // Tick mark
        const tickMark = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tickMark.setAttribute('x1', margin.left - 6);
        tickMark.setAttribute('y1', y);
        tickMark.setAttribute('x2', margin.left);
        tickMark.setAttribute('y2', y);
        tickMark.setAttribute('stroke', 'var(--graph-text-color)');
        tickMark.setAttribute('stroke-width', tickSize);
        g.appendChild(tickMark);
        
        // Label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', margin.left - 10);
        text.setAttribute('y', y + 4);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('class', 'axis-label');
        text.setAttribute('font-size', axisLabelSize);
        text.textContent = tick;
        g.appendChild(text);
      }
    });
    
    // Axis label
    const axisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    axisLabel.setAttribute('transform', `rotate(-90, ${margin.left/3}, ${height/2})`);
    axisLabel.setAttribute('x', margin.left/3);
    axisLabel.setAttribute('y', height/2);
    axisLabel.setAttribute('text-anchor', 'middle');
    axisLabel.setAttribute('class', 'axis-title');
    axisLabel.setAttribute('font-size', axisTitleSize);
    axisLabel.textContent = label;
    g.appendChild(axisLabel);
  }
}

function setupZipfFullscreen(data) {
  const fullscreenButton = document.getElementById('zipf-fullscreen-button');
  const fullscreenOverlay = document.getElementById('zipf-fullscreen-overlay');
  const closeFullscreenButton = document.getElementById('zipf-close-fullscreen');
  
  if (!fullscreenButton || !fullscreenOverlay || !closeFullscreenButton) return;
  
  fullscreenButton.addEventListener('click', function() {
    // Show fullscreen overlay
    fullscreenOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Create fullscreen graph with enhanced settings
    createZipfChart(data, 'zipf-fullscreen-chart');
    
    // Add resize listener for fullscreen responsiveness
    window.addEventListener('resize', function() {
      if (fullscreenOverlay.classList.contains('active')) {
        createZipfChart(data, 'zipf-fullscreen-chart');
      }
    });
  });
  
  closeFullscreenButton.addEventListener('click', function() {
    fullscreenOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
    window.removeEventListener('resize', null);
  });
}

function setupZipfSave() {
  // Setup save dropdown toggles
  setupSaveDropdown('zipf-save-button', 'zipf-save-options');
  setupSaveDropdown('zipf-fullscreen-save-button', 'zipf-fullscreen-save-options');
  
  // Handle save format selection
  const saveOptionButtons = document.querySelectorAll('.zipf-save-option');
  if (saveOptionButtons) {
    saveOptionButtons.forEach(button => {
      button.addEventListener('click', function() {
        const format = this.getAttribute('data-format');
        const target = this.getAttribute('data-target') || 'normal';
        
        // Export the correct graph
        if (target === 'fullscreen') {
          exportZipfGraph(format, 'zipf-fullscreen-chart');
        } else {
          exportZipfGraph(format, 'zipf-chart');
        }
        
        // Close the dropdown
        const dropdown = this.closest('.zipf-save-options');
        if (dropdown) {
          dropdown.classList.remove('active');
        }
        
        const button = dropdown.previousElementSibling;
        if (button) {
          button.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }
}

function setupSaveDropdown(buttonId, dropdownId) {
  const saveButton = document.getElementById(buttonId);
  const saveOptions = document.getElementById(dropdownId);
  
  if (saveButton && saveOptions) {
    // Toggle dropdown on button click
    saveButton.addEventListener('click', function() {
      const isExpanded = saveButton.getAttribute('aria-expanded') === 'true';
      saveButton.setAttribute('aria-expanded', !isExpanded);
      
      if (isExpanded) {
        saveOptions.classList.remove('active');
      } else {
        saveOptions.classList.add('active');
      }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      if (!saveButton.contains(event.target) && !saveOptions.contains(event.target)) {
        saveOptions.classList.remove('active');
        saveButton.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

function exportZipfGraph(format, containerId) {
  // Get the SVG element from the specified graph
  const svgElement = document.querySelector(`#${containerId} svg`);
  if (!svgElement) return;
  
  // Create a copy of the SVG to modify for export
  const svgCopy = svgElement.cloneNode(true);
  
  // Set explicit dimensions with higher resolution
  const width = svgElement.clientWidth * 2; // Double the resolution
  const height = svgElement.clientHeight * 2;
  svgCopy.setAttribute('width', width);
  svgCopy.setAttribute('height', height);
  svgCopy.setAttribute('viewBox', `0 0 ${svgElement.clientWidth} ${svgElement.clientHeight}`);
  
  // Add inline CSS with explicit styles to ensure visibility
  const styles = document.createElement('style');
  styles.textContent = `
    .zipf-point { 
      fill: var(--color-primary, #4a90e2); 
      stroke: #fff; 
      stroke-width: 1px;
      r: 4px;
    }
    path {
      stroke: var(--color-secondary, #df2d2d);
      stroke-width: 2px;
      fill: none;
      stroke-dasharray: 5, 5;
    }
    .zipf-label { 
      font-family: Arial, sans-serif; 
      font-size: 10px;
      fill: #333;
    }
    .axis-label { 
      font-family: Arial, sans-serif; 
      font-size: 10px;
      fill: #333;
    }
    .axis-title { 
      font-family: Arial, sans-serif; 
      font-size: 12px; 
      font-weight: bold;
      fill: #333;
    }
    line {
      stroke: #333;
      stroke-width: 1px;
    }
  `;
  svgCopy.insertBefore(styles, svgCopy.firstChild);
  
  // Set explicit colors for elements that might be using CSS variables
  svgCopy.querySelectorAll('circle').forEach(circle => {
    if (!circle.getAttribute('fill') || circle.getAttribute('fill').includes('var(--')) {
      circle.setAttribute('fill', '#4a90e2'); // Default to a visible blue color
    }
    // Make sure all points are visible
    circle.setAttribute('r', '4'); // Set explicit radius
  });
  
  svgCopy.querySelectorAll('path').forEach(path => {
    if (!path.getAttribute('stroke') || path.getAttribute('stroke').includes('var(--')) {
      path.setAttribute('stroke', '#df2d2d'); // Default to a visible red color
    }
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
  });
  
  // Get SVG as a string
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgCopy);
  
  if (format === 'svg') {
    // Download as SVG file
    downloadFile(svgString, 'zipf-law-graph.svg', 'image/svg+xml');
  } else {
    // For PNG and JPEG, convert SVG to image with higher resolution
    const canvas = document.createElement('canvas');
    // Set canvas dimensions to 2x for higher resolution
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Fill with white background for JPEG
    if (format === 'jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    }
    
    // Create image from SVG
    const img = new Image();
    img.onload = function() {
      ctx.drawImage(img, 0, 0, width, height);
      let mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      
      try {
        const dataURL = canvas.toDataURL(mimeType, 0.95);
        downloadFile(dataURL, `zipf-law-graph.${format}`, mimeType);
      } catch (e) {
        console.error("Failed to export graph:", e);
        alert("Failed to export the graph. Please try another format.");
      }
    };
    
    // Convert SVG to data URI
    const svg64 = btoa(unescape(encodeURIComponent(svgString)));
    const b64Start = 'data:image/svg+xml;base64,';
    img.src = b64Start + svg64;
  }
}

function downloadFile(data, filename, mimeType) {
  const blob = mimeType.startsWith('image/svg') 
    ? new Blob([data], { type: mimeType })
    : fetch(data).then(res => res.blob());
  
  const link = document.createElement('a');
  
  if (mimeType.startsWith('image/svg')) {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  } else {
    Promise.resolve(blob).then(blobData => {
      link.href = URL.createObjectURL(blobData);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }
}

function logScale(domainStart, domainEnd, rangeStart, rangeEnd) {
  const domainRatio = Math.log(domainEnd / domainStart);
  return function(x) {
    const logX = Math.log(x / domainStart);
    const scale = (rangeStart - rangeEnd) / domainRatio;
    return rangeStart - logX * scale;
  };
}

function showTooltip(event, data) {
  let tooltip = document.getElementById('zipf-tooltip');
  
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'zipf-tooltip';
    tooltip.className = 'zipf-tooltip';
    document.body.appendChild(tooltip);
  }
  
  const idealValue = parseFloat(data.ideal);
  const ratio = data.count / idealValue;
  const zipfFit = ratio > 0.9 && ratio < 1.1 ? 'Follows Zipf\'s Law well!' : 
                 ratio > 0.7 ? 'Close to Zipf\'s prediction' : 
                 'Deviates from Zipf\'s Law';
  
  tooltip.innerHTML = `
    <strong>${data.word}</strong><br>
    Rank: ${data.rank}<br>
    Frequency: ${data.count} (${data.percentage}%)<br>
    Ideal Zipf: ${data.ideal} (1/${(data.rank).toFixed(0)})<br>
    <em>${zipfFit}</em>
  `;
  
  const rect = event.target.getBoundingClientRect();
  tooltip.style.left = `${rect.left + window.scrollX + 10}px`;
  tooltip.style.top = `${rect.top + window.scrollY - 10}px`;
  tooltip.style.display = 'block';
}

function hideTooltip() {
  const tooltip = document.getElementById('zipf-tooltip');
  if (tooltip) {
    tooltip.style.display = 'none';
  }
}
