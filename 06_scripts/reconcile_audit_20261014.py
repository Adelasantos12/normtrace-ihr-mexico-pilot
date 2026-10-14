"""Reconcile the concurrent source audit without discarding its provenance."""
from pathlib import Path
import csv, io, json, shutil, subprocess
ROOT = Path(__file__).resolve().parents[1]
OTHER = '60f5c89903511710ed1615cbf7e7566c5ebd9d40'
MAPPING = '03_tables/country_legal_mapping/mexico_ihr2005_mapping.csv'
def from_git(path):
    return subprocess.check_output(['git', 'show', OTHER + ':' + path], cwd=ROOT)
def write_csv(path, rows, fields):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('w', encoding='utf-8', newline='') as f:
        w=csv.DictWriter(f, fieldnames=fields, lineterminator='\n'); w.writeheader(); w.writerows(rows)
def main():
    rows=list(csv.DictReader((ROOT/MAPPING).open(encoding='utf-8-sig')))
    new_id='MEX_MAP_AUDIT20261014_013_MEX_PROV_NOM017_SEC663_AUDIT'
    if any(r['mapping_id']==new_id for r in rows):
        raise SystemExit('Reconciliation already applied; refusing duplicate migration')
    assert len(rows)==93
    row=next(r.copy() for r in rows if r['obligation_id']=='IHR-OBL-014' and r['domestic_provision_id']=='MEX_PROV_NOM017_SEC663_AUDIT')
    row.update(mapping_id=new_id, obligation_id='IHR-OBL-013', audit_notes=row['audit_notes']+' Retained concurrent audit correspondence from '+OTHER+'; intermediate-level scope remains pending review.')
    rows.append(row);write_csv(ROOT/MAPPING,rows,list(rows[0]))
    for dest in ['05_webapp/public/data/mexico_ihr2005_mapping_clean.csv','04_outputs/exports/data_package_v0_1/mexico_ihr2005_mapping.csv']:
        shutil.copyfile(ROOT/MAPPING,ROOT/dest)
    # Preserve the independent source-described path, without relabelling it as observed cooperation.
    path='03_tables/actors/legally_described_relationships.csv'
    content=from_git(path)
    for dest in [path,'05_webapp/public/data/derived/legally_described_relationships.csv']:
        (ROOT/dest).write_bytes(content)
    assert 'MEX_ACTOR_DGE_001' in content.decode()
    other=list(csv.DictReader(io.StringIO(from_git(MAPPING).decode('utf-8-sig'))))
    provision_alias={'MEX_AUDIT_NOM017_663':'MEX_PROV_NOM017_SEC663_AUDIT','MEX_AUDIT_NOM017_664':'MEX_PROV_NOM017_SEC664_AUDIT','MEX_AUDIT_NOM017_814':'MEX_PROV_NOM017_SEC814_AUDIT'}
    crosswalk=[]
    for old in other:
        if not old['mapping_id'].startswith('MEX_AUDIT_20261014_'):continue
        match=next(r for r in rows if r['obligation_id']==old['obligation_id'] and r['domestic_provision_id']==provision_alias[old['domestic_provision_id']])
        crosswalk.append({'concurrent_mapping_id':old['mapping_id'],'canonical_mapping_id':match['mapping_id'],'obligation_id':match['obligation_id'],'resolution':'source relationship retained; legal adequacy unscored pending review'})
    assert len(crosswalk)==7
    write_csv(ROOT/'00_project/audit_reconciliation_crosswalk.csv',crosswalk,list(crosswalk[0]))
    note={'concurrent_commit':OTHER,'concurrent_archive':'99_archive/concurrent_audit_60f5c899','retained_notification_path':'03_tables/actors/legally_described_relationships.csv','crosswalk':'00_project/audit_reconciliation_crosswalk.csv','added_mapping_id':new_id,'resolution':'All seven added concurrent mapping pairs retained, six already present and one added. Existing before/after documents, scripts, data and UI retained in a complete historical snapshot. Current source-added scores stay blank pending substantive review; incompatible 87-row manifests are historical, not current.'}
    base=ROOT/'00_project/audit_2026_10_14.json';obj=json.loads(base.read_text());obj['reconciliation']=note;base.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
    log=ROOT/'00_project/audit_2026_10_14_changes.json';changes=json.loads(log.read_text());changes.append({'mapping_id':new_id,'obligation_id':row['obligation_id'],'change':'concurrent_source_correspondence_retained','before':None,'after':row,'concurrent_commit':OTHER});log.write_text(json.dumps(changes,ensure_ascii=False,indent=2)+'\n')
    docs=['00_project/full_methodology_note.md','00_project/normtrace_ihr_methodology_full.md','00_project/methodology_note.md','05_webapp/public/data/markdown/normtrace_ihr_methodology_full.md','05_webapp/public/data/markdown/normtrace_ihr_methodology_web.md']
    for name in docs:
        p=ROOT/name;p.write_text(p.read_text().replace('| Provision-level correspondences | 93 |','| Provision-level correspondences | 94 |'))
    for name in ['06_scripts/validation/validate_content.py','05_webapp/tests/audit_20261014.spec.ts']:
        p=ROOT/name;text=p.read_text().replace("'mappings':93","'mappings':94").replace('mappings:93','mappings:94').replace("getByText('93'","getByText('94'");p.write_text(text)
    p=ROOT/'05_webapp/src/pages/AuditRecord.tsx';text=p.read_text();needle='<Link to="/methodology"';assert needle in text
    text=text.replace(needle,'<a href="/data/derived/legally_described_relationships.csv" download className="underline text-blue-700">Download source-described notification path</a>'+needle);p.write_text(text)
    p=ROOT/'00_project/RECONCILIATION_20261014.md';p.write_text('# Reconciliation of concurrent legal-source corrections\n\n'+json.dumps(note,ensure_ascii=False,indent=2)+'\n\nBoth commit histories are retained. No unrelated service or repository was modified. Source verification is not independent expert validation. The final release has 94 mapping records, not 94 obligations or proven gaps.\n')
    print('Reconciled seven concurrent source correspondences; one new pair. Canonical mappings: 94.')
if __name__=='__main__':main()
