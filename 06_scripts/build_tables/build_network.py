#!/usr/bin/env python3
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
 # CSV mirrors are build outputs, never independent sources of truth.
 for source,dest in [('03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv','mexico_ihr2005_mapping_clean.csv'),('03_tables/country_legal_mapping/mexico_legal_provisions.csv','mexico_legal_provisions_clean.csv'),('03_tables/country_legal_mapping/mexico_normative_corpus_index.csv','mexico_normative_corpus_index_clean.csv'),('03_tables/actors/mexico_health_governance_actors.csv','mexico_health_governance_actors_clean.csv'),('03_tables/actors/actor_obligation_evidence.csv','actor_obligation_evidence.csv')]:
  (ROOT/'05_webapp/public/data'/dest).write_bytes((ROOT/source).read_bytes())
 print(json.dumps(summary,ensure_ascii=False))
if __name__=='__main__':main()
