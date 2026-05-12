(function(){
  var REVIEW_MODE = true;
  var voice = null;
  var synth = window.speechSynthesis || null;
  var speakingButton = null;

  var JOURNEY_MODULES = {
    module1: {
      title: 'Module 1 - Foundations of Aquatic Development',
      summary: 'Understanding how aquatic learning begins.'
    },
    module2: {
      title: 'Module 2 - Guiding Learning Through Scaffolding and the CS Learning Principle',
      summary: 'Structuring support, progression and teaching decisions.'
    },
    module3: {
      title: 'Module 3 - Early Aquatic Experiences',
      summary: 'Supporting first contact, entry and exit in the water and early familiarisation.'
    },
    module4: {
      title: 'Module 4 - Core Aquatic Skills',
      summary: 'Developing breathing control and submersion, floating and balance, gliding and streamlining, and rotation.'
    },
    module5: {
      title: 'Module 5 - Propulsion Development in the Water',
      summary: 'Building functional movement through the water.'
    },
    module6: {
      title: 'Module 6 - Swimming Strokes and Advanced Techniques',
      summary: 'Applying aquatic foundations to strokes and advanced skills.'
    }
  };

  var MODULE_REVIEW_CONTENT = {
    module2: {
      heroTitle: 'Guiding Learning Through Scaffolding and the CS Learning Principle',
      heroDescription: 'This review version keeps the full Module 2 flow visible while the final content continues to be refined. Every section is open so you can inspect the learner journey, section titles, progression logic and overall structure from start to finish.',
      journeyIntro: 'Review how Module 2 sits within the full Training II pathway and how it leads from foundational aquatic development into structured teaching support and progression decisions.',
      outcomesIntro: 'By the end of this module, instructors should be able to:',
      outcomes: [
        ['Understand how scaffolding supports aquatic learning', 'Recognise why layered support helps swimmers move from regulation and confidence into more purposeful learning.'],
        ['Recognise the CS Learning Principle in practice', 'Connect the principle to real teaching decisions, observation points and the order in which support is introduced or reduced.'],
        ['Match support levels to swimmer readiness', 'Identify when more structure is needed and when a swimmer is ready for greater independence within the task.'],
        ['Use observation to guide progression decisions', 'Interpret swimmer responses so progression is based on readiness, control and engagement rather than speed alone.']
      ],
      blocks: [
        {
          navLabel: 'Scaffolding',
          title: 'Block 1 - Scaffolding Foundations',
          intro: 'This first block focuses on what scaffolding means in aquatic learning and why structure, sequencing and support are central to successful teaching.',
          cards: [
            ['What scaffolding means', 'Introduce how scaffolding breaks learning into manageable steps and supports the swimmer at the point of need.'],
            ['Why structure matters', 'Show how clear sequencing reduces overload and gives swimmers a more secure route into participation and control.'],
            ['Support in practice', 'Use this area to show what instructor prompts, physical setup or visual support might look like in real sessions.'],
            ['Instructor reflection', 'Add the reflective question or applied task that helps instructors connect the theory to their own teaching decisions.']
          ]
        },
        {
          navLabel: 'CS Principle',
          title: 'Block 2 - Applying the CS Learning Principle',
          intro: 'This block should connect scaffolding to the CS Learning Principle so the teaching structure is understood as part of the wider clubSENsational approach.',
          cards: [
            ['CS Learning Principle in practice', 'Clarify how the principle shapes teaching rhythm, sequencing and the balance between support and challenge.'],
            ['Observation cues', 'Highlight the swimmer responses, behaviours or control indicators that help instructors judge how much support is needed.'],
            ['Teaching adjustments', 'Show how instructors can adapt instructions, setup or prompts when a swimmer needs more stability or more independence.'],
            ['Applied scenario', 'Use this space for a realistic learning example that demonstrates the principle in action.']
          ]
        },
        {
          navLabel: 'Teaching Decisions',
          title: 'Block 3 - Adaptive Teaching Decisions',
          intro: 'The final block should bring the module together by showing how scaffolding and observation lead to better day-to-day teaching decisions.',
          cards: [
            ['Choosing next steps', 'Explain how to decide whether to repeat, simplify, extend or fade support based on the swimmer’s response.'],
            ['Matching pace to readiness', 'Reinforce that progression should reflect regulation, confidence and engagement rather than a fixed timetable.'],
            ['Example pathway', 'Add a practical pathway showing how a swimmer might move through support levels across a sequence of activities.'],
            ['Transfer to sessions', 'Close the block with the action points instructors should take back into planning and delivery.']
          ]
        }
      ],
      recapIntro: 'Use these recap points to summarise the key ideas from Module 2 before moving into the next stage of the course.',
      recap: [
        ['Scaffolding gives learning structure', 'Support should be intentional, sequenced and responsive to the swimmer’s experience.'],
        ['The CS Learning Principle guides progression', 'Teaching decisions should reflect observation, readiness and the balance between support and independence.'],
        ['Progression comes from adaptive teaching', 'Instructors move learning forward by interpreting responses and adjusting support with purpose.']
      ],
      completionHeading: 'Module 2 review flow ready',
      completionText: 'This review version keeps the full Module 2 pathway open so you can evaluate the journey, outcomes, section titles and progression flow before final content is locked in.',
      nextButtonLabel: 'Open Module 3'
    },
    module3: {
      heroTitle: 'Early Aquatic Experiences',
      heroDescription: 'This review version keeps the full Module 3 flow visible while content continues to be shaped. Every section is open so you can inspect the sequence, structure and learner pathway across the whole module.',
      journeyIntro: 'Review how Module 3 extends the course by focusing on first contact with water, early familiarisation and the instructor decisions that shape safe, positive aquatic experiences.',
      outcomesIntro: 'By the end of this module, instructors should be able to:',
      outcomes: [
        ['Understand the purpose of early aquatic experiences', 'See how first contact with water builds the basis for confidence, regulation and future learning.'],
        ['Support first contact, entry and exit with confidence', 'Recognise the instructor role in shaping safe, predictable and positive transitions into and out of the water.'],
        ['Recognise how familiarisation builds readiness', 'Understand how repetition, predictability and sensory awareness help swimmers feel more secure in the aquatic environment.'],
        ['Use observation to shape positive first experiences', 'Adapt activities and support based on how each swimmer responds to the environment, demands and transitions.']
      ],
      blocks: [
        {
          navLabel: 'First Contact',
          title: 'Block 1 - First Contact with Water',
          intro: 'This first block should focus on how the earliest aquatic experiences are introduced and why the first moments in water matter so much.',
          cards: [
            ['Starting the aquatic experience', 'Outline the conditions that help first contact feel safe, structured and manageable for the swimmer.'],
            ['What instructors notice first', 'Describe the early cues that show how the swimmer is experiencing the environment and what they may need next.'],
            ['Reducing overload', 'Use this space to explain how pace, setup, communication and expectations can be adjusted to support regulation.'],
            ['Applied reflection', 'Add the reflection or scenario that helps instructors think through how they would manage first contact in practice.']
          ]
        },
        {
          navLabel: 'Entry & Exit',
          title: 'Block 2 - Entry, Exit and Familiarisation',
          intro: 'This block should show how entry, exit and repeated familiarisation experiences build confidence and predictability over time.',
          cards: [
            ['Entry and exit as learning moments', 'Explain why these transitions are part of learning and not simply logistical steps around the session.'],
            ['Building predictability', 'Show how routines, repetition and clear cues can support confidence during early aquatic learning.'],
            ['Instructor support strategies', 'Use this card for practical support approaches that reduce uncertainty and create steadier participation.'],
            ['Applied scenario', 'Add a realistic example showing how familiarisation can be built into a structured teaching sequence.']
          ]
        },
        {
          navLabel: 'Confidence Building',
          title: 'Block 3 - Building Confidence Through Experience',
          intro: 'The final block should connect early experiences to confidence, readiness and the gradual move toward more active participation in water.',
          cards: [
            ['Confidence develops through experience', 'Reinforce that confidence comes from safe repetition, supported success and predictable progression.'],
            ['Reading readiness', 'Explain how to identify whether the swimmer is ready for a small next step or needs more time within the current experience.'],
            ['Example pathway', 'Use this card to show how early experiences can progress from observation and tolerance to active engagement.'],
            ['Transfer to teaching', 'Close the block with the practical teaching implications instructors should carry into future sessions.']
          ]
        }
      ],
      recapIntro: 'Use these recap points to summarise the essential teaching ideas from Module 3 before moving on.',
      recap: [
        ['Early experiences shape later learning', 'First contact with water should be understood as a foundational teaching stage, not a minor introductory moment.'],
        ['Transitions matter', 'Entry, exit and familiarisation are important parts of regulation, confidence and readiness.'],
        ['Confidence comes from responsive teaching', 'Positive early aquatic experiences are built through observation, structure and adaptive support.']
      ],
      completionHeading: 'Module 3 review flow ready',
      completionText: 'This review version keeps the full Module 3 pathway open so you can check the early-experience storyline, section titles and module progression before final content is inserted.',
      nextButtonLabel: 'Open Module 4'
    },
    module4: {
      heroTitle: 'Core Aquatic Skills',
      heroDescription: 'This review version keeps the full Module 4 flow visible while the final teaching content is still being refined. Every section is open so you can inspect the core-skill progression from start to finish.',
      journeyIntro: 'Review how Module 4 sits at the centre of the Training II pathway by focusing on the core aquatic skills that underpin later propulsion and stroke development.',
      outcomesIntro: 'By the end of this module, instructors should be able to:',
      outcomes: [
        ['Identify the core aquatic skills that underpin later swimming', 'Recognise why these foundations matter before more advanced propulsion or stroke work begins.'],
        ['Understand how breathing control and submersion develop', 'See how these skills build gradually and depend on readiness, confidence and regulation.'],
        ['Recognise the role of floating, balance, gliding and rotation', 'Connect these skills to control, body organisation and efficient movement in water.'],
        ['Plan progression around control, readiness and coordination', 'Use observation to decide how and when to extend learning in each skill area.']
      ],
      blocks: [
        {
          navLabel: 'Breath Control',
          title: 'Block 1 - Breathing Control and Submersion',
          intro: 'This first block should focus on how breathing control and submersion are introduced as progressive skills rather than isolated tasks.',
          cards: [
            ['Breathing control foundations', 'Explain how breath control supports regulation, confidence and more coordinated aquatic movement.'],
            ['Introducing submersion', 'Show how submersion is built in manageable steps that respect readiness and reduce overwhelm.'],
            ['What instructors observe', 'Use this card for the cues that help staff judge control, comfort and readiness for progression.'],
            ['Applied reflection', 'Add the activity or scenario that helps instructors think through how they would teach this area in practice.']
          ]
        },
        {
          navLabel: 'Balance & Float',
          title: 'Block 2 - Floating, Balance and Rotation',
          intro: 'This block should show how floating, balance and rotation work together to create body organisation and stability in water.',
          cards: [
            ['Why balance matters', 'Clarify how balance supports security, confidence and the swimmer’s ability to organise movement.'],
            ['Floating and body control', 'Describe how floating develops through support, position changes and repeated successful experience.'],
            ['Rotation as a linked skill', 'Use this card to explain how rotation builds from the same body awareness and control foundations.'],
            ['Practice connection', 'Add the practical or observational example that links these concepts to session delivery.']
          ]
        },
        {
          navLabel: 'Glide & Streamline',
          title: 'Block 3 - Gliding and Streamlining',
          intro: 'The final block should connect the core skill set to gliding and streamlined movement, showing how control leads into more purposeful travel through water.',
          cards: [
            ['Gliding foundations', 'Explain how glide emerges from body control, alignment and the swimmer’s readiness to travel with stability.'],
            ['Building streamlining', 'Show how streamlined positions develop from earlier balance and organisation skills.'],
            ['Example sequence', 'Use this card for an example pathway that links submersion, balance and glide into a coherent teaching sequence.'],
            ['Transfer to later modules', 'Close the block by showing how these skills prepare the swimmer for propulsion and more advanced movement.']
          ]
        }
      ],
      recapIntro: 'Use these recap points to summarise the key learning from Module 4 before moving into propulsion.',
      recap: [
        ['Core skills come before advanced movement', 'Breathing control, submersion, balance, floating, gliding and rotation underpin later progress.'],
        ['These skills develop together', 'They are interconnected and should be taught as part of a progressive, responsive pathway.'],
        ['Progression depends on control and readiness', 'Observation and adaptive teaching remain central to when and how skills move forward.']
      ],
      completionHeading: 'Module 4 review flow ready',
      completionText: 'This review version keeps the full Module 4 pathway open so you can inspect the core-skill sequence, section titles and journey logic before final content is locked in.',
      nextButtonLabel: 'Open Module 5'
    },
    module5: {
      heroTitle: 'Propulsion Development in the Water',
      heroDescription: 'This review version keeps the full Module 5 flow visible while the final material is still being refined. Every section is open so you can inspect how propulsion development is sequenced across the module.',
      journeyIntro: 'Review how Module 5 builds on the core aquatic skills by focusing on the development of effective propulsion and functional movement through water.',
      outcomesIntro: 'By the end of this module, instructors should be able to:',
      outcomes: [
        ['Understand how propulsion emerges from strong aquatic foundations', 'Recognise that propulsion builds from control, alignment and readiness rather than from force alone.'],
        ['Distinguish between movement attempts and effective propulsion', 'Identify when a swimmer is moving in water and when they are beginning to generate purposeful propulsion.'],
        ['Use teaching cues that support propulsion development', 'Apply prompts, activities and observation points that help swimmers organise movement more efficiently.'],
        ['Link propulsion work to later advanced movement patterns', 'Understand how this module bridges the gap between foundational control and more advanced swimming techniques.']
      ],
      blocks: [
        {
          navLabel: 'Foundations',
          title: 'Block 1 - Foundations of Propulsion',
          intro: 'This first block should focus on what propulsion development depends on and why it must be built from secure aquatic foundations.',
          cards: [
            ['What propulsion depends on', 'Explain the role of body organisation, balance, stability and readiness in developing functional propulsion.'],
            ['Movement versus propulsion', 'Show how to distinguish between general movement in water and movement that begins to drive the swimmer forward.'],
            ['Observation focus', 'Use this card for the specific cues instructors should look for when teaching early propulsion.'],
            ['Instructor reflection', 'Add a practical reflection or task that helps staff think through how propulsion is introduced in sessions.']
          ]
        },
        {
          navLabel: 'Propulsive Actions',
          title: 'Block 2 - Building Propulsive Actions',
          intro: 'This block should show how propulsive actions are introduced, repeated and refined through structured practice.',
          cards: [
            ['Developing propulsive movement', 'Clarify how instructors help swimmers organise actions so effort becomes more controlled and effective.'],
            ['Teaching cues and setup', 'Use this card for the prompts, demonstrations or task structures that support propulsion development.'],
            ['Responding to readiness', 'Show how activities should be adapted when the swimmer needs more stability, clarity or confidence before progressing.'],
            ['Applied scenario', 'Add a realistic teaching example that shows how propulsive actions are built over time.']
          ]
        },
        {
          navLabel: 'Applied Propulsion',
          title: 'Block 3 - Applying Propulsion Through Water',
          intro: 'The final block should connect propulsive actions to more purposeful movement through water and prepare the route into advanced techniques.',
          cards: [
            ['Propulsion in context', 'Explain how propulsive actions become meaningful when they are coordinated with balance, direction and control.'],
            ['Linking skills together', 'Show how propulsion connects back to the core aquatic skills explored in the previous module.'],
            ['Example progression pathway', 'Use this card to illustrate how propulsion might evolve across a structured teaching sequence.'],
            ['Transfer forward', 'Close the block by showing how propulsion development prepares for stroke-based and advanced technique work.']
          ]
        }
      ],
      recapIntro: 'Use these recap points to summarise the key learning from Module 5 before moving into advanced techniques.',
      recap: [
        ['Propulsion grows from strong foundations', 'Control, balance and readiness remain essential even as movement becomes more powerful or purposeful.'],
        ['Effective propulsion is taught progressively', 'Instructors build it through structured tasks, observation and carefully adjusted support.'],
        ['This module bridges into advanced work', 'Propulsion development prepares swimmers for the more coordinated demands of later technique learning.']
      ],
      completionHeading: 'Module 5 review flow ready',
      completionText: 'This review version keeps the full Module 5 pathway open so you can inspect the propulsion storyline, section titles and route into advanced techniques before final content is inserted.',
      nextButtonLabel: 'Open Module 6'
    },
    module6: {
      heroTitle: 'Swimming Strokes and Advanced Techniques',
      heroDescription: 'This review version keeps the full Module 6 flow visible while the last content decisions are being refined. Every section is open so you can inspect the final module pathway from stroke readiness through to advanced application.',
      journeyIntro: 'Review how Module 6 completes the Training II pathway by connecting aquatic foundations, propulsion and readiness to more advanced swimming techniques.',
      outcomesIntro: 'By the end of this module, instructors should be able to:',
      outcomes: [
        ['Connect aquatic foundations to stroke development', 'Recognise how earlier learning supports later coordination, timing and more advanced technique work.'],
        ['Recognise readiness for advanced techniques', 'Judge when a swimmer is prepared for more demanding movement patterns and technical refinement.'],
        ['Support coordination, timing and control within stroke practice', 'Use structured teaching to help advanced movement emerge from stable foundations rather than pressure or speed.'],
        ['Adapt teaching decisions during refinement', 'Respond flexibly when the swimmer needs more support, clearer sequencing or a return to foundational skills.']
      ],
      blocks: [
        {
          navLabel: 'Stroke Readiness',
          title: 'Block 1 - Stroke Readiness',
          intro: 'This first block should focus on what readiness for stroke learning looks like and how instructors recognise it before introducing more advanced technical demands.',
          cards: [
            ['What stroke readiness means', 'Explain how readiness is shaped by control, regulation, coordination and the secure foundations developed earlier in the pathway.'],
            ['Indicators of readiness', 'Use this card for the swimmer responses and movement qualities that suggest a learner is ready for more advanced technique work.'],
            ['Preparing the learning environment', 'Show how instructors can structure tasks so advanced work is introduced with clarity and support.'],
            ['Applied reflection', 'Add the question or scenario that helps instructors decide when to extend into stroke-focused teaching.']
          ]
        },
        {
          navLabel: 'Advanced Coordination',
          title: 'Block 2 - Coordinating Advanced Techniques',
          intro: 'This block should show how advanced techniques are coordinated progressively so swimmers can organise more complex movement without losing control.',
          cards: [
            ['Building coordinated sequences', 'Describe how advanced technique work can be broken into manageable elements and taught in sequence.'],
            ['Timing and rhythm', 'Use this card to explain how timing, rhythm and control influence successful advanced movement patterns.'],
            ['Observation and adjustment', 'Highlight the cues instructors use when deciding whether to progress, repeat or simplify the task.'],
            ['Worked example', 'Add a practical example that demonstrates how advanced coordination can be supported in real teaching.']
          ]
        },
        {
          navLabel: 'Technique Refinement',
          title: 'Block 3 - Refining Technique in Practice',
          intro: 'The final block should connect technique refinement to adaptive teaching decisions, showing how instructors keep progress grounded in readiness and control.',
          cards: [
            ['Refining without rushing', 'Explain how technical improvement should remain responsive to the swimmer rather than driven by fixed expectations.'],
            ['Returning to foundations when needed', 'Show how instructors can revisit earlier skill elements when advanced work starts to destabilise the swimmer.'],
            ['Example refinement pathway', 'Use this card to illustrate how a swimmer might move between foundational review and advanced practice.'],
            ['Final transfer to practice', 'Close the module with the key teaching decisions instructors should take into advanced session planning.']
          ]
        }
      ],
      recapIntro: 'Use these recap points to summarise the key learning from Module 6 and the full Training II pathway.',
      recap: [
        ['Advanced techniques still depend on foundations', 'Stroke and technical development remain rooted in control, propulsion and readiness.'],
        ['Coordination is taught progressively', 'Advanced movement is built through structure, sequencing and responsive adjustment.'],
        ['Refinement stays adaptive', 'Instructors keep technique learning effective by staying responsive to readiness and returning to foundations when needed.']
      ],
      completionHeading: 'Module 6 review flow ready',
      completionText: 'This review version keeps the full Module 6 pathway open so you can inspect the final journey, section titles and completion flow before the closing content is finalised.',
      nextButtonLabel: 'Return to Dashboard'
    }
  };

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

  function setText(selector, text){
    var target = document.querySelector(selector);
    if(target && typeof text === 'string'){
      target.textContent = text;
    }
  }

  function setHtml(selector, html){
    var target = document.querySelector(selector);
    if(target && typeof html === 'string'){
      target.innerHTML = html;
    }
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
    var count = document.getElementById('moduleProgressCount');
    var heroFill = document.getElementById('heroModuleProgressFill');
    var heroText = document.getElementById('heroModuleProgressText');

    if(fill) fill.style.width = percent + '%';
    if(text) text.textContent = percent + '% completed';
    if(count) count.textContent = completed + ' / ' + total;
    if(heroFill) heroFill.style.width = percent + '%';
    if(heroText){
      if(percent === 0) heroText.textContent = REVIEW_MODE ? 'Review flow open' : 'Ready to begin';
      else if(percent < 40) heroText.textContent = 'Building understanding';
      else if(percent < 80) heroText.textContent = 'Progressing through the module';
      else if(percent < 100) heroText.textContent = 'Almost complete';
      else heroText.textContent = 'Module completed';
    }

    document.querySelectorAll('.nav-link[data-stage]').forEach(function(link){
      var done = stageOrder.indexOf(link.getAttribute('data-stage')) >= 0 &&
        !!document.querySelector('input[data-stage-check="' + link.getAttribute('data-stage') + '"]:checked');
      link.classList.toggle('done', done);
      var meta = link.querySelector('.nav-meta');
      if(meta){
        meta.textContent = done ? 'Done' : 'Open';
      }
    });
  }

  function unlockStage(stageId){
    var section = document.getElementById(stageId);
    if(!section) return;
    section.classList.remove('gated-locked');
  }

  function normalizeJourneyItems(){
    document.querySelectorAll('[data-course-module-id]').forEach(function(item){
      var moduleId = item.getAttribute('data-course-module-id');
      var config = JOURNEY_MODULES[moduleId];
      if(!config) return;

      var heading = item.querySelector('h3');
      var description = item.querySelector('p');
      if(heading) heading.textContent = config.title.split(' - ')[0];
      if(description) description.textContent = config.summary;
    });
  }

  function applyUnlocks(stageOrder){
    if(REVIEW_MODE){
      stageOrder.forEach(function(stageId){
        unlockStage(stageId);
      });
      return;
    }

    stageOrder.forEach(function(stageId, index){
      if(index === 0) return;
      var previous = stageOrder[index - 1];
      var previousInput = document.querySelector('input[data-stage-check="' + previous + '"]');
      if(previousInput && previousInput.checked){
        unlockStage(stageId);
      }
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

      function toggleClicked(){
        item.classList.add('clicked');
        saveClickedItems(moduleId);
        updateOutcomesReadyState();
      }

      item.addEventListener('click', toggleClicked);
      item.addEventListener('keydown', function(event){
        if(event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        toggleClicked();
      });
    });
  }

  function updateOutcomesReadyState(){
    var items = Array.from(document.querySelectorAll('[data-outcomes-group="outcomes"] .outcome'));
    var input = document.querySelector('input[data-stage-check="outcomes"]');
    var helper = document.getElementById('outcomesHelper');
    if(!items.length || !input) return;

    if(REVIEW_MODE){
      input.disabled = false;
      if(helper){
        helper.classList.add('ready');
        helper.innerHTML = '<strong>Review mode:</strong> All outcomes are open so you can inspect the flow without waiting for section unlocks.';
      }
      return;
    }

    var ready = items.every(function(item){
      return item.classList.contains('clicked');
    });

    input.disabled = !ready;
    if(helper){
      helper.classList.toggle('ready', ready);
      helper.innerHTML = ready
        ? '<strong>Ready to continue.</strong> You can confirm this section and unlock Block 1.'
        : '<strong>Guidance:</strong> Open each learning outcome card first, then confirm the section.';
    }
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

      input.addEventListener('change', function(){
        var stageId = input.getAttribute('data-stage-check');
        if(!stageId) return;

        if(input.checked){
          var label = input.closest('.check-item');
          if(label) label.classList.add('clicked');
          var nextStage = stageOrder[stageOrder.indexOf(stageId) + 1];
          if(nextStage) unlockStage(nextStage);
        }

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
        message.textContent = REVIEW_MODE
          ? 'Progress saved on this device. Review mode keeps every section open so you can inspect the complete module flow.'
          : 'Progress saved on this device. The next module button will unlock when the recap stage is complete.';
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
      speakingButton.textContent = 'Read aloud';
      speakingButton = null;
    }
  }

  function setupTts(){
    if(!synth) return;

    function bindButtons(){
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
          button.textContent = 'Stop audio';
          synth.speak(utterance);
        });
      });

      document.querySelectorAll('[data-tts-stop]').forEach(function(button){
        if(button.getAttribute('data-tts-stop-bound') === '1') return;
        button.setAttribute('data-tts-stop-bound', '1');
        button.addEventListener('click', stopSpeech);
      });
    }

    bindButtons();
    if(typeof synth.onvoiceschanged !== 'undefined'){
      synth.onvoiceschanged = function(){
        voice = getVoice();
      };
    }
  }

  function applyCardContent(selector, entries){
    var cards = document.querySelectorAll(selector);
    entries.forEach(function(entry, index){
      var card = cards[index];
      if(!card) return;
      var title = card.querySelector('h4');
      var body = card.querySelector('p');
      if(title) title.textContent = entry[0];
      if(body) body.textContent = entry[1];
    });
  }

  function configureReviewContent(moduleId){
    if(!REVIEW_MODE) return;

    var config = MODULE_REVIEW_CONTENT[moduleId];
    normalizeJourneyItems();

    document.querySelectorAll('.section-lock-banner').forEach(function(banner){
      banner.remove();
    });
    document.querySelectorAll('.section.gated-locked').forEach(function(section){
      section.classList.remove('gated-locked');
    });
    document.querySelectorAll('input[data-stage-check]').forEach(function(input){
      input.disabled = false;
    });

    setText('.status-chip', 'Training 2 review flow');
    setText('#journey .section-title-row h2', 'Swimming Journey');
    setText('[data-stage="journey"] .nav-label', 'Swimming Journey');
    setText('[data-stage="outcomes"] .nav-label', 'Learning Outcomes');

    if(config){
      document.title = config.heroTitle + ' - Swimming Training II';
      setText('.hero h1', config.heroTitle);
      setText('.hero p', config.heroDescription);

      var heroStats = document.querySelectorAll('.hero-stat');
      if(heroStats[0]){
        var strongA = heroStats[0].querySelector('strong');
        var spanA = heroStats[0].querySelector('span');
        if(strongA) strongA.textContent = '3 structured blocks';
        if(spanA) spanA.textContent = 'Open for review so the full teaching flow can be checked end to end.';
      }
      if(heroStats[1]){
        var strongB = heroStats[1].querySelector('strong');
        var spanB = heroStats[1].querySelector('span');
        if(strongB) strongB.textContent = 'Review mode';
        if(spanB) spanB.textContent = 'All sections stay visible so you can inspect sequence, titles and progression without unlock gates.';
      }

      setText('#journey .section-body > p', config.journeyIntro);
      setText('#outcomes .section-body > p', config.outcomesIntro);
      applyCardContent('#outcomes .outcome', config.outcomes);

      config.blocks.forEach(function(block, index){
        var stageId = 'block' + (index + 1);
        setText('[data-stage="' + stageId + '"] .nav-label', block.navLabel);
        setText('#' + stageId + ' .section-title-row h2', block.title);
        setText('#' + stageId + ' .section-body > p', block.intro);
        applyCardContent('#' + stageId + ' .block-intro-card', block.cards);
      });

      setText('#recap .section-body > p', config.recapIntro);
      applyCardContent('#recap .recap-card', config.recap);
      setText('#complete .completion-box h3', config.completionHeading);
      setText('#complete .completion-box > p', config.completionText);

      var nextButton = document.querySelector('[data-course-next-module-button]');
      if(nextButton && config.nextButtonLabel){
        nextButton.textContent = config.nextButtonLabel;
      }
    }

    document.querySelectorAll('.check-item strong').forEach(function(label){
      if(label.textContent.indexOf('complete') >= 0){
        label.textContent = label.textContent.replace('complete', 'reviewed');
      }
    });
    document.querySelectorAll('.check-item .check-text span').forEach(function(text){
      if(text.textContent){
        text.textContent = 'Review mode is active, so you can use this checkpoint while inspecting the full module flow.';
      }
    });
  }

  function init(){
    var moduleId = getModulePage();
    var stageOrder = ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'complete'];

    assignProgressItemKeys();
    restoreChecks(moduleId);
    applyUnlocks(stageOrder);
    restoreClickedItems(moduleId);
    setupClickableProgress(moduleId);
    configureReviewContent(moduleId);
    updateOutcomesReadyState();
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
