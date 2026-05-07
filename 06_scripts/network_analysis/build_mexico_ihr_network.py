#!/usr/bin/env python3
"""
build_mexico_ihr_network.py
NormTrace-IHR Mexico Pilot — Legal-Institutional Network Analysis Pipeline

Reads cleaned data package CSVs and builds:
  - network_nodes.csv
  - network_edges.csv
  - network_metrics.csv
  - network_summary.md
  - network_methodology.md
  + webapp-ready JSON exports

IMPORTANT: This pipeline does NOT modify source CSVs, legal mappings,
anchoring levels, confidence levels, or assessment summaries. It is
a read-only analytical layer derived from existing corpus data.

This is a corpus-derived legal-institutional traceability network.
It is NOT an observed operational coordination network.
"""

import csv, io, json, os, sys, re, hashlib, textwrap
from collections import defaultdict
from pathlib import Path

# ─── Paths ────────────────────────────────────────────────────────────────────

# Use string-based path to handle trailing-space mount artifact
import os as _os
_script_abs = _os.path.abspath(__file__)
_repo_str = _os.path.normpath(_os.path.join(_os.path.dirname(_script_abs), '..', '..'))
REPO = Path(_repo_str)
PKG  = REPO / '04_outputs' / 'exports' / 'data_package_v0_1'
OUT  = REPO / '04_outputs' / 'network_analysis'
WEB  = REPO / '05_webapp' / 'public' / 'data' / 'network'

OUT.mkdir(parents=True, exist_ok=True)
WEB.mkdir(parents=True, exist_ok=True)

# ─── Helpers ──────────────────────────────────────────────────────────────────

def read_csv_auto(stem):
    """Try _clean suffix first, then plain name. Try ; then , delimiter."""
    candidates = [
        PKG / f'{stem}_clean.csv',
        PKG / f'{stem}.csv',
    ]
    for path in candidates:
        if path.exists():
            with open(path, encoding='utf-8') as f:
                raw = f.read()
            for delim in [';', ',']:
                try:
                    rows = list(csv.DictReader(io.StringIO(raw), delimiter=delim))
                    if rows and len(rows[0]) > 1:
                        # strip BOM keys
                        cleaned = []
                        for row in rows:
                            cleaned.append({k.lstrip('﻿').strip(): (v.strip() if v else '') for k, v in row.items()})
                        return cleaned, str(path)
                except Exception:
                    continue
    return [], None

def slug(text, max_len=80):
    """Clean text for use as ID suffix."""
    return re.sub(r'[^a-z0-9_]', '_', text.lower())[:max_len].strip('_')

def short(text, n=120):
    return (text[:n] + '…') if len(text) > n else text

def eid(src, tgt, rel):
    h = hashlib.md5(f'{src}|{tgt}|{rel}'.encode()).hexdigest()[:8]
    return f'E_{h}'

log_lines = []
def log(msg):
    print(msg)
    log_lines.append(msg)

# ─── Load data ────────────────────────────────────────────────────────────────

log('=== NormTrace-IHR Network Analysis Pipeline ===')
log(f'Data package: {PKG}')
log('')

actors_rows, actors_path = read_csv_auto('mexico_health_governance_actors')
provisions_rows, provisions_path = read_csv_auto('mexico_legal_provisions')
mapping_rows, mapping_path = read_csv_auto('mexico_ihr2005_mapping')
obligations_rows, obligations_path = read_csv_auto('ihr_2005_obligations')
ihr2024_rows, ihr2024_path = read_csv_auto('ihr_2024_changes')
pa_rows, pa_path = read_csv_auto('pandemic_agreement_obligations')
pabs_rows, pabs_path = read_csv_auto('pabs_draft_obligations')
corpus_rows, corpus_path = read_csv_auto('mexico_normative_corpus_index')
gapmap_rows, gapmap_path = read_csv_auto('mexico_implementation_gap_map')

for label, rows, path in [
    ('mexico_health_governance_actors', actors_rows, actors_path),
    ('mexico_legal_provisions', provisions_rows, provisions_path),
    ('mexico_ihr2005_mapping', mapping_rows, mapping_path),
    ('ihr_2005_obligations', obligations_rows, obligations_path),
    ('ihr_2024_changes', ihr2024_rows, ihr2024_path),
    ('pandemic_agreement_obligations', pa_rows, pa_path),
    ('pabs_draft_obligations', pabs_rows, pabs_path),
    ('mexico_normative_corpus_index', corpus_rows, corpus_path),
    ('mexico_implementation_gap_map', gapmap_rows, gapmap_path),
]:
    status = f'FOUND ({len(rows)} rows) — {path}' if rows else 'MISSING'
    log(f'  [{label}]: {status}')

