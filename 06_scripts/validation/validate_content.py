#!/usr/bin/env python3
from pathlib import Path
import csv,json,subprocess,sys,hashlib
ROOT=Path(__file__).resolve().parents[2]
def rows(p,sep=','):
 with open(ROOT/p,encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f,delimiter=sep))
def main():
 m=rows('03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv');p=rows('03_tables/country_legal_mapping/mexico_legal_provisions.csv');o=rows('03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv',';');a=rows('03_tables/actors/mexico_health_governance_actors.csv');refs=rows('03_tables/actors/actor_obligation_evidence.csv')
 pb={r['provision_id']:r for r in p};ob={r['obligation_id'] for r in o};ab={r['actor_id'] for r in a};active=[r for r in m if r['record_status']=='active']
 checks=[]
 def check(ok,label):
  if not ok:raise AssertionError(label)
  checks.append(label)
 check(len({r['mapping_id'] for r in m})==len(m),'unique mapping IDs');check(len(pb)==len(p),'unique provision IDs');check(len(ob)==45,'selected-obligation denominator remains 45')
 check(all(r['obligation_id'] in ob for r in m),'all obligation references resolve');check(all(r['domestic_provision_id'] in pb or r['domestic_provision_id']=='NO_MATCH_IDENTIFIED' for r in m),'all provision references resolve')
 check(all(not r['anchoring_level'] for r in m),'unvalidated numerical scores are not current');check(any(r['legacy_anchoring_level'] for r in m),'legacy classifications retained')
 r37=[r for r in active if r['obligation_id']=='IHR-OBL-037'];check(any(r['domestic_provision_id']=='MEX_PROV_RISI_ART007_AUDIT' for r in r37),'IHR Article 40 has Article 7 candidate');check(not any(r['domestic_provision_id']=='NO_MATCH_IDENTIFIED' for r in r37),'old Article 40 no-match not active')
 for oid,pid in [('IHR-OBL-002','MEX_PROV_LGS_ART133_II_AUDIT'),('IHR-OBL-034','MEX_PROV_RISI_ART031_AUDIT'),('IHR-OBL-035','MEX_PROV_RISI_ART030_AUDIT')]:check(any(r['obligation_id']==oid and r['domestic_provision_id']==pid for r in active),'candidate '+pid)
 check(all(r['actor_id'] in ab and r['provision_id'] in pb and r['obligation_id'] in ob and r['source_url'] for r in refs),'all actor-role references resolve to sources')
 check(all('5288225' in r['source_url'] for r in p if r['norm_id']=='MEX-012'),'final NOM source, not PROY')
 graph=json.loads((ROOT/'05_webapp/public/data/derived/evidence_network.json').read_text());ids={n['id'] for n in graph['nodes']}
 check({n['id'] for n in graph['nodes'] if n['mode']=='obligation'}==ob,'all obligations including isolates visible');check(all(e['source'] in ids and e['target'] in ids for e in graph['edges']),'all network endpoints resolve');check(all(e['type'] in ['documented_correspondence','textual_role_reference'] and e['provision_ids'] for e in graph['edges']),'edges carry type and provision evidence');check('MEX_ACTOR_DGE_001' in ids,'DGE displayed separately')
 check(all(not(e['source'] in ab and e['target'] in ab) for e in graph['edges']),'no invented interagency dependencies')
 nia=json.loads((ROOT/'05_webapp/public/data/derived/national_ihr_authority.json').read_text());check(nia['status']=='designation_reported' and nia['entity'] is None,'NIA reported with identity unresolved')
 d=json.loads((ROOT/'05_webapp/public/data/derived/spar_normtrace_divergence.json').read_text());check(d['divergence_latest'] is None,'SPAR subtraction withdrawn, not zero')
 for canonical,web in [('mexico_ihr2005_mapping.csv','mexico_ihr2005_mapping_clean.csv'),('mexico_legal_provisions.csv','mexico_legal_provisions_clean.csv')]:check((ROOT/'03_tables/country_legal_mapping'/canonical).read_bytes()==(ROOT/'05_webapp/public/data'/web).read_bytes(),'canonical/web synchronization '+canonical)
 check((ROOT/'99_archive/legal_audit_20261014/manifest.json').exists(),'baseline archive exists')
 out=dict(status='passed',checks=checks,count=len(checks),scope='Data integrity and audit regression, not expert legal validation')
 (ROOT/'04_outputs/reports').mkdir(parents=True,exist_ok=True);(ROOT/'04_outputs/reports/audit_validation_20261014.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out,indent=2));return 0
if __name__=='__main__':sys.exit(main())
