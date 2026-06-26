import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { ChevronLeft } from '../../src/components/icons';
import { useData } from '../../src/lib/store';

const COMFORT = ['Painful', 'Some pain', 'Okay', 'Comfortable'];
const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();
const DAY = 86400000;

export default function MatCare() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { momCare, addMomCare } = useData();
  const [sleepOpen, setSleepOpen] = useState(false);
  const [hrs, setHrs] = useState('');

  const todayWater = momCare.filter((m) => m.kind === 'water' && isToday(m.at)).reduce((s, m) => s + m.value, 0);
  const goalWater = 2200;
  const lastComfort = momCare.find((m) => m.kind === 'comfort');
  const weekSleep = momCare.filter((m) => m.kind === 'sleep' && new Date(m.at).getTime() >= Date.now() - 7 * DAY);
  const avgSleep = weekSleep.length ? (weekSleep.reduce((s, m) => s + m.value, 0) / weekSleep.length).toFixed(1) : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Feeding & sleep</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>For you, not the baby — your comfort, rest and hydration.</Text>

      {/* Comfort */}
      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, gap: 10 }, shadow.card]}>
        <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>Breastfeeding comfort today</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {COMFORT.map((c, i) => (
            <Pressable key={c} onPress={() => addMomCare({ kind: 'comfort', value: i })} style={{ flex: 1, paddingVertical: 10, borderRadius: radius.tile, alignItems: 'center', backgroundColor: lastComfort?.value === i && isToday(lastComfort.at) ? color.maternalTeal : color.canvas }}>
              <Text style={{ fontFamily: font.body600, fontSize: 11, color: lastComfort?.value === i && isToday(lastComfort.at) ? '#fff' : color.ink, textAlign: 'center' }}>{c}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ backgroundColor: '#FBE0EA', borderRadius: radius.tile, padding: 12 }}>
          <Text style={{ fontFamily: font.body600, fontSize: 12, color: color.roseInk }}>Mastitis watch: lump, redness, fever ≥38°C or flu-like aches → contact your GP or lactation consultant.</Text>
        </View>
      </View>

      {/* Sleep */}
      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16 }, shadow.card]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>Your sleep</Text>
            <Text style={{ fontFamily: font.display700, fontSize: 24, color: color.ink, marginTop: 2 }}>{avgSleep ? `${avgSleep}h avg` : '—'}</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>last 7 days</Text>
          </View>
          <Pressable onPress={() => { setHrs(''); setSleepOpen(true); }} style={{ paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: color.primary }}><Text style={{ fontFamily: font.body700, fontSize: 13, color: '#fff' }}>+ Log</Text></Pressable>
        </View>
      </View>

      {/* Hydration */}
      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, gap: 10 }, shadow.card]}>
        <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>Hydration today</Text>
        <Text style={{ fontFamily: font.display700, fontSize: 24, color: color.ink }}>{(todayWater / 1000).toFixed(1)}L <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>/ {goalWater / 1000}L goal</Text></Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[250, 500].map((v) => (
            <Pressable key={v} onPress={() => addMomCare({ kind: 'water', value: v })} style={{ flex: 1, paddingVertical: 11, borderRadius: radius.tile, alignItems: 'center', backgroundColor: '#DCEBFA' }}>
              <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.preconceptionSky }}>+{v} ml</Text>
            </Pressable>
          ))}
        </View>
        <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>Breastfeeding needs ~500ml extra a day.</Text>
      </View>

      <Modal visible={sleepOpen} transparent animationType="fade" onRequestClose={() => setSleepOpen(false)}>
        <Pressable onPress={() => setSleepOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Log your sleep</Text>
            <Field label="Hours last night" value={hrs} onChangeText={setHrs} placeholder="e.g. 5.5" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setSleepOpen(false)} style={{ flex: 1 }} />
              <Button label="Save" onPress={() => { const n = parseFloat(hrs); if (!isNaN(n)) addMomCare({ kind: 'sleep', value: n }); setSleepOpen(false); }} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
