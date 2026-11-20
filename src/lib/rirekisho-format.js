import { applicantFieldLabels, japaneseTemplate } from './japanese-templates';
import { formatPostalCode, japaneseAddress } from './japanese-personal';
// Row counts follow the supplied MHLW Word form (15 + 7 history rows).
export function dateParts(value = '') {
  const match = value.match(/^\s*(\d{4}|(?:令和|平成|昭和)\s*(?:\d+|元))\s*(?:年|[-/.])\s*(\d{1,2})\s*月?(.*)$/);
  return match ? [match[1], match[2], match[3].trim()] : ['', '', value];
}
export function historyRows(data) {
  return [['education', '学歴', 'school', 'major'], ['careers', '職歴', 'company', 'position']].flatMap(([key, title, name, detail]) => {
    const items = data[key].filter(row => [row[name], row[detail], row.period].some(Boolean));
    return items.length ? [{ year: '', month: '', text: title }, ...items.map(row => { const [year, month, rest] = dateParts(row.period); return { year, month, text: [rest, row[name], row[detail]].filter(Boolean).join('　') }; })] : [];
  });
}
export function qualificationRows(data) {
  return (data.qualifications || '').split('\n').filter(Boolean).map(line => { const [year, month, text] = dateParts(line); return { year, month, text }; });
}
export const rirekishoPR = (data, variant = 'rirekisho') => [data.motivation, data.intro, ...(japaneseTemplate(variant)?.writingFields || []).map(key => data[key]?.trim() ? `${applicantFieldLabels[key]}：${data[key]}` : '')].filter(Boolean).join('\n\n');
export const rirekishoPreferences = (data, variant = 'rirekisho') => [...(japaneseTemplate(variant)?.preferenceFields || []).map(key => data[key]?.trim() ? `${applicantFieldLabels[key]}：${data[key]}` : ''), data.preferences].filter(Boolean).join('\n');
export function validateRirekisho(data, variant = 'rirekisho') {
  if ([data.postalCode, data.contactPostalCode].some(value => value?.trim() && !/^\d{3}-\d{4}$/.test(formatPostalCode(value)))) throw new Error('郵便番号は7桁（例：100-0001）で入力してください。');
  const history = historyRows(data), qualifications = qualificationRows(data);
  if (history.length > 22 || qualifications.length > 6) throw new Error('履歴書の行数を超えています。学歴・職歴は見出しを含め22行、資格は6行以内に整理してください。');
  if (history.some(row => row.text.length > 48) || qualifications.some(row => row.text.length > 48) || [data.name, data.english].some(value => (value || '').length > 35) || [japaneseAddress(data.address, data.postalCode), japaneseAddress(data.contactAddress, data.contactPostalCode)].some(value => value.length > 100) || rirekishoPR(data, variant).length > 360 || rirekishoPreferences(data, variant).length > 180) throw new Error('書式の枠に収まるよう文章を整理してください。志望動機・自己PR・用途別の文章は合わせて360文字、勤務条件・本人希望は合わせて180文字までです。');
}
