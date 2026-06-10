(function () {
  'use strict';

  var DEFAULT_LABELS = {
    keyIdeas: 'Key ideas for instructors',
    activity: 'Activity \u2014 Apply your understanding',
    visual: 'Concept visual'
  };

  /* Lightbulb ù insight / key ideas */
  var KEY_IDEAS_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M9 18h6"/>' +
      '<path d="M10 22h4"/>' +
      '<path d="M12 2a6 6 0 0 0-3.4 10.9c.55.52.9 1.2.9 1.95V16h5V14.85c0-.75.35-1.43.9-1.95A6 6 0 0 0 12 2z"/>' +
    '</svg>';

  /* Clipboard with check ù interactive activity */
  var ACTIVITY_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>' +
      '<rect x="9" y="3" width="6" height="4" rx="1.2"/>' +
      '<path d="m9 13 2 2 4-4.5"/>' +
    '</svg>';

  /* Image frame ù concept visual */
  var VISUAL_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="3" y="5" width="18" height="14" rx="2.2"/>' +
      '<circle cx="8.5" cy="10" r="1.5"/>' +
      '<path d="M21 16 16 11l-4 4-2.5-2.5L3 17"/>' +
    '</svg>';

  var MATCH_LEFT_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M8 6h13"/>' +
      '<path d="M8 12h13"/>' +
      '<path d="M8 18h13"/>' +
      '<path d="M3 6h.01"/>' +
      '<path d="M3 12h.01"/>' +
      '<path d="M3 18h.01"/>' +
    '</svg>';

  var MATCH_RIGHT_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>' +
      '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>' +
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

  function headModifierClass(type) {
    if (type === 'activity') return ' concept-section-head--activity';
    if (type === 'visual') return ' concept-section-head--visual';
    if (type === 'keyIdeas') return ' concept-section-head--key-ideas';
    return '';
  }

  function detectType(iconEl, headEl) {
    if (!iconEl) return '';
    if (iconEl.classList.contains('icon--key-ideas')) return 'keyIdeas';
    if (iconEl.classList.contains('icon--activity')) return 'activity';
    if (iconEl.classList.contains('icon--visual')) return 'visual';

    var text = (iconEl.textContent || '').trim();
    if (EMOJI_TYPES[text]) return EMOJI_TYPES[text];

    var headText = ((headEl && headEl.textContent) || '').toLowerCase();
    if (/key ideas/.test(headText)) return 'keyIdeas';
    if (/activity|check your understanding|apply your understanding/.test(headText)) return 'activity';
    if (/visual|concept image/.test(headText)) return 'visual';
    return '';
  }

  function upgradeIcon(iconEl) {
    if (!iconEl || !iconEl.classList.contains('icon')) return false;

    var headEl = iconEl.closest('.concept-section-head');
    var type = detectType(iconEl, headEl);
    if (!type) return false;

    var mod = modifierClass(type);
    if (iconEl.querySelector('svg') && iconEl.classList.contains(mod)) {
      return false;
    }

    iconEl.className = 'icon ' + mod;
    iconEl.setAttribute('aria-hidden', 'true');
    iconEl.innerHTML = svgFor(type);

    if (headEl && headModifierClass(type)) {
      headEl.classList.add(headModifierClass(type).trim());
    }
    return true;
  }

  function refreshShell(shellEl, type, label) {
    if (!shellEl || !type) return;
    var head = shellEl.querySelector(':scope > .concept-section-head');
    var tag = (head && head.tagName.toLowerCase() === 'span') ? 'span' : 'div';
    var html = headHtml(type, label, tag);
    if (head) head.outerHTML = html;
    else shellEl.insertAdjacentHTML('afterbegin', html);
    scan(shellEl);
  }

  function repairBrokenHeads(root) {
    (root || document).querySelectorAll('[data-concept-activity-title], [data-concept-activity-flow]').forEach(function (shell) {
      var icon = shell.querySelector('.concept-section-head .icon');
      if (!icon || icon.querySelector('svg')) return;
      refreshShell(shell, 'activity');
    });
  }

  function scan(root) {
    var scope = root || document;
    scope.querySelectorAll('.concept-section-head .icon').forEach(upgradeIcon);
    upgradeMatchColumnIcons(scope);
    repairBrokenHeads(scope);
  }

  function resolveLabel(type, label) {
    if (label != null && String(label).trim()) return String(label).trim();
    return DEFAULT_LABELS[type] || '';
  }

  function headHtml(type, label, tagName) {
    tagName = tagName || 'div';
    var resolved = resolveLabel(type, label);
    return (
      '<' + tagName + ' class="concept-section-head' + headModifierClass(type) + '">' +
        '<span class="icon ' + modifierClass(type) + '" aria-hidden="true">' + svgFor(type) + '</span>' +
        '<span>' + resolved + '</span>' +
      '</' + tagName + '>'
    );
  }

  function nestedHeadHtml(type, label) {
    return headHtml(type, label, 'span');
  }

  function headInlineHtml(type, label) {
    return (
      '<span class="icon ' + modifierClass(type) + '" aria-hidden="true">' + svgFor(type) + '</span>' +
      resolveLabel(type, label)
    );
  }

  function matchColumnIconHtml(side) {
    var isRight = String(side || '').toLowerCase() === 'right';
    var mod = isRight ? 'icon--match-right' : 'icon--match-left';
    var svg = isRight ? MATCH_RIGHT_SVG : MATCH_LEFT_SVG;
    return '<span class="match-title-icon icon ' + mod + '" aria-hidden="true">' + svg + '</span>';
  }

  function upgradeMatchColumnIcons(root) {
    (root || document).querySelectorAll('.match-column-title .match-title-icon').forEach(function (el) {
      if (el.querySelector('svg')) return;
      var isRight = !!(el.closest('.match-water') || el.closest('.match-pool'));
      el.className = 'match-title-icon icon ' + (isRight ? 'icon--match-right' : 'icon--match-left');
      el.innerHTML = isRight ? MATCH_RIGHT_SVG : MATCH_LEFT_SVG;
    });
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

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        observer.disconnect();
      } else {
        document.querySelectorAll('.portal').forEach(function (portal) {
          observer.observe(portal, { childList: true, subtree: true });
        });
      }
    });
  }

  window.ConceptSectionIcons = {
    labels: DEFAULT_LABELS,
    svg: svgFor,
    headHtml: headHtml,
    nestedHeadHtml: nestedHeadHtml,
    headInlineHtml: headInlineHtml,
    matchColumnIconHtml: matchColumnIconHtml,
    refreshShell: refreshShell,
    upgrade: upgradeIcon,
    scan: scan
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
