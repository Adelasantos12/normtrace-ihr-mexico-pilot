# NormTrace-IHR: evidence and review status

## Scope of this correction

Release 0.1.1-audit implements the scoped source audit of 14 October 2026. The corpus covers 45 selected IHR 2005 obligation units and 18 federal instruments. The separate 2024, Pandemic Agreement and PABS registries are not pooled with that denominator. Descriptive record counts are regenerated from canonical CSV files.

This is an AI-assisted preliminary research corpus. Textual checking is not independent expert validation or a finding of compliance. State legislation, federal-state agreements and actual administrative practice remain outside the reviewed scope.

## What has changed

The SINAVE establishment/operation power is linked to LGS Article 133(II); Article 134 is described as a list of transmissible diseases. NOM-017 6.6.3, 6.6.4 and 8.1.4 are now recorded, including the referral to the international-surveillance manual and the domestic notification clock. The final NOM source replaces the draft URL used in the earlier audit.

RLGS-SI Article 7 supplies a candidate correspondence for IHR Article 40; the prior no-match row is explicitly superseded, not silently deleted. Articles 30 and 31 supply aircraft/maritime declaration procedures and references to IHR forms. Full equivalence remains a review question.

## SPAR and legal evidence

SPAR second edition C1.1 already calls for national and subnational legal mapping, analysis and review. C2.1 examines focal-point functions. NormTrace organizes provision-level evidence that can support such assessments; it does not establish that SPAR ignores law. The September 2026 WHO revision presentation gives attention to domestic governance and responsible authorities.

The subtraction of SPAR and NormTrace percentages has been withdrawn. There is no validated common construct or denominator. Legacy anchoring scores and gap labels are preserved as explicitly historical fields; they are not current readiness measures. No replacement legal score, count of complete pathways or confirmed gap total is supplied by this scoped audit.

## Evidence statuses and referrals

`legacy_unvalidated`: inherited assessment not revalidated here. `source_corrected_scope_pending`: a source omission or description was corrected; sufficiency for the whole obligation still requires review. `referral_pending_review`: an express reference was located, but the referenced document has not been examined. `superseded`: an old record retained for provenance, excluded from current associations and counts of active mappings.

A missing document, an unexamined referral, a partly specified procedure and an established legal absence are distinct. None is converted into another by an aggregate score. An absence from this federal corpus does not establish an absence in Mexican law or practice.

## Reading the network

Instrument-obligation edges are documentary correspondences with provision and mapping identifiers. Actor-obligation edges are a partial set of explicit textual role references with sources. DGE is represented separately. No edges are generated merely because institutions appear in the same law. No edge asserts that its actor issued the instrument, can amend it, or coordinates successfully with another actor.

All 45 obligation nodes are retained, including those with no current correspondence. A disconnected node means no association in this dataset, not a confirmed legal vacuum. Degree counts measure documentary incidence only. Legal sufficiency, political influence and system resilience cannot be read from node size or degree.

## National IHR Authority

PAHO CD63/INF/1 paragraph 17 reports that Mexico had confirmed designation or establishment of a National IHR Authority by 15 July 2026. The Mexican institution and domestic act are not identified in that report. DGE's National Focal Point role is documented separately; this release does not identify DGE as the NIA.

Article 4 permits one or two entities and legislative and/or administrative arrangements as appropriate. It does not universally require a new statute. The adequacy of a regulation depends on its powers, legal basis and content, not its rank or age alone.

## Sources

- [NOM-017-SSA2-2012, final standard, DOF 19 February 2013](https://dof.gob.mx/nota_detalle_popup.php?codigo=5288225). The earlier audit URL /normasOficiales/4823/salud12_C/salud12_C.html is the draft (PROY), not the final standard. References below use the final text.
- [Ley General de Salud, articles 133(II) and 134](https://www.diputados.gob.mx/LeyesBiblio/pdf/LGS.pdf). Source correction concerns these provisions; not a certification of all subsequent amendments.
- [Reglamento de la Ley General de Salud en Materia de Sanidad Internacional, articles 7, 30 and 31](https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LGS_MSI.pdf). 1985 instrument; age and regulatory rank alone do not establish inadequacy.
- [PAHO CD63/INF/1, 21 August 2026, paragraph 17](https://iris.paho.org/bitstreams/7c461167-1eae-4e58-ad9c-d8ba8338c9dc/download). Mexico reported designation or establishment by 15 July 2026. This report does not identify the Mexican entity or domestic act.
- [WHO SPAR, second edition (2021), indicators C1.1 and C2.1](https://cdn.who.int/media/docs/default-source/health-security-preparedness/cap/spar/9789240040120-eng-new.pdf). Already includes national/subnational legal mapping and review, and focal-point functions.
- [WHO presentation on SPAR revision, 30 September 2026](https://apps.who.int/gb/mspi/pdf_files/2026/09/Item1_30-09.pdf). Presentation addresses domestic governance and responsible authorities; not treated here as evidence of every final reporting-tool detail.
- [International Health Regulations, consolidated amendments, articles 4 and 6](https://apps.who.int/gb/bd/pdf_files/IHR_2014-2022-2024-en.pdf). Article 4 permits legislative and/or administrative arrangements as appropriate; Article 6 notification clock follows assessment.

## Reproducibility and remaining work

Canonical tables are in `03_tables`; the builders regenerate web copies and descriptive artifacts. Original tables are preserved under `99_archive/legal_audit_20261014` and in baseline commit 478e795f. Record-level before/after fields preserve lineage.

Remaining work: review the referred manual and other instruments; identify the domestic NIA act; examine the scope and exceptions of candidate provisions; revalidate unaffected legacy correspondences; define consistent obligation-level coding and, only then, recompute legal conclusions. Static legacy diagnostics, causal topology and draft reports are not served as current findings.

Historical methodology is retained in the audit archive; its numerical and causal interpretations are withdrawn pending recoding.
