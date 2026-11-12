// No-spend UI validation. Production mode uses deployed assets with intercepted fixture data.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const local='http://localhost:3100',base=process.env.UAT_BASE_URL||local;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const errors=[],writes=[];let data,checks=0;
 await context.route('**/api/**',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(req.method()!=='GET'&&!(url.origin===local&&url.pathname==='/api/auth/login')){writes.push(url.pathname);return route.fulfill({status:403,json:{error:'No-spend visual UAT'}});}
  if(url.pathname==='/api/app'&&data)return route.fulfill({json:data});
  if(url.pathname==='/api/account/credits')return route.fulfill({json:{user:{id:'visual-uat',name:'Visual UAT'},workspace:{id:'visual-workspace',credits:120},providers:[]}});
  if(/credits|credentials|integrations/.test(url.pathname))return route.fulfill({json:{configured:false,providers:[]}});
  return route.continue();
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(local+'/login');await page.getByRole('button',{name:'Enter workspace'}).click();await page.locator('.desktop-sidebar').waitFor();
 data=await(await context.request.get(local+'/api/app')).json();
 data.assets=[];data.publishQueue=[];data.connectedSocialAccounts=[];data.socialAudits=[];data.debugLogs=[];
 data.personaProfile={...data.personaProfile,displayName:'Studio North',company:'North & Co',role:'Creative team',mediaAssets:[{id:'visual-logo',role:'logo',label:'Studio mark',fileName:'mark.svg',url:'/icon.svg',contentType:'image/svg+xml'}]};
 const views={persona:'Persona',research:'Research',create:'Create Content',publish:'My Contents',automation:'Automation',audit:'Social Audit',analyse:'Analyze',logs:'Logs'};
 fs.mkdirSync('.playwright-mcp',{recursive:true});
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1000});
  for(const [view,title] of Object.entries(views)){
   const response=await page.goto(base+'/?view='+view);assert.equal(response.status(),200);
   await page.getByRole('heading',{name:title,exact:true,level:1}).waitFor();
   await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));
   assert.equal(await page.locator('.creator-page-mark svg').count(),1,view+' page mark');
   assert.equal(await page.locator('.creator-page-header p,.creator-page-header .page-intro-kicker').count(),0,'Essential header copy only');
   const overflow=await page.locator('.main').evaluate(e=>({client:e.clientWidth,scroll:e.scrollWidth,body:document.documentElement.scrollWidth,viewport:innerWidth}));
   assert(overflow.scroll<=overflow.client+1&&overflow.body<=overflow.viewport+1,view+' overflow '+width+JSON.stringify(overflow));
   for(const logo of await page.locator('.platform-logo').all())assert(await logo.evaluate(el=>el.complete&&el.naturalWidth>0),'Logo loaded');
   if(view==='persona')assert(await page.locator('.creator-identity .creator-persona-mark img').evaluate(el=>el.complete&&el.naturalWidth>0),'Saved brand logo');
   if(view==='create'){
    assert.equal(await page.locator('.creation-platform-row .platform-logo').count(),6);
    assert.equal(await page.locator('.create-type-grid>button').count(),3);
    assert.equal(await page.locator('.brief-preview').count(),0,'No boilerplate scratch brief');
   }
   if(width===1440||width===390)await page.screenshot({path:`.playwright-mcp/visual-${view}-${width}.png`});
   checks++;
  }
 }
 data.personaProfile.displayName='LongBrand'+('unbroken'.repeat(25));
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:900});await page.goto(base+'/?view=create');await page.locator('.persona-choice-grid').waitFor();
  assert(await page.locator('.main').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'Long persona name stays within the composer at '+width);
  assert(await page.locator('.creator-persona-mark').first().evaluate(el=>el.getBoundingClientRect().width>=50),'Brand mark does not shrink');
 }
 data.personaProfile.displayName='Studio North';
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/?view=research');
 await page.getByRole('button',{name:'Search by keywords',exact:true}).click();
 const tiktok=page.getByRole('button',{name:'TikTok',exact:true});await tiktok.focus();await page.keyboard.press('Enter');assert.equal(await tiktok.getAttribute('aria-pressed'),'true');
 assert(await tiktok.evaluate(el=>el===document.activeElement&&getComputedStyle(el).outlineStyle!=='none'),'Visible keyboard focus');
 await page.goto(base+'/?view=create');await page.locator('.create-page').waitFor();
 const prompt=page.getByRole('textbox',{name:'Generation prompt',exact:true});await prompt.fill('Keep this unsaved draft');const node=await prompt.elementHandle();
 await page.getByRole('button',{name:'Image',exact:true}).click();assert.equal(await prompt.inputValue(),'Keep this unsaved draft');assert(await prompt.evaluate((el,original)=>el===original,node),'Format switch preserves DOM field');
 await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));
 await prompt.fill('Still editing');assert.equal(await page.evaluate(()=>document.getAnimations().length),0,'Editing does not replay entrance');
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/?view=persona');await page.locator('.creator-identity').waitFor();assert.equal(await page.evaluate(()=>document.getAnimations().length),0,'Reduced motion');
 data.personaProfile.mediaAssets=[{...data.personaProfile.mediaAssets[0],url:'/missing-visual-logo.svg'}];
 await page.reload();await page.locator('.creator-identity .creator-persona-mark svg').waitFor();assert.equal(await page.locator('.creator-identity .creator-persona-mark img').count(),0,'Broken brand mark falls back');
 data.personaProfile.mediaAssets=[];await page.reload();await page.locator('.creator-identity .creator-persona-mark svg').waitFor();
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
 fs.writeFileSync('.playwright-mcp/creator-visual-results.json',JSON.stringify({base,checks,errors,writes},null,2));
 await browser.close();console.log(`PASS ${checks} Creator page/viewport checks; logos, essential copy, keyboard selection, draft preservation, motion, missing logo fallback. No provider writes or page errors.`);
})().catch(error=>{console.error(error);process.exit(1)});
