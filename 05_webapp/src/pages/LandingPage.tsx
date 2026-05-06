import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Database,
  Search,
  GitMerge,
  ShieldCheck,
  Scale,
  FileText,
  Workflow,
  Brain,
  Users,
  AlertCircle
} from 'lucide-react';
import { useCsvData } from '../hooks/useData';
import { useMemo } from 'react';

export function LandingPage() {
  const { data: mappingData } = useCsvData<any>('mexico_ihr2005_mapping_clean.csv');
  const { data: provisionsData } = useCsvData<any>('mexico_legal_provisions_clean.csv');
  const { data: actorsData } = useCsvData<any>('mexico_health_governance_actors_clean.csv');
  const { data: corpusData } = useCsvData<any>('mexico_normative_corpus_index_clean.csv');
  const { data: gapData } = useCsvData<any>('mexico_implementation_gap_map_clean.csv');

  const stats = useMemo(() => {
    return {
      instruments: corpusData?.length || 0,
      obligations: mappingData ? new Set(mappingData.map((m: any) => m.obligation_id)).size : 0,
      provisions: provisionsData?.length || 0,
      actors: actorsData?.length || 0,
      gaps: gapData?.length || 0
    };
  }, [mappingData, provisionsData, actorsData, corpusData, gapData]);

  return (
    <div className="space-y-20 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-10">
        <h1 className="text-6xl font-extrabold text-blue-900 tracking-tight">
          NormTrace-IHR <span className="text-blue-600">Mexico Pilot</span>
        </h1>
        <p className="text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium">
          Country-specific legal internalisation mapping infrastructure for the International Health Regulations and pandemic governance.
        </p>
        <div className="flex flex-col items-center gap-4 max-w-3xl mx-auto bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-inner">
          <p className="text-slate-700 font-bold italic">
            "NormTrace-IHR maps international health obligations against Mexico’s domestic legal architecture. It traces how obligations connect to legal instruments, actors, competences, procedures, coordination mechanisms, safeguards and review needs."
          </p>
        </div>
        <div className="flex justify-center gap-4 pt-4">
          <Link to="/dashboard" className="bg-blue-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Explore Dashboard <ArrowRight size={20} />
          </Link>
          <Link to="/methodology" className="bg-white text-blue-700 border border-blue-200 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-sm">
            Read Methodology
          </Link>
        </div>
      </section>

      {/* Workflow Chain */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-2">
            <Workflow className="text-blue-600" />
            How the System Works
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">A structural reconstruction of legal internalisation</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 relative">
          {[
            { icon: Database, label: "Domestic Legal Corpus", desc: "Load and index Mexican laws & regulations" },
            { icon: Scale, label: "Hierarchy & Sector", desc: "Classify legal weight and administrative sector" },
            { icon: Search, label: "Extract Provisions", desc: "Identify relevant articles and institutional actors" },
            { icon: GitMerge, label: "Match Obligations", desc: "Connect IHR rules to specific domestic anchors" },
            { icon: ShieldCheck, label: "Identify Gaps", desc: "Assess anchoring levels and review needs" },
            { icon: FileText, label: "Policy Outputs", desc: "Generate actionable legal intelligence" },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center p-4 group relative">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-700 group-hover:text-white transition-colors shadow-sm">
                <step.icon size={24} />
              </div>
              <h3 className="font-bold text-xs mb-2 h-8 flex items-center">{step.label}</h3>
              <p className="text-[10px] text-slate-500 leading-tight font-medium">{step.desc}</p>
              {i < 5 && (
                <div className="hidden md:block absolute top-10 -right-4 text-slate-300">
                  <ArrowRight size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Legal Brain Section */}
      <section className="grid md:grid-cols-2 gap-12 items-center bg-slate-900 text-white p-16 rounded-[3rem] overflow-hidden relative border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <Brain size={400} />
        </div>
        <div className="space-y-6 relative z-10">
          <h2 className="text-4xl font-black tracking-tight">Mexico Legal Brain</h2>
          <p className="text-slate-300 leading-relaxed text-lg font-medium">
            NormTrace-IHR is not a keyword-matching tool. It uses a <strong>Mexico-specific legal system profile</strong> to reconstruct the institutional logic of pandemic governance.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              "Constitutional Architecture", "Treaties & Domestic Effect", "Legal Hierarchy", "Federalism & Jurisdiction",
              "Health Governance Architecture", "Public Administration Rules", "Regulatory Instruments", "Oversight Mechanisms"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-800/50 p-10 rounded-[2rem] border border-slate-700 relative overflow-hidden group shadow-inner">
          <div className="space-y-6">
            <h3 className="font-black text-blue-400 uppercase tracking-widest text-xs">Structural Mapping Chain</h3>
            <div className="space-y-3 text-sm font-mono text-slate-300 font-bold">
               <div className="flex items-center gap-2 text-slate-100">IHR Obligation</div>
               <div className="pl-4 border-l border-slate-600 flex items-center gap-2">↓ Legal Instrument</div>
               <div className="pl-8 border-l border-slate-600 flex items-center gap-2">↓ Provision & Article</div>
               <div className="pl-12 border-l border-slate-600 flex items-center gap-2 text-blue-400">↓ Actor & Competence</div>
               <div className="pl-16 border-l border-slate-600 flex items-center gap-2">↓ Procedure & Mechanism</div>
               <div className="pl-20 border-l border-slate-600 flex items-center gap-2 text-green-400">↓ Anchoring & Review Need</div>
            </div>
          </div>
        </div>
      </section>

      {/* Corpus Summary */}
      <section className="space-y-12">
        <h2 className="text-3xl font-black text-slate-900 text-center tracking-tight">Mexico Pilot v0.1 Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            { label: "Legal Instruments", value: stats.instruments, icon: FileText },
            { label: "IHR Obligations", value: stats.obligations, icon: GitMerge },
            { label: "Provisions Extracted", value: stats.provisions, icon: Database },
            { label: "Actors Identified", value: stats.actors, icon: Users },
            { label: "Gap Areas", value: stats.gaps, icon: AlertCircle },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-2 hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <stat.icon size={20} />
              </div>
              <p className="text-4xl font-black text-blue-950">{stat.value || "..."}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
