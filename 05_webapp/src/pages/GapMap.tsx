
import { useCsvData } from '../hooks/useData';
import { Loader2 } from 'lucide-react';
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
  const { data, loading } = useCsvData<GapRow>('mexico_implementation_gap_map_clean.csv');

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Implementation Gap Map</h1>
        <p className="text-slate-500">Policy-facing summary of anchoring patterns and identified gaps</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase w-48">Area</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Current Pattern & Gap</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">2024 & PA Implications</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">PABS & Entry Points</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors align-top">
                  <td className="p-4">
                    <div className="font-bold text-sm text-blue-900 leading-tight">{row.area}</div>
                    <div className="text-[10px] text-slate-500 mt-2 uppercase font-semibold">Main Actors</div>
                    <div className="text-[10px] text-slate-600">{row.main_mexico_actors}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs text-slate-700 font-semibold">Anchoring: {row.current_ihr2005_anchoring_pattern}</div>
                    <div className="text-xs text-slate-600 mt-1 italic">Gap: {row.main_gap_type}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs text-slate-700 font-medium underline decoration-blue-200 decoration-2">IHR 2024:</div>
                    <div className="text-xs text-slate-600 italic mb-2">{row.ihr2024_implication}</div>
                    <div className="text-xs text-slate-700 font-medium underline decoration-blue-200 decoration-2">PA:</div>
                    <div className="text-xs text-slate-600 italic">{row.pandemic_agreement_implication}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs text-slate-700 font-medium">PABS Dependency:</div>
                    <div className="text-xs text-slate-600 italic mb-2">{row.pabs_dependency}</div>
                    <div className="text-xs text-slate-700 font-medium">Entry Point:</div>
                    <div className="text-xs text-slate-600 italic font-medium text-blue-700">{row.capacity_building_entry_point}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Confidence</span>
                      <span className="text-[10px] text-slate-700">{row.confidence_level}</span>
                      <span className={cn(
                        "mt-2 px-2 py-0.5 rounded text-[10px] font-medium w-fit",
                        row.review_status === 'verified' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {row.review_status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
