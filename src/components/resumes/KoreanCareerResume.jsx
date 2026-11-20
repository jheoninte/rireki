import React from 'react';
import { accentColor } from '../../lib/korean-examples';

const filled = rows => (rows || []).filter(row => Object.values(row).some(value => value?.trim()));

export default function KoreanCareerResume({ data: d, copy, id }) {
  const careers = filled(d.careers), projects = filled(d.projects);
  const section = (key, title, content) => <section className="ko-career-section" key={key}><h4>{title}</h4>{content}</section>;
  const portfolio = /^https:\/\//i.test(d.portfolio || '') ? d.portfolio : '';
  return <article id={id} className="resume-paper korean-document ko-career" style={{ '--ko-accent': accentColor(d.accent) }}>
    <header className="ko-career-heading"><span>CAREER DESCRIPTION</span><h3>경력기술서</h3>{d.documentDate && <time>{d.documentDate}</time>}</header>
    <div className="ko-career-identity"><h3>{d.name || copy.resume.emptyName}</h3>{d.title && <p>{d.title}</p>}<div>{[d.email, d.phone].filter(Boolean).map((text, i) => <span key={i}>{text}</span>)}</div>{portfolio && <a href={portfolio}>{portfolio}</a>}</div>
    {d.summary?.trim() && section('summary', '경력 요약', <p>{d.summary}</p>)}
    {d.skills?.trim() && section('skills', '핵심 역량·활용 도구', <p>{d.skills}</p>)}
    {careers.length > 0 && section('careers', '회사별 경력', careers.map((row, i) => <div className="ko-career-entry" key={i}><header><div><h5>{row.company}</h5>{row.position && <small>{row.position}</small>}</div><time>{row.period}</time></header>{row.role && <div className="ko-career-result"><b>담당 업무·주요 성과</b><p>{row.role}</p></div>}</div>))}
    {projects.length > 0 && section('projects', '주요 프로젝트·성과', projects.map((row, i) => <div className="ko-career-entry" key={i}><header><h5>{row.projectName}</h5><time>{row.projectPeriod}</time></header>{(row.projectRole || row.projectStack) && <dl>{row.projectRole && <div><dt>역할·팀 구성</dt><dd>{row.projectRole}</dd></div>}{row.projectStack && <div><dt>사용 기술·도구</dt><dd>{row.projectStack}</dd></div>}</dl>}{row.projectResult && <div className="ko-career-result"><b>문제·수행 내용·성과</b><p>{row.projectResult}</p></div>}</div>))}
    {d.qualifications?.trim() && section('qualifications', '관련 자격·어학', <p>{d.qualifications}</p>)}
  </article>;
}
