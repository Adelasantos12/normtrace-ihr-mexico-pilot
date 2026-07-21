# Data Dictionary — NormTrace-IHR Mexico Pilot

**Version:** 0.2.0-pilot
**Date:** 2026-07-20
**Status:** Aligned to the manuscript's six authoritative tables (`04_outputs/exports/data_package_v0_2/`)

---

## Overview

This dictionary describes the five tables that make up the v0.2 supplementary
data package, in the manuscript's own vocabulary. It supersedes the v0.1.0
draft, which described placeholder datasets that were never built in that
form. See `CHANGELOG_v0_1_to_v0_2.md` in the data package directory for the
full field-rename and value-rename history.

All five files are comma-delimited UTF-8 CSV with a header row. JSON Schemas
(inferred from the actual data, not hand-authored) are in
`04_outputs/exports/data_package_v0_2/schemas/`.

---

## S1 — `S1_ihr_obligations_45.csv`

One row per IHR (2005) obligation. 45 rows.

| Field | Type | Description |
|---|---|---|
| `obligation_id` | string | Unique ID, `IHR-OBL-NNN` |
| `article` | string | IHR (2005) article/paragraph reference |
| `article_title` | string | Short title of the article |
| `obligation_text_short` | string | Paraphrased obligation text |
| `obligation_type` | string | Free-text classification (institutional designation, capacity development, notification, procedural, etc.) |
| `legal_force` | string | Binding / qualified-binding, with the specific qualifier quoted from the IHR text where one applies |
| `requires_domestic_legal_anchoring` | string | `Yes` / `Partial/Context-dependent` |
| `implementation_domain` | string | IHR Core Capacity / domain tag(s), semicolon-separated |

## S2 — `S2_mexican_corpus_18.csv`

One row per domestic legal instrument in the Mexican corpus. 18 rows.

| Field | Type | Description |
|---|---|---|
| `norm_id` | string | Unique ID, `MEX-NNN` |
| `norm_title` | string | Full instrument title |
| `short_title` | string | Abbreviated title / common name |
| `instrument_type` | string | constitution / general_law / federal_law / organic_law / regulation / internal_regulation / nom_official_mexican_standard / administrative_agreement / decree |
| `normative_hierarchy` | string | Tier in the Mexican normative hierarchy (constitution / general_law / federal_or_national_law / regulation / internal_regulation / nom_or_technical_standard / administrative_agreement) |
| `government_level` | string | federal / federal and subnational |
| `territorial_scope` | string | Free text describing territorial application |
| `issuing_authority` | string | Body/official that issued the instrument |
| `publication_date` | date | Original publication date. All 18 rows verified against the primary source documents in `01_sources/mexico/md/` (no `TBD_REVIEW` remaining as of this release) |
| `last_amendment_date` | date | Most recent reform/amendment date. Same verification status as `publication_date` |
| `official_source` | string | Provenance note (source file / converting authority) |
| `carried_mappings` | string | `yes` if the instrument anchors ≥1 obligation in S3/S3a, `screened_only` if it was reviewed but carries no mapping |
| `source_status` | string | **New in v0.2.** `in_force` / `superseded` — derived from `mexico_normative_corpus_index.csv`'s existing status field. 16 in_force, 2 superseded (`MEX-013`, `MEX-014`, both reform texts later folded into the current instruments) |
| `cutoff_note` | string | **New in v0.2.** Non-empty only for `MEX-004` (CPEUM): notes that the consolidated constitutional text reflects a 2026-04-23 reform, after the pilot's 31 Jan 2026 domestic-law cutoff — same note as recorded per-record in S3a for the 5 constitutional mapping records |
| `date_verification_note` | string | **New in v0.2.** Non-empty for the 12 rows whose dates were closed this release: cites the exact primary-source header text used as evidence, or flags a cross-table discrepancy (see `CHANGELOG_v0_1_to_v0_2.md`) |

**Deriving the pilot's working corpus of 16 active instruments:** filter on
`source_status == "in_force"`.

## S3 — `S3_mappings_80.csv`

One row per obligation→provision mapping attempt, **including** the 2
sentinel rows for obligations with no identified domestic provision at all,
and the legacy `correspondence_type` field. 80 rows. Not the citable
supplement — see S3a below.

