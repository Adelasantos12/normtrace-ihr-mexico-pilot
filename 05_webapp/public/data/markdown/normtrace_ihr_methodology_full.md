# NormTrace-IHR Mexico: method and limits after the October 2026 source audit

Working correction release **0.1.1-audit.20261014**, dated 14 October 2026. This is a preliminary, single-coder, AI-assisted research pilot. Targeted source checking is not independent expert legal validation, a compliance assessment, or evidence of operational performance.

## The question and unit of analysis

The pilot organizes 45 selected requirements and powers extracted from the IHR 2005. These are researcher-defined analytical units, not a claim to enumerate every operative duty of the Regulations. The separate IHR 2024, Pandemic Agreement and PABS registries have different units and dates; they must not be combined with the baseline count or treated as interchangeable operative obligations.

A correspondence links one selected requirement to a particular domestic provision. An instrument may support several correspondences; an obligation may need multiple provisions read together. Counting a row, a distinct obligation and a legal instrument answers three different questions.

## Current scope and counts

| Unit | Correction release |
|---|---:|
| Selected IHR 2005 requirements | 45 |
| Corpus instruments | 18 |
| Extracted domestic provisions | 117 |
| Provision-level correspondences | 94 |
| Actor profiles retained, including review-sensitive profiles | 18 |
| Selected requirements in the targeted reassessment cohort | 15 |

These counts are generated and checked against the canonical data by `build_audit_manifest.py`. The manifest publishes the input hashes and each review cohort’s identifiers. Cohorts may overlap. The 15 requirements identify reassessment work; they are not 15 proven deficits.

The corpus is federal/national. State legislation, federal-state agreements, administrative practice, judicial interpretation and the referred international surveillance manual have not been comprehensively examined. An absent corpus match is not proof that a legal basis or a working procedure does not exist.

## Source corrections implemented

**SINAVE.** The express statutory mandate to establish and operate SINAVE is in General Health Law Article 133(II). Article 134 concerns surveillance, prevention and control of listed communicable diseases. The former mapping incorrectly described those disease categories as functional surveillance steps. The corrected corpus retains the Article 134 record and adds the appropriate Article 133(II) reference.

**Notification and referrals.** Final NOM-017-SSA2-2012, published on 19 February 2013, includes responsibilities across technical-administrative levels (6.6.3), a referral to IHR criteria and an international surveillance manual (6.6.4), and domestic immediate notification to DGE within 24 hours of knowledge (8.1.4). The original audit URL pointed to the 2012 PROY-NOM consultation draft. This release corrects the source to the final published NOM. Domestic knowledge-based notification and the international IHR assessment-based deadline must be evaluated separately.

**Charges to travellers.** Article 7 of the international health regulation establishes gratuity with exceptions. A relevant candidate provision is therefore identified for IHR Article 40. The previous `NO_MATCH_IDENTIFIED` conclusion is withdrawn. The exceptions and complete scope still require legal assessment; no replacement compliance score is invented.

**Aircraft and maritime declarations.** Articles 30 and 31 identify submitters, arrival/landing timing and IHR-form references. Previous absence claims based on Article 9 alone are withdrawn. Whether the referrals meet all current annex requirements remains to be examined.

## Referrals, absent matches and legal judgments

| Record status | Meaning | What must not be inferred |
|---|---|---|
| Source text checked | The relevant official text/locator was checked | Complete legal adequacy or compliance |
| Manual review pending | A legal text expressly refers to a document not yet assessed | No procedure exists |
| Scope review pending | A relevant provision exists, but its coverage or exceptions need analysis | Full compliance, or full legal gap |
| Legacy preliminary | Earlier coder assessment retained without revalidation in this targeted audit | Confirmed current finding |
| Reassessment required | A source correction affects the previous assessment | Zero score or failure in practice |
| No reference recorded | No match is recorded within this corpus | No legal basis anywhere in the legal system |

For a referral, record the referring provision, the referred instrument, the legal task and the review status. A new regulation or statute should only be recommended after checking competence, enabling provisions, relevant referrals and the complete legal framework. A statute is not always necessary, and a sub-statutory provision is not insufficient merely because of its form or age.

## Scoring and aggregation

The pilot’s former anchoring scale and prose were not consistently aligned. In this correction release, affected current `anchoring_level` fields are blank; their former values remain in `legacy_anchoring_level` and the archived baseline. An empty current score means **pending**, never zero. Remaining earlier row codes are labeled legacy and unvalidated.

Current mean anchoring, legal-anchoring percentages and complete-pathway counts are withheld. The former counts of 18 procedural/coordination deficits, seven federal-state deficits, two complete pathways and six deficient instruments are not carried forward as validated results. Two rows labeled `none` cannot establish two fully complete obligations where other rows retain unresolved dimensions.

