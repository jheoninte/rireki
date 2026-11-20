import { supabase } from './auth';
import { isRirekishoTemplate, japaneseTemplateIds } from './japanese-templates';
import { englishTemplateIds } from './english-templates';

export const templates = [...new Set(['modern', 'classic', 'career-description', ...japaneseTemplateIds, ...englishTemplateIds, 'developer', 'designer', 'marketing', 'ats'])];
export const premiumTemplates = ['developer', 'designer', 'marketing', 'ats'];
export const cloudEnabled = import.meta.env.VITE_CLOUD_ENABLED === 'true';
export const commerceEnabled = import.meta.env.VITE_COMMERCE_ENABLED === 'true';
export const socialProviders = (import.meta.env.VITE_SOCIAL_PROVIDERS || 'google')
  .split(',').map(x => x.trim()).filter(x => ['google', 'github', 'linkedin_oidc', 'facebook', 'kakao'].includes(x));
export const providerNames = { google: 'Google', github: 'GitHub', linkedin_oidc: 'LinkedIn', facebook: 'Facebook', kakao: 'Kakao' };

export async function invoke(name, body) {
  if (!supabase) throw new Error('unavailable');
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    let code = 'unavailable';
    try { code = (await error.context.json()).error || code; } catch { /* Network errors have no response. */ }
    throw new Error(code);
  }
  return data;
}

export async function readAccount() {
  const { data, error } = await supabase.rpc('account_status');
  if (error) throw error;
  return data;
}

export function completion(data, variant = 'modern') {
  const checks = isRirekishoTemplate(variant) ? [
    data.name, data.english, data.birth, data.address, data.email || data.phone,
    data.education.some(x => x.school), data.intro || data.motivation, data.documentDate,
  ] : englishTemplateIds.includes(variant) ? [data.name, data.email, data.title, data.summary, data.skills, data.careers.some(x => x.company && x.role) || (data.projects || []).some(x => x.projectName && x.projectResult)] : variant === 'career-description' ? [
    data.name, data.email || data.phone, data.title, data.summary, data.skills,
    data.careers.some(x => x.company && x.role) || (data.projects || []).some(x => x.projectName && x.projectResult),
  ] : variant === 'work-history' ? [
    data.name, data.email || data.phone, data.summary,
    data.careers.some(x => x.company && x.role) || (data.projects || []).some(x => x.projectName && x.projectResult),
    data.skills, data.intro,
  ] : [data.name, data.email || data.phone, data.title,
    data.education.some(x => x.school), data.careers.some(x => x.company),
    data.skills, data.intro, data.motivation];
  return Math.round(checks.filter(x => typeof x === 'string' ? x.trim() : x).length / checks.length * 100);
}
