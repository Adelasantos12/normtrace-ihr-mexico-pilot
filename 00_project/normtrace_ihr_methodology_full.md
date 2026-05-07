# Methodology

## Executive summary

### What this methodology solves
> - Existing IHR monitoring tools are useful but do not fully reconstruct domestic legal anchoring.
> - SPAR is standardized and recurrent but self-reported.
> - JEE, AAR and SimEx add external and functional assessment layers but do not map each international obligation to domestic legal authority, actors, procedures and safeguards.
> - NormTrace-IHR adds a country-specific legal-institutional conversion layer.
> - The output is not a compliance score; it is a traceability and review infrastructure.

NormTrace-IHR does **not** replace IHR monitoring instruments. It complements them by adding a legal-institutional conversion layer between international obligations and reported capacities.

## Methodological problem

International obligations are monitored, but domestic legal conversion is often opaque. Reporting frameworks capture performance signals, yet they do not always reconstruct which legal instruments actually authorize action.

Self-reported capacity can diverge from legally anchored capacity. In practice, an authority may perform a function de facto without a stable de jure legal basis, reducing predictability, reviewability and institutional continuity.

Capacity-building needs more specific information about domestic legal instruments, actors, competences, procedures, coordination and safeguards. NormTrace-IHR addresses this by identifying legal anchors, institutional responsibilities, procedural routes and oversight needs obligation by obligation.

## Conceptual model

**Workflow:** International obligation → legal anchoring need → domestic legal corpus → country legal brain → provision extraction → actor and competence mapping → anchoring assessment → gap typology → capacity-building entry point

- **International obligation**: identify the exact duty in IHR (2005/2024) or Pandemic Agreement/PABS-related text.
- **Legal anchoring need**: determine the type of domestic legal basis required for implementation.
- **Domestic legal corpus**: assemble national legal sources to test legal internalisation.
- **Country legal brain**: apply country-specific constitutional and administrative logic before mapping.
- **Provision extraction**: isolate norm units (articles, fractions, numerals, transitories).
- **Actor and competence mapping**: identify legally empowered actors and their competences.
- **Anchoring assessment**: classify legal anchoring strength using explicit scale criteria.
- **Gap typology**: characterize the specific type of legal-institutional deficit.
- **Capacity-building entry point**: identify concrete legal, institutional or procedural reform levers.

## Analytical layers

| Layer | Question | Input | Output |
|---|---|---|---|
| IHR obligation classification | What exactly is required? | IHR 2005/2024 text | Classified obligation set |
| Domestic legal corpus | Which legal sources are in scope? | Laws, regulations, agreements, NOMs | Structured national corpus |
| Mexico legal system profile | How does authority flow domestically? | Constitutional and administrative architecture | Country legal brain rules |
| Legislative drafting patterns | How are duties/powers expressed in legal drafting? | Drafting formulas and legal syntax | Pattern library |
| Domestic provision extraction | Where are relevant provisions located? | Structured corpus | Provision-level dataset |
| Actor and competence mapping | Who can do what legally? | Provisions + institutional references | Actor-competence map |
| Legal anchoring assessment | How strong is legal anchoring? | Mapping rules + extracted provisions | Anchoring level (0-5) |
| IHR 2024 update layer | What requires adaptation under 2024 amendments? | IHR 2024 amendments | Update-review flags |
| Pandemic Agreement / PABS readiness layer | What is legally pre-positioned for PA/PABS? | PA/PABS-related obligations | Readiness mapping |
| Technical validation | Is the dataset coherent and auditable? | Validation scripts and checks | Audit outputs |

## Why this is not keyword matching

**Note:** NormTrace-IHR does not simply match words between the IHR and Mexican laws. It first reconstructs Mexico’s constitutional, federal, administrative, health-governance and regulatory architecture. Matching is then performed within that country-specific legal logic.

## Country-specific legal brain

| Component | Why it matters for IHR mapping |
|---|---|
| constitutional architecture | Defines foundational powers, limits and legal validity routes. |
| treaty effect | Clarifies how international obligations enter domestic law. |
| legal hierarchy | Distinguishes legal force between laws, regulations, NOMs and agreements. |
| federalism | Determines distribution of competences across federal and subnational levels. |
| health governance | Locates sector-specific mandates and institutional authority chains. |
| public administration | Frames delegation, procedure and administrative execution powers. |
| regulatory instruments | Identifies operational legal vehicles beyond primary legislation. |
| legislative drafting patterns | Interprets legal effect of drafting formulas in Mexican normative practice. |
| oversight and accountability | Identifies review, control and safeguard mechanisms. |
| legal anchoring rules | Applies consistent criteria for classifying anchoring strength. |

