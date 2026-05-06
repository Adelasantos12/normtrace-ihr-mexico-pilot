import { useState } from 'react';
import { useCsvData } from '../hooks/useData';
import { Search, Loader2 } from 'lucide-react';


function InstrumentTable({ title, fileName }: { title: string, fileName: string }) {
  const { data, loading } = useCsvData<any>(fileName);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(row =>
    Object.values(row).some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-400" size={32} /></div>;

  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
              <tr>
                {headers.map(h => (
                  <th key={h} className="p-3 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap bg-slate-50">{h.replace(/_/g, ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  {headers.map(h => (
                    <td key={h} className="p-3 text-xs text-slate-600 max-w-xs truncate" title={String(row[h])}>
                      {String(row[h])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function Instruments() {
  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">International Instruments</h1>
        <p className="text-slate-500">Global legal frameworks and proposed amendments</p>
      </header>

      <InstrumentTable title="IHR 2005 Obligations" fileName="ihr_2005_obligations_clean.csv" />
      <InstrumentTable title="IHR 2024 Changes" fileName="ihr_2024_changes_clean.csv" />
      <InstrumentTable title="Pandemic Agreement Obligations" fileName="pandemic_agreement_obligations_clean.csv" />
      <InstrumentTable title="PABS Draft Obligations" fileName="pabs_draft_obligations_clean.csv" />
    </div>
  );
}
