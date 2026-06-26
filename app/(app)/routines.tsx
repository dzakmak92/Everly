import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, childToken } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { ChevronLeft, Check, Star, Plus } from '../../src/components/icons';
import { Silhouette } from '../../src/components/ui';
import { useData } from '../../src/lib/store';
import type { Routine } from '../../src/lib/store';
import { ageLabel } from '../../src/lib/age';

type Tab = 'morning' | 'evening' | 'chores';

/** Pastel chip palette cycled across routine-step tiles (no icon field in data). */
const TILE_TOKENS = [
  childToken.butter,
  childToken.sky,
  childToken.lilac,
  childToken.blush,
  childToken.mint,
  childToken.peach,
  childToken.sage,
];

export default function Routines() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const d = useData();
  const [tab, setTab] = useState<Tab>('morning');
  const [modal, setModal] = useState<null | 'chore' | 'routine' | { stepFor: string }>(null);
  const [label, setLabel] = useState('');
  const [points, setPoints] = useState('10');
  const [confirmRedeem, setConfirmRedeem] = useState(false);

  const childId = d.activeChild?.id;
  // Scope to the active child when one is selected; otherwise show all.
  const routines = childId ? d.routines.filter((r) => r.childId === childId) : d.routines;
  const chores = childId ? d.chores.filter((c) => c.childId === childId) : d.chores;

  const doneChores = chores.filter((c) => c.done);
  const balance = doneChores.reduce((s, c) => s + c.points, 0);
  const earned = (balance * 0.1).toFixed(2); // simple on-device conversion (€0.10 / pt)

  function redeem() {
    doneChores.forEach((c) => d.toggleChore(c.id));
    setConfirmRedeem(false);
  }

  const childName = d.activeChild?.name ?? null;
  const age = d.activeChild?.birthDate ? ageLabel(d.activeChild.birthDate) : null;

  // Tab → matching routine by name keyword. The first match wins.
  const period = tab === 'morning' ? 'morning' : 'evening';
  const periodRoutine: Routine | undefined =
    tab !== 'chores'
      ? routines.find((r) => r.name.toLowerCase().includes(period))
      : undefined;

  function openAdd() {
    setLabel('');
    setPoints('10');
    if (tab === 'chores') {
      setModal('chore');
    } else if (periodRoutine) {
      setModal({ stepFor: periodRoutine.id });
    } else {
      // No routine for this period yet → seed one named after the tab.
      setLabel(period === 'morning' ? 'Morning' : 'Evening');
      setModal('routine');
    }
  }

  function save() {
    if (modal === 'chore') {
      if (label.trim()) d.addChore({ label, points: parseInt(points, 10) || 0, childId });
    } else if (modal === 'routine') {
      if (label.trim()) d.addRoutine({ name: label, childId });
    } else if (modal && 'stepFor' in modal) {
      if (label.trim()) d.addRoutineStep(modal.stepFor, label);
    }
    setLabel('');
    setPoints('10');
    setModal(null);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: insets.bottom + 28 }}
    >
      {/* back chevron (preserved) */}
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        style={{ width: 40, height: 40, justifyContent: 'center', marginLeft: 18 }}
      >
        <ChevronLeft size={24} color={color.ink} />
      </Pressable>

      {/* title row + child pill */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 2,
          paddingBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontFamily: font.display700, fontSize: 20, color: color.ink }}>Routines</Text>
        {childName ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#E7E4FB',
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
                backgroundColor: color.primary,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <Silhouette size={13} fill="#fff" />
            </View>
            <Text style={{ fontFamily: font.body700, fontSize: 11, color: color.primary }}>
              {childName}
              {age != null ? ` · ${age}` : ''}
            </Text>
          </View>
        ) : null}
      </View>

      {/* segmented selector */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', gap: 8 }}>
        <TabPill label="Morning" active={tab === 'morning'} onPress={() => setTab('morning')} />
        <TabPill label="Evening" active={tab === 'evening'} onPress={() => setTab('evening')} />
        <TabPill label="Chores" active={tab === 'chores'} onPress={() => setTab('chores')} />
      </View>

      {/* content */}
      {tab === 'chores' ? (
        <ChoresSection
          chores={chores}
          onToggle={d.toggleChore}
          onDelete={d.deleteChore}
          onAdd={openAdd}
        />
      ) : (
        <RoutineSection
          routine={periodRoutine}
          period={period}
          onToggleStep={d.toggleStep}
          onAdd={openAdd}
          onReset={periodRoutine ? () => d.resetRoutine(periodRoutine.id) : undefined}
          onDelete={periodRoutine ? () => d.deleteRoutine(periodRoutine.id) : undefined}
        />
      )}

      {/* points balance */}
      <View
        style={[
          {
            marginTop: 8,
            marginHorizontal: 20,
            backgroundColor: '#fff',
            borderRadius: radius.cardSm,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          },
          shadow.card,
        ]}
      >
        <View
          style={{
            width: 44,
            height: 44,
            backgroundColor: childToken.butter.fill,
            borderRadius: 13,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Star size={22} color={color.sparkleGold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>
            {childName ? `${childName}'s Balance` : 'Balance'}
          </Text>
          <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 3 }}>
            {balance} pts · €{earned} earned
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: color.primary,
              borderRadius: radius.pill,
              paddingVertical: 10,
              paddingHorizontal: 18,
              opacity: doneChores.length === 0 ? 0.5 : pressed ? 0.85 : 1,
            },
            shadow.periwinkleButton,
          ]}
          disabled={doneChores.length === 0}
          onPress={() => setConfirmRedeem(true)}
        >
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: '#fff' }}>Redeem</Text>
        </Pressable>
      </View>

      <Modal visible={modal !== null} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <Pressable
          onPress={() => setModal(null)}
          style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}
        >
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>
              {modal === 'chore' ? 'New chore' : modal === 'routine' ? 'New routine' : 'New step'}
            </Text>
            <Field
              label={modal === 'chore' ? 'Chore' : modal === 'routine' ? 'Routine name' : 'Step'}
              value={label}
              onChangeText={setLabel}
              placeholder={modal === 'routine' ? 'e.g. Morning' : 'e.g. Brush teeth'}
              autoCapitalize="sentences"
            />
            {modal === 'chore' && <Field label="Points" value={points} onChangeText={setPoints} placeholder="10" keyboardType="default" />}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setModal(null)} style={{ flex: 1 }} />
              <Button label="Save" onPress={save} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Confirm redeem modal */}
      <Modal visible={confirmRedeem} transparent animationType="fade" onRequestClose={() => setConfirmRedeem(false)}>
        <Pressable
          onPress={() => setConfirmRedeem(false)}
          style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}
        >
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>
              Redeem {balance} {balance === 1 ? 'point' : 'points'}?
            </Text>
            <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted, lineHeight: 19 }}>
              This clears the {doneChores.length} completed {doneChores.length === 1 ? 'chore' : 'chores'} and resets the balance.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setConfirmRedeem(false)} style={{ flex: 1 }} />
              <Button label="Redeem" onPress={redeem} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

