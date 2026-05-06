
import { Download, FileText, Table, AlertTriangle } from 'lucide-react';

const files = [
  { name: 'IHR 2005 Mapping', file: 'mexico_ihr2005_mapping_clean.csv', type: 'CSV' },
  { name: 'Legal Provisions', file: 'mexico_legal_provisions_clean.csv', type: 'CSV' },
  { name: 'Actors Explorer', file: 'mexico_health_governance_actors_clean.csv', type: 'CSV' },
  { name: 'Gap Map', file: 'mexico_implementation_gap_map_clean.csv', type: 'CSV' },
  { name: 'IHR 2005 Obligations', file: 'ihr_2005_obligations_clean.csv', type: 'CSV' },
  { name: 'IHR 2024 Changes', file: 'ihr_2024_changes_clean.csv', type: 'CSV' },
  { name: 'Pandemic Agreement', file: 'pandemic_agreement_obligations_clean.csv', type: 'CSV' },
  { name: 'PABS Draft', file: 'pabs_draft_obligations_clean.csv', type: 'CSV' },
];

export function Downloads() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Downloads</h1>
        <p className="text-slate-500">Access the raw data and generated reports</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Table className="text-blue-600" />
            Cleaned Data Package
          </h2>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm divide-y divide-slate-100">
            {files.map(f => (
              <div key={f.file} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <div className="font-medium text-sm text-slate-900">{f.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{f.file}</div>
                </div>
                <a
                  href={`/data/${f.file}`}
                  download
                  className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded"
                >
                  <Download size={14} /> {f.type}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-600" />
            Reports (PDF)
          </h2>
          <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <FileText size={32} />
             </div>
             <div>
                <p className="font-bold text-slate-800">NormTrace-IHR Mexico Pilot Report</p>
                <p className="text-xs text-slate-500 mt-1">Full analytical report in PDF format</p>
             </div>
             <div className="p-3 bg-amber-50 border border-amber-100 rounded-md flex gap-2 items-start text-left">
                <AlertTriangle className="text-amber-600 shrink-0" size={16} />
                <p className="text-[10px] text-amber-800">
                    PDF report generation is pending final human review of the L-07 preliminary mapping rows.
                    A placeholder link will be active once review is complete.
                </p>
             </div>
             <button disabled className="w-full py-2 bg-slate-100 text-slate-400 rounded font-bold text-sm cursor-not-allowed">
                Report Unavailable
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
