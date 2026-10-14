import { Link } from 'react-router-dom';
export default function AuditStatus() {
  return <aside className="my-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950" aria-label="Evidence review status">
    <strong>Evidence correction · 14 October 2026.</strong> Source corrections have been applied. Full legal validation is still pending; numerical anchoring and confirmed-gap totals are not reported.
    <Link className="ml-2 underline font-medium" to="/audit">Corrections, sources and remaining review</Link>
  </aside>;
}
