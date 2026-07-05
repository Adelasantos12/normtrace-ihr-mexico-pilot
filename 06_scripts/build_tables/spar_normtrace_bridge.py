#!/usr/bin/env python3
"""
NormTrace-IHR — SPAR x NormTrace divergence bridge.

Operationalises the core thesis: self-reported IHR capacity (SPAR) can run far
ABOVE the actual domestic *legal anchoring* of the same obligations. We compare,
for Mexico:

  SPAR self-report (0-100, cap1 = CC1 Legislation/Policy/Financing)
      vs
  NormTrace legal anchoring (0-5 -> 0-100), for the obligations whose
  implementation_domain includes CC1.

This turns the qualitative claim ("Mexico reports perfect legislation capacity
while its main instrument dates to 1985") into a measured divergence.

Scope: CC1 only. NormTrace's anchoring score measures one specific construct --
whether a domestic legal instrument exists for an obligation. SPAR's CC1
("Legislation, policy & financing") measures that same construct, so the two
are directly comparable. SPAR's other capacities (surveillance, points of
entry, emergency management, IHR coordination, etc.) measure operational
capacity -- staffed systems, infrastructure, running programmes -- which is a
different construct NormTrace does not measure at all. An obligation can be
tagged to CC2/CC4/CC5/PoE in the corpus (implementation_domain) and still have
a legal-anchoring score, but pairing that score against SPAR's operational
score for the same capacity would compare two different things and imply
NormTrace assesses operational readiness, which it does not. A prior version
of this script computed that comparison for five capacities; it was removed
(see network_methodology_rationale.md SS3.4) because only the CC1 pairing is
construct-valid.

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
            "Comparison is limited to CC1 (Legislation, policy & financing), the only "
            "SPAR capacity that measures the same construct as NormTrace's legal-anchoring "
            "score (does a domestic legal instrument exist for the obligation). SPAR's "
            "other capacities measure operational capacity, which NormTrace does not "
            "assess; an earlier version of this bridge compared five capacities and has "
            "been narrowed to CC1 for construct validity."
        ),
        "thesis": ("SPAR CC1 self-report measures reported legislative/policy capacity; "
                   "NormTrace measures domestic legal anchoring for the same obligations. "
                   "A large positive divergence flags capacity reported without a "
                   "sustainable legal-institutional base."),
        "headline_cc1": headline,
        "normtrace_corpus_anchoring_pct": normtrace_corpus_anchoring_pct,
        "cc1_spar_series": cc1_series,
        "caveats": ["This comparison covers CC1 only; NormTrace does not measure the "
                    "operational capacities SPAR's other core capacities assess "
                    "(surveillance systems, points-of-entry infrastructure, emergency "
                    "management, etc.), so no divergence claim is made for them.",
                    "NormTrace anchoring is preliminary_ai_assisted and unvalidated by a "
                    "domestic public-health-law expert.",
                    "SPAR cap1 methodology changed across editions; interpret the "
                    "trajectory, not single-year points."],
    }

    for folder in (OUT_EXP, OUT_WEB):
        with open(os.path.join(folder, "spar_normtrace_divergence.json"), "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

    print("=== SPAR CC1 (self-report) vs NormTrace (legal anchoring) — Mexico ===\n")
    print(f"HEADLINE (CC1 Legislation): Mexico self-reported "
          f"{headline['spar_self_report_mean']}% (mean) / "
          f"{headline['spar_self_report_latest']}% (latest) legislation capacity, "
          f"while NormTrace legal anchoring = {headline['normtrace_legal_anchoring_pct']}% "
          f"(n={headline['n_obligations']} obligations) "
          f"-> divergence {headline['divergence_mean']} pts (mean).")
    print(f"\nCorpus-wide NormTrace anchoring (all 45 obligations, standalone stat, "
          f"not compared to SPAR): {normtrace_corpus_anchoring_pct}%.")


if __name__ == "__main__":
    main()
