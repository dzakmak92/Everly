import { supabase } from './client';
import type { FeatureFlag, Json, PlanTier } from './types';

/**
 * Live config + feature flags (PRD §10.1).
 *
 * The app reads these at bootstrap and caches them; per the spec it must
 * "tolerate a stale cache and fall back to safe defaults if config is
 * unreachable." So every getter here is total — a network failure yields the
 * baked-in defaults below, never a crash.
 */

export type Pricing = {
  pro: { monthly: number; yearly: number; currency: string };
  family: { monthly: number; yearly: number; currency: string };
  lifetime: { oneTime: number; currency: string };
};

export type RemoteConfig = {
  trialDays: number;
  pricing: Pricing;
  enabledLanguages: string[];
  enabledCurrencies: string[];
  maintenanceMode: boolean;
  announcementBanner: { enabled: boolean; text: string; level: string };
};

/** Safe defaults mirror the seeded config so the app is fully usable offline. */
export const DEFAULT_CONFIG: RemoteConfig = {
  trialDays: 14,
  pricing: {
    pro: { monthly: 399, yearly: 3999, currency: 'EUR' },
    family: { monthly: 499, yearly: 4999, currency: 'EUR' },
    lifetime: { oneTime: 14999, currency: 'EUR' },
  },
  enabledLanguages: ['en', 'de', 'es', 'fr', 'tr', 'it'],
  enabledCurrencies: ['EUR', 'GBP', 'USD', 'JPY', 'CAD', 'AUD'],
  maintenanceMode: false,
  announcementBanner: { enabled: false, text: '', level: 'info' },
};

type Rollout = {
  percent: number;
  plans: PlanTier[];
  regions: string[];
  minVersion: string | null;
};

function asRecord(value: Json | undefined): Record<string, Json> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, Json>)
    : {};
}

/** Fetch the public config bootstrap, merging onto safe defaults. */
export async function fetchRemoteConfig(): Promise<RemoteConfig> {
  try {
    const { data, error } = await supabase.from('config').select('key, value');
    if (error || !data) return DEFAULT_CONFIG;
    const map = new Map(data.map((r) => [r.key, r.value]));
    const pricing = asRecord(map.get('pricing'));
    return {
      trialDays: (map.get('trial_days') as number) ?? DEFAULT_CONFIG.trialDays,
      pricing: {
        pro: { ...DEFAULT_CONFIG.pricing.pro, ...asRecord(pricing.pro) },
        family: { ...DEFAULT_CONFIG.pricing.family, ...asRecord(pricing.family) },
        lifetime: { ...DEFAULT_CONFIG.pricing.lifetime, ...asRecord(pricing.lifetime) },
      } as Pricing,
      enabledLanguages:
        (map.get('enabled_languages') as string[]) ?? DEFAULT_CONFIG.enabledLanguages,
      enabledCurrencies:
        (map.get('enabled_currencies') as string[]) ?? DEFAULT_CONFIG.enabledCurrencies,
      maintenanceMode:
        (map.get('maintenance_mode') as boolean) ?? DEFAULT_CONFIG.maintenanceMode,
      announcementBanner: {
        ...DEFAULT_CONFIG.announcementBanner,
        ...asRecord(map.get('announcement_banner')),
      },
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

/** Fetch all feature flags. Returns an empty list on failure (= all-off safe default). */
export async function fetchFeatureFlags(): Promise<FeatureFlag[]> {
  try {
    const { data, error } = await supabase.from('feature_flags').select('*');
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

/**
 * Resolve whether a flag is on for a given user context. Mirrors the server
 * rollout model: kill switch wins, then enabled, then plan/version targeting.
 * (Percent/region targeting is enforced server-side per user; here we honour
 * the coarse gates the client can evaluate locally.)
 */
export function isFeatureEnabled(
  flag: FeatureFlag | undefined,
  ctx: { plan?: PlanTier; appVersion?: string } = {},
): boolean {
  if (!flag) return false;
  if (flag.kill_switch) return false;
  if (!flag.enabled) return false;
  const rollout = asRecord(flag.rollout) as unknown as Rollout;
  if (rollout?.plans?.length && ctx.plan && !rollout.plans.includes(ctx.plan)) {
    return false;
  }
  if (rollout?.minVersion && ctx.appVersion && ctx.appVersion < rollout.minVersion) {
    return false;
  }
  return true;
}

export function flagsByKey(flags: FeatureFlag[]): Record<string, FeatureFlag> {
  return Object.fromEntries(flags.map((f) => [f.key, f]));
}
