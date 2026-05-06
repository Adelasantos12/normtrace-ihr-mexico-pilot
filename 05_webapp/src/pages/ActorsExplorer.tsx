
import { useCsvData } from '../hooks/useData';
import { Loader2 } from 'lucide-react';

interface ActorRow {
  actor_id: string;
  actor_name: string;
  legal_nature: string;
  government_level: string;
  legal_basis: string;
  core_functions: string;
  ihr_relevance: string;
  pandemic_agreement_relevance: string;
  limitations: string;
}

export function ActorsExplorer() {
  const { data, loading } = useCsvData<ActorRow>('mexico_health_governance_actors_clean.csv');

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Actors Explorer</h1>
        <p className="text-slate-500">Key institutional actors in Mexico's health governance and IHR implementation</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Actor</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Legal Nature / Level</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Core Functions</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">IHR Relevance</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Limitations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => (
                <tr key={row.actor_id} className="hover:bg-slate-50 transition-colors align-top">
                  <td className="p-4">
                    <div className="font-bold text-sm text-blue-900 leading-tight">{row.actor_name}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">{row.actor_id}</div>
                    <div className="text-[10px] text-slate-500 mt-2 uppercase font-semibold">Legal Basis</div>
                    <div className="text-[10px] text-slate-600 italic">{row.legal_basis}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs font-medium text-slate-700">{row.legal_nature}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{row.government_level}</div>
                  </td>
                  <td className="p-4 text-xs text-slate-700 leading-relaxed">
                    {row.core_functions}
                  </td>
                  <td className="p-4">
                    <div className="text-xs text-slate-700 font-medium">IHR:</div>
                    <div className="text-xs text-slate-600 italic mb-2">{row.ihr_relevance}</div>
                    <div className="text-xs text-slate-700 font-medium">Agreement:</div>
                    <div className="text-xs text-slate-600 italic">{row.pandemic_agreement_relevance}</div>
                  </td>
                  <td className="p-4 text-xs text-slate-600 italic">
                    {row.limitations}
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
