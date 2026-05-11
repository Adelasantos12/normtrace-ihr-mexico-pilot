import { FileText, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

type Section = { id: string; title: string; body: string };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export default function Methodology() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/markdown/normtrace_ihr_methodology_web.md')
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading methodology:', err);
        setLoading(false);
      });
  }, []);

  const sections = useMemo<Section[]>(() => {
    if (!content) return [];
    const chunks = content.split(/\n##\s+/g);
    return chunks
      .map((chunk, index) => {
        const lines = chunk.split('\n');
        let title = (lines[0] || '').trim();
        if (index === 0) {
          if (title.startsWith('# ')) {
             return null;
          }
        }
        if (!title) return null;

        return {
          id: slugify(title),
          title: title.replace(/^#+\s+/, ''),
          body: lines.slice(1).join('\n').trim()
        };
      })
      .filter((s): s is Section => Boolean(s));
  }, [content]);

  if (loading) return <div className="p-8 text-slate-600">Loading methodology…</div>;

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <header className="mb-12 border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">NormTrace-IHR Methodology</h1>
        <p className="text-lg text-slate-600 mt-4 max-w-3xl leading-relaxed">
          A structured methodological framework for legal-institutional traceability of International Health Regulations obligations in the Mexican domestic context.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-start">
        <aside className="lg:sticky lg:top-8 order-2 lg:order-1">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">On this page</h2>
            <ul className="space-y-3">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-slate-600 hover:text-blue-600 font-medium transition-colors block"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 p-5 bg-white border border-slate-200 rounded-xl shadow-sm mb-6">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Academic Resource</h3>
            <a
              href="/data/markdown/normtrace_ihr_methodology_full.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold transition-colors"
            >
              <FileText size={14} />
              View full academic methodology draft
            </a>
          </div>

          <div className="mt-6 p-5 bg-blue-50 border border-blue-100 rounded-xl">
            <h3 className="text-sm font-bold text-blue-800 mb-2">Technical Status</h3>
            <div className="flex items-center gap-2 text-xs text-blue-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Audit Version: 0.1 (Stable)
            </div>
          </div>
        </aside>

        <main className="space-y-12 order-1 lg:order-2">
          {sections.map((section) => {
            const isCollapsible = section.title.toLowerCase().includes('references') || section.title.toLowerCase().includes('technical audit');

            const body = (
              <div className="prose prose-slate max-w-none
                prose-headings:text-slate-800 prose-headings:font-bold
                prose-p:leading-relaxed prose-p:text-slate-600
                prose-li:text-slate-600
                prose-table:border prose-table:border-slate-200 prose-table:rounded-lg prose-table:overflow-hidden
                prose-th:bg-slate-50 prose-th:text-slate-700 prose-th:p-3 prose-th:text-left prose-th:font-bold
                prose-td:p-3 prose-td:border-t prose-td:border-slate-100
                [&_.methodology-callout]:my-6 [&_.methodology-callout]:p-6 [&_.methodology-callout]:rounded-xl [&_.methodology-callout]:border
                [&_.methodology-callout.important]:bg-amber-50 [&_.methodology-callout.important]:border-amber-200 [&_.methodology-callout.important]:text-amber-900
                [&_.methodology-callout.important_h3]:text-amber-900 [&_.methodology-callout.important_h3]:mt-0
                [&_.methodology-callout.note]:bg-blue-50 [&_.methodology-callout.note]:border-blue-200 [&_.methodology-callout.note]:text-blue-900
                [&_.workflow-container]:flex [&_.workflow-container]:flex-col [&_.workflow-container]:md:flex-row [&_.workflow-container]:items-center [&_.workflow-container]:gap-4 [&_.workflow-container]:my-10
                [&_.workflow-step]:flex-1 [&_.workflow-step]:bg-white [&_.workflow-step]:border [&_.workflow-step]:border-slate-200 [&_.workflow-step]:p-5 [&_.workflow-step]:rounded-xl [&_.workflow-step]:shadow-sm [&_.workflow-step]:text-center
                [&_.step-number]:w-8 [&_.step-number]:h-8 [&_.step-number]:bg-slate-900 [&_.step-number]:text-white [&_.step-number]:rounded-full [&_.step-number]:flex [&_.step-number]:items-center [&_.step-number]:justify-center [&_.step-number]:mx-auto [&_.step-number]:mb-3 [&_.step-number]:font-bold [&_.step-number]:text-sm
                [&_.step-title]:font-bold [&_.step-title]:text-slate-800 [&_.step-title]:text-sm [&_.step-title]:mb-1
                [&_.step-desc]:text-xs [&_.step-desc]:text-slate-500
                [&_.workflow-arrow]:text-slate-300 [&_.workflow-arrow]:font-bold [&_.workflow-arrow]:hidden [&_.workflow-arrow]:md:block
              ">
                <div className="overflow-x-auto">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {section.body}
                  </ReactMarkdown>
                </div>
              </div>
            );

            return (
              <section id={section.id} key={section.id} className="scroll-mt-6">
                {isCollapsible ? (
                  <details className="group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden transition-all duration-300">
                    <summary className="cursor-pointer p-5 flex items-center justify-between hover:bg-slate-100 transition-colors list-none">
                      <h2 className="text-xl font-bold text-slate-800">{section.title}</h2>
                      <span className="text-slate-400 group-open:rotate-180 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </span>
                    </summary>
                    <div className="p-6 pt-0 bg-white border-t border-slate-200">
                      {body}
                    </div>
                  </details>
                ) : (
                  <div className="bg-white">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                      <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                      {section.title}
                    </h2>
                    {body}
                  </div>
                )}
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}
