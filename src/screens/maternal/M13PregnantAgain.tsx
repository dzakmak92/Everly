import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;

/* M13 · Today — Pregnant again, toddler at home. Subsequent-pregnancy Today. */
export default function M13PregnantAgain() {
  return (
    <View style={{ backgroundColor: color.canvas }}>
      <StatusBar />

      {/* brand row */}
      <View style={{ paddingHorizontal: 24, paddingTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 15, color: '#3A9B8A' }}>Mum&Me</Text>
        <View style={{ backgroundColor: '#D4EDE7', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 9, color: '#2C8475' }}>Free again</Text>
        </View>
      </View>

      {/* greeting */}
      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 10 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 20, color: color.ink }}>Good morning, Emma</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: color.muted, marginTop: 4 }}>
          Two journeys, side by side
        </Text>
      </View>

      {/* subject pills */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', gap: 8 }}>
        {/* You · pregnant */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            backgroundColor: '#E0F4EF',
            borderRadius: 999,
            paddingVertical: 6,
            paddingLeft: 6,
            paddingRight: 13,
          }}
        >
          <View style={{ width: 28, height: 28, backgroundColor: '#3A9B8A', borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={15} height={15} viewBox="0 0 20 20" fill="white">
              <Circle cx={10} cy={7} r={4} />
              <Path d="M5 18 Q5 11 10 11 Q15 11 15 18Z" />
            </Svg>
          </View>
          <View>
            <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#1E5C50' }}>You</Text>
            <Text style={{ fontFamily: f.body400, fontSize: 9, color: '#3A9B8A', marginTop: 2 }}>Pregnant · 14 wk</Text>
          </View>
        </View>

        {/* Leo · toddler */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            backgroundColor: '#FCE6D8',
            borderRadius: 999,
            paddingVertical: 6,
            paddingLeft: 6,
            paddingRight: 13,
          }}
        >
          <View style={{ width: 28, height: 28, backgroundColor: '#D9824F', borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={15} height={15} viewBox="0 0 20 20" fill="white">
              <Circle cx={10} cy={7.5} r={4.5} />
              <Path d="M3 19 Q3 12 10 12 Q17 12 17 19Z" />
            </Svg>
          </View>
          <View>
            <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#9A5A2A' }}>Leo</Text>
            <Text style={{ fontFamily: f.body400, fontSize: 9, color: '#D9824F', marginTop: 2 }}>Toddler · 2y</Text>
          </View>
        </View>
      </View>

      {/* YOU card: pregnancy state again (teal, free) */}
      <LinearGradient
        colors={['#E0F4EF', '#D4EDDB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginHorizontal: 20,
          marginBottom: 10,
          borderRadius: 20,
          padding: 16,
          borderWidth: 2,
          borderColor: '#3A9B8A22',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <View style={{ width: 38, height: 38, backgroundColor: '#3A9B8A', borderRadius: 19, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={19} height={19} viewBox="0 0 20 20" fill="white">
              <Circle cx={10} cy={6.5} r={4} />
              <Path d="M6 13 Q5 10 8 10 Q9 8 11 8 Q14 8 14.5 12 Q15 16 13 17 L7 17 Q5.5 16 6 13Z" />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#1E5C50' }}>You · second pregnancy</Text>
            <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#3A9B8A', marginTop: 3 }}>Week 14 · 182 days to go</Text>
          </View>
          <View style={{ backgroundColor: '#D4EDE7', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 9, color: '#2C8475' }}>Free</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <StatTile value="14w" label="Week" />
          <StatTile value="😊" label="Mood" />
          <StatTile value="Fri" label="Scan" />
        </View>
      </LinearGradient>

      {/* child card: toddler on premium tracking */}
      <View
        style={[
          {
            marginHorizontal: 20,
            marginBottom: 10,
            backgroundColor: '#fff',
            borderRadius: 18,
            paddingVertical: 14,
            paddingHorizontal: 16,
            flexDirection: 'row',
            gap: 12,
            alignItems: 'center',
          },
          shadow.card,
        ]}
      >
        <View style={{ width: 44, height: 44, backgroundColor: '#FCE6D8', borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={22} height={22} viewBox="0 0 20 20" fill="#D9824F">
            <Circle cx={10} cy={7.5} r={5.5} />
            <Path d="M1.5 19 Q1.5 13 10 13 Q18.5 13 18.5 19Z" />
          </Svg>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 14, color: color.ink }}>Leo</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>Toddler · nap & potty tracking</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: '#E7E4FB',
            borderRadius: 999,
            paddingVertical: 4,
            paddingHorizontal: 9,
          }}
        >
          <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
            <Path d="M12 9.5c0-2-1.6-3.6-3.7-3.6C8.1 8 9.7 9.5 12 9.5z" fill="#A9ABE6" />
            <Rect x={7.5} y={10.5} width={9} height={7.5} rx={2} fill="#6B6FC9" />
            <Path d="M9.7 10.5V9a2.3 2.3 0 0 1 4.6 0v1.5" stroke="#6B6FC9" strokeWidth={1.5} fill="none" />
          </Svg>
          <Text style={{ fontFamily: f.body700, fontSize: 9, color: '#6B6FC9' }}>Pro</Text>
        </View>
      </View>

      {/* coexist note */}
      <View
        style={{
          marginTop: 2,
          marginHorizontal: 20,
          backgroundColor: '#FBF1CE',
          borderRadius: 13,
          paddingVertical: 11,
          paddingHorizontal: 14,
          flexDirection: 'row',
          gap: 9,
          alignItems: 'center',
        }}
      >
        <Svg width={15} height={15} viewBox="0 0 24 24" fill="#C9A33B">
          <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </Svg>
        <Text style={{ flex: 1, fontFamily: f.body400, fontSize: 11, lineHeight: 15, color: '#7A5C20' }}>
          Your new pregnancy runs <Text style={{ fontFamily: f.body700 }}>free</Text> alongside Leo's premium tracking — no
          conflict.
        </Text>
      </View>

      <View style={{ height: 24 }} />

      {/* bottom nav (teal Today, Children slot) */}
      <View
        style={{
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: 'rgba(51,50,74,0.06)',
          paddingTop: 10,
          paddingHorizontal: 8,
          paddingBottom: 28,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <NavItem label="Today" active>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#3A9B8A" strokeWidth={2} strokeLinecap="round">
            <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </Svg>
        </NavItem>
        <NavItem label="Calendar">
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
            <Rect x={3} y={4} width={18} height={18} rx={3} />
            <Path d="M16 2v4M8 2v4M3 10h18" />
          </Svg>
        </NavItem>
        {/* FAB */}
        <View
          style={[
            {
              width: 52,
              height: 52,
              backgroundColor: '#3A9B8A',
              borderRadius: 26,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -18,
            },
            {
              shadowColor: '#3A9B8A',
              shadowOpacity: 0.4,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
              elevation: 5,
            },
          ]}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
            <Path d="M12 5v14M5 12h14" />
          </Svg>
        </View>
        <NavItem label="Children">
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
            <Circle cx={9} cy={7} r={4} />
            <Path d="M2 20c0-3.31 3.13-6 7-6s7 2.69 7 6" />
          </Svg>
        </NavItem>
        <NavItem label="Settings">
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
            <Circle cx={12} cy={8} r={4} />
            <Path d="M20 21a8 8 0 1 0-16 0" />
          </Svg>
        </NavItem>
      </View>
    </View>
  );
}

/* ── helpers ──────────────────────────────────────────────────────────── */

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 13,
        paddingVertical: 9,
        paddingHorizontal: 6,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontFamily: font.display700, fontSize: 16, color: '#1E5C50' }}>{value}</Text>
      <Text style={{ fontFamily: font.body600, fontSize: 9, color: '#3A9B8A', marginTop: 3 }}>{label}</Text>
    </View>
  );
}

function NavItem({ label, active = false, children }: { label: string; active?: boolean; children: React.ReactNode }) {
  return (
    <View style={{ alignItems: 'center', gap: 3 }}>
      <View
        style={{
          width: 44,
          height: 32,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? '#E0F4EF' : 'transparent',
        }}
      >
        {children}
      </View>
      <Text style={{ fontFamily: font.body600, fontSize: 9, color: active ? '#3A9B8A' : color.muted }}>{label}</Text>
    </View>
  );
}
