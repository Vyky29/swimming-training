(function () {
  'use strict';

  var KEY_IDEAS_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M9 18h6"/>' +
      '<path d="M10 22h4"/>' +
      '<path d="M8.5 14a5 5 0 1 1 7 0c-.8 1.15-1.28 2.42-1.38 3.75H9.88C9.78 16.42 9.3 15.15 8.5 14z"/>' +
    '</svg>';

  var ACTIVITY_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="6" y="4.5" width="12" height="15" rx="2"/>' +
      '<path d="M9 4V2.8h6V4"/>' +
      '<path d="M8.5 10h7"/>' +
      '<path d="M8.5 14h4.5"/>' +
    '</svg>';

  var VISUAL_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/>' +
      '<circle cx="9" cy="10" r="1.35"/>' +
      '<path d="M20.5 16.5 15 11l-3.5 3.5-2-2-5.5 5.5"/>' +
    '</svg>';

  var EMOJI_TYPES = {
    '\u{1F9E9}': 'keyIdeas',
    '\u2705': 'activity',
    '\u2713': 'activity',
    '\u{1F5BC}\uFE0F': 'visual',
    '\u{1F5BC}': 'visual'
  };

  function svgFor(type) {
    if (type === 'keyIdeas') return KEY_IDEAS_SVG;
    if (type === 'activity') return ACTIVITY_SVG;
    if (type === 'visual') return VISUAL_SVG;
    return '';
  }

  function modifierClass(type) {
    if (type === 'keyIdeas') return 'icon--key-ideas';
    if (type === 'activity') return 'icon--activity';
    if (type === 'visual') return 'icon--visual';
    return '';
  }

  function detectType(iconEl, headEl) {
    if (!iconEl) return '';
    if (iconEl.classList.contains('icon--key-ideas')) return 'keyIdeas';
    if (iconEl.classList.contains('icon--activity')) return 'icon--activity';
    if (iconEl.classList.contains('icon--visual')) return 'visual';

    var text = (iconEl.textContent || '').trim();
    if (EMOJI_TYPES[text]) return EMOJI_TYPES[text];

    var headText = ((headEl && headEl.textContent) || '').toLowerCase();
    if (/key ideas/.test(headText)) return 'keyIdeas';
    if (/activity/.test(headText)) return 'activity';
    if (/visual|concept image/.test(headText)) return 'visual';
    return '';
  }

  function upgradeIcon(iconEl) {
    if (!iconEl || !iconEl.classList.contains('icon')) return false;

    var headEl = iconEl.closest('.concept-section-head');
    var type = detectType(iconEl, headEl);
    if (!type) return false;

    if (iconEl.querySelector('svg') && iconEl.classList.contains(modifierClass(type))) {
      return false;
    }

    iconEl.className = 'icon ' + modifierClass(type);
    iconEl.setAttribute('aria-hidden', 'true');
    iconEl.innerHTML = svgFor(type);
    return true;
  }

  function scan(root) {
    (root || document).querySelectorAll('.concept-section-head .icon').forEach(upgradeIcon);
  }

  function headHtml(type, label, tagName) {
    tagName = tagName || 'div';
    return (
      '<' + tagName + ' class="concept-section-head">' +
        '<span class="icon ' + modifierClass(type) + '" aria-hidden="true">' + svgFor(type) + '</span>' +
        '<span>' + label + '</span>' +
      '</' + tagName + '>'
    );
  }

  function nestedHeadHtml(type, label) {
    return headHtml(type, label, 'span');
  }

  function headInlineHtml(type, label) {
    return (
      '<span class="icon ' + modifierClass(type) + '" aria-hidden="true">' + svgFor(type) + '</span>' +
      label
    );
  }

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        if (node.matches && node.matches('.concept-section-head .icon')) upgradeIcon(node);
        else if (node.querySelectorAll) scan(node);
      });
    });
  });

  function boot() {
    scan();
    document.querySelectorAll('.portal').forEach(function (portal) {
      observer.observe(portal, { childList: true, subtree: true });
    });
  }

  window.ConceptSectionIcons = {
    svg: svgFor,
    headHtml: headHtml,
    nestedHeadHtml: nestedHeadHtml,
    headInlineHtml: headInlineHtml,
    upgrade: upgradeIcon,
    scan: scan
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
