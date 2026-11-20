// Source coordinates for a 30 × 40 mm portrait, shared by preview and export.
export function photoCrop(width, height, zoom = 1, horizontal = 50, vertical = 50) {
  if (!(width > 0 && height > 0)) throw new Error('Invalid image dimensions');
  const scale = Math.min(3, Math.max(1, zoom));
  const cropWidth = Math.min(width, height * 3 / 4) / scale;
  const cropHeight = cropWidth * 4 / 3;
  return {
    x: (width - cropWidth) * Math.min(100, Math.max(0, horizontal)) / 100,
    y: (height - cropHeight) * Math.min(100, Math.max(0, vertical)) / 100,
    width: cropWidth,
    height: cropHeight,
  };
}
