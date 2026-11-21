import { mkdir, writeFile } from 'node:fs/promises';
import { guides, site, disclaimer } from './guides/ja.mjs';
import { affiliateSlots } from './guides/affiliates.mjs';

const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const CF = `<script>(function(){var u=location.pathname+location.search+location.hash;if(/reset-password|token_hash/.test(u))return;var s=document.createElement('script');s.defer=true;s.src='https://static.cloudflareinsights.com/beacon.min.js';s.setAttribute('data-cf-beacon','{"token": "ae5800e232014a75afadcf93f6bee0ff"}');document.head.appendChild(s);})();</script>`;
const CSS = `:root{--ink:#1e293b;--sub:#475569;--line:#e2e8f0;--brand:#2563eb}*{box-sizing:border-box}body{margin:0;background:#f8fafc;color:var(--ink);font:16px/1.9 system-ui,-apple-system,"Hiragino Sans","Noto Sans JP",sans-serif}header,footer{max-width:760px;margin:auto;padding:20px 24px}header a{font-weight:700;text-decoration:none}main{max-width:760px;margin:auto;padding:8px 24px 56px}a{color:var(--brand)}h1{font-size:28px;line-height:1.4;margin:16px 0}h2{font-size:21px;margin:40px 0 8px;padding-top:8px;border-top:1px solid var(--line)}p{margin:10px 0;color:#334155}.lead{font-size:17px}ul{padding-left:1.3em;color:#334155}li{margin:4px 0}.ex{background:#fff;border:1px solid var(--line);border-left:4px solid var(--brand);border-radius:8px;padding:12px 16px;margin:14px 0}.ex p{margin:4px 0}.ex small{color:var(--sub)}.cta{display:inline-block;margin:12px 0;padding:12px 22px;background:var(--brand);color:#fff;border-radius:10px;text-decoration:none;font-weight:700}.box{background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin:28px 0}.pr{display:inline-block;font-size:11px;font-weight:700;border:1px solid #cbd5e1;border-radius:4px;padding:0 6px;color:var(--sub);background:#fff}.note{font-size:13px;color:var(--sub)}.crumb{font-size:13px;color:var(--sub)}.related li{margin:6px 0}footer{font-size:13px;color:var(--sub)}`;

function body(g) {
  return g.sections.map(s => `<h2>${esc(s.h)}</h2>` + (s.p || []).map(t => `<p>${esc(t)}</p>`).join('')
    + (s.list ? `<ul>${s.list.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : '')
    + (s.example ? `<div class="ex"><p>${esc(s.example)}</p><small>${esc(s.exampleNote || '')}</small></div>` : '')).join('\n');
}

function slot(g) {
  const items = affiliateSlots[g.slug] || [];
  if (!items.length) return '';
  return `<aside class="box" aria-label="関連サービス"><span class="pr">PR</span> <strong>書類ができたら、次のステップへ</strong>${items.map(a => `<p><a href="${esc(a.href)}" target="_blank" rel="sponsored nofollow noopener noreferrer" data-affiliate="${esc(a.id)}">${esc(a.label)}</a></p>`).join('')}<p class="note">広告・提携リンクです。お申し込み等により当サイトに紹介料が入る場合があります。リンク先に履歴書の内容は送信されません。</p></aside>`;
}

function page(g) {
  const url = `${site}/guide/${g.slug}/`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.description, inLanguage: 'ja', mainEntityOfPage: url, dateModified: '2026-11-21', author: { '@type': 'Organization', name: '履歴書作成ツール' }, publisher: { '@type': 'Organization', name: '履歴書作成ツール' } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '履歴書作成ツール', item: `${site}/` }, { '@type': 'ListItem', position: 2, name: '書き方ガイド', item: `${site}/guide/` }, { '@type': 'ListItem', position: 3, name: g.title, item: url }] }];
  const others = guides.filter(x => x.slug !== g.slug);
  return `<!doctype html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(g.title)} | 履歴書作成ツール</title><meta name="description" content="${esc(g.description)}"><link rel="canonical" href="${url}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(g.title)}"><meta property="og:description" content="${esc(g.description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${site}/og/ja.png"><meta name="twitter:card" content="summary_large_image"><style>${CSS}</style><script type="application/ld+json">${JSON.stringify(ld)}</script>${CF}<script src="/consent.js" defer></script></head><body>
<header><a href="/">履歴書作成ツール</a></header><main>
<p class="crumb"><a href="/">ホーム</a> › <a href="/guide/">書き方ガイド</a></p>
<h1>${esc(g.title)}</h1><p class="lead">${esc(g.lead)}</p>
<p><a class="cta" data-cta="top" href="/app/?template=${g.template}">この書式で無料で作成する</a></p>
${body(g)}
<div class="box"><strong>書きながら整える</strong><p>入力しながらA4の実際のレイアウトで確認でき、PDF・Wordで保存できます。会員登録なしで使えます。</p><a class="cta" data-cta="bottom" href="/app/?template=${g.template}">履歴書を作成する</a></div>
${slot(g)}
<h2>あわせて読みたい</h2><ul class="related">${others.map(o => `<li><a href="/guide/${o.slug}/">${esc(o.title)}</a></li>`).join('')}</ul>
<p class="note">${esc(disclaimer)}</p></main>
<footer><a href="/">ホーム</a> ・ <a href="/guide/">書き方ガイド</a> ・ <a href="/privacy.html">プライバシーポリシー</a></footer>
<script>document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-cta],a[data-affiliate]');if(a&&typeof window.gtag==='function')window.gtag('event',a.dataset.affiliate?'affiliate_click':'guide_cta_click',a.dataset.affiliate?{partner:a.dataset.affiliate,placement:'guide'}:{template:new URL(a.href).searchParams.get('template'),position:a.dataset.cta})});</script>
</body></html>`;
}

function index() {
  const url = `${site}/guide/`;
  return `<!doctype html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>履歴書・職務経歴書の書き方ガイド | 履歴書作成ツール</title><meta name="description" content="履歴書・職務経歴書の書き方を、転職・新卒・アルバイト・再就職の状況別に解説。書き方のポイントと提出前チェックリスト付き。"><link rel="canonical" href="${url}"><meta property="og:title" content="履歴書・職務経歴書の書き方ガイド"><meta property="og:url" content="${url}"><meta property="og:image" content="${site}/og/ja.png"><style>${CSS}</style>${CF}<script src="/consent.js" defer></script></head><body><header><a href="/">履歴書作成ツール</a></header><main><p class="crumb"><a href="/">ホーム</a> › 書き方ガイド</p><h1>履歴書・職務経歴書の書き方ガイド</h1><p class="lead">状況に合わせて、書き方のポイントと提出前のチェックリストをまとめました。</p>${guides.map(g => `<div class="box"><h2 style="border:0;margin:0;padding:0"><a href="/guide/${g.slug}/">${esc(g.title)}</a></h2><p>${esc(g.description)}</p></div>`).join('')}<p class="note">${esc(disclaimer)}</p></main><footer><a href="/">ホーム</a> ・ <a href="/privacy.html">プライバシーポリシー</a></footer></body></html>`;
}

export async function buildGuides() {
  await mkdir('dist/guide', { recursive: true });
  await writeFile('dist/guide/index.html', index());
  for (const g of guides) {
    await mkdir(`dist/guide/${g.slug}`, { recursive: true });
    await writeFile(`dist/guide/${g.slug}/index.html`, page(g));
  }
}
