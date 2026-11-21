import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { analyticsAvailable, loadAnalytics, readConsent, saveConsent } from '../lib/analytics';

const copy = {
  ja: { text: 'サイト改善のため、Google アナリティクスで匿名のアクセス状況を計測します。履歴書の入力内容は送信しません。', accept: '同意する', decline: '同意しない', more: '詳細', privacy: '/privacy.html' },
  ko: { text: '서비스 개선을 위해 Google 애널리틱스로 익명 이용 통계를 수집합니다. 이력서 입력 내용은 전송하지 않습니다.', accept: '동의', decline: '동의하지 않음', more: '자세히', privacy: '/ko/privacy.html' },
  en: { text: 'We use Google Analytics to measure anonymous site usage. Your resume content is never sent.', accept: 'Accept', decline: 'Decline', more: 'Details', privacy: '/en/privacy.html' },
};

export default function ConsentBanner() {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!analyticsAvailable()) return;
    const stored = readConsent();
    if (stored === 'granted') loadAnalytics();
    else if (!stored) setOpen(true);
  }, []);
  if (!open) return null;
  const c = copy[locale] || copy.en;
  const choose = value => { saveConsent(value); setOpen(false); };
  return <div className="consent-banner" role="region" aria-label="Analytics consent">
    <p>{c.text} <a href={c.privacy}>{c.more}</a></p>
    <div><button type="button" className="consent-decline" onClick={() => choose('denied')}>{c.decline}</button><button type="button" className="consent-accept" onClick={() => choose('granted')}>{c.accept}</button></div>
  </div>;
}
