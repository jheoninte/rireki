import React, { useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, ShieldCheck, Trash2 } from 'lucide-react';
import { useI18n } from '../i18n';
import { Button, Modal } from './ui';
import { photoCrop } from '../lib/photo-crop';

export default function PhotoUploader({ value, onChange, onError }) {
  const { copy } = useI18n(), c = copy.photo || copy.japan.photo;
  const input = useRef(), reader = useRef(), generation = useRef(0), id = useId();
  const [draft, setDraft] = useState(null), [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1), [horizontal, setHorizontal] = useState(50), [vertical, setVertical] = useState(50);
  useEffect(() => () => { generation.current++; reader.current?.abort(); }, []);
  const upload = event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) { onError(copy.messages.photoType); return; }
    if (file.size > 5 * 1024 * 1024) { onError(copy.messages.photoSize); return; }
    const request = ++generation.current;
    reader.current?.abort();
    setLoading(true);
    const fail = () => { if (request === generation.current) { setLoading(false); onError(copy.messages.photoError); } };
    const fileReader = new FileReader();
    reader.current = fileReader;
    fileReader.onerror = fail;
    fileReader.onload = () => {
      if (request !== generation.current) return;
      const image = new Image();
      image.onerror = fail;
      image.onload = () => {
        if (request !== generation.current) return;
        if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 50000000) { fail(); return; }
        setZoom(1); setHorizontal(50); setVertical(50);
        setDraft({ src: fileReader.result, image, width: image.naturalWidth, height: image.naturalHeight });
        setLoading(false);
      };
      image.src = fileReader.result;
    };
    fileReader.readAsDataURL(file);
  };
  const crop = draft ? photoCrop(draft.width, draft.height, zoom, horizontal, vertical) : null;
  const apply = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 450; canvas.height = 600;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas unavailable');
      context.fillStyle = '#fff'; context.fillRect(0, 0, 450, 600);
      context.drawImage(draft.image, crop.x, crop.y, crop.width, crop.height, 0, 0, 450, 600);
      onChange(canvas.toDataURL('image/jpeg', 0.9));
      setDraft(null);
    } catch { onError(copy.messages.photoError); }
  };
  return <section className="passport-upload" aria-labelledby={`${id}-title`}>
    <div className="passport-upload-preview">{value ? <img src={value} alt={copy.resume.photo} /> : <><ImagePlus size={28} /><span>30 × 40 mm</span></>}</div>
    <div className="passport-upload-copy">
      <h3 id={`${id}-title`}>{c.title}<small>{copy.common.optional}</small></h3>
      <p>{c.description}</p>
      <div className="passport-upload-actions"><Button secondary disabled={loading} onClick={() => input.current.click()}><ImagePlus size={16} />{loading ? c.loading : value ? c.replace : c.add}</Button>{value && <button type="button" className="text-link small" onClick={() => onChange('')}><Trash2 size={14} />{copy.builder.photoRemove}</button>}</div>
      <small id={`${id}-help`}>{c.requirements}</small>
      <span className="passport-local-note"><ShieldCheck size={13} />{c.local}</span>
    </div>
    <input ref={input} type="file" accept="image/jpeg,image/png" hidden aria-label={c.add} aria-describedby={`${id}-help`} onChange={upload} />
    {draft && <Modal title={c.cropTitle} className="photo-crop-dialog" onClose={() => setDraft(null)}>
      <p>{c.cropHelp}</p>
      <div className="photo-crop-frame"><img src={draft.src} alt={c.cropPreview} style={{ width: `${draft.width / crop.width * 100}%`, left: `${-crop.x / crop.width * 100}%`, top: `${-crop.y / crop.height * 100}%` }} /><span className="photo-crop-guide" aria-hidden="true" /></div>
      <div className="photo-crop-controls">{[[c.zoom, zoom, setZoom, 1, 3, 0.05], [c.horizontal, horizontal, setHorizontal, 0, 100, 1], [c.vertical, vertical, setVertical, 0, 100, 1]].map(([label, value, change, min, max, step]) => <label key={label}>{label}<input type="range" min={min} max={max} step={step} value={value} onChange={event => change(Number(event.target.value))} /></label>)}</div>
      <div className="confirm-actions"><Button secondary onClick={() => setDraft(null)}>{copy.common.cancel}</Button><Button onClick={apply}>{c.apply}</Button></div>
    </Modal>}
  </section>;
}
