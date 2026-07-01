import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Detects when a newer web build has been deployed.
 *
 * We serve `version.json` alongside the app (bump its `build` on each release).
 * On startup we remember the build the user is running; if the server later
 * advertises a different build — either at launch (they're on an old version)
 * or mid-session (a fresh deploy) — we surface an "Update available" prompt.
 *
 * On native this is a no-op stub; OTA there would hook into `expo-updates`.
 */
const BUILD_KEY = 'everly.appBuild.v1';
const POLL_MS = 60_000;

async function fetchBuild(): Promise<string | null> {
  try {
    const res = await fetch(`/version.json?ts=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const j = await res.json();
    return typeof j?.build === 'string' ? j.build : null;
  } catch {
    return null;
  }
}

export function useAppUpdate(): { available: boolean; apply: () => void; dismiss: () => void } {
  const [available, setAvailable] = useState(false);
  const running = useRef<string | null>(null);
  const latest = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return; // native OTA would live here (expo-updates)
    let active = true;

    (async () => {
      const server = await fetchBuild();
      if (!active || !server) return;
      latest.current = server;
      const stored = await AsyncStorage.getItem(BUILD_KEY);
      if (!stored) {
        running.current = server;
        AsyncStorage.setItem(BUILD_KEY, server).catch(() => {});
        return;
      }
      running.current = stored;
      if (stored !== server) setAvailable(true);
    })();

    const id = setInterval(async () => {
      const server = await fetchBuild();
      if (!active || !server) return;
      latest.current = server;
      if (running.current && server !== running.current) setAvailable(true);
    }, POLL_MS);

    return () => { active = false; clearInterval(id); };
  }, []);

  const apply = useCallback(() => {
    if (latest.current) AsyncStorage.setItem(BUILD_KEY, latest.current).catch(() => {});
    if (Platform.OS === 'web' && typeof window !== 'undefined') window.location.reload();
  }, []);

  const dismiss = useCallback(() => setAvailable(false), []);
  return { available, apply, dismiss };
}
