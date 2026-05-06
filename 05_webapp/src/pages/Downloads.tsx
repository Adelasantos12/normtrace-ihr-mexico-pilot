import { Printer, FileText, Link as LinkIcon, ShieldAlert, Award } from 'lucide-react';

export function Downloads() {
  const version = "Mexico Pilot v0.1";
  const dateGenerated = "May 2026";
  const citation = `Santos, Adela. NormTrace-IHR Mexico Pilot v0.1: Legal Internalisation Mapping Infrastructure for International Health Regulations. Geneva/Mexico City: Preliminary expert review draft, 2026. DOI: TBD.`;

  return (
    <div className="space-y-12 pb-32">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">Report & Citation</h1>
        <p className="text-slate-500 max-w-2xl font-medium">
           NormTrace-IHR generated legal intelligence for the Mexico Pilot. Access full technical reports and citation metadata.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-12">
        <section className="space-y-6">
           <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm space-y-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                 <FileText size={32} />
              </div>
              <div className="space-y-2">
                 <h2 className="text-xl font-bold text-slate-900">Full Analytical Report</h2>
                 <p className="text-sm text-slate-500 leading-relaxed">
                    Generate a consolidated PDF report including the structural mapping results, anchoring distribution, and institutional gap analysis.
                 </p>
              </div>
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 py-4 bg-blue-700 text-white rounded-2xl font-bold hover:bg-blue-800 shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98]"
              >
                 <Printer size={18} /> Print / Save as PDF
              </button>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
                 <ShieldAlert size={16} className="text-slate-400 shrink-0 mt-0.5" />
                 <p className="text-[10px] text-slate-500 italic leading-relaxed">
                    The printed report will include all active dashboard views, mapping summaries, and methodology notes. Ensure background graphics are enabled in your browser print settings.
                 </p>
              </div>
           </div>
        </section>

        <section className="space-y-8">
           <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Award size={14} className="text-blue-500" />
                 Suggested Citation
              </h3>
              <div className="p-6 bg-slate-900 text-white rounded-[2rem] space-y-4 relative overflow-hidden">
                 <div className="text-xs font-serif leading-relaxed italic opacity-90 relative z-10">
                    "{citation}"
                 </div>
                 <button
                   onClick={() => navigator.clipboard.writeText(citation)}
                   className="text-[9px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
                 >
                    Copy Citation
                 </button>
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 Metadata & Versions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Version</p>
                    <p className="text-xs font-bold text-slate-800">{version}</p>
                 </div>
                 <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Generated</p>
                    <p className="text-xs font-bold text-slate-800">{dateGenerated}</p>
                 </div>
                 <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">DOI</p>
                    <p className="text-xs font-bold text-slate-400">TBD</p>
                 </div>
                 <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Repository</p>
                    <div className="flex items-center gap-1 text-blue-600">
                       <LinkIcon size={12} />
                       <span className="text-xs font-bold">GitHub</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-6 bg-amber-50 border border-amber-100 rounded-[2rem] space-y-2">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest">Access Note</h4>
              <p className="text-xs text-amber-900/70 leading-relaxed">
                 The underlying data package is not publicly downloadable in this version. Access may be granted for expert review or collaboration upon request.
              </p>
           </div>
        </section>
      </div>

      <footer className="pt-20 text-center">
         <div className="inline-block p-8 space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Infrastructure developed by</div>
            <div className="text-xl font-black text-slate-900">Adela Santos</div>
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">NormTrace-IHR</div>
         </div>
      </footer>
    </div>
  );
}
