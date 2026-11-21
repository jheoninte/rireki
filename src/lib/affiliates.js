// Affiliate placements. Tracking IDs are public by design (they appear in every affiliate URL).
// A placement is shown only on the locales listed in `locales`.
export const affiliatePartners = [
  {
    id: 'japan-phone-sim',
    locales: ['ja'],
    title: '日本で働く外国人の方へ',
    description: '応募書類には連絡のつく日本の電話番号が欠かせません。来日前に申し込める日本のSIM・eSIMです。',
    links: [
      // Mobal Voice-Only SIM text link (¥2,250 per sale), copied from the Mobal partner panel.
      { href: 'https://www.mobal.com/japan-sim-card/?a_aid=jpease&a_bid=0455de28#voice-lite', cta: 'Mobalの日本SIMを見る' },
      // Sakura Mobile "Voice SIM LP" text link (10% per sale), copied from its partner panel.
      { href: 'https://p.sakuramobile.jp/idevaffiliate.php?id=737_6_3_7', cta: 'サクラモバイルの音声SIMを見る' },
    ],
  },
];

export function partnersFor(locale) {
  return affiliatePartners.filter(partner => partner.locales.includes(locale));
}
