// KaTeX initialization
// Configures auto-render and exposes window.reprocessMath for dynamic content.
(function () {
  "use strict";

  var KATEX_OPTIONS = {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false },
      { left: "\\[", right: "\\]", display: true }
    ],
    throwOnError: false,
    errorColor: "#cc0000",
    strict: false,
    trust: true
  };

  function renderAll(root) {
    if (typeof window.renderMathInElement !== "function") {
      return;
    }
    try {
      window.renderMathInElement(root || document.body, KATEX_OPTIONS);
    } catch (err) {
      // KaTeX auto-render handles per-formula errors via errorColor; this is a safety net.
      if (window.console && console.warn) {
        console.warn("KaTeX render failed:", err && err.message);
      }
    }
  }

  // Expose a global re-render hook for dynamic content (e.g. theme toggles, AJAX inserts).
  window.reprocessMath = function (root) {
    renderAll(root);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { renderAll(); });
  } else {
    renderAll();
  }
})();
