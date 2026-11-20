import React, { useEffect, useState } from 'react';
import { Cloud, Lightbulb, Sparkles, ArrowUpRight } from 'lucide-react';
import { Button } from './ui';
import { useI18n } from '../i18n';
import { commerceEnabled, invoke, readAccount, completion } from '../lib/services';

export function CloudPanel({ cloud, session, onLogin, progress, onImport, onRestore, confirmAction }) {
  const { copy, locale } = useI18n(), c = copy.workspace;
  const pending = ['loading', 'saving'].includes(cloud.status);
  return <section className="workspace-card cloud-card" aria-label={c.cloudTitle}>
    <div className="workspace-heading"><Cloud size={20}/><strong>{c.cloudTitle}</strong><span>{progress}%</span></div>
    <progress max="100" value={progress} aria-label={c.progress}/>
    {!session ? <><p>{progress >= 50 ? c.nudge : c.guestSave}</p><Button secondary onClick={onLogin}>{copy.common.login}</Button></> : <>
      <p role="status">{!cloud.available ? c.cloudUnavailable : c.cloudStates[cloud.status]}</p>
      {cloud.remote && <small>{c.cloudDate} {new Date(cloud.remote.updated_at).toLocaleString(locale)}</small>}
      {cloud.available && <div className="workspace-actions">
        {cloud.status === 'empty' && <Button disabled={pending} onClick={cloud.save}>{c.upload}</Button>}
        {cloud.remote && !['error', 'conflict', 'loading'].includes(cloud.status) && <>
          <Button secondary disabled={pending} onClick={() => confirmAction(c.load, c.backupNote, cloud.load)}>{c.load}</Button>
          <Button secondary disabled={pending} onClick={() => confirmAction(c.upload, c.overwrite, cloud.save)}>{c.upload}</Button>
          <button type="button" className="text-link small" disabled={pending} onClick={() => confirmAction(c.deleteCloud, c.deleteNote, cloud.remove)}>{c.deleteCloud}</button>
        </>}
        {['error', 'conflict', 'backupError'].includes(cloud.status) && <Button secondary onClick={cloud.refresh}>{c.refresh}</Button>}
      </div>}
      <div className="workspace-actions">
        <button type="button" className="text-link small" disabled={pending} onClick={onImport}>{c.importGuest}</button>
        <button type="button" className="text-link small" disabled={pending} onClick={onRestore}>{c.restoreBackup}</button>
      </div>
    </>}
  </section>;
}

export function WritingGuide({ field, job, setJob }) {
  const { copy, locale } = useI18n(), c = copy.workspace;
  return <section className="workspace-card writing-guide">
    <div className="workspace-heading"><Lightbulb size={19}/><strong>{c.guide}</strong></div>
    {locale !== 'ko' && <label className="field">{c.job}<select value={job} onChange={e => setJob(e.target.value)}>
      {Object.entries(c.jobs).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
    </select></label>}
    <p>{c.tips[field] || c.tips.default}</p>
    <details><summary>{c.example}</summary><p>{c.examples[job]}</p><small>{c.fictional}</small></details>
  </section>;
}

export function useAccount(session) {
  const [account, setAccount] = useState(null), [error, setError] = useState(false);
  async function refresh() {
    if (!session || !commerceEnabled) return;
    setError(false);
    try { setAccount(await readAccount()); } catch { setError(true); }
  }
  useEffect(() => {
    let alive = true;
    if (!session || !commerceEnabled) { setAccount(null); return; }
    readAccount().then(x => { if (alive) { setAccount(x); setError(false); } }).catch(() => { if (alive) setError(true); });
    const handle = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', handle);
    return () => { alive = false; document.removeEventListener('visibilitychange', handle); };
  }, [session?.user.id]);
  return { account, error, refresh };
}

export function Coaching({ session, data, update, accountState, onLogin, job }) {
  const { copy } = useI18n(), c = copy.workspace;
  const [field, setField] = useState('intro'), [busy, setBusy] = useState(false), [result, setResult] = useState(null), [error, setError] = useState(''), [consent, setConsent] = useState(false);
  async function coach() {
    if (!session) { onLogin(); return; }
    setBusy(true); setError(''); setResult(null);
    try {
      const source = data[field];
      const response = await invoke('coach', { text: source, field, job, requestId: crypto.randomUUID() });
      setResult({ text: response.text, field, source });
      await accountState.refresh();
    } catch (err) { setError(c.aiErrors[err.message] || c.aiErrors.default); }
    finally { setBusy(false); }
  }
  return <section className="workspace-card coaching">
    <div className="workspace-heading"><Sparkles size={19}/><strong>{c.aiTitle}</strong></div>
    <p>{c.aiDescription}</p>
    <p>{c.balance} {accountState.account ? `${accountState.account.free_remaining} ${c.free} / ${accountState.account.credits} ${c.credits}` : '—'}</p>
    {!commerceEnabled && <p>{c.commerceUnavailable}</p>}
    <label className="field">{c.target}<select value={field} disabled={busy} onChange={e => { setField(e.target.value); setResult(null); }}>
      {['intro', 'motivation'].map(key => <option key={key} value={key}>{copy.fields[key]}</option>)}
    </select></label>
    <label className="consent-line"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}/>{c.aiConsent}</label>
    <Button secondary disabled={busy || !commerceEnabled || !consent || !data[field].trim() || (session && !accountState.account)} onClick={coach}>{busy ? c.aiWorking : c.aiRun}</Button>
    <small>{c.aiCost}</small>
    {error && <p role="alert">{error}</p>}
    {result && <div className="ai-result"><p>{result.text}</p><Button secondary disabled={data[result.field] !== result.source} onClick={() => { update(result.field, result.text); setResult(null); }}>{c.apply}</Button>{data[result.field] !== result.source && <p>{c.sourceChanged}</p>}</div>}
  </section>;
}

