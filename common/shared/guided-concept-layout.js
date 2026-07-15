(function (global) {
  'use strict';

  var SECTION_ORDER = ['visual', 'keyideas', 'inpractice', 'activity', 'done'];

  function isLeafPage(page) {
    if (!page) return false;
    return !page.querySelector('.b2pl-cat-grid, .b2pl-folder-grid, .b2c2-home-grid, .b2c3-home-grid');
  }

  function findVisualSection(page) {
    return page.querySelector(
      '.m5-nested-visual-shell, .m5-screen-visual-card:not(.m5-folder-overview-card), .section-visual-shell'
    );
  }

  function findKeyIdeasSection(page) {
    return page.querySelector('.m5-nested-ideas-card, .section-ideas, .concept-section-card.section-ideas');
  }

  function findActivitySection(page) {
    return page.querySelector('.section-activity-shell[data-m5-b2-nested-key], .section-activity-shell[data-m5-b2-choice-mount]');
  }

  function markSection(el, name) {
    if (el) el.setAttribute('data-guided-section', name);
  }

  function insertAfter(anchor, node) {
    if (!anchor || !node || node.parentNode === anchor.parentNode && anchor.nextElementSibling === node) return;
    if (anchor.parentNode) anchor.parentNode.insertBefore(node, anchor.nextSibling);
  }

  function ensurePageLayout(page) {
    if (!page || !isLeafPage(page)) return;

    var visual = findVisualSection(page);
    var ideas = findKeyIdeasSection(page);
    var activity = findActivitySection(page);
    var nav = page.querySelector('.b2-nav');

    if (!visual) return;

    var anchor = visual;
    if (ideas && ideas.parentNode === page) {
      insertAfter(anchor, ideas);
      anchor = ideas;
    }
    if (activity && activity.parentNode === page) {
      insertAfter(anchor, activity);
      anchor = activity;
    }
    if (nav && nav.parentNode === page) {
      page.appendChild(nav);
    }

    markSection(visual, 'visual');
    if (ideas) markSection(ideas, 'keyideas');
    if (activity) markSection(activity, 'activity');
    var inPractice = page.querySelector('.key-ideas-action:not([hidden])');
    if (inPractice) markSection(inPractice, 'inpractice');
  }

  function getNestedScreenContext(panel) {
    if (!panel) return { mode: 'flat' };
    var wrapper = panel.querySelector('[data-b2-screens]');
    if (!wrapper) return { mode: 'flat' };
    var active = wrapper.querySelector('.b2-screen.active') || wrapper.querySelector('.b2-screen');
    if (!active) return { mode: 'hub', screenId: 'home', wrapper: wrapper, active: null };
    var screenId = active.getAttribute('data-b2-screen') || 'home';
    if (screenId === 'home') return { mode: 'hub', screenId: screenId, wrapper: wrapper, active: active };
    if (active.querySelector('.b2pl-cat-grid, .b2pl-folder-grid')) {
      return { mode: 'folder', screenId: screenId, wrapper: wrapper, active: active };
    }
    return { mode: 'leaf', screenId: screenId, wrapper: wrapper, active: active, page: active.querySelector('.folder-page') || active };
  }

  function scopedFlowRoot(panel) {
    var ctx = getNestedScreenContext(panel);
    if (ctx.mode === 'leaf' && ctx.page) return ctx.page;
    if (ctx.mode === 'folder' && ctx.active) return ctx.active;
    return panel;
  }

  function wireScopedKeyIdeas(panel, block, target) {
    if (!panel) return;
    var root = panel.querySelector('[data-b2-screens]') || panel;
    root.querySelectorAll('.concept-points-box .key-idea-item').forEach(function (li) {
      if (li.dataset.guidedKeyIdeaBound === '1') return;
      li.dataset.guidedKeyIdeaBound = '1';
      li.setAttribute('role', 'button');
      if (!li.hasAttribute('tabindex')) li.setAttribute('tabindex', '0');
      li.addEventListener('click', function () {
        li.classList.add('clicked');
        if (typeof global.updateConceptFinishStateM5 === 'function') {
          global.updateConceptFinishStateM5(panel, block, target);
        }
        if (global.TrainingFlowGuide && typeof TrainingFlowGuide.bumpFlowAdvance === 'function') {
          TrainingFlowGuide.bumpFlowAdvance(80);
        }
      });
      li.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          li.click();
        }
      });
    });
  }

  function wireScopedInPractice(panel, block, target) {
    if (!panel) return;
    panel.querySelectorAll('.key-ideas-action:not([data-guided-inpractice-bound])').forEach(function (actionEl) {
      if (actionEl.hasAttribute('hidden')) return;
      actionEl.setAttribute('data-guided-inpractice-bound', '1');
      actionEl.addEventListener('click', function () {
        actionEl.classList.add('is-completed');
        if (typeof global.updateConceptFinishStateM5 === 'function') {
          global.updateConceptFinishStateM5(panel, block, target);
        }
        if (global.TrainingFlowGuide && typeof TrainingFlowGuide.bumpFlowAdvance === 'function') {
          TrainingFlowGuide.bumpFlowAdvance(80);
        }
      });
    });
  }

  function getCategoryIdsForFolder(wrapper, folderId) {
    if (!wrapper || !folderId) return [];
    var folderScreen = wrapper.querySelector('.b2-screen[data-b2-screen="' + folderId + '"]');
    if (!folderScreen) return [];
    return Array.from(folderScreen.querySelectorAll('.b2pl-lvl-btn[data-b2-go]')).map(function (btn) {
      return btn.getAttribute('data-b2-go');
    }).filter(Boolean);
  }

  function parseDoneList(panel, key) {
    return (panel.dataset[key] || '').split(',').filter(Boolean);
  }

  function isItemDone(panel, key, id) {
    return parseDoneList(panel, key).indexOf(id) >= 0;
  }

  function markItemDone(panel, key, id) {
    if (!panel || !id || isItemDone(panel, key, id)) return;
    var list = parseDoneList(panel, key);
    list.push(id);
    panel.dataset[key] = list.join(',');
  }

  function findNextLeafTarget(panel, leafId) {
    var ctx = getNestedScreenContext(panel);
    if (!ctx.wrapper || !leafId) return null;
    var folderId = leafId.replace(/-s\d+$/, '').replace(/^fc/, 'fc');
    if (/^f\d+-s\d+$/.test(leafId)) {
      folderId = leafId.replace(/-s\d+$/, '');
    }
    var cats = getCategoryIdsForFolder(ctx.wrapper, folderId);
    if (cats.length) {
      for (var i = 0; i < cats.length; i++) {
        if (cats[i] === leafId) {
          for (var j = i + 1; j < cats.length; j++) {
            if (!isItemDone(panel, 'flowM5CatsDone', cats[j])) return cats[j];
          }
          return folderId;
        }
      }
      for (var k = 0; k < cats.length; k++) {
        if (!isItemDone(panel, 'flowM5CatsDone', cats[k])) return cats[k];
      }
      return folderId;
    }
    return 'home';
  }

  function navigateNestedScreen(panel, screenId) {
    if (!panel || !screenId) return false;
    var wrapper = panel.querySelector('[data-b2-screens]');
    if (!wrapper) return false;
    var btn = wrapper.querySelector('[data-b2-go="' + screenId + '"]');
    if (btn) {
      btn.click();
      return true;
    }
    wrapper.querySelectorAll('.b2-screen').forEach(function (screen) {
      screen.classList.toggle('active', screen.getAttribute('data-b2-screen') === screenId);
    });
    return true;
  }

  /** Parent screen for nested folders/leaves (leaf→folder→home). */
  function getNestedBackTarget(panel) {
    var ctx = getNestedScreenContext(panel);
    if (!ctx || !ctx.wrapper || ctx.mode === 'flat' || ctx.mode === 'hub') return null;
    var navBack = ctx.active && ctx.active.querySelector('.b2-nav [data-b2-go]');
    if (navBack) {
      var go = navBack.getAttribute('data-b2-go');
      if (go) return go;
    }
    var id = ctx.screenId || '';
    if (/^f\d+-s\d+$/.test(id)) return id.replace(/-s\d+$/, '');
    if (/^vs\d+$/.test(id) || /^fc\d+$/.test(id)) return 'home';
    if (ctx.mode === 'folder' && id && id !== 'home') return 'home';
    return null;
  }

  function navigateNestedBack(panel) {
    var target = getNestedBackTarget(panel);
    if (!target) return false;
    return navigateNestedScreen(panel, target);
  }

  function advanceAfterLeafDone(panel, block, target, leafId) {
    markItemDone(panel, 'flowM5CatsDone', leafId);
    var next = findNextLeafTarget(panel, leafId);
    if (next && next !== leafId) {
      navigateNestedScreen(panel, next);
      if (global.TrainingFlowGuide && typeof TrainingFlowGuide.bumpFlowAdvance === 'function') {
        TrainingFlowGuide.bumpFlowAdvance(120);
      }
      return true;
    }
    return false;
  }

  function normalizePanel(panel) {
    if (!panel) return;
    var wrapper = panel.querySelector('[data-b2-screens]');
    if (!wrapper) return;
    wrapper.querySelectorAll('.b2-screen').forEach(function (screen) {
      var page = screen.querySelector('.folder-page') || screen;
      ensurePageLayout(page);
    });
  }

  global.GuidedConceptLayout = {
    SECTION_ORDER: SECTION_ORDER,
    ensurePageLayout: ensurePageLayout,
    normalizePanel: normalizePanel,
    getNestedScreenContext: getNestedScreenContext,
    scopedFlowRoot: scopedFlowRoot,
    wireScopedKeyIdeas: wireScopedKeyIdeas,
    wireScopedInPractice: wireScopedInPractice,
    advanceAfterLeafDone: advanceAfterLeafDone,
    navigateNestedScreen: navigateNestedScreen,
    getNestedBackTarget: getNestedBackTarget,
    navigateNestedBack: navigateNestedBack,
    findNextLeafTarget: findNextLeafTarget,
    markItemDone: markItemDone,
    isItemDone: isItemDone
  };
})(typeof window !== 'undefined' ? window : globalThis);
