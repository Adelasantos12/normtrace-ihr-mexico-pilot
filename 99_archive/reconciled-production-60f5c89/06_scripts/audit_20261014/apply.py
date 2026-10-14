#!/usr/bin/env python3
"""Apply the scoped 14 October 2026 audit. Source corrections are not expert validation.

Original files are retained in 99_archive/audit_20261014. This migration is
idempotent and refuses an unexpected mapping baseline. Run the normal network
and SPAR builders afterwards, followed by validate_content.py.
"""
from pathlib import Path
from collections import defaultdict
import csv, json, re, shutil, hashlib, subprocess

ROOT = Path(__file__).resolve().parents[2]
DATE = '2026-10-14'
VERSION = '0.1-audit.20261014'
ARCHIVE = ROOT / '99_archive/audit_20261014'
WEB = '05_webapp/public/data/'
MAP = '03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv'
PROV = '03_tables/country_legal_mapping/mexico_legal_provisions.csv'
ACTORS = '03_tables/actors/mexico_health_governance_actors.csv'
MARKER = ROOT / '00_project/audit_20261014.json'
SOURCES = {
 'nom': 'https://dof.gob.mx/nota_detalle_popup.php?codigo=5288225',
 'lgs': 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LGS.pdf',
 'risi': 'https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LGS_MSI.pdf',
 'paho': 'https://iris.paho.org/bitstreams/7c461167-1eae-4e58-ad9c-d8ba8338c9dc/download',
 'spar': 'https://cdn.who.int/media/docs/default-source/health-security-preparedness/cap/spar/9789240040120-eng-new.pdf',
 'spar2026': 'https://apps.who.int/gb/mspi/pdf_files/2026/09/Item1_30-09.pdf',
 'ihr': 'https://apps.who.int/gb/bd/pdf_files/IHR_2014-2022-2024-en.pdf'
}

def read(path):
 with (ROOT/path).open(encoding='utf-8-sig', newline='') as f:
  reader=csv.DictReader(f); return list(reader), list(reader.fieldnames)

def preserve(path):
 p=ROOT/path
 if p.exists():
  dest=ARCHIVE/path
  if not dest.exists():
   dest.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(p,dest)

def write(path,text):
 preserve(path); p=ROOT/path; p.parent.mkdir(parents=True,exist_ok=True)
 p.write_text(text,encoding='utf-8')

def writecsv(path,rows,fields):
 preserve(path); p=ROOT/path; p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('w',encoding='utf-8',newline='') as f:
  w=csv.DictWriter(f,fieldnames=fields,quoting=csv.QUOTE_ALL,lineterminator='\n')
  w.writeheader(); w.writerows(rows)

def edit(path,old,new):
 s=(ROOT/path).read_text(); assert old in s, (path,old[:100])
 write(path,s.replace(old,new))

