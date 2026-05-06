import { useCsvData } from '../hooks/useData';
import { Loader2, Shield, Globe, Layers, AlertCircle, Link as LinkIcon, Network } from 'lucide-react';

interface ActorRow {
  actor_id: string;
  actor_name: string;
  legal_nature: string;
  government_level: string;
  sector: string;
  legal_basis: string;
  core_functions: string;
  ihr_relevance: string;
  pandemic_agreement_relevance: string;
  instruments_it_can_issue: string;
  coordination_role: string;
  limitations: string;
  source_norm: string;
  source_article: string;
}

export function ActorsExplorer() {
  const { data, loading, error } = useCsvData<ActorRow>('mexico_health_governance_actors_clean.csv');

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg flex gap-2"><AlertCircle /> Error loading actors data</div>;

  return (
    <div className="space-y-12 pb-20">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">Actors Explorer</h1>
        <p className="text-slate-500 max-w-4xl font-medium">
           Institutional architecture of Mexico's health governance. This explorer maps the key actors, their legal bases, and their specific roles within the IHR (2005) and pandemic preparedness frameworks.
        </p>
      </header>

      {/* Preliminary Network Visualization */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Network className="text-blue-600" size={20} />
              Institutional Relationship Network
           </h3>
           <div className="text-[10px] bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold uppercase border border-blue-100">
              Structural Analysis v0.1
           </div>
        </div>
        <div className="bg-slate-950 rounded-[2rem] p-12 relative overflow-hidden min-h-[500px] flex items-center justify-center border border-slate-800 shadow-2xl">
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]" />

           {/* SVG Network Representation */}
           <svg width="100%" height="400" viewBox="0 0 800 400" className="relative z-10 drop-shadow-2xl">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
                </marker>
              </defs>

              {/* Central Connections */}
              <g stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)">
                 <line x1="400" y1="60" x2="400" y2="120" /> {/* CSG -> SSA */}
                 <line x1="400" y1="180" x2="400" y2="240" /> {/* SSA -> DGE */}
                 <line x1="450" y1="160" x2="580" y2="240" /> {/* SSA -> COFEPRIS */}
                 <line x1="330" y1="150" x2="150" y2="150" strokeDasharray="4 4" /> {/* SSA -> SRE */}
                 <line x1="470" y1="150" x2="650" y2="150" strokeDasharray="4 4" /> {/* SSA -> Entities */}
              </g>

              {/* CSG Node */}
              <g>
                <circle cx="400" cy="60" r="40" fill="#1e293b" stroke="#3b82f6" strokeWidth="3" />
                <text x="400" y="65" fill="white" textAnchor="middle" fontSize="11" fontWeight="bold">CSG</text>
                <text x="400" y="80" fill="#94a3b8" textAnchor="middle" fontSize="7">Sanitary Authority</text>
              </g>

              {/* SSA Node */}
              <g>
                <circle cx="400" cy="150" r="55" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="3" />
                <text x="400" y="155" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">SSA</text>
                <text x="400" y="175" fill="#94a3b8" textAnchor="middle" fontSize="8" fontWeight="bold">Health Ministry</text>
              </g>

              {/* DGE Node */}
              <g>
                <rect x="340" y="250" width="120" height="40" rx="8" fill="#0f172a" stroke="#475569" />
                <text x="400" y="275" fill="white" textAnchor="middle" fontSize="11" fontWeight="bold">DGE / SINAVE</text>
                <text x="400" y="305" fill="#64748b" textAnchor="middle" fontSize="9">IHR Focal Point Enlace</text>
              </g>

              {/* COFEPRIS Node */}
              <g>
                <rect x="580" y="240" width="100" height="40" rx="8" fill="#0f172a" stroke="#475569" />
                <text x="630" y="265" fill="white" textAnchor="middle" fontSize="10" fontWeight="bold">COFEPRIS</text>
              </g>

              {/* SRE Node */}
              <g>
                <circle cx="120" cy="150" r="30" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                <text x="120" y="155" fill="white" textAnchor="middle" fontSize="10">SRE</text>
              </g>

              {/* Entities Node */}
              <g>
                <circle cx="680" cy="150" r="30" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                <text x="680" y="155" fill="white" textAnchor="middle" fontSize="9">States</text>
              </g>

              {/* Labels */}
              <text x="410" y="95" fill="#60a5fa" fontSize="8" fontWeight="bold">Mandate / Oversight</text>
              <text x="410" y="210" fill="#94a3b8" fontSize="8">Subordination</text>
              <text x="250" y="145" fill="#94a3b8" fontSize="8" textAnchor="middle">International Liaison</text>
              <text x="560" y="145" fill="#94a3b8" fontSize="8" textAnchor="middle">Federal Coordination</text>
           </svg>

           <div className="absolute bottom-10 left-10 space-y-4">
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                 <div className="w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_8px_#3b82f6]" /> Central Steering Authority (SSA)
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                 <div className="w-3 h-3 bg-slate-900 border border-slate-600 rounded-full" /> Specialized Technical Body
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                 <div className="w-4 h-0.5 bg-slate-600" /> Administrative Hierarchy
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                 <div className="w-4 h-0.5 bg-slate-600 border-t border-dashed" /> Inter-institutional Coordination
              </div>
           </div>

           <div className="absolute top-10 right-10 max-w-[240px] bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
              <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">Structural Interpretation</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                 Relationship network derived from Mexico's federal public administration logic and health governance hierarchy. Nodes represent actors with explicit IHR-related mandates as identified in the pilot corpus.
              </p>
           </div>
        </div>
      </section>

      {/* Actor Inventory */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
           <h3 className="text-2xl font-bold text-slate-800">Mexican Health Governance Actors</h3>
           <div className="text-xs text-slate-500 font-medium">Showing {data.length} institutional profiles</div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {data.map((actor) => (
            <div key={actor.actor_id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:border-blue-200 transition-all duration-300">
              <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                 <div className="space-y-1">
                    <h4 className="text-xl font-bold text-blue-950 group-hover:text-blue-700 transition-colors leading-tight">{actor.actor_name}</h4>
                    <div className="flex gap-2 pt-1">
                       <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold uppercase tracking-tight">{actor.legal_nature}</span>
                       <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-tight">{actor.government_level}</span>
                       <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold uppercase tracking-tight">{actor.sector}</span>
                    </div>
                 </div>
                 <div className="text-[10px] font-mono text-slate-300 font-bold bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">{actor.actor_id}</div>
              </div>

              <div className="p-8 flex-1 space-y-8">
                 <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <Shield size={12} className="text-blue-500" /> Statutory Legal Basis
                    </h5>
                    <p className="text-sm text-slate-800 leading-relaxed font-medium bg-blue-50/30 p-4 rounded-xl border border-blue-50">
                       {actor.legal_basis}
                    </p>
                    <div className="mt-3 text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                       <LinkIcon size={12} /> {actor.source_norm}, {actor.source_article}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Globe size={12} className="text-blue-500" /> IHR (2005) Relevance
                       </h5>
                       <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                          {actor.ihr_relevance}
                       </p>
                    </div>
                    <div className="space-y-3">
                       <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Layers size={12} className="text-blue-500" /> Pandemic Agreement Readiness
                       </h5>
                       <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                          {actor.pandemic_agreement_relevance}
                       </p>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-100 grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                       <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coordination & Inter-institutional Role</h5>
                       <p className="text-xs text-slate-700 font-bold bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                          {actor.coordination_role || "Not explicitly defined in current corpus"}
                       </p>
                    </div>

                    <div>
                       <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Core Administrative Functions</h5>
                       <div className="text-xs text-slate-600 leading-relaxed prose prose-slate max-w-none">
                          {actor.core_functions}
                       </div>
                    </div>

                    {actor.limitations && actor.limitations !== 'None' && (
                       <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                          <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight">Institutional Constraint / Review Need</p>
                             <p className="text-xs text-amber-900 leading-relaxed">
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
    </div>
  );
}
