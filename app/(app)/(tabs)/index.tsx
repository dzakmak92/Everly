import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, childToken } from '../../../src/theme/tokens';
import { Button, Field } from '../../../src/components/forms';
import { Logo } from '../../../src/components/Logo';
import {
  ChevronRight, Bottle, Calendar as CalendarIcon, Syringe,
  Heart, Calendar as CalIcon, Activity, Smile, Shield, CheckCircle, Star, Leaf,
} from '../../../src/components/icons';
import { EntryIcon } from '../../../src/components/EntryIcon';
import { Silhouette, ProgressBar } from '../../../src/components/ui';
import { DateField } from '../../../src/components/DateField';
import { useSupabase } from '../../../src/lib/supabase';
import { ageLabel, stageFrom } from '../../../src/lib/age';
import { gestFromDueDate } from '../../../src/lib/pregnancy';
import {
  useData, entriesOn, upcomingEvents, entryDetail, ENTRY_META, quickLogKinds, MOOD_LABELS,
  type EntryKind, type FeedSide, type DiaperType, type Child,
} from '../../../src/lib/store';

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const apptDateLabel = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

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
  const {
    entries, addEntry, deleteEntry, children, activeChild, setActiveChild, events, vaccines,
    dueDate, maternalBirth, setMaternalBirth, pregAppts, matAppts,
  } = useData();

  // Maternity ("You") journey availability + person switching.
  const hasJourney = !!maternalBirth || !!dueDate;
  const [person, setPerson] = useState<'you' | string>(() => {
    if (children.length > 0) return activeChild?.id ?? children[0].id;
    return hasJourney ? 'you' : (activeChild?.id ?? '');
  });
  const isYou = person === 'you';

  // Baby-has-arrived handoff modal (pregnancy phase only).
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [handoffDate, setHandoffDate] = useState(todayISO());

  const [kind, setKind] = useState<EntryKind | null>(null);
  const [side, setSide] = useState<FeedSide>('left');
  const [diaper, setDiaper] = useState<DiaperType>('wet');
  const [ml, setMl] = useState('');
  const [mins, setMins] = useState('');
  const [note, setNote] = useState('');
  const [mood, setMood] = useState(2);

  // Quick-log options adapt to the active child's life-stage.
  const quick = quickLogKinds(activeChild?.birthDate ? stageFrom(activeChild.birthDate) : 'newborn');

  const rawName = profile?.name || session?.user?.email?.split('@')[0] || 'there';
  const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  // Everything below is scoped to the active child so switching pills changes the view.
  const cid = activeChild?.id;
  const forChild = <T extends { childId?: string }>(list: T[]) => (cid ? list.filter((x) => x.childId === cid) : list);

  const today = entriesOn(forChild(entries));
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  // Today-at-a-glance summary (active child).
  const feedsToday = today.filter((e) => e.kind === 'feed').length;
  const sleepMin = today.filter((e) => e.kind === 'sleep').reduce((s, e) => s + (e.durationMin ?? 0), 0);
  const diapersToday = today.filter((e) => e.kind === 'diaper').length;
  const sleepLabel = sleepMin >= 60 ? `${Math.floor(sleepMin / 60)}h ${sleepMin % 60}m` : `${sleepMin}m`;
  const lastFeed = forChild(entries).find((e) => e.kind === 'feed');

  // "Up next" sources — upcoming events (active child + family-wide) and the next due vaccine.
  const nextEvents = upcomingEvents(events).filter((e) => !cid || !e.childId || e.childId === cid).slice(0, 2);
  const dueVax = forChild(vaccines).filter((v) => !v.givenDate)[0];
  const childName = (id?: string) => children.find((c) => c.id === id)?.name;

  function open(k: EntryKind) { setKind(k); setSide('left'); setDiaper('wet'); setMl(''); setMins(''); setNote(''); setMood(2); }
  function save() {
    if (!kind) return;
    const n = (s: string) => { const v = parseInt(s, 10); return isNaN(v) ? undefined : v; };
    if (kind === 'feed') addEntry('feed', { side, volumeMl: side === 'bottle' ? n(ml) : undefined, durationMin: n(mins), note });
    else if (kind === 'pump') addEntry('pump', { volumeMl: n(ml), note });
    else if (kind === 'sleep') addEntry('sleep', { durationMin: n(mins), note });
    else if (kind === 'diaper') addEntry('diaper', { diaperType: diaper, note });
    else if (kind === 'activity') addEntry('activity', { durationMin: n(mins), note });
    else if (kind === 'mood') addEntry('mood', { mood, note });
    else addEntry(kind, { note }); // note / meal / medicine / potty
    setKind(null);
  }

  const hasNext = nextEvents.length > 0 || dueVax;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: 28, paddingHorizontal: 20, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 2 }}>
        <Logo width={22} height={26} />
        <Text style={{ fontFamily: font.display700, fontSize: 19, color: color.ink }}>Everly</Text>
      </View>

      {/* Greeting */}
      <Pressable onPress={() => activeChild && router.push(`/(app)/child/${activeChild.id}` as any)} disabled={!activeChild} style={{ paddingHorizontal: 2 }}>
        <Text style={{ fontFamily: font.display700, fontSize: 24, color: color.ink }}>{greeting()}, {name}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted, marginTop: 4 }}>{dateLabel}</Text>
      </Pressable>

      {/* People pills (children + optional You journey) */}
      {(children.length > 0 || hasJourney) && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {children.map((ch) => (
            <ChildPill
              key={ch.id}
              child={ch}
              active={!isYou && ch.id === person}
              onPress={() => { setPerson(ch.id); setActiveChild(ch.id); }}
              onLong={() => router.push(`/(app)/child/${ch.id}` as any)}
            />
          ))}
          {hasJourney && (
            <YouPill
              active={isYou}
              label={youStatusLabel(dueDate, maternalBirth)}
              onPress={() => setPerson('you')}
            />
          )}
        </View>
      )}

      {/* ── You (maternity) view ──────────────────────────────────────────── */}
      {isYou && (
        <MaternityView
          dueDate={dueDate}
          maternalBirth={maternalBirth}
          pregAppts={pregAppts}
          matAppts={matAppts}
          router={router}
          onArrived={() => { setHandoffDate(todayISO()); setHandoffOpen(true); }}
        />
      )}

      {/* ── Child view (existing Today content) ───────────────────────────── */}
      {!isYou && <>

      {/* Today at a glance */}
      {today.length > 0 && (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, paddingVertical: 16, paddingHorizontal: 8 }, shadow.card]}>
          <View style={{ flexDirection: 'row' }}>
            <Stat label="Feeds" value={`${feedsToday}`} />
            <Divider />
            <Stat label="Sleep" value={sleepMin > 0 ? sleepLabel : '—'} />
            <Divider />
            <Stat label="Diapers" value={`${diapersToday}`} />
          </View>
          {lastFeed && (
            <View style={{ borderTopWidth: 1, borderTopColor: color.hairline, marginTop: 14, paddingTop: 12, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Bottle size={16} color={ENTRY_META.feed.ink} />
              <Text style={{ fontFamily: font.body500, fontSize: 12.5, color: color.muted }}>Last feed {agoLabel(lastFeed.at)} · {timeOf(lastFeed.at)}</Text>
            </View>
          )}
        </View>
      )}

      {/* Up next */}
      {hasNext && (
        <View style={{ gap: 10 }}>
          <Label>Up next</Label>
          {nextEvents.map((ev) => (
            <FeedRow key={ev.id} chipBg="#E7E4FB" icon={<CalendarIcon size={22} color={color.primary} />} title={ev.title} sub={`${ev.location ? ev.location + ' · ' : ''}${dayTimeOf(ev.at)}`}
              trailing={<ChevronRight size={16} color={color.faint} />} />
          ))}
          {dueVax && (
            <FeedRow chipBg="#FBE0EA" icon={<Syringe size={22} color={color.rose} />} title={`${childName(dueVax.childId) ? childName(dueVax.childId) + ' · ' : ''}${dueVax.name}`}
              sub={dueVax.dueDate ? `Due ${dueVax.dueDate}` : 'Scheduled'} trailing={<Badge text="vaccine" bg="#FBE0EA" fg={color.rose} />} />
          )}
        </View>
      )}

      {/* Quick log */}
      <View style={{ gap: 10 }}>
        <Label>Quick log</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {quick.map((k) => {
            const m = ENTRY_META[k];
            return (
              <Pressable key={k} onPress={() => open(k)} style={({ pressed }) => [{ backgroundColor: m.fill, borderRadius: radius.card, paddingVertical: 18, paddingHorizontal: 10, flexGrow: 1, flexBasis: '30%', minWidth: 100, alignItems: 'center', gap: 8, opacity: pressed ? 0.82 : 1 }]}>
                <EntryIcon kind={k} color={m.ink} size={24} />
                <Text style={{ fontFamily: font.body700, fontSize: 14.5, color: m.ink }}>{m.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Today's timeline */}
      <View style={{ gap: 10 }}>
        <Label>Today's timeline · {today.length} {today.length === 1 ? 'entry' : 'entries'}</Label>
        {today.length === 0 ? (
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 22, alignItems: 'center' }, shadow.card]}>
            <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.muted, textAlign: 'center' }}>Nothing logged yet today.{'\n'}Tap a button above to add your first entry.</Text>
          </View>
        ) : (
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, paddingVertical: 6, paddingHorizontal: 14 }, shadow.card]}>
            {today.map((e, i) => (
              <EntryRow key={e.id} entry={e} first={i === 0} last={i === today.length - 1} onDelete={() => deleteEntry(e.id)} />
            ))}
          </View>
        )}
      </View>

      </>}

      {/* Detail modal */}
      <Modal visible={kind !== null} transparent animationType="fade" onRequestClose={() => setKind(null)}>
        <Pressable onPress={() => setKind(null)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>{kind ? ENTRY_META[kind].label : ''}</Text>
            {kind === 'feed' && <Chips options={[['left', 'Left'], ['right', 'Right'], ['bottle', 'Bottle']]} value={side} onChange={(v) => setSide(v as FeedSide)} />}
            {kind === 'feed' && side === 'bottle' && <Field label="Amount (ml)" value={ml} onChangeText={setMl} placeholder="e.g. 120" />}
            {(kind === 'feed' || kind === 'sleep' || kind === 'activity') && <Field label="Duration (min)" value={mins} onChangeText={setMins} placeholder="e.g. 20" />}
            {kind === 'pump' && <Field label="Amount (ml)" value={ml} onChangeText={setMl} placeholder="e.g. 90" />}
            {kind === 'diaper' && <Chips options={[['wet', 'Wet'], ['dirty', 'Dirty'], ['both', 'Both']]} value={diaper} onChange={(v) => setDiaper(v as DiaperType)} />}
            {kind === 'mood' && <Chips options={MOOD_LABELS.map((l, i) => [String(i), l] as [string, string])} value={String(mood)} onChange={(v) => setMood(parseInt(v, 10))} />}
            <Field label={kind === 'note' || kind === 'meal' || kind === 'medicine' || kind === 'potty' ? 'Note' : 'Note (optional)'} value={note} onChangeText={setNote} placeholder={kind === 'meal' ? 'What did they eat?' : kind === 'medicine' ? 'Medicine & dose' : kind === 'potty' ? 'e.g. pee / poo / accident' : 'Anything to add?'} autoCapitalize="sentences" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setKind(null)} style={{ flex: 1 }} />
              <Button label="Save" onPress={save} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Baby-has-arrived handoff modal (manual only) */}
      <Modal visible={handoffOpen} transparent animationType="fade" onRequestClose={() => setHandoffOpen(false)}>
        <Pressable onPress={() => setHandoffOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Baby has arrived 🎉</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>Congratulations! Set the birth date to move into your postpartum journey. Your pregnancy stays saved as history.</Text>
            <DateField label="Baby's birth date" value={handoffDate} onChangeText={setHandoffDate} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setHandoffOpen(false)} style={{ flex: 1 }} />
              <Button label="Confirm" onPress={() => { setMaternalBirth(handoffDate); setHandoffOpen(false); }} style={{ flex: 1 }} />
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 3 }}>
      <Text style={{ fontFamily: font.display700, fontSize: 22, color: color.ink }}>{value}</Text>
      <Text style={{ fontFamily: font.body600, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase', color: color.muted }}>{label}</Text>
    </View>
  );
}
function Divider() {
  return <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: color.hairline, marginVertical: 2 }} />;
}

