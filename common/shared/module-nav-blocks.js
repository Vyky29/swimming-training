(function () {
  'use strict';

  function ensureStylesheet() {
    if (document.getElementById('module-nav-blocks-css')) return;
    var link = document.createElement('link');
    link.id = 'module-nav-blocks-css';
    link.rel = 'stylesheet';
    link.href = '/assets/module-nav-blocks.css';
    document.head.appendChild(link);
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function cleanBlockTitle(raw, blockNum) {
    var text = String(raw || '').trim();
    if (!text) return '';
    var stripped = text.replace(new RegExp('^Block\\s+' + blockNum + '\\s*[-\\u2013\\u2014]\\s*', 'i'), '').trim();
    return stripped || text;
  }

  function getBlockTitle(blockNum) {
    var section = document.getElementById('block' + blockNum);
    if (section) {
      var h3 = section.querySelector('.block-title-wrap h3');
      if (h3) return cleanBlockTitle(h3.textContent, blockNum);
    }
    var roadmap = document.querySelector('.journey-item.module-roadmap__item[href="#block' + blockNum + '"] .journey-title');
    if (roadmap) return cleanBlockTitle(roadmap.textContent, blockNum);
    return '';
  }

  function buildBlockNavMarkup(blockNum, title) {
    var name = title || 'Block ' + blockNum;
    return (
      '<span class="nav-link__block-label">Block ' + blockNum + '</span>' +
      '<span class="nav-link__block-name">' + escapeHtml(name) + '</span>'
    );
  }

  function enhanceModuleBlockNav() {
    ensureStylesheet();
    document.querySelectorAll('.nav-link[href^="#block"]').forEach(function (link) {
      if (link.querySelector('.nav-link__block-label')) return;
      var href = link.getAttribute('href') || '';
      var blockNum = href.replace(/^#block/, '');
      if (!blockNum) return;
      var title = getBlockTitle(blockNum) || (link.textContent || '').trim();
      title = cleanBlockTitle(title, blockNum);
      link.classList.add('nav-link--block');
      link.innerHTML = buildBlockNavMarkup(blockNum, title);
    });
  }

  window.enhanceModuleBlockNav = enhanceModuleBlockNav;

  function pinBlockIntroCards() {
    document.querySelectorAll('.block-intro-card').forEach(function (card) {
      card.classList.add('clicked');
      card.classList.remove('clickable-progress');
      card.removeAttribute('role');
      card.removeAttribute('tabindex');
    });
  }

  function initModuleEnhancements() {
    pinBlockIntroCards();
    enhanceModuleBlockNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModuleEnhancements);
  } else {
    initModuleEnhancements();
  }
})();
