/**
 * Programme Journey Map — unified stage + level navigation (Module 4 Block 3)
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

  var STAGE_TO_CONCEPT = {
    discover: 'b2c1',
    explore: 'b2c2',
    master: 'b2c3'
  };

  function qsa(root, sel) {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }

  function forEachLevelCard(root, fn) {
    qsa(root, '.pjm-level-card').forEach(fn);
  }

  function setActiveStage(root, stageName) {
    qsa(root, '.pjm-stage-tile').forEach(function (tile) {
      var s = tile.getAttribute('data-stage');
      tile.classList.toggle('is-active', s === stageName);
      tile.classList.toggle('is-dimmed', s !== stageName);
    });
    forEachLevelCard(root, function (card) {
      var lvlStage = STAGE_BY_LEVEL[Number(card.getAttribute('data-level'))];
      card.classList.toggle('is-active', lvlStage === stageName);
      card.classList.toggle('is-dimmed', lvlStage !== stageName);
    });
  }

  function setActiveLevel(root, level) {
    var stage = STAGE_BY_LEVEL[level];
    forEachLevelCard(root, function (card) {
      var n = Number(card.getAttribute('data-level'));
      card.classList.toggle('is-active', n === level);
      card.classList.toggle('is-dimmed', n !== level);
    });
    qsa(root, '.pjm-stage-tile').forEach(function (tile) {
      var s = tile.getAttribute('data-stage');
      tile.classList.toggle('is-active', s === stage);
      tile.classList.toggle('is-dimmed', s !== stage);
    });
  }

  function setNavTarget(root, conceptId) {
    if (!root || !conceptId) return;
    var stageConcept = null;
    if (/^b2c[1-3]$/.test(conceptId)) stageConcept = conceptId;
    else if (/^b2l/.test(conceptId)) {
      var m = conceptId.match(/b2l(\d)/);
      if (m) stageConcept = STAGE_TO_CONCEPT[STAGE_BY_LEVEL[Number(m[1])]];
    }
    qsa(root, '.pjm-stage-tile').forEach(function (tile) {
      var c = tile.getAttribute('data-concept');
      tile.classList.toggle('is-nav-active', c === conceptId || (stageConcept && c === stageConcept));
      tile.classList.remove('is-dimmed');
    });
    forEachLevelCard(root, function (card) {
      var n = Number(card.getAttribute('data-level'));
      var levelConcept = LEVEL_TO_CONCEPT[n];
      var isLevelRoot = conceptId === levelConcept;
      var levelMatch = conceptId && conceptId.match(/b2l(\d)/);
      var sameLevel = levelMatch && Number(levelMatch[1]) === n;
      card.classList.toggle('is-nav-active', isLevelRoot || sameLevel);
      card.classList.remove('is-dimmed');
    });
  }

  function clearActive(root) {
    qsa(root, '.pjm-stage-tile, .pjm-level-card').forEach(function (el) {
      el.classList.remove('is-active', 'is-dimmed', 'is-nav-active');
    });
  }

  function syncProgressState(root, isLevelComplete, isStageComplete) {
    forEachLevelCard(root, function (el) {
      var level = Number(el.getAttribute('data-level'));
      var conceptId = LEVEL_TO_CONCEPT[level];
      var complete = typeof isLevelComplete === 'function' && isLevelComplete(conceptId);
      el.classList.toggle('is-complete', complete);
    });
    qsa(root, '.pjm-stage-tile').forEach(function (tile) {
      var conceptId = tile.getAttribute('data-concept');
      var complete = typeof isStageComplete === 'function' && isStageComplete(conceptId);
      tile.classList.toggle('is-stage-complete', complete);
    });
  }

  function wireInteractions(root, options) {
    options = options || {};

    qsa(root, '.pjm-stage-tile').forEach(function (tile) {
      tile.addEventListener('mouseenter', function () {
        setActiveStage(root, tile.getAttribute('data-stage'));
      });
      tile.addEventListener('focus', function () {
        setActiveStage(root, tile.getAttribute('data-stage'));
      });
      tile.addEventListener('click', function () {
        var stageName = tile.getAttribute('data-stage');
        setActiveStage(root, stageName);
        if (typeof options.onStageSelect === 'function') {
          options.onStageSelect(STAGE_TO_CONCEPT[stageName], stageName);
        }
      });
    });

    forEachLevelCard(root, function (el) {
      el.addEventListener('mouseenter', function () {
        setActiveLevel(root, Number(el.getAttribute('data-level')));
      });
      el.addEventListener('focus', function () {
        setActiveLevel(root, Number(el.getAttribute('data-level')));
      });
      el.addEventListener('click', function () {
        var level = Number(el.getAttribute('data-level'));
        setActiveLevel(root, level);
        if (typeof options.onLevelSelect === 'function') {
          options.onLevelSelect(level, LEVEL_TO_CONCEPT[level]);
        }
      });
    });

    root.addEventListener('mouseleave', function () {
      if (typeof options.getNavTarget === 'function') {
        var navTarget = options.getNavTarget();
        if (navTarget) {
          setNavTarget(root, navTarget);
          return;
        }
      }
      clearActive(root);
    });
  }

  function init(root, options) {
    if (!root) return;
    options = options || {};
    wireInteractions(root, options);
    syncProgressState(root, options.isLevelComplete, options.isStageComplete);
    root._pjmOptions = options;
  }

  function syncProgress(root, isLevelComplete, isStageComplete) {
    if (!root) return;
    syncProgressState(root, isLevelComplete, isStageComplete);
    if (root._pjmOptions) {
      root._pjmOptions.isLevelComplete = isLevelComplete;
      root._pjmOptions.isStageComplete = isStageComplete;
    }
  }

  global.ProgrammeJourneyMap = {
    init: init,
    syncProgress: syncProgress,
    setNavTarget: setNavTarget,
    clearActive: clearActive,
    LEVEL_TO_CONCEPT: LEVEL_TO_CONCEPT,
    STAGE_TO_CONCEPT: STAGE_TO_CONCEPT
  };
})(typeof window !== 'undefined' ? window : this);
