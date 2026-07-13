(function () {
  'use strict';

  var ICON_POOL =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M4 9h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z"/>' +
      '<path d="M2 13c1.6-.9 3.2-.9 4.8 0s3.2.9 4.8 0 3.2-.9 4.8 0 3.2.9 4.8 0"/>' +
      '<path d="M8 9V7M12 9V7M16 9V7"/>' +
    '</svg>';

  var ICON_DONE =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M20 6L9 17l-5-5"/>' +
    '</svg>';

  var ICON_LOOK =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>' +
      '<circle cx="12" cy="12" r="3"/>' +
    '</svg>';

  var ICON_AVOID =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="9"/>' +
      '<path d="M8 8l8 8"/>' +
    '</svg>';

  var observerPaused = false;

  function iconHtml(done) {
    return done ? ICON_DONE : ICON_POOL;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function shellInnerHtml(done) {
    var completed = !!done;
    return (
      '<div class="key-ideas-action__body inprac">' +
        '<div class="inprac__top">' +
          '<span class="icon inprac__icon" aria-hidden="true">' + iconHtml(completed) + '</span>' +
          '<div class="inprac__titles">' +
            '<p class="inprac__eyebrow">Instructor cue</p>' +
            '<p class="label inprac__title">In Practice</p>' +
          '</div>' +
          '<span class="inprac__status" data-inprac-status>' + (completed ? 'Done' : 'Review') + '</span>' +
        '</div>' +
        '<div class="key-ideas-action__scenario inprac__body" data-in-practice-slots>' +
          '<div class="inprac__do inprac__part" data-inprac-part="do" role="button" tabindex="0">' +
            '<span class="inprac__do-label">Do</span>' +
            '<p class="inprac__lead" data-inprac-lead></p>' +
            '<span class="inprac__part-check" aria-hidden="true"></span>' +
          '</div>' +
          '<ul class="inprac__beats">' +
            '<li class="inprac__beat inprac__beat--look inprac__part" data-inprac-part="look" data-inprac-look-wrap hidden role="button" tabindex="0">' +
              '<span class="inprac__beat-ico" aria-hidden="true">' + ICON_LOOK + '</span>' +
              '<div class="inprac__beat-copy">' +
                '<span class="inprac__beat-label">Look for</span>' +
                '<p class="inprac__beat-text" data-inprac-look></p>' +
              '</div>' +
              '<span class="inprac__part-check" aria-hidden="true"></span>' +
            '</li>' +
            '<li class="inprac__beat inprac__beat--avoid inprac__part" data-inprac-part="avoid" data-inprac-avoid-wrap hidden role="button" tabindex="0">' +
              '<span class="inprac__beat-ico" aria-hidden="true">' + ICON_AVOID + '</span>' +
              '<div class="inprac__beat-copy">' +
                '<span class="inprac__beat-label">Avoid</span>' +
                '<p class="inprac__beat-text" data-inprac-avoid></p>' +
              '</div>' +
              '<span class="inprac__part-check" aria-hidden="true"></span>' +
            '</li>' +
          '</ul>' +
          '<p class="inprac__then" data-inprac-then hidden></p>' +
          '<span class="text inprac__sr"> </span>' +
        '</div>' +
        '<div class="inprac__footer">' +
          '<span class="inprac__hint" data-inprac-hint>' +
            (completed ? 'Cue reviewed' : 'Tap each cue, then Got it') +
          '</span>' +
          '<span class="key-ideas-action__cta inprac__cta" data-inprac-cta role="button" tabindex="0" aria-disabled="' + (completed ? 'false' : 'true') + '">' +
            (completed ? 'Done' : 'Got it') +
          '</span>' +
        '</div>' +
      '</div>'
    );
  }

  function getTarget(actionEl) {
    if (!actionEl) return '';
    if (actionEl.dataset.inPracticeTarget) return actionEl.dataset.inPracticeTarget;
    var panel = actionEl.closest('.concept-panel');
    return (panel && panel.dataset.currentTarget) || '';
  }

  function resolveCopy(actionEl, fallback) {
    var target = getTarget(actionEl);
    if (window.InPracticeCopy && typeof InPracticeCopy.resolve === 'function') {
      return InPracticeCopy.resolve(target, fallback);
    }
    return fallback || '';
  }

  function resolveCard(actionEl, fallback) {
    var target = getTarget(actionEl);
    if (target) actionEl.dataset.inPracticeTarget = target;
    if (window.InPracticeCopy && typeof InPracticeCopy.resolveCard === 'function') {
      return InPracticeCopy.resolveCard(target, fallback);
    }
    if (window.InPracticeCopy && typeof InPracticeCopy.asCard === 'function') {
      return InPracticeCopy.asCard(null, fallback || resolveCopy(actionEl, fallback));
    }
    var line = fallback || resolveCopy(actionEl, '');
    return { scene: '', notice: '', move: line, watch: '', next: '' };
  }

  function syncChrome(actionEl) {
    if (!actionEl) return;
    var done = actionEl.classList.contains('is-completed');
    var status = actionEl.querySelector('[data-inprac-status]');
    var cta = actionEl.querySelector('[data-inprac-cta]');
    var hint = actionEl.querySelector('[data-inprac-hint]');
    var parts = getVisibleParts(actionEl);
    var reviewed = parts.filter(function (part) { return part.classList.contains('is-reviewed'); }).length;
    var partsReady = !parts.length || reviewed >= parts.length;

    if (status) {
      status.textContent = done ? 'Done' : (partsReady ? 'Confirm' : (reviewed + '/' + parts.length));
    }
    if (cta) {
      cta.textContent = done ? 'Done' : 'Got it';
      cta.setAttribute('aria-disabled', done || partsReady ? 'false' : 'true');
      cta.classList.toggle('is-locked', !done && !partsReady);
      cta.classList.toggle('is-ready', !done && partsReady);
    }
    if (hint) {
      hint.textContent = done
        ? 'Cue reviewed'
        : (partsReady ? 'Tap Got it to continue' : 'Tap each cue · ' + reviewed + ' of ' + parts.length);
    }
    actionEl.setAttribute('aria-pressed', done ? 'true' : 'false');
    refreshIcon(actionEl, done);
  }

  function getVisibleParts(actionEl) {
    if (!actionEl || !actionEl.querySelectorAll) return [];
    return Array.from(actionEl.querySelectorAll('[data-inprac-part]')).filter(function (part) {
      if (part.hasAttribute('hidden')) return false;
      if (part.closest('[hidden]')) return false;
      return true;
    });
  }

  function partsComplete(actionEl) {
    var parts = getVisibleParts(actionEl);
    if (!parts.length) return true;
    return parts.every(function (part) { return part.classList.contains('is-reviewed'); });
  }

  function nextUnreviewedPart(actionEl) {
    var parts = getVisibleParts(actionEl);
    for (var i = 0; i < parts.length; i++) {
      if (!parts[i].classList.contains('is-reviewed')) return parts[i];
    }
    return null;
  }

  function markPartReviewed(part) {
    if (!part || part.classList.contains('is-reviewed')) return false;
    part.classList.add('is-reviewed');
    part.setAttribute('aria-pressed', 'true');
    return true;
  }

  function completeAction(actionEl) {
    if (!actionEl || actionEl.classList.contains('is-completed')) return false;
    if (!partsComplete(actionEl)) return false;
    actionEl.classList.add('is-completed');
    syncChrome(actionEl);
    try {
      actionEl.dispatchEvent(new CustomEvent('in-practice-complete', { bubbles: true }));
    } catch (err) {}
    return true;
  }

  function bindPartInteractions(actionEl) {
    if (!actionEl || actionEl.getAttribute('data-inprac-parts-bound') === '1') return;
    actionEl.setAttribute('data-inprac-parts-bound', '1');

    actionEl.addEventListener('click', function (e) {
      var part = e.target.closest && e.target.closest('[data-inprac-part]');
      if (part && actionEl.contains(part) && !part.hasAttribute('hidden')) {
        e.preventDefault();
        e.stopPropagation();
        if (actionEl.classList.contains('is-completed')) return;
        if (markPartReviewed(part)) {
          syncChrome(actionEl);
          try {
            actionEl.dispatchEvent(new CustomEvent('in-practice-progress', { bubbles: true, detail: { part: part } }));
          } catch (err) {}
        }
        return;
      }

      var cta = e.target.closest && e.target.closest('[data-inprac-cta]');
      if (cta && actionEl.contains(cta)) {
        e.preventDefault();
        e.stopPropagation();
        if (actionEl.classList.contains('is-completed')) return;
        if (!partsComplete(actionEl)) {
          syncChrome(actionEl);
          return;
        }
        completeAction(actionEl);
        try {
          actionEl.dispatchEvent(new CustomEvent('in-practice-progress', { bubbles: true, detail: { cta: true } }));
        } catch (err2) {}
      }
    });

    actionEl.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var part = e.target.closest && e.target.closest('[data-inprac-part]');
      var cta = e.target.closest && e.target.closest('[data-inprac-cta]');
      if (!part && !cta) return;
      e.preventDefault();
      (part || cta).click();
    });
  }

  function setBeat(wrap, textEl, text, fallback) {
    if (!wrap || !textEl) return;
    var value = String(text || fallback || '').trim();
    if (!value) {
      wrap.setAttribute('hidden', '');
      textEl.textContent = '';
      wrap.classList.remove('is-reviewed');
      wrap.setAttribute('aria-pressed', 'false');
      return;
    }
    textEl.textContent = value;
    wrap.removeAttribute('hidden');
    wrap.setAttribute('aria-pressed', wrap.classList.contains('is-reviewed') ? 'true' : 'false');
  }

  var FALLBACK_LOOK = 'Read the body and the moment before you push the plan.';
  var FALLBACK_AVOID = 'If calm, safety, or connection drops, simplify before you continue.';

  function renderCardSlots(actionEl, card) {
    if (!actionEl || !card) return;
    var lead = actionEl.querySelector('[data-inprac-lead]');
    var lookWrap = actionEl.querySelector('[data-inprac-look-wrap]');
    var look = actionEl.querySelector('[data-inprac-look]');
    var avoidWrap = actionEl.querySelector('[data-inprac-avoid-wrap]');
    var avoid = actionEl.querySelector('[data-inprac-avoid]');
    var thenEl = actionEl.querySelector('[data-inprac-then]');
    var sr = actionEl.querySelector('.inprac__sr, .text');
    var move = card.move || card.scene || '';

    observerPaused = true;
    if (lead) lead.textContent = move;
    // Always show Look for / Avoid when there is a Do cue so guided pulse can step through all three
    setBeat(lookWrap, look, card.notice || '', move ? FALLBACK_LOOK : '');
    setBeat(avoidWrap, avoid, card.watch || '', move ? FALLBACK_AVOID : '');
    if (thenEl) {
      // Keep "Then" off the primary coach surface — Do / Look / Avoid is enough poolside
      thenEl.textContent = '';
      thenEl.setAttribute('hidden', '');
    }
    if (sr) sr.textContent = move;
    observerPaused = false;
    syncChrome(actionEl);
  }

  function staticScreenKey(pointsBox) {
    var screen = pointsBox.closest('[data-b2-screen]');
    if (!screen) return '';
    var id = screen.getAttribute('data-b2-screen') || '';
    if (!id || id === 'home') return '';
    return id;
  }

  function defaultStaticCopy(screenKey) {
    var defaults = {
      f5: 'Build the session plan before swimmers arrive so visuals, sequence, and outcomes stay aligned.',
      'f1-s1': 'Model the entry routine visually before you ask the swimmer to attempt it.',
      'f1-s2': 'Use movement exploration to build familiarity before you name formal skills.',
      'f1-s3': 'Introduce face and breath work playfully in short steps tied to regulation.',
      'f2-s1': 'Let buoyancy and support do the work before you expect independent float holds.',
      'f2-s2': 'Show the long body shape visually, then add short rotation and sculling drills once alignment holds.',
      'f2-s3': 'Embed safety cues inside every activity block, not as a separate lecture.',
      'f3-s1': 'Break stroke into visible parts before you expect a full coordinated pattern.',
      'f3-s2': 'Confirm readiness before dynamic entries, and teach wall skills as repeatable sequences with visuals before you add pace.',
      'f4-s1': 'Choose games that rehearse the session outcome, not just fill time.',
      'f4-s2': 'Match equipment to the learning goal and fade it when the skill holds without it.',
      'f4-s3': 'Use routine and communication cards at transitions when demand or uncertainty rises.',
      fc31: 'Show Main first for the whole picture, then flip to Break It Down when step-by-step support is needed.',
      fc32: 'Introduce equipment with the flashcard before you hand it over so the activity purpose stays clear.',
      fc33: 'Offer Break Time and Choosing cards when regulation or autonomy needs rise.',
      fc34: 'Check in with How Do You Feel and Where cards when communication slows or distress appears.',
      fc35: 'Use white cards for swimmer-specific needs that the standard kit does not cover yet.',
      fc36: 'Signal Finished clearly at activity end so the swimmer knows what comes next.',
      vs1: 'Use First and Then for two-step sequences until the swimmer follows both parts reliably.',
      vs2: 'Add the middle step on the schedule once First and Then is stable across sessions.',
      vs3: 'Expand to four or more activities only when transitions stay calm with shorter schedules.'
    };
    return defaults[screenKey] || '';
  }

  function bindStaticAction(actionEl) {
    if (!actionEl) return;
    bindPartInteractions(actionEl);
  }

  function applyScenarioCopy(actionEl) {
    if (!actionEl) return;
    var textEl = actionEl.querySelector('[data-inprac-lead]') || actionEl.querySelector('.text');
    var current = textEl ? (textEl.textContent || '').trim() : '';
    var card = resolveCard(actionEl, current);
    if (!card || (!card.move && !card.scene && !current)) return;
    if (!card.move && current) card.move = current;
    renderCardSlots(actionEl, card);
  }

  function refreshIcon(actionEl, done) {
    if (!actionEl) return;
    var iconEl = actionEl.querySelector('.key-ideas-action-head .icon, .inprac__icon');
    if (!iconEl) return;
    var state = done ? '1' : '0';
    if (iconEl.dataset.inPracticeDone === state) return;
    iconEl.dataset.inPracticeDone = state;
    observerPaused = true;
    iconEl.innerHTML = iconHtml(!!done);
    observerPaused = false;
  }

  function preserveGuidedFlowRing(actionEl) {
    if (!actionEl) return null;
    return actionEl.querySelector('.flow-guide-in-practice-ring');
  }

  function restoreGuidedFlowRing(actionEl, ring) {
    if (!actionEl || !ring) return;
    actionEl.appendChild(ring);
  }

  function ensureStructure(actionEl) {
    if (!actionEl) return false;
    // Require coach shell (Do / Look / Avoid) so older grids get rebuilt
    if (
      actionEl.querySelector('.inprac') &&
      actionEl.querySelector('[data-inprac-lead]') &&
      actionEl.querySelector('[data-inprac-look-wrap]') &&
      actionEl.querySelector('[data-inprac-part="do"]')
    ) {
      return false;
    }

    var textEl = actionEl.querySelector('.text, [data-inprac-lead]');
    var text = textEl ? textEl.textContent : '';
    var done = actionEl.classList.contains('is-completed');
    var guidedRing = preserveGuidedFlowRing(actionEl);

    observerPaused = true;
    actionEl.innerHTML = shellInnerHtml(done);
    actionEl.removeAttribute('data-inprac-parts-bound');
    restoreGuidedFlowRing(actionEl, guidedRing);
    observerPaused = false;

    var sr = actionEl.querySelector('.text');
    if (sr && text) sr.textContent = text;
    var lead = actionEl.querySelector('[data-inprac-lead]');
    if (lead && text) lead.textContent = text;
    return true;
  }

  function isStructureReady(actionEl) {
    return !!(
      actionEl &&
      actionEl.querySelector('.inprac') &&
      actionEl.querySelector('[data-inprac-lead]') &&
      actionEl.querySelector('[data-inprac-look-wrap]') &&
      actionEl.querySelector('[data-inprac-part="do"]')
    );
  }

  function ensureStaticPointsBox(pointsBox) {
    if (!pointsBox || pointsBox.querySelector('.key-ideas-action')) return false;
    var items = pointsBox.querySelectorAll('.key-idea-item');
    if (!items.length) return false;

    var screenKey = staticScreenKey(pointsBox);
    var fallback = defaultStaticCopy(screenKey);
    if (!fallback) return false;

    observerPaused = true;
    var actionEl = document.createElement('div');
    actionEl.className = 'key-ideas-action';
    actionEl.dataset.inPracticeTarget = screenKey;
    actionEl.innerHTML = shellInnerHtml(false);
    pointsBox.appendChild(actionEl);
    bindStaticAction(actionEl);
    enhanceAction(actionEl, true);
    observerPaused = false;
    return true;
  }

  function ensureStaticPointsBoxes(root) {
    var changed = false;
    (root || document).querySelectorAll('.concept-points-box').forEach(function (box) {
      if (ensureStaticPointsBox(box)) changed = true;
    });
    return changed;
  }

  function syncCompletedParts(actionEl) {
    if (!actionEl || !actionEl.classList.contains('is-completed')) return;
    getVisibleParts(actionEl).forEach(function (part) {
      part.classList.add('is-reviewed');
      part.setAttribute('aria-pressed', 'true');
    });
  }

  function enhanceAction(actionEl, force) {
    if (!actionEl || !actionEl.classList.contains('key-ideas-action')) return;
    if (actionEl.hasAttribute('hidden')) return;

    ensureStructure(actionEl);
    bindPartInteractions(actionEl);
    applyScenarioCopy(actionEl);
    syncCompletedParts(actionEl);
    syncChrome(actionEl);
    actionEl.dataset.inPracticeReady = '1';
    try {
      actionEl.dispatchEvent(new CustomEvent('flow-guide-in-practice-ready', { bubbles: true }));
    } catch (err) {}
  }

  function scan(root) {
    (root || document).querySelectorAll('.key-ideas-action:not([hidden])').forEach(function (el) {
      enhanceAction(el, true);
    });
  }

  var pendingNodes = [];
  var flushScheduled = false;

  function scheduleFlush() {
    if (flushScheduled || observerPaused) return;
    flushScheduled = true;
    requestAnimationFrame(function () {
      flushScheduled = false;
      if (observerPaused || !pendingNodes.length) return;
      var nodes = pendingNodes.slice();
      pendingNodes = [];
      nodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        if (node.classList && node.classList.contains('key-ideas-action')) {
          enhanceAction(node, true);
          return;
        }
        if (node.querySelectorAll) {
          node.querySelectorAll('.key-ideas-action:not([hidden])').forEach(function (el) {
            enhanceAction(el, true);
          });
          ensureStaticPointsBoxes(node);
        }
      });
    });
  }

  var observer = new MutationObserver(function (mutations) {
    if (observerPaused) return;

    mutations.forEach(function (mutation) {
      if (mutation.type === 'attributes') {
        if (
          mutation.attributeName === 'hidden' &&
          mutation.target.classList &&
          mutation.target.classList.contains('key-ideas-action')
        ) {
          if (!mutation.target.hasAttribute('hidden')) {
            pendingNodes.push(mutation.target);
          }
        }
        if (
          mutation.attributeName === 'class' &&
          mutation.target.classList &&
          mutation.target.classList.contains('key-ideas-action')
        ) {
          syncChrome(mutation.target);
        }
        return;
      }

      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        pendingNodes.push(node);
      });
    });

    scheduleFlush();
  });

  function boot() {
    var root = document.querySelector('.portal') || document.body;
    scan(root);
    ensureStaticPointsBoxes(root);
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['hidden', 'class']
    });

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        observer.disconnect();
      } else {
        observer.observe(root, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['hidden', 'class']
        });
        scan(root);
      }
    });
  }

  window.InPracticeSystem = {
    iconHtml: iconHtml,
    shellInnerHtml: shellInnerHtml,
    refreshIcon: refreshIcon,
    ensureStructure: ensureStructure,
    enhanceAction: enhanceAction,
    applyScenarioCopy: applyScenarioCopy,
    renderCardSlots: renderCardSlots,
    resolveCopy: resolveCopy,
    resolveCard: resolveCard,
    ensureStaticPointsBoxes: ensureStaticPointsBoxes,
    getVisibleParts: getVisibleParts,
    partsComplete: partsComplete,
    nextUnreviewedPart: nextUnreviewedPart,
    paint: function (actionEl) { enhanceAction(actionEl, true); }
  };

  window.inPracticeActionIconHtml = iconHtml;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
