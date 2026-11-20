import { admin, secret, stripe } from '../_shared/server.ts';

async function verify(raw: string, signature: string) {
  const fields = signature.split(',').map(x => x.split('='));
  const time = fields.find(x => x[0] === 't')?.[1];
  if (!time || !/^\d+$/.test(time) || Math.abs(Date.now()/1000 - Number(time)) > 300) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret('STRIPE_WEBHOOK_SECRET')), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const message = new TextEncoder().encode(`${time}.${raw}`);
  for (const [, hex] of fields.filter(x => x[0] === 'v1')) {
    if (!/^[a-f0-9]{64}$/i.test(hex)) continue;
    const bytes = Uint8Array.from(hex.match(/../g)!, x => parseInt(x, 16));
    if (await crypto.subtle.verify('HMAC', key, bytes, message)) return true;
  }
  return false;
}
Deno.serve(async req => {
  if (req.method !== 'POST') return new Response('method', { status: 405 });
  try {
    // Stripe payloads are small; streaming limits also handle missing Content-Length.
    // Signature verification needs the exact bytes, so read and cap without reserialization.
    const reader = req.body?.getReader(); if (!reader) return new Response('body', { status: 400 });
    const chunks: Uint8Array[] = []; let size = 0;
    for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 1000000) { await reader.cancel(); return new Response('size', { status: 413 }); } chunks.push(value); }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const raw = new TextDecoder().decode(bytes);
    if (!await verify(raw, req.headers.get('stripe-signature') || '')) return new Response('signature', { status: 400 });
    const event = JSON.parse(raw);
    if (['charge.refunded', 'charge.dispute.created'].includes(event.type)) {
      const chargeId = event.type === 'charge.refunded' ? event.data.object.id : event.data.object.charge;
      const charge = await stripe(`charges/${encodeURIComponent(chargeId)}`);
      const { error } = await admin().rpc('reverse_payment', { p_intent: charge.payment_intent });
      if (error) throw error;
      return new Response('reversed');
    }
    if (!['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)) return new Response('ignored');
    // Read the authoritative session instead of trusting a success URL or client metadata.
    const session = await stripe(`checkout/sessions/${encodeURIComponent(event.data.object.id)}`);
    if (session.payment_status !== 'paid') return new Response('unpaid');
    const product = session.metadata?.product, userId = session.metadata?.user_id;
    const price = product === 'pro' ? secret('STRIPE_PRO_PRICE_ID') : product === 'credits' ? secret('STRIPE_CREDITS_PRICE_ID') : null;
    const lines = await stripe(`checkout/sessions/${encodeURIComponent(session.id)}/line_items`);
    if (!price || session.mode !== 'payment' || session.currency !== 'usd' || session.amount_total !== 299 ||
      session.client_reference_id !== userId || !session.payment_intent || lines.has_more || lines.data.length !== 1 ||
      lines.data[0].price.id !== price || lines.data[0].quantity !== 1) return new Response('mismatch', { status: 400 });
    const { error } = await admin().rpc('fulfill_payment', { p_event: event.id, p_session: session.id, p_intent: session.payment_intent, p_user: userId, p_product: product });
    if (error) throw error;
    return new Response('ok');
  } catch {
    // Return 500 so Stripe retries; do not log payment/customer details.
    return new Response('retry', { status: 500 });
  }
});
