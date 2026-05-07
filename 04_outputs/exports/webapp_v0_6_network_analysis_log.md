---
title: "NormTrace-IHR Mexico Pilot — Webapp v0.6 Network Analysis Build Log"
date: "2026-05-07"
pipeline: "build_mexico_ihr_network.py + Vite 5.4.x + React 18"
build_result: "SUCCESS"
---

> **Disclaimer:** Preliminary research draft for expert feedback. Not for citation, redistribution or public release without author permission.

# Webapp v0.6 — Network Analysis Build Log

## 1. Input Files

| File | Status | Rows | Size |
|------|:------:|-----:|-----:|
| ihr_2005_obligations.csv | ✅ FOUND | 45 | 75 KB |
| ihr_2024_changes.csv | ✅ FOUND | 57 | 53 KB |
| pandemic_agreement_obligations.csv | ✅ FOUND | 83 | 53 KB |
| pabs_draft_obligations.csv | ✅ FOUND | 38 | 37 KB |
| mexico_normative_corpus_index.csv | ✅ FOUND | 18 | 24 KB |
| mexico_health_governance_actors.csv | ✅ FOUND | 18 | 30 KB |
| mexico_legal_provisions.csv | ✅ FOUND | 110 | 172 KB |
| mexico_ihr2005_mapping.csv | ✅ FOUND | 80 | 47 KB |
| mexico_implementation_gap_map.csv | ✅ FOUND | 19 | 39 KB |

**Missing files:** None. All 9 input files resolved from data_package_v0_1.

Note: `_clean` suffixed filenames were tried first; all files found under plain names.

## 2. Nodes Generated

| Node Type | Count |
|-----------|------:|
| actor | 18 |
| domestic_provision | 111 |
| gap_type | 20 |
| ihr2005_obligation | 45 |
| ihr2024_change | 57 |
| implementation_domain | 14 |
| legal_instrument | 18 |
| pabs_draft_obligation | 38 |
| pandemic_agreement_obligation | 83 |
| **TOTAL** | **404** |

## 3. Edges Generated

| Relationship Type | Count |
|-------------------|------:|
| linked_to_implementation_domain | 119 |
| belongs_to | 110 |
| mentions_actor | 70 |
| linked_to_gap_type | 58 |
| grants_power_to | 48 |
| creates_duty_for | 45 |
| linked_to_ihr2024_change | 42 |
| coordinates_with | 41 |
| partially_anchors_obligation | 39 |
| creates_procedure_for | 36 |
| indirectly_anchors_obligation | 32 |
| has_legal_basis_in | 27 |
| anchors_obligation | 7 |
| requires_review_for | 2 |
| **TOTAL** | **676** |

## 4. Metrics Generated

- Computed for: **404 nodes**
- networkx version: available ✅
- Metrics: degree, weighted_degree, in_degree, out_degree, betweenness_centrality, eigenvector_centrality, component_id
- Eigenvector centrality: converged ✅
- Betweenness centrality: normalized=True, weight='weight'

## 5. Webapp JSON Exported

| File | Size |
|------|-----:|
| nodes.json | 336 KB |
| edges.json | 410 KB |
| metrics.json | 149 KB |
| summary.json | 7 KB |

Export path: `05_webapp/public/data/network/`

## 6. Network Analysis CSVs

| File | Rows | Size |
|------|-----:|-----:|
| network_nodes.csv | 404 | 185 KB |
| network_edges.csv | 676 | 181 KB |
| network_metrics.csv | 404 | 64 KB |
| network_summary.md | — | 5 KB |
| network_methodology.md | — | 8 KB |

## 7. Build Result

```
> normtrace-ihr-webapp@0.6.0 build
> vite build

vite v5.4.x building for production...
✓ 32 modules transformed.
dist/index.html              0.42 kB │ gzip:  0.29 kB
dist/assets/index-*.css      0.20 kB │ gzip:  0.19 kB
dist/assets/index-*.js     164.21 kB │ gzip: 51.60 kB
✓ built in 2.28s
```

**Result: SUCCESS**

Build note: `npm install` was run in `/tmp/normtrace_webapp_build` due to EPERM symlink
restrictions on the macOS-mounted project volume. Compiled `dist/` was then copied to
`05_webapp/dist/`. Source files remain in `05_webapp/src/`. To rebuild:
```bash
cp -r 05_webapp/src /tmp/build && cp 05_webapp/package.json 05_webapp/vite.config.js \
    05_webapp/index.html /tmp/build && cd /tmp/build && npm install && npm run build
cp -r /tmp/build/dist/* 05_webapp/dist/
```

## 8. Webapp — Actors Explorer Features

### Tabs delivered
| Tab | Status | Description |
|-----|:------:|-------------|
| Actor Inventory | ✅ | Filterable table of 18 actors with degree/betweenness metrics; sortable columns |
| Relationship Map | ✅ | Summary cards, edge-type bar chart, node-type distribution, obligation anchor counts, edge browser (300-row cap, filterable by rel-type / layer / label) |
| Network Metrics | ✅ | Top actors and instruments bar charts from metrics.json; full sortable/filterable metrics table |

### Caution notice
All three tabs display a corpus-derived caution banner:
> "Corpus-derived network — not an operational coordination map. Centrality scores measure
> legal-institutional salience in the available documentation, not real-world power or influence.
> All data: preliminary_ai_assisted · requires_human_review."

## 9. Known Limitations

| ID | Severity | Description |
|:--:|:--------:|-------------|
| L-01 | HIGH | Actor matching uses substring matching on actor name vs. provision text. Links where names are abbreviated or paraphrased may be missed (false negatives). |
| L-02 | HIGH | All 18 actors are federal-level. State-level health actors (32 Secretarías de Salud Estatales) are absent from the corpus and therefore absent from the network. Federal-state gap is modelled as an analytical inference, not a traced edge. |
| L-03 | HIGH | All mapping rows are preliminary_ai_assisted. Network centrality scores inherit all mapping uncertainties. |
| L-04 | HIGH | PABS nodes and all PABS edges are based on the IGWG Bureau draft of 9 March 2026. These are provisional and will need to be rebuilt after PA adoption. |
| L-05 | MEDIUM | IHR 2024 change-to-obligation links: 12 rows in ihr_2024_changes.csv were algorithmically reconstructed. Links for these rows should be verified against WHA77 official text. |
| L-06 | MEDIUM | Webapp does not include a force-directed graph visualisation. Edge browser provides table-based network exploration. A D3/Cytoscape visual layer can be added in a future iteration using the nodes.json and edges.json already in place. |
| L-07 | LOW | npm install cannot be run directly in the macOS-mounted project directory (EPERM on symlinks). Build must be performed in /tmp as documented above. |
| L-08 | LOW | `eigenvector_centrality` converged on the current graph. Convergence may fail if the graph becomes sparser in future iterations; handled gracefully in pipeline (skips with note). |

---

*Generated: 2026-05-07 · NormTrace-IHR Mexico Pilot v0.1 · Network Analysis Pipeline v0.1*
*All network data: preliminary_ai_assisted · requires_human_review*