/* ── timeline ─────────────────────────────────────────────────────────────── */
function EntryRow({ entry, first, last, onDelete }: { entry: { id: string; kind: EntryKind; at: string }; first: boolean; last: boolean; onDelete: () => void }) {
  const m = ENTRY_META[entry.kind];
  const detail = entryDetail(entry as any);
  return (
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ width: 46, textAlign: 'right', paddingTop: 16, fontFamily: font.body600, fontSize: 11, color: color.muted }}>{timeOf(entry.at)}</Text>
      <View style={{ width: 34, alignItems: 'center' }}>
        <View style={{ width: 2, height: 14, backgroundColor: first ? 'transparent' : color.hairline }} />
        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: m.fill, alignItems: 'center', justifyContent: 'center' }}>
          <EntryIcon kind={entry.kind} color={m.ink} size={16} />
        </View>
        <View style={{ width: 2, flex: 1, minHeight: 12, backgroundColor: last ? 'transparent' : color.hairline }} />
      </View>
      <View style={{ flex: 1, paddingTop: 12, paddingBottom: 14, paddingLeft: 6, flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{m.label}</Text>
          {detail ? <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.inkSecondary, marginTop: 2 }}>{detail}</Text> : null}
        </View>
        <Pressable onPress={onDelete} hitSlop={8} style={{ padding: 2 }}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>
      </View>
    </View>
  );
}

