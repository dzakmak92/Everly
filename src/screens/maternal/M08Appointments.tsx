import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font } from '../../theme/tokens';
import { StatusBar, SproutLockBadge } from '../../components/ui';

const f = font;
const c = color;

/* M08 · Postpartum Appointments & Maternal PDF — 6wk→annual timeline. */
export default function M08Appointments() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 14 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Maternal Appointments</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginTop: 4 }}>
          Your schedule — separate from the baby's
        </Text>
      </View>

      {/* appointment timeline */}
      <View style={{ paddingHorizontal: 20 }}>
        {/* done — midwife discharge */}
        <TimelineRow
          marker={<DoneMarker connector="#E0F4EF" />}
          title="Midwife discharge · Day 5"
          titleColor={c.maternalTeal}
          subtitle="Home visit · Breastfeeding support ✓"
        />
        {/* done — HV assessment */}
        <TimelineRow
          marker={<DoneMarker connector="#E0F4EF" />}
          title="HV assessment · Week 2"
          titleColor={c.maternalTeal}
          subtitle="Health visitor · EPDS first screen ✓"
        />
        {/* next — 6-week GP check */}
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start', paddingVertical: 10 }}>
          <View style={{ alignItems: 'center', width: 36 }}>
            <View
              style={{
                width: 28,
                height: 28,
                backgroundColor: '#6B6FC9',
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#6B6FC9',
                shadowOpacity: 0.35,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
                elevation: 3,
              }}
            >
              <View style={{ width: 8, height: 8, backgroundColor: '#fff', borderRadius: 4 }} />
            </View>
            <View style={{ width: 2, height: 30, backgroundColor: '#E7E4FB', marginTop: 4 }} />
          </View>
          <View style={{ flex: 1, paddingBottom: 10 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink, marginBottom: 2 }}>6-week GP check · 25 Jun</Text>
            <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted }}>Dr. Collins · 10:30am · 2 days away</Text>
            <View style={{ marginTop: 6, backgroundColor: '#E7E4FB', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 }}>
              <Text style={{ fontFamily: f.body400, fontSize: 11, lineHeight: 15.4, color: '#54579E' }}>
                Prep questions: contraception, mental health, physical recovery, return to work
              </Text>
            </View>
          </View>
        </View>
        {/* future — 3-month */}
        <TimelineRow
          marker={<FutureMarker connector="#F4F3FB" />}
          title="3-month maternal check"
          titleColor={c.muted}
          subtitle="Return of cycle, pelvic health, contraception"
          subtitleColor={c.faint}
        />
        {/* future — annual (no connector) */}
        <TimelineRow
          marker={<FutureMarker />}
          title="Annual maternal health check"
          titleColor={c.muted}
          subtitle="Ongoing · Everly reminds you"
          subtitleColor={c.faint}
          noBottomPad
        />
      </View>

      {/* maternal PDF upsell — PREMIUM */}
      <LinearGradient
        colors={['#3A9B8A', '#2A7A6A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginTop: 12,
          marginHorizontal: 20,
          marginBottom: 24,
          borderRadius: 18,
          padding: 18,
          flexDirection: 'row',
          gap: 14,
          alignItems: 'center',
          shadowColor: '#3A9B8A',
          shadowOpacity: 0.3,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 6 },
          elevation: 4,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round">
            <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
          </Svg>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#fff', marginBottom: 4 }}>Maternal Health PDF</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, lineHeight: 16.8, color: 'rgba(255,255,255,0.75)' }}>
            Generated on-device — share with your GP or midwife. Recovery log, EPDS history, BP readings.
          </Text>
        </View>
        <SproutLockBadge />
      </LinearGradient>
    </View>
  );
}

function TimelineRow({
  marker,
  title,
  titleColor,
  subtitle,
  subtitleColor = color.muted,
  noBottomPad = false,
}: {
  marker: React.ReactNode;
  title: string;
  titleColor: string;
  subtitle: string;
  subtitleColor?: string;
  noBottomPad?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start', paddingVertical: 10 }}>
      <View style={{ alignItems: 'center', width: 36 }}>{marker}</View>
      <View style={{ flex: 1, paddingBottom: noBottomPad ? 0 : 10 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 13, color: titleColor, marginBottom: 2 }}>{title}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 11, color: subtitleColor }}>{subtitle}</Text>
      </View>
    </View>
  );
}

function DoneMarker({ connector }: { connector: string }) {
  return (
    <>
      <View
        style={{
          width: 28,
          height: 28,
          backgroundColor: '#D8F0E6',
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#3A9B8A" strokeWidth={2.5} strokeLinecap="round">
          <Path d="M5 13l4 4L19 7" />
        </Svg>
      </View>
      <View style={{ width: 2, height: 30, backgroundColor: connector, marginTop: 4 }} />
    </>
  );
}

function FutureMarker({ connector }: { connector?: string }) {
  return (
    <>
      <View
        style={{
          width: 28,
          height: 28,
          backgroundColor: '#F4F3FB',
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: '#C8C6DC',
          borderStyle: 'dashed',
        }}
      />
      {connector ? <View style={{ width: 2, height: 30, backgroundColor: connector, marginTop: 4 }} /> : null}
    </>
  );
}
