#!/usr/bin/env python3
"""Fail closed on contradictory current data, graph semantics or audit claims."""
from pathlib import Path
import csv,json,re,sys,hashlib
ROOT=Path(__file__).resolve().parents[2]
def read(p,d=','):
 with (ROOT/p).open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f,delimiter=d))
def main():
 failures=[]
 def check(ok,msg):
  if not ok:failures.append(msg)
 data={
 'obligations':read('03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv',';'),
 'provisions':read('03_tables/country_legal_mapping/mexico_legal_provisions.csv'),
 'instruments':read('03_tables/country_legal_mapping/mexico_normative_corpus_index.csv'),
 'mappings':read('03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv'),
 'actors':read('03_tables/actors/mexico_health_governance_actors.csv')}
 expected={'obligations':45,'provisions':117,'instruments':18,'mappings':94,'actors':18}
 for key,n in expected.items():check(len(data[key])==n,f'{key}: release expects {n}, found {len(data[key])}')
 for key,field in [('obligations','obligation_id'),('provisions','provision_id'),('instruments','norm_id'),('mappings','mapping_id'),('actors','actor_id')]:
  vals=[r[field] for r in data[key]];check(len(vals)==len(set(vals)) and all(vals),f'{key}: duplicate or blank identifiers')
 obl={r['obligation_id'] for r in data['obligations']};prov={r['provision_id']:r for r in data['provisions']};norm={r['norm_id'] for r in data['instruments']}
 for p in data['provisions']:check(p['norm_id'] in norm,f'Unknown norm for {p["provision_id"]}')
 for m in data['mappings']:
  mid=m['mapping_id'];pid=m['domestic_provision_id'];check(m['obligation_id'] in obl,f'Unknown obligation: {mid}')
  check(pid in prov or pid=='NO_MATCH_IDENTIFIED',f'Unknown provision: {mid}')
  if pid in prov:check(m['domestic_norm']==prov[pid]['norm_title'],f'Conflicting instrument: {mid}')
  if m['audit_status']!='legacy_preliminary':check(m['anchoring_level']=='' and m['gap_type']=='review pending',f'Pending review incorrectly scored: {mid}')
  if 'Reglamento' in m['domestic_norm']:check('statutory' not in m['match_type'],f'Regulation misclassified as statute: {mid}')
 check(any(m['obligation_id']=='IHR-OBL-002' and m['domestic_provision_id']=='MEX_PROV_LGS_ART133_II_AUDIT' for m in data['mappings']),'SINAVE statutory correction missing')
 charges=[m for m in data['mappings'] if m['obligation_id']=='IHR-OBL-037'];check(len(charges)==1 and charges[0]['domestic_provision_id']=='MEX_PROV_RISI_ART007_AUDIT','Article40 still lacks its identified candidate')
 for oid,pid in [('IHR-OBL-034','MEX_PROV_RISI_ART031_AUDIT'),('IHR-OBL-035','MEX_PROV_RISI_ART030_AUDIT')]:check(any(m['obligation_id']==oid and m['domestic_provision_id']==pid for m in data['mappings']),f'Declaration correction missing: {oid}')
 for pid in ['MEX_PROV_NOM017_SEC663_AUDIT','MEX_PROV_NOM017_SEC664_AUDIT','MEX_PROV_NOM017_SEC814_AUDIT']:
  check(prov[pid]['source_url']=='https://sidof.segob.gob.mx/notas/docFuente/5288225',f'Final NOM source not used: {pid}')
 pairs=[('03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv','05_webapp/public/data/mexico_ihr2005_mapping_clean.csv'),('03_tables/country_legal_mapping/mexico_legal_provisions.csv','05_webapp/public/data/mexico_legal_provisions_clean.csv'),('03_tables/country_legal_mapping/mexico_normative_corpus_index.csv','05_webapp/public/data/mexico_normative_corpus_index_clean.csv'),('03_tables/actors/mexico_health_governance_actors.csv','05_webapp/public/data/mexico_health_governance_actors_clean.csv'),('04_outputs/country_profiles/mexico_implementation_gap_map.csv','05_webapp/public/data/mexico_implementation_gap_map_clean.csv')]
 for a,b in pairs:check((ROOT/a).read_bytes()==(ROOT/b).read_bytes(),f'Mirror drift: {a} vs {b}')
 for a,b in pairs:
  archive=ROOT/'04_outputs/exports/data_package_v0_1'/Path(a).name
  check(archive.exists() and archive.read_bytes()==(ROOT/a).read_bytes(),f'Export package mirror drift: {a}')
 metrics=json.loads((ROOT/'04_outputs/figures/network_metrics.json').read_text());registry=read('04_outputs/figures/node_registry.csv');edges=read('04_outputs/figures/network_edges.csv');nodes={n['node_id']:n for n in registry}
 check({n['node_id'] for n in registry if n['mode']=='obligation'}==obl,'Registry obligations dropped from graph')
 check(metrics['network']['n_obligations']==len(obl),'Graph obligation denominator mismatch')
 check('IHR-OBL-037' not in metrics['isolated_obligations'],'Article40 candidate still rendered as absent')
 for e in edges:
  check(e['source'] in nodes and e['target'] in nodes,'Graph endpoint not in registry')
  check(nodes[e['source']]['mode']=='instrument' and nodes[e['target']]['mode']=='obligation','Edge orientation inconsistent')
  check(e['weight']=='1' and e['type']=='cited_in_mapping','Unvalidated legal score used as network weight')
  check(bool(e['mapping_ids'] and e['provision_ids']),'Edge provenance missing')
 check(any(a['actor']=='Dirección General de Epidemiología' and set(a['instruments'])=={'NOM-017','RI-SS-2025'} for a in metrics['actor_reach_ranked']),'DGE documentary associations missing')
 check(not any('INAI' in a['actor'] for a in metrics['actor_reach_ranked']),'Unresolved INAI/successor identity is in current graph')
 context=json.loads((ROOT/'04_outputs/exports/spar_normtrace_divergence.json').read_text())
 check(context['comparison_status']=='not_comparable_no_difference_calculated','Invalid SPAR comparison reintroduced')
 check(not any(k in context for k in ['headline_cc1','normtrace_corpus_anchoring_pct','divergence_latest','divergence_mean']),'Non-equivalent numeric comparison published')
 check(all(2021<=r['year']<=2025 for r in context['display_trajectory']),'SPAR editions pooled without crosswalk')
 manifest=json.loads((ROOT/'04_outputs/exports/audit_manifest.json').read_text())
 check(manifest['counts']==expected,'Manifest counts disagree with release tables')
 check(manifest['current_mean_anchoring'] is None and manifest['complete_pathways'] is None,'Unvalidated aggregate or complete-pathway claim published')
 actual=sorted({m['obligation_id'] for m in data['mappings'] if m['audit_status']!='legacy_preliminary'})
 check(manifest['targeted_reassessment_obligation_ids']==actual and manifest['targeted_reassessment_obligations']==len(actual),'Review cohort IDs/count mismatch')
 check(manifest['nia']['international_status']=='designation_or_establishment_reported','NIA reporting status not corrected')
 check(manifest['nia']['institution_identified'] is None and manifest['nia']['domestic_designation_instrument'] is None,'NIA identity/mandate invented')
 for filename in ['network_metrics.json','network_edges.csv','node_registry.csv','actor_instrument_associations.csv']:
  check((ROOT/'04_outputs/figures'/filename).read_bytes()==(ROOT/'05_webapp/public/data/derived'/filename).read_bytes(),f'Derived graph mirror drift: {filename}')
 for filename in ['audit_manifest.json','spar_normtrace_divergence.json']:
  check((ROOT/'04_outputs/exports'/filename).read_bytes()==(ROOT/'05_webapp/public/data/derived'/filename).read_bytes(),f'Derived metadata mirror drift: {filename}')
 for p in (ROOT/'05_webapp/src/pages').glob('*.tsx'):
  text=p.read_text()
  for banned in ['IHR Art. 4 requires statutory designation','actors that can issue those instruments','IHR obligations do not self-execute','cc1.divergence_latest','cc1.divergence_mean']:
   check(banned not in text,f'Withdrawn active claim in {p.name}: {banned}')
  check(not re.search(r'\bdeg=\d+|\bdegree:\s*\d+',text),f'Hard-coded graph degree in {p.name}')
 if failures:
  print('\n'.join('FAIL: '+f for f in failures));return 1
 print('PASS: release counts, references, corrected sources, pending-score handling, CSV/export mirrors, graph semantics/provenance, DGE, NIA status, SPAR non-comparison, and cohort identifiers.')
 return 0
if __name__=='__main__':sys.exit(main())
