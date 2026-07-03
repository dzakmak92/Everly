import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { ChevronLeft, Check } from '../../src/components/icons';
import { useData } from '../../src/lib/store';
import { useFeedback } from '../../src/components/Feedback';

const STARTER: { category: string; label: string }[] = [
  { category: 'For Mum', label: 'ID & maternity notes' },
  { category: 'For Mum', label: 'Comfortable nightwear' },
  { category: 'For Mum', label: 'Toiletries & lip balm' },
  { category: 'For Mum', label: 'Snacks & water bottle' },
  { category: 'For Baby', label: 'Bodysuits (newborn)' },
  { category: 'For Baby', label: 'Muslins & blanket' },
  { category: 'For Baby', label: 'Nappies & wipes' },
  { category: 'For Baby', label: 'Going-home outfit' },
  { category: 'Birth plan', label: 'Pain-relief preferences' },
  { category: 'Birth plan', label: 'Birth environment wishes' },
];

export default function BirthPrep() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { birthPrep, addBirthPrep, toggleBirthPrep, deleteBirthPrep } = useData();
  const { toast, confirm } = useFeedback();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('For Mum');

  const loadStarter = async () => {
    const norm = (s: string) => s.trim().toLowerCase();
    const have = new Set(birthPrep.map((i) => `${norm(i.category)}|${norm(i.label)}`));
    const fresh = STARTER.filter((s) => !have.has(`${norm(s.category)}|${norm(s.label)}`));
    const dupes = STARTER.length - fresh.length;
    if (dupes > 0) {
      const ok = await confirm({
        title: 'Some items are already on your list',
        message: fresh.length > 0
          ? `${dupes} of the ${STARTER.length} starter items are already there. Add the ${fresh.length} new one${fresh.length === 1 ? '' : 's'} and skip the duplicates?`
          : `All ${STARTER.length} starter items are already on your list — nothing new to add.`,
        confirmLabel: fresh.length > 0 ? 'Add new only' : 'OK',
        cancelLabel: fresh.length > 0 ? 'Cancel' : 'Close',
        accent: color.rose,
      });
      if (!ok || fresh.length === 0) return;
    }
    fresh.forEach(addBirthPrep);
    toast(`Loaded ${fresh.length} item${fresh.length === 1 ? '' : 's'}`);
  };

  const cats = Array.from(new Set([...birthPrep.map((i) => i.category)]));
  const done = birthPrep.filter((i) => i.checked).length;
  const pct = birthPrep.length ? Math.round((done / birthPrep.length) * 100) : 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
        {birthPrep.length > 0 && <Pressable onPress={() => { setLabel(''); setOpen(true); }}><Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>+ Add</Text></Pressable>}
      </View>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Birth prep</Text>

      {birthPrep.length === 0 ? (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 20, gap: 12 }, shadow.card]}>
          <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.inkSecondary }}>Start with a hospital-bag & birth-plan checklist you can tick off and add to.</Text>
          <Button label="Load starter checklist" onPress={loadStarter} />
        </View>
      ) : (
        <>
          <View style={[{ backgroundColor: color.maternalTeal, borderRadius: radius.card, padding: 16 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 22, color: '#fff' }}>{done} / {birthPrep.length} done · {pct}%</Text>
          </View>
          {cats.map((cat) => (
            <View key={cat} style={{ gap: 8 }}>
              <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>{cat}</Text>
              {birthPrep.filter((i) => i.category === cat).map((i) => (
                <View key={i.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
                  <Pressable onPress={() => toggleBirthPrep(i.id)} style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: i.checked ? color.maternalTeal : color.faint, backgroundColor: i.checked ? color.maternalTeal : 'transparent', alignItems: 'center', justifyContent: 'center' }}>{i.checked && <Check size={14} color="#fff" />}</Pressable>
                  <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 14, color: color.ink, textDecorationLine: i.checked ? 'line-through' : 'none' }}>{i.label}</Text>
                  <Pressable onPress={() => deleteBirthPrep(i.id)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>
                </View>
              ))}
            </View>
          ))}
        </>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Add item</Text>
            <Field label="Item" value={label} onChangeText={setLabel} placeholder="e.g. Phone charger" autoCapitalize="sentences" />
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {['For Mum', 'For Baby', 'Birth plan'].map((c) => (
                <Pressable key={c} onPress={() => setCategory(c)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: category === c ? color.primary : '#fff', borderWidth: 1, borderColor: category === c ? color.primary : color.hairline }}>
                  <Text style={{ fontFamily: font.body600, fontSize: 12, color: category === c ? '#fff' : color.ink }}>{c}</Text>
                </Pressable>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setOpen(false)} style={{ flex: 1 }} />
              <Button label="Add" onPress={() => { if (label.trim()) { addBirthPrep({ category, label }); setLabel(''); setOpen(false); toast('Item added'); return; } setLabel(''); setOpen(false); }} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
