# Search registration — 2026-11-20

Production: https://rireki-easy.pages.dev/ (Japanese), `/ko/` (Korean), `/en/` (English).

- Google Search Console: ownership verified; sitemap submitted and resubmitted. Last observed status: could not fetch, zero discovered pages. Direct HTTP checks return valid XML/200. This is not confirmed indexing.
- Daum: Korean service **바로 이력서** registration application accepted, category `경제, 재테크 > 취업, 채용 > 이력서, 면접`. The form records `http://rireki-easy.pages.dev/ko/`, which redirects to HTTPS. Applicant contact was explicitly selected by the user. Review/approval remains Daum's decision.
- Naver: ownership verified after the user completed CAPTCHA. `https://rireki-easy.pages.dev/sitemap.xml` appears in the submitted list, dated 2026-11-20 22:08:35 KST. Indexing is not yet confirmed.
- Bing: site ownership verified in the active in-app browser webmaster account using `msvalidate.01`. Sitemap submitted, status **Processing**, no reported sitemap errors/warnings at submission. All three home URLs were also submitted through URL Submission; the table shows three rows dated 22:07 KST and remaining quota 97/100. The earlier Chrome account also has an unverified site entry and its XML proof; no third-party access delegation was added.
- Yandex: site ownership verified with the root HTML file; Manage access shows the user's account as **Owner**, verification date 2026-11-20. After the user completed CAPTCHA, its Sitemap tool explicitly reported a service incident/read-only mode: files cannot currently be added or submitted for recrawling. Sitemap submission there remains blocked by Yandex; the public robots.txt advertises the sitemap and IndexNow notifications were separately accepted.
- IndexNow: HTTP 202 accepted for the three public home URLs, ownership validation pending. Notifications are shared by participating engines after verification. This is not registration of every webmaster dashboard or confirmation that each engine indexed the pages.

## IndexNow maintenance

Set the existing `INDEXNOW_KEY` in the production build environment, without a `VITE_` prefix. The local value is in ignored `.env.local`; do not commit it. `node scripts/build.mjs` writes its ownership file into `dist`. Keep that file deployed in future releases. After deploying changed public pages, run `node scripts/submit-indexnow.mjs`; it validates the deployed proof and submits only the three home URLs. It never submits editors, resume data or account content.

Current participant metadata: https://www.indexnow.org/searchengines.json (Bing, Yandex, Seznam, Naver, Yep, Internet Archive, Amazonbot at this check). One submission does not prove consumption by every participant.

DuckDuckGo says its traditional links/images are largely sourced from Bing: https://duckduckgo.com/duckduckgo-help-pages/results/sources . Bing submission can help discovery there, but is not a separate DuckDuckGo registration or indexing guarantee.

All three ownership proof files return HTTP 200. Build and deployed SEO checks passed. Application code and resume export behavior were unchanged in this registration work.

Final production source commit: `a2c2e996a39e6ca9e9727ca057148483de829474`. Proof screenshots are local in ignored `.deploy/`: `naver-sitemap-submitted.jpg`, `bing-sitemap-submitted.jpg`, `bing-urls-submitted.jpg`, `daum-registration-complete.jpg`, `yandex-sitemap-readonly.jpg`. These contain account/contact details and are not committed to the public repository.
