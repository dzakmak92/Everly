import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { color, font, radius, shadow, childToken } from '../../src/theme/tokens';
import { ChevronLeft } from '../../src/components/icons';
import { Silhouette } from '../../src/components/ui';
import { useData, entriesOn, ENTRY_META, type Entry } from '../../src/lib/store';

const SIZE = 256;
const C = SIZE / 2;
const R = 96;
const STROKE = 30; // thicker wedge weight to match the mockup

function frac(iso: string) {
  const d = new Date(iso);
  return (d.getHours() + d.getMinutes() / 60) / 24;
}
function polar(r: number, a: number) {
  const rad = (a * 360 - 90) * (Math.PI / 180);
  return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) };
}
function arc(r: number, a1: number, a2: number) {
  const s = polar(r, a1);
  const e = polar(r, a2);
  const large = a2 - a1 > 0.5 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

/** Build a smooth-ish polyline path for a sparkline from a numeric series. */
function sparkPath(values: number[], w: number, h: number): string {
  if (values.length === 0) return '';
  if (values.length === 1) return `M 0 ${h / 2} L ${w} ${h / 2}`;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = w / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = h - ((v - min) / span) * h;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

/** Sum sleep minutes for a single day's entries. */
function sleepMinutesFor(dayEntries: Entry[]): number {
  return dayEntries.filter((e) => e.kind === 'sleep').reduce((s, e) => s + (e.durationMin ?? 0), 0);
}
/** Count feed entries for a single day. */
function feedCountFor(dayEntries: Entry[]): number {
  return dayEntries.filter((e) => e.kind === 'feed').length;
}

export default function Rhythm() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entries, activeChild, growth } = useData();

  const today = entriesOn(entries);
  const sleeps = today.filter((e) => e.kind === 'sleep' && (e.durationMin ?? 0) > 0);
  const sleepMin = sleepMinutesFor(today);
  const dots = today.filter((e) => e.kind !== 'sleep');

  // ── Multi-day series (last 7 days, oldest → newest) for stats + sparklines.
  const days = Array.from({ length: 7 }).map((_, i) => {
    const ref = new Date();
    ref.setDate(ref.getDate() - (6 - i));
    return entriesOn(entries, ref);
  });
  const sleepSeries = days.map(sleepMinutesFor);
  const feedSeries = days.map(feedCountFor);

  // Average sleep across days that actually have any sleep logged.
  const sleepDays = sleepSeries.filter((m) => m > 0);
  const avgSleepMin = sleepDays.length ? Math.round(sleepDays.reduce((a, b) => a + b, 0) / sleepDays.length) : 0;
  const avgSleepLabel = avgSleepMin > 0 ? `${(avgSleepMin / 60).toFixed(1)}h` : '—';

  const feedDays = feedSeries.filter((n) => n > 0);
  const avgFeeds = feedDays.length ? feedSeries.reduce((a, b) => a + b, 0) / feedDays.length : 0;
  const avgFeedsLabel = feedDays.length ? avgFeeds.toFixed(1) : '—';

  // Today's sleep vs the running average → periwinkle delta line.
  const deltaMin = avgSleepMin > 0 ? sleepMin - avgSleepMin : 0;
  const deltaLabel =
    avgSleepMin > 0 && sleepMin > 0
      ? `${deltaMin >= 0 ? '↑' : '↓'} ${Math.abs(deltaMin)}m vs avg`
      : null;

  // Growth percentile — best-effort from the latest growth record for the child.
  const childGrowth = activeChild
    ? growth.filter((g) => g.childId === activeChild.id).sort((a, b) => a.at.localeCompare(b.at))
    : [];
  const latestGrowth = childGrowth[childGrowth.length - 1];
  const growthPct = estimatePercentile(latestGrowth?.weightKg);
  const growthLabel = growthPct != null ? `${ordinal(growthPct)}` : '—';
  const growthSeries =
    childGrowth.length > 0
      ? childGrowth.slice(-7).map((g) => g.weightKg ?? g.heightCm ?? 0)
      : [];

  const sw = 64; // sparkline width
  const sh = 18; // sparkline height
  const lilac = childToken.lilac;
  const mint = childToken.mint;
  const butter = childToken.butter;
  const peach = childToken.peach;
  const childName = activeChild?.name ?? 'Baby';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingBottom: insets.bottom + 28,
        paddingHorizontal: 20,
        gap: 14,
      }}
    >
      {/* back chevron */}
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }} hitSlop={8}>
        <ChevronLeft size={24} color={color.ink} />
      </Pressable>

      {/* header: title + child chip */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink, flexShrink: 1 }}>
          {`${childName}'s Rhythm`}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            backgroundColor: mint.fill,
            borderRadius: radius.pill,
            paddingVertical: 6,
            paddingRight: 14,
            paddingLeft: 6,
          }}
        >
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: mint.stroke,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <Silhouette size={18} fill="#fff" />
          </View>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: mint.stroke }}>{childName}</Text>
        </View>
      </View>

      {/* ring card */}
      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, alignItems: 'center' }, shadow.card]}>
        <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={SIZE} height={SIZE}>
            {/* base track ring */}
            <Circle cx={C} cy={C} r={R} stroke="rgba(51,50,74,0.05)" strokeWidth={STROKE} fill="none" />

            {/* sleep arcs (lilac wedges) */}
            {sleeps.map((e) => {
              const a1 = frac(e.at);
              const a2 = Math.min(1, a1 + e.durationMin! / 60 / 24);
              return <Path key={e.id} d={arc(R, a1, a2)} stroke={lilac.fill} strokeWidth={STROKE} fill="none" />;
            })}

            {/* feed arcs (mint short wedges) */}
            {dots
              .filter((e) => e.kind === 'feed')
              .map((e) => {
                const a1 = frac(e.at);
                const a2 = a1 + 0.035; // ~50min wedge so feeds read as weighted segments
                return <Path key={e.id} d={arc(R, a1, Math.min(1, a2))} stroke={mint.fill} strokeWidth={STROKE} fill="none" />;
              })}

            {/* diaper / other markers (peach dots on the ring) */}
            {dots
              .filter((e) => e.kind !== 'feed')
              .map((e) => {
                const p = polar(R, frac(e.at));
                const tint = e.kind === 'diaper' ? peach.fill : ENTRY_META[e.kind].fill;
                return <Circle key={e.id} cx={p.x} cy={p.y} r={8} fill={tint} stroke="#fff" strokeWidth={2.5} />;
              })}

            {/* hour ticks at quarters */}
            {[0, 0.25, 0.5, 0.75].map((a) => {
              const p = polar(R + STROKE / 2 + 6, a);
              return <Circle key={a} cx={p.x} cy={p.y} r={2} fill={color.muted} opacity={0.25} />;
            })}
          </Svg>

          {/* center label */}
          <View
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}
            pointerEvents="none"
          >
            <Text style={{ fontFamily: font.display700, fontSize: 30, color: color.ink }}>
              {`${Math.floor(sleepMin / 60)}h ${sleepMin % 60}m`}
            </Text>
            <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 4 }}>total sleep</Text>
            {deltaLabel && (
              <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.primary, marginTop: 5 }}>{deltaLabel}</Text>
            )}
          </View>
        </View>

        {/* legend — 3 items to match design */}
        <View style={{ flexDirection: 'row', gap: 18, justifyContent: 'center', marginTop: 14 }}>
          <LegendItem swatch={lilac.fill} round={false} label="Sleep" />
          <LegendItem swatch={mint.fill} round={false} label="Feeds" />
          <LegendItem swatch={peach.fill} round label="Diapers" />
        </View>
      </View>

      {/* stat sparkline cards */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <SparkCard label="Avg sleep" value={avgSleepLabel} path={sparkPath(sleepSeries, sw, sh)} w={sw} h={sh} lineColor={lilac.stroke} />
        <SparkCard label="Feeds/day" value={avgFeedsLabel} path={sparkPath(feedSeries, sw, sh)} w={sw} h={sh} lineColor={mint.stroke} />
        <SparkCard label="Growth" value={growthLabel} path={sparkPath(growthSeries, sw, sh)} w={sw} h={sh} lineColor={butter.stroke} />
      </View>

      {today.length === 0 && (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, alignItems: 'center' }, shadow.card]}>
          <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted, textAlign: 'center' }}>
            Log entries on Today to see them placed on the ring.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function LegendItem({ swatch, round, label }: { swatch: string; round: boolean; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 11, height: 11, backgroundColor: swatch, borderRadius: round ? 6 : 3 }} />
      <Text style={{ fontFamily: font.body500, fontSize: 12, color: color.inkSecondary }}>{label}</Text>
    </View>
  );
}

