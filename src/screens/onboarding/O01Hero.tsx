import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';
import { NextButton, ProgressDots, SkipLabel } from './_parts';

const f = font;
const c = color;

/* 01 · Hero — onboarding carousel opening slide. */
export default function O01Hero() {
  return (
    <View style={{ backgroundColor: c.canvas, minHeight: 720, position: 'relative' }}>
      <StatusBar />
      <SkipLabel />

      {/* floating pastel tiles */}
      <View style={{ position: 'absolute', top: 84, left: 20, width: 58, height: 58, backgroundColor: '#E7E4FB', borderRadius: 18, transform: [{ rotate: '-13deg' }] }} />
      <View style={{ position: 'absolute', top: 138, right: 24, width: 46, height: 46, backgroundColor: '#D8F0E6', borderRadius: 14, transform: [{ rotate: '9deg' }] }} />
      <View style={{ position: 'absolute', top: 220, left: 34, width: 38, height: 38, backgroundColor: '#FBE0EA', borderRadius: 13, transform: [{ rotate: '-6deg' }] }} />
      <View style={{ position: 'absolute', top: 190, right: 52, width: 32, height: 32, backgroundColor: '#FBF1CE', borderRadius: 11, transform: [{ rotate: '16deg' }] }} />
      <Text style={{ position: 'absolute', top: 96, left: 88, fontSize: 16, color: '#E9C46A' }}>✦</Text>
      <Text style={{ position: 'absolute', top: 258, right: 80, fontSize: 11, color: '#E9C46A' }}>✦</Text>

      {/* hero content */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, minHeight: 560 }}>
        <View style={{ marginBottom: 28 }}>
          <EverlyTree size={167} />
        </View>
        <Text style={{ fontFamily: f.display700, fontSize: 30, lineHeight: 38, color: '#33324A', textAlign: 'center', marginBottom: 14 }}>
          <Text style={{ color: '#6B6FC9' }}>One app,</Text>
          {'\n'}from the first scan{'\n'}to first car
        </Text>
        <Text style={{ fontFamily: f.body400, fontSize: 15, lineHeight: 24, color: '#6F6E86', textAlign: 'center' }}>
          Track, schedule, and celebrate every stage. No switching apps.
        </Text>
      </View>

      {/* bottom bar */}
      <View style={{ paddingHorizontal: 32, paddingTop: 24, paddingBottom: 44, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ProgressDots active={0} />
        <NextButton />
      </View>
    </View>
  );
}

/* The green Everly sprout/tree mark (logo-tree.svg) inlined. */
function EverlyTree({ size = 167 }: { size?: number }) {
  const h = (size * 189) / 167;
  return (
    <Svg width={size} height={h} viewBox="0 0 92 104" fill="none">
      {/* trunk */}
      <Path d="M46 104 V58" stroke="#76a878" strokeWidth={6} strokeLinecap="round" />
      {/* canopy leaves */}
      <Path d="M46 64 C28 64 16 50 16 34 C16 18 30 6 46 6 C62 6 76 18 76 34 C76 50 64 64 46 64 Z" fill="#76a878" />
      {/* sprout side leaves */}
      <Path d="M46 78 C36 78 28 70 28 60 C38 60 46 68 46 78 Z" fill="#8FBE90" />
      <Path d="M46 88 C56 88 64 80 64 70 C54 70 46 78 46 88 Z" fill="#8FBE90" />
    </Svg>
  );
}
