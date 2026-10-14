import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, GitMerge, Activity, AlertTriangle,
  Layers, ChevronRight, Scale, Network, TrendingDown, Shield
} from 'lucide-react';
import AuditNotice from '../components/AuditNotice';
import { PreliminaryBanner } from '../components/PreliminaryBanner';
import { useJsonData } from '../hooks/useData';

// Shape of 05_webapp/public/data/derived/spar_normtrace_divergence.json
// (computed by 06_scripts/build_tables/spar_normtrace_bridge.py). Never
// hard-code the CC1 self-report or divergence figures here -- read them so
// this page always matches /spar-bridge and regenerates automatically when
// the source SPAR panel (02_data/raw/spar_americas_clean.csv) is corrected.
interface Cc1Headline {
  spar_self_report_latest: number; spar_self_report_mean: number;
  normtrace_legal_anchoring_pct: number;
  divergence_latest: number; divergence_mean: number;
}
interface Divergence { headline_cc1: Cc1Headline; cc1_spar_series: { latest_year: number } }

const HERO_TAGS = ['Federal presidential republic', 'Romano-Germanic civil law', 'Constitution 1917', 'CPEUM Art. 4 + 73(XVI)'];

const PIPELINE_STAGES = [
  'IHR Obligation', 'Constitutional Bridge', 'Statutory Layer',
  'Regulatory Layer', 'Institutional Actor', 'Implementation Mechanism',
];

const ADVANCED_LAYERS = [
  {
    icon: Layers,
    title: 'Normative Hierarchy',
    desc: "Mexico's 5-tier legal pyramid: CPEUM through acuerdos, with IHR anchoring by tier and constitutional bloc analysis",
    path: '/normative-hierarchy',
  },
  {
    icon: Activity,
    title: 'Norm Diagnostic',
    desc: 'Cross-matrix of IHR obligation × domestic norm: diagnostic status per pair — outdated, fragmented, orphaned, tier-mismatched',
    path: '/norm-diagnostic',
  },
  {
    icon: Network,
    title: 'Actors & CAS Topology',
    desc: 'Corpus-derived source associations; exploratory CAS interpretations remain unvalidated',
    path: '/actors',
  },
  {
    icon: Scale,
    title: 'Political Brain',
    desc: 'Archived institutional hypotheses, separated from documentary findings and observed practice',
    path: '/political-brain',
  },
  {
    icon: GitMerge,
    title: 'IHR Mapping Explorer',
    desc: 'Obligation-level records, cited provisions, provisional coding and documented review status',
    path: '/mapping',
  },
  {
    icon: AlertTriangle,
    title: 'Implementation Gap Map',
    desc: 'Legacy synthesis retained for review; current source corrections are documented in the audit',
    path: '/gap-map',
  },
];

