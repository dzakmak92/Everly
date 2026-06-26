import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius } from '../../src/theme/tokens';
import { ChevronLeft } from '../../src/components/icons';
import { useData, entriesOn, type EntryKind } from '../../src/lib/store';

const TILES: { kind: EntryKind; label: string }[] = [
  { kind: 'feed', label: 'Feed' },
  { kind: 'sleep', label: 'Sleep' },
  { kind: 'diaper', label: 'Diaper' },
  { kind: 'pump', label: 'Pump' },
];

function ago(iso?: string) {
  if (!iso) return '—';
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ${m % 60}m ago`;
}

/** Night Log — low-light one-tap logger (A03 dark / A14 light). */
export default function NightLog() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entries, addEntry } = useData();
  const [dark, setDark] = useState(true);

  const today = entriesOn(entries);
  const feeds = today.filter((e) => e.kind === 'feed').length;
  const sleepMin = today.filter((e) => e.kind === 'sleep').reduce((s, e) => s + (e.durationMin ?? 0), 0);
  const wet = today.filter((e) => e.kind === 'diaper').length;
  const ml = today.filter((e) => e.kind === 'feed' || e.kind === 'pump').reduce((s, e) => s + (e.volumeMl ?? 0), 0);
  const lastSleep = entries.find((e) => e.kind === 'sleep');

  const bg = dark ? color.nightBg : color.canvas;
  const card = dark ? color.nightCard : '#fff';
  const ink = dark ? color.nightText : color.ink;
  const sub = dark ? 'rgba(237,235,250,0.6)' : color.muted;
  const now = new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  function logOne(kind: EntryKind) {
    if (kind === 'diaper') addEntry('diaper', { diaperType: 'wet' });
    else addEntry(kind);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={ink} /></Pressable>
        <Pressable onPress={() => setDark((d) => !d)} style={{ paddingVertical: 7, paddingHorizontal: 13, borderRadius: radius.pill, borderWidth: 1, borderColor: dark ? 'rgba(237,235,250,0.25)' : color.hairline }}>
          <Text style={{ fontFamily: font.body700, fontSize: 12, color: sub }}>{dark ? '☾ Night' : '☀ Day'}</Text>
        </Pressable>
      </View>

      <View>
        <Text style={{ fontFamily: font.display700, fontSize: 40, color: ink }}>{now}</Text>
        <Text style={{ fontFamily: font.body500, fontSize: 13, color: sub, marginTop: 2 }}>Last sleep {ago(lastSleep?.at)} · tap to log in one touch</Text>
      </View>

      {/* 2x2 tiles */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {TILES.map((t) => (
          <Pressable key={t.kind} onPress={() => logOne(t.kind)} style={({ pressed }) => [{ width: '47%', flexGrow: 1, backgroundColor: card, borderRadius: radius.card, paddingVertical: 26, alignItems: 'center', opacity: pressed ? 0.7 : 1 }]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: ink }}>+ {t.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Tally */}
      <View style={{ backgroundColor: card, borderRadius: radius.card, padding: 18, flexDirection: 'row', justifyContent: 'space-around' }}>
        {[['Feeds', `${feeds}`], ['Sleep', `${Math.floor(sleepMin / 60)}h`], ['Diapers', `${wet}`], ['Volume', `${ml}ml`]].map(([l, v]) => (
          <View key={l} style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: font.display700, fontSize: 20, color: ink }}>{v}</Text>
            <Text style={{ fontFamily: font.body500, fontSize: 11, color: sub, marginTop: 2 }}>{l}</Text>
          </View>
        ))}
      </View>

      <Text style={{ fontFamily: font.body400, fontSize: 12, color: sub, lineHeight: 18 }}>
        One-tap logging uses sensible defaults (feed/sleep without details, wet diaper). Edit any entry from the Today tab.
      </Text>
    </ScrollView>
  );
}
