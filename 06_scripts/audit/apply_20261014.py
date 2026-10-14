#!/usr/bin/env python3
"""Scoped audit migration. Textual corrections are not expert compliance validation.
Run once from any directory; repeat runs use the preserved baseline, not their own output.
"""
from pathlib import Path
import csv, json, hashlib, shutil, re
from collections import Counter, defaultdict

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / '99_archive/legal_audit_20261014'
WEB = ROOT / '05_webapp/public/data'
TABLE = ROOT / '03_tables/country_legal_mapping'
DATE = '2026-10-14'
VERSION = '0.1.1-audit'
BASE_SHA = '478e795f4ec2147c17acf4c128d686eb3a5935d1'
SOURCES = {
 'NOM017': {'url':'https://dof.gob.mx/nota_detalle_popup.php?codigo=5288225', 'title':'NOM-017-SSA2-2012, final standard, DOF 19 February 2013', 'note':'The earlier audit URL /normasOficiales/4823/salud12_C/salud12_C.html is the draft (PROY), not the final standard. References below use the final text.'},
 'LGS': {'url':'https://www.diputados.gob.mx/LeyesBiblio/pdf/LGS.pdf', 'title':'Ley General de Salud, articles 133(II) and 134', 'note':'Source correction concerns these provisions; not a certification of all subsequent amendments.'},
 'RISI': {'url':'https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LGS_MSI.pdf', 'title':'Reglamento de la Ley General de Salud en Materia de Sanidad Internacional, articles 7, 30 and 31', 'note':'1985 instrument; age and regulatory rank alone do not establish inadequacy.'},
 'PAHO': {'url':'https://iris.paho.org/bitstreams/7c461167-1eae-4e58-ad9c-d8ba8338c9dc/download', 'title':'PAHO CD63/INF/1, 21 August 2026, paragraph 17', 'note':'Mexico reported designation or establishment by 15 July 2026. This report does not identify the Mexican entity or domestic act.'},
 'SPAR': {'url':'https://cdn.who.int/media/docs/default-source/health-security-preparedness/cap/spar/9789240040120-eng-new.pdf', 'title':'WHO SPAR, second edition (2021), indicators C1.1 and C2.1', 'note':'Already includes national/subnational legal mapping and review, and focal-point functions.'},
 'SPAR2026': {'url':'https://apps.who.int/gb/mspi/pdf_files/2026/09/Item1_30-09.pdf', 'title':'WHO presentation on SPAR revision, 30 September 2026', 'note':'Presentation addresses domestic governance and responsible authorities; not treated here as evidence of every final reporting-tool detail.'},
 'IHR': {'url':'https://apps.who.int/gb/bd/pdf_files/IHR_2014-2022-2024-en.pdf', 'title':'International Health Regulations, consolidated amendments, articles 4 and 6', 'note':'Article 4 permits legislative and/or administrative arrangements as appropriate; Article 6 notification clock follows assessment.'}
}

def read(path, delimiter=','):
 with open(path, encoding='utf-8-sig', newline='') as f:
  return [{k.strip(): (v or '').strip() for k,v in r.items()} for r in csv.DictReader(f, delimiter=delimiter)]

def write_csv(path, rows, fields=None):
 path.parent.mkdir(parents=True,exist_ok=True)
 fields = fields or list(dict.fromkeys(k for r in rows for k in r))
 with open(path,'w',encoding='utf-8',newline='') as f:
  w=csv.DictWriter(f,fieldnames=fields,lineterminator='\n');w.writeheader();w.writerows(rows)

def put(path, text):
 p=ROOT/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text,encoding='utf-8')

def jsave(path,obj):
 path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(obj,ensure_ascii=False,indent=2,sort_keys=True)+'\n',encoding='utf-8')

def baseline(path):
 src=ROOT/path; dst=BASE/path
 if not dst.exists():
  dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst)
 return dst

paths={
 'mapping':'03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv',
 'provisions':'03_tables/country_legal_mapping/mexico_legal_provisions.csv',
 'corpus':'03_tables/country_legal_mapping/mexico_normative_corpus_index.csv',
 'actors':'03_tables/actors/mexico_health_governance_actors.csv',
 'obligations':'03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv'}
for path in paths.values():baseline(path)
for path in ['05_webapp/public/data/derived/spar_normtrace_divergence.json','00_project/network_methodology_rationale.md','05_webapp/public/data/markdown/normtrace_ihr_methodology_web.md']:
 baseline(path)
mapping=read(BASE/paths['mapping']);provisions=read(BASE/paths['provisions']);corpus=read(BASE/paths['corpus']);actors=read(BASE/paths['actors']);obligations=read(BASE/paths['obligations'],';')
pby={p['provision_id']:p for p in provisions}
legacy_fields=['anchoring_level','gap_type','confidence_level','assessment_summary','actor_fit','procedure_fit','coordination_fit','enforcement_fit','rights_safeguard_fit','federalism_fit']
for r in mapping:
 for k in legacy_fields:r['legacy_'+k]=r.get(k,'')
 r.update(record_status='active',review_status='legacy_unvalidated',audit_version=VERSION,source_check_status='not_reassessed',audit_note='',source_url='',replacement_ids='')
 # Withdraw numerical legal conclusions until consistent recoding. Original values remain explicit legacy fields.
 for k in legacy_fields:
  if k!='assessment_summary':r[k]=''
 r['gap_type']='not reassessed'
 r['assessment_summary']='Legacy assessment, not revalidated in this audit: '+r['legacy_assessment_summary']
 p=pby.get(r.get('domestic_provision_id',''))
 if p:
  r['source_url']=p.get('source_url','')
  if p.get('norm_type')=='regulation' or r['domestic_norm'].startswith('Reglamento'):r['match_type']='regulatory correspondence'
  elif r['domestic_norm']=='Ley Aduanera':r['match_type']='statutory correspondence'

for p in provisions:
 p.update(source_check_status='not_reassessed',audit_version=VERSION,text_kind='legacy extraction; verify against source')
 if p['norm_id']=='MEX-012':p['source_url']=SOURCES['NOM017']['url']
 if p['provision_id']=='MEX_PROV_LGS_ART134_001':
  p['legacy_relevance_to_ihr']=p.get('relevance_to_ihr','')
  p['relevance_to_ihr']='Lists transmissible diseases subject to surveillance, prevention and control by health authorities within their competence. The express SINAVE establishment/operation power is Article 133(II), not this list.'
  p['power_granted']='Surveillance, prevention and control of listed transmissible diseases within assigned competence.'
  p['duty_created']=p['power_granted'];p['source_check_status']='textual_correction_scope_pending'

