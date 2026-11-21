// Events go through window.gtag, which public/consent.js defines only after the
// visitor accepts. Without consent these calls do nothing. Never pass resume content.
export function track(name, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') window.gtag('event', name, params);
}
