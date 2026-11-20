import { expect, it } from 'vitest';
import { emptyResume, sanitizeResume } from './resume-data';
import { initializeJapanesePersonal, japaneseAge, japaneseAddress, parseJapaneseDate, updateJapanesePersonal } from './japanese-personal';
import { japaneseJobs, japaneseJobExamples } from './japanese-jobs';

it('calculates completed years at the document date, including birthdays and era input', () => {
  expect(japaneseAge('2000年2月1日', '2025年1月31日')).toBe('24');
  expect(japaneseAge('平成12年2月1日', '令和7年2月7日')).toBe('25');
  expect(japaneseAge('２０００年２月１日', '2025-02-01')).toBe('25');
  expect(japaneseAge('2000/02/29', '2025.02.28')).toBe('24');
  expect(japaneseAge('2000/02/29', '2025.03.01')).toBe('25');
  for (const date of ['2023年2月29日', '2024年13月1日', '平成31年5月1日', '令和元年4月30日', '2000年2月']) expect(parseJapaneseDate(date)).toBeNull();
  expect(japaneseAge('2030年1月1日', '2025年1月1日')).toBe('');
});
it('defaults dates once, preserves edits on load, and recalculates after birth/date edits', () => {
  const now = new Date(2026, 10, 20, 12);
  let d = initializeJapanesePersonal({ ...emptyResume(), birth: '2000年12月1日' }, now);
  expect(d).toMatchObject({ documentDate: '2026年11月20日', age: '25' });
  d = updateJapanesePersonal(d, 'age', '24');
  expect(initializeJapanesePersonal(d, new Date(2027, 0, 1))).toMatchObject({ documentDate: '2026年11月20日', age: '24' });
  expect(updateJapanesePersonal(d, 'documentDate', '2026年12月1日').age).toBe('26');
  expect(updateJapanesePersonal(d, 'birth', '2000年1月1日').age).toBe('26');
  expect(updateJapanesePersonal(d, 'birth', '未入力').age).toBe('');
});
it('normalizes and persists postal codes and avoids duplicating legacy address codes', () => {
  const d = updateJapanesePersonal(emptyResume(), 'postalCode', '１０００００３');
  expect(sanitizeResume(d).postalCode).toBe('100-0003');
  expect(japaneseAddress('〒100-0003 東京都千代田区', d.postalCode)).toBe('〒100-0003\n東京都千代田区');
  expect(japaneseAddress('〒100-0003 東京都千代田区')).toBe('〒100-0003 東京都千代田区');
});
it('provides the eight requested occupations with separate examples', () => {
  expect(Object.values(japaneseJobs)).toEqual(['営業', '事務・管理', '企画・マーケティング', 'ITエンジニア', 'クリエイティブ', '販売・接客・サービス', '医療・福祉・教育', '製造・建築・物流']);
  expect(Object.keys(japaneseJobExamples)).toEqual(Object.keys(japaneseJobs));
});
