// @vitest-environment node
import { expect, it, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { englishDocumentBlocks, englishPdf, englishWord } from './english-export';
import { englishTemplates } from './english-templates';
import { bulletLines, englishChecks, keywordReview } from './english-resume';
import en from '../i18n/en';
function xml(zip, file) { for (let p = 0; p < zip.length - 46; p++) { if (zip.readUInt32LE(p) !== 0x02014b50) continue; const length = zip.readUInt16LE(p + 28); if (zip.subarray(p + 46, p + 46 + length).toString() !== file) continue; const offset = zip.readUInt32LE(p + 42), size = zip.readUInt32LE(p + 20), begin = offset + 30 + zip.readUInt16LE(offset + 26) + zip.readUInt16LE(offset + 28); const bytes = zip.subarray(begin, begin + size); return (zip.readUInt16LE(p + 10) === 8 ? inflateRawSync(bytes) : bytes).toString(); } throw new Error('Missing XML'); }
afterEach(() => vi.unstubAllGlobals());
it('uses the selected section order and excludes private draft fields from all 18 documents', () => {
  for (const t of englishTemplates) {
    const blocks = englishDocumentBlocks({ ...en.sample, birth: 'PRIVATE', photo: 'PRIVATE', targetDescription: 'PRIVATE', motivation: 'PRIVATE' }, t.id);
    expect(JSON.stringify(blocks)).not.toContain('PRIVATE');
    expect(blocks.filter(b => b.type === 'bullet')).toHaveLength(5);
    expect(blocks[0].text).toBe('Professional Summary');
  }
});
it('exports native Word bullets, US Letter/A4 page sizes and no personal-status fields', async () => {
  const d = { ...en.sample, birth: 'PRIVATE_BIRTH', photo: 'PRIVATE_PHOTO', targetDescription: 'PRIVATE_JOB', paperSize: 'letter' };
  const document = xml(Buffer.from(await (await englishWord(d, 'en-clear', false)).arrayBuffer()), 'word/document.xml');
  expect(document).toContain('w:numPr');
  expect(document).toContain('w:w="12240"');
  expect(document).not.toContain('PRIVATE_');
  expect(document).not.toContain('<w:drawing>');
  const a4 = xml(Buffer.from(await (await englishWord({ ...d, paperSize: 'a4' }, 'en-campus', true)).arrayBuffer()), 'word/document.xml');
  expect(a4).toContain('w:w="11906"');
});
it('creates an embedded-font text PDF with proper page dimensions and multiple pages for long writing', async () => {
  vi.stubGlobal('fetch', async url => ({ ok: true, arrayBuffer: async () => { const b = readFileSync(`public/fonts/${String(url).split('/').pop()}`); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); } }));
  const pdf = await englishPdf({ ...en.sample, paperSize: 'letter', careers: Array.from({ length: 12 }, () => en.sample.careers[0]) }, 'en-clear', true);
  expect(pdf.internal.pageSize.getWidth()).toBeCloseTo(215.9, 1);
  expect(pdf.getNumberOfPages()).toBeGreaterThan(1);
  expect(pdf.output()).toContain('/ToUnicode');
}, 20000);
it('checks action-led writing and performs a local keyword comparison', () => {
  expect(bulletLines('• Built a tool\n- Led a team')).toEqual(['Built a tool', 'Led a team']);
  expect(englishChecks(en.sample).find(row => row.label.includes('action verb')).ok).toBe(true);
  expect(keywordReview({ ...en.sample, targetDescription: 'SQL and Kubernetes' })).toEqual({ found: ['sql'], missing: ['kubernetes'] });
});
