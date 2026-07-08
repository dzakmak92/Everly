import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { color, font, radius } from '../theme/tokens';
import { searchPlace, reverseGeocode, type Place } from '../lib/places';
import MapPicker from './MapPicker';

/**
 * Location input with live address search + an inline interactive map. Type to
 * get real place suggestions, or tap/drag the pin on the map to pick the exact
 * spot (reverse-geocoded to an address). Stores the address string so the map
 * pin is precise; degrades to a plain text field when the search is offline.
 */
export function LocationField({ label = 'Location', value, onChange, placeholder, defaultCenter }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string;
  defaultCenter?: { lat: number; lon: number };
}) {
  const [results, setResults] = useState<Place[]>([]);
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);
  const [center, setCenter] = useState<{ lat: number; lon: number }>(defaultCenter ?? { lat: 51.5074, lon: -0.1278 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skip = useRef(false); // don't re-search a value we just set
  const geocodedInitial = useRef(false);

  // search-as-you-type
  useEffect(() => {
    if (skip.current) { skip.current = false; return; }
    if (timer.current) clearTimeout(timer.current);
    if (!focused || value.trim().length < 3) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setBusy(true);
      try { setResults(await searchPlace(value)); } catch { setResults([]); }
      finally { setBusy(false); }
    }, 450);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [value, focused]);

  // if editing an event that already has a location, centre the map on it once
  useEffect(() => {
    if (geocodedInitial.current || !value.trim()) return;
    geocodedInitial.current = true;
    searchPlace(value).then((rs) => { if (rs[0]) setCenter({ lat: rs[0].lat, lon: rs[0].lon }); }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (p: Place) => { skip.current = true; onChange(p.name); setResults([]); setFocused(false); setCenter({ lat: p.lat, lon: p.lon }); };
  const onMapPick = (lat: number, lon: number) => { reverseGeocode(lat, lon).then((addr) => { if (addr) { skip.current = true; onChange(addr); } }).catch(() => {}); };

  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.inkSecondary }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: radius.tile, borderWidth: 1, borderColor: color.hairline, paddingHorizontal: 12 }}>
        <Text style={{ fontSize: 15 }}>📍</Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 250)}
          placeholder={placeholder ?? 'Search a place or address'}
          placeholderTextColor={color.faint}
          style={{ flex: 1, fontFamily: font.body500, fontSize: 14, color: color.ink, paddingVertical: 12 }}
        />
        {busy ? <ActivityIndicator size="small" color={color.primary} /> : null}
      </View>
      {focused && results.length > 0 && (
        <View style={{ backgroundColor: '#fff', borderRadius: radius.tile, borderWidth: 1, borderColor: color.hairline, overflow: 'hidden' }}>
          {results.map((p, i) => (
            <Pressable key={`${p.lat},${p.lon},${i}`} onPress={() => pick(p)} style={{ paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: i ? 1 : 0, borderTopColor: color.hairline }}>
              <Text numberOfLines={2} style={{ fontFamily: font.body500, fontSize: 12.5, color: color.ink }}>{p.name}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {/* inline interactive map */}
      <View style={{ marginTop: 2, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: color.hairline }}>
        <MapPicker lat={center.lat} lon={center.lon} height={260} onPick={onMapPick} />
      </View>
      <Text style={{ fontFamily: font.body500, fontSize: 10.5, color: color.muted, textAlign: 'center' }}>Tap or drag the pin to set the exact spot.</Text>
    </View>
  );
}
