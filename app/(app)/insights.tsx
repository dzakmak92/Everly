import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { color, font, radius, shadow, childToken } from '../../src/theme/tokens';
import { ChevronLeft, Leaf } from '../../src/components/icons';
import { Silhouette } from '../../src/components/ui';
import { useData, entriesOn, upcomingEvents, ENTRY_META, type Entry } from '../../src/lib/store';

const DAY = 86400000;
const WEEK_MS = 7 * DAY;

type Tab = 'day' | 'patterns' | 'week';
const TABS: { key: Tab; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'patterns', label: 'Patterns' },
  { key: 'week', label: 'Week' },
];

export default function Insights({ embedded }: { embedded?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string }>();

  const initial: Tab =
    params.tab === 'day' || params.tab === 'week' || params.tab === 'patterns' ? params.tab : 'patterns';
  const [tab, setTab] = useState<Tab>(initial);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{
        paddingTop: embedded ? 4 : insets.top + 8,
        paddingBottom: insets.bottom + 28,
        paddingHorizontal: 20,
        gap: 14,
      }}
    >
      {/* back chevron */}
      {!embedded && (
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }} hitSlop={8}>
          <ChevronLeft size={24} color={color.ink} />
        </Pressable>
      )}

      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Insights</Text>

      {/* segmented tab control */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#fff',
          borderRadius: radius.pill,
          padding: 4,
          ...shadow.row,
        }}
      >
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={{
                flex: 1,
                paddingVertical: 9,
                borderRadius: radius.pill,
                alignItems: 'center',
                backgroundColor: active ? color.primary : 'transparent',
              }}
            >
              <Text
                style={{
                  fontFamily: font.body700,
                  fontSize: 13,
                  color: active ? '#fff' : color.inkSecondary,
                }}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'day' && <DayTab />}
      {tab === 'patterns' && <PatternsTab />}
      {tab === 'week' && <WeekTab />}
    </ScrollView>
  );
}

/* ───────────────────────────────────────────────────────────── DAY (Rhythm) */

const SIZE = 256;
const C = SIZE / 2;
const RING_R = 96;
const STROKE = 30;

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

function sleepMinutesFor(dayEntries: Entry[]): number {
  return dayEntries.filter((e) => e.kind === 'sleep').reduce((s, e) => s + (e.durationMin ?? 0), 0);
}
function feedCountFor(dayEntries: Entry[]): number {
  return dayEntries.filter((e) => e.kind === 'feed').length;
}

