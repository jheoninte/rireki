import React from 'react';
import { ArrowUpRight, CheckCircle2, ZoomIn } from 'lucide-react';
import { useI18n } from '../i18n';
import Resume from './Resume';
import { japaneseCategories, japaneseTemplates, applicantFieldLabels } from '../lib/japanese-templates';

export default function JapaneseTemplateGallery({ setPreview }) {
  const { copy } = useI18n();
  return <section className="template-section applicant-catalog" id="templates">
    <div className="section-container">
      <div className="catalog-heading"><div><span className="overline">あなたに合う書類から</span><h2>{copy.japan.templateHeading}</h2><p>{copy.japan.templateDescription}</p></div><span className="catalog-free"><CheckCircle2 size={16} />すべて無料で作成</span></div>
      <div className="template-catalog">
        <fieldset className="catalog-filters"><legend>応募する状況から選ぶ</legend>{japaneseCategories.map(([value, label]) => <label key={value}><input type="radio" name="applicant-template-filter" value={value} defaultChecked={value === 'all'} /><span>{label}</span></label>)}</fieldset>
        <div className="case-template-grid">{japaneseTemplates.map((template, index) => <article className={`template-card case-template-card ${template.id}`} key={template.id} data-category={template.category}>
          <div className="case-card-preview"><span className="case-card-tag">{template.tag}</span><div className="case-preview-paper" aria-hidden="true" inert><Resume variant={template.id} example /></div><a href={`/app/?template=${template.id}`} className="case-preview-open" aria-label={`${template.name} ${copy.templates.expand}`} onClick={setPreview ? event => { event.preventDefault(); setPreview(template.id); } : undefined}><ZoomIn size={16} />{copy.templates.expand}</a></div>
          <div className="case-card-content"><span className="case-card-number">0{index + 1} / A4{template.id === 'work-history' ? '' : '・2ページ'}</span><h3>{template.name}</h3><p>{template.description}</p><small>{template.audience}</small>{template.writingFields.concat(template.preferenceFields).length > 0 && <ul>{template.writingFields.concat(template.preferenceFields).map(field => <li key={field}>{applicantFieldLabels[field]}</li>)}</ul>}<a href={`/app/?template=${template.id}`} className="case-card-use">この書式で作成する<ArrowUpRight size={16} /></a></div>
        </article>)}</div>
      </div>
      <p className="catalog-note">{copy.japan.documentNote}</p>
    </div>
  </section>;
}
