import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { color, font, radius, shadow } from '../theme/tokens';
import { Button } from './forms';
import { LockGlyph } from './icons';
import { useEntitlement } from '../lib/entitlement';

/**
 * Renders `children` for premium accounts; otherwise a calm locked card with an
 * upgrade CTA to the Plans screen. `feature` names what's behind the gate.
 */
export function PremiumGate({ feature, children }: { feature: string; children: React.ReactNode }) {
  const { isPremium } = useEntitlement();
  const router = useRouter();
  if (isPremium) return <>{children}</>;
  return (
    <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, gap: 12 }, shadow.card]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <LockGlyph size={16} />
        <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{feature}</Text>
      </View>
      <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary, lineHeight: 19 }}>
        This is a premium feature. Upgrade to unlock it.
      </Text>
      <Button label="See plans" onPress={() => router.push('/(app)/plans')} />
    </View>
  );
}
