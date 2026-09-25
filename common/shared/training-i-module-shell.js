(function (root) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) {
    try { module.exports = require('./training-i-progress.js'); } catch (e) {}
  }
})(typeof window !== 'undefined' ? window : this);

/* eslint-disable no-unused-vars */
(function (global) {
  'use strict';

  var P = global.TrainingIProgress;
  if (!P) return;

  var reducedMotion = false;
  try {
    reducedMotion = !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (err) {}

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function detectModuleNumber() {
    var path = (global.location && global.location.pathname) || '';
    var m = path.match(/training-i\/modules\/module-(\d+)/) || path.match(/\/modules\/module-(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  function isHub() {
    var path = (global.location && global.location.pathname) || '';
    return /\/training-i\/?$/.test(path) || /\/swimming-training-i\/?$/.test(path);
  }

  function recapSelector() {
    return document.getElementById('recap') ? '#recap' : '#keyideas';
  }

  function stepTarget(step) {
    if (step === 'recap') return recapSelector();
    if (step === 'quiz') {
      var complete = document.getElementById('complete');
      if (complete) return '#complete';
      return '#quiz';
    }
    return '#' + step;
  }

  function stepLabel(step, snap) {
    if (step && /^block/.test(step)) {
      var sec = document.getElementById(step);
      if (sec) {
        var title = sec.querySelector('.block-part-title, .block-title-wrap h3, h3');
        if (title) {
          var text = String(title.textContent || '').replace(/^Block\s+\d+\s*[-–—:]\s*/i, '').trim();
          if (text) return text;
        }
      }
    }
    return (P.STEP_LABELS && P.STEP_LABELS[step]) || step;
  }

  function announce(message) {
    var live = document.getElementById('trainingILive');
    if (!live) {
      live = document.createElement('div');
      live.id = 'trainingILive';
      live.className = 'training-i-live';
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('aria-atomic', 'true');
      document.body.appendChild(live);
    }
    live.textContent = '';
    setTimeout(function () { live.textContent = message; }, 20);
    showToast(message);
  }

  function showToast(message) {
    var toast = document.getElementById('trainingIToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'trainingIToast';
      toast.className = 'training-i-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { toast.classList.remove('is-visible'); }, 3200);
  }

  function setCta(snap) {
    $$('.hero-actions .btn.btn-primary, .hero-actions [data-scroll]').forEach(function (btn) {
      if (btn.closest('.completion-actions')) return;
      btn.textContent = snap.cta;
      btn.setAttribute('data-module-cta', snap.status);
      btn.disabled = false;
    });
  }

  function paintProgress(snap) {
    var label = P.statusLabel(snap.status);
    if (snap.status === 'not-started') label = 'Start the module';
    else if (snap.status === 'in-progress' && snap.nextStep) label = 'Next: ' + stepLabel(snap.nextStep, snap);
    else if (snap.status === 'completed') label = 'Module completed';
    else if (snap.status === 'review') label = 'Review mode';

    ['overallProgressFill', 'moduleProgressFill'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.width = snap.percent + '%';
    });
    var text = document.getElementById('moduleProgressText');
    if (text) text.textContent = snap.percent + '% completed • ' + label;
    var overall = document.getElementById('overallProgressText');
    if (overall) overall.textContent = snap.percent + '% completed';
    var count = document.getElementById('overallProgressCount');
    if (count) count.textContent = snap.done + ' / ' + snap.total;

    document.documentElement.setAttribute('data-training-i-shell', '1');
    document.documentElement.setAttribute('data-module-status', snap.status);
    document.documentElement.setAttribute('data-review-mode', snap.status === 'review' ? 'true' : 'false');
    if (snap.status !== 'not-started') {
      document.documentElement.setAttribute('data-flow-module-started', 'true');
    }
  }

  function ensureNavLabel(link) {
    if (link.querySelector('.nav-link__label, .nav-link__block-label, .nav-link__block-name')) return;
    var badge = link.querySelector('.nav-next-label');
    var text = '';
    Array.prototype.forEach.call(link.childNodes, function (node) {
      if (node !== badge && node.nodeType === 3) text += node.textContent;
    });
    text = text.replace(/\s+/g, ' ').trim();
    Array.prototype.slice.call(link.childNodes).forEach(function (node) {
      if (node !== badge) link.removeChild(node);
    });
    var label = document.createElement('span');
    label.className = 'nav-link__label';
    label.textContent = text;
    link.insertBefore(label, link.firstChild);
  }

  function paintNav(snap) {
    var current = snap.nextStep;
    $$('.nav-link').forEach(function (link) {
      ensureNavLabel(link);
      var href = link.getAttribute('href') || '';
      var id = href.replace('#', '');
      if (id === 'keyideas') id = 'recap';
      if (id === 'complete') return;
      var done = false;
      if (id === 'overview') done = snap.status !== 'not-started';
      else if (id === 'quiz') done = !!(snap.steps && snap.steps.quiz);
      else if (snap.steps && Object.prototype.hasOwnProperty.call(snap.steps, id)) done = !!snap.steps[id];
      link.classList.toggle('done', done);
      link.classList.toggle('is-complete', done);
      var isNext = current && (
        (current === id) ||
        (current === 'recap' && (id === 'recap' || id === 'keyideas')) ||
        (current === 'quiz' && id === 'quiz')
      );
      link.classList.toggle('is-next', !!isNext && !done);
      var badge = link.querySelector('.nav-next-label');
      if (isNext && !done) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'nav-next-label';
          badge.textContent = 'Next';
          link.appendChild(badge);
        }
      } else if (badge) {
        badge.remove();
      }
    });
  }

  function paintJourneyMap(moduleNumber) {
    var state = P.load();
    $$('#journey .journey-track > .journey-item').forEach(function (item, index) {
      var n = index + 1;
      var rec = state.modules['module-' + n];
      var statusEl = item.querySelector('.journey-status');
      item.classList.remove('journey-item--past', 'active', 'is-completed', 'is-current', 'is-locked');
      if (n === moduleNumber) {
        item.classList.add('active', 'is-current');
        if (statusEl) statusEl.textContent = 'Current module';
        return;
      }
      var status = rec ? rec.status : 'not-started';
      if (status === 'completed' || status === 'review') {
        item.classList.add('journey-item--past', 'is-completed');
        if (statusEl) statusEl.textContent = 'Completed';
      } else if (status === 'in-progress') {
        if (statusEl) statusEl.textContent = 'In progress';
      } else if (statusEl) {
        statusEl.textContent = '';
      }
    });
  }

  function highlightNext(snap) {
    $$('.is-current-step, .training-i-next').forEach(function (el) {
      el.classList.remove('is-current-step', 'training-i-next', 'training-i-next--pulse');
    });
    /* The flow guide owns the single next-step light. This outline is a second pulse. */
    if (document.documentElement.getAttribute('data-guided-flow') === 'true') return;
    if (!snap.nextStep || snap.status === 'completed' || snap.status === 'review') return;
    var target = $(stepTarget(snap.nextStep));
    if (!target) return;
    var pulseHost = target;
    if (/^block/.test(snap.nextStep)) {
      var head = target.querySelector('.block-part-head');
      if (head) pulseHost = head;
    }
    pulseHost.classList.add('is-current-step', 'training-i-next');
    if (!reducedMotion && !highlightNext._stopped) {
      pulseHost.classList.add('training-i-next--pulse');
    }
  }

  function stopPulse() {
    highlightNext._stopped = true;
    $$('.training-i-next--pulse').forEach(function (el) {
      el.classList.remove('training-i-next--pulse');
    });
  }

  function restoreChecks(snap) {
    Object.keys(snap.steps || {}).forEach(function (step) {
      if (!snap.steps[step]) return;
      var ids = [step];
      if (step === 'recap') ids.push('keyideas');
      ids.forEach(function (id) {
        $$('input[data-stage-check="' + id + '"]').forEach(function (cb) {
          cb.checked = true;
          cb.disabled = false;
          if (cb.closest('.check-item')) cb.closest('.check-item').classList.add('clicked');
        });
        var section = document.getElementById(id);
        if (section) section.classList.remove('gated-locked');
      });
    });
    Object.keys(snap.concepts || {}).forEach(function (block) {
      (snap.concepts[block] || []).forEach(function (target) {
        $$('[data-concept-grid="' + block + '"] [data-target="' + target + '"]').forEach(function (btn) {
          btn.classList.add('visited');
        });
      });
    });
    (snap.outcomesReviewed || []).forEach(function (id) {
      var card = $('[data-outcome-item="' + id + '"]');
      if (card) card.classList.add('clicked', 'is-reviewed');
    });
    if (snap.status === 'review' || snap.status === 'completed') {
      $$('.gated-locked').forEach(function (section) {
        section.classList.remove('gated-locked');
      });
      $$('[data-gate]').forEach(function (gate) { gate.classList.add('open'); });
    }
  }

  function paintQuizGate(snap) {
    var complete = document.getElementById('complete');
    var quiz = document.getElementById('quiz');
    var lead = complete && complete.querySelector('.completion-lead');
    var sub = complete && complete.querySelector('.completion-sub');
    var start = complete && complete.querySelector('.completion-actions .btn, .completion-actions a');
    var missing = snap.missingContent || [];
    var unlocked = snap.quizUnlocked;

    if (lead) {
      lead.textContent = unlocked
        ? 'You have completed the module content and reviewed the core concepts.'
        : 'Complete the remaining sections before starting the quiz.';
    }
    if (sub) {
      if (unlocked) {
        sub.textContent = 'Open the quiz to consolidate your understanding and continue your progression journey.';
      } else {
        var n = missing.length;
        var names = missing.map(function (s) { return P.STEP_LABELS[s] || s; }).join(', ');
        sub.textContent = n === 1
          ? 'Still to complete: ' + names + '.'
          : 'Complete ' + n + ' remaining sections to unlock the quiz' + (names ? ' (' + names + ')' : '') + '.';
      }
    }
    if (start) {
      if (unlocked) {
        start.removeAttribute('aria-disabled');
        start.classList.remove('is-locked');
        start.textContent = 'Start Quiz';
        start.setAttribute('href', '#quiz');
      } else {
        start.setAttribute('aria-disabled', 'true');
        start.classList.add('is-locked');
        var n = missing.length;
        start.textContent = n ? ('Complete ' + n + ' remaining section' + (n === 1 ? '' : 's') + ' to unlock the quiz') : 'Quiz locked';
      }
    }
    if (quiz) {
      if (unlocked || snap.status === 'review' || snap.status === 'completed') {
        quiz.classList.remove('gated-locked');
        quiz.classList.add('quiz-visible');
      } else {
        quiz.classList.add('gated-locked');
        quiz.classList.remove('quiz-visible');
      }
    }
    if (complete && unlocked) complete.classList.remove('gated-locked');
  }

  var lastQuizUnlocked = null;
  var lastSnap = null;
  var refreshing = false;

  function unlockFollowing(snap) {
    var nextId = snap.nextStep === 'keyideas' ? 'recap' : snap.nextStep;
    ['overview', 'journey', 'outcomes', 'inside-module', 'block1', 'block2', 'block3', 'block4', 'recap', 'complete'].forEach(function (id) {
      var stepKey = id === 'keyideas' ? 'recap' : id;
      var done = id === 'overview' || id === 'inside-module'
        ? snap.status !== 'not-started'
        : !!(snap.steps && snap.steps[stepKey]);
      var isNext = nextId === id;
      if (!done && !isNext) return;
      var section = document.getElementById(id);
      if (section) section.classList.remove('gated-locked');
    });
  }

  function refresh(moduleNumber) {
    if (refreshing) return lastSnap;
    refreshing = true;
    var snap = P.getSnapshot(moduleNumber);
    lastSnap = snap;
    paintProgress(snap);
    paintNav(snap);
    paintJourneyMap(moduleNumber);
    setCta(snap);
    highlightNext(snap);
    paintQuizGate(snap);
    unlockFollowing(snap);
    if (lastQuizUnlocked === false && snap.quizUnlocked) {
      announce('Quiz unlocked. You can start the quiz.');
    }
    lastQuizUnlocked = snap.quizUnlocked;
    try {
      if (global.ModuleBlockAccordion && typeof global.ModuleBlockAccordion.refresh === 'function') {
        global.ModuleBlockAccordion.refresh({ skipAutoAdvance: true });
      }
    } finally {
      refreshing = false;
    }
    return snap;
  }

  function goToNext(snap) {
    var step = snap.nextStep || 'journey';
    var sel = stepTarget(step);
    var el = $(sel);
    if (/^block/.test(step) && global.ModuleBlockAccordion && ModuleBlockAccordion.ensureOpen) {
      ModuleBlockAccordion.ensureOpen(step, { scroll: true });
    }
    if (el) {
      try { el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }); }
      catch (err) { el.scrollIntoView(true); }
      var focusable = el.querySelector('h2, h3, .block-part-head, .btn, [tabindex]') || el;
      if (!focusable.hasAttribute('tabindex')) focusable.setAttribute('tabindex', '-1');
      try { focusable.focus({ preventScroll: true }); } catch (e2) { try { focusable.focus(); } catch (e3) {} }
    }
    announce('Next: ' + stepLabel(step, snap));
  }

  function bindCta(moduleNumber) {
    $$('.hero-actions .btn.btn-primary, .hero-actions [data-scroll]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var snap = P.getSnapshot(moduleNumber);
        if (snap.status === 'completed') P.markReview(moduleNumber);
        else P.startModule(moduleNumber);
        var next = P.getSnapshot(moduleNumber);
        refresh(moduleNumber);
        e.preventDefault();
        e.stopImmediatePropagation();
        goToNext(next);
      }, true);
    });
  }

  function bindStages(moduleNumber) {
    document.addEventListener('change', function (e) {
      var t = e.target;
      if (!t || !t.matches) return;
      if (t.matches('input[data-stage-check]')) {
        var stage = t.getAttribute('data-stage-check');
        if (stage === 'complete') return;
        var mapped = stage === 'keyideas' ? 'recap' : stage;
        var before = P.getSnapshot(moduleNumber);
        P.markStep(moduleNumber, mapped, !!t.checked);
        var after = refresh(moduleNumber);
        if (t.checked && before.nextStep === mapped && after.nextStep && after.nextStep !== mapped) {
          announce((P.STEP_LABELS[mapped] || mapped) + ' completed. Next: ' + stepLabel(after.nextStep, after) + '.');
        }
      }
    });
  }

  function bindConcepts(moduleNumber) {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.concept-square[data-target]');
      if (!btn) return;
      var grid = btn.closest('[data-concept-grid]');
      if (!grid) return;
      var block = grid.getAttribute('data-concept-grid');
      var target = btn.getAttribute('data-target');
      var panel = $('[data-panel-for="' + block + '"]');
      var closing = btn.classList.contains('is-open-concept') || btn.getAttribute('aria-expanded') === 'true';
      if (global.ModuleBlockAccordion && ModuleBlockAccordion.ensureOpen) {
        ModuleBlockAccordion.ensureOpen(block, { scroll: false });
      }
      if (closing) {
        btn.classList.remove('is-open-concept', 'active');
        btn.setAttribute('aria-expanded', 'false');
        if (panel) {
          panel.classList.remove('show');
          delete panel.dataset.currentTarget;
        }
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      $$('[data-concept-grid="' + block + '"] .concept-square[data-target]').forEach(function (b) {
        b.classList.toggle('is-open-concept', b === btn);
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-expanded', b === btn ? 'true' : 'false');
        if (panel && panel.id) b.setAttribute('aria-controls', panel.id);
      });
      if (panel) {
        if (!panel.id) panel.id = block + '-concept-panel';
        panel.classList.add('show');
        panel.setAttribute('tabindex', '-1');
        setTimeout(function () {
          try { panel.focus({ preventScroll: true }); } catch (err) {}
        }, 50);
      }
      if (target && block) {
        P.markConcept(moduleNumber, block, target);
        btn.classList.add('visited');
      }
    }, true);

    document.addEventListener('click', function (e) {
      var finish = e.target.closest && e.target.closest('[data-finish-concept]');
      if (!finish) return;
      var panel = finish.closest('.concept-panel');
      if (!panel) return;
      var block = panel.getAttribute('data-panel-for') || panel.dataset.currentBlock;
      var target = panel.dataset.currentTarget;
      if (block && target) {
        P.markConcept(moduleNumber, block, target);
        var btn = $('[data-concept-grid="' + block + '"] [data-target="' + target + '"]');
        if (btn) btn.classList.add('visited');
        refresh(moduleNumber);
      }
    });
  }

  function bindOutcomes(moduleNumber) {
    $$('[data-outcome-item], .outcomes .outcome').forEach(function (card, index) {
      var id = card.getAttribute('data-outcome-item') || String(index + 1);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-pressed', card.classList.contains('clicked') ? 'true' : 'false');
      function mark() {
        card.classList.add('clicked', 'is-reviewed');
        card.setAttribute('aria-pressed', 'true');
        P.markOutcome(moduleNumber, id);
        var group = card.closest('[data-outcomes-group], .outcomes');
        if (group) {
          var items = $$('[data-outcome-item], .outcome', group);
          var all = items.every(function (el) { return el.classList.contains('clicked') || el.classList.contains('is-reviewed'); });
          if (all) {
            var cb = $('input[data-stage-check="outcomes"]');
            if (cb && !cb.checked) {
              cb.disabled = false;
              cb.checked = true;
              cb.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
              P.markStep(moduleNumber, 'outcomes', true);
              refresh(moduleNumber);
            }
          }
        }
      }
      card.addEventListener('click', mark);
      card.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          mark();
        }
      });
    });
  }

  function bindRecapCards(moduleNumber) {
    var recap = document.getElementById('recap') || document.getElementById('keyideas');
    if (!recap) return;
    var cards = $$('.recap-takeaway-card, .recap-card.clickable-progress', recap);
    cards.forEach(function (card) {
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      function mark() {
        card.classList.add('clicked', 'is-reviewed');
        var all = cards.every(function (el) { return el.classList.contains('clicked') || el.classList.contains('is-reviewed'); });
        if (all) {
          var cb = recap.querySelector('input[data-stage-check="recap"], input[data-stage-check="keyideas"]');
          if (cb && !cb.checked) {
            cb.disabled = false;
            cb.checked = true;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }
      card.addEventListener('click', mark);
      card.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          mark();
        }
      });
    });
  }

  function bindQuiz(moduleNumber) {
    document.addEventListener('click', function (e) {
      var link = e.target.closest && e.target.closest('a[href="#quiz"], .completion-actions .btn, .completion-actions a');
      if (!link) return;
      var snap = P.getSnapshot(moduleNumber);
      if (!snap.quizUnlocked && snap.status !== 'review' && snap.status !== 'completed') {
        e.preventDefault();
        e.stopPropagation();
        announce('Complete ' + snap.missingContent.length + ' remaining section' + (snap.missingContent.length === 1 ? '' : 's') + ' to unlock the quiz.');
        return;
      }
      var quiz = document.getElementById('quiz');
      if (quiz) {
        quiz.classList.remove('gated-locked');
        quiz.classList.add('quiz-visible');
        setTimeout(function () {
          try {
            quiz.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
            var h = quiz.querySelector('h1, h2, h3') || quiz;
            if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
            h.focus();
          } catch (err) {}
        }, 40);
      }
    }, true);

    document.addEventListener('submit', function (e) {
      var form = e.target;
      if (!form || !form.id || !/quizForm/i.test(form.id)) return;
      setTimeout(function () {
        var scoreCard = form.parentNode && form.parentNode.querySelector('.score-card.show, #scoreCardM1, #scoreCardM2, #scoreCardM3, #scoreCardM4, #scoreCardM5');
        var valueEl = document.getElementById('scoreValueM' + moduleNumber) || (scoreCard && scoreCard.querySelector('#scoreValueM' + moduleNumber + ', .score-value, #scoreValue'));
        var text = valueEl ? String(valueEl.textContent || '') : '';
        var passed = /passed/i.test(text);
        var pair = text.match(/(\d+)\s*\/\s*(\d+)/);
        var score = pair ? parseInt(pair[1], 10) : (passed ? 1 : 0);
        var total = pair ? parseInt(pair[2], 10) : 1;
        if (passed || (pair && score === total && total > 0)) {
          P.submitQuiz(moduleNumber, score, total);
          refresh(moduleNumber);
        } else if (pair) {
          P.submitQuiz(moduleNumber, score, total);
          refresh(moduleNumber);
        }
      }, 80);
    }, true);
  }

  function setupDrawer() {
    var sidebar = $('.portal > .sidebar');
    var portal = $('.portal');
    if (!sidebar || !portal) return;
    sidebar.id = sidebar.id || 'moduleSidebar';
    var btn = document.getElementById('moduleMenuBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'moduleMenuBtn';
      btn.className = 'module-menu-btn';
      btn.setAttribute('aria-controls', 'moduleSidebar');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = 'Module menu';
      var main = $('.portal > .main') || portal;
      main.insertBefore(btn, main.firstChild);
    }
    var backdrop = document.getElementById('moduleMenuBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'moduleMenuBackdrop';
      backdrop.className = 'module-menu-backdrop';
      backdrop.hidden = true;
      portal.appendChild(backdrop);
    }

    function isDrawerMode() {
      return global.matchMedia && global.matchMedia('(max-width: 1100px)').matches;
    }

    function close() {
      portal.classList.remove('is-module-nav-open');
      btn.setAttribute('aria-expanded', 'false');
      backdrop.hidden = true;
      sidebar.removeAttribute('data-open');
      if (isDrawerMode()) btn.focus();
    }

    function open() {
      portal.classList.add('is-module-nav-open');
      btn.setAttribute('aria-expanded', 'true');
      backdrop.hidden = false;
      sidebar.setAttribute('data-open', 'true');
      var first = sidebar.querySelector('.nav-link, a, button');
      if (first) first.focus();
    }

    btn.addEventListener('click', function () {
      if (portal.classList.contains('is-module-nav-open')) close();
      else open();
    });
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && portal.classList.contains('is-module-nav-open')) {
        e.preventDefault();
        close();
      }
    });
    $$('.sidebar .nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        if (isDrawerMode()) close();
      });
    });
  }

  function normalizeNavLabels() {
    $$('.sidebar .nav-link').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href === '#journey') {
        if (!link.querySelector('.nav-link__block-label')) link.childNodes.forEach && null;
        if (!link.classList.contains('nav-link--block')) link.textContent = 'Journey';
      }
      if (href === '#outcomes') link.textContent = 'Learning Outcomes';
      if (href === '#recap' || href === '#keyideas') link.textContent = 'Recap';
      if (href === '#quiz') link.textContent = 'Quiz';
      if (href === '#overview') link.textContent = 'Overview';
      if (href === '#complete') {
        link.hidden = true;
        link.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function hideAdminChrome() {
    $$('.save-progress-card').forEach(function (card) {
      card.hidden = true;
    });
    $$('.check-item input[disabled]').forEach(function (cb) {
      var item = cb.closest('.check-item');
      if (item) item.classList.add('is-wait-disabled');
    });
  }

  var voiceAudio = null;
  var voiceGen = 0;
  function voicePieces(text) {
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
      } else {
        bucket = joined;
      }
    });
    if (bucket) pieces.push(bucket);
    return pieces.slice(0, 8);
  }
  var voiceCache = {};
  function fetchVoice(text) {
    if (voiceCache[text]) return voiceCache[text];
    voiceCache[text] = fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text })
    }).then(function (res) {
      if (!res.ok) throw new Error('tts');
      return res.blob();
    });
    return voiceCache[text];
  }
  global.CSTrainingVoice = {
    id: 'pFZP5JQG7iQjIQuC4Bku',
    name: 'Lily',
    speak: function (text, onDone) {
      var pieces = voicePieces(text);
      if (!pieces.length) return false;
      var gen = ++voiceGen;
      var pending = {};
      function load(index) {
        if (index >= pieces.length || pending[index]) return;
        pending[index] = fetchVoice(pieces[index]);
      }
      function play(index) {
        if (gen !== voiceGen || index >= pieces.length) return;
        load(index);
        load(index + 1);
        pending[index].then(function (blob) {
          if (gen !== voiceGen) return;
          if (voiceAudio) {
            try { voiceAudio.pause(); } catch (err) {}
          }
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
    trySpeak: function (text, utterance, syncStop) {
      var ok = this.speak(text);
      if (voiceAudio) {
        voiceAudio.addEventListener('ended', function onDone() {
          if (utterance && typeof utterance.onend === 'function') utterance.onend();
          if (syncStop) syncStop();
        });
      }
      return ok;
    },
    stop: function () {
      voiceGen += 1;
      if (voiceAudio) {
        try { voiceAudio.pause(); } catch (err) {}
        voiceAudio = null;
      }
    }
  };

  function sectionSpeech(button) {
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
    ).forEach(function (node) {
      node.remove();
    });
    var text = String(copy.textContent || '').replace(/\s+/g, ' ').trim();
    var parts = text.split(/(?<=[.!?])\s+/).filter(function (sentence) {
      return !/\b(click|confirm you|read each|unlock|press |tap )\b/i.test(sentence);
    });
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  }

  function bindTts() {
    document.addEventListener('click', function (event) {
      var stop = event.target.closest && event.target.closest('[data-tts-stop], [data-concept-tts-stop]');
      if (stop) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (global.CSTrainingVoice) CSTrainingVoice.stop();
        return;
      }
      var listen = event.target.closest && event.target.closest('[data-tts-button], [data-concept-tts]');
      if (!listen || !global.CSTrainingVoice) return;
      var text = sectionSpeech(listen);
      if (!text) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      CSTrainingVoice.speak(text);
    }, true);
    function syncStop() {
      var speaking = !!(global.speechSynthesis && global.speechSynthesis.speaking);
      $$('[data-tts-stop], [data-concept-tts-stop], .btn-tts-stop-inline').forEach(function (btn) {
        btn.disabled = !speaking;
        btn.setAttribute('aria-disabled', speaking ? 'false' : 'true');
      });
    }
    if (global.speechSynthesis && !global.speechSynthesis.__trainingIPatched) {
      global.speechSynthesis.speak = function (utterance) {
        try { global.speechSynthesis.cancel(); } catch (err) {}
        var text = utterance && utterance.text ? String(utterance.text) : '';
        if (text && global.CSTrainingVoice && CSTrainingVoice.trySpeak(text, utterance, syncStop)) return;
        syncStop();
        if (utterance) {
          utterance.addEventListener('end', syncStop);
          utterance.addEventListener('error', syncStop);
        }
      };
      var origCancel = global.speechSynthesis.cancel.bind(global.speechSynthesis);
      global.speechSynthesis.cancel = function () {
        origCancel();
        if (global.CSTrainingVoice) CSTrainingVoice.stop();
        setTimeout(syncStop, 0);
      };
      global.speechSynthesis.__trainingIPatched = true;
    }
    $$('[data-tts-button], [data-concept-tts]').forEach(function (btn) {
      var key = btn.getAttribute('data-tts-button') || btn.getAttribute('data-concept-tts') || '';
      var section = btn.closest('section, .concept-panel, .block-part');
      var label = 'Listen to this section';
      if (section) {
        var heading = section.querySelector('h2, h3, h4');
        if (heading) label = 'Listen to ' + String(heading.textContent || '').trim();
      }
      btn.setAttribute('aria-label', label);
      var stop = btn.parentNode && btn.parentNode.querySelector('[data-tts-stop], [data-concept-tts-stop]');
      if (stop) {
        stop.setAttribute('aria-label', 'Stop audio');
        if (key && !stop.getAttribute('data-tts-stop')) stop.setAttribute('data-tts-stop', key);
      }
    });
    syncStop();
    setInterval(syncStop, 800);
  }

  function bindPulseStop() {
    ['pointerdown', 'keydown', 'wheel'].forEach(function (ev) {
      document.addEventListener(ev, stopPulse, { once: true, passive: true });
    });
  }

  function maybeResetFromQuery() {
    try {
      var params = new URLSearchParams(global.location.search || '');
      if (params.get('resetTrainingI') === '1' || params.get('resetProgress') === '1') {
        P.resetAll();
      }
    } catch (err) {}
  }

  function paintHub() {
    maybeResetFromQuery();
    P.MODULES.forEach(function (def) {
      var snap = P.getSnapshot(def.id);
      var card = $('.module-card[data-module-number="' + def.number + '"]');
      if (!card) return;
      var badge = card.querySelector('.module-status-badge') || document.getElementById('moduleStatus' + def.number);
      if (badge) {
        badge.textContent = P.statusLabel(snap.status);
        badge.className = 'module-status-badge status-' + snap.status;
      }
      var btn = card.querySelector('.module-btn, .module-footer a.btn');
      if (btn) {
        btn.textContent = snap.cta;
        btn.classList.remove('btn-primary', 'btn-secondary');
        btn.classList.add(snap.status === 'not-started' ? 'btn-primary' : 'btn-primary');
      }
      var title = card.querySelector('h3');
      if (title && def.number === 5) title.textContent = def.title;
    });
  }

  function clearModuleResidue(moduleNumber) {
    try {
      Object.keys(localStorage).forEach(function (key) {
        if (key.indexOf('blockIntro_') === 0) localStorage.removeItem(key);
        if (key.indexOf('swimming_module_' + moduleNumber) === 0) localStorage.removeItem(key);
      });
      sessionStorage.clear();
    } catch (err) {}
  }

  function mountRestart(moduleNumber) {
    var nav = document.querySelector('.sidebar .nav-list');
    var host = nav ? nav.closest('.sidebar-card') : document.querySelector('.sidebar');
    if (!host) return;
    var btn = document.getElementById('trainingRestartBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'trainingRestartBtn';
      btn.className = 'btn-restart-module';
      btn.textContent = 'Start again from the beginning';
    }
    host.appendChild(btn);
    if (btn.getAttribute('data-bound') === '1') return;
    btn.setAttribute('data-bound', '1');
    btn.addEventListener('click', function () {
      if (!global.confirm('Clear this module on this computer and start again from Overview?')) return;
      try { P.resetModule(moduleNumber); } catch (err) {}
      clearModuleResidue(moduleNumber);
      global.location.replace(global.location.pathname);
    });
  }

  function bootModule() {
    var moduleNumber = detectModuleNumber();
    if (!moduleNumber) return;
    mountRestart(moduleNumber);
    maybeResetFromQuery();
    normalizeNavLabels();
    hideAdminChrome();
    setupDrawer();
    bindTts();
    bindPulseStop();
    $$('.concept-square[data-target]').forEach(function (btn) {
      if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');
      var grid = btn.closest('[data-concept-grid]');
      if (!grid) return;
      var panel = $('[data-panel-for="' + grid.getAttribute('data-concept-grid') + '"]');
      if (panel) {
        if (!panel.id) panel.id = grid.getAttribute('data-concept-grid') + '-concept-panel';
        btn.setAttribute('aria-controls', panel.id);
      }
    });
    bindCta(moduleNumber);
    bindStages(moduleNumber);
    bindConcepts(moduleNumber);
    bindOutcomes(moduleNumber);
    bindRecapCards(moduleNumber);
    bindQuiz(moduleNumber);
    var snap = P.getSnapshot(moduleNumber);
    restoreChecks(snap);
    refresh(moduleNumber);
    global.TrainingIModuleShell.moduleNumber = moduleNumber;
  }

  global.TrainingIModuleShell = {
    boot: function () {
      if (isHub()) paintHub();
      else bootModule();
    },
    refresh: function () {
      var n = detectModuleNumber();
      if (n) return refresh(n);
      paintHub();
    },
    paintHub: paintHub
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      global.TrainingIModuleShell.boot();
    });
  } else {
    global.TrainingIModuleShell.boot();
  }
})(typeof window !== 'undefined' ? window : this);
