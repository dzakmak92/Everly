import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font } from '../../src/theme/tokens';
import { screenById } from '../../src/modules';
import { ChevronLeft } from '../../src/components/icons';

/**
 * Full-screen view of one recreated screen, resolved by global id across all
 * modules. Phone screens center at their design width; wide frames (Kiosk /
 * Admin) scroll horizontally.
 */
export default function ScreenRoute() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const resolved = screenById(id);

  if (!resolved) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.canvas }}>
        <Text style={{ fontFamily: font.body600, color: color.ink }}>Screen not found.</Text>
      </View>
    );
  }

  const { module, screen } = resolved;
  const Screen = screen.component;
  const width = screen.width ?? module.frameWidth;
  const wide = width > 430;
  const bg = screen.dark ? color.nightBg : color.canvas;

  const body = (
    <View style={{ width, maxWidth: wide ? undefined : '100%' }}>
      <Screen />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {wide ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            contentContainerStyle={{ paddingTop: insets.top + 56 }}
          >
            {body}
          </ScrollView>
        ) : (
          body
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: insets.top + 8,
          left: 16,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: screen.dark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.85)',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#33324A',
          shadowOpacity: 0.12,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}
      >
        <ChevronLeft size={22} color={screen.dark ? '#fff' : color.ink} />
      </Pressable>
    </View>
  );
}
