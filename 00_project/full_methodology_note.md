# NormTrace-IHR: source-corrected preliminary methodology

Version 0.2.0-audit.20261014 · targeted source audit, 14 October 2026.

## Analytical framework

NormTrace organizes legal evidence around selected international obligations. A mapping record links an obligation to a candidate domestic provision, with a source locator, an assessment, and a review status. This is a documentary research infrastructure, not a compliance score or a measurement of how institutions behave.

The distinction matters: identifying a provision is not the same as establishing that it fully implements an obligation. Failing to find a provision within a limited corpus is not evidence that no applicable rule exists.

## The core problem and existing assessments

The WHO SPAR tool already asks States Parties to analyse and map national and subnational legal instruments. Its second edition includes legal review in C1.1 and national focal-point mandate and functions in C2.1. NormTrace does not claim to discover a legal dimension absent from SPAR or JEE. It organizes obligation-level evidence so a reader can inspect the provisions and the reasoning behind a finding.

The WHO presentation of 30 September 2026 concerning SPAR's third edition gives explicit attention to domestic governance and responsible authorities. Analyses must identify the instrument edition and reporting cycle they discuss.

Sources: [SPAR, second edition (C1.1 and C2.1)](https://cdn.who.int/media/docs/default-source/health-security-preparedness/cap/spar/9789240040120-eng-new.pdf); [SPAR revision presentation, 30 September 2026](https://apps.who.int/gb/mspi/pdf_files/2026/09/Item1_30-09.pdf).

## Pilot scope and units

The current dataset contains 45 selected obligation units extracted from the IHR 2005 baseline, 18 federal instruments, 116 provision records and 86 obligation–provision records. These are distinct units. A single obligation may have several candidate provisions in one or more instruments. A provision may be relevant to several obligations. The 45 units are not an exhaustive count of every duty in the IHR and must not be combined with the separate 2024-amendment or Pandemic Agreement registries.

The actor inventory has 18 entries, including grouped state authorities and a historical INAI entry requiring successor analysis. Four individually sourced legal-relation records and four reference-follow-up records were added. These small tables are not exhaustive maps of Mexican interinstitutional relations.

The audit added six provisions and six mapping rows, corrected source descriptions and withdrew unsupported absence claims. Source dates and the 14 October audit date are different metadata: this was a targeted review, not a comprehensive currency check of the whole corpus.

State laws, federal-state agreements, administrative practice and a full set of referenced manuals were not examined. The remaining registry and historical scores have not received independent expert legal validation. Current counts and source hashes are generated in `dataset_manifest.json`; exact obligation-ID sets are supplied in `audit_summary.json`.

## Source verification and legal interpretation

The correction process distinguishes these situations:

| Evidence situation | Meaning | Next step |
| --- | --- | --- |
| Relevant provision located | A candidate source has been identified | Examine its scope for the whole obligation |
| Reference identified | A provision refers to another instrument or manual | Retrieve the referenced document and identify its applicable version |
| Target document not reviewed | The reference is known but its content was not assessed | Record the research limit, not an absent procedure |
| No candidate in the dataset | The current search has no identified candidate | Extend and document the search before a legal-absence conclusion |
| Source corrected, assessment pending | A previous source claim was incorrect or incomplete | Withhold affected scores until legal reassessment |
| Inherited preliminary assessment | The earlier pilot annotation has been retained | Do not represent it as audited or expert validated |

Source excerpts and researcher summaries must remain distinct. Excerpts in the registry are not substitutes for the full official text. New targeted excerpts include source-check metadata; inherited excerpts may contain extraction notes and require verification.

## Corrected legal examples

**SINAVE.** Article 133(II) of the General Health Law assigns the Health Ministry responsibility for establishing and operating the national epidemiological surveillance system. Article 134 lists transmissible diseases subject to surveillance, prevention and control; its fractions are not fourteen procedural functions. [General Health Law](https://www.diputados.gob.mx/LeyesBiblio/pdf/LGS.pdf).

**Notification and references.** NOM-017 §§6.6.3–6.6.4 assigns international surveillance responsibilities and refers to the IHR and an international surveillance manual. Section 8.1.4 specifies reporting through successive administrative levels to the DGE before 24 hours from knowledge, with telephone, fax or electronic means. That domestic clock is not the IHR Article 6 clock, which runs from assessment. The scope of these rules and the referred manual must be examined for each obligation. [NOM-017](https://dof.gob.mx/normasOficiales/4823/salud12_C/salud12_C.html); [IHR consolidated text](https://apps.who.int/gb/bd/pdf_files/IHR_2014-2022-2024-en.pdf).

**Traveller charges.** Article 7 of the international health regulation provides a gratuity rule with exceptions. It is relevant to IHR Article 40, so the former `NO_MATCH_IDENTIFIED` record was withdrawn. Full alignment, including exceptions, remains unassessed. **Declarations.** Articles 30 (aircraft) and 31 (ships) specify the submitting actor, arrival timing and a reference to the IHR form. These provisions correct the earlier search that relied only on Article 9. [International health regulation, Articles 7, 30–31](https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LGS_MSI.pdf).

## National IHR Authority

PAHO's CD63/INF/1 report, dated 21 August 2026, paragraph 17, includes Mexico among States Parties confirming designation or establishment of a National IHR Authority by 15 July 2026. The report does not identify the Mexican entity or the domestic designation instrument. The dataset records designation/establishment as reported and leaves entity and instrument fields null. DGE focal-point functions do not establish that it also occupies the National Authority role. [PAHO report](https://iris.paho.org/bitstreams/7c461167-1eae-4e58-ad9c-d8ba8338c9dc/download).

## Legacy scale and withheld scores

Earlier pilot labels and scores are preserved for provenance in `legacy_*` columns and in the pre-audit archive. They are not newly validated results. On affected records, `anchoring_level` is blank and `score_status` indicates that scoring is withheld pending legal review. Blank is not zero and is never counted as no legal support.

No new average, legal-capacity percentage or ranking is calculated from this mixed preliminary dataset. No universal legal-sufficiency conclusion follows from an instrument being a statute, regulation or administrative rule. A regulation may act under adequate statutory authority, and constitutional or international provisions may apply together with sectoral instruments. Article 4 of the amended IHR permits appropriate legislative and/or administrative arrangements; it does not universally require a new statute.

The prior public claims of 18 confirmed procedural/coordination gaps, seven federal-state gaps, two complete pathways and six instruments lacking safeguards are withdrawn as validated outputs. Two individual rows tagged without a gap do not establish two complete obligations. Rights protections must be examined across applicable law, not merely in one health-sector provision.

## Aggregation and reproducibility

The unit for obligation-level summaries is `obligation_id`. A summary reports the union of candidate provision IDs and review labels. Label sets overlap; their counts must not be summed as if they were mutually exclusive. The summary supplies record-ID lists so each count can be reproduced.

The generators run in order: `build_audit_summary.py`, `build_network.py`, and `spar_normtrace_bridge.py`. Source tables are mirrored to the web data directory and a new export package. Original source tables were archived byte-for-byte before correction. A versioned one-time migration records before/after changes. Tests check referential integrity, corrected locators, null-score handling, all-obligation network coverage, DGE identity in the inventory layer, source associations and absence of an invalid SPAR subtraction.

## Network semantics

The computed graph contains obligations and instruments linked by candidate-provision records. All 45 registry obligations are retained, including those with no candidate. The width of an edge represents the number of mapping records for that obligation–instrument pair, not legal strength or actual information flow.

An actor overlay links inventory entries to instruments cited in their source metadata. This is a documentary association. It does not mean the actor issued the instrument, can amend it, has every duty associated with it, or actually cooperates with other actors. DGE appears separately after correcting the source-name alias matching.

Degree counts distinct associations. Mode-specific denominators are disclosed. Any centrality, community or random-baseline calculations concern this documentary graph; they cannot establish political authority, influence, performance or cascade failure.

The separate legal-relations table identifies source actor, recipient, action, provision, locator and scope. The initial four entries include the domestic notification chain, Health Ministry information to SRE under Article 10, and aircraft/maritime declaration duties. They are source-supported legal relations, not observed exchanges or a complete directed dependency network.

## SPAR and NormTrace are not interchangeable measures

The previous subtraction of a 34% NormTrace value from a 60% SPAR value is not a valid preparedness difference: the constructs, units and denominators were not shown to be equivalent. Current outputs set comparison fields to null and do not display a point difference. The stored SPAR series is available only as contextual project data, with edition and provenance limitations. No cross-edition historical mean is presented as a like-for-like measure.

## Role of AI and review

AI assisted retrieval, extraction and organization. It is not a legal authority. This targeted audit corrected identifiable source errors; it is not independent expert certification of the resulting dataset. Source verification, legal interpretation and observed implementation are separate stages of evidence. A future legal review should follow references, assess scope and exceptions, examine the applicable domestic hierarchy and record the reasoning for each score, if scoring is retained.

## References and version history

See the official sources linked above and `/audit` for record-level corrections. The earlier Zenodo DOI refers to the original deposited release; this source-correction version must not be represented as an updated Zenodo deposit unless a new version is actually deposited. Superseded descriptions remain in Git history and the audit archive, not as current findings.
