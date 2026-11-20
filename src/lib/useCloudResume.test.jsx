import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { emptyResume } from './resume-data';

const api = vi.hoisted(() => ({ maybeSingle: vi.fn(), rpc: vi.fn() }));
vi.mock('./services', () => ({ cloudEnabled: true }));
vi.mock('./auth', () => ({ supabase: { from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: api.maybeSingle }) }) }) }), rpc: api.rpc } }));
import useCloudResume from './useCloudResume';
const draft = { ...emptyResume(), name: '端末の下書き' };
function setup() {
  return renderHook(() => {
    const [data, setData] = useState(draft), [variant, setVariant] = useState('modern');
    const cloud = useCloudResume({ userId: 'alice', locale: 'ja', data, setData, variant, setVariant });
    return { cloud, data, setData };
  });
}
beforeEach(() => {
  localStorage.clear(); vi.clearAllMocks();
  api.maybeSingle.mockResolvedValue({ data: { document: { data: { ...emptyResume(), name: 'クラウドの下書き' }, variant: 'classic' }, revision: 9, updated_at: '2026-11-20T00:00:00Z' }, error: null });
  api.rpc.mockResolvedValue({ data: { revision: 10, updated_at: '2026-11-20T01:00:00Z' }, error: null });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

it('does not upload or replace the local draft before explicit selection', async () => {
  const { result } = setup();
  await waitFor(() => expect(result.current.cloud.status).toBe('choice'));
  expect(result.current.data.name).toBe(draft.name);
  expect(api.rpc).not.toHaveBeenCalled();
  act(() => result.current.cloud.load());
  expect(result.current.data.name).toBe('クラウドの下書き');
  expect(JSON.parse(localStorage.getItem('rireki:backup:alice:ja')).data.name).toBe(draft.name);
});

it('autosaves after opt-in, stops on conflict, and preserves the edited draft', async () => {
  const { result } = setup();
  await waitFor(() => expect(result.current.cloud.status).toBe('choice'));
  await act(async () => { await result.current.cloud.save(); });
  expect(api.rpc).toHaveBeenCalledWith('save_resume', expect.objectContaining({ p_revision: 9 }));
  vi.useFakeTimers();
  api.rpc.mockResolvedValueOnce({ data: { conflict: true }, error: null });
  act(() => result.current.setData({ ...draft, name: '更新した下書き' }));
  await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
  expect(result.current.cloud.status).toBe('conflict');
  expect(result.current.data.name).toBe('更新した下書き');
  act(() => result.current.setData({ ...draft, name: '競合後の編集' }));
  await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
  expect(api.rpc).toHaveBeenCalledTimes(2);
});

it('shows a recoverable error after failed writes', async () => {
  const { result } = setup();
  await waitFor(() => expect(result.current.cloud.status).toBe('choice'));
  api.rpc.mockResolvedValueOnce({ data: null, error: new Error('offline') });
  await act(async () => { await result.current.cloud.save(); });
  expect(result.current.cloud.status).toBe('error');
  expect(result.current.data.name).toBe(draft.name);
});

it('debounces for two seconds and never reports a changed draft as saved', async () => {
  const { result } = setup();
  await waitFor(() => expect(result.current.cloud.status).toBe('choice'));
  await act(async () => { await result.current.cloud.save(); });
  vi.useFakeTimers();
  act(() => result.current.setData({ ...draft, intro: '最初の編集' }));
  expect(result.current.cloud.status).toBe('pending');
  await act(async () => { await vi.advanceTimersByTimeAsync(1500); });
  expect(api.rpc).toHaveBeenCalledTimes(1);
  act(() => result.current.setData({ ...draft, intro: '最後の編集' }));
  await act(async () => { await vi.advanceTimersByTimeAsync(1999); });
  expect(api.rpc).toHaveBeenCalledTimes(1);
  await act(async () => { await vi.advanceTimersByTimeAsync(1); });
  expect(api.rpc).toHaveBeenCalledTimes(2);
  expect(api.rpc.mock.calls[1][1].p_document.data.intro).toBe('最後の編集');
  expect(result.current.cloud.status).toBe('saved');
});

it('queues edits made during a write and saves the latest revision next', async () => {
  const { result } = setup();
  await waitFor(() => expect(result.current.cloud.status).toBe('choice'));
  await act(async () => { await result.current.cloud.save(); });
  vi.useFakeTimers();
  let resolveWrite;
  api.rpc.mockImplementationOnce(() => new Promise(resolve => { resolveWrite = resolve; }));
  act(() => result.current.setData({ ...draft, intro: '送信中の本文' }));
  await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
  expect(result.current.cloud.status).toBe('saving');
  act(() => result.current.setData({ ...draft, intro: '送信中に変更した本文' }));
  await act(async () => { resolveWrite({ data: { revision: 11, updated_at: new Date().toISOString() }, error: null }); });
  expect(result.current.cloud.status).toBe('pending');
  await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
  expect(api.rpc.mock.calls[2][1]).toMatchObject({ p_revision: 11, p_document: { data: { intro: '送信中に変更した本文' } } });
  expect(result.current.cloud.status).toBe('saved');
});
