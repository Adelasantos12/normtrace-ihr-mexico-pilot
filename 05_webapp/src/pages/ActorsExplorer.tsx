import { useMemo, useState } from 'react';
import {
  Users, Shield, Globe, Layers, AlertCircle, Link as LinkIcon,
  Loader2, GitBranch, Search, Filter, Info, ChevronDown, ChevronRight
} from 'lucide-react';
import { useCsvData } from '../hooks/useData';
import { cn } from '../lib/utils';

export default function ActorsExplorer() {
  const { data, loading, error } = useCsvData<any>('mexico_health_governance_actors_clean.csv');
  const { data: provisionsData, loading: pLoading } = useCsvData<any>('mexico_legal_provisions_clean.csv');
  const { data: mappingData, loading: mLoading } = useCsvData<any>('mexico_ihr2005_mapping_clean.csv');
  const { data: edgeData, loading: eLoading } = useCsvData<any>('derived/actor_network_edges_derived.csv');

  const [view, setView] = useState<'network' | 'list'>('network');
  const [search, setSearch] = useState("");
  const [showEdgeTable, setShowEdgeTable] = useState(false);

  const filteredActors = useMemo(() => {
    return data.filter(actor =>
      actor.actor_name.toLowerCase().includes(search.toLowerCase()) ||
      actor.actor_id.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const actorMetrics = useMemo(() => {
    return {
      institutional: data.length,
      mentions: new Set(provisionsData.map(p => p.actor_mentioned)).size,
      mapped: new Set(mappingData.flatMap(m => [m.main_mexico_actors, m.other_actors]).filter(Boolean)).size
    };
  }, [data, provisionsData, mappingData]);

  if (loading || pLoading || mLoading || eLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg">Error loading actors: {error.message}</div>;

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Actors Explorer</h1>
           <p className="text-slate-500 mt-1">Institutional architecture of Mexico's health governance as derived from the legal corpus.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
           <button
            onClick={() => setView('network')}
            className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all", view === 'network' ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
           >
             Relationship Map
           </button>
           <button
            onClick={() => setView('list')}
            className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all", view === 'list' ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
           >
             Actor Inventory
           </button>
        </div>
      </header>

      {/* Metric Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Institutional Profiles</p>
            <p className="text-2xl font-bold text-slate-900">{actorMetrics.institutional}</p>
            <p className="text-[10px] text-slate-500 mt-2">Deeply profiled actors in corpus</p>
         </div>
         <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Actor Mentions</p>
            <p className="text-2xl font-bold text-slate-900">{actorMetrics.mentions}</p>
            <p className="text-[10px] text-slate-500 mt-2">Unique entities mentioned in provisions</p>
         </div>
         <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">IHR-Linked Actors</p>
            <p className="text-2xl font-bold text-slate-900">{actorMetrics.mapped}</p>
            <p className="text-[10px] text-slate-500 mt-2">Actors associated with IHR obligations</p>
         </div>
      </div>

      {view === 'network' ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
             <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <GitBranch size={18} className="text-blue-600" />
                Preliminary Institutional Relationship Map
             </h3>
             <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-100 uppercase">
                Structural Analysis v0.1
             </span>
          </div>

          <div className="relative w-full aspect-[16/9] bg-slate-50 rounded-[2rem] border border-slate-200 overflow-hidden group shadow-inner">
             {/* Simple SVG network */}
             <svg viewBox="0 0 800 450" className="w-full h-full">
                {/* Background Grid */}
                <defs>
                   <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                   </pattern>
                </defs>
                <rect width="800" height="450" fill="url(#grid)" />

                {/* Layer Labels */}
                <text x="400" y="30" textAnchor="middle" className="fill-slate-400 text-[10px] font-bold uppercase tracking-widest">International Layer (WHO / IHR)</text>
                <text x="400" y="430" textAnchor="middle" className="fill-slate-400 text-[10px] font-bold uppercase tracking-widest">Intersectoral Implementation Layer (SRE / Customs)</text>

                {/* Connections */}
                <g className="stroke-slate-300" strokeWidth="1.5">
                   <line x1="400" y1="60" x2="400" y2="120" strokeDasharray="4 4" />
                   <line x1="400" y1="180" x2="400" y2="240" />
                   <line x1="400" y1="300" x2="400" y2="350" />
                   <line x1="450" y1="270" x2="580" y2="300" />
                   <line x1="350" y1="270" x2="220" y2="300" />
                </g>

                {/* Nodes */}
                <g>
                  <circle cx="400" cy="150" r="35" className="fill-white stroke-blue-600 stroke-2" />
                  <text x="400" y="152" textAnchor="middle" className="fill-blue-900 text-xs font-bold">CSG</text>
                </g>
                <g>
                  <circle cx="400" cy="270" r="45" className="fill-blue-600 stroke-blue-700 stroke-2 shadow-lg" />
                  <text x="400" y="272" textAnchor="middle" className="fill-white text-sm font-bold">SSA</text>
                </g>
                <g>
                   <rect x="340" y="350" width="120" height="30" rx="6" className="fill-slate-800" />
                   <text x="400" y="370" textAnchor="middle" className="fill-white text-[9px] font-bold">DGE / SINAVE</text>
                </g>
                <g>
                   <rect x="580" y="290" width="100" height="30" rx="6" className="fill-white stroke-slate-200" />
                   <text x="630" y="310" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold">COFEPRIS</text>
                </g>
                <g>
                   <rect x="120" y="290" width="100" height="30" rx="6" className="fill-white stroke-slate-200" />
                   <text x="170" y="310" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold">CENAPRECE</text>
                </g>
                <g>
                   <circle cx="400" cy="40" r="20" className="fill-slate-100 stroke-slate-300" />
                   <text x="400" y="44" textAnchor="middle" className="fill-slate-500 text-[8px] font-bold">WHO</text>
                </g>
             </svg>

             <div className="absolute top-8 left-8 max-w-[280px] bg-white/90 p-6 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-md">
                <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3">Structural Interpretation</h4>
                <p className="text-[10px] text-slate-600 leading-relaxed italic">
                   Relationship network derived from Mexico's federal public administration logic. Nodes represent actors with explicit IHR-related mandates as identified in the pilot corpus.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                   <div className="flex items-center gap-2 text-[9px] text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-blue-600" /> Health Ministry (SSA)
                   </div>
                   <div className="flex items-center gap-2 text-[9px] text-slate-500">
                      <div className="w-2 h-2 rounded-sm bg-slate-800" /> National IHR Focal Point
                   </div>
                </div>
             </div>
          </div>

          {/* Relationship Table View */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
             <button
              onClick={() => setShowEdgeTable(!showEdgeTable)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
             >
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
                      <Layers size={18} />
                   </div>
                   <h4 className="font-bold text-slate-900">Detailed Relationship Table</h4>
                </div>
                {showEdgeTable ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
             </button>

             {showEdgeTable && (
                <div className="border-t border-slate-100 overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200">
                         <tr>
                            <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source</th>
                            <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target</th>
                            <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                            <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">IHR Area</th>
                            <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Legal Basis</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {edgeData.map((edge, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                               <td className="p-4 text-xs font-bold text-blue-900">{edge.source}</td>
                               <td className="p-4 text-xs font-bold text-blue-900">{edge.target}</td>
                               <td className="p-4 text-[10px] font-bold uppercase text-slate-500">{edge.relationship_type}</td>
                               <td className="p-4">
                                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] font-bold uppercase tracking-tight">{edge.ihr_area}</span>
                               </td>
                               <td className="p-4">
                                  <div className="text-[10px] text-slate-600 font-medium">{edge.legal_basis}</div>
                                  <div className="text-[9px] text-slate-400 italic mt-1">{edge.source_norm}</div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
             <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
             <p className="text-xs text-blue-800 leading-relaxed italic">
                This relationship map is derived from structural provisions. For a full inventory of all institutions identified in the corpus, switch to the <strong>Actor Inventory</strong> view.
             </p>
          </div>
        </section>
      ) : (
        <section className="space-y-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Filter actors by name or ID..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredActors.map((actor) => (
              <div key={actor.actor_id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:border-blue-200 transition-all duration-300">
                <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                   <div className="space-y-1">
                      <h4 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">{actor.actor_name}</h4>
                      <div className="flex flex-wrap gap-2 pt-1">
                         <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[9px] font-bold uppercase tracking-tight">{actor.legal_nature}</span>
                         <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-bold uppercase tracking-tight">{actor.government_level}</span>
                      </div>
                   </div>
                   <div className="text-[10px] font-mono text-slate-300 font-bold bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">{actor.actor_id}</div>
                </div>

                <div className="p-8 flex-1 space-y-8">
                   {actor.legal_basis && (
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                           <Shield size={12} className="text-blue-500" /> Statutory Legal Basis
                        </h5>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium bg-blue-50/20 p-4 rounded-xl border border-blue-50/50">
                           {actor.legal_basis}
                        </p>
                        <div className="mt-3 text-[9px] text-slate-400 flex items-center gap-2 font-mono">
                           <LinkIcon size={12} /> {actor.source_norm}{actor.source_article ? `, ${actor.source_article}` : ''}
                        </div>
                      </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {actor.ihr_relevance && (
                         <div className="space-y-3">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <Globe size={12} className="text-blue-500" /> IHR (2005) Relevance
                            </h5>
                            <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                               {actor.ihr_relevance}
                            </p>
                         </div>
                      )}
                      {actor.pandemic_agreement_relevance && (
                         <div className="space-y-3">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <Layers size={12} className="text-blue-500" /> Pandemic Agreement
                            </h5>
                            <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                               {actor.pandemic_agreement_relevance}
                            </p>
                         </div>
                      )}
                   </div>

                   <div className="pt-6 border-t border-slate-100 space-y-6">
                      {actor.coordination_role && (
                         <div className="space-y-2">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coordination Role</h5>
                            <p className="text-[11px] text-slate-700 font-bold bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                               {actor.coordination_role}
                            </p>
                         </div>
                      )}

                      {actor.core_functions && (
                         <div>
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Core Administrative Functions</h5>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                               {actor.core_functions}
                            </p>
                         </div>
                      )}

                      {actor.limitations && actor.limitations !== 'None' && (
                         <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                            <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                               <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight">Institutional Constraint</p>
                               <p className="text-[11px] text-amber-900 leading-relaxed">
                                  {actor.limitations}
                                </p>
                            </div>
                         </div>
                      )}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
