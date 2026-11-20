import React from "react";
import { Contact, Education, Experience, Section, Skills, portfolioUrl } from "./shared";

export default function DeveloperResume({ data: d, copy, id }) {
  const url = portfolioUrl(d.portfolio);
  return <article id={id} className="resume-paper special-document developer-document">
    <header className="developer-identity"><span className="special-eyebrow">ENGINEERING PROFILE</span><h3>{d.name || copy.resume.emptyName}</h3><p>{d.title}</p><Contact data={d} copy={copy} />{url && <a className="developer-repository" href={url}>GitHub / Portfolio · {url}</a>}</header>
    <div className="developer-columns"><aside><Skills data={d} title={copy.documents.technicalSkills} /><Education data={d} copy={copy} />{d.qualifications && <Section title={copy.fields.qualifications}><p>{d.qualifications}</p></Section>}</aside>
      <div>{d.summary && <Section title={copy.fields.summary}><p>{d.summary}</p></Section>}{d.intro && <Section title={copy.fields.intro}><p>{d.intro}</p></Section>}<Experience data={d} copy={copy} />{d.motivation && <Section title={copy.fields.motivation}><p>{d.motivation}</p></Section>}</div></div>
  </article>;
}