def main():
 if MARKER.exists():
  print('Audit migration already applied; rebuild derived files and run validation.'); return
 mapping,mfields=read(MAP); provisions,pfields=read(PROV); actors,afields=read(ACTORS)
 assert len(mapping)==80, 'Unexpected mapping baseline; reconcile before applying this migration.'
 before={r['mapping_id']:dict(r) for r in mapping}
 for key in ['evidence_status','audit_date','audit_sources']:
  if key not in mfields: mfields.append(key)
 for r in mapping:
  r.update(evidence_status='legacy_preliminary_not_revalidated',audit_date='',audit_sources='')
 byid={r['provision_id']:r for r in provisions}
 changes=[]
 def corrected(r,summary,source):
  r.update(assessment_summary=summary,gap_type='review pending',review_status='source_corrected_review_pending',
    evidence_status='source_located_scope_review_pending',audit_date=DATE,audit_sources=source,
    reviewer_notes='Documentary correction from audit 2026-10-14. Not an independent expert validation; legal sufficiency remains to be reviewed.')
 def addprov(pid,template,article,summary,source):
  assert pid not in byid, pid
  r={k:'' for k in pfields}; t=byid[template]
  for k in ['norm_id','norm_title','norm_type','hierarchy_level','jurisdiction']: r[k]=t[k]
  r.update(provision_id=pid,article=article,provision_text='[Source summary, not a quotation] '+summary,
    topic='Audit 2026-10-14: source correction',relevance_to_ihr=summary,source_url=source,
    version_date=t.get('version_date',''))
  provisions.append(r); byid[pid]=r; return r
 def addmap(oid,pid,summary,source):
  r={k:'' for k in mfields}; p=byid[pid]
  r.update(mapping_id='MEX_AUDIT_20261014_'+oid[-3:]+'_'+pid,obligation_id=oid,domestic_provision_id=pid,
   domestic_norm=p['norm_title'],domestic_article=p['article'],match_type='regulatory',anchoring_level='2',
   actor_fit='strong',procedure_fit='partial',coordination_fit='partial',enforcement_fit='not directly implicated',
   rights_safeguard_fit='not directly implicated',federalism_fit='partial',confidence_level='medium')
  corrected(r,summary,source); mapping.append(r)
 # LGS 133 II establishes SINAVE. Article 134 enumerates diseases, not fourteen surveillance functions.
 lgs_desc='LGS Article 133, section II assigns the Ministry of Health responsibility for establishing and operating SINAVE under the Law and implementing provisions.'
 addprov('MEX_AUDIT_LGS_133_II','MEX_PROV_LGS_ART134_001','Art. 133, fracción II',lgs_desc,SOURCES['lgs'])
 p=byid['MEX_PROV_LGS_ART134_001']
 p['provision_text']='[Source summary, not a quotation] Article 134 requires the Ministry of Health and state governments, within their competences, to conduct surveillance, prevention and control of the communicable diseases enumerated in its sections.'
 p['relevance_to_ihr']='Disease surveillance and distributed health functions; the express SINAVE establishment power is in Article 133 II.'
 for key in ['power_granted','duty_created','procedure_created','coordination_mechanism']:
  p[key]='Review against Article 134 disease list and Article 133 II; no separate finding of a missing procedure from this provision alone.'
 p['source_url']=SOURCES['lgs']
 for r in mapping:
  if r['domestic_provision_id']=='MEX_PROV_LGS_ART134_001':
   corrected(r,'Article 134 concerns surveillance, prevention and control of listed communicable diseases. Read with Article 133 II and NOM-017; this provision alone does not establish absence of IHR procedures.',SOURCES['lgs'])
  if r['mapping_id']=='MEX_MAP_IHR2005_002_001':
   r.update(domestic_provision_id='MEX_AUDIT_LGS_133_II',domestic_article='Art. 133, fracción II',match_type='direct statutory')
   corrected(r,lgs_desc+' The full scope of IHR Article 5 also requires review of the technical standard and its referenced documents.',SOURCES['lgs'])
 # Use the final NOM, not the 2012 project URL mistakenly linked in the initial audit.
 nom_base='MEX_PROV_NOM017_SEC661_001'
 desc663='NOM-017 section 6.6.3 assigns international epidemiological surveillance coordination and performance to epidemiology personnel or equivalents at the different technical-administrative levels of the National Health System.'
 desc664='NOM-017 section 6.6.4 refers to the IHR and the international surveillance manual agreed through CONAVE for criteria and procedures. The referenced manual needs separate review; a reference is not an absent procedure.'
 desc814='The final NOM-017 section 8.1.4 requires epidemiological surveillance units or equivalents at the different technical-administrative levels to notify the DGE before 24 hours from knowledge of the event, by telephone, fax or electronic means. This is not the IHR Article 6 deadline measured from assessment.'
 for suffix,article,desc in [('663','Numeral 6.6.3',desc663),('664','Numeral 6.6.4',desc664),('814','Numeral 8.1.4',desc814)]:
  addprov('MEX_AUDIT_NOM017_'+suffix,nom_base,article,desc,SOURCES['nom'])
 for r in mapping:
  if r['domestic_provision_id']==nom_base or r['obligation_id']=='IHR-OBL-001':
   corrected(r,'The DGE focal-point role is identified. Its full procedure and coordination assessment must also consider NOM-017 sections 6.6.3, 6.6.4 and 8.1.4. The referenced manual and operational arrangements are not evaluated here.',SOURCES['nom'])
 for oid,suffix,desc in [('001','664',desc664),('004','814',desc814),('004','664',desc664),('012','814',desc814),('013','663',desc663),('014','814',desc814),('014','664',desc664)]:
  addmap('IHR-OBL-'+oid,'MEX_AUDIT_NOM017_'+suffix,desc,SOURCES['nom'])
 for p in provisions:
  if 'NOM-017' in p.get('norm_title',''): p['source_url']=SOURCES['nom']
 # RLGS-SI article 7 is a candidate source, with exceptions that still need legal review.
 risi_base='MEX_PROV_RISS2025_ART009_001'
 fee='Article 7 of the International Health Regulation establishes free international health services and documents, with exceptions for specified services and other applicable provisions. These exceptions and scope must be compared with IHR Article 40; no full-compliance conclusion follows.'
 air='Article 30 requires the aircraft commander or chief cabin attendant to present the general declaration on landing at a national airport, including health information in the IHR form, and provide additional information requested by the health authority.'
 sea='Article 31 requires the ship captain to submit the maritime declaration of health on arrival in national territory in the form established by the IHR; the captain and any ship doctor must provide information requested by the health authority.'
 for num,desc in [('007',fee),('030',air),('031',sea)]:
  addprov('MEX_AUDIT_RISI_'+num,risi_base,'Art. '+str(int(num)),desc,SOURCES['risi'])
 for r in mapping:
  pid={'MEX_MAP_IHR2005_037_001':'007','MEX_MAP_IHR2005_034_001':'031','MEX_MAP_IHR2005_035_001':'030'}.get(r['mapping_id'])
  if pid:
   p=byid['MEX_AUDIT_RISI_'+pid]
   r.update(domestic_provision_id=p['provision_id'],domestic_norm=p['norm_title'],domestic_article=p['article'],
    match_type='regulatory',anchoring_level='2',actor_fit='partial',procedure_fit='partial',
    coordination_fit='not directly implicated',federalism_fit='not directly implicated',confidence_level='medium')
   corrected(r,p['provision_text'].replace('[Source summary, not a quotation] ',''),SOURCES['risi'])
 # Correct instrument classification separately from strength of legal fit.
 for r in mapping:
  if r['domestic_norm'].startswith('Reglamento') and 'statutory' in r['match_type']:
   r['match_type']='regulatory'
  if r['domestic_norm']=='Ley Aduanera' and r['match_type']=='contextual constitutional':
   r['match_type']='indirect statutory'
  if r['gap_type']=='rights safeguard gap':
   r['reviewer_notes']=(r['reviewer_notes']+' Audit 2026-10-14: this is a provisional record-level safeguard flag, not proof that safeguards are absent from Mexican law or newly required only in 2024. Review the wider framework and instrument versions.').strip()
 # Explicit aliases avoid truncated-name collisions and restore the DGE overlay.
 if 'source_instrument_ids' not in afields: afields.append('source_instrument_ids')
 if 'profile_review_status' not in afields: afields.append('profile_review_status')
 patterns=[('RLGS-SI',r'Sanidad Internacional'),('RLGS-Inv',r'Investigaci[oó]n para la Salud'),
  ('RI-SS-2025',r'Reglamento Interior.*(?:2025|MEX-017)'),('NOM-017',r'NOM-017'),
  ('LGPDPPSO',r'Protecci[oó]n de Datos|LGPDPPSO'),('LOAPF',r'Ley Org[aá]nica de la Administraci[oó]n P[uú]blica Federal|LOAPF'),
  ('CPEUM',r'Constituci[oó]n Pol[ií]tica|CPEUM'),('Ley Aduanera',r'Ley Aduanera'),('LGS',r'Ley General de Salud|\bLGS\b')]
 for a in actors:
  refs=set()
  for part in a['source_norm'].split(';'):
   for alias,pattern in patterns:
    if re.search(pattern,part,re.I): refs.add(alias); break
  a['source_instrument_ids']=';'.join(sorted(refs)); a['profile_review_status']='preliminary_profile_not_revalidated'
  if 'DGE' in a['actor_id']:
   a['limitations']+=' PAHO CD63/INF/1 paragraph 17 reports Mexico has confirmed a National IHR Authority; its institution and designation instrument are not identified by that report. Do not infer that the DGE is the new Authority.'
  if 'INAI' in a['actor_name']:
   a['profile_review_status']='historical_institutional_identifier_requires_version_review'
 writecsv(MAP,mapping,mfields); writecsv(PROV,provisions,pfields); writecsv(ACTORS,actors,afields)
 for source,dest in [(MAP,'mexico_ihr2005_mapping_clean.csv'),(PROV,'mexico_legal_provisions_clean.csv'),(ACTORS,'mexico_health_governance_actors_clean.csv')]:
  write(WEB+dest,(ROOT/source).read_text())
 for r in mapping:
  old=before.get(r['mapping_id'])
  if old!= {k:r.get(k,'') for k in (old or {}).keys()} or old is None:
   changes.append({'mapping_id':r['mapping_id'],'obligation_id':r['obligation_id'],'before':old,'after':r})
 # Reproducible current counts, with explicit units. Do not manufacture pathway or compliance counts.
 groups=defaultdict(list)
 for r in mapping: groups[r['obligation_id']].append(r)
 flags=defaultdict(set)
 for r in mapping:
  if r['gap_type'] not in ('none','review pending',''): flags[r['gap_type']].add(r['obligation_id'])
 summary={'version':VERSION,'audit_date':DATE,'status':'Source corrections applied; expert validation pending',
  'counts':{'obligations':len(groups),'instruments':len(read('03_tables/country_legal_mapping/mexico_normative_corpus_index.csv')[0]),
    'provisions':len(provisions),'mapping_rows':len(mapping),'actors':len(actors)},
  'pending_scope_obligations':sorted({r['obligation_id'] for r in mapping if r['gap_type']=='review pending'}),
  'no_source_match_in_current_corpus':[o for o,rs in sorted(groups.items()) if all(not r['domestic_norm'] for r in rs)],
  'provisional_flags':{k:{'count':len(v),'obligation_ids':sorted(v)} for k,v in sorted(flags.items())},
  'aggregation_note':'Flags count distinct obligation IDs with at least one unrevalidated row carrying that code. Categories overlap. Pending source corrections are not counted as confirmed gaps. A no-match result is corpus-bounded, not legal absence.',
  'complete_pathway_count':None,'complete_pathway_note':'Withdrawn: two rows coded none did not establish two complete obligation-level pathways.',
  'legacy_code_mean':round(sum(max(int(r['anchoring_level'] or 0) for r in rs) for rs in groups.values())/len(groups),4),
  'score_note':'Descriptive mean of strongest provisional row code per obligation. No legal-compliance or capacity interpretation; corrected source matches still require scope review.',
  'national_ihr_authority':{'status':'designation_or_establishment_reported_by_PAHO','reported_as_of':'2026-07-15','report_date':'2026-08-21','paragraph':17,'institution':None,'domestic_instrument':None,'source':SOURCES['paho']},
  'sources':SOURCES,'changes':changes}
 summary['mapping_sha256']=hashlib.sha256((ROOT/MAP).read_bytes()).hexdigest()
 write('00_project/audit_20261014.json',json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
 write(WEB+'derived/audit_20261014.json',json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
 # One legally described notification path; do not manufacture an actor-to-actor coordination network.
 relations=[{'relation_id':'NOM017_814_notification_path','source_role':'Epidemiological surveillance units or equivalents at the technical-administrative levels of SNS','target_actor_id':'MEX_ACTOR_DGE_001','relation_type':'legally_described_notification_path','required_input':'Immediate epidemiological notification','deadline':'Before 24 hours from knowledge of the event','source_provision':'NOM-017-SSA2-2012, 8.1.4','source_url':SOURCES['nom'],'scope_note':'A path across administrative levels, not evidence that every unit communicates directly with DGE. Does not establish observed exchanges or the separate IHR Article 6 assessment deadline.'}]
 writecsv('03_tables/actors/legally_described_relationships.csv',relations,list(relations[0]))
 writecsv(WEB+'derived/legally_described_relationships.csv',relations,list(relations[0]))
 # Patch network construction, preserving the existing layout and metrics contract.
 path='06_scripts/build_tables/build_network.py'
 text=(ROOT/path).read_text()
 old='for full, short in INSTRUMENT_ALIASES.items():\n            if full[:30] in src and short in inst_nodes:'
 assert old in text
 text=text.replace(old,'for short in a.get("source_instrument_ids", "").split(";"):\n            if short in inst_nodes:')
 text=text.replace('bipartite.weighted_projected_graph(B, obl_nodes)','bipartite.weighted_projected_graph(B, sorted(obl_nodes))')
 text=text.replace('for i, o in B.edges()]','for i in sorted(inst_nodes) for o in sorted(B.neighbors(i))]')
 text=text.replace('"centralisation significantly ABOVE random"','"corpus incidence differs from a uniform fixed-density random graph; not a test of operational risk"')
 text=text.replace('Actor overlay: actor x instrument, from the actors\ntable (source_norm).','Actor overlay: actor x instrument, from explicit source_instrument_ids in the actors\ntable. These are competence-source associations, not issuance powers or observed dependencies.')
 write(path,text)
 # Withdraw numerical SPAR subtraction at the generating source, not just in the UI.
 path='06_scripts/build_tables/spar_normtrace_bridge.py'; text=(ROOT/path).read_text()
 text=re.sub(r'"divergence_latest": round\([^\n]+', '"divergence_latest": None,',text)
 text=re.sub(r'"divergence_mean": round\([^\n]+', '"divergence_mean": None,',text)
 insertion='''    result['primary_comparison'] = 'not_comparable'
    result['comparison_rationale'] = 'No validated common construct, denominator or item-level crosswalk. Subtraction withdrawn.'
    result['scope_note'] = 'SPAR C1.1 already asks for national and subnational legal mapping; C2.1 addresses focal-point mandate and functioning. NormTrace organizes obligation-level documentary evidence.'
    result['thesis'] = 'A published score does not substitute for inspectable legal sources.'
    result['caveats'] = ['SPAR and NormTrace are not equivalent measurements. No divergence or overstatement is inferred.', 'The SPAR instrument changed across reporting editions; the historical series is not measurement-invariant.', 'NormTrace source corrections remain subject to legal scope review.']
    result['headline_cc1']['normtrace_legal_anchoring_pct'] = None
    result['normtrace_corpus_anchoring_pct'] = None
'''
 assert '    for folder in (OUT_EXP, OUT_WEB):' in text
 text=text.replace('    for folder in (OUT_EXP, OUT_WEB):',insertion+'    for folder in (OUT_EXP, OUT_WEB):')
 # Remove old console claims and the old module-level thesis.
 start=text.find('    print(',text.find('json.dump(result'))
 end=text.find('\n\nif __name__',start)
 if start!=-1 and end!=-1: text=text[:start]+'    print("SPAR context rebuilt; non-equivalent score subtraction disabled.")\n'+text[end:]
 text=re.sub(r'""".*?"""','"""Build SPAR historical context. Numerical subtraction from NormTrace is withdrawn by the 2026-10-14 audit."""',text,count=1,flags=re.S)
 write(path,text)
 # All current visible counts derive from the audit manifest or current CSVs.
 path='05_webapp/src/pages/LandingPage.tsx'; text=(ROOT/path).read_text()
 text=text.replace("  const cc1 = spar?.headline_cc1;","  const cc1 = spar?.headline_cc1;\n  const { data: audit } = useJsonData<any>('derived/audit_20261014.json');")
 start=text.index('  const KPI_STATS = ['); end=text.index('\n  ];',start)+5
 text=text[:start]+'''  const KPI_STATS = [
    { label: 'Selected IHR obligations', value: String(audit?.counts.obligations ?? '…'), icon: Shield, color: '#10b981', sub: 'IHR 2005 pilot registry; not all obligations of every instrument' },
    { label: 'Federal instruments in corpus', value: String(audit?.counts.instruments ?? '…'), icon: Layers, color: '#0ea5e9', sub: 'Source corpus, not the smaller connected network' },
    { label: 'Obligation–provision records', value: String(audit?.counts.mapping_rows ?? '…'), icon: Activity, color: '#0ea5e9', sub: 'Source corrections applied; legal review remains pending' },
  ];'''+text[end:]
 text=text.replace('Legal capacity, reported<br />','Following IHR obligations<br />').replace('vs. legal capacity, anchored','through domestic law')
 text=re.sub(r'NormTrace-IHR traces every IHR.*?</p>',"NormTrace links selected IHR obligations to domestic provisions and institutional responsibilities. SPAR already asks countries to review their legal frameworks. This pilot makes the documentary correspondences available for inspection. It is not a second capacity score, and it does not measure actual coordination.</p>",text,count=1,flags=re.S)
 text=re.sub(r'IHR obligations do not self-execute\..*?</p>',"Each obligation must be examined in the context of the domestic legal system. Relevant evidence can include constitutional provisions, statutes, regulations, technical standards and documents incorporated by reference. These are analytical layers, not a mandatory sequence of six new legal instruments.</p>",text,count=1,flags=re.S)
 text=re.sub(r'The IHR Monitoring and Evaluation Framework \(SPAR, JEE\).*?</p>',"SPAR C1.1 includes national and subnational legal mapping. C2.1 examines the focal point and its mandate. NormTrace complements this work by organizing sources around individual obligations.</p>",text,count=1,flags=re.S)
 text=re.sub(r'Even when SPAR and JEE agree,.*?</p>',"The published score alone does not allow a reader to inspect every supporting provision. Legal and administrative arrangements must be assessed on their content and authority; IHR Article 4 does not universally require designation through a statute.</p>",text,count=1,flags=re.S)
 text=text.replace('45 obligations × 110 domestic provisions: anchoring scale, six fit dimensions, gap typology, IHR 2024 update pressure','Obligation-level records, cited provisions, provisional coding and documented review status')
 text=text.replace('where obligations are formally present but operationally blocked','where documentary relationships require further examination')
 text=text.replace('Pass, with findings','Source corrections applied; expert validation pending')
 text=text.replace('110 domestic provisions','the indexed domestic provisions')
 text=text.replace('19 gap areas classified by type, responsible actor, update pressure, and capacity-building entry points for reform','Legacy synthesis retained for review; current source corrections are documented in the audit')
 text=text.replace("import { PreliminaryBanner }", "import AuditNotice from '../components/AuditNotice';\nimport { PreliminaryBanner }")
 text=text.replace('<PreliminaryBanner />','<PreliminaryBanner /><AuditNotice />')
 write(path,text)
 # Correct the network's semantics and visibly separate legacy exploratory tabs.
 path='05_webapp/src/pages/ActorsExplorer.tsx'; text=(ROOT/path).read_text()
 text=text.replace('institutional actors that can issue those instruments','actors whose profiles cite those instruments')
 text=text.replace('actors that can issue those instruments','actors with documented source references to those instruments')
 text=text.replace('Reachable actors','Actors associated through cited instruments')
 text=text.replace('actor obligation-reach','actor corpus-association reach')
 text=text.replace('Actors &amp; CAS Topology','Legal-source associations')
 text=text.replace("{ id: 'topology', label: 'CAS Topology'","{ id: 'topology', label: 'CAS Topology (legacy, unvalidated)'")
 text=text.replace("interpretation: 'Highest actor obligation-reach in the corpus. Central to virtually all IHR implementation pathways; reform of the IHR legal architecture must run through it. Resilience depends on its institutional continuity.'","interpretation: 'Reach counts obligations associated through instruments cited in the actor profile. It does not establish competence over every linked obligation or operational centrality.'")
 text=text.replace("interpretation: 'Primary IHR regulatory instrument despite predating IHR 2005 by 20 years. Its age and regulatory (sub-statutory) rank make it a fragile, reform-critical hub.'","interpretation: 'This regulation supports multiple documentary correspondences. Age and regulatory rank alone do not demonstrate insufficiency; content, statutory authority and subsequent references require examination.'")
 text=text.replace('not observed coordination or political authority.','not observed coordination or political authority. An actor–instrument association is not an issuance power, and a shared instrument does not establish a directed dependency. See the audit for the separately sourced notification-path record.')
 text=text.replace('      <header className="space-y-2">','      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-4">The computed view represents legal-source associations. It does not measure information exchange, institutional performance or reform power. Curated and CAS tabs are archived exploratory interpretations, not validated findings.</p>\n      <header className="space-y-2">',1)
 write(path,text)
 # New focused pages and reusable current-version notice.
 write('05_webapp/src/components/AuditNotice.tsx',NOTICE)
 write('05_webapp/src/pages/AuditReview.tsx',AUDIT_PAGE)
 write('05_webapp/src/pages/SparBridge.tsx',SPAR_PAGE)
 path='05_webapp/src/App.tsx'; text=(ROOT/path).read_text()
 text="import AuditReview, { ReviewGate } from './pages/AuditReview';\n"+text
 text=text.replace('<Route path="/dashboard"','<Route path="/audit" element={<AuditReview />} />\n          <Route path="/dashboard"',1)
 for component in ['NormPipeline','NormDiagnostic','PoliticalBrain','GapMap','CapacityBrief']:
  text=text.replace('element={<'+component+' />}','element={<ReviewGate><'+component+' /></ReviewGate>}')
 write(path,text)
 path='05_webapp/src/Layout.tsx'; text=(ROOT/path).read_text()
 text="import AuditNotice from './components/AuditNotice';\n"+text
 text=text.replace('<Outlet />','<AuditNotice /><Outlet />'); write(path,text)
 path='05_webapp/src/lib/utils.ts'; text=(ROOT/path).read_text()
 text=text.replace("'superseded': 'Superseded'","'superseded': 'Superseded',\n    'source_corrected_review_pending': 'Source corrected · scope review pending'")
 text=text.replace("'3': 'Partial statutory anchoring'","'3': 'Partial statutory or regulatory fit'")
 write(path,text)
 c=summary['counts']
 doc=METHOD.format(version=VERSION,obligations=c['obligations'],instruments=c['instruments'],provisions=c['provisions'],rows=c['mapping_rows'],actors=c['actors'],**SOURCES)
 for path in ['00_project/normtrace_ihr_methodology_full.md',WEB+'markdown/normtrace_ihr_methodology_web.md',WEB+'markdown/normtrace_ihr_methodology_full.md']:
  write(path,doc)
 for path in [WEB+'markdown/mexico_legal_internalisation_snapshot.md',WEB+'markdown/mexico_capacity_building_entry_points.md']:
  write(path,doc+'\n## Current record-level corrections\n\nConsult /audit and the machine-readable audit manifest for before/after records. Previous narrative conclusions are archived, not current findings.\n')
 path='05_webapp/src/pages/Methodology.tsx'; text=(ROOT/path).read_text().replace('Audit version 0.1 (stable)','Source-audited revision · expert validation pending'); write(path,text)
 # Replace the brittle fixed-count gate with data-derived referential and audit assertions.
 preserve('06_scripts/validation/validate_content.py'); write('06_scripts/validation/validate_content.py',VALIDATION)
 write('00_project/AUDIT_20261014.md',doc+'\n## Change log\n\nThe JSON manifest stores original and corrected mapping records. Complete-pathway counts and SPAR subtraction were withdrawn. Original files remain under 99_archive/audit_20261014 and in Git history. No independent expert validation or empirical coordination assessment is claimed. The audit initially linked a draft NOM; this correction uses the final NOM (DOF code 5288225), whose section 8.1.4 wording is not identical to the draft.\n')
 print(json.dumps({'version':VERSION,'counts':c,'changed_records':len(changes),'pending':summary['pending_scope_obligations']},ensure_ascii=False))

NOTICE='''import { Link } from 'react-router-dom';
export default function AuditNotice() {
 return <aside className="my-4 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-950 text-sm" aria-label="Audit status">
 <strong>Source-audited revision · 14 October 2026.</strong> Documentary errors were corrected; legal sufficiency and expert validation remain pending. SPAR subtraction and complete-pathway claims are withdrawn. <Link to="/audit" className="underline font-semibold">Review changes and sources</Link>.
 </aside>;
}
'''
AUDIT_PAGE='''import type { ReactNode } from 'react';
import { useJsonData } from '../hooks/useData';
export default function AuditReview() {
 const { data, loading, error } = useJsonData<any>('derived/audit_20261014.json');
 if (loading) return <p role="status">Loading audit records…</p>;
 if (error || !data) return <p role="alert">Audit records could not be loaded. Do not use previous counts as current findings.</p>;
 return <article className="space-y-6 pb-12">
 <header><h1 className="text-3xl font-bold">Source corrections and review status</h1><p className="mt-3">{data.version} · {data.status}</p></header>
 <div className="grid grid-cols-2 md:grid-cols-5 gap-3">{Object.entries(data.counts).map(([k,v])=><div className="p-4 border rounded-xl bg-white" key={k}><strong className="text-2xl">{String(v)}</strong><p>{k.replaceAll('_',' ')}</p></div>)}</div>
 <p>{data.aggregation_note}</p><p>{data.complete_pathway_note}</p>
 <section className="space-y-2"><h2 className="text-xl font-semibold">National IHR Authority</h2><p>PAHO reports that Mexico had confirmed designation or establishment by 15 July 2026 (CD63/INF/1, paragraph 17). This report does not identify the institution or domestic designation instrument. The DGE focal-point function must not be equated with this new role without the corresponding source.</p><a className="underline" href={data.sources.paho}>PAHO report, 21 August 2026</a></section>
 <section className="space-y-2"><h2 className="text-xl font-semibold">Legal-source network</h2><p>Edges connect obligations to instruments and actor profiles to their cited sources. Sharing an instrument does not prove a directed dependency, a power to issue the instrument, or an observed exchange. The DGE is included through explicit NOM-017 and Interior Regulation source aliases. Obligations without a source match remain visible as isolated nodes.</p><a className="underline" href="/data/derived/legally_described_relationships.csv" download>Download the separately sourced notification-path record</a></section>
 <section><h2 className="text-xl font-semibold">Current provisional flags</h2><p>These overlapping categories describe unrevalidated record-level codes, not confirmed legal gaps.</p><div className="overflow-x-auto"><table className="w-full mt-3 text-sm"><thead><tr><th className="text-left">Code</th><th>Distinct obligations</th><th className="text-left">Identifiers</th></tr></thead><tbody>{Object.entries(data.provisional_flags).map(([k,v]:[string,any])=><tr className="border-t" key={k}><td className="py-2">{k}</td><td className="text-center">{v.count}</td><td className="py-2 break-words">{v.obligation_ids.join(', ')}</td></tr>)}</tbody></table></div></section>
 <section><h2 className="text-xl font-semibold">Source corrections</h2>{data.changes.map((c:any)=><details className="border rounded-lg p-3 mt-2 bg-white" key={c.mapping_id}><summary className="cursor-pointer">{c.obligation_id} · {c.after.domestic_article} · {c.after.evidence_status}</summary><p className="mt-3">{c.after.assessment_summary}</p><p className="mt-2 text-sm">{c.after.reviewer_notes}</p>{c.after.audit_sources && <a className="underline block mt-2" href={c.after.audit_sources}>Primary source</a>}<pre className="text-xs whitespace-pre-wrap break-words mt-3">{JSON.stringify({before:c.before,after:c.after},null,2)}</pre></details>)}</section>
 <p><a className="underline" href="/data/derived/audit_20261014.json" download>Download versioned audit and before/after records</a></p>
 </article>;
}
export function ReviewGate({ children }: { children: ReactNode }) {
 return <><AuditReview /><details className="border border-amber-300 rounded-xl p-5 mb-8"><summary className="font-semibold cursor-pointer">Archived exploratory view — not revalidated after source corrections</summary><p className="my-4">This earlier synthesis is retained for research continuity. Its automatic gap, hierarchy and operational interpretations are not current findings. Use the corrected records and sources above.</p>{children}</details></>;
}
'''
SPAR_PAGE='''import { useJsonData } from '../hooks/useData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
export default function SparBridge() {
 const { data, loading, error } = useJsonData<any>('derived/spar_normtrace_divergence.json');
 if (loading) return <p role="status">Loading SPAR context…</p>;
 if (error || !data) return <p role="alert">SPAR context unavailable.</p>;
 const s=data.cc1_spar_series;
 const series=(s?.trajectory ?? []).map((p:any)=>({...p,earlier:p.year<2021?p.value:null,revised:p.year>=2021?p.value:null}));
 return <article className="space-y-8 pb-16"><header><h1 className="text-4xl font-bold">SPAR and legal evidence</h1><p className="mt-4 text-lg">SPAR already asks countries to examine their legal frameworks. NormTrace organizes selected obligation-level sources so the documentary assessment can be inspected.</p></header>
 <section className="bg-amber-50 border border-amber-200 rounded-xl p-5"><h2 className="font-semibold text-lg">Numerical subtraction withdrawn</h2><p className="mt-2">The earlier 60% versus 34% display did not compare equivalent measurements. No validated common denominator or item-level crosswalk supports a difference in percentage points. Neither an inflated self-report nor a legal-preparedness deficit can be inferred from that subtraction.</p></section>
 <section><h2 className="text-xl font-semibold">What SPAR asks</h2><p className="mt-2">In the second edition, C1.1 covers mapping and review of national and subnational legal instruments. C2.1 addresses focal-point mandate and functioning. WHO's September 2026 presentation of the third edition gives explicit attention to domestic governance and responsible authorities.</p><p className="mt-2"><a className="underline" href="https://cdn.who.int/media/docs/default-source/health-security-preparedness/cap/spar/9789240040120-eng-new.pdf">SPAR second edition</a> · <a className="underline" href="https://apps.who.int/gb/mspi/pdf_files/2026/09/Item1_30-09.pdf">30 September 2026 presentation</a></p></section>
 <section><h2 className="text-xl font-semibold">Mexico's reported legislation capacity</h2><p>{s?.latest}% in {s?.latest_year}, as recorded in the project's SPAR panel. This is a self-reported indicator, not an audit of every NormTrace obligation.</p><p className="mt-2 text-sm">The instrument changed across editions. The series is split at the 2021 revision and must not be interpreted as a measurement-invariant trend. Earlier historical observations retain the source panel's original labels.</p><div className="h-72 mt-4"><ResponsiveContainer width="100%" height="100%"><LineChart data={series}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="year"/><YAxis domain={[0,100]} unit="%"/><Tooltip/><Line type="linear" dataKey="earlier" name="Earlier reporting editions" connectNulls={false}/><Line type="linear" dataKey="revised" name="2021–2025 reporting edition" connectNulls={false}/></LineChart></ResponsiveContainer></div></section>
 <p>The public score does not replace the underlying documentary record. NormTrace links provisions and responsibilities; it does not measure observed coordination or establish compliance.</p></article>;
}
'''
METHOD='''# NormTrace-IHR methodology — {version}

## Analytical framework

NormTrace records documentary correspondences between selected international obligations and domestic provisions. Source identification, institutional competence, procedure, coordination, oversight and rights safeguards are distinct dimensions. The mapping is preliminary and is not a compliance assessment or an observation of institutional performance.

## Relationship to SPAR

SPAR already includes legal review: C1.1 in the second edition addresses national and subnational mapping, while C2.1 examines the focal point and its mandate. NormTrace adds an inspectable obligation-level record. The September 2026 presentation of the third edition addresses domestic governance. The earlier numerical subtraction of SPAR and NormTrace has been withdrawn because the constructs, items and denominators are not equivalent.

Sources: [SPAR second edition]({spar}); [WHO 30 September 2026]({spar2026}).

## Current pilot scope

| Unit | Count |
|---|---:|
| Selected IHR 2005 obligation units | {obligations} |
| Federal instruments in the source corpus | {instruments} |
| Domestic provision records | {provisions} |
| Obligation–provision mapping records | {rows} |
| Actor profiles, including historical identifiers requiring review | {actors} |

These are different denominators. The instrument population in the connected network is smaller than the source corpus. State laws, federal-state agreements and administrative practice have not been comprehensively reviewed. The 45 selected units are not a count of all possible duties in every edition of the IHR.

## Documentary evidence status

Source corrections are not independent expert validation. The audit distinguishes a located provision whose scope needs review, a reference to another document not yet examined, a provisional code not revalidated, and no source match identified within the reviewed corpus. A missing search result is not proof of legal absence. Before/after records and sources are downloadable at /audit.

The source for NOM-017 is the final standard, DOF code 5288225, not the draft previously linked in the audit. The final text of 8.1.4 requires notification by units or equivalents at the different technical-administrative levels up to DGE before 24 hours from knowledge of the event. It does not use the draft's exact successive-superior-level wording. This is separate from the IHR Article 6 assessment-based deadline.

## Anchoring scale

The retained numerical codes are the pilot's preliminary coding instrument, not a hierarchy of legal validity. New candidate correspondences remain subject to scope review; a higher code is not a finding of treaty compliance. Aggregate code statistics are descriptive and should not support policy claims until the coding and corpus have been validated.

| Level | Working meaning | Interpretive limit |
|---|---|---|
| 0 | No identified source in corpus | Does not prove absence from the legal system |
| 1 | Contextual correspondence | Does not establish an operative duty |
| 2 | Indirect or partial correspondence | Further sources and scope review needed |
| 3 | More specific but partial correspondence | May be statutory or regulatory |
| 4 | Stronger developed correspondence | Requires expert validation |
| 5 | Integrated correspondence under the study criteria | Does not measure actual implementation |

## Legal hierarchy and institutional authority

No universal rule requires every IHR obligation to be reproduced in a new statute. Article 4 permits legislative and/or administrative arrangements as appropriate. Assess competence, statutory authority, scope, rights reservations and incorporated references. A regulation's age or rank alone does not establish inadequacy. Six analytical layers are not six mandatory legislative steps.

[IHR consolidated text]({ihr}).

## Network semantics

The computed network links obligations to instruments and actor profiles to explicitly identified source instruments. Actor reach is a corpus-association measure, not the number of obligations legally assigned to that actor. Shared instruments do not establish a directed dependency, an issuance power, political authority, observed cooperation or causal bottlenecks. Source aliases are explicit; the DGE is included through its NOM-017 and Interior Regulation references. All obligation IDs remain in the node registry, including zero-degree nodes.

The separately exported notification-path record is supported by final NOM-017 section 8.1.4. It describes a path involving epidemiological units across levels and DGE; it is not evidence of direct exchanges from every unit. Directed institutional dependencies require identified parties, required action or information, legal source and temporal scope.

## National IHR Authority

PAHO CD63/INF/1 (21 August 2026), paragraph 17, reports that Mexico had confirmed designation or establishment by 15 July 2026. The report does not identify the Mexican institution or the domestic act. Those fields remain explicitly unknown. The DGE focal-point designation cannot by itself fill them.

[PAHO report]({paho}).

## Corrected source references

Article 133 II, not Article 134, expressly assigns SINAVE establishment and operation. NOM-017 6.6.3, 6.6.4 and 8.1.4 must be examined before alleging absent notification procedures. International Health Regulation Article 7 establishes a fee rule with exceptions that require comparison to IHR Article 40. Articles 30 and 31 govern aircraft and maritime declarations respectively. Their references must be examined before alleging missing form or submission rules.

[LGS]({lgs}); [final NOM-017]({nom}); [International Health Regulation]({risi}).

## Aggregation and validation

Flags are counted by distinct obligation ID with at least one unrevalidated row carrying that code. Categories overlap. Source-corrected rows awaiting scope review are not confirmed gaps. Two rows coded none do not establish two complete legal pathways; that claim has been withdrawn. Rights flags count records or distinct obligations, never automatically six distinct coercive instruments. Earlier qualitative synthesis views are archived and explicitly marked as not revalidated.

Run the migration once, regenerate both existing derived-data builders, and run the validation gate. Referential integrity, mirror equality, source-corrected records, DGE inclusion, all-obligation network coverage and withdrawal of SPAR subtraction are checked automatically. Automated tests cannot substitute for expert legal review.
'''
VALIDATION='''#!/usr/bin/env python3
"""Validate current source corrections, denominators, mirrors and derived contracts."""
from pathlib import Path
import csv,json,hashlib
R=Path(__file__).resolve().parents[2]
def rows(p,delimiter=','):
 with (R/p).open(encoding='utf-8-sig',newline='') as f: return list(csv.DictReader(f,delimiter=delimiter))
def main():
 a=json.loads((R/'00_project/audit_20261014.json').read_text())
 m=rows('03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv')
 p=rows('03_tables/country_legal_mapping/mexico_legal_provisions.csv')
 actors=rows('03_tables/actors/mexico_health_governance_actors.csv')
 o=rows('03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv',';')
 mids=[r['mapping_id'] for r in m]; pids={r['provision_id'] for r in p}; oids={r['obligation_id'] for r in o}
 assert len(mids)==len(set(mids)), 'Duplicate mapping IDs'
 assert len(p)==len(pids), 'Duplicate provision IDs'
 assert {r['obligation_id'] for r in m}==oids, 'Obligation coverage drift'
 assert all(r['domestic_provision_id'] in pids or (r['domestic_provision_id']=='NO_MATCH_IDENTIFIED' and not r['domestic_norm']) for r in m), 'Invalid provision reference'
 assert a['counts']['mapping_rows']==len(m) and a['counts']['provisions']==len(p) and a['counts']['actors']==len(actors)
 for src,dest in [('country_legal_mapping/mexico_ihr2005_mapping.csv','mexico_ihr2005_mapping_clean.csv'),('country_legal_mapping/mexico_legal_provisions.csv','mexico_legal_provisions_clean.csv'),('actors/mexico_health_governance_actors.csv','mexico_health_governance_actors_clean.csv')]:
  assert rows('03_tables/'+src)==rows('05_webapp/public/data/'+dest), 'Public/source mirror differs: '+src
 for mid,article in [('MEX_MAP_IHR2005_002_001','Art. 133, fracción II'),('MEX_MAP_IHR2005_037_001','Art. 7'),('MEX_MAP_IHR2005_034_001','Art. 31'),('MEX_MAP_IHR2005_035_001','Art. 30')]:
  r=next(x for x in m if x['mapping_id']==mid); assert r['domestic_article']==article and r['gap_type']=='review pending', mid
 assert a['complete_pathway_count'] is None
 assert a['national_ihr_authority']['institution'] is None and a['national_ihr_authority']['domestic_instrument'] is None
 assert all(r['source_url'].endswith('codigo=5288225') for r in p if 'NOM-017' in r['norm_title'])
 for f in ['network_metrics.json','network_edges.csv','node_registry.csv']:
  assert (R/'04_outputs/figures'/f).read_bytes()==(R/'05_webapp/public/data/derived'/f).read_bytes(),f
 net=json.loads((R/'04_outputs/figures/network_metrics.json').read_text())
 assert net['network']['n_obligations']==len(oids)
 assert any('Epidemiología' in r['actor'] for r in net['actor_reach_ranked']), 'DGE missing'
 nodes={r['node_id'] for r in rows('04_outputs/figures/node_registry.csv')}
 assert all(r['source'] in nodes and r['target'] in nodes for r in rows('04_outputs/figures/network_edges.csv'))
 spar=json.loads((R/'05_webapp/public/data/derived/spar_normtrace_divergence.json').read_text())
 assert spar['headline_cc1']['divergence_latest'] is None and spar['headline_cc1']['divergence_mean'] is None
 assert 'cc1.divergence_latest' not in (R/'05_webapp/src/pages/LandingPage.tsx').read_text()
 assert 'ReferenceLine' not in (R/'05_webapp/src/pages/SparBridge.tsx').read_text()
 assert a['mapping_sha256']==hashlib.sha256((R/'03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv').read_bytes()).hexdigest()
 print('PASS: source corrections, primary-source links, unique IDs, coverage, mirrors, DGE, network integrity, withdrawn claims and manifest hash.')
if __name__=='__main__': main()
'''
if __name__=='__main__': main()
