import React from 'react';
import { afterEach, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import Resume from './Resume';
import { emptyResume, sanitizeResume } from '../lib/resume-data';
import { I18nProvider } from '../i18n';

afterEach(cleanup);
it('omits empty optional personal details from Korean Standard and includes actual career and project content', () => {
  const d = { ...emptyResume(), name: '테스트 지원자', careers: [{ company: '테스트 회사', period: '2024–2026', position: '기획', role: '운영 개선' }], projects: [{ projectName: '지원 흐름 개선', projectResult: '담당 역할과 개선 결과' }] };
  const { container } = render(<I18nProvider locale="ko"><Resume data={d} variant="classic" /></I18nProvider>);
  expect(container.querySelector('.ko-standard')).toBeTruthy();
  expect(container.textContent).toContain('운영 개선');
  expect(container.textContent).toContain('지원 흐름 개선');
  expect(container.textContent).not.toContain('생년월일');
  expect(container.querySelector('img')).toBeNull();
  expect(container.querySelectorAll('.ko-standard-entry')).toHaveLength(2);
});
const data = () => ({ ...emptyResume(), name: '山田 花子', english: 'やまだ はなこ', birth: '1998年3月15日', addressFurigana: 'とうきょうと', documentDate: '2026年11月20日', qualifications: '基本情報技術者', preferences: '貴社の規定に従います。', summary: '開発経験5年', skills: 'React, TypeScript', portfolio: 'https://example.com/work', careers: [{ company: 'サンプル株式会社', period: '2020年〜現在', position: 'エンジニア', role: '表示速度を改善' }] });

it('separates Japanese personal history from detailed professional experience', () => {
  const d = data();
  const { container, rerender } = render(<Resume variant="rirekisho" data={d} />);
  expect(container.querySelector('.rirekisho-photo')).toBeTruthy();
  expect(container.querySelector('table').textContent).toContain('サンプル株式会社');
  expect(container.textContent).toContain(d.english);
  expect(container.textContent).toContain(d.addressFurigana);
  expect(container.textContent).toContain(d.qualifications);
  expect(container.textContent).toContain(d.preferences);
  expect(container.textContent).not.toContain(d.careers[0].role);
  rerender(<Resume variant="work-history" data={d} />);
  expect(container.textContent).toContain('職 務 経 歴 書');
  expect(container.textContent).toContain(d.summary);
  expect(container.textContent).toContain(d.careers[0].role);
  expect(container.textContent).not.toContain(d.birth);
  expect(container.querySelector('.rirekisho-photo')).toBeNull();
});

it('provides a technical sidebar and a prominent designer portfolio with safe links', () => {
  const d = data();
  const { container, rerender } = render(<Resume variant="developer" data={d} />);
  expect(container.querySelector('.developer-columns aside').textContent).toContain('TypeScript');
  expect(container.querySelector('.developer-columns > div').textContent).toContain(d.careers[0].role);
  rerender(<Resume variant="designer" data={d} />);
  expect(container.querySelector('.designer-portfolio a').getAttribute('href')).toBe(d.portfolio);
  rerender(<Resume variant="designer" data={{ ...d, portfolio: 'javascript:alert(1)' }} />);
  expect(container.querySelector('.designer-portfolio a')).toBeNull();
});

it('round-trips new Japanese fields and opens older drafts with compatible defaults', () => {
  const d = data();
  expect(sanitizeResume(JSON.parse(JSON.stringify(d)))).toEqual(d);
  expect(sanitizeResume({ name: '以前の下書き' })).toMatchObject({ name: '以前の下書き', summary: '', preferences: '', qualifications: '' });
});
