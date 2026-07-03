# CODE_BRIEFING — NormTrace-IHR: integrate, clean, and finish the webapp

**Audience:** Claude Code, working inside the `normtrace-ihr-mexico-pilot` repo connected to GitHub + Vercel.
**Author of the changes so far:** prior Cowork session (network pipeline + SPAR bridge + webapp wiring).
**Read first:** `00_project/network_methodology_rationale.md` (why the network is built this way, grounded in
Knoke, Diani, Hollway & Christopoulos 2021) and `adversarial_positioning_memo.md` (what we may and may not claim).

Your job: (A) integrate and clean what already exists so the repo builds and the deploy shows the new,
data-driven numbers; then (B) execute Phases 0, 1-fig, 1-R, 3-UX, and CI in order. Keep every claim inside the
guardrails in the rationale doc §4. **Never hard-code network numbers** — they must come from the JSON produced
by the pipeline.

---

## Ground truth: the computed numbers (all from `04_outputs/figures/network_metrics.json` and `spar_normtrace_divergence.json`)

- Two-mode network: **8 instruments × 43 obligations**, 68 anchoring edges, density 0.198. (2 of 45 obligations have no anchoring instrument → full-gap, absent by construction.)
- Instrument degree (distinct obligations anchored): **LGS 21, RLGS-SI 20, RI-SS-2025 11, NOM-017 6, CPEUM 5, Ley Aduanera 3, LGPDPPSO 1, LOAPF 1.**
- Actor obligation-reach (top): **Secretaría de Salud 24**, Consejo de Salubridad General 23, Entidades federativas 23, COFEPRIS 21, Puertos/aeropuertos 21.
- CUG test: centralisation **0.60 observed vs 0.30 random**, **p<0.001** (1000 draws).
- Communities: **2**, modularity **0.293** (sizes 22/21).
- SPAR↔legal divergence (Mexico): **CC1 80.6% self-report vs 34.0% anchoring (+46.6)**; overall SPAR 81.3% vs anchoring 35.1%.
- Actors dataset: **18 total** = 15 federal + 2 autonomous (CNDH, INAI) + 1 state grouping (32 entities). (Paper currently says "fourteen" — wrong; fix in Phase 0.)

---

## A. Integrate & clean the repo

Run from repo root unless noted.

```bash
# 1. Python deps and regenerate all derived artifacts (idempotent)
pip install networkx pandas
python3 06_scripts/build_tables/build_network.py
python3 06_scripts/build_tables/spar_normtrace_bridge.py
# Expect: 04_outputs/figures/network_metrics.json + node_registry.csv + network_edges.csv
#         04_outputs/exports/spar_normtrace_divergence.json
#         05_webapp/public/data/derived/{network_metrics.json,node_registry.csv,network_edges.csv,
#                                        spar_normtrace_divergence.json,spar_normtrace_divergence.csv}

# 2. Webapp builds
cd 05_webapp && npm install && npm run build && cd ..
# The build script is `vite build` (transpile-only). Pre-existing tsc noise
# (unused imports TS6133, lucide-react TS7016) does NOT block it.

# 3. Repo hygiene
git rm --cached "~\$ruta.docx" 2>/dev/null; rm -f "~\$ruta.docx"   # stray Word lockfile
echo "~\$*.docx" >> .gitignore
```

**Fix the aliasing edge case** in `06_scripts/build_tables/build_network.py`:
`INSTRUMENT_ALIASES` matches on a 40-char name prefix, which collapses the RLGS *Investigación*
regulation into RLGS *Sanidad Internacional*. Change `alias()` to match on the full instrument
name (or a unique key from `mexico_normative_corpus_index.csv`), then re-run step 1 and confirm
RLGS-SI drops to its true count. Document any change in the rationale doc §5.

**Sanity checks before committing:**
```bash
grep -rn "degree: 59\|deg=59\|degree: 22\|degree: 23" 05_webapp/src && echo "FAIL: hard-coded degree present" || echo "OK: no hard-coded degree"
test -f 05_webapp/public/data/derived/network_metrics.json && echo "OK metrics" 
```

Commit:
```bash
git add 06_scripts 02_data 04_outputs 05_webapp/src 05_webapp/public/data/derived 00_project .gitignore
git commit -m "feat: reproducible multimodal network + SPAR bridge; webapp reads computed metrics; docs"
git push   # triggers Vercel
```

Confirm on the deploy: `/actors` → Network Metrics/Topology tab shows the CUG card; `/spar-bridge` renders.

---

## B. Phase 0 — Cleanup: reconcile actor count + replace fabricated network numbers in the paper

Target files (same text is mirrored in 3 places — fix all):
`00_project/normtrace_ihr_methodology_full.md`,
`05_webapp/public/data/markdown/normtrace_ihr_methodology_full.md`,
`05_webapp/public/data/markdown/normtrace_ihr_methodology_web.md`.

Find the Results "Legal corpus" paragraph containing `Fourteen federal-level institutional actors` and
`degree=59`. Replace the whole sentence cluster with computed values:

