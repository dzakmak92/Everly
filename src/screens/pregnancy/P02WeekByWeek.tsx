import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, radius, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';
import { ChevronLeft, ChevronRight, BabyBean } from '../../components/icons';

const f = font;
const c = color;

/* P02 · Week-by-Week Companion — fetal development & baby size. */
export default function P02WeekByWeek() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* week header */}
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
        <ChevronLeft size={28} color={c.rose} strokeWidth={1.8} />
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: f.display700, fontSize: 26, color: c.ink }}>Week 24</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted, marginTop: 4 }}>
            of 40 · 16 weeks to go
          </Text>
        </View>
        <ChevronRight size={28} color={c.rose} strokeWidth={1.8} />
      </View>

      {/* trimester progress bar */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 18 }}>
        <View style={{ height: 8, backgroundColor: c.canvas, borderRadius: radius.pill, overflow: 'hidden' }}>
          <LinearGradient
            colors={['#FBE0EA', '#E98FB3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: '60%', height: '100%', borderRadius: radius.pill }}
          />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={{ fontFamily: f.body400, fontSize: 9, color: c.faint }}>W1</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 9, color: c.muted }}>1st trimester</Text>
          <Text style={{ fontFamily: f.body700, fontSize: 9, color: c.accentRose }}>2nd ✓</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 9, color: c.faint }}>3rd</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 9, color: c.faint }}>W40</Text>
        </View>
      </View>

      {/* baby size card */}
      <LinearGradient
        colors={['#FBE0EA', '#FCE6D8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginHorizontal: 20,
          marginBottom: 14,
          borderRadius: radius.card,
          padding: 20,
          paddingHorizontal: 18,
          flexDirection: 'row',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: f.body700,
              fontSize: 11,
              letterSpacing: 0.9,
              textTransform: 'uppercase',
              color: c.rose,
              marginBottom: 8,
            }}
          >
            Baby this week
          </Text>
          <Text style={{ fontFamily: f.display700, fontSize: 20, lineHeight: 22, color: c.ink, marginBottom: 6 }}>
            Corn on the cob
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {['~30cm', '~600g'].map((t) => (
              <View
                key={t}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  borderRadius: radius.pill,
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                }}
              >
                <Text style={{ fontFamily: f.body700, fontSize: 11, color: c.rose }}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
        <View
          style={{
            width: 64,
            height: 64,
            backgroundColor: 'rgba(255,255,255,0.5)',
            borderRadius: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BabyBean size={36} color={c.rose} />
        </View>
      </LinearGradient>

      {/* development tabs */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', gap: 6 }}>
        <View style={{ backgroundColor: c.accentRose, borderRadius: radius.pill, paddingVertical: 7, paddingHorizontal: 16 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#fff' }}>Baby</Text>
        </View>
        {['Your body', 'Nutrition'].map((t) => (
          <View
            key={t}
            style={{
              backgroundColor: '#fff',
              borderRadius: radius.pill,
              paddingVertical: 7,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderColor: 'rgba(51,50,74,0.08)',
            }}
          >
            <Text style={{ fontFamily: f.body600, fontSize: 12, color: c.inkSecondary }}>{t}</Text>
          </View>
        ))}
      </View>

      {/* development cards */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16, gap: 8 }}>
        <DevCard
          emoji="👂"
          chipBg="#FBE0EA"
          emojiColor={c.rose}
          title="Can hear your voice"
          body="Baby's inner ear is fully developed. Talk, sing, or play music — they can hear it now."
        />
        <DevCard
          emoji="🫁"
          chipBg="#FBE0EA"
          emojiColor={c.rose}
          title="Lungs developing"
          body="Producing surfactant — the substance that keeps lungs open after birth."
        />
        <DevCard
          emoji="👁"
          chipBg="#E7E4FB"
          emojiColor="#6B6FC9"
          title="Eyes forming"
          body="Eyelids still fused but eyes respond to light — shine a torch and they'll move away."
        />
      </View>
    </View>
  );
}

function DevCard({
  emoji,
  chipBg,
  emojiColor,
  title,
  body,
}: {
  emoji: string;
  chipBg: string;
  emojiColor: string;
  title: string;
  body: string;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: '#fff',
          borderRadius: radius.tile,
          padding: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          gap: 12,
          alignItems: 'flex-start',
        },
        shadow.card,
      ]}
    >
      <View
        style={{
          width: 36,
          height: 36,
          backgroundColor: chipBg,
          borderRadius: 11,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 16, color: emojiColor }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink, marginBottom: 4 }}>{title}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 12, lineHeight: 18, color: color.inkSecondary }}>{body}</Text>
      </View>
    </View>
  );
}
