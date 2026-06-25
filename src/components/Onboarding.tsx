import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, childToken } from '../theme/tokens';
import { Logo } from './Logo';
import { Button, Field, Notice } from './forms';
import { useData, CHILD_COLORS, type ChildColor } from '../lib/store';
import { useSupabase } from '../lib/supabase';

/**
 * First-run setup, shown when the device has no children yet. Creates the
 * first child profile on-device; once saved, the app shell takes over.
 */
export function Onboarding() {
  const insets = useSafeAreaInsets();
  const { addChild } = useData();
  const { profile, session } = useSupabase();
  const parentName = profile?.name || session?.user?.email?.split('@')[0] || 'there';

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [colorKey, setColorKey] = useState<ChildColor>(CHILD_COLORS[0]);
  const [error, setError] = useState('');

  function finish() {
    setError('');
    if (!name.trim()) {
      setError("Enter your child's name.");
      return;
    }
    addChild({ name, color: colorKey, birthDate });
    // children becomes non-empty → the app layout swaps to the tab shell.
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 28, paddingHorizontal: 28, gap: 22 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Logo width={28} height={32} color={color.primary} />
        <Text style={{ fontFamily: font.display700, fontSize: 22, color: color.ink }}>Everly</Text>
      </View>

      {step === 0 ? (
        <View style={{ gap: 16 }}>
          <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink, lineHeight: 36 }}>
            Welcome, {parentName} 👋
          </Text>
          <Text style={{ fontFamily: font.body400, fontSize: 15, color: color.inkSecondary, lineHeight: 23 }}>
            Let's set up your family. Add your first child to start tracking sleep,
            feeds, health and milestones — all kept privately on your device.
          </Text>
          <Button label="Get started" onPress={() => setStep(1)} />
        </View>
      ) : (
        <View style={{ gap: 18 }}>
          <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink }}>Add your child</Text>

          <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Oliver" autoCapitalize="words" />
          <Field label="Birth date (optional)" value={birthDate} onChangeText={setBirthDate} placeholder="YYYY-MM-DD" />

          <View style={{ gap: 10 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: color.muted }}>
              Colour
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {CHILD_COLORS.map((k) => {
                const t = childToken[k];
                const sel = k === colorKey;
                return (
                  <Pressable key={k} onPress={() => setColorKey(k)}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: t.fill,
                        borderWidth: sel ? 3 : 1,
                        borderColor: sel ? t.stroke : color.hairline,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: t.stroke }} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Notice text={error} />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Back" variant="secondary" onPress={() => setStep(0)} style={{ flex: 1 }} />
            <Button label="Create profile" onPress={finish} style={{ flex: 1 }} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
