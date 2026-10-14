#!/usr/bin/env python3
"""One-time, idempotent source correction. No automatic compliance re-scoring.

The original input tables are archived byte-for-byte. Changes are logged per
record with before/after values; a source correction is not expert validation.
"""
from pathlib import Path
import csv, json, hashlib, shutil
ROOT = Path(__file__).resolve().parents[2]
DATE = '2026-10-14'
VERSION = '0.2.0-audit.20261014'
MARKER = ROOT / '00_project/legal_audit_applied.json'
ARCHIVE = ROOT / '99_archive/pre-audit-2026-10-14'
MAP = ROOT / '03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv'
PROV = MAP.with_name('mexico_legal_provisions.csv')
ACT = ROOT / '03_tables/actors/mexico_health_governance_actors.csv'
GAPS = ROOT / '04_outputs/country_profiles/mexico_implementation_gap_map.csv'
LGS = 'Ley General de Salud'
NOM = 'NOM-017-SSA2-2012, Para la vigilancia epidemiológica'
REG = 'Reglamento de la Ley General de Salud en Materia de Sanidad Internacional'
NOM_URL = 'https://dof.gob.mx/nota_detalle_popup.php?codigo=5288225'
REG_URL = 'https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LGS_MSI.pdf'
LGS_URL = 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LGS.pdf'
PAHO_URL = 'https://iris.paho.org/bitstreams/7c461167-1eae-4e58-ad9c-d8ba8338c9dc/download'
IHR_URL = 'https://apps.who.int/gb/bd/pdf_files/IHR_2014-2022-2024-en.pdf'
SPAR_URL = 'https://cdn.who.int/media/docs/default-source/health-security-preparedness/cap/spar/9789240040120-eng-new.pdf'
FIT = ['actor_fit','procedure_fit','coordination_fit','enforcement_fit','rights_safeguard_fit','federalism_fit']

def read(path):
    with path.open(encoding='utf-8-sig', newline='') as f: return list(csv.DictReader(f))

def write(path, rows):
    path.parent.mkdir(parents=True, exist_ok=True)
    fields = list(dict.fromkeys(k for r in rows for k in r))
    with path.open('w', encoding='utf-8', newline='') as f:
        w=csv.DictWriter(f, fieldnames=fields);w.writeheader();w.writerows(rows)

