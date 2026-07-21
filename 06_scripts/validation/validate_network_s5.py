#!/usr/bin/env python3
"""Validate S5_network_metrics.json (and its companion CSVs) against the
values independently verified from S3a_provision_linked_records_78.csv on
2026-07-21 (see Adenda to the v0.2 data-package task). Recomputes every
figure directly from S3a and S1 -- nothing here is copied from the task
prose. A mismatch is a real discrepancy to report to the author, not
something this script silently corrects.

Exit code 0 = all checks pass. Exit code 1 = at least one check failed;
the failure list is printed either way.
"""
import csv
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

PKG = Path(__file__).resolve().parents[2] / "04_outputs" / "exports" / "data_package_v0_2"

ALIASES = {
    "Ley General de Salud": "LGS",
    "Reglamento de la Ley General de Salud en Materia de Sanidad Internacional": "RLGS-SI",
    "Reglamento Interior de la Secretaría de Salud": "RIS",
    "NOM-017-SSA2-2012, Para la vigilancia epidemiológica": "NOM-017",
    "Constitución Política de los Estados Unidos Mexicanos": "CPEUM",
    "Ley Aduanera": "Ley Aduanera",
    "Ley Orgánica de la Administración Pública Federal": "LOAPF",
    "Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados": "LGPDPPSO",
    "Reglamento de la Ley General de Salud en Materia de Investigación para la Salud": "RLGS-Inv",
}

EXPECTED_DEGREE = {
    "LGS": 21, "RLGS-SI": 19, "RIS": 11, "NOM-017": 6, "CPEUM": 5,
    "Ley Aduanera": 3, "LOAPF": 1, "LGPDPPSO": 1, "RLGS-Inv": 1,
}


