#!/usr/bin/env python3
"""Apply a hash-pinned, data-only legal-evidence migration to the audit branch.

The XZ payload is JSON: explicit text splices, CSV field updates, and new files.
It is never evaluated as code. All preconditions are checked before mutation.
The expanded changes, baseline bytes, and a field-level journal are committed
only by the separate audit workflow after validation and browser tests pass.
"""
from __future__ import annotations
import csv
import hashlib
import io
import json
import lzma
import os
from pathlib import Path, PurePosixPath
import sys

ROOT = Path(__file__).resolve().parents[2]
DIGEST = '977463cfeb63b3f72b2f95b4a196b3354674d50ede4213938d75a3397768347a'
ARCHIVE = ROOT / '99_archive/legal_audit_2026-10-14'
MARKER = ROOT / '00_project/audit_2026-10-14/migration_applied.json'
PREFIXES = ('00_project/', '03_tables/', '05_webapp/src/',
            '05_webapp/public/data/markdown/', '05_webapp/tests/',
            '06_scripts/build_tables/', '06_scripts/validation/')


def path_for(name: str) -> Path:
    p = PurePosixPath(name)
    if p.is_absolute() or '..' in p.parts or not name.startswith(PREFIXES):
        raise ValueError(f'Path outside migration scope: {name}')
    result = ROOT / p
    if not result.resolve().is_relative_to(ROOT) or result.is_symlink():
        raise ValueError(f'Unsafe migration target: {name}')
    return result


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    if MARKER.exists():
        print('Migration already committed; running validation without reapplying it.')
        return
    if os.environ.get('GITHUB_ACTIONS') == 'true' and os.environ.get('GITHUB_REF_NAME') != 'audit/source-evidence-2026-10-14':
        raise RuntimeError('Migration may run only on the dedicated audit branch.')
    payload_dir = Path(__file__).parent / 'audit_payload'
    packed = b''.join((payload_dir / f'part{i:02}.xzpart').read_bytes() for i in range(3))
    decoded = lzma.decompress(packed, memlimit=128 * 1024 * 1024)
    if sha(decoded) != DIGEST:
        raise ValueError('Payload hash mismatch; nothing changed.')
    bundle = json.loads(decoded)
    operations = bundle['operations']
    if len({o['path'] for o in operations}) != len(operations):
        raise ValueError('Duplicate migration target.')
    originals: dict[str, bytes] = {}
    prepared: dict[str, bytes] = {}
    changes = []
    for op in operations:
        name = op['path']; p = path_for(name)
        raw = p.read_bytes() if p.is_file() else None
        expected = op['sha256']
        if expected is None:
            if p.exists(): raise ValueError(f'New file already exists: {name}')
        elif raw is None or sha(raw) != expected:
            raise ValueError(f'Baseline differs for {name}; refusing stale update.')
        if raw is not None: originals[name] = raw
    # Prepare the entire transaction in memory, respecting copy dependencies.
    for op in operations:
        name = op['path']; old = originals.get(name, b'')
        kind = op['kind']
        if kind == 'write':
            new = op['content'].encode('utf-8')
        elif kind == 'copy':
            path_for(op['source'])
            new = prepared[op['source']]
        elif kind == 'splices':
            text = old.decode('utf-8'); last = len(text)
            for start, end, replacement in reversed(op['edits']):
                if not (0 <= start <= end <= last): raise ValueError(f'Invalid splice: {name}')
                text = text[:start] + replacement + text[end:]; last = start
            new = text.encode('utf-8')
        elif kind == 'csv':
            reader = csv.DictReader(io.StringIO(old.decode('utf-8'), newline=''))
            records = list(reader); key = op['key']
            known = {r[key] for r in records}
            if len(known) != len(records) or not set(op['updates']).issubset(known):
                raise ValueError(f'CSV key mismatch: {name}')
            revised = []
            for r in records:
                n = dict(r)
                n.update({'legacy_' + f: r[f] for f in op['legacy']})
                n.update(op['defaults']); n.update(op['updates'].get(r[key], {}))
                for f in op['fields']:
                    if n.get(f, '') != r.get(f, ''):
                        changes.append({'file': name, 'id': r[key], 'field': f,
                                        'before': r.get(f), 'after': n.get(f)})
                revised.append(n)
            for n in op['additions']:
                if n[key] in known: raise ValueError(f'Duplicate added record: {name}/{n[key]}')
                known.add(n[key]); revised.append(n)
                changes.append({'file': name, 'id': n[key], 'added_record': n})
            output = io.StringIO(newline='')
            writer = csv.DictWriter(output, fieldnames=op['fields'], lineterminator='\n')
            writer.writeheader(); writer.writerows(revised)
            new = output.getvalue().encode('utf-8')
        else:
            raise ValueError(f'Unknown data operation: {kind}')
        prepared[name] = new
    for name, raw in originals.items():
        destination = ARCHIVE / name
        if destination.exists(): raise ValueError(f'Baseline archive already exists: {name}')
    # Preserve the replaced numeric SPAR output separately from current data.
    for name in ['04_outputs/exports/spar_normtrace_divergence.json',
                 '05_webapp/public/data/derived/spar_normtrace_divergence.json']:
        p = ROOT / name
        if p.is_file(): originals[name] = p.read_bytes()
    for name, raw in originals.items():
        p = ARCHIVE / name; p.parent.mkdir(parents=True, exist_ok=True); p.write_bytes(raw)
    for name, raw in prepared.items():
        p = path_for(name); p.parent.mkdir(parents=True, exist_ok=True); p.write_bytes(raw)
    journal = ROOT / '00_project/audit_2026-10-14/change_log.json'
    journal.write_text(json.dumps(changes, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    note = ROOT / '04_outputs/exports/data_package_v0_1/README_SUPERSEDED.md'
    note.write_text('# Historical v0.1 package\n\nRetained for reproducibility. Its preliminary scores and gap classifications are superseded for current use by the evidence-audit release v0.2. See ../data_package_v0_2/manifest.json and 00_project/audit_2026-10-14.\n', encoding='utf-8')
    MARKER.write_text(json.dumps({'payload_sha256': DIGEST, 'base_commit': bundle['base_commit'],
        'files': [{'path': n, 'sha256': sha(b)} for n, b in prepared.items()],
        'field_level_changes': len(changes), 'legal_validation': 'pending'}, indent=2) + '\n', encoding='utf-8')
    print(f'Applied {len(prepared)} source files; preserved originals and {len(changes)} field-level changes.')


if __name__ == '__main__':
    main()
