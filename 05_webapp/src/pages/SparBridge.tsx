import { useJsonData } from '../hooks/useData';
import { Scale, TrendingDown, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, Legend,
} from 'recharts';

// Shape of 05_webapp/public/data/derived/spar_normtrace_divergence.json
// (computed by 06_scripts/build_tables/spar_normtrace_bridge.py).
interface DivergenceRow {
  capacity: string; cc_tag: string;
  spar_self_report_latest: number; spar_self_report_mean: number;
  normtrace_legal_anchoring_pct: number;
  divergence_latest: number; divergence_mean: number; n_obligations: number;
}
interface SparSeries { latest_year: number; latest: number; mean: number; max: number;
  trajectory: { year: number; value: number }[]; }
interface Divergence {
  country: string; thesis: string;
  headline_cc1: DivergenceRow;
  overall: { spar_all_latest: number; spar_all_mean: number; normtrace_overall_anchoring_pct: number };
  divergence_table: DivergenceRow[];
  spar_series: Record<string, SparSeries>;
  caveats: string[];
}

export default function SparBridge() {
  const { data, loading } = useJsonData<Divergence>('derived/spar_normtrace_divergence.json');

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!data) return (
    <div className="p-8 text-slate-500">
      No divergence data found. Run <code className="text-xs bg-slate-100 px-1 rounded">python3 06_scripts/build_tables/spar_normtrace_bridge.py</code> and redeploy.
    </div>
  );

  const cc1 = data.headline_cc1;
  const chartData = data.divergence_table.map(r => ({
    name: r.capacity.replace(/^C\d+ /, ''),
    'SPAR self-report': r.spar_self_report_mean,
    'NormTrace legal anchoring': r.normtrace_legal_anchoring_pct,
    divergence: r.divergence_mean,
  }));
  const cap1Traj = data.spar_series['spar_cap1']?.trajectory ?? [];

  return (
    <div className="space-y-8 pb-24">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-900 rounded-lg text-white"><Scale size={22} /></div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">SPAR ↔ Legal</h1>
        </div>
        <p className="text-lg text-slate-600 max-w-3xl">
          Self-reported IHR capacity (WHO SPAR) versus the actual domestic <strong>legal anchoring</strong> of
          the same obligations (NormTrace). A large positive gap flags capacity reported without a
          sustainable legal-institutional base.
        </p>
      </header>

      {/* Headline cards */}
      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white rounded-3xl p-8">
          <div className="text-[10px] font-black uppercase tracking-widest text-blue-200">CC1 · Legislation — self-report</div>
          <div className="mt-3 text-5xl font-black">{cc1.spar_self_report_mean}%</div>
          <div className="text-blue-200 text-sm mt-1">SPAR mean · {cc1.spar_self_report_latest}% latest</div>
        </div>
        <div className="bg-gradient-to-br from-amber-600 to-amber-500 text-white rounded-3xl p-8">
          <div className="text-[10px] font-black uppercase tracking-widest text-amber-100">CC1 · Legislation — legal anchoring</div>
          <div className="mt-3 text-5xl font-black">{cc1.normtrace_legal_anchoring_pct}%</div>
          <div className="text-amber-100 text-sm mt-1">NormTrace · {cc1.n_obligations} obligations</div>
        </div>
        <div className="bg-slate-900 text-white rounded-3xl p-8">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><TrendingDown size={12} /> Divergence</div>
          <div className="mt-3 text-5xl font-black text-red-400">+{cc1.divergence_mean}</div>
          <div className="text-slate-400 text-sm mt-1">points, self-report above legal anchoring</div>
        </div>
      </div>

      {/* Grouped bar: SPAR vs NormTrace per capacity */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4">
        <h3 className="text-xl font-black text-slate-900">Self-report vs legal anchoring, by capacity</h3>
        <p className="text-sm text-slate-500">Every mapped capacity sits far above its legal anchoring. Ordered by divergence.</p>
        <div style={{ width: '100%', height: 360 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 60, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={70} tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <Legend />
              <Bar dataKey="SPAR self-report" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="NormTrace legal anchoring" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CC1 trajectory with NormTrace reference line */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4">
        <h3 className="text-xl font-black text-slate-900">Mexico — SPAR CC1 (Legislation) over time</h3>
        <p className="text-sm text-slate-500">
          Self-reported legislation capacity ran at 100% for most of 2011–2018. The dashed line is the
          NormTrace legal anchoring for the same obligations ({cc1.normtrace_legal_anchoring_pct}%) — the persistent gap is the point.
        </p>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <LineChart data={cap1Traj} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <ReferenceLine y={cc1.normtrace_legal_anchoring_pct} stroke="#d97706" strokeDasharray="6 4"
                label={{ value: `NormTrace anchoring ${cc1.normtrace_legal_anchoring_pct}%`, position: 'insideBottomRight', fontSize: 11, fill: '#d97706' }} />
              <Line type="monotone" dataKey="value" name="SPAR CC1 self-report" stroke="#1e3a8a" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Divergence table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4 overflow-x-auto">
        <h3 className="text-xl font-black text-slate-900">Divergence table</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-200">
              <th className="py-2 pr-4">Capacity</th>
              <th className="py-2 px-2 text-right">SPAR mean</th>
              <th className="py-2 px-2 text-right">NormTrace</th>
              <th className="py-2 px-2 text-right">Divergence</th>
              <th className="py-2 pl-2 text-right">Obligations</th>
            </tr>
          </thead>
          <tbody>
            {data.divergence_table.map((r) => (
              <tr key={r.cc_tag} className="border-b border-slate-50">
                <td className="py-3 pr-4 font-bold text-slate-800">{r.capacity}</td>
                <td className="py-3 px-2 text-right text-slate-600">{r.spar_self_report_mean}%</td>
                <td className="py-3 px-2 text-right text-slate-600">{r.normtrace_legal_anchoring_pct}%</td>
                <td className="py-3 px-2 text-right font-black text-red-600">+{r.divergence_mean}</td>
                <td className="py-3 pl-2 text-right text-slate-500">{r.n_obligations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Caveats */}
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-black text-sm uppercase tracking-wider">
          <AlertCircle size={16} /> Methodological caveats
        </div>
        <ul className="space-y-2">
          {data.caveats.map((c, i) => (
            <li key={i} className="flex gap-3 text-sm text-amber-900">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
