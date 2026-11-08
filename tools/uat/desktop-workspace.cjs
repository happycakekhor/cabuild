const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');

(async()=>{
 const base=process.env.UAT_BASE_URL||'http://localhost:3100',local='http://localhost:3100';
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const errors=[],writes=[];let data;
 await context.route('**/api/**',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(req.method()!=='GET'&&!(url.pathname==='/api/auth/login'&&url.origin===local)){writes.push(url.pathname);return route.fulfill({status:403,json:{error:'No-spend visual UAT'}})}
  if(url.pathname==='/api/app'&&data)return route.fulfill({json:data});
  if(url.pathname==='/api/account/credits')return route.fulfill({json:{user:{id:'visual-uat',name:'Visual UAT',email:'visual@example.test',role:'owner'},workspace:{id:'visual-workspace',name:'Visual workspace',plan:'Test',credits:120},providers:[]}});
  if(url.pathname==='/api/settings/access')return route.fulfill({json:{users:[],roles:['user'],actorPermissions:[],permissions:{user:[]},permissionCatalog:[]}});
  if(url.pathname==='/api/drama/brief-jobs')return route.fulfill({json:{jobs:[]}});
  if(/credits|credentials|integrations/.test(url.pathname))return route.fulfill({json:{credits:0,configured:false}});
  return route.continue();
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(local+'/login');await page.getByRole('button',{name:'Enter workspace'}).click();await page.locator('.desktop-sidebar').waitFor();
 data=await(await context.request.get(local+'/api/app')).json();data.assets=[];data.publishQueue=[];data.connectedSocialAccounts=[];data.competitorResults=[];data.socialAudits=[];
 const normal=['home','persona','research','create','publish','automation','audit','analyse','logs','settings','account'];
 const drama=['/drama-studio?step=1','/drama-studio?step=2','/drama-studio?step=3','/drama-studio?step=4','/drama-studio?step=5','/drama-studio/assets','/drama-studio/info'];
 let checks=0;
 for(const width of [1440,1024,768,390,320]){
  await page.setViewportSize({width,height:1000});
  for(const path of [...normal.map(x=>x==='home'?'/':'/?view='+x),...drama]){
   const response=await page.goto(base+path);assert.equal(response.status(),200,path);
   await page.locator('.global-header').waitFor();await page.locator('.desktop-sidebar').waitFor({state:'attached'});await page.locator('h1').first().waitFor();
   await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));
   const dimensions=await page.locator('.main').evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth,body:document.documentElement.scrollWidth,viewport:innerWidth}));
   assert(dimensions.scroll<=dimensions.client+1,`${path} main overflow ${width}: ${JSON.stringify(dimensions)}`);
   assert(dimensions.body<=dimensions.viewport+1,`${path} document overflow ${width}`);
   assert.equal(await page.locator('.workspace-navigation').count(),0,'Old horizontal tabs removed');
   assert.equal(await page.locator('.desktop-sidebar').count(),1,'Exactly one sidebar');
   assert((await page.locator('.desktop-nav-group[aria-expanded="true"]').count())<=1,'Only one open group');
   if(width===1440&&path==='/'){const main=await page.locator('.main').boundingBox();assert(main.x>=230);assert.equal(await page.locator('.welcome-example-badge').count(),3);await page.screenshot({path:'.playwright-mcp/desktop-overview.png'});}
   if(width===1440&&path==='/?view=create')await page.screenshot({path:'.playwright-mcp/desktop-create.png'});
   if(width===390&&path==='/')await page.screenshot({path:'.playwright-mcp/desktop-mobile.png'});
   checks++;
  }
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/');await page.locator('.desktop-sidebar').waitFor();
 const creator=page.getByRole('button',{name:'Content Creator',exact:true}),studio=page.getByRole('button',{name:'Drama Studio',exact:true});
 await creator.click();assert.equal(await creator.getAttribute('aria-expanded'),'true');await studio.click();assert.equal(await creator.getAttribute('aria-expanded'),'false');await studio.press('Enter');assert.equal(await studio.getAttribute('aria-expanded'),'false');
 await creator.click();await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Create Content',exact:true}).click();await page.waitForURL('**/?view=create');assert.equal(await creator.getAttribute('aria-expanded'),'true');assert.equal(await page.locator('.desktop-nav-item[aria-current="page"]').innerText(),'Create Content');
 await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Research',exact:true}).click();await page.waitForURL('**/?view=research');await page.goBack();await page.waitForURL('**/?view=create');await page.locator('.create-page').waitFor();
 await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));assert.equal(await page.locator('.page-motion').evaluate(el=>el.getAnimations().length),0,'Animation finishes');
 await page.getByRole('button',{name:'Show credit balances'}).click();await page.locator('.credit-popover').waitFor({state:'visible'});assert.match(await page.locator('.credit-popover').innerText(),/120 CA/);await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Open navigation'}).click();await page.getByRole('button',{name:'Close navigation'}).waitFor();assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Close navigation');await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Open navigation'}).getAttribute('aria-expanded'),'false');await page.getByRole('button',{name:'Open navigation'}).click();await studio.click();await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Creative Brief',exact:true}).click();await page.waitForURL('**/drama-studio?step=1');await page.locator('.desktop-nav-open[aria-expanded="false"]').waitFor();
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/?view=create');await page.locator('.create-page').waitFor();assert.equal(await page.locator('.page-motion').evaluate(el=>el.getAnimations().length),0,'Reduced motion disables page transitions');
 data.assets=[{id:'visual-result',title:'Saved text output',type:'text',status:'ready',createdAt:'2026-11-08T01:00:00Z'}];
 data.publishQueue=[{id:'visual-publish',assetId:'visual-result',title:'Saved text output',caption:'Saved workspace caption',generationType:'text',status:'done',createdAt:'2026-11-08T01:00:00Z',scheduledAt:'2026-11-08T01:00:00Z'}];
 await page.goto(base+'/');await page.getByRole('heading',{name:'Recent creations',exact:true}).waitFor();assert.equal(await page.locator('.welcome-result').count(),1,'Saved asset and published record deduplicated');assert.equal(await page.locator('.welcome-example-badge').count(),0,'Saved results replace examples');assert.match(await page.locator('.welcome-result').innerText(),/Saved workspace caption/);
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);fs.writeFileSync('.playwright-mcp/desktop-workspace-results.json',JSON.stringify({checks,errors,writes},null,2));await browser.close();console.log(`PASS ${checks} desktop/mobile route checks, accordion, real/empty outputs, navigation/history, credit menu, keyboard drawer, reduced motion. No API mutations or page errors.`);
})().catch(e=>{console.error(e);process.exit(1)});
