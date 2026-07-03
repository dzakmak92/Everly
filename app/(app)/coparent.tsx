import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { ChevronLeft, Shield, Info, Check } from '../../src/components/icons';
import { Silhouette } from '../../src/components/ui';
import { useData } from '../../src/lib/store';
import { useFeedback } from '../../src/components/Feedback';

const WD = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WD_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const money = (n: number) => `€${Number.isInteger(n) ? n : n.toFixed(2)}`;

// Pastel tokens reused for the two parties.
const MINT = '#D8F0E6';
const MINT_INK = '#3FA98A';
const PEACH = '#FCE6D8';
const PEACH_INK = '#D9824F';

export default function CoParent({ embedded }: { embedded?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const d = useData();
  const { toast } = useFeedback();
  const [addCg, setAddCg] = useState(false);
  const [cgName, setCgName] = useState('');
  const [addEx, setAddEx] = useState(false);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('me');
  const [split, setSplit] = useState('50');
  const [confirmRemove, setConfirmRemove] = useState<{ id: string; name: string } | null>(null);

  // Parties to cycle custody through: me + caregivers.
  const parties = [{ id: 'me', name: 'You' }, ...d.caregivers];
  const nameOf = (id: string) => (id === 'me' ? 'You' : d.caregivers.find((c) => c.id === id)?.name ?? '—');
  const isMine = (id: string) => id === 'me';

  // The "other parent" shown in the summary card / captions.
  const otherParent = d.caregivers[0] ?? null;
  const otherName = otherParent?.name ?? 'Co-parent';
  const childName = d.activeChild?.name ?? 'Child';

  function cycleDay(wd: number) {
    const cur = d.custody[wd] ?? 'me';
    const idx = parties.findIndex((p) => p.id === cur);
    const nextWho = parties[(idx + 1) % parties.length].id;
    d.setCustodyDay(wd, nextWho);
  }

  // Balance: split% is the other party's share of each unsettled expense.
  let owedToMe = 0, iOwe = 0;
  for (const e of d.expenses) {
    if (e.settled) continue;
    const share = (e.amount * e.splitPct) / 100;
    if (e.paidBy === 'me') owedToMe += share; else iOwe += share;
  }
  const net = owedToMe - iOwe; // >0 → other owes you; <0 → you owe other.
  const settleAmount = Math.abs(net);
  const hasUnsettled = d.expenses.some((e) => !e.settled);

  // Summary line, robust for 0 and 1 co-parent (the common cases).
  let balanceLabel: string;
  if (!hasUnsettled || settleAmount === 0) {
    balanceLabel = 'All settled';
  } else if (!otherParent) {
    // No co-parent on record — can't attribute the balance to a named person.
    balanceLabel = net > 0 ? `Owed to you ${money(net)}` : `You owe ${money(-net)}`;
  } else {
    balanceLabel = net > 0 ? `${otherName} owes ${money(net)}` : `You owe ${money(-net)}`;
  }

  // Gauge split — proportion of the "you paid" side vs the "other owes" side.
  const gaugeTotal = owedToMe + iOwe;
  const youPct = gaugeTotal > 0 ? (owedToMe / gaugeTotal) * 100 : 50;

  function saveCg() { if (cgName.trim()) { d.addCaregiver(cgName); toast('Caregiver added'); } setCgName(''); setAddCg(false); }
  function saveEx() {
    const amt = parseFloat(amount);
    if (label.trim() && !isNaN(amt)) { d.addExpense({ label, amount: amt, paidBy, splitPct: parseInt(split, 10) || 50 }); toast('Expense added'); }
    setLabel(''); setAmount(''); setPaidBy('me'); setSplit('50'); setAddEx(false);
  }
  function settleUp() {
    // Settle every unsettled expense, clearing the running balance.
    for (const e of d.expenses) if (!e.settled) d.toggleExpenseSettled(e.id);
  }

  // Build the 7-day custody strip starting today.
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const wd = date.getDay();
    const who = d.custody[wd] ?? 'me';
    const weekend = wd === 0 || wd === 6;
    return { wd, dayOfMonth: date.getDate(), letter: WD[wd], who, weekend };
  });
  const monthLabel = MONTHS[today.getMonth()];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: embedded ? 4 : insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 20, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {!embedded && (
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center', marginLeft: -6 }}>
          <ChevronLeft size={24} color={color.ink} />
        </Pressable>
      )}

      {/* Title + child-context pill */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: font.display700, fontSize: 22, color: color.ink }}>Co-parent</Text>
        {d.activeChild && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: MINT,
              borderRadius: radius.pill,
              paddingVertical: 5,
              paddingRight: 12,
              paddingLeft: 5,
            }}
          >
            <View style={{ width: 22, height: 22, backgroundColor: MINT_INK, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
              <Silhouette size={11} fill="#fff" />
            </View>
            <Text style={{ fontFamily: font.body700, fontSize: 12, color: MINT_INK }}>{childName}</Text>
          </View>
        )}
      </View>

      {/* Parent summary card */}
      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, shadow.card]}>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <View style={{ width: 56, height: 56, backgroundColor: MINT, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}>
            <Silhouette size={28} fill={MINT_INK} />
          </View>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: MINT_INK }}>You</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 10, color: color.muted }}>Primary</Text>
        </View>

        <View style={{ flex: 1, alignItems: 'center', gap: 8, paddingHorizontal: 6 }}>
          <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted }}>this week</Text>
          <View style={{ width: 1, height: 26, backgroundColor: color.hairline }} />
          <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.inkSecondary, textAlign: 'center' }}>{childName} stays:</Text>
        </View>

        <Pressable
          onPress={otherParent ? () => setConfirmRemove({ id: otherParent.id, name: otherParent.name }) : () => { setCgName(''); setAddCg(true); }}
          style={{ alignItems: 'center', gap: 6 }}
        >
          <View style={{ width: 56, height: 56, backgroundColor: PEACH, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}>
            <Silhouette size={28} fill={PEACH_INK} />
          </View>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: PEACH_INK }}>{otherName}</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 10, color: color.muted }}>{otherParent ? 'Tap to remove' : 'Tap to add'}</Text>
        </Pressable>
      </View>

      {/* Custody strip */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: color.muted, paddingLeft: 4 }}>
          {monthLabel} custody
        </Text>
        <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted, paddingLeft: 4, marginTop: -4 }}>
          Tap a day to change who has {childName}.
        </Text>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {days.map((day, i) => {
            const mine = isMine(day.who);
            const bg = mine ? MINT : PEACH;
            const fg = mine ? MINT_INK : PEACH_INK;
            return (
              <Pressable
                key={i}
                onPress={() => cycleDay(day.wd)}
                style={{
                  flex: 1,
                  backgroundColor: bg,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 2,
                  alignItems: 'center',
                  gap: 4,
                  opacity: day.weekend ? 0.55 : 1,
                }}
              >
                <Text style={{ fontFamily: font.body700, fontSize: 10, color: fg }}>{day.letter}</Text>
                <Text style={{ fontFamily: font.body600, fontSize: 12, color: fg }}>{day.dayOfMonth}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Expenses */}
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 4 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: color.muted }}>Expenses</Text>
          <Pressable onPress={() => { setLabel(''); setAmount(''); setPaidBy('me'); setSplit('50'); setAddEx(true); }}>
            <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>+ Add</Text>
          </Pressable>
        </View>

        {d.expenses.length === 0 ? (
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, alignItems: 'center' }, shadow.card]}>
            <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>No shared expenses yet.</Text>
          </View>
        ) : (
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, overflow: 'hidden' }, shadow.card]}>
            {d.expenses.map((e, idx) => {
              const share = (e.amount * e.splitPct) / 100;
              const dateLabel = new Date(e.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              const sub = `${e.splitPct}/${100 - e.splitPct} split · ${dateLabel}`;
              const owerName = e.paidBy === 'me' ? otherName : 'You';
              return (
                <View key={e.id}>
                  {idx > 0 && <View style={{ height: 1, backgroundColor: color.hairline, marginHorizontal: 16 }} />}
                  <View style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 40, height: 40, backgroundColor: e.settled ? MINT : '#FBE0EA', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                      {e.settled ? <Info size={18} color={MINT_INK} /> : <Shield size={18} color={color.rose} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{e.label} · {money(e.amount)}</Text>
                      <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted, marginTop: 2 }}>{sub}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 8 }}>
                      <Pressable onPress={() => d.toggleExpenseSettled(e.id)}>
                        {e.settled ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: MINT, borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: 10 }}>
                            <Text style={{ fontFamily: font.body700, fontSize: 11, color: MINT_INK }}>Settled</Text>
                            <Check size={10} color={MINT_INK} />
                          </View>
                        ) : (
                          <View style={{ backgroundColor: '#FBE0EA', borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: 10 }}>
                            <Text style={{ fontFamily: font.body700, fontSize: 11, color: color.rose }}>{owerName} owes {money(share)}</Text>
                          </View>
                        )}
                      </Pressable>
                      <Pressable onPress={() => d.deleteExpense(e.id)} hitSlop={8}>
                        <Text style={{ fontFamily: font.body700, fontSize: 11, color: color.faint }}>Remove</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Running balance */}
      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18 }, shadow.card]}>
        <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink, marginBottom: 12 }}>Running balance</Text>
        <View style={{ height: 10, borderRadius: radius.pill, overflow: 'hidden', flexDirection: 'row', marginBottom: 10, backgroundColor: PEACH }}>
          <View style={{ width: `${youPct}%`, backgroundColor: MINT }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: font.body400, fontSize: 11, color: MINT_INK }}>You paid {money(owedToMe)}</Text>
          <Text style={{ fontFamily: font.body700, fontSize: 11, color: PEACH_INK }}>
            {balanceLabel}
          </Text>
        </View>
      </View>

      {/* Settle Up CTA */}
      <Pressable
        onPress={settleUp}
        disabled={!hasUnsettled}
        style={[
          {
            backgroundColor: color.primary,
            paddingVertical: 16,
            paddingHorizontal: 16,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: !hasUnsettled ? 0.5 : 1,
          },
          shadow.periwinkleButton,
        ]}
      >
        <Text style={{ fontFamily: font.body800, fontSize: 15, color: '#fff' }}>
          {!hasUnsettled ? 'All settled' : settleAmount === 0 ? 'Settle Up' : `Settle Up · ${money(settleAmount)}`}
        </Text>
      </Pressable>

      {/* Add co-parent affordance */}
      <Pressable onPress={() => { setCgName(''); setAddCg(true); }} style={{ alignItems: 'center', paddingVertical: 4 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>+ Add co-parent</Text>
      </Pressable>

      {/* Add caregiver modal */}
      <Modal visible={addCg} transparent animationType="fade" onRequestClose={() => setAddCg(false)}>
        <Pressable onPress={() => setAddCg(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Add co-parent</Text>
            <Field label="Name" value={cgName} onChangeText={setCgName} placeholder="e.g. Sam" autoCapitalize="words" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setAddCg(false)} style={{ flex: 1 }} />
              <Button label="Add" onPress={saveCg} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add expense modal */}
      <Modal visible={addEx} transparent animationType="fade" onRequestClose={() => setAddEx(false)}>
        <Pressable onPress={() => setAddEx(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>New expense</Text>
            <Field label="What for" value={label} onChangeText={setLabel} placeholder="e.g. Doctor visit" autoCapitalize="sentences" />
            <Field label="Amount (€)" value={amount} onChangeText={setAmount} placeholder="90" />
            <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: color.muted }}>Paid by</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {parties.map((p) => {
                const sel = p.id === paidBy;
                return (
                  <Pressable key={p.id} onPress={() => setPaidBy(p.id)} style={{ paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.tile, backgroundColor: sel ? color.primary : '#fff', borderWidth: 1, borderColor: sel ? color.primary : color.hairline }}>
                    <Text style={{ fontFamily: font.body600, fontSize: 13, color: sel ? '#fff' : color.ink }}>{p.name}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Field label="Other party's share (%)" value={split} onChangeText={setSplit} placeholder="50" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setAddEx(false)} style={{ flex: 1 }} />
              <Button label="Add" onPress={saveEx} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Confirm remove co-parent modal */}
      <Modal visible={confirmRemove !== null} transparent animationType="fade" onRequestClose={() => setConfirmRemove(null)}>
        <Pressable onPress={() => setConfirmRemove(null)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Remove {confirmRemove?.name ?? 'co-parent'}?</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted, lineHeight: 19 }}>
              This also removes their custody days. This can't be undone.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setConfirmRemove(null)} style={{ flex: 1 }} />
              <Button label="Remove" onPress={() => { if (confirmRemove) { d.deleteCaregiver(confirmRemove.id); toast('Removed'); } setConfirmRemove(null); }} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
