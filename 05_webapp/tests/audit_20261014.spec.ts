import {test, expect} from '@playwright/test';
const routes=['/','/audit','/dashboard','/mapping','/provisions','/actors','/spar-bridge','/pipeline','/norm-diagnostic','/normative-hierarchy','/political-brain','/gap-map','/snapshot','/capacity','/methodology','/report','/report/print','/international'];
for (const route of routes) test(`route ${route} loads without uncaught errors`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(route);await expect(page.locator('h1').first()).toBeVisible();
 await page.waitForTimeout(600);expect(errors).toEqual([]);
 await expect(page.locator('body')).not.toContainText('undefined%');
 if(route==='/actors') await page.screenshot({path:'test-results/audit-network-desktop.png',fullPage:true});
 if(route==='/') await page.screenshot({path:'test-results/audit-home-desktop.png',fullPage:true});
});
test('current source counts and absence withdrawal',async({request})=>{
 const s=await (await request.get('/data/derived/audit_summary.json')).json();
 expect(s.counts).toMatchObject({obligations:45,provisions:116,instruments:18,mapping_rows:88});
 expect(s.unmatched_obligation_ids).not.toContain('IHR-OBL-037');
 const b=await (await request.get('/data/derived/spar_normtrace_divergence.json')).json();expect(b.comparison_permitted).toBe(false);expect(b.divergence_latest).toBeNull();
});
test('actor network includes DGE and sourced legal duties',async({page,request})=>{
 const n=await (await request.get('/data/derived/network_metrics.json')).json();
 expect(n.network.n_obligations).toBe(45);expect(n.actor_reach_ranked.find((a:any)=>a.actor_id==='MEX_ACTOR_DGE_001').instruments).toContain('RI-SS-2025');
 await page.goto('/actors');await page.getByRole('tab',{name:'Sourced legal relations'}).click();await expect(page.getByRole('heading',{name:'Individually sourced legal duties'})).toBeVisible();await expect(page.getByText('NOM-017 §8.1.4',{exact:true})).toBeVisible();
 await page.getByRole('tab',{name:'Actor inventory'}).click();await page.getByPlaceholder('DGE, Secretaría de Salud…').fill('Epidemiología');await expect(page.locator('summary')).toContainText('Dirección General de Epidemiología');
});
test('source corrected mapping exposes withheld score and references',async({page})=>{
 await page.goto('/mapping');await page.getByPlaceholder(/Search/).first().fill('IHR-OBL-037');
 await expect(page.locator('body')).toContainText('Art. 7');await expect(page.locator('body')).toContainText('Unscored');
});
test('SPAR explanation does not render a numerical divergence',async({page})=>{
 await page.goto('/spar-bridge');await expect(page.getByRole('heading',{name:'The former percentage-point comparison is withdrawn'})).toBeVisible();await expect(page.locator('body')).not.toContainText('+26');
});
test('mobile core views and screenshots',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 for(const route of ['/','/audit','/actors']){
  await page.goto(route);await expect(page.locator('h1').first()).toBeVisible();await page.waitForTimeout(600);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth + 2)).toBe(true);
  await page.screenshot({path:`test-results/audit-mobile-${route==='/'?'home':route.slice(1)}.png`,fullPage:true});
 }
});
