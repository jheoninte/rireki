import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  FileText,
  ImagePlus,
  Lightbulb,
  LockKeyhole,
  Monitor,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
  Eye,
  CircleAlert,
} from "lucide-react";
import { useI18n } from "../i18n";
import { Button, Modal } from "./ui";
import Resume, { emptyResume } from "./Resume";
import { exportResume } from "../lib/export";

function loadResume(key) {
  const fallback = emptyResume();
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (!saved || typeof saved !== "object") return fallback;
    for (const field of Object.keys(fallback)) {
      if (Array.isArray(fallback[field])) {
        if (Array.isArray(saved[field]))
          fallback[field] = saved[field]
            .filter((x) => x && typeof x === "object")
            .map((x) =>
              Object.fromEntries(
                Object.keys(fallback[field][0]).map((k) => [
                  k,
                  typeof x[k] === "string" ? x[k] : "",
                ]),
              ),
            );
      } else if (typeof saved[field] === "string")
        fallback[field] = saved[field];
    }
    if (
      fallback.photo &&
      !/^data:image\/(jpeg|png);base64,/.test(fallback.photo)
    )
      fallback.photo = "";
    return fallback;
  } catch {
    return fallback;
  }
}
export default function Builder({ onHome, variant, setVariant }) {
  const { copy, locale } = useI18n(),
    c = copy.builder,
    f = copy.fields,
    p = copy.placeholders;
  const storageKey = `rireki:resume:${locale}:v1`;
  const [data, setData] = useState(() => loadResume(storageKey)),
    [step, setStep] = useState(0),
    [saved, setSaved] = useState(false),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(null);
  const fileRef = useRef(),
    noticeTimer = useRef(),
    previewRef = useRef(),
    editorRef = useRef();
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      setSaved(true);
    } catch {
      setSaved(false);
      setNotice(copy.messages.savedError);
    }
  }, [data, storageKey, copy]);
  useEffect(() => () => clearTimeout(noticeTimer.current), []);
  const update = (key, value) => setData((d) => ({ ...d, [key]: value }));
  const toast = (message) => {
    setNotice(message);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 5500);
  };
  const goStep = (i) => {
    setStep(i);
    requestAnimationFrame(() =>
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };
  const requestSample = () => {
    const apply = () => {
      setData(structuredClone(copy.sample));
      toast(copy.messages.sample);
    };
    const hasContent = Object.values(data).some((v) =>
      typeof v === "string"
        ? v.trim()
        : v.some((x) => Object.values(x).some(Boolean)),
    );
    if (hasContent)
      setConfirm({
        title: c.sampleConfirm,
        text: c.sampleWarning,
        label: c.sampleApply,
        action: apply,
      });
    else apply();
  };
  const download = async (format) => {
    if (!data.name.trim()) {
      toast(c.missingName);
      goStep(0);
      return;
    }
    setBusy(true);
    try {
      await exportResume(format, data, copy);
      toast(
        copy.messages.downloaded.replace(
          "{format}",
          format === "pdf" ? "PDF" : "Word",
        ),
      );
    } catch (err) {
      console.error(err);
      toast(copy.messages.exportError);
    } finally {
      setBusy(false);
    }
  };
  const upload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast(copy.messages.photoType);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast(copy.messages.photoSize);
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => toast(copy.messages.photoError);
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => toast(copy.messages.photoError);
      image.onload = () => {
        const ratio = Math.min(1, 600 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * ratio));
        canvas.height = Math.max(1, Math.round(image.height * ratio));
        canvas
          .getContext("2d")
          .drawImage(image, 0, 0, canvas.width, canvas.height);
        update("photo", canvas.toDataURL("image/jpeg", 0.88));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  };
  const field = (key, type = "text") => (
    <label className="field" key={key}>
      <span>
        {f[key]}
        {key === "name" && <em>{copy.common.required}</em>}
      </span>
      <input
        type={type}
        value={data[key]}
        placeholder={p[key]}
        onChange={(e) => update(key, e.target.value)}
        maxLength={key === "title" ? 120 : 250}
        autoComplete={
          key === "name"
            ? "name"
            : key === "email"
              ? "email"
              : key === "phone"
                ? "tel"
                : undefined
        }
      />
    </label>
  );
  const entries = (key, keys) =>
    data[key].map((entry, i) => (
      <div className="entry-card" key={i}>
        <div className="entry-top">
          <strong>
            {f[key]} <span>{String(i + 1).padStart(2, "0")}</span>
          </strong>
          <button
            type="button"
            className="icon-btn"
            aria-label={`${f[key]} ${i + 1} ${copy.common.delete}`}
            onClick={() =>
              update(
                key,
                data[key].filter((_, index) => index !== i),
              )
            }
          >
            <Trash2 size={16} />
          </button>
        </div>
        {keys.map((k) => (
          <label className="field" key={k}>
            {f[k]}
            {React.createElement(k === "role" ? "textarea" : "input", {
              value: entry[k],
              placeholder: p[k],
              rows: k === "role" ? 4 : undefined,
              maxLength: k === "role" ? 2000 : 250,
              onChange: (e) =>
                update(
                  key,
                  data[key].map((x, index) =>
                    index === i ? { ...x, [k]: e.target.value } : x,
                  ),
                ),
            })}
          </label>
        ))}
      </div>
    ));
  return (
    <main className="builder-page">
      <div className="builder-shell">
        <div className="builder-breadcrumb">
          <button type="button" onClick={onHome}>
            <ArrowLeft size={15} />
            {copy.common.home}
          </button>
          <span className={saved ? "saved-status" : "saved-status warning"}>
            {saved ? <CheckCircle2 size={14} /> : <CircleAlert size={14} />}{" "}
            {saved ? c.saved : c.saveError}
          </span>
        </div>
        <div className="builder-intro">
          <div>
            <span className="overline">{c.eyebrow}</span>
            <h1>{c.title}</h1>
            <p className="desktop-copy">{c.description}</p>
            <p className="mobile-copy">{c.mobileDescription}</p>
          </div>
          <button type="button" className="subtle-btn" onClick={requestSample}>
            <Sparkles size={15} />
            {c.sample}
          </button>
        </div>
        <button
          type="button"
          className="mobile-preview-button subtle-btn"
          onClick={() =>
            previewRef.current.scrollIntoView({ behavior: "smooth" })
          }
        >
          <Eye size={15} />
          {c.previewMobile}
          <ArrowRight size={14} />
        </button>
        <div className="builder-grid">
          <section className="editor-panel" ref={editorRef}>
            <nav className="editor-steps" aria-label={c.stepLabel}>
              {c.steps.map((s, i) => (
                <button
                  type="button"
                  key={s}
                  aria-current={step === i ? "step" : undefined}
                  className={step === i ? "active" : ""}
                  onClick={() => goStep(i)}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </button>
              ))}
            </nav>
            <div className="editor-form">
              <div className="editor-form-title">
                <div>
                  <span className="overline">
                    STEP {String(step + 1).padStart(2, "0")}
                  </span>
                  <h2>{c.steps[step]}</h2>
                </div>
                <span className="step-count">
                  {step + 1}
                  <i>/ 4</i>
                </span>
              </div>
              <p className="form-description">{c.stepDescriptions[step]}</p>
              {step === 0 && (
                <>
                  <div className="photo-upload">
                    <div className="photo-upload-preview">
                      {data.photo ? (
                        <img src={data.photo} alt={copy.resume.photo} />
                      ) : (
                        <ImagePlus size={25} />
                      )}
                    </div>
                    <div>
                      <button
                        type="button"
                        className="subtle-btn"
                        onClick={() => fileRef.current.click()}
                      >
                        {c.photoAdd}
                      </button>
                      <p>{c.photoHint}</p>
                      {data.photo && (
                        <button
                          type="button"
                          className="text-link small"
                          onClick={() => update("photo", "")}
                        >
                          {c.photoRemove}
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      hidden
                      onChange={upload}
                    />
                  </div>
                  <div className="field-grid">
                    {field("name")}
                    {field("english")}
                    {field("birth")}
                    {field("phone", "tel")}
                  </div>
                  {field("email", "email")}
                  {field("address")}
                  {field("title")}
                </>
              )}
              {step === 1 && (
                <>
                  <h3 className="form-subheading">{f.education}</h3>
                  {entries("education", ["period", "school", "major"])}
                  <button
                    type="button"
                    className="add-entry"
                    onClick={() =>
                      update("education", [
                        ...data.education,
                        { period: "", school: "", major: "" },
                      ])
                    }
                  >
                    <Plus size={15} />
                    {c.addEducation}
                  </button>
                  <h3 className="form-subheading">{f.careers}</h3>
                  {entries("careers", ["period", "company", "role"])}
                  <button
                    type="button"
                    className="add-entry"
                    onClick={() =>
                      update("careers", [
                        ...data.careers,
                        { period: "", company: "", role: "" },
                      ])
                    }
                  >
                    <Plus size={15} />
                    {c.addCareer}
                  </button>
                  <label className="field">
                    {f.skills}
                    <textarea
                      rows={4}
                      maxLength={2000}
                      value={data.skills}
                      placeholder={p.skills}
                      onChange={(e) => update("skills", e.target.value)}
                    />
                  </label>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="writing-tip">
                    <Lightbulb size={20} />
                    <p>
                      <strong>{c.writingTip}</strong>
                      <br />
                      {c.writingText}
                    </p>
                  </div>
                  {["intro", "motivation"].map((key) => (
                    <label className="field" key={key}>
                      <span className="field-label-row">
                        {f[key]}
                        <button
                          type="button"
                          className="text-link small"
                          onClick={() => {
                            const apply = () => update(key, copy.sample[key]);
                            if (data[key])
                              setConfirm({
                                title: c.useExample,
                                text: c.exampleOverwrite,
                                label: c.useExample,
                                action: apply,
                              });
                            else apply();
                          }}
                        >
                          <Sparkles size={12} />
                          {c.useExample}
                        </button>
                      </span>
                      <textarea
                        rows={7}
                        maxLength={2000}
                        value={data[key]}
                        placeholder={p[key]}
                        onChange={(e) => update(key, e.target.value)}
                      />
                      <span className="char-count">
                        {data[key].length.toLocaleString(locale)} / 2,000
                      </span>
                    </label>
                  ))}
                </>
              )}
              {step === 3 && (
                <>
                  <div className="finish-mark">
                    <Check size={30} />
                  </div>
                  <h3 className="finish-title">{c.finishTitle}</h3>
                  <p className="finish-description">{c.finishText}</p>
                  {!data.name.trim() && (
                    <p className="form-alert error">
                      <CircleAlert size={17} />
                      {c.missingName}
                    </p>
                  )}
                  <label className="field">
                    {c.style}
                    <select
                      value={variant}
                      onChange={(e) => setVariant(e.target.value)}
                    >
                      <option value="classic">{copy.templates.classic}</option>
                      <option value="modern">{copy.templates.modern}</option>
                    </select>
                  </label>
                  <div className="download-buttons">
                    <Button disabled={busy} onClick={() => download("pdf")}>
                      <Download size={18} />
                      {busy ? c.preparing : copy.common.pdf}
                    </Button>
                    <Button
                      secondary
                      disabled={busy}
                      onClick={() => download("docx")}
                    >
                      <FileText size={18} />
                      {copy.common.word}
                      <span className="file-ext">.docx</span>
                    </Button>
                  </div>
                  <p className="download-hint">{c.downloadHint}</p>
                  <p className="privacy-line">
                    <ShieldCheck size={13} />
                    {c.privacy}
                  </p>
                </>
              )}
            </div>
            <div className="editor-footer">
              <button
                type="button"
                className="text-link"
                disabled={step === 0}
                onClick={() => goStep(step - 1)}
              >
                <ArrowLeft size={15} />
                {copy.common.back}
              </button>
              {step < 3 ? (
                <Button onClick={() => goStep(step + 1)}>
                  {copy.common.next}
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <button
                  type="button"
                  className="text-link"
                  onClick={() => goStep(0)}
                >
                  {copy.common.edit}
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </section>
          <aside className="live-preview" ref={previewRef}>
            <div className="preview-toolbar">
              <span>
                <Monitor size={16} />
                {c.preview}
              </span>
              <span>A4 · {copy.templates[variant]}</span>
            </div>
            <div className="preview-scroll">
              <Resume data={data} variant={variant} />
            </div>
            <p className="privacy-line">
              <LockKeyhole size={12} />
              {c.localNote}
            </p>
          </aside>
        </div>
        <div className="builder-bottom">
          <span>
            <Save size={13} />
            {c.persistence}
          </span>
          <button
            type="button"
            className="text-link"
            onClick={() =>
              setConfirm({
                title: c.resetTitle,
                text: c.resetText,
                label: c.resetApply,
                action: () => {
                  setData(emptyResume());
                  setStep(0);
                  toast(copy.messages.reset);
                },
              })
            }
          >
            <RotateCcw size={13} />
            {c.reset}
          </button>
        </div>
      </div>
      <div className="export-container" aria-hidden="true">
        <Resume id="export-resume" data={data} variant={variant} />
      </div>
      {notice && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button
            type="button"
            aria-label={copy.common.close}
            onClick={() => setNotice("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {confirm && (
        <Modal
          title={confirm.title}
          className="confirm-dialog"
          onClose={() => setConfirm(null)}
        >
          <p>{confirm.text}</p>
          <div className="confirm-actions">
            <Button secondary onClick={() => setConfirm(null)}>
              {copy.common.cancel}
            </Button>
            <Button
              onClick={() => {
                confirm.action();
                setConfirm(null);
              }}
            >
              {confirm.label}
            </Button>
          </div>
        </Modal>
      )}
    </main>
  );
}
