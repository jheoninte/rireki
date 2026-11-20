import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { I18nProvider } from "./i18n";
import ja from "./i18n/ja";

const api = vi.hoisted(() => ({
  getSession: vi.fn(), verifyOtp: vi.fn(),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
}));
vi.mock("./lib/auth", () => ({ authConfigured: true, authError: () => "error", supabase: { auth: api } }));
import { App } from "./main";

beforeEach(() => {
  vi.clearAllMocks();
  api.getSession.mockResolvedValue({ data: { session: null }, error: null });
  api.verifyOtp.mockResolvedValue({ data: { session: null }, error: { message: "expired" } });
});
afterEach(() => { cleanup(); history.replaceState(null, "", "/"); });
const show = (path) => {
  history.replaceState(null, "", path);
  render(<I18nProvider><App /></I18nProvider>);
};
describe("dedicated password recovery", () => {
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
