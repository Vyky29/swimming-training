/**
 * Programme Journey Map — Ocean Journey / Swimmer Passport (Module 4 Block 3)
 * Vanilla JS equivalent of a reusable React component; wire via ProgrammeJourneyMap.init()
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

  var MASCOTS = {
    turtle: '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="36" rx="18" ry="14" fill="#1f7a4d"/><path d="M14 36c-4 2-8 6-10 10 6-2 12-2 18 0 6-3 12-4 18-2 6-2 10-6 12-10-4 2-8 3-12 2-6 1-12 0-18-2-2 1-6 1-8 0z" fill="#2f9a62"/><circle cx="26" cy="32" r="2.2" fill="#fff"/><circle cx="38" cy="32" r="2.2" fill="#fff"/><path d="M32 18c-2 0-4 2-4 5v4h8v-4c0-3-2-5-4-5z" fill="#5cb8a8"/></svg>',
    starfish: '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32 12 38 22 50 24 40 32 43 44 32 38 21 44 24 32 14 24 26 22 32 12Z" fill="#e8a030"/><circle cx="32" cy="30" r="4" fill="#fff6df"/></svg>',
    jellyfish: '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32 10c-8 8-12 18-10 28 2 8 8 14 10 16 2-2 8-8 10-16 2-10-2-20-10-28z" fill="#c47f12"/><path d="M32 22v18M26 28h12M24 34h16" stroke="rgba(255,255,255,.55)" stroke-width="2" stroke-linecap="round"/></svg>',
    ray: '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="34" rx="20" ry="10" fill="#d4a832"/><path d="M12 34c6-4 12-6 20-6s14 2 20 6" stroke="rgba(255,255,255,.55)" stroke-width="2" stroke-linecap="round"/><path d="M32 24 28 18h8l-4 6z" fill="#fff6df"/></svg>',
    dolphin: '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 34c8-6 16-8 24-6 4 1 8 3 10 6-2 4-6 8-10 10-8 4-16 2-24-4z" fill="#4eb0e5"/><path d="M44 28c6-2 10 0 12 4-4 2-8 2-12 0" fill="#2d84b3"/><circle cx="24" cy="32" r="2" fill="#fff"/></svg>',
    whale: '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 38c10-8 22-10 32-6 6 2 10 6 12 10-6 4-14 6-22 4-8-2-16-4-22-8z" fill="#12456b"/><path d="M46 30c8-2 12 2 14 8-6 0-10-2-14-8z" fill="#2d84b3"/><path d="M18 36c-2 4-2 8 0 12" stroke="#4eb0e5" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  function qs(root, sel) {
    return root.querySelector(sel);
  }

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

  function syncBadges(root, isLevelComplete) {
    qsa(root, '.pjm-stamp').forEach(function (stamp) {
      var level = Number(stamp.getAttribute('data-level'));
      var conceptId = LEVEL_TO_CONCEPT[level];
      var unlocked = typeof isLevelComplete === 'function' && isLevelComplete(conceptId);
      stamp.classList.toggle('is-unlocked', unlocked);
      stamp.classList.toggle('is-locked', !unlocked);
      stamp.setAttribute('aria-label', (unlocked ? 'Unlocked: ' : 'Locked: ') + (stamp.getAttribute('data-jgs') || ''));
    });
  }

  function wireInteractions(root) {
    var nodes = qsa(root, '.pjm-ocean-node, .pjm-level-card');
    nodes.forEach(function (el) {
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
      stage.addEventListener('mouseenter', function () {
        var stageName = stage.getAttribute('data-stage');
        qsa(root, '.pjm-stage').forEach(function (el) {
          el.classList.toggle('is-highlighted', el.getAttribute('data-stage') === stageName);
          el.classList.toggle('is-dimmed', el.getAttribute('data-stage') !== stageName);
        });
        qsa(root, '.pjm-ocean-node, .pjm-level-card').forEach(function (el) {
          var lvlStage = STAGE_BY_LEVEL[Number(el.getAttribute('data-level'))];
          el.classList.toggle('is-dimmed', lvlStage !== stageName);
          el.classList.toggle('is-active', lvlStage === stageName && el.classList.contains('pjm-level-card'));
        });
      });
    });
  }

  function init(root, options) {
    if (!root) return;
    options = options || {};
    wireInteractions(root);
    if (typeof options.isLevelComplete === 'function') {
      syncBadges(root, options.isLevelComplete);
    } else {
      syncBadges(root, function () { return false; });
    }
    root._pjmOptions = options;
  }

  function syncProgress(root, isLevelComplete) {
    if (!root) return;
    syncBadges(root, isLevelComplete);
    if (root._pjmOptions) root._pjmOptions.isLevelComplete = isLevelComplete;
  }

  global.ProgrammeJourneyMap = {
    init: init,
    syncProgress: syncProgress,
    MASCOTS: MASCOTS,
    LEVEL_TO_CONCEPT: LEVEL_TO_CONCEPT
  };
})(typeof window !== 'undefined' ? window : this);
