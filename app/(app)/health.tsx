import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { color, font, radius, shadow, childToken } from '../../src/theme/tokens';
import { Silhouette } from '../../src/components/ui';
import { Shield, Syringe, Activity, Check, ChevronRight, ChevronLeft } from '../../src/components/icons';
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
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

type Reminder = {
  id: string;
  childId: string;
  childName: string;
  kind: 'vaccine' | 'med';
  title: string;
  sub: string;
  badge: string;
  overdue: boolean;
  sortAt: number; // ms; lower = more urgent
};

/* ── screen ──────────────────────────────────────────────────────────────── */
export default function HealthTab() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { children, vaccines, medications, growth } = useData();
  const [summaryOpen, setSummaryOpen] = useState(false);

  const nameOf = (id: string) => children.find((ch) => ch.id === id)?.name ?? 'Child';

  // Cross-family reminders: un-given vaccines (by due date) + active medications.
  const reminders = useMemo<Reminder[]>(() => {
    const vax: Reminder[] = vaccines
      .filter((v) => !v.givenDate)
      .map((v) => {
        const d = daysUntil(v.dueDate);
        return {
          id: `v-${v.id}`, childId: v.childId, childName: nameOf(v.childId), kind: 'vaccine' as const,
          title: v.name, sub: v.provider || 'Vaccine', badge: dueLabel(v.dueDate),
          overdue: d !== null && d < 0, sortAt: v.dueDate ? new Date(v.dueDate).getTime() : Number.MAX_SAFE_INTEGER,
        };
      });
    const meds: Reminder[] = medications
      .filter((m) => m.active)
      .map((m) => ({
        id: `m-${m.id}`, childId: m.childId, childName: nameOf(m.childId), kind: 'med' as const,
        title: [m.name, m.dose].filter(Boolean).join(' · '), sub: m.schedule || 'Active medication',
        badge: 'Active', overdue: false, sortAt: Number.MAX_SAFE_INTEGER - 1,
      }));
    return [...vax, ...meds].sort((a, b) => (a.overdue === b.overdue ? a.sortAt - b.sortAt : a.overdue ? -1 : 1));
  }, [vaccines, medications, children]);

  const goChild = (id: string) => router.push(`/(app)/child/${id}` as any);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 28, paddingHorizontal: 20, gap: 14 }}
      showsVerticalScrollIndicator={false}
    >
      {/* header */}
      <Pressable onPress={() => router.back()} hitSlop={8} style={{ width: 40, height: 40, justifyContent: 'center' }}>
        <ChevronLeft size={24} color={c.ink} />
      </Pressable>
      <View style={{ paddingHorizontal: 2 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 26, color: c.ink }}>Health</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginTop: 4 }}>
          Reminders across your family
        </Text>
      </View>

      {/* privacy note */}
      <View style={{ backgroundColor: '#E7E4FB', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Shield size={16} color="#6B6FC9" />
        <Text style={{ flex: 1, fontFamily: f.body500, fontSize: 12, lineHeight: 17, color: '#54579E' }}>
          Health data stays on this device. Never shared or uploaded.
        </Text>
      </View>

      {children.length === 0 ? (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 22, gap: 12, alignItems: 'center' }, shadow.card]}>
          <Text style={{ fontFamily: f.body500, fontSize: 14, color: c.muted, textAlign: 'center' }}>
            Add a child to start tracking vaccines, medications and growth.
          </Text>
          <Pressable onPress={() => router.push('/(app)/family')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.primary }}>Go to Family</Text>
            <ChevronRight size={14} color={c.primary} />
          </Pressable>
        </View>
      ) : (
        <>
          {/* Reminders */}
          <Label>Reminders</Label>
          {reminders.length === 0 ? (
            <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 20, alignItems: 'center', gap: 4 }, shadow.card]}>
              <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.ink }}>You're all caught up</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 12.5, color: c.muted, textAlign: 'center' }}>
                No upcoming vaccines or active medications.
              </Text>
            </View>
          ) : (
            <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, overflow: 'hidden' }, shadow.card]}>
              {reminders.map((r, i) => (
                <Pressable
                  key={r.id}
                  onPress={() => goChild(r.childId)}
                  style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.hairline, opacity: pressed ? 0.85 : 1 })}
                >
                  <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: r.kind === 'vaccine' ? '#FBE0EA' : '#D8F0E6', alignItems: 'center', justifyContent: 'center' }}>
                    {r.kind === 'vaccine' ? <Syringe size={19} color="#D46E97" /> : <Activity size={19} color="#3FA98A" />}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.ink }} numberOfLines={1}>{r.title}</Text>
                    <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted, marginTop: 2 }} numberOfLines={1}>{r.childName} · {r.sub}</Text>
                  </View>
                  <View style={{ backgroundColor: r.overdue ? '#FBE0EA' : r.kind === 'med' ? '#D8F0E6' : '#EEEDF8', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 }}>
                    <Text style={{ fontFamily: f.body700, fontSize: 11, color: r.overdue ? '#C0436E' : r.kind === 'med' ? '#3FA98A' : c.primary }}>{r.badge}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {/* Per-child records launchpad */}
          <Label>Records by child</Label>
          <View style={{ gap: 10 }}>
            {children.map((ch) => (
              <ChildRow key={ch.id} child={ch} vaccines={vaccines} meds={medications} growth={growth} onPress={() => goChild(ch.id)} />
            ))}
          </View>

          {/* On-device summary (premium-gated) */}
          <View style={{ paddingTop: 6 }}>
            <PremiumGate feature="Pediatrician summary export">
              <Pressable
                onPress={() => setSummaryOpen(true)}
                style={({ pressed }) => [{ backgroundColor: '#6B6FC9', paddingVertical: 16, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: pressed ? 0.9 : 1 }, shadow.periwinkleButton]}
              >
                <DocIcon />
                <Text style={{ fontFamily: f.body800, fontSize: 16, color: '#fff' }}>Pediatrician summary</Text>
              </Pressable>
              <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted, textAlign: 'center', marginTop: 10 }}>
                Created on-device · Never uploaded
              </Text>
            </PremiumGate>
          </View>
        </>
      )}

      <SummaryModal visible={summaryOpen} onClose={() => setSummaryOpen(false)} children={children} vaccines={vaccines} meds={medications} growth={growth} />
    </ScrollView>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: f.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: c.muted, paddingLeft: 2 }}>{children}</Text>;
}

