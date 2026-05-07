# Methodology

## 1. What NormTrace-IHR does
NormTrace-IHR is a country-specific legal-institutional mapping infrastructure. It does not assess whether a State complies or does not comply with international law. Instead, it examines whether international health obligations have identifiable domestic legal, regulatory, administrative, institutional, procedural, budgetary, coordination and oversight anchors.
The core analytical question is not: “Is Mexico compliant with the IHR?” The question is: “Where, how, through which domestic legal instruments, and under which institutional competences can IHR-related obligations be traced inside Mexico’s legal system?”
This distinction matters because international legal commitments do not operate domestically through ratification or reporting alone. Their practical effect depends on legal incorporation, institutional mandates, administrative authority, procedures, information systems, coordination rules, rights safeguards, budgetary arrangements, oversight mechanisms and the continuity of administrative practice.

## 2. The measurement gap addressed by NormTrace-IHR
The International Health Regulations (2005) require States Parties and the WHO Director-General to report to the World Health Assembly on implementation. The WHO States Parties Self-Assessment Annual Reporting tool (SPAR) was designed to support this reporting obligation and to allow the WHO Secretariat to compile consistent annual information across States Parties. 
SPAR is useful because it creates a recurrent, standardized and globally comparable reporting mechanism. However, it remains a self-assessment tool. It does not, by itself, reconstruct the domestic legal basis that enables or limits implementation. Nor does it systematically identify whether a reported capacity is grounded in statute, regulation, administrative practice, intergovernmental coordination, budget allocation, or informal institutional routines.
The Joint External Evaluation (JEE), After Action Reviews (AAR) and Simulation Exercises (SimEx) add complementary layers to the IHR Monitoring and Evaluation Framework. WHO describes the IHR-MEF as including mandatory SPAR and voluntary tools such as external evaluation, AAR and SimEx.  These instruments are important because they broaden assessment beyond self-reporting and can capture functional performance, external expert judgment and operational learning.
Yet a residual gap remains: the legal-institutional conversion gap. Existing IHR monitoring tools can indicate whether capacities are reported, evaluated or tested, but they do not systematically show how each international obligation is converted into domestic legal authority, institutional responsibility, administrative procedure, coordination rule and accountability mechanism.
NormTrace-IHR addresses this gap. It provides a structured legal-institutional layer between international obligation and reported capacity.