function FeedRow({ chipBg, icon, title, sub, trailing }: { chipBg: string; icon: React.ReactNode; title: string; sub: string; trailing?: React.ReactNode }) {
  return (
    <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: chipBg, alignItems: 'center', justifyContent: 'center' }}>
        {icon}
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
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: active ? t.stroke : t.fill, alignItems: 'center', justifyContent: 'center' }}>
          <Silhouette size={18} fill={active ? '#fff' : t.stroke} />
        </View>
        <View>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: active ? t.stroke : color.ink }}>{child.name}</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 11, color: active ? t.stroke : color.muted, marginTop: 2 }}>
            {child.birthDate ? ageLabel(child.birthDate) : 'Tap to view'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/* ── You (maternity) journey ────────────────────────────────────────────── */

const PP_MS = 86400000;
/** Parse a YYYY-MM-DD as local midnight (avoids a UTC off-by-one). */
const ppTime = (d: string) => new Date(d.length <= 10 ? `${d}T00:00:00` : d).getTime();

/** Status label for the People-row "You" pill. */
function youStatusLabel(dueDate: string | null, maternalBirth: string | null): string {
  if (maternalBirth) {
    const days = Math.max(0, Math.floor((Date.now() - ppTime(maternalBirth)) / PP_MS));
    return `Week ${Math.floor(days / 7)} pp`;
  }
  const g = gestFromDueDate(dueDate ?? undefined);
  return g ? `Week ${g.week}` : 'Your space';
}

function YouPill({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  const fillC = '#E0F4EF';
  const strokeC = color.maternalTeal;
  return (
    <Pressable onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: active ? fillC : '#fff', borderRadius: radius.pill, paddingVertical: 7, paddingRight: 14, paddingLeft: 7, borderWidth: 1.5, borderColor: active ? strokeC : color.hairline }}>
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: active ? strokeC : fillC, alignItems: 'center', justifyContent: 'center' }}>
          <Silhouette size={18} fill={active ? '#fff' : strokeC} />
        </View>
        <View>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: active ? color.tealInk : color.ink }}>Mum&Me</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 11, color: active ? color.tealDeep : color.muted, marginTop: 2 }}>{label}</Text>
        </View>
      </View>
    </Pressable>
  );
}

