import { emptyResume, sanitizeResume } from "./resume-data";

export const LEGACY_KEY = "folio.resume-template.v1";
export const LEGACY_IMPORTED = "rireki:legacy:folio:imported:v1";

export function convertLegacyDraft(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const text = (x) => (typeof x === "string" ? x : "");
  const period = (x) =>
    [text(x.start), text(x.end)].filter(Boolean).join(" — ") +
    (x.start && !x.end ? " — 現在" : "");
  const data = {
    ...emptyResume(),
    name: text(raw.fullName),
    title: text(raw.jobTitle),
    email: text(raw.email),
    phone: text(raw.phone),
    address: text(raw.location),
    intro: text(raw.summary),
    skills: text(raw.skillList),
    careers: (Array.isArray(raw.experience) ? raw.experience : [])
      .filter((x) => x && typeof x === "object")
      .map((x) => ({
        company: text(x.company),
        position: text(x.role),
        period: period(x),
        role: text(x.description),
      })),
    education: (Array.isArray(raw.education) ? raw.education : [])
      .filter((x) => x && typeof x === "object")
      .map((x) => ({
        school: text(x.school),
        major: text(x.major),
        period: period(x),
      })),
  };
  return Object.values(data).some((x) =>
    typeof x === "string"
      ? x.trim()
      : x.some((entry) => Object.values(entry).some(Boolean)),
  )
    ? data
    : null;
}

export function readLegacyDraft(storage = localStorage) {
  try {
    return convertLegacyDraft(JSON.parse(storage.getItem(LEGACY_KEY)));
  } catch {
    return null;
  }
}

export function loadUnifiedDraft(key, guest, storage = localStorage) {
  try {
    const raw = storage.getItem(key);
    if (raw !== null) return sanitizeResume(JSON.parse(raw));
    if (guest && !storage.getItem(LEGACY_IMPORTED)) {
      const legacy = readLegacyDraft(storage);
      if (legacy) {
        // Write the new copy first, then mark migration; never remove the source.
        storage.setItem(key, JSON.stringify(legacy));
        storage.setItem(LEGACY_IMPORTED, "1");
        return legacy;
      }
    }
  } catch {
    /* Preserve the original key and expose import as an explicit action. */
  }
  return emptyResume();
}
