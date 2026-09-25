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
  var IMAGE_DWELL_MS = 0;
  var dwellSeen = {};
  try { dwellSeen = JSON.parse(sessionStorage.getItem('cs_img_dwell') || '{}'); } catch (err) { dwellSeen = {}; }

  function setModalOpener(fn) {
    var pageFn = typeof fn === 'function' ? fn : null;
    modalOpener = function (html, title) {
      var result = pageFn ? pageFn(html, title) : null;
      var modal = document.getElementById('mediaModal') || document.getElementById('conceptExpandFallbackModal');
      if (modal && modal.classList.contains('open')) beginImageDwell(modal);
      return result;
    };
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
    if (imageOnly) beginImageDwell(mediaModal);
    return true;
  }

  function closeBuiltinModal() {
    if (!builtinModal) return;
    if (builtinModal.dataset.imageDwellUntil) return;
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
    beginImageDwell(modal);
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
        '.pjm-mascot-mark, .pjm-ocean-node-icon, .stage-intro-hero, .stage-intro-hero-mascot, .stage-intro-hero-world, [data-no-expand="true"], .m5-ftx, [data-m5-ftx], [data-m5-ftx-no-expand="true"]'
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
        '.concept-title-icon--mascot, .pjm-mascot-mark, .pjm-ocean-node-icon, ' +
        '.stage-intro-hero, .stage-intro-hero-mascot, .stage-intro-hero-world, [data-no-expand="true"]'
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
      section.classList.contains('entry-exit-fan-item') ||
      section.classList.contains('m5-explore-categories-card') ||
      section.classList.contains('m5-yellow-use-cards')
    ) {
      return true;
    }
    if (section.getAttribute('data-m5-explore-categories') === '1') return true;
    if (section.getAttribute('data-m5-yellow-use') === '1') return true;
    if (section.querySelector(':scope > .b2pl-cat-grid, :scope > .b2pl-folder-grid')) return true;
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
      if (/activity|key ideas|introduction|intro|in practice|explore the/.test(text)) return true;
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
      btn.setAttribute('data-visual-opening', 'true');
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

  function rememberSeen(src) {
    if (!src) return;
    dwellSeen[src] = 1;
    try { sessionStorage.setItem('cs_img_dwell', JSON.stringify(dwellSeen)); } catch (err) {}
  }

  function markSrcExpanded(src) {
    if (!src) return;
    document.querySelectorAll('.img-expand-btn').forEach(function (btn) {
      var host = btn.closest('[data-expandable-visual]');
      var img = host && host.querySelector('img');
      var imgSrc = img && (img.currentSrc || img.getAttribute('src') || '');
      if (!imgSrc || (imgSrc !== src && imgSrc.indexOf(src) === -1 && src.indexOf(imgSrc) === -1)) return;
      btn.setAttribute('data-visual-expanded', 'true');
      btn.removeAttribute('data-visual-opening');
      if (host) host.setAttribute('data-visual-expanded', 'true');
      var panel = btn.closest('.concept-panel');
      if (panel) syncPanelVisualFlowState(panel);
    });
    try {
      document.dispatchEvent(new CustomEvent('concept-visual-expand-change', { bubbles: true }));
    } catch (err) {}
  }

  function cleanSpeech(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function capWords(text, max) {
    var words = cleanSpeech(text).split(' ').filter(Boolean);
    if (words.length <= max) return words.join(' ');
    return words.slice(0, max).join(' ').replace(/[,:;]$/, '') + '.';
  }

  function firstSentences(text, count) {
    var parts = cleanSpeech(text).split(/(?<=[.!?])\s+/).filter(Boolean);
    return parts.slice(0, count).join(' ');
  }

  function teachingRoot(img) {
    if (!img) return null;
    return img.closest('.concept-panel, .block-intro-slide, .block-part, section') || null;
  }

  function infographicScript(img) {
    var src = img && (img.currentSrc || img.getAttribute('src') || '');
    var file = String(src).split('/').pop().split('?')[0];
    var written = file && global.TrainingIImageSpeech && global.TrainingIImageSpeech[file];
    if (written) return written;
    var root = teachingRoot(img);
    if (!root) return '';
    var heading = root.querySelector('.concept-heading-row h4, .concept-panel-title, h3, h4');
    var title = cleanSpeech(heading && heading.textContent);
    var desc = root.querySelector('.concept-panel-desc, .concept-insight-body, .concept-intro-copy');
    var body = cleanSpeech(desc && desc.textContent);
    if (!body) {
      var paras = root.querySelectorAll('p');
      var bits = [];
      for (var i = 0; i < paras.length && bits.length < 2; i++) {
        if (paras[i].closest('.key-ideas-action, .media-modal, nav, button')) continue;
        var line = cleanSpeech(paras[i].textContent);
        if (line.length > 40) bits.push(line);
      }
      body = bits.join(' ');
    }
    var ideas = [];
    root.querySelectorAll('.key-idea-text, .concept-insight-pillar').forEach(function (node) {
      var line = cleanSpeech(node.textContent);
      if (line && ideas.length < 3) ideas.push(line.replace(/\.$/, ''));
    });
    var spoken = '';
    if (title) spoken += title + '. ';
    if (body) spoken += firstSentences(body, 2) + ' ';
    if (ideas.length) spoken += 'What matters is ' + ideas.join('. ') + '.';
    return capWords(spoken, 90);
  }

  function sourceImage(src) {
    if (!src) return null;
    var imgs = document.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i].closest('#mediaModal, #conceptExpandFallbackModal')) continue;
      var current = imgs[i].currentSrc || imgs[i].getAttribute('src') || '';
      if (current && (current === src || current.indexOf(src) !== -1 || src.indexOf(current) !== -1)) return imgs[i];
    }
    return null;
  }

  var lastNarration = { src: '', at: 0 };

  function releaseImageClose(modal, src) {
    if (!modal) return;
    delete modal.dataset.imageDwellUntil;
    modal.dataset.imageNarration = 'done';
    var closeBtn = modal.querySelector('.media-modal-close, .concept-expand-fallback-close, #mediaModalClose');
    if (closeBtn) {
      closeBtn.disabled = false;
      closeBtn.removeAttribute('aria-disabled');
      closeBtn.textContent = 'Close';
    }
    rememberSeen(src);
    markSrcExpanded(src);
    try {
      document.dispatchEvent(new CustomEvent('concept-visual-expand-change', { bubbles: true }));
    } catch (err) {}
  }

  function holdImageClose(modal) {
    modal.dataset.imageDwellUntil = 'voice';
    modal.dataset.imageNarration = 'playing';
    var closeBtn = modal.querySelector('.media-modal-close, .concept-expand-fallback-close, #mediaModalClose');
    if (closeBtn) {
      closeBtn.disabled = true;
      closeBtn.setAttribute('aria-disabled', 'true');
      closeBtn.textContent = 'Listen';
    }
  }

  function narrateOpenImage(modal) {
    var shown = modal && modal.querySelector('img');
    var src = shown && (shown.currentSrc || shown.getAttribute('src') || '');
    var img = sourceImage(src) || shown;
    var script = infographicScript(img);
    if (!script && shown) script = cleanSpeech(shown.getAttribute('alt') || '');
    if (!script || !window.CSTrainingVoice || typeof CSTrainingVoice.speak !== 'function') return 'none';
    if (modal.dataset.imageNarration === 'playing' && lastNarration.src === src) return 'held';
    lastNarration = { src: src, at: Date.now() };
    holdImageClose(modal);
    CSTrainingVoice.speak(script, function () { releaseImageClose(modal, src); });
    return 'started';
  }

  function beginImageDwell(modal) {
    if (!modal) return;
    var img = modal.querySelector('img');
    var src = img && (img.currentSrc || img.getAttribute('src') || '');
    if (!src) return;
    var narration = narrateOpenImage(modal);
    if (narration === 'started' || narration === 'held') return;
    holdImageClose(modal);
    var shown = modal.querySelector('img');
    var line = (shown && shown.getAttribute('alt')) || 'This picture shows the idea of this concept. Stay with it until the explanation ends.';
    if (window.CSTrainingVoice && typeof CSTrainingVoice.speak === 'function') {
      CSTrainingVoice.speak(line, function () { releaseImageClose(modal, src); });
      return;
    }
    releaseImageClose(modal, src);
  }

  function dwellBlocksClose(event) {
    var modal = document.getElementById('mediaModal') || document.getElementById('conceptExpandFallbackModal');
    if (!modal || !modal.classList.contains('open') || !modal.dataset.imageDwellUntil) return;
    var closeHit = event.target && event.target.closest && event.target.closest('#mediaModalClose, .media-modal-close, .concept-expand-fallback-close');
    var backdrop = event.target === modal;
    if (!closeHit && !backdrop) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
  }

  function watchImageModal(modal) {
    if (!modal || modal.dataset.dwellWatch === '1') return;
    modal.dataset.dwellWatch = '1';
    var wasOpen = modal.classList.contains('open');
    var obs = new MutationObserver(function () {
      var open = modal.classList.contains('open');
      if (!open) {
        if (wasOpen && window.CSTrainingVoice) CSTrainingVoice.stop();
        wasOpen = false;
        return;
      }
      if (!wasOpen && (modal.classList.contains('media-modal--image-only') || modal.id === 'conceptExpandFallbackModal')) {
        beginImageDwell(modal);
      }
      wasOpen = true;
    });
    obs.observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  function plainSectionSpeech(button) {
    var section = button.closest('section, .concept-panel, .block-part');
    if (!section) return '';
    if (section.id === 'journey') {
      var panel = section.querySelector('.journey-panel');
      return panel ? String(panel.textContent || '').replace(/\s+/g, ' ').trim() : '';
    }
    if (section.id === 'inside-module') {
      var bits = [];
      section.querySelectorAll('.module-roadmap__item, .journey-item').forEach(function (item, index) {
        var title = item.querySelector('.journey-title');
        var hint = item.querySelector('.module-roadmap__hint, .journey-status');
        var line = 'Block ' + (index + 1) + '. ' + (title ? title.textContent : '');
        if (hint && hint.textContent.trim()) line += '. ' + hint.textContent.trim();
        bits.push(line.replace(/\s+/g, ' ').trim());
      });
      return bits.join(' ');
    }
    var copy = section.cloneNode(true);
    copy.querySelectorAll(
      'button, .section-lock-banner, nav, script, style, .img-expand-btn, ' +
      '.cards-review-hint, .key-ideas-instruction, .key-ideas-recap__hint, ' +
      '.small-note, .check-item, .concept-visual-hint, .section-top-actions'
    ).forEach(function (node) { node.remove(); });
    var text = String(copy.textContent || '').replace(/\s+/g, ' ').trim();
    return text.split(/(?<=[.!?])\s+/).filter(function (sentence) {
      return !/\b(click|confirm you|read each|unlock|press |tap )\b/i.test(sentence);
    }).join(' ').replace(/\s+/g, ' ').trim();
  }

  function bindPlainListen() {
    if (document.documentElement.getAttribute('data-plain-listen') === '1') return;
    document.documentElement.setAttribute('data-plain-listen', '1');
    document.addEventListener('click', function (event) {
      var stop = event.target.closest && event.target.closest('[data-tts-stop], [data-concept-tts-stop]');
      if (stop) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (window.CSTrainingVoice) CSTrainingVoice.stop();
        return;
      }
      var listen = event.target.closest && event.target.closest('[data-tts-button], [data-concept-tts]');
      if (!listen || !window.CSTrainingVoice || typeof CSTrainingVoice.speak !== 'function') return;
      var text = plainSectionSpeech(listen);
      if (!text) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      CSTrainingVoice.speak(text);
    }, true);
  }

  function ensureLilyVoice() {
    if (!window.CSTrainingVoice) {
      var voiceAudio = null;
      var voiceGen = 0;
      function piecesOf(text) {
        var clean = String(text || '').replace(/\s+/g, ' ').trim();
        if (!clean) return [];
        var words = clean.split(' ');
        var head = '';
        for (var i = 0; i < words.length; i++) {
          var next = head ? head + ' ' + words[i] : words[i];
          if (next.length > 110 && head) break;
          head = next;
        }
        var pieces = [head];
        var rest = clean.slice(head.length).trim();
        var bucket = '';
        rest.split(/(?<=[.!?])\s+/).filter(Boolean).forEach(function (sentence) {
          var joined = bucket ? bucket + ' ' + sentence : sentence;
          if (bucket && joined.length > 280) {
            pieces.push(bucket);
            bucket = sentence;
          } else bucket = joined;
        });
        if (bucket) pieces.push(bucket);
        return pieces.slice(0, 8);
      }
      window.CSTrainingVoice = {
        id: 'pFZP5JQG7iQjIQuC4Bku',
        name: 'Lily',
        speak: function (text, onDone) {
          var pieces = piecesOf(text);
          if (!pieces.length) return false;
          var gen = ++voiceGen;
          var pending = {};
          function load(index) {
            if (index >= pieces.length || pending[index]) return;
            pending[index] = fetch('/api/tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: pieces[index] })
            }).then(function (res) {
              if (!res.ok) throw new Error('tts');
              return res.blob();
            });
          }
          function play(index) {
            if (gen !== voiceGen || index >= pieces.length) return;
            load(index);
            load(index + 1);
            pending[index].then(function (blob) {
              if (gen !== voiceGen) return;
              if (voiceAudio) { try { voiceAudio.pause(); } catch (err) {} }
              voiceAudio = new Audio(URL.createObjectURL(blob));
              voiceAudio.onended = function () {
                if (index + 1 >= pieces.length) {
                  if (gen === voiceGen && typeof onDone === 'function') onDone();
                  return;
                }
                play(index + 1);
              };
              return voiceAudio.play();
            }).catch(function () {
              if (gen === voiceGen && typeof onDone === 'function') onDone();
            });
          }
          play(0);
          return true;
        },
        trySpeak: function (text) { return this.speak(text); },
        stop: function () {
          voiceGen += 1;
          if (voiceAudio) {
            try { voiceAudio.pause(); } catch (err) {}
            voiceAudio = null;
          }
        }
      };
    }
    if (window.speechSynthesis && !window.speechSynthesis.__trainingIPatched) {
      window.speechSynthesis.speak = function (utterance) {
        try { window.speechSynthesis.cancel(); } catch (err) {}
        var text = utterance && utterance.text ? String(utterance.text) : '';
        if (text) CSTrainingVoice.speak(text);
      };
      var origCancel = window.speechSynthesis.cancel.bind(window.speechSynthesis);
      window.speechSynthesis.cancel = function () {
        origCancel();
        CSTrainingVoice.stop();
      };
      window.speechSynthesis.__trainingIPatched = true;
    }
    bindPlainListen();
  }

  function initDocument() {
    ensureLilyVoice();
    bindModalOpenerFromWindow();
    wireBlockIntroSlides();
    watchImageModal(document.getElementById('mediaModal'));
    document.addEventListener('click', dwellBlocksClose, true);
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      var modal = document.getElementById('mediaModal');
      if (modal && modal.classList.contains('open') && modal.dataset.imageDwellUntil) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      }
    }, true);
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
