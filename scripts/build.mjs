import { build, createServer } from 'vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

await build();
const shell = await readFile('dist/index.html', 'utf8');
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
try {
  const { StaticLanding } = await server.ssrLoadModule('/src/components/Landing.jsx');
  const { catalogs } = await server.ssrLoadModule('/src/i18n/index.jsx');
  for (const locale of ['ja', 'ko', 'en']) {
    const home = locale === 'ja' ? '/' : `/${locale}/`, root = locale === 'ja' ? 'dist' : `dist/${locale}`;
    const copy = catalogs[locale], canonical = `https://rireki-easy.pages.dev${home}`;
    let localized = shell.replace('<html lang="ja">', `<html lang="${locale}">`)
      .replace(/<title>.*?<\/title>/, `<title>${escape(copy.meta.title)}</title>`)
      .replace(/(<meta\s+name="description"\s+content=")[^"]*"/s, `$1${escape(copy.meta.description)}"`)
      .replace(/(<meta\s+property="og:title"\s+content=")[^"]*"/s, `$1${escape(copy.meta.title)}"`)
      .replace(/(<meta\s+property="og:description"\s+content=")[^"]*"/s, `$1${escape(copy.meta.description)}"`)
      .replace('rel="canonical" href="https://rireki-easy.pages.dev/"', `rel="canonical" href="${canonical}"`)
      .replaceAll('"name":"履歴書作成ツール"', `"name":${JSON.stringify(copy.common.brand)}`)
      .replaceAll('"inLanguage":"ja"', `"inLanguage":"${locale}"`);
    localized = localized.replace(/(<meta\s+property="og:url"\s+content=")[^"]*"/s, `$1${canonical}"`)
      .replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (_, json) => {
        const schema = JSON.parse(json);
        Object.assign(schema, { name: copy.common.brand, description: copy.meta.description, inLanguage: locale, url: canonical });
        if (locale === 'en') schema.offers.description = '18 English resume templates with PDF and Word downloads';
        else if (locale === 'ko') schema.offers.description = '모던·스탠더드 이력서와 한국형 경력기술서 작성·다운로드';
        return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
      });

    await mkdir(`${root}/app`, { recursive: true });
    await writeFile(`${root}/app/index.html`, localized.replace('<head>', '<head><meta name="robots" content="noindex,follow" />').replace(`href="${canonical}"`, `href="${canonical}app/"`));
    const html = renderToStaticMarkup(React.createElement(StaticLanding, { locale }));
    let landing = localized.replace(/\s*<script type="module"[^>]*><\/script>/g, '')
      .replace(/\s*<link rel="modulepreload"[^>]*>/g, '')
      .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
      .replace('</body>', `<script>
        (() => { const q = new URLSearchParams(location.search); const h = new URLSearchParams(location.hash.slice(1));
          if (['#builder','#reset-password'].includes(location.hash) || ['code','token_hash','type','error','error_code'].some(k => q.has(k)) || ['access_token','type','error','error_code'].some(k => h.has(k))) {
            const target = q.get('lang') === 'ko' ? '/ko/app/' : q.get('lang') === 'en' ? '/en/app/' : '${home}app/';
            location.replace(target + location.search + location.hash);
          }
        })();
      </script></body>`);
    if (locale === 'ja' && !landing.includes('/app/?template=rirekisho')) throw new Error('Japanese prerender failed');
    if (locale === 'ko' && (!landing.includes('스탠더드') || !landing.includes('/ko/app/?template=modern'))) throw new Error('Korean prerender failed');
    if (locale === 'en' && (landing.match(/class="en-template-card"/g) || []).length !== 18) throw new Error('English template catalog incomplete');
    await writeFile(`${root}/index.html`, landing);
  }
  await mkdir('dist/reset-password', { recursive: true });
  await writeFile('dist/reset-password/index.html', shell.replace('<head>', '<head><meta name="robots" content="noindex,nofollow" />'));
} finally { await server.close(); }
