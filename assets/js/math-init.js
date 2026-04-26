/**
 * Math reprocessing helper for page refreshes / visibility changes.
 * Relies on window.reprocessMath being defined by the math rendering setup
 * (KaTeX/MathJax wiring lives in partials/head/katex.html — Unit 11).
 */
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      if (window.reprocessMath) {
        window.reprocessMath();
      }
    }, 200);
  });

  document.addEventListener('visibilitychange', function() {
    if (!document.hidden && window.reprocessMath) {
      setTimeout(window.reprocessMath, 100);
    }
  });
})();
