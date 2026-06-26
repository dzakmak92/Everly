import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font, childToken } from '../theme/tokens';
import { Logo } from './Logo';
import { Field } from './forms';
import { DateField } from './DateField';
import { useData, CHILD_COLORS, type ChildColor } from '../lib/store';
import { useSupabase } from '../lib/supabase';
import { dueDateFromLmp } from '../lib/pregnancy';
import { FamilyGrows, HerHealth, ThreeSprouts, NightClock, StoryJournal, type ArtProps } from './OnboardingArt';

/* Botanical palette (style E) — calm cream & sage. */
const E = {
  cream: '#F4F1E9',
  ink: '#43483f',
  body: '#76796c',
  muted: '#a7a18c',
  sage: '#7FA98F',
  sageBtn: '#8FB79E',
  sageBtnInk: '#2e4636',
  hair: '#E4DECB',
};

type Slide = { Art: React.ComponentType<ArtProps>; tint: string; kicker: string; title: string; body: string };
const SLIDES: Slide[] = [
  { Art: FamilyGrows, tint: '#EFEDFA', kicker: 'From scan to first car', title: 'One app, for every\nchapter ahead.', body: 'Everly grows with your family — pregnancy, newborn, toddler, school, teen and beyond.' },
  { Art: HerHealth, tint: '#FBEEF4', kicker: 'Mum & Me', title: 'We carry you,\nnot just the baby.', body: 'Track your pregnancy and postpartum recovery — free, forever, and private to your device.' },
  { Art: ThreeSprouts, tint: '#EAF6F0', kicker: 'Every stage', title: 'Tools that adapt\nas your child does.', body: 'From night feeds to homework, chores and milestones — the right tools at the right time.' },
  { Art: NightClock, tint: '#EAF4FB', kicker: 'Made for 3am', title: 'Two taps, then\nback to sleep.', body: 'A calm night mode, two-tap logging, and gentle insights from your own patterns.' },
  { Art: StoryJournal, tint: '#F0EEFB', kicker: 'Your keepsake', title: 'Every milestone,\npreserved.', body: "One private story — first smile to first day of school — that's yours to keep." },
];

function SageButton({ label, onPress, kind = 'primary', style }: { label: string; onPress: () => void; kind?: 'primary' | 'ghost'; style?: any }) {
  const primary = kind === 'primary';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ borderRadius: 30, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: primary ? E.sageBtn : 'transparent', borderWidth: primary ? 0 : 1.5, borderColor: '#cdc6b2', opacity: pressed ? 0.85 : 1 }, style]}>
      <Text style={{ fontFamily: font.body700, fontSize: 16, color: primary ? E.sageBtnInk : '#7a7563' }}>{label}</Text>
    </Pressable>
  );
}

