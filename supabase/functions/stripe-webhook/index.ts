// Everly — Stripe webhook reconciler (Supabase Edge Function).
//
// Stripe is the system of record for billing; this function mirrors subscription
// state into `public.profiles` (billing columns only — never any family data).
// It runs with the SERVICE ROLE, which bypasses RLS but still passes the
// `guard_profile_billing_columns` trigger (which explicitly allows service_role).
//
// Deploy:
//   supabase functions deploy stripe-webhook --no-verify-jwt
// Secrets (set once):
//   supabase secrets set STRIPE_SECRET_KEY=sk_live_... STRIPE_WEBHOOK_SECRET=whsec_...
// (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.)
// Then point a Stripe webhook endpoint at the function URL for the events below.

import Stripe from 'https://esm.sh/stripe@17.7.0?target=deno';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2025-03-31.basil',
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

const admin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false } },
);

type Plan = 'free' | 'pro' | 'family' | 'lifetime';

/** Resolve the plan tier from a subscription's price metadata. */
function planFromPriceMetadata(meta: Record<string, string> | undefined): Plan {
  const tier = meta?.tier;
  if (tier === 'pro' || tier === 'family' || tier === 'lifetime') return tier;
  return 'free';
}

/** Patch a profile's billing columns, located by Stripe customer id. */
async function patchProfileByCustomer(
  customerId: string,
  patch: Record<string, unknown>,
) {
  const { error } = await admin
    .from('profiles')
    .update(patch)
    .eq('stripe_customer_id', customerId);
  if (error) console.error('profile update failed', customerId, error.message);
}

async function handleSubscription(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  const plan = planFromPriceMetadata(item?.price?.metadata as Record<string, string>);
  await patchProfileByCustomer(sub.customer as string, {
    plan: sub.status === 'active' || sub.status === 'trialing' ? plan : 'free',
    sub_status: sub.status,
    stripe_subscription_id: sub.id,
    trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
  });
}

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('missing signature', { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    console.error('signature verification failed', (err as Error).message);
    return new Response('invalid signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Link the Stripe customer to the user once, via client_reference_id
        // (set to the Supabase user id when creating the Checkout Session).
        if (session.client_reference_id && session.customer) {
          await admin
            .from('profiles')
            .update({ stripe_customer_id: session.customer as string })
            .eq('id', session.client_reference_id);
        }
        // One-time Lifetime purchase has no subscription to track.
        if (session.mode === 'payment' && session.customer) {
          await patchProfileByCustomer(session.customer as string, {
            plan: 'lifetime',
            sub_status: 'active',
          });
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        await handleSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await patchProfileByCustomer(sub.customer as string, {
          plan: 'free',
          sub_status: 'canceled',
          stripe_subscription_id: null,
        });
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer) {
          await patchProfileByCustomer(invoice.customer as string, {
            sub_status: 'active',
          });
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer) {
          await patchProfileByCustomer(invoice.customer as string, {
            sub_status: 'past_due',
          });
        }
        break;
      }
      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    console.error('handler error', event.type, (err as Error).message);
    return new Response('handler error', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
