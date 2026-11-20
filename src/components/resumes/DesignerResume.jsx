import React from "react";
import { Contact, Education, Experience, Section, Skills, portfolioUrl } from "./shared";

export default function DesignerResume({ data: d, copy, id }) {
  const url = portfolioUrl(d.portfolio);
  return <article id={id} className="resume-paper special-document designer-document">
    <header className="designer-identity"><span className="special-eyebrow">DESIGN PORTFOLIO / CURRICULUM VITAE</span><h3>{d.name || copy.resume.emptyName}</h3><p>{d.title}</p></header>
    <section className="designer-portfolio"><h4>{copy.documents.selectedPortfolio}</h4>{url ? <a href={url}>{url}<span aria-hidden="true">↗</span></a> : <p>{copy.documents.portfolioHint}</p>}</section>
    {d.intro && <Section title={copy.fields.intro}><p>{d.intro}</p></Section>}
    <Experience data={d} copy={copy} />
    <div className="designer-details"><div><Skills data={d} title={copy.documents.designTools} />{d.qualifications && <Section title={copy.fields.qualifications}><p>{d.qualifications}</p></Section>}<Contact data={d} copy={copy} /></div><Education data={d} copy={copy} /></div>
    {d.summary && <Section title={copy.fields.summary}><p>{d.summary}</p></Section>}{d.motivation && <Section title={copy.fields.motivation}><p>{d.motivation}</p></Section>}
  </article>;
}
