import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';
import { color, font, radius, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';
import { CalendarBottomNav } from './A04Calendar';

const f = font;
const c = color;

/* A05 · Health Hub — vaccine / medication / growth records, privacy note, PDF CTA. */
export default function A05HealthHub({ embedded = false }: { embedded?: boolean }) {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      {!embedded && <StatusBar showIcons />}

      {/* header */}
      <View style={{ paddingVertical: 14, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Health</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2', marginTop: 5 }}>Records &amp; reminders</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#D8F0E6',
            borderRadius: 999,
            paddingVertical: 6,
            paddingRight: 14,
            paddingLeft: 6,
          }}
        >
          <View style={{ width: 24, height: 24, backgroundColor: '#3FA98A', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={12} height={12} viewBox="0 0 20 20" fill="white">
              <Circle cx="10" cy="8" r="4.5" />
              <Path d="M3 19Q3 14 10 14Q17 14 17 19Z" />
            </Svg>
          </View>
          <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#3FA98A' }}>Oliver</Text>
        </View>
      </View>

      {/* privacy note */}
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 14,
          backgroundColor: '#E7E4FB',
          borderRadius: 14,
          paddingVertical: 10,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <Path d="M9 12l2 2 4-4" />
        </Svg>
        <Text style={{ flex: 1, fontFamily: f.body500, fontSize: 12, lineHeight: 17, color: '#54579E' }}>
          Health data stays on this device. Never shared or uploaded.
        </Text>
      </View>

      {/* health records */}
      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        {/* vaccine (rose, urgent) */}
        <View style={[recordCard]}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={chip('#FBE0EA')}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#D46E97" strokeWidth={2} strokeLinecap="round">
                <Path d="M11 3l10 10-4 4L7 7z" />
                <Path d="M7 7L3 11l4 4M5 15l-2 4M15 5l4-2" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.ink, marginBottom: 4 }}>6-in-1 vaccine</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2' }}>DTaP-IPV-Hib-HepB · Dr. Brennan</Text>
            </View>
            <View style={{ backgroundColor: '#FBE0EA', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#D46E97' }}>9 days</Text>
            </View>
          </View>
        </View>

        {/* medication (mint, ok) */}
        <View style={[recordCard]}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={chip('#D8F0E6')}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#3FA98A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M10.5 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7.5" />
                <Path d="M8 6v4M12 6v4M16 6v4" />
                <Circle cx="18" cy="18" r="4" />
                <Path d="M18 16v4M16 18h4" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.ink, marginBottom: 4 }}>Vitamin D drops · 0.5 ml</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2' }}>Daily · 08:00 · Reminder set</Text>
            </View>
            <View style={{ width: 28, height: 28, backgroundColor: '#D8F0E6', borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#3FA98A" strokeWidth={2.5} strokeLinecap="round">
                <Path d="M5 13l4 4L19 7" />
              </Svg>
            </View>
          </View>
        </View>

        {/* growth chart (butter/gold) */}
        <View style={[recordCard]}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={chip('#FBF1CE')}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#C9A33B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.ink, marginBottom: 6 }}>Weight · 6.4 kg</Text>
              <Svg width={100} height={24} viewBox="0 0 100 24" fill="none" style={{ marginBottom: 5 }}>
                {/* faint shaded "typical range" band */}
                <Path d="M0 20L16 18L32 16L48 12L64 9L80 7L100 5L100 24L0 24Z" fill="#FBF1CE" opacity={0.4} />
                {/* trend line */}
                <Path
                  d="M0 20L16 18L32 16L48 12L64 9L80 7L100 5"
                  stroke="#C9A33B"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.7}
                />
                <Circle cx="100" cy="5" r="3" fill="#C9A33B" />
              </Svg>
              <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2' }}>75th percentile · Jun 10</Text>
            </View>
          </View>
        </View>
      </View>

      {/* PDF button */}
      <View style={{ paddingTop: 18, paddingHorizontal: 20, paddingBottom: 6 }}>
        <View
          style={[
            {
              backgroundColor: '#6B6FC9',
              paddingVertical: 17,
              paddingHorizontal: 24,
              borderRadius: 15,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            },
            shadow.periwinkleButton,
          ]}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <Path d="M14 2v6h6" />
            <Path d="M16 13H8M16 17H8M10 9H8" />
          </Svg>
          <Text style={{ fontFamily: f.body800, fontSize: 16, color: '#fff' }}>Generate Pediatrician PDF</Text>
        </View>
        <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2', textAlign: 'center', marginTop: 10 }}>
          Created on-device · Never uploaded
        </Text>
      </View>

      {/* bottom nav (Family active) */}
      {!embedded && <CalendarBottomNav active="Family" />}
    </View>
  );
}

const recordCard = [
  {
    backgroundColor: '#fff',
    borderRadius: radius.cardSm,
    padding: 16,
  },
  shadow.card,
];

const chip = (bg: string) => ({
  width: 40,
  height: 40,
  backgroundColor: bg,
  borderRadius: 12,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
});
