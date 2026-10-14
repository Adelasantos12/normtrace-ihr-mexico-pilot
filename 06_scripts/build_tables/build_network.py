#!/usr/bin/env python3
"""Deterministic documentary network. Shared instruments do not establish coordination.

The graph contains candidate obligation-instrument correspondences and an actor source-reference
layer. Uniform edge weights denote documentary links, NOT calibrated legal strength. All selected
obligations and all actor profiles are retained, including unmatched records. Directed normative
relationships are a separate, source-backed table and are not inferred by graph projection.
"""
from pathlib import Path
import csv,json,re,unicodedata
import networkx as nx
ROOT=Path(__file__).resolve().parents[2]
MAP='03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv'
ACT='03_tables/actors/mexico_health_governance_actors.csv'
OBL='03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv'
ALIASES={
 'Ley General de Salud':'LGS',
 'Reglamento de la Ley General de Salud en Materia de Sanidad Internacional':'RLGS-SI',
 'Reglamento Interior de la Secretaría de Salud':'RI-SS-2025',
 'NOM-017-SSA2-2012, Para la vigilancia epidemiológica':'NOM-017',
 'Constitución Política de los Estados Unidos Mexicanos':'CPEUM',
 'Ley Aduanera':'Ley Aduanera',
 'Ley Orgánica de la Administración Pública Federal':'LOAPF',
 'Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados':'LGPDPPSO',
 'Reglamento de la Ley General de Salud en Materia de Investigación para la Salud':'RLGS-Inv',
}
# Explicit aliases for source labels actually used in the actor registry; no truncated-prefix matching.
SOURCE_LABELS={
 'LGS':['Ley General de Salud','(LGS)'],
 'RLGS-SI':['Reglamento de la Ley General de Salud en Materia de Sanidad Internacional','Reglamento LGS Materia Sanidad Internacional (1985)'],
 'RLGS-Inv':['Reglamento de la Ley General de Salud en Materia de Investigación para la Salud'],
 'RI-SS-2025':['Reglamento Interior de la Secretaría de Salud','Reglamento Interior SS 2025','MEX-017'],
 'NOM-017':['NOM-017-SSA2-2012'],
 'CPEUM':['Constitución Política de los Estados Unidos Mexicanos','CPEUM'],
 'Ley Aduanera':['Ley Aduanera'],
 'LOAPF':['Ley Orgánica de la Administración Pública Federal','LOAPF'],
 'LGPDPPSO':['Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados','LGPDPPSO'],
}
def norm(s):return ''.join(c for c in unicodedata.normalize('NFD',s.casefold()) if not unicodedata.combining(c))
def read(path,delimiter=','):
 with (ROOT/path).open(encoding='utf8',newline='') as f:return list(csv.DictReader(f,delimiter=delimiter))
def dump(path,data):
 p=ROOT/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def save(path,data,fields):
 p=ROOT/path;p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('w',encoding='utf8',newline='') as f:
  w=csv.DictWriter(f,fieldnames=fields,lineterminator='\n');w.writeheader();w.writerows(data)
