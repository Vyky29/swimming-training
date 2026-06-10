(function () {
  'use strict';

  var HINT_COPY = 'Use the expand icon to view the full image.';
  var VISUAL_LABEL = 'Visual Image';

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

  var MEDIA_CHILD_SELECTORS =
    ':scope > .concept-activity-box, :scope > .b2c2-direct-image, :scope > .b2c3-direct-image, ' +
    ':scope > [data-concept-primary-image], :scope > [data-concept-intro-media], ' +
    ':scope > .b3c2-concept-hero, :scope > figure, :scope > img';

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
    var direct =
      img.closest('.b2c2-direct-image') ||
      img.closest('.b2c3-direct-image') ||
      img.closest('.entry-exit-fan-item') ||
      img.closest('figure') ||
      img.closest('.concept-activity-box');
    if (direct) return direct;

    var card = img.closest('.concept-section-card');
    if (card && card.querySelector('.concept-points-box, .concept-activity-section, [data-activity], .concept-activity-interactive')) {
      return img.closest('.concept-activity-box') || img.parentElement;
    }

    return (
      card ||
      img.closest('[data-concept-primary-image]') ||
      img.closest('[data-concept-intro-media]') ||
      img.closest('.b3c2-concept-hero') ||
      img.closest('.concept-image') ||
      img.parentElement
    );
  }

  function getVisualSection(host) {
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

  function isVisualHead(head) {
    if (!head) return false;
    var text = (head.textContent || '').toLowerCase();
    if (/key ideas|activity|introduction|intro|in practice/.test(text)) return false;
    return /visual|concept image|\u{1f5bc}/u.test(text);
  }

  function isVisualOnlySection(section) {
    if (!section) return false;
    if (section.matches('[data-concept-primary-image], [data-concept-intro-media], .b3c2-concept-hero')) {
      return true;
    }
    if (section.classList.contains('concept-image')) {
      if (
        section.querySelector(
          '[data-parent-subconcept-nav], [data-concept-grid], .concept-activity-section, ' +
          '[data-activity], .concept-points-box, .concept-activity-interactive'
        )
      ) {
        return false;
      }
      return !!section.querySelector('img[src], img[srcset]');
    }
    var head = section.querySelector(':scope > .concept-section-head, :scope > h4.concept-section-head, :scope > h5.concept-section-head');
    if (!head || !isVisualHead(head)) return false;
    return !section.querySelector(
      ':scope > .concept-points-box, :scope > .section-activity, :scope > .concept-section-card.section-ideas'
    );
  }

  function findFirstMediaChild(section) {
    if (!section || !section.querySelector) return null;
    var selectors = MEDIA_CHILD_SELECTORS.split(',').map(function (part) {
      return part.trim();
    });
    for (var i = 0; i < selectors.length; i++) {
      var node = section.querySelector(selectors[i]);
      if (node) return node;
    }
    return null;
  }

  function shouldSkipMediaWrap(img) {
    return !!(
      img.closest('.entry-exit-fan-grid, .entry-exit-fan-item, .carousel-slide, .carousel-inline-slide, .b2pl-folder-grid, .subconcept-box')
    );
  }

  function ensureVisualMediaBox(img) {
    if (!img || img.tagName !== 'IMG' || shouldSkipMediaWrap(img)) return null;
    if (img.closest('.concept-activity-box')) return img.closest('.concept-activity-box');
    var parent = img.parentElement;
    if (!parent) return null;
    var box = document.createElement('div');
    box.className = 'concept-activity-box';
    parent.insertBefore(box, img);
    box.appendChild(img);
    return box;
  }

  function buildVisualHeadHtml(label, tagName) {
    tagName = tagName || 'div';
    if (window.ConceptSectionIcons) {
      return ConceptSectionIcons.headHtml('visual', label, tagName);
    }
    return (
      '<' + tagName + ' class="concept-section-head" data-visual-head-auto="true">' +
        '<span class="icon icon--visual" aria-hidden="true">' + EXPAND_ICON_SVG + '</span>' +
        '<span>' + label + '</span>' +
      '</' + tagName + '>'
    );
  }

  function ensureVisualHead(section) {
    var head = section.querySelector(
      ':scope > .concept-section-head, :scope > h4.concept-section-head, :scope > h5.concept-section-head'
    );

    if (head && !isVisualHead(head)) return head;

    if (head && isVisualHead(head)) {
      head.outerHTML = buildVisualHeadHtml(VISUAL_LABEL, head.tagName.toLowerCase());
      return section.querySelector(
        ':scope > .concept-section-head, :scope > h4.concept-section-head, :scope > h5.concept-section-head'
      );
    }

    var media = findFirstMediaChild(section);
    var html = buildVisualHeadHtml(VISUAL_LABEL);
    if (media) {
      media.insertAdjacentHTML('beforebegin', html);
    } else {
      section.insertAdjacentHTML('afterbegin', html);
    }

    head = section.querySelector(':scope > .concept-section-head, :scope > h4.concept-section-head, :scope > h5.concept-section-head');
    if (head) head.setAttribute('data-visual-head-auto', 'true');
    return head;
  }

  function ensureVisualGuide(section, head) {
    if (!section || !head) return null;

    section.querySelectorAll(':scope > .concept-visual-hint').forEach(function (hint) {
      hint.remove();
    });

    var guide = section.querySelector(':scope > .concept-visual-guide');
    if (!guide) {
      guide = document.createElement('p');
      guide.className = 'concept-visual-guide';
      guide.textContent = HINT_COPY;
      head.insertAdjacentElement('afterend', guide);
    } else {
      guide.textContent = HINT_COPY;
    }
    return guide;
  }

  function shouldSkipVisualSection(section) {
    if (!section) return true;
    if (
      section.classList.contains('b2c2-direct-image') ||
      section.classList.contains('b2c3-direct-image') ||
      section.classList.contains('b2c2-direct-image-group')
    ) {
      return true;
    }
    if (section.classList.contains('section-activity-shell') || section.classList.contains('section-ideas')) {
      return true;
    }
    var head = section.querySelector(
      ':scope > .concept-section-head, :scope > h4.concept-section-head, :scope > h5.concept-section-head'
    );
    if (head) {
      var text = (head.textContent || '').toLowerCase();
      if (/activity|key ideas|introduction|intro|in practice/.test(text)) return true;
    }
    return false;
  }

  function ensureVisualSection(section) {
    if (!section || section.hasAttribute('data-visual-section-ready')) return;
    if (shouldSkipVisualSection(section)) return;

    var head = ensureVisualHead(section);
    if (!head) return;

    ensureVisualGuide(section, head);

    if (isVisualOnlySection(section)) {
      section.classList.add('section-visual-shell', 'visual-direct');
    }

    section.setAttribute('data-visual-section-ready', 'true');
  }

  function syncVisualSections(root) {
    root = root || document;
    var sections = new Set();

    root.querySelectorAll('.img-expand-btn').forEach(function (btn) {
      var host = btn.parentElement;
      var section = getVisualSection(host);
      if (section) sections.add(section);
    });

    sections.forEach(ensureVisualSection);
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
    root.querySelectorAll('.concept-visual-guide').forEach(function (guide) {
      guide.remove();
    });
    root.querySelectorAll('[data-visual-head-auto="true"]').forEach(function (head) {
      head.remove();
    });
    root.querySelectorAll('[data-visual-section-ready]').forEach(function (section) {
      section.removeAttribute('data-visual-section-ready');
      section.classList.remove('section-visual-shell', 'visual-direct');
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

      ensureVisualMediaBox(img);

      var host = getExpandHost(img);
      if (!host || wiredHosts.has(host)) return;

      wiredHosts.add(host);
      if (window.getComputedStyle(host).position === 'static') {
        host.style.position = 'relative';
      }
      host.setAttribute('data-expandable-visual', 'true');
      host.appendChild(createExpandButton(img, panel, options));
    });

    syncVisualSections(root);
    if (window.ConceptSectionIcons) {
      ConceptSectionIcons.scan(root);
    }
  }

  function initObservers() {
    /* Expand buttons are wired explicitly from each module's renderConcept. */
  }

  window.ConceptVisualExpand = {
    setModalOpener: setModalOpener,
    wire: wire,
    syncVisualSections: syncVisualSections,
    hintCopy: HINT_COPY,
    visualLabel: VISUAL_LABEL
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObservers);
  } else {
    initObservers();
  }
})();
