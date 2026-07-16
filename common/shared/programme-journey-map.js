/**
 * Programme Journey Map - Stage Worlds (Module 4 Block 3)
 * Three worlds x two animals; cards stay visually fixed (no hover dim).
 * Guided tour: tap levels 1->6 in order before opening a stage.
 */
(function (global) {
  'use strict';

  var LEVEL_TO_CONCEPT = {
    1: 'b2l1',
    2: 'b2l2',
    3: 'b2l3',
    4: 'b2l4',
    5: 'b2l5',
    6: 'b2l6'
  };

  var STAGE_BY_LEVEL = {
    1: 'discover',
    2: 'discover',
    3: 'explore',
    4: 'explore',
    5: 'master',
    6: 'master'
  };

  var LEVEL_LABELS = {
    1: 'Level 1 Turtle',
    2: 'Level 2 Starfish',
    3: 'Level 3 Jellyfish',
    4: 'Level 4 Stingray',
    5: 'Level 5 Dolphin',
    6: 'Level 6 Whale'
  };

  var TOUR_ORDER = [1, 2, 3, 4, 5, 6];

  function qsa(root, sel) {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }

  function parseVisited(root) {
    var raw = (root.getAttribute('data-pjm-tour-visited') || '').trim();
    if (!raw) return {};
    var out = {};
    raw.split(',').forEach(function (part) {
      var n = Number(part);
      if (n >= 1 && n <= 6) out[n] = true;
    });
    return out;
  }

  function writeVisited(root, visited) {
    var list = TOUR_ORDER.filter(function (n) { return visited[n]; });
    root.setAttribute('data-pjm-tour-visited', list.join(','));
    if (list.length >= TOUR_ORDER.length) {
      root.setAttribute('data-pjm-tour-complete', 'true');
    } else {
      root.removeAttribute('data-pjm-tour-complete');
    }
  }

  function getNextTourLevel(root) {
    if (!root || root.getAttribute('data-pjm-tour-complete') === 'true') return null;
    var visited = parseVisited(root);
    for (var i = 0; i < TOUR_ORDER.length; i++) {
      if (!visited[TOUR_ORDER[i]]) return TOUR_ORDER[i];
    }
    return null;
  }

  function syncStageGridLock(root, tourComplete) {
    var section = root.closest('section[id^="block"]') || document.getElementById('block3');
    if (!section) return;
    var grid = section.querySelector('[data-concept-grid="block3"]');
    if (!grid) return;
    var guided = document.documentElement.getAttribute('data-guided-flow') === 'true';
    var lock = guided && !tourComplete;
    grid.classList.toggle('is-pjm-tour-locked', lock);
    qsa(grid, '.concept-square[data-target]').forEach(function (btn) {
      if (lock) {
        btn.classList.add('is-locked');
        btn.setAttribute('aria-disabled', 'true');
      } else {
        btn.classList.remove('is-locked');
        btn.removeAttribute('aria-disabled');
      }
    });
  }

  function syncTourVisualState(root) {
    var visited = parseVisited(root);
    var next = getNextTourLevel(root);
    var complete = root.getAttribute('data-pjm-tour-complete') === 'true';
    qsa(root, '.pjm-ocean-node, .pjm-level-card').forEach(function (el) {
      var level = Number(el.getAttribute('data-level'));
      el.classList.toggle('is-tour-visited', !!visited[level]);
      el.classList.toggle('is-tour-next', !complete && next === level);
      el.classList.toggle('is-tour-locked', !complete && next !== null && level > next);
      // Completed / tour-tapped levels must stay fully opaque
      if (visited[level] || el.classList.contains('is-complete')) {
        el.classList.remove('is-dimmed');
      }
    });
    syncStageGridLock(root, complete);
  }

  function markTourLevel(root, level) {
    level = Number(level);
    if (!root || !(level >= 1 && level <= 6)) return false;
    var next = getNextTourLevel(root);
    if (next === null) return false;
    // Strict order: only the next level advances the tour
    if (level !== next) return false;
    var visited = parseVisited(root);
    visited[level] = true;
    writeVisited(root, visited);
    syncTourVisualState(root);
    return true;
  }

  function markTourComplete(root) {
    if (!root) return;
    var visited = {};
    TOUR_ORDER.forEach(function (n) { visited[n] = true; });
    writeVisited(root, visited);
    syncTourVisualState(root);
  }

  function getNextTourTarget(root) {
    if (!root) return null;
    var next = getNextTourLevel(root);
    if (next === null) return null;
    var card = root.querySelector('.pjm-level-card[data-level="' + next + '"]');
    var node = root.querySelector('.pjm-ocean-node[data-level="' + next + '"]');
    var el = card || node;
    if (!el) return null;
    return {
      level: next,
      el: el,
      label: 'Tap ' + (LEVEL_LABELS[next] || ('Level ' + next))
    };
  }

  function shouldKeepSolid(el, level, activeLevel) {
    if (Number(el.getAttribute('data-level')) === activeLevel) return true;
    if (el.classList.contains('is-tour-visited')) return true;
    if (el.classList.contains('is-complete')) return true;
    return false;
  }

  function setActiveLevel(root, level) {
    /* Keep every stage/level fully visible - active is click-only, never dims others */
    qsa(root, '.pjm-ocean-node, .pjm-level-card').forEach(function (el) {
      var n = Number(el.getAttribute('data-level'));
      el.classList.toggle('is-active', n === level);
      el.classList.remove('is-dimmed');
    });
    var stage = STAGE_BY_LEVEL[level];
    qsa(root, '.pjm-stage').forEach(function (el) {
      el.classList.toggle('is-highlighted', el.getAttribute('data-stage') === stage);
      el.classList.remove('is-dimmed');
    });
  }

  function clearActive(root) {
    qsa(root, '.pjm-ocean-node, .pjm-stage, .pjm-level-card').forEach(function (el) {
      el.classList.remove('is-active', 'is-highlighted', 'is-dimmed');
    });
  }

  function syncProgressState(root, isLevelComplete) {
    qsa(root, '.pjm-level-card, .pjm-ocean-node').forEach(function (el) {
      var level = Number(el.getAttribute('data-level'));
      var conceptId = LEVEL_TO_CONCEPT[level];
      var complete = typeof isLevelComplete === 'function' && isLevelComplete(conceptId);
      el.classList.toggle('is-complete', complete);
    });
  }

  function wireInteractions(root) {
    if (root.getAttribute('data-pjm-wired') === '1') return;
    root.setAttribute('data-pjm-wired', '1');

    qsa(root, '.pjm-ocean-node, .pjm-level-card').forEach(function (el) {
      el.addEventListener('click', function () {
        var level = Number(el.getAttribute('data-level'));
        markTourLevel(root, level);
        setActiveLevel(root, level);
      });
      el.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        el.click();
      });
    });
  }

  function init(root, options) {
    if (!root) return;
    options = options || {};
    wireInteractions(root);
    syncProgressState(root, options.isLevelComplete);
    if (options.tourComplete || root.getAttribute('data-pjm-tour-complete') === 'true') {
      markTourComplete(root);
    } else {
      syncTourVisualState(root);
    }
    root._pjmOptions = options;
  }

  function syncProgress(root, isLevelComplete) {
    if (!root) return;
    syncProgressState(root, isLevelComplete);
    if (root._pjmOptions) root._pjmOptions.isLevelComplete = isLevelComplete;
    syncTourVisualState(root);
  }

  global.ProgrammeJourneyMap = {
    init: init,
    syncProgress: syncProgress,
    getNextTourTarget: getNextTourTarget,
    markTourLevel: markTourLevel,
    markTourComplete: markTourComplete,
    LEVEL_TO_CONCEPT: LEVEL_TO_CONCEPT
  };
})(typeof window !== 'undefined' ? window : this);
