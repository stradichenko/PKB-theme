/**
 * Mermaid Diagram Enhancement Module
 * Adds fullscreen and export functionality to mermaid diagrams
 */

// Make function global so it can be called from the HTML
window.initializeMermaidEnhancements = function() {
    console.log("Initializing mermaid diagram enhancements...");
    
    // Wait a bit longer for mermaid to fully render
    setTimeout(function() {
        // Find all mermaid diagram containers
        const diagramContainers = document.querySelectorAll('.mermaid-diagram-container');
        
        if (diagramContainers.length === 0) {
            console.log("No mermaid diagram containers found");
            return;
        }
        
        console.log(`Found ${diagramContainers.length} mermaid diagram containers`);
        
        diagramContainers.forEach(container => {
            setupDiagramControls(container);
        });
        
        // Setup ESC key handler for closing fullscreen (only once)
        if (!window.mermaidEscHandlerAdded) {
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape') {
                    closeAllFullscreenOverlays();
                }
            });
            window.mermaidEscHandlerAdded = true;
        }
    }, 500); // Increased timeout to allow mermaid to render
};

/**
 * Setup controls for a specific diagram container
 */
function setupDiagramControls(container) {
    const fullscreenButton = container.querySelector('.diagram-fullscreen-button');
    const saveButton = container.querySelector('.diagram-save-button');
    const saveOptions = container.querySelector('.save-options-dropdown');
    
    // Setup fullscreen functionality
    if (fullscreenButton) {
        // Remove any existing listeners
        fullscreenButton.removeEventListener('click', fullscreenButton._clickHandler);
        
        fullscreenButton._clickHandler = function() {
            openDiagramFullscreen(container);
        };
        
        fullscreenButton.addEventListener('click', fullscreenButton._clickHandler);
    }
    
    // Setup save dropdown
    if (saveButton && saveOptions) {
        setupSaveDropdown(saveButton, saveOptions, container);
    }
    
    // Setup save option buttons
    const saveOptionButtons = container.querySelectorAll('.save-option');
    saveOptionButtons.forEach(button => {
        // Remove any existing listeners
        button.removeEventListener('click', button._clickHandler);
        
        button._clickHandler = function() {
            const format = this.getAttribute('data-format');
            const target = this.getAttribute('data-target');
            
            if (target === 'fullscreen') {
                exportDiagram(format, container, true);
            } else {
                exportDiagram(format, container, false);
            }
            
            // Close dropdown
            saveOptions.classList.remove('active');
            saveButton.setAttribute('aria-expanded', 'false');
        };
        
        button.addEventListener('click', button._clickHandler);
    });
}

/**
 * Setup save dropdown behavior
 */
function setupSaveDropdown(button, dropdown, container) {
    // Remove any existing listeners
    button.removeEventListener('click', button._dropdownClickHandler);
    
    button._dropdownClickHandler = function() {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', !isExpanded);
        
        if (isExpanded) {
            dropdown.classList.remove('active');
        } else {
            dropdown.classList.add('active');
        }
    };
    
    button.addEventListener('click', button._dropdownClickHandler);
    
    // Close dropdown when clicking outside (with namespace to avoid duplicates)
    if (!button._outsideClickHandler) {
        button._outsideClickHandler = function(event) {
            if (!button.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.classList.remove('active');
                button.setAttribute('aria-expanded', 'false');
            }
        };
        
        document.addEventListener('click', button._outsideClickHandler);
    }
}

/**
 * Open diagram in fullscreen mode
 */