Recalibration must specify the construct, the applicable legal requirement, how several provisions jointly cover it, treatment of non-applicable dimensions and unresolved sources, and the rule for aggregation. Reproducible row counts are not a substitute for that legal judgment.

## The documentary network

The computed graph is an **instrument–requirement network with an actor-profile association layer**. The instrument–requirement edge means a correspondence cites that instrument, including candidate sources under review. Its provenance includes mapping and provision identifiers. All registry obligations remain visible, including isolated nodes.

An actor–instrument association means that the actor profile cites the instrument. Exact source aliases in `actor_instrument_associations.csv` replace the former first-30-character substring rule. The DGE is now included separately through its NOM-017 and Interior Regulation references. Profiles with unresolved institutional identity are excluded from this network but retained in the inventory.

An actor’s two-hop reach through shared instruments is **documentary reach**, not the number of obligations assigned to that actor. It is not evidence that the actor can issue those instruments, control other actors, or coordinate effectively. The issuing authority recorded in an instrument’s metadata is a separate field and requires its own legal verification.

All displayed edges have equal weight. Unvalidated legal scores no longer determine thickness or force strength. Degree counts associations; normalization uses the opposite mode’s node count. Projection communities describe shared documents, not functioning policy communities. The random-graph comparison is descriptive and does not establish political power, resilience, nonlinear behavior or cascade failure. The earlier curated coordination diagrams and operational/CAS conclusions are archived, not presented as current measured findings.

A directed institutional dependency requires a separately evidenced relation: both actors, the specific required input or action, the source clause and temporal scope. That relation cannot be inferred solely from both actors appearing in one law. Actual cooperation requires separate administrative or empirical evidence.

## SPAR and legal mapping

SPAR second edition already requests national and subnational legal mapping/assessment through C1.1 and addresses focal-point mandates/functions in C2.1. NormTrace should be understood as a way to organize inspectable provision-level evidence, not as discovery of a legal dimension absent from SPAR.

The SPAR country-level capacity score and the pilot’s legal codes do not have equivalent constructs or denominators. Their subtraction is removed: no 26-point or historical-mean divergence is calculated. The SPAR page retains 2021–2025 second-edition observations as reported values from the source dataset. The earlier series is preserved for provenance, not pooled across changes in the reporting instruments. The 2026 revision requires a separate crosswalk.

## National IHR Authority

PAHO’s CD63/INF/1, dated 21 August 2026, paragraph 17, reports that Mexico had confirmed designation or establishment of a National IHR Authority by 15 July 2026. The report does not identify the Mexican institution or its domestic designation instrument. Both remain pending retrieval in this dataset.

DGE’s National Focal Point role does not identify it as the new Authority. Amended IHR Article 4 permits one or two entities and refers to legislative and/or administrative arrangements as appropriate; it does not universally require designation by statute. A reported designation and the domestic legal effects of its mandate are different evidentiary questions.

## AI assistance, review and reproducibility

AI assists with search, organization and preliminary coding; it is not a source of legal authority. This audit checks specified source errors and corrects invalid inferences. It does not retroactively certify every legacy extraction or recode all 45 requirements as legally validated.

Canonical CSVs are under `03_tables`. The webapp and export tables are synchronized with them. Network construction, SPAR context and audit statistics have deterministic builders. Validation checks identifiers, mirrors, graph endpoints, review-cohort membership, score absence handling and withdrawn-claim regressions. Browser tests check navigation, source visibility, pending labels, network selection and the SPAR comparison removal. Build/test success certifies technical consistency, not substantive legal validity.

Historical records are preserved in `99_archive/audit_2026_10_14`. The earlier Zenodo DOI identifies its archived version, not automatically this working correction release.

## Sources

- [Final NOM-017-SSA2-2012, DOF 19 February 2013](https://sidof.segob.gob.mx/notas/docFuente/5288225), especially 6.6.3, 6.6.4 and 8.1.4.
- [General Health Law](https://www.diputados.gob.mx/LeyesBiblio/pdf/LGS.pdf), Articles 133(II) and 134.
- [International health regulation](https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LGS_MSI.pdf), Articles 7, 30 and 31.
- [SPAR second edition](https://cdn.who.int/media/docs/default-source/health-security-preparedness/cap/spar/9789240040120-eng-new.pdf), C1.1 and C2.1.
- [IHR consolidated text](https://apps.who.int/gb/bd/pdf_files/IHR_2014-2022-2024-en.pdf), Article 4.
- [PAHO CD63/INF/1](https://iris.paho.org/bitstreams/7c461167-1eae-4e58-ad9c-d8ba8338c9dc/download), paragraph 17.
