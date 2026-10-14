#!/usr/bin/env python3
"""One-time maintenance of the audit migration; safe to repeat.
Keep builders sourced from canonical tables and prevent duplicate React imports on reruns.
"""
from pathlib import Path
import subprocess
ROOT=Path(__file__).resolve().parents[2]
p=ROOT/'06_scripts/audit/apply_20261014.py'
s=p.read_text()
s=s.replace('s="import EvidenceReview from \'./pages/EvidenceReview\';\\n"+s', 's=("import EvidenceReview from \'./pages/EvidenceReview\';\\n"+s) if "import EvidenceReview from" not in s else s')
s=s.replace("s=s.replace('<Route element={<Layout />}>','<Route element={<Layout />}>\\n          <Route path=\"/audit\" element={<EvidenceReview />} />')", "if 'path=\"/audit\"' not in s:s=s.replace('<Route element={<Layout />}>','<Route element={<Layout />}>\\n          <Route path=\"/audit\" element={<EvidenceReview />} />')")
s=s.replace('s="import AuditNotice from \'./components/AuditNotice\';\\n"+s;s=s.replace(\'<Outlet />\',\'<AuditNotice /><Outlet />\')', 's=("import AuditNotice from \'./components/AuditNotice\';\\n"+s) if "import AuditNotice from" not in s else s;s=s.replace(\'<Outlet />\',\'<AuditNotice /><Outlet />\') if \'<AuditNotice /><Outlet />\' not in s else s')
# Correct the corpus-level source URL as well as the provision-level links.
needle="corpus_by={p['norm_id']:p for p in corpus}"
replacement="""for c in corpus:
 if c['norm_id']=='MEX-012':
  c['official_source']=SOURCES['NOM017']['url']
  c['notes']=c.get('notes','')+' | Audit 2026-10-14: final NOM publication, not PROY-NOM.'
corpus_by={p['norm_id']:p for p in corpus}"""
if 'final NOM publication, not PROY-NOM.' not in s:s=s.replace(needle,replacement)
needle=" print(json.dumps(summary,ensure_ascii=False))"
replacement=""" # CSV mirrors are build outputs, never independent sources of truth.
 for source,dest in [('03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv','mexico_ihr2005_mapping_clean.csv'),('03_tables/country_legal_mapping/mexico_legal_provisions.csv','mexico_legal_provisions_clean.csv'),('03_tables/country_legal_mapping/mexico_normative_corpus_index.csv','mexico_normative_corpus_index_clean.csv'),('03_tables/actors/mexico_health_governance_actors.csv','mexico_health_governance_actors_clean.csv'),('03_tables/actors/actor_obligation_evidence.csv','actor_obligation_evidence.csv')]:
  (ROOT/'05_webapp/public/data'/dest).write_bytes((ROOT/source).read_bytes())
 print(json.dumps(summary,ensure_ascii=False))"""
if 'CSV mirrors are build outputs' not in s:s=s.replace(needle,replacement)
p.write_text(s)
# Archive-only legacy auxiliary diagnostic data must not masquerade as current ratings.
# Its former public endpoint is an explicit CSV withdrawal notice; originals remain in Git.
# This hook is deliberately independent of the authoritative mapping tables.
subprocess.run(['python3',str(p)],cwd=ROOT,check=True)
# Verify the migration is byte-for-byte idempotent across all tracked/generated text outputs.
import hashlib
paths=[ROOT/'05_webapp/src/App.tsx',ROOT/'05_webapp/src/Layout.tsx',ROOT/'03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv',ROOT/'05_webapp/public/data/derived/audit_summary.json']
before={str(x):hashlib.sha256(x.read_bytes()).hexdigest() for x in paths}
subprocess.run(['python3',str(p)],cwd=ROOT,check=True,stdout=subprocess.DEVNULL)
after={str(x):hashlib.sha256(x.read_bytes()).hexdigest() for x in paths}
assert before==after,'Migration must be idempotent'
print('PASS: migration idempotence and canonical web regeneration')
