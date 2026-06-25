import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* 06 · Health Hub — health records + Pediatrician PDF button preview. */
export default function O06HealthHub() {
  return (
    <View style={{ backgroundColor: c.canvas, minHeight: 720, position: 'relative' }}>
      <StatusBar />

      {/* Skip */}
      <View style={{ position: 'absolute', top: 14, right: 26 }}>
        <Text style={{ fontFamily: f.body600, fontSize: 13, color: c.muted }}>Skip</Text>
      </View>

      {/* floating deco */}
      <View
        style={{
          position: 'absolute',
          top: 90,
          right: 22,
          width: 44,
          height: 44,
          backgroundColor: '#FBE0EA',
          borderRadius: 14,
          transform: [{ rotate: '7deg' }],
        }}
      />
      <Text style={{ position: 'absolute', top: 88, left: 60, fontSize: 13, color: '#E9C46A' }}>✦</Text>

      {/* content */}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
          zIndex: 2,
        }}
      >
        {/* shield icon */}
        <View style={{ marginBottom: 20 }}>
          <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <Path d="M9 12l2 2 4-4" />
          </Svg>
        </View>

        {/* health rows preview */}
        <View
          style={[
            { backgroundColor: '#fff', borderRadius: 20, width: '100%', overflow: 'hidden', marginBottom: 16 },
            shadow.card,
          ]}
        >
          {/* row 1 — vaccine */}
          <View
            style={{
              paddingVertical: 14,
              paddingHorizontal: 18,
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(51,50,74,0.05)',
            }}
          >
            <View style={{ width: 36, height: 36, backgroundColor: '#FBE0EA', borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#D46E97" strokeWidth={2} strokeLinecap="round">
                <Path d="M11 3l10 10-4 4L7 7z" />
                <Path d="M7 7L3 11l4 4M5 15l-2 4M15 5l4-2" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink, marginBottom: 2 }}>6-in-1 vaccine</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted }}>Due in 9 days</Text>
            </View>
            <View style={{ backgroundColor: '#FBE0EA', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#D46E97' }}>Reminder set</Text>
            </View>
          </View>

          {/* row 2 — vitamin D */}
          <View
            style={{
              paddingVertical: 14,
              paddingHorizontal: 18,
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(51,50,74,0.05)',
            }}
          >
            <View style={{ width: 36, height: 36, backgroundColor: '#D8F0E6', borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3FA98A" strokeWidth={2} strokeLinecap="round">
                <Circle cx="12" cy="12" r="10" />
                <Line x1="12" y1="8" x2="12" y2="12" />
                <Line x1="12" y1="16" x2="12.01" y2="16" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink, marginBottom: 2 }}>Vitamin D drops</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted }}>Daily 08:00 ✓</Text>
            </View>
          </View>

          {/* row 3 — weight */}
          <View style={{ paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={{ width: 36, height: 36, backgroundColor: '#FBF1CE', borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#C9A33B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink, marginBottom: 2 }}>Weight · 6.4 kg · 75th %ile</Text>
            </View>
          </View>
        </View>

        {/* PDF button preview */}
        <View
          style={{
            backgroundColor: '#6B6FC9',
            paddingVertical: 14,
            paddingHorizontal: 22,
            borderRadius: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            marginBottom: 20,
            shadowColor: '#6B6FC9',
            shadowOpacity: 0.3,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <Path d="M14 2v6h6" />
          </Svg>
          <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#fff' }}>Generate Pediatrician PDF</Text>
        </View>

        {/* headline + subtitle */}
        <Text style={{ fontFamily: f.display700, fontSize: 28, lineHeight: 34, color: c.ink, marginBottom: 10, textAlign: 'center' }}>
          <Text style={{ color: '#6B6FC9' }}>Health</Text> records, always with you
        </Text>
        <Text style={{ fontFamily: f.body400, fontSize: 14, lineHeight: 21, color: c.inkSecondary, textAlign: 'center' }}>
          One-tap Pediatrician PDF — on-device, never uploaded.
        </Text>
      </View>

      {/* footer: Back · dots · Next */}
      <View
        style={{
          paddingTop: 24,
          paddingHorizontal: 32,
          paddingBottom: 44,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontFamily: f.body600, fontSize: 14, color: c.muted }}>Back</Text>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {Array.from({ length: 9 }).map((_, i) =>
            i === 5 ? (
              <View key={i} style={{ width: 22, height: 7, backgroundColor: '#6B6FC9', borderRadius: 4 }} />
            ) : (
              <View key={i} style={{ width: 7, height: 7, backgroundColor: 'rgba(107,111,201,0.22)', borderRadius: 3.5 }} />
            ),
          )}
        </View>
        <View
          style={[
            {
              backgroundColor: '#6B6FC9',
              paddingVertical: 14,
              paddingHorizontal: 28,
              borderRadius: 15,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            },
            shadow.periwinkleButton,
          ]}
        >
          <Text style={{ fontFamily: f.body800, fontSize: 15, color: '#fff' }}>Next</Text>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
            <Path d="M5 12h14M12 5l7 7-7 7" />
          </Svg>
        </View>
      </View>
    </View>
  );
}
