#!/usr/bin/env python3
"""Build the current documentary association network from canonical tables.

Edges mean that a mapping cites an instrument, or an actor profile cites an
instrument. They never imply observed cooperation, power to issue a norm,
responsibility for every reachable obligation, or a complete implementation
chain. Candidate references and all registry obligations remain visible.
"""
from __future__ import annotations
import csv
import json
from pathlib import Path
from collections import defaultdict
import random
import statistics
import networkx as nx
from networkx.algorithms import bipartite
from networkx.algorithms.community import greedy_modularity_communities

ROOT = Path(__file__).resolve().parents[2]
INSTRUMENT_ALIASES = {
    'Ley General de Salud': 'LGS',
    'Reglamento de la Ley General de Salud en Materia de Sanidad Internacional': 'RLGS-SI',
    'Reglamento Interior de la Secretaría de Salud': 'RI-SS-2025',
    'NOM-017-SSA2-2012, Para la vigilancia epidemiológica': 'NOM-017',
    'Constitución Política de los Estados Unidos Mexicanos': 'CPEUM',
    'Ley Aduanera': 'Ley Aduanera',
    'Ley Orgánica de la Administración Pública Federal': 'LOAPF',
    'Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados': 'LGPDPPSO',
    'Reglamento de la Ley General de Salud en Materia de Investigación para la Salud': 'RLGS-Inv',
}
def read(path, delimiter=','):
    with (ROOT / path).open(encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f, delimiter=delimiter))
def write_csv(path, rows, fields):
    with path.open('w', encoding='utf-8', newline='') as f:
        w=csv.DictWriter(f, fieldnames=fields, lineterminator='\n');w.writeheader();w.writerows(rows)
