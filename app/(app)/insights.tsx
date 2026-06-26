import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Leaf } from '../../src/components/icons';
import { useData } from '../../src/lib/store';

const DAY = 86400000;

export default function Insights() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entries, savedTips, saveTip, deleteTip } = useData();

  const now = Date.now();
  const inRange = (e: { at: string }, a: number, b: number) => { const t = new Date(e.at).getTime(); return t >= now - b && t < now - a; };
  const sleepMin = (a: number, b: number) => entries.filter((e) => e.kind === 'sleep' && inRange(e, a, b)).reduce((s, e) => s + (e.durationMin ?? 0), 0);

  const thisWk = sleepMin(0, 7 * DAY);
  const prevWk = sleepMin(7 * DAY, 14 * DAY);
  const deltaPerDay = Math.round((thisWk - prevWk) / 7);
  const feeds = entries.filter((e) => e.kind === 'feed' && inRange(e, 0, 7 * DAY)).length;
  const days = new Set(entries.filter((e) => inRange(e, 0, 7 * DAY)).map((e) => new Date(e.at).toDateString())).size;

  const tips: string[] = [];
  if (thisWk > 0 || prevWk > 0) {
    if (deltaPerDay >= 20) tips.push(`Sleep is improving — about ${deltaPerDay} min more per day this week than last. Whatever you're doing is working.`);
    else if (deltaPerDay <= -20) tips.push(`Sleep dipped about ${Math.abs(deltaPerDay)} min/day versus last week. Growth spurts and changes are normal — be gentle with yourself.`);
    else tips.push(`Sleep has been steady this week. Consistency helps little ones settle.`);
  }
  if (feeds > 0) tips.push(`You logged ${feeds} feeds in the last 7 days — a lovely record to look back on.`);
  if (days > 0) tips.push(`You logged something on ${days} of the last 7 days. Small, consistent notes add up.`);
  if (tips.length === 0) tips.push(`Start logging on the Today tab and gentle insights about your patterns will appear here.`);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 14 }}>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink, marginTop: 8 }}>Gentle insights</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>Based on your patterns this week. On-device only.</Text>

      {tips.map((t, i) => (
        <View key={i} style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, gap: 10 }, shadow.card]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Leaf size={16} color={color.maternalTeal} />
            <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.tealInk }}>A gentle thought</Text>
          </View>
          <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.ink, lineHeight: 20 }}>{t}</Text>
          <Pressable onPress={() => saveTip(t)} style={{ alignSelf: 'flex-start' }}><Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>Save this tip</Text></Pressable>
        </View>
      ))}

      {savedTips.length > 0 && (
        <View style={{ gap: 8, marginTop: 4 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Saved</Text>
          {savedTips.map((t) => (
            <View key={t.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', gap: 10 }, shadow.card]}>
              <Text style={{ flex: 1, fontFamily: font.body500, fontSize: 13, color: color.inkSecondary, lineHeight: 19 }}>{t.text}</Text>
              <Pressable onPress={() => deleteTip(t.id)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
