#!/usr/bin/env python3
"""Reconcile audit implementations against the final NOM; no legal re-scoring."""
from pathlib import Path
import csv, json, copy
ROOT=Path(__file__).resolve().parents[2]
STAMP='2026-10-14-final-NOM-reconciliation'
OLD='https://dof.gob.mx/normasOficiales/4823/salud12_C/salud12_C.html'
NEW='https://dof.gob.mx/nota_detalle_popup.php?codigo=5288225'
MAP=ROOT/'03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv'
PROV=MAP.with_name('mexico_legal_provisions.csv')
MARKER=ROOT/'00_project/legal_audit_applied.json'
PID663='MEX_PROV_NOM017_SEC663_664_AUDIT20261014'
PID814='MEX_PROV_NOM017_SEC814_AUDIT20261014'
TEXT663='6.6.3 Son responsables de coordinar y realizar la vigilancia epidemiológica internacional el personal de epidemiologia o equivalentes en los distintos niveles técnico-administrativos del SNS. 6.6.4 Los criterios y procedimientos de vigilancia internacional son los establecidos en el RSI y el manual de vigilancia internacional consensuados en el CONAVE a disposición del público para su consulta, en el portal electrónico de la DGE en: www.dgepi.salud.gob.mx,'
TEXT814='8.1.4 La notificación inmediata de los padecimientos, condiciones, eventos o urgencia epidemiológicas emergentes o reemergentes se realiza por las unidades de vigilancia epidemiológica o sus equivalentes en cada uno de los niveles técnico-administrativos hasta la DGE antes de que transcurran 24 horas de su conocimiento por el procedimiento de notificación establecido vía telefónica, fax o medio electrónico.'
DESC814='The final NOM-017 section 8.1.4 requires epidemiological surveillance units or their equivalents at the different technical-administrative levels to notify up to DGE before 24 hours from knowledge of the event, by telephone, fax or electronic means. This is not a finding of a direct exchange from every unit to DGE. The IHR Article 6 deadline instead runs from assessment.'
def read(p):
 with p.open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
def write(p,rs):
 fields=list(dict.fromkeys(k for r in rs for k in r))
 with p.open('w',encoding='utf-8',newline='') as f:
  w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(rs)
