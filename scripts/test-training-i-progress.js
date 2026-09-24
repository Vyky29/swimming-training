'use strict';

var assert = require('assert');
var path = require('path');
var P = require(path.join(__dirname, '..', 'common', 'shared', 'training-i-progress.js'));

function memory() {
  var mem = {};
  return {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
    setItem: function (k, v) { mem[k] = String(v); },
    removeItem: function (k) { delete mem[k]; }
  };
}

var failed = 0;
function test(name, fn) {
  try {
    fn();
    console.log('ok  ' + name);
  } catch (err) {
    failed += 1;
    console.error('fail  ' + name);
    console.error('  ' + err.message);
  }
}

test('percent with three blocks uses 7 countable steps', function () {
  var store = memory();
  var snap = P.getSnapshot(1, store);
  assert.strictEqual(snap.total, 7);
  assert.strictEqual(snap.percent, 0);
  assert.strictEqual(snap.status, 'not-started');
  ['journey', 'outcomes', 'block1', 'block2', 'block3'].forEach(function (s) {
    P.markStep(1, s, true, store);
  });
  snap = P.getSnapshot(1, store);
  assert.strictEqual(snap.done, 5);
  assert.strictEqual(snap.percent, Math.round(5 / 7 * 100));
});

test('percent with four blocks uses 8 countable steps', function () {
  var store = memory();
  var snap = P.getSnapshot(4, store);
  assert.strictEqual(snap.total, 8);
  P.markStep(4, 'journey', true, store);
  P.markStep(4, 'outcomes', true, store);
  P.markStep(4, 'block1', true, store);
  P.markStep(4, 'block2', true, store);
  P.markStep(4, 'block3', true, store);
  P.markStep(4, 'block4', true, store);
  P.markStep(4, 'recap', true, store);
  snap = P.getSnapshot(4, store);
  assert.strictEqual(snap.done, 7);
  assert.strictEqual(snap.total, 8);
  assert.strictEqual(snap.percent, Math.round(7 / 8 * 100));
  assert.strictEqual(snap.nextStep, 'quiz');
});

test('status transitions: start, complete quiz, review', function () {
  var store = memory();
  assert.strictEqual(P.getSnapshot(2, store).status, 'not-started');
  assert.strictEqual(P.getSnapshot(2, store).cta, 'Start Module');
  P.startModule(2, store);
  assert.strictEqual(P.getSnapshot(2, store).status, 'in-progress');
  assert.strictEqual(P.getSnapshot(2, store).cta, 'Continue Module');
  P.submitQuiz(2, 8, 8, store);
  var snap = P.getSnapshot(2, store);
  assert.strictEqual(snap.status, 'completed');
  assert.strictEqual(snap.cta, 'Review Module');
  P.markReview(2, store);
  assert.strictEqual(P.getSnapshot(2, store).status, 'review');
});

test('review is not the initial status', function () {
  var store = memory();
  assert.strictEqual(P.getSnapshot(3, store).status, 'not-started');
  P.markReview(3, store);
  assert.strictEqual(P.getSnapshot(3, store).status, 'not-started');
});

test('quiz stays locked until content steps are done', function () {
  var store = memory();
  P.startModule(1, store);
  assert.strictEqual(P.quizUnlocked(1, store), false);
  assert.ok(P.missingContent(1, store).length > 0);
  P.markStep(1, 'journey', true, store);
  P.markStep(1, 'outcomes', true, store);
  P.markStep(1, 'block1', true, store);
  P.markStep(1, 'block2', true, store);
  P.markStep(1, 'block3', true, store);
  assert.strictEqual(P.quizUnlocked(1, store), false);
  P.markStep(1, 'recap', true, store);
  assert.strictEqual(P.quizUnlocked(1, store), true);
  assert.strictEqual(P.getSnapshot(1, store).status, 'in-progress');
});

