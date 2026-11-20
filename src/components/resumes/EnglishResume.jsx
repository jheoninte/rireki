import React from 'react';
import { englishTemplate } from '../../lib/english-templates';
import { bulletLines, englishEntries, englishSections } from '../../lib/english-resume';
import { accentColor } from '../../lib/korean-examples';

export default function EnglishResume({ data: d, variant, id }) {
  const t = englishTemplate(variant);
  const bullets = value => <ul>{bulletLines(value).map((line, i) => <li key={i}>{line}</li>)}</ul>;
  const sections = {
    summary: d.summary?.trim() && <p>{d.summary}</p>,
    careers: englishEntries(d.careers).map((row, i) => <div className="en-document-entry" key={i}><div className="en-entry-heading"><strong>{row.position || row.company}</strong><time>{row.period}</time></div>{row.position && row.company && <div className="en-entry-subtitle">{row.company}</div>}{bullets(row.role)}</div>),
    projects: englishEntries(d.projects).map((row, i) => <div className="en-document-entry" key={i}><div className="en-entry-heading"><strong>{row.projectName}</strong><time>{row.projectPeriod}</time></div>{row.projectRole && <div className="en-entry-subtitle">{row.projectRole}</div>}{row.projectStack && <small>{row.projectStack}</small>}{bullets(row.projectResult)}</div>),
    education: englishEntries(d.education).map((row, i) => <div className="en-document-entry" key={i}><div className="en-entry-heading"><strong>{row.school}</strong><time>{row.period}</time></div>{row.major && <p>{row.major}</p>}</div>),
    skills: d.skills?.trim() && <p>{d.skills}</p>, qualifications: d.qualifications?.trim() && <p>{d.qualifications}</p>,
  };
  return <article id={id} className={`resume-paper en-document en-frame-${t.frame} en-density-${t.density} en-font-${t.font} en-align-${t.align} en-design-${t.id}`} style={{ '--en-accent': accentColor(d.accent), minHeight: d.paperSize === 'a4' ? 1123 : 1028 }}>
    <header className="en-document-header"><h3>{d.name || 'Your name'}</h3>{d.title && <p>{d.title}</p>}<div>{[d.email, d.phone, d.address].filter(Boolean).map((text, i) => <span key={i}>{text}</span>)}</div>{/^https:\/\//i.test(d.portfolio || '') && <a href={d.portfolio}>{d.portfolio}</a>}</header>
    {t.order.map(key => { const content = sections[key]; if (!content || (Array.isArray(content) && !content.length)) return null; return <section className="en-document-section" key={key} data-resume-section={key}><h4>{englishSections[key]}</h4>{content}</section>; })}
  </article>;
}
