import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, childToken } from '../../../src/theme/tokens';
import { Button, Field } from '../../../src/components/forms';
import { Logo } from '../../../src/components/Logo';
import {
  ChevronRight, Bottle, Calendar as CalendarIcon, Syringe,
  Heart, Calendar as CalIcon, Activity, Smile, Shield, CheckCircle, Star, Leaf, X, Plus, ChevronLeft,
} from '../../../src/components/icons';
import { EntryIcon } from '../../../src/components/EntryIcon';
import { Silhouette, ProgressBar } from '../../../src/components/ui';
import { DateField } from '../../../src/components/DateField';
import { useSupabase } from '../../../src/lib/supabase';
import { ageLabel, stageFrom } from '../../../src/lib/age';
import {
  gestFromDueDate, weekContent, MOODS, PREG_SYMPTOMS, RED_FLAGS_CALL_NOW, RED_FLAGS_CALL_SOON,
} from '../../../src/lib/pregnancy';
import { EPDS_QUESTIONS, scoreEpds, BAND_LABEL, CRISIS_RESOURCES } from '../../../src/lib/epds';
import {
  useData, entriesOn, upcomingEvents, entryDetail, ENTRY_META, quickLogKinds, MOOD_LABELS, CHILD_COLORS,
  type EntryKind, type FeedSide, type DiaperType, type Child, type Lochia, type ChildColor,
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
    addChild, savedNames,
  } = useData();

  // Maternity ("You") journey availability + person switching.
  const hasJourney = !!maternalBirth || !!dueDate;
  const [person, setPerson] = useState<'you' | string>(() => {
    if (children.length > 0) return activeChild?.id ?? children[0].id;
    return hasJourney ? 'you' : (activeChild?.id ?? '');
  });
  const isYou = person === 'you';

  // Mum&Me phase tab — Pregnancy is always the default landing tab.
  const [phase, setPhase] = useState<'pregnancy' | 'postpartum'>('pregnancy');

  // Baby-has-arrived handoff (celebration flow).
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [handoffStep, setHandoffStep] = useState<'form' | 'done'>('form');
  const [handoffDate, setHandoffDate] = useState(todayISO());
  const [handoffName, setHandoffName] = useState('');
  const [handoffColor, setHandoffColor] = useState<ChildColor>(CHILD_COLORS[0]);
  const [handoffErr, setHandoffErr] = useState('');

  function openHandoff() {
    setHandoffStep('form');
    setHandoffDate(todayISO());
    setHandoffName('');
    setHandoffColor(CHILD_COLORS[0]);
    setHandoffErr('');
    setHandoffOpen(true);
  }
  function confirmHandoff() {
    const nm = handoffName.trim();
    if (!nm) { setHandoffErr("Add your baby's name to continue."); return; }
    const id = addChild({ name: nm, color: handoffColor, birthDate: handoffDate });
    setActiveChild(id);
    setMaternalBirth(handoffDate);
    setPhase('postpartum');
    setHandoffStep('done');
  }
  function finishHandoff() {
    setHandoffOpen(false);
    setPerson('you');
  }

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
          phase={phase}
          setPhase={setPhase}
          dueDate={dueDate}
          maternalBirth={maternalBirth}
          pregAppts={pregAppts}
          matAppts={matAppts}
          onArrived={openHandoff}
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

      {/* Baby-has-arrived handoff — celebration + create baby + move to postpartum */}
      <Modal visible={handoffOpen} transparent animationType="fade" onRequestClose={() => (handoffStep === 'done' ? finishHandoff() : setHandoffOpen(false))}>
        <Pressable onPress={() => (handoffStep === 'done' ? finishHandoff() : setHandoffOpen(false))} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.45)', justifyContent: 'center', paddingHorizontal: 26 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, overflow: 'hidden' }, shadow.card]}>
            {handoffStep === 'form' ? (
              <View style={{ padding: 20, gap: 14 }}>
                <View style={{ alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 40 }}>🎉</Text>
                  <Text style={{ fontFamily: font.display700, fontSize: 20, color: color.ink, textAlign: 'center' }}>Baby has arrived!</Text>
                  <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted, textAlign: 'center', lineHeight: 19 }}>
                    Congratulations 💛 Let's welcome your little one and move into your postpartum journey. Your pregnancy stays saved as history.
                  </Text>
                </View>
                <Field label="Baby's name" value={handoffName} onChangeText={(t) => { setHandoffName(t); if (handoffErr) setHandoffErr(''); }} placeholder="e.g. Oliver" autoCapitalize="words" />
                {savedNames.length > 0 && (
                  <View style={{ gap: 7 }}>
                    <Text style={{ fontFamily: font.body700, fontSize: 10.5, letterSpacing: 0.9, textTransform: 'uppercase', color: color.muted }}>From your shortlist</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {savedNames.slice(0, 8).map((n) => {
                        const sel = handoffName.trim() === n.name;
                        return (
                          <Pressable key={n.id} onPress={() => { setHandoffName(n.name); if (handoffErr) setHandoffErr(''); }}>
                            <View style={{ backgroundColor: sel ? color.maternalTeal : '#fff', borderRadius: radius.pill, paddingVertical: 7, paddingHorizontal: 13, borderWidth: 1.5, borderColor: sel ? color.maternalTeal : color.hairline }}>
                              <Text style={{ fontFamily: font.body600, fontSize: 13, color: sel ? '#fff' : color.ink }}>{n.name}</Text>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}
                <DateField label="Baby's birth date" value={handoffDate} onChangeText={setHandoffDate} />
                <View style={{ gap: 8 }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 10.5, letterSpacing: 0.9, textTransform: 'uppercase', color: color.muted }}>Colour</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 11 }}>
                    {CHILD_COLORS.map((k) => {
                      const t = childToken[k]; const sel = k === handoffColor;
                      return (
                        <Pressable key={k} onPress={() => setHandoffColor(k)}>
                          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: t.fill, borderWidth: sel ? 3 : 1, borderColor: sel ? t.stroke : color.hairline, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: t.stroke }} />
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                {handoffErr ? <Text style={{ fontFamily: font.body500, fontSize: 12.5, color: color.rose }}>{handoffErr}</Text> : null}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Button label="Not yet" variant="secondary" onPress={() => setHandoffOpen(false)} style={{ flex: 1 }} />
                  <Button label="Welcome baby" onPress={confirmHandoff} style={{ flex: 1.4 }} />
                </View>
              </View>
            ) : (
              <View>
                <View style={{ backgroundColor: color.maternalTeal, paddingTop: 28, paddingBottom: 24, paddingHorizontal: 22, alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 46 }}>🎉</Text>
                  <Text style={{ fontFamily: font.display700, fontSize: 22, color: '#fff', textAlign: 'center' }}>Welcome to the world,{'\n'}{handoffName.trim()}!</Text>
                  <Text style={{ fontFamily: font.body500, fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>Born {dateOnlyLabel(handoffDate)}</Text>
                </View>
                <View style={{ padding: 20, gap: 12 }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: color.muted }}>What happens now</Text>
                  {[
                    { icon: '👶', text: `${handoffName.trim()} is added to your family — log feeds, sleep and nappies from Today.` },
                    { icon: '💚', text: 'Mum&Me switches to Postpartum: recovery, wellbeing checks and pelvic-floor support.' },
                    { icon: '📖', text: 'Your pregnancy stays saved as history — nothing is lost.' },
                  ].map((row, i) => (
                    <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                      <Text style={{ fontSize: 18 }}>{row.icon}</Text>
                      <Text style={{ flex: 1, fontFamily: font.body400, fontSize: 13.5, color: color.inkSecondary, lineHeight: 19 }}>{row.text}</Text>
                    </View>
                  ))}
                  <Button label="Start postpartum journey" onPress={finishHandoff} style={{ marginTop: 4 }} />
                </View>
              </View>
            )}
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
  phase, setPhase, dueDate, maternalBirth, pregAppts, matAppts, onArrived,
}: {
  phase: 'pregnancy' | 'postpartum';
  setPhase: (p: 'pregnancy' | 'postpartum') => void;
  dueDate: string | null;
  maternalBirth: string | null;
  pregAppts: ApptLike[];
  matAppts: ApptLike[];
  onArrived: () => void;
}) {
  // Accordion grid: one card open at a time, panel renders full-width below.
  const [openCard, setOpenCard] = useState<string | null>(null);
  // Collapse any open card whenever the phase tab changes.
  React.useEffect(() => { setOpenCard(null); }, [phase]);
  const now = Date.now();

  // Hero numbers.
  const gest = gestFromDueDate(dueDate ?? undefined);
  const ppDays = maternalBirth ? Math.max(0, Math.floor((now - ppTime(maternalBirth)) / PP_MS)) : 0;
  const ppWeeks = Math.floor(ppDays / 7);

  // Feature tiles per phase (2-column grid). `key` is the panel selector.
  const tiles =
    phase === 'pregnancy'
      ? [
          { key: 'checkin', label: 'Daily check-in', bg: '#D8F0E6', icon: <Smile size={20} color="#2C8475" /> },
          { key: 'week', label: 'Week-by-week', bg: '#E7E4FB', icon: <Activity size={20} color={color.primary} /> },
          { key: 'appts', label: 'Appointments', bg: '#DCEBFA', icon: <CalIcon size={20} color="#2C5F90" /> },
          { key: 'triage', label: 'When to call', bg: '#FBE0EA', icon: <Shield size={20} color="#B04070" /> },
          { key: 'prep', label: 'Birth prep', bg: '#FBF1CE', icon: <CheckCircle size={20} color="#7A5C20" /> },
          { key: 'names', label: 'Baby names', bg: '#E7E4FB', icon: <Star size={20} color={color.primary} /> },
        ]
      : [
          { key: 'epds', label: 'Wellbeing', bg: '#E7E4FB', icon: <Smile size={20} color={color.primary} /> },
          { key: 'recovery', label: 'Recovery', bg: '#D8F0E6', icon: <Shield size={20} color="#2C8475" /> },
          { key: 'matappts', label: 'Appointments', bg: '#DCEBFA', icon: <CalIcon size={20} color="#2C5F90" /> },
          { key: 'pelvic', label: 'Pelvic floor', bg: '#FBE0EA', icon: <Activity size={20} color="#B04070" /> },
          { key: 'next', label: 'Planning next', bg: '#E6EFDD', icon: <Leaf size={20} color="#6E9A4E" /> },
          { key: 'story', label: 'Your story', bg: '#FCE6D8', icon: <Star size={20} color="#B5662E" /> },
        ];

  const openTile = tiles.find((t) => t.key === openCard) ?? null;

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
            <Pressable key={p} onPress={() => { setPhase(p); setOpenCard(null); }} style={{ flex: 1, paddingVertical: 9, borderRadius: radius.pill, alignItems: 'center', backgroundColor: on ? color.primary : 'transparent' }}>
              <Text style={{ fontFamily: on ? font.body700 : font.body600, fontSize: 13, color: on ? '#fff' : color.inkSecondary }}>{p === 'pregnancy' ? 'Pregnancy' : 'Postpartum'}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Teal status hero */}
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
        {/* Baby-has-arrived lives inside the hero (pregnancy phase only). */}
        {phase === 'pregnancy' && (
          <Pressable onPress={onArrived} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.card, paddingVertical: 13, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <CheckCircle size={20} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: '#fff' }}>Baby has arrived 🎉</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 1 }}>Move into your postpartum journey</Text>
              </View>
              <ChevronRight size={16} color="#fff" />
            </View>
          </Pressable>
        )}
      </View>

      {/* Feature grid — tapping a card expands it inline (panel below the grid) */}
      <View style={{ gap: 10 }}>
        <Label>{phase === 'pregnancy' ? 'This week' : 'Looking after you'}</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {tiles.map((t) => {
            const active = t.key === openCard;
            return (
              <Pressable
                key={t.key}
                onPress={() => setOpenCard((cur) => (cur === t.key ? null : t.key))}
                style={({ pressed }) => [{ width: '47.5%', flexGrow: 1, opacity: pressed ? 0.82 : 1 }]}
              >
                <View style={[{ backgroundColor: active ? '#E0F4EF' : '#fff', borderRadius: radius.card, padding: 14, gap: 9, borderWidth: 2, borderColor: active ? color.maternalTeal : 'transparent' }, shadow.card]}>
                  <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>{t.icon}</View>
                  <Text style={{ fontFamily: font.body700, fontSize: 13.5, color: active ? color.tealInk : color.ink }}>{t.label}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Inline expanded panel — full width, directly below the grid */}
        {openTile && (
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, gap: 14, borderWidth: 2, borderColor: color.maternalTeal }, shadow.card]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: openTile.bg, alignItems: 'center', justifyContent: 'center' }}>{openTile.icon}</View>
              <Text style={{ flex: 1, fontFamily: font.display700, fontSize: 17, color: color.ink }}>{openTile.label}</Text>
              <Pressable onPress={() => setOpenCard(null)} hitSlop={10} style={{ padding: 2 }}>
                <X size={20} color={color.muted} />
              </Pressable>
            </View>
            <CardPanel cardKey={openTile.key} dueDate={dueDate} maternalBirth={maternalBirth} ppWeeks={ppWeeks} onClose={() => setOpenCard(null)} />
          </View>
        )}
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

    </View>
  );
}

