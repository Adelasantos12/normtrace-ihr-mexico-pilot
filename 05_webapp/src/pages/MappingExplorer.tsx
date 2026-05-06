import React, { useState, useMemo } from 'react';
import { useCsvData } from '../hooks/useData';
import { Search, ChevronDown, ChevronRight, Loader2, AlertCircle, Info } from 'lucide-react';
import { cn, getAnchoringLabel } from '../lib/utils';

interface MappingRow {
  mapping_id: string;
  obligation_id: string;
  domestic_provision_id: string;
  domestic_norm: string;
  domestic_article: string;
  match_type: string;
  anchoring_level: string;
  actor_fit: string;
  procedure_fit: string;
  coordination_fit: string;
  enforcement_fit: string;
  rights_safeguard_fit: string;
  federalism_fit: string;
  assessment_summary: string;
  gap_type: string;
  confidence_level: string;
  review_status: string;
  reviewer_notes: string;
}

interface ObligationRow {
  obligation_id: string;
  article: string;
  article_title: string;
  obligation_text_short: string;
}

export function MappingExplorer() {
  const { data: mappingData, loading: mLoading } = useCsvData<MappingRow>('mexico_ihr2005_mapping_clean.csv');
  const { data: obligationData, loading: oLoading } = useCsvData<ObligationRow>('ihr_2005_obligations_clean.csv');

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    anchoring_level: '',
    gap_type: '',
    confidence_level: '',
    article: '',
    domestic_norm: '',
  });

  const mergedData = useMemo(() => {
    if (!mappingData.length) return [];
    return mappingData.map(m => {
      const obl = obligationData.find(o => o.obligation_id === m.obligation_id);
      return {
        ...m,
        article: obl?.article || 'N/A',
        article_title: obl?.article_title || '',
        obligation_text_short: obl?.obligation_text_short || ''
      };
    });
  }, [mappingData, obligationData]);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const filteredData = useMemo(() => {
    return mergedData.filter(row => {
      const matchesSearch = Object.values(row).some(v =>
        String(v).toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesAnchoring = !filters.anchoring_level || row.anchoring_level === filters.anchoring_level;
      const matchesGap = !filters.gap_type || row.gap_type === filters.gap_type;
      const matchesConfidence = !filters.confidence_level || row.confidence_level === filters.confidence_level;
      const matchesArticle = !filters.article || row.article === filters.article;
      const matchesNorm = !filters.domestic_norm || row.domestic_norm === filters.domestic_norm;

      return matchesSearch && matchesAnchoring && matchesGap && matchesConfidence && matchesArticle && matchesNorm;
    });
  }, [mergedData, searchTerm, filters]);

  const uniqueValues = useMemo(() => {
    const vals = {
      anchoring_level: new Set<string>(),
      gap_type: new Set<string>(),
      confidence_level: new Set<string>(),
      article: new Set<string>(),
      domestic_norm: new Set<string>(),
    };
    mergedData.forEach(row => {
      if (row.anchoring_level) vals.anchoring_level.add(row.anchoring_level);
      if (row.gap_type) vals.gap_type.add(row.gap_type);
      if (row.confidence_level) vals.confidence_level.add(row.confidence_level);
      if (row.article) vals.article.add(row.article);
      if (row.domestic_norm) vals.domestic_norm.add(row.domestic_norm);
    });
    return Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, Array.from(v).sort((a, b) => a.localeCompare(b, undefined, {numeric: true}))]));
  }, [mergedData]);

  if (mLoading || oLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">IHR 2005 Mapping Explorer</h1>
        <p className="text-slate-500">Structural reconstruction of international obligations within Mexico's domestic legal architecture</p>
      </header>

      {/* Filter Panel */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search obligations, norms, articles, or keywords..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.keys(filters).map((key) => (
            <div key={key} className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{key.replace('_', ' ')}</label>
              <select
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filters[key as keyof typeof filters]}
                onChange={(e) => setFilters({...filters, [key]: e.target.value})}
              >
                <option value="">All {key.replace('_', ' ')}s</option>
                {uniqueValues[key as keyof typeof uniqueValues]?.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 w-12"></th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-1/4">IHR Article / Area</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-1/4">Domestic Legal Anchor</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center w-24">Anchoring</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-1/4">Gap / Review Need</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row) => {
                const isExpanded = expandedRows.has(row.mapping_id);
                return (
                  <React.Fragment key={row.mapping_id}>
                    <tr
                      className={cn(
                        "hover:bg-slate-50/80 cursor-pointer transition-colors align-top",
                        isExpanded && "bg-blue-50/30 hover:bg-blue-50/50"
                      )}
                      onClick={() => toggleRow(row.mapping_id)}
                    >
                      <td className="p-4 text-slate-400">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-sm text-slate-900 leading-tight">
                          {row.article} — {row.article_title}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-tight">{row.obligation_id}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-xs text-blue-900 leading-tight">{row.domestic_norm}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{row.domestic_article}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={cn(
                          "inline-block w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm",
                          parseInt(row.anchoring_level) >= 4 ? "bg-green-600 text-white" :
                          parseInt(row.anchoring_level) >= 2 ? "bg-blue-600 text-white" : "bg-amber-500 text-white"
                        )} title={getAnchoringLabel(row.anchoring_level)}>
                          L{row.anchoring_level}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-medium text-slate-700 leading-tight">
                          {row.gap_type || "No specific gap identified"}
                        </div>
                        {row.review_status === 'preliminary_ai_assisted' && (
                          <div className="mt-1 text-[9px] font-bold text-amber-600 uppercase flex items-center gap-1">
                            <AlertCircle size={10} /> Expert review pending
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                          row.confidence_level === 'high' ? "bg-green-50 text-green-700 border border-green-100" :
                          row.confidence_level === 'medium' ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-red-50 text-red-700 border border-red-100"
                        )}>
                          {row.confidence_level}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={6} className="p-0 border-b border-slate-100">
                          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-6">
                              <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <Info size={14} className="text-blue-500" />
                                  Obligation Summary (IHR 2005)
                                </h4>
                                <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                                  {row.obligation_text_short}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Assessment Summary</h4>
                                <p className="text-sm text-slate-700 leading-relaxed italic border-l-4 border-blue-200 pl-4">
                                  "{row.assessment_summary}"
                                </p>
                              </div>
                              {row.reviewer_notes && (
                                <div>
                                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Reviewer Notes</h4>
                                  <p className="text-xs text-slate-600 bg-amber-50 p-4 rounded-xl border border-amber-100 italic">
                                    {row.reviewer_notes}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-6">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Structural Metrics</h4>
                              <div className="grid grid-cols-2 gap-4">
                                {[
                                  { label: "Match Type", val: row.match_type },
                                  { label: "Domestic Provision ID", val: row.domestic_provision_id, mono: true },
                                  { label: "Actor Fit", val: row.actor_fit },
                                  { label: "Procedure Fit", val: row.procedure_fit },
                                  { label: "Coordination Fit", val: row.coordination_fit },
                                  { label: "Enforcement Fit", val: row.enforcement_fit },
                                  { label: "Rights Safeguard Fit", val: row.rights_safeguard_fit },
                                  { label: "Federalism Fit", val: row.federalism_fit },
                                ].map((item, idx) => (
                                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-sm">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">{item.label}</p>
                                    <p className={cn("text-xs font-semibold text-slate-700", item.mono && "font-mono")}>{item.val || "N/A"}</p>
                                  </div>
                                ))}
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
