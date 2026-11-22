// Exercise the real provider adapter with an in-memory HTTP transport; no provider calls.
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
(async()=>{
 const sources=['instagram','tiktok','youtube','facebook','linkedin'],calls=[];let status='RUNNING';
 const rows=sources.map((source,i)=>({title:'Creator stories '+source,url:`https://www.${source}.com/${source==='youtube'?'instagram/':''}post/${i}`,views:i*100,likes:i,description:'Creator stories'}));
 const dataset=[{organicResults:[...rows,rows[0],{title:'Creator stories spoof',url:'https://instagram.com.evil.test/post',views:900},{title:'Other topic',url:'https://instagram.com/unrelated',views:500}]}];
 const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/providers/apify.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:mod,exports:mod.exports,URL,console,process:{env:{}},require:name=>{assert.equal(name,'@/lib/apiKeyOverrides');return{getProviderApiKey:async()=> 'fixture'}},fetch:async(url,init={})=>{calls.push({url,body:init.body&&JSON.parse(init.body)});let data;if(url.includes('/acts/'))data={data:{id:'run',defaultDatasetId:'dataset'}};else if(url.includes('/actor-runs/'))data={data:{status}};else if(url.includes('/datasets/')||url.includes('/run-sync-get-dataset-items'))data=dataset;else throw Error('Unexpected HTTP '+url);return new Response(JSON.stringify(data),{status:200})}});
 const api=mod.exports,dimensions={actorSources:sources,uploadDate:'this-week',contentType:''};
 const run=await api.startKeywordScanRun('Creator stories',dimensions,0);assert.equal(calls.length,1);assert.match(calls[0].url,/apify~google-search-scraper/);assert.equal(calls[0].body.queries.split('\n').length,5);for(const source of sources)assert(calls[0].body.queries.includes('site:'+source+'.com'));
 const meta={...run,actorSources:sources,keywords:'Creator stories'};assert.equal((await api.completeKeywordScanRun(meta)).status,'running');assert.equal(calls.length,2);
 status='SUCCEEDED';let result=await api.completeKeywordScanRun(meta);assert.equal(result.items.length,5);assert.deepEqual(Array.from(result.items,x=>x.platform),['Instagram','TikTok','YouTube','Facebook','LinkedIn']);assert.equal(result.items[0].views,0,'Unknown metrics are not invented');assert.equal(result.items[4].views,400);
 result=await api.completeKeywordScanRun({...meta,minViews:250});assert.equal(result.items.length,2);assert(result.items.every(x=>x.views>=250));
 status='FAILED';await assert.rejects(()=>api.completeKeywordScanRun(meta),/FAILED/);
 const before=calls.length;const fallback=await api.scanKeywordsWithApify('Creator stories',dimensions,0,{skipPlatformActor:true});assert.equal(calls.length,before+1);assert.equal(fallback.length,5);
 await api.startKeywordScanRun('Creator stories',{actorSources:['tiktok']},0);assert.match(calls.at(-1).url,/clockworks~tiktok-scraper/);assert(calls.at(-1).body.searchQueries);
 console.log('PASS one async run with five platform queries, running/completed/failed lifecycle, accurate mixed platforms/metrics, domain boundaries/dedup/minimum views, multi-source recovery and single-platform regression');
})().catch(e=>{console.error(e);process.exit(1)});
