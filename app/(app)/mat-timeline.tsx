import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { ChevronLeft } from '../../src/components/icons';
import { useData } from '../../src/lib/store';
import { BAND_LABEL, type EpdsBand } from '../../src/lib/epds';

const d = (s: string) => new Date(s.length <= 10 ? `${s}T00:00:00` : s).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

export default function MatTimeline() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lastPeriod, dueDate, maternalBirth, epdsResults, recoveryLogs } = useData();

  type Ev = { at: string; title: string; sub?: string };
  const evs: Ev[] = [];
  if (lastPeriod) evs.push({ at: lastPeriod, title: 'Preconception', sub: 'Started trying / cycle tracking' });
  if (dueDate) evs.push({ at: new Date(new Date(`${dueDate}T00:00:00`).getTime() - 280 * 86400000).toISOString(), title: 'Pregnancy began', sub: `Due ${dueDate}` });
  if (maternalBirth) evs.push({ at: maternalBirth, title: 'Baby born', sub: 'Welcome to the world' });
  epdsResults.forEach((r) => evs.push({ at: r.at, title: 'Wellbeing check-in', sub: `${r.total}/30 · ${BAND_LABEL[r.band as EpdsBand]}` }));
  if (recoveryLogs.length) evs.push({ at: recoveryLogs[recoveryLogs.length - 1].at, title: 'Recovery tracking began', sub: `${recoveryLogs.length} entries logged` });
  evs.sort((a, b) => b.at.localeCompare(a.at));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Your story</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>Built from your own milestones — preconception to now.</Text>

      {evs.length === 0 ? (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, alignItems: 'center' }, shadow.card]}>
          <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.muted, textAlign: 'center' }}>Your timeline fills in as you track your cycle, pregnancy, birth and recovery.</Text>
        </View>
      ) : evs.map((e, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color.maternalTeal }} />
            {i < evs.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: color.hairline, marginTop: 2 }} />}
          </View>
          <View style={[{ flex: 1, backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, marginBottom: 6 }, shadow.card]}>
            <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{e.title}</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>{d(e.at)}{e.sub ? ` · ${e.sub}` : ''}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