function openDiagramFullscreen(container) {
    const overlay = container.parentNode.querySelector('.diagram-fullscreen-overlay');
    const diagram = container.querySelector('pre.mermaid');
    
    if (!overlay || !diagram) {
        console.error('Required elements not found for fullscreen');
        return;
    }
    
    const overlayContent = overlay.querySelector('.overlay-content');
    
    // Clone just the pre.mermaid element
    const diagramClone = diagram.cloneNode(true);
    diagramClone.classList.add('fullscreen-mermaid');
    
    // Clear the overlay content and add the cloned diagram
    overlayContent.innerHTML = '';
    overlayContent.appendChild(diagramClone);
    
    // Add the fullscreen actions container to the cloned diagram
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'fullscreen-actions';
    actionsContainer.innerHTML = `
        <div class="diagram-save-dropdown">
            <button class="fullscreen-save-button" aria-label="Save diagram as image" aria-expanded="false">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
            </button>
            <div class="fullscreen-save-options-dropdown">
                <button class="save-option" data-format="png" data-target="fullscreen">Save as PNG</button>
                <button class="save-option" data-format="svg" data-target="fullscreen">Save as SVG</button>
                <button class="save-option" data-format="jpeg" data-target="fullscreen">Save as JPEG</button>
            </div>
        </div>
        
        <button class="close-fullscreen-button" aria-label="Close fullscreen view">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
        </button>
    `;
    
    // Append actions to the cloned diagram
    diagramClone.appendChild(actionsContainer);
    
    // Show overlay
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Setup fullscreen controls
    setupFullscreenControls(overlay, container);
    
    // Re-render mermaid diagram in fullscreen with expanded configuration
    if (typeof mermaid !== 'undefined') {
        // Clear any existing rendered content
        diagramClone.removeAttribute('data-processed');
        
        // Get original content and restore it
        const originalContent = diagramClone.getAttribute('data-original-content') || diagramClone.textContent;
        
        // If the original content doesn't look like mermaid syntax, get it from the text content
        if (!originalContent.trim().match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|gitgraph|mindmap|timeline|journey|pie)/)) {
            const textContent = diagram.textContent.trim();
            if (textContent) {
                diagramClone.setAttribute('data-original-content', textContent);
                diagramClone.innerHTML = textContent;
            }
        } else {
            diagramClone.innerHTML = originalContent;
        }
        
        try {
            // Initialize mermaid with fullscreen-optimized configuration
            mermaid.initialize({ 
                startOnLoad: false,
                theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
                securityLevel: 'loose',
                flowchart: {
                    useMaxWidth: true,
                    useMaxHeight: true,
                    htmlLabels: true,
                    width: '100%',
                    height: '100%'
                },
                sequence: {
                    useMaxWidth: true,
                    useMaxHeight: true,
                    width: '100%',
                    height: '100%'
                },
                gantt: {
                    useMaxWidth: true,
                    useMaxHeight: true,
                    width: '100%',
                    height: '100%'
                },
                class: {
                    useMaxWidth: true,
                    useMaxHeight: true
                },
                state: {
                    useMaxWidth: true,
                    useMaxHeight: true
                },
                er: {
                    useMaxWidth: true,
                    useMaxHeight: true
                },
                journey: {
                    useMaxWidth: true,
                    useMaxHeight: true
                },
                pie: {
                    useMaxWidth: true,
                    useMaxHeight: true
                }
            });
            
            mermaid.init(undefined, diagramClone);
            
            // After rendering, ensure SVG fills the container
            setTimeout(() => {
                const svg = diagramClone.querySelector('svg');
                if (svg) {
                    // Remove any fixed width/height attributes
                    svg.removeAttribute('width');
                    svg.removeAttribute('height');
                    svg.style.width = '100%';
                    svg.style.height = '100%';
                    svg.style.maxWidth = 'none';
                    svg.style.maxHeight = 'none';
                    
                    // Preserve aspect ratio but fill available space
                    const viewBox = svg.getAttribute('viewBox');
                    if (viewBox) {
                        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                    }
                }
            }, 100);
            
        } catch (e) {
            console.warn('Could not re-initialize mermaid in fullscreen:', e);
        }
    }
}

/**
 * Setup fullscreen controls
 */
function setupFullscreenControls(overlay, originalContainer) {
    const closeButton = overlay.querySelector('.close-fullscreen-button');
    const saveButton = overlay.querySelector('.fullscreen-save-button');
    const saveOptions = overlay.querySelector('.fullscreen-save-options-dropdown');
    
    // Setup close button
    if (closeButton) {
        closeButton.removeEventListener('click', closeButton._clickHandler);
        
        closeButton._clickHandler = function() {
            closeFullscreenOverlay(overlay);
        };
        
        closeButton.addEventListener('click', closeButton._clickHandler);
    }
    
    // Setup save dropdown - fix the functionality
    if (saveButton && saveOptions) {
        // Remove any existing listeners
        saveButton.removeEventListener('click', saveButton._dropdownClickHandler);
        
        saveButton._dropdownClickHandler = function() {
            const isExpanded = saveButton.getAttribute('aria-expanded') === 'true';
            saveButton.setAttribute('aria-expanded', !isExpanded);
            
            if (isExpanded) {
                saveOptions.classList.remove('active');
            } else {
                saveOptions.classList.add('active');
            }
        };
        
        saveButton.addEventListener('click', saveButton._dropdownClickHandler);
        
        // Close dropdown when clicking outside
        if (!saveButton._outsideClickHandler) {
            saveButton._outsideClickHandler = function(event) {
                if (!saveButton.contains(event.target) && !saveOptions.contains(event.target)) {
                    saveOptions.classList.remove('active');
                    saveButton.setAttribute('aria-expanded', 'false');
                }
            };
            
            document.addEventListener('click', saveButton._outsideClickHandler);
        }
    }
    
    // Setup save option buttons
    const saveOptionButtons = overlay.querySelectorAll('.save-option');
    saveOptionButtons.forEach(button => {
        button.removeEventListener('click', button._clickHandler);
        
        button._clickHandler = function() {
            const format = this.getAttribute('data-format');
            exportDiagram(format, overlay, true); // Pass overlay instead of originalContainer
            
            // Close dropdown
            saveOptions.classList.remove('active');
            saveButton.setAttribute('aria-expanded', 'false');
        };
        
        button.addEventListener('click', button._clickHandler);
    });
}

