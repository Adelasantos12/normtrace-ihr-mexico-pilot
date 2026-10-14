import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCsvData } from '../hooks/useData';

type Row = Record<string, string>;
export function instrumentKind(name: string): string {
  const n = name.toLocaleLowerCase();
  if (n.includes('constituci')) return 'Constitutional text';
  if (n.includes('reglamento')) return 'Regulation';
  if (n.includes('nom-') || n.includes('norma oficial') || n.includes('acuerdo')) return 'Technical / administrative instrument';
  if (n.startsWith('ley ')) return 'Statute';
  return name ? 'Other instrument' : 'No candidate in this dataset';
}
export default function EvidenceWorksheet({view}: {view: 'pipeline' | 'diagnostic'}) {
 const {data: mapping, loading, error}=useCsvData<Row>('mexico_ihr2005_mapping_clean.csv');
 const {data: obligations, loading: ol, error: oe}=useCsvData<Row>('ihr_2005_obligations_clean.csv');
 const {data: refs}=useCsvData<Row>('mexico_legal_references_clean.csv');
 const [search,setSearch]=useState(''); const [onlyPending,setOnlyPending]=useState(false);
 const groups=useMemo(()=>obligations.map(o=>({o,rows:mapping.filter(r=>r.obligation_id===o.obligation_id)})),[mapping,obligations]);
 const filtered=groups.filter(({o,rows})=>(!onlyPending || rows.some(r=>r.score_status==='withheld_pending_legal_review')) && `${o.obligation_id} ${o.article} ${o.article_title} ${rows.map(r=>`${r.domestic_norm} ${r.domestic_article}`).join(' ')}`.toLowerCase().includes(search.toLowerCase()));
 if(loading||ol) return <p role="status">Loading legal evidence…</p>;
 if(error||oe) return <p role="alert">Legal evidence could not be loaded.</p>;
 return <div className="space-y-6 pb-16"><header><p className="text-sm text-blue-700">Documentary review workspace</p><h1 className="text-4xl font-bold mt-2">{view==='pipeline'?'Obligation pathways':'Evidence review by obligation'}</h1><p className="text-slate-600 mt-3 max-w-4xl">{view==='pipeline'?'Follow the candidate provisions and their legal references. Instrument types are descriptive, not mandatory stages through which every obligation must pass.':'Review the records behind each obligation. No automatic finding of adequacy, fragmentation, legal absence or required legislation is made from a score, an instrument’s age, or its legal form.'}</p></header>
 <div className="border rounded-xl p-5 bg-white flex flex-col sm:flex-row gap-4"><label className="flex-1">Search article, obligation or instrument<input className="block w-full border rounded-lg p-3 mt-1" value={search} onChange={e=>setSearch(e.target.value)}/></label><label className="flex items-center gap-2"><input type="checkbox" checked={onlyPending} onChange={e=>setOnlyPending(e.target.checked)}/> Scoring withheld after source review</label></div>
 <p className="text-sm text-slate-600">Showing {filtered.length} of {groups.length} selected obligations. Labels from different records can overlap; they are not mutually exclusive diagnoses.</p>
 {filtered.map(({o,rows})=><details key={o.obligation_id} className="border rounded-xl bg-white p-5"><summary className="cursor-pointer font-semibold">{o.article} · {o.article_title || o.obligation_id}<span className="block text-xs font-normal text-slate-500 mt-1">{o.obligation_id} · {rows.length} mapping records · {rows.filter(r=>r.anchoring_level==='').length} unscored</span></summary><div className="mt-5 space-y-4"><p className="text-sm">{o.obligation_text}</p>{rows.map(r=><article className="border-l-4 border-blue-200 pl-4 space-y-2" key={r.mapping_id}><p className="text-xs uppercase text-blue-800">{instrumentKind(r.domestic_norm)}</p><h2 className="font-medium">{r.domestic_norm || 'No candidate currently recorded'} · {r.domestic_article}</h2><p className="text-xs break-all text-slate-500">{r.mapping_id} → {r.domestic_provision_id}</p><p className="text-sm">{r.assessment_summary}</p><p className="text-xs">Review: {r.audit_status}; {r.gap_type}. {r.anchoring_level===''?'Score withheld; this is not zero.':`Legacy L${r.anchoring_level}; not revalidated.`}</p>{r.audit_source_url && <a href={r.audit_source_url} className="text-sm underline" target="_blank" rel="noreferrer">Check source</a>}</article>)}
 {refs.filter(ref=>rows.some(r=>r.domestic_provision_id===ref.source_provision_id)).map((ref,i)=><div className="rounded-lg bg-amber-50 p-4 text-sm" key={i}>{Object.entries(ref).map(([k,v])=><p key={k}><strong>{k.replaceAll('_',' ')}:</strong> {v}</p>)}</div>)}
 <Link className="text-sm underline" to="/mapping">Open full mapping records</Link></div></details>)}
 {!filtered.length && <p>No obligations match this selection.</p>}
 <p className="text-sm text-slate-600">A candidate provision is not a conclusion of full legal sufficiency. A missing candidate is a corpus finding, not proof of a legal vacuum. <Link className="underline" to="/audit">Audit and aggregation rules</Link>.</p></div>;
}
