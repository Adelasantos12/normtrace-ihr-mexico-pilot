import { useState, useMemo } from 'react';
import { useCsvData } from '../hooks/useData';
import { Search, Loader2 } from 'lucide-react';

interface ProvisionRow {
  provision_id: string;
  norm_title: string;
  article: string;
  topic: string;
  actor_mentioned: string;
  relevance_to_ihr: string;
  relevance_to_pandemic_agreement: string;
}

export function ProvisionsExplorer() {
  const { data, loading } = useCsvData<ProvisionRow>('mexico_legal_provisions_clean.csv');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    norm_title: '',
    topic: '',
    actor_mentioned: '',
  });

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchesSearch = Object.values(row).some(v =>
        String(v).toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesNorm = !filters.norm_title || row.norm_title === filters.norm_title;
      const matchesTopic = !filters.topic || row.topic === filters.topic;
      const matchesActor = !filters.actor_mentioned || row.actor_mentioned === filters.actor_mentioned;

      return matchesSearch && matchesNorm && matchesTopic && matchesActor;
    });
  }, [data, searchTerm, filters]);

  const uniqueValues = useMemo(() => {
    const vals = {
      norm_title: new Set<string>(),
      topic: new Set<string>(),
      actor_mentioned: new Set<string>(),
    };
    data.forEach(row => {
      if (row.norm_title) vals.norm_title.add(row.norm_title);
      if (row.topic) vals.topic.add(row.topic);
      if (row.actor_mentioned) vals.actor_mentioned.add(row.actor_mentioned);
    });
    return Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, Array.from(v).sort()]));
  }, [data]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Legal Provisions Explorer</h1>
        <p className="text-slate-500">Search and filter Mexico's legal provisions relevant to health governance</p>
      </header>

      <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search provision text, topics, or actors..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(filters).map((key) => (
            <div key={key} className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{key.replace('_', ' ')}</label>
              <select
                className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filters[key as keyof typeof filters]}
                onChange={(e) => setFilters({...filters, [key]: e.target.value})}
              >
                <option value="">All</option>
                {uniqueValues[key]?.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase w-1/4">Norm & Article</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase w-1/4">Relevance to IHR</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase w-1/4">Relevance to Pandemic Agreement</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase w-1/6">Topic</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase w-1/6">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row) => (
                <tr key={row.provision_id} className="hover:bg-slate-50 transition-colors align-top">
                  <td className="p-4">
                    <div className="font-semibold text-sm text-blue-900 leading-tight">{row.norm_title}</div>
                    <div className="text-xs text-slate-500 mt-1">{row.article}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">{row.provision_id}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-700 italic leading-relaxed">
                    {row.relevance_to_ihr}
                  </td>
                  <td className="p-4 text-sm text-slate-700 italic leading-relaxed">
                    {row.relevance_to_pandemic_agreement}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                      {row.topic}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600 font-medium">
                    {row.actor_mentioned}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