| Field | Type | Description |
|---|---|---|
| `mapping_id` | string | Unique ID, `MEX_MAP_IHR2005_NNN_NNN` |
| `obligation_id` | string | FK → S1 |
| `domestic_norm` | string | Instrument title (blank for the 2 sentinel rows) |
| `domestic_article` | string | Article/section within the instrument |
| `anchor_status` | string | `identified` / `not_identified` |
| `formal_source_level` | integer (1/2/3) or blank | **Renamed in v0.2** from `source_rank` (was float-typed, `"1.0"` etc.); blank for the 2 sentinels. 1 = regulation/NOM, 2 = statute, 3 = constitution |
| `correspondence_type` | string | Legacy 8-value classification, kept for backward reference: `direct statutory`, `indirect statutory`, `regulatory`, `actor-only`, `constitutional basis`, `contextual support`, `coordination`, `no correspondence`. Two of these values were renamed from v0.1 — see CHANGELOG |
| `actor_fit` / `procedure_fit` / `coordination_fit` / `enforcement_fit` / `rights_safeguard_fit` | string | Per-dimension fit rating: `strong` / `partial` / `weak` / `none identified` (rights_safeguard_fit uses `not directly implicated` instead of `none identified`) |
| `vertical_mandate_specification` | string | `partial` / `not directly implicated` |
| `gap_type` | string | Structural gap classification (procedural gap, regulatory gap, partial regulatory gap, rights safeguard gap, coordination gap, full gap, none, or — sentinel-only — `no correspondence identified in corpus`) |
| `review_priority` | string | **Renamed in v0.2** from `model_confidence_label` (same high/medium/low values) |
| `review_status` | string | `preliminary_ai_assisted` / `requires_human_review` |

## S3a — `S3a_provision_linked_records_78.csv` (CANONICAL supplement)

One row per obligation→provision mapping **with an identified domestic
provision** (S3 minus its 2 sentinel rows), in full manuscript vocabulary,
plus a per-record reference-verification audit trail. 78 rows. **This is the
file to cite.**

| Field | Type | Description |
|---|---|---|
| `mapping_id`, `obligation_id`, `domestic_norm`, `domestic_article` | — | Same as S3 |
| `source_type` | string | `constitution` / `statute` / `regulation` / `NOM` |
| `formal_source_level` | integer (1/2/3) | Same scale as S3; 44 at level 1 (38 regulation + 6 NOM), 29 at level 2, 5 at level 3 |
| `correspondence_status` | string | Always `identified` in this table (by construction — the sentinels are the `not_identified` cases, and they live only in S3) |
| `substantive_anchor_status` | string | `identified` / `not_identified` — whether the correspondence rises to a *substantive* anchor, independent of whether a provision reference exists at all |
| `correspondence_role` | string | `substantive` (70) / `contextual_or_enabling` (8) — replaces the intermediate file's `correspondence_presence` |
| `mapping_coverage` | string | `complete_component` (7) / `partial_component` (63) / `contextual_only` (8) — replaces the intermediate file's `coverage_status` |
| `actor_fit` … `gap_type` | — | Same values as S3; verified identical row-for-row across all 78 shared records (0 mismatches) |
| `review_priority` | string | Same high/medium/low values as S3. Manuscript reading: **high = routine**, **medium = enhanced review**, **low = mandatory review**. Counts differ by universe: 23/44/11 over these 78 rows vs 25/44/11 over all 80 S3 rows (the 2 sentinels are both `high`) |
| `review_status` | string | Same two values as S3. Manuscript reading: `preliminary_ai_assisted` = "model-generated with author review" (67); `requires_human_review` = "marked for further review" (11 here, 13 in S3 — the 2 sentinels are both `requires_human_review`) |
| `official_source_url` | string | Canonical official URL (`www.diputados.gob.mx` or `www.dof.gob.mx`) for the instrument |
| `official_publication_date` | date | Verified original publication date of the instrument |
| `version_or_last_reform_date` | date | Verified date of the reform/version the provision was located in |
| `verification_date` | date | `2026-07-15` for all rows — date the author's automated existence check ran |
| `verified_by` | string | Method note: automated existence check against author-curated consolidated text; substantive correspondence itself is separately marked `pending expert review` |
| `verification_outcome` | string | `confirmed` (75) / `confirmed_with_citation_correction` (3) |
| `verification_note` | string | Free-text note; non-generic text flags the 5 constitutional records affected by the post-cutoff CPEUM reform, and the citation-form corrections |

## S4 — `S4_consistency_audit.csv`

One row per consistency/plausibility rule run over S3/S3a. 7 rows: 2
by-definition, 3 integrity, 1 plausibility, 1 diagnostic.

