import { useMemo, useState } from 'react';
import { useCsvData } from '../hooks/useData';

const EXPECTED = ['actor_id','actor_name','legal_nature','government_level','sector','legal_basis','core_functions','ihr_relevance','pandemic_agreement_relevance','instruments_it_can_issue','coordination_role','limitations','source_norm','source_article'];
const LABELS: Record<string,string> = {
  legal_basis:'Legal basis', source_norm:'Source norm', source_article:'Source article', core_functions:'Core functions', ihr_relevance:'IHR relevance', pandemic_agreement_relevance:'Pandemic Agreement relevance', instruments_it_can_issue:'Instruments it can issue', coordination_role:'Coordination role', limitations:'Limitations'
};

export default function ActorsExplorer() {
  const { data, loading, error } = useCsvData<any>('mexico_health_governance_actors_clean.csv');
  const { data: edges } = useCsvData<any>('derived/actor_network_edges_derived.csv');
  const [tab, setTab] = useState<'map'|'inventory'>('map');
  const [search, setSearch] = useState('');

  const normalized = useMemo(() => data.map((row) => {
    const out:any = {};
    for (const key of EXPECTED) out[key] = row[Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase()) || ''] || '';
    return out;
  }), [data]);
  const filtered = normalized.filter((a)=>`${a.actor_name} ${a.actor_id}`.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div>Loading actors...</div>;
  if (error) return <div>Error loading actors.</div>;

  return <div className='space-y-6 pb-20'>
    <h1 className='text-3xl font-bold'>Actors Explorer</h1>
    <div className='flex gap-2'><button className={`px-3 py-2 border rounded ${tab==='map'?'bg-slate-900 text-white':'bg-white'}`} onClick={()=>setTab('map')}>Relationship Map</button><button className={`px-3 py-2 border rounded ${tab==='inventory'?'bg-slate-900 text-white':'bg-white'}`} onClick={()=>setTab('inventory')}>Actor Inventory</button></div>

    {tab==='map' && <section className='bg-white border rounded p-4 space-y-4'>
      <p className='text-sm text-slate-600'>Corpus-derived preliminary legal-institutional network. It shows documented legal and mapping relationships, not observed operational coordination.</p>
      <div className='overflow-auto border rounded bg-slate-50'>
        <svg viewBox='0 0 900 460' className='w-full min-w-[900px] h-[460px]'>
          {edges.slice(0,60).map((e:any,i:number)=><line key={i} x1={100 + (i%10)*70} y1={80 + (i%6)*50} x2={450 + (i%8)*50} y2={120 + (i%5)*60} stroke='#94a3b8' strokeWidth='1' />)}
          {[...new Set(edges.flatMap((e:any)=>[e.source,e.target]).filter(Boolean))].slice(0,26).map((n:any,i:number)=><g key={n}><circle cx={80 + (i%13)*62} cy={60 + Math.floor(i/13)*220} r='18' fill='#dbeafe' stroke='#2563eb'/><text x={80 + (i%13)*62} y={64 + Math.floor(i/13)*220} textAnchor='middle' fontSize='8' fill='#1e3a8a'>{String(n).slice(0,8)}</text></g>)}
        </svg>
      </div>
      <div className='overflow-auto'>
        <table className='w-full text-sm border'>
          <thead><tr>{['source','target','relationship_type','ihr_area','legal_basis','source_norm'].map(h=><th className='text-left p-2 border-b' key={h}>{h}</th>)}</tr></thead>
          <tbody>{edges.map((e:any,i:number)=><tr key={i} className='border-b'><td className='p-2'>{e.source}</td><td className='p-2'>{e.target}</td><td className='p-2'>{e.relationship_type}</td><td className='p-2'>{e.ihr_area}</td><td className='p-2'>{e.legal_basis}</td><td className='p-2'>{e.source_norm}</td></tr>)}</tbody>
        </table>
      </div>
    </section>}

    {tab==='inventory' && <>
      <details className='border rounded p-3'><summary>Developer data check</summary><div className='text-sm mt-2'>actor rows loaded {normalized.length} · empty actor_name {normalized.filter(a=>!a.actor_name).length}</div></details>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Filter by actor name' className='border rounded p-2 w-full'/>
      <div className='grid md:grid-cols-2 gap-4'>{filtered.map((a) => <div key={a.actor_id || a.actor_name} className='bg-white border rounded p-4 space-y-2'>
        <div><div className='font-semibold'>{a.actor_name || 'Not identified in current corpus'}</div><div className='text-xs text-slate-500'>{a.actor_id || 'Not identified in current corpus'} · {a.legal_nature || 'Not identified in current corpus'} · {a.government_level || 'Not identified in current corpus'}</div></div>
        {Object.keys(LABELS).map((k)=><div key={k} className='text-sm'><strong>{LABELS[k]}:</strong> {a[k] || 'Not identified in current corpus'}</div>)}
      </div>)}</div>
    </>}
  </div>;
}
