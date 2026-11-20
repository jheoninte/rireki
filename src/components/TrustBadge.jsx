import React from 'react';
import { LockKeyhole } from 'lucide-react';
import { useI18n } from '../i18n';
export default function TrustBadge() {
  const { copy } = useI18n(), c = copy.builderFeatures;
  return <div className="trust-badge"><LockKeyhole size={18} aria-hidden="true" /><div><p>{c.privacy}</p><a href={c.privacyUrl || '/privacy.html'} target="_blank" rel="noreferrer">{c.privacyLink}</a></div></div>;
}
