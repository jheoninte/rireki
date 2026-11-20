export function readAuthRoute(location) {
  const query = new URLSearchParams(location.search);
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const error =
    query.get("error_code") ||
    hash.get("error_code") ||
    query.get("error") ||
    hash.get("error");
  return {
    recovery:
      location.pathname === "/reset-password" ||
      location.hash === "#reset-password" ||
      hash.get("type") === "recovery" ||
      query.get("type") === "recovery" ||
      error === "otp_expired",
    error: Boolean(error),
    exchanging:
      query.has("code") || query.has("token_hash") || hash.has("access_token"),
  };
}
