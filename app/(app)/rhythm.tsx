import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Line, Text as SvgText } from 'react-native-svg';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { ChevronLeft } from '../../src/components/icons';
import { useData, entriesOn, ENTRY_META } from '../../src/lib/store';

const SIZE = 280;
const C = SIZE / 2;
const R = 104;

function frac(iso: string) { const d = new Date(iso); return (d.getHours() + d.getMinutes() / 60) / 24; }
function polar(r: number, a: number) { const rad = (a * 360 - 90) * Math.PI / 180; return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) }; }
function arc(r: number, a1: number, a2: number) {
  const s = polar(r, a1), e = polar(r, a2);
  const large = a2 - a1 > 0.5 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export default function Rhythm() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entries, activeChild } = useData();
  const today = entriesOn(entries);

  const sleeps = today.filter((e) => e.kind === 'sleep' && (e.durationMin ?? 0) > 0);
  const sleepMin = today.filter((e) => e.kind === 'sleep').reduce((s, e) => s + (e.durationMin ?? 0), 0);
  const dots = today.filter((e) => e.kind !== 'sleep');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Rhythm Ring</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>{activeChild ? `${activeChild.name}'s day` : "Today's day"} at a glance — 24 hours, midnight at top.</Text>

      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, alignItems: 'center' }, shadow.card]}>
        <Svg width={SIZE} height={SIZE}>
          {/* track */}
          <Circle cx={C} cy={C} r={R} stroke={color.canvas} strokeWidth={16} fill="none" />
          {/* hour ticks every 2h */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = i / 12; const o = polar(R + 14, a); const inn = polar(R + 7, a);
            return <Line key={i} x1={inn.x} y1={inn.y} x2={o.x} y2={o.y} stroke={color.faint} strokeWidth={1.5} />;
          })}
          {/* sleep arcs */}
          {sleeps.map((e) => {
            const a1 = frac(e.at); const a2 = Math.min(1, a1 + (e.durationMin! / 60) / 24);
            return <Path key={e.id} d={arc(R, a1, a2)} stroke={ENTRY_META.sleep.ink} strokeWidth={16} fill="none" strokeLinecap="round" opacity={0.85} />;
          })}
          {/* point markers */}
          {dots.map((e) => { const p = polar(R, frac(e.at)); return <Circle key={e.id} cx={p.x} cy={p.y} r={6} fill={ENTRY_META[e.kind].ink} />; })}
          {/* labels */}
          <SvgText x={C} y={28} fill={color.muted} fontSize={11} fontWeight="700" textAnchor="middle">12a</SvgText>
          <SvgText x={SIZE - 18} y={C + 4} fill={color.muted} fontSize={11} fontWeight="700" textAnchor="middle">6a</SvgText>
          <SvgText x={C} y={SIZE - 18} fill={color.muted} fontSize={11} fontWeight="700" textAnchor="middle">12p</SvgText>
          <SvgText x={20} y={C + 4} fill={color.muted} fontSize={11} fontWeight="700" textAnchor="middle">6p</SvgText>
          {/* center */}
          <SvgText x={C} y={C - 4} fill={color.ink} fontSize={30} fontWeight="700" textAnchor="middle">{`${Math.floor(sleepMin / 60)}h ${sleepMin % 60}m`}</SvgText>
          <SvgText x={C} y={C + 18} fill={color.muted} fontSize={12} textAnchor="middle">sleep today</SvgText>
        </Svg>

        {/* legend */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 12, justifyContent: 'center' }}>
          {(['sleep', 'feed', 'diaper', 'pump', 'note'] as const).map((k) => (
            <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: ENTRY_META[k].ink }} />
              <Text style={{ fontFamily: font.body500, fontSize: 12, color: color.inkSecondary }}>{ENTRY_META[k].label}</Text>
            </View>
          ))}
        </View>
      </View>

      {today.length === 0 && (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, alignItems: 'center' }, shadow.card]}>
          <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>Log entries on Today to see them placed on the ring.</Text>
        </View>
      )}
    </ScrollView>
  );
}