/* ── Inline accordion panels ──────────────────────────────────────────────── */

const dateOnlyLabel = (iso: string) =>
  new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const numOrUndef = (s: string) => { const v = parseFloat(s); return isNaN(v) ? undefined : v; };

/** Small uppercase mini-label used inside panels. */
function PanelLabel({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: font.body700, fontSize: 10.5, letterSpacing: 0.9, textTransform: 'uppercase', color: color.muted }}>{children}</Text>;
}

/** Wrapping multi-select chip row (selected = teal). */
function WrapChips({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => {
        const sel = selected.includes(opt);
        return (
          <Pressable key={opt} onPress={() => onToggle(opt)} style={{ paddingVertical: 8, paddingHorizontal: 13, borderRadius: radius.pill, backgroundColor: sel ? color.maternalTeal : '#fff', borderWidth: 1, borderColor: sel ? color.maternalTeal : color.hairline }}>
            <Text style={{ fontFamily: font.body600, fontSize: 12.5, color: sel ? '#fff' : color.ink }}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Single-select wrapping chip row. */
function SelectChips({ options, value, onChange }: { options: string[]; value: string | null; onChange: (v: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => {
        const sel = opt === value;
        return (
          <Pressable key={opt} onPress={() => onChange(opt)} style={{ paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: sel ? color.maternalTeal : '#fff', borderWidth: 1, borderColor: sel ? color.maternalTeal : color.hairline }}>
            <Text style={{ fontFamily: font.body600, fontSize: 12.5, color: sel ? '#fff' : color.ink }}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted }}>{text}</Text>;
}

/** A small bordered list row with optional trailing delete. */
function PanelRow({ title, sub, onDelete }: { title: string; sub?: string; onDelete?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: color.canvas, borderRadius: radius.tile, paddingVertical: 10, paddingHorizontal: 12 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>{title}</Text>
        {sub ? <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>{sub}</Text> : null}
      </View>
      {onDelete && (
        <Pressable onPress={onDelete} hitSlop={8} style={{ padding: 2 }}><X size={16} color={color.faint} /></Pressable>
      )}
    </View>
  );
}

/** A checklist row (toggle + optional delete). */
function CheckRow({ label, checked, onToggle, onDelete }: { label: string; checked: boolean; onToggle: () => void; onDelete?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: color.canvas, borderRadius: radius.tile, paddingVertical: 10, paddingHorizontal: 12 }}>
      <Pressable onPress={onToggle} hitSlop={8} style={{ width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: checked ? color.maternalTeal : '#fff', borderWidth: 1.5, borderColor: checked ? color.maternalTeal : color.hairline }}>
        {checked && <CheckCircle size={14} color="#fff" />}
      </Pressable>
      <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 13, color: color.ink, textDecorationLine: checked ? 'line-through' : 'none' }}>{label}</Text>
      {onDelete && <Pressable onPress={onDelete} hitSlop={8} style={{ padding: 2 }}><X size={16} color={color.faint} /></Pressable>}
    </View>
  );
}

function CardPanel({ cardKey, dueDate, maternalBirth, ppWeeks, onClose }: { cardKey: string; dueDate: string | null; maternalBirth: string | null; ppWeeks: number; onClose: () => void }) {
  switch (cardKey) {
    case 'checkin': return <CheckinPanel onClose={onClose} />;
    case 'week': return <WeekPanel dueDate={dueDate} />;
    case 'appts': return <PregApptsPanel />;
    case 'triage': return <TriagePanel />;
    case 'prep': return <BirthPrepPanel />;
    case 'names': return <NamesPanel />;
    case 'epds': return <WellbeingPanel />;
    case 'recovery': return <RecoveryPanel />;
    case 'matappts': return <MatApptsPanel />;
    case 'pelvic': return <PelvicPanel />;
    case 'next': return <PlanningPanel />;
    case 'story': return <StoryPanel maternalBirth={maternalBirth} ppWeeks={ppWeeks} />;
    default: return null;
  }
}

/* PREGNANCY ---------------------------------------------------------------- */

function CheckinPanel({ onClose }: { onClose: () => void }) {
  const { checkins, addCheckin } = useData();
  const [mood, setMood] = useState<number>(2);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [weight, setWeight] = useState('');
  const latest = checkins[0];
  const toggleSym = (s: string) => setSymptoms((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  const save = () => { addCheckin({ mood, symptoms, weightKg: numOrUndef(weight) }); onClose(); };
  return (
    <View style={{ gap: 14 }}>
      {latest && (
        <View style={{ backgroundColor: color.canvas, borderRadius: radius.tile, padding: 12 }}>
          <PanelLabel>Latest check-in</PanelLabel>
          <Text style={{ fontFamily: font.body600, fontSize: 13, color: color.ink, marginTop: 4 }}>
            {MOODS[latest.mood] ?? '—'}{latest.weightKg ? ` · ${latest.weightKg} kg` : ''}{latest.symptoms.length ? ` · ${latest.symptoms.join(', ')}` : ''}
          </Text>
          <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.muted, marginTop: 2 }}>{dayTimeOf(latest.at)}</Text>
        </View>
      )}
      <View style={{ gap: 8 }}>
        <PanelLabel>How are you feeling?</PanelLabel>
        <SelectChips options={MOODS} value={MOODS[mood]} onChange={(v) => setMood(Math.max(0, MOODS.indexOf(v)))} />
      </View>
      <View style={{ gap: 8 }}>
        <PanelLabel>Symptoms</PanelLabel>
        <WrapChips options={PREG_SYMPTOMS} selected={symptoms} onToggle={toggleSym} />
      </View>
      <Field label="Weight (kg)" value={weight} onChangeText={setWeight} placeholder="e.g. 68.5" keyboardType="default" />
      <Button label="Save check-in" onPress={save} />
    </View>
  );
}

function WeekPanel({ dueDate }: { dueDate: string | null }) {
  const [week, setWeek] = useState<number>(() => gestFromDueDate(dueDate ?? undefined)?.week ?? 12);
  const c = weekContent(week);
  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => setWeek((w) => Math.max(1, w - 1))} hitSlop={8} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: color.canvas, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={20} color={color.tealDeep} />
        </Pressable>
        <Text style={{ fontFamily: font.display700, fontSize: 20, color: color.ink }}>Week {week}</Text>
        <Pressable onPress={() => setWeek((w) => Math.min(42, w + 1))} hitSlop={8} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: color.canvas, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronRight size={20} color={color.tealDeep} />
        </Pressable>
      </View>
      <View style={{ backgroundColor: color.canvas, borderRadius: radius.tile, padding: 14, gap: 6 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.ink }}>Size of a {c.size}</Text>
        <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.inkSecondary }}>~{c.lengthCm} cm · ~{c.weightG} g</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted, marginTop: 2 }}>{c.note}</Text>
      </View>
    </View>
  );
}

