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

Inputs:
  02_data/raw/spar_americas_clean.csv           (SPAR panel, Americas)
  03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv
  03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv  (';'-delimited)

Output:
  04_outputs/exports/spar_normtrace_divergence.json
  05_webapp/public/data/derived/spar_normtrace_divergence.csv
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

# SPAR 15-capacity labels (WHO SPAR 2018+ tool)
SPAR_CAPS = {
    "spar_cap1": "C1 Legislation, policy & financing",
    "spar_cap2": "C2 IHR coordination & NFP",
    "spar_cap6": "C6 Surveillance",
    "spar_cap8": "C8 Health emergency management",
    "spar_cap11": "C11 Points of entry",
}
# NormTrace CC tag -> SPAR column (only the clean, defensible crosswalks)
CC_TO_SPAR = {
    "CC1": "spar_cap1",
    "CC2": "spar_cap2",
    "CC5": "spar_cap6",   # surveillance
    "CC4": "spar_cap8",   # response / emergency mgmt
    "PoE": "spar_cap11",
}


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
    """Mexico SPAR rows -> {year: {cap: value}} and latest/mean per cap."""
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

    # SPAR latest + mean per capacity (over available years)
    spar_series = {}
    for cap in sorted(set(CC_TO_SPAR.values()) | {"spar_all"}):
        vals = [(int(r["year"]), to_float(r.get(cap))) for r in spar_rows]
        vals = [(y, v) for y, v in vals if v is not None]
        if vals:
            spar_series[cap] = {"latest_year": vals[-1][0], "latest": vals[-1][1],
                                "mean": round(statistics.mean(v for _, v in vals), 1),
                                "max": max(v for _, v in vals),
                                "trajectory": [{"year": y, "value": v} for y, v in vals]}

    # NormTrace anchoring % per CC domain (mean over obligations tagged with that CC)
    cc_anchoring = {}
    for cc in CC_TO_SPAR:
        oids = [oid for oid, tags in domains.items() if cc in tags]
        scores = [anchoring.get(oid, 0) for oid in oids]
        if scores:
            cc_anchoring[cc] = {"n_obligations": len(scores),
                                "mean_anchoring_0_5": round(statistics.mean(scores), 2),
                                "mean_anchoring_pct": round(statistics.mean(scores) / 5 * 100, 1)}

    # Divergence table
    table = []
    for cc, cap in CC_TO_SPAR.items():
        if cc in cc_anchoring and cap in spar_series:
            spar_latest = spar_series[cap]["latest"]
            spar_mean = spar_series[cap]["mean"]
            nt = cc_anchoring[cc]["mean_anchoring_pct"]
            table.append({
                "capacity": SPAR_CAPS[cap], "cc_tag": cc,
                "spar_self_report_latest": spar_latest,
                "spar_self_report_mean": spar_mean,
                "normtrace_legal_anchoring_pct": nt,
                "divergence_latest": round(spar_latest - nt, 1),
                "divergence_mean": round(spar_mean - nt, 1),
                "n_obligations": cc_anchoring[cc]["n_obligations"],
            })
    table.sort(key=lambda x: -x["divergence_mean"])

    overall_nt = round(statistics.mean(anchoring.values()) / 5 * 100, 1)
    headline = None
    for row in table:
        if row["cc_tag"] == "CC1":
            headline = row
    result = {
        "generated_by": "06_scripts/build_tables/spar_normtrace_bridge.py",
        "country": "Mexico",
        "thesis": ("SPAR self-report measures reported capacity; NormTrace measures "
                   "domestic legal anchoring. A large positive divergence flags capacity "
                   "reported without a sustainable legal-institutional base."),
        "headline_cc1": headline,
        "overall": {"spar_all_latest": spar_series.get("spar_all", {}).get("latest"),
                    "spar_all_mean": spar_series.get("spar_all", {}).get("mean"),
                    "normtrace_overall_anchoring_pct": overall_nt},
        "divergence_table": table,
        "spar_series": spar_series,
        "caveats": ["SPAR-to-CC crosswalk is a defensible approximation, not an official "
                    "WHO mapping; only high-confidence pairings are reported.",
                    "NormTrace anchoring is preliminary_ai_assisted and unvalidated by a "
                    "domestic public-health-law expert.",
                    "SPAR cap1 methodology changed across editions; interpret the "
                    "trajectory, not single-year points."],
    }

    with open(os.path.join(OUT_EXP, "spar_normtrace_divergence.json"), "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    for folder in (OUT_EXP, OUT_WEB):
        with open(os.path.join(folder, "spar_normtrace_divergence.json"), "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
    with open(os.path.join(OUT_WEB, "spar_normtrace_divergence.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(table[0].keys()))
        w.writeheader(); w.writerows(table)

    print("=== SPAR (self-report) vs NormTrace (legal anchoring) — Mexico ===\n")
    print(f"{'Capacity':<38}{'SPAR mean':>10}{'NT anchor%':>12}{'Diverg':>9}")
    for row in table:
        print(f"{row['capacity']:<38}{row['spar_self_report_mean']:>10}"
              f"{row['normtrace_legal_anchoring_pct']:>12}{row['divergence_mean']:>9}")
    if headline:
        print(f"\nHEADLINE (CC1 Legislation): Mexico self-reported "
              f"{headline['spar_self_report_mean']}% (mean) / "
              f"{headline['spar_self_report_latest']}% (latest) legislation capacity, "
              f"while NormTrace legal anchoring = {headline['normtrace_legal_anchoring_pct']}% "
              f"-> divergence {headline['divergence_mean']} pts (mean).")
    print(f"\nOverall: SPAR_all mean {result['overall']['spar_all_mean']}% vs "
          f"NormTrace overall anchoring {overall_nt}%.")


if __name__ == "__main__":
    main()
