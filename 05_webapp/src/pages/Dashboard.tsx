import React, { useMemo } from 'react';
import {
  GitMerge, FileText, Shield, Users, AlertTriangle,
  Layers, BarChart as ChartIcon, ExternalLink, Info,
  TrendingUp, Activity, Gavel, Loader2, AlertCircle,
  ChevronRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useCsvData } from '../hooks/useData';
import { cn, getAnchoringLabel } from '../lib/utils';
import { getLegalDomain } from '../lib/domainGrouping';
import { InstrumentsPanel } from '../components/InstrumentsPanel';

export default function Dashboard() {
  const { data: mappingData, loading: mLoading } = useCsvData<any>('mexico_ihr2005_mapping_clean.csv');
  const { data: provisionsData, loading: pLoading } = useCsvData<any>('mexico_legal_provisions_clean.csv');
  const { data: actorsData, loading: aLoading } = useCsvData<any>('mexico_health_governance_actors_clean.csv');
  const { data: corpusData, loading: cLoading } = useCsvData<any>('mexico_normative_corpus_index_clean.csv');
  const { data: gapData, loading: gLoading } = useCsvData<any>('mexico_implementation_gap_map_clean.csv');

  const stats = useMemo(() => {
    if (!mappingData.length) return null;

    const counts = {
      anchoring: {} as Record<string, number>,
      gaps: {} as Record<string, number>,
      norms: {} as Record<string, number>,
      domains: {} as Record<string, number>,
    };

    mappingData.forEach(row => {
      counts.anchoring[row.anchoring_level] = (counts.anchoring[row.anchoring_level] || 0) + 1;
      if (row.gap_type && row.gap_type !== 'None' && row.gap_type !== '') {
          counts.gaps[row.gap_type] = (counts.gaps[row.gap_type] || 0) + 1;
      }
      counts.norms[row.domestic_norm] = (counts.norms[row.domestic_norm] || 0) + 1;
    });

    corpusData.forEach(inst => {
      const domain = getLegalDomain(inst.sector, inst.subsector);
      counts.domains[domain] = (counts.domains[domain] || 0) + 1;
    });

    const formatData = (obj: Record<string, number>) =>
      Object.entries(obj).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const l3to5 = (counts.anchoring['3'] || 0) + (counts.anchoring['4'] || 0) + (counts.anchoring['5'] || 0);
    const l0to2 = (counts.anchoring['0'] || 0) + (counts.anchoring['1'] || 0) + (counts.anchoring['2'] || 0);

    let interpretation = "";
    if (l3to5 > l0to2) {
      interpretation = "Most mappings fall into statutory anchoring levels (L3-L5), suggesting a formal normative basis for most obligations.";
    } else {
      interpretation = "A significant portion of mappings fall into administrative or indirect anchoring levels (L0-L2), indicating potential needs for statutory strengthening.";
    }

    return {
      totalObligations: new Set(mappingData.map(m => m.obligation_id)).size,
      totalProvisions: provisionsData.length,
      totalInstruments: corpusData.length,
      totalActors: actorsData.length,
      totalGaps: gapData.length,
      anchoring: Object.entries(counts.anchoring).map(([name, value]) => ({
        name: `Level ${name}`,
        fullName: getAnchoringLabel(name),
        value
      })).sort((a, b) => a.name.localeCompare(b.name)),
      gaps: formatData(counts.gaps).slice(0, 5),
      norms: formatData(counts.norms).slice(0, 5),
      domains: formatData(counts.domains),
      interpretation
    };
  }, [mappingData, provisionsData, actorsData, corpusData, gapData]);

  if (mLoading || pLoading || aLoading || cLoading || gLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  }

  if (!stats) return <div className="p-8 text-red-600 bg-red-50 rounded-lg flex gap-2"><AlertCircle /> Error loading dashboard data</div>;

  return (
    <div className="space-y-10 pb-20">
      <header>
         <h1 className="text-3xl font-bold text-slate-900">Mexico Legal Brain Dashboard</h1>
         <p className="text-slate-500 mt-1">Legal Internalisation Metrics for Mexico Pilot v0.1</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "IHR 2005 Obligations", value: stats.totalObligations, icon: GitMerge },
          { label: "Extracted Provisions", value: stats.totalProvisions, icon: FileText },
          { label: "Instruments Assessed", value: stats.totalInstruments, icon: Shield },
          { label: "Actors Identified", value: stats.totalActors, icon: Users },
          { label: "Implementation Gaps", value: stats.totalGaps, icon: AlertTriangle },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <div className="p-2 bg-slate-50 w-fit rounded-lg text-slate-500">
               <stat.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <InstrumentsPanel instruments={corpusData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Instrument Layers */}
        <div className="lg:col-span-1 space-y-6">
           <h3 className="font-bold text-slate-900 flex items-center gap-2 px-1">
              <Layers size={18} className="text-blue-600" />
              Instrument Layers
           </h3>
           <div className="space-y-4">
              {[
                { title: "IHR 2005 Baseline", description: "Current binding international regulations", status: "Baseline mapped", color: "bg-blue-600" },
                { title: "IHR 2024 Amendment Pressure", description: "Impact of 2024 amendments on domestic law", status: "Update-review layer", color: "bg-amber-500" },
                { title: "Pandemic Agreement / PABS", description: "Readiness for emerging international standards", status: "Provisional readiness", color: "bg-slate-500" },
              ].map((layer, i) => (
                <div key={i} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3 hover:border-blue-200 transition-colors group">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{layer.title}</span>
                      <p className="text-[10px] text-slate-500 mt-1">{layer.description}</p>
                    </div>
                    <div className={cn("w-2 h-2 rounded-full mt-1", layer.color)} />
                  </div>
                  <div className="inline-block px-2 py-0.5 bg-slate-50 text-[9px] font-bold text-slate-600 rounded border border-slate-100 uppercase tracking-tight">
                    {layer.status}
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Mexico Anchoring Profile */}
        <div className="lg:col-span-2 space-y-6">
           <h3 className="font-bold text-slate-900 px-1">Mexico Anchoring Profile</h3>
           <div className="bg-white p-8 border border-slate-200 rounded-2xl shadow-sm space-y-8">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.anchoring} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{fill: '#f8fafc'}}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 rounded-lg text-[10px] shadow-xl border border-slate-200">
                              <p className="font-bold text-slate-900 mb-1">{payload[0].payload.fullName}</p>
                              <p className="text-slate-500">Count: {payload[0].value} obligations</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" fill="#1e40af" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                 <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <TrendingUp size={14} className="text-blue-500" />
                       Anchoring Pattern Analysis
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium italic">
                       "{stats.interpretation}"
                    </p>
                 </div>
                 <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Anchoring Scale Guide</h4>
                    <div className="grid grid-cols-1 gap-2">
                       <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg">
                          <span className="text-[10px] font-bold text-slate-500">L0–L2</span>
                          <span className="text-[10px] text-slate-600 font-medium">Admin / Operational</span>
                       </div>
                       <div className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded-lg">
                          <span className="text-[10px] font-bold text-blue-600">L3–L5</span>
                          <span className="text-[10px] text-blue-700 font-medium">Statutory / Legislative</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Gap Types */}
        <div className="space-y-6">
          <h3 className="font-bold text-slate-900 px-1">Top Legal Domain Distribution</h3>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.domains.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={140} tick={{fontSize: 9, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Top Domestic Norms */}
        <div className="space-y-6">
          <h3 className="font-bold text-slate-900 px-1">High-Impact Domestic Norms</h3>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-50">
             {stats.norms.map((norm, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                         {i + 1}
                      </div>
                      <span className="text-xs text-slate-700 font-medium truncate max-w-[240px]">{norm.name}</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{norm.value} Oblig.</span>
                      <ChevronRight size={14} className="text-slate-300" />
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
