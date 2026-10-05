const assert=require('node:assert/strict');
const handler=require('../api/tts.js');
async function run(){
 const originalFetch=global.fetch,originalKey=process.env.ELEVENLABS_API_KEY;
 try{
  process.env.ELEVENLABS_API_KEY='test-only';
  let calls=[];
  global.fetch=async(url,opts)=>{calls.push({url,body:JSON.parse(opts.body)});return{ok:true,arrayBuffer:async()=>Buffer.from('sample')};};
  function response(){return {headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(v){this.body=v;},send(v){this.body=v;}};}
  let res=response();await handler({method:'POST',body:{text:'A calm teaching narration.'}},res);
  assert.equal(res.code,200);assert.ok(calls[0].url.endsWith('pFZP5JQG7iQjIQuC4Bku'));assert.equal(calls[0].body.voice_settings.speed,.95);
  assert.equal(calls[0].body.model_id,'eleven_multilingual_v2');
  console.log('ok direct Lily settings');
  global.fetch=async(url)=>{if(url.includes('api.elevenlabs.io'))throw Error('timeout');return{ok:true,json:async()=>({audioBase64:Buffer.from('backup').toString('base64')})};};
  res=response();await handler({method:'POST',body:{text:'A calm teaching narration.'}},res);assert.equal(res.code,200);assert.equal(res.body.toString(),'backup');
  console.log('ok upstream failure reaches fallback');
  global.fetch=async()=>{throw Error('offline');};res=response();await handler({method:'POST',body:{text:'A calm teaching narration.'}},res);assert.equal(res.code,502);
  console.log('ok both providers failing returns controlled error');
 }finally{global.fetch=originalFetch;if(originalKey===undefined)delete process.env.ELEVENLABS_API_KEY;else process.env.ELEVENLABS_API_KEY=originalKey;}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
