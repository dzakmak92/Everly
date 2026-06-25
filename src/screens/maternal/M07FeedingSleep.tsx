import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* M07 · Feeding & Sleep for Mum — breastfeeding comfort log, mastitis watch,
   her own sleep-debt. This screen is for the MOTHER, not the baby. */
export default function M07FeedingSleep() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* title */}
      <View style={{ paddingTop: 10, paddingHorizontal: 24, paddingBottom: 14 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>For You</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginTop: 4 }}>
          Your feeding comfort & sleep — not just the baby's
        </Text>
      </View>

      {/* breastfeeding comfort log */}
      <View
        style={[
          { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#fff', borderRadius: 20, padding: 18 },
          shadow.card,
        ]}
      >
        <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink, marginBottom: 12 }}>
          Breastfeeding comfort today
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <ComfortFace bg="#D8F0E6" emoji="😌" emojiSize={16} dot={38} label="Comfortable" />
          <ComfortFace bg="#FBF1CE" emoji="😐" emojiSize={16} dot={38} label="Some pain" />
          <ComfortFace
            bg="#3A9B8A"
            emoji="😊"
            emojiSize={20}
            dot={46}
            label="Good ✓"
            labelColor="#3A9B8A"
            labelBold
            dotShadow
          />
          <ComfortFace bg="#FBE0EA" emoji="😣" emojiSize={16} dot={38} label="Painful" />
        </View>

        {/* mastitis watch */}
        <View
          style={{
            backgroundColor: '#FBE0EA',
            borderRadius: 12,
            padding: 10,
            paddingHorizontal: 12,
            flexDirection: 'row',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <Svg
            width={13}
            height={13}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D46E97"
            strokeWidth={2}
            strokeLinecap="round"
            style={{ marginTop: 1 }}
          >
            <Circle cx="12" cy="12" r="10" />
            <Line x1="12" y1="8" x2="12" y2="12" />
            <Line x1="12" y1="16" x2="12.01" y2="16" />
          </Svg>
          <Text style={{ flex: 1, fontFamily: f.body400, fontSize: 11, color: '#B04070', lineHeight: 15 }}>
            Mastitis signs: hard lump, redness, fever ≥38°C, flu-like aches. Contact your GP or lactation consultant.
          </Text>
        </View>
      </View>

      {/* her sleep debt tracker */}
      <View
        style={[
          { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#fff', borderRadius: 20, padding: 18 },
          shadow.card,
        ]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink }}>Your sleep · last 7 days</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted }}>avg 4h 50m</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'flex-end', height: 48 }}>
          <SleepBar pct={55} color="#6B6FC9" opacity={0.7} label="M" />
          <SleepBar pct={42} color="#6B6FC9" opacity={0.7} label="T" />
          <SleepBar pct={60} color="#6B6FC9" opacity={0.7} label="W" />
          <SleepBar pct={48} color="#6B6FC9" opacity={0.7} label="T" />
          <SleepBar pct={65} color="#6B6FC9" opacity={0.7} label="F" />
          <SleepBar pct={75} color="#3A9B8A" opacity={0.8} label="S" />
          <SleepBar pct={80} color="#3A9B8A" opacity={0.9} label="S" border highlight />
        </View>
      </View>

      {/* hydration nudge */}
      <LinearGradient
        colors={['#E0F4EF', '#D4EDDB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginHorizontal: 20,
          marginBottom: 24,
          borderRadius: 16,
          padding: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 22 }}>💧</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#1E5C50' }}>Stay hydrated</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#3A7A6A', lineHeight: 17, marginTop: 3 }}>
            Breastfeeding needs an extra 500ml/day. You're at 1.2L — aim for 2.2L.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

function ComfortFace({
  bg,
  emoji,
  emojiSize,
  dot,
  label,
  labelColor = '#9C9AB2',
  labelBold = false,
  dotShadow = false,
}: {
  bg: string;
  emoji: string;
  emojiSize: number;
  dot: number;
  label: string;
  labelColor?: string;
  labelBold?: boolean;
  dotShadow?: boolean;
}) {
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <View
        style={[
          { width: dot, height: dot, backgroundColor: bg, borderRadius: dot / 2, alignItems: 'center', justifyContent: 'center' },
          dotShadow && {
            shadowColor: '#3A9B8A',
            shadowOpacity: 0.3,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          },
        ]}
      >
        <Text style={{ fontSize: emojiSize }}>{emoji}</Text>
      </View>
      <Text style={{ fontFamily: labelBold ? f.body700 : f.body400, fontSize: 9, color: labelColor }}>{label}</Text>
    </View>
  );
}

function SleepBar({
  pct,
  color: barColor,
  opacity,
  label,
  border = false,
  highlight = false,
}: {
  pct: number;
  color: string;
  opacity: number;
  label: string;
  border?: boolean;
  highlight?: boolean;
}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 3 }}>
      <View
        style={{
          width: '100%',
          height: `${pct}%`,
          backgroundColor: barColor,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          opacity,
          borderWidth: border ? 2 : 0,
          borderColor: '#3A9B8A',
        }}
      />
      <Text style={{ fontFamily: highlight ? f.body700 : f.body400, fontSize: 8, color: highlight ? '#3A9B8A' : '#C8C6DC' }}>
        {label}
      </Text>
    </View>
  );
}
