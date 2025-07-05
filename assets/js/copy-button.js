document.addEventListener('DOMContentLoaded', function() {
    // Add copy buttons to all code blocks
    const codeBlocks = document.querySelectorAll('pre code, .highlight pre code');
    
    codeBlocks.forEach(function(codeBlock) {
        const pre = codeBlock.parentNode;
        
        // Skip if button already exists
        if (pre.querySelector('.copy-button')) return;
        
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
            </svg>
            <span class="copy-text">Copy</span>
        `;
        copyButton.title = 'Copy code to clipboard';
        
        // Add click event listener
        copyButton.addEventListener('click', function() {
            const code = codeBlock.textContent;
            
            // Use the modern clipboard API if available
            if (navigator.clipboard) {
                navigator.clipboard.writeText(code).then(function() {
                    showCopyFeedback(copyButton, true);
                }).catch(function() {
                    fallbackCopyTextToClipboard(code, copyButton);
                });
            } else {
                fallbackCopyTextToClipboard(code, copyButton);
            }
        });
        
        // Make pre container relative for absolute positioning
        pre.style.position = 'relative';
        pre.appendChild(copyButton);
    });
    
    // Fallback copy function for older browsers
    function fallbackCopyTextToClipboard(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            showCopyFeedback(button, successful);
        } catch (err) {
            showCopyFeedback(button, false);
        }
        
        document.body.removeChild(textArea);
    }
    
    // Show copy feedback with shorter duration
    function showCopyFeedback(button, success) {
        const textSpan = button.querySelector('.copy-text');
        const originalText = textSpan.textContent;
        
        if (success) {
            textSpan.textContent = 'Copied!';
            button.classList.add('copied');
        } else {
            textSpan.textContent = 'Failed';
            button.classList.add('failed');
        }
        
        setTimeout(function() {
            textSpan.textContent = originalText;
            button.classList.remove('copied', 'failed');
        }, 800); // Reduced from 2000ms to 800ms
    }
});
