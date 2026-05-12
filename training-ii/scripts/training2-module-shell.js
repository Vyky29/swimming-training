(function(){
  var voice = null;
  var synth = window.speechSynthesis || null;
  var speakingButton = null;

  function getModulePage(){
    var root = document.querySelector('[data-course-page]');
    return root ? root.getAttribute('data-course-page') : 'module-shell';
  }

  function getStorageKey(moduleId){
    return 'cs_training2_shell_' + moduleId;
  }

  function getEmptyState(){
    return {
      checkedStages: [],
      clickedItems: [],
      completed: false
    };
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

    assignProgressItemKeys();
    restoreChecks(moduleId);
    restoreClickedItems(moduleId);
    setupClickableProgress(moduleId);
    setupChecks(moduleId, stageOrder);
    setupSaveProgress(moduleId, stageOrder);
    setupSmoothScroll();
    setupSidebarActiveState();
    setupTts();
    updateProgress(stageOrder);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
