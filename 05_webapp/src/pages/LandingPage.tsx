import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, GitMerge, Activity, AlertTriangle,
  Layers, ChevronRight, Scale, Network
} from 'lucide-react';
import { PreliminaryBanner } from '../components/PreliminaryBanner';

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

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-12 lg:pt-20 pb-24">

        {/* Header */}
        <header className="flex justify-between items-center mb-20">
          <div>
            <div className="font-semibold text-lg tracking-tight text-slate-900">NormTrace-IHR</div>
            <div className="text-xs text-slate-400">Mexico Pilot v0.1 · DOI 10.5281/zenodo.20085170</div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            Launch platform <ArrowRight size={14} />
          </button>
        </header>

        {/* Hero */}
        <div className="space-y-6 mb-20 max-w-3xl">
          <PreliminaryBanner />

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-slate-900">
            Legal capacity, reported<br />
            <span className="text-blue-600">vs. legal capacity, anchored</span>
          </h1>

          <p className="text-lg text-slate-500 leading-relaxed">
            NormTrace-IHR traces every IHR (2005) obligation to the specific domestic legal instrument that
            anchors it — constitution, statute, regulation, or none at all. For CC1 (Legislation, policy &amp;
            financing), Mexico self-reports 81% capacity to WHO SPAR; NormTrace finds 34% of the same
            obligations actually anchored in domestic law.
          </p>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2">
            <button
              onClick={() => navigate('/actors')}
              className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              Explore the traceability network <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/spar-bridge')}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              SPAR ↔ Legal <ChevronRight size={14} />
            </button>
            <button
              onClick={() => navigate('/methodology')}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              Methodology <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Key findings — lead with the two hook numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-100 rounded-2xl overflow-hidden mb-20 border border-slate-100">
          {[
            {
              value: '81% vs 34%',
              color: 'text-red-600',
              label: 'CC1 (Legislation): SPAR self-report vs legal anchoring',
              sub: 'Mexico reports 80.6% mean legislative capacity to WHO SPAR; NormTrace finds 34.0% legal anchoring for the same 20 obligations — a +46.6pt gap. Scoped to CC1 only.',
            },
            {
              value: '1.76/5',
              color: 'text-slate-900',
              label: 'Mean anchoring score',
              sub: '45 IHR 2005 obligations, corpus-wide: concentrated at L1–L2 (indirect/partial)',
            },
            {
              value: '1985',
              color: 'text-slate-900',
              label: 'Primary IHR instrument',
              sub: 'RLGS-SI predates IHR 2005 by 20 years and was never amended to reflect it',
            },
          ].map((f, i) => (
            <div key={i} className="bg-white p-6 space-y-2">
              <div className={`text-3xl font-bold ${f.color}`}>{f.value}</div>
              <div className="text-sm font-medium text-slate-700">{f.label}</div>
              <div className="text-xs text-slate-400 leading-relaxed">{f.sub}</div>
            </div>
          ))}
        </div>

        {/* Pipeline concept */}
        <div className="mb-20 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">The normative pipeline</h2>
            <p className="text-slate-400 text-sm mt-1">Six-stage internalisation flow from international obligation to domestic implementation</p>
          </div>

          <p className="text-slate-600 max-w-3xl leading-relaxed">
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
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
                  {stage}
                </span>
                {i < PIPELINE_STAGES.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
              </li>
            ))}
          </ol>

          <button
            onClick={() => navigate('/pipeline')}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            Explore pipeline analysis <ChevronRight size={14} />
          </button>
        </div>

        {/* Advanced analytical layers */}
        <div className="mb-20">
          <h2 className="text-2xl font-semibold text-slate-900 mb-1">Advanced analytical layers</h2>
          <p className="text-slate-400 text-sm mb-8">Supplementary views behind the four core sections above — useful for deep dives, not required for the headline finding</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            {ADVANCED_LAYERS.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="group text-left space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <item.icon size={16} className="text-slate-400" />
                  <h3 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors text-sm">{item.title}</h3>
                  <ChevronRight size={13} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Why NormTrace */}
        <div className="mb-20 pt-10 border-t border-slate-100 space-y-5">
          <h2 className="text-xl font-semibold text-slate-900">The problem NormTrace addresses</h2>
          <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-600 leading-relaxed">
            <div className="space-y-3">
              <p>
                The IHR Monitoring and Evaluation Framework (SPAR, JEE) assesses reported capacity levels. Bishowkarma et al. (2026) documented improved alignment between SPAR and JEE across most indicators in recent editions, while identifying that three capacity areas retain significant score disagreement: infection prevention and control, healthcare-associated infection surveillance, and <strong className="text-slate-900">national IHR focal point functions</strong> — precisely the capacities that depend most directly on legal-institutional anchoring.
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
          <p className="text-xs text-slate-400 italic">
            Key reference: Bishowkarma K, et al. Estimating global public health security preparedness capacity: the contribution of SPAR and JEE. <em>Dialogues Health</em>. 2026;8:100282.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-10 grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div className="sm:col-span-2 space-y-3">
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide">Analytical framework</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              NormTrace-IHR applies legal-institutional traceability as its core methodology, drawing on multi-level governance theory (Hooghe and Marks, 2003), institutional decoupling analysis (Meyer and Rowan, 1977), and network science (Freeman, 1978; Granovetter, 1973) for the actor topology layer. The normative pipeline concept captures the cascading structure of domestic legal architectures without reducing them to a single compliance score. IHR compliance and reform scholarship, notably Habibi et al. (<em>Lancet</em>, 2020), informs the diagnostic framework for identifying where obligations are formally present but operationally blocked.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide">Mexico Pilot v0.1</h4>
            <div className="flex items-center gap-1.5 text-amber-700 font-medium text-xs">
              <AlertTriangle size={12} /> PASS_WITH_FINDINGS
            </div>
            <p className="text-xs text-slate-500">Proof-of-concept pilot. Framework designed for replication across legal systems.</p>
            <p className="text-xs text-slate-400 italic">Preliminary AI-assisted outputs. Expert legal review required before any policy application.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
