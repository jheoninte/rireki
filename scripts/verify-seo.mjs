import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const origin = process.argv[2];
const base = 'https://rireki-easy.pages.dev';
const homes = { ja: '/', ko: '/ko/', en: '/en/' };
async function read(path) {
  if (!origin) return readFile(`dist${path.endsWith('/') ? `${path}index.html` : path}`, 'utf8');
  const response = await fetch(`${origin.replace(/\/$/, '')}${path}`);
  assert.equal(response.status, 200, path);
  return response.text();
}
for (const [locale, path] of Object.entries(homes)) {
  const document = new JSDOM(await read(path)).window.document;
  assert.equal(document.documentElement.lang, locale);
  assert.equal(document.querySelectorAll('h1').length, 1);
  assert.equal(document.querySelector('[rel=canonical]').href, base + path);
  assert.ok(document.title && document.querySelector('meta[name=description]').content);
  assert.ok(!document.querySelector('meta[name=robots]')?.content.includes('noindex'));
  for (const [language, home] of Object.entries({ ...homes, 'x-default': '/' })) {
    assert.equal(document.querySelector(`[hreflang="${language}"]`).href, base + home);
  }
  const image = document.querySelector('meta[property="og:image"]').content;
  assert.equal(image, `${base}/og/${locale}.png`);
  assert.equal(document.querySelector('meta[name="twitter:image"]').content, image);
  const schema = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
  assert.equal(schema.inLanguage, locale);
  assert.equal(schema.url, base + path);
  if (origin) assert.equal((await fetch(`${origin}/og/${locale}.png`)).status, 200);
  else await access(`dist/og/${locale}.png`);
  const editor = new JSDOM(await read(`${path}app/`)).window.document;
  assert.ok(editor.querySelector('meta[name=robots]').content.includes('noindex'));
  assert.equal(editor.querySelectorAll('[hreflang]').length, 0);
}
assert.ok((await read('/robots.txt')).includes('/sitemap.xml'));
const sitemap = await read('/sitemap.xml');
for (const path of Object.values(homes)) assert.ok(sitemap.includes(`<loc>${base}${path}</loc>`));
assert.ok((await read('/404.html')).includes('noindex'));
if (origin) assert.equal((await fetch(`${origin}/launch-check-missing-page`)).status, 404, 'Real HTTP 404 required');
console.log(`SEO checks passed (${origin || 'dist'}): 3 locales, alternate links, canonical, social cards, noindex editors, sitemap${origin ? ', HTTP 404' : ''}`);
