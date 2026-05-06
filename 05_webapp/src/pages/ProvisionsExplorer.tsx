import { useState, useMemo } from 'react';
import {
  Search, Filter, ChevronDown, ChevronRight,
  ShieldCheck, Database, Layers, Users, FileText,
  AlertCircle, Loader2, BookOpen
} from 'lucide-react';
import { useCsvData } from '../hooks/useData';
import { cn } from '../lib/utils';
import { getLegalDomain } from '../lib/domainGrouping';
import { InstrumentsPanel } from '../components/InstrumentsPanel';

export default function ProvisionsExplorer() {
  const { data, loading, error } = useCsvData<any>('mexico_legal_provisions_clean.csv');
  const { data: corpusData, loading: cLoading } = useCsvData<any>('mexico_normative_corpus_index_clean.csv');

  const [search, setSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    topic: "",
    actor_mentioned: "",
    legal_domain: ""
  });

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const domain = getLegalDomain(row.sector, row.subsector);
      const matchesSearch =
        row.norm_title.toLowerCase().includes(search.toLowerCase()) ||
        row.provision_text.toLowerCase().includes(search.toLowerCase()) ||
        row.provision_id.toLowerCase().includes(search.toLowerCase());

      const matchesTopic = !filters.topic || row.topic === filters.topic;
      const matchesActor = !filters.actor_mentioned || row.actor_mentioned === filters.actor_mentioned;
      const matchesDomain = !filters.legal_domain || domain === filters.legal_domain;

      return matchesSearch && matchesTopic && matchesActor && matchesDomain;
    });
  }, [data, search, filters]);

  const uniqueFilterValues = useMemo(() => {
    return {
      topic: Array.from(new Set(data.map(r => r.topic))).filter(Boolean).sort(),
      actor_mentioned: Array.from(new Set(data.map(r => r.actor_mentioned))).filter(Boolean).sort(),
      legal_domain: Array.from(new Set(data.map(r => getLegalDomain(r.sector, r.subsector)))).filter(Boolean).sort(),
    };
  }, [data]);

  const toggleRow = (id: string) => {
    const next = new Set(expandedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRows(next);
  };

  if (loading || cLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg">Error loading data: {error.message}</div>;

  return (
    <div className="space-y-8 pb-20">
      <header>
         <h1 className="text-3xl font-bold text-slate-900">Legal Provisions Explorer</h1>
         <p className="text-slate-500 mt-1">Granular extraction of IHR-relevant provisions from the Mexican legal corpus.</p>
      </header>

      <InstrumentsPanel instruments={corpusData} />

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by norm title, provision text or ID..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
             <BookOpen size={16} />
             <span className="text-xs font-bold uppercase tracking-widest">{filteredData.length} Provisions Found</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(filters).map((key) => (
            <div key={key} className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{key.replace('_', ' ')}</label>
              <select
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 w-12"></th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-1/5">Norm & Article</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-1/6">Topic / Domain</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-1/6">Actor</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-1/4">Relevance (IHR / PA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row) => {
                const isExpanded = expandedRows.has(row.provision_id);
                const domain = getLegalDomain(row.sector, row.subsector);
                return (
                  <React.Fragment key={row.provision_id}>
                    <tr
                      className={cn(
                        "hover:bg-slate-50/80 cursor-pointer transition-colors align-top",
                        isExpanded && "bg-blue-50/30"
                      )}
                      onClick={() => toggleRow(row.provision_id)}
                    >
                      <td className="p-4 text-slate-400">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-sm text-slate-900 leading-tight">{row.norm_title}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{row.article}</div>
                        <div className="text-[9px] font-mono text-slate-400 mt-1 uppercase">{row.provision_id}</div>
                      </td>
                      <td className="p-4 space-y-2">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[9px] font-bold uppercase tracking-tight">
                          {row.topic}
                        </span>
                        <div className="text-[9px] text-blue-600 font-bold uppercase">{domain}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-semibold text-slate-700">{row.actor_mentioned}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{row.jurisdiction}</div>
                      </td>
                      <td className="p-4 space-y-2">
                        <div className="text-[10px] leading-relaxed text-slate-600 line-clamp-2 font-medium">
                           <span className="font-bold text-blue-700 mr-1 underline decoration-blue-200">IHR:</span> {row.relevance_to_ihr}
                        </div>
                        <div className="text-[10px] leading-relaxed text-slate-600 line-clamp-2 font-medium">
                           <span className="font-bold text-slate-700 mr-1 underline decoration-slate-300">PA:</span> {row.relevance_to_pandemic_agreement}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={5} className="p-0 border-b border-slate-100">
                          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div>
                               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Provision Text</h4>
                               <p className="text-sm text-slate-700 leading-relaxed bg-white p-6 rounded-xl border border-slate-200 shadow-sm italic">
                                  "{row.provision_text}"
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="space-y-6">
                                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Power, Duty & Procedure</h4>
                                  <div className="space-y-4">
                                     <div className="flex gap-4 items-start">
                                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0"><ShieldCheck size={14} /></div>
                                        <div>
                                           <p className="text-[9px] font-bold text-slate-400 uppercase">Power Granted</p>
                                           <p className="text-xs text-slate-700 font-medium">{row.power_granted || "Not specified"}</p>
                                        </div>
                                     </div>
                                     <div className="flex gap-4 items-start">
                                        <div className="p-2 bg-slate-100 text-slate-700 rounded-lg shrink-0"><Database size={14} /></div>
                                        <div>
                                           <p className="text-[9px] font-bold text-slate-400 uppercase">Duty Created</p>
                                           <p className="text-xs text-slate-700 font-medium">{row.duty_created || "Not specified"}</p>
                                        </div>
                                     </div>
                                     <div className="flex gap-4 items-start">
                                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0"><Layers size={14} /></div>
                                        <div>
                                           <p className="text-[9px] font-bold text-slate-400 uppercase">Procedure Created</p>
                                           <p className="text-xs text-slate-700 font-medium">{row.procedure_created || "Not specified"}</p>
                                        </div>
                                     </div>
                                  </div>
                               </div>

                               <div className="space-y-6">
                                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Governance & Compliance</h4>
                                  <div className="space-y-4">
                                     <div className="flex gap-4 items-start">
                                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0"><Users size={14} /></div>
                                        <div>
                                           <p className="text-[9px] font-bold text-slate-400 uppercase">Coordination Mechanism</p>
                                           <p className="text-xs text-slate-700 font-medium">{row.coordination_mechanism || "Not specified"}</p>
                                        </div>
                                     </div>
                                     <div className="flex gap-4 items-start">
                                        <div className="p-2 bg-red-100 text-red-700 rounded-lg shrink-0"><ShieldCheck size={14} /></div>
                                        <div>
                                           <p className="text-[9px] font-bold text-slate-400 uppercase">Enforcement or Sanction</p>
                                           <p className="text-xs text-slate-700 font-medium">{row.enforcement_or_sanction || "Not specified"}</p>
                                        </div>
                                     </div>
                                     <div className="flex gap-4 items-start">
                                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0"><FileText size={14} /></div>
                                        <div>
                                           <p className="text-[9px] font-bold text-slate-400 uppercase">Rights Safeguard</p>
                                           <p className="text-xs text-slate-700 font-medium">{row.rights_safeguard || "Not specified"}</p>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            </div>

                            <div className="p-6 bg-slate-100 rounded-xl space-y-2">
                               <p className="text-[9px] font-bold text-slate-400 uppercase">Budget or Resource Implication</p>
                               <p className="text-xs text-slate-700 italic">{row.budget_or_resource_implication || "Not explicitly mentioned"}</p>
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
            <div className="py-20 text-center text-slate-400 italic">
              No provisions match your search and filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
