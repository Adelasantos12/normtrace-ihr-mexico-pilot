#!/usr/bin/env python3
"""SPAR context only. No subtraction between non-equivalent measures."""
from pathlib import Path
import csv,json
ROOT=Path(__file__).resolve().parents[2]

def main():
 with (ROOT/'02_data/raw/spar_americas_clean.csv').open(encoding='utf-8-sig',newline='') as f:
  rows=list(csv.DictReader(f))
 trajectory=[]
 for row in rows:
  if row['iso3c']=='MEX':
   try:y,v=int(row['year']),float(row['spar_cap1'])
   except (ValueError,TypeError):continue
   trajectory.append(dict(year=y,value=v,comparability_note='SPAR edition and indicator changes require review before longitudinal comparison.'))
 trajectory.sort(key=lambda r:r['year'])
 data=dict(country='Mexico',status='context_only_not_comparable_scores',generated_by='06_scripts/build_tables/spar_normtrace_bridge.py',
   cc1_spar_series=dict(latest_year=trajectory[-1]['year'],latest=trajectory[-1]['value'],trajectory=trajectory),
   comparison_permitted=False,divergence_latest=None,divergence_mean=None,normtrace_legal_anchoring_pct=None,
   explanation='SPAR already includes national/subnational legal review under C1.1 and focal-point mandate/function under C2.1. NormTrace organizes provision-level evidence. No equivalent-denominator crosswalk has been validated; subtracting an ordinal legal-mapping index from SPAR does not measure overstatement or preparedness gaps.',
   provenance='SPAR values reproduced from the existing project panel, not newly validated against official country submissions. No historical mean across instrument versions is calculated.',
   sources=[dict(title='WHO SPAR second edition, 2021, C1.1 and C2.1',url='https://cdn.who.int/media/docs/default-source/health-security-preparedness/cap/spar/9789240040120-eng-new.pdf'),dict(title='WHO SPAR revision presentation, 30 September 2026',url='https://apps.who.int/gb/mspi/pdf_files/2026/09/Item1_30-09.pdf')])
 for out in [ROOT/'04_outputs/exports',ROOT/'05_webapp/public/data/derived']:
  out.mkdir(parents=True,exist_ok=True);(out/'spar_normtrace_divergence.json').write_text(json.dumps(data,ensure_ascii=False,indent=2,sort_keys=True)+'\n')
 print('SPAR context generated: comparison disabled; no divergence calculated.')

if __name__=='__main__':main()