log('')

# ─── Index lookups ────────────────────────────────────────────────────────────

obl_by_id = {r['obligation_id']: r for r in obligations_rows}
prov_by_id = {r['provision_id']: r for r in provisions_rows}
corpus_by_id = {r['norm_id']: r for r in corpus_rows}
actor_by_id = {r['actor_id']: r for r in actors_rows}

# ─── Node registry ────────────────────────────────────────────────────────────

nodes = {}   # node_id -> dict

NODE_FIELDS = [
    'node_id', 'label', 'node_type', 'layer', 'source_table', 'source_id',
    'description', 'instrument', 'article', 'sector', 'implementation_domain',
    'actor_type', 'government_level', 'normative_hierarchy',
    'anchoring_level', 'gap_type', 'confidence_level', 'review_status', 'notes'
]

def add_node(node_id, label, node_type, layer, source_table, source_id='',
             description='', instrument='', article='', sector='',
             implementation_domain='', actor_type='', government_level='',
             normative_hierarchy='', anchoring_level='', gap_type='',
             confidence_level='', review_status='', notes=''):
    if node_id not in nodes:
        nodes[node_id] = {
            'node_id': node_id, 'label': label, 'node_type': node_type,
            'layer': layer, 'source_table': source_table, 'source_id': source_id,
            'description': short(description), 'instrument': instrument,
            'article': article, 'sector': sector,
            'implementation_domain': short(implementation_domain),
            'actor_type': actor_type, 'government_level': government_level,
            'normative_hierarchy': normative_hierarchy,
            'anchoring_level': anchoring_level, 'gap_type': gap_type,
            'confidence_level': confidence_level, 'review_status': review_status,
            'notes': short(notes)
        }
    return node_id

# ─── Edge registry ────────────────────────────────────────────────────────────

edges = {}   # edge_id -> dict

EDGE_FIELDS = [
    'edge_id', 'source', 'target', 'relationship_type', 'relationship_label',
    'weight', 'source_table', 'source_row_id', 'instrument', 'article',
    'domestic_norm', 'domestic_article', 'anchoring_level', 'gap_type',
    'confidence_level', 'review_status', 'notes'
]

def add_edge(src, tgt, rel_type, rel_label, weight=1.0,
             source_table='', source_row_id='', instrument='', article='',
             domestic_norm='', domestic_article='', anchoring_level='',
             gap_type='', confidence_level='', review_status='', notes=''):
    if src == tgt:
        return
    eid_val = eid(src, tgt, rel_type)
    if eid_val not in edges:
        edges[eid_val] = {
            'edge_id': eid_val, 'source': src, 'target': tgt,
            'relationship_type': rel_type, 'relationship_label': rel_label,
            'weight': weight, 'source_table': source_table,
            'source_row_id': source_row_id, 'instrument': instrument,
            'article': article, 'domestic_norm': domestic_norm,
            'domestic_article': domestic_article,
            'anchoring_level': anchoring_level, 'gap_type': gap_type,
            'confidence_level': confidence_level, 'review_status': review_status,
            'notes': short(notes)
        }

# ─── MATCH TYPE → RELATIONSHIP ────────────────────────────────────────────────

MATCH_REL = {
    'direct statutory':        ('anchors_obligation',           'anchors (direct statutory)'),
    'indirect statutory':      ('indirectly_anchors_obligation','anchors (indirect statutory)'),
    'regulatory':              ('partially_anchors_obligation', 'anchors (regulatory)'),
    'coordination':            ('partially_anchors_obligation', 'anchors (coordination)'),
    'contextual constitutional':('indirectly_anchors_obligation','anchors (contextual constitutional)'),
    'actor-only':              ('partially_anchors_obligation', 'anchors (actor-only)'),
    'no match identified':     ('requires_review_for',          'requires review for'),
}

ANCHORING_WEIGHT = {
    'direct statutory': 3.0,
    'indirect statutory': 2.0,
    'regulatory': 1.5,
    'coordination': 1.5,
    'contextual constitutional': 1.5,
    'actor-only': 1.0,
    'no match identified': 0.5,
}

# ─── IMPLEMENTATION DOMAIN NORMALISATION ──────────────────────────────────────

def parse_domains(domain_str):
    """Split multi-domain strings into canonical tokens."""
    raw = re.split(r'[;,]', domain_str)
    out = []
    for part in raw:
        part = part.strip()
        if not part:
            continue
        # Canonicalise CC codes
        m = re.match(r'(CC\d+)\s*[–-]?\s*(.*)', part)
        if m:
            code = m.group(1).strip()
            label = m.group(2).strip()
            out.append(f'{code} – {label}' if label else code)
        elif part.lower().startswith('poe'):
            out.append('PoE – Points of Entry')
        elif part.lower().startswith('rights'):
            out.append('Rights Protection')
        else:
            out.append(part)
    return [d for d in out if d]

