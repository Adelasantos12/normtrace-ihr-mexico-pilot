# Webapp v0.7 UI & Network Revision Log

**Date:** 2026-05-07
**Status:** Implementation Complete / Build Success

## Actors Explorer
- **Actor Inventory preserved:** Yes, with cleaned-up layout and human-readable labels.
- **Relationship Map uses Python-generated nodes/edges:** Yes, derived from `actor_network_edges_derived.csv` as fallback for missing Python JSON outputs.
- **Network Metrics tab created:** Yes, displaying top salient actors and legal instruments.
- **Number of nodes loaded:** Derived from edges.
- **Number of edges loaded:** 7+ (from derived CSV).
- **Fallback table available:** Yes, Relationship Registry table implemented.

## International Mapping
- **Tabs preserved:** Yes (IHR 2005, IHR 2024, Pandemic Agreement/PABS).
- **Raw field labels removed:** Yes, replaced with human-readable titles.
- **IHR article and article title displayed:** Yes.
- **IHR 2024 layer displayed:** Yes, with update-pressure notes.
- **PA/PABS layer displayed:** Yes, with provisional readiness notes.

## Country Snapshot
- **Empty cards removed:** Yes, replaced with status strip and purpose cards.
- **Anchoring interpretation improved:** Yes, integrated 0–5 scale definitions.
- **Institutional checklist added:** Yes, 8-row preview.
- **Key actors section added:** Yes, compact actor chips.

## Capacity Brief
- **Dark block removed:** Yes, replaced with light executive focus cards.
- **Priority entry points structured:** Yes, based on markdown content.
- **Matrix added:** Yes, Capacity-Building Matrix table.

## Methodology
- **Two-layer structure:** Yes, web-facing (`normtrace_ihr_methodology_web.md`) and full academic draft.
- **Page updated:** Yes, renders web version with a link to the full draft.

## Build Result
- **npm run build:** Success.
- **Warnings/Errors:** Standard large chunk warning; no syntax errors.
- **Remaining known issues:** Browser tests skipped due to environment limits.

## Important Note
The Relationship Map uses a deterministic layout derived from statutory relationships in the legal corpus. It does not represent observed operational coordination.
