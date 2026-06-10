(function () {
  'use strict';

  var HINT_COPY = 'Use the expand icon to view the full image.';

  var EXPAND_ICON_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M15 3h6v6"/>' +
      '<path d="M9 21H3v-6"/>' +
      '<path d="M21 3l-7 7"/>' +
      '<path d="M3 21l7-7"/>' +
    '</svg>';

  var IMAGE_QUERY =
    '.concept-image img, [data-concept-primary-image] img, [data-concept-intro-media] img, ' +
    '.b3c2-concept-hero img, .concept-section-card img, .concept-activity-box img, ' +
    '.block-intro-slide .concept-image img, .b2c2-direct-image img, .b2c3-direct-image img, ' +
    '.entry-exit-fan-item img, figure img';

  var modalOpener = null;

  function setModalOpener(fn) {
    modalOpener = typeof fn === 'function' ? fn : null;
  }

  function escapeAttr(value) {
    return String(value || '').replace(/"/g, '&quot;');
  }

  function defaultTitle(panel, img) {
    if (img && img.alt && String(img.alt).trim()) return String(img.alt).trim();
    if (!panel) return 'Expanded image';
    var titleEl =
      panel.querySelector('.concept-panel-title') ||
      panel.querySelector('[data-concept-breadcrumb] .breadcrumb-part.current') ||
      panel.querySelector('h4');
    return (titleEl && titleEl.textContent && titleEl.textContent.trim()) || 'Expanded image';
  }

  function shouldSkipImage(img, options) {
    if (!img || img.tagName !== 'IMG') return true;
    if (!(img.getAttribute('src') || '').trim()) return true;
    if (img.closest('[data-parent-subconcept-nav]')) return true;
    if (img.closest('[data-expand-media]')) return true;

    var exclude = (options && options.exclude) || [];
    for (var i = 0; i < exclude.length; i++) {
      if (img.closest(exclude[i])) return true;
    }
    return false;
  }

  function getExpandHost(img) {
    return (
      img.closest('figure') ||
      img.closest('.entry-exit-fan-item') ||
      img.closest('.b2c2-direct-image') ||
      img.closest('.b2c3-direct-image') ||
      img.closest('.concept-activity-box') ||
      img.closest('.concept-section-card') ||
      img.closest('[data-concept-primary-image]') ||
      img.closest('[data-concept-intro-media]') ||
      img.closest('.b3c2-concept-hero') ||
      img.closest('.concept-image')
    );
  }

  function getHintSection(host) {
    if (!host) return null;
    return (
      host.closest('.concept-section-card') ||
      host.closest('[data-concept-primary-image]') ||
      host.closest('[data-concept-intro-media]') ||
      host.closest('.b3c2-concept-hero') ||
      host.closest('.block-intro-slide .concept-image') ||
      (host.classList.contains('concept-image') ? host : null) ||
      host
    );
  }

  function buildHint() {
    var hint = document.createElement('p');
    hint.className = 'concept-visual-hint';
    hint.innerHTML =
      '<span class="concept-visual-hint__icon" aria-hidden="true">' + EXPAND_ICON_SVG + '</span>' +
      '<span class="concept-visual-hint__text">' + HINT_COPY + '</span>';
    return hint;
  }

  function insertHint(section) {
    if (!section || section.querySelector(':scope > .concept-visual-hint')) return;

    var hint = buildHint();
    var head =
      section.querySelector(':scope > .concept-section-head') ||
      section.querySelector(':scope > h5.concept-section-head');
    var media =
      section.querySelector(':scope > .concept-activity-box') ||
      section.querySelector(':scope > .concept-image') ||
      section.querySelector(':scope > [data-concept-primary-image]') ||
      section.querySelector(':scope > [data-concept-intro-media]') ||
      section.querySelector(':scope > .b3c2-concept-hero') ||
      section.querySelector(':scope > figure') ||
      section.querySelector(':scope > img');

    if (head) {
      head.insertAdjacentElement('afterend', hint);
      return;
    }
    if (media) {
      section.insertBefore(hint, media);
      return;
    }
    section.insertBefore(hint, section.firstChild);
  }

  function syncHints(root) {
    root = root || document;
    var sections = new Set();

    root.querySelectorAll('.img-expand-btn').forEach(function (btn) {
      var host = btn.parentElement;
      var section = getHintSection(host);
      if (section) sections.add(section);
    });

    sections.forEach(insertHint);
  }

  function clearExpandables(root) {
    root.querySelectorAll('.img-expand-btn').forEach(function (btn) {
      btn.remove();
    });
    root.querySelectorAll('[data-expandable-visual]').forEach(function (host) {
      host.removeAttribute('data-expandable-visual');
    });
    root.querySelectorAll('.concept-visual-hint').forEach(function (hint) {
      hint.remove();
    });
  }

  function createExpandButton(img, panel, options) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'img-expand-btn';
    btn.setAttribute('aria-label', 'Expand image');
    btn.innerHTML = EXPAND_ICON_SVG;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var opener = (options && options.openModal) || modalOpener;
      if (!opener) return;
      var alt = img.alt || 'Expanded image';
      opener(
        '<img src="' + img.src + '" alt="' + escapeAttr(alt) + '" />',
        (options && options.getTitle ? options.getTitle(panel, img) : defaultTitle(panel, img))
      );
    });
    return btn;
  }

  function wire(root, options) {
    options = options || {};
    root = root || document;
    if (!root.querySelectorAll) return;

    clearExpandables(root);

    var panel = options.panel || root.closest('.concept-panel') || null;
    var wiredHosts = new Set();

    root.querySelectorAll(IMAGE_QUERY).forEach(function (img) {
      if (shouldSkipImage(img, options)) return;
      if (panel && !panel.contains(img)) return;

      var host = getExpandHost(img);
      if (!host || wiredHosts.has(host)) return;

      wiredHosts.add(host);
      if (window.getComputedStyle(host).position === 'static') {
        host.style.position = 'relative';
      }
      host.setAttribute('data-expandable-visual', 'true');
      host.appendChild(createExpandButton(img, panel, options));
    });

    syncHints(root);
  }

  function initObservers() {
    /* Expand buttons are wired explicitly from each module's renderConcept. */
  }

  window.ConceptVisualExpand = {
    setModalOpener: setModalOpener,
    wire: wire,
    syncHints: syncHints,
    hintCopy: HINT_COPY
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObservers);
  } else {
    initObservers();
  }
})();
