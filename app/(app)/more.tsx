import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { BabyBean, Heart, Plus, Clock, Activity, CheckCircle, User, MessageSquare, Calendar, Leaf, Star, Settings, Shield } from '../../src/components/icons';

type Item = { label: string; to: string; icon: React.ReactNode; bg: string };
const Ic = (C: any, c: string) => <C size={20} color={c} />;

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: 'Your journey',
    items: [
      { label: 'Pregnancy', to: '/(app)/pregnancy', icon: Ic(BabyBean, '#6B6FC9'), bg: '#E7E4FB' },
      { label: 'Mum&Me · You', to: '/(app)/maternal', icon: Ic(Heart, '#2C8475'), bg: '#D8F0E6' },
    ],
  },
  {
    title: 'Log & tools',
    items: [
      { label: 'Quick add', to: '/(app)/quick-add', icon: Ic(Plus, '#B5662E'), bg: '#FCE6D8' },
      { label: 'Night log', to: '/(app)/nightlog', icon: Ic(Clock, '#54579E'), bg: '#E7E4FB' },
      { label: 'Rhythm ring', to: '/(app)/rhythm', icon: Ic(Activity, '#2C8475'), bg: '#D8F0E6' },
      { label: 'Routines & chores', to: '/(app)/routines', icon: Ic(CheckCircle, '#7A5C20'), bg: '#FBF1CE' },
    ],
  },
  {
    title: 'Family',
    items: [
      { label: 'Co-parent', to: '/(app)/coparent', icon: Ic(User, '#B04070'), bg: '#FBE0EA' },
      { label: 'Family timezones', to: '/(app)/timezones', icon: Ic(Clock, '#2C5F90'), bg: '#DCEBFA' },
      { label: 'Weekly digest', to: '/(app)/digest', icon: Ic(MessageSquare, '#54579E'), bg: '#E7E4FB' },
      { label: 'Kiosk mode', to: '/(app)/kiosk', icon: Ic(Calendar, '#B5662E'), bg: '#FCE6D8' },
    ],
  },
  {
    title: 'Discover',
    items: [
      { label: 'Gentle insights', to: '/(app)/insights', icon: Ic(Leaf, '#2C8475'), bg: '#D8F0E6' },
      { label: 'Design gallery', to: '/gallery', icon: Ic(Star, '#C9A33B'), bg: '#FBF1CE' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Settings', to: '/(app)/settings', icon: Ic(Settings, '#6F6E86'), bg: '#EDECF5' },
      { label: 'Plans & billing', to: '/(app)/plans', icon: Ic(Star, '#6B6FC9'), bg: '#E7E4FB' },
      { label: 'Admin', to: '/(app)/admin', icon: Ic(Shield, '#B04070'), bg: '#FBE0EA' },
    ],
  },
];

export default function More() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 28, paddingHorizontal: 20, gap: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>More</Text>

      {SECTIONS.map((sec) => (
        <View key={sec.title} style={{ gap: 10 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted, paddingLeft: 2 }}>{sec.title}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {sec.items.map((it) => (
              <Pressable
                key={it.label}
                onPress={() => router.push(it.to as any)}
                style={({ pressed }) => [{ width: '47.5%', flexGrow: 1, backgroundColor: '#fff', borderRadius: radius.card, padding: 16, gap: 10, opacity: pressed ? 0.85 : 1 }, shadow.card]}
              >
                <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: it.bg, alignItems: 'center', justifyContent: 'center' }}>{it.icon}</View>
                <Text style={{ fontFamily: font.body700, fontSize: 14.5, color: color.ink }}>{it.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
