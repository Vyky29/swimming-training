(function () {
  'use strict';

  var HINT_COPY = "Click to confirm you've read this scenario.";

  var ICON_POOL =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M4 9h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z"/>' +
      '<path d="M2 13c1.6-.9 3.2-.9 4.8 0s3.2.9 4.8 0 3.2-.9 4.8 0 3.2.9 4.8 0"/>' +
      '<path d="M8 9V7M12 9V7M16 9V7"/>' +
    '</svg>';

  var ICON_DONE =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M20 6L9 17l-5-5"/>' +
    '</svg>';

  var WAVE_SVG =
    '<svg class="key-ideas-action__wave-svg" viewBox="0 0 240 120" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M0 72c20-12 40-12 60 0s40 12 60 0 40-12 60 0 40 12 60 0v48H0z" opacity=".55"/>' +
      '<path fill="currentColor" d="M0 88c24-10 48-10 72 0s48 10 72 0 48-10 72 0 48 10 72 0v32H0z" opacity=".35"/>' +
    '</svg>';

  function iconHtml(done) {
    return done ? ICON_DONE : ICON_POOL;
  }

  function shellInnerHtml(done) {
    return (
      '<div class="key-ideas-action__body">' +
        '<div class="key-ideas-action__wave">' + WAVE_SVG + '</div>' +
        '<div class="key-ideas-action__content">' +
          '<div class="key-ideas-action-head">' +
            '<span class="icon" aria-hidden="true">' + iconHtml(!!done) + '</span>' +
            '<div class="key-ideas-action-head__meta">' +
              '<span class="label">In Practice</span>' +
              '<span class="key-ideas-action-hint">' + HINT_COPY + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="key-ideas-action__scenario">' +
            '<p class="text"></p>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function resolveCopy(actionEl, fallback) {
    var panel = actionEl && actionEl.closest('.concept-panel');
    var target = panel && panel.dataset.currentTarget;
    if (window.InPracticeCopy && typeof InPracticeCopy.resolve === 'function') {
      return InPracticeCopy.resolve(target, fallback);
    }
    return fallback || '';
  }

  function applyScenarioCopy(actionEl) {
    if (!actionEl) return;
    var textEl = actionEl.querySelector('.text');
    if (!textEl) return;
    var current = (textEl.textContent || '').trim();
    if (!current) return;
    var refined = resolveCopy(actionEl, current);
    if (refined && refined !== current) textEl.textContent = refined;
    else if (refined) textEl.textContent = refined;
  }

  function refreshIcon(actionEl, done) {
    if (!actionEl) return;
    var iconEl = actionEl.querySelector('.icon');
    if (iconEl) iconEl.innerHTML = iconHtml(!!done);
  }

  function ensureStructure(actionEl) {
    if (!actionEl || actionEl.querySelector('.key-ideas-action__content')) return false;

    var textEl = actionEl.querySelector('.text');
    var text = textEl ? textEl.textContent : '';
    var done = actionEl.classList.contains('is-completed');

    actionEl.innerHTML = shellInnerHtml(done);
    textEl = actionEl.querySelector('.text');
    if (textEl && text) textEl.textContent = text;

    actionEl.setAttribute('role', 'button');
    if (!actionEl.hasAttribute('tabindex')) actionEl.setAttribute('tabindex', '0');
    return true;
  }

  function enhanceAction(actionEl) {
    if (!actionEl || !actionEl.classList.contains('key-ideas-action')) return;
    if (actionEl.hasAttribute('hidden')) return;

    ensureStructure(actionEl);

    if (!actionEl.getAttribute('role')) actionEl.setAttribute('role', 'button');
    if (!actionEl.hasAttribute('tabindex')) actionEl.setAttribute('tabindex', '0');

    var wave = actionEl.querySelector('.key-ideas-action__wave');
    if (!wave) {
      var body = actionEl.querySelector('.key-ideas-action__body') || actionEl;
      wave = document.createElement('div');
      wave.className = 'key-ideas-action__wave';
      wave.innerHTML = WAVE_SVG;
      body.insertBefore(wave, body.firstChild);
    }

    var scenario = actionEl.querySelector('.key-ideas-action__scenario');
    var textEl = actionEl.querySelector('.text');
    if (textEl && scenario && textEl.parentElement !== scenario) {
      scenario.appendChild(textEl);
    }

    applyScenarioCopy(actionEl);
    refreshIcon(actionEl, actionEl.classList.contains('is-completed'));
  }

  function scan(root) {
    (root || document).querySelectorAll('.key-ideas-action:not([hidden])').forEach(enhanceAction);
  }

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'attributes' && mutation.target.classList && mutation.target.classList.contains('key-ideas-action')) {
        enhanceAction(mutation.target);
        return;
      }

      if (mutation.type === 'characterData' || mutation.type === 'childList') {
        var action = mutation.target.closest && mutation.target.closest('.key-ideas-action');
        if (action) {
          setTimeout(function () { enhanceAction(action); }, 0);
        }
      }

      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        if (node.classList && node.classList.contains('key-ideas-action')) enhanceAction(node);
        else if (node.querySelectorAll) node.querySelectorAll('.key-ideas-action').forEach(enhanceAction);
      });
    });
  });

  function boot() {
    var root = document.querySelector('.portal') || document.body;
    scan(root);
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['hidden', 'class']
    });
  }

  window.InPracticeSystem = {
    iconHtml: iconHtml,
    shellInnerHtml: shellInnerHtml,
    refreshIcon: refreshIcon,
    ensureStructure: ensureStructure,
    enhanceAction: enhanceAction,
    applyScenarioCopy: applyScenarioCopy,
    resolveCopy: resolveCopy
  };

  window.inPracticeActionIconHtml = iconHtml;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