function PregApptsPanel() {
  const { pregAppts, addPregAppt, deletePregAppt } = useData();
  const now = Date.now();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayISO());
  const upcoming = [...pregAppts]
    .filter((a) => new Date(a.at).getTime() >= now)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    .slice(0, 3);
  const add = () => { if (!title.trim()) return; addPregAppt({ title, at: `${date}T09:00:00`, kind: 'appointment' }); setTitle(''); setDate(todayISO()); };
  return (
    <View style={{ gap: 14 }}>
      <View style={{ gap: 8 }}>
        <PanelLabel>Upcoming</PanelLabel>
        {upcoming.length === 0 ? <EmptyHint text="No upcoming appointments yet." /> : upcoming.map((a) => (
          <PanelRow key={a.id} title={a.title} sub={apptDateLabel(a.at)} onDelete={() => deletePregAppt(a.id)} />
        ))}
      </View>
      <View style={{ gap: 10 }}>
        <PanelLabel>Add appointment</PanelLabel>
        <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. 20-week scan" autoCapitalize="sentences" />
        <DateField label="Date" value={date} onChangeText={setDate} />
        <Button label="Add" onPress={add} />
      </View>
    </View>
  );
}

function TriagePanel() {
  return (
    <View style={{ gap: 14 }}>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ backgroundColor: '#FBE0EA', borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 11 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 11, color: color.roseInk }}>Call now</Text>
          </View>
        </View>
        {RED_FLAGS_CALL_NOW.map((f, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
            <Text style={{ color: color.roseInk, fontFamily: font.body700 }}>•</Text>
            <Text style={{ flex: 1, fontFamily: font.body500, fontSize: 13, color: color.ink }}>{f}</Text>
          </View>
        ))}
      </View>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ backgroundColor: '#FBF1CE', borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 11 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 11, color: color.goldInk }}>Call soon</Text>
          </View>
        </View>
        {RED_FLAGS_CALL_SOON.map((f, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
            <Text style={{ color: color.goldInk, fontFamily: font.body700 }}>•</Text>
            <Text style={{ flex: 1, fontFamily: font.body500, fontSize: 13, color: color.ink }}>{f}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function BirthPrepPanel() {
  const { birthPrep, addBirthPrep, toggleBirthPrep } = useData();
  const [label, setLabel] = useState('');
  const add = () => { if (!label.trim()) return; addBirthPrep({ category: 'General', label }); setLabel(''); };
  return (
    <View style={{ gap: 14 }}>
      <View style={{ gap: 8 }}>
        <PanelLabel>Checklist</PanelLabel>
        {birthPrep.length === 0 ? <EmptyHint text="Nothing on your list yet — add an item below." /> : birthPrep.map((i) => (
          <CheckRow key={i.id} label={i.label} checked={i.checked} onToggle={() => toggleBirthPrep(i.id)} />
        ))}
      </View>
      <View style={{ gap: 10 }}>
        <Field label="Add item" value={label} onChangeText={setLabel} placeholder="e.g. Pack hospital bag" autoCapitalize="sentences" />
        <Button label="Add" onPress={add} />
      </View>
    </View>
  );
}

function NamesPanel() {
  const { savedNames, saveName, deleteName } = useData();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Girl');
  const add = () => { if (!name.trim()) return; saveName({ name: name.trim(), gender }); setName(''); };
  return (
    <View style={{ gap: 14 }}>
      <View style={{ gap: 8 }}>
        <PanelLabel>Saved names</PanelLabel>
        {savedNames.length === 0 ? <EmptyHint text="No saved names yet." /> : savedNames.map((n) => (
          <PanelRow key={n.id} title={n.name} sub={n.gender} onDelete={() => deleteName(n.id)} />
        ))}
      </View>
      <View style={{ gap: 10 }}>
        <Field label="Add a name" value={name} onChangeText={setName} placeholder="e.g. Maya" autoCapitalize="words" />
        <SelectChips options={['Girl', 'Boy', 'Unisex']} value={gender} onChange={setGender} />
        <Button label="Save name" onPress={add} />
      </View>
    </View>
  );
}

/* POSTPARTUM --------------------------------------------------------------- */

function WellbeingPanel() {
  const { epdsResults, addEpdsResult } = useData();
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState<{ total: number; band: string; selfHarmFlag: boolean } | null>(null);
  const latest = epdsResults[0];

  const start = () => { setRunning(true); setStep(0); setAnswers([]); setDone(null); };
  const choose = (opt: number) => {
    const next = [...answers]; next[step] = opt; setAnswers(next);
    if (step + 1 < EPDS_QUESTIONS.length) { setStep(step + 1); return; }
    const result = scoreEpds(next);
    addEpdsResult(result);
    setDone(result);
    setRunning(false);
  };

  if (running) {
    const q = EPDS_QUESTIONS[step];
    return (
      <View style={{ gap: 14 }}>
        <PanelLabel>Question {step + 1} of {EPDS_QUESTIONS.length}</PanelLabel>
        <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.ink }}>{q.prompt}</Text>
        <View style={{ gap: 8 }}>
          {q.options.map((o, i) => (
            <Pressable key={i} onPress={() => choose(i)} style={{ backgroundColor: color.canvas, borderRadius: radius.tile, paddingVertical: 13, paddingHorizontal: 14, borderWidth: 1, borderColor: color.hairline }}>
              <Text style={{ fontFamily: font.body600, fontSize: 13, color: color.ink }}>{o.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  const shown = done ?? (latest ? { total: latest.total, band: latest.band, selfHarmFlag: latest.selfHarmFlag } : null);
  const showCrisis = shown ? (shown.selfHarmFlag || shown.band === 'likely') : false;

  return (
    <View style={{ gap: 14 }}>
      {shown ? (
        <View style={{ backgroundColor: color.canvas, borderRadius: radius.tile, padding: 14, gap: 4 }}>
          <PanelLabel>{done ? 'Your result' : 'Latest check'}</PanelLabel>
          <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.ink }}>{BAND_LABEL[shown.band as keyof typeof BAND_LABEL] ?? shown.band} · {shown.total}/30</Text>
          {!done && latest && <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.muted }}>{dayTimeOf(latest.at)}</Text>}
        </View>
      ) : (
        <EmptyHint text="No wellbeing check yet. The EPDS is a quick 10-question screen." />
      )}
      {showCrisis && (
        <View style={{ backgroundColor: '#FBE0EA', borderRadius: radius.tile, padding: 14, gap: 8 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.roseInk }}>You're not alone — please reach out</Text>
          {CRISIS_RESOURCES.map((r, i) => (
            <View key={i}>
              <Text style={{ fontFamily: font.body700, fontSize: 12.5, color: color.ink }}>{r.name}</Text>
              <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.inkSecondary }}>{r.detail}</Text>
            </View>
          ))}
        </View>
      )}
      <Button label={shown ? 'Start a new check' : 'Start check'} onPress={start} />
    </View>
  );
}

function RecoveryPanel() {
  const { recoveryLogs, addRecoveryLog } = useData();
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [lochia, setLochia] = useState<Lochia | null>(null);
  const [note, setNote] = useState('');
  const recent = recoveryLogs.slice(0, 3);
  const save = () => {
    if (!sys && !dia && !lochia && !note.trim()) return;
    addRecoveryLog({ systolic: numOrUndef(sys), diastolic: numOrUndef(dia), lochia: lochia ?? undefined, note: note.trim() || undefined });
    setSys(''); setDia(''); setLochia(null); setNote('');
  };
  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="Systolic" value={sys} onChangeText={setSys} placeholder="e.g. 118" /></View>
        <View style={{ flex: 1 }}><Field label="Diastolic" value={dia} onChangeText={setDia} placeholder="e.g. 76" /></View>
      </View>
      <View style={{ gap: 8 }}>
        <PanelLabel>Lochia (bleeding)</PanelLabel>
        <SelectChips options={['none', 'light', 'moderate', 'heavy']} value={lochia} onChange={(v) => setLochia(v as Lochia)} />
      </View>
      <Field label="Note (optional)" value={note} onChangeText={setNote} placeholder="How are you healing?" autoCapitalize="sentences" />
      <Button label="Save log" onPress={save} />
      {recent.length > 0 && (
        <View style={{ gap: 8 }}>
          <PanelLabel>Recent</PanelLabel>
          {recent.map((r) => {
            const bits = [
              r.systolic || r.diastolic ? `${r.systolic ?? '–'}/${r.diastolic ?? '–'}` : null,
              r.lochia ? `lochia: ${r.lochia}` : null,
              r.note || null,
            ].filter(Boolean).join(' · ');
            return <PanelRow key={r.id} title={bits || 'Logged'} sub={dayTimeOf(r.at)} />;
          })}
        </View>
      )}
    </View>
  );
}

