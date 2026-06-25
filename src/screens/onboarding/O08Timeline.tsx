import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';
import { BackLabel, NextButton, ProgressDots, SkipLabel } from './_parts';

const f = font;
const c = color;

const rowShadow = {
  shadowColor: '#33324A',
  shadowOpacity: 0.07,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
} as const;

/* 08 · Timeline — onboarding carousel slide.
 * Growth-spine timeline of milestone entries + a sprout motif. */
export default function O08Timeline() {
  return (
    <View style={{ backgroundColor: c.canvas, minHeight: 720, position: 'relative' }}>
      <StatusBar />
      <SkipLabel />

      {/* floating decorative shapes */}
      <View style={{ position: 'absolute', top: 86, right: 18, width: 46, height: 46, backgroundColor: '#E7E4FB', borderRadius: 15, transform: [{ rotate: '10deg' }] }} />
      <Text style={{ position: 'absolute', top: 88, left: 58, fontSize: 12, color: '#E9C46A' }}>✦</Text>

      {/* content */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, minHeight: 560, zIndex: 2 }}>
        {/* Sprout growing motif */}
        <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Svg viewBox="0 0 60 80" fill="none" width={36} height={48}>
            <Path d="M30 78 C30 78 30 45 30 35" stroke="#76a878" strokeWidth={2.5} strokeLinecap="round" fill="none" />
            <Path d="M30 55 C26 48 18 44 12 46" stroke="#76a878" strokeWidth={2} strokeLinecap="round" fill="none" />
            <Ellipse cx="9" cy="43" rx="7" ry="9" fill="#76a878" opacity={0.6} />
            <Path d="M30 45 C34 38 42 34 48 36" stroke="#76a878" strokeWidth={2} strokeLinecap="round" fill="none" />
            <Ellipse cx="51" cy="33" rx="7" ry="9" fill="#76a878" opacity={0.6} />
            <Path d="M30 35 C27 28 20 22 14 22" stroke="#76a878" strokeWidth={2} strokeLinecap="round" fill="none" />
            <Ellipse cx="11" cy="18" rx="6" ry="8" fill="#76a878" opacity={0.75} />
            <Path d="M30 35 C33 28 40 22 46 22" stroke="#76a878" strokeWidth={2} strokeLinecap="round" fill="none" />
            <Ellipse cx="49" cy="18" rx="6" ry="8" fill="#76a878" opacity={0.75} />
            <Circle cx="30" cy="8" r="8" fill="#76a878" />
            <Path d="M24 20 Q30 14 36 20 Q34 28 30 26 Q26 28 24 20Z" fill="#76a878" />
          </Svg>
          <Text style={{ fontFamily: f.display700, fontSize: 18, lineHeight: 22, color: '#33324A' }}>
            <Text style={{ color: '#6B6FC9' }}>One story,</Text>
            {'\n'}forever
          </Text>
        </View>

        {/* Timeline entries preview */}
        <View style={{ width: '100%', position: 'relative', paddingLeft: 32, marginBottom: 20 }}>
          {/* growth spine */}
          <LinearGradient
            colors={['#6B6FC9', 'rgba(107,111,201,0.15)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 2, borderRadius: 999 }}
          />

          {/* entry 1 — solid node */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12, position: 'relative' }}>
            <View style={{ position: 'absolute', left: -21, top: 10, width: 12, height: 12, backgroundColor: '#6B6FC9', borderRadius: 6, zIndex: 1 }} />
            <View style={[{ flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', gap: 10, alignItems: 'center' }, rowShadow]}>
              <View style={{ width: 32, height: 32, backgroundColor: '#FBF1CE', borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={15} height={15} viewBox="0 0 24 24" fill="#E9C46A">
                  <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </Svg>
              </View>
              <View>
                <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#33324A' }}>First smile ✨</Text>
                <Text style={{ fontFamily: f.body400, fontSize: 10, color: '#9C9AB2', marginTop: 3 }}>6 weeks · May 4</Text>
              </View>
            </View>
          </View>

          {/* entry 2 — ringed node */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12, position: 'relative' }}>
            <View style={{ position: 'absolute', left: -21, top: 10, width: 12, height: 12, backgroundColor: '#E7E4FB', borderWidth: 2, borderColor: '#6B6FC9', borderRadius: 6, zIndex: 1 }} />
            <View style={[{ flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', gap: 10, alignItems: 'center' }, rowShadow]}>
              <View style={{ width: 32, height: 32, backgroundColor: '#DCEBFA', borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#4E8FD0" strokeWidth={2} strokeLinecap="round">
                  <Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </Svg>
              </View>
              <View>
                <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#33324A' }}>First bath at home</Text>
                <Text style={{ fontFamily: f.body400, fontSize: 10, color: '#9C9AB2', marginTop: 3 }}>3 weeks · Apr 13 · 2 photos</Text>
              </View>
            </View>
          </View>

          {/* entry 3 — ringed node */}
          <View style={{ flexDirection: 'row', gap: 12, position: 'relative' }}>
            <View style={{ position: 'absolute', left: -21, top: 10, width: 12, height: 12, backgroundColor: '#E7E4FB', borderWidth: 2, borderColor: '#6B6FC9', borderRadius: 6, zIndex: 1 }} />
            <View style={[{ flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', gap: 10, alignItems: 'center' }, rowShadow]}>
              <View style={{ width: 32, height: 32, backgroundColor: '#FBE0EA', borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#D46E97" strokeWidth={2} strokeLinecap="round">
                  <Path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <Path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                </Svg>
              </View>
              <View>
                <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#33324A' }}>First solids — sweet potato</Text>
                <Text style={{ fontFamily: f.body400, fontSize: 10, color: '#9C9AB2', marginTop: 3 }}>17 weeks · Jun 18</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={{ fontFamily: f.body400, fontSize: 14, lineHeight: 21, color: '#6F6E86', textAlign: 'center' }}>
          Every milestone preserved — from first smile to first drive.
        </Text>
      </View>

      {/* bottom bar */}
      <View style={{ paddingHorizontal: 32, paddingTop: 24, paddingBottom: 44, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <BackLabel />
        <ProgressDots active={7} />
        <NextButton />
      </View>
    </View>
  );
}
