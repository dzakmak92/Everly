import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../../src/theme/tokens';
import { BabyBean, Heart, Clock, Activity, CheckCircle, User, Calendar, Star, Settings, Shield, Syringe, Camera, ChevronRight } from '../../../src/components/icons';

type Item = { label: string; sub: string; to: string; icon: React.ReactNode; bg: string };
const Ic = (C: any, c: string) => <C size={19} color={c} />;

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: 'Your journey',
    items: [
      { label: 'Pregnancy', sub: 'Week-by-week, appointments, names', to: '/(app)/pregnancy', icon: Ic(BabyBean, '#6B6FC9'), bg: '#E7E4FB' },
      { label: 'Mum&Me · You', sub: 'Recovery, mood check-ins, planning', to: '/(app)/maternal', icon: Ic(Heart, '#2C8475'), bg: '#D8F0E6' },
    ],
  },
  {
    title: 'Health & memories',
    items: [
      { label: 'Health records', sub: 'Vaccines, medications, growth', to: '/(app)/health', icon: Ic(Syringe, '#B04070'), bg: '#FBE0EA' },
      { label: 'Timeline', sub: 'Milestones & memories', to: '/(app)/timeline', icon: Ic(Camera, '#B5662E'), bg: '#FCE6D8' },
      { label: 'Insights', sub: 'Rhythm, patterns, weekly digest', to: '/(app)/insights', icon: Ic(Activity, '#2C8475'), bg: '#D8F0E6' },
    ],
  },
  {
    title: 'Family & home',
    items: [
      { label: 'Routines & chores', sub: 'Daily routines & chore points', to: '/(app)/routines', icon: Ic(CheckCircle, '#7A5C20'), bg: '#FBF1CE' },
      { label: 'Co-parent', sub: 'Custody schedule & shared expenses', to: '/(app)/coparent', icon: Ic(User, '#B04070'), bg: '#FBE0EA' },
      { label: 'Family timezones', sub: 'Keep distant family in sync', to: '/(app)/timezones', icon: Ic(Clock, '#2C5F90'), bg: '#DCEBFA' },
      { label: 'Kiosk mode', sub: 'A shared family wall display', to: '/(app)/kiosk', icon: Ic(Calendar, '#B5662E'), bg: '#FCE6D8' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Settings', sub: 'Account, data & privacy', to: '/(app)/settings', icon: Ic(Settings, '#6F6E86'), bg: '#EDECF5' },
      { label: 'Plans & billing', sub: 'Manage your subscription', to: '/(app)/plans', icon: Ic(Star, '#6B6FC9'), bg: '#E7E4FB' },
      { label: 'Admin', sub: 'Operator console', to: '/(app)/admin', icon: Ic(Shield, '#B04070'), bg: '#FBE0EA' },
    ],
  },
];

export default function More() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 20, gap: 22 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingHorizontal: 2 }}>
        <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>More</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted, marginTop: 4 }}>Everything else in Everly</Text>
      </View>

      {SECTIONS.map((sec) => (
        <View key={sec.title} style={{ gap: 10 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: color.muted, paddingLeft: 4 }}>{sec.title}</Text>
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, overflow: 'hidden' }, shadow.card]}>
            {sec.items.map((it, i) => (
              <Pressable
                key={it.label}
                onPress={() => router.push(it.to as any)}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: color.hairline, backgroundColor: pressed ? '#FAF9FE' : '#fff' })}
              >
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: it.bg, alignItems: 'center', justifyContent: 'center' }}>{it.icon}</View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.ink }}>{it.label}</Text>
                  <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, marginTop: 2 }} numberOfLines={1}>{it.sub}</Text>
                </View>
                <ChevronRight size={18} color={color.faint} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
