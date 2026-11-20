import { historyRows, qualificationRows, rirekishoPR, rirekishoPreferences, validateRirekisho } from './rirekisho-format';
import { japaneseTemplate } from './japanese-templates';
import { japaneseAddress } from './japanese-personal';

// Fill the user's original Word form, retaining its table grid, shapes and sections.
export async function createRirekishoWord(data, template, variant = 'rirekisho') {
  validateRirekisho(data, variant);
  const { patchDocument, PatchType, TextRun, ImageRun } = await import('docx');
  const layout = japaneseTemplate(variant);
  const values = { ...data, address: japaneseAddress(data.address, data.postalCode), contactAddress: japaneseAddress(data.contactAddress, data.contactPostalCode), documentDate: `${data.documentDate || '年　　月　　日'}現在`, birthAge: `${data.birth || '年　　月　　日'}生（満 ${data.age || '　'} 歳）`, pr: rirekishoPR(data, variant), preferences: rirekishoPreferences(data, variant), prHeading: layout.prHeading, preferencesHeading: layout.preferencesHeading };
  for (const [prefix, rows, count] of [['h', historyRows(data), 22], ['q', qualificationRows(data), 6]]) {
    for (let i = 0; i < count; i++) for (const key of ['year', 'month', 'text']) values[`${prefix}${i}_${key}`] = rows[i]?.[key] || '';
  }
  const patches = Object.fromEntries(Object.entries(values).filter(([, value]) => typeof value === 'string').map(([key, value]) => [key, { type: PatchType.PARAGRAPH, children: value.split('\n').map((line, i) => new TextRun({ text: line, break: i ? 1 : 0, size: 20, font: 'ＭＳ 明朝' })) }]));
  patches.photo = { type: PatchType.PARAGRAPH, children: data.photo ? [new ImageRun({ data: await (await fetch(data.photo)).arrayBuffer(), type: data.photo.startsWith('data:image/png') ? 'png' : 'jpg', transformation: { width: 108, height: 144 } })] : [new TextRun({ text: '写真を貼る位置\n縦36〜40mm\n横24〜30mm', size: 16 })] };
  return patchDocument({ data: template, outputType: 'blob', patches, keepOriginalStyles: true });
}