# Verbatim excerpts from the final NOM, and the legal texts already present in the corpus.
additions=[
 ('MEX_PROV_LGS_ART133_II_AUDIT','MEX-002','Art. 133, fracción II','Establecer y operar el Sistema Nacional de Vigilancia Epidemiológica, de conformidad con esta Ley y las disposiciones que al efecto se expidan;','Secretaría de Salud','LGS','The chapeau assigns this function to the Ministry of Health.','identified_text_scope_pending'),
 ('MEX_PROV_NOM017_SEC663_AUDIT','MEX-012','Numeral 6.6.3','Son responsables de coordinar y realizar la vigilancia epidemiológica internacional el personal de epidemiologia o equivalentes en los distintos niveles técnico-administrativos del SNS.','Personal de epidemiología en los niveles técnico-administrativos del SNS','NOM017','Express assignment across technical-administrative levels; not evidence of actual exchanges.','identified_text_scope_pending'),
 ('MEX_PROV_NOM017_SEC664_AUDIT','MEX-012','Numeral 6.6.4','Los criterios y procedimientos de vigilancia internacional son los establecidos en el RSI y el manual de vigilancia internacional consensuados en el CONAVE a disposición del público para su consulta, en el portal electrónico de la DGE en: www.dgepi.salud.gob.mx,','CONAVE; Dirección General de Epidemiología','NOM017','Reference to IHR and manual located. The referenced manual is not evaluated in this correction.','referral_pending_review'),
 ('MEX_PROV_NOM017_SEC814_AUDIT','MEX-012','Numeral 8.1.4','La notificación inmediata de los padecimientos, condiciones, eventos o urgencia epidemiológicas emergentes o reemergentes se realiza por las unidades de vigilancia epidemiológica o sus equivalentes en cada uno de los niveles técnico-administrativos hasta la DGE antes de que transcurran 24 horas de su conocimiento por el procedimiento de notificación establecido vía telefónica, fax o medio electrónico.','Unidades de vigilancia epidemiológica; Dirección General de Epidemiología','NOM017','Domestic clock: knowledge of the event. IHR Article 6(1): notification to WHO within 24 hours of assessment. These clocks are not interchangeable.','identified_text_scope_pending'),
 ('MEX_PROV_RISI_ART007_AUDIT','MEX-016','Art. 7o.','Los servicios de sanidad internacional y los documentos respectivos que se expidan de acuerdo con la Ley, este Reglamento y demás disposiciones aplicables, serán gratuitos, a excepción de los siguientes servicios: I.-Los de Desinfección, Desinsectación y Desratización, y II.-Los demás que establezcan el Reglamento Sanitario Internacional, los tratados o Convenciones internacionales y la legislación fiscal aplicable.','Servicios de sanidad internacional','RISI','Candidate basis on gratuity. Scope and exceptions must be compared with IHR Article 40; not a compliance determination.','identified_text_scope_pending'),
 ('MEX_PROV_RISI_ART030_AUDIT','MEX-016','Art. 30','El comandante de la aeronave o jefe de sobrecargos a borde de un avión en tránsito internacional, al aterrizar en un aeropuerto nacional, llenará y presentará a la Secretaría un ejemplar de la declaración general de aeronave, cuya parte sanitaria contenga los informes en la forma establecida por el Reglamento Sanitario Internacional. El comandante suministrará, además, la información complementaria que requiera la Secretaría, respecto a las condiciones de sanidad a bordo durante el viaje.','Comandante de aeronave; jefe de sobrecargos; Secretaría de Salud','RISI','Identifies presenter, arrival and IHR form reference. Detailed compatibility with current annex remains to be reviewed.','identified_text_scope_pending'),
 ('MEX_PROV_RISI_ART031_AUDIT','MEX-016','Art. 31','Al arribar una embarcación al Territorio Nacional, el capitán entregará a la Secretaría la declaración marítima de sanidad en la forma establecida por el Reglamento Sanitario Internacional. El capitán de la embarcación y el médico, si lo hubiere, facilitarán los datos que les solicite la Secretaría respecto a las condiciones de sanidad a bordo durante la travesía.','Capitán; médico de embarcación; Secretaría de Salud','RISI','Identifies presenter, arrival and IHR form reference. Detailed compatibility with current annex remains to be reviewed.','identified_text_scope_pending')]
corpus_by={p['norm_id']:p for p in corpus}
for pid,nid,article,text,actor,source,note,status in additions:
 n=corpus_by[nid];p={k:'' for k in provisions[0]}
 p.update(provision_id=pid,norm_id=nid,norm_title=n['norm_title'],norm_type=n['instrument_type'],hierarchy_level=n['normative_hierarchy'],jurisdiction='federal',article=article,provision_text=text,topic='audit source correction',actor_mentioned=actor,relevance_to_ihr=note,source_url=SOURCES[source]['url'],version_date=DATE,source_check_status=status,audit_version=VERSION,text_kind='verbatim excerpt; whitespace normalized',audit_note=note)
 provisions.append(p);pby[pid]=p

changed=[]
for r in mapping:
 pid=r['domestic_provision_id']; oid=r['obligation_id'];note=None
 if pid=='MEX_PROV_LGS_ART134_001':
  note='Article 134 lists transmissible diseases subject to surveillance, prevention and control; it does not enumerate laboratory/notification functions or establish SINAVE. Read Article 133(II) for the express establishment/operation power.'
 elif pid=='MEX_PROV_NOM017_SEC661_001' or (oid in ['IHR-OBL-001','IHR-OBL-004','IHR-OBL-014'] and 'Reglamento Interior' in r['domestic_norm']):
  note='Read this assignment together with NOM-017 6.6.3, 6.6.4 and 8.1.4. Responsibilities, a manual reference and a domestic notification deadline are identified. Full procedure scope, manual content and WHO communication arrangements remain under review. NFP designation does not itself identify the NIA.'
 elif oid in ['IHR-OBL-034','IHR-OBL-035']:
  note='The earlier absence claim did not account for RLGS-SI articles 30 and 31, which specify presenter, arrival and IHR form reference. These provisions are now linked. Compatibility with the current IHR annex requires further review.'
 elif oid=='IHR-OBL-037':
  note='No-match conclusion withdrawn: RLGS-SI Article 7 supplies a candidate basis on free services/documents with exceptions. Scope and exceptions require comparison with IHR Article 40.'
  r['record_status']='superseded';r['replacement_ids']='MEX_MAP_AUDIT_037_ART007'
 if note:
  r.update(assessment_summary=note,audit_note=note,review_status='source_corrected_scope_pending',source_check_status='textual_correction_scope_pending',gap_type='scope review pending')
  changed.append(r['mapping_id'])

pairs=[
 ('002','ART133II','MEX_PROV_LGS_ART133_II_AUDIT'),
 ('001','SEC663','MEX_PROV_NOM017_SEC663_AUDIT'),
 ('001','SEC664','MEX_PROV_NOM017_SEC664_AUDIT'),
 ('004','SEC664','MEX_PROV_NOM017_SEC664_AUDIT'),
 ('014','SEC664','MEX_PROV_NOM017_SEC664_AUDIT'),
 ('004','SEC814','MEX_PROV_NOM017_SEC814_AUDIT'),
 ('014','SEC814','MEX_PROV_NOM017_SEC814_AUDIT'),
 ('037','ART007','MEX_PROV_RISI_ART007_AUDIT'),
 ('034','ART031','MEX_PROV_RISI_ART031_AUDIT'),
 ('035','ART030','MEX_PROV_RISI_ART030_AUDIT')]
