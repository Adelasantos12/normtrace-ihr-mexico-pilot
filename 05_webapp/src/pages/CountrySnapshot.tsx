import { Link } from 'react-router-dom';
import { useCsvData, useMarkdownData } from '../hooks/useData';

export default function CountrySnapshot() {
  const { data: corpus } = useCsvData<any>('mexico_normative_corpus_index_clean.csv');
  const { data: mapping } = useCsvData<any>('mexico_ihr2005_mapping_clean.csv');
  const { data: prov } = useCsvData<any>('mexico_legal_provisions_clean.csv');
  const { data: actors } = useCsvData<any>('mexico_health_governance_actors_clean.csv');
  const { data: gaps } = useCsvData<any>('mexico_implementation_gap_map_clean.csv');
  const { content: appendix } = useMarkdownData('mexico_legal_internalisation_snapshot.md');

  const obligations = new Set(mapping.map((m:any)=>m.obligation_id)).size;
  const byLevel: Record<string, number> = {};
  mapping.forEach((m:any)=>byLevel[m.anchoring_level]=(byLevel[m.anchoring_level]||0)+1);

  return <div className='space-y-6 pb-20'>
    <header>
      <h1 className='text-3xl font-bold'>Mexico: Legal Internalisation Profile for Pandemic Governance</h1>
      <p className='text-slate-600'>IHR 2005 baseline, IHR 2024 update pressure, and Pandemic Agreement / PABS readiness.</p>
    </header>
    <div className='grid grid-cols-2 md:grid-cols-6 gap-2 text-sm'>
      <div className='bg-white border rounded p-2'>Version: Mexico Pilot v0.1</div><div className='bg-white border rounded p-2'>Corpus: {corpus.length}</div><div className='bg-white border rounded p-2'>IHR 2005 obligations mapped: {obligations}</div><div className='bg-white border rounded p-2'>Domestic provisions extracted: {prov.length}</div><div className='bg-white border rounded p-2'>Actors profiled: {actors.length}</div><div className='bg-white border rounded p-2'>Status: Preliminary expert-review version</div>
    </div>
    <div className='grid md:grid-cols-3 gap-3'>{['Legal anchoring baseline','Institutional responsibility chain','Update-review needs for IHR 2024 and Pandemic Agreement'].map(t=><div key={t} className='bg-white border rounded p-4 font-medium'>{t}</div>)}</div>
    <section className='bg-white border rounded p-4'><h2 className='font-semibold mb-2'>Anchoring profile (identified anchoring pattern)</h2><table className='w-full text-sm'><thead><tr><th className='text-left'>Anchoring level</th><th className='text-left'>Number of mappings</th><th className='text-left'>Interpretation</th></tr></thead><tbody>{Object.keys(byLevel).sort().map(k=><tr key={k}><td>L{k}</td><td>{byLevel[k]}</td><td>identified anchoring pattern</td></tr>)}</tbody></table></section>
    <section className='grid md:grid-cols-3 gap-3'>
      <div className='bg-white border rounded p-3'><h3 className='font-semibold'>Stronger anchoring areas</h3><ul className='list-disc pl-5 text-sm'>{gaps.filter((g:any)=>String(g.current_ihr2005_anchoring_pattern||'').includes('L4')||String(g.current_ihr2005_anchoring_pattern||'').includes('L5')).slice(0,6).map((g:any,i:number)=><li key={i}>{g.area}</li>)}</ul></div>
      <div className='bg-white border rounded p-3'><h3 className='font-semibold'>Partial anchoring areas</h3><ul className='list-disc pl-5 text-sm'>{gaps.filter((g:any)=>String(g.current_ihr2005_anchoring_pattern||'').includes('L2')||String(g.current_ihr2005_anchoring_pattern||'').includes('L3')).slice(0,6).map((g:any,i:number)=><li key={i}>{g.area}</li>)}</ul></div>
      <div className='bg-white border rounded p-3'><h3 className='font-semibold'>Review-sensitive areas</h3><ul className='list-disc pl-5 text-sm'>{gaps.filter((g:any)=>String(g.main_gap_type||'').toLowerCase()!=='none').slice(0,8).map((g:any,i:number)=><li key={i}>{g.area} — {g.main_gap_type}</li>)}</ul></div>
    </section>
    <section className='bg-white border rounded p-4'><h2 className='font-semibold'>Institutional checklist preview</h2><table className='w-full text-sm'><thead><tr><th>Area</th><th>IHR / PA reference</th><th>Main domestic anchor</th><th>Anchoring pattern</th><th>Review need</th></tr></thead><tbody>{mapping.slice(0,8).map((m:any,i:number)=><tr key={i}><td>{m.obligation_id}</td><td>{m.obligation_id}</td><td>{m.domestic_norm}</td><td>L{m.anchoring_level}</td><td>{m.gap_type}</td></tr>)}</tbody></table></section>
    <section className='bg-white border rounded p-4'><h2 className='font-semibold'>Key actors</h2><div className='flex flex-wrap gap-2'>{['Secretaría de Salud','DGE / SINAVE','CSG','COFEPRIS','SRE','SEGOB / INM','entidades federativas','Congress / oversight actors'].map(a=><span key={a} className='px-3 py-1 border rounded-full text-sm'>{a} · role in IHR mapping / requires review</span>)}</div></section>
    <section className='grid md:grid-cols-3 gap-3'>{['IHR 2024: update-review pressure','Pandemic Agreement: domestic governance readiness','PABS: provisional until final annex'].map(t=><div key={t} className='bg-white border rounded p-4'>{t}</div>)}</section>
    <section className='bg-slate-50 border rounded p-3 text-sm'>Preliminary legal-institutional mapping. Corpus-limited. Not a compliance assessment. Not legal advice. Requires expert validation.</section>
    <div className='flex gap-2'><Link className='px-3 py-2 border rounded bg-white' to='/mapping'>View IHR mapping</Link><Link className='px-3 py-2 border rounded bg-white' to='/gap-map'>View implementation gap map</Link><Link className='px-3 py-2 border rounded bg-white' to='/report'>Build printable report</Link></div>
    <details className='bg-white border rounded p-4'><summary className='cursor-pointer font-medium'>View technical appendix</summary><pre className='whitespace-pre-wrap text-xs mt-3'>{appendix}</pre></details>
  </div>;
}
