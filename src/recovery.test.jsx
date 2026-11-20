import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nProvider } from "./i18n";
import ja from "./i18n/ja";

const api = vi.hoisted(() => ({
  getSession: vi.fn(), verifyOtp: vi.fn(),
  updateUser: vi.fn(),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
}));
vi.mock("./lib/auth", () => ({ authConfigured: true, authError: () => "error", supabase: { auth: api } }));
import { App } from "./main";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  api.getSession.mockResolvedValue({ data: { session: null }, error: null });
  api.verifyOtp.mockResolvedValue({ data: { session: null }, error: { message: "expired" } });
});
afterEach(() => { cleanup(); history.replaceState(null, "", "/"); });
const show = (path) => {
  history.replaceState(null, "", path);
  render(<I18nProvider><App /></I18nProvider>);
};
describe("dedicated password recovery", () => {
  const submitUpdate = async () => {
    api.verifyOtp.mockResolvedValue({ data: { session: { user: { email: "person@example.test" } } }, error: null });
    show("/reset-password?token_hash=test-update&type=recovery");
    const submit = await screen.findByRole("button", { name: ja.auth.updateSubmit });
    document.querySelectorAll('input[type="password"]').forEach(input =>
      fireEvent.change(input, { target: { value: "test-password-123" } }));
    fireEvent.click(submit);
  };
  it("opens the editor with a dismissible success notice after updating the password", async () => {
    api.updateUser.mockResolvedValue({ error: null });
    await submitUpdate();
    expect(await screen.findByText(ja.auth.updateLoginSuccess)).toBeTruthy();
    expect(api.updateUser).toHaveBeenCalledExactlyOnceWith({ password: "test-password-123" });
    expect(location.pathname).toBe("/");
    expect(location.hash).toBe("#builder");
    expect(screen.queryByRole("button", { name: ja.auth.updateSubmit })).toBeNull();
    fireEvent.click(screen.getByRole("status").querySelector("button"));
    expect(screen.queryByText(ja.auth.updateLoginSuccess)).toBeNull();
  });
  it("keeps the update form visible when saving fails", async () => {
    api.updateUser.mockResolvedValue({ error: { message: "failed" } });
    await submitUpdate();
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("button", { name: ja.auth.updateSubmit })).toBeTruthy();
    expect(screen.queryByText(ja.auth.updateLoginSuccess)).toBeNull();
    expect(location.pathname).toBe("/reset-password");
  });
  it("shows recovery and a new email request for an expired link instead of the landing page", async () => {
    show("/#error=access_denied&error_code=otp_expired");
    expect(await screen.findByRole("heading", { level: 1, name: ja.auth.resetTitle })).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain(ja.auth.recoveryInvalid);
    expect(await screen.findByRole("button", { name: ja.auth.resetSubmit })).toBeTruthy();
  });
  it("verifies a mail token without a PKCE verifier and opens the inline new password form", async () => {
    api.verifyOtp.mockResolvedValue({ data: { session: { user: { email: "person@example.test" } } }, error: null });
    show("/reset-password?token_hash=test-one-use-token&type=recovery");
    expect(await screen.findByRole("heading", { name: ja.auth.updateTitle })).toBeTruthy();
    expect(api.verifyOtp).toHaveBeenCalledExactlyOnceWith({ token_hash: "test-one-use-token", type: "recovery" });
    expect(location.search).toBe("");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("lets a used token request another email without displaying a password update form", async () => {
    show("/reset-password?token_hash=used-token&type=recovery");
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain(ja.auth.recoveryInvalid));
    expect(screen.getByRole("button", { name: ja.auth.resetSubmit })).toBeTruthy();
    expect(screen.queryByRole("button", { name: ja.auth.updateSubmit })).toBeNull();
  });
});
