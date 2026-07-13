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

  function supportCell(mod, label, text) {
    if (!text) return '';
    return (
      '<div class="inprac-support__cell inprac-support__cell--' + mod + '">' +
        '<span class="inprac-support__label">' + label + '</span>' +
        '<p class="inprac-support__text">' + escapeHtml(text) + '</p>' +
      '</div>'
    );
  }

  function shellInnerHtml(done) {
    var completed = !!done;
    return (
      '<div class="key-ideas-action__body inprac">' +
        '<div class="inprac__top">' +
          '<span class="icon inprac__icon" aria-hidden="true">' + iconHtml(completed) + '</span>' +
          '<div class="inprac__titles">' +
            '<p class="inprac__eyebrow">Pool-side cue</p>' +
            '<p class="label inprac__title">In Practice</p>' +
          '</div>' +
          '<span class="inprac__status" data-inprac-status>' + (completed ? 'Reviewed' : 'Tap to review') + '</span>' +
        '</div>' +
        '<div class="key-ideas-action__scenario inprac__body" data-in-practice-slots>' +
          '<p class="inprac__lead" data-inprac-lead></p>' +
          '<div class="inprac-support" data-inprac-support></div>' +
          '<span class="text inprac__sr"> </span>' +
        '</div>' +
        '<div class="inprac__footer">' +
          '<span class="key-ideas-action__cta inprac__cta" data-inprac-cta>' +
            (completed ? 'Reviewed' : 'Mark as reviewed') +
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
    if (status) status.textContent = done ? 'Reviewed' : 'Tap to review';
    if (cta) cta.textContent = done ? 'Reviewed' : 'Mark as reviewed';
    actionEl.setAttribute('aria-pressed', done ? 'true' : 'false');
    refreshIcon(actionEl, done);
  }

  function renderCardSlots(actionEl, card) {
    if (!actionEl || !card) return;
    var lead = actionEl.querySelector('[data-inprac-lead]');
    var support = actionEl.querySelector('[data-inprac-support]');
    var sr = actionEl.querySelector('.inprac__sr, .text');
    var move = card.move || card.scene || '';
    var html =
      supportCell('scene', 'In the pool', card.scene) +
      supportCell('notice', "You'll notice", card.notice) +
      supportCell('watch', 'Watch for', card.watch) +
      supportCell('next', 'Try next', card.next);

    observerPaused = true;
    if (lead) lead.textContent = move;
    if (support) {
      support.innerHTML = html;
      if (html) support.removeAttribute('hidden');
      else support.setAttribute('hidden', '');
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
    if (!actionEl || actionEl.getAttribute('data-in-practice-bound') === '1') return;
    actionEl.setAttribute('data-in-practice-bound', '1');
    actionEl.addEventListener('click', function () {
      actionEl.classList.add('is-completed');
      syncChrome(actionEl);
    });
    actionEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        actionEl.click();
      }
    });
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

  function applyScenarioCopy(actionEl) {
    if (!actionEl) return;
    var textEl = actionEl.querySelector('.text, [data-inprac-lead]');
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
    if (actionEl.querySelector('.inprac') && actionEl.querySelector('[data-in-practice-slots]')) {
      return false;
    }

    var textEl = actionEl.querySelector('.text, [data-inprac-lead]');
    var text = textEl ? textEl.textContent : '';
    var done = actionEl.classList.contains('is-completed');
    var guidedRing = preserveGuidedFlowRing(actionEl);

    observerPaused = true;
    actionEl.innerHTML = shellInnerHtml(done);
    restoreGuidedFlowRing(actionEl, guidedRing);
    observerPaused = false;

    var sr = actionEl.querySelector('.text');
    if (sr && text) sr.textContent = text;
    var lead = actionEl.querySelector('[data-inprac-lead]');
    if (lead && text) lead.textContent = text;

    actionEl.setAttribute('role', 'button');
    if (!actionEl.hasAttribute('tabindex')) actionEl.setAttribute('tabindex', '0');
    return true;
  }

  function isStructureReady(actionEl) {
    return !!(actionEl && actionEl.querySelector('.inprac') && actionEl.querySelector('[data-in-practice-slots]'));
  }

  function enhanceAction(actionEl, force) {
    if (!actionEl || !actionEl.classList.contains('key-ideas-action')) return;
    if (actionEl.hasAttribute('hidden')) return;

    ensureStructure(actionEl);
    if (!actionEl.getAttribute('role')) actionEl.setAttribute('role', 'button');
    if (!actionEl.hasAttribute('tabindex')) actionEl.setAttribute('tabindex', '0');

    applyScenarioCopy(actionEl);
    syncChrome(actionEl);
    actionEl.dataset.inPracticeReady = '1';
    if (actionEl.classList.contains('flow-guide-pulse--inpractice')) {
      actionEl.dispatchEvent(new CustomEvent('flow-guide-in-practice-ready', { bubbles: true }));
    }
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
    paint: function (actionEl) { enhanceAction(actionEl, true); }
  };

  window.inPracticeActionIconHtml = iconHtml;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
