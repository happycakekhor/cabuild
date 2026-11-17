// Real provider + route code with fixture transport/storage; browser checks use local login only.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const local='http://localhost:3100',base=process.env.UAT_BASE_URL||local;
 const provider={exports:{}},route={exports:{}},db={workspaces:[{id:'owner-a',niche:'Test'}],personaProfiles:[],debugLogs:[]};
 const compile=path=>ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(compile('lib/providers/kie.ts'),{module:provider,exports:provider.exports,Response,AbortSignal,Error,console,process:{env:{}},require:()=>({getProviderApiKey:async()=> 'fixture-private-token'}),fetch:async()=>Response.json({error:{message:'Concurrent request limit reached. Wait for existing requests to finish.',code:'rate_limit_exceeded',type:'rate_limit_error'}},{status:429,headers:{'x-request-id':'req-test-429','retry-after':'30'}})});
 const deps={'next/server':{NextResponse:Response},'@/lib/session':{currentUser:async()=>({id:'fixture-user',workspaceId:'owner-a'})},'@/lib/store':{mutateDb:async fn=>fn(db),id:()=>String(db.debugLogs.length)},'@/lib/persona':{buildPersonaContext:()=>''},'@/lib/providers/kie':provider.exports};
 vm.runInNewContext(compile('app/api/social/route.ts'),{module:route,exports:route.exports,Request,Response,Error,Date,console,require:name=>deps[name]||{}});
 const failed=await route.exports.POST(new Request(local+'/api/social',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generateBriefWithAi',idea:'Fun marketing',workspaceId:'other-owner',usePersona:false})}));
 assert.equal(failed.status,502);const failure=await failed.json();
 assert.match(failure.error,/HTTP 429.*rate_limit_exceeded.*Concurrent request limit/);assert(db.debugLogs.every(log=>log.workspaceId==='owner-a'));assert.equal(db.debugLogs.at(-1).details.attempts[0].requestId,'req-test-429');
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const context=await browser.newContext(),page=await context.newPage();let data;const errors=[],unexpected=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/api/**',async r=>{
   const req=r.request(),url=new URL(req.url());
   if(url.pathname==='/api/app'&&data)return r.fulfill({json:data});
   if(/credits|credentials|integrations/.test(url.pathname))return r.fulfill({json:{workspace:{credits:100},providers:[]}});
   if(req.method()!=='GET'&&!(url.origin===local&&url.pathname==='/api/auth/login')){
    if(url.pathname==='/api/social'&&req.postDataJSON().action==='generateBriefWithAi')return r.fulfill({status:502,json:failure});
    unexpected.push(url.pathname);return r.fulfill({status:403,json:{error:'No-spend test blocked write'}});
   }
   return r.continue();
  });
  await page.goto(local+'/login');await page.getByRole('button',{name:'Enter workspace'}).click();await page.locator('.desktop-sidebar').waitFor();
  data=await(await context.request.get(local+'/api/app')).json();data.debugLogs=db.debugLogs;data.assets=[];data.publishQueue=[];
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:1000});
   await page.goto(base+'/?view=publish&compose=1');await page.getByLabel('Your idea',{exact:true}).fill('Fun marketing');
   await page.getByRole('button',{name:'Generate Brief',exact:true}).click();
   await page.locator('.provider-error').filter({hasText:'Concurrent request limit reached'}).waitFor();
   assert.equal(await page.locator('textarea[name="idea"]').inputValue(),'Fun marketing');assert(await page.getByRole('button',{name:'Try again',exact:true}).isEnabled());
   await page.goto(base+'/?view=logs');
   const row=page.locator('.log-row').filter({hasText:'content plan generation failed'});await row.waitFor();
   assert.match(await row.locator('.provider-error').innerText(),/HTTP 429.*rate_limit_exceeded.*Concurrent request limit/);
   await row.getByText('Payload / result details',{exact:true}).click();
   assert.match(await row.locator('pre').last().innerText(),/req-test-429/);assert.match(await row.locator('pre').last().innerText(),/retryAfter/);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal page overflow at '+width);
   await page.reload();await page.locator('.log-row .provider-error').filter({hasText:'Concurrent request limit reached'}).waitFor();
   await page.locator('.log-filters select').nth(1).selectOption('failed');assert.equal(await page.locator('.log-row').count(),1);
   console.log('PASS brief error and log details at width',width);
  }
  assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
  console.log('PASS provider -> route -> owner-scoped Logs; specific inline error, retained idea, retry, persisted log reload/filter and request metadata at 1440/390/320; fixture transport only');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
