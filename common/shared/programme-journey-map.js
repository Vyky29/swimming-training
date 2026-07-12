/**
 * Programme Journey Map — Stage Worlds (Module 4 Block 3)
 * Three worlds × two animals; hover/focus syncs stage + level cards.
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

  function qsa(root, sel) {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }

  function setActiveLevel(root, level) {
    var stage = STAGE_BY_LEVEL[level];
    qsa(root, '.pjm-ocean-node').forEach(function (node) {
      var n = Number(node.getAttribute('data-level'));
      node.classList.toggle('is-active', n === level);
      node.classList.toggle('is-dimmed', n !== level);
    });
    qsa(root, '.pjm-stage').forEach(function (el) {
      var s = el.getAttribute('data-stage');
      el.classList.toggle('is-highlighted', s === stage);
      el.classList.toggle('is-dimmed', s !== stage);
    });
    qsa(root, '.pjm-level-card').forEach(function (card) {
      var n = Number(card.getAttribute('data-level'));
      card.classList.toggle('is-active', n === level);
      card.classList.toggle('is-dimmed', n !== level);
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
    qsa(root, '.pjm-ocean-node, .pjm-level-card').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        setActiveLevel(root, Number(el.getAttribute('data-level')));
      });
      el.addEventListener('focus', function () {
        setActiveLevel(root, Number(el.getAttribute('data-level')));
      });
      el.addEventListener('click', function () {
        setActiveLevel(root, Number(el.getAttribute('data-level')));
      });
    });
    root.addEventListener('mouseleave', function () {
      clearActive(root);
    });
    qsa(root, '.pjm-stage').forEach(function (stage) {
      stage.addEventListener('mouseenter', function (e) {
        // If already focusing a specific level inside, keep that highlight.
        if (e.target && e.target.closest && e.target.closest('.pjm-ocean-node, .pjm-level-card')) {
          return;
        }
        var stageName = stage.getAttribute('data-stage');
        qsa(root, '.pjm-stage').forEach(function (el) {
          el.classList.toggle('is-highlighted', el.getAttribute('data-stage') === stageName);
          el.classList.toggle('is-dimmed', el.getAttribute('data-stage') !== stageName);
        });
        qsa(root, '.pjm-ocean-node, .pjm-level-card').forEach(function (el) {
          var lvlStage = STAGE_BY_LEVEL[Number(el.getAttribute('data-level'))];
          el.classList.toggle('is-dimmed', lvlStage !== stageName);
          el.classList.remove('is-active');
        });
      });
    });
  }

  function init(root, options) {
    if (!root) return;
    options = options || {};
    wireInteractions(root);
    syncProgressState(root, options.isLevelComplete);
    root._pjmOptions = options;
  }

  function syncProgress(root, isLevelComplete) {
    if (!root) return;
    syncProgressState(root, isLevelComplete);
    if (root._pjmOptions) root._pjmOptions.isLevelComplete = isLevelComplete;
  }

  global.ProgrammeJourneyMap = {
    init: init,
    syncProgress: syncProgress,
    LEVEL_TO_CONCEPT: LEVEL_TO_CONCEPT
  };
})(typeof window !== 'undefined' ? window : this);
