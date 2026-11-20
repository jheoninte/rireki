import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "../i18n";
import ja from "../i18n/ja";

const api = vi.hoisted(() => ({
  configured: true,
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithOAuth: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
}));
vi.mock("../lib/auth", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    get authConfigured() {
      return api.configured;
    },
    supabase: { auth: api },
  };
});
import AuthDialog from "./AuthDialog";
const c = ja.auth;
function setup(mode = "login") {
  const onClose = vi.fn(),
    onGuest = vi.fn();
  render(
    <I18nProvider>
      <AuthDialog initialMode={mode} onClose={onClose} onGuest={onGuest} />
    </I18nProvider>,
  );
  return { user: userEvent.setup(), onClose, onGuest };
}
beforeEach(() => {
  api.configured = true;
  for (const key of [
    "signUp",
    "signInWithPassword",
    "signInWithOAuth",
    "resetPasswordForEmail",
    "updateUser",
  ])
    api[key].mockReset();
  api.signUp.mockResolvedValue({
    data: { user: { identities: [{}] }, session: null },
    error: null,
  });
  api.signInWithPassword.mockResolvedValue({ data: {}, error: null });
  api.signInWithOAuth.mockResolvedValue({ error: null });
  api.resetPasswordForEmail.mockResolvedValue({ error: null });
  api.updateUser.mockResolvedValue({ error: null });
});
afterEach(cleanup);
describe("optional account authentication", () => {
  it("submits email/password signup and explains email confirmation", async () => {
    const { user } = setup("signup");
    await user.type(screen.getByLabelText(c.email), "new@example.test");
    await user.type(
      screen.getByLabelText(c.password, { exact: true }),
      "test-password-123",
    );
    await user.type(
      screen.getByLabelText(c.confirm, { exact: true }),
      "test-password-123",
    );
    await user.click(
      screen.getByRole("button", { name: c.signupSubmit, exact: true }),
    );
    expect(api.signUp).toHaveBeenCalledWith({
      email: "new@example.test",
      password: "test-password-123",
      options: { emailRedirectTo: `${location.origin}/#builder` },
    });
    expect(await screen.findByText(c.signupSuccess)).toBeTruthy();
    expect(screen.getByLabelText(c.password, { exact: true }).value).toBe("");
  });
  it("does not transmit mismatched passwords", async () => {
    const { user } = setup("signup");
    await user.type(screen.getByLabelText(c.email), "new@example.test");
    await user.type(
      screen.getByLabelText(c.password, { exact: true }),
      "test-password-123",
    );
    await user.type(
      screen.getByLabelText(c.confirm, { exact: true }),
      "different-password",
    );
    await user.click(
      screen.getByRole("button", { name: c.signupSubmit, exact: true }),
    );
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      c.mismatch,
    );
    expect(api.signUp).not.toHaveBeenCalled();
  });
  it("logs in with credentials and closes after success", async () => {
    const { user, onClose } = setup();
    await user.type(screen.getByLabelText(c.email), "returning@example.test");
    await user.type(
      screen.getByLabelText(c.password, { exact: true }),
      "test-password",
    );
    await user.click(
      screen.getByRole("button", { name: c.loginSubmit, exact: true }),
    );
    expect(api.signInWithPassword).toHaveBeenCalledWith({
      email: "returning@example.test",
      password: "test-password",
    });
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });
  it("shows a Japanese error without reporting login success", async () => {
    api.signInWithPassword.mockResolvedValue({
      error: { code: "invalid_credentials" },
    });
    const { user, onClose } = setup();
    await user.type(screen.getByLabelText(c.email), "returning@example.test");
    await user.type(
      screen.getByLabelText(c.password, { exact: true }),
      "wrong-password",
    );
    await user.click(
      screen.getByRole("button", { name: c.loginSubmit, exact: true }),
    );
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      c.invalid,
    );
    expect(onClose).not.toHaveBeenCalled();
  });
  it("requests the real Google OAuth provider with a return URL", async () => {
    const { user } = setup();
    await user.click(
      screen.getByRole("button", { name: c.google, exact: true }),
    );
    expect(api.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: `${location.origin}/#builder` },
    });
  });
  it("sends a recovery request with the password reset return URL", async () => {
    const { user } = setup("reset");
    await user.type(screen.getByLabelText(c.email), "returning@example.test");
    await user.click(
      screen.getByRole("button", { name: c.resetSubmit, exact: true }),
    );
    expect(api.resetPasswordForEmail).toHaveBeenCalledWith(
      "returning@example.test",
      { redirectTo: `${location.origin}/#reset-password` },
    );
    expect(await screen.findByText(c.resetSuccess)).toBeTruthy();
  });
  it("leaves guest creation available when authentication is not configured", async () => {
    api.configured = false;
    const { user, onGuest } = setup();
    expect(
      screen.getByRole("button", { name: c.google, exact: true }).disabled,
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: c.loginSubmit, exact: true }).disabled,
    ).toBe(true);
    expect(screen.getByText(c.unavailable)).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: c.guestLink, exact: true }),
    );
    expect(onGuest).toHaveBeenCalledOnce();
    expect(api.signInWithPassword).not.toHaveBeenCalled();
  });
  it("supports keyboard dismissal without submitting credentials", async () => {
    const { user, onClose } = setup();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
    expect(api.signInWithPassword).not.toHaveBeenCalled();
  });
});
