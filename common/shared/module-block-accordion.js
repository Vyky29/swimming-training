(function(global){
  'use strict';

  var STATUS_LABEL = {
    locked: 'Locked',
    not_started: 'Not started',
    in_progress: 'In progress',
    ready: 'Ready',
    complete: 'Complete'
  };
  var VARIANT_CYCLE = ['foundations', 'core', 'pathway', 'progress'];
  var FALLBACK_META = {
    block1: {
      variant: 'foundations',
      kicker: 'Block 1',
      title: 'Programme Foundations',
      text: 'Purpose, values, and the principles that guide every decision beyond technique alone.'
    },
    block2: {
      variant: 'core',
      kicker: 'Block 2',
      title: 'Core Development Areas',
      text: 'Regulation, independence, and learning and engagement across every stage and level.'
    },
    block3: {
      variant: 'pathway',
      kicker: 'Block 3',
      title: 'Program Structure',
      text: 'Three stages and six levels: the pathway from first water contact to structured swimming.'
    },
    block4: {
      variant: 'progress',
      kicker: 'Block 4',
      title: 'Interpreting Progress',
      text: 'How development is read in the programme, and how to use the framework when you plan and review.'
    }
  };

  var BLOCK_PART_ORDER = [];
  var openBlockPart = null;
  var autoAdvanced = {};
  var wired = false;
  var enhanced = false;

  function $(sel, root){
    return (root || document).querySelector(sel);
  }
  function $$(sel, root){
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function cleanText(el){
    if(!el) return '';
    return String(el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function escapeHtml(str){
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function discoverBlockOrder(){
    var sections = $$('.section.gated-block[id^="block"]');
    var keys = sections
      .map(function(sec){ return sec.id; })
      .filter(function(id){ return /^block\d+$/.test(id); });
    keys.sort(function(a, b){
      return (parseInt(a.replace('block', ''), 10) || 0) - (parseInt(b.replace('block', ''), 10) || 0);
    });
    if(!keys.length) keys = ['block1', 'block2', 'block3'];
    BLOCK_PART_ORDER = keys;
    if(openBlockPart && BLOCK_PART_ORDER.indexOf(openBlockPart) < 0) openBlockPart = null;
    api.ORDER = BLOCK_PART_ORDER.slice();
    return BLOCK_PART_ORDER;
  }

  function resolveMeta(key, section, index){
    var fallback = FALLBACK_META[key] || {};
    var attrTitle = section.getAttribute('data-block-title');
    var attrText = section.getAttribute('data-block-text');
    var attrKicker = section.getAttribute('data-block-kicker');
    var attrVariant = section.getAttribute('data-block-variant');

    var pill = cleanText(section.querySelector('.section-top .section-pill'));
    var titleEl = section.querySelector('.block-header .block-title-wrap h3, .block-title-wrap h3, .section-body h3');
    var leadEl = section.querySelector('.section-body > .lead, .section-body .lead');
    var scrapedTitle = cleanText(titleEl);
    var scrapedText = cleanText(leadEl);

    // Prefer explicit body title over "Block N - ..." duplicates in some Training II shells
    if(scrapedTitle && /^block\s*\d+\s*[-:\u2013\u2014]/i.test(scrapedTitle)){
      scrapedTitle = scrapedTitle.replace(/^block\s*\d+\s*[-:\u2013\u2014]\s*/i, '').trim() || scrapedTitle;
    }

    var title = (attrTitle || scrapedTitle || fallback.title || key).trim();
    var text = (attrText || scrapedText || fallback.text || '').trim();
    var kicker = (attrKicker || pill || fallback.kicker || ('Block ' + String(key).replace('block', ''))).trim();
    var variant = (attrVariant || fallback.variant || VARIANT_CYCLE[index % VARIANT_CYCLE.length] || 'foundations').trim();

    return { variant: variant, kicker: kicker, title: title, text: text };
  }

  function isLocked(key){
    var section = document.getElementById(key);
    return !!(section && section.classList.contains('gated-locked'));
  }

  function isStageChecked(key){
    var input = document.querySelector('input[data-stage-check="' + key + '"], input[data-check-for="' + key + '"]');
    return !!(input && input.checked);
  }

  function getConceptProgress(key){
    if(typeof global.getModuleBlockConceptProgress === 'function'){
      return global.getModuleBlockConceptProgress(key);
    }
    var textEl = document.querySelector('[data-mini-text="' + key + '"]');
    if(textEl){
      var m = String(textEl.textContent || '').match(/(\d+)\s+of\s+(\d+)/i);
      if(m){
        return { done: parseInt(m[1], 10) || 0, total: parseInt(m[2], 10) || 0 };
      }
    }
    var buttons = $$('[data-concept-grid="' + key + '"] .concept-square[data-target]');
    if(!buttons.length) return { done: 0, total: 0 };
    var done = buttons.filter(function(btn){ return btn.classList.contains('visited'); }).length;
    return { done: done, total: buttons.length };
  }

  function introCardsStarted(key){
    var cards = $$('[data-block-intro="' + key + '"] .block-intro-card');
    if(!cards.length) return false;
    return cards.some(function(card){ return card.classList.contains('clicked'); });
  }

  function reflectionReady(key){
    var lockBox = document.querySelector('[data-lock-box="' + key + '"]');
    if(lockBox && lockBox.classList.contains('ready')) return true;
    var gate = document.querySelector('[data-gate="' + key + '"]');
    if(gate && gate.classList.contains('open')) return true;
    var progress = getConceptProgress(key);
    return !!(progress.total > 0 && progress.done >= progress.total);
  }

  function isGuidedFlow(){
    return document.documentElement.getAttribute('data-guided-flow') === 'true';
  }

  function getBlockPartState(key){
    if(isLocked(key)) return 'locked';
    if(isStageChecked(key)) return 'complete';
    var progress = getConceptProgress(key);
    var conceptsDone = progress.total > 0 && progress.done >= progress.total;
    if(conceptsDone || reflectionReady(key)) return 'ready';
    if(progress.done > 0 || introCardsStarted(key)) return 'in_progress';
    return 'not_started';
  }

  function enhanceSections(){
    if(enhanced) return;
    enhanced = true;
    discoverBlockOrder();
    BLOCK_PART_ORDER.forEach(function(key, index){
      var section = document.getElementById(key);
      if(!section || !section.classList.contains('gated-block')) return;
      if(section.querySelector('.block-part-head')) return;
      var meta = resolveMeta(key, section, index);
      section.classList.add('block-part', 'block-part--' + meta.variant);
      section.setAttribute('data-block-part', key);

      var body = section.querySelector('.section-body');
      if(!body) return;

      var wrap = document.createElement('div');
      wrap.className = 'block-part-body';
      wrap.id = key + '-body';
      body.parentNode.insertBefore(wrap, body);
      wrap.appendChild(body);

      /* div (not button): Listen/Stop must sit in the head without nesting buttons */
      var head = document.createElement('div');
      head.className = 'block-part-head';
      head.setAttribute('role', 'button');
      head.tabIndex = 0;
      head.setAttribute('aria-expanded', 'false');
      head.setAttribute('aria-controls', wrap.id);
      head.innerHTML =
        '<div class="block-part-head-main">' +
          '<p class="block-part-kicker">' + escapeHtml(meta.kicker) + '</p>' +
          '<h3 class="block-part-title">' + escapeHtml(meta.title) + '</h3>' +
          (meta.text ? '<p class="block-part-text">' + escapeHtml(meta.text) + '</p>' : '') +
        '</div>' +
        '<div class="block-part-head-meta">' +
          '<div class="block-part-head-tts" data-block-part-tts></div>' +
          '<span class="block-part-status" data-block-part-status data-state="not_started">Not started</span>' +
          '<span class="block-part-chevron" aria-hidden="true"></span>' +
        '</div>';
      section.insertBefore(head, wrap);

      var ttsHost = head.querySelector('[data-block-part-tts]');
      var actions = body.querySelector('.block-header .section-top-actions, .block-header .block-tools-inline');
      if(ttsHost && actions){
        while(actions.firstChild) ttsHost.appendChild(actions.firstChild);
        var header = actions.closest('.block-header');
        if(header) header.setAttribute('data-block-header-tts-moved', '1');
      }
    });
  }

  function isHeadTtsTarget(target){
    return !!(target && target.closest && target.closest(
      '.block-part-head-tts, .btn-tts, .btn-tts-inline, .btn-tts-stop-inline, [data-tts-button], [data-tts-stop], [data-concept-tts], [data-concept-tts-stop]'
    ));
  }

  function togglePartFromHead(part){
    var key = part && part.getAttribute('data-block-part');
    if(!key) return;
    if(openBlockPart === key){
      closeAll({ scroll: false });
    } else {
      setOpen(key, { scroll: true });
    }
    refresh({ skipAutoAdvance: true });
  }

  function setOpen(key, opts){
    var options = opts || {};
    if(key && BLOCK_PART_ORDER.indexOf(key) < 0) return;
    openBlockPart = key || null;
    $$('.section.block-part[data-block-part]').forEach(function(part){
      var partKey = part.getAttribute('data-block-part');
      var isOpen = !!(openBlockPart && partKey === openBlockPart);
      part.classList.toggle('is-open', isOpen);
      var btn = part.querySelector('.block-part-head');
      if(btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    if(options.scroll && openBlockPart){
      var el = document.getElementById(openBlockPart);
      if(el && typeof el.scrollIntoView === 'function'){
        try{ el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        catch(_){ el.scrollIntoView(true); }
      }
    }
    try{
      document.dispatchEvent(new CustomEvent('module-block-part-change', {
        bubbles: true,
        detail: { block: openBlockPart, open: !!openBlockPart }
      }));
    }catch(_){}
    if(global.TrainingFlowGuide && typeof global.TrainingFlowGuide.requestRefresh === 'function'){
      global.TrainingFlowGuide.requestRefresh(120);
    } else if(global.TrainingFlowGuide && typeof global.TrainingFlowGuide.scheduleRefresh === 'function'){
      global.TrainingFlowGuide.scheduleRefresh(null, 120);
    } else if(global.TrainingFlowGuide && typeof global.TrainingFlowGuide.refresh === 'function'){
      try{ global.TrainingFlowGuide.refresh(); }catch(_){}
    }
  }

  function closeAll(opts){
    setOpen(null, opts || {});
  }

  function ensureOpen(key, opts){
    if(BLOCK_PART_ORDER.indexOf(key) < 0) return;
    if(openBlockPart !== key) setOpen(key, opts || {});
  }

  function refresh(opts){
    var options = opts || {};
    enhanceSections();
    var states = {};
    BLOCK_PART_ORDER.forEach(function(key){
      states[key] = getBlockPartState(key);
      if(states[key] !== 'complete') autoAdvanced[key] = false;
    });

    $$('.section.block-part[data-block-part]').forEach(function(part){
      var key = part.getAttribute('data-block-part');
      var state = states[key] || 'not_started';
      part.classList.toggle('is-complete', state === 'complete');
      part.classList.toggle('is-ready', state === 'ready');
      var statusEl = part.querySelector('[data-block-part-status]');
      if(statusEl){
        statusEl.setAttribute('data-state', state);
        statusEl.textContent = STATUS_LABEL[state] || 'Not started';
      }
    });

    // Guided flow keeps accordions closed after Done — learner taps the next block head.
    // Outside guided flow, auto-open the next complete?ready block once.
    if(!options.skipAutoAdvance && !isGuidedFlow()){
      var current = openBlockPart;
      var idx = current ? BLOCK_PART_ORDER.indexOf(current) : -1;
      if(
        idx >= 0 &&
        idx < BLOCK_PART_ORDER.length - 1 &&
        states[current] === 'complete' &&
        !autoAdvanced[current]
      ){
        autoAdvanced[current] = true;
        var next = BLOCK_PART_ORDER[idx + 1];
        if(next){
          setOpen(next, { scroll: true });
          return;
        }
      }
    } else if(isGuidedFlow() && openBlockPart && states[openBlockPart] === 'complete'){
      openBlockPart = null;
    }

    // Keep current open/closed state. Do not force-open Block 1 on load.
    if(openBlockPart && BLOCK_PART_ORDER.indexOf(openBlockPart) < 0){
      openBlockPart = null;
    }
    setOpen(openBlockPart, { scroll: false });
  }

  function wire(){
    if(wired) return;
    wired = true;
    enhanceSections();

    $$('.section.block-part[data-block-part]').forEach(function(part){
      var btn = part.querySelector('.block-part-head');
      if(!btn) return;
      btn.addEventListener('click', function(e){
        if(isHeadTtsTarget(e.target)) return;
        togglePartFromHead(part);
      });
      btn.addEventListener('keydown', function(e){
        if(isHeadTtsTarget(e.target)) return;
        if(e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        togglePartFromHead(part);
      });
    });

    document.addEventListener('click', function(e){
      var link = e.target && e.target.closest ? e.target.closest('a[href^="#block"]') : null;
      if(!link) return;
      var href = link.getAttribute('href') || '';
      var key = href.replace(/^#/, '');
      if(BLOCK_PART_ORDER.indexOf(key) < 0) return;
      setTimeout(function(){
        ensureOpen(key, { scroll: true });
        refresh({ skipAutoAdvance: true });
      }, 0);
    });

    // Start fully collapsed — learner opens a block intentionally
    openBlockPart = null;
    refresh({ skipAutoAdvance: true });
  }

  function init(){
    wire();
  }

  var api = {
    init: init,
    refresh: refresh,
    setOpen: setOpen,
    closeAll: closeAll,
    ensureOpen: ensureOpen,
    getState: getBlockPartState,
    getOpen: function(){ return openBlockPart; },
    ORDER: []
  };

  global.ModuleBlockAccordion = api;
})(typeof window !== 'undefined' ? window : this);
