# NormTrace-IHR Webapp

## Overview
This is the frontend MVP for the NormTrace-IHR Mexico Pilot. It provides a policy-facing interface for exploring preliminary legal-institutional mapping between IHR 2005 obligations and Mexico’s domestic legal architecture.

## What the app does
- displays IHR 2005 mapping results;
- shows anchoring levels and gap types;
- explores Mexican legal provisions;
- displays actors and institutional relationships;
- shows implementation gap areas for IHR 2024 and Pandemic Agreement readiness;
- provides printable reports.

## What the app does not do
- does not assess legal compliance;
- does not provide legal advice;
- does not generate new legal analysis in real time;
- does not expose raw data downloads in the public version.

## Data source
The app uses the cleaned audited data package:
04_outputs/exports/data_package_v0_1/

At build time or setup, selected files are copied to:
05_webapp/public/data/

## Methodology note
NormTrace-IHR is a country-specific legal-institutional mapping workflow, not a generic keyword matching system.

## Development
- npm install
- npm run dev
- npm run build
- npm run preview

## Vercel deployment
- **Root Directory:** 05_webapp
- **Build Command:** npm run build
- **Output Directory:** dist

## Version
Mexico Pilot v0.1

## Status
Preliminary expert review version.
