import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';
import { BackLabel, NextButton, ProgressDots, SkipLabel } from './_parts';

const f = font;
const c = color;

/* 02 · Mum&Me — free, forever. The emotional center of the carousel. */
export default function O02MumAndMe() {
  return (
    <View style={{ backgroundColor: c.canvas, minHeight: 720, position: 'relative' }}>
      <StatusBar />
      <SkipLabel />

      {/* floating pastel tiles + sparkle */}
      <View style={{ position: 'absolute', top: 78, left: 18, width: 46, height: 46, backgroundColor: '#FBE0EA', borderRadius: 15, transform: [{ rotate: '-10deg' }] }} />
      <View style={{ position: 'absolute', top: 150, right: 20, width: 40, height: 40, backgroundColor: '#E0F4EF', borderRadius: 13, transform: [{ rotate: '9deg' }] }} />
      <Text style={{ position: 'absolute', top: 90, right: 64, fontSize: 13, color: '#E9C46A' }}>✦</Text>

      {/* content */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, minHeight: 560 }}>
        {/* pregnant faceless silhouette */}
        <View style={{ marginBottom: 20 }}>
          <Svg width={56} height={70} viewBox="0 0 48 60" fill="#E98FB3">
            <Circle cx="22" cy="10" r="7.5" />
            <Path d="M16 20 Q13 30 17 38 Q9 41 11 56 L31 56 Q33 42 26 38 Q37 31 28 20 Z" />
          </Svg>
        </View>

        {/* mini pregnancy card */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            width: '100%',
            padding: 16,
            paddingHorizontal: 18,
            marginBottom: 12,
            shadowColor: '#33324A',
            shadowOpacity: 0.08,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View>
              <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A' }}>Week 24</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2', marginTop: 3 }}>112 days to go</Text>
            </View>
            <View style={{ backgroundColor: '#FBE0EA', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#D46E97' }}>Corn on the cob</Text>
            </View>
          </View>
          {/* progress */}
          <View style={{ height: 6, backgroundColor: '#F4F3FB', borderRadius: 999, overflow: 'hidden', marginBottom: 12 }}>
            <LinearGradient colors={['#E98FB3', '#D46E97']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: '60%', height: '100%', borderRadius: 999 }} />
          </View>
          {/* three stat tiles */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <StatTile bg="#FBE0EA" fg="#D46E97" value="8" label="Kicks" />
            <StatTile bg="#E7E4FB" fg="#6B6FC9" value="😌" label="Mood" />
            <StatTile bg="#D8F0E6" fg="#3FA98A" value="✓" label="Scan" />
          </View>
        </View>

        {/* "you too" maternal chip */}
        <LinearGradient
          colors={['#E0F4EF', '#D4EDDB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 14, paddingVertical: 11, paddingHorizontal: 16, width: '100%', flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 20 }}
        >
          <View style={{ width: 30, height: 30, backgroundColor: '#3A9B8A', borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={15} height={15} viewBox="0 0 20 20" fill="white">
              <Circle cx="10" cy="7.5" r="4.5" />
              <Path d="M2.5 18Q2.5 12 10 12Q17.5 12 17.5 18Z" />
            </Svg>
          </View>
          <Text style={{ flex: 1, fontFamily: f.body600, fontSize: 12, lineHeight: 17, color: '#1E5C50' }}>
            A quiet <Text style={{ fontFamily: f.body800 }}>Free forever</Text> promise — pregnancy, postpartum & safety are never paywalled.
          </Text>
        </LinearGradient>

        {/* headline + subtitle */}
        <Text style={{ fontFamily: f.display700, fontSize: 28, lineHeight: 34, color: '#33324A', textAlign: 'center', marginBottom: 10 }}>
          <Text style={{ color: '#3A9B8A' }}>Mum&Me</Text> — free, forever
        </Text>
        <Text style={{ fontFamily: f.body400, fontSize: 14, lineHeight: 21, color: '#6F6E86', textAlign: 'center' }}>
          We carry <Text style={{ fontFamily: f.body800 }}>you</Text>, not just the baby — from trying-to-conceive through the fourth trimester.
        </Text>
      </View>

      {/* bottom bar */}
      <View style={{ paddingHorizontal: 32, paddingTop: 24, paddingBottom: 44, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <BackLabel />
        <ProgressDots active={1} />
        <NextButton />
      </View>
    </View>
  );
}

function StatTile({ bg, fg, value, label }: { bg: string; fg: string; value: string; label: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: bg, borderRadius: 11, padding: 8, alignItems: 'center' }}>
      <Text style={{ fontFamily: font.display700, fontSize: 13, color: fg }}>{value}</Text>
      <Text style={{ fontFamily: font.body600, fontSize: 9, color: fg, marginTop: 3 }}>{label}</Text>
    </View>
  );
}