function SparkCard({
  label,
  value,
  path,
  w,
  h,
  lineColor,
}: {
  label: string;
  value: string;
  path: string;
  w: number;
  h: number;
  lineColor: string;
}) {
  return (
    <View style={[{ flex: 1, backgroundColor: '#fff', borderRadius: radius.cardSm, paddingVertical: 14, paddingHorizontal: 12 }, shadow.card]}>
      <Text
        style={{
          fontFamily: font.body700,
          fontSize: 9,
          color: color.muted,
          letterSpacing: 0.9,
          textTransform: 'uppercase',
          marginBottom: 5,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontFamily: font.display700, fontSize: 19, color: color.ink, marginBottom: 8 }}>{value}</Text>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        {path ? (
          <Path d={path} stroke={lineColor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <Line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke={color.faint} strokeWidth={1.5} strokeDasharray="2 3" />
        )}
      </Svg>
    </View>
  );
}

/** Crude weight→percentile mapping so the Growth card shows a plausible value. */
function estimatePercentile(weightKg?: number): number | null {
  if (weightKg == null || weightKg <= 0) return null;
  // Map a typical infant weight range (3–11kg) onto 5th–95th percentile.
  const pct = Math.round(5 + ((weightKg - 3) / (11 - 3)) * 90);
  return Math.max(1, Math.min(99, pct));
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}
