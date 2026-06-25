import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { ChevronLeft, Check } from '../../src/components/icons';
import { useData } from '../../src/lib/store';

export default function Routines() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const d = useData();
  const [modal, setModal] = useState<null | 'chore' | 'routine' | { stepFor: string }>(null);
  const [label, setLabel] = useState('');
  const [points, setPoints] = useState('10');

  const balance = d.chores.filter((c) => c.done).reduce((s, c) => s + c.points, 0);

  function save() {
    if (modal === 'chore') { if (label.trim()) d.addChore({ label, points: parseInt(points, 10) || 0, childId: d.activeChild?.id }); }
    else if (modal === 'routine') { if (label.trim()) d.addRoutine({ name: label, childId: d.activeChild?.id }); }
    else if (modal && 'stepFor' in modal) { if (label.trim()) d.addRoutineStep(modal.stepFor, label); }
    setLabel(''); setPoints('10'); setModal(null);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}
    >
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
        <ChevronLeft size={24} color={color.ink} />
      </Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Routines & Chores</Text>

      {/* Points balance */}
      <View style={[{ backgroundColor: color.primary, borderRadius: radius.card, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, shadow.card]}>
        <View>
          <Text style={{ fontFamily: font.body600, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>Points earned</Text>
          <Text style={{ fontFamily: font.display700, fontSize: 30, color: '#fff' }}>{balance} pts</Text>
        </View>
        <Text style={{ fontFamily: font.body500, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{d.chores.filter((c) => c.done).length}/{d.chores.length} done</Text>
      </View>

      {/* Chores */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Chores</Text>
          <Pressable onPress={() => { setLabel(''); setPoints('10'); setModal('chore'); }}><Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>+ Add</Text></Pressable>
        </View>
        {d.chores.length === 0 ? <Empty text="No chores yet." /> : d.chores.map((c) => (
          <View key={c.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
            <Pressable onPress={() => d.toggleChore(c.id)} style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: c.done ? color.maternalTeal : color.faint, backgroundColor: c.done ? color.maternalTeal : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {c.done && <Check size={14} color="#fff" />}
            </Pressable>
            <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 14, color: color.ink, textDecorationLine: c.done ? 'line-through' : 'none' }}>{c.label}</Text>
            <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.gold }}>+{c.points}</Text>
            <Pressable onPress={() => d.deleteChore(c.id)} hitSlop={8} style={{ paddingHorizontal: 4 }}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>
          </View>
        ))}
      </View>

      {/* Routines */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Routines</Text>
          <Pressable onPress={() => { setLabel(''); setModal('routine'); }}><Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>+ Add</Text></Pressable>
        </View>
        {d.routines.length === 0 ? <Empty text="No routines yet." /> : d.routines.map((r) => {
          const done = r.steps.filter((s) => s.done).length;
          return (
            <View key={r.id} style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, gap: 10 }, shadow.card]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: font.display700, fontSize: 16, color: color.ink }}>{r.name}</Text>
                <Text style={{ fontFamily: font.body500, fontSize: 12, color: color.muted }}>{done}/{r.steps.length}</Text>
              </View>
              {r.steps.map((s) => (
                <Pressable key={s.id} onPress={() => d.toggleStep(r.id, s.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: s.done ? color.primary : color.faint, backgroundColor: s.done ? color.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    {s.done && <Check size={12} color="#fff" />}
                  </View>
                  <Text style={{ flex: 1, fontFamily: font.body500, fontSize: 14, color: color.ink, textDecorationLine: s.done ? 'line-through' : 'none' }}>{s.label}</Text>
                </Pressable>
              ))}
              <View style={{ flexDirection: 'row', gap: 14, marginTop: 2 }}>
                <Pressable onPress={() => { setLabel(''); setModal({ stepFor: r.id }); }}><Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>+ Step</Text></Pressable>
                <Pressable onPress={() => d.resetRoutine(r.id)}><Text style={{ fontFamily: font.body700, fontSize: 13, color: color.muted }}>Reset</Text></Pressable>
                <Pressable onPress={() => d.deleteRoutine(r.id)}><Text style={{ fontFamily: font.body700, fontSize: 13, color: color.roseInk }}>Delete</Text></Pressable>
              </View>
            </View>
          );
        })}
      </View>

      <Modal visible={modal !== null} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <Pressable onPress={() => setModal(null)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>
              {modal === 'chore' ? 'New chore' : modal === 'routine' ? 'New routine' : 'New step'}
            </Text>
            <Field label={modal === 'chore' ? 'Chore' : modal === 'routine' ? 'Routine name' : 'Step'} value={label} onChangeText={setLabel} placeholder={modal === 'routine' ? 'e.g. Morning' : 'e.g. Brush teeth'} autoCapitalize="sentences" />
            {modal === 'chore' && <Field label="Points" value={points} onChangeText={setPoints} placeholder="10" />}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setModal(null)} style={{ flex: 1 }} />
              <Button label="Save" onPress={save} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, alignItems: 'center' }, shadow.card]}>
      <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>{text}</Text>
    </View>
  );
}
