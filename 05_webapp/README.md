# NormTrace-IHR Webapp v0.7

Legal Internalisation Mapping Infrastructure for International Health Regulations.

## Project Info
- **Version**: v0.7 (Mexico Pilot UI Revision)
- **Data Package**: `data_package_v0_1` (Audited)
- **Framework**: Vite + React + TypeScript + Tailwind CSS

## Deployment (Vercel)
- **Root Directory**: `05_webapp`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## Key Features
- **International Legal Mapping**: Comprehensive alignment of domestic law to IHR 2005, IHR 2024, and Pandemic Agreement/PABS.
- **Actors Explorer**: Institutional relationship map and metrics derived from the legal-institutional network.
- **Country Snapshot**: Policy-facing profile of Mexico's legal internalisation status.
- **Capacity Brief**: Targeted entry points for capacity-building and legal review.
- **Methodology**: Two-layer structure with a web-facing summary and a full academic draft.

## Limitations
- **Preliminary Analysis**: All mappings require expert legal review (caveats L-01 to L-08).
- **Actor Network**: Represents statutory (de jure) relationships, not observed operational coordination.
- **Pilot Scope**: Currently limited to the Mexican federal level corpus.

## Local Development
```bash
cd 05_webapp
npm install
npm run dev # run in dev mode
```

## Methodology Source
The Methodology page renders content from `05_webapp/public/data/markdown/normtrace_ihr_methodology_web.md`.
The full academic draft is available at `05_webapp/public/data/markdown/normtrace_ihr_methodology_full.md`.
