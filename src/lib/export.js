import { documentContent } from "./document-content";
import { validateRirekisho } from './rirekisho-format';
import { isRirekishoTemplate } from './japanese-templates';
import { accentColor } from './korean-examples';
import { careerPageRanges, rasterPages } from './raster-pagination';
export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
// Authentication prompts belong to the caller. Guest exports use this same
// pipeline and remain available with a watermark after declining the prompt.
export async function exportResume(format, data, copy, {
  authenticated = false, watermark = !authenticated, variant = "modern", locale = 'ja',
} = {}) {
  const filename = `${data.name || copy.common.mine}_${copy.templates[variant] || copy.common.fileName}`;
  if (locale === 'en') {
    const { exportEnglishResume } = await import('./english-export');
    return exportEnglishResume(format, data, variant, watermark, downloadBlob);
  }
  if (isRirekishoTemplate(variant)) validateRirekisho(data, variant);
  if (format === "pdf") {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    await document.fonts.ready;
    const element = document.getElementById("export-resume");
    if (isRirekishoTemplate(variant)) {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pages = element.querySelectorAll('[data-export-page]');
      if (pages.length !== 2) throw new Error('履歴書のページを確認できません。');
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (page.scrollHeight > page.clientHeight + 2) throw new Error('履歴書の枠を超えています。文章を短くしてください。');
        const canvas = await html2canvas(page, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
        if (i) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
        if (watermark) { pdf.setFontSize(8); pdf.setTextColor(130); pdf.text('Resume Builder | Free template', 105, 294, { align: 'center' }); }
      }
      pdf.save(`${filename}.pdf`);
      return;
    }
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });
    const pdf = new jsPDF("p", "mm", "a4");
    const pageHeight = Math.floor((277 * canvas.width) / 190);
    const ranges = locale === 'ko' && variant === 'career-description' ? careerPageRanges(element, canvas.width / element.getBoundingClientRect().width) : [];
    // Crop pages individually, so content never bleeds into the page margins.
    for (const [y, end] of rasterPages(canvas.height, pageHeight, ranges)) {
      if (y > 0) pdf.addPage();
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = end - y;
      slice
        .getContext("2d")
        .drawImage(
          canvas,
          0,
          y,
          canvas.width,
          slice.height,
          0,
          0,
          canvas.width,
          slice.height,
        );
      pdf.addImage(
        slice.toDataURL("image/png"),
        "PNG",
        10,
        10,
        190,
        (slice.height * 190) / canvas.width,
      );
    }
    if (watermark) {
      for (let page = 1; page <= pdf.getNumberOfPages(); page++) {
        pdf.setPage(page); pdf.setFontSize(9); pdf.setTextColor(110, 125, 115);
        pdf.text('Resume Builder | Free template', 105, 292, { align: 'center' });
      }
    }
    pdf.save(`${filename}.pdf`);
    return;
  }
  if (isRirekishoTemplate(variant)) {
    const response = await fetch(`${import.meta.env.BASE_URL}templates/mhlw-rirekisho.docx`);
    if (!response.ok) throw new Error('履歴書テンプレートを取得できませんでした。');
    const { createRirekishoWord } = await import('./rirekisho-word');
    downloadBlob(await createRirekishoWord(data, await response.arrayBuffer(), variant), `${filename}.docx`);
    return;
  }
  const docx = await import("docx");
  const { Document, Packer, Paragraph, HeadingLevel, ImageRun, TextRun, Footer } = docx;
  const para = (text, heading = false) =>
    new Paragraph({
      children: String(text || "")
        .split("\n")
        .map((line, i) => new TextRun({ text: line, break: i ? 1 : 0, ...(locale === 'ko' && heading ? { color: accentColor(data.accent).slice(1) } : {}) })),
      heading: heading ? HeadingLevel.HEADING_2 : undefined,
      spacing: { after: 150 },
    });
  const photo = [];
  if (data.photo && !(locale === 'ko' && variant === 'career-description')) {
    const response = await fetch(data.photo);
    photo.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: await response.arrayBuffer(),
            type: data.photo.startsWith("data:image/png") ? "png" : "jpg",
            transformation: { width: 113, height: 151 },
          }),
        ],
      }),
    );
  }
  const doc = new Document({
    sections: [
      {
        properties: {},
        footers: watermark ? { default: new Footer({ children: [para(`${copy.common.brand} | Free template`)] }) } : undefined,
        children: documentContent(docx, data, copy, variant, photo, para, locale),
      },
    ],
    styles: { default: { document: { run: { font: locale === 'ko' ? 'Malgun Gothic' : 'Yu Gothic', size: 21 } }, ...(locale === 'ko' ? { title: { run: { color: accentColor(data.accent).slice(1) } }, heading2: { run: { color: accentColor(data.accent).slice(1) } } } : {}) } },
  });
  downloadBlob(await Packer.toBlob(doc), `${filename}.docx`);
}
