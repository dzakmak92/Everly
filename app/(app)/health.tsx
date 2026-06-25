import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { useData, entriesOn, ENTRY_META, type EntryKind } from '../../src/lib/store';

const KINDS: EntryKind[] = ['sleep', 'feed', 'diaper', 'note'];

function sinceLabel(iso?: string) {
  if (!iso) return '—';
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.round(hrs / 24)} d ago`;
}

export default function HealthTab() {
  const insets = useSafeAreaInsets();
  const { entries } = useData();

  const today = entriesOn(entries);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const week = entries.filter((e) => new Date(e.at).getTime() >= weekAgo);

  const countBy = (list: typeof entries, k: EntryKind) => list.filter((e) => e.kind === k).length;
  const lastOf = (k: EntryKind) => entries.find((e) => e.kind === k)?.at; // entries are newest-first

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 28, paddingHorizontal: 22, gap: 18 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink }}>Health Hub</Text>

      {/* Today's totals */}
      <View>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted, marginBottom: 10 }}>
          Today
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {KINDS.map((k) => {
            const m = ENTRY_META[k];
            return (
              <View key={k} style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, flexGrow: 1, minWidth: 140 }, shadow.card]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: m.ink }} />
                  <Text style={{ fontFamily: font.body600, fontSize: 13, color: color.inkSecondary }}>{m.label}</Text>
                </View>
                <Text style={{ fontFamily: font.display700, fontSize: 30, color: color.ink, marginTop: 6 }}>{countBy(today, k)}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>last {sinceLabel(lastOf(k))}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 7-day summary */}
      <View>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted, marginBottom: 10 }}>
          Last 7 days
        </Text>
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 8 }, shadow.card]}>
          {KINDS.map((k, i) => {
            const m = ENTRY_META[k];
            const n = countBy(week, k);
            return (
              <View
                key={k}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: color.hairline,
                }}
              >
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: m.ink, marginRight: 12 }} />
                <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 14, color: color.ink }}>{m.label}</Text>
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.inkSecondary }}>{n}</Text>
              </View>
            );
          })}
        </View>
        <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 10, lineHeight: 18 }}>
          Computed on-device from your logged entries. Nothing here leaves your device.
        </Text>
      </View>
    </ScrollView>
  );
}
