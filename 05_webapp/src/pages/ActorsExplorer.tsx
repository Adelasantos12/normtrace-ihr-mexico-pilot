import { useMemo, useState } from 'react';
import { useCsvData } from '../hooks/useData';
import {
  Users, Share2, BarChart3, Search, Filter,
  Info, AlertTriangle, Shield, Globe, ExternalLink,
  ChevronDown, ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

type Tab = 'map' | 'inventory' | 'metrics';

const LABELS: Record<string, string> = {
  actor_name: 'Official Name',
  legal_nature: 'Legal Nature',
  government_level: 'Government Level',
  legal_basis: 'Primary Legal Basis',
  ihr_relevant_functions: 'IHR Relevant Functions',
  coordination_role: 'Coordination Role',
  oversight_mechanisms: 'Oversight Mechanisms',
  review_need_status: 'Review Status',
  reviewer_notes: 'Reviewer Notes'
};

const DISPLAY_FIELDS = [
  'legal_nature',
  'government_level',
  'legal_basis',
  'ihr_relevant_functions',
  'coordination_role',
  'oversight_mechanisms'
];

export default function ActorsExplorer() {
  const { data: actors, loading: l1 } = useCsvData<any>('mexico_health_governance_actors_clean.csv');
  const { data: edges, loading: l2 } = useCsvData<any>('derived/actor_network_edges_derived.csv');
  const [tab, setTab] = useState<Tab>('map');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<any>({
    type: '',
    relationship: '',
    domain: '',
    level: '',
    gap: ''
  });

  const normalized = useMemo(() => actors.map(a => {
    const n: any = {};
    Object.keys(a).forEach(k => {
      n[k.trim()] = a[k];
    });
    return n;
  }), [actors]);

  const filteredActors = useMemo(() => normalized.filter(a => {
    const term = search.toLowerCase();
    return (a.actor_name?.toLowerCase().includes(term) || a.actor_id?.toLowerCase().includes(term));
  }), [normalized, search]);

  // Derive simple metrics
  const metrics = useMemo(() => {
    const degree: Record<string, number> = {};
    const instrumentSalience: Record<string, number> = {};

    edges.forEach((e: any) => {
      if (e.source) degree[e.source] = (degree[e.source] || 0) + 1;
      if (e.target) degree[e.target] = (degree[e.target] || 0) + 1;
      if (e.source_norm) instrumentSalience[e.source_norm] = (instrumentSalience[e.source_norm] || 0) + 1;
    });

    const topActors = Object.entries(degree)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    const topInstruments = Object.entries(instrumentSalience)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    return { topActors, topInstruments };
  }, [edges]);

  // Graph data preparation (simple static layout for deterministic render)
  const graphNodes = useMemo(() => {
    const nodesSet = new Set<string>();
    edges.forEach((e: any) => {
      if (e.source) nodesSet.add(e.source);
      if (e.target) nodesSet.add(e.target);
    });

    const nodes = Array.from(nodesSet);
    const radius = 250;
    const centerX = 400;
    const centerY = 350;

    return nodes.map((id, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      return {
        id,
        label: id,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
  }, [edges]);

  const nodePositions = useMemo(() => {
    const pos: any = {};
    graphNodes.forEach(n => pos[n.id] = { x: n.x, y: n.y });
    return pos;
  }, [graphNodes]);

  if (l1 || l2) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-24">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Actors Explorer</h1>
        <p className="text-lg text-slate-600">
          Analyze the legal-institutional network of health governance and pandemic response in Mexico.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: 'map', label: 'Relationship Map', icon: Share2 },
          { id: 'inventory', label: 'Actor Inventory', icon: Users },
          { id: 'metrics', label: 'Network Metrics', icon: BarChart3 }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={cn(
              "px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              tab === t.id ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'map' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <Share2 size={20} />
                   </div>
                   <div>
                      <h3 className="font-bold text-slate-900">Legal-Institutional Network</h3>
                      <p className="text-xs text-slate-500">Deterministic layout of documented statutory relationships.</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">{graphNodes.length} NODES</span>
                   <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">{edges.length} EDGES</span>
                </div>
             </div>

             <div className="relative bg-slate-50/50 h-[700px] overflow-hidden">
                <svg width="800" height="700" viewBox="0 0 800 700" className="w-full h-full">
                   <defs>
                     <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                       <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
                     </marker>
                   </defs>

                   {/* Edges */}
                   {edges.map((e: any, i: number) => {
                     const start = nodePositions[e.source];
                     const end = nodePositions[e.target];
                     if (!start || !end) return null;
                     return (
                       <line
                         key={`edge-${i}`}
                         x1={start.x} y1={start.y}
                         x2={end.x} y2={end.y}
                         stroke="#cbd5e1"
                         strokeWidth="1.5"
                         markerEnd="url(#arrowhead)"
                         className="opacity-60"
                       />
                     );
                   })}

                   {/* Nodes */}
                   {graphNodes.map((n) => (
                     <g key={n.id} transform={`translate(${n.x}, ${n.y})`} className="cursor-default group">
                        <circle
                          r="24"
                          fill="white"
                          stroke="#64748b"
                          strokeWidth="2"
                          className="shadow-sm group-hover:stroke-blue-500 transition-colors"
                        />
                        <text
                          textAnchor="middle"
                          dy=".3em"
                          fontSize="10"
                          fontWeight="bold"
                          fill="#1e293b"
                        >
                          {n.label}
                        </text>
                     </g>
                   ))}
                </svg>

                {/* Legend */}
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md border border-slate-200 p-6 rounded-2xl shadow-xl max-w-xs space-y-4">
                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Relationship Map Legend</h4>
                   <div className="space-y-3">
                      {[
                        { label: 'Actor', color: 'bg-white border-slate-400' },
                        { label: 'Legal Basis', color: 'bg-blue-100 border-blue-200' },
                        { label: 'IHR Obligation', color: 'bg-emerald-100 border-emerald-200' }
                      ].map(l => (
                        <div key={l.label} className="flex items-center gap-3">
                           <div className={cn("w-4 h-4 rounded-full border", l.color)} />
                           <span className="text-[10px] font-bold text-slate-600 uppercase">{l.label}</span>
                        </div>
                      ))}
                   </div>
                   <div className="pt-4 border-t border-slate-100">
                      <p className="text-[9px] text-slate-500 leading-relaxed italic">
                        <strong>Methodological Note:</strong> Corpus-derived legal-institutional network.
                        This graph shows documented relationships among actors, legal instruments,
                        provisions and international obligations. It does not represent observed operational coordination.
                      </p>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Relationship Registry</h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{edges.length} CONNECTIONS</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-4">Source</th>
                        <th className="p-4">Relationship</th>
                        <th className="p-4">Target</th>
                        <th className="p-4">Legal Basis</th>
                        <th className="p-4">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {edges.map((e: any, i: number) => (
                         <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-bold text-slate-900">{e.source}</td>
                            <td className="p-4">
                               <span className={cn(
                                 "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                 e.relationship_type === 'oversight' ? "bg-purple-50 text-purple-700" :
                                 e.relationship_type === 'subordination' ? "bg-blue-50 text-blue-700" :
                                 "bg-slate-50 text-slate-600"
                               )}>
                                 {e.relationship_type}
                               </span>
                            </td>
                            <td className="p-4 font-bold text-slate-900">{e.target}</td>
                            <td className="p-4">
                               <div className="text-xs text-slate-700 font-medium">{e.source_norm}</div>
                               <div className="text-[10px] text-slate-400">Art. {e.source_article}</div>
                            </td>
                            <td className="p-4">
                               <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">{e.confidence || 'Medium'}</span>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'inventory' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center">
             <div className="relative flex-1 w-full">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="Search by actor name or ID..."
                   className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
                />
             </div>
             <div className="px-6 py-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-widest">
                {filteredActors.length} Actors Found
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
             {filteredActors.map((a, i) => (
               <div key={i} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:border-blue-200 transition-all space-y-6">
                  <div className="flex justify-between items-start gap-4">
                     <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-900 leading-tight">{a.actor_name || 'Unnamed Actor'}</h3>
                        <div className="flex gap-2">
                           <span className="px-2 py-0.5 bg-blue-900 text-white rounded text-[9px] font-black uppercase tracking-widest">ID: {a.actor_id}</span>
                           <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-widest">{a.legal_nature}</span>
                        </div>
                     </div>
                     <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                        <Users size={24} />
                     </div>
                  </div>

                  <div className="grid gap-y-4">
                     {DISPLAY_FIELDS.map(f => (
                       <div key={f} className="space-y-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{LABELS[f]}</div>
                          <p className="text-sm text-slate-700 leading-relaxed">{a[f] || 'Not identified in current corpus'}</p>
                       </div>
                     ))}
                  </div>

                  {a.review_need_status === 'REVIEW_REQUIRED' && (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                       <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Expert Review Needed</p>
                          <p className="text-xs text-amber-700">{a.reviewer_notes || 'Pending validation of institutional competences.'}</p>
                       </div>
                    </div>
                  )}
               </div>
             ))}
          </div>
        </div>
      )}

      {tab === 'metrics' && (
        <div className="space-y-8">
           <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-900 rounded-lg text-white">
                       <Users size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Top Legally Salient Actors</h3>
                 </div>
                 <div className="space-y-4">
                    {metrics.topActors.map(([id, count], i) => (
                      <div key={id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-slate-300 w-4">{i + 1}</span>
                            <span className="font-bold text-slate-900">{id}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-600" style={{ width: `${(count / (metrics.topActors[0][1] as number)) * 100}%` }} />
                            </div>
                            <span className="text-xs font-bold text-slate-500">{count}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 rounded-lg text-white">
                       <Shield size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Top Legal Instruments</h3>
                 </div>
                 <div className="space-y-4">
                    {metrics.topInstruments.map(([id, count], i) => (
                      <div key={id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-slate-300 w-4">{i + 1}</span>
                            <span className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{id}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-600" style={{ width: `${(count / (metrics.topInstruments[0][1] as number)) * 100}%` }} />
                            </div>
                            <span className="text-xs font-bold text-slate-500">{count}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 text-white rounded-[2rem] p-10 space-y-6">
              <div className="flex items-center gap-3">
                 <Info size={24} className="text-blue-400" />
                 <h3 className="text-2xl font-black">Network Interpretation Limits</h3>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-4xl">
                 High degree indicates that the node is frequently connected in the legal-institutional corpus.
                 It does not measure actual operational authority. The metrics presented here reflect
                 "legal-institutional salience" within the analyzed documents. They do not imply real-world
                 operational coordination or compliance performance.
              </p>
           </div>
        </div>
      )}
    </div>
  );
}
