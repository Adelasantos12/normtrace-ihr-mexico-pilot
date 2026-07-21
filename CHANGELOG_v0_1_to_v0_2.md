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

### Correction — MEX-016 / RLGS-SI errata date missed on first pass

The first verification pass truncated each instrument's `status` field
when scanning for a later date, and missed that the RLGS-SI (Reglamento de
la Ley General de Salud en Materia de Sanidad Internacional) metadata's
`status` field reads "Current text; new regulation DOF 1985-02-18, **errata
DOF 1985-07-10**" — i.e. the regulation's true last modification is a
published erratum, not its original publication date. A full re-read of
all 16 corpus metadata YAMLs (not truncated) confirmed this was the only
instrument where a later date had been missed; the other two ambiguous
cases were checked and confirmed *not* to need a change:

- Ley Aduanera's 2025-12-27 date is a customs-value update under the
  Reglas Generales de Comercio Exterior, not a reform to the statute
  itself — `last_amendment_date` correctly stays `2025-11-19`.
- Reglamento Interior de la Secretaría de Salud's 2018/2023 dates are the
  superseded partial-reform files (`MEX-013`, `MEX-014`), which the
  corpus metadata already explicitly marks as archived —
  `last_amendment_date` correctly stays `2025-02-27`.

Fixed:
- **S2 (`MEX-016`)**: `last_amendment_date` `1985-02-18` → `1985-07-10`.
- **S3a**: `version_or_last_reform_date` was also `1985-02-18` (same
  root cause) on all 24 RLGS-SI mapping records; corrected to
  `1985-07-10`, with `verification_note` updated to state the last
  modification is the errata DOF 10-07-1985 to the new regulation DOF
  18-02-1985.

All 9 distinct reform dates now appearing across S3a's instruments were
re-checked against the full (untruncated) authoritative YAMLs and agree.
`verification_outcome` distribution is unchanged (75 confirmed + 3
confirmed_with_citation_correction) — this was a date correction, not a
change to the confirmed/citation-correction classification.

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

## Adenda (2026-07-21) — network layer (S5)

Added `S5_network_metrics.json` (+ `S5_node_registry.csv`,
`S5_network_edges.csv`), a two-mode instrument × obligation network computed
by `06_scripts/build_tables/build_network.py` from
`S3a_provision_linked_records_78.csv`.

- Brought the script over from `claude/normtrace-phase-f-ci` (the
  non-determinism-fixed version from PR #13) and adapted it: reads S3a v0.2
  instead of the pre-manuscript mapping CSV, uses `formal_source_level`
  (v0.2 name) as edge weight instead of the old `anchoring_level`, and
  **removes the actor overlay entirely** — the actor layer stays a
  webapp-only presentation layer and does not belong in the paper's
  supplementary package.
- Verified deterministic: byte-identical `S5_network_metrics.json` and
  `S5_node_registry.csv` across two consecutive runs and under
  `PYTHONHASHSEED=999999`.
- Every value the author specified as expected for this layer — 9
  instruments, 43 obligations, 68 edges, density 0.176; per-instrument
  degrees (LGS 21, RLGS-SI 19, RIS 11, NOM-017 6, CPEUM 5, Ley Aduanera 3,
  LOAPF 1, LGPDPPSO 1, RLGS-Inv 1); 37 distinct provisions (17
  single-mapping); RIS Art. 35 frac. XIX anchoring exactly
  {OBL-001,003,005,007,008,009,041}; LGS∪RLGS-SI reach 34/43; max
  substantive `formal_source_level` distribution 24 at level 2 / 17 at
  level 1 / 0 at level 3; the CC1 subset (20 obligations, 16 with a
  substantive anchor, 12 at law-level or above, 3 with a complete
  component, 2 uncorresponded — both CC1) — was independently recomputed
  directly from S3a/S1 and matched with **zero discrepancies**. See
  `06_scripts/validation/validate_network_s5.py`.
- **Not published in v0.2**: the actor layer (webapp-only) and the SPAR-
  comparison bridge (its existing metric expresses the abolished 0–5
  anchoring scale as a percentage, which is not construct-valid under the
  v0.2 `formal_source_level` 1–3 architecture). If the author adopts the
  optional Discussion block comparing against WHO SPAR CC1, the bridge
  needs rederiving against the CC1 counts above, with the SPAR panel's
  exact provenance logged first — see package README.
- The Methods' new `[REF-MPN]` reference (Knoke, Diani, Hollway &
  Christopoulos, 2021, *Multimodal Political Networks*, Cambridge
  University Press, doi:10.1017/9781108985000) is cited identically in
  `S5_network_metrics.schema.json`'s `provenance_note`. The author assigns
  the final reference number in the manuscript; this repo does not
  renumber it.

## Adenda (2026-07-21), continued — points 6 and 7

**Point 6 — `fig2_matrix.py` (Figure 2, two-mode incidence matrix): blocked,
not written.** The instructions describe this script as author-delivered
("lo entrega la autora"); it was not attached to the task and does not
exist in this repository on any branch (checked all local and remote
branches). Writing a Figure 2 matrix-generation script from scratch and
presenting it as the author's delivered artifact would misattribute
analytical work that is hers to produce, not mine to invent on her behalf.
This point is on hold pending the actual file. Once it's provided, it can
be placed in `06_scripts/`, pointed at the v0.2 paths, and verified against
the same S5 recomputation this package already carries: 68 cells, the
7-obligation cluster anchored by RIS Art. 35 frac. XIX (ring), the 2
columns with no correspondence (`IHR-OBL-011`, `IHR-OBL-037`), and the
per-row (per-instrument) degrees in `06_scripts/validation/validate_network_s5.py`.

**Point 7 — Stage-1 exhaustiveness overclaim: fixed, but not on this
branch.** "All 45 operative IHR 2005 obligations were extracted from the
treaty text" lives in `normtrace_ihr_methodology_full.md`, which does not
exist anywhere in this data-package branch (`sync-methods-v0.2`) — only on
the webapp branches. Fixed directly there instead, in both tracked copies
of the file (`00_project/` and `05_webapp/public/data/markdown/`):
- `claude/beautiful-sagan-etT0C` (the repo's default branch, commit `721a6c3`)
- `webapp-integrated` (the branch behind PR #19, commit `b584807`)

Replaced with the bounded-selection framing and the exact named exclusions
given in the Adenda: WHO-directed provisions (Arts. 11, 12, 14, 15–18, 29),
State-Party-directed provisions outside the coded selection (Arts. 25, 26,
28, 33, 34, 54(1)), and Art. 13(5) treated as a soft ("should") obligation,
not a hard exclusion.

**Not addressed**: those same two copies of `normtrace_ihr_methodology_full.md`
also still describe the pre-v0.2 architecture in their Abstract and
Methods sections (the abolished 0–5 anchoring scale, "validated anchoring
scale", mean 1.76/5) — the broader Step 6 rewrite this task originally
asked for, applied only to `methodology_note.md` (archived) because
`normtrace_ihr_methodology_full.md` was believed not to exist on any
branch at the time. That belief was wrong; the file exists on the webapp
branches and was never brought in line with v0.2. Flagging this for the
author rather than rewriting substantive Results/Methods text
unilaterally — this is a bigger content decision than the single overclaim
sentence in point 7.
