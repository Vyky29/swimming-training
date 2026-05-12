(function(){
  var STORAGE_KEYS = {
    progress: 'cs_swimming_training_progress',
    currentModule: 'cs_swimming_training_current_module',
    completedSections: 'cs_swimming_training_completed_sections',
    completedModules: 'cs_swimming_training_completed_modules'
  };

  var COURSE_ORDER = ['introduction', 'module1', 'module2', 'module3', 'module4', 'module5', 'module6'];
  var COURSE_MODULES = {
    introduction: { file: 'swimming-training-introduction.html', sections: ['training-introduction'] },
    module1: { file: 'Javier-module1.html', sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap'] },
    module2: { file: 'Javier-module2.html', sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap'] },
    module3: { file: 'Javier-module3.html', sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap'] },
    module4: { file: 'Javier-module4.html', sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap'] },
    module5: { file: 'Javier-module5.html', sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap'] },
    module6: { file: 'Javier-module6.html', sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap'] }
  };

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
    var next = state && typeof state === 'object' ? state : getEmptyState();
    var empty = getEmptyState();

    Object.keys(empty).forEach(function(key){
      if(next[key] === undefined){
        next[key] = empty[key];
      }
    });

    COURSE_ORDER.forEach(function(moduleId){
      if(!Array.isArray(next.completedSections[moduleId])){
        next.completedSections[moduleId] = [];
      }
    });

    if(!Array.isArray(next.completedModules)){
      next.completedModules = [];
    }

    next.courseCompleted = next.completedModules.indexOf('module6') >= 0;
    return next;
  }

  function loadState(){
    try{
      return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEYS.progress) || '{}'));
    } catch (error){
      return getEmptyState();
    }
  }

  function getCompletedItemCount(state){
    return COURSE_ORDER.reduce(function(total, moduleId){
      return total + (state.completedSections[moduleId] || []).length;
    }, 0);
  }

  function isModuleUnlocked(moduleId, state){
    if(moduleId === 'introduction') return true;
    if(moduleId === 'module1') return !!state.introductionCompleted;

    var previousId = 'module' + (Number(moduleId.replace('module', '')) - 1);
    return state.completedModules.indexOf(previousId) >= 0;
  }

  function isModuleComplete(moduleId, state){
    if(!COURSE_MODULES[moduleId]) return false;
    var required = COURSE_MODULES[moduleId].sections;
    return required.every(function(sectionId){
      return (state.completedSections[moduleId] || []).indexOf(sectionId) >= 0;
    });
  }

  function getFirstIncompleteSection(moduleId, state){
    var required = COURSE_MODULES[moduleId] ? COURSE_MODULES[moduleId].sections : [];
    for(var i = 0; i < required.length; i += 1){
      if((state.completedSections[moduleId] || []).indexOf(required[i]) === -1){
        return required[i];
      }
    }
    return required[required.length - 1] || null;
  }

  function getResumeTarget(state){
    if(!state.introductionCompleted){
      return { href: COURSE_MODULES.introduction.file, label: 'Open Training Introduction' };
    }

    for(var i = 1; i < COURSE_ORDER.length; i += 1){
      var moduleId = COURSE_ORDER[i];
      if(!isModuleUnlocked(moduleId, state)) break;
      if(!isModuleComplete(moduleId, state)){
        var sectionId = getFirstIncompleteSection(moduleId, state);
        return {
          href: COURSE_MODULES[moduleId].file + (sectionId ? ('#' + sectionId) : ''),
          label: 'Resume Training'
        };
      }
    }

    return { href: COURSE_MODULES.module6.file + '#complete', label: 'Review Completion' };
  }

  function renderHub(){
    var state = loadState();
    var total = COURSE_ORDER.reduce(function(sum, moduleId){
      return sum + COURSE_MODULES[moduleId].sections.length;
    }, 0);
    var completed = getCompletedItemCount(state);
    var percent = total ? Math.round((completed / total) * 100) : 0;

    var fill = document.getElementById('hubOverallProgressFill');
    var text = document.getElementById('hubOverallProgressText');
    var count = document.getElementById('hubOverallProgressCount');
    if(fill) fill.style.width = percent + '%';
    if(text) text.textContent = percent + '% completed';
    if(count) count.textContent = completed + ' / ' + total;

    var resumeTarget = getResumeTarget(state);
    var resumeButton = document.getElementById('hubResumeButton');
    if(resumeButton && resumeTarget){
      resumeButton.href = resumeTarget.href;
      resumeButton.textContent = resumeTarget.label;
    }

    document.querySelectorAll('[data-hub-module-id]').forEach(function(card){
      var moduleId = card.getAttribute('data-hub-module-id');
      var button = card.querySelector('[data-hub-primary]');
      var status = card.querySelector('[data-hub-status]');
      var unlocked = isModuleUnlocked(moduleId, state);
      var completedModule = isModuleComplete(moduleId, state);
      var inProgress = !completedModule && unlocked && (state.completedSections[moduleId] || []).length > 0;
      var current = state.currentModule === moduleId && unlocked && !completedModule;

      if(status){
        status.className = 'module-status';
        if(completedModule){
          status.classList.add('status-completed');
          status.textContent = 'Completed';
        } else if(!unlocked){
          status.classList.add('status-locked');
          status.textContent = 'Locked';
        } else if(current || inProgress){
          status.textContent = 'In Progress';
        } else {
          status.textContent = 'Available';
        }
      }

      if(button){
        if(completedModule){
          button.href = COURSE_MODULES[moduleId].file;
          button.textContent = 'Review Module';
          button.classList.remove('is-disabled');
          button.setAttribute('aria-disabled', 'false');
        } else if(current || inProgress){
          button.href = COURSE_MODULES[moduleId].file + '#' + getFirstIncompleteSection(moduleId, state);
          button.textContent = 'Continue Module';
          button.classList.remove('is-disabled');
          button.setAttribute('aria-disabled', 'false');
        } else if(unlocked){
          button.href = COURSE_MODULES[moduleId].file;
          button.textContent = 'Open Module';
          button.classList.remove('is-disabled');
          button.setAttribute('aria-disabled', 'false');
        } else {
          button.href = '#';
          button.textContent = 'Locked';
          button.classList.add('is-disabled');
          button.setAttribute('aria-disabled', 'true');
        }
      }
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', renderHub);
  } else {
    renderHub();
  }

  window.addEventListener('storage', renderHub);
})();
