import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';
import { ChildNav } from './A06ChildProfile';

const f = font;
const c = color;

/* 07 · Rhythm Ring — 24h radial clock with colored arcs (feeds/sleeps/diapers), legend, sparkline cards. */
export default function A07RhythmRing() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar showIcons />

      {/* header: title + child chip */}
      <View
        style={{
          paddingTop: 10,
          paddingHorizontal: 24,
          paddingBottom: 4,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontFamily: f.display700, fontSize: 18, color: c.ink }}>Oliver's Rhythm</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: '#D8F0E6',
            borderRadius: 999,
            paddingVertical: 5,
            paddingRight: 12,
            paddingLeft: 5,
          }}
        >
          <View style={{ width: 20, height: 20, backgroundColor: '#3FA98A', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={10} height={10} viewBox="0 0 20 20" fill="white">
              <Circle cx="10" cy="7.5" r="5" />
              <Path d="M2 19Q2 13 10 13Q18 13 18 19Z" />
            </Svg>
          </View>
          <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#3FA98A' }}>Oliver</Text>
        </View>
      </View>

      {/* ring card */}
      <View
        style={[
          { marginTop: 12, marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 22, padding: 16 },
          shadow.card,
        ]}
      >
        <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={248} height={248} viewBox="0 0 260 260">
            {/* base track ring */}
            <Circle cx="130" cy="130" r="92.5" fill="none" stroke="rgba(51,50,74,0.06)" strokeWidth={35} />
            {/* sleep arc (lilac) */}
            <Path d="M75 35 A110 110 0 0 1 236 159 L203 149 A75 75 0 0 0 93 65 Z" fill="#E7E4FB" />
            {/* feed arcs (mint) */}
            <Path d="M240 130 A110 110 0 0 1 232 172 L199 159 A75 75 0 0 0 205 130 Z" fill="#D8F0E6" />
            <Path d="M197 217 A110 110 0 0 1 158 236 L149 202 A75 75 0 0 0 176 189 Z" fill="#D8F0E6" />
            <Path d="M101 236 A110 110 0 0 1 63 217 L84 189 A75 75 0 0 0 111 202 Z" fill="#D8F0E6" />
            <Path d="M28 172 A110 110 0 0 1 20 130 L55 130 A75 75 0 0 0 61 159 Z" fill="#D8F0E6" />
            <Path d="M34 75 A110 110 0 0 1 63 43 L84 71 A75 75 0 0 0 65 92 Z" fill="#D8F0E6" />
            {/* diaper markers (peach) */}
            <Circle cx="210" cy="176" r="8" fill="#FCE6D8" stroke="white" strokeWidth={2.5} />
            <Circle cx="130" cy="222" r="8" fill="#FCE6D8" stroke="white" strokeWidth={2.5} />
            <Circle cx="50" cy="176" r="8" fill="#FCE6D8" stroke="white" strokeWidth={2.5} />
            {/* hour ticks */}
            <Circle cx="130" cy="20" r="2" fill="#9C9AB2" opacity={0.2} />
            <Circle cx="240" cy="130" r="2" fill="#9C9AB2" opacity={0.2} />
            <Circle cx="130" cy="240" r="2" fill="#9C9AB2" opacity={0.2} />
            <Circle cx="20" cy="130" r="2" fill="#9C9AB2" opacity={0.2} />
          </Svg>
          {/* center label */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            pointerEvents="none"
          >
            <Text style={{ fontFamily: f.display700, fontSize: 24, color: c.ink }}>14h 20m</Text>
            <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted, marginTop: 4 }}>total sleep</Text>
            <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#6B6FC9', marginTop: 5 }}>↑ 20m vs avg</Text>
          </View>
        </View>

        {/* legend */}
        <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'center', marginTop: 14 }}>
          <LegendItem swatchColor="#E7E4FB" round={false} label="Sleep" />
          <LegendItem swatchColor="#D8F0E6" round={false} label="Feeds" />
          <LegendItem swatchColor="#FCE6D8" round label="Diapers" />
        </View>
      </View>

      {/* stat sparkline cards */}
      <View style={{ paddingTop: 12, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', gap: 8 }}>
        <SparkCard label="Avg sleep" value="13.8h" line="M0 12 L11 10 L22 13 L33 8 L44 7 L55 5 L68 4" lineColor="#E7E4FB" />
        <SparkCard label="Feeds/day" value="6.2" line="M0 10 L11 8 L22 12 L33 6 L44 9 L55 7 L68 5" lineColor="#D8F0E6" />
        <SparkCard label="Growth" value="75th" line="M0 14 L11 12 L22 11 L33 9 L44 7 L55 6 L68 4" lineColor="#FBF1CE" />
      </View>

      <ChildNav active="Today" />
    </View>
  );
}

function LegendItem({ swatchColor, round, label }: { swatchColor: string; round: boolean; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 10, height: 10, backgroundColor: swatchColor, borderRadius: round ? 5 : 3 }} />
      <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.inkSecondary }}>{label}</Text>
    </View>
  );
}

function SparkCard({ label, value, line, lineColor }: { label: string; value: string; line: string; lineColor: string }) {
  return (
    <View
      style={[
        { flex: 1, backgroundColor: '#fff', borderRadius: 18, paddingVertical: 14, paddingHorizontal: 10 },
        shadow.card,
      ]}
    >
      <Text
        style={{
          fontFamily: font.body400,
          fontSize: 9,
          color: color.muted,
          letterSpacing: 0.9,
          textTransform: 'uppercase',
          marginBottom: 5,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink, marginBottom: 7 }}>{value}</Text>
      <Svg width={68} height={18} viewBox="0 0 68 18" fill="none">
        <Path d={line} stroke={lineColor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}
