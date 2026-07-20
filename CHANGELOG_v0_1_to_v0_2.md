# CHANGELOG — v0.1.0-pilot → v0.2.0-pilot

Data package migration from the ad hoc v0.1 file set to the manuscript's six
authoritative tables. This document is the full column/value mapping
required before citing v0.2 outputs against text written against v0.1.

## Package structure

- New: `04_outputs/exports/data_package_v0_2/` (S1, S2, S3, S3a, S4, `schemas/`, `README.md`).
- Unchanged: `04_outputs/exports/data_package_v0_1/` — kept intact as a historical record, not deleted.
- Archived: `S3a_substantive_mappings_78.csv` (an intermediate 78-record file using pre-manuscript column names) moved to `99_archive/superseded_sources/data_package_v0_2_intermediate/`, with a `SUPERSEDED.md` note. It is not part of the v0.2 package and must not be cited.

## Column renames

| Table | v0.1 / intermediate name | v0.2 name | Reason |
|---|---|---|---|
| S3 | `source_rank` (float, `"1.0"`/`"2.0"`/`"3.0"`) | `formal_source_level` (integer) | Single vocabulary with S3a; float-typing was an artifact, not a meaningful distinction |
| S3 | `model_confidence_label` | `review_priority` | Same high/medium/low values as S3a; single column name across both tables |
| S3a-intermediate | `correspondence_presence` | `correspondence_role` (S3a canonical) | Manuscript vocabulary |
| S3a-intermediate | `coverage_status` | `mapping_coverage` (S3a canonical) | Manuscript vocabulary |
| S3a-intermediate | `source_rank` | `formal_source_level` | Same as S3 |

## Value renames (`correspondence_type`, S3 legacy field only)

| v0.1 value | v0.2 value |
|---|---|
| `contextual constitutional` | `contextual support` |
| `no match identified` | `no correspondence` |

The remaining six `correspondence_type` values (`direct statutory`,
`indirect statutory`, `regulatory`, `actor-only`, `constitutional basis`,
`coordination`) are unchanged and match the manuscript's enumeration.

## Semantic equivalences (no value or column change, documented for clarity)

- `review_priority` (`review_status` in some older internal notes; do not
  confuse the two — they are different fields): manuscript reads
  **high = routine**, **medium = enhanced review**, **low = mandatory
  review**.
  - Over the 80 S3 rows (includes 2 sentinels, both `high`): 25 high / 44 medium / 11 low.
  - Over the 78 S3a rows: 23 high / 44 medium / 11 low.
- `review_status`: manuscript describes `preliminary_ai_assisted` as
  "model-generated with author review" and `requires_human_review` as
  "marked for further review." Values themselves are unchanged.
  - S3 (80 rows, incl. 2 sentinels, both `requires_human_review`): 67 / 13.
  - S3a (78 rows): 67 / 11.

## Delimiter unification

All v0.2 files are comma-delimited. `04_outputs/exports/data_package_v0_1/ihr_2005_obligations.csv`
used `;` with quoted fields; this is a v0.1-only artifact, not carried into v0.2.

## S2 gaps closed this release

12 of S2's 18 rows carried `TBD_REVIEW` for a publication or amendment date.
5 were closed by cross-referencing S3a's own author-verified
`official_publication_date` field (`verification_date` 2026-07-15) for the
same instrument — not from external lookup:

| norm_id | Instrument | Field closed | Value | Source |
|---|---|---|---|---|
| MEX-002 | Ley General de Salud | `publication_date` | 1984-02-07 | S3a `official_publication_date` |
| MEX-004 | CPEUM | `publication_date` | 1917-02-05 | S3a `official_publication_date` |
| MEX-007 | LGPDPPSO | `publication_date` | 2017-01-26 | S3a `official_publication_date` |
| MEX-009 | LOAPF | `publication_date` | 1976-12-29 | S3a `official_publication_date` |
| MEX-015 | Reglamento LGS Materia de Investigación para la Salud | `publication_date` | 1987-01-06 | S3a `official_publication_date` |

**Discrepancy found, not resolved — for the author:** MEX-009 (LOAPF)'s
existing `last_amendment_date` in S2 is `2025-07-16`, but S3a's
`version_or_last_reform_date` for the same instrument (used by mapping
records `MEX_MAP_IHR2005_*` that cite LOAPF) is `2025-06-20`. Per the
project's own rule ("toda discrepancia se reporta, nunca se ajusta en
silencio"), S2's `last_amendment_date` for MEX-009 was left unchanged
pending author clarification of which date is correct.

**7 fields remain `TBD_REVIEW`**, unresolved this release:

| norm_id | Instrument | Field | Why not closed |
|---|---|---|---|
| MEX-001 | Ley de aprobación de tratados en materia económica | `last_amendment_date` | Instrument does not appear in any S3a mapping record; no author-verified date available to cross-reference |
| MEX-003 | Ley sobre la Celebración de Tratados | `publication_date` | Same |
| MEX-005 | Ley Federal de Procedimiento Administrativo | `publication_date` | Same |
| MEX-006 | Ley Federal de Presupuesto y Responsabilidad Hacendaria | `publication_date` | Same |
| MEX-010 | Ley de Planeación | `publication_date` | Same |
| MEX-012 | NOM-017-SSA2-2012 | `last_amendment_date` | S3a records `official_publication_date` == `version_or_last_reform_date` (both 2013-02-19) for this instrument — consistent with "no amendment on record," but that is an absence-of-evidence inference, not a verified reform date. Left as `TBD_REVIEW` rather than asserting a date; author should confirm whether "no amendment" is itself the intended value |
| MEX-016 | Reglamento de la LGS en Materia de Sanidad Internacional (RLGS-SI) | `last_amendment_date` | Same situation as MEX-012 (both dates 1985-02-18 in S3a) — consistent with the project's own established finding that RLGS-SI has never been amended since 1985, but left as `TBD_REVIEW` for the same reason |

Automated verification of these via `www.diputados.gob.mx` / `www.dof.gob.mx`
was attempted and blocked by a 403 response (bot-protection) in this
environment — see the v0.2 package README for detail. **Action needed from
the author**: either supply the 7 dates directly, or soften the Methods
claim that every instrument is recorded with its date, per the original
task instructions' own fallback.

## S2 additions

- `source_status` (`in_force` / `superseded`): derived from the existing
  `mexico_normative_corpus_index.csv` status field. 16 in_force, 2
  superseded (`MEX-013`, `MEX-014`).
- `cutoff_note`: non-empty only for `MEX-004` (CPEUM), noting the
  2026-04-23 reform postdates the pilot's 31 Jan 2026 cutoff — mirrors the
  per-record note already present in S3a for the 5 constitutional mapping
  records.

## Verification

All counts in this changelog and in the v0.2 README were independently
recomputed by `06_scripts/validation/validate_data_package_v0_2.py`, not
copied from manuscript prose. Run it after any further edit to the package.
