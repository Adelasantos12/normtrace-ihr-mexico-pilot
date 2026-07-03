---
document_type: "Methodological rationale — network & SPAR-divergence layers"
status: "companion to normtrace_ihr_methodology_full.md"
version: "1.0 — 2026-07-03"
theoretical_basis: "Knoke, Diani, Hollway & Christopoulos (2021), Multimodal Political Networks (CUP)"
audit_basis: "adversarial_positioning_memo.md (Think Global Health peer-review simulation, 1 Jul 2026)"
---

# NormTrace-IHR — Rationale for the network and SPAR-divergence layers

This document records **why** the network analysis and the SPAR↔legal comparison are
built the way they are, what each design decision means, and how the results must
(and must not) be interpreted in later work. It is the theoretical backing for the
code in `06_scripts/build_tables/build_network.py` and
`06_scripts/build_tables/spar_normtrace_bridge.py`. It should be read alongside the
main methodology (`normtrace_ihr_methodology_full.md`) and the adversarial review
memo (`adversarial_positioning_memo.md`).

---

## 1. The problem this layer solves

The pilot's core datum is the obligation-by-provision mapping: 45 IHR 2005
obligations against domestic provisions, each scored for anchoring (0–5) and coded
for six fit dimensions and a gap type. That table already answers "how well is each
obligation anchored?" But it does not, on its own, answer three structural questions:

1. **Concentration** — is IHR implementation legally over-dependent on a small number
   of instruments/actors, such that reform or failure at one point cascades?
2. **Community structure** — do obligations cluster around shared instruments in a way
   that reveals *policy communities* rather than isolated articles?
3. **Construct validity of capacity scores** — does the reported IHR capacity (SPAR)
   correspond to the actual legal anchoring of the same obligations, or diverge from it?

Questions 1–2 are network questions. Question 3 is the bridge to the existing IHR
monitoring ecosystem (SPAR/JEE) and is the pilot's clearest contribution claim.

---

## 2. Why a *multimodal* network (and why raw degree was wrong)

Following Knoke, Diani, Hollway & Christopoulos (2021), political-legal life is
**multimodal**: actors create and act through objects (here, legal instruments) and
those objects carry obligations. NormTrace's corpus is therefore a **restricted
three-mode network**:

| Mode | Entity type | Members (pilot) |
|------|-------------|-----------------|
| Actors (agentic) | institutions | 18 (15 federal, 2 autonomous, 1 state-grouping) |
| Instruments (objects) | legal instruments / provisions | 8 instruments carrying edges; 110 provisions |
| Obligations (objects) | IHR 2005 obligations | 45 (43 with ≥1 identified anchoring instrument) |
| Gap type (attribute) | gap classification | 10 categories |

"Restricted" means ties run **between** adjacent modes (provision→obligation,
actor→instrument), not within a mode.

**The prior error.** The earlier webapp/paper reported a single degree ranking that
mixed an *actor* (Secretaría de Salud, "deg=59") with *instruments* (LGS 23, CPEUM 22,
RLGS-SI 20). This is invalid for two reasons:

- **Mode mixing.** In a two-mode network the degree of an actor (how many
  instruments/obligations it touches) and the degree of an instrument (how many
  obligations it anchors) live on different scales and normalise differently
  (Borgatti & Everett 1997). Ranking them in one list compares non-comparable
  quantities.
