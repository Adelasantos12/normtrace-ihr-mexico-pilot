#!/usr/bin/env python3
"""
NormTrace-IHR — Multimodal legal-institutional network builder.

Builds a *reproducible* multimodal (restricted 3-mode) network from the pilot
mapping data and computes mode-aware centrality, projections, community
detection and a CUG-style random baseline. Replaces the previously hard-coded
degree figures (deg=59/23/22/20) in the webapp/paper with computed values.

Modes (Knoke, Diani, Hollway & Christopoulos 2021):
  - actor       (agentic institutions)
  - instrument  (legal instruments / provisions — objects)
  - obligation  (IHR 2005 obligations — objects)
  - gap         (gap-type — attribute-node)

Primary two-mode network: instrument x obligation, from the 80 mapping rows,
weight = anchoring_level. Actor overlay: actor x instrument, from the actors
table (source_norm). Outputs are written to 04_outputs/figures/ and mirrored
to the webapp public/data/derived/ folder so the UI reads computed numbers.

Usage:  python3 06_scripts/build_tables/build_network.py
"""
from __future__ import annotations
import csv, json, os, random, statistics
from collections import defaultdict
import networkx as nx
from networkx.algorithms import bipartite
from networkx.algorithms.community import greedy_modularity_communities

random.seed(42)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MAP = os.path.join(ROOT, "03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv")
ACTORS = os.path.join(ROOT, "03_tables/actors/mexico_health_governance_actors.csv")
OBLIG = os.path.join(ROOT, "03_tables/international_obligations/IHR-2005_obligations_domestic-anchoring.csv")
OUT_FIG = os.path.join(ROOT, "04_outputs/figures")
OUT_WEB = os.path.join(ROOT, "05_webapp/public/data/derived")
os.makedirs(OUT_FIG, exist_ok=True)
os.makedirs(OUT_WEB, exist_ok=True)


def read_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return [ {k.strip(): (v.strip() if isinstance(v, str) else v) for k, v in row.items()}
                 for row in csv.DictReader(f) ]


# short, stable labels for the big legal instruments
INSTRUMENT_ALIASES = {
    "Ley General de Salud": "LGS",
    "Reglamento de la Ley General de Salud en Materia de Sanidad Internacional": "RLGS-SI",
    "Reglamento Interior de la Secretaría de Salud": "RI-SS-2025",
    "NOM-017-SSA2-2012, Para la vigilancia epidemiológica": "NOM-017",
    "Constitución Política de los Estados Unidos Mexicanos": "CPEUM",
    "Ley Aduanera": "Ley Aduanera",
    "Ley Orgánica de la Administración Pública Federal": "LOAPF",
    "Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados": "LGPDPPSO",
    "Reglamento de la Ley General de Salud en Materia de Investigación para la Salud": "RLGS-Inv",
}


def alias(norm: str) -> str:
    norm = (norm or "").strip()
    if norm in INSTRUMENT_ALIASES:
        return INSTRUMENT_ALIASES[norm]
    return norm or "UNSPECIFIED"


