import { useCsvData } from '../hooks/useData';
import {
  Loader2,
  AlertCircle,
  Shield,

  CheckCircle,
  AlertTriangle,
  Search,
  ArrowUpRight,
  Printer
} from 'lucide-react';

import { useMemo } from 'react';

interface MappingRow {
  obligation_id: string;
  article: string;
  article_title: string;
  anchoring_level: string;
  domestic_norm: string;
  gap_type: string;
}

export function CountrySnapshot() {
  const { data: mappingData, loading: mLoading } = useCsvData<MappingRow>('mexico_ihr2005_mapping_clean.csv');
  const { data: gapData, loading: gLoading } = useCsvData<any>('mexico_implementation_gap_map_clean.csv');

  const snapshot = useMemo(() => {
    if (!mappingData.length) return null;

    const strong = mappingData.filter(m => parseInt(m.anchoring_level) >= 4);
    const partial = mappingData.filter(m => parseInt(m.anchoring_level) === 3);
    const review = mappingData.filter(m => parseInt(m.anchoring_level) <= 2);

    return {
      total: mappingData.length,
      strong,
      partial,
      review,
      gaps: gapData.length
    };
  }, [mappingData, gapData]);

  if (mLoading || gLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  if (!snapshot) return <div className="p-8 text-red-600 bg-red-50 rounded-lg flex gap-2"><AlertCircle /> Error loading snapshot data</div>;

  return (
    <div className="space-y-12 pb-20 print:p-0">
      <header className="flex justify-between items-start">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">Mexico: Legal Internalisation Profile</h1>
          <p className="text-slate-500 max-w-2xl font-medium">
             This snapshot provides a policy-facing overview of Mexico's institutional readiness for pandemic governance, derived from the structural mapping of international health obligations against the domestic legal architecture.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="print:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm transition-all"
        >
          <Printer size={16} /> Print Full Report
        </button>
      </header>

      {/* Key Findings Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-8 bg-blue-900 text-white rounded-[2rem] space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Baseline Mapped</h3>
            <div className="flex items-baseline gap-2">
               <span className="text-5xl font-extrabold">{snapshot.total}</span>
               <span className="text-blue-300 font-bold uppercase text-[10px]">IHR 2005 Obligations</span>
            </div>
            <p className="text-xs text-blue-200 leading-relaxed italic border-t border-blue-800 pt-4">
               Baseline mapping identifies domestic anchors for core IHR capacities within the current Mexican framework.
            </p>
         </div>

         <div className="p-8 bg-white border border-slate-200 rounded-[2rem] space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Anchoring Distribution</h3>
            <div className="space-y-3">
               <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Strong (L4-L5)</span>
                  <span>{Math.round((snapshot.strong.length/snapshot.total)*100)}%</span>
               </div>
               <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-blue-600 flex items-center gap-1"><Shield size={14} /> Partial (L3)</span>
                  <span>{Math.round((snapshot.partial.length/snapshot.total)*100)}%</span>
               </div>
               <div className="flex justify-between items-center text-xs font-bold text-amber-600">
                  <span className="flex items-center gap-1"><AlertTriangle size={14} /> Review Needed</span>
                  <span>{Math.round((snapshot.review.length/snapshot.total)*100)}%</span>
               </div>
            </div>
         </div>

         <div className="p-8 bg-slate-100 rounded-[2rem] space-y-4 shadow-sm border border-slate-200/50">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Update Pressure</h3>
            <div className="text-center space-y-2">
               <p className="text-4xl font-black text-slate-900">{snapshot.gaps}</p>
               <p className="text-[10px] font-bold text-slate-500 uppercase">Implementation Gap Areas</p>
            </div>
            <p className="text-[10px] text-slate-500 text-center leading-relaxed font-medium">
               Identified areas requiring legal-institutional update under IHR 2024 and Pandemic Agreement readiness.
            </p>
         </div>
      </div>

      {/* Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Stronger Anchoring */}
         <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
               <div className="w-2 h-2 bg-green-500 rounded-full" />
               Stronger Anchoring Areas
            </h3>
            <div className="space-y-3">
               {snapshot.strong.slice(0, 5).map((m, i) => (
                  <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                     <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">{m.article_title || m.obligation_id}</div>
                     <div className="text-[10px] text-slate-500 font-medium">{m.domestic_norm}</div>
                  </div>
               ))}
            </div>
         </div>

         {/* Partial Anchoring */}
         <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
               <div className="w-2 h-2 bg-blue-500 rounded-full" />
               Partial Anchoring Areas
            </h3>
            <div className="space-y-3">
               {snapshot.partial.slice(0, 5).map((m, i) => (
                  <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                     <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">{m.article_title || m.obligation_id}</div>
                     <div className="text-[10px] text-slate-500 font-medium">{m.domestic_norm}</div>
                  </div>
               ))}
            </div>
         </div>

         {/* Review Sensitive */}
         <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
               <div className="w-2 h-2 bg-amber-500 rounded-full" />
               Review-Sensitive Areas
            </h3>
            <div className="space-y-3">
               {snapshot.review.slice(0, 5).map((m, i) => (
                  <div key={i} className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                     <div className="text-[10px] font-bold text-amber-700 uppercase mb-1">{m.article_title || m.obligation_id}</div>
                     <div className="text-[10px] text-amber-600 font-bold">{m.gap_type || "Structural review required"}</div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Checklist Preview */}
      <section className="space-y-8 bg-white border border-slate-200 rounded-[3rem] p-12 shadow-sm">
         <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Search className="text-blue-600" size={24} />
            Institutional Checklist Preview
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {[
               { area: "National IHR Focal Point / Authority", status: "Administrative", anchor: "RI-SS-2025 Art. 35", gap: "Procedural clarity needed" },
               { area: "Epidemiological Surveillance", status: "Strong Statutory", anchor: "LGS Art. 134 / NOM-017", gap: "Data privacy updates" },
               { area: "Points of Entry (Sanidad Internacional)", status: "Statutory", anchor: "LGS Art. 17 Bis / Art. 293", gap: "Person vs. Goods coordination" },
               { area: "Equitable Access / Health Products", status: "Partial", anchor: "LGS Art. 17 Bis 12 Ter", gap: "Fast-track authorization rules" },
               { area: "PABS-related Readiness", status: "TBD / Provisional", anchor: "None identified", gap: "Final PABS Annex dependency" },
               { area: "Intersectoral Coordination", status: "Administrative", anchor: "LGS Art. 7", gap: "Operational mechanism gap" },
            ].map((item, i) => (
               <div key={i} className="flex gap-4 group">
                  <div className="w-1 bg-slate-100 rounded-full group-hover:bg-blue-400 transition-all shrink-0" />
                  <div className="space-y-1 py-1">
                     <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.area}</p>
                     <div className="flex flex-wrap gap-2 pt-1">
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter">Status: {item.status}</span>
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded uppercase tracking-tighter">Anchor: {item.anchor}</span>
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-tighter">Gap: {item.gap}</span>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </section>

      <div className="flex justify-center pt-6">
         <button className="flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors uppercase tracking-widest">
            Read full technical documentation <ArrowUpRight size={14} />
         </button>
      </div>
    </div>
  );
}
