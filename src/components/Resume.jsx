import React from "react";
import Portrait from "./resumes/PassportPortrait";
export { default as Portrait } from "./resumes/PassportPortrait";
import { UserRound } from "lucide-react";
import { useI18n } from "../i18n";

import DeveloperResume from "./resumes/DeveloperResume";
import DesignerResume from "./resumes/DesignerResume";
import RirekishoResume from "./resumes/RirekishoResume";
import WorkHistoryResume from "./resumes/WorkHistoryResume";
import { isRirekishoTemplate } from '../lib/japanese-templates';
import { resumeMarket } from '../lib/resume-markets';
import { accentColor } from '../lib/korean-examples';
import KoreanStandardResume from './resumes/KoreanStandardResume';
import KoreanCareerResume from './resumes/KoreanCareerResume';
import EnglishResume from './resumes/EnglishResume';

const specializedTemplates = { developer: DeveloperResume, designer: DesignerResume, rirekisho: RirekishoResume, "work-history": WorkHistoryResume };
export { emptyResume } from "../lib/resume-data";

function KoreanProjects({ data, copy }) {
  const projects = (data.projects || []).filter(row => Object.values(row).some(Boolean));
  if (!projects.length) return null;
  const f = copy.builderFeatures.fields;
  return <section className="korean-projects"><h4>{f.projects}</h4>{projects.map((row, i) => <div className="korean-project" key={i}><div><strong>{row.projectName}</strong><time>{row.projectPeriod}</time></div>{row.projectRole && <p>{row.projectRole}</p>}{row.projectStack && <small>{f.projectStack}: {row.projectStack}</small>}<p>{row.projectResult}</p></div>)}</section>;
}

