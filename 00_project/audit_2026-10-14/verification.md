# Technical verification and integration status

The expanded correction is committed at `1e6f86a4ce0cbde3575efe77719331871d359305` on `audit/source-evidence-2026-10-14`.

GitHub Actions run [38599087048](https://github.com/Adelasantos12/normtrace-ihr-mexico-pilot/actions/runs/38599087048) completed successfully: hash-checked migration, regenerated data, Python integrity checks, locked npm installation, production frontend build, and six Chromium Playwright regression tests. Twelve full-page screenshots cover six routes at desktop and mobile widths. Screenshots were inspected after download.

The one-time data-transport chunks, migration runner and write-enabled bootstrap workflow have been removed from the active tree after successful application. Their history, original data archive, payload digest, field-level change log, and migration manifest remain available. The permanent Validate workflow is read-only and regenerates the data to reject stale outputs.

## Integration boundary

The publishing branch and another audit branch received concurrent updates after this work began. This correction was isolated to avoid replacing that work. A successful preview/build is not evidence that the custom production domain has been updated. Integration must reconcile those branches without force-pushing or silently discarding changes.

## Scientific boundary

Technical tests verify file integrity, references, data units, display behaviour and regression conditions. They do not constitute comprehensive legal validation. Current numeric anchoring ratings and confirmed-gap totals remain withheld. Original ratings and assessments are preserved as historical data, not erased or treated as zero. Source verification, legal sufficiency and observed implementation remain distinct.
