import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* P15 · Red-Flag "When to Call" Triage — safety screen, never gated. */
export default function P15RedFlagTriage() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* title */}
      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 14 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>When to Call</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginTop: 4 }}>
          Safety guidance · Not diagnosis · Always free
        </Text>
      </View>

      {/* disclaimer */}
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 12,
          backgroundColor: '#E7E4FB',
          borderRadius: 14,
          paddingVertical: 10,
          paddingHorizontal: 14,
          flexDirection: 'row',
          gap: 8,
          alignItems: 'flex-start',
        }}
      >
        <Svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6B6FC9"
          strokeWidth={2}
          strokeLinecap="round"
          style={{ marginTop: 1 }}
        >
          <Circle cx="12" cy="12" r="10" />
          <Line x1="12" y1="8" x2="12" y2="12" />
          <Line x1="12" y1="16" x2="12.01" y2="16" />
        </Svg>
        <Text style={{ flex: 1, fontFamily: f.body400, fontSize: 11, lineHeight: 15.4, color: '#54579E' }}>
          This is a triage guide, not medical advice. If something feels wrong, trust your instincts and call your
          midwife or GP.
        </Text>
      </View>

      {/* triage sections */}
      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        {/* call now */}
        <Text
          style={{
            fontFamily: f.body700,
            fontSize: 11,
            letterSpacing: 0.9,
            textTransform: 'uppercase',
            color: '#D46E97',
            paddingLeft: 4,
          }}
        >
          Call now or go to hospital
        </Text>
        <View style={[{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' }, shadow.row]}>
          <TriageRow dot="#D46E97" text="Reduced or absent foetal movement" divider />
          <TriageRow dot="#D46E97" text="Heavy vaginal bleeding at any stage" divider />
          <TriageRow dot="#D46E97" text="Severe headache, vision changes, facial swelling" divider />
          <TriageRow dot="#D46E97" text="Sudden severe pain anywhere" />
        </View>

        {/* call soon */}
        <Text
          style={{
            fontFamily: f.body700,
            fontSize: 11,
            letterSpacing: 0.9,
            textTransform: 'uppercase',
            color: '#C9A33B',
            paddingLeft: 4,
            marginTop: 4,
          }}
        >
          Call your midwife today
        </Text>
        <View style={[{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' }, shadow.row]}>
          <TriageRow dot="#C9A33B" text="Fever above 38°C" divider />
          <TriageRow dot="#C9A33B" text="Painful or burning urination" divider />
          <TriageRow dot="#C9A33B" text="Leaking fluid from vagina (waters)" />
        </View>

        {/* quick contact */}
        <View
          style={[
            {
              marginTop: 4,
              backgroundColor: '#E98FB3',
              padding: 14,
              borderRadius: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            },
            shadow.pinkButton,
          ]}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round">
            <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12 19.79 19.79 0 0 1 1.07 3.39 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" />
          </Svg>
          <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#fff' }}>Call Midwife · Maternity Unit</Text>
        </View>
      </View>

      <View style={{ height: 28 }} />
    </View>
  );
}

function TriageRow({ dot, text, divider = false }: { dot: string; text: string; divider?: boolean }) {
  return (
    <View
      style={{
        paddingVertical: 13,
        paddingHorizontal: 16,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: 'rgba(51,50,74,0.05)',
      }}
    >
      <View style={{ width: 10, height: 10, backgroundColor: dot, borderRadius: 5 }} />
      <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 13, lineHeight: 17, color: color.ink }}>{text}</Text>
    </View>
  );
}
