import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { Logo } from '../../src/components/Logo';
import { useSupabase } from '../../src/lib/supabase';
import { ageLabel, stageFrom, STAGE_LABEL } from '../../src/lib/age';
import {
  useData, entriesOn, upcomingEvents, entryDetail, ENTRY_META,
  type EntryKind, type FeedSide, type DiaperType,
} from '../../src/lib/store';

const QUICK: EntryKind[] = ['feed', 'sleep', 'diaper', 'pump', 'note'];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const dayTimeOf = (iso: string) => new Date(iso).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' });

export default function Today() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session, profile } = useSupabase();
  const { entries, addEntry, deleteEntry, children, activeChild, setActiveChild, events } = useData();

  const [kind, setKind] = useState<EntryKind | null>(null);
  const [side, setSide] = useState<FeedSide>('left');
  const [diaper, setDiaper] = useState<DiaperType>('wet');
  const [ml, setMl] = useState('');
  const [mins, setMins] = useState('');
  const [note, setNote] = useState('');

  const name = profile?.name || session?.user?.email?.split('@')[0] || 'there';
  const today = entriesOn(entries);
  const next = upcomingEvents(events).slice(0, 3);
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  function open(k: EntryKind) {
    setKind(k); setSide('left'); setDiaper('wet'); setMl(''); setMins(''); setNote('');
  }
  function save() {
    if (!kind) return;
    const n = (s: string) => { const v = parseInt(s, 10); return isNaN(v) ? undefined : v; };
    if (kind === 'feed') addEntry('feed', { side, volumeMl: side === 'bottle' ? n(ml) : undefined, durationMin: n(mins), note });
    else if (kind === 'pump') addEntry('pump', { volumeMl: n(ml), note });
    else if (kind === 'sleep') addEntry('sleep', { durationMin: n(mins), note });
    else if (kind === 'diaper') addEntry('diaper', { diaperType: diaper, note });
    else addEntry('note', { note });
    setKind(null);
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

      <Pressable onPress={() => activeChild && router.push(`/(app)/child/${activeChild.id}` as any)} disabled={!activeChild}>
        <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink }}>{greeting()}, {name}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted, marginTop: 4 }}>
          {dateLabel}
          {activeChild ? `  ·  ${activeChild.name}${activeChild.birthDate ? ` · ${ageLabel(activeChild.birthDate)} · ${STAGE_LABEL[stageFrom(activeChild.birthDate)]}` : ''} ›` : ''}
        </Text>
      </Pressable>

      {children.length > 1 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {children.map((ch) => {
            const sel = ch.id === activeChild?.id;
            return (
              <Pressable key={ch.id} onPress={() => setActiveChild(ch.id)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 7, paddingHorizontal: 13, borderRadius: radius.pill, backgroundColor: sel ? color.primary : '#fff', borderWidth: 1, borderColor: sel ? color.primary : color.hairline }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: sel ? '#fff' : color.primary }} />
                  <Text style={{ fontFamily: font.body600, fontSize: 13, color: sel ? '#fff' : color.ink }}>{ch.name}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Quick log */}
      <View>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted, marginBottom: 10 }}>Quick log</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {QUICK.map((k) => {
            const m = ENTRY_META[k];
            return (
              <Pressable key={k} onPress={() => open(k)} style={({ pressed }) => [{ backgroundColor: m.fill, borderRadius: radius.tile, paddingVertical: 14, paddingHorizontal: 16, minWidth: 86, alignItems: 'center', opacity: pressed ? 0.8 : 1 }]}>
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: m.ink }}>+ {m.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* What's next */}
      {next.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>What's next</Text>
          {next.map((ev) => (
            <View key={ev.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color.accentRose }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{ev.title}</Text>
                {ev.location ? <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>{ev.location}</Text> : null}
              </View>
              <Text style={{ fontFamily: font.body500, fontSize: 12, color: color.inkSecondary }}>{dayTimeOf(ev.at)}</Text>
            </View>
          ))}
        </View>
      )}

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
            const detail = entryDetail(e);
            return (
              <View key={e.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: m.ink }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{m.label}</Text>
                  {detail ? <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary, marginTop: 2 }}>{detail}</Text> : null}
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

      {/* Detail modal */}
      <Modal visible={kind !== null} transparent animationType="fade" onRequestClose={() => setKind(null)}>
        <Pressable onPress={() => setKind(null)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>{kind ? ENTRY_META[kind].label : ''}</Text>

            {kind === 'feed' && (
              <Chips options={[['left', 'Left'], ['right', 'Right'], ['bottle', 'Bottle']]} value={side} onChange={(v) => setSide(v as FeedSide)} />
            )}
            {kind === 'feed' && side === 'bottle' && <Field label="Amount (ml)" value={ml} onChangeText={setMl} placeholder="e.g. 120" keyboardType="default" />}
            {(kind === 'feed' || kind === 'sleep') && <Field label="Duration (min)" value={mins} onChangeText={setMins} placeholder="e.g. 20" />}
            {kind === 'pump' && <Field label="Amount (ml)" value={ml} onChangeText={setMl} placeholder="e.g. 90" />}
            {kind === 'diaper' && (
              <Chips options={[['wet', 'Wet'], ['dirty', 'Dirty'], ['both', 'Both']]} value={diaper} onChange={(v) => setDiaper(v as DiaperType)} />
            )}
            <Field label={kind === 'note' ? 'Note' : 'Note (optional)'} value={note} onChangeText={setNote} placeholder="Anything to add?" autoCapitalize="sentences" />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setKind(null)} style={{ flex: 1 }} />
              <Button label="Save" onPress={save} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function Chips({ options, value, onChange }: { options: [string, string][]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {options.map(([v, label]) => {
        const sel = v === value;
        return (
          <Pressable key={v} onPress={() => onChange(v)} style={{ flex: 1, paddingVertical: 11, borderRadius: radius.tile, alignItems: 'center', backgroundColor: sel ? color.primary : '#fff', borderWidth: 1, borderColor: sel ? color.primary : color.hairline }}>
            <Text style={{ fontFamily: font.body600, fontSize: 13, color: sel ? '#fff' : color.ink }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
