(function (global) {
  'use strict';

  /**
   * Curated insight intros for Module 5 nested folder/category screens.
   * panelTitle ? concept panel header (h4)
   * insight.title ? centered subtitle inside intro (must not repeat panelTitle)
   */
  var NESTED = {
    f1: {
      panelTitle: 'Water Adaptation',
      insight: {
        title: 'Foundation for Aquatic Learning',
        pillars: [
          { icon: 'focus', title: 'Safety and Comfort First', text: 'Water adaptation is the foundation of all aquatic learning. It focuses on helping swimmers feel safe, comfortable and confident in the water before introducing more complex skills.' },
          { icon: 'balance', title: 'Regulation and Adjustment', text: 'This stage supports emotional regulation and sensory adjustment so swimmers can settle in the aquatic environment.' },
          { icon: 'connect', title: 'Early Engagement', text: 'Early engagement with the water builds familiarity and confidence that later skills depend on.' }
        ]
      }
    },
    'f1-s1': {
      panelTitle: 'Enter & Exit in the Water Safely',
      insight: {
        title: 'Accessing the Pool Safely',
        pillars: [
          { icon: 'shield', title: 'Independence and Safety', text: 'Entering and exiting the water safely is a fundamental skill that supports independence and reduces risk.' },
          { icon: 'focus', title: 'Clear Routines', text: 'Clear routines help swimmers feel more confident and in control when accessing the pool.' },
          { icon: 'balance', title: 'Repeatable Access', text: 'Consistent entry and exit sequences reduce hesitation and build practical pool-side confidence.' }
        ]
      }
    },
    'f1-s2': {
      panelTitle: 'Water Movement',
      insight: {
        title: 'Exploring the Body in Water',
        pillars: [
          { icon: 'movement', title: 'Body Awareness', text: 'Water movement helps swimmers explore how their body behaves in the water. This builds familiarity, confidence and the foundation for future movement skills.' },
          { icon: 'connect', title: 'Playful Exploration', text: 'Early movement does not need to look like formal swimming. It may include walking, splashing, jumping, reaching, turning or moving with support.' },
          { icon: 'focus', title: 'Foundation for Propulsion', text: 'Exploration in supported movement prepares swimmers for later propulsion and stroke development.' }
        ]
      }
    },
    'f1-s3': {
      panelTitle: 'Aquatic Breathing & Submersion',
      insight: {
        title: 'Managing Face and Breath',
        pillars: [
          { icon: 'balance', title: 'Face Contact and Breath', text: 'Aquatic breathing and submersion help swimmers manage water contact with the face and develop controlled breathing patterns. This is essential for regulation, confidence and progression.' },
          { icon: 'focus', title: 'Gradual Introduction', text: 'Breathing skills should be introduced gradually, using playful and structured activities such as blowing, humming, bubbles, face contact and controlled submersion.' },
          { icon: 'connect', title: 'Regulation Through Breath', text: 'Controlled exhalation and predictable breathing patterns support calmness before more demanding skills.' }
        ]
      }
    },
    f2: {
      panelTitle: 'Floating, Streamlining & Water Safety',
      insight: {
        title: 'Control, Balance and Safety',
        pillars: [
          { icon: 'balance', title: 'Body Control in Water', text: 'This folder focuses on developing body control, balance and safety in the water. These skills are essential for efficient movement and progression.' },
          { icon: 'movement', title: 'Position and Efficiency', text: 'Floating, streamlining, rotation, sculling and water safety all support swimmers to understand their body position and maintain control in the water.' },
          { icon: 'shield', title: 'Safer Responses', text: 'These skills help swimmers respond more safely and confidently as movement demands increase.' }
        ]
      }
    },
    'f2-s1': {
      panelTitle: 'Floating & Balance',
      insight: {
        title: 'Trust in Buoyancy',
        pillars: [
          { icon: 'balance', title: 'Stable and Supported', text: 'Floating allows swimmers to remain stable and supported in the water. It builds confidence, trust in buoyancy and reduces reliance on external support.' },
          { icon: 'focus', title: 'Control in Position', text: 'Balance helps swimmers maintain control in different positions and prepares them for movement, transitions and safety skills.' },
          { icon: 'connect', title: 'Foundation for Movement', text: 'Floating and balance create the stable base that later propulsion and transitions build on.' }
        ]
      }
    },
    'f2-s2': {
      panelTitle: 'Streamlining, Rotation & Sculling',
      insight: {
        title: 'Efficient Body Control',
        pillars: [
          { icon: 'movement', title: 'Reduce Resistance', text: 'Streamlining focuses on body alignment to reduce resistance and improve efficiency in the water.' },
          { icon: 'balance', title: 'Feel for the Water', text: 'Rotation and sculling help swimmers develop fine control, balance adjustments and feel for the water.' },
          { icon: 'focus', title: 'Control Before Speed', text: 'These skills support body awareness and more efficient movement in later strokes and turns.' }
        ]
      }
    },
    'f2-s3': {
      panelTitle: 'Water Safety',
      insight: {
        title: 'Safety Embedded in Learning',
        pillars: [
          { icon: 'shield', title: 'Stay Safe in Water', text: 'Water safety skills help swimmers remain safe, manage fatigue and respond to unexpected situations.' },
          { icon: 'focus', title: 'Not Separate from Learning', text: 'These skills should not be treated as separate from learning. They should be embedded throughout sessions.' },
          { icon: 'connect', title: 'Practical Confidence', text: 'Embedded safety practice helps swimmers develop practical confidence and safer responses in water.' }
        ]
      }
    },
    f3: {
      panelTitle: 'Swimming Strokes, Diving, Starts & Turns',
      insight: {
        title: 'Structured Swimming Skills',
        pillars: [
          { icon: 'movement', title: 'Coordinated Skills', text: 'This folder develops structured and coordinated swimming skills, building on foundational aquatic abilities.' },
          { icon: 'balance', title: 'Readiness First', text: 'These skills should be introduced once swimmers have developed enough confidence, body control, breathing control and movement readiness.' },
          { icon: 'focus', title: 'Progressive Introduction', text: 'Introduce strokes, diving, starts and turns only when foundational skills support success.' }
        ]
      }
    },
    'f3-s1': {
      panelTitle: 'Swimming Strokes',
      insight: {
        title: 'Connected Stroke Development',
        pillars: [
          { icon: 'movement', title: 'Efficient Propulsion', text: 'Swimming strokes combine movement, breathing, coordination and body position to create efficient propulsion.' },
          { icon: 'focus', title: 'Progressive Development', text: 'Strokes should be developed progressively, ensuring that swimmers do not simply copy movements but understand how each part connects.' },
          { icon: 'balance', title: 'Parts That Connect', text: 'Each stroke element should link to breathing, body position and timing rather than isolated movements.' }
        ]
      }
    },
    'f3-s2': {
      panelTitle: 'Diving, Starts & Turns',
      insight: {
        title: 'Dynamic Entry and Efficient Transitions',
        pillars: [
          { icon: 'movement', title: 'Confidence and Control', text: 'Diving develops confidence and control when entering the water dynamically, while starts and turns support efficient transitions during structured swimming.' },
          { icon: 'shield', title: 'Safety and Readiness', text: 'These skills require readiness, body control, submersion confidence and a clear understanding of safety expectations.' },
          { icon: 'focus', title: 'Timing and Sequencing', text: 'Visual sequencing and progressive practice support timing, spatial awareness and control before swimmers add pace.' }
        ]
      }
    },
    f4: {
      panelTitle: 'Games, Toys & Equipment and Extras',
      insight: {
        title: 'Engagement and Flexibility',
        pillars: [
          { icon: 'connect', title: 'Motivation and Communication', text: 'This folder supports engagement, motivation, communication and session flexibility.' },
          { icon: 'movement', title: 'Playful Learning Tools', text: 'It includes playful learning tools, equipment based activities and additional visual supports.' },
          { icon: 'balance', title: 'Regulation and Choice', text: 'These resources help swimmers stay regulated, make choices and understand routines.' }
        ]
      }
    },
    'f4-s1': {
      panelTitle: 'Games',
      insight: {
        title: 'Purposeful Play',
        pillars: [
          { icon: 'connect', title: 'Motivating Practice', text: 'Games provide a motivating way to practise skills while maintaining engagement.' },
          { icon: 'focus', title: 'Linked to Learning', text: 'They should be purposeful and linked to learning, rather than used only as a reward or distraction.' },
          { icon: 'movement', title: 'Structured Play', text: 'Games work best when they reinforce a clear skill or session objective.' }
        ]
      }
    },
    'f4-s2': {
      panelTitle: 'Toys & Equipment',
      insight: {
        title: 'Supports for Learning',
        pillars: [
          { icon: 'movement', title: 'Engagement and Structure', text: 'Toys and equipment support learning by increasing engagement, providing structure and helping swimmers practise skills in accessible ways.' },
          { icon: 'balance', title: 'Support the Goal', text: 'They should support the learning goal without replacing the swimmer\u2019s own control or participation.' },
          { icon: 'focus', title: 'Use With Purpose', text: 'Equipment should clarify the activity, not replace the swimmer\u2019s active involvement.' }
        ]
      }
    },
    'f4-s3': {
      panelTitle: 'Extras',
      insight: {
        title: 'Communication and Routine',
        pillars: [
          { icon: 'connect', title: 'Visual Organisation', text: 'Extras include visual tools that support routines, communication and session organisation.' },
          { icon: 'balance', title: 'Visible Expectations', text: 'These resources help swimmers understand expectations, communicate needs and manage transitions.' },
          { icon: 'focus', title: 'Independent Engagement', text: 'Extras encourage independence and choice when verbal communication is limited.' }
        ]
      }
    },
    f5: {
      panelTitle: 'Session Plans',
      insight: {
        title: 'Connected Session Delivery',
        pillars: [
          { icon: 'focus', title: 'Structured Format', text: 'The Session Plan folder brings together all elements of the PixtoLearn system into a structured and practical format for real session delivery.' },
          { icon: 'balance', title: 'Clear, Predictable Sessions', text: 'It allows instructors to organise activities, sequence skills and create clear, predictable sessions using visual supports.' },
          { icon: 'connect', title: 'Connected Activities', text: 'Rather than selecting isolated activities, session plans connect skills, visuals, structure and progression.' }
        ]
      }
    },
    fc31: {
      panelTitle: 'Main Side & Break It Down',
      insight: {
        title: 'Two Sides of Teaching',
        pillars: [
          { icon: 'focus', title: 'Main Visual Side', text: 'PixtoLearn Swimming flashcards include a main visual side and a structured teaching side. The main side shows the swimmer what the skill or action looks like.' },
          { icon: 'balance', title: 'Break It Down Side', text: 'The Break It Down side supports the instructor by providing step by step teaching guidance.' },
          { icon: 'movement', title: 'From Show to Teach', text: 'This helps instructors move from showing the visual to modelling, prompting and teaching the skill progressively.' }
        ]
      }
    },
    fc32: {
      panelTitle: 'Toys & Equipment',
      insight: {
        title: 'Toys & Equipment Flashcards',
        pillars: [
          { icon: 'movement', title: 'Prepare for Equipment', text: 'Toys and equipment flashcards help swimmers understand what equipment will be used and how it connects to the activity.' },
          { icon: 'connect', title: 'Controlled Choice', text: 'They can also be used to offer controlled choice, increase motivation and prepare swimmers for what is coming next.' },
          { icon: 'focus', title: 'Link to the Activity', text: 'Show the equipment card before the activity so expectations are visible and predictable.' }
        ]
      }
    },
    fc33: {
      panelTitle: 'Break Time / Choosing',
      insight: {
        title: 'Regulation and Autonomy',
        pillars: [
          { icon: 'balance', title: 'Structured Breaks', text: 'Break Time and Choosing flashcards support regulation, autonomy and communication.' },
          { icon: 'connect', title: 'Break Time Card', text: 'The Break Time card helps swimmers understand that a break is available in a structured way.' },
          { icon: 'focus', title: 'Choosing Card', text: 'The Choosing card allows swimmers to make controlled choices within the session.' }
        ]
      }
    },
    fc34: {
      panelTitle: 'How Do You Feel? / Where?',
      insight: {
        title: 'Express Needs Visually',
        pillars: [
          { icon: 'connect', title: 'Feelings and Location', text: 'These flashcards support communication by helping swimmers express feelings, needs and location related information.' },
          { icon: 'balance', title: 'When Words Are Hard', text: 'They are especially useful for swimmers who may find verbal communication difficult, delayed or unreliable during sessions.' },
          { icon: 'focus', title: 'Visible Communication', text: 'Keep these cards accessible so swimmers can signal needs without relying on speech alone.' }
        ]
      }
    },
    fc35: {
      panelTitle: 'White Cards',
      insight: {
        title: 'Personalise the System',
        pillars: [
          { icon: 'focus', title: 'Flexible Visuals', text: 'White flashcards allow instructors to personalise the visual system.' },
          { icon: 'connect', title: 'Individualised Supports', text: 'They can be used to create temporary visuals, individualised instructions, custom activities or additional supports.' },
          { icon: 'balance', title: 'When Nothing Fits', text: 'Use white cards when a swimmer needs something specific that is not already represented in the kit.' }
        ]
      }
    },
    fc36: {
      panelTitle: 'Finished Card',
      insight: {
        title: 'Clear Endings',
        pillars: [
          { icon: 'focus', title: 'Signal Completion', text: 'The Finished card signals that an activity, sequence or session has ended.' },
          { icon: 'balance', title: 'Support Transitions', text: 'It helps swimmers understand completion, supports transitions and reduces uncertainty about what is happening next.' },
          { icon: 'connect', title: 'Predictable Closure', text: 'Use the Finished card consistently so endings feel clear and manageable.' }
        ]
      }
    },
    vs1: {
      panelTitle: 'First & Then (2 Activities)',
      insight: {
        title: 'Simple Two-Step Structure',
        pillars: [
          { icon: 'focus', title: 'Two Activities Only', text: 'The First & Then schedule is the simplest visual structure, using two activities. It clearly shows what comes first and what happens next.' },
          { icon: 'balance', title: 'Reduced Cognitive Load', text: 'This format is especially effective for swimmers who benefit from reduced cognitive load, immediate structure or motivation to complete less preferred activities.' },
          { icon: 'connect', title: 'Break Down Longer Plans', text: 'It can also be used to break larger schedules into smaller, more manageable routines.' }
        ]
      }
    },
    vs2: {
      panelTitle: 'First, Next & Then (3 Activities)',
      insight: {
        title: 'Three-Step Progression',
        pillars: [
          { icon: 'movement', title: 'Three Activities', text: 'The First, Next & Then schedule expands the structure to three activities.' },
          { icon: 'balance', title: 'Manageable Sequence', text: 'It helps swimmers understand a slightly longer sequence while still keeping the session manageable and predictable.' },
          { icon: 'focus', title: 'Prepare for Progression', text: 'This structure is useful when introducing progression, preparing a swimmer for a new skill or organising a short part of a longer session.' }
        ]
      }
    },
    vs3: {
      panelTitle: 'Four or More Activities',
      insight: {
        title: 'Full Session Overview',
        pillars: [
          { icon: 'focus', title: 'Session Structure', text: 'A visual schedule with four or more activities provides a fuller overview of the session. It allows swimmers to see the structure, duration and flow from the beginning.' },
          { icon: 'balance', title: 'Break Into Smaller Parts', text: 'For swimmers who find longer sequences difficult, the schedule can be broken down into smaller parts using First & Then or First, Next & Then.' },
          { icon: 'connect', title: 'Flexible Structure', text: 'This makes the schedule flexible while still providing clear structure.' }
        ]
      }
    }
  };

  global.ConceptInsightNestedM5 = {
    get: function (screenId) {
      if (!screenId) return null;
      return NESTED[screenId] || null;
    },
    has: function (screenId) {
      return !!this.get(screenId);
    },
    panelTitle: function (screenId) {
      var entry = this.get(screenId);
      return entry ? entry.panelTitle : '';
    }
  };
})(typeof window !== 'undefined' ? window : this);
