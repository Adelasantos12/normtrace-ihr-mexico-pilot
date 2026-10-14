# Current data dictionary: source audit 2026-10-14

The original field documentation is retained in `99_archive/pre-audit-2026-10-14/documents/00_project/data_dictionary.md`.

- `mapping_id`: stable record identifier; multiple records may refer to one obligation.
- `obligation_id`: selected IHR 2005 baseline registry unit.
- `domestic_provision_id`: candidate source provision; `NO_MATCH_IDENTIFIED` means no candidate currently recorded, not a verified absence in national law.
- `anchoring_level`: legacy pilot ordinal, or an empty field where re-scoring is withheld. Empty is **not zero**.
- `score_status`: `legacy_unaudited` or `withheld_pending_legal_review`. No revised aggregate is published.
- `legacy_*`: pre-audit values retained without overwriting their meaning.
- `audit_status`: source corrected, source added, or inherited preliminary. This is not independent expert validation.
- `evidence_status`: research state of a source/reference; separate from legal sufficiency.
- `review_status`: current requirement for further legal review.
- `audit_source_url`, `audit_note`: source and reason for targeted correction.
- `source_check_date`: date of a targeted check; not a certification of the currency of every provision.
- `text_type`: new extracts are labelled `source_excerpt`; they are not the full authoritative instrument.
- `source_provision_id` in legal references and relations: a foreign key to the provision registry.
- `retrieval_status`: whether a referred document has been examined; unreviewed does not mean missing.
- `relationship_type`: nature of a source-supported legal duty. Source actor, target actor, action, locator and limitations accompany each relation.
- `inventory_review_status`: preliminary or historical actor entry; not a current-competence certification.

The web CSV files mirror the current source tables exactly. `audit_summary.json` provides overlapping label sets, complete obligation-ID lists and explicit aggregation rules. `dataset_manifest.json` records version, units and source hashes.
