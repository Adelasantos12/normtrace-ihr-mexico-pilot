#!/usr/bin/env python3
"""SPAR context only: no subtraction from a different construct or ordinal score.
The historical filename is retained for build compatibility. The old divergence payload
is replaced with an explicit deprecation record; consumers read spar_context.json.
"""
from pathlib import Path
import csv,json,math
ROOT=Path(__file__).resolve().parents[2]
SOURCE='02_data/raw/spar_americas_clean.csv'
def main():
 series=[]
 with (ROOT/SOURCE).open(encoding='utf8',newline='') as f:
  for r in csv.DictReader(f):
   if r['iso3c']!='MEX':continue
   try:y=int(r['year']);v=float(r['spar_cap1'])
   except (ValueError,TypeError):continue
   if not math.isfinite(v) or not 0<=v<=100:raise ValueError('SPAR value outside 0–100')
   series.append({'year':y,'value':v,'series_segment':'2021-2025 second edition' if y>=2021 else 'historical predecessor/first-edition series (not harmonized)'})
 series.sort(key=lambda r:r['year'])
 data={'release':'0.2.0-evidence-audit','country':'Mexico','series':series,'latest':series[-1] if series else None,
  'source_file':SOURCE,'source_status':'Existing project panel; not a newly independently audited download of all annual reports.',
  'construct':'C1 policy, legal and normative instruments in the 2021–2025 second-edition reporting cycles; preceding entries have different indicator definitions.',
  'comparability':'Historical observations are retained for provenance, not treated as an invariant indicator. Do not connect across the 2021 instrument break or average across editions.',
  'normtrace_comparator':None,'numeric_difference':None,
  'reason':'SPAR self-assessment and preliminary obligation-level legal coding lack a validated common construct and denominator. No percentage-point discrepancy, inflation claim or legal-strength reference line is calculated.',
  'spar_scope':'SPAR second-edition C1.1 already asks for national/subnational legal analysis and mapping; C2.1 considers NFP functions. NormTrace contributes inspectable obligation-level documentary traceability, not a law dimension absent from SPAR.',
  'sources':[
   {'label':'WHO SPAR second edition (2021), C1.1 and C2.1','url':'https://cdn.who.int/media/docs/default-source/health-security-preparedness/cap/spar/9789240040120-eng-new.pdf?sfvrsn=5dc09bd9_3'},
   {'label':'WHO SPAR revision presentation, 30 September 2026','url':'https://apps.who.int/gb/mspi/pdf_files/2026/09/Item1_30-09.pdf'}]}
 for folder in ['04_outputs/exports','05_webapp/public/data/derived']:
  p=ROOT/folder;p.mkdir(parents=True,exist_ok=True)
  (p/'spar_context.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
  (p/'spar_normtrace_divergence.json').write_text(json.dumps({'status':'withdrawn_non_equivalent_constructs','replacement':'spar_context.json','numeric_difference':None,'reason':data['reason']},indent=2)+'\n',encoding='utf8')
 print('SPAR context generated; invalid numerical comparison withdrawn.')
if __name__=='__main__':main()
