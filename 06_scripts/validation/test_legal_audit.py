from pathlib import Path
import csv, json, unittest, importlib.util
ROOT=Path(__file__).resolve().parents[2]
TABLE=ROOT/'03_tables/country_legal_mapping'
def rows(name):
 with (TABLE/name).open(encoding='utf-8',newline='') as f:return list(csv.DictReader(f))
class LegalAuditTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.mapping=rows('mexico_ihr2005_mapping.csv');cls.provisions=rows('mexico_legal_provisions.csv');cls.byid={r['mapping_id']:r for r in cls.mapping}
 def test_sinave_article_133(self):
  r=self.byid['MEX_MAP_IHR2005_002_001'];self.assertEqual(r['domestic_article'],'Art. 133, fracción II');self.assertEqual(r['anchoring_level'],'')
 def test_article_134_not_fourteen_procedures(self):
  p=next(p for p in self.provisions if p['provision_id']=='MEX_PROV_LGS_ART134_001');self.assertIn('not fourteen',p['procedure_created'])
 def test_traveller_fees_candidate(self):
  rs=[r for r in self.mapping if r['obligation_id']=='IHR-OBL-037'];self.assertTrue(any('007' in r['domestic_provision_id'] for r in rs));self.assertFalse(any(r['domestic_provision_id']=='NO_MATCH_IDENTIFIED' for r in rs))
 def test_aircraft_and_maritime_not_swapped(self):
  self.assertIn('31',self.byid['MEX_MAP_IHR2005_034_001']['domestic_article']);self.assertIn('30',self.byid['MEX_MAP_IHR2005_035_001']['domestic_article'])
 def test_national_reporting_clock(self):
  p=next(p for p in self.provisions if p['provision_id']=='MEX_PROV_NOM017_SEC814_AUDIT20261014');self.assertIn('conocimiento',p['provision_text']);self.assertIn('assessment',p['relevance_to_ihr'])
 def test_referred_manual_not_absence(self):
  refs=rows('mexico_legal_references.csv');r=next(r for r in refs if r['reference_id']=='REF-NOM-MANUAL');self.assertEqual(r['retrieval_status'],'not_reviewed')
 def test_withheld_score_is_not_zero(self):
  withheld=[r for r in self.mapping if r['score_status']=='withheld_pending_legal_review'];self.assertTrue(withheld);self.assertTrue(all(r['anchoring_level']=='' for r in withheld))
 def test_regulations_not_mislabeled_statutes(self):
  self.assertTrue(all(r['match_type'] not in {'direct statutory','indirect statutory'} for r in self.mapping if r['domestic_norm'].startswith('Reglamento')))
 def test_full_obligation_not_inferred_from_row(self):
  summary=json.loads((ROOT/'04_outputs/exports/audit_summary.json').read_text());self.assertTrue(all(o['full_obligation_legal_validation']=='not_completed' for o in summary['obligations']))
 def test_archive_is_original(self):
  import hashlib
  marker=json.loads((ROOT/'00_project/legal_audit_applied.json').read_text());original=ROOT/'99_archive/pre-audit-2026-10-14/03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv';self.assertEqual(hashlib.sha256(original.read_bytes()).hexdigest(),marker['baseline_mapping_sha256'])
 def test_regression_gate(self):
  spec=importlib.util.spec_from_file_location('check',ROOT/'06_scripts/validation/validate_content.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);self.assertEqual(module.checks(),[])
if __name__=='__main__':unittest.main()