/* ── segmented tab pill ──────────────────────────────────────────────────── */
function TabPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: active ? color.primary : '#fff',
          borderRadius: radius.pill,
          paddingVertical: 9,
          paddingHorizontal: 18,
          borderWidth: active ? 0 : 1,
          borderColor: color.hairline,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <Text style={{ fontFamily: active ? font.body700 : font.body600, fontSize: 12, color: active ? '#fff' : color.inkSecondary }}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ── Morning / Evening: 2-column grid of picture-step tiles ──────────────── */
function RoutineSection({
  routine,
  period,
  onToggleStep,
  onAdd,
  onReset,
  onDelete,
}: {
  routine: Routine | undefined;
  period: string;
  onToggleStep: (routineId: string, stepId: string) => void;
  onAdd: () => void;
  onReset?: () => void;
  onDelete?: () => void;
}) {
  const steps = routine?.steps ?? [];
  return (
    <View style={{ paddingHorizontal: 20 }}>
      {steps.length === 0 ? (
        <Empty text={`No ${period} steps yet.`} action="Add step" onAction={onAdd} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {steps.map((s, i) => {
              const tok = TILE_TOKENS[i % TILE_TOKENS.length];
              return (
                <Pressable
                  key={s.id}
                  onPress={() => routine && onToggleStep(routine.id, s.id)}
                  style={({ pressed }) => [
                    {
                      width: '47.5%',
                      flexGrow: 1,
                      backgroundColor: '#fff',
                      borderRadius: radius.cardSm,
                      padding: 16,
                      flexDirection: 'row',
                      gap: 12,
                      alignItems: 'center',
                      opacity: pressed ? 0.9 : 1,
                    },
                    shadow.card,
                  ]}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: tok.fill,
                      borderRadius: 13,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Star size={20} color={tok.stroke} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      numberOfLines={2}
                      style={{
                        fontFamily: font.body700,
                        fontSize: 13,
                        color: color.ink,
                        textDecorationLine: s.done ? 'line-through' : 'none',
                      }}
                    >
                      {s.label}
                    </Text>
                  </View>
                  {s.done ? (
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        backgroundColor: '#D8F0E6',
                        borderRadius: 11,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={11} color={color.maternalTeal} />
                    </View>
                  ) : (
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        backgroundColor: '#F4F3FB',
                        borderRadius: 11,
                        borderWidth: 1.5,
                        borderColor: color.hairline,
                      }}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* actions row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 14, paddingHorizontal: 4 }}>
            <Pressable onPress={onAdd} hitSlop={6}>
              <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>+ Step</Text>
            </Pressable>
            {onReset && (
              <Pressable onPress={onReset} hitSlop={6}>
                <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.muted }}>Reset</Text>
              </Pressable>
            )}
            {onDelete && (
              <Pressable onPress={onDelete} hitSlop={6}>
                <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.roseInk }}>Delete</Text>
              </Pressable>
            )}
          </View>
        </>
      )}
    </View>
  );
}

