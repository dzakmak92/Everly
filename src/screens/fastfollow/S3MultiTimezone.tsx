import React from 'react';
import { View, Text, DimensionValue } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar, Card } from '../../components/ui';

const f = font;
const c = color;

/* S3 · Multi-Timezone — 24h timeline ruler + per-person current times + asleep tip. */
export default function S3MultiTimezone() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* title */}
      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 16 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Family · Timezones</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: '#9C9AB2', marginTop: 5 }}>
          Mon, 23 Jun · 9:41 AM local
        </Text>
      </View>

      {/* 24-hour timeline card */}
      <Card style={{ marginHorizontal: 20, marginBottom: 18, borderRadius: 18, padding: 16, paddingHorizontal: 18 }}>
        <Text
          style={{
            fontFamily: f.body700,
            fontSize: 11,
            letterSpacing: 0.9,
            textTransform: 'uppercase',
            color: '#9C9AB2',
            marginBottom: 12,
          }}
        >
          24-hour timeline
        </Text>
        <View style={{ position: 'relative', height: 22, backgroundColor: '#F4F3FB', borderRadius: 8, marginBottom: 18 }}>
          {/* gridlines */}
          <Gridline left="25%" />
          <Gridline left="50%" />
          <Gridline left="75%" />
          {/* people markers */}
          <Marker left="40.3%" fill="#6B6FC9" />
          <Marker left="15.3%" fill="#E9C46A" />
          {/* axis labels */}
          <Text style={{ position: 'absolute', left: '2%', bottom: -16, fontFamily: f.body400, fontSize: 9, color: '#9C9AB2' }}>
            0
          </Text>
          <AxisLabel left="25%">6am</AxisLabel>
          <AxisLabel left="50%">noon</AxisLabel>
          <AxisLabel left="75%">6pm</AxisLabel>
        </View>
      </Card>

      {/* people rows */}
      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        <PersonRow
          avatarBg="#E7E4FB"
          silhouette="#6B6FC9"
          name="Emma · Dublin"
          sub="UTC+1"
          time="9:41 AM"
          timeColor="#6B6FC9"
        />
        <PersonRow
          avatarBg="#D8F0E6"
          silhouette="#3FA98A"
          name="Grandma Ruth · London"
          sub="UTC+1"
          time="9:41 AM"
          timeColor="#33324A"
        />
        <PersonRow
          avatarBg="#FBF1CE"
          silhouette="#C9A33B"
          name="Dad Dave · Chicago"
          sub="UTC-6 · Sunday night"
          time="3:41 AM"
          timeColor="#C9A33B"
          asleep
        />
      </View>

      {/* best-time-to-call tip */}
      <View
        style={{
          marginTop: 12,
          marginHorizontal: 20,
          marginBottom: 32,
          backgroundColor: '#FBF1CE',
          borderRadius: 14,
          paddingVertical: 11,
          paddingHorizontal: 14,
        }}
      >
        <Text style={{ fontFamily: f.body400, fontSize: 12, lineHeight: 18, color: '#7A5A00' }}>
          Best time to call Dave: after 2pm his time (8pm yours)
        </Text>
      </View>
    </View>
  );
}

function Gridline({ left }: { left: DimensionValue }) {
  return (
    <View style={{ position: 'absolute', left, top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(51,50,74,0.1)' }} />
  );
}

function Marker({ left, fill }: { left: DimensionValue; fill: string }) {
  return (
    <View style={{ position: 'absolute', left, top: 3, bottom: 3, width: 3, backgroundColor: fill, borderRadius: 2 }} />
  );
}

function AxisLabel({ left, children }: { left: DimensionValue; children: React.ReactNode }) {
  return (
    <Text
      style={{
        position: 'absolute',
        left,
        bottom: -16,
        marginLeft: -10,
        width: 20,
        textAlign: 'center',
        fontFamily: f.body400,
        fontSize: 9,
        color: '#9C9AB2',
      }}
    >
      {children}
    </Text>
  );
}

function PersonRow({
  avatarBg,
  silhouette,
  name,
  sub,
  time,
  timeColor,
  asleep = false,
}: {
  avatarBg: string;
  silhouette: string;
  name: string;
  sub: string;
  time: string;
  timeColor: string;
  asleep?: boolean;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: '#fff',
          borderRadius: 18,
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          gap: 12,
          alignItems: 'center',
        },
        shadow.card,
      ]}
    >
      <View
        style={{
          width: 40,
          height: 40,
          backgroundColor: avatarBg,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={20} height={20} viewBox="0 0 20 20" fill={silhouette}>
          <Circle cx="10" cy="7.5" r="5" />
          <Path d="M2 19Q2 13 10 13Q18 13 18 19Z" />
        </Svg>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A' }}>{name}</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2', marginTop: 3 }}>{sub}</Text>
      </View>
      {asleep ? (
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: f.display700, fontSize: 18, color: timeColor }}>{time}</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 10, color: timeColor, marginTop: 2 }}>😴 Asleep</Text>
        </View>
      ) : (
        <Text style={{ fontFamily: f.display700, fontSize: 18, color: timeColor }}>{time}</Text>
      )}
    </View>
  );
}
