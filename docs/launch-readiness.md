# Launch readiness — 2026-11-20

## Implemented

- Reciprocal ja/ko/en/x-default hreflang on statically rendered homes, locale-specific canonical, metadata and structured data; editors remain noindex.
- Original 1200×630 sharing cards and SVG favicon. Root 404.html prevents Cloudflare Pages SPA soft-404 fallback.
- Removed render-blocking third-party font imports; UI uses installed fonts, exported documents keep bundled fonts. Increased low-contrast UI text and included the visible SwiftResume subtitle in the logo's accessible name.
- Supabase redirect allowlist: original Japanese URLs plus `/app/`, `/ko/app/`, `/en/app/`, and `/reset-password?lang=ko|en`.
- Applied migrations 001–006 together in a transaction to the previously empty production public schema. All five tables have RLS enabled. Commerce and AI remain disabled.
- Production SQL verification (`scripts/verify-cloud.sql`): three-market saves, stale-revision conflicts, cross-account read isolation, no direct authenticated writes, no anonymous save RPC. All synthetic test writes rolled back.
- Local build now uses `VITE_CLOUD_ENABLED=true`. First explicit cloud save/load opts into debounced autosave; local drafts are not uploaded simply by opening the editor. Keep this flag in future production build environments.
- Verified Google Search Console ownership using the deployed HTML file and submitted `/sitemap.xml`. Google initially reports that it cannot read the sitemap, while direct HTTP and Googlebot user-agent checks return 200 with valid XML. A manual indexing request was rejected by Google's daily quota; indexing remains unconfirmed.
- With user confirmation, enabled the previously disabled Supabase Data API. The disabled setting caused PGRST002 responses despite the schema being correct. Verified live Korean and English Google OAuth returns, English first cloud save, two-second autosave, and loading the saved cloud content after replacing the local field. Only fictional example data was used. Production anonymous read returns an empty array and anonymous save is blocked with HTTP 401.

## Verification tools

`node scripts/verify-seo.mjs` checks built HTML; append the production origin to check deployed routes, cards and genuine HTTP 404 responses.

Baseline production English mobile Lighthouse: performance 83, accessibility 95, best practices 100, SEO 100. Final production mobile performance: Japanese 100, Korean 100, English 99. All three score 100 in accessibility, best practices and SEO, with no report runtime errors. Lighthouse scores are lab measurements, not field Core Web Vitals or ranking guarantees.

The complete suite passed: 21 files, 104 tests. Further Japanese/Korean contrast adjustments only change CSS colors.

## Remaining operational checks

- Google crawling/indexing and actual search visibility depend on Google's processing. Search Console currently reports sitemap fetch failure and rejects the manual indexing request due to its daily quota. Recheck sitemap processing and request indexing after the quota resets; successful submission alone does not establish indexing.
- Physical iOS Safari and Android Chrome testing is still needed; responsive desktop viewport testing is not a substitute.
- Completing a real password change requires the account holder; automated recovery UI tests cover routing and state handling.
- Confirm backups/retention, account-support and incident-response procedures before a broad launch. The technical checks here do not promise an error-free service.
