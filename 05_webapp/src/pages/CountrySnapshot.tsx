import { } from 'react';
import {
  FileText, CheckCircle, AlertCircle, Info, Shield,
  Globe, Activity, TrendingUp, Search
} from 'lucide-react';
import { useMarkdownData } from '../hooks/useData';
import ReactMarkdown from 'react-markdown';

export default function CountrySnapshot() {
  const { content, loading, error } = useMarkdownData('mexico_legal_internalisation_snapshot.md');

  if (loading) return <div className="flex justify-center py-20"><Activity className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-12 pb-20">
      <header className="space-y-4">
         <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-900 text-white font-black text-xl tracking-tighter">MEX-PROFILE</div>
            <h1 className="text-3xl font-bold text-slate-900">Mexico Legal Internalisation Snapshot</h1>
         </div>
         <p className="text-slate-500 max-w-3xl">Strategic overview of Mexico's structural readiness and legal anchoring for international health obligations.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
           <div className="p-12 prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
              <ReactMarkdown>{content}</ReactMarkdown>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="p-8 bg-blue-900 text-white rounded-[2rem] shadow-xl shadow-blue-100 space-y-6">
              <h3 className="font-bold text-lg">Structural Summary</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center border-b border-blue-800 pb-3">
                    <span className="text-xs text-blue-300 uppercase tracking-widest font-bold">Anchoring Baseline</span>
                    <span className="text-sm font-bold">Level 3 (Partial)</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-blue-800 pb-3">
                    <span className="text-xs text-blue-300 uppercase tracking-widest font-bold">Primary Authority</span>
                    <span className="text-sm font-bold">SSA / CSG</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-blue-800 pb-3">
                    <span className="text-xs text-blue-300 uppercase tracking-widest font-bold">IHR NFP Liaison</span>
                    <span className="text-sm font-bold">DGE / SINAVE</span>
                 </div>
              </div>
              <div className="p-4 bg-blue-800/50 rounded-xl flex gap-3 border border-blue-700">
                 <Info size={16} className="text-blue-300 shrink-0 mt-0.5" />
                 <p className="text-[10px] text-blue-100 leading-relaxed italic">
                    Analysis derived from federal corpus index v0.1. Methodology summary available in the Methodology section.
                 </p>
              </div>
           </div>

           <div className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                 <Activity size={18} className="text-blue-600" />
                 Readiness Checklist
              </h3>
              <div className="space-y-4">
                 {[
                   { label: "Surveillance Statutory Basis", status: "Verified (LGS/RI-SS)" },
                   { label: "NFP Focal Point Designation", status: "Verified (RI-SS Art 35)" },
                   { label: "International Sanitary Control", status: "Requires Update (1985 Reg)" },
                   { label: "PABS Material Sharing", status: "Provisional (Corpus Pending)" },
                 ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start">
                       <CheckCircle size={14} className={item.status.includes('Verified') ? "text-emerald-500" : "text-slate-300"} />
                       <div>
                          <p className="text-[10px] font-bold text-slate-900">{item.label}</p>
                          <p className="text-[10px] text-slate-500">{item.status}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="p-8 bg-amber-50 border border-amber-100 rounded-[2rem] space-y-4">
              <div className="flex items-center gap-2 text-amber-800">
                 <AlertCircle size={18} />
                 <h4 className="font-bold text-sm">Critical Caveat</h4>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                 The <strong>Reglamento de Sanidad Internacional (1985)</strong> remains the primary operational instrument but significantly predates IHR (2005). Statutory alignment review is a high-priority entry point.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
