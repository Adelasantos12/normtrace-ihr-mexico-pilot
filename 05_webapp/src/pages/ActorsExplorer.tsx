import { useMemo, useState } from 'react';
import { useCsvData } from '../hooks/useData';

const EXPECTED = [
  'actor_id',
  'actor_name',
  'legal_nature',
  'government_level',
  'sector',
  'legal_basis',
  'core_functions',
  'ihr_relevance',
  'pandemic_agreement_relevance',
  'instruments_it_can_issue',
  'coordination_role',
  'limitations',
  'source_norm',
  'source_article'
];

const LABELS: Record<string, string> = {
  sector: 'Sector',
  legal_basis: 'Legal basis',
  core_functions: 'Core functions',
  ihr_relevance: 'IHR relevance',
  pandemic_agreement_relevance: 'Pandemic Agreement relevance',
  instruments_it_can_issue: 'Instruments it can issue',
  coordination_role: 'Coordination role',
  limitations: 'Limitations',
  source_norm: 'Source norm',
  source_article: 'Source article'
};

const DISPLAY_FIELDS = [
  'sector',
  'legal_basis',
  'source_norm',
  'source_article',
  'core_functions',
  'ihr_relevance',
  'pandemic_agreement_relevance',
  'instruments_it_can_issue',
  'coordination_role',
  'limitations'
];

