#!/usr/bin/env python3
"""Fail on analytical-data regressions; source correctness is not expert validation."""
from pathlib import Path
import csv, json, hashlib, sys
ROOT=Path(__file__).resolve().parents[2]
def rows(path,delimiter=','):
 with (ROOT/path).open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f,delimiter=delimiter))
def checks():
 failures=[]
 def require(ok,message):
  if not ok: failures.append(message)
 manifest=json.loads((ROOT/'00_project/dataset_manifest.json').read_text())
 summary=json.loads((ROOT/'05_webapp/public/data/derived/audit_summary.json').read_text())
 table='03_tables/country_legal_mapping/'
 m=rows(table+'mexico_ihr2005_mapping.csv');p=rows(table+'mexico_legal_provisions.csv')
 o=rows('03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv',';')
 actors=rows('03_tables/actors/mexico_health_governance_actors.csv')
 oids={r['obligation_id'] for r in o};pids={r['provision_id'] for r in p}
 for label,data,key in [('mappings',m,'mapping_id'),('provisions',p,'provision_id'),('obligations',o,'obligation_id'),('actors',actors,'actor_id')]:
  require(len(data)==len({r[key] for r in data}),f'Duplicate IDs in {label}')
 require(len(oids)==45,'The selected baseline registry changed; requires a scope revision')
 require({r['obligation_id'] for r in m}==oids,'Mapping must cover the obligation registry')
 for r in m:
  require(r['domestic_provision_id'] in pids or r['domestic_provision_id']=='NO_MATCH_IDENTIFIED',f'Broken provision link: {r["mapping_id"]}')
  if r['anchoring_level']=='':require(r['score_status']=='withheld_pending_legal_review',f'Unexplained unscored value: {r["mapping_id"]}')
  require(r.get('legacy_anchoring_level') is not None,'Missing score provenance')
  require(r['review_status'] not in {'validated','expert_validated'},'Targeted audit cannot silently certify legal validation')
 actual=dict(obligations=len(o),provisions=len(p),instruments=len(rows(table+'mexico_normative_corpus_index.csv')),mapping_rows=len(m),actor_entries=len(actors),unscored_mapping_rows=sum(r['anchoring_level']=='' for r in m))
 for k,v in actual.items():
  require(summary['counts'][k]==v and manifest['counts'][k]==v,f'Count differs for {k}')
 for path,sha in manifest['source_files'].items():
  file=ROOT/path
  require(hashlib.sha256(file.read_bytes()).hexdigest()==sha,f'Source hash differs: {path}')
  require(file.read_bytes()==(ROOT/'05_webapp/public/data'/f'{file.stem}_clean.csv').read_bytes(),f'Public CSV differs from source: {path}')
 labels={label:sorted({r['obligation_id'] for r in m if r['gap_type']==label}) for label in {r['gap_type'] for r in m}}
 require(summary['labels_to_obligation_ids']==labels,'Label-to-obligation ID sets differ')
 for stem in ['mexico_legal_references','mexico_institutional_relations']:
  rels=rows(('03_tables/actors/' if 'institutional' in stem else table)+stem+'.csv')
  for r in rels:require(r['source_provision_id'] in pids and r['source_url'].startswith('https://'),f'Unsourced relation/reference: {r}')
 net=json.loads((ROOT/'04_outputs/figures/network_metrics.json').read_text())
 nodes=rows('04_outputs/figures/node_registry.csv');edges=rows('04_outputs/figures/network_edges.csv');nids={r['node_id'] for r in nodes}
 require({r['node_id'] for r in nodes if r['mode']=='obligation'}==oids,'Isolated obligations were dropped')
 for e in edges:
  require(e['source'] in nids and e['target'] in nids,'Edge endpoint not in node registry')
  require(e['type']=='candidate_provision' and int(e['weight'])==int(e['rows']),'Network edge mislabels legal strength')
 dge=[a for a in net['actor_reach_ranked'] if a['actor_id']=='MEX_ACTOR_DGE_001']
 require(len(dge)==1 and 'NOM-017' in dge[0]['instruments'] and 'RI-SS-2025' in dge[0]['instruments'],'DGE source aliases missing')
 require(all(a['association_only'] for a in net['actor_reach_ranked']),'Actor association labelled as legal competence')
 for filename in ['network_metrics.json','node_registry.csv','network_edges.csv','actor_instrument_links.csv']:
  require((ROOT/'04_outputs/figures'/filename).read_bytes()==(ROOT/'05_webapp/public/data/derived'/filename).read_bytes(),f'Network web mirror differs: {filename}')
 bridge=json.loads((ROOT/'05_webapp/public/data/derived/spar_normtrace_divergence.json').read_text())
 require(bridge.get('comparison_permitted') is False,'SPAR numerical comparison must be disabled')
 for k in ['divergence_latest','divergence_mean','normtrace_legal_anchoring_pct']:require(bridge.get(k) is None,f'Invalid numeric comparison remains: {k}')
 nia=summary['nia_status'];require(nia['status']=='designation_or_establishment_reported' and nia['authority_name'] is None and nia['domestic_instrument'] is None,'NIA reporting and unknown identity conflated')
 for filename in ['NormPipeline.tsx','NormDiagnostic.tsx']:
  text=(ROOT/'05_webapp/src/pages'/filename).read_text()
  require('parseInt(r.anchoring_level) || 0' not in text,'Unscored records coerced to zero')
 text=(ROOT/'05_webapp/public/data/markdown/normtrace_ihr_methodology_web.md').read_text()
 require('C1.1' in text and 'C2.1' in text,'SPAR existing legal review omitted')
 return failures
if __name__=='__main__':
 try: failures=checks()
 except Exception as exc: failures=[f'Validation exception: {exc}']
 for failure in failures:print('FAIL:',failure)
 print('PASS — dataset integrity, source mirrors, explicit units, missing scores, network semantics and SPAR/NIA corrections.' if not failures else f'FAIL — {len(failures)} issue(s)')
 sys.exit(bool(failures))
