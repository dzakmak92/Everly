import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { ChevronLeft } from '../../src/components/icons';
import { useData } from '../../src/lib/store';

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const money = (n: number) => `€${n.toFixed(2)}`;

export default function CoParent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const d = useData();
  const [addCg, setAddCg] = useState(false);
  const [cgName, setCgName] = useState('');
  const [addEx, setAddEx] = useState(false);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('me');
  const [split, setSplit] = useState('50');

  // Parties to cycle custody through: me + caregivers.
  const parties = [{ id: 'me', name: 'You' }, ...d.caregivers];
  const nameOf = (id: string) => (id === 'me' ? 'You' : d.caregivers.find((c) => c.id === id)?.name ?? '—');
  const colorOf = (id: string) => (id === 'me' ? color.primary : color.accentRose);

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
  const net = owedToMe - iOwe;

  function saveCg() { if (cgName.trim()) d.addCaregiver(cgName); setCgName(''); setAddCg(false); }
  function saveEx() {
    const amt = parseFloat(amount);
    if (label.trim() && !isNaN(amt)) d.addExpense({ label, amount: amt, paidBy, splitPct: parseInt(split, 10) || 50 });
    setLabel(''); setAmount(''); setPaidBy('me'); setSplit('50'); setAddEx(false);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}
    >
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
        <ChevronLeft size={24} color={color.ink} />
      </Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Co-Parent</Text>

      {/* Caregivers */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Caregivers</Text>
          <Pressable onPress={() => { setCgName(''); setAddCg(true); }}><Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>+ Add</Text></Pressable>
        </View>
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 6 }, shadow.card]}>
          <Row name="You" tag="Primary" />
          {d.caregivers.map((c) => (
            <Row key={c.id} name={c.name} tag="Co-parent" onDelete={() => d.deleteCaregiver(c.id)} />
          ))}
        </View>
      </View>

      {/* Custody week */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Custody · this week</Text>
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 14, flexDirection: 'row', gap: 6 }, shadow.card]}>
          {WD.map((w, i) => {
            const who = d.custody[i] ?? 'me';
            return (
              <Pressable key={i} onPress={() => cycleDay(i)} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                <Text style={{ fontFamily: font.body600, fontSize: 11, color: color.muted }}>{w}</Text>
                <View style={{ width: '100%', height: 40, borderRadius: 10, backgroundColor: colorOf(who), alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 11, color: '#fff' }}>{nameOf(who).charAt(0)}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>Tap a day to change who has the child.</Text>
      </View>

      {/* Balance */}
      <View style={[{ backgroundColor: net >= 0 ? color.maternalTeal : color.rose, borderRadius: radius.card, padding: 18 }, shadow.card]}>
        <Text style={{ fontFamily: font.body600, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>Running balance</Text>
        <Text style={{ fontFamily: font.display700, fontSize: 24, color: '#fff', marginTop: 2 }}>
          {net === 0 ? 'All settled' : net > 0 ? `You're owed ${money(net)}` : `You owe ${money(-net)}`}
        </Text>
      </View>

      {/* Expenses */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Shared expenses</Text>
          <Pressable onPress={() => { setLabel(''); setAmount(''); setPaidBy('me'); setSplit('50'); setAddEx(true); }}><Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>+ Add</Text></Pressable>
        </View>
        {d.expenses.length === 0 ? (
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, alignItems: 'center' }, shadow.card]}>
            <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>No expenses yet.</Text>
          </View>
        ) : d.expenses.map((e) => {
          const share = (e.amount * e.splitPct) / 100;
          const sub = e.settled ? 'Settled' : e.paidBy === 'me' ? `${d.caregivers.length ? nameOf(d.caregivers[0].id) : 'Co-parent'} owes ${money(share)}` : `You owe ${money(share)}`;
          return (
            <View key={e.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }, shadow.card]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{e.label} · {money(e.amount)}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>Paid by {nameOf(e.paidBy)} · {e.splitPct}% split · {sub}</Text>
              </View>
              <Pressable onPress={() => d.toggleExpenseSettled(e.id)}><Text style={{ fontFamily: font.body700, fontSize: 12, color: e.settled ? color.muted : color.maternalTeal }}>{e.settled ? 'Reopen' : 'Settle'}</Text></Pressable>
              <Pressable onPress={() => d.deleteExpense(e.id)} hitSlop={8} style={{ paddingHorizontal: 4 }}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>
            </View>
          );
        })}
      </View>

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
    </ScrollView>
  );
}

function Row({ name, tag, onDelete }: { name: string; tag: string; onDelete?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, gap: 10 }}>
      <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 15, color: color.ink }}>{name}</Text>
      <Text style={{ fontFamily: font.body500, fontSize: 12, color: color.muted }}>{tag}</Text>
      {onDelete && <Pressable onPress={onDelete} hitSlop={8} style={{ paddingHorizontal: 4 }}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>}
    </View>
  );
}
