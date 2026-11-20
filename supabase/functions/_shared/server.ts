import { createClient } from 'npm:@supabase/supabase-js@2.119.1';

export function secret(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing server configuration: ${name}`);
  return value;
}
export function admin() {
  return createClient(secret('SUPABASE_URL'), secret('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } });
}
export function headers(req: Request) {
  const origin = secret('APP_ORIGIN');
  return { 'Access-Control-Allow-Origin': req.headers.get('origin') === origin ? origin : 'null',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Vary': 'Origin', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
}
export function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: headers(req) });
}
export function preflight(req: Request) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: headers(req) });
  if (req.method !== 'POST') return json(req, { error: 'method' }, 405);
  if (req.headers.get('origin') && req.headers.get('origin') !== secret('APP_ORIGIN')) return json(req, { error: 'origin' }, 403);
  return null;
}
export async function user(req: Request) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token || token.length > 8192) return null;
  const { data, error } = await admin().auth.getUser(token);
  return error ? null : data.user;
}
export async function body(req: Request, limit = 16000) {
  // Stream-limit the actual body; Content-Length alone can be omitted or falsified.
  const reader = req.body?.getReader();
  if (!reader) throw new Error('body');
  let size = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); throw new Error('body'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}
export async function stripe(path: string, form?: URLSearchParams, idempotency?: string) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: form ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${secret('STRIPE_SECRET_KEY')}`,
      ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      ...(idempotency ? { 'Idempotency-Key': idempotency } : {}) },
    body: form, signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('stripe');
  return response.json();
}
