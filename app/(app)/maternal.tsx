import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { ChevronLeft, ChevronRight } from '../../src/components/icons';
import { useData, type Lochia } from '../../src/lib/store';
import { BAND_LABEL, CRISIS_RESOURCES, type EpdsBand } from '../../src/lib/epds';

const numI = (s: string) => { const v = parseInt(s, 10); return isNaN(v) ? undefined : v; };
const dateOf = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const LOCHIA: Lochia[] = ['none', 'light', 'moderate', 'heavy'];

export default function Maternal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const d = useData();

  const [birthOpen, setBirthOpen] = useState(false);
  const [birthIn, setBirthIn] = useState('');
  const [recOpen, setRecOpen] = useState(false);
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [lochia, setLochia] = useState<Lochia>('light');
  const [note, setNote] = useState('');

  const birth = d.maternalBirth;
  const days = birth ? Math.floor((Date.now() - new Date(birth + 'T00:00:00').getTime()) / 86400000) : null;
  const week = days != null ? Math.floor(days / 7) : null;

  const latestEpds = d.epdsResults[0];
  const latestRec = d.recoveryLogs[0];
  const bpRedFlag = latestRec && ((latestRec.systolic ?? 0) >= 140 || (latestRec.diastolic ?? 0) >= 90);
  const showSupport = latestEpds?.selfHarmFlag || latestEpds?.band === 'likely';

  function saveBirth() { if (birthIn.trim()) d.setMaternalBirth(birthIn.trim()); setBirthIn(''); setBirthOpen(false); }
  function saveRec() {
    d.addRecoveryLog({ systolic: numI(sys), diastolic: numI(dia), lochia, note });
    setSys(''); setDia(''); setLochia('light'); setNote(''); setRecOpen(false);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
        <ChevronLeft size={24} color={color.ink} />
      </Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Mum&Me · You</Text>

      {/* Module navigation */}
      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 6 }, shadow.card]}>
        {[
          { label: 'Planning your next', to: '/(app)/mat-preconception' },
          { label: 'Feeding & sleep (you)', to: '/(app)/mat-care' },
          { label: 'Pelvic floor & movement', to: '/(app)/mat-pelvic' },
          { label: 'Your appointments', to: '/(app)/mat-appointments' },
          { label: 'Your story (timeline)', to: '/(app)/timeline?subject=you' },
        ].map((row, i) => (
          <Pressable key={row.to} onPress={() => router.push(row.to as any)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: color.hairline }}>
            <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 15, color: color.ink }}>{row.label}</Text>
            <Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>›</Text>
          </Pressable>
        ))}
      </View>

      {week == null ? (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 20, gap: 12 }, shadow.card]}>
          <Text style={{ fontFamily: font.body600, fontSize: 15, color: color.ink }}>Set your baby's birth date</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary }}>We'll track your postpartum recovery week by week. Your wellbeing data stays private, on your device.</Text>
          <Button label="Set birth date" onPress={() => setBirthOpen(true)} />
        </View>
      ) : (
        <>
          <View style={[{ backgroundColor: color.maternalTeal, borderRadius: radius.card, padding: 20 }, shadow.card]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={{ fontFamily: font.display700, fontSize: 28, color: '#fff' }}>Week {week}</Text>
                <Text style={{ fontFamily: font.body500, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>Day {days} postpartum · {week < 6 ? 'Fourth trimester' : 'Recovering'}</Text>
              </View>
              <Pressable onPress={() => setBirthOpen(true)}><Text style={{ fontFamily: font.body700, fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>Edit</Text></Pressable>
            </View>
          </View>

          {/* EPDS */}
          <Pressable onPress={() => router.push('/(app)/epds')} style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18 }, shadow.card]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Wellbeing check-in (EPDS)</Text>
                {latestEpds ? (
                  <Text style={{ fontFamily: font.body600, fontSize: 15, color: color.ink, marginTop: 4 }}>
                    Last: {latestEpds.total}/30 · {BAND_LABEL[latestEpds.band as EpdsBand]} · {dateOf(latestEpds.at)}
                  </Text>
                ) : (
                  <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.inkSecondary, marginTop: 4 }}>Take a 10-question check-in</Text>
                )}
              </View>
              <ChevronRight size={18} color={color.faint} />
            </View>
          </Pressable>

          {/* Support (shown gently if flagged) */}
          {showSupport && (
            <View style={{ backgroundColor: '#FBE0EA', borderRadius: radius.card, padding: 18, gap: 8 }}>
              <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.roseInk }}>Support is here for you</Text>
              {CRISIS_RESOURCES.map((r) => (
                <View key={r.name}>
                  <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>{r.name}</Text>
                  <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.inkSecondary }}>{r.detail}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Recovery */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Recovery</Text>
              <Pressable onPress={() => setRecOpen(true)}><Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>+ Log</Text></Pressable>
            </View>
            {latestRec ? (
              <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16 }, shadow.card]}>
                <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>
                  {latestRec.systolic && latestRec.diastolic ? `${latestRec.systolic}/${latestRec.diastolic} mmHg` : 'Logged'}
                </Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>
                  {latestRec.lochia ? `Lochia: ${latestRec.lochia} · ` : ''}{dateOf(latestRec.at)}
                </Text>
                {bpRedFlag && (
                  <Text style={{ fontFamily: font.body600, fontSize: 12.5, color: color.roseInk, marginTop: 8 }}>
                    ⚠ Blood pressure is high (≥140/90). This can signal pre-eclampsia — please contact your midwife or GP promptly.
                  </Text>
                )}
              </View>
            ) : <Empty text="No recovery logs yet." />}
          </View>

          {/* History */}
          {d.recoveryLogs.length > 1 && (
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Recent logs</Text>
              {d.recoveryLogs.slice(0, 6).map((r) => (
                <View key={r.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10 }, shadow.card]}>
                  <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 13, color: color.ink }}>
                    {r.systolic && r.diastolic ? `${r.systolic}/${r.diastolic}` : '—'}{r.lochia ? ` · ${r.lochia}` : ''}
                  </Text>
                  <Text style={{ fontFamily: font.body500, fontSize: 11, color: color.muted }}>{dateOf(r.at)}</Text>
                  <Pressable onPress={() => d.deleteRecoveryLog(r.id)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {/* Birth date modal */}
      <Modal visible={birthOpen} transparent animationType="fade" onRequestClose={() => setBirthOpen(false)}>
        <Pressable onPress={() => setBirthOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Baby's birth date</Text>
            <Field label="Birth date (YYYY-MM-DD)" value={birthIn} onChangeText={setBirthIn} placeholder="2026-05-12" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setBirthOpen(false)} style={{ flex: 1 }} />
              <Button label="Save" onPress={saveBirth} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Recovery modal */}
      <Modal visible={recOpen} transparent animationType="fade" onRequestClose={() => setRecOpen(false)}>
        <Pressable onPress={() => setRecOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Log recovery</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}><Field label="Systolic" value={sys} onChangeText={setSys} placeholder="118" /></View>
              <View style={{ flex: 1 }}><Field label="Diastolic" value={dia} onChangeText={setDia} placeholder="74" /></View>
            </View>
            <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: color.muted }}>Lochia (bleeding)</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {LOCHIA.map((l) => {
                const sel = l === lochia;
                return (
                  <Pressable key={l} onPress={() => setLochia(l)} style={{ flex: 1, paddingVertical: 10, borderRadius: radius.tile, alignItems: 'center', backgroundColor: sel ? color.maternalTeal : '#fff', borderWidth: 1, borderColor: sel ? color.maternalTeal : color.hairline }}>
                    <Text style={{ fontFamily: font.body600, fontSize: 11, color: sel ? '#fff' : color.ink, textTransform: 'capitalize' }}>{l}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Field label="Note (optional)" value={note} onChangeText={setNote} placeholder="How are you feeling?" autoCapitalize="sentences" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setRecOpen(false)} style={{ flex: 1 }} />
              <Button label="Save" onPress={saveRec} style={{ flex: 1 }} />
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
