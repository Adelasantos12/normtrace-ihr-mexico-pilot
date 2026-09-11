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
| Instruments (objects) | legal instruments / provisions | 9 instruments carrying edges (post aliasing-fix, §5); 110 provisions |
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
Greedy modularity on the obligation projection returns **3 communities (Q = 0.286,
sizes 22/20/1)** (post aliasing-fix, §5; the size-1 community is the single obligation
now anchored by the newly-distinguished RLGS-Inv). Read as *policy communities* (Laumann
& Knoke 1987): sets of obligations anchored by a shared instrument cluster. Q≈0.29 is
modest — expected, because the corpus is dominated by two breadth-hubs (LGS, RLGS-SI)
that bridge most obligations. **Implication:** the weak partition is itself a finding
(centralised, not modular architecture), and the AGM algorithm (Ch. 8) should be tried
next as it tolerates multi-membership.

### 3.3 CUG test → the inferential number
The headline inferential result: instrument-degree **centralisation = 0.64**, versus a
random-baseline mean of **0.33** over 1000 size-and-density-matched graphs, **p(≥random) < 0.001**
(post aliasing-fix, §5). This converts "Salud/LGS is the hub" from an assertion into a test:
the concentration of legal anchoring on a few instruments is **not** what a random allocation
of the same number of anchoring links would produce. **Implication:** the fragility argument
(reform must run through very few instruments) has inferential support, not just description.
Next step in R is a **QAP/MRQAP** regression of `anchoring_level` on instrument tier and a
pre-2005 dummy, to test formally whether older/lower-rank instruments predict weaker anchoring
(the 1985 RLGS-SI claim).

### 3.4 The SPAR↔legal bridge → construct-validity probe, CC1 only
`spar_normtrace_bridge.py` compares Mexico's SPAR self-report (0–100) with NormTrace legal
anchoring (0–5→%), **scoped to CC1 (Legislation, policy & financing) only**: **CC1 Legislation:
self-report 56.0% latest (2025) vs anchoring 34.0% (n=20 obligations) → +22.0 pts**. NormTrace's
anchoring score is a current-state snapshot, not a multi-year average, so the primary comparison
is against SPAR's *latest* submission, not SPAR's 2010–2025 historical mean (80.4%, reported
separately as trajectory context, → +46.4 pts if paired against it, which is not the headline
figure). This is the pilot's construct-validity contribution: a capacity can be reported as
present while the obligation lacks a sustainable legal base. **Implication:** the divergence is
a *diagnostic of legal coverage*, not a claim that SPAR is "wrong" or that outcomes are
predicted (see §4).

**Why CC1 only, and not the other SPAR capacities.** An earlier version of this bridge also
compared NormTrace anchoring against SPAR's CC2 (IHR coordination), CC5/C6 (surveillance),
CC4/C8 (emergency management), and PoE/C11 (points of entry) — and separately paired a
corpus-wide NormTrace mean against SPAR's overall aggregate score. Both comparisons were
removed: SPAR's non-CC1 capacities assess *operational* capacity (staffed surveillance
systems, running points-of-entry infrastructure, functioning emergency-response programmes),
which NormTrace does not measure at all — it only assesses whether a domestic legal instrument
exists for an obligation. CC1 is the one capacity where SPAR's own construct ("legislation,
policy and financing") and NormTrace's construct ("legal anchoring") genuinely coincide, so it
is the only pairing that is construct-valid. Pairing NormTrace's legal-anchoring score against
an operational-capacity score for the other capacities — or against SPAR's overall aggregate,
which mixes in those same operational capacities — would imply NormTrace assesses operational
readiness, which it does not. NormTrace's corpus-wide mean anchoring (35.1% across all 45
obligations) is still reported in `spar_normtrace_divergence.json` as a standalone descriptive
statistic, but is no longer paired against any SPAR figure.

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
- **SPAR→CC crosswalk is CC1 only** (§3.4) — the one capacity pairing that is construct-valid;
  it is a defensible approximation, not an official WHO mapping. SPAR methodology also
  changed across editions (interpret trajectories, not single years).
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
