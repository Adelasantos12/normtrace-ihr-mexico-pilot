import { useMemo } from 'react';
import { useCsvData } from '../hooks/useData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Loader2, AlertCircle, Shield, FileText, GitMerge, Users, AlertTriangle, Layers } from 'lucide-react';
import { getAnchoringLabel, cn } from '../lib/utils';

interface MappingRow {
  obligation_id: string;
  anchoring_level: string;
  review_status: string;
  confidence_level: string;
  gap_type: string;
  domestic_norm: string;
}

export function Dashboard() {
  const { data: mappingData, loading: mLoading } = useCsvData<MappingRow>('mexico_ihr2005_mapping_clean.csv');
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
    };

    mappingData.forEach(row => {
      counts.anchoring[row.anchoring_level] = (counts.anchoring[row.anchoring_level] || 0) + 1;
      if (row.gap_type && row.gap_type !== 'None' && row.gap_type !== '') {
          counts.gaps[row.gap_type] = (counts.gaps[row.gap_type] || 0) + 1;
      }
      counts.norms[row.domestic_norm] = (counts.norms[row.domestic_norm] || 0) + 1;
    });

    const formatData = (obj: Record<string, number>) =>
      Object.entries(obj).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // Interpret anchoring
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
      interpretation
    };
  }, [mappingData, provisionsData, actorsData, corpusData, gapData]);

  if (mLoading || pLoading || aLoading || cLoading || gLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  }

  if (!stats) return <div className="p-8 text-red-600 bg-red-50 rounded-lg flex gap-2"><AlertCircle /> Error loading dashboard data</div>;

  return (
    <div className="space-y-10 pb-20">
      <header className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
           <p className="text-slate-500">Legal Internalisation Metrics for Mexico Pilot v0.1</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
           <Shield size={14} /> Mapping Version: v0.1
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "IHR 2005 Obligations", value: stats.totalObligations, icon: GitMerge },
          { label: "Domestic Provisions", value: stats.totalProvisions, icon: FileText },
          { label: "Mexican Instruments", value: stats.totalInstruments, icon: Shield },
          { label: "Actors Identified", value: stats.totalActors, icon: Users },
          { label: "Gap Areas", value: stats.totalGaps, icon: AlertTriangle },
        ].map((stat, i) => (
          <div key={i} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
               <stat.icon size={18} />
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">KPI</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Instrument Layers */}
        <div className="lg:col-span-1 space-y-4">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Layers size={18} className="text-blue-600" />
              Instrument Layers
           </h3>
           <div className="space-y-3">
              {[
                { title: "IHR 2005 Baseline", file: "mexico_ihr2005_mapping_clean.csv", status: "Baseline mapped", color: "bg-blue-600" },
                { title: "IHR 2024 Amendment Pressure", file: "ihr_2024_changes_clean.csv", status: "Update-review layer", color: "bg-amber-500" },
                { title: "Pandemic Agreement / PABS", file: "pandemic_agreement_obligations_clean.csv", status: "Provisional readiness", color: "bg-slate-500" },
              ].map((layer, i) => (
                <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-900">{layer.title}</span>
                    <div className={cn("w-2 h-2 rounded-full", layer.color)} />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{layer.file}</div>
                  <div className="inline-block px-2 py-0.5 bg-slate-50 text-[10px] font-bold text-slate-600 rounded border border-slate-100">
                    {layer.status}
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Mexico Anchoring Profile */}
        <div className="lg:col-span-2 space-y-4">
           <h3 className="font-bold text-slate-800">Mexico Anchoring Profile</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.anchoring} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-lg text-[10px] shadow-xl border border-slate-700">
                              <p className="font-bold mb-1">{payload[0].payload.fullName}</p>
                              <p>Count: {payload[0].value} obligations</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" fill="#1e40af" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                 <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Shield size={14} />
                       Identified Anchoring Pattern
                    </h4>
                    <p className="text-xs text-blue-800 leading-relaxed italic">
                       {stats.interpretation}
                    </p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Anchoring Scale Definition</p>
                    <div className="text-[10px] text-slate-500 space-y-1">
                       <p><strong>L0–L2:</strong> Administrative, operational or indirect anchoring.</p>
                       <p><strong>L3–L5:</strong> Statutory, legislative or integrated anchoring.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Gap Types */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800">Most Frequent Gap Types</h3>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
             {stats.gaps.map((gap, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                   <span className="text-xs text-slate-600 font-medium">{gap.name}</span>
                   <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">{gap.value}</span>
                </div>
             ))}
          </div>
        </div>

        {/* Top Domestic Norms */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800">Key Domestic Norms</h3>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
             {stats.norms.map((norm, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                   <span className="text-xs text-slate-600 font-medium truncate pr-4">{norm.name}</span>
                   <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">{norm.value}</span>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
