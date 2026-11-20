import { sanitizeResume } from "./resume-data";

const handoffKey = (locale) => `rireki:auth-draft:${locale}:v1`;

// Keep the draft in its original localStorage key. Only a pointer lives in
// sessionStorage, so another tab cannot accidentally import this tab's draft.
export function stageAuthDraft(data, locale, variant) {
  const key = `rireki:resume:${locale}:v1`;
  localStorage.setItem(key, JSON.stringify(data));
  localStorage.setItem("resumemaker-style", variant);
  sessionStorage.setItem(handoffKey(locale), key);
}

export function readAuthDraft(locale) {
  try {
    const key = sessionStorage.getItem(handoffKey(locale));
    if (key !== `rireki:resume:${locale}:v1`) return null;
    const raw = localStorage.getItem(key);
    return raw === null ? null : sanitizeResume(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveBuilderDraft(data, storageKey, locale, userId, variant) {
  if (userId && readAuthDraft(locale)) {
    const previous = localStorage.getItem(storageKey);
    if (previous !== null) {
      localStorage.setItem(
        `rireki:backup:${userId}:${locale}`,
        JSON.stringify({ data: JSON.parse(previous), variant }),
      );
    }
    localStorage.setItem(storageKey, JSON.stringify(data));
    sessionStorage.removeItem(handoffKey(locale));
    return;
  }
  localStorage.setItem(storageKey, JSON.stringify(data));
}
