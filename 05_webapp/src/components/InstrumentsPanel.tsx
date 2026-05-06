import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Search, Filter, Shield, ExternalLink, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { getLegalDomain } from '../lib/domainGrouping';

interface Instrument {
  norm_id: string;
  norm_title: string;
  short_title: string;
  instrument_type: string;
  normative_hierarchy: string;
  sector: string;
  subsector: string;
  relevance_for_ihr: string;
  relevance_for_pandemic_agreement: string;
  source_status: string;
}

export function InstrumentsPanel({ instruments }: { instruments: Instrument[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [hierarchyFilter, setHierarchyFilter] = useState("");

  const filteredInstruments = useMemo(() => {
    return instruments.filter(inst => {
      const domain = getLegalDomain(inst.sector, inst.subsector);
      const matchesSearch = inst.norm_title.toLowerCase().includes(search.toLowerCase()) ||
                           inst.short_title.toLowerCase().includes(search.toLowerCase());
      const matchesDomain = !domainFilter || domain === domainFilter;
      const matchesHierarchy = !hierarchyFilter || inst.normative_hierarchy === hierarchyFilter;
      return matchesSearch && matchesDomain && matchesHierarchy;
    });
  }, [instruments, search, domainFilter, hierarchyFilter]);

  const uniqueHierarchies = Array.from(new Set(instruments.map(i => i.normative_hierarchy))).filter(Boolean);
  const uniqueDomains = Array.from(new Set(instruments.map(i => getLegalDomain(i.sector, i.subsector)))).filter(Boolean);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", isOpen ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500")}>
            <Shield size={18} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-slate-900">Mexican Legal Instruments Assessed</h3>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              {instruments.length} Instruments in Corpus Index
            </p>
          </div>
        </div>
        {isOpen ? <ChevronDown className="text-slate-400" /> : <ChevronRight className="text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-6 border-t border-slate-100 space-y-6 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search instruments..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs focus:outline-none"
              value={domainFilter}
              onChange={e => setDomainFilter(e.target.value)}
            >
              <option value="">All Legal Domains</option>
              {uniqueDomains.sort().map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs focus:outline-none"
              value={hierarchyFilter}
              onChange={e => setHierarchyFilter(e.target.value)}
            >
              <option value="">All Hierarchies</option>
              {uniqueHierarchies.sort().map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Norm Title</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type / Hierarchy</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Legal Domain</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInstruments.map(inst => (
                  <tr key={inst.norm_id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors">{inst.norm_title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1 uppercase">{inst.norm_id}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="text-[10px] font-bold text-slate-700">{inst.instrument_type.replace(/_/g, ' ')}</div>
                      <div className="text-[10px] text-slate-400 italic mt-0.5">{inst.normative_hierarchy.replace(/_/g, ' ')}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] font-bold uppercase tracking-tight">
                        {getLegalDomain(inst.sector, inst.subsector)}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className={cn(
                        "inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight",
                        inst.source_status === 'in_force' ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                      )}>
                        {inst.source_status.replace(/_/g, ' ')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredInstruments.length === 0 && (
              <div className="py-12 text-center text-slate-400 italic text-sm">
                No instruments found matching the current filters.
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100">
            <div className="p-4 bg-blue-50 rounded-xl flex gap-3">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed italic">
                The corpus includes {instruments.length} legal instruments. The legal provisions table is selective and only displays extracted provisions relevant to IHR/Pandemic Agreement mapping.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
