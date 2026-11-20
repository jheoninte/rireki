export function localeFromLocation(location) {
  const match = location.pathname.match(/^\/(ko|en|ja)(?:\/|$)/);
  if (match) return match[1];
  const requested = new URLSearchParams(location.search || '').get('lang');
  return ['ko', 'en'].includes(requested) ? requested : 'ja';
}
export const marketHome = locale => locale === 'ja' ? '/' : `/${locale}/`;
export const marketEditor = locale => `${marketHome(locale)}app/`;
export const isEditorPath = path => /^\/(?:(?:ja|ko|en)\/)?app\/?$/.test(path);
export const authReturnPath = locale => locale === 'ja' ? '/#builder' : marketEditor(locale);
export const recoveryPath = locale => locale === 'ja' ? '/reset-password' : `/reset-password?lang=${locale}`;
