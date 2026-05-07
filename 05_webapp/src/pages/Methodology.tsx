import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Shield,
  Info,
  BookOpen,
  ChevronRight,
  GitMerge,
  Layers,
  Search,
  Cpu,
  Zap,
  AlertTriangle,
  ExternalLink,
  Table as TableIcon,
  Activity
} from 'lucide-react';

export default function Methodology() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/markdown/normtrace_ihr_methodology_full.md')
      .then(res => res.text())
      .then(text => {
        setContent(text);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading methodology:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Split content by sections (##) to create cards
  const sections = content.split('\n## ').map((section, i) => {
    if (i === 0) return { title: 'Methodology', body: section.replace('# Methodology', '').trim() };
    const lines = section.split('\n');
    const title = lines[0].trim();
    const body = lines.slice(1).join('\n').trim();
    return { title, body };
  });

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('summary')) return <Zap size={20} className="text-amber-500" />;
    if (t.includes('problem')) return <AlertTriangle size={20} className="text-red-500" />;
    if (t.includes('conceptual')) return <GitMerge size={20} className="text-blue-500" />;
    if (t.includes('analytical')) return <Layers size={20} className="text-purple-500" />;
    if (t.includes('keyword')) return <Search size={20} className="text-indigo-500" />;
    if (t.includes('workflow')) return <Activity size={20} className="text-emerald-500" />;
    if (t.includes('scale')) return <TableIcon size={20} className="text-blue-600" />;
    if (t.includes('gap')) return <Shield size={20} className="text-orange-500" />;
    if (t.includes('spar')) return <ExternalLink size={20} className="text-blue-400" />;
    if (t.includes('python')) return <Cpu size={20} className="text-slate-600" />;
    if (t.includes('limits')) return <Info size={20} className="text-slate-400" />;
    if (t.includes('references')) return <BookOpen size={20} className="text-slate-500" />;
    return <ChevronRight size={20} className="text-slate-300" />;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32">
      <header className="space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Methodological Framework</h1>
        <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
          The NormTrace-IHR structural analysis approach for reconstructing domestic legal internalisation.
        </p>
      </header>

      {/* Main Sections */}
      <div className="grid grid-cols-1 gap-12">
        {sections.map((section, idx) => {
          if (idx === 0) return null; // Skip main title

          const isAudit = section.title.toLowerCase().includes('audit');
          const isSummary = section.title.toLowerCase().includes('summary');
          const isScale = section.title.toLowerCase().includes('scale');
          const isProblem = section.title.toLowerCase().includes('problem');

          return (
            <section
              key={idx}
              className={`
                bg-white border rounded-[2rem] p-10 shadow-sm transition-all hover:shadow-md
                ${isProblem ? 'border-red-100 bg-red-50/10' : 'border-slate-200'}
                ${isAudit ? 'mt-20 border-blue-100 bg-blue-50/10' : ''}
              `}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  {getIcon(section.title)}
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
              </div>

              <div className={`prose prose-slate max-w-none
                ${isSummary ? 'prose-blockquote:bg-blue-50 prose-blockquote:border-blue-200 prose-blockquote:text-blue-900 prose-blockquote:not-italic prose-blockquote:rounded-xl prose-blockquote:px-6' : ''}
                prose-headings:text-slate-800 prose-headings:font-bold
                prose-p:text-slate-600 prose-p:leading-relaxed
                prose-strong:text-slate-900 prose-strong:font-bold
                prose-table:border prose-table:border-slate-200 prose-table:rounded-xl prose-table:overflow-hidden
                prose-th:bg-slate-50 prose-th:px-4 prose-th:py-3 prose-th:text-xs prose-th:font-bold prose-th:uppercase prose-th:tracking-wider prose-th:text-slate-500 prose-th:border-b
                prose-td:px-4 prose-td:py-4 prose-td:text-sm prose-td:border-b prose-td:text-slate-600
                prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-blue-600 prose-code:before:content-none prose-code:after:content-none
                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-4
              `}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {section.body}
                </ReactMarkdown>
              </div>
            </section>
          );
        })}

        {/* Technical Audit at the bottom */}
        <section className="bg-slate-900 text-white border border-slate-800 rounded-[2rem] p-10 shadow-xl space-y-8">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800 rounded-2xl">
                 <Shield size={24} className="text-blue-400" />
              </div>
              <div>
                 <h2 className="text-2xl font-bold">Technical Audit Summary</h2>
                 <p className="text-slate-400 text-sm mt-1">Verification status for Mexico Pilot v0.1 Data Package</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                 <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Verdict</h4>
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xl font-bold">PASS_WITH_DOCUMENTED_FINDINGS</span>
                 </div>
                 <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                    The audit confirmed referential integrity and schema compliance. Identified caveats (L-01 to L-08) are integrated as UI warnings throughout the mapping interface.
                 </p>
              </div>

              <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                 <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Verification Layer</h4>
                 <ul className="space-y-3">
                    {[
                      "Schema Validation: SUCCESS",
                      "Unique ID Check: SUCCESS",
                      "Cross-reference Integrity: SUCCESS",
                      "Anchor Scale Compliance: SUCCESS"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs text-slate-300">
                         <div className="w-1 h-1 bg-blue-500 rounded-full" />
                         {item}
                      </li>
                    ))}
                 </ul>
              </div>
           </div>

           <div className="pt-8 border-t border-slate-800 flex justify-between items-center">
              <div className="text-[10px] text-slate-500 font-mono">
                 BUILD_REF: NormTrace-IHR-MEX-0.1
              </div>
              <div className="px-3 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400">
                 DOI: 10.5281/zenodo.0000000
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