for oid,key,pid in pairs:
 p=pby[pid];r={k:'' for k in mapping[0]}
 r.update(mapping_id=f'MEX_MAP_AUDIT_{oid}_{key}',obligation_id=f'IHR-OBL-{oid}',domestic_provision_id=pid,domestic_norm=p['norm_title'],domestic_article=p['article'],match_type='candidate textual correspondence',assessment_summary=p['audit_note'],gap_type='scope review pending',review_status='source_corrected_scope_pending',record_status='active',source_check_status=p['source_check_status'],source_url=p['source_url'],audit_note=p['audit_note'],audit_version=VERSION)
 mapping.append(r)

# Actor records remain an inventory, not an inferred coordination/issuing network.
for a in actors:
 a['audit_version']=VERSION;a['review_status']='legacy_inventory_unvalidated'
 a['legacy_instruments_it_can_issue']=a['instruments_it_can_issue']
 a['instruments_it_can_issue']='Not validated in this audit; do not infer issuing powers from appearance in a legal instrument.'
 if a['actor_id']=='MEX_ACTOR_DGE_001':
  a['ihr_relevance']='National IHR Focal Point under NOM-017 6.6.1-6.6.2. PAHO reports a Mexican National IHR Authority, but its identity and domestic act are not established here. Do not equate the two roles.'
  a['review_status']='focal_point_text_checked_nia_identity_pending'
  a['legal_nature']='Administrative unit of the Ministry of Health; see the current Interior Regulation.'
  a['source_norm']='NOM-017-SSA2-2012, final text';a['source_article']='6.6.1–6.6.2'
 if a['actor_id']=='MEX_ACTOR_INAI_001':
  a['actor_name']='Data-protection oversight institutions (legacy INAI/successor grouping; historical reference)'
  a['review_status']='institutional_transition_review_pending'
  a['limitations']='This inherited grouping does not establish current legal identity or a one-to-one succession. Review the 2025 framework before assigning current powers.'

# Only explicit, provision-backed role references. No propagation through shared laws.
actor_refs=[]
for aid,oid,pid,role in [
 ('MEX_ACTOR_DGE_001','IHR-OBL-001','MEX_PROV_NOM017_SEC661_001','National IHR Focal Point'),
 ('MEX_ACTOR_DGE_001','IHR-OBL-004','MEX_PROV_NOM017_SEC814_AUDIT','Domestic notification recipient; WHO deadline is distinct'),
 ('MEX_ACTOR_DGE_001','IHR-OBL-014','MEX_PROV_NOM017_SEC814_AUDIT','Domestic notification recipient; assessment procedure requires further review'),
 ('MEX_ACTOR_SS_001','IHR-OBL-002','MEX_PROV_LGS_ART133_II_AUDIT','Establish and operate SINAVE'),
 ('MEX_ACTOR_SS_001','IHR-OBL-034','MEX_PROV_RISI_ART031_AUDIT','Receive maritime health declaration'),
 ('MEX_ACTOR_SS_001','IHR-OBL-035','MEX_PROV_RISI_ART030_AUDIT','Receive aircraft health declaration')]:
 actor_refs.append(dict(actor_id=aid,obligation_id=oid,provision_id=pid,relation_type='textual_role_reference',role=role,source_url=pby[pid]['source_url'],review_status='text_identified_scope_pending',audit_version=VERSION))

for name,rows in [('mapping',mapping),('provisions',provisions),('corpus',corpus),('actors',actors)]:write_csv(ROOT/paths[name],rows)
write_csv(ROOT/'03_tables/actors/actor_obligation_evidence.csv',actor_refs)
for filename,rows in [('mexico_ihr2005_mapping_clean.csv',mapping),('mexico_legal_provisions_clean.csv',provisions),('mexico_normative_corpus_index_clean.csv',corpus),('mexico_health_governance_actors_clean.csv',actors)]:write_csv(WEB/filename,rows)
write_csv(WEB/'actor_obligation_evidence.csv',actor_refs)

nia=dict(status='designation_reported',reported_as_of='2026-07-15',report_date='2026-08-21',entity=None,domestic_designation_instrument=None,source=SOURCES['PAHO'],note='Designation or establishment confirmed by Mexico to PAHO. Entity and domestic legal act remain to be located; do not assume DGE.')
jsave(WEB/'derived/national_ihr_authority.json',nia)
jsave(ROOT/'03_tables/review_flags/national_ihr_authority.json',nia)

