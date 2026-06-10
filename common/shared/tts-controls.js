(function(global){
  'use strict';

  var LISTEN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
  var STOP_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>';

  function isStopButton(btn){
    return btn.hasAttribute('data-tts-stop')
      || btn.hasAttribute('data-concept-tts-stop')
      || btn.classList.contains('btn-tts-stop-inline');
  }

  function isListenButton(btn){
    return btn.hasAttribute('data-tts-button')
      || btn.hasAttribute('data-concept-tts')
      || (btn.classList.contains('btn-tts-inline') && !isStopButton(btn));
  }

  function applyButtonMarkup(btn, isStop){
    if(btn.dataset.ttsStyled === '1') return;
    btn.dataset.ttsStyled = '1';
    var icon = isStop ? STOP_ICON : LISTEN_ICON;
    var label = isStop ? 'Stop' : 'Listen';
    btn.innerHTML = '<span class="btn-tts__icon" aria-hidden="true">' + icon + '</span><span class="btn-tts__label">' + label + '</span>';
    if(!btn.classList.contains('btn-tts') && !btn.classList.contains('btn-tts-inline') && !btn.classList.contains('btn-tts-stop-inline')){
      btn.classList.add(isStop ? 'btn-tts-stop-inline' : 'btn-tts-inline');
    }
    if(isStop && btn.classList.contains('btn-tts-inline')){
      btn.classList.remove('btn-tts-inline');
      btn.classList.add('btn-tts-stop-inline');
    }
  }

  function normalize(root){
    root = root || document;
    var seen = typeof WeakSet !== 'undefined' ? new WeakSet() : null;
    var list = root.querySelectorAll(
      '[data-tts-button], [data-concept-tts], [data-tts-stop], [data-concept-tts-stop], .btn-tts-inline, .btn-tts-stop-inline, .btn.btn-tts'
    );
    list.forEach(function(btn){
      if(seen){
        if(seen.has(btn)) return;
        seen.add(btn);
      }
      applyButtonMarkup(btn, isStopButton(btn));
    });
  }

  global.TtsControls = {
    normalize: normalize,
    icons: { listen: LISTEN_ICON, stop: STOP_ICON }
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ normalize(document); });
  } else {
    normalize(document);
  }
})(typeof window !== 'undefined' ? window : this);
