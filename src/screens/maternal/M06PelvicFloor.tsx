import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* M06 · Pelvic-Floor & Movement Recovery — staged exercises, diastasis
   awareness, return-to-run gate. (Mum&Me maternal accent teal #3A9B8A.) */
export default function M06PelvicFloor() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* title */}
      <View style={{ paddingTop: 10, paddingHorizontal: 24, paddingBottom: 14 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Pelvic Floor & Recovery</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginTop: 4 }}>
          Week 6 · Vaginal birth · Guided at your pace
        </Text>
      </View>

      {/* stage banner */}
      <LinearGradient
        colors={['#E0F4EF', '#D4EDDB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginHorizontal: 20,
          marginBottom: 14,
          borderRadius: 18,
          padding: 14,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#1E5C50' }}>Stage 2 · Weeks 4–8</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#3A7A6A', lineHeight: 17, marginTop: 4 }}>
            Progress from gentle Kegels to progressive loading. Walking up to 30 minutes is safe now.
          </Text>
        </View>
        <Text style={{ fontFamily: f.display700, fontSize: 28, color: '#3A9B8A', marginLeft: 12 }}>S2</Text>
      </LinearGradient>

      {/* today's exercises */}
      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        <Text
          style={{
            fontFamily: f.body700,
            fontSize: 11,
            letterSpacing: 0.9,
            textTransform: 'uppercase',
            color: c.muted,
            paddingLeft: 4,
            marginBottom: 2,
          }}
        >
          Today's routine
        </Text>
        <View style={[{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' }, shadow.tile]}>
          <ExerciseRow
            chipBg="#D8F0E6"
            emoji="🌱"
            title="Deep core breathing"
            sub="5 min · 10 breaths · 3 sets"
            border
            tag={<Tag bg="#D8F0E6" fg="#3A9B8A">Done ✓</Tag>}
          />
          <ExerciseRow
            chipBg="#E7E4FB"
            emoji="🤸"
            title="Kegel contractions"
            sub="10 holds × 10 sec · 3 sets"
            border
            tag={<Tag bg="#6B6FC9" fg="#fff">Start →</Tag>}
          />
          <ExerciseRow
            chipBg="#FBF1CE"
            emoji="🚶"
            title="Gentle walking"
            sub="20–30 minutes at easy pace"
            tag={<Tag bg="#F4F3FB" fg="#9C9AB2">Today</Tag>}
          />
        </View>
      </View>

      {/* diastasis awareness */}
      <View
        style={{
          marginTop: 12,
          marginHorizontal: 20,
          marginBottom: 16,
          backgroundColor: '#FBF1CE',
          borderRadius: 16,
          padding: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <AlertCircle size={16} stroke="#C9A33B" style={{ marginTop: 1 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#7A5C20', marginBottom: 3 }}>
            Diastasis check (6-week)
          </Text>
          <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#8A6A2A', lineHeight: 15 }}>
            Avoid deep core exercises like crunches or planks until your 6-week check-up confirms healing. Your Everly guide shows safe alternatives.
          </Text>
        </View>
      </View>

      {/* return to run safe date */}
      <View
        style={[
          {
            marginHorizontal: 20,
            marginBottom: 24,
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 14,
            paddingHorizontal: 16,
            flexDirection: 'row',
            gap: 12,
            alignItems: 'center',
          },
          shadow.tile,
        ]}
      >
        <View
          style={{
            width: 40,
            height: 40,
            backgroundColor: '#FBE0EA',
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 18 }}>🏃</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink, marginBottom: 2 }}>Return to running</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted }}>Earliest safe: Week 12 · ~6 weeks away</Text>
        </View>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
          <Path d="M9 18l6-6-6-6" />
        </Svg>
      </View>
    </View>
  );
}

function ExerciseRow({
  chipBg,
  emoji,
  title,
  sub,
  tag,
  border = false,
}: {
  chipBg: string;
  emoji: string;
  title: string;
  sub: string;
  tag: React.ReactNode;
  border?: boolean;
}) {
  return (
    <View
      style={{
        padding: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        borderBottomWidth: border ? 1 : 0,
        borderBottomColor: 'rgba(51,50,74,0.05)',
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          backgroundColor: chipBg,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink, marginBottom: 2 }}>{title}</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted }}>{sub}</Text>
      </View>
      {tag}
    </View>
  );
}

function Tag({ children, bg, fg }: { children: React.ReactNode; bg: string; fg: string }) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
      <Text style={{ fontFamily: f.body700, fontSize: 10, color: fg }}>{children}</Text>
    </View>
  );
}

function AlertCircle({ size, stroke, style }: { size: number; stroke: string; style?: object }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" style={style}>
      <Circle cx="12" cy="12" r="10" />
      <Line x1="12" y1="8" x2="12" y2="12" />
      <Line x1="12" y1="16" x2="12.01" y2="16" />
    </Svg>
  );
}
