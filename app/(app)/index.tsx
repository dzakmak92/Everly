import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, childToken } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { Logo } from '../../src/components/Logo';
import { ChevronRight } from '../../src/components/icons';
import { useSupabase } from '../../src/lib/supabase';
import { ageLabel, stageFrom, STAGE_LABEL } from '../../src/lib/age';
import {
  useData, entriesOn, upcomingEvents, entryDetail, ENTRY_META,
  type EntryKind, type FeedSide, type DiaperType, type Child,
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
function agoLabel(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60}m ago`;
}

export default function Today() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session, profile } = useSupabase();
  const { entries, addEntry, deleteEntry, children, activeChild, setActiveChild, events, vaccines } = useData();

  const [kind, setKind] = useState<EntryKind | null>(null);
  const [side, setSide] = useState<FeedSide>('left');
  const [diaper, setDiaper] = useState<DiaperType>('wet');
  const [ml, setMl] = useState('');
  const [mins, setMins] = useState('');
  const [note, setNote] = useState('');

  const name = profile?.name || session?.user?.email?.split('@')[0] || 'there';
  const today = entriesOn(entries);
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  // "What's next" sources
  const lastFeed = entries.find((e) => e.kind === 'feed');
  const nextEvents = upcomingEvents(events).slice(0, 2);
  const dueVax = vaccines.filter((v) => !v.givenDate)[0];
  const childName = (id?: string) => children.find((c) => c.id === id)?.name;

  function open(k: EntryKind) { setKind(k); setSide('left'); setDiaper('wet'); setMl(''); setMins(''); setNote(''); }
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

  const hasNext = lastFeed || nextEvents.length > 0 || dueVax;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: 28, paddingHorizontal: 20, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 2 }}>
        <Logo width={22} height={26} color={color.primary} />
        <Text style={{ fontFamily: font.display700, fontSize: 19, color: color.ink }}>Everly</Text>
      </View>

      {/* Greeting */}
      <Pressable onPress={() => activeChild && router.push(`/(app)/child/${activeChild.id}` as any)} disabled={!activeChild} style={{ paddingHorizontal: 2 }}>
        <Text style={{ fontFamily: font.display700, fontSize: 24, color: color.ink }}>{greeting()}, {name}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted, marginTop: 4 }}>{dateLabel}</Text>
      </Pressable>

      {/* Child pills */}
      {children.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {children.map((ch) => <ChildPill key={ch.id} child={ch} active={ch.id === activeChild?.id} onPress={() => setActiveChild(ch.id)} onLong={() => router.push(`/(app)/child/${ch.id}` as any)} />)}
        </View>
      )}

      {/* What's next */}
      {hasNext && (
        <View style={{ gap: 10 }}>
          <Label>What's next</Label>
          {lastFeed && (
            <FeedRow chipBg={ENTRY_META.feed.fill} dot={ENTRY_META.feed.ink}
              title={`Last feed${lastFeed.side ? ` · ${lastFeed.side === 'bottle' ? 'Bottle' : lastFeed.side === 'left' ? 'Left' : 'Right'}` : ''}`}
              sub={`${childName(lastFeed.childId) ? childName(lastFeed.childId) + ' · ' : ''}${timeOf(lastFeed.at)}`}
              trailing={<Badge text={agoLabel(lastFeed.at)} bg="#E7E4FB" fg={color.primary} />} />
          )}
          {nextEvents.map((ev) => (
            <FeedRow key={ev.id} chipBg="#E7E4FB" dot={color.primary} title={ev.title} sub={`${ev.location ? ev.location + ' · ' : ''}${dayTimeOf(ev.at)}`}
              trailing={<ChevronRight size={16} color={color.faint} />} />
          ))}
          {dueVax && (
            <FeedRow chipBg={ENTRY_META.diaper.fill} dot={color.rose} title={`${childName(dueVax.childId) ? childName(dueVax.childId) + ' · ' : ''}${dueVax.name}`}
              sub={dueVax.dueDate ? `Due ${dueVax.dueDate}` : 'Scheduled'} trailing={<Badge text="vaccine" bg="#FBE0EA" fg={color.rose} />} />
          )}
        </View>
      )}

      {/* Quick log */}
      <View>
        <Label>Quick log</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 10 }}>
          {QUICK.map((k) => {
            const m = ENTRY_META[k];
            return (
              <Pressable key={k} onPress={() => open(k)} style={({ pressed }) => [{ backgroundColor: m.fill, borderRadius: radius.tile, paddingVertical: 13, paddingHorizontal: 15, minWidth: 84, alignItems: 'center', opacity: pressed ? 0.8 : 1 }]}>
                <Text style={{ fontFamily: font.body700, fontSize: 13.5, color: m.ink }}>+ {m.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Today's log */}
      <View style={{ gap: 10 }}>
        <Label>Today · {today.length} {today.length === 1 ? 'entry' : 'entries'}</Label>
        {today.length === 0 ? (
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 22, alignItems: 'center' }, shadow.card]}>
            <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.muted, textAlign: 'center' }}>Nothing logged yet today.{'\n'}Tap a button above to add your first entry.</Text>
          </View>
        ) : today.map((e) => {
          const m = ENTRY_META[e.kind]; const detail = entryDetail(e);
          return (
            <View key={e.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
              <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: m.fill, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: m.ink }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{m.label}</Text>
                {detail ? <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.inkSecondary, marginTop: 1 }}>{detail}</Text> : null}
              </View>
              <Text style={{ fontFamily: font.body500, fontSize: 12, color: color.muted }}>{timeOf(e.at)}</Text>
              <Pressable onPress={() => deleteEntry(e.id)} hitSlop={8} style={{ paddingHorizontal: 4 }}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>
            </View>
          );
        })}
      </View>

      {/* Detail modal */}
      <Modal visible={kind !== null} transparent animationType="fade" onRequestClose={() => setKind(null)}>
        <Pressable onPress={() => setKind(null)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>{kind ? ENTRY_META[kind].label : ''}</Text>
            {kind === 'feed' && <Chips options={[['left', 'Left'], ['right', 'Right'], ['bottle', 'Bottle']]} value={side} onChange={(v) => setSide(v as FeedSide)} />}
            {kind === 'feed' && side === 'bottle' && <Field label="Amount (ml)" value={ml} onChangeText={setMl} placeholder="e.g. 120" />}
            {(kind === 'feed' || kind === 'sleep') && <Field label="Duration (min)" value={mins} onChangeText={setMins} placeholder="e.g. 20" />}
            {kind === 'pump' && <Field label="Amount (ml)" value={ml} onChangeText={setMl} placeholder="e.g. 90" />}
            {kind === 'diaper' && <Chips options={[['wet', 'Wet'], ['dirty', 'Dirty'], ['both', 'Both']]} value={diaper} onChange={(v) => setDiaper(v as DiaperType)} />}
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

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: color.muted, paddingLeft: 2 }}>{children}</Text>;
}

function Badge({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return <View style={{ backgroundColor: bg, borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: 11 }}><Text style={{ fontFamily: font.body700, fontSize: 11, color: fg }}>{text}</Text></View>;
}

function FeedRow({ chipBg, dot, title, sub, trailing }: { chipBg: string; dot: string; title: string; sub: string; trailing?: React.ReactNode }) {
  return (
    <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: chipBg, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: dot }} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }} numberOfLines={1}>{title}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, marginTop: 2 }} numberOfLines={1}>{sub}</Text>
      </View>
      {trailing}
    </View>
  );
}

function ChildPill({ child, active, onPress, onLong }: { child: Child; active: boolean; onPress: () => void; onLong: () => void }) {
  const t = childToken[child.color];
  return (
    <Pressable onPress={onPress} onLongPress={onLong} delayLongPress={250}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: active ? t.fill : '#fff', borderRadius: radius.pill, paddingVertical: 7, paddingRight: 14, paddingLeft: 7, borderWidth: 1.5, borderColor: active ? t.stroke : color.hairline }}>
        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: t.stroke, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: '#fff' }}>{child.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: active ? t.stroke : color.ink }}>{child.name}</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 10, color: active ? t.stroke : color.muted, marginTop: 2 }}>
            {child.birthDate ? `${ageLabel(child.birthDate)} · ${STAGE_LABEL[stageFrom(child.birthDate)]}` : 'Tap to view'}
          </Text>
        </View>
      </View>
    </Pressable>
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
