#!/usr/bin/env python3
"""Regenerate versioned counts and explicitly named review cohorts."""
from pathlib import Path
from collections import Counter
import csv,json,hashlib
ROOT=Path(__file__).resolve().parents[2]
def read(p,d=','):
 with (ROOT/p).open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f,delimiter=d))
def main():
 paths={'obligations':('03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv',';'),'provisions':('03_tables/country_legal_mapping/mexico_legal_provisions.csv',','),'instruments':('03_tables/country_legal_mapping/mexico_normative_corpus_index.csv',','),'mappings':('03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv',','),'actors':('03_tables/actors/mexico_health_governance_actors.csv',',')}
 data={k:read(*v) for k,v in paths.items()};m=data['mappings']
 cohorts={}
 for status in sorted({r['audit_status'] for r in m}):
  selected=[r for r in m if r['audit_status']==status];cohorts[status]={'mapping_ids':sorted(r['mapping_id'] for r in selected),'obligation_ids':sorted({r['obligation_id'] for r in selected})}
 pending=sorted({r['obligation_id'] for r in m if r['audit_status']!='legacy_preliminary'})
 base=json.loads((ROOT/'00_project/audit_2026_10_14.json').read_text())
 manifest={**base,'counts':{k:len(v) for k,v in data.items()},'targeted_reassessment_obligation_ids':pending,'targeted_reassessment_obligations':len(pending),
  'new_source_provisions':sum(r.get('source_verification_status')=='source_text_checked' for r in data['provisions']),
  'cohorts':cohorts,'cohort_rule':'Count distinct obligation IDs within an explicitly named review cohort. Cohorts may overlap; row-level status is not a whole-obligation compliance verdict.',
  'complete_pathways':None,'complete_pathways_status':'not_validated_no_claim_published',
  'current_mean_anchoring':None,'score_status':'withheld_pending_reassessment',
  'legacy_gap_labels_by_row':dict(sorted(Counter(r['legacy_gap_type'] for r in m if r.get('legacy_gap_type')).items())),
  'input_hashes':{k:hashlib.sha256((ROOT/v[0]).read_bytes()).hexdigest() for k,v in paths.items()},
  'baseline_counts':{'obligations':45,'provisions':110,'instruments':18,'mappings':80,'actors':18},
  'note':'Source corrections are implemented. Pending legal judgments are explicitly left unresolved; source-text checks are not expert validation. Historical labels and scores are available in the archive, not presented as current findings.'}
 for folder in [ROOT/'04_outputs/exports',ROOT/'05_webapp/public/data/derived']:
  folder.mkdir(parents=True,exist_ok=True);(folder/'audit_manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 print('Audit manifest:',manifest['counts'],'targeted reassessment:',len(pending))
if __name__=='__main__':main()
