# Execution closeout — NormTrace source audit, 14 October 2026

## Adopted release

The active implementation is **0.2.0-audit.20261014**, from production commit `7765ab255fca3857de3d5f1ea5f8e9a2cae92c67`. This closeout preserves that implementation without replacing its current data schema, source-backed relations, UI, or tests. The independent correction history ending at `9233369df857a1122d1371fa1621766c69283b84` is retained as a merge parent, not silently substituted for production.

While the independent branch was being tested, production received another implementation of the same audit. It already incorporates the corrected LGS 133(II) attribution, the final NOM-017 (DOF 5288225), the referral/manual distinction, RLGS-SI Article 7 and aircraft/maritime declarations in Articles 30/31, withheld affected scores, SPAR non-comparability, PAHO's reported NIA designation without an invented institution, DGE representation, and separation of shared-instrument associations from explicitly sourced relations. Live `/audit`, `/actors` and `/spar-bridge` pages were checked after the update and returned HTTP 200.

## Counts to report

Use the adopted release manifest, not the intermediate branch counts:

- 45 selected IHR 2005 obligations; 18 federal instruments.
- 116 provision records; 88 obligation–provision records; 18 actor entries.
- 4 individually sourced legal relation records and 4 explicit reference records.
- 29 mapping records have scores withheld; 35 mapping records were corrected or added.

These are documentary record counts, not findings of 29 or 35 legal gaps. The independent branch used separate records for NOM 6.6.3 and 6.6.4 and a different correspondence granularity (117 provisions/94 mappings after reconciliation). Production combines 6.6.3–6.6.4 and corrects certain existing correspondences rather than duplicating them. Counts from the two intermediate implementations are not interchangeable. Historical content and source corrections remain available in Git and dated archives.

## Verification record

- Independent correction: Actions run `38598689418` passed the data validator, 8 Python regression tests, the Vite build and 7 Chromium desktop/mobile tests. The final worker push encountered its workflow-permission restriction; the tested tree was committed using the authorized repository connector.
- Independent reconciliation: Actions run `38600210661` completed successfully and committed `9233369df857a1122d1371fa1621766c69283b84`.
- Adopted production implementation: Validate run `38599528015` completed successfully for `7765ab255fca3857de3d5f1ea5f8e9a2cae92c67`; Vercel deployment `dpl_4gGcBQ9iKf1NwQPaAczSdUbxgqEQ` was READY for production. The closeout itself changes documentation and commit ancestry only, leaving the tested application/data intact.

## Limits

Source correction is not independent legal validation, a complete currency audit, or evidence of observed administrative coordination. The referred surveillance manual, federal-state agreements, the NIA domestic designation instrument, and the substantive reach of the traveller-fee exceptions still require review. Unsupported 18-gap, seven-federal-gap, two-complete-pathway and six-coercive-instrument claims remain withdrawn. No replacement compliance score was invented. No new Zenodo version was published. The dependency vulnerabilities reported by the existing npm lockfile were outside this targeted legal-source correction and were not fixed with a forced upgrade.
