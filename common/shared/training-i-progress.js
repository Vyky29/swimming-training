(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.TrainingIProgress = api;
})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var STORAGE_KEY = 'cs_training_i_progress_v1';
  var STORAGE_VERSION = 1;
  var LEGACY_MODULE_KEY = function (n) { return 'swimming_module_' + n + '_progress'; };
  var LEGACY_GUIDED_KEY = 'cs_training_i_guided_flow';

  /**
   * Completion rules (Training I):
   * - Concept: marked reviewed after the learner opens it and its panel is shown
   *   (not by hover or a missed click). Accidental open of one concept never
   *   completes the whole block.
   * - Block: complete only when every concept in that block is reviewed and the
   *   learner confirms the block with the single block-complete control.
   * - Learning outcomes: each outcome card can be marked individually; the
   *   outcomes step completes when all cards are reviewed.
   * - Journey / Recap: complete when the learner confirms that stage.
   * - Module: status becomes completed only after required content steps plus a
   *   submitted quiz that meets QUIZ_PASS_RATIO.
   * - review: only after completed, when the learner re-enters to review.
   */
  var STATUSES = ['not-started', 'in-progress', 'completed', 'review'];
  var QUIZ_PASS_RATIO = 1;

  var MODULES = [
    {
      id: 'module-1',
      number: 1,
      title: 'Understanding the Aquatic Environment',
      blocks: ['block1', 'block2', 'block3']
    },
    {
      id: 'module-2',
      number: 2,
      title: "Understanding the Swimmer's Experience in the Aquatic Environment",
      blocks: ['block1', 'block2', 'block3']
    },
    {
      id: 'module-3',
      number: 3,
      title: 'Building Engagement and Connection in the Water',
      blocks: ['block1', 'block2', 'block3']
    },
    {
      id: 'module-4',
      number: 4,
      title: 'The clubSENsational Swimming Programme',
      blocks: ['block1', 'block2', 'block3', 'block4']
    },
    {
      id: 'module-5',
      number: 5,
      title: 'Using Visual Aids Effectively - PixtoLearn in Action',
      blocks: ['block1', 'block2', 'block3']
    }
  ];

  var STEP_LABELS = {
    journey: 'Journey',
    outcomes: 'Learning Outcomes',
    block1: 'Block 1',
    block2: 'Block 2',
    block3: 'Block 3',
    block4: 'Block 4',
    recap: 'Recap',
    quiz: 'Quiz'
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function emptyModule(def) {
    var steps = { journey: false, outcomes: false, recap: false, quiz: false };
    def.blocks.forEach(function (b) { steps[b] = false; });
    return {
      status: 'not-started',
      startedAt: null,
      completedAt: null,
      steps: steps,
      concepts: {},
      outcomesReviewed: [],
      quiz: { submitted: false, passed: false, score: 0, total: 0 }
    };
  }

  function emptyState() {
    var modules = {};
    MODULES.forEach(function (def) {
      modules[def.id] = emptyModule(def);
    });
    return { version: STORAGE_VERSION, modules: modules };
  }

  function getModuleDef(moduleId) {
    var id = normalizeModuleId(moduleId);
    for (var i = 0; i < MODULES.length; i++) {
      if (MODULES[i].id === id) return MODULES[i];
    }
    return null;
  }

  function normalizeModuleId(moduleId) {
    if (moduleId == null) return 'module-1';
    var raw = String(moduleId);
    if (/^\d+$/.test(raw)) return 'module-' + raw;
    var m = raw.match(/module-(\d+)/);
    if (m) return 'module-' + m[1];
    return raw;
  }

  function countableSteps(moduleId) {
    var def = getModuleDef(moduleId);
    var steps = ['journey', 'outcomes'];
    (def ? def.blocks : ['block1', 'block2', 'block3']).forEach(function (b) {
      steps.push(b);
    });
    steps.push('recap', 'quiz');
    return steps;
  }

  function normalizeStatus(value) {
    return STATUSES.indexOf(value) >= 0 ? value : 'not-started';
  }

  function coerceBool(value) {
    return value === true || value === 'true' || value === 1 || value === '1';
  }

  function normalizeModuleRecord(def, raw) {
    var base = emptyModule(def);
    if (!raw || typeof raw !== 'object') return base;
    var steps = raw.steps && typeof raw.steps === 'object' ? raw.steps : {};
    Object.keys(base.steps).forEach(function (key) {
      base.steps[key] = coerceBool(steps[key]);
    });
    if (coerceBool(steps.keyideas) && !base.steps.recap) base.steps.recap = true;
    if (coerceBool(steps.complete) && !base.steps.recap) {
      /* ignore complete as a countable stand-in */
    }
    base.concepts = {};
    if (raw.concepts && typeof raw.concepts === 'object') {
      Object.keys(raw.concepts).forEach(function (block) {
        var list = raw.concepts[block];
        if (Array.isArray(list)) {
          base.concepts[block] = list.map(String).filter(Boolean);
        }
      });
    }
    if (Array.isArray(raw.outcomesReviewed)) {
      base.outcomesReviewed = raw.outcomesReviewed.map(String);
    }
    if (raw.quiz && typeof raw.quiz === 'object') {
      base.quiz.submitted = coerceBool(raw.quiz.submitted);
      base.quiz.passed = coerceBool(raw.quiz.passed);
      base.quiz.score = Number(raw.quiz.score) || 0;
      base.quiz.total = Number(raw.quiz.total) || 0;
    }
    base.startedAt = raw.startedAt || null;
    base.completedAt = raw.completedAt || null;
    base.status = deriveStatus(def.id, base, raw.status);
    return base;
  }

  function deriveStatus(moduleId, record, storedStatus) {
    if (record.quiz && record.quiz.passed) {
      if (storedStatus === 'review') return 'review';
      return 'completed';
    }
    var steps = countableSteps(moduleId);
    var any = record.status === 'in-progress' || record.startedAt;
    for (var i = 0; i < steps.length; i++) {
      if (record.steps[steps[i]]) any = true;
    }
    if (record.outcomesReviewed && record.outcomesReviewed.length) any = true;
    if (record.concepts) {
      Object.keys(record.concepts).forEach(function (k) {
        if (record.concepts[k] && record.concepts[k].length) any = true;
      });
    }
    if (any) return 'in-progress';
    return 'not-started';
  }

  function validateState(data) {
    if (!data || typeof data !== 'object') return null;
    if (data.version !== STORAGE_VERSION) return null;
    if (!data.modules || typeof data.modules !== 'object') return null;
    var next = emptyState();
    MODULES.forEach(function (def) {
      next.modules[def.id] = normalizeModuleRecord(def, data.modules[def.id]);
    });
    return next;
  }

  function migrateLegacyModule(n, legacy) {
    if (!legacy || typeof legacy !== 'object') return null;
    var def = getModuleDef(n);
    var rec = emptyModule(def);
    var prefix = 'module' + n + '_';
    countableSteps(def.id).forEach(function (step) {
      var aliases = [prefix + step];
      if (step === 'recap') aliases.push(prefix + 'keyideas');
      if (step === 'quiz') aliases.push(prefix + 'quiz');
      aliases.forEach(function (key) {
        if (coerceBool(legacy[key])) rec.steps[step] = true;
      });
    });
    if (coerceBool(legacy[prefix + 'completed']) || coerceBool(legacy[prefix + 'complete'])) {
      rec.steps.quiz = rec.steps.quiz || coerceBool(legacy[prefix + 'quiz']);
    }
    if (coerceBool(legacy[prefix + 'quiz'])) {
      rec.quiz.submitted = true;
      rec.quiz.passed = true;
    }
    rec.status = deriveStatus(def.id, rec, rec.quiz.passed ? 'completed' : null);
    if (rec.status === 'completed') rec.completedAt = rec.completedAt || new Date().toISOString();
    if (rec.status !== 'not-started') rec.startedAt = rec.startedAt || new Date().toISOString();
    return rec;
  }

  function migrateFromLegacy(readRaw) {
    var state = emptyState();
    var found = false;
    MODULES.forEach(function (def) {
      var raw = null;
      try {
        raw = JSON.parse(readRaw(LEGACY_MODULE_KEY(def.number)) || 'null');
      } catch (err) {
        raw = null;
      }
      var migrated = migrateLegacyModule(def.number, raw);
      if (migrated && migrated.status !== 'not-started') {
        state.modules[def.id] = migrated;
        found = true;
      }
    });
    return found ? state : emptyState();
  }

  function createMemoryStorage() {
    var mem = {};
    return {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
      setItem: function (k, v) { mem[k] = String(v); },
      removeItem: function (k) { delete mem[k]; }
    };
  }

  function getStorage(override) {
    if (override) return override;
    try {
      if (typeof localStorage !== 'undefined') return localStorage;
    } catch (err) {}
    return createMemoryStorage();
  }

  var listeners = [];

  function notify(state) {
    listeners.forEach(function (fn) {
      try { fn(clone(state)); } catch (err) {}
    });
  }

  function loadState(storage) {
    var store = getStorage(storage);
    var raw = null;
    try {
      raw = store.getItem(STORAGE_KEY);
    } catch (err) {
      raw = null;
    }
    if (raw) {
      try {
        var parsed = validateState(JSON.parse(raw));
        if (parsed) return parsed;
      } catch (err) {}
    }
    var migrated = migrateFromLegacy(function (key) {
      try { return store.getItem(key); } catch (e) { return null; }
    });
    saveState(migrated, store);
    return migrated;
  }

  function saveState(state, storage) {
    var store = getStorage(storage);
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {}
    notify(state);
    return state;
  }

  function percentFor(record, moduleId) {
    var steps = countableSteps(moduleId);
    var done = steps.filter(function (s) { return !!(record.steps && record.steps[s]); }).length;
    var total = steps.length;
    return {
      done: done,
      total: total,
      percent: total ? Math.round((done / total) * 100) : 0
    };
  }

  function contentComplete(record, moduleId) {
    return countableSteps(moduleId).filter(function (s) { return s !== 'quiz'; }).every(function (s) {
      return !!(record.steps && record.steps[s]);
    });
  }

  function missingContent(record, moduleId) {
    return countableSteps(moduleId).filter(function (s) {
      return s !== 'quiz' && !(record.steps && record.steps[s]);
    });
  }

  function quizUnlocked(record, moduleId) {
    return contentComplete(record, moduleId);
  }

  function nextStep(record, moduleId) {
    var steps = countableSteps(moduleId);
    for (var i = 0; i < steps.length; i++) {
      if (!(record.steps && record.steps[steps[i]])) return steps[i];
    }
    return null;
  }

  function applyStatus(record, moduleId) {
    record.status = deriveStatus(moduleId, record, record.status);
    return record;
  }

  function updateModule(moduleId, mutator, storage) {
    var state = loadState(storage);
    var id = normalizeModuleId(moduleId);
    var def = getModuleDef(id);
    if (!def) return state;
    var rec = normalizeModuleRecord(def, state.modules[id]);
    mutator(rec, def);
    applyStatus(rec, id);
    state.modules[id] = rec;
    return saveState(state, storage);
  }

  var api = {
    STORAGE_KEY: STORAGE_KEY,
    STORAGE_VERSION: STORAGE_VERSION,
    QUIZ_PASS_RATIO: QUIZ_PASS_RATIO,
    STATUSES: STATUSES.slice(),
    MODULES: MODULES,
    STEP_LABELS: STEP_LABELS,
    emptyState: emptyState,
    validateState: validateState,
    countableSteps: countableSteps,
    getModuleDef: getModuleDef,
    normalizeModuleId: normalizeModuleId,
    load: function (storage) { return loadState(storage); },
    save: function (state, storage) { return saveState(validateState(state) || emptyState(), storage); },
    resetAll: function (storage) {
      var store = getStorage(storage);
      var blank = emptyState();
      saveState(blank, store);
      MODULES.forEach(function (def) {
        try { store.removeItem(LEGACY_MODULE_KEY(def.number)); } catch (err) {}
      });
      try { store.removeItem(LEGACY_GUIDED_KEY); } catch (err) {}
      return blank;
    },
    subscribe: function (fn) {
      if (typeof fn === 'function') listeners.push(fn);
      return function () {
        listeners = listeners.filter(function (x) { return x !== fn; });
      };
    },
    getModule: function (moduleId, storage) {
      var id = normalizeModuleId(moduleId);
      var state = loadState(storage);
      return clone(state.modules[id] || emptyModule(getModuleDef(id)));
    },
    getSnapshot: function (moduleId, storage) {
      var id = normalizeModuleId(moduleId);
      var rec = api.getModule(id, storage);
      var counts = percentFor(rec, id);
      return {
        id: id,
        status: rec.status,
        steps: rec.steps,
        concepts: rec.concepts,
        outcomesReviewed: rec.outcomesReviewed,
        quiz: rec.quiz,
        done: counts.done,
        total: counts.total,
        percent: counts.percent,
        nextStep: nextStep(rec, id),
        quizUnlocked: quizUnlocked(rec, id),
        missingContent: missingContent(rec, id),
        contentComplete: contentComplete(rec, id),
        cta: api.ctaLabel(rec.status)
      };
    },
    ctaLabel: function (status) {
      if (status === 'in-progress') return 'Continue Module';
      if (status === 'completed' || status === 'review') return 'Review Module';
      return 'Start Module';
    },
    statusLabel: function (status) {
      if (status === 'in-progress') return 'In progress';
      if (status === 'completed') return 'Completed';
      if (status === 'review') return 'Review';
      return 'Not started';
    },
    startModule: function (moduleId, storage) {
      return updateModule(moduleId, function (rec) {
        if (rec.status === 'completed') {
          rec.status = 'review';
          return;
        }
        if (rec.status === 'review') return;
        if (rec.status === 'not-started') {
          rec.status = 'in-progress';
          rec.startedAt = rec.startedAt || new Date().toISOString();
        }
      }, storage);
    },
    markReview: function (moduleId, storage) {
      return updateModule(moduleId, function (rec) {
        if (rec.quiz && rec.quiz.passed) rec.status = 'review';
      }, storage);
    },
    markStep: function (moduleId, step, done, storage) {
      var key = step === 'keyideas' ? 'recap' : step;
      if (key === 'complete') return loadState(storage);
      return updateModule(moduleId, function (rec, def) {
        if (rec.status === 'not-started') {
          rec.status = 'in-progress';
          rec.startedAt = rec.startedAt || new Date().toISOString();
        }
        if (done !== false) {
          var order = countableSteps(moduleId);
          var idx = order.indexOf(key);
          if (idx > 0) {
            for (var s = 0; s < idx; s++) {
              if (!rec.steps[order[s]]) return;
            }
          }
        }
        if (Object.prototype.hasOwnProperty.call(rec.steps, key)) {
          rec.steps[key] = done !== false;
        } else if (def.blocks.indexOf(key) >= 0) {
          rec.steps[key] = done !== false;
        }
      }, storage);
    },
    markConcept: function (moduleId, block, target, storage) {
      return updateModule(moduleId, function (rec) {
        if (rec.status === 'not-started') {
          rec.status = 'in-progress';
          rec.startedAt = rec.startedAt || new Date().toISOString();
        }
        if (!rec.concepts[block]) rec.concepts[block] = [];
        if (rec.concepts[block].indexOf(target) < 0) rec.concepts[block].push(target);
      }, storage);
    },
    markOutcome: function (moduleId, outcomeId, storage) {
      return updateModule(moduleId, function (rec) {
        if (rec.status === 'not-started') {
          rec.status = 'in-progress';
          rec.startedAt = rec.startedAt || new Date().toISOString();
        }
        var id = String(outcomeId);
        if (rec.outcomesReviewed.indexOf(id) < 0) rec.outcomesReviewed.push(id);
      }, storage);
    },
    submitQuiz: function (moduleId, score, total, storage) {
      var t = Number(total) || 0;
      var s = Number(score) || 0;
      var passed = t > 0 && (s / t) >= QUIZ_PASS_RATIO;
      return updateModule(moduleId, function (rec) {
        rec.quiz = { submitted: true, passed: passed, score: s, total: t };
        rec.steps.quiz = passed;
        if (passed) {
          rec.status = 'completed';
          rec.completedAt = new Date().toISOString();
        }
      }, storage);
    },
    percentFor: percentFor,
    nextStep: function (moduleId, storage) {
      return nextStep(api.getModule(moduleId, storage), normalizeModuleId(moduleId));
    },
    quizUnlocked: function (moduleId, storage) {
      return quizUnlocked(api.getModule(moduleId, storage), normalizeModuleId(moduleId));
    },
    missingContent: function (moduleId, storage) {
      return missingContent(api.getModule(moduleId, storage), normalizeModuleId(moduleId));
    },
    migrateLegacyModule: migrateLegacyModule,
    deriveStatus: function (moduleId, record, stored) {
      return deriveStatus(normalizeModuleId(moduleId), record, stored);
    }
  };

  return api;
});
