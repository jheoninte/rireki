import { englishTemplate } from './english-templates';
import { bulletLines, englishEntries, englishSections } from './english-resume';
import { accentColor } from './korean-examples';

// Only these job-relevant fields enter a document. Draft-only and personal-status
// fields are deliberately excluded, including data recovered from older drafts.
export function englishDocumentBlocks(data, variant) {
  const t = englishTemplate(variant), blocks = [];
  const paragraph = text => { if (text?.trim()) blocks.push({ type: 'paragraph', text }); };
  for (const key of t.order) {
    if (['summary', 'skills', 'qualifications'].includes(key)) {
      if (data[key]?.trim()) { blocks.push({ type: 'section', text: englishSections[key] }); paragraph(data[key]); }
    } else {
      const rows = englishEntries(data[key]);
      if (!rows.length) continue;
      blocks.push({ type: 'section', text: englishSections[key] });
      for (const row of rows) {
        const project = key === 'projects', career = key === 'careers';
        blocks.push({ type: 'entry', text: project ? row.projectName : career ? row.position || row.company : row.school, detail: project ? row.projectPeriod : row.period });
        if (project) { paragraph(row.projectRole); paragraph(row.projectStack); }
        else if (career && row.position) paragraph(row.company);
        else if (!career) paragraph(row.major);
        if (project || career) bulletLines(project ? row.projectResult : row.role).forEach(text => blocks.push({ type: 'bullet', text }));
      }
    }
  }
  return blocks;
}
const fontCache = new Map();
async function fontData(file) {
  if (!fontCache.has(file)) fontCache.set(file, (async () => {
    const response = await fetch(`${import.meta.env.BASE_URL}fonts/${file}.ttf`);
    if (!response.ok) throw new Error('Font unavailable');
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
    return btoa(binary);
  })().catch(error => { fontCache.delete(file); throw error; }));
  return fontCache.get(file);
}
export async function englishPdf(data, variant, watermark) {
  const { jsPDF } = await import('jspdf');
  const t = englishTemplate(variant), font = t.font === 'serif' ? 'NotoSerif' : 'NotoSans';
  const pdf = new jsPDF({ unit: 'mm', format: data.paperSize === 'a4' ? 'a4' : 'letter', compress: true });
  for (const weight of ['Regular', 'Bold']) {
    pdf.addFileToVFS(`${font}-${weight}.ttf`, await fontData(`${font}-${weight}`));
    pdf.addFont(`${font}-${weight}.ttf`, font, weight === 'Bold' ? 'bold' : 'normal');
  }
  const width = pdf.internal.pageSize.getWidth(), height = pdf.internal.pageSize.getHeight();
  const margin = t.density === 'airy' ? 18 : t.density === 'compact' ? 14 : 16;
  const body = t.density === 'compact' ? 9.5 : 10.5, lineHeight = t.density === 'compact' ? 4.8 : 5.5;
  const contentWidth = width - margin * 2, bottom = height - 17;
  const accent = accentColor(data.accent), dark = '#243b60';
  let y = margin;
  const set = (bold = false, size = body, color = '#26374d') => { pdf.setFont(font, bold ? 'bold' : 'normal'); pdf.setFontSize(size); pdf.setTextColor(color); };
  const ensure = needed => { if (y + needed > bottom) { pdf.addPage(); y = margin; } };
  const text = (value, { bold = false, size = body, color, bullet = false, align = 'left' } = {}) => {
    set(bold, size, color); const indent = bullet ? 4 : 0;
    const metadata = pdf.getFont().metadata;
    if (metadata.characterToGlyph && Array.from(String(value || '')).some(char => !/\s/.test(char) && metadata.characterToGlyph(char.codePointAt(0)) === 0)) throw new Error('This character is not supported by the PDF font. Use Word.');
    const lines = pdf.splitTextToSize(String(value || ''), contentWidth - indent);
    const advance = Math.max(lineHeight, size * 0.3528 * 1.25);
    for (let i = 0; i < lines.length; i++) {
      ensure(advance);
      if (bullet && !i) pdf.text('•', margin, y);
      pdf.text(lines[i], align === 'center' ? width / 2 : margin + indent, y, { align });
      y += advance;
    }
  };
  const align = t.align;
  const nameSize = t.id === 'en-editorial' ? 30 : t.density === 'airy' ? 27 : 24;
  const headerRows = [[data.name || 'Your name', nameSize], ...(data.title ? [[data.title, 12]] : []), [[data.email, data.phone, data.address].filter(Boolean).join('  |  '), 8.8], ...(/^https:\/\//i.test(data.portfolio || '') ? [[data.portfolio, 8.8]] : [])];
  const headerHeight = headerRows.reduce((sum, [value, size]) => { set(false, size); return sum + pdf.splitTextToSize(value, contentWidth).length * Math.max(lineHeight, size * 0.3528 * 1.25); }, 8);
  if (t.frame === 'banner') { pdf.setFillColor('#eef4ff'); pdf.rect(margin - 4, margin - 7, contentWidth + 8, headerHeight, 'F'); }
  if (t.frame === 'outline') { pdf.setDrawColor(accent); pdf.rect(margin - 4, margin - 7, contentWidth + 8, headerHeight); }
  if (t.frame === 'side') { pdf.setFillColor(accent); pdf.rect(0, 0, 2, height, 'F'); }
  text(data.name || 'Your name', { bold: true, size: nameSize, color: dark, align }); y += 3;
  if (data.title) text(data.title, { size: 12, color: accent, align });
  text([data.email, data.phone, data.address].filter(Boolean).join('  |  '), { size: 8.8, color: '#5c6e86', align });
  if (/^https:\/\//i.test(data.portfolio || '')) text(data.portfolio, { size: 8.8, color: accent, align });
  y += 3;
  if (['rule', 'double'].includes(t.frame)) { pdf.setDrawColor(accent); pdf.line(margin, y, width - margin, y); if (t.frame === 'double') pdf.line(margin, y + 1, width - margin, y + 1); }
  for (const block of englishDocumentBlocks(data, variant)) {
    if (block.type === 'section') {
      ensure(19); y += t.density === 'airy' ? 6 : 4;
      if (t.frame === 'bands') { pdf.setFillColor('#f1f5fc'); pdf.rect(margin - 1, y - 4, contentWidth + 2, 7, 'F'); }
      text(block.text.toUpperCase(), { bold: true, size: 10, color: accent }); y += 1;
    } else if (block.type === 'entry') {
      ensure(14); y += 2;
      text(block.text, { bold: true });
      if (block.detail) text(block.detail, { size: 8.8, color: '#687b94' });
    } else { text(block.text, { bullet: block.type === 'bullet' }); y += block.type === 'bullet' ? 1 : 1.5; }
  }
  for (let page = 1; page <= pdf.getNumberOfPages(); page++) {
    pdf.setPage(page); set(false, 8, '#8191a6');
    pdf.text(`${page} / ${pdf.getNumberOfPages()}`, width - margin, height - 8, { align: 'right' });
    if (watermark) pdf.text('Folio. / SwiftResume | Free template', margin, height - 8);
  }
  return pdf;
}
export async function englishWord(data, variant, watermark) {
  const { Document, Packer, Paragraph, TextRun, Footer, BorderStyle } = await import('docx');
  const t = englishTemplate(variant), accent = accentColor(data.accent).slice(1);
  const fontSize = t.density === 'compact' ? 20 : 21, gap = t.density === 'airy' ? 150 : t.density === 'compact' ? 70 : 100;
  const run = (text, bold = false, size = fontSize, color = '26374D', breakBefore = 0) => new TextRun({ text: String(text || ''), bold, size, color, break: breakBefore });
  const para = (text, options = {}) => new Paragraph({ children: String(text || '').split('\n').map((line, i) => run(line, false, fontSize, '26374D', i ? 1 : 0)), spacing: { after: gap }, ...options });
  const rule = { color: accent, size: 6, style: t.frame === 'double' ? BorderStyle.DOUBLE : BorderStyle.SINGLE, space: 8 };
  const headerStyle = { alignment: t.align === 'center' ? 'center' : 'left', ...(t.frame === 'banner' ? { shading: { fill: 'EEF4FF' } } : {}), ...(['rule', 'double', 'outline', 'side'].includes(t.frame) ? { border: t.frame === 'outline' ? { top: rule, bottom: rule, left: rule, right: rule } : t.frame === 'side' ? { left: rule } : { bottom: rule } } : {}) };
  const children = [new Paragraph({ children: [run(data.name, true, t.id === 'en-editorial' ? 58 : 46, '243B60')], ...headerStyle, spacing: { after: 150 } }), para(data.title, { alignment: headerStyle.alignment }), para([data.email, data.phone, data.address].filter(Boolean).join(' | '), { alignment: headerStyle.alignment })];
  if (/^https:\/\//i.test(data.portfolio || '')) children.push(para(data.portfolio));
  for (const block of englishDocumentBlocks(data, variant)) {
    if (block.type === 'section') children.push(new Paragraph({ children: [run(block.text.toUpperCase(), true, 22, accent)], keepNext: true, spacing: { before: gap * 2, after: gap }, ...(t.frame === 'bands' ? { shading: { fill: 'F1F5FC' } } : {}), ...(t.frame === 'side' ? { border: { left: rule } } : {}) }));
    else if (block.type === 'entry') { children.push(new Paragraph({ children: [run(block.text, true)], keepNext: true, spacing: { before: 130, after: 70 } })); if (block.detail) children.push(para(block.detail, { keepNext: true })); }
    else children.push(para(block.text, block.type === 'bullet' ? { bullet: { level: 0 } } : {}));
  }
  const letter = data.paperSize !== 'a4';
  return Packer.toBlob(new Document({ styles: { default: { document: { run: { font: t.font === 'serif' ? 'Georgia' : 'Calibri', size: t.density === 'compact' ? 20 : 21 } } } }, sections: [{ properties: { page: { size: { width: letter ? 12240 : 11906, height: letter ? 15840 : 16838 }, margin: { top: 850, bottom: 850, left: 850, right: 850 } } }, children, footers: watermark ? { default: new Footer({ children: [para('Folio. / SwiftResume | Free template')] }) } : undefined }] }));
}
export async function exportEnglishResume(format, data, variant, watermark, downloadBlob) {
  const filename = `${data.name || 'My'}_${englishTemplate(variant).name}`;
  if (format === 'pdf') (await englishPdf(data, variant, watermark)).save(`${filename}.pdf`);
  else downloadBlob(await englishWord(data, variant, watermark), `${filename}.docx`);
}
