import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button } from '../../src/components/forms';
import { ChevronLeft } from '../../src/components/icons';

type Contraction = { id: string; start: number; end: number };

function dur(ms: number) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}
function clock(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** Contraction Timer — time each contraction and the interval between them. */
export default function Contractions() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [list, setList] = useState<Contraction[]>([]); // newest first
  const [activeStart, setActiveStart] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (activeStart) {
      timer.current = setInterval(() => setNow(Date.now()), 250);
      return () => { if (timer.current) clearInterval(timer.current); };
    }
  }, [activeStart]);

  function toggle() {
    if (activeStart) {
      const c: Contraction = { id: `${activeStart}`, start: activeStart, end: Date.now() };
      setList((prev) => [c, ...prev]);
      setActiveStart(null);
    } else {
      setActiveStart(Date.now());
      setNow(Date.now());
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}
    >
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
        <ChevronLeft size={24} color={color.ink} />
      </Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Contraction Timer</Text>

      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 24, alignItems: 'center', gap: 4 }, shadow.card]}>
        <Text style={{ fontFamily: font.display700, fontSize: 48, color: activeStart ? color.accentRose : color.muted }}>
          {activeStart ? dur(now - activeStart) : '—'}
        </Text>
        <Text style={{ fontFamily: font.body600, fontSize: 13, color: color.muted }}>
          {activeStart ? 'contraction in progress' : 'tap start when one begins'}
        </Text>
      </View>

      <Pressable onPress={toggle} style={({ pressed }) => [{ backgroundColor: activeStart ? color.rose : color.primary, borderRadius: 24, paddingVertical: 22, alignItems: 'center', opacity: pressed ? 0.85 : 1 }, shadow.periwinkleButton]}>
        <Text style={{ fontFamily: font.body700, fontSize: 18, color: '#fff' }}>{activeStart ? 'Stop' : 'Start'}</Text>
      </Pressable>

      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>
          {list.length} recorded
        </Text>
        {list.map((c, i) => {
          const prev = list[i + 1];
          const interval = prev ? c.start - prev.start : null;
          return (
            <View key={c.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center' }, shadow.card]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{dur(c.end - c.start)}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>started {clock(c.start)}</Text>
              </View>
              {interval != null && (
                <Text style={{ fontFamily: font.body500, fontSize: 12, color: color.inkSecondary }}>
                  {dur(interval)} apart
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