> **Old (fabricated):** "Fourteen federal-level institutional actors were identified…the Secretaría de
> Salud held the highest degree…(degree=59)…The Ley General de Salud (degree=23), the CPEUM (degree=22),
> and the RLGS-SI (degree=20)…"
>
> **New (computed, verifiable):** "Fifteen federal-level institutional actors were identified (of 18 actors
> total: 15 federal, two autonomous constitutional bodies, and one grouping of 32 state governments). In the
> instrument×obligation two-mode network (8 instruments × 43 obligations), the Secretaría de Salud had the
> highest actor obligation-reach (24 of 43 obligations reachable through the instruments it can issue). The
> most connected instruments were the Ley General de Salud (21 obligations anchored), the RLGS-SI (20), and
> the Reglamento Interior de la Secretaría de Salud (11); the CPEUM anchored 5. Instrument-degree
> centralisation (0.60) exceeded a size- and density-matched random baseline (mean 0.30; CUG test, p<0.001,
> 1,000 permutations), and greedy-modularity community detection returned two obligation communities
> (Q=0.293)."

Also: search the whole repo for any other `degree=59|=23|=22|=20` and for `Fourteen`/`14 federal` and fix.
Add one sentence to the Methods "AI-assisted structuring and validation pipeline" paragraph pointing to
`00_project/network_methodology_rationale.md` and confirming the pipeline source is in `06_scripts/`.

Optionally add a short **new Results subsection** "SPAR self-report vs legal anchoring" reporting the CC1
divergence (+46.6 pts) and overall (81.3% vs 35.1%), framed strictly per rationale §4 (construct-validity
diagnostic, not "SPAR is inflated").

Verify: `python3 06_scripts/validation/validate_content.py` (built in the CI step) passes. Commit + push.

---

## C. Phase 1-fig — the figure that "looks weird": force-directed by mode

In `05_webapp/src/pages/ActorsExplorer.tsx`, replace the fixed-arc layout in `graphNodes` with a
force-directed layout (d3 is available; `import * as d3 from 'd3'` or add `d3-force`). Requirements:
- Read nodes from `public/data/derived/node_registry.csv` and edges from `network_edges.csv` (computed),
  not the 7-row hand-authored `actor_network_edges_derived.csv`.
- **Lanes by mode**: obligations top band, instruments middle, actors bottom — use a `forceY` per mode plus
  `forceManyBody` + `forceLink`, so the obligation→instrument→actor chain reads top-to-bottom.
- Node size = `degree_norm`; color = mode; **edge thickness = weight (anchoring_level)**; gap-exposure edges
  red dashed. Legend + a one-line "how to read this".
- Default view = the real obligation network (remove the 8-node hand graph as default; keep it only as an
  optional "curated summary" toggle if wanted).
- Click an obligation → highlight its full chain to the responsible actor and show its gap_type.
Verify by running the app and taking a screenshot; the graph should be legible, not an arc of crossing edges.

---

## D. Phase 1-R — migraph version for the paper

Create `06_scripts/build_tables/build_network.R` using `migraph`/`manynet`:
- Build the instrument×obligation two-mode network from `03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv`.
- Bimodal centrality (Borgatti–Everett); community detection; `test_random()` (CUG) reproducing the p<0.001 result.
- **MRQAP** via `net_regression(anchoring_level ~ tier + pre_2005_dummy, …, times=1000)` to test whether lower-rank
  or pre-2005 instruments predict weaker anchoring (the RLGS-SI 1985 claim). Export tidy() output to
  `04_outputs/figures/` and save figures.
- Cross-check that the R degree/centralisation numbers match the Python JSON (±rounding); note any difference.

---

## E. Phase 3-UX — consolidate 18 pages → 5 and a one-idea landing

The app has heavy overlap (ActorsExplorer, PoliticalBrain, NormDiagnostic, NormPipeline, NormativeHierarchy,
MappingExplorer). Consolidate navigation to five sections: (1) Landing/What-is, (2) Traceability network,
(3) SPAR↔Legal, (4) Mapping explorer (the 80 rows with their six fits), (5) Methodology + limitations. Move the
older analytic pages under an "Advanced" group rather than top-level. Redesign the landing to state in ~10s what
NormTrace measures, leading with the hook numbers (mean anchoring 1.76/5; SPAR 81% vs legal 35%). Keep the
persistent "preliminary pilot — expert review required" banner as one shared component. Accessibility: AA
contrast; encode edge type by pattern/shape, not colour alone. Deliver before/after screenshots.

---

## F. CI — content validation (do this once, run on every push)

Create `06_scripts/validation/validate_content.py` that exits non-zero if any of:
- a `source`/`target` in `network_edges.csv` is absent from `node_registry.csv`;
- corpus counts drift: 45 obligations / 110 provisions / 18 instruments / 80 mapping rows ≠ actual file rows;
- "federal actors" number in the paper ≠ `count(government_level=='federal')` in the actors CSV;
- any `deg=NN` / `degree: NN` integer literal appears in `05_webapp/src/pages/*.tsx`.
Add `.github/workflows/validate.yml` running it (and `npm run build`) on push/PR.

---

## Order of execution & definition of done

1. **A** (integrate/clean) → deploy shows real CUG card + SPAR page.
2. **B** Phase 0 → paper and UI numbers reconciled; validator passes.
3. **C** Phase 1-fig → figure legible.
4. **F** CI → guards the above.
5. **D** Phase 1-R and **E** Phase 3-UX → paper rigor + UX polish.

**Done when:** `npm run build` passes; `validate_content.py` passes; no hard-coded network numbers anywhere;
`/actors` and `/spar-bridge` render computed values on Vercel; paper actor count and network numbers match the
data; `network_methodology_rationale.md` reflects any pipeline change (e.g. the aliasing fix). Keep all claims
within `adversarial_positioning_memo.md` limits.