type ApptLike = { id: string; title: string; at: string };

function MaternityView({
  dueDate, maternalBirth, pregAppts, matAppts, router, onArrived,
}: {
  dueDate: string | null;
  maternalBirth: string | null;
  pregAppts: ApptLike[];
  matAppts: ApptLike[];
  router: ReturnType<typeof useRouter>;
  onArrived: () => void;
}) {
  const derived: 'pregnancy' | 'postpartum' = maternalBirth ? 'postpartum' : 'pregnancy';
  const [phase, setPhase] = useState<'pregnancy' | 'postpartum'>(derived);
  const now = Date.now();

  // Hero numbers.
  const gest = gestFromDueDate(dueDate ?? undefined);
  const ppDays = maternalBirth ? Math.max(0, Math.floor((now - ppTime(maternalBirth)) / PP_MS)) : 0;
  const ppWeeks = Math.floor(ppDays / 7);

  // Feature tiles per phase (2-column grid).
  const tiles =
    phase === 'pregnancy'
      ? [
          { key: 'checkin', label: 'Daily check-in', bg: '#D8F0E6', icon: <Smile size={20} color="#2C8475" />, to: '/(app)/pregnancy' },
          { key: 'week', label: 'Week-by-week', bg: '#E7E4FB', icon: <Activity size={20} color={color.primary} />, to: '/(app)/preg-week' },
          { key: 'appts', label: 'Appointments', bg: '#DCEBFA', icon: <CalIcon size={20} color="#2C5F90" />, to: '/(app)/preg-appointments' },
          { key: 'triage', label: 'When to call', bg: '#FBE0EA', icon: <Shield size={20} color="#B04070" />, to: '/(app)/preg-vitals' },
          { key: 'prep', label: 'Birth prep', bg: '#FBF1CE', icon: <CheckCircle size={20} color="#7A5C20" />, to: '/(app)/preg-birthprep' },
          { key: 'names', label: 'Baby names', bg: '#E7E4FB', icon: <Star size={20} color={color.primary} />, to: '/(app)/preg-names' },
        ]
      : [
          { key: 'epds', label: 'Wellbeing', bg: '#E7E4FB', icon: <Smile size={20} color={color.primary} />, to: '/(app)/epds' },
          { key: 'recovery', label: 'Recovery', bg: '#D8F0E6', icon: <Shield size={20} color="#2C8475" />, to: '/(app)/maternal' },
          { key: 'appts', label: 'Appointments', bg: '#DCEBFA', icon: <CalIcon size={20} color="#2C5F90" />, to: '/(app)/preg-appointments?tab=maternal' },
          { key: 'pelvic', label: 'Pelvic floor', bg: '#FBE0EA', icon: <Activity size={20} color="#B04070" />, to: '/(app)/mat-pelvic' },
          { key: 'next', label: 'Planning next', bg: '#E6EFDD', icon: <Leaf size={20} color="#6E9A4E" /> as any, to: '/(app)/mat-preconception' },
          { key: 'story', label: 'Your story', bg: '#FCE6D8', icon: <Star size={20} color="#B5662E" />, to: '/(app)/timeline?subject=you' },
        ];

  // Up next — soonest first, max 2, future only.
  const source = phase === 'pregnancy' ? pregAppts : matAppts;
  const upNext = [...source]
    .filter((a) => new Date(a.at).getTime() >= now)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    .slice(0, 2);

  return (
    <View style={{ gap: 16 }}>
      {/* Phase sub-tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: '#EFEDF8', borderRadius: radius.pill, padding: 3 }}>
        {(['pregnancy', 'postpartum'] as const).map((p) => {
          const on = p === phase;
          return (
            <Pressable key={p} onPress={() => setPhase(p)} style={{ flex: 1, paddingVertical: 9, borderRadius: radius.pill, alignItems: 'center', backgroundColor: on ? color.primary : 'transparent' }}>
              <Text style={{ fontFamily: on ? font.body700 : font.body600, fontSize: 13, color: on ? '#fff' : color.inkSecondary }}>{p === 'pregnancy' ? 'Pregnancy' : 'Postpartum'}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Teal status hero (non-navigating — the feature tiles below are the way in) */}
      <View style={[{ backgroundColor: color.maternalTeal, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
        {phase === 'pregnancy' ? (
          <>
            <Text style={{ fontFamily: font.display700, fontSize: 24, color: '#fff' }}>{gest ? `Week ${gest.week}` : 'Pregnancy'}</Text>
            <Text style={{ fontFamily: font.body500, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
              {gest ? `${gest.daysToGo} days to go · Trimester ${gest.trimester}` : 'Add a due date to begin'}
            </Text>
          </>
        ) : (
          <>
            <Text style={{ fontFamily: font.display700, fontSize: 24, color: '#fff' }}>{maternalBirth ? `Week ${ppWeeks} postpartum` : 'Postpartum'}</Text>
            <Text style={{ fontFamily: font.body500, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
              {maternalBirth ? `Day ${ppDays} · Fourth trimester` : 'Unlocks after your baby arrives'}
            </Text>
          </>
        )}
        {phase === 'pregnancy' && gest && (
          <ProgressBar pct={Math.round(gest.progress * 100)} track="rgba(255,255,255,0.25)" colors={['#FFFFFF', '#E0F4EF']} />
        )}
      </View>

      {/* Feature grid */}
      <View style={{ gap: 10 }}>
        <Label>{phase === 'pregnancy' ? 'This week' : 'Looking after you'}</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {tiles.map((t) => (
            <Pressable key={t.key} onPress={() => router.push(t.to as any)} style={({ pressed }) => [{ width: '47.5%', flexGrow: 1, opacity: pressed ? 0.82 : 1 }]}>
              <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 14, gap: 9 }, shadow.card]}>
                <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>{t.icon}</View>
                <Text style={{ fontFamily: font.body700, fontSize: 13.5, color: color.ink }}>{t.label}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Up next */}
      {upNext.length > 0 && (
        <View style={{ gap: 10 }}>
          <Label>Up next</Label>
          {upNext.map((a) => (
            <FeedRow
              key={a.id}
              chipBg="#E0F4EF"
              icon={<CalIcon size={22} color={color.maternalTeal} />}
              title={a.title}
              sub={apptDateLabel(a.at)}
              trailing={<ChevronRight size={16} color={color.faint} />}
            />
          ))}
        </View>
      )}

      {/* Manual handoff — pregnancy phase only */}
      {phase === 'pregnancy' && (
        <Pressable onPress={onArrived} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: color.maternalTeal }, shadow.card]}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#E0F4EF', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={22} color={color.maternalTeal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.body700, fontSize: 14.5, color: color.tealInk }}>Baby has arrived 🎉</Text>
              <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, marginTop: 2 }}>Move into your postpartum journey</Text>
            </View>
            <ChevronRight size={16} color={color.maternalTeal} />
          </View>
        </Pressable>
      )}
    </View>
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
