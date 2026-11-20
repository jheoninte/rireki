import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
export const authConfigured = Boolean(url && key && /^https:\/\//.test(url));
export const supabase = authConfigured
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    })
  : null;

export function authError(error, copy) {
  const c = copy.auth;
  switch (error?.code) {
    case "invalid_credentials":
      return c.invalid;
    case "email_not_confirmed":
      return c.notConfirmed;
    case "user_already_exists":
    case "email_exists":
      return c.exists;
    case "weak_password":
      return c.weak;
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return c.rateLimit;
    default:
      return c.generic;
  }
}
