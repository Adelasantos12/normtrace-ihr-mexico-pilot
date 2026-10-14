import { Link } from 'react-router-dom';
export default function AuditNotice() {
 return <aside className="my-4 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-950 text-sm" aria-label="Audit status">
 <strong>Source-audited revision · 14 October 2026.</strong> Documentary errors were corrected; legal sufficiency and expert validation remain pending. SPAR subtraction and complete-pathway claims are withdrawn. <Link to="/audit" className="underline font-semibold">Review changes and sources</Link>.
 </aside>;
}
