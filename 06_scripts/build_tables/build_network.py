#!/usr/bin/env python3
"""Documentary obligation–instrument network, not an observed coordination network.

Edges mean a candidate provision has been recorded, including candidates whose
legal sufficiency is still under review. Edge weight is correspondence count,
not an anchoring/compliance score. Actor overlays are inventory source references;
only mexico_institutional_relations.csv encodes individually sourced legal duties.
"""
from pathlib import Path
from collections import defaultdict
import csv,json,random,statistics,unicodedata,re
import networkx as nx
from networkx.algorithms import bipartite
from networkx.algorithms.community import greedy_modularity_communities
ROOT=Path(__file__).resolve().parents[2]
TABLE=ROOT/'03_tables/country_legal_mapping'
OUTS=[ROOT/'04_outputs/figures',ROOT/'05_webapp/public/data/derived']
ALIASES={
'Ley General de Salud':'LGS',
'Reglamento de la Ley General de Salud en Materia de Sanidad Internacional':'RLGS-SI',
'Reglamento Interior de la Secretaría de Salud':'RI-SS-2025',
'NOM-017-SSA2-2012, Para la vigilancia epidemiológica':'NOM-017',
'Constitución Política de los Estados Unidos Mexicanos':'CPEUM',
'Ley Aduanera':'Ley Aduanera',
'Ley Orgánica de la Administración Pública Federal':'LOAPF',
'Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados':'LGPDPPSO',
'Reglamento de la Ley General de Salud en Materia de Investigación para la Salud':'RLGS-Inv'}
EXTRA={
'RI-SS-2025':['Reglamento Interior SS 2025','Reglamento Interior de la Secretaría de Salud 2025'],
'NOM-017':['NOM-017-SSA2-2012'],
'RLGS-SI':['Reglamento LGS Materia Sanidad Internacional'],
'CPEUM':['CPEUM']}

def norm(s):return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())

def read(path,delimiter=','):
 with path.open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f,delimiter=delimiter))

def write(path,rows,fields):
 with path.open('w',encoding='utf-8',newline='') as f:
  w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');w.writeheader();w.writerows(rows)

