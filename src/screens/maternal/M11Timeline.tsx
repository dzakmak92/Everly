import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';
import { LockGlyph } from '../../components/icons';

const f = font;

/* M11 · Maternal Timeline — the mother's own continuous teal vertical spine. */
export default function M11Timeline() {
  return (
    <View style={{ backgroundColor: color.canvas }}>
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
          <Text style={{ fontFamily: f.display700, fontSize: 22, color: color.ink }}>Your Journey</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 13, color: color.muted, marginTop: 4 }}>
            Emma · Pregnancy → Postpartum
          </Text>
        </View>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={1.8} strokeLinecap="round">
          <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </Svg>
      </View>

      {/* timeline spine */}
      <View style={{ paddingHorizontal: 20 }}>
        {/* conception */}
        <Stage dot={<Dot bg="#FBE0EA">🌱</Dot>} line={<Line colors={['#FBE0EA', '#E7E4FB']} />}>
          <StageLabel color="#D46E97">October 2025 · Preconception</StageLabel>
          <PlainCard>Started TTC · Folic acid · Cycle tracking began</PlainCard>
        </Stage>

        {/* positive test */}
        <Stage dot={<Dot bg="#E98FB3">✨</Dot>} line={<Line colors={['#E7E4FB', '#E7E4FB']} />}>
          <StageLabel color="#E98FB3">December 2025 · Positive test</StageLabel>
          <PlainCard>"I can't believe it" — first note in bump journal</PlainCard>
        </Stage>

        {/* week 12 scan */}
        <Stage dot={<Dot bg="#E7E4FB">📸</Dot>} line={<Line colors={['#E7E4FB', '#D8F0E6']} />}>
          <StageLabel color="#6B6FC9">March 2026 · 12-week scan</StageLabel>
          <PlainCard>NT clear · First scan photo saved · Shared with Mum & Dad</PlainCard>
        </Stage>

        {/* birth */}
        <Stage
          dot={
            <View
              style={[
                {
                  width: 32,
                  height: 32,
                  backgroundColor: '#3A9B8A',
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                {
                  shadowColor: '#3A9B8A',
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 3,
                },
              ]}
            >
              <Text style={{ fontSize: 14 }}>🌟</Text>
            </View>
          }
          line={<Line colors={['#D8F0E6', '#E0F4EF']} />}
        >
          <StageLabel color="#3A9B8A">12 May 2026 · Oliver born</StageLabel>
          <View style={{ backgroundColor: '#E0F4EF', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 12, lineHeight: 17, color: '#1E5C50' }}>
              3.6kg · 03:47am · Vaginal birth · 7h 22m labour. You did it. 💚
            </Text>
          </View>
        </Stage>

        {/* now: postpartum (no line) */}
        <Stage
          dot={
            <View
              style={{
                width: 28,
                height: 28,
                backgroundColor: '#E0F4EF',
                borderRadius: 14,
                borderWidth: 2,
                borderColor: '#3A9B8A',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={{ width: 8, height: 8, backgroundColor: '#3A9B8A', borderRadius: 4 }} />
            </View>
          }
        >
          <StageLabel color="#3A9B8A">Now · Week 6 postpartum</StageLabel>
          <PlainCard>
            Recovery on track. Mood improving. Your story continues here — it doesn't end at birth.
          </PlainCard>
        </Stage>

        {/* future: subsequent pregnancy chapter (no line) */}
        <Stage
          dot={
            <View
              style={{
                width: 28,
                height: 28,
                backgroundColor: '#F4F3FB',
                borderRadius: 14,
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: '#C8C6DC',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
                <Path d="M12 5v14M5 12h14" />
              </Svg>
            </View>
          }
        >
          <StageLabel color="#9C9AB2">A future chapter</StageLabel>
          <View
            style={{
              backgroundColor: '#fff',
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: 'rgba(51,50,74,0.12)',
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ fontFamily: f.body400, fontSize: 12, lineHeight: 17, color: '#9C9AB2' }}>
              Each new pregnancy opens its own chapter here — “Second pregnancy · 2027” — Mum&Me re-opens free every time.
            </Text>
          </View>
        </Stage>
      </View>

      {/* export banner */}
      <View
        style={[
          {
            marginTop: 14,
            marginHorizontal: 20,
            marginBottom: 24,
            backgroundColor: '#3A9B8A',
            paddingVertical: 14,
            paddingHorizontal: 14,
            borderRadius: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          },
          {
            shadowColor: '#3A9B8A',
            shadowOpacity: 0.3,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          },
        ]}
      >
        <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#fff' }}>Export your maternal story</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: 'rgba(255,255,255,0.22)',
            borderRadius: 999,
            paddingVertical: 3,
            paddingHorizontal: 9,
          }}
        >
          <LockGlyph size={11} />
          <Text style={{ fontFamily: f.body700, fontSize: 9, letterSpacing: 0.4, color: '#fff' }}>PREMIUM</Text>
        </View>
      </View>
    </View>
  );
}

/* ── helpers ──────────────────────────────────────────────────────────── */

function Stage({
  dot,
  line,
  children,
}: {
  dot: React.ReactNode;
  line?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start', paddingVertical: 6 }}>
      <View style={{ alignItems: 'center', width: 36 }}>
        {dot}
        {line}
      </View>
      <View style={{ flex: 1, paddingBottom: line ? 12 : 0 }}>{children}</View>
    </View>
  );
}

function Dot({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        backgroundColor: bg,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 12 }}>{children}</Text>
    </View>
  );
}

function Line({ colors }: { colors: [string, string] }) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ width: 2, flex: 1, minHeight: 28, marginTop: 4 }}
    />
  );
}

function StageLabel({ children, color: c }: { children: React.ReactNode; color: string }) {
  return (
    <Text
      style={{
        fontFamily: font.body700,
        fontSize: 11,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        color: c,
        marginBottom: 4,
      }}
    >
      {children}
    </Text>
  );
}

function PlainCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={[
        { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
        shadow.row,
      ]}
    >
      <Text style={{ fontFamily: font.body400, fontSize: 12, lineHeight: 17, color: '#6F6E86' }}>{children}</Text>
    </View>
  );
}
