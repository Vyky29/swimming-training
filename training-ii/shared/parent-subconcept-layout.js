/**
 * Parent concept + subconcepts — shared layout helpers for clubSENsational training modules.
 *
 * CANONICAL SECTION ORDER (after title row):
 *   1. Introduction (.concept-intro-slot or .concept-panel-desc)
 *   2. Optional intro media ([data-concept-intro-media])
 *   3. Visual image slot (.concept-image / [data-concept-primary-image], or .concept-slide-block)
 *   4. Key Ideas for Instructors (.concept-points-box)
 *   5. Activity shell ([data-concept-activity-title] / [data-concept-activity-flow])
 *   6. Optional insight / micro-check / why blocks
 *   7. Subconcept navigation ([data-parent-subconcept-nav])
 *   8. Media actions + progress row
 */
(function(global){
  function getIntro(panel){
    if(!panel) return null;
    var slot = panel.querySelector('.concept-intro-slot');
    if(slot) return slot;
    var desc = panel.querySelector('.concept-panel-desc');
    if(desc) return desc;
    var heading = panel.querySelector('.concept-heading-row');
    if(heading){
      var next = heading.nextElementSibling;
      if(next && next.tagName === 'P' && !next.closest('.concept-points-box')) return next;
    }
    return null;
  }

  function getPoints(panel){
    return panel ? panel.querySelector('.concept-points-box') : null;
  }

  function getPrimaryImageSlot(panel){
    if(!panel) return null;
    var image = panel.querySelector('[data-concept-primary-image]') || panel.querySelector('.concept-image');
    if(!image) return null;
    var slideBlock = image.closest('.concept-slide-block');
    if(slideBlock && slideBlock.parentNode === panel) return slideBlock;
    return image;
  }

  function getSubconceptNav(panel){
    return panel ? panel.querySelector('[data-parent-subconcept-nav]') : null;
  }

  function getActivityShell(panel){
    if(!panel) return null;
    return panel.querySelector('[data-concept-activity-title]') || panel.querySelector('[data-concept-activity-flow]');
  }

  function panelHasSubconceptNavSlot(panel){
    return !!(panel && panel.querySelector('[data-parent-subconcept-nav]'));
  }

  function chainAfter(anchor, el){
    if(!anchor || !el || anchor === el) return anchor;
    anchor.insertAdjacentElement('afterend', el);
    return el;
  }

  function isInsideNav(nav, node){
    return !!(nav && node && nav.contains(node));
  }

  /**
   * Ensures Introduction → visual → Key Ideas → Activity at the top of the concept stack.
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
    if(isInsideNav(nav, image) || isInsideNav(nav, intro) || isInsideNav(nav, points)) return;
    if(isInsideNav(nav, introMedia)) return;

    var anchor = intro;
    if(introMedia && (introMedia.innerHTML || '').trim()){
      anchor = chainAfter(anchor, introMedia);
    }
    anchor = chainAfter(anchor, image);
    chainAfter(anchor, points);
  }

  /**
   * Full concept section order including activity and footer controls.
   * @param {HTMLElement} panel
   */
  function lockStandardConceptOrder(panel){
    if(!panel) return;

    var nav = getSubconceptNav(panel);
    if(nav && nav.parentNode === panel){
      lockIntroductionKeyIdeasPrimaryImage(panel);
      pinSubconceptNavBeforeMediaActions(panel);
    }

    var intro = getIntro(panel);
    if(!intro || intro.parentNode !== panel) return;

    var introMedia = panel.querySelector('[data-concept-intro-media]');
    var image = getPrimaryImageSlot(panel);
    var points = getPoints(panel);
    var activity = getActivityShell(panel);
    var insight = panel.querySelector('[data-concept-insight]');
    var micro = panel.querySelector('[data-concept-micro-check]');
    var why = panel.querySelector('[data-concept-why]');
    var media = panel.querySelector('.concept-media-actions');
    var actions = panel.querySelector('.concept-actions');

    if(isInsideNav(nav, intro) || isInsideNav(nav, image) || isInsideNav(nav, points)) return;

    var anchor = intro;
    if(introMedia && (introMedia.innerHTML || '').trim() && !isInsideNav(nav, introMedia)){
      anchor = chainAfter(anchor, introMedia);
    }
    if(image && !isInsideNav(nav, image)) anchor = chainAfter(anchor, image);
    if(points && !isInsideNav(nav, points)) anchor = chainAfter(anchor, points);
    if(activity && activity.parentNode === panel) anchor = chainAfter(anchor, activity);
    if(insight && insight.parentNode === panel) anchor = chainAfter(anchor, insight);
    if(micro && micro.parentNode === panel) anchor = chainAfter(anchor, micro);
    if(why && why.parentNode === panel) anchor = chainAfter(anchor, why);
    if(nav && nav.parentNode === panel) anchor = chainAfter(anchor, nav);
    if(media && media.parentNode === panel) anchor = chainAfter(anchor, media);
    if(actions && actions.parentNode === panel) chainAfter(anchor, actions);
  }

  function pinSubconceptNavBeforeMediaActions(panel){
    var nav = getSubconceptNav(panel);
    var media = panel ? panel.querySelector('.concept-media-actions') : null;
    if(!nav || !media || !media.parentNode) return;
    media.parentNode.insertBefore(nav, media);
  }

  function lockParentSubconceptOrder(panel){
    lockStandardConceptOrder(panel);
  }

  function getParentSubconceptNavMarkupFromData(data){
    if(!data) return null;
    if(data.parentSubconceptNavHTML) return String(data.parentSubconceptNavHTML);
    if(data.b2c2StateButtonsHTML) return String(data.b2c2StateButtonsHTML);
    return null;
  }

  function isParentConceptData(data){
    if(!data) return false;
    if(getParentSubconceptNavMarkupFromData(data)) return true;
    var html = String(data.imageHTML || '') + String(data.introMediaHTML || '');
    return /data-overview-subtarget|data-parent-subtarget|b3c3-overview-step|b3c2-subconcepts|concept-grid--factors|concept-grid--approaches|parentSubconceptNavHTML/.test(html);
  }

  /** Mark main-grid concept squares that open a parent hub (subconcept chooser). */
  function markParentConceptSquares(conceptContent){
    if(!conceptContent) return;
    Object.keys(conceptContent).forEach(function(key){
      if(!isParentConceptData(conceptContent[key])) return;
      document.querySelectorAll('.concept-grid > .concept-square[data-target="' + key + '"]').forEach(function(btn){
        if(btn.closest('.concept-panel')) return;
        btn.classList.add('concept-square--parent');
      });
    });
  }

  global.ParentSubconceptLayout = {
    panelHasSubconceptNavSlot: panelHasSubconceptNavSlot,
    lockIntroductionKeyIdeasPrimaryImage: lockIntroductionKeyIdeasPrimaryImage,
    lockStandardConceptOrder: lockStandardConceptOrder,
    pinSubconceptNavBeforeMediaActions: pinSubconceptNavBeforeMediaActions,
    lockParentSubconceptOrder: lockParentSubconceptOrder,
    getParentSubconceptNavMarkupFromData: getParentSubconceptNavMarkupFromData,
    isParentConceptData: isParentConceptData,
    markParentConceptSquares: markParentConceptSquares,
    getSubconceptNav: getSubconceptNav,
    getPrimaryImageSlot: getPrimaryImageSlot,
    getIntro: getIntro
  };
})(typeof window !== 'undefined' ? window : this);
