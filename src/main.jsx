import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Globe2,
  LayoutTemplate,
  Leaf,
  LockKeyhole,
  LogOut,
  Menu,
  Monitor,
  PencilLine,
  Plus,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
  ZoomIn,
} from "lucide-react";
import { I18nProvider, useI18n } from "./i18n";
import { supabase } from "./lib/auth";
import { Button, Logo, Modal, SectionTitle } from "./components/ui";
import Resume from "./components/Resume";
import Builder from "./components/Builder";
import AuthDialog from "./components/AuthDialog";
import "./styles.css";

function App() {
  const { copy, locale } = useI18n();
  const [builder, setBuilder] = useState(location.hash === "#builder"),
    [preview, setPreview] = useState(null),
    [authMode, setAuthMode] = useState(null),
    [menu, setMenu] = useState(false),
    [accountMenu, setAccountMenu] = useState(false),
    [session, setSession] = useState(null),
    [authNotice, setAuthNotice] = useState(""),
    [loggingOut, setLoggingOut] = useState(false);
  const accountRef = useRef();
  const [variant, setVariant] = useState(() => {
    try {
      return localStorage.getItem("resumemaker-style") === "modern"
        ? "modern"
        : "classic";
    } catch {
      return "classic";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("resumemaker-style", variant);
    } catch {
      /* The editor handles storage errors. */
    }
  }, [variant]);
  useEffect(() => {
    const route = () => {
      const hash = location.hash;
      setBuilder(hash === "#builder");
      setMenu(false);
      if (hash === "#reset-password") setAuthMode("reset");
      if (hash && hash !== "#builder")
        requestAnimationFrame(() =>
          document
            .getElementById(hash.slice(1))
            ?.scrollIntoView({ block: "start" }),
        );
    };
    window.addEventListener("hashchange", route);
    route();
    return () => window.removeEventListener("hashchange", route);
  }, []);
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (alive) {
          setSession(data.session);
          if (error) setAuthNotice(copy.auth.callbackError);
        }
      })
      .catch(() => {
        if (alive) setAuthNotice(copy.auth.generic);
      });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, next) => {
      if (!alive) return;
      setSession(next);
      if (event === "PASSWORD_RECOVERY") setAuthMode("update");
    });
    const query = new URLSearchParams(location.search),
      hashParams = new URLSearchParams(location.hash.slice(1));
    if (query.has("error") || hashParams.has("error"))
      setAuthNotice(copy.auth.callbackError);
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [copy]);
  useEffect(() => {
    if (!accountMenu) return;
    const close = (e) => {
      if (!accountRef.current?.contains(e.target)) setAccountMenu(false);
    };
    const escape = (e) => {
      if (e.key === "Escape") setAccountMenu(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [accountMenu]);
  const start = (style) => {
    if (typeof style === "string") setVariant(style);
    setAuthMode(null);
    setPreview(null);
    setMenu(false);
    location.hash = "builder";
    setBuilder(true);
    window.scrollTo(0, 0);
  };
  const home = (e) => {
    e?.preventDefault();
    location.hash = "";
    setBuilder(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const logout = async () => {
    if (!supabase) return;
    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setAccountMenu(false);
    } catch {
      setAuthNotice(copy.auth.logoutError);
    } finally {
      setLoggingOut(false);
    }
  };
  const nav = Object.entries(copy.nav);
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Logo onClick={home} />
          <nav className="header-nav" aria-label={copy.common.menu}>
            {nav.map(([key, label]) => (
              <a key={key} href={`#${key}`} onClick={() => setBuilder(false)}>
                {label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <span className="locale-label">
              <Globe2 size={14} />
              {copy.common.locale}
            </span>
            {session ? (
              <div className="account-wrap" ref={accountRef}>
                <button
                  type="button"
                  className="account-trigger"
                  onClick={() => setAccountMenu(!accountMenu)}
                  aria-label={copy.common.account}
                  aria-expanded={accountMenu}
                >
                  <span>
                    {session.user.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                  <ChevronDown size={13} />
                </button>
                {accountMenu && (
                  <div className="account-dropdown">
                    <small>{copy.common.account}</small>
                    <p>{session.user.email}</p>
                    <span>{copy.auth.storage}</span>
                    <button
                      type="button"
                      disabled={loggingOut}
                      onClick={logout}
                    >
                      <LogOut size={14} />
                      {loggingOut ? copy.common.working : copy.common.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="header-login"
                onClick={() => setAuthMode("login")}
              >
                {copy.common.login}
              </button>
            )}
            <Button className="header-create" onClick={() => start()}>
              {copy.common.create}
              <ArrowUpRight size={15} />
            </Button>
            <button
              type="button"
              className="icon-btn mobile-menu-toggle"
              aria-label={copy.common.menu}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
        {menu && (
          <nav className="mobile-nav">
            {nav.map(([key, label]) => (
              <a
                key={key}
                href={`#${key}`}
                onClick={() => {
                  setBuilder(false);
                  setMenu(false);
                }}
              >
                {label}
                <ArrowUpRight size={14} />
              </a>
            ))}
            {!session && (
              <button
                type="button"
                onClick={() => {
                  setMenu(false);
                  setAuthMode("signup");
                }}
              >
                {copy.footer.account}
                <ArrowUpRight size={14} />
              </button>
            )}
          </nav>
        )}
      </header>
      {authNotice && (
        <div className="global-notice" role="alert">
          {authNotice}
          <button
            className="icon-btn"
            type="button"
            aria-label={copy.common.close}
            onClick={() => setAuthNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {builder ? (
        <Builder
          key={locale}
          onHome={home}
          variant={variant}
          setVariant={setVariant}
        />
      ) : (
        <main>
          <section className="hero">
            <div className="hero-inner">
              <div className="hero-copy">
                <span className="hero-badge">
                  <span />
                  {copy.hero.badge}
                </span>
                <h1>
                  {copy.hero.line1}
                  <br />
                  <span>{copy.hero.line2}</span>
                </h1>
                <p className="hero-description">{copy.hero.description}</p>
                <div className="hero-buttons">
                  <Button onClick={() => start()}>
                    {copy.common.start}
                    <ArrowUpRight size={19} />
                  </Button>
                  <a className="hero-template-link" href="#templates">
                    {copy.hero.templates}
                    <ArrowRight size={16} />
                  </a>
                </div>
                <p className="hero-note">{copy.hero.note}</p>
                <div className="hero-checks">
                  {copy.hero.checks.map((text) => (
                    <span key={text}>
                      <Check size={14} />
                      {text}
                    </span>
                  ))}
                </div>
              </div>
              <div className="hero-art">
                <div className="art-grid" />
                <div className="art-circle" />
                <span className="art-spark">✳</span>
                <div className="paper-back" />
                <div className="hero-document">
                  <div className="document-top">
                    <span />
                    <span />
                    <span />
                    <small>{copy.hero.resumeTag}</small>
                  </div>
                  <div className="hero-paper-wrap">
                    <Resume example />
                  </div>
                </div>
                <div className="mini-editor">
                  <div className="mini-editor-heading">
                    <PencilLine size={15} />
                    <span>{copy.hero.editLabel}</span>
                  </div>
                  <label>{copy.hero.editName}</label>
                  <div className="mini-input">
                    {copy.hero.editValue}
                    <span />
                  </div>
                  <div className="mini-progress">
                    <i />
                  </div>
                  <small>
                    {copy.hero.editProgress}
                    <span>75%</span>
                  </small>
                </div>
                <div className="art-saved">
                  <span>
                    <Check size={19} />
                  </span>
                  <div>
                    <strong>{copy.hero.floatingTitle}</strong>
                    <p>{copy.hero.floatingText}</p>
                  </div>
                </div>
                <div className="art-caption">
                  <span />
                  {copy.hero.sample}
                </div>
              </div>
            </div>
            <div className="hero-scroll">
              <span />
              {copy.hero.scroll}
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
          <section className="template-section" id="templates">
            <div className="section-container">
              <div className="template-section-heading">
                <SectionTitle
                  left
                  eyebrow={copy.templates.eyebrow}
                  title={copy.templates.title}
                  description={copy.templates.description}
                />
                <span className="free-note">
                  <CheckCircle2 size={16} />
                  {copy.templates.all}
                </span>
              </div>
              <div className="template-grid">
                {["classic", "modern"].map((style, i) => (
                  <article className={`template-card ${style}`} key={style}>
                    <button
                      type="button"
                      className="template-visual"
                      aria-label={`${copy.templates[style]} ${copy.templates.expand}`}
                      onClick={() => setPreview(style)}
                    >
                      {i === 0 && (
                        <span className="popular-tag">
                          <Sparkles size={12} />
                          {copy.templates.popular}
                        </span>
                      )}
                      <div className="template-paper-wrap">
                        <Resume variant={style} example />
                      </div>
                      <span className="template-zoom">
                        <ZoomIn size={16} />
                        {copy.templates.expand}
                      </span>
                    </button>
                    <div className="template-info">
                      <div>
                        <span className="template-number">0{i + 1}</span>
                        <h3>{copy.templates[style]}</h3>
                        <span className="template-size">A4</span>
                      </div>
                      <p>
                        {i === 0
                          ? copy.templates.classicDescription
                          : copy.templates.modernDescription}
                      </p>
                      <button
                        type="button"
                        className="template-use"
                        onClick={() => start(style)}
                      >
                        {copy.templates.use}
                        <ArrowUpRight size={17} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <p className="template-disclaimer">{copy.templates.disclaimer}</p>
            </div>
          </section>
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
            <Button onClick={() => start()}>
              {copy.common.start}
              <ArrowUpRight size={19} />
            </Button>
            <span className="cta-guest">{copy.hero.badge}</span>
          </section>
          <footer className="site-footer">
            <div className="footer-top">
              <div>
                <Logo onClick={home} />
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
                <button type="button" onClick={() => setAuthMode("signup")}>
                  {copy.footer.account}
                  <ArrowUpRight size={14} />
                </button>
                <button type="button" onClick={() => setAuthMode("login")}>
                  {copy.common.login}
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
            <div className="footer-bottom">
              <small>
                © {new Date().getFullYear()} rireki. {copy.footer.copyright}
              </small>
              <span>
                <Globe2 size={13} />
                {copy.footer.localeNote}
              </span>
              <span>{copy.common.tagline}</span>
            </div>
          </footer>
        </main>
      )}
      {preview && (
        <Modal
          title={copy.templates.modal}
          className="resume-modal"
          onClose={() => setPreview(null)}
        >
          <div className="modal-paper">
            <Resume variant={preview} example />
          </div>
          <div className="modal-bottom">
            <span>{copy.templates[preview]}</span>
            <Button onClick={() => start(preview)}>
              {copy.templates.use}
              <ArrowUpRight size={16} />
            </Button>
          </div>
        </Modal>
      )}
      {authMode && (
        <AuthDialog
          key={authMode}
          initialMode={authMode}
          onClose={() => setAuthMode(null)}
          onGuest={() => start()}
        />
      )}
    </>
  );
}
function SaveSymbol(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8M7 3v5h8" />
    </svg>
  );
}

createRoot(document.getElementById("root")).render(
  <I18nProvider locale="ja">
    <App />
  </I18nProvider>,
);
