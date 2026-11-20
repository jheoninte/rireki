import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { templates, premiumTemplates } from '../lib/services';
import { resumeMarket } from '../lib/resume-markets';
import { japaneseTemplate } from '../lib/japanese-templates';
import { englishTemplates, englishCategories, englishTemplate } from '../lib/english-templates';

export default function TemplateSelector({ value, onChange }) {
  const [category, setCategory] = useState('all');
  const { copy, locale } = useI18n();
  const choices = resumeMarket(locale).templates;
  const c = copy.builderFeatures;
  if (locale === 'en') return <section className="unified-card document-picker" aria-label={c.selector}><label className="field">{c.selector}<select value={value} onChange={event => onChange(event.target.value)}>{Object.entries(englishCategories).filter(([key]) => key !== 'all').map(([key, label]) => <optgroup key={key} label={label}>{englishTemplates.filter(t => t.category === key).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</optgroup>)}</select></label><p>{englishTemplate(value).description}</p><details className="en-editor-template-browser"><summary>Compare 18 designs</summary><div className="en-editor-categories">{Object.entries(englishCategories).map(([key, label]) => <button key={key} type="button" aria-pressed={category === key} onClick={() => setCategory(key)}>{label}</button>)}</div><div className="template-choices">{englishTemplates.filter(t => category === 'all' || t.category === category).map(t => <button key={t.id} type="button" aria-pressed={value === t.id} onClick={() => onChange(t.id)}><strong>{t.name}</strong><small>{t.description}</small></button>)}</div></details><p>{c.templateNote}</p></section>;
  return <section className="unified-card document-picker" aria-label={c.selector}>
    <label className="field">{c.selector}
      <select value={value} onChange={event => onChange(event.target.value)}>
        {choices.map(style => <option key={style} value={style}>{copy.templates[style]}</option>)}
      </select>
    </label>
    <div className="template-choices market-document-choices">{choices.map(style => <button key={style} type="button" aria-pressed={value === style} onClick={() => onChange(style)}><strong>{copy.templates[style]}</strong><small>{japaneseTemplate(style)?.tag || c.descriptions[style]}</small></button>)}</div>
    <p>{value === 'rirekisho' ? c.reference : japaneseTemplate(value)?.description || c.templateNote}</p>
  </section>;
}
