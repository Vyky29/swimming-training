const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('common/shared/training-i-resume.js','utf8');
function harness(storage={},moduleNumber=1){
 const attrs={},listeners={},renders=[];
 const section={id:'block1'},panel={dataset:{panelFor:'block1',currentTarget:'water'}};
 const element={textContent:'Water keeps moving.',dataset:{},classes:new Set(),a:{},
  getAttribute(k){return this.a[k]||null;},setAttribute(k,v){this.a[k]=v;},querySelector(){return null;},
  closest(s){return s==='.concept-panel'?panel:s==='[data-b2-screen]'?null:section;}};
 element.classList={contains:k=>element.classes.has(k),add:k=>element.classes.add(k)};
 panel.querySelectorAll=()=>[element];panel.dispatchEvent=()=>{};
 const document={readyState:'complete',hidden:false,body:{},documentElement:{
  get attributes(){return Object.entries(attrs).map(([name,value])=>({name,value}));},getAttribute:k=>attrs[k],setAttribute(k,v){attrs[k]=v;}},
  addEventListener(k,v){listeners[k]=v;},querySelectorAll(s){return s==='.concept-panel.show'?[panel]:[element];},querySelector(s){return s.includes('.concept-panel.show')?panel:null;}};
 const global={addEventListener(k,v){listeners[k]=v;},renderConcept:(b,t)=>renders.push([b,t]),TrainingFlowGuide:{requestRefresh(){}}};
 const ctx={CustomEvent:class{},window:global,document,location:{pathname:`/training-i/modules/module-${moduleNumber}/`,href:`https://training.test/training-i/modules/module-${moduleNumber}/`},URL,
 localStorage:{getItem:k=>storage[k]||null,setItem(k,v){storage[k]=v;}},MutationObserver:class{constructor(f){}observe(){}},setTimeout(){}};
 vm.runInNewContext(source,ctx);
 return {api:global.TrainingIResume,element,panel,attrs,listeners,renders,storage};
}
let h=harness();h.element.classes.add('clicked');h.element.a['data-pillar-spoken']='done';h.attrs['data-spoken-title-water']='done';h.api.capture();
let reopened=harness(h.storage);assert.ok(reopened.element.classes.has('clicked'));assert.equal(reopened.element.a['data-pillar-spoken'],'done');assert.equal(reopened.attrs['data-spoken-title-water'],'done');
assert.equal(reopened.panel.dataset.insightPillarsDone,'true');assert.equal(reopened.panel.dataset.keyIdeasDone,'true');
assert.equal(reopened.api.resume({nextStep:'block1'}),true);assert.deepEqual(reopened.renders,[['block1','water']]);console.log('ok dashboard return restores concept and completed narration');
let pending=harness();pending.element.a['data-pillar-spoken']='playing';pending.attrs['data-spoken-title-water']='playing';pending.api.capture();let retry=harness(pending.storage);assert.equal(retry.element.a['data-pillar-spoken'],undefined);assert.equal(retry.attrs['data-spoken-title-water'],undefined);console.log('ok interrupted narration never restores a stuck playing flag');
h.api.saveAudio('A complete story.',2,11);let audio=harness(h.storage);assert.equal(audio.api.audioPosition('A complete story.').index,2);assert.equal(audio.api.audioPosition('A complete story.').time,11);audio.api.clearAudio('A complete story.');assert.equal(harness(h.storage).api.audioPosition('A complete story.').time,0);console.log('ok audio position survives navigation and clears on completion');
h.api.imageReviewed('https://training.test/assets/photo.png');assert.equal(harness(h.storage).api.hasImage('/assets/photo.png'),true);assert.equal(harness(h.storage).api.hasImage('/assets/other.png'),false);console.log('ok only the reviewed image is restored');
assert.equal(harness(h.storage,2).element.classes.has('clicked'),false);assert.equal(reopened.api.resume({nextStep:'block2'}),false);console.log('ok module and prerequisite boundaries prevent wrong restoration');

let finished=harness(h.storage);assert.equal(finished.api.resume({nextStep:'block1',concepts:{block1:['water']}}),false);assert.equal(finished.renders.length,0);console.log('ok completed concepts are not reopened by stale resume points');

let practice=harness();practice.element.classes.add('is-reviewed');practice.api.capture();let continuedPractice=harness(practice.storage);assert.ok(continuedPractice.element.classes.has('is-reviewed'));assert.equal(continuedPractice.element.a['aria-pressed'],'true');console.log('ok partially reviewed practice cues survive navigation');
