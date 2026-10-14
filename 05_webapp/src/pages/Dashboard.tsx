import { useJsonData, useCsvData } from '../hooks/useData';
import { Link } from 'react-router-dom';
import { InstrumentsPanel } from '../InstrumentsPanel';
export default function Dashboard(){
 const {data,loading,error}=useJsonData<any>('derived/audit_summary.json');
 const {data:corpus}=useCsvData<any>('mexico_normative_corpus_index_clean.csv');
 if(loading)return <p role="status">Loading dataset overview…</p>;
 if(error||!data)return <p role="alert">Dataset overview could not be loaded.</p>;
 const c=data.counts;
 return <div className="space-y-8 pb-16"><header><p className="text-sm text-blue-700">{data.version}</p><h1 className="text-4xl font-bold mt-2">Mexico dataset overview</h1><p className="text-slate-600 mt-3">Corpus coverage and review status. These counts describe the dataset, not national preparedness or confirmed legal gaps.</p></header>
 <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{[['Selected IHR 2005 obligations',c.obligations],['Domestic provisions',c.provisions],['Federal instruments',c.instruments],['Obligation–provision records',c.mapping_rows],['Actor inventory entries',c.actor_entries],['Records with scores withheld',c.unscored_mapping_rows]].map(([label,value])=><div className="bg-white border rounded-xl p-5" key={label}><p className="text-3xl font-semibold">{value}</p><p className="text-sm text-slate-600 mt-2">{label}</p></div>)}</div>
 <InstrumentsPanel instruments={corpus}/><section className="bg-white border rounded-xl p-6 space-y-3"><h2 className="text-xl font-semibold">Review labels and their obligation IDs</h2><p className="text-sm">These sets overlap. Labels inherited from the pilot remain preliminary; a source correction does not validate an entire obligation.</p>{Object.entries(data.labels_to_obligation_ids).map(([label,ids]:[string,any])=><details key={label} className="border-t pt-3"><summary className="cursor-pointer">{label} · {ids.length} distinct obligation IDs</summary><p className="text-xs mt-3 break-words">{ids.join(', ')}</p></details>)}</section>
 <section className="bg-blue-50 border rounded-xl p-6"><h2 className="text-xl font-semibold mb-3">What is not calculated</h2><p>No revised aggregate anchoring score, SPAR-minus-NormTrace difference, or count of complete legal pathways is published. Unscored records are never assigned zero.</p><p className="mt-3"><Link className="underline" to="/audit">Read the audit</Link> · <Link className="underline" to="/mapping">Review a record</Link> · <Link className="underline" to="/actors">Inspect source associations</Link></p></section></div>;
}
