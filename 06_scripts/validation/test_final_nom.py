from pathlib import Path
import unittest, csv
ROOT=Path(__file__).resolve().parents[2]
def rows(p):
 with p.open(encoding='utf-8',newline='') as f:return list(csv.DictReader(f))
class FinalNOMTests(unittest.TestCase):
 def test_final_standard_not_draft(self):
  data=rows(ROOT/'03_tables/country_legal_mapping/mexico_legal_provisions.csv')
  r=next(r for r in data if r['provision_id']=='MEX_PROV_NOM017_SEC814_AUDIT20261014')
  self.assertIn('5288225',r['source_url'])
  self.assertIn('unidades de vigilancia epidemiológica',r['provision_text'])
  self.assertNotIn('nivel inmediato superior',r['provision_text'])
 def test_community_intermediate_candidates_preserved(self):
  data=rows(ROOT/'03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv')
  for oid in ['IHR-OBL-012','IHR-OBL-013']:
   self.assertTrue(any(r['obligation_id']==oid and '_AUDIT_' in r['mapping_id'] for r in data))
