import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Polyline, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar, SproutLockBadge } from '../../components/ui';
import { Logo } from '../../components/Logo';

const f = font;
const c = color;

/* P14 · Prenatal / Maternal Health PDF — premium on-device export. */
export default function P14PrenatalPDF() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* title */}
      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 14 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Prenatal Report</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginTop: 4 }}>
          Generated on-device · Share with your provider
        </Text>
      </View>

      {/* pdf preview card */}
      <View
        style={[
          {
            marginHorizontal: 20,
            marginBottom: 14,
            backgroundColor: '#fff',
            borderRadius: 22,
            overflow: 'hidden',
          },
          shadow.card,
        ]}
      >
        {/* document header mockup */}
        <LinearGradient
          colors={['#E98FB3', '#D46E97']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingVertical: 20, paddingHorizontal: 22 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <Logo width={28} height={32} color="#FFFFFF" />
            <View>
              <Text style={{ fontFamily: f.display700, fontSize: 14, color: '#fff' }}>Everly</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                Prenatal Health Summary
              </Text>
            </View>
          </View>
          <Text style={{ fontFamily: f.display700, fontSize: 16, lineHeight: 19, color: '#fff', marginBottom: 4 }}>
            Emma Byrne · Week 24
          </Text>
          <Text style={{ fontFamily: f.body400, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
            Generated 23 June 2026 · Confidential
          </Text>
        </LinearGradient>

        {/* report sections */}
        <View style={{ paddingVertical: 16, paddingHorizontal: 18, gap: 10 }}>
          <ReportRow
            emoji="📋"
            emojiBg="#FBE0EA"
            title="Pregnancy overview"
            sub="EDD, current week, weight gain trend"
            divider
          />
          <ReportRow
            emoji="💊"
            emojiBg="#E7E4FB"
            title="Medications & supplements"
            sub="Prenatal vitamins, iron, prescribed meds"
            divider
          />
          <ReportRow emoji="🧪" emojiBg="#D8F0E6" title="Test results" sub="Bloods, scans, GBS, GTT" divider />
          <ReportRow
            emoji="📊"
            emojiBg="#FBF1CE"
            title="Mood & symptom history"
            sub="Perinatal mental health log (EPDS)"
          />
        </View>
      </View>

      {/* generate button */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <View
          style={[
            {
              backgroundColor: '#E98FB3',
              padding: 16,
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
            <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <Polyline points="7 10 12 15 17 10" />
            <Line x1="12" y1="15" x2="12" y2="3" />
          </Svg>
          <Text style={{ fontFamily: f.body700, fontSize: 15, color: '#fff' }}>Generate Maternal Health PDF</Text>
          <SproutLockBadge />
        </View>
      </View>

      {/* on-device note */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <View style={{ backgroundColor: '#F4F3FB', padding: 12, borderRadius: 12 }}>
          <Text style={{ fontFamily: f.body400, fontSize: 11, lineHeight: 15.4, color: '#9C9AB2', textAlign: 'center' }}>
            Created entirely on-device. Nothing is sent to a server. Share directly to your provider via your OS share
            sheet.
          </Text>
        </View>
      </View>
    </View>
  );
}

function ReportRow({
  emoji,
  emojiBg,
  title,
  sub,
  divider = false,
}: {
  emoji: string;
  emojiBg: string;
  title: string;
  sub: string;
  divider?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: 'rgba(51,50,74,0.06)',
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          backgroundColor: emojiBg,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 14 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.ink }}>{title}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 10, color: color.muted, marginTop: 2 }}>{sub}</Text>
      </View>
      <View style={{ backgroundColor: '#D8F0E6', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 8 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 9, color: '#3FA98A' }}>Included</Text>
      </View>
    </View>
  );
}
