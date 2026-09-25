/**
 * Structural audit of Training I modules 1–5 against the guided flow.
 * Run: node scripts/module-audit.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = require(path.join(root, 'common/shared/training-i-progress.js'));
const speechSrc = fs.readFileSync(path.join(root, 'common/shared/training-i-image-speech.js'), 'utf8');
const guide = fs.readFileSync(path.join(root, 'common/shared/training-flow-guide.js'), 'utf8');
const shell = fs.readFileSync(path.join(root, 'common/shared/training-i-module-shell.js'), 'utf8');
const expand = fs.readFileSync(path.join(root, 'common/shared/concept-visual-expand-system.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'common/assets/training-flow-guide.css'), 'utf8');

const speechKeys = new Set();
speechSrc.replace(/"([^"]+\.png)"\s*:/g, function (_, name) { speechKeys.add(name); return _; });

const fails = [];
const notes = [];
function check(name, cond, detail) {
  if (cond) console.log('ok', name);
  else {
    fails.push(name + (detail ? ' — ' + detail : ''));
    console.log('FAIL', name, detail || '');
  }
}
function note(name) { notes.push(name); console.log('note', name); }

function stripScripts(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '');
}

function sectionFrom(markup, id) {
  const start = markup.search(new RegExp('<section[^>]*id="' + id + '"'));
  if (start < 0) return '';
  const rest = markup.slice(start + 1);
  const next = rest.search(/\n <section class="section/);
  return markup.slice(start, next < 0 ? markup.length : start + 1 + next);
}

console.log('\n-- shared engine --');
check('journey forces a fresh scroll', /forceScroll/.test(guide) && /step\.forceScroll/.test(guide));
check('journey scrolls the progress bar into view', /module-progress-bar/.test(guide));
check('locked sections stay hidden during the guide', /section\.gated-locked/.test(css));
check('voice calls queue instead of cancelling onDone', /voiceQueue/.test(shell));
check('image close waits for the narration', /data-imageDwellUntil = 'voice'/.test(expand) || /imageDwellUntil/.test(expand));
check('concept photo is resolved before key ideas', (function () {
  const start = guide.indexOf('function panelIncompleteTarget');
  const slice = guide.slice(start, start + 8000);
  const photo = slice.indexOf('resolveConceptPhoto');
  const ideas = slice.indexOf('resolveKeyIdeaItems');
  return photo > 0 && ideas > photo;
})());
check('outcomes are read in full before the cards can be clicked', /outcomes-read/.test(guide) && /outcomesSpeechText/.test(guide));
check('Done stays dark while a concept image is pending', /conceptPhotoPending/.test(guide) && /conceptReadyForFinishCue/.test(guide));

const versions = {};
for (let n = 1; n <= 5; n++) {
  const file = path.join(root, 'training-i/modules/module-' + n + '/index.html');
  const html = fs.readFileSync(file, 'utf8');
  const markup = stripScripts(html);
  const def = P.MODULES.find(function (m) { return m.number === n; });
  console.log('\n-- module ' + n + ' --');

  const guideJs = html.match(/training-flow-guide\.js\?v=([^"']+)/);
  const guideCss = html.match(/training-flow-guide\.css\?v=([^"']+)/);
  const shellJs = html.match(/training-i-module-shell\.js\?v=([^"']+)/);
  versions[n] = [guideJs && guideJs[1], guideCss && guideCss[1], shellJs && shellJs[1]].join('|');
  check('m' + n + ' loads the guide, shell and speech', /training-flow-guide\.js/.test(html) && /training-i-module-shell\.js/.test(html) && /training-i-image-speech\.js/.test(html));

  check('m' + n + ' starts on the journey', /data-scroll="#journey"/.test(markup));
  const journey = [sectionFrom(markup, 'journey')];
  check('m' + n + ' journey section exists', journey[0].length > 200);
  if (journey[0]) {
    const items = journey[0].match(/class="journey-item/g) || [];
    check('m' + n + ' journey has five modules', items.length === 5, 'found ' + items.length);
    check('m' + n + ' journey has the blue panel', /class="journey-panel"/.test(journey[0]) || /id="journeyPanel"/.test(journey[0]));
    check('m' + n + ' journey checkbox exists', /data-stage-check="journey"/.test(journey[0]));
    check('m' + n + ' journey is not locked on arrival', !/id="journey"[^>]*gated-locked/.test(journey[0]) && !/gated-locked[^>]*id="journey"/.test(journey[0]));
  }

  const outcomes = [sectionFrom(markup, 'outcomes')];
  check('m' + n + ' outcomes section exists and starts locked', outcomes[0].length > 200 && /gated-locked/.test(outcomes[0]));
  if (outcomes[0]) {
    const cards = outcomes[0].match(/class="outcome /g) || [];
    check('m' + n + ' has learning outcome cards', cards.length >= 2, 'found ' + cards.length);
    check('m' + n + ' outcomes checkbox exists', /data-stage-check="outcomes"/.test(outcomes[0]));
  }

  const inside = [sectionFrom(markup, 'inside-module')];
  check('m' + n + ' inside-this-module exists', inside[0].length > 0);
  const blockLinks = (inside[0].match(/href="#block\d"/g) || []).length;
  check('m' + n + ' inside-this-module lists its blocks', blockLinks === def.blocks.length, 'links ' + blockLinks + ' blocks ' + def.blocks.length);

  const targets = [];
  def.blocks.forEach(function (block) {
    const section = [sectionFrom(markup, block)];
    check('m' + n + ' ' + block + ' exists and starts locked', section[0].length > 200 && /gated-locked/.test(section[0]));
    if (!section[0]) return;
    const grid = section[0].match(/data-concept-grid="' + block + '"/);
    check('m' + n + ' ' + block + ' has a concept grid', !!section[0].match(new RegExp('data-concept-grid="' + block + '"')));
    const squares = section[0].match(/data-target="([^"]+)"/g) || [];
    check('m' + n + ' ' + block + ' has concept buttons', squares.length > 0, 'found ' + squares.length);
    squares.forEach(function (attr) {
      targets.push(attr.replace(/data-target="|"/g, ''));
    });
    const intro = (section[0].match(/block-intro-card/g) || []).length;
    if (intro === 0) note('m' + n + ' ' + block + ' has no intro cards');
  });

  const contentStart = html.indexOf('const conceptContent = {');
  const contentEnd = html.indexOf('\n};', contentStart);
  const content = contentStart >= 0 ? html.slice(contentStart, contentEnd) : '';
  check('m' + n + ' conceptContent exists', content.length > 0);
  const keys = [];
  content.replace(/^ ([a-z][a-z0-9]+): \{/gm, function (_, key) { keys.push(key); return _; });
  const missingContent = targets.filter(function (id) { return keys.indexOf(id) < 0; });
  const orphanContent = keys.filter(function (id) {
    if (!/^(b\d|b2core|b2l)/.test(id)) return false;
    return html.indexOf('data-target="' + id + '"') < 0 && html.indexOf('data-overview-subtarget="' + id + '"') < 0;
  });
  check('m' + n + ' every concept button has content', missingContent.length === 0, missingContent.join(', '));
  check('m' + n + ' every content entry has a button', orphanContent.length === 0, orphanContent.join(', '));

  const images = [];
  content.replace(/src="([^"]+\.png)"/g, function (_, src) { images.push(src.split('/').pop()); return _; });
  const silent = images.filter(function (name) {
    if (/^level-\d-/.test(name)) return false;
    return !speechKeys.has(name);
  });
  check('m' + n + ' every concept infographic has a spoken script', silent.length === 0, silent.join(', '));

  check('m' + n + ' recap section exists', /id="keyideas"/.test(markup) || /id="recap"/.test(markup));
  check('m' + n + ' quiz section exists', /id="quiz"/.test(markup));
  check('m' + n + ' progress steps match its blocks', P.countableSteps('module-' + n).filter(function (s) { return s.indexOf('block') === 0; }).join(',') === def.blocks.join(','));
}

console.log('\n-- progress path, every module --');
[1, 2, 3, 4, 5].forEach(function (n) {
  const mem = {};
  const storage = {
    getItem: function (k) { return k in mem ? mem[k] : null; },
    setItem: function (k, v) { mem[k] = String(v); },
    removeItem: function (k) { delete mem[k]; }
  };
  P.resetAll(storage);
  let snap = P.getSnapshot(n, storage);
  check('m' + n + ' opens on journey before start', snap.nextStep === 'journey' && snap.quizUnlocked === false);
  P.startModule(n, storage);
  const steps = P.countableSteps('module-' + n).filter(function (s) { return s !== 'quiz'; });
  steps.forEach(function (step) { P.markStep(n, step, true, storage); });
  check('m' + n + ' quiz stays locked until every earlier step', P.quizUnlocked(n, storage) === true);
  P.resetAll(storage);
  P.startModule(n, storage);
  const later = steps[steps.length - 1];
  P.markStep(n, later, true, storage);
  snap = P.getSnapshot(n, storage);
  check('m' + n + ' cannot store the last step before the journey', snap.steps[later] !== true);
});

console.log('\n-- cache versions agree --');
const unique = new Set(Object.values(versions));
check('all five modules share the same guide, css and shell versions', unique.size === 1, Object.values(versions).join(' / '));

console.log(fails.length ? '\nAUDIT FAIL ' + fails.length : '\nAUDIT PASS');
fails.forEach(function (f) { console.log(' - ' + f); });
if (notes.length) {
  console.log('NOTES ' + notes.length);
  notes.forEach(function (n) { console.log(' - ' + n); });
}
if (fails.length) process.exit(1);
