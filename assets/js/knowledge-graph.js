/**
 * Knowledge Graph Module
 * Renders an interactive node graph of content relationships
 */
document.addEventListener('DOMContentLoaded', function() {
  // Graph configuration and state
  const config = {
    height: 500,
    physics: {
      chargeStrength: 100,
      linkDistance: 30,
      collisionRadiusMultiplier: 1.2,
      centerGravity: 0.1
    }
  };
  
  // ======================================================
  // DATA PROCESSING
  // ======================================================
  
  // Prepare graph data structure
  const graphData = {
    nodes: [],
    links: []
  };
  
  // Build a map of valid permalinks to simplify lookup later
  const validPermalinks = {};
  
  {{ range where site.AllPages "Kind" "page" }}
    {{ $permalink := .RelPermalink | jsonify }}
    {{ safeJS $permalink }}
    validPermalinks[{{ $permalink }}] = true;
    
    graphData.nodes.push({
      id: {{ $permalink }},
      title: {{ .Title | jsonify | safeJS }},
      url: {{ $permalink }},
      category: {{ with .Params.categories }}{{ index . 0 | default "uncategorized" | jsonify | safeJS }}{{ else }}"uncategorized"{{ end }},
      tags: {{ .Params.tags | default slice | jsonify | safeJS }},
      linksCount: 0
    });
  {{ end }}
  
  // Process content links
  {{ range where site.AllPages "Kind" "page" }}
    {{ $currentPermalink := .RelPermalink }}
    
    {{ with .Content }}
      {{ $content := . | string }}
      
      // Process HTML links
      {{ range findRE `<a href="(/[^"]+)"` $content }}
        {{ $match := . }}
        {{ $cleanURL := replaceRE `<a href="(/[^"]+)"` "$1" $match }}
        {{ $cleanURL = replaceRE `".*$` "" $cleanURL }}
        
        {{ if (hasPrefix $cleanURL "/") }}
          graphData.links.push({
            source: '{{ $currentPermalink }}',
            target: '{{ $cleanURL }}'
          });
        {{ end }}
      {{ end }}
      
      // Process Markdown links
      {{ range findRE `\[([^\]]+)\]\((/[^)]+)\)` $content }}
        {{ $match := . }}
        {{ $cleanURL := replaceRE `\[([^\]]+)\]\((/[^)]+)\)` "$2" $match }}
        {{ $cleanURL = replaceRE `\).*$` "" $cleanURL }}
        
        {{ if (hasPrefix $cleanURL "/") }}
          graphData.links.push({
            source: '{{ $currentPermalink }}',
            target: '{{ $cleanURL }}'
          });
        {{ end }}
      {{ end }}
    {{ end }}
  {{ end }}
  
  // Filter and clean data
  processGraphData(graphData, validPermalinks);
  
  // ======================================================
  // HELPER FUNCTIONS
  // ======================================================
  
  /**
   * Filter and process raw graph data
   */
  function processGraphData(graphData, validPermalinks) {
    // Validate data structures
    if (!Array.isArray(graphData.links) || !Array.isArray(graphData.nodes)) {
      console.error('Invalid graph data structure');
      return;
    }

    // Filter invalid links
    graphData.links = graphData.links.filter(link => {
      if (!link || !link.source || !link.target) return false;
      
      if (typeof link.target === 'string') {
        link.target = link.target.replace(/["']/g, '');
        if (link.target.startsWith('/tags/') || link.target.startsWith('/categories/')) {
          return false;
        }
        return validPermalinks[link.target] === true;
      }
      return false;
    });

    // Count links safely
    const linkCounts = new Map();
    graphData.links.forEach(link => {
      if (link && link.target) {
        const count = linkCounts.get(link.target) || 0;
        linkCounts.set(link.target, count + 1);
      }
    });

    // Update node link counts
    graphData.nodes.forEach(node => {
      if (node && node.id) {
        node.linksCount = linkCounts.get(node.id) || 0;
      }
    });
  }
  
  /**
   * Calculate node size based on connections
   */
  function calculateNodeSize(linkCount) {
    if (linkCount === 0) return 6;
    return Math.pow(linkCount, 0.7) * 4 + 8;
  }
  
  /**
   * Calculate font size based on node connections
   */
  function calculateFontSize(linkCount) {
    const baseFontSize = 10;
    if (linkCount === 0) return baseFontSize;
    return baseFontSize + Math.pow(linkCount, 0.5);
  }
  
  /**
   * Get high-contrast text color based on theme
   */
  function getCategoryTextColor() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDark ? 'var(--dark-text-primary)' : 'var(--light-text-primary)';
  }

  /**
   * Get theme-based colors for graph categories
   */
  function getThemeColors() {
    const computedStyle = getComputedStyle(document.documentElement);
    const categories = [...new Set(graphData.nodes.map(node => node.category))];
    const categoryColors = [];
    
    // Get predefined category colors
    for (let i = 1; i <= 15; i++) {
      const color = computedStyle.getPropertyValue(`--graph-category-${i}`).trim();
      if (color) categoryColors.push(color);
    }
    
    // Add fallbacks if needed
    if (categoryColors.length < categories.length) {
      categoryColors.push(
        `rgba(var(--light-primary-rgb), 0.8)`,
        `rgba(var(--light-secondary-rgb), 0.8)`,
        `rgba(var(--dark-primary-rgb), 0.8)`,
        `rgba(var(--dark-secondary-rgb), 0.8)`
      );
    }
    
    return categoryColors;
  }
  
  /**
   * Create legend for graph categories
   */
  function createLegend(categories, colorScale, containerSelector) {
    const legendContainer = d3.select(containerSelector);
    legendContainer.html('');
    
    // Add title
    legendContainer.append('div')
      .attr('class', 'legend-title')
      .text('Categories');
    
    // Create legend items
    const legendItems = legendContainer.selectAll('.legend-item')
      .data(categories)
      .enter()
      .append('div')
      .attr('class', 'legend-item');
    
    // Add color square
    legendItems.append('span')
      .attr('class', 'legend-color')
      .style('background-color', d => colorScale(d));
    
    // Add category text - ensure consistent styling
    legendItems.append('span')
      .attr('class', 'legend-text')
      .text(d => typeof d === 'string' ? d.replace(/^"|"$/g, '') : d);
  }
  
  // ======================================================
  // GRAPH RENDERING & INTERACTION
  // ======================================================
  
  /**
   * Create and render a force-directed graph
   */
  function createGraph(containerSelector, isFullscreen = false) {
    const container = document.getElementById(containerSelector);
    const width = container.clientWidth;
    const height = isFullscreen ? window.innerHeight * 0.9 : config.height;
    
    // Size multipliers for fullscreen mode
    const sizeMultiplier = isFullscreen ? 1.5 : 1;
    const fontMultiplier = isFullscreen ? 1.2 : 1;
    const chargeMultiplier = isFullscreen ? 2 : 1;
    
    // Create SVG container with zoom
    const svg = d3.select(`#${containerSelector}`)
      .append('svg')
      .attr('width', '100%')
      .attr('height', isFullscreen ? '100%' : height) // Use 100% height in fullscreen mode
      .call(d3.zoom().on('zoom', function(event) {
        g.attr('transform', event.transform);
      }));
    
    const g = svg.append('g');
    
    // Get category colors
    const categories = [...new Set(graphData.nodes.map(node => node.category))];
    const colorScale = d3.scaleOrdinal()
      .domain(categories)
      .range(getThemeColors());
    
    // Create force simulation
    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links)
        .id(d => d.id)
        .distance(config.physics.linkDistance * (isFullscreen ? 2 : 1)))
      .force('charge', d3.forceManyBody()
        .strength(d => -config.physics.chargeStrength * chargeMultiplier - 
                       calculateNodeSize(d.linksCount) * 8 * chargeMultiplier))
      .force('center', d3.forceCenter(width / 2, height / 2)
        .strength(config.physics.centerGravity))
      .force('collision', d3.forceCollide()
        .radius(d => calculateNodeSize(d.linksCount) * 
                    config.physics.collisionRadiusMultiplier * sizeMultiplier));
    
    // Add a filter state tracker to the simulation
    simulation.filterActive = false;
    simulation.filteredNodes = new Set();
    
    // Draw links
    const link = g.selectAll('.link')
      .data(graphData.links)
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke', 'var(--color-border)')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1);
    
    // Draw nodes
    const node = g.selectAll('.node')
      .data(graphData.nodes)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('r', d => calculateNodeSize(d.linksCount) * sizeMultiplier)
      .attr('fill', d => colorScale(d.category))
      .attr('stroke', isFullscreen ? 'var(--graph-node-stroke)' : '#fff')
      .attr('stroke-width', 1.5)
      .on('mouseover', (event, d) => highlightConnections(event, d, node, link, label))
      .on('mouseout', () => resetHighlightingPreserveFilter(node, link, label, simulation))
      .on('click', function(event, d) {
        window.open(d.url, '_blank');
      })
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', d => dragEnded(d, simulation)));
    
    // Draw labels
    const label = g.selectAll('.label')
      .data(graphData.nodes)
      .enter().append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em') // Position below node
      .text(d => d.title.replace(/^"|"$/g, ''))
      .style('font-size', d => `${calculateFontSize(d.linksCount) * fontMultiplier}px`)
      .style('fill', getCategoryTextColor)
      .style('font-weight', 'bold')
      .style('pointer-events', 'none');
    
    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
      
      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });
    
    // Drag functions
    function dragStarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragEnded(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      
      // Reapply filter if active
      if (simulation.filterActive) {
        reapplyFilter(node, link, label, simulation);
      }
    }
    
    // Create legend for this view
    createLegend(categories, colorScale, 
                 isFullscreen ? '.fullscreen-legend' : '.graph-legend');
    
    // Return the key components for external interaction
    return { 
      simulation, 
      node, 
      link, 
      label, 
      categories, 
      colorScale,
      width,
      height,
      container
    };
  }
  
  /**
   * Highlight connected nodes and links on hover
   */
  function highlightConnections(event, d, node, link, label) {
    // Find connected nodes
    const connectedNodeIds = new Set();
    connectedNodeIds.add(d.id);
    
    graphData.links.forEach(link => {
      if (link.source.id === d.id) {
        connectedNodeIds.add(link.target.id);
      } else if (link.target.id === d.id) {
        connectedNodeIds.add(link.source.id);
      }
    });
    
    // Apply highlighting classes
    node.classed('node-dim', n => !connectedNodeIds.has(n.id))
        .classed('node-highlight', n => n.id !== d.id && connectedNodeIds.has(n.id))
        .classed('node-active', n => n.id === d.id);
    
    link.classed('link-dim', l => !(connectedNodeIds.has(l.source.id) && connectedNodeIds.has(l.target.id)))
        .classed('link-highlight', l => (l.source.id === d.id || l.target.id === d.id));
    
    label.classed('label-dim', l => !connectedNodeIds.has(l.id))
         .classed('label-highlight', l => connectedNodeIds.has(l.id));
  }
  
  /**
   * Reset highlight state but preserve filter states
   */
  function resetHighlightingPreserveFilter(node, link, label, simulation) {
    node.classed('node-highlight', false)
        .classed('node-active', false);
    link.classed('link-highlight', false);
    label.classed('label-highlight', false);
    
    // Only reset dimming if filter is not active
    if (!simulation.filterActive) {
      node.classed('node-dim', false);
      link.classed('link-dim', false);
      label.classed('label-dim', false);
    } else {
      // Reapply filter dimming
      reapplyFilter(node, link, label, simulation);
    }
  }
  
  /**
   * Reapply filter state after interactions
   */
  function reapplyFilter(node, link, label, simulation) {
    if (!simulation.filterActive) return;
    
    // Re-dim nodes that are in the filtered set
    node.classed('node-dim', d => simulation.filteredNodes.has(d.id));
    
    // Update links visibility based on node visibility
    link.classed('link-dim', l => {
      const sourceVisible = !simulation.filteredNodes.has(l.source.id);
      const targetVisible = !simulation.filteredNodes.has(l.target.id);
      return !(sourceVisible && targetVisible);
    });
    
    // Update labels visibility based on node visibility
    label.classed('label-dim', d => simulation.filteredNodes.has(d.id));
  }
  
  // ======================================================
  // INITIALIZATION & EVENT HANDLING
  // ======================================================
  
  // Initialize main graph
  const mainGraph = createGraph('knowledge-graph');
  
  // Set up theme change detection
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.attributeName === 'data-theme') {
        // Update the color scale when theme changes
        mainGraph.colorScale.range(getThemeColors());
        
        // Update node colors
        d3.selectAll('.node').attr('fill', d => mainGraph.colorScale(d.category));
        
        // Update the legend
        createLegend(mainGraph.categories, mainGraph.colorScale, '.graph-legend');
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });
  
  // Setup physics controls toggle
  const toggleControlsBtn = document.getElementById('toggle-controls');
  const controlsPanel = document.getElementById('graph-controls-panel');
  
  toggleControlsBtn.addEventListener('click', function() {
    const isExpanded = toggleControlsBtn.getAttribute('aria-expanded') === 'true';
    toggleControlsBtn.setAttribute('aria-expanded', !isExpanded);
    
    if (isExpanded) {
      controlsPanel.classList.add('collapsed');
      toggleControlsBtn.classList.remove('expanded');
    } else {
      controlsPanel.classList.remove('collapsed');
      toggleControlsBtn.classList.add('expanded');
    }
  });
  
  // Setup physics control sliders
  setupPhysicsControls(mainGraph.simulation);
  
  // Setup fullscreen functionality
  setupFullscreenMode();
  
  /**
   * Set up interactive physics controls
   */
  function setupPhysicsControls(simulation) {
    const chargeSlider = document.getElementById('charge-strength');
    const linkDistanceSlider = document.getElementById('link-distance');
    const collisionRadiusSlider = document.getElementById('collision-radius');
    const centerGravitySlider = document.getElementById('center-gravity');
    const resetButton = document.getElementById('reset-physics');
    
    // Update force parameters when sliders change
    chargeSlider.addEventListener('input', function() {
      const value = parseInt(this.value);
      const valueDisplay = this.previousElementSibling;
      valueDisplay.textContent = value;
      config.physics.chargeStrength = value;
      simulation.force('charge', d3.forceManyBody()
        .strength(d => -config.physics.chargeStrength - calculateNodeSize(d.linksCount) * 8));
      simulation.alpha(0.3).restart();
    });
    
    linkDistanceSlider.addEventListener('input', function() {
      const value = parseInt(this.value);
      const valueDisplay = this.previousElementSibling;
      valueDisplay.textContent = value;
      config.physics.linkDistance = value;
      simulation.force('link', d3.forceLink(graphData.links).id(d => d.id).distance(value));
      simulation.alpha(0.3).restart();
    });
    
    collisionRadiusSlider.addEventListener('input', function() {
      const value = parseFloat(this.value);
      const valueDisplay = this.previousElementSibling;
      valueDisplay.textContent = value + '×';
      config.physics.collisionRadiusMultiplier = value;
      simulation.force('collision', d3.forceCollide()
        .radius(d => calculateNodeSize(d.linksCount) * value));
      simulation.alpha(0.3).restart();
    });
    
    centerGravitySlider.addEventListener('input', function() {
      const value = parseFloat(this.value);
      const valueDisplay = this.previousElementSibling;
      valueDisplay.textContent = value;
      config.physics.centerGravity = value;
      simulation.force('center')
        .strength(value);
      simulation.alpha(0.3).restart();
    });
    
    // Reset to default values
    resetButton.addEventListener('click', function() {
      // Reset UI
      chargeSlider.value = 100;
      chargeSlider.previousElementSibling.textContent = 100;
      
      linkDistanceSlider.value = 30;
      linkDistanceSlider.previousElementSibling.textContent = 30;
      
      collisionRadiusSlider.value = 1.2;
      collisionRadiusSlider.previousElementSibling.textContent = '1.2×';
      
      centerGravitySlider.value = 0.1;
      centerGravitySlider.previousElementSibling.textContent = 0.1;
      
      // Reset config
      config.physics = {
        chargeStrength: 100,
        linkDistance: 30,
        collisionRadiusMultiplier: 1.2,
        centerGravity: 0.1
      };
      
      // Update forces
      simulation
        .force('charge', d3.forceManyBody()
          .strength(d => -config.physics.chargeStrength - calculateNodeSize(d.linksCount) * 8))
        .force('link', d3.forceLink(graphData.links)
          .id(d => d.id).distance(config.physics.linkDistance))
        .force('collision', d3.forceCollide()
          .radius(d => calculateNodeSize(d.linksCount) * config.physics.collisionRadiusMultiplier))
        .force('center', d3.forceCenter(
          document.getElementById('knowledge-graph').clientWidth / 2, 
          config.height / 2).strength(config.physics.centerGravity));
      
      simulation.alpha(0.3).restart();
    });
  }
  
  /**
   * Set up fullscreen mode functionality
   */
  function setupFullscreenMode() {
    const fullscreenButton = document.getElementById('fullscreen-button');
    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    const closeFullscreenButton = document.getElementById('close-fullscreen');
    let fullscreenGraph = null;
    
    fullscreenButton.addEventListener('click', function() {
      // Show fullscreen overlay
      fullscreenOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      
      // Clear the fullscreen graph area
      const fullscreenGraphContainer = document.getElementById('fullscreen-graph');
      if (fullscreenGraphContainer) {
        fullscreenGraphContainer.innerHTML = '';
      }
      
      // Create fullscreen graph with enhanced settings
      fullscreenGraph = createGraph('fullscreen-graph', true);
      
      // Set up fullscreen controls
      setupFullscreenControls(fullscreenGraph);
      
      // Set up fullscreen filters
      setupFullscreenGraphFilters(fullscreenGraph);
    });
    
    closeFullscreenButton.addEventListener('click', function() {
      fullscreenOverlay.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
      fullscreenGraph = null; // Clear reference
    });
  }
  
  /**
   * Set up fullscreen controls with proper event handling
   */
  function setupFullscreenControls(fullscreenGraph) {
    if (!fullscreenGraph || !fullscreenGraph.simulation) return;
    
    // First remove any existing event listeners (if present)
    removeExistingListeners();
    
    // Then set up new listeners
    const toggleControlsBtn = document.getElementById('fullscreen-toggle-controls');
    const controlsPanel = document.getElementById('fullscreen-graph-controls-panel');
    
    // Fullscreen config defaults
    const fullscreenConfig = {
      physics: {
        chargeStrength: 200,
        linkDistance: 60,
        collisionRadiusMultiplier: 1.8,
        centerGravity: 0.1
      }
    };
    
    // Toggle controls panel
    if (toggleControlsBtn && controlsPanel) {
      toggleControlsBtn.addEventListener('click', function() {
        const isExpanded = toggleControlsBtn.getAttribute('aria-expanded') === 'true';
        toggleControlsBtn.setAttribute('aria-expanded', !isExpanded);
        
        if (isExpanded) {
          controlsPanel.classList.add('collapsed');
          toggleControlsBtn.classList.remove('expanded');
        } else {
          controlsPanel.classList.remove('collapsed');
          toggleControlsBtn.classList.add('expanded');
        }
      });
    }
    
    // Physics sliders
    setupPhysicsSliders(fullscreenGraph, fullscreenConfig);
  }
  
  /**
   * Remove any existing event listeners to prevent duplicates
   */
  function removeExistingListeners() {
    // Toggle button
    const oldToggleBtn = document.getElementById('fullscreen-toggle-controls');
    if (oldToggleBtn) {
      const newToggleBtn = oldToggleBtn.cloneNode(true);
      if (oldToggleBtn.parentNode) {
        oldToggleBtn.parentNode.replaceChild(newToggleBtn, oldToggleBtn);
      }
    }
    
    // Physics sliders
    replaceControlElement('fullscreen-charge-strength');
    replaceControlElement('fullscreen-link-distance');
    replaceControlElement('fullscreen-collision-radius');
    replaceControlElement('fullscreen-center-gravity');
    
    // Reset button
    replaceControlElement('fullscreen-reset-physics');
  }
  
  /**
   * Helper to replace an element with a clone to remove event listeners
   */
  function replaceControlElement(id) {
    const oldElement = document.getElementById(id);
    if (oldElement && oldElement.parentNode) {
      const newElement = oldElement.cloneNode(true);
      oldElement.parentNode.replaceChild(newElement, oldElement);
    }
  }
  
  /**
   * Set up physics sliders for fullscreen mode
   */
  function setupPhysicsSliders(fullscreenGraph, config) {
    // Charge slider
    const chargeSlider = document.getElementById('fullscreen-charge-strength');
    if (chargeSlider) {
      chargeSlider.addEventListener('input', function() {
        const value = parseInt(this.value);
        const valueDisplay = this.previousElementSibling;
        if (valueDisplay) valueDisplay.textContent = value;
        
        config.physics.chargeStrength = value;
        fullscreenGraph.simulation.force('charge', d3.forceManyBody()
          .strength(d => -value - calculateNodeSize(d.linksCount) * 15));
        fullscreenGraph.simulation.alpha(0.3).restart();
      });
    }
    
    // Link distance slider
    const linkDistanceSlider = document.getElementById('fullscreen-link-distance');
    if (linkDistanceSlider) {
      linkDistanceSlider.addEventListener('input', function() {
        const value = parseInt(this.value);
        const valueDisplay = this.previousElementSibling;
        if (valueDisplay) valueDisplay.textContent = value;
        
        config.physics.linkDistance = value;
        fullscreenGraph.simulation.force('link', d3.forceLink(graphData.links)
          .id(d => d.id).distance(value));
        fullscreenGraph.simulation.alpha(0.3).restart();
      });
    }
    
    // Collision radius slider
    const collisionRadiusSlider = document.getElementById('fullscreen-collision-radius');
    if (collisionRadiusSlider) {
      collisionRadiusSlider.addEventListener('input', function() {
        const value = parseFloat(this.value);
        const valueDisplay = this.previousElementSibling;
        if (valueDisplay) valueDisplay.textContent = value + '×';
        
        config.physics.collisionRadiusMultiplier = value;
        fullscreenGraph.simulation.force('collision', d3.forceCollide()
          .radius(d => calculateNodeSize(d.linksCount) * value * 1.5));
        fullscreenGraph.simulation.alpha(0.3).restart();
      });
    }
    
    // Center gravity slider
    const centerGravitySlider = document.getElementById('fullscreen-center-gravity');
    if (centerGravitySlider) {
      centerGravitySlider.addEventListener('input', function() {
        const value = parseFloat(this.value);
        const valueDisplay = this.previousElementSibling;
        if (valueDisplay) valueDisplay.textContent = value;
        
        config.physics.centerGravity = value;
        fullscreenGraph.simulation.force('center').strength(value);
        fullscreenGraph.simulation.alpha(0.3).restart();
      });
    }
    
    // Reset button
    const resetButton = document.getElementById('fullscreen-reset-physics');
    if (resetButton && fullscreenGraph.simulation) {
      resetButton.addEventListener('click', function() {
        // Reset UI values
        if (chargeSlider) {
          chargeSlider.value = 200;
          const chargeDisplay = chargeSlider.previousElementSibling;
          if (chargeDisplay) chargeDisplay.textContent = '200';
        }
        
        if (linkDistanceSlider) {
          linkDistanceSlider.value = 60;
          const linkDistDisplay = linkDistanceSlider.previousElementSibling;
          if (linkDistDisplay) linkDistDisplay.textContent = '60';
        }
        
        if (collisionRadiusSlider) {
          collisionRadiusSlider.value = 1.8;
          const collisionDisplay = collisionRadiusSlider.previousElementSibling;
          if (collisionDisplay) collisionDisplay.textContent = '1.8×';
        }
        
        if (centerGravitySlider) {
          centerGravitySlider.value = 0.1;
          const gravityDisplay = centerGravitySlider.previousElementSibling;
          if (gravityDisplay) gravityDisplay.textContent = '0.1';
        }
        
        // Reset physics configuration
        config.physics = {
          chargeStrength: 200,
          linkDistance: 60,
          collisionRadiusMultiplier: 1.8,
          centerGravity: 0.1
        };
        
        // Apply reset values to forces
        const width = fullscreenGraph.container ? fullscreenGraph.container.clientWidth : window.innerWidth;
        const height = fullscreenGraph.container ? fullscreenGraph.container.clientHeight : window.innerHeight * 0.9;
        
        fullscreenGraph.simulation
          .force('charge', d3.forceManyBody()
            .strength(d => -config.physics.chargeStrength - calculateNodeSize(d.linksCount) * 15))
          .force('link', d3.forceLink(graphData.links)
            .id(d => d.id).distance(config.physics.linkDistance))
          .force('collision', d3.forceCollide()
            .radius(d => calculateNodeSize(d.linksCount) * config.physics.collisionRadiusMultiplier * 1.5))
          .force('center', d3.forceCenter(width / 2, height / 2)
            .strength(config.physics.centerGravity));
        
        fullscreenGraph.simulation.alpha(0.3).restart();
      });
    }
  }
  
  /**
   * Set up graph export functionality
   */
  function setupGraphExport() {
    setupExportDropdown('save-graph-button', 'save-options');
    setupExportDropdown('fullscreen-save-button', 'fullscreen-save-options');
    
    // Handle save format selection for both normal and fullscreen views
    const saveOptionButtons = document.querySelectorAll('.save-option');
    if (saveOptionButtons) {
      saveOptionButtons.forEach(button => {
        button.addEventListener('click', function() {
          const format = this.getAttribute('data-format');
          const target = this.getAttribute('data-target');
          
          // Export the correct graph based on the target
          if (target === 'fullscreen') {
            exportGraph(format, 'fullscreen-graph');
          } else {
            exportGraph(format, 'knowledge-graph');
          }
          
          // Close the dropdown
          const dropdown = this.closest('.save-options-dropdown');
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
  
  /**
   * Setup dropdown toggle behavior
   */
  function setupExportDropdown(buttonId, dropdownId) {
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
  
  /**
   * Export the graph as an image
   */
  function exportGraph(format, containerId) {
    // Get the SVG element from the specified graph
    const svgElement = document.querySelector(`#${containerId} svg`);
    if (!svgElement) return;
    
    // Create a copy of the SVG to modify for export
    const svgCopy = svgElement.cloneNode(true);
    
    // Set explicit dimensions
    const width = svgElement.clientWidth;
    const height = svgElement.clientHeight;
    svgCopy.setAttribute('width', width);
    svgCopy.setAttribute('height', height);
    
    // Fix the viewBox
    if (!svgCopy.getAttribute('viewBox')) {
      svgCopy.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }
    
    // Add inline CSS
    const styles = document.createElement('style');
    styles.textContent = getComputedStyles();
    svgCopy.insertBefore(styles, svgCopy.firstChild);
    
    // Get SVG as a string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgCopy);
    
    if (format === 'svg') {
      // Download as SVG file
      downloadFile(svgString, 'knowledge-graph.svg', 'image/svg+xml');
    } else {
      // For PNG and JPEG, convert SVG to image
      const canvas = document.createElement('canvas');
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
        ctx.drawImage(img, 0, 0);
        let mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        
        try {
          const dataURL = canvas.toDataURL(mimeType, 0.95);
          downloadFile(dataURL, `knowledge-graph.${format}`, mimeType);
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
  
  /**
   * Get computed CSS styles to include in exported SVG
   */
  function getComputedStyles() {
    let styleText = '';
    
    // Basic node and link styles
    styleText += `.node { cursor: pointer; }`;
    styleText += `.node-highlight { stroke: ${getComputedStyle(document.documentElement).getPropertyValue('--color-primary')}; stroke-width: 2px; }`;
    styleText += `.node-active { stroke: ${getComputedStyle(document.documentElement).getPropertyValue('--color-secondary')}; stroke-width: 3px; }`;
    styleText += `.link { stroke: ${getComputedStyle(document.documentElement).getPropertyValue('--color-border')}; stroke-opacity: 0.6; stroke-width: 1px; }`;
    styleText += `.link-highlight { stroke: ${getComputedStyle(document.documentElement).getPropertyValue('--color-primary')}; stroke-width: 2px; }`;
    styleText += `.label { font-family: ${getComputedStyle(document.documentElement).getPropertyValue('--font-family-sans')}; font-weight: bold; }`;
    
    return styleText;
  }
  
  /**
   * Download a file with the given data
   */
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
  
  /**
   * Set up graph filtering functionality
   */
  function setupGraphFilters() {
    setupFilterDropdown('filter-graph-button', 'filter-options', mainGraph);
    
    // Set up filter type change handlers
    setupFilterTypeHandler('filter-type', 'category-filters', 'tag-filters', 'search-filter', mainGraph);
    
    // Initialize filter options
    populateFilterOptions(mainGraph, false);
    
    // Set up clear filters button
    document.getElementById('clear-filters').addEventListener('click', function() {
      clearFilters(mainGraph, false);
    });
  }
  
  /**
   * Set up fullscreen graph filtering functionality
   */
  function setupFullscreenGraphFilters(fullscreenGraph) {
    setupFilterDropdown('fullscreen-filter-button', 'fullscreen-filter-options', fullscreenGraph);
    
    // Set up filter type change handlers
    setupFilterTypeHandler('fullscreen-filter-type', 'fullscreen-category-filters', 'fullscreen-tag-filters', 'fullscreen-search-filter', fullscreenGraph);
    
    // Initialize filter options
    populateFilterOptions(fullscreenGraph, true);
    
    // Set up clear filters button
    document.getElementById('fullscreen-clear-filters').addEventListener('click', function() {
      clearFilters(fullscreenGraph, true);
    });
  }
  
  /**
   * Setup dropdown toggle behavior for filters
   */
  function setupFilterDropdown(buttonId, dropdownId, graph) {
    const filterButton = document.getElementById(buttonId);
    const filterOptions = document.getElementById(dropdownId);
    
    if (filterButton && filterOptions) {
      // Toggle dropdown on button click
      filterButton.addEventListener('click', function() {
        const isExpanded = filterButton.getAttribute('aria-expanded') === 'true';
        filterButton.setAttribute('aria-expanded', !isExpanded);
        
        if (isExpanded) {
          filterOptions.classList.remove('active');
        } else {
          filterOptions.classList.add('active');
        }
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', function(event) {
        if (!filterButton.contains(event.target) && !filterOptions.contains(event.target)) {
          filterOptions.classList.remove('active');
          filterButton.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }
  
  /**
   * Set up filter type change handler
   */
  function setupFilterTypeHandler(filterTypeId, categoryFiltersId, tagFiltersId, searchFilterId, graph) {
    const filterType = document.getElementById(filterTypeId);
    const categoryFilters = document.getElementById(categoryFiltersId);
    const tagFilters = document.getElementById(tagFiltersId);
    const searchFilter = document.getElementById(searchFilterId);
    
    if (!filterType || !categoryFilters || !tagFilters || !searchFilter) return;
    
    filterType.addEventListener('change', function() {
      // Hide all filter options first
      categoryFilters.classList.add('hidden');
      tagFilters.classList.add('hidden');
      searchFilter.classList.add('hidden');
      
      // Show selected filter options
      const value = this.value;
      if (value === 'category') {
        categoryFilters.classList.remove('hidden');
      } else if (value === 'tag') {
        tagFilters.classList.remove('hidden');
      } else if (value === 'search') {
        searchFilter.classList.remove('hidden');
      }
      
      // Apply the current filter
      applyFilters(graph, value === 'none' ? null : value, 
                   filterTypeId === 'fullscreen-filter-type');
    });
    
    // Set up search input
    const searchInput = document.getElementById(filterTypeId === 'filter-type' ? 'node-search' : 'fullscreen-node-search');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const isFullscreen = filterTypeId === 'fullscreen-filter-type';
        applySearchFilter(graph, searchTerm, isFullscreen);
      });
    }
  }
  
  /**
   * Populate filter options with categories and tags
   */
  function populateFilterOptions(graph, isFullscreen) {
    // Get all unique categories and tags
    const categories = [...new Set(graphData.nodes.map(node => node.category))];
    
    // Collect all tags from all nodes
    const allTags = [];
    graphData.nodes.forEach(node => {
      if (node.tags && Array.isArray(node.tags)) {
        allTags.push(...node.tags);
      }
    });
    const tags = [...new Set(allTags)];
    
    // Populate category filters
    const categoryContainer = document.getElementById(isFullscreen ? 'fullscreen-category-filters' : 'category-filters');
    if (categoryContainer) {
      categoryContainer.innerHTML = '';
      categories.forEach(category => {
        const formattedCategory = typeof category === 'string' ? category.replace(/^"|"$/g, '') : category;
        
        const checkbox = document.createElement('label');
        checkbox.className = 'filter-checkbox';
        checkbox.innerHTML = `
          <input type="checkbox" data-category="${formattedCategory}">
          <span>${formattedCategory}</span>
        `;
        
        categoryContainer.appendChild(checkbox);
        
        // Add event listener to checkbox
        const input = checkbox.querySelector('input');
        input.addEventListener('change', function() {
          applyCategoryFilter(graph, isFullscreen);
        });
      });
    }
    
    // Populate tag filters
    const tagContainer = document.getElementById(isFullscreen ? 'fullscreen-tag-filters' : 'tag-filters');
    if (tagContainer) {
      tagContainer.innerHTML = '';
      tags.forEach(tag => {
        const formattedTag = typeof tag === 'string' ? tag.replace(/^"|"$/g, '') : tag;
        
        const checkbox = document.createElement('label');
        checkbox.className = 'filter-checkbox';
        checkbox.innerHTML = `
          <input type="checkbox" data-tag="${formattedTag}">
          <span>${formattedTag}</span>
        `;
        
        tagContainer.appendChild(checkbox);
        
        // Add event listener to checkbox
        const input = checkbox.querySelector('input');
        input.addEventListener('change', function() {
          applyTagFilter(graph, isFullscreen);
        });
      });
    }
  }
  
  /**
   * Apply filters based on selected filter type
   */
  function applyFilters(graph, filterType, isFullscreen) {
    if (!filterType) {
      // Reset filter state
      graph.simulation.filterActive = false;
      graph.simulation.filteredNodes.clear();
      
      // Show all nodes if no filter is selected
      resetNodeVisibility(graph);
      return;
    }
    
    // Set filter as active
    graph.simulation.filterActive = true;
    
    if (filterType === 'category') {
      applyCategoryFilter(graph, isFullscreen);
    } else if (filterType === 'tag') {
      applyTagFilter(graph, isFullscreen);
    }
    // Search is handled by the input event
  }
  
  /**
   * Apply category filters
   */
  function applyCategoryFilter(graph, isFullscreen) {
    const categoryCheckboxes = document.querySelectorAll(`#${isFullscreen ? 'fullscreen-' : ''}category-filters input[type="checkbox"]`);
    const selectedCategories = Array.from(categoryCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.dataset.category);
    
    // If no categories selected, show all nodes
    if (selectedCategories.length === 0) {
      resetNodeVisibility(graph);
      return;
    }
    
    // Store filtered nodes in simulation
    graph.simulation.filteredNodes.clear();
    graph.node.each(d => {
      const category = typeof d.category === 'string' ? d.category.replace(/^"|"$/g, '') : d.category;
      if (!selectedCategories.includes(category)) {
        graph.simulation.filteredNodes.add(d.id);
      }
    });
    
    // Otherwise, filter based on selected categories
    graph.node.classed('node-dim', d => {
      const category = typeof d.category === 'string' ? d.category.replace(/^"|"$/g, '') : d.category;
      return !selectedCategories.includes(category);
    });
    
    // Update links visibility
    updateLinkVisibility(graph);
    
    // Update labels visibility
    graph.label.classed('label-dim', d => {
      const category = typeof d.category === 'string' ? d.category.replace(/^"|"$/g, '') : d.category;
      return !selectedCategories.includes(category);
    });
  }
  
  /**
   * Apply tag filters
   */
  function applyTagFilter(graph, isFullscreen) {
    const tagCheckboxes = document.querySelectorAll(`#${isFullscreen ? 'fullscreen-' : ''}tag-filters input[type="checkbox"]`);
    const selectedTags = Array.from(tagCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.dataset.tag);
    
    // If no tags selected, show all nodes
    if (selectedTags.length === 0) {
      resetNodeVisibility(graph);
      return;
    }
    
    // Store filtered nodes in simulation
    graph.simulation.filteredNodes.clear();
    graph.node.each(d => {
      // Node has tags and at least one tag matches a selected tag
      if (d.tags && Array.isArray(d.tags)) {
        const nodeTags = d.tags.map(tag => typeof tag === 'string' ? tag.replace(/^"|"$/g, '') : tag);
        if (!nodeTags.some(tag => selectedTags.includes(tag))) {
          graph.simulation.filteredNodes.add(d.id);
        }
      } else {
        graph.simulation.filteredNodes.add(d.id);
      }
    });
    
    // Otherwise, filter based on selected tags
    graph.node.classed('node-dim', d => {
      // Node has tags and at least one tag matches a selected tag
      if (d.tags && Array.isArray(d.tags)) {
        const nodeTags = d.tags.map(tag => typeof tag === 'string' ? tag.replace(/^"|"$/g, '') : tag);
        return !nodeTags.some(tag => selectedTags.includes(tag));
      }
      return true; // No tags, so dim it
    });
    
    // Update links visibility
    updateLinkVisibility(graph);
    
    // Update labels visibility
    graph.label.classed('label-dim', d => {
      if (d.tags && Array.isArray(d.tags)) {
        const nodeTags = d.tags.map(tag => typeof tag === 'string' ? tag.replace(/^"|"$/g, '') : tag);
        return !nodeTags.some(tag => selectedTags.includes(tag));
      }
      return true;
    });
  }
  
  /**
   * Apply search filter
   */
  function applySearchFilter(graph, searchTerm, isFullscreen) {
    if (!searchTerm) {
      graph.simulation.filterActive = false;
      graph.simulation.filteredNodes.clear();
      resetNodeVisibility(graph);
      return;
    }
    
    graph.simulation.filterActive = true;
    graph.simulation.filteredNodes.clear();
    
    graph.node.each(d => {
      const title = d.title.toLowerCase().replace(/^"|"$/g, '');
      if (!title.includes(searchTerm.toLowerCase())) {
        graph.simulation.filteredNodes.add(d.id);
      }
    });
    
    graph.node.classed('node-dim', d => {
      const title = d.title.toLowerCase().replace(/^"|"$/g, '');
      return !title.includes(searchTerm);
    });
    
    // Update links visibility
    updateLinkVisibility(graph);
    
    // Update labels visibility
    graph.label.classed('label-dim', d => {
      const title = d.title.toLowerCase().replace(/^"|"$/g, '');
      return !title.includes(searchTerm);
    });
  }
  
  /**
   * Update link visibility based on node visibility
   */
  function updateLinkVisibility(graph) {
    graph.link.classed('link-dim', l => {
      const sourceVisible = !graph.simulation.filteredNodes.has(l.source.id);
      const targetVisible = !graph.simulation.filteredNodes.has(l.target.id);
      return !(sourceVisible && targetVisible);
    });
  }
  
  /**
   * Reset node visibility
   */
  function resetNodeVisibility(graph) {
    graph.node.classed('node-dim', false);
    graph.link.classed('link-dim', false);
    graph.label.classed('label-dim', false);
  }
  
  /**
   * Clear all filters
   */
  function clearFilters(graph, isFullscreen) {
    // Reset filter type to "All Nodes"
    const filterType = document.getElementById(isFullscreen ? 'fullscreen-filter-type' : 'filter-type');
    if (filterType) {
      filterType.value = 'none';
    }
    
    // Uncheck all category filters
    const categoryCheckboxes = document.querySelectorAll(`#${isFullscreen ? 'fullscreen-' : ''}category-filters input[type="checkbox"]`);
    categoryCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // Uncheck all tag filters
    const tagCheckboxes = document.querySelectorAll(`#${isFullscreen ? 'fullscreen-' : ''}tag-filters input[type="checkbox"]`);
    tagCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // Clear search input
    const searchInput = document.getElementById(isFullscreen ? 'fullscreen-node-search' : 'node-search');
    if (searchInput) {
      searchInput.value = '';
    }
    
    // Hide all filter options
    document.getElementById(isFullscreen ? 'fullscreen-category-filters' : 'category-filters').classList.add('hidden');
    document.getElementById(isFullscreen ? 'fullscreen-tag-filters' : 'tag-filters').classList.add('hidden');
    document.getElementById(isFullscreen ? 'fullscreen-search-filter' : 'search-filter').classList.add('hidden');
    
    // Reset filter state
    graph.simulation.filterActive = false;
    graph.simulation.filteredNodes.clear();
    
    // Reset node visibility
    resetNodeVisibility(graph);
  }
  
  // Add setupGraphExport() to your main initialization
  setupGraphExport();
  setupGraphFilters();
});
