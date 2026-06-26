import React, { useCallback, useEffect, useState } from 'react';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Lightweight, opt-in weather for the calendar. Uses Open-Meteo (free, no API
 * key). The only thing that ever leaves the device is the city the user picks
 * — never personal data. Location + a short-lived forecast cache live on-device.
 */

const LOC_KEY = 'everly.weatherLoc.v1';
const CACHE_KEY = 'everly.weatherCache.v1';
const TTL_MS = 3 * 60 * 60 * 1000; // 3h

export type WxLocation = { name: string; lat: number; lon: number; admin?: string; country?: string };
export type DayWx = { code: number; tMax: number; tMin: number };
type Cache = { at: number; lat: number; lon: number; days: Record<string, DayWx> };

export type WxCategory = 'clear' | 'partly' | 'cloud' | 'fog' | 'rain' | 'snow' | 'storm';

/** Map a WMO weather code to a coarse category. */
export function wxCategory(code: number): WxCategory {
  if (code === 0) return 'clear';
  if (code === 1 || code === 2) return 'partly';
  if (code === 3) return 'cloud';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rain';
  if (code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'storm';
  return 'cloud';
}

const CAT_LABEL: Record<WxCategory, string> = {
  clear: 'Clear', partly: 'Partly cloudy', cloud: 'Cloudy', fog: 'Fog', rain: 'Rain', snow: 'Snow', storm: 'Storm',
};
export const wxLabel = (code: number) => CAT_LABEL[wxCategory(code)];

const CAT_COLOR: Record<WxCategory, string> = {
  clear: '#E9A23B', partly: '#C9A33B', cloud: '#9C9AB2', fog: '#9C9AB2', rain: '#4E8FD0', snow: '#7FB0D8', storm: '#6B6FC9',
};
export const wxColor = (code: number) => CAT_COLOR[wxCategory(code)];

/** Small weather glyph drawn from a WMO code. */
export function WeatherGlyph({ code, size = 16, color }: { code: number; size?: number; color?: string }) {
  const cat = wxCategory(code);
  const c = color ?? CAT_COLOR[cat];
  const s = (w = 2) => ({ fill: 'none' as const, stroke: c, strokeWidth: w, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });
  const cloud = <Path d="M6 16h11a3.5 3.5 0 0 0 .3-7A5 5 0 0 0 8 8.2 3.9 3.9 0 0 0 6 16z" {...s(1.8)} />;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {cat === 'clear' && (
        <>
          <Circle cx="12" cy="12" r="4.2" {...s()} />
          <Line x1="12" y1="2.5" x2="12" y2="5" {...s()} /><Line x1="12" y1="19" x2="12" y2="21.5" {...s()} />
          <Line x1="2.5" y1="12" x2="5" y2="12" {...s()} /><Line x1="19" y1="12" x2="21.5" y2="12" {...s()} />
          <Line x1="5.2" y1="5.2" x2="6.9" y2="6.9" {...s()} /><Line x1="17.1" y1="17.1" x2="18.8" y2="18.8" {...s()} />
          <Line x1="5.2" y1="18.8" x2="6.9" y2="17.1" {...s()} /><Line x1="17.1" y1="6.9" x2="18.8" y2="5.2" {...s()} />
        </>
      )}
      {cat === 'partly' && (
        <>
          <Circle cx="8.5" cy="8.5" r="3.2" {...s(1.8)} />
          <Path d="M9 18h8a3 3 0 0 0 .2-6A4.2 4.2 0 0 0 9.5 11 3.4 3.4 0 0 0 9 18z" {...s(1.8)} />
        </>
      )}
      {(cat === 'cloud' || cat === 'fog') && cloud}
      {cat === 'rain' && (<>{cloud}<Line x1="9" y1="18" x2="8" y2="21" {...s()} /><Line x1="13" y1="18" x2="12" y2="21" {...s()} /><Line x1="17" y1="18" x2="16" y2="21" {...s()} /></>)}
      {cat === 'snow' && (<>{cloud}<Line x1="9" y1="19.5" x2="9" y2="19.5" {...s(2.4)} /><Line x1="13" y1="20.5" x2="13" y2="20.5" {...s(2.4)} /><Line x1="16.5" y1="19.5" x2="16.5" y2="19.5" {...s(2.4)} /></>)}
      {cat === 'storm' && (<>{cloud}<Path d="M12 17l-2 3h3l-2 3" {...s(1.8)} /></>)}
    </Svg>
  );
}

/** Geocoding city search via Open-Meteo (no key). */
export async function searchCity(query: string): Promise<WxLocation[]> {
  const q = query.trim();
  if (!q) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Search failed');
  const json = await res.json();
  return (json.results ?? []).map((r: any) => ({ name: r.name, lat: r.latitude, lon: r.longitude, admin: r.admin1, country: r.country_code }));
}

async function fetchForecast(lat: number, lon: number): Promise<Record<string, DayWx>> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=10&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Forecast failed');
  const j = await res.json();
  const out: Record<string, DayWx> = {};
  const t: string[] = j.daily?.time ?? [];
  t.forEach((date, i) => {
    out[date] = { code: j.daily.weather_code[i], tMax: Math.round(j.daily.temperature_2m_max[i]), tMin: Math.round(j.daily.temperature_2m_min[i]) };
  });
  return out;
}

const localKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function useWeather() {
  const [location, setLoc] = useState<WxLocation | null>(null);
  const [forecast, setForecast] = useState<Record<string, DayWx>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // hydrate
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [rawLoc, rawCache] = await Promise.all([AsyncStorage.getItem(LOC_KEY), AsyncStorage.getItem(CACHE_KEY)]);
        if (!active) return;
        if (rawLoc) setLoc(JSON.parse(rawLoc));
        if (rawCache) { const c: Cache = JSON.parse(rawCache); setForecast(c.days || {}); }
      } catch { /* ignore */ } finally { if (active) setReady(true); }
    })();
    return () => { active = false; };
  }, []);

  const refresh = useCallback(async (loc: WxLocation) => {
    setLoading(true); setError(null);
    try {
      const days = await fetchForecast(loc.lat, loc.lon);
      setForecast(days);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), lat: loc.lat, lon: loc.lon, days } as Cache));
    } catch (e: any) {
      setError('Could not load weather. Check your connection.');
    } finally { setLoading(false); }
  }, []);

  // refetch when location set or cache stale
  useEffect(() => {
    if (!ready || !location) return;
    (async () => {
      try {
        const rawCache = await AsyncStorage.getItem(CACHE_KEY);
        const c: Cache | null = rawCache ? JSON.parse(rawCache) : null;
        const fresh = c && c.lat === location.lat && c.lon === location.lon && Date.now() - c.at < TTL_MS;
        if (!fresh) await refresh(location);
      } catch { await refresh(location); }
    })();
  }, [ready, location, refresh]);

  const setLocation = useCallback((loc: WxLocation | null) => {
    setLoc(loc);
    if (loc) { AsyncStorage.setItem(LOC_KEY, JSON.stringify(loc)).catch(() => {}); refresh(loc); }
    else { AsyncStorage.removeItem(LOC_KEY).catch(() => {}); AsyncStorage.removeItem(CACHE_KEY).catch(() => {}); setForecast({}); }
  }, [refresh]);

  const wxForDate = useCallback((d: Date): DayWx | null => forecast[localKey(d)] ?? null, [forecast]);
  const today = wxForDate(new Date());

  return { ready, location, forecast, today, loading, error, setLocation, searchCity, wxForDate };
}
