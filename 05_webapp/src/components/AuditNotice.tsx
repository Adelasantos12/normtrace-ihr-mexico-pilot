import { Link } from 'react-router-dom';
import { useJsonData } from '../hooks/useData';

export interface AuditManifest {
  audit_version: string; audit_date: string; scope: string;
  counts: Record<string, number>;
  baseline_counts: Record<string, number>;
  targeted_reassessment_obligations: number;
  targeted_reassessment_obligation_ids: string[];
  new_source_provisions: number;
  pending: string[];
  withdrawn_claims: string[];
  sources: { id: string; url: string; locator: string }[];
  nia: { international_status: string; status_date: string; publication_date: string; source: string; locator: string; institution_identified: string | null; domestic_designation_instrument: string | null; note: string };
}
export function AuditNotice() {
  return <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 leading-relaxed" role="note">
    <strong>Source corrections · 14 October 2026.</strong>{' '}
    This remains a preliminary pilot. A located source is not a validated legal-compliance finding.
    Aggregate anchoring scores and earlier deficit counts are withheld pending reassessment.{' '}
    <Link to="/audit" className="underline font-medium">Correction record and pending work</Link>
  </aside>;
}
export function AuditFacts({ title = 'Current dataset' }: { title?: string }) {
  const { data, loading, error } = useJsonData<AuditManifest>('derived/audit_manifest.json');
  if (loading) return <p role="status">Loading dataset version…</p>;
  if (!data || error) return <p role="alert">The dataset manifest could not be loaded. No counts are inferred.</p>;
  return <section className="space-y-4">
    <h2 className="text-xl font-semibold">{title}</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {(['obligations','instruments','provisions','mappings'] as const).map(key => <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-3xl font-bold tabular-nums">{data.counts[key]}</p>
        <p className="text-sm text-slate-600">{key === 'obligations' ? 'Selected IHR 2005 requirements' : key === 'mappings' ? 'Provision-level correspondences' : key === 'instruments' ? 'Corpus instruments' : 'Extracted provisions'}</p>
      </div>)}
    </div>
    <p className="text-sm text-slate-600">Version {data.audit_version}. {data.new_source_provisions} source-checked provisions added; {data.targeted_reassessment_obligations} selected requirements have mappings flagged for targeted reassessment. This is a review workload, not a deficit rate.</p>
  </section>;
}
