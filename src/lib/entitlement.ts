import { useSupabase } from './supabase';

export type Plan = 'free' | 'pro' | 'family' | 'lifetime';

/**
 * Derives the current plan + premium status from the account's billing mirror.
 * Premium = any paid tier (pro/family/lifetime).
 */
export function useEntitlement(): { plan: Plan; isPremium: boolean } {
  const { profile } = useSupabase();
  const plan = (profile?.plan as Plan) ?? 'free';
  return { plan, isPremium: plan !== 'free' };
}
