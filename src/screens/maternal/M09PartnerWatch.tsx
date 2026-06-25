import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font } from '../../theme/tokens';
import { StatusBar, Silhouette } from '../../components/ui';

const f = font;
const c = color;

/* M09 · Partner-Watch — consented relay focused on HER wellbeing. */
export default function M09PartnerWatch() {
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
          <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Partner View</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginTop: 4 }}>
            Emma's wellbeing · Consented · E2E encrypted
          </Text>
        </View>
        {/* two adult silhouettes — her & partner */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Silhouette size={26} fill="#3A9B8A" />
          <View style={{ marginLeft: -8 }}>
            <Silhouette size={26} fill="#6B6FC9" />
          </View>
        </View>
      </View>

      {/* privacy note */}
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 14,
          backgroundColor: '#E7E4FB',
          borderRadius: 14,
          paddingVertical: 10,
          paddingHorizontal: 14,
          flexDirection: 'row',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round">
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <Path d="M9 12l2 2 4-4" />
        </Svg>
        <Text style={{ flex: 1, fontFamily: f.body500, fontSize: 12, lineHeight: 16.8, color: '#54579E' }}>
          Emma chose what you see here. She can update or revoke anytime.
        </Text>
      </View>

      {/* focused on HER */}
      <LinearGradient
        colors={['#E0F4EF', '#D4EDDB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ marginHorizontal: 20, marginBottom: 12, borderRadius: 22, paddingVertical: 20, paddingHorizontal: 18 }}
      >
        <Text
          style={{
            fontFamily: f.body700,
            fontSize: 11,
            letterSpacing: 0.9,
            textTransform: 'uppercase',
            color: '#3A9B8A',
            marginBottom: 12,
          }}
        >
          Emma today · Day 42
        </Text>
        <View style={{ gap: 10 }}>
          <HerRow emoji="😊" title="Mood: Good today" detail="2nd good day in a row — lovely trend ↑" />
          <HerRow emoji="😴" title="Sleep: 5h last night" detail="Below what she needs · She may appreciate rest" />
          <HerRow emoji="🌿" title="Recovery: Week 6 milestone" detail="6-week check on Friday — big moment for her" />
        </View>
      </LinearGradient>

      {/* suggested actions for partner */}
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
          She could use a hand with
        </Text>
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            overflow: 'hidden',
            shadowColor: '#33324A',
            shadowOpacity: 0.07,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 3 },
            elevation: 2,
          }}
        >
          <ActionRow emoji="🍽" label="Cooking dinner tonight" divider />
          <ActionRow emoji="😴" label="Take the 2am feed so she can sleep" divider />
          <ActionRow emoji="💬" label="Ask how her 6-week check prep is going" />
        </View>
      </View>

      <View style={{ height: 28 }} />
    </View>
  );
}

function HerRow({ emoji, title, detail }: { emoji: string; title: string; detail: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
      <View
        style={{
          width: 36,
          height: 36,
          backgroundColor: 'rgba(255,255,255,0.6)',
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 16 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 12, color: '#1E5C50' }}>{title}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 11, color: '#3A7A6A', marginTop: 2 }}>{detail}</Text>
      </View>
    </View>
  );
}

function ActionRow({ emoji, label, divider = false }: { emoji: string; label: string; divider?: boolean }) {
  return (
    <View
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: 'rgba(51,50,74,0.05)',
      }}
    >
      <Text style={{ fontSize: 16 }}>{emoji}</Text>
      <Text style={{ fontFamily: font.body600, fontSize: 13, color: color.ink, marginLeft: 8 }}>{label}</Text>
    </View>
  );
}
