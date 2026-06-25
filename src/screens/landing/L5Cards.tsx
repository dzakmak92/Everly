import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { font } from '../../theme/tokens';

const f = font;

/* L5 · Cards — floating UI preview cards (feed log, milestone, calendar) layered
   over a sage→cream hero. Source: Everly Landing.dc.html lines 362–468. The HTML
   uses DM Serif Display for headlines; per brief we render headings with the
   Quicksand display tokens (the only display family loaded in this app). */
export default function L5Cards() {
  return (
    <View style={{ width: '100%' }}>
      <View
        style={{
          borderRadius: 44,
          overflow: 'hidden',
          shadowColor: 'rgba(8,34,18,1)',
          shadowOpacity: 0.22,
          shadowRadius: 72,
          shadowOffset: { width: 0, height: 20 },
          elevation: 12,
        }}
      >
        <LinearGradient
          colors={['#d8e8ce', '#ece0bc']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
        >
          {/* ── Hero with floating cards ── */}
          <View style={{ paddingTop: 84, paddingHorizontal: 28, minHeight: 520, overflow: 'hidden' }}>
            {/* Feed log card */}
            <View
              style={{
                position: 'absolute',
                right: 14,
                top: 80,
                width: 170,
                backgroundColor: '#fff',
                borderRadius: 22,
                padding: 16,
                shadowColor: '#000',
                shadowOpacity: 0.13,
                shadowRadius: 40,
                shadowOffset: { width: 0, height: 12 },
                elevation: 8,
                transform: [{ rotate: '3deg' }],
                zIndex: 3,
              }}
            >
              <Text
                style={{
                  fontFamily: f.body800,
                  fontSize: 9,
                  color: '#94a88e',
                  letterSpacing: 0.7,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Last feed
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 }}>
                <Text style={{ fontFamily: f.body800, fontSize: 22, color: '#193820', lineHeight: 22 }}>5:23 </Text>
                <Text style={{ fontFamily: f.body600, fontSize: 13, color: '#789060', lineHeight: 16 }}>am</Text>
              </View>
              <Text style={{ fontFamily: f.body600, fontSize: 11, color: '#527060', marginBottom: 10 }}>Left · 12 min</Text>
              <View style={{ backgroundColor: '#e0f0e6', borderRadius: 100, height: 5, overflow: 'hidden' }}>
                <View style={{ backgroundColor: '#20a05e', width: '68%', height: '100%', borderRadius: 100 }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                <Text style={{ fontFamily: f.body400, fontSize: 9.5, color: '#94a88e' }}>Left side</Text>
                <Text style={{ fontFamily: f.body700, fontSize: 9.5, color: '#207040' }}>68%</Text>
              </View>
            </View>

            {/* Milestone card */}
            <View
              style={{
                position: 'absolute',
                right: 8,
                top: 268,
                width: 162,
                backgroundColor: '#fff',
                borderRadius: 22,
                padding: 16,
                shadowColor: '#000',
                shadowOpacity: 0.11,
                shadowRadius: 32,
                shadowOffset: { width: 0, height: 8 },
                elevation: 6,
                transform: [{ rotate: '-2deg' }],
                zIndex: 2,
              }}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  backgroundColor: '#e2f4e8',
                  borderRadius: 10,
                  marginBottom: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Svg width={15} height={15} viewBox="0 0 24 24" fill="#20a05e">
                  <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </Svg>
              </View>
              <Text style={{ fontFamily: f.body800, fontSize: 13, color: '#193820', marginBottom: 3 }}>First smile!</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#789060', marginBottom: 2 }}>Oliver · 6 weeks</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 10, color: '#94a88e' }}>Jun 18, 2026</Text>
            </View>

            {/* Calendar card */}
            <View
              style={{
                position: 'absolute',
                left: 14,
                top: 372,
                width: 165,
                backgroundColor: '#fff',
                borderRadius: 22,
                padding: 14,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 32,
                shadowOffset: { width: 0, height: 8 },
                elevation: 6,
                transform: [{ rotate: '-1.5deg' }],
                zIndex: 2,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontFamily: f.body800, fontSize: 11, color: '#193820' }}>June 2026</Text>
                <View
                  style={{
                    width: 14,
                    height: 14,
                    backgroundColor: '#20a05e',
                    borderRadius: 4,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round">
                    <Path d="M12 5v14M5 12h14" />
                  </Svg>
                </View>
              </View>
              <MiniCalendar />
            </View>

            {/* Headline */}
            <View style={{ maxWidth: 185, zIndex: 4 }}>
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: 'rgba(32,160,94,0.14)',
                  paddingVertical: 5,
                  paddingHorizontal: 12,
                  borderRadius: 100,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontFamily: f.body800,
                    fontSize: 10,
                    color: '#207040',
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                  }}
                >
                  One app
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: f.display700,
                  fontSize: 42,
                  color: '#193820',
                  lineHeight: 46,
                  letterSpacing: -0.4,
                }}
              >
                Track every{'\n'}moment.
              </Text>
            </View>
          </View>

          {/* ── White CTA card ── */}
          <View
            style={{
              backgroundColor: '#fff',
              marginTop: 20,
              marginHorizontal: 14,
              borderRadius: 24,
              paddingVertical: 24,
              paddingHorizontal: 22,
            }}
          >
            <Text style={{ fontFamily: f.display700, fontSize: 26, color: '#193820', lineHeight: 31, marginBottom: 8 }}>
              The family app that grows with you
            </Text>
            <Text style={{ fontFamily: f.body400, fontSize: 13, color: '#789060', lineHeight: 19.5, marginBottom: 20 }}>
              From first feed to first car. One app. One story.
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: '#20a05e',
                padding: 16,
                borderRadius: 14,
                shadowColor: 'rgba(32,160,94,1)',
                shadowOpacity: 0.35,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }}
            >
              <Text style={{ fontFamily: f.body700, fontSize: 16, color: '#fff' }}>Let's Get Started</Text>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
                <Path d="M5 12h14M12 5l7 7-7 7" />
              </Svg>
            </View>
            <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#94a88e', textAlign: 'center', marginTop: 10 }}>
              Free newborn tracking · No credit card
            </Text>
          </View>

          {/* ── Stats grid ── */}
          <View style={{ paddingTop: 12, paddingHorizontal: 14, paddingBottom: 56 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              <StatTile value="6" label="Life stages" />
              <StatTile value="0" label="Data in the cloud" />
              <StatTile value="18+" label="Years of memories" />
              <StatTile value="∞" label="Family moments" />
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];

function MiniCalendar() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {WEEK.map((d, i) => (
        <View key={`h${i}`} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 1 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 7.5, color: '#94a88e' }}>{d}</Text>
        </View>
      ))}
      {DAYS.map((day) =>
        day === '8' ? (
          <View key={day} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 1 }}>
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: '#20a05e',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: f.body700, fontSize: 8.5, color: '#fff', lineHeight: 8.5 }}>8</Text>
            </View>
          </View>
        ) : (
          <View key={day} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 1 }}>
            <Text style={{ fontFamily: f.body400, fontSize: 8.5, color: '#7a9060' }}>{day}</Text>
          </View>
        )
      )}
    </View>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <View
      style={{
        width: '48.5%',
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontFamily: f.display700, fontSize: 34, color: '#193820', lineHeight: 34 }}>{value}</Text>
      <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#527060', marginTop: 4 }}>{label}</Text>
    </View>
  );
}
