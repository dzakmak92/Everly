import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, childToken } from '../../../src/theme/tokens';
import { Button, Field, Notice } from '../../../src/components/forms';
import { DateField } from '../../../src/components/DateField';
import { ChevronRight } from '../../../src/components/icons';
import { Silhouette } from '../../../src/components/ui';
import { useData, CHILD_COLORS, type ChildColor } from '../../../src/lib/store';
import { ageLabel, stageFrom, STAGE_LABEL } from '../../../src/lib/age';
import { useFeedback } from '../../../src/components/Feedback';

const ROLES = ['Partner', 'Co-parent', 'Grandparent', 'Carer', 'Other'];
const ROLE_STYLE: Record<string, { emoji: string; bg: string; fg: string }> = {
  Partner: { emoji: '🧑', bg: '#DCEBFA', fg: '#2C5F90' },
  'Co-parent': { emoji: '👨‍👩‍👧', bg: '#E7E4FB', fg: '#6B6FC9' },
  Grandparent: { emoji: '👵', bg: '#FBF1CE', fg: '#7A5C20' },
  Carer: { emoji: '🧑‍🍼', bg: '#FBE0EA', fg: '#B04070' },
  Other: { emoji: '👤', bg: '#D8F0E6', fg: '#2C8475' },
};
const roleStyle = (r?: string) => ROLE_STYLE[r ?? 'Other'] ?? ROLE_STYLE.Other;

export default function Family() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { children, activeChild, setActiveChild, addChild, caregivers, addCaregiver, deleteCaregiver } = useData();
  const { toast } = useFeedback();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [colorKey, setColorKey] = useState<ChildColor>(CHILD_COLORS[0]);
  const [error, setError] = useState('');

  // Family member (partner, grandparent, carer…) modal.
  const [memberOpen, setMemberOpen] = useState(false);
  const [mName, setMName] = useState('');
  const [mRole, setMRole] = useState('Partner');
  const [mErr, setMErr] = useState('');

  function openAdd() { setName(''); setBirth(''); setColorKey(CHILD_COLORS[children.length % CHILD_COLORS.length]); setError(''); setOpen(true); }
  function save() {
    if (!name.trim()) { setError("Enter the child's name."); return; }
    addChild({ name, color: colorKey, birthDate: birth });
    setOpen(false);
    toast('Child added');
  }
  function openMember() { setMName(''); setMRole('Partner'); setMErr(''); setMemberOpen(true); }
  function saveMember() {
    if (!mName.trim()) { setMErr("Enter the person's name."); return; }
    addCaregiver(mName, mRole);
    setMemberOpen(false);
    toast('Member added');
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 28, paddingHorizontal: 20, gap: 14 }} showsVerticalScrollIndicator={false}>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Family</Text>

      {children.length === 0 ? (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 22, gap: 12, alignItems: 'center' }, shadow.card]}>
          <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.muted, textAlign: 'center' }}>No children yet. Add your first to start tracking.</Text>
          <Button label="+ Add child" onPress={openAdd} />
        </View>
      ) : (
        <>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Children</Text>
          {children.map((ch) => {
            const t = childToken[ch.color];
            const sel = ch.id === activeChild?.id;
            return (
              <Pressable key={ch.id} onPress={() => router.push(`/(app)/child/${ch.id}` as any)}>
                <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }, shadow.card]}>
                  <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: t.fill, alignItems: 'center', justifyContent: 'center' }}>
                    <Silhouette size={26} fill={t.stroke} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>{ch.name}</Text>
                      {sel && <View style={{ backgroundColor: t.fill, borderRadius: 999, paddingVertical: 2, paddingHorizontal: 8 }}><Text style={{ fontFamily: font.body700, fontSize: 10, color: t.stroke }}>ACTIVE</Text></View>}
                    </View>
                    <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted, marginTop: 2 }}>
                      {ch.birthDate ? `${ageLabel(ch.birthDate)} · ${STAGE_LABEL[stageFrom(ch.birthDate)]}` : 'No birth date'}
                    </Text>
                  </View>
                  {!sel && <Pressable onPress={() => setActiveChild(ch.id)} hitSlop={8} style={{ paddingHorizontal: 6 }}><Text style={{ fontFamily: font.body700, fontSize: 12, color: color.primary }}>Set active</Text></Pressable>}
                  <ChevronRight size={18} color={color.faint} />
                </View>
              </Pressable>
            );
          })}
          <Button label="+ Add child" variant="secondary" onPress={openAdd} />
        </>
      )}

      {/* Family & caregivers */}
      <View style={{ gap: 10, marginTop: 6 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Family &amp; caregivers</Text>
        {caregivers.length === 0 ? (
          <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>Add your partner, grandparents or a carer — they'll appear in co-parent and custody tools too.</Text>
        ) : caregivers.map((cg) => {
          const rs = roleStyle(cg.role);
          return (
            <View key={cg.id} style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }, shadow.card]}>
              <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: rs.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 22 }}>{rs.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 16, color: color.ink }}>{cg.name}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, marginTop: 2 }}>{cg.role ?? 'Caregiver'}</Text>
              </View>
              <Pressable onPress={() => deleteCaregiver(cg.id)} hitSlop={8} style={{ paddingHorizontal: 4 }}><Text style={{ fontFamily: font.body700, fontSize: 20, color: color.faint }}>×</Text></Pressable>
            </View>
          );
        })}
        <Button label="+ Add family member" variant="secondary" onPress={openMember} />
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Add a child</Text>
            <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Oliver" autoCapitalize="words" />
            <DateField label="Birth date (optional)" value={birth} onChangeText={setBirth} optional />
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
              <Button label="Cancel" variant="secondary" onPress={() => setOpen(false)} style={{ flex: 1 }} />
              <Button label="Add" onPress={save} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add family member modal */}
      <Modal visible={memberOpen} transparent animationType="fade" onRequestClose={() => setMemberOpen(false)}>
        <Pressable onPress={() => setMemberOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Add family member</Text>
            <Field label="Name" value={mName} onChangeText={(t) => { setMName(t); if (mErr) setMErr(''); }} placeholder="e.g. James" autoCapitalize="words" />
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: color.muted }}>Relationship</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {ROLES.map((r) => {
                  const sel = r === mRole;
                  return (
                    <Pressable key={r} onPress={() => setMRole(r)} style={{ paddingVertical: 8, paddingHorizontal: 13, borderRadius: radius.pill, backgroundColor: sel ? color.primary : '#fff', borderWidth: 1, borderColor: sel ? color.primary : color.hairline }}>
                      <Text style={{ fontFamily: font.body600, fontSize: 12.5, color: sel ? '#fff' : color.ink }}>{r}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <Notice text={mErr} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setMemberOpen(false)} style={{ flex: 1 }} />
              <Button label="Add" onPress={saveMember} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