def domain_node_id(domain):
    return 'DOM_' + slug(domain, 60).upper()

# ─── BUILD NODES ──────────────────────────────────────────────────────────────

log('Building nodes...')

# 1. Actors
for r in actors_rows:
    add_node(
        node_id=r['actor_id'],
        label=r['actor_name'],
        node_type='actor',
        layer='institutional_actor_layer',
        source_table='mexico_health_governance_actors',
        source_id=r['actor_id'],
        description=r.get('core_functions',''),
        sector=r.get('sector',''),
        actor_type=r.get('legal_nature',''),
        government_level=r.get('government_level',''),
        notes=r.get('ihr_relevance','')
    )

# 2. Legal instruments (from corpus index)
for r in corpus_rows:
    add_node(
        node_id=r['norm_id'],
        label=r.get('short_title') or r['norm_title'],
        node_type='legal_instrument',
        layer='domestic_legal_layer',
        source_table='mexico_normative_corpus_index',
        source_id=r['norm_id'],
        description=r.get('legal_function',''),
        instrument=r['norm_title'],
        sector=r.get('sector',''),
        normative_hierarchy=r.get('normative_hierarchy',''),
        notes=r.get('relevance_for_ihr','')
    )

# 3. Domestic provisions
for r in provisions_rows:
    add_node(
        node_id=r['provision_id'],
        label=f"{r.get('norm_title','')[:40]} {r.get('article','')}".strip(),
        node_type='domestic_provision',
        layer='domestic_legal_layer',
        source_table='mexico_legal_provisions',
        source_id=r['provision_id'],
        description=r.get('provision_text',''),
        instrument=r.get('norm_title',''),
        article=r.get('article',''),
        sector=r.get('topic',''),
        normative_hierarchy=r.get('hierarchy_level','')
    )

# 4. IHR 2005 obligations
for r in obligations_rows:
    domains = parse_domains(r.get('implementation_domain',''))
    add_node(
        node_id=r['obligation_id'],
        label=f"IHR {r.get('article','')} — {r.get('article_title','')}",
        node_type='ihr2005_obligation',
        layer='international_normative_layer',
        source_table='ihr_2005_obligations',
        source_id=r['obligation_id'],
        description=r.get('obligation_text_short',''),
        instrument='IHR 2005',
        article=r.get('article',''),
        implementation_domain=r.get('implementation_domain',''),
        notes=r.get('notes','')
    )
    # Domain nodes
    for d in domains:
        nid = domain_node_id(d)
        add_node(
            node_id=nid,
            label=d,
            node_type='implementation_domain',
            layer='analytical_assessment_layer',
            source_table='ihr_2005_obligations',
            source_id=r['obligation_id'],
            implementation_domain=d
        )

# 5. IHR 2024 changes
for r in ihr2024_rows:
    add_node(
        node_id=r['change_id'],
        label=f"IHR 2024 {r.get('article_or_annex','')} — {r.get('type_of_change','')}",
        node_type='ihr2024_change',
        layer='update_review_layer',
        source_table='ihr_2024_changes',
        source_id=r['change_id'],
        description=r.get('change_summary',''),
        instrument='IHR 2024 Amendments',
        article=r.get('article_or_annex',''),
        notes=r.get('new_or_modified_concept','')
    )

# 6. Pandemic Agreement obligations
for r in pa_rows:
    add_node(
        node_id=r['pa_obligation_id'],
        label=f"PA {r.get('article','')} — {r.get('theme','')}",
        node_type='pandemic_agreement_obligation',
        layer='international_normative_layer',
        source_table='pandemic_agreement_obligations',
        source_id=r['pa_obligation_id'],
        description=r.get('obligation_or_commitment_summary',''),
        instrument='WHO Pandemic Agreement',
        article=r.get('article',''),
        implementation_domain=r.get('implementation_domain',''),
        notes=r.get('notes','')
    )

# 7. PABS draft obligations
for r in pabs_rows:
    add_node(
        node_id=r['pabs_draft_id'],
        label=f"PABS [DRAFT] {r.get('section','')} — {r.get('draft_element','')}",
        node_type='pabs_draft_obligation',
        layer='international_normative_layer',
        source_table='pabs_draft_obligations',
        source_id=r['pabs_draft_id'],
        description=r.get('draft_obligation_or_requirement_summary',''),
        instrument='PABS Draft (IGWG Bureau, 9 March 2026)',
        implementation_domain=r.get('implementation_domain',''),
        notes='PROVISIONAL — draft text only; not adopted'
    )

