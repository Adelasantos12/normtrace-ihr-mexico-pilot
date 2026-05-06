import { } from 'react';
import { Shield, AlertCircle, CheckCircle, Info, GitMerge, Activity, Users, BookOpen } from 'lucide-react';
import { getAnchoringLabel, getStatusLabel } from '../lib/utils';

export default function Methodology() {
  return (
    <div className="space-y-12 pb-20">
      <header className="space-y-4">
         <h1 className="text-3xl font-bold text-slate-900">Methodology & Audit Context</h1>
         <p className="text-slate-500 max-w-3xl">Structural analysis framework and verification status for the NormTrace-IHR Mexico Pilot.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-2 space-y-8">
            <section className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-sm space-y-6">
               <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <Shield size={24} className="text-blue-600" />
                  Audit Result: PASS_WITH_DOCUMENTED_FINDINGS
               </h3>
               <p className="text-slate-600 leading-relaxed">
                  The data package (v0.1) used in this webapp has undergone a pre-webapp repository audit. The audit confirmed the presence of all required fields and the integrity of the transformation pipeline.
                  Documented findings (L-01 to L-08) are treated as UI caveats and are detailed below.
               </p>

               <div className="grid grid-cols-1 gap-4 pt-4">
                  {[
                    { id: "L-01", label: "AI-Assisted Mapping", desc: "All rows marked as 'preliminary_ai_assisted' require substantive expert review by legal professionals." },
                    { id: "L-02", label: "PABS Provisionality", desc: "Information related to the PABS System is provisional and depends on the final Annex of the Pandemic Agreement." },
                    { id: "L-03", label: "Currency Verification", desc: "The RISS 2025 currency and source verification remains a substantive review item for legal teams." },
                    { id: "L-04", label: "Anchoring Scope", desc: "Anchoring levels represent formal legal formalization, not actual operational compliance or performance." },
                  ].map((finding, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                       <span className="font-mono text-xs font-bold text-blue-600 bg-white px-2 py-1 rounded-lg shadow-sm h-fit">{finding.id}</span>
                       <div>
                          <p className="font-bold text-slate-900 text-sm mb-1">{finding.label}</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{finding.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-sm space-y-8">
               <h3 className="text-xl font-bold text-slate-900">Legal Internalisation Framework</h3>

               <div className="space-y-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Activity size={14} className="text-blue-500" /> Anchoring Scale (0-5)
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                     {['0', '1', '2', '3', '4', '5'].map(level => (
                        <div key={level} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors group">
                           <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              L{level}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-800">{getAnchoringLabel(level)}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-6 pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <CheckCircle size={14} className="text-blue-500" /> Review Status Definitions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[
                       'preliminary_ai_assisted',
                       'requires_human_review',
                       'reviewed_by_researcher',
                       'validated'
                     ].map(status => (
                        <div key={status} className="p-4 border border-slate-100 rounded-xl">
                           <p className="text-xs font-bold text-slate-900 mb-1">{getStatusLabel(status)}</p>
                           <p className="text-[10px] text-slate-500 italic">Internal status: {status}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </section>
         </div>

         <div className="space-y-8">
            <div className="p-8 bg-blue-900 text-white rounded-[2rem] shadow-xl shadow-blue-100 space-y-6">
               <h3 className="font-bold text-lg">Data Integrity</h3>
               <div className="space-y-4">
                  <div className="flex gap-4">
                     <div className="p-2 bg-blue-800 rounded-lg shrink-0"><BookOpen size={16} /></div>
                     <div>
                        <p className="text-xs font-bold">No Reinterpretation</p>
                        <p className="text-[10px] text-blue-200 mt-1">The app does not modify underlying legal data or assessment summaries.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="p-2 bg-blue-800 rounded-lg shrink-0"><Users size={16} /></div>
                     <div>
                        <p className="text-xs font-bold">No New Mappings</p>
                        <p className="text-[10px] text-blue-200 mt-1">All mappings are derived strictly from the audited data package v0.1.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="p-2 bg-blue-800 rounded-lg shrink-0"><Shield size={16} /></div>
                     <div>
                        <p className="text-xs font-bold">Static Architecture</p>
                        <p className="text-[10px] text-blue-200 mt-1">No external APIs or databases. Data is bundled with the static build.</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm space-y-4">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Object Identifier</h4>
               <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs text-slate-400 text-center">
                  TBD: 10.5281/zenodo.0000000
               </div>
               <p className="text-[10px] text-slate-500 leading-relaxed text-center italic">
                  DOI will be assigned upon final validation of the Mexico Pilot dataset.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
