import { useMemo } from 'react';
import { useCsvData } from '../hooks/useData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Loader2, AlertCircle } from 'lucide-react';

interface MappingRow {
  obligation_id: string;
  anchoring_level: string;
  review_status: string;
  confidence_level: string;
  gap_type: string;
  domestic_norm: string;
  possible_domestic_actor: string;
}

const COLORS = ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];

export function Dashboard() {
  const { data, loading, error } = useCsvData<MappingRow>('mexico_ihr2005_mapping_clean.csv');

  const stats = useMemo(() => {
    if (!data.length) return null;

    const counts = {
      total: data.length,
      anchoring: {} as Record<string, number>,
      review: { preliminary_ai_assisted: 0, requires_human_review: 0, verified: 0 } as Record<string, number>,
      confidence: {} as Record<string, number>,
      gaps: {} as Record<string, number>,
      norms: {} as Record<string, number>,
    };

    data.forEach(row => {
      counts.anchoring[row.anchoring_level] = (counts.anchoring[row.anchoring_level] || 0) + 1;
      counts.review[row.review_status] = (counts.review[row.review_status] || 0) + 1;
      counts.confidence[row.confidence_level] = (counts.confidence[row.confidence_level] || 0) + 1;
      if (row.gap_type && row.gap_type !== 'None' && row.gap_type !== '') {
          counts.gaps[row.gap_type] = (counts.gaps[row.gap_type] || 0) + 1;
      }
      counts.norms[row.domestic_norm] = (counts.norms[row.domestic_norm] || 0) + 1;
    });

    const formatData = (obj: Record<string, number>) =>
      Object.entries(obj).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    return {
      total: data.length,
      needsReview: (counts.review.preliminary_ai_assisted || 0) + (counts.review.requires_human_review || 0),
      anchoring: formatData(counts.anchoring),
      confidence: formatData(counts.confidence),
      gaps: formatData(counts.gaps).slice(0, 5),
      norms: formatData(counts.norms).slice(0, 5),
    };
  }, [data]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg flex gap-2"><AlertCircle /> Error loading dashboard data</div>;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Overview of Mexico's IHR 2005 Mapping</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Obligations Mapped</p>
          <p className="text-4xl font-bold text-blue-900 mt-2">{stats.total}</p>
        </div>
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Requiring Review</p>
          <p className="text-4xl font-bold text-amber-600 mt-2">{stats.needsReview}</p>
        </div>
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Status</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">v0.1</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm h-80 flex flex-col">
          <h3 className="font-bold text-slate-700 mb-4">Anchoring Level Distribution</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.anchoring} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="value" fill="#1e40af" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm h-80 flex flex-col">
          <h3 className="font-bold text-slate-700 mb-4">Confidence Level Distribution</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.confidence}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name }) => name}
                >
                  {stats.confidence.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-700 mb-4">Most Frequent Gap Types</h3>
          <div className="space-y-3">
            {stats.gaps.map((gap) => (
              <div key={gap.name} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 truncate mr-4">{gap.name}</span>
                <span className="text-sm font-bold text-slate-900">{gap.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-700 mb-4">Most Frequent Domestic Norms</h3>
          <div className="space-y-3">
            {stats.norms.map((norm) => (
              <div key={norm.name} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 truncate mr-4">{norm.name}</span>
                <span className="text-sm font-bold text-slate-900">{norm.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
