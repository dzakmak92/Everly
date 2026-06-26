import React from 'react';
import { ScrollView, View, Text, Pressable, Share, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { useData, ENTRY_META, entryDetail, type Entry } from '../../src/lib/store';

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (dayKey(iso) === dayKey(now.toISOString())) return 'Today';
  if (dayKey(iso) === dayKey(yest.toISOString())) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function TimelineTab() {
  const insets = useSafeAreaInsets();
  const { entries, deleteEntry, milestones, children } = useData();
  const childName = (id?: string) => children.find((c) => c.id === id)?.name;

  async function shareMilestone(text: string) {
    try {
      const nav = typeof navigator !== 'undefined' ? (navigator as any) : undefined;
      if (Platform.OS === 'web' && nav?.share) await nav.share({ text });
      else await Share.share({ message: text });
    } catch {
      /* user cancelled or unsupported */
    }
  }

  // Group newest-first into day buckets, preserving order.
  const groups: { key: string; items: Entry[] }[] = [];
  for (const e of entries) {
    const k = dayKey(e.at);
    const g = groups.find((x) => x.key === k);
    if (g) g.items.push(e);
    else groups.push({ key: k, items: [e] });
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 28, paddingHorizontal: 22, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink }}>Timeline</Text>

      {milestones.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Milestones</Text>
          {milestones.map((m) => (
            <View key={m.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 3, borderLeftColor: color.sparkleGold }, shadow.card]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{m.title}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>
                  {new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}{childName(m.childId) ? ` · ${childName(m.childId)}` : ''}{m.note ? ` · ${m.note}` : ''}
                </Text>
              </View>
              <Pressable
                onPress={() => shareMilestone(`${m.title} — ${new Date(m.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}${childName(m.childId) ? ` · ${childName(m.childId)}` : ''} (via Everly)`)}
                hitSlop={8}
              >
                <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.primary }}>Share</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {groups.length === 0 ? (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 22, alignItems: 'center' }, shadow.card]}>
          <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.muted, textAlign: 'center' }}>
            Your history is empty.{'\n'}Log something on the Today tab and it appears here.
          </Text>
        </View>
      ) : (
        groups.map((g) => (
          <View key={g.key} style={{ gap: 8 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>
              {dayLabel(g.items[0].at)} · {g.items.length}
            </Text>
            {g.items.map((e) => {
              const m = ENTRY_META[e.kind];
              return (
                <View
                  key={e.id}
                  style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}
                >
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: m.ink }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{m.label}</Text>
                    {entryDetail(e) ? (
                      <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary, marginTop: 2 }}>{entryDetail(e)}</Text>
                    ) : null}
                  </View>
                  <Text style={{ fontFamily: font.body500, fontSize: 12, color: color.muted }}>{timeOf(e.at)}</Text>
                  <Pressable onPress={() => deleteEntry(e.id)} hitSlop={8} style={{ paddingHorizontal: 6 }}>
                    <Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))
      )}
    </ScrollView>
  );
}
