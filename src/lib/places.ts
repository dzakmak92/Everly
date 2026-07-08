/**
 * Lightweight place/address search (OpenStreetMap Nominatim) so users can pick
 * a real, precise location for an event or appointment instead of free-typing.
 * Only the query text is sent — never personal data. Falls back gracefully to
 * plain typed text when offline or the service is unreachable.
 */
export type Place = { name: string; lat: number; lon: number };

export async function searchPlace(q: string): Promise<Place[]> {
  const query = q.trim();
  if (query.length < 3) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=0&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Place search failed');
  const json = await res.json();
  if (!Array.isArray(json)) return [];
  return json
    .map((r: { display_name?: string; lat?: string; lon?: string }) => ({ name: String(r.display_name ?? ''), lat: parseFloat(r.lat ?? ''), lon: parseFloat(r.lon ?? '') }))
    .filter((p) => p.name && !Number.isNaN(p.lat) && !Number.isNaN(p.lon));
}

/** A precise maps link for a stored location string (drops a pin at that place). */
export const mapsLink = (location: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
