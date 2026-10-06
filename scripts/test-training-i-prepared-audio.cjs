const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('common/shared/training-i-module-shell.js','utf8');
const manifestCtx={window:{}};vm.runInNewContext(fs.readFileSync('common/shared/training-i-prepared-audio.js','utf8'),manifestCtx);
const prepared=manifestCtx.window.TrainingIPreparedAudio;
for(const path of Object.values(prepared)) assert.ok(fs.statSync('common'+path).size>1000, path);
assert.ok(Object.keys(prepared).length>=31, 'prepared introductions, journeys, blocks and recaps');
const normalize=s=>s.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&#39;|&#x27;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
for(let n=1;n<=5;n++){
 const html=fs.readFileSync(`training-i/modules/module-${n}/index.html`,'utf8').split('id="inside-module"')[1].split('</section>')[0];
 const titles=[...html.matchAll(/<div class="journey-title">([\s\S]*?)<\/div>/g)].map(m=>normalize(m[1]));
 const hints=[...html.matchAll(/<div class="journey-status module-roadmap__hint">([\s\S]*?)<\/div>/g)].map(m=>normalize(m[1]));
 const text="Inside this module, we'll explore the following blocks. "+titles.map((t,i)=>`Block ${i+1}. ${t}. ${hints[i]}`).join(' ');
 assert.ok(prepared[text],`M${n} exact spoken script has prepared audio`);
 assert.ok(fs.statSync('common'+prepared[text]).size>1000);
}
async function check(failStatic){
 const requests=[],audios=[];const context={global:{TrainingIPreparedAudio:prepared},document:{hidden:false,addEventListener(){}},AbortSignal,
 fetch:async(url)=>{requests.push(url);return {ok:!(failStatic&&url!='/api/tts'),blob:async()=>({})};},
 URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},Audio:class{constructor(){audios.push(this);}pause(){}play(){return Promise.resolve();}}};
 vm.createContext(context);vm.runInContext(src.slice(src.indexOf('  var voiceAudio ='),src.indexOf('  function sectionSpeech')),context);
 const text=Object.keys(prepared)[0];context.global.CSTrainingVoice.prefetch(text);
 for(let i=0;i<20;i++)await Promise.resolve();
 assert.equal(audios.length,0,'prefetch must not play or award completion');
 let completed=false;context.global.CSTrainingVoice.speak(text,r=>completed=r.completed);
 for(let i=0;i<20;i++)await Promise.resolve();
 assert.equal(audios.length,1);assert.equal(completed,false);
 assert.equal(requests.filter(x=>x==='/api/tts').length,failStatic?1:0);
 assert.equal(requests.filter(x=>x===prepared[text]).length,1,'play reuses the warmed request');
 audios[0].onended();assert.equal(completed,true);
}
(async()=>{await check(false);await check(true);console.log('ok all five scripts match prepared audio; silent prefetch is reused; missing asset falls back to Holly generation');})().catch(e=>{console.error(e);process.exitCode=1;});

// Reopening a page must reuse downloaded narration without regenerating it.
(async()=>{
 const saved=new Map();let requests=0;
 const cache={match:async k=>saved.get(k),put:async(k,v)=>saved.set(k,v),keys:async()=>[...saved.keys()],delete:async k=>saved.delete(k)};
 function engine(){
  const ctx={global:{caches:{open:async()=>cache},crypto:require('node:crypto').webcrypto},TextEncoder,Uint8Array,document:{hidden:false,addEventListener(){}},AbortSignal,
   fetch:async()=>{requests++;return {ok:true,clone(){return this;},blob:async()=>({})};},URL:{createObjectURL:()=> 'blob:disk',revokeObjectURL(){}},Audio:class{play(){return Promise.resolve();}pause(){}}};
  vm.createContext(ctx);vm.runInContext(src.slice(src.indexOf('  var voiceAudio ='),src.indexOf('  function sectionSpeech')),ctx);return ctx;
 }
 await engine().fetchVoice('A saved narration.');
 for(let i=0;i<5;i++)await new Promise(setImmediate);
 await engine().fetchVoice('A saved narration.');assert.equal(requests,1);
 console.log('ok a new page reuses the persistent voice cache without TTS');
})().catch(e=>{console.error(e);process.exitCode=1;});
