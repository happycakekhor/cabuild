// No-spend acceptance checks for the researched workflow layouts and their new navigation.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const local='http://localhost:3100',base=process.env.UAT_BASE_URL||local;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'UTC'});
 let data;const writes=[],errors=[];
 await context.route('**/api/**',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(request.method()!=='GET'&&!(url.origin===local&&url.pathname==='/api/auth/login')){writes.push(url.pathname);return route.fulfill({status:403,json:{error:'No-spend UAT'}});}
  if(url.pathname==='/api/app'&&data)return route.fulfill({json:data});
  if(/credits|credentials|integrations/.test(url.pathname))return route.fulfill({json:{user:{name:'UAT'},workspace:{credits:100},providers:[]}});
  return route.continue();
 });
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 await page.goto(local+'/login');await page.getByRole('button',{name:'Enter workspace'}).click();await page.locator('.desktop-sidebar').waitFor();
 data=await(await context.request.get(local+'/api/app')).json();const workspaceId=data.workspace.id;
 data.personaProfile={...data.personaProfile,displayName:'North Studio',role:'Design team',company:'North',mediaAssets:[]};
 const recent='2026-11-15T02:00:00Z',older='2026-11-14T02:00:00Z';
 data.assets=[];
 data.publishQueue=[{id:'recent',title:'Zebra launch',createdAt:recent,status:'done'},{id:'older',title:'Alpha draft',createdAt:older,status:'draft'}].map(item=>({...item,workspaceId,assetId:item.id,scheduledAt:item.createdAt,generationType:'text',platform:'LinkedIn',caption:'Saved output'}));
 data.competitorResults=[];data.connectedSocialAccounts=[];data.socialAudits=[];
 data.researchScans=[{id:'saved-search',query:'Design process',url:'keyword:Design process',platform:'instagram',minViews:0,resultIds:[],createdAt:recent,status:'done',source:'apify'}];
 data.automationSourceWatchers=[];data.automationSourceRuns=[];data.automationJobs=[];
 const rule={workspaceId,contentType:'text-post',model:'gemini-3.5-flash',aspectRatio:'1:1',frequency:'weekly',postingDays:['Mon'],postingTime:'10:00',postingTimes:['10:00'],timezone:'Asia/Singapore',platforms:['LinkedIn'],quantityPerRun:1,goal:'leads',researchMode:'none',keywords:[],sourceUrls:[],instruction:'Create an update',approvalMode:'draft-only',duplicateProtection:{sourceWindowDays:7,topicWindowDays:7,similarityThreshold:80},createdAt:recent};
 data.automationRules=[{...rule,id:'active',name:'Weekly update',status:'active',nextRunAt:'2026-11-16T02:00:00Z'},{...rule,id:'paused',name:'Paused update',status:'paused',nextRunAt:'2026-11-15T01:00:00Z'}];
 const goto=async view=>{await page.goto(base+'/?view='+view);await page.locator('.creator-page-header').waitFor();await page.evaluate(()=>Promise.all(document.getAnimations().map(animation=>animation.finished.catch(()=>{}))));};
 const fits=async label=>assert(await page.locator('.main').evaluate(el=>el.scrollWidth<=el.clientWidth+1&&document.documentElement.scrollWidth<=innerWidth+1),label+' fits viewport');
 fs.mkdirSync('.playwright-mcp',{recursive:true});
 for(const width of [1440,1024,768,390,320]){
  await page.setViewportSize({width,height:1000});
  await goto('persona');await page.getByRole('button',{name:'Edit persona',exact:true}).click();
  const name=page.getByLabel('Display name',{exact:true});await name.fill('Unsaved identity');const node=await name.elementHandle();
  await page.getByRole('navigation',{name:'Persona sections'}).getByRole('button',{name:'Prompt guardrails',exact:true}).click();
  assert.equal(await page.locator('#persona-guardrails').getAttribute('open'),'');
  assert(await page.locator('#persona-guardrails').evaluate(el=>el===document.activeElement));
  await page.getByRole('navigation',{name:'Persona sections'}).getByRole('button',{name:'Core profile',exact:true}).click();
  assert.equal(await name.inputValue(),'Unsaved identity');assert(await name.evaluate((el,old)=>el===old,node));await fits('Edit persona '+width);
  await page.emulateMedia({reducedMotion:'reduce'});await name.focus();
  for(let step=0;step<5;step++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>{const el=document.activeElement;if(!el.matches('input,textarea'))return true;const rect=el.getBoundingClientRect(),footer=document.querySelector('.persona-footer').getBoundingClientRect();return rect.top<innerHeight&&rect.bottom>0&&(footer.top>=rect.bottom||footer.bottom<=rect.top);}),`Focused Persona field is not covered by Save/Cancel at ${width}, Tab ${step+1}`);}
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.screenshot({path:`.playwright-mcp/workflow-persona-edit-${width}.png`});await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await goto('create');const form=page.locator('.creation-studio');
  assert((await form.locator('.studio-recipe').innerText()).includes('TikTok'));
  if(width===1440){const settings=await form.locator('.creation-settings').boundingBox(),persona=await form.locator('.creation-persona').boundingBox(),brief=await form.locator('.creation-brief').boundingBox(),content=await form.locator('.creation-content').boundingBox();assert(settings.x>=persona.x+persona.width,'Settings sit beside composing');assert(brief.y>=persona.y+persona.height,'Brief follows persona');assert(content.y>=brief.y+brief.height,'Content follows brief');assert(Math.abs(settings.y-persona.y)<1,'Columns begin together');}
  await fits('Create '+width);await page.screenshot({path:`.playwright-mcp/workflow-create-${width}.png`,fullPage:true});
  await goto('publish');assert.equal(await page.locator('.content-history-date').count(),2);assert((await page.locator('.content-output-card').first().innerText()).includes('Zebra launch'));
  await page.getByRole('combobox',{name:'Sort contents',exact:true}).click();await page.getByRole('option',{name:'Title A–Z',exact:true}).click();
  assert.equal(await page.locator('.content-history-date').count(),0);assert((await page.locator('.content-output-card').first().innerText()).includes('Alpha draft'));await fits('History '+width);
  await page.screenshot({path:`.playwright-mcp/workflow-history-${width}.png`});
  await goto('research');await page.locator('.research-recent').getByRole('button',{name:/Design process/}).click();assert(await page.locator('.saved-search-summary').isVisible());assert((await page.locator('.saved-search-summary').innerText()).includes('Design process'));
  await goto('analyse');await page.getByRole('textbox',{name:'Search analytics content'}).fill('Does not match any record');const stage=page.getByRole('button',{name:'Draft: 1 records',exact:true});await stage.focus();await page.keyboard.press('Enter');
  assert.equal(await stage.getAttribute('aria-pressed'),'true');assert.equal(await page.getByRole('textbox',{name:'Search analytics content'}).inputValue(),'');assert.equal(await page.locator('.insight-output').count(),1);assert((await page.locator('.insight-output').innerText()).includes('Alpha draft'));assert(await page.locator('#analytics-content').evaluate(el=>el===document.activeElement));await fits('Analyze '+width);
  await goto('automation');await page.getByRole('button',{name:/Scheduled content/}).click();
  const upcoming=page.locator('.automation-upcoming');assert.equal(await upcoming.getByRole('button').count(),1);assert((await upcoming.innerText()).includes('Weekly update'));assert(!(await upcoming.innerText()).includes('Paused update'));assert.match(await upcoming.innerText(),/10:00:00/,'Next run is displayed in the saved Singapore timezone, not browser UTC');await fits('Automation '+width);
  await page.screenshot({path:`.playwright-mcp/workflow-automation-${width}.png`,fullPage:true});
 }
 await page.emulateMedia({reducedMotion:'reduce'});await goto('persona');await page.getByRole('button',{name:'Edit persona',exact:true}).click();await page.getByRole('navigation',{name:'Persona sections'}).getByRole('button',{name:'Media references',exact:true}).click();assert.equal(await page.evaluate(()=>document.getAnimations().length),0);
 assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);await browser.close();console.log('PASS researched workflows at 1440/1024/768/390/320: persistent profile sections, non-overlapping composer, date groups and title sort, saved-search reopening, keyboard pipeline drilldown, timezone-correct active schedules, reduced motion. No provider writes.');
})().catch(error=>{console.error(error);process.exit(1)});
