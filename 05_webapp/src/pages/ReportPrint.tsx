import { useMemo } from 'react';
import { useCsvData } from '../hooks/useData';

export default function ReportPrint() {
  const { data: mapping } = useCsvData<any>('mexico_ihr2005_mapping_clean.csv');
  const { data: gaps } = useCsvData<any>('mexico_implementation_gap_map_clean.csv');
  const { data: actors } = useCsvData<any>('mexico_health_governance_actors_clean.csv');
  const summary = useMemo(()=>({mapped:new Set(mapping.map((m:any)=>m.obligation_id)).size, rows:mapping.length, actors:actors.length}),[mapping,actors]);
  return <div className='max-w-5xl mx-auto bg-white p-8 print:p-4'>
    <style>{`@media print {.no-print{display:none}.print-section{break-before: page;} .card{break-inside: avoid;} body{background:white}}`}</style>
    <div className='no-print mb-4'><button onClick={()=>window.print()} className='border px-3 py-2 rounded'>Print report</button></div>
    <section className='card border p-6'><h1 className='text-3xl font-bold'>NormTrace-IHR Mexico Pilot v0.1</h1><p>Preliminary expert-review version</p></section>
    <section className='print-section card border p-6 mt-6'><h2 className='font-semibold'>Executive summary</h2><p>Legal-institutional mapping of IHR-related obligations and domestic anchors.</p></section>
    <section className='print-section card border p-6 mt-6'><h2 className='font-semibold'>Dashboard metrics</h2><p>Obligations mapped: {summary.mapped} | Mapping rows: {summary.rows} | Actors profiled: {summary.actors}</p></section>
    <section className='print-section card border p-6 mt-6'><h2 className='font-semibold'>IHR 2005 mapping summary</h2><table className='w-full text-sm'><thead><tr><th>ID</th><th>Norm</th><th>L</th><th>Gap</th></tr></thead><tbody>{mapping.slice(0,30).map((m:any,i:number)=><tr key={i}><td>{m.obligation_id}</td><td>{m.domestic_norm}</td><td>{m.anchoring_level}</td><td>{m.gap_type}</td></tr>)}</tbody></table></section>
    <section className='print-section card border p-6 mt-6'><h2 className='font-semibold'>Implementation gap map</h2><table className='w-full text-sm'><tbody>{gaps.slice(0,20).map((g:any,i:number)=><tr key={i}><td>{g.area}</td><td>{g.main_gap_type}</td></tr>)}</tbody></table></section>
    <footer className='mt-8 text-xs text-slate-500'>NormTrace-IHR Mexico Pilot v0.1 | Preliminary expert-review version</footer>
  </div>;
}