# Canonical descriptive builder. No legal readiness score, implied power, or shared-law actor reach.
builder=r'''#!/usr/bin/env python3
from pathlib import Path
import csv,json,hashlib
from collections import defaultdict,Counter
ROOT=Path(__file__).resolve().parents[2]
def rows(p,sep=','):
 with open(ROOT/p,encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f,delimiter=sep))
def write(p,items,fields):
 p.parent.mkdir(parents=True,exist_ok=True)
 with open(p,'w',encoding='utf-8',newline='') as f:
  w=csv.DictWriter(f,fieldnames=fields,lineterminator='\n');w.writeheader();w.writerows(items)
def main():
 m=rows('03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv'); active=[r for r in m if r['record_status']=='active']
 p=rows('03_tables/country_legal_mapping/mexico_legal_provisions.csv');pb={r['provision_id']:r for r in p}
 o=rows('03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv',';')
 c=rows('03_tables/country_legal_mapping/mexico_normative_corpus_index.csv'); cb={r['norm_id']:r for r in c}
 a=rows('03_tables/actors/mexico_health_governance_actors.csv');ab={r['actor_id']:r for r in a}
 refs=rows('03_tables/actors/actor_obligation_evidence.csv')
 links=defaultdict(list)
 for r in active:
  if r['domestic_provision_id'] in pb:links[(pb[r['domestic_provision_id']]['norm_id'],r['obligation_id'])].append(r)
 edges=[]
 for (nid,oid),rs in sorted(links.items()):
  edges.append(dict(source=nid,target=oid,type='documented_correspondence',weight=1,rows=len(rs),provision_ids=';'.join(sorted({r['domestic_provision_id'] for r in rs})),mapping_ids=';'.join(sorted(r['mapping_id'] for r in rs)),source_urls=';'.join(sorted({r['source_url'] for r in rs if r['source_url']})),review_status='scope_pending' if any(r['review_status']!='legacy_unvalidated' for r in rs) else 'legacy_unvalidated'))
 for r in refs:edges.append(dict(source=r['actor_id'],target=r['obligation_id'],type='textual_role_reference',weight=1,rows=1,provision_ids=r['provision_id'],mapping_ids='',source_urls=r['source_url'],review_status=r['review_status']))
 inst_ids=sorted({k[0] for k in links});actor_ids=sorted({r['actor_id'] for r in refs});nodes=[]
 for r in o:nodes.append(dict(id=r['obligation_id'],mode='obligation',label=r.get('article',''),full=r.get('article_title',''),degree=sum(1 for e in edges if e['type']=='documented_correspondence' and e['target']==r['obligation_id'])))
 for nid in inst_ids:nodes.append(dict(id=nid,mode='instrument',label=cb[nid].get('short_title') or nid,full=cb[nid]['norm_title'],degree=sum(1 for e in edges if e['source']==nid)))
 for aid in actor_ids:nodes.append(dict(id=aid,mode='actor',label='DGE' if aid=='MEX_ACTOR_DGE_001' else 'Secretaría de Salud',full=ab[aid]['actor_name'],degree=sum(1 for e in edges if e['source']==aid)))
 isolates=sorted(n['id'] for n in nodes if n['mode']=='obligation' and n['degree']==0)
 graph=dict(version='0.1.1-audit',nodes=nodes,edges=edges,isolated_obligations=isolates,note='Source-correspondence network. Actor edges have explicit provision references; they do not represent observed coordination, issuing powers, or inter-agency dependencies. The actor-role layer is intentionally partial.')
 summary=dict(version='0.1.1-audit',date='2026-10-14',obligations=len(o),corpus_instruments=len(c),provisions=len(p),mapping_records=len(m),active_mapping_records=len(active),superseded_records=len(m)-len(active),connected_instruments=len(inst_ids),inventory_actors=len(a),network_actors=len(actor_ids),actor_role_references=len(refs),network_nodes=len(nodes),network_edges=len(edges),isolated_obligations=isolates,review_status=dict(sorted(Counter(r['review_status'] for r in active).items())),scores_status='withdrawn_pending_consistent_recoding',complete_pathways=None,confirmed_gap_count=None,expert_compliance_validation=False)
 hashes={str(f.relative_to(ROOT)):hashlib.sha256(f.read_bytes()).hexdigest() for f in [ROOT/'03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv',ROOT/'03_tables/country_legal_mapping/mexico_legal_provisions.csv',ROOT/'03_tables/actors/actor_obligation_evidence.csv']}
 summary['source_sha256']=hashes
 for folder in [ROOT/'04_outputs/figures',ROOT/'05_webapp/public/data/derived']:
  folder.mkdir(parents=True,exist_ok=True)
  for name,obj in [('evidence_network.json',graph),('audit_summary.json',summary)]: (folder/name).write_text(json.dumps(obj,ensure_ascii=False,sort_keys=True,indent=2)+'\n',encoding='utf-8')
  write(folder/'network_edges.csv',edges,list(edges[0]));write(folder/'node_registry.csv',[dict(node_id=n['id'],mode=n['mode'],degree=n['degree'],label=n['label']) for n in nodes],['node_id','mode','degree','label'])
  (folder/'network_metrics.json').write_text(json.dumps(dict(status='legacy_inference_withdrawn',replacement='evidence_network.json',network=dict(n_obligations=len(o),n_instruments=len(inst_ids),n_edges=len(edges)),note=graph['note']),indent=2)+'\n')
 print(json.dumps(summary,ensure_ascii=False))
if __name__=='__main__':main()
'''
put('06_scripts/build_tables/build_network.py',builder)
put('06_scripts/build_tables/spar_normtrace_bridge.py',r'''#!/usr/bin/env python3
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
''')

methodology='''# NormTrace-IHR: evidence and review status

## Scope of this correction

Release 0.1.1-audit implements the scoped source audit of 14 October 2026. The corpus covers 45 selected IHR 2005 obligation units and 18 federal instruments. The separate 2024, Pandemic Agreement and PABS registries are not pooled with that denominator. Descriptive record counts are regenerated from canonical CSV files.

This is an AI-assisted preliminary research corpus. Textual checking is not independent expert validation or a finding of compliance. State legislation, federal-state agreements and actual administrative practice remain outside the reviewed scope.

## What has changed

The SINAVE establishment/operation power is linked to LGS Article 133(II); Article 134 is described as a list of transmissible diseases. NOM-017 6.6.3, 6.6.4 and 8.1.4 are now recorded, including the referral to the international-surveillance manual and the domestic notification clock. The final NOM source replaces the draft URL used in the earlier audit.

RLGS-SI Article 7 supplies a candidate correspondence for IHR Article 40; the prior no-match row is explicitly superseded, not silently deleted. Articles 30 and 31 supply aircraft/maritime declaration procedures and references to IHR forms. Full equivalence remains a review question.

## SPAR and legal evidence

SPAR second edition C1.1 already calls for national and subnational legal mapping, analysis and review. C2.1 examines focal-point functions. NormTrace organizes provision-level evidence that can support such assessments; it does not establish that SPAR ignores law. The September 2026 WHO revision presentation gives attention to domestic governance and responsible authorities.

The subtraction of SPAR and NormTrace percentages has been withdrawn. There is no validated common construct or denominator. Legacy anchoring scores and gap labels are preserved as explicitly historical fields; they are not current readiness measures. No replacement legal score, count of complete pathways or confirmed gap total is supplied by this scoped audit.

## Evidence statuses and referrals

`legacy_unvalidated`: inherited assessment not revalidated here. `source_corrected_scope_pending`: a source omission or description was corrected; sufficiency for the whole obligation still requires review. `referral_pending_review`: an express reference was located, but the referenced document has not been examined. `superseded`: an old record retained for provenance, excluded from current associations and counts of active mappings.

A missing document, an unexamined referral, a partly specified procedure and an established legal absence are distinct. None is converted into another by an aggregate score. An absence from this federal corpus does not establish an absence in Mexican law or practice.

## Reading the network

Instrument-obligation edges are documentary correspondences with provision and mapping identifiers. Actor-obligation edges are a partial set of explicit textual role references with sources. DGE is represented separately. No edges are generated merely because institutions appear in the same law. No edge asserts that its actor issued the instrument, can amend it, or coordinates successfully with another actor.

All 45 obligation nodes are retained, including those with no current correspondence. A disconnected node means no association in this dataset, not a confirmed legal vacuum. Degree counts measure documentary incidence only. Legal sufficiency, political influence and system resilience cannot be read from node size or degree.

## National IHR Authority

PAHO CD63/INF/1 paragraph 17 reports that Mexico had confirmed designation or establishment of a National IHR Authority by 15 July 2026. The Mexican institution and domestic act are not identified in that report. DGE's National Focal Point role is documented separately; this release does not identify DGE as the NIA.

Article 4 permits one or two entities and legislative and/or administrative arrangements as appropriate. It does not universally require a new statute. The adequacy of a regulation depends on its powers, legal basis and content, not its rank or age alone.

## Sources

'''+''.join(f"- [{v['title']}]({v['url']}). {v['note']}\n" for v in SOURCES.values())+'''
## Reproducibility and remaining work

Canonical tables are in `03_tables`; the builders regenerate web copies and descriptive artifacts. Original tables are preserved under `99_archive/legal_audit_20261014` and in baseline commit 478e795f. Record-level before/after fields preserve lineage.

Remaining work: review the referred manual and other instruments; identify the domestic NIA act; examine the scope and exceptions of candidate provisions; revalidate unaffected legacy correspondences; define consistent obligation-level coding and, only then, recompute legal conclusions. Static legacy diagnostics, causal topology and draft reports are not served as current findings.
'''
put('05_webapp/public/data/markdown/normtrace_ihr_methodology_web.md',methodology)
put('00_project/legal_audit_20261014.md',methodology)
put('05_webapp/public/data/markdown/legal_audit_20261014.md',methodology)
for path in ['00_project/network_methodology_rationale.md','00_project/normtrace_ihr_methodology_full.md']:
 if (ROOT/path).exists():
  baseline(path);put(path,methodology+'\nHistorical methodology is retained in the audit archive; its numerical and causal interpretations are withdrawn pending recoding.\n')