- **Non-reproducibility.** None of those numbers could be regenerated from the data.
  Recomputed from the mapping, CPEUM anchors **5** obligations, not 22; the "59" for
  SSA corresponded to no computable quantity. Hard-coded figures in a reproducibility-
  first project are the single most attackable feature (see memo §"Single coder /
  preliminary coding").

**The correction.** `build_network.py` computes everything from
`mexico_ihr2005_mapping.csv`:

- Primary two-mode network = **instrument × obligation**, edge weight = `anchoring_level`.
- **Mode-aware degree**: instrument degree = distinct obligations anchored; obligation
  degree = distinct instruments anchoring; each normalised within its own mode.
- **Actor overlay** kept explicitly separate: actor "obligation-reach" = obligations
  reachable through the instruments an actor can issue (actor×instrument → obligation),
  never merged into the instrument ranking.

---

## 3. Design decisions and what they mean

### 3.1 Projections and their information loss
Where a one-mode view is needed we project: obligation–obligation = **AᵀA** (obligations
linked by shared instruments); instrument–instrument = **AAᵀ**. We document, per Knoke
et al., the three losses this incurs: (i) identity of the shared node is hidden;
(ii) triangles are inflated, biasing clustering/structural-hole measures; (iii) the
decision process is obscured (one instrument anchoring three obligations looks like a
triangle among obligations). **Implication for later analysis:** never report clustering
or structural-hole statistics off a projection without also reporting the two-mode
original.

### 3.2 Community detection → policy communities
Greedy modularity on the obligation projection returns **2 communities (Q = 0.293,
sizes 22/21)**. Read as *policy communities* (Laumann & Knoke 1987): sets of obligations
anchored by a shared instrument cluster. Q≈0.29 is modest — expected, because the corpus
is dominated by two breadth-hubs (LGS, RLGS-SI) that bridge most obligations. **Implication:**
the weak partition is itself a finding (centralised, not modular architecture), and the
AGM algorithm (Ch. 8) should be tried next as it tolerates multi-membership.

### 3.3 CUG test → the inferential number
The headline inferential result: instrument-degree **centralisation = 0.64**, versus a
random-baseline mean of **0.33** over 1000 size-and-density-matched graphs, **p(≥random) < 0.001**
(figures as of the aliasing fix, §5; see network_metrics.json for the live values). This converts
"Salud/LGS is the hub" from an assertion into a test: the concentration of legal anchoring on a
few instruments is **not** what a random allocation of the same number of anchoring links would
produce. **Implication:** the fragility argument (reform must run through very few instruments)
has inferential support, not just description.

**MRQAP-style test of the RLGS-SI claim.** The plan was a QAP/MRQAP regression of
`anchoring_level` on instrument tier and a pre-2005 dummy, run in R via `migraph`/`manynet`
(`net_regression(...)`). `migraph`/`manynet` could not be installed in the execution environment
used for this pilot — outbound access is allowlisted to a small set of package registries
(npm, PyPI, GitHub, …) and every CRAN mirror tried (cran.r-project.org, cloud.r-project.org,
packagemanager.posit.co, r-universe.dev) was rejected by the network policy. `06_scripts/build_tables/mrqap_anchoring.py`
implements the same test design in Python instead: OLS of `anchoring_level` on (a) `tier_ordinal`
and (b) `pre_2005_dummy`, one observation per obligation-to-provision mapping row, with a
**node(instrument)-label permutation test** (1000 draws) in place of migraph's built-in QAP
machinery — the covariates are instrument-level, so rows sharing an instrument are not
independent, and permuting which tier/pre-2005 values attach to which instrument (keeping the
edge structure fixed) is the same logic MRQAP uses to get valid inference under that dependency.

**Result: neither covariate is a statistically significant predictor of anchoring strength in
this corpus.** tier_ordinal: coefficient 0.006, permutation p=0.93 (n=78 rows, 9 instruments).
pre_2005_dummy: coefficient 0.14, permutation p=0.50 (n=46 rows, only 4 of 9 instruments have a
verified `publication_date` in the corpus index; the rest are `TBD_REVIEW` and were excluded, not
imputed). **Implication — read carefully:** this pilot's corpus does **not** show a general
statistical pattern of older or lower-rank instruments anchoring more weakly. The RLGS-SI
(1985) finding remains valid as a **specific, illustrative instance** of temporal decoupling
(§5, the instrument is 20 years older than the obligations it implements and was never amended
to reflect them) — but it must not be generalised into "older/lower-rank instruments anchor
worse" as a corpus-wide statistical regularity, because the formal test does not support that
broader claim at n=9 instruments. This null result is itself worth reporting: it is the kind of
honest negative finding the adversarial memo's rigor standard requires, not a result to omit
because it complicates the narrative.

### 3.4 The SPAR↔legal bridge → construct-validity probe
`spar_normtrace_bridge.py` compares Mexico's SPAR self-report (0–100) with NormTrace legal
anchoring (0–5→%) for the obligations in each capacity. Every mapped capacity sits far above
its legal anchoring; **CC1 Legislation: self-report 80.6% mean vs anchoring 34.0% → +46.6 pts**;
overall SPAR 81.3% vs anchoring 35.1%. This is the pilot's construct-validity contribution:
a capacity can be reported as present while the obligation lacks a sustainable legal base.
**Implication:** the divergence is a *diagnostic of legal coverage*, not a claim that SPAR is
"wrong" or that outcomes are predicted (see §4).

---

## 4. Guardrails from the adversarial memo (what we may and may not claim)

The memo (a hostile-reviewer simulation) sets the honesty boundary. Each network/SPAR result
is mapped to an allowed claim:

| Result | Allowed claim | Prohibited overclaim |
|--------|---------------|----------------------|
| CUG p<0.001 centralisation | "Legal anchoring is significantly concentrated on a few instruments." | Not "predicts implementation failure." |
| SPAR–anchoring divergence | "Reported capacity can exceed legal anchoring — a construct-validity gap." | Not "SPAR scores are inflated/false" (memo: gap has narrowed in 2022–23). |
| RLGS-SI (1985) as a top hub | "Primary IHR instrument predates IHR 2005 — an *update-review* gap." | Not "first to find this"; cite Menon 2018, Gostin 2019. |
| Actor obligation-reach (SS=24) | "SS is the corpus-central actor for IHR anchoring." | Not "measures operational authority or power." |
| Mean anchoring 1.76/5; overall 35% | "Legal coverage on the books is thin and general." | Not "measures enforcement, implementation, or outcomes." |
| MRQAP-style tier/pre-2005 test (p=0.93, p=0.50) | "This corpus does not show a general statistical pattern of older/lower-rank instruments anchoring more weakly (n=9 instruments)." | Not "older/lower-rank instruments anchor worse" as a corpus-wide claim — only the RLGS-SI case is a specific, illustrative instance. |

Non-negotiable framing (memo §4): sell **methodological resolution and diagnostic
actionability**, on an explicitly **n=1, single-coder, preliminary** pilot. Do not present
computed network/divergence numbers as validated measurement.

---

## 5. Known limitations specific to this layer

- **43 of 45 obligations** enter the two-mode network; 2 have no identified anchoring
  instrument (they are the full-gap rows) and are absent by construction, not error.
- **9 instruments carry edges** (after the aliasing fix below), though the corpus has 18:
  most instruments in the corpus are not cited as the anchoring instrument for any
  obligation in the 80 mapping rows.
- **Aliasing fix (2026-07-03):** `build_network.py`'s `alias()` previously matched
  instruments by a 40-char name prefix, which collapsed the RLGS *Investigación*
  regulation into RLGS *Sanidad Internacional* (both share the prefix "Reglamento de
  la Ley General de Salud en Materia de..."). Fixed to match on the full instrument
  name (exact key lookup against `INSTRUMENT_ALIASES`, not a prefix). Effect: RLGS-SI's
  instrument degree dropped from 20 to **19** (the 1 obligation previously misattributed
  now anchors correctly to the newly-distinguished RLGS-Inv, degree 1); `n_instruments`
  rose from 8 to 9; communities went from 2 (Q=0.293) to 3 (Q=0.286); CUG test observed
  centralisation moved from 0.5952 to 0.6402 (still p<0.001 vs random). The correction
  is a ≤1-obligation rounding, not a change to the substantive finding.
- **SPAR→CC crosswalk** is a defensible approximation, not an official WHO mapping; only
  high-confidence capacity pairings are reported, and SPAR methodology changed across
  editions (interpret trajectories, not single years).
- **MRQAP tier/pre-2005 test is Python, not R/migraph** (§3.3): CRAN was unreachable from the
  execution environment, so `06_scripts/build_tables/mrqap_anchoring.py` re-implements the
  test design rather than running `migraph::net_regression()`. The pre-2005 model additionally
  uses only 4 of 9 instruments (those with a verified, non-`TBD_REVIEW` `publication_date` in
  `mexico_normative_corpus_index.csv`) — a small-n result, reported as such, not a validated
  general finding.
- All anchoring inputs remain **preliminary_ai_assisted** and unvalidated by a domestic
  public-health-law expert.

---

## 6. References

Borgatti SP, Everett MG. Network analysis of 2-mode data. *Social Networks*. 1997;19(3):243–69.
Knoke D, Diani M, Hollway J, Christopoulos D. *Multimodal Political Networks*. Cambridge: CUP; 2021. doi:10.1017/9781108985000.
Laumann EO, Knoke D. *The Organizational State*. Madison: Univ. of Wisconsin Press; 1987.
Menon A, et al. Law and the JEE: lessons for IHR implementation. *Health Secur*. 2018. PMID 30480502.
Gostin LO, et al. The legal determinants of health. *Lancet*. 2019. PMID 31053306.
Bishowkarma K, et al. Estimating global public health security preparedness capacity: the contribution of SPAR and JEE. *Dialogues Health*. 2026. doi:10.1016/j.dialog.2026.100282.