## 3. Why self-reported capacity is not enough
NormTrace-IHR starts from the premise that reported preparedness and legally anchored preparedness are related but not identical.
Recent empirical work comparing SPAR and JEE shows that SPAR scores have often been higher than JEE scores, although the level of alignment has improved in recent tool editions. The uploaded 2026 study comparing SPAR and JEE across 108 paired assessments from 93 States Parties found that SPAR scores were, on average, higher than JEE scores, with the largest disagreements observed around intermediate capacity levels. The same study notes that there is no single gold standard for measuring public health security capacities, and that SPAR reliability depends partly on the focal point’s familiarity with the tool and the extent of subnational and multisectoral involvement.  [oai_citation:1‡main-2.pdf](sediment://file_000000000b8871fb9f659d942823fd7c)
This matters for legal-institutional analysis. A country may report that a capacity exists, while the legal architecture supporting that capacity may be partial, fragmented, administrative-only, dependent on a specific office, or vulnerable to institutional turnover. Conversely, a country may have formal legal authority on paper, while implementation remains constrained by budget, administrative capacity, coordination gaps, incomplete procedures or uneven territorial execution.
NormTrace-IHR therefore does not treat self-reported capacity as sufficient evidence of legal internalisation. It treats reporting data, legal texts, institutional mandates and domestic administrative architecture as distinct but complementary forms of evidence.

## 4. Theoretical basis
NormTrace-IHR draws on four bodies of literature.
First, transnational legal process scholarship emphasizes that international norms become effective through interaction, interpretation and internalisation within domestic legal and institutional systems. Koh’s account of legal internalisation is especially relevant because it treats domestic law, institutions and repeated practice as central to explaining how international obligations acquire operational meaning inside States.
Second, compliance and domestic politics scholarship shows that implementation is mediated by domestic institutions, political incentives, information, accountability and legal mobilisation. Dai’s domestic constituency mechanism highlights the role of domestic accountability and information channels, while Simmons shows that international legal commitments can shape domestic politics through legal mobilisation, institutional agendas and rights-claiming processes.
Third, implementation studies show that policy execution is affected by administrative complexity, fragmented authority, frontline discretion, resources, institutional memory and coordination problems. In practice, implementation can fail not only because a State rejects a commitment, but because the domestic system lacks stable legal authority, clear procedures, trained personnel, budgetary continuity, institutional incentives or intergovernmental coordination.
Fourth, comparative institutional analysis explains why the same international obligation may require different domestic anchoring strategies across countries. Federalism, executive-legislative relations, administrative legality, regulatory design and oversight institutions affect how international obligations are translated into domestic law and public administration. For that reason, a mapping logic that works for Mexico cannot be transferred automatically to Switzerland, Germany, Venezuela or any other country without first reconstructing each country’s legal-institutional architecture.

## 5. Why a country-specific “legal brain” is required
NormTrace-IHR begins by constructing a country legal system profile before any obligation-mapping is performed. This profile functions as the Mexico-specific legal reasoning layer.

For Mexico, the profile covers:
- constitutional architecture;
- federalism and distribution of competences;
- treaties and domestic legal effect;
- hierarchy of legal instruments;
- health governance architecture;
- federal public administration;
- regulatory and administrative instruments;
- legislative drafting patterns;
- oversight and accountability mechanisms;
- rules for determining when an international obligation requires statutory, regulatory, administrative or operational anchoring.

This step is necessary because domestic legal implementation is not a generic word-matching exercise. Mexican legal texts use specific legislative forms: articles, fractions, paragraphs, transitory provisions, regulations, internal regulations, official standards, administrative agreements, programmes and technical instruments. They also distribute authority across federal institutions, federal entities, sanitary authorities, administrative bodies, oversight institutions and rights-protection mechanisms.
The country legal brain is therefore not an artificial intelligence model in the autonomous sense. It is a curated legal-institutional knowledge layer that allows AI-assisted extraction and classification to operate within the logic of the Mexican legal system rather than through generic semantic similarity.

## 6. Source corpus construction

The first empirical layer is the domestic legal corpus. For the Mexico pilot, legal instruments were converted into structured Markdown and paired with metadata. Each instrument is classified by:
- instrument type;
- normative hierarchy;
- sector or legal domain;
- issuing authority;
- government level;
- territorial scope;
- legal function;
- publication date;
- last amendment date;
- source status;
- relevance for IHR and pandemic governance.

This corpus is expandable. New laws, regulations, official standards, administrative agreements, jurisprudence, budgetary instruments, planning documents or subnational laws can be added through the same workflow: Markdown source, metadata file, corpus index entry and review status.
The purpose of the corpus is not to reproduce the entire Mexican legal system. It is to create a traceable legal-institutional basis for identifying provisions relevant to international health obligations.

## 7. Legislative structure and drafting-pattern extraction
Before extracting legal provisions, NormTrace-IHR identifies the structural and linguistic patterns of domestic legal texts. This step improves analytical stability because different legal systems encode obligations and competences differently.

For Mexico, the extraction logic detects:
- titles, chapters, sections, articles and transitory provisions;
- fractions, subsections, paragraphs and numerals;
- legal actors and competent authorities;
- powers, duties and discretionary faculties;
- procedures and administrative acts;
- intergovernmental or interinstitutional coordination;
- sanctions, enforcement powers or sanitary measures;
- rights safeguards;
- reporting or information-sharing duties;
- budgetary, planning or resource implications.

The system also identifies legal drafting markers such as “corresponde a”, “son atribuciones de”, “deberá”, “podrá”, “queda prohibido”, “se coordinará”, “en el ámbito de sus competencias”, “sin perjuicio de”, “conforme a las disposiciones aplicables” and “en términos de”. These markers help distinguish between a binding duty, a discretionary authority, a coordination clause, a procedural requirement or a contextual reference.
Artificial intelligence is used here as an assisted extraction and classification tool, not as an autonomous legal decision-maker. Its function is to accelerate structuring, pattern detection and preliminary coding. The legal interpretation remains subject to human review.

## 8. International obligation classification
The second analytical layer classifies IHR 2005 obligations according to whether they plausibly require domestic legal anchoring.
The IHR are legally binding on States Parties and provide the international legal framework for preventing and responding to the international spread of disease. The IHR 2005 include obligations relating to national focal points, surveillance, notification, verification, response capacities, points of entry, health measures, travellers, information-sharing, collaboration and review.
NormTrace-IHR classifies each obligation according to the kind of domestic anchoring it may require:
- statutory anchoring;
- regulatory anchoring;
- administrative anchoring;
- operational implementation only;
- context-dependent review.

An IHR obligation is treated as likely requiring stronger domestic legal or regulatory anchoring when it creates or implies:
- a designated national authority;
- legal duties for public authorities;
- obligations for private actors;
- restrictions affecting individuals, travellers or goods;
- coercive or sanitary enforcement measures;
- personal or sensitive data processing;
- mandatory information exchange;
- federal-state coordination;
- recurrent institutional capacity;
- budgetary or planning implications;
- procedures capable of external review;
- rights safeguards;
- laboratory, pathogen, biosafety or benefit-sharing implications.

An obligation may be coded as primarily operational when it can be implemented within existing authority, does not create new duties, does not affect rights or third parties, and can be addressed through technical protocols, administrative coordination or internal procedures.

## 9. Domestic provision extraction
The third layer extracts domestic provisions relevant to international health obligations. Each provision is coded by:
- norm;
- article or numeral;
- legal topic;
- actor mentioned;
- power granted;
- duty created;
- procedure created;
- coordination mechanism;
- enforcement or sanction;
- rights safeguard;
- budget or resource implication;
- relevance to IHR;
- relevance to the Pandemic Agreement;
- source and version.
This stage does not assess sufficiency. It only identifies possible domestic legal anchors.

## 10. Actor and competence mapping
The fourth layer identifies institutional actors and links them to legal mandates, functions and potential IHR relevance. The actor layer distinguishes between:
- institutional actors explicitly profiled in the actor table;
- actor mentions extracted from domestic legal provisions;
- actors linked to IHR mapping records;
- actors involved in coordination, oversight, reporting, rights safeguards, budget or international liaison.

The actor network is therefore a legal-institutional network, not an observed operational coordination network. It shows how the corpus links institutions, legal instruments and IHR responsibility areas.
This distinction is important in Latin American administrative settings, where the existence of a formal mandate may not guarantee operational continuity. Implementation may be affected by staff turnover, fragmented institutional memory, uneven subnational capacity, changes in administrative leadership, budgetary instability, incomplete documentation, weak coordination routines or discretionary interpretation by officials responsible for reporting. NormTrace-IHR does not measure these factors directly. Instead, it identifies where the legal-institutional architecture is robust, partial or dependent on further verification.

## 11. Legal anchoring assessment
The fifth layer maps international obligations against domestic legal provisions. Each mapping records:
- obligation;
- domestic provision;
- domestic norm;
- match type;
- anchoring level;
- actor fit;
- procedure fit;
- coordination fit;
- enforcement fit;
- rights-safeguard fit;
- federalism fit;
- gap type;
- confidence level;
- review status.

The anchoring scale is:
0 = no identifiable anchoring  
1 = indirect contextual anchoring  
2 = administrative or operational anchoring  
3 = partial statutory anchoring  
4 = strong statutory-administrative anchoring  
5 = integrated implementation anchoring

This scale does not measure compliance. It measures the degree to which the available domestic legal corpus identifies a legal-institutional basis for implementing or operationalising an international obligation.

## 12. Gap typology
NormTrace-IHR identifies several types of review needs:
- legal silence;
- competence ambiguity;
- administrative-only anchoring;
- procedural gap;
- coordination gap;
- federal implementation gap;
- rights-safeguard gap;
- oversight gap;
- budget or capacity gap;
- update-review needed.

These categories are diagnostic. They are intended to identify entry points for expert review, capacity-building, legal clarification and institutional strengthening.
The contribution is not to replace existing IHR monitoring. It is to make capacity-building more specific. Instead of asking only whether a country reports a capacity, NormTrace-IHR asks whether the domestic legal system identifies: who is responsible, where the mandate is located, whether the procedure exists, whether federal coordination is legally structured, whether rights safeguards are present, whether oversight is possible, and whether the obligation can survive administrative turnover.

## 13. IHR 2024 and Pandemic Agreement layers
The IHR 2005 mapping functions as a legal baseline. The IHR 2024 amendments and the WHO Pandemic Agreement are then analysed as update layers.
The IHR 2024 amendments introduce additional review pressure around pandemic emergencies, national IHR authorities, equitable access to relevant health products, core capacities, collaboration and assistance, financing, implementation review and points of entry. These changes do not eliminate the need to understand the domestic legal baseline; they make it more important.
The WHO Pandemic Agreement was adopted by the World Health Assembly in 2025. However, the Pathogen Access and Benefit-Sharing system remains dependent on a future annex. WHO states that once the PABS annex is adopted by the World Health Assembly, the Agreement will be open for signature and ratification according to domestic constitutional processes.  For that reason, PABS-related mapping is provisional and must be updated once the final annex is adopted.

## 14. Role of Python, AI and human review

Python is used for data cleaning, schema validation, reproducibility checks, referential integrity, audit logs, table transformation and report generation.
Artificial intelligence is used for assisted structuring, preliminary extraction, classification support, pattern detection and drafting of summaries. It is not treated as an authority on Mexican law, international law or compliance.
Human review remains necessary for:

- legal validity;
- interpretation of domestic provisions;
- assessment of sufficiency;
- identification of missing legal sources;
- confirmation of institutional practice;
- final policy or legal conclusions.

This design deliberately separates computational assistance from legal validation. The system can reveal where legal anchoring appears strong, partial, administrative-only or absent in the available corpus. It cannot, without expert review, determine final legal sufficiency or actual implementation performance.

## 15. Limits of the current version
This version is a preliminary expert-review pilot. It is corpus-limited, AI-assisted and not a legal opinion. It does not assess compliance, does not provide legal advice and does not claim to represent the full Mexican legal system.
Its value lies in making the domestic legal-institutional terrain visible, structured and auditable before claims are made about implementation, compliance, reform or capacity-building.
NormTrace-IHR should therefore be read as a bridge between international monitoring and domestic legal analysis. It helps narrow the gap between reported capacity and legally traceable implementation architecture. It does so from inside the country’s own legal system, rather than from a generic external checklist.
