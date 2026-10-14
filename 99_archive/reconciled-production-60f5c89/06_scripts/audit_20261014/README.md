# Source audit migration — 14 October 2026

This directory executes the scoped documentary audit. It does not certify treaty compliance, revalidate every legacy record, or infer observed institutional cooperation.

## Reproduction

Use Python 3.11 with `networkx==3.2.1` and `pandas==2.2.3`, Node 24, and `PYTHONHASHSEED=0`.

```sh
python3 06_scripts/audit_20261014/apply.py
python3 06_scripts/audit_20261014/finalize.py
python3 06_scripts/build_tables/build_network.py
python3 06_scripts/build_tables/spar_normtrace_bridge.py
python3 06_scripts/validation/validate_content.py
cd 05_webapp
npm ci
npm run build
npx playwright install --with-deps chromium
npx playwright test --config=playwright.audit.config.ts
```

`apply.py` preserves the original files in `99_archive/audit_20261014`, checks the 80-record baseline and leaves a manifest. `finalize.py` verifies the migration products and sets `migration_complete`. A partially failed migration must not be resumed by treating the presence of the first manifest as completion: restore the archived baseline in an isolated working copy and rerun both stages. The CI job commits only after data checks, repeat-build comparison and browser regressions succeed.

The workflow dependency pins were changed separately through the repository's authorized connector; the CI token is only used to commit tested data, application source and archives. No persistent credential is created.

## Review boundaries

- Final NOM-017 (DOF 5288225), not its earlier draft, is the legal source.
- Locating a provision changes a no-match or missing-procedure claim, but still requires examination of scope, references and implementation.
- The named National IHR Authority and its domestic designation instrument remain unknown in this dataset; the PAHO report confirms designation/establishment without identifying them.
- SPAR already includes legal mapping. Numerical subtraction from NormTrace is withdrawn.
- Network actor links are explicit source associations, not inferred issuance powers or observed dependencies.
- Legacy synthesis views are preserved behind a visible review gate; they are not current validated findings.
- The production branch must only be advanced without force after verifying its current head and the tested audit commit.
