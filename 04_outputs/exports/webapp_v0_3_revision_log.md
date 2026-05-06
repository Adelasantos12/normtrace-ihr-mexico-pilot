# Webapp Revision Log v0.3 (Mexico Pilot)

**Status:** Revision Complete
**Build Result:** Success (dist/ generated)
**Data Package:** data_package_v0_1

## Implemented Revisions

### 1. Instrument and Sector Count Fix
- **Source Sync**: Updated dashboard and explorers to use `mexico_normative_corpus_index_clean.csv` for primary instrument counts.
- **Count Logic**: Distinguished between "Instruments in Corpus" (all assessed), "Instruments with Extracted Provisions" (subset with specific IHR links), and "Total Provisions".
- **Legal Domain Grouping**: Implemented `domainGrouping.ts` to map granular sectors into 10 academic/policy-facing domains (e.g., "Health governance and sanitary authority", "Borders, migration, ports, airports and customs").
- **Instruments Panel**: Added an expandable panel component displaying the full registry with filters.

### 2. Actors Explorer & Network Enhancement
- **Institutional Profiling**: Fixed bug where actor cards appeared blank; all fields (legal basis, coordination role, etc.) now render correctly.
- **Metric Distinction**: Separated counts for institutional profiles (18), actor mentions in provisions (74), and IHR-linked actors.
- **SVG Network Layering**: Replaced dark panel with a light-background, professional SVG network.
- **Derived Edges**: Created `derived/actor_network_edges_derived.csv` to support a "Detailed Relationship Table" view mapping legal bases for institutional links.

### 3. Printable Report Builder
- **Route**: Added `/report` (Report & Citation).
- **Functionality**: Users can select specific sections (Executive Summary, Anchoring Checklist, Gap Map, etc.) to include in a generated report.
- **Print Optimization**: Implemented `@media print` CSS to hide UI controls, handle page breaks, and apply institutional typography for PDF exports.

### 4. Visual Style & Cleanup
- **Palette**: Shifted to deep navy, soft blue, and grey palette. Removed neon/AI-template gradients.
- **UX**: Removed all "KPI" labels, replacing them with descriptive metrics.
- **Placeholders**: Removed repository and DOI links; replaced with TBD/Methodology references.
- **Landing Page**: Redesigned for institutional clarity.

## Technical Details
- **Build Command**: `npm run build` (Vite build success)
- **Vercel Settings**:
  - Root: `05_webapp`
  - Build: `npm run build`
  - Output: `dist`
- **CSV Handling**: Added whitespace trimming to `useData.ts` to prevent key-mapping errors.

## Limitations
- **Expert Review Required**: Mappings remain preliminary and AI-assisted.
- **Network Scope**: Statutory (de jure) relationships only.
