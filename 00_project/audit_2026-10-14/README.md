# NormTrace-IHR: documentary traceability and legal review

Working release **0.2.0-evidence-audit**, 14 October 2026. Targeted source corrections have been applied; comprehensive expert legal validation remains pending.

## What is being mapped

The pilot associates selected IHR 2005 obligation units with candidate domestic provisions and institutional references. A correspondence is evidence to examine, not a finding of complete compliance, implementation or performance. The 2024 amendments and other international instruments have separate registries and must not be added to the IHR 2005 denominator.

## Scope and units

The index includes **18 instruments**, of which **two are archived** and **16 are marked active in the pilot index**. That designation is not a certification of current legal validity. The updated working tables contain **45 selected obligation units, 118 provision records and 99 mapping records**. Several provisions can concern one obligation; a provision can concern several obligations. The institutional inventory retains **18 actor records**, including historical profiles requiring temporal review.

The current manifest and per-obligation ID lists are generated from the canonical tables. State legislation, intergovernmental agreements, referenced manuals, administrative practice, staffing and expenditure were not comprehensively assessed in this targeted correction.

## Source correction is not expert validation

The correction checks selected primary-text excerpts, repairs wrong article descriptions and adds relevant provisions that were omitted. It does not claim a second independent human coding or a comprehensive legal adequacy assessment. Original preliminary ratings are preserved in `legacy_*` fields and the baseline archive; current anchoring ratings and confirmed-gap totals are withheld pending revalidation. **Pending is not zero.**

The following review states are distinct:

| Review state | Meaning |
| --- | --- |
| legacy assessment unchecked | The old interpretation has not been independently revalidated. |
| source correction applied, scope pending | An identified error was corrected; complete coverage of the obligation remains unresolved. |
| text checked, scope pending | A relevant source excerpt was checked; no complete-compliance conclusion follows. |
| reference review pending | The text refers to another instrument or manual still to be examined. This is not a finding that a procedure does not exist. |

No claim of two complete legal pathways is made. A single row with no recorded gap cannot certify a complete obligation. The former counts of eighteen procedural/coordination gaps, seven federal-state gaps and six instruments missing safeguards are not certified current results. Numerical or category results require an explicit rule, IDs, coverage checks and review status.

## Legal notification example

Article 133(II) of the General Health Law gives the Ministry responsibility to establish and operate SINAVE. Article 134 lists communicable diseases for surveillance, prevention and control; it does not create SINAVE or list fourteen procedural functions.

The enacted NOM-017-SSA2-2012, published on 19 February 2013, identifies the DGE as NFP in 6.6.1, assigns international surveillance responsibilities in 6.6.3 and refers to the IHR and an international surveillance manual in 6.6.4. Section 8.1.4 gives the domestic notification endpoint, channels and an awareness-based 24-hour period. Its reporting direction must be read with the definition of notification in 3.1.30 and applicable procedures. This is not the same clock as IHR Article 6's 24 hours from assessment.

The final enacted NOM is the source for these corrections. A URL used in the prior audit pointed to the 2012 **project**, not the final text. That source error is explicitly corrected; the project is not used as enacted law.

RLGS Sanidad Internacional Article 7 supplies a gratuity rule with exceptions relevant to IHR Article 40. The exceptions and fiscal references require review; the old `NO_MATCH_IDENTIFIED` conclusion is withdrawn. Articles 30 and 31 specify aircraft and maritime declaration presenters, arrival triggers and references to IHR forms. The previous absence claims overlooked these clauses.

## Normative relationships and documentary associations

The calculated network has two different documentary relations: candidate obligation–instrument correspondence, and actor profiles citing an instrument. An actor reference is **not** an assertion that the actor can issue, amend or enforce every provision in that instrument. Shared legislation does not establish cooperation or a dependency between two authorities. A historical or unmatched profile is retained with its status, not treated as absent from government.

The DGE is retained as its own record. Aliases used in actor source references are matched explicitly; a truncated-prefix match is not used. Historical INAI and successor competences are not merged into a single asserted current authority.

