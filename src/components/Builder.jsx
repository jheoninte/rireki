import React, { useEffect, useRef, useState, useImperativeHandle } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  PencilLine,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  ImagePlus,
  LockKeyhole,
  Plus,
  RotateCcw,
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
import { readAuthDraft, saveBuilderDraft, stageAuthDraft } from "../lib/auth-draft";
import { sanitizeResume } from "../lib/resume-data";
import { initializeJapanesePersonal, updateJapanesePersonal } from '../lib/japanese-personal';
import { koreanExampleKey, koreanSample } from '../lib/korean-examples';
import { KoreanExamplePicker, KoreanFinishTools } from './KoreanEditorTools';
import { EnglishBulletEditor, EnglishWritingTools, EnglishFinishTools } from './EnglishEditorTools';
import {
  loadUnifiedDraft,
  readLegacyDraft,
  LEGACY_IMPORTED,
} from "../lib/legacy-draft";
import useCloudResume from "../lib/useCloudResume";
import TemplateSelector from "./TemplateSelector";
import HintButton from "./HintButton";
import AutoSaveIndicator from "./AutoSaveIndicator";
import TrustBadge from "./TrustBadge";
import { validateRirekisho } from "../lib/rirekisho-format";
import { marketTemplate, resumeMarket } from "../lib/resume-markets";
import PhotoUploader from "./PhotoUploader";
import { applicantFieldLabels, isRirekishoTemplate, japaneseTemplate } from '../lib/japanese-templates';
import {
  templates,
  premiumTemplates,
  readAccount,
} from "../lib/services";
import {
  CloudPanel,
  WritingGuide,
  Coaching,
  Pricing,
  NextActions,
  useAccount,
  completion,
} from "./WorkspaceTools";
import { track } from "../lib/analytics";

function measureProgress(data, variant) {
  const filledItems = Object.entries(data).reduce((count, [key, value]) => {
    if (["photo", "accent", "documentDate", "paperSize", "targetDescription"].includes(key)) return count;
    if (Array.isArray(value)) {
      return count + value.filter((row) =>
        Object.values(row).some((text) => typeof text === "string" && text.trim()),
      ).length;
    }
    return count + (typeof value === "string" && value.trim() ? 1 : 0);
  }, 0);
  return { filledItems, percent: completion(data, variant) };
}

