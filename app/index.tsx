import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../src/theme/tokens';
import { Logo } from '../src/components/Logo';
import { FreeForeverPill } from '../src/components/ui';
import { ChevronRight } from '../src/components/icons';
import { MODULES, totalScreens } from '../src/modules';

/**
 * Module launcher — the app home. Lists every recreated design surface
 * (Pregnancy, Maternal, App, Onboarding, Fast-follow, Admin, Landing).
 * Tap a module → its gallery of phone/desktop frames.
 */
export default function Launcher() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.gallery }}
      contentContainerStyle={{
        paddingTop: insets.top + 28,
        paddingBottom: insets.bottom + 48,
        paddingHorizontal: 24,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <Logo width={30} height={34} color="#3A6B4E" />
        <Text style={{ fontFamily: font.display700, fontSize: 28, color: '#2A1C3A' }}>Everly</Text>
        <FreeForeverPill />
      </View>
      <Text style={{ fontFamily: font.body400, fontSize: 14, color: '#8A6E8A', marginBottom: 28, lineHeight: 20 }}>
        Birth-to-adult family app · {MODULES.length} modules · {totalScreens()} screens recreated from the design handoff.
      </Text>

      <View style={{ gap: 14 }}>
        {MODULES.map((m) => (
          <Pressable key={m.key} onPress={() => router.push(`/module/${m.key}`)}>
            <View
              style={[
                {
                  backgroundColor: '#fff',
                  borderRadius: radius.card,
                  padding: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                },
                shadow.card,
              ]}
            >
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  backgroundColor: m.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: font.display700, fontSize: 16, color: '#fff' }}>
                  {m.screens.length}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontFamily: font.display700, fontSize: 17, color: color.ink }}>{m.title}</Text>
                  {m.freeForever && <FreeForeverPill small />}
                </View>
                <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, marginTop: 4, lineHeight: 17 }}>
                  {m.subtitle}
                </Text>
              </View>
              <ChevronRight size={18} color={color.faint} />
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
