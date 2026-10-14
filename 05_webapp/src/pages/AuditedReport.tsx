import { useState } from 'react';
import { useCsvData, useJsonData } from '../hooks/useData';
import { AuditFacts, type AuditManifest } from '../components/AuditNotice';
export default function AuditedReport(){
 const {data:audit}=useJsonData<AuditManifest>('derived/audit_manifest.json');
 const {data:mapping}=useCsvData<any>('mexico_ihr2005_mapping_clean.csv');
 const [includeRows,setIncludeRows]=useState(false);
 return <div className="space-y-8 pb-16 max-w-5xl print:text-black">
  <header><h1 className="text-4xl font-bold">NormTrace-IHR · source correction report</h1><p className="mt-3">{audit?.audit_version} · {audit?.audit_date}</p><p className="mt-4">Preliminary, targeted source correction. No current aggregate legal score, compliance rate or complete-pathway count is certified.</p></header>
  <div className="print:hidden flex flex-wrap items-center gap-5"><button className="rounded-full bg-slate-900 text-white px-5 py-3" onClick={()=>window.print()}>Print / save report</button><label><input type="checkbox" checked={includeRows} onChange={e=>setIncludeRows(e.target.checked)} className="mr-2"/>Include correspondence-level review records</label><a className="underline text-blue-700" download href="/data/mexico_ihr2005_mapping_clean.csv">Download full CSV</a></div>
  <AuditFacts/>
  <section className="space-y-3"><h2 className="text-2xl font-semibold">Scope and pending work</h2><p>{audit?.scope}</p>{audit?.pending.map(p=><p key={p}>{p}</p>)}</section>
  <section className="space-y-3"><h2 className="text-2xl font-semibold">Mexico’s National IHR Authority</h2><p>{audit?.nia.note}</p><p>{audit?.nia.locator} · {audit?.nia.publication_date}</p></section>
  <section className="space-y-3"><h2 className="text-2xl font-semibold">Source references</h2>{audit?.sources.map(s=><p key={s.id} className="text-sm break-words"><strong>{s.id}</strong> · {s.locator}<br/><a className="underline text-blue-700" href={s.url}>{s.url}</a></p>)}</section>
  {includeRows&&<section className="space-y-5"><h2 className="text-2xl font-semibold">Correspondences</h2>{mapping.map(m=><article key={m.mapping_id} className="border-t py-4 break-inside-avoid"><h3 className="font-semibold">{m.obligation_id} · {m.domestic_article}</h3><p className="text-xs break-all">{m.mapping_id}</p><p>{m.domestic_norm}</p><p className="text-sm mt-2">{m.assessment_summary}</p><p className="text-sm mt-2">{m.audit_status} · {m.referral_status}. {m.anchoring_level===''?'Score pending.':'Historical coding retained, not revalidated.'}</p></article>)}</section>}
  <footer className="border-t pt-4 text-xs">This correction release is distinct from the earlier Zenodo archive DOI 10.5281/zenodo.20085170. See the release manifest and repository history for the corrected version. Reports must retain this limitation and source information.</footer>
 </div>;
}
