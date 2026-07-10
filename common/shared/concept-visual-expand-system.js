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
  var builtinModal = null;

  function setModalOpener(fn) {
    modalOpener = typeof fn === 'function' ? fn : null;
  }

  function bindModalOpenerFromWindow() {
    if (typeof modalOpener === 'function') return;
    if (typeof window.openMediaModal === 'function') {
      modalOpener = window.openMediaModal;
    }
  }

  function escapeAttr(value) {
    return String(value || '').replace(/"/g, '&quot;');
  }

  function isImageOnlyModalHTML(html) {
    if (!html || typeof html !== 'string') return false;
    try {
      var doc = new DOMParser().parseFromString(html.trim(), 'text/html');
      var body = doc.body;
      return !!(
        body &&
        body.children.length === 1 &&
        body.firstElementChild &&
        body.firstElementChild.tagName === 'IMG'
      );
    } catch (err) {
      return false;
    }
  }

  function openPageMediaModal(html, title) {
    var mediaModal = document.getElementById('mediaModal');
    var mediaModalBody = document.getElementById('mediaModalBody');
    var mediaModalTitle = document.getElementById('mediaModalTitle');
    if (!mediaModal || !mediaModalBody) return false;

    mediaModalBody.innerHTML = html;
    var imageOnly = isImageOnlyModalHTML(html);

    if (mediaModalTitle) {
      if (imageOnly) {
        mediaModalTitle.textContent = '';
        mediaModalTitle.setAttribute('aria-hidden', 'true');
      } else {
        mediaModalTitle.textContent = title || 'Expanded slide';
        mediaModalTitle.removeAttribute('aria-hidden');
      }
    }

    var dlg = mediaModal.querySelector('.media-modal-dialog');
    if (dlg) {
      if (imageOnly) dlg.setAttribute('aria-label', 'Expanded image');
      else dlg.removeAttribute('aria-label');
    }

    mediaModal.classList.toggle('media-modal--image-only', imageOnly);
    mediaModal.classList.add('open');
    mediaModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    return true;
  }

  function closeBuiltinModal() {
    if (!builtinModal) return;
    builtinModal.classList.remove('open');
    builtinModal.setAttribute('aria-hidden', 'true');
    var body = builtinModal.querySelector('.concept-expand-fallback-body');
    if (body) body.innerHTML = '';
    document.body.style.overflow = '';
  }

  function ensureBuiltinModal() {
    if (builtinModal) return builtinModal;

    builtinModal = document.createElement('div');
    builtinModal.className = 'concept-expand-fallback-modal';
    builtinModal.id = 'conceptExpandFallbackModal';
    builtinModal.setAttribute('aria-hidden', 'true');
    builtinModal.innerHTML =
      '<div class="concept-expand-fallback-dialog" role="dialog" aria-modal="true" aria-label="Expanded image">' +
        '<button type="button" class="concept-expand-fallback-close" aria-label="Close">Close</button>' +
        '<div class="concept-expand-fallback-body"></div>' +
      '</div>';

    document.body.appendChild(builtinModal);

    builtinModal.querySelector('.concept-expand-fallback-close').addEventListener('click', closeBuiltinModal);
    builtinModal.addEventListener('click', function (event) {
      if (event.target === builtinModal) closeBuiltinModal();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && builtinModal.classList.contains('open')) closeBuiltinModal();
    });

    return builtinModal;
  }

  function openBuiltinModal(html, title) {
    var modal = ensureBuiltinModal();
    var body = modal.querySelector('.concept-expand-fallback-body');
    if (body) body.innerHTML = html;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function resolveModalOpener(options) {
    bindModalOpenerFromWindow();
    if (options && typeof options.openModal === 'function') return options.openModal;
    if (typeof modalOpener === 'function') return modalOpener;
    if (typeof window.openMediaModal === 'function') return window.openMediaModal;
    return function (html, title) {
      if (!openPageMediaModal(html, title)) openBuiltinModal(html, title);
    };
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

  function imageSrc(img) {
    return (img && (img.currentSrc || img.getAttribute('src') || img.src)) || '';
  }

  function shouldSkipImage(img, options) {
    if (!img || img.tagName !== 'IMG') return true;
    if (!imageSrc(img).trim()) return true;
    if (img.closest('[data-parent-subconcept-nav]')) return true;
    if (img.closest('[data-expand-media]')) return true;
    if (img.closest('.b2-screen:not(.active)')) return true;
    if (
      img.closest(
        '.b2-level-thumb, .concept-square--level, .b2l-level-mascot, .b2l-focus-mascot-bar, ' +
        '.breadcrumb-mascot, .level-badge-mascot, .concept-title-icon--mascot, ' +
        '.pjm-mascot-mark, .pjm-ocean-node-icon, [data-no-expand="true"]'
      )
    ) {
      return true;
    }

    var exclude = (options && options.exclude) || [];
    for (var i = 0; i < exclude.length; i++) {
      if (img.closest(exclude[i])) return true;
    }
    return false;
  }

  function getExpandHost(img) {
    var activityBox = img.closest('.concept-activity-box');
    if (activityBox) return activityBox;

    var direct =
      img.closest('.b2c2-direct-image') ||
      img.closest('.b2c3-direct-image') ||
      img.closest('.entry-exit-fan-item') ||
      img.closest('figure');
    if (direct) return direct;

    var card = img.closest('.concept-section-card');
    if (card && card.querySelector('.concept-points-box, .concept-activity-section, [data-activity], .concept-activity-interactive')) {
      return img.parentElement;
    }

    return (
      img.closest('[data-concept-primary-image]') ||
      img.closest('[data-concept-intro-media]') ||
      img.closest('.b3c2-concept-hero') ||
      img.parentElement
    );
  }

  function getPrimaryImageSlot(host) {
    if (!host) return null;
    if (host.closest('[data-b2-screens], .b2-screens')) return null;
    var imageSlot = host.closest('.concept-image');
    if (imageSlot && imageSlot.classList.contains('concept-section-card')) {
      if (isComplexImageSlot(imageSlot)) return null;
      return imageSlot;
    }
    return null;
  }

  function findDedicatedVisualCard(section) {
    if (!section || !section.querySelectorAll) return null;
    var cards = section.querySelectorAll(':scope > .concept-section-card');
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var head = card.querySelector(
        ':scope > .concept-section-head, :scope > h4.concept-section-head, :scope > h5.concept-section-head'
      );
      if (head && isVisualHead(head)) return card;
    }
    return null;
  }

  function isComplexImageSlot(section) {
    if (!section) return false;
    return !!section.querySelector(
      '[data-b2-screens], .b2-screens, .carousel, .carousel-inline, .overview-subconcept-shell, ' +
      '[data-parent-subconcept-nav], [data-concept-grid]'
    );
  }

  function getVisualSection(host) {
    if (!host) return null;

    var primarySlot = getPrimaryImageSlot(host);
    if (primarySlot) return primarySlot;

    var card = host.closest('.concept-section-card');
    if (card) return card;

    return (
      host.closest('[data-concept-primary-image]') ||
      host.closest('[data-concept-intro-media]') ||
      host.closest('.b3c2-concept-hero') ||
      host.closest('.block-intro-slide .concept-image') ||
      (host.classList.contains('concept-image') ? host : null)
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
      if (isComplexImageSlot(section) || findDedicatedVisualCard(section)) {
        return false;
      }
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
      ':scope > .concept-points-box, :scope > .section-activity, :scope > .concept-section-card.section-ideas, ' +
      ':scope > .b2pl-cat-grid, :scope > .b2-nav, :scope > .b2pl-folder-grid'
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
      img.closest(
        '.entry-exit-fan-grid, .entry-exit-fan-item, .carousel-slide, .carousel-inline-slide, ' +
        '.b2pl-folder-grid, .subconcept-box, .b2-level-thumb, .concept-square--level, ' +
        '.b2l-level-mascot, .b2l-focus-mascot-bar, .breadcrumb-mascot, .level-badge-mascot, ' +
        '.concept-title-icon--mascot, .pjm-mascot-mark, .pjm-ocean-node-icon, [data-no-expand="true"]'
      )
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
      section.classList.contains('concept-activity-box') ||
      section.classList.contains('b2c2-direct-image') ||
      section.classList.contains('b2c3-direct-image') ||
      section.classList.contains('b2c2-direct-image-group') ||
      section.classList.contains('entry-exit-fan-item')
    ) {
      return true;
    }
    if (section.classList.contains('section-activity-shell') || section.classList.contains('section-ideas')) {
      return true;
    }
    if (section.classList.contains('concept-image') && isComplexImageSlot(section)) {
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

  function dedupeVisualChrome(section) {
    if (!section) return;
    var visualHeads = [];
    section.querySelectorAll(':scope > .concept-section-head, :scope > h4.concept-section-head, :scope > h5.concept-section-head').forEach(function (head) {
      if (isVisualHead(head)) visualHeads.push(head);
    });
    for (var i = 1; i < visualHeads.length; i++) {
      visualHeads[i].remove();
    }
    var guides = section.querySelectorAll(':scope > .concept-visual-guide');
    for (var j = 1; j < guides.length; j++) {
      guides[j].remove();
    }
  }

  function ensureVisualSection(section) {
    if (!section || section.hasAttribute('data-visual-section-ready')) return;
    if (shouldSkipVisualSection(section)) return;

    dedupeVisualChrome(section);

    var head = ensureVisualHead(section);
    if (!head) return;

    ensureVisualGuide(section, head);

    if (isVisualOnlySection(section)) {
      section.classList.add('section-visual-shell', 'visual-direct');
    }

    section.setAttribute('data-visual-section-ready', 'true');
  }

  function isNestedVisualSlot(slot) {
    if (!slot || !slot.matches) return false;
    if (!slot.matches('.concept-image, .b3c2-concept-hero')) return false;
    var parentSlot = slot.parentElement && slot.parentElement.closest(
      '[data-concept-intro-media], [data-concept-primary-image], .b3c2-concept-hero'
    );
    return !!(parentSlot && parentSlot !== slot);
  }

  function collectVisualSections(root) {
    var sections = new Set();

    root.querySelectorAll('.img-expand-btn').forEach(function (btn) {
      var section = getVisualSection(btn.parentElement);
      if (section) sections.add(section);
    });

    root.querySelectorAll('.concept-section-card').forEach(function (card) {
      if (card.classList.contains('concept-image')) return;
      var head = card.querySelector(':scope > .concept-section-head, :scope > h4.concept-section-head, :scope > h5.concept-section-head');
      if (head && isVisualHead(head)) sections.add(card);
    });

    root.querySelectorAll('.concept-image, [data-concept-primary-image], [data-concept-intro-media], .b3c2-concept-hero').forEach(function (slot) {
      if (!slot.querySelector('img[src], img[srcset]')) return;
      if (isComplexImageSlot(slot)) return;
      if (findDedicatedVisualCard(slot)) return;
      if (isNestedVisualSlot(slot)) return;
      sections.add(slot);
    });

    return sections;
  }

  function syncVisualSections(root) {
    collectVisualSections(root || document).forEach(ensureVisualSection);
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
    root.querySelectorAll('.concept-activity-box > .concept-section-head[data-visual-head-auto="true"], .concept-activity-box > .concept-visual-guide').forEach(function (node) {
      node.remove();
    });
    root.querySelectorAll('[data-visual-section-ready]').forEach(function (section) {
      section.removeAttribute('data-visual-section-ready');
      section.classList.remove('section-visual-shell', 'visual-direct');
    });
  }

  function openExpandedImage(img, panel, options) {
    var src = imageSrc(img);
    if (!src) return;
    var alt = img.alt || 'Expanded image';
    var opener = resolveModalOpener(options);
    opener(
      '<img src="' + escapeAttr(src) + '" alt="' + escapeAttr(alt) + '" />',
      (options && options.getTitle ? options.getTitle(panel, img) : defaultTitle(panel, img))
    );
  }

  function syncPanelVisualFlowState(panel) {
    if (!panel) return;
    var buttons = panel.querySelectorAll('.img-expand-btn');
    if (!buttons.length) {
      panel.removeAttribute('data-flow-visual-expanded');
      return;
    }
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].getAttribute('data-visual-expanded') !== 'true') {
        panel.removeAttribute('data-flow-visual-expanded');
        return;
      }
    }
    panel.setAttribute('data-flow-visual-expanded', 'true');
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
      btn.setAttribute('data-visual-expanded', 'true');
      var host = btn.closest('[data-expandable-visual]');
      if (host) host.setAttribute('data-visual-expanded', 'true');
      syncPanelVisualFlowState(panel);
      openExpandedImage(img, panel, options);
      try {
        document.dispatchEvent(new CustomEvent('concept-visual-expand-change', { bubbles: true, detail: { panel: panel } }));
      } catch (err) {}
    });
    return btn;
  }

  function wire(root, options) {
    options = options || {};
    root = root || document;
    if (!root.querySelectorAll) return;

    bindModalOpenerFromWindow();
    clearExpandables(options.clearRoot || root);

    var panel = options.panel || root.closest('.concept-panel') || null;
    var wiredImages = new Set();

    root.querySelectorAll(IMAGE_QUERY).forEach(function (img) {
      if (shouldSkipImage(img, options)) return;
      if (panel && !panel.contains(img)) return;
      if (wiredImages.has(img)) return;

      ensureVisualMediaBox(img);

      var host = getExpandHost(img);
      if (!host) return;

      wiredImages.add(img);
      if (window.getComputedStyle(host).position === 'static') {
        host.style.position = 'relative';
      }
      host.setAttribute('data-expandable-visual', 'true');
      host.appendChild(createExpandButton(img, panel, options));
    });

    syncVisualSections(options.syncRoot || root);
    if (window.ConceptSectionIcons) {
      ConceptSectionIcons.scan(root);
    }
    if (panel) {
      try {
        document.dispatchEvent(new CustomEvent('concept-visual-expand-wire', { bubbles: true, detail: { panel: panel } }));
      } catch (err) {}
    }
  }

  function wireBlockIntroSlides() {
    document.querySelectorAll('.block-intro-slide').forEach(function (slide) {
      wire(slide);
    });
  }

  function initDocument() {
    bindModalOpenerFromWindow();
    wireBlockIntroSlides();
  }

  window.ConceptVisualExpand = {
    setModalOpener: setModalOpener,
    wire: wire,
    syncVisualSections: syncVisualSections,
    wireBlockIntroSlides: wireBlockIntroSlides,
    hintCopy: HINT_COPY,
    visualLabel: VISUAL_LABEL
  };

  bindModalOpenerFromWindow();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDocument);
  } else {
    initDocument();
  }
})();
