(function(){
  var voice = null;
  var synth = window.speechSynthesis || null;
  var speakingButton = null;
  var COURSE_STORAGE_KEYS = {
    progress: 'cs_swimming_training_progress',
    currentModule: 'cs_swimming_training_current_module',
    completedSections: 'cs_swimming_training_completed_sections',
    completedModules: 'cs_swimming_training_completed_modules'
  };

  function getModulePage(){
    var root = document.querySelector('[data-course-page]');
    return root ? root.getAttribute('data-course-page') : 'module-shell';
  }

  function getStorageKey(moduleId){
    return 'cs_training2_shell_' + moduleId;
  }

  function getCourseModuleIds(){
    return ['introduction', 'module1', 'module2', 'module3', 'module4', 'module5', 'module6'];
  }

  function loadCourseState(){
    var state = {};
    try{
      state = JSON.parse(localStorage.getItem(COURSE_STORAGE_KEYS.progress) || '{}') || {};
    } catch(error){
      state = {};
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
    if(!state.introSelections || typeof state.introSelections !== 'object'){
      state.introSelections = {};
    }

    getCourseModuleIds().forEach(function(id){
      if(!Array.isArray(state.completedSections[id])){
        state.completedSections[id] = [];
      }
    });

    state.introductionCompleted = !!state.introductionCompleted;
    state.courseCompleted = state.completedModules.indexOf('module6') >= 0;
    state.currentModule = state.currentModule || 'introduction';
    return state;
  }

  function saveCourseState(state){
    state.lastUpdatedAt = new Date().toISOString();
    localStorage.setItem(COURSE_STORAGE_KEYS.progress, JSON.stringify(state));
    localStorage.setItem(COURSE_STORAGE_KEYS.currentModule, state.currentModule);
    localStorage.setItem(COURSE_STORAGE_KEYS.completedSections, JSON.stringify(state.completedSections));
    localStorage.setItem(COURSE_STORAGE_KEYS.completedModules, JSON.stringify(state.completedModules));
    window.dispatchEvent(new Event('storage'));
  }

  function syncCourseState(moduleId){
    var courseState = loadCourseState();
    var requiredSections = ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap'];
    var checkedSections = Array.from(document.querySelectorAll('input[data-stage-check]:checked')).map(function(input){
      return input.getAttribute('data-stage-check');
    }).filter(function(stageId){
      return requiredSections.indexOf(stageId) >= 0;
    });
    var completeCheck = document.getElementById('completeStageCheck');
    var isExplicitlyComplete = !!(completeCheck && completeCheck.checked);

    courseState.completedSections[moduleId] = Array.from(new Set(
      isExplicitlyComplete ? requiredSections.slice() : checkedSections
    ));
    courseState.currentModule = moduleId;

    if(courseState.completedSections[moduleId].length === requiredSections.length){
      if(courseState.completedModules.indexOf(moduleId) === -1){
        courseState.completedModules.push(moduleId);
      }
    } else {
      courseState.completedModules = courseState.completedModules.filter(function(entry){
        return entry !== moduleId;
      });
    }

    courseState.courseCompleted = courseState.completedModules.indexOf('module6') >= 0;
    saveCourseState(courseState);
  }

  function getEmptyState(){
    return {
      checkedStages: [],
      clickedItems: [],
      completed: false
    };
  }

  var TRAINING_I_STYLE_COPY = {
    module2: {
      number: 2,
      title: 'Guiding Learning Through Scaffolding and the CS Learning Principle',
      nextId: 'module3',
      nextLabel: 'Module 3 - Early Aquatic Experiences',
      journeyText: 'This module sits after Module 1 and introduces a clearer learning structure around scaffolding, guidance, and the CS Learning Principle before the course moves into early aquatic experiences.',
      completionText: 'You have now completed the Module 2 page structure. Add the approved content and concept-level copy here before progressing into Module 3.'
    },
    module3: {
      number: 3,
      title: 'Early Aquatic Experiences',
      nextId: 'module4',
      nextLabel: 'Module 4 - Core Aquatic Skills',
      journeyText: 'This module sits after Module 2 and before Module 4. Use this page to map the approved early-experience content into the same section and concept structure used across Training I.',
      completionText: 'You have now completed the Module 3 page structure. Add the approved content and concept-level copy here before progressing into Module 4.'
    },
    module4: {
      number: 4,
      title: 'Core Aquatic Skills',
      nextId: 'module5',
      nextLabel: 'Module 5 - Propulsion Development in the Water',
      journeyText: 'This module sits after Module 3 and before Module 5. Use this page to organise the approved core-skills content with the same headings, blocks, and concept rhythm as Training I.',
      completionText: 'You have now completed the Module 4 page structure. Add the approved content and concept-level copy here before progressing into Module 5.'
    },
    module5: {
      number: 5,
      title: 'Propulsion Development in the Water',
      nextId: 'module6',
      nextLabel: 'Module 6 - Swimming Strokes and Advanced Techniques',
      journeyText: 'This module sits after Module 4 and before Module 6. Use this page to organise propulsion content using the same visible section titles and concept flow as the Training I modules.',
      completionText: 'You have now completed the Module 5 page structure. Add the approved content and concept-level copy here before progressing into Module 6.'
    },
    module6: {
      number: 6,
      title: 'Swimming Strokes and Advanced Techniques',
      nextId: null,
      nextLabel: 'Final module of the Training II pathway',
      journeyText: 'This is the final module in the Training II pathway. Use this page to bring the approved stroke and advanced-technique content into the same structured section and concept layout used in Training I.',
      completionText: 'You have now completed the Module 6 page structure. Add the approved content and concept-level copy here to complete the full Training II pathway.'
    }
  };

  function buildListMarkup(items){
    return items.map(function(item){
      return '<li>' + item + '</li>';
    }).join('');
  }

  function buildConceptMarkup(moduleNumber, blockNumber){
    var conceptCards = [1, 2, 3, 4].map(function(index){
      return '' +
        '<button type="button" class="concept-square clickable-progress">' +
          'Add the approved concept ' + index + ' title' +
        '</button>';
    }).join('');

    return '' +
      '<div class="concept-stage">' +
        '<h4>Explore the Key Concepts</h4>' +
        '<p>Use these concept placeholders to mirror the same concept-by-concept structure used in the Training I modules.</p>' +
        '<div class="concept-grid">' + conceptCards + '</div>' +
        '<div class="concept-panel clickable-progress">' +
          '<div class="concept-heading-row">' +
            '<h4>Concept content area</h4>' +
          '</div>' +
          '<p class="concept-panel-desc">Add the approved explanation, examples, and supporting notes for Module ' + moduleNumber + ' Block ' + blockNumber + ' here so each concept follows the same visible rhythm as Training I.</p>' +
          '<div class="concept-points-box">' +
            '<h4>Key Ideas for Instructors</h4>' +
            '<ul>' + buildListMarkup([
              'Add the key teaching idea for this concept.',
              'Add the point instructors should notice or apply.',
              'Add the final takeaway that supports delivery in practice.'
            ]) + '</ul>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="reflection-card clickable-progress">' +
        '<h4>Reflection checkpoint</h4>' +
        '<p>Add the approved reflection, checkpoint question, or applied activity here so the end of the block follows the same structure as the Training I modules.</p>' +
      '</div>';
  }

  function buildBlockCards(moduleNumber, blockNumber){
    return '' +
      '<div class="grid-2 block-intro-cards">' +
        '<article class="card icon-card block-intro-card clickable-progress">' +
          '<div class="card-icon">◎</div>' +
          '<h4>Block Focus</h4>' +
          '<ul>' + buildListMarkup([
            'Add the approved teaching focus for Module ' + moduleNumber + ' Block ' + blockNumber + '.'
          ]) + '</ul>' +
        '</article>' +
        '<article class="card icon-card block-intro-card clickable-progress">' +
          '<div class="card-icon">≡</div>' +
          '<h4>What This Block Covers</h4>' +
          '<ul>' + buildListMarkup([
            'Approved concept area 1',
            'Approved concept area 2',
            'Approved concept area 3',
            'Approved concept area 4'
          ]) + '</ul>' +
        '</article>' +
      '</div>' +
      buildConceptMarkup(moduleNumber, blockNumber);
  }

  function updateCheckText(sectionId, title, detail){
    var textWrap = document.querySelector('#' + sectionId + ' .check-text');
    if(textWrap){
      textWrap.innerHTML = '<strong>' + title + '</strong><span>' + detail + '</span>';
    }
  }

  function normalizeModuleNavigation(){
    var navList = document.querySelector('.nav-list');
    if(!navList) return;

    navList.innerHTML = [
      { id: 'overview', label: 'Overview' },
      { id: 'journey', label: 'Swimming Journey' },
      { id: 'outcomes', label: 'Learning Outcomes' },
      { id: 'block1', label: 'Block 1' },
      { id: 'block2', label: 'Block 2' },
      { id: 'block3', label: 'Block 3' },
      { id: 'recap', label: 'Recap' },
      { id: 'complete', label: 'Completion' }
    ].map(function(item, index){
      return '<a class="nav-link' + (index === 0 ? ' active' : '') + '" href="#' + item.id + '" data-stage="' + item.id + '" data-scroll="' + item.id + '">' + item.label + '</a>';
    }).join('');
  }

  function updateBlockSection(moduleMeta, blockNumber){
    var section = document.getElementById('block' + blockNumber);
    if(!section) return;

    var title = section.querySelector('.block-title-wrap h3');
    if(title) title.textContent = 'Add the approved Block ' + blockNumber + ' title';

    var lead = section.querySelector('.lead');
    if(lead){
      lead.textContent = 'Use this block to add the approved Module ' + moduleMeta.number + ' Block ' + blockNumber + ' content while keeping the same title structure, concept flow, and checkpoint rhythm as Training I.';
    }

    var cardGrid = section.querySelector('.grid-2');
    if(cardGrid){
      cardGrid.outerHTML = buildBlockCards(moduleMeta.number, blockNumber);
    }

    updateCheckText(
      'block' + blockNumber,
      'I have completed Block ' + blockNumber + '.',
      'Use this once the approved block copy, concepts, and reflection checkpoint are in place.'
    );
  }

  function applyTrainingIModulePattern(moduleId){
    var moduleMeta = TRAINING_I_STYLE_COPY[moduleId];
    if(!moduleMeta) return;

    document.title = 'clubSENsational Training Module ' + moduleMeta.number + ' | ' + moduleMeta.title;

    var heroTitle = document.querySelector('#overview h2');
    if(heroTitle) heroTitle.textContent = 'Module ' + moduleMeta.number + ' - ' + moduleMeta.title;

    var heroBody = document.querySelector('#overview p');
    if(heroBody){
      heroBody.innerHTML = 'This page now follows the same visible section structure as the Training I modules.<br><br>Add the approved Module ' + moduleMeta.number + ' content into the same sequence of Swimming Journey, Learning Outcomes, three named blocks, key concepts, recap, and completion.';
    }

    var heroPills = document.querySelectorAll('#overview .meta-pill');
    if(heroPills[0]) heroPills[0].textContent = 'Training I section structure';
    if(heroPills[1]) heroPills[1].textContent = '3 named blocks with concept areas';
    if(heroPills[2]) heroPills[2].textContent = moduleMeta.nextId ? ('Next: ' + moduleMeta.nextLabel) : moduleMeta.nextLabel;

    var journeyTitle = document.querySelector('#journey .section-title-row h3');
    if(journeyTitle) journeyTitle.textContent = 'clubSENsational Swimming Journey';

    var journeyPanelTitle = document.querySelector('#journey .journey-panel h4');
    if(journeyPanelTitle) journeyPanelTitle.textContent = 'Module ' + moduleMeta.number + ' - ' + moduleMeta.title;

    var journeyPanelText = document.querySelector('#journey .journey-panel p');
    if(journeyPanelText) journeyPanelText.textContent = moduleMeta.journeyText;

    updateCheckText(
      'journey',
      'Journey reviewed',
      'I understand where this module sits within the wider clubSENsational Swimming journey.'
    );

    var outcomesTitle = document.querySelector('#outcomes .section-title-row h3');
    if(outcomesTitle) outcomesTitle.textContent = 'What will you understand by the end of this module?';

    var outcomesLead = document.querySelector('#outcomes .lead');
    if(outcomesLead) outcomesLead.textContent = 'Add the approved learning outcomes for Module ' + moduleMeta.number + ' below.';

    var outcomes = document.querySelectorAll('#outcomes .outcome div:last-child');
    outcomes.forEach(function(item, index){
      item.textContent = 'Approved learning outcome ' + (index + 1) + ' for Module ' + moduleMeta.number + '.';
    });

    updateCheckText(
      'outcomes',
      'Outcomes reviewed',
      'I have reviewed all learning outcomes and I am ready to begin Block 1.'
    );

    updateBlockSection(moduleMeta, 1);
    updateBlockSection(moduleMeta, 2);
    updateBlockSection(moduleMeta, 3);

    var recapTitle = document.querySelector('#recap .section-title-row h3');
    if(recapTitle) recapTitle.textContent = 'Key Ideas to Remember';

    var recapLead = document.querySelector('#recap .lead');
    if(recapLead) recapLead.textContent = 'Use these recap cards to capture the approved summary points for Module ' + moduleMeta.number + '.';

    var recapCards = document.querySelectorAll('#recap .recap-card');
    recapCards.forEach(function(card, index){
      var heading = card.querySelector('h4');
      var body = card.querySelector('p');
      if(heading) heading.textContent = 'Approved recap point ' + (index + 1);
      if(body) body.textContent = 'Add the approved recap wording for Module ' + moduleMeta.number + ' here.';
    });

    updateCheckText(
      'recap',
      'Recap reviewed',
      'I have reviewed the recap and I am ready to complete the module.'
    );

    var completionTitle = document.querySelector('#complete .completion-box h3');
    if(completionTitle) completionTitle.textContent = 'Module ' + moduleMeta.number + ' complete';

    var completionText = document.querySelector('#complete .completion-box p');
    if(completionText) completionText.textContent = moduleMeta.completionText;

    var completionNote = document.querySelector('#complete .completion-note');
    if(completionNote){
      completionNote.textContent = 'Keep this final section for the completion summary, final action, and next-step link once the approved content is in place.';
    }
  }

  function loadState(moduleId){
    try{
      var parsed = JSON.parse(localStorage.getItem(getStorageKey(moduleId)) || '{}');
      var base = getEmptyState();
      if(!Array.isArray(parsed.checkedStages)) parsed.checkedStages = [];
      if(!Array.isArray(parsed.clickedItems)) parsed.clickedItems = [];
      parsed.completed = !!parsed.completed;
      return Object.assign(base, parsed);
    } catch (error){
      return getEmptyState();
    }
  }

  function saveState(moduleId, state){
    localStorage.setItem(getStorageKey(moduleId), JSON.stringify(state));
  }

  function updateProgress(stageOrder){
    var completed = stageOrder.filter(function(stageId){
      var input = document.querySelector('input[data-stage-check="' + stageId + '"]');
      return !!(input && input.checked);
    }).length;
    var total = stageOrder.length;
    var percent = total ? Math.round((completed / total) * 100) : 0;

    var fill = document.getElementById('moduleProgressFill');
    var text = document.getElementById('moduleProgressText');
    var count = document.getElementById('overallProgressCount');
    var overallFill = document.getElementById('overallProgressFill');
    var overallText = document.getElementById('overallProgressText');

    if(fill) fill.style.width = percent + '%';
    if(text) text.textContent = percent + '% completed';
    if(overallFill) overallFill.style.width = percent + '%';
    if(overallText) overallText.textContent = percent + '% completed';
    if(count) count.textContent = completed + ' / ' + total;

    document.querySelectorAll('.nav-link[data-stage]').forEach(function(link){
      var done = !!document.querySelector('input[data-stage-check="' + link.getAttribute('data-stage') + '"]:checked');
      link.classList.toggle('done', done);
      var meta = link.querySelector('.nav-meta');
      if(meta) meta.textContent = done ? 'Done' : 'Open';
    });
  }

  function assignProgressItemKeys(){
    Array.from(document.querySelectorAll('.clickable-progress')).forEach(function(item, index){
      if(item.matches('label')) return;
      if(!item.dataset.shellProgressItem){
        item.dataset.shellProgressItem = String(index);
      }
    });
  }

  function restoreClickedItems(moduleId){
    var state = loadState(moduleId);
    state.clickedItems.forEach(function(itemKey){
      var target = document.querySelector('[data-shell-progress-item="' + itemKey + '"]');
      if(target) target.classList.add('clicked');
    });
  }

  function saveClickedItems(moduleId){
    var state = loadState(moduleId);
    state.clickedItems = Array.from(document.querySelectorAll('[data-shell-progress-item].clicked')).map(function(item){
      return item.dataset.shellProgressItem;
    });
    saveState(moduleId, state);
  }

  function setupClickableProgress(moduleId){
    document.querySelectorAll('.clickable-progress').forEach(function(item){
      if(item.matches('label')) return;
      if(item.getAttribute('data-shell-bound') === '1') return;
      item.setAttribute('data-shell-bound', '1');

      if(!item.matches('button, a, input, select, textarea')){
        if(!item.hasAttribute('tabindex')) item.setAttribute('tabindex', '0');
        if(!item.hasAttribute('role')) item.setAttribute('role', 'button');
      }

      function markClicked(){
        item.classList.add('clicked');
        saveClickedItems(moduleId);
      }

      item.addEventListener('click', markClicked);
      item.addEventListener('keydown', function(event){
        if(event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        markClicked();
      });
    });
  }

  function restoreChecks(moduleId){
    var state = loadState(moduleId);
    state.checkedStages.forEach(function(stageId){
      var input = document.querySelector('input[data-stage-check="' + stageId + '"]');
      if(input){
        input.checked = true;
        var label = input.closest('.check-item');
        if(label) label.classList.add('clicked');
      }
    });
    var completeCheck = document.getElementById('completeStageCheck');
    if(completeCheck && state.completed){
      completeCheck.checked = true;
    }
  }

  function saveChecks(moduleId){
    var state = loadState(moduleId);
    state.checkedStages = Array.from(document.querySelectorAll('input[data-stage-check]:checked')).map(function(input){
      return input.getAttribute('data-stage-check');
    }).filter(function(stageId){
      return stageId !== 'complete';
    });

    var completeCheck = document.getElementById('completeStageCheck');
    state.completed = !!(completeCheck && completeCheck.checked);
    saveState(moduleId, state);
    syncCourseState(moduleId);
  }

  function setupChecks(moduleId, stageOrder){
    document.querySelectorAll('input[data-stage-check]').forEach(function(input){
      if(input.getAttribute('data-shell-check-bound') === '1') return;
      input.setAttribute('data-shell-check-bound', '1');

      input.disabled = false;
      input.addEventListener('change', function(){
        var label = input.closest('.check-item');
        if(label) label.classList.toggle('clicked', input.checked);
        saveChecks(moduleId);
        updateProgress(stageOrder);
      });
    });
  }

  function setupSaveProgress(moduleId, stageOrder){
    var button = document.getElementById('saveProgressButton');
    var completeCheck = document.getElementById('completeStageCheck');
    var message = document.getElementById('saveProgressMessage');
    if(!button || !completeCheck) return;

    button.addEventListener('click', function(){
      completeCheck.checked = true;
      saveChecks(moduleId);
      updateProgress(stageOrder);
      if(message){
        message.textContent = 'Progress saved on this device while you review the template and add the approved content.';
      }
    });
  }

  function setupSmoothScroll(){
    document.querySelectorAll('[data-scroll]').forEach(function(link){
      if(link.getAttribute('data-scroll-bound') === '1') return;
      link.setAttribute('data-scroll-bound', '1');
      link.addEventListener('click', function(event){
        var targetId = link.getAttribute('data-scroll');
        if(!targetId) return;
        var target = document.getElementById(targetId);
        if(!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function setupSidebarActiveState(){
    var links = Array.from(document.querySelectorAll('.nav-link[data-stage]'));
    var sections = links.map(function(link){
      return document.getElementById(link.getAttribute('data-stage'));
    }).filter(Boolean);
    if(!links.length || !sections.length || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function(entries){
      var visible = entries.filter(function(entry){ return entry.isIntersecting; })
        .sort(function(a, b){ return b.intersectionRatio - a.intersectionRatio; });
      if(!visible.length) return;
      var id = visible[0].target.id;
      links.forEach(function(link){
        link.classList.toggle('active', link.getAttribute('data-stage') === id);
      });
    }, {
      root: null,
      threshold: [0.3, 0.55, 0.75],
      rootMargin: '-10% 0px -45% 0px'
    });

    sections.forEach(function(section){
      observer.observe(section);
    });
  }

  function getVoice(){
    if(!synth) return null;
    var voices = synth.getVoices();
    if(!voices.length) return null;
    return voices.find(function(entry){ return /en/i.test(entry.lang); }) || voices[0];
  }

  function stopSpeech(){
    if(!synth) return;
    synth.cancel();
    if(speakingButton){
      speakingButton.textContent = 'Listen';
      speakingButton = null;
    }
  }

  function setupTts(){
    if(!synth) return;

    document.querySelectorAll('[data-tts-button]').forEach(function(button){
      if(button.getAttribute('data-tts-bound') === '1') return;
      button.setAttribute('data-tts-bound', '1');
      button.addEventListener('click', function(){
        var targetSelector = button.getAttribute('data-tts-button');
        var target = targetSelector ? document.querySelector(targetSelector) : null;
        if(!target) return;

        if(speakingButton === button){
          stopSpeech();
          return;
        }

        stopSpeech();
        voice = voice || getVoice();
        var text = (target.innerText || target.textContent || '').trim();
        if(!text) return;

        var utterance = new SpeechSynthesisUtterance(text);
        if(voice) utterance.voice = voice;
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onend = stopSpeech;
        utterance.onerror = stopSpeech;

        speakingButton = button;
        button.textContent = 'Stop Audio';
        synth.speak(utterance);
      });
    });

    document.querySelectorAll('[data-tts-stop]').forEach(function(button){
      if(button.getAttribute('data-tts-stop-bound') === '1') return;
      button.setAttribute('data-tts-stop-bound', '1');
      button.addEventListener('click', stopSpeech);
    });

    if(typeof synth.onvoiceschanged !== 'undefined'){
      synth.onvoiceschanged = function(){
        voice = getVoice();
      };
    }
  }

  function init(){
    var moduleId = getModulePage();
    var stageOrder = ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'complete'];

    applyTrainingIModulePattern(moduleId);
    if(moduleId !== 'module1'){
      normalizeModuleNavigation();
    }
    assignProgressItemKeys();
    restoreChecks(moduleId);
    restoreClickedItems(moduleId);
    setupClickableProgress(moduleId);
    setupChecks(moduleId, stageOrder);
    setupSaveProgress(moduleId, stageOrder);
    setupSmoothScroll();
    setupSidebarActiveState();
    setupTts();
    syncCourseState(moduleId);
    updateProgress(stageOrder);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
