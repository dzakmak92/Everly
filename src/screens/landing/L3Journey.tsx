import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { font, shadow } from '../../theme/tokens';
import { Logo } from '../../components/Logo';

const f = font;

/* L3 · Journey — white/clean, left-aligned, "Birth to 18+" badge, stage scroll cards. */
export default function L3Journey() {
  return (
    <View style={{ backgroundColor: '#f8f8f4' }}>
      {/* top bar: brand + CTA */}
      <View
        style={{
          paddingTop: 60,
          paddingHorizontal: 28,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          <Logo width={28} height={32} color="#76a878" />
          <Text style={{ fontFamily: f.body800, fontSize: 16, color: '#193820', letterSpacing: 0.16 }}>everly</Text>
        </View>
        <View style={{ backgroundColor: '#20a05e', paddingVertical: 9, paddingHorizontal: 20, borderRadius: 100 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#fff' }}>Get Started</Text>
        </View>
      </View>

      {/* hero */}
      <View style={{ paddingTop: 40, paddingHorizontal: 28, paddingBottom: 32 }}>
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: '#e2f4e8',
            paddingVertical: 5,
            paddingHorizontal: 12,
            borderRadius: 100,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontFamily: f.body800,
              fontSize: 10.5,
              color: '#207040',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            Birth to 18+
          </Text>
        </View>
        <Text
          style={{
            fontFamily: f.display700,
            fontSize: 44,
            color: '#193820',
            lineHeight: 48,
            marginBottom: 16,
            letterSpacing: -0.5,
          }}
        >
          Your family's{'\n'}story, start{'\n'}to finish.
        </Text>
        <Text
          style={{
            fontFamily: f.body500,
            fontSize: 16,
            color: '#527060',
            lineHeight: 24,
            marginBottom: 28,
            maxWidth: 300,
          }}
        >
          One app that adapts to every stage — from the 3am feed to the driving test.
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: '#20a05e',
              paddingVertical: 14,
              paddingHorizontal: 28,
              borderRadius: 100,
              shadowColor: '#20a05e',
              shadowOpacity: 0.35,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            <Text style={{ fontFamily: f.body700, fontSize: 15, color: '#fff' }}>Start free</Text>
          </View>
          <Text style={{ fontFamily: f.body600, fontSize: 15, color: '#207040' }}>See how it works ›</Text>
        </View>
      </View>

      {/* stage scroll cards */}
      <View>
        <Text
          style={{
            paddingHorizontal: 28,
            fontFamily: f.body800,
            fontSize: 10,
            color: '#94a88e',
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          Grows through every stage
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingTop: 4, paddingHorizontal: 28, paddingBottom: 20 }}
        >
          <StageCard label="Newborn" sub="Feeds, sleep & growth">
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="#207040">
              <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </Svg>
          </StageCard>
          <StageCard label="Baby" sub="Meals & milestones">
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#207040" strokeWidth={2} strokeLinecap="round">
              <Circle cx="12" cy="12" r="8" />
              <Path d="M9 12l2 2 4-4" />
            </Svg>
          </StageCard>
          <StageCard label="School" sub="Timetables & activities">
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#207040" strokeWidth={2} strokeLinecap="round">
              <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </Svg>
          </StageCard>
          <StageCard label="Teen" sub="Chores & driving">
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="#207040">
              <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </Svg>
          </StageCard>
          <StageCard label="Young Adult" sub="Calendar & archive" dim>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#207040" strokeWidth={2} strokeLinecap="round">
              <Circle cx="7.5" cy="15.5" r="5.5" />
              <Path d="M21 2l-9.6 9.6" />
            </Svg>
          </StageCard>
        </ScrollView>
      </View>

      {/* built different list */}
      <View style={{ paddingTop: 20, paddingHorizontal: 28, paddingBottom: 56 }}>
        <Text
          style={{
            fontFamily: f.body800,
            fontSize: 10,
            color: '#94a88e',
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            marginBottom: 18,
          }}
        >
          Built different
        </Text>

        <InfoRow last={false} title="Private by design" sub="Data lives on your device only">
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#76a878" strokeWidth={2} strokeLinecap="round">
            <Path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6z" />
            <Path d="M9 12l2 2 4-4" />
          </Svg>
        </InfoRow>
        <InfoRow last={false} title="One lifetime story" sub="Every milestone preserved forever">
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#76a878" strokeWidth={2} strokeLinecap="round">
            <Path d="M8 4v16" />
            <Circle cx="8" cy="7" r="2.5" fill="#76a878" stroke="none" />
            <Circle cx="8" cy="13" r="2.5" fill="#76a878" stroke="none" />
            <Circle cx="8" cy="19" r="2.5" fill="#76a878" stroke="none" />
          </Svg>
        </InfoRow>
        <InfoRow last title="Free forever · Newborn" sub="No paywall on baby tracking">
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="#76a878">
            <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </Svg>
        </InfoRow>
      </View>
    </View>
  );
}

function StageCard({
  label,
  sub,
  dim = false,
  children,
}: {
  label: string;
  sub: string;
  dim?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        {
          width: 126,
          backgroundColor: '#fff',
          borderRadius: 18,
          padding: 16,
          opacity: dim ? 0.55 : 1,
        },
        shadow.tile,
      ]}
    >
      <View
        style={{
          width: 28,
          height: 28,
          backgroundColor: '#d4f0e0',
          borderRadius: 9,
          marginBottom: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
      <Text style={{ fontFamily: f.body800, fontSize: 12, color: '#193820', marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontFamily: f.body400, fontSize: 10.5, color: '#789060', lineHeight: 15 }}>{sub}</Text>
    </View>
  );
}

function InfoRow({
  title,
  sub,
  last,
  children,
}: {
  title: string;
  sub: string;
  last: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        paddingVertical: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: '#eae8e0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#193820', marginBottom: 3 }}>{title}</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 12.5, color: '#7a8e70', lineHeight: 18 }}>{sub}</Text>
      </View>
      {children}
    </View>
  );
}
