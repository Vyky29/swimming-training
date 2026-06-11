(function(global){
  'use strict';

  /**
   * Canonical LMS flow definitions for clubSENsational training pathways.
   * Used by training-flow-guide.js for guided demo (no locks, clear order).
   */
  var TRAINING_I = {
    id: 'training-i',
    hubPath: '/training-i/',
    storageKey: 'cs_training_i_guided_flow',
    modules: [
      {
        id: 'module-1',
        number: 1,
        path: '/training-i/modules/module-1/',
        title: 'Understanding Water',
        sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'complete', 'quiz'],
        blocks: ['block1', 'block2', 'block3'],
        conceptLocks: { b1c4: ['b1c3'] }
      },
      {
        id: 'module-2',
        number: 2,
        path: '/training-i/modules/module-2/',
        title: 'Understanding the Swimmer\'s Experience',
        sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'complete', 'quiz'],
        blocks: ['block1', 'block2', 'block3']
      },
      {
        id: 'module-3',
        number: 3,
        path: '/training-i/modules/module-3/',
        title: 'Building Engagement and Connection',
        sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'complete', 'quiz'],
        blocks: ['block1', 'block2', 'block3']
      },
      {
        id: 'module-4',
        number: 4,
        path: '/training-i/modules/module-4/',
        title: 'clubSENsational Programme',
        sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'block4', 'keyideas', 'quiz'],
        blocks: ['block1', 'block2', 'block3', 'block4'],
        pathwayBlock: 'block3'
      },
      {
        id: 'module-5',
        number: 5,
        path: '/training-i/modules/module-5/',
        title: 'PixtoLearn',
        sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'complete', 'quiz'],
        blocks: ['block1', 'block2', 'block3']
      }
    ]
  };

  var TRAINING_II = {
    id: 'training-ii',
    hubPath: '/training-ii/',
    storageKey: 'cs_training_ii_guided_flow',
    modules: [
      { id: 'introduction', path: '/training-ii/introduction/', title: 'Training Introduction', sections: ['overview'] },
      { id: 'module-1', number: 1, path: '/training-ii/modules/module-1/', title: 'Foundations', sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'complete', 'quiz'], blocks: ['block1', 'block2', 'block3'] },
      { id: 'module-2', number: 2, path: '/training-ii/modules/module-2/', title: 'Scaffolding', sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'quiz'], blocks: ['block1', 'block2', 'block3'] },
      { id: 'module-3', number: 3, path: '/training-ii/modules/module-3/', title: 'Early Experiences', sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'quiz'], blocks: ['block1', 'block2', 'block3'] },
      { id: 'module-4', number: 4, path: '/training-ii/modules/module-4/', title: 'Core Skills', sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'quiz'], blocks: ['block1', 'block2', 'block3'] },
      { id: 'module-5', number: 5, path: '/training-ii/modules/module-5/', title: 'Propulsion', sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'quiz'], blocks: ['block1', 'block2', 'block3'] },
      { id: 'module-6', number: 6, path: '/training-ii/modules/module-6/', title: 'Strokes & Advanced', sections: ['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap', 'quiz'], blocks: ['block1', 'block2', 'block3'] }
    ]
  };

  function detectContext(pathname){
    pathname = pathname || (global.location && global.location.pathname) || '';
    var m;
    m = pathname.match(/\/training-i\/modules\/module-(\d+)\/?/);
    if(m) return { pathway: TRAINING_I, moduleId: 'module-' + m[1] };
    m = pathname.match(/\/training-ii\/modules\/module-(\d+)\/?/);
    if(m) return { pathway: TRAINING_II, moduleId: 'module-' + m[1] };
    if(/\/training-ii\/introduction\/?/.test(pathname)) return { pathway: TRAINING_II, moduleId: 'introduction' };
    if(/\/training-i\/?$/.test(pathname) || /\/swimming-training-i\/?$/.test(pathname)) return { pathway: TRAINING_I, hub: true };
    if(/\/training-ii\/?$/.test(pathname) || /\/swimming-training-ii\/?$/.test(pathname)) return { pathway: TRAINING_II, hub: true };
    return null;
  }

  function getModuleConfig(pathway, moduleId){
    if(!pathway || !moduleId) return null;
    for(var i = 0; i < pathway.modules.length; i++){
      if(pathway.modules[i].id === moduleId) return pathway.modules[i];
    }
    return null;
  }

  global.TrainingFlowConfig = {
    TRAINING_I: TRAINING_I,
    TRAINING_II: TRAINING_II,
    detectContext: detectContext,
    getModuleConfig: getModuleConfig
  };
})(typeof window !== 'undefined' ? window : this);
