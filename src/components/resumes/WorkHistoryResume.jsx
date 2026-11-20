import React from "react";
import { Contact, Experience, Section, Skills, portfolioUrl } from "./shared";

export default function WorkHistoryResume({ data: d, copy, id }) {
  const url = portfolioUrl(d.portfolio);
  return <article id={id} className="resume-paper special-document work-history-document">
    <header className="japanese-heading"><h3>職 務 経 歴 書</h3><div>{d.documentDate && <p>{d.documentDate} 現在</p>}<p>{d.name || copy.resume.emptyName}</p></div></header>
    <Contact data={d} copy={copy} />
    <Section title={copy.fields.summary}><p>{d.summary || "　"}</p></Section>
    <Experience data={d} copy={{ ...copy, fields: { ...copy.fields, careers: copy.documents.detailedHistory } }} />
    {(d.projects || []).filter(row => Object.values(row).some(Boolean)).map((row, i) => <Section key={i} title={row.projectName || copy.builderFeatures.fields.projects}><p>{row.projectPeriod}　{row.projectRole}</p><table className="project-stack-table"><tbody><tr><th>{copy.builderFeatures.fields.projectStack}</th><td>{row.projectStack}</td></tr></tbody></table><p>{row.projectResult}</p></Section>)}
    <Skills data={d} title={copy.documents.applicableSkills} />
    {d.qualifications && <Section title={copy.fields.qualifications}><p>{d.qualifications}</p></Section>}
    {url && <Section title={copy.fields.portfolio}><a href={url}>{url}</a></Section>}
    <Section title={copy.fields.intro}><p>{d.intro || "　"}</p></Section>
    {d.motivation && <Section title={copy.fields.motivation}><p>{d.motivation}</p></Section>}
    <p className="japanese-end">以上</p>
  </article>;
}
