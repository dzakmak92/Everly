// Everly — create a Stripe Checkout Session for the signed-in user.
//
// The app calls this (with the user's access token) to start an upgrade. It
// returns a Checkout URL the client redirects to. The existing stripe-webhook
// reconciles the resulting subscription back into `profiles`.
//
// Deploy:
//   supabase functions deploy create-checkout --no-verify-jwt
// Secrets (shared with the webhook):
//   supabase secrets set STRIPE_SECRET_KEY=sk_...

import Stripe from 'https://esm.sh/stripe@17.7.0?target=deno';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2025-03-31.basil',
  httpClient: Stripe.createFetchHttpClient(),
});

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    // Identify the caller from their bearer token (no service role needed).
    const authHeader = req.headers.get('Authorization') ?? '';
    const supa = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const { priceId, mode, returnUrl } = await req.json();
    if (!priceId) return json({ error: 'Missing priceId' }, 400);

    const base = (typeof returnUrl === 'string' && returnUrl) || '';
    const session = await stripe.checkout.sessions.create({
      mode: mode === 'payment' ? 'payment' : 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      allow_promotion_codes: true,
      success_url: `${base}?checkout=success`,
      cancel_url: `${base}?checkout=cancel`,
    });

    return json({ url: session.url });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
