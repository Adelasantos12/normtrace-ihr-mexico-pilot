import { useNavigate } from 'react-router-dom';
import {
  Shield, ArrowRight, GitMerge, Activity, AlertTriangle,
  Layers, ChevronRight, Zap, Scale, Network
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <div className="absolute top-0 right-0 -z-10 w-full lg:w-[55%] h-[35%] bg-gradient-to-bl from-blue-50/70 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-10 lg:pt-20 pb-24">

        {/* Header */}
        <header className="flex justify-between items-center mb-16 lg:mb-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-900 text-white font-black text-lg tracking-tighter">NT-IHR</div>
            <div>
              <div className="font-black text-base tracking-tight">NormTrace-IHR</div>
              <div className="text-[9px] text-slate-400 font-mono opacity-70">DOI: 10.5281/zenodo.20085170</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Mexico Pilot v0.1</span>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors"
            >
              Launch Platform
            </button>
          </div>
        </header>

        {/* Hero */}
        <div className="space-y-6 mb-16">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-100">
              <Shield size={11} /> IHR Legal Traceability Infrastructure
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100">
              Complex Adaptive Systems Analysis
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold border border-slate-200">
              Preliminary · Expert Review Required
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
            Tracing the Domestic<br />
            <span className="text-blue-700 underline decoration-blue-100 underline-offset-8">Legal Pipeline</span><br />
            of IHR Implementation
          </h1>

          <p className="text-lg text-slate-500 max-w-3xl leading-relaxed font-medium">
            NormTrace-IHR maps each International Health Regulations obligation through Mexico's normative architecture: from constitutional bridge to statutory anchor to regulatory provision to institutional actor: identifying where the legal pipeline flows, where it narrows, and where it breaks entirely.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 group"
            >
              Explore Analysis <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/pipeline')}
              className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all group"
            >
              <Zap size={16} /> View Pipeline <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/methodology')}
              className="px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              Methodology
            </button>
          </div>
        </div>

        {/* Key Findings */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            {
              value: '1.76/5',
              label: 'Mean Anchoring Score',
              sub: '45 IHR 2005 obligations: concentrated at L1–L2',
              color: 'text-red-600',
              bg: 'bg-red-50 border-red-100'
            },
            {
              value: '44%',
              label: 'Obligations involve CC1',
              sub: '20 of 45 implicate legislative reform as precondition',
              color: 'text-amber-600',
              bg: 'bg-amber-50 border-amber-100'
            },
            {
              value: '1985',
              label: 'Primary IHR Instrument',
              sub: 'RLGS-SI predates IHR 2005 by 20 years',
              color: 'text-blue-700',
              bg: 'bg-blue-50 border-blue-100'
            },
            {
              value: '33.8%',
              label: 'Procedural Gaps',
              sub: 'Duties legally assigned but procedures undefined',
              color: 'text-slate-700',
              bg: 'bg-slate-50 border-slate-200'
            }
          ].map((f, i) => (
            <div key={i} className={`p-5 rounded-2xl border ${f.bg} space-y-2`}>
              <div className={`text-3xl font-black ${f.color}`}>{f.value}</div>
              <div className="text-xs font-bold text-slate-700">{f.label}</div>
              <div className="text-[10px] text-slate-500 leading-relaxed">{f.sub}</div>
            </div>
          ))}
        </div>

        {/* Pipeline concept */}
        <div className="bg-slate-900 text-white rounded-[2rem] p-10 mb-16 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black">The Normative Pipeline</h2>
              <p className="text-slate-400 text-sm">Six-stage internalisation flow from international obligation to domestic implementation</p>
            </div>
          </div>

          <p className="text-slate-300 max-w-3xl leading-relaxed">
            IHR obligations do not self-execute. Each must traverse a domestic normative pipeline: constitutional incorporation, statutory mandate, regulatory specification, institutional actor competence, procedural design, and implementation mechanism. NormTrace reconstructs this pipeline for each obligation, revealing where flow is blocked, where instruments are misaligned with their hierarchical level, and where actors have formal mandates without operational procedures.
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {[
              { label: 'IHR Obligation', color: 'bg-blue-600' },
              { label: '→' },
              { label: 'Constitutional Bridge', color: 'bg-indigo-600' },
              { label: '→' },
              { label: 'Statutory Layer', color: 'bg-emerald-600' },
              { label: '→' },
              { label: 'Regulatory Layer', color: 'bg-teal-600' },
              { label: '→' },
              { label: 'Institutional Actor', color: 'bg-amber-600' },
              { label: '→' },
              { label: 'Implementation Mechanism', color: 'bg-orange-600' },
            ].map((s, i) => (
              'color' in s
                ? <span key={i} className={`px-3 py-1.5 rounded-lg text-white font-bold ${s.color}`}>{s.label}</span>
                : <span key={i} className="text-slate-500 font-bold text-base">{s.label}</span>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/pipeline')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all group"
            >
              Explore Pipeline Analysis <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Analytical Layers */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Analytical Architecture</h2>
          <p className="text-slate-500 text-sm mb-8">Six integrated layers for diagnosing IHR internalisation across Mexico's normative system</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Layers,
                title: 'Normative Hierarchy',
                desc: "Mexico's 5-tier legal pyramid: CPEUM through acuerdos: with IHR anchoring by tier and constitutional bloc analysis",
                path: '/normative-hierarchy',
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                tag: 'Legal Architecture'
              },
              {
                icon: Activity,
                title: 'Norm Diagnostic',
                desc: 'Cross-matrix: IHR obligation × domestic norm: diagnostic status per pair: outdated, fragmented, orphaned, tier-mismatched',
                path: '/norm-diagnostic',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                tag: 'Diagnostic Layer'
              },
              {
                icon: Network,
                title: 'Actors & CAS Topology',
                desc: 'Institutional network as a complex adaptive system: hubs, bridges, decoupled actors, and structural bottlenecks in health governance',
                path: '/actors',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                tag: 'Network Analysis'
              },
              {
                icon: Scale,
                title: 'Political Brain',
                desc: "Institutional authority topology: formal mandates versus operational realities, reform feasibility, veto players, and political decoupling",
                path: '/political-brain',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                tag: 'Political Layer'
              },
              {
                icon: GitMerge,
                title: 'IHR Mapping Explorer',
                desc: '45 obligations × 110 domestic provisions: anchoring scale, 6 fit dimensions, gap typology, IHR 2024 update pressure',
                path: '/mapping',
                color: 'text-amber-600',
                bg: 'bg-amber-50',
                tag: 'Obligation Mapping'
              },
              {
                icon: AlertTriangle,
                title: 'Implementation Gap Map',
                desc: '19 gap areas classified by type, responsible actor, update pressure, and capacity-building entry points for reform',
                path: '/gap-map',
                color: 'text-red-600',
                bg: 'bg-red-50',
                tag: 'Gap Analysis'
              },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className="group bg-white border border-slate-200 rounded-2xl p-6 text-left hover:border-blue-200 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${item.bg}`}>
                    <item.icon size={20} className={item.color} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded border border-slate-100">{item.tag}</span>
                </div>
                <div>
                  <h3 className="font-black text-slate-900 group-hover:text-blue-700 transition-colors text-base">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1.5">{item.desc}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ChevronRight size={13} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Why NormTrace */}
        <div className="mb-16 p-8 bg-slate-50 border border-slate-200 rounded-[2rem] space-y-5">
          <h2 className="text-xl font-black text-slate-900">The Problem NormTrace Addresses</h2>
          <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-600 leading-relaxed">
            <div className="space-y-3">
              <p>
                The IHR Monitoring and Evaluation Framework (SPAR, JEE) assesses reported capacity levels. Bishowkarma et al. (2026) documented improved alignment between SPAR and JEE across most indicators in recent editions, while identifying that three capacity areas retain significant score disagreement: infection prevention and control, healthcare-associated infection surveillance, and <strong>national IHR focal point functions</strong> — precisely the capacities that depend most directly on legal-institutional anchoring.
              </p>
              <p>
                Even when SPAR and JEE agree, neither instrument traces the domestic legal foundation of the capacity being measured. A country may score well on NFP functions because its DGE performs the role operationally, while lacking the statutory designation IHR Art. 4 requires. That is a real gap — invisible to aggregate scoring, visible through legal traceability.
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
          <div className="flex flex-wrap gap-3 pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key reference:</span>
            <span className="text-[10px] text-slate-500 italic">Bishowkarma K, et al. Estimating global public health security preparedness capacity: the contribution of SPAR and JEE. <em>Dialogues Health</em>. 2026;8:100282.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-10 grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div className="sm:col-span-2 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analytical Framework</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              NormTrace-IHR applies legal-institutional traceability as its core methodology, drawing on multi-level governance theory (Hooghe and Marks, 2003), institutional decoupling analysis (Meyer and Rowan, 1977), and network science (Freeman, 1978; Granovetter, 1973) for the actor topology layer. The normative pipeline concept captures the cascading structure of domestic legal architectures without reducing them to a single compliance score. IHR compliance and reform scholarship — notably Habibi et al. (<em>Lancet</em>, 2020) — informs the diagnostic framework for identifying where obligations are formally present but operationally blocked.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mexico Pilot v0.1</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 w-fit">
                <AlertTriangle size={12} /> PASS_WITH_FINDINGS
              </div>
              <p className="text-[10px] text-slate-500">Proof-of-concept pilot. Framework designed for replication across legal systems.</p>
              <p className="text-[10px] text-slate-400 font-mono opacity-60">DOI: 10.5281/zenodo.20085170</p>
              <p className="text-[10px] text-slate-400 italic">Preliminary AI-assisted outputs. Expert legal review required before any policy application.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
