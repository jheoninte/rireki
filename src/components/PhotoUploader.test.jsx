import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import PhotoUploader from './PhotoUploader';
import { photoCrop } from '../lib/photo-crop';
import ja from '../i18n/ja';

let drawImage;
const previous = 'data:image/jpeg;base64,previous';
beforeEach(() => {
  drawImage = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ fillRect: vi.fn(), drawImage });
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,cropped');
  vi.stubGlobal('Image', class {
    naturalWidth = 1200; naturalHeight = 800;
    set src(value) { this.source = value; queueMicrotask(() => this.onload()); }
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function upload(container, file) { fireEvent.change(container.querySelector('input[type=file]'), { target: { files: [file] } }); }
it('keeps the current photo when an unsupported file or oversized file is selected', () => {
  const onChange = vi.fn(), onError = vi.fn();
  const { container } = render(<PhotoUploader value={previous} onChange={onChange} onError={onError} />);
  upload(container, new File(['pdf'], 'photo.pdf', { type: 'application/pdf' }));
  expect(onError).toHaveBeenLastCalledWith(ja.messages.photoType);
  upload(container, new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' }));
  expect(onError).toHaveBeenLastCalledWith(ja.messages.photoSize);
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByRole('img').getAttribute('src')).toBe(previous);
});
it('allows cancelling a replacement and applies the same 3:4 crop shown in the preview', async () => {
  const onChange = vi.fn(), onError = vi.fn();
  const { container } = render(<PhotoUploader value={previous} onChange={onChange} onError={onError} />);
  const file = new File(['image'], 'photo.png', { type: 'image/png' });
  upload(container, file);
  await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: ja.common.cancel }));
  expect(onChange).not.toHaveBeenCalled();
  upload(container, file);
  await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());
  fireEvent.change(screen.getByRole('slider', { name: ja.japan.photo.zoom }), { target: { value: '2' } });
  fireEvent.change(screen.getByRole('slider', { name: ja.japan.photo.horizontal }), { target: { value: '20' } });
  fireEvent.click(screen.getByRole('button', { name: ja.japan.photo.apply }));
  const crop = photoCrop(1200, 800, 2, 20, 50);
  expect(drawImage).toHaveBeenCalledWith(expect.anything(), crop.x, crop.y, crop.width, crop.height, 0, 0, 450, 600);
  expect(onChange).toHaveBeenCalledWith('data:image/jpeg;base64,cropped');
  expect(onError).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).toBeNull();
});
