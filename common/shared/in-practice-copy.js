(function () {
  'use strict';

  /**
   * In Practice — premium session cards for clubSENsational swimming.
   * Each entry: scene, notice, move, watch, next
   */
  var COPY = {
    b1c3: {
      scene: 'When challenge rises in the water, support must rise first — or stay available.',
      notice: 'Comfort and control tell you whether the next demand belongs yet.',
      move: 'Layer support before demand. Let comfort settle before you raise the challenge.',
      watch: 'Demand without support can look like "won't" when it is "can't yet".',
      next: 'Layer support, confirm calm, then raise one variable at a time.'
    },
    b1c4: {
      scene: 'In a clubSENsational swimming session, this shows up with the swimmer in the water — not only on the plan.',
      notice: 'Small shifts in breath, posture, eye contact, or willingness often appear before the bigger behaviour.',
      move: 'Build control first. Speed and effort follow when the body can hold it.',
      watch: 'If regulation or safety drops, simplify immediately. Progress can wait.',
      next: 'Protect the relationship first, then reintroduce one clear next step.'
    },
    b2c1: {
      scene: 'Safety is continuous in clubSENsational sessions — close, visible, and organised around the swimmer.',
      notice: 'Subtle position or response changes often precede obvious distress.',
      move: 'Scan continuously. Subtle shifts in position or response often precede obvious distress.',
      watch: 'Never wait for a clear emergency signal before you adjust proximity or support.',
      next: 'Reset space, positioning, and communication so prevention stays ahead of risk.'
    },
    b2c2: {
      scene: 'Safety is continuous in clubSENsational sessions — close, visible, and organised around the swimmer.',
      notice: 'Subtle position or response changes often precede obvious distress.',
      move: 'Calibrate supervision to the swimmer in front of you, not only to the activity on the plan.',
      watch: 'Never wait for a clear emergency signal before you adjust proximity or support.',
      next: 'Reset space, positioning, and communication so prevention stays ahead of risk.'
    },
    b2c3: {
      scene: 'Safety is continuous in clubSENsational sessions — close, visible, and organised around the swimmer.',
      notice: 'Subtle position or response changes often precede obvious distress.',
      move: 'Use clear structure, close proximity, and adapted communication to reduce preventable risk.',
      watch: 'Never wait for a clear emergency signal before you adjust proximity or support.',
      next: 'Reset space, positioning, and communication so prevention stays ahead of risk.'
    },
    b2c4: {
      scene: 'Safety is continuous in clubSENsational sessions — close, visible, and organised around the swimmer.',
      notice: 'Subtle position or response changes often precede obvious distress.',
      move: 'Prevention is proximity and positioning. Stay close, stay visible, organise the space.',
      watch: 'Never wait for a clear emergency signal before you adjust proximity or support.',
      next: 'Reset space, positioning, and communication so prevention stays ahead of risk.'
    },
    b3c1: {
      scene: 'Water changes how the body feels and organises — sensory load is part of every entry and drill.',
      notice: 'Watch for startle, withdrawal, gripping, or sudden stillness as sensory information, not defiance.',
      move: 'Let the body settle into the water before you add structure, instruction, or task demand.',
      watch: 'Adding instruction on top of sensory overwhelm rarely helps.',
      next: 'Allow settling time and adapt pace, space, and support before you add structure.'
    },
    b3c2: {
      scene: 'Water changes how the body feels and organises — sensory load is part of every entry and drill.',
      notice: 'Watch for startle, withdrawal, gripping, or sudden stillness as sensory information, not defiance.',
      move: 'Read sensory signals in the body before you assume understanding or readiness.',
      watch: 'Adding instruction on top of sensory overwhelm rarely helps.',
      next: 'Allow settling time and adapt pace, space, and support before you add structure.'
    },
    b3c3: {
      scene: 'Water changes how the body feels and organises — sensory load is part of every entry and drill.',
      notice: 'Watch for startle, withdrawal, gripping, or sudden stillness as sensory information, not defiance.',
      move: 'Treat land skills as a reference, not a guarantee. Water asks the body to reorganise.',
      watch: 'Adding instruction on top of sensory overwhelm rarely helps.',
      next: 'Allow settling time and adapt pace, space, and support before you add structure.'
    },
    b3c4: {
      scene: 'Water changes how the body feels and organises — sensory load is part of every entry and drill.',
      notice: 'Watch for startle, withdrawal, gripping, or sudden stillness as sensory information, not defiance.',
      move: 'Tune pace, space, and support to the swimmer\'s sensory profile, not a standard template.',
      watch: 'Adding instruction on top of sensory overwhelm rarely helps.',
      next: 'Allow settling time and adapt pace, space, and support before you add structure.'
    },
    m1_b1c1: {
      scene: 'The first moments in water often look unstable — the environment is actively moving the body.',
      notice: 'Wobble, search for balance, and changing effort can be adaptation, not inability.',
      move: 'Read early instability as adaptation to an active environment, not as lack of ability.',
      watch: 'Avoid labelling early instability as failure before the body has time to organise.',
      next: 'Allow settling time and adapt pace, space, and support before you add structure.'
    },
    m2_b1c1: {
      scene: 'Emotional state shapes every swimming minute — readiness is live data in the water.',
      notice: 'Face, breath, muscle tone, and approach/avoidance tell you what the plan cannot.',
      move: 'Read readiness in the body and face before you introduce anything new.',
      watch: 'Pushing through a dysregulated state costs trust and learning.',
      next: 'Match pace and support to what is present, then re-check before you progress.'
    },
    m2_b1c2: {
      scene: 'Emotional state shapes every swimming minute — readiness is live data in the water.',
      notice: 'Face, breath, muscle tone, and approach/avoidance tell you what the plan cannot.',
      move: 'When state shifts, reshape pace and expectation before you reshape the task.',
      watch: 'Pushing through a dysregulated state costs trust and learning.',
      next: 'Match pace and support to what is present, then re-check before you progress.'
    },
    m2_b1c3: {
      scene: 'Emotional state shapes every swimming minute — readiness is live data in the water.',
      notice: 'Face, breath, muscle tone, and approach/avoidance tell you what the plan cannot.',
      move: 'Respond to the need beneath the behaviour. What you see is rarely the full story.',
      watch: 'Pushing through a dysregulated state costs trust and learning.',
      next: 'Match pace and support to what is present, then re-check before you progress.'
    },
    m2_b1c4: {
      scene: 'Emotional state shapes every swimming minute — readiness is live data in the water.',
      notice: 'Face, breath, muscle tone, and approach/avoidance tell you what the plan cannot.',
      move: 'Treat readiness as live data. Observe, adjust, and observe again throughout the session.',
      watch: 'Pushing through a dysregulated state costs trust and learning.',
      next: 'Match pace and support to what is present, then re-check before you progress.'
    },
    m2_b2c1: {
      scene: 'Emotional state shapes every swimming minute — readiness is live data in the water.',
      notice: 'Face, breath, muscle tone, and approach/avoidance tell you what the plan cannot.',
      move: 'Catch state early. Match pace and support to what is present, not what the plan assumed.',
      watch: 'Pushing through a dysregulated state costs trust and learning.',
      next: 'Match pace and support to what is present, then re-check before you progress.'
    },
    m2_b2c2: {
      scene: 'Emotional state shapes every swimming minute — readiness is live data in the water.',
      notice: 'Face, breath, muscle tone, and approach/avoidance tell you what the plan cannot.',
      move: 'Name the state before you change the approach. Each state asks for a different response.',
      watch: 'Pushing through a dysregulated state costs trust and learning.',
      next: 'Match pace and support to what is present, then re-check before you progress.'
    },
    b2c2_calm: {
      scene: 'Safety is continuous in clubSENsational sessions — close, visible, and organised around the swimmer.',
      notice: 'Subtle position or response changes often precede obvious distress.',
      move: 'When regulation is steady, progress with intention and keep demand measured so calm holds.',
      watch: 'Never wait for a clear emergency signal before you adjust proximity or support.',
      next: 'Reset space, positioning, and communication so prevention stays ahead of risk.'
    },
    b2c2_alert: {
      scene: 'Safety is continuous in clubSENsational sessions — close, visible, and organised around the swimmer.',
      notice: 'Subtle position or response changes often precede obvious distress.',
      move: 'Hold the structure. Alert states need stability, not acceleration.',
      watch: 'Never wait for a clear emergency signal before you adjust proximity or support.',
      next: 'Reset space, positioning, and communication so prevention stays ahead of risk.'
    },
    b2c2_overloaded: {
      scene: 'Safety is continuous in clubSENsational sessions — close, visible, and organised around the swimmer.',
      notice: 'Subtle position or response changes often precede obvious distress.',
      move: 'Strip the task back to regulation first. Learning returns when demand falls.',
      watch: 'Never wait for a clear emergency signal before you adjust proximity or support.',
      next: 'Reset space, positioning, and communication so prevention stays ahead of risk.'
    },
    m2_b3c1: {
      scene: 'Emotional state shapes every swimming minute — readiness is live data in the water.',
      notice: 'Face, breath, muscle tone, and approach/avoidance tell you what the plan cannot.',
      move: 'Read the whole picture: pool conditions, environment, and what the swimmer brought in today.',
      watch: 'Pushing through a dysregulated state costs trust and learning.',
      next: 'Match pace and support to what is present, then re-check before you progress.'
    },
    b3c2_env: {
      scene: 'Water changes how the body feels and organises — sensory load is part of every entry and drill.',
      notice: 'Watch for startle, withdrawal, gripping, or sudden stillness as sensory information, not defiance.',
      move: 'Reposition, open space, or simplify the setting before you push the swimmer harder.',
      watch: 'Adding instruction on top of sensory overwhelm rarely helps.',
      next: 'Allow settling time and adapt pace, space, and support before you add structure.'
    },
    b3c2_water: {
      scene: 'Water changes how the body feels and organises — sensory load is part of every entry and drill.',
      notice: 'Watch for startle, withdrawal, gripping, or sudden stillness as sensory information, not defiance.',
      move: 'Adjust depth, support, or body position in the water before you change the task.',
      watch: 'Adding instruction on top of sensory overwhelm rarely helps.',
      next: 'Allow settling time and adapt pace, space, and support before you add structure.'
    },
    b3c2_internal: {
      scene: 'Water changes how the body feels and organises — sensory load is part of every entry and drill.',
      notice: 'Watch for startle, withdrawal, gripping, or sudden stillness as sensory information, not defiance.',
      move: 'Track energy, tension, and withdrawal. Internal load often shifts before behaviour does.',
      watch: 'Adding instruction on top of sensory overwhelm rarely helps.',
      next: 'Allow settling time and adapt pace, space, and support before you add structure.'
    },
    m3_b1c1: {
      scene: 'In session, engagement is the doorway to learning — connection before correction.',
      notice: 'Notice join-up signals: shared attention, turn-taking, soft body, following your cue.',
      move: 'Look beyond visible participation. True engagement is connection and availability to learn.',
      watch: 'If the swimmer goes distant or mechanical, stop advancing the task and rebuild contact.',
      next: 'Reconnect with a simpler exchange, then return to the learning aim.'
    },
    m3_b1c2: {
      scene: 'In session, engagement is the doorway to learning — connection before correction.',
      notice: 'Notice join-up signals: shared attention, turn-taking, soft body, following your cue.',
      move: 'Track small patterns of connection. Subtle signals often arrive before obvious participation.',
      watch: 'If the swimmer goes distant or mechanical, stop advancing the task and rebuild contact.',
      next: 'Reconnect with a simpler exchange, then return to the learning aim.'
    },
    m3_b1c3: {
      scene: 'In session, engagement is the doorway to learning — connection before correction.',
      notice: 'Notice join-up signals: shared attention, turn-taking, soft body, following your cue.',
      move: 'When engagement drops, pause and rebuild it before you add instruction or progression.',
      watch: 'If the swimmer goes distant or mechanical, stop advancing the task and rebuild contact.',
      next: 'Reconnect with a simpler exchange, then return to the learning aim.'
    },
    m3_b2c1: {
      scene: 'You are ready to progress a task, but the swimmer's connection with you has thinned.',
      notice: 'Participation may still look present while availability to learn has dropped.',
      move: 'Secure connection before you advance the task. A joined swimmer learns; a distant one survives.',
      watch: 'Advancing without join-up turns the session into compliance, not learning.',
      next: 'Reconnect with a simpler exchange, then return to the learning aim.'
    },
    m3_b2c2: {
      scene: 'Emotional state shapes every swimming minute — readiness is live data in the water.',
      notice: 'Face, breath, muscle tone, and approach/avoidance tell you what the plan cannot.',
      move: 'Keep interaction calm, consistent, and predictable. Trust is built in repetition, not intensity.',
      watch: 'Pushing through a dysregulated state costs trust and learning.',
      next: 'Match pace and support to what is present, then re-check before you progress.'
    },
    m3_b2c3: {
      scene: 'In session, engagement is the doorway to learning — connection before correction.',
      notice: 'Notice join-up signals: shared attention, turn-taking, soft body, following your cue.',
      move: 'Let tone, signals, and pacing do the connecting. How you deliver shapes whether they stay with you.',
      watch: 'If the swimmer goes distant or mechanical, stop advancing the task and rebuild contact.',
      next: 'Reconnect with a simpler exchange, then return to the learning aim.'
    },
    m3_b2c4: {
      scene: 'In session, engagement is the doorway to learning — connection before correction.',
      notice: 'Notice join-up signals: shared attention, turn-taking, soft body, following your cue.',
      move: 'Adjust pace and demand at the first sign of strain. Protecting the relationship protects learning.',
      watch: 'If the swimmer goes distant or mechanical, stop advancing the task and rebuild contact.',
      next: 'Reconnect with a simpler exchange, then return to the learning aim.'
    },
    m3_b3c1: {
      scene: 'In session, engagement is the doorway to learning — connection before correction.',
      notice: 'Notice join-up signals: shared attention, turn-taking, soft body, following your cue.',
      move: 'Watch engagement shift in real time. Intervene early before disengagement takes hold.',
      watch: 'If the swimmer goes distant or mechanical, stop advancing the task and rebuild contact.',
      next: 'Reconnect with a simpler exchange, then return to the learning aim.'
    },
    m3_b3c2: {
      scene: 'In session, engagement is the doorway to learning — connection before correction.',
      notice: 'Notice join-up signals: shared attention, turn-taking, soft body, following your cue.',
      move: 'Treat pace and structure as live controls. Stability comes from continuous fine adjustment.',
      watch: 'If the swimmer goes distant or mechanical, stop advancing the task and rebuild contact.',
      next: 'Reconnect with a simpler exchange, then return to the learning aim.'
    },
    m3_b3c3: {
      scene: 'In session, engagement is the doorway to learning — connection before correction.',
      notice: 'Notice join-up signals: shared attention, turn-taking, soft body, following your cue.',
      move: 'Observe first, then choose. The right engagement approach depends on the swimmer in front of you.',
      watch: 'If the swimmer goes distant or mechanical, stop advancing the task and rebuild contact.',
      next: 'Reconnect with a simpler exchange, then return to the learning aim.'
    },
    m3_b3c3_mod: {
      scene: 'In session, engagement is the doorway to learning — connection before correction.',
      notice: 'Notice join-up signals: shared attention, turn-taking, soft body, following your cue.',
      move: 'Demonstrate the pattern clearly before you expect the swimmer to attempt it.',
      watch: 'If the swimmer goes distant or mechanical, stop advancing the task and rebuild contact.',
      next: 'Reconnect with a simpler exchange, then return to the learning aim.'
    },
    m3_b3c3_turn: {
      scene: 'In session, engagement is the doorway to learning — connection before correction.',
      notice: 'Notice join-up signals: shared attention, turn-taking, soft body, following your cue.',
      move: 'Use simple back-and-forth exchanges to keep the swimmer inside the interaction with you.',
      watch: 'If the swimmer goes distant or mechanical, stop advancing the task and rebuild contact.',
      next: 'Reconnect with a simpler exchange, then return to the learning aim.'
    },
    m3_b3c3_guide: {
      scene: 'In session, engagement is the doorway to learning — connection before correction.',
      notice: 'Notice join-up signals: shared attention, turn-taking, soft body, following your cue.',
      move: 'Leave room for the try. Guide lightly and resist taking over too soon.',
      watch: 'If the swimmer goes distant or mechanical, stop advancing the task and rebuild contact.',
      next: 'Reconnect with a simpler exchange, then return to the learning aim.'
    },
    m3_b3c3_intensive: {
      scene: 'In session, engagement is the doorway to learning — connection before correction.',
      notice: 'Notice join-up signals: shared attention, turn-taking, soft body, following your cue.',
      move: 'Join the swimmer\'s rhythm before you introduce structure or higher demand.',
      watch: 'If the swimmer goes distant or mechanical, stop advancing the task and rebuild contact.',
      next: 'Reconnect with a simpler exchange, then return to the learning aim.'
    },
    m3_b3c3_play: {
      scene: 'In session, engagement is the doorway to learning — connection before correction.',
      notice: 'Notice join-up signals: shared attention, turn-taking, soft body, following your cue.',
      move: 'Use play with purpose. Enjoyment should build engagement toward a clear learning aim.',
      watch: 'If the swimmer goes distant or mechanical, stop advancing the task and rebuild contact.',
      next: 'Reconnect with a simpler exchange, then return to the learning aim.'
    },
    m3_b3c4: {
      scene: 'In session, engagement is the doorway to learning — connection before correction.',
      notice: 'Notice join-up signals: shared attention, turn-taking, soft body, following your cue.',
      move: 'When disengagement appears, pause, reduce demand, and reconnect before you continue.',
      watch: 'If the swimmer goes distant or mechanical, stop advancing the task and rebuild contact.',
      next: 'Reconnect with a simpler exchange, then return to the learning aim.'
    },
    m4_b1c1: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Judge progress by how the swimmer functions in water, not only by skills achieved.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b1c2: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Shape the session around the swimmer\'s pathway. Adapt expectation before you force conformity.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b1c3: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Let principles guide the moment. Sound decisions beat rigid sequences.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2core1: {
      scene: 'Water changes how the body feels and organises — sensory load is part of every entry and drill.',
      notice: 'Watch for startle, withdrawal, gripping, or sudden stillness as sensory information, not defiance.',
      move: 'When tension rises, simplify the task and reduce sensory load before you add challenge.',
      watch: 'Adding instruction on top of sensory overwhelm rarely helps.',
      next: 'Allow settling time and adapt pace, space, and support before you add structure.'
    },
    m4_b2core2: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Track support needs over time in small steps before you progress or consolidate level.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2core3: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'If attention drifts, match pace and demand before assuming the task is too easy.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l1_overview: {
      scene: 'When challenge rises in the water, support must rise first — or stay available.',
      notice: 'Comfort and control tell you whether the next demand belongs yet.',
      move: 'Prioritise calm and support across all four focus areas before you add skill demand.',
      watch: 'Demand without support can look like "won't" when it is "can't yet".',
      next: 'Layer support, confirm calm, then raise one variable at a time.'
    },
    m4_b2l1_f1: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Let the swimmer explore water contact at their pace with full support.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l1_f2: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Keep movement gentle and fully supported until body position feels predictable.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l1_f3: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Introduce face exposure in tiny steps only when the swimmer is regulated.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l1_f4: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Stay close and name safe zones before you expect independent movement.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l1_activities: {
      scene: 'Emotional state shapes every swimming minute — readiness is live data in the water.',
      notice: 'Face, breath, muscle tone, and approach/avoidance tell you what the plan cannot.',
      move: 'Keep entry, movement, and face exposure fully supported until calm participation is consistent.',
      watch: 'Pushing through a dysregulated state costs trust and learning.',
      next: 'Match pace and support to what is present, then re-check before you progress.'
    },
    m4_b2l2_overview: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Extend time and variety only when comfort from Level 1 is steady.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l2_f1: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Use familiar routines to lengthen time in water without raising pressure.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l2_f2: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Add movement variety gradually while support stays available.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l2_f3: {
      scene: 'Emotional state shapes every swimming minute — readiness is live data in the water.',
      notice: 'Face, breath, muscle tone, and approach/avoidance tell you what the plan cannot.',
      move: 'Link bubble play and short immersions to calm, not performance.',
      watch: 'Pushing through a dysregulated state costs trust and learning.',
      next: 'Match pace and support to what is present, then re-check before you progress.'
    },
    m4_b2l2_f4: {
      scene: 'Safety is continuous in clubSENsational sessions — close, visible, and organised around the swimmer.',
      notice: 'Subtle position or response changes often precede obvious distress.',
      move: 'Teach edge use and safe zones before you reduce proximity support.',
      watch: 'Never wait for a clear emergency signal before you adjust proximity or support.',
      next: 'Reset space, positioning, and communication so prevention stays ahead of risk.'
    },
    m4_b2l2_activities: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Extend time in water through familiar routines before you reduce support or add complexity.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l3_overview: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Build float, streamline, and first propulsion with recovery at the wall every time.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l3_f1: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Hold floats short and supported until balance feels stable in both positions.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l3_f2: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Keep streamlines and rotations simple before you link them to travel.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l3_f3: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Connect first kicks and arms to clear direction and recovery.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l3_f4: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Practice recovery to the wall within every short skill block.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l3_activities: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Link float, streamline, and first propulsion to clear recovery at the wall every time.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l4_overview: {
      scene: 'Safety is continuous in clubSENsational sessions — close, visible, and organised around the swimmer.',
      notice: 'Subtle position or response changes often precede obvious distress.',
      move: 'Increase independence in floats, glides, and propulsion while safety sequences stay structured.',
      watch: 'Never wait for a clear emergency signal before you adjust proximity or support.',
      next: 'Reset space, positioning, and communication so prevention stays ahead of risk.'
    },
    m4_b2l4_f1: {
      scene: 'Emotional state shapes every swimming minute — readiness is live data in the water.',
      notice: 'Face, breath, muscle tone, and approach/avoidance tell you what the plan cannot.',
      move: 'Shorten support only when floats and transitions stay calm and controlled.',
      watch: 'Pushing through a dysregulated state costs trust and learning.',
      next: 'Match pace and support to what is present, then re-check before you progress.'
    },
    m4_b2l4_f2: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Extend glide length only while streamline holds without constant prompting.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l4_f3: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Raise propulsion demand when breathing and direction stay steady.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l4_f4: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Run swim-float-swim sequences with support before you expect solo recovery.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l4_activities: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Keep glides and rotations short and repeatable so control stays ahead of fatigue.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l5_overview: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Hold technique standards explicit as stroke volume and wall work increase.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l5_f1: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Keep streamline and rotation quality visible before you add set density.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l5_f2: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Name the stroke standard clearly and protect it as fatigue rises.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l5_f3: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Teach starts, turns, and push-offs as repeatable sequences, not one-off demos.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l5_f4: {
      scene: 'Safety is continuous in clubSENsational sessions — close, visible, and organised around the swimmer.',
      notice: 'Subtle position or response changes often precede obvious distress.',
      move: 'Check safety decisions during busy swimming, not only at session start.',
      watch: 'Never wait for a clear emergency signal before you adjust proximity or support.',
      next: 'Reset space, positioning, and communication so prevention stays ahead of risk.'
    },
    m4_b2l5_activities: {
      scene: 'Safety is continuous in clubSENsational sessions — close, visible, and organised around the swimmer.',
      notice: 'Subtle position or response changes often precede obvious distress.',
      move: 'Hold technique standards explicit as volume rises. Quality and safety stay linked.',
      watch: 'Never wait for a clear emergency signal before you adjust proximity or support.',
      next: 'Reset space, positioning, and communication so prevention stays ahead of risk.'
    },
    m4_b2l6_overview: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Increase distance and density only while fluency and self-regulation stay stable.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l6_f1: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Protect stroke shape over longer repeats before you chase speed.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l6_f2: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Adjust pace from rhythm cues, not from pressure to finish the set.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l6_f3: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Extend distance in steps while breathing recovery stays efficient.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l6_f4: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Link wall skills to stroke rhythm so flow does not break under fatigue.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b2l6_activities: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Increase distance and set density only while fluency and self-regulation stay stable.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b3c1: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Consolidation and pause are part of progress. Allow time before you move the swimmer on.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m4_b3c2: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Adapt how you teach. Access to learning changes when instruction matches the swimmer.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    b3c3_step1: {
      scene: 'Water changes how the body feels and organises — sensory load is part of every entry and drill.',
      notice: 'Watch for startle, withdrawal, gripping, or sudden stillness as sensory information, not defiance.',
      move: 'Place the stage where the swimmer usually lives in the water across the term, not their best moment.',
      watch: 'Adding instruction on top of sensory overwhelm rarely helps.',
      next: 'Allow settling time and adapt pace, space, and support before you add structure.'
    },
    b3c3_step2: {
      scene: 'Water changes how the body feels and organises — sensory load is part of every entry and drill.',
      notice: 'Watch for startle, withdrawal, gripping, or sudden stillness as sensory information, not defiance.',
      move: 'Use focus-area ratings to test the level you chose. Consistency matters more than first impression.',
      watch: 'Adding instruction on top of sensory overwhelm rarely helps.',
      next: 'Allow settling time and adapt pace, space, and support before you add structure.'
    },
    b3c3_step3: {
      scene: 'Water changes how the body feels and organises — sensory load is part of every entry and drill.',
      notice: 'Watch for startle, withdrawal, gripping, or sudden stillness as sensory information, not defiance.',
      move: 'Read development areas as access to learning, not only as a record of skill performance.',
      watch: 'Adding instruction on top of sensory overwhelm rarely helps.',
      next: 'Allow settling time and adapt pace, space, and support before you add structure.'
    },
    m5_b1c1: {
      scene: 'You need the swimmer to understand what comes next, but verbal instruction is stacking too fast.',
      notice: 'Eyes go to your face, then away — processing load is rising.',
      move: 'Show the visual before you explain. Let the image carry expectation when words are hard to process.',
      watch: 'More words rarely fix overload; a clear visual often will.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_b1c2: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Present one visible step at a time rather than stacking several verbal instructions.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_b1c3: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Use the schedule to show what comes next so participation is driven by predictability, not pressure.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_b2c1: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Show the PixtoLearn system before you explain it. Let visuals carry expectation when words are hard to process.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_b2c2: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Choose folder and category before the session starts so progression stays predictable.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_b2c3: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Keep flashcards within reach and match card type to the moment: instruction, choice, regulation, or closure.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_b3c2: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Teach each skill alone before you link flashcards into a continuous sequence.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_b3c3: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Anchor the session to one main outcome, then break it into visible phases with flashcards.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_f5: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Build the session plan before swimmers arrive so visuals, sequence, and outcomes stay aligned.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_f1_s1: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Model the entry routine visually before you ask the swimmer to attempt it.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_f1_s2: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Use movement exploration to build familiarity before you name formal skills.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_f1_s3: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Introduce face and breath work playfully in short steps tied to regulation.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_f2_s1: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Let buoyancy and support do the work before you expect independent float holds.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    m5_f2_s2: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Show the long body shape visually, then add short rotation and sculling drills once alignment holds.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_f2_s3: {
      scene: 'Safety is continuous in clubSENsational sessions — close, visible, and organised around the swimmer.',
      notice: 'Subtle position or response changes often precede obvious distress.',
      move: 'Embed safety cues inside every activity block, not as a separate lecture.',
      watch: 'Never wait for a clear emergency signal before you adjust proximity or support.',
      next: 'Reset space, positioning, and communication so prevention stays ahead of risk.'
    },
    m5_f3_s1: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Break stroke into visible parts before you expect a full coordinated pattern.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_f3_s2: {
      scene: 'Emotional state shapes every swimming minute — readiness is live data in the water.',
      notice: 'Face, breath, muscle tone, and approach/avoidance tell you what the plan cannot.',
      move: 'Confirm readiness before dynamic entries, and teach wall skills as repeatable sequences with visuals before you add pace.',
      watch: 'Pushing through a dysregulated state costs trust and learning.',
      next: 'Match pace and support to what is present, then re-check before you progress.'
    },
    m5_f4_s1: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Choose games that rehearse the session outcome, not just fill time.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_f4_s2: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Match equipment to the learning goal and fade it when the skill holds without it.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_f4_s3: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Use routine and communication cards at transitions when demand or uncertainty rises.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_fc31: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Show Main first for the whole picture, then flip to Break It Down when step-by-step support is needed.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_fc32: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Introduce equipment with the flashcard before you hand it over so the activity purpose stays clear.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_fc33: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Offer Break Time and Choosing cards when regulation or autonomy needs rise.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_fc34: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Check in with How Do You Feel and Where cards when communication slows or distress appears.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_fc35: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Use white cards for swimmer-specific needs that the standard kit does not cover yet.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_fc36: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Signal Finished clearly at activity end so the swimmer knows what comes next.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_vs1: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Use First and Then for two-step sequences until the swimmer follows both parts reliably.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_vs2: {
      scene: 'On deck and in the water, visuals carry expectation when words are hard to process.',
      notice: 'Watch whether the swimmer looks to the card, anticipates the next step, and stays with the sequence.',
      move: 'Add the middle step on the schedule once First and Then is stable across sessions.',
      watch: 'If confusion or overload rises, reduce verbal load and show one visual step at a time.',
      next: 'Keep the same visual language across transitions so predictability does the coaching.'
    },
    m5_vs3: {
      scene: 'Emotional state shapes every swimming minute — readiness is live data in the water.',
      notice: 'Face, breath, muscle tone, and approach/avoidance tell you what the plan cannot.',
      move: 'Expand to four or more activities only when transitions stay calm with shorter schedules.',
      watch: 'Pushing through a dysregulated state costs trust and learning.',
      next: 'Match pace and support to what is present, then re-check before you progress.'
    },
    t2_b1c1: {
      scene: 'A swimmer looks confident in water but structured stroke work keeps falling apart.',
      notice: 'Control and calm are there; technical demand may be arriving too early.',
      move: 'Strong aquatic confidence shows before technique. Honour control and readiness before structured strokes.',
      watch: 'Do not confuse aquatic confidence with stroke readiness.',
      next: 'Match pace and support to what is present, then re-check before you progress.'
    },
    t2_b1c2: {
      scene: 'In the pool, foundational control and readiness decide whether structured swimming can land today.',
      notice: 'Look for balance, breath ease, and calm face contact — not only effort or splash.',
      move: 'When coordination collapses under demand, return to balance and body control, not the next skill.',
      watch: 'If coordination collapses under demand, the foundation is asking for more time.',
      next: 'Return to control work, then rebuild structure in smaller pieces.'
    },
    t2_b1c3: {
      scene: 'In the pool, foundational control and readiness decide whether structured swimming can land today.',
      notice: 'Look for balance, breath ease, and calm face contact — not only effort or splash.',
      move: 'Face contact may need repeated, gentle exposure. Progression is exposure over time, not force.',
      watch: 'If coordination collapses under demand, the foundation is asking for more time.',
      next: 'Return to control work, then rebuild structure in smaller pieces.'
    },
    t2_b1c4: {
      scene: 'Emotional state shapes every swimming minute — readiness is live data in the water.',
      notice: 'Face, breath, muscle tone, and approach/avoidance tell you what the plan cannot.',
      move: 'Active movement is not readiness. Stay with foundational work until control holds under structure.',
      watch: 'Pushing through a dysregulated state costs trust and learning.',
      next: 'Match pace and support to what is present, then re-check before you progress.'
    },
    t2_b2c1: {
      scene: 'Across the clubSENsational pathway, this moment sits inside a stage and level — progress is individual.',
      notice: 'Track regulation, independence, and engagement alongside the aquatic skill itself.',
      move: 'Breath-holding and tension often sit behind poor float. Address regulation before you chase position.',
      watch: 'A skill without calm access is not secure progress. Do not rush the pathway label.',
      next: 'Consolidate what is stable before you add demand, distance, or independence.'
    },
    t2_b2c2: {
      scene: 'In the pool, foundational control and readiness decide whether structured swimming can land today.',
      notice: 'Look for balance, breath ease, and calm face contact — not only effort or splash.',
      move: 'Repeated head-lifting signals breathing and regulation. Treat these as the lever for progress.',
      watch: 'If coordination collapses under demand, the foundation is asking for more time.',
      next: 'Return to control work, then rebuild structure in smaller pieces.'
    },
    t2_b2c3: {
      scene: 'In the pool, foundational control and readiness decide whether structured swimming can land today.',
      notice: 'Look for balance, breath ease, and calm face contact — not only effort or splash.',
      move: 'Balance problems often trace to breathing uncertainty. Observe the whole pattern, not one symptom.',
      watch: 'If coordination collapses under demand, the foundation is asking for more time.',
      next: 'Return to control work, then rebuild structure in smaller pieces.'
    },
    t2_b2c4: {
      scene: 'In the pool, foundational control and readiness decide whether structured swimming can land today.',
      notice: 'Look for balance, breath ease, and calm face contact — not only effort or splash.',
      move: 'Some foundations need many sessions. Protect gradual exposure and mark small gains without rushing.',
      watch: 'If coordination collapses under demand, the foundation is asking for more time.',
      next: 'Return to control work, then rebuild structure in smaller pieces.'
    },
    t2_b3c1: {
      scene: 'Emotional state shapes every swimming minute — readiness is live data in the water.',
      notice: 'Face, breath, muscle tone, and approach/avoidance tell you what the plan cannot.',
      move: 'Calm entry with minimal guidance is independence forming. Give space before you step back in.',
      watch: 'Pushing through a dysregulated state costs trust and learning.',
      next: 'Match pace and support to what is present, then re-check before you progress.'
    },
    t2_b3c2: {
      scene: 'In the pool, foundational control and readiness decide whether structured swimming can land today.',
      notice: 'Look for balance, breath ease, and calm face contact — not only effort or splash.',
      move: 'Pause after a wobble. Recovery is the lesson; assist only when self-correction is not returning.',
      watch: 'If coordination collapses under demand, the foundation is asking for more time.',
      next: 'Return to control work, then rebuild structure in smaller pieces.'
    },
    t2_b3c3: {
      scene: 'In the pool, foundational control and readiness decide whether structured swimming can land today.',
      notice: 'Look for balance, breath ease, and calm face contact — not only effort or splash.',
      move: 'If tension rises when support drops, restore light contact, regulate, then fade support more slowly.',
      watch: 'If coordination collapses under demand, the foundation is asking for more time.',
      next: 'Return to control work, then rebuild structure in smaller pieces.'
    },
    t2_b3c4: {
      scene: 'In session, engagement is the doorway to learning — connection before correction.',
      notice: 'Notice join-up signals: shared attention, turn-taking, soft body, following your cue.',
      move: 'When demand outpaces capacity, simplify the task and rebuild engagement before you advance again.',
      watch: 'If the swimmer goes distant or mechanical, stop advancing the task and rebuild contact.',
      next: 'Reconnect with a simpler exchange, then return to the learning aim.'
    },
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
      'f2-s1': 'm5_f2_s1', 'f2-s2': 'm5_f2_s2', 'f2-s3': 'm5_f2_s3',
      'f3-s1': 'm5_f3_s1', 'f3-s2': 'm5_f3_s2',
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

  function asCard(entry, fallback) {
    if (entry && typeof entry === 'object') {
      return {
        scene: entry.scene || '',
        notice: entry.notice || '',
        move: entry.move || entry.text || '',
        watch: entry.watch || '',
        next: entry.next || ''
      };
    }
    var line = (typeof entry === 'string' && entry) ? entry : (fallback || '');
    line = String(line || '').replace(/^in practice\s*:\s*/i, '').trim();
    if (!line) {
      return { scene: '', notice: '', move: '', watch: '', next: '' };
    }
    return {
      scene: 'In a clubSENsational swimming session, bring this idea into the water with the swimmer in front of you.',
      notice: 'Read the body and the moment before you push the plan.',
      move: line.charAt(0).toUpperCase() + line.slice(1),
      watch: 'If calm, safety, or connection drops, simplify before you continue.',
      next: 'Confirm regulation, then take the smallest useful next step.'
    };
  }

  function plainText(card) {
    if (!card) return '';
    if (typeof card === 'string') return card;
    return card.move || card.scene || '';
  }

  function lookupEntry(target) {
    if (!target) return null;
    var moduleKey = detectModuleKey();
    var aliases = MODULE_ALIASES[moduleKey];
    // Prefer module-specific alias so shared b* keys do not shadow M2-M5 / TII
    if (aliases && aliases[target] && COPY[aliases[target]]) return COPY[aliases[target]];
    if (COPY[target]) return COPY[target];
    return null;
  }

  window.InPracticeCopy = {
    map: COPY,
    asCard: asCard,
    plainText: plainText,
    resolveCard: function (target, fallback) {
      return asCard(lookupEntry(target), fallback);
    },
    resolve: function (target, fallback) {
      return plainText(this.resolveCard(target, fallback)) || (fallback || '');
    }
  };
})();
