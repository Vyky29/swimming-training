(function(){
  var MODULE_FLOW = {
    'training-i-module-1': {
      trainingId: 'training-i',
      moduleNumber: 1,
      moduleTitle: 'Understanding Water',
      trainingLabel: 'Swimming Training I',
      nextModuleLabel: 'Module 2',
      isFinalModule: false
    },
    'training-i-module-2': {
      trainingId: 'training-i',
      moduleNumber: 2,
      moduleTitle: "Understanding the Swimmer's Experience in the Water",
      trainingLabel: 'Swimming Training I',
      nextModuleLabel: 'Module 3',
      isFinalModule: false
    },
    'training-i-module-3': {
      trainingId: 'training-i',
      moduleNumber: 3,
      moduleTitle: 'Building Engagement and Connection in the Water',
      trainingLabel: 'Swimming Training I',
      nextModuleLabel: 'Module 4',
      isFinalModule: false
    },
    'training-i-module-4': {
      trainingId: 'training-i',
      moduleNumber: 4,
      moduleTitle: 'The clubSENsational Swimming Programme',
      trainingLabel: 'Swimming Training I',
      nextModuleLabel: 'Module 5',
      isFinalModule: false
    },
    'training-i-module-5': {
      trainingId: 'training-i',
      moduleNumber: 5,
      moduleTitle: 'Using Visual Aids Effectively - PixtoLearn in Action',
      trainingLabel: 'Swimming Training I',
      nextModuleLabel: 'Training complete',
      isFinalModule: true
    },
    'training-ii-module-1': {
      trainingId: 'training-ii',
      moduleNumber: 1,
      moduleTitle: 'Foundations of Aquatic Skill Development',
      trainingLabel: 'Swimming Training II',
      nextModuleLabel: 'Module 2',
      isFinalModule: false
    },
    'training-ii-module-2': {
      trainingId: 'training-ii',
      moduleNumber: 2,
      moduleTitle: 'Guiding Learning Through Scaffolding and the CS Learning Principle',
      trainingLabel: 'Swimming Training II',
      nextModuleLabel: 'Module 3',
      isFinalModule: false
    },
    'training-ii-module-3': {
      trainingId: 'training-ii',
      moduleNumber: 3,
      moduleTitle: 'Early Aquatic Experiences',
      trainingLabel: 'Swimming Training II',
      nextModuleLabel: 'Module 4',
      isFinalModule: false
    },
    'training-ii-module-4': {
      trainingId: 'training-ii',
      moduleNumber: 4,
      moduleTitle: 'Core Aquatic Skills',
      trainingLabel: 'Swimming Training II',
      nextModuleLabel: 'Module 5',
      isFinalModule: false
    },
    'training-ii-module-5': {
      trainingId: 'training-ii',
      moduleNumber: 5,
      moduleTitle: 'Propulsion Development in the Water',
      trainingLabel: 'Swimming Training II',
      nextModuleLabel: 'Module 6',
      isFinalModule: false
    },
    'training-ii-module-6': {
      trainingId: 'training-ii',
      moduleNumber: 6,
      moduleTitle: 'Swimming Strokes and Advanced Techniques',
      trainingLabel: 'Swimming Training II',
      nextModuleLabel: 'Training complete',
      isFinalModule: true
    }
  };

  function escapeXml(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function slugify(value){
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'certificate';
  }

  function formatDateLabel(date){
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  function getModuleContext(){
    var path = window.location.pathname || '';
    var moduleMatch = path.match(/module-(\d+)/);
    if(!moduleMatch) return null;

    var trainingId = /\/training-ii\//.test(path) ? 'training-ii' : 'training-i';
    var key = trainingId + '-module-' + moduleMatch[1];
    return MODULE_FLOW[key] || null;
  }

  function buildCertificateSvg(meta){
    var issuedOn = formatDateLabel(meta.date || new Date());
    var learnerName = escapeXml(meta.learnerName);
    var trainingLabel = escapeXml(meta.trainingLabel);
    var moduleLabel = escapeXml(meta.moduleLabel || '');

    return [
      '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1131" viewBox="0 0 1600 1131" role="img" aria-label="clubSENsational training certificate">',
      '<defs>',
      '<linearGradient id="certificateBorder" x1="0%" y1="0%" x2="100%" y2="100%">',
      '<stop offset="0%" stop-color="#cc952b"/>',
      '<stop offset="100%" stop-color="#2d84b3"/>',
      '</linearGradient>',
      '<linearGradient id="certificatePanel" x1="0%" y1="0%" x2="100%" y2="100%">',
      '<stop offset="0%" stop-color="#1d6f99"/>',
      '<stop offset="100%" stop-color="#89b5c1"/>',
      '</linearGradient>',
      '</defs>',
      '<rect width="1600" height="1131" fill="#f4f8fb"/>',
      '<rect x="34" y="34" width="1532" height="1063" rx="34" fill="url(#certificateBorder)"/>',
      '<rect x="54" y="54" width="1492" height="1023" rx="28" fill="#ffffff"/>',
      '<rect x="86" y="86" width="1428" height="214" rx="28" fill="url(#certificatePanel)"/>',
      '<circle cx="1398" cy="126" r="110" fill="rgba(255,255,255,0.12)"/>',
      '<circle cx="1268" cy="230" r="76" fill="rgba(255,255,255,0.08)"/>',
      '<text x="132" y="162" font-family="Montserrat, Arial, sans-serif" font-size="30" font-weight="800" fill="#ffffff" letter-spacing="4">CLUBSENSATIONAL</text>',
      '<text x="132" y="205" font-family="Montserrat, Arial, sans-serif" font-size="66" font-weight="800" fill="#ffffff">Certificate of Completion</text>',
      '<text x="132" y="246" font-family="Montserrat, Arial, sans-serif" font-size="24" font-weight="600" fill="rgba(255,255,255,0.92)">Swimming training pathway completed successfully</text>',
      '<text x="800" y="410" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="30" fill="#51697a">This certifies that</text>',
      '<text x="800" y="506" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="76" font-weight="700" fill="#173042">',
      learnerName,
      '</text>',
      '<line x1="426" y1="530" x2="1174" y2="530" stroke="#c8d9e6" stroke-width="2"/>',
      '<text x="800" y="612" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="30" font-weight="600" fill="#445e70">has successfully completed</text>',
      '<text x="800" y="684" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="54" font-weight="800" fill="#1d6f99">',
      trainingLabel,
      '</text>',
      moduleLabel ? '<text x="800" y="736" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="24" font-weight="600" fill="#5d7688">' + moduleLabel + '</text>' : '',
      '<rect x="182" y="820" width="1236" height="160" rx="28" fill="#f8fbfd" stroke="#d5e3ed" stroke-width="2"/>',
      '<text x="250" y="878" font-family="Montserrat, Arial, sans-serif" font-size="20" font-weight="700" fill="#5d7688">Issued on</text>',
      '<text x="250" y="925" font-family="Montserrat, Arial, sans-serif" font-size="36" font-weight="800" fill="#173042">',
      escapeXml(issuedOn),
      '</text>',
      '<text x="1068" y="878" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="20" font-weight="700" fill="#5d7688">clubSENsational Swimming Training</text>',
      '<line x1="934" y1="910" x2="1202" y2="910" stroke="#8fb5c7" stroke-width="3"/>',
      '<text x="1068" y="950" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="28" fill="#173042">Authorised completion record</text>',
      '</svg>'
    ].join('');
  }

  function downloadSvg(filename, content){
    var blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function(){
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function downloadCertificate(meta){
    var learnerName = window.prompt('Enter the learner name for the certificate:');
    if(!learnerName || !learnerName.trim()){
      return false;
    }

    var cleanName = learnerName.trim().replace(/\s+/g, ' ');
    var svg = buildCertificateSvg({
      learnerName: cleanName,
      trainingLabel: meta.trainingLabel,
      moduleLabel: meta.moduleLabel,
      date: new Date()
    });

    downloadSvg(
      slugify(meta.trainingLabel + '-' + cleanName) + '-certificate.svg',
      svg
    );

    return true;
  }

  function ensureActionWrap(scoreCard){
    if(!scoreCard) return null;
    var wrap = scoreCard.querySelector('.module-result-actions');
    if(wrap) return wrap;

    wrap = document.createElement('div');
    wrap.className = 'module-result-actions';

    Array.from(scoreCard.children).forEach(function(child){
      if(
        child.matches &&
        (
          child.matches('.quiz-next-btn') ||
          child.matches('[data-download-certificate]') ||
          child.matches('[data-module-secondary-action]')
        )
      ){
        wrap.appendChild(child);
      }
    });

    scoreCard.appendChild(wrap);
    return wrap;
  }

  function renderResultCard(options){
    var scoreCard = options.scoreCard;
    if(!scoreCard) return;

    var title = scoreCard.querySelector('h2');
    var scoreValue = options.scoreValue || scoreCard.querySelector('.score-value');
    var scoreMsg = options.scoreMsg || scoreCard.querySelector('.score-msg');
    var primaryAction = scoreCard.querySelector('.quiz-next-btn');
    var certificateAction = scoreCard.querySelector('[data-download-certificate]');

    ensureActionWrap(scoreCard);

    scoreCard.classList.add('module-result-card', 'show');
    scoreCard.classList.remove('module-result-card--success', 'module-result-card--final');

    if(scoreValue){
      scoreValue.hidden = false;
      scoreValue.textContent = options.scoreLabel || 'QUIZ PASSED';
    }

    if(options.passed){
      if(options.isFinalModule){
        scoreCard.classList.add('module-result-card--final');
        if(title) title.textContent = options.finalTitle || 'Congratulations';
        if(scoreMsg){
          scoreMsg.textContent = options.finalMessage || ('You have completed ' + options.trainingLabel + '. Download the certificate to save your training record.');
        }
        if(primaryAction){
          primaryAction.textContent = options.primaryActionText || 'Return to Training Portal';
          primaryAction.style.display = 'inline-flex';
        }
        if(certificateAction){
          certificateAction.hidden = false;
          certificateAction.style.display = 'inline-flex';
          certificateAction.onclick = function(){
            downloadCertificate({
              trainingLabel: options.trainingLabel,
              moduleLabel: options.moduleLabel
            });
          };
        }
      } else {
        scoreCard.classList.add('module-result-card--success');
        if(title) title.textContent = options.successTitle || 'Module completed';
        if(scoreMsg){
          scoreMsg.textContent = options.successMessage || ('You passed the module quiz for ' + options.moduleLabel + '. Continue to the next module when you are ready.');
        }
        if(primaryAction){
          primaryAction.textContent = options.primaryActionText || 'Go to Next Module';
          primaryAction.style.display = 'inline-flex';
        }
        if(certificateAction){
          certificateAction.hidden = true;
          certificateAction.style.display = 'none';
        }
      }
      return;
    }

    if(title) title.textContent = options.failureTitle || 'Quiz incomplete';
    if(scoreMsg){
      scoreMsg.textContent = options.failureMessage || 'You need all answers correct before moving on. Review the module and try again.';
    }
    if(primaryAction){
      primaryAction.style.display = 'none';
    }
    if(certificateAction){
      certificateAction.hidden = true;
      certificateAction.style.display = 'none';
    }
  }

  function normalizeCompletionCard(context){
    var completionCard = document.querySelector('#complete .completion, #complete .completion-box, #keyideas .completion');
    if(!completionCard) return;

    var heading = completionCard.querySelector('h3');
    if(heading){
      heading.textContent = 'Module ' + context.moduleNumber + ' complete';
    }

    completionCard.querySelectorAll('.recap-stack, .completion-note').forEach(function(element){
      element.remove();
    });

    var lead = completionCard.querySelector('p');
    if(lead){
      lead.textContent = 'You have completed all content for Module ' + context.moduleNumber + '. Ready for the quiz?';
    }

    var actions = completionCard.querySelector('.completion-actions');
    if(!actions){
      actions = document.createElement('div');
      actions.className = 'completion-actions';
      completionCard.appendChild(actions);
    }

    actions.innerHTML = '<a class="btn btn-primary" href="#quiz">Start Quiz</a>';
  }

  function buildPreviewCard(context){
    return [
      '<div class="shared-quiz-preview">',
      '  <div class="shared-quiz-card">',
      '    <span class="shared-quiz-kicker">Quiz Template</span>',
      '    <h3>Blank Quiz Format for Module ' + context.moduleNumber + '</h3>',
      '    <p>This is placeholder text to review the full end-of-module flow. Add the approved quiz questions for Module ' + context.moduleNumber + ' here later.</p>',
      '    <p class="shared-quiz-note">Test flow only: use Complete Quiz to preview the final completion state across the full training.</p>',
      '    <div class="shared-quiz-actions">',
      '      <button type="button" class="btn-submit" data-shared-quiz-complete>Complete Quiz</button>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
  }

  function revealQuizSection(quizSection){
    if(!quizSection) return;
    quizSection.classList.remove('gated-locked');
    quizSection.classList.add('quiz-visible');
  }

  function updateTrainingIProgress(context){
    var storageKey = 'swimming_module_' + context.moduleNumber + '_progress';
    var prefix = 'module' + context.moduleNumber + '_';
    var nextModule = context.moduleNumber + 1;
    var state = {};

    try{
      state = JSON.parse(localStorage.getItem(storageKey) || '{}') || {};
    } catch(error){
      state = {};
    }

    state[prefix + 'complete'] = true;
    state[prefix + 'quiz'] = true;
    state[prefix + 'completed'] = true;
    if(!context.isFinalModule){
      state['module' + nextModule + '_unlocked'] = true;
    }

    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function updateTrainingIIProgress(context){
    var progressKey = 'cs_swimming_training_progress';
    var currentKey = 'cs_swimming_training_current_module';
    var completedSectionsKey = 'cs_swimming_training_completed_sections';
    var completedModulesKey = 'cs_swimming_training_completed_modules';
    var moduleId = 'module' + context.moduleNumber;
    var state = {};

    try{
      state = JSON.parse(localStorage.getItem(progressKey) || '{}') || {};
    } catch(error){
      state = {};
    }

    if(!state.completedSections || typeof state.completedSections !== 'object'){
      state.completedSections = {};
    }
    if(!Array.isArray(state.completedSections[moduleId])){
      state.completedSections[moduleId] = [];
    }
    if(!Array.isArray(state.completedModules)){
      state.completedModules = [];
    }

    ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'quiz'].forEach(function(sectionId){
      if(state.completedSections[moduleId].indexOf(sectionId) === -1){
        state.completedSections[moduleId].push(sectionId);
      }
    });

    if(state.completedModules.indexOf(moduleId) === -1){
      state.completedModules.push(moduleId);
    }

    state.currentModule = moduleId;
    state.courseCompleted = context.isFinalModule;
    state.lastUpdatedAt = new Date().toISOString();

    localStorage.setItem(progressKey, JSON.stringify(state));
    localStorage.setItem(currentKey, moduleId);
    localStorage.setItem(completedSectionsKey, JSON.stringify(state.completedSections));
    localStorage.setItem(completedModulesKey, JSON.stringify(state.completedModules));

    if(context.moduleNumber === 1){
      try{
        var moduleOneState = JSON.parse(localStorage.getItem('swimming_module_1_progress') || '{}') || {};
        moduleOneState.module1_complete = true;
        moduleOneState.module1_quiz = true;
        moduleOneState.module1_completed = true;
        moduleOneState.module2_unlocked = true;
        localStorage.setItem('swimming_module_1_progress', JSON.stringify(moduleOneState));
      } catch(error){}
    }

    window.dispatchEvent(new Event('storage'));
  }

  function markModulePassed(context){
    if(context.trainingId === 'training-ii'){
      updateTrainingIIProgress(context);
      return;
    }

    updateTrainingIProgress(context);
  }

  function isModulePassed(context){
    if(context.trainingId === 'training-ii'){
      try{
        var trainingTwoState = JSON.parse(localStorage.getItem('cs_swimming_training_progress') || '{}') || {};
        var sectionState = trainingTwoState.completedSections || {};
        return Array.isArray(sectionState['module' + context.moduleNumber]) &&
          sectionState['module' + context.moduleNumber].indexOf('quiz') >= 0;
      } catch(error){
        return false;
      }
    }

    try{
      var trainingOneState = JSON.parse(localStorage.getItem('swimming_module_' + context.moduleNumber + '_progress') || '{}') || {};
      return !!trainingOneState['module' + context.moduleNumber + '_quiz'];
    } catch(error){
      return false;
    }
  }

  function renderPassedState(context, scoreCard){
    var scoreValue = scoreCard.querySelector('.score-value');
    var scoreMsg = scoreCard.querySelector('.score-msg');

    renderResultCard({
      scoreCard: scoreCard,
      scoreValue: scoreValue,
      scoreMsg: scoreMsg,
      passed: true,
      isFinalModule: context.isFinalModule,
      trainingLabel: context.trainingLabel,
      moduleLabel: 'Module ' + context.moduleNumber + ' - ' + context.moduleTitle,
      scoreLabel: 'QUIZ PASSED',
      successMessage: 'You completed the Module ' + context.moduleNumber + ' quiz flow. Continue into ' + context.nextModuleLabel + ' when you are ready.',
      finalMessage: 'You have completed ' + context.trainingLabel + '. Download the certificate to save the result of your training.',
      primaryActionText: context.isFinalModule
        ? (context.trainingId === 'training-ii' ? 'Return to Training Dashboard' : 'Return to Training Portal')
        : 'Go to Next Module'
    });
  }

  function restoreTrainingIPassedQuiz(context){
    if(context.trainingId !== 'training-i') return;
    var quizSection = document.getElementById('quiz');
    if(!quizSection) return;
    var quizInline = quizSection.querySelector('.quiz-inline');
    if(!quizInline) return;
    var scoreCard = quizInline.querySelector('.score-card');
    if(!scoreCard || !isModulePassed(context)) return;
    quizInline.classList.add('quiz-passed-restore');
    revealQuizSection(quizSection);
    renderPassedState(context, scoreCard);
  }

  function ensureQuizPreview(context){
    if(context.trainingId === 'training-i'){
      restoreTrainingIPassedQuiz(context);
      return;
    }

    var quizSection = document.getElementById('quiz');
    if(!quizSection) return;

    var quizInline = quizSection.querySelector('.quiz-inline');
    if(!quizInline) return;

    quizInline.classList.add('quiz-template-mode');

    quizInline.querySelectorAll('[data-shell-quiz-pass]').forEach(function(button){
      button.style.display = 'none';
    });

    if(context.trainingId === 'training-ii' && context.moduleNumber === 1){
      var moduleOneButton = document.getElementById('submitBtnM1');
      if(moduleOneButton) moduleOneButton.style.display = 'none';
    }

    var preview = quizInline.querySelector('.shared-quiz-preview');
    if(!preview){
      preview = document.createElement('div');
      preview.innerHTML = buildPreviewCard(context);
      preview = preview.firstElementChild;
      var form = quizInline.querySelector('form');
      var scoreCard = quizInline.querySelector('.score-card');
      quizInline.insertBefore(preview, form || scoreCard || null);
    }

    var completeButton = preview.querySelector('[data-shared-quiz-complete]');
    var scoreCard = quizInline.querySelector('.score-card');
    if(!completeButton || !scoreCard) return;

    document.querySelectorAll('a[href="#quiz"]').forEach(function(link){
      if(link.getAttribute('data-shared-quiz-link-bound') === '1') return;
      link.setAttribute('data-shared-quiz-link-bound', '1');
      link.addEventListener('click', function(event){
        event.preventDefault();
        revealQuizSection(quizSection);
        window.location.hash = 'quiz';
        setTimeout(function(){
          quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      });
    });

    if(completeButton.getAttribute('data-shared-quiz-bound') !== '1'){
      completeButton.setAttribute('data-shared-quiz-bound', '1');
      completeButton.addEventListener('click', function(){
        markModulePassed(context);
        revealQuizSection(quizSection);
        renderPassedState(context, scoreCard);
        completeButton.disabled = true;
        scoreCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    if(isModulePassed(context)){
      revealQuizSection(quizSection);
      renderPassedState(context, scoreCard);
      completeButton.disabled = true;
    }
  }

  function initSharedModuleFlow(){
    var context = getModuleContext();
    if(!context) return;

    normalizeCompletionCard(context);
    ensureQuizPreview(context);
  }

  window.clubTrainingCompletion = {
    downloadCertificate: downloadCertificate,
    renderResultCard: renderResultCard
  };

  window.addEventListener('load', function(){
    setTimeout(initSharedModuleFlow, 0);
  });
})();
