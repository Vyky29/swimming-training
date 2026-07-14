/**
 * Upgrade legacy radio .option-grid rows to the shared premium A/B/C/D chrome.
 * Keeps native inputs so existing change handlers continue to work.
 */
(function () {
  'use strict';

  var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function parseLabelParts(label, index) {
    var input = label.querySelector('input');
    var span = label.querySelector(':scope > span:not(.opt-badge):not(.opt-text)') || label.querySelector('span');
    var raw = ((span && span.textContent) || label.textContent || '').replace(/\s+/g, ' ').trim();
    var value = (input && input.value) || '';
    var letter = '';
    var text = raw;
    var isTf = false;

    // True / False (with optional A./B. prefix used in Module 4)
    var tf = raw.match(/^(?:([AB])\s*[.)]\s*)?(True|False)$/i);
    if (tf || /^(true|false|t|f)$/i.test(value)) {
      isTf = true;
      var truthy = tf
        ? /^true$/i.test(tf[2])
        : /^t/i.test(value || raw);
      letter = truthy ? 'T' : 'F';
      text = truthy ? 'True' : 'False';
    } else {
      var m = raw.match(/^([A-Za-z])\s*[.)]\s*(.*)$/);
      if (m) {
        letter = m[1].toUpperCase();
        text = (m[2] || '').trim() || raw;
      } else if (/^[A-Za-z]$/.test(value)) {
        letter = value.toUpperCase();
        text = raw.replace(new RegExp('^' + value + '\\s*[.)]\\s*', 'i'), '').trim() || raw;
      } else {
        // Reflection gates use value="correct"/"wrong" — label by order, not first letter of value
        letter = LETTERS.charAt(index) || String(index + 1);
        text = raw;
      }
    }

    return { input: input, letter: letter, text: text, isTf: isTf };
  }

  function syncSelected(grid) {
    if (!grid) return;
    grid.querySelectorAll('label.option, label.activity-option').forEach(function (label) {
      var input = label.querySelector('input');
      var on = !!(input && input.checked);
      label.classList.toggle('is-selected', on);
    });
  }

  function syncFeedbackClasses(grid) {
    if (!grid) return;
    var root = grid.closest('.concept-activity-interactive, .concept-activity-section, .section-activity-shell, .reflection-gate, .quick-check') || grid.parentElement;
    var feedback = root && root.querySelector('.feedback.show, [data-activity-feedback].show, .activity-feedback');
    var labels = grid.querySelectorAll('label.option, label.activity-option');
    labels.forEach(function (label) {
      label.classList.remove('is-correct', 'is-incorrect');
    });
    if (!feedback) return;
    var good = feedback.classList.contains('good') || feedback.classList.contains('is-correct');
    var warn = feedback.classList.contains('warn') || feedback.classList.contains('is-incorrect');
    labels.forEach(function (label) {
      var input = label.querySelector('input');
      if (!input || !input.checked) return;
      if (good) label.classList.add('is-correct');
      else if (warn) label.classList.add('is-incorrect');
    });
  }

  function enhanceLabel(label, index) {
    if (!label || label.getAttribute('data-premium-option') === '1') return;
    var parts = parseLabelParts(label, index);
    if (!parts.input) return;

    label.setAttribute('data-premium-option', '1');
    label.classList.add('activity-option');
    if (parts.isTf) label.classList.add('activity-option--tf');

    var badge = document.createElement('span');
    badge.className = 'opt-badge';
    badge.setAttribute('aria-hidden', 'true');
    badge.textContent = parts.letter;

    var text = document.createElement('span');
    text.className = 'opt-text';
    text.textContent = parts.text;

    // Keep radio for logic; visually hidden via CSS
    parts.input.classList.add('premium-option-input');
    label.innerHTML = '';
    label.appendChild(parts.input);
    label.appendChild(badge);
    label.appendChild(text);
  }

  function enhanceGrid(grid) {
    if (!grid) return;
    var labels = Array.prototype.slice.call(
      grid.querySelectorAll('label.option, label.activity-option')
    ).filter(function (label) {
      return label.closest('.option-grid') === grid;
    });
    if (!labels.length) return;

    // Re-run safe: enhance any labels not yet upgraded (activity re-inject)
    grid.setAttribute('data-premium-option-grid', '1');
    grid.classList.add('activity-option-grid');

    var tfCount = 0;
    labels.forEach(function (label, index) {
      enhanceLabel(label, index);
      if (label.classList.contains('activity-option--tf')) tfCount++;
    });

    if (grid.classList.contains('option-grid--two') || labels.length === 2 || tfCount >= 2) {
      grid.classList.add('activity-option-grid--two-up');
    }
    if (tfCount >= 2) {
      grid.classList.add('option-grid--tf');
    }

    if (grid.getAttribute('data-premium-option-bound') !== '1') {
      grid.setAttribute('data-premium-option-bound', '1');
      grid.addEventListener('change', function () {
        syncSelected(grid);
        // Wait a tick so module feedback handlers can paint first
        setTimeout(function () {
          syncFeedbackClasses(grid);
        }, 0);
      });
    }

    syncSelected(grid);
    syncFeedbackClasses(grid);
  }

  function scan(root) {
    var scope = root || document;
    var grids = scope.querySelectorAll
      ? scope.querySelectorAll('.option-grid')
      : [];
    grids.forEach(enhanceGrid);
  }

  var observer = null;

  function boot() {
    scan(document);
    if (typeof MutationObserver === 'undefined') return;
    var portal = document.querySelector('.portal') || document.body;
    if (!portal) return;
    observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === 'childList') {
          m.addedNodes.forEach(function (node) {
            if (node.nodeType !== 1) return;
            if (node.matches && node.matches('.option-grid')) enhanceGrid(node);
            else if (node.querySelectorAll) scan(node);
          });
        } else if (m.type === 'attributes' && m.target && m.target.classList) {
          if (m.target.classList.contains('feedback') || m.target.hasAttribute('data-activity-feedback')) {
            var grid = m.target.parentElement && m.target.parentElement.querySelector('.option-grid');
            if (grid) {
              syncSelected(grid);
              syncFeedbackClasses(grid);
            }
          }
        }
      }
    });
    observer.observe(portal, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  window.PremiumOptionGrid = { scan: scan, enhanceGrid: enhanceGrid };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