def load_csv(name):
    with open(PKG / name, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def check(failures, label, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {label}" + (f" -- {detail}" if detail and not condition else ""))
    if not condition:
        failures.append((label, detail))


def main():
    failures = []

    s3a = load_csv("S3a_provision_linked_records_78.csv")
    s1 = load_csv("S1_ihr_obligations_45.csv")
    with open(PKG / "S5_network_metrics.json", encoding="utf-8") as f:
        metrics = json.load(f)

    # --- Independent recomputation directly from S3a (not from S5's own JSON) ---
    inst_obl = defaultdict(set)
    obl_inst = defaultdict(set)
    pairs = set()
    for r in s3a:
        inst = ALIASES.get(r["domestic_norm"], r["domestic_norm"])
        obl = r["obligation_id"]
        inst_obl[inst].add(obl)
        obl_inst[obl].add(inst)
        pairs.add((inst, obl))

    n_inst, n_obl, n_edges = len(inst_obl), len(obl_inst), len(pairs)
    density = round(n_edges / (n_inst * n_obl), 3) if n_inst and n_obl else 0

    check(failures, "9 instruments with a registered anchoring edge", n_inst == 9, f"got {n_inst}")
    check(failures, "43 obligations with a registered anchoring edge", n_obl == 43, f"got {n_obl}")
    check(failures, "68 unique instrument-obligation pairs", n_edges == 68, f"got {n_edges}")
    check(failures, "density 0.176", density == 0.176, f"got {density}")

    for inst, expected in EXPECTED_DEGREE.items():
        got = len(inst_obl.get(inst, set()))
        check(failures, f"{inst} degree = {expected}", got == expected, f"got {got}")

    # --- Distinct provisions ---
    provisions = Counter((r["domestic_norm"], r["domestic_article"]) for r in s3a)
    check(failures, "37 distinct provisions across 78 records", len(provisions) == 37,
          f"got {len(provisions)}")
    single_mapping = sum(1 for c in provisions.values() if c == 1)
    check(failures, "17 provisions with exactly 1 mapping", single_mapping == 17,
          f"got {single_mapping}")

    # --- RIS Art. 35 frac. XIX anchors 7 obligations ---
    ris_35_obls = {r["obligation_id"] for r in s3a
                   if ALIASES.get(r["domestic_norm"]) == "RIS"
                   and "35" in r["domestic_article"] and "XIX" in r["domestic_article"]}
    expected_ris35 = {"IHR-OBL-001", "IHR-OBL-003", "IHR-OBL-005", "IHR-OBL-007",
                      "IHR-OBL-008", "IHR-OBL-009", "IHR-OBL-041"}
    check(failures, "RIS Art. 35 frac. XIX anchors exactly 7 obligations",
          ris_35_obls == expected_ris35, f"got {sorted(ris_35_obls)}")

    # --- LGS ∪ RLGS-SI reach ---
    union = inst_obl.get("LGS", set()) | inst_obl.get("RLGS-SI", set())
    check(failures, "LGS ∪ RLGS-SI reach = 34 of 43 obligations",
          len(union) == 34, f"got {len(union)}")

    # --- Max substantive formal_source_level per obligation ---
    max_level = defaultdict(int)
    for r in s3a:
        if r["correspondence_role"] == "substantive":
            obl = r["obligation_id"]
            max_level[obl] = max(max_level[obl], int(r["formal_source_level"]))
    level_counts = Counter(max_level.values())
    check(failures, "41 substantively-anchored obligations", len(max_level) == 41,
          f"got {len(max_level)}")
    check(failures, "24 obligations peak at level 2", level_counts.get(2, 0) == 24,
          f"got {level_counts.get(2, 0)}")
    check(failures, "17 obligations peak at level 1", level_counts.get(1, 0) == 17,
          f"got {level_counts.get(1, 0)}")
    check(failures, "0 obligations peak at level 3", level_counts.get(3, 0) == 0,
          f"got {level_counts.get(3, 0)}")

    # --- CC1 subset (implementation_domain contains "CC1", from S1) ---
    cc1_ids = {r["obligation_id"] for r in s1 if "CC1" in r["implementation_domain"]}
    check(failures, "20 CC1 obligations", len(cc1_ids) == 20, f"got {len(cc1_ids)}")

    cc1_substantive = cc1_ids & set(max_level.keys())
    check(failures, "16 CC1 obligations with a substantive anchor",
          len(cc1_substantive) == 16, f"got {len(cc1_substantive)}")

    cc1_law_or_above = {o for o in cc1_substantive if max_level[o] >= 2}
    check(failures, "12 CC1 obligations at law-level (>=2) or above",
          len(cc1_law_or_above) == 12, f"got {len(cc1_law_or_above)}")

    cc1_complete = {r["obligation_id"] for r in s3a
                    if r["obligation_id"] in cc1_ids and r["mapping_coverage"] == "complete_component"}
    check(failures, "3 CC1 obligations with a complete_component record",
          len(cc1_complete) == 3, f"got {len(cc1_complete)}")

    cc1_no_corr = cc1_ids - set(obl_inst.keys())
    check(failures, "2 CC1 obligations with no correspondence at all",
          len(cc1_no_corr) == 2, f"got {sorted(cc1_no_corr)}")

    # --- S5_network_metrics.json is consistent with the independent recomputation ---
    check(failures, "S5 network.n_instruments matches recomputation",
          metrics["network"]["n_instruments"] == n_inst)
    check(failures, "S5 network.n_obligations matches recomputation",
          metrics["network"]["n_obligations"] == n_obl)
    check(failures, "S5 network.n_edges matches recomputation",
          metrics["network"]["n_edges"] == n_edges)
    check(failures, "S5 network.density matches recomputation",
          metrics["network"]["density"] == density)
    s5_degrees = {row["instrument"]: row["obligations_anchored"]
                  for row in metrics["instrument_degree_ranked"]}
    check(failures, "S5 instrument_degree_ranked matches recomputation",
          s5_degrees == {k: len(v) for k, v in inst_obl.items()}, f"got {s5_degrees}")

    # --- Companion CSVs exist and are internally consistent ---
    registry = load_csv("S5_node_registry.csv")
    edges = load_csv("S5_network_edges.csv")
    check(failures, "S5_node_registry.csv has n_instruments + n_obligations rows",
          len(registry) == n_inst + n_obl, f"got {len(registry)}")
    check(failures, "S5_network_edges.csv has n_edges rows", len(edges) == n_edges,
          f"got {len(edges)}")

    print()
    if failures:
        print(f"{len(failures)} check(s) FAILED -- report to author, do not silently adjust:")
        for label, detail in failures:
            print(f"  - {label}: {detail}")
        sys.exit(1)
    print("All S5 network-layer checks PASS.")
    sys.exit(0)


if __name__ == "__main__":
    main()
