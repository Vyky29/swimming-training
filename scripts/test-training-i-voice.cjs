const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('common/shared/training-i-module-shell.js','utf8');
async function run(failure){
 const audios=[],out=[],listeners={};let requests=0;
 const context={global:{},document:{hidden:false,addEventListener(k,v){listeners[k]=v;}},AbortSignal,
 fetch:async()=>{requests++;if(failure==='network')throw Error('offline');return{ok:true,blob:async()=>({})};},
 URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},Audio:class{constructor(){audios.push(this);}pause(){}play(){return failure==='autoplay'?Promise.reject(Error('blocked')):Promise.resolve();}}};
 vm.createContext(context);vm.runInContext(src.slice(src.indexOf('  var voiceAudio ='),src.indexOf('  function sectionSpeech')),context);
 const words='This is a complete sentence about the water. '.repeat(250);
 const pieces=context.voicePieces(words);assert.equal(pieces.join(' '),words.trim());assert.ok(pieces.length>8,'long scripts must not truncate');
 context.global.CSTrainingVoice.speak('One clear sentence.',r=>out.push(r.completed));
 for(let i=0;i<10;i++)await Promise.resolve();
 if(!failure){assert.deepEqual(out,[]);audios[0].onended();assert.deepEqual(out,[true]);}
 else if(failure==='stop'){context.global.CSTrainingVoice.stop();assert.deepEqual(out,[false]);audios[0].onended();assert.deepEqual(out,[false]);}
 else if(failure==='decode'){audios[0].onerror();assert.deepEqual(out,[false]);}
 else assert.deepEqual(out,[false]);
 if(failure==='network'){
  context.global.CSTrainingVoice.speak('One clear sentence.',r=>out.push(r.completed));
  for(let i=0;i<10;i++)await Promise.resolve();assert.equal(requests,2,'failed cache must be retryable');
 }
 console.log('ok narration '+(failure||'ends successfully'));
}
async function resumeAudio(){
 const audios=[],saved=[],cleared=[];
 const context={global:{TrainingIResume:{audioPosition:()=>({index:1,time:11}),saveAudio:(...x)=>saved.push(x),clearAudio:t=>cleared.push(t)}},
 document:{hidden:false,addEventListener(){}},AbortSignal,fetch:async()=>({ok:true,blob:async()=>({})}),
 URL:{createObjectURL:()=> 'blob:resume',revokeObjectURL(){}},Audio:class{constructor(){this.duration=30;this.currentTime=0;audios.push(this);}pause(){}play(){return Promise.resolve();}}};
 vm.createContext(context);vm.runInContext(src.slice(src.indexOf('  var voiceAudio ='),src.indexOf('  function sectionSpeech')),context);
 const text='A complete sentence about movement in water. '.repeat(20);
 assert.equal(context.voicePieces(text).length,2);
 let complete=false;context.global.CSTrainingVoice.speak(text,r=>complete=r.completed);
 for(let i=0;i<10;i++)await Promise.resolve();
 audios[0].onloadedmetadata();assert.equal(audios[0].currentTime,11);
 audios[0].currentTime=16.7;audios[0].ontimeupdate();assert.equal(saved[0][1],1);assert.equal(saved[0][2],16);
 audios[0].onended();assert.equal(complete,true);assert.deepEqual(cleared,[text]);assert.equal(audios.length,1);
 console.log('ok narration seeks saved chunk and second, then clears checkpoint');
}
(async()=>{await resumeAudio();for(const kind of [null,'network','autoplay','decode','stop'])await run(kind);})().catch(e=>{console.error(e);process.exitCode=1;});
