import React, { useMemo } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Silhouette } from '../../src/components/ui';
import { Shield, Syringe, Check, Activity, ChevronRight } from '../../src/components/icons';
import { PremiumGate } from '../../src/components/PremiumGate';
import { useData, type Child, type Vaccine, type Medication, type Growth } from '../../src/lib/store';

const f = font;
const c = color;

/* ── helpers ─────────────────────────────────────────────────────────────── */

function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.round((then - Date.now()) / 86400000);
}

function dueLabel(iso?: string): string {
  const d = daysUntil(iso);
  if (d === null) return 'Scheduled';
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return 'Today';
  if (d === 1) return '1 day';
  return `${d} days`;
}

function shortDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Pick the most relevant vaccine for the card: soonest un-given due, else latest given. */
function pickVaccine(list: Vaccine[]): Vaccine | undefined {
  const upcoming = list
    .filter((v) => !v.givenDate && v.dueDate)
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
  if (upcoming.length) return upcoming[0];
  const given = list
    .filter((v) => v.givenDate)
    .sort((a, b) => (b.givenDate || '').localeCompare(a.givenDate || ''));
  if (given.length) return given[0];
  return list[0];
}

/** Pick the most relevant medication: first active, else first. */
function pickMedication(list: Medication[]): Medication | undefined {
  return list.find((m) => m.active) ?? list[0];
}

/** Latest growth measurement for a child set. */
function pickGrowth(list: Growth[]): Growth | undefined {
  return [...list].sort((a, b) => b.at.localeCompare(a.at))[0];
}

/* ── presentational pieces ───────────────────────────────────────────────── */

function IconChip({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        width: 40,
        height: 40,
        backgroundColor: bg,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );
}

function RecordCard({ onPress, children }: { onPress?: () => void; children: React.ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 16, opacity: pressed ? 0.9 : 1 },
        shadow.card,
      ]}
    >
      {children}
    </Pressable>
  );
}

/* ── screen ──────────────────────────────────────────────────────────────── */

