import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button } from '../../src/components/forms';
import { useSupabase, signOut } from '../../src/lib/supabase';
import A12Settings from '../../src/screens/app/A12Settings';

/** Settings tab — the static design plus a real account section + sign out. */
export default function SettingsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, profile } = useSupabase();
  const [busy, setBusy] = useState(false);

  async function onSignOut() {
    setBusy(true);
    await signOut();
    setBusy(false);
    router.replace('/(auth)/welcome');
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Real account section */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 12 }}>
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, gap: 6 }, shadow.card]}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>
            Account
          </Text>
          <Text style={{ fontFamily: font.body600, fontSize: 16, color: color.ink }}>
            {profile?.name || session?.user?.email}
          </Text>
          <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.inkSecondary }}>
            {session?.user?.email}  ·  Plan: {profile?.plan ?? 'free'}
          </Text>
        </View>
      </View>

      {/* Static settings design */}
      <A12Settings embedded />

      <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
        <Button label="Sign out" variant="secondary" onPress={onSignOut} loading={busy} />
      </View>
    </ScrollView>
  );
}
