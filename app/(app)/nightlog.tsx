import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, radius } from '../../src/theme/tokens';
import { ChevronLeft, Clock, Bottle } from '../../src/components/icons';
import { useData, entriesOn, entryDetail, type Entry, type EntryKind } from '../../src/lib/store';

/* ── small inline glyphs (design fidelity; no new icon imports) ─────────── */
function Moon({ size = 18, color: c = '#9C9AB2' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </Svg>
  );
}
function DiaperGlyph({ size = 28, color: c }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 8l4-4 4 4 4-4 4 4v8l-4 4-4-4-4 4-4-4V8z" />
    </Svg>
  );
}
function Drop({ size = 28, color: c }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </Svg>
  );
}

type TileDef = { kind: EntryKind; label: string; tint: string; render: (c: string) => React.ReactNode };
const TILES: TileDef[] = [
  { kind: 'feed', label: 'Feed', tint: '#3FA98A', render: (c) => <Bottle size={28} color={c} /> },
  { kind: 'sleep', label: 'Sleep', tint: '#B8B4F0', render: (c) => <Moon size={28} color={c} /> },
  { kind: 'diaper', label: 'Diaper', tint: '#D9B84A', render: (c) => <DiaperGlyph color={c} /> },
  { kind: 'pump', label: 'Pump', tint: '#E98FB3', render: (c) => <Drop color={c} /> },
];

function clockTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).toLowerCase();
}

