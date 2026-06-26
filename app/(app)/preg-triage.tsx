import React from 'react';
import { ScrollView, View, Text, Pressable, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { ChevronLeft, Phone } from '../../src/components/icons';
import { RED_FLAGS_CALL_NOW, RED_FLAGS_CALL_SOON } from '../../src/lib/pregnancy';

function call(num: string) {
  const url = `tel:${num}`;
  if (Platform.OS === 'web' && typeof window !== 'undefined') window.location.href = url;
  else Linking.openURL(url).catch(() => {});
}

export default function Triage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const Section = ({ title, tone, items }: { title: string; tone: 'now' | 'soon'; items: string[] }) => (
    <View style={{ backgroundColor: tone === 'now' ? '#FBE0EA' : '#FCE6D8', borderRadius: radius.card, padding: 16, gap: 8 }}>
      <Text style={{ fontFamily: font.body700, fontSize: 14, color: tone === 'now' ? color.roseInk : '#B5662E' }}>{title}</Text>
      {items.map((t) => (
        <View key={t} style={{ flexDirection: 'row', gap: 8 }}>
          <Text style={{ color: tone === 'now' ? color.roseInk : '#B5662E' }}>•</Text>
          <Text style={{ flex: 1, fontFamily: font.body500, fontSize: 13.5, color: color.ink, lineHeight: 19 }}>{t}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 14 }}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>When to call</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted, lineHeight: 19 }}>
        A triage guide, not medical advice. If in doubt, always contact your midwife or maternity unit — they would rather hear from you.
      </Text>

      <Section title="Call your maternity unit now" tone="now" items={RED_FLAGS_CALL_NOW} />
      <Section title="Call your midwife today" tone="soon" items={RED_FLAGS_CALL_SOON} />

      <Pressable onPress={() => call('112')} style={[{ backgroundColor: color.rose, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, shadow.pinkButton]}>
        <Phone size={18} color="#fff" />
        <Text style={{ fontFamily: font.body700, fontSize: 15, color: '#fff' }}>Call emergency services</Text>
      </Pressable>
      <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, textAlign: 'center' }}>
        Dials your local emergency number. Save your maternity unit's number in your phone for quick access.
      </Text>
    </ScrollView>
  );
}
