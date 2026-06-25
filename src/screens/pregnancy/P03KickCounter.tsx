import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, radius, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';
import { Info } from '../../components/icons';

const f = font;
const c = color;

/* P03 · Kick Counter — daily fetal movement tracking (safety screen). */
export default function P03KickCounter() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* title */}
      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 16 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Kick Counter</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginTop: 4 }}>
          Daily movement tracking · Contraction timing lives in P12
        </Text>
      </View>

      {/* multiples toggle */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Text style={{ fontFamily: f.body600, fontSize: 11, color: c.muted }}>Expecting twins?</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <View style={{ backgroundColor: '#E7E4FB', borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 13 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#6B6FC9' }}>Baby A</Text>
          </View>
          {['Baby B', 'Combined'].map((t) => (
            <View
              key={t}
              style={{
                backgroundColor: '#fff',
                borderRadius: radius.pill,
                paddingVertical: 6,
                paddingHorizontal: 13,
                borderWidth: 1.5,
                borderColor: 'rgba(51,50,74,0.1)',
              }}
            >
              <Text style={{ fontFamily: f.body700, fontSize: 11, color: c.muted }}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* kick session card */}
      <View
        style={[
          {
            marginHorizontal: 20,
            marginBottom: 16,
            backgroundColor: '#fff',
            borderRadius: radius.card,
            padding: 24,
            alignItems: 'center',
          },
          shadow.card,
        ]}
      >
        <Text
          style={{
            fontFamily: f.body400,
            fontSize: 11,
            color: c.muted,
            letterSpacing: 0.9,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Session started · 5:23pm
        </Text>
        <Text style={{ fontFamily: f.display700, fontSize: 72, lineHeight: 72, color: c.accentRose, marginVertical: 12 }}>
          8
        </Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginBottom: 20 }}>
          kicks recorded · target: 10
        </Text>

        {/* progress bar */}
        <View
          style={{
            width: '100%',
            height: 8,
            backgroundColor: '#FBE0EA',
            borderRadius: radius.pill,
            overflow: 'hidden',
            marginBottom: 16,
          }}
        >
          <LinearGradient
            colors={['#E98FB3', '#D46E97']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: '80%', height: '100%', borderRadius: radius.pill }}
          />
        </View>

        {/* big tap button */}
        <LinearGradient
          colors={['#E98FB3', '#D46E97']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            {
              width: 120,
              height: 120,
              borderRadius: 60,
              alignItems: 'center',
              justifyContent: 'center',
            },
            shadow.pinkButton,
          ]}
        >
          <Svg width={36} height={36} viewBox="0 0 24 24" fill="white" stroke="none">
            <Path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 9 14z" />
            <Path d="M9 19c0 1 .5 1 1 2h4c.5-1 1-1 1-2v-5H9z" fill="white" opacity={0.8} />
          </Svg>
          <Text style={{ fontFamily: f.body700, fontSize: 12, color: 'white', marginTop: 6 }}>TAP</Text>
        </LinearGradient>
      </View>

      {/* midwife note */}
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 14,
          backgroundColor: '#FBE0EA',
          borderRadius: 14,
          padding: 12,
          paddingHorizontal: 14,
          flexDirection: 'row',
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <View style={{ marginTop: 1 }}>
          <Info size={16} color={c.rose} />
        </View>
        <Text style={{ flex: 1, fontFamily: f.body400, fontSize: 12, lineHeight: 18, color: c.roseInk }}>
          Contact your midwife if fewer than 10 movements in 2 hours, or if movement pattern changes significantly.
        </Text>
      </View>

      {/* recent sessions */}
      <View style={{ paddingHorizontal: 20, gap: 6 }}>
        <Text
          style={{
            fontFamily: f.body700,
            fontSize: 11,
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            color: c.muted,
            marginBottom: 4,
            paddingLeft: 4,
          }}
        >
          Recent sessions
        </Text>
        <View
          style={[
            { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden' },
            shadow.row,
          ]}
        >
          <SessionRow label="Yesterday · 6:00pm" count="10 kicks" border />
          <SessionRow label="Jun 21 · 11:00am" count="12 kicks" />
        </View>
      </View>

      <View style={{ height: 32 }} />
    </View>
  );
}

function SessionRow({ label, count, border = false }: { label: string; count: string; border?: boolean }) {
  return (
    <View
      style={{
        padding: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: border ? 1 : 0,
        borderBottomColor: 'rgba(51,50,74,0.05)',
      }}
    >
      <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>{count}</Text>
        <View
          style={{
            backgroundColor: '#D8F0E6',
            borderRadius: radius.pill,
            paddingVertical: 3,
            paddingHorizontal: 8,
          }}
        >
          <Text style={{ fontFamily: font.body700, fontSize: 10, color: '#3FA98A' }}>✓</Text>
        </View>
      </View>
    </View>
  );
}
