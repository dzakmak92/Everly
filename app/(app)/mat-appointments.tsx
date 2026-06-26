import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { ChevronLeft } from '../../src/components/icons';
import { useData } from '../../src/lib/store';

const dayLabel = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const daysTo = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
const SEED = [
  { title: 'Midwife discharge', kind: 'check' as const, off: 5 },
  { title: 'Health visitor assessment', kind: 'check' as const, off: 14 },
  { title: '6-week GP check', kind: 'appointment' as const, off: 42, prep: 'Contraception, mental health, physical recovery, return to work' },
];

export default function MatAppointments() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { matAppts, addMatAppt, deleteMatAppt, maternalBirth } = useData();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [kind, setKind] = useState<'appointment' | 'check'>('appointment');
  const [prep, setPrep] = useState('');

  function seed() {
    const birth = maternalBirth ? new Date(`${maternalBirth}T00:00:00`) : new Date();
    SEED.forEach((s) => { const at = new Date(birth.getTime() + s.off * 86400000).toISOString(); addMatAppt({ title: s.title, at, kind: s.kind, prep: s.prep }); });
  }
  function save() {
    if (title.trim() && date.trim()) addMatAppt({ title, at: `${date}T10:00:00`, kind, prep });
    setTitle(''); setDate(''); setPrep(''); setKind('appointment'); setOpen(false);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
        <Pressable onPress={() => setOpen(true)}><Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>+ Add</Text></Pressable>
      </View>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Your appointments</Text>

      {matAppts.length === 0 ? (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, gap: 12 }, shadow.card]}>
          <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.inkSecondary }}>Seed the standard postpartum schedule from your birth date, or add your own.</Text>
          <Button label="Load standard schedule" variant="secondary" onPress={seed} />
        </View>
      ) : matAppts.map((a) => {
        const d = daysTo(a.at);
        return (
          <View key={a.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, gap: 6 }, shadow.card]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{a.title}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>{dayLabel(a.at)}{d >= 0 ? ` · in ${d} day${d === 1 ? '' : 's'}` : ' · past'}</Text>
              </View>
              <Pressable onPress={() => deleteMatAppt(a.id)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>
            </View>
            {a.prep && <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.inkSecondary, backgroundColor: color.canvas, borderRadius: radius.tile, padding: 10 }}>Prep: {a.prep}</Text>}
          </View>
        );
      })}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Add</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['appointment', 'check'] as const).map((k) => (
                <Pressable key={k} onPress={() => setKind(k)} style={{ flex: 1, paddingVertical: 10, borderRadius: radius.tile, alignItems: 'center', backgroundColor: kind === k ? color.primary : '#fff', borderWidth: 1, borderColor: kind === k ? color.primary : color.hairline }}>
                  <Text style={{ fontFamily: font.body600, fontSize: 13, color: kind === k ? '#fff' : color.ink, textTransform: 'capitalize' }}>{k}</Text>
                </Pressable>
              ))}
            </View>
            <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. 6-week GP check" autoCapitalize="sentences" />
            <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-07-10" />
            <Field label="Prep questions (optional)" value={prep} onChangeText={setPrep} placeholder="e.g. contraception, mood" autoCapitalize="sentences" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setOpen(false)} style={{ flex: 1 }} />
              <Button label="Add" onPress={save} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
