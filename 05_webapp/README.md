# NormTrace-IHR Webapp v0.3

Legal Internalisation Mapping Infrastructure for International Health Regulations.

## Project Info
- **Version**: v0.3 (Mexico Pilot)
- **Data Package**: `data_package_v0_1` (Audited)
- **Framework**: Vite + React + TypeScript + Tailwind CSS

## Deployment (Vercel)
- **Root Directory**: `05_webapp`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## Key Features
- **Instrument Index**: Comprehensive registry of Mexican legal instruments assessed.
- **IHR Mapping**: Structural alignment of domestic law to IHR 2005/2024.
- **Actor Network**: Preliminary institutional relationship map derived from the legal corpus.
- **Printable Report**: Customizable PDF-ready report builder for policy stakeholders.

## Limitations
- **Preliminary Analysis**: All mappings require expert legal review (caveats L-01 to L-08).
- **Actor Network**: Represents statutory (de jure) relationships, not observed operational coordination.
- **DOI**: Currently TBD (10.5281/zenodo.0000000).

## Local Development
```bash
cd 05_webapp
npm install
npm run dev # run in dev mode
```

## Methodology Source
The Methodology page renders content from `00_project/normtrace_ihr_methodology_full.md`, which is synced to `05_webapp/public/data/markdown/normtrace_ihr_methodology_full.md` during the build process.
