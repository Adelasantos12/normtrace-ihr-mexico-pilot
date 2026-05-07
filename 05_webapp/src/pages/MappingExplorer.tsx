import { useState, useMemo } from 'react';
import {
  Search, ChevronDown, ChevronRight,
  Loader2, GitMerge,
  Activity, Info
} from 'lucide-react';
import { useCsvData } from '../hooks/useData';
import { cn, getStatusLabel, getAnchoringLabel, toSafeLower } from '../lib/utils';

export default function MappingExplorer() {
  const { data, loading, error } = useCsvData<any>('mexico_ihr2005_mapping_clean.csv');
  const [search, setSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState({
    anchoring_level: "",
    gap_type: "",
    confidence_level: "",
    review_status: ""
  });

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchesSearch =
        toSafeLower(row.obligation_id).includes(toSafeLower(search)) ||
        toSafeLower(row.assessment_summary).includes(toSafeLower(search)) ||
        toSafeLower(row.domestic_norm).includes(toSafeLower(search));

      const matchesAnchoring = !filters.anchoring_level || row.anchoring_level === filters.anchoring_level;
      const matchesGap = !filters.gap_type || row.gap_type === filters.gap_type;
      const matchesConfidence = !filters.confidence_level || row.confidence_level === filters.confidence_level;
      const matchesReview = !filters.review_status || row.review_status === filters.review_status;

      return matchesSearch && matchesAnchoring && matchesGap && matchesConfidence && matchesReview;
    });
  }, [data, search, filters]);

  const uniqueFilterValues = useMemo(() => {
    return {
      anchoring_level: Array.from(new Set(data.map(r => r.anchoring_level))).filter(Boolean).sort(),
      gap_type: Array.from(new Set(data.map(r => r.gap_type))).filter(Boolean).sort(),
      confidence_level: Array.from(new Set(data.map(r => r.confidence_level))).filter(Boolean).sort(),
      review_status: Array.from(new Set(data.map(r => r.review_status))).filter(Boolean).sort(),
    };
  }, [data]);

  const toggleRow = (id: string) => {
    const next = new Set(expandedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRows(next);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  if (error) return <div className="p-8 text-red-600">Error loading mapping: {error.message}</div>;

  return (
    <div className="space-y-8 pb-20">
      <header>
         <h1 className="text-3xl font-bold text-slate-900">IHR 2005 Mapping Explorer</h1>
         <p className="text-slate-500 mt-1">Detailed structural alignment between IHR (2005) obligations and the Mexican legal framework.</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by obligation ID, norm or assessment..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 px-6 py-2 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
             <GitMerge size={18} />
             <span className="text-xs font-black uppercase tracking-widest">{filteredData.length} Mappings Found</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Object.keys(filters).map((key) => (
            <div key={key} className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{key.replace('_', ' ')}</label>
              <select
                className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_1rem_center] bg-no-repeat"
                value={filters[key as keyof typeof filters]}
                onChange={(e) => setFilters({...filters, [key]: e.target.value})}
              >
                <option value="">All {key.replace('_', ' ')}</option>
                {uniqueFilterValues[key as keyof typeof uniqueFilterValues]?.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="p-6 w-12"></th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/5">Obligation ID</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/6">Domestic Norm</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/6">Anchoring</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/6">Gap Type</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/5">Review Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row) => {
                const id = `${row.obligation_id}-${row.domestic_provision_id}`;
                const isExpanded = expandedRows.has(id);
                return (
                  <React.Fragment key={id}>
                    <tr
                      className={cn(
                        "hover:bg-slate-50 transition-colors cursor-pointer align-top",
                        isExpanded && "bg-blue-50/20"
                      )}
                      onClick={() => toggleRow(id)}
                    >
                      <td className="p-6 text-slate-300">
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </td>
                      <td className="p-6">
                        <div className="font-bold text-sm text-slate-900">{row.obligation_id}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tight">{row.match_type} Match</div>
                      </td>
                      <td className="p-6">
                        <div className="text-xs font-bold text-slate-700 leading-tight">{row.domestic_norm}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{row.domestic_article}</div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                           <div className={cn(
                             "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs",
                             Number(row.anchoring_level) >= 3 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                           )}>
                              L{row.anchoring_level}
                           </div>
                           <span className="text-[10px] font-medium text-slate-500">{getAnchoringLabel(row.anchoring_level)}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={cn(
                          "inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight border",
                          row.gap_type === 'None' ? "bg-slate-50 text-slate-500 border-slate-100" : "bg-amber-50 text-amber-700 border-amber-100"
                        )}>
                          {row.gap_type}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className={cn(
                          "inline-block px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tight border",
                          row.review_status === 'validated' ? "bg-green-50 text-green-700 border-green-100" : "bg-blue-50 text-blue-700 border-blue-100"
                        )}>
                          {getStatusLabel(row.review_status)}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-widest">{row.confidence_level} Confidence</div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/30">
                        <td colSpan={6} className="p-0 border-b border-slate-100">
                          <div className="p-12 space-y-10 animate-in slide-in-from-top-2 duration-300">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                      <Activity size={12} className="text-blue-500" /> Assessment Summary
                                   </h4>
                                   <p className="text-sm text-slate-700 leading-relaxed font-medium bg-white p-6 rounded-2xl border border-slate-200 shadow-sm italic">
                                      "{row.assessment_summary}"
                                   </p>
                                </div>
                                <div className="space-y-6">
                                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                      <Info size={12} className="text-amber-500" /> Reviewer Notes & Constraints
                                   </h4>
                                   <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-100 text-xs text-amber-900 leading-relaxed font-medium">
                                      {row.reviewer_notes}
                                   </div>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-100">
                                <div className="space-y-2">
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Main Actors</p>
                                   <p className="text-xs text-slate-800 font-bold">{row.main_mexico_actors}</p>
                                </div>
                                <div className="space-y-2">
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Domestic Provision ID</p>
                                   <p className="text-xs text-slate-500 font-mono">{row.domestic_provision_id}</p>
                                </div>
                                <div className="space-y-2">
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Review</p>
                                   <p className="text-xs text-slate-600 font-medium">{new Date().toISOString().split('T')[0]}</p>
                                </div>
                             </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="py-24 text-center text-slate-400 italic text-sm">
              No mappings match the current search and filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