# 8. Gap type nodes (from gap map)
gap_type_seen = set()
for r in gapmap_rows:
    gt = r.get('main_gap_type','').strip()
    if gt and gt not in gap_type_seen and gt.lower() not in ('none',''):
        gt_id = 'GAP_' + slug(gt, 60).upper()
        add_node(
            node_id=gt_id,
            label=gt,
            node_type='gap_type',
            layer='analytical_assessment_layer',
            source_table='mexico_implementation_gap_map',
            source_id=gt,
            description=f'Gap type: {gt}'
        )
        gap_type_seen.add(gt)

# Gap types from mapping rows too
for r in mapping_rows:
    gt = r.get('gap_type','').strip()
    if gt and gt.lower() not in ('none','') and gt not in gap_type_seen:
        gt_id = 'GAP_' + slug(gt, 60).upper()
        add_node(
            node_id=gt_id,
            label=gt,
            node_type='gap_type',
            layer='analytical_assessment_layer',
            source_table='mexico_ihr2005_mapping',
            source_id=gt,
            description=f'Gap type: {gt}'
        )
        gap_type_seen.add(gt)

log(f'  Nodes built: {len(nodes)}')

# ─── BUILD EDGES ──────────────────────────────────────────────────────────────

log('Building edges...')

# RULE A — Actor → Legal instrument (from actors table: source_norm)
for r in actors_rows:
    actor_id = r['actor_id']
    source_norms = r.get('source_norm','')
    # Try to match norm_id by looking for instrument short_titles or ids in the corpus
    for corpus_r in corpus_rows:
        nid = corpus_r['norm_id']
        title = corpus_r['norm_title']
        short_t = corpus_r.get('short_title','')
        # Match if the instrument title/abbreviation appears in source_norm field
        if (title and title[:20] in source_norms) or \
           (short_t and len(short_t) > 3 and short_t in source_norms):
            add_edge(
                src=actor_id, tgt=nid,
                rel_type='has_legal_basis_in',
                rel_label='has legal basis in',
                weight=2.0,
                source_table='mexico_health_governance_actors',
                source_row_id=actor_id,
                instrument=title,
                notes=f'Actor {r["actor_name"]} grounded in {short_t or title}'
            )

# RULE B — Actor ↔ Domestic provision (from provisions: actor_mentioned)
for r in provisions_rows:
    prov_id = r['provision_id']
    actor_mentioned = r.get('actor_mentioned','').strip()
    power_granted = r.get('power_granted','').strip()
    duty_created = r.get('duty_created','').strip()
    procedure_created = r.get('procedure_created','').strip()
    coordination_mechanism = r.get('coordination_mechanism','').strip()

    # Find actor node matching actor_mentioned
    if actor_mentioned and actor_mentioned.lower() not in ('no explicit actor','none identified',''):
        matched_actor = None
        for a in actors_rows:
            if a['actor_name'].lower() in actor_mentioned.lower() or \
               actor_mentioned.lower() in a['actor_name'].lower():
                matched_actor = a['actor_id']
                break
        if matched_actor:
            add_edge(
                src=prov_id, tgt=matched_actor,
                rel_type='mentions_actor',
                rel_label='mentions actor',
                weight=1.0,
                source_table='mexico_legal_provisions',
                source_row_id=prov_id,
                instrument=r.get('norm_title',''),
                article=r.get('article',''),
                notes=short(actor_mentioned)
            )
            if power_granted and power_granted.lower() not in ('none identified',''):
                add_edge(
                    src=prov_id, tgt=matched_actor,
                    rel_type='grants_power_to',
                    rel_label='grants power to',
                    weight=2.0,
                    source_table='mexico_legal_provisions',
                    source_row_id=prov_id,
                    instrument=r.get('norm_title',''),
                    article=r.get('article',''),
                    notes=short(power_granted)
                )
            if duty_created and duty_created.lower() not in ('none identified',''):
                add_edge(
                    src=prov_id, tgt=matched_actor,
                    rel_type='creates_duty_for',
                    rel_label='creates duty for',
                    weight=1.5,
                    source_table='mexico_legal_provisions',
                    source_row_id=prov_id,
                    instrument=r.get('norm_title',''),
                    article=r.get('article',''),
                    notes=short(duty_created)
                )
            if procedure_created and procedure_created.lower() not in ('none identified',''):
                add_edge(
                    src=prov_id, tgt=matched_actor,
                    rel_type='creates_procedure_for',
                    rel_label='creates procedure for',
                    weight=1.5,
                    source_table='mexico_legal_provisions',
                    source_row_id=prov_id,
                    instrument=r.get('norm_title',''),
                    article=r.get('article',''),
                    notes=short(procedure_created)
                )
            if coordination_mechanism and coordination_mechanism.lower() not in ('none identified',''):
                add_edge(
                    src=prov_id, tgt=matched_actor,
                    rel_type='coordinates_with',
                    rel_label='coordinates with',
                    weight=1.5,
                    source_table='mexico_legal_provisions',
                    source_row_id=prov_id,
                    instrument=r.get('norm_title',''),
                    article=r.get('article',''),
                    notes=short(coordination_mechanism)
                )

