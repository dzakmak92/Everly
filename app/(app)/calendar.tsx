import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { ChevronLeft, ChevronRight } from '../../src/components/icons';
import { useData, ENTRY_META } from '../../src/lib/store';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const key = (y: number, m: number, d: number) => `${y}-${m}-${d}`;
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export default function CalendarTab() {
  const insets = useSafeAreaInsets();
  const { entries } = useData();

  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(key(now.getFullYear(), now.getMonth(), now.getDate()));

  // Days in the viewed month that have at least one entry.
  const daysWithEntries = new Set<string>();
  for (const e of entries) {
    const d = new Date(e.at);
    if (d.getFullYear() === view.y && d.getMonth() === view.m) daysWithEntries.add(key(d.getFullYear(), d.getMonth(), d.getDate()));
  }

  const firstWeekday = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = new Date(view.y, view.m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const todayKey = key(now.getFullYear(), now.getMonth(), now.getDate());

  const selectedEntries = entries
    .filter((e) => {
      const d = new Date(e.at);
      return key(d.getFullYear(), d.getMonth(), d.getDate()) === selected;
    });

  function shift(delta: number) {
    setView((v) => {
      const m = v.m + delta;
      if (m < 0) return { y: v.y - 1, m: 11 };
      if (m > 11) return { y: v.y + 1, m: 0 };
      return { y: v.y, m };
    });
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 28, paddingHorizontal: 22, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink }}>Calendar</Text>

      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16 }, shadow.card]}>
        {/* Month header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Pressable onPress={() => shift(-1)} hitSlop={10} style={{ padding: 4 }}>
            <ChevronLeft size={20} color={color.muted} />
          </Pressable>
          <Text style={{ fontFamily: font.display700, fontSize: 16, color: color.ink }}>{monthLabel}</Text>
          <Pressable onPress={() => shift(1)} hitSlop={10} style={{ padding: 4 }}>
            <ChevronRight size={20} color={color.muted} />
          </Pressable>
        </View>

        {/* Weekday header */}
        <View style={{ flexDirection: 'row' }}>
          {WEEKDAYS.map((w, i) => (
            <Text key={i} style={{ flex: 1, textAlign: 'center', fontFamily: font.body700, fontSize: 11, color: color.muted }}>
              {w}
            </Text>
          ))}
        </View>

        {/* Day grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {cells.map((d, i) => {
            if (d === null) return <View key={`e${i}`} style={{ width: `${100 / 7}%`, height: 44 }} />;
            const k = key(view.y, view.m, d);
            const isSel = k === selected;
            const isToday = k === todayKey;
            const has = daysWithEntries.has(k);
            return (
              <Pressable key={k} onPress={() => setSelected(k)} style={{ width: `${100 / 7}%`, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSel ? color.primary : 'transparent',
                    borderWidth: isToday && !isSel ? 1.5 : 0,
                    borderColor: color.primary,
                  }}
                >
                  <Text style={{ fontFamily: font.body600, fontSize: 14, color: isSel ? '#fff' : color.ink }}>{d}</Text>
                </View>
                <View style={{ width: 5, height: 5, borderRadius: 3, marginTop: 2, backgroundColor: has ? color.accentRose : 'transparent' }} />
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Selected-day entries */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>
          {selectedEntries.length} {selectedEntries.length === 1 ? 'entry' : 'entries'}
        </Text>
        {selectedEntries.length === 0 ? (
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 20, alignItems: 'center' }, shadow.card]}>
            <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.muted }}>No entries on this day.</Text>
          </View>
        ) : (
          selectedEntries.map((e) => {
            const m = ENTRY_META[e.kind];
            return (
              <View key={e.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: m.ink }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{m.label}</Text>
                  {e.note ? <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary, marginTop: 2 }}>{e.note}</Text> : null}
                </View>
                <Text style={{ fontFamily: font.body500, fontSize: 12, color: color.muted }}>{timeOf(e.at)}</Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
