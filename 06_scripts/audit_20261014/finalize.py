#!/usr/bin/env python3
"""Finish the scoped source correction after apply.py; safe to repeat."""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[2]
a=json.loads((R/'00_project/audit_20261014.json').read_text())
required=['05_webapp/src/pages/AuditReview.tsx','05_webapp/src/components/AuditNotice.tsx','06_scripts/validation/validate_content.py']
for p in required:
 assert (R/p).exists(), 'Incomplete migration; restore archived originals before retrying: '+p
p=R/'.github/workflows/validate.yml'
s=p.read_text().replace('pip install networkx pandas','pip install networkx==3.2.1 pandas==2.2.3')
p.write_text(s)
p=R/'05_webapp/src/pages/ActorsExplorer.tsx';s=p.read_text()
s=s.replace('Gap-exposed obligation','Provisional review flag').replace('Gap type</div>','Provisional record code</div>')
s=s.replace('Its age and regulatory (sub-statutory) rank make it a fragile, reform-critical hub.','Its age and rank do not by themselves establish legal insufficiency; content and habilitation require review.')
s=s.replace('Central to virtually all IHR implementation pathways; reform of the IHR legal architecture must run through it. Resilience depends on its institutional continuity.','This association metric does not assign all linked obligations to this institution or establish reform power.')
p.write_text(s)
p=R/'05_webapp/src/pages/LandingPage.tsx';s=p.read_text()
s=s.replace('Six-stage internalisation flow from international obligation to domestic implementation','Six analytical layers for examining domestic legal sources')
s=s.replace('Institutional network as a complex adaptive system: hubs, bridges, decoupled actors, and structural bottlenecks in health governance','Corpus-derived source associations; exploratory CAS interpretations remain unvalidated')
s=s.replace('Institutional authority topology: formal mandates versus operational realities, reform feasibility, veto players, and political decoupling','Archived institutional hypotheses, separated from documentary findings and observed practice')
s=s.replace('legal-institutional maps that identify where reform is needed, at what normative level, and for which actor','legal-institutional records that identify sources and questions for further review before proposing reform')
p.write_text(s)
a['migration_complete']=True
for p in ['00_project/audit_20261014.json','05_webapp/public/data/derived/audit_20261014.json']:
 (R/p).write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n')
print('Finalized source correction version',a['version'],'with pinned derivation dependencies.')
