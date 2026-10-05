// Explicit live integration check; invokes the existing voice service once.
const handler=require('../api/tts.js');
const response={headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(v){throw Error(JSON.stringify(v));},send(v){
 if(this.code!==200 || this.headers['X-Training-Voice-Id']!=='B9PDs7mcHTMxHUw5U8Cf' || v.length<1000)throw Error('Invalid narration');
 console.log(JSON.stringify({status:this.code,voice:this.headers['X-Training-Voice-Id'],type:this.headers['Content-Type'],bytes:v.length}));
}};
handler({method:'POST',body:{text:"Inside this module, we'll explore the following blocks. Block one. The nature of water and its forces."}},response).catch(e=>{console.error(e.message);process.exitCode=1;});
