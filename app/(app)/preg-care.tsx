import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { ChevronLeft } from '../../src/components/icons';
import { useData, type PregStatus } from '../../src/lib/store';
import { CRISIS_RESOURCES } from '../../src/lib/epds';

const STATUS: { key: PregStatus; label: string; desc: string }[] = [
  { key: 'active', label: 'Active', desc: 'Tracking as normal.' },
  { key: 'paused', label: 'Paused', desc: 'Pause reminders and trackers, keep your data.' },
  { key: 'archived', label: 'Archived', desc: 'Move this pregnancy to a quiet, retrievable archive.' },
];

export default function PregCare() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pregStatus, setPregStatus } = useData();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>We're here with you</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 14, color: color.inkSecondary, lineHeight: 21 }}>
        However your journey unfolds, Everly adapts around you. These options are always free and private to your device.
      </Text>

      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>This pregnancy</Text>
        {STATUS.map((s) => {
          const sel = s.key === pregStatus;
          return (
            <Pressable key={s.key} onPress={() => setPregStatus(s.key)} style={[{ backgroundColor: sel ? color.maternalTeal : '#fff', borderRadius: radius.card, padding: 16 }, shadow.card]}>
              <Text style={{ fontFamily: font.body700, fontSize: 15, color: sel ? '#fff' : color.ink }}>{s.label}{sel ? ' ·  current' : ''}</Text>
              <Text style={{ fontFamily: font.body400, fontSize: 13, color: sel ? 'rgba(255,255,255,0.9)' : color.inkSecondary, marginTop: 2 }}>{s.desc}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ backgroundColor: '#FBE0EA', borderRadius: radius.card, padding: 18, gap: 8 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.roseInk }}>Support, any time</Text>
        {CRISIS_RESOURCES.map((r) => (
          <View key={r.name}>
            <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>{r.name}</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.inkSecondary }}>{r.detail}</Text>
          </View>
        ))}
      </View>

      <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, lineHeight: 18 }}>
        Crisis resources are general defaults — add your local services in a future update. Everly never monetises these pages.
      </Text>
    </ScrollView>
  );
}
