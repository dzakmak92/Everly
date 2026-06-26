import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { DateField } from '../../src/components/DateField';
import { MumMeSwitch } from '../../src/components/MumMeSwitch';
import { ChevronLeft, ChevronRight, Smile, Activity, Heart, Calendar, Camera, Leaf, Phone } from '../../src/components/icons';
import { useData, type Lochia } from '../../src/lib/store';
import { BAND_LABEL, CRISIS_RESOURCES, type EpdsBand } from '../../src/lib/epds';

const numI = (s: string) => { const v = parseInt(s, 10); return isNaN(v) ? undefined : v; };
const dateOf = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const LOCHIA: Lochia[] = ['none', 'light', 'moderate', 'heavy'];

const BAND_TINT: Record<EpdsBand, { bg: string; ink: string }> = {
  low: { bg: '#D8F0E6', ink: '#1E5C50' },
  possible: { bg: '#FBF1CE', ink: '#7A5C20' },
  likely: { bg: '#FBE0EA', ink: '#B04070' },
};

const NAV: { label: string; sub: string; to: string; icon: React.ComponentType<any>; iconColor: string; bg: string }[] = [
  { label: 'Planning your next', sub: 'Preconception & readiness', to: '/(app)/mat-preconception', icon: Leaf, iconColor: '#6E9A4E', bg: '#E6EFDD' },
  { label: 'Feeding & sleep (you)', sub: 'Looking after yourself', to: '/(app)/mat-care', icon: Heart, iconColor: '#2C8475', bg: '#D8F0E6' },
  { label: 'Pelvic floor & movement', sub: 'Gentle recovery exercises', to: '/(app)/mat-pelvic', icon: Activity, iconColor: '#6B6FC9', bg: '#E7E4FB' },
  { label: 'Your appointments', sub: 'Postnatal checks & visits', to: '/(app)/preg-appointments?tab=maternal', icon: Calendar, iconColor: '#2C5F90', bg: '#DCEBFA' },
  { label: 'Your story (timeline)', sub: 'Your journey, week by week', to: '/(app)/timeline?subject=you', icon: Camera, iconColor: '#B5662E', bg: '#FCE6D8' },
];

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

  function openBirth() { setBirthIn(birth ?? ''); setBirthOpen(true); }
  function saveBirth() { if (birthIn.trim()) d.setMaternalBirth(birthIn.trim()); setBirthIn(''); setBirthOpen(false); }
  function saveRec() {
    d.addRecoveryLog({ systolic: numI(sys), diastolic: numI(dia), lochia, note });
    setSys(''); setDia(''); setLochia('light'); setNote(''); setRecOpen(false);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }} showsVerticalScrollIndicator={false}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
        <ChevronLeft size={24} color={color.ink} />
      </Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Mum&Me</Text>
      <MumMeSwitch phase="postpartum" />

      {/* Hero — postpartum week, or a friendly prompt to set the birth date */}
      {week == null ? (
        <Pressable onPress={() => setBirthOpen(true)} style={[{ backgroundColor: color.maternalTeal, borderRadius: radius.card, padding: 20, gap: 12 }, shadow.card]}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={22} color="#fff" />
          </View>
          <Text style={{ fontFamily: font.display700, fontSize: 20, color: '#fff' }}>Let's track your recovery</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 13.5, color: 'rgba(255,255,255,0.92)', lineHeight: 20 }}>
            Set your baby's birth date and we'll follow your postpartum journey week by week. Your wellbeing data stays private, on your device.
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 14, color: '#fff' }}>Set birth date</Text>
            <ChevronRight size={16} color="#fff" />
          </View>
        </Pressable>
      ) : (
        <Pressable onPress={openBirth} style={[{ backgroundColor: color.maternalTeal, borderRadius: radius.card, padding: 20 }, shadow.card]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.body600, fontSize: 12, letterSpacing: 0.4, color: 'rgba(255,255,255,0.85)' }}>
                {week < 6 ? 'Fourth trimester' : 'Recovering'}
              </Text>
              <Text style={{ fontFamily: font.display700, fontSize: 28, color: '#fff', marginTop: 2 }}>Week {week} postpartum</Text>
              <Text style={{ fontFamily: font.body500, fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>Day {days} · since {dateOf(birth + 'T00:00:00')}</Text>
            </View>
            <Text style={{ fontFamily: font.body700, fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>Edit</Text>
          </View>
        </Pressable>
      )}

      {/* Overview */}
      <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: color.muted, paddingLeft: 2 }}>Your overview</Text>

      {/* Wellbeing (EPDS) */}
      <Pressable onPress={() => router.push('/(app)/epds')} style={({ pressed }) => [{ backgroundColor: pressed ? '#FAF9FE' : '#fff', borderRadius: radius.card, padding: 18 }, shadow.card]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: latestEpds ? BAND_TINT[latestEpds.band as EpdsBand].bg : '#E7E4FB', alignItems: 'center', justifyContent: 'center' }}>
            <Smile size={20} color={latestEpds ? BAND_TINT[latestEpds.band as EpdsBand].ink : '#6B6FC9'} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.ink }}>Wellbeing check-in</Text>
            {latestEpds ? (
              <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, marginTop: 2 }} numberOfLines={1}>
                {BAND_LABEL[latestEpds.band as EpdsBand]} · {latestEpds.total}/30 · {dateOf(latestEpds.at)}
              </Text>
            ) : (
              <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, marginTop: 2 }}>A 10-question EPDS mood screen</Text>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>{latestEpds ? 'Take check' : 'Start'}</Text>
            <ChevronRight size={18} color={color.faint} />
          </View>
        </View>
      </Pressable>

      {/* Recovery */}
      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18 }, shadow.card]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#D8F0E6', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={20} color="#2C8475" />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.ink }}>Recovery</Text>
            {latestRec ? (
              <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, marginTop: 2 }} numberOfLines={1}>
                {latestRec.systolic && latestRec.diastolic ? `${latestRec.systolic}/${latestRec.diastolic} mmHg` : 'Logged'}
                {latestRec.lochia ? ` · lochia ${latestRec.lochia}` : ''} · {dateOf(latestRec.at)}
              </Text>
            ) : (
              <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, marginTop: 2 }}>Track blood pressure & bleeding</Text>
            )}
          </View>
          <Pressable onPress={() => setRecOpen(true)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>+ Log</Text></Pressable>
        </View>
        {bpRedFlag && (
          <View style={{ backgroundColor: '#FBE0EA', borderRadius: radius.cardSm, padding: 12, marginTop: 12 }}>
            <Text style={{ fontFamily: font.body600, fontSize: 12.5, color: color.roseInk, lineHeight: 18 }}>
              ⚠ Blood pressure is high (≥140/90). This can signal pre-eclampsia — please contact your midwife or GP promptly.
            </Text>
          </View>
        )}
      </View>

      {/* Support (shown prominently if flagged) — safeguarding content, never weaken */}
      {showSupport && (
        <View style={{ backgroundColor: '#FBE0EA', borderRadius: radius.card, padding: 18, gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
              <Phone size={18} color={color.roseInk} />
            </View>
            <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.roseInk }}>Support is here for you</Text>
          </View>
          {CRISIS_RESOURCES.map((r) => (
            <View key={r.name}>
              <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>{r.name}</Text>
              <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.inkSecondary }}>{r.detail}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent recovery logs */}
      {d.recoveryLogs.length > 1 && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: color.muted, paddingLeft: 2 }}>Recent logs</Text>
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

      {/* Explore — icon-led grouped navigation (More-hub style) */}
      <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: color.muted, paddingLeft: 2, marginTop: 4 }}>Explore</Text>
      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, overflow: 'hidden' }, shadow.card]}>
        {NAV.map((row, i) => {
          const Icon = row.icon;
          return (
            <Pressable
              key={row.to}
              onPress={() => router.push(row.to as any)}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: color.hairline, backgroundColor: pressed ? '#FAF9FE' : '#fff' })}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: row.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={19} color={row.iconColor} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.ink }}>{row.label}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, marginTop: 2 }} numberOfLines={1}>{row.sub}</Text>
              </View>
              <ChevronRight size={18} color={color.faint} />
            </Pressable>
          );
        })}
      </View>

      {/* Birth date modal */}
      <Modal visible={birthOpen} transparent animationType="fade" onRequestClose={() => setBirthOpen(false)}>
        <Pressable onPress={() => setBirthOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Baby's birth date</Text>
            <DateField label="Baby's birth date" value={birthIn} onChangeText={setBirthIn} />
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
