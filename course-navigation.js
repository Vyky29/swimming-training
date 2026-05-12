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
  const INTRO_SELECTIONS = [
    { key: 'focus', selector: '#focus .block-intro-card' },
    { key: 'explores', selector: '#explores .outcome' },
    { key: 'outcomes', selector: '#outcomes .outcome' }
  ];

  let toastTimer = null;

  function getEmptyState(){
    return {
      introductionCompleted: false,
      courseCompleted: false,
      currentModule: 'introduction',
      completedSections: {},
      completedModules: [],
      introSelections: {},
      lastActiveSection: {},
      lastUpdatedAt: null
    };
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

    if(!state.introSelections || typeof state.introSelections !== 'object'){
      state.introSelections = {};
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
    state.courseCompleted = state.completedModules.indexOf('module6') >= 0;
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

    return Object.keys(COURSE_MODULES).find(function(moduleId){
      const config = COURSE_MODULES[moduleId];
      return config.file === filename || (Array.isArray(config.aliases) && config.aliases.indexOf(filename) >= 0);
    }) || null;
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
    return config.sections.every(function(sectionId){
      return completed.has(sectionId);
    });
  }

  function getCompletedItemCount(state){
    return COURSE_ORDER.reduce(function(total, moduleId){
      const completed = new Set(state.completedSections[moduleId] || []);
      return total + COURSE_MODULES[moduleId].sections.filter(function(sectionId){
        return completed.has(sectionId);
      }).length;
    }, 0);
  }

  function getFirstIncompleteSection(moduleId, state){
    const config = COURSE_MODULES[moduleId];
    if(!config) return null;
    const completed = new Set(state.completedSections[moduleId] || []);
    return config.sections.find(function(sectionId){
      return !completed.has(sectionId);
    }) || config.sections[config.sections.length - 1] || null;
  }

  function getResumeTarget(state){
    const moduleId = state.currentModule && state.currentModule !== 'introduction'
      ? state.currentModule
      : (state.introductionCompleted ? 'module1' : null);
    if(!moduleId || !isModuleAvailable(moduleId)) return null;

    const sectionId = state.lastActiveSection[moduleId] || getFirstIncompleteSection(moduleId, state);

    return {
      moduleId: moduleId,
      sectionId: sectionId,
      href: COURSE_MODULES[moduleId].file + (sectionId ? ('#' + sectionId) : '')
    };
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

  function markIntroductionComplete(state){
    state.introductionCompleted = true;
    if(state.completedSections.introduction.indexOf('training-introduction') === -1){
      state.completedSections.introduction.push('training-introduction');
    }
    saveState(state);
  }

  function markSectionComplete(moduleId, sectionId, state){
    if(!COURSE_MODULES[moduleId] || moduleId === 'introduction') return;
    if(COURSE_MODULES[moduleId].sections.indexOf(sectionId) === -1) return;

    if(state.completedSections[moduleId].indexOf(sectionId) === -1){
      state.completedSections[moduleId].push(sectionId);
    }

    if(isModuleComplete(moduleId, state) && state.completedModules.indexOf(moduleId) === -1){
      state.completedModules.push(moduleId);
    }

    state.courseCompleted = state.completedModules.indexOf('module6') >= 0;
    state.currentModule = moduleId;
    saveState(state);
  }

  function navigateToModule(moduleId, state, targetSectionId){
    if(!COURSE_MODULES[moduleId] || !COURSE_MODULES[moduleId].file) return;
    state.currentModule = moduleId;
    if(targetSectionId){
      state.lastActiveSection[moduleId] = targetSectionId;
    }
    saveState(state);
    window.location.href = COURSE_MODULES[moduleId].file + (targetSectionId ? ('#' + targetSectionId) : '');
  }

  function composeJourneyStatus(prefix, original){
    const base = String(original || '').trim();
    if(!base) return prefix;
    if(base === prefix || base.indexOf(prefix + ' - ') === 0) return base;
    return prefix + ' - ' + base;
  }

  function syncJourneyItems(state, pageId){
    document.querySelectorAll('[data-course-module-id]').forEach(function(item){
      const moduleId = item.getAttribute('data-course-module-id');
      if(!moduleId || !COURSE_MODULES[moduleId]) return;

      const unlocked = isModuleUnlocked(moduleId, state);
      const available = isModuleAvailable(moduleId);
      const completed = isModuleComplete(moduleId, state);
      const current = pageId === moduleId || (pageId === 'introduction' && state.currentModule === moduleId);
      const inProgress = !completed && unlocked && available && (state.completedSections[moduleId] || []).length > 0;
      const statusEl = item.querySelector('.journey-status');

      item.classList.toggle('active', current);
      item.classList.toggle('completed', completed);
      item.classList.toggle('is-locked', !unlocked || !available);
      item.setAttribute('aria-disabled', (!unlocked || !available) ? 'true' : 'false');

      if(statusEl){
        if(!item.dataset.courseOriginalStatus){
          item.dataset.courseOriginalStatus = statusEl.textContent.trim();
        }
        const original = item.dataset.courseOriginalStatus;
        if(completed){
          statusEl.textContent = composeJourneyStatus('Completed', original);
        } else if(current){
          statusEl.textContent = composeJourneyStatus('Current Module', original);
        } else if(!unlocked || !available){
          statusEl.textContent = 'Locked';
        } else if(inProgress){
          statusEl.textContent = composeJourneyStatus('In Progress', original);
        } else {
          statusEl.textContent = original || 'Available';
        }
      }
    });
  }

  function syncCourseProgressUi(state, pageId){
    if(pageId !== 'introduction') return;

    const overallFill = document.getElementById('overallProgressFill');
    const overallText = document.getElementById('overallProgressText');
    const overallCount = document.getElementById('overallProgressCount');
    if(!overallFill || !overallText || !overallCount) return;

    const total = COURSE_ORDER.reduce(function(sum, moduleId){
      return sum + COURSE_MODULES[moduleId].sections.length;
    }, 0);
    const completed = getCompletedItemCount(state);
    const percent = total ? Math.round((completed / total) * 100) : 0;

    overallFill.style.width = percent + '%';
    overallText.textContent = percent + '% completed';
    overallCount.textContent = completed + ' / ' + total;
  }

  function renderResumeAction(state){
    const heroActions = document.querySelector('.hero-actions');
    if(!heroActions) return;

    let resumeButton = document.getElementById('courseResumeButton');
    const resumeTarget = getResumeTarget(state);
    const hasSavedProgress = state.introductionCompleted || getCompletedItemCount(state) > 0;

    if(!hasSavedProgress || !resumeTarget){
      if(resumeButton) resumeButton.remove();
      return;
    }

    if(!resumeButton){
      resumeButton = document.createElement('a');
      resumeButton.id = 'courseResumeButton';
      resumeButton.className = 'btn btn-secondary';
      resumeButton.textContent = 'Resume Training';
      heroActions.appendChild(resumeButton);
    }

    resumeButton.href = resumeTarget.href;
    resumeButton.onclick = function(event){
      event.preventDefault();
      const liveState = loadState();
      const liveResumeTarget = getResumeTarget(liveState);
      if(!liveResumeTarget){
        showToast('No saved progress was found.');
        return;
      }
      navigateToModule(liveResumeTarget.moduleId, liveState, liveResumeTarget.sectionId);
    };
  }

  function setupIntroductionSelections(){
    const state = loadState();
    INTRO_SELECTIONS.forEach(function(group){
      if(!Array.isArray(state.introSelections[group.key])){
        state.introSelections[group.key] = [];
      }

      document.querySelectorAll(group.selector).forEach(function(item, index){
        const itemKey = String(index);
        if(state.introSelections[group.key].indexOf(itemKey) >= 0){
          item.classList.add('clicked');
        }

        if(item.getAttribute('data-course-bound') === '1') return;
        item.setAttribute('data-course-bound', '1');

        if(!item.matches('button, a, input, select, textarea')){
          item.setAttribute('role', item.getAttribute('role') || 'button');
          if(!item.hasAttribute('tabindex')) item.setAttribute('tabindex', '0');
        }

        function markSelected(){
          const liveState = loadState();
          if(!Array.isArray(liveState.introSelections[group.key])){
            liveState.introSelections[group.key] = [];
          }
          if(liveState.introSelections[group.key].indexOf(itemKey) === -1){
            liveState.introSelections[group.key].push(itemKey);
          }
          item.classList.add('clicked');
          saveState(liveState);
        }

        item.addEventListener('click', markSelected);
        item.addEventListener('keydown', function(event){
          if(event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          markSelected();
        });
      });
    });

    saveState(state);
  }

  function setupCourseModuleLinks(pageId){
    document.querySelectorAll('[data-course-module-id]').forEach(function(item){
      if(item.getAttribute('data-course-journey-bound') === '1') return;
      item.setAttribute('data-course-journey-bound', '1');

      function onActivate(event){
        if(event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
        if(event.type === 'keydown') event.preventDefault();
        if(event.target && event.target.closest('a, button, input, label')) return;

        const targetModuleId = item.getAttribute('data-course-module-id');
        const liveState = loadState();

        if(targetModuleId === pageId) return;

        if(!isModuleUnlocked(targetModuleId, liveState)){
          showToast('Complete the previous item first.');
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

  function setupIntroductionPage(){
    document.querySelectorAll('[data-course-start-training]').forEach(function(link){
      if(link.getAttribute('data-course-start-bound') === '1') return;
      link.setAttribute('data-course-start-bound', '1');
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

  function backfillCheckedStagesToCourseState(moduleId){
    if(!COURSE_MODULES[moduleId] || moduleId === 'introduction') return;

    const validSections = new Set(COURSE_MODULES[moduleId].sections);
    const liveState = loadState();
    let changed = false;

    document.querySelectorAll('input[data-stage-check]').forEach(function(input){
      const sectionId = input.getAttribute('data-stage-check');
      if(!sectionId || !validSections.has(sectionId) || !input.checked) return;

      if(liveState.completedSections[moduleId].indexOf(sectionId) === -1){
        liveState.completedSections[moduleId].push(sectionId);
        changed = true;
      }
    });

    if(isModuleComplete(moduleId, liveState) && liveState.completedModules.indexOf(moduleId) === -1){
      liveState.completedModules.push(moduleId);
      changed = true;
    }

    if(changed){
      liveState.currentModule = moduleId;
      saveState(liveState);
      syncJourneyItems(liveState, moduleId);
      syncNextModuleButtons(moduleId, liveState);
    }
  }

  function setupModuleCompletionTracking(moduleId){
    document.querySelectorAll('input[data-stage-check]').forEach(function(input){
      if(input.getAttribute('data-course-stage-bound') === '1') return;
      input.setAttribute('data-course-stage-bound', '1');

      input.addEventListener('change', function(){
        const sectionId = input.getAttribute('data-stage-check');
        if(!sectionId || sectionId === 'complete' || sectionId === 'quiz') return;

        const liveState = loadState();
        if(input.checked){
          markSectionComplete(moduleId, sectionId, liveState);
        } else {
          saveState(liveState);
        }

        syncJourneyItems(liveState, moduleId);
        syncNextModuleButtons(moduleId, liveState);
      });
    });
  }

  function syncNextModuleButtons(pageId, state){
    document.querySelectorAll('[data-course-next-module-button]').forEach(function(button){
      const nextModuleId = button.getAttribute('data-course-next-module-button');
      const canNavigate = !!(
        nextModuleId &&
        isModuleComplete(pageId, state) &&
        isModuleUnlocked(nextModuleId, state) &&
        isModuleAvailable(nextModuleId)
      );

      button.classList.toggle('is-disabled', !canNavigate);
      button.setAttribute('aria-disabled', canNavigate ? 'false' : 'true');
      button.href = canNavigate ? COURSE_MODULES[nextModuleId].file : '#';

      if(button.getAttribute('data-course-next-bound') === '1') return;
      button.setAttribute('data-course-next-bound', '1');

      button.addEventListener('click', function(event){
        const liveState = loadState();
        if(!isModuleComplete(pageId, liveState)){
          event.preventDefault();
          showToast('Complete the previous item first.');
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

  function init(){
    const pageId = getCurrentPageId();
    if(!pageId) return;

    const state = loadState();
    if(pageId !== 'introduction'){
      state.currentModule = pageId;
    }
    saveState(state);

    ensureToast();
    setupCourseModuleLinks(pageId);

    if(pageId === 'introduction'){
      setupIntroductionPage();
      setupIntroductionSelections();
      renderResumeAction(state);
      syncCourseProgressUi(state, pageId);
    } else {
      setupModuleCompletionTracking(pageId);
      setupSectionTracking(pageId, state);
      syncModuleStageChecks(pageId, state);
      syncNextModuleButtons(pageId, state);
      backfillCheckedStagesToCourseState(pageId);
    }

    syncJourneyItems(state, pageId);

    setTimeout(function(){
      const liveState = loadState();
      syncJourneyItems(liveState, pageId);
      if(pageId === 'introduction'){
        renderResumeAction(liveState);
        syncCourseProgressUi(liveState, pageId);
      } else {
        backfillCheckedStagesToCourseState(pageId);
        syncModuleStageChecks(pageId, liveState);
        syncNextModuleButtons(pageId, liveState);
      }
    }, 350);

    window.addEventListener('storage', function(){
      const liveState = loadState();
      syncJourneyItems(liveState, pageId);
      if(pageId === 'introduction'){
        renderResumeAction(liveState);
        syncCourseProgressUi(liveState, pageId);
      } else {
        backfillCheckedStagesToCourseState(pageId);
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
