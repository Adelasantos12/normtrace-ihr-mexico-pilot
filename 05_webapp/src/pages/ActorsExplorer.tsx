import { AuditNotice } from '../components/AuditNotice';
import { cn } from '../lib/utils';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { forceSimulation, forceManyBody, forceLink, forceX, forceY, forceCollide } from 'd3-force';
import { useCsvData, useJsonData } from '../hooks/useData';

// Shape of 04_outputs/figures/network_metrics.json (computed by
// 06_scripts/build_tables/build_network.py). NEVER hard-code these numbers.
interface NetworkMetrics {
  network: { n_instruments: number; n_obligations: number; n_edges: number; density: number };
  instrument_degree_ranked: { instrument: string; obligations_anchored: number; degree_norm: number; betweenness: number }[];
  actor_reach_ranked: { actor: string; instruments: string[]; n_instruments: number; obligation_reach: number }[];
  communities: { n: number; modularity: number | null; sizes: number[] };
  cug_test: { observed: number; random_mean: number; p_value_ge_random: number; interpretation: string };
  isolated_obligations?: string[];
}

// --- Computed obligation network (force-directed, Phase 1-fig) ------------
// Reads node_registry.csv + network_edges.csv (computed by build_network.py),
// never the hand-authored actor_network_edges_derived.csv. Modes are pulled
// toward a soft vertical target (obligations near the top, instruments the
// middle, actors the bottom, per forceY below) but are NOT pinned to a fixed
// row: x AND y both settle from real repulsion/link/collision forces, so
// well-connected nodes migrate toward each other rather than sitting in an
// evenly-spaced row. Node shape encodes mode (circle/square/triangle) in
// addition to color, following the shape-by-type convention in Hollway's
// {manynet}/{migraph} plots. Node size = degree_norm / obligation reach;
// edge thickness is constant; obligations with a high-severity gap
// type get a red dashed ring and their anchoring edges are drawn dashed red.
type GraphMode = 'obligation' | 'instrument' | 'actor';

interface GraphNode {
  id: string;
  mode: GraphMode;
  label: string;
  full: string;
  size: number;
  gapType: string;
  x: number;
  y: number;
  degree?: number;
  degreeNorm?: number;
  betweenness?: number;
  reach?: number;
  nInstruments?: number;
}
interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  isGap: boolean;
}

const LANE_Y: Record<GraphMode, number> = { obligation: 90, instrument: 340, actor: 590 };
const MODE_COLOR: Record<GraphMode, { fill: string; stroke: string; text: string }> = {
  obligation: { fill: '#f0fdf4', stroke: '#16a34a', text: '#15803d' },
  instrument: { fill: '#eef2ff', stroke: '#4338ca', text: '#3730a3' },
  actor: { fill: '#1e3a5f', stroke: '#1e3a5f', text: '#ffffff' },
};
// gap types that represent a materially unresolved gap, vs. minor/partial ones
const HIGH_SEVERITY_GAPS = new Set(['review pending']);

// Renders a node's shape (mode-encoded) as an SVG primitive centered at (0,0).
// Shape is purely visual encoding, redundant with color, for accessibility.
function NodeMark({ mode, r, ...rest }: { mode: GraphMode; r: number } & React.SVGProps<SVGCircleElement | SVGRectElement | SVGPolygonElement>) {
  if (mode === 'instrument') {
    const s = r * 1.7;
    return <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={3} {...(rest as any)} />;
  }
  if (mode === 'actor') {
    const w = r * 2.15, h = r * 1.95;
    return <polygon points={`0,${-h / 2} ${w / 2},${h / 2} ${-w / 2},${h / 2}`} {...(rest as any)} />;
  }
  return <circle r={r} {...(rest as any)} />;
}

