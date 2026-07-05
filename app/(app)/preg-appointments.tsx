import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { DateField } from '../../src/components/DateField';
import { ChevronLeft } from '../../src/components/icons';
import { useData } from '../../src/lib/store';
import { useFeedback } from '../../src/components/Feedback';

const dayLabel = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const daysTo = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
const whenLabel = (iso: string) => { const d = daysTo(iso); return `${dayLabel(iso)}${d >= 0 ? ` · in ${d} day${d === 1 ? '' : 's'}` : ' · past'}`; };

type Mode = 'pregnancy' | 'maternal';

const SEED = [
  { title: 'Midwife discharge', kind: 'check' as const, off: 5 },
  { title: 'Health visitor assessment', kind: 'check' as const, off: 14 },
  { title: '6-week GP check', kind: 'appointment' as const, off: 42, prep: 'Contraception, mental health, physical recovery, return to work' },
];

/** Standard antenatal schedule (gestational week from LMP). Dates are computed
 *  from the user's last period / due date. Some checks are first-baby-only. */
const PREG_ANTENATAL: { title: string; kind: 'appointment' | 'test'; week: number; detail: string }[] = [
  { title: 'Booking appointment', kind: 'appointment', week: 8, detail: 'Midwife booking — history, bloods & urine' },
  { title: 'Dating scan (12-week)', kind: 'test', week: 12, detail: 'Ultrasound + combined screening' },
  { title: '16-week midwife check', kind: 'appointment', week: 16, detail: 'Blood pressure, urine; discuss results' },
  { title: '20-week anomaly scan', kind: 'test', week: 20, detail: 'Detailed anatomy ultrasound' },
  { title: '25-week check (1st baby)', kind: 'appointment', week: 25, detail: 'BP, urine, fundal height' },
  { title: '28-week check', kind: 'appointment', week: 28, detail: 'Bloods, glucose, anti-D if needed' },
  { title: '31-week check (1st baby)', kind: 'appointment', week: 31, detail: 'BP, urine, fundal height' },
  { title: '34-week check', kind: 'appointment', week: 34, detail: 'BP, urine; talk through your birth plan' },
  { title: '36-week check', kind: 'appointment', week: 36, detail: 'Baby’s position; feeding chat' },
  { title: '38-week check', kind: 'appointment', week: 38, detail: 'BP, urine, fundal height' },
  { title: '40-week check (1st baby)', kind: 'appointment', week: 40, detail: 'BP, urine; discuss going overdue' },
  { title: '41-week check', kind: 'appointment', week: 41, detail: 'Membrane sweep offer; induction chat' },
];

