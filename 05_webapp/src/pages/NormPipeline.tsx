import React, { useState, useMemo } from 'react';
import { useCsvData } from '../hooks/useData';
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle, Info, XCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

// --- Tier inference ---
function inferTier(normName: string): 'constitutional' | 'statutory' | 'regulatory' | 'sub-regulatory' | 'unknown' {
  if (!normName) return 'unknown';
  const n = normName.toLowerCase();
  if (n.includes('cpeum') || n.includes('constitución') || n.includes('constitucion') || n.includes('constitution')) return 'constitutional';
  if (n.includes('ley') || n.includes('lgs') || n.includes('loapf') || n.includes('lgpdp') || n.includes('lfpdp') || n.includes('bioseguridad') || n.includes('institutos nacionales') || n.includes('salud animal')) return 'statutory';
  if (n.includes('reglamento') || n.includes('rlgs') || n.includes('ri-ss') || n.includes('reglamento interior')) return 'regulatory';
  if (n.includes('nom') || n.includes('norma') || n.includes('acuerdo') || n.includes('decreto') || n.includes('circular')) return 'sub-regulatory';
  return 'unknown';
}

// Is instrument outdated (predates IHR 2005)?
function isOutdated(normName: string): boolean {
  if (!normName) return false;
  return normName.includes('1985') || normName.includes('RLGS-SI') ||
    normName.includes('1984') || normName.includes('1986') || normName.includes('1990') || normName.includes('1995');
}

type PipelineStatus = 'green' | 'amber' | 'red' | 'grey';

interface Stage {
  id: string;
  label: string;
  sublabel: string;
  status: PipelineStatus;
  instrument?: string;
  anchoring?: number;
  issue?: string;
  detail?: string;
}

