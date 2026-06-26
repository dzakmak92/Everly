import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, childToken } from '../../src/theme/tokens';
import { ChevronLeft, ChevronRight } from '../../src/components/icons';
import { useData } from '../../src/lib/store';
import { useEntitlement } from '../../src/lib/entitlement';
import { gestFromDueDate } from '../../src/lib/pregnancy';
import { ageLabel, stageFrom, STAGE_LABEL } from '../../src/lib/age';

export default function MatAgain() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dueDate, children } = useData();
  const { isPremium } = useEntitlement();
  const gest = gestFromDueDate(dueDate ?? undefined);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Two journeys, side by side</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>A new pregnancy runs free alongside your children's tracking — no conflict.</Text>

      {/* You / pregnancy */}
      <Pressable onPress={() => router.push('/(app)/pregnancy')}>
        <View style={[{ backgroundColor: color.maternalTeal, borderRadius: radius.card, padding: 18 }, shadow.card]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontFamily: font.body600, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>YOU · Free forever</Text>
              <Text style={{ fontFamily: font.display700, fontSize: 22, color: '#fff', marginTop: 2 }}>
                {gest ? `Pregnant · Week ${gest.week}` : 'Set up your pregnancy'}
              </Text>
              {gest && <Text style={{ fontFamily: font.body500, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>{gest.daysToGo} days to go</Text>}
            </View>
            <ChevronRight size={20} color="#fff" />
          </View>
        </View>
      </Pressable>

      {/* Children */}
      <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Your children</Text>
      {children.length === 0 ? (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, alignItems: 'center' }, shadow.card]}>
          <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>No children added yet.</Text>
        </View>
      ) : children.map((ch) => {
        const t = childToken[ch.color];
        return (
          <Pressable key={ch.id} onPress={() => router.push(`/(app)/child/${ch.id}` as any)}>
            <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.fill, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: font.display700, fontSize: 18, color: t.stroke }}>{ch.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 16, color: color.ink }}>{ch.name}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>{ch.birthDate ? `${ageLabel(ch.birthDate)} · ${STAGE_LABEL[stageFrom(ch.birthDate)]}` : 'Tap to view'}</Text>
              </View>
              <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: isPremium ? '#E7E4FB' : color.canvas }}>
                <Text style={{ fontFamily: font.body700, fontSize: 10, color: isPremium ? color.primary : color.muted }}>{isPremium ? 'PRO' : 'FREE'}</Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
