import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useJsonData } from '../hooks/useData';
import { AuditNotice } from '../components/AuditNotice';
interface SparContext {
 indicator_label:string;scope_note:string;history_note:string;data_provenance:string;
 display_trajectory:{year:number;value:number}[];
 sources:{title:string;url:string}[];
}
export default function SparBridge(){
 const {data,loading,error}=useJsonData<SparContext>('derived/spar_normtrace_divergence.json');
 if(loading)return <p role="status">Loading SPAR context…</p>;
 if(error||!data)return <p role="alert">SPAR context could not be loaded.</p>;
 return <div className="space-y-8 pb-16">
  <header><p className="text-sm text-blue-700">Different evidence, not interchangeable scores</p><h1 className="text-4xl font-bold mt-2">SPAR and legal traceability</h1><p className="mt-4 text-lg text-slate-600 max-w-4xl">{data.scope_note}</p></header>
  <AuditNotice/>
  <section className="rounded-2xl border bg-white p-6 space-y-4"><h2 className="text-xl font-semibold">What SPAR already asks</h2><p>In the second edition, indicator C1.1 includes national and subnational legal analysis/mapping and review of gaps. C2.1 addresses the focal point’s mandate and functions. NormTrace’s contribution is to organize source-linked correspondences for inspection, not to claim that legal review is absent from SPAR.</p><p>No difference between SPAR and NormTrace is calculated here. Earlier “divergence” cards and the legal-score reference line have been withdrawn.</p></section>
  <section className="space-y-4"><h2 className="text-xl font-semibold">Mexico’s reported legal capacity · SPAR second edition</h2><p className="text-sm text-slate-600">{data.indicator_label}. Only 2021–2025 observations are shown together. These are reported capacity observations, not independently verified measurements of operational performance.</p>
   <div className="h-72 w-full rounded-2xl bg-white border p-4" role="img" aria-label="Mexico SPAR legal capacity observations for 2021 to 2025; exact values are in the table below."><ResponsiveContainer width="100%" height="100%"><LineChart data={data.display_trajectory} margin={{top:10,right:20,bottom:10,left:0}}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="year"/><YAxis domain={[0,100]} unit="%"/><Tooltip/><Line dataKey="value" name="SPAR reported legal capacity" type="linear" stroke="#2563eb" isAnimationActive={false} connectNulls={false}/></LineChart></ResponsiveContainer></div>
   <div className="overflow-x-auto"><table className="w-full text-sm border-collapse"><caption className="text-left py-2">Reported values from the pilot’s SPAR source table</caption><thead><tr className="border-b"><th className="p-3 text-left" scope="col">Year</th><th className="p-3 text-left" scope="col">Reported capacity (%)</th></tr></thead><tbody>{data.display_trajectory.map(r=><tr className="border-b" key={r.year}><th scope="row" className="p-3 text-left font-normal">{r.year}</th><td className="p-3">{r.value}</td></tr>)}</tbody></table></div>
   <p className="text-sm text-slate-600">{data.history_note}</p><p className="text-xs text-slate-500">{data.data_provenance}</p>
  </section>
  <section className="space-y-3"><h2 className="text-xl font-semibold">Primary sources</h2>{data.sources.map(s=><p key={s.url}><a href={s.url} target="_blank" rel="noreferrer" className="underline text-blue-700">{s.title}</a></p>)}</section>
 </div>;
}
