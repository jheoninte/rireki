// @vitest-environment node
import { readFileSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { expect, it } from 'vitest';
import { createRirekishoWord } from './rirekisho-word';
import { emptyResume } from './resume-data';
import { historyRows, qualificationRows, validateRirekisho } from './rirekisho-format';
import { japaneseTemplate } from './japanese-templates';

function xmlFrom(zip) {
  for (let p = 0; p < zip.length - 46; p++) {
    if (zip.readUInt32LE(p) !== 0x02014b50) continue;
    const len = zip.readUInt16LE(p + 28);
    if (zip.subarray(p + 46, p + 46 + len).toString() !== 'word/document.xml') continue;
    const offset = zip.readUInt32LE(p + 42), size = zip.readUInt32LE(p + 20);
    const begin = offset + 30 + zip.readUInt16LE(offset + 26) + zip.readUInt16LE(offset + 28);
    const bytes = zip.subarray(begin, begin + size);
    return (zip.readUInt16LE(p + 10) === 8 ? inflateRawSync(bytes) : bytes).toString();
  }
  throw new Error('Missing document');
}
it('fills the retained MHLW Word tables without leaving placeholders or adding nonstandard fields', async () => {
  const template = readFileSync('public/templates/mhlw-rirekisho.docx');
  const data = { ...emptyResume(), name: '山田 花子', english: 'やまだ はなこ', contactAddress: '別の連絡先', qualifications: '2023年10月 基本情報技術者', intro: '強みの本文', preferences: '規定に従います。', education: [{ period: '2020年4月', school: '○○大学 入学', major: '' }] };
  const blob = await createRirekishoWord(data, template);
  const xml = xmlFrom(Buffer.from(await blob.arrayBuffer()));
  expect(xml).toContain(data.name);
  expect(xml).toContain(data.contactAddress);
  expect(xml).toContain(data.intro);
  expect(xml).not.toContain('{{');
  expect(xml).not.toContain('扶養家族');
  expect(xml.match(/<w:tbl>/g)?.length).toBe(5);
  expect(xml).toContain('w:w="11906"');
  expect(xml).toContain('w:h="16838"');
});
it('includes both postal codes in the retained Word address slots', async () => {
  const template = readFileSync('public/templates/mhlw-rirekisho.docx');
  const d = { ...emptyResume(), name: '郵便テスト', postalCode: '1000003', address: '東京都千代田区', contactPostalCode: '530-0001', contactAddress: '大阪府大阪市北区' };
  const xml = xmlFrom(Buffer.from(await (await createRirekishoWord(d, template)).arrayBuffer()));
  expect(xml).toContain('〒100-0003');
  expect(xml).toContain('〒530-0001');
  expect(xml).toContain(d.address);
  expect(xml).toContain(d.contactAddress);
  expect(xml.match(/<w:tbl>/g)?.length).toBe(5);
  expect(() => validateRirekisho({ ...d, postalCode: '123' })).toThrow(/郵便番号/);
});
it('splits year and month and rejects overflow instead of dropping rows', () => {
  const data = { ...emptyResume(), education: [{ period: '2020年4月', school: '大学 入学', major: '' }], qualifications: '2023年10月 基本情報技術者' };
  expect(historyRows(data)[1]).toEqual({ year: '2020', month: '4', text: '大学 入学' });
  expect(qualificationRows(data)[0]).toEqual({ year: '2023', month: '10', text: '基本情報技術者' });
  expect(() => validateRirekisho({ ...data, education: Array(23).fill(data.education[0]) })).toThrow();
});

it('embeds the uploaded photo in the retained photo slot at a 3:4 aspect ratio', async () => {
  const template = readFileSync('public/templates/mhlw-rirekisho.docx');
  const photo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7xkAAAAASUVORK5CYII=';
  const blob = await createRirekishoWord({ ...emptyResume(), name: '写真テスト', photo }, template);
  const xml = xmlFrom(Buffer.from(await blob.arrayBuffer()));
  expect(xml).toContain('r:embed=');
  expect(xml).toContain('cx="1028700"');
  expect(xml).toContain('cy="1371600"');
  expect(xml).not.toContain('{{photo}}');
});

for (const [variant, field, value] of [
  ['rirekisho-graduate', 'studentActivities', '学園祭の運営経験'],
  ['rirekisho-part-time', 'workDays', '月水金曜日'],
  ['rirekisho-return', 'returnPreparation', '表計算の講座を受講'],
]) it(`keeps applicant-specific content in the matching Word form: ${variant}`, async () => {
  const template = readFileSync('public/templates/mhlw-rirekisho.docx');
  const data = { ...emptyResume(), name: '用途別テスト', [field]: value };
  const blob = await createRirekishoWord(data, template, variant);
  const xml = xmlFrom(Buffer.from(await blob.arrayBuffer()));
  expect(xml).toContain(value);
  expect(xml).toContain(japaneseTemplate(variant).prHeading);
  expect(xml).toContain(japaneseTemplate(variant).preferencesHeading);
  expect(xml).not.toContain('{{');
  const standard = await createRirekishoWord(data, template);
  expect(xmlFrom(Buffer.from(await standard.arrayBuffer()))).not.toContain(value);
});
