const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
(async()=>{
 const mod={exports:{}};let responses=[],calls=[],delays=[],key='fixture';
 const source=ts.transpileModule(fs.readFileSync('lib/providers/kie.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(source,{module:mod,exports:mod.exports,Response,AbortSignal,process:{env:{}},console,
  require:name=>{assert.equal(name,'@/lib/apiKeyOverrides');return{getProviderApiKey:async()=>key}},
  setTimeout:(fn,ms)=>{delays.push(ms);fn()},fetch:async(url,opts)=>{calls.push({url,opts});const next=responses.shift();if(next instanceof Error)throw next;assert(next,'Unexpected retry');return next}
 });
 const plan={topic:'Fixture brief',videoPrompt:'A useful creation prompt',format:'Short video 9:16'};
 const good=()=>Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(plan)}]}]});
 const run=async(items)=>{responses=items;calls=[];delays=[];return mod.exports.generateContentPlanWithGpt55({idea:'Fixture idea',niche:'Fixture niche'})};
 assert.equal((await run([good()])).topic,plan.topic);
 assert.equal(calls[0].url,'https://api.kie.ai/codex/v1/responses');
 const body=JSON.parse(calls[0].opts.body);assert.equal(body.model,'gpt-5-5');assert.equal(body.stream,false);assert.equal(body.input[0].content[0].type,'input_text');assert(calls[0].opts.signal);
 responses=[Response.json({choices:[{message:{content:JSON.stringify(plan)},finish_reason:'stop'}]})];calls=[];
 assert.equal((await mod.exports.generateContentPlanWithGpt55({idea:'Alternate',niche:'Test'},'Fixture prompt','gemini-3-pro')).topic,plan.topic);
 assert.equal(calls.length,1);assert.equal(calls[0].url,'https://api.kie.ai/gemini-3-pro/v1/chat/completions');assert.deepEqual(JSON.parse(calls[0].opts.body),{stream:false,messages:[{role:'user',content:[{type:'text',text:'Fixture prompt'}]}]});
 for(const payload of [{code:429,msg:'Gemini capacity limited'},{choices:[{message:{content:JSON.stringify(plan)},finish_reason:'length'}]},{choices:[{message:{content:'{}'},finish_reason:'stop'}]}]){
  responses=[Response.json(payload)];calls=[];
  await assert.rejects(mod.exports.generateContentPlanWithGpt55({idea:'Alternate',niche:'Test'},'Fixture prompt','gemini-3-pro'),e=>e instanceof mod.exports.KieBriefError&&e.diagnostics.model==='gemini-3-pro'&&/Gemini 3 Pro/.test(e.message));assert.equal(calls.length,1);
 }
 calls=[];await assert.rejects(mod.exports.generateContentPlanWithGpt55({idea:'Test',niche:''},'Fixture','untrusted-model'),e=>/Unsupported/.test(e.message));assert.equal(calls.length,0);
 assert.equal((await run([new Response('Server exception',{status:500}),good()])).topic,plan.topic);assert.equal(calls.length,2);assert.deepEqual(delays,[1000]);
 await assert.rejects(run([new Response('Down',{status:503,headers:{'retry-after':'30'}}),new Response('Down',{status:500})]),e=>e instanceof mod.exports.KieBriefError && e.retryable && /temporarily unavailable/.test(e.userMessage));assert.equal(calls.length,2);assert.deepEqual(delays,[5000]);
 for(const status of [400,401,403,429]){await assert.rejects(run([new Response('Rejected',{status})]),e=>e instanceof mod.exports.KieBriefError);assert.equal(calls.length,1);assert.equal(delays.length,0)}
 const quotaMessage='Requests are limited for this model. '+ 'Diagnostic context. '.repeat(15)+'Retry after the current requests complete.';
 await assert.rejects(run([Response.json({error:{message:quotaMessage,code:'rate_limit_exceeded',type:'rate_limit_error'}},{status:429,headers:{'x-request-id':'req-brief-429','retry-after':'25'}})]),e=>{
  assert(e.message.includes(quotaMessage));assert(e.userMessage.includes('rate_limit_exceeded'));assert(!e.userMessage.includes('quota has been reached'));
  const d=e.diagnostics.attempts[0];assert.equal(d.httpStatus,429);assert.equal(d.providerCode,'rate_limit_exceeded');assert.equal(d.providerType,'rate_limit_error');assert.equal(d.requestId,'req-brief-429');assert.equal(d.retryAfter,'25');assert.equal(d.attempt,1);assert.equal(d.providerMessage,quotaMessage);return true;
 });assert.equal(calls.length,1);
 for(const status of [200,402])await assert.rejects(run([Response.json({code:402,msg:'Insufficient credits for this request',request_id:'req-credit'},{status})]),e=>{
  assert.match(e.userMessage,/Insufficient credits/);assert.equal(e.diagnostics.attempts[0].httpStatus,status);assert.equal(e.diagnostics.attempts[0].providerCode,'402');assert.equal(e.retryable,false);return true;
 });
 await assert.rejects(run([Response.json({error:{code:'rate_limit_exceeded',message:'Concurrent request limit exceeded'}})]),e=>/Concurrent request limit exceeded/.test(e.message));assert.equal(calls.length,1);
 await assert.rejects(run([new Response('First gateway failure',{status:502}),new Response('Second gateway failure',{status:503})]),e=>{
  assert.equal(e.diagnostics.attempts.length,2);assert.match(e.diagnostics.attempts[0].responseBody,/First gateway/);assert.match(e.message,/Second gateway/);return true;
 });
 key='sensitive-kie-token';
 await assert.rejects(run([Response.json({error:{message:'Rejected sensitive-kie-token Bearer unrelated-key api_key=other-secret',code:'429'},credentials:{password:'multi word password',nested:{access_token:'nested-secret'}},request:{headers:{Authorization:'Bearer another-secret'}}},{status:429})]),e=>{
  const all=JSON.stringify({message:e.message,userMessage:e.userMessage,diagnostics:e.diagnostics});for(const secret of [key,'unrelated-key','other-secret','multi word password','nested-secret','another-secret'])assert(!all.includes(secret),secret+' must be redacted');assert(all.includes('[REDACTED]'));return true;
 });
 await assert.rejects(run([new Error('Connection lost for '+key)]),e=>!e.message.includes(key)&&!JSON.stringify(e.diagnostics).includes(key));
 await assert.rejects(run([Response.json({code:429,msg:'password="multi word fixture" api_key=second-fixture Authorization: Basic dXNlcjpwYXNz '+key})]),e=>{
  const all=JSON.stringify({message:e.message,userMessage:e.userMessage,diagnostics:e.diagnostics});for(const secret of ['multi word fixture','second-fixture','dXNlcjpwYXNz',key])assert(!all.includes(secret),secret+' must be absent from every diagnostic');return true;
 });
 await assert.rejects(run([new Response('x'.repeat(12000)+key,{status:429})]),e=>e.diagnostics.attempts[0].responseBody.length<8100&&e.message.length<4200&&e.userMessage.length<900&&!JSON.stringify(e.diagnostics).includes(key));
 key='fixture';
 for(const value of [new Error('Connection reset'),new DOMException('Timed out','TimeoutError')]){await assert.rejects(run([value]),e=>/connection to Kie was interrupted/.test(e.userMessage));assert.equal(calls.length,1)}
 for(const payload of [null,{}, {status:500,output:[]},{status:{code:'upstream_failed'},output:[]},{status:'completed',output:[null,{content:[null]}]},{status:'incomplete',output:[]},{error:{message:'Server exception'}},{code:500,msg:'Server error'},{status:'completed',output:[]},{status:'completed',output:[{content:[{type:'output_text',text:'not JSON'}]}]},{output:[{content:[{type:'output_text',text:JSON.stringify({topic:'Missing prompt'})}]}]}]){await assert.rejects(run([Response.json(payload)]),e=>e instanceof mod.exports.KieBriefError && Boolean(e.diagnostics.attempts[0].responseBody));assert.equal(calls.length,1)}
 await assert.rejects(run([new Response('<html>Gateway</html>')]),e=>/incomplete brief/.test(e.userMessage));
 key='';await assert.rejects(run([]),e=>/not configured/.test(e.userMessage));assert.equal(calls.length,0);
 console.log('PASS Kie brief request contract; bounded server retry; auth/quota/network handling; incomplete/error/invalid output rejection; no provider requests');
})().catch(e=>{console.error(e);process.exit(1)});
