import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';

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
    fetch('/data/markdown/normtrace_ihr_methodology_full.md')
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
        if (index === 0) return null;
        const lines = chunk.split('\n');
        const title = (lines[0] || '').trim();
        if (!title) return null;
        return {
          id: slugify(title),
          title,
          body: lines.slice(1).join('\n').trim()
        };
      })
      .filter((s): s is Section => Boolean(s));
  }, [content]);

  if (loading) return <div className="text-slate-600">Loading methodology…</div>;

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">NormTrace-IHR Methodology</h1>
        <p className="text-slate-600 mt-2 max-w-3xl">Structured methodological framework for legal-institutional traceability of IHR obligations in Mexico.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 items-start">
        <aside className="lg:sticky lg:top-6 bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Contents</h2>
          <ul className="space-y-2 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-slate-600 hover:text-blue-700">{s.title}</a>
              </li>
            ))}
          </ul>
        </aside>

        <main className="space-y-5">
          {sections.map((section) => {
            const isExpandable = section.title.toLowerCase().includes('references') || section.title.toLowerCase().includes('technical audit');
            const body = (
              <div className="prose prose-slate max-w-none prose-table:text-sm prose-th:bg-slate-50 prose-th:p-2 prose-td:p-2">
                <ReactMarkdown>{section.body}</ReactMarkdown>
              </div>
            );

            return (
              <section id={section.id} key={section.id} className="bg-white border border-slate-200 rounded-xl p-6">
                {isExpandable ? (
                  <details>
                    <summary className="cursor-pointer text-xl font-semibold text-slate-900">{section.title}</summary>
                    <div className="mt-4">{body}</div>
                  </details>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">{section.title}</h2>
                    {body}
                  </>
                )}
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}
