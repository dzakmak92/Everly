import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { color, font } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';
import { BackLabel, NextButton, ProgressDots, SkipLabel } from './_parts';

const f = font;
const c = color;

/* 07 · Co-Parent — onboarding carousel slide.
 * Two adult silhouettes + a custody strip + an expense row. */
export default function O07CoParent() {
  return (
    <View style={{ backgroundColor: c.canvas, minHeight: 720, position: 'relative' }}>
      <StatusBar />
      <SkipLabel />

      {/* floating decorative shapes */}
      <View style={{ position: 'absolute', top: 82, left: 18, width: 44, height: 44, backgroundColor: '#FCE6D8', borderRadius: 14, transform: [{ rotate: '-9deg' }] }} />
      <Text style={{ position: 'absolute', top: 84, right: 60, fontSize: 13, color: '#E9C46A' }}>✦</Text>

      {/* content */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, minHeight: 560, zIndex: 2 }}>
        {/* Two parent silhouettes */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 24 }}>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <View style={{ width: 64, height: 64, backgroundColor: '#D8F0E6', borderRadius: 32, alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={32} height={36} viewBox="0 0 20 22" fill="#3FA98A">
                <Circle cx="10" cy="7.5" r="5.5" />
                <Path d="M1.5 21Q1.5 14 10 14Q18.5 14 18.5 21Z" />
              </Svg>
            </View>
            <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#3FA98A' }}>You</Text>
          </View>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: f.display700, fontSize: 18, color: '#C8C6DC' }}>&amp;</Text>
          </View>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <View style={{ width: 64, height: 64, backgroundColor: '#FCE6D8', borderRadius: 32, alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={32} height={36} viewBox="0 0 20 22" fill="#D9824F">
                <Circle cx="10" cy="7.5" r="5.5" />
                <Path d="M1.5 21Q1.5 14 10 14Q18.5 14 18.5 21Z" />
              </Svg>
            </View>
            <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#D9824F' }}>Sam</Text>
          </View>
        </View>

        {/* Custody strip mini */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 18,
            padding: 16,
            width: '100%',
            marginBottom: 16,
            shadowColor: '#33324A',
            shadowOpacity: 0.08,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <Text style={{ fontFamily: f.body700, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: '#9C9AB2', marginBottom: 10 }}>This week</Text>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <CustodyDay tint="#D8F0E6" fg="#3FA98A" letter="M" num="23" />
            <CustodyDay tint="#D8F0E6" fg="#3FA98A" letter="T" num="24" />
            <CustodyDay tint="#D8F0E6" fg="#3FA98A" letter="W" num="25" />
            <CustodyDay tint="#FCE6D8" fg="#D9824F" letter="T" num="26" />
            <CustodyDay tint="#FCE6D8" fg="#D9824F" letter="F" num="27" />
            <CustodyDay tint="#FCE6D8" fg="#D9824F" letter="S" num="28" dim />
            <CustodyDay tint="#D8F0E6" fg="#3FA98A" letter="S" num="29" dim />
          </View>
        </View>

        {/* expense row */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 14,
            paddingVertical: 12,
            paddingHorizontal: 16,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            shadowColor: '#33324A',
            shadowOpacity: 0.07,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 3 },
            elevation: 2,
          }}
        >
          <View>
            <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#33324A', marginBottom: 3 }}>Doctor visit · €90</Text>
            <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2' }}>50/50 split</Text>
          </View>
          <View style={{ backgroundColor: '#FBE0EA', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#D46E97' }}>Sam owes €45</Text>
          </View>
        </View>

        <Text style={{ fontFamily: f.display700, fontSize: 28, lineHeight: 34, color: '#33324A', textAlign: 'center', marginBottom: 10 }}>
          Co-parenting, made <Text style={{ color: '#6B6FC9' }}>calm</Text>
        </Text>
        <Text style={{ fontFamily: f.body400, fontSize: 14, lineHeight: 21, color: '#6F6E86', textAlign: 'center' }}>
          Custody schedule, shared expenses, neutral activity log.
        </Text>
      </View>

      {/* bottom bar */}
      <View style={{ paddingHorizontal: 32, paddingTop: 24, paddingBottom: 44, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <BackLabel />
        <ProgressDots active={6} />
        <NextButton />
      </View>
    </View>
  );
}

function CustodyDay({ tint, fg, letter, num, dim }: { tint: string; fg: string; letter: string; num: string; dim?: boolean }) {
  return (
    <View style={{ flex: 1, backgroundColor: tint, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 3, alignItems: 'center', opacity: dim ? 0.5 : 1 }}>
      <Text style={{ fontFamily: f.body700, fontSize: 8, color: fg }}>{letter}</Text>
      <Text style={{ fontFamily: f.body600, fontSize: 10, color: fg, marginTop: 3 }}>{num}</Text>
    </View>
  );
}
