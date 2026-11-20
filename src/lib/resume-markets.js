import { japaneseTemplateIds } from './japanese-templates';
import { englishTemplateIds } from './english-templates';
// A market owns its document formats and landing page, not just translated labels.
// Japanese and Korean have independent homes, allowed formats and drafts.
export const resumeMarkets = {
  ja: { published: true, landing: 'japan', defaultTemplate: 'rirekisho', templates: japaneseTemplateIds, photo: true },
  ko: { published: true, landing: 'korea', defaultTemplate: 'modern', templates: ['modern', 'classic', 'career-description'], photo: true },
  en: { published: true, landing: 'international', defaultTemplate: 'en-clear', templates: englishTemplateIds, photo: false },
};
export function resumeMarket(locale = 'ja') {
  return resumeMarkets[locale.split('-')[0]] || resumeMarkets.ja;
}
export function marketTemplate(locale, requested) {
  const market = resumeMarket(locale);
  return market.templates.includes(requested) ? requested : market.defaultTemplate;
}
export function initialTemplate(locale, search, storage = localStorage) {
  const requested = new URLSearchParams(search).get('template');
  if (requested) return marketTemplate(locale, requested);
  try {
    return marketTemplate(locale, storage.getItem(`resumemaker-style:${locale}`) || storage.getItem('resumemaker-style'));
  } catch { return resumeMarket(locale).defaultTemplate; }
}
