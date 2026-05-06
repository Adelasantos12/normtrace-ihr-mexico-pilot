import { } from 'react';
import ReactMarkdown from 'react-markdown';
import { useMarkdownData } from '../hooks/useData';
import { Loader2, Info } from 'lucide-react';

interface MarkdownPageProps {
  fileName: string;
  title: string;
  subtitle?: string;
}

export default function MarkdownPage({ fileName, title, subtitle }: MarkdownPageProps) {
  const { content, loading, error } = useMarkdownData(fileName);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg">Error loading content: {error.message}</div>;

  return (
    <div className="space-y-10 pb-20">
      <header className="space-y-2">
         <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
         {subtitle && <p className="text-slate-500 max-w-3xl">{subtitle}</p>}
      </header>

      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-12 prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-blockquote:border-l-blue-600 prose-blockquote:bg-slate-50 prose-blockquote:p-6 prose-blockquote:rounded-r-xl">
           <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>

      <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4">
         <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
         <p className="text-xs text-blue-800 leading-relaxed italic">
            This document is rendered from the audited data package. Methodology summary available in the Methodology section.
         </p>
      </div>
    </div>
  );
}
