import { useState, useMemo } from 'react';
import { useCsvData } from '../hooks/useData';
import { Activity, Filter, Info, AlertTriangle, CheckCircle, XCircle, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

// --- Diagnostic categories ---
type DiagnosticCode =
  | 'ADEQUATE'
  | 'OUTDATED'
  | 'TIER_MISMATCH'
  | 'PARTIAL'
  | 'PROCEDURAL_GAP'
  | 'COORDINATION_GAP'
  | 'RIGHTS_GAP'
  | 'ORPHANED'
  | 'FRAGMENTED';

interface DiagnosticDef {
  code: DiagnosticCode;
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: 'check' | 'clock' | 'alert' | 'x' | 'info';
  description: string;
}

const DIAGNOSTICS: Record<DiagnosticCode, DiagnosticDef> = {
  ADEQUATE: {
    code: 'ADEQUATE',
    label: 'Adequate',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'check',
    description: 'Obligation is anchored at L3+ in a current instrument with actor and procedure identified'
  },
  OUTDATED: {
    code: 'OUTDATED',
    label: 'Outdated',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'clock',
    description: 'Legal anchor exists but primary instrument predates IHR 2005: update review required'
  },
  TIER_MISMATCH: {
    code: 'TIER_MISMATCH',
    label: 'Tier Mismatch',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'alert',
    description: 'Obligation anchored only at regulatory/sub-regulatory level when statutory basis is required'
  },
  PARTIAL: {
    code: 'PARTIAL',
    label: 'Partial',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'info',
    description: 'Indirect or general statutory anchor only: no obligation-specific provision identified'
  },
  PROCEDURAL_GAP: {
    code: 'PROCEDURAL_GAP',
    label: 'Procedural Gap',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'x',
    description: 'Obligation assigned to actor but implementation procedures not legally specified'
  },
  COORDINATION_GAP: {
    code: 'COORDINATION_GAP',
    label: 'Coordination Gap',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'alert',
    description: 'Multiple actors implicated but no coordination mechanism legally established'
  },
  RIGHTS_GAP: {
    code: 'RIGHTS_GAP',
    label: 'Rights Gap',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon: 'alert',
    description: 'Restrictive or coercive powers present without required individual rights safeguards'
  },
  ORPHANED: {
    code: 'ORPHANED',
    label: 'Orphaned',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    icon: 'x',
    description: 'No domestic legal anchor identified in available corpus: legal silence'
  },
  FRAGMENTED: {
    code: 'FRAGMENTED',
    label: 'Fragmented',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    icon: 'alert',
    description: 'Obligation split across multiple weak anchors with no unified legal basis'
  }
};

function getDiagnosticIcon(icon: DiagnosticDef['icon'], size = 14) {
  switch (icon) {
    case 'check': return <CheckCircle size={size} />;
    case 'clock': return <Clock size={size} />;
    case 'alert': return <AlertTriangle size={size} />;
    case 'x': return <XCircle size={size} />;
    default: return <Info size={size} />;
  }
}

function computeDiagnostic(rows: any[]): DiagnosticCode {
  const maxAnchoring = Math.max(...rows.map(r => parseInt(r.anchoring_level) || 0));
  const allGaps = rows.map(r => (r.gap_type || '').toLowerCase());
  const allNorms = rows.map(r => r.domestic_norm || '');
  const allProcFits = rows.map(r => (r.procedure_fit || '').toLowerCase());
  const allActorFits = rows.map(r => (r.actor_fit || '').toLowerCase());

  const hasOutdated = allNorms.some(n => n.includes('1985') || n.includes('RLGS-SI') || n.includes('1984'));
  const hasProcedural = allGaps.some(g => g.includes('procedural'));
  const hasCoordination = allGaps.some(g => g.includes('coordination'));
  const hasRights = allGaps.some(g => g.includes('rights'));
  const hasLegalSilence = allGaps.some(g => g === 'legal silence' || g === 'full gap');
  const hasActorNone = allActorFits.every(f => f === 'none identified' || f === '');

  // Only regulatory/sub-regulatory tier
  const onlySubStatutory = allNorms.every(n => {
    const nl = n.toLowerCase();
    return nl.includes('reglamento') || nl.includes('nom') || nl.includes('norma') ||
           nl.includes('acuerdo') || nl.includes('decreto') || nl === '';
  });

  if (hasLegalSilence && maxAnchoring <= 1 && hasActorNone) return 'ORPHANED';
  if (hasRights) return 'RIGHTS_GAP';
  if (rows.length >= 3 && maxAnchoring <= 2) return 'FRAGMENTED';
  if (hasCoordination) return 'COORDINATION_GAP';
  if (hasProcedural) return 'PROCEDURAL_GAP';
  if (hasOutdated && maxAnchoring >= 2) return 'OUTDATED';
  if (onlySubStatutory && maxAnchoring <= 3) return 'TIER_MISMATCH';
  if (maxAnchoring >= 3) return 'ADEQUATE';
  return 'PARTIAL';
}

// Group mapping rows by obligation
function groupByObligation(rows: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {};
  rows.forEach(r => {
    const id = r.obligation_id || 'UNKNOWN';
    if (!groups[id]) groups[id] = [];
    groups[id].push(r);
  });
  return groups;
}

// Group mapping rows by domestic norm
function groupByNorm(rows: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {};
  rows.forEach(r => {
    const id = r.domestic_norm || 'Unknown';
    if (!groups[id]) groups[id] = [];
    groups[id].push(r);
  });
  return groups;
}

export default function NormDiagnostic() {
  const { data: mapping, loading } = useCsvData<any>('mexico_ihr2005_mapping_clean.csv');
  const [view, setView] = useState<'obligation' | 'norm' | 'matrix'>('obligation');
  const [filterCode, setFilterCode] = useState<string>('');
  const [filterDomain, setFilterDomain] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const obligationGroups = useMemo(() => groupByObligation(mapping), [mapping]);
  const normGroups = useMemo(() => groupByNorm(mapping), [mapping]);

  const obligationDiagnostics = useMemo(() => {
    return Object.entries(obligationGroups).map(([id, rows]) => ({
      id,
      domain: rows[0]?.implementation_domain || rows[0]?.ihr_domain || '',
      rows,
      diagnostic: computeDiagnostic(rows),
      maxAnchoring: Math.max(...rows.map(r => parseInt(r.anchoring_level) || 0)),
      primaryNorm: rows.sort((a, b) => (parseInt(b.anchoring_level) || 0) - (parseInt(a.anchoring_level) || 0))[0]?.domestic_norm,
      gaps: [...new Set(rows.map(r => r.gap_type).filter(g => g && g !== 'None' && g !== ''))]
    }));
  }, [obligationGroups]);

  const normDiagnostics = useMemo(() => {
    return Object.entries(normGroups)
      .filter(([id]) => id !== 'Unknown' && id !== '')
      .map(([id, rows]) => ({
        id,
        rows,
        obligationsAnchored: new Set(rows.map(r => r.obligation_id)).size,
        maxAnchoring: Math.max(...rows.map(r => parseInt(r.anchoring_level) || 0)),
        meanAnchoring: rows.reduce((a, r) => a + (parseInt(r.anchoring_level) || 0), 0) / rows.length,
        gaps: [...new Set(rows.map(r => r.gap_type).filter(g => g && g !== 'None' && g !== ''))],
        isOutdated: id.includes('1985') || id.includes('RLGS-SI') || id.includes('1984'),
        diagnostic: computeDiagnostic(rows)
      }))
      .sort((a, b) => b.obligationsAnchored - a.obligationsAnchored);
  }, [normGroups]);

  const diagnosticCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    obligationDiagnostics.forEach(o => {
      counts[o.diagnostic] = (counts[o.diagnostic] || 0) + 1;
    });
    return counts;
  }, [obligationDiagnostics]);

  const domains = useMemo(() => {
    return Array.from(new Set(obligationDiagnostics.map(o => o.domain).filter(Boolean))).sort();
  }, [obligationDiagnostics]);

  const filteredObligations = useMemo(() => {
    return obligationDiagnostics.filter(o => {
      if (filterCode && o.diagnostic !== filterCode) return false;
      if (filterDomain && o.domain !== filterDomain) return false;
      return true;
    });
  }, [obligationDiagnostics, filterCode, filterDomain]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 pb-24">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-900 text-white rounded-xl"><Activity size={20} /></div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Norm Diagnostic</h1>
        </div>
        <p className="text-lg text-slate-600 max-w-4xl">
          Cross-diagnostic matrix: IHR obligation × domestic norm. Each pairing is classified by diagnostic status: from well-anchored to orphaned, with identification of tier mismatches, outdated instruments, procedural gaps, and fragmented anchoring.
        </p>
      </header>

      {/* Diagnostic summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.values(DIAGNOSTICS) as DiagnosticDef[]).map(d => {
          const count = diagnosticCounts[d.code] || 0;
          if (count === 0) return null;
          return (
            <button
              key={d.code}
              onClick={() => setFilterCode(filterCode === d.code ? '' : d.code)}
              className={cn(
                'p-4 rounded-2xl border text-left transition-all',
                d.bg, d.border,
                filterCode === d.code ? 'ring-2 ring-blue-400 shadow-md' : 'hover:opacity-80'
              )}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className={d.color}>{getDiagnosticIcon(d.icon, 14)}</span>
                <span className={cn('text-[10px] font-black uppercase tracking-wider', d.color)}>{d.label}</span>
              </div>
              <div className={cn('text-2xl font-black', d.color)}>{count}</div>
              <div className="text-[9px] text-slate-500 mt-0.5 leading-tight">{d.description.split(' ').slice(0, 6).join(' ')}…</div>
            </button>
          );
        })}
      </div>

      {/* View switcher */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { id: 'obligation', label: 'By Obligation' },
            { id: 'norm', label: 'By Norm' },
            { id: 'matrix', label: 'Diagnostic Matrix' }
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id as any)}
              className={cn(
                'px-5 py-2 rounded-lg text-xs font-bold transition-all',
                view === v.id ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        {view === 'obligation' && (
          <select
            value={filterDomain}
            onChange={e => setFilterDomain(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="">All domains</option>
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        )}

        {(filterCode || filterDomain) && (
          <button onClick={() => { setFilterCode(''); setFilterDomain(''); }} className="text-xs font-bold text-blue-600 hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {/* BY OBLIGATION VIEW */}
      {view === 'obligation' && (
        <div className="space-y-3">
          {filteredObligations.map(o => {
            const def = DIAGNOSTICS[o.diagnostic];
            const isExp = expanded === `obl-${o.id}`;
            return (
              <div key={o.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setExpanded(isExp ? null : `obl-${o.id}`)}
                  className="w-full p-5 flex items-center gap-4 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <span className={cn('px-2.5 py-1 rounded-lg text-[10px] font-black border flex items-center gap-1.5 shrink-0', def.bg, def.border, def.color)}>
                    {getDiagnosticIcon(def.icon, 11)}
                    {def.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-slate-900 text-sm">{o.id}</div>
                    {o.domain && <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{o.domain}</div>}
                  </div>
                  <div className="hidden sm:flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900">L{o.maxAnchoring}/5</div>
                      <div className="text-[9px] text-slate-400">max anchor</div>
                    </div>
                    {o.gaps.length > 0 && (
                      <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {o.gaps.slice(0, 2).map((g, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded text-[9px] font-bold">{g}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {isExp ? <ChevronDown size={18} className="text-slate-400 shrink-0" /> : <ChevronRight size={18} className="text-slate-400 shrink-0" />}
                </button>

                {isExp && (
                  <div className="border-t border-slate-100 p-6 space-y-5 bg-slate-50/30">
                    <div className="grid md:grid-cols-3 gap-5">
                      <div className={cn('p-5 rounded-2xl border space-y-2', def.bg, def.border)}>
                        <div className={cn('text-[10px] font-black uppercase tracking-widest', def.color)}>Diagnostic</div>
                        <div className={cn('text-lg font-black flex items-center gap-2', def.color)}>
                          {getDiagnosticIcon(def.icon, 18)}
                          {def.label}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{def.description}</p>
                      </div>
                      <div className="p-5 bg-white rounded-2xl border border-slate-100 space-y-2">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Anchor</div>
                        <div className="font-bold text-slate-900 text-sm">{o.primaryNorm || 'None identified'}</div>
                        <div className="text-xs text-slate-500">Max anchoring: L{o.maxAnchoring}/5</div>
                      </div>
                      <div className="p-5 bg-white rounded-2xl border border-slate-100 space-y-2">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gap Types</div>
                        {o.gaps.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {o.gaps.map((g, i) => (
                              <span key={i} className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded text-[10px] font-bold">{g}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-emerald-600 font-bold">No gap type recorded</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">All Mapping Rows ({o.rows.length})</div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-left border-b border-slate-200 text-slate-500">
                              <th className="pb-2 pr-4 font-bold">Provision ID</th>
                              <th className="pb-2 pr-4 font-bold">Norm</th>
                              <th className="pb-2 pr-4 font-bold">Art.</th>
                              <th className="pb-2 pr-4 font-bold">Level</th>
                              <th className="pb-2 pr-4 font-bold">Match</th>
                              <th className="pb-2 font-bold">Gap</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {o.rows.map((r: any, i: number) => (
                              <tr key={i} className="hover:bg-white transition-colors">
                                <td className="py-2 pr-4 font-mono text-[10px] text-slate-600">{r.domestic_provision_id}</td>
                                <td className="py-2 pr-4 font-medium text-slate-900 max-w-[180px] truncate">{r.domestic_norm}</td>
                                <td className="py-2 pr-4 text-slate-500">{r.domestic_article}</td>
                                <td className="py-2 pr-4">
                                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-black',
                                    parseInt(r.anchoring_level) >= 4 ? 'bg-emerald-100 text-emerald-700' :
                                    parseInt(r.anchoring_level) >= 2 ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                  )}>L{r.anchoring_level}</span>
                                </td>
                                <td className="py-2 pr-4 text-slate-500">{r.match_type}</td>
                                <td className="py-2">
                                  {r.gap_type && r.gap_type !== 'None' && r.gap_type !== '' ? (
                                    <span className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded text-[9px] font-bold">{r.gap_type}</span>
                                  ) : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* BY NORM VIEW */}
      {view === 'norm' && (
        <div className="space-y-3">
          {normDiagnostics.map(n => {
            const def = DIAGNOSTICS[n.diagnostic];
            const isExp = expanded === `norm-${n.id}`;
            return (
              <div key={n.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setExpanded(isExp ? null : `norm-${n.id}`)}
                  className="w-full p-5 flex items-center gap-4 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-slate-900 text-sm truncate">{n.id}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={cn('px-2 py-0.5 rounded text-[9px] font-black border', def.bg, def.border, def.color)}>
                        {def.label}
                      </span>
                      {n.isOutdated && (
                        <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded text-[9px] font-bold">
                          PREDATES IHR 2005
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-right shrink-0">
                    <div>
                      <div className="text-lg font-black text-slate-900">{n.obligationsAnchored}</div>
                      <div className="text-[9px] text-slate-400">obligations</div>
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-900">L{n.maxAnchoring}</div>
                      <div className="text-[9px] text-slate-400">max level</div>
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-900">{n.meanAnchoring.toFixed(1)}</div>
                      <div className="text-[9px] text-slate-400">mean level</div>
                    </div>
                  </div>
                  {isExp ? <ChevronDown size={18} className="text-slate-400 shrink-0" /> : <ChevronRight size={18} className="text-slate-400 shrink-0" />}
                </button>

                {isExp && (
                  <div className="border-t border-slate-100 p-6 space-y-4 bg-slate-50/30">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className={cn('p-5 rounded-2xl border', def.bg, def.border)}>
                        <div className={cn('text-[10px] font-black uppercase tracking-widest mb-2', def.color)}>Instrument Diagnostic</div>
                        <p className="text-xs text-slate-700 leading-relaxed">{def.description}</p>
                        {n.isOutdated && (
                          <div className="mt-3 flex items-start gap-2 p-3 bg-white/70 rounded-xl border border-amber-100">
                            <Clock size={13} className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                              This instrument predates IHR 2005. Obligations it anchors may reflect textual alignment rather than purposive implementation, and may lack the updated procedural and institutional specifications that IHR 2005 requires.
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="p-5 bg-white rounded-2xl border border-slate-100 space-y-3">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gap Profile</div>
                        {n.gaps.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {n.gaps.map((g, i) => <span key={i} className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded text-[10px] font-bold">{g}</span>)}
                          </div>
                        ) : (
                          <span className="text-xs text-emerald-600 font-bold">No gap types associated</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Obligations Anchored ({n.rows.length} mapping rows)</div>
                      <div className="flex flex-wrap gap-2">
                        {[...new Set(n.rows.map((r: any) => r.obligation_id))].map((id: any) => (
                          <span key={id} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-bold border border-slate-200">{id}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MATRIX VIEW */}
      {view === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Diagnostic Matrix: IHR Obligations by Status</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {obligationDiagnostics.map(o => {
                const def = DIAGNOSTICS[o.diagnostic];
                return (
                  <div
                    key={o.id}
                    className={cn('p-3 rounded-xl border space-y-1 transition-all cursor-default', def.bg, def.border)}
                    title={`${o.id}: ${def.label}: ${def.description}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={def.color}>{getDiagnosticIcon(def.icon, 11)}</span>
                      <span className={cn('text-[9px] font-black uppercase tracking-wider truncate', def.color)}>{def.label}</span>
                    </div>
                    <div className="text-[10px] font-black text-slate-900 leading-tight">{o.id}</div>
                    <div className="text-[9px] text-slate-500 truncate">{o.primaryNorm}</div>
                    <div className={cn('text-[9px] font-bold', def.color)}>L{o.maxAnchoring}/5</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Legend</div>
            <div className="flex flex-wrap gap-3">
              {(Object.values(DIAGNOSTICS) as DiagnosticDef[]).map(d => (
                <div key={d.code} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold', d.bg, d.border, d.color)}>
                  {getDiagnosticIcon(d.icon, 12)}
                  {d.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Methodological note */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-4">
        <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-black text-amber-900 uppercase tracking-wider">Diagnostic Classification: Methodological Note</p>
          <p className="text-xs text-amber-800 leading-relaxed">
            Diagnostic codes are algorithmically derived from anchoring level, fit dimension scores, and gap type classifications in the NormTrace dataset. They classify the <em>legal-institutional anchoring quality</em>: not operational performance. A "Procedural Gap" means legally-assigned duties without defined procedures in the corpus; it does not confirm that procedures do not exist in practice. All classifications require expert legal validation before any policy application.
          </p>
        </div>
      </div>
    </div>
  );
}
