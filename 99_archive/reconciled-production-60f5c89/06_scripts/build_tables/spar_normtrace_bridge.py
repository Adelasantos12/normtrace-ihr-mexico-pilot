#!/usr/bin/env python3
"""Build SPAR historical context. Numerical subtraction from NormTrace is withdrawn by the 2026-10-14 audit."""
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
        "divergence_latest": None,
        "divergence_mean": None,
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

    result['primary_comparison'] = 'not_comparable'
    result['comparison_rationale'] = 'No validated common construct, denominator or item-level crosswalk. Subtraction withdrawn.'
    result['scope_note'] = 'SPAR C1.1 already asks for national and subnational legal mapping; C2.1 addresses focal-point mandate and functioning. NormTrace organizes obligation-level documentary evidence.'
    result['thesis'] = 'A published score does not substitute for inspectable legal sources.'
    result['caveats'] = ['SPAR and NormTrace are not equivalent measurements. No divergence or overstatement is inferred.', 'The SPAR instrument changed across reporting editions; the historical series is not measurement-invariant.', 'NormTrace source corrections remain subject to legal scope review.']
    result['headline_cc1']['normtrace_legal_anchoring_pct'] = None
    result['normtrace_corpus_anchoring_pct'] = None
    for folder in (OUT_EXP, OUT_WEB):
        with open(os.path.join(folder, "spar_normtrace_divergence.json"), "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

    print("SPAR context rebuilt; non-equivalent score subtraction disabled.")


if __name__ == "__main__":
    main()
