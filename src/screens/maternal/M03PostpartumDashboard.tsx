import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* M03 · Postpartum Dashboard — fourth-trimester recovery overview. */
export default function M03PostpartumDashboard() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* header */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 10,
          paddingBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Fourth Trimester</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 13, color: '#9C9AB2', marginTop: 4 }}>
            Week 6 · Emma · Your recovery journey
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <View style={{ backgroundColor: '#D4EDE7', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#2C8475' }}>Free forever</Text>
          </View>
          <View style={{ backgroundColor: '#E0F4EF', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#3A9B8A' }}>Day 42</Text>
          </View>
        </View>
      </View>

      {/* recovery quadrant card */}
      <LinearGradient
        colors={['#E0F4EF', '#D4F0E4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ marginHorizontal: 20, marginBottom: 14, borderRadius: 22, paddingVertical: 20, paddingHorizontal: 18 }}
      >
        <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#1E5C50', marginBottom: 12 }}>
          Your recovery at 6 weeks
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <RecoveryTile
            title="Physical healing"
            titleColor="#3A9B8A"
            track="rgba(58,155,138,0.15)"
            fill="#3A9B8A"
            pct={80}
            note="On track · 80%"
            noteColor="#7AB8AF"
          />
          <RecoveryTile
            title="Mood & wellbeing"
            titleColor="#6B6FC9"
            track="rgba(107,111,201,0.15)"
            fill="#6B6FC9"
            pct={65}
            note="Settling in · 65%"
            noteColor="#9C9AB2"
          />
          <RecoveryTile
            title="Feeding comfort"
            titleColor="#D46E97"
            track="rgba(212,110,151,0.15)"
            fill="#D46E97"
            pct={72}
            note="Good progress · 72%"
            noteColor="#9C9AB2"
          />
          <RecoveryTile
            title="Sleep quality"
            titleColor="#C9A33B"
            track="rgba(201,163,59,0.15)"
            fill="#C9A33B"
            pct={45}
            note="Fragmented · 45%"
            noteColor="#9C9AB2"
          />
        </View>
      </LinearGradient>

      {/* mood ribbon 14-day */}
      <View
        style={[
          { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#fff', borderRadius: 18, paddingVertical: 16, paddingHorizontal: 18 },
          shadow.card,
        ]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 12, color: c.ink }}>Mood · last 14 days</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2' }}>Private · on-device</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'flex-end', height: 36 }}>
          {MOOD_BARS.map((b, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: `${b.h}%`,
                backgroundColor: b.color,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                opacity: b.opacity,
                ...(b.outline ? { borderWidth: 2, borderColor: '#3A9B8A' } : null),
              }}
            />
          ))}
        </View>

        <Text style={{ fontFamily: f.body400, fontSize: 10, color: '#9C9AB2', marginTop: 6, textAlign: 'center' }}>
          Trending more settled over this week ↑
        </Text>
      </View>

      {/* today actions */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24, flexDirection: 'row', gap: 10 }}>
        <View
          style={[
            { flex: 1, backgroundColor: '#3A9B8A', padding: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
            {
              shadowColor: '#3A9B8A',
              shadowOpacity: 0.3,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            },
          ]}
        >
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#fff', textAlign: 'center', lineHeight: 17 }}>
            Check in today
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
            padding: 14,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: '#3A9B8A',
          }}
        >
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#3A9B8A', textAlign: 'center', lineHeight: 17 }}>
            6-wk appointment
          </Text>
        </View>
      </View>
    </View>
  );
}

const MOOD_BARS: { h: number; color: string; opacity: number; outline?: boolean }[] = [
  { h: 60, color: '#6B6FC9', opacity: 0.7 },
  { h: 75, color: '#3A9B8A', opacity: 0.7 },
  { h: 50, color: '#6B6FC9', opacity: 0.7 },
  { h: 40, color: '#D46E97', opacity: 0.7 },
  { h: 55, color: '#C9A33B', opacity: 0.7 },
  { h: 80, color: '#3A9B8A', opacity: 0.7 },
  { h: 85, color: '#3A9B8A', opacity: 0.7 },
  { h: 70, color: '#6B6FC9', opacity: 0.7 },
  { h: 90, color: '#3A9B8A', opacity: 0.7 },
  { h: 85, color: '#3A9B8A', opacity: 0.7 },
  { h: 88, color: '#3A9B8A', opacity: 0.7 },
  { h: 72, color: '#6B6FC9', opacity: 0.7 },
  { h: 82, color: '#3A9B8A', opacity: 0.7 },
  { h: 100, color: '#3A9B8A', opacity: 0.9, outline: true },
];

function RecoveryTile({
  title,
  titleColor,
  track,
  fill,
  pct,
  note,
  noteColor,
}: {
  title: string;
  titleColor: string;
  track: string;
  fill: string;
  pct: number;
  note: string;
  noteColor: string;
}) {
  return (
    <View
      style={{
        width: '48%',
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 10,
      }}
    >
      <Text style={{ fontFamily: f.body700, fontSize: 11, color: titleColor, marginBottom: 4 }}>{title}</Text>
      <View style={{ height: 5, backgroundColor: track, borderRadius: 999, marginBottom: 4, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: fill, borderRadius: 999 }} />
      </View>
      <Text style={{ fontFamily: f.body400, fontSize: 10, color: noteColor }}>{note}</Text>
    </View>
  );
}
