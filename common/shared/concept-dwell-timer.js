(function () {
  'use strict';

  function clear(panel) {
    if (!panel) return;
    if (panel._conceptDwellTimer) {
      clearInterval(panel._conceptDwellTimer);
      panel._conceptDwellTimer = null;
    }
    var tid = panel.dataset.conceptDwellTimer;
    if (tid) {
      clearInterval(Number(tid));
      delete panel.dataset.conceptDwellTimer;
    }
  }

  window.ConceptDwellTimer = { clear: clear };
})();
