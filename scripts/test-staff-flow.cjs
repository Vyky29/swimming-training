'use strict';
// Execute production handlers with a deterministic clock and small DOM doubles.
// These tests exercise transitions, not the mere presence of function names.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function source(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
function fn(src, name) {
  const start = src.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name);
  let at = src.indexOf('{', start), depth = 1, i = at + 1;
  for (; depth && i < src.length; i++) { if (src[i] === '{') depth++; if (src[i] === '}') depth--; }
  return src.slice(start, i);
}
let count = 0;
function test(name, run) { run(); count++; console.log('ok', name); }
function imageHarness() {
  let now = 0, id = 0, onDone;
  const timers = new Map(), listeners = {}, seen = [], buttons=[];
  const close = {style:{removeProperty(){}},setAttribute(){},removeAttribute(){}};
  let image = {currentSrc:'photo.png',complete:true,naturalWidth:100,getAttribute(){return 'Photo';}};
  const status = {textContent:'',setAttribute(){},style:{}};
  const modal = {dataset:{},open:true,classList:{contains(){return modal.open;}},
    querySelector(q){ return q === 'img' ? image : q === '.image-dwell-status' ? status : q === '.image-narration' ? null : close; },appendChild(){}};
  const document = {hidden:false,addEventListener(n,f){listeners[n]=f;},createElement(tag){
    const el={textContent:'',style:{},appendChild(){},setAttribute(){},addEventListener(n,f){this[n]=f;}};
    if(tag==='button')buttons.push(el);return el;
  }};
  const ctx = vm.createContext({document,performance:{now:()=>now},setInterval(f){timers.set(++id,f);return id;},clearInterval(i){timers.delete(i);},
    window:{CSTrainingVoice:{speak(text,done){onDone=done;return true;},stop(){}}},cleanSpeech:x=>x,infographicScript:()=>'',sourceImage:()=>null,
    rememberSeen:s=>seen.push(s),markSrcExpanded(){},IMAGE_DWELL_MS:15000});
  ctx.CSTrainingVoice=ctx.window.CSTrainingVoice;
  const src=source('common/shared/concept-visual-expand-system.js');
  vm.runInContext(src.slice(src.indexOf('  var activeDwell ='),src.indexOf('  function dwellBlocksClose')),ctx);
  return {ctx,modal,close,status,seen,image,
    open(){ctx.beginImageDwell(modal);},audio(ok=true){onDone({completed:ok});},read(){buttons.at(-1).click();},
    advance(ms){for(let i=0;i<ms;i+=100){now+=100;[...timers.values()].forEach(f=>f());}},
    hide(v){document.hidden=v;listeners.visibilitychange();},
    replace(){image={...image,currentSrc:'second.png'};this.open();}};
}
test('short narration still requires 15 visible seconds',()=>{
  const h=imageHarness();h.open();h.audio();h.advance(14900);assert.equal(h.close.disabled,true);
  h.advance(100);assert.deepEqual(h.seen,['photo.png']);
});
test('long narration must finish even after the visual minimum',()=>{
  const h=imageHarness();h.open();h.advance(40000);assert.equal(h.seen.length,0);h.audio();assert.equal(h.seen.length,1);
});
test('failed audio needs explicit transcript review and the visible minimum',()=>{
  const h=imageHarness();h.open();h.audio(false);h.advance(40000);assert.equal(h.seen.length,0);h.read();assert.equal(h.seen.length,1);
  const early=imageHarness();early.open();early.audio(false);early.read();early.advance(14900);assert.equal(early.seen.length,0);
  early.advance(100);assert.equal(early.seen.length,1);
});
test('time in another tab does not count',()=>{
  const h=imageHarness();h.open();h.audio();h.advance(5000);h.hide(true);h.advance(60000);assert.equal(h.seen.length,0);
  h.hide(false);h.advance(10000);assert.equal(h.seen.length,0);h.advance(100);assert.equal(h.seen.length,1);
});
test('unloaded and broken images cannot earn progress',()=>{
  const h=imageHarness();h.image.complete=false;h.open();h.audio();h.advance(60000);assert.equal(h.seen.length,0);
  h.image.complete=true;h.image.naturalWidth=0;h.advance(60000);assert.equal(h.seen.length,0);
  assert.equal(h.close.disabled,false);h.image.naturalWidth=100;h.open();h.audio();h.advance(15100);assert.equal(h.seen.length,1);
});
test('repeated open notifications do not restart or shorten the timer',()=>{
  const h=imageHarness();h.open();h.audio();h.advance(7500);h.open();h.advance(7500);assert.equal(h.seen.length,1);
});
test('a replacement image needs its own full review and narration',()=>{
  const h=imageHarness();h.open();h.audio();h.advance(7500);h.replace();h.advance(15000);assert.equal(h.seen.length,0);
  h.audio();assert.deepEqual(h.seen,['second.png']);
});
test('closing a modal externally does not award completion',()=>{
  const h=imageHarness();h.open();h.audio();h.advance(10000);h.modal.open=false;h.advance(60000);assert.equal(h.seen.length,0);
});
function familyTest(n, block, parent, leaves, extra={}) {
  const src=source(`training-i/modules/module-${n}/index.html`), completed=[],renders=[],returns=[];
  const sets={block1:new Set(),block2:new Set(),block3:new Set(),block4:new Set()};
  const ctx=vm.createContext({conceptCompletion:sets,conceptHistory:{},
    markConceptComplete(b,t){sets[b].add(t);completed.push(t);},
    renderConcept(b,t){renders.push(t);},
    TrainingFlowGuide:{returnToConceptGrid(b){returns.push(b);},requestRefresh(){}},
    block2StateTargets:[],block2StatesViewed:new Set(),block3FactorTargets:[],block3FactorsViewed:new Set(),
    block3ApproachTargets:[],block3ApproachesViewed:new Set(),getNextConceptTarget(){return null;},...extra});
  if(src.includes('function nextSiblingSubconcept('))vm.runInContext(fn(src,'nextSiblingSubconcept'),ctx);
  vm.runInContext(fn(src,'finishConcept'),ctx);
  leaves.forEach((leaf,i)=>{
    ctx.finishConcept(block,leaf);
    assert.ok(completed.includes(leaf),'leaf is explicitly completed');
    if(i<leaves.length-1){assert.equal(renders.at(-1),parent);assert.ok(!completed.includes(parent));assert.equal(returns.length,0);}
    else {assert.ok(completed.includes(parent));assert.equal(returns.at(-1),block);}
  });
}
test('M1 forces: each leaf returns to picker, last leaf completes parent',()=>familyTest(1,'block1','b1c2',['b1c3','b1c4']));
const states=['b2c2_calm','b2c2_alert','b2c2_overloaded'];
test('M2 emotional states: picker between leaves, exit after last',()=>familyTest(2,'block2','b2c2',states,{block2StateTargets:states}));
const factors=['b3c2_water','b3c2_env','b3c2_internal'];
test('M2 factors: picker between leaves, exit after last',()=>familyTest(2,'block3','b3c2',factors,{block3FactorTargets:factors}));
const m3=source('training-i/modules/module-3/index.html').match(/const block3ApproachTargets = (\[[^;]+\])/);
const approaches=vm.runInNewContext(m3[1]);
test('M3 approaches: picker between leaves, exit after last',()=>familyTest(3,'block3','b3c3',approaches,{block3ApproachTargets:approaches}));
test('M4 development factors: picker between leaves, exit after last',()=>familyTest(4,'block4','b3c2',['b3c2_physical','b3c2_motor','b3c2_cognitive']));
test('M4 term review: picker between leaves, exit after last',()=>familyTest(4,'block4','b3c3',['b3c3_step1','b3c3_step2','b3c3_step3']));
test('M4 stage returns to its level picker until both levels are complete',()=>{
  const src=source('training-i/modules/module-4/index.html'), done=new Set(), renders=[], returns=[];
  const ctx=vm.createContext({conceptCompletion:{block3:new Set()},conceptHistory:{},block2StageLevels:{stage:['b2l1','b2l2']},
    markPathwayAccordionLevelComplete:t=>done.add(t),getStageIdForLevel:()=> 'stage',isLevelFullyCompleted:t=>done.has(t),
    markConceptComplete(b,t){ctx.conceptCompletion.block3.add(t);},renderConcept(b,t){renders.push(t);},
    TrainingFlowGuide:{returnToConceptGrid:b=>returns.push(b),requestRefresh(){}}});
  vm.runInContext(fn(src,'finishConcept'),ctx);
  ctx.finishConcept('block3','b2l1');assert.deepEqual(renders,['stage']);assert.equal(returns.length,0);
  ctx.finishConcept('block3','b2l2');assert.deepEqual(returns,['block3']);assert.ok(ctx.conceptCompletion.block3.has('stage'));
});
test('M5 nested completion survives re-render and stays scoped to its concept',()=>{
  const mem={}, src=source('common/shared/training-flow-guide.js');
  const ctx=vm.createContext({activeModuleConfig:{number:5},localStorage:{getItem:k=>mem[k]||null,setItem(k,v){mem[k]=v;}}});
  ['parseM5DoneList','isM5ItemDone','markM5ItemDone'].forEach(n=>vm.runInContext(fn(src,n),ctx));
  const panel={dataset:{currentTarget:'b2c2'}};
  ctx.markM5ItemDone(panel,'flowM5CatsDone','f1-s1');
  assert.equal(ctx.isM5ItemDone({dataset:{currentTarget:'b2c2'}},'flowM5CatsDone','f1-s1'),true);
  assert.equal(ctx.isM5ItemDone({dataset:{currentTarget:'b2c3'}},'flowM5CatsDone','f1-s1'),false);
});
test('M4 reload restores earned concepts and expands only completed levels',()=>{
  const src=source('training-i/modules/module-4/index.html');
  const sets={block1:new Set(),block2:new Set(),block3:new Set(),block4:new Set()}, updated=[];
  const saved={block1:['b1c1','b1c2'],block3:['b2l1']};
  const ctx=vm.createContext({window:{TrainingIProgress:{}},TrainingIProgress:{getSnapshot:()=>({concepts:saved})},
    conceptCompletion:sets,block2LevelIds:['b2l1','b2l2'],block2LevelGroups:[['b2l1_f1','b2l1_activities'],['b2l2_f1']],
    conceptGroups:{block3:{order:['b2l1_focus','b2l2_focus']}},document:{querySelectorAll:()=>[]},updateConceptProgress:b=>updated.push(b)});
  vm.runInContext(fn(src,'restoreConceptCompletion'),ctx);ctx.restoreConceptCompletion();
  assert.deepEqual([...sets.block1],['b1c1','b1c2']);
  assert.ok(sets.block3.has('b2l1_f1'));assert.ok(sets.block3.has('b2l1_activities'));assert.ok(sets.block3.has('b2l1_focus'));
  assert.ok(!sets.block3.has('b2l2_f1'));assert.ok(!sets.block3.has('b2l2_focus'));assert.equal(updated.length,4);
});
test('level mascots do not create an impossible photo requirement',()=>{
 const ctx=vm.createContext({});const src=source('common/shared/training-flow-guide.js');
 ['imgHasRealSrc','conceptPhotoPending'].forEach(name=>vm.runInContext(fn(src,name),ctx));
 const mascot={getAttribute:()=>'/mascot.png',closest:()=>({})};
 const photo={getAttribute:()=>'/lesson.png',closest:()=>null};
 const panel={querySelectorAll:()=>[mascot],querySelector:()=>null};
 assert.equal(ctx.conceptPhotoPending(panel),false);
 panel.querySelectorAll=()=>[mascot,photo];assert.equal(ctx.conceptPhotoPending(panel),true);
 panel.querySelector=()=>({getAttribute:()=> 'true'});assert.equal(ctx.conceptPhotoPending(panel),false);
});
// Minimal bubbling DOM for the production classification activity handlers.
class Element {
  constructor(classes='',data={}) {this.classes=new Set(classes.split(' ').filter(Boolean));this.dataset=data;this.children=[];this.parent=null;this.listeners={};this.style={};this.attrs={};this.textContent='';this.classList={add:(...x)=>x.forEach(c=>this.classes.add(c)),remove:(...x)=>x.forEach(c=>this.classes.delete(c)),contains:x=>this.classes.has(x)};}
  setAttribute(k,v){this.attrs[k]=v;} getAttribute(k){return this.attrs[k];} removeAttribute(k){delete this.attrs[k];}
  matches(q){return q.startsWith('.')?q.slice(1).split('.').every(c=>this.classes.has(c)):q.startsWith('[')?q.slice(1,-1).split('=')[0] in this.attrs:false;}
  closest(q){return this.matches(q)?this:this.parent?.closest(q);}
  querySelectorAll(q){return this.children.flatMap(c=>[...(c.matches(q)?[c]:[]),...c.querySelectorAll(q)]);}
  querySelector(q){return this.querySelectorAll(q)[0]||null;}
  appendChild(c){if(c.parent)c.parent.children=c.parent.children.filter(x=>x!==c);this.children.push(c);c.parent=this;return c;}
  addEventListener(n,f){(this.listeners[n]??=[]).push(f);}
  emit(type,extra={}){const route=[];for(let p=this;p;p=p.parent)route.push(p);const e={target:this,preventDefault(){},...extra};route.forEach(p=>(p.listeners[type]||[]).forEach(f=>f(e)));}
  click(){this.emit('click');}
}
[1,2,3,4].forEach(n=>test(`M${n} classification works with click and keyboard, without drag`,()=>{
  const panel=new Element('concept-panel'),pool=panel.appendChild(new Element('categorize-pool-items'));
  const zones=['a','b'].map(zone=>{const z=panel.appendChild(new Element('categorize-zone',{zone}));z.appendChild(new Element('categorize-zone-items'));return z;});
  const items=['a','b'].map(category=>pool.appendChild(new Element('categorize-item',{category})));
  const finish=panel.appendChild(new Element());finish.setAttribute('data-finish-concept','');
  const feedback=panel.appendChild(new Element());feedback.setAttribute('data-categorize-feedback','');
  const ctx=vm.createContext({conceptContent:{sample:{classificationCount:2}},window:{},updateConceptFinishState(){}});
  const setup = n === 4 ? 'initCategorizeModule4' : 'setupCategorizeActivity';
  vm.runInContext(fn(source(`training-i/modules/module-${n}/index.html`),setup),ctx);
  if(n === 4) ctx.initCategorizeModule4(panel, feedback, 'Correct');
  else ctx.setupCategorizeActivity(panel,'block1','sample');
  items[0].click();assert.ok(items[0].classList.contains('selected'),'pool must not cancel the item click');
  zones[0].click();assert.equal(items[0].parent,zones[0].children[0]);
  items[1].emit('keydown',{key:'Enter'});zones[1].emit('keydown',{key:'Enter'});
  assert.equal(panel.dataset.categorizeComplete,'true');
}));

