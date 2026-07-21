# Superseded — pre-manuscript methodology architecture

`methodology_note.md` (moved here from `00_project/`) describes the pilot's
**original, pre-manuscript** analytical architecture:

- A 0–5 "anchoring score" scale with 6 labeled bands (No identifiable
  anchoring … Integrated implementation anchoring).
- A 10-type gap typology (legal silence, competence ambiguity,
  administrative-only anchoring, procedural gap, coordination gap, federal
  implementation gap, rights-safeguard gap, oversight gap, budget/capacity
  gap, update-review needed).

The manuscript's actual six authoritative tables
(`04_outputs/exports/data_package_v0_2/`) use a **different, incompatible**
architecture:

- `formal_source_level` (1/2/3: regulation/NOM, statute, constitution) —
  not the same construct as the old 0–5 anchoring score.
- A 7-value `gap_type` free-text field (procedural gap, regulatory gap,
  partial regulatory gap, rights safeguard gap, coordination gap, full gap,
  none) that overlaps with but is not identical to the old 10-type
  typology.
- `correspondence_role` (substantive / contextual_or_enabling) and
  `mapping_coverage` (complete_component / partial_component /
  contextual_only) — dimensions with no equivalent in the old note.

This file is kept as a historical record of the pilot's earlier design. Do
not present it as current methodology — see `00_project/data_dictionary.md`
(v0.2) for the live architecture. There must be exactly one live methodology
description at any time; if a new methodology-note-equivalent document is
written for v0.2 prose (as opposed to the data dictionary), it should live
in `00_project/` and this file should stay archived.

Superseded: v0.2 data package release, 2026-07-20.
