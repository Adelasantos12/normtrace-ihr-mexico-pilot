#!/usr/bin/env python3
"""
NormTrace-IHR — instrument x obligation two-mode network builder (v0.2 data package).

Adapted from 06_scripts/build_tables/build_network.py on
claude/normtrace-phase-f-ci (the version with the non-determinism fix from
PR #13) to read the manuscript's canonical v0.2 table instead of the earlier
ad hoc mapping CSV, and with the actor overlay removed entirely: the actor
layer (actor x instrument reach, used by the webapp's Political Brain /
Actors Explorer) is a webapp-only presentation layer and does not belong in
the paper's supplementary data package (see Adenda point 3).

Two-mode network: instrument x obligation, from S3a_provision_linked_records_78.csv,
weight = formal_source_level (v0.2 name for the old anchoring_level / source_rank).

Modes (Knoke, Diani, Hollway & Christopoulos 2021, Multimodal Political
Networks, Cambridge University Press, doi:10.1017/9781108985000):
  - instrument  (domestic legal instruments — objects)
  - obligation  (IHR 2005 obligations — objects)

Usage:  python3 06_scripts/build_tables/build_network.py
"""
from __future__ import annotations
import csv, json, os, random, statistics
import networkx as nx
from networkx.algorithms import bipartite
from networkx.algorithms.community import greedy_modularity_communities

random.seed(42)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PKG = os.path.join(ROOT, "04_outputs/exports/data_package_v0_2")
S3A = os.path.join(PKG, "S3a_provision_linked_records_78.csv")
OUT = PKG


def read_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return [{k.strip(): (v.strip() if isinstance(v, str) else v) for k, v in row.items()}
                for row in csv.DictReader(f)]


# short, stable labels for the corpus instruments (matches the manuscript's
# domestic_norm values in S3a exactly)
INSTRUMENT_ALIASES = {
    "Ley General de Salud": "LGS",
    "Reglamento de la Ley General de Salud en Materia de Sanidad Internacional": "RLGS-SI",
    "Reglamento Interior de la Secretaría de Salud": "RIS",
    "NOM-017-SSA2-2012, Para la vigilancia epidemiológica": "NOM-017",
    "Constitución Política de los Estados Unidos Mexicanos": "CPEUM",
    "Ley Aduanera": "Ley Aduanera",
    "Ley Orgánica de la Administración Pública Federal": "LOAPF",
    "Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados": "LGPDPPSO",
    "Reglamento de la Ley General de Salud en Materia de Investigación para la Salud": "RLGS-Inv",
}


def alias(norm: str) -> str:
    norm = (norm or "").strip()
    return INSTRUMENT_ALIASES.get(norm, norm or "UNSPECIFIED")


