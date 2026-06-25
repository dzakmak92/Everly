import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font } from '../../theme/tokens';

const f = font;
const c = color;

/* 05 · Night Log — dark-mode night-log preview as a hero card. */
export default function O05NightLog() {
  return (
    <View style={{ backgroundColor: c.nightBg, minHeight: 720, position: 'relative' }}>
      {/* status bar (light ink) */}
      <View
        style={{
          paddingTop: 14,
          paddingHorizontal: 26,
          paddingBottom: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.nightText }}>3:14</Text>
      </View>

      {/* Skip */}
      <View style={{ position: 'absolute', top: 14, right: 26 }}>
        <Text style={{ fontFamily: f.body600, fontSize: 13, color: 'rgba(237,235,250,0.4)' }}>Skip</Text>
      </View>

      {/* content */}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
          zIndex: 2,
        }}
      >
        {/* moon icon */}
        <View style={{ marginBottom: 20 }}>
          <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#E7E4FB" strokeWidth={1.5} strokeLinecap="round">
            <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </Svg>
        </View>

        {/* mini phone preview */}
        <View style={{ backgroundColor: c.nightCard, borderRadius: 20, padding: 16, width: '100%', marginBottom: 24 }}>
          {/* wake window */}
          <LinearGradient
            colors={['#5A5EB8', '#7B7FCC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round">
              <Circle cx="12" cy="12" r="10" />
              <Path d="M12 6v6l4 2" />
            </Svg>
            <View>
              <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#fff' }}>Wake window</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 10, lineHeight: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                Next nap ~35 min
              </Text>
            </View>
          </LinearGradient>

          {/* 2x2 tiles mini */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <NightTile label="Feed">
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#D8F0E6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M8 2h8" />
                  <Path d="M9 2v3a5.5 5.5 0 0 0-3 4.9V19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-9.1A5.5 5.5 0 0 0 15 5V2" />
                </Svg>
              </NightTile>
              <NightTile label="Sleep">
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#E7E4FB" strokeWidth={2} strokeLinecap="round">
                  <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </Svg>
              </NightTile>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <NightTile label="Diaper">
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FBF1CE" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M4 8l4-4 4 4 4-4 4 4v8l-4 4-4-4-4 4-4-4V8z" />
                </Svg>
              </NightTile>
              <NightTile label="Pump">
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FBE0EA" strokeWidth={2} strokeLinecap="round">
                  <Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </Svg>
              </NightTile>
            </View>
          </View>
        </View>

        {/* headline + subtitle */}
        <Text style={{ fontFamily: f.display700, fontSize: 28, lineHeight: 34, color: c.nightText, marginBottom: 10, textAlign: 'center' }}>
          Made for <Text style={{ color: '#E9C46A' }}>3am</Text>
        </Text>
        <Text style={{ fontFamily: f.body400, fontSize: 14, lineHeight: 21, color: 'rgba(237,235,250,0.6)', textAlign: 'center' }}>
          Two-tap logging, night mode, wake-window reminders. One-handed.
        </Text>
      </View>

      {/* footer: Back · dots · Next */}
      <View
        style={{
          paddingTop: 24,
          paddingHorizontal: 32,
          paddingBottom: 44,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontFamily: f.body600, fontSize: 14, color: 'rgba(237,235,250,0.4)' }}>Back</Text>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {Array.from({ length: 9 }).map((_, i) =>
            i === 4 ? (
              <View key={i} style={{ width: 22, height: 7, backgroundColor: '#6B6FC9', borderRadius: 4 }} />
            ) : (
              <View key={i} style={{ width: 7, height: 7, backgroundColor: 'rgba(237,235,250,0.2)', borderRadius: 3.5 }} />
            ),
          )}
        </View>
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
          <Text style={{ fontFamily: f.body800, fontSize: 15, color: '#fff' }}>Next</Text>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
            <Path d="M5 12h14M12 5l7 7-7 7" />
          </Svg>
        </View>
      </View>
    </View>
  );
}

function NightTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.nightBg,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 10,
        alignItems: 'center',
      }}
    >
      <View style={{ marginBottom: 6 }}>{children}</View>
      <Text style={{ fontFamily: f.body700, fontSize: 11, color: c.nightText }}>{label}</Text>
    </View>
  );
}
