/**
 * Exhaustive smoke of the Training I click order.
 * Run: node scripts/flow-smoke.mjs
 *
 * ENGINE checks the guide already in training-flow-guide.js.
 * PLAN checks are the pieces still to add before staff can follow one light.
 */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const guidePath = path.join(root, 'common/shared/training-flow-guide.js');
const progressPath = path.join(root, 'common/shared/training-i-progress.js');
const guide = fs.readFileSync(guidePath, 'utf8');
const P = require(progressPath);

const fails = [];
const pending = [];
function ok(name) { console.log('ok', name); }
function fail(name, detail) { fails.push(name); console.log('FAIL', name, detail || ''); }
function later(name) { pending.push(name); console.log('pending', name); }
function check(name, cond, detail) { if (cond) ok(name); else fail(name, detail); }

function body(fn) {
  const start = guide.indexOf('function ' + fn + '(');
  if (start < 0) return '';
  let i = guide.indexOf('{', start);
  let depth = 0;
  for (; i < guide.length; i++) {
    if (guide[i] === '{') depth++;
    else if (guide[i] === '}') {
      depth--;
      if (depth === 0) return guide.slice(start, i + 1);
    }
  }
  return '';
}

function callOrder(fn, names) {
  const src = body(fn);
  check(fn + ' exists', src.length > 0);
  let at = -1;
  names.forEach(function (name) {
    const idx = src.indexOf(name);
    if (idx < 0) fail(fn + ' calls ' + name, 'missing');
    else if (idx < at) fail(fn + ' order', name + ' is before the previous step');
    else at = idx;
  });
  if (!fails.some(function (f) { return f.indexOf(fn) === 0; })) ok(fn + ' order');
}

console.log('\n-- module click order --');
callOrder('resolveNextStep', [
  'resolveStartModule',
  'resolveJourney',
  'resolveOutcomes',
  'resolveInsideModule',
  'getEarliestIncompleteBlock',
  'resolveBlock',
  'allBlocksComplete',
  'resolveSectionStage'
]);

console.log('\n-- before any block --');
callOrder('resolveJourney', ['journeyContentReviewed', 'journey-check']);
callOrder('resolveOutcomes', ['data-stage-check="journey"', 'outcome', 'outcomes-check']);
callOrder('resolveInsideModule', ['data-stage-check="outcomes"', 'inside-module']);

console.log('\n-- inside a block --');
callOrder('resolveBlock', [
  'block-open',
  'resolveBlockIntroCards',
  'resolveBlockIntroSlideExpand',
  'resolveProgrammeJourneyTour',
  'panelIncompleteTarget',
  'resolveConceptGrid',
  'resolveReflectionCheckpoint',
  'block-check'
]);

console.log('\n-- inside a concept, before subconcepts --');
callOrder('panelIncompleteTarget', [
  'resolveHubSubconceptStep',
  'getVisibleInsightPillars',
  "phase: 'preKeyideas'",
  'resolveStageIntroCards',
  'resolveKeyIdeaItems',
  'resolveB2LevelAccordions',
  'resolveInPractice',
  'resolveStageLevelPick',
  'resolveM5NestedNav',
  'resolveB3c2FactorExplore',
  "phase: 'preActivity'",
  'resolvePanelActivity',
  "phase: 'postActivity'",
  'resolveM5LeafReturn',
  'resolveM5FinishStep'
]);

console.log('\n-- after all blocks --');
callOrder('resolveKeyIdeasRecapSection', ['recap-idea', 'recap-check']);
callOrder('resolveSectionStage', ['resolveKeyIdeasRecapSection', 'resolveStartQuizStep']);

console.log('\n-- subconcepts do not jump the parent --');
const panel = body('panelIncompleteTarget');
const hubEarly = panel.indexOf('hubSubconceptTourInProgress');
const keyIdeas = panel.indexOf('resolveKeyIdeaItems');
const hubLate = panel.lastIndexOf('parentHubContentReady');
check('returning to a hub pulses the next subconcept only after the parent was ready', hubEarly > 0 && hubEarly < keyIdeas);
check('first visit cannot open subconcepts before key ideas and the activity', hubLate > keyIdeas);

console.log('\n-- progress store --');
const mem = {};
const storage = {
  getItem: function (k) { return k in mem ? mem[k] : null; },
  setItem: function (k, v) { mem[k] = String(v); },
  removeItem: function (k) { delete mem[k]; }
};
P.resetAll(storage);
let snap = P.getSnapshot(2, storage);
check('module starts locked on journey', snap.nextStep === 'journey' && snap.status === 'not-started');
check('quiz locked until content steps', P.quizUnlocked(2, storage) === false);
P.startModule(2, storage);
['journey', 'outcomes', 'block1', 'block2', 'block3', 'recap'].forEach(function (step) {
  P.markStep(2, step, true, storage);
});
check('quiz unlocks after journey, outcomes, blocks and recap', P.quizUnlocked(2, storage) === true);
P.submitQuiz(2, 7, 8, storage);
snap = P.getSnapshot(2, storage);
check('quiz under 100% does not complete the module', snap.status !== 'completed');
P.submitQuiz(2, 8, 8, storage);
snap = P.getSnapshot(2, storage);
check('quiz at 100% completes the module', snap.status === 'completed');
check('module 4 includes block 4 before recap', P.countableSteps('module-4').join(',') === 'journey,outcomes,block1,block2,block3,block4,recap,quiz');

console.log('\n-- still to implement before staff run --');
const expand = fs.readFileSync(path.join(root, 'common/shared/concept-visual-expand-system.js'), 'utf8');
check('image close can be held', /IMAGE_DWELL_MS =/.test(expand) && /imageDwellUntil/.test(expand));
check('flow light is on by default', /FLOW_GUIDE_ACTIVE_DEFAULT = true/.test(guide));
check('later block cannot be stored before earlier steps', /for \(var s = 0; s < idx; s\+\+\)/.test(fs.readFileSync(progressPath, 'utf8')));
check('British female voice is Lily', /pFZP5JQG7iQjIQuC4Bku/.test(fs.readFileSync(path.join(root, 'common/shared/training-i-module-shell.js'), 'utf8')));
check('tts endpoint exists', fs.existsSync(path.join(root, 'api/tts.js')));

console.log(fails.length ? '\nSMOKE FAIL ' + fails.length : '\nENGINE SMOKE PASS');
console.log('PLAN PENDING ' + pending.length);
if (fails.length) process.exit(1);
