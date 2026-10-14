import { Link } from 'react-router-dom';
export default function AuditNotice() {
 return <aside className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" role="note"><strong>Source corrections · 14 October 2026.</strong> Legal scores and confirmed-gap totals are withheld pending consistent recoding. Textual corrections do not constitute expert compliance validation. <Link className="underline" to="/audit">Review changes and sources</Link>.</aside>;
}
