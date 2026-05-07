---
title: "NormTrace-IHR Mexico Pilot — Network Analysis Methodology"
version: "0.1"
date: "2026-05-07"
pipeline: "build_mexico_ihr_network.py"
---

# Network Analysis Methodology

## 1. What This Network Represents

The NormTrace-IHR legal-institutional network is a **corpus-derived traceability network**.
Each node and edge is derived directly from the NormTrace-IHR data package — the structured
tables built from the Mexico legal corpus and IHR mapping exercise. The network encodes
which legal instruments ground which actors, which domestic provisions anchor which IHR
obligations, and which IHR obligations connect to implementation domains and gap types.

**This is not an operational coordination network.** It does not represent observed
coordination, information flows, or political relationships. It represents what is
*traceable in the legal corpus* — no more, no less.

## 2. Data Sources

| Layer | Source File | Content |
|-------|------------|---------|
| Institutional actor layer | mexico_health_governance_actors.csv | 18 actors (13 federal + 5 international) |
| Domestic legal layer | mexico_legal_provisions.csv | 110 coded legal provisions |
| Domestic legal layer | mexico_normative_corpus_index.csv | 18 instruments in 5 normative tiers |
| Mapping layer | mexico_ihr2005_mapping.csv | 80 mapping rows (45 obligations × N provisions) |
| International normative layer | ihr_2005_obligations.csv | 45 IHR 2005 obligations |
| Update-review layer | ihr_2024_changes.csv | 57 IHR 2024 amendment changes |
| International normative layer | pandemic_agreement_obligations.csv | 83 PA obligations |
| International normative layer | pabs_draft_obligations.csv | 38 PABS draft provisions [PROVISIONAL] |
| Analytical assessment layer | mexico_implementation_gap_map.csv | 19 gap entries |

All source files are from the audited data package at:
`04_outputs/exports/data_package_v0_1/`

## 3. Node Construction Rules

Each node corresponds to a distinct entity in the NormTrace-IHR framework:

| Node Type | Construction Rule |
|-----------|------------------|
| `actor` | One node per row in actors table |
| `legal_instrument` | One node per row in corpus index |
| `domestic_provision` | One node per row in provisions table |
| `ihr2005_obligation` | One node per IHR 2005 obligation |
| `ihr2024_change` | One node per logged IHR 2024 change |
| `pandemic_agreement_obligation` | One node per PA article obligation |
| `pabs_draft_obligation` | One node per PABS draft provision |
| `implementation_domain` | One node per distinct domain token parsed from IHR obligations |
| `gap_type` | One node per distinct gap type appearing in mapping/gap map |

Nodes are assigned to one of five layers:
- `international_normative_layer` — IHR 2005, IHR 2024, PA, PABS
- `domestic_legal_layer` — instruments, provisions
- `institutional_actor_layer` — actors
- `analytical_assessment_layer` — domains, gap types
- `update_review_layer` — IHR 2024 changes

## 4. Edge Construction Rules

Edges are created only where the source data tables contain an explicit link:

| Rule | Source Field(s) | Relationship |
|------|----------------|-------------|
| A | actors.source_norm → corpus.norm_title | `has_legal_basis_in` |
| B | provisions.actor_mentioned → actors.actor_name | `mentions_actor` |
| B | provisions.power_granted | `grants_power_to` |
| B | provisions.duty_created | `creates_duty_for` |
| B | provisions.procedure_created | `creates_procedure_for` |
| B | provisions.coordination_mechanism | `coordinates_with` |
| C | provisions.norm_id → corpus.norm_id | `belongs_to` |
| D | mapping.domestic_provision_id + match_type | `anchors_obligation` / `indirectly_anchors_obligation` / `partially_anchors_obligation` / `requires_review_for` |
| D | mapping.gap_type → gap_type nodes | `linked_to_gap_type` |
| E | obligations.implementation_domain → domain nodes | `linked_to_implementation_domain` |
| G | ihr2024.relevant_ihr2005_obligation_id | `linked_to_ihr2024_change` |
| H | pa.implementation_domain → domain nodes | `linked_to_implementation_domain` |
| H | pa.possible_domestic_actor → actors | `linked_to_pandemic_agreement` |
| H | pabs.implementation_domain → domain nodes | `linked_to_pabs` |
| H | pabs.possible_domestic_actor → actors | `linked_to_pabs` |