def main():
    if MARKER.exists():
        print('Audit already applied; current source edits preserved.');return
    for p in [MAP, PROV, ACT, GAPS]:
        out=ARCHIVE/p.relative_to(ROOT);out.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,out)
    rows,provs,actors,gaps = map(read,[MAP,PROV,ACT,GAPS])
    original={r['mapping_id']:dict(r) for r in rows}
    originals_prov={r['provision_id']:dict(r) for r in provs}
    assert len(rows)==80 and len(provs)==110, 'Unexpected baseline; reconcile instead of applying blindly.'
    byp={r['provision_id']:r for r in provs}
    for r in rows:
        for f in ['anchoring_level','gap_type','review_status',*FIT]: r['legacy_'+f]=r.get(f,'')
        r.update(audit_status='inherited_preliminary',evidence_status='not_rechecked_in_this_audit',
                 score_status='legacy_unaudited',audit_source_url='',audit_note='',dataset_version=VERSION)
        if r['review_status']=='preliminary':r['review_status']='preliminary_ai_assisted'
    def update(oid, **fields):
        r=next(x for x in rows if x['mapping_id']==oid)
        r.update(fields);r.update(audit_status='source_correction_applied',review_status='requires_human_review',
            anchoring_level='',score_status='withheld_pending_legal_review',confidence_level='not assessed')
        r['dataset_version']=VERSION
        return r
    def addprov(pid, template, **fields):
        if pid in byp: raise ValueError(f'Duplicate provision {pid}')
        r={k:'' for k in provs[0]};r.update({k:v for k,v in byp[template].items() if k in ['norm_id','norm_title','norm_type','hierarchy_level','jurisdiction','version_date']})
        r.update(fields);r.update(provision_id=pid,source_check_date=DATE,source_verification_status='text_checked_targeted_audit',
            legal_assessment_status='expert_review_pending',text_type='source_excerpt')
        provs.append(r);byp[pid]=r;return r
    # Correct the statutory basis without deleting the actual Article 134 record.
    pid133='MEX_PROV_LGS_ART133_II_AUDIT20261014'
    addprov(pid133,'MEX_PROV_LGS_ART134_001',article='Art. 133, fracción II',
        provision_text='En materia de prevención y control de enfermedades y accidentes, y sin perjuicio de lo que dispongan las leyes laborales y de seguridad social en materia de riesgos de trabajo, corresponde a la Secretaría de Salud: II. Establecer y operar el Sistema Nacional de Vigilancia Epidemiológica, de conformidad con esta Ley y las disposiciones que al efecto se expidan;',
        topic='National epidemiological surveillance system',actor_mentioned='Secretaría de Salud',
        power_granted='Establish and operate the national epidemiological surveillance system.',
        duty_created='Establish and operate SINAVE under applicable law.',
        procedure_created='Refers to this Law and implementing provisions; not a complete operational manual.',
        coordination_mechanism='Examine NOM-017 and its references.',relevance_to_ihr='Art. 5(1), domestic statutory surveillance mandate',source_url=LGS_URL)
    # Article 134 enumerates diseases; it does not create fourteen operational functions.
    for p in provs:
        if p['provision_id']=='MEX_PROV_LGS_ART134_001':
            p.update(power_granted='Health Ministry and state governments act within their respective competences.',
                duty_created='Epidemiological surveillance, prevention and control of the listed transmissible diseases.',
                procedure_created='The listed fractions identify diseases, not fourteen surveillance procedures.',
                source_check_date=DATE,source_verification_status='description_corrected',legal_assessment_status='expert_review_pending')
    update('MEX_MAP_IHR2005_002_001',domestic_provision_id=pid133,domestic_article='Art. 133, fracción II',
        assessment_summary='Article 133(II), not Article 134, assigns the Health Ministry responsibility to establish and operate SINAVE. Article 134 separately covers surveillance, prevention and control of listed diseases. These provisions must be read with NOM-017 and relevant implementing documents before assessing the whole IHR obligation.',
        gap_type='scope review pending',evidence_status='relevant_statutory_provision_identified',audit_source_url=LGS_URL,
        audit_note='AUD-LGS-133: incorrect article attribution corrected; no new compliance score assigned.')
    # Add explicit inter-level duties and referrals previously omitted from the mapping.
    pid663='MEX_PROV_NOM017_SEC663_664_AUDIT20261014'
    addprov(pid663,'MEX_PROV_NOM017_SEC661_001',article='Numerales 6.6.3–6.6.4',
        provision_text='6.6.3 Son responsables de coordinar y realizar la vigilancia epidemiológica internacional el personal de epidemiologia o equivalentes en los distintos niveles técnico-administrativos del SNS. 6.6.4 Los criterios y procedimientos de vigilancia internacional son los establecidos en el RSI y el manual de vigilancia internacional consensuados en el CONAVE a disposición del público para su consulta, en el portal electrónico de la DGE en: www.dgepi.salud.gob.mx,',
        topic='International surveillance responsibilities and incorporation by reference',actor_mentioned='Epidemiology personnel at SNS technical-administrative levels; DGE; CONAVE',
        duty_created='International epidemiological surveillance at the specified administrative levels.',
        procedure_created='Explicit reference to the IHR and international surveillance manual.',
        coordination_mechanism='Inter-level responsibilities; further manual examination required.',
        source_url=NOM_URL,relevance_to_ihr='Arts. 4–10 and Annex 1; the scope of each match requires examination.')
    pid814='MEX_PROV_NOM017_SEC814_AUDIT20261014'
    addprov(pid814,'MEX_PROV_NOM017_SEC661_001',article='Numeral 8.1.4',
        provision_text='8.1.4 La notificación inmediata de los padecimientos, condiciones, eventos o urgencia epidemiológicas emergentes o reemergentes se realiza por las unidades de vigilancia epidemiológica o sus equivalentes en cada uno de los niveles técnico-administrativos hasta la DGE antes de que transcurran 24 horas de su conocimiento por el procedimiento de notificación establecido vía telefónica, fax o medio electrónico.',
        topic='Immediate domestic notification chain',actor_mentioned='Epidemiological surveillance units or equivalents at technical-administrative levels; DGE',
        duty_created='Notify at the technical-administrative levels up to DGE, before 24 hours from knowledge.',
        procedure_created='Domestic reporting chain with telephone, fax or electronic means and a knowledge-based clock.',
        coordination_mechanism='Multi-level reporting up to DGE; final NOM wording.',
        source_url=NOM_URL,relevance_to_ihr='Domestic reporting supports Art. 6 and Annex 1; the WHO notification clock runs from assessment, not knowledge.')
    nom_oids={'IHR-OBL-001','IHR-OBL-003','IHR-OBL-004','IHR-OBL-005','IHR-OBL-007','IHR-OBL-008','IHR-OBL-009','IHR-OBL-014'}
    for r in list(rows):
        if r['obligation_id'] in nom_oids and r['gap_type'] in {'procedural gap','full gap'}:
            update(r['mapping_id'],assessment_summary='This provision forms part of the preliminary mapping for '+r['obligation_id']+'. A conclusion that procedures are absent is not supported by this provision alone: NOM-017 §§6.6.3–6.6.4 assigns inter-level duties and refers to the IHR and an international surveillance manual; §8.1.4 defines a domestic immediate-notification chain. The scope of these provisions for this specific obligation and the referred manual remain to be reviewed.',
                gap_type='reference follow-up pending',procedure_fit='review pending',coordination_fit='review pending',federalism_fit='review pending',
                evidence_status='reference_identified_target_document_pending',audit_source_url=NOM_URL,
                audit_note='AUD-NOM-017: absence claim withheld; referral and domestic procedure located. This does not establish complete implementation.')
    def addmap(oid,pid,summary,code):
        p=byp[pid];mid=f'MEX_MAP_IHR2005_{oid[-3:]}_AUDIT_{code}'
        assert not any(x['mapping_id']==mid for x in rows)
        r={k:'' for k in rows[0]};r.update(mapping_id=mid,obligation_id=oid,domestic_provision_id=pid,
            domestic_norm=p['norm_title'],domestic_article=p['article'],match_type='regulatory',
            anchoring_level='',actor_fit='source identified',procedure_fit='source identified',coordination_fit='review pending',
            enforcement_fit='review pending',rights_safeguard_fit='not assessed',federalism_fit='review pending',
            assessment_summary=summary,gap_type='reference follow-up pending',confidence_level='not assessed',
            review_status='requires_human_review',audit_status='source_added',evidence_status='reference_identified_target_document_pending',
            score_status='withheld_pending_legal_review',audit_source_url=p['source_url'],audit_note='AUD-NOM-017: supplemental correspondence, not a compliance determination.',dataset_version=VERSION)
        rows.append(r)
    for oid in ['IHR-OBL-001','IHR-OBL-004','IHR-OBL-014']:
        addmap(oid,pid663,'International surveillance responsibility is allocated across technical-administrative levels. The norm refers to the IHR and the international surveillance manual; the referred manual must be examined before evaluating complete procedures.', '663')
        addmap(oid,pid814,'NOM-017 §8.1.4 specifies a domestic chain for immediate notification up to DGE before 24 hours from knowledge. This is distinct from IHR Art. 6 notification to WHO within 24 hours of assessment. The entire international reporting obligation remains under review.', '814')
    # Article 40: locate the candidate, do not manufacture a favourable score.
    pid7='MEX_PROV_RISI_ART007_AUDIT20261014'
    addprov(pid7,'MEX_PROV_RISS2025_ART009_001',article='Art. 7o.',
        provision_text='Los servicios de sanidad internacional y los documentos respectivos que se expidan de acuerdo con la Ley, este Reglamento y demás disposiciones aplicables, serán gratuitos, a excepción de los siguientes servicios: I. Los de Desinfección, Desinsectación y Desratización, y II. Los demás que establezcan el Reglamento Sanitario Internacional, los tratados o Convenciones internacionales y la legislación fiscal aplicable.',
        topic='International health services and documentation charges',actor_mentioned='Secretaría de Salud',
        duty_created='General free-service rule, subject to the enumerated exceptions.',procedure_created='Fee exceptions refer to the IHR, international instruments and fiscal law.',
        rights_safeguard='Relevant gratuity rule; compatibility of exceptions with IHR Art. 40 not determined.',
        source_url=REG_URL,relevance_to_ihr='Candidate correspondence for Art. 40; not evidence of complete compliance.')
    update('MEX_MAP_IHR2005_037_001',domestic_provision_id=pid7,domestic_norm=REG,domestic_article='Art. 7o.',match_type='regulatory',
        assessment_summary='Article 7 provides a general gratuity rule for international health services and documents, with exceptions. A relevant domestic provision is therefore identified. Its coverage and fee exceptions must be assessed against IHR Art. 40 and fiscal provisions before assigning an anchoring or compliance conclusion.',
        gap_type='scope review pending',actor_fit='source identified',procedure_fit='review pending',coordination_fit='not directly implicated',enforcement_fit='review pending',
        rights_safeguard_fit='review pending',evidence_status='candidate_provision_identified_scope_pending',audit_source_url=REG_URL,
        audit_note='AUD-FEES-040: NO_MATCH_IDENTIFIED withdrawn. Unscored is not zero; legacy value retained in legacy_anchoring_level.')
    # Aircraft = Art.30; maritime = Art.31. Preserve the original broad Art.9 record in archive.
    declarations=[('034','31','MEX_PROV_RISI_ART031_AUDIT20261014',
        'Al arribar una embarcación al Territorio Nacional, el capitán entregará a la Secretaría la declaración marítima de sanidad en la forma establecida por el Reglamento Sanitario Internacional. El capitán de la embarcación y el médico, si lo hubiere, facilitarán los datos que les solicite la Secretaría respecto a las condiciones de sanidad a bordo durante la travesía.',
        'Ship captain; ship physician where present; Secretaría de Salud','maritime'),
       ('035','30','MEX_PROV_RISI_ART030_AUDIT20261014',
        'El comandante de la aeronave o jefe de sobrecargos a borde de un avión en tránsito internacional, al aterrizar en un aeropuerto nacional, llenará y presentará a la Secretaría un ejemplar de la declaración general de aeronave, cuya parte sanitaria contenga los informes en la forma establecida por el Reglamento Sanitario Internacional. El comandante suministrará, además, la información complementaria que requiera la Secretaría, respecto a las condiciones de sanidad a bordo durante el viaje.',
        'Aircraft commander or chief flight attendant; Secretaría de Salud','aircraft')]
    for suffix,article,pid,text,actor,kind in declarations:
        addprov(pid,'MEX_PROV_RISS2025_ART009_001',article=f'Art. {article}',provision_text=text,
            topic=f'{kind.title()} health declaration',actor_mentioned=actor,
            duty_created='Present the declaration to the Health Ministry on arrival and provide supplementary health information as requested.',
            procedure_created='Responsible submitting person, arrival trigger, receiving authority and reference to the IHR form are specified.',
            coordination_mechanism='Submission and supplementary-information duty to the Health Ministry.',source_url=REG_URL,
            relevance_to_ihr=f'Art. {37 if suffix=="034" else 38}; IHR form reference requires version and scope review.')
        update(f'MEX_MAP_IHR2005_{suffix}_001',domestic_provision_id=pid,domestic_article=f'Art. {article}',
            assessment_summary=f'Article {article} specifies who must present the {kind} health declaration to the Health Ministry on arrival and refers to the form established by the IHR. This corrects the prior omission based on Article 9 alone. Compatibility with the applicable IHR form and exceptions remains to be reviewed.',
            gap_type='update review pending',procedure_fit='source identified',actor_fit='source identified',coordination_fit='source identified',
            evidence_status='procedure_and_form_reference_identified',audit_source_url=REG_URL,
            audit_note='AUD-DECLARATIONS: responsible person, arrival trigger and form reference located; complete compliance not determined.')
    # Correct evident match-type/category errors without extrapolating legal sufficiency.
    for r in rows:
        if r['domestic_norm'].startswith('Reglamento') and r['match_type'] in {'direct statutory','indirect statutory'}:
            r['match_type']='regulatory';r['audit_note'] += ' Instrument is a regulation, not a statute.'
        if r['domestic_norm']=='Ley Aduanera' and r['match_type']=='contextual constitutional':
            r['match_type']='indirect statutory';r['audit_note']+=' Customs Law is statutory, not constitutional.'
    # International deadline correction: IHR Art.43(5) = 48 hours, not (3).
    for r in rows:
        if r['obligation_id']=='IHR-OBL-041':
            r['assessment_summary']=r['assessment_summary'].replace('48-hour reporting window under Art. 43(3)','48-hour notification window under Art. 43(5)')
    # Keep actor IDs; remove unverified equivalence of former and successor authorities.
    for a in actors:
        a['inventory_review_status']='preliminary_inventory_not_full_mandate_validation'
        if a['actor_id']=='MEX_ACTOR_INAI_001':
            a['actor_name']='INAI (historical entry; successor responsibilities require separate review)'
            a['inventory_review_status']='historical_actor_succession_review_pending'
            a['limitations']='Historical INAI entry retained for provenance. Do not equate it with Transparencia para el Pueblo or infer current powers; identify successor authorities and effective dates from the relevant provisions.'
        if a['actor_id']=='MEX_ACTOR_DGE_001':
            a['limitations'] += ' Audit 2026-10-14: DGE focal-point functions do not establish identity as National IHR Authority. PAHO CD63/INF/1 para.17 reports Mexico has confirmed designation/establishment, without naming the entity or domestic act.'
    for g in gaps:
        for k in ['current_ihr2005_anchoring_pattern','main_gap_type','ihr2024_implication','capacity_building_entry_point']:
            g['legacy_'+k]=g[k]
        g['review_status']='requires_human_review'
        g['main_gap_type']='review question; not a confirmed gap'
        g['current_ihr2005_anchoring_pattern']='This thematic summary predates the source audit. Consult the corrected obligation-level mapping and legal references before drawing a conclusion about this area.'
        g['capacity_building_entry_point']='Review the cited provisions and referred documents with the competent authorities; determine whether the issue is legal authority, procedure, coordination, resources or evidence coverage.'
        if 'National IHR' in g['area']:
            g['current_ihr2005_anchoring_pattern']='PAHO CD63/INF/1 (21 August 2026), para.17 reports that Mexico confirmed designation or establishment of a National IHR Authority by 15 July 2026. That report does not identify the Mexican entity or domestic designation instrument.'
            g['ihr2024_implication']='Locate the designation instrument and examine its mandate and relations to the existing NFP; do not presume absence or identify DGE as NIA without evidence.'
        else:g['ihr2024_implication']='Reassess against the amended IHR after reviewing the corrected sources; original implication is preserved as legacy content, not an audited finding.'
    write(MAP,rows);write(PROV,provs);write(ACT,actors);write(GAPS,gaps)
    # References are explicit research objects; a referred manual not examined is not a missing procedure.
    references=[dict(reference_id='REF-NOM-MANUAL',source_provision_id=pid663,target='Manual de vigilancia internacional consensuado en CONAVE',target_type='manual',retrieval_status='not_reviewed',source_url=NOM_URL,note='NOM-017 identifies the manual; no claim about its content or current version.'),
        dict(reference_id='REF-NOM-IHR',source_provision_id=pid663,target='International Health Regulations',target_type='international_instrument',retrieval_status='identified_scope_review_pending',source_url=IHR_URL,note='Review applicable version and the scope of incorporation by reference.'),
        dict(reference_id='REF-AIR-FORM',source_provision_id=declarations[1][2],target='IHR aircraft health declaration form',target_type='international_form',retrieval_status='identified_scope_review_pending',source_url=IHR_URL,note='Domestic provision specifies the form by reference; verify current-form compatibility.'),
        dict(reference_id='REF-SHIP-FORM',source_provision_id=declarations[0][2],target='IHR maritime health declaration form',target_type='international_form',retrieval_status='identified_scope_review_pending',source_url=IHR_URL,note='Domestic provision specifies the form by reference; verify current-form compatibility.')]
    write(ROOT/'03_tables/country_legal_mapping/mexico_legal_references.csv',references)
    relations=[dict(relation_id='REL-NOM-NOTIFICATION',source_actor='Epidemiological surveillance units or equivalents at technical-administrative levels',target_actor='DGE, within the multi-level reporting process',relationship_type='domestic_reporting_chain',action='Immediate notification before 24 hours from knowledge; telephone, fax or electronic means',source_provision_id=pid814,source_url=NOM_URL,source_locator='NOM-017 §8.1.4',evidence_status='explicit_legal_text_not_observed_exchange',scope_note='Do not draw a direct state-to-WHO edge. Intermediary levels and the knowledge-based domestic clock are retained.'),
        dict(relation_id='REL-REG-PORTLIST',source_actor='Secretaría de Salud',target_actor='Secretaría de Relaciones Exteriores',relationship_type='information_provision',action='Provide lists of international surveillance airports, seaports and border posts for communication to other nations',source_provision_id='MEX_PROV_RISS2025_ART010_001',source_url=REG_URL,source_locator='RLGS Sanidad Internacional Art.10',evidence_status='explicit_legal_text_not_observed_exchange',scope_note='A documented legal information duty; not proof of actual exchange or instrument-issuing power.')]
    for suffix,article,pid,_,actor,kind in declarations:
        relations.append(dict(relation_id='REL-REG-DECL-'+suffix,source_actor=actor.split(';')[0],target_actor='Secretaría de Salud',relationship_type='declaration_submission',action=f'Submit {kind} health declaration on arrival; provide requested supplementary health information',source_provision_id=pid,source_url=REG_URL,source_locator='RLGS Sanidad Internacional Art.'+article,evidence_status='explicit_legal_text_not_observed_exchange',scope_note='Legal duty under the cited domestic provision; not an empirical observation.'))
    write(ROOT/'03_tables/actors/mexico_institutional_relations.csv',relations)
    audit=[]
    for r in rows:
        before=original.get(r['mapping_id']);changes={k:{'before':before.get(k) if before else None,'after':v} for k,v in r.items() if (not before or before.get(k)!=v) and not k.startswith('legacy_')}
        if r['audit_status']!='inherited_preliminary' or any(k in changes for k in ['match_type','assessment_summary']):
            audit.append(dict(record_id=r['mapping_id'],obligation_id=r['obligation_id'],changes=changes))
    data=dict(audit_id=VERSION,applied_date=DATE,baseline_mapping_sha256=hashlib.sha256((ARCHIVE/MAP.relative_to(ROOT)).read_bytes()).hexdigest(),
        corrected_mapping_records=len(audit),added_provisions=len(provs)-110,
        legal_validation='not_completed',scope='Targeted correction of source descriptions, references and unsupported public claims; not full legal validation.',
        changes=audit,nia_status=dict(status='designation_or_establishment_reported',reported_as_of='2026-07-15',report_date='2026-08-21',source=PAHO_URL,locator='CD63/INF/1 paragraph 17',authority_name=None,domestic_instrument=None,interpretation='PAHO report confirms designation/establishment; identity, mandate and domestic act remain to be located.'),
        retired_claims=['18 obligations with confirmed procedural/coordination gaps','7 confirmed federal-state gaps','2 complete legal pathways','6 instruments lacking safeguards','SPAR minus NormTrace as a preparedness divergence'],
        sources=[dict(id='NOM-017',url=NOM_URL,locators='6.6.3, 6.6.4, 8.1.4'),dict(id='LGS',url=LGS_URL,locators='133(II), 134'),dict(id='RLGS-SI',url=REG_URL,locators='7, 10, 30, 31'),dict(id='PAHO-NIA',url=PAHO_URL,locators='paragraph 17'),dict(id='SPAR-2021',url=SPAR_URL,locators='C1.1, C2.1'),dict(id='IHR',url=IHR_URL,locators='4, 6, 37, 38, 40')])
    MARKER.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    (ARCHIVE/'README.md').write_text('# Superseded pre-audit source\n\nThese original tables are retained unchanged for provenance. They are not current assessments. See 00_project/legal_audit_applied.json for corrections and remaining legal-review questions.\n')
    print(f'Applied {VERSION}: {len(rows)} mappings; {len(provs)} provisions; {len(audit)} added/corrected mapping records. No compliance scores fabricated.')

if __name__=='__main__':main()
