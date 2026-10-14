#!/usr/bin/env python3
"""Fail-closed regression gate for documentary integrity, not legal validation."""
from pathlib import Path
import csv,json,hashlib,sys,re
R=Path(__file__).resolve().parents[2]
def rows(path,delimiter=','):
 with (R/path).open(encoding='utf8',newline='') as f:return list(csv.DictReader(f,delimiter=delimiter))
def js(path):return json.loads((R/path).read_text(encoding='utf8'))
def validate():
 errors=[]
 def check(ok,msg):
  if not ok:errors.append(msg)
 maps=rows('03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv');provs=rows('03_tables/country_legal_mapping/mexico_legal_provisions.csv');norms=rows('03_tables/country_legal_mapping/mexico_normative_corpus_index.csv');obls=rows('03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv',';');actors=rows('03_tables/actors/mexico_health_governance_actors.csv');rels=rows('03_tables/actors/mexico_evidenced_relationships.csv')
 manifest=js('04_outputs/exports/audit_manifest.json');network=js('04_outputs/figures/network_metrics.json')
 ids={k:{r[k] for r in rs} for rs,k in [(maps,'mapping_id'),(provs,'provision_id'),(norms,'norm_id'),(obls,'obligation_id'),(actors,'actor_id')]}
 for rs,k in [(maps,'mapping_id'),(provs,'provision_id'),(norms,'norm_id'),(obls,'obligation_id'),(actors,'actor_id')]:check(len(ids[k])==len(rs),f'Duplicate {k}')
 expected={'obligations':len(obls),'provisions':len(provs),'mapping_records':len(maps),'indexed_instruments':len(norms),'active_in_pilot_index':sum(n['corpus_status']=='active_in_pilot_index' for n in norms),'archived_instruments':sum(n['corpus_status']=='archived' for n in norms),'actor_records':len(actors),'source_checked_relationships':len(rels)}
 check(len(obls)==45,'Selected IHR2005 denominator changed unexpectedly')
 for k,v in expected.items():check(manifest['counts'][k]==v,f'Manifest mismatch: {k}')
 for r in maps:
  check(r['obligation_id'] in ids['obligation_id'],f'Unknown obligation {r["mapping_id"]}')
  check(r['domestic_provision_id']=='NO_MATCH_IDENTIFIED' or r['domestic_provision_id'] in ids['provision_id'],f'Unknown provision {r["mapping_id"]}')
  check(r['anchoring_level']=='',f'Current numeric score unexpectedly assigned: {r["mapping_id"]}')
  check(r['review_status']=='requires_human_review',f'False validation status {r["mapping_id"]}')
  check(r['gap_type'] in ['unreviewed','reference_review_pending','scope_review_pending'],f'Unvalidated definitive gap {r["mapping_id"]}')
 for p in provs:check(p['norm_id'] in ids['norm_id'],f'Unknown norm: {p["provision_id"]}')
 # Original ratings are retained, not erased or overwritten with zero.
 old=rows('99_archive/legal_audit_2026-10-14/03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv');current={r['mapping_id']:r for r in maps}
 for r in old:
  check(r['mapping_id'] in current,'Missing original mapping ID')
  for k in ['anchoring_level','gap_type','assessment_summary']:
   check(current[r['mapping_id']].get('legacy_'+k)==r[k],f'Legacy changed: {r["mapping_id"]}/{k}')
 pidx={p['provision_id']:p for p in provs}
 for pid in ['MEX_AUDIT_LGS_ART133_II','MEX_AUDIT_NOM017_663_664','MEX_AUDIT_NOM017_814','MEX_AUDIT_NOM017_3130','MEX_AUDIT_NOM017_51_58','MEX_AUDIT_RLGSSI_ART007','MEX_AUDIT_RLGSSI_ART030','MEX_AUDIT_RLGSSI_ART031']:
  check(pid in pidx,f'Missing corrected source: {pid}')
  check(pidx.get(pid,{}).get('evidence_status')=='text_checked_scope_pending',f'Wrong source status: {pid}')
 fee=[r for r in maps if r['obligation_id']=='IHR-OBL-037'];check(any(r['domestic_provision_id']=='MEX_AUDIT_RLGSSI_ART007' for r in fee),'IHR Article40 source omitted')
 check(all(r['domestic_provision_id']!='NO_MATCH_IDENTIFIED' for r in fee),'False no-match Article40')
 for oid,pid in [('IHR-OBL-034','MEX_AUDIT_RLGSSI_ART031'),('IHR-OBL-035','MEX_AUDIT_RLGSSI_ART030')]:check(any(r['obligation_id']==oid and r['domestic_provision_id']==pid for r in maps),f'Declaration source missing: {oid}')
 for p in provs:
  if p['norm_id']=='MEX-012':check('5288225' in p['source_url'],'Wrong final-NOM citation')
 for rel in rels:
  check(rel['source_provision_id'] in ids['provision_id'],'Unknown relationship source')
  check(rel['observed_operation']=='not_assessed','Normative relation falsely treated as observed')
 check(all(manifest[k] is None for k in ['current_anchoring_mean','confirmed_gap_count','complete_legal_pathways']),'Pending aggregate converted to number')
 # Reproducible public/export mirrors and hashes.
 for source,sha in manifest['source_sha256'].items():
  b=(R/source).read_bytes();check(hashlib.sha256(b).hexdigest()==sha,f'Stale source hash {source}')
  name=Path(source).stem
  for mirror in [f'05_webapp/public/data/{name}_clean.csv',f'04_outputs/exports/data_package_v0_2/{name}.csv']:check((R/mirror).read_bytes()==b,f'Divergent mirror {mirror}')
 nodes=rows('04_outputs/figures/node_registry.csv');nodeids={n['node_id'] for n in nodes};edges=rows('04_outputs/figures/network_edges.csv')
 check({n['node_id'] for n in nodes if n['mode']=='obligation'}==ids['obligation_id'],'Network dropped an obligation')
 check(network['network']['n_obligations']==len(obls),'Wrong network denominator')
 check(len(network['actor_reach_ranked'])==len(actors),'Network dropped actor records')
 dge=next((a for a in network['actor_reach_ranked'] if a['actor_id']=='MEX_ACTOR_DGE_001'),None)
 check(dge is not None and 'NOM-017' in dge['instruments'] and 'RI-SS-2025' in dge['instruments'],'DGE alias regression')
 for e in edges:
  check(e['source'] in nodeids and e['target'] in nodeids,'Unresolved graph endpoint')
  check(e['type']=='documentary_correspondence' and e['weight']=='1','Graph misrepresents legal strength')
 check('IHR-OBL-037' not in network['isolated_obligations'],'Fee obligation still falsely isolated')
 nia=js('05_webapp/public/data/derived/nia_status.json');check(nia['status']=='designation_or_establishment_reported','NIA reported status lost')
 check(nia['designated_institution'] is None and nia['domestic_designating_instrument'] is None,'Invented Mexican NIA identity/instrument')
 spar=js('04_outputs/exports/spar_context.json');retired=js('04_outputs/exports/spar_normtrace_divergence.json')
 check(spar['numeric_difference'] is None and spar['normtrace_comparator'] is None,'Invalid SPAR comparison reintroduced')
 check(retired['status']=='withdrawn_non_equivalent_constructs' and 'headline_cc1' not in retired,'Old divergence payload still current')
 for path in ['05_webapp/src/pages/LandingPage.tsx','05_webapp/src/pages/SparBridge.tsx','05_webapp/src/pages/ActorsExplorer.tsx']:
  t=(R/path).read_text();check('statutory designation IHR Art. 4 requires' not in t and '+26' not in t,f'Unsupported current claim in {path}')
 for name in ['network_metrics.json','network_edges.csv','node_registry.csv','actor_source_links.csv']:
  check((R/f'04_outputs/figures/{name}').read_bytes()==(R/f'05_webapp/public/data/derived/{name}').read_bytes(),f'Graph mirror mismatch: {name}')
 check((R/'00_project/normtrace_ihr_methodology_full.md').read_bytes()==(R/'05_webapp/public/data/markdown/normtrace_ihr_methodology_web.md').read_bytes(),'Methodology mirror mismatch')
 for h in js('00_project/audit_2026-10-14/baseline.json')['sha256'].items():
  check(hashlib.sha256((R/'99_archive/legal_audit_2026-10-14'/h[0]).read_bytes()).hexdigest()==h[1],'Baseline archive modified')
 if errors:
  print('FAIL\n'+'\n'.join(errors));return 1
 print('PASS: source and mapping integrity; original coding preserved; correct final NOM, LGS and RLGS candidates; explicit pending ratings; counts and mirrors; all obligations/actors retained; DGE aliases; NIA unknowns; no invalid SPAR subtraction. This is software/data validation, not expert legal validation.')
 return 0
if __name__=='__main__':sys.exit(validate())