for p in (WEB/'markdown').glob('*.md'):
 if p.name not in ['normtrace_ihr_methodology_web.md','legal_audit_20261014.md']:
  baseline(str(p.relative_to(ROOT)))
  p.write_text('# Historical output withdrawn from current use\n\nThis document used pre-audit classifications. It has been preserved in the repository audit archive. Consult [the current review note](/methodology) and [record-level evidence](/mapping). It must not be treated as a current legal diagnosis.\n',encoding='utf-8')

# Preserve the existing navigation/layout. Legacy inferential screens are replaced by an explicit review register.
put('05_webapp/src/components/AuditNotice.tsx',r'''import { Link } from 'react-router-dom';
export default function AuditNotice() {
 return <aside className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" role="note"><strong>Source corrections · 14 October 2026.</strong> Legal scores and confirmed-gap totals are withheld pending consistent recoding. Textual corrections do not constitute expert compliance validation. <Link className="underline" to="/audit">Review changes and sources</Link>.</aside>;
}
''')
put('05_webapp/src/pages/EvidenceReview.tsx',r'''import { Link, useLocation } from 'react-router-dom';
import { useJsonData } from '../hooks/useData';
import AuditNotice from '../components/AuditNotice';
type Summary={version:string;obligations:number;corpus_instruments:number;provisions:number;mapping_records:number;active_mapping_records:number;superseded_records:number;inventory_actors:number;network_actors:number;actor_role_references:number;review_status:Record<string,number>};
export default function EvidenceReview(){
 const {data,loading,error}=useJsonData<Summary>('derived/audit_summary.json');const {pathname}=useLocation();
 if(loading)return <p role="status">Loading evidence register…</p>;
 if(error||!data)return <p role="alert">The evidence register could not be loaded. Reload the page; no missing result is treated as zero.</p>;
 return <div className="max-w-5xl mx-auto space-y-7 pb-16"><header><p className="text-xs font-semibold uppercase tracking-widest text-blue-700">NormTrace-IHR · Mexico · {data.version}</p><h1 className="text-3xl sm:text-5xl font-bold text-slate-900 mt-3">{pathname==='/'?'From an IHR obligation to its legal evidence':'Evidence and correction register'}</h1><p className="text-lg text-slate-600 mt-4">Follow selected obligations to domestic provisions, inspect their sources, and distinguish what has been located from what still needs legal review.</p></header><AuditNotice/>
 <nav className="flex flex-wrap gap-4" aria-label="Evidence tools">{[['/mapping','Explore correspondences'],['/actors','Open source network'],['/provisions','Read provisions'],['/methodology','Methodology']].map(([url,label])=><Link key={url} to={url} className="rounded-lg bg-slate-900 px-4 py-3 text-white">{label}</Link>)}</nav>
 <section className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-label="Descriptive corpus counts">{[['Selected IHR 2005 obligations',data.obligations],['Federal instruments',data.corpus_instruments],['Provision records',data.provisions],['Active correspondences',data.active_mapping_records]].map(([label,value])=><div key={label} className="p-5 rounded-xl border border-slate-200 bg-white"><div className="text-3xl font-bold">{value}</div><div className="text-sm text-slate-600 mt-2">{label}</div></div>)}</section>
 <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"><h2 className="text-xl font-semibold">What was corrected</h2><p>SINAVE is linked to General Health Law Article 133(II). Article 134 is no longer described as establishing the system. The final NOM-017 text now supports the records for 6.6.3, 6.6.4 and 8.1.4, including the manual reference and domestic reporting clock.</p><p>International health regulation Article 7 replaces a previous no-match conclusion for IHR Article 40 with a candidate correspondence. Articles 30 and 31 identify aircraft and maritime health-declaration procedures. Their full scope still requires review.</p><p>{data.mapping_records} records are preserved, including {data.superseded_records} superseded record. Only {data.active_mapping_records} active records feed current associations. None of these counts is a number of confirmed compliance failures.</p></section>
 <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"><h2 className="text-xl font-semibold">National IHR Authority: designation reported</h2><p>PAHO reports that Mexico had confirmed designation or establishment by 15 July 2026. The entity and domestic designation instrument still need to be located. The map does not assume that DGE holds this role.</p><a className="underline text-blue-700" href="https://iris.paho.org/bitstreams/7c461167-1eae-4e58-ad9c-d8ba8338c9dc/download" target="_blank" rel="noreferrer">PAHO CD63/INF/1, paragraph 17</a></section>
 <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"><h2 className="text-xl font-semibold">Review status, not a new legal score</h2>{Object.entries(data.review_status).map(([label,count])=><p key={label}>{label.replaceAll('_',' ')}: <strong>{count}</strong> active records.</p>)}<p>The former SPAR subtraction, complete-pathway count and confirmed-gap totals are withdrawn. SPAR already asks countries to review and map laws; NormTrace makes provision-level evidence available for checking.</p>{pathname!=='/'&&pathname!=='/audit'&&<p className="text-amber-900">The earlier diagnostic at this address relied on the withdrawn classifications. Its source is preserved in Git history; this register replaces it until those conclusions can be recalculated responsibly.</p>}</section>
 <section className="space-y-3"><h2 className="text-xl font-semibold">Download the evidence</h2><div className="flex flex-wrap gap-5">{[['mexico_ihr2005_mapping_clean.csv','Correspondences CSV'],['mexico_legal_provisions_clean.csv','Provisions CSV'],['actor_obligation_evidence.csv','Actor-role evidence CSV'],['derived/audit_summary.json','Recomputed counts and hashes'],['markdown/legal_audit_20261014.md','Audit note']].map(([path,label])=><a key={path} className="underline text-blue-700" href={'/data/'+path} download>{label}</a>)}</div><p className="text-sm text-slate-500">Original scores and hypotheses remain explicitly labelled as legacy fields and in the repository archive. New candidate links are not labelled as legally validated.</p></section></div>;
}
''')
put('05_webapp/src/pages/LandingPage.tsx',"import EvidenceReview from './EvidenceReview';\nexport default function LandingPage(){return <main className=\"min-h-screen bg-slate-50 p-6 md:p-12 text-slate-900\"><EvidenceReview/></main>;}\n")
put('05_webapp/src/pages/SparBridge.tsx',r'''import { Link } from 'react-router-dom';
export default function SparBridge(){return <div className="max-w-3xl space-y-6"><h1 className="text-4xl font-bold">SPAR and provision-level evidence</h1><p className="text-lg">SPAR already includes legal review. In its second edition, C1.1 asks about national and subnational legal mapping, assessment and revision; C2.1 covers focal-point functions.</p><p>NormTrace organizes selected obligations and their domestic source references so that others can examine the basis for an assessment. This complements the review process; it does not demonstrate that SPAR ignores law.</p><p className="p-5 bg-amber-50 border border-amber-200 rounded-xl">The previous subtraction of SPAR and NormTrace percentages has been withdrawn. The measures have no validated common denominator or construct. No replacement divergence score is reported.</p><p>The WHO presentation of 30 September 2026 on SPAR revision addresses domestic governance and responsible authorities. Its details must be read in the context of that reporting-tool revision.</p><p><a className="underline text-blue-700" href="https://cdn.who.int/media/docs/default-source/health-security-preparedness/cap/spar/9789240040120-eng-new.pdf">SPAR second edition</a> · <a className="underline text-blue-700" href="https://apps.who.int/gb/mspi/pdf_files/2026/09/Item1_30-09.pdf">September 2026 presentation</a></p><Link to="/mapping" className="underline text-blue-700">Examine the legal correspondences</Link></div>;}
''')
put('05_webapp/src/pages/MappingExplorer.tsx',r'''import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCsvData } from '../hooks/useData';
type Row=Record<string,string>;
export default function MappingExplorer(){
 const {data,loading,error}=useCsvData<Row>('mexico_ihr2005_mapping_clean.csv');const {data:obs}=useCsvData<Row>('ihr_2005_obligations_clean.csv');
 const [q,setQ]=useState('');const [status,setStatus]=useState('');const [history,setHistory]=useState(false);
 const byId=useMemo(()=>Object.fromEntries(obs.map(o=>[o.obligation_id,o])),[obs]);
 const filtered=data.filter(r=>(history||r.record_status!=='superseded')&&(!status||r.review_status===status)&&`${r.obligation_id} ${r.domestic_article} ${r.domestic_norm} ${r.assessment_summary}`.toLowerCase().includes(q.toLowerCase()));
 if(loading)return <p role="status">Loading correspondences…</p>;if(error)return <p role="alert">Could not load correspondences: {error.message}</p>;
 return <div className="space-y-6"><header><h1 className="text-4xl font-bold">Obligation-level evidence</h1><p className="text-slate-600 mt-3">Sources, corrections and pending scope review. These are correspondence records, not confirmed gaps or complete pathways.</p></header><div className="flex flex-wrap gap-4 bg-white border p-4 rounded-xl"><label className="flex-1 min-w-48">Search<input aria-label="Search correspondences" className="block w-full border rounded-lg p-3 mt-1" placeholder="Article, institution or obligation ID" value={q} onChange={e=>setQ(e.target.value)}/></label><label>Review status<select aria-label="Review status" className="block border p-3 rounded-lg mt-1" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option>{[...new Set(data.map(r=>r.review_status))].sort().map(s=><option key={s}>{s}</option>)}</select></label><label className="self-end p-3"><input type="checkbox" checked={history} onChange={e=>setHistory(e.target.checked)}/> Include superseded records</label></div><p role="status">Showing {filtered.length} of {data.length} preserved records. Superseded records are excluded from the current network.</p>
 {filtered.map(r=><article key={r.mapping_id} className="bg-white border border-slate-200 p-6 rounded-xl space-y-3"><div className="text-sm text-blue-800">{r.obligation_id} · {byId[r.obligation_id]?.article}</div><h2 className="text-xl font-semibold">{byId[r.obligation_id]?.article_title||r.obligation_id}</h2><p>{r.domestic_norm||'No source in this historical record'} · {r.domestic_article}</p><p className="text-sm font-medium text-amber-900">{r.record_status} · {r.review_status.replaceAll('_',' ')}</p><p className="text-slate-700">{r.assessment_summary}</p>{r.source_url&&<a className="block underline text-blue-700" href={r.source_url} target="_blank" rel="noreferrer">Read official source</a>}<p className="text-xs text-slate-500 break-all">{r.mapping_id} · {r.domestic_provision_id}</p>{r.replacement_ids&&<p>Replaced by: {r.replacement_ids}</p>}<details className="text-sm"><summary className="cursor-pointer underline">Historical classification and lineage (not current findings)</summary><p className="mt-3">Legacy score: {r.legacy_anchoring_level||'not previously scored'}; legacy gap label: {r.legacy_gap_type||'none recorded'}.</p><p>{r.legacy_assessment_summary}</p><p>{r.audit_note}</p></details></article>)}
 {!filtered.length&&<p>No records match this filter. This is not a finding of legal absence.</p>}<Link className="underline text-blue-700" to="/international">Separate international-instrument registries</Link></div>;
}
''')
put('05_webapp/src/pages/ActorsExplorer.tsx',r'''import { useMemo, useState } from 'react';
import { forceSimulation, forceManyBody, forceLink, forceX, forceY, forceCollide } from 'd3-force';
import { useJsonData, useCsvData } from '../hooks/useData';
type N={id:string;mode:'actor'|'instrument'|'obligation';label:string;full:string;degree:number;x?:number;y?:number};
type E={source:string;target:string;type:string;provision_ids:string;mapping_ids:string;source_urls:string;review_status:string};
type G={nodes:N[];edges:E[];isolated_obligations:string[];note:string};
export default function ActorsExplorer(){
 const {data:g,loading,error}=useJsonData<G>('derived/evidence_network.json');const {data:actors}=useCsvData<Record<string,string>>('mexico_health_governance_actors_clean.csv');
 const [selected,setSelected]=useState('IHR-OBL-004');const [tab,setTab]=useState('network');const [zoom,setZoom]=useState(1);
 const laid=useMemo(()=>{if(!g)return [] as N[];const ns=g.nodes.map(n=>({...n}));const es=g.edges.map(e=>({...e}));const sim=forceSimulation(ns).force('charge',forceManyBody().strength(-70)).force('link',forceLink(es).id((n:any)=>n.id).distance(60).strength(.22)).force('x',forceX<N>(n=>n.mode==='obligation'?270:n.mode==='instrument'?660:960).strength(.2)).force('y',forceY(320).strength(.045)).force('collide',forceCollide(13)).stop();for(let i=0;i<350;i++)sim.tick();const xs=ns.map(n=>n.x??0),ys=ns.map(n=>n.y??0);const minX=Math.min(...xs),minY=Math.min(...ys);const dx=Math.max(...xs)-minX||1,dy=Math.max(...ys)-minY||1;return ns.map(n=>({...n,x:60+((n.x??0)-minX)*1050/dx,y:40+((n.y??0)-minY)*560/dy}));},[g]);
 if(loading)return <p role="status">Loading source network…</p>;if(error||!g)return <p role="alert">Could not load the source network. No counts are assumed.</p>;
 const positions=Object.fromEntries(laid.map(n=>[n.id,n]));const chosen=g.nodes.find(n=>n.id===selected);const edges=g.edges.filter(e=>e.source===selected||e.target===selected);const neighbors=new Set(edges.flatMap(e=>[e.source,e.target]));
 return <div className="space-y-6"><header><h1 className="text-4xl font-bold">Source traceability network</h1><p className="text-slate-600 mt-3">{g.note}</p></header><div className="flex gap-3"><button className="border p-3 rounded-lg" onClick={()=>setTab('network')}>Network and evidence</button><button className="border p-3 rounded-lg" onClick={()=>setTab('inventory')}>Actor inventory ({actors.length})</button></div>
 {tab==='inventory'?<section className="space-y-3"><p>The inventory is broader than the source-checked role layer. Unlinked actors are not assumed to lack competence.</p>{actors.map(a=><details key={a.actor_id} className="bg-white border rounded-xl p-5"><summary className="cursor-pointer font-semibold">{a.actor_name}</summary><p className="my-3">{a.review_status.replaceAll('_',' ')}</p><p>{a.ihr_relevance}</p><p className="text-sm text-slate-500 mt-3">{a.source_norm} · {a.source_article}</p><p>{a.limitations}</p></details>)}</section>:<>
 <div className="flex flex-wrap gap-4 items-center"><label>Select a node<select aria-label="Select a network node" className="block max-w-full border rounded-lg p-3 mt-1" value={selected} onChange={e=>setSelected(e.target.value)}>{g.nodes.map(n=><option key={n.id} value={n.id}>{n.mode} · {n.label} · {n.id}</option>)}</select></label><div className="flex gap-2"><button aria-label="Zoom in" className="border rounded p-3" onClick={()=>setZoom(z=>Math.min(2,z+.2))}>+</button><button aria-label="Zoom out" className="border rounded p-3" onClick={()=>setZoom(z=>Math.max(.8,z-.2))}>−</button><button className="border rounded p-3" onClick={()=>setZoom(1)}>Fit</button></div></div>
 <p className="text-sm">{g.nodes.length} nodes · {g.edges.length} source-reference edges. Circle: obligation; square: instrument; triangle: actor. Uniform edge widths do not encode legal strength. Blue edges are explicit actor-role references; grey edges are instrument correspondences.</p>
 <div className="overflow-auto border border-slate-200 bg-white rounded-xl"><svg role="img" aria-label="Source correspondence network, with an equivalent selectable evidence list below" viewBox="0 0 1200 650" style={{width:`${zoom*100}%`,minWidth:700,height:650*zoom}}>{g.edges.map((e,i)=>{const a=positions[e.source],b=positions[e.target];if(!a||!b)return null;return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={e.type==='textual_role_reference'?'#2563eb':'#94a3b8'} strokeWidth={1.2} opacity={edges.includes(e)?.9:.18}/>;})}{laid.map(n=><g key={n.id} transform={`translate(${n.x},${n.y})`} role="button" tabIndex={0} aria-label={`${n.label} ${n.full}`} onClick={()=>setSelected(n.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(n.id);}}} style={{cursor:'pointer'}} opacity={neighbors.has(n.id)||n.id===selected?1:.65}><title>{n.id}: {n.full||n.label}. Documentary degree {n.degree}, not legal adequacy.</title>{n.mode==='obligation'?<circle r={n.id===selected?10:7} fill="#ecfdf5" stroke="#15803d" strokeWidth={n.id===selected?3:1.5}/>:n.mode==='instrument'?<rect x={-9} y={-9} width={18} height={18} fill="#eef2ff" stroke="#4338ca"/>:<path d="M0 -11 L11 9 L-11 9 Z" fill="#1e3a5f"/>}<text y={-15} textAnchor="middle" fontSize={n.mode==='obligation'?8:11} fill="#334155">{n.label.length>26?n.label.slice(0,24)+'…':n.label}</text></g>)}</svg></div>
 <section className="p-6 border border-slate-200 bg-white rounded-xl space-y-4" aria-live="polite"><h2 className="text-xl font-semibold">{chosen?.label}: {chosen?.full}</h2><p className="text-sm">{selected}. These references establish documentary associations, not observed coordination or the power to issue a law.</p>{!edges.length&&<p>No correspondence is recorded here. Further source review is needed before drawing a legal conclusion.</p>}{edges.map((e,i)=><div key={i} className="border-t pt-4 space-y-2"><p>{positions[e.source]?.full||e.source} → {positions[e.target]?.full||e.target}</p><p className="text-sm">{e.type.replaceAll('_',' ')} · {e.review_status.replaceAll('_',' ')}</p><p className="text-xs break-all">Provisions: {e.provision_ids}</p><p className="text-xs break-all">Mapping records: {e.mapping_ids||'explicit role-reference table'}</p>{e.source_urls.split(';').filter(Boolean).map(u=><a key={u} className="block underline text-blue-700 text-sm break-all" href={u} target="_blank" rel="noreferrer">Official source</a>)}</div>)}</section><p className="text-sm text-slate-600">All {g.nodes.filter(n=>n.mode==='obligation').length} selected obligations remain visible. {g.isolated_obligations.length} has no current instrument correspondence. The actor-role layer is partial: it shows only provision-backed references added or checked in this audit, not every competent institution.</p><a className="underline text-blue-700" href="/data/derived/network_edges.csv" download>Download edges with provision IDs</a>
 </>}</div>;
}
''')
app=ROOT/'05_webapp/src/App.tsx';s=app.read_text()
s="import EvidenceReview from './pages/EvidenceReview';\n"+s
# Withdraw only screens whose current output was calculated from the retired ratings.
legacy_components=['Dashboard','CountrySnapshot','GapMap','CapacityBrief','NormPipeline','NormativeHierarchy','NormDiagnostic','PoliticalBrain','ReportBuilder','ReportPrint']
for name in legacy_components:
 s=re.sub(r"import "+name+r" from '[^']+';\n",'',s);s=s.replace('<'+name+' />','<EvidenceReview />')
