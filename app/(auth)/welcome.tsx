import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font } from '../../src/theme/tokens';
import { Logo } from '../../src/components/Logo';
import { Button } from '../../src/components/forms';
import { FreeForeverPill } from '../../src/components/ui';

/** Branded landing for signed-out users — entry into sign in / create account. */
export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: color.canvas,
        paddingTop: insets.top + 48,
        paddingBottom: insets.bottom + 28,
        paddingHorizontal: 28,
      }}
    >
      <View style={{ flex: 1, justifyContent: 'center', gap: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Logo width={40} height={46} color={color.primary} />
          <Text style={{ fontFamily: font.display700, fontSize: 38, color: color.ink }}>Everly</Text>
        </View>
        <Text style={{ fontFamily: font.display600, fontSize: 22, color: color.ink, lineHeight: 30 }}>
          One calm home for your family, birth to adult.
        </Text>
        <Text style={{ fontFamily: font.body400, fontSize: 15, color: color.inkSecondary, lineHeight: 22 }}>
          Track sleep, health, milestones and routines — privately. Your family's
          data stays on your device.
        </Text>
        <FreeForeverPill />
      </View>

      <View style={{ gap: 12 }}>
        <Button label="Create account" onPress={() => router.push('/(auth)/sign-up')} />
        <Button label="I already have an account" variant="secondary" onPress={() => router.push('/(auth)/sign-in')} />
        <Pressable onPress={() => router.push('/gallery')} style={{ alignItems: 'center', paddingTop: 6 }}>
          <Text style={{ fontFamily: font.body600, fontSize: 13, color: color.muted }}>Browse the design gallery</Text>
        </Pressable>
      </View>
    </View>
  );
}
