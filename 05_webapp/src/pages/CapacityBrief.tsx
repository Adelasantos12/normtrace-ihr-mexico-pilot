import { useMemo } from 'react';
import {
  Info, Shield, Activity, Target, Zap, ArrowRight, BookOpen,
  MapPin, Users, DollarSign, Package, ChevronRight, AlertTriangle
} from 'lucide-react';
import { useCsvData, useMarkdownData } from '../hooks/useData';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

export default function CapacityBrief() {
  const { content, loading } = useMarkdownData('mexico_capacity_building_entry_points.md');
  const { data: mapping } = useCsvData<any>('mexico_ihr2005_mapping_clean.csv');

  const executiveCards = [
    {
      title: 'Points of entry and traveller safeguards',
      why: 'Legacy regulations (1985) require alignment with modern IHR digital and procedural requirements.',
      instrument: 'Sanidad Internacional Regulation',
      review: 'High priority',
      icon: MapPin,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Intersectoral coordination',
      why: 'IHR functions are distributed across multiple ministries without a unifying statutory framework.',
      instrument: 'General Health Law / RISS',
      review: 'Medium priority',
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Sustainable IHR financing / planning',
      why: 'Lack of explicit legal anchoring for IHR capacity maintenance in multi-year budget cycles.',
      instrument: 'Public Finance / Health Law',
      review: 'Medium priority',
      icon: DollarSign,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: 'PABS and health product readiness',
      why: 'Preparation for Pandemic Agreement requires mapping domestic benefit-sharing and access pathways.',
      instrument: 'New Pandemic Agreement layer',
      review: 'Provisional',
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ];

  const entryPoints = useMemo(() => {
    if (!content) return [];
    // Basic extraction from markdown if structured by # or ##
    const sections = content.split(/###\s+/).slice(1);
    return sections.map(s => {
      const [title, ...rest] = s.split('\n');
      return { title: title.trim(), body: rest.join('\n').trim() };
    });
  }, [content]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Activity className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="space-y-12 pb-24">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-900 rounded-xl text-white">
            <Target size={24} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Capacity-Building Entry Points</h1>
        </div>
        <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">
          Priority legal-institutional areas for strengthening pandemic governance in the Mexico IHR context.
        </p>
      </header>

      <section className="space-y-6">
        <div className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-widest text-xs">
           <Zap size={16} className="text-amber-500" />
           Executive Focus
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {executiveCards.map((card, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 hover:border-blue-200 transition-all group">
               <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", card.bg, card.color)}>
                 <card.icon size={24} />
               </div>
               <div className="space-y-2">
                 <h3 className="font-bold text-slate-900 leading-tight">{card.title}</h3>
                 <p className="text-[10px] text-slate-500 leading-relaxed">{card.why}</p>
               </div>
               <div className="pt-4 border-t border-slate-50 space-y-2">
                 <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Related Layer</div>
                    <div className="text-[10px] font-medium text-slate-700">{card.instrument}</div>
                 </div>
                 <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Review Status</div>
                    <div className={cn(
                      "text-[10px] font-bold",
                      card.review === 'High priority' ? "text-red-600" : "text-blue-600"
                    )}>{card.review}</div>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <section className="space-y-6">
             <h2 className="text-xl font-bold text-slate-900">Priority Entry Points</h2>
             <div className="space-y-4">
               {entryPoints.length > 0 ? entryPoints.map((ep, i) => (
                 <div key={i} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-3">
                       <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs">{i + 1}</span>
                       {ep.title}
                    </h3>
                    <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-p:text-slate-600">
                       <ReactMarkdown>{ep.body}</ReactMarkdown>
                    </div>
                 </div>
               )) : (
                 <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm prose prose-slate max-w-none">
                    <ReactMarkdown>{content}</ReactMarkdown>
                 </div>
               )}
             </div>
          </section>

          <section className="space-y-6">
             <h2 className="text-xl font-bold text-slate-900">Capacity-Building Matrix</h2>
             <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
               <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-4 font-bold text-slate-600">Entry Point</th>
                        <th className="text-left p-4 font-bold text-slate-600">IHR 2005</th>
                        <th className="text-left p-4 font-bold text-slate-600">IHR 2024</th>
                        <th className="text-left p-4 font-bold text-slate-600">Review Need</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {mapping.slice(0, 6).map((m: any, i: number) => (
                         <tr key={i} className="hover:bg-slate-50/50">
                           <td className="p-4 font-bold text-slate-800">{m.article_title || 'IHR Priority Area'}</td>
                           <td className="p-4"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">L{m.anchoring_level}</span></td>
                           <td className="p-4 text-xs text-slate-600">High impact</td>
                           <td className="p-4"><span className="text-[10px] font-bold text-amber-600">{m.gap_type}</span></td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
               </div>
             </div>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-6">
           <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
              <h3 className="text-sm font-bold text-slate-900">Target Audience</h3>
              <div className="flex flex-wrap gap-2">
                {['WHO / PAHO', 'IPU', 'National Delegations', 'Legislative Units', 'Ministries of Health'].map(t => (
                  <span key={t} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                    {t}
                  </span>
                ))}
              </div>
           </div>

           <div className="bg-blue-900 text-white rounded-3xl p-8 shadow-xl space-y-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                 <BookOpen size={20} className="text-blue-300" />
                 Policy Navigation
              </h3>
              <p className="text-xs text-blue-200 leading-relaxed">
                 Explore the full legal-institutional mapping to identify specific provision-level gaps.
              </p>
              <a href="/mapping" className="flex items-center justify-between group p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors">
                 <span className="text-sm font-bold">Mapping Explorer</span>
                 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
           </div>

           <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
              <AlertTriangle size={18} className="text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-800 leading-relaxed">
                <strong>Limits:</strong> This brief identifies review and capacity-building entry points. It does not provide legal advice, compliance findings or formal reform recommendations.
              </p>
           </div>
        </aside>
      </div>
    </div>
  );
}
