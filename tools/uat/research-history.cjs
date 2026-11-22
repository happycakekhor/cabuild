// No-spend Research journeys against a production build; every provider request is intercepted.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const local='http://localhost:3100',base=process.env.UAT_BASE_URL||local;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 let data,releaseStart,failStart=false,complete=false,sequence=0,holdSync=true;const errors=[],blocked=[],starts=[],syncs=[],releaseSync=[];
 await context.route('**/api/**',async route=>{
  const req=route.request(),url=new URL(req.url()),path=url.pathname;
  if(path==='/api/app'&&data)return route.fulfill({json:data});
  if(/credits|credentials|integrations/.test(path))return route.fulfill({json:{user:{name:'Fixture'},workspace:{credits:100},providers:[]}});
  if(req.method()!=='GET'&&!(url.origin===local&&path==='/api/auth/login')){
   const body=req.postDataJSON();
   if(path==='/api/social'&&body.action==='syncResearchScan'){
    syncs.push(body.id);
    if(holdSync)await new Promise(resolve=>releaseSync.push(resolve));
    const scan=data.researchScans.find(s=>s.id===body.id);
    if(complete&&scan){scan.status='done';scan.resultIds=['result'];}
    return route.fulfill({json:scan||{status:'missing'}});
   }
   if(path==='/api/social'&&['scanResearchUrl','scanKeywordResearch'].includes(body.action)){
    starts.push(body);await new Promise(resolve=>{releaseStart=resolve});
    if(failStart)return route.fulfill({status:502,json:{error:'Fixture provider unavailable'}});
    const scan={id:'new-'+(++sequence),workspaceId:data.workspace.id,url:body.url||'keyword:'+body.keywords,query:body.keywords,platform:'Instagram',dimensions:body.dimensions,minViews:Number(body.minViews),status:'running',resultIds:[],createdAt:new Date().toISOString(),source:'apify'};
    data.researchScans.unshift(scan);return route.fulfill({json:scan});
   }
   blocked.push(path+':'+body.action);return route.fulfill({status:403,json:{error:'No-spend test blocked write'}});
  }
  return route.continue();
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(local+'/login');await page.getByRole('button',{name:'Enter workspace'}).click();await page.locator('.global-header').waitFor();
 data=await(await context.request.get(local+'/api/app')).json();
 data.assets=[];data.publishQueue=[];
 data.competitorResults=[{id:'result',workspaceId:data.workspace.id,platform:'Instagram',url:'https://example.test/post',title:'Saved result',description:'Fixture source content',mediaType:'image',views:150,likes:20,comments:2,publishedAt:'2026-11-20T10:00:00Z',capturedAt:'2026-11-20T10:00:00Z'}];
 data.researchScans=Array.from({length:24},(_,i)=>({id:'saved-'+i,workspaceId:data.workspace.id,url:'keyword:Saved search '+i,query:'Saved search '+i,platform:'Instagram',minViews:0,resultIds:['result'],createdAt:new Date(Date.UTC(2026,10,20,0,i)).toISOString(),status:i===0?'failed':'done',error:i===0?'Fixture failure':undefined,source:'apify'}));
 const fits=async()=>assert(await page.locator('.main').evaluate(e=>e.scrollWidth<=e.clientWidth+1&&document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
 const dockVisible=async()=>assert(await page.locator('.research-search-dock').evaluate(e=>{const r=e.getBoundingClientRect(),h=document.querySelector('.topbar').getBoundingClientRect();return r.top>=h.bottom-1&&r.bottom<=innerHeight}),'Search remains below header and inside viewport');
 const settle=()=>page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{}))));
 fs.mkdirSync('.playwright-mcp',{recursive:true});
 for(const width of [1440,1101,768,390,320]){
  await page.setViewportSize({width,height:1000});await page.goto(base+'/?view=research');await page.locator('.research-recent').waitFor();await settle();
  assert.equal(await page.getByRole('button',{name:'View all',exact:true}).count(),0);
  assert.equal(await page.locator('.research-history-entry').count(),24);
  assert(await page.locator('#research-history-list').evaluate(e=>e.scrollHeight>e.clientHeight&&getComputedStyle(e).overflowY==='auto'));
  await page.getByLabel('Social URL',{exact:true}).fill('https://example.test/draft');const input=await page.getByLabel('Social URL',{exact:true}).elementHandle();
  await page.locator('#research-entry-saved-2').click();await page.getByRole('button',{name:'Back to history'}).waitFor();await settle();
  assert.equal(await page.locator('.research-recent').count(),0);assert.equal(await page.locator('.result-row').count(),1);
  assert(await page.getByLabel('Social URL',{exact:true}).evaluate((e,old)=>e===old,input),'Form never remounts when opening a result');
  await page.locator('.main').evaluate(e=>e.scrollTop=e.scrollHeight);await dockVisible();await fits();
  await page.getByRole('button',{name:'Back to history'}).click();await page.locator('.research-recent').waitFor();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'research-entry-saved-2');
  await page.goForward();await page.locator('.saved-search-summary').waitFor();await page.reload();await page.locator('.saved-search-summary').waitFor();
  assert.equal(await page.locator('.result-row').count(),1);await page.getByRole('button',{name:'Back to history'}).click();await page.locator('.research-recent').waitFor();
  await page.getByRole('button',{name:'Search by keywords'}).click();await page.getByLabel('Keywords',{exact:true}).fill('Draft keywords');
  await page.locator('#research-entry-saved-23').click();await page.locator('.saved-search-summary').waitFor();
  assert.equal(await page.getByLabel('Keywords',{exact:true}).inputValue(),'Draft keywords');await dockVisible();await fits();
  await page.screenshot({path:'.playwright-mcp/research-persistent-'+width+'.png'});
  console.log('PASS all history, sticky URL/keyword search, draft DOM, result/back/forward/refresh and bounds',width);
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/?view=research');await page.locator('#research-entry-saved-23').click();
 await page.getByLabel('Social URL',{exact:true}).fill('https://example.test/new');await page.getByRole('button',{name:'Search',exact:true}).click();
 await page.locator('#research-entry-starting-search').waitFor();assert.match(await page.locator('#research-entry-starting-search').innerText(),/Searching/);assert.equal(await page.locator('.results-card').count(),0);
 assert(await page.getByRole('button',{name:'Searching...',exact:true}).isDisabled());
 await page.waitForFunction(()=>document.querySelector('#research-entry-starting-search'));while(!releaseStart)await new Promise(r=>setTimeout(r,20));releaseStart();releaseStart=null;
 await page.locator('#research-entry-new-1').waitFor();await page.locator('#research-entry-starting-search').waitFor({state:'hidden'});
 assert(await page.getByRole('button',{name:'Search',exact:true}).isEnabled());assert.match(await page.locator('#research-entry-new-1').innerText(),/Searching/);
 await page.getByRole('button',{name:'Search by keywords'}).click();await page.getByLabel('Keywords',{exact:true}).fill('Second search');await page.getByLabel('Keywords',{exact:true}).press('Enter');await page.locator('#research-entry-starting-search').waitFor();
 while(!releaseStart)await new Promise(r=>setTimeout(r,20));releaseStart();releaseStart=null;await page.locator('#research-entry-new-2').waitFor();
 assert.equal(starts.length,2);
 while(!syncs.includes('new-2'))await new Promise(r=>setTimeout(r,20));
 assert.equal(syncs.filter(id=>id==='new-1').length,1,'Adding a scan reuses the first scan’s in-flight status request');
 complete=true;holdSync=false;releaseSync.forEach(resolve=>resolve());
 await page.waitForFunction(()=>document.querySelector('#research-entry-new-1')?.textContent.includes('Completed')&&document.querySelector('#research-entry-new-2')?.textContent.includes('Completed'),null,{timeout:20000});
 assert(syncs.includes('new-1')&&syncs.includes('new-2'),'All background scans are polled without opening a result');
 await page.reload();await page.locator('#research-entry-new-2').waitFor();assert.equal(await page.locator('.research-history-entry').count(),26);
 await page.locator('#research-entry-saved-0').click();await page.getByRole('alert').filter({hasText:'Fixture failure'}).waitFor();await page.getByRole('button',{name:'Edit search'}).click();assert.equal(await page.getByLabel('Keywords',{exact:true}).inputValue(),'Saved search 0');
 failStart=true;await page.getByRole('button',{name:'Search',exact:true}).click();await page.locator('#research-entry-starting-search').waitFor();while(!releaseStart)await new Promise(r=>setTimeout(r,20));releaseStart();releaseStart=null;
 await page.getByRole('alert').filter({hasText:'couldn’t start'}).waitFor();assert.equal(await page.getByLabel('Keywords',{exact:true}).inputValue(),'Saved search 0');assert.equal(await page.locator('#research-entry-starting-search').count(),0);
 await page.goto(base+'/?view=research&researchScan=other-owner');await page.getByRole('heading',{name:'Search unavailable'}).waitFor();assert.equal(await page.locator('.result-row').count(),0);await page.getByRole('button',{name:'Back to history'}).click();await page.locator('.research-recent').waitFor();
 data.researchScans=[];await page.reload();await page.getByText('No recent searches yet.',{exact:true}).waitFor();
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:844,height:390});await page.reload();await page.getByLabel('Social URL',{exact:true}).waitFor();await fits();assert.equal(await page.locator('.research-page').evaluate(e=>e.getAnimations({subtree:true}).length),0);
 assert.deepEqual(blocked,[]);assert.deepEqual(errors,[]);await browser.close();console.log('PASS immediate searching, duplicate guard, parallel background status, failures/retry draft, missing/empty/refresh/reduced-motion/landscape; no provider writes');
})().catch(e=>{console.error(e);process.exit(1)});
