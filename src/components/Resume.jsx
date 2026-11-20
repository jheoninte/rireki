import React from "react";
import { UserRound } from "lucide-react";
import { useI18n } from "../i18n";

export const emptyResume = () => ({
  name: "",
  english: "",
  birth: "",
  phone: "",
  email: "",
  address: "",
  title: "",
  photo: "",
  education: [{ period: "", school: "", major: "" }],
  careers: [{ period: "", company: "", role: "" }],
  skills: "",
  intro: "",
  motivation: "",
});
export function Portrait() {
  return (
    <svg viewBox="0 0 80 100" role="img" aria-label="">
      <rect width="80" height="100" fill="#e9efea" />
      <path d="M5 100V85c0-19 16-26 35-26s35 7 35 26v15" fill="#698a7c" />
      <path d="m27 63 13 25 13-25" fill="#fff" />
      <path d="M33 48h14v18l-7 7-7-7" fill="#edc0a5" />
      <ellipse cx="40" cy="36" rx="19" ry="24" fill="#f5d0b7" />
      <path
        d="M21 41C11 10 36 0 52 9c14 5 12 24 8 32l-8-20c-11 5-20 0-23-4 0 11-5 14-8 24"
        fill="#3b4d44"
      />
      <path
        d="M21 28c-5 18-2 30 2 36h8c-10-9-8-24-10-36M59 25c7 19 3 33 0 39h-9c8-10 7-25 9-39"
        fill="#3b4d44"
      />
    </svg>
  );
}
export default function Resume({
  data,
  variant = "classic",
  id,
  example = false,
}) {
  const { copy } = useI18n();
  const d = data || copy.sample,
    c = copy.resume,
    f = copy.fields;
  const section = (title, sub, children) => (
    <section className="resume-section">
      <h4>
        {title}
        <span>{sub}</span>
      </h4>
      {children}
    </section>
  );
  return (
    <article id={id} className={`resume-paper ${variant}`}>
      <div className="resume-heading">
        <div>
          <p className="resume-kicker">CURRICULUM VITAE</p>
          <h3>{c.heading}</h3>
        </div>
        <span>{c.subtitle}</span>
      </div>
      <div className="resume-identity">
        <div className="identity-main">
          <small>{d.english || f.english}</small>
          <strong>{d.name || c.emptyName}</strong>
          <p>{d.title || ""}</p>
        </div>
        <div className="resume-photo">
          {d.photo ? (
            <img src={d.photo} alt={c.photo} />
          ) : example ? (
            <Portrait />
          ) : (
            <div className="photo-placeholder">
              <UserRound size={23} />
              <span>{c.photo}</span>
            </div>
          )}
        </div>
      </div>
      <div className="resume-contacts">
        {["birth", "phone", "email", "address"].map((key) => (
          <div key={key}>
            <b>{f[key]}</b>
            <span>{d[key] || "—"}</span>
          </div>
        ))}
      </div>
      {section(
        f.education,
        c.sections[0],
        d.education.map((x, i) => (
          <div className="resume-row" key={i}>
            <time>{x.period || "—"}</time>
            <div>
              <b>{x.school || "—"}</b>
              <p>{x.major}</p>
            </div>
          </div>
        )),
      )}
      {section(
        f.careers,
        c.sections[1],
        d.careers.map((x, i) => (
          <div className="resume-row" key={i}>
            <time>{x.period || "—"}</time>
            <div>
              <b>{x.company || "—"}</b>
              <p>{x.role}</p>
            </div>
          </div>
        )),
      )}
      {["skills", "intro", "motivation"].map((key, i) => (
        <React.Fragment key={key}>
          {section(
            f[key],
            c.sections[i + 2],
            <p className="resume-text">{d[key] || "—"}</p>,
          )}
        </React.Fragment>
      ))}
      <div className="resume-end">
        {c.confirmation}
        <br />
        <strong>
          {c.signature}　{d.name}
        </strong>
      </div>
    </article>
  );
}
