// @vitest-environment node
import { expect, it } from 'vitest';
import { inflateRawSync } from 'node:zlib';
import * as docx from 'docx';
import { documentContent } from './document-content';
import { emptyResume } from './resume-data';
import ja from '../i18n/ja';
import ko from '../i18n/ko';

function extractXml(zip, filename) {
  // Read the central directory rather than depending on a ZIP authoring library.
  for (let p = 0; p < zip.length - 46; p++) {
    if (zip.readUInt32LE(p) !== 0x02014b50) continue;
    const nameLength = zip.readUInt16LE(p + 28);
    if (zip.subarray(p + 46, p + 46 + nameLength).toString() !== filename) continue;
    const offset = zip.readUInt32LE(p + 42), size = zip.readUInt32LE(p + 20);
    const begin = offset + 30 + zip.readUInt16LE(offset + 26) + zip.readUInt16LE(offset + 28);
    const bytes = zip.subarray(begin, begin + size);
    return (zip.readUInt16LE(p + 10) === 8 ? inflateRawSync(bytes) : bytes).toString();
  }
  throw new Error('Missing Word document XML');
}
const data = { ...emptyResume(), name: 'テスト氏名', english: 'てすと', birth: '1998年3月15日', summary: '職務要約の本文', qualifications: '資格の本文', preferences: '本人希望の本文', portfolio: 'https://example.com/portfolio', skills: 'React, Figma', careers: [{ company: 'テスト会社', position: '担当', period: '2020〜現在', role: '実績の本文' }] };
const para = (text, heading) => new docx.Paragraph({ text: text || '', heading: heading ? docx.HeadingLevel.HEADING_2 : undefined });
it('exports Korean career details while omitting resume-only personal and academic content', async () => {
  const d = { ...emptyResume(), ...ko.sample, birth: 'OMIT_BIRTH', address: 'OMIT_ADDRESS', english: 'OMIT_ENGLISH', intro: 'OMIT_INTRO', motivation: 'OMIT_MOTIVATION', education: [{ school: 'OMIT_SCHOOL', major: '', period: '' }] };
  const document = new docx.Document({ sections: [{ children: documentContent(docx, d, ko, 'career-description', [para('OMIT_PHOTO')], para, 'ko') }] });
  const xml = extractXml(await docx.Packer.toBuffer(document), 'word/document.xml');
  for (const text of ['경력기술서', '회사별 경력', '주요 프로젝트·성과', d.projects[0].projectResult, d.careers[0].role, d.skills, d.summary]) expect(xml).toContain(text);
  expect(xml).not.toContain('OMIT_');
});
for (const variant of ['modern', 'classic']) {
  it(`exports a localized Korean ${variant} Word with project and career content`, async () => {
    const d = { ...emptyResume(), ...ko.sample };
    const document = new docx.Document({ sections: [{ children: documentContent(docx, d, ko, variant, [], para, 'ko') }] });
    const xml = extractXml(await docx.Packer.toBuffer(document), 'word/document.xml');
    expect(xml).toContain('김하늘');
    expect(xml).toContain(d.projects[0].projectName);
    expect(xml).toContain(d.careers[0].role);
    expect(xml).toContain(ko.fields.qualifications);
    expect(xml).not.toContain('現在');
    expect(xml).not.toContain('ふりがな');
    if (variant === 'classic') expect(xml).toContain('<w:tbl>');
  });
}
for (const variant of ['rirekisho', 'work-history', 'developer', 'designer']) {
  it(`exports an editable ${variant} Word document with its own structure`, async () => {
    const document = new docx.Document({ sections: [{ children: documentContent(docx, data, ja, variant, [], para) }] });
    const xml = extractXml(await docx.Packer.toBuffer(document), 'word/document.xml');
    expect(xml).toContain(data.name);
    expect(xml).toContain(data.qualifications);
    if (variant === 'rirekisho') {
      expect(xml).toContain('<w:tbl>');
      expect(xml).toContain(data.preferences);
      expect(xml).not.toContain(data.careers[0].role);
    } else {
      expect(xml).toContain(data.careers[0].role);
      expect(xml).toContain(data.summary);
      expect(xml).not.toContain(data.birth);
    }
  });
}
