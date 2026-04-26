// header-modal.js - Share modal + mobile search behaviour for the site header.
// Extracted from layouts/partials/header.html.

(function () {
  "use strict";

  function init() {
    const modal = document.getElementById("share-modal");
    const btn = document.getElementById("share-link-btn");
    const copyBtn = document.getElementById("copy-url-btn");
    const input = document.getElementById("share-url");

    // Mobile search elements
    const mobileSearchBtn = document.getElementById("mobile-search-btn");
    const mobileSearchOverlay = document.getElementById("mobile-search-overlay");
    const mobileSearchInput = document.getElementById("mobile-search-input");

    // Mobile search toggle
    if (mobileSearchBtn && mobileSearchOverlay) {
      mobileSearchBtn.addEventListener("click", function () {
        mobileSearchOverlay.style.display = "block";
        setTimeout(function () {
          mobileSearchOverlay.classList.add("active");
          if (mobileSearchInput) {
            mobileSearchInput.focus();
          }
        }, 10);
        document.body.style.overflow = "hidden";
      });

      const closeMobileSearch = function () {
        mobileSearchOverlay.classList.remove("active");
        setTimeout(function () {
          mobileSearchOverlay.style.display = "none";
          document.body.style.overflow = "";
        }, 300);
      };

      mobileSearchOverlay.addEventListener("click", function (event) {
        if (event.target === mobileSearchOverlay) {
          closeMobileSearch();
        }
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && mobileSearchOverlay.classList.contains("active")) {
          closeMobileSearch();
        }
      });
    }

    // Share modal
    if (btn && modal) {
      btn.addEventListener("click", function () {
        modal.style.display = "block";
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
      });

      const closeModal = function () {
        modal.classList.remove("active");
        setTimeout(function () {
          modal.style.display = "none";
          document.body.style.overflow = "";
        }, 200);
      };

      window.addEventListener("click", function (event) {
        if (event.target === modal) {
          closeModal();
        }
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modal.style.display === "block") {
          closeModal();
        }
      });
    }

    // Copy-link button
    if (copyBtn && input) {
      const originalLabel = copyBtn.dataset.labelCopy || "Copy URL";
      const copiedLabel = copyBtn.dataset.labelCopied || "Copied!";
      const iconHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>' +
        '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1-2-2h9a2 2 0 0 1-2 2v1"></path>' +
        '</svg>';

      copyBtn.addEventListener("click", function () {
        input.select();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(input.value).catch(function () {});
        } else {
          try {
            document.execCommand("copy");
          } catch (e) {
            // Clipboard unavailable — selection still allows manual copy.
          }
        }
        copyBtn.textContent = copiedLabel;

        setTimeout(function () {
          copyBtn.innerHTML = (iconHTML + " " + originalLabel).trim();
        }, 2000);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
