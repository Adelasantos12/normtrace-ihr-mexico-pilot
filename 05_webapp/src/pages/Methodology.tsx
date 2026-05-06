import { cn } from '../lib/utils';

export function Methodology() {
  return (
    <div className="space-y-12 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Methodology & Caveats</h1>
        <p className="text-slate-500">Documentation of the mapping process, audit findings, and interpretive scales</p>
      </header>

      <section className="space-y-6">
        <div className="bg-blue-900 text-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">Audit Verdict: PASS_WITH_DOCUMENTED_FINDINGS</h2>
            <p className="text-blue-100 text-sm">Data Package Version: v0.1 | Audit Date: 2026-05-05</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Anchoring Scale (L1–L5)</h3>
                <div className="space-y-2">
                    {[
                        { l: "L5", d: "Explicit Constitutional or Legislative Anchor", c: "bg-green-600" },
                        { l: "L4", d: "Explicit Regulatory or Administrative Anchor", c: "bg-emerald-500" },
                        { l: "L3", d: "Indirect or Functional Alignment", c: "bg-blue-500" },
                        { l: "L2", d: "Partial or Fragmented Anchoring", c: "bg-amber-500" },
                        { l: "L1", d: "No identified domestic legal anchor", c: "bg-red-600" },
                    ].map(item => (
                        <div key={item.l} className="flex items-center gap-3">
                            <span className={`w-8 h-8 ${item.c} text-white rounded flex items-center justify-center font-bold shrink-0`}>{item.l}</span>
                            <span className="text-sm text-slate-700">{item.d}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Confidence & Status</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Confidence Level</h4>
                        <p className="text-sm text-slate-600">Reflects the mapping team's certainty in the legal interpretation, based on clarity of domestic text and presence of corroborating evidence.</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Review Status</h4>
                        <ul className="text-sm text-slate-600 list-disc pl-5">
                            <li><strong>verified:</strong> Human legal expert has reviewed and approved.</li>
                            <li><strong>requires_human_review:</strong> Identified as complex/ambiguous.</li>
                            <li><strong>preliminary_ai_assisted:</strong> Initial mapping needing expert validation.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Documented Audit Findings (UI Caveats)</h3>
        <div className="space-y-3">
            {[
                { id: "L-01", t: "RISS 1985 (NOM-017-SSA2) currency unverified", s: "HIGH", d: "May have been superseded or substantially amended. Requires human legal review." },
                { id: "L-02", t: "InDRE missing from actors file", s: "MEDIUM", d: "InDRE is referenced in gap map but lacks a dedicated record in the actors explorer." },
                { id: "L-03", t: "Corpus index schema limitation", s: "MEDIUM", d: "Source status conflates legal status with provenance." },
                { id: "L-04", t: "Normative hierarchy rank absent", s: "LOW", d: "Ordering in UI is alphabetical rather than by legal weight." },
                { id: "L-05", t: "Actor abbreviation matching limited", s: "LOW", d: "Some short-names in mapping may not link directly to the actors record." },
                { id: "L-06", t: "Unquoted semicolons in IHR 2024 source", s: "MEDIUM", d: "Some complex text fields may have formatting artifacts." },
                { id: "L-07", t: "80% of mapping is preliminary", s: "HIGH", d: "Most rows carry preliminary status and HAVE NOT received expert review." },
                { id: "L-08", t: "PABS references are provisional", s: "HIGH", d: "Based on 9 March 2026 IGWG draft; subject to change upon final adoption." },
            ].map(f => (
                <div key={f.id} className="p-4 bg-white border border-slate-200 rounded-lg flex gap-4">
                    <span className={cn(
                        "px-2 py-1 h-fit rounded text-[10px] font-bold shrink-0",
                        f.s === 'HIGH' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    )}>{f.s}</span>
                    <div>
                        <div className="font-bold text-sm">{f.id}: {f.t}</div>
                        <div className="text-xs text-slate-500 mt-1">{f.d}</div>
                    </div>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
}
