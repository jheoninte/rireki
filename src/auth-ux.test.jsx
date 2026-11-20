import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { I18nProvider } from "./i18n";
import ja from "./i18n/ja";
import { readAuthDraft } from "./lib/auth-draft";

const api = vi.hoisted(() => ({
  getSession: vi.fn(), signInWithOAuth: vi.fn(), signInWithPassword: vi.fn(),
  onAuthStateChange: vi.fn(), listener: null,
}));
vi.mock("./lib/auth", async (importOriginal) => ({
  ...await importOriginal(), authConfigured: true, supabase: { auth: api },
}));
vi.mock("./lib/export", () => ({ exportResume: vi.fn().mockResolvedValue(undefined) }));
import { exportResume } from "./lib/export";
import { App } from "./main";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  api.getSession.mockResolvedValue({ data: { session: null }, error: null });
  api.signInWithOAuth.mockResolvedValue({ error: null });
  api.onAuthStateChange.mockImplementation((listener) => {
    api.listener = listener;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
  localStorage.setItem("rireki:resume:ja:v1", JSON.stringify({ name: "書きかけの履歴書", email: "a@example.test", title: "Developer" }));
  history.replaceState(null, "", "/app/");
});
afterEach(() => { cleanup(); history.replaceState(null, "", "/"); });

it("opens Google auth above the editor, stages the latest draft and preserves it on sign-in", async () => {
  localStorage.setItem("rireki:resume:user-1:ja:v1", JSON.stringify({ name: "以前のアカウント下書き" }));
  render(<I18nProvider><App /></I18nProvider>);
  await waitFor(() => expect(api.listener).toBeTypeOf("function"));
  fireEvent.click(screen.getByRole("button", { name: ja.auth.nudgeAction }));
  expect(screen.getByRole("textbox", { name: /^氏名/ }).value).toBe("書きかけの履歴書");
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: ja.auth.google }));
  await waitFor(() => expect(api.signInWithOAuth).toHaveBeenCalledOnce());
  expect(readAuthDraft("ja").name).toBe("書きかけの履歴書");
  act(() => api.listener("SIGNED_IN", { user: { id: "user-1", email: "a@example.test" } }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByRole("textbox", { name: /^氏名/ }).value).toBe("書きかけの履歴書");
  expect(JSON.parse(localStorage.getItem("rireki:backup:user-1:ja")).data.name).toBe("以前のアカウント下書き");
});

it("downloads as a guest from the PDF modal without navigating or losing the editor", async () => {
  render(<I18nProvider><App /></I18nProvider>);
  fireEvent.click(within(screen.getByRole("banner")).getByRole("button", { name: ja.common.pdf }));
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByText(ja.auth.pdfMessage)).toBeTruthy();
  expect(exportResume).not.toHaveBeenCalled();
  fireEvent.click(within(dialog).getByRole("button", { name: ja.auth.downloadAnyway }));
  await waitFor(() => expect(exportResume).toHaveBeenCalledOnce());
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(location.pathname).toBe("/app/");
  expect(screen.getByRole("textbox", { name: /^氏名/ }).value).toBe("書きかけの履歴書");
});
