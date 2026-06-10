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

    m1_b1c1: 'Read early instability as adaptation to an active environment, not as lack of ability.',
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
    m4_b2core1: 'When tension rises, simplify the task and reduce sensory load before you add challenge.',
    m4_b2core2: 'Track support needs over time in small steps before you progress or consolidate level.',
    m4_b2core3: 'If attention drifts, match pace and demand before assuming the task is too easy.',
    m4_b2l1_overview: 'Prioritise calm and support across all four focus areas before you add skill demand.',
    m4_b2l1_f1: 'Let the swimmer explore water contact at their pace with full support.',
    m4_b2l1_f2: 'Keep movement gentle and fully supported until body position feels predictable.',
    m4_b2l1_f3: 'Introduce face exposure in tiny steps only when the swimmer is regulated.',
    m4_b2l1_f4: 'Stay close and name safe zones before you expect independent movement.',
    m4_b2l1_activities: 'Keep entry, movement, and face exposure fully supported until calm participation is consistent.',
    m4_b2l2_overview: 'Extend time and variety only when comfort from Level 1 is steady.',
    m4_b2l2_f1: 'Use familiar routines to lengthen time in water without raising pressure.',
    m4_b2l2_f2: 'Add movement variety gradually while support stays available.',
    m4_b2l2_f3: 'Link bubble play and short immersions to calm, not performance.',
    m4_b2l2_f4: 'Teach edge use and safe zones before you reduce proximity support.',
    m4_b2l2_activities: 'Extend time in water through familiar routines before you reduce support or add complexity.',
    m4_b2l3_overview: 'Build float, streamline, and first propulsion with recovery at the wall every time.',
    m4_b2l3_f1: 'Hold floats short and supported until balance feels stable in both positions.',
    m4_b2l3_f2: 'Keep streamlines and rotations simple before you link them to travel.',
    m4_b2l3_f3: 'Connect first kicks and arms to clear direction and recovery.',
    m4_b2l3_f4: 'Practice recovery to the wall within every short skill block.',
    m4_b2l3_activities: 'Link float, streamline, and first propulsion to clear recovery at the wall every time.',
    m4_b2l4_overview: 'Increase independence in floats, glides, and propulsion while safety sequences stay structured.',
    m4_b2l4_f1: 'Shorten support only when floats and transitions stay calm and controlled.',
    m4_b2l4_f2: 'Extend glide length only while streamline holds without constant prompting.',
    m4_b2l4_f3: 'Raise propulsion demand when breathing and direction stay steady.',
    m4_b2l4_f4: 'Run swim-float-swim sequences with support before you expect solo recovery.',
    m4_b2l4_activities: 'Keep glides and rotations short and repeatable so control stays ahead of fatigue.',
    m4_b2l5_overview: 'Hold technique standards explicit as stroke volume and wall work increase.',
    m4_b2l5_f1: 'Keep streamline and rotation quality visible before you add set density.',
    m4_b2l5_f2: 'Name the stroke standard clearly and protect it as fatigue rises.',
    m4_b2l5_f3: 'Teach starts, turns, and push-offs as repeatable sequences, not one-off demos.',
    m4_b2l5_f4: 'Check safety decisions during busy swimming, not only at session start.',
    m4_b2l5_activities: 'Hold technique standards explicit as volume rises. Quality and safety stay linked.',
    m4_b2l6_overview: 'Increase distance and density only while fluency and self-regulation stay stable.',
    m4_b2l6_f1: 'Protect stroke shape over longer repeats before you chase speed.',
    m4_b2l6_f2: 'Adjust pace from rhythm cues, not from pressure to finish the set.',
    m4_b2l6_f3: 'Extend distance in steps while breathing recovery stays efficient.',
    m4_b2l6_f4: 'Link wall skills to stroke rhythm so flow does not break under fatigue.',
    m4_b2l6_activities: 'Increase distance and set density only while fluency and self-regulation stay stable.',
    m4_b3c1: 'Consolidation and pause are part of progress. Allow time before you move the swimmer on.',
    m4_b3c2: 'Adapt how you teach. Access to learning changes when instruction matches the swimmer.',
    b3c3_step1: 'Place the stage where the swimmer usually lives in the water across the term, not their best moment.',
    b3c3_step2: 'Use focus-area ratings to test the level you chose. Consistency matters more than first impression.',
    b3c3_step3: 'Read development areas as access to learning, not only as a record of skill performance.',

    m5_b1c1: 'Show the visual before you explain. Let the image carry expectation when words are hard to process.',
    m5_b1c2: 'Present one visible step at a time rather than stacking several verbal instructions.',
    m5_b1c3: 'Use the schedule to show what comes next so participation is driven by predictability, not pressure.',
    m5_b2c1: 'Show the PixtoLearn system before you explain it. Let visuals carry expectation when words are hard to process.',
    m5_b2c2: 'Choose folder and category before the session starts so progression stays predictable.',
    m5_b2c3: 'Keep flashcards within reach and match card type to the moment: instruction, choice, regulation, or closure.',
    m5_b3c2: 'Teach each skill alone before you link flashcards into a continuous sequence.',
    m5_b3c3: 'Anchor the session to one main outcome, then break it into visible phases with flashcards.',
    m5_f5: 'Build the session plan before swimmers arrive so visuals, sequence, and outcomes stay aligned.',
    m5_f1_s1: 'Model the entry routine visually before you ask the swimmer to attempt it.',
    m5_f1_s2: 'Use movement exploration to build familiarity before you name formal skills.',
    m5_f1_s3: 'Introduce face and breath work playfully in short steps tied to regulation.',
    m5_f2_s1: 'Let buoyancy and support do the work before you expect independent float holds.',
    m5_f2_s2: 'Show the long body shape visually before you ask the swimmer to glide.',
    m5_f2_s3: 'Keep sculling and rotation drills short so feel for water builds without overload.',
    m5_f2_s4: 'Embed safety cues inside every activity block, not as a separate lecture.',
    m5_f3_s1: 'Break stroke into visible parts before you expect a full coordinated pattern.',
    m5_f3_s2: 'Confirm readiness and submersion comfort before you introduce any dynamic entry.',
    m5_f3_s3: 'Teach wall skills as repeatable sequences with visuals before you add pace.',
    m5_f4_s1: 'Choose games that rehearse the session outcome, not just fill time.',
    m5_f4_s2: 'Match equipment to the learning goal and fade it when the skill holds without it.',
    m5_f4_s3: 'Use routine and communication cards at transitions when demand or uncertainty rises.',
    m5_fc31: 'Show Main first for the whole picture, then flip to Break It Down when step-by-step support is needed.',
    m5_fc32: 'Introduce equipment with the flashcard before you hand it over so the activity purpose stays clear.',
    m5_fc33: 'Offer Break Time and Choosing cards when regulation or autonomy needs rise.',
    m5_fc34: 'Check in with How Do You Feel and Where cards when communication slows or distress appears.',
    m5_fc35: 'Use white cards for swimmer-specific needs that the standard kit does not cover yet.',
    m5_fc36: 'Signal Finished clearly at activity end so the swimmer knows what comes next.',
    m5_vs1: 'Use First and Then for two-step sequences until the swimmer follows both parts reliably.',
    m5_vs2: 'Add the middle step on the schedule once First and Then is stable across sessions.',
    m5_vs3: 'Expand to four or more activities only when transitions stay calm with shorter schedules.',

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
    'training-i/modules/module-1': {
      b1c1: 'm1_b1c1'
    },
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
      b2core1: 'm4_b2core1', b2core2: 'm4_b2core2', b2core3: 'm4_b2core3',
      b2l1_overview: 'm4_b2l1_overview', b2l1_f1: 'm4_b2l1_f1', b2l1_f2: 'm4_b2l1_f2', b2l1_f3: 'm4_b2l1_f3', b2l1_f4: 'm4_b2l1_f4', b2l1_activities: 'm4_b2l1_activities',
      b2l2_overview: 'm4_b2l2_overview', b2l2_f1: 'm4_b2l2_f1', b2l2_f2: 'm4_b2l2_f2', b2l2_f3: 'm4_b2l2_f3', b2l2_f4: 'm4_b2l2_f4', b2l2_activities: 'm4_b2l2_activities',
      b2l3_overview: 'm4_b2l3_overview', b2l3_f1: 'm4_b2l3_f1', b2l3_f2: 'm4_b2l3_f2', b2l3_f3: 'm4_b2l3_f3', b2l3_f4: 'm4_b2l3_f4', b2l3_activities: 'm4_b2l3_activities',
      b2l4_overview: 'm4_b2l4_overview', b2l4_f1: 'm4_b2l4_f1', b2l4_f2: 'm4_b2l4_f2', b2l4_f3: 'm4_b2l4_f3', b2l4_f4: 'm4_b2l4_f4', b2l4_activities: 'm4_b2l4_activities',
      b2l5_overview: 'm4_b2l5_overview', b2l5_f1: 'm4_b2l5_f1', b2l5_f2: 'm4_b2l5_f2', b2l5_f3: 'm4_b2l5_f3', b2l5_f4: 'm4_b2l5_f4', b2l5_activities: 'm4_b2l5_activities',
      b2l6_overview: 'm4_b2l6_overview', b2l6_f1: 'm4_b2l6_f1', b2l6_f2: 'm4_b2l6_f2', b2l6_f3: 'm4_b2l6_f3', b2l6_f4: 'm4_b2l6_f4', b2l6_activities: 'm4_b2l6_activities',
      b3c1: 'm4_b3c1', b3c2: 'm4_b3c2'
    },
    'training-i/modules/module-5': {
      b1c1: 'm5_b1c1', b1c2: 'm5_b1c2', b1c3: 'm5_b1c3',
      b2c1: 'm5_b2c1', b2c2: 'm5_b2c2', b2c3: 'm5_b2c3',
      b3c2: 'm5_b3c2', b3c3: 'm5_b3c3',
      f5: 'm5_f5', 'f1-s1': 'm5_f1_s1', 'f1-s2': 'm5_f1_s2', 'f1-s3': 'm5_f1_s3',
      'f2-s1': 'm5_f2_s1', 'f2-s2': 'm5_f2_s2', 'f2-s3': 'm5_f2_s3', 'f2-s4': 'm5_f2_s4',
      'f3-s1': 'm5_f3_s1', 'f3-s2': 'm5_f3_s2', 'f3-s3': 'm5_f3_s3',
      'f4-s1': 'm5_f4_s1', 'f4-s2': 'm5_f4_s2', 'f4-s3': 'm5_f4_s3',
      fc31: 'm5_fc31', fc32: 'm5_fc32', fc33: 'm5_fc33', fc34: 'm5_fc34', fc35: 'm5_fc35', fc36: 'm5_fc36',
      vs1: 'm5_vs1', vs2: 'm5_vs2', vs3: 'm5_vs3'
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
    if (path.indexOf('training-i/modules/module-5') !== -1) return 'training-i/modules/module-5';
    if (path.indexOf('training-i/modules/module-4') !== -1) return 'training-i/modules/module-4';
    if (path.indexOf('training-i/modules/module-3') !== -1) return 'training-i/modules/module-3';
    if (path.indexOf('training-i/modules/module-2') !== -1) return 'training-i/modules/module-2';
    if (path.indexOf('training-i/modules/module-1') !== -1) return 'training-i/modules/module-1';
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
