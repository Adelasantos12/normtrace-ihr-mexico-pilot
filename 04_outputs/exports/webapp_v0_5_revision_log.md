# NormTrace-IHR Webapp v0.5 Repair Log

- actor relationship map restored: yes
- relationship edge source used: existing data (`05_webapp/public/data/derived/actor_network_edges_derived.csv`)
- Actor Inventory public labels cleaned: yes
- debug data check moved/hidden: yes (behind "Developer data check")
- methodology source deduplicated: yes
- callouts rendered correctly: yes (removed unsupported `[!IMPORTANT]/[!NOTE]` syntax)
- Mermaid rendered or replaced with workflow cards: yes (replaced with rendered workflow text blocks)
- tables rendered correctly: yes
- build result: SUCCESS (`npm run build`)
- remaining known issues: chunk-size warning (>500kB) remains; relationship map is corpus-derived and partial where data is sparse.
