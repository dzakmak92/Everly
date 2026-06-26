import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { ChevronLeft } from '../../src/components/icons';
import { useData } from '../../src/lib/store';
import { BABY_NAMES } from '../../src/lib/pregnancy';

type Filter = 'All' | 'Girl' | 'Boy' | 'Unisex';

export default function BabyNames() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { savedNames, saveName, deleteName } = useData();
  const [filter, setFilter] = useState<Filter>('All');
  const [idx, setIdx] = useState(0);

  const savedSet = new Set(savedNames.map((n) => n.name));
  const pool = BABY_NAMES.filter((n) => (filter === 'All' || n.gender === filter) && !savedSet.has(n.name));
  const card = pool[idx % Math.max(1, pool.length)];

  function next() { setIdx((i) => i + 1); }
  function save() { if (card) { saveName({ name: card.name, gender: card.gender }); } }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Baby names</Text>

      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {(['All', 'Girl', 'Boy', 'Unisex'] as Filter[]).map((f) => (
          <Pressable key={f} onPress={() => { setFilter(f); setIdx(0); }} style={{ paddingVertical: 7, paddingHorizontal: 13, borderRadius: radius.pill, backgroundColor: filter === f ? color.primary : '#fff', borderWidth: 1, borderColor: filter === f ? color.primary : color.hairline }}>
            <Text style={{ fontFamily: font.body600, fontSize: 12, color: filter === f ? '#fff' : color.ink }}>{f}</Text>
          </Pressable>
        ))}
      </View>

      {card ? (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 26, alignItems: 'center', gap: 6 }, shadow.card]}>
          <Text style={{ fontFamily: font.display700, fontSize: 34, color: color.ink }}>{card.name}</Text>
          <Text style={{ fontFamily: font.body600, fontSize: 13, color: color.primary }}>{card.gender} · {card.origin}</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary, textAlign: 'center', marginTop: 4 }}>{card.meaning}</Text>
        </View>
      ) : (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 22, alignItems: 'center' }, shadow.card]}>
          <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.muted, textAlign: 'center' }}>You've been through them all for this filter. Saved names are below.</Text>
        </View>
      )}

      {card && (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable onPress={next} style={{ flex: 1, paddingVertical: 15, borderRadius: 14, alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: color.hairline }}><Text style={{ fontFamily: font.body700, fontSize: 15, color: color.muted }}>Skip</Text></Pressable>
          <Pressable onPress={() => { save(); next(); }} style={[{ flex: 1, paddingVertical: 15, borderRadius: 14, alignItems: 'center', backgroundColor: color.accentRose }, shadow.pinkButton]}><Text style={{ fontFamily: font.body700, fontSize: 15, color: '#fff' }}>♥ Save</Text></Pressable>
        </View>
      )}

      {savedNames.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Saved · {savedNames.length}</Text>
          {savedNames.map((n) => (
            <View key={n.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center' }, shadow.card]}>
              <Text style={{ flex: 1, fontFamily: font.body700, fontSize: 15, color: color.ink }}>{n.name}</Text>
              <Text style={{ fontFamily: font.body500, fontSize: 12, color: color.muted, marginRight: 8 }}>{n.gender}</Text>
              <Pressable onPress={() => deleteName(n.id)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
