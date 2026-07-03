import React, { useMemo } from 'react';
import {
  Map, AlertTriangle, Shield, Activity, Users, Info,
  GitMerge, ChevronRight, AlertCircle, Loader2
} from 'lucide-react';
import { useCsvData } from '../hooks/useData';
import { cn } from '../lib/utils';

export default function GapMap() {
  const { data, loading, error } = useCsvData<any>('mexico_implementation_gap_map_clean.csv');

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg">Error loading data: {error.message}</div>;

  return (
    <div className="space-y-10 pb-20">
      <header>
         <h1 className="text-3xl font-bold text-slate-900">Implementation Gap Map</h1>
         <p className="text-slate-500 mt-1">Policy-facing analysis of structural-legal gaps in Mexico's IHR internalisation.</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-1/6">Area</th>
                <th className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-1/6">Anchoring Pattern</th>
                <th className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-1/6">Main Actors</th>
                <th className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-1/6">Main Gap Type</th>
                <th className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-1/4">Entry Points & Implications</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors align-top">
                  <td className="p-6">
                    <div className="font-bold text-sm text-slate-900">{row.area}</div>
                    <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight">{row.confidence_level} Confidence</div>
                  </td>
                  <td className="p-6">
                    <div className="text-[11px] text-slate-700 leading-relaxed italic border-l-2 border-blue-200 pl-3">
                      {row.current_ihr2005_anchoring_pattern}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="text-[11px] font-bold text-slate-700">{row.main_mexico_actors}</div>
                  </td>
                  <td className="p-6">
                    <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-bold uppercase tracking-tight border border-amber-100">
                      {row.main_gap_type}
                    </span>
                  </td>
                  <td className="p-6 space-y-4">
                    <div className="space-y-2">
                       <p className="text-[9px] font-bold text-blue-700 uppercase tracking-widest flex items-center gap-2">
                          <Activity size={10} /> IHR 2024 Implication
                       </p>
                       <p className="text-[11px] text-slate-600 leading-relaxed">{row.ihr2024_implication}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] font-bold text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                          <Shield size={10} /> Capacity Building Entry Point
                       </p>
                       <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{row.capacity_building_entry_point}</p>
                    </div>
                    {row.pabs_dependency && (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">PABS Dependency</p>
                         <p className="text-[10px] text-slate-500 italic">{row.pabs_dependency}</p>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem] flex gap-4">
         <Info size={24} className="text-blue-500 shrink-0 mt-1" />
         <div className="space-y-2">
            <h4 className="font-bold text-blue-900">Gap Classification Note</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
               Gap types represent structural-legal classifications based on the anchoring scale.
               <strong> 'Requires Statutory Strengthening'</strong> indicates an obligation currently anchored at administrative or operational levels (L0-L2) that may require higher-level legislative formalization for 2024 compliance.
            </p>
         </div>
      </div>
    </div>
  );
}
