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

## S2 gaps closed this release — all 12, against primary source text

12 of S2's 18 rows carried `TBD_REVIEW` for a publication or amendment
date. All 12 are now closed, verified directly against the actual
instrument text in `01_sources/mexico/md/` (the converted DOF/Cámara de
Diputados source documents already in this repo — the "Nueva Ley
publicada..." / "Última Reforma DOF..." header line every one of these
documents carries), not from external lookup or from memory:

| norm_id | Instrument | Field closed | Value | Evidence |
|---|---|---|---|---|
| MEX-001 | Ley de aprobación de tratados en materia económica | `last_amendment_date` | 2004-09-02 (= publication) | Source header shows only "Nueva Ley DOF 02-09-2004", no "Última Reforma" line — no subsequent reform published |
| MEX-002 | Ley General de Salud | `publication_date` | 1984-02-07 | Source header: "Nueva Ley publicada...el 7 de febrero de 1984" |
| MEX-003 | Ley sobre la Celebración de Tratados | `publication_date` | 1992-01-02 | Source header: "Nueva Ley publicada...el 2 de enero de 1992" |
| MEX-004 | CPEUM | `publication_date` | 1917-02-05 | Source header: "Constitución publicada...el 5 de febrero de 1917" |
| MEX-005 | Ley Federal de Procedimiento Administrativo | `publication_date` | 1994-08-04 | Source header: "Nueva Ley publicada...el 4 de agosto de 1994" |
| MEX-006 | Ley Federal de Presupuesto y Responsabilidad Hacendaria | `publication_date` | 2006-03-30 | Source header: "Nueva Ley publicada...el 30 de marzo de 2006" |
| MEX-007 | LGPDPPSO | `publication_date` | 2025-03-20 | Source header: "Nueva Ley publicada...el 20 de marzo de 2025" — see correction note below |
| MEX-009 | LOAPF | `publication_date` | 1976-12-29 | Source header: "Nueva Ley publicada...el 29 de diciembre de 1976" (also independently supplied by the author) |
| MEX-010 | Ley de Planeación | `publication_date` | 1983-01-05 | Source header: "Nueva Ley publicada...el 5 de enero de 1983" |
| MEX-012 | NOM-017-SSA2-2012 | `last_amendment_date` | 2013-02-19 (= publication) | No "Última Reforma" line in source header — no subsequent modification published |
| MEX-015 | Reglamento LGS Materia de Investigación para la Salud | `publication_date` | 1987-01-06 | Source header: "Nuevo Reglamento publicado...el 6 de enero de 1987" |
| MEX-016 | Reglamento de la LGS en Materia de Sanidad Internacional (RLGS-SI) | `last_amendment_date` | 1985-07-10 | Source header: "Fe de erratas DOF 10-07-1985" — a published correction notice, not a substantive amendment (RLGS-SI has had no substantive reform since 1985, consistent with the pilot's central finding) |

Full evidence and reasoning for each row is in
`04_outputs/exports/data_package_v0_2/S2_mexican_corpus_18.csv`'s new
`date_verification_note` column.

### Discrepancy 1 — resolved: MEX-009 (LOAPF)

S2's existing `last_amendment_date` (`2025-07-16`) is **confirmed correct**
against the primary source header ("Últimas reformas publicadas DOF
16-07-2025", i.e. 2025-07-16 in DD-MM-YYYY). S3a's
`version_or_last_reform_date` for the same instrument (`2025-06-20`)
disagrees and appears to be the error — **flagged for the author to
correct in S3a**, not silently changed here.

### Discrepancy 2 — found during verification: MEX-007 (LGPDPPSO)

Initially filled `publication_date` as `2017-01-26` from S3a's own
`official_publication_date` field. Verifying against the primary source
(`G_LGPDPPSO.pdf`, the actual PDF this corpus entry is converted from)
surfaced a conflict: its header reads "Nueva Ley publicada en el Diario
Oficial de la Federación el 20 de marzo de 2025" — a full replacement law,
not an amendment to a 2017 text. `publication_date` was corrected to
`2025-03-20` (the date directly evidenced by the document this corpus
entry actually represents). Note this is the same date Mexico's LGTAIP
(`MEX-008`) was newly published, consistent with the 2025 transparency/
data-protection legal reform replacing both frameworks together. **Flagged
for the author**: confirm whether S3a's mapping records for LGPDPPSO cite
the new (2025) or the prior, superseded (2017) version of the law — the
`formal_source_level`/`gap_type` coding may need revisiting if it was
based on the 2017 text.

No automated external fetch was needed to close these 12 gaps — all
evidence came from source documents already present in this repository
(`01_sources/mexico/md/` and `metadata/`).

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
