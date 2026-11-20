import { useEffect, useRef, useState } from 'react';
import { supabase } from './auth';
import { sanitizeResume } from './resume-data';
import { initializeJapanesePersonal } from './japanese-personal';
import { cloudEnabled } from './services';

// The first cloud save/load enables sync; existing drafts require a choice.
export default function useCloudResume({ userId, locale, data, setData, variant, setVariant }) {
  const [status, setStatus] = useState('idle');
  const [remote, setRemote] = useState(null);
  const revision = useRef(0), baseline = useRef(''), active = useRef(false), inFlight = useRef(false);
  const latest = useRef({ data, variant });
  latest.current = { data, variant };
  const available = Boolean(userId && supabase && cloudEnabled);
  const fingerprint = JSON.stringify({ data, variant });

  async function refresh() {
    if (!available || inFlight.current) return;
    inFlight.current = true;
    active.current = false;
    setStatus('loading');
    try {
      const { data: row, error } = await supabase.from('resumes').select('document, revision, updated_at')
        .eq('user_id', userId).eq('locale', locale).maybeSingle();
      if (error) throw error;
      setRemote(row);
      revision.current = row?.revision || 0;
      setStatus(row ? 'choice' : 'empty');
    } catch { setStatus('error'); }
    finally { inFlight.current = false; }
  }
  useEffect(() => { refresh(); }, [available, locale]); // Builder remounts on account changes.

  async function save() {
    if (!available || inFlight.current) return;
    inFlight.current = true;
    setStatus('saving');
    const document = latest.current;
    try {
      const { data: result, error } = await supabase.rpc('save_resume', {
        p_locale: locale, p_document: document, p_revision: revision.current,
      });
      if (error) throw error;
      if (result.conflict) {
        active.current = false;
        setStatus('conflict');
        return;
      }
      revision.current = result.revision;
      baseline.current = JSON.stringify(document);
      active.current = true;
      setRemote({ document, revision: result.revision, updated_at: result.updated_at });
      setStatus(JSON.stringify(latest.current) === baseline.current ? 'saved' : 'pending');
    } catch {
      active.current = false;
      setStatus('error');
    } finally { inFlight.current = false; }
  }
  useEffect(() => {
    if (!active.current || fingerprint === baseline.current || inFlight.current) return;
    setStatus('pending');
    const timer = setTimeout(save, 2000);
    return () => clearTimeout(timer);
  }, [fingerprint, status]);

  function load() {
    if (!remote) return;
    // Keep the current draft recoverable even when choosing the cloud copy.
    try { localStorage.setItem(`rireki:backup:${userId}:${locale}`, JSON.stringify(latest.current)); }
    catch { setStatus('backupError'); return; }
    const data = sanitizeResume(remote.document.data);
    const normalized = locale === 'ja' ? initializeJapanesePersonal(data) : data;
    baseline.current = JSON.stringify({ data: normalized, variant: remote.document.variant });
    setData(normalized);
    setVariant(remote.document.variant);
    active.current = true;
    setStatus('saved');
  }
  async function remove() {
    if (!available || inFlight.current) return;
    active.current = false;
    inFlight.current = true;
    setStatus('saving');
    try {
      const { data: result, error } = await supabase.rpc('delete_resume', { p_locale: locale, p_revision: revision.current });
      if (error) throw error;
      if (result.conflict) { setStatus('conflict'); return; }
      revision.current = 0;
      setRemote(null);
      setStatus('empty');
    } catch { setStatus('error'); }
    finally { inFlight.current = false; }
  }
  return { available, status, remote, refresh, save, load, remove };
}