def main():
 audit=json.loads(MARKER.read_text())
 if audit.get('reconciliation_id')==STAMP:
  print('Final-NOM reconciliation already applied.');return
 rows=read(MAP);provs=read(PROV);before={r['mapping_id']:copy.deepcopy(r) for r in rows}
 original_provisions={p['provision_id']:copy.deepcopy(p) for p in provs}
 for p in provs:
  if 'NOM-017' in p.get('norm_title',''):
   p.setdefault('legacy_source_url',p.get('source_url',''));p['source_url']=NEW
  if p['provision_id']==PID663:
   p.update(provision_text=TEXT663,text_type='source_excerpt_whitespace_normalized',duty_created='Coordinate and carry out international epidemiological surveillance at the SNS technical-administrative levels.',source_verification_status='final_NOM_text_checked',source_url=NEW)
  if p['provision_id']==PID814:
   p.update(provision_text=TEXT814,text_type='source_excerpt_whitespace_normalized',topic='Immediate domestic reporting at technical-administrative levels',actor_mentioned='Epidemiological surveillance units or equivalents at each technical-administrative level; DGE',duty_created='Immediate notification by surveillance units or equivalents at the technical-administrative levels up to DGE, before 24 hours from knowledge.',procedure_created='Knowledge-based domestic notification deadline; telephone, fax or electronic means.',coordination_mechanism='Multi-level reporting up to DGE; the final text does not use the draft wording successive superior levels.',source_verification_status='final_NOM_text_checked',source_url=NEW,relevance_to_ihr=DESC814)
 for r in rows:
  if OLD in r.get('audit_source_url',''):r['audit_source_url']=r['audit_source_url'].replace(OLD,NEW)
  if r['domestic_provision_id']==PID814:
   r['assessment_summary']=DESC814;r['audit_note']+=' Final-NOM source confirmed; earlier draft wording withdrawn.'
  if r['domestic_provision_id']==PID663:
   r['assessment_summary']='Final NOM-017 sections 6.6.3 and 6.6.4 assign coordination and international-surveillance responsibilities across SNS technical-administrative levels, and refer to the IHR and the international surveillance manual. The manual remains to be reviewed for this obligation.'
  if r['domestic_provision_id']=='MEX_PROV_LGS_ART134_001':
   r.update(assessment_summary='Article 134 concerns surveillance, prevention and control of the diseases listed in its sections. The express SINAVE establishment and operation power is in Article 133 II. Read with the final NOM-017 and referred manuals; Article 134 alone cannot establish that IHR procedures are absent.',anchoring_level='',score_status='withheld_pending_legal_review',audit_status='source_correction_applied',evidence_status='relevant_provision_scope_review_pending',review_status='requires_human_review',gap_type='reference follow-up pending',audit_source_url='https://www.diputados.gob.mx/LeyesBiblio/pdf/LGS.pdf',audit_note='Final reconciliation extends the Article 134 correction to every use of that provision; no legal re-scoring.')
 for oid,pid,suffix in [('IHR-OBL-012',PID814,'814'),('IHR-OBL-013',PID663,'663')]:
  mid='MEX_MAP_IHR2005_'+oid[-3:]+'_AUDIT_'+suffix
  if any(r['mapping_id']==mid for r in rows):continue
  template=copy.deepcopy(next(r for r in rows if r['domestic_provision_id']==pid and '_AUDIT_' in r['mapping_id']))
  template.update(mapping_id=mid,obligation_id=oid,audit_status='source_added',score_status='withheld_pending_legal_review',anchoring_level='',audit_source_url=NEW,audit_note='Candidate correspondence retained when reconciling the production audit. Source identification does not establish full satisfaction of this Annex 1 obligation.')
  for k in list(template):
   if k.startswith('legacy_'):template[k]=''
  rows.append(template)
 write(MAP,rows);write(PROV,provs)
 for r in rows:
  old=before.get(r['mapping_id'])
  if old!=r:
   changes={k:{'before':old.get(k) if old else None,'after':v} for k,v in r.items() if old is None or old.get(k)!=v}
   audit['changes'].append(dict(record_id=r['mapping_id'],obligation_id=r['obligation_id'],changes=changes,stage=STAMP))
 audit['corrected_mapping_records']=len({r['record_id'] for r in audit['changes']})
 audit['reconciliation_id']=STAMP
 audit['reconciliation_production_commit']='60f5c89903511710ed1615cbf7e7566c5ebd9d40'
 audit['reconciliation_note']='Two audit implementations were reconciled. The final NOM (DOF 5288225) replaces the draft source. The prior production snapshot is archived. The consolidated dataset retains one combined 6.6.3-6.6.4 source record and adds the community/intermediate candidate links; counts therefore differ from both intermediate drafts. No scoring was inferred.'
 audit['source_record_corrections']=[{'provision_id':p['provision_id'],'before':original_provisions[p['provision_id']],'after':p} for p in provs if original_provisions[p['provision_id']]!=p]
 for s in audit['sources']:
  if s['id']=='NOM-017':s.update(url=NEW,document_status='final standard; draft not used as operative text')
 MARKER.write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
 for path in [ROOT/'03_tables/country_legal_mapping/mexico_legal_references.csv',ROOT/'03_tables/actors/mexico_institutional_relations.csv']:
  rs=read(path)
  for r in rs:
   if r.get('source_url')==OLD:r['source_url']=NEW
   if r.get('relation_id')=='REL-NOM-NOTIFICATION':
    r.update(source_actor='Epidemiological surveillance units or equivalents at technical-administrative levels',target_actor='DGE, within the multi-level reporting process',action='Immediate notification before 24 hours from knowledge, by telephone, fax or electronic means',scope_note='Final NOM-017 text, not the draft. This is a legal description of a reporting process across levels; it does not imply a direct unit-to-DGE tie or observed exchanges.')
  write(path,rs)
 m=ROOT/'06_scripts/maintenance/apply_legal_audit_20261014.py'
 text=m.read_text().replace(OLD,NEW)
 for pid in [PID663,PID814]:
  text=text.replace(original_provisions[pid]['provision_text'],next(p['provision_text'] for p in provs if p['provision_id']==pid))
 text=text.replace('Corresponding sanitary authority; immediately superior administrative level; DGE','Epidemiological surveillance units or equivalents at technical-administrative levels; DGE')
 text=text.replace('Notify the immediately superior level, successively up to the DGE, before 24 hours from knowledge.','Notify at the technical-administrative levels up to DGE, before 24 hours from knowledge.')
 text=text.replace('Successive technical-administrative reporting levels up to DGE.','Multi-level reporting up to DGE; final NOM wording.')
 text=text.replace("source_actor='Corresponding sanitary authority',target_actor='Immediately superior administrative level, successively up to DGE'","source_actor='Epidemiological surveillance units or equivalents at technical-administrative levels',target_actor='DGE, within the multi-level reporting process'")
 m.write_text(text)
 for folder in ['00_project','05_webapp/public/data/markdown']:
  for p in (ROOT/folder).glob('*.md'):
   p.write_text(p.read_text().replace(OLD,NEW).replace('reporting through successive administrative levels to the DGE','reporting by surveillance units or equivalents at technical-administrative levels up to the DGE'))
 browser_tests=ROOT/'05_webapp/tests/audit_20261014.spec.ts'
 browser_tests.write_text(browser_tests.read_text().replace('mapping_rows:86','mapping_rows:88'))
 tests=ROOT/'06_scripts/validation/test_final_nom.py'
 tests.write_text('''from pathlib import Path
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
''')
 (ROOT/'00_project/AUDIT_RECONCILIATION_20261014.md').write_text('''# Audit reconciliation — 14 October 2026

The production branch had acquired an earlier audit implementation while the independent correction branch was being validated. Both concerned this source audit. The complete production tree at `60f5c89903511710ed1615cbf7e7566c5ebd9d40` is preserved under `99_archive/reconciled-production-60f5c89`, in addition to its Git history.

The consolidated implementation retains the source corrections, adds community/intermediate-level notification candidate matches from the earlier audit, and uses the final NOM-017 (DOF code 5288225), not the 2012 draft. Sections 6.6.3 and 6.6.4 are kept as one combined provision record. This explains the differing record totals between intermediate implementations; obligations and instruments are unchanged.

The earlier implementation assigned provisional numeric codes to new matches. This version withholds affected codes pending legal review and preserves original values. Shared-instrument associations remain distinct from explicitly sourced legal relations and observed coordination.

Reproduction: run the initial audit migration only on its expected original baseline, then `reconcile_legal_audit_20261014.py`, regenerate audit summary/network/SPAR context, and run validation and browser tests. Applied markers prevent repeat mutation of source tables.

Final standard: https://dof.gob.mx/nota_detalle_popup.php?codigo=5288225
''')
 print('Reconciled final NOM and overlapping audit; no legal scores fabricated.')
if __name__=='__main__':main()
