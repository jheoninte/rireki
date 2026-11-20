import React from "react";
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, Download, FileText, Globe2, LayoutTemplate, Leaf, LockKeyhole, PencilLine, Plus, Save, ShieldCheck, Smartphone, Sparkles, ZoomIn } from "lucide-react";
import { useI18n, I18nProvider } from "../i18n";
import KoreanLanding from './KoreanLanding';
import EnglishComingSoon from './EnglishComingSoon';
import EnglishLanding from './EnglishLanding';
import MarketNavigation from './MarketNavigation';
import { marketEditor } from '../lib/market-routes';
import { Logo, SectionTitle } from "./ui";
import Resume from "./Resume";
import JapaneseTemplateGallery from "./JapaneseTemplateGallery";
import { resumeMarket } from "../lib/resume-markets";
const SaveSymbol = Save;
export function JapaneseLanding({ setPreview }) {
  const { copy, locale } = useI18n();
  const japan = copy.japan, market = resumeMarket(locale);
  const nav = Object.entries(copy.nav);
  return (
        <main className="japan-landing">
          <section className="jp-hero">
            <div className="jp-hero-inner">
              <div className="jp-hero-copy">
                <span className="jp-eyebrow"><span />{japan.badge}</span>
                <h1>{japan.heroTitle[0]}<br /><span>{japan.heroTitle[1]}</span></h1>
                <p className="jp-hero-description">{japan.heroDescription}</p>
                <div className="jp-benefits">{japan.benefits.map(text => <span key={text}><CheckCircle2 size={15} />{text}</span>)}</div>
                <div className="jp-hero-actions">
                  <a className="btn jp-start" href={`/app/?template=${market.defaultTemplate}`}>{japan.start}<ArrowRight size={20} /></a>
                  <p>{japan.note}</p>
                  <a className="jp-choose-link" href="#templates">{japan.choose}<ArrowRight size={16} /></a>
                  <a className="jp-resume-link" href="/app/"><PencilLine size={16} />{japan.resume}<ArrowUpRight size={17} /></a>
                </div>
              </div>
              <div className="jp-hero-art" aria-label={japan.previewLabel}>
                <div className="jp-document-workbench">
                  <div className="jp-workbench-title"><span><FileText size={17} />履歴書の仕上がり</span><small>A4 / 2ページ</small></div>
                  <div className="jp-workbench-paper" aria-hidden="true" inert><Resume variant={market.defaultTemplate} example /></div>
                  <div className="jp-workbench-footer"><CheckCircle2 size={14} />{japan.formTag}</div>
                </div>
                <span className="jp-sample-note">{japan.sample}</span>
              </div>
            </div>
          </section>
          <div className="trust-strip">
            <div>
              {copy.strip.map((text, i) => {
                const Icon = [ShieldCheck, Smartphone, LockKeyhole, Download][
                  i
                ];
                return (
                  <span key={text}>
                    <Icon size={17} strokeWidth={1.5} />
                    {text}
                  </span>
                );
              })}
            </div>
          </div>
          <section className="how-section section-container" id="how">
            <SectionTitle
              eyebrow={copy.how.eyebrow}
              title={copy.how.title}
              description={copy.how.description}
            />
            <div className="how-grid">
              {copy.how.items.map((item, i) => {
                const Icon = [PencilLine, LayoutTemplate, Download][i];
                return (
                  <article className="how-card" key={item.title}>
                    <div className="how-card-top">
                      <span className="step-num">0{i + 1}</span>
                      <span className="how-icon">
                        <Icon size={26} strokeWidth={1.4} />
                      </span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    {i < 2 && (
                      <span className="how-arrow">
                        <ArrowRight size={19} />
                      </span>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
          <JapaneseTemplateGallery setPreview={setPreview} />
          <section className="features-section section-container" id="features">
            <div className="feature-illustration">
              <span className="feature-card-overline">
                {copy.features.cardTag}
              </span>
              <div className="feature-paper-stack">
                <div />
                <div />
                <div>
                  <span className="feature-paper-icon">
                    <Leaf size={33} strokeWidth={1.3} />
                  </span>
                  <span className="feature-paper-line" />
                  <span className="feature-paper-line short" />
                  <div className="feature-paper-check">
                    <Check size={20} />
                  </div>
                </div>
                <span className="feature-orbit" />
              </div>
              <h3>{copy.features.cardTitle}</h3>
              <p>{copy.features.cardText}</p>
              <span className="feature-spark">✳</span>
            </div>
            <div className="features-copy">
              <SectionTitle
                left
                eyebrow={copy.features.eyebrow}
                title={copy.features.title}
                description={copy.features.description}
              />
              <div className="feature-list">
                {copy.features.items.map((item, i) => {
                  const Icon = [SaveSymbol, Smartphone, Download][i];
                  return (
                    <div key={item.title}>
                      <span>
                        <Icon size={19} strokeWidth={1.5} />
                      </span>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
          <section className="privacy-strip">
            <ShieldCheck size={20} strokeWidth={1.5} />
            <p>{copy.features.privacy}</p>
            <span>PRIVATE BY DESIGN</span>
          </section>
          <section className="document-guide section-container" id="documents">
            <span className="overline">JAPANESE APPLICATION DOCUMENTS</span>
            <h2>履歴書と職務経歴書、応募に合わせて。</h2>
            <div className="document-guide-grid">
              <article><h3>履歴書：基本情報を正確に</h3><p>氏名・ふりがな・証明写真・学歴・職歴・免許や資格を、罫線付きの書式に整理。志望動機と本人希望欄も用意しています。</p><a href="/app/?template=rirekisho">履歴書を無料で作成 →</a></article>
              <article><h3>職務経歴書：経験と実績を具体的に</h3><p>職務要約、会社ごとの担当業務・実績、活かせるスキル、自己PRをまとめる専用書式。履歴書と同じ入力内容を使って切り替えられます。</p><a href="/app/?template=work-history">職務経歴書を無料で作成 →</a></article>
            </div>
            <p className="template-disclaimer">{japan.documentNote}</p>
          </section>
          <section className="faq-section section-container" id="faq">
            <SectionTitle eyebrow={copy.faq.eyebrow} title={copy.faq.title} />
            <div className="faq-list">
              {copy.faq.items.map(([question, answer], i) => (
                <details key={question}>
                  <summary>
                    <span className="faq-number">0{i + 1}</span>
                    <span>{question}</span>
                    <Plus size={18} />
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </section>
          <section className="bottom-cta">
            <div className="cta-ring ring-one" />
            <div className="cta-ring ring-two" />
            <span className="overline">{copy.cta.eyebrow}</span>
            <h2>{copy.cta.title}</h2>
            <p>{copy.cta.description}</p>
            <a className="btn btn-primary" href="/app/?template=rirekisho">
              {copy.common.start}
              <ArrowUpRight size={19} />
            </a>
            <span className="cta-guest">{copy.hero.badge}</span>
          </section>
          <footer className="site-footer">
            <div className="footer-top">
              <div>
                <Logo />
                <p>{copy.footer.description}</p>
              </div>
              <div className="footer-links">
                <a href="/privacy.html">{copy.footer.privacy}</a>
                {nav.map(([key, label]) => (
                  <a href={`#${key}`} key={key}>
                    {label}
                  </a>
                ))}
              </div>
              <div className="footer-account">
                <a href="/app/?auth=signup">
                  {copy.footer.account}
                  <ArrowUpRight size={14} />
                </a>
                <a href="/app/?auth=login">
                  {copy.common.login}
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
            <div className="footer-bottom">
              <small>
                © {new Date().getFullYear()} {copy.common.brand} {copy.footer.copyright}
              </small>
              <span>
                <Globe2 size={13} />
                {copy.footer.localeNote}
              </span>
              <span>{copy.common.tagline}</span>
            </div>
          </footer>
        </main>
  );
}
// Register a distinct page when publishing another market; do not translate the
// Japanese landing and accidentally retain its fixed Japanese application form.
const marketLandings = { japan: JapaneseLanding, korea: KoreanLanding, international: EnglishLanding };
export default function Landing(props) {
  const { locale } = useI18n();
  const market = resumeMarket(locale), Page = marketLandings[market.landing];
  return market.published && Page ? <Page {...props} /> : <EnglishComingSoon />;
}
function StaticContent() {
  const { copy, locale } = useI18n(), market = resumeMarket(locale);
  return <><header className={`site-header ${locale === 'ja' ? 'japanese-site-header' : 'korean-site-header'}`}><div className="header-inner"><Logo /><nav className="header-nav" aria-label={copy.common.menu}>{Object.entries(copy.nav).map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>{market.published && <a className="btn btn-primary" href={`${marketEditor(locale)}?template=${market.defaultTemplate}`}>{copy.common.create}<ArrowUpRight size={16} /></a>}</div><MarketNavigation /></header><Landing /></>;
}
export function StaticLanding({ locale = 'ja' }) {
  return <I18nProvider locale={locale}><StaticContent /></I18nProvider>;
}
