import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field, Notice } from '../../src/components/forms';
import { ChevronLeft } from '../../src/components/icons';
import { useData, entryDetail, ENTRY_META, type EntryKind, type EntryDetails, type FeedSide, type DiaperType } from '../../src/lib/store';

const EXAMPLES = ['feed left 12', 'feed bottle 120', 'sleep 45', 'diaper wet', 'pump 90', 'note teething today'];

/** Parse a free-text command into a log entry. Returns null if not recognised. */
function parse(input: string): { kind: EntryKind; details: EntryDetails } | null {
  const text = input.trim().toLowerCase();
  if (!text) return null;
  const [head, ...rest] = text.split(/\s+/);
  const numIn = (arr: string[]) => { for (const w of arr) { const n = parseInt(w, 10); if (!isNaN(n)) return n; } return undefined; };

  if (head === 'feed') {
    let side: FeedSide | undefined;
    if (rest.includes('left')) side = 'left'; else if (rest.includes('right')) side = 'right'; else if (rest.includes('bottle')) side = 'bottle';
    const n = numIn(rest);
    return { kind: 'feed', details: { side, volumeMl: side === 'bottle' ? n : undefined, durationMin: side !== 'bottle' ? n : undefined } };
  }
  if (head === 'pump') return { kind: 'pump', details: { volumeMl: numIn(rest) } };
  if (head === 'sleep' || head === 'nap') return { kind: 'sleep', details: { durationMin: numIn(rest) } };
  if (head === 'diaper' || head === 'nappy') {
    let diaperType: DiaperType = 'wet';
    if (rest.includes('dirty')) diaperType = 'dirty'; else if (rest.includes('both')) diaperType = 'both';
    return { kind: 'diaper', details: { diaperType } };
  }
  if (head === 'note') return { kind: 'note', details: { note: rest.join(' ') } };
  // Fallback: treat the whole thing as a note.
  return { kind: 'note', details: { note: text } };
}

export default function QuickAdd() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addEntry, entries, activeChild } = useData();
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');

  function run(cmd?: string) {
    const input = cmd ?? text;
    const parsed = parse(input);
    if (!parsed) { setMsg('Try something like "feed left 12" or "sleep 45".'); return; }
    addEntry(parsed.kind, parsed.details);
    setMsg(`Logged ${ENTRY_META[parsed.kind].label.toLowerCase()}${activeChild ? ` for ${activeChild.name}` : ''}.`);
    setText('');
  }

  const recent = entries.slice(0, 5);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 14 }}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Quick add</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted, lineHeight: 19 }}>
        Type a command to log in one line. (On a phone build this is also the voice-capture flow.)
      </Text>

      <Field label="Command" value={text} onChangeText={setText} placeholder='e.g. feed left 12' autoCapitalize="none" />
      <Notice text={msg} tone="info" />
      <Button label="Log it" onPress={() => run()} />

      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Examples — tap to use</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {EXAMPLES.map((ex) => (
            <Pressable key={ex} onPress={() => run(ex)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: '#fff', borderWidth: 1, borderColor: color.hairline }}>
              <Text style={{ fontFamily: font.body500, fontSize: 12, color: color.inkSecondary }}>{ex}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {recent.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Just logged</Text>
          {recent.map((e) => {
            const m = ENTRY_META[e.kind]; const det = entryDetail(e);
            return (
              <View key={e.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10 }, shadow.card]}>
                <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: m.ink }} />
                <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 13, color: color.ink }}>{m.label}{det ? ` · ${det}` : ''}</Text>
                <Text style={{ fontFamily: font.body500, fontSize: 11, color: color.muted }}>{new Date(e.at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
