# Launch readiness — 2026-11-20

## Implemented

- Reciprocal ja/ko/en/x-default hreflang on statically rendered homes, locale-specific canonical, metadata and structured data; editors remain noindex.
- Original 1200×630 sharing cards and SVG favicon. Root 404.html prevents Cloudflare Pages SPA soft-404 fallback.
- Removed render-blocking third-party font imports; UI uses installed fonts, exported documents keep bundled fonts. Increased low-contrast UI text and included the visible SwiftResume subtitle in the logo's accessible name.
- Supabase redirect allowlist: original Japanese URLs plus `/app/`, `/ko/app/`, `/en/app/`, and `/reset-password?lang=ko|en`.
- Applied migrations 001–006 together in a transaction to the previously empty production public schema. All five tables have RLS enabled. Commerce and AI remain disabled.
- Production SQL verification (`scripts/verify-cloud.sql`): three-market saves, stale-revision conflicts, cross-account read isolation, no direct authenticated writes, no anonymous save RPC. All synthetic test writes rolled back.
- Local build now uses `VITE_CLOUD_ENABLED=true`. First explicit cloud save/load opts into debounced autosave; local drafts are not uploaded simply by opening the editor. Keep this flag in future production build environments.
- Added a Google Search Console HTML ownership verification file. Ownership verification and sitemap submission require checking the deployed file.

## Verification tools

`node scripts/verify-seo.mjs` checks built HTML; append the production origin to check deployed routes, cards and genuine HTTP 404 responses.

Baseline production English mobile Lighthouse: performance 83, accessibility 95, best practices 100, SEO 100. Updated local build: 100/100/100/100. Production remeasurement is recorded in deployment notes after release. Lighthouse scores are lab measurements, not field Core Web Vitals or ranking guarantees.

The full suite initially passed 103/104 after the accessibility fix; the single failure expected the old logo name. Its corrected three-test file passes, covering all 104 tests across those runs.

## Remaining operational checks

- Google crawling/indexing and actual search visibility depend on Google's processing.
- Physical iOS Safari and Android Chrome testing is still needed; responsive desktop viewport testing is not a substitute.
- Completing a real password change requires the account holder; automated recovery UI tests cover routing and state handling.
- Confirm backups/retention, account-support and incident-response procedures before a broad launch. The technical checks here do not promise an error-free service.
