import React, { useEffect, useId, useRef } from "react";
import { ArrowUpRight, X, FileText } from "lucide-react";
import { useI18n } from "../i18n";

export function Button({ children, secondary, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`btn ${secondary ? "btn-secondary" : "btn-primary"} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export function Logo({ onClick }) {
  const { copy } = useI18n();
  return (
    <a
      href="#"
      className="brand"
      onClick={onClick}
      aria-label={[copy.common.brand, copy.common.brandSubtitle].filter(Boolean).join(" ")}
    >
      <span className="brand-icon">
        <FileText size={20} strokeWidth={1.7} />
      </span>
      <span>
        {copy.common.brand}
        {copy.common.brandSubtitle && <small className="brand-subtitle">{copy.common.brandSubtitle}</small>}
      </span>
    </a>
  );
}
export function SectionTitle({ eyebrow, title, description, left = false }) {
  return (
    <div className={`section-heading ${left ? "align-left" : ""}`}>
      <span className="overline">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
export function Modal({ title, children, onClose, className = "" }) {
  const { copy } = useI18n();
  const titleId = useId();
  const panel = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => [
      ...panel.current.querySelectorAll(
        'button:not(:disabled), input:not(:disabled), a[href], select, textarea, [tabindex="0"]',
      ),
    ];
    focusable()[0]?.focus();
    const handle = (e) => {
      if (e.key === "Escape") close.current();
      if (e.key !== "Tab") return;
      const nodes = focusable();
      const first = nodes[0],
        last = nodes.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handle);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handle);
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        className={`modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="modal-top">
          <span id={titleId}>{title}</span>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label={copy.common.close}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
