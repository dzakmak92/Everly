import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button } from '../../src/components/forms';
import { ProgressBar } from '../../src/components/ui';
import { ChevronLeft } from '../../src/components/icons';
import { EPDS_QUESTIONS, scoreEpds, BAND_LABEL, CRISIS_RESOURCES } from '../../src/lib/epds';
import { useData } from '../../src/lib/store';

export default function Epds() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addEpdsResult } = useData();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(10).fill(-1));
  const [result, setResult] = useState<ReturnType<typeof scoreEpds> | null>(null);

  function choose(opt: number) {
    const next = [...answers];
    next[i] = opt;
    setAnswers(next);
    if (i < 9) {
      setI(i + 1);
    } else {
      const r = scoreEpds(next);
      setResult(r);
      addEpdsResult({ total: r.total, band: r.band, selfHarmFlag: r.selfHarmFlag });
    }
  }

  if (result) {
    const showCrisis = result.selfHarmFlag || result.band === 'likely';
    return (
      <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}>
        <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink }}>Your check-in</Text>
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 20, gap: 6 }, shadow.card]}>
          <Text style={{ fontFamily: font.display700, fontSize: 34, color: color.ink }}>{result.total} / 30</Text>
          <Text style={{ fontFamily: font.body700, fontSize: 15, color: result.band === 'likely' ? color.roseInk : result.band === 'possible' ? color.goldInk : color.tealInk }}>
            {BAND_LABEL[result.band]}
          </Text>
          <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary, marginTop: 4, lineHeight: 19 }}>
            This is a screening aid, not a diagnosis. Please share these results with your midwife, health visitor or GP — especially if your score is raised or you're worried.
          </Text>
        </View>

        {showCrisis && (
          <View style={[{ backgroundColor: '#FBE0EA', borderRadius: radius.card, padding: 18, gap: 10 }]}>
            <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.roseInk }}>You don't have to face this alone</Text>
            {result.selfHarmFlag && (
              <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.roseInk, lineHeight: 19 }}>
                You indicated thoughts of harming yourself. Please reach out now — support is available any time.
              </Text>
            )}
            {CRISIS_RESOURCES.map((r) => (
              <View key={r.name}>
                <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>{r.name}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.inkSecondary }}>{r.detail}</Text>
              </View>
            ))}
          </View>
        )}

        <Button label="Done" onPress={() => router.back()} />
      </ScrollView>
    );
  }

  const q = EPDS_QUESTIONS[i];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable onPress={() => (i === 0 ? router.back() : setI(i - 1))} style={{ width: 40, height: 40, justifyContent: 'center' }}>
          <ChevronLeft size={24} color={color.ink} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar pct={Math.round(((i) / 10) * 100)} colors={['#3A9B8A', '#2C8475']} />
        </View>
      </View>

      <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>
        Question {i + 1} of 10
      </Text>
      <Text style={{ fontFamily: font.display700, fontSize: 22, color: color.ink, lineHeight: 30 }}>{q.prompt}</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>In the past 7 days…</Text>

      <View style={{ gap: 10 }}>
        {q.options.map((opt, oi) => {
          const sel = answers[i] === oi;
          return (
            <Pressable key={oi} onPress={() => choose(oi)} style={[{ backgroundColor: sel ? color.maternalTeal : '#fff', borderRadius: radius.tile, padding: 16, borderWidth: 1, borderColor: sel ? color.maternalTeal : color.hairline }, shadow.card]}>
              <Text style={{ fontFamily: font.body600, fontSize: 14, color: sel ? '#fff' : color.ink }}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, lineHeight: 18 }}>
        There are no right or wrong answers. You can pause and come back any time. This is a screening aid, not a diagnosis.
      </Text>
    </ScrollView>
  );
}
