import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button } from '../../src/components/forms';
import { Logo } from '../../src/components/Logo';
import { ChevronRight } from '../../src/components/icons';
import { useSupabase, signOut } from '../../src/lib/supabase';

/**
 * Authenticated home (Phase 1). Confirms the real account session end-to-end;
 * Phase 2 replaces this with the full tabbed app shell.
 */
export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, profile, config } = useSupabase();
  const [busy, setBusy] = useState(false);

  const name = profile?.name || session?.user?.email?.split('@')[0] || 'there';
  const plan = profile?.plan ?? 'free';

  async function onSignOut() {
    setBusy(true);
    await signOut();
    setBusy(false);
    router.replace('/(auth)/welcome');
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32, paddingHorizontal: 24, gap: 18 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Logo width={26} height={30} color={color.primary} />
        <Text style={{ fontFamily: font.display700, fontSize: 22, color: color.ink }}>Everly</Text>
      </View>

      <View>
        <Text style={{ fontFamily: font.body500, fontSize: 15, color: color.muted }}>Welcome back,</Text>
        <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>{name}</Text>
      </View>

      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, gap: 6 }, shadow.card]}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>
          Your account
        </Text>
        <Text style={{ fontFamily: font.body600, fontSize: 15, color: color.ink }}>{session?.user?.email}</Text>
        <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.inkSecondary }}>
          Plan: {plan}  ·  Trial: {config.trialDays} days
        </Text>
      </View>

      <Text style={{ fontFamily: font.body400, fontSize: 14, color: color.inkSecondary, lineHeight: 21 }}>
        You're signed in to a real Everly account. The full tabbed app (Today,
        Calendar, Health, Timeline, Settings) is being built next.
      </Text>

      <Pressable onPress={() => router.push('/gallery')}>
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.display700, fontSize: 16, color: color.ink }}>Design gallery</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, marginTop: 3 }}>
              Browse all recreated screens
            </Text>
          </View>
          <ChevronRight size={18} color={color.faint} />
        </View>
      </Pressable>

      <Button label="Sign out" variant="secondary" onPress={onSignOut} loading={busy} />
    </ScrollView>
  );
}
