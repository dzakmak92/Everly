import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { ChevronLeft } from '../../src/components/icons';
import { useData } from '../../src/lib/store';

const dayLabel = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const daysTo = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
const whenLabel = (iso: string) => { const d = daysTo(iso); return `${dayLabel(iso)}${d >= 0 ? ` · in ${d} day${d === 1 ? '' : 's'}` : ' · past'}`; };

type Mode = 'pregnancy' | 'maternal';

const SEED = [
  { title: 'Midwife discharge', kind: 'check' as const, off: 5 },
  { title: 'Health visitor assessment', kind: 'check' as const, off: 14 },
  { title: '6-week GP check', kind: 'appointment' as const, off: 42, prep: 'Contraception, mental health, physical recovery, return to work' },
];

/** Unified appointments — Pregnancy (appts + tests) and Mum&Me (postpartum). */
export default function Appointments() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { pregAppts, addPregAppt, deletePregAppt, matAppts, addMatAppt, deleteMatAppt, maternalBirth } = useData();

  const [mode, setMode] = useState<Mode>(params.tab === 'maternal' ? 'maternal' : 'pregnancy');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [kind, setKind] = useState<'appointment' | 'test' | 'check'>('appointment');
  const [result, setResult] = useState('');
  const [prep, setPrep] = useState('');

  function switchMode(m: Mode) { setMode(m); setKind('appointment'); }
  function openAdd() { setTitle(''); setDate(''); setResult(''); setPrep(''); setKind('appointment'); setOpen(true); }
  function save() {
    if (title.trim() && date.trim()) {
      if (mode === 'pregnancy') addPregAppt({ title, at: `${date}T09:00:00`, kind: kind === 'test' ? 'test' : 'appointment', result: kind === 'test' ? result : undefined });
      else addMatAppt({ title, at: `${date}T10:00:00`, kind: kind === 'check' ? 'check' : 'appointment', prep });
    }
    setOpen(false);
  }
  function seed() {
    const birth = maternalBirth ? new Date(`${maternalBirth}T00:00:00`) : new Date();
    SEED.forEach((s) => addMatAppt({ title: s.title, at: new Date(birth.getTime() + s.off * 86400000).toISOString(), kind: s.kind, prep: s.prep }));
  }

  const appts = pregAppts.filter((a) => a.kind === 'appointment');
  const tests = pregAppts.filter((a) => a.kind === 'test');

  const kindOptions: ('appointment' | 'test' | 'check')[] = mode === 'pregnancy' ? ['appointment', 'test'] : ['appointment', 'check'];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
        <Pressable onPress={openAdd}><Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>+ Add</Text></Pressable>
      </View>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Appointments</Text>

      {/* context toggle */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['pregnancy', 'maternal'] as Mode[]).map((m) => {
          const active = mode === m;
          return (
            <Pressable key={m} onPress={() => switchMode(m)} style={{ flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: 'center', backgroundColor: active ? color.primary : '#fff', borderWidth: active ? 0 : 1, borderColor: color.hairline }}>
              <Text style={{ fontFamily: active ? font.body700 : font.body600, fontSize: 13, color: active ? '#fff' : color.inkSecondary }}>{m === 'pregnancy' ? 'Pregnancy' : 'Mum&Me'}</Text>
            </Pressable>
          );
        })}
      </View>

      {mode === 'pregnancy' ? (
        <>
          <View style={{ gap: 8 }}>
            <Text style={Label}>Upcoming</Text>
            {appts.length === 0 ? <Empty t="No appointments yet." /> : appts.map((a) => (
              <Row key={a.id} title={a.title} sub={whenLabel(a.at)} onDelete={() => deletePregAppt(a.id)} />
            ))}
          </View>
          <View style={{ gap: 8 }}>
            <Text style={Label}>Test results</Text>
            {tests.length === 0 ? <Empty t="No test results yet." /> : tests.map((a) => (
              <Row key={a.id} title={a.title} sub={`${dayLabel(a.at)}${a.result ? ` · ${a.result}` : ''}`} onDelete={() => deletePregAppt(a.id)} />
            ))}
          </View>
        </>
      ) : (
        <View style={{ gap: 8 }}>
          <Text style={Label}>Your postpartum schedule</Text>
          {matAppts.length === 0 ? (
            <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, gap: 12 }, shadow.card]}>
              <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.inkSecondary }}>Seed the standard postpartum schedule from your birth date, or add your own.</Text>
              <Button label="Load standard schedule" variant="secondary" onPress={seed} />
            </View>
          ) : matAppts.map((a) => (
            <View key={a.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, gap: 6 }, shadow.card]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{a.title}</Text>
                  <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>{whenLabel(a.at)}</Text>
                </View>
                <Pressable onPress={() => deleteMatAppt(a.id)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>
              </View>
              {a.prep && <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.inkSecondary, backgroundColor: color.canvas, borderRadius: radius.tile, padding: 10 }}>Prep: {a.prep}</Text>}
            </View>
          ))}
        </View>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Add · {mode === 'pregnancy' ? 'Pregnancy' : 'Mum&Me'}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {kindOptions.map((k) => (
                <Pressable key={k} onPress={() => setKind(k)} style={{ flex: 1, paddingVertical: 10, borderRadius: radius.tile, alignItems: 'center', backgroundColor: kind === k ? color.primary : '#fff', borderWidth: 1, borderColor: kind === k ? color.primary : color.hairline }}>
                  <Text style={{ fontFamily: font.body600, fontSize: 13, color: kind === k ? '#fff' : color.ink, textTransform: 'capitalize' }}>{k}</Text>
                </Pressable>
              ))}
            </View>
            <Field label="Title" value={title} onChangeText={setTitle} placeholder={kind === 'test' ? 'e.g. GTT blood test' : 'e.g. 6-week GP check'} autoCapitalize="sentences" />
            <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-07-05" />
            {mode === 'pregnancy' && kind === 'test' && <Field label="Result (optional)" value={result} onChangeText={setResult} placeholder="e.g. Normal" autoCapitalize="sentences" />}
            {mode === 'maternal' && <Field label="Prep questions (optional)" value={prep} onChangeText={setPrep} placeholder="e.g. contraception, mood" autoCapitalize="sentences" />}
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

const Label = { fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' as const, color: color.muted };

function Row({ title, sub, onDelete }: { title: string; sub: string; onDelete: () => void }) {
  return (
    <View style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }, shadow.card]}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{title}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>{sub}</Text>
      </View>
      <Pressable onPress={onDelete} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>
    </View>
  );
}

function Empty({ t }: { t: string }) {
  return <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 14, alignItems: 'center' }, shadow.card]}><Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>{t}</Text></View>;
}