function ChildRow({ child, vaccines, meds, growth, onPress }: { child: Child; vaccines: Vaccine[]; meds: Medication[]; growth: Growth[]; onPress: () => void }) {
  const t = childToken[child.color];
  const due = vaccines.filter((v) => v.childId === child.id && !v.givenDate).length;
  const activeMeds = meds.filter((m) => m.childId === child.id && m.active).length;
  const g = [...growth].filter((x) => x.childId === child.id).sort((a, b) => b.at.localeCompare(a.at))[0];
  const bits = [
    due > 0 ? `${due} vaccine${due > 1 ? 's' : ''} due` : null,
    activeMeds > 0 ? `${activeMeds} med${activeMeds > 1 ? 's' : ''}` : null,
    g ? `grew ${shortDate(g.at)}` : null,
  ].filter(Boolean);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ backgroundColor: '#fff', borderRadius: radius.card, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.9 : 1 }, shadow.card]}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.fill, alignItems: 'center', justifyContent: 'center' }}>
        <Silhouette size={24} fill={t.stroke} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 16, color: c.ink }}>{child.name}</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 12.5, color: c.muted, marginTop: 2 }}>{bits.length ? bits.join(' · ') : 'No records yet'}</Text>
      </View>
      <ChevronRight size={18} color={c.faint} />
    </Pressable>
  );
}

function DocIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </Svg>
  );
}

/* On-device summary: real, shareable health record (print → PDF on web). */
function SummaryModal({ visible, onClose, children, vaccines, meds, growth }: { visible: boolean; onClose: () => void; children: Child[]; vaccines: Vaccine[]; meds: Medication[]; growth: Growth[] }) {
  const canPrint = typeof window !== 'undefined' && typeof (window as any).print === 'function';
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.4)', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 12, maxHeight: '80%' }, shadow.card]}>
          <Text style={{ fontFamily: f.display700, fontSize: 18, color: c.ink }}>Health summary</Text>
          <ScrollView style={{ maxHeight: 380 }}>
            <View style={{ gap: 16 }}>
              {children.map((ch) => {
                const cv = vaccines.filter((v) => v.childId === ch.id);
                const cm = meds.filter((m) => m.childId === ch.id);
                const cg = [...growth].filter((x) => x.childId === ch.id).sort((a, b) => b.at.localeCompare(a.at));
                return (
                  <View key={ch.id} style={{ gap: 6 }}>
                    <Text style={{ fontFamily: f.display700, fontSize: 15, color: c.ink }}>{ch.name}</Text>
                    <SummaryLine label="Vaccines" items={cv.map((v) => `${v.name} — ${v.givenDate ? `given ${shortDate(v.givenDate)}` : `due ${dueLabel(v.dueDate)}`}`)} />
                    <SummaryLine label="Medications" items={cm.map((m) => `${[m.name, m.dose].filter(Boolean).join(' ')}${m.schedule ? ` (${m.schedule})` : ''}${m.active ? '' : ' — paused'}`)} />
                    <SummaryLine label="Growth" items={cg.slice(0, 5).map((g) => `${shortDate(g.at)}: ${[g.weightKg && `${g.weightKg}kg`, g.heightCm && `${g.heightCm}cm`].filter(Boolean).join(', ') || '—'}`)} />
                  </View>
                );
              })}
            </View>
          </ScrollView>
          {canPrint ? (
            <Pressable onPress={() => (window as any).print()} style={{ backgroundColor: c.primary, paddingVertical: 13, borderRadius: radius.tile, alignItems: 'center' }}>
              <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#fff' }}>Print / Save as PDF</Text>
            </Pressable>
          ) : (
            <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted, textAlign: 'center' }}>Screenshot this to share with your pediatrician.</Text>
          )}
          <Pressable onPress={onClose} style={{ paddingVertical: 10, alignItems: 'center' }}>
            <Text style={{ fontFamily: f.body600, fontSize: 13, color: c.muted }}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SummaryLine({ label, items }: { label: string; items: string[] }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={{ fontFamily: f.body700, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: c.muted }}>{label}</Text>
      {items.length === 0 ? (
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.faint }}>None recorded</Text>
      ) : items.map((it, i) => (
        <Text key={i} style={{ fontFamily: f.body400, fontSize: 13, color: c.inkSecondary, lineHeight: 18 }}>• {it}</Text>
      ))}
    </View>
  );
}
