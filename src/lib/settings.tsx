import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Lightweight app-preference store, kept separate from the domain data store.
 * All preferences live on-device (AsyncStorage → localStorage on web).
 */
export type ThemePref = 'system' | 'light' | 'dark';
export type UnitsPref = 'metric' | 'imperial';
export type DateFmt = 'dmy' | 'mdy' | 'iso';
export type WeekStart = 'mon' | 'sun';

export type Prefs = {
  theme: ThemePref;
  units: UnitsPref;
  dateFormat: DateFmt;
  weekStart: WeekStart;
  notifReminders: boolean;
  notifDigest: boolean;
};

export const DEFAULT_PREFS: Prefs = {
  theme: 'system',
  units: 'metric',
  dateFormat: 'dmy',
  weekStart: 'mon',
  notifReminders: true,
  notifDigest: true,
};

const PREFS_KEY = 'everly.prefs.v1';

export const UNITS_LABEL: Record<UnitsPref, string> = { metric: 'Metric · kg, ml, cm', imperial: 'Imperial · lb, fl oz, in' };
export const THEME_LABEL: Record<ThemePref, string> = { system: 'System', light: 'Light', dark: 'Dark' };
export const DATEFMT_LABEL: Record<DateFmt, string> = { dmy: 'DD/MM/YYYY', mdy: 'MM/DD/YYYY', iso: 'YYYY-MM-DD' };
export const WEEKSTART_LABEL: Record<WeekStart, string> = { mon: 'Monday', sun: 'Sunday' };

type SettingsValue = {
  prefs: Prefs;
  setPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
};

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY)
      .then((raw) => { if (raw) setPrefs((p) => ({ ...p, ...JSON.parse(raw) })); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs)).catch(() => {});
  }, [prefs, loaded]);

  const setPref = useMemo(
    () => <K extends keyof Prefs>(key: K, value: Prefs[K]) => setPrefs((p) => ({ ...p, [key]: value })),
    [],
  );

  const value = useMemo<SettingsValue>(() => ({ prefs, setPref }), [prefs, setPref]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

/** Collect every on-device Everly key into a single JSON backup string. */
export async function exportEverlyData(): Promise<string> {
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith('everly.'));
  const values = await Promise.all(keys.map((k) => AsyncStorage.getItem(k)));
  const data: Record<string, unknown> = {};
  keys.forEach((k, i) => {
    const v = values[i];
    if (v == null) return;
    try { data[k] = JSON.parse(v); } catch { data[k] = v; }
  });
  return JSON.stringify({ app: 'Everly', exportedFields: keys.length, data }, null, 2);
}
