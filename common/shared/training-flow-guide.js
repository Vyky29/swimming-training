(function(global){
  'use strict';

  var PULSE_CLASS = 'flow-guide-pulse';
  var RAIL_ID = 'trainingFlowGuideRail';
  var activePulseEl = null;
  var refreshTimer = null;
  var lastStepKey = null;
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

  function panelHasExpandableVisual(panel){
    if(!panel) return false;
    return !!panel.querySelector('.img-expand-btn, [data-expandable-visual] img[src], .concept-section-card.section-visual-shell img[src], .concept-image img[src]');
  }

  function isPanelVisualExpanded(panel){
    if(!panel) return true;
    if(panel.getAttribute('data-flow-visual-expanded') === 'true') return true;
    var buttons = panel.querySelectorAll('.img-expand-btn');
    if(!buttons.length) return !panelHasExpandableVisual(panel);
    for(var i = 0; i < buttons.length; i++){
      if(buttons[i].getAttribute('data-visual-expanded') !== 'true') return false;
    }
    return true;
  }

  function ensurePanelVisualWired(panel){
    if(!panel || !global.ConceptVisualExpand || typeof ConceptVisualExpand.wire !== 'function') return;
    try {
      ConceptVisualExpand.wire(panel, { panel: panel, syncRoot: panel });
    } catch(err){}
  }

  function panelUnexpandedVisual(panel){
    if(!panel) return null;
    if(panel.querySelector('.concept-insight-pillar:not(.clicked)')) return null;
    if(!panelHasExpandableVisual(panel) || isPanelVisualExpanded(panel)) return null;

    var btn = panel.querySelector('.img-expand-btn:not([data-visual-expanded="true"])');
    if(btn){
      return {
        kind: 'expand-visual',
        el: btn,
        label: 'Expand the image to view it full size'
      };
    }

    ensurePanelVisualWired(panel);
    btn = panel.querySelector('.img-expand-btn:not([data-visual-expanded="true"])');
    if(btn){
      return {
        kind: 'expand-visual',
        el: btn,
        label: 'Expand the image to view it full size'
      };
    }

    var slot = panel.querySelector('[data-expandable-visual]:not([data-visual-expanded="true"]), .concept-section-card.section-visual-shell, .concept-image');
    if(slot){
      if(activeModuleConfig) scheduleRefresh(activeModuleConfig, 420);
      return {
        kind: 'expand-visual',
        el: slot,
        label: 'Expand the image to view it full size'
      };
    }
    return null;
  }

  function resolveKeyIdeaItems(panel){
    if(panelHasExpandableVisual(panel) && !isPanelVisualExpanded(panel)) return null;

    var ideas = panel.querySelectorAll('.concept-points-box .key-idea-item:not(.clicked)');
    if(!ideas.length) ideas = panel.querySelectorAll('.key-idea-item:not(.clicked)');

    for(var i = 0; i < ideas.length; i++){
      if(!isVisibleEl(ideas[i])) continue;
      var idx = ideas[i].querySelector('.key-idea-index');
      return {
        kind: 'keyidea',
        el: ideas[i],
        label: 'Review key idea ' + ((idx && idx.textContent.trim()) || (i + 1))
      };
    }
    return null;
  }

  function resolvePanelActivity(panel){
    if(!panel) return null;
    var finish = panel.querySelector('[data-finish-concept]');
    if(!finish || !finish.disabled) return null;

    if(panel.querySelector('[data-carousel]') && panel.dataset.carouselComplete !== 'true'){
      return {
        kind: 'carousel',
        el: panel.querySelector('[data-carousel]'),
        label: 'Review all slides in this section'
      };
    }

    if(panel.querySelector('[data-choice-activity]') && panel.dataset.choiceComplete !== 'true'){
      return {
        kind: 'choice-activity',
        el: panel.querySelector('[data-choice-activity]'),
        label: 'Complete the activity above'
      };
    }

    if(panel.querySelector('[data-matching-activity], [data-match-grid], [data-match-board]')){
      var match = panel.querySelector('[data-matching-activity], [data-match-grid], [data-match-board]');
      var matchedCount = parseInt(panel.dataset.matchedCount, 10) || 0;
      var requiredMatches = parseInt(panel.dataset.requiredMatches, 10) || parseInt(panel.dataset.matchingPairsCount, 10) || 0;
      if(!requiredMatches || matchedCount < requiredMatches){
        return { kind: 'matching', el: match, label: 'Complete the matching activity' };
      }
    }

    if(panel.querySelector('[data-categorize-activity]') && panel.dataset.categorizeComplete !== 'true'){
      return {
        kind: 'categorize',
        el: panel.querySelector('[data-categorize-activity]'),
        label: 'Complete the classification activity'
      };
    }

    if(panel.querySelector('[data-sequence-activity]') && panel.dataset.sequenceComplete !== 'true'){
      return {
        kind: 'sequence',
        el: panel.querySelector('[data-sequence-activity]'),
        label: 'Complete the sequencing activity'
      };
    }

    var unflipped = panel.querySelector('[data-sense-card]:not(.flipped)');
    if(unflipped){
      return { kind: 'sensory', el: unflipped, label: 'Open all sensory cards' };
    }

    return null;
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
      kind: 'subconcept-nav',
      el: nav,
      label: 'Choose the next subconcept from the grid'
    };
  }

  function panelIncompleteTarget(panel){
    if(!panel) return null;

    var pillars = panel.querySelectorAll('.concept-insight-pillar:not(.clicked)');
    if(pillars.length){
      var title = pillars[0].querySelector('.concept-insight-pillar__title');
      return { kind: 'pillar', el: pillars[0], label: 'Read intro card: ' + ((title && title.textContent.trim()) || 'next point') };
    }

    var expandStep = panelUnexpandedVisual(panel);
    if(expandStep) return expandStep;

    var keyIdeaStep = resolveKeyIdeaItems(panel);
    if(keyIdeaStep) return keyIdeaStep;

    var activityStep = resolvePanelActivity(panel);
    if(activityStep) return activityStep;

    var subconceptStep = resolveSubconceptNav(panel);
    if(subconceptStep) return subconceptStep;

    var inPractice = panel.querySelector('.key-ideas-action:not([hidden])');
    if(inPractice && !inPractice.classList.contains('is-completed')){
      return { kind: 'inpractice', el: inPractice, label: 'Open In Practice' };
    }
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
    if(getOpenPanel(block)) return null;

    var buttons = getConceptButtons(block);
    var hasIncomplete = false;
    for(var i = 0; i < buttons.length; i++){
      if(isConceptDone(buttons[i])) continue;
      if(isConceptLocked(buttons[i], moduleConfig)) continue;
      hasIncomplete = true;
      break;
    }
    if(!hasIncomplete) return null;

    var section = document.getElementById(block);
    var grid = section ? (section.querySelector('[data-concept-grid="' + block + '"]') || section.querySelector('.concept-stage')) : null;
    if(!grid) return null;

    return {
      kind: 'concept-grid',
      el: grid,
      label: 'Choose your next concept from the grid'
    };
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

  function bindSectionReview(section, attr){
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
      markReviewed();
    });

    if(typeof IntersectionObserver !== 'undefined'){
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
    bindSectionReview($('#journey'));
  }

  function bindInsideModuleReview(){
    bindSectionReview($('#inside-module'));
  }

  function resolveStartModule(){
    if(isModuleStarted()) return null;
    var btn = document.querySelector('.hero-actions .btn-primary[data-scroll], #overview .btn-primary[data-scroll], [data-scroll="#journey"]');
    var hero = $('#overview') || $('.hero--module-system');
    return {
      kind: 'start-module',
      el: btn || hero,
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
      return {
        kind: 'journey-read',
        el: content,
        label: 'Review the pathway overview'
      };
    }

    if(isDisabled(check)){
      return {
        kind: 'journey-wait',
        el: section && section.querySelector('.journey-wrap') || section,
        label: 'Spend a moment reviewing the journey section'
      };
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

    var items = $$('[data-outcomes-group="outcomes"] .outcome, #outcomes .outcome');
    for(var i = 0; i < items.length; i++){
      if(!items[i].classList.contains('clicked')){
        return { kind: 'outcome', el: items[i], label: 'Review learning outcome ' + (i + 1) };
      }
    }
    var check = $('input[data-stage-check="outcomes"]');
    if(check && !isChecked(check)){
      if(isDisabled(check)){
        return { kind: 'outcomes-wait', el: $('#outcomes') || check, label: 'Review all learning outcomes first' };
      }
      return { kind: 'outcomes-check', el: check.closest('.check-item') || check, label: 'Confirm learning outcomes reviewed' };
    }
    return null;
  }

  function resolveInsideModule(){
    if(!isModuleStarted()) return null;
    if(!isChecked($('input[data-stage-check="journey"]'))) return null;
    if(!isChecked($('input[data-stage-check="outcomes"]'))) return null;
    if(insideModuleReviewed()) return null;

    var section = $('#inside-module');
    if(!section) return null;

    var content = section.querySelector('.module-roadmap-wrap') || section.querySelector('.journey-wrap') || section;
    return {
      kind: 'inside-module',
      el: content,
      label: 'Review the block roadmap before you begin'
    };
  }

  function resolveBlock(block, moduleConfig){
    if(!isModuleStarted()) return null;
    if(!isChecked($('input[data-stage-check="journey"]'))) return null;
    if(!isChecked($('input[data-stage-check="outcomes"]'))) return null;
    if(!insideModuleReviewed()) return null;

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

  function clearPulse(){
    if(activePulseEl){
      activePulseEl.classList.remove(PULSE_CLASS);
      activePulseEl.classList.remove(PULSE_CLASS + '--expand');
      activePulseEl = null;
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
    clearPulse();
    if(!step || !step.el){
      updateRail(null);
      lastStepKey = null;
      return;
    }

    var target = step.el;
    if(target.disabled && target.tagName === 'INPUT'){
      target = target.closest('.check-item') || target;
    }

    var key = stepKey(step);
    var shouldScroll = key !== lastStepKey;
    lastStepKey = key;

    target.classList.add(PULSE_CLASS);
    if(step.kind === 'expand-visual') target.classList.add(PULSE_CLASS + '--expand');
    activePulseEl = target;
    updateRail(step);

    if(shouldScroll && typeof target.scrollIntoView === 'function'){
      var rect = target.getBoundingClientRect();
      var offScreen = rect.top < 88 || rect.bottom > window.innerHeight - 130;
      if(offScreen || step.kind === 'start-module' || step.kind === 'concept-grid' || step.kind === 'subconcept-nav' || step.kind === 'expand-visual'){
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  function refresh(moduleConfig){
    if(!moduleConfig) return;
    applyGuide(resolveNextStep(moduleConfig));
  }

  function scheduleRefresh(moduleConfig, delay){
    if(refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function(){ refresh(moduleConfig); }, delay || 180);
  }

  function bindRefresh(moduleConfig){
    ['click', 'change', 'input', 'concept-insight-pillars-change', 'concept-visual-expand-wire', 'concept-visual-expand-change'].forEach(function(name){
      document.addEventListener(name, function(){ scheduleRefresh(moduleConfig); }, true);
    });

    if(typeof MutationObserver !== 'undefined'){
      var observer = new MutationObserver(function(){
        scheduleRefresh(moduleConfig);
      });
      observer.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ['disabled', 'hidden', 'checked', 'data-flow-reviewed', 'data-visual-expanded', 'data-flow-visual-expanded', 'class'],
        childList: true
      });
    }

    window.addEventListener('hashchange', function(){ scheduleRefresh(moduleConfig); });
    window.addEventListener('resize', function(){ scheduleRefresh(moduleConfig); });
    setInterval(function(){ refresh(moduleConfig); }, 3500);
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
      bindModuleStart();
      bindJourneyReview();
      bindInsideModuleReview();
      refresh(moduleConfig);
      bindRefresh(moduleConfig);
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
      }
      document.querySelectorAll('[data-concept-grid="' + block + '"] .concept-square[data-target]').forEach(function(btn){
        btn.classList.remove('active');
      });
      var section = document.getElementById(block);
      var grid = section ? section.querySelector('[data-concept-grid="' + block + '"]') : null;
      if(grid){
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if(activeModuleConfig) scheduleRefresh(activeModuleConfig);
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
