import {
  FileText, AlertTriangle, Activity, Info, Layers, Target,
  GitMerge, Network, ShieldCheck, BookOpen, Database,
} from 'lucide-react';
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

// Icon + accent color per section, matching the sister repo's
// (normtrace-politicalrights_participation) Methodology.jsx pattern of a
// colored icon next to every section heading.
const SECTION_STYLE: { match: (title: string) => boolean; icon: any; color: string }[] = [
  { match: (t) => t.includes('analytical framework'), icon: Activity, color: '#0ea5e9' },
  { match: (t) => t.includes('core problem'), icon: Info, color: '#2563eb' },
  { match: (t) => t.includes('overlapping layers'), icon: Layers, color: '#0f172a' },
  { match: (t) => t.includes('spar/jee cannot'), icon: ShieldCheck, color: '#0369a1' },
  { match: (t) => t.includes('pilot scope'), icon: Database, color: '#065f46' },
  { match: (t) => t.includes('anchoring scale'), icon: Target, color: '#10b981' },
  { match: (t) => t.includes('gap typology'), icon: GitMerge, color: '#8b5cf6' },
  { match: (t) => t.includes('normative hierarchy'), icon: Network, color: '#7c3aed' },
  { match: (t) => t.includes('artificial intelligence'), icon: ShieldCheck, color: '#0e7490' },
  { match: (t) => t.includes('reference'), icon: BookOpen, color: '#0369a1' },
];
function sectionStyle(title: string) {
  const t = title.toLowerCase();
  return SECTION_STYLE.find((s) => s.match(t)) || { icon: Info, color: '#64748b' };
}

// Parses a GFM markdown table out of a section body into header + rows,
// so the two most "diagnostic" tables (Anchoring Scale, Gap Typology) can
// be rendered as colored badge rows instead of a plain table -- without
// hand-duplicating their content, which stays single-sourced in the .md file.
function parseMarkdownTable(body: string): { headers: string[]; rows: string[][] } | null {
  const lines = body.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('|'));
  if (lines.length < 3) return null;
  const cells = (line: string) => line.replace(/^\||\|$/g, '').split('|').map((c) => c.replace(/\*\*/g, '').trim());
  const headers = cells(lines[0]);
  const rows = lines.slice(2).map(cells);
  return { headers, rows };
}

const SCALE_COLORS = [
  { bg: '#f1f5f9', text: '#94a3b8' },
  { bg: '#fef2f2', text: '#b91c1c' },
  { bg: '#fff7ed', text: '#c2410c' },
  { bg: '#fefce8', text: '#a16207' },
  { bg: '#f0fdf4', text: '#15803d' },
  { bg: '#ecfdf5', text: '#065f46' },
];

function AnchoringScaleTable({ body }: { body: string }) {
  const table = parseMarkdownTable(body);
  if (!table) return null;
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">{table.headers[0]} scale</p>
      <div className="divide-y divide-slate-100">
        {table.rows.map((row, i) => {
          const shade = SCALE_COLORS[i] || SCALE_COLORS[SCALE_COLORS.length - 1];
          return (
            <div key={i} className="grid grid-cols-[48px_140px_1fr] gap-3 items-start py-2.5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                style={{ background: shade.bg, color: shade.text }}
              >
                {row[0]}
              </div>
              <div className="text-[13px] font-semibold text-slate-800 pt-2">{row[1]}</div>
              <p className="text-[13px] text-slate-500 leading-relaxed pt-2">{row[2]}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GapTypologyList({ body }: { body: string }) {
  const table = parseMarkdownTable(body);
  if (!table) return null;
  return (
    <div className="flex flex-col gap-2.5">
      {table.rows.map((row, i) => (
        <div key={i} className="p-3.5 rounded-lg bg-slate-50 border-l-[3px] border-violet-500">
          <p className="text-[13px] font-semibold text-slate-800">{row[0]}</p>
          <p className="text-[13px] text-slate-500 leading-relaxed mt-0.5">{row[1]}</p>
        </div>
      ))}
    </div>
  );
}

const DISCLAIMER_TEXT = 'This is a preliminary, single-coder, AI-assisted analytical mapping — not legal advice, and not a compliance assessment. All anchoring inputs require expert legal review before any policy application. Rows marked preliminary_ai_assisted have not yet been validated by a domestic public-health-law expert.';

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
      <header className="mb-8 space-y-4">
        <div className="text-xs font-semibold uppercase tracking-widest text-blue-700">Methodology &amp; Limitations</div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">NormTrace-IHR Methodology</h1>
        <p className="text-lg text-slate-600 max-w-3xl leading-relaxed border-l-4 border-sky-400 pl-5">
          A structured methodological framework for legal-institutional traceability of International Health Regulations obligations in the Mexican domestic context.
        </p>
      </header>

      <div className="mb-10 p-5 bg-red-50 border border-red-200 rounded-xl border-l-4 border-l-red-500 flex gap-3.5">
        <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-900 mb-1">Important disclaimer</p>
          <p className="text-[13px] text-red-800 leading-relaxed">{DISCLAIMER_TEXT}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-start">
        <aside className="lg:sticky lg:top-8 order-2 lg:order-1">
          <div className="border border-slate-200 rounded-2xl p-5">
            <h2 className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-4">On this page</h2>
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

            <div className="mt-6 pt-5 border-t border-slate-200">
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">Academic resource</h3>
              <a
                href="/data/markdown/normtrace_ihr_methodology_full.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <FileText size={14} />
                View full academic methodology draft
              </a>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              Audit version 0.1 (stable)
            </div>
          </div>
        </aside>

        <main className="space-y-8 order-1 lg:order-2">
          {sections.map((section) => {
            const isCollapsible = section.title.toLowerCase().includes('references') || section.title.toLowerCase().includes('technical audit');
            const { icon: SectionIcon, color } = sectionStyle(section.title);
            const isAnchoringScale = section.title.toLowerCase().includes('anchoring scale');
            const isGapTypology = section.title.toLowerCase().includes('gap typology');

            const body = isAnchoringScale ? (
              <AnchoringScaleTable body={section.body} />
            ) : isGapTypology ? (
              <GapTypologyList body={section.body} />
            ) : (
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
                  <details className="group bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300">
                    <summary className="cursor-pointer p-5 flex items-center justify-between hover:bg-slate-100 transition-colors list-none">
                      <div className="flex items-center gap-2.5">
                        <SectionIcon size={18} color={color} />
                        <h2 className="text-lg font-bold text-slate-800">{section.title}</h2>
                      </div>
                      <span className="text-slate-400 group-open:rotate-180 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </span>
                    </summary>
                    <div className="p-6 pt-0 bg-white border-t border-slate-200">
                      {body}
                    </div>
                  </details>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
                    <div className="flex items-center gap-2.5 mb-5">
                      <SectionIcon size={20} color={color} />
                      <h2 className="text-lg font-bold text-slate-900">
                        {section.title}
                      </h2>
                    </div>
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
