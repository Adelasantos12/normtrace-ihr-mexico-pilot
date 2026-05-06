
import ReactMarkdown from 'react-markdown';
import { useMarkdownData } from '../hooks/useData';
import { Loader2, AlertCircle } from 'lucide-react';

export function MarkdownPage({ title, fileName }: { title: string, fileName: string }) {
  const { content, loading, error } = useMarkdownData(fileName);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg flex gap-2"><AlertCircle /> Error loading {title}</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      </header>

      <article className="prose prose-slate max-w-none bg-white p-10 border border-slate-200 rounded-lg shadow-sm">
        <ReactMarkdown
            components={{
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-blue-900 border-b pb-2 mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-bold text-slate-700 mt-6 mb-3" {...props} />,
                p: ({node, ...props}) => <p className="text-slate-600 leading-relaxed mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2" {...props} />,
                li: ({node, ...props}) => <li className="text-slate-600" {...props} />,
                table: ({node, ...props}) => <div className="overflow-x-auto my-6"><table className="w-full border-collapse border border-slate-200 text-sm" {...props} /></div>,
                th: ({node, ...props}) => <th className="bg-slate-50 border border-slate-200 p-2 font-bold text-left" {...props} />,
                td: ({node, ...props}) => <td className="border border-slate-200 p-2" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-200 pl-4 italic text-slate-500 my-4" {...props} />,
                code: ({node, ...props}) => <code className="bg-slate-100 px-1 rounded text-pink-600 font-mono text-xs" {...props} />,
            }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
