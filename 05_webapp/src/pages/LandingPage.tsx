import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, GitMerge, Activity, AlertTriangle,
  Layers, ChevronRight, Scale, Network, TrendingDown, Shield, Clock
} from 'lucide-react';
import { PreliminaryBanner } from '../components/PreliminaryBanner';

const HERO_TAGS = ['Federal presidential republic', 'Romano-Germanic civil law', 'Constitution 1917', 'CPEUM Art. 4 + 73(XVI)'];

const KPI_STATS = [
  { label: 'CC1 divergence', value: '+46.6 pts', icon: TrendingDown, color: '#dc2626', sub: 'SPAR self-report above legal anchoring' },
  { label: 'Mean anchoring score', value: '1.76 / 5', icon: Activity, color: '#0ea5e9', sub: '45 IHR 2005 obligations, corpus-wide' },
  { label: 'Primary IHR instrument', value: '1985', icon: Clock, color: '#f59e0b', sub: 'RLGS-SI predates IHR 2005 by 20 years' },
  { label: 'IHR obligations mapped', value: '45', icon: Shield, color: '#10b981', sub: '110 domestic provisions, 18 instruments' },
];

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
    desc: 'Institutional network as a complex adaptive system: hubs, bridges, decoupled actors, and structural bottlenecks in health governance',
    path: '/actors',
  },
  {
    icon: Scale,
    title: 'Political Brain',
    desc: 'Institutional authority topology: formal mandates versus operational realities, reform feasibility, veto players, and political decoupling',
    path: '/political-brain',
  },
  {
    icon: GitMerge,
    title: 'IHR Mapping Explorer',
    desc: '45 obligations × 110 domestic provisions: anchoring scale, six fit dimensions, gap typology, IHR 2024 update pressure',
    path: '/mapping',
  },
  {
    icon: AlertTriangle,
    title: 'Implementation Gap Map',
    desc: '19 gap areas classified by type, responsible actor, update pressure, and capacity-building entry points for reform',
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
          <PreliminaryBanner />

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-widest">NormTrace · Diagnostic Pilot</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">IHR (2005) Legal Traceability</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold leading-[1.15] tracking-tight">
            Legal capacity, reported<br />
            <span className="text-sky-400">vs. legal capacity, anchored</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            NormTrace-IHR traces every IHR (2005) obligation to the specific domestic legal instrument that
            anchors it — constitution, statute, regulation, or none at all. For CC1 (Legislation, policy &amp;
            financing), Mexico self-reports 81% capacity to WHO SPAR; NormTrace finds 34% of the same
            obligations actually anchored in domestic law.
          </p>

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {KPI_STATS.map((s) => (
            <div key={s.label} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-1.5">
              <s.icon size={18} color={s.color} />
              <div className="text-2xl font-extrabold text-slate-900 leading-none mt-1">{s.value}</div>
              <div className="text-xs font-semibold text-slate-600">{s.label}</div>
              <div className="text-[11px] text-slate-400">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Pipeline concept */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">The normative pipeline</h2>
            <p className="text-slate-400 text-xs mt-1">Six-stage internalisation flow from international obligation to domestic implementation</p>
          </div>

          <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
            IHR obligations do not self-execute. Each must traverse a domestic normative pipeline: constitutional
            incorporation, statutory mandate, regulatory specification, institutional actor competence, procedural
            design, and implementation mechanism. NormTrace reconstructs this pipeline for each obligation,
            revealing where flow is blocked, where instruments are misaligned with their hierarchical level, and
            where actors have formal mandates without operational procedures.
          </p>

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
                The IHR Monitoring and Evaluation Framework (SPAR, JEE) assesses reported capacity levels. Bishowkarma et al. (2026) documented improved alignment between SPAR and JEE across most indicators in recent editions, while identifying that three capacity areas retain significant score disagreement: infection prevention and control, healthcare-associated infection surveillance, and <strong className="text-white">national IHR focal point functions</strong> — precisely the capacities that depend most directly on legal-institutional anchoring.
              </p>
              <p>
                Even when SPAR and JEE agree, neither instrument traces the domestic legal foundation of the capacity being measured. A country may score well on NFP functions because its DGE performs the role operationally, while lacking the statutory designation IHR Art. 4 requires — a real gap, invisible to aggregate scoring, visible through legal traceability.
              </p>
            </div>
            <div className="space-y-3">
              <p>
                NormTrace does not compete with SPAR or JEE. It adds a different analytical dimension: for each IHR obligation, it reconstructs which specific domestic legal instrument, actor, and procedure currently anchor it, at which hierarchical level, and with what structural gaps.
              </p>
              <p>
                The Mexico pilot is a proof of concept for a replicable framework adaptable to any legal system with a publicly accessible normative corpus. The methodology does not produce compliance scores: it produces legal-institutional maps that identify where reform is needed, at what normative level, and for which actor.
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
              NormTrace-IHR applies legal-institutional traceability as its core methodology, drawing on multi-level governance theory, institutional decoupling analysis, and network science for the actor topology layer. The normative pipeline concept captures the cascading structure of domestic legal architectures without reducing them to a single compliance score. IHR compliance and reform scholarship informs the diagnostic framework for identifying where obligations are formally present but operationally blocked. Full references below.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Mexico Pilot v0.1</h4>
            <div className="flex items-center gap-1.5 text-amber-700 font-medium text-xs">
              <AlertTriangle size={12} /> Pass, with findings
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
