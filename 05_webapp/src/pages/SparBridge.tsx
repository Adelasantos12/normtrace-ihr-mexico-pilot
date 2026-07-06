import { useJsonData } from '../hooks/useData';
import { AlertCircle } from 'lucide-react';
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
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!data) return (
    <div className="p-8 text-slate-500 text-sm">
      No divergence data found. Run <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">python3 06_scripts/build_tables/spar_normtrace_bridge.py</code> and redeploy.
    </div>
  );

  const cc1 = data.headline_cc1;
  const cap1Traj = data.cc1_spar_series?.trajectory ?? [];

  return (
    <div className="space-y-16 pb-24">
      {/* Header */}
      <header className="space-y-4">
        <div className="text-xs font-semibold uppercase tracking-widest text-blue-700">
          Construct-Validity Diagnostic
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">SPAR ↔ Legal</h1>
        <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
          Self-reported CC1 (Legislation, policy &amp; financing) capacity from WHO SPAR, compared against the
          actual domestic <strong className="text-slate-900 font-medium">legal anchoring</strong> of the same
          obligations. A large positive gap flags capacity reported without a sustainable legal-institutional base.
        </p>
        <p className="text-xs text-slate-400 max-w-2xl italic">{data.scope_note}</p>
      </header>

      {/* Headline — divergence as the dominant pull-quote, CC1 pair subordinate */}
      <div className="border-t-2 border-slate-900 pt-10">
        <div className="grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-3 border-l-4 border-red-600 pl-6">
            <div className="text-6xl sm:text-7xl font-bold text-red-600 leading-none tabular-nums">
              +{cc1.divergence_mean}
            </div>
            <div className="text-base font-medium text-slate-700 mt-5">
              Divergence — SPAR self-report above legal anchoring
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mt-2 max-w-md">
              Points of gap between Mexico's self-reported CC1 capacity and NormTrace's legal-anchoring score for
              the same {cc1.n_obligations} obligations.
            </p>
          </div>

          <div className="md:col-span-2 md:pl-8 md:border-l md:border-slate-200 space-y-8">
            <div>
              <div className="text-3xl font-semibold text-slate-900">{cc1.spar_self_report_mean}%</div>
              <div className="text-sm font-medium text-slate-700 mt-1">CC1 · self-report (SPAR)</div>
              <div className="text-xs text-slate-400 mt-1">mean · {cc1.spar_self_report_latest}% latest</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-slate-900">{cc1.normtrace_legal_anchoring_pct}%</div>
              <div className="text-sm font-medium text-slate-700 mt-1">CC1 · legal anchoring (NormTrace)</div>
              <div className="text-xs text-slate-400 mt-1">{cc1.n_obligations} obligations</div>
            </div>
          </div>
        </div>
      </div>

      {/* CC1 trajectory */}
      <div className="pt-10 border-t border-slate-200 space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Mexico — SPAR CC1 (Legislation) over time</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Self-reported legislation capacity ran at 100% for most of 2011–2018. The dashed line is the
            NormTrace legal anchoring for the same obligations ({cc1.normtrace_legal_anchoring_pct}%) — the
            persistent gap is the point. Each point is one yearly SPAR submission; the line connects discrete
            observations and should not be read as a continuous measure.
          </p>
        </div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer debounce={200} initialDimension={{ width: 800, height: 300 }}>
            <LineChart data={cap1Traj} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" axisLine={false} tickLine={false} />
              <Tooltip />
              <ReferenceLine y={cc1.normtrace_legal_anchoring_pct} stroke="#d97706" strokeDasharray="6 4"
                label={{ value: `NormTrace anchoring ${cc1.normtrace_legal_anchoring_pct}%`, position: 'insideBottomRight', fontSize: 11, fill: '#d97706' }} />
              <Line type="linear" dataKey="value" name="SPAR CC1 self-report" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: '#2563eb' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Corpus-wide NormTrace stat, explicitly not compared to SPAR */}
      <div className="pt-10 border-t border-slate-200 space-y-2">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide">For context — corpus-wide NormTrace anchoring</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{data.normtrace_corpus_anchoring_pct}%</span>
          <span className="text-sm text-slate-500">mean legal anchoring across all 45 IHR 2005 obligations</span>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          This is NormTrace's own standalone statistic, not a SPAR comparison — SPAR's overall aggregate score
          mixes in operational capacities (surveillance, points of entry, emergency management, etc.) that
          NormTrace does not measure, so it is not construct-comparable to this figure.
        </p>
      </div>

      {/* Caveats — the one reserved amber warning treatment */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-amber-800 font-medium text-sm">
          <AlertCircle size={15} /> Methodological caveats
        </div>
        <ul className="space-y-2">
          {data.caveats.map((c, i) => (
            <li key={i} className="flex gap-3 text-sm text-amber-900">
              <div className="w-1 h-1 bg-amber-400 rounded-full mt-2 shrink-0" />
              <span className="leading-relaxed">{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