function MatApptsPanel() {
  const { matAppts, addMatAppt, deleteMatAppt } = useData();
  const now = Date.now();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayISO());
  const upcoming = [...matAppts]
    .filter((a) => new Date(a.at).getTime() >= now)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    .slice(0, 3);
  const add = () => { if (!title.trim()) return; addMatAppt({ title, at: `${date}T10:00:00`, kind: 'appointment' }); setTitle(''); setDate(todayISO()); };
  return (
    <View style={{ gap: 14 }}>
      <View style={{ gap: 8 }}>
        <PanelLabel>Upcoming</PanelLabel>
        {upcoming.length === 0 ? <EmptyHint text="No upcoming appointments yet." /> : upcoming.map((a) => (
          <PanelRow key={a.id} title={a.title} sub={apptDateLabel(a.at)} onDelete={() => deleteMatAppt(a.id)} />
        ))}
      </View>
      <View style={{ gap: 10 }}>
        <PanelLabel>Add appointment</PanelLabel>
        <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. 6-week check" autoCapitalize="sentences" />
        <DateField label="Date" value={date} onChangeText={setDate} />
        <Button label="Add" onPress={add} />
      </View>
    </View>
  );
}

function PelvicPanel() {
  const { pelvicLog, addPelvic } = useData();
  const [exercise, setExercise] = useState('');
  const recent = pelvicLog.slice(0, 3);
  const add = () => { if (!exercise.trim()) return; addPelvic(exercise.trim()); setExercise(''); };
  return (
    <View style={{ gap: 14 }}>
      <View style={{ gap: 10 }}>
        <Field label="Log an exercise" value={exercise} onChangeText={setExercise} placeholder="e.g. Kegels × 10" autoCapitalize="sentences" />
        <Button label="Add" onPress={add} />
      </View>
      <View style={{ gap: 8 }}>
        <PanelLabel>Recent</PanelLabel>
        {recent.length === 0 ? <EmptyHint text="No sessions logged yet." /> : recent.map((p) => (
          <PanelRow key={p.id} title={p.exercise} sub={dayTimeOf(p.at)} />
        ))}
      </View>
    </View>
  );
}

