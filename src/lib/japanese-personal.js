// Date-only parsing avoids UTC offsets and accepts the common Japanese era forms.
const eras = [
  ['明治', 1868, 1, 25], ['大正', 1912, 7, 30], ['昭和', 1926, 12, 25],
  ['平成', 1989, 1, 8], ['令和', 2019, 5, 1],
];
export function parseJapaneseDate(value = '') {
  const text = String(value).normalize('NFKC').replace(/\s/g, '');
  const match = text.match(/^(?:(明治|大正|昭和|平成|令和)(元|\d{1,2})年|(\d{4})(?:年|[-/.]))(\d{1,2})(?:月|[-/.])(\d{1,2})日?$/);
  if (!match) return null;
  const eraIndex = eras.findIndex(([name]) => name === match[1]);
  const eraYear = match[2] === '元' ? 1 : Number(match[2]);
  if (match[1] && eraYear < 1) return null;
  const year = match[1] ? eras[eraIndex][1] + eraYear - 1 : Number(match[3]);
  const month = Number(match[4]), day = Number(match[5]);
  if (year < 1000) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) return null;
  if (eraIndex >= 0) {
    const [, y, m, d] = eras[eraIndex];
    const next = eras[eraIndex + 1];
    if (date < new Date(y, m - 1, d) || (next && date >= new Date(next[1], next[2] - 1, next[3]))) return null;
  }
  return { year, month, day };
}
export const japaneseToday = (now = new Date()) => `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
export function japaneseAge(birth, documentDate = japaneseToday()) {
  const b = parseJapaneseDate(birth), at = parseJapaneseDate(documentDate);
  if (!b || !at) return '';
  const age = at.year - b.year - (at.month < b.month || (at.month === b.month && at.day < b.day) ? 1 : 0);
  return age < 0 ? '' : String(age);
}
export function initializeJapanesePersonal(data, now = new Date()) {
  const documentDate = data.documentDate?.trim() ? data.documentDate : japaneseToday(now);
  return { ...data, documentDate, age: data.age?.trim() ? data.age : japaneseAge(data.birth, documentDate) };
}
export function updateJapanesePersonal(data, key, value) {
  const next = { ...data, [key]: ['postalCode', 'contactPostalCode'].includes(key) ? formatPostalCode(value) : value };
  if (['birth', 'documentDate'].includes(key)) next.age = japaneseAge(next.birth, next.documentDate);
  return next;
}
export function formatPostalCode(value = '') {
  const text = value.normalize('NFKC').replace(/^〒\s*/, '').replace(/[‐‑–−ー]/g, '-');
  const digits = text.replace(/-/g, '');
  return /^\d{7}$/.test(digits) ? `${digits.slice(0, 3)}-${digits.slice(3)}` : text;
}
export function japaneseAddress(address = '', postalCode = '') {
  if (!postalCode.trim()) return address;
  // A new separate code replaces a code previously included in the address text.
  const body = address.replace(/^\s*〒?\s*[0-9０-９]{3}[-‐‑–−ー－]?[0-9０-９]{4}[\s　]*/, '');
  return [`〒${formatPostalCode(postalCode)}`, body].filter(Boolean).join('\n');
}
