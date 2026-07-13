(function(global){
  'use strict';

  var PULSE_CLASS = 'flow-guide-pulse';
  var PULSE_EXPAND = 'flow-guide-pulse--expand';
  var PULSE_ACTIVITY = 'flow-guide-pulse--activity';
  var PULSE_IN_PRACTICE = 'flow-guide-pulse--inpractice';
  var BLOCK_INTRO_RING_CLASS = 'flow-guide-block-intro-ring';
  var IN_PRACTICE_RING_CLASS = 'flow-guide-in-practice-ring';
  var EXPAND_RING_CLASS = 'flow-guide-expand-ring';
  var RAIL_RING_CLASS = 'flow-guide-rail-ring';
  var REFLECTION_RING_CLASS = 'flow-guide-reflection-ring';
  var BLOCK_CHECK_RING_CLASS = 'flow-guide-block-check-ring';
  var M5_NAV_RING_CLASS = 'flow-guide-m5-nav-ring';
  var RAIL_ID = 'trainingFlowGuideRail';
  var activePulseEl = null;
  var activePulseEls = [];
  var refreshTimer = null;
  var refreshDueAt = 0;
  var refreshForceAdvance = false;
  var lastStepKey = null;
  var lastScrolledKey = null;
  var userScrollUntil = 0;
  var wiredPanels = new WeakSet();
  var activeModuleConfig = null;

  function $(sel, root){ return (root || document).querySelector(sel); }
  function $$(sel, root){ return Array.from((root || document).querySelectorAll(sel)); }

  function isChecked(input){
    return !!(input && input.checked);
  }

  function isDisabled(input){
    return !!(input && input.disabled);
  }

  function stepKey(step){
    if(!step || !step.el) return '';
    if(step.keyToken) return step.kind + '|' + step.keyToken;
    var el = step.el;
    var token = el.id ||
      el.getAttribute('data-inprac-part') ||
      (el.hasAttribute('data-inprac-cta') ? 'inprac-cta' : '') ||
      (el.hasAttribute('data-finish-concept') ? 'finish' : '') ||
      el.getAttribute('data-target') ||
      el.getAttribute('data-b2-go') ||
      el.getAttribute('data-overview-subtarget') ||
      (el.classList && el.classList.contains('img-expand-btn') ? ('expand:' + (el.getAttribute('data-expand-for') || el.getAttribute('aria-controls') || '')) : '') ||
      step.label ||
      '';
    var panel = el.closest && el.closest('.concept-panel');
    var scope = panel ? ((panel.dataset.currentTarget || '') + ':' + (panel.dataset.m5NestedScreen || '')) : '';
    return step.kind + '|' + scope + '|' + token;
  }

  function sectionScrollStep(kind, el, label, options){
    options = options || {};
    return {
      kind: kind,
      el: el,
      label: label,
      scrollBlock: options.scrollBlock || 'center',
      scrollBlockId: options.scrollBlockId,
      forceScroll: options.forceScroll !== false,
      noScroll: options.noScroll === true,
      tone: options.tone,
      scrollEl: options.scrollEl,
      pulseEls: options.pulseEls,
      keyToken: options.keyToken,
      noPulse: options.noPulse === true
    };
  }

  function isModuleStarted(){
    return document.documentElement.getAttribute('data-flow-module-started') === 'true';
  }

  function getConceptButtons(block){
    var grid = document.querySelector('[data-concept-grid="' + block + '"]');
    if(!grid) return [];
    return $$('.concept-square[data-target]', grid).filter(function(btn){
      return !btn.closest('[data-parent-subconcept-nav]');
    });
  }

  function isConceptDone(btn){
    if(!btn) return true;
    return btn.classList.contains('visited') || btn.classList.contains('stage-completed') || btn.classList.contains('level-completed');
  }

  function isConceptLocked(btn, moduleConfig){
    if(!btn || !btn.classList.contains('is-locked')) return false;
    var target = btn.getAttribute('data-target');
    var locks = (moduleConfig && moduleConfig.conceptLocks) || {};
    var reqs = locks[target];
    if(!reqs || !reqs.length) return true;
    return !reqs.every(function(req){
      var reqBtn = document.querySelector('.concept-square[data-target="' + req + '"]');
      return isConceptDone(reqBtn);
    });
  }

  function getOpenPanel(block){
    if(!block) return document.querySelector('.concept-panel.show');
    var panel = document.querySelector('[data-panel-for="' + block + '"]');
    if(panel && panel.classList.contains('show')) return panel;
    return null;
  }

  function getActiveOpenPanel(){
    return document.querySelector('.concept-panel.show');
  }

  function isVisibleEl(el){
    if(!el || el.closest('[hidden]')) return false;
    if(el.offsetParent !== null) return true;
    var style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  function isMostlyVisible(el, step){
    if(!el || typeof el.getBoundingClientRect !== 'function') return false;
    if(step && step.forceScroll) return false;
    var rect = el.getBoundingClientRect();
    if(rect.width <= 0 || rect.height <= 0) return false;
    var topBound = 76;
    var bottomBound = window.innerHeight - 96;
    var visibleHeight = Math.min(rect.bottom, bottomBound) - Math.max(rect.top, topBound);
    if(visibleHeight <= 0) return false;
    var minVisible = Math.min(96, Math.max(48, rect.height * 0.28));
    return visibleHeight >= minVisible;
  }

  function getConceptGridScrollAnchor(block){
    var section = document.getElementById(block);
    if(!section) return null;
    return section.querySelector('.concept-stage') ||
      section.querySelector('[data-concept-grid="' + block + '"]') ||
      section.querySelector('.block-header') ||
      section.querySelector('.section-top') ||
      section.querySelector('.block-title-wrap') ||
      section;
  }

  function scrollToBlockReflectionView(block){
    var section = document.getElementById(block);
    if(!section) return;
    var conceptStage = section.querySelector('.concept-stage');
    var gate = section.querySelector('[data-gate="' + block + '"]');
    var lockBox = section.querySelector('[data-lock-box="' + block + '"]');
    var bottomEl = (gate && gate.classList.contains('open') && gate) || lockBox || gate;
    if(!conceptStage || !bottomEl){
      if(bottomEl && typeof bottomEl.scrollIntoView === 'function'){
        bottomEl.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
      }
      return;
    }

    lastScrolledKey = null;
    userScrollUntil = Date.now() + 1100;

    function run(){
      var topPad = 80;
      var bottomPad = 88;
      var stageRect = conceptStage.getBoundingClientRect();
      var bottomRect = bottomEl.getBoundingClientRect();
      var viewH = window.innerHeight;
      var stageTopDoc = stageRect.top + window.pageYOffset;
      var bottomDoc = bottomRect.bottom + window.pageYOffset;
      var minScroll = Math.max(0, stageTopDoc - topPad);
      var scrollTop = minScroll;

      if(bottomRect.bottom > viewH - bottomPad){
        scrollTop = minScroll + (bottomRect.bottom - (viewH - bottomPad));
        var stageBottomDoc = stageTopDoc + stageRect.height;
        var maxScroll = Math.max(0, stageBottomDoc - topPad - 48);
        if(scrollTop > maxScroll) scrollTop = maxScroll;
      }

      window.scrollTo({ top: scrollTop, left: 0, behavior: 'smooth' });
      if(document.documentElement) document.documentElement.scrollTop = scrollTop;
      if(document.body) document.body.scrollTop = scrollTop;
    }

    run();
    setTimeout(run, 420);
    setTimeout(run, 880);
  }

  function scrollToConceptGrid(block){
    var anchor = getConceptGridScrollAnchor(block);
    if(!anchor || typeof anchor.scrollIntoView !== 'function') return;
    lastScrolledKey = null;
    userScrollUntil = 0;
    anchor.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    setTimeout(function(){
      lastScrolledKey = null;
      userScrollUntil = 0;
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }, 480);
  }

  function scrollToPageTop(){
    var top = 0;
    window.scrollTo({ top: top, left: 0, behavior: 'auto' });
    if(document.documentElement) document.documentElement.scrollTop = top;
    if(document.body) document.body.scrollTop = top;
    lastScrolledKey = null;
  }

  function scrollIfNeeded(target, step){
    if(step && step.noScroll) return;
    if(Date.now() < userScrollUntil && !(step && step.forceScroll)) return;

    var key = stepKey(step);
    if(key && lastScrolledKey === key && !(step && step.forceScroll)) return;

    if(step && step.scrollBlock === 'reflection-view' && step.scrollBlockId){
      if(!(step.forceScroll) && step.el && isMostlyVisible(step.el, step)) return;
      scrollToBlockReflectionView(step.scrollBlockId);
      lastScrolledKey = key;
      return;
    }

    if(!target || typeof target.scrollIntoView !== 'function') return;

    if(!(step && step.forceScroll) && isMostlyVisible(target, step)) return;

    var block = (step && step.scrollBlock) || 'nearest';
    target.scrollIntoView({ behavior: 'smooth', block: block, inline: 'nearest' });
    lastScrolledKey = key;
  }

  function bumpFlowAdvance(moduleConfig, delay){
    scheduleRefresh(moduleConfig, delay || 160, { forceAdvance: true });
  }

  function scheduleRefresh(moduleConfig, delay, opts){
    opts = opts || {};
    var cfg = moduleConfig || activeModuleConfig;
    if(!cfg) return;
    var ms = typeof delay === 'number' ? delay : 260;
    var due = Date.now() + ms;
    if(opts.forceAdvance) refreshForceAdvance = true;

    // Keep the soonest pending refresh; never let a slow schedule cancel a bump
    if(refreshTimer && due >= refreshDueAt){
      return;
    }
    if(refreshTimer) clearTimeout(refreshTimer);
    refreshDueAt = due;
    var wait = Math.max(0, refreshDueAt - Date.now());
    refreshTimer = setTimeout(function(){
      refreshTimer = null;
      refreshDueAt = 0;
      var force = refreshForceAdvance;
      refreshForceAdvance = false;
      if(force){
        lastStepKey = null;
        lastScrolledKey = null;
        userScrollUntil = 0;
      }
      refresh(cfg);
    }, wait);
  }

  function resetPanelFlowScope(panel){
    if(!panel) return;
    var active = getM5ActiveScreen(panel);
    var m5Scope = active ? (active.getAttribute('data-b2-screen') || 'home') : (panel.dataset.m5NestedScreen || '');
    var scope = (panel.dataset.currentTarget || '') + (m5Scope ? ':' + m5Scope : '');
    if(panel.__flowGuideScope === scope) return;
    panel.__flowGuideScope = scope;
    delete panel.dataset.flowKeyideasFramed;
    delete panel.dataset.flowActivityStarted;
    delete panel.dataset.flowVisualScrollPreKeyideas;
    delete panel.dataset.flowVisualScrollPreActivity;
    delete panel.dataset.flowVisualScrollPostActivity;
  }

  function clearM5FlowTracking(panel){
    if(!panel) return;
    delete panel.dataset.flowM5CatsDone;
    delete panel.dataset.flowM5FoldersDone;
    delete panel.dataset.flowM5LeafReturned;
    delete panel.dataset.flowM5FolderReturned;
    delete panel.dataset.flowM5VisualDone;
    delete panel.dataset.flowM5AccentRgb;
    delete panel.dataset.flowM5Root;
    panel.querySelectorAll('[data-flow-guide-visited]').forEach(function(el){
      el.removeAttribute('data-flow-guide-visited');
    });
  }

  function getM5InteractiveRoot(panel){
    if(panelHasM5NestedNav(panel)) return getM5FlowScope(panel);
    return panel;
  }

  function getVisibleInsightPillars(panel){
    var introSlot = panel && panel.querySelector('.concept-intro-slot');
    if(introSlot && isVisibleEl(introSlot)){
      return introSlot.querySelectorAll('.concept-insight-pillar:not(.clicked)');
    }
    return panel ? panel.querySelectorAll('.concept-insight-pillar:not(.clicked)') : [];
  }

  function hasUnclickedKeyIdeasInScope(panel){
    var root = getM5InteractiveRoot(panel);
    var items = root.querySelectorAll('.key-idea-item:not(.clicked)');
    for(var i = 0; i < items.length; i++){
      if(isVisibleEl(items[i])) return true;
    }
    return false;
  }

  function findScopedInPracticeAction(panel){
    var root = getM5InteractiveRoot(panel);
    var action = root.querySelector('.key-ideas-action:not([hidden])');
    return action && isVisibleEl(action) ? action : null;
  }

  function markM5VisualReviewed(panel){
    if(!panel || !panelHasM5NestedNav(panel)) return;
    markM5ItemDone(panel, 'flowM5VisualDone', getM5ScreenId(panel));
  }

  function getM5ActiveScreen(panel){
    if(!panel) return null;
    var nested = panel.querySelector('[data-b2-screens]');
    if(!nested) return null;
    return nested.querySelector('.b2-screen.active') || nested.querySelector('.b2-screen');
  }

  function getM5FlowScope(panel){
    var active = getM5ActiveScreen(panel);
    return active || panel;
  }

  function panelHasM5NestedNav(panel){
    return !!(panel && panel.querySelector('[data-b2-screens]'));
  }

  function getM5NavAccent(el){
    if(!el || typeof window.getComputedStyle !== 'function') return '214, 120, 28';
    var style = window.getComputedStyle(el);
    var accent = style.getPropertyValue('--b2c2-accent') || style.getPropertyValue('--b2c3-accent') || style.getPropertyValue('--flow-m5-accent');
    if(accent && accent.trim()){
      var hex = accent.trim();
      if(hex.charAt(0) === '#'){
        var h = hex.replace('#', '');
        if(h.length === 3) h = h.split('').map(function(c){ return c + c; }).join('');
        var r = parseInt(h.slice(0, 2), 16);
        var g = parseInt(h.slice(2, 4), 16);
        var b = parseInt(h.slice(4, 6), 16);
        if(!isNaN(r) && !isNaN(g) && !isNaN(b)) return r + ', ' + g + ', ' + b;
      }
    }
    var bg = style.backgroundColor;
    if(bg && bg.indexOf('rgb') === 0){
      var nums = bg.match(/\d+/g);
      if(nums && nums.length >= 3) return nums[0] + ', ' + nums[1] + ', ' + nums[2];
    }
    return '214, 120, 28';
  }

  function removeM5NavRings(){
    document.querySelectorAll('.' + M5_NAV_RING_CLASS).forEach(function(ring){
      ring.remove();
    });
  }

  function hasM5NavRing(el){
    return !!(el && el.querySelector('.' + M5_NAV_RING_CLASS));
  }

  function getM5ScreenId(panel){
    var active = getM5ActiveScreen(panel);
    return active ? (active.getAttribute('data-b2-screen') || 'home') : 'home';
  }

  function getM5FolderRootId(screenId){
    if(!screenId || screenId === 'home') return '';
    if(/^f\d+$/.test(screenId)) return screenId;
    if(/^f\d+-s\d+$/.test(screenId)) return screenId.replace(/-s\d+$/, '');
    if(/^fc\d+$/.test(screenId)) return screenId;
    return screenId;
  }

  function isM5LeafScreen(active){
    if(!active) return false;
    var screenId = active.getAttribute('data-b2-screen') || 'home';
    if(screenId === 'home') return false;
    if(active.querySelector('.b2c2-home-grid, .b2c3-home-grid')) return false;
    return !active.querySelector('.b2pl-cat-grid, .b2pl-folder-grid');
  }

  function isM5FolderOverview(active){
    if(!active) return false;
    var screenId = active.getAttribute('data-b2-screen') || 'home';
    if(screenId === 'home') return false;
    return !!active.querySelector('.b2pl-cat-grid, .b2pl-folder-grid');
  }

  function parseM5DoneList(panel, key){
    return (panel.dataset[key] || '').split(',').filter(Boolean);
  }

  function isM5ItemDone(panel, key, id){
    return parseM5DoneList(panel, key).indexOf(id) >= 0;
  }

  function markM5ItemDone(panel, key, id){
    if(!panel || !id || isM5ItemDone(panel, key, id)) return;
    var list = parseM5DoneList(panel, key);
    list.push(id);
    panel.dataset[key] = list.join(',');
  }

  function getM5NestedWrapper(panel){
    return panel ? panel.querySelector('[data-b2-screens]') : null;
  }

  function getM5CategoryIdsForFolder(wrapper, folderId){
    if(!wrapper || !folderId) return [];
    var folderScreen = wrapper.querySelector('.b2-screen[data-b2-screen="' + folderId + '"]');
    if(!folderScreen) return [];
    return Array.from(folderScreen.querySelectorAll('.b2pl-lvl-btn[data-b2-go]')).map(function(btn){
      return btn.getAttribute('data-b2-go');
    }).filter(Boolean);
  }

  function isM5NestedActivityComplete(panel, screenId){
    if(!panel || !screenId) return false;
    var wrapper = getM5NestedWrapper(panel);
    if(!wrapper) return false;
    var screen = wrapper.querySelector('.b2-screen[data-b2-screen="' + screenId + '"]');
    if(!screen) return false;
    var shell = screen.querySelector('[data-m5-b2-nested-key="' + screenId + '"]');
    return !!(shell && shell.dataset.choiceShellComplete === 'true');
  }

  function isM5CategoryComplete(panel, catId){
    if(!catId) return false;
    return isM5ItemDone(panel, 'flowM5CatsDone', catId);
  }

  function isM5FolderComplete(panel, wrapper, folderId){
    if(!panel || !wrapper || !folderId) return false;
    if(isM5ItemDone(panel, 'flowM5FoldersDone', folderId)) return true;
    var cats = getM5CategoryIdsForFolder(wrapper, folderId);
    if(cats.length){
      return cats.every(function(catId){ return isM5CategoryComplete(panel, catId); });
    }
    return isM5CategoryComplete(panel, folderId);
  }

  function syncM5AccentContext(panel){
    if(!panelHasM5NestedNav(panel)){
      panel.removeAttribute('data-flow-m5-accent-rgb');
      panel.removeAttribute('data-flow-m5-root');
      return;
    }
    var screenId = getM5ScreenId(panel);
    var rootId = getM5FolderRootId(screenId);
    if(!rootId || screenId === 'home'){
      panel.removeAttribute('data-flow-m5-accent-rgb');
      panel.removeAttribute('data-flow-m5-root');
      return;
    }
    panel.dataset.flowM5Root = rootId;
    var wrapper = getM5NestedWrapper(panel);
    var accentEl = wrapper && wrapper.querySelector('.b2c2-folder-tile[data-b2-go="' + rootId + '"], .b2c3-flash-tile[data-b2-go="' + rootId + '"]');
    if(!accentEl && wrapper){
      var folderScreen = wrapper.querySelector('.b2-screen[data-b2-screen="' + rootId + '"]');
      accentEl = folderScreen && (folderScreen.querySelector('.b2pl-folder-h--' + rootId) || folderScreen.querySelector('.b2pl-folder-h, .b2pl-cathead'));
    }
    panel.dataset.flowM5AccentRgb = getM5NavAccent(accentEl);
  }

  function isM5ThemedPanel(panel){
    return !!(panel && panel.dataset.flowM5AccentRgb);
  }

  function withM5Tone(panel, step){
    if(!step || !isM5ThemedPanel(panel)) return step;
    if(isActivityPulseStep(step)) return step;
    if(step.kind === 'expand-visual' || step.tone === 'expand') return step;
    if(step.kind === 'inpractice' || step.tone === 'inpractice') return step;
    if(step.kind === 'pillar' || step.kind === 'keyidea') return step;
    if(step.kind === 'm5-visual-review' || step.kind === 'finish') return step;
    if(step.kind === 'm5-nested-nav' || step.tone === 'm5-nav') return step;
    return step;
  }

  function isActivityPulseStep(step){
    if(!step) return false;
    if(step.tone === 'activity') return true;
    return ['activity-intro', 'activity-progress', 'carousel', 'matching', 'choice-activity', 'categorize', 'sequence', 'sensory'].indexOf(step.kind) >= 0;
  }

  function ensureM5NavRing(el, panel){
    if(!el) return;
    var ring = el.querySelector('.' + M5_NAV_RING_CLASS);
    if(!ring){
      ring = document.createElement('span');
      ring.className = M5_NAV_RING_CLASS;
      ring.setAttribute('aria-hidden', 'true');
      el.appendChild(ring);
    }
    var rgb = (panel && panel.dataset.flowM5AccentRgb) || getM5NavAccent(el);
    ring.style.setProperty('--flow-m5-accent-rgb', rgb);
  }

  function buildM5NavStep(el, label){
    return sectionScrollStep('m5-nested-nav', el, label, {
      scrollEl: el,
      scrollBlock: 'center',
      forceScroll: true,
      tone: 'm5-nav',
      pulseEls: [el]
    });
  }

  function resolveM5NestedNav(panel){
    if(!panelHasM5NestedNav(panel)) return null;
    var wrapper = getM5NestedWrapper(panel);
    var active = getM5ActiveScreen(panel);
    if(!active || !wrapper) return null;

    var screenId = getM5ScreenId(panel);
    if(isM5LeafScreen(active)) return null;

    if(isM5FolderOverview(active)){
      if(getVisibleInsightPillars(panel).length) return null;
      if(!preKeyIdeasVisualsComplete(panel)) return null;
      var folderId = screenId;
      var cats = active.querySelectorAll('.b2pl-lvl-btn[data-b2-go]');
      for(var c = 0; c < cats.length; c++){
        var catId = cats[c].getAttribute('data-b2-go');
        if(!isM5CategoryComplete(panel, catId)){
          return buildM5NavStep(cats[c], 'Explore ' + (cats[c].textContent.replace(/\s+/g, ' ').trim() || 'this category'));
        }
      }
      if(isM5FolderComplete(panel, wrapper, folderId) && !isM5ItemDone(panel, 'flowM5FolderReturned', folderId)){
        var folderBack = active.querySelector('.b2-nav [data-b2-go]');
        if(folderBack){
          return sectionScrollStep('m5-nested-nav', folderBack, 'Return to choose the next folder', {
            scrollEl: folderBack,
            scrollBlock: 'center',
            forceScroll: true,
            tone: 'm5-nav',
            pulseEls: [folderBack]
          });
        }
      }
      return null;
    }

    if(screenId === 'home'){
      if(getVisibleInsightPillars(panel).length) return null;
      if(!preKeyIdeasVisualsComplete(panel)) return null;
      var tiles = active.querySelectorAll('.b2c2-folder-tile[data-b2-go], .b2c3-flash-tile[data-b2-go]');
      for(var t = 0; t < tiles.length; t++){
        var tileId = tiles[t].getAttribute('data-b2-go');
        if(!isM5FolderComplete(panel, wrapper, tileId)){
          var tileLabel = tiles[t].querySelector('.b2c2-folder-label, .b2c3-mini-label');
          return buildM5NavStep(tiles[t], 'Open ' + ((tileLabel && tileLabel.textContent.trim()) || 'this section'));
        }
      }
      return null;
    }

    return null;
  }

  function isM5LeafFlowComplete(panel){
    if(!panel || !panelHasM5NestedNav(panel)) return false;
    var active = getM5ActiveScreen(panel);
    if(!isM5LeafScreen(active)) return false;
    var introSlot = panel.querySelector('.concept-intro-slot');
    if(getVisibleInsightPillars(panel).length) return false;
    if(!preKeyIdeasVisualsComplete(panel)) return false;
    if(hasUnclickedKeyIdeasInScope(panel)) return false;
    if(!inPracticeFlowComplete(panel)) return false;
    if(isActivityIncomplete(panel)) return false;
    return true;
  }

  function conceptReadyForFinishCue(panel){
    if(!panel) return false;
    syncPanelInPracticeDone(panel);
    if(getVisibleInsightPillars(panel).length) return false;
    if(!preKeyIdeasVisualsComplete(panel)) return false;
    if(hasUnclickedKeyIdeasInScope(panel)) return false;
    if(!inPracticeFlowComplete(panel)) return false;
    if(isActivityIncomplete(panel)) return false;
    return true;
  }

  function ensureFinishRing(btn){
    if(!btn) return;
    var ring = btn.querySelector('.' + EXPAND_RING_CLASS);
    if(!ring){
      ring = document.createElement('span');
      ring.className = EXPAND_RING_CLASS + ' flow-guide-finish-ring';
      ring.setAttribute('aria-hidden', 'true');
      btn.appendChild(ring);
    }
    btn.classList.add('flow-guide-pulse--ring-host');
    ring.style.borderRadius = '999px';
  }

  function resolveM5FinishStep(panel){
    if(!panel) return null;
    var finish = panel.querySelector('[data-finish-concept]');
    if(!finish) return null;
    if(!conceptReadyForFinishCue(panel)) return null;

    var finishVisible = isVisibleEl(finish) && finish.style.display !== 'none';
    var host = finishVisible ? finish : (panel.querySelector('.concept-media-actions') || finish);
    if(!host || (!finishVisible && !isVisibleEl(host))) return null;

    var onNestedLeaf = panelHasM5NestedNav(panel) && isM5LeafScreen(getM5ActiveScreen(panel));
    var label = !finishVisible
      ? 'Ready to finish ? Done appears next'
      : (finish.disabled
        ? 'Done will unlock next ? keep it in view'
        : (onNestedLeaf ? 'Tap Done to complete this section' : 'Tap Done to finish this concept'));

    return sectionScrollStep('finish', host, label, {
      scrollEl: host,
      scrollBlock: 'center',
      forceScroll: true,
      tone: 'expand',
      pulseEls: [finishVisible ? finish : host],
      keyToken: (panel.dataset.currentTarget || '') + ':finish'
    });
  }

  function syncM5PanelVisualWiring(panel){
    if(!panel || !global.ConceptVisualExpand || typeof ConceptVisualExpand.wire !== 'function') return;
    var active = getM5ActiveScreen(panel);
    if(!active) return;
    try {
      ConceptVisualExpand.wire(active, {
        panel: panel,
        clearRoot: active,
        syncRoot: active,
        exclude: [
          '.b2c2-home-grid', '.b2c3-home-grid', '.m5-insight-mini-peek',
          '[data-b2c2-no-expand="true"]', '[data-b2c3-no-expand="true"]', '[data-b2-no-expand="true"]'
        ]
      });
    } catch(err){}
  }

  function hasClickedKeyIdea(panel){
    return !!(panel && panel.querySelector('.key-idea-item.clicked'));
  }

  function getKeyIdeasBox(panel){
    if(!panel) return null;
    var scope = getM5FlowScope(panel);
    var box = scope.querySelector('.concept-points-box');
    if(box && box.querySelector('.key-idea-item')) return box;
    box = panel.querySelector('.concept-points-box');
    if(!box || !box.querySelector('.key-idea-item')) return null;
    return box;
  }

  function panelHasExpandableVisual(panel){
    if(!panel) return false;
    var scope = getM5FlowScope(panel);
    return !!scope.querySelector('.img-expand-btn, [data-expandable-visual] img[src], .concept-section-card.section-visual-shell img[src], .concept-image img[src], .m5-nested-visual-shell img[src], .m5-nested-visual-frame img[src]');
  }

  function isNodeBefore(anchor, beforeNode){
    if(!anchor || !beforeNode) return true;
    if(anchor === beforeNode) return false;
    return (anchor.compareDocumentPosition(beforeNode) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  }

  function getPanelExpandButtons(panel){
    if(!panel) return [];
    var scope = getM5FlowScope(panel);
    return Array.from(scope.querySelectorAll('.img-expand-btn')).filter(isVisibleEl);
  }

  function syncPanelVisualWiring(panel){
    if(!panel) return;
    if(panelHasM5NestedNav(panel)){
      syncM5PanelVisualWiring(panel);
      return;
    }
    if(!panel.querySelector('.img-expand-btn') && panelHasExpandableVisual(panel)){
      ensurePanelVisualWired(panel);
    }
  }

  function isPanelVisualExpanded(panel){
    if(!panel) return true;
    syncPanelVisualWiring(panel);
    var buttons = panel.querySelectorAll('.img-expand-btn');
    if(!buttons.length) return !panelHasExpandableVisual(panel);
    for(var i = 0; i < buttons.length; i++){
      if(buttons[i].getAttribute('data-visual-expanded') !== 'true') return false;
    }
    return true;
  }

  function preKeyIdeasVisualsComplete(panel){
    if(getVisibleInsightPillars(panel).length) return false;
    return !resolveNextVisualExpand(panel, { phase: 'preKeyideas' });
  }

  function inPracticeFlowComplete(panel){
    if(!panel) return true;
    syncPanelInPracticeDone(panel);
    var nestedAction = findScopedInPracticeAction(panel);
    if(panel.dataset.inPracticeRequired === 'false' && !nestedAction) return true;
    var inPractice = nestedAction || panel.querySelector('.key-ideas-action');
    if(!inPractice || inPractice.hasAttribute('hidden')) return true;
    var current = panel.dataset.currentTarget || '';
    if(panel.__inPracticeDoneMap && current && panel.__inPracticeDoneMap[current]) return true;
    if(inPractice.classList.contains('is-completed')){
      markPanelInPracticeDone(panel, inPractice);
      return true;
    }
    if(panel.dataset.inPracticeDone === 'true' && panel.dataset.inPracticeDoneFor === current) return true;
    return false;
  }

  function ensurePanelVisualWired(panel){
    if(!panel || wiredPanels.has(panel)) return;
    if(!global.ConceptVisualExpand || typeof ConceptVisualExpand.wire !== 'function') return;
    wiredPanels.add(panel);
    try {
      ConceptVisualExpand.wire(panel, { panel: panel, syncRoot: panel });
    } catch(err){}
  }

  function findVisualExpandBox(btn){
    if(!btn) return null;
    return btn.closest('[data-expandable-visual]') ||
      btn.closest('.concept-activity-box') ||
      btn.closest('.m5-nested-visual-frame') ||
      btn.closest('.b2c2-direct-image') ||
      btn.closest('.b2c3-direct-image') ||
      btn.closest('.entry-exit-fan-item') ||
      btn.closest('.m5-nested-visual-shell') ||
      btn.closest('.m5-screen-visual-card') ||
      btn.closest('.m5-folder-overview-card') ||
      btn.closest('.concept-image') ||
      btn.closest('[data-concept-primary-image]') ||
      btn.closest('[data-concept-intro-media]') ||
      btn.closest('figure') ||
      btn.closest('.concept-section-card.section-visual-shell') ||
      btn.closest('.concept-section-card') ||
      btn.parentElement;
  }

  function resolveLeafVisualPulseTarget(scope){
    if(!scope) return null;
    var fanItem = scope.querySelector('.entry-exit-fan-item:not([data-visual-expanded="true"]) .img-expand-btn');
    if(fanItem) return findVisualExpandBox(fanItem) || fanItem;
    var expandBtn = scope.querySelector('.img-expand-btn[data-visual-expanded="false"], .img-expand-btn:not([data-visual-expanded="true"])');
    if(expandBtn) return findVisualExpandBox(expandBtn) || expandBtn;
    var fan = scope.querySelector('.entry-exit-fan');
    if(fan && !fan.querySelector('.concept-points-box')) return fan;
    var frame = scope.querySelector('.m5-nested-visual-frame:not(:has(.concept-points-box)), .concept-activity-box:has(> img[src]):not(:has(.concept-points-box))');
    if(frame) return frame;
    var shell = scope.querySelector('.m5-nested-visual-shell, .m5-screen-visual-card');
    if(shell && shell.querySelector('.concept-points-box')){
      return shell.querySelector('.entry-exit-fan, .m5-nested-visual-frame, .concept-activity-box:has(> img[src])') || shell;
    }
    return shell;
  }

  function resolveM5VisualPulseHost(visualBox){
    if(!visualBox) return null;
    if(visualBox.classList.contains('m5-folder-overview-card')){
      var frame = visualBox.querySelector('.m5-nested-visual-frame, .entry-exit-fan, .concept-activity-box:has(> img[src])');
      if(frame){
        if(frame.classList.contains('entry-exit-fan')) return frame;
        return frame.closest('.m5-nested-visual-frame') || frame;
      }
    }
    if(visualBox.querySelector && visualBox.querySelector('.concept-points-box')){
      var inner = resolveLeafVisualPulseTarget(visualBox);
      if(inner) return inner;
    }
    if(isM5VisualPulseHost(visualBox)) return visualBox;
    return visualBox;
  }

  function isM5VisualPulseHost(el){
    if(!el || !el.classList) return false;
    return el.classList.contains('m5-nested-visual-shell') ||
      el.classList.contains('m5-screen-visual-card') ||
      el.classList.contains('m5-folder-overview-card') ||
      el.classList.contains('m5-nested-visual-frame') ||
      el.classList.contains('entry-exit-fan');
  }

  function buildExpandVisualStep(btn, options){
    options = options || {};
    var panel = btn && btn.closest && btn.closest('.concept-panel');
    var visualBox = findVisualExpandBox(btn);
    var pulseHost = resolveM5VisualPulseHost(visualBox) || visualBox;
    var imageFrame = null;
    if(pulseHost && pulseHost.querySelector){
      imageFrame = pulseHost.querySelector(
        '.m5-nested-visual-frame:has(> img[src]), .b2c2-direct-image:has(> img[src]), .b2c3-direct-image:has(> img[src]), .entry-exit-fan-item:has(> img[src]), .concept-activity-box:has(> img[src]), [data-expandable-visual]:has(> img[src])'
      );
      if(!imageFrame && pulseHost.matches && pulseHost.matches('.m5-nested-visual-frame, .b2c2-direct-image, .b2c3-direct-image, .concept-activity-box, [data-expandable-visual], .entry-exit-fan, .entry-exit-fan-item')){
        imageFrame = pulseHost;
      }
      // Module 5 block1 shells often wrap the photo in .concept-image > .concept-activity-box
      if(!imageFrame && pulseHost.classList && pulseHost.classList.contains('concept-image')){
        imageFrame = pulseHost.querySelector('.concept-activity-box:has(> img[src]), [data-expandable-visual]') || pulseHost;
      }
    }
    // Cue the photo frame and the expand control together (same idea as pulsing a concept button).
    var pulseEls = [];
    var frameTarget = imageFrame || pulseHost || visualBox;
    if(frameTarget) pulseEls.push(frameTarget);
    if(btn && pulseEls.indexOf(btn) === -1) pulseEls.push(btn);
    if(pulseHost && pulseHost !== frameTarget && isM5VisualPulseHost(pulseHost) && pulseHost.querySelector('.concept-points-box')){
      // Combined shell+points: also cue the outer card so context stays clear
      if(pulseEls.indexOf(pulseHost) === -1) pulseEls.push(pulseHost);
    }
    return {
      kind: 'expand-visual',
      tone: 'expand',
      el: btn || frameTarget || pulseHost,
      pulseEls: pulseEls,
      noScroll: options.noScroll !== false,
      scrollBlock: options.scrollBlock || 'center',
      forceScroll: options.forceScroll === true,
      scrollEl: options.scrollEl || pulseHost || visualBox || btn,
      label: 'Expand the image to view it full size'
    };
  }

  function resolveNextVisualExpand(panel, options){
    options = options || {};
    if(!panel) return null;
    if(getVisibleInsightPillars(panel).length) return null;

    syncPanelVisualWiring(panel);

    var scope = getM5FlowScope(panel);
    var pointsBox = scope.querySelector('.concept-points-box') || panel.querySelector('.concept-points-box');
    var activityRoot = findActivityRoot(panel);
    var buttons = getPanelExpandButtons(panel);
    var scrollFlagByPhase = {
      preKeyideas: 'flowVisualScrollPreKeyideas',
      preActivity: 'flowVisualScrollPreActivity',
      postActivity: 'flowVisualScrollPostActivity'
    };
    var scrollFlag = scrollFlagByPhase[options.phase];
    var scrollThisPhase = scrollFlag && !panel.dataset[scrollFlag];

    for(var i = 0; i < buttons.length; i++){
      var btn = buttons[i];
      if(btn.getAttribute('data-visual-expanded') === 'true') continue;

      var anchor = findVisualExpandBox(btn) || btn;
      var beforeKeyIdeas = !pointsBox || isNodeBefore(anchor, pointsBox);
      var beforeActivity = !activityRoot || isNodeBefore(anchor, activityRoot);

      if(options.phase === 'preKeyideas'){
        if(!beforeKeyIdeas) continue;
      } else if(options.phase === 'preActivity'){
        if(beforeKeyIdeas) continue;
        if(!beforeActivity) continue;
        if(hasUnclickedKeyIdeasInScope(panel)) return null;
        if(!inPracticeFlowComplete(panel)) return null;
      } else if(options.phase === 'postActivity'){
        if(beforeActivity) continue;
        if(hasUnclickedKeyIdeasInScope(panel)) return null;
        if(!inPracticeFlowComplete(panel)) return null;
        if(isActivityIncomplete(panel)) return null;
      } else {
        continue;
      }

      var shouldScroll = scrollThisPhase;
      if(shouldScroll && scrollFlag) panel.dataset[scrollFlag] = 'true';

      return buildExpandVisualStep(btn, {
        noScroll: !shouldScroll,
        forceScroll: shouldScroll,
        scrollEl: anchor
      });
    }

    if(options.phase === 'preKeyideas' && panelHasM5NestedNav(panel)){
      var screenId = getM5ScreenId(panel);
      if(!isM5ItemDone(panel, 'flowM5VisualDone', screenId)){
        var visualHost = resolveLeafVisualPulseTarget(scope) ||
          scope.querySelector('.entry-exit-fan, .m5-nested-visual-shell, .m5-screen-visual-card, .m5-folder-overview-card, .m5-nested-visual-frame, .concept-activity-box');
        if(visualHost && visualHost.querySelector('img[src]') && isVisibleEl(visualHost)){
          var pulseHost = resolveM5VisualPulseHost(visualHost.closest('.concept-section-card') || visualHost) || visualHost;
          var expandBtn = scope.querySelector('.img-expand-btn[data-visual-expanded="false"], .img-expand-btn:not([data-visual-expanded="true"])');
          var shouldScrollFallback = scrollThisPhase;
          if(shouldScrollFallback && scrollFlag) panel.dataset[scrollFlag] = 'true';
          if(expandBtn){
            return buildExpandVisualStep(expandBtn, {
              noScroll: !shouldScrollFallback,
              forceScroll: shouldScrollFallback,
              scrollEl: pulseHost
            });
          }
          return {
            kind: 'm5-visual-review',
            tone: 'expand',
            el: pulseHost,
            pulseEls: [pulseHost],
            noScroll: !shouldScrollFallback,
            scrollBlock: 'center',
            forceScroll: shouldScrollFallback,
            scrollEl: pulseHost,
            label: 'Review the visual image'
          };
        }
      }
    }
    return null;
  }

  function resolveKeyIdeaItems(panel){
    if(!preKeyIdeasVisualsComplete(panel)) return null;

    var root = getM5InteractiveRoot(panel);
    var box = root.querySelector('.concept-points-box');
    var ideas = box ? box.querySelectorAll('.key-idea-item:not(.clicked)') : root.querySelectorAll('.key-idea-item:not(.clicked)');

    for(var i = 0; i < ideas.length; i++){
      if(!isVisibleEl(ideas[i])) continue;
      var idx = ideas[i].querySelector('.key-idea-index');
      return sectionScrollStep('keyidea', ideas[i], 'Review key idea ' + ((idx && idx.textContent.trim()) || (i + 1)), {
        scrollEl: ideas[i],
        scrollBlock: 'center',
        forceScroll: true
      });
    }
    return null;
  }

  function resolveInPractice(panel){
    if(!panel) return null;
    syncPanelInPracticeDone(panel);
    var nestedAction = findScopedInPracticeAction(panel);
    if(panel.dataset.inPracticeRequired === 'false' && !nestedAction) return null;

    var inPractice = nestedAction || panel.querySelector('.key-ideas-action');
    if(!inPractice || inPractice.hasAttribute('hidden')) return null;
    if(inPracticeFlowComplete(panel)) return null;
    if(getVisibleInsightPillars(panel).length) return null;
    if(hasUnclickedKeyIdeasInScope(panel)) return null;
    if(!preKeyIdeasVisualsComplete(panel)) return null;

    var nextPart = null;
    if(global.InPracticeSystem && typeof InPracticeSystem.nextUnreviewedPart === 'function'){
      nextPart = InPracticeSystem.nextUnreviewedPart(inPractice);
    } else {
      var parts = Array.from(inPractice.querySelectorAll('[data-inprac-part]')).filter(function(part){
        return !part.hasAttribute('hidden') && !part.closest('[hidden]') && !part.classList.contains('is-reviewed');
      });
      nextPart = parts[0] || null;
    }

    var scopeKey = (panel.dataset.currentTarget || '') + ':' + (inPractice.dataset.inPracticeTarget || '');
    if(nextPart){
      var partKey = nextPart.getAttribute('data-inprac-part') || '';
      var partLabel = partKey === 'do' ? 'Do'
        : partKey === 'look' ? 'Look for'
        : partKey === 'avoid' ? 'Avoid'
        : 'In Practice cue';
      return sectionScrollStep('inpractice', nextPart, 'Review In Practice: ' + partLabel, {
        scrollEl: inPractice,
        scrollBlock: 'center',
        forceScroll: true,
        tone: 'inpractice',
        pulseEls: [nextPart],
        keyToken: scopeKey + ':part:' + partKey
      });
    }

    var cta = inPractice.querySelector('[data-inprac-cta]');
    return sectionScrollStep('inpractice', cta || inPractice, 'Confirm In Practice with Got it', {
      scrollEl: inPractice,
      scrollBlock: 'center',
      forceScroll: true,
      tone: 'inpractice',
      pulseEls: [cta || inPractice],
      keyToken: scopeKey + ':cta'
    });
  }

  function getFlatConceptActivityShell(panel){
    if(!panel || panelHasM5NestedNav(panel)) return null;
    var target = panel.dataset.currentTarget || '';
    if(target){
      var scoped = panel.querySelector('[data-m5-b2-choice-mount="' + target + '"]');
      if(scoped) return scoped;
    }
    return panel.querySelector('[data-concept-activity-title]');
  }

  function findActivityRoot(panel){
    if(!panel) return null;
    var flatShell = getFlatConceptActivityShell(panel);
    if(flatShell && isVisibleEl(flatShell)) return flatShell;

    var scope = getM5FlowScope(panel);
    var active = getM5ActiveScreen(panel);
    if(active && panelHasM5NestedNav(panel)){
      var screenId = getM5ScreenId(panel);
      if(screenId && screenId !== 'home'){
        var nestedShell = active.querySelector('[data-m5-b2-nested-key="' + screenId + '"]');
        if(nestedShell && isVisibleEl(nestedShell)) return nestedShell;
      }
    }
    var searchRoots = active ? [scope, panel] : [panel];
    var selectors = [
      '.section-activity-shell',
      '.concept-section-card.section-activity',
      '[data-concept-activity-flow]',
      '[data-concept-activity]',
      '.activity-container--concept'
    ];
    for(var r = 0; r < searchRoots.length; r++){
      for(var s = 0; s < selectors.length; s++){
        var hit = searchRoots[r].querySelector(selectors[s]);
        if(hit && isVisibleEl(hit)) return hit;
      }
    }
    var inner = scope.querySelector(
      '[data-carousel], [data-carousel-activity], [data-choice-activity], [data-matching-activity], ' +
      '[data-match-grid], [data-match-board], [data-categorize-activity], [data-sequence-activity], ' +
      '[data-sequence-list], [data-sense-card], [data-reflect-continue], .matching-wrap, .match-game, ' +
      '.concept-activity-interactive[data-activity], [data-m5-b2-choice-mount], [data-m5-b2-nested-key], [data-m5-b3-reflection-mount]'
    );
    if(!inner) inner = panel.querySelector(
      '[data-carousel], [data-carousel-activity], [data-choice-activity], [data-matching-activity], ' +
      '[data-match-grid], [data-match-board], [data-categorize-activity], [data-sequence-activity], ' +
      '[data-sequence-list], [data-sense-card], [data-reflect-continue], .matching-wrap, .match-game, ' +
      '.concept-activity-interactive[data-activity], [data-m5-b2-choice-mount], [data-m5-b2-nested-key], [data-m5-b3-reflection-mount]'
    );
    if(!inner) return null;
    return inner.closest(
      '.section-activity-shell, .concept-section-card.section-activity, [data-concept-activity-flow], ' +
      '[data-concept-activity], .activity-container, .activity-container--concept'
    ) || inner;
  }

  function countRequiredMatches(panel){
    var required = parseInt(panel.dataset.requiredMatches, 10) || parseInt(panel.dataset.matchingPairsCount, 10) || 0;
    if(required) return required;
    var landItems = panel.querySelectorAll('.matching-wrap .match-land .match-item, .match-column.match-land .match-item');
    if(landItems.length) return landItems.length;
    var slots = panel.querySelectorAll('.match-game .match-slot, .concept-activity-interactive .match-slot');
    return slots.length || 0;
  }

  function isMatchingActivityIncomplete(panel){
    if(!panel.querySelector('[data-matching-activity], [data-match-grid], [data-match-board], .matching-wrap, .match-game')) return false;

    // Slot / chip placement games (e.g. Module 4 b1c3): complete only with correct feedback
    var slots = panel.querySelectorAll('.match-game .match-slot, .concept-activity-interactive .match-slot');
    if(slots.length){
      var filled = 0;
      for(var s = 0; s < slots.length; s++){
        if(slots[s].querySelector('.slot-drop .match-chip, .match-chip')) filled++;
      }
      if(filled < slots.length) return true;
      return !panel.querySelector(
        '.concept-activity-interactive .feedback.show.good, ' +
        '.match-game ~ .feedback.show.good, ' +
        '[data-activity-feedback].show.good'
      );
    }

    // Pair-click matching that syncs dataset.matchedCount
    var matchedCount = parseInt(panel.dataset.matchedCount, 10) || 0;
    var requiredMatches = countRequiredMatches(panel);
    if(requiredMatches) return matchedCount < requiredMatches;

    var actBlock = panel.querySelector('.concept-activity-interactive .match-game');
    if(actBlock){
      var act = actBlock.closest('.concept-activity-interactive');
      if(act && !act.querySelector('.feedback.show.good')) return true;
    }
    return false;
  }

  function isM5ChoiceShellIncomplete(panel){
    var active = getM5ActiveScreen(panel);
    if(active){
      var screenId = active.getAttribute('data-b2-screen') || 'home';
      if(screenId === 'home') return false;
      var incompleteInScreen = active.querySelector(
        '[data-concept-activity-title][data-choice-shell-complete="false"], ' +
        '[data-m5-b2-choice-mount][data-choice-shell-complete="false"], ' +
        '[data-m5-b2-nested-key][data-choice-shell-complete="false"]'
      );
      if(incompleteInScreen) return true;
      var nestedKeys = active.querySelectorAll('[data-m5-b2-nested-key]');
      for(var i = 0; i < nestedKeys.length; i++){
        if(nestedKeys[i].dataset.choiceShellComplete !== 'true') return true;
      }
      return false;
    }

    var incompleteShell = panel.querySelector(
      '[data-concept-activity-title][data-choice-shell-complete="false"], ' +
      '[data-m5-b2-choice-mount][data-choice-shell-complete="false"], ' +
      '[data-m5-b2-nested-key][data-choice-shell-complete="false"]'
    );
    if(incompleteShell) return true;
    var nestedKeysAll = panel.querySelectorAll('[data-m5-b2-nested-key]');
    for(var j = 0; j < nestedKeysAll.length; j++){
      if(nestedKeysAll[j].dataset.choiceShellComplete !== 'true') return true;
    }
    var actTitle = panel.querySelector('[data-concept-activity-title]');
    if(actTitle && actTitle.dataset.choiceShellComplete !== 'true') return true;
    var flatMount = getFlatConceptActivityShell(panel);
    if(flatMount && flatMount.dataset.choiceShellComplete !== 'true') return true;
    return false;
  }

  function isInteractiveBlockComplete(block){
    if(!block) return true;
    var scenarioCards = block.querySelectorAll('.scenario-card');
    if(scenarioCards.length){
      for(var i = 0; i < scenarioCards.length; i++){
        if(!scenarioCards[i].querySelector('.feedback.show.good')) return false;
      }
      return true;
    }
    if(block.querySelector('.match-game, [data-categorize-activity], .categorize-pool-items, .option-grid')){
      return !!block.querySelector('.feedback.show.good');
    }
    return true;
  }

  function panelHasGuidedActivity(panel){
    if(!panel || panel.dataset.skipActivityShell === 'true') return false;
    var root = findActivityRoot(panel);
    if(!root || !isVisibleEl(root)) return false;
    return !!root.querySelector(
      '[data-carousel], [data-carousel-activity], [data-choice-activity], [data-matching-activity], ' +
      '[data-match-grid], [data-match-board], [data-categorize-activity], [data-sequence-activity], ' +
      '[data-sequence-list], [data-sense-card], [data-reflect-continue], [data-choice-option], ' +
      '[data-m5-b2-choice-mount], [data-m5-b2-nested-key], [data-m5-b3-reflection-mount], .matching-wrap, .match-game, ' +
      '.concept-activity-interactive[data-activity], .option-grid input, .match-item, .match-chip, ' +
      '[data-b2-bool], [data-b2-bidx], [data-b2-scen], [data-b2-check-sort], [data-b2-check-sata], ' +
      '[data-b2-check-matchd], [data-b2-check-fill], [data-b2-check-ord], [data-b2-seq-idx], ' +
      '[data-b2-only-mark], [data-b2-mark-tri], .tf-toggle, .b2-phrase-picks, .activity-container[data-variant]'
    );
  }

  function isVisibleActivityShellComplete(panel){
    var flatShell = getFlatConceptActivityShell(panel);
    if(flatShell) return flatShell.dataset.choiceShellComplete === 'true';

    var root = findActivityRoot(panel);
    if(!root) return false;
    var shell = root.matches('[data-concept-activity-title], [data-m5-b2-choice-mount], [data-m5-b2-nested-key]')
      ? root
      : root.closest('[data-concept-activity-title], [data-m5-b2-choice-mount], [data-m5-b2-nested-key]');
    return !!(shell && shell.dataset.choiceShellComplete === 'true');
  }

  function isActivityIncomplete(panel){
    if(!panel || !panelHasGuidedActivity(panel)) return false;
    if(panel.dataset.activityComplete === 'true') return false;

    if(isM5ChoiceShellIncomplete(panel)) return true;
    if(isVisibleActivityShellComplete(panel)) return false;

    if(panel.querySelector('[data-carousel], [data-carousel-activity]') && panel.dataset.carouselComplete !== 'true') return true;
    if(panel.querySelector('[data-choice-activity]') && panel.dataset.choiceComplete !== 'true'){
      if(!panel.querySelector('[data-concept-activity-title][data-choice-shell-complete="true"]')) return true;
    }
    if(isMatchingActivityIncomplete(panel)) return true;
    if(panel.querySelector('[data-categorize-activity]') && panel.dataset.categorizeComplete !== 'true'){
      var categorizeRoot = panel.querySelector('[data-categorize-activity]');
      var categorizeBlock = categorizeRoot && categorizeRoot.closest('.concept-activity-interactive[data-activity]');
      if(!categorizeBlock || !categorizeBlock.querySelector('.feedback.show.good')) return true;
    }
    if(panel.querySelector('[data-sequence-activity], [data-sequence-list]') && panel.dataset.sequenceComplete !== 'true') return true;
    if(panel.querySelector('[data-reflect-continue]') && panel.dataset.reflectAckComplete !== 'true') return true;
    if(panel.querySelector('[data-sense-card]:not(.flipped)')) return true;

    var interactives = panel.querySelectorAll('.concept-activity-interactive[data-activity]');
    for(var i = 0; i < interactives.length; i++){
      if(!isInteractiveBlockComplete(interactives[i])) return true;
    }

    var root = findActivityRoot(panel);
    if(root && root.querySelector('.option-grid input[type="radio"], .option-grid input[type="checkbox"]')){
      var shellFeedback = root.querySelector('.feedback.show.good, [data-activity-feedback].show.good, [data-activity-feedback].is-correct');
      if(!shellFeedback && !panel.querySelector('.concept-activity-interactive[data-activity] .feedback.show.good')) return true;
    }

    return false;
  }

  function resolvePanelActivity(panel){
    if(!panel || !isActivityIncomplete(panel)) return null;

    var root = findActivityRoot(panel);
    if(!root) return null;

    var hasWrong = !!panel.querySelector(
      '.concept-activity-interactive .feedback.show.warn, ' +
      '[data-activity-feedback].show.warn, ' +
      '.feedback.show.warn'
    );
    var label = hasWrong
      ? 'Try again - fix the matches'
      : (panel.dataset.flowActivityStarted === 'true'
        ? 'Complete the activity'
        : 'Complete the activity below');

    return sectionScrollStep(
      panel.dataset.flowActivityStarted === 'true' || hasWrong ? 'activity-progress' : 'activity-intro',
      root,
      label,
      {
        tone: 'activity',
        scrollBlock: 'center',
        forceScroll: true,
        keyToken: (panel.dataset.currentTarget || '') + (hasWrong ? ':activity-retry' : ':activity')
      }
    );
  }

  function getSubconceptNav(panel){
    if(!panel) return null;
    var nav = panel.querySelector('[data-parent-subconcept-nav]:not([hidden])');
    if(nav && nav.querySelector('.concept-square[data-target], .overview-subconcept-btn')) return nav;
    var shell = panel.querySelector('.overview-subconcept-shell:not([hidden])');
    if(shell) return shell.querySelector('.overview-subconcept-grid') || shell;
    return panel.querySelector('.overview-subconcept-grid');
  }

  function getNavTarget(btn){
    return btn.getAttribute('data-target') || btn.getAttribute('data-overview-subtarget') || '';
  }

  function resolveSubconceptNav(panel){
    if(!panel || !panel.classList.contains('show')) return null;
    var nav = getSubconceptNav(panel);
    if(!nav) return null;

    var navButtons = $$('.concept-square[data-target], .overview-subconcept-btn[data-overview-subtarget], .overview-subconcept-btn', nav);
    if(!navButtons.length) return null;

    var unvisited = navButtons.filter(function(btn){ return !isConceptDone(btn); });
    if(!unvisited.length) return null;

    var current = panel.dataset.currentTarget || '';
    var isLeafTarget = navButtons.some(function(btn){ return getNavTarget(btn) === current; });

    if(isLeafTarget){
      var hasIncomplete = getVisibleInsightPillars(panel).length || hasUnclickedKeyIdeasInScope(panel);
      var finish = panel.querySelector('[data-finish-concept]');
      if(hasIncomplete || (finish && finish.disabled) || isActivityIncomplete(panel)) return null;
      return null;
    }

    var panelBlock = panel.getAttribute('data-panel-for');
    if(panelBlock && blockConceptsComplete(panelBlock)) return null;

    return {
      kind: 'subconcept',
      el: unvisited[0],
      label: 'Choose the next subconcept'
    };
  }

  function resolveParentSubconceptResume(panel, moduleConfig){
    var panelBlock = panel && panel.getAttribute('data-panel-for');
    if(panelBlock && blockConceptsComplete(panelBlock)) return null;

    var nav = getSubconceptNav(panel);
    if(!nav) return null;

    var navButtons = $$('.concept-square[data-target], .overview-subconcept-btn[data-overview-subtarget], .overview-subconcept-btn', nav);
    if(!navButtons.length) return null;

    var hasPartialProgress = navButtons.some(function(btn){
      return isConceptDone(btn) || btn.classList.contains('is-next');
    });
    if(!hasPartialProgress) return null;

    var unvisited = navButtons.filter(function(btn){
      return !isConceptDone(btn) && !isConceptLocked(btn, moduleConfig);
    });
    if(!unvisited.length) return null;

    var current = panel.dataset.currentTarget || '';
    if(navButtons.some(function(btn){ return getNavTarget(btn) === current; })) return null;

    var btn = null;
    for(var i = 0; i < navButtons.length; i++){
      if(navButtons[i].classList.contains('is-next') && !isConceptDone(navButtons[i]) && !isConceptLocked(navButtons[i], moduleConfig)){
        btn = navButtons[i];
        break;
      }
    }
    if(!btn) btn = unvisited[0];

    var label = btn.textContent.replace(/\s+/g, ' ').trim() || 'Choose the next subconcept';
    return sectionScrollStep('subconcept', btn, label, {
      scrollEl: btn.closest('.overview-subconcept-grid') || btn,
      scrollBlock: 'center',
      forceScroll: true,
      tone: 'expand'
    });
  }

  function nextConceptInBlock(block, moduleConfig){
    var buttons = getConceptButtons(block);
    for(var i = 0; i < buttons.length; i++){
      var btn = buttons[i];
      if(isConceptDone(btn)) continue;
      if(isConceptLocked(btn, moduleConfig)) continue;
      var label = btn.textContent.replace(/\s+/g, ' ').trim();
      var gridFrame = getConceptGridScrollAnchor(block);
      return sectionScrollStep('concept', btn, label || 'Open next concept', {
        scrollEl: gridFrame || btn,
        scrollBlock: 'start',
        forceScroll: true
      });
    }
    return null;
  }

  function resolveConceptPick(block, moduleConfig){
    if(getOpenPanel(block)) return null;
    return nextConceptInBlock(block, moduleConfig);
  }

  function panelIncompleteTarget(panel){
    if(!panel) return null;

    syncM5AccentContext(panel);

    var panelBlock = panel.getAttribute('data-panel-for');
    if(panelBlock && blockConceptsComplete(panelBlock)) return null;

    var parentSubconceptStep = resolveParentSubconceptResume(panel, activeModuleConfig);
    if(parentSubconceptStep) return withM5Tone(panel, parentSubconceptStep);

    var introSlot = panel.querySelector('.concept-intro-slot');
    var pillars = introSlot && isVisibleEl(introSlot)
      ? introSlot.querySelectorAll('.concept-insight-pillar:not(.clicked)')
      : panel.querySelectorAll('.concept-insight-pillar:not(.clicked)');
    if(pillars.length){
      var title = pillars[0].querySelector('.concept-insight-pillar__title');
      return withM5Tone(panel, sectionScrollStep('pillar', pillars[0], 'Read intro card: ' + ((title && title.textContent.trim()) || 'next point'), {
        scrollEl: pillars[0],
        scrollBlock: 'center',
        forceScroll: true
      }));
    }

    var preVisualStep = resolveNextVisualExpand(panel, { phase: 'preKeyideas' });
    if(preVisualStep) return withM5Tone(panel, preVisualStep);

    var m5NavStep = resolveM5NestedNav(panel);
    if(m5NavStep) return m5NavStep;

    var keyIdeaStep = resolveKeyIdeaItems(panel);
    if(keyIdeaStep) return withM5Tone(panel, keyIdeaStep);

    var inPracticeStep = resolveInPractice(panel);
    if(inPracticeStep) return withM5Tone(panel, inPracticeStep);

    var preActivityVisualStep = resolveNextVisualExpand(panel, { phase: 'preActivity' });
    if(preActivityVisualStep) return withM5Tone(panel, preActivityVisualStep);

    var activityStep = resolvePanelActivity(panel);
    if(activityStep) return activityStep;

    var postActivityVisualStep = resolveNextVisualExpand(panel, { phase: 'postActivity' });
    if(postActivityVisualStep) return withM5Tone(panel, postActivityVisualStep);

    var subconceptStep = resolveSubconceptNav(panel);
    if(subconceptStep){
      var btn = subconceptStep.el;
      var label = btn && btn.textContent ? btn.textContent.replace(/\s+/g, ' ').trim() : subconceptStep.label;
      return sectionScrollStep('subconcept', btn, label || subconceptStep.label, {
        scrollEl: btn.closest('.overview-subconcept-grid') || btn,
        scrollBlock: 'center',
        forceScroll: true,
        tone: 'expand'
      });
    }

    var finishStep = resolveM5FinishStep(panel);
    if(finishStep) return finishStep;
    return null;
  }

  function reflectionDone(block){
    var check = document.querySelector('input[data-check-for="' + block + '"], input[data-stage-check="' + block + '"]');
    return isChecked(check);
  }

  function reflectionReady(block){
    var lockBox = document.querySelector('[data-lock-box="' + block + '"]');
    return !!(lockBox && lockBox.classList.contains('ready'));
  }

  function getBlockConceptProgress(block){
    var section = document.getElementById(block);
    if(!section) return null;
    var mini = section.querySelector('[data-mini-text="' + block + '"]');
    if(!mini) return null;
    var match = (mini.textContent || '').match(/(\d+)\s+of\s+(\d+)/);
    if(!match) return null;
    return {
      done: parseInt(match[1], 10) || 0,
      total: parseInt(match[2], 10) || 0
    };
  }

  function blockConceptsComplete(block){
    var progress = getBlockConceptProgress(block);
    if(progress && progress.total > 0) return progress.done >= progress.total;
    var buttons = getConceptButtons(block);
    if(!buttons.length) return true;
    return buttons.every(isConceptDone);
  }

  function isReflectionPhase(block){
    return blockConceptsComplete(block) && reflectionReady(block);
  }

  function reflectionQuestionPassed(block){
    var gate = document.querySelector('[data-gate="' + block + '"]');
    if(!gate) return false;
    if(gate.querySelector('.feedback.show.good')) return true;
    return !!gate.querySelector('input[type="radio"][value="correct"]:checked');
  }

  function getBlockDisplayName(block){
    var section = document.getElementById(block);
    if(!section) return block;
    var title = section.querySelector('.block-part-title, .block-title-wrap h3, .block-header h3, h3');
    if(title && title.textContent.trim()) return title.textContent.trim();
    return block.replace('block', 'Block ');
  }

  function resolveReflectionCheckpoint(block){
    if(!blockConceptsComplete(block)) return null;

    var gate = document.querySelector('[data-gate="' + block + '"]');
    var blockCheck = document.querySelector('input[data-check-for="' + block + '"], input[data-stage-check="' + block + '"]');
    if(blockCheck && isChecked(blockCheck)) return null;

    if(!gate || !gate.classList.contains('open')){
      var lockBox = document.querySelector('[data-lock-box="' + block + '"]');
      if(lockBox){
        return sectionScrollStep('block-progress', lockBox, 'Complete the reflection checkpoint', {
          scrollEl: lockBox,
          scrollBlock: 'reflection-view',
          scrollBlockId: block,
          forceScroll: true,
          tone: 'primary'
        });
      }
      return null;
    }

    if(reflectionQuestionPassed(block) && blockCheck && !isChecked(blockCheck)){
      var checkItem = blockCheck.closest('.check-item') || blockCheck;
      return sectionScrollStep('block-check', checkItem, 'Mark ' + getBlockDisplayName(block) + ' complete', {
        scrollEl: checkItem,
        scrollBlock: 'reflection-view',
        scrollBlockId: block,
        forceScroll: true,
        tone: 'primary',
        pulseEls: [checkItem]
      });
    }

    if(!reflectionQuestionPassed(block)){
      var options = gate.querySelectorAll('.option');
      var firstOption = null;
      for(var o = 0; o < options.length; o++){
        if(!options[o].querySelector('input:checked')){
          firstOption = options[o];
          break;
        }
      }
      if(!firstOption && options.length) firstOption = options[0];
      var pulseTargets = [gate];
      if(firstOption) pulseTargets.push(firstOption);
      return sectionScrollStep('reflection', firstOption || gate, 'Answer the reflection checkpoint', {
        scrollEl: gate,
        scrollBlock: 'reflection-view',
        scrollBlockId: block,
        forceScroll: true,
        pulseEls: pulseTargets,
        tone: 'reflection'
      });
    }

    return null;
  }

  function isBlockSectionLocked(block){
    var section = document.getElementById(block);
    return !!(section && section.classList.contains('gated-locked'));
  }

  function resolveConceptGrid(block, moduleConfig){
    return resolveConceptPick(block, moduleConfig);
  }

  function journeyContentReviewed(){
    var section = $('#journey');
    if(!section) return true;
    if(section.getAttribute('data-flow-reviewed') === 'true') return true;
    var wrap = section.querySelector('.journey-wrap');
    return !!(wrap && wrap.getAttribute('data-flow-reviewed') === 'true');
  }

  function insideModuleReviewed(){
    var section = $('#inside-module');
    if(!section) return true;
    return section.getAttribute('data-flow-reviewed') === 'true';
  }

  function bindModuleStart(){
    var btn = document.querySelector('.hero-actions .btn-primary[data-scroll], #overview .btn-primary[data-scroll], [data-scroll="#journey"]');
    if(!btn || btn.getAttribute('data-flow-start-bound') === '1') return;
    btn.setAttribute('data-flow-start-bound', '1');
    btn.addEventListener('click', function(){
      document.documentElement.setAttribute('data-flow-module-started', 'true');
      if(activeModuleConfig) scheduleRefresh(activeModuleConfig);
    });
  }

  function bindSectionReview(section, options){
    options = options || {};
    if(!section || section.getAttribute('data-flow-bound') === '1') return;
    section.setAttribute('data-flow-bound', '1');
    var wrap = section.querySelector('.journey-wrap, .module-roadmap-wrap') || section;

    function markReviewed(){
      section.setAttribute('data-flow-reviewed', 'true');
      if(wrap !== section) wrap.setAttribute('data-flow-reviewed', 'true');
      if(activeModuleConfig) scheduleRefresh(activeModuleConfig);
    }

    wrap.addEventListener('click', function(e){
      if(e.target.closest('.check-item, .overall-check')) return;
      if(options.itemSelector){
        var item = e.target.closest(options.itemSelector);
        if(item){
          item.setAttribute('data-flow-reviewed', 'true');
          item.classList.add('clicked');
          var items = section.querySelectorAll(options.itemSelector);
          var allDone = true;
          for(var i = 0; i < items.length; i++){
            if(items[i].getAttribute('data-flow-reviewed') !== 'true') allDone = false;
          }
          if(allDone) markReviewed();
          else if(activeModuleConfig) scheduleRefresh(activeModuleConfig);
          return;
        }
      }
      if(!options.itemSelector) markReviewed();
    });

    if(!options.disableAutoReview && typeof IntersectionObserver !== 'undefined'){
      var seenAt = 0;
      var observer = new IntersectionObserver(function(entries){
        if(!isModuleStarted()) return;
        entries.forEach(function(entry){
          if(entry.isIntersecting && entry.intersectionRatio >= 0.35){
            if(!seenAt) seenAt = Date.now();
            if(Date.now() - seenAt >= 1200) markReviewed();
          } else if(!entry.isIntersecting){
            seenAt = 0;
          }
        });
      }, { threshold: [0.2, 0.35, 0.5] });
      observer.observe(section);
    }
  }

  function bindJourneyReview(){
    bindSectionReview($('#journey'), { disableAutoReview: true });
  }

  function ensureInsideModuleReviewed(){
    var section = $('#inside-module');
    if(!section || section.getAttribute('data-flow-reviewed') === 'true') return;
    section.setAttribute('data-flow-reviewed', 'true');
    var wrap = section.querySelector('.module-roadmap-wrap, .journey-wrap');
    if(wrap) wrap.setAttribute('data-flow-reviewed', 'true');
  }

  function bindInsideModuleReview(){
    var section = $('#inside-module');
    if(!section) return;
    bindSectionReview(section, { disableAutoReview: true });

    section.addEventListener('click', function(e){
      if(document.documentElement.getAttribute('data-guided-flow') !== 'true') return;
      if(e.target.closest('.check-item, .overall-check')) return;
      var link = e.target.closest('.module-roadmap__item, a.module-roadmap__item');
      if(link) e.preventDefault();
      ensureInsideModuleReviewed();
      if(activeModuleConfig) scheduleRefresh(activeModuleConfig, 80);
    }, true);
  }

  function syncBlockIntroVisualState(){
    if(document.documentElement.getAttribute('data-guided-flow') !== 'true') return;
    document.querySelectorAll('.block-intro-card').forEach(function(card){
      var done = card.getAttribute('data-flow-block-intro-done') === 'true';
      if(done){
        card.classList.add('clicked');
      } else {
        card.classList.remove('clicked');
        card.classList.add('clickable-progress');
      }
    });
  }

  function neutralizeModuleBlockIntroHandlers(){
    if(document.documentElement.getAttribute('data-guided-flow') !== 'true') return;
    document.querySelectorAll('.block-intro-cards').forEach(function(wrap){
      if(wrap.getAttribute('data-flow-intro-neutralized') === 'true') return;
      var parent = wrap.parentNode;
      if(!parent) return;
      var clone = wrap.cloneNode(true);
      clone.setAttribute('data-flow-intro-neutralized', 'true');
      parent.replaceChild(clone, wrap);
    });
  }

  function markPanelInPracticeDone(panel, action){
    if(!panel) return;
    if(action) action.classList.add('is-completed');
    panel.dataset.inPracticeDone = 'true';
    var doneFor = (action && action.dataset.inPracticeTarget) || panel.dataset.currentTarget || '';
    if(doneFor){
      panel.dataset.inPracticeDoneFor = doneFor;
      if(!panel.__inPracticeDoneMap) panel.__inPracticeDoneMap = {};
      panel.__inPracticeDoneMap[doneFor] = true;
    }
    try {
      panel.setAttribute('data-in-practice-done', 'true');
    } catch (err) {}
  }

  function syncPanelInPracticeDone(panel){
    if(!panel) return false;
    if(panel.dataset.inPracticeRequired !== 'true') return true;
    var current = panel.dataset.currentTarget || '';
    if(panel.__inPracticeDoneMap && current && panel.__inPracticeDoneMap[current]){
      panel.dataset.inPracticeDone = 'true';
      panel.dataset.inPracticeDoneFor = current;
      return true;
    }
    if(panel.dataset.inPracticeDone === 'true'){
      if(panel.dataset.inPracticeDoneFor === current) return true;
      panel.dataset.inPracticeDone = 'false';
      delete panel.dataset.inPracticeDoneFor;
    }
    var root = getM5InteractiveRoot(panel);
    var action = (root && root.querySelector('.key-ideas-action:not([hidden])')) ||
      panel.querySelector('.key-ideas-action:not([hidden])');
    if(action && action.classList.contains('is-completed')){
      var actionTarget = action.dataset.inPracticeTarget || '';
      if(!actionTarget || actionTarget === current){
        markPanelInPracticeDone(panel, action);
        return true;
      }
      action.classList.remove('is-completed');
      action.querySelectorAll('[data-inprac-part].is-reviewed').forEach(function(part){
        part.classList.remove('is-reviewed');
        part.setAttribute('aria-pressed', 'false');
      });
    }
    return false;
  }

  function bindInPracticeReview(moduleConfig){
    document.addEventListener('in-practice-progress', function(e){
      if(document.documentElement.getAttribute('data-guided-flow') !== 'true') return;
      var action = e.target && e.target.closest ? e.target.closest('.key-ideas-action') : null;
      if(!action) action = e.target;
      if(!action || !action.classList || !action.classList.contains('key-ideas-action')) return;
      if(!action.closest('.concept-panel')) return;
      bumpFlowAdvance(moduleConfig, 90);
    }, true);

    document.addEventListener('in-practice-complete', function(e){
      var action = e.target && e.target.closest ? e.target.closest('.key-ideas-action') : null;
      if(!action) action = e.target;
      if(!action || !action.classList || !action.classList.contains('key-ideas-action')) return;
      var panel = action.closest('.concept-panel');
      if(!panel) return;
      if(panel.dataset.inPracticeRequired === 'false' && !findScopedInPracticeAction(panel)) return;
      markPanelInPracticeDone(panel, action);
      var icon = action.querySelector('.inprac__icon, .icon');
      if(icon){
        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
      }
      if(document.documentElement.getAttribute('data-guided-flow') === 'true'){
        bumpFlowAdvance(moduleConfig, 120);
      }
    }, true);
  }

  function bindBlockIntroReview(moduleConfig){
    document.addEventListener('click', function(e){
      var card = e.target.closest && e.target.closest('.block-intro-card');
      if(!card || card.getAttribute('data-flow-block-intro-done') === 'true') return;
      if(document.documentElement.getAttribute('data-guided-flow') !== 'true') return;
      e.preventDefault();
      e.stopPropagation();
      card.setAttribute('data-flow-block-intro-done', 'true');
      card.classList.add('clicked');
      syncBlockIntroVisualState();
      bumpFlowAdvance(moduleConfig, 120);
    }, true);

    document.addEventListener('keydown', function(e){
      if(e.key !== 'Enter' && e.key !== ' ') return;
      var card = e.target.closest && e.target.closest('.block-intro-card');
      if(!card || card.getAttribute('data-flow-block-intro-done') === 'true') return;
      if(document.documentElement.getAttribute('data-guided-flow') !== 'true') return;
      e.preventDefault();
      e.stopPropagation();
      card.setAttribute('data-flow-block-intro-done', 'true');
      card.classList.add('clicked');
      syncBlockIntroVisualState();
      bumpFlowAdvance(moduleConfig, 120);
    }, true);
  }

  function resetBlockIntroForGuidedFlow(){
    if(document.documentElement.getAttribute('data-guided-flow') !== 'true') return;
    try {
      Object.keys(localStorage).forEach(function(key){
        if(key.indexOf('blockIntro_') === 0) localStorage.removeItem(key);
      });
    } catch(err){}
    document.querySelectorAll('.block-intro-card').forEach(function(card){
      card.classList.remove('clicked');
      card.classList.add('clickable-progress');
      card.removeAttribute('data-flow-block-intro-done');
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
    });
  }

  function resolveStartModule(){
    if(isModuleStarted()) return null;
    var btn = document.querySelector('.hero-actions .btn-primary[data-scroll], #overview .btn-primary[data-scroll], [data-scroll="#journey"]');
    var heroTitle = $('#overview .hero-title-line') || $('#overview h2') || $('#overview') || $('.hero--module-system');
    return {
      kind: 'start-module',
      el: btn || heroTitle,
      scrollEl: heroTitle,
      scrollBlock: 'start',
      forceScroll: true,
      label: 'Start the module'
    };
  }

  function resolveJourney(){
    if(!isModuleStarted()) return null;

    var section = $('#journey');
    var check = $('input[data-stage-check="journey"]');
    if(isChecked(check)) return null;

    if(!journeyContentReviewed()){
      var content = (section && section.querySelector('.journey-wrap')) || (section && section.querySelector('.journey-panel')) || section;
      return sectionScrollStep('journey-read', content, 'Review the pathway overview');
    }

    if(isDisabled(check)){
      var journeyWrap = section && section.querySelector('.journey-wrap') || section;
      return sectionScrollStep('journey-wait', journeyWrap, 'Spend a moment reviewing the journey section');
    }

    var labelEl = check && check.closest('.check-item');
    return {
      kind: 'journey-check',
      el: labelEl || check,
      label: 'Confirm you understand where this module sits in the pathway'
    };
  }

  function resolveOutcomes(){
    if(!isModuleStarted()) return null;
    if(!isChecked($('input[data-stage-check="journey"]'))) return null;

    var section = $('#outcomes');
    var items = $$('[data-outcomes-group="outcomes"] .outcome, #outcomes .outcome');
    for(var i = 0; i < items.length; i++){
      if(!items[i].classList.contains('clicked')){
        var scrollSection = i === 0;
        return sectionScrollStep('outcome', items[i], 'Review learning outcome ' + (i + 1), {
          noScroll: !scrollSection,
          scrollEl: scrollSection ? (section || items[i]) : undefined,
          scrollBlock: 'center',
          forceScroll: scrollSection,
          tone: 'expand'
        });
      }
    }
    var check = $('input[data-stage-check="outcomes"]');
    if(check && !isChecked(check)){
      if(isDisabled(check)){
        return sectionScrollStep('outcomes-wait', section || check, 'Review all learning outcomes first');
      }
      return sectionScrollStep('outcomes-check', check.closest('.check-item') || check, 'Confirm learning outcomes reviewed', { noScroll: true });
    }
    return null;
  }

  function resolveInsideModule(){
    if(!isModuleStarted()) return null;
    if(!isChecked($('input[data-stage-check="journey"]'))) return null;
    if(!isChecked($('input[data-stage-check="outcomes"]'))) return null;

    var section = $('#inside-module');
    if(!section) return null;
    if(section.getAttribute('data-flow-reviewed') === 'true') return null;

    var content = section.querySelector('.module-roadmap-wrap') || section.querySelector('.journey-wrap') || section;
    return sectionScrollStep('inside-module', content, 'Review the blocks in this module');
  }

  function blockIntroCardsComplete(block){
    var section = document.getElementById(block);
    if(!section) return true;
    var wrap = section.querySelector('.block-intro-cards[data-block-intro="' + block + '"]');
    if(!wrap) return true;
    var cards = wrap.querySelectorAll('.block-intro-card');
    if(!cards.length) return true;
    for(var i = 0; i < cards.length; i++){
      if(!isBlockIntroCardDone(cards[i])) return false;
    }
    return true;
  }

  function resolveBlockIntroSlideExpand(block){
    if(!blockIntroCardsComplete(block)) return null;

    var section = document.getElementById(block);
    if(!section) return null;

    var slide = section.querySelector('.block-intro-slide[data-block-intro-slide="' + block + '"]') ||
      section.querySelector('.block-intro-slide');
    if(!slide || !slide.querySelector('img[src]')) return null;

    if(!slide.querySelector('.img-expand-btn') && global.ConceptVisualExpand){
      try { ConceptVisualExpand.wire(slide); } catch(err){}
    }

    var btn = slide.querySelector('.img-expand-btn:not([data-visual-expanded="true"])');
    if(!btn || !isVisibleEl(btn)) return null;

    return buildExpandVisualStep(btn, {
      noScroll: false,
      forceScroll: true,
      scrollEl: slide.querySelector('.concept-image') || slide
    });
  }

  function isBlockIntroCardDone(card){
    if(!card) return true;
    return card.getAttribute('data-flow-block-intro-done') === 'true';
  }

  function resolveBlockIntroCards(block){
    var section = document.getElementById(block);
    if(!section) return null;
    var wrap = section.querySelector('.block-intro-cards[data-block-intro="' + block + '"]');
    if(!wrap) return null;

    var cards = wrap.querySelectorAll('.block-intro-card');
    for(var i = 0; i < cards.length; i++){
      if(!isBlockIntroCardDone(cards[i])){
        cards[i].classList.remove('clicked');
        var title = cards[i].querySelector('h4');
        return sectionScrollStep('block-intro', cards[i], 'Read: ' + ((title && title.textContent.trim()) || 'Block intro card'), {
          scrollEl: cards[i],
          scrollBlock: 'center',
          forceScroll: true,
          tone: 'expand'
        });
      }
    }
    return null;
  }

  function resolvePanelHoldStep(panel){
    if(!panel || !panel.classList.contains('show')) return null;
    syncPanelInPracticeDone(panel);
    var target = panel.dataset.currentTarget || '';

    if(!inPracticeFlowComplete(panel)){
      var action = findScopedInPracticeAction(panel) || panel.querySelector('.key-ideas-action:not([hidden])');
      if(action){
        return sectionScrollStep('inpractice-hold', action, 'Continue In Practice', {
          scrollEl: action,
          scrollBlock: 'center',
          forceScroll: true,
          tone: 'inpractice',
          pulseEls: [action],
          keyToken: target + ':inpractice-hold'
        });
      }
    }

    if(isActivityIncomplete(panel)){
      var root = findActivityRoot(panel);
      if(root){
        var wrong = !!panel.querySelector('.feedback.show.warn, [data-activity-feedback].show.warn');
        return sectionScrollStep('activity-hold', root, wrong ? 'Try again - fix the matches' : 'Complete the activity', {
          scrollEl: root,
          scrollBlock: 'center',
          forceScroll: true,
          tone: 'activity',
          pulseEls: [root],
          keyToken: target + (wrong ? ':activity-retry-hold' : ':activity-hold')
        });
      }
    }

    var finish = panel.querySelector('[data-finish-concept]');
    if(finish){
      var finishVisible = isVisibleEl(finish) && finish.style.display !== 'none';
      var host = finishVisible ? finish : (panel.querySelector('.concept-media-actions') || panel);
      return sectionScrollStep('finish-hold', host, finish.disabled ? 'Done unlocks next ? keep going' : 'Tap Done to finish this concept', {
        scrollEl: host,
        scrollBlock: 'center',
        forceScroll: true,
        tone: 'expand',
        pulseEls: [finishVisible ? finish : host],
        keyToken: target + ':finish-hold'
      });
    }

    return sectionScrollStep('panel-hold', panel, 'Continue this concept', {
      scrollEl: panel,
      scrollBlock: 'start',
      forceScroll: false,
      keyToken: target + ':panel-hold'
    });
  }

  function isBlockFullyComplete(block){
    // Stage checkbox checked = COMPLETE badge. Never pulse "Open" on finished blocks.
    return reflectionDone(block);
  }

  function resolveBlock(block, moduleConfig){
    if(!isModuleStarted()) return null;
    if(!isChecked($('input[data-stage-check="journey"]'))) return null;
    if(!isChecked($('input[data-stage-check="outcomes"]'))) return null;
    if(!insideModuleReviewed()) return null;

    // Finished blocks are done ? advance to the next incomplete block instead
    if(isBlockFullyComplete(block)) return null;

    // Keep accordion collapsed until the learner opens it (or completes previous and auto-advances)
    if(global.ModuleBlockAccordion){
      var openKey = typeof global.ModuleBlockAccordion.getOpen === 'function'
        ? global.ModuleBlockAccordion.getOpen()
        : null;
      if(openKey !== block){
        var head = document.querySelector('#' + block + ' .block-part-head');
        if(head){
          return sectionScrollStep('block-open', head, 'Open ' + getBlockDisplayName(block), {
            scrollEl: document.getElementById(block) || head,
            scrollBlock: 'start',
            forceScroll: true,
            tone: 'primary',
            scrollBlockId: block
          });
        }
        if(typeof global.ModuleBlockAccordion.ensureOpen === 'function'){
          try{ global.ModuleBlockAccordion.ensureOpen(block); }catch(err){}
        }
      }
    }

    var introStep = resolveBlockIntroCards(block);
    if(introStep) return introStep;

    var slideExpandStep = resolveBlockIntroSlideExpand(block);
    if(slideExpandStep) return slideExpandStep;

    var openPanel = getOpenPanel(block);
    if(openPanel){
      var inside = panelIncompleteTarget(openPanel);
      if(inside) return inside;
      // Never fall through to the concept grid while a concept panel is still open
      if(!blockConceptsComplete(block)){
        var hold = resolvePanelHoldStep(openPanel);
        if(hold) return hold;
      }
    }

    if(!blockConceptsComplete(block)){
      var gridStep = resolveConceptGrid(block, moduleConfig);
      if(gridStep) return gridStep;
      var lockBox = document.querySelector('[data-lock-box="' + block + '"]');
      if(lockBox){
        return sectionScrollStep('block-progress', lockBox, 'Finish all concepts in this block', {
          scrollEl: lockBox,
          scrollBlock: 'start',
          forceScroll: true
        });
      }
      return null;
    }

    if(openPanel){
      openPanel.classList.remove('show');
      delete openPanel.dataset.currentTarget;
      delete openPanel.dataset.currentBlock;
    }

    var reflectionStep = resolveReflectionCheckpoint(block);
    if(reflectionStep) return reflectionStep;

    if(blockConceptsComplete(block) && !reflectionDone(block) && !isReflectionPhase(block)){
      var waitLock = document.querySelector('[data-lock-box="' + block + '"]');
      if(waitLock){
        return sectionScrollStep('block-progress', waitLock, 'Reflection checkpoint unlocks shortly', {
          scrollEl: waitLock,
          scrollBlock: 'start',
          forceScroll: true
        });
      }
    }

    return null;
  }

  function resolveSectionStage(sectionId){
    if(sectionId.indexOf('block') === 0) return null;
    if(!isModuleStarted()) return null;
    if(!isChecked($('input[data-stage-check="journey"]'))) return null;
    if(!isChecked($('input[data-stage-check="outcomes"]'))) return null;
    if(!insideModuleReviewed()) return null;

    var check = $('input[data-stage-check="' + sectionId + '"]');
    if(!check || isChecked(check)) return null;
    if(isDisabled(check)) return null;

    if(sectionId === 'complete'){
      var startQuiz = $('a[href="#quiz"], .btn-start-quiz, [data-start-quiz]');
      if(startQuiz) return { kind: 'start-quiz', el: startQuiz, label: 'Start module quiz' };
    }
    if(sectionId === 'quiz'){
      var quiz = $('#quiz');
      return quiz ? { kind: 'quiz', el: quiz, label: 'Complete the module quiz' } : null;
    }
    var section = document.getElementById(sectionId);
    var labels = {
      recap: 'Review module recap',
      keyideas: 'Review key ideas summary',
      complete: 'Mark module ready for quiz'
    };
    return {
      kind: 'section-' + sectionId,
      el: (check && check.closest('.check-item')) || section,
      label: labels[sectionId] || ('Complete ' + sectionId)
    };
  }

  function allBlocksComplete(moduleConfig){
    var blocks = moduleConfig.blocks || [];
    return blocks.every(function(block){
      return isChecked(document.querySelector('input[data-check-for="' + block + '"], input[data-stage-check="' + block + '"]'));
    });
  }

  function getEarliestIncompleteBlock(moduleConfig){
    var blocks = (moduleConfig && moduleConfig.blocks) || [];
    for(var i = 0; i < blocks.length; i++){
      // Fully marked complete (checkbox) ? skip. Otherwise this block still needs work
      // (concepts, reflection, or the final "mark complete" check).
      if(!isBlockFullyComplete(blocks[i])) return blocks[i];
    }
    return null;
  }

  function blockOrderIndex(moduleConfig, block){
    var blocks = (moduleConfig && moduleConfig.blocks) || [];
    var idx = blocks.indexOf(block);
    return idx >= 0 ? idx : 999;
  }

  function advanceAccordionPastCompleted(moduleConfig){
    if(!global.ModuleBlockAccordion) return;
    var earliest = getEarliestIncompleteBlock(moduleConfig);
    if(!earliest || isBlockSectionLocked(earliest)) return;
    var openKey = typeof global.ModuleBlockAccordion.getOpen === 'function'
      ? global.ModuleBlockAccordion.getOpen()
      : null;
    // Only move when a finished block is still the open accordion
    if(!openKey || !isBlockFullyComplete(openKey)) return;
    if(openKey === earliest) return;
    if(typeof global.ModuleBlockAccordion.ensureOpen === 'function'){
      try{ global.ModuleBlockAccordion.ensureOpen(earliest, { scroll: true }); }catch(err){}
    }
  }

  function resolveNextStep(moduleConfig){
    if(!moduleConfig) return null;

    var start = resolveStartModule();
    if(start) return start;

    var journey = resolveJourney();
    if(journey) return journey;

    var outcomes = resolveOutcomes();
    if(outcomes) return outcomes;

    var inside = resolveInsideModule();
    if(inside) return inside;

    var earliestIncomplete = getEarliestIncompleteBlock(moduleConfig);
    advanceAccordionPastCompleted(moduleConfig);

    var openPanel = getActiveOpenPanel();
    if(openPanel){
      var openBlock = openPanel.getAttribute('data-panel-for');
      if(openBlock && isBlockFullyComplete(openBlock)){
        openPanel.classList.remove('show');
        delete openPanel.dataset.currentTarget;
        delete openPanel.dataset.currentBlock;
        lastStepKey = null;
        lastScrolledKey = null;
        openPanel = null;
      } else if(openBlock){
        var openIdx = blockOrderIndex(moduleConfig, openBlock);
        var earliestIdx = earliestIncomplete ? blockOrderIndex(moduleConfig, earliestIncomplete) : openIdx;
        if(!earliestIncomplete || openIdx <= earliestIdx){
          var focusedStep = resolveBlock(openBlock, moduleConfig);
          if(focusedStep) return focusedStep;
        } else {
          openPanel.classList.remove('show');
          delete openPanel.dataset.currentTarget;
          delete openPanel.dataset.currentBlock;
          lastStepKey = null;
          lastScrolledKey = null;
        }
      }
    }

    var blocks = moduleConfig.blocks || [];
    for(var b = 0; b < blocks.length; b++){
      if(isBlockSectionLocked(blocks[b])) continue;
      if(isBlockFullyComplete(blocks[b])) continue;
      var blockStep = resolveBlock(blocks[b], moduleConfig);
      if(blockStep) return blockStep;
    }

    if(!allBlocksComplete(moduleConfig)) return null;

    var sections = moduleConfig.sections || [];
    for(var s = 0; s < sections.length; s++){
      var id = sections[s];
      if(id.indexOf('block') === 0) continue;
      if(id === 'journey' || id === 'outcomes') continue;
      var step = resolveSectionStage(id);
      if(step) return step;
    }

    return null;
  }

  function usesExpandPulse(step){
    if(!step) return false;
    if(step.tone === 'expand') return true;
    var kinds = {
      'expand-visual': true,
      'block-intro': true,
      'keyidea': true,
      'outcome': true,
      'pillar': true,
      'concept': true,
      'subconcept': true,
      'block-progress': true,
      'finish': true
    };
    return !!kinds[step.kind];
  }

  function removeBlockIntroRings(){
    document.querySelectorAll('.' + BLOCK_INTRO_RING_CLASS).forEach(function(ring){
      ring.remove();
    });
  }

  function removeInPracticeRings(){
    document.querySelectorAll('.' + IN_PRACTICE_RING_CLASS).forEach(function(ring){
      ring.remove();
    });
  }

  function removeExpandRings(){
    document.querySelectorAll('.' + EXPAND_RING_CLASS).forEach(function(ring){
      ring.remove();
    });
  }

  function hasExpandRing(el){
    return !!(el && el.querySelector('.' + EXPAND_RING_CLASS));
  }

  function isVisualExpandPulseHost(el){
    if(!el || !el.classList) return false;
    return el.classList.contains('img-expand-btn') ||
      el.classList.contains('concept-activity-box') ||
      el.classList.contains('m5-nested-visual-frame') ||
      el.classList.contains('b2c2-direct-image') ||
      el.classList.contains('b2c3-direct-image') ||
      el.classList.contains('m5-nested-visual-shell') ||
      el.classList.contains('m5-screen-visual-card') ||
      el.classList.contains('m5-folder-overview-card') ||
      el.classList.contains('entry-exit-fan') ||
      el.classList.contains('entry-exit-fan-item') ||
      el.classList.contains('concept-image') ||
      el.hasAttribute('data-expandable-visual');
  }

  function pinExpandButton(el){
    if(!el || !el.classList || !el.classList.contains('img-expand-btn')) return;
    el.style.setProperty('position', 'absolute', 'important');
    el.style.setProperty('top', '10px', 'important');
    el.style.setProperty('right', '10px', 'important');
    el.style.setProperty('left', 'auto', 'important');
    el.style.setProperty('bottom', 'auto', 'important');
  }

  function unpinExpandButton(el){
    if(!el || !el.classList || !el.classList.contains('img-expand-btn') || !el.style) return;
    el.style.removeProperty('position');
    el.style.removeProperty('top');
    el.style.removeProperty('right');
    el.style.removeProperty('left');
    el.style.removeProperty('bottom');
  }

  function ensureExpandRing(el){
    if(!el) return;
    pinExpandButton(el);
    var ring = el.querySelector('.' + EXPAND_RING_CLASS);
    if(!ring){
      ring = document.createElement('span');
      ring.className = EXPAND_RING_CLASS;
      ring.setAttribute('aria-hidden', 'true');
      el.appendChild(ring);
    }
    ring.classList.toggle('flow-guide-expand-ring--btn', el.classList.contains('img-expand-btn'));
    if(el.classList.contains('img-expand-btn')){
      ring.style.borderRadius = '999px';
      return;
    }
    var img = el.querySelector && (el.querySelector(':scope > img') || el.querySelector('img'));
    var style = global.getComputedStyle ? global.getComputedStyle(img || el) : null;
    var radius = style && style.borderRadius ? style.borderRadius : '';
    if(radius && radius !== '0px') ring.style.borderRadius = radius;
    else ring.style.borderRadius = '14px';
  }

  function hasReflectionRing(gate){
    return !!(gate && gate.querySelector('.' + REFLECTION_RING_CLASS));
  }

  function ensureReflectionRingsForStep(step){
    if(!step) return;
    if(step.pulseEls && step.pulseEls.length){
      for(var r = 0; r < step.pulseEls.length; r++){
        if(step.pulseEls[r] && step.pulseEls[r].hasAttribute && step.pulseEls[r].hasAttribute('data-gate')){
          ensureReflectionRing(step.pulseEls[r]);
        }
      }
      return;
    }
    if(step.el && step.el.hasAttribute && step.el.hasAttribute('data-gate')){
      ensureReflectionRing(step.el);
      return;
    }
    if(step.el && step.el.closest){
      var gateFromEl = step.el.closest('[data-gate]');
      if(gateFromEl) ensureReflectionRing(gateFromEl);
    }
  }
  function removeBlockCheckRings(){
    document.querySelectorAll('.' + BLOCK_CHECK_RING_CLASS).forEach(function(ring){
      ring.remove();
    });
  }

  function ensureBlockCheckRing(item){
    if(!item || !item.classList.contains('check-item')) return;
    if(item.querySelector('.' + BLOCK_CHECK_RING_CLASS)) return;
    var ring = document.createElement('span');
    ring.className = BLOCK_CHECK_RING_CLASS;
    ring.setAttribute('aria-hidden', 'true');
    item.appendChild(ring);
  }

  function removeReflectionRings(){
    document.querySelectorAll('.' + REFLECTION_RING_CLASS).forEach(function(ring){
      ring.remove();
    });
  }

  function ensureReflectionRing(gate){
    if(!gate || !gate.hasAttribute('data-gate')) return;
    if(gate.querySelector('.' + REFLECTION_RING_CLASS)) return;
    var ring = document.createElement('span');
    ring.className = REFLECTION_RING_CLASS;
    ring.setAttribute('aria-hidden', 'true');
    gate.appendChild(ring);
  }

  function ensureBlockIntroRing(card){
    if(!card || !card.classList.contains('block-intro-card')) return;
    if(card.querySelector('.' + BLOCK_INTRO_RING_CLASS)) return;
    var ring = document.createElement('span');
    ring.className = BLOCK_INTRO_RING_CLASS;
    ring.setAttribute('aria-hidden', 'true');
    card.appendChild(ring);
  }

  function hasInPracticeRing(action){
    return !!(action && action.querySelector('.' + IN_PRACTICE_RING_CLASS));
  }

  function ensureInPracticeRing(action){
    if(!action) return;
    var host = action.classList.contains('key-ideas-action') ||
      action.classList.contains('inprac__part') ||
      action.hasAttribute('data-inprac-cta')
      ? action
      : null;
    if(!host) return;
    var ring = host.querySelector('.' + IN_PRACTICE_RING_CLASS);
    if(!ring){
      ring = document.createElement('span');
      ring.className = IN_PRACTICE_RING_CLASS;
      ring.setAttribute('aria-hidden', 'true');
    }
    host.classList.add('flow-guide-pulse--ring-host');
    host.appendChild(ring);
    if(host.classList.contains('inprac__part') || host.hasAttribute('data-inprac-cta')){
      ring.style.borderRadius = '14px';
    }
    if(host.hasAttribute('data-inprac-cta')){
      ring.style.borderRadius = '999px';
    }
  }


  var VARIANT_RGB = {
    foundations: '45, 132, 179',
    core: '123, 47, 161',
    pathway: '26, 92, 56',
    progress: '201, 120, 22'
  };

  function detectBlockVariant(blockId){
    if(!blockId) return null;
    var section = document.getElementById(blockId);
    if(!section) return null;
    var classes = section.className || '';
    var m = classes.match(/block-part--([a-z]+)/);
    if(m) return m[1];
    var order = (activeModuleConfig && activeModuleConfig.blocks) || [];
    var idx = order.indexOf(blockId);
    return ['foundations', 'core', 'pathway', 'progress'][idx >= 0 ? idx % 4 : 0];
  }

  function syncGuidedAccent(step){
    var root = document.documentElement;
    var blockId = null;
    if(step && step.scrollBlockId) blockId = step.scrollBlockId;
    if(!blockId && step && step.el && step.el.closest){
      var part = step.el.closest('[data-block-part], section[id^="block"]');
      if(part) blockId = part.getAttribute('data-block-part') || part.id;
    }
    if(!blockId){
      var openPart = document.querySelector('.section.block-part.is-open[data-block-part]');
      if(openPart) blockId = openPart.getAttribute('data-block-part');
    }
    if(!blockId){
      var openPanel = getActiveOpenPanel();
      if(openPanel) blockId = openPanel.getAttribute('data-panel-for');
    }
    var variant = detectBlockVariant(blockId) || 'foundations';
    root.setAttribute('data-guided-block-variant', variant);
    root.style.setProperty('--flow-accent-rgb', VARIANT_RGB[variant] || VARIANT_RGB.foundations);
    if(step && step.kind && (step.kind.indexOf('m5-') === 0 || step.tone === 'm5-nav')){
      var panel = step.el && step.el.closest && step.el.closest('.concept-panel');
      var custom = panel && panel.dataset && panel.dataset.flowM5AccentRgb;
      if(custom) root.style.setProperty('--flow-m5-accent-rgb', custom);
    }
  }

  function resolvePulseTone(step){
    if(!step) return 'guide';
    if(step.tone === 'inpractice' || step.kind === 'inpractice') return 'practice';
    if(isActivityPulseStep(step) || step.tone === 'activity') return 'activity';
    if(step.kind === 'reflection' || step.tone === 'reflection' || step.kind === 'block-check') return 'reflect';
    if(usesExpandPulse(step) || step.tone === 'expand' || step.kind === 'block-intro' || step.kind === 'm5-nested-nav' || step.tone === 'm5-nav') return 'explore';
    return 'guide';
  }

  function clearPulse(){
    var els = activePulseEls.length ? activePulseEls.slice() : (activePulseEl ? [activePulseEl] : []);
    for(var i = 0; i < els.length; i++){
      unpinExpandButton(els[i]);
      els[i].classList.remove(PULSE_CLASS);
      els[i].classList.remove(PULSE_EXPAND);
      els[i].classList.remove(PULSE_ACTIVITY);
      els[i].classList.remove(PULSE_IN_PRACTICE);
      els[i].classList.remove('flow-guide-pulse--ring-host');
      els[i].removeAttribute('data-flow-tone');
    }
    removeBlockIntroRings();
    removeInPracticeRings();
    removeExpandRings();
    removeReflectionRings();
    removeBlockCheckRings();
    removeM5NavRings();
    activePulseEls = [];
    activePulseEl = null;
  }

  function pulseClassesMissing(el, step){
    if(!el || step.noPulse) return false;
    if(!el.classList.contains(PULSE_CLASS)) return true;
    if(step.tone === 'inpractice' || step.kind === 'inpractice'){
      if(!el.classList.contains(PULSE_IN_PRACTICE)) return true;
      return !hasInPracticeRing(el);
    }
    if(isActivityPulseStep(step)){
      return !el.classList.contains(PULSE_ACTIVITY);
    }
    if(step.kind === 'reflection' || step.tone === 'reflection'){
      var gateEl = el.hasAttribute && el.hasAttribute('data-gate') ? el : (el.closest && el.closest('[data-gate]'));
      if(gateEl && !hasReflectionRing(gateEl)) return true;
    }
    if(step.kind === 'block-check'){
      var checkItem = el.classList && el.classList.contains('check-item') ? el : (el.closest && el.closest('.check-item'));
      if(checkItem && !checkItem.querySelector('.' + BLOCK_CHECK_RING_CLASS)) return true;
    }
    if(step.kind === 'm5-nested-nav' || step.tone === 'm5-nav' || step.kind === 'm5-nested-return' || step.kind === 'm5-visual-review'){
      if(!hasM5NavRing(el)) return true;
      return false;
    }
    if(usesExpandPulse(step)){
      if(isVisualExpandPulseHost(el) && !hasExpandRing(el)) return true;
      return !el.classList.contains(PULSE_EXPAND);
    }
    return false;
  }

  function applyPulseToEl(el, step){
    if(!el) return;
    var panel = el.closest && el.closest('.concept-panel');
    var tone = resolvePulseTone(step);
    el.classList.add(PULSE_CLASS);
    el.setAttribute('data-flow-tone', tone);
    var activityStep = isActivityPulseStep(step);
    var usesM5Tone = !activityStep && (step.tone === 'm5-nav' || step.kind === 'm5-nested-nav' || step.kind === 'm5-nested-return' || step.kind === 'm5-visual-review');
    if(activityStep){
      el.classList.add(PULSE_ACTIVITY);
    } else if(usesM5Tone){
      ensureM5NavRing(el, panel);
    } else if(tone === 'practice'){
      el.classList.add(PULSE_IN_PRACTICE);
      el.classList.add('flow-guide-pulse--ring-host');
      ensureInPracticeRing(el);
    } else if(tone === 'explore'){
      el.classList.add(PULSE_EXPAND);
      if(step.kind === 'finish' || (el.matches && el.matches('[data-finish-concept], .concept-finish'))){
        el.classList.add('flow-guide-pulse--ring-host');
        ensureFinishRing(el);
      } else if(usesExpandPulse(step) && isVisualExpandPulseHost(el)){
        el.classList.add('flow-guide-pulse--ring-host');
        pinExpandButton(el);
        ensureExpandRing(el);
        if(el.querySelectorAll){
          el.querySelectorAll('.img-expand-btn').forEach(pinExpandButton);
        }
      }
    }
    if(step.kind === 'block-intro' || el.classList.contains('block-intro-card')){
      el.classList.add('flow-guide-pulse--ring-host');
      ensureBlockIntroRing(el);
    }
    if(step.kind === 'reflection' || step.tone === 'reflection'){
      el.classList.add('flow-guide-pulse--ring-host');
      ensureReflectionRingsForStep(step);
    }
    if(step.kind === 'block-check'){
      var checkEl = el.classList.contains('check-item') ? el : el.closest('.check-item');
      if(checkEl){
        checkEl.classList.add('flow-guide-pulse--ring-host');
        ensureBlockCheckRing(checkEl);
      }
    }
  }

  function ensureRail(){
    var rail = document.getElementById(RAIL_ID);
    if(rail){
      if(!rail.querySelector('.flow-guide-rail__eyebrow')){
        rail.innerHTML = '<span class="flow-guide-rail__dot" aria-hidden="true"></span><div class="flow-guide-rail__copy"><span class="flow-guide-rail__eyebrow">Guided next</span><span class="flow-guide-rail__text"></span></div>';
      }
      return rail;
    }
    rail = document.createElement('div');
    rail.id = RAIL_ID;
    rail.className = 'flow-guide-rail';
    rail.setAttribute('role', 'status');
    rail.setAttribute('aria-live', 'polite');
    rail.innerHTML = '<span class="flow-guide-rail__dot" aria-hidden="true"></span><div class="flow-guide-rail__copy"><span class="flow-guide-rail__eyebrow">Guided next</span><span class="flow-guide-rail__text"></span></div>';
    document.body.appendChild(rail);
    return rail;
  }

  function ensureRailRing(rail){
    if(!rail) return;
    var ring = rail.querySelector('.' + RAIL_RING_CLASS);
    if(!ring){
      ring = document.createElement('span');
      ring.className = RAIL_RING_CLASS;
      ring.setAttribute('aria-hidden', 'true');
      rail.appendChild(ring);
    }
  }

  function removeRailRing(rail){
    if(!rail) rail = document.getElementById(RAIL_ID);
    if(!rail) return;
    rail.querySelectorAll('.' + RAIL_RING_CLASS).forEach(function(ring){ ring.remove(); });
  }

  function updateRail(step){
    var rail = ensureRail();
    var textEl = rail.querySelector('.flow-guide-rail__text');
    var eyebrow = rail.querySelector('.flow-guide-rail__eyebrow');
    if(!step){
      rail.hidden = true;
      rail.classList.remove(PULSE_CLASS, PULSE_EXPAND, PULSE_ACTIVITY, PULSE_IN_PRACTICE, 'flow-guide-pulse--ring-host');
      rail.removeAttribute('data-flow-tone');
      removeRailRing(rail);
      return;
    }
    rail.hidden = false;
    var tone = resolvePulseTone(step);
    rail.classList.add(PULSE_CLASS, 'flow-guide-pulse--ring-host');
    rail.setAttribute('data-flow-tone', tone);
    rail.classList.toggle(PULSE_EXPAND, tone === 'explore');
    rail.classList.toggle(PULSE_ACTIVITY, tone === 'activity');
    rail.classList.toggle(PULSE_IN_PRACTICE, tone === 'practice');
    ensureRailRing(rail);
    if(eyebrow){
      eyebrow.textContent = tone === 'practice' ? 'Try this'
        : tone === 'activity' ? 'Complete activity'
        : tone === 'reflect' ? 'Checkpoint'
        : tone === 'explore' ? 'Explore'
        : 'Guided next';
    }
    if(textEl) textEl.innerHTML = '<strong>' + String(step.label || '').replace(/</g, '&lt;') + '</strong>';
  }

  function applyGuide(step){
    syncGuidedAccent(step);
    if(!step || !step.el){
      clearPulse();
      updateRail(null);
      lastStepKey = null;
      return;
    }

    var target = step.el;
    if(target.disabled && target.tagName === 'INPUT'){
      target = target.closest('.check-item') || target;
    }

    var key = stepKey(step);
    if(key === lastStepKey && activePulseEl === target && !step.noPulse && !pulseClassesMissing(target, step)){
      if(step.tone === 'inpractice' || step.kind === 'inpractice'){
        ensureInPracticeRing(target);
      }
      if(usesExpandPulse(step) && activePulseEls.length){
        for(var ei = 0; ei < activePulseEls.length; ei++){
          if(step.kind === 'finish' || (activePulseEls[ei].matches && activePulseEls[ei].matches('[data-finish-concept], .concept-finish'))){
            ensureFinishRing(activePulseEls[ei]);
          } else if(isVisualExpandPulseHost(activePulseEls[ei])){
            ensureExpandRing(activePulseEls[ei]);
          }
        }
      }
      if(step.kind === 'reflection' || step.tone === 'reflection'){
        ensureReflectionRingsForStep(step);
      }
      if(step.kind === 'block-check'){
        var checkTarget = target.classList.contains('check-item') ? target : target.closest('.check-item');
        if(checkTarget) ensureBlockCheckRing(checkTarget);
      }
      if(step.kind === 'm5-nested-nav' || step.tone === 'm5-nav' || step.kind === 'm5-nested-return' || step.kind === 'm5-visual-review'){
        ensureM5NavRing(target, target.closest && target.closest('.concept-panel'));
      }
      updateRail(step);
      return;
    }

    clearPulse();
    lastStepKey = key;

    if(!step.noPulse){
      var pulseTargets = (step.pulseEls && step.pulseEls.length) ? step.pulseEls : [target];
      activePulseEls = [];
      for(var p = 0; p < pulseTargets.length; p++){
        if(!pulseTargets[p]) continue;
        applyPulseToEl(pulseTargets[p], step);
        activePulseEls.push(pulseTargets[p]);
      }
      activePulseEl = target;
    } else {
      activePulseEl = null;
      activePulseEls = [];
    }
    updateRail(step);
    scrollIfNeeded(step.scrollEl || target, step);
  }

  function refresh(moduleConfig){
    if(!moduleConfig) return;
    syncBlockIntroVisualState();
    var openPanel = getActiveOpenPanel();
    if(openPanel){
      syncM5AccentContext(openPanel);
      resetPanelFlowScope(openPanel);
    }
    applyGuide(resolveNextStep(moduleConfig));
  }

  function shouldIgnoreMutation(target, mutation){
    if(!target || target.id === RAIL_ID) return true;
    if(mutation.type === 'attributes' && mutation.attributeName === 'class'){
      if(target.classList && (
        target.classList.contains('feedback') ||
        target.classList.contains('match-item') ||
        target.classList.contains('is-reviewed') ||
        target.classList.contains('clicked') ||
        target.classList.contains('is-completed') ||
        target.classList.contains('is-selected') ||
        target.classList.contains('is-correct')
      )) return false;
      // Ignore only pure pulse/ring class noise
      if(target.classList && target.classList.contains(PULSE_CLASS)){
        var meaningful = target.classList.contains('is-reviewed') ||
          target.classList.contains('clicked') ||
          target.classList.contains('is-completed');
        if(!meaningful) return true;
      }
    }
    if(mutation.type === 'childList'){
      if(target.classList && target.classList.contains('block-intro-card')) return true;
      if(target.classList && target.classList.contains('key-ideas-action')){
        // Rebuilds must refresh the guide so pulses reattach
        return false;
      }
      if(target.classList && target.classList.contains(PULSE_CLASS)) return true;
    }
    return false;
  }

  function bindConceptFlowInteractions(moduleConfig){
    document.addEventListener('click', function(e){
      var navBtn = e.target.closest && e.target.closest('[data-b2-go]');
      if(navBtn){
        var navPanel = navBtn.closest('.concept-panel.show');
        if(navPanel && panelHasM5NestedNav(navPanel)){
          var fromScreen = getM5ScreenId(navPanel);
          var goTarget = navBtn.getAttribute('data-b2-go') || '';
          var active = getM5ActiveScreen(navPanel);
          if(active && navBtn.closest('.b2-nav')){
            if(isM5LeafScreen(active)){
              markM5ItemDone(navPanel, 'flowM5CatsDone', fromScreen);
              markM5ItemDone(navPanel, 'flowM5LeafReturned', fromScreen);
            } else if(isM5FolderOverview(active) && goTarget === 'home'){
              markM5ItemDone(navPanel, 'flowM5FoldersDone', fromScreen);
              markM5ItemDone(navPanel, 'flowM5FolderReturned', fromScreen);
            }
          }
          if(navBtn.matches('.b2c2-folder-tile, .b2c3-flash-tile, .b2pl-lvl-btn') && goTarget){
            var returned = parseM5DoneList(navPanel, 'flowM5LeafReturned');
            navPanel.dataset.flowM5LeafReturned = returned.filter(function(id){ return id !== goTarget; }).join(',');
            if(navBtn.matches('.b2c2-folder-tile, .b2c3-flash-tile')){
              var folderReturned = parseM5DoneList(navPanel, 'flowM5FolderReturned');
              navPanel.dataset.flowM5FolderReturned = folderReturned.filter(function(id){ return id !== goTarget; }).join(',');
            }
          }
          bumpFlowAdvance(moduleConfig, 180);
        }
      }

      var panel = e.target.closest && e.target.closest('.concept-panel.show');
      if(!panel) return;

      var pillar = e.target.closest && e.target.closest('.concept-insight-pillar');
      if(pillar && panel.contains(pillar)){
        bumpFlowAdvance(moduleConfig, 120);
      }

      var keyIdea = e.target.closest && e.target.closest('.key-idea-item');
      if(keyIdea && panel.contains(keyIdea)){
        bumpFlowAdvance(moduleConfig, 120);
      }

      var visualHost = e.target.closest && e.target.closest('.entry-exit-fan, .m5-nested-visual-shell, .m5-nested-visual-frame, .m5-screen-visual-card, .img-expand-btn');
      if(visualHost && panelHasM5NestedNav(panel)){
        markM5VisualReviewed(panel);
        bumpFlowAdvance(moduleConfig, 120);
      }

      var activityRoot = findActivityRoot(panel);
      if(activityRoot && activityRoot.contains(e.target)){
        if(panel.dataset.flowActivityStarted !== 'true'){
          panel.dataset.flowActivityStarted = 'true';
        }
        // Always re-evaluate after activity interaction so Done can cue reliably
        bumpFlowAdvance(moduleConfig, 180);
      }
    }, true);

    document.addEventListener('input', function(e){
      var panel = e.target && e.target.closest && e.target.closest('.concept-panel.show');
      if(!panel) return;
      var activityRoot = findActivityRoot(panel);
      if(activityRoot && activityRoot.contains(e.target)){
        if(panel.dataset.flowActivityStarted !== 'true' && isActivityIncomplete(panel)){
          panel.dataset.flowActivityStarted = 'true';
        }
        bumpFlowAdvance(moduleConfig, 120);
      }
    }, true);

    document.addEventListener('change', function(e){
      var panel = e.target && e.target.closest && e.target.closest('.concept-panel.show');
      if(!panel) return;
      var activityRoot = findActivityRoot(panel);
      if(activityRoot && activityRoot.contains(e.target)){
        bumpFlowAdvance(moduleConfig, 120);
      }
    }, true);
  }

  function bindRefresh(moduleConfig){
    bindConceptFlowInteractions(moduleConfig);

    ['click', 'change', 'input', 'concept-insight-pillars-change', 'concept-visual-expand-wire', 'concept-visual-expand-change', 'flow-guide-in-practice-ready'].forEach(function(name){
      document.addEventListener(name, function(e){
        var panel = e.target && e.target.closest && e.target.closest('.concept-panel.show');
        if(panel) ensurePanelVisualWired(panel);
        if(name === 'concept-visual-expand-change' && panel && panelHasM5NestedNav(panel)){
          markM5VisualReviewed(panel);
          bumpFlowAdvance(moduleConfig, 160);
          return;
        }
        if(name === 'concept-insight-pillars-change' && panel){
          bumpFlowAdvance(moduleConfig, 140);
          return;
        }
        if(name === 'flow-guide-in-practice-ready'){
          bumpFlowAdvance(moduleConfig, 100);
          return;
        }
        // Clicks on In Practice / activity are advanced by dedicated handlers ? avoid canceling bumps
        if(name === 'click'){
          var t = e.target;
          if(t && t.closest && (
            t.closest('[data-inprac-part], [data-inprac-cta], .key-ideas-action') ||
            t.closest('[data-choice-option], [data-choice-activity], [data-matching-activity], [data-categorize-activity], [data-sequence-activity], [data-carousel], [data-sense-card]')
          )){
            return;
          }
        }
        scheduleRefresh(moduleConfig);
      }, true);
    });

    if(typeof MutationObserver !== 'undefined'){
      var observer = new MutationObserver(function(mutations){
        for(var i = 0; i < mutations.length; i++){
          var mutation = mutations[i];
          if(mutation.type === 'attributes'){
            if(mutation.attributeName === 'data-choice-shell-complete' ||
              mutation.attributeName === 'data-choice-complete' ||
              mutation.attributeName === 'data-activity-complete' ||
              mutation.attributeName === 'data-carousel-complete' ||
              mutation.attributeName === 'data-categorize-complete' ||
              mutation.attributeName === 'data-sequence-complete' ||
              mutation.attributeName === 'data-matched-count' ||
              mutation.attributeName === 'data-in-practice-done'){
              bumpFlowAdvance(moduleConfig, 220);
              return;
            }
            if(mutation.attributeName === 'disabled'){
              var disabledEl = mutation.target;
              if(disabledEl && disabledEl.matches && disabledEl.matches('[data-finish-concept], .concept-finish')){
                bumpFlowAdvance(moduleConfig, 220);
                return;
              }
            }
            if(mutation.attributeName === 'class'){
              var t = mutation.target;
              if(t && t.classList && t.classList.contains('feedback') && t.classList.contains('show')){
                bumpFlowAdvance(moduleConfig, 220);
                return;
              }
            }
          }
          if(!shouldIgnoreMutation(mutation.target, mutation)){
            scheduleRefresh(moduleConfig);
            return;
          }
        }
      });
      observer.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: [
          'disabled', 'hidden', 'checked', 'class',
          'data-flow-reviewed', 'data-visual-expanded', 'data-flow-visual-expanded',
          'data-in-practice-done', 'data-in-practice-required', 'data-flow-block-intro-done',
          'data-choice-complete', 'data-matched-count', 'data-matching-pairs-count',
          'data-categorize-complete', 'data-sequence-complete', 'data-carousel-complete',
          'data-reflect-ack-complete', 'data-activity-complete', 'data-choice-shell-complete'
        ],
        childList: true
      });
    }

    window.addEventListener('hashchange', function(){ scheduleRefresh(moduleConfig); });
    window.addEventListener('resize', function(){ scheduleRefresh(moduleConfig); });
    window.addEventListener('wheel', function(){ userScrollUntil = Date.now() + 3000; }, { passive: true });
    window.addEventListener('touchmove', function(){ userScrollUntil = Date.now() + 3000; }, { passive: true });
  }

  function initModulePage(){
    if(!global.TrainingFlowConfig) return;
    var ctx = TrainingFlowConfig.detectContext();
    if(!ctx || ctx.hub || !ctx.moduleId) return;

    var moduleConfig = TrainingFlowConfig.getModuleConfig(ctx.pathway, ctx.moduleId);
    if(!moduleConfig) return;

    activeModuleConfig = moduleConfig;
    document.documentElement.setAttribute('data-guided-flow', 'true');
    if(ctx.pathway) document.documentElement.setAttribute('data-guided-pathway', ctx.pathway.id);

    function start(){
      scrollToPageTop();
      resetBlockIntroForGuidedFlow();
      neutralizeModuleBlockIntroHandlers();
      syncBlockIntroVisualState();
      bindModuleStart();
      bindJourneyReview();
      bindInsideModuleReview();
      bindBlockIntroReview(moduleConfig);
      bindInPracticeReview(moduleConfig);
      refresh(moduleConfig);
      bindRefresh(moduleConfig);
      setTimeout(scrollToPageTop, 80);
    }

    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', function(){
        setTimeout(start, 500);
      });
    } else {
      setTimeout(start, 500);
    }
  }

  function loadGuidedHubState(pathway){
    try {
      var raw = localStorage.getItem(pathway.storageKey);
      if(raw) return JSON.parse(raw);
    } catch(err){}
    return { completedModules: [], lastModule: null };
  }

  function saveGuidedHubState(pathway, state){
    try {
      localStorage.setItem(pathway.storageKey, JSON.stringify(state));
    } catch(err){}
  }

  function initHubPage(){
    if(!global.TrainingFlowConfig) return;
    var ctx = TrainingFlowConfig.detectContext();
    if(!ctx || !ctx.hub) return;

    var pathway = ctx.pathway;
    var state = loadGuidedHubState(pathway);
    var modules = pathway.modules.filter(function(m){ return m.number; });
    var nextModule = modules[0];

    for(var i = 0; i < modules.length; i++){
      if(state.completedModules.indexOf(modules[i].id) === -1){
        nextModule = modules[i];
        break;
      }
    }

    document.documentElement.setAttribute('data-guided-flow', 'hub');

    modules.forEach(function(mod){
      var card = document.querySelector('.module-card[data-module-number="' + mod.number + '"]');
      if(!card) return;
      card.classList.remove('flow-guide-next-module');
      if(nextModule && mod.id === nextModule.id){
        card.classList.add('flow-guide-next-module');
      }
    });

    var rail = ensureRail();
    if(nextModule){
      rail.hidden = false;
      var textEl = rail.querySelector('.flow-guide-rail__text');
      var eyebrow = rail.querySelector('.flow-guide-rail__eyebrow');
      if(eyebrow) eyebrow.textContent = 'Recommended';
      if(textEl) textEl.innerHTML = '<strong>Module ' + nextModule.number + ' \u2014 ' + nextModule.title + '</strong>';
    } else {
      rail.hidden = true;
    }

    document.querySelectorAll('.module-card[data-module-number] .module-btn, .module-card[data-module-number] a.btn-primary').forEach(function(link){
      link.addEventListener('click', function(){
        var card = link.closest('.module-card[data-module-number]');
        if(!card) return;
        var num = card.getAttribute('data-module-number');
        state.lastModule = 'module-' + num;
        saveGuidedHubState(pathway, state);
      });
    });
  }

  function markModuleComplete(pathwayId, moduleId){
    if(!global.TrainingFlowConfig) return;
    var pathway = pathwayId === 'training-ii' ? TrainingFlowConfig.TRAINING_II : TrainingFlowConfig.TRAINING_I;
    var state = loadGuidedHubState(pathway);
    if(state.completedModules.indexOf(moduleId) === -1){
      state.completedModules.push(moduleId);
    }
    saveGuidedHubState(pathway, state);
  }

  function scrollToBlockEnd(block){
    lastScrolledKey = null;
    userScrollUntil = 0;
    scrollToBlockReflectionView(block);
  }

  function returnToConceptGrid(block){
    setTimeout(function(){
      var panel = document.querySelector('[data-panel-for="' + block + '"]');
      if(panel){
        panel.classList.remove('show');
        delete panel.dataset.currentTarget;
        delete panel.dataset.currentBlock;
        panel.removeAttribute('data-flow-visual-expanded');
        wiredPanels.delete(panel);
        delete panel.__flowGuideScope;
        delete panel.dataset.flowKeyideasFramed;
        delete panel.dataset.flowActivityStarted;
        clearM5FlowTracking(panel);
      }
      document.querySelectorAll('[data-concept-grid="' + block + '"] .concept-square[data-target]').forEach(function(btn){
        btn.classList.remove('active');
      });
      lastStepKey = null;
      lastScrolledKey = null;
      userScrollUntil = 0;

      if(blockConceptsComplete(block)){
        scrollToBlockEnd(block);
      } else {
        scrollToConceptGrid(block);
        setTimeout(function(){ scrollToConceptGrid(block); }, 220);
        setTimeout(function(){ scrollToConceptGrid(block); }, 620);
      }

      if(activeModuleConfig){
        scheduleRefresh(activeModuleConfig, 120);
        scheduleRefresh(activeModuleConfig, 400);
        scheduleRefresh(activeModuleConfig, 800);
        scheduleRefresh(activeModuleConfig, 1200);
      }
    }, 120);
  }

  global.TrainingFlowGuide = {
    init: function(){
      var ctx = global.TrainingFlowConfig && TrainingFlowConfig.detectContext();
      if(!ctx) return;
      if(ctx.hub) initHubPage();
      else initModulePage();
    },
    refresh: refresh,
    scheduleRefresh: scheduleRefresh,
    requestRefresh: function(delay){
      lastStepKey = null;
      lastScrolledKey = null;
      if(!activeModuleConfig) return;
      var waits = Array.isArray(delay) ? delay : [typeof delay === 'number' ? delay : 120];
      for(var i = 0; i < waits.length; i++){
        (function(ms){
          setTimeout(function(){ refresh(activeModuleConfig); }, ms);
        })(waits[i]);
      }
    },
    bumpFlowAdvance: function(delay){
      if(activeModuleConfig) bumpFlowAdvance(activeModuleConfig, delay);
    },
    resolveNextStep: resolveNextStep,
    markModuleComplete: markModuleComplete,
    returnToConceptGrid: returnToConceptGrid,
    clearM5FlowTracking: clearM5FlowTracking,
    syncPanelInPracticeDone: syncPanelInPracticeDone,
    markPanelInPracticeDone: markPanelInPracticeDone
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ TrainingFlowGuide.init(); });
  } else {
    TrainingFlowGuide.init();
  }
})(typeof window !== 'undefined' ? window : this);
