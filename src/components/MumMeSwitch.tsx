import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { color, font, radius } from '../theme/tokens';

/**
 * The Mum&Me journey is one module with two phases. This segmented control sits
 * at the top of both hub screens and swaps between them (replace, so back still
 * returns to wherever you opened the journey from).
 */
export function MumMeSwitch({ phase }: { phase: 'pregnancy' | 'postpartum' }) {
  const router = useRouter();
  const go = (to: 'pregnancy' | 'postpartum') => {
    if (to === phase) return;
    router.replace((to === 'pregnancy' ? '/(app)/pregnancy' : '/(app)/maternal') as any);
  };
  return (
    <View style={{ flexDirection: 'row', backgroundColor: '#EFEDF8', borderRadius: radius.pill, padding: 3 }}>
      {(['pregnancy', 'postpartum'] as const).map((p) => {
        const on = p === phase;
        return (
          <Pressable key={p} onPress={() => go(p)} style={{ flex: 1, paddingVertical: 9, borderRadius: radius.pill, alignItems: 'center', backgroundColor: on ? color.primary : 'transparent' }}>
            <Text style={{ fontFamily: on ? font.body700 : font.body600, fontSize: 13, color: on ? '#fff' : color.inkSecondary }}>
              {p === 'pregnancy' ? 'Pregnancy' : 'Postpartum'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
