import { Link } from 'react-router-dom';
import { ArrowRight, Network, Search, FileText } from 'lucide-react';
import { useJsonData } from '../hooks/useData';
import { AuditNotice } from '../components/AuditNotice';
export default function LandingPage() {
 const {data, loading, error}=useJsonData<any>('derived/audit_summary.json');
 const cards=[['obligations','Selected IHR 2005 obligations'],['provisions','Domestic provisions'],['instruments','Federal instruments']];
 return <main className="min-h-screen bg-slate-50 text-slate-900"><div className="max-w-5xl mx-auto px-6 py-10">
  <header className="flex justify-between items-center mb-8"><div><h2 className="font-bold text-xl">NormTrace-IHR</h2><p className="text-xs text-slate-500">Mexico · corrected preliminary pilot</p></div><Link to="/mapping" className="underline">Open mapping</Link></header>
  <AuditNotice />
  <section className="rounded-[20px] p-8 sm:p-12 bg-gradient-to-br from-slate-900 via-[#0c2a4a] to-[#1e3a5f] text-white space-y-6">
   <p className="text-sm text-sky-300">Legal-institutional traceability</p>
   <h1 className="text-4xl sm:text-5xl font-bold leading-tight">Follow the legal evidence<br/><span className="text-sky-300">behind IHR implementation</span></h1>
   <p className="text-base text-slate-200 max-w-3xl leading-relaxed">NormTrace links selected international health obligations to domestic provisions and the institutions mentioned in them. It keeps the sources, references and review questions visible so that each assessment can be examined and corrected.</p>
   <p className="text-sm text-slate-300 max-w-3xl">SPAR already asks countries to review national and subnational legal instruments. This pilot organizes provision-level evidence for that work. It does not measure operational performance or produce a verified compliance score.</p>
   <div className="flex flex-wrap gap-4"><Link to="/actors" className="bg-sky-500 rounded-full px-6 py-3 inline-flex items-center gap-2">Explore the network <ArrowRight size={18}/></Link><Link to="/audit" className="border border-slate-400 rounded-full px-6 py-3">Read the audit</Link></div>
  </section>
  {error && <p role="alert" className="mt-4">Dataset counts could not be loaded.</p>}
  <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8" aria-label="Dataset counts">{cards.map(([key,label])=><div key={key} className="rounded-2xl border bg-white p-6"><p className="text-3xl font-semibold">{loading ? '…' : data?.counts[key] ?? 'Unavailable'}</p><p className="text-sm text-slate-600 mt-2">{label}</p></div>)}</section>
  <p className="text-sm text-slate-600 mb-8">The 45-unit registry is a selected IHR 2005 baseline, not a claim to enumerate every legal duty in the IHR. The 2024 changes, Pandemic Agreement and PABS material have separate registries. Scope is federal; state laws, agreements and administrative practice are not comprehensively assessed.</p>
  <section className="grid sm:grid-cols-3 gap-5">{[
   {to:'/mapping',title:'Review the provisions',text:'Inspect each correspondence, current review status and the original coding.',Icon:Search},
   {to:'/actors',title:'Read the relationships',text:'Separate documentary associations from individually sourced legal duties.',Icon:Network},
   {to:'/methodology',title:'Understand the method',text:'Check the units, evidence boundaries and aggregation rules.',Icon:FileText}
  ].map(({to,title,text,Icon})=><Link key={to} to={to} className="bg-white border rounded-2xl p-6"><Icon className="mb-3 text-blue-700" size={24}/><h2 className="font-semibold">{title}</h2><p className="text-sm text-slate-600 mt-2">{text}</p></Link>)}</section>
  <section className="my-10 bg-white border rounded-2xl p-7 space-y-4"><h2 className="text-2xl font-semibold">What the source review changed</h2><p>The notification chain in NOM-017 and the declaration procedures in the international health regulation were more specific than several preliminary entries indicated. A reference to another document is now recorded as something to follow, not as proof that no procedure exists.</p><p>Mexico has reported designation or establishment of its National IHR Authority to PAHO. The cited report does not identify its domestic mandate. That distinction is recorded explicitly, without presuming the designated institution.</p><Link className="underline text-blue-700" to="/audit">Sources and correction history</Link></section>
  <footer className="text-xs text-slate-500">{data?.version} · Corrected source descriptions do not replace independent legal validation. Original release DOI: 10.5281/zenodo.20085170; this correction is not a new Zenodo deposit.</footer>
 </div></main>;
}
