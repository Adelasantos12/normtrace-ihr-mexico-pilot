#!/usr/bin/env python3
"""
NormTrace-IHR — SPAR x NormTrace divergence bridge.

Operationalises the core thesis: self-reported IHR capacity (SPAR) can run far
ABOVE the actual domestic *legal anchoring* NormTrace finds for the same
general capacity area. We compare, for Mexico:

  SPAR self-report (0-100, cap1 = CC1 Legislation/Policy/Financing)
      vs
  NormTrace legal anchoring (0-5 -> 0-100), mean over the obligations whose
  implementation_domain includes CC1.

This turns the qualitative claim ("Mexico reports perfect legislation capacity
while its main instrument dates to 1985") into a measured divergence.

Scope: CC1 only, and NOT an equivalent-denominator comparison. SPAR's CC1 is
a country-level self-report answer for "Legislation, policy & financing" as a
whole -- WHO's own indicator, not decomposed into the individual IHR (2005)
obligations that make up the capacity area. NormTrace's anchoring figure is
the MEAN legal-anchoring score across the N obligations that NormTrace's own
corpus tags implementation_domain=CC1 -- an internal categorisation, not a
verified crosswalk against SPAR's specific indicator content. There is no
item-level check in this repo (or, to our knowledge, published anywhere)
confirming that SPAR's C1 score is itself computed from exactly these N
treaty obligations. Both measure the same NAMED capacity area (national
legislation/policy/financing for IHR implementation) at a thematic level, per
the IHR Monitoring and Evaluation Framework's shared terminology -- that is
the basis for comparing them at all -- but they are two lenses on that same
general dimension, not two scores over the same denominator. Frame any
divergence accordingly: "SPAR's self-reported C1 capacity runs above
NormTrace's obligation-level anchoring for the same general capacity area,"
never "for the same obligations" or "the same construct" (see
network_methodology_rationale.md SS4 for the corresponding guardrail). SPAR's
other capacities (surveillance, points of entry, emergency management, IHR
coordination, etc.) measure operational capacity -- staffed systems,
infrastructure, running programmes -- which is a different construct
NormTrace does not measure at all; a prior version of this script paired
NormTrace's score against those too and was narrowed to CC1-only because it
is at least the same named capacity area, even without a verified crosswalk
(see network_methodology_rationale.md SS3.4).

Primary comparison year: latest, not mean. NormTrace's anchoring score is a
snapshot of the current legal state, not a multi-year average, so the
headline divergence pairs it against SPAR's latest CC1 submission
(spar_self_report_latest / divergence_latest). spar_self_report_mean /
divergence_mean are computed and retained only as historical context for
the SPAR trajectory -- see comparison_rationale in the output JSON.

Inputs:
  02_data/raw/spar_americas_clean.csv           (SPAR panel, Americas)
  03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv
  03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv  (';'-delimited)

Output:
  04_outputs/exports/spar_normtrace_divergence.json
  05_webapp/public/data/derived/spar_normtrace_divergence.json
"""
from __future__ import annotations
import csv, json, os, statistics
from collections import defaultdict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SPAR = os.path.join(ROOT, "02_data/raw/spar_americas_clean.csv")
MAP = os.path.join(ROOT, "03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv")
OBL = os.path.join(ROOT, "03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv")
OUT_EXP = os.path.join(ROOT, "04_outputs/exports")
OUT_WEB = os.path.join(ROOT, "05_webapp/public/data/derived")
os.makedirs(OUT_EXP, exist_ok=True); os.makedirs(OUT_WEB, exist_ok=True)

CC1_LABEL = "C1 Legislation, policy & financing"
CC1_SPAR_COL = "spar_cap1"