def main():
 mapping=read(MAP);actors=read(ACT);obligations=read(OBL,';')
 oids=sorted({r['obligation_id'] for r in obligations})
 grouped={}
 for r in mapping:
  if not r['domestic_norm'] or r['domestic_provision_id']=='NO_MATCH_IDENTIFIED':continue
  inst=ALIASES.get(r['domestic_norm'],r['domestic_norm']);key=(inst,r['obligation_id'])
  grouped.setdefault(key,[]).append(r['mapping_id'])
 insts=sorted({i for i,o in grouped});B=nx.Graph()
 B.add_nodes_from(insts,mode='instrument');B.add_nodes_from(oids,mode='obligation')
 B.add_edges_from(sorted(grouped))
 # Centrality is descriptive of this corpus. No causal, performance or political inference.
 betw=nx.betweenness_centrality(B,normalized=True,weight=None)
 node_rows=[]
 for ids,mode,denom in [(insts,'instrument',len(oids)),(oids,'obligation',len(insts))]:
  for i in ids:node_rows.append({'node_id':i,'mode':mode,'degree':B.degree(i),'degree_norm':round(B.degree(i)/denom,6) if denom else 0,'betweenness':round(betw[i],6),'community':''})
 edges=[{'source':i,'target':o,'type':'documentary_correspondence','weight':1,'rows':len(grouped[i,o]),'mapping_ids':';'.join(sorted(grouped[i,o]))} for i,o in sorted(grouped)]
 actor_rows=[];source_links=[]
 for a in actors:
  src=a.get('source_norm','');tokens=[norm(s.strip()) for s in src.split(';') if s.strip()]
  matches=[]
  for inst in insts:
   labels=SOURCE_LABELS.get(inst,[inst])
   # Full source item, abbreviation token or explicit unambiguous legal name.
   matching=next((raw for raw in src.split(';') if any(norm(label) in norm(raw) for label in labels)),None)
   # Do not let the substring 'Ley General de Salud' match either of its regulations.
   if inst=='LGS':matching=next((raw for raw in src.split(';') if norm(raw.strip()).startswith(norm('Ley General de Salud')) or raw.strip()=='(LGS)'),None)
   if matching:
    matches.append(inst);source_links.append({'actor_id':a['actor_id'],'actor':a['actor_name'],'instrument':inst,'source_reference':matching.strip(),'relationship_type':'profile_cites_instrument','interpretation':'Documentary association only; does not establish issuing power, task ownership or cooperation.','profile_status':a.get('record_status','')})
  reach=set().union(*(set(B.neighbors(i)) for i in matches)) if matches else set()
  actor_rows.append({'actor_id':a['actor_id'],'actor':a['actor_name'],'instruments':sorted(matches),'n_instruments':len(matches),'obligation_reach':len(reach),'profile_status':a.get('record_status',''),'semantics':'Shared-instrument documentary reach, not assigned obligations.'})
 isolated=[o for o in oids if B.degree(o)==0]
 metrics={'generated_by':'06_scripts/build_tables/build_network.py','release':'0.2.0-evidence-audit',
  'network':{'modes':['instrument','obligation'],'n_instruments':len(insts),'n_obligations':len(oids),'n_actor_records':len(actors),'n_edges':len(edges),'density':round(len(edges)/(len(insts)*len(oids)),6) if insts and oids else 0},
  'instrument_degree_ranked':sorted([{'instrument':i,'obligations_anchored':B.degree(i),'obligations_linked':B.degree(i),'degree_norm':round(B.degree(i)/len(oids),6),'betweenness':round(betw[i],6)} for i in insts],key=lambda r:(-r['obligations_linked'],r['instrument'])),
  'actor_reach_ranked':sorted(actor_rows,key=lambda r:(-r['obligation_reach'],r['actor'])),
  'isolated_obligations':isolated,
  'edge_semantics':'Documentary correspondences and actor-profile source references. Uniform edge weights are not legal-strength scores.',
  'provenance_note':'All selected obligation units and all actor profiles retained. Zero degree means no candidate in this graph, not proven legal silence. Actor source-reference matching is explicit and exported in actor_source_links.csv. Source-checked directed normative relationships are a separate dataset; no actor dependency is inferred from shared legislation.',
  'causal_or_performance_inference':False,
  'legacy_key_note':'obligations_anchored and obligation_reach are compatibility field names for documentary link counts; they do not certify legal adequacy.'}
 for folder in ['04_outputs/figures','05_webapp/public/data/derived']:
  dump(folder+'/network_metrics.json',metrics)
  save(folder+'/node_registry.csv',node_rows,['node_id','mode','degree','degree_norm','betweenness','community'])
  save(folder+'/network_edges.csv',edges,['source','target','type','weight','rows','mapping_ids'])
  save(folder+'/actor_source_links.csv',source_links,['actor_id','actor','instrument','source_reference','relationship_type','interpretation','profile_status'])
 print(f'Documentary network: {len(oids)} obligations, {len(insts)} instruments, {len(actors)} actor profiles, {len(edges)} obligation-instrument links. Isolated obligation IDs: {isolated}')
if __name__=='__main__':main()
