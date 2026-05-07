---
title: "NormTrace-IHR Mexico Pilot — Network Analysis Summary"
version: "0.1"
date: "2026-05-07"
pipeline: "build_mexico_ihr_network.py"
status: "Preliminary AI-assisted — requires expert review"
---

> ⚠ **Caution:** This is a corpus-derived legal-institutional traceability network.
> It reflects what is documented in the legal texts and mapping tables — not observed
> real-world coordination. Centrality metrics measure *legal-institutional salience*
> (how many traceability links pass through a node), not operational power or influence.
> All findings are preliminary (preliminary_ai_assisted · requires_human_review).

# NormTrace-IHR Mexico Pilot — Network Summary

## 1. Nodes by Type

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

## 2. Edges by Relationship Type

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

## 3. Top 10 Actors by Degree (corpus-derived)

| Rank | Actor | Degree | In | Out | Betweenness |
|------|-------|-------:|---:|----:|:-----------:|
| 1 | Secretaría de Salud | 59 | 55 | 4 | 0.0012 |
| 2 | Congreso de la Unión | 7 | 6 | 1 | 0.0000 |
| 3 | Dirección General de Epidemiología | 5 | 4 | 1 | 0.0000 |
| 4 | Consejo de Salubridad General | 4 | 2 | 2 | 0.0000 |
| 5 | Secretaría de Relaciones Exteriores | 3 | 1 | 2 | 0.0000 |
| 6 | Entidades federativas (gobiernos estatales — 32 entidades) | 3 | 1 | 2 | 0.0000 |
| 7 | Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI) / Transparencia para el Pueblo | 3 | 0 | 3 | 0.0000 |
| 8 | Cámara de Diputados | 2 | 1 | 1 | 0.0000 |
| 9 | Auditoría Superior de la Federación | 2 | 0 | 2 | 0.0000 |
| 10 | Comisión Federal para la Protección contra Riesgos Sanitarios (COFEPRIS) | 1 | 0 | 1 | 0.0000 |

## 4. Top 10 Actors by Betweenness Centrality

| Rank | Actor | Betweenness | Degree |
|------|-------|:-----------:|-------:|
| 1 | Secretaría de Salud | 0.0012 | 59 |
| 2 | Consejo de Salubridad General | 0.0000 | 4 |
| 3 | Congreso de la Unión | 0.0000 | 7 |
| 4 | Secretaría de Relaciones Exteriores | 0.0000 | 3 |
| 5 | Entidades federativas (gobiernos estatales — 32 entidades) | 0.0000 | 3 |
| 6 | Cámara de Diputados | 0.0000 | 2 |
| 7 | Dirección General de Epidemiología | 0.0000 | 5 |
| 8 | Comisión Federal para la Protección contra Riesgos Sanitarios (COFEPRIS) | 0.0000 | 1 |
| 9 | Centro Nacional de Programas Preventivos y Control de Enfermedades (CENAPRECE) | 0.0000 | 1 |
| 10 | Secretaría de Gobernación | 0.0000 | 1 |

## 5. Top 10 Legal Instruments by Degree

| Rank | Instrument | Degree | In | Out |
|------|-----------|-------:|---:|----:|
| 1 | Ley General de Salud | 23 | 23 | 0 |
| 2 | CPEUM latest reform 2026-04-23 | 22 | 22 | 0 |
| 3 | Reglamento LGS sanidad internacional | 20 | 20 | 0 |
| 4 | Reglamento Interior SS 2025 | 14 | 14 | 0 |
| 5 | Reglamento LGS investigación para la salud | 10 | 10 | 0 |
| 6 | LOAPF | 9 | 9 | 0 |
| 7 | Ley aprobación tratados materia económica | 5 | 5 | 0 |
| 8 | Ley celebración de tratados | 5 | 5 | 0 |
| 9 | LFPRH | 5 | 5 | 0 |
| 10 | NOM-017 vigilancia epidemiológica | 5 | 5 | 0 |

## 6. Top 10 IHR 2005 Obligations by Number of Domestic Anchors

| Rank | Obligation ID | Label | Anchors |
|------|--------------|-------|--------:|
| 1 | IHR-OBL-001 | IHR Art. 4 — Responsible authorities | 3 |
| 2 | IHR-OBL-002 | IHR Art. 5(1) — Surveillance | 3 |
| 3 | IHR-OBL-004 | IHR Art. 6(1) — Notification | 3 |
| 4 | IHR-OBL-010 | IHR Art. 13(1) — Public health response | 3 |
| 5 | IHR-OBL-016 | IHR Annex 1B, par.1 — Core capacity — designated PoE baselin | 3 |
| 6 | IHR-OBL-003 | IHR Art. 5(2) — Surveillance | 2 |
| 7 | IHR-OBL-005 | IHR Art. 6(2) — Notification | 2 |
| 8 | IHR-OBL-006 | IHR Art. 7 — Information-sharing during unexpected or unusua | 2 |
| 9 | IHR-OBL-007 | IHR Art. 8 — Consultation | 2 |
| 10 | IHR-OBL-012 | IHR Annex 1A, par.4 — Core capacity — community and primary  | 2 |

## 7. Gap Types Most Frequently Linked

| Gap Type | Links |
|----------|------:|
| procedural gap | 20 |
| regulatory gap | 16 |
| partial regulatory gap | 9 |
| rights safeguard gap | 6 |
| full gap | 5 |
| coordination gap | 2 |

## 8. Network Overview

- **Total nodes:** 404
- **Total edges:** 676
- **networkx available:** True
- **eigenvector centrality note:** converged

---

*Generated by build_mexico_ihr_network.py · 2026-05-07*
*All data: preliminary_ai_assisted · requires_human_review*
