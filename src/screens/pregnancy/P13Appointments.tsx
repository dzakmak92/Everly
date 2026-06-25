import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Rect, Polyline } from 'react-native-svg';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* P13 · Appointments & Test Results. SAFETY screen. */
export default function P13Appointments() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* title */}
      <View style={{ paddingTop: 10, paddingBottom: 14, paddingHorizontal: 24 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Appointments & Tests</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginTop: 4 }}>
          Week 24 · All records on-device only
        </Text>
      </View>

      {/* tabs */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', gap: 6 }}>
        <View style={{ backgroundColor: '#E98FB3', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 16 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#fff' }}>Appointments</Text>
        </View>
        <TabPill label="Test Results" />
        <TabPill label="Reports" />
      </View>

      {/* upcoming + test results */}
      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        <Text
          style={{
            fontFamily: f.body700,
            fontSize: 11,
            letterSpacing: 0.9,
            textTransform: 'uppercase',
            color: '#D46E97',
            paddingLeft: 4,
            marginBottom: 2,
          }}
        >
          Upcoming
        </Text>

        <View style={[{ backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden' }, shadow.card]}>
          {/* Anatomy scan */}
          <View
            style={{
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(51,50,74,0.05)',
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                backgroundColor: '#E7E4FB',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round">
                <Rect x="3" y="4" width="18" height="18" rx="3" />
                <Path d="M16 2v4M8 2v4M3 10h18" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink, marginBottom: 2 }}>
                Anatomy scan · Fri 27 Jun
              </Text>
              <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted }}>
                Dr. Walsh · City Maternity · 09:00am
              </Text>
            </View>
            <View style={{ backgroundColor: '#E7E4FB', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#6B6FC9' }}>4 days</Text>
            </View>
          </View>

          {/* GTT blood test */}
          <View style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View
              style={{
                width: 42,
                height: 42,
                backgroundColor: '#FBF1CE',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#C9A33B" strokeWidth={2} strokeLinecap="round">
                <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <Polyline points="22 4 12 14.01 9 11.01" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink, marginBottom: 2 }}>
                GTT blood test · 5 Jul
              </Text>
              <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted }}>
                Fasting from midnight · 2-hour test
              </Text>
            </View>
            <View style={{ backgroundColor: '#FBF1CE', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#C9A33B' }}>12 days</Text>
            </View>
          </View>
        </View>

        {/* recent test results */}
        <Text
          style={{
            fontFamily: f.body700,
            fontSize: 11,
            letterSpacing: 0.9,
            textTransform: 'uppercase',
            color: c.muted,
            paddingLeft: 4,
            marginTop: 6,
            marginBottom: 2,
          }}
        >
          Recent test results
        </Text>
        <View style={[{ backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden' }, shadow.card]}>
          <ResultRow
            dot="#3A9B8A"
            title="Bloods · Week 16"
            subtitle="Iron 98 µg/dL · Low normal"
            pillBg="#D8F0E6"
            pillFg="#3FA98A"
            pillLabel="Normal"
          />
          <ResultRow
            dot="#3A9B8A"
            title="12-wk NT scan"
            subtitle="NT 1.4mm · Low risk"
            pillBg="#D8F0E6"
            pillFg="#3FA98A"
            pillLabel="Clear"
          />
          <ResultRow
            dot="#C9A33B"
            title="Group B Strep · Week 36"
            subtitle="Pending — not yet due"
            pillBg="#FBF1CE"
            pillFg="#C9A33B"
            pillLabel="Scheduled"
            last
          />
        </View>
      </View>

      <View style={{ height: 28 }} />
    </View>
  );
}

function TabPill({ label }: { label: string }) {
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 999,
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: 'rgba(51,50,74,0.08)',
      }}
    >
      <Text style={{ fontFamily: font.body600, fontSize: 12, color: '#6F6E86' }}>{label}</Text>
    </View>
  );
}

function ResultRow({
  dot,
  title,
  subtitle,
  pillBg,
  pillFg,
  pillLabel,
  last = false,
}: {
  dot: string;
  title: string;
  subtitle: string;
  pillBg: string;
  pillFg: string;
  pillLabel: string;
  last?: boolean;
}) {
  return (
    <View
      style={{
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: 'rgba(51,50,74,0.05)',
      }}
    >
      <View style={{ width: 10, height: 10, backgroundColor: dot, borderRadius: 5 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>{title}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted, marginTop: 2 }}>{subtitle}</Text>
      </View>
      <View style={{ backgroundColor: pillBg, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 10, color: pillFg }}>{pillLabel}</Text>
      </View>
    </View>
  );
}