function PlanningPanel() {
  const { lastPeriod, setLastPeriod, cycleLength, setCycleLength, ttcItems, addTtc, toggleTtc } = useData();
  const [cycle, setCycle] = useState(String(cycleLength));
  const [item, setItem] = useState('');
  const add = () => { if (!item.trim()) return; addTtc(item.trim()); setItem(''); };
  return (
    <View style={{ gap: 14 }}>
      <DateField label="Last period" value={lastPeriod ?? ''} onChangeText={(d) => setLastPeriod(d || null)} />
      <View style={{ gap: 8 }}>
        <Field label="Cycle length (days)" value={cycle} onChangeText={setCycle} placeholder="e.g. 28" />
        <Button label="Save cycle length" variant="secondary" onPress={() => { const n = parseInt(cycle, 10); if (!isNaN(n)) setCycleLength(n); }} />
      </View>
      <View style={{ gap: 8 }}>
        <PanelLabel>Trying-to-conceive checklist</PanelLabel>
        {ttcItems.length === 0 ? <EmptyHint text="No items yet." /> : ttcItems.map((i) => (
          <CheckRow key={i.id} label={i.label} checked={i.checked} onToggle={() => toggleTtc(i.id)} />
        ))}
      </View>
      <View style={{ gap: 10 }}>
        <Field label="Add item" value={item} onChangeText={setItem} placeholder="e.g. Start prenatal vitamins" autoCapitalize="sentences" />
        <Button label="Add" onPress={add} />
      </View>
    </View>
  );
}

