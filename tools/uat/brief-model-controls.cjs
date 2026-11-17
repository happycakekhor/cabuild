const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
(async()=>{
 const local='http://localhost:3100',base=process.env.UAT_BASE_URL||local,catalog={exports:{}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/kie-models.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:catalog,exports:catalog.exports});
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
  const context=await browser.newContext(),page=await context.newPage();let data,balanceMode='normal',generationMode='fail',balanceCalls=0,delayNextBalance=false,releaseBalance;
  const posts=[],errors=[],unexpected=[];page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/api/**',async r=>{
   const req=r.request(),url=new URL(req.url());
   if(url.pathname==='/api/app'&&data)return r.fulfill({json:data});
   if(url.pathname==='/api/account/kie-models'){
    balanceCalls++;const requestedMode=balanceMode;
    if(delayNextBalance){delayNextBalance=false;await new Promise(resolve=>{releaseBalance=resolve})}
    if(requestedMode==='fail')return r.fulfill({status:503,json:{error:'Fixture unavailable'}});
    return r.fulfill({json:{configured:requestedMode!=='disconnected',credits:requestedMode==='unknown'||requestedMode==='disconnected'?null:requestedMode==='zero'?0:987.5,checkedAt:new Date().toISOString(),models:catalog.exports.KIE_MODELS.map(m=>({...m,lastRequest:m.id==='gpt-5-5'?{status:'Rate limited',at:'2026-11-17T10:00:00Z'}:null}))}});
   }
   if(/credits|credentials|integrations/.test(url.pathname))return r.fulfill({json:{user:{id:'fixture',name:'Test'},workspace:{id:'fixture',credits:100},providers:[]}});
   if(req.method()!=='GET'&&!(url.origin===local&&url.pathname==='/api/auth/login')){
    if(url.pathname==='/api/social'&&req.postDataJSON().action==='generateBriefWithAi'){
     posts.push(req.postDataJSON());await new Promise(resolve=>setTimeout(resolve,350));
     return generationMode==='fail'?r.fulfill({status:502,json:{error:'Kie '+(posts.at(-1).briefModel==='gemini-3-pro'?'Gemini 3 Pro':'GPT-5.5')+' (HTTP 429): Capacity limited'}}):r.fulfill({json:{topic:'Recovered',videoPrompt:'Recovered prompt from selected model',format:'Short video 9:16',duration:8}});
    }
    unexpected.push(url.pathname);return r.fulfill({status:403,json:{error:'No-spend fixture test'}});
   }
   return r.continue();
  });
  await page.goto(local+'/login');await page.getByRole('button',{name:'Enter workspace'}).click();await page.locator('.desktop-sidebar').waitFor();data=await(await context.request.get(local+'/api/app')).json();data.assets=[];data.publishQueue=[];
  fs.mkdirSync('.playwright-mcp',{recursive:true});
  for(const width of [1440,1280,768,390,320]){
   await page.setViewportSize({width,height:1000});await page.goto(base+'/?view=publish&compose=1');
   const select=page.locator('select[name="briefModel"]'),trigger=page.getByRole('button',{name:'Kie models',exact:true}),panel=page.getByRole('dialog',{name:'Kie model balances'});
   await select.waitFor();assert.deepEqual(await select.locator('option').evaluateAll(options=>options.map(o=>o.value)),['gpt-5-5','gemini-3-pro']);assert.equal(await select.inputValue(),'gpt-5-5');
   const idea=page.locator('textarea[name="idea"]');await idea.focus();
   if(width>600)await trigger.evaluate(e=>{document.querySelector('main.main').scrollTop+=e.getBoundingClientRect().top-80});
   const before=balanceCalls;await trigger.hover();await panel.getByText('987.5',{exact:true}).waitFor();assert.equal(balanceCalls,before+1);
   assert.equal(await panel.locator('.brief-model-balance-row').count(),12);assert.match(await panel.innerText(),/remaining tokens or live capacity per model/);assert.match(await panel.innerText(),/Retired by provider/);assert.match(await panel.innerText(),/Last request: Rate limited/);
   const rect=await panel.boundingBox();if(rect.y<0||rect.y+rect.height>1001)await page.screenshot({path:'.playwright-mcp/brief-panel-overflow.png'});assert(rect.x>=0&&rect.x+rect.width<=width+1&&rect.y>=0&&rect.y+rect.height<=1001,'Panel fits viewport at '+width+': '+JSON.stringify(rect));
   if(width===1440||width===390)await page.screenshot({path:'.playwright-mcp/brief-models-'+width+'.png'});
   await page.keyboard.press('Escape');await panel.waitFor({state:'hidden'});assert(await idea.evaluate(e=>e===document.activeElement),'Hover Escape preserves outside focus');await page.mouse.move(0,0);await trigger.hover();await panel.waitFor();
   await trigger.focus();await page.keyboard.press('Escape');await panel.waitFor({state:'hidden'});assert(await trigger.evaluate(e=>e===document.activeElement));
   await page.mouse.move(0,0);await page.keyboard.press('Enter');await panel.waitFor();assert.equal(balanceCalls,before+1,'Cached reopen avoids provider queries');
   await panel.getByRole('button',{name:'Close Kie model balances'}).click();
   if(width===1440){
    await trigger.focus();await page.keyboard.press('Enter');await panel.waitFor();
    await trigger.evaluate(e=>{document.querySelector('main.main').scrollTop+=e.getBoundingClientRect().top-850});
    await page.setViewportSize({width:768,height:720});
    await page.waitForFunction(()=>{const r=document.querySelector('.brief-balance-popover')?.getBoundingClientRect();return r&&r.x>=0&&r.y>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1});
    await page.setViewportSize({width:1440,height:1000});await page.keyboard.press('Escape');await panel.waitFor({state:'hidden'});
   }
   await select.selectOption('gemini-3-pro');await page.locator('textarea[name="idea"]').fill('Fun marketing');
   if(width===1440||width===390||width===320)await page.locator('.creation-brief').screenshot({path:'.playwright-mcp/brief-controls-'+width+'.png'});
   const generate=page.getByRole('button',{name:'Generate Brief',exact:true});const s=await select.boundingBox(),g=await generate.boundingBox(),c=await page.getByRole('button',{name:'Clear',exact:true}).boundingBox();assert(s.x<g.x,'Model left of actions');assert(g.x<c.x,'Clear follows Generate');
   const footer=await page.locator('.brief-footer').boundingBox();assert(Math.abs(c.x+c.width-footer.x-footer.width)<3,'Actions align to right edge');
   await generate.click();assert(await select.isDisabled());assert(await page.getByRole('button',{name:'Clear',exact:true}).isDisabled());
   await page.getByRole('button',{name:'Try again',exact:true}).waitFor();assert.equal(posts.at(-1).briefModel,'gemini-3-pro');assert.equal(await select.inputValue(),'gemini-3-pro');assert.equal(await page.locator('textarea[name="idea"]').inputValue(),'Fun marketing');
   await page.getByRole('button',{name:'Clear',exact:true}).click();assert.equal(await select.inputValue(),'gemini-3-pro');assert.equal(await page.locator('textarea[name="idea"]').inputValue(),'');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No page overflow');console.log('PASS brief dropdown, hover/keyboard balances, layout and failed generation at',width);
  }
  await page.locator('textarea[name="idea"]').fill('Try selected model');generationMode='success';await page.getByRole('button',{name:'Generate Brief',exact:true}).click();await page.waitForFunction(()=>document.querySelector('textarea[name="prompt"]')?.value.includes('Recovered prompt'));assert.equal(await page.locator('select[name="briefModel"]').inputValue(),'gemini-3-pro');
  const trigger=page.getByRole('button',{name:'Kie models',exact:true}),panel=page.getByRole('dialog',{name:'Kie model balances'});await page.mouse.move(0,0);await trigger.focus();await page.keyboard.press('Enter');await panel.waitFor();
  for(const [mode,text] of [['zero','0'],['unknown','Unavailable'],['disconnected','Not connected']]){balanceMode=mode;await panel.getByRole('button',{name:'Refresh Kie model balances'}).click();await panel.locator('.brief-shared-balance strong').filter({hasText:new RegExp('^'+text+'$')}).waitFor()}
  balanceMode='fail';await panel.getByRole('button',{name:'Refresh Kie model balances'}).click();await panel.getByRole('status').filter({hasText:'Could not refresh'}).waitFor();assert.match(await panel.innerText(),/last known/);
  await page.keyboard.press('Escape');
  balanceMode='normal';await page.goto(base+'/?view=publish&compose=1');await page.mouse.move(0,0);delayNextBalance=true;releaseBalance=undefined;const beforeRace=balanceCalls;
  await trigger.focus();await page.keyboard.press('Enter');
  for(let i=0;i<100&&!releaseBalance;i++)await new Promise(resolve=>setTimeout(resolve,20));assert(releaseBalance,'Fixture balance request held');
  await page.keyboard.press('Escape');await panel.waitFor({state:'hidden'});balanceMode='zero';await page.evaluate(()=>window.dispatchEvent(new Event('cabuild:credits-changed')));releaseBalance();
  for(let i=0;i<100&&balanceCalls<beforeRace+2;i++)await new Promise(resolve=>setTimeout(resolve,20));assert.equal(balanceCalls,beforeRace+2,'Closed in-flight invalidation queues fresh lookup');
  await trigger.focus();await page.keyboard.press('Enter');await panel.locator('.brief-shared-balance strong').filter({hasText:/^0$/}).waitFor();await page.keyboard.press('Escape');
  assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);console.log('PASS selected-model recovery; zero/unknown/disconnected/stale balances; closed in-flight refresh; no paid requests');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
