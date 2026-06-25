import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button } from '../../src/components/forms';
import { PremiumGate } from '../../src/components/PremiumGate';
import { useData, entriesOn, ENTRY_META, type EntryKind } from '../../src/lib/store';

const KINDS: EntryKind[] = ['feed', 'sleep', 'diaper', 'pump', 'note'];

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
  const lastOf = (k: EntryKind) => entries.find((e) => e.kind === k)?.at;

  const feedMl = today.filter((e) => e.kind === 'feed' || e.kind === 'pump').reduce((s, e) => s + (e.volumeMl ?? 0), 0);
  const sleepMin = today.filter((e) => e.kind === 'sleep').reduce((s, e) => s + (e.durationMin ?? 0), 0);
  const sleepH = Math.floor(sleepMin / 60), sleepRemM = sleepMin % 60;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 28, paddingHorizontal: 22, gap: 18 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink }}>Health Hub</Text>

      {/* Headline totals */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={[{ flex: 1, backgroundColor: '#fff', borderRadius: radius.card, padding: 16 }, shadow.card]}>
          <Text style={{ fontFamily: font.body600, fontSize: 12, color: color.muted }}>Volume today</Text>
          <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink, marginTop: 4 }}>{feedMl} ml</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted }}>feeds + pumps</Text>
        </View>
        <View style={[{ flex: 1, backgroundColor: '#fff', borderRadius: radius.card, padding: 16 }, shadow.card]}>
          <Text style={{ fontFamily: font.body600, fontSize: 12, color: color.muted }}>Sleep today</Text>
          <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink, marginTop: 4 }}>{sleepMin ? `${sleepH}h ${sleepRemM}m` : '—'}</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted }}>logged duration</Text>
        </View>
      </View>

      {/* Today's counts */}
      <View>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted, marginBottom: 10 }}>Today</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {KINDS.map((k) => {
            const m = ENTRY_META[k];
            return (
              <View key={k} style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 14, flexGrow: 1, minWidth: 100 }, shadow.card]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: m.ink }} />
                  <Text style={{ fontFamily: font.body600, fontSize: 12, color: color.inkSecondary }}>{m.label}</Text>
                </View>
                <Text style={{ fontFamily: font.display700, fontSize: 24, color: color.ink, marginTop: 4 }}>{countBy(today, k)}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted }}>last {sinceLabel(lastOf(k))}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 7-day */}
      <View>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted, marginBottom: 10 }}>Last 7 days</Text>
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 8 }, shadow.card]}>
          {KINDS.map((k, i) => {
            const m = ENTRY_META[k];
            return (
              <View key={k} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: color.hairline }}>
                <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: m.ink, marginRight: 12 }} />
                <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 14, color: color.ink }}>{m.label}</Text>
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.inkSecondary }}>{countBy(week, k)}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Premium-gated export */}
      <PremiumGate feature="Pediatrician PDF export">
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, gap: 10 }, shadow.card]}>
          <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>Pediatrician PDF export</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary }}>
            Export a health summary to share with your pediatrician. (Generation coming next.)
          </Text>
          <Button label="Generate PDF" variant="secondary" onPress={() => {}} />
        </View>
      </PremiumGate>

      <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, lineHeight: 18 }}>
        Computed on-device from your logged entries. Nothing here leaves your device.
      </Text>
    </ScrollView>
  );
}
