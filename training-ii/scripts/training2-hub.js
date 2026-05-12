(function(){
  var REVIEW_MODE = true;
  var STORAGE_KEYS = {
    progress: 'cs_swimming_training_progress'
  };

  var COURSE_ORDER = ['introduction', 'module1', 'module2', 'module3', 'module4', 'module5', 'module6'];
  var COURSE_MODULES = {
    introduction: {
      file: '/training-ii/introduction/',
      sections: ['training-introduction']
    },
    module1: {
      file: '/training-ii/modules/module-1/',
      sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'quiz']
    },
    module2: {
      file: '/training-ii/modules/module-2/',
      sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'quiz']
    },
    module3: {
      file: '/training-ii/modules/module-3/',
      sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'quiz']
    },
    module4: {
      file: '/training-ii/modules/module-4/',
      sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'quiz']
    },
    module5: {
      file: '/training-ii/modules/module-5/',
      sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'quiz']
    },
    module6: {
      file: '/training-ii/modules/module-6/',
      sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'quiz']
    }
  };

  var MODULE_CARD_CONTENT = {
    module1: {
      title: 'Foundations of Aquatic Skill Development',
      subtitle: 'Understanding how aquatic learning begins.',
      intro: 'The first learner module after the Training Introduction, focused on how aquatic learning starts and how strong foundations are built.'
    },
    module2: {
      title: 'Guiding Learning Through Scaffolding and the CS Learning Principle',
      subtitle: 'Structuring support, progression and teaching decisions.',
      intro: 'This review version keeps the full Module 2 flow visible so scaffolding, progression and teaching decision points can be checked end to end.'
    },
    module3: {
      title: 'Early Aquatic Experiences',
      subtitle: 'Supporting first contact, entry and exit in the water and early familiarisation.',
      intro: 'This review version keeps the full Module 3 flow visible so the early-experience pathway can be checked before the final content is locked in.'
    },
    module4: {
      title: 'Core Aquatic Skills',
      subtitle: 'Developing breathing control, balance, gliding, streamlining and rotation.',
      intro: 'This review version keeps the full Module 4 flow visible so the core-skill progression can be checked from journey to completion.'
    },
    module5: {
      title: 'Propulsion Development in the Water',
      subtitle: 'Building functional movement through the water.',
      intro: 'This review version keeps the full Module 5 flow visible so propulsion development can be reviewed across the complete module structure.'
    },
    module6: {
      title: 'Swimming Strokes and Advanced Techniques',
      subtitle: 'Applying aquatic foundations to strokes and advanced skills.',
      intro: 'This review version keeps the full Module 6 flow visible so the final advanced-technique pathway can be checked from start to finish.'
    }
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
    } catch(error){
      return getEmptyState();
    }
  }

  function getCompletedItemCount(state){
    return COURSE_ORDER.reduce(function(total, moduleId){
      return total + (state.completedSections[moduleId] || []).length;
    }, 0);
  }

  function isModuleUnlocked(moduleId, state){
    if(REVIEW_MODE && moduleId !== 'introduction') return true;
    if(moduleId === 'introduction') return true;
    if(moduleId === 'module1') return !!state.introductionCompleted;

    var previousId = 'module' + (Number(moduleId.replace('module', '')) - 1);
    return state.completedModules.indexOf(previousId) >= 0;
  }

  function isModuleComplete(moduleId, state){
    if(!COURSE_MODULES[moduleId]) return false;
    if(Array.isArray(state.completedModules) && state.completedModules.indexOf(moduleId) >= 0){
      return true;
    }
    return COURSE_MODULES[moduleId].sections.every(function(sectionId){
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
      return {
        href: COURSE_MODULES.introduction.file,
        label: 'Start Training Introduction'
      };
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

    return {
      href: COURSE_MODULES.module6.file + '#quiz',
      label: 'Review Completion'
    };
  }

  function setButtonState(button, text, href, className, disabled){
    if(!button) return;
    button.textContent = text;
    button.href = href;
    button.className = 'btn ' + className;
    button.setAttribute('aria-disabled', disabled ? 'true' : 'false');
  }

  function renderHub(){
    var state = loadState();
    var total = COURSE_ORDER.reduce(function(sum, moduleId){
      return sum + COURSE_MODULES[moduleId].sections.length;
    }, 0);
    var completed = getCompletedItemCount(state);
    var percent = total ? Math.round((completed / total) * 100) : 0;

    var summary = document.getElementById('progressSummary');
    var summaryFill = document.getElementById('progressSummaryFill');
    var summaryText = document.getElementById('progressSummaryText');

    if(summary){
      summary.classList.toggle('visible', completed > 0 || !!state.introductionCompleted);
    }
    if(summaryFill){
      summaryFill.style.width = percent + '%';
    }
    if(summaryText){
      summaryText.textContent = percent + '% completed • ' + completed + ' of ' + total + ' stages completed';
    }

    var introButton = document.getElementById('hubIntroductionButton');
    if(introButton){
      introButton.href = COURSE_MODULES.introduction.file;
      introButton.textContent = state.introductionCompleted ? 'Review Training Introduction' : 'Open Training Introduction';
    }

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
      var content = MODULE_CARD_CONTENT[moduleId];

      if(content){
        var title = card.querySelector('h3');
        var subtitle = card.querySelector('.module-subtitle');
        var intro = card.querySelector('.module-intro');
        if(title) title.textContent = content.title;
        if(subtitle) subtitle.textContent = content.subtitle;
        if(intro) intro.textContent = content.intro;
      }

      card.classList.toggle('is-locked', !unlocked && !REVIEW_MODE);

      if(status){
        status.className = 'module-status-badge';
        if(completedModule){
          status.classList.add('status-completed');
          status.textContent = 'Completed';
        } else if(!unlocked && !REVIEW_MODE){
          status.classList.add('status-locked');
          status.textContent = 'Locked';
        } else if(current || inProgress){
          status.classList.add('status-in-progress');
          status.textContent = 'In progress';
        } else {
          status.classList.add('status-not-started');
          status.textContent = 'Not started';
        }
      }

      if(!button) return;

      if(completedModule){
        setButtonState(button, 'Review Module', COURSE_MODULES[moduleId].file, 'btn-continue', false);
      } else if(current || inProgress){
        setButtonState(
          button,
          'Continue Module',
          COURSE_MODULES[moduleId].file + '#' + getFirstIncompleteSection(moduleId, state),
          'btn-continue',
          false
        );
      } else if(unlocked){
        setButtonState(button, 'Start Module', COURSE_MODULES[moduleId].file, 'btn-primary', false);
      } else {
        setButtonState(button, 'Locked', '#', 'btn-disabled', true);
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
