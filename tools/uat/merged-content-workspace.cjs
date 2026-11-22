// No-spend checks for the single content workspace, profile alignment and Research rows.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const local='http://localhost:3100',base=process.env.UAT_BASE_URL||local;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 let data;const writes=[],errors=[];
 await context.addInitScript(()=>{window.researchEntrances=[];const animate=Element.prototype.animate;Element.prototype.animate=function(frames,options){if(this.closest('.research-page')&&options?.duration===160)window.researchEntrances.push({className:this.className,duration:options.duration,delay:options.delay});return animate.call(this,frames,options);};});
 await context.route('**/api/**',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.pathname==='/api/social'&&req.method()==='POST'&&req.postDataJSON().action==='syncResearchScan')return route.fulfill({json:{ok:true}});
  if(req.method()!=='GET'&&!(url.origin===local&&url.pathname==='/api/auth/login')){writes.push(url.pathname);return route.fulfill({status:403,json:{error:'No-spend UAT'}});}
  if(url.pathname==='/api/app'&&data)return route.fulfill({json:data});
  if(/credits|credentials|integrations/.test(url.pathname))return route.fulfill({json:{user:{name:'UAT'},workspace:{credits:100},providers:[]}});
  return route.continue();
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(local+'/login');await page.getByRole('button',{name:'Enter workspace'}).click();await page.locator('.desktop-sidebar').waitFor();
 data=await(await context.request.get(local+'/api/app')).json();
 data.assets=[];data.connectedSocialAccounts=[];data.competitorResults=[];data.socialAudits=[];
 data.personaProfile={...data.personaProfile,displayName:'North Studio',role:'Creator',company:'North',mediaAssets:[]};
 data.publishQueue=[{id:'saved',assetId:'saved',workspaceId:data.workspace.id,title:'Saved launch',generationType:'text',platform:'LinkedIn',status:'done',createdAt:'2026-11-15T02:00:00Z',scheduledAt:'2026-11-15T02:00:00Z',caption:'Saved output'}];
 data.researchScans=Array.from({length:12},(_,i)=>({id:'search-'+i,query:'Saved search '+i,url:'keyword:Saved search '+i,platform:'instagram',minViews:0,resultIds:[],createdAt:new Date(Date.UTC(2026,10,15,0,i)).toISOString(),status:i===11?'running':'done',source:'apify'}));
 data.researchScans.push({...data.researchScans[0],id:'failed',query:'Failed hidden search',status:'failed'});
 const settled=()=>page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));
 const fits=async()=>assert(await page.locator('.main').evaluate(el=>el.scrollWidth<=el.clientWidth+1&&document.documentElement.scrollWidth<=innerWidth+1),'No viewport overflow');
 for(const width of [1440,1280,1200,1150,1101,768,390,320]){
  await page.setViewportSize({width,height:1000});await page.goto(base+'/?view=publish');await page.getByRole('heading',{name:'My Contents',level:1,exact:true}).waitFor();
  assert.equal(await page.locator('.desktop-navigation').getByRole('link',{name:'Create Content',exact:true}).count(),0);
  const search=page.getByRole('searchbox',{name:'Search contents',exact:true});await search.fill('Saved');const searchNode=await search.elementHandle();
  await page.getByRole('button',{name:'Create Content',exact:true}).click();await page.waitForURL('**/?view=publish&compose=1');
  assert(await page.locator('#content-editor h2').first().evaluate(el=>el===document.activeElement),'Opening focuses the editor');
  assert(await page.locator('.publish-list').isVisible(),'History stays visible with editor');assert.equal(await search.inputValue(),'Saved');assert(await search.evaluate((el,old)=>el===old,searchNode),'Library is not remounted');
  assert.equal((await page.locator('.desktop-nav-item[aria-current="page"]').textContent()).trim(),'My Contents');
  const prompt=page.getByRole('textbox',{name:'Generation prompt',exact:true});await prompt.fill('My retained draft');const promptNode=await prompt.elementHandle();
  await page.getByRole('button',{name:'Image',exact:true}).click();
  await page.getByRole('button',{name:'View contents',exact:true}).click();assert(await page.locator('#content-library').evaluate(el=>el===document.activeElement));assert(await page.locator('#content-editor').isVisible());
  await page.getByRole('button',{name:'Hide editor',exact:true}).click();assert(!(await page.locator('#content-editor').isVisible()));assert(await page.locator('#content-editor-toggle').evaluate(el=>el===document.activeElement),'Closing restores toggle focus');
  await page.getByRole('button',{name:'Create Content',exact:true}).click();assert.equal(await prompt.inputValue(),'My retained draft');assert(await prompt.evaluate((el,old)=>el===old,promptNode),'Collapsed draft remains mounted');
  assert.equal(await page.getByRole('button',{name:'Image',exact:true}).getAttribute('aria-pressed'),'true');
  await page.goBack();await page.waitForURL('**/?view=publish');assert(!(await page.locator('#content-editor').isVisible()));await page.goForward();await page.waitForURL('**/?view=publish&compose=1');assert.equal(await prompt.inputValue(),'My retained draft');await fits();
  await page.goto(base+'/?view=persona');await page.locator('.profile-identity-body').waitFor();await settled();
  const identity=await page.locator('.creator-identity').boundingBox(),grid=await page.locator('.persona-preview').boundingBox(),details=await page.locator('.persona-preview-section').first().boundingBox();
  if(width>900){assert(Math.abs(identity.x-grid.x)<1&&details.width>identity.width,'Identity is narrower than Core profile');assert(Math.abs(identity.y-details.y)<1,'Top sections align');assert(details.x>=identity.x+identity.width,'Core profile sits to the right');assert(Math.abs(details.x+details.width-grid.x-grid.width)<1,'Core profile reaches right edge');}
  else {assert(Math.abs(identity.width-grid.width)<1,'Mobile identity spans full width');assert(details.y>=identity.y+identity.height,'Mobile Core profile stacks below identity');}
  for(const section of await page.locator('.persona-preview-section:not(.profile)').all()){const box=await section.boundingBox();assert(Math.abs(box.x-grid.x)<1&&Math.abs(box.width-grid.width)<1,'Remaining sections span full width');assert(box.y>=Math.max(identity.y+identity.height,details.y+details.height),'Full-width sections follow top row');}await fits();
  await page.goto(base+'/?view=research');await page.locator('.research-recent').waitFor();await settled();
  assert.equal(await page.getByRole('button',{name:'Research history',exact:true}).count(),0);assert.equal(await page.locator('.research-recent-list>button').count(),13);
  const form=await page.locator('.research-query-row').boundingBox(),recent=await page.locator('.research-recent').boundingBox();assert(recent.y>=form.y+form.height,'Recent searches below pinned search');assert(Math.abs(recent.x-form.x)<=2&&Math.abs(recent.width-form.width)<=4,'Search matches the header and content gutters');
  const recentRows=await page.locator('.research-recent-list>button').evaluateAll(rows=>rows.map(row=>{const r=row.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};}));assert(recentRows.every((row,i)=>row.width===recentRows[0].width&&(!i||row.y>=recentRows[i-1].y+recentRows[i-1].height)),'One full-width search per row');
  const controlsFit=async()=>assert(await page.locator('.research-search-dock').evaluate(card=>{const box=card.getBoundingClientRect();return [...card.querySelectorAll('input,select,button')].filter(el=>el.getClientRects().length).every(el=>{const r=el.getBoundingClientRect();return r.left>=box.left&&r.right<=box.right;});}),'Every Research control stays within its card at '+width);
  await controlsFit();await page.locator('#research-filter-toggle').click();await settled();await controlsFit();await page.locator('#research-filter-toggle').click();await settled();
  const entrances=await page.evaluate(()=>window.researchEntrances);assert(entrances.length>=5,'Research rows animate on opening');assert(entrances.every(a=>a.duration===160&&a.delay<=90),'All rows finish within 250ms');
  await page.getByLabel('URL or keywords',{exact:true}).fill('https://instagram.com/studio');await settled();assert.equal(await page.evaluate(()=>window.researchEntrances.length),entrances.length,'Typing does not replay rows');
  await fits();assert.equal(await page.locator('.research-history-entry').count(),13,'All saved, running and failed searches remain visible');assert(await page.locator('#research-history-list').evaluate(e=>e.scrollHeight===e.clientHeight&&getComputedStyle(e).overflowY==='visible'));console.log('PASS merged content, profile and Research at',width);
 }
 await page.goto(base+'/?view=create');await page.waitForURL('**/?view=publish&compose=1');await page.reload();await page.locator('.create-page').waitFor();assert.equal(await page.getByRole('heading',{name:'My Contents',exact:true,level:1}).count(),1,'Legacy and canonical links open same page');
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/?view=research');await page.locator('.research-recent').waitFor();assert.equal(await page.evaluate(()=>window.researchEntrances.length),0);assert.equal(await page.locator('.page-motion').evaluate(el=>el.getAnimations({subtree:true}).length),0);
 assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);await browser.close();console.log('PASS merged content workspace at 8 widths: stable library/draft, keyboard focus, back/forward and legacy refresh; asymmetric profile top row with full-width sections, contained search controls, all 13 recent searches sharing the page scroll, quick rows and reduced motion. No provider writes.');
})().catch(e=>{console.error(e);process.exit(1)});
