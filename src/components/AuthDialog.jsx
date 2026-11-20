import React, { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  CircleAlert,
  CheckCircle2,
} from "lucide-react";
import { Button, Modal } from "./ui";
import { useI18n } from "../i18n";
import { authConfigured, authError, supabase } from "../lib/auth";

function GoogleIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.59 4.59 0 0 1-1.99 3.01v2.5h3.22c1.88-1.73 2.99-4.28 2.99-7.34Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.22-2.5c-.89.6-2.03.96-3.39.96-2.61 0-4.82-1.76-5.61-4.12H3.07v2.58A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.91A6 6 0 0 1 6.08 12c0-.66.11-1.31.31-1.91V7.51H3.07A10 10 0 0 0 2 12c0 1.61.38 3.14 1.07 4.49l3.32-2.58Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.97c1.47 0 2.79.51 3.83 1.51l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.93 5.51l3.32 2.58C7.18 7.73 9.39 5.97 12 5.97Z"
      />
    </svg>
  );
}
export default function AuthDialog({
  initialMode = "login",
  onClose,
  onGuest,
  embedded = false,
}) {
  const { copy } = useI18n();
  const c = copy.auth;
  const [mode, setMode] = useState(initialMode),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [visible, setVisible] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const changeMode = (next) => {
    setMode(next);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirm("");
  };
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!authConfigured) {
      setError(c.unavailable);
      return;
    }
    if ((mode === "signup" || mode === "update") && password.length < 8) {
      setError(c.weak);
      return;
    }
    if ((mode === "signup" || mode === "update") && password !== confirm) {
      setError(c.mismatch);
      return;
    }
    setBusy(true);
    try {
      let result;
      if (mode === "signup") {
        result = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${location.origin}/#builder` },
        });
        if (result.error) throw result.error;
        if (result.data.user?.identities?.length === 0) {
          setError(c.exists);
          return;
        }
        if (result.data.session) {
          setSuccess(c.loginSuccess);
          setPassword("");
          setConfirm("");
        } else {
          setSuccess(c.signupSuccess);
          setPassword("");
          setConfirm("");
        }
      } else if (mode === "login") {
        result = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (result.error) throw result.error;
        onClose();
      } else if (mode === "reset") {
        result = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${location.origin}/reset-password`,
        });
        if (result.error) throw result.error;
        setSuccess(c.resetSuccess);
      } else {
        result = await supabase.auth.updateUser({ password });
        if (result.error) throw result.error;
        setSuccess(c.updateSuccess);
        setPassword("");
        setConfirm("");
      }
    } catch (err) {
      setError(authError(err, copy));
    } finally {
      setBusy(false);
    }
  };
  const google = async () => {
    if (!authConfigured) return;
    setBusy(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${location.origin}/#builder` },
      });
      if (error) throw error;
    } catch (err) {
      setError(authError(err, copy));
      setBusy(false);
    }
  };
  const title =
    mode === "login"
      ? c.loginTitle
      : mode === "signup"
        ? c.signupTitle
        : mode === "reset"
          ? c.resetTitle
          : c.updateTitle;
  const passwordField = (confirmation = false) => (
    <label className="field">
      {confirmation ? c.confirm : c.password}
      <div className="input-icon">
        <LockKeyhole size={16} />
        <input
          type={visible ? "text" : "password"}
          value={confirmation ? confirm : password}
          onChange={(e) =>
            confirmation
              ? setConfirm(e.target.value)
              : setPassword(e.target.value)
          }
          required
          minLength={mode === "login" ? undefined : 8}
          maxLength={128}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder={mode === "login" ? "••••••••" : c.passwordHint}
        />
        {!confirmation && (
          <button
            type="button"
            className="password-toggle"
            aria-label={visible ? c.hidePassword : c.showPassword}
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
    </label>
  );
  const content = (
    <div className="auth-body">
      <span className="auth-symbol">
        <FileSymbol />
      </span>
      <h2>{title}</h2>
      <p className="auth-subtitle">{c.subtitle}</p>
      {!authConfigured && (
        <div className="auth-notice" role="status">
          <CircleAlert size={18} />
          <span>{c.unavailable}</span>
        </div>
      )}
      {["login", "signup"].includes(mode) && (
        <>
          <button
            type="button"
            className="google-btn"
            onClick={google}
            disabled={busy || !authConfigured}
          >
            <GoogleIcon />
            {c.google}
          </button>
          <div className="auth-divider">
            <span>{c.divider}</span>
          </div>
        </>
      )}
      <form onSubmit={submit}>
        {mode !== "update" && (
          <label className="field">
            {c.email}
            <div className="input-icon">
              <Mail size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder={c.emailPlaceholder}
                required
                maxLength={254}
              />
            </div>
          </label>
        )}
        {mode !== "reset" && passwordField()}
        {(mode === "signup" || mode === "update") && passwordField(true)}
        {mode === "login" && (
          <button
            type="button"
            className="forgot-link"
            onClick={() => changeMode("reset")}
          >
            {c.forgot}
          </button>
        )}
        {error && (
          <p className="form-alert error" role="alert">
            <CircleAlert size={17} />
            {error}
          </p>
        )}
        {success && (
          <p className="form-alert success" role="status">
            <CheckCircle2 size={18} />
            {success}
          </p>
        )}
        <Button
          type="submit"
          disabled={busy || !authConfigured}
          className="full-width"
        >
          {busy
            ? copy.common.working
            : mode === "login"
              ? c.loginSubmit
              : mode === "signup"
                ? c.signupSubmit
                : mode === "reset"
                  ? c.resetSubmit
                  : c.updateSubmit}
          <ArrowRight size={17} />
        </Button>
      </form>
      {mode === "login" || mode === "signup" ? (
        <p className="auth-switch">
          {mode === "login" ? c.noAccount : c.hasAccount}
          <button
            type="button"
            onClick={() => changeMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? c.signupLink : c.loginLink}
          </button>
        </p>
      ) : (
        <button
          type="button"
          className="auth-back"
          onClick={() => changeMode("login")}
        >
          {c.backLogin}
        </button>
      )}
      <div className="auth-guest">
        <button type="button" onClick={onGuest}>
          {c.guestLink}
          <ArrowRight size={15} />
        </button>
        <p>{c.storage}</p>
      </div>
    </div>
  );
  return embedded ? (
    <section className="auth-dialog recovery-card">{content}</section>
  ) : (
    <Modal title={copy.common.brand} className="auth-dialog" onClose={onClose}>
      {content}
    </Modal>
  );
}
function FileSymbol() {
  return (
    <svg
      width="27"
      height="27"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
    </svg>
  );
}
