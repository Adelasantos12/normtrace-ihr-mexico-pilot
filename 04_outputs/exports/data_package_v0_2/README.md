# NormTrace-IHR Mexico Pilot — Supplementary Data Package v0.2

This package supersedes `data_package_v0_1/` (kept alongside, unchanged, as a
historical record). It replaces the pilot's earlier ad hoc file set with the
six tables authored directly by the manuscript's author, using the
manuscript's own vocabulary. All counts below were independently recomputed
from these files (see `06_scripts/` validation script) — not copied from the
manuscript.

## Files and what they answer in the Methods

| File | Methods section | Unit of analysis | Rows |
|---|---|---|---|
| `S1_ihr_obligations_45.csv` | Obligation inventory | one IHR (2005) obligation | 45 |
| `S2_mexican_corpus_18.csv` | Domestic legal corpus | one domestic legal instrument | 18 |
| `S3_mappings_80.csv` | Full mapping attempt, incl. sentinels | one obligation→provision mapping attempt | 80 (78 + 2 unmatched-obligation sentinels) |
| `S3a_provision_linked_records_78.csv` | **Canonical** analytical supplement | one obligation→provision mapping with an identified domestic provision | 78 |
| `S4_consistency_audit.csv` | Consistency/plausibility audit | one audit rule | 7 (2 by-definition, 3 integrity, 1 plausibility, 1 diagnostic) |

`S3a_substantive_mappings_78.csv` (an intermediate file with the same 78
records under pre-manuscript column names) is **not** part of this package —
see `99_archive/superseded_sources/data_package_v0_2_intermediate/SUPERSEDED.md`.

## S3 vs S3a — why both exist

`S3_mappings_80.csv` is the complete mapping attempt: all 78 provision-linked
records plus 2 sentinel rows for obligations with no identified domestic
provision at all (`IHR-OBL-011`, `IHR-OBL-037` — mapping IDs
`MEX_MAP_IHR2005_011_001` and `MEX_MAP_IHR2005_037_001`). It also carries the
legacy `correspondence_type` field (8-value enumeration matching the
manuscript's classification) for backward reference.

`S3a_provision_linked_records_78.csv` is **S3 restricted to the 78
provision-linked rows**, using the manuscript's own vocabulary
(`formal_source_level`, `correspondence_role`, `mapping_coverage`), plus a
per-record reference-verification audit trail
(`official_source_url`, `official_publication_date`,
`version_or_last_reform_date`, `verification_date`, `verified_by`,
`verification_outcome`, `verification_note`) not present in S3. **This is the
file to cite as the analytical supplement.**

Verified: every shared column (`actor_fit`, `procedure_fit`,
`coordination_fit`, `enforcement_fit`, `rights_safeguard_fit`,
`vertical_mandate_specification`, `gap_type`) is identical between S3 and S3a
for all 78 shared `mapping_id` values — 0 mismatches.

## Label mapping (v0.1 → v0.2 vocabulary)

See `00_project/data_dictionary.md` for the full column-by-column mapping.
Summary:

| v0.1 / intermediate name | v0.2 canonical name | Notes |
|---|---|---|
| `source_rank` (float, e.g. `"1.0"`) | `formal_source_level` (integer) | Same 1/2/3 scale; S3 and S3a both converted and renamed |
| `model_confidence_label` (S3) / `review_priority` (S3a, intermediate) | `review_priority` | Same high/medium/low values; manuscript reading: high = routine, medium = enhanced review, low = mandatory review |
| `correspondence_presence` / `coverage_status` (intermediate) | `correspondence_status`, `substantive_anchor_status`, `mapping_coverage` (S3a) | Intermediate file conflated two manuscript variables into one; canonical file splits them |
| review_status values (`preliminary_ai_assisted`, `requires_human_review`) | unchanged | Manuscript describes these as "model-generated with author review" and "marked for further review" respectively — same values, no rename |
| `correspondence_type` "contextual constitutional" (v0.1) | `contextual support` (v0.2 legacy enum) | See CHANGELOG |
| `correspondence_type` "no match identified" (v0.1) | `no correspondence` (v0.2 legacy enum) | See CHANGELOG |

## Universes: 80 vs 78

Several counts differ depending on whether the 2 sentinel rows are included:

| Statistic | Over 80 (S3) | Over 78 (S3a) |
|---|---|---|
| `review_priority` = high | 25 | 23 |
| `review_priority` = medium | 44 | 44 |
| `review_priority` = low | 11 | 11 |
| `review_status` = requires_human_review | 13 | 11 |
| `review_status` = preliminary_ai_assisted | 67 | 67 |

The 2 sentinels both carry `review_priority = high` and
`review_status = requires_human_review` in S3, which is why the S3 counts
exceed the S3a counts by exactly 2 in both fields.

## Headline counts (independently recomputed, see validation script)

- 45 obligations (S1); 18 corpus instruments (S2, 16 in force + 2 superseded reform texts); 80 mapping records = 78 + 2 sentinels.
- `correspondence_role`: 70 substantive, 8 contextual_or_enabling.
- `formal_source_level`: 44 at level 1 (38 regulation + 6 NOM), 29 at level 2, 5 at level 3.
- `mapping_coverage`: 7 complete_component, 63 partial_component, 8 contextual_only.
- Per-obligation anchoring: 41 of 45 obligations have ≥1 substantive record, 2 have only contextual records, 2 have none in S3a at all (the 2 sentinel obligations).
- Median `formal_source_level` across the 70 substantive anchors: 1. Median records per anchored obligation: 2 (range 1–3).
- Reference verification (S3a `verification_outcome`): 75 confirmed, 3 confirmed_with_citation_correction.
- `rights_safeguard_fit` = strong: 10 records, of which 8 also carry a rights-safeguard gap_type (S4 diagnostic rule).
- Ley Aduanera: all 3 mapping records already at `formal_source_level` 2 (statute) — no correction needed at this release.

## Known limitations

- All 12 of S2's original `TBD_REVIEW` date fields are now closed, verified against the primary source documents in `01_sources/mexico/md/` (see `date_verification_note` column in S2 and `CHANGELOG_v0_1_to_v0_2.md` for evidence per row). Verification surfaced two things to flag for the author, not silently resolved: (1) MEX-009 (LOAPF) — S2's existing amendment date is confirmed correct; S3a's date for the same instrument disagrees and should be corrected there; (2) MEX-007 (LGPDPPSO) — the corpus entry's source PDF is a 2025 replacement law, not the 2017 text S3a's `official_publication_date` pointed to; confirm which version the S3a mapping records actually cite.
- `official_source_url` values in S3a resolve to well-formed URLs on the two expected official domains (`www.diputados.gob.mx`, `www.dof.gob.mx`); live HTTP reachability could not be automatically confirmed in this environment (both domains return 403 to automated fetches, consistent with bot-protection rather than broken links).

## Corpus scope note

`S2_mexican_corpus_18.csv` includes 2 superseded reform texts (`MEX-013`,
`MEX-014`, marked `source_status = superseded`) alongside 16 in-force
instruments — so the pilot's working corpus of 16 active instruments is
derivable directly from this table via `source_status = in_force`, without
needing to cross-reference `mexico_normative_corpus_index.csv`.