s=s.replace('<Route element={<Layout />}>','<Route element={<Layout />}>\n          <Route path="/audit" element={<EvidenceReview />} />')
app.write_text(s)
layout=ROOT/'05_webapp/src/Layout.tsx';s=layout.read_text();s="import AuditNotice from './components/AuditNotice';\n"+s;s=s.replace('<Outlet />','<AuditNotice /><Outlet />').replace('Mexico Pilot v0.1','Mexico Pilot 0.1.1-audit').replace("label: 'Political Brain'","label: 'Political Brain (review)' ").replace("label: 'Implementation Gap Map'","label: 'Gap classifications (review)'")
layout.write_text(s)
method=ROOT/'05_webapp/src/pages/Methodology.tsx';method.write_text(method.read_text().replace('Audit version 0.1 (stable)','Scoped source audit · 14 October 2026').replace('View full academic methodology draft','Read methodology review note'))

# Make the review status visible in the unchanged provisions explorer.
p=ROOT/'05_webapp/src/pages/ProvisionsExplorer.tsx';s=p.read_text();s=s.replace('Granular extraction of IHR-relevant provisions from the Mexican legal corpus.','Provision excerpts and candidate sources. Textual corrections are identified in the CSV; inherited extractions remain unvalidated.');p.write_text(s)

