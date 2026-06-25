import { supabase } from './client';

/**
 * Start a Stripe Checkout for the signed-in user via the `create-checkout`
 * Edge Function. Returns the Checkout URL to redirect to, or throws.
 */
export async function createCheckout(params: {
  priceId: string;
  mode: 'subscription' | 'payment';
  returnUrl: string;
}): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: params,
  });
  if (error) throw new Error(error.message);
  if (!data?.url) throw new Error(data?.error || 'Could not start checkout.');
  return data.url as string;
}
