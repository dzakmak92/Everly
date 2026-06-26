import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, childToken } from '../../src/theme/tokens';
import { Button, Field, Notice } from '../../src/components/forms';
import { ChevronRight, ChevronLeft, Shield, Star, Plus, Check } from '../../src/components/icons';
import { Silhouette } from '../../src/components/ui';
import { useSupabase, signOut } from '../../src/lib/supabase';
import { useData, CHILD_COLORS, type ChildColor } from '../../src/lib/store';
import { ageLabel, stageFrom, STAGE_LABEL } from '../../src/lib/age';

const PLAN_PILL: Record<string, string> = { free: 'Free', pro: 'Pro', family: 'Family', lifetime: 'Lifetime' };

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: color.muted, paddingLeft: 4, marginTop: 6 }}>
      {children}
    </Text>
  );
}

function IconBox({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <View style={{ width: 34, height: 34, backgroundColor: bg, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </View>
  );
}

export default function SettingsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, profile } = useSupabase();
  const { children, activeChild, setActiveChild, addChild, clearAll } = useData();
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

  const planKey = profile?.plan ?? 'free';
  const planLabel = PLAN_PILL[planKey] ?? 'Free';
  const displayName = profile?.name || session?.user?.email || 'Your account';
  const email = session?.user?.email ?? '';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28, paddingHorizontal: 20, gap: 12 }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} hitSlop={8} style={{ width: 40, height: 40, justifyContent: 'center' }}>
        <ChevronLeft size={24} color={color.ink} />
      </Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 24, color: color.ink, marginBottom: 6 }}>Settings</Text>

      {/* Account card — avatar + name/email + plan pill */}
      <View style={[{ backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }, shadow.card]}>
        <View style={{ width: 52, height: 52, backgroundColor: '#E7E4FB', borderRadius: 26, alignItems: 'center', justifyContent: 'center' }}>
          <Silhouette size={28} fill="#6B6FC9" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 16, color: color.ink }} numberOfLines={1}>{displayName}</Text>
          {email ? <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 4 }} numberOfLines={1}>{email}</Text> : null}
        </View>
        <View style={{ backgroundColor: '#E7E4FB', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, color: '#6B6FC9' }}>{planLabel}</Text>
        </View>
      </View>

      {/* Plan & Billing */}
      <View style={[{ backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden' }, shadow.card]}>
        <Pressable
          onPress={() => router.push('/(app)/plans')}
          style={({ pressed }) => ({ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.7 : 1 })}
        >
          <IconBox bg="#FBF1CE"><Star size={16} color="#C9A33B" /></IconBox>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>Plan & Billing</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted, marginTop: 3 }}>{`Current plan: ${planLabel}`}</Text>
          </View>
          <ChevronRight size={16} color="#9C9AB2" />
        </Pressable>
      </View>

      {/* Children */}
      <SectionHeader>Children</SectionHeader>
      <View style={[{ backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden' }, shadow.card]}>
        {children.length === 0 && (
          <View style={{ paddingVertical: 16, paddingHorizontal: 16 }}>
            <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>No children yet.</Text>
          </View>
        )}
        {children.map((ch, i) => {
          const t = childToken[ch.color];
          const sel = ch.id === activeChild?.id;
          return (
            <Pressable
              key={ch.id}
              onPress={() => router.push(`/(app)/child/${ch.id}` as any)}
              style={({ pressed }) => ({
                paddingVertical: 12,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                borderBottomWidth: i < children.length - 1 ? 1 : 0,
                borderBottomColor: 'rgba(51,50,74,0.05)',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: t.fill, alignItems: 'center', justifyContent: 'center' }}>
                <Silhouette size={18} fill={t.stroke} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>{ch.name}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted, marginTop: 3 }}>
                  {ch.birthDate ? `${ageLabel(ch.birthDate)} · ${STAGE_LABEL[stageFrom(ch.birthDate)]}` : 'No birth date'}
                </Text>
              </View>
              {sel ? (
                <View style={{ backgroundColor: '#E7E4FB', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Check size={10} color="#6B6FC9" />
                  <Text style={{ fontFamily: font.body700, fontSize: 10, color: '#6B6FC9' }}>Active</Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => setActiveChild(ch.id)}
                  hitSlop={8}
                  style={({ pressed }) => ({ paddingVertical: 4, paddingHorizontal: 9, opacity: pressed ? 0.6 : 1 })}
                >
                  <Text style={{ fontFamily: font.body700, fontSize: 11, color: color.primary }}>Set active</Text>
                </Pressable>
              )}
              <ChevronRight size={16} color="#9C9AB2" />
            </Pressable>
          );
        })}
        <Pressable
          onPress={openAdd}
          style={({ pressed }) => ({
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderTopWidth: children.length > 0 ? 1 : 0,
            borderTopColor: 'rgba(51,50,74,0.05)',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <IconBox bg="#E7E4FB"><Plus size={16} color="#6B6FC9" strokeWidth={2.5} /></IconBox>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary, flex: 1 }}>Add child</Text>
        </Pressable>
      </View>

      {/* Data & Privacy */}
      <SectionHeader>Data & Privacy</SectionHeader>
      <View style={{ backgroundColor: '#E7E4FB', borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
        <Shield size={18} color="#6B6FC9" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: '#54579E', marginBottom: 4 }}>Your data lives on this device</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 11, lineHeight: 16.5, color: '#6B6FC9' }}>No cloud, no tracking. You control everything.</Text>
        </View>
      </View>
      <View style={[{ backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden' }, shadow.card]}>
        {msg ? (
          <View style={{ paddingTop: 14, paddingHorizontal: 16 }}>
            <Notice text={msg} tone="info" />
          </View>
        ) : null}
        <Pressable
          onPress={() => setConfirmWipe(true)}
          style={({ pressed }) => ({ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: pressed ? 0.7 : 1 })}
        >
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: '#E98FB3' }}>Clear activity log</Text>
          <ChevronRight size={16} color="#E98FB3" />
        </Pressable>
      </View>

      <View style={{ marginTop: 6 }}>
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