def norm_anchoring_by_obligation():
    """max anchoring_level (0-5) per obligation_id, as % of 5."""
    best = defaultdict(int)
    with open(MAP, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            oid = r["obligation_id"].strip()
            try:
                lvl = int(r.get("anchoring_level") or 0)
            except ValueError:
                lvl = 0
            best[oid] = max(best[oid], lvl)
    return best


def obligation_domains():
    """obligation_id -> set of CC/PoE tags parsed from implementation_domain."""
    dom = {}
    with open(OBL, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f, delimiter=";"):
            oid = (r.get("obligation_id") or "").strip()
            field = (r.get("implementation_domain") or "")
            tags = set()
            for tok in field.replace("–", "-").split(";"):
                tok = tok.strip()
                if tok.upper().startswith("CC"):
                    tags.add(tok.split()[0].upper().replace("-", ""))
                elif tok.upper().startswith("POE") or tok.lower().startswith("poe"):
                    tags.add("PoE")
            if oid:
                dom[oid] = tags
    return dom


def mexico_spar():
    """Mexico SPAR rows, sorted by year."""
    rows = []
    with open(SPAR, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if r["iso3c"] == "MEX":
                rows.append(r)
    rows.sort(key=lambda r: int(r["year"]))
    return rows


def to_float(x):
    try:
        return float(x)
    except (ValueError, TypeError):
        return None


def main():
    anchoring = norm_anchoring_by_obligation()
    domains = obligation_domains()
    spar_rows = mexico_spar()

    # CC1 SPAR series (latest + mean over available years).
    vals = [(int(r["year"]), to_float(r.get(CC1_SPAR_COL))) for r in spar_rows]
    vals = [(y, v) for y, v in vals if v is not None]
    cc1_series = {
        "latest_year": vals[-1][0], "latest": vals[-1][1],
        "mean": round(statistics.mean(v for _, v in vals), 1),
        "max": max(v for _, v in vals),
        "trajectory": [{"year": y, "value": v} for y, v in vals],
    }

    # NormTrace legal anchoring for the obligations tagged CC1.
    cc1_oids = [oid for oid, tags in domains.items() if "CC1" in tags]
    cc1_scores = [anchoring.get(oid, 0) for oid in cc1_oids]
    cc1_anchoring_pct = round(statistics.mean(cc1_scores) / 5 * 100, 1)

    headline = {
        "capacity": CC1_LABEL, "cc_tag": "CC1",
        "spar_self_report_latest": cc1_series["latest"],
        "spar_self_report_mean": cc1_series["mean"],
        "normtrace_legal_anchoring_pct": cc1_anchoring_pct,
        "divergence_latest": round(cc1_series["latest"] - cc1_anchoring_pct, 1),
        "divergence_mean": round(cc1_series["mean"] - cc1_anchoring_pct, 1),
        "n_obligations": len(cc1_scores),
    }

    # Corpus-wide mean anchoring, reported as a standalone NormTrace statistic
    # (NOT paired against SPAR's overall aggregate score, which mixes in
    # operational capacities NormTrace does not measure -- same construct
    # mismatch as the removed multi-capacity table above).
    normtrace_corpus_anchoring_pct = round(statistics.mean(anchoring.values()) / 5 * 100, 1)

    result = {
        "generated_by": "06_scripts/build_tables/spar_normtrace_bridge.py",
        "country": "Mexico",
        "scope_note": (
            "Comparison is limited to CC1 (Legislation, policy & financing), the one "
            "SPAR capacity that shares a name and general theme with what NormTrace's "
            "legal-anchoring score measures. This is a thematic pairing, not a verified "
            "equivalent-denominator one: SPAR's CC1 is a country-level self-report answer "
            "for the capacity area as a whole, not decomposed into individual IHR "
            "obligations; NormTrace's figure is the mean anchoring score across the N "
            "obligations NormTrace's own corpus tags as CC1 (an internal categorisation, "
            "not a checked crosswalk against SPAR's specific indicator content). SPAR's "
            "other capacities measure operational capacity, which NormTrace does not "
            "assess at all; an earlier version of this bridge compared five capacities "
            "and has been narrowed to CC1 as the closest available theme."
        ),
        "thesis": ("SPAR CC1 self-report measures reported legislative/policy capacity for "
                   "the capacity area as a whole; NormTrace measures domestic legal "
                   "anchoring for the specific obligations it tags CC1 -- two lenses on the "
                   "same general capacity dimension, not scores over the same denominator. "
                   "A large positive divergence flags capacity reported without a "
                   "sustainable legal-institutional base for those obligations."),
        "primary_comparison": "latest",
        "comparison_rationale": (
            "NormTrace's legal-anchoring score is a snapshot of the CURRENT legal-"
            "institutional state, not a multi-year average -- it does not have a "
            "'historical mean' the way a repeated yearly submission does. The "
            "construct-valid pairing is therefore NormTrace anchoring against SPAR's "
            "most recent (latest-year) CC1 submission, not against SPAR's historical "
            "mean, which mixes years the anchoring score was never computed for. "
            "spar_self_report_mean / divergence_mean are retained as historical "
            "context for the SPAR trajectory only -- they are not the headline figure."
        ),
        "headline_cc1": headline,
        "normtrace_corpus_anchoring_pct": normtrace_corpus_anchoring_pct,
        "cc1_spar_series": cc1_series,
        "caveats": ["This comparison covers CC1 only; NormTrace does not measure the "
                    "operational capacities SPAR's other core capacities assess "
                    "(surveillance systems, points-of-entry infrastructure, emergency "
                    "management, etc.), so no divergence claim is made for them.",
                    "SPAR's CC1 score and NormTrace's anchoring score are not a verified "
                    "equivalent-denominator comparison: SPAR reports one self-assessed "
                    "value for the capacity area as a whole, while NormTrace averages its "
                    "own obligation-level anchoring across the obligations it tags CC1. No "
                    "crosswalk confirms these are literally the same items -- read the "
                    "divergence as two lenses on the same named capacity area, not as two "
                    "scores over identical obligations.",
                    "NormTrace anchoring is preliminary_ai_assisted and unvalidated by a "
                    "domestic public-health-law expert.",
                    "SPAR cap1 methodology changed across editions, so within-SPAR "
                    "year-over-year swings should be read as trajectory context, not "
                    "compared point-by-point across years. That is separate from the "
                    "headline pairing above: NormTrace anchoring is itself a current "
                    "snapshot, so it is deliberately compared against SPAR's latest "
                    "submission (not the SPAR historical mean)."],
    }

    for folder in (OUT_EXP, OUT_WEB):
        with open(os.path.join(folder, "spar_normtrace_divergence.json"), "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

    print("=== SPAR CC1 (self-report) vs NormTrace (legal anchoring) — Mexico ===\n")
    print(f"HEADLINE (CC1 Legislation): Mexico self-reported "
          f"{headline['spar_self_report_latest']}% (latest, {cc1_series['latest_year']}) legislation "
          f"capacity, while NormTrace legal anchoring = {headline['normtrace_legal_anchoring_pct']}% "
          f"(n={headline['n_obligations']} obligations) "
          f"-> divergence {headline['divergence_latest']} pts (primary, vs. latest). "
          f"[Historical context: SPAR mean {headline['spar_self_report_mean']}% -> "
          f"{headline['divergence_mean']} pts vs. mean.]")
    print(f"\nCorpus-wide NormTrace anchoring (all 45 obligations, standalone stat, "
          f"not compared to SPAR): {normtrace_corpus_anchoring_pct}%.")


if __name__ == "__main__":
    main()
