(function(global){
  'use strict';

  var ICON_CYCLE = ['movement', 'balance', 'response', 'focus', 'shield', 'connect'];

  var conceptInsightIcons = {
    movement: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h10"/><path d="M13 8l4 4-4 4"/><path d="M5 7v10" opacity=".45"/></svg>',
    balance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v16"/><path d="M6 9h12"/><path d="M4 9l-2.5 5h5L4 9z"/><path d="M20 9l-2.5 5h5L20 9z"/></svg>',
    response: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="5.5" opacity=".55"/><circle cx="12" cy="12" r="9" opacity=".28"/></svg>',
    focus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3.4 8.2-7 10-3.6-1.8-7-5-7-10V6l7-3Z"/></svg>',
    connect: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 7.5A3.5 3.5 0 0 1 9.5 4h5A3.5 3.5 0 0 1 18 7.5v1a3.5 3.5 0 0 1-3.5 3.5H12l-3 3v-3H9.5A3.5 3.5 0 0 1 6 8.5v-1Z"/></svg>'
  };

  function stripHtml(html){
    if(!html) return '';
    var tmp = document.createElement('div');
    tmp.innerHTML = String(html);
    return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
  }

  function splitSentences(text){
    return String(text || '').split(/(?<=[.!?])\s+/).map(function(s){ return s.trim(); }).filter(Boolean);
  }

  function normalizeForCompare(str){
    return String(str || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  }

  function isRedundantWithTitle(title, text){
    if(!title || !text) return false;
    var t = normalizeForCompare(title);
    var s = normalizeForCompare(text);
    if(!t || !s) return false;
    if(t === s) return true;
    if(s.indexOf(t) === 0 || t.indexOf(s) === 0) return true;
    var tWords = t.split(' ').filter(function(w){ return w.length > 2; });
    var sWords = s.split(' ').filter(function(w){ return w.length > 2; });
    if(!tWords.length || !sWords.length) return false;
    var shared = 0;
    tWords.forEach(function(w){
      if(sWords.indexOf(w) !== -1) shared++;
    });
    var ratio = shared / Math.min(tWords.length, sWords.length);
    return ratio >= 0.55;
  }

  var CONCEPT_HEADLINES = {
    'Water as an Active Environment': 'Water Is Never Passive',
    'Overview of Water Forces': 'Multiple Forces at Work',
    'Supportive Forces': 'Support Is Not Control',
    'Dynamic Forces': 'Resistance Shapes Movement',
    'Drowning Risk': 'Often Silent, Rarely Obvious',
    'Who Is More Vulnerable': 'Risk Varies Between Swimmers',
    'Neurodiverse Risk Factors': 'Individual Factors in Safety',
    'Prevention Systems': 'Safety Through Prevention',
    'What Changes When Entering Water': 'Water Changes Everything',
    'The Seven Senses in Water': 'A Full Sensory Shift',
    'Land vs Water Perception': 'A Different Experience',
    'Hypo and Hyper Sensitivity': 'Sensory Responses Differ',
    'How Learning Is Accessed': 'Learning Requires Readiness',
    'Teaching Requires Regulation': 'Regulation Comes First',
    'What the Framework Helps Us Understand': 'Behaviour Has Meaning',
    'Readiness Can Change': 'Readiness Is Not Fixed',
    'Why Emotional States Matter': 'State Shapes Engagement',
    'Overview of Emotional States': 'States Shift Through the Session',
    'Calm': 'Regulated and Ready',
    'Alert': 'Engaged With Rising Demand',
    'Overloaded': 'Overwhelmed and Protected',
    'Understanding the Influences': 'Many Influences Interact',
    'Factors That Shape Emotional State': 'State Has Many Drivers',
    'Environmental': 'The Environment Matters',
    'Water-Based': 'Water Shapes How We Feel',
    'Internal': 'What Swimmers Bring In',
    'What Is Engagement?': 'Engagement Goes Deeper',
    'What Engagement Looks Like': 'Engagement Is Not Always Visible',
    'Engagement Before Instruction': 'Connection Before Teaching',
    'Why Connection Matters': 'Connection Sustains Engagement',
    'Building Trust': 'Trust Through Consistency',
    'Instructor Behaviour': 'Your Behaviour Shapes the Session',
    'Protecting Connection': 'Connection Needs Protection',
    'Engagement Changes': 'Engagement Shifts Over Time',
    'Maintaining Engagement': 'Engagement Needs Active Support',
    'Using Engagement Approaches': 'Different Ways to Connect',
    'Responding to Disengagement': 'Disengagement Is a Signal',
    'Why Visual Learning Works': 'Visual Processing Supports Learning',
    'Visual Structure Reduces Cognitive Load': 'Structure Reduces Load',
    'Visuals Increase Engagement and Participation': 'Visuals Boost Participation',
    'PixtoLearn as a Visual System': 'A Structured Visual System',
    'PixtoLearn Swimming Flashcards': 'Flashcards at the Core',
    'PixtoLearn Swimming Sequence': 'From Skills to Sequences',
    'Session Planning with PixtoLearn': 'Plan With Purpose'
  };

  function pickStatement(title, paras){
    var i, j, sents, candidate;
    for(i = 0; i < paras.length; i++){
      candidate = paras[i];
      if(!isRedundantWithTitle(title, candidate)) return candidate;
      sents = splitSentences(candidate);
      for(j = 1; j < sents.length; j++){
        if(!isRedundantWithTitle(title, sents[j])) return sents[j];
      }
    }
    return '';
  }

  function collectPillarTexts(paras, statement){
    var texts = [];
    var stmtNorm = normalizeForCompare(statement);
    paras.forEach(function(para){
      splitSentences(para).forEach(function(sent){
        if(normalizeForCompare(sent) === stmtNorm) return;
        texts.push(sent);
      });
    });
    return texts;
  }

  function makeShortTitle(text, maxWords){
    maxWords = maxWords || 3;
    var cleaned = String(text || '').replace(/[.!?]+$/, '').trim();
    var parts = cleaned.split(/\s+/).slice(0, maxWords);
    return parts.map(function(w){ return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
  }

  var PILLAR_TITLE_RULES = [
    [/more vulnerable because of/i, 'Factors That Increase Risk'],
    [/vulnerab(?:ility|le).*not always obvious|not always obvious.*vulnerab/i, 'Hidden Risk'],
    [/look beyond appearance|beyond appearance/i, 'Look Beyond Appearance'],
    [/real level of understanding and control/i, 'Assess True Ability'],
    [/reduced awareness|limited confidence|difficulty understanding instructions/i, 'Individual Differences'],
    [/respond safely in the environment/i, 'Safe Response Capacity'],
    [/interpret swimmer behaviour|interpret.*behavio/i, 'Read Behaviour Accurately'],
    [/forces interact|forces act on the body/i, 'Forces Work Together'],
    [/support the body.*challenge and instability|support.*while others create/i, 'Support and Challenge'],
    [/continuously influence movement/i, 'Shape Movement and Posture'],
    [/not always dramatic|without obvious signs|silent/i, 'Often Silent'],
    [/subtle changes in position|continuous awareness/i, 'Stay Alert to Subtle Signs'],
    [/prevention.*reaction|not based on reaction/i, 'Prevent, Don\u2019t React'],
    [/regulation is not in place|dysregulation/i, 'Regulation Comes First'],
    [/readiness is not fixed|readiness fluctuates|readiness can change/i, 'Readiness Changes'],
    [/emotional state|states affect engagement/i, 'State Shapes Engagement'],
    [/trust is built|building trust/i, 'Trust Through Consistency'],
    [/engagement is not fixed|engagement changes/i, 'Engagement Shifts'],
    [/disengagement is a signal/i, 'Disengagement Signals Change'],
    [/visual learning|process information more efficiently/i, 'Visual Processing'],
    [/cognitive load|reduce.*load/i, 'Reduce Cognitive Load'],
    [/buoyancy lifts|supportive forces/i, 'Supportive Forces'],
    [/resistance and instability|water resists movement/i, 'Resistance and Instability'],
    [/sensory changes|seven senses|hypo.*hyper/i, 'Sensory Experience'],
    [/land vs water|different from land/i, 'Different From Land'],
    [/learning depends on|learning is not automatic/i, 'Learning Needs Readiness'],
    [/teaching must adapt|adjust their approach/i, 'Adapt Your Approach'],
    [/behaviour has meaning|behaviour reflects/i, 'Behaviour Has Meaning']
  ];

  function titleCase(str){
    return String(str || '').split(/\s+/).map(function(w){
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join(' ');
  }

  function makePillarTitle(text){
    var t = String(text || '').replace(/[.!?]+$/, '').trim();
    if(!t) return 'Key Point';

    var rule;
    for(var i = 0; i < PILLAR_TITLE_RULES.length; i++){
      rule = PILLAR_TITLE_RULES[i];
      if(rule[0].test(t)) return rule[1];
    }

    var becauseMatch = t.match(/\bbecause of (.+?)(?:,\s*which|\.\s*$)/i);
    if(becauseMatch){
      var factors = becauseMatch[1].split(/\s*,\s*|\s+or\s+/)[0].trim();
      if(factors.length <= 36) return titleCase(factors);
      return 'Underlying Factors';
    }

    var whichMatch = t.match(/,\s*which is why (.+)/i);
    if(whichMatch){
      var why = whichMatch[1].replace(/[.!?]+$/, '').trim();
      if(why.length <= 34) return titleCase(makeShortTitle(why, 4));
      return 'Why It Matters';
    }

    if(/^(Some|Many|Not all|It is|These|This|Understanding|Recognising|Even when|As swimmers|A swimmer|In many cases|For many)/i.test(t)){
      var commaParts = t.split(/,\s+/);
      if(commaParts.length >= 2){
        var second = commaParts[1].replace(/[.!?]+$/, '').trim();
        if(/^(which|who|where|when|because)/i.test(second)){
          if(commaParts.length >= 3) second = commaParts[2].replace(/[.!?]+$/, '').trim();
        }
        if(second.length <= 36 && second.split(/\s+/).length <= 5){
          return titleCase(makeShortTitle(second, 4));
        }
      }
    }

    var words = t.split(/\s+/);
    if(words.length >= 6){
      var mid = words.slice(Math.floor(words.length / 2) - 1, Math.floor(words.length / 2) + 2).join(' ');
      return titleCase(mid);
    }

    return titleCase(makeShortTitle(t, 2));
  }

  function makeInsightTitle(conceptTitle, firstPara, secondPara){
    if(CONCEPT_HEADLINES[conceptTitle]) return CONCEPT_HEADLINES[conceptTitle];

    var first = splitSentences(firstPara)[0] || conceptTitle || '';
    first = first.replace(/\.$/, '');

    if(secondPara){
      var secondSents = splitSentences(secondPara);
      var hook = secondSents[0] || '';
      if(/^(It is|This means|These|Understanding|Recognising|For many|Some|Not all|Even when|As swimmers|A swimmer|In many cases)/i.test(firstPara) && hook){
        hook = hook.replace(/\.$/, '');
        if(hook.length <= 56 && !isRedundantWithTitle(conceptTitle, hook)) return titleCase(makeShortTitle(hook, 6));
      }
    }

    first = first.replace(/^(In water|When entering water|When|For many|Some|Not all|The way|Learning|Entering|As swimmers|Even when|A swimmer|An|A|The)\s*,?\s*/i, '');
    if(first.length > 56){
      return titleCase(makeShortTitle(first, 5));
    }
    return titleCase(first);
  }

  function extractParagraphs(html){
    if(!html) return [];
    var text = String(html);
    text = text.replace(/<h5[^>]*>\s*Introduction\s*<\/h5>/gi, '');
    var paras = [];
    text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, function(_, inner){
      var plain = stripHtml(inner);
      if(plain) paras.push(plain);
      return '';
    });
    if(!paras.length){
      var plain = stripHtml(text);
      if(plain) paras.push(plain);
    }
    return paras;
  }

  function normalizePoints(points){
    return (points || []).map(function(p){ return stripHtml(String(p)); }).filter(function(p){
      return p && !/^in practice\s*:/i.test(p);
    });
  }

  function isBadPillarTitle(title){
    if(!title) return true;
    var cleaned = String(title).trim();
    if(cleaned.length < 4) return true;
    if(/[,;:]$/.test(cleaned)) return true;
    if(/\b(Or|And|Are|The|A|An|To|In|Of|Not|It|Is|May|Can|Some|Many)$/i.test(cleaned)) return true;
    if(cleaned.split(/\s+/).length < 2) return true;
    return false;
  }

  function isTitleTruncatedFromText(title, text){
    var tWords = normalizeForCompare(title).split(' ').filter(Boolean);
    var sWords = normalizeForCompare(text).split(' ').filter(Boolean);
    if(tWords.length < 2 || tWords.length > 6) return false;
    for(var i = 0; i < tWords.length; i++){
      if(tWords[i] !== sWords[i]) return false;
    }
    return sWords.length > tWords.length;
  }

  function derivePillarTitle(text, index, usedTitles){
    usedTitles = usedTitles || {};
    var candidates = [];
    if(/depend|require|based on|not just/i.test(text)) candidates.push('What This Means');
    if(/observe|look for|recogni|notice|watch/i.test(text)) candidates.push('What to Observe');
    if(/adapt|adjust|respond|change your|modify/i.test(text)) candidates.push('How to Respond');
    if(/not always|may feel|can happen|often|sometimes/i.test(text)) candidates.push('Important Distinction');
    if(/instructor|teach|session|practice/i.test(text)) candidates.push('For Your Session');
    if(/safety|risk|prevent|protect/i.test(text)) candidates.push('Safety Implication');
    if(/swimmer|individual|each person/i.test(text)) candidates.push('For the Swimmer');
    candidates.push('Core Idea', 'Key Point', 'Why It Matters', 'Practical Note', 'What Changes');
    var i, c, norm;
    for(i = 0; i < candidates.length; i++){
      c = candidates[(index + i) % candidates.length];
      norm = normalizeForCompare(c);
      if(!usedTitles[norm]) return c;
    }
    return 'Insight ' + (index + 1);
  }

  function polishInsight(insight){
    if(!insight || !insight.pillars || !insight.pillars.length) return insight;
    var usedTitles = {};
    var polished = [];
    insight.pillars.forEach(function(pillar, idx){
      var title = String(pillar.title || '').trim();
      var text = String(pillar.text || '').trim();
      if(!text) return;

      if(isRedundantWithTitle(insight.title, title) || isBadPillarTitle(title) || isTitleTruncatedFromText(title, text)){
        title = derivePillarTitle(text, idx, usedTitles);
      }

      var guard = 0;
      while((usedTitles[normalizeForCompare(title)] || isRedundantWithTitle(insight.title, title) || isBadPillarTitle(title)) && guard < 12){
        title = derivePillarTitle(text, idx + guard, usedTitles);
        guard++;
      }

      var norm = normalizeForCompare(title);
      if(usedTitles[norm]) return;
      usedTitles[norm] = true;
      polished.push({
        icon: pillar.icon || ICON_CYCLE[polished.length % ICON_CYCLE.length],
        title: title,
        text: text
      });
    });

    insight.pillars = polished.slice(0, 3);
    if(insight.statement && isRedundantWithTitle(insight.title, insight.statement)) insight.statement = '';
    return insight;
  }

  function buildPillarFromPoint(point, iconKey, index, usedTitles){
    var text = stripHtml(point);
    var dashMatch = text.match(/^(.+?)\s*[\u2013\-]\s*(.+)$/);
    if(dashMatch){
      var dashTitle = dashMatch[1].trim();
      if(isBadPillarTitle(dashTitle) || isTitleTruncatedFromText(dashTitle, dashMatch[2])){
        dashTitle = derivePillarTitle(dashMatch[2], index || 0, usedTitles);
      }
      return {
        icon: iconKey,
        title: dashTitle,
        text: dashMatch[2].trim().replace(/[.!?]+$/, '') + '.'
      };
    }
    return buildPillar(text, iconKey, index, usedTitles);
  }

  function buildPillar(text, iconKey, index, usedTitles){
    var title = makePillarTitle(text);
    if(isBadPillarTitle(title) || isTitleTruncatedFromText(title, text)){
      title = derivePillarTitle(text, index || 0, usedTitles);
    }
    return {
      icon: iconKey,
      title: title,
      text: text
    };
  }

  function expandPillarsToThree(pillars){
    var list = pillars.slice();
    var guard = 0;
    while(list.length < 3 && list.length > 0 && guard < 8){
      guard++;
      var longestIdx = 0;
      for(var i = 1; i < list.length; i++){
        if(list[i].text.length > list[longestIdx].text.length) longestIdx = i;
      }
      var sents = splitSentences(list[longestIdx].text);
      if(sents.length >= 2){
        list.splice(longestIdx, 1);
        sents.forEach(function(s){
          list.push(buildPillar(s, ICON_CYCLE[list.length % ICON_CYCLE.length], list.length, {}));
        });
      } else {
        break;
      }
    }
    return list.slice(0, 3);
  }

  function resolveConceptIntroInsight(data, moduleNum, conceptId){
    if(!data) return null;

    if(typeof global.ConceptInsightContent !== 'undefined' && moduleNum && conceptId){
      var curated = global.ConceptInsightContent.get(moduleNum, conceptId);
      if(curated) return polishInsight({ title: curated.title, statement: '', pillars: curated.pillars.slice() });
    }

    if(data.introInsight){
      var manual = {
        title: data.introInsight.title,
        statement: data.introInsight.statement || '',
        pillars: (data.introInsight.pillars || []).slice()
      };
      if(isRedundantWithTitle(manual.title, manual.statement)) manual.statement = '';
      return polishInsight(manual);
    }

    if(data.focus || data.goal){
      var stageTitle = data.title || '';
      var stagePillars = [];
      if(data.focus) stagePillars.push({ icon: 'focus', title: 'Focus at This Level', text: stripHtml(data.focus) });
      if(data.whatThisLooksLike) stagePillars.push({ icon: 'movement', title: 'What It Looks Like', text: stripHtml(data.whatThisLooksLike).replace(/\.\s+/g, '. ').slice(0, 220) });
      if(data.goal) stagePillars.push({ icon: 'shield', title: 'Level Goal', text: stripHtml(data.goal) });
      if(stagePillars.length) return polishInsight({ title: CONCEPT_HEADLINES[stageTitle] || stageTitle, statement: '', pillars: stagePillars.slice(0, 3) });
    }

    var paras = extractParagraphs(data.text || '');
    var points = normalizePoints(data.points);
    if(!paras.length && !points.length) return null;

    var pillars = [];
    var usedTitles = {};
    var title = makeInsightTitle(data.title || '', paras[0] || '', paras[1] || '');

    if(points.length >= 2){
      pillars = points.slice(0, 3).map(function(p, idx){
        return buildPillarFromPoint(p, ICON_CYCLE[idx % ICON_CYCLE.length], idx, usedTitles);
      });
    } else {
      var pillarTexts = collectPillarTexts(paras, '');
      pillarTexts.forEach(function(text){
        pillars.push(buildPillar(text, ICON_CYCLE[pillars.length % ICON_CYCLE.length], pillars.length, usedTitles));
      });
    }

    pillars = expandPillarsToThree(pillars);
    if(!title || !pillars.length) return null;

    return polishInsight({ title: title, statement: '', pillars: pillars });
  }

  function cleanInsightText(text){
    if(text == null) return '';
    return String(text)
      .replace(/\uFFFD/g, '  ')
      .replace(/\u009D/g, '  ')
      .replace(/  +/g, ' ')
      .trim();
  }

  function syncInsightPillarState(panel, introEl){
    if(!panel || !introEl) return;
    var cards = introEl.querySelectorAll('.concept-insight-pillar');
    var total = cards.length;
    var done = introEl.querySelectorAll('.concept-insight-pillar.clicked').length;
    panel.dataset.insightPillarsRequired = total ? 'true' : 'false';
    panel.dataset.insightPillarsDone = (total > 0 && done === total) ? 'true' : 'false';
  }

  function bindInsightPillarInteractions(introEl, panel, opts){
    if(!introEl || !panel) return;
    opts = opts || {};
    var cards = introEl.querySelectorAll('.concept-insight-pillar');
    if(!cards.length){
      panel.dataset.insightPillarsRequired = 'false';
      panel.dataset.insightPillarsDone = 'true';
      return;
    }

    if(opts.restoreComplete){
      cards.forEach(function(card){ card.classList.add('clicked'); });
    }

    cards.forEach(function(card, idx){
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-pressed', card.classList.contains('clicked') ? 'true' : 'false');
      card.setAttribute('data-pillar-index', String(idx));

      function markDone(){
        if(card.classList.contains('clicked')) return;
        card.classList.add('clicked');
        card.setAttribute('aria-pressed', 'true');
        syncInsightPillarState(panel, introEl);
        panel.dispatchEvent(new CustomEvent('concept-insight-pillars-change', { bubbles: true }));
      }

      card.addEventListener('click', markDone);
      card.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          markDone();
        }
      });
    });

    syncInsightPillarState(panel, introEl);
  }

  function areInsightPillarsComplete(panel){
    if(!panel || panel.dataset.insightPillarsRequired !== 'true') return true;
    return panel.dataset.insightPillarsDone === 'true';
  }

  function buildConceptInsightIntroHTML(insight){
    if(!insight) return '';
    var pillarList = insight.pillars || [];
    var pillars = pillarList.map(function(pillar, idx){
      var iconKey = pillar.icon || 'response';
      var iconMarkup = conceptInsightIcons[iconKey] || conceptInsightIcons.response;
      return [
        '<article class="concept-insight-pillar clickable-progress" role="button" tabindex="0" data-pillar-index="' + idx + '" aria-pressed="false">',
          '<div class="concept-insight-pillar__icon">' + iconMarkup + '</div>',
          '<h6 class="concept-insight-pillar__title">' + cleanInsightText(pillar.title) + '</h6>',
          '<p class="concept-insight-pillar__text">' + cleanInsightText(pillar.text) + '</p>',
        '</article>'
      ].join('');
    }).join('');
    var statementHtml = insight.statement
      ? '<p class="concept-insight-intro__statement">' + cleanInsightText(insight.statement) + '</p>'
      : '';
    return [
      '<div class="concept-insight-intro" role="region" aria-labelledby="concept-insight-intro-title">',
        '<h5 class="concept-insight-intro__title" id="concept-insight-intro-title">' + cleanInsightText(insight.title) + '</h5>',
        statementHtml,
        '<p class="cards-review-hint">Read each point below, then click to confirm you\'ve read it.</p>',
        '<div class="concept-insight-intro__cards" data-pillar-count="' + pillarList.length + '">' + pillars + '</div>',
      '</div>'
    ].join('');
  }

  function buildConceptInsightSpeech(insight){
    if(!insight) return '';
    var parts = [insight.title + '.'];
    if(insight.statement) parts.push(insight.statement);
    (insight.pillars || []).forEach(function(pillar){
      parts.push(pillar.title + '. ' + pillar.text);
    });
    return parts.join(' ');
  }

  function getConceptGridMeta(block, target){
    var buttons = Array.from(document.querySelectorAll('[data-concept-grid="' + block + '"] .concept-square[data-target]'));
    var idx = buttons.findIndex(function(button){ return button.dataset.target === target; });
    if(idx < 0) return null;
    return { index: idx + 1, total: buttons.length };
  }

  function restructureConceptPanelHeader(header){
    if(!header) return;

    var h4 = header.querySelector('.concept-panel-title-display h4')
      || header.querySelector('.concept-panel-title-display .concept-panel-title')
      || header.querySelector('.concept-panel-title-stack h4')
      || header.querySelector('.concept-panel-title-stack .concept-panel-title')
      || header.querySelector('h4:not(.concept-section-head)')
      || header.querySelector('.concept-panel-title');
    var tts = header.querySelector('.concept-panel-tts');
    var badge = header.querySelector('[data-concept-meta]') || header.querySelector('.concept-meta-badge');

    var toolbar = header.querySelector('.concept-panel-toolbar');
    if(!toolbar){
      toolbar = document.createElement('div');
      toolbar.className = 'concept-panel-toolbar';
      header.insertBefore(toolbar, header.firstChild);
    }

    var titleDisplay = header.querySelector('.concept-panel-title-display');
    if(!titleDisplay){
      titleDisplay = document.createElement('div');
      titleDisplay.className = 'concept-panel-title-display';
      header.appendChild(titleDisplay);
    }

    if(badge && badge.parentElement !== toolbar) toolbar.appendChild(badge);
    if(h4 && h4.parentElement !== titleDisplay) titleDisplay.appendChild(h4);
    if(tts && tts.parentElement !== titleDisplay) titleDisplay.appendChild(tts);

    if(header.firstElementChild !== toolbar) header.insertBefore(toolbar, header.firstChild);
    if(titleDisplay.parentElement !== header) header.appendChild(titleDisplay);
    else if(header.lastElementChild !== titleDisplay) header.appendChild(titleDisplay);

    header.querySelectorAll('.concept-panel-title-stack').forEach(function(stack){
      if(!stack.querySelector('h4, .concept-panel-title')) stack.remove();
    });

    header.dataset.headerStructured = '3';
  }

  function ensureConceptPanelInsightChrome(panel){
    if(!panel) return;

    var headingRow = panel.querySelector('.concept-heading-row') || panel.querySelector('.concept-panel-title-row');
    if(!headingRow) return;

    if(!headingRow.querySelector('.concept-panel-header')){
      var h4 = headingRow.querySelector('h4') || headingRow.querySelector('.concept-panel-title');
      var tts = headingRow.querySelector('.concept-panel-tts');
      var header = document.createElement('div');
      header.className = 'concept-panel-header';

      var badge = document.createElement('div');
      badge.className = 'concept-meta-badge';
      badge.setAttribute('data-concept-meta', '');
      badge.hidden = true;

      var toolbar = document.createElement('div');
      toolbar.className = 'concept-panel-toolbar';
      toolbar.appendChild(badge);

      var titleDisplay = document.createElement('div');
      titleDisplay.className = 'concept-panel-title-display';
      if(h4) titleDisplay.appendChild(h4);
      if(tts) titleDisplay.appendChild(tts);

      header.appendChild(toolbar);
      header.appendChild(titleDisplay);
      header.dataset.headerStructured = '3';
      headingRow.innerHTML = '';
      headingRow.appendChild(header);
    } else if(!headingRow.querySelector('[data-concept-meta]')){
      var headerEl = headingRow.querySelector('.concept-panel-header');
      var metaBadge = document.createElement('div');
      metaBadge.className = 'concept-meta-badge';
      metaBadge.setAttribute('data-concept-meta', '');
      metaBadge.hidden = true;
      headerEl.appendChild(metaBadge);
    }

    restructureConceptPanelHeader(headingRow.querySelector('.concept-panel-header'));

    if(!panel.querySelector('.concept-intro-slot')){
      var introExisting = panel.querySelector('.concept-panel-desc');
      if(introExisting && !introExisting.classList.contains('concept-intro-slot')){
        introExisting.classList.add('concept-intro-slot');
      } else if(!introExisting){
        var slot = document.createElement('div');
        slot.className = 'concept-intro-slot';
        headingRow.insertAdjacentElement('afterend', slot);
      }
    }

    if(typeof global.TtsControls !== 'undefined'){
      global.TtsControls.normalize(panel);
    }

    panel.dataset.insightChromeReady = '1';
  }

  function updateConceptPanelLayout(panel, block, target, hasInsight){
    if(!panel) return;
    var metaBadge = panel.querySelector('[data-concept-meta]');
    var meta = getConceptGridMeta(block, target);
    if(hasInsight){
      panel.classList.add('concept-panel--insight-layout');
      if(metaBadge && meta){
        metaBadge.textContent = meta.total > 1 ? ('Concept ' + meta.index + ' of ' + meta.total) : ('Concept ' + meta.index);
        metaBadge.hidden = false;
      } else if(metaBadge){
        metaBadge.hidden = true;
        metaBadge.textContent = '';
      }
    } else {
      panel.classList.remove('concept-panel--insight-layout');
      if(metaBadge){
        metaBadge.hidden = true;
        metaBadge.textContent = '';
      }
    }
  }

  function renderConceptIntro(panel, data, moduleNum, conceptId, opts){
    ensureConceptPanelInsightChrome(panel);
    var introEl = panel.querySelector('.concept-intro-slot') || panel.querySelector('.concept-panel-desc');
    if(!introEl) return null;

    var insight = resolveConceptIntroInsight(data, moduleNum, conceptId);
    introEl.className = 'concept-intro-slot';

    if(insight){
      introEl.innerHTML = buildConceptInsightIntroHTML(insight);
      introEl.classList.add('concept-insight-intro-shell');
      bindInsightPillarInteractions(introEl, panel, opts);
    } else {
      introEl.innerHTML = data && data.text ? data.text : '';
      introEl.classList.remove('concept-insight-intro-shell');
      panel.dataset.insightPillarsRequired = 'false';
      panel.dataset.insightPillarsDone = 'true';
    }
    return insight;
  }

  global.ConceptInsightIntro = {
    resolve: resolveConceptIntroInsight,
    buildHTML: buildConceptInsightIntroHTML,
    buildSpeech: buildConceptInsightSpeech,
    getGridMeta: getConceptGridMeta,
    ensurePanelChrome: ensureConceptPanelInsightChrome,
    updatePanelLayout: updateConceptPanelLayout,
    renderIntro: renderConceptIntro,
    bindPillarCards: bindInsightPillarInteractions,
    arePillarsComplete: areInsightPillarsComplete
  };
})(typeof window !== 'undefined' ? window : this);
