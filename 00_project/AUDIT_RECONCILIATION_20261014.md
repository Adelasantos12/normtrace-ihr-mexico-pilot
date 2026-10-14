# Audit reconciliation — 14 October 2026

The production branch had acquired an earlier audit implementation while the independent correction branch was being validated. Both concerned this source audit. The complete production tree at `60f5c89903511710ed1615cbf7e7566c5ebd9d40` is preserved under `99_archive/reconciled-production-60f5c89`, in addition to its Git history.

The consolidated implementation retains the source corrections, adds community/intermediate-level notification candidate matches from the earlier audit, and uses the final NOM-017 (DOF code 5288225), not the 2012 draft. Sections 6.6.3 and 6.6.4 are kept as one combined provision record. This explains the differing record totals between intermediate implementations; obligations and instruments are unchanged.

The earlier implementation assigned provisional numeric codes to new matches. This version withholds affected codes pending legal review and preserves original values. Shared-instrument associations remain distinct from explicitly sourced legal relations and observed coordination.

Reproduction: run the initial audit migration only on its expected original baseline, then `reconcile_legal_audit_20261014.py`, regenerate audit summary/network/SPAR context, and run validation and browser tests. Applied markers prevent repeat mutation of source tables.

Final standard: https://dof.gob.mx/nota_detalle_popup.php?codigo=5288225
