import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Network, Database } from 'lucide-react';
import { AuditFacts, AuditNotice } from '../components/AuditNotice';

export default function LandingPage() {
  return <main className="bg-slate-50 min-h-screen text-slate-900">
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <header className="flex justify-between items-center gap-4">
        <div><p className="font-bold text-xl">NormTrace-IHR</p><p className="text-xs text-slate-500">Mexico · preliminary legal traceability pilot</p></div>
        <Link to="/mapping" className="text-sm font-medium flex items-center gap-2">Explore the evidence <ArrowRight size={16}/></Link>
      </header>
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 to-blue-950 text-white p-8 sm:p-12 space-y-6">
        <p className="text-xs uppercase tracking-widest text-sky-300">International obligations · domestic legal evidence</p>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight max-w-3xl">Follow the law behind IHR implementation</h1>
        <p className="text-slate-300 leading-relaxed max-w-3xl">NormTrace organizes selected IHR requirements, domestic provisions and institutional references so the evidence behind a legal assessment can be examined. It records what was found and what still needs checking. It does not measure response performance or issue a compliance verdict.</p>
        <div className="flex flex-wrap gap-4">
          <Link to="/actors" className="rounded-full px-5 py-3 bg-sky-500 font-medium">Traceability network</Link>
          <Link to="/mapping" className="rounded-full px-5 py-3 border border-slate-500">Mapping explorer</Link>
          <Link to="/audit" className="rounded-full px-5 py-3 border border-slate-500">October correction record</Link>
        </div>
      </section>
      <AuditNotice/>
      <AuditFacts/>
      <div className="grid md:grid-cols-3 gap-5">
        {[
          {to:'/mapping',title:'Inspect the provisions',Icon:BookOpen,text:'Read the source attached to a correspondence, its review status and any reference to a further document.'},
          {to:'/actors',title:'Read the network correctly',Icon:Network,text:'Connections show cited instruments and documentary actor associations. Shared law is not evidence of cooperation or authority over another institution.'},
          {to:'/spar-bridge',title:'SPAR and legal review',Icon:Database,text:'SPAR already asks countries to assess legal instruments. NormTrace organizes provision-level evidence; its codes are not subtracted from SPAR scores.'}
        ].map(({to,title,Icon,text})=><Link to={to} key={to} className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 hover:border-sky-400"><Icon size={24}/><h2 className="font-semibold">{title}</h2><p className="text-sm text-slate-600 leading-relaxed">{text}</p></Link>)}
      </div>
      <section className="rounded-2xl bg-white p-7 border border-slate-200 space-y-4">
        <h2 className="text-2xl font-semibold">What changed after source checking?</h2>
        <p className="text-slate-600 leading-relaxed">The statutory SINAVE reference is Article 133(II), not Article 134. The final NOM-017 includes notification rules and a referral to an international surveillance manual. Articles 7, 30 and 31 of the international health regulation provide relevant rules on gratuity and health declarations. These references require reassessment of earlier absence claims.</p>
        <p className="text-slate-600 leading-relaxed">A procedure referred to in another document cannot be treated as missing before that document is examined. The corrected dataset preserves the prior classifications as historical fields and leaves replacement scores pending.</p>
        <Link to="/audit" className="text-blue-700 underline">See exact sources, changes and unresolved questions</Link>
      </section>
      <footer className="text-xs text-slate-500 border-t pt-6 leading-relaxed">Working correction release 0.1.1-audit.20261014. The earlier archive DOI 10.5281/zenodo.20085170 does not itself identify this correction release. <Link to="/methodology" className="underline">Methodology</Link> · <Link to="/report" className="underline">Export a versioned report</Link></footer>
    </div>
  </main>;
}
