#!/usr/bin/env python3
"""Generate current, explicitly bounded statistics and web/export mirrors."""
from pathlib import Path
from collections import Counter, defaultdict
import csv, json, hashlib, shutil
ROOT=Path(__file__).resolve().parents[2]
TABLE=ROOT/'03_tables/country_legal_mapping'
WEB=ROOT/'05_webapp/public/data'
OUT=ROOT/'04_outputs/exports/data_package_v0_2_audit'

def read(p,delimiter=','):
    with p.open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f,delimiter=delimiter))

def dump(p,obj):
    p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2,sort_keys=True)+'\n')

def main():
    audit=json.loads((ROOT/'00_project/legal_audit_applied.json').read_text())
    mapping=read(TABLE/'mexico_ihr2005_mapping.csv');provs=read(TABLE/'mexico_legal_provisions.csv')
    corpus=read(TABLE/'mexico_normative_corpus_index.csv');actors=read(ROOT/'03_tables/actors/mexico_health_governance_actors.csv')
    obligations=read(ROOT/'03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv',';')
    refs=read(TABLE/'mexico_legal_references.csv');rels=read(ROOT/'03_tables/actors/mexico_institutional_relations.csv')
    OUT.mkdir(parents=True,exist_ok=True);WEB.mkdir(parents=True,exist_ok=True)
    sources={
       'mexico_ihr2005_mapping':TABLE/'mexico_ihr2005_mapping.csv',
       'mexico_legal_provisions':TABLE/'mexico_legal_provisions.csv',
       'mexico_normative_corpus_index':TABLE/'mexico_normative_corpus_index.csv',
       'mexico_health_governance_actors':ROOT/'03_tables/actors/mexico_health_governance_actors.csv',
       'mexico_implementation_gap_map':ROOT/'04_outputs/country_profiles/mexico_implementation_gap_map.csv',
       'mexico_legal_references':TABLE/'mexico_legal_references.csv',
       'mexico_institutional_relations':ROOT/'03_tables/actors/mexico_institutional_relations.csv'}
    for stem,p in sources.items():
        shutil.copy2(p,WEB/(stem+'_clean.csv'));shutil.copy2(p,OUT/(stem+'.csv'))
    by=defaultdict(list)
    for r in mapping:by[r['obligation_id']].append(r)
    obligation_summary=[]
    for o in obligations:
        oid=o['obligation_id'];rs=by[oid]
        obligation_summary.append(dict(obligation_id=oid,title=o.get('obligation_title') or o.get('obligation_label') or o.get('article',''),
          mapping_ids=sorted(r['mapping_id'] for r in rs),
          candidate_provision_ids=sorted({r['domestic_provision_id'] for r in rs if r['domestic_provision_id']!='NO_MATCH_IDENTIFIED'}),
          current_review_labels=sorted({r['gap_type'] for r in rs}),
          audit_statuses=sorted({r['audit_status'] for r in rs}),
          unscored_records=sum(r['anchoring_level']=='' for r in rs),
          full_obligation_legal_validation='not_completed',
          note='Union of row labels, not a mutually exclusive diagnosis. A row with no gap does not make the whole obligation complete.'))
    # An explicit registry of IDs makes each descriptive count reproducible.
    labels={label:sorted({r['obligation_id'] for r in mapping if r['gap_type']==label}) for label in sorted({r['gap_type'] for r in mapping})}
    unmatched=sorted(oid for oid,rs in by.items() if all(r['domestic_provision_id']=='NO_MATCH_IDENTIFIED' for r in rs))
    counts=dict(obligations=len(obligations),provisions=len(provs),instruments=len(corpus),mapping_rows=len(mapping),
                actor_entries=len(actors),explicit_relation_records=len(rels),reference_records=len(refs),
                unscored_mapping_rows=sum(r['anchoring_level']=='' for r in mapping),
                unmatched_obligations_in_current_dataset=len(unmatched),
                changed_or_added_mapping_records=audit['corrected_mapping_records'])
    summary=dict(version=audit['audit_id'],date=audit['applied_date'],status='source-corrected preliminary pilot',counts=counts,
        aggregation_rules=dict(unit='obligation_id',evidence_status='Source verification and legal sufficiency are different fields.',
          labels='An obligation may have several row labels; do not sum overlapping counts.',
          scores='Blank means withheld/unassessed, never zero. No revised aggregate score is published.',
          unmatched='No candidate in the current dataset does not establish a legal vacuum.',
          full_paths='Not calculated; two legacy no-gap rows did not establish two complete obligation pathways.'),
        unmatched_obligation_ids=unmatched,labels_to_obligation_ids=labels,obligations=obligation_summary,
        nia_status=audit['nia_status'],sources=audit['sources'],retired_claims=audit['retired_claims'])
    for p in [WEB/'derived/audit_summary.json',ROOT/'04_outputs/exports/audit_summary.json',OUT/'audit_summary.json']:dump(p,summary)
    dump(WEB/'derived/legal_audit_changes.json',audit)
    manifest=dict(version=audit['audit_id'],scope_date='2026-10-14 targeted source audit; not a full currency audit',counts=counts,
        source_files={str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sources.values()},
        status='Preliminary. Numerical gap claims and compliance scores require independent legal validation.')
    dump(ROOT/'00_project/dataset_manifest.json',manifest);dump(OUT/'manifest.json',manifest);dump(WEB/'derived/dataset_manifest.json',manifest)
    (OUT/'README.md').write_text('# Corrected preliminary dataset\n\nGenerated from versioned source tables. Source corrections do not constitute expert legal validation. Empty scores are unassessed, not zero. See audit_summary.json for units, IDs and aggregation rules. Original values are retained in legacy_* columns and 99_archive/pre-audit-2026-10-14.\n')
    print('AUDIT SUMMARY',json.dumps(counts))

if __name__=='__main__':main()
