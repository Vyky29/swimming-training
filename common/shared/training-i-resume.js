(function (global) {
  'use strict';
  var match = location.pathname.match(/\/modules\/module-(\d+)\//);
  if (!match) return;
  var number = Number(match[1]);
  var key = 'swimming_module_' + number + '_resume_v1';
  var saved;
  try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch (_) { saved = {}; }
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {};
  ['reviews', 'speech', 'images', 'audio', 'levels'].forEach(function (name) {
    if (!saved[name] || typeof saved[name] !== 'object') saved[name] = {};
  });
  function write() { try { localStorage.setItem(key, JSON.stringify(saved)); } catch (_) {} }
  function reviewKey(el) {
    var panel = el.closest('.concept-panel');
    var screen = el.closest('[data-b2-screen]');
    var section = el.closest('section[id], [data-panel-for]');
    var copy = el.querySelector('.key-idea-text') || el;
    var copyText = el.classList.contains('key-ideas-action') ? ['[data-inprac-lead]', '[data-inprac-look]', '[data-inprac-avoid]'].map(function (selector) { var node = el.querySelector(selector); return node ? node.textContent : ''; }).join('|') : copy.textContent;
    var text = String(copyText || '').replace(/✓|\bREVIEWED\b|\bREVIEW\b/g, '').replace(/\s+/g, ' ').trim();
    return [(panel && panel.dataset.currentTarget) || (section && section.id) || 'module', screen && screen.dataset.b2Screen || '', text].join('|');
  }
  var selector = '.concept-insight-pillar, .key-idea-item, #outcomes .outcome, .block-intro-card, .recap-card, .recap-takeaway-card, [data-inprac-part], .key-ideas-action, .m5-yellow-use-card, .stage-intro-card[data-stage-card]';
  function capture() {
    document.querySelectorAll(selector).forEach(function (el) {
      var flags = {};
      if (el.classList.contains('clicked')) flags.clicked = true;
      if (el.classList.contains('is-reviewed')) flags.reviewed = true;
      if (el.classList.contains('is-completed')) flags.completed = true;
      if (el.classList.contains('stage-intro-card') && el.classList.contains('is-complete')) flags.stageComplete = true;
      ['data-pillar-spoken', 'data-outcome-spoken'].forEach(function (attr) { if (el.getAttribute(attr) === 'done') flags[attr] = 'done'; });
      if (Object.keys(flags).length) saved.reviews[reviewKey(el)] = flags;
    });
    Array.prototype.forEach.call(document.documentElement.attributes, function (a) {
      if (a.name.indexOf('data-spoken-') === 0 && a.value === 'done') saved.speech[a.name] = true;
    });
    var journeyMap = document.querySelector('[data-programme-journey-map]');
    var tour = journeyMap && journeyMap.getAttribute('data-pjm-tour-visited');
    if (tour) saved.journeyTour = tour;
    var panel = document.querySelector('.concept-panel.show[data-current-target]');
    if (panel) saved.point = { block: panel.dataset.panelFor, target: panel.dataset.currentTarget, screen: panel.dataset.m5NestedScreen || null };
    write();
  }
  function restore() {
    var changedActions = [];
    var journeyMap = document.querySelector('[data-programme-journey-map]');
    if (journeyMap && saved.journeyTour && global.ProgrammeJourneyMap && journeyMap.getAttribute('data-pjm-tour-visited') !== saved.journeyTour) {
      saved.journeyTour.split(',').forEach(function (level) { global.ProgrammeJourneyMap.markTourLevel(journeyMap, Number(level)); });
    }
    Object.keys(saved.speech).forEach(function (attr) {
      if (saved.speech[attr] && attr.indexOf('data-spoken-') === 0 && document.documentElement.getAttribute(attr) !== 'done') document.documentElement.setAttribute(attr, 'done');
    });
    document.querySelectorAll(selector).forEach(function (el) {
      var flags = saved.reviews[reviewKey(el)];
      if (!flags) return;
      if (flags.stageComplete && !el.classList.contains('is-complete')) {
        el.classList.add('is-complete'); el.setAttribute('aria-pressed', 'true');
        var stagePanel = el.closest('.concept-panel');
        if (stagePanel) stagePanel.dispatchEvent(new CustomEvent('training-stage-cards-restored'));
      }
      if (flags.reviewed && !el.classList.contains('is-reviewed')) {
        el.classList.add('is-reviewed'); el.setAttribute('aria-pressed', 'true');
        var action = el.closest('.key-ideas-action');
        if (action && changedActions.indexOf(action) === -1) changedActions.push(action);
      }
      if (flags.clicked) {
        if (!el.classList.contains('clicked')) el.classList.add('clicked');
        if (el.getAttribute('aria-checked') !== 'true') el.setAttribute('aria-checked', 'true');
        if (el.getAttribute('aria-pressed') !== 'true') el.setAttribute('aria-pressed', 'true');
        if (el.classList.contains('block-intro-card') && el.getAttribute('data-flow-block-intro-done') !== 'true') el.setAttribute('data-flow-block-intro-done', 'true');
      }
      ['data-pillar-spoken', 'data-outcome-spoken'].forEach(function (attr) {
        if (flags[attr] === 'done' && el.getAttribute(attr) !== 'done') el.setAttribute(attr, 'done');
      });
    });
    if (global.InPracticeSystem) {
      document.querySelectorAll('.key-ideas-action').forEach(function (action) {
        var flags = saved.reviews[reviewKey(action)];
        if (flags && flags.completed && !action.classList.contains('is-completed')) global.InPracticeSystem.completeAction(action);
      });
      changedActions.forEach(function (action) { if (global.InPracticeSystem.refreshProgress) global.InPracticeSystem.refreshProgress(action); });
    }
    // Restoring appearance must also restore the completion state consumed by modules.
    document.querySelectorAll('.concept-panel.show').forEach(function (panel) {
      var changed = false;
      [['.concept-insight-pillar', 'insightPillarsDone'], ['.key-idea-item', 'keyIdeasDone']].forEach(function (entry) {
        var cards = panel.querySelectorAll(entry[0]);
        if (!cards.length) return;
        var complete = Array.prototype.every.call(cards, function (card) { return card.classList.contains('clicked'); });
        var value = complete ? 'true' : 'false';
        if (panel.dataset[entry[1]] !== value) { panel.dataset[entry[1]] = value; changed = true; }
      });
      if (changed) panel.dispatchEvent(new CustomEvent('concept-insight-pillars-change', { bubbles: true }));
    });
  }
  global.TrainingIResume = {
    capture: capture,
    levelReview: function (target) { return saved.levels[target] || { points: {}, activities: {} }; },
    saveLevelReview: function (target, value) { saved.levels[target] = value; write(); },
    hasImage: function (src) { return saved.images[new URL(src, location.href).href] === true; },
    imageReviewed: function (src) { saved.images[new URL(src, location.href).href] = true; write(); },
    audioPosition: function (text) { return saved.audio[text] || { index: 0, time: 0 }; },
    saveAudio: function (text, index, time) { saved.audio[text] = { index: index, time: time }; write(); },
    clearAudio: function (text) { delete saved.audio[text]; write(); },
    resume: function (snapshot) {
      var point = saved.point;
      if (!point || point.block !== snapshot.nextStep || typeof global.renderConcept !== 'function') return false;
      var completed = snapshot.concepts && snapshot.concepts[point.block] || [];
      if (completed.indexOf(point.target) !== -1) { saved.point = null; write(); return false; }
      global.renderConcept(point.block, point.target);
      restore();
      // Re-enter a nested screen through its normal handler, preserving its guards.
      if (point.screen && point.screen !== 'home') {
        var panel = document.querySelector('.concept-panel.show');
        var button = panel && Array.prototype.find.call(panel.querySelectorAll('[data-b2-go]'), function (el) { return el.dataset.b2Go === point.screen; });
        if (button) button.click();
      }
      if (global.TrainingFlowGuide) global.TrainingFlowGuide.requestRefresh();
      return true;
    }
  };
  Object.keys(saved.speech).forEach(function (attr) { if (attr.indexOf('data-spoken-') === 0 && saved.speech[attr]) document.documentElement.setAttribute(attr, 'done'); });
  function boot() {
    // Migrate earned stages once: a completed stage must not replay its introduction.
    if (global.TrainingIProgress) {
      var snapshot = global.TrainingIProgress.getSnapshot(number);
      Object.keys(snapshot.steps).forEach(function (stage) {
        if (snapshot.steps[stage]) saved.speech['data-spoken-' + (stage === 'outcomes' ? 'outcomes-read' : stage)] = true;
      });
      Object.keys(snapshot.concepts).forEach(function (block) {
        if (!snapshot.concepts[block].length) return;
        saved.speech['data-spoken-inside'] = true;
        saved.speech['data-spoken-' + block] = true;
        saved.speech['data-spoken-' + block + '-concepts'] = true;
        document.querySelectorAll('#' + block + ' .block-intro-card').forEach(function (el) {
          saved.reviews[reviewKey(el)] = { clicked: true };
        });
      });
    }
    restore();
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      setTimeout(function () { queued = false; restore(); capture(); }, 100);
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'data-pillar-spoken', 'data-outcome-spoken', 'data-current-target', 'data-pjm-tour-visited'] });
    document.addEventListener('click', function (event) {
      var el = event.target.closest && event.target.closest('[data-finish-concept], .concept-back');
      if (el && !el.disabled) { saved.point = null; write(); }
    });
    global.addEventListener('pagehide', capture);
    document.addEventListener('visibilitychange', function () { if (document.hidden) capture(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window);
