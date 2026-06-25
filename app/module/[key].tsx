import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius } from '../../src/theme/tokens';
import { PhoneFrame, FreeForeverPill } from '../../src/components/ui';
import { ChevronLeft } from '../../src/components/icons';
import { moduleByKey } from '../../src/modules';

/**
 * Module gallery — mirrors the source `.dc.html` layout: a header + the
 * module's labelled frames. Wide frames (Kiosk 1024 / Admin 1440) scroll
 * horizontally. Tap a frame → full-screen view.
 */
export default function ModuleGallery() {
  const { key } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mod = moduleByKey(key);

  if (!mod) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.gallery }}>
        <Text style={{ fontFamily: font.body600, color: color.ink }}>Module not found.</Text>
      </View>
    );
  }

  const frames = (
    <View style={{ gap: 40 }}>
      {mod.screens.map((s) => {
        const Screen = s.component;
        return (
          <Pressable key={s.id} onPress={() => router.push(`/screen/${s.id}`)}>
            <PhoneFrame
              label={s.label}
              width={s.width ?? mod.frameWidth}
              accent={mod.accent}
              frameRadius={s.frameRadius ?? mod.frameRadius}
            >
              <Screen />
            </PhoneFrame>
          </Pressable>
        );
      })}
    </View>
  );

  // Wide modules (admin/kiosk) need horizontal scrolling.
  const wide = mod.frameWidth > 430;

  return (
    <View style={{ flex: 1, backgroundColor: color.gallery }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 64,
          paddingBottom: insets.bottom + 56,
          paddingHorizontal: 24,
        }}
      >
        <View style={{ maxWidth: 560, marginBottom: 34 }}>
          <Text
            style={{
              fontFamily: font.body700,
              fontSize: 11,
              letterSpacing: 1.3,
              textTransform: 'uppercase',
              color: mod.accent,
              marginBottom: 10,
            }}
          >
            Everly · {mod.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Text style={{ fontFamily: font.display700, fontSize: 26, color: '#2A1C3A' }}>{mod.title}</Text>
            {mod.freeForever && <FreeForeverPill />}
          </View>
          <Text style={{ fontFamily: font.body400, fontSize: 14, color: '#8A6E8A', marginTop: 8, lineHeight: 20 }}>
            {mod.subtitle}
          </Text>
        </View>

        {wide ? (
          <ScrollView horizontal showsHorizontalScrollIndicator>
            {frames}
          </ScrollView>
        ) : (
          frames
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: insets.top + 10,
          left: 18,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(255,255,255,0.9)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChevronLeft size={22} color={color.ink} />
      </Pressable>
    </View>
  );
}
