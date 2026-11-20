import { describe, expect, it } from "vitest";
import { readAuthRoute } from "./auth-route";

describe("authentication recovery URLs", () => {
  it("opens the dedicated recovery page before exchanging a token", () => {
    expect(
      readAuthRoute(
        new URL(
          "https://example.test/reset-password?token_hash=test-token&type=recovery",
        ),
      ),
    ).toMatchObject({ recovery: true, exchanging: true, error: false });
  });
  it("keeps a recovery page visible when a link is expired", () => {
    expect(
      readAuthRoute(
        new URL(
          "https://example.test/#error=access_denied&error_code=otp_expired",
        ),
      ),
    ).toMatchObject({ recovery: true, error: true });
  });
  it("still recognizes links sent before the dedicated page existed", () => {
    expect(
      readAuthRoute(
        new URL("https://example.test/?code=legacy-code#reset-password"),
      ),
    ).toMatchObject({ recovery: true, exchanging: true });
  });
  it("does not mistake a normal Google callback for password recovery", () => {
    expect(
      readAuthRoute(new URL("https://example.test/?code=google-code#builder")),
    ).toMatchObject({ recovery: false, exchanging: true, error: false });
  });
});