| Field | Type | Description |
|---|---|---|
| `rule` | string | Rule description |
| `rule_type` | string | `by-definition` / `integrity` / `plausibility` / `diagnostic` |
| `evidentiary_status` | string | How strong a claim the rule supports |
| `applicable_n` | integer | Rows the rule applies to |
| `passed` | integer | Rows satisfying the rule |
| `failed` | integer | Rows violating the rule (0 for all 7, as of this release) |

The diagnostic rule is explicitly *not* pass/fail: it records that 10 records
carry `rights_safeguard_fit = strong`, of which 8 also carry a
`rights safeguard gap` — an ontological observation (recognition without a
safeguard mechanism), not an error.

## S5 — `S5_network_metrics.json` (+ `S5_node_registry.csv`, `S5_network_edges.csv`)

Instrument × obligation two-mode network, computed (not hand-authored) from
S3a by `06_scripts/build_tables/build_network.py`. Added 2026-07-21.

| Field | Type | Description |
|---|---|---|
| `network.n_instruments` | integer | Distinct instruments with ≥1 anchoring edge (9) |
| `network.n_obligations` | integer | Distinct obligations with ≥1 anchoring edge (43 of 45) |
| `network.n_edges` | integer | Distinct instrument-obligation pairs (68) |
| `network.density` | number | `n_edges / (n_instruments × n_obligations)` (0.176) |
| `instrument_degree_ranked[].degree_norm` | number | Degree normalised against the *opposite mode's* size (Borgatti & Everett, 1997) — obligations_anchored / n_obligations, not against total n |
| `communities` | object | Greedy-modularity communities on the **one-mode obligation-obligation projection** (shared instrument) — not the multimodal network itself; per Knoke, Diani, Hollway & Christopoulos (2021), read as descriptive clustering, not a validated structural-hole/clustering statistic |
| `cug_test` | object | Conditional-uniform-graph permutation test (1,000 draws) on instrument-degree centralisation vs. a random bipartite graph with the same dimensions |
| `S5_node_registry.csv` | table | One row per node: `node_id`, `mode` (instrument/obligation), `degree`, `degree_norm`, `betweenness`, `community` (obligation-mode nodes only) |
| `S5_network_edges.csv` | table | One row per anchoring edge: `source` (instrument), `target` (obligation), `type`, `weight` (max `formal_source_level` across collapsed rows), `rows` (count of S3a rows collapsed into this edge) |

**Deliberately excluded from S5** (see package README for the reasoning):
the actor layer (actor × instrument reach — webapp-only, Political Brain /
Actors Explorer) and the SPAR-comparison bridge (its existing metric relies
on the abolished 0–5 anchoring scale and is not construct-valid under v0.2).

All S5 figures — including the 9/43/68/0.176 network summary, the 9
per-instrument degrees, the 37 distinct provisions (17 single-mapping), the
7 obligations anchored by RIS Art. 35 frac. XIX, the 34-of-43 LGS∪RLGS-SI
reach, the 24/17/0 max-substantive-level distribution, and the CC1 subset
(20 total / 16 substantive / 12 law-or-above / 3 complete / 2 uncorresponded)
— were independently re-verified against S3a and S1 on 2026-07-21 with **zero
discrepancies**: see `06_scripts/validation/validate_network_s5.py`.

---

## Known limitations

- All 12 of S2's originally-`TBD_REVIEW` date fields are closed this
  release, verified against the primary source documents in
  `01_sources/mexico/md/`. Verification surfaced two things flagged for the
  author rather than silently resolved — see `CHANGELOG_v0_1_to_v0_2.md`:
  (1) a date **discrepancy** between S2 and S3a for `MEX-009` (LOAPF),
  resolved in favour of S2 (confirmed by primary source); (2) a version
  **conflict** for `MEX-007` (LGPDPPSO) — the corpus entry's source PDF is
  a 2025 replacement law, not the 2017 text S3a's
  `official_publication_date` pointed to.
- `official_source_url` values in S3a resolve to well-formed URLs on the two
  expected official domains; live HTTP reachability could not be
  automatically confirmed in this environment (both domains return 403 to
  automated fetches).

---

## Superseded

- `04_outputs/exports/data_package_v0_1/` — the original ad hoc file set,
  kept intact as a historical record. Not aligned to manuscript vocabulary.
- `99_archive/superseded_sources/data_package_v0_2_intermediate/S3a_substantive_mappings_78.csv` —
  an intermediate 78-record file with pre-manuscript column names. Do not
  cite; see the `SUPERSEDED.md` note alongside it.
