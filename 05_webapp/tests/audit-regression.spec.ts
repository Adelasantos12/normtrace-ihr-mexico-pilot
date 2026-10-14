import { test, expect } from '@playwright/test';

test('current manifest separates units and withholds unvalidated scores', async ({request})=>{
 const response=await request.get('/data/derived/audit_manifest.json');expect(response.ok()).toBeTruthy();const m=await response.json();
 expect(m.counts).toMatchObject({obligations:45,provisions:118,mapping_records:99,indexed_instruments:18,active_in_pilot_index:16,archived_instruments:2,actor_records:18});
 expect(m.current_anchoring_mean).toBeNull();expect(m.confirmed_gap_count).toBeNull();expect(m.complete_legal_pathways).toBeNull();
});
test('all current entry routes render without runtime errors',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const path of ['/','/mapping','/actors','/spar-bridge','/methodology','/audit','/provisions','/dashboard','/pipeline','/report']){
  await page.goto(path);await expect(page.locator('h1')).toBeVisible();await expect(page.getByText('Evidence correction · 14 October 2026.',{exact:false})).toBeVisible();
 }
 expect(errors).toEqual([]);
});
test('fee candidate and review status are inspectable',async({page})=>{
 await page.goto('/mapping?obligation=IHR-OBL-037');
 const row=page.locator('[data-mapping-id="MEX_MAP_IHR2005_037_001"]');await expect(row).toBeVisible();await row.locator('summary').first().click();
 await expect(row.getByText('MEX_AUDIT_RLGSSI_ART007',{exact:false})).toBeVisible();await expect(row.getByText('Los servicios de sanidad internacional',{exact:false})).toBeVisible();
 const source=row.getByRole('link',{name:'Open source document'});await expect(source).toHaveAttribute('href',/Reg_LGS_MSI/);
 await page.getByRole('textbox').fill('ZZZ-no-result');await expect(page.getByText('No matching record.',{exact:false})).toBeVisible();
});
test('network includes DGE and distinguishes normative relations',async({page,request})=>{
 const m=await (await request.get('/data/derived/network_metrics.json')).json();expect(m.network.n_obligations).toBe(45);expect(m.actor_reach_ranked).toHaveLength(18);
 expect(m.actor_reach_ranked.find((a:any)=>a.actor_id==='MEX_ACTOR_DGE_001').instruments).toEqual(['NOM-017','RI-SS-2025']);
 await page.goto('/actors');await expect(page.getByText('Computed obligation network',{exact:true})).toBeVisible();await expect(page.getByText('All edges have equal weight',{exact:false})).toBeVisible();
 await page.getByRole('tab',{name:'Normative relationships'}).click();await expect(page.getByText('Aircraft commander or chief flight attendant',{exact:false})).toBeVisible();
 await page.getByRole('tab',{name:'Actor inventory'}).click();await expect(page.getByText('Dirección General de Epidemiología',{exact:true})).toBeVisible();
});
test('SPAR page does not plot a numerical discrepancy or impute NIA identity',async({page,request})=>{
 await page.goto('/spar-bridge');await expect(page.getByText('No percentage-point comparison',{exact:true})).toBeVisible();await expect(page.getByText('60%',{exact:true}).first()).toBeVisible();
 const nia=await (await request.get('/data/derived/nia_status.json')).json();expect(nia.designated_institution).toBeNull();expect(nia.domestic_designating_instrument).toBeNull();expect(nia.status_as_of).toBe('2026-07-15');
 await page.goto('/methodology');await expect(page.getByText('SPAR context and measurement limits',{exact:true}).last()).toBeVisible();
});
test('desktop and mobile evidence views remain readable',async({page},testInfo)=>{
 for (const [width,height,label] of [[1440,1000,'desktop'],[390,844,'mobile']] as const){
  await page.setViewportSize({width,height});
  for (const route of ['','actors','mapping','spar-bridge','methodology','audit']){
   await page.goto('/'+route);await expect(page.locator('h1')).toBeVisible();await page.waitForTimeout(350);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+3);expect(overflow,`${label}/${route} horizontal overflow`).toBeFalsy();
   await page.screenshot({path:testInfo.outputPath(`${label}-${route||'home'}.png`),fullPage:true});
  }
 }
});
