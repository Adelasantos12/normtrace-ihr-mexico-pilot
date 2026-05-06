import { cn } from '../lib/utils';
import {
  Workflow,
  Brain,
  Code,
  Scale,
  ShieldCheck,
  Layers,
  Search,
  FileText,
  UserCheck,
  Zap,
  Info
} from 'lucide-react';

export function Methodology() {
  return (
    <div className="space-y-20 pb-32">
      <header className="space-y-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Methodology</h1>
        <p className="text-lg text-slate-500 max-w-4xl font-medium">
          Structural analysis workflow for mapping international health obligations against country-specific legal architectures.
        </p>
      </header>

      {/* Analytical Workflow */}
      <section className="space-y-12">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Workflow className="text-blue-600" />
          NormTrace Analytical Workflow
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: 1, title: "Corpus Ingestion", icon: FileText, desc: "Selective ingestion of Mexican legal instruments." },
            { step: 2, title: "Hierarchy Mapping", icon: Layers, desc: "Classification of legal weight and jurisdiction." },
            { step: 3, title: "Structural Profile", icon: Brain, desc: "Construction of Mexico's legal-institutional 'brain'." },
            { step: 4, title: "Pattern Detection", icon: Search, desc: "Detection of legislative drafting patterns." },
            { step: 5, title: "Provision Extraction", icon: Code, desc: "Identification of relevant articles and actors." },
            { step: 6, title: "Actor Mapping", icon: UserCheck, desc: "Mapping of institutional competences and roles." },
            { step: 7, title: "IHR Classification", icon: Zap, desc: "Categorization of international health obligations." },
            { step: 8, title: "Anchoring Assessment", icon: Scale, desc: "Tracing obligations to specific domestic anchors." },
            { step: 9, title: "Gap Typology", icon: ShieldCheck, desc: "Identification of normative and institutional gaps." },
            { step: 10, title: "Policy Outputs", icon: Info, desc: "Generation of actionable legal intelligence." },
          ].map((item) => (
            <div key={item.step} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 relative group hover:border-blue-300 transition-colors">
              <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                {item.step}
              </div>
              <h3 className="font-bold text-xs text-slate-900 leading-tight">{item.title}</h3>
              <p className="text-[10px] text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Legal Brain Section */}
      <section className="bg-slate-900 text-white p-12 rounded-[3rem] space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <Brain size={300} />
        </div>
        <div className="max-w-3xl space-y-6 relative z-10">
          <h2 className="text-3xl font-bold flex items-center gap-3">
             <Brain className="text-blue-400" />
             The Country-Specific Legal Brain
          </h2>
          <p className="text-slate-300 leading-relaxed text-lg">
             NormTrace creates a <strong>country-specific legal reasoning layer</strong> before mapping. Unlike generic keyword-matching tools, the system interprets obligations within the context of Mexico's unique constitutional and administrative framework.
          </p>
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 pt-4">
             {[
               "Constitutional Architecture", "Federalism & Distribution of Powers", "Treaty Incorporation Rules",
               "Legal Hierarchy & Instruments", "Health Governance Architecture", "Administrative Law Principles",
               "Regulatory Technique Patterns", "Oversight & Safeguard Mechanisms"
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  {item}
               </div>
             ))}
          </div>
          <div className="p-6 bg-blue-500/10 border border-blue-400/20 rounded-2xl mt-8">
             <p className="text-sm text-blue-200 leading-relaxed">
                <strong>Note on Portability:</strong> Because matching is performed against a specific legal architecture, the logic used for Mexico is not directly portable to other countries without constructing a new country legal profile.
             </p>
          </div>
        </div>
      </section>

      {/* Technical Framework */}
      <section className="grid md:grid-cols-2 gap-12">
         <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
               <Scale className="text-blue-600" />
               Anchoring Scale (0–5)
            </h2>
            <div className="space-y-3">
               {[
                 { l: "L5", t: "Integrated Implementation Anchoring", d: "Obligation is fully internalised in statutory text with explicit procedures and actors.", c: "bg-green-600" },
                 { l: "L4", t: "Strong Statutory-Administrative Anchoring", d: "Explicit legislative basis with advanced regulatory or operational development.", c: "bg-green-500" },
                 { l: "L3", t: "Partial Statutory Anchoring", d: "Identifiable legislative anchor, but lacking specific procedural or coordination clarity.", c: "bg-blue-600" },
                 { l: "L2", t: "Administrative/Operational Anchoring", d: "Internalisation occurs via non-statutory instruments, circulars or guidelines.", c: "bg-blue-400" },
                 { l: "L1", t: "Indirect Contextual Anchoring", d: "General legal principles provide a functional anchor without explicit IHR wording.", c: "bg-amber-500" },
                 { l: "L0", t: "No Identifiable Anchoring", d: "No specific domestic anchor identified in the available corpus.", c: "bg-slate-400" },
               ].map((item) => (
                  <div key={item.l} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                     <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0", item.c)}>
                        {item.l}
                     </div>
                     <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.t}</h4>
                        <p className="text-[10px] text-slate-500 mt-1">{item.d}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
               <ShieldCheck className="text-blue-600" />
               Gap Typology
            </h2>
            <div className="grid grid-cols-1 gap-2">
               {[
                 "Legal silence", "Competence ambiguity", "Administrative-only anchoring",
                 "Procedural gap", "Coordination gap", "Federal implementation gap",
                 "Rights-safeguard gap", "Oversight gap", "Budget/capacity gap", "Update-review needed"
               ].map((gap, i) => (
                  <div key={i} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between">
                     {gap}
                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  </div>
               ))}
            </div>

            <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl space-y-3">
               <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                  <UserCheck size={18} />
                  The Human-AI Workflow
               </h3>
               <p className="text-xs text-amber-900 leading-relaxed">
                  NormTrace-IHR leverages a hybrid workflow:
               </p>
               <ul className="text-xs text-amber-900 list-disc pl-5 space-y-1">
                  <li><strong>AI:</strong> Assisted extraction, classification, pattern detection, and drafting of preliminary assessments.</li>
                  <li><strong>Python:</strong> Schema validation, referential integrity, audit logs, and reproducibility.</li>
                  <li><strong>Human Review:</strong> Required for legal validation, final interpretation, and policy contextualization.</li>
               </ul>
            </div>
         </div>
      </section>

      {/* Audit Summary */}
      <section className="space-y-6 pt-10 border-t border-slate-200">
         <h2 className="text-xl font-bold text-slate-900">Technical Audit Summary</h2>
         <div className="p-8 bg-white border border-slate-200 rounded-[2rem] flex flex-col md:flex-row gap-8 items-center">
            <div className="text-center md:text-left space-y-2">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Audit Verdict</div>
               <div className="text-2xl font-black text-blue-900 tracking-tight">PASS_WITH_DOCUMENTED_FINDINGS</div>
               <p className="text-xs text-slate-500 max-w-sm">
                  Technically usable for demonstration and preliminary analysis, with substantive expert legal review still pending for many functional areas.
               </p>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
               {[
                 { label: "Data Integrity", status: "Validated" },
                 { label: "Referential Integrity", status: "Verified" },
                 { label: "Schema Compliance", status: "Pass" },
                 { label: "Expert Validation", status: "Pending" },
                 { label: "Pilot Version", status: "v0.1" },
                 { label: "Country Scope", status: "Mexico" },
               ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                     <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">{item.label}</div>
                     <div className="text-[10px] font-bold text-slate-700">{item.status}</div>
                  </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
}