def main():
    mapping = read_csv(S3A)

    # ---- Build the instrument x obligation two-mode network -----------------
    B = nx.Graph()
    inst_nodes, obl_nodes = set(), set()
    for r in mapping:
        inst = alias(r.get("domestic_norm"))
        obl = r.get("obligation_id", "").strip()
        if not obl or inst == "UNSPECIFIED":
            continue
        try:
            w = int(r.get("formal_source_level") or 0)
        except ValueError:
            w = 0
        inst_nodes.add(inst); obl_nodes.add(obl)
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

    # ---- Projection to obligation-obligation (shared instruments) -----------
    # NOTE: this is a one-mode projection, not the multimodal network itself.
    # Per Knoke et al. (2021), projections collapse the shared-instrument node
    # and inflate triangles, so the resulting modularity/community partition
    # should be read as descriptive clustering, not a validated structural-hole
    # or clustering statistic.
    G_obl = bipartite.weighted_projected_graph(B, obl_nodes)
    raw_communities = greedy_modularity_communities(G_obl) if G_obl.number_of_edges() else []
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
                              "betweenness": round(betw.get(n, 0), 4), "community": ""})
    for n in sorted(obl_nodes):
        node_registry.append({"node_id": n, "mode": "obligation",
                              "degree": obl_deg[n], "degree_norm": obl_deg_norm[n],
                              "betweenness": round(betw.get(n, 0), 4),
                              "community": obl_comm.get(n, "")})

    edges_out = [{"source": i, "target": o, "type": "anchors",
                  "weight": B[i][o]["weight"], "rows": B[i][o]["rows"]}
                 for i, o in B.edges()]

    metrics = {
        "generated_by": "06_scripts/build_tables/build_network.py",
        "source_table": "04_outputs/exports/data_package_v0_2/S3a_provision_linked_records_78.csv",
        "network": {"modes": ["instrument", "obligation"],
                    "n_instruments": n_inst, "n_obligations": n_obl,
                    "n_edges": n_edges,
                    "density": round(n_edges / (n_inst * n_obl), 3) if n_inst and n_obl else 0},
        "instrument_degree_ranked": sorted(
            [{"instrument": n, "obligations_anchored": inst_deg[n],
              "degree_norm": inst_deg_norm[n], "betweenness": round(betw.get(n, 0), 4)}
             for n in inst_nodes], key=lambda x: (-x["obligations_anchored"], x["instrument"])),
        "communities": {"n": len(communities), "modularity": round(modularity, 3) if modularity else None,
                        "sizes": [len(c) for c in communities],
                        "computed_on": "one-mode projection (obligation-obligation via shared instrument); "
                                       "not the multimodal network itself, see provenance_note"},
        "cug_test": {"measure": "instrument-degree centralisation",
                     "observed": round(obs_c, 4),
                     "random_mean": round(statistics.mean(sims), 4),
                     "p_value_ge_random": round(p_ge, 4),
                     "interpretation": ("centralisation significantly ABOVE random"
                                        if p_ge < 0.05 else
                                        "not distinguishable from random")},
        "provenance_note": (
            "All figures computed from S3a_provision_linked_records_78.csv (v0.2 data package). "
            "This is a two-mode (instrument x obligation) network; the actor layer "
            "(actor x instrument reach, used by the webapp's Political Brain / Actors "
            "Explorer) is a separate, webapp-only presentation layer and is not part of "
            "this supplementary table. The SPAR-comparison bridge is likewise not derived "
            "here (see package README). Community/modularity figures are computed on a "
            "one-mode projection and should not be read as a validated structural-hole or "
            "clustering statistic on the multimodal network (Knoke, Diani, Hollway & "
            "Christopoulos, Multimodal Political Networks, Cambridge University Press, "
            "2021, doi:10.1017/9781108985000)."
        ),
    }

    with open(os.path.join(OUT, "S5_network_metrics.json"), "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2, ensure_ascii=False)
    with open(os.path.join(OUT, "S5_node_registry.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["node_id", "mode", "degree", "degree_norm",
                                          "betweenness", "community"])
        w.writeheader()
        for row in node_registry:
            w.writerow(row)
    with open(os.path.join(OUT, "S5_network_edges.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["source", "target", "type", "weight", "rows"])
        w.writeheader(); w.writerows(edges_out)

    # ---- Console summary ----------------------------------------------------
    print("=== INSTRUMENT DEGREE (distinct obligations anchored) ===")
    for row in metrics["instrument_degree_ranked"]:
        print(f"  {row['obligations_anchored']:2d}  {row['instrument']:<12}  norm={row['degree_norm']}")
    print(f"\nNetwork: {n_inst} instruments x {n_obl} obligations, {n_edges} edges, "
          f"density={metrics['network']['density']}")
    print(f"Communities: {metrics['communities']['n']}  modularity={metrics['communities']['modularity']}")
    print(f"CUG test: observed={metrics['cug_test']['observed']}  "
          f"random_mean={metrics['cug_test']['random_mean']}  "
          f"p(>=random)={metrics['cug_test']['p_value_ge_random']}  "
          f"-> {metrics['cug_test']['interpretation']}")
    print(f"\nWrote S5_network_metrics.json / S5_node_registry.csv / S5_network_edges.csv "
          f"to {OUT}")


if __name__ == "__main__":
    main()
