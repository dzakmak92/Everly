import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { color, font, radius, shadow } from '../../theme/tokens';
import { StatusBar, Card, Silhouette } from '../../components/ui';
import { PeriBottomNav } from './A08Routines';

const f = font;
const c = color;

/* 09 · Co-Parent — custody week strip, expense split, balance gauge, settle up. */
export default function A09CoParent() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar showIcons />

      {/* title row */}
      <View
        style={{
          paddingTop: 12,
          paddingHorizontal: 24,
          paddingBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontFamily: f.display700, fontSize: 20, color: c.ink }}>Co-parent</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: '#D8F0E6',
            borderRadius: radius.pill,
            paddingVertical: 5,
            paddingRight: 12,
            paddingLeft: 5,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              backgroundColor: '#3FA98A',
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Silhouette size={10} fill="white" />
          </View>
          <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#3FA98A' }}>Oliver</Text>
        </View>
      </View>

      {/* two parent silhouettes */}
      <Card
        style={{
          marginHorizontal: 20,
          marginBottom: 16,
          padding: 18,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ alignItems: 'center', gap: 6 }}>
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: '#D8F0E6',
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Silhouette size={24} fill="#3FA98A" />
          </View>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#3FA98A' }}>You</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 10, color: '#9C9AB2' }}>Primary</Text>
        </View>

        <View style={{ alignItems: 'center', gap: 6, opacity: 0.4 }}>
          <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2' }}>this week</Text>
          <View style={{ width: 2, height: 28, backgroundColor: '#E7E4FB' }} />
        </View>

        <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#9C9AB2' }}>Oliver stays:</Text>

        <View style={{ alignItems: 'center', gap: 6 }}>
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: '#FCE6D8',
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Silhouette size={24} fill="#D9824F" />
          </View>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#D9824F' }}>Sam</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 10, color: '#9C9AB2' }}>Co-parent</Text>
        </View>
      </Card>

      {/* custody week strip */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text
          style={{
            fontFamily: f.body700,
            fontSize: 11,
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            color: '#9C9AB2',
            marginBottom: 10,
            paddingLeft: 4,
          }}
        >
          June custody
        </Text>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          <DayCell parent="you" day="M" date="23" />
          <DayCell parent="you" day="T" date="24" />
          <DayCell parent="you" day="W" date="25" />
          <DayCell parent="sam" day="T" date="26" />
          <DayCell parent="sam" day="F" date="27" />
          <DayCell parent="sam" day="S" date="28" faded />
          <DayCell parent="you" day="S" date="29" faded />
        </View>
      </View>

      {/* expenses */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
        <Text
          style={{
            fontFamily: f.body700,
            fontSize: 11,
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            color: '#9C9AB2',
            marginBottom: 10,
            paddingLeft: 4,
          }}
        >
          Expenses
        </Text>
        <Card style={{ overflow: 'hidden' }}>
          <ExpenseRow
            iconBg="#FBE0EA"
            iconColor="#D46E97"
            icon="shield"
            title="Doctor visit · €90"
            sub="50/50 split · Jun 15"
            tagBg="#FBE0EA"
            tagFg="#D46E97"
            tag="Sam owes €45"
            border
          />
          <ExpenseRow
            iconBg="#D8F0E6"
            iconColor="#3FA98A"
            icon="info"
            title="Nursery fees · €240"
            sub="Split agreed · Jun 1"
            tagBg="#D8F0E6"
            tagFg="#3FA98A"
            tag="Settled ✓"
          />
        </Card>
      </View>

      {/* balance gauge */}
      <Card style={{ marginVertical: 8, marginHorizontal: 20, padding: 16 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 12, color: c.ink, marginBottom: 10 }}>Running balance</Text>
        <View style={{ height: 10, borderRadius: radius.pill, overflow: 'hidden', flexDirection: 'row', marginBottom: 8 }}>
          <View style={{ flex: 1, backgroundColor: '#D8F0E6' }} />
          <View style={{ width: 2, backgroundColor: '#F4F3FB' }} />
          <View style={{ flex: 1, backgroundColor: '#FCE6D8' }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#3FA98A' }}>You paid €45</Text>
          <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#D9824F' }}>Sam owes €22.50</Text>
        </View>
      </Card>

      {/* settle up CTA */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <View
          style={[
            {
              backgroundColor: '#6B6FC9',
              paddingVertical: 15,
              paddingHorizontal: 15,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
            },
            shadow.periwinkleButton,
          ]}
        >
          <Text style={{ fontFamily: f.body800, fontSize: 15, color: '#fff' }}>Settle Up · €22.50</Text>
        </View>
      </View>

      <PeriBottomNav />
    </View>
  );
}

/* ── custody day cell ────────────────────────────────────────────────────── */
function DayCell({ parent, day, date, faded = false }: { parent: 'you' | 'sam'; day: string; date: string; faded?: boolean }) {
  const bg = parent === 'you' ? '#D8F0E6' : '#FCE6D8';
  const fg = parent === 'you' ? '#3FA98A' : '#D9824F';
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: bg,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 3,
        alignItems: 'center',
        opacity: faded ? 0.5 : 1,
      }}
    >
      <Text style={{ fontFamily: f.body700, fontSize: 9, color: fg }}>{day}</Text>
      <Text style={{ fontFamily: f.body600, fontSize: 11, color: fg, marginTop: 4 }}>{date}</Text>
    </View>
  );
}

/* ── expense split row ───────────────────────────────────────────────────── */
function ExpenseRow({
  iconBg,
  iconColor,
  icon,
  title,
  sub,
  tagBg,
  tagFg,
  tag,
  border = false,
}: {
  iconBg: string;
  iconColor: string;
  icon: 'shield' | 'info';
  title: string;
  sub: string;
  tagBg: string;
  tagFg: string;
  tag: string;
  border?: boolean;
}) {
  return (
    <View
      style={{
        paddingVertical: 14,
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
          width: 36,
          height: 36,
          backgroundColor: iconBg,
          borderRadius: 11,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon === 'shield' ? (
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </Svg>
        ) : (
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="12" cy="12" r="10" />
            <Line x1="12" y1="8" x2="12" y2="12" />
            <Line x1="12" y1="16" x2="12.01" y2="16" />
          </Svg>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink }}>{title}</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2' }}>{sub}</Text>
      </View>
      <View style={{ backgroundColor: tagBg, borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 10 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 10, color: tagFg }}>{tag}</Text>
      </View>
    </View>
  );
}
