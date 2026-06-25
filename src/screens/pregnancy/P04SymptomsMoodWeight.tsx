import React from 'react';
import { View, Text } from 'react-native';
import { color, font } from '../../theme/tokens';
import { StatusBar, Card, PrimaryButton } from '../../components/ui';
import { Smile } from '../../components/icons';

const f = font;
const c = color;

type Mood = 'rough' | 'okay' | 'good' | 'great' | 'amazing';

/* P04 · Symptoms, Mood & Weight — Mum&Me daily check-in. */
export default function P04SymptomsMoodWeight() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* header */}
      <View style={{ paddingTop: 10, paddingHorizontal: 24, paddingBottom: 16 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Today's check-in</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginTop: 5 }}>
          Mon 23 Jun · Week 24
        </Text>
      </View>

      {/* mood selector */}
      <Card style={{ marginHorizontal: 20, marginBottom: 16, padding: 18 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 12, color: c.ink, marginBottom: 14 }}>
          How are you feeling?
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 8,
          }}
        >
          <MoodFace mood="rough" tint="#FBE0EA" stroke="#D46E97" label="Rough" />
          <MoodFace mood="okay" tint="#FCE6D8" stroke="#D9824F" label="Okay" />
          <MoodFace mood="good" tint="#6B6FC9" stroke="white" label="Good ✓" selected />
          <MoodFace mood="great" tint="#D8F0E6" stroke="#3FA98A" label="Great" />
          <MoodFace mood="amazing" tint="#FBF1CE" stroke="#C9A33B" label="Amazing" />
        </View>
      </Card>

      {/* symptoms */}
      <Card style={{ marginHorizontal: 20, marginBottom: 16, paddingVertical: 16, paddingHorizontal: 18 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 12, color: c.ink, marginBottom: 12 }}>
          Any symptoms today?
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <SymptomChip label="Nausea ✓" selected />
          <SymptomChip label="Fatigue" />
          <SymptomChip label="Heartburn" />
          <SymptomChip label="Back pain ✓" selected />
          <SymptomChip label="Swelling" />
          <SymptomChip label="Headache" />
          <SymptomChip label="Braxton Hicks" />
        </View>
      </Card>

      {/* weight */}
      <Card style={{ marginHorizontal: 20, marginBottom: 16, paddingVertical: 16, paddingHorizontal: 18 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Text style={{ fontFamily: f.body700, fontSize: 12, color: c.ink }}>Weight today</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted }}>Optional</Text>
        </View>
        <View
          style={{
            backgroundColor: c.canvas,
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontFamily: f.display700, fontSize: 18, color: c.ink }}>68.4 kg</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted }}>+0.3 this week</Text>
        </View>
      </Card>

      {/* save CTA */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <PrimaryButton>Save today's check-in</PrimaryButton>
      </View>
    </View>
  );
}

function MoodFace({
  mood,
  tint,
  stroke,
  label,
  selected = false,
}: {
  mood: Mood;
  tint: string;
  stroke: string;
  label: string;
  selected?: boolean;
}) {
  const dim = selected ? 44 : 36;
  const icon = selected ? 22 : 18;
  return (
    <View style={{ alignItems: 'center', gap: 5 }}>
      <View
        style={[
          {
            width: dim,
            height: dim,
            backgroundColor: tint,
            borderRadius: dim / 2,
            alignItems: 'center',
            justifyContent: 'center',
          },
          selected
            ? {
                shadowColor: '#6B6FC9',
                shadowOpacity: 0.3,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }
            : null,
        ]}
      >
        <Smile size={icon} color={stroke} mood={mood} />
      </View>
      <Text
        style={{
          fontFamily: selected ? f.body700 : f.body400,
          fontSize: 9,
          color: selected ? '#6B6FC9' : c.muted,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function SymptomChip({ label, selected = false }: { label: string; selected?: boolean }) {
  return (
    <View
      style={[
        {
          backgroundColor: selected ? '#FBE0EA' : c.canvas,
          borderRadius: 999,
          paddingVertical: 7,
          paddingHorizontal: 14,
        },
        selected ? null : { borderWidth: 1, borderColor: 'rgba(51,50,74,0.08)' },
      ]}
    >
      <Text style={{ fontFamily: f.body600, fontSize: 12, color: selected ? '#D46E97' : '#6F6E86' }}>
        {label}
      </Text>
    </View>
  );
}
