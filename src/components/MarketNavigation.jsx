import React from 'react';
import { useI18n } from '../i18n';
import { marketHome } from '../lib/market-routes';

export default function MarketNavigation() {
  const { copy, locale } = useI18n();
  const labels = locale === 'ko' ? ['일본어 이력서', '한국어 이력서', '영어 이력서'] : locale === 'ja' ? ['日本語の履歴書', '韓国語の履歴書', '英語の履歴書'] : ['Japanese Resume', 'Korean Resume', 'English Resume'];
  return <nav className="market-navigation" aria-label={copy.common.marketNav}>
    {[
      ['ja', labels[0]], ['ko', labels[1]], ['en', labels[2]],
    ].map(([market, label]) => <a key={market} href={marketHome(market)} aria-current={locale === market ? 'page' : undefined}>{label}</a>)}
  </nav>;
}
