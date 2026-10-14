import { useMemo } from 'react';
import { useCsvData } from '../hooks/useData';

export default function ReportPrint() {
  const { data: mapping } = useCsvData<any>('mexico_ihr2005_mapping_clean.csv');
  const { data: gaps } = useCsvData<any>('mexico_implementation_gap_map_clean.csv');
  const { data: actors } = useCsvData<any>('mexico_health_governance_actors_clean.csv');
  // Article + title per obligation_id -- same identifier convention as
  // Normative Pipeline and Norm Diagnostic, never the bare id alone.
  const { data: obligations } = useCsvData<any>('ihr_2005_obligations_clean.csv');
  const oblMap = useMemo(() => {
    const m: Record<string, any> = {};
    obligations.forEach((o: any) => { if (o.obligation_id) m[o.obligation_id.trim()] = o; });
    return m;
  }, [obligations]);
  const summary = useMemo(()=>({mapped:new Set(mapping.map((m:any)=>m.obligation_id)).size, rows:mapping.length, actors:actors.length}),[mapping,actors]);
  return <div className='max-w-5xl mx-auto bg-white p-8 print:p-4'>
    <style>{`@media print {.no-print{display:none}.print-section{break-before: page;} .card{break-inside: avoid;} body{background:white}}`}</style>
    <div className='no-print mb-4'><button onClick={()=>window.print()} className='border px-3 py-2 rounded'>Print report</button></div>
    <section className='card border p-6'><h1 className='text-3xl font-bold'>NormTrace-IHR Mexico · 0.2.0-audit.20261014</h1><p>Source-corrected preliminary dataset; expert validation not completed</p></section>
    <section className='print-section card border p-6 mt-6'><h2 className='font-semibold'>Executive summary</h2><p>Legal-institutional mapping of IHR-related obligations and domestic anchors.</p></section>
    <section className='print-section card border p-6 mt-6'><h2 className='font-semibold'>Dashboard metrics</h2><p>Obligations mapped: {summary.mapped} | Mapping rows: {summary.rows} | Actors profiled: {summary.actors}</p></section>
    <section className='print-section card border p-6 mt-6'><h2 className='font-semibold'>IHR 2005 mapping records ({mapping.length} rows)</h2><p>Includes every record. Findings are corpus-limited, labels may overlap, and source corrections are not full legal validation.</p><table className='w-full text-sm'><thead><tr><th>IHR Obligation</th><th>Norm</th><th>Legacy coding</th><th>Review label</th></tr></thead><tbody>{mapping.map((m:any,i:number)=><tr key={i}><td>{oblMap[m.obligation_id]?.article || m.obligation_id}{oblMap[m.obligation_id]?.article_title ? ` · ${oblMap[m.obligation_id].article_title}` : ''}</td><td>{m.domestic_norm}</td><td>{m.anchoring_level === '' ? 'Unscored; not zero' : `Legacy L${m.anchoring_level}`}</td><td>{m.gap_type}</td></tr>)}</tbody></table></section>
    <section className='print-section card border p-6 mt-6'><h2 className='font-semibold'>Thematic review questions</h2><table className='w-full text-sm'><tbody>{gaps.map((g:any,i:number)=><tr key={i}><td>{g.area}</td><td>{g.main_gap_type}</td></tr>)}</tbody></table></section>
    <footer className='mt-8 text-xs text-slate-500'>NormTrace-IHR Mexico · 0.2.0-audit.20261014 | Source-corrected preliminary dataset; expert validation not completed</footer>
  </div>;
}