def main():
 mapping=read(TABLE/'mexico_ihr2005_mapping.csv')
 actors=read(ROOT/'03_tables/actors/mexico_health_governance_actors.csv')
 obligations=read(ROOT/'03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv',';')
 oids=sorted({x['obligation_id'] for x in obligations})
 pairs=defaultdict(list)
 for row in mapping:
  if row['domestic_norm'] and row['domestic_provision_id']!='NO_MATCH_IDENTIFIED':
   pairs[(ALIASES.get(row['domestic_norm'],row['domestic_norm']),row['obligation_id'])].append(row)
 insts=sorted({i for i,o in pairs})
 B=nx.Graph()
 B.add_nodes_from(insts,mode='instrument',bipartite=0)
 B.add_nodes_from(oids,mode='obligation',bipartite=1)
 for (i,o),rs in sorted(pairs.items()): B.add_edge(i,o,weight=len(rs),rows=len(rs))
 deg={n:B.degree(n) for n in insts};od={n:B.degree(n) for n in oids}
 betw=bipartite.betweenness_centrality(B,oids) if insts and oids else {}
 vocab=[(norm(full),short) for full,short in ALIASES.items()]
 vocab += [(norm(alias),short) for short,aliases in EXTRA.items() for alias in aliases]
 vocab.sort(key=lambda x:(-len(x[0]),x[1]))
 actor_reach=[];actor_links=[];unmatched=[]
 for a in actors:
  matched=set()
  for token in a['source_norm'].split(';'):
   t=norm(token)
   choices=[(prefix,short) for prefix,short in vocab if t.startswith(prefix) and short in insts]
   if choices:matched.add(choices[0][1])
  reach=set()
  for i in sorted(matched):
   reach.update(B.neighbors(i))
   actor_links.append(dict(actor_id=a['actor_id'],actor=a['actor_name'],instrument=i,
       relationship_type='inventory_source_reference',source_locator=a['source_article'],
       note='Documentary association only. Does not imply authority to issue or amend this instrument, responsibility for every linked obligation, or observed coordination.'))
  actor_reach.append(dict(actor_id=a['actor_id'],actor=a['actor_name'],instruments=sorted(matched),n_instruments=len(matched),
      obligation_reach=len(reach),association_only=True,inventory_review_status=a.get('inventory_review_status','preliminary')))
  if not matched:unmatched.append(a['actor_id'])
 P=bipartite.weighted_projected_graph(B,oids)
 raw=greedy_modularity_communities(P) if P.number_of_edges() else [{o} for o in oids]
 communities=sorted(raw,key=lambda c:(-len(c),min(c)))
 community={o:k for k,c in enumerate(communities) for o in c}
 modularity=nx.algorithms.community.modularity(P,communities) if P.number_of_edges() else None
 def central(ds):
  m=max(ds,default=0);return sum(m-d for d in ds)/(len(ds)*m) if m else 0.0
 rng=random.Random(42);obs=central(list(deg.values()));allpairs=[(i,o) for i in insts for o in oids];sims=[]
 for _ in range(1000):
  counts={i:0 for i in insts}
  for i,o in rng.sample(allpairs,len(pairs)):counts[i]+=1
  sims.append(central(list(counts.values())))
 nodes=[dict(node_id=i,mode='instrument',degree=deg[i],degree_norm=round(deg[i]/len(oids),3),betweenness=round(betw.get(i,0),4),community='') for i in insts]
 nodes += [dict(node_id=o,mode='obligation',degree=od[o],degree_norm=round(od[o]/len(insts),3) if insts else 0,betweenness=round(betw.get(o,0),4),community=community[o]) for o in oids]
 edges=[dict(source=i,target=o,type='candidate_provision',weight=len(rs),rows=len(rs)) for (i,o),rs in sorted(pairs.items())]
 metrics=dict(generated_by='06_scripts/build_tables/build_network.py',semantics_version='documentary-network-20261014',
  network=dict(modes=['instrument','obligation'],n_instruments=len(insts),n_obligations=len(oids),n_edges=len(pairs),density=round(len(pairs)/(len(insts)*len(oids)),3)),
  instrument_degree_ranked=sorted([dict(instrument=i,obligations_anchored=deg[i],degree_norm=round(deg[i]/len(oids),3),betweenness=round(betw.get(i,0),4)) for i in insts],key=lambda r:(-r['obligations_anchored'],r['instrument'])),
  actor_reach_ranked=sorted(actor_reach,key=lambda r:(-r['obligation_reach'],r['actor'])),
  communities=dict(n=len(communities),modularity=round(modularity,3) if modularity is not None else None,sizes=[len(c) for c in communities]),
  cug_test=dict(measure='descriptive instrument-degree concentration',observed=round(obs,4),random_mean=round(statistics.mean(sims),4),p_value_ge_random=round(sum(x>=obs for x in sims)/len(sims),4),interpretation='Descriptive random-graph comparison; not a test of institutional power, resilience or coordination.'),
  isolated_obligations=[o for o in oids if od[o]==0],actor_entries_without_matching_network_instrument=unmatched,
  provenance_note='All 45 registry obligations remain visible. Links record candidate provisions, including unscored and review-pending records. Isolated nodes indicate missing candidates in this dataset, not established legal silence. Actor reach counts documentary associations through inventory-listed instruments; it is not competence, amendment power, actual exchange, or performance. Edge width is correspondence count, never legal strength. Individually sourced duties are in mexico_institutional_relations.csv.')
 for out in OUTS:
  out.mkdir(parents=True,exist_ok=True)
  (out/'network_metrics.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2,sort_keys=True)+'\n')
  write(out/'node_registry.csv',nodes,['node_id','mode','degree','degree_norm','betweenness','community'])
  write(out/'network_edges.csv',edges,['source','target','type','weight','rows'])
  write(out/'actor_instrument_links.csv',actor_links,['actor_id','actor','instrument','relationship_type','source_locator','note'])
 print('NETWORK',metrics['network'],'isolated=',metrics['isolated_obligations'],'actors=',len(actor_reach))

if __name__=='__main__':main()
