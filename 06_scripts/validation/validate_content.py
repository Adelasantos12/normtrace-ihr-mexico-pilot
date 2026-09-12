#!/usr/bin/env python3
"""
NormTrace-IHR — content validation gate.

Exits non-zero (and prints every failure) if the repo's derived data and
narrative text have drifted apart. This is a guard, not a builder: it reads
files, it does not compute or write anything. Intended to run on every push
(see .github/workflows/validate.yml), after the build_tables scripts have
regenerated 04_outputs/ and 05_webapp/public/data/derived/.

Checks:
  1. Every source/target in network_edges.csv exists in node_registry.csv.
  2. Corpus row counts match the figures asserted in CODE_BRIEFING.md's
     "ground truth": 45 obligations, 110 provisions, 18 instruments,
     80 mapping rows.
  3. The "N federal[-level institutional actors]" figure quoted in each of
     the three paper mirrors matches count(government_level=='federal')
     in the actors CSV.
  4. No hard-coded `deg=NN` / `degree: NN` integer literal remains in
     05_webapp/src/pages/*.tsx.

Usage:  python3 06_scripts/validation/validate_content.py
"""
from __future__ import annotations
import csv
import glob
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

NETWORK_EDGES = os.path.join(ROOT, "04_outputs/figures/network_edges.csv")
NODE_REGISTRY = os.path.join(ROOT, "04_outputs/figures/node_registry.csv")
OBLIGATIONS = os.path.join(ROOT, "03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv")
PROVISIONS = os.path.join(ROOT, "03_tables/country_legal_mapping/mexico_legal_provisions.csv")
CORPUS_INDEX = os.path.join(ROOT, "03_tables/country_legal_mapping/mexico_normative_corpus_index.csv")
MAPPING = os.path.join(ROOT, "03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv")
ACTORS = os.path.join(ROOT, "03_tables/actors/mexico_health_governance_actors.csv")

PAPER_FILES = [
    os.path.join(ROOT, "00_project/normtrace_ihr_methodology_full.md"),
    os.path.join(ROOT, "05_webapp/public/data/markdown/normtrace_ihr_methodology_full.md"),
    os.path.join(ROOT, "05_webapp/public/data/markdown/normtrace_ihr_methodology_web.md"),
]

EXPECTED_COUNTS = {
    "IHR 2005 obligations": (OBLIGATIONS, ";", 45),
    "domestic legal provisions": (PROVISIONS, ",", 110),
    "domestic instruments in corpus": (CORPUS_INDEX, ",", 18),
    "obligation-to-provision mapping rows": (MAPPING, ",", 80),
}

WORD_NUMBERS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7,
    "eight": 8, "nine": 9, "ten": 10, "eleven": 11, "twelve": 12, "thirteen": 13,
    "fourteen": 14, "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18,
    "nineteen": 19, "twenty": 20,
}


def read_rows(path: str, delimiter: str) -> list[dict]:
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f, delimiter=delimiter))


def parse_federal_actor_claim(text: str) -> int | None:
    """Find the 'N federal[-level institutional actors]' figure in paper prose."""
    m = re.search(r"([A-Za-z]+)\s+federal-level institutional actors\s+were\s+identified", text)
    if m:
        word = m.group(1).lower()
        return WORD_NUMBERS.get(word)
    m = re.search(r"\(?\s*(\d+)\s+federal\b", text)
    if m:
        return int(m.group(1))
    return None


def main() -> int:
    failures: list[str] = []

    # 1. Edge referential integrity.
    if os.path.isfile(NETWORK_EDGES) and os.path.isfile(NODE_REGISTRY):
        node_ids = {r["node_id"] for r in read_rows(NODE_REGISTRY, ",")}
        for row in read_rows(NETWORK_EDGES, ","):
            for end in ("source", "target"):
                if row[end] not in node_ids:
                    failures.append(
                        f"network_edges.csv: {end}='{row[end]}' not found in node_registry.csv "
                        f"(row: {row['source']} -> {row['target']})"
                    )
    else:
        failures.append(
            "network_edges.csv / node_registry.csv missing — run "
            "06_scripts/build_tables/build_network.py first."
        )

    # 2. Corpus counts.
    for label, (path, delimiter, expected) in EXPECTED_COUNTS.items():
        if not os.path.isfile(path):
            failures.append(f"corpus count check: {path} not found.")
            continue
        actual = len(read_rows(path, delimiter))
        if actual != expected:
            failures.append(
                f"corpus count drift: {label} — expected {expected}, found {actual} rows in "
                f"{os.path.relpath(path, ROOT)}."
            )

    # 3. Federal actor count vs paper prose.
    if os.path.isfile(ACTORS):
        actor_rows = read_rows(ACTORS, ",")
        actual_federal = sum(1 for r in actor_rows if (r.get("government_level") or "").strip() == "federal")
        for path in PAPER_FILES:
            if not os.path.isfile(path):
                failures.append(f"paper reconciliation: {path} not found.")
                continue
            with open(path, encoding="utf-8") as f:
                text = f.read()
            claimed = parse_federal_actor_claim(text)
            if claimed is None:
                failures.append(
                    f"paper reconciliation: could not find a 'N federal actors' figure in "
                    f"{os.path.relpath(path, ROOT)}."
                )
            elif claimed != actual_federal:
                failures.append(
                    f"paper reconciliation: {os.path.relpath(path, ROOT)} claims {claimed} federal actors, "
                    f"actors CSV has {actual_federal} rows with government_level=='federal'."
                )
    else:
        failures.append(f"actors CSV not found: {ACTORS}")

    # 4. No hard-coded degree literals in the webapp pages.
    degree_pattern = re.compile(r"\bdeg(?:ree)?\s*[:=]\s*\d+")
    for path in sorted(glob.glob(os.path.join(ROOT, "05_webapp/src/pages/*.tsx"))):
        with open(path, encoding="utf-8") as f:
            for lineno, line in enumerate(f, start=1):
                if degree_pattern.search(line):
                    failures.append(
                        f"hard-coded degree literal: {os.path.relpath(path, ROOT)}:{lineno}: {line.strip()}"
                    )

    if failures:
        print(f"FAIL — {len(failures)} content validation issue(s):\n")
        for msg in failures:
            print(f"  - {msg}")
        return 1

    print("PASS — network edges resolve, corpus counts match, paper actor count reconciled, "
          "no hard-coded degree literals.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