function ModernResume({ data: d, copy, id, locale }) {
  const f = copy.fields;
  const section = (key, title, children) => (
    <section className="folio-section" key={key}>
      <h4>{title}</h4>
      {children}
    </section>
  );
  const skills = d.skills
    .split(/[,、\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
  return (
    <article id={id} className={`resume-paper modern folio-document${locale === 'ko' ? ' korean-document' : ''}`} style={locale === 'ko' ? { '--ko-accent': accentColor(d.accent) } : undefined}>
      <div className="folio-accent" />
      <div className="folio-identity">
        <div>
          {d.english && <small className="folio-ruby">{d.english}</small>}
          <h3 className="folio-name">{d.name || copy.resume.emptyName}</h3>
          {d.title && <p className="folio-role">{d.title}</p>}
        </div>
        {d.photo && (
          <img className="folio-photo" src={d.photo} alt={copy.resume.photo} />
        )}
      </div>
      <div className="folio-contact">
        {["email", "phone", "address", "birth"]
          .filter((key) => d[key])
          .map((key) => (
            <span key={key}>
              {key === "birth" ? `${f[key]}：` : ""}
              {d[key]}
            </span>
          ))}
      </div>
      {/^https:\/\//i.test(d.portfolio || "") && (
        <p className="folio-portfolio">
          <a href={d.portfolio}>{d.portfolio}</a>
        </p>
      )}
      {d.summary?.trim() && section("summary", copy.fields.summary, <p>{d.summary}</p>)}
      {d.intro.trim() &&
        section("intro", `PROFILE · ${f.intro}`, <p>{d.intro}</p>)}
      {["careers", "education"].map((key) => {
        const items = d[key].filter((x) => Object.values(x).some(Boolean));
        if (!items.length) return null;
        return section(
          key,
          `${key === "careers" ? "EXPERIENCE" : "EDUCATION"} · ${f[key]}`,
          items.map((x, index) => (
            <div className="folio-entry" key={index}>
              <div className="folio-entry-title">
                <strong>{key === "careers" ? x.company : x.school}</strong>
                <time>{x.period}</time>
              </div>
              <div className="folio-subtitle">
                {key === "careers" ? x.position : x.major}
              </div>
              {key === "careers" && <p>{x.role}</p>}
            </div>
          )),
        );
      })}
      {skills.length > 0 &&
        section(
          "skills",
          `SKILLS · ${f.skills}`,
          <div className="folio-skills">
            {skills.map((skill, i) => (
              <span key={i}>{skill}</span>
            ))}
          </div>,
        )}
      {d.qualifications?.trim() && section("qualifications", copy.fields.qualifications, <p>{d.qualifications}</p>)}
      {d.preferences?.trim() && section("preferences", copy.fields.preferences, <p>{d.preferences}</p>)}
      {locale === 'ko' && <KoreanProjects data={d} copy={copy} />}
      {d.motivation.trim() &&
        section(
          "motivation",
          `MOTIVATION · ${f.motivation}`,
          <p>{d.motivation}</p>,
        )}
    </article>
  );
}
export default function Resume({
  data,
  variant: requestedVariant,
  id,
  example = false,
}) {
  const { copy, locale } = useI18n();
  const variant = requestedVariant || resumeMarket(locale).defaultTemplate;
  const d = data || { ...copy.sample, ...copy.templateSamples?.[variant] },
    c = copy.resume,
    f = copy.fields;
  if (locale === 'en') return <EnglishResume data={d} variant={variant} id={id} />;
  const Template = isRirekishoTemplate(variant) ? RirekishoResume : specializedTemplates[variant];
  if (locale === 'ko' && variant === 'career-description')
    return <KoreanCareerResume data={d} copy={copy} id={id} />;
  if (Template) return <Template data={d} copy={copy} id={id} example={example} variant={variant} />;
  if (variant === "modern")
    return <ModernResume data={d} copy={copy} id={id} locale={locale} />;
  if (locale === 'ko' && variant === 'classic')
    return <KoreanStandardResume data={d} copy={copy} id={id} example={example} />;
  const portfolio = /^https:\/\//i.test(d.portfolio || "") ? d.portfolio : "";
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
    <article id={id} className={`resume-paper ${variant}${locale === 'ko' ? ' korean-document' : ''}`} style={locale === 'ko' ? { '--ko-accent': accentColor(d.accent) } : undefined}>
      <div className="resume-heading">
        <div>
          <p className="resume-kicker">CURRICULUM VITAE</p>
          <h3>{c.heading}</h3>
        </div>
        <span>{c.subtitle}</span>
      </div>
      <div className="resume-identity">
        <div className="identity-main">
          {(locale !== 'ko' || d.english) && <small>{d.english || f.english}</small>}
          <strong>{d.name || c.emptyName}</strong>
          <p>{d.title || ""}</p>
        </div>
        {(locale !== 'ko' || d.photo || example) && <div className="resume-photo">
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
        </div>}
      </div>
      <div className="resume-contacts">
        {["birth", "phone", "email", "address"].map((key) => (
          <div key={key}>
            <b>{f[key]}</b>
            <span>{d[key] || "—"}</span>
          </div>
        ))}
      </div>
      {portfolio && (
        <section className="resume-portfolio">
          <b>{f.portfolio}</b>
          <p>
            <a href={portfolio}>{portfolio}</a>
          </p>
        </section>
      )}
      {variant === "developer" &&
        section(
          f.skills,
          c.sections[2],
          <p className="resume-text">{d.skills || "—"}</p>,
        )}
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
              {x.position && <p>{x.position}</p>}
              <p>{x.role}</p>
            </div>
          </div>
        )),
      )}
      {["skills", "intro", "motivation"].map((key, i) =>
        variant === "developer" && key === "skills" ? null : (
          <React.Fragment key={key}>
            {section(
              f[key],
              c.sections[i + 2],
              <p className="resume-text">{d[key] || "—"}</p>,
            )}
          </React.Fragment>
        ),
      )}
      {["summary", "qualifications", "preferences"].filter(key => d[key]?.trim()).map(key => <React.Fragment key={key}>{section(f[key], "", <p className="resume-text">{d[key]}</p>)}</React.Fragment>)}
      {locale === 'ko' && <KoreanProjects data={d} copy={copy} />}
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
