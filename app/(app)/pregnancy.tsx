import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, fill } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { DateField } from '../../src/components/DateField';
import { ProgressBar } from '../../src/components/ui';
import { MumMeSwitch } from '../../src/components/MumMeSwitch';
import {
  ChevronLeft, ChevronRight,
  BabyBean, Heart, Calendar, Activity, CheckCircle, Shield, Star, Smile,
} from '../../src/components/icons';
import { useData, CHILD_COLORS, type ChildColor } from '../../src/lib/store';
import { useFeedback } from '../../src/components/Feedback';
import { childToken } from '../../src/theme/tokens';
import { gestFromDueDate, weekContent, dueDateFromLmp, PREG_SYMPTOMS, MOODS } from '../../src/lib/pregnancy';
import { useUnits } from '../../src/lib/units';

const num = (s: string) => { const v = parseFloat(s); return isNaN(v) ? undefined : v; };

const _t = (d: string) => new Date(d.length <= 10 ? `${d}T00:00:00` : d).getTime();
const fmtArch = (iso: string) => new Date(_t(iso)).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const archWeek = (a: { dueDate: string; bornDate: string }) => Math.max(0, Math.floor((280 - Math.round((_t(a.dueDate) - _t(a.bornDate)) / 86400000)) / 7));

const Ic = (C: any, c: string) => <C size={19} color={c} />;

/** Icon-led grouped row (matches the More hub style). */
function ToolRow({ icon, bg, label, sub, onPress, first }: { icon: React.ReactNode; bg: string; label: string; sub: string; onPress: () => void; first: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderTopWidth: first ? 0 : 1, borderTopColor: color.hairline, backgroundColor: pressed ? '#FAF9FE' : '#fff' })}
    >
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.ink }}>{label}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, marginTop: 2 }} numberOfLines={1}>{sub}</Text>
      </View>
      <ChevronRight size={18} color={color.faint} />
    </Pressable>
  );
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: color.muted, paddingLeft: 4 }}>{children}</Text>
);

