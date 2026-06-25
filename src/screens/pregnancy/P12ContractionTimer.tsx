import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* P12 · Contraction Timer (5-1-1) — labour tracking. SAFETY screen. */
export default function P12ContractionTimer() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* title */}
      <View style={{ paddingTop: 10, paddingBottom: 14, paddingHorizontal: 24 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Contraction Timer</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginTop: 4 }}>
          Labour tracking · Share with partner or doula
        </Text>
      </View>

      {/* 5-1-1 status banner */}
      <LinearGradient
        colors={['#FBF1CE', '#FCE6D8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginHorizontal: 20,
          marginBottom: 14,
          borderRadius: 18,
          padding: 14,
          paddingHorizontal: 18,
          flexDirection: 'row',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            backgroundColor: '#C9A33B',
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="white">
            <Path d="M12 2c5.5 0 10 4.5 10 10S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2z" />
            <Path d="M12 6v6l4 2" stroke="white" strokeWidth={2} fill="none" strokeLinecap="round" />
          </Svg>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#7A5C20', marginBottom: 3 }}>
            5-1-1 Rule · Getting close
          </Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#8A6A20', lineHeight: 17 }}>
            Every 5 min · Lasting 1 min · For 1 hour → call your provider
          </Text>
        </View>
      </LinearGradient>

      {/* main timer card */}
      <View
        style={[
          {
            marginHorizontal: 20,
            marginBottom: 14,
            backgroundColor: '#fff',
            borderRadius: 22,
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
            marginBottom: 8,
          }}
        >
          Session · 2h 14m running
        </Text>
        {/* big timer display */}
        <Text style={{ fontFamily: f.display700, fontSize: 56, color: '#E98FB3', marginTop: 10, marginBottom: 4 }}>
          0:58
        </Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginBottom: 4 }}>current contraction</Text>

        {/* 3-stat row */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 20 }}>
          <Stat value="4:48" label="since last" />
          <View style={{ width: 1, backgroundColor: 'rgba(51,50,74,0.08)' }} />
          <Stat value="1:02" label="avg duration" />
          <View style={{ width: 1, backgroundColor: 'rgba(51,50,74,0.08)' }} />
          <Stat value="5:12" label="avg interval" />
        </View>

        {/* control row */}
        <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
          {/* pause */}
          <View
            style={{
              width: 60,
              height: 60,
              backgroundColor: '#F4F3FB',
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
              <Rect x="6" y="4" width="4" height="16" />
              <Rect x="14" y="4" width="4" height="16" />
            </Svg>
          </View>
          {/* STOP */}
          <LinearGradient
            colors={['#E98FB3', '#D46E97']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              {
                width: 96,
                height: 96,
                borderRadius: 48,
                alignItems: 'center',
                justifyContent: 'center',
              },
              shadow.pinkButton,
            ]}
          >
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="white">
              <Path d="M12 2c5.5 0 10 4.5 10 10S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2z" />
              <Path d="M12 6v6l4 2" stroke="white" strokeWidth={2} fill="none" strokeLinecap="round" />
            </Svg>
            <Text style={{ fontFamily: f.body700, fontSize: 11, color: 'white', marginTop: 5 }}>STOP</Text>
          </LinearGradient>
          {/* share */}
          <View
            style={{
              width: 60,
              height: 60,
              backgroundColor: '#FBE0EA',
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#D46E97" strokeWidth={2} strokeLinecap="round">
              <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </Svg>
          </View>
        </View>
      </View>

      {/* recent contractions list */}
      <View style={{ paddingHorizontal: 20, gap: 6 }}>
        <Text
          style={{
            fontFamily: f.body700,
            fontSize: 11,
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            color: c.muted,
            paddingLeft: 4,
            marginBottom: 4,
          }}
        >
          Recent contractions
        </Text>
        <View style={[{ backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden' }, shadow.row]}>
          {/* header */}
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(51,50,74,0.04)',
            }}
          >
            <Text style={{ flex: 1, fontFamily: f.body600, fontSize: 10, color: c.muted }}>TIME</Text>
            <Text style={{ flex: 1, fontFamily: f.body600, fontSize: 10, color: c.muted, textAlign: 'center' }}>
              DURATION
            </Text>
            <Text style={{ flex: 1, fontFamily: f.body600, fontSize: 10, color: c.muted, textAlign: 'right' }}>
              INTERVAL
            </Text>
          </View>
          <ContractionRow time="9:36 pm" duration="1m 02s" interval="4m 58s" />
          <ContractionRow time="9:30 pm" duration="0m 58s" interval="5m 02s" />
          <ContractionRow time="9:25 pm" duration="1m 04s" interval="5m 10s" last />
        </View>
      </View>

      {/* share button */}
      <View style={{ paddingTop: 14, paddingBottom: 28, paddingHorizontal: 20 }}>
        <View
          style={[
            { backgroundColor: '#6B6FC9', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
            shadow.periwinkleButton,
          ]}
        >
          <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#fff' }}>Share with partner / doula →</Text>
        </View>
      </View>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontFamily: font.display700, fontSize: 22, color: color.ink }}>{value}</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 10, color: color.muted }}>{label}</Text>
    </View>
  );
}

function ContractionRow({
  time,
  duration,
  interval,
  last = false,
}: {
  time: string;
  duration: string;
  interval: string;
  last?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: 'rgba(51,50,74,0.04)',
      }}
    >
      <Text style={{ flex: 1, fontFamily: font.body400, fontSize: 12, color: color.ink }}>{time}</Text>
      <Text style={{ flex: 1, fontFamily: font.body700, fontSize: 12, color: '#E98FB3', textAlign: 'center' }}>
        {duration}
      </Text>
      <Text style={{ flex: 1, fontFamily: font.body400, fontSize: 12, color: color.muted, textAlign: 'right' }}>
        {interval}
      </Text>
    </View>
  );
}