function buildPipeline(rows: any[]): Stage[] {
  const maxAnchoring = Math.max(...rows.map(r => parseInt(r.anchoring_level) || 0));
  const allNorms = rows.map(r => r.domestic_norm || '');
  const allGaps = rows.map(r => (r.gap_type || '').toLowerCase());
  const allActorFits = rows.map(r => (r.actor_fit || '').toLowerCase());
  const allProcFits = rows.map(r => (r.procedure_fit || '').toLowerCase());

  const constRows = rows.filter(r => inferTier(r.domestic_norm) === 'constitutional');
  const statRows = rows.filter(r => inferTier(r.domestic_norm) === 'statutory');
  const regRows = rows.filter(r => inferTier(r.domestic_norm) === 'regulatory' || inferTier(r.domestic_norm) === 'sub-regulatory');

  const maxStatAnchoring = statRows.length ? Math.max(...statRows.map(r => parseInt(r.anchoring_level) || 0)) : 0;
  const maxRegAnchoring = regRows.length ? Math.max(...regRows.map(r => parseInt(r.anchoring_level) || 0)) : 0;

  const hasOutdatedReg = regRows.some(r => isOutdated(r.domestic_norm || ''));
  const hasProcedural = allGaps.some(g => g.includes('procedural'));
  const hasRegGap = allGaps.some(g => g.includes('regulatory'));
  const hasFullGap = allGaps.some(g => g === 'full gap' || g === 'legal silence' || g === 'none');
  const hasCoordGap = allGaps.some(g => g.includes('coordination'));
  const hasRightsGap = allGaps.some(g => g.includes('rights'));
  const hasFederalGap = allGaps.some(g => g.includes('federal'));

  const actorStrong = allActorFits.some(f => f === 'strong');
  const actorPartial = allActorFits.some(f => f === 'partial');
  const actorNone = allActorFits.every(f => f === 'none identified' || f === 'none' || f === '');

  const procStrong = allProcFits.some(f => f === 'strong');
  const procPartial = allProcFits.some(f => f === 'partial');

  return [
    // Stage 1: IHR Source: always present
    {
      id: 'ihr',
      label: 'IHR Obligation',
      sublabel: 'International legal source',
      status: 'green',
      instrument: rows[0]?.obligation_id,
      detail: 'Legally binding obligation under International Health Regulations (2005). Entered into force for 196 States Parties on 15 June 2007.'
    },

    // Stage 2: Constitutional Bridge
    {
      id: 'constitutional',
      label: 'Constitutional Bridge',
      sublabel: 'CPEUM Art. 1 / 73 / 133',
      status: constRows.length > 0 ? 'green' : maxAnchoring >= 2 ? 'amber' : 'grey',
      instrument: constRows.length ? constRows[0].domestic_norm : 'Indirect (Art. 1 + 133 CPEUM)',
      detail: constRows.length
        ? `Explicit constitutional basis identified: ${constRows[0].domestic_norm}, Art. ${constRows[0].domestic_article}.`
        : 'No direct constitutional provision; obligation relies on general incorporation via Art. 133 (treaty supremacy) and Art. 1 pro-persona (2011 reform).',
      issue: constRows.length === 0 && maxAnchoring < 2 ? 'No constitutional anchor: depends on general treaty incorporation only' : undefined
    },

    // Stage 3: Statutory Layer
    {
      id: 'statutory',
      label: 'Statutory Layer',
      sublabel: 'Leyes Generales / Federales',
      status: maxStatAnchoring >= 4 ? 'green' : maxStatAnchoring >= 2 ? 'amber' : hasRegGap ? 'red' : maxStatAnchoring >= 1 ? 'amber' : 'red',
      instrument: statRows.length ? statRows.map(r => r.domestic_norm).filter((v, i, a) => a.indexOf(v) === i).join(', ') : undefined,
      anchoring: maxStatAnchoring,
      issue: maxStatAnchoring < 2 ? 'No statutory anchor identified: obligation lacks basis in law' :
        maxStatAnchoring < 4 ? 'Indirect statutory anchor only: general mandate language, no obligation-specific provision' : undefined,
      detail: maxStatAnchoring >= 4
        ? `Strong statutory basis in ${statRows[0]?.domestic_norm}. Specific operative provisions identified.`
        : maxStatAnchoring >= 2
        ? `Partial statutory basis via general mandate language. No obligation-specific statutory provision.`
        : 'No statutory instrument in corpus anchors this obligation. Implementation depends on sub-statutory instruments only.'
    },

    // Stage 4: Regulatory Layer
    {
      id: 'regulatory',
      label: 'Regulatory Layer',
      sublabel: 'Reglamentos / NOMs',
      status: maxRegAnchoring >= 3
        ? (hasOutdatedReg ? 'amber' : 'green')
        : maxRegAnchoring >= 1 ? 'amber' : 'grey',
      instrument: regRows.length ? regRows.map(r => r.domestic_norm).filter((v, i, a) => a.indexOf(v) === i).join(', ') : undefined,
      anchoring: maxRegAnchoring,
      issue: hasOutdatedReg ? 'Primary regulatory instrument predates IHR 2005: update review needed' :
        maxRegAnchoring < 1 ? 'No regulatory implementation identified' : undefined,
      detail: hasOutdatedReg
        ? `The primary anchoring instrument (${regRows.find(r => isOutdated(r.domestic_norm))?.domestic_norm}) was published before IHR 2005. Formal anchoring exists but content alignment has not been verified.`
        : maxRegAnchoring >= 3
        ? 'Regulatory provision exists with adequate specificity for this obligation.'
        : 'Regulatory basis is indirect or absent; obligation is not operationally specified at this level.'
    },

    // Stage 5: Institutional Actor
    {
      id: 'actor',
      label: 'Institutional Actor',
      sublabel: 'Competence & mandate',
      status: actorStrong ? 'green' : actorPartial ? 'amber' : actorNone ? 'red' : 'amber',
      issue: actorNone ? 'Actor competence not identified in corpus: responsibility is unclear' :
        actorPartial ? 'Actor identified but competence only partially defined: coordination gap likely' : undefined,
      detail: actorStrong
        ? 'Responsible actor legally identified with specific competences for this obligation.'
        : actorPartial
        ? 'Actor is present in the corpus but specific mandate for this obligation is indirect or incomplete.'
        : 'No actor with defined competence for this obligation identified in the available corpus.',
      instrument: rows.find(r => r.actor_fit && r.actor_fit.toLowerCase() !== 'none identified')?.domestic_norm
    },

    // Stage 6: Implementation Mechanism
    {
      id: 'implementation',
      label: 'Implementation Mechanism',
      sublabel: 'Procedures & accountability',
      status: hasProcedural ? 'red' : procStrong ? 'green' : hasFullGap ? 'grey' : procPartial ? 'amber' : 'amber',
      issue: hasProcedural ? 'Procedural gap: obligation-specific procedures not defined in corpus' :
        hasCoordGap ? 'Coordination gap: no inter-institutional mechanism established' :
        hasRightsGap ? 'Rights-safeguard gap: restrictive powers lack required individual protections' :
        hasFederalGap ? 'Federal gap: federal-to-state mandate chain not established' : undefined,
      detail: hasProcedural
        ? 'The obligation is legally present at some level but lacks operative procedures specifying who does what, by what mechanism, within what timeframe. This is the most common gap type in the Mexico corpus (33.8% of rows).'
        : procStrong
        ? 'Implementation procedures identified and legally specified.'
        : 'Implementation mechanisms are partial, indirect, or dependent on administrative practice rather than legal specification.'
    }
  ];
}