const REFERENCES = [
  'Bishowkarma K, et al. Estimating global public health security preparedness capacity: the contribution of SPAR and JEE. Dialogues Health. 2026;8:100282.',
  'Habibi R, et al. Do not violate the International Health Regulations during the COVID-19 outbreak. Lancet. 2020;395(10225):664–6.',
  'Hooghe L, Marks G. Multi-level governance and European integration. 2003.',
  'Meyer JW, Rowan B. Institutionalized organizations: formal structure as myth and ceremony. Am J Sociol. 1977;83(2):340–363.',
  'Freeman LC. Centrality in social networks: conceptual clarification. Social Networks. 1978.',
  'Granovetter M. The strength of weak ties. Am J Sociol. 1973.',
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { data: spar } = useJsonData<Divergence>('derived/spar_normtrace_divergence.json');
  const cc1 = spar?.headline_cc1;
  const { data: audit } = useJsonData<any>('derived/audit_20261014.json');

  const KPI_STATS = [
    { label: 'Selected IHR obligations', value: String(audit?.counts.obligations ?? '…'), icon: Shield, color: '#10b981', sub: 'IHR 2005 pilot registry; not all obligations of every instrument' },
    { label: 'Federal instruments in corpus', value: String(audit?.counts.instruments ?? '…'), icon: Layers, color: '#0ea5e9', sub: 'Source corpus, not the smaller connected network' },
    { label: 'Obligation–provision records', value: String(audit?.counts.mapping_rows ?? '…'), icon: Activity, color: '#0ea5e9', sub: 'Source corrections applied; legal review remains pending' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-8 lg:pt-10">

        {/* Header */}
        <header className="flex justify-between items-center pb-6 mb-8">
          <div>
            <div className="font-bold text-lg tracking-tight text-slate-900">NormTrace-IHR</div>
            <div className="text-xs text-slate-400">Mexico Pilot v0.1 · DOI 10.5281/zenodo.20085170</div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors flex items-center gap-1.5"
          >
            Launch platform <ArrowRight size={14} />
          </button>
        </header>

        {/* Hero */}
        <div className="rounded-[20px] p-8 sm:p-12 text-white space-y-5 bg-gradient-to-br from-slate-900 via-[#0c2a4a] to-[#1e3a5f] mb-8">
          <PreliminaryBanner /><AuditNotice />

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-widest">NormTrace · Diagnostic Pilot</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">IHR (2005) Legal Traceability</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold leading-[1.15] tracking-tight">
            Following IHR obligations<br />
            <span className="text-sky-400">through domestic law</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            NormTrace links selected IHR obligations to domestic provisions and institutional responsibilities. SPAR already asks countries to review their legal frameworks. This pilot makes the documentary correspondences available for inspection. It is not a second capacity score, and it does not measure actual coordination.</p>

          <div className="flex flex-wrap gap-2">
            {HERO_TAGS.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full bg-sky-400/10 border border-sky-400/20 text-[11px] text-sky-300 font-medium">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2">
            <button
              onClick={() => navigate('/actors')}
              className="px-6 py-3 bg-sky-500 text-white rounded-full font-medium flex items-center gap-2 hover:bg-sky-400 transition-colors"
            >
              Explore the traceability network <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/spar-bridge')}
              className="text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors flex items-center gap-1"
            >
              SPAR ↔ Legal <ChevronRight size={14} />
            </button>
            <button
              onClick={() => navigate('/methodology')}
              className="text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors flex items-center gap-1"
            >
              Methodology <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Key metrics — icon + colored number card grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
          {KPI_STATS.map((s) => (
            <div key={s.label} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-1.5">
              <s.icon size={18} color={s.color} />
              <div className="text-2xl font-extrabold text-slate-900 leading-none mt-1">{s.value}</div>
              <div className="text-xs font-semibold text-slate-600">{s.label}</div>
              <div className="text-[11px] text-slate-400">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Why 45: scope note to prevent conflation with the corpus's other, larger totals */}
        <p className="text-[11px] text-slate-400 leading-relaxed mb-10">
          <strong className="text-slate-500 font-semibold">Why 45:</strong> this figure counts the individual obligations
          extracted from the IHR (2005) treaty text itself, the instrument the Mexico pilot maps obligation-by-obligation.
          The IHR 2024 amendment tracks 57 changes in its own dataset. The Pandemic Agreement is a separate treaty
          carrying 83 obligations. PABS is still an unadopted draft annex, currently listing 38 provisional elements.
          None of these totals should be combined with the 45; each keeps its own registry under{' '}
          <button onClick={() => navigate('/international')} className="underline hover:text-sky-500">International Instruments</button>.
        </p>

        {/* Pipeline concept */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">The normative pipeline</h2>
            <p className="text-slate-400 text-xs mt-1">Six analytical layers for examining domestic legal sources</p>
          </div>

          <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
            Each obligation must be examined in the context of the domestic legal system. Relevant evidence can include constitutional provisions, statutes, regulations, technical standards and documents incorporated by reference. These are analytical layers, not a mandatory sequence of six new legal instruments.</p>

          <ol className="flex flex-wrap items-center gap-x-2 gap-y-3 text-sm">
            {PIPELINE_STAGES.map((stage, i) => (
              <li key={stage} className="flex items-center gap-2">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="w-5 h-5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  {stage}
                </span>
                {i < PIPELINE_STAGES.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
              </li>
            ))}
          </ol>

          <button
            onClick={() => navigate('/pipeline')}
            className="text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors flex items-center gap-1"
          >
            Explore pipeline analysis <ChevronRight size={14} />
          </button>
        </div>

        {/* Advanced analytical layers */}
        <div className="mb-10">
          <h2 className="text-base font-bold text-slate-900 mb-1">Explore the diagnostic</h2>
          <p className="text-slate-400 text-xs mb-4">Supplementary views behind the four core sections above — useful for deep dives, not required for the headline finding</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ADVANCED_LAYERS.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="group text-left flex gap-3 items-start p-4 bg-white border border-slate-200 rounded-2xl hover:border-sky-200 transition-colors"
              >
                <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg shrink-0">
                  <item.icon size={15} className="text-sky-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors text-sm">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Why NormTrace — full-bleed dark panel */}
      <div className="bg-gradient-to-br from-slate-900 via-[#0c2a4a] to-[#1e3a5f] text-white py-14">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-sky-400">Why NormTrace</div>
          <h2 className="text-2xl font-bold">The problem NormTrace addresses</h2>
          <div className="grid md:grid-cols-2 gap-10 text-sm text-slate-400 leading-relaxed">
            <div className="space-y-3">
              <p>
                SPAR C1.1 includes national and subnational legal mapping. C2.1 examines the focal point and its mandate. NormTrace complements this work by organizing sources around individual obligations.</p>
              <p>
                The published score alone does not allow a reader to inspect every supporting provision. Legal and administrative arrangements must be assessed on their content and authority; IHR Article 4 does not universally require designation through a statute.</p>
            </div>
            <div className="space-y-3">
              <p>
                NormTrace does not compete with SPAR or JEE. It adds a different analytical dimension: for each IHR obligation, it reconstructs which specific domestic legal instrument, actor, and procedure currently anchor it, at which hierarchical level, and with what structural gaps.
              </p>
              <p>
                The Mexico pilot is a proof of concept for a replicable framework adaptable to any legal system with a publicly accessible normative corpus. The methodology does not produce compliance scores: it produces legal-institutional records that identify sources and questions for further review before proposing reform.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">
        {/* Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div className="sm:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Analytical framework</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              NormTrace-IHR applies legal-institutional traceability as its core methodology, drawing on multi-level governance theory, institutional decoupling analysis, and network science for the actor topology layer. The normative pipeline concept captures the cascading structure of domestic legal architectures without reducing them to a single compliance score. IHR compliance and reform scholarship informs the diagnostic framework for identifying where documentary relationships require further examination. Full references below.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Mexico Pilot v0.1</h4>
            <div className="flex items-center gap-1.5 text-amber-700 font-medium text-xs">
              <AlertTriangle size={12} /> Source corrections applied; expert validation pending
            </div>
            <p className="text-xs text-slate-500">Proof-of-concept pilot. Framework designed for replication across legal systems.</p>
            <p className="text-xs text-slate-400 italic">Preliminary AI-assisted outputs. Expert legal review required before any policy application.</p>
          </div>
        </div>

        {/* References */}
        <div className="border-t border-slate-200 pt-6 mt-8">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">References</h4>
          <ol className="space-y-1.5">
            {REFERENCES.map((ref, i) => (
              <li key={i} className="text-xs text-slate-400 leading-relaxed flex gap-2">
                <span className="text-slate-300 tabular-nums shrink-0">{i + 1}.</span>
                <span>{ref}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
