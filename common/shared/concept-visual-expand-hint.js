(function () {
  'use strict';

  var HINT_COPY =
    'Select the expand icon on the visual below to open it and read the full image.';

  var EXPAND_ICON_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M15 3h6v6"/>' +
      '<path d="M9 21H3v-6"/>' +
      '<path d="M21 3l-7 7"/>' +
      '<path d="M3 21l7-7"/>' +
    '</svg>';

  var scanTimer;

  function hasReadableImage(container) {
    return Array.prototype.some.call(
      container.querySelectorAll('img'),
      function (img) {
        return !!(img.getAttribute('src') || '').trim();
      }
    );
  }

  function isVisualSection(container) {
    if (!container) return false;
    if (container.classList.contains('concept-image')) return true;
    if (container.classList.contains('visual-direct')) return true;
    if (container.matches('[data-concept-primary-image], [data-concept-intro-media], .b3c2-concept-hero')) {
      return true;
    }

    var head =
      container.querySelector(':scope > .concept-section-head') ||
      container.querySelector(':scope > h5.concept-section-head');
    if (head && /visual/i.test(head.textContent || '')) return true;

    return false;
  }

  function buildHint() {
    var hint = document.createElement('p');
    hint.className = 'concept-visual-hint';
    hint.innerHTML =
      '<span class="concept-visual-hint__icon" aria-hidden="true">' +
        EXPAND_ICON_SVG +
      '</span>' +
      '<span class="concept-visual-hint__text">' + HINT_COPY + '</span>';
    return hint;
  }

  function insertHint(container) {
    if (!container || container.querySelector(':scope > .concept-visual-hint')) return;
    if (!hasReadableImage(container) || !isVisualSection(container)) return;

    var hint = buildHint();
    var head =
      container.querySelector(':scope > .concept-section-head') ||
      container.querySelector(':scope > h5.concept-section-head');
    var media =
      container.querySelector(':scope > .concept-activity-box') ||
      container.querySelector(':scope > .concept-image') ||
      container.querySelector(':scope > figure') ||
      container.querySelector(':scope > img');

    if (head) {
      head.insertAdjacentElement('afterend', hint);
      return;
    }

    if (media) {
      container.insertBefore(hint, media);
      return;
    }

    container.insertBefore(hint, container.firstChild);
  }

  function scan(root) {
    root = root || document;
    var selectors = [
      '.concept-section-card',
      '.concept-image',
      '[data-concept-primary-image]',
      '[data-concept-intro-media]',
      '.b3c2-concept-hero'
    ].join(',');

    root.querySelectorAll(selectors).forEach(insertHint);
  }

  function scheduleScan(root) {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(function () {
      scan(root || document);
    }, 80);
  }

  function init() {
    scan();

    document.querySelectorAll('.portal').forEach(function (portal) {
      if (portal.__conceptVisualHintObserved) return;
      portal.__conceptVisualHintObserved = true;

      new MutationObserver(function () {
        scheduleScan(portal);
      }).observe(portal, {
        childList: true,
        subtree: true
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
