const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
function load(path,deps){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,Response,Request,Error,URL,console,require:name=>{if(name in deps)return deps[name];throw Error('Unexpected dependency '+name)}});return m.exports}
(async()=>{
 let user={id:'a',workspaceId:'a'},counter=0,fallback=false,lastDimensions,lastCompletion;
 const db={workspaces:[{id:'a'},{id:'b'}],brandKits:[],personaProfiles:[],assets:[],competitors:[],competitorResults:[],opportunities:[],briefs:[],publishQueue:[],activity:[],researchScans:Array.from({length:24},(_,i)=>({id:'saved-'+i,workspaceId:'a',url:'https://example.test/'+i,createdAt:new Date(Date.UTC(2026,10,1,0,i)).toISOString(),status:i===0?'running':'done',resultIds:[]}))};
 db.researchScans.push({id:'private-b',workspaceId:'b',url:'https://example.test/private',status:'running',resultIds:[],createdAt:'2026-11-01T00:00:00Z'});
 const originalIds=db.researchScans.map(s=>s.id);
 const common={'next/server':{NextResponse:Response},'@/lib/session':{currentUser:async()=>user},'@/lib/store':{readDb:async()=>db,mutateDb:async f=>f(db),id:()=>String(++counter)},'@/lib/providers/uploadPost':{getConnectedUploadPostAccounts:async()=>[]}};
 const app=load('app/api/app/route.ts',common);
 const social=load('app/api/social/route.ts',{...common,'@/lib/automation-schedule':{},'@/lib/automation-runner':{},'@/lib/permissions':{},'@/lib/persona':{},'@/lib/providers/kie':{},'@/lib/providers/apify':{startSocialUrlScanRun:async()=>({runId:'fixture',datasetId:'fixture',actorId:'fixture'}),startKeywordScanRun:async(q,d)=>{lastDimensions=d;return fallback?null:{runId:'fixture',datasetId:'fixture',actorId:'fixture'}},completeKeywordScanRun:async meta=>{lastCompletion=meta;return{status:'done',items:[{sourceUrl:'https://youtube.com/watch?v=fixture',platform:'YouTube',title:'Creator stories',description:'Fixture',views:100,likes:2,comments:1,publishedAt:'2026-11-22',mediaType:'video',mediaUrl:'',thumbnailUrl:''}]}},scanKeywordsWithApify:async()=>[]}});
 const send=async body=>{const r=await social.POST(new Request('http://local/api/social',{method:'POST',body:JSON.stringify(body)}));return{status:r.status,body:await r.json()}};
 let result=await(await app.GET()).json();assert.equal(result.researchScans.length,24);assert.equal(result.researchScans[0].id,'saved-23');assert(!result.researchScans.some(s=>s.id==='private-b'));
 assert.equal((await send({action:'scanResearchUrl',url:'https://instagram.com/fixture',workspaceId:'b'})).body.workspaceId,'a');
 assert.equal((await send({action:'scanKeywordResearch',keywords:'fixture one',dimensions:{actorSources:['instagram']}})).body.status,'running');
 fallback=true;assert.equal((await send({action:'scanKeywordResearch',keywords:'fixture fallback',dimensions:{actorSources:['instagram']}})).body.status,'done');
 for(const id of originalIds)assert(db.researchScans.some(s=>s.id===id),'Old and other-owner histories are never pruned');
 result=await(await app.GET()).json();assert.equal(result.researchScans.length,27);
 fallback=false;const all=await send({action:'scanKeywordResearch',keywords:'all platforms fixture'});assert.equal(all.body.status,'running');assert.equal(lastDimensions.actorSources.length,5);assert.equal(all.body.dimensions.actorSources.length,5);
 const done=await send({action:'syncResearchScan',id:all.body.id});assert.equal(done.body.status,'done');assert.equal(lastCompletion.actorSources.length,5);assert.equal(db.competitorResults.at(-1).platform,'YouTube');
 assert.equal((await send({action:'scanKeywordResearch',keywords:'all platforms fixture',dimensions:{actorSources:['all']}})).body.id,all.body.id,'Equivalent all-source searches use one cached scan');
 assert.equal((await send({action:'scanKeywordResearch',keywords:'invalid',dimensions:{actorSources:['unsupported']}})).status,400);
 assert.equal((await send({action:'syncResearchScan',id:'private-b',workspaceId:'b'})).body.status,'missing');
 assert.equal((await send({action:'scanKeywordResearch',keywords:''})).status,400);
 user=null;assert.equal((await app.GET()).status,401);assert.equal((await send({action:'scanResearchUrl',url:'https://example.test'})).status,401);
 console.log('PASS all 27 owner-scoped searches, URL/keyword/fallback retention, running history preservation, other-owner sync isolation and anonymous denial; in-memory storage and provider fixtures only');
})().catch(e=>{console.error(e);process.exit(1)});
