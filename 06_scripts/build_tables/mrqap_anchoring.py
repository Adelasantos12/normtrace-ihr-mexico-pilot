#!/usr/bin/env python3
"""
NormTrace-IHR — MRQAP-style test of the "lower-rank / pre-2005 instruments
anchor obligations more weakly" hypothesis (the RLGS-SI 1985 claim).

CODE_BRIEFING.md Phase 1-R originally called for an R script using
migraph/manynet (net_regression(anchoring_level ~ tier + pre_2005_dummy,
..., times=1000)). That could not be built in this environment: outbound
network access here is restricted to an allowlist (npm/pip/GitHub/etc.)
and every CRAN mirror we tried (cran.r-project.org, cloud.r-project.org,
packagemanager.posit.co, r-universe.dev) returns 403 from the proxy, so
`migraph`/`manynet` cannot be installed or run. This script implements
the same design in Python instead — see network_methodology_rationale.md
§"Phase 1-R" for the substitution note.

Model: anchoring_level ~ tier_ordinal (+ pre_2005_dummy), one observation
per obligation-to-provision mapping row (same unit of analysis as the
paper's Table 2; n=80, minus rows with no identified instrument).

Why a permutation test, not plain OLS p-values: multiple mapping rows
share the same instrument, so their tier/pre_2005 covariates are not
independent draws — an instrument that anchors many obligations
contributes many correlated rows. Plain OLS standard errors would
understate this. Instead we permute the covariates across instruments
(not across rows): each of the 1000 draws reassigns the observed
tier/pre_2005 values to a random relabeling of the instruments, keeping
which instrument anchors which obligation fixed, then refits OLS. This
is the same logic as nodal-attribute QAP/MRQAP (Dekker et al. 2007):
the null distribution reflects "what coefficient would we see if
instrument identity were unrelated to its tier/pre-2005 status," which
is exactly the network-dependency structure a network permutation test
is meant to control for.

Inputs:
  03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv
  03_tables/country_legal_mapping/mexico_normative_corpus_index.csv

Output:
  04_outputs/figures/mrqap_anchoring.json
  05_webapp/public/data/derived/mrqap_anchoring.json

Usage:  python3 06_scripts/build_tables/mrqap_anchoring.py
"""
from __future__ import annotations
import csv
import json
import os
import random

import numpy as np
import statsmodels.api as sm

random.seed(42)
np.random.seed(42)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MAP = os.path.join(ROOT, "03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv")
CORPUS_INDEX = os.path.join(ROOT, "03_tables/country_legal_mapping/mexico_normative_corpus_index.csv")
OUT_FIG = os.path.join(ROOT, "04_outputs/figures")
OUT_WEB = os.path.join(ROOT, "05_webapp/public/data/derived")
os.makedirs(OUT_FIG, exist_ok=True)
os.makedirs(OUT_WEB, exist_ok=True)

N_PERMUTATIONS = 1000

# Same alias table as build_network.py (kept in sync manually; both scripts
# read the same mapping.csv "domestic_norm" values and must agree on the
# short codes). Matches on the full instrument name, not a name prefix —
# see build_network.py's alias() fix (2026-07-03).
INSTRUMENT_ALIASES = {
    "Ley General de Salud": "LGS",
    "Reglamento de la Ley General de Salud en Materia de Sanidad Internacional": "RLGS-SI",
    "Reglamento Interior de la Secretaría de Salud": "RI-SS-2025",
    "NOM-017-SSA2-2012, Para la vigilancia epidemiológica": "NOM-017",
    "Constitución Política de los Estados Unidos Mexicanos": "CPEUM",
    "Ley Aduanera": "Ley Aduanera",
    "Ley Orgánica de la Administración Pública Federal": "LOAPF",
    "Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados": "LGPDPPSO",
    "Reglamento de la Ley General de Salud en Materia de Investigación para la Salud": "RLGS-Inv",
}


def read_csv(path: str, delimiter: str = ",") -> list[dict]:
    with open(path, newline="", encoding="utf-8") as f:
        return [{k.strip(): (v.strip() if isinstance(v, str) else v) for k, v in row.items()}
                 for row in csv.DictReader(f, delimiter=delimiter)]


def alias(norm: str) -> str:
    norm = (norm or "").strip()
    return INSTRUMENT_ALIASES.get(norm, norm or "UNSPECIFIED")


def instrument_attributes() -> dict:
    """short_code -> {tier_ordinal, tier_label, pre_2005: bool|None, publication_date}."""
    idx_by_title = {r["norm_title"].strip(): r for r in read_csv(CORPUS_INDEX)}
    attrs = {}
    for full_name, short in INSTRUMENT_ALIASES.items():
        row = idx_by_title.get(full_name)
        if not row:
            continue
        tier_label = row["normative_hierarchy"]
        tier_ordinal = int(tier_label.split("_")[0])
        pub_date = row["publication_date"]
        pre_2005 = None
        if pub_date and pub_date != "TBD_REVIEW":
            pre_2005 = pub_date < "2005-01-01"
        attrs[short] = {
            "tier_ordinal": tier_ordinal, "tier_label": tier_label,
            "pre_2005": pre_2005, "publication_date": pub_date,
        }
    return attrs


