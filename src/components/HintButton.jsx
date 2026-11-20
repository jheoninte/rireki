import React, { useId, useRef, useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { useI18n } from '../i18n';
import { getResumeGuide } from '../lib/resume-guides';

export default function HintButton({ field, label, onApply }) {
  const { copy, locale } = useI18n();
  const c = copy.builderFeatures, guide = getResumeGuide(field, locale);
  const [open, setOpen] = useState(false), id = useId(), trigger = useRef();
  if (!guide) return null;
  return <div className="smart-hint" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); trigger.current?.focus(); } }}>
    <button ref={trigger} type="button" className="hint-button" aria-label={`${label} · ${c.hint}`} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}><CircleHelp size={15} /><span>{c.hint}</span></button>
    {open && <div id={id} className="hint-content" role="region" aria-label={`${label} · ${c.hint}`}>
      <p>{guide.tip}</p>{guide.example && <><strong>{c.example}</strong><p className="hint-example">{guide.example}</p><small>{c.fictional}</small><button className="subtle-btn" type="button" onClick={() => onApply(guide.example)}>{c.apply}</button></>}
    </div>}
  </div>;
}
