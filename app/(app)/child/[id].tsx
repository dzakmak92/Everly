import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, childToken } from '../../../src/theme/tokens';
import { Button, Field } from '../../../src/components/forms';
import { ChevronLeft } from '../../../src/components/icons';
import { ageLabel, stageFrom, STAGE_LABEL } from '../../../src/lib/age';
import { useData, entriesOn, entryDetail, ENTRY_META, CHILD_COLORS, type ChildColor } from '../../../src/lib/store';

const num = (s: string) => { const v = parseFloat(s); return isNaN(v) ? undefined : v; };
const dateOf = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function ChildProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const d = useData();
  const child = d.children.find((c) => c.id === id);

  const [modal, setModal] = useState<null | 'edit' | 'vaccine' | 'med' | 'growth'>(null);
  // form fields (reused per modal)
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [colorKey, setColorKey] = useState<ChildColor>(CHILD_COLORS[0]);
  const [f1, setF1] = useState('');
  const [f2, setF2] = useState('');

  if (!child) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.canvas }}>
        <Text style={{ fontFamily: font.body600, color: color.ink }}>Child not found.</Text>
      </View>
    );
  }

  const t = childToken[child.color];
  const today = entriesOn(d.entries).filter((e) => e.childId === child.id);
  const recent = d.entries.filter((e) => e.childId === child.id).slice(0, 8);
  const myVaccines = d.vaccines.filter((v) => v.childId === child.id);
  const myMeds = d.medications.filter((m) => m.childId === child.id);
  const myGrowth = d.growth.filter((g) => g.childId === child.id);
  const latestGrowth = myGrowth[0];

  const feeds = today.filter((e) => e.kind === 'feed').length;
  const ml = today.filter((e) => e.kind === 'feed' || e.kind === 'pump').reduce((s, e) => s + (e.volumeMl ?? 0), 0);
  const sleepMin = today.filter((e) => e.kind === 'sleep').reduce((s, e) => s + (e.durationMin ?? 0), 0);
  const diapers = today.filter((e) => e.kind === 'diaper').length;

  function openEdit() { setName(child!.name); setBirth(child!.birthDate ?? ''); setColorKey(child!.color); setModal('edit'); }
  function openAdd(m: 'vaccine' | 'med' | 'growth') { setName(''); setF1(''); setF2(''); setModal(m); }
  function save() {
    if (modal === 'edit') d.updateChild(child!.id, { name, birthDate: birth, color: colorKey });
    else if (modal === 'vaccine' && name.trim()) d.addVaccine({ childId: child!.id, name, dueDate: f1 });
    else if (modal === 'med' && name.trim()) d.addMedication({ childId: child!.id, name, dose: f1, schedule: f2 });
    else if (modal === 'growth') d.addGrowth({ childId: child!.id, weightKg: num(f1), heightCm: num(f2) });
    setModal(null);
  }
  function remove() { d.deleteChild(child!.id); router.back(); }

  const Section = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
  const AddLink = ({ onPress }: { onPress: () => void }) => (
    <Pressable onPress={onPress} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>+ Add</Text></Pressable>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 18 }}
    >
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
        <ChevronLeft size={24} color={color.ink} />
      </Pressable>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: t.fill, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: font.display700, fontSize: 24, color: t.stroke }}>{child.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.display700, fontSize: 24, color: color.ink }}>{child.name}</Text>
          <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>
            {child.birthDate ? `${ageLabel(child.birthDate)} · ${STAGE_LABEL[stageFrom(child.birthDate)]}` : 'No birth date'}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {d.activeChild?.id !== child.id && <Button label="Set active" variant="secondary" onPress={() => d.setActiveChild(child.id)} style={{ flex: 1 }} />}
        <Button label="Edit" variant="secondary" onPress={openEdit} style={{ flex: 1 }} />
      </View>

      {/* Today stats */}
      <Section title="Today">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {[['Feeds', `${feeds}`], ['Volume', `${ml} ml`], ['Sleep', sleepMin ? `${Math.floor(sleepMin / 60)}h ${sleepMin % 60}m` : '—'], ['Diapers', `${diapers}`]].map(([label, val]) => (
            <View key={label} style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 14, flexGrow: 1, minWidth: 80 }, shadow.card]}>
              <Text style={{ fontFamily: font.body600, fontSize: 12, color: color.muted }}>{label}</Text>
              <Text style={{ fontFamily: font.display700, fontSize: 22, color: color.ink, marginTop: 2 }}>{val}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Growth */}
      <Section title="Growth" action={<AddLink onPress={() => openAdd('growth')} />}>
        {latestGrowth ? (
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 20, color: color.ink }}>
              {latestGrowth.weightKg ? `${latestGrowth.weightKg} kg` : ''}{latestGrowth.heightCm ? `  ·  ${latestGrowth.heightCm} cm` : ''}
            </Text>
            <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>latest · {dateOf(latestGrowth.at)} · {myGrowth.length} measurement{myGrowth.length === 1 ? '' : 's'}</Text>
          </View>
        ) : <Empty text="No measurements yet." />}
      </Section>

      {/* Vaccines */}
      <Section title="Vaccines" action={<AddLink onPress={() => openAdd('vaccine')} />}>
        {myVaccines.length ? myVaccines.map((v) => (
          <Row key={v.id} title={v.name} sub={v.givenDate ? `Given ${v.givenDate}` : v.dueDate ? `Due ${v.dueDate}` : 'Scheduled'} onDelete={() => d.deleteVaccine(v.id)}
            right={!v.givenDate && <Pressable onPress={() => d.updateVaccine(v.id, { givenDate: new Date().toISOString().slice(0, 10) })}><Text style={{ fontFamily: font.body700, fontSize: 12, color: color.maternalTeal }}>Mark given</Text></Pressable>} />
        )) : <Empty text="No vaccines tracked." />}
      </Section>

      {/* Medications */}
      <Section title="Medications" action={<AddLink onPress={() => openAdd('med')} />}>
        {myMeds.length ? myMeds.map((m) => (
          <Row key={m.id} title={m.name} sub={[m.dose, m.schedule].filter(Boolean).join(' · ') || 'No schedule'} onDelete={() => d.deleteMedication(m.id)}
            right={<Pressable onPress={() => d.toggleMedication(m.id)}><Text style={{ fontFamily: font.body700, fontSize: 12, color: m.active ? color.maternalTeal : color.muted }}>{m.active ? 'Active' : 'Paused'}</Text></Pressable>} />
        )) : <Empty text="No medications." />}
      </Section>

      {/* Recent activity */}
      <Section title="Recent activity">
        {recent.length ? recent.map((e) => {
          const meta = ENTRY_META[e.kind]; const det = entryDetail(e);
          return (
            <View key={e.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10 }, shadow.card]}>
              <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: meta.ink }} />
              <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 13, color: color.ink }}>{meta.label}{det ? ` · ${det}` : ''}</Text>
              <Text style={{ fontFamily: font.body500, fontSize: 11, color: color.muted }}>{dateOf(e.at)}</Text>
            </View>
          );
        }) : <Empty text="No activity logged yet." />}
      </Section>

      <Pressable onPress={remove} style={{ alignItems: 'center', paddingVertical: 12 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.roseInk }}>Delete child</Text>
      </Pressable>

      {/* Modal */}
      <Modal visible={modal !== null} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <Pressable onPress={() => setModal(null)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>
              {modal === 'edit' ? 'Edit child' : modal === 'vaccine' ? 'Add vaccine' : modal === 'med' ? 'Add medication' : 'Add measurement'}
            </Text>

            {modal === 'edit' && <>
              <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
              <Field label="Birth date (YYYY-MM-DD)" value={birth} onChangeText={setBirth} placeholder="2024-02-14" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {CHILD_COLORS.map((k) => {
                  const ct = childToken[k]; const s = k === colorKey;
                  return <Pressable key={k} onPress={() => setColorKey(k)}><View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: ct.fill, borderWidth: s ? 3 : 1, borderColor: s ? ct.stroke : color.hairline }} /></Pressable>;
                })}
              </View>
            </>}
            {modal === 'vaccine' && <>
              <Field label="Vaccine" value={name} onChangeText={setName} placeholder="e.g. 6-in-1" autoCapitalize="sentences" />
              <Field label="Due date (optional)" value={f1} onChangeText={setF1} placeholder="YYYY-MM-DD" />
            </>}
            {modal === 'med' && <>
              <Field label="Medication" value={name} onChangeText={setName} placeholder="e.g. Vitamin D" autoCapitalize="sentences" />
              <Field label="Dose (optional)" value={f1} onChangeText={setF1} placeholder="e.g. 0.5 ml" />
              <Field label="Schedule (optional)" value={f2} onChangeText={setF2} placeholder="e.g. Daily 08:00" />
            </>}
            {modal === 'growth' && <>
              <Field label="Weight (kg)" value={f1} onChangeText={setF1} placeholder="e.g. 6.4" />
              <Field label="Height (cm, optional)" value={f2} onChangeText={setF2} placeholder="e.g. 62" />
            </>}

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

function Row({ title, sub, right, onDelete }: { title: string; sub: string; right?: React.ReactNode; onDelete: () => void }) {
  return (
    <View style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }, shadow.card]}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{title}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>{sub}</Text>
      </View>
      {right}
      <Pressable onPress={onDelete} hitSlop={8} style={{ paddingHorizontal: 4 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text>
      </Pressable>
    </View>
  );
}