function StoryPanel({ maternalBirth, ppWeeks }: { maternalBirth: string | null; ppWeeks: number }) {
  const { epdsResults, recoveryLogs, milestones } = useData();
  const latestEpds = epdsResults[0];
  const latestRecovery = recoveryLogs[0];
  const recentMilestones = milestones.slice(0, 3);
  return (
    <View style={{ gap: 12 }}>
      <View style={{ backgroundColor: color.canvas, borderRadius: radius.tile, padding: 14, gap: 4 }}>
        <PanelLabel>Recap</PanelLabel>
        <Text style={{ fontFamily: font.body600, fontSize: 13, color: color.ink }}>
          {maternalBirth ? `${ppWeeks} weeks postpartum` : 'Postpartum journey'}
        </Text>
        <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.inkSecondary }}>
          Wellbeing: {latestEpds ? (BAND_LABEL[latestEpds.band as keyof typeof BAND_LABEL] ?? latestEpds.band) : 'not checked yet'}
        </Text>
        <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.inkSecondary }}>
          Recovery: {latestRecovery
            ? [latestRecovery.systolic || latestRecovery.diastolic ? `${latestRecovery.systolic ?? '–'}/${latestRecovery.diastolic ?? '–'}` : null, latestRecovery.lochia ? `lochia ${latestRecovery.lochia}` : null].filter(Boolean).join(' · ') || 'logged'
            : 'no logs yet'}
        </Text>
      </View>
      <View style={{ gap: 8 }}>
        <PanelLabel>Recent milestones</PanelLabel>
        {recentMilestones.length === 0 ? <EmptyHint text="No milestones recorded yet." /> : recentMilestones.map((m) => (
          <PanelRow key={m.id} title={m.title} sub={dateOnlyLabel(m.date)} />
        ))}
      </View>
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
