import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('release manifest and landing show current evidence counts, not divergence', async ({page,request})=>{
 const manifest=await (await request.get('/data/derived/audit_manifest.json')).json();
 expect(manifest.counts).toEqual({obligations:45,provisions:117,instruments:18,mappings:93,actors:18});
 expect(manifest.current_mean_anchoring).toBeNull();expect(manifest.complete_pathways).toBeNull();
 await page.goto('/');await expect(page.getByRole('heading',{name:'Follow the law behind IHR implementation'})).toBeVisible();
 await expect(page.getByText('117',{exact:true})).toBeVisible();await expect(page.getByText('93',{exact:true})).toBeVisible();
 await expect(page.getByText('+26 pts',{exact:true})).toHaveCount(0);
 fs.mkdirSync('audit-screenshots',{recursive:true});await page.screenshot({path:'audit-screenshots/landing-desktop.png',fullPage:true});
});
test('Article 40 has its source, retains history and shows pending not zero', async({page})=>{
 await page.goto('/mapping');const row=page.locator('button').filter({hasText:'IHR-OBL-037'}).first();await expect(row).toBeVisible();
 await expect(row).toContainText('Art. 7o.');await expect(row).toContainText('Score pending');await expect(row).not.toContainText('NO_MATCH_IDENTIFIED');
 await row.click();await expect(page.getByText('Source text / recorded excerpt',{exact:true})).toBeVisible();
 await expect(page.getByRole('link',{name:'Open official source'})).toHaveAttribute('href','https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LGS_MSI.pdf');
});
test('network retains all requirements and independently includes DGE',async({page,request})=>{
 const metrics=await(await request.get('/data/derived/network_metrics.json')).json();
 expect(metrics.network.n_obligations).toBe(45);expect(metrics.isolated_obligations).not.toContain('IHR-OBL-037');
 expect(metrics.actor_reach_ranked.find((a:any)=>a.actor==='Dirección General de Epidemiología').instruments.sort()).toEqual(['NOM-017','RI-SS-2025']);
 await page.goto('/actors');await expect(page.getByRole('heading',{name:'Computed obligation network'})).toBeVisible();
 await page.getByLabel('Select a requirement').selectOption('IHR-OBL-037');
 await expect(page.getByText('Cited instruments',{exact:true})).toBeVisible();
 await page.screenshot({path:'audit-screenshots/network-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Actor Inventory',exact:true}).click();await page.getByLabel('Find an actor').fill('Epidemiología');
 await expect(page.getByRole('heading',{name:'Dirección General de Epidemiología',exact:true})).toBeVisible();
});
test('SPAR shows one context series without equivalent-denominator subtraction',async({page,request})=>{
 const data=await(await request.get('/data/derived/spar_normtrace_divergence.json')).json();
 expect(data.comparison_status).toBe('not_comparable_no_difference_calculated');expect(data.headline_cc1).toBeUndefined();
 await page.goto('/spar-bridge');await expect(page.getByRole('heading',{name:'SPAR and legal traceability',exact:true})).toBeVisible();
 await expect(page.getByRole('table')).toBeVisible();expect(await page.locator('.recharts-reference-line').count()).toBe(0);
 await page.screenshot({path:'audit-screenshots/spar-desktop.png',fullPage:true});
});
test('source record distinguishes reported NIA from unknown domestic instrument',async({page,request})=>{
 const data=await(await request.get('/data/derived/audit_manifest.json')).json();expect(data.nia.international_status).toBe('designation_or_establishment_reported');expect(data.nia.institution_identified).toBeNull();
 await page.goto('/audit');await expect(page.getByRole('heading',{name:'Correction and review record'})).toBeVisible();
 await expect(page.getByText('pending retrieval',{exact:true})).toBeVisible();
 await page.goto('/methodology');await expect(page.getByRole('heading',{level:1})).toBeVisible();await expect(page.getByRole('table').first()).toBeVisible();
});
test('all current routes render without page errors',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of ['/dashboard','/pipeline','/normative-hierarchy','/norm-diagnostic','/political-brain','/gap-map','/provisions','/snapshot','/capacity','/international','/report','/report/print']){
  await page.goto(route);await expect(page.getByRole('heading',{level:1}).first()).toBeVisible();
 }
 expect(errors).toEqual([]);
});
test('mobile home and network stay within viewport and support selection',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await expect(page.getByText('117',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+3)).toBeTruthy();
 await page.screenshot({path:'audit-screenshots/landing-mobile.png',fullPage:true});
 await page.goto('/actors');await page.getByLabel('Select a requirement').selectOption('IHR-OBL-004');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+3)).toBeTruthy();
 await page.screenshot({path:'audit-screenshots/network-mobile.png',fullPage:true});
});