# RULE C — Domestic provision → Legal instrument (belongs_to)
for r in provisions_rows:
    prov_id = r['provision_id']
    norm_id = r.get('norm_id','').strip()
    if norm_id and norm_id in corpus_by_id:
        add_edge(
            src=prov_id, tgt=norm_id,
            rel_type='belongs_to',
            rel_label='belongs to',
            weight=1.0,
            source_table='mexico_legal_provisions',
            source_row_id=prov_id,
            instrument=r.get('norm_title',''),
            article=r.get('article','')
        )

# RULE D — Domestic provision → IHR 2005 obligation (from mapping)
for r in mapping_rows:
    prov_id = r.get('domestic_provision_id','').strip()
    obl_id  = r.get('obligation_id','').strip()
    match_type = r.get('match_type','').strip().lower()
    anchoring = r.get('anchoring_level','').strip()
    gap = r.get('gap_type','').strip()
    conf = r.get('confidence_level','').strip()
    rev = r.get('review_status','').strip()
    mapping_id = r.get('mapping_id','')

    if not prov_id or not obl_id:
        continue
    # Ensure nodes exist even if missing from source tables
    if prov_id not in nodes:
        add_node(prov_id, prov_id, 'domestic_provision', 'domestic_legal_layer',
                 'mexico_ihr2005_mapping', prov_id,
                 instrument=r.get('domestic_norm',''),
                 article=r.get('domestic_article',''))
    if obl_id not in nodes:
        add_node(obl_id, obl_id, 'ihr2005_obligation', 'international_normative_layer',
                 'mexico_ihr2005_mapping', obl_id, instrument='IHR 2005')

    rel_type, rel_label = MATCH_REL.get(match_type, ('requires_review_for', 'requires review for'))
    try:
        weight = ANCHORING_WEIGHT.get(match_type, 1.0) * (float(anchoring) / 5.0 + 0.2)
    except (ValueError, TypeError):
        weight = 1.0

    add_edge(
        src=prov_id, tgt=obl_id,
        rel_type=rel_type,
        rel_label=rel_label,
        weight=round(weight, 3),
        source_table='mexico_ihr2005_mapping',
        source_row_id=mapping_id,
        instrument=r.get('domestic_norm',''),
        article=r.get('domestic_article',''),
        domestic_norm=r.get('domestic_norm',''),
        domestic_article=r.get('domestic_article',''),
        anchoring_level=anchoring,
        gap_type=gap,
        confidence_level=conf,
        review_status=rev
    )

    # Also link provision → gap type node
    if gap and gap.lower() not in ('none',''):
        gt_id = 'GAP_' + slug(gap, 60).upper()
        if gt_id in nodes:
            add_edge(
                src=obl_id, tgt=gt_id,
                rel_type='linked_to_gap_type',
                rel_label='linked to gap type',
                weight=1.0,
                source_table='mexico_ihr2005_mapping',
                source_row_id=mapping_id,
                gap_type=gap
            )

# RULE E — IHR 2005 obligation → implementation domain
for r in obligations_rows:
    obl_id = r['obligation_id']
    domains = parse_domains(r.get('implementation_domain',''))
    for d in domains:
        nid = domain_node_id(d)
        if nid in nodes:
            add_edge(
                src=obl_id, tgt=nid,
                rel_type='linked_to_implementation_domain',
                rel_label='linked to implementation domain',
                weight=1.0,
                source_table='ihr_2005_obligations',
                source_row_id=obl_id,
                instrument='IHR 2005'
            )

# RULE F — already done above (obl → gap_type within Rule D)

