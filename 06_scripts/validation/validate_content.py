#!/usr/bin/env python3
"""Validate current source corrections, denominators, mirrors and derived contracts."""
from pathlib import Path
import csv,json,hashlib
R=Path(__file__).resolve().parents[2]
def rows(p,delimiter=','):
 with (R/p).open(encoding='utf-8-sig',newline='') as f: return list(csv.DictReader(f,delimiter=delimiter))
def main():
 a=json.loads((R/'00_project/audit_20261014.json').read_text())
 m=rows('03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv')
 p=rows('03_tables/country_legal_mapping/mexico_legal_provisions.csv')
 actors=rows('03_tables/actors/mexico_health_governance_actors.csv')
 o=rows('03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv',';')
 mids=[r['mapping_id'] for r in m]; pids={r['provision_id'] for r in p}; oids={r['obligation_id'] for r in o}
 assert len(mids)==len(set(mids)), 'Duplicate mapping IDs'
 assert len(p)==len(pids), 'Duplicate provision IDs'
 assert {r['obligation_id'] for r in m}==oids, 'Obligation coverage drift'
 assert all(r['domestic_provision_id'] in pids or (r['domestic_provision_id']=='NO_MATCH_IDENTIFIED' and not r['domestic_norm']) for r in m), 'Invalid provision reference'
 assert a['counts']['mapping_rows']==len(m) and a['counts']['provisions']==len(p) and a['counts']['actors']==len(actors)
 for src,dest in [('country_legal_mapping/mexico_ihr2005_mapping.csv','mexico_ihr2005_mapping_clean.csv'),('country_legal_mapping/mexico_legal_provisions.csv','mexico_legal_provisions_clean.csv'),('actors/mexico_health_governance_actors.csv','mexico_health_governance_actors_clean.csv')]:
  assert rows('03_tables/'+src)==rows('05_webapp/public/data/'+dest), 'Public/source mirror differs: '+src
 for mid,article in [('MEX_MAP_IHR2005_002_001','Art. 133, fracción II'),('MEX_MAP_IHR2005_037_001','Art. 7'),('MEX_MAP_IHR2005_034_001','Art. 31'),('MEX_MAP_IHR2005_035_001','Art. 30')]:
  r=next(x for x in m if x['mapping_id']==mid); assert r['domestic_article']==article and r['gap_type']=='review pending', mid
 assert a['complete_pathway_count'] is None
 assert a['national_ihr_authority']['institution'] is None and a['national_ihr_authority']['domestic_instrument'] is None
 assert all(r['source_url'].endswith('codigo=5288225') for r in p if 'NOM-017' in r['norm_title'])
 for f in ['network_metrics.json','network_edges.csv','node_registry.csv']:
  assert (R/'04_outputs/figures'/f).read_bytes()==(R/'05_webapp/public/data/derived'/f).read_bytes(),f
 net=json.loads((R/'04_outputs/figures/network_metrics.json').read_text())
 assert net['network']['n_obligations']==len(oids)
 assert any('Epidemiología' in r['actor'] for r in net['actor_reach_ranked']), 'DGE missing'
 nodes={r['node_id'] for r in rows('04_outputs/figures/node_registry.csv')}
 assert all(r['source'] in nodes and r['target'] in nodes for r in rows('04_outputs/figures/network_edges.csv'))
 spar=json.loads((R/'05_webapp/public/data/derived/spar_normtrace_divergence.json').read_text())
 assert spar['headline_cc1']['divergence_latest'] is None and spar['headline_cc1']['divergence_mean'] is None
 assert 'cc1.divergence_latest' not in (R/'05_webapp/src/pages/LandingPage.tsx').read_text()
 assert 'ReferenceLine' not in (R/'05_webapp/src/pages/SparBridge.tsx').read_text()
 assert a['mapping_sha256']==hashlib.sha256((R/'03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv').read_bytes()).hexdigest()
 print('PASS: source corrections, primary-source links, unique IDs, coverage, mirrors, DGE, network integrity, withdrawn claims and manifest hash.')
if __name__=='__main__': main()
