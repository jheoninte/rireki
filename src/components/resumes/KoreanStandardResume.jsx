import React from 'react';
import Portrait from './PassportPortrait';
import { accentColor } from '../../lib/korean-examples';

const filled = rows => (rows || []).filter(row => Object.values(row).some(value => value?.trim()));

export default function KoreanStandardResume({ data: d, copy, id, example }) {
  const f = copy.fields;
  const projects = filled(d.projects), careers = filled(d.careers), schools = filled(d.education);
  const portfolio = /^https:\/\//i.test(d.portfolio || '') ? d.portfolio : '';
  const section = (key, title, content) => <section className="ko-standard-section" key={key}><h4>{title}</h4>{content}</section>;
  return <article id={id} className="resume-paper classic korean-document ko-standard" style={{ '--ko-accent': accentColor(d.accent) }}>
    <header className="ko-standard-heading"><div><span>RESUME</span><h3>이력서</h3></div>{d.documentDate && <p>{f.documentDate} {d.documentDate}</p>}</header>
    <div className="ko-standard-identity"><div><h3>{d.name || copy.resume.emptyName}</h3>{d.english && <small>{d.english}</small>}{d.title && <p>{d.title}</p>}</div>{(d.photo || example) && <div className="ko-standard-photo">{d.photo ? <img src={d.photo} alt={copy.resume.photo} /> : <Portrait />}</div>}</div>
    <dl className="ko-standard-contacts">{['email', 'phone', 'address', 'birth'].filter(key => d[key]?.trim()).map(key => <div key={key}><dt>{f[key]}</dt><dd>{d[key]}</dd></div>)}{portfolio && <div className="ko-standard-link"><dt>{f.portfolio}</dt><dd><a href={portfolio}>{portfolio}</a></dd></div>}</dl>
    {d.summary?.trim() && section('summary', f.summary, <p>{d.summary}</p>)}
    {careers.length > 0 && section('careers', f.careers, careers.map((row, i) => <div className="ko-standard-entry" key={i}><time>{row.period}</time><div><h5>{row.company}</h5>{row.position && <small>{row.position}</small>}{row.role && <p>{row.role}</p>}</div></div>))}
    {projects.length > 0 && section('projects', copy.builderFeatures.fields.projects, projects.map((row, i) => <div className="ko-standard-entry" key={i}><time>{row.projectPeriod}</time><div><h5>{row.projectName}</h5>{row.projectRole && <small>{row.projectRole}</small>}{row.projectStack && <p className="ko-standard-tools">{copy.builderFeatures.fields.projectStack} · {row.projectStack}</p>}{row.projectResult && <p>{row.projectResult}</p>}</div></div>))}
    {schools.length > 0 && section('education', f.education, schools.map((row, i) => <div className="ko-standard-entry" key={i}><time>{row.period}</time><div><h5>{row.school}</h5>{row.major && <p>{row.major}</p>}</div></div>))}
    {['skills', 'qualifications', 'intro', 'motivation', 'preferences'].filter(key => d[key]?.trim()).map(key => section(key, f[key], <p>{d[key]}</p>))}
  </article>;
}
