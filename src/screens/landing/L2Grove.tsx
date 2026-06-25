import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { font } from '../../theme/tokens';
import { Logo } from '../../components/Logo';

const f = font;

/* L2 · Grove — deep forest green hero, large "Everly" wordmark, cream feature section. */
export default function L2Grove() {
  return (
    <View>
      {/* dark forest hero */}
      <View
        style={{
          backgroundColor: '#0b2117',
          paddingTop: 84,
          paddingHorizontal: 32,
          paddingBottom: 52,
          overflow: 'hidden',
          alignItems: 'center',
        }}
      >
        {/* faint oversized watermark tree, bottom-right */}
        <View style={{ position: 'absolute', right: -56, bottom: -30 }}>
          <Logo width={270} height={306} color="rgba(170,230,150,0.04)" />
        </View>

        <View style={{ marginBottom: 28 }}>
          <Logo width={68} height={77} color="#b8d898" />
        </View>
        <Text
          style={{
            fontFamily: f.display700,
            fontSize: 64,
            color: '#f0ead4',
            lineHeight: 64,
            marginBottom: 18,
            letterSpacing: -0.6,
          }}
        >
          Everly
        </Text>
        <Text
          style={{
            fontFamily: f.body500,
            fontSize: 18,
            color: '#94b88c',
            lineHeight: 26,
            marginBottom: 36,
            maxWidth: 290,
            textAlign: 'center',
          }}
        >
          The family app that grows with you
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            backgroundColor: '#f0ead4',
            paddingVertical: 16,
            paddingHorizontal: 36,
            borderRadius: 100,
          }}
        >
          <Text style={{ fontFamily: f.body800, fontSize: 16, color: '#0b2117' }}>Get Started Free</Text>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#0b2117" strokeWidth={2.5} strokeLinecap="round">
            <Path d="M5 12h14M12 5l7 7-7 7" />
          </Svg>
        </View>
        <Text style={{ fontFamily: f.body500, fontSize: 11, color: '#486050', marginTop: 14 }}>
          From first feed to first car
        </Text>
      </View>

      {/* cream feature section */}
      <View style={{ backgroundColor: '#f4ece0', paddingTop: 36, paddingHorizontal: 24 }}>
        <Text
          style={{
            fontFamily: f.body800,
            fontSize: 10,
            color: '#9a7a50',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            marginBottom: 22,
          }}
        >
          Why families choose Everly
        </Text>

        <FeatureRow
          last={false}
          title="Grows with your child"
          body="Six life stages in one app. Never switch platforms again."
          icon={
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#b8d898" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M12 22V10" />
              <Path d="M12 10C12 6 8 3 4 5" />
              <Path d="M12 10C12 6 16 3 20 5" />
            </Svg>
          }
        />
        <FeatureRow
          last={false}
          title="Private by design"
          body="Your child's data never leaves your device. Ever."
          icon={
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#b8d898" strokeWidth={2} strokeLinecap="round">
              <Path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6z" />
              <Path d="M9 12l2 2 4-4" />
            </Svg>
          }
        />
        <FeatureRow
          last
          title="One lifetime story"
          body="From first smile to first drive — all preserved."
          icon={
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#b8d898" strokeWidth={2} strokeLinecap="round">
              <Line x1="8" y1="4" x2="8" y2="20" />
              <Circle cx="8" cy="7" r="2.5" fill="#b8d898" stroke="none" />
              <Circle cx="8" cy="13" r="2.5" fill="#b8d898" stroke="none" />
              <Circle cx="8" cy="19" r="2.5" fill="#b8d898" stroke="none" />
              <Line x1="11" y1="7" x2="18" y2="7" />
              <Line x1="11" y1="13" x2="16" y2="13" />
              <Line x1="11" y1="19" x2="14" y2="19" />
            </Svg>
          }
        />
      </View>

      {/* stage chips */}
      <View style={{ backgroundColor: '#f4ece0', paddingTop: 24, paddingHorizontal: 24, paddingBottom: 52 }}>
        <Text
          style={{
            fontFamily: f.body800,
            fontSize: 10,
            color: '#9a7a50',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          Six stages. One app.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Chip>Newborn</Chip>
          <Chip>Baby</Chip>
          <Chip>Preschool</Chip>
          <Chip>School</Chip>
          <Chip>Teen</Chip>
          <Chip outlined>Young Adult</Chip>
        </View>
      </View>
    </View>
  );
}

function FeatureRow({ title, body, icon, last }: { title: string; body: string; icon: React.ReactNode; last: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 16,
        alignItems: 'flex-start',
        paddingVertical: 18,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: 'rgba(0,0,0,0.08)',
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          backgroundColor: '#0b2117',
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 15, color: '#1a2616', marginBottom: 4 }}>{title}</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: '#7a6248', lineHeight: 20 }}>{body}</Text>
      </View>
    </View>
  );
}

function Chip({ children, outlined = false }: { children: React.ReactNode; outlined?: boolean }) {
  if (outlined) {
    return (
      <View
        style={{
          backgroundColor: 'rgba(11,33,23,0.12)',
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 100,
          borderWidth: 1.5,
          borderColor: 'rgba(11,33,23,0.18)',
        }}
      >
        <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#5a7a50' }}>{children}</Text>
      </View>
    );
  }
  return (
    <View style={{ backgroundColor: '#0b2117', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 100 }}>
      <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#b8d898' }}>{children}</Text>
    </View>
  );
}
