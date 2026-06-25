import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { color, font } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';
import { BackLabel, ProgressDots, SkipLabel } from './_parts';

const f = font;
const c = color;

/* 09 · CTA — final onboarding carousel slide.
 * "Start their story today" with plan chips + primary periwinkle button. */
export default function O09CTA() {
  return (
    <View style={{ backgroundColor: c.canvas, minHeight: 720, position: 'relative' }}>
      <StatusBar />
      <SkipLabel />

      {/* floating decorative shapes */}
      <View style={{ position: 'absolute', top: 80, left: 18, width: 48, height: 48, backgroundColor: '#D8F0E6', borderRadius: 15, transform: [{ rotate: '-11deg' }] }} />
      <View style={{ position: 'absolute', top: 84, right: 20, width: 40, height: 40, backgroundColor: '#FBF1CE', borderRadius: 13, transform: [{ rotate: '8deg' }] }} />
      <Text style={{ position: 'absolute', top: 100, left: 78, fontSize: 14, color: '#E9C46A' }}>✦</Text>
      <Text style={{ position: 'absolute', top: 96, right: 72, fontSize: 10, color: '#E9C46A' }}>✦</Text>

      {/* content */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, minHeight: 560, zIndex: 2 }}>
        {/* Family silhouette group */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          <View style={{ width: 44, height: 44, backgroundColor: '#D8F0E6', borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}>
            <Svg viewBox="0 0 20 22" fill="#3FA98A" width={20} height={22}>
              <Circle cx="10" cy="7.5" r="5.5" />
              <Path d="M1.5 21Q1.5 14 10 14Q18.5 14 18.5 21Z" />
            </Svg>
          </View>
          <View style={{ width: 52, height: 52, backgroundColor: '#6B6FC9', borderRadius: 26, alignItems: 'center', justifyContent: 'center' }}>
            <Svg viewBox="0 0 20 24" fill="white" width={22} height={24}>
              <Circle cx="10" cy="7.5" r="6" />
              <Path d="M1 22Q1 15 10 15Q19 15 19 22Z" />
            </Svg>
          </View>
          <View style={{ width: 36, height: 36, backgroundColor: '#E7E4FB', borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
            <Svg viewBox="0 0 20 20" fill="#6B6FC9" width={16} height={18}>
              <Circle cx="10" cy="7" r="4.5" />
              <Path d="M3 18Q3 13 10 13Q17 13 17 18Z" />
            </Svg>
          </View>
        </View>

        <Text style={{ fontFamily: f.display700, fontSize: 30, lineHeight: 36, color: '#33324A', textAlign: 'center', marginBottom: 8 }}>
          Start their <Text style={{ color: '#6B6FC9' }}>story</Text> today
        </Text>
        <Text style={{ fontFamily: f.body400, fontSize: 14, lineHeight: 21, color: '#6F6E86', textAlign: 'center', marginBottom: 24 }}>
          Free newborn tracking — no card needed.
        </Text>

        {/* plan chips */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderWidth: 1.5, borderColor: 'rgba(51,50,74,0.1)', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 16 }}>
            <Text style={{ fontFamily: f.body600, fontSize: 12, color: '#33324A' }}>Free forever</Text>
          </View>
          <View style={{ backgroundColor: '#6B6FC9', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 16 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#fff' }}>Pro €3.99/mo</Text>
          </View>
          <View style={{ backgroundColor: '#fff', borderWidth: 1.5, borderColor: 'rgba(51,50,74,0.1)', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 16 }}>
            <Text style={{ fontFamily: f.body600, fontSize: 12, color: '#33324A' }}>Family €4.99</Text>
          </View>
        </View>

        {/* CTA button */}
        <View
          style={{
            backgroundColor: '#6B6FC9',
            paddingVertical: 18,
            paddingHorizontal: 44,
            borderRadius: 15,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            width: '100%',
            marginBottom: 12,
            shadowColor: '#6B6FC9',
            shadowOpacity: 0.4,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 8 },
            elevation: 5,
          }}
        >
          <Text style={{ fontFamily: f.body800, fontSize: 17, color: '#fff' }}>Start for free</Text>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
            <Path d="M5 12h14M12 5l7 7-7 7" />
          </Svg>
        </View>

        {/* secondary */}
        <View style={{ borderWidth: 1.5, borderColor: 'rgba(107,111,201,0.3)', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 15, width: '100%', alignItems: 'center' }}>
          <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#6B6FC9' }}>See all plans</Text>
        </View>

        <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2', textAlign: 'center', marginTop: 12 }}>
          Newborn tracking free forever · No credit card
        </Text>
      </View>

      {/* bottom bar — final slide: all 9 dots, last active; disabled "Done" */}
      <View style={{ paddingHorizontal: 32, paddingTop: 20, paddingBottom: 44, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <BackLabel />
        <ProgressDots active={8} />
        <View style={{ backgroundColor: '#D8D6F0', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 15 }}>
          <Text style={{ fontFamily: f.body800, fontSize: 15, color: '#9C9AB2' }}>Done</Text>
        </View>
      </View>
    </View>
  );
}