**Actor matching** in Rules A and B uses substring matching on actor name / instrument title.
This may miss some links (false negatives) and should be validated by expert review.

**No edges are inferred** beyond what is explicitly present in the data fields listed above.

## 5. Edge Weights

Edge weights encode relationship strength:

| Relationship | Base Weight | Modifier |
|-------------|:-----------:|---------|
| `anchors_obligation` (direct statutory) | 3.0 | × (anchoring_level/5 + 0.2) |
| `indirectly_anchors_obligation` | 2.0 | × (anchoring_level/5 + 0.2) |
| `partially_anchors_obligation` | 1.5 | × (anchoring_level/5 + 0.2) |
| `requires_review_for` | 0.5 | fixed |
| `has_legal_basis_in` | 2.0 | fixed |
| `grants_power_to` | 2.0 | fixed |
| `creates_duty_for` | 1.5 | fixed |
| All others | 1.0 | fixed |

Weights are analytical proxies only. They should not be interpreted as measures of
legal force or institutional importance.

## 6. Centrality Interpretation

| Metric | What it measures in this network |
|--------|----------------------------------|
| `degree` | Number of direct legal-institutional links in the corpus |
| `betweenness_centrality` | How often a node lies on traceability paths between other nodes — a proxy for *legal-institutional bridge function* |
| `eigenvector_centrality` | Connectedness weighted by the connectedness of neighbours — a proxy for *systemic legal salience* |
| `in_degree` | How many corpus-documented provisions, instruments, or obligations point *to* this node |
| `out_degree` | How many traceability links originate *from* this node |

**Important:** High centrality means the node appears at many traceability junctions in
the *documented corpus* — not that the actor is powerful, influential, or effective
in practice. Gaps in the corpus will suppress centrality artificially.

## 7. Why This Network Supports Capacity-Building Entry-Point Identification

Nodes with high betweenness centrality are legal-institutional bridges: their removal or
dysfunction would sever multiple traceability chains simultaneously. These are candidate
entry points for legal reform, institutional strengthening, or technical assistance because:

1. Strengthening a high-betweenness actor or instrument would improve anchoring for multiple
   IHR obligations at once.
2. Provisions that anchor many obligations (high out-degree toward IHR layer) are load-bearing
   statutes whose gaps have systemic consequences.
3. IHR obligations with few or no anchoring links (low in-degree from domestic layer) are
   priorities for gap-filling reform.

This logic is *heuristic only*. Capacity-building decisions require expert validation,
political economy analysis, and country-context knowledge that the corpus does not contain.

## 8. Interpretation Limits

1. **Corpus completeness:** The corpus covers 18 federal instruments. State-level legislation
   (32 entities) is entirely absent. Federal-to-state gaps are inferred, not directly modelled.
2. **Actor matching accuracy:** Substring matching for actor names may miss links where names
   are abbreviated or paraphrased in provision text.
3. **PABS provisional status:** All PABS nodes and edges should be treated as analytical
   placeholders pending PA adoption.
4. **IHR 2024 link quality:** 12 rows in ihr_2024_changes.csv were algorithmically
   reconstructed from malformed source data. Links to IHR 2005 obligations in these rows
   should be verified against the official WHA77 amendment text.
5. **All mapping data is preliminary_ai_assisted:** No row has been verified by a human
   expert. Centrality scores derived from this data inherit all mapping uncertainties.

---

*Generated by build_mexico_ihr_network.py · 2026-05-07*