# RULE G — IHR 2024 change → IHR 2005 obligation
for r in ihr2024_rows:
    change_id = r['change_id']
    obl_refs = r.get('relevant_ihr2005_obligation_id','').strip()
    for ref in re.split(r'[;,]', obl_refs):
        ref = ref.strip()
        if ref and ref != 'TBD_REVIEW' and ref.startswith('IHR-OBL-'):
            if ref in obl_by_id:
                add_edge(
                    src=change_id, tgt=ref,
                    rel_type='linked_to_ihr2024_change',
                    rel_label='IHR 2024 change affects',
                    weight=1.5,
                    source_table='ihr_2024_changes',
                    source_row_id=change_id,
                    instrument='IHR 2024 Amendments',
                    article=r.get('article_or_annex','')
                )

# RULE H — PA/PABS → implementation_domain + possible_domestic_actor
for r in pa_rows:
    pa_id = r['pa_obligation_id']
    # Link to implementation domains (if parseable)
    impl = r.get('implementation_domain','').strip()
    if impl:
        domains = parse_domains(impl)
        for d in domains:
            nid = domain_node_id(d)
            if nid in nodes:
                add_edge(
                    src=pa_id, tgt=nid,
                    rel_type='linked_to_implementation_domain',
                    rel_label='linked to implementation domain',
                    weight=1.0,
                    source_table='pandemic_agreement_obligations',
                    source_row_id=pa_id,
                    instrument='WHO Pandemic Agreement'
                )
    # Link to possible domestic actors where explicitly named
    actors_field = r.get('possible_domestic_actor','').strip()
    if actors_field:
        for a in actors_rows:
            if a['actor_name'].lower() in actors_field.lower():
                add_edge(
                    src=pa_id, tgt=a['actor_id'],
                    rel_type='linked_to_pandemic_agreement',
                    rel_label='PA obligation names actor',
                    weight=1.0,
                    source_table='pandemic_agreement_obligations',
                    source_row_id=pa_id,
                    instrument='WHO Pandemic Agreement',
                    notes=short(actors_field)
                )

for r in pabs_rows:
    pabs_id = r['pabs_draft_id']
    impl = r.get('implementation_domain','').strip()
    if impl:
        domains = parse_domains(impl)
        for d in domains:
            nid = domain_node_id(d)
            if nid in nodes:
                add_edge(
                    src=pabs_id, tgt=nid,
                    rel_type='linked_to_pabs',
                    rel_label='PABS draft linked to domain',
                    weight=0.5,
                    source_table='pabs_draft_obligations',
                    source_row_id=pabs_id,
                    instrument='PABS Draft (IGWG, 9 March 2026)',
                    notes='PROVISIONAL — draft text only'
                )
    actors_field = r.get('possible_domestic_actor','').strip()
    if actors_field:
        for a in actors_rows:
            if a['actor_name'].lower() in actors_field.lower():
                add_edge(
                    src=pabs_id, tgt=a['actor_id'],
                    rel_type='linked_to_pabs',
                    rel_label='PABS draft names actor',
                    weight=0.5,
                    source_table='pabs_draft_obligations',
                    source_row_id=pabs_id,
                    instrument='PABS Draft',
                    notes='PROVISIONAL — ' + short(actors_field)
                )

log(f'  Edges built: {len(edges)}')

# ─── NETWORK METRICS ──────────────────────────────────────────────────────────

log('Computing network metrics...')

try:
    import networkx as nx
    G = nx.DiGraph()
    for nid, n in nodes.items():
        G.add_node(nid, **n)
    for eid_val, e in edges.items():
        G.add_edge(e['source'], e['target'], weight=e['weight'],
                   relationship_type=e['relationship_type'])

    degree = dict(G.degree())
    in_deg = dict(G.in_degree())
    out_deg = dict(G.out_degree())
    wdeg = {n: sum(d.get('weight',1) for _,_,d in G.edges(n, data=True)) +
               sum(d.get('weight',1) for _,_,d in G.in_edges(n, data=True))
            for n in G.nodes()}

    log('  Computing betweenness centrality...')
    between = nx.betweenness_centrality(G, normalized=True, weight='weight')

    log('  Computing eigenvector centrality...')
    try:
        if G.number_of_nodes() == 0:
            raise nx.NetworkXPointlessConcept('empty graph')
        eigenv = nx.eigenvector_centrality(G, max_iter=500, weight='weight')
        eigenv_note = ''
    except (nx.PowerIterationFailedConvergence, nx.NetworkXPointlessConcept) as _e:
        eigenv = {n: 0.0 for n in G.nodes()}
        eigenv_note = f'eigenvector_centrality skipped: {_e}'
        log(f'  NOTE: {eigenv_note}')

    log('  Computing connected components...')
    comp_map = {}
    for i, comp in enumerate(nx.weakly_connected_components(G)):
        for n in comp:
            comp_map[n] = i

    metrics = []
    for nid in nodes:
        metrics.append({
            'node_id': nid,
            'node_type': nodes[nid]['node_type'],
            'layer': nodes[nid]['layer'],
            'label': nodes[nid]['label'],
            'degree': degree.get(nid, 0),
            'weighted_degree': round(wdeg.get(nid, 0), 4),
            'in_degree': in_deg.get(nid, 0),
            'out_degree': out_deg.get(nid, 0),
            'betweenness_centrality': round(between.get(nid, 0), 6),
            'eigenvector_centrality': round(eigenv.get(nid, 0), 6),
            'component_id': comp_map.get(nid, -1),
        })
    log(f'  Metrics computed for {len(metrics)} nodes')
    nx_available = True