export default function ActorsExplorer() {
  const { data, loading, error } = useCsvData<any>('mexico_health_governance_actors_clean.csv');
  const { data: edges } = useCsvData<any>('derived/actor_network_edges_derived.csv');
  const [tab, setTab] = useState<'map' | 'inventory'>('map');
  const [search, setSearch] = useState('');

  const normalized = useMemo(() => {
    return data.map((row) => {
      const out: any = {};
      for (const key of EXPECTED) {
        const foundKey = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
        out[key] = row[foundKey || ''] || '';
      }
      return out;
    });
  }, [data]);

  const filtered = normalized.filter((a) =>
    `${a.actor_name} ${a.actor_id}`.toLowerCase().includes(search.toLowerCase())
  );

  const graphNodes = useMemo(() => {
    const nodesMap = new Map<string, { id: string; label: string; type: string }>();

    edges.forEach((e: any) => {
      if (e.source && !nodesMap.has(e.source)) {
        nodesMap.set(e.source, { id: e.source, label: e.source, type: 'actor' });
      }
      if (e.target && !nodesMap.has(e.target)) {
        nodesMap.set(e.target, { id: e.target, label: e.target, type: 'actor' });
      }
    });

    const nodes = Array.from(nodesMap.values());

    // Deterministic layout
    const centerX = 450;
    const centerY = 250;
    const radius = 200;

    return nodes.map((node, i) => {
      // Special placement for key nodes
      if (node.id === 'SSA') return { ...node, x: centerX, y: centerY };
      if (node.id === 'CSG') return { ...node, x: centerX, y: centerY - 150 };
      if (node.id === 'WHO') return { ...node, x: centerX + 350, y: centerY };

      const angle = (i / nodes.length) * 2 * Math.PI;
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
  }, [edges]);

  const nodePositions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    graphNodes.forEach(n => { pos[n.id] = { x: n.x, y: n.y }; });
    return pos;
  }, [graphNodes]);

  if (loading) return <div className="p-8">Loading actors...</div>;
  if (error) return <div className="p-8 text-red-600">Error loading actors.</div>;

  const renderValue = (val: string) => {
    if (!val || val.trim() === '') return <span className="text-slate-400 italic">Not identified in current corpus</span>;
    return val;
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Actors Explorer</h1>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === 'map' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setTab('map')}
          >
            Relationship Map
          </button>
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === 'inventory' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setTab('inventory')}
          >
            Actor Inventory
          </button>
        </div>
      </div>

      {tab === 'map' && (
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>Note:</strong> Corpus-derived preliminary legal-institutional network. It shows documented legal and mapping relationships, not observed operational coordination.
            </p>
          </div>

          <div className="p-6 space-y-8">
            <div className="border border-slate-200 rounded-lg bg-white overflow-hidden relative">
              <div className="overflow-auto max-h-[600px] bg-slate-50">
                <svg viewBox="0 0 900 500" className="w-full min-w-[800px] h-auto aspect-[9/5]">
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
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
                        strokeDasharray={e.relationship_type === 'coordination' ? '4 2' : '0'}
                      />
                    );
                  })}

                  {/* Nodes */}
                  {graphNodes.map((n) => (
                    <g key={n.id} transform={`translate(${n.x}, ${n.y})`} className="cursor-default">
                      <circle
                        r="22"
                        fill={n.id === 'SSA' ? '#3b82f6' : n.id === 'CSG' ? '#1e40af' : n.id === 'WHO' ? '#10b981' : '#f8fafc'}
                        stroke={n.id === 'SSA' || n.id === 'CSG' || n.id === 'WHO' ? 'transparent' : '#64748b'}
                        strokeWidth="1.5"
                        className="shadow-sm"
                      />
                      <text
                        textAnchor="middle"
                        dy=".3em"
                        fontSize="10"
                        fontWeight="bold"
                        className={n.id === 'SSA' || n.id === 'CSG' || n.id === 'WHO' ? 'fill-white' : 'fill-slate-700'}
                      >
                        {n.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm border border-slate-200 p-3 rounded-lg text-[10px] space-y-2 shadow-sm">
                <div className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1 uppercase tracking-wider">Legend</div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#1e40af]"></div>
                  <span>High Level Authority (CSG)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                  <span>Executive Health Body (SSA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                  <span>International Body (WHO)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#f8fafc] border border-slate-400"></div>
                  <span>Technical/Institutional Actor</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100 mt-1">
                  <div className="w-6 h-0.5 bg-[#cbd5e1]"></div>
                  <span>Formal Competence / Subordination</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-[#cbd5e1] border-t border-dashed border-slate-400"></div>
                  <span>Legal Coordination Link</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Legal Relationship Registry</h3>
                <span className="text-xs text-slate-500">{edges.length} connections documented</span>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                      <th className="p-3">Source</th>
                      <th className="p-3">Target</th>
                      <th className="p-3">Relationship Type</th>
                      <th className="p-3">IHR Functional Area</th>
                      <th className="p-3">Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {edges.map((e: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">{e.source}</td>
                        <td className="p-3 font-semibold text-slate-900">{e.target}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            e.relationship_type === 'oversight' ? 'bg-purple-50 text-purple-700' :
                            e.relationship_type === 'subordination' ? 'bg-blue-50 text-blue-700' :
                            e.relationship_type === 'coordination' ? 'bg-amber-50 text-amber-700' :
                            'bg-slate-50 text-slate-600'
                          }`}>
                            {e.relationship_type}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 text-xs italic">{e.ihr_area}</td>
                        <td className="p-3">
                          <div className="text-slate-900 font-medium">{e.source_norm}</div>
                          <div className="text-slate-500 text-[10px]">{e.legal_basis}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === 'inventory' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by actor name or ID..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <div className="absolute left-3 top-2.5 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
              </div>
              <div className="flex items-center px-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                Showing {filtered.length} of {normalized.length} actors
              </div>
            </div>

            <details className="text-xs text-slate-400 group">
              <summary className="cursor-pointer hover:text-slate-600 transition-colors list-none flex items-center gap-1">
                <span className="opacity-50 group-open:rotate-90 transition-transform">▶</span> Developer data check
              </summary>
              <div className="mt-2 p-3 bg-slate-50 rounded border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>Rows: <strong>{normalized.length}</strong></div>
                <div>Empty Names: <strong>{normalized.filter(a => !a.actor_name).length}</strong></div>
                <div>Empty Legal Basis: <strong>{normalized.filter(a => !a.legal_basis).length}</strong></div>
              </div>
            </details>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((a) => (
              <div key={a.actor_id || a.actor_name} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 hover:border-blue-200 transition-colors shadow-sm">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">{a.actor_name || 'Unnamed Actor'}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">
                      ID: {a.actor_id || 'N/A'}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded text-xs font-medium border border-slate-200">
                      {a.legal_nature || 'N/A'}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded text-xs font-medium border border-slate-200">
                      {a.government_level || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-y-3">
                  {DISPLAY_FIELDS.map((k) => (
                    <div key={k} className="text-sm">
                      <span className="font-semibold text-slate-700 block mb-0.5">{LABELS[k]}:</span>
                      <div className="text-slate-600">{renderValue(a[k])}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-slate-500">No actors match your search criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
