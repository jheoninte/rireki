import { admin, body, json, preflight, secret, stripe, user } from '../_shared/server.ts';

Deno.serve(async req => {
  const early = preflight(req); if (early) return early;
  try {
    const account = await user(req);
    if (!account) return json(req, { error: 'unauthorized' }, 401);
    if (!account.email_confirmed_at) return json(req, { error: 'unverified' }, 403);
    const input = await body(req, 1000);
    if (!['pro', 'credits'].includes(input.product)) return json(req, { error: 'invalid_product' }, 400);
    const { data: existing, error: lookupError } = await admin().from('accounts').select('pro,suspended').eq('user_id', account.id).maybeSingle();
    if (lookupError) throw lookupError;
    if (existing?.suspended || (input.product === 'pro' && existing?.pro)) return json(req, { error: 'purchase_unavailable' }, 409);
    const origin = new URL(secret('APP_ORIGIN')).origin;
    const price = secret(input.product === 'pro' ? 'STRIPE_PRO_PRICE_ID' : 'STRIPE_CREDITS_PRICE_ID');
    const configuredPrice = await stripe(`prices/${encodeURIComponent(price)}`);
    if (!configuredPrice.active || configuredPrice.currency !== 'usd' || configuredPrice.unit_amount !== 299 || configuredPrice.type !== 'one_time') throw new Error('price');
    const form = new URLSearchParams({ mode: 'payment', 'line_items[0][price]': price, 'line_items[0][quantity]': '1',
      client_reference_id: account.id, 'metadata[user_id]': account.id, 'metadata[product]': input.product,
      success_url: `${origin}/?payment=success#builder`, cancel_url: `${origin}/?payment=cancelled#builder`,
      'payment_method_types[0]': 'card', 'customer_email': account.email || '',
    });
    // Repeated clicks within five minutes reuse a session instead of creating duplicates.
    const session = await stripe('checkout/sessions', form, `checkout:${account.id}:${input.product}:${Math.floor(Date.now()/300000)}`);
    return json(req, { url: session.url });
  } catch { return json(req, { error: 'unavailable' }, 503); }
});
