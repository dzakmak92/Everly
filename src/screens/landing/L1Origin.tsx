import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { font } from '../../theme/tokens';
import { Logo } from '../../components/Logo';

const f = font;

/* L1 · Origin — centered, sage radial gradient → warm cream, tree mark, serif hero. */
export default function L1Origin() {
  return (
    <View>
      {/* radial-gradient(ellipse at 38% 8%, #cae2c0 0%, #e0dcb4 52%, #e8d4a0 100%)
         approximated with a top-left → bottom-right linear gradient */}
      <LinearGradient
        colors={['#cae2c0', '#e0dcb4', '#e8d4a0']}
        locations={[0, 0.52, 1]}
        start={{ x: 0.38, y: 0 }}
        end={{ x: 0.95, y: 1 }}
      >
        {/* hero */}
        <View style={{ paddingTop: 84, paddingHorizontal: 36, paddingBottom: 44, alignItems: 'center' }}>
          <View style={{ marginBottom: 26 }}>
            <Logo width={60} height={68} color="#76a878" />
          </View>
          <Text
            style={{
              fontFamily: f.display700,
              fontSize: 48,
              color: '#193820',
              lineHeight: 53,
              marginBottom: 14,
              letterSpacing: -0.5,
              textAlign: 'center',
            }}
          >
            Welcome to{'\n'}Everly
          </Text>
          <Text
            style={{
              fontFamily: f.body600,
              fontSize: 17,
              color: '#285c3c',
              lineHeight: 24,
              marginBottom: 8,
              maxWidth: 280,
              textAlign: 'center',
            }}
          >
            The family app that grows with you
          </Text>
          <Text
            style={{
              fontFamily: f.body400,
              fontSize: 14,
              color: '#527060',
              lineHeight: 21,
              marginBottom: 34,
              maxWidth: 268,
              textAlign: 'center',
            }}
          >
            From first feed to first car. One app. One story.
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: '#20a05e',
              paddingVertical: 17,
              paddingHorizontal: 38,
              borderRadius: 100,
              shadowColor: '#20a05e',
              shadowOpacity: 0.38,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 6 },
              elevation: 5,
            }}
          >
            <Text style={{ fontFamily: f.body700, fontSize: 17, color: '#fff' }}>Let's Get Started</Text>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round">
              <Path d="M5 12h14M12 5l7 7-7 7" />
            </Svg>
          </View>
          <Text style={{ fontFamily: f.body500, fontSize: 11, color: '#78906a', marginTop: 14 }}>
            Free to start · No credit card
          </Text>
        </View>

        {/* feature card */}
        <View
          style={{
            marginHorizontal: 18,
            backgroundColor: 'rgba(255,255,255,0.52)',
            borderRadius: 24,
            paddingVertical: 22,
            paddingHorizontal: 18,
            gap: 16,
          }}
        >
          <FeatureRow
            title="Grows with your child"
            body="Newborn tracker to teen scheduler — one app, every stage."
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#207040" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M12 22V10" />
                <Path d="M12 10C12 6 8 3 4 5" />
                <Path d="M12 10C12 6 16 3 20 5" />
              </Svg>
            }
          />
          <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.07)' }} />
          <FeatureRow
            title="Private by design"
            body="Your family's data stays on your device. No cloud, no compromise."
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#207040" strokeWidth={2} strokeLinecap="round">
                <Path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6z" />
                <Path d="M9 12l2 2 4-4" />
              </Svg>
            }
          />
          <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.07)' }} />
          <FeatureRow
            title="One lifetime story"
            body="Every milestone and memory — one beautiful timeline."
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#207040" strokeWidth={2} strokeLinecap="round">
                <Line x1="8" y1="4" x2="8" y2="20" />
                <Circle cx="8" cy="7" r="2.5" fill="#207040" stroke="none" />
                <Circle cx="8" cy="13" r="2.5" fill="#207040" stroke="none" />
                <Circle cx="8" cy="19" r="2.5" fill="#207040" stroke="none" />
                <Line x1="11" y1="7" x2="18" y2="7" />
                <Line x1="11" y1="13" x2="16" y2="13" />
                <Line x1="11" y1="19" x2="14" y2="19" />
              </Svg>
            }
          />
        </View>

        {/* stage row */}
        <View style={{ paddingTop: 28, paddingHorizontal: 18, paddingBottom: 60 }}>
          <Text
            style={{
              fontFamily: f.body800,
              fontSize: 10,
              color: '#789070',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            Adapts as they grow
          </Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <StageTile label="Newborn" sub="Feeds & sleep">
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="#207040">
                <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </Svg>
            </StageTile>
            <StageTile label="School" sub="Calendar">
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#207040" strokeWidth={2} strokeLinecap="round">
                <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </Svg>
            </StageTile>
            <StageTile label="Routines" sub="Chores">
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="#207040">
                <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </Svg>
            </StageTile>
            <StageTile label="Teen" sub="Independence">
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#207040" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Circle cx="7.5" cy="15.5" r="5.5" />
                <Path d="M21 2l-9.6 9.6" />
                <Path d="M15.5 7.5l3 3 3-3" />
              </Svg>
            </StageTile>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

function FeatureRow({ title, body, icon }: { title: string; body: string; icon: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
      <View
        style={{
          width: 40,
          height: 40,
          backgroundColor: '#c2e8ce',
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#193820', marginBottom: 3 }}>{title}</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 12.5, color: '#527060', lineHeight: 19 }}>{body}</Text>
      </View>
    </View>
  );
}

function StageTile({ label, sub, children }: { label: string; sub: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.62)',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 6,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          backgroundColor: '#c2e8ce',
          borderRadius: 9,
          marginBottom: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
      <Text style={{ fontFamily: f.body800, fontSize: 10.5, color: '#193820', textAlign: 'center' }}>{label}</Text>
      <Text style={{ fontFamily: f.body400, fontSize: 9.5, color: '#789070', marginTop: 2, textAlign: 'center' }}>{sub}</Text>
    </View>
  );
}