export function Onboarding() {
  const insets = useSafeAreaInsets();
  const { addChild, setDueDate } = useData();
  const { profile, session } = useSupabase();
  const parentName = profile?.name || session?.user?.email?.split('@')[0] || 'there';
  const niceName = parentName.charAt(0).toUpperCase() + parentName.slice(1);

  const [step, setStep] = useState(0); // 0..SLIDES.length-1 = slides, SLIDES.length = form
  const formStep = SLIDES.length;
  const [mode, setMode] = useState<'child' | 'expecting'>('child');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [colorKey, setColorKey] = useState<ChildColor>(CHILD_COLORS[0]);
  const [dueIn, setDueIn] = useState('');
  const [lmpIn, setLmpIn] = useState('');
  const [error, setError] = useState('');

  const total = SLIDES.length + 1;
  const onForm = step === formStep;
  const slide = SLIDES[step];

  function finish() {
    setError('');
    if (mode === 'expecting') {
      const dd = dueIn.trim() || (lmpIn.trim() ? dueDateFromLmp(lmpIn.trim()) : '');
      if (!dd) { setError('Add your due date, or your last period date.'); return; }
      setDueDate(dd);
      return;
    }
    if (!name.trim()) { setError("Enter your child's name."); return; }
    addChild({ name, color: colorKey, birthDate });
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: E.cream }}
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 22, paddingHorizontal: 32, flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          <Logo width={22} height={26} />
          <Text style={{ fontFamily: font.display700, fontSize: 19, color: E.ink }}>Everly</Text>
        </View>
        {!onForm && (
          <Pressable onPress={() => setStep(formStep)} hitSlop={10}><Text style={{ fontFamily: font.body600, fontSize: 14, color: E.muted }}>Skip</Text></Pressable>
        )}
      </View>

      {/* Body */}
      <View style={{ flex: 1, justifyContent: 'center', minHeight: 400 }}>
        {!onForm ? (
          <View style={{ alignItems: 'center', gap: 0 }}>
            <View style={{ width: 168, height: 168, borderRadius: 84, backgroundColor: slide.tint, alignItems: 'center', justifyContent: 'center' }}>
              <slide.Art size={112} />
            </View>
            <Text style={{ fontFamily: font.body700, fontSize: 12, letterSpacing: 2.4, textTransform: 'uppercase', color: E.sage, marginTop: 28, textAlign: 'center' }}>{slide.kicker}</Text>
            <Text style={{ fontFamily: font.display700, fontSize: 30, lineHeight: 36, color: E.ink, marginTop: 12, textAlign: 'center' }}>{slide.title}</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 15.5, lineHeight: 24, color: E.body, marginTop: 14, textAlign: 'center', maxWidth: 320 }}>{slide.body}</Text>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            <Text style={{ fontFamily: font.display700, fontSize: 27, color: E.ink }}>Welcome, {niceName} 👋</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 15, color: E.body, lineHeight: 22 }}>How would you like to start? Everything stays on your device.</Text>

            {/* Path chooser */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 2 }}>
              {([
                { k: 'child', title: 'My child is here', sub: 'Track from newborn to teen' },
                { k: 'expecting', title: "I'm expecting", sub: 'Start your Mum&Me journey' },
              ] as const).map((opt) => {
                const sel = mode === opt.k;
                return (
                  <Pressable key={opt.k} onPress={() => { setMode(opt.k); setError(''); }} style={{ flex: 1 }}>
                    <View style={{ borderRadius: 18, padding: 15, gap: 4, backgroundColor: '#fff', borderWidth: 2, borderColor: sel ? E.sage : E.hair }}>
                      <Text style={{ fontFamily: font.body700, fontSize: 14, color: sel ? '#5d8a6c' : E.ink }}>{opt.title}</Text>
                      <Text style={{ fontFamily: font.body400, fontSize: 12, color: '#8d8975', lineHeight: 16 }}>{opt.sub}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {mode === 'child' ? (
              <>
                <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Oliver" autoCapitalize="words" />
                <DateField label="Birth date (optional)" value={birthDate} onChangeText={setBirthDate} optional />
                <View style={{ gap: 10 }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: E.muted }}>Colour</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    {CHILD_COLORS.map((k) => {
                      const t = childToken[k]; const sel = k === colorKey;
                      return (
                        <Pressable key={k} onPress={() => setColorKey(k)}>
                          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.fill, borderWidth: sel ? 3 : 1, borderColor: sel ? t.stroke : E.hair, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: t.stroke }} />
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </>
            ) : (
              <>
                <DateField label="Due date" value={dueIn} onChangeText={setDueIn} />
                <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: '#8d8975' }}>Don't know it yet? Add the first day of your last period instead and we'll estimate it.</Text>
                <DateField label="Last period (optional)" value={lmpIn} onChangeText={setLmpIn} optional />
              </>
            )}
            {error ? <Text style={{ fontFamily: font.body500, fontSize: 13, color: '#C0607F' }}>{error}</Text> : null}
          </View>
        )}
      </View>

      {/* Progress dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 7, marginBottom: 20 }}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} style={{ width: i === step ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: i === step ? E.sage : 'rgba(127,169,143,0.28)' }} />
        ))}
      </View>

      {/* Controls */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {step > 0 && <SageButton label="Back" kind="ghost" onPress={() => setStep((s) => s - 1)} style={{ flex: 0.7 }} />}
        {!onForm ? (
          <SageButton label={step === SLIDES.length - 1 ? 'Get started' : 'Continue'} onPress={() => setStep((s) => s + 1)} style={{ flex: 2 }} />
        ) : (
          <SageButton label={mode === 'expecting' ? 'Start Mum&Me' : 'Create profile'} onPress={finish} style={{ flex: 2 }} />
        )}
      </View>
    </ScrollView>
  );
}
