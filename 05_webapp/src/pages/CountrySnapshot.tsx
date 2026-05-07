import { Link } from 'react-router-dom';
import { useCsvData, useMarkdownData } from '../hooks/useData';
import {
  FileText, Shield, Users, Activity, AlertTriangle, ChevronRight,
  ArrowRight, CheckCircle2, Globe, FileBarChart, Info
} from 'lucide-react';
import { cn } from '../lib/utils';

const ANCHORING_DEFINITIONS: any = {
  '0': 'No identifiable anchor in current corpus',
  '1': 'Actor mention or contextual reference',
  '2': 'Indirect / administrative-operational anchoring',
  '3': 'Partial statutory or regulatory anchoring',
  '4': 'Strong statutory-administrative anchoring',
  '5': 'Integrated implementation anchoring'
};

export default function CountrySnapshot() {
  const { data: corpus } = useCsvData<any>('mexico_normative_corpus_index_clean.csv');
  const { data: mapping } = useCsvData<any>('mexico_ihr2005_mapping_clean.csv');
  const { data: prov } = useCsvData<any>('mexico_legal_provisions_clean.csv');
  const { data: actors } = useCsvData<any>('mexico_health_governance_actors_clean.csv');
  const { data: gaps } = useCsvData<any>('mexico_implementation_gap_map_clean.csv');
  const { content: appendix } = useMarkdownData('mexico_legal_internalisation_snapshot.md');

  const obligations = new Set(mapping.map((m: any) => m.obligation_id)).size;
  const byLevel: Record<string, number> = {};
  mapping.forEach((m: any) => {
    const l = String(m.anchoring_level);
    byLevel[l] = (byLevel[l] || 0) + 1;
  });

  const snapshotMetrics = [
    { label: 'Version', value: 'Mexico Pilot v0.1' },
    { label: 'Corpus Count', value: corpus.length },
    { label: 'IHR 2005 Obligations', value: obligations },
    { label: 'Domestic Provisions', value: prov.length },
    { label: 'Actors Profiled', value: actors.length },
    { label: 'Status', value: 'Preliminary Review' }
  ];

  const purposes = [
    {
      title: 'Legal anchoring baseline',
      desc: 'Shows where IHR 2005 obligations can be traced in Mexico’s domestic legal corpus.',
      icon: Shield,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Institutional responsibility chain',
      desc: 'Identifies legally relevant actors, competences and coordination points.',
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Update-review needs',
      desc: 'Flags areas where IHR 2024 and Pandemic Agreement/PABS developments may require review.',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ];

  return (
    <div className="space-y-10 pb-24">
      <header className="space-y-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mexico: Legal Internalisation Profile for Pandemic Governance</h1>
        <p className="text-lg text-slate-600 max-w-4xl">
          IHR 2005 baseline, IHR 2024 update pressure, and Pandemic Agreement/PABS readiness.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {snapshotMetrics.map((m, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{m.label}</div>
              <div className="text-sm font-black text-slate-900">{m.value}</div>
            </div>
          ))}
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
           <Info size={20} className="text-blue-600" /> What this snapshot shows
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {purposes.map((p, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", p.bg, p.color)}>
                <p.icon size={20} />
              </div>
              <h3 className="font-bold text-slate-900">{p.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-10">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Anchoring Profile</h2>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-bold text-slate-600">Level</th>
                  <th className="text-left p-4 font-bold text-slate-600">Mappings</th>
                  <th className="text-left p-4 font-bold text-slate-600">Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {['0','1','2','3','4','5'].map(l => (
                  <tr key={l} className={cn("hover:bg-slate-50/50 transition-colors", !byLevel[l] && "opacity-40")}>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-black border",
                        parseInt(l) >= 4 ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        parseInt(l) >= 2 ? "bg-blue-50 text-blue-700 border-blue-100" :
                        parseInt(l) >= 1 ? "bg-amber-50 text-amber-700 border-amber-100" :
                        "bg-slate-50 text-slate-500 border-slate-200"
                      )}>
                        L{l}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{byLevel[l] || 0}</td>
                    <td className="p-4 text-xs text-slate-600">{ANCHORING_DEFINITIONS[l]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Institutional Salience</h2>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
             <div>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Key Actors</h3>
               <div className="flex flex-wrap gap-2">
                 {[
                   'Secretaría de Salud', 'CSG', 'DGE/SINAVE', 'COFEPRIS',
                   'SRE', 'SEGOB/INM', 'Entidades federativas', 'Congress'
                 ].map(a => (
                   <span key={a} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                     {a}
                   </span>
                 ))}
               </div>
             </div>

             <div className="pt-6 border-t border-slate-100">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Stronger Anchoring Areas</h3>
               <div className="space-y-2">
                 {gaps.filter((g: any) => String(g.current_ihr2005_anchoring_pattern || '').includes('L4') || String(g.current_ihr2005_anchoring_pattern || '').includes('L5')).length > 0 ? (
                   gaps.filter((g: any) => String(g.current_ihr2005_anchoring_pattern || '').includes('L4') || String(g.current_ihr2005_anchoring_pattern || '').includes('L5')).slice(0, 4).map((g: any, i: number) => (
                     <div key={i} className="flex items-center gap-3 text-xs text-slate-600 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                       {g.area}
                     </div>
                   ))
                 ) : (
                   <div className="text-xs text-slate-400 italic">Not identified in current corpus.</div>
                 )}
               </div>
             </div>
          </div>
        </section>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Institutional Checklist Preview</h2>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-bold text-slate-600">Area</th>
                  <th className="text-left p-4 font-bold text-slate-600">IHR/PA Reference</th>
                  <th className="text-left p-4 font-bold text-slate-600">Main Domestic Anchor</th>
                  <th className="text-left p-4 font-bold text-slate-600">Pattern</th>
                  <th className="text-left p-4 font-bold text-slate-600">Review Need</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mapping.slice(0, 8).map((m: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{m.article_title || m.obligation_id}</td>
                    <td className="p-4 text-xs font-medium text-slate-500">{m.obligation_id}</td>
                    <td className="p-4 text-xs">{m.domestic_norm}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold">
                        L{m.anchoring_level}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold",
                        m.gap_type !== 'none' ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-slate-50 text-slate-500"
                      )}>
                        {m.gap_type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="bg-slate-900 rounded-[2rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-black">Policy Analysis Suite</h2>
          <p className="text-slate-400 text-sm">Dive deeper into specific legal intelligence layers or build a tailored report.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link to="/mapping" className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors flex items-center gap-2">
            Mapping Explorer <ArrowRight size={16} />
          </Link>
          <Link to="/report" className="px-6 py-3 border border-slate-700 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center gap-2">
            <FileBarChart size={16} /> Report Builder
          </Link>
        </div>
      </div>

      <div className="p-6 bg-slate-100 border border-slate-200 rounded-2xl flex gap-4 items-start">
        <AlertTriangle className="text-slate-400 shrink-0 mt-0.5" size={18} />
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong>Limits:</strong> Preliminary legal-institutional mapping. Corpus-limited. Not a compliance assessment.
          Not legal advice. Requires expert validation.
        </p>
      </div>

      <details className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm group">
        <summary className="cursor-pointer p-6 flex items-center justify-between hover:bg-slate-50 transition-colors list-none font-bold text-slate-900">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-slate-400" />
            Technical Appendix
          </div>
          <ChevronRight size={18} className="text-slate-400 group-open:rotate-90 transition-transform" />
        </summary>
        <div className="px-6 pb-6 pt-2 border-t border-slate-100">
          <pre className="whitespace-pre-wrap text-xs text-slate-600 bg-slate-50 p-6 rounded-xl border border-slate-100 font-mono">
            {appendix}
          </pre>
        </div>
      </details>
    </div>
  );
}
