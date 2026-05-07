import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Gavel, Globe, Activity, CheckCircle, GitMerge } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-10 w-[100%] lg:w-[60%] h-[30%] lg:h-[40%] bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-[100px]" />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-10 lg:pt-20 pb-20 lg:pb-32">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16 lg:mb-24">
          <div className="flex items-center gap-3">
             <div className="p-2.5 lg:p-3 bg-blue-900 text-white font-black text-lg lg:text-xl tracking-tighter">NT-IHR</div>
             <div className="font-bold text-base lg:text-lg tracking-tight">NormTrace-IHR</div>
          </div>
          <div className="flex items-center gap-4 lg:gap-6 w-full sm:w-auto justify-between sm:justify-end">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mexico Pilot v0.1</span>
             <button
              onClick={() => navigate('/dashboard')}
              className="px-4 lg:px-5 py-2 bg-slate-900 text-white rounded-lg text-[10px] lg:text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-slate-200 whitespace-nowrap"
             >
               Launch Platform
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <div className="lg:col-span-7 space-y-6 lg:space-y-10">
            <div className="inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-blue-50 text-blue-700 rounded-full text-[10px] lg:text-xs font-bold border border-blue-100">
               <Shield size={14} /> Legal-Institutional Mapping Infrastructure
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] tracking-tight">
              Tracking the Domestic <br className="hidden sm:block" /> <span className="text-blue-700 underline decoration-blue-100 underline-offset-8">Internalisation</span> of IHR
            </h1>

            <p className="text-base lg:text-xl text-slate-500 leading-relaxed max-w-2xl font-medium">
              A structured intelligence interface for mapping international health obligations into Mexico's domestic legal corpus. Preliminary analysis for IHR (2005) and emerging pandemic instruments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
               <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-sm lg:text-base flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 group w-full sm:w-auto"
               >
                 Explore Mapping <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </button>
               <button
                onClick={() => navigate('/methodology')}
                className="px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-sm lg:text-base hover:bg-slate-50 transition-all w-full sm:w-auto"
               >
                 Methodology
               </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
             <div className="bg-slate-50 border border-slate-200 rounded-[2rem] lg:rounded-[2.5rem] p-8 lg:p-10 shadow-2xl space-y-6 lg:space-y-8 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200/20 rounded-full blur-3xl" />

                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Platform Components</h3>

                <div className="space-y-5 lg:space-y-6">
                   {[
                     { icon: GitMerge, title: "Obligation Mapping", desc: "IHR 2005 & 2024 Amendments", color: "text-blue-600" },
                     { icon: Gavel, title: "Corpus Analysis", desc: "Constitución & Ley General de Salud", color: "text-indigo-600" },
                     { icon: Activity, title: "Anchoring Scale", desc: "Statutory vs. Administrative analysis", color: "text-emerald-600" },
                     { icon: Globe, title: "Actor Network", desc: "Federal Health Governance layers", color: "text-amber-600" },
                   ].map((item, i) => (
                     <div key={i} className="flex gap-4 lg:gap-5 group">
                        <div className="p-2.5 lg:p-3 bg-white border border-slate-100 rounded-xl lg:rounded-2xl shadow-sm group-hover:border-blue-200 transition-colors shrink-0">
                           <item.icon size={18} className={item.color} />
                        </div>
                        <div>
                           <p className="font-bold text-sm lg:text-base text-slate-900 group-hover:text-blue-700 transition-colors">{item.title}</p>
                           <p className="text-[11px] lg:text-xs text-slate-500 font-medium">{item.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        <div className="mt-20 lg:mt-32 pt-10 lg:pt-12 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
           <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Status</h4>
              <div className="flex items-center gap-2 text-red-700 font-bold text-xs bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 w-fit">
                 <CheckCircle size={14} /> PASS_WITH_FINDINGS
              </div>
           </div>
           <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data Package</h4>
              <p className="text-xs font-bold text-slate-700 italic">v0.1 Mexico Pilot</p>
           </div>
           <div className="sm:col-span-2 lg:col-span-2 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Disclaimers</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                 Preliminary legal-institutional mapping. Does not assess legal compliance. Not legal advice. All rows marked preliminary_ai_assisted require expert review. PABS-related information is provisional.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
