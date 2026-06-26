import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, childToken } from '../../src/theme/tokens';
import { Button, Field, Notice } from '../../src/components/forms';
import { DateField } from '../../src/components/DateField';
import { ChevronRight } from '../../src/components/icons';
import { Silhouette } from '../../src/components/ui';
import { useData, CHILD_COLORS, type ChildColor } from '../../src/lib/store';
import { ageLabel, stageFrom, STAGE_LABEL } from '../../src/lib/age';

export default function Family() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { children, activeChild, setActiveChild, addChild } = useData();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [colorKey, setColorKey] = useState<ChildColor>(CHILD_COLORS[0]);
  const [error, setError] = useState('');

  function openAdd() { setName(''); setBirth(''); setColorKey(CHILD_COLORS[children.length % CHILD_COLORS.length]); setError(''); setOpen(true); }
  function save() {
    if (!name.trim()) { setError("Enter the child's name."); return; }
    addChild({ name, color: colorKey, birthDate: birth });
    setOpen(false);
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
    </ScrollView>
  );
}
