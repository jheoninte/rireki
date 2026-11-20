import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
export default function AutoSaveIndicator({ cloud }) {
  const { copy } = useI18n(), c = copy.builderFeatures;
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(timer); }, []);
  const status = !cloud.available ? 'local' : cloud.status === 'idle' ? 'local' : cloud.status;
  const minutes = Math.max(0, Math.floor((now - Date.parse(cloud.remote?.updated_at)) / 60000));
  return <div className={`autosave-indicator ${status}`} role="status" aria-live="polite"><span aria-hidden="true">{status === 'saved' ? '🟢' : '○'}</span><span>{c.states[status]}{status === 'saved' && ` (${minutes > 0 ? c.minutesAgo.replace('{count}', minutes) : c.justNow})`}</span>{status === 'error' && <button type="button" className="text-link" onClick={cloud.refresh}>{c.retry}</button>}</div>;
}
