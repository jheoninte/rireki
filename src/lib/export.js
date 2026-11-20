export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function exportResume(format, data, copy) {
  const filename = `${data.name || copy.common.mine}_${copy.common.fileName}`;
  if (format === "pdf") {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    await document.fonts.ready;
    const canvas = await html2canvas(document.getElementById("export-resume"), {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });
    const pdf = new jsPDF("p", "mm", "a4");
    const pageHeight = Math.floor((277 * canvas.width) / 190);
    // Crop pages individually, so content never bleeds into the page margins.
    for (let y = 0; y < canvas.height; y += pageHeight) {
      if (y > 0) pdf.addPage();
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = Math.min(pageHeight, canvas.height - y);
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
    pdf.save(`${filename}.pdf`);
    return;
  }
  const { Document, Packer, Paragraph, HeadingLevel, ImageRun, TextRun } =
    await import("docx");
  const para = (text, heading = false) =>
    new Paragraph({
      children: String(text || "")
        .split("\n")
        .map((line, i) => new TextRun({ text: line, break: i ? 1 : 0 })),
      heading: heading ? HeadingLevel.HEADING_2 : undefined,
      spacing: { after: 150 },
    });
  const photo = [];
  if (data.photo) {
    const response = await fetch(data.photo);
    photo.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: await response.arrayBuffer(),
            type: "jpg",
            transformation: { width: 80, height: 100 },
          }),
        ],
      }),
    );
  }
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: copy.resume.heading,
            heading: HeadingLevel.TITLE,
          }),
          ...photo,
          para(`${data.name}　${data.english}`),
          para(data.title),
          ...["birth", "phone", "email", "address"].map((key) =>
            para(`${copy.fields[key]}：${data[key]}`),
          ),
          para(copy.fields.education, true),
          ...data.education.flatMap((x) => [
            para(`${x.period}　${x.school}`),
            para(x.major),
          ]),
          para(copy.fields.careers, true),
          ...data.careers.flatMap((x) => [
            para(`${x.period}　${x.company}`),
            para(x.role),
          ]),
          ...["skills", "intro", "motivation"].flatMap((key) => [
            para(copy.fields[key], true),
            para(data[key]),
          ]),
        ],
      },
    ],
    styles: { default: { document: { run: { font: "Yu Gothic", size: 21 } } } },
  });
  downloadBlob(await Packer.toBlob(doc), `${filename}.docx`);
}
