(function(){
  const STORAGE_KEYS = {
    progress: 'cs_swimming_training_progress',
    currentModule: 'cs_swimming_training_current_module',
    completedSections: 'cs_swimming_training_completed_sections',
    completedModules: 'cs_swimming_training_completed_modules'
  };

  const COURSE_MODULES = {
    introduction: {
      id: 'introduction',
      title: 'Training Introduction',
      file: 'swimming-training-introduction.html',
      aliases: ['index.html'],
      sections: ['training-introduction'],
      available: true
    },
    module1: {
      id: 'module1',
      title: 'Module 1 - Foundations of Aquatic Development',
      file: 'Javier-module1.html',
      sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap'],
      available: true
    },
    module2: {
      id: 'module2',
      title: 'Module 2 - Guiding Learning Through Scaffolding and the CS Learning Principle',
      file: null,
      sections: ['section-1', 'section-2', 'section-3'],
      available: false
    },
    module3: {
      id: 'module3',
      title: 'Module 3 - Early Aquatic Experiences',
      file: null,
      sections: ['section-1', 'section-2', 'section-3'],
      available: false
    },
    module4: {
      id: 'module4',
      title: 'Module 4 - Core Aquatic Skills',
      file: null,
      sections: ['block-1', 'block-2', 'block-3', 'block-4'],
      available: false
    },
    module5: {
      id: 'module5',
      title: 'Module 5 - Propulsion Development in the Water',
      file: null,
      sections: ['section-1', 'section-2', 'section-3'],
      available: false
    },
    module6: {
      id: 'module6',
      title: 'Module 6 - Swimming Strokes and Advanced Techniques',
      file: null,
      sections: ['section-1', 'section-2', 'section-3'],
      available: false
    }
  };

  const COURSE_ORDER = ['introduction', 'module1', 'module2', 'module3', 'module4', 'module5', 'module6'];
  let toastTimer = null;

  function getEmptyState(){
    return {
      introductionCompleted: false,
      currentModule: 'introduction',
      completedSections: {},
      completedModules: [],
      lastActiveSection: {},
      lastUpdatedAt: null
    };
  }

  function loadState(){
    let state = getEmptyState();

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.progress);
      if(raw){
        const parsed = JSON.parse(raw);
        if(parsed && typeof parsed === 'object'){
          state = Object.assign(state, parsed);
        }
      }
    } catch(err){}

    try {
      const rawSections = localStorage.getItem(STORAGE_KEYS.completedSections);
      if(rawSections){
        const parsedSections = JSON.parse(rawSections);
        if(parsedSections && typeof parsedSections === 'object'){
          state.completedSections = parsedSections;
        }
      }
    } catch(err){}

    try {
      const rawModules = localStorage.getItem(STORAGE_KEYS.completedModules);
      if(rawModules){
        const parsedModules = JSON.parse(rawModules);
        if(Array.isArray(parsedModules)){
          state.completedModules = parsedModules;
        }
      }
    } catch(err){}

    try {
      const rawCurrent = localStorage.getItem(STORAGE_KEYS.currentModule);
      if(rawCurrent){
        state.currentModule = rawCurrent;
      }
    } catch(err){}

    normalizeState(state);
    return state;
  }

  function normalizeState(state){
    if(!state || typeof state !== 'object') return;

    if(typeof state.introductionCompleted !== 'boolean'){
      state.introductionCompleted = false;
    }

    if(!state.currentModule || !COURSE_MODULES[state.currentModule]){
      state.currentModule = 'introduction';
    }

    if(!state.completedSections || typeof state.completedSections !== 'object'){
      state.completedSections = {};
    }

    if(!Array.isArray(state.completedModules)){
      state.completedModules = [];
    }

    if(!state.lastActiveSection || typeof state.lastActiveSection !== 'object'){
      state.lastActiveSection = {};
    }

    COURSE_ORDER.forEach(function(moduleId){
      if(!Array.isArray(state.completedSections[moduleId])){
        state.completedSections[moduleId] = [];
      }
      state.completedSections[moduleId] = Array.from(new Set(state.completedSections[moduleId]));
    });

    if(state.completedSections.introduction.indexOf('training-introduction') >= 0){
      state.introductionCompleted = true;
    }
    if(state.introductionCompleted && state.completedSections.introduction.indexOf('training-introduction') === -1){
      state.completedSections.introduction.push('training-introduction');
    }

    state.completedModules = state.completedModules.filter(function(moduleId){
      return moduleId !== 'introduction' && COURSE_MODULES[moduleId];
    });
    state.completedModules = Array.from(new Set(state.completedModules));
  }

  function saveState(state){
    normalizeState(state);
    state.lastUpdatedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(state));
    localStorage.setItem(STORAGE_KEYS.currentModule, state.currentModule);
    localStorage.setItem(STORAGE_KEYS.completedSections, JSON.stringify(state.completedSections));
    localStorage.setItem(STORAGE_KEYS.completedModules, JSON.stringify(state.completedModules));
  }

  function getCurrentPageId(){
    const explicit = document.querySelector('[data-course-page]');
    if(explicit && explicit.getAttribute('data-course-page')){
      return explicit.getAttribute('data-course-page');
    }

    const filename = decodeURIComponent(window.location.pathname.split('/').pop() || 'index.html');
    const moduleIds = Object.keys(COURSE_MODULES);

    for(let i = 0; i < moduleIds.length; i++){
      const moduleId = moduleIds[i];
      const config = COURSE_MODULES[moduleId];
      if(config.file === filename) return moduleId;
      if(Array.isArray(config.aliases) && config.aliases.indexOf(filename) >= 0) return moduleId;
    }

    return null;
  }

  function getPreviousModuleId(moduleId){
    const index = COURSE_ORDER.indexOf(moduleId);
    if(index <= 0) return null;
    return COURSE_ORDER[index - 1];
  }

  function getNextModuleId(moduleId){
    const index = COURSE_ORDER.indexOf(moduleId);
    if(index < 0 || index === COURSE_ORDER.length - 1) return null;
    return COURSE_ORDER[index + 1];
  }

  function isModuleUnlocked(moduleId, state){
    if(moduleId === 'introduction') return true;
    const previous = getPreviousModuleId(moduleId);
    if(!previous) return true;
    if(previous === 'introduction') return !!state.introductionCompleted;
    return state.completedModules.indexOf(previous) >= 0;
  }

  function isModuleAvailable(moduleId){
    const config = COURSE_MODULES[moduleId];
    return !!(config && config.available && config.file);
  }

  function isModuleComplete(moduleId, state){
    if(moduleId === 'introduction') return !!state.introductionCompleted;
    const config = COURSE_MODULES[moduleId];
    if(!config) return false;
    const completed = new Set(state.completedSections[moduleId] || []);
    return config.sections.every(function(sectionId){ return completed.has(sectionId); });
  }

  function markIntroductionComplete(state){
    state.introductionCompleted = true;
    if(state.completedSections.introduction.indexOf('training-introduction') === -1){
      state.completedSections.introduction.push('training-introduction');
    }
    saveState(state);
  }

  function markSectionComplete(moduleId, sectionId, state){
    if(!COURSE_MODULES[moduleId]) return;
    if(moduleId === 'introduction'){
      markIntroductionComplete(state);
      return;
    }

    if(COURSE_MODULES[moduleId].sections.indexOf(sectionId) === -1) return;

    if(state.completedSections[moduleId].indexOf(sectionId) === -1){
      state.completedSections[moduleId].push(sectionId);
    }

    if(isModuleComplete(moduleId, state) && state.completedModules.indexOf(moduleId) === -1){
      state.completedModules.push(moduleId);
    }

    const nextModuleId = getNextModuleId(moduleId);
    if(nextModuleId && isModuleUnlocked(nextModuleId, state) && isModuleAvailable(nextModuleId)){
      state.currentModule = nextModuleId;
    } else {
      state.currentModule = moduleId;
    }

    saveState(state);
  }

  function getTotalCourseItems(){
    return COURSE_ORDER.reduce(function(total, moduleId){
      return total + COURSE_MODULES[moduleId].sections.length;
    }, 0);
  }

  function getCompletedItemCount(state){
    return COURSE_ORDER.reduce(function(total, moduleId){
      const sectionIds = COURSE_MODULES[moduleId].sections;
      const completed = new Set(state.completedSections[moduleId] || []);
      return total + sectionIds.filter(function(sectionId){ return completed.has(sectionId); }).length;
    }, 0);
  }

  function ensureToast(){
    let toast = document.getElementById('courseToast');
    if(toast) return toast;

    toast = document.createElement('div');
    toast.id = 'courseToast';
    toast.className = 'course-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
    return toast;
  }

  function showToast(message){
    const toast = ensureToast();
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){
      toast.classList.remove('is-visible');
    }, 2600);
  }

  function navigateToModule(moduleId, state){
    if(!COURSE_MODULES[moduleId] || !COURSE_MODULES[moduleId].file) return;
    state.currentModule = moduleId;
    saveState(state);
    window.location.href = COURSE_MODULES[moduleId].file;
  }

  function syncJourneyItems(state, pageId){
    document.querySelectorAll('[data-course-module-id]').forEach(function(item){
      const moduleId = item.getAttribute('data-course-module-id');
      if(!moduleId || !COURSE_MODULES[moduleId]) return;

      const unlocked = isModuleUnlocked(moduleId, state);
      const available = isModuleAvailable(moduleId);
      const completed = isModuleComplete(moduleId, state);
      const current = pageId === moduleId || state.currentModule === moduleId;

      item.classList.toggle('is-locked', !unlocked || !available);
      item.classList.toggle('completed', completed);
      item.classList.toggle('is-completed', completed);
      item.classList.toggle('is-current', current);

      let stateLabel = 'Unlocked';
      if(completed) stateLabel = 'Completed';
      else if(current) stateLabel = 'Current';
      else if(!unlocked) stateLabel = 'Locked';
      else if(!available) stateLabel = 'Unavailable';

      item.setAttribute('data-course-state-label', stateLabel);
      item.setAttribute('aria-disabled', (!unlocked || !available) ? 'true' : 'false');
    });
  }

  function syncCourseProgressUi(state){
    const totalItems = getTotalCourseItems();
    const completedItems = getCompletedItemCount(state);
    const percentage = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;

    const overallFill = document.getElementById('overallProgressFill');
    if(overallFill) overallFill.style.width = percentage + '%';

    const overallText = document.getElementById('overallProgressText');
    if(overallText) overallText.textContent = percentage + '% completed';

    const overallCount = document.getElementById('overallProgressCount');
    if(overallCount) overallCount.textContent = completedItems + ' / ' + totalItems;

    const moduleFill = document.getElementById('moduleProgressFill');
    if(moduleFill) moduleFill.style.width = percentage + '%';

    const moduleText = document.getElementById('moduleProgressText');
    if(moduleText) moduleText.textContent = percentage + '% completed • ' + completedItems + ' of ' + totalItems + ' course items';

    const moduleLabel = document.querySelector('.module-progress-top strong');
    if(moduleLabel) moduleLabel.textContent = 'Course Progress';
  }

  function syncModuleStageChecks(moduleId, state){
    const completed = new Set(state.completedSections[moduleId] || []);

    completed.forEach(function(sectionId){
      const input = document.querySelector('input[data-stage-check="' + sectionId + '"]');
      if(input && !input.checked){
        input.checked = true;
      }
      const label = input ? input.closest('.check-item') : null;
      if(label) label.classList.add('clicked');
    });
  }

  function syncNextModuleButtons(pageId, state){
    document.querySelectorAll('[data-course-next-module-button]').forEach(function(button){
      const nextModuleId = button.getAttribute('data-course-next-module-button');
      const moduleComplete = isModuleComplete(pageId, state);
      const targetUnlocked = nextModuleId ? isModuleUnlocked(nextModuleId, state) : false;
      const targetAvailable = nextModuleId ? isModuleAvailable(nextModuleId) : false;
      const canNavigate = moduleComplete && targetUnlocked && targetAvailable;

      button.classList.toggle('is-disabled', !canNavigate);
      button.setAttribute('aria-disabled', canNavigate ? 'false' : 'true');
      button.href = canNavigate ? COURSE_MODULES[nextModuleId].file : '#';

      if(button.getAttribute('data-course-bound') === '1') return;
      button.setAttribute('data-course-bound', '1');

      button.addEventListener('click', function(event){
        const liveState = loadState();
        if(!isModuleComplete(pageId, liveState)){
          event.preventDefault();
          showToast('Please complete the current module before continuing.');
          return;
        }
        if(!nextModuleId || !isModuleAvailable(nextModuleId)){
          event.preventDefault();
          showToast('The next module page is not available yet.');
          return;
        }
        liveState.currentModule = nextModuleId;
        saveState(liveState);
      });
    });
  }

  function setupCourseModuleLinks(pageId, state){
    document.querySelectorAll('[data-course-module-id]').forEach(function(item){
      if(item.getAttribute('data-course-bound') === '1') return;
      item.setAttribute('data-course-bound', '1');

      function onActivate(event){
        if(event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
        if(event.type === 'keydown') event.preventDefault();
        if(event.target && event.target.closest('a, button, input, label')) return;

        const targetModuleId = item.getAttribute('data-course-module-id');
        const liveState = loadState();

        if(targetModuleId === pageId){
          return;
        }

        if(!isModuleUnlocked(targetModuleId, liveState)){
          showToast('Please complete the previous module before continuing.');
          return;
        }

        if(!isModuleAvailable(targetModuleId)){
          showToast('This module page is not available yet.');
          return;
        }

        if(pageId === 'introduction' && targetModuleId === 'module1'){
          markIntroductionComplete(liveState);
        }

        navigateToModule(targetModuleId, liveState);
      }

      item.addEventListener('click', onActivate);
      item.addEventListener('keydown', onActivate);
    });
  }

  function setupOverviewLinks(state){
    document.querySelectorAll('[data-course-overview-link]').forEach(function(link){
      if(link.getAttribute('data-course-bound') === '1') return;
      link.setAttribute('data-course-bound', '1');
    });
  }

  function setupIntroductionPage(state){
    document.querySelectorAll('[data-course-start-training]').forEach(function(link){
      if(link.getAttribute('data-course-bound') === '1') return;
      link.setAttribute('data-course-bound', '1');
      link.addEventListener('click', function(event){
        event.preventDefault();
        const liveState = loadState();
        markIntroductionComplete(liveState);
        navigateToModule('module1', liveState);
      });
    });
  }

  function restoreLastSection(moduleId, state){
    if(window.location.hash) return;

    const savedSection = state.lastActiveSection[moduleId];
    if(!savedSection) return;

    const target = document.getElementById(savedSection);
    if(!target) return;

    setTimeout(function(){
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 280);
  }

  function setupSectionTracking(moduleId, state){
    const sectionIds = COURSE_MODULES[moduleId].sections.filter(function(sectionId){
      return !!document.getElementById(sectionId);
    });

    if(!sectionIds.length) return;

    const observer = new IntersectionObserver(function(entries){
      const visible = entries
        .filter(function(entry){ return entry.isIntersecting; })
        .sort(function(a, b){ return b.intersectionRatio - a.intersectionRatio; });

      if(!visible.length) return;

      const currentSectionId = visible[0].target.id;
      const liveState = loadState();
      liveState.currentModule = moduleId;
      liveState.lastActiveSection[moduleId] = currentSectionId;
      saveState(liveState);
      syncJourneyItems(liveState, moduleId);
      syncCourseProgressUi(liveState);
    }, {
      root: null,
      threshold: [0.25, 0.4, 0.6],
      rootMargin: '-10% 0px -45% 0px'
    });

    sectionIds.forEach(function(sectionId){
      const section = document.getElementById(sectionId);
      if(section) observer.observe(section);
    });

    restoreLastSection(moduleId, state);
  }

  function setupModuleCompletionTracking(moduleId, state){
    document.querySelectorAll('input[data-stage-check]').forEach(function(input){
      if(input.getAttribute('data-course-bound') === '1') return;
      input.setAttribute('data-course-bound', '1');

      input.addEventListener('change', function(){
        const sectionId = input.getAttribute('data-stage-check');
        if(!sectionId || sectionId === 'complete' || sectionId === 'quiz') return;

        const liveState = loadState();
        if(input.checked){
          markSectionComplete(moduleId, sectionId, liveState);
        } else {
          saveState(liveState);
        }

        syncModuleStageChecks(moduleId, liveState);
        syncJourneyItems(liveState, moduleId);
        syncCourseProgressUi(liveState);
        syncNextModuleButtons(moduleId, liveState);
      });
    });
  }

  function init(){
    const pageId = getCurrentPageId();
    if(!pageId) return;

    const state = loadState();
    if(pageId !== 'introduction'){
      state.currentModule = pageId;
    } else if(!state.currentModule){
      state.currentModule = 'introduction';
    }
    saveState(state);

    ensureToast();
    setupOverviewLinks(state);
    setupCourseModuleLinks(pageId, state);

    if(pageId === 'introduction'){
      setupIntroductionPage(state);
    } else {
      setupModuleCompletionTracking(pageId, state);
      setupSectionTracking(pageId, state);
      syncModuleStageChecks(pageId, state);
      syncNextModuleButtons(pageId, state);
    }

    syncJourneyItems(state, pageId);
    syncCourseProgressUi(state);

    setTimeout(function(){
      const liveState = loadState();
      syncJourneyItems(liveState, pageId);
      syncCourseProgressUi(liveState);
      if(pageId !== 'introduction'){
        syncModuleStageChecks(pageId, liveState);
        syncNextModuleButtons(pageId, liveState);
      }
    }, 350);

    window.addEventListener('storage', function(){
      const liveState = loadState();
      syncJourneyItems(liveState, pageId);
      syncCourseProgressUi(liveState);
      if(pageId !== 'introduction'){
        syncModuleStageChecks(pageId, liveState);
        syncNextModuleButtons(pageId, liveState);
      }
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
