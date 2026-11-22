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
 const dockVisible=async()=>assert(await page.locator('.research-search-dock').evaluate(e=>{const r=e.getBoundingClientRect(),h=document.querySelector('.global-header').getBoundingClientRect();return r.top>=h.bottom-1&&r.bottom<=innerHeight}),'Search remains below header and inside viewport');
 const sectionVisible=async()=>{await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));assert(await page.locator('.research-section-header').evaluate(e=>{const r=e.getBoundingClientRect(),dock=document.querySelector('.research-search-dock').getBoundingClientRect(),title=e.querySelector('h2'),t=title.getBoundingClientRect(),top=document.elementFromPoint(t.x+Math.min(t.width/2,50),t.y+t.height/2);return r.top>=dock.bottom-1&&r.bottom<=innerHeight&&!!top&&(title===top||title.contains(top));}),'Section heading stays visible below search without overlap');};
 const settle=()=>page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{}))));
 fs.mkdirSync('.playwright-mcp',{recursive:true});

 const scroll=()=>page.locator('.research-screen > .page-motion').evaluate(e=>e.scrollTop);
 const pointerClick=async locator=>{await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));const r=await locator.boundingBox();await page.mouse.click(r.x+r.width/2,r.y+r.height/2)};
 const noJump=async(action,label)=>{const before=await scroll();await action();await page.waitForTimeout(100);assert(Math.abs(await scroll()-before)<=1,`${label}: scroll ${before} -> ${await scroll()}`)};
 const field=()=>page.getByRole('searchbox',{name:'URL or keywords'});
 for(const [width,height] of [[1440,900],[1101,800],[768,900],[390,844],[320,700],[844,390]]){
  await page.setViewportSize({width,height});await page.goto(base+'/?view=research');await field().waitFor();await settle();
  assert.equal(await page.getByRole('button',{name:/Search by URL|Search by keywords/}).count(),0);
  assert.equal(await page.locator('#research-filter-toggle').getAttribute('aria-expanded'),'false');
  assert.match(await page.locator('#research-scope-summary').innerText(),/^All platforms/);
  assert.equal(await page.locator('.topbar .research-search-dock').count(),0);
  const title=await page.locator('.creator-page-header').boundingBox(),bar=await page.locator('.research-search-dock').boundingBox();assert(bar.y>=title.y+title.height,'Search follows the shared Research title');
  await page.screenshot({path:'.playwright-mcp/research-title-'+width+'.png'});
  const titleMetrics=await page.locator('.creator-page-header h1').evaluate(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{x:r.x,y:r.y,font:s.fontSize,line:s.lineHeight,weight:s.fontWeight}});
  for(const view of ['persona','publish']){await page.goto(base+'/?view='+view);await page.locator('.creator-page-header h1').waitFor();await settle();const other=await page.locator('.creator-page-header h1').evaluate(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{x:r.x,y:r.y,font:s.fontSize,line:s.lineHeight,weight:s.fontWeight}});assert.deepEqual(other,titleMetrics,'Shared title layout at '+width+' '+view);}
  await page.goto(base+'/?view=research');await field().waitFor();await settle();
  assert.equal(await page.locator('.main').evaluate(e=>getComputedStyle(e).overflowY),'hidden');
  const dock=await page.locator('.research-search-dock').boundingBox();assert(dock.height<100,'Collapsed bar stays compact');
  await field().fill('Creator stories');await page.locator('.research-screen > .page-motion').evaluate(e=>e.scrollTop=e.scrollHeight);await dockVisible();
  await sectionVisible();await page.locator('#research-history-list').evaluate(e=>e.scrollTop=e.scrollHeight);await sectionVisible();await page.locator('#research-history-list').evaluate(e=>e.scrollTop=0);
  const filter=page.locator('#research-filter-toggle');await noJump(()=>pointerClick(filter),'Open filters');assert(await page.getByRole('combobox',{name:/Upload date/}).isVisible());
  await sectionVisible();
  await page.getByRole('combobox',{name:/Platform/}).selectOption('linkedin');await page.getByRole('combobox',{name:/Content type/}).selectOption('article');await page.getByRole('combobox',{name:/Upload date/}).selectOption('this-month');await page.getByLabel('Minimum views',{exact:true}).fill('500');
  await noJump(()=>pointerClick(filter),'Close filters');assert.match(await page.locator('#research-scope-summary').innerText(),/LinkedIn.*Articles.*this month.*500/);assert.equal(await filter.getAttribute('aria-label'),'Filters, 4 active');await dockVisible();await fits();
  await page.screenshot({path:'.playwright-mcp/research-minimal-'+width+'.png'});
  await filter.click();await page.screenshot({path:'.playwright-mcp/research-filters-'+width+'.png'});await page.getByLabel('Minimum views',{exact:true}).press('Escape');assert.equal(await filter.getAttribute('aria-expanded'),'false');assert.equal(await page.evaluate(()=>document.activeElement.id),'research-filter-toggle');
  await page.getByRole('button',{name:'Reset search filters'}).click();assert.match(await page.locator('#research-scope-summary').innerText(),/All platforms.*All types.*Any time.*Any views/);
  await page.locator('#research-entry-saved-23').scrollIntoViewIfNeeded();await noJump(()=>page.locator('#research-entry-saved-23').click(),'Open result');await page.locator('.saved-search-summary').waitFor();assert.equal(await field().inputValue(),'Creator stories');
  await page.locator('.research-screen > .page-motion').evaluate(e=>e.scrollTop=e.scrollHeight);await dockVisible();
  await sectionVisible();const edit=await page.getByRole('button',{name:'Edit search',exact:true}).boundingBox(),back=await page.getByRole('button',{name:'Back to history',exact:true}).boundingBox();assert(back.x>=edit.x+edit.width&&Math.abs(back.y-edit.y)<=1,'Back stays directly right of Edit');await page.screenshot({path:'.playwright-mcp/research-pinned-result-'+width+'.png'});
  await noJump(()=>pointerClick(filter),'Expand filters above pinned result title');await sectionVisible();
  await field().focus();for(let tab=0;tab<12;tab++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>{const e=document.activeElement;if(!e.closest('.research-page'))return true;const r=e.getBoundingClientRect(),top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return !!top&&(e===top||e.contains(top));}),'Expanded-filter keyboard focus is not obscured at '+width+' tab '+tab);}
  await noJump(()=>pointerClick(filter),'Collapse filters above pinned result title');
  await noJump(()=>pointerClick(page.locator('#research-back button')),'Back from deep results');await page.locator('.research-recent').waitFor();await dockVisible();
  await filter.click();await field().fill('www.youtube.com/@studio');assert(await page.getByRole('combobox',{name:/Platform/}).isDisabled());assert.equal(await page.getByRole('combobox',{name:/Platform/}).inputValue(),'url');assert.match(await page.locator('#research-scope-summary').innerText(),/YouTube/);assert(await page.getByRole('combobox',{name:/Upload date/}).isDisabled());await filter.click();await fits();
  console.log('PASS compact merged input, header pinned at any scroll, filters/summary/reset/Escape, and no-jump open/back/toggle',width,height);
 }
 data.researchScans.find(s=>s.id==='saved-23').query='Long query café '+ 'UnbrokenKeyword'.repeat(40);
 for(const [width,height] of [[390,844],[320,700],[844,390]]){await page.setViewportSize({width,height});await page.goto(base+'/?view=research&researchScan=saved-23');await page.locator('#research-result-heading').waitFor();await settle();await page.locator('.research-screen > .page-motion').evaluate(e=>e.scrollTop=e.scrollHeight);await sectionVisible();assert(await page.locator('.saved-search-summary').evaluate(card=>{const r=card.getBoundingClientRect();return [...card.querySelectorAll('h2,button')].every(e=>{const b=e.getBoundingClientRect();return b.left>=r.left&&b.right<=r.right;});}),'Long title keeps heading and actions contained at '+width);await fits();}
 await page.setViewportSize({width:1440,height:900});await page.goto(base+'/?view=research');await field().fill('https:/broken');await noJump(()=>pointerClick(page.getByRole('button',{name:'Search',exact:true})),'Invalid URL');await page.getByRole('alert').filter({hasText:'valid http'}).waitFor();assert.equal(starts.length,0);
 await field().fill('  Brand: storytelling  ');await page.locator('#research-filter-toggle').click();await page.getByRole('combobox',{name:/Platform/}).selectOption('instagram');await page.getByRole('combobox',{name:/Content type/}).selectOption('instagram-reels');await page.getByRole('combobox',{name:/Upload date/}).selectOption('this-week');await page.getByLabel('Minimum views',{exact:true}).fill('250');await page.locator('#research-filter-toggle').click();
 await page.locator('.research-screen > .page-motion').evaluate(e=>e.scrollTop=e.scrollHeight);await noJump(async()=>{await pointerClick(field());await page.keyboard.press('Enter')},'Submit keyword');await page.locator('#research-entry-starting-search').waitFor();while(!releaseStart)await new Promise(r=>setTimeout(r,20));assert.equal(starts[0].action,'scanKeywordResearch');assert.equal(starts[0].keywords,'Brand: storytelling');assert.equal(starts[0].dimensions.contentType,'instagram-reels');assert.equal(starts[0].dimensions.uploadDate,'this-week');assert.equal(starts[0].minViews,250);releaseStart();releaseStart=null;await page.locator('#research-entry-new-1').waitFor();
 await field().fill('instagram.com/studio');await noJump(()=>pointerClick(page.getByRole('button',{name:'Search',exact:true})),'Submit URL');await page.locator('#research-entry-starting-search').waitFor();while(!releaseStart)await new Promise(r=>setTimeout(r,20));assert.equal(starts[1].action,'scanResearchUrl');assert.equal(starts[1].url,'https://instagram.com/studio');assert.equal(starts[1].minViews,250);assert.equal(starts[1].dimensions,undefined);releaseStart();releaseStart=null;await page.locator('#research-entry-new-2').waitFor();holdSync=false;releaseSync.forEach(r=>r());
 await page.locator('#research-filter-toggle').click();await page.getByLabel('Minimum views',{exact:true}).fill('-1');await page.locator('#research-filter-toggle').click();await page.getByRole('button',{name:'Search',exact:true}).click();await page.getByRole('alert').filter({hasText:'whole number'}).waitFor();assert.equal(starts.length,2);assert.equal(await page.locator('#research-filter-toggle').getAttribute('aria-expanded'),'true');
 await page.reload();await field().fill('Creator stories all platforms');await page.getByRole('button',{name:'Search',exact:true}).click();while(!releaseStart)await new Promise(r=>setTimeout(r,20));assert.deepEqual(starts[2].dimensions.actorSources,['instagram','tiktok','youtube','facebook','linkedin']);releaseStart();releaseStart=null;await page.locator('#research-entry-new-3').waitFor();await page.locator('#research-entry-new-3').click();await page.getByRole('button',{name:'Edit search',exact:true}).waitFor();assert.match(await page.locator('.saved-search-details').innerText(),/All platforms/);
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await field().waitFor();assert.equal(await page.locator('.research-page').evaluate(e=>e.getAnimations({subtree:true}).length),0);
 assert.deepEqual(errors,[]);assert.deepEqual(blocked,[]);await browser.close();console.log('PASS correct URL/keyword payloads, native Enter, invalid inputs without spend and no scroll on submission');
})().catch(e=>{console.error(e);process.exit(1)});
