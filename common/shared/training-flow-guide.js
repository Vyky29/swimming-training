(function(global){
  'use strict';

  var PULSE_CLASS = 'flow-guide-pulse';
  var RAIL_ID = 'trainingFlowGuideRail';
  var activePulseEl = null;
  var refreshTimer = null;

  function $(sel, root){ return (root || document).querySelector(sel); }
  function $$(sel, root){ return Array.from((root || document).querySelectorAll(sel)); }

  function isReviewMode(){
    return document.documentElement.getAttribute('data-review-mode') === 'true'
      || document.body.classList.contains('training-review-mode');
  }

  function isChecked(input){
    return !!(input && input.checked);
  }

  function conceptSquare(block, target){
    return document.querySelector('[data-concept-grid="' + block + '"] .concept-square[data-target="' + target + '"]')
      || document.querySelector('[data-panel-for="' + block + '"] ~ * [data-target="' + target + '"]')
      || document.querySelector('.concept-square[data-target="' + target + '"]');
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
    var panel = document.querySelector('[data-panel-for="' + block + '"]');
    if(panel && panel.classList.contains('show')) return panel;
    return document.querySelector('.concept-panel.show[data-panel-for="' + block + '"]')
      || document.querySelector('.concept-panel.show');
  }

  function panelIncompleteTarget(panel){
    if(!panel) return null;
    var pillars = panel.querySelectorAll('.concept-insight-pillar:not(.clicked)');
    if(pillars.length){
      return { el: pillars[0], label: 'Read intro card ' + (pillars[0].querySelector('.concept-insight-pillar__title')?.textContent?.trim() || '') };
    }
    var ideas = panel.querySelectorAll('.key-idea-item:not(.clicked)');
    if(ideas.length){
      return { el: ideas[0], label: 'Review key idea ' + (ideas[0].querySelector('.key-idea-index')?.textContent || '') };
    }
    var inPractice = panel.querySelector('.key-ideas-action:not([hidden])');
    if(inPractice && !inPractice.classList.contains('is-completed')){
      return { el: inPractice, label: 'Open In Practice' };
    }
    var finish = panel.querySelector('[data-finish-concept]');
    if(finish && !finish.disabled){
      return { el: finish, label: 'Finish concept' };
    }
    if(finish && finish.disabled){
      return { el: finish, label: 'Complete remaining items in this concept' };
    }
    return null;
  }

  function reflectionDone(block){
    var gate = document.querySelector('[data-gate="' + block + '"]');
    if(!gate || !gate.classList.contains('open')) return false;
    var check = document.querySelector('input[data-check-for="' + block + '"], input[data-stage-check="' + block + '"]');
    return isChecked(check);
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

  function nextConceptInBlock(block, moduleConfig){
    var buttons = getConceptButtons(block);
    for(var i = 0; i < buttons.length; i++){
      var btn = buttons[i];
      if(isConceptDone(btn)) continue;
      if(isConceptLocked(btn, moduleConfig)) continue;
      var label = btn.textContent.replace(/\s+/g, ' ').trim();
      return { el: btn, label: label || 'Open next concept' };
    }
    return null;
  }

  function resolveJourney(moduleConfig){
    var check = $('input[data-stage-check="journey"]');
    var section = $('#journey');
    if(isChecked(check)) return null;
    return {
      el: check ? (check.closest('.check-item') || check) : (section || $('a[data-scroll="journey"], .nav-link[href="#journey"]')),
      label: 'Review the module journey'
    };
  }

  function resolveOutcomes(){
    var items = $$('[data-outcomes-group="outcomes"] .outcome, #outcomes .outcome');
    for(var i = 0; i < items.length; i++){
      if(!items[i].classList.contains('clicked')){
        return { el: items[i], label: 'Review learning outcome ' + (i + 1) };
      }
    }
    var check = $('input[data-stage-check="outcomes"]');
    if(check && !isChecked(check)){
      return { el: check.closest('.check-item') || check, label: 'Confirm learning outcomes reviewed' };
    }
    return null;
  }

  function resolveBlock(block, moduleConfig){
    var openPanel = getOpenPanel(block);
    if(openPanel){
      var inside = panelIncompleteTarget(openPanel);
      if(inside) return inside;
    }

    var nextConcept = nextConceptInBlock(block, moduleConfig);
    if(nextConcept) return nextConcept;

    if(blockConceptsComplete(block) && !reflectionDone(block)){
      if(reflectionReady(block)){
        var gate = document.querySelector('[data-gate="' + block + '"]');
        return { el: gate || document.querySelector('[data-lock-box="' + block + '"]'), label: 'Complete reflection checkpoint' };
      }
      var lockBox = document.querySelector('[data-lock-box="' + block + '"]');
      if(lockBox) return { el: lockBox, label: 'Finish all concepts in this block' };
    }

    if(reflectionDone(block)){
      var blockCheck = document.querySelector('input[data-check-for="' + block + '"], input[data-stage-check="' + block + '"]');
      if(blockCheck && !isChecked(blockCheck)){
        return { el: blockCheck.closest('.check-item') || blockCheck, label: 'Mark block complete' };
      }
    }
    return null;
  }

  function resolveSectionStage(sectionId){
    if(sectionId.indexOf('block') === 0) return null;
    var check = $('input[data-stage-check="' + sectionId + '"]');
    if(!check || isChecked(check)) return null;
    if(sectionId === 'complete'){
      var startQuiz = $('a[href="#quiz"], .btn-start-quiz, [data-start-quiz]');
      if(startQuiz) return { el: startQuiz, label: 'Start module quiz' };
    }
    if(sectionId === 'quiz'){
      var quiz = $('#quiz');
      return quiz ? { el: quiz, label: 'Complete the module quiz' } : null;
    }
    var section = document.getElementById(sectionId);
    return {
      el: (check && check.closest('.check-item')) || section,
      label: 'Complete ' + sectionId.replace(/^\w/, function(c){ return c.toUpperCase(); })
    };
  }

  function resolveNextStep(moduleConfig){
    if(!moduleConfig) return null;

    var journey = resolveJourney(moduleConfig);
    if(journey) return journey;

    var outcomes = resolveOutcomes();
    if(outcomes) return outcomes;

    var blocks = moduleConfig.blocks || [];
    for(var b = 0; b < blocks.length; b++){
      var blockStep = resolveBlock(blocks[b], moduleConfig);
      if(blockStep) return blockStep;
    }

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
      return;
    }
    var target = step.el;
    if(target.disabled && target.tagName === 'INPUT') target = target.closest('.check-item') || target;
    target.classList.add(PULSE_CLASS);
    activePulseEl = target;
    updateRail(step);

    if(typeof target.scrollIntoView === 'function'){
      var rect = target.getBoundingClientRect();
      var offScreen = rect.top < 80 || rect.bottom > window.innerHeight - 120;
      if(offScreen){
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  function refresh(moduleConfig){
    if(!moduleConfig) return;
    var step = resolveNextStep(moduleConfig);
    applyGuide(step);
  }

  function scheduleRefresh(moduleConfig){
    if(refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function(){ refresh(moduleConfig); }, 120);
  }

  function bindRefresh(moduleConfig){
    var events = ['click', 'change', 'input', 'concept-insight-pillars-change'];
    events.forEach(function(name){
      document.addEventListener(name, function(){ scheduleRefresh(moduleConfig); }, true);
    });
    if(typeof MutationObserver !== 'undefined'){
      var observer = new MutationObserver(function(){ scheduleRefresh(moduleConfig); });
      observer.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'disabled', 'hidden', 'checked'],
        childList: true
      });
    }
    window.addEventListener('hashchange', function(){ scheduleRefresh(moduleConfig); });
    window.addEventListener('resize', function(){ scheduleRefresh(moduleConfig); });
  }

  function initModulePage(){
    if(!global.TrainingFlowConfig) return;
    var ctx = TrainingFlowConfig.detectContext();
    if(!ctx || ctx.hub || !ctx.moduleId) return;

    var moduleConfig = TrainingFlowConfig.getModuleConfig(ctx.pathway, ctx.moduleId);
    if(!moduleConfig) return;

    document.documentElement.setAttribute('data-guided-flow', 'true');
    if(ctx.pathway) document.documentElement.setAttribute('data-guided-pathway', ctx.pathway.id);

    function start(){
      refresh(moduleConfig);
      bindRefresh(moduleConfig);
      setInterval(function(){ refresh(moduleConfig); }, 4000);
    }

    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', function(){
        setTimeout(start, 400);
      });
    } else {
      setTimeout(start, 400);
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
      if(textEl) textEl.innerHTML = 'Recommended next: <strong>Module ' + nextModule.number + ' — ' + nextModule.title + '</strong>';
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
    isReviewMode: isReviewMode
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ TrainingFlowGuide.init(); });
  } else {
    TrainingFlowGuide.init();
  }
})(typeof window !== 'undefined' ? window : this);