function ComputedNetworkGraph({
  nodeRegistry, netEdges, netMetrics, obligationGap, oblLookup,
}: {
  nodeRegistry: any[];
  netEdges: any[];
  netMetrics: NetworkMetrics | null;
  obligationGap: Record<string, string>;
  oblLookup: Record<string, { article: string; articleTitle: string }>;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Pan/zoom: the SVG's viewBox already fits the whole graph to the visible
  // area by default (no horizontal scrolling needed to see every node), and
  // this transform layers interactive zoom-in/pan on top -- like Gephi/Kumu/
  // Obsidian's graph view, not a fixed-size canvas you have to scroll around.
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number } | null>(null);

  const { nodes, edges, width, height } = useMemo(() => {
    if (!nodeRegistry.length || !netEdges.length || !netMetrics) {
      return { nodes: [] as GraphNode[], edges: [] as GraphEdge[], width: 1000, height: 660 };
    }

    const obligationRows = nodeRegistry.filter((r) => r.mode === 'obligation');
    const instrumentRows = nodeRegistry.filter((r) => r.mode === 'instrument');
    const actorRows = netMetrics.actor_reach_ranked || [];
    const maxReach = Math.max(1, ...actorRows.map((a) => a.obligation_reach));

    const width = Math.max(1000, Math.max(obligationRows.length, instrumentRows.length, actorRows.length) * 32);
    const height = 660;

    const simNodes: any[] = [];
    obligationRows.forEach((r, i) => {
      const dn = parseFloat(r.degree_norm) || 0;
      const obl = oblLookup[r.node_id];
      // Short in-shape label: the article reference (e.g. "Art. 4"), trimmed
      // of any parenthetical detail if that would overflow the node; the
      // internal id is a fallback only for the rare row missing a match.
      const shortArticle = obl?.article
        ? (obl.article.length > 12 ? obl.article.split(/[,(]/)[0].trim() : obl.article)
        : String(r.node_id).replace('IHR-OBL-', 'OBL-');
      const fullLabel = obl?.article
        ? `${obl.article}${obl.articleTitle ? ` · ${obl.articleTitle}` : ''} (${r.node_id})`
        : r.node_id;
      simNodes.push({
        id: r.node_id, mode: 'obligation' as GraphMode,
        label: shortArticle, full: fullLabel,
        size: 6 + dn * 14,
        gapType: obligationGap[r.node_id] || 'none',
        degree: parseInt(r.degree, 10) || 0, degreeNorm: dn, betweenness: parseFloat(r.betweenness) || 0,
        // Soft starting position near the obligation lane; NOT pinned (no fy) --
        // forceY below pulls toward it, real connections can move nodes off it.
        x: ((i + 0.5) / obligationRows.length) * width, y: LANE_Y.obligation,
      });
    });
    instrumentRows.forEach((r, i) => {
      const dn = parseFloat(r.degree_norm) || 0;
      simNodes.push({
        id: r.node_id, mode: 'instrument' as GraphMode, label: r.node_id, full: r.node_id,
        size: 8 + dn * 18, gapType: 'none',
        degree: parseInt(r.degree, 10) || 0, degreeNorm: dn, betweenness: parseFloat(r.betweenness) || 0,
        x: ((i + 0.5) / instrumentRows.length) * width, y: LANE_Y.instrument,
      });
    });
    actorRows.forEach((a, i) => {
      simNodes.push({
        id: a.actor, mode: 'actor' as GraphMode,
        label: a.actor.length > 26 ? a.actor.slice(0, 24) + '…' : a.actor, full: a.actor,
        size: 8 + (a.obligation_reach / maxReach) * 18, gapType: 'none',
        reach: a.obligation_reach, nInstruments: a.n_instruments,
        x: ((i + 0.5) / actorRows.length) * width, y: LANE_Y.actor,
      });
    });

    const byId = new Map(simNodes.map((n) => [n.id, n]));

    const simLinks: { source: any; target: any; weight: number; isGap: boolean }[] = [];
    netEdges.forEach((e) => {
      const s = byId.get(e.source), t = byId.get(e.target);
      if (!s || !t) return;
      const obligationEnd = s.mode === 'obligation' ? s : (t.mode === 'obligation' ? t : null);
      const isGap = !!obligationEnd && HIGH_SEVERITY_GAPS.has(obligationEnd.gapType);
      simLinks.push({ source: s, target: t, weight: parseFloat(e.weight) || 1, isGap });
    });
    (netMetrics.actor_reach_ranked || []).forEach((a) => {
      (a.instruments || []).forEach((instId) => {
        const s = byId.get(a.actor), t = byId.get(instId);
        if (s && t) simLinks.push({ source: s, target: t, weight: 1, isGap: false });
      });
    });

    // Genuine force-directed layout: modes are a soft pull (forceY toward the
    // lane center), not a hard constraint (no fy) -- real repulsion, link
    // attraction (equal-weight documentary associations), and collision
    // avoidance determine both x AND y, so hubs and their neighbors cluster
    // organically instead of sitting in a mechanically evenly-spaced row.
    const simulation = forceSimulation(simNodes as any)
      .force('charge', forceManyBody().strength(-110))
      .force('link', forceLink(simLinks as any)
        .distance((d: any) => 85 - Math.min(55, (d.weight || 1) * 16))
        .strength(0.4))
      .force('y', forceY((d: any) => LANE_Y[d.mode as GraphMode]).strength(0.14))
      .force('x', forceX(width / 2).strength(0.02))
      .force('collide', forceCollide((d: any) =>
        d.size + 3
        + (d.mode === 'instrument' && d.size > 10 ? d.label.length * 2.2 : 0)
        + (d.mode === 'actor' ? Math.min(d.label.length, 16) * 1.5 : 0)))
      .stop();
    for (let i = 0; i < 320; i++) simulation.tick();

    // Fit the organically-settled bounding box to the drawing area (rather
    // than just clamping x), since without fy the layout no longer spans
    // exactly [0,width]x[laneY] by construction.
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    simNodes.forEach((n) => {
      minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x);
      minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y);
    });
    const marginX = 70, marginY = 55;
    const scaleX = (width - marginX * 2) / Math.max(1, maxX - minX);
    const scaleY = (height - marginY * 2) / Math.max(1, maxY - minY);
    simNodes.forEach((n) => {
      n.x = marginX + (n.x - minX) * scaleX;
      n.y = marginY + (n.y - minY) * scaleY;
    });

    const nodes: GraphNode[] = simNodes.map((n) => ({
      id: n.id, mode: n.mode, label: n.label, full: n.full, size: n.size, gapType: n.gapType,
      degree: n.degree, degreeNorm: n.degreeNorm, betweenness: n.betweenness,
      reach: n.reach, nInstruments: n.nInstruments,
      x: Math.max(marginX, Math.min(width - marginX, n.x)), y: n.y,
    }));

    // The collide force approximates label width as extra circle radius, but it's
    // a physics approximation and can still leave adjacent actor labels touching
    // or overlapping depending on how the simulation settles. Guarantee no overlap
    // with a deterministic left-to-right sweep on the actor row's below-node labels.
    const actorLabelWidth = (label: string) => {
      const truncated = label.length > 16 ? label.slice(0, 14) + '…' : label;
      return truncated.length * 5.2 + 8;
    };
    const actorNodes = nodes.filter((n) => n.mode === 'actor').sort((a, b) => a.x - b.x);
    for (let i = 1; i < actorNodes.length; i++) {
      const prev = actorNodes[i - 1], cur = actorNodes[i];
      const minGap = actorLabelWidth(prev.label) / 2 + actorLabelWidth(cur.label) / 2 + 6;
      if (cur.x - prev.x < minGap) cur.x = prev.x + minGap;
    }
    if (actorNodes.length) {
      const rightmost = actorNodes[actorNodes.length - 1];
      if (rightmost.x > width - 55) {
        const overflow = rightmost.x - (width - 55);
        actorNodes.forEach((n) => { n.x -= overflow; });
      }
    }

    const edges: GraphEdge[] = simLinks.map((l) => ({
      source: (l.source as any).id, target: (l.target as any).id, weight: l.weight, isGap: l.isGap,
    }));

    return { nodes, edges, width, height };
  }, [nodeRegistry, netEdges, netMetrics, obligationGap, oblLookup]);

  const posById = useMemo(() => {
    const m: Record<string, GraphNode> = {};
    nodes.forEach((n) => { m[n.id] = n; });
    return m;
  }, [nodes]);

  // Quantitative size-legend reference points, computed from the real
  // instrument-degree distribution (min / median / max), not hand-picked --
  // the instrument shape (square) is the most legible mode for a size key.
  const sizeLegend = useMemo(() => {
    const ranked = netMetrics?.instrument_degree_ranked;
    if (!ranked || !ranked.length || !netMetrics) return null;
    const degrees = ranked.map((r) => r.obligations_anchored).sort((a, b) => a - b);
    const nObl = netMetrics.network.n_obligations || 1;
    const pick = (d: number) => ({ degree: d, r: 8 + (d / nObl) * 18 });
    const min = pick(degrees[0]);
    const max = pick(degrees[degrees.length - 1]);
    const med = pick(degrees[Math.floor((degrees.length - 1) / 2)]);
    return [min, med, max];
  }, [netMetrics]);

  // Degree distributions for the two-mode network, per Borgatti & Everett
  // (1997): each mode's degree is a distinct distribution, not pooled --
  // instruments (n=9) read as a rank-ordered bar chart (hub dominance is the
  // story at this n); obligations (n=43) as a proper frequency histogram.
  const instrumentDegreeBars = useMemo(() => {
    const ranked = netMetrics?.instrument_degree_ranked;
    if (!ranked || !ranked.length) return null;
    const maxDeg = Math.max(...ranked.map((r) => r.obligations_anchored));
    return { rows: ranked, maxDeg };
  }, [netMetrics]);

  const obligationDegreeHistogram = useMemo(() => {
    const obl = nodes.filter((n) => n.mode === 'obligation' && n.degree !== undefined);
    if (!obl.length) return null;
    const counts = new Map<number, number>();
    obl.forEach((n) => counts.set(n.degree!, (counts.get(n.degree!) || 0) + 1));
    const maxDeg = Math.max(...counts.keys());
    const bins = Array.from({ length: maxDeg + 1 }, (_, d) => ({ degree: d, count: counts.get(d) || 0 }));
    const maxCount = Math.max(...bins.map((b) => b.count));
    return { bins, maxCount, n: obl.length };
  }, [nodes]);

  // Click an obligation -> highlight its chain: anchoring instruments, and the
  // actors whose profiles cite these instruments.
  const highlightSet = useMemo(() => {
    if (!selected) return null;
    const instruments = new Set<string>();
    edges.forEach((e) => {
      if (e.target === selected && posById[e.source]?.mode === 'instrument') instruments.add(e.source);
      if (e.source === selected && posById[e.target]?.mode === 'instrument') instruments.add(e.target);
    });
    const actors = new Set<string>();
    edges.forEach((e) => {
      if (instruments.has(e.target) && posById[e.source]?.mode === 'actor') actors.add(e.source);
      if (instruments.has(e.source) && posById[e.target]?.mode === 'actor') actors.add(e.target);
    });
    return { obligation: selected, instruments, actors };
  }, [selected, edges, posById]);

  // --- Pan/zoom mechanics -----------------------------------------------
  const ZOOM_MIN = 0.4, ZOOM_MAX = 5;
  const clampScale = (s: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, s));
  const toGraphPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return { x: ((clientX - rect.left) / rect.width) * width, y: ((clientY - rect.top) / rect.height) * height };
  };
  const zoomAt = (clientX: number, clientY: number, factor: number) => {
    setZoom((z) => {
      const newScale = clampScale(z.scale * factor);
      if (newScale === z.scale) return z;
      const p = toGraphPoint(clientX, clientY);
      const worldX = (p.x - z.x) / z.scale;
      const worldY = (p.y - z.y) / z.scale;
      return { scale: newScale, x: p.x - worldX * newScale, y: p.y - worldY * newScale };
    });
  };
  // React attaches synthetic wheel listeners as passive, so e.preventDefault()
  // inside a React onWheel prop is a no-op (and warns) -- attach a real,
  // non-passive native listener instead so scrolling over the graph zooms it
  // rather than scrolling the page underneath it.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const factor = Math.exp(-e.deltaY * 0.0015);
      setZoom((z) => {
        const newScale = clampScale(z.scale * factor);
        if (newScale === z.scale) return z;
        const px = ((e.clientX - rect.left) / rect.width) * width;
        const py = ((e.clientY - rect.top) / rect.height) * height;
        const worldX = (px - z.x) / z.scale;
        const worldY = (py - z.y) / z.scale;
        return { scale: newScale, x: px - worldX * newScale, y: py - worldY * newScale };
      });
    };
    svg.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onNativeWheel);
  }, [width, height]);
  const handleBackgroundMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as Element).getAttribute('data-bg') !== 'true') return;
    panStart.current = { x: e.clientX, y: e.clientY };
    setIsPanning(true);
  };
  useEffect(() => {
    if (!isPanning) return;
    const onMove = (e: MouseEvent) => {
      if (!panStart.current || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const dx = ((e.clientX - panStart.current.x) / rect.width) * width;
      const dy = ((e.clientY - panStart.current.y) / rect.height) * height;
      panStart.current = { x: e.clientX, y: e.clientY };
      setZoom((z) => ({ ...z, x: z.x + dx, y: z.y + dy }));
    };
    const onUp = () => { setIsPanning(false); panStart.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isPanning, width, height]);
  const zoomButton = (factor: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
  };
  const resetZoom = () => setZoom({ scale: 1, x: 0, y: 0 });

  if (!nodes.length) {
    return <div className="p-8 text-slate-400 text-sm italic">Loading computed network…</div>;
  }

  const selectedNode = selected ? posById[selected] : null;
  const isRelated = (id: string) =>
    !!highlightSet && (highlightSet.obligation === id || highlightSet.instruments.has(id) || highlightSet.actors.has(id));

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1 min-w-0 w-full">
          <h3 className="font-bold text-slate-900">Computed obligation network</h3>
          <label className="block text-sm py-2">Select a requirement <select aria-label="Select a requirement" value={selected??''} onChange={e=>setSelected(e.target.value||null)} className="block mt-2 p-2 border rounded-lg w-full min-w-0 max-w-full"><option value="">Show all connections</option>{nodes.filter(n=>n.mode==='obligation').map(n=><option key={n.id} value={n.id}>{n.full}</option>)}</select></label>
          <p className="text-[10px] text-slate-500 font-medium max-w-2xl leading-relaxed">
            How to read this: top band = {nodes.filter((n) => n.mode === 'obligation').length} IHR obligations; middle
            band = {nodes.filter((n) => n.mode === 'instrument').length} legal instruments cited by their mapping records; bottom
            band = actors whose profiles cite these instruments. Node size = documentary degree/reach. All edges have equal weight: the graph does not grade legal strength. Click an obligation to see its cited instruments and documentary actor associations.
          </p>
          <p className="text-[10px] text-slate-400 italic max-w-2xl leading-relaxed">
            This is a multimodal legal-institutional network: obligations, instruments, and actors are distinct modes,
            each with its own node population. Degree/reach for a node is normalised against the size of the opposite
            mode it connects to, not against total n — a two-mode-centrality convention after Borgatti &amp; Everett
            (1997); see also Knoke, Diani, Hollway &amp; Christopoulos, <em>Multimodal Political Networks</em> (Cambridge
            University Press, 2021).
          </p>
          {netMetrics?.isolated_obligations && netMetrics.isolated_obligations.length > 0 && (
            <p className="text-xs text-amber-800 mt-2">{netMetrics.isolated_obligations.length} selected requirement(s) have no matching reference recorded in this corpus. They remain visible as isolated nodes. This is not proof that no legal basis exists elsewhere.</p>
          )}
        </div>
        <div className="flex gap-2">
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">{nodes.length} NODES</span>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">{edges.length} EDGES</span>
        </div>
      </div>

      <div className="flex">
        <div className="w-52 shrink-0 border-r border-slate-100 p-4 space-y-3 text-[9px] overflow-y-auto" style={{ height }}>
          <div>
            <div className="font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Mode (shape + color)</div>
            {([
              { label: 'Obligation', mode: 'obligation' as GraphMode, bg: '#f0fdf4', border: '#16a34a' },
              { label: 'Instrument', mode: 'instrument' as GraphMode, bg: '#eef2ff', border: '#4338ca' },
              { label: 'Actor', mode: 'actor' as GraphMode, bg: '#1e3a5f', border: '#1e3a5f' },
            ]).map((l) => (
              <div key={l.label} className="flex items-center gap-2 py-0.5">
                <svg width={14} height={14} viewBox="-7 -7 14 14" className="shrink-0">
                  <NodeMark mode={l.mode} r={5.5} fill={l.bg} stroke={l.border} strokeWidth={1.5} />
                </svg>
                <span className="font-bold text-slate-600">{l.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2 mt-1 border-t border-slate-100">
              <div className="w-5 h-0.5 shrink-0 rounded border-t-2 border-dashed" style={{ borderColor: '#dc2626' }} />
              <span className="font-bold text-slate-600">Targeted reassessment pending</span>
            </div>
          </div>

          {sizeLegend && (
            <div className="pt-2 border-t border-slate-100">
              <div className="font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Node size (instrument degree)</div>
              <div className="flex items-end gap-3 pt-1 pb-0.5">
                {sizeLegend.map((s) => (
                  <div key={s.degree} className="flex flex-col items-center gap-1">
                    <svg width={40} height={40} viewBox="-20 -20 40 40">
                      <NodeMark mode="instrument" r={s.r} fill="#eef2ff" stroke="#4338ca" strokeWidth={1.5} />
                    </svg>
                    <span className="font-bold text-slate-600">{s.degree}</span>
                  </div>
                ))}
              </div>
              <div className="text-slate-400 italic">deg = obligations anchored (min/median/max). Other modes scaled independently — see hover.</div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100">
            <div className="font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Edge meaning: cited association</div>
            {[1].map((lvl) => (
              <div key={lvl} className="flex items-center gap-2 py-0.5">
                <svg width={28} height={10}>
                  <line x1={2} y1={5} x2={26} y2={5} stroke="#94a3b8" strokeWidth={Math.max(0.75, lvl * 0.9)} />
                </svg>
                <span className="font-bold text-slate-600">Documentary link</span>
              </div>
            ))}
          </div>

          <div className="text-slate-400 italic pt-2 border-t border-slate-100">Scroll/pinch to zoom, drag to pan, "FIT" to reset — the whole network is visible by default, zoom in to read long actor names in full.</div>
          <div className="text-slate-400 italic pt-1 border-t border-slate-100">Hover any node for its exact degree/betweenness/reach. Layout is force-directed (not hand-placed): mode sets a soft vertical pull, real connections do the rest.</div>
          <div className="text-slate-400 italic pt-1 border-t border-slate-100">Click an obligation to trace its chain.</div>
        </div>
        <div className="relative flex-1 min-w-0 bg-slate-50/50 overflow-hidden" style={{ height }}>
        {/* viewBox fits the ENTIRE graph to the visible area by default (no
            scrolling to see every node); the inner <g transform> layers
            interactive zoom/pan on top, like Gephi/Kumu/Obsidian's graph view. */}
        <svg
          ref={svgRef}
          width="100%" height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          data-bg="true"
          onMouseDown={handleBackgroundMouseDown}
          style={{ display: 'block', cursor: isPanning ? 'grabbing' : 'grab', touchAction: 'none' }}
        >
        <g transform={`translate(${zoom.x},${zoom.y}) scale(${zoom.scale})`}>
          <rect data-bg="true" x={0} y={LANE_Y.obligation - 45} width={width} height={85} fill="#16a34a" opacity={0.04} />
          <rect data-bg="true" x={0} y={LANE_Y.instrument - 45} width={width} height={85} fill="#4338ca" opacity={0.04} />
          <rect data-bg="true" x={0} y={LANE_Y.actor - 45} width={width} height={85} fill="#1e3a5f" opacity={0.04} />
          <text data-bg="true" x={12} y={LANE_Y.obligation - 52} fontSize="10" fontWeight="900" fill="#16a34a">OBLIGATIONS</text>
          <text data-bg="true" x={12} y={LANE_Y.instrument - 52} fontSize="10" fontWeight="900" fill="#4338ca">INSTRUMENTS</text>
          <text data-bg="true" x={12} y={LANE_Y.actor - 52} fontSize="10" fontWeight="900" fill="#1e3a5f">ACTORS</text>

          {edges.map((e, i) => {
            const s = posById[e.source], t = posById[e.target];
            if (!s || !t) return null;
            const dimmed = !!highlightSet && !(isRelated(e.source) && isRelated(e.target));
            return (
              <line
                key={`e-${i}`}
                x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                stroke={e.isGap ? '#dc2626' : '#94a3b8'}
                strokeDasharray={e.isGap ? '4 3' : undefined}
                strokeWidth={Math.max(0.75, e.weight * 0.9)}
                opacity={dimmed ? 0.06 : e.isGap ? 0.55 : 0.35}
              />
            );
          })}

          {nodes.map((n) => {
            const style = MODE_COLOR[n.mode];
            const isSelected = selected === n.id;
            const isHoveredClickable = n.mode === 'obligation' && hovered === n.id && !isSelected;
            const hasGap = n.mode === 'obligation' && HIGH_SEVERITY_GAPS.has(n.gapType);
            const dimmed = !!highlightSet && !isRelated(n.id);
            const r = isHoveredClickable ? n.size + 3 : n.size;
            // Actor labels are always shown below the node (never fit inside the
            // circle); obligation/instrument labels stay inline, gated by size/hover
            // to avoid crowding the dense top band. Truncation length grows with
            // zoom: at the fit-to-view scale, short is legible; zoomed in, show
            // more of the real name instead of clipping it at a fixed length.
            const actorMaxChars = zoom.scale >= 2.2 ? 60 : zoom.scale >= 1.4 ? 30 : 16;
            const belowLabel = n.mode === 'actor'
              ? (n.full.length > actorMaxChars ? n.full.slice(0, actorMaxChars - 2) + '…' : n.full)
              : null;
            const belowLabelWidth = belowLabel ? belowLabel.length * 5.2 + 8 : 0;
            // Exact numeric values on hover -- the visual encoding (size/shape)
            // is approximate by design; analysts need the real number too.
            const tooltip = n.mode === 'obligation'
              ? `${n.full} · degree ${n.degree} of ${netMetrics?.network.n_instruments ?? '?'} instruments · betweenness ${n.betweenness?.toFixed(3)} · review: ${n.gapType}`
              : n.mode === 'instrument'
              ? `${n.full} · degree ${n.degree} of ${netMetrics?.network.n_obligations ?? '?'} obligations · degree_norm ${n.degreeNorm?.toFixed(3)} · betweenness ${n.betweenness?.toFixed(3)}`
              : `${n.full} · obligation_reach ${n.reach} of ${netMetrics?.network.n_obligations ?? '?'} · via ${n.nInstruments} instrument${n.nInstruments === 1 ? '' : 's'}`;
            return (
              <g key={n.id}
                 transform={`translate(${n.x},${n.y})`}
                 className={n.mode === 'obligation' ? 'cursor-pointer' : ''}
                 opacity={dimmed ? 0.15 : 1}
                 onClick={() => n.mode === 'obligation' && setSelected(isSelected ? null : n.id)}
                 onMouseEnter={() => setHovered(n.id)}
                 onMouseLeave={() => setHovered(null)}>
                <title>{tooltip}</title>
                <NodeMark
                  mode={n.mode}
                  r={r}
                  fill={style.fill}
                  stroke={isSelected ? '#2563eb' : isHoveredClickable ? '#60a5fa' : hasGap ? '#dc2626' : style.stroke}
                  strokeWidth={isSelected || isHoveredClickable ? 3 : hasGap ? 2 : 1.5}
                  strokeDasharray={hasGap ? '3 2' : undefined}
                  className="transition-all duration-150"
                />
                {(n.size > 10 || hovered === n.id) && n.mode !== 'actor' && (
                  <text textAnchor="middle" dy=".3em" fontSize={8} fontWeight="900" fill={style.text} className="pointer-events-none">
                    {n.label}
                  </text>
                )}
                {belowLabel && (
                  <>
                    <rect
                      x={-belowLabelWidth / 2}
                      y={r + 3}
                      width={belowLabelWidth}
                      height={13}
                      rx={3}
                      fill="rgba(255,255,255,0.9)"
                      className="pointer-events-none"
                    />
                    <text
                      y={r + 12}
                      textAnchor="middle"
                      fontSize={8}
                      fontWeight={700}
                      fill="#1e293b"
                      className="pointer-events-none"
                    >
                      {belowLabel}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </g>
        </svg>

        {/* Zoom controls — floating, top-right of the graph area */}
        <div className="absolute top-3 right-3 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => zoomButton(1.3)}
            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 border-b border-slate-100 font-bold"
            title="Zoom in"
          >+</button>
          <button
            onClick={() => zoomButton(1 / 1.3)}
            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 border-b border-slate-100 font-bold"
            title="Zoom out"
          >−</button>
          <button
            onClick={resetZoom}
            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 text-[9px] font-bold"
            title="Fit to view"
          >FIT</button>
        </div>

        {/* Side panel: obligation chain on click */}
        {selectedNode && (
          <div className="absolute top-4 right-4 bg-white border border-blue-200 p-5 rounded-2xl shadow-2xl w-72 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest">Obligation chain</span>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
            </div>
            <h4 className="text-lg font-semibold text-slate-900">{selectedNode.full}</h4>
            <div className="text-[10px] font-mono text-slate-400 -mt-2">{selectedNode.id}</div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Gap type</div>
              <span className={cn(
                "inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase",
                selectedNode.gapType !== 'none' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
              )}>{selectedNode.gapType || 'none'}</span>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cited instruments</div>
              <div className="flex flex-wrap gap-1">
                {[...(highlightSet?.instruments ?? [])].map((id) => (
                  <span key={id} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold">{id}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Actors associated through these instruments</div>
              <div className="flex flex-col gap-1">
                {[...(highlightSet?.actors ?? [])].map((id) => (
                  <span key={id} className="text-[11px] text-slate-700 font-medium">{id}</span>
                ))}
                {(!highlightSet || highlightSet.actors.size === 0) && (
                  <span className="text-[11px] text-slate-400 italic">No actor-instrument link found in corpus.</span>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Degree distributions — one per mode, per Borgatti & Everett (1997):
          a two-mode network has two distinct degree distributions, never pooled. */}
      {(instrumentDegreeBars || obligationDegreeHistogram) && (
        <div className="grid md:grid-cols-2 gap-6 p-6 border-t border-slate-100 bg-slate-50/40">
          {instrumentDegreeBars && (
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
                Instrument degree (rank-ordered, n={instrumentDegreeBars.rows.length})
              </div>
              <div className="space-y-1">
                {instrumentDegreeBars.rows.map((r) => (
                  <div key={r.instrument} className="flex items-center gap-2 text-[10px]">
                    <span className="w-20 shrink-0 truncate font-medium text-slate-600" title={r.instrument}>{r.instrument}</span>
                    <div className="flex-1 bg-slate-100 rounded-sm h-3 overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-sm" style={{ width: `${(r.obligations_anchored / instrumentDegreeBars.maxDeg) * 100}%` }} />
                    </div>
                    <span className="w-5 shrink-0 text-right font-bold text-slate-600 tabular-nums">{r.obligations_anchored}</span>
                  </div>
                ))}
              </div>
              <div className="text-[9px] text-slate-400 italic mt-1.5">Counts of distinct selected requirements citing each instrument. Greater degree does not establish greater political authority.</div>
            </div>
          )}
          {obligationDegreeHistogram && (
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
                Obligation degree distribution (n={obligationDegreeHistogram.n})
              </div>
              <div className="flex items-end gap-1.5" style={{ height: 72 }}>
                {obligationDegreeHistogram.bins.map((b) => (
                  <div key={b.degree} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                    <span className="text-[9px] font-bold text-slate-500 tabular-nums">{b.count}</span>
                    <div
                      className="w-full bg-emerald-400 rounded-t-sm"
                      style={{ height: Math.max(2, (b.count / obligationDegreeHistogram.maxCount) * 44) }}
                    />
                    <span className="text-[9px] font-medium text-slate-500">{b.degree}</span>
                  </div>
                ))}
              </div>
              <div className="text-[9px] text-slate-400 italic mt-1.5">Number of distinct instruments cited for each selected requirement (x-axis = degree, y-axis = obligation count).</div>
            </div>
          )}
        </div>
      )}

      <div className="px-8 py-4 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-500 leading-relaxed max-w-5xl">
          <strong className="text-slate-700">Figure 1 (computed). Force-directed instrument×obligation×actor network.</strong>{' '}
          Layout computed by d3-force: mode sets a soft vertical target (obligations toward the top, instruments the
          middle, actors the bottom via <code>forceY</code>), while horizontal AND vertical position within that pull
          are resolved by simulated repulsion, link attraction (equal-weight documentary links draw nodes closer), and collision
          avoidance — nodes are not pinned to a row. Shape encodes mode (circle/square/triangle) redundantly with
          color. Node size and edge width are computed from <code>network_metrics.json</code> and{' '}
          <code>network_edges.csv</code> (build_network.py), not hand-set; hover any node for its exact degree,
          degree_norm, and betweenness. The view fits the entire network by default (no scrolling required to see
          every node); scroll/pinch to zoom into a cluster and drag to pan — actor names lengthen as you zoom in
          rather than staying clipped. This is a corpus-derived, multimodal legal-institutional traceability network
          (obligation × instrument × actor; see Knoke, Diani, Hollway &amp; Christopoulos, <em>Multimodal Political
          Networks</em>, Cambridge University Press, 2021), not observed coordination or political authority.
        </p>
      </div>
    </div>
  );
}

export default function ActorsExplorer() {
 const {data: nodeRegistry,loading:l1,error:e1}=useCsvData<any>('derived/node_registry.csv');
 const {data: netEdges,loading:l2,error:e2}=useCsvData<any>('derived/network_edges.csv');
 const {data: netMetrics,loading:l3,error:e3}=useJsonData<NetworkMetrics>('derived/network_metrics.json');
 const {data: obligations}=useCsvData<any>('ihr_2005_obligations_clean.csv');
 const {data: mappings}=useCsvData<any>('mexico_ihr2005_mapping_clean.csv');
 const {data: profiles}=useCsvData<any>('mexico_health_governance_actors_clean.csv');
 const {data: associations}=useCsvData<any>('derived/actor_instrument_associations.csv');
 const [tab,setTab]=useState<'map'|'inventory'|'metrics'>('map');
 const [query,setQuery]=useState('');
 const lookup=useMemo(()=>Object.fromEntries(obligations.map(o=>[o.obligation_id,{article:o.article,articleTitle:o.article_title}])),[obligations]);
 const review=useMemo(()=>{
  const result:Record<string,string>={};
  mappings.forEach(m=>{if(m.audit_status!=='legacy_preliminary')result[m.obligation_id]='review pending';else if(!result[m.obligation_id])result[m.obligation_id]='legacy preliminary';});return result;
 },[mappings]);
 if(l1||l2||l3)return <p role="status">Loading traceability network…</p>;
 if(e1||e2||e3||!netMetrics)return <p role="alert">Network data could not be loaded. No substitute values are shown.</p>;
 return <div className="space-y-7 pb-16">
  <header><p className="text-sm text-blue-700">Documentary associations · not observed coordination</p><h1 className="text-4xl font-bold mt-2">Actors and legal references</h1><p className="text-lg text-slate-600 mt-3">Follow cited instruments through the selected IHR requirements. An actor profile citing an instrument does not assign that actor every requirement connected to the instrument.</p></header>
  <AuditNotice/>
  <nav aria-label="Network views" className="flex flex-wrap gap-3">{(['map','inventory','metrics'] as const).map(t=><button key={t} onClick={()=>setTab(t)} aria-pressed={tab===t} className={cn('px-5 py-3 rounded-xl border',tab===t?'bg-slate-900 text-white':'bg-white')}>{t==='map'?'Computed Network':t==='inventory'?'Actor Inventory':'Documentary Metrics'}</button>)}</nav>
  {tab==='map'&&<><ComputedNetworkGraph nodeRegistry={nodeRegistry} netEdges={netEdges} netMetrics={netMetrics} obligationGap={review} oblLookup={lookup}/><p className="text-sm text-slate-600">The earlier curated cooperation map and CAS/operational conclusions are preserved in the repository archive, not presented here as observed or validated findings. The DGE appears separately where its profile cites NOM-017 and the 2025 Interior Regulation. The state-government node represents a grouped jurisdiction category, not 32 separately observed actors.</p></>}
  {tab==='inventory'&&<section className="space-y-4"><label className="block">Find an actor<input className="block border rounded-xl p-3 mt-2 w-full" aria-label="Find an actor" value={query} onChange={e=>setQuery(e.target.value)} placeholder="DGE, Secretaría, state governments…"/></label>{profiles.filter(p=>p.actor_name.toLowerCase().includes(query.toLowerCase())).map(p=><article key={p.actor_id} className="border bg-white rounded-2xl p-5 space-y-3"><h2 className="font-semibold text-lg">{p.actor_name}</h2><p className="text-sm text-slate-600">{p.actor_id} · {p.audit_status}</p>{p.audit_status==='institutional_identity_requires_review'?<p className="text-amber-900">{p.limitations}</p>:<><p className="text-sm">{p.source_norm}</p><p className="text-sm">{p.source_article}</p><p className="text-sm text-slate-500">Role/competence descriptions are legacy profiles unless explicitly marked source-checked; do not infer issuing powers from the network.</p><details><summary className="cursor-pointer underline">Documented profile associations</summary>{associations.filter(a=>a.actor_id===p.actor_id).map(a=><p key={a.instrument} className="text-sm py-2">{a.instrument} · {a.association_type} · {a.review_status}</p>)}</details></>}</article>)}</section>}
  {tab==='metrics'&&<section className="space-y-5"><h2 className="text-xl font-semibold">Counts from the corrected reference network</h2><p>{netMetrics.network.n_obligations} selected requirements; {netMetrics.network.n_instruments} cited instruments; {netMetrics.network.n_edges} instrument–requirement associations. The full corpus contains instruments without a mapping link; these counts describe different units.</p><div className="overflow-x-auto"><table className="w-full text-sm"><caption className="text-left py-2">Actor documentary reach, not responsibility or political importance</caption><thead><tr><th scope="col" className="text-left p-3">Actor</th><th scope="col" className="p-3">Cited instruments</th><th scope="col" className="p-3">Two-hop requirement reach</th></tr></thead><tbody>{netMetrics.actor_reach_ranked.map(a=><tr className="border-t" key={a.actor}><th scope="row" className="font-normal text-left p-3">{a.actor}</th><td className="p-3">{a.instruments.join(', ')}</td><td className="p-3">{a.obligation_reach}</td></tr>)}</tbody></table></div><a className="text-blue-700 underline" href="/data/derived/actor_instrument_associations.csv" download>Download the source-linked association table</a></section>}
 </div>;
}
