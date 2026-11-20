import { expect, it } from 'vitest';
import { rasterPages } from './raster-pagination';

it('covers the full document without gaps or oversized pages', () => {
  expect(rasterPages(250, 100)).toEqual([[0, 100], [100, 200], [200, 250]]);
  const pages = rasterPages(350, 100, [[80, 120], [170, 220], [300, 340]]);
  expect(pages[0]).toEqual([0, 80]);
  expect(pages.at(-1)[1]).toBe(350);
  pages.forEach(([start, end], i) => {
    expect(end - start).toBeGreaterThan(0);
    expect(end - start).toBeLessThanOrEqual(100);
    if (i) expect(start).toBe(pages[i - 1][1]);
  });
});
it('keeps a final heading with its content and falls back to lines for long sections', () => {
  expect(rasterPages(130, 100, [[90, 130]])).toEqual([[0, 90], [90, 130]]);
  expect(rasterPages(230, 100, [[0, 230], [97, 103]])).toEqual([[0, 97], [97, 197], [197, 230]]);
});
