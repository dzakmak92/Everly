import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, childToken } from '../../src/theme/tokens';
import { Button, Field, Notice } from '../../src/components/forms';
import { ChevronLeft, ChevronRight } from '../../src/components/icons';
import { useSupabase, signOut } from '../../src/lib/supabase';
import { useData, CHILD_COLORS, type ChildColor } from '../../src/lib/store';
import { ageLabel, stageFrom, STAGE_LABEL } from '../../src/lib/age';

export default function SettingsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, profile } = useSupabase();
  const { children, activeChild, addChild, clearAll } = useData();
  const [busy, setBusy] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [name, setName] = useState('');
  const [colorKey, setColorKey] = useState<ChildColor>(CHILD_COLORS[0]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function onSignOut() {
    setBusy(true);
    await signOut();
    setBusy(false);
    router.replace('/(auth)/welcome');
  }
  function openAdd() {
    setName(''); setColorKey(CHILD_COLORS[children.length % CHILD_COLORS.length]); setError(''); setAddOpen(true);
  }
  function saveChild() {
    if (!name.trim()) { setError("Enter the child's name."); return; }
    addChild({ name, color: colorKey });
    setAddOpen(false);
  }

  const Card = ({ children: c, gap = 12 }: { children: React.ReactNode; gap?: number }) => (
    <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, gap }, shadow.card]}>{c}</View>
  );
  const Label = ({ children: c }: { children: React.ReactNode }) => (
    <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>{c}</Text>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 20, gap: 14 }} showsVerticalScrollIndicator={false}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Settings</Text>

      {/* Account */}
      <Card gap={8}>
        <Label>Account</Label>
        <Text style={{ fontFamily: font.body600, fontSize: 16, color: color.ink }}>{profile?.name || session?.user?.email}</Text>
        <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.inkSecondary }}>{session?.user?.email}  ·  Plan: {profile?.plan ?? 'free'}</Text>
        <Pressable onPress={() => router.push('/(app)/plans')} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <Text style={{ flex: 1, fontFamily: font.body700, fontSize: 14, color: color.primary }}>Manage plan & billing</Text>
          <ChevronRight size={16} color={color.primary} />
        </Pressable>
      </Card>

      {/* Children */}
      <Card>
        <Label>Children</Label>
        {children.length === 0 && <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>No children yet.</Text>}
        {children.map((ch) => {
          const t = childToken[ch.color];
          const sel = ch.id === activeChild?.id;
          return (
            <Pressable key={ch.id} onPress={() => router.push(`/(app)/child/${ch.id}` as any)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: t.fill, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: font.body700, fontSize: 13, color: t.stroke }}>{ch.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.body600, fontSize: 15, color: color.ink }}>{ch.name}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>{ch.birthDate ? `${ageLabel(ch.birthDate)} · ${STAGE_LABEL[stageFrom(ch.birthDate)]}` : 'No birth date'}</Text>
              </View>
              {sel && <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.primary }}>Active</Text>}
              <ChevronRight size={16} color={color.faint} />
            </Pressable>
          );
        })}
        <Button label="+ Add child" variant="secondary" onPress={openAdd} />
      </Card>

      {/* Data & privacy */}
      <Card gap={8}>
        <Label>Data & privacy</Label>
        <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary, lineHeight: 19 }}>Your family's records live on this device. Only your account and billing are stored on our servers.</Text>
        <Notice text={msg} tone="info" />
        <Button label="Clear activity log" variant="secondary" onPress={() => setConfirmWipe(true)} />
      </Card>

      <Button label="Sign out" variant="secondary" onPress={onSignOut} loading={busy} />

      {/* Add-child modal */}
      <Modal visible={addOpen} transparent animationType="fade" onRequestClose={() => setAddOpen(false)}>
        <Pressable onPress={() => setAddOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Add a child</Text>
            <Field label="Name" value={name} onChangeText={setName} placeholder="Name" autoCapitalize="words" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {CHILD_COLORS.map((k) => {
                const t = childToken[k]; const sel = k === colorKey;
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

      {/* Confirm wipe */}
      <Modal visible={confirmWipe} transparent animationType="fade" onRequestClose={() => setConfirmWipe(false)}>
        <Pressable onPress={() => setConfirmWipe(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 12 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Clear activity log?</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 13.5, color: color.inkSecondary }}>This removes logged entries and events from this device. Children, health records and milestones are kept.</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setConfirmWipe(false)} style={{ flex: 1 }} />
              <Button label="Clear" onPress={() => { clearAll(); setConfirmWipe(false); setMsg('Activity log cleared.'); }} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