except ImportError:
    log('  WARNING: networkx not available — metrics will be empty stubs')
    metrics = [{'node_id': nid, 'node_type': nodes[nid]['node_type'],
                'layer': nodes[nid]['layer'], 'label': nodes[nid]['label'],
                'degree':0,'weighted_degree':0,'in_degree':0,'out_degree':0,
                'betweenness_centrality':0,'eigenvector_centrality':0,'component_id':0}
               for nid in nodes]
    nx_available = False
    eigenv_note = 'networkx not available'

# ─── WRITE CSV FILES ───────────────────────────────────────────────────────────

log('Writing CSV files...')

def write_csv(path, fieldnames, rows, delimiter=','):
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_ALL,
                           lineterminator='\n', extrasaction='ignore')
        w.writeheader()
        w.writerows(rows)
    log(f'  Written: {path} ({len(rows)} rows)')

write_csv(OUT / 'network_nodes.csv', NODE_FIELDS, list(nodes.values()))
write_csv(OUT / 'network_edges.csv', EDGE_FIELDS, list(edges.values()))

METRIC_FIELDS = ['node_id','node_type','layer','label','degree','weighted_degree',
                 'in_degree','out_degree','betweenness_centrality',
                 'eigenvector_centrality','component_id']
write_csv(OUT / 'network_metrics.csv', METRIC_FIELDS, metrics)

# ─── WRITE JSON FILES ─────────────────────────────────────────────────────────

log('Writing JSON exports...')

def write_json(path, obj):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
    log(f'  Written: {path}')

write_json(WEB / 'nodes.json', list(nodes.values()))
write_json(WEB / 'edges.json', list(edges.values()))
write_json(WEB / 'metrics.json', metrics)

# ─── SUMMARY STATISTICS ───────────────────────────────────────────────────────

log('Computing summary statistics...')

from collections import Counter

node_type_counts = Counter(n['node_type'] for n in nodes.values())
edge_rel_counts = Counter(e['relationship_type'] for e in edges.values())

# Top actors by degree
actor_metrics = [m for m in metrics if nodes.get(m['node_id'],{}).get('node_type') == 'actor']
top_actors_degree = sorted(actor_metrics, key=lambda x: x['degree'], reverse=True)[:10]
top_actors_between = sorted(actor_metrics, key=lambda x: x['betweenness_centrality'], reverse=True)[:10]

# Top legal instruments by degree
instr_metrics = [m for m in metrics if nodes.get(m['node_id'],{}).get('node_type') == 'legal_instrument']
top_instruments = sorted(instr_metrics, key=lambda x: x['degree'], reverse=True)[:10]

# IHR obligations by number of domestic anchors
obl_anchor_counts = Counter()
for e in edges.values():
    if e['relationship_type'] in ('anchors_obligation','indirectly_anchors_obligation','partially_anchors_obligation'):
        obl_anchor_counts[e['target']] += 1
top_obligations = obl_anchor_counts.most_common(10)

# Gap types linked
gap_freq = Counter()
for e in edges.values():
    if e['relationship_type'] == 'linked_to_gap_type':
        gap_freq[e['target']] += 1

# ─── WRITE network_summary.md ─────────────────────────────────────────────────

