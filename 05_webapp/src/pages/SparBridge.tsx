import { useJsonData } from '../hooks/useData';
import { Scale, TrendingDown, AlertCircle } from 'lucide-react';
import {
  LineChart, Line, ReferenceLine, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// Shape of 05_webapp/public/data/derived/spar_normtrace_divergence.json
// (computed by 06_scripts/build_tables/spar_normtrace_bridge.py).
// Scoped to CC1 only -- see the script's docstring and
// network_methodology_rationale.md SS3.4 for why the other SPAR capacities
// are not compared here (they measure operational capacity, a different
// construct from NormTrace's legal-anchoring score).
interface Cc1Row {
  capacity: string; cc_tag: string;
  spar_self_report_latest: number; spar_self_report_mean: number;
  normtrace_legal_anchoring_pct: number;
  divergence_latest: number; divergence_mean: number; n_obligations: number;
}
interface SparSeries { latest_year: number; latest: number; mean: number; max: number;
  trajectory: { year: number; value: number }[]; }
interface Divergence {
  country: string; scope_note: string; thesis: string;
  headline_cc1: Cc1Row;
  normtrace_corpus_anchoring_pct: number;
  cc1_spar_series: SparSeries;
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
  const cap1Traj = data.cc1_spar_series?.trajectory ?? [];

  return (
    <div className="space-y-8 pb-24">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-900 rounded-lg text-white"><Scale size={22} /></div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">SPAR ↔ Legal</h1>
        </div>
        <p className="text-lg text-slate-600 max-w-3xl">
          Self-reported CC1 (Legislation, policy &amp; financing) capacity (WHO SPAR) versus the actual domestic{' '}
          <strong>legal anchoring</strong> of the same obligations (NormTrace). A large positive gap flags capacity
          reported without a sustainable legal-institutional base.
        </p>
        <p className="text-xs text-slate-400 max-w-3xl italic">{data.scope_note}</p>
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

      {/* CC1 trajectory with NormTrace reference line */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4">
        <h3 className="text-xl font-black text-slate-900">Mexico — SPAR CC1 (Legislation) over time</h3>
        <p className="text-sm text-slate-500">
          Self-reported legislation capacity ran at 100% for most of 2011–2018. The dashed line is the
          NormTrace legal anchoring for the same obligations ({cc1.normtrace_legal_anchoring_pct}%) — the persistent gap is the point.
          Each point is one yearly SPAR submission; the line connects discrete observations and should not be read as a continuous measure.
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
              <Line type="linear" dataKey="value" name="SPAR CC1 self-report" stroke="#1e3a8a" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Corpus-wide NormTrace stat, explicitly not compared to SPAR */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-2">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">For context — corpus-wide NormTrace anchoring</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-900">{data.normtrace_corpus_anchoring_pct}%</span>
          <span className="text-sm text-slate-500">mean legal anchoring across all 45 IHR 2005 obligations</span>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl">
          This is NormTrace's own standalone statistic, not a SPAR comparison — SPAR's overall aggregate score
          mixes in operational capacities (surveillance, points of entry, emergency management, etc.) that
          NormTrace does not measure, so it is not construct-comparable to this figure.
        </p>
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