export default function Builder({
  onHome,
  variant: requestedVariant,
  setVariant,
  session,
  onLogin,
  actionsRef,
  onBusyChange,
}) {
  const { copy, locale } = useI18n(),
    c = copy.builder,
    f = { ...copy.fields, ...copy.builderFeatures.fields, ...(locale === 'ja' ? applicantFieldLabels : {}) },
    p = copy.placeholders;
  const market = resumeMarket(locale);
  const variant = marketTemplate(locale, requestedVariant);
  const isCareerDescription = locale === 'ko' && variant === 'career-description';
  const normalizeDraft = draft => locale === 'ja' ? initializeJapanesePersonal(draft) : draft;
  useEffect(() => { if (requestedVariant !== variant) setVariant(variant); }, [requestedVariant, variant, setVariant]);
  const guestKey = `rireki:resume:${locale}:v1`;
  const storageKey = session
    ? `rireki:resume:${session.user.id}:${locale}:v1`
    : guestKey;
  const [data, setData] = useState(() =>
      normalizeDraft((session && readAuthDraft(locale)) || loadUnifiedDraft(storageKey, !session && locale === 'ja')),
    ),
    [progress, setProgress] = useState(() => measureProgress(data, variant)),
    [nudgeDismissed, setNudgeDismissed] = useState(false),
    [pdfFallback, setPdfFallback] = useState(false),
    [saved, setSaved] = useState(false),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(null),
    [focusedField, setFocusedField] = useState("name"),
    [job, setJob] = useState(locale === 'ko' ? koreanExampleKey(new URLSearchParams(location.search).get('example')) : locale === 'en' ? 'general' : 'sales'),
    [activeSection, setActiveSection] = useState("personal"),
    [previewOpen, setPreviewOpen] = useState(false),
    [isMobile, setIsMobile] = useState(
      () => window.matchMedia?.("(max-width: 800px)").matches || false,
    ),
    [fit, setFit] = useState({ scale: 0.65, height: 730 }),
    [legacyVisible, setLegacyVisible] = useState(() => {
      try {
        return Boolean(
          locale === 'ja' && readLegacyDraft() && !localStorage.getItem(LEGACY_IMPORTED),
        );
      } catch {
        return false;
      }
    });
  const cloud = useCloudResume({
    userId: session?.user.id,
    locale,
    data,
    setData,
    variant,
    setVariant,
  });
  const accountState = useAccount(session);
  const confirmAction = (title, text, action) =>
    setConfirm({ title, text, action, label: title });
  const w = copy.workspace,
    u = isCareerDescription ? { ...copy.unified,
      sections: ['기본정보', '경력·프로젝트', '학력', '역량·자격', '경력 요약', '검토·다운로드'],
      descriptions: ['이름·지원 직무와 연락처를 입력하세요. 사진·생년월일·거주 지역은 경력기술서에 포함하지 않습니다.', '회사별 담당 업무와 주요 성과, 프로젝트에서 본인이 기여한 내용을 구체적으로 작성하세요.', '', '경력과 관련된 핵심 역량·기술·도구와 자격을 정리하세요.', '전문 분야, 주요 경험과 강점을 3~5줄로 요약하세요.', '경력 기간·본인 기여·성과의 근거와 제출 형식을 확인하세요.'],
    } : copy.unified;
  const sectionIds = [
    "personal",
    "experience",
    "education",
    "skills",
    "writing",
    "finish",
  ];
  const backupKey = `rireki:backup:${session?.user.id || "guest"}:${locale}`;
  const noticeTimer = useRef(),
    previewRef = useRef(),
    editorRef = useRef(),
    canvasRef = useRef(),
    paperRef = useRef(),
    toggleRef = useRef();
  useEffect(() => {
    try {
      saveBuilderDraft(data, storageKey, locale, session?.user.id, variant);
      setSaved(true);
    } catch {
      setSaved(false);
      setNotice(copy.messages.savedError);
    }
  }, [data, variant, storageKey, copy]);
  useEffect(() => setProgress(measureProgress(data, variant)), [data, variant]);
  useEffect(() => () => clearTimeout(noticeTimer.current), []);
  const update = (key, value) => setData((d) => locale === 'ja' ? updateJapanesePersonal(d, key, value) : ({ ...d, [key]: value }));
  const isRirekisho = isRirekishoTemplate(variant), isWorkHistory = variant === "work-history";
  const applicantTemplate = japaneseTemplate(variant);
  const applyExample = (current, example, apply) => {
    if (current?.trim()) confirmAction(copy.builderFeatures.apply, copy.builderFeatures.replace, () => apply(example));
    else apply(example);
  };
  const hint = (key, current = data[key], apply = value => update(key, value)) => <HintButton field={key} label={f[key]} onApply={example => applyExample(current, example, apply)} />;
  const toast = (message) => {
    setNotice(message);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 5500);
  };
  const goSection = (id) => {
    setActiveSection(id);
    document
      .getElementById(`resume-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  useEffect(() => {
    const mobile = window.matchMedia?.("(max-width: 800px)");
    if (!mobile) return;
    const sync = () => {
      setIsMobile(mobile.matches);
      if (!mobile.matches) setPreviewOpen(false);
    };
    mobile.addEventListener("change", sync);
    return () => mobile.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!isMobile || !previewOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    previewRef.current?.focus();
    const escape = (e) => {
      if (e.key === "Escape") {
        setPreviewOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", escape);
    };
  }, [previewOpen, isMobile]);
  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const canvas = canvasRef.current,
        paper = paperRef.current?.querySelector(".resume-paper");
      if (!canvas?.clientWidth || !paper) return;
      const scale = Math.min(1, (canvas.clientWidth - 48) / 794);
      setFit({ scale, height: paper.scrollHeight * scale });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(canvasRef.current);
    observer.observe(paperRef.current.querySelector(".resume-paper"));
    measure();
    return () => observer.disconnect();
  }, [variant]);
  useEffect(() => {
    let frame;
    const updateSection = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const id =
          sectionIds
            .filter(
              (id) =>
                !document.getElementById(`resume-${id}`)?.hidden &&
                document.getElementById(`resume-${id}`)?.getBoundingClientRect()
                  .top <= 190,
            )
            .at(-1) || "personal";
        setActiveSection(id);
      });
    };
    window.addEventListener("scroll", updateSection, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateSection);
      cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  useEffect(() => {
    if (new URLSearchParams(location.search).has("payment"))
      goSection("finish");
  }, []);
  const importLegacy = () =>
    confirmAction(u.legacyImport, u.importConfirm, () => {
      try {
        const legacy = readLegacyDraft();
        if (!legacy) {
          toast(w.noDraft);
          return;
        }
        localStorage.setItem(backupKey, JSON.stringify({ data, variant }));
        localStorage.setItem(storageKey, JSON.stringify(legacy));
        localStorage.setItem(LEGACY_IMPORTED, "1");
        setData(normalizeDraft(legacy));
        setVariant("modern");
        setLegacyVisible(false);
        toast(u.imported);
      } catch {
        toast(copy.messages.savedError);
      }
    });
  const restoreLocalBackup = () =>
    confirmAction(u.restore, w.importNote, () => {
      try {
        const raw = localStorage.getItem(backupKey);
        if (!raw) {
          toast(u.noBackup);
          return;
        }
        const backup = JSON.parse(raw);
        localStorage.setItem(backupKey, JSON.stringify({ data, variant }));
        setData(normalizeDraft(sanitizeResume(backup.data)));
        if (templates.includes(backup.variant)) setVariant(backup.variant);
        toast(u.restored);
      } catch {
        toast(copy.messages.savedError);
      }
    });
  const restoreDraft = (backup = false) => {
    const key = backup
      ? `rireki:backup:${session.user.id}:${locale}`
      : guestKey;
    let raw;
    try {
      raw = localStorage.getItem(key);
    } catch {
      toast(copy.messages.savedError);
      return;
    }
    if (!raw) {
      toast(w.noDraft);
      return;
    }
    confirmAction(
      backup ? w.restoreBackup : w.importGuest,
      w.importNote,
      () => {
        try {
          const document = backup
            ? JSON.parse(raw)
            : { data: JSON.parse(raw), variant };
          localStorage.setItem(
            `rireki:backup:${session.user.id}:${locale}`,
            JSON.stringify({ data, variant }),
          );
          // Validate recovered data with the same normalizer as local drafts.
          setData(normalizeDraft(sanitizeResume(document.data)));
          if (templates.includes(document.variant))
            setVariant(document.variant);
        } catch {
          toast(copy.messages.savedError);
        }
      },
    );
  };
  const requestSample = () => {
    const apply = () => {
      const sample = locale === 'ko' ? koreanSample(copy.sample, job, data.accent) : { ...copy.sample, ...copy.templateSamples?.[variant] };
      setData(normalizeDraft(sanitizeResume(sample)));
      toast(copy.messages.sample);
    };
    const hasContent = Object.entries(data).filter(([key]) => !['accent', 'documentDate', 'paperSize', 'targetDescription'].includes(key)).some(([, v]) =>
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
  const prepareAuth = () => {
    // Already-signed-in users retain their account draft; guest data is kept
    // separately until the next authenticated Builder mount imports it.
    if (!session) {
      try {
        stageAuthDraft(data, locale, variant);
      } catch {
        throw Object.assign(new Error("Draft could not be saved"), { code: "draft_storage" });
      }
    }
  };
  const download = async (format, { allowGuest = false } = {}) => {
    if (busy) return;
    if (!data.name.trim()) {
      toast(c.missingName);
      goSection("personal");
      return;
    }
    if (format === "pdf" && !session && !allowGuest) {
      setNudgeDismissed(true);
      setPdfFallback(false);
      onLogin({
        reason: "pdf",
        onDismiss: () => setPdfFallback(true),
        onGuest: () => download("pdf", { allowGuest: true }),
      });
      return;
    }
    setPdfFallback(false);
    setBusy(true);
    try {
      if (isRirekisho) {
        try { validateRirekisho(data, variant); } catch (error) { toast(error.message); return; }
      }
      let pro = false;
      if (session && accountState.account?.pro)
        pro = Boolean((await readAccount()).pro);
      if (premiumTemplates.includes(variant) && !pro) {
        toast(w.premiumRequired);
        return;
      }
      await exportResume(format, data, copy, {
        authenticated: Boolean(session), watermark: !session, variant, locale,
      });
      track("resume_download", { format, template: variant, locale });
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
  const manualSave = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      setSaved(true);
      if (cloud.available && ["empty", "saved"].includes(cloud.status))
        cloud.save();
      else if (cloud.available && cloud.status === "choice")
        confirmAction(w.upload, w.overwrite, cloud.save);
      else toast(c.saved);
    } catch {
      setSaved(false);
      toast(copy.messages.savedError);
    }
  };
  useImperativeHandle(actionsRef, () => ({
    download: () => {
      if (!busy) download("pdf");
    },
    save: manualSave,
    prepareAuth,
  }));
  const field = (key, type = "text") => (
    <div className="field" key={key}>
      <label htmlFor={`field-${key}`}>
        {f[key]}
        {key === "name" && <em>{copy.common.required}</em>}
      </label>
      <input
        id={`field-${key}`}
        type={type}
        value={data[key]}
        placeholder={p[key]}
        onFocus={() => setFocusedField(key)}
        onChange={(e) => update(key, e.target.value)}
        inputMode={['postalCode', 'contactPostalCode', 'age'].includes(key) ? 'numeric' : undefined}
        maxLength={['postalCode', 'contactPostalCode'].includes(key) ? 8 : key === 'age' ? 3 : key === "title" ? 120 : 250}
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
      {hint(key)}
      {locale === 'ja' && key === 'age' && <small className="ja-personal-note">生年月日・記入日から自動計算します。直接修正もできます。生年月日・記入日を変更すると再計算します。</small>}
      {locale === 'ja' && key === 'documentDate' && <small className="ja-personal-note">初回は今日の日付です。提出日などに変更できます。</small>}
    </div>
  );
  const entries = (key, keys) =>
    data[key].map((entry, i) => (
      <div className="entry-card unified-entry" key={i}>
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
        <div className="unified-field-grid">
          {keys.map((k) => (
            <div
              className={`field ${['role', 'period', 'projectResult'].includes(k) ? "wide" : ""}`}
              key={k}
            >
              <label htmlFor={`${key}-${i}-${k}`}>{f[k]}</label>
              {locale === 'en' && ['role', 'projectResult'].includes(k) ? <EnglishBulletEditor id={`${key}-${i}-${k}`} label={`${f[key]} ${i + 1} ${f[k]}`} value={entry[k]} onFocus={() => setFocusedField(k)} onChange={value => update(key, data[key].map((row, index) => index === i ? { ...row, [k]: value } : row))} /> : React.createElement(["role", "projectResult"].includes(k) ? "textarea" : "input", {
                id: `${key}-${i}-${k}`,
                onFocus: () => setFocusedField(k),
                value: entry[k],
                placeholder: isRirekisho && k === "period" ? "例：2020年4月（入学・卒業・入社・退社は別の行に）" : p[k],
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
              {hint(k, entry[k], value => update(key, data[key].map((row, index) => index === i ? { ...row, [k]: value } : row)))}
            </div>
          ))}
        </div>
      </div>
    ));
  const heading = (id, index) => (
    <div className="unified-card-heading">
      <span>{String(index + 1 - (isCareerDescription && index > 2 ? 1 : 0)).padStart(2, "0")}</span>
      <div>
        <h2 id={`heading-${id}`}>{u.sections[index]}</h2>
        <p>{u.descriptions[index]}</p>
      </div>
      {["experience", "education"].includes(id) && (
        <small>
          {id === "experience" ? data.careers.length : data.education.length}
        </small>
      )}
    </div>
  );
  const textArea = (key) => (
    <div className="field wide" key={key}>
      <label htmlFor={`field-${key}`}>{f[key]}</label>
      <textarea
        id={`field-${key}`}
        rows={key === "intro" ? 5 : 4}
        value={data[key]}
        maxLength={Math.max(2000, data[key].length)}
        placeholder={p[key]}
        onFocus={() => setFocusedField(key)}
        onChange={(e) => update(key, e.target.value)}
      />
      <span className="char-count">
        {data[key].length.toLocaleString(locale)} /{" "}
        {Math.max(2000, data[key].length).toLocaleString(locale)}
      </span>
      {hint(key)}
    </div>
  );
  return (
    <main
      className={`builder-page unified-builder ${previewOpen ? "preview-open" : ""}`}
    >
      <a
        className="unified-skip"
        href="#resume-personal"
        onClick={(e) => {
          e.preventDefault();
          goSection("personal");
        }}
      >
        {u.skip}
      </a>
      <AutoSaveIndicator cloud={cloud} />
      <div className="unified-workspace">
        <section
          className="unified-editor"
          ref={editorRef}
          inert={isMobile && previewOpen ? true : undefined}
          aria-label={c.title}
        >
          <div className="unified-intro">
            <button className="text-link small" type="button" onClick={onHome}>
              <ArrowLeft size={14} />
              {copy.common.home}
            </button>
            <span className="overline">YOUR NEXT CHAPTER</span>
            <h1>{locale !== 'ja' ? <>{u.title.split(',')[0]},<br />{u.title.split(',')[1]}</> : <>{u.title.split('、')[0]}、<br />{u.title.split('、')[1]}</>}</h1>
            <p>{u.description}</p>
            <div className="unified-progress-label">
              <span>{u.progress}</span>
              <strong>{progress.percent}%</strong>
            </div>
            <progress
              value={progress.percent}
              max="100"
              aria-label={u.progress}
            />
            <div className="unified-draft-meta">
              <span className={saved ? "saved-status" : "saved-status warning"}>
                {saved ? <CheckCircle2 size={14} /> : <CircleAlert size={14} />}
                {saved ? c.saved : c.saveError}
              </span>
              <button
                type="button"
                className="text-link small"
                onClick={requestSample}
              >
                <Sparkles size={13} />
                {c.sample}
              </button>
            </div>
          </div>
          {legacyVisible && (
            <section className="unified-migration" aria-label={u.legacyTitle}>
              <strong>{u.legacyTitle}</strong>
              <p>{u.legacyDescription}</p>
              <div className="workspace-actions">
                <Button secondary onClick={importLegacy}>
                  {u.legacyImport}
                </Button>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => {
                    setLegacyVisible(false);
                    try {
                      localStorage.setItem(LEGACY_IMPORTED, "1");
                    } catch {}
                  }}
                >
                  {u.legacyKeep}
                </button>
              </div>
            </section>
          )}
          <TemplateSelector value={variant} onChange={setVariant} />
          <nav className="unified-section-nav" aria-label={c.stepLabel}>
            {sectionIds.map((id, i) => (
              (isWorkHistory || isCareerDescription) && id === "education" ? null : <button
                type="button"
                key={id}
                className={activeSection === id ? "active" : ""}
                aria-current={activeSection === id ? "location" : undefined}
                onClick={() => goSection(id)}
              >
                {u.sections[i]}
              </button>
            ))}
          </nav>
          <section
            className="unified-card"
            id="resume-personal"
            aria-labelledby="heading-personal"
          >
            {heading("personal", 0)}
            {!isCareerDescription && (isRirekisho || locale === 'ko') && <PhotoUploader value={data.photo} onChange={value => update("photo", value)} onError={toast} />}
            <div className="unified-field-grid">
              {field("name")}
              {!isRirekisho && field("title")}
              {field("email", "email")}
              {field("phone", "tel")}
              {locale === 'ja' && field('postalCode')}
              {!isCareerDescription && <div className="wide">{field("address")}</div>}
              {!isRirekisho && <div className="wide">{field("portfolio", "url")}</div>}
              {!isRirekisho && locale === 'ja' && textArea("intro")}
            </div>
            {locale === 'en' && textArea('summary')}
            {locale === 'en' ? null : isCareerDescription ? field('documentDate') : <details className="unified-details" open={isRirekisho || undefined}>
              <summary>{u.extraPersonal}</summary>
              <div className="unified-field-grid">
                {field("english")}
                {field("birth")}
                {locale === 'ja' && field("addressFurigana")}
                {field("documentDate")}
                {isRirekisho && <>{field("age")}{field("gender")}{field('contactPostalCode')}{field("contactAddress")}{field("contactFurigana")}{field("contactPhone", "tel")}{field("contactEmail", "email")}</>}
              </div>
            </details>}
            {isCareerDescription && <p className="ko-career-form-note">이력서의 사진·학력·자기소개 등은 보관되며, 다른 서식으로 돌아가면 다시 편집할 수 있습니다. 경력기술서에는 현재 보이는 항목만 출력합니다.</p>}
          </section>
          <section
            className="unified-card"
            id="resume-experience"
            aria-labelledby="heading-experience"
          >
            {heading("experience", 1)}
            {entries("careers", isRirekisho ? ["company", "position", "period"] : ["company", "position", "period", "role"])}
            {(isWorkHistory || locale !== 'ja') && <div className="project-editor"><h3>{f.projects}</h3>{entries("projects", ["projectName", "projectPeriod", "projectRole", "projectStack", "projectResult"])}<button type="button" className="add-entry" onClick={() => update("projects", [...data.projects, { projectName: "", projectPeriod: "", projectRole: "", projectStack: "", projectResult: "" }])}><Plus size={16} />{copy.builderFeatures.addProject}</button></div>}
            <button
              type="button"
              className="add-entry"
              onClick={() =>
                update("careers", [
                  ...data.careers,
                  { company: "", position: "", period: "", role: "" },
                ])
              }
            >
              <Plus size={16} />
              {c.addCareer}
            </button>
          </section>
          <section
            hidden={isWorkHistory || isCareerDescription}
            className="unified-card"
            id="resume-education"
            aria-labelledby="heading-education"
          >
            {heading("education", 2)}
            {entries("education", ["school", "major", "period"])}
            <button
              type="button"
              className="add-entry"
              onClick={() =>
                update("education", [
                  ...data.education,
                  { school: "", major: "", period: "" },
                ])
              }
            >
              <Plus size={16} />
              {c.addEducation}
            </button>
          </section>
          <section
            className="unified-card"
            id="resume-skills"
            aria-labelledby="heading-skills"
          >
            {heading("skills", 3)}
            {!isRirekisho && textArea("skills")}
            {textArea("qualifications")}
          </section>
          <section
            className="unified-card"
            id="resume-writing"
            aria-labelledby="heading-writing"
          >
            {heading("writing", 4)}
            {!isRirekisho && locale !== 'en' && textArea("summary")}
            {!isCareerDescription && (isRirekisho || locale === 'ko') && textArea("intro")}
            {!isCareerDescription && locale !== 'en' && textArea("motivation")}
            {isRirekisho && (applicantTemplate.writingFields.length > 0 || applicantTemplate.preferenceFields.length > 0) && <div className="applicant-writing-panel"><h3>{applicantTemplate.name}の記入欄</h3><p>{copy.japan.caseFormNote}</p>{applicantTemplate.writingFields.map(key => textArea(key))}{applicantTemplate.preferenceFields.map(key => field(key))}</div>}
            {!isCareerDescription && locale !== 'en' && textArea("preferences")}
            {isRirekisho && <p className="applicant-capacity-note">{copy.japan.capacityNote}</p>}
            {locale === 'en' && <EnglishWritingTools data={data} update={update} />}
            {locale === 'ko' && <KoreanExamplePicker job={job} setJob={setJob} onApply={requestSample} />}
            <WritingGuide field={focusedField} job={job} setJob={setJob} />
            {locale === 'ja' && <Coaching
              session={session}
              data={data}
              update={update}
              accountState={accountState}
              onLogin={onLogin}
              job={job}
            />}
          </section>
          <section
            className="unified-card"
            id="resume-finish"
            aria-labelledby="heading-finish"
          >
            {heading("finish", 5)}
            {locale === 'en' && <EnglishFinishTools data={data} update={update} goSection={goSection} />}
            {locale === 'ko' && <KoreanFinishTools data={data} variant={variant} update={update} goSection={goSection} />}
            <label className="field">
              {c.style}
              <select
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
              >
                <optgroup label={u.basic}>
                  {market.templates
                    .filter((style) => !premiumTemplates.includes(style))
                    .map((style) => (
                      <option key={style} value={style}>
                        {copy.templates[style]}
                      </option>
                    ))}
                </optgroup>
              </select>
            </label>
            {premiumTemplates.includes(variant) &&
              !accountState.account?.pro && (
                <p className="form-alert">{w.premiumRequired}</p>
              )}
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
              </Button>
            </div>
            <p className="download-hint">{c.downloadHint}</p>
            <NextActions />
          </section>
          <details className="unified-storage" open={Boolean(session)}>
            <summary>{u.moreTools}</summary>
            <CloudPanel
              cloud={cloud}
              session={session}
              onLogin={onLogin}
              progress={progress.percent}
              onImport={() => restoreDraft()}
              onRestore={restoreLocalBackup}
              confirmAction={confirmAction}
            />
          </details>
          <div className="unified-bottom-actions">
            {locale === 'ja' && readLegacyDraft() && (
              <button
                type="button"
                className="text-link small"
                onClick={importLegacy}
              >
                {u.legacyImport}
              </button>
            )}
            <button
              type="button"
              className="text-link small"
              onClick={restoreLocalBackup}
            >
              {u.restore}
            </button>
            <button
              type="button"
              className="text-link small"
              onClick={() =>
                confirmAction(c.resetTitle, c.resetText, () => {
                  setData(normalizeDraft(emptyResume()));
                  toast(copy.messages.reset);
                })
              }
            >
              <RotateCcw size={13} />
              {c.reset}
            </button>
          </div>
          <TrustBadge />
        </section>
        <aside
          className="unified-preview"
          id="unified-preview"
          ref={previewRef}
          tabIndex={-1}
          aria-label={c.preview}
          aria-hidden={isMobile && !previewOpen ? true : undefined}
        >
          <div className="unified-preview-toolbar">
            <span>
              <i />
              {c.preview}
            </span>
            <small>{locale === 'en' ? (data.paperSize === 'a4' ? 'A4' : 'US Letter') : 'A4'} · {copy.templates[variant]}</small>
            {isMobile && (
              <button
                type="button"
                className="icon-btn"
                aria-label={u.previewClose}
                onClick={() => {
                  setPreviewOpen(false);
                  toggleRef.current?.focus();
                }}
              >
                <X size={19} />
              </button>
            )}
          </div>
          <div className="unified-preview-canvas" ref={canvasRef}>
            <div
              className="unified-preview-fit"
              ref={paperRef}
              style={{ width: 794 * fit.scale, height: fit.height }}
            >
              <div
                className="unified-paper-transform"
                style={{ transform: `scale(${fit.scale})` }}
              >
                <Resume data={data} variant={variant} />
              </div>
            </div>
          </div>
          <p className="unified-preview-caption">
            <Sparkles size={13} />
            {u.caption}
          </p>
        </aside>
      </div>
      <button
        type="button"
        className="unified-mobile-toggle btn btn-primary"
        ref={toggleRef}
        aria-controls="unified-preview"
        aria-expanded={previewOpen}
        onClick={() => setPreviewOpen((open) => !open)}
      >
        {previewOpen ? <PencilLine size={17} /> : <Eye size={17} />}
        {previewOpen ? u.previewClose : u.previewOpen}
        <ArrowUpRight size={16} />
      </button>
      <div className="export-container" aria-hidden="true">
        <Resume id="export-resume" data={data} variant={variant} />
      </div>
      {!session && !nudgeDismissed && !notice && !confirm && !previewOpen &&
        (progress.filledItems >= 3 || progress.percent > 50) && (
        <div className="toast auth-nudge" role="status">
          <ShieldCheck size={18} />
          <span>{copy.auth.nudge}</span>
          <Button onClick={() => {
            setNudgeDismissed(true);
            onLogin();
          }}>{copy.auth.nudgeAction}</Button>
          <button type="button" aria-label={copy.common.close} onClick={() => setNudgeDismissed(true)}>
            <X size={15} />
          </button>
        </div>
      )}
      {pdfFallback && !session && !notice && (
        <div className="toast auth-nudge" role="status">
          <span>{copy.auth.pdfMessage}</span>
          <Button disabled={busy} onClick={() => download("pdf", { allowGuest: true })}>
            {copy.auth.downloadAnyway}
          </Button>
          <button type="button" aria-label={copy.common.close} onClick={() => setPdfFallback(false)}><X size={15} /></button>
        </div>
      )}
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
