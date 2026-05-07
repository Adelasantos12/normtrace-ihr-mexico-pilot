import { useMemo, useState } from 'react';
import { useCsvData } from '../hooks/useData';

const EXPECTED = ['actor_id','actor_name','legal_nature','government_level','sector','legal_basis','core_functions','ihr_relevance','pandemic_agreement_relevance','instruments_it_can_issue','coordination_role','limitations','source_norm','source_article'];

export default function ActorsExplorer() {
  const { data, loading, error } = useCsvData<any>('mexico_health_governance_actors_clean.csv');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<any>({level:'', sector:'', nature:'', ihr:'', pa:''});

  const normalized = useMemo(() => data.map((row) => {
    const out:any = {};
    for (const key of EXPECTED) {
      const found = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
      out[key] = found ? row[found] : '';
    }
    return out;
  }), [data]);

  const filtered = useMemo(() => normalized.filter((a) =>
    `${a.actor_name} ${a.actor_id}`.toLowerCase().includes(search.toLowerCase()) &&
    (!filters.level || a.government_level===filters.level) &&
    (!filters.sector || a.sector===filters.sector) &&
    (!filters.nature || a.legal_nature===filters.nature) &&
    (!filters.ihr || a.ihr_relevance===filters.ihr) &&
    (!filters.pa || a.pandemic_agreement_relevance===filters.pa)
  ), [normalized, search, filters]);

  if (loading) return <div>Loading actors...</div>;
  if (error) return <div>Error loading actors.</div>;

  const columnsDetected = normalized[0] ? Object.keys(normalized[0]).join(', ') : '';
  const emptyName = normalized.filter((a) => !a.actor_name).length;
  const emptyBasis = normalized.filter((a) => !a.legal_basis).length;
  const uniq = (k:string)=>Array.from(new Set(normalized.map(a=>a[k]).filter(Boolean)));

  return <div className='space-y-6 pb-20'>
    <h1 className='text-3xl font-bold'>Actor Inventory</h1>
    {emptyName>0 && <div className='p-3 border border-amber-300 bg-amber-50'>Actor table loaded but actor_name field was not found.</div>}
    <div className='bg-slate-50 border rounded p-3 text-sm'>
      <strong>Data check</strong>: actor rows loaded {normalized.length} · actor columns detected {columnsDetected} · empty actor_name count {emptyName} · empty legal_basis count {emptyBasis}
    </div>
    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Filter by actor name' className='border rounded p-2 w-full'/>
    <div className='grid grid-cols-2 md:grid-cols-5 gap-2'>
      {[['level','government_level'],['sector','sector'],['nature','legal_nature'],['ihr','ihr_relevance'],['pa','pandemic_agreement_relevance']].map(([f,k]) =>
        <select key={f} value={filters[f]} onChange={e=>setFilters({...filters,[f]:e.target.value})} className='border rounded p-2 text-sm'><option value=''>All {k}</option>{uniq(k).map(v=><option key={v} value={v}>{v}</option>)}</select>
      )}
    </div>
    <div className='grid md:grid-cols-2 gap-4'>
      {filtered.map((a) => <div key={a.actor_id || a.actor_name} className='bg-white border rounded p-4 space-y-2'>
        <div><div className='font-semibold'>{a.actor_name || 'Not identified in current corpus'}</div><div className='text-xs text-slate-500'>{a.actor_id || 'Not identified in current corpus'} · {a.legal_nature || 'Not identified in current corpus'} · {a.government_level || 'Not identified in current corpus'}</div></div>
        {['legal_basis','source_norm','source_article','core_functions','ihr_relevance','pandemic_agreement_relevance','instruments_it_can_issue','coordination_role','limitations'].map((k)=><div key={k} className='text-sm'><strong>{k}:</strong> {a[k] || 'Not identified in current corpus'}</div>)}
      </div>)}
    </div>
  </div>;
}
