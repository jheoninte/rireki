import React from 'react';
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import Landing from './Landing';
import ja from '../i18n/ja';
afterEach(cleanup);
it('shows a Japanese form with a sample portrait and links the main action to that fixed form', () => {
  const { container } = render(<Landing />);
  expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('あなたの応募に、');
  expect(screen.getByRole('link', { name: ja.japan.start }).getAttribute('href')).toBe('/app/?template=rirekisho');
  expect(container.querySelector('.jp-workbench-paper .rirekisho-photo svg')).toBeTruthy();
  expect(container.querySelectorAll('.template-card')).toHaveLength(5);
  expect(screen.getByRole('radio', { name: '新卒・インターン', exact: true })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'アルバイト・パート用', exact: true })).toBeTruthy();
  expect(container.querySelector('.template-card.modern')).toBeNull();
});
