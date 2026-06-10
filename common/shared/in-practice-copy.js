(function () {
  'use strict';

  var COPY = {
    b1c3: 'Layer support before demand. Let comfort settle before you raise the challenge.',
    b1c4: 'Build control first. Speed and effort follow when the body can hold it.',
    b2c1: 'Scan continuously. Subtle shifts in position or response often precede obvious distress.',
    b2c2: 'Calibrate supervision to the swimmer in front of you, not only to the activity on the plan.',
    b2c3: 'Use clear structure, close proximity, and adapted communication to reduce preventable risk.',
    b2c4: 'Prevention is proximity and positioning. Stay close, stay visible, organise the space.',
    b3c1: 'Let the body settle into the water before you add structure, instruction, or task demand.',
    b3c2: 'Read sensory signals in the body before you assume understanding or readiness.',
    b3c3: 'Treat land skills as a reference, not a guarantee. Water asks the body to reorganise.',
    b3c4: 'Tune pace, space, and support to the swimmer\'s sensory profile, not a standard template.',

    m2_b1c1: 'Read readiness in the body and face before you introduce anything new.',
    m2_b1c2: 'When state shifts, reshape pace and expectation before you reshape the task.',
    m2_b1c3: 'Respond to the need beneath the behaviour. What you see is rarely the full story.',
    m2_b1c4: 'Treat readiness as live data. Observe, adjust, and observe again throughout the session.',
    m2_b2c1: 'Catch state early. Match pace and support to what is present, not what the plan assumed.',
    m2_b2c2: 'Name the state before you change the approach. Each state asks for a different response.',
    b2c2_calm: 'When regulation is steady, progress with intention and keep demand measured so calm holds.',
    b2c2_alert: 'Hold the structure. Alert states need stability, not acceleration.',
    b2c2_overloaded: 'Strip the task back to regulation first. Learning returns when demand falls.',
    m2_b3c1: 'Read the whole picture: pool conditions, environment, and what the swimmer brought in today.',
    b3c2_env: 'Reposition, open space, or simplify the setting before you push the swimmer harder.',
    b3c2_water: 'Adjust depth, support, or body position in the water before you change the task.',
    b3c2_internal: 'Track energy, tension, and withdrawal. Internal load often shifts before behaviour does.',

    m3_b1c1: 'Look beyond visible participation. True engagement is connection and availability to learn.',
    m3_b1c2: 'Track small patterns of connection. Subtle signals often arrive before obvious participation.',
    m3_b1c3: 'When engagement drops, pause and rebuild it before you add instruction or progression.',
    m3_b2c1: 'Secure connection before you advance the task. A joined swimmer learns; a distant one survives.',
    m3_b2c2: 'Keep interaction calm, consistent, and predictable. Trust is built in repetition, not intensity.',
    m3_b2c3: 'Let tone, signals, and pacing do the connecting. How you deliver shapes whether they stay with you.',
    m3_b2c4: 'Adjust pace and demand at the first sign of strain. Protecting the relationship protects learning.',
    m3_b3c1: 'Watch engagement shift in real time. Intervene early before disengagement takes hold.',
    m3_b3c2: 'Treat pace and structure as live controls. Stability comes from continuous fine adjustment.',
    m3_b3c3: 'Observe first, then choose. The right engagement approach depends on the swimmer in front of you.',
    m3_b3c3_mod: 'Demonstrate the pattern clearly before you expect the swimmer to attempt it.',
    m3_b3c3_turn: 'Use simple back-and-forth exchanges to keep the swimmer inside the interaction with you.',
    m3_b3c3_guide: 'Leave room for the try. Guide lightly and resist taking over too soon.',
    m3_b3c3_intensive: 'Join the swimmer\'s rhythm before you introduce structure or higher demand.',
    m3_b3c3_play: 'Use play with purpose. Enjoyment should build engagement toward a clear learning aim.',
    m3_b3c4: 'When disengagement appears, pause, reduce demand, and reconnect before you continue.',

    m4_b1c1: 'Judge progress by how the swimmer functions in water, not only by skills achieved.',
    m4_b1c2: 'Shape the session around the swimmer\'s pathway. Adapt expectation before you force conformity.',
    m4_b1c3: 'Let principles guide the moment. Sound decisions beat rigid sequences.',
    m4_b3c1: 'Consolidation and pause are part of progress. Allow time before you move the swimmer on.',
    m4_b3c2: 'Adapt how you teach. Access to learning changes when instruction matches the swimmer.',
    b3c3_step1: 'Place the stage where the swimmer usually lives in the water across the term, not their best moment.',
    b3c3_step2: 'Use focus-area ratings to test the level you chose. Consistency matters more than first impression.',
    b3c3_step3: 'Read development areas as access to learning, not only as a record of skill performance.',

    t2_b1c1: 'Strong aquatic confidence shows before technique. Honour control and readiness before structured strokes.',
    t2_b1c2: 'When coordination collapses under demand, return to balance and body control, not the next skill.',
    t2_b1c3: 'Face contact may need repeated, gentle exposure. Progression is exposure over time, not force.',
    t2_b1c4: 'Active movement is not readiness. Stay with foundational work until control holds under structure.',
    t2_b2c1: 'Breath-holding and tension often sit behind poor float. Address regulation before you chase position.',
    t2_b2c2: 'Repeated head-lifting signals breathing and regulation. Treat these as the lever for progress.',
    t2_b2c3: 'Balance problems often trace to breathing uncertainty. Observe the whole pattern, not one symptom.',
    t2_b2c4: 'Some foundations need many sessions. Protect gradual exposure and mark small gains without rushing.',
    t2_b3c1: 'Calm entry with minimal guidance is independence forming. Give space before you step back in.',
    t2_b3c2: 'Pause after a wobble. Recovery is the lesson; assist only when self-correction is not returning.',
    t2_b3c3: 'If tension rises when support drops, restore light contact, regulate, then fade support more slowly.',
    t2_b3c4: 'When demand outpaces capacity, simplify the task and rebuild engagement before you advance again.'
  };

  var MODULE_ALIASES = {
    'training-i/modules/module-2': {
      b1c1: 'm2_b1c1', b1c2: 'm2_b1c2', b1c3: 'm2_b1c3', b1c4: 'm2_b1c4',
      b2c1: 'm2_b2c1', b2c2: 'm2_b2c2', b3c1: 'm2_b3c1'
    },
    'training-i/modules/module-3': {
      b1c1: 'm3_b1c1', b1c2: 'm3_b1c2', b1c3: 'm3_b1c3',
      b2c1: 'm3_b2c1', b2c2: 'm3_b2c2', b2c3: 'm3_b2c3', b2c4: 'm3_b2c4',
      b3c1: 'm3_b3c1', b3c2: 'm3_b3c2', b3c3: 'm3_b3c3',
      b3c3_mod: 'm3_b3c3_mod', b3c3_turn: 'm3_b3c3_turn', b3c3_guide: 'm3_b3c3_guide',
      b3c3_intensive: 'm3_b3c3_intensive', b3c3_play: 'm3_b3c3_play',
      b3c4: 'm3_b3c4'
    },
    'training-i/modules/module-4': {
      b1c1: 'm4_b1c1', b1c2: 'm4_b1c2', b1c3: 'm4_b1c3',
      b3c1: 'm4_b3c1', b3c2: 'm4_b3c2'
    },
    'training-ii/modules/module-1': {
      b1c1: 't2_b1c1', b1c2: 't2_b1c2', b1c3: 't2_b1c3', b1c4: 't2_b1c4',
      b2c1: 't2_b2c1', b2c2: 't2_b2c2', b2c3: 't2_b2c3', b2c4: 't2_b2c4',
      b3c1: 't2_b3c1', b3c2: 't2_b3c2', b3c3: 't2_b3c3', b3c4: 't2_b3c4'
    }
  };

  function detectModuleKey() {
    var path = (window.location.pathname || '').replace(/\/index\.html$/, '').replace(/\/$/, '');
    if (path.indexOf('training-ii/modules/module-1') !== -1) return 'training-ii/modules/module-1';
    if (path.indexOf('training-i/modules/module-4') !== -1) return 'training-i/modules/module-4';
    if (path.indexOf('training-i/modules/module-3') !== -1) return 'training-i/modules/module-3';
    if (path.indexOf('training-i/modules/module-2') !== -1) return 'training-i/modules/module-2';
    return '';
  }

  window.InPracticeCopy = {
    map: COPY,
    resolve: function (target, fallback) {
      if (!target) return fallback || '';
      if (COPY[target]) return COPY[target];
      var moduleKey = detectModuleKey();
      var aliases = MODULE_ALIASES[moduleKey];
      if (aliases && aliases[target] && COPY[aliases[target]]) return COPY[aliases[target]];
      return fallback || '';
    }
  };
})();
