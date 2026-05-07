import { useState } from 'react';
import {
  FileText, Download, Printer, CheckCircle, ChevronRight,
  Shield, AlertCircle, Calendar, Info, Globe, GitMerge,
  Layers, Users, AlertTriangle, BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useCsvData } from '../hooks/useData';

const SECTIONS = [
  { id: 'cover', label: 'Cover Page', icon: FileText, always: true },
  { id: 'executive', label: 'Executive Summary', icon: Info },
  { id: 'dashboard', label: 'Dashboard Summary', icon: Layers },
  { id: 'mapping', label: 'IHR 2005 Mapping Summary', icon: GitMerge },
  { id: 'provisions', label: 'Legal Provisions Corpus Overview', icon: BookOpen },
  { id: 'actors', label: 'Actor Network and Actor Table', icon: Users },
  { id: 'gaps', label: 'Implementation Gap Map', icon: AlertTriangle },
  { id: 'snapshot', label: 'Country Snapshot', icon: Globe },
  { id: 'methodology', label: 'Methodology and Caveats', icon: AlertCircle, always: true },
  { id: 'citation', label: 'Citation and Version Information', icon: Calendar, always: true },
];

export default function ReportBuilder() {
  const [selected, setSelected] = useState<Set<string>>(new Set(SECTIONS.map(s => s.id)));
  const { data: mappingData } = useCsvData<any>('mexico_ihr2005_mapping_clean.csv');
  const { data: gapData } = useCsvData<any>('mexico_implementation_gap_map_clean.csv');
  const { data: provisionData } = useCsvData<any>('mexico_legal_provisions_clean.csv');
  const { data: actorData } = useCsvData<any>('mexico_health_governance_actors_clean.csv');

  const toggleSection = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      if (SECTIONS.find(s => s.id === id)?.always) return;
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-10 pb-20 max-w-4xl mx-auto print:max-w-none print:m-0 print:p-0">
      <header className="print:hidden space-y-4">
         <h1 className="text-3xl font-bold text-slate-900">Printable Report Builder</h1>
         <p className="text-slate-500">Assemble a customized legal intelligence report from the Mexico Pilot v0.1 data.</p>

         <div className="flex gap-4 pt-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl text-sm font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20"
            >
               <Printer size={16} /> Print / Export PDF
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
               <Download size={16} /> Download CSV Package
            </button>
         </div>
      </header>

      <div className="print:hidden grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
         <div className="space-y-6">
            <h3 className="font-bold text-slate-900 px-1">Report Contents</h3>
            <div className="space-y-2">
               {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left group",
                      selected.has(section.id)
                        ? "bg-white border-blue-200 shadow-sm"
                        : "bg-slate-50 border-transparent text-slate-400 opacity-60"
                    )}
                  >
                     <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-lg transition-colors",
                          selected.has(section.id) ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"
                        )}>
                           <section.icon size={18} />
                        </div>
                        <div>
                           <p className="text-xs font-bold">{section.label}</p>
                           {section.always && <p className="text-[10px] text-slate-400 font-medium">Required Section</p>}
                        </div>
                     </div>
                     {selected.has(section.id) && <CheckCircle size={16} className="text-blue-500" />}
                  </button>
               ))}
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="font-bold text-slate-900 px-1">Live Preview</h3>
            <div className="bg-slate-800 rounded-2xl p-8 aspect-[1/1.4] shadow-2xl relative overflow-hidden border border-slate-700">
               <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
               <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-2">
                     <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                        <Shield className="text-blue-500" size={24} />
                     </div>
                     <h4 className="text-xl font-bold text-white">NormTrace-IHR Report</h4>
                     <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Mexico Pilot v0.1</p>
                  </div>

                  <div className="space-y-3 pt-8">
                     <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Included Sections:</p>
                     <div className="space-y-2">
                        {SECTIONS.filter(s => selected.has(s.id)).slice(0, 8).map(s => (
                           <div key={s.id} className="flex items-center gap-2 text-[10px] text-slate-300 font-medium">
                              <ChevronRight size={10} className="text-blue-500" /> {s.label}
                           </div>
                        ))}
                        {selected.size > 8 && <div className="text-[10px] text-slate-500 font-medium pl-4">+ {selected.size - 8} more sections</div>}
                     </div>
                  </div>
               </div>

               <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <div className="text-[8px] text-slate-500 font-mono">
                     TBD: 10.5281/zenodo.0000000
                  </div>
                  <div className="text-right">
                     <p className="text-[8px] text-slate-400 font-bold">PRELIMINARY VERSION</p>
                     <p className="text-[8px] text-slate-500 font-mono">Generated: {new Date().toISOString().split('T')[0]}</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Actual Printable Content (Hidden by default, visible in print) */}
      <div className="hidden print:block space-y-20 bg-white text-slate-900 p-12">
         {/* Cover Page */}
         {selected.has('cover') && (
            <div className="h-[900px] flex flex-col justify-between border-b-8 border-blue-900 pb-20">
               <div className="space-y-12">
                  <div className="flex justify-between items-start">
                     <div className="p-4 bg-blue-900 text-white font-black text-2xl tracking-tighter">NT-IHR</div>
                     <div className="text-right font-mono text-xs text-slate-400 uppercase tracking-widest">Mexico Pilot / Webapp v0.3</div>
                  </div>
                  <div className="space-y-6">
                     <h1 className="text-6xl font-black text-slate-900 leading-tight">NormTrace-IHR <br/> Legal Intelligence Report</h1>
                     <p className="text-2xl font-medium text-slate-600">Legal Internalisation Mapping for International Health Regulations (2005) and Emerging Pandemic Instruments</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-4">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Jurisdiction</h3>
                     <p className="text-lg font-bold text-slate-800">Estados Unidos Mexicanos</p>
                     <p className="text-sm text-slate-500">Federal Legal Framework</p>
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Data Package</h3>
                     <p className="text-lg font-bold text-slate-800">v0.1 (Audited)</p>
                     <p className="text-sm text-slate-500">Verdict: PASS_WITH_DOCUMENTED_FINDINGS</p>
                  </div>
               </div>

               <div className="pt-20 space-y-4">
                  <p className="text-xs font-bold text-red-700 uppercase tracking-[0.3em]">PRELIMINARY EXPERT REVIEW VERSION</p>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                     This report provides a preliminary legal-institutional mapping. It does not assess legal compliance and is not legal advice. All assessments are subject to expert validation.
                  </p>
               </div>
            </div>
         )}

         {/* Executive Summary */}
         {selected.has('executive') && (
            <div className="page-break-before space-y-8">
               <h2 className="text-3xl font-bold border-l-4 border-blue-600 pl-6">Executive Summary</h2>
               <div className="grid grid-cols-1 gap-12 text-slate-700 leading-relaxed">
                  <p>
                     The NormTrace-IHR Mexico Pilot v0.1 provides a structured mapping of the Mexican domestic legal framework against the International Health Regulations (2005) and emerging international instruments.
                     The mapping identifies the statutory and administrative "anchoring" of international obligations within Mexico's health governance architecture.
                  </p>
                  <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
                     <h4 className="font-bold text-slate-900 mb-4">Key Findings</h4>
                     <ul className="list-disc pl-6 space-y-4">
                        <li>The <strong>Ley General de Salud (LGS)</strong> and the <strong>Reglamento Interior de la Secretaría de Salud (2025)</strong> constitute the core statutory anchors for IHR implementation.</li>
                        <li>Structural analysis reveals a transition from L0-L2 (Administrative) to L3-L5 (Statutory) anchoring for primary surveillance functions.</li>
                        <li>Gaps in intersectoral coordination for Points of Entry and PABS-readiness require further regulatory clarification.</li>
                     </ul>
                  </div>
               </div>
            </div>
         )}

         {/* Mapping Summary Table */}
         {selected.has('mapping') && mappingData.length > 0 && (
            <div className="page-break-before space-y-8">
               <h2 className="text-3xl font-bold border-l-4 border-blue-600 pl-6">IHR 2005 Mapping Summary</h2>
               <div className="text-sm overflow-hidden border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                           <th className="p-4 font-bold text-[10px] uppercase tracking-wider text-slate-500">ID</th>
                           <th className="p-4 font-bold text-[10px] uppercase tracking-wider text-slate-500">IHR Obligation (Simplified)</th>
                           <th className="p-4 font-bold text-[10px] uppercase tracking-wider text-slate-500">Domestic Norm</th>
                           <th className="p-4 font-bold text-[10px] uppercase tracking-wider text-slate-500">Level</th>
                           <th className="p-4 font-bold text-[10px] uppercase tracking-wider text-slate-500">Match</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {mappingData.slice(0, 40).map((row: any, i: number) => (
                           <tr key={i} className="align-top">
                              <td className="p-4 font-mono text-[10px] font-bold text-blue-900">{row.obligation_id}</td>
                              <td className="p-4 font-medium text-slate-700 max-w-xs truncate">{row.ihr_obligation_simplified}</td>
                              <td className="p-4 text-slate-600">{row.domestic_norm}</td>
                              <td className="p-4 font-bold text-slate-900">{row.anchoring_level}</td>
                              <td className="p-4 text-[10px] uppercase font-bold text-slate-500">{row.match_type}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  <div className="p-4 bg-slate-50 border-t border-slate-200 text-[10px] italic text-slate-500">
                     Showing first 40 rows. Total mappings: {mappingData.length}.
                  </div>
               </div>
            </div>
         )}

         {/* Implementation Gap Map */}
         {selected.has('gaps') && gapData.length > 0 && (
            <div className="page-break-before space-y-8">
               <h2 className="text-3xl font-bold border-l-4 border-blue-600 pl-6">Implementation Gap Map</h2>
               <div className="text-sm overflow-hidden border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                           <th className="p-4 font-bold text-[10px] uppercase tracking-wider text-slate-500">Area</th>
                           <th className="p-4 font-bold text-[10px] uppercase tracking-wider text-slate-500">IHR 2005 Anchoring</th>
                           <th className="p-4 font-bold text-[10px] uppercase tracking-wider text-slate-500">Main Gap Type</th>
                           <th className="p-4 font-bold text-[10px] uppercase tracking-wider text-slate-500">IHR 2024 Implication</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {gapData.map((row: any, i: number) => (
                           <tr key={i} className="align-top">
                              <td className="p-4 font-bold text-slate-900">{row.area}</td>
                              <td className="p-4 text-slate-600 text-xs">{row.current_ihr2005_anchoring_pattern}</td>
                              <td className="p-4 font-medium text-red-700">{row.main_gap_type}</td>
                              <td className="p-4 text-slate-700 text-xs">{row.ihr2024_implication}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* Methodology & Caveats */}
         {selected.has('methodology') && (
            <div className="page-break-before space-y-8">
               <h2 className="text-3xl font-bold border-l-4 border-blue-600 pl-6">Methodology & Caveats</h2>
               <div className="space-y-8 text-sm">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="p-6 bg-red-50 rounded-xl border border-red-100 space-y-4">
                        <h4 className="font-bold text-red-900 uppercase tracking-widest text-[10px]">Audit Verdict</h4>
                        <p className="text-xl font-bold text-red-700">PASS_WITH_DOCUMENTED_FINDINGS</p>
                     </div>
                     <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 space-y-4">
                        <h4 className="font-bold text-blue-900 uppercase tracking-widest text-[10px]">Mapping Version</h4>
                        <p className="text-xl font-bold text-blue-700">v0.1 / Mexico Pilot</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="font-bold text-slate-900 uppercase tracking-widest text-[10px]">Documented Caveats (L-01 to L-08)</h4>
                     <div className="grid grid-cols-1 gap-2">
                        {[
                           "L-01: Preliminary AI-assisted mapping requires expert review.",
                           "L-02: PABS-related info is provisional.",
                           "L-03: RISS 2025 currency verification remains substantive.",
                           "L-04: Anchoring levels represent legal formalization, not performance.",
                           "L-05: Gap types are structural-legal classifications.",
                           "L-06: Actor mentions in provisions may include inactive entities.",
                           "L-07: Mapping assumes current binding status of IHR 2005.",
                           "L-08: Methodology focused on federal instruments; subnational law excluded."
                        ].map((c, i) => (
                           <div key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded text-slate-600 font-medium">{c}</div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Citation */}
         {selected.has('citation') && (
            <div className="page-break-before pt-20 border-t-2 border-slate-100 space-y-8">
               <h3 className="text-xl font-bold">Citation & Versioning</h3>
               <div className="p-8 bg-slate-900 text-white rounded-2xl font-mono text-xs leading-relaxed">
                  NormTrace-IHR (2025). Mexico Legal Internalisation Mapping: Pilot v0.1 Data Package.
                  Digital Object Identifier: TBD (10.5281/zenodo.0000000).
                  Repository: Local Build / Non-Public Audit.
                  Status: Preliminary / Not for public circulation.
               </div>

               <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                  <div>NormTrace-IHR Mexico Pilot v0.1</div>
                  <div>Page Appendix — v0.3 Build</div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
