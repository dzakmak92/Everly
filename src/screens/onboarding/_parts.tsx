import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { font } from '../../theme/tokens';

/* Shared onboarding-carousel chrome: Skip label, Back label,
 * elongated progress dots, and the periwinkle Next button.
 * Matches the Everly onboarding design exactly. */

/** Top-right "Skip" affordance, absolutely positioned over the slide. */
export function SkipLabel({ dark = false }: { dark?: boolean }) {
  return (
    <View style={{ position: 'absolute', top: 14, right: 26, zIndex: 3 }}>
      <Text style={{ fontFamily: font.body600, fontSize: 13, color: dark ? 'rgba(237,235,250,0.4)' : '#9C9AB2' }}>Skip</Text>
    </View>
  );
}

/** Bottom-left "Back" affordance. */
export function BackLabel({ dark = false }: { dark?: boolean }) {
  return (
    <Text style={{ fontFamily: font.body600, fontSize: 14, color: dark ? 'rgba(237,235,250,0.4)' : '#9C9AB2' }}>Back</Text>
  );
}

/** 9 elongated progress dots; the active one is a 22×7 periwinkle bar. */
export function ProgressDots({ active, total = 9, dark = false }: { active: number; total?: number; dark?: boolean }) {
  const inactive = dark ? 'rgba(237,235,250,0.2)' : 'rgba(107,111,201,0.22)';
  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) =>
        i === active ? (
          <View key={i} style={{ width: 22, height: 7, backgroundColor: '#6B6FC9', borderRadius: 4 }} />
        ) : (
          <View key={i} style={{ width: 7, height: 7, backgroundColor: inactive, borderRadius: 999 }} />
        )
      )}
    </View>
  );
}

/** The periwinkle "Next →" pill button. */
export function NextButton() {
  return (
    <View
      style={{
        backgroundColor: '#6B6FC9',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#6B6FC9',
        shadowOpacity: 0.35,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
      }}
    >
      <Text style={{ fontFamily: font.body800, fontSize: 15, color: '#fff' }}>Next</Text>
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
        <Path d="M5 12h14M12 5l7 7-7 7" />
      </Svg>
    </View>
  );
}
