import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, childToken } from '../theme/tokens';
import { Logo } from './Logo';
import { Button, Field, Notice } from './forms';
import { useData, CHILD_COLORS, type ChildColor } from '../lib/store';
import { useSupabase } from '../lib/supabase';

/** Intro slides shown before first child creation. */
const SLIDES: { title: string; body: string; accent: string }[] = [
  { title: 'One app, from the first scan to first car.', body: 'Everly grows with your family — pregnancy, newborn, toddler, school, teen and beyond.', accent: '#6B6FC9' },
  { title: 'We carry you, not just the baby.', body: 'Mum&Me tracks your pregnancy and postpartum recovery — free, forever, and private to your device.', accent: '#3A9B8A' },
  { title: 'Grows with every stage.', body: 'Tools adapt as your child does — from night feeds to homework, chores and milestones.', accent: '#D9824F' },
  { title: 'Made for 3am.', body: 'Two-tap logging, a calm night mode, and gentle insights from your own patterns.', accent: '#54579E' },
  { title: 'Every milestone, preserved.', body: "One private story — first smile to first day of school — that's yours to keep.", accent: '#C9A33B' },
];

export function Onboarding() {
  const insets = useSafeAreaInsets();
  const { addChild } = useData();
  const { profile, session } = useSupabase();
  const parentName = profile?.name || session?.user?.email?.split('@')[0] || 'there';

  const [step, setStep] = useState(0); // 0..SLIDES.length-1 = slides, SLIDES.length = form
  const formStep = SLIDES.length;
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [colorKey, setColorKey] = useState<ChildColor>(CHILD_COLORS[0]);
  const [error, setError] = useState('');

  const total = SLIDES.length + 1;
  const onForm = step === formStep;

  function finish() {
    setError('');
    if (!name.trim()) { setError("Enter your child's name."); return; }
    addChild({ name, color: colorKey, birthDate });
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24, paddingHorizontal: 28, flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          <Logo width={24} height={28} />
          <Text style={{ fontFamily: font.display700, fontSize: 20, color: color.ink }}>Everly</Text>
        </View>
        {!onForm && (
          <Pressable onPress={() => setStep(formStep)}><Text style={{ fontFamily: font.body600, fontSize: 14, color: color.muted }}>Skip</Text></Pressable>
        )}
      </View>

      {/* Body */}
      <View style={{ flex: 1, justifyContent: 'center', gap: 18, minHeight: 360 }}>
        {!onForm ? (
          <>
            <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: SLIDES[step].accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: font.display700, fontSize: 22, color: '#fff' }}>{step + 1}</Text>
            </View>
            <Text style={{ fontFamily: font.display700, fontSize: 30, color: color.ink, lineHeight: 38 }}>{SLIDES[step].title}</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 16, color: color.inkSecondary, lineHeight: 24 }}>{SLIDES[step].body}</Text>
          </>
        ) : (
          <View style={{ gap: 16 }}>
            <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Welcome, {parentName} 👋</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 15, color: color.inkSecondary, lineHeight: 22 }}>Add your first child to get started. Everything stays on your device.</Text>
            <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Oliver" autoCapitalize="words" />
            <Field label="Birth date (optional)" value={birthDate} onChangeText={setBirthDate} placeholder="YYYY-MM-DD" />
            <View style={{ gap: 10 }}>
              <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: color.muted }}>Colour</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {CHILD_COLORS.map((k) => {
                  const t = childToken[k]; const sel = k === colorKey;
                  return (
                    <Pressable key={k} onPress={() => setColorKey(k)}>
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.fill, borderWidth: sel ? 3 : 1, borderColor: sel ? t.stroke : color.hairline, alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: t.stroke }} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <Notice text={error} />
          </View>
        )}
      </View>

      {/* Progress dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 7, marginBottom: 18 }}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} style={{ width: i === step ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: i === step ? color.primary : color.faint }} />
        ))}
      </View>

      {/* Controls */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {step > 0 && <Button label="Back" variant="secondary" onPress={() => setStep((s) => s - 1)} style={{ flex: 1 }} />}
        {!onForm ? (
          <Button label={step === SLIDES.length - 1 ? 'Get started' : 'Next'} onPress={() => setStep((s) => s + 1)} style={{ flex: 2 }} />
        ) : (
          <Button label="Create profile" onPress={finish} style={{ flex: 2 }} />
        )}
      </View>
    </ScrollView>
  );
}
