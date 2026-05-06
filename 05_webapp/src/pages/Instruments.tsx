import { useState, useMemo } from 'react';
import {
  Search, Shield, Loader2, GitMerge,
  Activity, Database, AlertCircle
} from 'lucide-react';
import { useCsvData } from '../hooks/useData';
import { cn } from '../lib/utils';

export default function Instruments() {
  const [activeTab, setActiveTab] = useState('ihr_2005');

  const tabs = [
    { id: 'ihr_2005', label: 'IHR 2005', file: 'ihr_2005_obligations_clean.csv', icon: GitMerge },
    { id: 'ihr_2024', label: 'IHR 2024 Changes', file: 'ihr_2024_changes_clean.csv', icon: Activity },
    { id: 'pandemic_agreement', label: 'Pandemic Agreement', file: 'pandemic_agreement_obligations_clean.csv', icon: Shield },
    { id: 'pabs', label: 'PABS Draft', file: 'pabs_draft_obligations_clean.csv', icon: Database },
  ];

  const currentTab = tabs.find(t => t.id === activeTab)!;
  const { data, loading, error } = useCsvData<any>(currentTab.file);
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    return data.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search]);

  if (error) return <div className="p-8 text-red-600">Error loading instruments: {error.message}</div>;

  return (
    <div className="space-y-10 pb-20">
      <header>
         <h1 className="text-3xl font-bold text-slate-900">International Instruments</h1>
         <p className="text-slate-500 mt-1">Foundational and emerging international legal frameworks for global health security.</p>
      </header>

      <div className="flex bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearch(""); }}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="space-y-1">
              <h3 className="font-bold text-slate-900">{currentTab.label} Registry</h3>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{currentTab.file}</p>
           </div>
           <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search registry..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-white border-b border-slate-100">
                   <tr>
                      {data.length > 0 && Object.keys(data[0]).slice(0, 5).map(key => (
                         <th key={key} className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</th>
                      ))}
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {filteredData.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                         {Object.values(row).slice(0, 5).map((val: any, j) => (
                            <td key={j} className="p-6">
                               <div className={cn(
                                 "text-xs leading-relaxed text-slate-700",
                                 j === 0 ? "font-bold text-blue-900" : "font-medium"
                               )}>
                                  {String(val)}
                               </div>
                            </td>
                         ))}
                      </tr>
                   ))}
                </tbody>
             </table>
             {filteredData.length === 0 && (
                <div className="py-20 text-center text-slate-400 italic text-sm">No registry entries found.</div>
             )}
          </div>
        )}
      </div>

      {activeTab === 'pabs' && (
        <div className="p-8 bg-amber-50 border border-amber-100 rounded-[2rem] flex gap-4">
           <AlertCircle size={24} className="text-amber-500 shrink-0 mt-1" />
           <div className="space-y-2">
              <h4 className="font-bold text-amber-900">Provisional Readiness Note</h4>
              <p className="text-sm text-amber-800 leading-relaxed italic">
                 PABS-related obligations are derived from provisional drafts. Implementation mapping for these rows is subject to the final Annex of the Pandemic Agreement.
              </p>
           </div>
        </div>
      )}
    </div>
  );
}
