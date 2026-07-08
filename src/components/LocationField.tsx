import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { color, font, radius } from '../theme/tokens';
import { searchPlace, type Place } from '../lib/places';

/**
 * Location input with live address search (Nominatim). Typing shows real place
 * suggestions; picking one stores its full address so the map pin is precise.
 * If the search is unreachable, it still works as a plain text field.
 */
export function LocationField({ label = 'Location', value, onChange, placeholder }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [results, setResults] = useState<Place[]>([]);
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skip = useRef(false); // don't re-search the value we just picked

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

  const pick = (p: Place) => { skip.current = true; onChange(p.name); setResults([]); setFocused(false); };

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
    </View>
  );
}
