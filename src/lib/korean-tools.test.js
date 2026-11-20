import { expect, it } from 'vitest';
import { koreanSample, koreanExampleKey, accentColor } from './korean-examples';
import { sanitizeResume, emptyResume } from './resume-data';
import { reviewKoreanResume } from './korean-review';

it('validates example and accent inputs and preserves style through normalization', () => {
  expect(koreanExampleKey('__proto__')).toBe('general');
  expect(koreanExampleKey('developer')).toBe('developer');
  expect(accentColor('url(unsafe)')).toBe('#2563eb');
  expect(sanitizeResume({ accent: 'navy' }).accent).toBe('navy');
  expect(sanitizeResume({ accent: 'red' }).accent).toBe('');
  const sample = koreanSample(emptyResume(), 'designer', 'slate');
  expect(sample.accent).toBe('slate');
  expect(sample.projects[0].projectStack).toContain('Figma');
});

it('finds missing contact, incomplete experience and remaining fictional examples', () => {
  const sample = koreanSample({ ...emptyResume(), name: '실제지원자', email: 'applicant@company.co.kr', phone: '01099998888' }, 'developer');
  expect(reviewKoreanResume(sample).filter(row => !row.ok).map(row => row.id)).toEqual(['sample']);
  expect(reviewKoreanResume({ ...sample, email: 'wrong', phone: '123', portfolio: 'javascript:alert(1)', careers: [], projects: [] }).filter(row => !row.ok).map(row => row.id)).toEqual(['contact', 'experience', 'portfolio', 'sample']);
});
