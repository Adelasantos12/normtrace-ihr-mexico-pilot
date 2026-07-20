#!/usr/bin/env python3
"""Validate 04_outputs/exports/data_package_v0_2/ against the manuscript's
stated counts. Recomputes every figure from the raw CSVs -- nothing here is
copied from the manuscript or from prose; a mismatch is a real discrepancy
to report to the author, not something this script silently corrects.

Exit code 0 = all checks pass. Exit code 1 = at least one check failed;
the failure list is printed either way.
"""
import csv
import sys
import urllib.parse
from collections import Counter, defaultdict
from pathlib import Path

PKG = Path(__file__).resolve().parents[2] / "04_outputs" / "exports" / "data_package_v0_2"

OFFICIAL_DOMAINS = {"www.diputados.gob.mx", "www.dof.gob.mx"}

FIT_COLUMNS = [
    "actor_fit", "procedure_fit", "coordination_fit", "enforcement_fit",
    "rights_safeguard_fit", "vertical_mandate_specification", "gap_type",
]


def load(name):
    with open(PKG / name, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def check(failures, label, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {label}" + (f" -- {detail}" if detail and not condition else ""))
    if not condition:
        failures.append((label, detail))


def main():
    failures = []

    s1 = load("S1_ihr_obligations_45.csv")
    s2 = load("S2_mexican_corpus_18.csv")
    s3 = load("S3_mappings_80.csv")
    s3a = load("S3a_provision_linked_records_78.csv")
    s4 = load("S4_consistency_audit.csv")

    # --- Basic row counts ---
    check(failures, "S1 has 45 obligations", len(s1) == 45, f"got {len(s1)}")
    check(failures, "S2 has 18 corpus instruments", len(s2) == 18, f"got {len(s2)}")
    check(failures, "S3 has 80 mapping records", len(s3) == 80, f"got {len(s3)}")
    check(failures, "S3a has 78 provision-linked records", len(s3a) == 78, f"got {len(s3a)}")
    check(failures, "S4 has 7 audit rules", len(s4) == 7, f"got {len(s4)}")

    # --- S3a is S3 minus exactly the 2 sentinel rows ---
    s3_ids = {r["mapping_id"] for r in s3}
    s3a_ids = {r["mapping_id"] for r in s3a}
    sentinels = s3_ids - s3a_ids
    check(failures, "S3a subset of S3", s3a_ids.issubset(s3_ids))
    check(failures, "Exactly 2 sentinel rows (S3 minus S3a)", len(sentinels) == 2, f"got {sentinels}")

    # --- S3 vs S3a agree on every shared analytical column ---
    s3_by_id = {r["mapping_id"]: r for r in s3}
    mismatches = []
    for r in s3a:
        s3r = s3_by_id.get(r["mapping_id"])
        if not s3r:
            mismatches.append((r["mapping_id"], "missing_in_s3"))
            continue
        for col in FIT_COLUMNS:
            if s3r.get(col) != r.get(col):
                mismatches.append((r["mapping_id"], col, s3r.get(col), r.get(col)))
    check(failures, "S3/S3a agree on all shared fit + gap_type columns", len(mismatches) == 0,
          f"{len(mismatches)} mismatches: {mismatches[:5]}")

    # --- correspondence_role: 70 substantive, 8 contextual_or_enabling ---
    role_counts = Counter(r["correspondence_role"] for r in s3a)
    check(failures, "correspondence_role = 70 substantive / 8 contextual_or_enabling",
          role_counts.get("substantive") == 70 and role_counts.get("contextual_or_enabling") == 8,
          f"got {dict(role_counts)}")

    # --- formal_source_level: 44 (38 regulation + 6 NOM) / 29 / 5 ---
    level_counts = Counter(r["formal_source_level"] for r in s3a)
    check(failures, "formal_source_level = 44/29/5",
          level_counts.get("1") == 44 and level_counts.get("2") == 29 and level_counts.get("3") == 5,
          f"got {dict(level_counts)}")
    lvl1_source_types = Counter(r["source_type"] for r in s3a if r["formal_source_level"] == "1")
    check(failures, "Level 1 = 38 regulation + 6 NOM",
          lvl1_source_types.get("regulation") == 38 and lvl1_source_types.get("NOM") == 6,
          f"got {dict(lvl1_source_types)}")

    # --- mapping_coverage: 7 complete / 63 partial / 8 contextual ---
    coverage_counts = Counter(r["mapping_coverage"] for r in s3a)
    check(failures, "mapping_coverage = 7 complete / 63 partial / 8 contextual",
          coverage_counts.get("complete_component") == 7
          and coverage_counts.get("partial_component") == 63
          and coverage_counts.get("contextual_only") == 8,
          f"got {dict(coverage_counts)}")

    # --- per-obligation breakdown: 41 substantive / 2 contextual-only / 2 none ---
    all_ob_ids = {r["obligation_id"] for r in s1}
    roles_by_ob = defaultdict(set)
    for r in s3a:
        roles_by_ob[r["obligation_id"]].add(r["correspondence_role"])
    has_substantive = {ob for ob, roles in roles_by_ob.items() if "substantive" in roles}
    only_contextual = {ob for ob, roles in roles_by_ob.items() if roles == {"contextual_or_enabling"}}
    no_record = all_ob_ids - set(roles_by_ob.keys())
    check(failures, "Per-obligation split = 41 substantive / 2 contextual-only / 2 none",
          len(has_substantive) == 41 and len(only_contextual) == 2 and len(no_record) == 2,
          f"got {len(has_substantive)}/{len(only_contextual)}/{len(no_record)}")

    # --- medians: 1 (70 substantive anchors), 2 records/obligation, 1 minimum ---
    substantive_levels = sorted(int(r["formal_source_level"]) for r in s3a if r["correspondence_role"] == "substantive")
    median_level = substantive_levels[len(substantive_levels) // 2] if len(substantive_levels) % 2 else \
        (substantive_levels[len(substantive_levels) // 2 - 1] + substantive_levels[len(substantive_levels) // 2]) / 2
    check(failures, "Median formal_source_level across 70 substantive anchors = 1",
          median_level == 1, f"got {median_level}")

    per_ob_counts = sorted(len(v) for v in
                            defaultdict(list, {ob: [1] * sum(1 for r in s3a if r["obligation_id"] == ob)
                                                for ob in roles_by_ob}).values())
    median_count = per_ob_counts[len(per_ob_counts) // 2] if len(per_ob_counts) % 2 else \
        (per_ob_counts[len(per_ob_counts) // 2 - 1] + per_ob_counts[len(per_ob_counts) // 2]) / 2
    check(failures, "Median records per anchored obligation = 2, min = 1",
          median_count == 2 and min(per_ob_counts) == 1,
          f"median={median_count} min={min(per_ob_counts)}")

    # --- review_priority: S3 25/44/11 (80), S3a 23/44/11 (78) ---
    s3_priority = Counter(r["review_priority"] for r in s3)
    s3a_priority = Counter(r["review_priority"] for r in s3a)
    check(failures, "S3 review_priority = 25 high / 44 medium / 11 low",
          s3_priority.get("high") == 25 and s3_priority.get("medium") == 44 and s3_priority.get("low") == 11,
          f"got {dict(s3_priority)}")
    check(failures, "S3a review_priority = 23 high / 44 medium / 11 low",
          s3a_priority.get("high") == 23 and s3a_priority.get("medium") == 44 and s3a_priority.get("low") == 11,
          f"got {dict(s3a_priority)}")

    # --- review_status: S3 67/13, S3a 67/11 ---
    s3_status = Counter(r["review_status"] for r in s3)
    s3a_status = Counter(r["review_status"] for r in s3a)
    check(failures, "S3 review_status = 67 preliminary_ai_assisted / 13 requires_human_review",
          s3_status.get("preliminary_ai_assisted") == 67 and s3_status.get("requires_human_review") == 13,
          f"got {dict(s3_status)}")
    check(failures, "S3a review_status = 67 preliminary_ai_assisted / 11 requires_human_review",
          s3a_status.get("preliminary_ai_assisted") == 67 and s3a_status.get("requires_human_review") == 11,
          f"got {dict(s3a_status)}")

    # --- 13 reviewed = 11 (8 substantive + 3 contextual; 7 level1 + 4 level2) + 2 sentinels ---
    reviewed_s3a = [r for r in s3a if r["review_status"] == "requires_human_review"]
    reviewed_role = Counter(r["correspondence_role"] for r in reviewed_s3a)
    reviewed_level = Counter(r["formal_source_level"] for r in reviewed_s3a)
    check(failures, "11 S3a-side reviewed = 8 substantive + 3 contextual",
          reviewed_role.get("substantive") == 8 and reviewed_role.get("contextual_or_enabling") == 3,
          f"got {dict(reviewed_role)}")
    check(failures, "11 S3a-side reviewed = 7 level-1 + 4 level-2",
          reviewed_level.get("1") == 7 and reviewed_level.get("2") == 4,
          f"got {dict(reviewed_level)}")
    reviewed_s3_only = [r for r in s3 if r["review_status"] == "requires_human_review" and r["mapping_id"] in sentinels]
    check(failures, "2 sentinel rows are both requires_human_review",
          len(reviewed_s3_only) == 2, f"got {len(reviewed_s3_only)}")

    # --- reference verification: 75 confirmed + 3 confirmed_with_citation_correction ---
    verif = Counter(r["verification_outcome"] for r in s3a)
    check(failures, "verification_outcome = 75 confirmed + 3 confirmed_with_citation_correction",
          verif.get("confirmed") == 75 and verif.get("confirmed_with_citation_correction") == 3,
          f"got {dict(verif)}")

    # --- rights_safeguard_fit: 10 strong, 8 of which carry a rights-safeguard gap ---
    strong = [r for r in s3a if r["rights_safeguard_fit"] == "strong"]
    strong_with_gap = [r for r in strong if r["gap_type"] == "rights safeguard gap"]
    check(failures, "10 rights_safeguard_fit=strong, 8 with a rights-safeguard gap_type",
          len(strong) == 10 and len(strong_with_gap) == 8,
          f"got {len(strong)} strong, {len(strong_with_gap)} with gap")

    # --- S4 recomputed: diagnostic rule says 10/10 with note "8 of 10" ---
    diag_rows = [r for r in s4 if r["rule_type"] == "diagnostic"]
    check(failures, "S4 has exactly 1 diagnostic rule, applicable_n=10",
          len(diag_rows) == 1 and diag_rows[0]["applicable_n"] == "10",
          f"got {diag_rows}")
    rule_type_counts = Counter(r["rule_type"] for r in s4)
    check(failures, "S4 rule types = 2 by-definition, 3 integrity, 1 plausibility, 1 diagnostic",
          rule_type_counts.get("by-definition") == 2 and rule_type_counts.get("integrity") == 3
          and rule_type_counts.get("plausibility") == 1 and rule_type_counts.get("diagnostic") == 1,
          f"got {dict(rule_type_counts)}")
    for r in s4:
        n_ok = r["applicable_n"] == r["passed"] if r["failed"] == "0" else False
        check(failures, f"S4 rule '{r['rule'][:50]}...' passed == applicable_n, failed == 0",
              n_ok, f"applicable_n={r['applicable_n']} passed={r['passed']} failed={r['failed']}")

    # --- Ley Aduanera at level 2 ---
    aduanera = [r for r in s3a if "aduaner" in r["domestic_norm"].lower()]
    check(failures, "Ley Aduanera rows all at formal_source_level 2",
          len(aduanera) > 0 and all(r["formal_source_level"] == "2" for r in aduanera),
          f"got {[(r['mapping_id'], r['formal_source_level']) for r in aduanera]}")

    # --- official_source_url domains ---
    bad_domains = []
    for r in s3a:
        url = r.get("official_source_url", "").strip()
        domain = urllib.parse.urlparse(url).netloc
        if domain not in OFFICIAL_DOMAINS:
            bad_domains.append((r["mapping_id"], url))
    check(failures, f"All S3a official_source_url values resolve to {sorted(OFFICIAL_DOMAINS)}",
          len(bad_domains) == 0, f"{len(bad_domains)} bad: {bad_domains[:5]}")
    print("    NOTE: this checks URL *domain*, not live HTTP reachability -- "
          "both official domains returned 403 to automated fetches in this "
          "environment (consistent with bot-protection, not confirmation of breakage).")

    # --- S2 sanity: source_status derived correctly ---
    s2_status = Counter(r["source_status"] for r in s2)
    check(failures, "S2 source_status = 16 in_force + 2 superseded",
          s2_status.get("in_force") == 16 and s2_status.get("superseded") == 2,
          f"got {dict(s2_status)}")
    tbd_count = sum(1 for r in s2 for col in ("publication_date", "last_amendment_date") if r[col] == "TBD_REVIEW")
    check(failures, "S2 has 0 remaining TBD_REVIEW date fields (all 12 closed against primary source)",
          tbd_count == 0, f"got {tbd_count} remaining")

    print()
    if failures:
        print(f"=== {len(failures)} CHECK(S) FAILED ===")
        for label, detail in failures:
            print(f"  - {label}: {detail}")
        return 1
    print("=== ALL CHECKS PASSED ===")
    return 0


if __name__ == "__main__":
    sys.exit(main())
