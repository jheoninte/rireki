# Folio. / SwiftResume

The English service is published locally at `/en/` with its editor at `/en/app/`. Folio. is the main brand; SwiftResume is the secondary name. Japanese and Korean documents remain separate.

## Reference and original catalog

The Rezi home catalog reviewed on 2026-11-20 showed 18 distinct templates across Simple, Modern, Creative and Compact collections. We used the catalog/filter/preview workflow and action-led writing guidance as references, then created 18 original Folio. designs. No reference images, testimonials, ratings, success statistics or proprietary writing examples were copied. This implementation does not offer Rezi’s AI agent, import/conversion, interview practice or ATS scoring.

`src/lib/english-templates.js` defines five Simple, five Modern, five Creative and three Compact designs. They differ in header treatment, serif/sans typography, alignment, density and section order. Every design starts with Professional Summary and uses a single-column reading order. The static home gallery uses native radio inputs and CSS filtering, so filters work without JavaScript. The editor has a compact selector and an expandable design browser.

## English writing and personal details

The English UI omits photo upload, birth date, age, gender, marital status, furigana and document date. Export uses an explicit set of professional fields; those personal fields remain excluded even if present in an imported or old draft. City/region is optional. The Professional Summary is edited in the first section and is printed before experience. The 45–85 word suggestion approximates a concise 3–4 line summary; line count varies with the template and content.

Experience and project achievements use one text input per bullet, with add/remove controls and action-verb hints. Paragraph text is stored as newline-separated bullets for compatibility with existing drafts. Printed PDF, preview and Word all render it as a list. Metrics are never fabricated.

Writing checks are deterministic and advisory. The optional pasted job description is compared locally against summary, skills and achievements. The comparison is not an ATS score or hiring prediction. The job description is saved with the draft but excluded from document exports. No English resume content is sent to an AI service.

## Output

English PDF uses jsPDF text with embedded SIL OFL Noto Sans or Noto Serif fonts, not a page image. It supports Letter and A4 with line-aware pagination, page numbers and the existing guest watermark policy. A PDF font glyph check fails clearly for unsupported characters, preserving Word as an alternative. Word uses native editable paragraphs, lists and page settings; its layout follows the selected design’s type, header treatment, density and section order, without promising pixel-identical layout across Word versions.

Font licenses are included in `public/fonts/NOTO-LICENSE.txt`. Existing Japanese/Korean PDF and Word pipelines remain intact.

## Persistence and deployment

English drafts use `rireki:resume:en:v1` or the existing account-specific locale key. All 18 template IDs are accepted by `202611200006_english_market.sql`, which must follow previous migrations. Ownership checks and revision locking are retained and tested with local PostgreSQL. Remote Supabase migrations were not applied as part of this UI work.

Production authentication must allow `/en/app/` and `/reset-password?lang=en` as return URLs. Cloud features require the existing service configuration. Local browser editing and download work independently of account connectivity.
