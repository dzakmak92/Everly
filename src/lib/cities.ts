/**
 * City → IANA timezone lookup for the Family & caregivers picker.
 * Data is a bundled snapshot of the `city-timezones` dataset (~7.3k cities
 * worldwide, each carrying its own IANA timezone), generated into
 * `citiesData.json` as compact tuples: [asciiName, displayName, country, tz, population].
 * Sorted by population so the most likely match ranks first.
 */
import RAW from './citiesData.json';

export type City = { city: string; country: string; tz: string };

type Row = [string, string, string, string, number];
const ROWS = RAW as unknown as Row[];

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').trim();

// Precomputed normalized ascii name per row, parallel to ROWS (built once).
const NAMES = ROWS.map((r) => norm(r[0]));

const toCity = (r: Row): City => ({ city: r[1], country: r[2], tz: r[3] });

/** Best matches for a typed query — prefix hits first, then substring, each already population-ranked. */
export function searchCities(query: string, limit = 6): City[] {
  const q = norm(query);
  if (!q) return [];
  const starts: City[] = [];
  const contains: City[] = [];
  for (let i = 0; i < ROWS.length; i++) {
    const n = NAMES[i];
    if (n.startsWith(q)) {
      starts.push(toCity(ROWS[i]));
      if (starts.length >= limit) break;
    } else if (n.includes(q)) {
      if (contains.length < limit) contains.push(toCity(ROWS[i]));
    }
  }
  return [...starts, ...contains].slice(0, limit);
}

/** Resolve a free-typed city name to a known city (highest-population exact match). */
export function resolveCity(query: string): City | null {
  const q = norm(query);
  if (!q) return null;
  for (let i = 0; i < ROWS.length; i++) {
    if (NAMES[i] === q) return toCity(ROWS[i]);
  }
  return null;
}
