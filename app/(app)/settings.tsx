import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, childToken } from '../../src/theme/tokens';
import { Button, Field, Notice } from '../../src/components/forms';
import { useSupabase, signOut } from '../../src/lib/supabase';
import { useData, CHILD_COLORS, type ChildColor } from '../../src/lib/store';
import { ageLabel, stageFrom, STAGE_LABEL } from '../../src/lib/age';
import A12Settings from '../../src/screens/app/A12Settings';

export default function SettingsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, profile } = useSupabase();
  const { children, activeChild, addChild } = useData();
  const [busy, setBusy] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [colorKey, setColorKey] = useState<ChildColor>(CHILD_COLORS[0]);
  const [error, setError] = useState('');

  async function onSignOut() {
    setBusy(true);
    await signOut();
    setBusy(false);
    router.replace('/(auth)/welcome');
  }

  function openAdd() {
    setName('');
    setColorKey(CHILD_COLORS[children.length % CHILD_COLORS.length]);
    setError('');
    setAddOpen(true);
  }

  function saveChild() {
    if (!name.trim()) {
      setError("Enter the child's name.");
      return;
    }
    addChild({ name, color: colorKey });
    setAddOpen(false);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 12 }}>
        {/* Account */}
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, gap: 6 }, shadow.card]}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Account</Text>
          <Text style={{ fontFamily: font.body600, fontSize: 16, color: color.ink }}>{profile?.name || session?.user?.email}</Text>
          <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.inkSecondary }}>
            {session?.user?.email}  ·  Plan: {profile?.plan ?? 'free'}
          </Text>
        </View>

        {/* Children */}
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, gap: 12 }, shadow.card]}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Children</Text>
          {children.map((ch) => {
            const t = childToken[ch.color];
            const sel = ch.id === activeChild?.id;
            return (
              <Pressable key={ch.id} onPress={() => router.push(`/(app)/child/${ch.id}` as any)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: t.fill, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: t.stroke }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: font.body600, fontSize: 15, color: color.ink }}>{ch.name}</Text>
                  <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>
                    {ch.birthDate ? `${ageLabel(ch.birthDate)} · ${STAGE_LABEL[stageFrom(ch.birthDate)]}` : 'No birth date'}
                  </Text>
                </View>
                {sel && <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.primary }}>Active</Text>}
              </Pressable>
            );
          })}
          <Button label="+ Add child" variant="secondary" onPress={openAdd} />
        </View>

        {/* Navigation */}
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 6 }, shadow.card]}>
          {[
            { label: 'Plans & billing', to: '/(app)/plans' },
            { label: 'Routines & chores', to: '/(app)/routines' },
            { label: 'Kick counter', to: '/(app)/kick-counter' },
            { label: 'Contraction timer', to: '/(app)/contractions' },
            { label: 'Browse all designs', to: '/gallery' },
            { label: 'Admin console', to: '/(app)/admin' },
          ].map((row, i) => (
            <Pressable
              key={row.to}
              onPress={() => router.push(row.to as any)}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: color.hairline }}
            >
              <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 15, color: color.ink }}>{row.label}</Text>
              <Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>›</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Static settings design */}
      <A12Settings embedded />

      <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
        <Button label="Sign out" variant="secondary" onPress={onSignOut} loading={busy} />
      </View>

      {/* Add-child modal */}
      <Modal visible={addOpen} transparent animationType="fade" onRequestClose={() => setAddOpen(false)}>
        <Pressable onPress={() => setAddOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Add a child</Text>
            <Field label="Name" value={name} onChangeText={setName} placeholder="Name" autoCapitalize="words" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {CHILD_COLORS.map((k) => {
                const t = childToken[k];
                const sel = k === colorKey;
                return (
                  <Pressable key={k} onPress={() => setColorKey(k)}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: t.fill, borderWidth: sel ? 3 : 1, borderColor: sel ? t.stroke : color.hairline, alignItems: 'center', justifyContent: 'center' }}>
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: t.stroke }} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Notice text={error} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setAddOpen(false)} style={{ flex: 1 }} />
              <Button label="Add" onPress={saveChild} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