## Source corpus workflow

1. Convert legal sources to Markdown.
2. Create metadata.
3. Classify instrument type.
4. Classify normative hierarchy.
5. Classify sector/legal domain.
6. Detect structure.
7. Extract provisions.
8. Link provisions to actors and obligations.
9. Validate IDs and references.
10. Generate outputs.

| Corpus field | Purpose |
|---|---|
| instrument_type | Identify the legal instrument class. |
| normative_hierarchy | Locate the instrument within legal hierarchy. |
| sector/legal_domain | Tag substantive legal domain for routing and analysis. |
| issuing_authority | Track formal authority behind the instrument. |
| government_level | Distinguish federal/state/local legal anchoring routes. |
| legal_function | Classify legal role (e.g., governance, surveillance, response). |
| publication_date | Establish legal currency timeline. |
| last_amendment_date | Detect recency and update pressure. |
| source_status | Track validity status (active/reformed/repealed). |
| relevance_for_ihr | Mark direct/indirect relevance to IHR obligations. |
| relevance_for_pandemic_agreement | Mark relevance to Pandemic Agreement/PABS readiness. |

## Legislative pattern extraction

| Pattern detected | Analytical use |
|---|---|
| Articles, fractions, paragraphs | Define extraction units and legal granularity. |
| Transitory provisions | Capture implementation timelines and conditional effects. |
| “corresponde a” | Indicates core competence assignment. |
| “son atribuciones de” | Signals formal attribution of powers/duties. |
| “deberá” | Indicates mandatory duty. |
| “podrá” | Indicates discretionary authority. |
| “se coordinará” | Indicates coordination mechanism expectations. |
| “en el ámbito de sus competencias” | Indicates competence boundaries and federal distribution. |
| “sin perjuicio de” | Indicates coexistence of competences and non-exclusion logic. |
| “conforme a las disposiciones aplicables” | Indicates dependency on complementary regulatory frameworks. |
| NOM numerals | Capture technical-operational norm references. |
| regulations and internal regulations | Capture administrative operationalization routes. |
| administrative agreements | Capture inter-institutional delegation or procedural implementation. |

## Obligation classification rules

| Trigger | Likely anchoring implication |
|---|---|
| designated national authority | Requires explicit legal designation and scope. |
| duties for public authorities | Requires clear competence and duty language. |
| obligations for private actors | Requires legal basis with enforceability structure. |
| restrictions on persons/travellers/goods | Requires legality, proportionality and safeguard framing. |
| coercive or sanitary measures | Requires authority, procedure and rights safeguards. |
| sensitive data processing | Requires legal basis, purpose limitation and safeguards. |
| mandatory information exchange | Requires legal channels, responsibilities and conditions. |
| federal-state coordination | Requires vertical coordination architecture. |
| recurrent institutional capacity | Requires durable legal-institutional embedding. |
| budgetary or planning implications | Requires planning/budget linkage or financing basis. |
| reviewable procedures | Requires administrative/legal review pathways. |
| rights safeguards | Requires due process and accountability mechanisms. |
| laboratories/pathogens/biosafety/benefit-sharing | Requires specialized legal-technical framework anchoring. |

## Anchoring scale

| Level | Label | Meaning | What it does not mean |
|---|---|---|---|
| 0 | No anchoring | No identifiable legal-institutional anchor in available corpus. | It does not prove operational absence. |
| 1 | Actor mention only | Institution appears but duty/function is not anchored. | It does not imply legal sufficiency. |
| 2 | Indirect anchoring | Function inferred through broad mandate language. | It does not imply procedural clarity. |
| 3 | Administrative anchoring | Function anchored in administrative/sub-legal instruments. | It does not imply statutory depth. |
| 4 | General statutory anchoring | Function recognized in statutory text at general level. | It does not imply complete operational design. |
| 5 | Specific legal-institutional anchoring | Function anchored with identifiable legal authority and operative framing. | It does not measure real-world compliance/performance. |

> **Emphasis:** The scale measures identifiable legal-institutional anchoring in the available corpus. It does not measure compliance or actual operational performance.

## Gap typology

