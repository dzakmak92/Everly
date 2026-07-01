import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, shadow } from '../theme/tokens';
import { useAppUpdate } from '../lib/useAppUpdate';

/** Floating "a new version is available" prompt, pinned near the bottom. */
export function UpdateBanner() {
  const insets = useSafeAreaInsets();
  const { available, apply, dismiss } = useAppUpdate();
  if (!available) return null;
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 70, alignItems: 'center' }}>
      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: color.ink, borderRadius: 16, paddingVertical: 11, paddingHorizontal: 13, marginHorizontal: 14, maxWidth: 520 }, shadow.card]}>
        <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 17 }}>✨</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 13.5, color: '#fff' }}>A new version is available</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>Update to get the latest improvements</Text>
        </View>
        <Pressable onPress={dismiss} hitSlop={8} style={{ paddingHorizontal: 4 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: font.body700, fontSize: 12 }}>Later</Text>
        </Pressable>
        <Pressable onPress={apply} accessibilityLabel="Update the app" style={({ pressed }) => [{ backgroundColor: color.primary, borderRadius: 11, paddingVertical: 9, paddingHorizontal: 15, opacity: pressed ? 0.85 : 1 }]}>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: '#fff' }}>Update</Text>
        </Pressable>
      </View>
    </View>
  );
}
