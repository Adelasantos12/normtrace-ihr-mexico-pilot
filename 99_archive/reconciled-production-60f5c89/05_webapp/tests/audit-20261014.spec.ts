import { test, expect } from '@playwright/test';

test('source corrections and public datasets use the same current version', async ({ request }) => {
 const auditResponse = await request.get('/data/derived/audit_20261014.json');
 expect(auditResponse.ok()).toBeTruthy();
 const a = await auditResponse.json();
 expect(a.version).toBe('0.1-audit.20261014');
 expect(a.migration_complete).toBe(true);
 expect(a.counts).toMatchObject({ obligations: 45, instruments: 18, provisions: 117, mapping_rows: 87, actors: 18 });
 expect(a.complete_pathway_count).toBeNull();
 expect(a.national_ihr_authority.institution).toBeNull();
 expect(a.changes.find((c:any)=>c.mapping_id==='MEX_MAP_IHR2005_037_001').after.domestic_article).toBe('Art. 7');
 const n = await (await request.get('/data/derived/network_metrics.json')).json();
 expect(n.network.n_obligations).toBe(45);
 expect(n.actor_reach_ranked.some((x:any)=>x.actor.includes('Epidemiología') && x.instruments.includes('NOM-017'))).toBe(true);
 const s = await (await request.get('/data/derived/spar_normtrace_divergence.json')).json();
 expect(s.headline_cc1.divergence_latest).toBeNull();
 expect(s.headline_cc1.normtrace_legal_anchoring_pct).toBeNull();
});

test('landing page makes no numerical comparison or completeness claim', async ({ page }) => {
 const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.getByRole('heading',{name:/Following IHR obligations/})).toBeVisible();
 await expect(page.getByText('87',{exact:true})).toBeVisible();
 await expect(page.getByText('CC1 divergence')).toHaveCount(0);
 await expect(page.getByText('1.76 / 5')).toHaveCount(0);
 expect(errors).toEqual([]);
});

test('audit records disclose primary-source corrections and unresolved designation', async ({ page }) => {
 await page.goto('/audit');
 await expect(page.getByRole('heading',{name:'Source corrections and review status'})).toBeVisible();
 await expect(page.getByText(/does not identify the institution or domestic designation instrument/)).toBeVisible();
 await expect(page.getByRole('link',{name:'Download versioned audit and before/after records'})).toHaveAttribute('href','/data/derived/audit_20261014.json');
});

test('computed graph retains all obligations and includes DGE', async ({ page }) => {
 const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/actors');
 await expect(page.getByText('Computed obligation network',{exact:true})).toBeVisible();
 await expect(page.locator('svg title').filter({hasText:'Dirección General de Epidemiología'})).toHaveCount(1);
 await expect(page.getByText(/top band = 45 IHR obligations/)).toBeVisible();
 expect(errors).toEqual([]);
});

test('SPAR view explains the existing legal mapping and disables subtraction', async ({ page }) => {
 await page.goto('/spar-bridge');
 await expect(page.getByRole('heading',{name:'Numerical subtraction withdrawn'})).toBeVisible();
 await expect(page.getByText(/C1.1 covers mapping and review/)).toBeVisible();
 await expect(page.locator('.recharts-reference-line')).toHaveCount(0);
});

test('legacy automatic synthesis cannot be mistaken for a current finding', async ({ page }) => {
 await page.goto('/pipeline');
 const gate=page.locator('details').filter({has:page.locator('summary').filter({hasText:'Archived exploratory view — not revalidated after source corrections'})});
 await expect(gate).toHaveCount(1);
 await expect(gate).not.toHaveAttribute('open','');
});

test('mobile landing remains readable without horizontal page overflow', async ({ page }) => {
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await expect(page.getByRole('heading',{name:/Following IHR obligations/})).toBeVisible();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth > window.innerWidth+2);
 expect(overflow).toBe(false);
});
