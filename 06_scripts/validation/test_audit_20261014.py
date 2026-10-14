"""Regression tests for corrected sources and the semantics of missing evidence."""
import csv,json,unittest
from pathlib import Path
R=Path(__file__).resolve().parents[2]
def rows(name):
 with (R/name).open(encoding='utf-8',newline='') as f:return list(csv.DictReader(f))
class AuditRegression(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.mapping=rows('03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv')
  cls.provisions={r['provision_id']:r for r in rows('03_tables/country_legal_mapping/mexico_legal_provisions.csv')}
 def test_charges_are_candidate_not_zero_gap(self):
  m=next(m for m in self.mapping if m['obligation_id']=='IHR-OBL-037')
  self.assertEqual(m['legacy_anchoring_level'],'0');self.assertEqual(m['anchoring_level'],'');self.assertEqual(m['gap_type'],'review pending')
  self.assertIn('excepción',self.provisions[m['domestic_provision_id']]['provision_text'])
 def test_manual_referral_is_not_missing_procedure(self):
  p=self.provisions['MEX_PROV_NOM017_SEC664_AUDIT'];self.assertIn('manual',p['provision_text'])
  linked=[r for r in self.mapping if r['domestic_provision_id']==p['provision_id']]
  self.assertTrue(linked);self.assertTrue(all(r['referral_status']=='manual_review_pending' for r in linked))
 def test_final_nom_not_project(self):
  for key in ['MEX_PROV_NOM017_SEC663_AUDIT','MEX_PROV_NOM017_SEC664_AUDIT','MEX_PROV_NOM017_SEC814_AUDIT']:
   self.assertIn('5288225',self.provisions[key]['source_url']);self.assertNotIn('4823',self.provisions[key]['source_url'])
 def test_distinct_notification_clocks(self):
  p=self.provisions['MEX_PROV_NOM017_SEC814_AUDIT'];self.assertIn('24 horas de su conocimiento',p['provision_text']);self.assertIn('assessment',p['audit_notes'])
 def test_no_complete_chain_from_one_none_row(self):
  m=json.loads((R/'04_outputs/exports/audit_manifest.json').read_text());self.assertIsNone(m['complete_pathways']);self.assertIsNone(m['current_mean_anchoring'])
 def test_canonical_and_web_rows_identical(self):
  self.assertEqual(self.mapping,rows('05_webapp/public/data/mexico_ihr2005_mapping_clean.csv'))
 def test_legacy_preserved(self):
  old=rows('99_archive/audit_2026_10_14/03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv');self.assertEqual(len(old),80)
  old_by={r['mapping_id']:r for r in old}
  for row in self.mapping:
   if row['mapping_id'] in old_by:self.assertEqual(row['legacy_anchoring_level'],old_by[row['mapping_id']]['anchoring_level'])
 def test_no_strength_weights(self):
  edges=rows('04_outputs/figures/network_edges.csv');self.assertTrue(all(e['weight']=='1' for e in edges));self.assertTrue(all(e['mapping_ids'] for e in edges))
if __name__=='__main__':unittest.main()
