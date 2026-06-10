(function () {
  'use strict';

  var HINT_COPY = "Click to confirm you've read this scenario.";

  var ICON_POOL =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M4 9h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z"/>' +
      '<path d="M2 13c1.6-.9 3.2-.9 4.8 0s3.2.9 4.8 0 3.2-.9 4.8 0 3.2.9 4.8 0"/>' +
      '<path d="M8 9V7M12 9V7M16 9V7"/>' +
    '</svg>';

  var ICON_DONE =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M20 6L9 17l-5-5"/>' +
    '</svg>';

  var WAVE_SVG =
    '<svg class="key-ideas-action__wave-svg" viewBox="0 0 240 120" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M0 72c20-12 40-12 60 0s40 12 60 0 40-12 60 0 40 12 60 0v48H0z" opacity=".55"/>' +
      '<path fill="currentColor" d="M0 88c24-10 48-10 72 0s48 10 72 0 48-10 72 0 48 10 72 0v32H0z" opacity=".35"/>' +
    '</svg>';

  var observerPaused = false;

  function iconHtml(done) {
    return done ? ICON_DONE : ICON_POOL;
  }

  function shellInnerHtml(done) {
    return (
      '<div class="key-ideas-action__body">' +
        '<div class="key-ideas-action__wave">' + WAVE_SVG + '</div>' +
        '<div class="key-ideas-action__content">' +
          '<div class="key-ideas-action-head">' +
            '<span class="icon" aria-hidden="true">' + iconHtml(!!done) + '</span>' +
            '<div class="key-ideas-action-head__meta">' +
              '<span class="label">In Practice</span>' +
              '<span class="key-ideas-action-hint">' + HINT_COPY + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="key-ideas-action__scenario">' +
            '<p class="text"></p>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function resolveCopy(actionEl, fallback) {
    var target = actionEl && actionEl.dataset.inPracticeTarget;
    if (!target) {
      var panel = actionEl && actionEl.closest('.concept-panel');
      target = panel && panel.dataset.currentTarget;
    }
    if (window.InPracticeCopy && typeof InPracticeCopy.resolve === 'function') {
      return InPracticeCopy.resolve(target, fallback);
    }
    return fallback || '';
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
      'f3-s2': 'Confirm readiness and submersion comfort before you introduce any dynamic entry.',
      'f3-s3': 'Teach wall skills as repeatable sequences with visuals before you add pace.',
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
      refreshIcon(actionEl, true);
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
    var textEl = actionEl.querySelector('.text');
    if (textEl) {
      textEl.textContent = resolveCopy(actionEl, fallback);
    }
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
    var textEl = actionEl.querySelector('.text');
    if (!textEl) return;
    var current = (textEl.textContent || '').trim();
    if (!current) return;
    var refined = resolveCopy(actionEl, current);
    if (refined && refined !== current) {
      observerPaused = true;
      textEl.textContent = refined;
      observerPaused = false;
    }
  }

  function refreshIcon(actionEl, done) {
    if (!actionEl) return;
    var iconEl = actionEl.querySelector('.key-ideas-action-head .icon');
    if (!iconEl) return;
    var state = done ? '1' : '0';
    if (iconEl.dataset.inPracticeDone === state) return;
    iconEl.dataset.inPracticeDone = state;
    observerPaused = true;
    iconEl.innerHTML = iconHtml(!!done);
    observerPaused = false;
  }

  function ensureStructure(actionEl) {
    if (!actionEl || actionEl.querySelector('.key-ideas-action__content')) return false;

    var textEl = actionEl.querySelector('.text');
    var text = textEl ? textEl.textContent : '';
    var done = actionEl.classList.contains('is-completed');

    observerPaused = true;
    actionEl.innerHTML = shellInnerHtml(done);
    observerPaused = false;

    textEl = actionEl.querySelector('.text');
    if (textEl && text) textEl.textContent = text;

    actionEl.setAttribute('role', 'button');
    if (!actionEl.hasAttribute('tabindex')) actionEl.setAttribute('tabindex', '0');
    return true;
  }

  function isStructureReady(actionEl) {
    return !!(
      actionEl &&
      actionEl.querySelector('.key-ideas-action__content') &&
      actionEl.querySelector('.key-ideas-action__wave') &&
      actionEl.querySelector('.key-ideas-action__scenario .text')
    );
  }

  function enhanceAction(actionEl, force) {
    if (!actionEl || !actionEl.classList.contains('key-ideas-action')) return;
    if (actionEl.hasAttribute('hidden')) return;
    if (!force && actionEl.dataset.inPracticeReady === '1' && isStructureReady(actionEl)) {
      refreshIcon(actionEl, actionEl.classList.contains('is-completed'));
      return;
    }

    ensureStructure(actionEl);

    if (!actionEl.getAttribute('role')) actionEl.setAttribute('role', 'button');
    if (!actionEl.hasAttribute('tabindex')) actionEl.setAttribute('tabindex', '0');

    var wave = actionEl.querySelector('.key-ideas-action__wave');
    if (!wave) {
      var body = actionEl.querySelector('.key-ideas-action__body') || actionEl;
      observerPaused = true;
      wave = document.createElement('div');
      wave.className = 'key-ideas-action__wave';
      wave.innerHTML = WAVE_SVG;
      body.insertBefore(wave, body.firstChild);
      observerPaused = false;
    }

    var scenario = actionEl.querySelector('.key-ideas-action__scenario');
    var textEl = actionEl.querySelector('.text');
    if (textEl && scenario && textEl.parentElement !== scenario) {
      observerPaused = true;
      scenario.appendChild(textEl);
      observerPaused = false;
    }

    applyScenarioCopy(actionEl);
    refreshIcon(actionEl, actionEl.classList.contains('is-completed'));
    actionEl.dataset.inPracticeReady = '1';
  }

  function scan(root) {
    (root || document).querySelectorAll('.key-ideas-action:not([hidden])').forEach(function (el) {
      enhanceAction(el);
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
          enhanceAction(node);
          return;
        }
        if (node.querySelectorAll) {
          node.querySelectorAll('.key-ideas-action:not([hidden])').forEach(enhanceAction);
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
      attributeFilter: ['hidden']
    });

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        observer.disconnect();
      } else {
        observer.observe(root, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['hidden']
        });
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
    resolveCopy: resolveCopy,
    ensureStaticPointsBoxes: ensureStaticPointsBoxes
  };

  window.inPracticeActionIconHtml = iconHtml;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