jsave(ROOT/'03_tables/review_flags/legal_audit_20261014.json',dict(version=VERSION,date=DATE,baseline_commit=BASE_SHA,corrected_existing_mapping_ids=changed,added_mapping_ids=[f'MEX_MAP_AUDIT_{o}_{k}' for o,k,p in pairs],added_provision_ids=[a[0] for a in additions],sources=SOURCES,nia=nia,independent_expert_validation=False))
jsave(BASE/'manifest.json',dict(baseline_commit=BASE_SHA,purpose='Preserve pre-correction source tables and withdrawn interpretations. Not current findings.',files={str(p.relative_to(BASE)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(BASE.rglob('*')) if p.is_file() and p.name!='manifest.json'}))

validator=r'''#!/usr/bin/env python3
from pathlib import Path
import csv,json,subprocess,sys,hashlib
ROOT=Path(__file__).resolve().parents[2]
def rows(p,sep=','):
 with open(ROOT/p,encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f,delimiter=sep))
def main():
 m=rows('03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv');p=rows('03_tables/country_legal_mapping/mexico_legal_provisions.csv');o=rows('03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv',';');a=rows('03_tables/actors/mexico_health_governance_actors.csv');refs=rows('03_tables/actors/actor_obligation_evidence.csv')
 pb={r['provision_id']:r for r in p};ob={r['obligation_id'] for r in o};ab={r['actor_id'] for r in a};active=[r for r in m if r['record_status']=='active']
 checks=[]
 def check(ok,label):
  if not ok:raise AssertionError(label)
  checks.append(label)
 check(len({r['mapping_id'] for r in m})==len(m),'unique mapping IDs');check(len(pb)==len(p),'unique provision IDs');check(len(ob)==45,'selected-obligation denominator remains 45')
 check(all(r['obligation_id'] in ob for r in m),'all obligation references resolve');check(all(r['domestic_provision_id'] in pb or r['domestic_provision_id']=='NO_MATCH_IDENTIFIED' for r in m),'all provision references resolve')
 check(all(not r['anchoring_level'] for r in m),'unvalidated numerical scores are not current');check(any(r['legacy_anchoring_level'] for r in m),'legacy classifications retained')
 r37=[r for r in active if r['obligation_id']=='IHR-OBL-037'];check(any(r['domestic_provision_id']=='MEX_PROV_RISI_ART007_AUDIT' for r in r37),'IHR Article 40 has Article 7 candidate');check(not any(r['domestic_provision_id']=='NO_MATCH_IDENTIFIED' for r in r37),'old Article 40 no-match not active')
 for oid,pid in [('IHR-OBL-002','MEX_PROV_LGS_ART133_II_AUDIT'),('IHR-OBL-034','MEX_PROV_RISI_ART031_AUDIT'),('IHR-OBL-035','MEX_PROV_RISI_ART030_AUDIT')]:check(any(r['obligation_id']==oid and r['domestic_provision_id']==pid for r in active),'candidate '+pid)
 check(all(r['actor_id'] in ab and r['provision_id'] in pb and r['obligation_id'] in ob and r['source_url'] for r in refs),'all actor-role references resolve to sources')
 check(all('5288225' in r['source_url'] for r in p if r['norm_id']=='MEX-012'),'final NOM source, not PROY')
 graph=json.loads((ROOT/'05_webapp/public/data/derived/evidence_network.json').read_text());ids={n['id'] for n in graph['nodes']}
 check({n['id'] for n in graph['nodes'] if n['mode']=='obligation'}==ob,'all obligations including isolates visible');check(all(e['source'] in ids and e['target'] in ids for e in graph['edges']),'all network endpoints resolve');check(all(e['type'] in ['documented_correspondence','textual_role_reference'] and e['provision_ids'] for e in graph['edges']),'edges carry type and provision evidence');check('MEX_ACTOR_DGE_001' in ids,'DGE displayed separately')
 check(all(not(e['source'] in ab and e['target'] in ab) for e in graph['edges']),'no invented interagency dependencies')
 nia=json.loads((ROOT/'05_webapp/public/data/derived/national_ihr_authority.json').read_text());check(nia['status']=='designation_reported' and nia['entity'] is None,'NIA reported with identity unresolved')
 d=json.loads((ROOT/'05_webapp/public/data/derived/spar_normtrace_divergence.json').read_text());check(d['divergence_latest'] is None,'SPAR subtraction withdrawn, not zero')
 for canonical,web in [('mexico_ihr2005_mapping.csv','mexico_ihr2005_mapping_clean.csv'),('mexico_legal_provisions.csv','mexico_legal_provisions_clean.csv')]:check((ROOT/'03_tables/country_legal_mapping'/canonical).read_bytes()==(ROOT/'05_webapp/public/data'/web).read_bytes(),'canonical/web synchronization '+canonical)
 check((ROOT/'99_archive/legal_audit_20261014/manifest.json').exists(),'baseline archive exists')
 out=dict(status='passed',checks=checks,count=len(checks),scope='Data integrity and audit regression, not expert legal validation')
 (ROOT/'04_outputs/reports').mkdir(parents=True,exist_ok=True);(ROOT/'04_outputs/reports/audit_validation_20261014.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out,indent=2));return 0
if __name__=='__main__':sys.exit(main())
'''
put('06_scripts/validation/validate_content.py',validator)

# Regenerate source-derived artifacts, then execute strict data regression checks.
import subprocess
for path in ['06_scripts/build_tables/build_network.py','06_scripts/build_tables/spar_normtrace_bridge.py','06_scripts/validation/validate_content.py']:
 subprocess.run(['python3',str(ROOT/path)],check=True,cwd=ROOT)
print('Scoped audit migration complete. Legal recoding and domestic NIA identification remain pending.')
