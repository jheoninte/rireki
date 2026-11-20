// Pixel boundaries for raster PDF pages. Keep small sections/entries together,
// falling back to individual line boxes for content longer than a page.
export function rasterPages(height, pageHeight, ranges = []) {
  const pages = [];
  for (let start = 0; start < height;) {
    let end = Math.min(start + pageHeight, height);
    if (end < height) {
      for (;;) {
        const crossing = ranges.filter(([top, bottom]) => top < end && bottom > end &&
          bottom - top <= pageHeight && top > start + pageHeight * 0.3);
        if (!crossing.length) break;
        const next = Math.floor(Math.min(...crossing.map(([top]) => top)));
        if (next >= end) break;
        end = next;
      }
    }
    pages.push([start, end]);
    start = end;
  }
  return pages;
}

export function careerPageRanges(element, scale) {
  const origin = element.getBoundingClientRect().top;
  const ranges = [];
  const add = rect => { if (rect.height > 0) ranges.push([(rect.top - origin) * scale, (rect.bottom - origin) * scale]); };
  element.querySelectorAll('.ko-career-section, .ko-career-entry').forEach(node => add(node.getBoundingClientRect()));
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  while (walker.nextNode()) {
    if (!walker.currentNode.textContent.trim()) continue;
    range.selectNodeContents(walker.currentNode);
    for (const rect of range.getClientRects()) add(rect);
  }
  return ranges;
}
