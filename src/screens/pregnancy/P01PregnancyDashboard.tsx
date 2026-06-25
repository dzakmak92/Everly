import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, radius, shadow } from '../../theme/tokens';
import {
  StatusBar,
  Card,
  Pill,
  IconChip,
  SectionLabel,
  ProgressBar,
  BottomNav,
} from '../../components/ui';
import { Camera, Clock, Smile, ChevronRight, Phone } from '../../components/icons';

const f = font;
const c = color;

/* P01 · Pregnancy Dashboard — Mum&Me home. */
export default function P01PregnancyDashboard() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar showIcons />

      {/* Mum&Me brand row */}
      <View style={{ paddingHorizontal: 24, paddingTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 15, color: '#3A9B8A' }}>Mum&Me</Text>
        <Pill bg="#D4EDE7" fg={c.tealDeep} size={9} style={{ paddingVertical: 4, paddingHorizontal: 10 }}>
          Free forever
        </Pill>
      </View>

      {/* greeting + week */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ fontFamily: f.display700, fontSize: 20, color: c.ink }}>Good morning, Emma</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginTop: 5 }}>
            Monday, 23 June · 112 days to go
          </Text>
        </View>
        <Pill bg="#FBE0EA" fg={c.rose} size={12} style={{ paddingVertical: 7, paddingHorizontal: 14 }}>
          Week 24
        </Pill>
      </View>

      {/* progress bar */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
          <Text style={{ fontFamily: f.body400, fontSize: 10, color: c.muted }}>Week 1</Text>
          <Text style={{ fontFamily: f.body700, fontSize: 10, color: c.rose }}>24 / 40 weeks</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 10, color: c.muted }}>Birth</Text>
        </View>
        <ProgressBar pct={60} height={6} track={c.canvas} colors={['#E98FB3', '#D46E97']} />
      </View>

      {/* quick-log tiles */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', gap: 8 }}>
        <QuickTile label="Kick" tint="#3FA98A">
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#3FA98A" strokeWidth={2} strokeLinecap="round">
            <Path d="M12 2l.01 8M12 10c-1 0-2 .4-3 1l-1 2h8l-1-2c-1-.6-2-1-3-1z" />
            <Path d="M9 18l3 4 3-4" />
            <Path d="M9 13v5M15 13v5" />
          </Svg>
        </QuickTile>
        <QuickTile label="Mood" tint="#6B6FC9">
          <Smile size={22} color="#6B6FC9" mood="good" />
        </QuickTile>
        <QuickTile label="Time" tint="#C9A33B">
          <Clock size={22} color="#C9A33B" />
        </QuickTile>
        <QuickTile label="Scan" tint="#D46E97">
          <Camera size={22} color="#D46E97" />
        </QuickTile>
      </View>

      {/* today summary */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16, gap: 8 }}>
        <SectionLabel style={{ paddingLeft: 4, marginBottom: 2 }}>Today</SectionLabel>

        {/* card 1 — kick count */}
        <Card style={{ padding: 14, paddingHorizontal: 16, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <IconChip bg="#FBE0EA" size={40}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#D46E97" strokeWidth={2} strokeLinecap="round">
              <Path d="M12 2l.01 8M9 13v5M15 13v5" />
              <Path d="M9 10c0 0 1 1 3 1s3-1 3-1" />
            </Svg>
          </IconChip>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.ink, marginBottom: 3 }}>Kick count · 8 today</Text>
            <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted }}>Good · Recommended: 10 per 2h</Text>
          </View>
          <Pill bg="#D8F0E6" fg="#3FA98A" size={11} style={{ paddingHorizontal: 10 }}>
            ✓ Good
          </Pill>
        </Card>

        {/* card 2 — anatomy scan */}
        <Card style={{ padding: 14, paddingHorizontal: 16, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <IconChip bg="#E7E4FB" size={40}>
            <Phone size={18} color="#6B6FC9" />
          </IconChip>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.ink, marginBottom: 3 }}>Anatomy scan · Friday 09:00</Text>
            <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted }}>Dr. Walsh · City Maternity</Text>
          </View>
          <Pill bg="#E7E4FB" fg="#6B6FC9" size={11} style={{ paddingHorizontal: 10 }}>
            4 days
          </Pill>
        </Card>

        {/* card 3 — mood check-in */}
        <Card style={{ padding: 14, paddingHorizontal: 16, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <IconChip bg="#FBF1CE" size={40}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#C9A33B" strokeWidth={2} strokeLinecap="round">
              <Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </Svg>
          </IconChip>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.ink, marginBottom: 3 }}>Mood check-in · Not yet today</Text>
            <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted }}>Tap to log how you're feeling</Text>
          </View>
          <ChevronRight size={16} color={c.muted} />
        </Card>
      </View>

      {/* baby size this week */}
      <LinearGradient
        colors={['#FBE0EA', '#FCE6D8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginHorizontal: 20,
          marginBottom: 24,
          borderRadius: radius.cardSm,
          padding: 16,
          paddingHorizontal: 18,
          flexDirection: 'row',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink, marginBottom: 5 }}>Baby this week</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.inkSecondary, lineHeight: 18 }}>
            About the size of a corn on the cob · ~30cm · ~600g
          </Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.inkSecondary, lineHeight: 17, marginTop: 4 }}>
            Lungs developing · Can hear your voice
          </Text>
        </View>
        <View
          style={{
            width: 44,
            height: 44,
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#D46E97" strokeWidth={1.5} strokeLinecap="round">
            <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
            <Path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <Path d="M9 9h.01M15 9h.01" />
          </Svg>
        </View>
      </LinearGradient>

      <BottomNav />
    </View>
  );
}

function QuickTile({ label, tint, children }: { label: string; tint: string; children: React.ReactNode }) {
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: '#fff',
          borderRadius: radius.tile,
          paddingVertical: 14,
          paddingHorizontal: 6,
          alignItems: 'center',
          gap: 6,
        },
        shadow.tile,
      ]}
    >
      {children}
      <Text style={{ fontFamily: f.body700, fontSize: 10, color: c.ink }}>{label}</Text>
    </View>
  );
}
