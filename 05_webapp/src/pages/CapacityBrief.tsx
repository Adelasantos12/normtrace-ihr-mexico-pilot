import { useMemo, useState } from 'react';
import {
  Info, Shield, Activity, Target, Zap, ArrowRight, BookOpen,
  MapPin, Users, DollarSign, Package, ChevronRight, AlertTriangle,
  Download, ExternalLink, FileSpreadsheet, CheckCircle2, ListFilter
} from 'lucide-react';
import { useCsvData, useMarkdownData } from '../hooks/useData';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

export default function CapacityBrief() {
  const { content, loading } = useMarkdownData('mexico_capacity_building_entry_points.md');
  const { data: mapping } = useCsvData<any>('mexico_ihr2005_mapping_clean.csv');
  const [openSection, setOpenSection] = useState<string | null>('Purpose');

  const evidenceMetrics = {
    corpus: '18 federal instruments',
    provisions: '110 provisions',
    ihr2005: '45 obligations',
    ihr2024: '57 changes',
    pandemicAgreement: '83 obligations',
    pabs: '38 provisional',
    gaps: '19 entries'
  };

  const strategicPriorities = [
    {
      title: 'Points of entry and traveller safeguards',
      why: 'Legacy regulations (1985) require alignment with modern IHR digital and procedural requirements.',
      domestic: 'Sanidad Internacional Regulation / LGS',
      international: 'IHR 2005 Part IV / IHR 2024 Annex 1',
      status: 'High priority',
      validation: 'Review inter-agency SOPs vs. statutory mandates',
      icon: MapPin,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Intersectoral coordination',
      why: 'IHR functions are distributed across multiple ministries without a unifying statutory framework.',
      domestic: 'LOAPF / General Health Law / RISS',
      international: 'IHR 2005 Art. 4 / IHR 2024 implementation layer',
      status: 'Medium priority',
      validation: 'Assess coordination committee legal status',
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Sustainable IHR financing / planning',
      why: 'Lack of explicit legal anchoring for IHR capacity maintenance in multi-year budget cycles.',
      domestic: 'LFPRH / Ley de Planeación',
      international: 'IHR 2024 Art. 44 (New financing obligation)',
      status: 'Medium priority',
      validation: 'Map IHR core capacities to PEF budget lines',
      icon: DollarSign,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: 'PABS and health product readiness',
      why: 'Preparation for Pandemic Agreement requires mapping domestic benefit-sharing and access pathways.',
      domestic: 'New regulatory framework required',
      international: 'Pandemic Agreement Arts. 10-13 / PABS Annex',
      status: 'Provisional',
      validation: 'Cross-reference COFEPRIS mandates with PA draft',
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      caveat: 'Provisional — pending final normative consolidation.'
    }
  ];

  const entryPoints = useMemo(() => {
    if (!content) return [];
    const sections = content.split(/###\s+/).slice(1);
    return sections.map(s => {
      const [title, ...rest] = s.split('\n');
      return { title: title.trim(), body: rest.join('\n').trim() };
    });
  }, [content]);

  const toggleSection = (s: string) => setOpenSection(openSection === s ? null : s);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Activity className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="space-y-12 pb-24">
      <header className="space-y-6">
        <div className="flex items-center justify-between gap-4">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-900 rounded-xl text-white">
                  <Target size={24} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Capacity-Building Entry Points</h1>
              </div>
              <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">
                Priority legal-institutional areas for strengthening pandemic governance in the Mexico IHR context.
              </p>
           </div>
           <div className="flex flex-col gap-2 shrink-0">
              <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                 <Download size={14} /> Download Brief
              </button>
              <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-all">
                 <FileSpreadsheet size={14} /> Export Evidence Table
              </button>
           </div>
        </div>
      </header>

      <section className="space-y-6">
        <div className="space-y-1">
           <div className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-widest text-xs">
              <Zap size={16} className="text-amber-500" />
              Strategic Review Priorities
           </div>
           <p className="text-xs text-slate-500 max-w-2xl">
              These priorities are derived from corpus-based legal-institutional traceability, IHR obligation mapping,
              and implementation gap coding. They identify areas for expert review and capacity-building dialogue, not legal findings.
           </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {strategicPriorities.map((card, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 hover:border-blue-200 transition-all group flex flex-col">
               <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors mb-2", card.bg, card.color)}>
                 <card.icon size={24} />
               </div>
               <div className="space-y-2 flex-1">
                 <h3 className="font-bold text-slate-900 leading-tight">{card.title}</h3>
                 <p className="text-[10px] text-slate-500 leading-relaxed"><span className="font-bold text-slate-700">Why it matters:</span> {card.why}</p>
               </div>
               <div className="pt-4 border-t border-slate-50 space-y-3">
                 <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Domestic Layer</div>
                    <div className="text-[10px] font-medium text-slate-700">{card.domestic}</div>
                 </div>
                 <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">International Layer</div>
                    <div className="text-[10px] font-medium text-slate-700">{card.international}</div>
                 </div>
                 <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Review Status</div>
                    <div className={cn(
                      "text-[10px] font-bold",
                      card.status === 'High priority' ? "text-red-600" : "text-blue-600"
                    )}>{card.status}</div>
                 </div>
                 <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Suggested Validation</div>
                    <div className="text-[9px] text-slate-600 leading-tight italic">{card.validation}</div>
                 </div>
                 {card.caveat && (
                    <div className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                       {card.caveat}
                    </div>
                 )}
               </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section className="space-y-4">
             <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                {[
                  { id: 'Purpose', title: 'Purpose', icon: Info, content: 'This Capacity-Building Entry Points brief identifies structural legal-institutional opportunities for strengthening pandemic governance. It serves as a tool for dialogue between legal experts, health authorities, and international partners.' },
                  { id: 'Audience', title: 'Intended Audience', icon: Users, content: 'Primary: National IHR Focal Points, Health Legal Offices, WHO/PAHO technical teams. Secondary: Legislative research units, inter-sectoral coordination committees, and civil society oversight bodies.' },
                  { id: 'Evidence', title: 'Evidence Base', icon: Shield, content: 'Derived from the NormTrace-IHR Mexico Pilot corpus (v0.1), comprising 18 federal instruments and 110/111 identified legal provisions cross-referenced against IHR 2005 and 2024 update layers.' },
                  { id: 'Limits', title: 'What this document does not do', icon: AlertTriangle, content: 'This document does not provide legal advice, judicial interpretation, compliance scores, or official reform recommendations. It is an AI-assisted analytical infrastructure for expert review.' },
                  { id: 'Status', title: 'Review Status', icon: CheckCircle2, content: 'PRELIMINARY — Requires validation by qualified Mexican constitutional and administrative legal experts.' }
                ].map(s => (
                  <div key={s.id} className="border-b border-slate-100 last:border-none">
                     <button
                       onClick={() => toggleSection(s.id)}
                       className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                     >
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                              <s.icon size={16} />
                           </div>
                           <span className="font-bold text-slate-900">{s.title}</span>
                        </div>
                        <ChevronRight size={18} className={cn("text-slate-300 transition-transform", openSection === s.id && "rotate-90")} />
                     </button>
                     {openSection === s.id && (
                       <div className="px-16 pb-6 pt-2 text-sm text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                          {s.content}
                       </div>
                     )}
                  </div>
                ))}
             </div>
          </section>

          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Capacity-Building Entry Points</h2>
                <div className="flex gap-2">
                   <button className="p-2 bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"><ListFilter size={16} /></button>
                </div>
             </div>
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
        </div>

        <aside className="lg:col-span-4 space-y-6">
           <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Evidence Basis</h3>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Corpus', val: evidenceMetrics.corpus },
                   { label: 'Provisions', val: evidenceMetrics.provisions },
                   { label: 'IHR 2005', val: evidenceMetrics.ihr2005 },
                   { label: 'IHR 2024', val: evidenceMetrics.ihr2024 },
                   { label: 'Pandemic Ag.', val: evidenceMetrics.pandemicAgreement },
                   { label: 'PABS Draft', val: evidenceMetrics.pabs },
                   { label: 'Gap Map', val: evidenceMetrics.gaps }
                 ].map(m => (
                   <div key={m.label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[9px] font-bold text-slate-400 uppercase">{m.label}</div>
                      <div className="text-xs font-black text-slate-900">{m.val}</div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Target Audience</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'National IHR Focal Points', 'Public health legal offices',
                  'WHO / PAHO', 'IPU', 'Legislative Units', 'Ministries of Health'
                ].map(t => (
                  <span key={t} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                    {t}
                  </span>
                ))}
              </div>
           </div>

           <div className="bg-blue-900 text-white rounded-3xl p-8 shadow-xl space-y-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                 <Shield size={20} className="text-blue-300" />
                 Analytical Support
              </h3>
              <p className="text-xs text-blue-200 leading-relaxed">
                 Access the full NormTrace-IHR methodology to understand the legal-institutional traceability logic.
              </p>
              <a href="/methodology" className="flex items-center justify-between group p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors">
                 <span className="text-sm font-bold">View Methodology</span>
                 <ExternalLink size={18} className="group-hover:scale-110 transition-transform" />
              </a>
           </div>

           <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
              <AlertTriangle size={18} className="text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-800 leading-relaxed">
                <strong>Precise Disclaimer:</strong> This brief identifies review and capacity-building entry points.
                It does not provide legal advice, compliance findings, judicial interpretation,
                or official reform recommendations.
              </p>
           </div>
        </aside>
      </div>
    </div>
  );
}