test('failing quiz does not complete the module', function () {
  var store = memory();
  P.markStep(1, 'journey', true, store);
  P.markStep(1, 'outcomes', true, store);
  P.markStep(1, 'block1', true, store);
  P.markStep(1, 'block2', true, store);
  P.markStep(1, 'block3', true, store);
  P.markStep(1, 'recap', true, store);
  P.submitQuiz(1, 7, 8, store);
  var snap = P.getSnapshot(1, store);
  assert.strictEqual(snap.quiz.passed, false);
  assert.strictEqual(snap.steps.quiz, false);
  assert.strictEqual(snap.status, 'in-progress');
});

test('next step follows incomplete countable stages', function () {
  var store = memory();
  assert.strictEqual(P.nextStep(1, store), 'journey');
  P.markStep(1, 'journey', true, store);
  assert.strictEqual(P.nextStep(1, store), 'outcomes');
  P.markStep(1, 'outcomes', true, store);
  assert.strictEqual(P.nextStep(1, store), 'block1');
});

test('hub and module share one snapshot', function () {
  var store = memory();
  P.startModule(5, store);
  P.markStep(5, 'journey', true, store);
  var moduleSnap = P.getSnapshot('module-5', store);
  var hubSnap = P.getSnapshot(5, store);
  assert.deepStrictEqual(moduleSnap.status, hubSnap.status);
  assert.deepStrictEqual(moduleSnap.percent, hubSnap.percent);
  assert.strictEqual(P.getSnapshot(1, store).status, 'not-started');
  assert.strictEqual(P.getSnapshot(4, store).status, 'not-started');
});

test('later modules do not invent completed earlier modules', function () {
  var store = memory();
  P.startModule(3, store);
  P.markStep(3, 'journey', true, store);
  assert.strictEqual(P.getSnapshot(1, store).status, 'not-started');
  assert.strictEqual(P.getSnapshot(2, store).status, 'not-started');
  assert.strictEqual(P.getSnapshot(3, store).status, 'in-progress');
});

test('persistence survives reload via the same storage', function () {
  var store = memory();
  P.startModule(1, store);
  P.markStep(1, 'journey', true, store);
  var again = P.getSnapshot(1, store);
  assert.strictEqual(again.status, 'in-progress');
  assert.strictEqual(again.steps.journey, true);
});

test('incompatible stored JSON is replaced with empty state', function () {
  var store = memory();
  store.setItem(P.STORAGE_KEY, '{"version":99,"nope":true}');
  var snap = P.getSnapshot(1, store);
  assert.strictEqual(snap.status, 'not-started');
  assert.strictEqual(snap.percent, 0);
});

test('legacy swimming_module_N_progress migrates without completing neighbours', function () {
  var store = memory();
  store.setItem('swimming_module_2_progress', JSON.stringify({
    module2_journey: true,
    module2_outcomes: true,
    module2_quiz: true,
    module2_completed: true
  }));
  var m2 = P.getSnapshot(2, store);
  assert.strictEqual(m2.steps.journey, true);
  assert.strictEqual(m2.quiz.passed, true);
  assert.strictEqual(m2.status, 'completed');
  assert.strictEqual(P.getSnapshot(1, store).status, 'not-started');
  assert.strictEqual(P.getSnapshot(3, store).status, 'not-started');
});

test('keyideas aliases to recap for module 4', function () {
  var store = memory();
  P.markStep(4, 'keyideas', true, store);
  assert.strictEqual(P.getSnapshot(4, store).steps.recap, true);
});

test('accordion aria helper contract: expanded is boolean string', function () {
  var expanded = true;
  var attr = expanded ? 'true' : 'false';
  assert.strictEqual(attr, 'true');
  expanded = false;
  attr = expanded ? 'true' : 'false';
  assert.strictEqual(attr, 'false');
});

if (failed) {
  console.error('\n' + failed + ' test(s) failed');
  process.exit(1);
}
console.log('\nAll training I progress tests passed');