export function Pricing({ session, accountState, onLogin }) {
  const { copy } = useI18n(), c = copy.workspace;
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function checkout(product) {
    if (!session) { onLogin(); return; }
    setBusy(true); setError('');
    try {
      const result = await invoke('checkout', { product });
      const url = new URL(result.url);
      if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com') throw new Error('checkout');
      location.assign(url.href);
    } catch { setError(c.checkoutError); setBusy(false); }
  }
  return <section className="workspace-card pricing-card">
    <div className="workspace-heading"><strong>{c.pricingTitle}</strong></div>
    {new URLSearchParams(location.search).get('payment') === 'success' && <p role="status">{c.paymentReturned}</p>}
    {new URLSearchParams(location.search).get('payment') === 'cancelled' && <p role="status">{c.paymentCancelled}</p>}
    <p>{c.freePlan}</p>
    <div className="price-option"><div><strong>{c.proName} · US$2.99</strong><p>{c.proDescription}</p></div><Button secondary disabled={busy || !commerceEnabled || Boolean(session && !accountState.account) || Boolean(accountState.account?.pro) || Boolean(accountState.account?.suspended)} onClick={() => checkout('pro')}>{accountState.account?.pro ? c.purchased : c.buy}</Button></div>
    <div className="price-option"><div><strong>{c.creditName} · US$2.99</strong><p>{c.creditDescription}</p></div><Button secondary disabled={busy || !commerceEnabled || Boolean(session && !accountState.account) || Boolean(accountState.account?.suspended)} onClick={() => checkout('credits')}>{c.buy}</Button></div>
    <small>{c.purchaseNote}</small>
    {!commerceEnabled && <p>{c.commerceUnavailable}</p>}
    {session && commerceEnabled && <button type="button" className="text-link small" onClick={accountState.refresh}>{c.refreshPurchase}</button>}
    {accountState.account?.suspended && <p role="alert">{c.aiErrors.suspended}</p>}
    {accountState.error && <p role="alert">{c.accountError}</p>}
    {error && <p role="alert">{error}</p>}
  </section>;
}

export function NextActions() {
  const { copy } = useI18n(), c = copy.workspace;
  const affiliate = import.meta.env.VITE_CAREER_PARTNER_URL;
  let partner;
  try { const url = new URL(affiliate); if (url.protocol === 'https:') partner = url.href; } catch { /* Optional partner. */ }
  return <section className="workspace-card next-actions">
    <strong>{c.nextTitle}</strong><p>{c.nextDescription}</p>
    <a href={c.jobsUrl || 'https://www.wantedly.com/projects'} target="_blank" rel="noopener noreferrer">{c.jobsLink}<ArrowUpRight size={15}/></a>
    {partner && <><a href={partner} target="_blank" rel="sponsored noopener noreferrer">{c.partnerLink}<ArrowUpRight size={15}/></a><small>{c.affiliateDisclosure}</small></>}
    <p>{c.noSharing}</p>
    <details><summary>{c.checklist}</summary><ul>{c.checks.map(x => <li key={x}>{x}</li>)}</ul></details>
  </section>;
}

export { completion };
