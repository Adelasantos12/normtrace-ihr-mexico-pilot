#!/usr/bin/env python3
"""Publish SPAR context without subtracting non-equivalent legal measures.

The legacy filename is retained for compatibility. It now exports a context
object with no divergence, anchoring percentage or cross-edition mean.
"""
from pathlib import Path
import csv,json
ROOT=Path(__file__).resolve().parents[2]
def main():
    rows=[]
    with (ROOT/'02_data/raw/spar_americas_clean.csv').open(encoding='utf-8',newline='') as f:
        for row in csv.DictReader(f):
            if row['iso3c']!='MEX':continue
            try: year=int(row['year']);value=float(row['spar_cap1'])
            except (ValueError,TypeError):continue
            if not 0<=value<=100: raise ValueError('SPAR outside 0-100')
            rows.append({'year':year,'value':value,'series_segment':'2021-2025 second edition' if year>=2021 else 'historical non-harmonized instruments'})
    rows.sort(key=lambda r:r['year'])
    result={
      'schema_version':'2.0','generated_by':'06_scripts/build_tables/spar_normtrace_bridge.py',
      'country':'Mexico','comparison_status':'not_comparable_no_difference_calculated',
      'scope_note':'SPAR already includes legal mapping and review. Its country-level capacity score and the pilot legal-anchoring codes are not equivalent measures. No percentage-point difference or cross-edition average is calculated.',
      'latest_observation':rows[-1] if rows else None,'trajectory':rows,
      'display_trajectory':[r for r in rows if 2021<=r['year']<=2025],
      'indicator_label':'C1: policy, legal and normative instruments for IHR implementation (SPAR second edition)',
      'history_note':'Earlier reporting instruments used different capacities and definitions. The full source series is retained for provenance, not pooled as a continuous comparable score. The 2026 SPAR revision requires its own crosswalk.',
      'legal_score_status':'withheld_pending_recalibration_and_legal_review',
      'data_provenance':'02_data/raw/spar_americas_clean.csv; values inherited from the pilot data. Source-to-raw extraction is not independently revalidated in this targeted release.',
      'sources':[{'title':'WHO SPAR second edition, C1.1 and C2.1','url':'https://cdn.who.int/media/docs/default-source/health-security-preparedness/cap/spar/9789240040120-eng-new.pdf'},
                 {'title':'WHO SPAR revision presentation, 30 September 2026','url':'https://apps.who.int/gb/mspi/pdf_files/2026/09/Item1_30-09.pdf'}],
      'deprecated_fields':['headline_cc1','normtrace_corpus_anchoring_pct','divergence_latest','divergence_mean'],
      'interpretation':'Use legal traceability to inspect supporting provisions and review questions, not to infer inflated SPAR scores.'}
    for folder in [ROOT/'04_outputs/exports',ROOT/'05_webapp/public/data/derived']:
        folder.mkdir(parents=True,exist_ok=True);(folder/'spar_normtrace_divergence.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print('SPAR context generated; non-equivalent differences and historical averages removed.')
if __name__=='__main__':main()
