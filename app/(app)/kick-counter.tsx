import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button } from '../../src/components/forms';
import { ChevronLeft } from '../../src/components/icons';

const TARGET = 10;

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/** Kick Counter — count fetal movements toward a target of 10. */
export default function KickCounter() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [kicks, setKicks] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (startedAt && kicks < TARGET) {
      timer.current = setInterval(() => setNow(Date.now()), 1000);
      return () => { if (timer.current) clearInterval(timer.current); };
    }
  }, [startedAt, kicks]);

  function record() {
    if (kicks >= TARGET) return;
    if (!startedAt) setStartedAt(Date.now());
    setKicks((k) => k + 1);
  }
  function reset() {
    setKicks(0);
    setStartedAt(null);
    setNow(Date.now());
  }

  const elapsed = startedAt ? now - startedAt : 0;
  const done = kicks >= TARGET;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 18 }}
    >
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
        <ChevronLeft size={24} color={color.ink} />
      </Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Kick Counter</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 14, color: color.inkSecondary }}>
        Tap each time you feel a movement. Most people reach {TARGET} within two hours.
      </Text>

      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 24, alignItems: 'center', gap: 6 }, shadow.card]}>
        <Text style={{ fontFamily: font.display700, fontSize: 64, color: color.primary }}>{kicks}</Text>
        <Text style={{ fontFamily: font.body600, fontSize: 14, color: color.muted }}>of {TARGET} movements</Text>
        <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.inkSecondary, marginTop: 4 }}>
          {startedAt ? `Elapsed ${fmt(elapsed)}` : 'Not started'}
        </Text>
      </View>

      {done ? (
        <View style={[{ backgroundColor: '#D8F0E6', borderRadius: radius.card, padding: 18, alignItems: 'center' }]}>
          <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.tealInk }}>
            {TARGET} movements in {fmt(elapsed)} — nicely done.
          </Text>
        </View>
      ) : (
        <Pressable onPress={record} style={({ pressed }) => [{ backgroundColor: color.accentRose, borderRadius: 28, paddingVertical: 28, alignItems: 'center', opacity: pressed ? 0.85 : 1 }, shadow.pinkButton]}>
          <Text style={{ fontFamily: font.body700, fontSize: 20, color: '#fff' }}>Record a kick</Text>
        </Pressable>
      )}

      <Button label="Reset" variant="secondary" onPress={reset} />
    </ScrollView>
  );
}
