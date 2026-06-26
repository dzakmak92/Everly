import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { ChevronLeft, Check } from '../../src/components/icons';
import { useData } from '../../src/lib/store';

const parse = (s?: string | null) => { if (!s) return null; const d = new Date(`${s}T00:00:00`); return isNaN(d.getTime()) ? null : d; };
const STAGES = [
  { max: 3, name: 'Stage 1 · Weeks 0–3', note: 'Gentle reconnection. Rest is part of recovery.', ex: ['Deep core breathing — 10 breaths × 3', 'Gentle pelvic-floor squeezes — 5 holds', 'Short, slow walks'] },
  { max: 8, name: 'Stage 2 · Weeks 4–8', note: 'Walking up to 30 min is usually safe now.', ex: ['Kegel contractions — 10 holds × 10s × 3 sets', 'Deep core breathing — 10 breaths × 3', 'Gentle walking 20–30 min'] },
  { max: 999, name: 'Stage 3 · Weeks 9+', note: 'Progressive strength — listen to your body.', ex: ['Kegels with movement — 3 sets', 'Glute bridges — 10 × 3', 'Brisk walking / low-impact cardio'] },
];

export default function MatPelvic() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { maternalBirth, pelvicLog, addPelvic } = useData();
  const birth = parse(maternalBirth);
  const week = birth ? Math.floor((Date.now() - birth.getTime()) / (7 * 86400000)) : 0;
  const stage = STAGES.find((s) => week <= s.max) ?? STAGES[2];
  const runDate = birth ? new Date(birth.getTime() + 12 * 7 * 86400000) : null;
  const runWeeks = runDate ? Math.ceil((runDate.getTime() - Date.now()) / (7 * 86400000)) : null;

  const doneToday = (ex: string) => pelvicLog.some((p) => p.exercise === ex && new Date(p.at).toDateString() === new Date().toDateString());

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Pelvic floor & movement</Text>
      {!maternalBirth && <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>Set your birth date on the Mum&Me dashboard to stage the program. Showing Stage 1.</Text>}

      <View style={[{ backgroundColor: color.maternalTeal, borderRadius: radius.card, padding: 18 }, shadow.card]}>
        <Text style={{ fontFamily: font.display700, fontSize: 18, color: '#fff' }}>{stage.name}</Text>
        <Text style={{ fontFamily: font.body500, fontSize: 13, color: 'rgba(255,255,255,0.92)', marginTop: 4 }}>{stage.note}</Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Today's routine</Text>
        {stage.ex.map((ex) => {
          const done = doneToday(ex);
          return (
            <Pressable key={ex} onPress={() => !done && addPelvic(ex)} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
              <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: done ? color.maternalTeal : color.faint, backgroundColor: done ? color.maternalTeal : 'transparent', alignItems: 'center', justifyContent: 'center' }}>{done && <Check size={14} color="#fff" />}</View>
              <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 14, color: color.ink, textDecorationLine: done ? 'line-through' : 'none' }}>{ex}</Text>
              {!done && <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.primary }}>Done</Text>}
            </Pressable>
          );
        })}
      </View>

      <View style={{ backgroundColor: '#FCE6D8', borderRadius: radius.card, padding: 16 }}>
        <Text style={{ fontFamily: font.body600, fontSize: 13, color: '#B5662E' }}>Avoid crunches and planks until after your 6-week check — they can worsen abdominal separation (diastasis).</Text>
      </View>

      {runDate && (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16 }, shadow.card]}>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>Return to running</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary, marginTop: 2 }}>
            Earliest safe ≈ week 12{runWeeks && runWeeks > 0 ? ` · about ${runWeeks} week${runWeeks === 1 ? '' : 's'} away` : ' · you may be ready — check with your provider'}.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
