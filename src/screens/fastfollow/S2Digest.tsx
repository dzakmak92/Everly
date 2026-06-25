import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { font } from '../../theme/tokens';

const f = font;

/* S2 · Weekly Digest — iOS lock screen with a frosted notification card. */
export default function S2Digest() {
  return (
    <LinearGradient
      colors={['#1A1830', '#252240', '#1E2842']}
      locations={[0, 0.6, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{
        minHeight: 720,
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 44,
        paddingHorizontal: 28,
      }}
    >
      {/* big clock + date */}
      <View style={{ alignItems: 'center', marginBottom: 44 }}>
        <Text style={{ fontFamily: f.display500, fontSize: 72, color: '#fff', letterSpacing: -1.4 }}>9:41</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
          Monday, 23 June
        </Text>
      </View>

      {/* frosted notification card */}
      <View
        style={{
          width: '100%',
          backgroundColor: 'rgba(255,255,255,0.13)',
          borderRadius: 20,
          paddingVertical: 16,
          paddingHorizontal: 18,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        {/* header row */}
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
          <View
            style={{
              width: 32,
              height: 32,
              backgroundColor: '#76a878',
              borderRadius: 9,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TreeMarkWhite width={18} height={20} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#fff' }}>Everly · Weekly digest</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>now</Text>
            </View>
            <Text style={{ fontFamily: f.body400, fontSize: 13, lineHeight: 19.5, color: 'rgba(255,255,255,0.75)' }}>
              Your family's week ahead is ready
            </Text>
          </View>
        </View>

        {/* summary bullets */}
        <View
          style={{
            gap: 8,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <Bullet dot="#D8F0E6">Oliver · avg 14h sleep ↑ · 6 feeds/day</Bullet>
          <Bullet dot="#E7E4FB">Mia · 3 events this week · Piano Tue 15:30</Bullet>
          <Bullet dot="#FBE0EA">⚠ Oliver's vaccine due in 9 days</Bullet>
        </View>

        {/* CTA */}
        <View
          style={{
            marginTop: 12,
            backgroundColor: 'rgba(107,111,201,0.4)',
            borderRadius: 10,
            paddingVertical: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#fff' }}>Tap to open Everly →</Text>
        </View>
      </View>

      {/* home indicator */}
      <View
        style={{
          position: 'absolute',
          bottom: 24,
          alignSelf: 'center',
          width: 120,
          height: 5,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 3,
        }}
      />
    </LinearGradient>
  );
}

function Bullet({ dot, children }: { dot: string; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <View style={{ width: 6, height: 6, backgroundColor: dot, borderRadius: 3 }} />
      <Text style={{ fontFamily: f.body400, fontSize: 12, lineHeight: 16.8, color: 'rgba(255,255,255,0.7)' }}>
        {children}
      </Text>
    </View>
  );
}

/* White Everly tree mark (logo-tree-white.svg), inlined on the green app-icon tile. */
function TreeMarkWhite({ width = 18, height = 20 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 92 104" fill="none">
      <Path d="M46 104 V58" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
      <Path d="M46 64 C28 64 16 50 16 34 C16 18 30 6 46 6 C62 6 76 18 76 34 C76 50 64 64 46 64 Z" fill="#fff" />
      <Path d="M46 78 C36 78 28 70 28 60 C38 60 46 68 46 78 Z" fill="rgba(255,255,255,0.7)" />
      <Path d="M46 88 C56 88 64 80 64 70 C54 70 46 78 46 88 Z" fill="rgba(255,255,255,0.7)" />
    </Svg>
  );
}
