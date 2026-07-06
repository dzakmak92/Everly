/**
 * Curated city → IANA timezone lookup for the Family & caregivers picker.
 * Not exhaustive — a broad spread of major cities so typing a place name
 * resolves its timezone (and places the person on the day/night ring).
 */
export type City = { city: string; country: string; tz: string };

export const CITIES: City[] = [
  // Europe
  { city: 'London', country: 'United Kingdom', tz: 'Europe/London' },
  { city: 'Dublin', country: 'Ireland', tz: 'Europe/Dublin' },
  { city: 'Manchester', country: 'United Kingdom', tz: 'Europe/London' },
  { city: 'Edinburgh', country: 'United Kingdom', tz: 'Europe/London' },
  { city: 'Paris', country: 'France', tz: 'Europe/Paris' },
  { city: 'Madrid', country: 'Spain', tz: 'Europe/Madrid' },
  { city: 'Barcelona', country: 'Spain', tz: 'Europe/Madrid' },
  { city: 'Lisbon', country: 'Portugal', tz: 'Europe/Lisbon' },
  { city: 'Berlin', country: 'Germany', tz: 'Europe/Berlin' },
  { city: 'Munich', country: 'Germany', tz: 'Europe/Berlin' },
  { city: 'Frankfurt', country: 'Germany', tz: 'Europe/Berlin' },
  { city: 'Amsterdam', country: 'Netherlands', tz: 'Europe/Amsterdam' },
  { city: 'Brussels', country: 'Belgium', tz: 'Europe/Brussels' },
  { city: 'Zurich', country: 'Switzerland', tz: 'Europe/Zurich' },
  { city: 'Geneva', country: 'Switzerland', tz: 'Europe/Zurich' },
  { city: 'Milan', country: 'Italy', tz: 'Europe/Rome' },
  { city: 'Rome', country: 'Italy', tz: 'Europe/Rome' },
  { city: 'Vienna', country: 'Austria', tz: 'Europe/Vienna' },
  { city: 'Prague', country: 'Czechia', tz: 'Europe/Prague' },
  { city: 'Warsaw', country: 'Poland', tz: 'Europe/Warsaw' },
  { city: 'Stockholm', country: 'Sweden', tz: 'Europe/Stockholm' },
  { city: 'Oslo', country: 'Norway', tz: 'Europe/Oslo' },
  { city: 'Copenhagen', country: 'Denmark', tz: 'Europe/Copenhagen' },
  { city: 'Helsinki', country: 'Finland', tz: 'Europe/Helsinki' },
  { city: 'Athens', country: 'Greece', tz: 'Europe/Athens' },
  { city: 'Istanbul', country: 'Türkiye', tz: 'Europe/Istanbul' },
  { city: 'Moscow', country: 'Russia', tz: 'Europe/Moscow' },
  { city: 'Kyiv', country: 'Ukraine', tz: 'Europe/Kyiv' },
  // Americas
  { city: 'New York', country: 'United States', tz: 'America/New_York' },
  { city: 'Boston', country: 'United States', tz: 'America/New_York' },
  { city: 'Washington', country: 'United States', tz: 'America/New_York' },
  { city: 'Miami', country: 'United States', tz: 'America/New_York' },
  { city: 'Atlanta', country: 'United States', tz: 'America/New_York' },
  { city: 'Toronto', country: 'Canada', tz: 'America/Toronto' },
  { city: 'Montreal', country: 'Canada', tz: 'America/Toronto' },
  { city: 'Chicago', country: 'United States', tz: 'America/Chicago' },
  { city: 'Houston', country: 'United States', tz: 'America/Chicago' },
  { city: 'Dallas', country: 'United States', tz: 'America/Chicago' },
  { city: 'Mexico City', country: 'Mexico', tz: 'America/Mexico_City' },
  { city: 'Denver', country: 'United States', tz: 'America/Denver' },
  { city: 'Phoenix', country: 'United States', tz: 'America/Phoenix' },
  { city: 'Los Angeles', country: 'United States', tz: 'America/Los_Angeles' },
  { city: 'San Francisco', country: 'United States', tz: 'America/Los_Angeles' },
  { city: 'Seattle', country: 'United States', tz: 'America/Los_Angeles' },
  { city: 'San Diego', country: 'United States', tz: 'America/Los_Angeles' },
  { city: 'Vancouver', country: 'Canada', tz: 'America/Vancouver' },
  { city: 'São Paulo', country: 'Brazil', tz: 'America/Sao_Paulo' },
  { city: 'Rio de Janeiro', country: 'Brazil', tz: 'America/Sao_Paulo' },
  { city: 'Buenos Aires', country: 'Argentina', tz: 'America/Argentina/Buenos_Aires' },
  { city: 'Santiago', country: 'Chile', tz: 'America/Santiago' },
  { city: 'Lima', country: 'Peru', tz: 'America/Lima' },
  { city: 'Bogotá', country: 'Colombia', tz: 'America/Bogota' },
  // Middle East & Africa
  { city: 'Dubai', country: 'UAE', tz: 'Asia/Dubai' },
  { city: 'Abu Dhabi', country: 'UAE', tz: 'Asia/Dubai' },
  { city: 'Doha', country: 'Qatar', tz: 'Asia/Qatar' },
  { city: 'Tel Aviv', country: 'Israel', tz: 'Asia/Jerusalem' },
  { city: 'Riyadh', country: 'Saudi Arabia', tz: 'Asia/Riyadh' },
  { city: 'Cairo', country: 'Egypt', tz: 'Africa/Cairo' },
  { city: 'Lagos', country: 'Nigeria', tz: 'Africa/Lagos' },
  { city: 'Nairobi', country: 'Kenya', tz: 'Africa/Nairobi' },
  { city: 'Johannesburg', country: 'South Africa', tz: 'Africa/Johannesburg' },
  { city: 'Cape Town', country: 'South Africa', tz: 'Africa/Johannesburg' },
  // Asia
  { city: 'Karachi', country: 'Pakistan', tz: 'Asia/Karachi' },
  { city: 'Mumbai', country: 'India', tz: 'Asia/Kolkata' },
  { city: 'Delhi', country: 'India', tz: 'Asia/Kolkata' },
  { city: 'Bangalore', country: 'India', tz: 'Asia/Kolkata' },
  { city: 'Dhaka', country: 'Bangladesh', tz: 'Asia/Dhaka' },
  { city: 'Bangkok', country: 'Thailand', tz: 'Asia/Bangkok' },
  { city: 'Singapore', country: 'Singapore', tz: 'Asia/Singapore' },
  { city: 'Kuala Lumpur', country: 'Malaysia', tz: 'Asia/Kuala_Lumpur' },
  { city: 'Jakarta', country: 'Indonesia', tz: 'Asia/Jakarta' },
  { city: 'Manila', country: 'Philippines', tz: 'Asia/Manila' },
  { city: 'Hong Kong', country: 'Hong Kong', tz: 'Asia/Hong_Kong' },
  { city: 'Shanghai', country: 'China', tz: 'Asia/Shanghai' },
  { city: 'Beijing', country: 'China', tz: 'Asia/Shanghai' },
  { city: 'Taipei', country: 'Taiwan', tz: 'Asia/Taipei' },
  { city: 'Seoul', country: 'South Korea', tz: 'Asia/Seoul' },
  { city: 'Tokyo', country: 'Japan', tz: 'Asia/Tokyo' },
  { city: 'Osaka', country: 'Japan', tz: 'Asia/Tokyo' },
  // Oceania
  { city: 'Sydney', country: 'Australia', tz: 'Australia/Sydney' },
  { city: 'Melbourne', country: 'Australia', tz: 'Australia/Melbourne' },
  { city: 'Brisbane', country: 'Australia', tz: 'Australia/Brisbane' },
  { city: 'Perth', country: 'Australia', tz: 'Australia/Perth' },
  { city: 'Auckland', country: 'New Zealand', tz: 'Pacific/Auckland' },
  { city: 'Wellington', country: 'New Zealand', tz: 'Pacific/Auckland' },
];

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

/** Best matches for a typed query — prefix hits first, then substring. Max `limit`. */
export function searchCities(query: string, limit = 6): City[] {
  const q = norm(query);
  if (!q) return [];
  const starts: City[] = [];
  const contains: City[] = [];
  for (const c of CITIES) {
    const n = norm(c.city);
    if (n.startsWith(q)) starts.push(c);
    else if (n.includes(q) || norm(c.country).includes(q)) contains.push(c);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
}

/** Exact-ish resolve of a free-typed city name to a known city (for recognising typed input). */
export function resolveCity(query: string): City | null {
  const q = norm(query);
  if (!q) return null;
  return CITIES.find((c) => norm(c.city) === q) ?? null;
}
