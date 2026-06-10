(function(global){
  'use strict';

  /**
   * Curated intro insights for Training I concepts.
   * Key format: "moduleNumber:conceptId" (e.g. "1:b2c1")
   * Titles and pillar labels are instructor-focused; pillar text comes from approved concept copy.
   */
  var CURATED = {
    // MODULE 1 — Block 1
    '1:b1c1': {
      title: 'Water Is Never Passive',
      pillars: [
        { icon: 'movement', title: 'Constant Influence', text: 'Water continuously influences the body — direction, speed, and effort all change in response to it.' },
        { icon: 'balance', title: 'Active Control', text: 'Maintaining position in water requires active control, not passive floating.' },
        { icon: 'response', title: 'Adaptation, Not Failure', text: 'Early instability often reflects adaptation to water rather than lack of ability.' }
      ]
    },
    '1:b1c2': {
      title: 'Multiple Forces at Work',
      pillars: [
        { icon: 'movement', title: 'Always Acting', text: 'In water, multiple forces act on the body at the same time.' },
        { icon: 'balance', title: 'Support and Challenge', text: 'Some forces support the body; others create challenge and instability.' },
        { icon: 'focus', title: 'Read Behaviour', text: 'Understanding how forces interact helps you interpret swimmer behaviour more accurately.' }
      ]
    },
    '1:b1c3': {
      title: 'Support Is Not Control',
      pillars: [
        { icon: 'balance', title: 'Buoyancy Lifts', text: 'Buoyancy reduces how heavy the body feels and can help swimmers feel safer.' },
        { icon: 'response', title: 'Pressure Surrounds', text: 'Water pressure surrounds the body and can support awareness and organisation.' },
        { icon: 'focus', title: 'Support vs Control', text: 'Support can increase confidence, but it does not always lead to control.' }
      ]
    },
    '1:b1c4': {
      title: 'Resistance Shapes Movement',
      pillars: [
        { icon: 'movement', title: 'Water Resists', text: 'Water resists movement in all directions — faster movement increases resistance.' },
        { icon: 'balance', title: 'Less Predictable', text: 'Movement in water is less stable and more demanding than on land.' },
        { icon: 'shield', title: 'Control Before Speed', text: 'Movement in water requires control, not just effort — prioritise control before increasing speed.' }
      ]
    },

    // MODULE 1 — Block 2
    '1:b2c1': {
      title: 'Often Silent, Rarely Obvious',
      pillars: [
        { icon: 'shield', title: 'Quick and Unseen', text: 'Drowning can happen quickly and often without obvious signs.' },
        { icon: 'movement', title: 'Not Always Dramatic', text: 'It is not always dramatic, noisy, or easy to recognise.' },
        { icon: 'focus', title: 'Watch for Subtle Signs', text: 'Risk often appears through subtle changes in position, response, or movement. Stay continuously aware.' }
      ]
    },
    '1:b2c2': {
      title: 'Risk Varies Between Swimmers',
      pillars: [
        { icon: 'balance', title: 'Not Equal Risk', text: 'Not all swimmers experience the same level of risk in water.' },
        { icon: 'shield', title: 'Individual Factors', text: 'Reduced awareness, limited confidence, or difficulty following instructions can increase vulnerability.' },
        { icon: 'focus', title: 'Look Beyond Appearance', text: 'Vulnerability is not always obvious — consider the swimmer\'s real level of understanding and control.' }
      ]
    },
    '1:b2c3': {
      title: 'Individual Factors in Safety',
      pillars: [
        { icon: 'connect', title: 'Additional Considerations', text: 'Some neurodiverse swimmers may present additional factors that affect safety and awareness in water.' },
        { icon: 'balance', title: 'Factors, Not Labels', text: 'These factors do not define the swimmer, but they may increase vulnerability in aquatic settings.' },
        { icon: 'focus', title: 'Adapt Your Practice', text: 'Sensory, communication, awareness, and behavioural differences can all influence safety — adapt accordingly.' }
      ]
    },
    '1:b2c4': {
      title: 'Safety Through Prevention',
      pillars: [
        { icon: 'shield', title: 'Prevent, Don\'t React', text: 'Safety in water is based on prevention, not reaction once problems appear.' },
        { icon: 'focus', title: 'Systems Over Response', text: 'You cannot rely on reacting to problems — safety must be built through consistent systems.' },
        { icon: 'movement', title: 'Reduce Risk Early', text: 'Structured sessions, active supervision, and proximity reduce risk before it develops.' }
      ]
    },

    // MODULE 1 — Block 3
    '1:b3c1': {
      title: 'Everything Changes at Entry',
      pillars: [
        { icon: 'response', title: 'Immediate Shift', text: 'Entering water immediately changes how the body feels — temperature, pressure, movement, and balance all shift at once.' },
        { icon: 'balance', title: 'Time to Adapt', text: 'The body must begin adapting straight away before organised movement can happen.' },
        { icon: 'focus', title: 'Sensory, Not Behavioural', text: 'Initial hesitation or discomfort is often sensory, not behavioural — allow time before adding demands.' }
      ]
    },
    '1:b3c2': {
      title: 'A Full Sensory Shift',
      pillars: [
        { icon: 'balance', title: 'Beyond Muscles Alone', text: 'Movement and regulation depend on multiple sensory systems working together, not muscles alone.' },
        { icon: 'response', title: 'Water Alters Input', text: 'Balance, body awareness, and touch are especially affected by pressure, buoyancy, and changing body position.' },
        { icon: 'focus', title: 'Observe Before Assuming', text: 'Sensory input may feel stronger, reduced, or harder to organise. Allow time to process before expecting a response.' }
      ]
    },
    '1:b3c3': {
      title: 'Water Feels Different',
      pillars: [
        { icon: 'balance', title: 'Different Feedback', text: 'What feels stable and familiar on land may feel less predictable in water.' },
        { icon: 'movement', title: 'Balance Changes', text: 'Water changes balance, feedback, and body awareness — swimmers need time to reorganise.' },
        { icon: 'focus', title: 'No Instant Transfer', text: 'Do not expect immediate transfer of land skills to water — adaptation takes time.' }
      ]
    },
    '1:b3c4': {
      title: 'Sensory Responses Differ',
      pillars: [
        { icon: 'response', title: 'Hypo or Hyper', text: 'Some swimmers need more stimulation to feel organised; others become overwhelmed by the same input.' },
        { icon: 'balance', title: 'Affects Everything', text: 'Sensory responses affect regulation, behaviour, engagement, and readiness in water.' },
        { icon: 'focus', title: 'Adapt the Environment', text: 'Adapt pace, environment, and support to each swimmer\'s sensory needs.' }
      ]
    },

    // MODULE 2 — Block 1
    '2:b1c1': {
      title: 'Learning Requires Readiness',
      pillars: [
        { icon: 'focus', title: 'Not Automatic', text: 'Learning in water is not automatic, even when a swimmer has the physical ability to perform a task.' },
        { icon: 'balance', title: 'Moment by Moment', text: 'In each moment, learning depends on whether the swimmer is ready to engage and respond.' },
        { icon: 'movement', title: 'When to Teach', text: 'Recognise when to teach, when to pause, and when to adjust your approach.' }
      ]
    },
    '2:b1c2': {
      title: 'Regulation Comes First',
      pillars: [
        { icon: 'balance', title: 'State Before Skill', text: 'For learning to happen, the swimmer must be in a state where they can engage and respond.' },
        { icon: 'response', title: 'Dysregulation Limits Learning', text: 'When regulation is not in place, the swimmer may struggle to process instructions regardless of ability.' },
        { icon: 'focus', title: 'Adapt, Don\'t Push', text: 'Teaching must adapt to the swimmer\'s state — not just follow a fixed plan.' }
      ]
    },
    '2:b1c3': {
      title: 'Behaviour Has Meaning',
      pillars: [
        { icon: 'focus', title: 'Interpret Accurately', text: 'Understanding learning through regulation allows you to interpret behaviour with more accuracy.' },
        { icon: 'connect', title: 'Why, Not Just What', text: 'Instead of focusing only on what the swimmer is doing, understand why it is happening in that moment.' },
        { icon: 'movement', title: 'Respond Appropriately', text: 'This shift supports more effective and appropriate responses during the session.' }
      ]
    },
    '2:b1c4': {
      title: 'Readiness Is Not Fixed',
      pillars: [
        { icon: 'movement', title: 'It Fluctuates', text: 'Readiness can change throughout the session as demands increase or conditions shift.' },
        { icon: 'balance', title: 'Engagement Shifts', text: 'A swimmer may be engaged at one point and struggle later as fatigue or sensory load increases.' },
        { icon: 'focus', title: 'Adjust in Real Time', text: 'Recognising these changes allows you to adjust your approach throughout the session.' }
      ]
    },

    // MODULE 2 — Block 2
    '2:b2c1': {
      title: 'State Shapes Engagement',
      pillars: [
        { icon: 'balance', title: 'Direct Impact', text: 'Emotional state directly affects how a swimmer engages, responds, and participates.' },
        { icon: 'movement', title: 'Same Task, Different Experience', text: 'Even when the task stays the same, changes in state can alter whether learning is accessible.' },
        { icon: 'shield', title: 'Protect Engagement', text: 'Recognising state helps you adjust support to maintain engagement and safety.' }
      ]
    },
    '2:b2c2': {
      title: 'States Shift Through the Session',
      pillars: [
        { icon: 'movement', title: 'Always Moving', text: 'Swimmers move between different emotional states depending on demand, environment, and internal factors.' },
        { icon: 'balance', title: 'Affects Everything', text: 'State influences engagement with tasks, response to instruction, and experience of the water.' },
        { icon: 'focus', title: 'Identify Before Adapting', text: 'Identify the swimmer\'s state before choosing your teaching response.' }
      ]
    },
    '2:b2c2_calm': {
      title: 'Regulated and Ready',
      pillars: [
        { icon: 'balance', title: 'Most Accessible', text: 'In a calm state, the swimmer is regulated, comfortable, and able to engage — learning is most accessible here.' },
        { icon: 'movement', title: 'Introduce New Skills', text: 'The swimmer can process information and respond with control — a good time to introduce new skills.' },
        { icon: 'focus', title: 'Maintain Regulation', text: 'Progress learning steadily while maintaining regulation.' }
      ]
    },
    '2:b2c2_alert': {
      title: 'Engaged With Rising Demand',
      pillars: [
        { icon: 'movement', title: 'Still Engaged', text: 'The swimmer is still engaged but beginning to experience increased demand.' },
        { icon: 'balance', title: 'Less Stable', text: 'Control, attention, and consistency may reduce — learning becomes more sensitive to how the task is presented.' },
        { icon: 'shield', title: 'Manage Demand', text: 'Maintain structure and avoid increasing demand too quickly.' }
      ]
    },
    '2:b2c2_overloaded': {
      title: 'Overwhelmed — Reduce Demand',
      pillars: [
        { icon: 'shield', title: 'Not Learning Now', text: 'In an overloaded state, learning is not accessible — the focus is on coping, not progressing.' },
        { icon: 'response', title: 'Overload, Not Refusal', text: 'Withdrawal or resistance reflects overload, not refusal or lack of ability.' },
        { icon: 'focus', title: 'Prioritise Regulation', text: 'Reduce expectations and prioritise regulation before returning to the task.' }
      ]
    },

    // MODULE 2 — Block 3
    '2:b3c1': {
      title: 'Many Influences Interact',
      pillars: [
        { icon: 'movement', title: 'Constantly Shifting', text: 'Emotional state can shift throughout a session as different influences interact.' },
        { icon: 'balance', title: 'Beyond the Task', text: 'What the swimmer experiences is shaped by the task, the environment, the water, and their internal state.' },
        { icon: 'focus', title: 'Scan Broadly', text: 'Scan environment, water conditions, and what the swimmer may be carrying internally.' }
      ]
    },
    '2:b3c2': {
      title: 'Three Types of Influence',
      pillars: [
        { icon: 'balance', title: 'Always Interacting', text: 'Environmental, water-based, and internal influences constantly interact during the session.' },
        { icon: 'movement', title: 'Small Changes Matter', text: 'Small changes in one area can affect how the swimmer feels and responds.' },
        { icon: 'focus', title: 'Understand, Don\'t React', text: 'Understanding these categories helps you move from reacting to behaviour to understanding it.' }
      ]
    },
    '2:b3c2_env': {
      title: 'The Environment Matters',
      pillars: [
        { icon: 'balance', title: 'Noise and Space', text: 'Noise, space, movement, and the presence of others can support engagement or increase demand.' },
        { icon: 'focus', title: 'Predictability', text: 'Predictability of the environment matters — adjust positioning and structure where possible.' },
        { icon: 'shield', title: 'Reduce Demand', text: 'When the environment increases demand, simplify tasks or reduce sensory input.' }
      ]
    },
    '2:b3c2_water': {
      title: 'Water Shapes How We Feel',
      pillars: [
        { icon: 'movement', title: 'Depth and Movement', text: 'Changes in depth, movement, and temperature directly affect comfort, control, and confidence.' },
        { icon: 'response', title: 'Strong Sensory Input', text: 'Water provides strong sensory input that often shapes the experience more than the task itself.' },
        { icon: 'focus', title: 'Adjust in the Water', text: 'Adjust depth, positioning, or support in the water when the swimmer\'s state shifts.' }
      ]
    },
    '2:b3c2_internal': {
      title: 'What Swimmers Bring In',
      pillars: [
        { icon: 'balance', title: 'Fatigue and Anxiety', text: 'Fatigue, anxiety, and sensory processing differences affect response even when conditions stay the same.' },
        { icon: 'focus', title: 'Not Always Visible', text: 'Internal state is not always visible. Observe subtle changes in behaviour and energy.' },
        { icon: 'connect', title: 'Interpret Accurately', text: 'Recognising internal factors helps you interpret behaviour more accurately.' }
      ]
    },

    // MODULE 3
    '3:b1c1': { title: 'More Than Being Present', pillars: [
      { icon: 'connect', title: 'True Engagement', text: 'Engagement means the swimmer is connected, responsive, and available, not just physically present.' },
      { icon: 'focus', title: 'Looks Different', text: 'Some swimmers engage visibly; others observe or respond gradually. Both can show readiness.' },
      { icon: 'balance', title: 'Not Compliance', text: 'Following instructions is not the same as engagement.' }
    ]},
    '3:b1c2': { title: 'Engagement Can Be Subtle', pillars: [
      { icon: 'focus', title: 'Small Signs Count', text: 'Engagement may appear through looking, orienting, copying, waiting, or returning after a pause.' },
      { icon: 'connect', title: 'Patterns Over Performance', text: 'Look for patterns of connection rather than relying on obvious participation.' },
      { icon: 'balance', title: 'Context Matters', text: 'The same behaviour can mean different things in different contexts.' }
    ]},
    '3:b1c3': { title: 'Connect Before You Teach', pillars: [
      { icon: 'shield', title: 'Limited Impact', text: 'Teaching has limited impact when the swimmer is not engaged or available.' },
      { icon: 'balance', title: 'Pressure Over Learning', text: 'When engagement is low, more instruction often increases pressure instead of improving learning.' },
      { icon: 'connect', title: 'Reconnect First', text: 'Pause, reduce pressure, and rebuild engagement before continuing.' }
    ]},
    '3:b2c1': { title: 'Connection Sustains Engagement', pillars: [
      { icon: 'connect', title: 'Person, Not Just Task', text: 'Swimmers respond to the person delivering the task, not just the task itself.' },
      { icon: 'balance', title: 'Willingness to Participate', text: 'Strong connection increases willingness to participate and supports confidence.' },
      { icon: 'shield', title: 'Stay Available', text: 'Connection helps the swimmer stay available when the task becomes more challenging.' }
    ]},
    '3:b2c2': { title: 'Trust Through Consistency', pillars: [
      { icon: 'connect', title: 'Built Over Time', text: 'Trust develops through consistent, predictable, and respectful interaction.' },
      { icon: 'balance', title: 'Safety and Understanding', text: 'When swimmers feel safe and understood, they engage and remain connected.' },
      { icon: 'focus', title: 'Keep It Predictable', text: 'Keep interaction calm, consistent, and predictable to strengthen trust.' }
    ]},
    '3:b2c3': { title: 'Your Behaviour Shapes the Session', pillars: [
      { icon: 'connect', title: 'Tone and Body Language', text: 'Tone, body language, pacing, and clarity shape how the swimmer experiences the session.' },
      { icon: 'balance', title: 'Calm Supports Connection', text: 'Calm, clear, and predictable behaviour supports connection.' },
      { icon: 'shield', title: 'Rushed Behaviour Reduces It', text: 'Rushed or inconsistent behaviour may reduce connection.' }
    ]},
    '3:b2c4': { title: 'Connection Needs Protection', pillars: [
      { icon: 'connect', title: 'It Can Fluctuate', text: 'Connection can change when the swimmer becomes uncertain, pressured, or disengaged.' },
      { icon: 'balance', title: 'Adjust Early', text: 'Slow down or simplify the task to maintain the relationship.' },
      { icon: 'focus', title: 'Familiarity Helps', text: 'Returning to familiar actions can help reconnection.' }
    ]},
    '3:b3c1': { title: 'Engagement Shifts Over Time', pillars: [
      { icon: 'movement', title: 'Dynamic, Not Fixed', text: 'Engagement changes with fatigue, confidence, sensory input, and task demand.' },
      { icon: 'balance', title: 'Not Refusal', text: 'Changes reflect how the swimmer is experiencing the session, not defiance.' },
      { icon: 'focus', title: 'Notice Early', text: 'Notice early changes and adjust before disengagement increases.' }
    ]},
    '3:b3c2': { title: 'Active Decisions Required', pillars: [
      { icon: 'balance', title: 'Pace and Structure', text: 'Maintaining engagement requires active decisions around pacing and structure.' },
      { icon: 'shield', title: 'Too Much or Too Little', text: 'Tasks that are too repetitive, complex, or demanding can reduce engagement.' },
      { icon: 'connect', title: 'Well-Paced Sessions', text: 'A well-paced session helps sustain connection throughout.' }
    ]},
    '3:b3c3': { title: 'Different Ways to Connect', pillars: [
      { icon: 'connect', title: 'Many Approaches', text: 'Engagement approaches are different methods to create, support, or restore connection.' },
      { icon: 'balance', title: 'No One Size Fits All', text: 'No single approach works for every swimmer.' },
      { icon: 'focus', title: 'Observe and Choose', text: 'Choose the approach that best supports connection in that moment.' }
    ]},
    '3:b3c3_mod': { title: 'Show Before You Ask', pillars: [
      { icon: 'focus', title: 'Demonstrate Clearly', text: 'Demonstrate an action clearly so the swimmer can observe before responding.' },
      { icon: 'balance', title: 'Less Verbal Demand', text: 'Demonstrating reduces verbal demand and supports visual learners.' },
      { icon: 'connect', title: 'Processing Time', text: 'Allow processing time after demonstrating before expecting an attempt.' }
    ]},
    '3:b3c3_turn': { title: 'Structured Interaction', pillars: [
      { icon: 'connect', title: 'Shared Pattern', text: 'Turn taking creates a structured pattern where swimmer and instructor alternate.' },
      { icon: 'balance', title: 'Predictability', text: 'Predictable back-and-forth patterns support participation.' },
      { icon: 'movement', title: 'Build Participation', text: 'Use simple turn-taking when direct instruction is not landing.' }
    ]},
    '3:b3c3_guide': { title: 'Explore With Support', pillars: [
      { icon: 'movement', title: 'Guided Exploration', text: 'Allow the swimmer to explore with support rather than being fully directed.' },
      { icon: 'connect', title: 'Active Participation', text: 'Exploration supports active participation and understanding.' },
      { icon: 'balance', title: 'Appropriate Challenge', text: 'Allow space to try while guiding gently.' }
    ]},
    '3:b3c3_intensive': { title: 'Join Their Rhythm', pillars: [
      { icon: 'connect', title: 'Connection First', text: 'Join the swimmer\'s communication or behaviour pattern to build connection.' },
      { icon: 'balance', title: 'Follow the Swimmer', text: 'Follow their rhythm before introducing structure.' },
      { icon: 'focus', title: 'Shared Attention', text: 'Joining their pattern supports shared attention and reduces pressure.' }
    ]},
    '3:b3c3_play': { title: 'Purposeful Play', pillars: [
      { icon: 'connect', title: 'Shared Enjoyment', text: 'Use enjoyment and shared activity to support engagement.' },
      { icon: 'balance', title: 'Reduces Pressure', text: 'Play reduces pressure and increases motivation.' },
      { icon: 'focus', title: 'Linked to Learning', text: 'Use purposeful play with a learning goal, not random activity.' }
    ]},
    '3:b3c4': { title: 'Disengagement Is a Signal', pillars: [
      { icon: 'shield', title: 'Something Needs to Change', text: 'Disengagement often reflects overload, confusion, or lost connection.' },
      { icon: 'balance', title: 'Pause and Interpret', text: 'Pause, interpret what is happening, and adjust before continuing.' },
      { icon: 'connect', title: 'Reconnect First', text: 'Reconnect and reduce demand before progressing the task.' }
    ]},

    // MODULE 4 - foundations
    '4:b1c1': { title: 'Beyond Skill Completion', pillars: [
      { icon: 'focus', title: 'Experience in Water', text: 'The programme supports how swimmers experience, respond, and function in water.' },
      { icon: 'balance', title: 'Guide Development', text: 'Your role is to guide development, not just deliver outcomes.' },
      { icon: 'movement', title: 'Function Over Technique', text: 'The goal is functional independence in water. Skills are tools, not the final outcome.' }
    ]},
    '4:b1c2': { title: 'Values Shape Every Session', pillars: [
      { icon: 'connect', title: 'Individual Pathways', text: 'Every swimmer follows an individual pathway.' },
      { icon: 'shield', title: 'Safety Before Progression', text: 'Safety and regulation come before progression.' },
      { icon: 'balance', title: 'Inclusive Learning', text: 'Learning must remain accessible and inclusive for every swimmer.' }
    ]},
    '4:b1c3': { title: 'Principles, Not Fixed Steps', pillars: [
      { icon: 'balance', title: 'Individual Progress', text: 'Progress is individual. Confidence comes before technique.' },
      { icon: 'movement', title: 'Simple to Complex', text: 'Simple builds into complex. Structure supports learning.' },
      { icon: 'focus', title: 'Guide Decisions', text: 'Use principles to guide decisions, not follow a fixed sequence.' }
    ]},
    '4:b2core1': { title: 'Regulation Guides Challenge', pillars: [
      { icon: 'balance', title: 'Calm and Available', text: 'Regulation is how calm, safe, and emotionally available the swimmer feels in water.' },
      { icon: 'response', title: 'It Changes', text: 'Regulation changes with environment, sensory load, and task demand.' },
      { icon: 'focus', title: 'When to Challenge', text: 'Use regulation to decide when to increase challenge and when to slow down or repeat.' }
    ]},
    '4:b2core2': { title: 'Track Support Needed', pillars: [
      { icon: 'movement', title: 'Support for Safety', text: 'Independence is how much support the swimmer needs for position, movement, and safety.' },
      { icon: 'balance', title: 'Small Steps', text: 'Independence can grow in small steps. Observe over time, not only in one session.' },
      { icon: 'focus', title: 'Progress or Consolidate', text: 'Use independence alongside regulation to decide when to progress or consolidate.' }
    ]},
    '4:b2core3': { title: 'Match Teaching to Capacity', pillars: [
      { icon: 'connect', title: 'Participation and Focus', text: 'Learning and engagement is how the swimmer participates, attends, and responds to teaching.' },
      { icon: 'balance', title: 'Not Just Compliance', text: 'Observe participation and attention, not only compliance.' },
      { icon: 'focus', title: 'Adjust Pace and Demand', text: 'Use it to adjust pace, demand, and how you present the next activity.' }
    ]},
    '4:b2c1': { title: 'Stage 1: Swim Confidence', pillars: [
      { icon: 'connect', title: 'Emotional Readiness', text: 'Focus on emotional readiness and sensory experience before technique.' },
      { icon: 'shield', title: 'Build Safety First', text: 'Build emotional safety before introducing challenge.' },
      { icon: 'balance', title: 'Goal', text: 'Swimmers feel safe, remain regulated, and are willing to engage in water.' }
    ]},
    '4:b2c2': { title: 'Stage 2: Swim Basic', pillars: [
      { icon: 'movement', title: 'Fundamental Skills', text: 'Develop core movement skills: floating, balance, streamlining, rotation, and first propulsion.' },
      { icon: 'balance', title: 'Control Before Complexity', text: 'Build control before adding complexity. Reduce support step by step.' },
      { icon: 'shield', title: 'Goal', text: 'Safe and confident movement with growing control.' }
    ]},
    '4:b2c3': { title: 'Stage 3: Swim Structured', pillars: [
      { icon: 'movement', title: 'Stroke Refinement', text: 'Refine the four strokes with better rhythm, timing, and control.' },
      { icon: 'balance', title: 'Endurance With Safety', text: 'Develop distance and endurance with safe, consistent technique.' },
      { icon: 'shield', title: 'Goal', text: 'Structured, sustained swimming with consistency and safety.' }
    ]},
    '4:b3c1': { title: 'Progress Is Not Linear', pillars: [
      { icon: 'movement', title: 'Non-Linear Paths', text: 'Swimmers do not always move through levels in a straight line.' },
      { icon: 'balance', title: 'Consolidation Matters', text: 'Periods of consolidation and revisiting earlier levels are normal and valuable.' },
      { icon: 'focus', title: 'Individual Timing', text: 'Progress depends on regulation, engagement, and individual readiness, not just skill performance.' }
    ]},
    '4:b3c2': { title: 'Different Access Routes', pillars: [
      { icon: 'balance', title: 'Many Pathways', text: 'Swimmers may access the same skill through physical, motor planning, or cognitive routes.' },
      { icon: 'focus', title: 'Understand the Route', text: 'Understanding how a swimmer accesses a skill helps you teach more effectively.' },
      { icon: 'connect', title: 'Adapt Teaching', text: 'Adapt your approach to match how the swimmer processes and performs the skill.' }
    ]},
    '4:b3c2_physical': { title: 'Physical Access', pillars: [
      { icon: 'movement', title: 'Body-Based Route', text: 'Some swimmers access skills primarily through physical strength, coordination, and body control.' },
      { icon: 'balance', title: 'Support Movement Quality', text: 'Focus on movement quality, body position, and physical readiness.' },
      { icon: 'focus', title: 'Build From the Body', text: 'Break skills into physical components the swimmer can feel and control.' }
    ]},
    '4:b3c2_motor': { title: 'Motor Planning Access', pillars: [
      { icon: 'movement', title: 'Sequencing Skills', text: 'Some swimmers need extra support to plan and sequence movements.' },
      { icon: 'balance', title: 'Clear Steps', text: 'Break tasks into clear, visible steps with repetition and predictability.' },
      { icon: 'focus', title: 'Reduce Cognitive Load', text: 'Reduce simultaneous demands so the swimmer can focus on one movement at a time.' }
    ]},
    '4:b3c2_cognitive': { title: 'Cognitive Access', pillars: [
      { icon: 'focus', title: 'Understanding First', text: 'Some swimmers need to understand what is expected before they can perform a skill.' },
      { icon: 'connect', title: 'Visual and Clear Language', text: 'Use visuals, clear language, and structured explanations to support understanding.' },
      { icon: 'balance', title: 'Check Comprehension', text: 'Confirm the swimmer understands before expecting performance.' }
    ]},
    '4:b3c3': { title: 'Review With the Framework', pillars: [
      { icon: 'focus', title: 'Structured Review', text: 'Use the framework to review progress systematically, not just by skill checklist.' },
      { icon: 'balance', title: 'Regulation and Engagement', text: 'Consider regulation, independence, and engagement alongside skill performance.' },
      { icon: 'movement', title: 'Inform Next Steps', text: 'Review findings should inform what to consolidate, repeat, or progress next.' }
    ]},
    '4:b3c3_step1': { title: 'Step 1: Observe', pillars: [
      { icon: 'focus', title: 'What Do You See?', text: 'Observe the swimmer\'s regulation, independence, and engagement during the session.' },
      { icon: 'balance', title: 'Beyond the Skill', text: 'Look beyond whether the skill was performed. Notice how it was accessed.' },
      { icon: 'connect', title: 'Note Patterns', text: 'Note patterns over time rather than judging from a single attempt.' }
    ]},
    '4:b3c3_step2': { title: 'Step 2: Interpret', pillars: [
      { icon: 'balance', title: 'What Does It Mean?', text: 'Interpret what you observed in the context of the swimmer\'s level and pathway.' },
      { icon: 'focus', title: 'Connect to Framework', text: 'Connect observations to regulation, independence, and engagement indicators.' },
      { icon: 'movement', title: 'Identify Barriers', text: 'Identify what is supporting progress and what may be limiting it.' }
    ]},
    '4:b3c3_step3': { title: 'Step 3: Decide', pillars: [
      { icon: 'focus', title: 'Next Action', text: 'Decide whether to consolidate, repeat, adapt, or progress based on your review.' },
      { icon: 'balance', title: 'Individual Decision', text: 'The decision should reflect the individual swimmer, not a fixed timeline.' },
      { icon: 'shield', title: 'Prioritise Readiness', text: 'Prioritise readiness and function over moving to the next level quickly.' }
    ]},

    // MODULE 4 - Swim Confidence levels (Stage 1)
    '4:b2l1': { title: 'Early Sensory Exploration', pillars: [
      { icon: 'shield', title: 'Calm First Contact', text: 'The programme\'s first formal water experience: regulation, trust, and fully supported exploration.' },
      { icon: 'balance', title: 'Safety Before Skill', text: 'Sessions prioritise predictable safety rhythms before any performance demand.' },
      { icon: 'focus', title: 'What to Review', text: 'Four focus areas and matching activities show what to observe and apply at this level.' }
    ]},
    '4:b2l1_overview': { title: 'Safety, Regulation, and Trust', pillars: [
      { icon: 'shield', title: 'Positive Associations', text: 'Build safety, regulation, and positive associations with water before skill demands.' },
      { icon: 'connect', title: 'Supported First Contact', text: 'Swimmers experience first pool contact in a supported way, feeling calm and secure.' },
      { icon: 'focus', title: 'Four Focus Areas', text: 'Familiarisation, adaptation, breathing control, and water safety guide Level 1 sessions.' }
    ]},
    '4:b2l1_focus': { title: 'What to Look For at Level 1', pillars: [
      { icon: 'focus', title: 'Development Points', text: 'Each focus area highlights what you should recognise during sessions at this level.' },
      { icon: 'balance', title: 'Comfort and Adaptation', text: 'Observe comfort with water contact and supported movement in different positions.' },
      { icon: 'shield', title: 'Breathing and Safety', text: 'Track breathing awareness at the surface and early understanding of safe pool areas.' }
    ]},
    '4:b2l1_f1': { title: 'Initial Comfort With Water', pillars: [
      { icon: 'connect', title: 'Touch and Feel', text: 'Touching and feeling water with full instructor support.' },
      { icon: 'balance', title: 'Accept Contact', text: 'Accepting water on hands, arms, and legs at the swimmer\'s pace.' },
      { icon: 'focus', title: 'Gradual Exposure', text: 'Gradual exposure to new sensations without rushing contact.' }
    ]},
    '4:b2l1_f2': { title: 'Supported Movement', pillars: [
      { icon: 'movement', title: 'Floating With Support', text: 'Supported floating and positioning with full instructor contact.' },
      { icon: 'balance', title: 'Gentle Exploration', text: 'Gentle movement through water while the body is fully supported.' },
      { icon: 'focus', title: 'Body Awareness', text: 'Exploring changes in body position to build early water awareness.' }
    ]},
    '4:b2l1_f3': { title: 'Breathing Near the Face', pillars: [
      { icon: 'response', title: 'Surface Awareness', text: 'Awareness of breathing at the surface before any submersion.' },
      { icon: 'balance', title: 'Low-Intensity Exposure', text: 'Water near cheeks and chin; splash tolerance at low intensity.' },
      { icon: 'focus', title: 'Optional Bubbles', text: 'Early introduction to bubbles when the swimmer shows readiness.' }
    ]},
    '4:b2l1_f4': { title: 'Early Safety Awareness', pillars: [
      { icon: 'shield', title: 'Stay Close to Support', text: 'Swimmers stay close to instructor or physical support at all times.' },
      { icon: 'focus', title: 'Know the Edge', text: 'Recognising the pool edge and calm positioning near it.' },
      { icon: 'balance', title: 'Safe Zones', text: 'Early understanding of which areas of the pool are safe.' }
    ]},
    '4:b2l1_activities': { title: 'Level 1 in Practice', pillars: [
      { icon: 'movement', title: 'Supported Entry and Exit', text: 'Calm positioning near the wall with gentle movement in different positions.' },
      { icon: 'balance', title: 'Short and Predictable', text: 'Use short, predictable activities and increase challenge only when the swimmer is ready.' },
      { icon: 'connect', title: 'Face Exposure When Ready', text: 'Bubble play and gentle face exposure only when regulation and trust are in place.' }
    ]},

    '4:b2l2': { title: 'Growing Confidence', pillars: [
      { icon: 'connect', title: 'Stretch Tolerance', text: 'Level 2 stretches tolerance for tasks and time in the water while keeping predictable support.' },
      { icon: 'movement', title: 'More Willing Repetition', text: 'Swimmers repeat actions more willingly and join short sequences with lighter prompting.' },
      { icon: 'focus', title: 'Four Focus Areas', text: 'Familiarisation, adaptation, breathing, and safety all advance from Level 1 foundations.' }
    ]},
    '4:b2l2_overview': { title: 'Confidence Through Repetition', pillars: [
      { icon: 'connect', title: 'Build on Level 1', text: 'Grow confidence, movement, and independence from the safety base established at Level 1.' },
      { icon: 'movement', title: 'Longer Engagement', text: 'Swimmers spend longer in and around the pool with more variety in supported movement.' },
      { icon: 'balance', title: 'Four Focus Areas', text: 'Each area advances familiarisation, adaptation, breathing control, and water safety.' }
    ]},
    '4:b2l2_focus': { title: 'What to Look For at Level 2', pillars: [
      { icon: 'focus', title: 'Growing Comfort', text: 'Observe longer, more relaxed time in water and growing predictability.' },
      { icon: 'movement', title: 'Varied Movement', text: 'Supported movement with increasing variety, stability, and early streamlining.' },
      { icon: 'shield', title: 'Independent Edge Use', text: 'Bubble play, short face immersions, and safer use of shallow areas and pool edges.' }
    ]},
    '4:b2l2_f1': { title: 'Relaxed Time in Water', pillars: [
      { icon: 'connect', title: 'Familiar Routines', text: 'Longer periods in the water with familiar, predictable routines.' },
      { icon: 'balance', title: 'Relaxed Engagement', text: 'More relaxed engagement with the pool environment.' },
      { icon: 'focus', title: 'Growing Predictability', text: 'Comfort and predictability increase session by session.' }
    ]},
    '4:b2l2_f2': { title: 'Varied Supported Movement', pillars: [
      { icon: 'movement', title: 'Different Positions', text: 'Varied supported movement in different body positions.' },
      { icon: 'balance', title: 'Early Streamlining', text: 'Early streamlining and rotation when the swimmer is ready.' },
      { icon: 'focus', title: 'Increasing Stability', text: 'Growing stability and control in the water.' }
    ]},
    '4:b2l2_f3': { title: 'Breath Control Progression', pillars: [
      { icon: 'response', title: 'Bubble Play', text: 'Bubble play and controlled exhalation at the surface.' },
      { icon: 'balance', title: 'Short Immersions', text: 'Short face immersions when the swimmer shows readiness.' },
      { icon: 'focus', title: 'Build Confidence', text: 'Building confidence with breath control step by step.' }
    ]},
    '4:b2l2_f4': { title: 'Safe Zones and Edges', pillars: [
      { icon: 'shield', title: 'Shallow Water Safety', text: 'Understanding safe zones in shallow water.' },
      { icon: 'movement', title: 'Use the Wall', text: 'Using pool edges more independently with growing confidence.' },
      { icon: 'focus', title: 'Boundaries and Support', text: 'Awareness of boundaries and when to return to support.' }
    ]},
    '4:b2l2_activities': { title: 'Level 2 in Practice', pillars: [
      { icon: 'movement', title: 'Longer Sessions', text: 'Longer periods in water with varied supported positions and familiar routines.' },
      { icon: 'balance', title: 'Breath and Rotation', text: 'Bubble play, short face immersions, and early streamlining when ready.' },
      { icon: 'shield', title: 'Shallow Area Independence', text: 'Safe use of shallow area and pool edges with lighter prompting.' }
    ]},

    // MODULE 4 - Swim Basic levels (Stage 2)
    '4:b2l3': { title: 'Fundamental Skills', pillars: [
      { icon: 'movement', title: 'Core Movement Skills', text: 'Controlled floating, streamlining, simple rotation, and first propulsive actions.' },
      { icon: 'balance', title: 'Confidence Meets Skill', text: 'Work balances confidence play with clearer links to movement skills and recovery.' },
      { icon: 'focus', title: 'Shared Control', text: 'Swimmers begin to share control of position and movement with the instructor.' }
    ]},
    '4:b2l3_overview': { title: 'Core Skills for Safe Swimming', pillars: [
      { icon: 'movement', title: 'Foundation Skills', text: 'Floating, balance, streamlining, rotation, and first propulsions support safe, supported swimming.' },
      { icon: 'balance', title: 'Shared Control', text: 'Swimmers begin to share control of position and movement with the instructor.' },
      { icon: 'shield', title: 'Recovery Priority', text: 'Water safety at this level links fundamentals to safer movement and recovery.' }
    ]},
    '4:b2l3_focus': { title: 'What to Look For at Level 3', pillars: [
      { icon: 'balance', title: 'Stable Positions', text: 'Floating in prone and supine with support as needed.' },
      { icon: 'movement', title: 'Body Shapes', text: 'Long body shapes, streamlining, and simple rotations.' },
      { icon: 'shield', title: 'First Propulsion', text: 'Functional kicks and arm actions that move the swimmer safely.' }
    ]},
    '4:b2l3_f1': { title: 'Floating and Balance', pillars: [
      { icon: 'balance', title: 'Prone and Supine', text: 'Stable positions in prone and supine with support as needed.' },
      { icon: 'focus', title: 'Body Awareness', text: 'Building body awareness and control in stable shapes.' },
      { icon: 'movement', title: 'Support as Needed', text: 'Adjust support level based on the swimmer\'s regulation and control.' }
    ]},
    '4:b2l3_f2': { title: 'Streamlining and Rotation', pillars: [
      { icon: 'movement', title: 'Long Body Shapes', text: 'Early experience of long body shapes and streamlining.' },
      { icon: 'balance', title: 'Simple Rotations', text: 'Simple rotations in the water with clear instructor cues.' },
      { icon: 'focus', title: 'Body Orientation', text: 'Developing body position and orientation awareness.' }
    ]},
    '4:b2l3_f3': { title: 'First Propulsion', pillars: [
      { icon: 'movement', title: 'Functional Actions', text: 'First functional kicks and arm actions that move the swimmer.' },
      { icon: 'balance', title: 'Link to Movement', text: 'Linking arm and leg actions to actual movement through water.' },
      { icon: 'focus', title: 'Control Before Speed', text: 'Prioritise controlled actions before increasing effort or distance.' }
    ]},
    '4:b2l3_f4': { title: 'Safety Through Fundamentals', pillars: [
      { icon: 'shield', title: 'Safer Movement', text: 'Using floating and position skills to support safer movement.' },
      { icon: 'balance', title: 'Recovery to Wall', text: 'Clear, repeatable recovery to the wall so swimmers feel in control.' },
      { icon: 'focus', title: 'Apply Fundamentals', text: 'Connect core skills to safer movement and recovery in the pool.' }
    ]},
    '4:b2l3_activities': { title: 'Level 3 in Practice', pillars: [
      { icon: 'balance', title: 'Supported Floating', text: 'Floating in prone and supine with support as needed.' },
      { icon: 'movement', title: 'Shape and Rotate', text: 'Streamlining, simple rotations, and first kick or arm actions.' },
      { icon: 'shield', title: 'Recovery Practice', text: 'Keep recovery to the wall clear and repeatable for safety and control.' }
    ]},

    '4:b2l4': { title: 'Building Control', pillars: [
      { icon: 'movement', title: 'Consistent Control', text: 'Develop consistent control and coordination with increasing independence.' },
      { icon: 'balance', title: 'Sustain Movement', text: 'Swimmers begin to sustain movement and act with less prompting.' },
      { icon: 'shield', title: 'Structured Safety', text: 'Focus areas cover floating, streamlining, propulsion, and swim-float-swim sequences.' }
    ]},
    '4:b2l4_overview': { title: 'Control and Coordination', pillars: [
      { icon: 'movement', title: 'Sustained Movement', text: 'Swimmers sustain movement and act with increasing independence.' },
      { icon: 'balance', title: 'Four Focus Areas', text: 'Floating, streamlining, propulsion, and structured water-safety sequences.' },
      { icon: 'shield', title: 'Swim-Float-Swim', text: 'Safety work includes calm recovery and returns with growing independence.' }
    ]},
    '4:b2l4_focus': { title: 'What to Look For at Level 4', pillars: [
      { icon: 'balance', title: 'Independent Floats', text: 'Holding float positions with more independence and smooth transitions.' },
      { icon: 'movement', title: 'Longer Glides', text: 'Clearer streamline and alignment held over longer movement.' },
      { icon: 'shield', title: 'Directed Propulsion', text: 'Efficient propulsion with consistent breathing and directional control.' }
    ]},
    '4:b2l4_f1': { title: 'Independent Floating', pillars: [
      { icon: 'balance', title: 'Hold Positions', text: 'Holding float positions with more independence.' },
      { icon: 'movement', title: 'Smooth Transitions', text: 'Moving smoothly between float positions.' },
      { icon: 'focus', title: 'Balance Under Challenge', text: 'Maintaining balance during progressively challenging tasks.' }
    ]},
    '4:b2l4_f2': { title: 'Streamlining Progression', pillars: [
      { icon: 'movement', title: 'Improved Glide', text: 'Gliding with a clearer, longer streamline shape.' },
      { icon: 'balance', title: 'Hold Alignment', text: 'Maintaining alignment during longer movement.' },
      { icon: 'focus', title: 'Without Support', text: 'Holding streamline without instructor support when ready.' }
    ]},
    '4:b2l4_f3': { title: 'Efficient Propulsion', pillars: [
      { icon: 'movement', title: 'Convert Effort', text: 'Refining propulsion so effort converts into direction.' },
      { icon: 'response', title: 'Breathing Coordination', text: 'Coordinating breathing consistently with movement.' },
      { icon: 'focus', title: 'Directional Control', text: 'Demonstrating clear directional control in the water.' }
    ]},
    '4:b2l4_f4': { title: 'Swim-Float-Swim Safety', pillars: [
      { icon: 'shield', title: 'Structured Sequence', text: 'Performing swim-float-swim with support, building toward independence.' },
      { icon: 'balance', title: 'Calm Recovery', text: 'Maintaining calm recovery throughout the sequence.' },
      { icon: 'movement', title: 'Independent Returns', text: 'Returning to safety with increasing independence.' }
    ]},
    '4:b2l4_activities': { title: 'Level 4 in Practice', pillars: [
      { icon: 'movement', title: 'Independent Glide', text: 'Minimal support to build stability and streamline quality.' },
      { icon: 'balance', title: 'Controlled Rotation', text: 'Smoother rotational transitions within movement sequences.' },
      { icon: 'shield', title: 'Swim-Float-Swim', text: 'Structured recovery practice within continuous movement.' }
    ]},

    // MODULE 4 - Swim Structured levels (Stage 3)
    '4:b2l5': { title: 'Technique and Independence', pillars: [
      { icon: 'movement', title: 'Refine Movement', text: 'Focus on technique and sustained independence across sessions.' },
      { icon: 'balance', title: 'Apply Consistently', text: 'Swimmers refine movement and apply skills with growing consistency.' },
      { icon: 'shield', title: 'Safety Integrated', text: 'Work links stroke quality, wall skills, and integrated water safety.' }
    ]},
    '4:b2l5_overview': { title: 'Technique With Independence', pillars: [
      { icon: 'movement', title: 'Refined Movement', text: 'Swimmers refine movement and apply skills consistently across sessions.' },
      { icon: 'balance', title: 'Four Focus Areas', text: 'Streamline and rotation, stroke quality, starts and turns, and integrated safety.' },
      { icon: 'shield', title: 'Standards Stay Linked', text: 'Technique and safety stay connected as session volume increases.' }
    ]},
    '4:b2l5_focus': { title: 'What to Look For at Level 5', pillars: [
      { icon: 'movement', title: 'Linked Sequences', text: 'Streamline held through linked work; rotation controlled without constant prompting.' },
      { icon: 'balance', title: 'Stroke Quality', text: 'Refined stroke patterns maintained when effort rises.' },
      { icon: 'shield', title: 'Wall Work and Safety', text: 'Controlled starts, turns, push-offs, and independent safety decisions.' }
    ]},
    '4:b2l5_f1': { title: 'Streamline Through Sequences', pillars: [
      { icon: 'movement', title: 'Hold Streamline', text: 'Maintaining streamline during linked movement sequences.' },
      { icon: 'balance', title: 'Control Rotation', text: 'Controlling rotation within movement without constant prompting.' },
      { icon: 'focus', title: 'Independent Adjustments', text: 'Adjusting body position independently during activity.' }
    ]},
    '4:b2l5_f2': { title: 'Stroke Quality', pillars: [
      { icon: 'movement', title: 'Refined Patterns', text: 'Demonstrating refined stroke patterns with clear technique.' },
      { icon: 'balance', title: 'Under Fatigue', text: 'Maintaining technique when effort and distance increase.' },
      { icon: 'focus', title: 'Appropriate Choice', text: 'Applying stroke choice appropriately to the task.' }
    ]},
    '4:b2l5_f3': { title: 'Starts, Turns, and Push-Off', pillars: [
      { icon: 'movement', title: 'Controlled Starts', text: 'Performing controlled, aligned starts.' },
      { icon: 'balance', title: 'Turn Sequences', text: 'Executing turn sequences with consistent technique.' },
      { icon: 'shield', title: 'Strong Push-Off', text: 'Pushing off with strong alignment and streamline.' }
    ]},
    '4:b2l5_f4': { title: 'Integrated Water Safety', pillars: [
      { icon: 'shield', title: 'Independent Decisions', text: 'Applying safety decisions independently during activity.' },
      { icon: 'focus', title: 'Environmental Awareness', text: 'Demonstrating awareness of the pool environment and others.' },
      { icon: 'balance', title: 'Safety During Activity', text: 'Maintaining safe behaviour while swimming, turning, and moving.' }
    ]},
    '4:b2l5_activities': { title: 'Level 5 in Practice', pillars: [
      { icon: 'movement', title: 'Stroke Development', text: 'Refining stroke technique with explicit standards.' },
      { icon: 'balance', title: 'Turn and Push-Off', text: 'Structured turn practice and push-off drills linked to streamline.' },
      { icon: 'shield', title: 'Applied Swimming', text: 'Combining skills in continuous swimming with safety standards maintained.' }
    ]},

    '4:b2l6': { title: 'Efficiency and Fluency', pillars: [
      { icon: 'movement', title: 'Consistent Over Distance', text: 'Skills performed with consistency and control over longer distances.' },
      { icon: 'balance', title: 'Rhythm and Control', text: 'Focus on efficient movement, rhythm, and full independence.' },
      { icon: 'focus', title: 'Increase With Stability', text: 'Extend length and density only when fluency and self-regulation stay stable.' }
    ]},
    '4:b2l6_overview': { title: 'Fluency Over Distance', pillars: [
      { icon: 'movement', title: 'Full Independence', text: 'Efficiency, fluency, and full independence shape longer, consistent swimming.' },
      { icon: 'balance', title: 'Four Focus Areas', text: 'Stroke refinement, timing and rhythm, endurance, and fluent wall work.' },
      { icon: 'shield', title: 'Regulation Check', text: 'Increase distance only when breathing recovery and self-regulation stay stable.' }
    ]},
    '4:b2l6_focus': { title: 'What to Look For at Level 6', pillars: [
      { icon: 'movement', title: 'Consistent Strokes', text: 'Stroke shape and line held while repeating quality work.' },
      { icon: 'balance', title: 'Rhythm and Pace', text: 'Steady tempo with effort adjusted without losing coordination.' },
      { icon: 'shield', title: 'Endurance With Recovery', text: 'Longer distances with efficient breathing recovery and regulation.' }
    ]},
    '4:b2l6_f1': { title: 'Stroke Refinement', pillars: [
      { icon: 'movement', title: 'Consistent Patterns', text: 'Demonstrating consistent stroke patterns over repeated work.' },
      { icon: 'balance', title: 'Efficient Coordination', text: 'Coordinating arms and legs efficiently.' },
      { icon: 'focus', title: 'Strong Alignment', text: 'Maintaining strong body alignment throughout.' }
    ]},
    '4:b2l6_f2': { title: 'Timing and Rhythm', pillars: [
      { icon: 'balance', title: 'Consistent Rhythm', text: 'Maintaining consistent rhythm across sets and distances.' },
      { icon: 'movement', title: 'Adjust Pace', text: 'Adjusting pace appropriately without losing coordination.' },
      { icon: 'focus', title: 'Under Demand', text: 'Sustaining coordination when task demand increases.' }
    ]},
    '4:b2l6_f3': { title: 'Distance and Endurance', pillars: [
      { icon: 'movement', title: 'Longer Distances', text: 'Sustaining swimming over progressively longer distances.' },
      { icon: 'balance', title: 'Regulated Effort', text: 'Maintaining effort without dysregulation or loss of technique.' },
      { icon: 'response', title: 'Breathing Recovery', text: 'Recovering breathing efficiently between efforts.' }
    ]},
    '4:b2l6_f4': { title: 'Fluent Wall Work', pillars: [
      { icon: 'movement', title: 'Efficient Starts', text: 'Performing efficient, aligned starts.' },
      { icon: 'balance', title: 'Flowing Turns', text: 'Executing turns with smooth flow into the next length.' },
      { icon: 'shield', title: 'Strong Push-Off', text: 'Pushing off with strong alignment linked to stroke rhythm.' }
    ]},
    '4:b2l6_activities': { title: 'Level 6 in Practice', pillars: [
      { icon: 'movement', title: 'Continuous Swimming', text: 'Sustaining swimming over longer distances with consistent technique.' },
      { icon: 'balance', title: 'Rhythm and Endurance', text: 'Rhythm practice and endurance sets that build stamina through repetition.' },
      { icon: 'shield', title: 'Advanced Turns', text: 'Refining turns and push-offs; increase length only when fluency stays stable.' }
    ]},

    // MODULE 5
    '5:b1c1': { title: 'Visuals When Words Fall Short', pillars: [
      { icon: 'focus', title: 'Stable Reference', text: 'In aquatic environments, a visual cue provides a stable reference when verbal instruction is limited.' },
      { icon: 'balance', title: 'Process More Easily', text: 'Swimmers often process images more easily than spoken instructions in the pool.' },
      { icon: 'connect', title: 'Show, Don\'t Only Tell', text: 'Visuals help swimmers understand what is expected. Show, not only tell.' }
    ]},
    '5:b1c2': { title: 'Structure Reduces Load', pillars: [
      { icon: 'balance', title: 'Many Demands at Once', text: 'Swimming requires processing body position, breathing, movement, balance, and the environment simultaneously.' },
      { icon: 'focus', title: 'Break Into Steps', text: 'Visual systems break tasks into smaller, manageable steps.' },
      { icon: 'movement', title: 'Focus on Doing', text: 'Structure lets swimmers focus on doing the activity, not decoding instructions.' }
    ]},
    '5:b1c3': { title: 'Visuals Boost Participation', pillars: [
      { icon: 'connect', title: 'Predictability', text: 'Swimmers engage more when they understand what is happening and what comes next.' },
      { icon: 'balance', title: 'Clear Progression', text: 'Visual progress builds motivation and reduces frustration.' },
      { icon: 'focus', title: 'Stay Engaged Longer', text: 'When swimmers can see the activity and outcome, they participate with more confidence.' }
    ]},
    '5:b2c1': { title: 'A Structured Visual System', pillars: [
      { icon: 'focus', title: 'Visible and Predictable', text: 'PixtoLearn makes information visible, structured, and predictable in the pool.' },
      { icon: 'balance', title: 'Supports Regulation', text: 'The system supports regulation and understanding, not just skill learning.' },
      { icon: 'connect', title: 'Use Actively', text: 'Use visuals actively throughout the session, not only at the start.' }
    ]},
    '5:b2c2': { title: 'Organised by Category', pillars: [
      { icon: 'focus', title: 'Structured Pathways', text: 'Folders organise skills and activities into clear, structured pathways.' },
      { icon: 'balance', title: 'Clear Progression', text: 'Categories support clear progression and focused session planning.' },
      { icon: 'movement', title: 'Purposeful Selection', text: 'Use folders to make purposeful, consistent decisions during sessions.' }
    ]},
    '5:b2c3': { title: 'Flashcards at the Core', pillars: [
      { icon: 'focus', title: 'Visual Representation', text: 'Flashcards provide visual representations of actions, skills, and communication.' },
      { icon: 'balance', title: 'Multiple Purposes', text: 'Different flashcards support instruction, communication, choice, regulation, and session flow.' },
      { icon: 'connect', title: 'Keep Accessible', text: 'Keep flashcards accessible throughout the session for immediate use.' }
    ]},
    '5:b3c1': { title: 'Predictable Session Flow', pillars: [
      { icon: 'balance', title: 'Reduce Anxiety', text: 'Visual schedules reduce anxiety by showing what will happen and in what order.' },
      { icon: 'connect', title: 'Support Transitions', text: 'Schedules support transitions between activities and help swimmers prepare for change.' },
      { icon: 'focus', title: 'Increase Independence', text: 'When swimmers can follow the schedule, they engage more independently.' }
    ]},
    '5:b3c2': { title: 'From Skills to Sequences', pillars: [
      { icon: 'movement', title: 'Beyond Isolated Skills', text: 'The PixtoLearn Sequence connects individual skills into structured progressions.' },
      { icon: 'balance', title: 'Clear Order', text: 'Sequences show the order of activities and how skills connect.' },
      { icon: 'focus', title: 'Guide the Session', text: 'Use sequences to guide session flow and help swimmers see the bigger picture.' }
    ]},
    '5:b3c3': { title: 'Plan With Purpose', pillars: [
      { icon: 'focus', title: 'Structured Sessions', text: 'PixtoLearn enables instructors to design structured and purposeful sessions.' },
      { icon: 'balance', title: 'Connect Skills and Visuals', text: 'Session plans connect skills, visuals, structure, and progression.' },
      { icon: 'connect', title: 'Adapt to the Swimmer', text: 'Structure should adapt to the swimmer, not the other way around.' }
    ]}
  };

  global.ConceptInsightContent = {
    get: function(moduleNum, conceptId){
      var key = String(moduleNum) + ':' + conceptId;
      return CURATED[key] || null;
    },
    has: function(moduleNum, conceptId){
      return !!this.get(moduleNum, conceptId);
    }
  };
})(typeof window !== 'undefined' ? window : this);
