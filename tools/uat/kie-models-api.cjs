const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
(async()=>{
 const compile=path=>ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const catalog={exports:{}};vm.runInNewContext(compile('lib/kie-models.ts'),{module:catalog,exports:catalog.exports});
 let signedIn=true,key='fixture-private-key',calls=0,response=()=>Response.json({code:200,data:987.5});
 const db={debugLogs:[{workspaceId:'a',provider:'kie',status:'failed',details:{model:'gpt-5-5'},error:'HTTP429 rate limit',createdAt:'2026-11-17T10:00:00Z'},{workspaceId:'b',provider:'kie',status:'success',details:{model:'gpt-5-5'},error:'other-owner-private',createdAt:'2026-11-17T11:00:00Z'}]};
 const mod={exports:{}};const deps={'next/server':{NextResponse:Response},'@/lib/session':{currentUser:async()=>signedIn?{workspaceId:'a'}:null},'@/lib/apiKeyOverrides':{getProviderApiKey:async()=>key},'@/lib/store':{readDb:async()=>db},'@/lib/kie-models':catalog.exports};
 vm.runInNewContext(compile('app/api/account/kie-models/route.ts'),{module:mod,exports:mod.exports,Response,AbortSignal,Date,console,require:name=>deps[name],fetch:async(url,opts)=>{calls++;assert.equal(url,'https://api.kie.ai/api/v1/chat/credit');assert.equal(opts.headers.Authorization,'Bearer '+key);assert(opts.signal);return response()}});
 signedIn=false;assert.equal((await mod.exports.GET()).status,401);assert.equal(calls,0);signedIn=true;
 let result=await mod.exports.GET();assert.equal(result.headers.get('cache-control'),'no-store');let data=await result.json();assert.equal(data.credits,987.5);assert.equal(data.models.length,12);assert.equal(data.models.find(m=>m.id==='gpt-5-5').lastRequest.status,'Rate limited');assert.equal(data.models.find(m=>m.id==='gemini-3-pro').lastRequest,null);assert(!JSON.stringify(data).includes(key));assert(!JSON.stringify(data).includes('other-owner-private'));assert(!data.models.some(m=>m.id==='claude-opus-4.8'));
 response=()=>Response.json({code:200,data:0});assert.equal((await(await mod.exports.GET()).json()).credits,0);
 for(const value of [null,'',{},-1]){response=()=>Response.json({code:200,data:value});assert.equal((await(await mod.exports.GET()).json()).credits,null)}
 response=()=>Response.json({code:429,msg:key});data=await(await mod.exports.GET()).json();assert.equal(data.credits,null);assert(!JSON.stringify(data).includes(key));
 response=()=>{throw new Error('Offline')};assert.equal((await(await mod.exports.GET()).json()).credits,null);
 key='';const before=calls;data=await(await mod.exports.GET()).json();assert.equal(data.configured,false);assert.equal(data.credits,null);assert.equal(calls,before);
 console.log('PASS Kie model balance auth, catalog, owner-scoped last results, zero/unknown/disconnected states, credential isolation and read-only credit request');
})().catch(e=>{console.error(e);process.exit(1)});
