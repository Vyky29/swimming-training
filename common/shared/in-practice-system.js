(function () {
  'use strict';

  var HINT_COPY = "Click to confirm you've read this scenario.";

  var ICON_PENDING =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M9 5h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>' +
      '<path d="M9 3h6v4H9V3z"/>' +
      '<path d="M9 12h6M9 16h4"/>' +
    '</svg>';

  var ICON_DONE =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M20 6L9 17l-5-5"/>' +
    '</svg>';

  function iconHtml(done) {
    return done ? ICON_DONE : ICON_PENDING;
  }

  function shellInnerHtml(done) {
    return (
      '<div class="key-ideas-action__body">' +
        '<div class="key-ideas-action-head">' +
          '<span class="icon" aria-hidden="true">' + iconHtml(!!done) + '</span>' +
          '<div class="key-ideas-action-head__meta">' +
            '<span class="label">In Practice</span>' +
            '<span class="key-ideas-action-hint">' + HINT_COPY + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="text"></div>' +
      '</div>'
    );
  }

  function refreshIcon(actionEl, done) {
    if (!actionEl) return;
    var iconEl = actionEl.querySelector('.icon');
    if (iconEl) iconEl.innerHTML = iconHtml(!!done);
  }

  function ensureStructure(actionEl) {
    if (!actionEl || actionEl.querySelector('.key-ideas-action__body')) return false;

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

    var hint = actionEl.querySelector('.key-ideas-action-hint');
    if (!hint) {
      var meta = actionEl.querySelector('.key-ideas-action-head__meta');
      if (meta) {
        hint = document.createElement('span');
        hint.className = 'key-ideas-action-hint';
        hint.textContent = HINT_COPY;
        meta.appendChild(hint);
      }
    }

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
      attributes: true,
      attributeFilter: ['hidden', 'class']
    });
  }

  window.InPracticeSystem = {
    iconHtml: iconHtml,
    shellInnerHtml: shellInnerHtml,
    refreshIcon: refreshIcon,
    ensureStructure: ensureStructure,
    enhanceAction: enhanceAction
  };

  window.inPracticeActionIconHtml = iconHtml;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
