import React, { useState } from 'react';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { I18nProvider } from './i18n';
import { StaticLanding } from './components/Landing';
import Builder from './components/Builder';
import Resume from './components/Resume';
import en from './i18n/en';
import { englishTemplates } from './lib/english-templates';
import { emptyResume } from './lib/resume-data';
vi.mock('./lib/auth', () => ({ supabase: null, authConfigured: false }));
vi.mock('./lib/export', () => ({ exportResume: vi.fn().mockResolvedValue(undefined) }));
import { exportResume } from './lib/export';
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); vi.clearAllMocks(); Element.prototype.scrollIntoView = vi.fn(); });
afterEach(cleanup);
it('publishes 18 original templates with complete English home copy and active country navigation', () => {
  const { container } = render(<StaticLanding locale="en" />);
  expect(container.querySelectorAll('.en-template-card')).toHaveLength(18);
  expect(screen.getAllByRole('link', { name: 'Folio. SwiftResume', exact: true }).length).toBeGreaterThan(0);
  expect(screen.getByRole('radio', { name: 'Simple · 5' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'English Resume', exact: true }).getAttribute('aria-current')).toBe('page');
  expect(container.textContent).not.toMatch(/[가-힣ぁ-んァ-ヶ]/);
});
it('omits sensitive and irrelevant fields from every English design and renders real achievement lists', () => {
  const data = { ...en.sample, photo: 'OMIT_PHOTO', birth: 'OMIT_BIRTH', age: 'OMIT_AGE', gender: 'OMIT_GENDER', english: 'OMIT_RUBY', motivation: 'OMIT_MOTIVATION', intro: 'OMIT_INTRO', targetDescription: 'OMIT_JOB_DESCRIPTION' };
  for (const t of englishTemplates) {
    const view = render(<I18nProvider locale="en"><Resume data={data} variant={t.id} /></I18nProvider>);
    expect(view.container.textContent).not.toContain('OMIT_');
    expect(view.container.querySelectorAll('li')).toHaveLength(5);
    expect(view.container.querySelector('[data-resume-section]').getAttribute('data-resume-section')).toBe('summary');
    view.unmount();
  }
});
function EnglishBuilder() { const [variant, setVariant] = useState('en-clear'); return <I18nProvider locale="en"><Builder variant={variant} setVariant={setVariant} onHome={() => {}} onLogin={() => {}} /></I18nProvider>; }
it('edits bullets, preserves the English draft across designs and exports the selected locale', async () => {
  const japanese = { ...emptyResume(), name: '日本語' };
  localStorage.setItem('rireki:resume:ja:v1', JSON.stringify(japanese));
  const { container } = render(<EnglishBuilder />);
  expect(screen.queryByText('Date of birth', { exact: true })).toBeNull();
  expect(container.querySelector('input[type=file]')).toBeNull();
  expect(container.querySelector('[id=field-birth]')).toBeNull();
  expect(container.textContent).not.toMatch(/[가-힣ぁ-んァ-ヶ]/);
  fireEvent.change(screen.getByRole('textbox', { name: /^Full name/ }), { target: { value: 'Taylor Lee' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'Experience 1 Achievement bullets 1', exact: true }), { target: { value: 'Built a release validation checklist.' } });
  fireEvent.change(screen.getByRole('combobox', { name: 'Resume template', exact: true }), { target: { value: 'en-studio' } });
  expect(container.querySelector('.unified-preview .en-document li').textContent).toBe('Built a release validation checklist.');
  fireEvent.change(screen.getByRole('combobox', { name: 'Page size' }), { target: { value: 'a4' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'Job description (optional)' }), { target: { value: 'Product strategy and SQL' } });
  expect(JSON.parse(localStorage.getItem('rireki:resume:en:v1'))).toMatchObject({ name: 'Taylor Lee', paperSize: 'a4', targetDescription: 'Product strategy and SQL' });
  expect(JSON.parse(localStorage.getItem('rireki:resume:ja:v1'))).toEqual(japanese);
  fireEvent.click(screen.getByRole('button', { name: 'Download Word', exact: true }));
  await waitFor(() => expect(exportResume).toHaveBeenCalledOnce());
  expect(exportResume.mock.calls[0][3]).toMatchObject({ locale: 'en', variant: 'en-studio' });
});