/**
 * Close fullscreen overlay
 */
function closeFullscreenOverlay(overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Close all fullscreen overlays (for ESC key)
 */
function closeAllFullscreenOverlays() {
    const overlays = document.querySelectorAll('.diagram-fullscreen-overlay.active');
    overlays.forEach(overlay => {
        closeFullscreenOverlay(overlay);
    });
}

/**
 * Export diagram as image
 */
function exportDiagram(format, container, isFullscreen) {
    if (isFullscreen === undefined) {
        isFullscreen = false;
    }
    
    let diagram;
    if (isFullscreen) {
        // For fullscreen, container is the overlay itself
        const fullscreenPre = container.querySelector ? container.querySelector('pre.mermaid') : null;
        diagram = fullscreenPre ? fullscreenPre.querySelector('svg') : null;
        
        // Fallback: look for SVG in the overlay
        if (!diagram) {
            diagram = container.querySelector ? container.querySelector('svg') : null;
        }
    } else {
        diagram = container.querySelector('svg');
    }
    
    if (!diagram) {
        console.error('SVG diagram not found for export');
        alert('No diagram found to export. Please make sure the diagram has rendered properly.');
        return;
    }
    
    // Create a copy of the SVG
    const svgCopy = diagram.cloneNode(true);
    
    // Set explicit dimensions
    const rect = diagram.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;
    
    svgCopy.setAttribute('width', width);
    svgCopy.setAttribute('height', height);
    svgCopy.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    
    // Add styles
    const styles = document.createElement('style');
    styles.textContent = getMermaidStyles();
    svgCopy.insertBefore(styles, svgCopy.firstChild);
    
    // Serialize SVG
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgCopy);
    
    if (format === 'svg') {
        downloadFile(svgString, 'mermaid-diagram.svg', 'image/svg+xml');
    } else {
        // Convert to raster format
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Fill background for JPEG
        if (format === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
        }
        
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
            const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
            
            try {
                const dataURL = canvas.toDataURL(mimeType, 0.95);
                downloadFile(dataURL, 'mermaid-diagram.' + format, mimeType);
            } catch (e) {
                console.error("Failed to export diagram:", e);
                alert("Failed to export the diagram. Please try another format.");
            }
        };
        
        img.onerror = function() {
            console.error("Failed to load SVG for export");
            alert("Failed to process the diagram for export.");
        };
        
        // Convert SVG to data URI
        const svg64 = btoa(unescape(encodeURIComponent(svgString)));
        const b64Start = 'data:image/svg+xml;base64,';
        img.src = b64Start + svg64;
    }
}

/**
 * Get mermaid-specific styles for export
 */
function getMermaidStyles() {
    return [
        '.node rect, .node circle, .node ellipse, .node polygon {',
        '  fill: var(--color-surface, #ffffff);',
        '  stroke: var(--color-border, #333333);',
        '  stroke-width: 1px;',
        '}',
        '.edgePath .path {',
        '  stroke: var(--color-border, #333333);',
        '  stroke-width: 1px;',
        '}',
        '.edgeLabel {',
        '  background-color: var(--color-surface, #ffffff);',
        '  color: var(--text-color-primary, #333333);',
        '}',
        'text {',
        '  font-family: var(--font-family-sans, sans-serif);',
        '  fill: var(--text-color-primary, #333333);',
        '}'
    ].join('\n');
}

/**
 * Download a file
 */
function downloadFile(data, filename, mimeType) {
    if (mimeType.indexOf('image/svg') === 0) {
        const blob = new Blob([data], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } else {
        // For data URLs from canvas
        const link = document.createElement('a');
        link.href = data;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Auto-initialize when DOM is ready if not already done
document.addEventListener('DOMContentLoaded', function() {
    // Wait for mermaid to potentially be available and process diagrams
    setTimeout(function() {
        if (typeof window.initializeMermaidEnhancements === 'function') {
            window.initializeMermaidEnhancements();
        }
    }, 1000); // Increased timeout to ensure mermaid has processed
});
