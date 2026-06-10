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

  function makeShortTitle(text, maxWords){
    maxWords = maxWords || 3;
    var cleaned = String(text || '').replace(/[.!?]+$/, '').trim();
    var parts = cleaned.split(/\s+/).slice(0, maxWords);
    return parts.map(function(w){ return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
  }

  function makeInsightTitle(conceptTitle, firstPara, secondPara){
    if(secondPara){
      var secondSents = splitSentences(secondPara);
      var hook = secondSents[0] || '';
      if(/^(It is|This means|These|Understanding|Recognising|For many|Some|Not all|Even when|As swimmers|A swimmer|In many cases)/i.test(firstPara) && hook){
        hook = hook.replace(/\.$/, '');
        if(hook.length <= 72) return hook;
      }
    }
    var first = splitSentences(firstPara)[0] || conceptTitle || '';
    first = first.replace(/^(In water|When entering water|When|For many|Some|Not all|The way|Learning|Entering|As swimmers|Even when|A swimmer|An|A|The)\s*,?\s*/i, '');
    first = first.replace(/\.$/, '');
    if(first.length > 72){
      first = makeShortTitle(first, 6);
    }
    return first;
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

  function buildPillar(text, iconKey){
    return {
      icon: iconKey,
      title: makeShortTitle(text, 3),
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
          list.push(buildPillar(s, ICON_CYCLE[list.length % ICON_CYCLE.length]));
        });
      } else {
        break;
      }
    }
    return list.slice(0, 3);
  }

  function resolveConceptIntroInsight(data){
    if(!data) return null;
    if(data.introInsight) return data.introInsight;

    var paras = extractParagraphs(data.text || '');
    var points = normalizePoints(data.points);
    if(!paras.length && !points.length) return null;

    var pillars = [];
    var statement = '';
    var title = '';

    if(paras.length >= 2){
      title = makeInsightTitle(data.title, paras[0], paras[1]);
      statement = paras[0];
      for(var i = 1; i < paras.length; i++){
        var sents = splitSentences(paras[i]);
        sents.forEach(function(s){
          pillars.push(buildPillar(s, ICON_CYCLE[pillars.length % ICON_CYCLE.length]));
        });
      }
    } else if(paras.length === 1){
      var allSents = splitSentences(paras[0]);
      title = makeInsightTitle(data.title, allSents[0] || paras[0], allSents[1] || '');
      statement = allSents[0] || paras[0];
      for(var j = 1; j < allSents.length; j++){
        pillars.push(buildPillar(allSents[j], ICON_CYCLE[pillars.length % ICON_CYCLE.length]));
      }
    }

    for(var k = 0; k < points.length && pillars.length < 6; k++){
      pillars.push(buildPillar(points[k], ICON_CYCLE[pillars.length % ICON_CYCLE.length]));
    }

    if(!statement && points.length){
      title = makeInsightTitle(data.title, points[0], points[1] || '');
      statement = points[0];
      pillars = pillars.filter(function(p){ return p.text !== statement; });
    }

    pillars = expandPillarsToThree(pillars);

    if(!statement || !pillars.length) return null;

    return {
      title: title,
      statement: statement,
      pillars: pillars
    };
  }

  function buildConceptInsightIntroHTML(insight){
    if(!insight) return '';
    var pillars = (insight.pillars || []).map(function(pillar){
      var iconKey = pillar.icon || 'response';
      var iconMarkup = conceptInsightIcons[iconKey] || conceptInsightIcons.response;
      return [
        '<article class="concept-insight-pillar">',
          '<div class="concept-insight-pillar__icon">' + iconMarkup + '</div>',
          '<h6 class="concept-insight-pillar__title">' + pillar.title + '</h6>',
          '<p class="concept-insight-pillar__text">' + pillar.text + '</p>',
        '</article>'
      ].join('');
    }).join('');
    return [
      '<div class="concept-insight-intro" role="region" aria-labelledby="concept-insight-intro-title">',
        '<h5 class="concept-insight-intro__title" id="concept-insight-intro-title">' + insight.title + '</h5>',
        '<p class="concept-insight-intro__statement">' + insight.statement + '</p>',
        '<div class="concept-insight-intro__cards">' + pillars + '</div>',
      '</div>'
    ].join('');
  }

  function buildConceptInsightSpeech(insight){
    if(!insight) return '';
    var parts = [insight.title + '.', insight.statement];
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

  function ensureConceptPanelInsightChrome(panel){
    if(!panel || panel.dataset.insightChromeReady === '1') return;
    panel.dataset.insightChromeReady = '1';

    var headingRow = panel.querySelector('.concept-heading-row') || panel.querySelector('.concept-panel-title-row');
    if(!headingRow) return;

    if(!headingRow.querySelector('.concept-panel-header')){
      var h4 = headingRow.querySelector('h4') || headingRow.querySelector('.concept-panel-title');
      var tts = headingRow.querySelector('.concept-panel-tts');
      var header = document.createElement('div');
      header.className = 'concept-panel-header';
      var stack = document.createElement('div');
      stack.className = 'concept-panel-title-stack';
      if(h4) stack.appendChild(h4);
      if(tts) stack.appendChild(tts);
      header.appendChild(stack);
      var badge = document.createElement('div');
      badge.className = 'concept-meta-badge';
      badge.setAttribute('data-concept-meta', '');
      badge.hidden = true;
      header.appendChild(badge);
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

    var intro = panel.querySelector('.concept-intro-slot') || panel.querySelector('.concept-panel-desc');
    if(intro && !intro.classList.contains('concept-intro-slot')){
      intro.classList.add('concept-intro-slot');
    } else if(!intro){
      var slot = document.createElement('div');
      slot.className = 'concept-intro-slot';
      headingRow.insertAdjacentElement('afterend', slot);
    }
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

  function renderConceptIntro(panel, data){
    ensureConceptPanelInsightChrome(panel);
    var introEl = panel.querySelector('.concept-intro-slot') || panel.querySelector('.concept-panel-desc');
    if(!introEl) return null;

    var insight = resolveConceptIntroInsight(data);
    introEl.className = 'concept-intro-slot';

    if(insight){
      introEl.innerHTML = buildConceptInsightIntroHTML(insight);
      introEl.classList.add('concept-insight-intro-shell');
    } else {
      introEl.innerHTML = data && data.text ? data.text : '';
      introEl.classList.remove('concept-insight-intro-shell');
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
    renderIntro: renderConceptIntro
  };
})(typeof window !== 'undefined' ? window : this);