def permutation_test(rows: list[dict], instruments: list[str], covariate: str, n_perm: int = N_PERMUTATIONS):
    """Node(instrument)-label permutation MRQAP-style test for one covariate.

    rows: [{"instrument": short_code, "anchoring_level": int}, ...] (single-covariate model)
    instruments: the distinct instruments present in `rows` (order fixed; permuted as a block)
    covariate: dict instrument -> value, already restricted to `instruments`
    """
    y = np.array([r["anchoring_level"] for r in rows], dtype=float)
    inst_of_row = [r["instrument"] for r in rows]

    def fit_coef(values_by_instrument: dict) -> float:
        x = np.array([values_by_instrument[i] for i in inst_of_row], dtype=float)
        X = sm.add_constant(x)
        model = sm.OLS(y, X).fit()
        return model.params[1]

    observed_values = {i: covariate[i] for i in instruments}
    observed_coef = fit_coef(observed_values)

    perm_coefs = []
    values_list = [covariate[i] for i in instruments]
    for _ in range(n_perm):
        shuffled = values_list.copy()
        random.shuffle(shuffled)
        perm_map = dict(zip(instruments, shuffled))
        perm_coefs.append(fit_coef(perm_map))
    perm_coefs = np.array(perm_coefs)
    p_two_sided = float(np.mean(np.abs(perm_coefs) >= abs(observed_coef)))
    return {
        "observed_coefficient": round(float(observed_coef), 4),
        "permutation_p_two_sided": round(p_two_sided, 4),
        "n_permutations": n_perm,
        "null_mean": round(float(perm_coefs.mean()), 4),
        "null_sd": round(float(perm_coefs.std()), 4),
    }


def main():
    mapping = read_csv(MAP)
    attrs = instrument_attributes()

    rows = []
    for r in mapping:
        inst = alias(r.get("domestic_norm"))
        obl = r.get("obligation_id", "")
        if not obl or inst == "UNSPECIFIED" or inst not in attrs:
            continue
        try:
            level = int(r.get("anchoring_level") or 0)
        except ValueError:
            continue
        rows.append({"instrument": inst, "obligation_id": obl, "anchoring_level": level})

    n_total_rows = len(rows)
    instruments_all = sorted({r["instrument"] for r in rows})

    # --- Model A: anchoring_level ~ tier_ordinal (all instruments have a tier) ---
    tier_cov = {i: attrs[i]["tier_ordinal"] for i in instruments_all}
    model_a = permutation_test(rows, instruments_all, tier_cov)
    model_a["n_obs"] = n_total_rows
    model_a["n_instruments"] = len(instruments_all)
    model_a["covariate"] = "tier_ordinal (1=constitution .. 8=lowest rank; higher = lower normative rank)"

    # --- Model B: anchoring_level ~ pre_2005_dummy (only instruments with a verified date) ---
    dated_instruments = sorted([i for i in instruments_all if attrs[i]["pre_2005"] is not None])
    rows_dated = [r for r in rows if r["instrument"] in dated_instruments]
    excluded = sorted(set(instruments_all) - set(dated_instruments))
    if len(dated_instruments) >= 2:
        pre2005_cov = {i: int(attrs[i]["pre_2005"]) for i in dated_instruments}
        model_b = permutation_test(rows_dated, dated_instruments, pre2005_cov)
        model_b["n_obs"] = len(rows_dated)
        model_b["n_instruments"] = len(dated_instruments)
        model_b["covariate"] = "pre_2005_dummy (1 = instrument published before 2005-01-01)"
        model_b["excluded_instruments_no_verified_date"] = excluded
    else:
        model_b = {
            "skipped": True,
            "reason": f"Only {len(dated_instruments)} instrument(s) have a verified publication_date "
                      f"(not 'TBD_REVIEW'); need at least 2 to fit a model.",
            "excluded_instruments_no_verified_date": excluded,
        }

    result = {
        "generated_by": "06_scripts/build_tables/mrqap_anchoring.py",
        "method_note": (
            "CODE_BRIEFING.md Phase 1-R specified an R/migraph net_regression() MRQAP. "
            "migraph/manynet could not be installed in this environment (CRAN blocked by "
            "network policy); this is a Python re-implementation of the same test design "
            "(node/instrument-label permutation, 1000 draws), not a migraph port. "
            "See network_methodology_rationale.md."
        ),
        "hypothesis": "Lower-rank (higher tier_ordinal) or pre-2005 instruments anchor obligations more weakly.",
        "unit_of_analysis": "one row per obligation-to-provision mapping row with an identified instrument",
        "instrument_attributes": attrs,
        "model_tier": model_a,
        "model_pre_2005": model_b,
    }

    for folder in (OUT_FIG, OUT_WEB):
        with open(os.path.join(folder, "mrqap_anchoring.json"), "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

    print("=== MRQAP-style test (Python re-implementation; see method_note) ===\n")
    print(f"n obs = {n_total_rows}, n instruments = {len(instruments_all)}\n")
    print("Model: anchoring_level ~ tier_ordinal")
    print(f"  coefficient = {model_a['observed_coefficient']}  "
          f"permutation p (two-sided, {model_a['n_permutations']} draws) = {model_a['permutation_p_two_sided']}")
    if model_b.get("skipped"):
        print(f"\nModel: anchoring_level ~ pre_2005_dummy — SKIPPED: {model_b['reason']}")
    else:
        print("\nModel: anchoring_level ~ pre_2005_dummy "
              f"(n={model_b['n_obs']} rows, {model_b['n_instruments']} instruments with a verified date; "
              f"excluded for missing date: {model_b['excluded_instruments_no_verified_date']})")
        print(f"  coefficient = {model_b['observed_coefficient']}  "
              f"permutation p (two-sided, {model_b['n_permutations']} draws) = {model_b['permutation_p_two_sided']}")
    print(f"\nWrote mrqap_anchoring.json to 04_outputs/figures/ and 05_webapp/public/data/derived/")


if __name__ == "__main__":
    main()
