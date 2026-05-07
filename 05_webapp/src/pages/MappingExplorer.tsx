import { useMemo, useState } from 'react';
import { useCsvData } from '../hooks/useData';

type Tab = 'ihr2005' | 'ihr2024' | 'pa';

export default function MappingExplorer() {
  const { data: mapping, loading: l1 } = useCsvData<any>('mexico_ihr2005_mapping_clean.csv');
  const { data: obl, loading: l2 } = useCsvData<any>('ihr_2005_obligations_clean.csv');
  const { data: changes, loading: l3 } = useCsvData<any>('ihr_2024_changes_clean.csv');
  const { data: pa, loading: l4 } = useCsvData<any>('pandemic_agreement_obligations_clean.csv');
  const { data: pabs, loading: l5 } = useCsvData<any>('pabs_draft_obligations_clean.csv');

  const [tab, setTab] = useState<Tab>('ihr2005');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({ article: '', domain: '', norm: '', level: '', gap: '', conf: '' });

  const joined = useMemo(() => {
    const byId = new Map(obl.map((o) => [o.obligation_id, o]));
    return mapping.map((m) => ({ ...m, ...(byId.get(m.obligation_id) || {}) }));
  }, [mapping, obl]);

  const filtered = useMemo(() => joined.filter((r) =>
    (!filters.article || r.article === filters.article) &&
    (!filters.domain || r.implementation_domain === filters.domain) &&
    (!filters.norm || r.domestic_norm === filters.norm) &&
    (!filters.level || String(r.anchoring_level) === filters.level) &&
    (!filters.gap || r.gap_type === filters.gap) &&
    (!filters.conf || r.confidence_level === filters.conf)
  ), [joined, filters]);

  if (l1 || l2 || l3 || l4 || l5) return <div>Loading mapping...</div>;

  const uniq = (k: string) => Array.from(new Set(joined.map((r) => r[k]).filter(Boolean)));

  return <div className="space-y-6 pb-20">
    <h1 className="text-3xl font-bold">International Mapping</h1>
    <div className="flex gap-2">{([
      ['ihr2005', 'IHR 2005 baseline mapping'],
      ['ihr2024', 'IHR 2024 update pressure'],
      ['pa', 'Pandemic Agreement / PABS readiness']
    ] as [Tab, string][]).map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`px-3 py-2 rounded border ${tab === id ? 'bg-slate-900 text-white' : 'bg-white'}`}>{label}</button>)}</div>

    {tab === 'ihr2005' && <>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {[['article','article'],['domain','implementation_domain'],['norm','domestic_norm'],['level','anchoring_level'],['gap','gap_type'],['conf','confidence_level']].map(([f,k]) =>
          <select key={f} className="border rounded p-2 text-sm" value={filters[f]} onChange={(e)=>setFilters({...filters,[f]:e.target.value})}>
            <option value="">All {k}</option>{uniq(k).map((v)=> <option key={v} value={v}>{v}</option>)}
          </select>
        )}
      </div>
      <div className="space-y-3">{filtered.map((r) => {
        const id = `${r.mapping_id}`;
        return <div key={id} className="border rounded-lg bg-white p-4">
          <button onClick={()=>setExpanded(expanded===id?null:id)} className="w-full text-left">
            <div className="font-semibold">{r.instrument} — {r.article}</div>
            <div>{r.article_title || 'Untitled obligation area'}</div>
            <div className="text-sm text-slate-600">{r.obligation_text_short}</div>
            <div className="text-xs text-slate-500 mt-1">{r.obligation_id}</div>
            <div className="mt-2 text-sm"><strong>Domestic anchor:</strong> {r.domestic_norm} / {r.domestic_article} / {r.domestic_provision_id}</div>
            <div className="text-sm"><strong>Anchoring:</strong> L{r.anchoring_level} · {r.match_type} · {r.gap_type} · {r.confidence_level} · {r.review_status}</div>
            <div className="text-xs text-slate-600">actor_fit {r.actor_fit} · procedure_fit {r.procedure_fit} · coordination_fit {r.coordination_fit} · enforcement_fit {r.enforcement_fit} · rights_safeguard_fit {r.rights_safeguard_fit} · federalism_fit {r.federalism_fit}</div>
          </button>
          {expanded===id && <div className="mt-3 text-sm space-y-1 border-t pt-2">
            <div><strong>Full obligation summary:</strong> {r.obligation_text_short}</div>
            <div><strong>Anchoring reason:</strong> {r.anchoring_reason || 'Not identified in current corpus'}</div>
            <div><strong>Minimum domestic requirement:</strong> {r.minimum_domestic_requirement || 'Not identified in current corpus'}</div>
            <div><strong>Implementation domain:</strong> {r.implementation_domain || 'Not identified in current corpus'}</div>
            <div><strong>Rights implications:</strong> {r.rights_implications || 'Not identified in current corpus'}</div>
            <div><strong>Federalism implications:</strong> {r.federalism_implications || 'Not identified in current corpus'}</div>
            <div><strong>Assessment summary:</strong> {r.assessment_summary}</div>
            <div><strong>Reviewer notes:</strong> {r.reviewer_notes}</div>
          </div>}
        </div>;
      })}</div>
    </>}

    {tab === 'ihr2024' && <table className="w-full bg-white border"><thead><tr>{['article_or_annex','type_of_change','new_or_modified_concept','change_summary','creates_new_domestic_requirement','modifies_existing_requirement','requires_legal_review','relevant_ihr2005_obligation_id'].map(h=><th className='p-2 text-left text-xs' key={h}>{h}</th>)}</tr></thead><tbody>{changes.map((r,i)=><tr key={i} className='border-t'>{['article_or_annex','type_of_change','new_or_modified_concept','change_summary','creates_new_domestic_requirement','modifies_existing_requirement','requires_legal_review','relevant_ihr2005_obligation_id'].map(k=><td className='p-2 text-sm' key={k}>{r[k]}</td>)}</tr>)}</tbody></table>}

    {tab === 'pa' && <div className='space-y-4'>
      <h3 className='font-semibold'>Pandemic Agreement</h3>
      <table className="w-full bg-white border"><thead><tr>{['article','theme','obligation_or_commitment_summary','legal_status','requires_domestic_legal_anchoring','possible_domestic_actor','implementation_domain','depends_on_pabs_annex','notes'].map(h=><th className='p-2 text-left text-xs' key={h}>{h}</th>)}</tr></thead><tbody>{pa.map((r,i)=><tr key={i} className='border-t'>{['article','theme','obligation_or_commitment_summary','legal_status','requires_domestic_legal_anchoring','possible_domestic_actor','implementation_domain','depends_on_pabs_annex','notes'].map(k=><td className='p-2 text-sm' key={k}>{r[k]}</td>)}</tr>)}</tbody></table>
      <h3 className='font-semibold'>PABS draft</h3>
      <table className="w-full bg-white border"><thead><tr>{['section','draft_element','draft_obligation_or_requirement_summary','provisional_legal_status','possible_domestic_actor','implementation_domain','depends_on_final_pabs_annex','notes'].map(h=><th className='p-2 text-left text-xs' key={h}>{h}</th>)}</tr></thead><tbody>{pabs.map((r,i)=><tr key={i} className='border-t'>{['section','draft_element','draft_obligation_or_requirement_summary','provisional_legal_status','possible_domestic_actor','implementation_domain','depends_on_final_pabs_annex','notes'].map(k=><td className='p-2 text-sm' key={k}>{r[k]}</td>)}</tr>)}</tbody></table>
    </div>}
  </div>;
}