def main():
    mapping = read_csv(MAP)
    actors = read_csv(ACTORS)

    # ---- Build the instrument x obligation two-mode network -----------------
    B = nx.Graph()
    inst_nodes, obl_nodes = set(), set()
    row_edges = []  # keep multiplicity for weighting/audit
    for r in mapping:
        inst = alias(r.get("domestic_norm"))
        obl = r.get("obligation_id", "").strip()
        if not obl or inst == "UNSPECIFIED":
            continue
        try:
            w = int(r.get("anchoring_level") or 0)
        except ValueError:
            w = 0
        inst_nodes.add(inst); obl_nodes.add(obl)
        row_edges.append((inst, obl, w, r.get("gap_type", "")))
        # collapse multiple provisions of the same instrument -> keep max anchoring
        if B.has_edge(inst, obl):
            B[inst][obl]["weight"] = max(B[inst][obl]["weight"], w)
            B[inst][obl]["rows"] += 1
        else:
            B.add_edge(inst, obl, weight=w, rows=1)
    for n in sorted(inst_nodes):
        B.add_node(n, mode="instrument", bipartite=0)
    for n in sorted(obl_nodes):
        B.add_node(n, mode="obligation", bipartite=1)

    # ---- Mode-aware degree (Borgatti & Everett 2-mode normalisation) --------
    n_obl, n_inst = len(obl_nodes), len(inst_nodes)
    inst_deg = {n: B.degree(n) for n in inst_nodes}          # distinct obligations anchored
    obl_deg = {n: B.degree(n) for n in obl_nodes}            # distinct instruments anchoring
    inst_deg_norm = {n: round(d / n_obl, 3) for n, d in inst_deg.items()}
    obl_deg_norm = {n: round(d / n_inst, 3) for n, d in obl_deg.items()}
    betw = bipartite.betweenness_centrality(B, obl_nodes) if n_obl and n_inst else {}

    # ---- Actor overlay: actor x instrument, then actor reach over obligations
    actor_inst = defaultdict(set)
    for a in actors:
        name = a.get("actor_name", "")
        src = (a.get("source_norm", "") or "")
        for full, short in INSTRUMENT_ALIASES.items():
            if full[:30] in src and short in inst_nodes:
                actor_inst[name].add(short)
    actor_reach = {}  # obligations reachable via the actor's instruments
    for actor, insts in actor_inst.items():
        reach = set()
        for inst in insts:
            reach |= set(B.neighbors(inst))
        actor_reach[actor] = {"instruments": sorted(insts),
                              "n_instruments": len(insts),
                              "obligation_reach": len(reach)}

    # ---- Projection to obligation-obligation (shared instruments) -----------
    G_obl = bipartite.weighted_projected_graph(B, obl_nodes)
    raw_communities = greedy_modularity_communities(G_obl) if G_obl.number_of_edges() else []
    # greedy_modularity_communities' output order (and therefore the community index
    # each obligation gets) is not guaranteed stable across runs; sort communities by
    # size (desc) then by their lexicographically-smallest member for a deterministic
    # labeling. The partition itself (which nodes group together) does not change.
    communities = sorted(raw_communities, key=lambda c: (-len(c), min(c)))
    obl_comm = {}
    for i, comm in enumerate(communities):
        for node in sorted(comm):
            obl_comm[node] = i
    modularity = nx.algorithms.community.modularity(G_obl, communities) if communities else None

    # ---- CUG-style baseline: is instrument-degree centralisation > random? --
    def centralisation(degs):
        if not degs: return 0.0
        m = max(degs.values())
        return sum(m - d for d in degs.values()) / (len(degs) * m) if m else 0.0
    obs_c = centralisation(inst_deg)
    n_edges = B.number_of_edges()
    sims = []
    inst_list, obl_list = sorted(inst_nodes), sorted(obl_nodes)
    for _ in range(1000):
        R = nx.Graph()
        R.add_nodes_from(inst_list); R.add_nodes_from(obl_list)
        pairs = random.sample([(i, o) for i in inst_list for o in obl_list],
                              min(n_edges, n_inst * n_obl))
        R.add_edges_from(pairs)
        sims.append(centralisation({i: R.degree(i) for i in inst_list}))
    p_ge = sum(1 for s in sims if s >= obs_c) / len(sims)

    # ---- Assemble outputs ---------------------------------------------------
    node_registry = []
    for n in sorted(inst_nodes):
        node_registry.append({"node_id": n, "mode": "instrument",
                              "degree": inst_deg[n], "degree_norm": inst_deg_norm[n],
                              "betweenness": round(betw.get(n, 0), 4)})
    for n in sorted(obl_nodes):
        node_registry.append({"node_id": n, "mode": "obligation",
                              "degree": obl_deg[n], "degree_norm": obl_deg_norm[n],
                              "betweenness": round(betw.get(n, 0), 4),
                              "community": obl_comm.get(n)})

    edges_out = [{"source": i, "target": o, "type": "anchors",
                  "weight": B[i][o]["weight"], "rows": B[i][o]["rows"]}
                 for i, o in B.edges()]

    metrics = {
        "generated_by": "06_scripts/build_tables/build_network.py",
        "network": {"modes": ["instrument", "obligation"],
                    "n_instruments": n_inst, "n_obligations": n_obl,
                    "n_edges": n_edges,
                    "density": round(n_edges / (n_inst * n_obl), 3) if n_inst and n_obl else 0},
        "instrument_degree_ranked": sorted(
            [{"instrument": n, "obligations_anchored": inst_deg[n],
              "degree_norm": inst_deg_norm[n], "betweenness": round(betw.get(n, 0), 4)}
             for n in inst_nodes], key=lambda x: (-x["obligations_anchored"], x["instrument"])),
        "actor_reach_ranked": sorted(
            [{"actor": a, **v} for a, v in actor_reach.items()],
            key=lambda x: (-x["obligation_reach"], x["actor"])),
        "communities": {"n": len(communities), "modularity": round(modularity, 3) if modularity else None,
                        "sizes": [len(c) for c in communities]},
        "cug_test": {"measure": "instrument-degree centralisation",
                     "observed": round(obs_c, 4),
                     "random_mean": round(statistics.mean(sims), 4),
                     "p_value_ge_random": round(p_ge, 4),
                     "interpretation": ("centralisation significantly ABOVE random"
                                        if p_ge < 0.05 else
                                        "not distinguishable from random")},
        "provenance_note": ("All figures computed from mexico_ihr2005_mapping.csv. "
                            "Supersedes hard-coded degree values previously in ActorsExplorer.tsx."),
    }

    with open(os.path.join(OUT_FIG, "network_metrics.json"), "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2, ensure_ascii=False)
    for folder in (OUT_FIG, OUT_WEB):
        with open(os.path.join(folder, "network_metrics.json"), "w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=2, ensure_ascii=False)
        with open(os.path.join(folder, "node_registry.csv"), "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=["node_id", "mode", "degree", "degree_norm",
                                              "betweenness", "community"])
            w.writeheader()
            for row in node_registry:
                w.writerow({**{"community": ""}, **row})
        with open(os.path.join(folder, "network_edges.csv"), "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=["source", "target", "type", "weight", "rows"])
            w.writeheader(); w.writerows(edges_out)

    # ---- Console summary ----------------------------------------------------
    print("=== INSTRUMENT DEGREE (distinct obligations anchored) ===")
    for row in metrics["instrument_degree_ranked"]:
        print(f"  {row['obligations_anchored']:2d}  {row['instrument']:<12}  norm={row['degree_norm']}")
    print("\n=== ACTOR OBLIGATION-REACH (top 6) ===")
    for row in metrics["actor_reach_ranked"][:6]:
        print(f"  reach={row['obligation_reach']:2d}  ({row['n_instruments']} instr)  {row['actor']}")
    print(f"\nCommunities: {metrics['communities']['n']}  modularity={metrics['communities']['modularity']}")
    print(f"CUG test: observed={metrics['cug_test']['observed']}  "
          f"random_mean={metrics['cug_test']['random_mean']}  "
          f"p(>=random)={metrics['cug_test']['p_value_ge_random']}  "
          f"-> {metrics['cug_test']['interpretation']}")
    print(f"\nWrote network_metrics.json / node_registry.csv / network_edges.csv "
          f"to 04_outputs/figures/ and 05_webapp/public/data/derived/")


if __name__ == "__main__":
    main()
