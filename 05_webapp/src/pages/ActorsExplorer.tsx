import React, { useState, useMemo } from 'react';
import { useCsvData } from '../hooks/useData';
import {
  Users,
  Share2,
  BarChart3,
  Search,
  Info,
  Shield,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Target,
  ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';

type Tab = 'map' | 'inventory' | 'metrics' | 'topology';
type View = 'actor-instrument' | 'provision-ihr' | 'gap-exposure';

const NODE_METADATA: Record<string, any> = {
  'SSA': { full: 'Secretaría de Salud', type: 'Institutional Actor', layer: 'Domestic Legal' },
  'WHO': { full: 'WHO / OMS', type: 'International Organization', layer: 'International' },
  'OMS': { full: 'WHO / OMS', type: 'International Organization', layer: 'International' },
  'Customs': { full: 'Aduanas / Customs authority', type: 'Institutional Actor', layer: 'Domestic Administrative' },
  'COFEPRIS': { full: 'COFEPRIS', type: 'Institutional Actor', layer: 'Domestic Administrative' },
  'CSG': { full: 'Consejo de Salubridad General', type: 'Institutional Actor', layer: 'Domestic Constitutional' },
  'SRE': { full: 'Secretaría de Relaciones Exteriores', type: 'Institutional Actor', layer: 'Domestic Administrative' },
  'DGE': { full: 'Dirección General de Epidemiología', type: 'Institutional Actor', layer: 'Domestic Administrative' },
  'SEGOB': { full: 'Secretaría de Gobernación', type: 'Institutional Actor', layer: 'Domestic Administrative' },
  'INM': { full: 'Instituto Nacional de Migración', type: 'Institutional Actor', layer: 'Domestic Administrative' }
};

const EDGE_STYLES: Record<string, any> = {
  'oversight': { stroke: '#8b5cf6', dash: '0' },
  'subordination': { stroke: '#3b82f6', dash: '0' },
  'coordination': { stroke: '#94a3b8', dash: '4 2' },
  'reporting': { stroke: '#10b981', dash: '0' },
  'anchors': { stroke: '#3b82f6', dash: '0' },
  'gap': { stroke: '#ef4444', dash: '2 2' }
};

const NODE_STYLES: Record<string, { fill: string; stroke: string; textFill: string }> = {
  actor:      { fill: '#1e3a5f', stroke: '#1e3a5f', textFill: 'white' },
  instrument: { fill: '#eef2ff', stroke: '#4338ca', textFill: '#3730a3' },
  obligation: { fill: '#f0fdf4', stroke: '#16a34a', textFill: '#15803d' },
  gap:        { fill: '#fef2f2', stroke: '#dc2626', textFill: '#dc2626' }
};

const GAP_ABBREV: Record<string, string> = {
  procedural_gap: 'Proc. Gap', coordination_gap: 'Coord. Gap', legal_silence: 'No Anchor',
  fragmentation: 'Fragment.', tier_mismatch: 'Tier Mis.', outdated: 'Outdated', rights_gap: 'Rights Gap'
};

function getNodeType(id: string): 'actor' | 'instrument' | 'obligation' | 'gap' {
  if (id.startsWith('IHR-OBL-')) return 'obligation';
  if (['procedural_gap', 'coordination_gap', 'legal_silence', 'fragmentation',
       'tier_mismatch', 'outdated', 'rights_gap', 'none'].includes(id.toLowerCase())) return 'gap';
  if (NODE_METADATA[id]) return 'actor';
  return 'instrument';
}

function makeNodeLabel(id: string): string {
  if (GAP_ABBREV[id]) return GAP_ABBREV[id];
  if (id.startsWith('IHR-OBL-')) return id.replace('IHR-OBL-', 'OBL-');
  if (id === 'WHO' || id === 'OMS') return 'WHO/OMS';
  return id.length > 11 ? id.slice(0, 9) + '…' : id;
}

const LABELS: Record<string, string> = {
  actor_id: 'Actor ID',
  actor_name: 'Actor Name',
  legal_nature: 'Legal Nature',
  mandate_summary: 'Mandate Summary',
  ihr_relevance: 'IHR Relevance',
  primary_competences: 'Primary Competences',
  coordination_role: 'Coordination Role',
  oversight_mechanisms: 'Oversight Mechanisms'
};

const DISPLAY_FIELDS = [
  'mandate_summary',
  'ihr_relevance',
  'primary_competences',
  'coordination_role',
  'oversight_mechanisms'
];

export default function ActorsExplorer() {
  const { data: actors, loading: l1 } = useCsvData<any>('mexico_health_governance_actors_clean.csv');
  const { data: edges, loading: l2 } = useCsvData<any>('derived/actor_network_edges_derived.csv');
  const { data: mapping, loading: l3 } = useCsvData<any>('mexico_ihr2005_mapping_clean.csv');

  const [tab, setTab] = useState<Tab>('map');
  const [activeView, setActiveView] = useState<View>('actor-instrument');
  const [search, setSearch] = useState('');
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [hoveredEdge, setHoveredEdge] = useState<any>(null);

  const [filters, setFilters] = useState<any>({
    relationship_type: '',
    ihr_area: '',
    confidence: ''
  });

  // Derived network for Provision-IHR
  const provisionEdges = useMemo(() => {
    return mapping.map(m => ({
      source: m.domestic_norm || 'Unknown Norm',
      target: m.obligation_id,
      relationship_type: 'anchors',
      ihr_area: m.implementation_domain,
      confidence: m.confidence_level,
      weight: m.anchoring_level
    })).filter(e => e.source && e.target);
  }, [mapping]);

  // Derived network for Gap Exposure
  const gapEdges = useMemo(() => {
    return mapping.filter(m => m.gap_type && m.gap_type !== 'none').map(m => ({
      source: m.obligation_id,
      target: m.gap_type,
      relationship_type: 'gap',
      ihr_area: m.implementation_domain,
      confidence: 'High',
      weight: 1
    }));
  }, [mapping]);

  const currentEdges = useMemo(() => {
    let base = [];
    if (activeView === 'actor-instrument') base = edges;
    else if (activeView === 'provision-ihr') base = provisionEdges;
    else if (activeView === 'gap-exposure') base = gapEdges;

    return base.filter((e: any) => {
      if (filters.relationship_type && e.relationship_type !== filters.relationship_type) return false;
      if (filters.ihr_area && e.ihr_area !== filters.ihr_area) return false;
      if (filters.confidence && e.confidence !== filters.confidence) return false;
      return true;
    });
  }, [activeView, edges, provisionEdges, gapEdges, filters]);

  const normalizedActors = useMemo(() => actors.map(a => {
    const n: any = {};
    Object.keys(a).forEach(k => n[k.trim()] = a[k]);
    return n;
  }), [actors]);

  const filteredActors = useMemo(() => normalizedActors.filter(a => {
    const term = search.toLowerCase();
    return (a.actor_name?.toLowerCase().includes(term) || a.actor_id?.toLowerCase().includes(term));
  }), [normalizedActors, search]);

  const metrics = useMemo(() => {
    const degree: Record<string, number> = {};
    const instrumentSalience: Record<string, number> = {};

    edges.forEach((e: any) => {
      if (e.source) degree[e.source] = (degree[e.source] || 0) + 1;
      if (e.target) degree[e.target] = (degree[e.target] || 0) + 1;
      if (e.source_norm) instrumentSalience[e.source_norm] = (instrumentSalience[e.source_norm] || 0) + 1;
    });

    const topActors = Object.entries(degree).sort(([, a], [, b]) => b - a).slice(0, 10);
    const topInstruments = Object.entries(instrumentSalience).sort(([, a], [, b]) => b - a).slice(0, 10);

    return { topActors, topInstruments };
  }, [edges]);

  const graphNodes = useMemo(() => {
    const nodesSet = new Set<string>();
    currentEdges.forEach((e: any) => {
      if (e.source) nodesSet.add(e.source);
      if (e.target) nodesSet.add(e.target);
    });

    const nodes = Array.from(nodesSet);
    const cx = 400, cy = 360;
    const posMap: Record<string, { x: number; y: number }> = {};

    if (activeView === 'actor-instrument') {
      // Bipartite: actors left, instruments right
      const actors = nodes.filter(n => getNodeType(n) === 'actor');
      const instrs = nodes.filter(n => getNodeType(n) !== 'actor');
      const aStep = actors.length > 1 ? Math.min(68, 580 / (actors.length - 1)) : 0;
      const iStep = instrs.length > 1 ? Math.min(55, 580 / (instrs.length - 1)) : 0;
      actors.forEach((n, i) => { posMap[n] = { x: 150, y: 60 + i * aStep }; });
      instrs.forEach((n, i) => { posMap[n] = { x: 640, y: 60 + i * iStep }; });
    } else if (activeView === 'gap-exposure') {
      // Hub-spoke: gap types cluster at center, obligations around outer ring
      const gaps = nodes.filter(n => getNodeType(n) === 'gap');
      const obls = nodes.filter(n => getNodeType(n) === 'obligation');
      const others = nodes.filter(n => !gaps.includes(n) && !obls.includes(n));
      gaps.forEach((n, i) => {
        const a = gaps.length > 1 ? (i / gaps.length) * 2 * Math.PI : 0;
        posMap[n] = { x: cx + 85 * Math.cos(a), y: cy + 65 * Math.sin(a) };
      });
      obls.forEach((n, i) => {
        const a = (i / Math.max(obls.length, 1)) * 2 * Math.PI - Math.PI / 2;
        posMap[n] = { x: cx + 265 * Math.cos(a), y: cy + 225 * Math.sin(a) };
      });
      others.forEach((n, i) => { posMap[n] = { x: 50 + i * 80, y: 30 }; });
    } else {
      // provision-ihr: norms on left arc, obligations on right arc
      const norms = nodes.filter(n => getNodeType(n) !== 'obligation');
      const obls  = nodes.filter(n => getNodeType(n) === 'obligation');
      const r = 268;
      norms.forEach((n, i) => {
        const a = Math.PI * (0.55 + (i / Math.max(norms.length - 1, 1)) * 0.9);
        posMap[n] = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
      });
      obls.forEach((n, i) => {
        const a = -Math.PI * 0.45 + Math.PI * (i / Math.max(obls.length - 1, 1)) * 0.9;
        posMap[n] = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
      });
    }

    return nodes.map(id => {
      const deg = currentEdges.reduce((acc, e: any) => acc + (e.source === id || e.target === id ? 1 : 0), 0);
      const inDeg = currentEdges.reduce((acc, e: any) => acc + (e.target === id ? 1 : 0), 0);
      const outDeg = currentEdges.reduce((acc, e: any) => acc + (e.source === id ? 1 : 0), 0);
      const nodeType = getNodeType(id);
      const pos = posMap[id] || { x: cx, y: cy };
      return {
        id,
        label: makeNodeLabel(id),
        full: NODE_METADATA[id]?.full || id,
        type: NODE_METADATA[id]?.type || (nodeType === 'obligation' ? 'IHR 2005 Obligation' : nodeType === 'gap' ? 'Gap Type' : 'Legal Instrument'),
        layer: NODE_METADATA[id]?.layer || (nodeType === 'obligation' ? 'International' : 'Domestic Legal'),
        nodeType,
        degree: deg,
        inDegree: inDeg,
        outDegree: outDeg,
        x: pos.x,
        y: pos.y
      };
    });
  }, [currentEdges, activeView]);

  const nodePositions = useMemo(() => {
    const pos: any = {};
    graphNodes.forEach(n => pos[n.id] = { x: n.x, y: n.y });
    return pos;
  }, [graphNodes]);

  if (l1 || l2 || l3) return (
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
          { id: 'metrics', label: 'Network Metrics', icon: BarChart3 },
          { id: 'topology', label: 'CAS Topology', icon: Target }
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-wrap items-end gap-6">
             <div className="space-y-2 flex-1 min-w-[200px]">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network View</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                   {[
                     { id: 'actor-instrument', label: 'Actor / Instrument' },
                     { id: 'provision-ihr', label: 'Provision / IHR' },
                     { id: 'gap-exposure', label: 'Gap Exposure' }
                   ].map(v => (
                     <button
                       key={v.id}
                       onClick={() => setActiveView(v.id as View)}
                       className={cn(
                         "flex-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                         activeView === v.id ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                       )}
                     >
                       {v.label}
                     </button>
                   ))}
                </div>
             </div>
             <div className="space-y-2 flex-1 min-w-[150px]">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Relationship Type</label>
                <select
                  value={filters.relationship_type}
                  onChange={e => setFilters({...filters, relationship_type: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none"
                >
                   <option value="">All relationships</option>
                   {Array.from(new Set(currentEdges.map((e: any) => e.relationship_type).filter(Boolean))).map(t => (
                     <option key={t} value={t as string}>{t as string}</option>
                   ))}
                </select>
             </div>
             <div className="space-y-2 flex-1 min-w-[150px]">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IHR Area</label>
                <select
                  value={filters.ihr_area}
                  onChange={e => setFilters({...filters, ihr_area: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none"
                >
                   <option value="">All areas</option>
                   {Array.from(new Set(currentEdges.map((e: any) => e.ihr_area).filter(Boolean))).map(t => (
                     <option key={t} value={t as string}>{t as string}</option>
                   ))}
                </select>
             </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col relative">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <Target size={20} />
                   </div>
                   <div>
                      <h3 className="font-bold text-slate-900">
                        {activeView === 'actor-instrument' ? 'Institutional Actor View' :
                         activeView === 'provision-ihr' ? 'Legal-Instrumental Traceability View' :
                         'Implementation Gap Exposure View'}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Filtered view: direct actor/instrument/legal-basis relationships only.
                        Full network includes actors, domestic provisions, instruments, IHR 2005 obligations,
                        IHR 2024 changes, implementation domains, Pandemic Agreement obligations, PABS draft obligations, and gap types.
                      </p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">{graphNodes.length} NODES</span>
                   <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">{currentEdges.length} EDGES</span>
                </div>
             </div>

             <div className="relative bg-slate-50/50 h-[700px] overflow-hidden group/svg">
                <svg width="800" height="700" viewBox="0 0 800 700" className="w-full h-full">
                   <defs>
                     <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                       <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
                     </marker>
                   </defs>

                   {/* Edges */}
                   {currentEdges.map((e: any, i: number) => {
                     const start = nodePositions[e.source];
                     const end = nodePositions[e.target];
                     if (!start || !end) return null;
                     const style = EDGE_STYLES[e.relationship_type] || { stroke: '#cbd5e1', dash: '0' };
                     const isHovered = hoveredEdge === e;

                     return (
                       <line
                         key={`edge-${i}`}
                         x1={start.x} y1={start.y}
                         x2={end.x} y2={end.y}
                         stroke={isHovered ? '#3b82f6' : style.stroke}
                         strokeWidth={isHovered ? 3 : 1.5}
                         strokeDasharray={style.dash}
                         markerEnd="url(#arrowhead)"
                         className="transition-all duration-300"
                         onMouseEnter={() => setHoveredEdge(e)}
                         onMouseLeave={() => setHoveredEdge(null)}
                       />
                     );
                   })}

                   {/* Nodes */}
                   {graphNodes.map((n) => {
                     const isHovered = hoveredNode?.id === n.id;
                     const baseR = Math.max(14, Math.min(28, 11 + n.degree));
                     const r = isHovered ? baseR + 4 : baseR;
                     const style = NODE_STYLES[n.nodeType] || NODE_STYLES.instrument;

                     return (
                       <g
                        key={n.id}
                        transform={`translate(${n.x}, ${n.y})`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredNode(n)}
                        onMouseLeave={() => setHoveredNode(null)}
                       >
                          <circle
                            r={r}
                            fill={style.fill}
                            stroke={isHovered ? '#2563eb' : style.stroke}
                            strokeWidth={isHovered ? 3 : 2}
                            className="transition-all duration-300"
                          />
                          <text
                            textAnchor="middle"
                            dy=".3em"
                            fontSize="8"
                            fontWeight="900"
                            fill={style.textFill}
                            className="pointer-events-none"
                          >
                            {n.label}
                          </text>
                       </g>
                     );
                   })}
                </svg>

                {/* Tooltips */}
                {hoveredNode && (
                   <div className="absolute top-6 right-6 bg-white border border-blue-200 p-6 rounded-2xl shadow-2xl w-72 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
                      <div className="space-y-1">
                         <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{hoveredNode.type}</div>
                         <h4 className="text-lg font-black text-slate-900 leading-tight">{hoveredNode.full}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                         <div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase">Layer</div>
                            <div className="text-xs font-bold text-slate-700">{hoveredNode.layer}</div>
                         </div>
                         <div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase">Degree</div>
                            <div className="text-xs font-bold text-slate-700">{hoveredNode.degree}</div>
                         </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                         <p className="text-[10px] text-slate-500 leading-relaxed italic">
                            Centrality reflects corpus-derived legal-institutional salience, not operational power.
                         </p>
                      </div>
                   </div>
                )}

                {hoveredEdge && (
                   <div className="absolute bottom-6 right-6 bg-white border border-slate-200 p-4 rounded-xl shadow-xl space-y-2 animate-in fade-in duration-200">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Relationship</div>
                      <div className="flex items-center gap-2">
                         <span className="text-sm font-bold text-slate-900">{hoveredEdge.source}</span>
                         <ArrowRight size={14} className="text-slate-400" />
                         <span className="text-sm font-bold text-slate-900">{hoveredEdge.target}</span>
                      </div>
                      <div className="flex gap-2">
                         <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-black rounded uppercase">{hoveredEdge.relationship_type}</span>
                         <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black rounded uppercase">Conf: {hoveredEdge.confidence}</span>
                      </div>
                   </div>
                )}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-xl space-y-3 text-[9px]">
                   <div className="font-black text-slate-500 uppercase tracking-widest">Legend</div>
                   <div className="space-y-1.5">
                     <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Node type</div>
                     {([
                       { label: 'Institutional Actor', bg: '#1e3a5f', text: 'white' },
                       { label: 'Legal Instrument', bg: '#eef2ff', border: '#4338ca', text: '#3730a3' },
                       { label: 'IHR Obligation', bg: '#f0fdf4', border: '#16a34a', text: '#15803d' },
                       { label: 'Gap Type', bg: '#fef2f2', border: '#dc2626', text: '#dc2626' }
                     ] as any[]).map((l: any) => (
                       <div key={l.label} className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full shrink-0 border"
                           style={{ background: l.bg, borderColor: l.border || l.bg }} />
                         <span className="font-bold text-slate-600">{l.label}</span>
                       </div>
                     ))}
                   </div>
                   <div className="space-y-1.5 border-t border-slate-100 pt-2">
                     <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Edge type</div>
                     {[
                       { label: 'Oversight', color: '#8b5cf6' },
                       { label: 'Subordination', color: '#3b82f6' },
                       { label: 'Coordination (dashed)', color: '#94a3b8' },
                       { label: 'Gap exposure', color: '#ef4444' }
                     ].map(l => (
                       <div key={l.label} className="flex items-center gap-2">
                         <div className="w-5 h-0.5 shrink-0 rounded" style={{ background: l.color }} />
                         <span className="font-bold text-slate-600">{l.label}</span>
                       </div>
                     ))}
                   </div>
                   <div className="border-t border-slate-100 pt-2 text-slate-400 italic">
                     Node size scales with degree centrality.
                   </div>
                </div>
             </div>

             {/* Figure caption: sits directly below the network visualization */}
             <div className="px-8 py-4 bg-slate-50 border-t border-slate-100">
               <p className="text-[10px] text-slate-500 leading-relaxed max-w-5xl">
                 <strong className="text-slate-700">
                   Figure 1. Corpus-derived legal-institutional network of IHR 2005 implementation in Mexico (NormTrace pilot v0.1).
                 </strong>{' '}
                 Node color encodes type: dark blue = institutional actor; indigo-outlined = domestic legal instrument; green-outlined = IHR 2005 obligation; red-outlined = gap type. Node size scales with degree centrality (number of corpus-derived connections). Edge type encodes relationship class: oversight (purple, solid), subordination (blue, solid), coordination (grey, dashed), gap-exposure (red, dashed). The network represents corpus-derived legal-institutional salience, not operational coordination or political authority. Three structural findings are diagnostically significant: (1) SSA/DGE over-centralisation without adequate statutory specificity; (2) RLGS-SI cluster anchored to IHR obligations despite predating IHR 2005 by 20 years; (3) SSA-INM missing coordination edge for Points of Entry (IHR Arts. 23-32). Hover any node for full name, layer, and degree detail.
               </p>
             </div>

             <div className="p-8 grid md:grid-cols-3 gap-8 bg-white border-t border-slate-100">
                <div className="space-y-2">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Most Legally Salient Actor</div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="font-black text-slate-900">Secretaría de Salud (SSA)</div>
                      <div className="text-[10px] text-slate-500">Top actor by degree in analyzed corpus.</div>
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Most Central Legal Instrument</div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="font-black text-slate-900">Ley General de Salud (LGS)</div>
                      <div className="text-[10px] text-slate-500">Primary statutory anchor for IHR obligations.</div>
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Most Frequent Gap Type</div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="font-black text-slate-900 text-amber-700">Procedural Gap</div>
                      <div className="text-[10px] text-slate-500">Most frequent linked gap in implementation map.</div>
                   </div>
                </div>
             </div>
          </div>

          {/* Inline topology interpretation: connects map to analysis */}
          <div className="bg-slate-900 text-white rounded-[2rem] p-8 space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl shrink-0">
                  <Target size={18} />
                </div>
                <div>
                  <h3 className="font-black text-base">What this network reveals</h3>
                  <p className="text-slate-400 text-xs">Three structural findings visible in the graph above</p>
                </div>
              </div>
              <button
                onClick={() => setTab('topology')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all"
              >
                Full topology analysis <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  node: 'SSA / DGE',
                  badge: 'Hub fragility',
                  badgeColor: 'bg-red-600',
                  finding: 'SSA is the highest-degree node (deg=59) and DGE operationally performs NFP functions. But DGE\'s legal basis is administrative practice, not statute. IHR Art. 4 requires statutory designation. The hub is real; its anchoring is not.',
                  link: 'Mandate decoupling'
                },
                {
                  node: 'RLGS-SI (1985)',
                  badge: 'Temporal decoupling',
                  badgeColor: 'bg-amber-600',
                  finding: 'The primary regulatory hub for IHR obligations was enacted in 1985, twenty years before IHR 2005. Mexico ratified the IHR in 2007 but never updated the RLGS-SI content. The corpus edge exists; the obligation coverage does not.',
                  link: 'Cascade failure risk'
                },
                {
                  node: 'SSA / INM interface',
                  badge: 'Structural hole',
                  badgeColor: 'bg-orange-600',
                  finding: 'At points of entry, SSA holds health authority and INM holds border control authority. IHR Arts. 23-32 require coordinated health measures for travellers. No formal coordination protocol appears in the corpus: the edge is missing.',
                  link: 'POE coordination gap'
                }
              ].map((f, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-sm text-white">{f.node}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black text-white ${f.badgeColor}`}>{f.badge}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{f.finding}</p>
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{f.link}</div>
                </div>
              ))}
            </div>

            <p className="text-slate-500 text-[10px] italic border-t border-white/10 pt-4">
              Network as complex adaptive system: see Paina &amp; Peters, <em>Implementation Science</em> 2012; Freeman, <em>Social Networks</em> 1978; Granovetter, <em>AJS</em> 1973. IHR legal compliance framing: Habibi R et al., <em>Lancet</em> 2020.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-8 flex gap-4">
             <Info size={24} className="text-amber-500 shrink-0" />
             <p className="text-xs text-amber-800 leading-relaxed font-medium">
                <strong>Methodological Note:</strong> This is a corpus-derived legal-institutional traceability network.
                It does not represent observed coordination, influence, implementation effectiveness, or political authority.
                All results are preliminary AI-assisted outputs requiring expert legal review. High degree reflects frequency
                of mentions in the legal text, not necessarily operational importance.
             </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Relationship Registry</h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{currentEdges.length} CONNECTIONS</span>
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
                       {currentEdges.map((e: any, i: number) => (
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
                               <div className="text-[10px] text-slate-400">{e.source_article ? `Art. ${e.source_article}` : 'Statutory basis'}</div>
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

      {tab === 'topology' && (
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-slate-900 text-white rounded-[2rem] p-10 space-y-6">
            <div className="flex items-center gap-3">
              <Target size={24} className="text-blue-400" />
              <h2 className="text-2xl font-black">Network Topology: Analytical Interpretation</h2>
            </div>
            <p className="text-slate-300 leading-relaxed max-w-4xl">
              The legal-institutional network derived from the NormTrace corpus is analysed here as a complex adaptive system (CAS). Nodes are actors and legal instruments; edges are corpus-derived relationships (oversight, subordination, coordination, reporting, anchoring). CAS topology analysis identifies: <strong>hubs</strong> (high-centrality nodes whose failure cascades), <strong>bridges</strong> (nodes connecting otherwise disconnected components), <strong>structural holes</strong> (weak coordination ties), and <strong>decoupled sub-networks</strong> (formally connected but operationally isolated clusters).
            </p>
            <p className="text-slate-400 text-xs italic">
              Informed by: Habibi R, et al. <em>Lancet</em> 2020; Paina L &amp; Peters DH, <em>Implementation Science</em> 2012; Freeman LC, <em>Social Networks</em> 1978.
            </p>
          </div>

          {/* Hub analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-5">
              <h3 className="text-xl font-black text-slate-900">Network Hubs: Critical Nodes</h3>
              <p className="text-sm text-slate-500">Nodes with highest degree centrality. In a CAS framework, hubs are both resilience anchors and systemic vulnerabilities: their failure cascades across multiple IHR implementation pathways simultaneously.</p>
              <div className="space-y-3">
                {[
                  { node: 'Secretaría de Salud (SSA)', degree: 59, role: 'Primary hub', interpretation: 'Highest-degree node. Central to virtually all IHR implementation pathways. Resilience depends on SSA institutional continuity; reform of IHR legal architecture must run through SSA.', color: 'bg-blue-900 text-white' },
                  { node: 'Ley General de Salud (LGS)', degree: 23, role: 'Statutory hub', interpretation: 'Primary statutory anchor. Multiple IHR obligations pass through LGS but anchoring is general: LGS functions as a hub through breadth, not specificity.', color: 'bg-blue-700 text-white' },
                  { node: 'CPEUM', degree: 22, role: 'Constitutional hub', interpretation: 'Constitutional foundation: connects treaty obligations to domestic system. High degree reflects the breadth of constitutional reference, not specific IHR operative anchoring.', color: 'bg-indigo-700 text-white' },
                  { node: 'RLGS-SI (1985)', degree: 20, role: 'Regulatory hub', interpretation: 'Primary IHR regulatory instrument, despite predating IHR 2005. Its age and hierarchical position (regulatory, not statutory) make it a fragile hub: reform-critical.', color: 'bg-amber-600 text-white' },
                ].map((h, i) => (
                  <div key={i} className="p-4 border border-slate-100 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-black text-slate-900 text-sm">{h.node}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${h.color}`}>{h.role}</span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">deg={h.degree}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{h.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-5">
              <h3 className="text-xl font-black text-slate-900">Structural Properties</h3>
              <div className="space-y-4">
                {[
                  {
                    label: 'Bridge Nodes',
                    icon: <ArrowRight size={16} />,
                    color: 'bg-purple-50 border-purple-200',
                    content: 'SRE (Secretaría de Relaciones Exteriores) functions as a structural bridge between the international layer (WHO/treaty obligations) and the domestic institutional network. Degree is relatively low: its topological importance exceeds its corpus-level salience. Coordination gap between SRE and SSA/DGE is a structural hole in the network.'
                  },
                  {
                    label: 'Structural Holes',
                    icon: <ExternalLink size={16} />,
                    color: 'bg-orange-50 border-orange-200',
                    content: 'The SSA-INM interface for Points of Entry health measures represents the most significant structural hole: both nodes are present in the corpus but their edge (coordination for traveller health measures) is absent or dashed (coordination-type edge without operative specification). This is a textbook decoupled sub-network.'
                  },
                  {
                    label: 'Weak Ties',
                    icon: <ChevronRight size={16} />,
                    color: 'bg-amber-50 border-amber-200',
                    content: 'Dashed coordination edges in the network represent Granovetter-type weak ties. In IHR implementation, weak ties are structurally important for information diffusion (surveillance reporting, notification chains) but insufficient for binding legal duties. Coordination gaps predominate where weak ties substitute for missing strong ties (statutory coordination mandates).'
                  },
                  {
                    label: 'Peripheral Nodes',
                    icon: <Target size={16} />,
                    color: 'bg-slate-50 border-slate-200',
                    content: 'Entidades federativas (state health authorities) are peripheral in the federal corpus network: low degree despite operational importance. This reflects the federal pilot scope and confirms the federal gap finding: state-level implementation is legally under-specified and cannot be traced in the federal corpus.'
                  }
                ].map((s, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${s.color} space-y-2`}>
                    <div className="flex items-center gap-2 text-slate-700">
                      {s.icon}
                      <span className="font-black text-sm">{s.label}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{s.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Decoupling and bottlenecks */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900">Institutional Decoupling & Bottleneck Analysis</h3>
            <p className="text-sm text-slate-500 max-w-3xl">
              In CAS analysis, decoupling occurs when formally connected components operate independently in practice. Bottlenecks are high-centrality nodes where implementation constraints concentrate: obligated to perform critical IHR functions but without the normative specification or coordination capacity to do so.
            </p>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  title: 'DGE / NFP Function',
                  type: 'Mandate Decoupling',
                  color: 'bg-red-50 border-red-200',
                  desc: 'DGE operationally performs NFP functions (24/7 WHO communication, surveillance, notification) but its legal basis is administrative practice + RI-SS 2025 (internal regulation). IHR Art. 4 requires statutory designation. The formal-to-operational gap is the most acute decoupling in the corpus.',
                  reform: 'LGS amendment to designate NFP with defined functions'
                },
                {
                  title: 'RLGS-SI (1985): Cascade Failure',
                  type: 'Temporal Decoupling',
                  color: 'bg-orange-50 border-orange-200',
                  desc: 'The primary IHR regulatory hub predates IHR 2005 by 20 years. IHR obligations ratified in 2007 were never cascaded into the RLGS-SI. The formal legal anchor exists but the content does not reflect current international obligations: temporal decoupling between treaty adoption and regulatory update.',
                  reform: 'Presidential decree updating RLGS-SI content'
                },
                {
                  title: 'SSA-INM Coordination',
                  type: 'Structural Hole',
                  color: 'bg-amber-50 border-amber-200',
                  desc: 'At points of entry, SSA holds health authority and INM holds border control authority. IHR Arts. 23-32 require coordinated health measures for travellers. No formal SSA-INM coordination protocol exists in the corpus: this structural hole means POE health measures depend on informal inter-institutional practice.',
                  reform: 'Inter-secretarial MOU or joint POE health protocol'
                }
              ].map((d, i) => (
                <div key={i} className={`p-5 rounded-2xl border ${d.color} space-y-3`}>
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{d.type}</span>
                    <h4 className="font-black text-slate-900 text-sm mt-1">{d.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{d.desc}</p>
                  <div className="p-3 bg-white/70 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Reform pathway: </span>
                    <span className="text-xs text-slate-700">{d.reform}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-2">
            <h4 className="font-black text-slate-900 text-sm">Figure reference</h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
              The network figure and its caption (Figure 1) appear in the <strong>Relationship Map</strong> tab, directly below the visualization. The analysis above interprets that figure through network science concepts: hub centrality (Freeman, 1978), structural holes (Burt, 1992), weak ties (Granovetter, 1973), and CAS cascade dynamics (Paina &amp; Peters, 2012). The three topology findings (hub fragility, temporal decoupling, SSA-INM structural hole) correspond to patterns visible in the Actor / Instrument view of the map.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
