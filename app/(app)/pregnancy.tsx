import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { ProgressBar } from '../../src/components/ui';
import { ChevronLeft, ChevronRight } from '../../src/components/icons';
import { useData } from '../../src/lib/store';
import { gestFromDueDate, weekContent, dueDateFromLmp, PREG_SYMPTOMS, MOODS } from '../../src/lib/pregnancy';

const num = (s: string) => { const v = parseFloat(s); return isNaN(v) ? undefined : v; };

export default function Pregnancy() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dueDate, setDueDate, checkins, addCheckin, deleteCheckin } = useData();

  const [dueOpen, setDueOpen] = useState(false);
  const [dueIn, setDueIn] = useState('');
  const [lmpIn, setLmpIn] = useState('');
  const [ciOpen, setCiOpen] = useState(false);
  const [mood, setMood] = useState(2);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [weight, setWeight] = useState('');

  const gest = gestFromDueDate(dueDate ?? undefined);
  const content = gest ? weekContent(gest.week) : null;
  const weights = checkins.filter((c) => c.weightKg != null);

  function saveDue() {
    const dd = dueIn.trim() || (lmpIn.trim() ? dueDateFromLmp(lmpIn.trim()) : '');
    if (dd) setDueDate(dd);
    setDueIn(''); setLmpIn(''); setDueOpen(false);
  }
  function toggleSymptom(s: string) {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }
  function saveCheckin() {
    addCheckin({ mood, symptoms, weightKg: num(weight) });
    setMood(2); setSymptoms([]); setWeight(''); setCiOpen(false);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}
    >
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
        <ChevronLeft size={24} color={color.ink} />
      </Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Pregnancy</Text>

      {!gest ? (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 20, gap: 12 }, shadow.card]}>
          <Text style={{ fontFamily: font.body600, fontSize: 15, color: color.ink }}>Set your due date to start tracking</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary }}>
            We'll show your week, baby's size, and days to go. You can use your due date or last period date.
          </Text>
          <Button label="Set due date" onPress={() => setDueOpen(true)} />
        </View>
      ) : (
        <>
          {/* Week card */}
          <View style={[{ backgroundColor: color.maternalTeal, borderRadius: radius.card, padding: 20, gap: 12 }, shadow.card]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontFamily: font.display700, fontSize: 30, color: '#fff' }}>Week {gest.week}</Text>
                <Text style={{ fontFamily: font.body500, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>{gest.daysToGo} days to go · Trimester {gest.trimester}</Text>
              </View>
              <Pressable onPress={() => setDueOpen(true)}><Text style={{ fontFamily: font.body700, fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>Edit</Text></Pressable>
            </View>
            <ProgressBar pct={Math.round(gest.progress * 100)} colors={['#FFFFFF', '#E0F4EF']} track="rgba(255,255,255,0.25)" />
          </View>

          {/* Baby size */}
          {content && (
            <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18 }, shadow.card]}>
              <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Baby this week</Text>
              <Text style={{ fontFamily: font.display700, fontSize: 20, color: color.ink, marginTop: 4 }}>Size of a {content.size.toLowerCase()}</Text>
              <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary, marginTop: 2 }}>
                {content.lengthCm > 0 ? `~${content.lengthCm} cm` : ''}{content.weightG > 0 ? ` · ~${content.weightG} g` : ''}
              </Text>
              <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary, marginTop: 6 }}>{content.note}</Text>
            </View>
          )}

          {/* Tools */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Tools</Text>
            {([
              { label: 'Daily check-in', fn: () => setCiOpen(true) },
              { label: 'Week-by-week', fn: () => router.push('/(app)/preg-week') },
              { label: 'Labour & movement', fn: () => router.push('/(app)/kick-counter') },
              { label: 'Appointments & tests', fn: () => router.push('/(app)/preg-appointments') },
              { label: 'Birth prep', fn: () => router.push('/(app)/preg-birthprep') },
              { label: 'Baby names', fn: () => router.push('/(app)/preg-names') },
              { label: 'Extra monitoring', fn: () => router.push('/(app)/preg-vitals') },
              { label: 'When to call (triage)', fn: () => router.push('/(app)/preg-triage') },
              { label: 'Care & support', fn: () => router.push('/(app)/preg-care') },
            ] as { label: string; fn: () => void }[]).map(({ label, fn }) => (
              <Pressable key={label} onPress={fn} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 16, flexDirection: 'row', alignItems: 'center' }, shadow.card]}>
                <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 15, color: color.ink }}>{label}</Text>
                <ChevronRight size={18} color={color.faint} />
              </Pressable>
            ))}
          </View>

          {/* Weight */}
          {weights.length > 0 && (
            <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18 }, shadow.card]}>
              <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Weight</Text>
              <Text style={{ fontFamily: font.display700, fontSize: 22, color: color.ink, marginTop: 4 }}>{weights[0].weightKg} kg</Text>
              <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>latest · {weights.length} logged</Text>
            </View>
          )}

          {/* Recent check-ins */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Recent check-ins</Text>
            {checkins.length === 0 ? (
              <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, alignItems: 'center' }, shadow.card]}>
                <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>No check-ins yet.</Text>
              </View>
            ) : checkins.slice(0, 8).map((c) => (
              <View key={c.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }, shadow.card]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{MOODS[c.mood]}{c.weightKg ? ` · ${c.weightKg} kg` : ''}</Text>
                  <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>
                    {new Date(c.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}{c.symptoms.length ? ` · ${c.symptoms.join(', ')}` : ''}
                  </Text>
                </View>
                <Pressable onPress={() => deleteCheckin(c.id)} hitSlop={8} style={{ paddingHorizontal: 4 }}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Due date modal */}
      <Modal visible={dueOpen} transparent animationType="fade" onRequestClose={() => setDueOpen(false)}>
        <Pressable onPress={() => setDueOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Due date</Text>
            <Field label="Due date (YYYY-MM-DD)" value={dueIn} onChangeText={setDueIn} placeholder="2026-09-01" />
            <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>Or enter your last period date and we'll estimate it:</Text>
            <Field label="Last period (YYYY-MM-DD)" value={lmpIn} onChangeText={setLmpIn} placeholder="2025-11-24" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setDueOpen(false)} style={{ flex: 1 }} />
              <Button label="Save" onPress={saveDue} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Check-in modal */}
      <Modal visible={ciOpen} transparent animationType="fade" onRequestClose={() => setCiOpen(false)}>
        <Pressable onPress={() => setCiOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Daily check-in</Text>
            <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: color.muted }}>Mood</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {MOODS.map((m, i) => {
                const sel = i === mood;
                return (
                  <Pressable key={m} onPress={() => setMood(i)} style={{ flex: 1, paddingVertical: 10, borderRadius: radius.tile, alignItems: 'center', backgroundColor: sel ? color.maternalTeal : '#fff', borderWidth: 1, borderColor: sel ? color.maternalTeal : color.hairline }}>
                    <Text style={{ fontFamily: font.body600, fontSize: 11, color: sel ? '#fff' : color.ink }}>{m}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: color.muted }}>Symptoms</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
              {PREG_SYMPTOMS.map((s) => {
                const sel = symptoms.includes(s);
                return (
                  <Pressable key={s} onPress={() => toggleSymptom(s)} style={{ paddingVertical: 7, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: sel ? color.primary : '#fff', borderWidth: 1, borderColor: sel ? color.primary : color.hairline }}>
                    <Text style={{ fontFamily: font.body600, fontSize: 12, color: sel ? '#fff' : color.ink }}>{s}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Field label="Weight (kg, optional)" value={weight} onChangeText={setWeight} placeholder="e.g. 68.4" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setCiOpen(false)} style={{ flex: 1 }} />
              <Button label="Save" onPress={saveCheckin} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
