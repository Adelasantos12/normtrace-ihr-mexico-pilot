import { } from 'react';
import {
  Info, Shield, Activity, Target, Zap, ArrowRight, BookOpen
} from 'lucide-react';
import { useMarkdownData } from '../hooks/useData';
import ReactMarkdown from 'react-markdown';

export default function CapacityBrief() {
  const { content, loading, error } = useMarkdownData('mexico_capacity_building_entry_points.md');

  if (loading) return <div className="flex justify-center py-20"><Activity className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-12 pb-20">
      <header className="space-y-4">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg text-white">
              <Target size={24} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Capacity-Building Entry Points</h1>
         </div>
         <p className="text-slate-500 max-w-3xl italic">Policy-facing identification of priority areas for institutional and legal strengthening in the Mexico IHR context.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-6">
           <div className="p-8 bg-slate-900 text-white rounded-[2rem] shadow-xl space-y-6 sticky top-8">
              <h3 className="font-bold text-lg flex items-center gap-2">
                 <Zap size={20} className="text-emerald-400" />
                 At a Glance
              </h3>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Primary Focus</p>
                    <p className="text-sm font-medium leading-relaxed">Statutory realignment of legacy instruments with modern IHR (2024) obligations.</p>
                 </div>

                 <div className="space-y-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">High Impact Areas</p>
                    {[
                      "Points of Entry Regulatory Update",
                      "Intersectoral Governance Framing",
                      "Sustainable IHR Financing",
                      "PABS System Readiness"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs font-medium border-l-2 border-emerald-500/30 pl-4 py-1">
                        {item}
                      </div>
                    ))}
                 </div>

                 <div className="pt-4 border-t border-slate-800">
                    <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                       <p className="text-[10px] text-emerald-100 leading-relaxed italic">
                          This brief identifies where NormTrace analysis maps directly to practical capacity-building interventions.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
              <div className="p-12 prose prose-slate max-w-none
                prose-headings:text-slate-900 prose-headings:font-black
                prose-h2:text-2xl prose-h2:border-b prose-h2:pb-4 prose-h2:mt-12
                prose-p:text-slate-600 prose-p:leading-relaxed
                prose-li:text-slate-600 prose-strong:text-blue-900">
                 <ReactMarkdown>{content}</ReactMarkdown>
              </div>
           </div>

           <div className="flex justify-between items-center p-8 bg-slate-50 border border-slate-100 rounded-[2rem]">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                    <BookOpen size={20} />
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-900 text-sm">Mapping Explorer</h4>
                    <p className="text-[10px] text-slate-500">Dive deeper into specific obligation-norm mappings.</p>
                 </div>
              </div>
              <a href="/mapping" className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:gap-4 transition-all">
                 Explore Mappings <ArrowRight size={14} />
              </a>
           </div>
        </div>
      </div>
    </div>
  );
}