/** Unified appointments — Pregnancy (appts + tests) and Mum&Me (postpartum). */
export default function Appointments() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { pregAppts, addPregAppt, deletePregAppt, matAppts, addMatAppt, deleteMatAppt, maternalBirth, lastPeriod, dueDate } = useData();
  const { toast, confirm } = useFeedback();

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
      setOpen(false);
      toast('Appointment added');
      return;
    }
    setOpen(false);
  }
  async function seed() {
    if (matAppts.length > 0) {
      const ok = await confirm({ title: 'You already have appointments', message: 'Add the standard schedule on top of your existing appointments?', confirmLabel: 'Add anyway', accent: color.rose });
      if (!ok) return;
    }
    const birth = maternalBirth ? new Date(`${maternalBirth}T00:00:00`) : new Date();
    SEED.forEach((s) => addMatAppt({ title: s.title, at: new Date(birth.getTime() + s.off * 86400000).toISOString(), kind: s.kind, prep: s.prep }));
    toast('Standard schedule loaded');
  }

  // ── Standard antenatal schedule loader (pregnancy) ──
  // Base the dates on the last period, else back-calculate from the due date
  // (due date = LMP + 280 days).
  const lmp = lastPeriod
    ? new Date(`${lastPeriod}T00:00:00`)
    : dueDate
      ? new Date(new Date(`${dueDate}T00:00:00`).getTime() - 280 * 86400000)
      : null;
  const normT = (s: string) => s.trim().toLowerCase();
  const havePreg = new Set(pregAppts.map((a) => normT(a.title)));
  const antenatal = lmp
    ? PREG_ANTENATAL.map((it) => {
        const d = new Date(lmp.getTime() + it.week * 7 * 86400000);
        return { ...it, date: d, iso: d.toISOString().slice(0, 10), have: havePreg.has(normT(it.title)) };
      })
    : [];
  const [loadOpen, setLoadOpen] = useState(false);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
  const openLoad = () => {
    // Pre-select the appointments still ahead and not already on the list.
    setSel(new Set(antenatal.filter((a) => !a.have && a.date.getTime() >= startToday.getTime()).map((a) => a.title)));
    setLoadOpen(true);
  };
  const toggleSel = (t: string) => setSel((s) => { const n = new Set(s); if (n.has(t)) n.delete(t); else n.add(t); return n; });
  const selCount = antenatal.filter((a) => sel.has(a.title) && !a.have).length;
  const doLoad = () => {
    let added = 0;
    antenatal.forEach((a) => {
      if (!sel.has(a.title) || a.have) return;
      addPregAppt({ title: a.title, at: `${a.iso}T09:00:00`, kind: a.kind });
      added++;
    });
    setLoadOpen(false);
    toast(added > 0 ? `Added ${added} appointment${added === 1 ? '' : 's'}` : 'Nothing new to add');
  };

  const appts = pregAppts.filter((a) => a.kind === 'appointment');
  const tests = pregAppts.filter((a) => a.kind === 'test');
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const isFuture = (iso: string) => new Date(iso).getTime() >= startOfToday.getTime();
  const upcomingAppts = appts.filter((a) => isFuture(a.at)).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  const pastAppts = appts.filter((a) => !isFuture(a.at)).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

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
          {lmp && (
            <Button label="↻ Load standard schedule" variant="secondary" onPress={openLoad} />
          )}
          <View style={{ gap: 8 }}>
            <Text style={Label}>Upcoming</Text>
            {upcomingAppts.length === 0 ? <Empty t="No upcoming appointments." /> : upcomingAppts.map((a) => (
              <Row key={a.id} title={a.title} sub={whenLabel(a.at)} onDelete={() => deletePregAppt(a.id)} />
            ))}
          </View>
          {pastAppts.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text style={Label}>Past</Text>
              {pastAppts.map((a) => (
                <Row key={a.id} title={a.title} sub={whenLabel(a.at)} onDelete={() => deletePregAppt(a.id)} />
              ))}
            </View>
          )}
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

      {/* Standard antenatal schedule picker */}
      <Modal visible={loadOpen} transparent animationType="fade" onRequestClose={() => setLoadOpen(false)}>
        <Pressable onPress={() => setLoadOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: '#fff', borderRadius: 22, padding: 18, maxHeight: '84%' }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 17, color: color.ink }}>Standard antenatal schedule</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, marginTop: 3, marginBottom: 8 }}>Dates are estimated from your due date — you can change any of them after adding. Anything already booked is skipped.</Text>

            {(() => {
              const pickable = antenatal.filter((a) => !a.have);
              const allOn = pickable.length > 0 && pickable.every((a) => sel.has(a.title));
              return (
                <Pressable onPress={() => setSel(allOn ? new Set() : new Set(pickable.map((a) => a.title)))} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: color.hairline }}>
                  <View style={{ width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: allOn ? color.primary : '#CFC9E4', backgroundColor: allOn ? color.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    {allOn ? <Text style={{ color: '#fff', fontSize: 12, fontFamily: font.body700 }}>✓</Text> : null}
                  </View>
                  <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>{allOn ? 'Clear all' : 'Select all'}</Text>
                </Pressable>
              );
            })()}

            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {antenatal.map((a) => {
                const on = sel.has(a.title);
                const past = a.date.getTime() < startToday.getTime();
                return (
                  <Pressable key={a.title} disabled={a.have} onPress={() => toggleSel(a.title)} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 11, opacity: a.have ? 0.45 : 1 }}>
                    <View style={{ width: 22, height: 22, borderRadius: 7, borderWidth: 2, marginTop: 1, borderColor: on && !a.have ? color.primary : '#CFC9E4', backgroundColor: on && !a.have ? color.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                      {on && !a.have ? <Text style={{ color: '#fff', fontSize: 12, fontFamily: font.body700 }}>✓</Text> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ flex: 1, fontFamily: font.body700, fontSize: 13.5, color: color.ink }} numberOfLines={1}>{a.title}</Text>
                        {a.kind === 'test' && <Text style={{ fontFamily: font.body700, fontSize: 9, color: color.primary, backgroundColor: '#EEF0FF', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>SCAN</Text>}
                      </View>
                      <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.muted, marginTop: 1 }}>{a.detail}</Text>
                      <Text style={{ fontFamily: font.body500, fontSize: 11, color: a.have ? color.muted : past ? color.faint : color.roseInk, marginTop: 2 }}>
                        Week {a.week} · {dayLabel(`${a.iso}T09:00:00`)}{a.have ? ' · already booked' : past ? ' · past' : ''}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setLoadOpen(false)} style={{ flex: 1 }} />
              <Button label={selCount > 0 ? `Add ${selCount}` : 'Add'} disabled={selCount === 0} onPress={doLoad} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
            <DateField label="Date" value={date} onChangeText={setDate} placeholder="Pick a date" />
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
