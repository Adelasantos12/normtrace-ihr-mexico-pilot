
import { ShieldAlert, BookOpen, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="space-y-12 py-8">
      <section className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold text-blue-900 tracking-tight">NormTrace-IHR</h1>
        <p className="text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Legal Internalisation Mapping Infrastructure for International Health Regulations
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link to="/dashboard" className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-800 transition-colors">
            Explore Dashboard <ArrowRight size={20} />
          </Link>
          <Link to="/mapping" className="bg-white text-blue-700 border border-blue-200 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            View Mapping
          </Link>
        </div>
      </section>

      <section className="bg-amber-50 border border-amber-200 rounded-xl p-8 space-y-4">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-lg">
          <ShieldAlert />
          IMPORTANT DISCLAIMERS
        </div>
        <div className="grid md:grid-cols-2 gap-6 text-amber-900">
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>This is a preliminary legal-institutional mapping.</li>
            <li>It does not assess legal compliance and is not legal advice.</li>
            <li>All rows marked <code className="bg-amber-100 px-1 rounded">preliminary_ai_assisted</code> require expert review.</li>
          </ul>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>PABS-related information is provisional and depends on the final annex.</li>
            <li>The RISS 2025 currency/source verification remains a substantive review item.</li>
            <li>Use this data for informational purposes only.</li>
          </ul>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
          <Search className="text-blue-600" size={32} />
          <h3 className="font-bold text-lg">Mapping Explorer</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Trace IHR 2005 obligations to specific domestic provisions in Mexico's legal framework.
          </p>
        </div>
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
          <BookOpen className="text-blue-600" size={32} />
          <h3 className="font-bold text-lg">Legal Corpus</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Comprehensive index of laws, regulations, and standards relevant to health governance.
          </p>
        </div>
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
          <ShieldAlert className="text-blue-600" size={32} />
          <h3 className="font-bold text-lg">Gap Analysis</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Identification of institutional and normative gaps in current IHR implementation.
          </p>
        </div>
      </section>
    </div>
  );
}
