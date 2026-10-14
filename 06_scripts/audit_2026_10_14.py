"""Apply the source-checked audit migration to its pinned baseline, fail closed."""
from pathlib import Path, PurePosixPath
import csv, hashlib, io, json, lzma, subprocess
ROOT = Path(__file__).resolve().parents[1]
BASE = 'd63ddfe0e2ada4921598a9bc7ef3b5a967eb3ed5'
EXPECTED = '1ee1b2bcec6cbe5ca59aa921c0377c5fac0c8e6d6281e24bec12db6257caf765'
def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)
def digest(data):
    return hashlib.sha256(data).hexdigest()
def checked_path(name):
    p = PurePosixPath(name)
    if p.is_absolute() or '..' in p.parts or '.git' in p.parts:
        raise ValueError('Unsafe path: ' + name)
    return ROOT / name
def original(name):
    checked_path(name)
    return git('show', BASE + ':' + name)
def main():
    subprocess.run(['git','merge-base','--is-ancestor',BASE,'HEAD'], cwd=ROOT, check=True)
    compressed = b''.join((ROOT / f'06_scripts/audit_payload_20261014.xz.{i}').read_bytes() for i in range(4))
    if digest(compressed) != '53c0288a1d83fa0761ee82461b7ded5ca04b4e0aebc02e16a9a257bd7678c730':
        raise ValueError('Compressed payload digest mismatch')
    payload = lzma.decompress(compressed)
    if digest(payload) != EXPECTED:
        raise ValueError('Audit payload digest mismatch')
    spec = json.loads(payload)
    if spec['schema'] != 1 or spec['base_ref'] != BASE:
        raise ValueError('Wrong migration baseline')
    prepared = {}
    for dest, src in spec['base_copies'].items():
        checked_path(dest); prepared[dest] = original(src)
    for name, change in spec['patch'].items():
        path = checked_path(name)
        old = original(name) if change['before'] is not None else b''
        if change['before'] is not None:
            if digest(old) != change['before'] or path.read_bytes() != old:
                raise ValueError('Concurrent change in ' + name)
        elif path.exists():
            raise ValueError('New audit path already exists: ' + name)
        if 'content' in change:
            new = change['content'].encode()
        elif 'lines' in change:
            lines = old.decode().splitlines(keepends=True)
            for start, end, text in reversed(change['lines']):
                lines[start:end] = [text]
            new = ''.join(lines).encode()
        else:
            desc = change['csv']
            rows = list(csv.DictReader(io.StringIO(old.decode('utf-8-sig')), delimiter=desc['old_delimiter'])) if old else []
            index = {r.get(desc['key']): r for r in rows}
            out = []
            for key, delta in desc['rows']:
                row = {k: index.get(key, {}).get(k, '') for k in desc['fields']}
                row.update(delta); out.append(row)
            stream = io.StringIO()
            writer = csv.DictWriter(stream, fieldnames=desc['fields'], delimiter=desc['delimiter'], lineterminator='\n')
            writer.writeheader(); writer.writerows(out)
            new = stream.getvalue().encode()
        if digest(new) != change['after']:
            raise ValueError('Output digest mismatch: ' + name)
        prepared[name] = new
    for dest, src in spec['aliases'].items():
        checked_path(dest); prepared[dest] = prepared[src]
    # All hashes and leases are verified before the first write.
    for name, data in prepared.items():
        path = checked_path(name); path.parent.mkdir(parents=True, exist_ok=True); path.write_bytes(data)
    print(f'Applied {len(prepared)} audited file updates; canonical sources and mirrors validated by digest.')
if __name__ == '__main__':
    main()
