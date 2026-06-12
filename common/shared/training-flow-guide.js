(function(global){
  'use strict';

  var PULSE_CLASS = 'flow-guide-pulse';
  var PULSE_EXPAND = 'flow-guide-pulse--expand';
  var PULSE_ACTIVITY = 'flow-guide-pulse--activity';
  var PULSE_IN_PRACTICE = 'flow-guide-pulse--inpractice';
  var RAIL_ID = 'trainingFlowGuideRail';
  var activePulseEl = null;
  var activePulseEls = [];
  var refreshTimer = null;
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
    return step.kind + '|' + (step.el.id || step.el.getAttribute('data-target') || step.label);
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

  function sectionScrollStep(kind, el, label, options){
    options = options || {};
    return {
      kind: kind,
      el: el,
      label: label,
      scrollBlock: options.scrollBlock || 'center',
      forceScroll: options.forceScroll !== false,
      noScroll: options.noScroll === true,
      tone: options.tone,
      scrollEl: options.scrollEl
    };
  }

  function getConceptGridScrollAnchor(block){
    var section = document.getElementById(block);
    if(!section) return null;
    return section.querySelector('.block-header') ||
      section.querySelector('.section-top') ||
      section.querySelector('.block-title-wrap') ||
      section.querySelector('.concept-stage') ||
      section;
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
    if(!target || typeof target.scrollIntoView !== 'function') return;
    if(step && step.noScroll) return;
    if(Date.now() < userScrollUntil && !(step && step.forceScroll)) return;

    var key = stepKey(step);
    if(key && lastScrolledKey === key && !(step && step.forceScroll)) return;
    if(isMostlyVisible(target, step)) return;

    var block = (step && step.scrollBlock) || 'nearest';
    target.scrollIntoView({ behavior: 'smooth', block: block, inline: 'nearest' });
    lastScrolledKey = key;
  }

  function resetPanelFlowScope(panel){
    if(!panel) return;
    var scope = panel.dataset.currentTarget || '';
    if(panel.__flowGuideScope === scope) return;
    panel.__flowGuideScope = scope;
    delete panel.dataset.flowKeyideasFramed;
    delete panel.dataset.flowActivityStarted;
    delete panel.dataset.flowVisualScrollPreKeyideas;
    delete panel.dataset.flowVisualScrollPreActivity;
    delete panel.dataset.flowVisualScrollPostActivity;
  }

  function hasClickedKeyIdea(panel){
    return !!(panel && panel.querySelector('.key-idea-item.clicked'));
  }

  function getKeyIdeasBox(panel){
    if(!panel) return null;
    var box = panel.querySelector('.concept-points-box');
    if(!box || !box.querySelector('.key-idea-item')) return null;
    return box;
  }

  function panelHasExpandableVisual(panel){
    if(!panel) return false;
    return !!panel.querySelector('.img-expand-btn, [data-expandable-visual] img[src], .concept-section-card.section-visual-shell img[src], .concept-image img[src]');
  }

  function isNodeBefore(anchor, beforeNode){
    if(!anchor || !beforeNode) return true;
    if(anchor === beforeNode) return false;
    return (anchor.compareDocumentPosition(beforeNode) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  }

  function getPanelExpandButtons(panel){
    if(!panel) return [];
    return Array.from(panel.querySelectorAll('.img-expand-btn')).filter(isVisibleEl);
  }

  function syncPanelVisualWiring(panel){
    if(!panel) return;
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
    return !resolveNextVisualExpand(panel, { phase: 'preKeyideas' });
  }

  function inPracticeFlowComplete(panel){
    if(!panel || panel.dataset.inPracticeRequired === 'false') return true;
    var inPractice = panel.querySelector('.key-ideas-action');
    if(!inPractice || inPractice.hasAttribute('hidden')) return true;
    return inPractice.classList.contains('is-completed') || panel.dataset.inPracticeDone === 'true';
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
      btn.closest('.concept-image') ||
      btn.closest('[data-concept-primary-image]') ||
      btn.closest('[data-concept-intro-media]') ||
      btn.closest('.b2c2-direct-image') ||
      btn.closest('.b2c3-direct-image') ||
      btn.closest('.entry-exit-fan-item') ||
      btn.closest('figure') ||
      btn.closest('.concept-activity-box') ||
      btn.closest('.concept-section-card.section-visual-shell') ||
      btn.closest('.concept-section-card') ||
      btn.parentElement;
  }

  function buildExpandVisualStep(btn, options){
    options = options || {};
    var visualBox = findVisualExpandBox(btn);
    var pulseEls = [];
    if(visualBox) pulseEls.push(visualBox);
    if(pulseEls.indexOf(btn) === -1) pulseEls.push(btn);
    return {
      kind: 'expand-visual',
      tone: 'expand',
      el: btn,
      pulseEls: pulseEls,
      noScroll: options.noScroll !== false,
      scrollBlock: options.scrollBlock || 'center',
      forceScroll: options.forceScroll === true,
      scrollEl: options.scrollEl || visualBox,
      label: 'Expand the image to view it full size'
    };
  }

  function resolveNextVisualExpand(panel, options){
    options = options || {};
    if(!panel) return null;
    if(panel.querySelector('.concept-insight-pillar:not(.clicked)')) return null;

    syncPanelVisualWiring(panel);

    var pointsBox = panel.querySelector('.concept-points-box');
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
        if(panel.querySelector('.key-idea-item:not(.clicked)')) return null;
        if(!inPracticeFlowComplete(panel)) return null;
      } else if(options.phase === 'postActivity'){
        if(beforeActivity) continue;
        if(panel.querySelector('.key-idea-item:not(.clicked)')) return null;
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
    return null;
  }

  function resolveKeyIdeaItems(panel){
    if(!preKeyIdeasVisualsComplete(panel)) return null;

    var box = getKeyIdeasBox(panel);
    var ideas = panel.querySelectorAll('.concept-points-box .key-idea-item:not(.clicked)');
    if(!ideas.length) ideas = panel.querySelectorAll('.key-idea-item:not(.clicked)');

    for(var i = 0; i < ideas.length; i++){
      if(!isVisibleEl(ideas[i])) continue;
      var idx = ideas[i].querySelector('.key-idea-index');
      var scrollToBox = box && !hasClickedKeyIdea(panel);
      return sectionScrollStep('keyidea', ideas[i], 'Review key idea ' + ((idx && idx.textContent.trim()) || (i + 1)), {
        noScroll: !scrollToBox,
        scrollEl: scrollToBox ? box : undefined,
        scrollBlock: 'center',
        forceScroll: scrollToBox,
        tone: 'expand'
      });
    }
    return null;
  }

  function resolveInPractice(panel){
    if(!panel || panel.dataset.inPracticeRequired === 'false') return null;
    var inPractice = panel.querySelector('.key-ideas-action');
    if(!inPractice || inPractice.hasAttribute('hidden')) return null;
    if(inPractice.classList.contains('is-completed') || panel.dataset.inPracticeDone === 'true') return null;
    if(panel.querySelector('.concept-insight-pillar:not(.clicked)')) return null;
    if(panel.querySelector('.key-idea-item:not(.clicked)')) return null;
    if(!preKeyIdeasVisualsComplete(panel)) return null;

    return sectionScrollStep('inpractice', inPractice, 'Read the In Practice scenario', {
      scrollBlock: 'center',
      forceScroll: true,
      tone: 'inpractice'
    });
  }

  function findActivityRoot(panel){
    if(!panel) return null;
    var selectors = [
      '.section-activity-shell',
      '.concept-section-card.section-activity',
      '[data-concept-activity-flow]',
      '[data-concept-activity]'
    ];
    for(var s = 0; s < selectors.length; s++){
      var hit = panel.querySelector(selectors[s]);
      if(hit) return hit;
    }
    var inner = panel.querySelector('[data-carousel], [data-choice-activity], [data-matching-activity], [data-match-grid], [data-match-board], [data-categorize-activity], [data-sequence-activity], [data-sense-card]');
    if(!inner) return null;
    return inner.closest('.section-activity-shell, .concept-section-card.section-activity, [data-concept-activity-flow], [data-concept-activity], .activity-container') || inner;
  }

  function isActivityIncomplete(panel){
    if(!panel) return false;
    var finish = panel.querySelector('[data-finish-concept]');
    if(!finish || !finish.disabled) return false;
    if(!findActivityRoot(panel)) return false;

    if(panel.querySelector('[data-carousel]') && panel.dataset.carouselComplete !== 'true') return true;
    if(panel.querySelector('[data-choice-activity]') && panel.dataset.choiceComplete !== 'true') return true;

    if(panel.querySelector('[data-matching-activity], [data-match-grid], [data-match-board]')){
      var matchedCount = parseInt(panel.dataset.matchedCount, 10) || 0;
      var requiredMatches = parseInt(panel.dataset.requiredMatches, 10) || parseInt(panel.dataset.matchingPairsCount, 10) || 0;
      if(requiredMatches && matchedCount < requiredMatches) return true;
    }

    if(panel.querySelector('[data-categorize-activity]') && panel.dataset.categorizeComplete !== 'true') return true;
    if(panel.querySelector('[data-sequence-activity]') && panel.dataset.sequenceComplete !== 'true') return true;
    if(panel.querySelector('[data-sense-card]:not(.flipped)')) return true;

    return false;
  }

  function resolvePanelActivity(panel){
    if(!panel || !isActivityIncomplete(panel)) return null;

    var root = findActivityRoot(panel);
    if(!root) return null;

    if(panel.dataset.flowActivityStarted !== 'true'){
      return sectionScrollStep('activity-intro', root, 'Complete the activity below', { tone: 'activity' });
    }

    return {
      kind: 'activity-progress',
      el: root,
      noPulse: true,
      noScroll: true,
      label: 'Complete the activity'
    };
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
      var hasIncomplete = panel.querySelector('.concept-insight-pillar:not(.clicked), .key-idea-item:not(.clicked)');
      var finish = panel.querySelector('[data-finish-concept]');
      if(hasIncomplete || (finish && finish.disabled)) return null;
    }

    return {
      kind: 'subconcept',
      el: unvisited[0],
      label: 'Choose the next subconcept'
    };
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
        forceScroll: false
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

    var pillars = panel.querySelectorAll('.concept-insight-pillar:not(.clicked)');
    if(pillars.length){
      var title = pillars[0].querySelector('.concept-insight-pillar__title');
      return {
        kind: 'pillar',
        el: pillars[0],
        noScroll: true,
        label: 'Read intro card: ' + ((title && title.textContent.trim()) || 'next point')
      };
    }

    var preVisualStep = resolveNextVisualExpand(panel, { phase: 'preKeyideas' });
    if(preVisualStep) return preVisualStep;

    var keyIdeaStep = resolveKeyIdeaItems(panel);
    if(keyIdeaStep) return keyIdeaStep;

    var inPracticeStep = resolveInPractice(panel);
    if(inPracticeStep) return inPracticeStep;

    var preActivityVisualStep = resolveNextVisualExpand(panel, { phase: 'preActivity' });
    if(preActivityVisualStep) return preActivityVisualStep;

    var activityStep = resolvePanelActivity(panel);
    if(activityStep) return activityStep;

    var postActivityVisualStep = resolveNextVisualExpand(panel, { phase: 'postActivity' });
    if(postActivityVisualStep) return postActivityVisualStep;

    var subconceptStep = resolveSubconceptNav(panel);
    if(subconceptStep) return subconceptStep;

    var finish = panel.querySelector('[data-finish-concept]');
    if(finish && !finish.disabled){
      return { kind: 'finish', el: finish, label: 'Finish concept' };
    }
    if(finish && finish.disabled){
      return { kind: 'finish-pending', el: finish, label: 'Complete remaining items in this concept' };
    }
    return null;
  }

  function reflectionDone(block){
    var check = document.querySelector('input[data-check-for="' + block + '"], input[data-stage-check="' + block + '"]');
    if(isChecked(check)) return true;
    return false;
  }

  function reflectionReady(block){
    var lockBox = document.querySelector('[data-lock-box="' + block + '"]');
    return !!(lockBox && lockBox.classList.contains('ready'));
  }

  function blockConceptsComplete(block){
    var buttons = getConceptButtons(block);
    if(!buttons.length) return true;
    return buttons.every(isConceptDone);
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

  function bindInsideModuleReview(){
    var section = $('#inside-module');
    if(!section) return;
    bindSectionReview(section, { disableAutoReview: true });

    section.addEventListener('click', function(e){
      if(document.documentElement.getAttribute('data-guided-flow') !== 'true') return;
      var link = e.target.closest('.module-roadmap__item, a.module-roadmap__item');
      if(link) e.preventDefault();
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

  function bindInPracticeReview(moduleConfig){
    document.addEventListener('click', function(e){
      var action = e.target.closest && e.target.closest('.key-ideas-action');
      if(!action || action.hasAttribute('hidden')) return;
      if(document.documentElement.getAttribute('data-guided-flow') !== 'true') return;
      var panel = action.closest('.concept-panel');
      if(!panel || panel.dataset.inPracticeRequired === 'false') return;
      if(panel.dataset.inPracticeDone === 'true' || action.classList.contains('is-completed')) return;

      action.classList.add('is-completed');
      panel.dataset.inPracticeDone = 'true';
      var icon = action.querySelector('.icon');
      if(icon && action.classList.contains('is-completed')){
        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
      }
      scheduleRefresh(moduleConfig, 120);
    }, true);

    document.addEventListener('keydown', function(e){
      if(e.key !== 'Enter' && e.key !== ' ') return;
      var action = e.target.closest && e.target.closest('.key-ideas-action');
      if(!action || action.hasAttribute('hidden')) return;
      if(document.documentElement.getAttribute('data-guided-flow') !== 'true') return;
      e.preventDefault();
      action.click();
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
      scheduleRefresh(moduleConfig, 120);
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
      scheduleRefresh(moduleConfig, 120);
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
    var wrap = section.querySelector('.block-intro-cards[data-block-intro="' + block + '"], [data-block-intro="' + block + '"]');
    if(!wrap) return true;
    var cards = wrap.querySelectorAll('.block-intro-card');
    if(!cards.length) return true;
    for(var i = 0; i < cards.length; i++){
      if(cards[i].getAttribute('data-flow-block-intro-done') !== 'true') return false;
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

  function resolveBlockIntroCards(block){
    var section = document.getElementById(block);
    if(!section) return null;
    var wrap = section.querySelector('.block-intro-cards[data-block-intro="' + block + '"], [data-block-intro="' + block + '"]');
    if(!wrap) return null;

    var cards = wrap.querySelectorAll('.block-intro-card');
    for(var i = 0; i < cards.length; i++){
      if(cards[i].getAttribute('data-flow-block-intro-done') !== 'true'){
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

  function resolveBlock(block, moduleConfig){
    if(!isModuleStarted()) return null;
    if(!isChecked($('input[data-stage-check="journey"]'))) return null;
    if(!isChecked($('input[data-stage-check="outcomes"]'))) return null;
    if(!insideModuleReviewed()) return null;

    var introStep = resolveBlockIntroCards(block);
    if(introStep) return introStep;

    var slideExpandStep = resolveBlockIntroSlideExpand(block);
    if(slideExpandStep) return slideExpandStep;

    var openPanel = getOpenPanel(block);
    if(openPanel){
      var inside = panelIncompleteTarget(openPanel);
      if(inside) return inside;
    }

    var gridStep = resolveConceptGrid(block, moduleConfig);
    if(gridStep) return gridStep;

    if(blockConceptsComplete(block) && !reflectionDone(block)){
      if(reflectionReady(block)){
        var gate = document.querySelector('[data-gate="' + block + '"]');
        return { kind: 'reflection', el: gate || document.querySelector('[data-lock-box="' + block + '"]'), label: 'Complete reflection checkpoint' };
      }
      var lockBox = document.querySelector('[data-lock-box="' + block + '"]');
      if(lockBox) return { kind: 'block-progress', el: lockBox, label: 'Finish all concepts in this block' };
    }

    if(reflectionDone(block)){
      var blockCheck = document.querySelector('input[data-check-for="' + block + '"], input[data-stage-check="' + block + '"]');
      if(blockCheck && !isChecked(blockCheck)){
        if(isDisabled(blockCheck)){
          return {
            kind: 'block-check-wait',
            el: blockCheck.closest('.check-item') || document.getElementById(block) || blockCheck,
            label: 'Mark this block complete when you are ready'
          };
        }
        return { kind: 'block-check', el: blockCheck.closest('.check-item') || blockCheck, label: 'Mark block complete' };
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

    var openPanel = getActiveOpenPanel();
    if(openPanel){
      var openBlock = openPanel.getAttribute('data-panel-for');
      if(openBlock){
        var focusedStep = resolveBlock(openBlock, moduleConfig);
        if(focusedStep) return focusedStep;
      }
    }

    var blocks = moduleConfig.blocks || [];
    for(var b = 0; b < blocks.length; b++){
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
      'subconcept': true
    };
    return !!kinds[step.kind];
  }

  function clearPulse(){
    var els = activePulseEls.length ? activePulseEls.slice() : (activePulseEl ? [activePulseEl] : []);
    for(var i = 0; i < els.length; i++){
      els[i].classList.remove(PULSE_CLASS);
      els[i].classList.remove(PULSE_EXPAND);
      els[i].classList.remove(PULSE_ACTIVITY);
      els[i].classList.remove(PULSE_IN_PRACTICE);
    }
    activePulseEls = [];
    activePulseEl = null;
  }

  function applyPulseToEl(el, step){
    if(!el) return;
    el.classList.add(PULSE_CLASS);
    if(step.tone === 'inpractice' || step.kind === 'inpractice'){
      el.classList.add(PULSE_IN_PRACTICE);
    } else if(usesExpandPulse(step)){
      el.classList.add(PULSE_EXPAND);
    }
    if(step.tone === 'activity' || step.kind === 'activity-intro' || step.kind === 'carousel' || step.kind === 'matching' || step.kind === 'choice-activity' || step.kind === 'categorize' || step.kind === 'sequence' || step.kind === 'sensory'){
      el.classList.add(PULSE_ACTIVITY);
    }
  }

  function ensureRail(){
    var rail = document.getElementById(RAIL_ID);
    if(rail) return rail;
    rail = document.createElement('div');
    rail.id = RAIL_ID;
    rail.className = 'flow-guide-rail';
    rail.setAttribute('role', 'status');
    rail.setAttribute('aria-live', 'polite');
    rail.innerHTML = '<span class="flow-guide-rail__dot" aria-hidden="true"></span><span class="flow-guide-rail__text"></span>';
    document.body.appendChild(rail);
    return rail;
  }

  function updateRail(step){
    var rail = ensureRail();
    var textEl = rail.querySelector('.flow-guide-rail__text');
    if(!step){
      rail.hidden = true;
      return;
    }
    rail.hidden = false;
    if(textEl) textEl.innerHTML = 'Next step: <strong>' + step.label + '</strong>';
  }

  function applyGuide(step){
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
    if(key === lastStepKey && activePulseEl === target && !step.noPulse){
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
    if(openPanel) resetPanelFlowScope(openPanel);
    applyGuide(resolveNextStep(moduleConfig));
  }

  function scheduleRefresh(moduleConfig, delay){
    if(refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function(){ refresh(moduleConfig); }, delay || 260);
  }

  function shouldIgnoreMutation(target, mutation){
    if(!target || target.id === RAIL_ID) return true;
    if(mutation.type === 'attributes' && mutation.attributeName === 'class'){
      if(target.classList && target.classList.contains(PULSE_CLASS)) return true;
    }
    return false;
  }

  function bindConceptFlowInteractions(moduleConfig){
    document.addEventListener('click', function(e){
      var panel = e.target.closest && e.target.closest('.concept-panel.show');
      if(!panel) return;

      var activityRoot = findActivityRoot(panel);
      if(activityRoot && activityRoot.contains(e.target) && isActivityIncomplete(panel)){
        if(panel.dataset.flowActivityStarted !== 'true'){
          panel.dataset.flowActivityStarted = 'true';
          scheduleRefresh(moduleConfig, 120);
        }
      }
    }, true);

    document.addEventListener('input', function(e){
      var panel = e.target && e.target.closest && e.target.closest('.concept-panel.show');
      if(!panel || panel.dataset.flowActivityStarted === 'true') return;
      var activityRoot = findActivityRoot(panel);
      if(activityRoot && activityRoot.contains(e.target) && isActivityIncomplete(panel)){
        panel.dataset.flowActivityStarted = 'true';
        scheduleRefresh(moduleConfig, 120);
      }
    }, true);
  }

  function bindRefresh(moduleConfig){
    bindConceptFlowInteractions(moduleConfig);

    ['click', 'change', 'input', 'concept-insight-pillars-change', 'concept-visual-expand-wire', 'concept-visual-expand-change'].forEach(function(name){
      document.addEventListener(name, function(e){
        var panel = e.target && e.target.closest && e.target.closest('.concept-panel.show');
        if(panel) ensurePanelVisualWired(panel);
        scheduleRefresh(moduleConfig);
      }, true);
    });

    if(typeof MutationObserver !== 'undefined'){
      var observer = new MutationObserver(function(mutations){
        for(var i = 0; i < mutations.length; i++){
          if(!shouldIgnoreMutation(mutations[i].target, mutations[i])){
            scheduleRefresh(moduleConfig);
            return;
          }
        }
      });
      observer.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ['disabled', 'hidden', 'checked', 'data-flow-reviewed', 'data-visual-expanded', 'data-flow-visual-expanded', 'data-in-practice-done', 'data-in-practice-required', 'data-flow-block-intro-done'],
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
      if(textEl) textEl.innerHTML = 'Recommended next: <strong>Module ' + nextModule.number + ' ù ' + nextModule.title + '</strong>';
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
      }
      document.querySelectorAll('[data-concept-grid="' + block + '"] .concept-square[data-target]').forEach(function(btn){
        btn.classList.remove('active');
      });
      lastScrolledKey = null;
      userScrollUntil = 0;
      setTimeout(function(){ scrollToConceptGrid(block); }, 220);
      setTimeout(function(){ scrollToConceptGrid(block); }, 620);
      if(activeModuleConfig) scheduleRefresh(activeModuleConfig, 360);
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
    resolveNextStep: resolveNextStep,
    markModuleComplete: markModuleComplete,
    returnToConceptGrid: returnToConceptGrid
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ TrainingFlowGuide.init(); });
  } else {
    TrainingFlowGuide.init();
  }
})(typeof window !== 'undefined' ? window : this);
