import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { ChevronLeft, Check } from '../../src/components/icons';
import { useData } from '../../src/lib/store';

const STARTER = ['Take folic acid daily', 'Book a preconception GP visit', 'Review medications with a doctor', 'Reduce caffeine (<200mg/day)', 'Dental check-up', 'Check rubella immunity'];
const parse = (s?: string | null) => { if (!s) return null; const d = new Date(`${s}T00:00:00`); return isNaN(d.getTime()) ? null : d; };

export default function Preconception() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lastPeriod, setLastPeriod, cycleLength, setCycleLength, ttcItems, addTtc, toggleTtc, deleteTtc } = useData();
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

  function save() { if (lp.trim()) setLastPeriod(lp.trim()); const n = parseInt(cl, 10); if (!isNaN(n)) setCycleLength(n); setOpen(false); }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Trying to conceive</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>Private cycle tracking, on your device only.</Text>

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
            <Button label="Load checklist" variant="secondary" onPress={() => STARTER.forEach(addTtc)} />
          </View>
        ) : ttcItems.map((i) => (
          <View key={i.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
            <Pressable onPress={() => toggleTtc(i.id)} style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: i.checked ? color.maternalTeal : color.faint, backgroundColor: i.checked ? color.maternalTeal : 'transparent', alignItems: 'center', justifyContent: 'center' }}>{i.checked && <Check size={14} color="#fff" />}</Pressable>
            <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 14, color: color.ink, textDecorationLine: i.checked ? 'line-through' : 'none' }}>{i.label}</Text>
            <Pressable onPress={() => deleteTtc(i.id)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>
          </View>
        ))}
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Cycle details</Text>
            <Field label="Last period start (YYYY-MM-DD)" value={lp} onChangeText={setLp} placeholder="2026-06-10" />
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
