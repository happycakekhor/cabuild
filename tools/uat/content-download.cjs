const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
(async()=>{
 let signedIn=true;
 const db={assets:[{id:'mine',workspaceId:'owner-a',title:'Captioned post',type:'text',assetUrl:'data:text/plain;charset=utf-8,Full%20saved%20text'},{id:'other',workspaceId:'owner-b',title:'Private output',type:'text',assetUrl:'data:text/plain,PRIVATE'},{id:'pending',workspaceId:'owner-a',title:'Still generating',type:'video'}]};
 const module={exports:{}};
 const mocks={'next/server':{NextResponse:Response},'@/lib/session':{currentUser:async()=>signedIn?{id:'user-a',workspaceId:'owner-a'}:null},'@/lib/store':{readDb:async()=>db}};
 const code=ts.transpileModule(fs.readFileSync('app/api/assets/[id]/download/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{module,exports:module.exports,require:id=>{assert(id in mocks,id);return mocks[id]},Response,fetch:()=>{throw Error('Unexpected external fetch')},decodeURIComponent});
 const send=id=>module.exports.GET(new Request('http://local/api/assets/'+id+'/download'),{params:{id}});
 let response=await send('mine');assert.equal(response.status,200);assert.equal(await response.text(),'Full saved text');assert.match(response.headers.get('content-disposition'),/attachment.*captioned-post.txt/);
 for(const id of ['other','pending','missing'])assert.equal((await send(id)).status,404);
 signedIn=false;assert.equal((await send('mine')).status,401);
 console.log('PASS actual download handler: owned text attachment, other-owner/missing/not-ready denial and anonymous401; fixture storage, no network');
})().catch(e=>{console.error(e);process.exit(1)});