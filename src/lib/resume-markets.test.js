import { expect, it } from 'vitest';
import { initialTemplate, marketTemplate, resumeMarket } from './resume-markets';
import { completion } from './services';
import { emptyResume } from './resume-data';

it('uses the fixed Japanese form even when an old modern style or an incompatible URL is present', () => {
  localStorage.clear();
  localStorage.setItem('resumemaker-style', 'modern');
  expect(initialTemplate('ja', '')).toBe('rirekisho');
  expect(initialTemplate('ja', '?template=modern')).toBe('rirekisho');
  expect(initialTemplate('ja', '?template=work-history')).toBe('work-history');
  localStorage.setItem('resumemaker-style:ja', 'work-history');
  expect(initialTemplate('ja', '')).toBe('work-history');
  expect(initialTemplate('ja', '', { getItem() { throw new Error('blocked'); } })).toBe('rirekisho');
});
it('separates market defaults and keeps unfinished locales unpublished', () => {
  expect(resumeMarket('ja-JP').templates).toEqual(['rirekisho', 'rirekisho-graduate', 'rirekisho-part-time', 'rirekisho-return', 'work-history']);
  expect(marketTemplate('ko', 'rirekisho')).toBe('modern');
  expect(marketTemplate('en-US', 'rirekisho')).toBe('en-clear');
  expect(resumeMarket('ko').published).toBe(true);
  expect(resumeMarket('ko').templates).toEqual(['modern', 'classic', 'career-description']);
  expect(initialTemplate('ko', '?template=career-description')).toBe('career-description');
  expect(marketTemplate('ja', 'career-description')).toBe('rirekisho');
  expect(resumeMarket('en').published).toBe(true);
});
it('measures a Korean career document without requiring hidden academic or introductory fields', () => {
  const data = { ...emptyResume(), name: '지원자', email: 'applicant@example.com', title: '운영 담당', summary: '경력 요약', skills: 'Excel', projects: [{ projectName: '프로젝트', projectResult: '성과' }] };
  expect(completion(data, 'career-description')).toBe(100);
});

it('measures Japanese completion without demanding hidden modern fields or an optional photo', () => {
  const data = { ...emptyResume(), name: '山田', english: 'やまだ', birth: '1998年3月15日', address: '東京都', email: 'sample@example.com', education: [{ period: '2020年3月', school: '大学 卒業', major: '' }], intro: '強み', documentDate: '2026年11月20日' };
  expect(completion(data, 'rirekisho')).toBe(100);
  expect(data.photo).toBe('');
  expect(data.title).toBe('');
});
