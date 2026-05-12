/**
 * Parent concept + subconcepts — shared layout helpers for clubSENsational training modules.
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

 function panelHasSubconceptNavSlot(panel){
  return !!(panel && panel.querySelector('[data-parent-subconcept-nav]'));
 }

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

 function pinSubconceptNavBeforeMediaActions(panel){
  var nav = getSubconceptNav(panel);
  var media = panel.querySelector('.concept-media-actions');
  if(!nav || !media || !media.parentNode) return;
  media.parentNode.insertBefore(nav, media);
 }

 function lockParentSubconceptOrder(panel){
  lockIntroductionKeyIdeasPrimaryImage(panel);
  pinSubconceptNavBeforeMediaActions(panel);
 }

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