| Gap type | What it means | Why it matters |
|---|---|---|
| legal silence | No legal anchor identified. | Leaves obligations without clear domestic legal basis. |
| competence ambiguity | Roles or powers are unclear/overlapping. | Increases implementation friction and accountability risk. |
| administrative-only anchoring | Anchoring exists mainly at sub-statutory level. | May reduce stability and enforceability. |
| procedural gap | Duties exist without clear execution procedure. | Weakens implementation reliability and legal certainty. |
| coordination gap | Coordination routes are absent/underdefined. | Undermines multi-actor response coherence. |
| federal implementation gap | National and subnational anchoring is uneven. | Limits territorial consistency and readiness. |
| rights-safeguard gap | Restrictive powers lack sufficient safeguards. | Raises proportionality and rights-protection concerns. |
| oversight gap | Limited review/control mechanisms. | Reduces transparency and corrective capacity. |
| budget/capacity gap | Legal duties exceed institutional resource design. | Creates implementability risk. |
| update-review needed | Anchoring exists but requires alignment updates. | Supports forward compatibility with evolving norms. |

## Role of SPAR, JEE, AAR and SimEx

| Tool | What it captures | Main limitation for legal anchoring | How NormTrace complements it |
|---|---|---|---|
| SPAR | Recurrent standardized self-reporting of capacities. | Self-reported and not obligation-by-obligation legal reconstruction. | Adds legal traceability of domestic anchors per obligation. |
| JEE | External technical assessment of core capacities. | Voluntary and not designed for complete legal architecture reconstruction. | Adds country-specific legal-institutional conversion detail. |
| AAR | Post-event functional learning. | Event-centered, not systematic legal mapping framework. | Connects lessons to legal anchors and reform pathways. |
| SimEx | Operational simulation testing. | Performance-focused snapshot without full legal reconstruction. | Identifies legal/institutional levers behind tested gaps. |
| NormTrace-IHR | Legal-institutional traceability infrastructure. | Corpus-dependent and requires expert interpretation. | Complements monitoring tools with obligation-level legal conversion layer. |

SPAR is useful, standardized and recurrent, but self-reported. JEE, AAR and SimEx are complementary and valuable, but they do not systematically reconstruct domestic legal architecture obligation by obligation.

## Use of Python, AI and human review

| Function | Tool | Output | Human review needed? |
|---|---|---|---|
| data cleaning | Python | clean CSVs | yes (spot-check) |
| schema validation | Python | validation logs | yes (exception review) |
| referential integrity | Python | audit reports | yes (interpretation review) |
| source structuring | AI-assisted | Markdown and metadata drafts | yes |
| pattern detection | AI-assisted | legal drafting patterns | yes |
| provision extraction | AI-assisted | preliminary provision tables | yes |
| obligation mapping | AI-assisted + rule-based review | preliminary mappings | yes |
| legal validation | human expert | validated interpretation | yes (final authority) |

**Emphasis:** AI is used for assisted structuring and preliminary classification, not as final legal authority.

## Workflow diagram

**Workflow layer:** International Instrument → Obligation Classification + Domestic Legal Corpus → Mexico Legal Brain → Provision Extraction → Legal Anchoring Assessment → Gap Typology → Capacity-Building Entry Points (+ IHR 2024 update layer, + Pandemic Agreement/PABS readiness).

## Limits

- corpus-limited
- preliminary
- AI-assisted
- not legal advice
- not compliance assessment
- requires expert validation
- PABS provisional until final annex
- does not measure actual operational performance

## References

1. World Health Organization. *International Health Regulations (2005)*.
2. World Health Organization. *Amendments to the International Health Regulations (2005), 2024 package*.
3. World Health Organization. *SPAR framework and reporting guidance*.
4. World Health Organization. *Joint External Evaluation (JEE) tools and guidance*.
5. World Health Organization. *After Action Review (AAR) guidance*.
6. World Health Organization. *Simulation Exercise (SimEx) guidance*.
7. Draft texts and negotiation materials related to the WHO Pandemic Agreement and PABS discussions (status-dependent).

## Technical audit summary

- Verdict: **PASS_WITH_DOCUMENTED_FINDINGS**.
- Scope: schema validation, unique IDs, cross-reference integrity, anchoring scale compliance.
- Interpretation: audit findings are documented and integrated as caveats/warnings in analysis outputs.
- Positioning note: this audit summary is supporting technical context and is not the main methodology.
