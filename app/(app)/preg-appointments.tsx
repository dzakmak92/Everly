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

export default function PregAppointments() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pregAppts, addPregAppt, deletePregAppt } = useData();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [kind, setKind] = useState<'appointment' | 'test'>('appointment');
  const [result, setResult] = useState('');

  const appts = pregAppts.filter((a) => a.kind === 'appointment');
  const tests = pregAppts.filter((a) => a.kind === 'test');

  function save() {
    if (title.trim() && date.trim()) addPregAppt({ title, at: `${date}T09:00:00`, kind, result: kind === 'test' ? result : undefined });
    setTitle(''); setDate(''); setResult(''); setKind('appointment'); setOpen(false);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
        <Pressable onPress={() => setOpen(true)}><Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>+ Add</Text></Pressable>
      </View>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Appointments & tests</Text>

      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Upcoming</Text>
        {appts.length === 0 ? <Empty t="No appointments yet." /> : appts.map((a) => {
          const d = daysTo(a.at);
          return (
            <View key={a.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }, shadow.card]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{a.title}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>{dayLabel(a.at)}{d >= 0 ? ` · in ${d} day${d === 1 ? '' : 's'}` : ' · past'}</Text>
              </View>
              <Pressable onPress={() => deletePregAppt(a.id)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>
            </View>
          );
        })}
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Test results</Text>
        {tests.length === 0 ? <Empty t="No test results yet." /> : tests.map((a) => (
          <View key={a.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }, shadow.card]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{a.title}</Text>
              <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>{dayLabel(a.at)}{a.result ? ` · ${a.result}` : ''}</Text>
            </View>
            <Pressable onPress={() => deletePregAppt(a.id)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>
          </View>
        ))}
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Add</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['appointment', 'test'] as const).map((k) => (
                <Pressable key={k} onPress={() => setKind(k)} style={{ flex: 1, paddingVertical: 10, borderRadius: radius.tile, alignItems: 'center', backgroundColor: kind === k ? color.primary : '#fff', borderWidth: 1, borderColor: kind === k ? color.primary : color.hairline }}>
                  <Text style={{ fontFamily: font.body600, fontSize: 13, color: kind === k ? '#fff' : color.ink, textTransform: 'capitalize' }}>{k}</Text>
                </Pressable>
              ))}
            </View>
            <Field label="Title" value={title} onChangeText={setTitle} placeholder={kind === 'test' ? 'e.g. GTT blood test' : 'e.g. Anatomy scan'} autoCapitalize="sentences" />
            <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-07-05" />
            {kind === 'test' && <Field label="Result (optional)" value={result} onChangeText={setResult} placeholder="e.g. Normal" autoCapitalize="sentences" />}
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

function Empty({ t }: { t: string }) {
  return <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 14, alignItems: 'center' }, shadow.card]}><Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>{t}</Text></View>;
}