/** Age string like "4 mo" / "2 yr" from an ISO birthDate. */
function ageLabel(birthDate?: string): string | null {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (isNaN(b.getTime())) return null;
  const months = Math.max(0, Math.floor((Date.now() - b.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
  if (months < 24) return `${months} mo`;
  return `${Math.floor(months / 12)} yr`;
}

/** Per-tile subtitle from the most recent entry of that kind (empty-state safe). */
function tileSubtitle(kind: EntryKind, latest: Entry | undefined, sleepMin: number, pumpMl: number): string {
  if (kind === 'sleep') return sleepMin > 0 ? `${Math.floor(sleepMin / 60)}h ${sleepMin % 60}m today` : 'No sleep logged';
  if (kind === 'pump') return pumpMl > 0 ? `${pumpMl} ml stash` : 'No pump logged';
  if (!latest) return 'Tap to log';
  if (kind === 'feed') {
    const detail = entryDetail(latest);
    return detail ? `${clockTime(latest.at)} · ${detail}` : clockTime(latest.at);
  }
  if (kind === 'diaper') {
    const type = latest.diaperType === 'both' ? 'Wet + dirty' : latest.diaperType === 'dirty' ? 'Dirty' : 'Wet';
    return `${type} · ${clockTime(latest.at)}`;
  }
  return 'Tap to log';
}

/** Night Log — low-light one-tap logger (A03 dark / A14 light). */
export default function NightLog() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entries, addEntry, activeChild } = useData();
  const [dark, setDark] = useState(true);

  const today = entriesOn(entries);
  const feeds = today.filter((e) => e.kind === 'feed').length;
  const sleepMin = today.filter((e) => e.kind === 'sleep').reduce((s, e) => s + (e.durationMin ?? 0), 0);
  const wet = today.filter((e) => e.kind === 'diaper').length;
  const ml = today.filter((e) => e.kind === 'feed' || e.kind === 'pump').reduce((s, e) => s + (e.volumeMl ?? 0), 0);
  const pumpMl = today.filter((e) => e.kind === 'pump').reduce((s, e) => s + (e.volumeMl ?? 0), 0);

  // entries is newest-first, so find() gives the most recent of each kind.
  const latestByKind = (k: EntryKind) => entries.find((e) => e.kind === k);
  const lastSleep = latestByKind('sleep');

  // Wake window: derive "next nap" from the last sleep entry (~2h wake window).
  const WAKE_WINDOW_MIN = 120;
  let wakeText = 'Log a sleep to start';
  let wakeActive = false;
  if (lastSleep) {
    const sinceMin = Math.round((Date.now() - new Date(lastSleep.at).getTime()) / 60000);
    const remaining = WAKE_WINDOW_MIN - sinceMin;
    if (remaining > 0) {
      wakeText = `Next nap in ~${remaining} min`;
      wakeActive = true;
    } else {
      wakeText = `Nap window open · ${Math.abs(remaining)} min over`;
      wakeActive = true;
    }
  }

  // theme
  const bg = dark ? color.nightBg : color.canvas;
  const card = dark ? color.nightCard : '#fff';
  const ink = dark ? color.nightText : color.ink;
  const sub = dark ? '#6F6E86' : color.muted;
  const chipMuted = dark ? '#6F6E86' : color.muted;
  const divider = dark ? 'rgba(255,255,255,0.07)' : color.hairline;

  const childName = activeChild?.name ?? 'Baby';
  const age = ageLabel(activeChild?.birthDate);

  function logOne(kind: EntryKind) {
    if (kind === 'diaper') addEntry('diaper', { diaperType: 'wet' });
    else addEntry(kind);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 18 }}
    >
      {/* top row: back + day/night toggle */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
          <ChevronLeft size={24} color={ink} />
        </Pressable>
        <Pressable
          onPress={() => setDark((d) => !d)}
          style={{
            paddingVertical: 7,
            paddingHorizontal: 13,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: dark ? 'rgba(237,235,250,0.25)' : color.hairline,
          }}
        >
          <Text style={{ fontFamily: font.body700, fontSize: 12, color: chipMuted }}>{dark ? '☾ Night' : '☀ Day'}</Text>
        </Pressable>
      </View>

      {/* title: moon + "Night log" + child chip */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Moon size={20} color={dark ? '#9C9AB2' : color.muted} />
        <Text style={{ fontFamily: font.display700, fontSize: 22, color: ink }}>Night log</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 13, color: chipMuted, marginLeft: 'auto' }}>
          {childName}{age ? ` · ${age}` : ''}
        </Text>
      </View>

      {/* wake-window banner */}
      <LinearGradient
        colors={['#5A5EB8', '#7B7FCC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ borderRadius: radius.tile, paddingVertical: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}
      >
        <Clock size={22} color="#fff" />
        <View style={{ flexShrink: 1 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 15, color: '#fff' }}>Wake window</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 13, lineHeight: 18, color: 'rgba(255,255,255,0.78)', marginTop: 3 }}>{wakeText}</Text>
        </View>
        {wakeActive && (
          <View style={{ marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: 12 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 11, color: '#fff' }}>Active</Text>
          </View>
        )}
      </LinearGradient>

      {/* 2×2 log tiles */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {TILES.map((t) => (
          <Pressable
            key={t.kind}
            onPress={() => logOne(t.kind)}
            style={({ pressed }) => [
              {
                width: '47%',
                flexGrow: 1,
                backgroundColor: card,
                borderRadius: radius.cardSm,
                paddingVertical: 24,
                paddingHorizontal: 16,
                alignItems: 'center',
                gap: 10,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View style={{ height: 30, justifyContent: 'center' }}>{t.render(t.tint)}</View>
            <Text style={{ fontFamily: font.display700, fontSize: 16, color: ink }}>{t.label}</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 12, color: sub }}>
              {tileSubtitle(t.kind, latestByKind(t.kind), sleepMin, pumpMl)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* tally row */}
      <View
        style={{
          backgroundColor: card,
          borderRadius: radius.tile,
          paddingVertical: 16,
          paddingHorizontal: 10,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        {([
          ['Feeds', `${feeds}`],
          ['Sleep', `${Math.floor(sleepMin / 60)}h`],
          ['Wet', `${wet}`],
          ['ml', `${ml}`],
        ] as const).map(([label, value], i) => (
          <React.Fragment key={label}>
            {i > 0 && <View style={{ width: 1, height: 28, backgroundColor: divider }} />}
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontFamily: font.display700, fontSize: 20, color: ink }}>{value}</Text>
              <Text style={{ fontFamily: font.body400, fontSize: 10, color: sub, marginTop: 4, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                {label}
              </Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      <Text style={{ fontFamily: font.body400, fontSize: 12, color: sub, lineHeight: 18 }}>
        One-tap logging uses sensible defaults (feed/sleep without details, wet diaper). Edit any entry from the Today tab.
      </Text>
    </ScrollView>
  );
}