summary_md = f'''---
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
''' + '\n'.join(f'| {t} | {c} |' for t, c in sorted(node_type_counts.items())) + f'''
| **TOTAL** | **{sum(node_type_counts.values())}** |

## 2. Edges by Relationship Type

| Relationship Type | Count |
|-------------------|------:|
''' + '\n'.join(f'| {t} | {c} |' for t, c in sorted(edge_rel_counts.items(), key=lambda x: -x[1])) + f'''
| **TOTAL** | **{sum(edge_rel_counts.values())}** |

## 3. Top 10 Actors by Degree (corpus-derived)

| Rank | Actor | Degree | In | Out | Betweenness |
|------|-------|-------:|---:|----:|:-----------:|
''' + '\n'.join(
    f'| {i+1} | {nodes[m["node_id"]]["label"]} | {m["degree"]} | {m["in_degree"]} | {m["out_degree"]} | {m["betweenness_centrality"]:.4f} |'
    for i, m in enumerate(top_actors_degree)
) + '''

## 4. Top 10 Actors by Betweenness Centrality

| Rank | Actor | Betweenness | Degree |
|------|-------|:-----------:|-------:|
''' + '\n'.join(
    f'| {i+1} | {nodes[m["node_id"]]["label"]} | {m["betweenness_centrality"]:.4f} | {m["degree"]} |'
    for i, m in enumerate(top_actors_between)
) + '''

## 5. Top 10 Legal Instruments by Degree

| Rank | Instrument | Degree | In | Out |
|------|-----------|-------:|---:|----:|
''' + '\n'.join(
    f'| {i+1} | {nodes[m["node_id"]]["label"]} | {m["degree"]} | {m["in_degree"]} | {m["out_degree"]} |'
    for i, m in enumerate(top_instruments)
) + '''

## 6. Top 10 IHR 2005 Obligations by Number of Domestic Anchors

| Rank | Obligation ID | Label | Anchors |
|------|--------------|-------|--------:|
''' + '\n'.join(
    f'| {i+1} | {obl_id} | {nodes.get(obl_id, {}).get("label","")[:60]} | {count} |'
    for i, (obl_id, count) in enumerate(top_obligations)
) + '''

## 7. Gap Types Most Frequently Linked

| Gap Type | Links |
|----------|------:|
''' + '\n'.join(
    f'| {nodes.get(gt_id, {}).get("label", gt_id)} | {count} |'
    for gt_id, count in gap_freq.most_common(10)
) + f'''

## 8. Network Overview

- **Total nodes:** {len(nodes)}
- **Total edges:** {len(edges)}
- **networkx available:** {nx_available}
- **eigenvector centrality note:** {eigenv_note if not nx_available else (eigenv_note or 'converged')}

---

*Generated by build_mexico_ihr_network.py · 2026-05-07*
*All data: preliminary_ai_assisted · requires_human_review*
'''

with open(OUT / 'network_summary.md', 'w', encoding='utf-8', newline='\n') as f:
    f.write(summary_md)
log(f'  Written: {OUT}/network_summary.md')

# ─── WRITE network_methodology.md ─────────────────────────────────────────────

methodology_md = '''---
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
'''

with open(OUT / 'network_methodology.md', 'w', encoding='utf-8', newline='\n') as f:
    f.write(methodology_md)
log(f'  Written: {OUT}/network_methodology.md')

# ─── WRITE summary.json for webapp ────────────────────────────────────────────

summary_obj = {
    'generated': '2026-05-07',
    'pipeline': 'build_mexico_ihr_network.py',
    'version': '0.1',
    'status': 'preliminary_ai_assisted',
    'caution': (
        'Corpus-derived legal-institutional traceability network. '
        'Not an observed operational coordination network. '
        'Centrality = legal-institutional salience in documented corpus only.'
    ),
    'node_count': len(nodes),
    'edge_count': len(edges),
    'node_type_counts': dict(node_type_counts),
    'edge_rel_counts': dict(edge_rel_counts),
    'top_actors_degree': [
        {'node_id': m['node_id'], 'label': nodes[m['node_id']]['label'],
         'degree': m['degree'], 'betweenness': m['betweenness_centrality']}
        for m in top_actors_degree
    ],
    'top_actors_betweenness': [
        {'node_id': m['node_id'], 'label': nodes[m['node_id']]['label'],
         'degree': m['degree'], 'betweenness': m['betweenness_centrality']}
        for m in top_actors_between
    ],
    'top_instruments': [
        {'node_id': m['node_id'], 'label': nodes[m['node_id']]['label'],
         'degree': m['degree']}
        for m in top_instruments
    ],
    'top_obligations_by_anchors': [
        {'obligation_id': obl_id,
         'label': nodes.get(obl_id, {}).get('label',''),
         'anchor_count': count}
        for obl_id, count in top_obligations
    ],
    'gap_type_link_freq': [
        {'gap_type': nodes.get(gt_id, {}).get('label', gt_id), 'links': count}
        for gt_id, count in gap_freq.most_common(10)
    ]
}

write_json(WEB / 'summary.json', summary_obj)

log('')
log('=== Pipeline complete ===')
log(f'  Nodes: {len(nodes)}')
log(f'  Edges: {len(edges)}')
log(f'  Metrics: {len(metrics)}')
log(f'  networkx: {nx_available}')
