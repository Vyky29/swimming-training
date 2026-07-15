(function(global){
  'use strict';

  /**
   * Content-prep kill switch: guided pulse + rail stay off so you can browse freely.
   * Flip to true when content is final for learners.
   * Override anytime with ?flowGuide=1 (on) or ?flowGuide=0 (off).
   */
  var FLOW_GUIDE_ACTIVE_DEFAULT = false;

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
  var flowGuideSuppressed = false;

  function $(sel, root){ return (root || document).querySelector(sel); }
  function $$(sel, root){ return Array.from((root || document).querySelectorAll(sel)); }

  function isFlowGuideActive(){
    try {
      var params = new URLSearchParams(global.location && global.location.search || '');
      var q = params.get('flowGuide') || params.get('guide');
      if(q === '1' || q === 'on' || q === 'true') return true;
      if(q === '0' || q === 'off' || q === 'false' || params.get('noguide') === '1') return false;
    } catch(err){}
    if(typeof global.TRAINING_FLOW_GUIDE_ACTIVE === 'boolean') return global.TRAINING_FLOW_GUIDE_ACTIVE;
    // Review / content-check mode: navigate freely without pulse
    if(document.documentElement.getAttribute('data-review-mode') === 'true') return false;
    return FLOW_GUIDE_ACTIVE_DEFAULT;
  }

  function suppressFlowGuideChrome(){
    flowGuideSuppressed = true;
    document.documentElement.setAttribute('data-flow-guide-off', 'true');
    document.documentElement.removeAttribute('data-guided-flow');
    try { clearPulse(); } catch(err){}
    var rail = document.getElementById(RAIL_ID);
    if(rail){
      rail.hidden = true;
      rail.setAttribute('hidden', '');
      rail.style.display = 'none';
    }
    $$(
      '.' + PULSE_CLASS + ', .' + BLOCK_INTRO_RING_CLASS + ', .' + IN_PRACTICE_RING_CLASS +
      ', .' + EXPAND_RING_CLASS + ', .' + RAIL_RING_CLASS + ', .' + REFLECTION_RING_CLASS +
      ', .' + BLOCK_CHECK_RING_CLASS + ', .' + M5_NAV_RING_CLASS +
      ', .flow-guide-finish-ring, .flow-guide-next-module'
    ).forEach(function(el){
      el.classList.remove(
        PULSE_CLASS, PULSE_EXPAND, PULSE_ACTIVITY, PULSE_IN_PRACTICE,
        'flow-guide-pulse--ring-host', 'flow-guide-next-module'
      );
      if(
        el.classList.contains(BLOCK_INTRO_RING_CLASS) ||
        el.classList.contains(IN_PRACTICE_RING_CLASS) ||
        el.classList.contains(EXPAND_RING_CLASS) ||
        el.classList.contains(RAIL_RING_CLASS) ||
        el.classList.contains(REFLECTION_RING_CLASS) ||
        el.classList.contains(BLOCK_CHECK_RING_CLASS) ||
        el.classList.contains(M5_NAV_RING_CLASS) ||
        el.classList.contains('flow-guide-finish-ring')
      ){
        if(el.parentNode) el.parentNode.removeChild(el);
      }
    });
    activeModuleConfig = null;
  }

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

    // Force bumps always reschedule from "now" so post-handler state (e.g. match
    // success) is observed. Non-force keeps the soonest pending refresh.
    if(!opts.forceAdvance && refreshTimer && due >= refreshDueAt){
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
    // Mid hub tour (return from Modelling ? pulse Turn Taking): keep resume marks
    // so the overview photo does not re-steal the guided pulse.
    if(panel.dataset.flowHubTour === '1'){
      delete panel.dataset.flowActivityStarted;
      return;
    }
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
    if(!panel) return [];
    var introSlot = panel.querySelector('.concept-intro-slot');
    // Pathway stage hubs hide the intro slot (display:none). Do not guide
    // pillars that remain in the DOM but are invisible ? they steal the pulse.
    if(introSlot && (introSlot.style.display === 'none' || !isVisibleEl(introSlot))){
      return [];
    }
    var nodes = introSlot
      ? introSlot.querySelectorAll('.concept-insight-pillar:not(.clicked)')
      : panel.querySelectorAll('.concept-insight-pillar:not(.clicked)');
    return Array.prototype.filter.call(nodes, function(el){
      return isVisibleEl(el) && el.offsetParent !== null;
    });
  }

  function isKeyIdeaGuideable(el){
    if(!el || el.closest('[hidden]')) return false;
    // Inactive nested screens stay out of getM5InteractiveRoot; don't require
    // offsetParent (lightbox / overflow can falsely hide in-flow ideas).
    var style = typeof window.getComputedStyle === 'function' ? window.getComputedStyle(el) : null;
    if(style && (style.display === 'none' || style.visibility === 'hidden')) return false;
    return true;
  }

  function collectGuideableKeyIdeas(panel){
    if(!panel) return [];
    var roots = [getM5InteractiveRoot(panel)];
    // Nested hubs keep Key Ideas on the panel shell while home is active
    if(panelHasM5NestedNav(panel) && getM5ScreenId(panel) === 'home'){
      roots.push(panel);
    }
    var seen = [];
    var out = [];
    for(var r = 0; r < roots.length; r++){
      if(!roots[r]) continue;
      var items = roots[r].querySelectorAll('.key-idea-item:not(.clicked)');
      for(var i = 0; i < items.length; i++){
        var item = items[i];
        if(seen.indexOf(item) >= 0) continue;
        if(!isKeyIdeaGuideable(item)) continue;
        // Skip panel-shell Key Ideas while they are CSS-hidden inside a nested leaf/folder
        var shellBox = item.closest('.concept-panel > .concept-points-box');
        if(shellBox && panel.classList.contains('m5-nested-active')){
          var shellStyle = window.getComputedStyle(shellBox);
          if(shellStyle && shellStyle.display === 'none') continue;
        }
        seen.push(item);
        out.push(item);
      }
    }
    return out;
  }

  function hasUnclickedKeyIdeasInScope(panel){
    return collectGuideableKeyIdeas(panel).length > 0;
  }

  function scopeNeedsInPracticeMount(panel){
    if(!panel || !panelHasM5NestedNav(panel)) return false;
    var root = getM5InteractiveRoot(panel);
    if(!root) return false;
    var boxes = root.querySelectorAll('.concept-points-box');
    for(var i = 0; i < boxes.length; i++){
      if(!boxes[i].querySelector('.key-idea-item')) continue;
      if(!boxes[i].querySelector('.key-ideas-action')) return true;
    }
    return false;
  }

  function ensureScopedInPracticeMounted(panel){
    if(!panel || !scopeNeedsInPracticeMount(panel)) return;
    if(global.InPracticeSystem && typeof global.InPracticeSystem.ensureStaticPointsBoxes === 'function'){
      try { global.InPracticeSystem.ensureStaticPointsBoxes(getM5InteractiveRoot(panel)); } catch(err){}
    }
  }

  function getInPracticeScopeKey(panel){
    if(!panel) return '';
    if(panelHasM5NestedNav(panel)){
      var screenId = getM5ScreenId(panel);
      if(screenId && screenId !== 'home') return screenId;
    }
    return panel.dataset.currentTarget || '';
  }

  function findScopedInPracticeAction(panel){
    if(!panel) return null;
    var root = getM5InteractiveRoot(panel);
    var action = root.querySelector('.key-ideas-action:not([hidden])');
    if(action && isVisibleEl(action)) return action;
    // Nested leaf/folder screens must not inherit the parent concept's completed In Practice
    if(panelHasM5NestedNav(panel)){
      var screenId = getM5ScreenId(panel);
      if(screenId && screenId !== 'home') return null;
    }
    action = panel.querySelector('.key-ideas-action:not([hidden])');
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

  function rgbStringFromCssColor(value){
    if(!value || value === 'transparent' || value === 'rgba(0, 0, 0, 0)') return '';
    if(value.indexOf('rgb') === 0){
      var nums = value.match(/\d+/g);
      if(nums && nums.length >= 3){
        // Ignore near-black / near-white body text colours
        var r = parseInt(nums[0], 10);
        var g = parseInt(nums[1], 10);
        var b = parseInt(nums[2], 10);
        if(r + g + b < 40 || r + g + b > 720) return '';
        return r + ', ' + g + ', ' + b;
      }
    }
    return '';
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
    var bgRgb = rgbStringFromCssColor(style.backgroundColor);
    if(bgRgb) return bgRgb;
    // Category / subconcept titles use text colour, not fill
    var colorRgb = rgbStringFromCssColor(style.color);
    if(colorRgb) return colorRgb;
    return '214, 120, 28';
  }

  function getM5CategoryAccentEl(wrapper, screenId){
    if(!wrapper || !screenId) return null;
    var screen = wrapper.querySelector('.b2-screen[data-b2-screen="' + screenId + '"]');
    if(screen){
      var cathead = screen.querySelector('.b2pl-cathead');
      if(cathead) return cathead;
    }
    var catKey = '';
    var leaf = String(screenId).match(/^(f\d+)-s(\d+)$/);
    if(leaf) catKey = leaf[1] + '-' + leaf[2];
    else if(/^(vs|fc)\d+$/.test(screenId)) catKey = screenId;
    if(!catKey) return null;
    return wrapper.querySelector(
      '.b2pl-cat-' + catKey +
      ', .b2pl-lvl-btn.b2pl-cat-' + catKey +
      ', .b2pl-cathead--' + catKey +
      ', .b2pl-cathead--' + screenId
    );
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

  function rgbToCssHex(rgb){
    if(!rgb) return '';
    var parts = String(rgb).split(',').map(function(p){ return parseInt(p.trim(), 10); });
    if(parts.length < 3 || parts.some(function(n){ return isNaN(n); })) return '';
    return '#' + parts.slice(0, 3).map(function(n){
      var h = Math.max(0, Math.min(255, n)).toString(16);
      return h.length === 1 ? '0' + h : h;
    }).join('');
  }

  function syncM5AccentContext(panel){
    if(!panelHasM5NestedNav(panel)){
      panel.removeAttribute('data-flow-m5-accent-rgb');
      panel.removeAttribute('data-flow-m5-root');
      panel.style.removeProperty('--m5-folder-accent');
      panel.style.removeProperty('--m5-folder-accent-rgb');
      panel.style.removeProperty('--b2c2-accent');
      panel.style.removeProperty('--b2c3-accent');
      panel.style.removeProperty('--concept-title-accent');
      panel.style.removeProperty('--concept-title-accent-soft');
      panel.style.removeProperty('--concept-title-accent-border');
      return;
    }
    var screenId = getM5ScreenId(panel);
    var rootId = getM5FolderRootId(screenId);
    if(!rootId || screenId === 'home'){
      panel.removeAttribute('data-flow-m5-accent-rgb');
      panel.removeAttribute('data-flow-m5-root');
      panel.style.removeProperty('--m5-folder-accent');
      panel.style.removeProperty('--m5-folder-accent-rgb');
      panel.style.removeProperty('--b2c2-accent');
      panel.style.removeProperty('--b2c3-accent');
      panel.style.removeProperty('--concept-title-accent');
      panel.style.removeProperty('--concept-title-accent-soft');
      panel.style.removeProperty('--concept-title-accent-border');
      return;
    }
    panel.dataset.flowM5Root = rootId;
    var wrapper = getM5NestedWrapper(panel);
    var accentEl = null;
    // Category leaves: title accents follow the category colour, not the block / folder tone
    if(/^f\d+-s\d+$/.test(screenId) || /^vs\d+$/.test(screenId) || /^fc\d+$/.test(screenId)){
      accentEl = getM5CategoryAccentEl(wrapper, screenId);
    }
    if(!accentEl && wrapper){
      accentEl = wrapper.querySelector('.b2c2-folder-tile[data-b2-go="' + rootId + '"], .b2c3-flash-tile[data-b2-go="' + rootId + '"]');
    }
    if(!accentEl && wrapper){
      var folderScreen = wrapper.querySelector('.b2-screen[data-b2-screen="' + rootId + '"]');
      accentEl = folderScreen && (folderScreen.querySelector('.b2pl-folder-h--' + rootId) || folderScreen.querySelector('.b2pl-folder-h, .b2pl-cathead'));
    }
    var rgb = getM5NavAccent(accentEl);
    panel.dataset.flowM5AccentRgb = rgb;
    var hex = rgbToCssHex(rgb);
    if(hex){
      panel.style.setProperty('--m5-folder-accent', hex);
      panel.style.setProperty('--m5-folder-accent-rgb', rgb);
      panel.style.setProperty('--concept-title-accent', hex);
      panel.style.setProperty('--concept-title-accent-soft', 'rgba(' + rgb + ', 0.12)');
      panel.style.setProperty('--concept-title-accent-border', 'rgba(' + rgb + ', 0.28)');
      if(/^f\d+$/.test(rootId) || /^f\d+-s\d+$/.test(screenId)){
        panel.style.setProperty('--b2c2-accent', hex);
      }
      if(/^fc\d+$/.test(rootId) || /^vs\d+$/.test(rootId)){
        panel.style.setProperty('--b2c3-accent', hex);
      }
    }
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
    // Prefer the tile/folder colour (home grid), then in-folder panel accent
    var rgb = getM5NavAccent(el) || (panel && panel.dataset.flowM5AccentRgb) || '214, 120, 28';
    ring.style.setProperty('--flow-m5-accent-rgb', rgb);
    ring.style.setProperty('--_pulse-rgb', rgb);
    el.style.setProperty('--flow-m5-accent-rgb', rgb);
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

  /** Shared gate before any hub leaf / folder / level / schedule entry.
   *  Order: Core Concept ? Visual ? (stage cards) ? Key Ideas ? In Practice ? leaves
   */
  function hubContentBeforeLeaves(panel){
    if(!panel) return true;
    if(getVisibleInsightPillars(panel).length) return false;
    if(!preKeyIdeasVisualsComplete(panel)) return false;
    if(panel.dataset.stageCardsRequired === 'true' && panel.dataset.stageCardsDone !== 'true') return false;
    if(hasUnclickedKeyIdeasInScope(panel)) return false;
    if(!inPracticeFlowComplete(panel)) return false;
    return true;
  }

  function m5HubContentReady(panel){
    return hubContentBeforeLeaves(panel);
  }

  function resolveM5NestedNav(panel){
    if(!panelHasM5NestedNav(panel)) return null;
    var wrapper = getM5NestedWrapper(panel);
    var active = getM5ActiveScreen(panel);
    if(!active || !wrapper) return null;

    var screenId = getM5ScreenId(panel);
    if(isM5LeafScreen(active)) return null;

    // Never pulse folders / flashcards / schedules before Visual ? Key Ideas ? In Practice
    if(!hubContentBeforeLeaves(panel)) return null;

    if(isM5FolderOverview(active)){
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
      // Folders, flashcards, and Visual Schedules (b3c1 uses .b2pl-lvl-btn)
      var tiles = active.querySelectorAll(
        '.b2c2-folder-tile[data-b2-go], .b2c3-flash-tile[data-b2-go], .b2pl-cat-grid .b2pl-lvl-btn[data-b2-go], .b2pl-folder-grid .b2pl-lvl-btn[data-b2-go]'
      );
      for(var t = 0; t < tiles.length; t++){
        var tileId = tiles[t].getAttribute('data-b2-go');
        if(!isM5FolderComplete(panel, wrapper, tileId)){
          var tileLabel = tiles[t].querySelector('.b2c2-folder-label, .b2c3-mini-label, .b2pl-lvl-lbl');
          var tileText = (tileLabel && tileLabel.textContent.trim()) ||
            (tiles[t].textContent || '').replace(/\s+/g, ' ').trim() ||
            'this section';
          return buildM5NavStep(tiles[t], 'Open ' + tileText);
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

  function resolveM5LeafReturn(panel){
    if(!isM5LeafFlowComplete(panel)) return null;
    var active = getM5ActiveScreen(panel);
    var screenId = getM5ScreenId(panel);
    if(!active || !screenId || isM5ItemDone(panel, 'flowM5LeafReturned', screenId)) return null;
    var back = active.querySelector('.b2-nav [data-b2-go]');
    if(!back || !isVisibleEl(back)) return null;
    return sectionScrollStep('m5-nested-nav', back, 'Return to continue', {
      scrollEl: back,
      scrollBlock: 'center',
      forceScroll: true,
      tone: 'm5-nav',
      pulseEls: [back],
      keyToken: (panel.dataset.currentTarget || '') + ':m5-leaf-return:' + screenId
    });
  }

  function getSubconceptNavButtons(nav){
    if(!nav) return [];
    return $$('.concept-square[data-target], .b3c3-overview-step[data-target], .overview-subconcept-btn[data-overview-subtarget], .overview-subconcept-btn[data-parent-subtarget], .overview-subconcept-btn', nav);
  }

  function isOnParentHubWithSubconcepts(panel){
    var nav = getSubconceptNav(panel);
    if(!nav || !isVisibleEl(nav)) return false;
    var navButtons = getSubconceptNavButtons(nav);
    if(!navButtons.length) return false;
    var current = panel.dataset.currentTarget || '';
    var isLeaf = navButtons.some(function(btn){ return getNavTarget(btn) === current; });
    return !isLeaf;
  }

  function parentHubHasIncompleteLeaves(panel){
    if(!isOnParentHubWithSubconcepts(panel)) return false;
    var navButtons = getSubconceptNavButtons(getSubconceptNav(panel));
    return navButtons.some(function(btn){
      return !isConceptDone(btn) && !isConceptLocked(btn, activeModuleConfig);
    });
  }

  function panelHasB2LevelAccordions(panel){
    return !!(panel && panel.querySelector(
      '[data-b2l1-focus-list] .b2l1-item-btn, [data-b2l1-activities-list] .b2l1-item-btn'
    ));
  }

  function b2LevelAccordionsComplete(panel){
    if(!panelHasB2LevelAccordions(panel)) return true;
    var buttons = panel.querySelectorAll(
      '[data-b2l1-focus-list] .b2l1-item-btn, [data-b2l1-activities-list] .b2l1-item-btn'
    );
    if(!buttons.length) return true;
    for(var i = 0; i < buttons.length; i++){
      if(!buttons[i].classList.contains('is-complete')) return false;
    }
    return true;
  }

  function b2LevelItemLabel(btn, fallback){
    if(!btn) return fallback || 'next item';
    var labelEl = btn.querySelector('.b2l1-item-label');
    var text = ((labelEl && labelEl.textContent) || btn.textContent || '').replace(/\s+/g, ' ').trim();
    return text || fallback || 'next item';
  }

  function panelHasB3c2FactorExplore(panel){
    return !!(panel && panel.querySelector('[data-b3c2-factor-explore], .b3c2-factor-explore .b3c2-factor-box'));
  }

  function b3c2FactorExploreComplete(panel){
    if(!panelHasB3c2FactorExplore(panel)) return true;
    if(panel.dataset.factorExploreDone === 'true') return true;
    var wraps = Array.prototype.slice.call(panel.querySelectorAll('.b3c2-factor-explore')).filter(isVisibleEl);
    var wrap = wraps.length ? wraps[wraps.length - 1] : null;
    if(!wrap) return true;
    var boxes = wrap.querySelectorAll('.b3c2-factor-box[data-factor-key]');
    if(!boxes.length) return true;
    for(var i = 0; i < boxes.length; i++){
      if(!boxes[i].classList.contains('is-complete')) return false;
    }
    return true;
  }

  function resolveB3c2FactorExplore(panel){
    if(!panel || !panelHasB3c2FactorExplore(panel)) return null;
    if(b3c2FactorExploreComplete(panel)) return null;
    // Always after Visual ? Key Ideas ? In Practice (Physical / Motor / Cognitive)
    if(getVisibleInsightPillars(panel).length) return null;
    if(!preKeyIdeasVisualsComplete(panel)) return null;
    if(hasUnclickedKeyIdeasInScope(panel)) return null;
    if(!inPracticeFlowComplete(panel)) return null;
    var wraps = Array.prototype.slice.call(panel.querySelectorAll('.b3c2-factor-explore')).filter(isVisibleEl);
    var wrap = wraps.length ? wraps[wraps.length - 1] : null;
    if(!wrap) return null;
    var target = panel.dataset.currentTarget || '';

    // Active factor: open each info card (affects / see / todo)
    var active = wrap.querySelector('.b3c2-factor-box.is-active:not(.is-complete)');
    if(active){
      var openInfo = wrap.querySelector('.b3c2-factor-info-card:not(.is-done)');
      if(openInfo && isVisibleEl(openInfo)){
        var infoLabel = (openInfo.querySelector('.b3c2-factor-info-kicker') || openInfo).textContent || 'Review this section';
        infoLabel = infoLabel.replace(/\s+/g, ' ').trim();
        return sectionScrollStep('b3c2-factor-info', openInfo, infoLabel, {
          scrollEl: openInfo,
          scrollBlock: 'center',
          forceScroll: true,
          tone: 'expand',
          keyToken: target + ':b3c2-info:' + (active.getAttribute('data-factor-key') || '') + ':' + (openInfo.getAttribute('data-info-key') || '')
        });
      }
    }

    var boxes = wrap.querySelectorAll('.b3c2-factor-box[data-factor-key]');
    for(var i = 0; i < boxes.length; i++){
      if(boxes[i].classList.contains('is-complete')) continue;
      if(!isVisibleEl(boxes[i])) continue;
      var label = (boxes[i].querySelector('.b3c2-factor-box-title') || boxes[i]).textContent || 'factor';
      label = label.replace(/\s+/g, ' ').trim();
      return sectionScrollStep('b3c2-factor', boxes[i], 'Explore: ' + label, {
        scrollEl: boxes[i],
        scrollBlock: 'center',
        forceScroll: true,
        tone: 'expand',
        keyToken: target + ':b3c2-factor:' + (boxes[i].getAttribute('data-factor-key') || i)
      });
    }
    return null;
  }

  function resolveB2LevelAccordions(panel){
    if(!panel || !panelHasB2LevelAccordions(panel)) return null;
    if(b2LevelAccordionsComplete(panel)) return null;
    var target = panel.dataset.currentTarget || '';

    // Open Learning Outcomes accordion ? review each numbered outcome, then next accordion
    var openFocus = panel.querySelector('[data-b2l1-focus-list] .b2l1-item-btn.is-active:not(.is-complete)');
    if(openFocus){
      var focusDetail = openFocus.nextElementSibling;
      if(focusDetail && focusDetail.classList.contains('b2l1-focus-detail') && !focusDetail.hidden){
        var points = focusDetail.querySelectorAll('.b2l1-point-btn');
        for(var p = 0; p < points.length; p++){
          if(points[p].classList.contains('is-done')) continue;
          return sectionScrollStep('b2l-point', points[p], 'Review outcome ' + (p + 1), {
            scrollEl: points[p],
            scrollBlock: 'center',
            forceScroll: true,
            tone: 'expand',
            keyToken: target + ':b2l-point:' + (points[p].getAttribute('data-b2l1-point') || p)
          });
        }
      }
    }

    var focusBtns = panel.querySelectorAll('[data-b2l1-focus-list] .b2l1-item-btn');
    for(var i = 0; i < focusBtns.length; i++){
      if(focusBtns[i].classList.contains('is-complete')) continue;
      if(!isVisibleEl(focusBtns[i])) continue;
      return sectionScrollStep('b2l-focus', focusBtns[i], 'Open: ' + b2LevelItemLabel(focusBtns[i], 'learning outcome'), {
        scrollEl: focusBtns[i],
        scrollBlock: 'center',
        forceScroll: true,
        tone: 'expand',
        keyToken: target + ':b2l-focus:' + (focusBtns[i].getAttribute('data-b2l1-item') || i)
      });
    }

    var actBtns = panel.querySelectorAll('[data-b2l1-activities-list] .b2l1-item-btn');
    for(var j = 0; j < actBtns.length; j++){
      if(actBtns[j].classList.contains('is-complete')) continue;
      if(!isVisibleEl(actBtns[j])) continue;
      return sectionScrollStep('b2l-activity', actBtns[j], 'Open: ' + b2LevelItemLabel(actBtns[j], 'activity'), {
        scrollEl: actBtns[j],
        scrollBlock: 'center',
        forceScroll: true,
        tone: 'expand',
        keyToken: target + ':b2l-activity:' + (actBtns[j].getAttribute('data-b2l1-item') || j)
      });
    }

    return null;
  }

  function conceptReadyForFinishCue(panel){
    if(!panel) return false;
    syncPanelInPracticeDone(panel);
    if(getVisibleInsightPillars(panel).length) return false;
    if(!preKeyIdeasVisualsComplete(panel)) return false;
    if(hasUnclickedKeyIdeasInScope(panel)) return false;
    if(!inPracticeFlowComplete(panel)) return false;
    if(isActivityIncomplete(panel)) return false;
    // Parent hubs must finish leaves before Done
    if(parentHubHasIncompleteLeaves(panel)) return false;
    // Level shells: open every Learning Outcomes + Activities accordion first
    if(!b2LevelAccordionsComplete(panel)) return false;
    // Factor leaves: explore every factor (and its info cards) before Done
    if(!b3c2FactorExploreComplete(panel)) return false;
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

  function imgHasRealSrc(img){
    if(!img) return false;
    var src = (img.getAttribute('src') || '').trim();
    return !!src;
  }

  function panelHasExpandableVisual(panel){
    if(!panel) return false;
    var scope = getM5FlowScope(panel);
    if(scope.querySelector('.img-expand-btn')) return true;
    var imgs = scope.querySelectorAll(
      '[data-expandable-visual] img, .concept-section-card.section-visual-shell img, ' +
      '.concept-image img, [data-concept-intro-media] img, [data-concept-primary-image] img, ' +
      '.b3c2-concept-hero img, .m5-nested-visual-shell img, .m5-nested-visual-frame img'
    );
    for(var i = 0; i < imgs.length; i++){
      if(imgHasRealSrc(imgs[i]) && isVisibleEl(imgs[i])) return true;
    }
    return false;
  }

  function isNodeBefore(anchor, beforeNode){
    if(!anchor || !beforeNode) return true;
    if(anchor === beforeNode) return false;
    return (anchor.compareDocumentPosition(beforeNode) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  }

  function getPanelExpandButtons(panel){
    if(!panel) return [];
    var scope = getM5FlowScope(panel);
    // Nested M5: one primary visual cue ? don't require every fan thumb
    if(panelHasM5NestedNav(panel)){
      var screenId = getM5ScreenId(panel);
      if(isM5ItemDone(panel, 'flowM5VisualDone', screenId)) return [];
      var primary = scope.querySelector(
        '.m5-nested-visual-shell > .img-expand-btn, ' +
        '.m5-nested-visual-frame > .img-expand-btn, ' +
        '.m5-screen-visual-card .img-expand-btn, ' +
        '.concept-section-card.section-visual-shell .img-expand-btn, ' +
        '.b2c2-direct-image > .img-expand-btn, ' +
        '.b2c3-direct-image > .img-expand-btn'
      );
      if(primary && isVisibleEl(primary) && primary.getAttribute('data-visual-expanded') !== 'true'){
        return [primary];
      }
      var fan = scope.querySelector('.entry-exit-fan');
      if(fan){
        var fanBtn = fan.querySelector('.img-expand-btn:not([data-visual-expanded="true"])');
        if(fanBtn && isVisibleEl(fanBtn)) return [fanBtn];
        return [];
      }
      var leftover = Array.from(scope.querySelectorAll('.img-expand-btn')).filter(function(btn){
        return isVisibleEl(btn) && btn.getAttribute('data-visual-expanded') !== 'true';
      });
      return leftover.slice(0, 1);
    }
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

  function findAnyInPracticeAction(panel){
    if(!panel) return null;
    var scoped = findScopedInPracticeAction(panel);
    if(scoped) return scoped;
    var all = panel.querySelectorAll('.key-ideas-action');
    for(var i = 0; i < all.length; i++){
      if(all[i].hasAttribute('hidden')) continue;
      if(isVisibleEl(all[i])) return all[i];
    }
    return null;
  }

  function inPracticePartsActuallyComplete(inPractice){
    if(!inPractice) return true;
    if(global.InPracticeSystem){
      if(typeof InPracticeSystem.nextUnreviewedPart === 'function'){
        try {
          if(InPracticeSystem.nextUnreviewedPart(inPractice)) return false;
        } catch(errNext){}
      }
      if(typeof InPracticeSystem.partsComplete === 'function'){
        try { return !!InPracticeSystem.partsComplete(inPractice); } catch(errParts){}
      }
    }
    var parts = inPractice.querySelectorAll('[data-inprac-part]');
    if(!parts.length) return inPractice.classList.contains('is-completed');
    for(var i = 0; i < parts.length; i++){
      var part = parts[i];
      if(part.hasAttribute('hidden') || part.closest('[hidden]')) continue;
      if(!part.classList.contains('is-reviewed')) return false;
    }
    return true;
  }

  function inPracticeFlowComplete(panel){
    if(!panel) return true;
    ensureScopedInPracticeMounted(panel);
    syncPanelInPracticeDone(panel);
    var nestedAction = findScopedInPracticeAction(panel);
    var inPractice = nestedAction || findAnyInPracticeAction(panel);
    if(panel.dataset.inPracticeRequired === 'false' && !inPractice) return true;
    if(!inPractice){
      // Wait for static In Practice to mount on nested leaves that have Key Ideas
      if(scopeNeedsInPracticeMount(panel)) return false;
      // Nested screens without their own In Practice are complete for this leaf
      if(panelHasM5NestedNav(panel) && getM5ScreenId(panel) !== 'home') return true;
      // Required on this hub but not found yet ? do not skip to subconcepts
      if(panel.dataset.inPracticeRequired === 'true') return false;
      return true;
    }
    if(inPractice.hasAttribute('hidden')) return true;
    var current = getInPracticeScopeKey(panel);

    // Real cue state wins over stale __inPracticeDoneMap / data-inPracticeDone flags
    // (e.g. Overview of Emotional States showing 0/3 while flags still say done).
    if(!inPracticePartsActuallyComplete(inPractice)){
      inPractice.classList.remove('is-completed');
      if(panel.dataset.inPracticeDoneFor === current){
        panel.dataset.inPracticeDone = 'false';
        delete panel.dataset.inPracticeDoneFor;
      }
      if(panel.__inPracticeDoneMap && current) delete panel.__inPracticeDoneMap[current];
      return false;
    }

    if(panel.__inPracticeDoneMap && current && panel.__inPracticeDoneMap[current]) return true;
    if(inPractice.classList.contains('is-completed')){
      var doneFor = inPractice.dataset.inPracticeTarget || '';
      if(!doneFor || doneFor === current){
        markPanelInPracticeDone(panel, inPractice);
        return true;
      }
      // Stale parent completion left on a reused shell ? reset for this scope
      inPractice.classList.remove('is-completed');
      inPractice.querySelectorAll('[data-inprac-part].is-reviewed').forEach(function(part){
        part.classList.remove('is-reviewed');
        part.setAttribute('aria-pressed', 'false');
      });
    }
    if(panel.dataset.inPracticeDone === 'true' && panel.dataset.inPracticeDoneFor === current) return true;
    return false;
  }

  function ensurePanelVisualWired(panel){
    if(!panel) return;
    if(!global.ConceptVisualExpand || typeof ConceptVisualExpand.wire !== 'function') return;
    // Re-wire when media is injected after the first empty pass (e.g. b3c2 hero)
    if(wiredPanels.has(panel) && panel.querySelector('.img-expand-btn')) return;
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
      btn.closest('.b3c2-concept-hero') ||
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
    // Never re-pulse the overview photo while choosing the next subconcept tile
    if(hubSubconceptTourInProgress(panel)) return null;

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

    var ideas = collectGuideableKeyIdeas(panel);
    if(!ideas.length) return null;
    var idx = ideas[0].querySelector('.key-idea-index');
    return sectionScrollStep('keyidea', ideas[0], 'Review key idea ' + ((idx && idx.textContent.trim()) || '1'), {
      scrollEl: ideas[0],
      scrollBlock: 'center',
      forceScroll: true
    });
  }

  function resolveInPractice(panel){
    if(!panel) return null;
    ensureScopedInPracticeMounted(panel);
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

    var scopeKey = getInPracticeScopeKey(panel) + ':' + (inPractice.dataset.inPracticeTarget || '');
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

  function matchingSuccessFeedback(scope){
    if(!scope) return false;
    return !!scope.querySelector(
      '.concept-activity-interactive .feedback.show.good, ' +
      '.match-game ~ .feedback.show.good, ' +
      '.feedback.show.good, ' +
      '[data-activity-feedback].show.good, ' +
      '[data-activity-feedback].is-correct'
    );
  }

  function isMatchingActivityIncomplete(panel){
    if(!panel.querySelector('[data-matching-activity], [data-match-grid], [data-match-board], .matching-wrap, .match-game')) return false;

    // Prefer the visible activity shell so quiz / leftover slots outside it are ignored
    var scope = findActivityRoot(panel) || panel;

    // Success feedback wins ? do not require slot counts (avoids phantom empty slots)
    if(matchingSuccessFeedback(scope) || matchingSuccessFeedback(panel)) return false;

    // Wrong attempt still needs a retry
    if(scope.querySelector(
      '.concept-activity-interactive .feedback.show.warn, ' +
      '.feedback.show.warn, ' +
      '[data-activity-feedback].show.warn'
    )) return true;

    // Slot / chip placement games (e.g. Module 4 b1c3)
    var slots = scope.querySelectorAll('.match-game .match-slot');
    if(!slots.length){
      slots = panel.querySelectorAll('.concept-activity-interactive .match-game .match-slot');
    }
    if(slots.length){
      for(var s = 0; s < slots.length; s++){
        if(!slots[s].querySelector('.slot-drop .match-chip, .match-chip')) return true;
      }
      // All filled but no success feedback yet
      return true;
    }

    // Pair-click matching that syncs dataset.matchedCount
    var matchedCount = parseInt(panel.dataset.matchedCount, 10) || 0;
    var requiredMatches = countRequiredMatches(panel);
    if(requiredMatches) return matchedCount < requiredMatches;

    var actBlock = scope.querySelector('.concept-activity-interactive .match-game') ||
      panel.querySelector('.concept-activity-interactive .match-game');
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

    // Non-M5 / flat panels: only incomplete when explicitly marked false.
    // Missing choiceShellComplete on generic [data-concept-activity-title] must NOT block Done.
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

    var m5Mount = panel.querySelector('[data-m5-b2-choice-mount]');
    if(m5Mount && m5Mount.dataset.choiceShellComplete !== 'true') return true;

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
    if(panel.dataset.activityComplete === 'true' || panel.getAttribute('data-activity-complete') === 'true') return false;
    if(panel.dataset.categorizeComplete === 'true') return false;

    // Match / apply activities: green success feedback means the activity gate is done
    var activityRoot = findActivityRoot(panel);
    // Nested M5: only judge the active screen's activity (other leaves stay in the DOM)
    var gateRoot = activityRoot || panel;
    if(panelHasM5NestedNav(panel)){
      gateRoot = activityRoot || getM5FlowScope(panel) || panel;
    }
    if(activityRoot && activityRoot.querySelector('.match-game, [data-matching-activity], .matching-wrap') &&
      matchingSuccessFeedback(activityRoot)){
      return false;
    }
    if(activityRoot && activityRoot.querySelector('[data-categorize-activity]') &&
      (matchingSuccessFeedback(activityRoot) ||
        activityRoot.querySelector('[data-categorize-feedback].is-correct, [data-activity-feedback].is-correct, .feedback.show.good'))){
      return false;
    }

    if(isM5ChoiceShellIncomplete(panel)) return true;
    if(isVisibleActivityShellComplete(panel)) return false;

    if(gateRoot.querySelector('[data-carousel], [data-carousel-activity]') && panel.dataset.carouselComplete !== 'true') return true;
    if(gateRoot.querySelector('[data-choice-activity]') && panel.dataset.choiceComplete !== 'true'){
      if(!gateRoot.querySelector('[data-concept-activity-title][data-choice-shell-complete="true"], [data-m5-b2-nested-key][data-choice-shell-complete="true"]') &&
        !gateRoot.querySelector('[data-activity-feedback].is-correct, .feedback.show.good')) return true;
    }
    if(isMatchingActivityIncomplete(panel)) return true;
    if(gateRoot.querySelector('[data-categorize-activity]')){
      var catDone = panel.dataset.categorizeComplete === 'true' ||
        !!gateRoot.querySelector(
          '.feedback.show.good, [data-activity-feedback].is-correct, [data-categorize-feedback].is-correct'
        );
      if(!catDone) return true;
    }
    if(gateRoot.querySelector('[data-sequence-activity], [data-sequence-list]') && panel.dataset.sequenceComplete !== 'true') return true;
    if(gateRoot.querySelector('[data-reflect-continue]') && panel.dataset.reflectAckComplete !== 'true') return true;
    if(gateRoot.querySelector('[data-sense-card]:not(.flipped)')) return true;

    var interactives = gateRoot.querySelectorAll('.concept-activity-interactive[data-activity]');
    for(var i = 0; i < interactives.length; i++){
      if(!isInteractiveBlockComplete(interactives[i])) return true;
    }

    var root = activityRoot;
    if(root && root.querySelector('.option-grid input[type="radio"], .option-grid input[type="checkbox"]')){
      var shellFeedback = root.querySelector('.feedback.show.good, [data-activity-feedback].show.good, [data-activity-feedback].is-correct');
      if(!shellFeedback && !gateRoot.querySelector('.concept-activity-interactive[data-activity] .feedback.show.good')) return true;
    }

    return false;
  }

  function resolvePanelActivity(panel){
    if(!panel || !isActivityIncomplete(panel)) return null;
    // Keep the activity quiet until Explore the Factors is finished
    if(!b3c2FactorExploreComplete(panel)) return null;

    var root = findActivityRoot(panel);
    if(!root) return null;

    var hasWrong = !!panel.querySelector(
      '.concept-activity-interactive .feedback.show.warn, ' +
      '[data-activity-feedback].show.warn, ' +
      '.feedback.show.warn'
    );
    var started = panel.dataset.flowActivityStarted === 'true';
    var label = hasWrong
      ? 'Try again - fix the matches'
      : (started
        ? 'Complete the activity'
        : 'Complete the activity below');

    // Mid-activity clicks (match pairs, sort chips, etc.) must not force-scroll
    // the shell to center ? feedback growth + bumpFlowAdvance made it jump every tap.
    return sectionScrollStep(
      started || hasWrong ? 'activity-progress' : 'activity-intro',
      root,
      label,
      {
        tone: 'activity',
        scrollBlock: started ? 'nearest' : 'center',
        forceScroll: !started,
        noScroll: started,
        keyToken: (panel.dataset.currentTarget || '') + (hasWrong ? ':activity-retry' : ':activity')
      }
    );
  }

  function getSubconceptNav(panel){
    if(!panel) return null;
    var nav = panel.querySelector('[data-parent-subconcept-nav]:not([hidden])');
    if(nav && nav.querySelector('.concept-square[data-target], .overview-subconcept-btn, .b3c3-overview-step[data-target]')) return nav;
    var shell = panel.querySelector('.overview-subconcept-shell:not([hidden])');
    if(shell) return shell.querySelector('.overview-subconcept-grid') || shell;
    var overviewGrid = panel.querySelector('.overview-subconcept-grid');
    if(overviewGrid) return overviewGrid;
    // Term Review steps (and similar) may sit in the primary image slot
    var b3c3 = panel.querySelector('.b3c3-overview-list, .b3c3-overview-wrap');
    if(b3c3 && b3c3.querySelector('.concept-square[data-target], .b3c3-overview-step[data-target]')) return b3c3;
    return null;
  }

  function getNavTarget(btn){
    return btn.getAttribute('data-target') || btn.getAttribute('data-overview-subtarget') || '';
  }

  function stageIntroCardLabel(card){
    if(!card) return 'Review stage card';
    var key = card.getAttribute('data-stage-card') || '';
    if(key === 'looks') return 'Review: What this looks like';
    if(key === 'priorities') return 'Review: Instructor priorities';
    if(key === 'goal') return 'Review: Goal';
    var title = card.querySelector('.stage-intro-card-title');
    var text = title && title.textContent ? title.textContent.replace(/\s+/g, ' ').trim() : '';
    return text ? ('Review: ' + text) : 'Review stage card';
  }

  function resolveStageIntroCards(panel){
    if(!panel || panel.dataset.stageCardsRequired !== 'true') return null;
    if(panel.dataset.stageCardsDone === 'true') return null;
    var wrap = panel.querySelector('.stage-intro-wrap[aria-hidden="false"], .stage-intro-wrap:not([aria-hidden="true"])');
    if(wrap && !isVisibleEl(wrap)) return null;
    var cards = panel.querySelectorAll('.stage-intro-card[data-stage-card]');
    if(!cards.length) return null;
    for(var i = 0; i < cards.length; i++){
      if(cards[i].classList.contains('is-complete')) continue;
      if(!isVisibleEl(cards[i])) continue;
      return sectionScrollStep('stage-card', cards[i], stageIntroCardLabel(cards[i]), {
        scrollEl: cards[i],
        scrollBlock: 'center',
        forceScroll: true,
        tone: 'expand',
        keyToken: (panel.dataset.currentTarget || '') + ':stage-card:' + (cards[i].getAttribute('data-stage-card') || i)
      });
    }
    return null;
  }

  function resolveStageLevelPick(panel){
    if(!panel || panel.dataset.stageCardsRequired !== 'true') return null;
    if(panel.dataset.stageCardsDone !== 'true') return null;
    // Never pulse Swim Confidence / levels while Key Ideas or In Practice are still open
    if(!hubContentBeforeLeaves(panel)) return null;
    var levels = panel.querySelector('.levels-section');
    if(!levels || !isVisibleEl(levels) || levels.classList.contains('is-locked')) return null;
    var buttons = levels.querySelectorAll('.concept-square[data-target]');
    for(var i = 0; i < buttons.length; i++){
      var btn = buttons[i];
      if(btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true') continue;
      if(!isVisibleEl(btn)) continue;
      if(isConceptDone(btn)) continue;
      var label = (btn.textContent || '').replace(/\s+/g, ' ').trim() || 'Open next level';
      return sectionScrollStep('stage-level', btn, 'Open ' + label, {
        scrollEl: levels,
        scrollBlock: 'center',
        forceScroll: true,
        tone: 'expand',
        keyToken: (panel.dataset.currentTarget || '') + ':stage-level:' + (btn.getAttribute('data-target') || i)
      });
    }
    return null;
  }

  function resolveSubconceptNav(panel){
    if(!panel || !panel.classList.contains('show')) return null;
    var nav = getSubconceptNav(panel);
    if(!nav) return null;

    var navButtons = getSubconceptNavButtons(nav);
    if(!navButtons.length) return null;

    var current = panel.dataset.currentTarget || '';
    var isLeafTarget = navButtons.some(function(btn){ return getNavTarget(btn) === current; });
    // On a leaf: let leaf pillars / activity / Done run ? do not steal the pulse here
    if(isLeafTarget) return null;

    var unvisited = navButtons.filter(function(btn){
      return !isConceptDone(btn) && !isConceptLocked(btn, activeModuleConfig);
    });
    if(!unvisited.length) return null;

    var panelBlock = panel.getAttribute('data-panel-for');
    if(panelBlock && blockConceptsComplete(panelBlock)) return null;

    var btn = null;
    for(var i = 0; i < navButtons.length; i++){
      if(navButtons[i].classList.contains('is-next') && !isConceptDone(navButtons[i]) && !isConceptLocked(navButtons[i], activeModuleConfig)){
        btn = navButtons[i];
        break;
      }
    }
    if(!btn) btn = unvisited[0];

    return {
      kind: 'subconcept',
      el: btn,
      label: (btn.textContent || '').replace(/\s+/g, ' ').trim() || 'Choose the next subconcept'
    };
  }

  function parentHubContentReady(panel){
    if(!hubContentBeforeLeaves(panel)) return false;
    if(isActivityIncomplete(panel)) return false;
    return true;
  }

  /** Mid parent-hub tour (e.g. Calm done ? pulse Alert): skip re-opening overview expand. */
  function hubSubconceptTourInProgress(panel){
    if(!panel) return false;
    var nav = getSubconceptNav(panel);
    if(!nav || !isVisibleEl(nav)) return false;
    var buttons = getSubconceptNavButtons(nav);
    if(!buttons.length) return false;
    var current = panel.dataset.currentTarget || '';
    var onLeaf = buttons.some(function(btn){ return getNavTarget(btn) === current; });
    if(onLeaf) return false;
    var hasUnfinished = buttons.some(function(btn){
      return !isConceptDone(btn) && !isConceptLocked(btn, activeModuleConfig);
    });
    if(!hasUnfinished){
      delete panel.dataset.flowHubTour;
      return false;
    }
    if(panel.dataset.flowHubTour === '1') return true;
    // Only mid-tour after at least one leaf is done.
    // Do NOT treat a pre-marked is-next (e.g. Modelling) as tour-in-progress ?
    // that jumps the pulse past Core Concept cards on first entry.
    return buttons.some(function(btn){ return isConceptDone(btn); });
  }

  function resolveHubSubconceptStep(panel, moduleConfig){
    // Hard gate: never pulse Calm / Alert / Factors / etc. until hub content is ready
    if(!parentHubContentReady(panel)) return null;
    var parentSubconceptStep = resolveParentSubconceptResume(panel, moduleConfig);
    if(parentSubconceptStep) return withM5Tone(panel, parentSubconceptStep);
    var subconceptStep = resolveSubconceptNav(panel);
    if(!subconceptStep) return null;
    var btn = subconceptStep.el;
    var label = btn && btn.textContent ? btn.textContent.replace(/\s+/g, ' ').trim() : subconceptStep.label;
    return sectionScrollStep('subconcept', btn, label || subconceptStep.label, {
      scrollEl: btn.closest('.overview-subconcept-grid') || btn.closest('[data-parent-subconcept-nav]') || btn,
      scrollBlock: 'center',
      forceScroll: true,
      tone: 'expand'
    });
  }

  function resolveParentSubconceptResume(panel, moduleConfig){
    var panelBlock = panel && panel.getAttribute('data-panel-for');
    if(panelBlock && blockConceptsComplete(panelBlock)) return null;

    var nav = getSubconceptNav(panel);
    if(!nav) return null;

    var navButtons = getSubconceptNavButtons(nav);
    if(!navButtons.length) return null;

    // Only resume mid-tour after a leaf is actually done.
    // Pre-marked is-next (e.g. Physical Factors on first open) must NOT skip
    // Core Concept ? Visual ? Key Ideas ? In Practice on the parent hub.
    var hasPartialProgress = navButtons.some(function(btn){
      return isConceptDone(btn);
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

  function resolveResumeParentHub(block, moduleConfig){
    // Progress incomplete but every grid square looks done ? reopen a parent hub
    if(blockConceptsComplete(block)) return null;
    if(nextConceptInBlock(block, moduleConfig)) return null;

    var grid = document.querySelector('[data-concept-grid="' + block + '"]');
    if(!grid) return null;

    var parents = $$('.concept-square--parent[data-target], .concept-square[data-has-subconcepts]', grid);
    if(!parents.length){
      parents = getConceptButtons(block).filter(isConceptDone);
    }
    if(!parents.length) return null;

    var btn = parents[0];
    for(var i = 0; i < parents.length; i++){
      if(parents[i].classList.contains('active')){
        btn = parents[i];
        break;
      }
    }
    var label = (btn.textContent || '').replace(/\s+/g, ' ').trim();
    var gridFrame = getConceptGridScrollAnchor(block);
    return sectionScrollStep('concept', btn, (label ? ('Continue: ' + label) : 'Reopen this concept to finish its subconcepts'), {
      scrollEl: gridFrame || btn,
      scrollBlock: 'start',
      forceScroll: true,
      tone: 'expand',
      keyToken: block + ':resume-parent:' + (btn.getAttribute('data-target') || '')
    });
  }

  function resolveConceptPick(block, moduleConfig){
    if(getOpenPanel(block)) return null;
    return nextConceptInBlock(block, moduleConfig) || resolveResumeParentHub(block, moduleConfig);
  }

  function panelIncompleteTarget(panel){
    if(!panel) return null;

    syncM5AccentContext(panel);

    var panelBlock = panel.getAttribute('data-panel-for');
    if(panelBlock && blockConceptsComplete(panelBlock)) return null;

    // Returning from a leaf (Calm ? Alert, Water ? Env, etc.): pulse next tile, not overview photo.
    // Never skip Core Concept / visual / Key Ideas ? wait until hub content is ready.
    if(hubSubconceptTourInProgress(panel) && parentHubContentReady(panel)){
      var hubTourStep = resolveHubSubconceptStep(panel, activeModuleConfig);
      if(hubTourStep) return hubTourStep;
    }

    var pillars = getVisibleInsightPillars(panel);
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

    var stageCardStep = resolveStageIntroCards(panel);
    if(stageCardStep) return stageCardStep;

    var keyIdeaStep = resolveKeyIdeaItems(panel);
    if(keyIdeaStep) return withM5Tone(panel, keyIdeaStep);

    var b2LevelStep = resolveB2LevelAccordions(panel);
    if(b2LevelStep) return withM5Tone(panel, b2LevelStep);

    var inPracticeStep = resolveInPractice(panel);
    if(inPracticeStep) return withM5Tone(panel, inPracticeStep);

    // Pathway levels only after Key Ideas + In Practice (same rule as Calm / Factors)
    var stageLevelStep = resolveStageLevelPick(panel);
    if(stageLevelStep) return stageLevelStep;

    // Nested folders / flashcards / schedules ? only after Key Ideas + In Practice
    var m5NavStep = resolveM5NestedNav(panel);
    if(m5NavStep) return m5NavStep;

    // Factor groups: after the poster expand, before the activity
    var factorExploreStep = resolveB3c2FactorExplore(panel);
    if(factorExploreStep) return withM5Tone(panel, factorExploreStep);

    var preActivityVisualStep = resolveNextVisualExpand(panel, { phase: 'preActivity' });
    if(preActivityVisualStep) return withM5Tone(panel, preActivityVisualStep);

    var activityStep = resolvePanelActivity(panel);
    if(activityStep) return activityStep;

    var postActivityVisualStep = resolveNextVisualExpand(panel, { phase: 'postActivity' });
    if(postActivityVisualStep) return withM5Tone(panel, postActivityVisualStep);

    // Leaf finished ? pulse Back into the folder/home so nested flow continues
    var leafReturnStep = resolveM5LeafReturn(panel);
    if(leafReturnStep) return leafReturnStep;

    // Subconcepts only after parent hub content is ready (do not skip intro/activity)
    if(parentHubContentReady(panel)){
      var hubReadyStep = resolveHubSubconceptStep(panel, activeModuleConfig);
      if(hubReadyStep) return hubReadyStep;
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

  function bypassReflectionGate(block){
    var gate = document.querySelector('[data-gate="' + block + '"]');
    var lockBox = document.querySelector('[data-lock-box="' + block + '"]');
    var blockCheck = document.querySelector('input[data-check-for="' + block + '"], input[data-stage-check="' + block + '"]');
    if(lockBox){
      lockBox.classList.add('ready');
      var msg = lockBox.querySelector('.lock-message');
      if(msg) msg.innerHTML = '<strong>Unlocked.</strong> Mark this block complete to continue.';
    }
    if(gate){
      gate.classList.add('open');
      gate.setAttribute('data-reflection-bypassed', 'true');
      gate.hidden = true;
      var correct = gate.querySelector('input[type="radio"][value="correct"]');
      if(correct && !correct.checked){
        correct.checked = true;
        try {
          correct.dispatchEvent(new Event('change', { bubbles: true }));
        } catch(err){}
      }
      var feedback = gate.querySelector('.feedback, [data-feedback]');
      if(feedback) feedback.className = 'feedback show good';
    }
    if(blockCheck) blockCheck.disabled = false;
  }

  function resolveReflectionCheckpoint(block){
    if(!blockConceptsComplete(block)) return null;

    // Reflection checkpoints removed: unlock and pulse the block Done checkbox
    bypassReflectionGate(block);

    var blockCheck = document.querySelector('input[data-check-for="' + block + '"], input[data-stage-check="' + block + '"]');
    if(blockCheck && isChecked(blockCheck)) return null;

    if(blockCheck && !isChecked(blockCheck)){
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
        card.setAttribute('aria-pressed', 'true');
      } else {
        card.classList.remove('clicked');
        card.classList.add('clickable-progress');
        card.setAttribute('aria-pressed', 'false');
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
    var doneFor = getInPracticeScopeKey(panel) ||
      (action && action.dataset.inPracticeTarget) ||
      panel.dataset.currentTarget || '';
    if(doneFor){
      panel.dataset.inPracticeDoneFor = doneFor;
      if(action) action.dataset.inPracticeTarget = doneFor;
      if(!panel.__inPracticeDoneMap) panel.__inPracticeDoneMap = {};
      panel.__inPracticeDoneMap[doneFor] = true;
    }
    try {
      panel.setAttribute('data-in-practice-done', 'true');
    } catch (err) {}
  }

  function syncPanelInPracticeDone(panel){
    if(!panel) return false;
    var current = getInPracticeScopeKey(panel);
    if(panelHasM5NestedNav(panel) && current && current !== (panel.dataset.currentTarget || '')){
      // Nested leaf scope is independent of parent concept In Practice flags
      if(panel.__inPracticeDoneMap && panel.__inPracticeDoneMap[current]){
        panel.dataset.inPracticeDone = 'true';
        panel.dataset.inPracticeDoneFor = current;
        return true;
      }
      var nestedOnly = findScopedInPracticeAction(panel);
      if(!nestedOnly){
        // Pending mount ? complete; leave panel flags cleared for this scope
        if(scopeNeedsInPracticeMount(panel)){
          panel.dataset.inPracticeDone = 'false';
          delete panel.dataset.inPracticeDoneFor;
          return false;
        }
        return true;
      }
      if(nestedOnly.classList.contains('is-completed') &&
        (nestedOnly.dataset.inPracticeTarget || '') === current){
        markPanelInPracticeDone(panel, nestedOnly);
        return true;
      }
      if(panel.dataset.inPracticeDoneFor !== current){
        panel.dataset.inPracticeDone = 'false';
        delete panel.dataset.inPracticeDoneFor;
      }
      return false;
    }
    if(panel.dataset.inPracticeRequired !== 'true') return true;
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
    var action = findScopedInPracticeAction(panel);
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
      card.setAttribute('aria-pressed', 'true');
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
      card.setAttribute('aria-pressed', 'true');
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
      card.setAttribute('aria-pressed', 'false');
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

    var b2LevelHold = resolveB2LevelAccordions(panel);
    if(b2LevelHold) return b2LevelHold;

    var factorHold = resolveB3c2FactorExplore(panel);
    if(factorHold) return factorHold;

    if(isActivityIncomplete(panel) && b3c2FactorExploreComplete(panel)){
      var root = findActivityRoot(panel);
      if(root){
        var wrong = !!panel.querySelector('.feedback.show.warn, [data-activity-feedback].show.warn');
        var activityStarted = panel.dataset.flowActivityStarted === 'true';
        return sectionScrollStep('activity-hold', root, wrong ? 'Try again - fix the matches' : 'Complete the activity', {
          scrollEl: root,
          scrollBlock: activityStarted ? 'nearest' : 'center',
          forceScroll: !activityStarted,
          noScroll: activityStarted,
          tone: 'activity',
          pulseEls: [root],
          keyToken: target + (wrong ? ':activity-retry-hold' : ':activity-hold')
        });
      }
    }

    // Module 4 pathway stage shells only (not Module 5 flat/nested b2c1?b2c3)
    if(panel.dataset.stageCardsRequired === 'true' ||
      (panel.hasAttribute('data-stage-theme') && /^b2c[123]$/.test(target))){
      var levelPick = resolveStageLevelPick(panel);
      if(levelPick) return levelPick;
      return null;
    }

    // Module 5 nested hubs: keep hold on the open nest instead of falling through to the grid
    if(panelHasM5NestedNav(panel)){
      var m5Hold = resolveM5NestedNav(panel);
      if(m5Hold) return m5Hold;
      var m5LeafHold = resolveM5LeafReturn(panel);
      if(m5LeafHold) return m5LeafHold;
    }

    var finish = panel.querySelector('[data-finish-concept]');
    if(finish && conceptReadyForFinishCue(panel)){
      var finishVisible = isVisibleEl(finish) && finish.style.display !== 'none';
      var host = finishVisible ? finish : (panel.querySelector('.concept-media-actions') || panel);
      return sectionScrollStep('finish-hold', host, finish.disabled ? 'Done unlocks next ? keep going' : 'Tap Done to finish this concept', {
        scrollEl: host,
        scrollBlock: 'nearest',
        forceScroll: false,
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

  function resolveProgrammeJourneyTour(block, moduleConfig){
    if(!block || !moduleConfig || moduleConfig.pathwayBlock !== block) return null;
    if(getOpenPanel(block)) return null;

    var map = document.querySelector('#' + block + ' [data-programme-journey-map]') ||
      document.querySelector('[data-programme-journey-map]');
    if(!map || !isVisibleEl(map)) return null;

    // Only skip the overview tour when it was actually finished (not merely because a stage tile looks visited)
    if(map.getAttribute('data-pjm-tour-complete') === 'true') return null;
    if(!global.ProgrammeJourneyMap || typeof global.ProgrammeJourneyMap.getNextTourTarget !== 'function') return null;

    var next = global.ProgrammeJourneyMap.getNextTourTarget(map);
    if(!next || !next.el) return null;

    var label = next.label || ('Tap Level ' + next.level);
    return sectionScrollStep('pjm-level', next.el, label, {
      scrollEl: next.el.closest('.pjm-stage') || map,
      scrollBlock: 'center',
      forceScroll: true,
      tone: 'expand',
      keyToken: block + ':pjm-level:' + next.level
    });
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

    var journeyTourStep = resolveProgrammeJourneyTour(block, moduleConfig);
    if(journeyTourStep) return journeyTourStep;

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
      var resumeParent = resolveResumeParentHub(block, moduleConfig);
      if(resumeParent) return resumeParent;
      var lockBox = document.querySelector('[data-lock-box="' + block + '"]');
      if(lockBox){
        return sectionScrollStep('block-progress', lockBox, 'Finish all concepts in this block', {
          scrollEl: lockBox,
          scrollBlock: 'start',
          forceScroll: true
        });
      }
      var headFallback = document.querySelector('#' + block + ' .block-part-head') || document.getElementById(block);
      if(headFallback){
        return sectionScrollStep('block-progress', headFallback, 'Continue this block', {
          scrollEl: document.getElementById(block) || headFallback,
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

    // Concepts done and checkbox already marked ? treat as waiting for UI sync
    var blockCheck = document.querySelector('input[data-check-for="' + block + '"], input[data-stage-check="' + block + '"]');
    if(blockCheck && !isChecked(blockCheck)){
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
    return null;
  }

  function resolveKeyIdeasRecapSection(sectionId){
    if(sectionId !== 'recap' && sectionId !== 'keyideas') return null;
    if(!isModuleStarted()) return null;
    if(!isChecked($('input[data-stage-check="journey"]'))) return null;
    if(!isChecked($('input[data-stage-check="outcomes"]'))) return null;
    if(!insideModuleReviewed()) return null;

    var section = document.getElementById(sectionId);
    if(!section || section.classList.contains('gated-locked')) return null;

    var check = section.querySelector('input[data-stage-check="' + sectionId + '"]') ||
      $('input[data-stage-check="' + sectionId + '"]');
    if(check && isChecked(check)) return null;

    var cards = section.querySelectorAll(
      '.recap-stack--key-ideas .recap-takeaway-card, ' +
      '.recap-stack--key-ideas .recap-card.clickable-progress, ' +
      '#recap .recap-takeaway-card, #keyideas .recap-takeaway-card'
    );
    for(var i = 0; i < cards.length; i++){
      if(cards[i].classList.contains('clicked')) continue;
      if(!isVisibleEl(cards[i])) continue;
      var title = cards[i].querySelector('.recap-takeaway-card__title, h4');
      var label = title && title.textContent
        ? ('Read: ' + title.textContent.replace(/\s+/g, ' ').trim())
        : ('Review key idea ' + (i + 1));
      return sectionScrollStep('recap-idea', cards[i], label, {
        scrollEl: cards[i],
        scrollBlock: 'center',
        forceScroll: true,
        tone: 'expand',
        keyToken: sectionId + ':idea:' + i
      });
    }

    if(check && !isChecked(check)){
      if(isDisabled(check)){
        return sectionScrollStep('recap-wait', section, 'Spend a moment reviewing these key ideas', {
          scrollEl: section.querySelector('.recap-stack--key-ideas') || section,
          scrollBlock: 'start',
          forceScroll: true,
          tone: 'expand',
          keyToken: sectionId + ':wait'
        });
      }
      return sectionScrollStep('recap-check', check.closest('.check-item') || check, 'Confirm you have reviewed the key ideas', {
        scrollEl: check.closest('.key-ideas-recap__footer') || check.closest('.check-item') || check,
        scrollBlock: 'center',
        forceScroll: true,
        tone: 'primary',
        keyToken: sectionId + ':check'
      });
    }

    return null;
  }

  function findStartQuizButton(){
    var scopes = [];
    var complete = document.getElementById('complete');
    var keyideas = document.getElementById('keyideas');
    if(complete && !complete.classList.contains('gated-locked')) scopes.push(complete);
    if(keyideas && !keyideas.classList.contains('gated-locked')) scopes.push(keyideas);
    for(var i = 0; i < scopes.length; i++){
      var btn = scopes[i].querySelector(
        '.completion-actions a[href="#quiz"], a.btn.btn-primary[href="#quiz"], .btn-start-quiz, [data-start-quiz]'
      );
      if(btn && isVisibleEl(btn)) return btn;
    }
    return null;
  }

  function isQuizStarted(){
    var quiz = document.getElementById('quiz');
    if(!quiz) return false;
    if(quiz.classList.contains('quiz-visible')) return true;
    if(!quiz.classList.contains('gated-locked') && window.location.hash === '#quiz') return true;
    var completeCheck = document.querySelector('input[data-stage-check="complete"]');
    if(completeCheck && isChecked(completeCheck)) return true;
    return false;
  }

  function resolveStartQuizStep(){
    if(isQuizStarted()) return null;
    var btn = findStartQuizButton();
    if(!btn) return null;
    return sectionScrollStep('start-quiz', btn, 'Start Quiz', {
      scrollEl: btn.closest('.completion') || btn.closest('.completion-actions') || btn,
      scrollBlock: 'center',
      forceScroll: true,
      tone: 'primary',
      pulseEls: [btn],
      keyToken: 'start-quiz'
    });
  }

  function resolveSectionStage(sectionId){
    if(sectionId.indexOf('block') === 0) return null;
    if(!isModuleStarted()) return null;
    if(!isChecked($('input[data-stage-check="journey"]'))) return null;
    if(!isChecked($('input[data-stage-check="outcomes"]'))) return null;
    if(!insideModuleReviewed()) return null;

    var recapStep = resolveKeyIdeasRecapSection(sectionId);
    if(recapStep) return recapStep;

    // Completion CTA: pulse the real Start Quiz button (never the sidebar Quiz nav link)
    if(sectionId === 'complete'){
      return resolveStartQuizStep();
    }

    // M4: Start Quiz sits under Key Ideas after the takeaway check
    if(sectionId === 'keyideas'){
      var keyideasCheck = $('input[data-stage-check="keyideas"]');
      if(keyideasCheck && !isChecked(keyideasCheck)){
        if(isDisabled(keyideasCheck)){
          var keyideasSection = document.getElementById('keyideas');
          return sectionScrollStep('recap-wait', keyideasSection || keyideasCheck, 'Spend a moment reviewing these key ideas', {
            scrollEl: (keyideasSection && keyideasSection.querySelector('.recap-stack--key-ideas')) || keyideasSection || keyideasCheck,
            scrollBlock: 'start',
            forceScroll: true,
            tone: 'expand',
            keyToken: 'keyideas:wait'
          });
        }
        return sectionScrollStep('recap-check', keyideasCheck.closest('.check-item') || keyideasCheck, 'Confirm you have reviewed the key ideas', {
          scrollEl: keyideasCheck.closest('.key-ideas-recap__footer') || keyideasCheck.closest('.check-item') || keyideasCheck,
          scrollBlock: 'center',
          forceScroll: true,
          tone: 'primary',
          keyToken: 'keyideas:check'
        });
      }
      var keyideasStart = resolveStartQuizStep();
      if(keyideasStart) return keyideasStart;
      return null;
    }

    if(sectionId === 'quiz'){
      var beforeQuiz = resolveStartQuizStep();
      if(beforeQuiz) return beforeQuiz;
      var quiz = $('#quiz');
      if(!quiz || quiz.classList.contains('gated-locked')) return null;
      var quizTarget = quiz.querySelector('.quiz-inline, .quiz-hero, .q-card, .quiz-embed') || quiz;
      return sectionScrollStep('quiz', quizTarget, 'Complete the module quiz', {
        scrollEl: quiz,
        scrollBlock: 'start',
        forceScroll: true,
        tone: 'primary',
        keyToken: 'quiz'
      });
    }

    var check = $('input[data-stage-check="' + sectionId + '"]');
    if(!check || isChecked(check)) return null;
    if(isDisabled(check)) return null;

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
    var openKey = typeof global.ModuleBlockAccordion.getOpen === 'function'
      ? global.ModuleBlockAccordion.getOpen()
      : null;
    // Guided flow: keep fans closed after Done ? learner clicks the next block head
    if(openKey && isBlockFullyComplete(openKey)){
      if(typeof global.ModuleBlockAccordion.closeAll === 'function'){
        try{ global.ModuleBlockAccordion.closeAll({ scroll: false }); }catch(err){}
      } else if(typeof global.ModuleBlockAccordion.setOpen === 'function'){
        try{ global.ModuleBlockAccordion.setOpen(null, { scroll: false }); }catch(err){}
      }
    }
  }

  function ensurePostBlockSectionsReachable(moduleConfig){
    if(!allBlocksComplete(moduleConfig)) return;
    var sections = (moduleConfig && moduleConfig.sections) || [];
    for(var i = 0; i < sections.length; i++){
      var id = sections[i];
      if(id.indexOf('block') === 0) continue;
      if(id === 'journey' || id === 'outcomes' || id === 'inside-module') continue;
      var section = document.getElementById(id);
      if(section && section.classList.contains('gated-locked')){
        section.classList.remove('gated-locked');
      }
    }
  }

  function resolveSafetyNetStep(moduleConfig){
    var earliest = getEarliestIncompleteBlock(moduleConfig);
    if(!earliest) return null;
    if(isBlockSectionLocked(earliest)){
      var locked = document.getElementById(earliest);
      if(locked){
        return sectionScrollStep('block-open', locked, 'Continue to ' + getBlockDisplayName(earliest), {
          scrollEl: locked,
          scrollBlock: 'start',
          forceScroll: true
        });
      }
      return null;
    }
    var step = resolveBlock(earliest, moduleConfig);
    if(step) return step;
    var head = document.querySelector('#' + earliest + ' .block-part-head') || document.getElementById(earliest);
    if(head){
      return sectionScrollStep('block-open', head, 'Open ' + getBlockDisplayName(earliest), {
        scrollEl: document.getElementById(earliest) || head,
        scrollBlock: 'start',
        forceScroll: true,
        tone: 'primary'
      });
    }
    return null;
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

    if(!allBlocksComplete(moduleConfig)){
      return resolveSafetyNetStep(moduleConfig);
    }

    ensurePostBlockSectionsReachable(moduleConfig);

    var sections = moduleConfig.sections || [];
    for(var s = 0; s < sections.length; s++){
      var id = sections[s];
      if(id.indexOf('block') === 0) continue;
      if(id === 'journey' || id === 'outcomes' || id === 'inside-module') continue;
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
      'recap-idea': true,
      'outcome': true,
      'pillar': true,
      'concept': true,
      'subconcept': true,
      'stage-card': true,
      'stage-level': true,
      'pjm-level': true,
      'b2l-focus': true,
      'b2l-point': true,
      'b2l-activity': true,
      'b3c2-factor': true,
      'b3c2-factor-info': true,
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
    module: '45, 132, 179',       /* club / hub / journey / recap */
    foundations: '234, 143, 34',  /* Block 1 ? orange (not module blue) */
    core: '123, 47, 161',         /* Block 2 ? purple */
    pathway: '26, 92, 56',        /* Block 3 ? green */
    progress: '212, 168, 35'      /* Block 4 ? yellow */
  };

  /* Shared blue for Start Module ? Journey ? Outcomes ? Inside This Module (all modules). */
  var PREAMBLE_ACCENT_RGB = '36, 118, 168';
  var PREAMBLE_KINDS = {
    'start-module': true,
    'journey-read': true,
    'journey-wait': true,
    'journey-check': true,
    'outcome': true,
    'outcomes-wait': true,
    'outcomes-check': true,
    'inside-module': true
  };

  var STAGE_THEME_RGB = {
    confidence: '26, 92, 56',
    basic: '201, 120, 22',
    structured: '53, 105, 149',
    core: '138, 63, 176'
  };

  /* Swim Structure journey map ? pulse matches each level accent */
  var PJM_LEVEL_RGB = {
    1: '22, 138, 74',
    2: '22, 138, 74',
    3: '196, 127, 18',
    4: '196, 127, 18',
    5: '45, 132, 179',
    6: '45, 132, 179'
  };

  function isPreambleStep(step){
    return !!(step && step.kind && PREAMBLE_KINDS[step.kind]);
  }

  function detectBlockVariant(blockId){
    if(!blockId) return null;
    var section = document.getElementById(blockId);
    if(section){
      var classes = section.className || '';
      var m = classes.match(/block-part--([a-z]+)/);
      if(m) return m[1];
      var attr = section.getAttribute('data-block-variant');
      if(attr && VARIANT_RGB[attr]) return attr;
    }
    // Fallback by block number when accordion class has not been applied yet
    var n = parseInt(String(blockId).replace(/\D/g, ''), 10);
    if(n === 1) return 'foundations';
    if(n === 2) return 'core';
    if(n === 3) return 'pathway';
    if(n === 4) return 'progress';
    var order = (activeModuleConfig && activeModuleConfig.blocks) || [];
    var idx = order.indexOf(blockId);
    return ['foundations', 'core', 'pathway', 'progress'][idx >= 0 ? idx % 4 : 0];
  }

  function syncGuidedAccent(step){
    var root = document.documentElement;

    // Keep module-front pulses the same blue everywhere ? never inherit an open block colour.
    if(isPreambleStep(step)){
      root.setAttribute('data-guided-block-variant', 'module');
      root.setAttribute('data-guided-phase', 'preamble');
      root.removeAttribute('data-guided-stage-theme');
      root.style.setProperty('--flow-accent-rgb', PREAMBLE_ACCENT_RGB);
      return;
    }
    root.removeAttribute('data-guided-phase');
    if(!step){
      root.setAttribute('data-guided-block-variant', 'module');
      root.removeAttribute('data-guided-stage-theme');
      root.style.setProperty('--flow-accent-rgb', VARIANT_RGB.module);
      return;
    }

    var blockId = null;
    if(step.scrollBlockId) blockId = step.scrollBlockId;
    if(!blockId && step && step.el && step.el.closest){
      var part = step.el.closest('[data-block-part], section[id^="block"]');
      if(part) blockId = part.getAttribute('data-block-part') || part.id;
    }
    if(!blockId){
      var openPart = document.querySelector('.section.block-part.is-open[data-block-part]');
      if(openPart) blockId = openPart.getAttribute('data-block-part');
    }
    var openPanel = getActiveOpenPanel();
    if(!blockId && openPanel) blockId = openPanel.getAttribute('data-panel-for');

    var variant = blockId
      ? (detectBlockVariant(blockId) || 'foundations')
      : 'module';
    root.setAttribute('data-guided-block-variant', variant);

    var accentRgb = VARIANT_RGB[variant] || VARIANT_RGB.module;
    var panel = (step && step.el && step.el.closest && step.el.closest('.concept-panel')) || openPanel;
    if(panel){
      var stageTheme = panel.getAttribute('data-stage-theme') || panel.dataset.stageTheme || '';
      if(stageTheme && STAGE_THEME_RGB[stageTheme]){
        accentRgb = STAGE_THEME_RGB[stageTheme];
        root.setAttribute('data-guided-stage-theme', stageTheme);
      } else {
        root.removeAttribute('data-guided-stage-theme');
      }
      /*
       * Pulse colour priority:
       * 1) Module 5 folder/tile accent (only special case)
       * 2) Stage theme (Module 4 journey stages)
       * 3) Block variant (foundations orange / core purple / pathway green / progress gold)
       * Key Ideas / Core Concept chrome stays brand blue in CSS; pulse follows place colour.
       */
      var m5Accent = panel.dataset && panel.dataset.flowM5AccentRgb;
      var navTile = step && step.el && (
        step.kind === 'm5-nested-nav' || step.tone === 'm5-nav' || step.kind === 'm5-nested-return'
      ) ? step.el : null;
      var tileAccent = navTile ? getM5NavAccent(navTile) : '';
      if(tileAccent){
        accentRgb = tileAccent;
        root.style.setProperty('--flow-m5-accent-rgb', tileAccent);
        root.setAttribute('data-guided-m5-folder', (panel.dataset && panel.dataset.flowM5Root) || 'tile');
      } else if(m5Accent){
        accentRgb = m5Accent;
        root.style.setProperty('--flow-m5-accent-rgb', m5Accent);
        root.setAttribute('data-guided-m5-folder', panel.dataset.flowM5Root || '1');
      } else {
        root.removeAttribute('data-guided-m5-folder');
        root.style.removeProperty('--flow-m5-accent-rgb');
        // Keep block/stage accent already resolved above (do not force brand blue)
      }
    } else {
      root.removeAttribute('data-guided-stage-theme');
      root.removeAttribute('data-guided-m5-folder');
    }

    var pjmEl = step && step.el && (
      (step.el.classList && (step.el.classList.contains('pjm-level-card') || step.el.classList.contains('pjm-ocean-node')))
        ? step.el
        : (step.el.closest && step.el.closest('.pjm-level-card[data-level], .pjm-ocean-node[data-level]'))
    );
    if(step && (step.kind === 'pjm-level' || pjmEl)){
      var pjmLevel = Number((pjmEl || step.el).getAttribute('data-level'));
      if(PJM_LEVEL_RGB[pjmLevel]){
        accentRgb = PJM_LEVEL_RGB[pjmLevel];
        root.setAttribute('data-guided-pjm-level', String(pjmLevel));
      }
    } else {
      root.removeAttribute('data-guided-pjm-level');
    }

    root.style.setProperty('--flow-accent-rgb', accentRgb);
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
      // Ring only ? avoid host animation + ring stacking ("double pulse")
      el.classList.add('flow-guide-pulse--ring-host');
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
    if(!isFlowGuideActive()){
      suppressFlowGuideChrome();
      return;
    }
    if(!moduleConfig) return;
    syncBlockIntroVisualState();
    var openPanel = getActiveOpenPanel();
    if(openPanel){
      syncM5AccentContext(openPanel);
      resetPanelFlowScope(openPanel);
      syncParentHubFinishGate(openPanel);
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
        target.classList.contains('is-complete') ||
        target.classList.contains('is-done') ||
        target.classList.contains('is-active') ||
        target.classList.contains('is-selected') ||
        target.classList.contains('is-correct')
      )) return false;
      // Ignore only pure pulse/ring class noise
      if(target.classList && target.classList.contains(PULSE_CLASS)){
        var meaningful = target.classList.contains('is-reviewed') ||
          target.classList.contains('clicked') ||
          target.classList.contains('is-completed') ||
          target.classList.contains('is-complete') ||
          target.classList.contains('is-done');
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

  /** Drop premature is-next on Calm / Factors / overview tiles until hub content is ready. */
  function syncPrematureHubNextMarkers(panel){
    if(!panel) return;
    if(hubContentBeforeLeaves(panel)) return;
    var nav = getSubconceptNav(panel);
    if(nav){
      getSubconceptNavButtons(nav).forEach(function(btn){
        btn.classList.remove('is-next');
      });
    }
    // Module 1 / Training II overview subtargets
    panel.querySelectorAll('.overview-subconcept-btn.is-next, [data-overview-subtarget].is-next').forEach(function(btn){
      btn.classList.remove('is-next');
    });
    // Module 4 pathway level squares / Term Review steps
    panel.querySelectorAll('.levels-section .concept-square.is-next, .b3c3-overview-step.is-next').forEach(function(btn){
      btn.classList.remove('is-next');
    });
  }

  function isHubLeafEntryControl(el){
    if(!el || !el.closest) return false;
    if(el.closest('.b2-nav')) return false;
    if(el.tagName === 'A' && el.getAttribute('href') && !el.getAttribute('data-target')) return false;
    return !!(
      el.closest('[data-parent-subconcept-nav] .concept-square[data-target]') ||
      el.closest('.b3c3-overview-step[data-target]') ||
      el.closest('.overview-subconcept-btn[data-overview-subtarget], .overview-subconcept-btn[data-parent-subtarget]') ||
      el.closest('.b2c2-folder-tile[data-b2-go], .b2c3-flash-tile[data-b2-go]') ||
      el.closest('.b2pl-cat-grid .b2pl-lvl-btn[data-b2-go], .b2pl-folder-grid .b2pl-lvl-btn[data-b2-go]') ||
      el.closest('.levels-section .concept-square[data-target]')
    );
  }

  function syncParentHubFinishGate(panel){
    if(!panel) return;
    syncPrematureHubNextMarkers(panel);
    var finish = panel.querySelector('[data-finish-concept]');
    if(!finish) return;
    if(parentHubHasIncompleteLeaves(panel)){
      finish.disabled = true;
      finish.setAttribute('data-flow-parent-leaf-gate', '1');
      if((finish.textContent || '').trim() === 'Done' || finish.getAttribute('data-flow-parent-leaf-gate') === '1'){
        finish.textContent = 'Complete all subconcepts first';
      }
      finish.style.opacity = '.55';
      finish.style.cursor = 'not-allowed';
    } else if(finish.getAttribute('data-flow-parent-leaf-gate') === '1'){
      finish.removeAttribute('data-flow-parent-leaf-gate');
    }

    if(panelHasB2LevelAccordions(panel) && !b2LevelAccordionsComplete(panel)){
      finish.disabled = true;
      finish.setAttribute('data-flow-b2l-gate', '1');
      finish.textContent = 'Open all sections first';
      finish.style.opacity = '.55';
      finish.style.cursor = 'not-allowed';
    } else if(finish.getAttribute('data-flow-b2l-gate') === '1'){
      finish.removeAttribute('data-flow-b2l-gate');
      if(!finish.getAttribute('data-flow-parent-leaf-gate')){
        finish.disabled = false;
        finish.textContent = 'Done';
        finish.style.opacity = '';
        finish.style.cursor = '';
      }
    }
  }

  function bindConceptFlowInteractions(moduleConfig){
    document.addEventListener('click', function(e){
      var finishGate = e.target && e.target.closest ? e.target.closest('[data-finish-concept]') : null;
      if(finishGate){
        var gatePanel = finishGate.closest('.concept-panel.show');
        if(gatePanel && (parentHubHasIncompleteLeaves(gatePanel) || !b2LevelAccordionsComplete(gatePanel))){
          e.preventDefault();
          e.stopPropagation();
          if(typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
          syncParentHubFinishGate(gatePanel);
          bumpFlowAdvance(moduleConfig, 80);
          return;
        }
      }
    }, true);

    // Hard stop: do not open Calm / Factors / Steps / folders / levels before
    // Core Concept ? Visual ? Key Ideas ? In Practice
    document.addEventListener('click', function(e){
      var leafEntry = e.target && e.target.closest ? e.target.closest(
        '[data-parent-subconcept-nav] .concept-square[data-target], ' +
        '[data-parent-subconcept-nav] .b3c3-overview-step[data-target], ' +
        '.b3c3-overview-step.concept-square[data-target], ' +
        '.overview-subconcept-btn[data-overview-subtarget], .overview-subconcept-btn[data-parent-subtarget], ' +
        '.b2c2-folder-tile[data-b2-go], .b2c3-flash-tile[data-b2-go], ' +
        '.b2pl-cat-grid .b2pl-lvl-btn[data-b2-go], .b2pl-folder-grid .b2pl-lvl-btn[data-b2-go], ' +
        '.levels-section .concept-square[data-target]'
      ) : null;
      if(!leafEntry || !isHubLeafEntryControl(leafEntry)) return;
      var leafPanel = leafEntry.closest('.concept-panel.show');
      if(!leafPanel) return;
      if(hubContentBeforeLeaves(leafPanel)) return;
      e.preventDefault();
      e.stopPropagation();
      if(typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      syncPrematureHubNextMarkers(leafPanel);
      bumpFlowAdvance(moduleConfig, 60);
    }, true);

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
              // Only mark leaf complete when Visual ? Key Ideas ? In Practice ? activity are done
              if(isM5LeafFlowComplete(navPanel)){
                markM5ItemDone(navPanel, 'flowM5CatsDone', fromScreen);
                markM5ItemDone(navPanel, 'flowM5LeafReturned', fromScreen);
              }
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

      var recapIdea = e.target.closest && e.target.closest(
        '.recap-takeaway-card, .recap-stack--key-ideas .recap-card.clickable-progress'
      );
      if(recapIdea){
        setTimeout(function(){
          bumpFlowAdvance(moduleConfig, 140);
        }, 0);
      }

      var panel = e.target.closest && e.target.closest('.concept-panel.show');
      if(!panel) return;

      var pillar = e.target.closest && e.target.closest('.concept-insight-pillar');
      if(pillar && panel.contains(pillar)){
        bumpFlowAdvance(moduleConfig, 120);
      }

      var stageCard = e.target.closest && e.target.closest('.stage-intro-card[data-stage-card]');
      if(stageCard && panel.contains(stageCard)){
        setTimeout(function(){
          bumpFlowAdvance(moduleConfig, 120);
        }, 0);
      }

      var b2lHit = e.target.closest && e.target.closest('.b2l1-item-btn, .b2l1-point-btn');
      if(b2lHit && panel.contains(b2lHit) && panelHasB2LevelAccordions(panel)){
        setTimeout(function(){
          syncParentHubFinishGate(panel);
          bumpFlowAdvance(moduleConfig, 140);
        }, 0);
      }

      var factorHit = e.target.closest && e.target.closest('.b3c2-factor-box, .b3c2-factor-info-card');
      if(factorHit && panel.contains(factorHit) && panelHasB3c2FactorExplore(panel)){
        setTimeout(function(){
          bumpFlowAdvance(moduleConfig, 140);
        }, 0);
      }

      var keyIdea = e.target.closest && e.target.closest('.key-idea-item');
      if(keyIdea && panel.contains(keyIdea)){
        bumpFlowAdvance(moduleConfig, 120);
      }

      var expandHit = e.target.closest && e.target.closest(
        '.img-expand-btn, .m5-nested-visual-frame.flow-guide-pulse, .entry-exit-fan.flow-guide-pulse, .entry-exit-fan-item.flow-guide-pulse'
      );
      if(expandHit && panelHasM5NestedNav(panel) && panel.contains(expandHit)){
        markM5VisualReviewed(panel);
        bumpFlowAdvance(moduleConfig, 160);
      }

      var activityRoot = findActivityRoot(panel);
      if(activityRoot && activityRoot.contains(e.target)){
        if(panel.dataset.flowActivityStarted !== 'true'){
          panel.dataset.flowActivityStarted = 'true';
        }
        // Defer past target/bubble handlers (e.g. match place + checkMatch) so
        // success state is set before the guide re-resolves.
        setTimeout(function(){
          // Mid-activity: soft refresh only (no scroll wipe). Final success bumps
          // so the guide can advance to Done without jumping on every pair.
          if(isActivityIncomplete(panel)) scheduleRefresh(moduleConfig, 120);
          else bumpFlowAdvance(moduleConfig, 120);
        }, 0);
      }
    }, true);

    document.addEventListener('click', function(e){
      var mapHit = e.target && e.target.closest && e.target.closest('.pjm-ocean-node[data-level], .pjm-level-card[data-level]');
      if(!mapHit) return;
      var map = mapHit.closest('[data-programme-journey-map]');
      if(!map) return;
      setTimeout(function(){
        bumpFlowAdvance(moduleConfig, 100);
      }, 0);
    }, true);

    document.addEventListener('input', function(e){
      var panel = e.target && e.target.closest && e.target.closest('.concept-panel.show');
      if(!panel) return;
      var activityRoot = findActivityRoot(panel);
      if(activityRoot && activityRoot.contains(e.target)){
        if(panel.dataset.flowActivityStarted !== 'true' && isActivityIncomplete(panel)){
          panel.dataset.flowActivityStarted = 'true';
        }
        if(isActivityIncomplete(panel)) scheduleRefresh(moduleConfig, 120);
        else bumpFlowAdvance(moduleConfig, 120);
      }
    }, true);

    document.addEventListener('change', function(e){
      var panel = e.target && e.target.closest && e.target.closest('.concept-panel.show');
      if(!panel) return;
      var activityRoot = findActivityRoot(panel);
      if(activityRoot && activityRoot.contains(e.target)){
        if(isActivityIncomplete(panel)) scheduleRefresh(moduleConfig, 120);
        else bumpFlowAdvance(moduleConfig, 120);
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
            if(mutation.attributeName === 'data-matched-count'){
              // Pair-match counters change on every correct tap ? refresh the
              // rail/pulse without wiping scroll locks (avoids mid-activity jumps).
              scheduleRefresh(moduleConfig, 180);
              return;
            }
            if(mutation.attributeName === 'data-choice-shell-complete' ||
              mutation.attributeName === 'data-choice-complete' ||
              mutation.attributeName === 'data-activity-complete' ||
              mutation.attributeName === 'data-carousel-complete' ||
              mutation.attributeName === 'data-categorize-complete' ||
              mutation.attributeName === 'data-sequence-complete' ||
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

    function start(){
      if(!isFlowGuideActive()){
        suppressFlowGuideChrome();
        return;
      }
      activeModuleConfig = moduleConfig;
      document.documentElement.setAttribute('data-guided-flow', 'true');
      document.documentElement.removeAttribute('data-flow-guide-off');
      if(ctx.pathway) document.documentElement.setAttribute('data-guided-pathway', ctx.pathway.id);
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
    if(!isFlowGuideActive()){
      suppressFlowGuideChrome();
      return;
    }

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
    document.documentElement.removeAttribute('data-flow-guide-off');

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
        delete panel.dataset.flowHubTour;
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
      if(!isFlowGuideActive()){
        suppressFlowGuideChrome();
        // Catch REVIEW_MODE applying data-review-mode after first paint
        setTimeout(function(){
          if(!isFlowGuideActive()) suppressFlowGuideChrome();
        }, 800);
        // Still schedule module bootstrap so ?flowGuide=1 mid-session isn't required ?
        // inactive start() path only suppresses again.
        if(!ctx.hub) initModulePage();
        return;
      }
      if(ctx.hub) initHubPage();
      else initModulePage();
    },
    isActive: isFlowGuideActive,
    suppress: suppressFlowGuideChrome,
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
    markPanelInPracticeDone: markPanelInPracticeDone,
    parentHubContentReady: parentHubContentReady,
    hubContentBeforeLeaves: hubContentBeforeLeaves,
    inPracticeFlowComplete: inPracticeFlowComplete
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ TrainingFlowGuide.init(); });
  } else {
    TrainingFlowGuide.init();
  }
})(typeof window !== 'undefined' ? window : this);