def main():
    mappings=read('03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv')
    obligations=read('03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv',';')
    links=read('03_tables/actors/actor_instrument_associations.csv')
    ids=sorted({o['obligation_id'] for o in obligations})
    by_edge=defaultdict(list)
    for row in mappings:
        if row['obligation_id'] not in ids: raise ValueError('Unknown obligation '+row['obligation_id'])
        norm=row['domestic_norm'].strip()
        if not norm: continue
        if norm not in INSTRUMENT_ALIASES: raise ValueError('Add an explicit instrument alias: '+norm)
        by_edge[(INSTRUMENT_ALIASES[norm],row['obligation_id'])].append(row)
    insts=sorted({i for i,_ in by_edge})
    B=nx.Graph()
    B.add_nodes_from(insts,mode='instrument',bipartite=0)
    B.add_nodes_from(ids,mode='obligation',bipartite=1)
    edges=[]
    for (inst,oid),rows in sorted(by_edge.items()):
        # Equal widths deliberately represent association, not an unvalidated legal score.
        B.add_edge(inst,oid,weight=1,rows=len(rows))
        edges.append({'source':inst,'target':oid,'type':'cited_in_mapping','weight':1,'rows':len(rows),
                      'mapping_ids':';'.join(sorted(r['mapping_id'] for r in rows)),
                      'provision_ids':';'.join(sorted({r['domestic_provision_id'] for r in rows})),
                      'review_status':'reassessment_required' if any(r.get('audit_status')!='legacy_preliminary' for r in rows) else 'legacy_preliminary'})
    betw=bipartite.betweenness_centrality(B,set(ids)) if insts and ids else {}
    actor_links=defaultdict(list)
    for link in links:
        if link['instrument'] in insts: actor_links[link['actor_name']].append(link)
    reach=[]
    for name,entries in sorted(actor_links.items()):
        instruments=sorted({e['instrument'] for e in entries})
        reach.append({'actor':name,'actor_id':entries[0]['actor_id'],'instruments':instruments,
                      'n_instruments':len(instruments),'obligation_reach':len({o for i in instruments for o in B.neighbors(i)}),
                      'association_type':'source_cited_in_actor_profile',
                      'source_articles':sorted({e['source_article'] for e in entries}),
                      'interpretation_limit':'Documentary reach, not assigned tasks, issuing powers or observed cooperation.'})
    # Descriptive projection: shared instruments, not an interaction network.
    projection=bipartite.weighted_projected_graph(B,ids)
    raw=greedy_modularity_communities(projection) if projection.number_of_edges() else [{o} for o in ids]
    communities=sorted(raw,key=lambda c:(-len(c),sorted(c)))
    comm_of={o:k for k,c in enumerate(communities) for o in c}
    modularity=nx.algorithms.community.modularity(projection,communities) if projection.number_of_edges() else None
    def concentration(degrees):
        top=max(degrees,default=0)
        return sum(top-d for d in degrees)/(len(degrees)*top) if top else 0.0
    observed=concentration([B.degree(i) for i in insts]);rng=random.Random(42)
    pairs=[(i,o) for i in insts for o in ids];sims=[]
    for _ in range(1000):
        counts=dict.fromkeys(insts,0)
        for i,o in rng.sample(pairs,len(edges)): counts[i]+=1
        sims.append(concentration(list(counts.values())))
    p=(1+sum(s>=observed for s in sims))/(1+len(sims))
    metrics={
        'generated_by':'06_scripts/build_tables/build_network.py','audit_version':'0.1.1-audit.20261014',
        'edge_semantics':'documentary_association_only','edge_weight_semantics':'constant_1_not_legal_strength',
        'network':{'modes':['instrument','obligation'],'n_instruments':len(insts),'n_obligations':len(ids),
                   'n_edges':len(edges),'density':round(len(edges)/(len(insts)*len(ids)),4) if insts and ids else 0},
        'instrument_degree_ranked':sorted([{'instrument':i,'obligations_anchored':B.degree(i),
            'degree_norm':round(B.degree(i)/len(ids),4),'betweenness':round(betw.get(i,0),4)} for i in insts],key=lambda x:(-x['obligations_anchored'],x['instrument'])),
        'actor_reach_ranked':sorted(reach,key=lambda a:(-a['obligation_reach'],a['actor'])),
        'communities':{'n':len(communities),'modularity':round(modularity,4) if modularity is not None else None,'sizes':[len(c) for c in communities]},
        'cug_test':{'measure':'descriptive instrument-degree concentration','observed':round(observed,4),
                    'random_mean':round(statistics.mean(sims),4),'p_value_ge_random':round(p,4),
                    'interpretation':'Size/density-matched random association benchmark only; not political power or response performance.'},
        'isolated_obligations':[o for o in ids if B.degree(o)==0],
        'provenance_note':'All registry obligations are retained. An isolated node means no reference in this corpus, not proven legal silence. Instrument degree counts distinct cited obligations. Actor links come from explicit source aliases in actor_instrument_associations.csv; reach through a shared instrument is not competence for all linked obligations. Legal adequacy scores are not used as edge weights.',
        'legacy_field_aliases':{'obligations_anchored':'distinct obligations with a cited instrument (including candidates)','obligation_reach':'documentary two-hop reach, not assigned responsibilities'}
    }
    registry=[]
    for node,mode,opposite in [(i,'instrument',len(ids)) for i in insts]+[(o,'obligation',len(insts)) for o in ids]:
        registry.append({'node_id':node,'mode':mode,'degree':B.degree(node),'degree_norm':round(B.degree(node)/opposite,4) if opposite else 0,'betweenness':round(betw.get(node,0),4),'community':comm_of.get(node,'')})
    for folder in [ROOT/'04_outputs/figures',ROOT/'05_webapp/public/data/derived']:
        folder.mkdir(parents=True,exist_ok=True)
        (folder/'network_metrics.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2)+'\n')
        write_csv(folder/'network_edges.csv',edges,['source','target','type','weight','rows','mapping_ids','provision_ids','review_status'])
        write_csv(folder/'node_registry.csv',registry,['node_id','mode','degree','degree_norm','betweenness','community'])
        active_links=[e for e in links if e['instrument'] in insts]
        write_csv(folder/'actor_instrument_associations.csv',active_links,list(active_links[0]))
    print(json.dumps({'obligations':len(ids),'instruments':len(insts),'mapping_edges':len(edges),'actors':len(reach),'actor_associations':sum(len(a['instruments']) for a in reach),'unmatched_obligations':metrics['isolated_obligations']},ensure_ascii=False))
if __name__=='__main__':main()