function DayTab() {
  const { entries, activeChild, growth } = useData();

  // Scope to the active child so switching changes the ring + stats.
  const cid = activeChild?.id;
  const mine = cid ? entries.filter((e) => e.childId === cid) : entries;

  const today = entriesOn(mine);
  const sleeps = today.filter((e) => e.kind === 'sleep' && (e.durationMin ?? 0) > 0);
  const sleepMin = sleepMinutesFor(today);
  const dots = today.filter((e) => e.kind !== 'sleep');

  // ── Multi-day series (last 7 days, oldest → newest) for stats + sparklines.
  const days = Array.from({ length: 7 }).map((_, i) => {
    const ref = new Date();
    ref.setDate(ref.getDate() - (6 - i));
    return entriesOn(mine, ref);
  });
  const sleepSeries = days.map(sleepMinutesFor);
  const feedSeries = days.map(feedCountFor);

  const sleepDays = sleepSeries.filter((m) => m > 0);
  const avgSleepMin = sleepDays.length ? Math.round(sleepDays.reduce((a, b) => a + b, 0) / sleepDays.length) : 0;
  const avgSleepLabel = avgSleepMin > 0 ? `${(avgSleepMin / 60).toFixed(1)}h` : '—';

  const totalFeeds = feedSeries.reduce((a, b) => a + b, 0);
  const avgFeeds = totalFeeds / 7; // average across all 7 days, not just days with feeds
  const avgFeedsLabel = totalFeeds > 0 ? avgFeeds.toFixed(1) : '—';

  const deltaMin = avgSleepMin > 0 ? sleepMin - avgSleepMin : 0;
  const deltaLabel =
    avgSleepMin > 0 && sleepMin > 0 ? `${deltaMin >= 0 ? '↑' : '↓'} ${Math.abs(deltaMin)}m vs avg` : null;

  const childGrowth = activeChild
    ? growth.filter((g) => g.childId === activeChild.id).sort((a, b) => a.at.localeCompare(b.at))
    : [];
  // Growth: show the latest weight (fall back to height) plus its trend — no
  // medical-sounding percentile, since we have no age/sex reference curve.
  const weightPoints = childGrowth.filter((g) => g.weightKg != null && g.weightKg > 0);
  const heightPoints = childGrowth.filter((g) => g.heightCm != null && g.heightCm > 0);
  const useWeight = weightPoints.length > 0;
  const growthPoints = useWeight ? weightPoints : heightPoints;
  const growthSeries = growthPoints
    .slice(-7)
    .map((g) => (useWeight ? g.weightKg! : g.heightCm!));
  const latestVal = growthSeries.length ? growthSeries[growthSeries.length - 1] : null;
  const prevVal = growthSeries.length > 1 ? growthSeries[growthSeries.length - 2] : null;
  const growthUnit = useWeight ? 'kg' : 'cm';
  const growthLabel = latestVal != null ? `${latestVal}${growthUnit}` : '—';
  const growthTrend =
    latestVal != null && prevVal != null && latestVal !== prevVal
      ? `${latestVal > prevVal ? '↑' : '↓'} ${Math.abs(+(latestVal - prevVal).toFixed(2))}${growthUnit}`
      : null;

  const sw = 64;
  const sh = 18;
  const lilac = childToken.lilac;
  const mint = childToken.mint;
  const butter = childToken.butter;
  const peach = childToken.peach;
  const childName = activeChild?.name ?? 'Baby';

  return (
    <View style={{ gap: 14 }}>
      {/* child-context pill */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: font.display700, fontSize: 20, color: color.ink, flexShrink: 1 }}>
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
            <Circle cx={C} cy={C} r={RING_R} stroke="rgba(51,50,74,0.05)" strokeWidth={STROKE} fill="none" />

            {sleeps.map((e) => {
              const a1 = frac(e.at);
              const a2 = Math.min(1, a1 + e.durationMin! / 60 / 24);
              return <Path key={e.id} d={arc(RING_R, a1, a2)} stroke={lilac.fill} strokeWidth={STROKE} fill="none" />;
            })}

            {dots
              .filter((e) => e.kind === 'feed')
              .map((e) => {
                const a1 = frac(e.at);
                const a2 = a1 + 0.035;
                return <Path key={e.id} d={arc(RING_R, a1, Math.min(1, a2))} stroke={mint.fill} strokeWidth={STROKE} fill="none" />;
              })}

            {dots
              .filter((e) => e.kind !== 'feed')
              .map((e) => {
                const p = polar(RING_R, frac(e.at));
                const tint = e.kind === 'diaper' ? peach.fill : ENTRY_META[e.kind].fill;
                return <Circle key={e.id} cx={p.x} cy={p.y} r={8} fill={tint} stroke="#fff" strokeWidth={2.5} />;
              })}

            {[0, 0.25, 0.5, 0.75].map((a) => {
              const p = polar(RING_R + STROKE / 2 + 6, a);
              return <Circle key={a} cx={p.x} cy={p.y} r={2} fill={color.muted} opacity={0.25} />;
            })}
          </Svg>

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
        <SparkCard label={useWeight ? 'Weight' : 'Height'} value={growthLabel} sub={growthTrend} path={sparkPath(growthSeries, sw, sh)} w={sw} h={sh} lineColor={butter.stroke} />
      </View>

      {today.length === 0 && (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, alignItems: 'center' }, shadow.card]}>
          <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted, textAlign: 'center' }}>
            Log entries on Today to see them placed on the ring.
          </Text>
        </View>
      )}
    </View>
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
  sub,
  path,
  w,
  h,
  lineColor,
}: {
  label: string;
  value: string;
  sub?: string | null;
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
      <Text style={{ fontFamily: font.display700, fontSize: 19, color: color.ink, marginBottom: sub ? 2 : 8 }}>{value}</Text>
      {sub ? (
        <Text style={{ fontFamily: font.body700, fontSize: 10, color: color.primary, marginBottom: 6 }}>{sub}</Text>
      ) : null}
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

/* ────────────────────────────────────────────────────── PATTERNS (Gentle) */

function PatternsTab() {
  const { entries, savedTips, saveTip, deleteTip } = useData();

  const now = Date.now();
  const inRange = (e: { at: string }, a: number, b: number) => {
    const t = new Date(e.at).getTime();
    return t >= now - b && t < now - a;
  };
  const sleepMin = (a: number, b: number) =>
    entries.filter((e) => e.kind === 'sleep' && inRange(e, a, b)).reduce((s, e) => s + (e.durationMin ?? 0), 0);

  const thisWk = sleepMin(0, 7 * DAY);
  const prevWk = sleepMin(7 * DAY, 14 * DAY);
  const deltaPerDay = Math.round((thisWk - prevWk) / 7);
  const feeds = entries.filter((e) => e.kind === 'feed' && inRange(e, 0, 7 * DAY)).length;
  const days = new Set(entries.filter((e) => inRange(e, 0, 7 * DAY)).map((e) => new Date(e.at).toDateString())).size;

  const tips: string[] = [];
  if (thisWk > 0 || prevWk > 0) {
    if (deltaPerDay >= 20) tips.push(`Sleep is improving — about ${deltaPerDay} min more per day this week than last. Whatever you're doing is working.`);
    else if (deltaPerDay <= -20) tips.push(`Sleep dipped about ${Math.abs(deltaPerDay)} min/day versus last week. Growth spurts and changes are normal — be gentle with yourself.`);
    else tips.push(`Sleep has been steady this week. Consistency helps little ones settle.`);
  }
  if (feeds > 0) tips.push(`You logged ${feeds} feeds in the last 7 days — a lovely record to look back on.`);
  if (days > 0) tips.push(`You logged something on ${days} of the last 7 days. Small, consistent notes add up.`);
  if (tips.length === 0) tips.push(`Start logging on the Today tab and gentle insights about your patterns will appear here.`);

  return (
    <View style={{ gap: 14 }}>
      <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>Based on your patterns this week. On-device only.</Text>

      {tips.map((t, i) => (
        <View key={i} style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, gap: 10 }, shadow.card]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Leaf size={16} color={color.maternalTeal} />
            <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.tealInk }}>A gentle thought</Text>
          </View>
          <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.ink, lineHeight: 20 }}>{t}</Text>
          <Pressable onPress={() => saveTip(t)} style={{ alignSelf: 'flex-start' }}>
            <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>Save this tip</Text>
          </Pressable>
        </View>
      ))}

      {savedTips.length > 0 && (
        <View style={{ gap: 8, marginTop: 4 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Saved</Text>
          {savedTips.map((t) => (
            <View key={t.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', gap: 10 }, shadow.card]}>
              <Text style={{ flex: 1, fontFamily: font.body500, fontSize: 13, color: color.inkSecondary, lineHeight: 19 }}>{t.text}</Text>
              <Pressable onPress={() => deleteTip(t.id)} hitSlop={8}>
                <Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/* ──────────────────────────────────────────────────────── WEEK (Digest) */

function WeekTab() {
  const { entries, events, vaccines, children } = useData();

  const since = Date.now() - WEEK_MS;
  const weekEntries = entries.filter((e) => new Date(e.at).getTime() >= since);
  const nextWeekEnd = Date.now() + WEEK_MS;
  const soon = upcomingEvents(events).filter((e) => new Date(e.at).getTime() <= nextWeekEnd);

  function lineFor(childId?: string) {
    const es = weekEntries.filter((e) => e.childId === childId);
    const feeds = es.filter((e) => e.kind === 'feed').length;
    const sleepMin = es.filter((e) => e.kind === 'sleep').reduce((s, e) => s + (e.durationMin ?? 0), 0);
    const avgSleepH = (sleepMin / 60 / 7).toFixed(1);
    const diapers = es.filter((e) => e.kind === 'diaper').length;
    return `${feeds} feeds · ${avgSleepH}h avg sleep/day · ${diapers} diapers`;
  }

  const dueVaccines = vaccines.filter((v) => !v.givenDate);

  return (
    <View style={{ gap: 16 }}>
      <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>Your family's last 7 days and the week ahead.</Text>

      {/* Per child */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>This week</Text>
        {children.length === 0 ? (
          <DigestCard><Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>No children yet.</Text></DigestCard>
        ) : children.map((ch) => (
          <DigestCard key={ch.id}>
            <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.ink }}>{ch.name}</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary, marginTop: 2 }}>{lineFor(ch.id)}</Text>
          </DigestCard>
        ))}
      </View>

      {/* Upcoming */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Coming up</Text>
        {soon.length === 0 ? (
          <DigestCard><Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>No events in the next 7 days.</Text></DigestCard>
        ) : soon.map((ev) => (
          <DigestCard key={ev.id}>
            <Text style={{ fontFamily: font.body600, fontSize: 14, color: color.ink }}>{ev.title}</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>{new Date(ev.at).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</Text>
          </DigestCard>
        ))}
      </View>

      {/* Reminders */}
      {dueVaccines.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Health reminders</Text>
          {dueVaccines.map((v) => (
            <DigestCard key={v.id}><Text style={{ fontFamily: font.body600, fontSize: 14, color: color.ink }}>⚠ {v.name}{v.dueDate ? ` · due ${v.dueDate}` : ''}</Text></DigestCard>
          ))}
        </View>
      )}

      <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, lineHeight: 18 }}>
        On a phone build, this digest can be delivered as a weekly push notification.
      </Text>
    </View>
  );
}

function DigestCard({ children }: { children: React.ReactNode }) {
  return <View style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14 }, shadow.card]}>{children}</View>;
}
