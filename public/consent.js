/* Privacy-first GA4 loader (plain JS so it also runs on the static landing pages).
   Nothing is loaded or sent until the visitor accepts. Only page views (no query/hash)
   and named events with non-personal parameters are sent; resume content never is. */
(function () {
  var ID = 'G-1R6JHPBNFK', KEY = 'rireki-analytics-consent';
  var L = {
    ja: { t: 'サイト改善のため、Google アナリティクスで匿名のアクセス状況を計測します。履歴書の入力内容は送信しません。', y: '同意する', n: '同意しない', m: '詳細', p: '/privacy.html' },
    ko: { t: '서비스 개선을 위해 Google 애널리틱스로 익명 이용 통계를 수집합니다. 이력서 입력 내용은 전송하지 않습니다.', y: '동의', n: '동의하지 않음', m: '자세히', p: '/ko/privacy.html' },
    en: { t: 'We use Google Analytics to measure anonymous site usage. Your resume content is never sent.', y: 'Accept', n: 'Decline', m: 'Details', p: '/en/privacy.html' }
  };
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* memory only */ } }
  var loaded = false;
  function load() {
    if (loaded) return; loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', ID, { page_location: location.origin + location.pathname, allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID; document.head.appendChild(s);
  }
  function banner() {
    var c = L[(document.documentElement.lang || 'ja').slice(0, 2)] || L.en;
    var d = document.createElement('div');
    d.setAttribute('role', 'region'); d.setAttribute('aria-label', 'Analytics consent');
    d.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:720px;margin:0 auto;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;padding:12px 16px;background:#fff;border:1px solid #cdd6c9;border-radius:12px;box-shadow:0 8px 28px rgba(37,62,52,.16);font:12.5px/1.6 system-ui,sans-serif;color:#253e34';
    var p = document.createElement('p'); p.style.cssText = 'margin:0;flex:1 1 280px';
    p.appendChild(document.createTextNode(c.t + ' '));
    var a = document.createElement('a'); a.href = c.p; a.textContent = c.m; a.style.color = '#285c48'; p.appendChild(a);
    var w = document.createElement('div'); w.style.cssText = 'display:flex;gap:8px;margin-left:auto';
    function btn(label, primary, v) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = label;
      b.style.cssText = 'min-height:36px;padding:0 14px;border-radius:8px;border:1px solid #285c48;font:600 12.5px system-ui,sans-serif;cursor:pointer;' + (primary ? 'background:#285c48;color:#fff' : 'background:#fff;color:#285c48');
      b.onclick = function () { set(v); d.remove(); if (v === 'granted') load(); };
      return b;
    }
    w.appendChild(btn(c.n, false, 'denied')); w.appendChild(btn(c.y, true, 'granted'));
    d.appendChild(p); d.appendChild(w); document.body.appendChild(d);
  }
  var v = get();
  if (v === 'granted') load();
  else if (!v) { if (document.body) banner(); else document.addEventListener('DOMContentLoaded', banner); }
})();
