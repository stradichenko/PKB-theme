document.addEventListener('DOMContentLoaded', () => {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);

    function showTooltip(event, content) {
        if (!content) return;
        
        tooltip.innerHTML = content;
        
        // Position tooltip
        const rect = event.target.getBoundingClientRect();
        const tooltipHeight = tooltip.offsetHeight;
        
        // Position above the reference point
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.top = `${rect.top + window.scrollY - tooltipHeight - 8}px`;
        
        // Make visible
        tooltip.classList.add('visible');
    }

    function hideTooltip() {
        tooltip.classList.remove('visible');
    }

    // Handle sidenotes
    document.querySelectorAll('.sidenote-ref').forEach(ref => {
        const sidenoteContent = ref.nextElementSibling?.innerHTML;
        if (sidenoteContent) {
            const cleanContent = sidenoteContent.replace(/<sup.*?<\/sup>/, '').trim();
            ref.addEventListener('mouseenter', e => showTooltip(e, cleanContent));
            ref.addEventListener('mouseleave', hideTooltip);
        }
    });

    // Handle citations
    document.querySelectorAll('.citation-ref').forEach(ref => {
        const citationKey = ref.dataset.citationKey;
        const citation = document.querySelector(`.citation-sidenote[data-citation-key="${citationKey}"]`);
        if (citation) {
            const citationContent = citation.querySelector('.citation-inline');
            if (citationContent) {
                const observer = new MutationObserver((mutations, obs) => {
                    if (citationContent.textContent.trim()) {
                        ref.setAttribute('title', citationContent.textContent.trim());
                        obs.disconnect();
                    }
                });
                observer.observe(citationContent, { 
                    childList: true, 
                    characterData: true, 
                    subtree: true 
                });
            }
        }
    });
});
