import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Download,
  Globe2,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { I18nProvider, useI18n } from "./i18n";
import { supabase } from "./lib/auth";
import { templates } from "./lib/services";
import { isLegacyEditorPath } from "./lib/routes";
import { initialTemplate, resumeMarket } from "./lib/resume-markets";
import { readAuthRoute } from "./lib/auth-route";
import { Button, Logo, Modal } from "./components/ui";
import Resume from "./components/Resume";
import Builder from "./components/Builder";
import Landing from "./components/Landing";
import AuthDialog from "./components/AuthDialog";
import MarketNavigation from './components/MarketNavigation';
import { localeFromLocation, marketHome, isEditorPath, recoveryPath } from './lib/market-routes';
import "./styles.css";
import "./unified.css";
import "./japan.css";
import './korea.css';
import './site-refresh.css';
import './english.css';

export function App() {
  const { copy, locale } = useI18n();
  const [recovery, setRecovery] = useState(
    () => readAuthRoute(location).recovery,
  );
  const [checkingRecovery, setCheckingRecovery] = useState(
    () => readAuthRoute(location).exchanging,
  );
  const [builder, setBuilder] = useState(isEditorPath(location.pathname) || location.hash === "#builder"),
    [preview, setPreview] = useState(null),
    [authMode, setAuthMode] = useState(() => { const mode = new URLSearchParams(location.search).get("auth"); return ["login", "signup"].includes(mode) ? mode : null; }),
    [menu, setMenu] = useState(false),
    [accountMenu, setAccountMenu] = useState(false),
    [session, setSession] = useState(null),
    [authNotice, setAuthNotice] = useState(""),
    [passwordUpdated, setPasswordUpdated] = useState(false),
    [loggingOut, setLoggingOut] = useState(false);
  const accountRef = useRef(),
    builderActions = useRef();
  const [exportBusy, setExportBusy] = useState(false);
  const [authRequest, setAuthRequest] = useState(null);
  const requestLogin = (options = {}) => {
    setAuthRequest(options);
    setAuthMode("login");
  };
  const closeAuth = () => {
    authRequest?.onDismiss?.();
    setAuthRequest(null);
    setAuthMode(null);
  };
  useEffect(() => {
    if (session && !recovery) {
      setAuthMode(null);
      setAuthRequest(null);
    }
  }, [session, recovery]);
  const [variant, setVariant] = useState(() => initialTemplate(locale, location.search));
  useEffect(() => {
    try {
      localStorage.setItem("resumemaker-style", variant);
      localStorage.setItem(`resumemaker-style:${locale}`, variant);
    } catch {
      /* The editor handles storage errors. */
    }
  }, [variant, locale]);
  useEffect(() => {
    const route = () => {
      const hash = location.hash;
      setBuilder(hash === "#builder" || isEditorPath(location.pathname));
      setMenu(false);
      if (readAuthRoute(location).recovery) setRecovery(true);
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
    if (!supabase) {
      setCheckingRecovery(false);
      return;
    }
    let alive = true;
    const recoveryToken = recovery
      ? new URLSearchParams(location.search).get("token_hash")
      : null;
    if (recoveryToken) history.replaceState(null, "", recoveryPath(locale));
    const initialization = recoveryToken
      ? supabase.auth.verifyOtp({ token_hash: recoveryToken, type: "recovery" })
      : supabase.auth.getSession();
    initialization
      .then(({ data, error }) => {
        if (alive) {
          setSession(data.session);
          if (recoveryToken && !error && data.session) setAuthMode("update");
          if (error) {
            setAuthNotice(
              recovery ? copy.auth.recoveryInvalid : copy.auth.callbackError,
            );
          }
        }
      })
      .catch(() => {
        if (alive)
          setAuthNotice(
            recovery ? copy.auth.recoveryInvalid : copy.auth.generic,
          );
      })
      .finally(() => {
        if (alive) setCheckingRecovery(false);
      });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, next) => {
      if (!alive) return;
      setSession(next);
      if (event === "PASSWORD_RECOVERY") {
        setRecovery(true);
        setCheckingRecovery(false);
        setAuthMode("update");
      }
    });
    const authRoute = readAuthRoute(location);
    if (authRoute.error) {
      if (authRoute.recovery) setRecovery(true);
      setAuthNotice(
        authRoute.recovery
          ? copy.auth.recoveryInvalid
          : copy.auth.callbackError,
      );
    }
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
    setRecovery(false);
    if (/^\/reset-password\/?$/.test(location.pathname))
      history.replaceState(null, "", marketHome(locale));
    location.hash = "builder";
    setBuilder(true);
    window.scrollTo(0, 0);
  };
  const home = (e) => {
    e?.preventDefault();
    setRecovery(false);
    if (/^\/reset-password\/?$/.test(location.pathname))
      history.replaceState(null, "", marketHome(locale));
    location.assign(marketHome(locale));
    setBuilder(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const finishPasswordUpdate = () => {
    setAuthNotice("");
    setPasswordUpdated(true);
    start();
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
      <header
        className={`site-header ${locale === "ja" ? "japanese-site-header" : "korean-site-header"} ${builder && !recovery ? "editor-header" : ""}`}
      >
        <div className="header-inner">
          <Logo onClick={home} />
          {builder && !recovery && (
            <div className="editor-document-name">
              {copy.unified.document}
              <small>{copy.unified.draft}</small>
            </div>
          )}
          <nav className="header-nav" aria-label={copy.common.menu}>
            {nav.map(([key, label]) => (
              <a key={key} href={`${marketHome(locale)}#${key}`} onClick={() => setBuilder(false)}>
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
                onClick={() => requestLogin()}
              >
                {copy.common.login}
              </button>
            )}
            {builder && !recovery ? (
              <>
                <Button
                  secondary
                  className="header-save"
                  onClick={() => builderActions.current?.save()}
                  disabled={exportBusy}
                >
                  {copy.unified.save}
                </Button>
                <Button
                  className="header-export"
                  onClick={() => builderActions.current?.download()}
                  disabled={exportBusy}
                >
                  <Download size={15} />
                  {exportBusy ? copy.builder.preparing : copy.common.pdf}
                </Button>
              </>
            ) : (
              <Button className="header-create" onClick={() => start(resumeMarket(locale).defaultTemplate)}>
                {copy.common.create}
                <ArrowUpRight size={15} />
              </Button>
            )}
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
                href={`${marketHome(locale)}#${key}`}
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
        <MarketNavigation />
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
      {passwordUpdated && (
        <div className="global-notice success" role="status">
          <CheckCircle2 size={20} aria-hidden="true" />
          <span>{copy.auth.updateLoginSuccess}</span>
          <button
            className="icon-btn"
            type="button"
            aria-label={copy.common.close}
            onClick={() => setPasswordUpdated(false)}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {recovery ? (
        <main className="recovery-page">
          <div className="recovery-heading">
            <span className="overline">ACCOUNT RECOVERY</span>
            <h1>{copy.auth.resetTitle}</h1>
            <p>{copy.auth.recoveryHelp}</p>
          </div>
          {checkingRecovery ? (
            <p role="status">{copy.auth.recoveryChecking}</p>
          ) : (
            <AuthDialog
              key={authMode === "update" ? "update" : "reset"}
              initialMode={authMode === "update" ? "update" : "reset"}
              embedded
              onPasswordUpdated={finishPasswordUpdate}
              onClose={() => start()}
              onGuest={() => start()}
            />
          )}
          <a href={marketHome(locale)}>{copy.common.home}</a>
        </main>
      ) : builder && resumeMarket(locale).published ? (
        <Builder
          key={`${locale}:${session?.user.id || "guest"}`}
          session={session}
          actionsRef={builderActions}
          onBusyChange={setExportBusy}
          onLogin={requestLogin}
          onHome={home}
          variant={variant}
          setVariant={setVariant}
        />
      ) : (
        <Landing setPreview={setPreview} />
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
      {authMode && !recovery && (
        <AuthDialog
          key={authMode}
          initialMode={authMode}
          reason={authRequest?.reason}
          beforeAuth={() => builderActions.current?.prepareAuth()}
          onPasswordUpdated={finishPasswordUpdate}
          onClose={closeAuth}
          onGuest={() => {
            const continueAsGuest = authRequest?.onGuest;
            setAuthMode(null);
            setAuthRequest(null);
            if (continueAsGuest) continueAsGuest();
            else if (!builder) start();
          }}
        />
      )}
    </>
  );
}

const appRoot = document.getElementById("root");
if (isLegacyEditorPath(location.pathname)) {
  // Also works on SPA/dev hosts that serve the root HTML for directory URLs.
  location.replace("/#builder");
} else if (appRoot) {
  createRoot(appRoot).render(
    <I18nProvider locale={localeFromLocation(location)}>
      <App />
    </I18nProvider>,
  );
}
