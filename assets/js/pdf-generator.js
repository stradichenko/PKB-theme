/**
 * PDF Generator — LaTeX-quality print preparation
 * ================================================
 * Hooks into the browser print flow (beforeprint / afterprint) to:
 *   1. Convert sidebar sidenotes → numbered endnotes
 *   2. Separate regular notes from citation references
 *   3. Build a "Notes" section and a "References" (bibliography) section
 *   4. Renumber superscript markers in the text to match
 *   5. Restore the DOM after printing
 */
(function () {
  'use strict';

  const DEBUG = false;

  /* ──────────────────────────────────────────────
     State that must survive across before/after.
     Stored on `window` so that even if this IIFE
     executes twice (bundle + standalone), only one
     set of print hooks is active.
     ────────────────────────────────────────────── */
  if (window.__pdfPrintHooksRegistered) {
    if (DEBUG) console.log('[PDF] hooks already registered, skipping duplicate');
    return; // bail out of entire IIFE
  }
  window.__pdfPrintHooksRegistered = true;

  const printState = {
    originalRefContents: new Map(), // ref element → original innerHTML
    createdElements: [],            // elements we injected
    hiddenElements: [],             // elements we hid
    isPrepared: false
  };

  /* ──────────────────────────────────────────────
     Utility: strip the leading label sup from a
     sidenote node and return the remaining HTML
     ────────────────────────────────────────────── */
  function extractNoteContent(sidenoteEl) {
    const clone = sidenoteEl.cloneNode(true);
    // Remove the label sups (e.g. "a." or "1.")
    clone.querySelectorAll('.sidenote-sup, .citation-sup').forEach(s => s.remove());
    return clone.innerHTML.trim();
  }

  /* ──────────────────────────────────────────────
     beforeprint — build endnotes + bibliography
     ────────────────────────────────────────────── */
  function preparePrintLayout() {
    if (printState.isPrepared) return;
    printState.isPrepared = true;
    if (DEBUG) console.log('[PDF] preparing print layout');

    document.body.classList.add('pdf-printing');

    /* ── Set <title> to "Post Name | Blog Name" for browser header ── */
    const titleEl = document.querySelector('title');
    if (titleEl) {
      printState.originalTitle = titleEl.textContent;
      const postTitleEl = document.querySelector('.post-title');
      const siteTitleEl = document.querySelector('.site-title');
      if (postTitleEl) {
        const postName = postTitleEl.textContent.trim();
        const blogName = siteTitleEl
          ? siteTitleEl.textContent.trim()
          : '';
        titleEl.textContent = blogName
          ? postName + ' | ' + blogName
          : postName;
      }
    }

    /* ── Convert Mermaid SVGs → <img> for print ─────────────────
       Mermaid replaces <pre class="mermaid"> innerHTML with an
       <svg>. We serialize that SVG into a data-URI <img> which
       completely bypasses every SVG-related CSS rule.  If Mermaid
       hasn't processed an element yet we skip it (raw text will
       show as a readable code-like fallback).
       ────────────────────────────────────────────────────────── */
    printState.mermaidSwaps = printState.mermaidSwaps || [];
    document.querySelectorAll('pre.mermaid, div.mermaid').forEach(function (container) {
      var svg = container.querySelector('svg');
      if (!svg) {
        if (DEBUG) console.log('[PDF] mermaid container has no SVG, skipping', container);
        return;
      }

      /* Capture screen dimensions before any print CSS kicks in */
      var rect = svg.getBoundingClientRect();
      var w = rect.width  || parseFloat(svg.getAttribute('width'))  || 600;
      var h = rect.height || parseFloat(svg.getAttribute('height')) || 400;

      /* Serialize the live SVG into a self-contained data-URI */
      var svgClone = svg.cloneNode(true);
      /* Ensure xmlns so browsers parse it as image */
      if (!svgClone.getAttribute('xmlns')) {
        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }
      /* Set explicit dimensions on the SVG root so the <img> knows its size */
      svgClone.setAttribute('width',  w);
      svgClone.setAttribute('height', h);

      var svgString = new XMLSerializer().serializeToString(svgClone);
      var dataUri   = 'data:image/svg+xml;base64,' +
                      btoa(unescape(encodeURIComponent(svgString)));

      var img = document.createElement('img');
      img.src = dataUri;
      img.className = 'pdf-mermaid-img';
      img.style.cssText =
        'display:block!important;visibility:visible!important;' +
        'width:' + w + 'px!important;max-width:100%!important;' +
        'height:auto!important;margin:12pt auto!important;' +
        'page-break-inside:avoid;';
      img.setAttribute('alt', 'Mermaid diagram');

      /* Hide the original <pre> and insert the <img> right after it */
      container.style.setProperty('display', 'none', 'important');
      container.parentNode.insertBefore(img, container.nextSibling);

      printState.mermaidSwaps.push({ img: img, container: container });
      if (DEBUG) console.log('[PDF] swapped mermaid SVG → img', w, 'x', h);
    });

    const postContent = document.querySelector('.post-content');
    if (!postContent) return;

    /* ── 1. Gather every in-text reference in document order ── */
    const allRefs = Array.from(
      postContent.querySelectorAll('.sidenote-ref, .citation-ref')
    );

    const regularNotes = [];   // non-citation sidenotes
    const citationNotes = [];  // citation sidenotes
    const seenCitationKeys = new Set();
    let noteCounter = 0;

    allRefs.forEach(ref => {
      const isCitation = ref.classList.contains('citation-ref');

      if (isCitation) {
        /* ── Citation ref ── */
        const citationKey = ref.dataset.citationKey;
        if (!citationKey) return;

        // Only add each citation once to the bibliography
        if (!seenCitationKeys.has(citationKey)) {
          seenCitationKeys.add(citationKey);

          // Find the citation sidenote
          const sidenote =
            document.getElementById('citation-' + citationKey) ||
            document.querySelector(
              `.citation-sidenote[data-citation-key="${citationKey}"]`
            );

          if (sidenote) {
            const citationSpan = sidenote.querySelector('.citation');
            const content = citationSpan
              ? citationSpan.innerHTML.trim()
              : extractNoteContent(sidenote);

            citationNotes.push({
              number: ref.textContent.trim(),
              content: content,
              key: citationKey
            });
          }
        }
        // Citation refs keep their existing number — no change needed
      } else {
        /* ── Regular sidenote ref ── */
        noteCounter++;

        // Preserve the original letter label (a, b, c, ...)
        const originalLabel = ref.textContent.trim();

        // Find the matching sidenote via the placeholder
        const placeholder = ref.nextElementSibling;
        let sidenote = null;

        if (placeholder && placeholder.classList.contains('sidenote-placeholder')) {
          const id = placeholder.dataset.sidenoteId;
          if (id) sidenote = document.getElementById(id);
        }

        if (!sidenote) {
          // Fallback: look for sidenote-N by index
          sidenote = document.getElementById('sidenote-' + (noteCounter - 1));
        }

        if (sidenote) {
          regularNotes.push({
            label: originalLabel,
            content: extractNoteContent(sidenote)
          });
        }
      }
    });

    /* ── 2. Hide existing JS-generated references container ── */
    const existingRefs = document.getElementById('sidenotes-references');
    if (existingRefs) {
      existingRefs.style.cssText = 'display:none!important';
      printState.hiddenElements.push(existingRefs);
    }

    /* ── 3. Build Notes section ── */
    if (regularNotes.length > 0) {
      const section = document.createElement('section');
      section.className = 'pdf-footnotes-section';

      const heading = document.createElement('h2');
      heading.className = 'pdf-footnotes-title';
      heading.textContent = 'Notes';
      section.appendChild(heading);

      const list = document.createElement('div');
      list.className = 'pdf-footnotes-list';

      regularNotes.forEach(note => {
        const item = document.createElement('div');
        item.className = 'pdf-footnote-item';
        item.innerHTML =
          '<span class="pdf-footnote-number">' + note.label + '.</span> ' +
          note.content;
        list.appendChild(item);
      });

      section.appendChild(list);
      postContent.appendChild(section);
      printState.createdElements.push(section);
    }

    /* ── 4. Build Bibliography section ── */
    if (citationNotes.length > 0) {
      const section = document.createElement('section');
      section.className = 'pdf-bibliography-section';

      const heading = document.createElement('h2');
      heading.className = 'pdf-bibliography-title';
      heading.textContent = 'References';
      section.appendChild(heading);

      const list = document.createElement('div');
      list.className = 'pdf-bibliography-list';

      citationNotes.forEach(note => {
        const item = document.createElement('div');
        item.className = 'pdf-bibliography-item';
        item.innerHTML = '[' + note.number + '] ' + note.content;
        list.appendChild(item);
      });

      section.appendChild(list);
      postContent.appendChild(section);
      printState.createdElements.push(section);
    }

    if (DEBUG) {
      console.log(
        '[PDF] prepared:',
        regularNotes.length, 'notes,',
        citationNotes.length, 'citations'
      );
    }
  }

  /* ──────────────────────────────────────────────
     afterprint — tear down, restore original DOM
     ────────────────────────────────────────────── */
  function restorePrintLayout() {
    if (!printState.isPrepared) return;
    if (DEBUG) console.log('[PDF] restoring layout');

    document.body.classList.remove('pdf-printing');

    // Restore original document title
    if (printState.originalTitle) {
      const titleEl = document.querySelector('title');
      if (titleEl) titleEl.textContent = printState.originalTitle;
      delete printState.originalTitle;
    }

    // Restore mermaid containers (remove <img>, un-hide <pre>)
    if (printState.mermaidSwaps) {
      printState.mermaidSwaps.forEach(function (swap) {
        if (swap.img.parentNode) swap.img.parentNode.removeChild(swap.img);
        swap.container.style.removeProperty('display');
      });
      printState.mermaidSwaps = [];
    }

    // Restore original ref text
    printState.originalRefContents.forEach((html, ref) => {
      ref.innerHTML = html;
    });

    // Remove injected sections
    printState.createdElements.forEach(el => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });

    // Un-hide hidden elements
    printState.hiddenElements.forEach(el => {
      el.style.cssText = '';
    });

    // Reset state
    printState.originalRefContents.clear();
    printState.createdElements = [];
    printState.hiddenElements = [];
    printState.isPrepared = false;
  }

  /* ──────────────────────────────────────────────
     PDF button (kept for manual trigger)
     ────────────────────────────────────────────── */
  const CONFIG = { selectors: { button: 'pdf-generate-btn' } };
  let isProcessing = false;

  function handlePDFClick(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (isProcessing) return;
    isProcessing = true;

    setTimeout(() => {
      try { window.print(); }
      catch (err) { console.error('[PDF] print error:', err); }
      finally {
        setTimeout(() => { isProcessing = false; }, 1000);
      }
    }, 50);
  }

  function initButton() {
    const btn = document.getElementById(CONFIG.selectors.button);
    if (!btn) return;
    btn.addEventListener('click', handlePDFClick);
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handlePDFClick(e);
      }
    });
    if (DEBUG) console.log('[PDF] button bound');
  }

  /* ──────────────────────────────────────────────
     Bootstrap
     ────────────────────────────────────────────── */
  // Print hooks — fire whether user clicks our button OR Ctrl+P
  window.addEventListener('beforeprint', preparePrintLayout);
  window.addEventListener('afterprint', restorePrintLayout);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const isListPage =
        document.body.classList.contains('list') ||
        document.querySelector('.post-list, .posts-list, [data-page-type="list"]');
      if (isListPage) return;
      initButton();
    });
  } else {
    initButton();
  }
})();