export default function HealthTab() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { children, activeChild, vaccines, medications, growth } = useData();

  // Scope records to the active child when set; otherwise consider all children.
  const scopeIds = useMemo<string[] | null>(
    () => (activeChild ? [activeChild.id] : children.length ? children.map((ch) => ch.id) : null),
    [activeChild, children],
  );
  const inScope = <T extends { childId: string }>(list: T[]) =>
    scopeIds ? list.filter((x) => scopeIds.includes(x.childId)) : [];

  const myVaccines = inScope(vaccines);
  const myMeds = inScope(medications);
  const myGrowth = inScope(growth);

  const vaccine = pickVaccine(myVaccines);
  const med = pickMedication(myMeds);
  const g = pickGrowth(myGrowth);

  // Growth sparkline: chronological weight series (falls back to height).
  const series = useMemo(() => {
    const pts = [...myGrowth]
      .sort((a, b) => a.at.localeCompare(b.at))
      .map((x) => x.weightKg ?? x.heightCm)
      .filter((n): n is number => typeof n === 'number');
    return pts.slice(-8);
  }, [myGrowth]);

  // Navigate to the active child's detail screen, where add/edit record modals live.
  const targetChildId = activeChild?.id ?? children[0]?.id;
  const openRecords = targetChildId ? () => router.push(`/(app)/child/${targetChildId}`) : undefined;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}
    >
      {/* header */}
      <View
        style={{
          paddingVertical: 14,
          paddingHorizontal: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Health</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2', marginTop: 5 }}>
            Records &amp; reminders
          </Text>
        </View>
        {activeChild ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#D8F0E6',
              borderRadius: 999,
              paddingVertical: 6,
              paddingRight: 14,
              paddingLeft: 6,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                backgroundColor: '#3FA98A',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Silhouette size={14} fill="#fff" />
            </View>
            <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#3FA98A' }}>{activeChild.name}</Text>
          </View>
        ) : null}
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
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Shield size={16} color="#6B6FC9" />
        <Text style={{ flex: 1, fontFamily: f.body500, fontSize: 12, lineHeight: 17, color: '#54579E' }}>
          Health data stays on this device. Never shared or uploaded.
        </Text>
      </View>

      {/* health records */}
      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        {/* vaccine (blush) */}
        <RecordCard onPress={openRecords}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <IconChip bg="#FBE0EA">
              <Syringe size={20} color="#D46E97" />
            </IconChip>
            {vaccine ? (
              <>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.ink, marginBottom: 4 }}>
                    {vaccine.name}
                  </Text>
                  <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2' }} numberOfLines={1}>
                    {vaccine.givenDate
                      ? `Given ${shortDate(vaccine.givenDate)}${vaccine.provider ? ` · ${vaccine.provider}` : ''}`
                      : vaccine.provider || 'Vaccine'}
                  </Text>
                </View>
                <View style={{ backgroundColor: '#FBE0EA', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 }}>
                  <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#D46E97' }}>
                    {vaccine.givenDate ? 'Done' : dueLabel(vaccine.dueDate)}
                  </Text>
                </View>
              </>
            ) : (
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.ink, marginBottom: 4 }}>Vaccines</Text>
                <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2' }}>
                  No vaccines tracked yet · Tap to add
                </Text>
              </View>
            )}
          </View>
        </RecordCard>

        {/* medication (mint) */}
        <RecordCard onPress={openRecords}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <IconChip bg="#D8F0E6">
              <Activity size={20} color="#3FA98A" />
            </IconChip>
            {med ? (
              <>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.ink, marginBottom: 4 }} numberOfLines={1}>
                    {[med.name, med.dose].filter(Boolean).join(' · ')}
                  </Text>
                  <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2' }} numberOfLines={1}>
                    {[med.schedule || 'No schedule', med.active ? 'Active' : 'Paused'].join(' · ')}
                  </Text>
                </View>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    backgroundColor: med.active ? '#D8F0E6' : '#EFEDF6',
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={14} color={med.active ? '#3FA98A' : '#9C9AB2'} strokeWidth={2.5} />
                </View>
              </>
            ) : (
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.ink, marginBottom: 4 }}>Medications</Text>
                <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2' }}>
                  No medications tracked yet · Tap to add
                </Text>
              </View>
            )}
          </View>
        </RecordCard>

        {/* growth (butter / gold) */}
        <RecordCard onPress={openRecords}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <IconChip bg="#FBF1CE">
              <Activity size={20} color="#C9A33B" />
            </IconChip>
            {g ? (
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.ink, marginBottom: 6 }}>
                  {typeof g.weightKg === 'number'
                    ? `Weight · ${g.weightKg} kg`
                    : typeof g.heightCm === 'number'
                    ? `Height · ${g.heightCm} cm`
                    : 'Growth logged'}
                </Text>
                {series.length >= 2 ? <Sparkline values={series} /> : null}
                <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2', marginTop: series.length >= 2 ? 5 : 0 }}>
                  {[
                    typeof g.heightCm === 'number' && typeof g.weightKg === 'number' ? `${g.heightCm} cm` : null,
                    shortDate(g.at),
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Latest measurement'}
                </Text>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.ink, marginBottom: 4 }}>Growth</Text>
                <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2' }}>
                  No measurements yet · Tap to add
                </Text>
              </View>
            )}
          </View>
        </RecordCard>

        {/* no children at all → gentle prompt to set one up */}
        {!scopeIds ? (
          <Pressable
            onPress={() => router.push('/(app)/family')}
            style={({ pressed }) => ({ paddingVertical: 10, opacity: pressed ? 0.7 : 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 })}
          >
            <Text style={{ fontFamily: f.body600, fontSize: 12, color: c.primary }}>Add a child to start tracking</Text>
            <ChevronRight size={14} color={c.primary} />
          </Pressable>
        ) : null}
      </View>

      {/* PDF export — premium-gated; styled as the design's periwinkle CTA */}
      <View style={{ paddingTop: 18, paddingHorizontal: 20, paddingBottom: 6 }}>
        <PremiumGate feature="Pediatrician PDF export">
          <Pressable
            onPress={() => {}}
            style={({ pressed }) => [
              {
                backgroundColor: '#6B6FC9',
                paddingVertical: 17,
                paddingHorizontal: 24,
                borderRadius: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                opacity: pressed ? 0.9 : 1,
              },
              shadow.periwinkleButton,
            ]}
          >
            <Svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <Path d="M14 2v6h6" />
              <Path d="M16 13H8M16 17H8M10 9H8" />
            </Svg>
            <Text style={{ fontFamily: f.body800, fontSize: 16, color: '#fff' }}>Generate Pediatrician PDF</Text>
          </Pressable>
          <Text
            style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2', textAlign: 'center', marginTop: 10 }}
          >
            Created on-device · Never uploaded
          </Text>
        </PremiumGate>
      </View>
    </ScrollView>
  );
}

/* Small gold trend line for the growth card. */
function Sparkline({ values }: { values: number[] }) {
  const W = 100;
  const H = 24;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = values.length > 1 ? W / (values.length - 1) : W;
  const pts = values.map((v, i) => {
    const x = i * step;
    const y = H - 4 - ((v - min) / span) * (H - 8);
    return [x, y] as const;
  });
  const line = pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');
  const area = `M${line}L${W} ${H}L0 ${H}Z`;
  const last = pts[pts.length - 1];
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" style={{ marginBottom: 5 }}>
      <Path d={area} fill="#FBF1CE" opacity={0.4} />
      <Polyline
        points={pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
        stroke="#C9A33B"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />
      <Circle cx={last[0]} cy={last[1]} r={3} fill="#C9A33B" />
    </Svg>
  );
}
