# 03_tables — relationship to the v0.2 data package

**Canonical source for the manuscript's tables is now
`04_outputs/exports/data_package_v0_2/`** (S1 obligations, S2 corpus, S3 full
mapping attempt, S3a provision-linked supplement, S4 consistency audit). See
`00_project/data_dictionary.md` and the package's own `README.md`.

The subdirectories below hold the **webapp-facing operational tables** built
earlier in the pilot (`mexico_ihr2005_mapping.csv`,
`mexico_normative_corpus_index.csv`, `mexico_health_governance_actors.csv`,
etc.). They use an older schema and were **not** migrated to the v0.2
manuscript vocabulary in this release — that would require touching the
webapp's data-loading pipeline (`06_scripts/build_tables/`, `05_webapp/`),
which is out of scope for the v0.2 data-package task. Treat the two as
related but currently distinct: v0.2 is the citable manuscript supplement;
the tables below are what the interactive webapp currently reads.

- `international_obligations/` — IHR/pandemic-agreement/PABS obligation
  tables (operational schema; compare to v0.2's `S1_ihr_obligations_45.csv`,
  which covers IHR 2005 only, in the manuscript's own vocabulary).
- `country_legal_mapping/` — corpus index + obligation-to-provision mapping
  (operational schema; compare to v0.2's S2/S3/S3a).
- `actors/` — institutional actors table (not covered by the v0.2 package).
- `gap_assessment/` — `gap_type_summary_v0_2.csv`: a derived summary
  (counts per `gap_type`) computed from `S3a_provision_linked_records_78.csv`.
  Regenerate from v0.2 if the package changes; do not hand-edit.
- `review_flags/` — `requires_human_review_v0_2.csv`: the 13
  `review_status = requires_human_review` records from
  `S3_mappings_80.csv` (11 provision-linked + 2 sentinels), derived for
  quick reference. Regenerate from v0.2 if the package changes; do not
  hand-edit.
