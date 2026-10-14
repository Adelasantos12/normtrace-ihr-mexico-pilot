import { Link } from 'react-router-dom';
import { useJsonData } from '../hooks/useData';
import { AuditFacts, AuditNotice, type AuditManifest } from '../components/AuditNotice';

export default function AuditRecord() {
 const {data,loading,error}=useJsonData<AuditManifest>('derived/audit_manifest.json');
 if(loading)return <p role="status">Loading correction record…</p>;
 if(error||!data)return <p role="alert">Unable to load the correction record.</p>;
 return <div className="space-y-8 max-w-5xl pb-16">
  <header><p className="text-sm text-blue-700">{data.audit_date} · {data.audit_version}</p><h1 className="text-4xl font-bold mt-2">Correction and review record</h1><p className="text-slate-600 mt-4 leading-relaxed">{data.scope}</p></header>
  <AuditNotice/><AuditFacts/>
  <section className="p-6 rounded-2xl bg-white border space-y-3"><h2 className="text-xl font-semibold">Mexico’s National IHR Authority</h2><p>{data.nia.note}</p><p className="text-sm text-slate-600">Status date: {data.nia.status_date}. Domestic entity: <strong>{data.nia.institution_identified??'not identified in the report'}</strong>. Domestic designation instrument: <strong>{data.nia.domestic_designation_instrument??'pending retrieval'}</strong>.</p><a className="underline text-blue-700" href={data.nia.source} target="_blank" rel="noreferrer">PAHO {data.nia.locator}</a></section>
  <section className="space-y-3"><h2 className="text-xl font-semibold">Sources used for the corrections</h2>{data.sources.map(s=><div className="border-b py-3" key={s.id}><a className="text-blue-700 underline break-words" href={s.url} target="_blank" rel="noreferrer">{s.id}: {s.locator}</a></div>)}<p className="text-sm text-slate-600">The 2012 PROY-NOM link used in the earlier audit was a consultation draft. The corrected records cite the final NOM published on 19 February 2013. Source identification was corrected as well as the mapping.</p></section>
  <section className="space-y-3"><h2 className="text-xl font-semibold">Pending legal work</h2>{data.pending.map(p=><p key={p} className="rounded-xl border-l-4 border-amber-300 bg-amber-50 p-4">{p}</p>)}</section>
  <section className="space-y-3"><h2 className="text-xl font-semibold">Earlier claims no longer published as findings</h2><ul className="list-disc pl-5 space-y-2">{data.withdrawn_claims.map(c=><li key={c}>{c}</li>)}</ul></section>
  <section className="space-y-3"><h2 className="text-xl font-semibold">Reproducibility</h2><p>Counts are generated from the corrected canonical tables. The manifest lists input hashes and each review cohort’s mapping and obligation identifiers. An obligation may appear in more than one cohort; cohorts must not be added as mutually exclusive deficit categories.</p><div className="flex flex-wrap gap-5"><a href="/data/derived/audit_manifest.json" download className="underline text-blue-700">Download manifest</a><a href="/data/mexico_ihr2005_mapping_clean.csv" download className="underline text-blue-700">Download corrected mappings</a><a href="/data/mexico_legal_provisions_clean.csv" download className="underline text-blue-700">Download provisions</a><a href="/data/derived/legally_described_relationships.csv" download className="underline text-blue-700">Download source-described notification path</a><Link to="/methodology" className="underline text-blue-700">Read the revised method</Link></div></section>
 </div>;
}
