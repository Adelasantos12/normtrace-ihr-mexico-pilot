# Superseded — intermediate S3a duplicate

`S3a_substantive_mappings_78.csv` is an intermediate working file, **not** the
canonical S3a supplement. It was superseded by
`04_outputs/exports/data_package_v0_2/S3a_provision_linked_records_78.csv` on
the v0.2 data package release.

Both files contain the same 78 records (row-for-row identical `mapping_id`,
`obligation_id`, and analytical fit/gap_type values — verified byte-for-byte
equal on all shared columns). They differ only in column vocabulary and in
whether the per-record reference-verification audit trail is present:

| This file (superseded) | Canonical (`S3a_provision_linked_records_78.csv`) |
|---|---|
| `source_rank` (float-typed) | `formal_source_level` (int-typed) |
| `correspondence_presence` | `correspondence_status` / `substantive_anchor_status` |
| `coverage_status` | `mapping_coverage` |
| `review_priority` | `review_priority` (unchanged) |
| — no reference audit columns — | `official_source_url`, `official_publication_date`, `version_or_last_reform_date`, `verification_date`, `verified_by`, `verification_outcome`, `verification_note` |

Do not publish this file as a supplement. Do not cite it — cite the canonical
S3a file. Kept here only as a provenance record of the intermediate naming
this project used before standardizing on the manuscript's vocabulary.

Superseded: v0.2 data package release, 2026-07-20.
