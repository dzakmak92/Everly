import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './client';
import {
  DEFAULT_CONFIG,
  fetchFeatureFlags,
  fetchRemoteConfig,
  flagsByKey,
  isFeatureEnabled,
  type RemoteConfig,
} from './config';
import { getMyProfile } from './auth';
import type { FeatureFlag, Profile } from './types';

type SupabaseContextValue = {
  /** True until the first bootstrap (session + config) settles. */
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  config: RemoteConfig;
  flags: Record<string, FeatureFlag>;
  /** Coarse client-side flag check (kill switch + enabled + plan/version gates). */
  isEnabled: (key: string) => boolean;
  refresh: () => Promise<void>;
};

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [config, setConfig] = useState<RemoteConfig>(DEFAULT_CONFIG);
  const [flags, setFlags] = useState<Record<string, FeatureFlag>>({});

  async function loadRemote() {
    const [cfg, flagList] = await Promise.all([
      fetchRemoteConfig(),
      fetchFeatureFlags(),
    ]);
    setConfig(cfg);
    setFlags(flagsByKey(flagList));
  }

  async function loadProfile() {
    setProfile(await getMyProfile());
  }

  async function refresh() {
    await Promise.all([loadRemote(), loadProfile()]);
  }

  useEffect(() => {
    let active = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      // Bootstrap is non-blocking on its own failure (safe defaults inside).
      await Promise.all([loadRemote(), data.session ? loadProfile() : Promise.resolve()]);
      if (active) setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) {
        loadProfile();
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<SupabaseContextValue>(
    () => ({
      loading,
      session,
      profile,
      config,
      flags,
      isEnabled: (key: string) =>
        isFeatureEnabled(flags[key], { plan: profile?.plan }),
      refresh,
    }),
    [loading, session, profile, config, flags],
  );

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
}

export function useSupabase(): SupabaseContextValue {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error('useSupabase must be used within <SupabaseProvider>');
  return ctx;
}