const STAGE_COLORS: Record<PipelineStatus, string> = {
  green: 'bg-emerald-500 border-emerald-500 text-white',
  amber: 'bg-amber-400 border-amber-400 text-white',
  red: 'bg-red-500 border-red-500 text-white',
  grey: 'bg-slate-200 border-slate-300 text-slate-500'
};

const CONNECTOR_COLORS: Record<PipelineStatus, string> = {
  green: 'bg-emerald-400',
  amber: 'bg-amber-300',
  red: 'bg-red-400',
  grey: 'bg-slate-200'
};

const STATUS_ICONS: Record<PipelineStatus, React.ReactNode> = {
  green: <CheckCircle size={13} />,
  amber: <Clock size={13} />,
  red: <XCircle size={13} />,
  grey: <Info size={13} />
};

const STATUS_LABELS: Record<PipelineStatus, string> = {
  green: 'Connected',
  amber: 'Partial',
  red: 'Blocked',
  grey: 'Missing'
};

// Overall flow status
function getOverallStatus(stages: Stage[]): { label: string; color: string; desc: string } {
  const reds = stages.filter(s => s.status === 'red').length;
  const ambers = stages.filter(s => s.status === 'amber').length;
  const greys = stages.filter(s => s.status === 'grey').length;
  if (reds >= 2) return { label: 'Blocked', color: 'text-red-600 bg-red-50 border-red-200', desc: 'Multiple pipeline stages are broken' };
  if (reds === 1) return { label: 'Restricted', color: 'text-red-600 bg-red-50 border-red-100', desc: 'Pipeline blocked at one or more stages' };
  if (greys >= 2) return { label: 'Incomplete', color: 'text-slate-600 bg-slate-100 border-slate-200', desc: 'Key pipeline stages are absent' };
  if (ambers >= 2) return { label: 'Partial Flow', color: 'text-amber-700 bg-amber-50 border-amber-200', desc: 'Multiple stages are only partially connected' };
  if (ambers === 1) return { label: 'Mostly Connected', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', desc: 'One stage requires strengthening' };
  return { label: 'Flowing', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', desc: 'All stages connected' };
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

export default function NormPipeline() {
  const { data: mapping, loading } = useCsvData<any>('mexico_ihr2005_mapping_clean.csv');
  const { data: obligations, loading: oblLoading } = useCsvData<any>('ihr_2005_obligations_clean.csv');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'blocked' | 'partial' | 'flowing'>('all');
  const [domainFilter, setDomainFilter] = useState('');

  // Build lookup: obligation_id -> { article, article_title, obligation_text_short, implementation_domain, minimum_domestic_requirement }
  const oblMap = useMemo(() => {
    const m: Record<string, any> = {};
    obligations.forEach((o: any) => {
      if (o.obligation_id) m[o.obligation_id.trim()] = o;
    });
    return m;
  }, [obligations]);

  const groups = useMemo(() => groupByObligation(mapping), [mapping]);

  const pipelines = useMemo(() => {
    return Object.entries(groups).map(([obligationId, rows]) => {
      const obl = oblMap[obligationId] || {};
      return {
        obligationId,
        article: obl.article || '',
        articleTitle: obl.article_title || '',
        obligationText: obl.obligation_text_short || rows[0]?.assessment_summary?.split('.')[0] || '',
        domain: obl.implementation_domain || rows[0]?.implementation_domain || '',
        minimumRequirement: obl.minimum_domestic_requirement || '',
        legalForce: obl.legal_force || 'Binding',
        stages: buildPipeline(rows),
        rows
      };
    }).sort((a, b) => a.obligationId.localeCompare(b.obligationId));
  }, [groups, oblMap]);

  const domains = useMemo(() => {
    return Array.from(new Set(pipelines.map(p => p.domain).filter(Boolean))).sort();
  }, [pipelines]);

  const filtered = useMemo(() => {
    return pipelines.filter(p => {
      const overall = getOverallStatus(p.stages);
      if (filter === 'blocked' && !overall.label.includes('Block') && !overall.label.includes('Restrict')) return false;
      if (filter === 'partial' && overall.label !== 'Partial Flow' && overall.label !== 'Mostly Connected' && overall.label !== 'Incomplete') return false;
      if (filter === 'flowing' && overall.label !== 'Flowing') return false;
      if (domainFilter && p.domain !== domainFilter) return false;
      return true;
    });
  }, [pipelines, filter, domainFilter]);

  const stats = useMemo(() => {
    const flowing = pipelines.filter(p => getOverallStatus(p.stages).label === 'Flowing').length;
    const blocked = pipelines.filter(p => ['Blocked', 'Restricted'].includes(getOverallStatus(p.stages).label)).length;
    const partial = pipelines.length - flowing - blocked;
    return { flowing, blocked, partial, total: pipelines.length };
  }, [pipelines]);

  if (loading || oblLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 pb-24">
      <header className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-widest text-blue-700">
          Normative Pipeline Analysis
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">Normative Pipeline</h1>
        <p className="text-lg text-slate-500 max-w-4xl">
          For each IHR 2005 obligation, trace the normative flow through Mexico's legal architecture: from international source to constitutional bridge, statutory layer, regulatory specification, institutional actor, and implementation mechanism.
        </p>
      </header>

      {/* Pipeline stats */}
      <div className="grid grid-cols-3 gap-4 border-t-2 border-slate-900 pt-10">
        {[
          { label: 'Flowing', value: stats.flowing, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', id: 'flowing' },
          { label: 'Partial / Incomplete', value: stats.partial, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', id: 'partial' },
          { label: 'Blocked / Restricted', value: stats.blocked, color: 'text-red-600', bg: 'bg-red-50 border-red-100', id: 'blocked' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setFilter(filter === s.id as any ? 'all' : s.id as any)}
            className={cn('p-5 rounded-2xl border text-left transition-all', s.bg, filter === s.id ? 'ring-2 ring-blue-400' : 'hover:opacity-80')}
          >
            <div className={`text-3xl font-semibold ${s.color}`}>{s.value}</div>
            <div className="text-xs font-medium text-slate-600 mt-1">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center border-t border-slate-200 pt-8">
        <select
          value={domainFilter}
          onChange={e => setDomainFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none"
        >
          <option value="">All IHR Domains</option>
          {domains.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {filtered.length} obligations shown
        </span>
        {(filter !== 'all' || domainFilter) && (
          <button onClick={() => { setFilter('all'); setDomainFilter(''); }} className="text-xs font-bold text-blue-600 hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Pipeline Status Legend</div>
        <div className="flex flex-wrap gap-4">
          {(['green', 'amber', 'red', 'grey'] as PipelineStatus[]).map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn('w-4 h-4 rounded-full flex items-center justify-center text-[9px]', STAGE_COLORS[s])}>
                {STATUS_ICONS[s]}
              </div>
              <span className="text-xs font-bold text-slate-600">{STATUS_LABELS[s]}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
            <div className="w-8 h-1 bg-emerald-400 rounded" />
            <span className="text-xs text-slate-500">Flow connected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-red-400 rounded" style={{ background: 'repeating-linear-gradient(90deg, #f87171 0px, #f87171 4px, transparent 4px, transparent 8px)' }} />
            <span className="text-xs text-slate-500">Flow blocked</span>
          </div>
        </div>
      </div>

      {/* Pipelines */}
      <div className="space-y-4">
        {filtered.map(p => {
          const overall = getOverallStatus(p.stages);
          const isExp = expanded === p.obligationId;

          return (
            <div key={p.obligationId} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300 transition-all">
              {/* Header */}
              <button
                onClick={() => { setExpanded(isExp ? null : p.obligationId); setExpandedStage(null); }}
                className="w-full p-5 flex items-center gap-4 text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="shrink-0">
                  <span className={cn('px-2.5 py-1 rounded-lg text-[10px] font-semibold border', overall.color)}>
                    {overall.label}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    {p.article && (
                      <span className="font-semibold text-blue-700 text-sm shrink-0">{p.article}</span>
                    )}
                    {p.articleTitle && (
                      <span className="font-bold text-slate-900 text-sm">{p.articleTitle}</span>
                    )}
                    {!p.article && <span className="font-semibold text-slate-500 text-xs font-mono">{p.obligationId}</span>}
                  </div>
                  {p.obligationText && (
                    <div className="text-[11px] text-slate-500 leading-snug line-clamp-2 max-w-xl">{p.obligationText}</div>
                  )}
                  {p.domain && (
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.domain}</div>
                  )}
                </div>

                {/* Mini pipeline bar */}
                <div className="hidden md:flex items-center gap-1 shrink-0">
                  {p.stages.map((stage, i) => (
                    <React.Fragment key={stage.id}>
                      <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[9px]', STAGE_COLORS[stage.status])}>
                        {STATUS_ICONS[stage.status]}
                      </div>
                      {i < p.stages.length - 1 && (
                        <div className={cn('w-4 h-0.5 rounded', CONNECTOR_COLORS[stage.status])} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="shrink-0 text-slate-400">
                  {isExp ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </button>

              {/* Expanded pipeline detail */}
              {isExp && (
                <div className="border-t border-slate-100 p-6 space-y-8 bg-slate-50/30">

                  {/* IHR obligation context */}
                  {(p.obligationText || p.minimumRequirement) && (
                    <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-blue-900 text-white text-[10px] font-semibold rounded-lg">{p.article || p.obligationId}</span>
                        {p.articleTitle && <span className="font-bold text-blue-900 text-sm">{p.articleTitle}</span>}
                        {p.legalForce && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-semibold rounded uppercase tracking-wider">{p.legalForce}</span>
                        )}
                      </div>
                      {p.obligationText && (
                        <p className="text-sm text-blue-800 leading-relaxed font-medium">{p.obligationText}</p>
                      )}
                      {p.minimumRequirement && (
                        <div className="pt-2 border-t border-blue-100">
                          <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mb-1">Minimum domestic legal requirement</div>
                          <p className="text-xs text-blue-700 leading-relaxed">{p.minimumRequirement}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Full pipeline visualization */}
                  <div className="overflow-x-auto pb-2">
                    <div className="flex items-start gap-0 min-w-[700px]">
                      {p.stages.map((stage, i) => (
                        <React.Fragment key={stage.id}>
                          <button
                            onClick={() => setExpandedStage(expandedStage === `${p.obligationId}-${stage.id}` ? null : `${p.obligationId}-${stage.id}`)}
                            className={cn(
                              'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all min-w-[120px] text-center group',
                              stage.status === 'green' ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-400' :
                              stage.status === 'amber' ? 'border-amber-200 bg-amber-50 hover:border-amber-400' :
                              stage.status === 'red' ? 'border-red-200 bg-red-50 hover:border-red-400' :
                              'border-slate-200 bg-slate-50 hover:border-slate-400',
                              expandedStage === `${p.obligationId}-${stage.id}` ? 'ring-2 ring-blue-400' : ''
                            )}
                          >
                            <div className={cn('w-9 h-9 rounded-full flex items-center justify-center', STAGE_COLORS[stage.status])}>
                              {STATUS_ICONS[stage.status]}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-900 leading-tight">{stage.label}</div>
                            <div className="text-[9px] text-slate-500 leading-tight">{stage.sublabel}</div>
                            {stage.issue && (
                              <div className="mt-1">
                                <AlertTriangle size={11} className="text-amber-500 mx-auto" />
                              </div>
                            )}
                          </button>

                          {/* Connector */}
                          {i < p.stages.length - 1 && (
                            <div className="flex items-center self-center shrink-0 mx-1 mt-4">
                              <div
                                className={cn('h-1 w-8 rounded',
                                  stage.status === 'green' && p.stages[i+1].status === 'green' ? 'bg-emerald-400' :
                                  stage.status === 'red' || p.stages[i+1].status === 'red' ? 'bg-red-400 opacity-50' :
                                  stage.status === 'amber' || p.stages[i+1].status === 'amber' ? 'bg-amber-300' :
                                  'bg-slate-200'
                                )}
                                style={
                                  (stage.status === 'red' || p.stages[i+1].status === 'red')
                                    ? { background: 'repeating-linear-gradient(90deg, #f87171 0px, #f87171 4px, transparent 4px, transparent 8px)' }
                                    : {}
                                }
                              />
                              <ChevronRight size={12} className={cn(
                                stage.status === 'green' ? 'text-emerald-400' :
                                stage.status === 'red' ? 'text-red-400' :
                                stage.status === 'amber' ? 'text-amber-400' : 'text-slate-300'
                              )} />
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Stage detail panel */}
                  {p.stages.map(stage => {
                    if (expandedStage !== `${p.obligationId}-${stage.id}`) return null;
                    return (
                      <div key={stage.id} className={cn(
                        'p-6 rounded-2xl border space-y-3',
                        stage.status === 'green' ? 'bg-emerald-50 border-emerald-200' :
                        stage.status === 'amber' ? 'bg-amber-50 border-amber-200' :
                        stage.status === 'red' ? 'bg-red-50 border-red-200' :
                        'bg-slate-100 border-slate-200'
                      )}>
                        <div className="flex items-center gap-2">
                          <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs', STAGE_COLORS[stage.status])}>
                            {STATUS_ICONS[stage.status]}
                          </div>
                          <span className="font-semibold text-slate-900">{stage.label}</span>
                          <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold', STAGE_COLORS[stage.status])}>
                            {STATUS_LABELS[stage.status]}
                          </span>
                        </div>
                        {stage.instrument && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Instrument: </span>
                            <span className="text-xs font-bold text-slate-900">{stage.instrument}</span>
                          </div>
                        )}
                        {stage.anchoring !== undefined && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Anchoring level: </span>
                            <span className="text-xs font-bold text-slate-900">{stage.anchoring}/5</span>
                          </div>
                        )}
                        {stage.issue && (
                          <div className="flex items-start gap-2 p-3 bg-white/70 rounded-xl border border-amber-100">
                            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs font-medium text-amber-900">{stage.issue}</p>
                          </div>
                        )}
                        {stage.detail && (
                          <p className="text-xs text-slate-600 leading-relaxed">{stage.detail}</p>
                        )}
                      </div>
                    );
                  })}

                  {/* Source rows summary */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Mapping Rows ({p.rows.length})</div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left border-b border-slate-200">
                            <th className="pb-2 pr-4 font-bold text-slate-500">Provision</th>
                            <th className="pb-2 pr-4 font-bold text-slate-500">Norm</th>
                            <th className="pb-2 pr-4 font-bold text-slate-500">Level</th>
                            <th className="pb-2 pr-4 font-bold text-slate-500">Match</th>
                            <th className="pb-2 font-bold text-slate-500">Gap</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {p.rows.map((r: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-2 pr-4 font-mono text-[10px] text-slate-700">{r.domestic_provision_id}</td>
                              <td className="py-2 pr-4 font-medium text-slate-900 max-w-[180px] truncate">{r.domestic_norm}</td>
                              <td className="py-2 pr-4">
                                <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-semibold',
                                  parseInt(r.anchoring_level) >= 4 ? 'bg-emerald-100 text-emerald-700' :
                                  parseInt(r.anchoring_level) >= 2 ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                                )}>L{r.anchoring_level}</span>
                              </td>
                              <td className="py-2 pr-4 text-slate-600">{r.match_type}</td>
                              <td className="py-2">
                                {r.gap_type && r.gap_type !== 'None' && r.gap_type !== '' ? (
                                  <span className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-bold">{r.gap_type}</span>
                                ) : (
                                  <span className="text-slate-300 text-[10px]">—</span>
                                )}
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

      {/* Methodological note */}
      <div className="border-t border-slate-200 pt-8">
        <div className="bg-slate-900 text-white rounded-2xl p-10 space-y-4">
          <div className="flex items-center gap-3">
            <Info size={22} className="text-blue-400 shrink-0" />
            <h3 className="text-xl font-semibold">Methodological Note: Pipeline Analysis</h3>
          </div>
          <p className="text-slate-300 leading-relaxed max-w-4xl text-sm">
            The normative pipeline reconstructs the legal pathway each IHR obligation must traverse to produce domestic operational effect. Stage status is derived from the anchoring scale (L0-L5), fit dimension scores (actor, procedure, coordination, enforcement, rights-safeguard, federalism), and gap type classification in the NormTrace mapping dataset. The pipeline does not assess operational performance: a "Connected" stage indicates textual legal-institutional anchoring in the available corpus, not confirmed operational implementation. The primary diagnostic value lies in identifying <strong>where the pipeline breaks</strong>: obligations that traverse the constitutional and statutory stages but fail at the regulatory or procedural level reveal a structurally different reform challenge than obligations with legal silence at the statutory level.
          </p>
          <p className="text-slate-400 text-xs italic">
            Outputs are preliminary AI-assisted and require expert legal validation. See <span className="font-bold">Habibi et al., Lancet, 2020</span> for IHR compliance analysis informing this diagnostic approach.
          </p>
        </div>
      </div>
    </div>
  );
}
