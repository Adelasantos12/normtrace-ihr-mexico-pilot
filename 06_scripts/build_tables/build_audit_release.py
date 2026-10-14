#!/usr/bin/env python3
"""Build the current evidence release from canonical tables; do not grade legal compliance."""
from pathlib import Path
import csv
import json
import hashlib
from collections import Counter
ROOT=Path(__file__).resolve().parents[2]
VERSION='0.2.0-evidence-audit'
DATE='2026-10-14'
CANON={
 'mexico_ihr2005_mapping':'03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv',
 'mexico_legal_provisions':'03_tables/country_legal_mapping/mexico_legal_provisions.csv',
 'mexico_normative_corpus_index':'03_tables/country_legal_mapping/mexico_normative_corpus_index.csv',
 'mexico_health_governance_actors':'03_tables/actors/mexico_health_governance_actors.csv',
 'mexico_evidenced_relationships':'03_tables/actors/mexico_evidenced_relationships.csv',
}
def rows(path,delimiter=','):
 with (ROOT/path).open(encoding='utf8',newline='') as f:return list(csv.DictReader(f,delimiter=delimiter))
def write_json(path,data):
 p=ROOT/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def main():
 data={k:rows(v) for k,v in CANON.items()}
 obligations=rows('03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv',';')
 mapping=data['mexico_ihr2005_mapping'];provs=data['mexico_legal_provisions'];corpus=data['mexico_normative_corpus_index']
 manifest={
  'release':VERSION,'audit_date':DATE,'status':'targeted_source_corrections_expert_validation_pending',
  'counts':{'obligations':len(obligations),'provisions':len(provs),'indexed_instruments':len(corpus),
   'active_in_pilot_index':sum(r['corpus_status']=='active_in_pilot_index' for r in corpus),
   'archived_instruments':sum(r['corpus_status']=='archived' for r in corpus),
   'mapping_records':len(mapping),'actor_records':len(data['mexico_health_governance_actors']),
   'source_checked_relationships':len(data['mexico_evidenced_relationships']),
   'source_checked_provisions':sum(r.get('evidence_status')=='text_checked_scope_pending' for r in provs),
   'mapping_records_with_targeted_corrections':sum(r.get('checked_at')==DATE for r in mapping)},
  'unit_notes':{'obligations':'Selected units extracted from IHR 2005; not all duties in the 2024 amendments.',
   'indexed_instruments':'The pilot index includes archived instruments. Active-in-index does not certify current legal validity.',
   'mapping_records':'One obligation can have multiple provision correspondences. Rows are not obligations.',
   'source_checked_relationships':'Normative text-based relationships, not observed exchanges; two use generic reporting levels.'},
  'current_anchoring_mean':None,'confirmed_gap_count':None,'complete_legal_pathways':None,
  'score_status':'withheld_pending_revalidation','score_reason':'Original ratings use a preliminary coding scale that has not been revalidated after the source corrections. Pending is not zero. No subtraction from SPAR is supported.',
  'legacy_claims_withdrawn':['18 obligations with confirmed procedural/coordination gaps','7 confirmed federal-state gaps','2 complete legal pathways','6 distinct instruments with proven missing safeguards'],
  'evidence_status_by_record':dict(sorted(Counter(r['evidence_status'] for r in mapping).items())),
  'source_sha256':{v:hashlib.sha256((ROOT/v).read_bytes()).hexdigest() for v in CANON.values()},
  'limitations':['State legislation, federal-state agreements and administrative practice were not comprehensively reviewed.',
    'Referenced manuals remain separate pending review items, not legal absences.',
    'No new institution is identified as Mexico\'s National IHR Authority without a domestic designation source.',
    'Historical actor records do not establish current successor competences.'],
 }
 per_obligation=[]
 for o in obligations:
  oid=o['obligation_id'];rr=[r for r in mapping if r['obligation_id']==oid]
  candidates=sorted({r['domestic_provision_id'] for r in rr if r['domestic_provision_id']!='NO_MATCH_IDENTIFIED'})
  flags=sorted({r['gap_type'] for r in rr})
  per_obligation.append({'obligation_id':oid,'article':o.get('article',''),'mapping_ids':[r['mapping_id'] for r in rr],
   'candidate_provision_ids':candidates,'n_candidate_provisions':len(candidates),'review_flags':flags,
   'review_status':'references_pending' if 'reference_review_pending' in flags else ('scope_pending' if 'scope_review_pending' in flags else 'not_revalidated'),
   'confirmed_gap':None,'complete_pathway':None,'current_anchoring_score':None})
 # Current method scope is derived, not a permanently hard-coded manuscript count.
 import re
 for method_path in ['00_project/normtrace_ihr_methodology_full.md','05_webapp/public/data/markdown/normtrace_ihr_methodology_full.md','05_webapp/public/data/markdown/normtrace_ihr_methodology_web.md']:
  p=ROOT/method_path
  text=p.read_text(encoding='utf8')
  text=re.sub(r'\*\*\d+ selected obligation units, \d+ provision records and \d+ mapping records\*\*',f"**{len(obligations)} selected obligation units, {len(provs)} provision records and {len(mapping)} mapping records**",text)
  p.write_text(text,encoding='utf8')
 for key,path in CANON.items():
  b=(ROOT/path).read_bytes()
  for dest in [f'05_webapp/public/data/{key}_clean.csv',f'04_outputs/exports/data_package_v0_2/{key}.csv']:
   p=ROOT/dest;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
 for name,content in [('audit_manifest.json',manifest),('obligation_review.json',per_obligation)]:
  for folder in ['04_outputs/exports','05_webapp/public/data/derived']:write_json(f'{folder}/{name}',content)
 for name in ['issues.json','nia_status.json']:
  content=json.loads((ROOT/f'00_project/audit_2026-10-14/{name}').read_text())
  write_json('05_webapp/public/data/derived/'+('audit_issues.json' if name=='issues.json' else name),content)
 write_json('04_outputs/exports/data_package_v0_2/manifest.json',manifest)
 # This package is downloadable from the app and has no stale v0.1 numeric diagnostics.
 import zipfile,io
 buf=io.BytesIO()
 with zipfile.ZipFile(buf,'w',zipfile.ZIP_DEFLATED) as z:
  for p in sorted((ROOT/'04_outputs/exports/data_package_v0_2').glob('*')):
   if p.is_file():
    info=zipfile.ZipInfo(p.name,date_time=(2026,10,14,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o644<<16
    z.writestr(info,p.read_bytes())
 (ROOT/'05_webapp/public/data/normtrace_evidence_v0_2.zip').write_bytes(buf.getvalue())
 print(json.dumps(manifest['counts'],indent=2))
if __name__=='__main__':main()
