import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { ChevronLeft, ChevronRight } from '../../src/components/icons';
import { useData } from '../../src/lib/store';
import { gestFromDueDate, weekContent, TRIMESTER_TIPS } from '../../src/lib/pregnancy';
import { useUnits } from '../../src/lib/units';

type Tab = 'baby' | 'body' | 'nutrition';

export default function PregWeek() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const u = useUnits();
  const { dueDate } = useData();
  const gest = gestFromDueDate(dueDate ?? undefined);
  const [week, setWeek] = useState(gest?.week ?? 12);
  const [tab, setTab] = useState<Tab>('baby');

  const content = weekContent(week);
  const trimester: 1 | 2 | 3 = week < 13 ? 1 : week < 27 ? 2 : 3;
  const tips = TRIMESTER_TIPS[trimester];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>

      {/* Week pager */}
      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18 }, shadow.card]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable onPress={() => setWeek((w) => Math.max(1, w - 1))} hitSlop={10}><ChevronLeft size={22} color={color.muted} /></Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: font.display700, fontSize: 24, color: color.ink }}>Week {week}</Text>
            <Text style={{ fontFamily: font.body500, fontSize: 12, color: color.muted }}>of 40 · Trimester {trimester}</Text>
          </View>
          <Pressable onPress={() => setWeek((w) => Math.min(42, w + 1))} hitSlop={10}><ChevronRight size={22} color={color.muted} /></Pressable>
        </View>
        {gest != null && week !== gest.week && (
          <Pressable onPress={() => setWeek(gest.week)} hitSlop={8} style={{ alignSelf: 'center', marginTop: 10 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.maternalTeal }}>Back to my week (Week {gest.week})</Text>
          </Pressable>
        )}
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: radius.pill, padding: 4, ...shadow.row }}>
        {(['baby', 'body', 'nutrition'] as Tab[]).map((t) => {
          const sel = t === tab;
          return (
            <Pressable key={t} onPress={() => setTab(t)} style={{ flex: 1, paddingVertical: 9, borderRadius: radius.pill, alignItems: 'center', backgroundColor: sel ? color.maternalTeal : 'transparent' }}>
              <Text style={{ fontFamily: font.body700, fontSize: 13, color: sel ? '#fff' : color.muted, textTransform: 'capitalize' }}>{t === 'body' ? 'Your body' : t}</Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'baby' ? (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18 }, shadow.card]}>
          <Text style={{ fontFamily: font.display700, fontSize: 20, color: color.ink }}>Size of a {content.size.toLowerCase()}</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary, marginTop: 2 }}>
            {content.lengthCm > 0 ? `~${u.fmtLength(content.lengthCm, 0)}` : ''}{content.weightG > 0 ? ` · ~${u.fmtBabyWeight(content.weightG)}` : ''}
          </Text>
          <Text style={{ fontFamily: font.body400, fontSize: 14, color: color.inkSecondary, marginTop: 8, lineHeight: 20 }}>{content.note}</Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {(tab === 'body' ? tips.body : tips.nutrition).map((t, i) => (
            <View key={i} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', gap: 10 }, shadow.card]}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color.maternalTeal, marginTop: 6 }} />
              <Text style={{ flex: 1, fontFamily: font.body500, fontSize: 14, color: color.ink, lineHeight: 20 }}>{t}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
