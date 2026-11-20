import React from "react";
import { japaneseAddress } from '../../lib/japanese-personal';

export const portfolioUrl = (value) => /^https:\/\//i.test(value || "") ? value : "";
export const filledEntries = (entries = []) => entries.filter((entry) => Object.values(entry).some((value) => value?.trim()));
export function Section({ title, children, className = "" }) {
  return <section className={`special-section ${className}`}><h4>{title}</h4>{children}</section>;
}
export function Contact({ data, copy }) {
  const details = { ...data, address: japaneseAddress(data.address, data.postalCode) };
  return <div className="special-contact">{["email", "phone", "address"].filter(key => details[key]).map(key => <span key={key}>{copy.fields[key]}：{details[key]}</span>)}</div>;
}
export function Experience({ data, copy }) {
  return <Section title={copy.fields.careers}>{filledEntries(data.careers).map((entry, index) => <div className="special-entry" key={index}><div className="special-entry-heading"><strong>{entry.company}</strong><time>{entry.period}</time></div><b>{entry.position}</b><p>{entry.role}</p></div>)}</Section>;
}
export function Education({ data, copy }) {
  return <Section title={copy.fields.education}>{filledEntries(data.education).map((entry, index) => <div className="special-entry" key={index}><strong>{entry.school}</strong><p>{entry.major}</p><time>{entry.period}</time></div>)}</Section>;
}
export function Skills({ data, title }) {
  return <Section title={title}><div className="special-skills">{(data.skills || "").split(/[,、\n]/).map(x => x.trim()).filter(Boolean).map((skill, i) => <span key={i}>{skill}</span>)}</div></Section>;
}
