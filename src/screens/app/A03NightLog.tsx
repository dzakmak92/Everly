import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font } from '../../theme/tokens';

const f = font;
const c = color;

/* 03 · Night Log — dark low-light logger for night feeds/sleep/diaper/pump. */
export default function A03NightLog() {
  return (
    <View style={{ backgroundColor: c.nightBg }}>
      {/* status bar dark */}
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
        <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#EDEBFA' }}>3:14</Text>
        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
          <Svg width={16} height={11} viewBox="0 0 16 11">
            <Rect x="0" y="6" width="3" height="5" rx="0.7" fill="#EDEBFA" />
            <Rect x="4.5" y="4" width="3" height="7" rx="0.7" fill="#EDEBFA" />
            <Rect x="9" y="2" width="3" height="9" rx="0.7" fill="#EDEBFA" />
            <Rect x="13.5" y="0" width="2.5" height="11" rx="0.7" fill="#EDEBFA" />
          </Svg>
          <Svg width={15} height={11} viewBox="0 0 15 11">
            <Circle cx="7.5" cy="10.2" r="0.9" fill="#EDEBFA" />
            <Path d="M4.5 7.5Q7.5 5 10.5 7.5" fill="none" stroke="#EDEBFA" strokeWidth={1.4} strokeLinecap="round" />
            <Path d="M2 4.8Q7.5 1 13 4.8" fill="none" stroke="#EDEBFA" strokeWidth={1.4} strokeLinecap="round" />
          </Svg>
          <Svg width={23} height={12} viewBox="0 0 23 12">
            <Rect x="0.6" y="0.6" width="18.8" height="10.8" rx="2.8" stroke="#EDEBFA" strokeWidth={1.2} fill="none" opacity={0.4} />
            <Rect x="2" y="2" width="7" height="8" rx="1.5" fill="#EDEBFA" />
            <Path d="M20 4v4" stroke="#EDEBFA" strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />
          </Svg>
        </View>
      </View>

      {/* title */}
      <View style={{ paddingTop: 10, paddingHorizontal: 26, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
          <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </Svg>
        <Text style={{ fontFamily: f.display700, fontSize: 18, color: '#EDEBFA' }}>Night log</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#6F6E86', marginLeft: 'auto' }}>Oliver · 4 mo</Text>
      </View>

      {/* wake-window banner */}
      <LinearGradient
        colors={['#5A5EB8', '#7B7FCC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          marginHorizontal: 20,
          marginBottom: 16,
          borderRadius: 16,
          paddingVertical: 14,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round">
          <Circle cx="12" cy="12" r="10" />
          <Path d="M12 6v6l4 2" />
        </Svg>
        <View>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#fff' }}>Wake window</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>
            Next nap in ~35 min
          </Text>
        </View>
        <View style={{ marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#fff' }}>Active</Text>
        </View>
      </LinearGradient>

      {/* 2×2 tiles */}
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <QuickTile
          tint="#D8F0E6"
          label="Feed"
          sub="5:23 am · Left"
          icon={
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#D8F0E6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M8 2h8" />
              <Path d="M9 2v3a5.5 5.5 0 0 0-3 4.9V19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-9.1A5.5 5.5 0 0 0 15 5V2" />
            </Svg>
          }
        />
        <QuickTile
          tint="#E7E4FB"
          label="Sleep"
          sub="14h 20m today"
          icon={
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#E7E4FB" strokeWidth={2} strokeLinecap="round">
              <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </Svg>
          }
        />
        <QuickTile
          tint="#FBF1CE"
          label="Diaper"
          sub="Wet · 4:10 am"
          icon={
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#FBF1CE" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M4 8l4-4 4 4 4-4 4 4v8l-4 4-4-4-4 4-4-4V8z" />
            </Svg>
          }
        />
        <QuickTile
          tint="#FBE0EA"
          label="Pump"
          sub="60 ml stash"
          icon={
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#FBE0EA" strokeWidth={2} strokeLinecap="round">
              <Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </Svg>
          }
        />
      </View>

      {/* tallies */}
      <View
        style={{
          marginTop: 16,
          marginHorizontal: 20,
          marginBottom: 32,
          backgroundColor: c.nightCard,
          borderRadius: 16,
          paddingVertical: 14,
          paddingHorizontal: 10,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <Tally value="6" label="feeds" />
        <TallyDivider />
        <Tally value="14h" label="sleep" />
        <TallyDivider />
        <Tally value="4" label="wet" />
        <TallyDivider />
        <Tally value="720" label="ml" />
      </View>
    </View>
  );
}

function QuickTile({ tint, label, sub, icon }: { tint: string; label: string; sub: string; icon: React.ReactNode }) {
  return (
    <View
      style={{
        width: '47%',
        flexGrow: 1,
        backgroundColor: color.nightCard,
        borderRadius: 18,
        paddingVertical: 22,
        paddingHorizontal: 16,
        alignItems: 'center',
        gap: 10,
      }}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <Text style={{ fontFamily: font.body700, fontSize: 15, color: '#EDEBFA' }}>{label}</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 11, color: '#6F6E86' }}>{sub}</Text>
    </View>
  );
}

function Tally({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontFamily: font.display700, fontSize: 18, color: '#EDEBFA' }}>{value}</Text>
      <Text
        style={{
          fontFamily: font.body400,
          fontSize: 9,
          color: '#6F6E86',
          marginTop: 4,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function TallyDivider() {
  return <View style={{ width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.07)' }} />;
}
