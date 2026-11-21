// Privacy-first GA4. Nothing is loaded or sent until the visitor accepts.
// Only page views (query string and hash removed) and a few named events with
// non-personal parameters are sent. Resume contents are never passed to analytics.
const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID ?? 'G-1R6JHPBNFK';
const KEY = 'rireki-analytics-consent';
let loaded = false;

export const analyticsAvailable = () => /^G-[A-Z0-9]{6,}$/.test(MEASUREMENT_ID || '');

export function readConsent() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function saveConsent(value) {
  try { localStorage.setItem(KEY, value); } catch { /* Consent stays in memory only. */ }
  if (value === 'granted') loadAnalytics();
  else if (window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied' });
}

export function loadAnalytics() {
  if (loaded || !analyticsAvailable() || readConsent() !== 'granted' || typeof document === 'undefined') return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    page_location: location.origin + location.pathname,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

// Named events only; keep parameters short, non-personal strings.
export function track(name, params = {}) {
  if (!loaded || !window.gtag) return;
  window.gtag('event', name, params);
}