Node size describes documentary degree or shared-instrument reach. All graph edges use uniform weights; unvalidated ordinal anchoring ratings are not encoded as legal strength. Unmatched obligation units remain visible with zero graph degree, which is not proof of legal silence. Centrality describes this corpus and is not evidence of political influence, coordination failure, resilience or causal cascades.

A **separate table of four source-backed normative relationships** identifies source/target entities, the action and its supporting provision. Two describe generic administrative reporting levels, not a fully identified chain of organizations. The data explicitly state that actual exchanges were not observed. No actor-to-actor edge is inferred from co-appearance in legislation.

## SPAR context and measurement limits

SPAR's second edition C1.1 already asks for national and subnational legal analysis/mapping, and C2.1 addresses NFP functions. NormTrace contributes inspectable obligation-level evidence; it does not discover a law dimension absent from SPAR. The 30 September 2026 WHO presentation describes the revised domestic-governance focus; this must not be attributed retrospectively to the instrument used for 2025 reporting.

SPAR's country-level capacity score and preliminary obligation-level coding lack a validated common denominator and construct. The earlier 60-versus-34 comparison and the inferred percentage-point discrepancy have been withdrawn. Historical SPAR observations are retained as source data, not averaged across editions or connected as an invariant measure. The current context page separates the 2021–2025 second-edition segment.

## National IHR Authority

PAHO's CD63/INF/1 report, dated 21 August 2026, paragraph 17, records Mexico among States confirming designation or establishment as of 15 July 2026. The report does not identify the Mexican institution or its domestic designating act. These two fields remain null; DGE's NFP designation must not be used to fill them by assumption.

IHR Article 4 permits one or two entities and appropriate legislative and/or administrative arrangements. It does not universally require a statute naming the authority. The legal adequacy of a regulation depends on competence, enabling law, content and applicable constitutional requirements. Neither a sub-statutory rank nor a pre-2005 date alone proves insufficiency.

## Reproducibility and next review

Canonical CSV tables in `03_tables` generate the public mirrors, release manifest, per-obligation review queue, graph and current export package. Source checksums and a field-level change log accompany the correction. Historical material is retained in the archive and the immutable prior Git history, not republished as validated current findings.

Run `python3 06_scripts/build_tables/build_audit_release.py`, `build_network.py`, and `spar_normtrace_bridge.py`, then `python3 06_scripts/validation/validate_content.py`. The numerical bridge filename is retained for compatibility but generates separate SPAR context and a withdrawal notice, not a discrepancy score. Browser tests check the current routes, record filters, network coverage and no false designation or numeric discrepancy display.

Next substantive tasks are independent legal coding, review of the referenced manuals and agreements, temporal verification of institutional successors and the Mexican NIA instrument, and then reconsideration of an explicitly justified aggregation rule. Automated integrity tests do not substitute for those tasks.

## Sources

- [Final NOM-017-SSA2-2012, DOF 19 February 2013](https://dof.gob.mx/nota_detalle_popup.php?codigo=5288225)
- [General Health Law, Articles 133–134](https://www.diputados.gob.mx/LeyesBiblio/pdf/LGS.pdf)
- [International Health Regulation of Mexico, Articles 7, 30–31](https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LGS_MSI.pdf)
- [WHO consolidated IHR](https://apps.who.int/gb/bd/pdf_files/IHR_2014-2022-2024-en.pdf)
- [WHO SPAR second edition](https://cdn.who.int/media/docs/default-source/health-security-preparedness/cap/spar/9789240040120-eng-new.pdf?sfvrsn=5dc09bd9_3)
- [WHO SPAR revision presentation, 30 September 2026](https://apps.who.int/gb/mspi/pdf_files/2026/09/Item1_30-09.pdf)
- [PAHO CD63/INF/1, 21 August 2026, paragraph 17](https://iris.paho.org/bitstreams/7c461167-1eae-4e58-ad9c-d8ba8338c9dc/download)
