import React from 'react';
import { useState, useMemo } from 'react';
import { useCsvData } from '../hooks/useData';
import {
  Search,
  Loader2,
  FileText,
  Database,
  Layers,
  Users,
  Globe,
  ShieldCheck,
  BarChart2,
  PieChart as PieIcon,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { cn } from '../lib/utils';

interface ProvisionRow {
  provision_id: string;
  norm_id: string;
  norm_title: string;
  norm_type: string;
  hierarchy_level: string;
  jurisdiction: string;
  article: string;
  provision_text: string;
  topic: string;
  actor_mentioned: string;
  power_granted: string;
  duty_created: string;
  procedure_created: string;
  coordination_mechanism: string;
  enforcement_or_sanction: string;
  rights_safeguard: string;
  budget_or_resource_implication: string;
  relevance_to_ihr: string;
  relevance_to_pandemic_agreement: string;
}

interface CorpusRow {
  norm_id: string;
  sector: string;
  normative_hierarchy: string;
}

const COLORS = ['#1e40af', '#3b82f6', '#93c5fd', '#1e293b', '#475569', '#94a3b8', '#cbd5e1'];

export function ProvisionsExplorer() {
  const { data: provisionsData, loading: pLoading } = useCsvData<ProvisionRow>('mexico_legal_provisions_clean.csv');
  const { data: corpusData, loading: cLoading } = useCsvData<CorpusRow>('mexico_normative_corpus_index_clean.csv');

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    norm_title: '',
    topic: '',
    actor_mentioned: '',
    sector: '',
    normative_hierarchy: ''
  });

  const mergedData = useMemo(() => {
    if (!provisionsData.length) return [];
    return provisionsData.map(p => {
      const c = corpusData.find(item => item.norm_id === p.norm_id);
      return {
        ...p,
        sector: c?.sector || 'Unknown',
        normative_hierarchy: c?.normative_hierarchy || 'Unknown'
      };
    });
  }, [provisionsData, corpusData]);

  const stats = useMemo(() => {
    if (!mergedData.length) return null;

    const counts = {
      sectors: {} as Record<string, number>,
      hierarchy: {} as Record<string, number>,
      relevanceIHR: { relevant: 0, non_relevant: 0 },
      relevancePA: { relevant: 0, non_relevant: 0 },
    };

    const uniqueSectors = new Set<string>();
    const uniqueActors = new Set<string>();
    const uniqueNorms = new Set<string>();

    mergedData.forEach(p => {
      counts.sectors[p.sector] = (counts.sectors[p.sector] || 0) + 1;
      counts.hierarchy[p.normative_hierarchy] = (counts.hierarchy[p.normative_hierarchy] || 0) + 1;

      if (p.relevance_to_ihr && p.relevance_to_ihr.toLowerCase() !== 'no' && p.relevance_to_ihr.toLowerCase() !== 'none') {
        counts.relevanceIHR.relevant++;
      } else {
        counts.relevanceIHR.non_relevant++;
      }

      if (p.relevance_to_pandemic_agreement && p.relevance_to_pandemic_agreement.toLowerCase() !== 'no' && p.relevance_to_pandemic_agreement.toLowerCase() !== 'none') {
        counts.relevancePA.relevant++;
      } else {
        counts.relevancePA.non_relevant++;
      }

      uniqueSectors.add(p.sector);
      uniqueActors.add(p.actor_mentioned);
      uniqueNorms.add(p.norm_title);
    });

    const formatData = (obj: Record<string, number>) =>
      Object.entries(obj).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    return {
      instruments: uniqueNorms.size,
      provisions: mergedData.length,
      sectors: uniqueSectors.size,
      actors: uniqueActors.size,
      relevantIHR: counts.relevanceIHR.relevant,
      relevantPA: counts.relevancePA.relevant,
      sectorData: formatData(counts.sectors),
      hierarchyData: formatData(counts.hierarchy),
      relevanceData: [
        { name: 'IHR Relevant', value: counts.relevanceIHR.relevant },
        { name: 'PA Relevant', value: counts.relevancePA.relevant }
      ]
    };
  }, [mergedData]);

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
      const matchesNorm = !filters.norm_title || row.norm_title === filters.norm_title;
      const matchesTopic = !filters.topic || row.topic === filters.topic;
      const matchesActor = !filters.actor_mentioned || row.actor_mentioned === filters.actor_mentioned;
      const matchesSector = !filters.sector || row.sector === filters.sector;
      const matchesHierarchy = !filters.normative_hierarchy || row.normative_hierarchy === filters.normative_hierarchy;

      return matchesSearch && matchesNorm && matchesTopic && matchesActor && matchesSector && matchesHierarchy;
    });
  }, [mergedData, searchTerm, filters]);

  const uniqueFilterValues = useMemo(() => {
    const vals = {
      norm_title: new Set<string>(),
      topic: new Set<string>(),
      actor_mentioned: new Set<string>(),
      sector: new Set<string>(),
      normative_hierarchy: new Set<string>(),
    };
    mergedData.forEach(row => {
      if (row.norm_title) vals.norm_title.add(row.norm_title);
      if (row.topic) vals.topic.add(row.topic);
      if (row.actor_mentioned) vals.actor_mentioned.add(row.actor_mentioned);
      if (row.sector) vals.sector.add(row.sector);
      if (row.normative_hierarchy) vals.normative_hierarchy.add(row.normative_hierarchy);
    });
    return Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, Array.from(v).sort()]));
  }, [mergedData]);

  if (pLoading || cLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="space-y-10 pb-20">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">Legal Provisions Explorer</h1>
        <p className="text-slate-500 max-w-4xl font-medium">
          Detailed index of domestic legal provisions extracted from the Mexican corpus. This selective index focuses on administrative, procedural, and institutional anchors relevant to international health governance.
        </p>
      </header>

      {/* Summary Section */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 grid grid-cols-2 gap-4">
            {[
              { label: "Instruments", value: stats.instruments, icon: FileText },
              { label: "Provisions", value: stats.provisions, icon: Database },
              { label: "Sectors", value: stats.sectors, icon: Layers },
              { label: "Actors", value: stats.actors, icon: Users },
              { label: "IHR Relevant", value: stats.relevantIHR, icon: Globe },
              { label: "PA Relevant", value: stats.relevantPA, icon: ShieldCheck },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center space-y-1">
                <stat.icon size={16} className="text-slate-400 mb-1" />
                <p className="text-lg font-bold text-blue-900">{stat.value}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BarChart2 size={14} /> Corpus by Sector
             </h3>
             <div className="h-40">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={stats.sectorData.slice(0, 5)}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" hide />
                   <YAxis hide />
                   <Tooltip />
                   <Bar dataKey="value" fill="#1e40af" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 text-center justify-center">
                <PieIcon size={14} /> Hierarchy
             </h3>
             <div className="h-40">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={stats.hierarchyData}
                     innerRadius={40}
                     outerRadius={60}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {stats.hierarchyData.map((_, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
             <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest">Relevance</h4>
             <p className="text-[10px] text-slate-500 italic leading-relaxed">
                This corpus is selective. It extracts provisions relevant to international health obligations, not the full text of every law.
             </p>
             <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-600 font-medium">IHR Relevance</span>
                   <span className="font-bold text-blue-700">{Math.round((stats.relevantIHR/stats.provisions)*100)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                   <div className="bg-blue-600 h-1.5 rounded-full" style={{width: `${(stats.relevantIHR/stats.provisions)*100}%`}}></div>
                </div>
                <div className="flex justify-between items-center text-xs mt-2">
                   <span className="text-slate-600 font-medium">PA Readiness</span>
                   <span className="font-bold text-slate-700">{Math.round((stats.relevantPA/stats.provisions)*100)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                   <div className="bg-slate-600 h-1.5 rounded-full" style={{width: `${(stats.relevantPA/stats.provisions)*100}%`}}></div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search provision text, topics, or actors..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.keys(filters).map((key) => (
            <div key={key} className="space-y-1">
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

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 w-12"></th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-1/5">Norm & Article</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-1/6">Topic</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-1/6">Actor</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-1/4">Relevance (IHR / PA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row) => {
                const isExpanded = expandedRows.has(row.provision_id);
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
                        <div className="font-bold text-sm text-blue-900 leading-tight">{row.norm_title}</div>
                        <div className="text-xs text-slate-500 mt-1">{row.article}</div>
                        <div className="text-[9px] font-mono text-slate-400 mt-1 uppercase">{row.provision_id}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase tracking-tight">
                          {row.topic}
                        </span>
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
        </div>
      </div>
    </div>
  );
}
