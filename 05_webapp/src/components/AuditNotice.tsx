import { Link } from 'react-router-dom';
export function AuditNotice() {
  return <aside className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" aria-label="Dataset audit status">
    <strong>Source corrections · 14 October 2026.</strong>{' '}This is a corrected preliminary dataset, not an expert-validated compliance assessment. Missing evidence is not a finding of legal absence.{' '}
    <Link className="underline font-medium" to="/audit">Review corrections, sources and pending questions</Link>.
  </aside>;
}
