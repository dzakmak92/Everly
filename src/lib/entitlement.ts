import { useSupabase } from './supabase';
import { useData } from './store';

export type Plan = 'free' | 'pro' | 'family' | 'lifetime';

/**
 * Derives the current plan + premium status from the account's billing mirror.
 * Premium = any paid tier (pro/family/lifetime). The on-device "demo premium"
 * flag (Settings → Load sample data / Preview premium) unlocks gated features
 * locally so the full experience can be explored without a paid account.
 */
export function useEntitlement(): { plan: Plan; isPremium: boolean } {
  const { profile } = useSupabase();
  const { demoPremium } = useData();
  const plan = (profile?.plan as Plan) ?? 'free';
  if (demoPremium) return { plan: plan === 'free' ? 'pro' : plan, isPremium: true };
  return { plan, isPremium: plan !== 'free' };
}
