# NormTrace-IHR Webapp v0.3 Revision Log

## Architectural Improvements
- **Component Consolidation:** Eliminated redundant Layout files. Centralized navigation, disclaimers, and the "Preliminary Expert Review" modal in `src/Layout.tsx`.
- **Route Completeness:** Added `/capacity` route for the Capacity-Building Entry Points brief, ensuring all documentation is accessible via the UI.
- **Reporting Engine:** Upgraded `ReportBuilder.tsx` to a data-aware component. It now pulls from the audited CSVs to populate the printed report, moving beyond static placeholders for the Mapping and Gap sections.

## UI/UX Enhancements
- **Legal Caveats Modal:** Implemented a persistent "View Legal Caveats" button in the sidebar that triggers a detailed modal with the mandatory disclaimers.
- **Responsive Layout:** Ensured the sidebar and main content behave correctly under SPA routing on Vercel.
- **Print Optimization:** Fine-tuned CSS for the printable report to ensure high-quality PDF exports (cover page, page breaks, data tables).

## Data Integration
- **Audited Data Package:** Verified that all content is sourced exclusively from `04_outputs/exports/data_package_v0_1/`.
- **Parsing Robustness:** Implemented header cleaning and delimiter detection in `useData.ts` to handle variability in cleaned CSV exports.

## Build Status
- **Vite Build:** SUCCESS
- **Local Preview:** Functional
- **Vercel Config:** vercel.json rewrite rule verified.

---
*Revision Date: 2026-05-06 | Engineer: Jules*
