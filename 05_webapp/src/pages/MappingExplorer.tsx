import React, { useState, useMemo } from 'react';
import { useCsvData } from '../hooks/useData';
import { Search, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface MappingRow {
  obligation_id: string;
  domestic_provision_id: string;
  domestic_norm: string;
  domestic_article: string;
  anchoring_level: string;
  match_type: string;
  gap_type: string;
  confidence_level: string;
  review_status: string;
  assessment_summary: string;
  reviewer_notes: string;
}

export function MappingExplorer() {
  const { data, loading } = useCsvData<MappingRow>('mexico_ihr2005_mapping_clean.csv');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    anchoring_level: '',
    match_type: '',
    gap_type: '',
    confidence_level: '',
    review_status: '',
  });

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchesSearch = Object.values(row).some(v =>
        String(v).toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesAnchoring = !filters.anchoring_level || row.anchoring_level === filters.anchoring_level;
      const matchesMatch = !filters.match_type || row.match_type === filters.match_type;
      const matchesGap = !filters.gap_type || row.gap_type === filters.gap_type;
      const matchesConfidence = !filters.confidence_level || row.confidence_level === filters.confidence_level;
      const matchesReview = !filters.review_status || row.review_status === filters.review_status;

      return matchesSearch && matchesAnchoring && matchesMatch && matchesGap && matchesConfidence && matchesReview;
    });
  }, [data, searchTerm, filters]);

  const uniqueValues = useMemo(() => {
    const vals = {
      anchoring_level: new Set<string>(),
      match_type: new Set<string>(),
      gap_type: new Set<string>(),
      confidence_level: new Set<string>(),
      review_status: new Set<string>(),
    };
    data.forEach(row => {
      if (row.anchoring_level) vals.anchoring_level.add(row.anchoring_level);
      if (row.match_type) vals.match_type.add(row.match_type);
      if (row.gap_type) vals.gap_type.add(row.gap_type);
      if (row.confidence_level) vals.confidence_level.add(row.confidence_level);
      if (row.review_status) vals.review_status.add(row.review_status);
    });
    return Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, Array.from(v).sort()]));
  }, [data]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">IHR 2005 Mapping Explorer</h1>
        <p className="text-slate-500">Trace IHR obligations to Mexico's domestic legal provisions</p>
      </header>

      <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search obligations, norms, or articles..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.keys(filters).map((key) => (
            <div key={key} className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{key.replace('_', ' ')}</label>
              <select
                className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filters[key as keyof typeof filters]}
                onChange={(e) => setFilters({...filters, [key]: e.target.value})}
              >
                <option value="">All</option>
                {uniqueValues[key as keyof typeof uniqueValues]?.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 w-10"></th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Obligation</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Domestic Norm</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Anchoring</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Confidence</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Review Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, i) => {
                const id = `row-${i}`;
                const isExpanded = expandedRows.has(id);
                return (
                  <React.Fragment key={id}>
                    <tr
                      className={cn(
                        "border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors",
                        isExpanded && "bg-blue-50/30"
                      )}
                      onClick={() => toggleRow(id)}
                    >
                      <td className="p-4 text-slate-400">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </td>
                      <td className="p-4 font-medium text-sm text-blue-900">{row.obligation_id}</td>
                      <td className="p-4 text-sm">
                        <div className="font-semibold">{row.domestic_norm}</div>
                        <div className="text-xs text-slate-500">{row.domestic_article}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold",
                          row.anchoring_level === '5' ? "bg-green-100 text-green-700" :
                          row.anchoring_level === '1' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                        )}>
                          L{row.anchoring_level}
                        </span>
                      </td>
                      <td className="p-4 text-xs">{row.confidence_level}</td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-medium",
                          row.review_status === 'verified' ? "bg-green-100 text-green-700" :
                          row.review_status === 'preliminary_ai_assisted' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {row.review_status}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={6} className="p-6 border-b border-slate-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Assessment Summary</h4>
                                <p className="text-sm text-slate-700 leading-relaxed italic">"{row.assessment_summary}"</p>
                              </div>
                              <div>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Reviewer Notes</h4>
                                <p className="text-sm text-slate-700 leading-relaxed">{row.reviewer_notes || "No notes provided."}</p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Match Type</h4>
                                  <p className="text-sm text-slate-700 font-medium">{row.match_type}</p>
                                </div>
                                <div>
                                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gap Type</h4>
                                  <p className="text-sm text-slate-700 font-medium">{row.gap_type || "N/A"}</p>
                                </div>
                                <div>
                                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Domestic Provision ID</h4>
                                  <p className="text-xs font-mono text-slate-600">{row.domestic_provision_id}</p>
                                </div>
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
        </div>
      </div>
    </div>
  );
}
