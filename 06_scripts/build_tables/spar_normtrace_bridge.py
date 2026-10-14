#!/usr/bin/env python3
"""Retire the invalid subtraction; retain original inputs in the audit archive."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[2]
def main():
 d=dict(status='withdrawn_non_equivalent_constructs',divergence_latest=None,divergence_mean=None,normtrace_legal_anchoring_pct=None,note='SPAR C1.1 already includes legal mapping. No validated denominator/construct crosswalk supports subtraction from NormTrace. This endpoint is a withdrawal notice, not a zero score.',legacy_commit='478e795f4ec2147c17acf4c128d686eb3a5935d1')
 for folder in ['04_outputs/figures','05_webapp/public/data/derived']:
  p=ROOT/folder/'spar_normtrace_divergence.json';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,indent=2)+'\n')
 print('SPAR subtraction withdrawn; original data preserved in 99_archive/legal_audit_20261014.')
if __name__=='__main__':main()