/* ── Chores: single white card with hairline-divided rows ─────────────────── */
function ChoresSection({
  chores,
  onToggle,
  onDelete,
  onAdd,
}: {
  chores: { id: string; label: string; points: number; done: boolean }[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 4 }}>
        <Text
          style={{
            fontFamily: font.body700,
            fontSize: 11,
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            color: color.muted,
          }}
        >
          Chores today
        </Text>
        <Pressable onPress={onAdd} hitSlop={6}>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>+ Add</Text>
        </Pressable>
      </View>

      {chores.length === 0 ? (
        <Empty text="No chores yet." action="Add chore" onAction={onAdd} />
      ) : (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, overflow: 'hidden' }, shadow.card]}>
          {chores.map((c, i) => {
            const tok = TILE_TOKENS[i % TILE_TOKENS.length];
            return (
              <View
                key={c.id}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: 'rgba(51,50,74,0.05)',
                }}
              >
                <Pressable
                  onPress={() => onToggle(c.id)}
                  hitSlop={6}
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: tok.fill,
                    borderRadius: 11,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {c.done ? <Check size={16} color={tok.stroke} /> : <Star size={16} color={tok.stroke} />}
                </Pressable>
                <Pressable onPress={() => onToggle(c.id)} style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: font.body700,
                      fontSize: 13,
                      color: color.ink,
                      textDecorationLine: c.done ? 'line-through' : 'none',
                    }}
                  >
                    {c.label}
                  </Text>
                </Pressable>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Star size={12} color={color.sparkleGold} />
                  <Text style={{ fontFamily: font.body700, fontSize: 11, color: color.muted }}>+{c.points}</Text>
                </View>
                {c.done ? (
                  <View style={{ backgroundColor: '#D8F0E6', borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 10, marginLeft: 4 }}>
                    <Text style={{ fontFamily: font.body700, fontSize: 10, color: color.maternalTeal }}>Done</Text>
                  </View>
                ) : (
                  <View
                    style={{
                      backgroundColor: '#F4F3FB',
                      borderRadius: radius.pill,
                      paddingVertical: 4,
                      paddingHorizontal: 10,
                      marginLeft: 4,
                      borderWidth: 1,
                      borderColor: color.hairline,
                    }}
                  >
                    <Text style={{ fontFamily: font.body700, fontSize: 10, color: color.muted }}>To do</Text>
                  </View>
                )}
                <Pressable onPress={() => onDelete(c.id)} hitSlop={8} style={{ paddingLeft: 2 }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 16, color: color.faint }}>×</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

/* ── empty state ─────────────────────────────────────────────────────────── */
function Empty({ text, action, onAction }: { text: string; action?: string; onAction?: () => void }) {
  return (
    <View style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 22, alignItems: 'center', gap: 12 }, shadow.card]}>
      <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>{text}</Text>
      {action && onAction && (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: color.primary,
              borderRadius: radius.pill,
              paddingVertical: 9,
              paddingHorizontal: 16,
              opacity: pressed ? 0.85 : 1,
            },
            shadow.periwinkleButton,
          ]}
        >
          <Plus size={14} color="#fff" strokeWidth={2.5} />
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: '#fff' }}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}
