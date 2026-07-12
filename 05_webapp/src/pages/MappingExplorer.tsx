import { useMemo, useState } from 'react';
import { useCsvData } from '../hooks/useData';
import {
  Search, Shield, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronUp, Filter, Info, Globe,
  Activity, ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

type Tab = 'ihr2005' | 'ihr2024' | 'pa';

const LABELS: any = {
  anchoring_level: 'Anchoring level',
  gap_type: 'Gap type',
  confidence_level: 'Confidence',
  domestic_norm: 'Domestic norm',
  implementation_domain: 'Implementation domain',
  article: 'Article',
  match_type: 'Match type',
  review_status: 'Review status'
};

const FIT_LABELS: any = {
  actor_fit: 'Actor Fit',
  procedure_fit: 'Procedure Fit',
  coordination_fit: 'Coordination Fit',
  enforcement_fit: 'Enforcement Fit',
  rights_safeguard_fit: 'Rights Safeguard Fit',
  federalism_fit: 'Federalism Fit'
};

export default function MappingExplorer() {
  const { data: mapping, loading: l1 } = useCsvData<any>('mexico_ihr2005_mapping_clean.csv');
  const { data: obl, loading: l2 } = useCsvData<any>('ihr_2005_obligations_clean.csv');
  const { data: changes, loading: l3 } = useCsvData<any>('ihr_2024_changes_clean.csv');
  const { data: pa, loading: l4 } = useCsvData<any>('pandemic_agreement_obligations_clean.csv');
  const { data: pabs, loading: l5 } = useCsvData<any>('pabs_draft_obligations_clean.csv');

  const [tab, setTab] = useState<Tab>('ihr2005');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({ article: '', domain: '', norm: '', level: '', gap: '', conf: '' });

  const joined = useMemo(() => {
    const byId = new Map(obl.map((o) => [o.obligation_id, o]));
    return mapping.map((m) => ({ ...m, ...(byId.get(m.obligation_id) || {}) }));
  }, [mapping, obl]);

  const filtered = useMemo(() => joined.filter((r) =>
    (!filters.article || r.article === filters.article) &&
    (!filters.domain || r.implementation_domain === filters.domain) &&
    (!filters.norm || r.domestic_norm === filters.norm) &&
    (!filters.level || String(r.anchoring_level) === filters.level) &&
    (!filters.gap || r.gap_type === filters.gap) &&
    (!filters.conf || r.confidence_level === filters.conf)
  ), [joined, filters]);

  const stats = useMemo(() => ({
    obligations: new Set(mapping.map(m => m.obligation_id)).size,
    anchors: mapping.filter(m => parseInt(m.anchoring_level) > 0).length,
    sensitive: mapping.filter(m => m.review_status === 'REVIEW_REQUIRED').length,
    gaps: new Set(mapping.map(m => m.gap_type).filter(g => g && g !== 'none')).size
  }), [mapping]);

  if (l1 || l2 || l3 || l4 || l5) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Loading legal mapping data...</p>
      </div>
    </div>
  );

  const uniq = (k: string) => Array.from(new Set(joined.map((r) => r[k]).filter(Boolean))).sort();

  const getLevelColor = (level: any) => {
    const l = parseInt(level);
    if (l >= 4) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (l >= 2) return 'bg-blue-50 text-blue-700 border-blue-100';
    if (l >= 1) return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="space-y-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">International Legal Mapping</h1>
          <p className="text-lg text-slate-600 mt-2 max-w-4xl">
            Trace IHR 2005 obligations, IHR 2024 update pressure, and Pandemic Agreement/PABS readiness against Mexico’s domestic legal corpus.
          </p>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'IHR 2005 Obligations', value: stats.obligations, icon: Globe, color: 'text-blue-600' },
            { label: 'Domestic Anchors', value: stats.anchors, icon: Shield, color: 'text-emerald-600' },
            { label: 'Review-Sensitive', value: stats.sensitive, icon: AlertTriangle, color: 'text-amber-600' },
            { label: 'Primary Gap Types', value: stats.gaps, icon: Activity, color: 'text-purple-600' }
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className={cn("p-3 rounded-xl bg-slate-50", s.color)}>
                <s.icon size={20} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{s.value}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </header>

      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          ['ihr2005', 'IHR 2005 baseline mapping'],
          ['ihr2024', 'IHR 2024 update pressure'],
          ['pa', 'Pandemic Agreement / PABS readiness']
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id as Tab)}
            className={cn(
              "px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
              tab === id
                ? "bg-white text-blue-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'ihr2005' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
              <Filter size={18} />
              <span>Filters</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {[
                { key: 'article', label: 'Article', field: 'article' },
                { key: 'domain', label: 'Implementation domain', field: 'implementation_domain' },
                { key: 'norm', label: 'Domestic norm', field: 'domestic_norm' },
                { key: 'level', label: 'Anchoring level', field: 'anchoring_level' },
                { key: 'gap', label: 'Gap type', field: 'gap_type' },
                { key: 'conf', label: 'Confidence', field: 'confidence_level' }
              ].map((f) => (
                <div key={f.key} className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{f.label}</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    value={filters[f.key]}
                    onChange={(e) => setFilters({ ...filters, [f.key]: e.target.value })}
                  >
                    <option value="">All {f.label}</option>
                    {uniq(f.field).map((v: any) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-slate-500 font-medium italic">
                Showing {filtered.length} of {joined.length} mappings
              </div>
            </div>

            <div className="grid gap-4">
              {filtered.map((r) => {
                const id = `${r.mapping_id}`;
                const isExpanded = expanded === id;
                return (
                  <div key={id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-blue-200 transition-colors">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : id)}
                      className="w-full text-left p-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest">
                              {r.instrument} — {r.article}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">ID: {r.obligation_id}</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">{r.article_title || 'Untitled obligation area'}</h3>
                          <p className="text-sm text-slate-600 line-clamp-2">{r.obligation_text_short}</p>

                          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap gap-y-3">
                            <div className="w-full md:w-1/2">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Domestic anchor</div>
                              <div className="text-sm font-bold text-slate-800">
                                {r.domestic_norm}
                                <span className="mx-2 text-slate-300">/</span>
                                Art. {r.domestic_article}
                                <span className="ml-2 text-slate-400 font-normal text-xs">({r.domestic_provision_id})</span>
                              </div>
                            </div>
                            <div className="w-full md:w-1/2 flex flex-wrap gap-2 items-center">
                              <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-sm", getLevelColor(r.anchoring_level))}>
                                L{r.anchoring_level}
                              </span>
                              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                                {r.match_type}
                              </span>
                              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                                {r.gap_type}
                              </span>
                              {r.review_status === 'REVIEW_REQUIRED' && (
                                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                                  <AlertTriangle size={10} /> REVIEW
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex lg:flex-col items-center gap-2">
                           <div className={cn(
                             "w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center transition-transform",
                             isExpanded && "rotate-180 bg-slate-50"
                           )}>
                             <ChevronDown size={16} className="text-slate-400" />
                           </div>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/30 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <section className="space-y-2">
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Info size={14} className="text-blue-600"/> Assessment Details
                              </h4>
                              <div className="space-y-4">
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Anchoring reason</div>
                                  <p className="text-sm text-slate-700">{r.anchoring_reason || 'Not identified in current corpus'}</p>
                                </div>
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Minimum domestic requirement</div>
                                  <p className="text-sm text-slate-700">{r.minimum_domestic_requirement || 'Not identified in current corpus'}</p>
                                </div>
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assessment summary</div>
                                  <p className="text-sm text-slate-700 italic">{r.assessment_summary}</p>
                                </div>
                                {r.reviewer_notes && (
                                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                    <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Reviewer notes</div>
                                    <p className="text-xs text-blue-700">{r.reviewer_notes}</p>
                                  </div>
                                )}
                              </div>
                            </section>

                            <section className="space-y-2">
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Implications</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Implementation domain</div>
                                  <div className="text-xs text-slate-700 font-medium">{r.implementation_domain}</div>
                                </div>
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence</div>
                                  <div className="text-xs text-slate-700 font-medium">{r.confidence_level}</div>
                                </div>
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rights implications</div>
                                  <div className="text-xs text-slate-700">{r.rights_implications || 'None identified'}</div>
                                </div>
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Federalism implications</div>
                                  <div className="text-xs text-slate-700">{r.federalism_implications || 'None identified'}</div>
                                </div>
                              </div>
                            </section>
                          </div>

                          <section className="space-y-4">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Structural Fit Analysis</h4>
                            <div className="space-y-3">
                              {Object.entries(FIT_LABELS).map(([key, label]: [string, any]) => (
                                <div key={key} className="flex items-center justify-between group">
                                  <span className="text-xs text-slate-500">{label}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div
                                        className={cn(
                                          "h-full transition-all",
                                          parseInt(r[key]) >= 4 ? "bg-emerald-500" :
                                          parseInt(r[key]) >= 2 ? "bg-blue-500" :
                                          "bg-slate-300"
                                        )}
                                        style={{ width: `${(parseInt(r[key]) / 5) * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-700 w-4 text-right">{r[key]}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-6 p-4 bg-white border border-slate-200 rounded-xl">
                               <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Obligation Text</h5>
                               <p className="text-xs text-slate-600 leading-relaxed">{r.obligation_text_short}</p>
                            </div>
                          </section>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'ihr2024' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4 items-start">
            <Info className="text-blue-600 shrink-0 mt-1" size={20} />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-blue-900">IHR 2024 Update Layer</h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                This tab shows how the IHR (2024) amendments create new domestic requirements or modify existing ones.
                Mappings are linked to the baseline IHR 2005 obligations where applicable.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {changes.map((r, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 hover:border-blue-200 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-4">
                   <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-blue-900 text-white rounded text-[10px] font-black uppercase tracking-widest">
                        {r.article_or_annex}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        r.type_of_change === 'New' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                      )}>
                        {r.type_of_change}
                      </span>
                   </div>
                   <div className="flex gap-2">
                      {r.requires_legal_review === 'Yes' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                           <AlertTriangle size={10} /> REVIEW REQUIRED
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-slate-400">Linked to: {r.relevant_ihr2005_obligation_id}</span>
                   </div>
                </div>

                <div>
                   <h3 className="font-bold text-slate-900">{r.new_or_modified_concept}</h3>
                   <p className="text-sm text-slate-600 mt-1 leading-relaxed">{r.change_summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                   <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">New requirement</div>
                      <div className="text-xs font-medium text-slate-800">{r.creates_new_domestic_requirement}</div>
                   </div>
                   <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Modifies existing</div>
                      <div className="text-xs font-medium text-slate-800">{r.modifies_existing_requirement}</div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'pa' && (
        <div className="space-y-12">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-4 items-start">
            <AlertTriangle className="text-amber-600 shrink-0 mt-1" size={20} />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-900">Provisional Readiness Assessment</h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                Pandemic Agreement and PABS-related assessments remain provisional until final instrument adoption and annex finalization.
              </p>
            </div>
          </div>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-xs">PA</div>
              <h2 className="text-xl font-bold text-slate-900">Pandemic Agreement Obligations</h2>
            </div>
            <div className="grid gap-4">
              {pa.map((r, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-black uppercase tracking-widest">
                      Article {r.article}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{r.theme}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{r.obligation_or_commitment_summary}</p>
                    <p className="text-xs text-slate-500 mt-2 italic">{r.notes}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
                     <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
                        <div className="text-[10px] font-medium text-slate-800">{r.legal_status}</div>
                     </div>
                     <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Anchoring required</div>
                        <div className="text-[10px] font-medium text-slate-800">{r.requires_domestic_legal_anchoring}</div>
                     </div>
                     <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Possible Actor</div>
                        <div className="text-[10px] font-medium text-slate-800">{r.possible_domestic_actor}</div>
                     </div>
                     <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Domain</div>
                        <div className="text-[10px] font-medium text-slate-800">{r.implementation_domain}</div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-xs">PABS</div>
              <h2 className="text-xl font-bold text-slate-900">PABS Draft Obligations</h2>
            </div>
            <div className="grid gap-4">
              {pabs.map((r, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                   <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-black uppercase tracking-widest">
                      Section {r.section}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{r.draft_element}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{r.draft_obligation_or_requirement_summary}</p>
                    <p className="text-xs text-slate-500 mt-2 italic">{r.notes}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
                     <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
                        <div className="text-[10px] font-medium text-slate-800">{r.provisional_legal_status}</div>
                     </div>
                     <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Possible Actor</div>
                        <div className="text-[10px] font-medium text-slate-800">{r.possible_domestic_actor}</div>
                     </div>
                     <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Domain</div>
                        <div className="text-[10px] font-medium text-slate-800">{r.implementation_domain}</div>
                     </div>
                     <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Annex Depend.</div>
                        <div className="text-[10px] font-medium text-slate-800">{r.depends_on_final_pabs_annex}</div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
