import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { Logo } from '../../src/components/Logo';
import { useSupabase } from '../../src/lib/supabase';
import { useData, entriesOn, ENTRY_META, type EntryKind } from '../../src/lib/store';

const QUICK: EntryKind[] = ['sleep', 'feed', 'diaper', 'note'];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function Today() {
  const insets = useSafeAreaInsets();
  const { session, profile } = useSupabase();
  const { entries, addEntry, deleteEntry, children, activeChild, setActiveChild } = useData();

  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  const name = profile?.name || session?.user?.email?.split('@')[0] || 'there';
  const today = entriesOn(entries);
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  function onQuick(kind: EntryKind) {
    if (kind === 'note') {
      setNoteText('');
      setNoteOpen(true);
      return;
    }
    addEntry(kind);
  }

  function saveNote() {
    if (noteText.trim()) addEntry('note', noteText);
    setNoteOpen(false);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 28, paddingHorizontal: 22, gap: 18 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        <Logo width={24} height={28} color={color.primary} />
        <Text style={{ fontFamily: font.display700, fontSize: 20, color: color.ink }}>Everly</Text>
      </View>

      <View>
        <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink }}>
          {greeting()}, {name}
        </Text>
        <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted, marginTop: 4 }}>
          {dateLabel}{activeChild ? `  ·  ${activeChild.name}` : ''}
        </Text>
      </View>

      {children.length > 1 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {children.map((ch) => {
            const sel = ch.id === activeChild?.id;
            return (
              <Pressable key={ch.id} onPress={() => setActiveChild(ch.id)}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 7,
                    paddingVertical: 7,
                    paddingHorizontal: 13,
                    borderRadius: radius.pill,
                    backgroundColor: sel ? color.primary : '#fff',
                    borderWidth: 1,
                    borderColor: sel ? color.primary : color.hairline,
                  }}
                >
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: sel ? '#fff' : color.primary }} />
                  <Text style={{ fontFamily: font.body600, fontSize: 13, color: sel ? '#fff' : color.ink }}>{ch.name}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Quick add */}
      <View>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted, marginBottom: 10 }}>
          Quick log
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {QUICK.map((k) => {
            const m = ENTRY_META[k];
            return (
              <Pressable
                key={k}
                onPress={() => onQuick(k)}
                style={({ pressed }) => [
                  {
                    backgroundColor: m.fill,
                    borderRadius: radius.tile,
                    paddingVertical: 14,
                    paddingHorizontal: 18,
                    minWidth: 92,
                    alignItems: 'center',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: m.ink }}>+ {m.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Today's log */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>
          Today · {today.length} {today.length === 1 ? 'entry' : 'entries'}
        </Text>

        {today.length === 0 ? (
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 22, alignItems: 'center' }, shadow.card]}>
            <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.muted, textAlign: 'center' }}>
              Nothing logged yet today.{'\n'}Tap a button above to add your first entry.
            </Text>
          </View>
        ) : (
          today.map((e) => {
            const m = ENTRY_META[e.kind];
            return (
              <View
                key={e.id}
                style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}
              >
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: m.ink }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{m.label}</Text>
                  {e.note ? (
                    <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary, marginTop: 2 }}>{e.note}</Text>
                  ) : null}
                </View>
                <Text style={{ fontFamily: font.body500, fontSize: 12, color: color.muted }}>{timeOf(e.at)}</Text>
                <Pressable onPress={() => deleteEntry(e.id)} hitSlop={8} style={{ paddingHorizontal: 6 }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text>
                </Pressable>
              </View>
            );
          })
        )}
      </View>

      {/* Note modal */}
      <Modal visible={noteOpen} transparent animationType="fade" onRequestClose={() => setNoteOpen(false)}>
        <Pressable
          onPress={() => setNoteOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}
        >
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Add a note</Text>
            <Field label="Note" value={noteText} onChangeText={setNoteText} placeholder="What happened?" autoCapitalize="sentences" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setNoteOpen(false)} style={{ flex: 1 }} />
              <Button label="Save" onPress={saveNote} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
