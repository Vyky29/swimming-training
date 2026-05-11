/**
 * Parent concept + subconcepts — shared layout helpers for clubSENsational training modules.
 *
 * CANONICAL REFERENCE (Module 2, Block 2, `data-panel-for="block2"`):
 * Static DOM order inside `.concept-panel` (after Back + title row):
 *   1. `.concept-panel-desc` — introduction
 *   2. `[data-concept-intro-media]` — optional hero / infographic (when populated)
 *   3. `[data-concept-primary-image]` — primary media slot (may be empty on some parents)
 *   4. `.concept-points-box` — Key Ideas for Instructors
 *   5. `.concept-insight-box[data-concept-insight]` — optional insight
 *   6. `[data-concept-micro-check]` — optional micro check
 *   7. `[data-concept-why]` — optional why-matters
 *   8. `[data-parent-subconcept-nav]` — subconcept navigation card (hidden until populated)
 *   9. `.concept-media-actions` — expand + Done
 *   10. `.concept-actions` — progress strip
 *
 * Concept data for parents should use `parentSubconceptNavHTML` (legacy: `b2c2StateButtonsHTML`).
 * Subconcept buttons live inside the nav card; wrap grids in `.concept-image` when module CSS
 * scopes factor/approach styles under `.concept-panel .concept-image`.
 *
 * Lock + pin are idempotent and safe on every render (load, refresh, Back).
 */
(function(global){
  function getIntro(panel){
    return panel.querySelector('.concept-panel-desc');
  }
  function getPoints(panel){
    return panel.querySelector('.concept-points-box');
  }
  function getPrimaryImageSlot(panel){
    return panel.querySelector('[data-concept-primary-image]') || panel.querySelector('.concept-image');
  }
  function getSubconceptNav(panel){
    return panel.querySelector('[data-parent-subconcept-nav]');
  }

  /**
   * @param {HTMLElement} panel
   * @returns {boolean} true when this panel includes a subconcept nav mount point
   */
  function panelHasSubconceptNavSlot(panel){
    return !!(panel && panel.querySelector('[data-parent-subconcept-nav]'));
  }

  /**
   * Ensures Introduction → (optional intro media) → primary image slot → Key Ideas at the top
   * of the panel. Does not move the subconcept nav (that is pinned separately).
   * @param {HTMLElement} panel
   */
  function lockIntroductionKeyIdeasPrimaryImage(panel){
    if(!panel) return;
    var intro = getIntro(panel);
    var points = getPoints(panel);
    var image = getPrimaryImageSlot(panel);
    var introMedia = panel.querySelector('[data-concept-intro-media]');
    var nav = getSubconceptNav(panel);
    if(!intro || !points || !image) return;
    if(nav && (nav.contains(image) || nav.contains(intro) || nav.contains(points))) return;
    if(nav && introMedia && nav.contains(introMedia)) return;

    var hasIntroMedia = introMedia && (introMedia.innerHTML || '').trim();
    if(hasIntroMedia){
      intro.insertAdjacentElement('afterend', introMedia);
      introMedia.insertAdjacentElement('afterend', image);
      image.insertAdjacentElement('afterend', points);
    } else {
      intro.insertAdjacentElement('afterend', image);
      image.insertAdjacentElement('afterend', points);
    }
  }

  /**
   * Keeps the subconcept navigation card at the bottom of the concept stack, directly
   * above the media / Done row, so Calm–Alert–Overloaded (and similar) stay grouped.
   * @param {HTMLElement} panel
   */
  function pinSubconceptNavBeforeMediaActions(panel){
    var nav = getSubconceptNav(panel);
    var media = panel.querySelector('.concept-media-actions');
    if(!nav || !media || !media.parentNode) return;
    media.parentNode.insertBefore(nav, media);
  }

  /**
   * Full normalisation for panels that use the shared subconcept slot.
   * @param {HTMLElement} panel
   */
  function lockParentSubconceptOrder(panel){
    lockIntroductionKeyIdeasPrimaryImage(panel);
    pinSubconceptNavBeforeMediaActions(panel);
  }

  /**
   * @param {HTMLElement} panel
   * @returns {string|null} HTML for the nav card from concept data (supports legacy keys)
   */
  function getParentSubconceptNavMarkupFromData(data){
    if(!data) return null;
    if(data.parentSubconceptNavHTML) return String(data.parentSubconceptNavHTML);
    if(data.b2c2StateButtonsHTML) return String(data.b2c2StateButtonsHTML);
    return null;
  }

  global.ParentSubconceptLayout = {
    panelHasSubconceptNavSlot: panelHasSubconceptNavSlot,
    lockIntroductionKeyIdeasPrimaryImage: lockIntroductionKeyIdeasPrimaryImage,
    pinSubconceptNavBeforeMediaActions: pinSubconceptNavBeforeMediaActions,
    lockParentSubconceptOrder: lockParentSubconceptOrder,
    getParentSubconceptNavMarkupFromData: getParentSubconceptNavMarkupFromData,
    getSubconceptNav: getSubconceptNav,
    getPrimaryImageSlot: getPrimaryImageSlot
  };
})(typeof window !== 'undefined' ? window : this);
