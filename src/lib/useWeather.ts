import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Lightweight local weather forecast for the appointments week strip.
 *
 * Uses Open-Meteo (free, no API key) with the device's approximate location.
 * The only thing that leaves the device is a coarse lat/long to fetch the
 * public forecast — no personal data. The result is cached for the day so we
 * fetch at most once per day. Web-only; native would swap in a geolocation lib.
 */
const WEATHER_KEY = 'everly.weather.v1';

export type DayWeather = { emoji: string; label: string; tmax: number };
export type WeatherData = { place: string | null; days: Record<string, DayWeather> };

const EMPTY: WeatherData = { place: null, days: {} };
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** WMO weather code → a friendly emoji + label. */
function wmo(code: number): { emoji: string; label: string } {
  if (code === 0) return { emoji: '☀️', label: 'Sunny' };
  if (code === 1 || code === 2) return { emoji: '⛅', label: 'Partly cloudy' };
  if (code === 3) return { emoji: '☁️', label: 'Cloudy' };
  if (code === 45 || code === 48) return { emoji: '🌫️', label: 'Fog' };
  if (code >= 51 && code <= 57) return { emoji: '🌦️', label: 'Drizzle' };
  if (code >= 61 && code <= 67) return { emoji: '🌧️', label: 'Rain' };
  if (code >= 71 && code <= 77) return { emoji: '❄️', label: 'Snow' };
  if (code >= 80 && code <= 82) return { emoji: '🌦️', label: 'Showers' };
  if (code === 85 || code === 86) return { emoji: '🌨️', label: 'Snow showers' };
  if (code >= 95) return { emoji: '⛈️', label: 'Thunderstorm' };
  return { emoji: '🌡️', label: '' };
}

export function useWeather(): WeatherData {
  const [data, setData] = useState<WeatherData>(EMPTY);

  useEffect(() => {
    if (Platform.OS !== 'web') return; // native would use expo-location here
    let active = true;

    (async () => {
      // Hydrate from cache; if it's from today, that's enough.
      try {
        const raw = await AsyncStorage.getItem(WEATHER_KEY);
        if (raw) {
          const c = JSON.parse(raw);
          if (c?.days) { if (active) setData({ place: c.place ?? null, days: c.days }); if (c.at === dayKey(new Date())) return; }
        }
      } catch { /* ignore */ }

      const geo = typeof navigator !== 'undefined' && navigator.geolocation ? navigator.geolocation : null;
      if (!geo) return;
      geo.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(2)}&longitude=${longitude.toFixed(2)}&daily=weather_code,temperature_2m_max&forecast_days=7&timezone=auto`;
            const res = await fetch(url);
            if (!res.ok) return;
            const j = await res.json();
            const times: string[] = j?.daily?.time ?? [];
            const codes: number[] = j?.daily?.weather_code ?? [];
            const temps: number[] = j?.daily?.temperature_2m_max ?? [];
            const days: Record<string, DayWeather> = {};
            times.forEach((t, i) => { const w = wmo(codes[i]); days[t] = { emoji: w.emoji, label: w.label, tmax: Math.round(temps[i]) }; });
            const place = j?.timezone ? String(j.timezone).split('/').pop()?.replace(/_/g, ' ') ?? null : null;
            if (active) setData({ place, days });
            AsyncStorage.setItem(WEATHER_KEY, JSON.stringify({ at: dayKey(new Date()), place, days })).catch(() => {});
          } catch { /* ignore */ }
        },
        () => { /* denied / unavailable — card simply shows no weather */ },
        { maximumAge: 3_600_000, timeout: 8_000 },
      );
    })();

    return () => { active = false; };
  }, []);

  return data;
}
