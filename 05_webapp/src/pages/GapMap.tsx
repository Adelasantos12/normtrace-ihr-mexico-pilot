import { useCsvData } from '../hooks/useData';
import { Loader2, AlertCircle, Info, ShieldCheck, } from 'lucide-react';
import { cn } from '../lib/utils';

interface GapRow {
  area: string;
  current_ihr2005_anchoring_pattern: string;
  main_mexico_actors: string;
  main_gap_type: string;
  ihr2024_implication: string;
  pandemic_agreement_implication: string;
  pabs_dependency: string;
  capacity_building_entry_point: string;
  confidence_level: string;
  review_status: string;
}

export function GapMap() {
  const { data, loading, error } = useCsvData<GapRow>('mexico_implementation_gap_map_clean.csv');

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg flex gap-2"><AlertCircle /> Error loading gap map data</div>;

  return (
    <div className="space-y-10 pb-20">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">Implementation Gap Map</h1>
        <p className="text-slate-500 max-w-4xl">
           Policy-facing summary of anchoring patterns and identified institutional gaps. This map identifies where Mexico's current legal architecture provides strong anchors and where update-review pressure exists from IHR 2024 and the Pandemic Agreement.
        </p>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-48">Functional Area</th>
                <th className="p-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-64">Current IHR 2005 Anchoring</th>
                <th className="p-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-48">Main Actor(s)</th>
                <th className="p-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-48 text-center">Gap Type</th>
                <th className="p-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-64">2024 & PA Implications</th>
                <th className="p-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-64">Entry Point</th>
                <th className="p-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32 text-center">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors align-top">
                  <td className="p-5">
                    <div className="font-bold text-sm text-blue-950 leading-tight">{row.area}</div>
                    {row.review_status === 'preliminary_ai_assisted' && (
                       <div className="mt-2 text-[8px] font-bold text-amber-600 uppercase tracking-tighter">Expert validation pending</div>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="text-xs font-semibold text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                       "{row.current_ihr2005_anchoring_pattern}"
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="text-[10px] text-slate-600 font-bold bg-white border border-slate-200 px-2 py-1 rounded shadow-sm inline-block mb-1">
                       {row.main_mexico_actors}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase tracking-tight border border-blue-100">
                       {row.main_gap_type}
                    </span>
                  </td>
                  <td className="p-5 space-y-3">
                    <div className="space-y-1">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">IHR 2024</p>
                       <p className="text-[10px] text-slate-600 leading-relaxed">{row.ihr2024_implication}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pandemic Agreement</p>
                       <p className="text-[10px] text-slate-600 leading-relaxed">{row.pandemic_agreement_implication}</p>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-start gap-2">
                       <div className="p-1.5 bg-green-100 text-green-700 rounded shadow-sm shrink-0 mt-0.5">
                          <ShieldCheck size={12} />
                       </div>
                       <p className="text-xs font-bold text-blue-900 leading-tight group">
                          {row.capacity_building_entry_point}
                       </p>
                    </div>
                  </td>
                  <td className="p-5 text-center group relative">
                    <div className={cn(
                      "inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold uppercase cursor-help",
                      row.confidence_level === 'high' ? "bg-green-600 text-white" :
                      row.confidence_level === 'medium' ? "bg-amber-500 text-white" : "bg-red-500 text-white"
                    )}>
                       {row.confidence_level.charAt(0).toUpperCase()}
                    </div>
                    {/* Tooltip emulation */}
                    <div className="hidden group-hover:block absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl">
                       <p className="font-bold mb-1 uppercase tracking-widest">{row.confidence_level} Confidence</p>
                       <p className="italic opacity-80 leading-relaxed">
                          {row.confidence_level === 'high' ? "Direct or corroborated textual basis in current corpus." :
                           row.confidence_level === 'medium' ? "Plausible but indirect or partial basis." :
                           "Limited corpus evidence or major review need."}
                       </p>
                       <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4 items-start">
         <Info size={20} className="text-blue-600 shrink-0 mt-1" />
         <div className="space-y-1">
            <h4 className="text-sm font-bold text-blue-900">About Gap Map Confidence</h4>
            <p className="text-xs text-blue-800 leading-relaxed">
               Confidence reflects the mapping team's certainty in the legal interpretation. <strong>High confidence</strong> indicates a direct or corroborated textual basis in the current Mexican legal corpus. <strong>Medium confidence</strong> suggests a plausible but indirect or partial basis. <strong>Low confidence</strong> indicates limited corpus evidence or an area identified as a major review need.
            </p>
         </div>
      </div>
    </div>
  );
}
