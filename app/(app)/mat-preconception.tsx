import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, childToken } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { DateField } from '../../src/components/DateField';
import { ChevronLeft, ChevronRight, Check } from '../../src/components/icons';
import { useData } from '../../src/lib/store';
import { useFeedback } from '../../src/components/Feedback';
import { useEntitlement } from '../../src/lib/entitlement';
import { gestFromDueDate } from '../../src/lib/pregnancy';
import { ageLabel, stageFrom, STAGE_LABEL } from '../../src/lib/age';

const STARTER = ['Take folic acid daily', 'Book a preconception GP visit', 'Review medications with a doctor', 'Reduce caffeine (<200mg/day)', 'Dental check-up', 'Check rubella immunity'];
const parse = (s?: string | null) => { if (!s) return null; const d = new Date(`${s}T00:00:00`); return isNaN(d.getTime()) ? null : d; };

type Tab = 'ttc' | 'again';

export default function Preconception() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(params.tab === 'again' ? 'again' : 'ttc');

  const { lastPeriod, setLastPeriod, cycleLength, setCycleLength, ttcItems, addTtc, toggleTtc, deleteTtc, dueDate, children } = useData();
  const { toast, confirm } = useFeedback();
  const { isPremium } = useEntitlement();

  const [open, setOpen] = useState(false);
  const [lp, setLp] = useState('');
  const [cl, setCl] = useState(String(cycleLength));

  const d = parse(lastPeriod);
  let cycleDay: number | null = null, status = '';
  if (d) {
    cycleDay = Math.floor((Date.now() - d.getTime()) / 86400000) % cycleLength + 1;
    const ovDay = cycleLength - 14;
    if (cycleDay >= ovDay - 5 && cycleDay <= ovDay + 1) status = 'Fertile window — a good time to try';
    else if (cycleDay < ovDay - 5) status = `Fertile window approaching (around day ${ovDay - 5})`;
    else status = 'Post-ovulation phase';
  }
  const done = ttcItems.filter((i) => i.checked).length;

  function save() { if (lp.trim()) setLastPeriod(lp.trim()); const n = parseInt(cl, 10); if (!isNaN(n)) setCycleLength(n); setOpen(false); toast('Saved'); }

  const loadChecklist = async () => {
    const norm = (s: string) => s.trim().toLowerCase();
    const have = new Set(ttcItems.map((i) => norm(i.label)));
    const fresh = STARTER.filter((s) => !have.has(norm(s)));
    const dupes = STARTER.length - fresh.length;
    if (dupes > 0) {
      const ok = await confirm({
        title: 'Some items are already on your list',
        message: fresh.length > 0
          ? `${dupes} of the ${STARTER.length} items are already there. Add the ${fresh.length} new one${fresh.length === 1 ? '' : 's'} and skip duplicates?`
          : `All ${STARTER.length} items are already on your list — nothing new to add.`,
        confirmLabel: fresh.length > 0 ? 'Add new only' : 'OK',
        cancelLabel: fresh.length > 0 ? 'Cancel' : 'Close',
        accent: color.rose,
      });
      if (!ok || fresh.length === 0) return;
    }
    fresh.forEach(addTtc);
    toast(`Loaded ${fresh.length} item${fresh.length === 1 ? '' : 's'}`);
  };

  const gest = gestFromDueDate(dueDate ?? undefined);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Planning your next</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>Everything stays private, on your device only.</Text>

      {/* Segmented tab control */}
      <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: radius.pill, padding: 4, ...shadow.card }}>
        {([['ttc', 'Trying to conceive'], ['again', 'Pregnant again']] as [Tab, string][]).map(([key, label]) => {
          const active = tab === key;
          return (
            <Pressable key={key} onPress={() => setTab(key)} style={{ flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: 'center', backgroundColor: active ? color.primary : 'transparent' }}>
              <Text style={{ fontFamily: font.body700, fontSize: 13, color: active ? '#fff' : color.muted }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'ttc' ? (
        <>
          {!d ? (
            <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 20, gap: 12 }, shadow.card]}>
              <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.inkSecondary }}>Add your last period date to estimate your fertile window.</Text>
              <Button label="Set cycle details" onPress={() => { setLp(lastPeriod ?? ''); setCl(String(cycleLength)); setOpen(true); }} />
            </View>
          ) : (
            <View style={[{ backgroundColor: color.preconceptionSky, borderRadius: radius.card, padding: 20 }, shadow.card]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={{ fontFamily: font.display700, fontSize: 26, color: '#fff' }}>Cycle day {cycleDay}</Text>
                  <Text style={{ fontFamily: font.body500, fontSize: 13, color: 'rgba(255,255,255,0.92)', marginTop: 2 }}>{status}</Text>
                </View>
                <Pressable onPress={() => { setLp(lastPeriod ?? ''); setCl(String(cycleLength)); setOpen(true); }}><Text style={{ fontFamily: font.body700, fontSize: 12, color: 'rgba(255,255,255,0.92)' }}>Edit</Text></Pressable>
              </View>
            </View>
          )}

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Preconception checklist {ttcItems.length > 0 ? `· ${done}/${ttcItems.length}` : ''}</Text>
            </View>
            {ttcItems.length === 0 ? (
              <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, gap: 10 }, shadow.card]}>
                <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.inkSecondary }}>A few evidence-based steps to prepare.</Text>
                <Button label="Load checklist" variant="secondary" onPress={loadChecklist} />
              </View>
            ) : ttcItems.map((i) => (
              <View key={i.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
                <Pressable onPress={() => toggleTtc(i.id)} style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: i.checked ? color.maternalTeal : color.faint, backgroundColor: i.checked ? color.maternalTeal : 'transparent', alignItems: 'center', justifyContent: 'center' }}>{i.checked && <Check size={14} color="#fff" />}</Pressable>
                <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 14, color: color.ink, textDecorationLine: i.checked ? 'line-through' : 'none' }}>{i.label}</Text>
                <Pressable onPress={() => deleteTtc(i.id)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>
              </View>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>A new pregnancy runs free alongside your children's tracking — no conflict.</Text>

          {/* You / pregnancy */}
          <Pressable onPress={() => router.push('/(app)/pregnancy')}>
            <View style={[{ backgroundColor: color.maternalTeal, borderRadius: radius.card, padding: 18 }, shadow.card]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontFamily: font.body600, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>YOU · Free forever</Text>
                  <Text style={{ fontFamily: font.display700, fontSize: 22, color: '#fff', marginTop: 2 }}>
                    {gest ? `Pregnant · Week ${gest.week}` : 'Set up your pregnancy'}
                  </Text>
                  {gest && <Text style={{ fontFamily: font.body500, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>{gest.daysToGo} days to go</Text>}
                </View>
                <ChevronRight size={20} color="#fff" />
              </View>
            </View>
          </Pressable>

          {/* Children */}
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Your children</Text>
          {children.length === 0 ? (
            <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, alignItems: 'center' }, shadow.card]}>
              <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>No children added yet.</Text>
            </View>
          ) : children.map((ch) => {
            const t = childToken[ch.color];
            return (
              <Pressable key={ch.id} onPress={() => router.push(`/(app)/child/${ch.id}` as any)}>
                <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.fill, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: font.display700, fontSize: 18, color: t.stroke }}>{ch.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: font.body700, fontSize: 16, color: color.ink }}>{ch.name}</Text>
                    <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>{ch.birthDate ? `${ageLabel(ch.birthDate)} · ${STAGE_LABEL[stageFrom(ch.birthDate)]}` : 'Tap to view'}</Text>
                  </View>
                  <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: isPremium ? '#E7E4FB' : color.canvas }}>
                    <Text style={{ fontFamily: font.body700, fontSize: 10, color: isPremium ? color.primary : color.muted }}>{isPremium ? 'PRO' : 'FREE'}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Cycle details</Text>
            <DateField label="Last period start" value={lp} onChangeText={setLp} placeholder="Pick last period date" />
            <Field label="Average cycle length (days)" value={cl} onChangeText={setCl} placeholder="28" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setOpen(false)} style={{ flex: 1 }} />
              <Button label="Save" onPress={save} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