export default function Pregnancy() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const u = useUnits();
  const { dueDate, setDueDate, setMaternalBirth, addChild, setActiveChild, savedNames, checkins, addCheckin, deleteCheckin, pregArchive, closePregnancy } = useData();
  const { toast } = useFeedback();
  const archived = !dueDate ? (pregArchive[0] ?? null) : null;

  const [dueOpen, setDueOpen] = useState(false);
  const [dueIn, setDueIn] = useState('');
  const [lmpIn, setLmpIn] = useState('');
  const [arrivedOpen, setArrivedOpen] = useState(false);
  const [birthIn, setBirthIn] = useState('');
  const [arrName, setArrName] = useState('');
  const [arrColor, setArrColor] = useState<ChildColor>(CHILD_COLORS[0]);
  const [arrErr, setArrErr] = useState('');
  const [ciOpen, setCiOpen] = useState(false);
  const [mood, setMood] = useState(2);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [weight, setWeight] = useState('');

  const gest = gestFromDueDate(dueDate ?? undefined);
  const content = gest ? weekContent(gest.week) : null;
  const weights = checkins.filter((c) => c.weightKg != null);

  const trackTools = gest
    ? [
        { icon: Ic(Smile, '#2C8475'), bg: fill.mint, label: 'Daily check-in', sub: 'Log mood, symptoms & weight', fn: () => setCiOpen(true) },
        { icon: Ic(BabyBean, '#6B6FC9'), bg: fill.lilac, label: 'Week-by-week', sub: "Baby's growth & weekly tips", fn: () => router.push('/(app)/preg-week') },
        { icon: Ic(Shield, '#B04070'), bg: fill.blush, label: 'Monitoring & when to call', sub: 'Vitals and warning signs', fn: () => router.push('/(app)/preg-vitals') },
        { icon: Ic(Calendar, '#2C5F90'), bg: fill.sky, label: 'Appointments & tests', sub: 'Scans, screenings & visits', fn: () => router.push('/(app)/preg-appointments') },
      ]
    : [];
  const prepTools = gest
    ? [
        { icon: Ic(CheckCircle, '#7A5C20'), bg: fill.butter, label: 'Birth prep', sub: 'Hospital bag & birth plan', fn: () => router.push('/(app)/preg-birthprep') },
        { icon: Ic(Star, '#6B6FC9'), bg: fill.lilac, label: 'Baby names', sub: 'Explore and shortlist names', fn: () => router.push('/(app)/preg-names') },
        { icon: Ic(Activity, '#2C8475'), bg: fill.mint, label: 'Labour & movement', sub: 'Kick counter & contractions', fn: () => router.push('/(app)/kick-counter') },
        { icon: Ic(Heart, '#B04070'), bg: fill.blush, label: 'Care & support', sub: 'Wellbeing and who to lean on', fn: () => router.push('/(app)/preg-care') },
      ]
    : [];

  function confirmArrived() {
    const nm = arrName.trim();
    if (!nm) { setArrErr("Add your baby's name to continue."); return; }
    if (!birthIn.trim()) { setArrErr('Pick a birth date.'); return; }
    const id = addChild({ name: nm, color: arrColor, birthDate: birthIn.trim() });
    setActiveChild(id);
    closePregnancy(birthIn.trim()); // archive the pregnancy (read-only)
    setMaternalBirth(birthIn.trim());
    setArrivedOpen(false);
    router.replace('/(app)/maternal' as any);
  }
  function saveDue() {
    const dd = dueIn.trim() || (lmpIn.trim() ? dueDateFromLmp(lmpIn.trim()) : '');
    if (dd) setDueDate(dd);
    setDueIn(''); setLmpIn(''); setDueOpen(false);
    if (dd) toast('Due date saved');
  }
  function toggleSymptom(s: string) {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }
  function saveCheckin() {
    addCheckin({ mood, symptoms, weightKg: num(weight) });
    setMood(2); setSymptoms([]); setWeight(''); setCiOpen(false);
    toast('Check-in saved');
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}
    >
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
        <ChevronLeft size={24} color={color.ink} />
      </Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Mum&Me</Text>
      <MumMeSwitch phase="pregnancy" />

      {!gest ? (
        archived ? (
          <View style={{ gap: 14 }}>
            <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, gap: 12 }, shadow.card]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: '#E0F4EF', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={17} color={color.maternalTeal} /></View>
                <Text style={{ flex: 1, fontFamily: font.body700, fontSize: 15, color: color.ink }}>Pregnancy complete 🎉</Text>
                <View style={{ backgroundColor: '#EFEDF8', borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 10 }}><Text style={{ fontFamily: font.body700, fontSize: 11, color: color.muted }}>read-only</Text></View>
              </View>
              <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary }}>
                Born {fmtArch(archived.bornDate)} · reached week {archWeek(archived)}. This pregnancy is saved as history — your check-ins from it stay here.
              </Text>
              {archived.checkins.length > 0 && (
                <View style={{ borderTopWidth: 1, borderTopColor: color.hairline, paddingTop: 10, gap: 6 }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: color.muted }}>{archived.checkins.length} check-in{archived.checkins.length === 1 ? '' : 's'} logged</Text>
                </View>
              )}
            </View>
            <Button label="Start a new pregnancy" onPress={() => setDueOpen(true)} />
          </View>
        ) : (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 20, gap: 12 }, shadow.card]}>
          <Text style={{ fontFamily: font.body600, fontSize: 15, color: color.ink }}>Set your due date to start tracking</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary }}>
            We'll show your week, baby's size, and days to go. You can use your due date or last period date.
          </Text>
          <Button label="Set due date" onPress={() => setDueOpen(true)} />
        </View>
        )
      ) : (
        <>
          {/* Week hero */}
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

          {/* Overview stats */}
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, flexDirection: 'row' }, shadow.card]}>
            {[
              { value: String(gest.trimester), label: 'Trimester' },
              { value: String(gest.daysToGo), label: 'Days to go' },
              { value: String(checkins.length), label: checkins.length === 1 ? 'Check-in' : 'Check-ins' },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <View style={{ width: 1, backgroundColor: color.hairline, marginVertical: 2 }} />}
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontFamily: font.display700, fontSize: 22, color: color.ink }}>{s.value}</Text>
                  <Text style={{ fontFamily: font.body500, fontSize: 11.5, color: color.muted, marginTop: 2, textAlign: 'center' }}>{s.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          {/* Baby this week */}
          {content && (
            <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, gap: 14 }, shadow.card]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: fill.lilac, alignItems: 'center', justifyContent: 'center' }}>
                  <BabyBean size={30} color={color.primary} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Baby this week</Text>
                  <Text style={{ fontFamily: font.display700, fontSize: 19, color: color.ink, marginTop: 3 }}>Size of a {content.size.toLowerCase()}</Text>
                  {(content.lengthCm > 0 || content.weightG > 0) && (
                    <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary, marginTop: 1 }}>
                      {content.lengthCm > 0 ? `~${u.fmtLength(content.lengthCm, 0)}` : ''}{content.weightG > 0 ? ` · ~${u.fmtBabyWeight(content.weightG)}` : ''}
                    </Text>
                  )}
                </View>
              </View>
              <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary }}>{content.note}</Text>
              <Button label="Log daily check-in" onPress={() => setCiOpen(true)} />
            </View>
          )}

          {/* Track tools */}
          <View style={{ gap: 10 }}>
            <SectionLabel>Track</SectionLabel>
            <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, overflow: 'hidden' }, shadow.card]}>
              {trackTools.map((t, i) => (
                <ToolRow key={t.label} icon={t.icon} bg={t.bg} label={t.label} sub={t.sub} onPress={t.fn} first={i === 0} />
              ))}
            </View>
          </View>

          {/* Prepare & learn tools */}
          <View style={{ gap: 10 }}>
            <SectionLabel>Prepare &amp; learn</SectionLabel>
            <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, overflow: 'hidden' }, shadow.card]}>
              {prepTools.map((t, i) => (
                <ToolRow key={t.label} icon={t.icon} bg={t.bg} label={t.label} sub={t.sub} onPress={t.fn} first={i === 0} />
              ))}
            </View>
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
            <SectionLabel>Your check-ins</SectionLabel>
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

          {/* Manual handoff to postpartum */}
          <Pressable onPress={() => { setBirthIn(new Date().toISOString().slice(0, 10)); setArrName(''); setArrColor(CHILD_COLORS[0]); setArrErr(''); setArrivedOpen(true); }} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
            <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: color.maternalTeal }, shadow.card]}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#E0F4EF', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={22} color={color.maternalTeal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 14.5, color: color.tealInk }}>Baby has arrived 🎉</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, marginTop: 2 }}>Move into your postpartum journey</Text>
              </View>
              <ChevronRight size={16} color={color.maternalTeal} />
            </View>
          </Pressable>
        </>
      )}

      {/* Past pregnancies — kept as history even once a new pregnancy is live */}
      {gest && pregArchive.length > 0 && (
        <View style={{ gap: 8 }}>
          <SectionLabel>Past pregnancies</SectionLabel>
          {pregArchive.map((a) => (
            <View key={a.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
              <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: '#E0F4EF', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={18} color={color.maternalTeal} /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>Born {fmtArch(a.bornDate)}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>Reached week {archWeek(a)} · {a.checkins.length} check-in{a.checkins.length === 1 ? '' : 's'}</Text>
              </View>
              <View style={{ backgroundColor: '#EFEDF8', borderRadius: radius.pill, paddingVertical: 3, paddingHorizontal: 9 }}><Text style={{ fontFamily: font.body700, fontSize: 10, color: color.muted }}>read-only</Text></View>
            </View>
          ))}
        </View>
      )}

      {/* Baby-arrived modal */}
      <Modal visible={arrivedOpen} transparent animationType="fade" onRequestClose={() => setArrivedOpen(false)}>
        <Pressable onPress={() => setArrivedOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Baby has arrived 🎉</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary }}>Welcome your little one and move Mum&Me into your postpartum journey. Your pregnancy stays saved as history.</Text>
            <Field label="Baby's name" value={arrName} onChangeText={(t) => { setArrName(t); if (arrErr) setArrErr(''); }} placeholder="e.g. Oliver" autoCapitalize="words" />
            {savedNames.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {savedNames.slice(0, 8).map((n) => {
                  const sel = arrName.trim() === n.name;
                  return (
                    <Pressable key={n.id} onPress={() => { setArrName(n.name); if (arrErr) setArrErr(''); }}>
                      <View style={{ backgroundColor: sel ? color.maternalTeal : '#fff', borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1.5, borderColor: sel ? color.maternalTeal : color.hairline }}>
                        <Text style={{ fontFamily: font.body600, fontSize: 13, color: sel ? '#fff' : color.ink }}>{n.name}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
            <DateField label="Baby's birth date" value={birthIn} onChangeText={setBirthIn} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 11 }}>
              {CHILD_COLORS.map((k) => {
                const t = childToken[k]; const sel = k === arrColor;
                return (
                  <Pressable key={k} onPress={() => setArrColor(k)}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: t.fill, borderWidth: sel ? 3 : 1, borderColor: sel ? t.stroke : color.hairline, alignItems: 'center', justifyContent: 'center' }}>
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: t.stroke }} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
            {arrErr ? <Text style={{ fontFamily: font.body500, fontSize: 12.5, color: color.rose }}>{arrErr}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setArrivedOpen(false)} style={{ flex: 1 }} />
              <Button label="Welcome baby" onPress={confirmArrived} style={{ flex: 1.3 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Due date modal */}
      <Modal visible={dueOpen} transparent animationType="fade" onRequestClose={() => setDueOpen(false)}>
        <Pressable onPress={() => setDueOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Due date</Text>
            <DateField label="Due date" value={dueIn} onChangeText={setDueIn} placeholder="Pick your due date" />
            <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>Or pick your last period date and we'll estimate it:</Text>
            <DateField label="Last period" value={lmpIn} onChangeText={setLmpIn} placeholder="Pick last period date" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setDueOpen(false)} style={{ flex: 1 }} />
              <Button label="Save" onPress={saveDue} style={{ flex: 1 }} />
            </View>
            {dueDate && (
              <Pressable onPress={() => { setDueDate(null); setDueIn(''); setLmpIn(''); setDueOpen(false); }} style={{ alignItems: 'center', paddingTop: 2 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.rose }}>Remove due date</Text>
              </Pressable>
            )}
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