[1,2,3,4,5].forEach(n=>test(`M${n} activity completion cannot bypass a pending image`,()=>{
  const panel={dataset:{currentTarget:'test'}};
  const guide={conceptPhotoPending:()=>true,requestRefresh(){}};
  const ctx=vm.createContext({window:{TrainingFlowGuide:guide},TrainingFlowGuide:guide,document:{querySelector:()=>panel},
    markConceptComplete(){throw new Error('Premature completion');}});
  vm.runInContext(fn(source(`training-i/modules/module-${n}/index.html`),'finishConcept'),ctx);
  ctx.finishConcept('block1','test');
}));
test('M5 nested photo checks do not inspect hidden sibling images',()=>{
 const src=source('common/shared/training-flow-guide.js'),ctx=vm.createContext({});
 ['conceptPhotoPending','resolveConceptPhoto'].forEach(name=>vm.runInContext(fn(src,name),ctx));
 const panel={querySelector:s=>s==='[data-b2-screens]'?{}:null,querySelectorAll(){throw Error('Hidden sibling inspected');}};
 assert.equal(ctx.conceptPhotoPending(panel),false);assert.equal(ctx.resolveConceptPhoto(panel),null);
});
test('parent layout selects its own ideas without moving nested folder content',()=>{
 const own={},nested={},ctx=vm.createContext({});
 vm.runInContext(fn(source('common/shared/parent-subconcept-layout.js'),'getPoints'),ctx);
 const panel={querySelector:s=>s===':scope > .concept-points-box'?own:nested};
 assert.equal(ctx.getPoints(panel),own);
});
test('M5 returns to its category picker between siblings and exits after the last',()=>{
 let done=['f1-s1'];
 const ctx=vm.createContext({getNestedScreenContext:()=>({wrapper:{}}),getCategoryIdsForFolder:()=>['f1-s1','f1-s2'],isItemDone:(_p,_key,id)=>done.includes(id)});
 vm.runInContext(fn(source('common/shared/guided-concept-layout.js'),'findNextLeafTarget'),ctx);
 assert.equal(ctx.findNextLeafTarget({},'f1-s1'),'f1');done.push('f1-s2');assert.equal(ctx.findNextLeafTarget({},'f1-s2'),'home');
});
test('M5 category completion persists from the actual layout handler and stays concept scoped',()=>{
 const saved=new Map(),ctx=vm.createContext({localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)}});
 const src=source('common/shared/guided-concept-layout.js');['parseDoneList','isItemDone','markItemDone'].forEach(name=>vm.runInContext(fn(src,name),ctx));
 const first={dataset:{currentTarget:'b2c2'}};ctx.markItemDone(first,'flowM5CatsDone','f1-s1');
 assert.equal(ctx.isItemDone({dataset:{currentTarget:'b2c2'}},'flowM5CatsDone','f1-s1'),true);
 assert.equal(ctx.isItemDone({dataset:{currentTarget:'b2c3'}},'flowM5CatsDone','f1-s1'),false);
});
test('M5 incorrect activity feedback cannot unlock completion; valid glide paraphrases pass',()=>{
 const src=source('training-i/modules/module-5/index.html'),ctx=vm.createContext({updateConceptFinishStateM5(){},window:{}});
 ['b2Norm','b2GlideStepCorrect','b2MarkShell'].forEach(name=>vm.runInContext(fn(src,name),ctx));
 const shell={dataset:{}};ctx.b2MarkShell(shell,{},'block2','b2c2',null,'Try again',false);assert.equal(shell.dataset.choiceShellComplete,'false');
 assert.equal(ctx.b2GlideStepCorrect('Introduce rotation and sculling',[]),false);
 assert.equal(ctx.b2GlideStepCorrect('Add a glide once the swimmer has a stable body position',[]),true);
 assert.equal(ctx.b2GlideStepCorrect('Add glide before the swimmer has stable control',[]),false);
 ctx.b2MarkShell(shell,{},'block2','b2c2',null,'Correct',true);assert.equal(shell.dataset.choiceShellComplete,'true');
});
test('M5 a reviewed first image does not skip the remaining images',()=>{
 const first={getAttribute:()=> 'true'},second={getAttribute:()=> 'false'};
 const scope={querySelector:s=>s.includes('visual-shell')?first:null,querySelectorAll:()=>[first,second]};
 const ctx=vm.createContext({getM5FlowScope:()=>scope,panelHasM5NestedNav:()=>true,getM5ScreenId:()=> 'f3-s1',isM5ItemDone:()=>true,isVisibleEl:()=>true});
 vm.runInContext(fn(source('common/shared/training-flow-guide.js'),'getPanelExpandButtons'),ctx);
 assert.equal(ctx.getPanelExpandButtons({})[0],second);
});
test('M5 yellow-card guide resumes at the first remaining visible step',()=>{
 const next={querySelector:()=>({textContent:' Step five '})},hidden={};let remaining=[hidden,next];
 const ctx=vm.createContext({getM5FlowScope:()=>({querySelectorAll:()=>remaining}),isVisibleEl:e=>e!==hidden,
  sectionScrollStep:(kind,target,label)=>({kind,target,label})});
 vm.runInContext(fn(source('common/shared/training-flow-guide.js'),'resolveYellowUseCards'),ctx);
 const step=ctx.resolveYellowUseCards({});assert.equal(step.target,next);assert.equal(step.label,'Review: Step five');
 remaining=[];assert.equal(ctx.resolveYellowUseCards({}),null);
});
test('M5 completed leaf guides to its finish handler instead of bypassing it with Back',()=>{
 const finish={disabled:false};const ctx=vm.createContext({isM5LeafFlowComplete:()=>true,isVisibleEl:()=>true,
 sectionScrollStep:(kind,target)=>({kind,target})});
 vm.runInContext(fn(source('common/shared/training-flow-guide.js'),'resolveM5LeafReturn'),ctx);
 assert.equal(ctx.resolveM5LeafReturn({querySelector:()=>finish}).target,finish);
});
test('M5 completed nested hub exposes Done after returning or reloading',()=>{
 const finish={style:{},disabled:true},panel={querySelector:s=>s==='[data-finish-concept]'?finish:null};
 const layout={getNestedScreenContext:()=>({mode:'hub'}),isItemDone:()=>true};
 const ctx=vm.createContext({conceptContent:{b2c3:{nestedChoiceKeys:['one','two']}},window:{GuidedConceptLayout:layout},GuidedConceptLayout:layout});
 vm.runInContext(fn(source('training-i/modules/module-5/index.html'),'updateConceptFinishStateM5'),ctx);
 ctx.updateConceptFinishStateM5(panel,'block2','b2c3');assert.equal(finish.disabled,false);assert.equal(finish.style.display,'');
 layout.isItemDone=()=>false;ctx.updateConceptFinishStateM5(panel,'block2','b2c3');assert.equal(finish.style.display,'none');
});
test('narration retry only awards progress after successful playback',()=>{
 const nodes=[];let callback,completed=0;
 const voice={speak:(_text,done)=>{callback=done;}};
 const ctx=vm.createContext({window:{CSTrainingVoice:voice},CSTrainingVoice:voice,document:{createElement(){
 const el={style:{},children:[],appendChild(c){this.children.push(c);},addEventListener(_name,handler){this.click=handler;},remove(){this.removed=true;}};
 nodes.push(el);return el;
 }}});
 vm.runInContext(fn(source('common/shared/training-flow-guide.js'),'acceptNarrationResult'),ctx);
 ctx.acceptNarrationResult({completed:false},'Narration',{appendChild(){}},()=>completed++);
 nodes.find(e=>e.textContent==='Retry narration').click({stopPropagation(){}});
 assert.equal(completed,0);callback({completed:true});assert.equal(completed,1);
});
test('M5 schedule pockets place a selected card with Enter or Space',()=>{
 const slot=new Element();slot.setAttribute('data-m5-ftx-slot','first');slot.setAttribute('data-m5-ftx-sc','s1');const placed=[];
 const ctx=vm.createContext({root:{querySelectorAll:()=>[slot]},selectedId:'bubbles',placeInto:(...args)=>placed.push(args)});
 vm.runInContext(fn(source('training-i/modules/module-5/index.html'),'bindSlots'),ctx);ctx.bindSlots();
 slot.emit('keydown',{key:'Enter'});slot.emit('keydown',{key:' '});slot.emit('keydown',{key:'ArrowDown'});
 assert.equal(placed.length,2);assert.deepEqual(placed[0],['s1','first','bubbles']);
});
test('failed result preserves numeric score and cannot be interpreted as a pass by the shell',()=>{
 const score={textContent:'7/8'},attrs={},card={classList:{add(){},remove(){}},querySelector:()=>null,setAttribute:(k,v)=>attrs[k]=v,hasAttribute:k=>k in attrs};
 const resultCtx=vm.createContext({ensureActionWrap(){}});
 vm.runInContext(fn(source('common/shared/module-completion-flow.js'),'renderResultCard'),resultCtx);
 resultCtx.renderResultCard({scoreCard:card,scoreValue:score,passed:false});
 assert.equal(score.textContent,'7/8');assert.equal(attrs['data-quiz-passed'],'false');
 const handlers={},ctx=vm.createContext({document:{addEventListener:(type,handler)=>handlers[type]=handler},setTimeout:cb=>cb(),
 refresh(){},P:{submitQuiz(){throw Error('Presentation must not submit a second score');}}});
 vm.runInContext(fn(source('common/shared/training-i-module-shell.js'),'bindQuiz'),ctx);ctx.bindQuiz(5);
 handlers.submit({target:{id:'quizFormM5',parentNode:{querySelector:()=>card}}});
});
console.log(`${count} behavioral staff-flow tests passed`);
