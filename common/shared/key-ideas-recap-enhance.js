(function () {
  'use strict';

  var LIGHTBULB_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M9 18h6"/>' +
      '<path d="M10 22h4"/>' +
      '<path d="M8.5 14a5 5 0 1 1 7 0c-.8 1.15-1.28 2.42-1.38 3.75H9.88C9.78 16.42 9.3 15.15 8.5 14z"/>' +
    '</svg>';

  var HINT_COPY = "Read each idea below, then click to confirm you've read it.";

  function enhanceRecapCard(card) {
    if (!card || card.querySelector('.recap-takeaway-card__icon')) return;

    if (!card.getAttribute('role')) card.setAttribute('role', 'button');
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');

    var icon = document.createElement('div');
    icon.className = 'recap-takeaway-card__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = LIGHTBULB_SVG;

    var body = card.querySelector('.recap-takeaway-card__body');
    if (body) card.insertBefore(icon, body);
    else card.insertBefore(icon, card.firstChild);
  }

  function ensureHint(section) {
    if (!section || section.querySelector('.key-ideas-recap__hint')) return;

    var stack = section.querySelector('.recap-stack--key-ideas');
    if (!stack) return;

    var hint = document.createElement('p');
    hint.className = 'key-ideas-recap__hint';
    hint.textContent = HINT_COPY;
    stack.parentNode.insertBefore(hint, stack);
  }

  function enhanceRecapSections() {
    ['recap', 'keyideas'].forEach(function (id) {
      var section = document.getElementById(id);
      if (!section) return;
      ensureHint(section);
      section.querySelectorAll('.recap-takeaway-card').forEach(enhanceRecapCard);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceRecapSections);
  } else {
    enhanceRecapSections();
  }
})();
