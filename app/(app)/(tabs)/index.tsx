import React, { useState, useRef } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, childToken } from '../../../src/theme/tokens';
import { Button, Field } from '../../../src/components/forms';
import { Logo } from '../../../src/components/Logo';
import {
  ChevronRight, Bottle, Calendar as CalendarIcon, Syringe,
  Heart, Calendar as CalIcon, Activity, Smile, Shield, CheckCircle, Star, Leaf, X, Plus, ChevronLeft, Check,
  HeartPulse, StarOutline, BarChart, User,
} from '../../../src/components/icons';
import { EntryIcon } from '../../../src/components/EntryIcon';
import { Silhouette, ProgressBar } from '../../../src/components/ui';
import { DateField } from '../../../src/components/DateField';
import { DurationField } from '../../../src/components/DurationField';
import { useSupabase } from '../../../src/lib/supabase';
import { ageLabel, stageFrom } from '../../../src/lib/age';
import {
  gestFromDueDate, weekContent, MOODS, PREG_SYMPTOMS, RED_FLAGS_CALL_NOW, RED_FLAGS_CALL_SOON, dueDateFromLmp, TRIMESTER_TIPS, BABY_NAMES,
} from '../../../src/lib/pregnancy';
import { EPDS_QUESTIONS, scoreEpds, BAND_LABEL, CRISIS_RESOURCES } from '../../../src/lib/epds';
import { youStoryEvents } from '../../../src/lib/story';
import { childRhythm, nextFeed, napWindow, childNudges, pregnancyNudges, fmtDur, type Nudge, type Prediction, type ChildRhythm } from '../../../src/lib/intelligence';
import { DayTimeline } from '../../../src/components/DayTimeline';
import {
  useData, entriesOn, upcomingEvents, entryDetail, ENTRY_META, quickLogKinds, MOOD_LABELS, CHILD_COLORS,
  type EntryKind, type FeedSide, type DiaperType, type Child, type Lochia, type ChildColor, type PregArchive, type PregStatus,
  type Entry, type EventItem, type Vaccine, type Medication, type KickSession, type PregVital, type PregCheckin, type PregAppt,
} from '../../../src/lib/store';
import HealthTab from '../health';
import TimelineTab from '../timeline';
import InsightsScreen from '../insights';
import RoutinesScreen from '../routines';
import CoParentScreen from '../coparent';

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
    dueDate, setDueDate, maternalBirth, setMaternalBirth, pregAppts, matAppts,
    addChild, savedNames, pregArchive, closePregnancy, dockSide, setDockSide,
    medications, kickSessions, pregVitals, checkins,
  } = useData();

  // Maternity ("You") journey availability + person switching.
  const hasJourney = !!maternalBirth || !!dueDate;
  const [person, setPerson] = useState<'you' | string>(() => {
    if (children.length > 0) return activeChild?.id ?? children[0].id;
    return hasJourney ? 'you' : (activeChild?.id ?? '');
  });
  const isYou = person === 'you';
  // A "More" category can take over the content column (rendered inline, same page).
  const [activeCat, setActiveCat] = useState<string | null>(null);
  // Family overview is the home when there's more than one module (kids + Mum&Me).
  const multiModule = children.length + (hasJourney ? 1 : 0) >= 2;
  const [showOverview, setShowOverview] = useState(true);
  const onOverview = multiModule && showOverview && !activeCat;
  // Today timeline layout (horizontal ribbon ↔ 24h dial).
  const [tlLayout, setTlLayout] = useState<'ribbon' | 'clock'>('ribbon');

  // Mum&Me phase tab — default to where she is: pregnancy while expecting,
  // postpartum once the baby has arrived.
  const [phase, setPhase] = useState<'pregnancy' | 'postpartum'>(maternalBirth ? 'postpartum' : 'pregnancy');

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
    closePregnancy(handoffDate); // archive the pregnancy (read-only) + close the live one
    setMaternalBirth(handoffDate);
    setPhase('postpartum');
    setHandoffStep('done');
  }

  // Start a fresh pregnancy (reopens the live Mum&Me pregnancy view).
  const [dueOpen, setDueOpen] = useState(false);
  const [dueIn, setDueIn] = useState('');
  const [lmpIn, setLmpIn] = useState('');
  function openDuePicker() { setDueIn(''); setLmpIn(''); setDueOpen(true); }
  function saveDue() {
    const dd = dueIn.trim() || (lmpIn.trim() ? dueDateFromLmp(lmpIn.trim()) : '');
    if (!dd) return;
    setDueDate(dd);
    setDueOpen(false);
    setPhase('pregnancy');
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

  // On-device intelligence for the focused child / pregnancy.
  const now = Date.now();
  const rhythm = cid ? childRhythm(cid, entries, now) : null;
  const feedPred = rhythm ? nextFeed(rhythm, now) : null;
  const napPred = rhythm ? napWindow(rhythm, now) : null;
  const childNudgeList = cid && rhythm ? childNudges(cid, { entries, medications, vaccines }, rhythm, now) : [];
  const pregNudgeList = hasJourney && !maternalBirth
    ? pregnancyNudges({ kickSessions, pregVitals, checkins, pregAppts }, gestFromDueDate(dueDate ?? undefined)?.week ?? null, now)
    : [];
  const tlItems = today.map((e) => ({ id: e.id, title: ENTRY_META[e.kind].label, at: e.at, color: ENTRY_META[e.kind].ink }));

  const showDock = children.length > 0 || hasJourney;
  // The reserved rail keeps content inset; padding hugs the rail edge, breathes on the other.
  const padStart = dockSide === 'right' ? 20 : 10;
  const padEnd = dockSide === 'right' ? 10 : 20;
  const railProps = {
    children, activeId: activeChild?.id, isYou, hasJourney, activeCat,
    youLabel: youStatusLabel(dueDate, maternalBirth),
    onSelectChild: (id: string) => { setActiveCat(null); setShowOverview(false); setPerson(id); setActiveChild(id); },
    onSelectYou: () => { setActiveCat(null); setShowOverview(false); setPerson('you'); },
    onAdd: () => router.push('/(app)/(tabs)/family' as any),
    // Categories load inline on this page (left of the rail) — not a new route.
    onNavigate: (key: string) => setActiveCat(key),
  };
  const catLabel = activeCat ? RAIL_CATS.find((c) => c.key === activeCat)?.label ?? '' : '';
  const goOverview = () => { setActiveCat(null); setShowOverview(true); };
  return (
    <View style={{ flex: 1, backgroundColor: color.canvas }}>
      {/* Fixed header — the rail runs from just beneath this down to the bottom */}
      <View style={{ paddingTop: insets.top + 14, paddingHorizontal: 20, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 2 }}>
          <Logo width={22} height={26} />
          <Text style={{ fontFamily: font.display700, fontSize: 19, color: color.ink }}>Everly</Text>
        </View>
        {onOverview ? (
          // Family overview is the home — a light greeting reads as the page title.
          <Text style={{ fontFamily: font.display700, fontSize: 20, color: color.ink, paddingHorizontal: 2, marginTop: 2 }}>{greeting()}, {name}</Text>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 2 }}>
            {multiModule && (
              <Pressable onPress={goOverview} hitSlop={8} accessibilityLabel="Back to family overview" style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 2, opacity: pressed ? 0.6 : 1 })}>
                <ChevronLeft size={16} color={color.primary} />
                <Text style={{ fontFamily: font.body700, fontSize: 12.5, color: color.primary }}>Family</Text>
              </Pressable>
            )}
            {showDock && (
              <Text style={{ fontFamily: font.body600, fontSize: 13, color: color.muted }}>
                {multiModule ? '· ' : ''}{activeCat ? catLabel : isYou ? `Mum&Me · ${youStatusLabel(dueDate, maternalBirth)}` : (activeChild ? `${activeChild.name}${activeChild.birthDate ? ` · ${ageLabel(activeChild.birthDate)}` : ''}` : '')}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Content + reserved rail */}
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {showDock && dockSide === 'left' && <RailDock {...railProps} side="left" onMirror={() => setDockSide('right')} />}
    {activeCat ? (
      <View style={{ flex: 1 }}><CategoryView cat={activeCat} /></View>
    ) : (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: 10, paddingBottom: 28, paddingLeft: padStart, paddingRight: padEnd, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >

      {/* ── Family overview (home) ────────────────────────────────────────── */}
      {onOverview && (
        <FamilyOverview
          children={children}
          hasJourney={hasJourney}
          dueDate={dueDate}
          maternalBirth={maternalBirth}
          data={{ entries, events, vaccines, medications, kickSessions, pregVitals, checkins, pregAppts }}
          now={now}
          onSelectChild={(id) => { setShowOverview(false); setPerson(id); setActiveChild(id); }}
          onSelectYou={() => { setShowOverview(false); setPerson('you'); }}
        />
      )}

      {/* ── You (maternity) view ──────────────────────────────────────────── */}
      {!onOverview && isYou && (
        <MaternityView
          phase={phase}
          setPhase={setPhase}
          dueDate={dueDate}
          maternalBirth={maternalBirth}
          pregAppts={pregAppts}
          matAppts={matAppts}
          pregArchive={pregArchive}
          nudges={pregNudgeList}
          onArrived={openHandoff}
          onStartPregnancy={openDuePicker}
        />
      )}

      {/* ── Child view (existing Today content) ───────────────────────────── */}
      {!onOverview && !isYou && <>

      {/* Predicted (top) + today's actuals stacked directly beneath */}
      <PredictionHero nap={napPred} feed={feedPred} rhythm={rhythm} />
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

      {/* Smart nudges — below predicted/actual, above up next */}
      <NudgeList items={childNudgeList} />

      {/* Up next — above the timeline */}
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

      {/* Today's timeline — horizontal ribbon or 24h dial (switchable) */}
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Label>Today · {today.length} {today.length === 1 ? 'entry' : 'entries'}</Label>
          <View style={{ flexDirection: 'row', backgroundColor: '#EFEDF8', borderRadius: radius.pill, padding: 3 }}>
            {(['ribbon', 'clock'] as const).map((l) => {
              const on = tlLayout === l;
              return (
                <Pressable key={l} onPress={() => setTlLayout(l)} style={{ paddingVertical: 5, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: on ? color.primary : 'transparent' }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 11, color: on ? '#fff' : color.muted }}>{l === 'ribbon' ? 'Line' : 'Dial'}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        {today.length === 0 ? (
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 22, alignItems: 'center' }, shadow.card]}>
            <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.muted, textAlign: 'center' }}>Nothing logged yet today.{'\n'}Use Quick log below to add your first entry.</Text>
          </View>
        ) : (
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, paddingVertical: 16, paddingHorizontal: 8 }, shadow.card]}>
            <DayTimeline items={tlItems} layout={tlLayout} />
          </View>
        )}
      </View>

      {/* Quick log — moved to the bottom */}
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

      </>}

      {/* Detail modal */}
      <Modal visible={kind !== null} transparent animationType="fade" onRequestClose={() => setKind(null)}>
        <Pressable onPress={() => setKind(null)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>{kind ? ENTRY_META[kind].label : ''}</Text>
            {kind === 'feed' && <Chips options={[['left', 'Left'], ['right', 'Right'], ['bottle', 'Bottle']]} value={side} onChange={(v) => setSide(v as FeedSide)} />}
            {kind === 'feed' && side === 'bottle' && <Field label="Amount (ml)" value={ml} onChangeText={setMl} placeholder="e.g. 120" />}
            {(kind === 'feed' || kind === 'sleep' || kind === 'activity') && <DurationField label="Duration" value={mins} onChange={setMins} />}
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

      {/* Start-a-new-pregnancy due date modal */}
      <Modal visible={dueOpen} transparent animationType="fade" onRequestClose={() => setDueOpen(false)}>
        <Pressable onPress={() => setDueOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Start a new pregnancy</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>Add your due date — or your last period date and we'll estimate it.</Text>
            <DateField label="Due date" value={dueIn} onChangeText={setDueIn} />
            <DateField label="Last period (optional)" value={lmpIn} onChangeText={setLmpIn} optional />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setDueOpen(false)} style={{ flex: 1 }} />
              <Button label="Save" onPress={saveDue} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
    )}
        {showDock && dockSide === 'right' && <RailDock {...railProps} side="right" onMirror={() => setDockSide('left')} />}
      </View>
    </View>
  );
}

/* Renders a "More" category inline as the content column (it brings its own scroll). */
function CategoryView({ cat }: { cat: string }) {
  switch (cat) {
    case 'health': return <HealthTab embedded />;
    case 'timeline': return <TimelineTab embedded />;
    case 'insights': return <InsightsScreen embedded />;
    case 'routines': return <RoutinesScreen embedded />;
    case 'coparent': return <CoParentScreen embedded />;
    default: return null;
  }
}

/* ── On-device intelligence UI ──────────────────────────────────────────────
   Prediction hero + smart-nudge list + the family-overview home. */

function HeroChip({ v, l }: { v: string; l: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 10, paddingVertical: 7, alignItems: 'center' }}>
      <Text style={{ fontFamily: font.body700, fontSize: 12.5, color: '#fff' }}>{v}</Text>
      <Text style={{ fontFamily: font.body500, fontSize: 8.5, color: 'rgba(255,255,255,0.85)', marginTop: 1 }}>{l}</Text>
    </View>
  );
}

/** Predicted next nap window (or next feed) for the focused child. Hidden on cold-start. */
function PredictionHero({ nap, feed, rhythm }: { nap: Prediction | null; feed: Prediction | null; rhythm: ChildRhythm | null }) {
  const p = nap ?? feed;
  if (!p || !rhythm) return null;
  return (
    <View style={[{ backgroundColor: color.primary, borderRadius: radius.card, padding: 18, gap: 4 }, shadow.card]}>
      <Text style={{ fontFamily: font.body700, fontSize: 10, letterSpacing: 0.7, textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>{p.label} · est.</Text>
      <Text style={{ fontFamily: font.display700, fontSize: 23, color: '#fff' }}>{p.window}</Text>
      <Text style={{ fontFamily: font.body500, fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>{p.sub}</Text>
      <View style={{ flexDirection: 'row', gap: 7, marginTop: 8 }}>
        {rhythm.avgFeedMin ? <HeroChip v={`~${fmtDur(rhythm.avgFeedMin)}`} l="between feeds" /> : null}
        <HeroChip v={`${rhythm.napsToday}`} l="naps today" />
        <HeroChip v={rhythm.sleepTodayMin ? fmtDur(rhythm.sleepTodayMin) : '—'} l="sleep today" />
      </View>
    </View>
  );
}

/** "Needs a look" — the top few smart nudges. */
function NudgeList({ items }: { items: Nudge[] }) {
  if (!items.length) return null;
  return (
    <View style={{ gap: 10 }}>
      <Label>Needs a look</Label>
      {items.slice(0, 3).map((n) => (
        <View key={n.id} style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 }, shadow.card]}>
          <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: color.canvas, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16 }}>{n.icon}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>{n.title}</Text>
            {n.sub ? <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.muted, marginTop: 1 }}>{n.sub}</Text> : null}
          </View>
          {n.cta ? <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.primary }}>{n.cta}</Text> : null}
        </View>
      ))}
    </View>
  );
}

type Pill = { t: string; bg: string; fg: string };
function MemberCard({ title, line, pills, avatarBg, avatarFg, initial, heart, onPress }: {
  title: string; line: string; pills: Pill[]; avatarBg: string; avatarFg: string; initial?: string; heart?: boolean; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}>
      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 13, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }, shadow.card]}>
        <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: avatarBg, alignItems: 'center', justifyContent: 'center' }}>
          {heart ? <Heart size={20} color={avatarFg} filled /> : <Text style={{ fontFamily: font.display700, fontSize: 17, color: avatarFg }}>{initial}</Text>}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: font.display700, fontSize: 15.5, color: color.ink }}>{title}</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.muted, marginTop: 2 }}>{line}</Text>
          {pills.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {pills.map((p, i) => (
                <View key={i} style={{ backgroundColor: p.bg, borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 9 }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 10.5, color: p.fg }}>{p.t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={{ alignSelf: 'center' }}><ChevronRight size={16} color={color.faint} /></View>
      </View>
    </Pressable>
  );
}

/** Family overview — the home view; everyone at a glance, headlines from the engine. */
function FamilyOverview({
  children, hasJourney, dueDate, maternalBirth, data, now, onSelectChild, onSelectYou,
}: {
  children: Child[];
  hasJourney: boolean;
  dueDate: string | null;
  maternalBirth: string | null;
  data: { entries: Entry[]; events: EventItem[]; vaccines: Vaccine[]; medications: Medication[]; kickSessions: KickSession[]; pregVitals: PregVital[]; checkins: PregCheckin[]; pregAppts: PregAppt[] };
  now: number;
  onSelectChild: (id: string) => void;
  onSelectYou: () => void;
}) {
  const childCards = children.map((ch) => {
    const r = childRhythm(ch.id, data.entries, now);
    const feedP = nextFeed(r, now);
    const napP = napWindow(r, now);
    const nds = childNudges(ch.id, { entries: data.entries, medications: data.medications, vaccines: data.vaccines }, r, now);
    const bits: string[] = [];
    if (r.lastSleepEndAt && r.lastSleepEndAt < now) bits.push(`Awake ${fmtDur(Math.round((now - r.lastSleepEndAt) / 60000))}`);
    if (r.lastFeedAt) bits.push(`last feed ${agoLabel(new Date(r.lastFeedAt).toISOString())}`);
    const pills: Pill[] = [];
    if (feedP) pills.push({ t: `🍼 Feed ${feedP.minutesAway <= 0 ? 'due' : feedP.window}`, bg: '#FCE6D8', fg: '#B5662E' });
    if (napP) pills.push({ t: `🌙 Nap ${napP.minutesAway <= 0 ? 'now' : napP.window.split(' – ')[0]}`, bg: '#E7E4FB', fg: '#6B6FC9' });
    if (!pills.length && nds[0]) pills.push({ t: `${nds[0].icon} ${nds[0].title}`, bg: '#FBF1CE', fg: '#7A5C20' });
    const t = childToken[ch.color];
    return {
      ch, t,
      line: bits.length ? bits.join(' · ') : 'No entries yet today',
      title: `${ch.name}${ch.birthDate ? ` · ${ageLabel(ch.birthDate)}` : ''}`,
      pills, nudgeCount: nds.length,
    };
  });

  const gest = gestFromDueDate(dueDate ?? undefined);
  const pregNudges = hasJourney && !maternalBirth
    ? pregnancyNudges({ kickSessions: data.kickSessions, pregVitals: data.pregVitals, checkins: data.checkins, pregAppts: data.pregAppts }, gest?.week ?? null, now)
    : [];
  const youTitle = `Mum&Me · ${youStatusLabel(dueDate, maternalBirth)}`;
  const youLine = maternalBirth ? 'Postpartum recovery & wellbeing' : (gest ? `${gest.daysToGo} days to go · Trimester ${gest.trimester}` : 'Your space');
  const youPills: Pill[] = pregNudges.slice(0, 2).map((n) => ({ t: `${n.icon} ${n.title}`, bg: '#FBE0EA', fg: '#B04070' }));

  const needCount = childCards.reduce((s, c) => s + c.nudgeCount, 0) + pregNudges.length;

  return (
    <View style={{ gap: 12 }}>
      {needCount > 0 && (
        <View style={{ backgroundColor: '#FFF1DC', borderColor: '#F2DBB0', borderWidth: 1, borderRadius: 14, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          <Text style={{ fontSize: 14 }}>🔔</Text>
          <Text style={{ flex: 1, fontFamily: font.body700, fontSize: 12.5, color: '#8a6418' }}>{needCount} {needCount === 1 ? 'thing needs' : 'things need'} you today</Text>
        </View>
      )}
      <Label>Your family today</Label>
      {childCards.map((c) => (
        <MemberCard key={c.ch.id} title={c.title} line={c.line} pills={c.pills} avatarBg={c.t.fill} avatarFg={c.t.stroke} initial={c.ch.name.charAt(0).toUpperCase()} onPress={() => onSelectChild(c.ch.id)} />
      ))}
      {hasJourney && (
        <MemberCard title={youTitle} line={youLine} pills={youPills} avatarBg="#FBE0EA" avatarFg={color.rose} heart onPress={onSelectYou} />
      )}
    </View>
  );
}

/* Reserved side rail — module avatars on top, a divider, then shortcuts to the
   main "More" categories, with the mirror (handedness flip) pinned at the bottom. */
const RAIL_ICON = '#6F6E86';
const RAIL_CATS: { key: string; label: string; to: string; icon: (c: string) => React.ReactNode }[] = [
  { key: 'health', label: 'Health records', to: '/(app)/health', icon: (c) => <HeartPulse size={19} color={c} /> },
  { key: 'timeline', label: 'Timeline', to: '/(app)/timeline', icon: (c) => <StarOutline size={19} color={c} /> },
  { key: 'insights', label: 'Insights', to: '/(app)/insights', icon: (c) => <BarChart size={19} color={c} /> },
  { key: 'routines', label: 'Routines & chores', to: '/(app)/routines', icon: (c) => <CheckCircle size={18} color={c} /> },
  { key: 'coparent', label: 'Co-parent', to: '/(app)/coparent', icon: (c) => <User size={18} color={c} /> },
];

/** One rail category shortcut (shared by the promoted Insights and the rest). */
function renderCat(cat: { key: string; label: string; icon: (c: string) => React.ReactNode }, on: boolean, onNavigate: (key: string) => void) {
  return (
    <Pressable key={cat.key} onPress={() => onNavigate(cat.key)} accessibilityLabel={cat.label}>
      <View style={{ width: 36, height: 36, borderRadius: 13, backgroundColor: on ? '#E0F4EF' : color.canvas, alignItems: 'center', justifyContent: 'center', borderWidth: on ? 2 : 0, borderColor: color.maternalTeal }}>
        {cat.icon(on ? color.maternalTeal : RAIL_ICON)}
      </View>
    </Pressable>
  );
}

function RailDock({
  children, activeId, isYou, hasJourney, activeCat, youLabel, side, onSelectChild, onSelectYou, onAdd, onNavigate, onMirror,
}: {
  children: Child[];
  activeId?: string;
  isYou: boolean;
  hasJourney: boolean;
  activeCat: string | null;
  youLabel: string;
  side: 'left' | 'right';
  onSelectChild: (id: string) => void;
  onSelectYou: () => void;
  onAdd: () => void;
  onNavigate: (key: string) => void;
  onMirror: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ width: 60, paddingTop: 4, paddingBottom: insets.bottom + 6 }, side === 'right' ? { paddingRight: 10 } : { paddingLeft: 10 }]}>
      <View style={[{ flex: 1, backgroundColor: '#fff', borderRadius: 26, paddingVertical: 12, paddingHorizontal: 5, alignItems: 'center' }, shadow.card]}>
        <ScrollView
          style={{ flex: 1, alignSelf: 'stretch' }}
          contentContainerStyle={{ alignItems: 'center', gap: 9, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Mum&Me sits above the children */}
          {hasJourney && (() => {
            const youOn = !activeCat && isYou;
            return (
              <Pressable onPress={onSelectYou} accessibilityLabel={`Mum and Me, ${youLabel}`}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: youOn ? color.rose : '#FBE0EA', alignItems: 'center', justifyContent: 'center', borderWidth: youOn ? 3 : 0, borderColor: '#fff' }}>
                  <Heart size={17} color={youOn ? '#fff' : color.rose} filled />
                </View>
              </Pressable>
            );
          })()}
          {children.map((ch) => {
            const t = childToken[ch.color];
            const on = !activeCat && !isYou && ch.id === activeId;
            return (
              <Pressable key={ch.id} onPress={() => onSelectChild(ch.id)} accessibilityLabel={ch.name}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: on ? t.stroke : t.fill, alignItems: 'center', justifyContent: 'center', borderWidth: on ? 3 : 0, borderColor: '#fff' }}>
                  <Text style={{ fontFamily: font.display700, fontSize: 15, color: on ? '#fff' : t.stroke }}>{ch.name.charAt(0).toUpperCase()}</Text>
                </View>
              </Pressable>
            );
          })}
          <Pressable onPress={onAdd} accessibilityLabel="Add a family member">
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: color.canvas, alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={17} color={color.muted} />
            </View>
          </Pressable>

          {/* Insights promoted to sit with the avatars, above the divider */}
          {RAIL_CATS.filter((cat) => cat.key === 'insights').map((cat) => renderCat(cat, cat.key === activeCat, onNavigate))}

          <View style={{ width: 24, height: 1, backgroundColor: color.hairline, marginVertical: 2 }} />

          {RAIL_CATS.filter((cat) => cat.key !== 'insights').map((cat) => renderCat(cat, cat.key === activeCat, onNavigate))}
        </ScrollView>

        <View style={{ width: 24, height: 1, backgroundColor: color.hairline, marginVertical: 8 }} />
        <Pressable onPress={onMirror} accessibilityLabel="Switch rail side">
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#EFEDF8', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.primary }}>⇄</Text>
          </View>
        </Pressable>
      </View>
    </View>
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

/** Weeks of gestation reached at birth, from an archived pregnancy. */
const archWeekOf = (a: { dueDate: string; bornDate: string }) =>
  Math.max(0, Math.floor((280 - Math.round((ppTime(a.dueDate) - ppTime(a.bornDate)) / PP_MS)) / 7));

function MaternityView({
  phase, setPhase, dueDate, maternalBirth, pregAppts, matAppts, pregArchive, nudges, onArrived, onStartPregnancy,
}: {
  phase: 'pregnancy' | 'postpartum';
  setPhase: (p: 'pregnancy' | 'postpartum') => void;
  dueDate: string | null;
  maternalBirth: string | null;
  pregAppts: ApptLike[];
  matAppts: ApptLike[];
  pregArchive: PregArchive[];
  nudges?: Nudge[];
  onArrived: () => void;
  onStartPregnancy: () => void;
}) {
  // Accordion grid: one card open at a time, panel renders full-width below.
  const [openCard, setOpenCard] = useState<string | null>(null);
  // Full week-by-week opens from the hero (merged on top).
  const [weekOpen, setWeekOpen] = useState(false);
  // Collapse any open card whenever the phase tab changes.
  React.useEffect(() => { setOpenCard(null); }, [phase]);
  const now = Date.now();

  // Hero numbers.
  const gest = gestFromDueDate(dueDate ?? undefined);
  const wk = gest ? weekContent(gest.week) : null;
  const ppDays = maternalBirth ? Math.max(0, Math.floor((now - ppTime(maternalBirth)) / PP_MS)) : 0;
  const ppWeeks = Math.floor(ppDays / 7);

  // Pregnancy sub-state: live (due date set), archived (closed after birth) or empty.
  const pregLive = !!dueDate;
  const lastArchive = pregArchive[0] ?? null;
  const pregArchived = !dueDate && !!lastArchive;
  const showGrid = phase === 'postpartum' || (phase === 'pregnancy' && pregLive);

  // Feature tiles per phase (2-column grid). `key` is the panel selector.
  const tiles =
    phase === 'pregnancy'
      ? [
          { key: 'checkin', label: 'Daily check-in', bg: '#FBE0EA', icon: <Smile size={20} color="#B04070" /> },
          { key: 'monitor', label: 'Monitoring & calls', bg: '#FBE0EA', icon: <Shield size={20} color="#B04070" /> },
          { key: 'appts', label: 'Appointments', bg: '#DCEBFA', icon: <CalIcon size={20} color="#2C5F90" /> },
          { key: 'prep', label: 'Birth prep', bg: '#FBF1CE', icon: <CheckCircle size={20} color="#7A5C20" /> },
          { key: 'names', label: 'Baby names', bg: '#E7E4FB', icon: <Star size={20} color={color.primary} /> },
          { key: 'care', label: 'Care & support', bg: '#FBE0EA', icon: <Heart size={20} color="#B04070" /> },
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
  // The grid is two columns; the inline panel slots in right after the row that
  // holds the open card (its row's last index), so it expands in place.
  const openIndex = openTile ? tiles.findIndex((t) => t.key === openCard) : -1;
  const panelRowEnd = openIndex >= 0 ? Math.min(openIndex - (openIndex % 2) + 1, tiles.length - 1) : -1;

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
            <Pressable key={p} onPress={() => { setPhase(p); setOpenCard(null); }} style={{ flex: 1, paddingVertical: 9, borderRadius: radius.pill, alignItems: 'center', backgroundColor: on ? color.rose : 'transparent' }}>
              <Text style={{ fontFamily: on ? font.body700 : font.body600, fontSize: 13, color: on ? '#fff' : color.inkSecondary }}>{p === 'pregnancy' ? 'Pregnancy' : 'Postpartum'}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Teal status hero */}
      <View style={[{ backgroundColor: color.rose, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
        {phase === 'pregnancy' ? (
          <>
            <Text style={{ fontFamily: font.display700, fontSize: 24, color: '#fff' }}>{gest ? `Week ${gest.week}` : pregArchived ? 'Pregnancy complete 🎉' : 'Pregnancy'}</Text>
            <Text style={{ fontFamily: font.body500, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
              {gest
                ? `${gest.daysToGo} days to go · Trimester ${gest.trimester}`
                : pregArchived
                  ? `Born ${dateOnlyLabel(lastArchive!.bornDate)} · reached week ${archWeekOf(lastArchive!)}`
                  : 'Add a due date to begin'}
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
          <ProgressBar pct={Math.round(gest.progress * 100)} track="rgba(255,255,255,0.25)" colors={['#FFFFFF', '#FBE0EA']} />
        )}
        {/* Week-by-week merged into the hero — tap to open the full pager */}
        {phase === 'pregnancy' && gest && wk && (
          <Pressable onPress={() => setWeekOpen(true)} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.card, paddingVertical: 13, paddingHorizontal: 14, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ flex: 1, fontFamily: font.body700, fontSize: 14, color: '#fff' }}>This week · size of a {wk.size}</Text>
                <ChevronRight size={16} color="#fff" />
              </View>
              {(wk.lengthCm > 0 || wk.weightG > 0) && (
                <Text style={{ fontFamily: font.body500, fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
                  {wk.lengthCm > 0 ? `~${wk.lengthCm} cm` : ''}{wk.weightG > 0 ? `${wk.lengthCm > 0 ? ' · ' : ''}~${wk.weightG} g` : ''} · tap for week-by-week
                </Text>
              )}
            </View>
          </Pressable>
        )}
        {/* Baby-has-arrived lives inside the hero (live pregnancy only). */}
        {phase === 'pregnancy' && pregLive && (
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

      {/* Smart nudges (on-device) — pregnancy phase only */}
      {phase === 'pregnancy' && showGrid && nudges && nudges.length > 0 && <NudgeList items={nudges} />}

      {/* Labour & movement — opened on top of the other cards (pink) */}
      {phase === 'pregnancy' && showGrid && (
        <View style={{ gap: 10 }}>
          <Label>Labour & movement</Label>
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, gap: 14, borderWidth: 2, borderColor: color.rose }, shadow.card]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: '#FBE0EA', alignItems: 'center', justifyContent: 'center' }}><Activity size={20} color={color.rose} /></View>
              <Text style={{ flex: 1, fontFamily: font.display700, fontSize: 17, color: color.ink }}>Labour & movement</Text>
            </View>
            <LabourPanel />
          </View>
        </View>
      )}

      {/* Archived pregnancy state — after birth, before a new one begins */}
      {phase === 'pregnancy' && !showGrid && (
        <View style={{ gap: 10 }}>
          {pregArchived && pregArchive.map((a) => <ArchiveCard key={a.id} a={a} />)}
          <Pressable onPress={onStartPregnancy} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
            <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: color.maternalTeal }, shadow.card]}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#E0F4EF', alignItems: 'center', justifyContent: 'center' }}><Plus size={20} color={color.maternalTeal} /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 14.5, color: color.tealInk }}>{pregArchived ? 'Start a new pregnancy' : 'Set your due date'}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, marginTop: 2 }}>Reopens your week-by-week journey</Text>
              </View>
              <ChevronRight size={16} color={color.maternalTeal} />
            </View>
          </Pressable>
        </View>
      )}

      {/* Feature grid — tapping a card expands it inline, directly under its row */}
      {showGrid && (
      <View style={{ gap: 10 }}>
        <Label>{phase === 'pregnancy' ? 'More for you' : 'Looking after you'}</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {tiles.map((t, i) => {
            const active = t.key === openCard;
            const accent = phase === 'pregnancy' ? color.rose : color.maternalTeal;
            const activeBg = phase === 'pregnancy' ? '#FBE0EA' : '#E0F4EF';
            const activeInk = phase === 'pregnancy' ? color.roseInk : color.tealInk;
            return (
              <React.Fragment key={t.key}>
                <Pressable
                  onPress={() => setOpenCard((cur) => (cur === t.key ? null : t.key))}
                  style={({ pressed }) => [{ width: '47.5%', flexGrow: 1, opacity: pressed ? 0.82 : 1 }]}
                >
                  <View style={[{ backgroundColor: active ? activeBg : '#fff', borderRadius: radius.card, padding: 14, gap: 9, minHeight: 102, borderWidth: 2, borderColor: active ? accent : 'transparent' }, shadow.card]}>
                    <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>{t.icon}</View>
                    <Text style={{ fontFamily: font.body700, fontSize: 13.5, color: active ? activeInk : color.ink }}>{t.label}</Text>
                  </View>
                </Pressable>

                {/* Inline expanded panel — full width, slotted right under the open card's row */}
                {openTile && i === panelRowEnd && (
                  <View style={[{ width: '100%', flexBasis: '100%', backgroundColor: '#fff', borderRadius: radius.card, padding: 16, gap: 14, borderWidth: 2, borderColor: accent }, shadow.card]}>
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
              </React.Fragment>
            );
          })}
        </View>
      </View>
      )}

      {/* Up next */}
      {showGrid && upNext.length > 0 && (
        <View style={{ gap: 10 }}>
          <Label>Up next</Label>
          {upNext.map((a) => (
            <FeedRow
              key={a.id}
              chipBg={phase === 'pregnancy' ? '#FBE0EA' : '#E0F4EF'}
              icon={<CalIcon size={22} color={phase === 'pregnancy' ? color.rose : color.maternalTeal} />}
              title={a.title}
              sub={apptDateLabel(a.at)}
              trailing={<ChevronRight size={16} color={color.faint} />}
            />
          ))}
        </View>
      )}

      {/* Past pregnancies — always kept, even while a new pregnancy is live */}
      {phase === 'pregnancy' && pregLive && pregArchive.length > 0 && (
        <View style={{ gap: 10 }}>
          <Label>Past pregnancies</Label>
          {pregArchive.map((a) => <ArchiveCard key={a.id} a={a} />)}
        </View>
      )}

      {/* Full week-by-week — opened from the hero */}
      <Modal visible={weekOpen} transparent animationType="slide" onRequestClose={() => setWeekOpen(false)}>
        <Pressable onPress={() => setWeekOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.4)', justifyContent: 'flex-end' }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 14, maxHeight: '88%' }, shadow.card]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ flex: 1, fontFamily: font.display700, fontSize: 18, color: color.ink }}>Week-by-week</Text>
              <Pressable onPress={() => setWeekOpen(false)} hitSlop={10}><X size={20} color={color.muted} /></Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}><WeekPanel dueDate={dueDate} /></ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}

/** Read-only summary of one completed (archived) pregnancy. */
function ArchiveCard({ a }: { a: PregArchive }) {
  return (
    <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, gap: 10 }, shadow.card]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: '#E0F4EF', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={17} color={color.maternalTeal} /></View>
        <Text style={{ flex: 1, fontFamily: font.body700, fontSize: 14.5, color: color.ink }}>Pregnancy · {dateOnlyLabel(a.bornDate)}</Text>
        <Badge text="read-only" bg="#EFEDF8" fg={color.muted} />
      </View>
      <View style={{ flexDirection: 'row' }}>
        <Stat label="Reached" value={`Wk ${archWeekOf(a)}`} />
        <Divider />
        <Stat label="Born" value={dateOnlyLabel(a.bornDate).replace(/,.*/, '')} />
        <Divider />
        <Stat label="Check-ins" value={`${a.checkins.length}`} />
      </View>
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
    case 'monitor': return <MonitorPanel />;
    case 'prep': return <BirthPrepPanel />;
    case 'names': return <NamesPanel />;
    case 'labour': return <LabourPanel />;
    case 'care': return <CarePanel />;
    case 'epds': return <WellbeingPanel />;
    case 'recovery': return <RecoveryPanel />;
    case 'matappts': return <MatApptsPanel maternalBirth={maternalBirth} />;
    case 'pelvic': return <PelvicPanel maternalBirth={maternalBirth} />;
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
  const gest = gestFromDueDate(dueDate ?? undefined);
  const [week, setWeek] = useState<number>(gest?.week ?? 12);
  const [tab, setTab] = useState<'baby' | 'body' | 'nutrition'>('baby');
  const c = weekContent(week);
  const trimester: 1 | 2 | 3 = week < 13 ? 1 : week < 27 ? 2 : 3;
  const tips = TRIMESTER_TIPS[trimester];
  return (
    <View style={{ gap: 14 }}>
      {/* Week pager */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => setWeek((w) => Math.max(1, w - 1))} hitSlop={8} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: color.canvas, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={20} color={color.rose} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: font.display700, fontSize: 20, color: color.ink }}>Week {week}</Text>
          <Text style={{ fontFamily: font.body500, fontSize: 11.5, color: color.muted }}>of 40 · Trimester {trimester}</Text>
        </View>
        <Pressable onPress={() => setWeek((w) => Math.min(42, w + 1))} hitSlop={8} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: color.canvas, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronRight size={20} color={color.rose} />
        </Pressable>
      </View>
      {gest != null && week !== gest.week && (
        <Pressable onPress={() => setWeek(gest.week)} hitSlop={8} style={{ alignSelf: 'center' }}>
          <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.rose }}>Back to my week (Week {gest.week})</Text>
        </Pressable>
      )}
      {/* Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: color.canvas, borderRadius: radius.pill, padding: 3 }}>
        {(['baby', 'body', 'nutrition'] as const).map((t) => {
          const sel = t === tab;
          return (
            <Pressable key={t} onPress={() => setTab(t)} style={{ flex: 1, paddingVertical: 8, borderRadius: radius.pill, alignItems: 'center', backgroundColor: sel ? color.rose : 'transparent' }}>
              <Text style={{ fontFamily: font.body700, fontSize: 12.5, color: sel ? '#fff' : color.muted }}>{t === 'body' ? 'Your body' : t === 'baby' ? 'Baby' : 'Nutrition'}</Text>
            </Pressable>
          );
        })}
      </View>
      {tab === 'baby' ? (
        <View style={{ backgroundColor: color.canvas, borderRadius: radius.tile, padding: 14, gap: 6 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.ink }}>Size of a {c.size}</Text>
          {(c.lengthCm > 0 || c.weightG > 0) && (
            <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.inkSecondary }}>{c.lengthCm > 0 ? `~${c.lengthCm} cm` : ''}{c.weightG > 0 ? `${c.lengthCm > 0 ? ' · ' : ''}~${c.weightG} g` : ''}</Text>
          )}
          <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted, marginTop: 2, lineHeight: 19 }}>{c.note}</Text>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {(tab === 'body' ? tips.body : tips.nutrition).map((t, i) => (
            <View key={i} style={{ backgroundColor: color.canvas, borderRadius: radius.tile, padding: 12, flexDirection: 'row', gap: 10 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color.rose, marginTop: 6 }} />
              <Text style={{ flex: 1, fontFamily: font.body500, fontSize: 13, color: color.ink, lineHeight: 19 }}>{t}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function PregApptsPanel() {
  const { pregAppts, addPregAppt, deletePregAppt } = useData();
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const isFuture = (iso: string) => new Date(iso).getTime() >= startOfToday.getTime();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayISO());
  const [result, setResult] = useState('');
  const [kind, setKind] = useState<'appointment' | 'test'>('appointment');

  const appts = pregAppts.filter((a) => a.kind === 'appointment');
  const tests = pregAppts.filter((a) => a.kind === 'test');
  const upcoming = appts.filter((a) => isFuture(a.at)).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  const past = appts.filter((a) => !isFuture(a.at)).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const add = () => {
    if (!title.trim() || !date.trim()) return;
    addPregAppt({ title, at: `${date}T09:00:00`, kind, result: kind === 'test' ? result.trim() || undefined : undefined });
    setTitle(''); setDate(todayISO()); setResult('');
  };
  return (
    <View style={{ gap: 14 }}>
      <View style={{ gap: 8 }}>
        <PanelLabel>Upcoming</PanelLabel>
        {upcoming.length === 0 ? <EmptyHint text="No upcoming appointments yet." /> : upcoming.map((a) => (
          <PanelRow key={a.id} title={a.title} sub={apptDateLabel(a.at)} onDelete={() => deletePregAppt(a.id)} />
        ))}
      </View>
      {past.length > 0 && (
        <View style={{ gap: 8 }}>
          <PanelLabel>Past</PanelLabel>
          {past.map((a) => (
            <PanelRow key={a.id} title={a.title} sub={apptDateLabel(a.at)} onDelete={() => deletePregAppt(a.id)} />
          ))}
        </View>
      )}
      <View style={{ gap: 8 }}>
        <PanelLabel>Test results</PanelLabel>
        {tests.length === 0 ? <EmptyHint text="No test results yet." /> : tests.map((a) => (
          <PanelRow key={a.id} title={a.title} sub={`${dateOnlyLabel(a.at)}${a.result ? ` · ${a.result}` : ''}`} onDelete={() => deletePregAppt(a.id)} />
        ))}
      </View>
      <View style={{ gap: 10 }}>
        <PanelLabel>Add</PanelLabel>
        <SelectChips options={['appointment', 'test']} value={kind} onChange={(v) => setKind(v as 'appointment' | 'test')} />
        <Field label="Title" value={title} onChangeText={setTitle} placeholder={kind === 'test' ? 'e.g. GTT blood test' : 'e.g. 20-week scan'} autoCapitalize="sentences" />
        <DateField label="Date" value={date} onChangeText={setDate} />
        {kind === 'test' && <Field label="Result (optional)" value={result} onChangeText={setResult} placeholder="e.g. Normal" autoCapitalize="sentences" />}
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

/** Monitoring (glucose + BP) and the when-to-call triage, matching preg-vitals. */
function MonitorPanel() {
  const { pregVitals, addPregVital, deletePregVital } = useData();
  const [tab, setTab] = useState<'monitoring' | 'triage'>('monitoring');
  const [g, setG] = useState(''); const [tag, setTag] = useState('fasting');
  const [sys, setSys] = useState(''); const [dia, setDia] = useState('');
  const glucose = pregVitals.filter((v) => v.kind === 'glucose').slice(0, 4);
  const bp = pregVitals.filter((v) => v.kind === 'bp').slice(0, 4);
  const addG = () => { const v = numOrUndef(g); if (v == null) return; addPregVital({ kind: 'glucose', glucose: v, tag }); setG(''); };
  const addBp = () => { const s = numOrUndef(sys), d = numOrUndef(dia); if (s == null && d == null) return; addPregVital({ kind: 'bp', systolic: s, diastolic: d }); setSys(''); setDia(''); };
  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', backgroundColor: color.canvas, borderRadius: radius.pill, padding: 3 }}>
        {([['monitoring', 'Monitoring'], ['triage', 'When to call']] as [typeof tab, string][]).map(([k, l]) => {
          const on = tab === k;
          return <Pressable key={k} onPress={() => setTab(k)} style={{ flex: 1, paddingVertical: 8, borderRadius: radius.pill, alignItems: 'center', backgroundColor: on ? color.maternalTeal : 'transparent' }}><Text style={{ fontFamily: font.body700, fontSize: 12.5, color: on ? '#fff' : color.muted }}>{l}</Text></Pressable>;
        })}
      </View>
      {tab === 'monitoring' ? (
        <>
          <View style={{ gap: 8 }}>
            <PanelLabel>Blood glucose</PanelLabel>
            {glucose.map((v) => {
              const r = v.glucose ?? 0; const fasting = (v.tag ?? '').includes('fasting'); const high = fasting ? r >= 5.3 : r > 7.8;
              return <PanelRow key={v.id} title={`${v.glucose} mmol/L${high ? ' ⚠' : ''}`} sub={`${v.tag || ''} · ${dayTimeOf(v.at)}`} onDelete={() => deletePregVital(v.id)} />;
            })}
            <SelectChips options={['fasting', 'post-meal']} value={tag} onChange={setTag} />
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
              <View style={{ flex: 1 }}><Field label="Glucose (mmol/L)" value={g} onChangeText={setG} placeholder="e.g. 5.2" /></View>
              <Button label="Log" onPress={addG} style={{ paddingHorizontal: 16 }} />
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <PanelLabel>Blood pressure</PanelLabel>
            {bp.map((v) => {
              const high = (v.systolic ?? 0) >= 140 || (v.diastolic ?? 0) >= 90;
              return <PanelRow key={v.id} title={`${v.systolic}/${v.diastolic} mmHg${high ? ' ⚠' : ''}`} sub={dayTimeOf(v.at)} onDelete={() => deletePregVital(v.id)} />;
            })}
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
              <View style={{ flex: 1 }}><Field label="Systolic" value={sys} onChangeText={setSys} placeholder="118" /></View>
              <View style={{ flex: 1 }}><Field label="Diastolic" value={dia} onChangeText={setDia} placeholder="74" /></View>
              <Button label="Log" onPress={addBp} style={{ paddingHorizontal: 16 }} />
            </View>
          </View>
        </>
      ) : (
        <TriagePanel />
      )}
    </View>
  );
}

const labFmt = (ms: number) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const labDurSec = (secs: number) => { const m = Math.floor(secs / 60); return m > 0 ? `${m}m ${secs % 60}s` : `${secs}s`; };
const KICK_TARGET = 10;

/** Labour & movement — kick counter + contraction timer, matching kick-counter. */
function LabourPanel() {
  const { kickSessions, addKickSession, deleteKickSession, contractionSessions, addContraction, deleteContraction } = useData();
  const [mode, setMode] = useState<'kicks' | 'contractions'>('kicks');
  const [kicks, setKicks] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [kickNow, setKickNow] = useState(Date.now());
  const kickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  React.useEffect(() => {
    if (startedAt && kicks < KICK_TARGET) {
      kickTimer.current = setInterval(() => setKickNow(Date.now()), 1000);
      return () => { if (kickTimer.current) clearInterval(kickTimer.current); };
    }
  }, [startedAt, kicks]);
  const recordKick = () => { if (kicks >= KICK_TARGET) return; if (!startedAt) { setStartedAt(Date.now()); setKickNow(Date.now()); } setKicks((k) => k + 1); };
  const resetKicks = () => { if (kicks > 0 && startedAt) addKickSession({ count: kicks, durationMin: Math.max(1, Math.round((kickNow - startedAt) / 60000)) }); setKicks(0); setStartedAt(null); setKickNow(Date.now()); };
  const elapsed = startedAt ? Math.max(0, kickNow - startedAt) : 0;
  const done = kicks >= KICK_TARGET;

  const [activeStart, setActiveStart] = useState<number | null>(null);
  const [conNow, setConNow] = useState(Date.now());
  const conTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  React.useEffect(() => {
    if (activeStart) { conTimer.current = setInterval(() => setConNow(Date.now()), 250); return () => { if (conTimer.current) clearInterval(conTimer.current); }; }
  }, [activeStart]);
  const toggleCon = () => {
    if (activeStart) {
      const durationSec = Math.max(1, Math.round((Date.now() - activeStart) / 1000));
      const prev = contractionSessions[0];
      const prevStart = prev ? new Date(prev.at).getTime() - prev.durationSec * 1000 : null;
      const intervalSec = prevStart != null ? Math.max(0, Math.round((activeStart - prevStart) / 1000)) : undefined;
      addContraction({ durationSec, intervalSec }); setActiveStart(null);
    } else { setActiveStart(Date.now()); setConNow(Date.now()); }
  };

  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', backgroundColor: color.canvas, borderRadius: radius.pill, padding: 3 }}>
        {([['kicks', 'Kicks'], ['contractions', 'Contractions']] as [typeof mode, string][]).map(([k, l]) => {
          const on = mode === k;
          return <Pressable key={k} onPress={() => setMode(k)} style={{ flex: 1, paddingVertical: 8, borderRadius: radius.pill, alignItems: 'center', backgroundColor: on ? color.rose : 'transparent' }}><Text style={{ fontFamily: font.body700, fontSize: 12.5, color: on ? '#fff' : color.muted }}>{l}</Text></Pressable>;
        })}
      </View>
      {mode === 'kicks' ? (
        <>
          {/* D3 — pulse circle you tap to count, with a 10-dot progress row */}
          <View style={{ alignItems: 'center', gap: 14 }}>
            <Pressable onPress={recordKick} disabled={done} accessibilityLabel="Record a movement" style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
              <View style={{ width: 208, height: 208, borderRadius: 104, backgroundColor: '#FBEAF1', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 170, height: 170, borderRadius: 85, backgroundColor: '#F6D3E1', alignItems: 'center', justifyContent: 'center' }}>
                  <View style={[{ width: 138, height: 138, borderRadius: 69, backgroundColor: done ? color.roseInk : color.rose, alignItems: 'center', justifyContent: 'center' }, shadow.card]}>
                    <Text style={{ fontFamily: font.display700, fontSize: 50, color: '#fff' }}>{kicks}</Text>
                    <Text style={{ fontFamily: font.body600, fontSize: 11.5, color: 'rgba(255,255,255,0.92)', marginTop: 1 }}>{done ? 'done 🎉' : 'tap'}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 7 }}>
              {Array.from({ length: KICK_TARGET }).map((_, i) => (
                <View key={i} style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: i < kicks ? color.rose : '#EEE3EA' }} />
              ))}
            </View>
            <Text style={{ fontFamily: font.body600, fontSize: 12.5, color: color.muted }}>{kicks} of {KICK_TARGET} · {startedAt ? labFmt(elapsed) : 'not started'}</Text>
          </View>
          <Button label={kicks > 0 ? 'Save & reset' : 'Reset'} variant="secondary" onPress={resetKicks} />
          {kickSessions.length > 0 && (
            <View style={{ gap: 8 }}>
              <PanelLabel>Recent sessions</PanelLabel>
              {kickSessions.slice(0, 4).map((s) => <PanelRow key={s.id} title={`${s.count} ${s.count === 1 ? 'movement' : 'movements'}${s.durationMin != null ? ` · ${s.durationMin}m` : ''}`} sub={dayTimeOf(s.at)} onDelete={() => deleteKickSession(s.id)} />)}
            </View>
          )}
        </>
      ) : (
        <>
          <View style={{ backgroundColor: color.canvas, borderRadius: radius.tile, padding: 16, alignItems: 'center', gap: 2 }}>
            <Text style={{ fontFamily: font.display700, fontSize: 36, color: activeStart ? color.rose : color.muted }}>{activeStart ? labDurSec(Math.round((conNow - activeStart) / 1000)) : '—'}</Text>
            <Text style={{ fontFamily: font.body600, fontSize: 12, color: color.muted }}>{activeStart ? 'in progress' : 'tap start when one begins'}</Text>
          </View>
          <Button label={activeStart ? 'Stop' : 'Start'} onPress={toggleCon} />
          {contractionSessions.length > 0 && (
            <View style={{ gap: 8 }}>
              <PanelLabel>{contractionSessions.length} recorded</PanelLabel>
              {contractionSessions.slice(0, 4).map((c) => <PanelRow key={c.id} title={labDurSec(c.durationSec)} sub={c.intervalSec != null ? `${labDurSec(c.intervalSec)} apart` : 'first'} onDelete={() => deleteContraction(c.id)} />)}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const PREG_STATUS: { key: PregStatus; label: string; desc: string }[] = [
  { key: 'active', label: 'Active', desc: 'Tracking as normal.' },
  { key: 'paused', label: 'Paused', desc: 'Pause reminders and trackers, keep your data.' },
  { key: 'archived', label: 'Archived', desc: 'Move this pregnancy to a quiet, retrievable archive.' },
];

/** Care & support — pregnancy status + crisis resources, matching preg-care. */
function CarePanel() {
  const { pregStatus, setPregStatus } = useData();
  return (
    <View style={{ gap: 14 }}>
      <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted }}>However your journey unfolds, Everly adapts around you — these options are free and private.</Text>
      <View style={{ gap: 8 }}>
        <PanelLabel>This pregnancy</PanelLabel>
        {PREG_STATUS.map((s) => {
          const sel = s.key === pregStatus;
          return (
            <Pressable key={s.key} onPress={() => setPregStatus(s.key)} style={{ backgroundColor: sel ? color.maternalTeal : color.canvas, borderRadius: radius.tile, padding: 13 }}>
              <Text style={{ fontFamily: font.body700, fontSize: 13.5, color: sel ? '#fff' : color.ink }}>{s.label}{sel ? ' · current' : ''}</Text>
              <Text style={{ fontFamily: font.body400, fontSize: 12, color: sel ? 'rgba(255,255,255,0.9)' : color.muted, marginTop: 2 }}>{s.desc}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ backgroundColor: '#FBE0EA', borderRadius: radius.tile, padding: 14, gap: 8 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.roseInk }}>Support, any time</Text>
        {CRISIS_RESOURCES.map((r, i) => (
          <View key={i}>
            <Text style={{ fontFamily: font.body700, fontSize: 12.5, color: color.ink }}>{r.name}</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.inkSecondary }}>{r.detail}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const STARTER_PREP: { category: string; label: string }[] = [
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
const PREP_CATS = ['For Mum', 'For Baby', 'Birth plan'];

function BirthPrepPanel() {
  const { birthPrep, addBirthPrep, toggleBirthPrep, deleteBirthPrep } = useData();
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('For Mum');
  const cats = Array.from(new Set(birthPrep.map((i) => i.category)));
  const done = birthPrep.filter((i) => i.checked).length;
  const pct = birthPrep.length ? Math.round((done / birthPrep.length) * 100) : 0;
  const add = () => { if (!label.trim()) return; addBirthPrep({ category, label }); setLabel(''); };
  return (
    <View style={{ gap: 14 }}>
      {birthPrep.length === 0 ? (
        <View style={{ gap: 10 }}>
          <EmptyHint text="Start with a hospital-bag & birth-plan checklist you can tick off and add to." />
          <Button label="Load starter checklist" onPress={() => STARTER_PREP.forEach((s) => addBirthPrep(s))} />
        </View>
      ) : (
        <>
          <View style={{ backgroundColor: color.maternalTeal, borderRadius: radius.tile, padding: 14 }}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: '#fff' }}>{done} / {birthPrep.length} done · {pct}%</Text>
          </View>
          {cats.map((cat) => (
            <View key={cat} style={{ gap: 8 }}>
              <PanelLabel>{cat}</PanelLabel>
              {birthPrep.filter((i) => i.category === cat).map((i) => (
                <View key={i.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flex: 1 }}><CheckRow label={i.label} checked={i.checked} onToggle={() => toggleBirthPrep(i.id)} /></View>
                  <Pressable onPress={() => deleteBirthPrep(i.id)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>
                </View>
              ))}
            </View>
          ))}
        </>
      )}
      <View style={{ gap: 10 }}>
        <PanelLabel>Add item</PanelLabel>
        <SelectChips options={PREP_CATS} value={category} onChange={setCategory} />
        <Field label="Item" value={label} onChangeText={setLabel} placeholder="e.g. Pack hospital bag" autoCapitalize="sentences" />
        <Button label="Add" onPress={add} />
      </View>
    </View>
  );
}

function NamesPanel() {
  const { savedNames, saveName, deleteName } = useData();
  const [filter, setFilter] = useState<'All' | 'Girl' | 'Boy' | 'Unisex'>('All');
  const [idx, setIdx] = useState(0);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Girl');

  const savedSet = new Set(savedNames.map((n) => n.name));
  const pool = BABY_NAMES.filter((n) => (filter === 'All' || n.gender === filter) && !savedSet.has(n.name));
  const card = pool[idx % Math.max(1, pool.length)];
  const add = () => { if (!name.trim()) return; saveName({ name: name.trim(), gender }); setName(''); };

  return (
    <View style={{ gap: 14 }}>
      {/* Suggestions explorer */}
      <View style={{ gap: 10 }}>
        <PanelLabel>Explore names</PanelLabel>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {(['All', 'Girl', 'Boy', 'Unisex'] as const).map((f) => (
            <Pressable key={f} onPress={() => { setFilter(f); setIdx(0); }} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: filter === f ? color.maternalTeal : '#fff', borderWidth: 1, borderColor: filter === f ? color.maternalTeal : color.hairline }}>
              <Text style={{ fontFamily: font.body600, fontSize: 12, color: filter === f ? '#fff' : color.ink }}>{f}</Text>
            </Pressable>
          ))}
        </View>
        {card ? (
          <View style={{ backgroundColor: color.canvas, borderRadius: radius.tile, padding: 18, alignItems: 'center', gap: 4 }}>
            <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink }}>{card.name}</Text>
            <Text style={{ fontFamily: font.body600, fontSize: 12.5, color: color.maternalTeal }}>{card.gender} · {card.origin}</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.inkSecondary, textAlign: 'center', marginTop: 2 }}>{card.meaning}</Text>
          </View>
        ) : (
          <EmptyHint text="You've been through them all for this filter." />
        )}
        {card && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Skip" variant="secondary" onPress={() => setIdx((i) => i + 1)} style={{ flex: 1 }} />
            <Button label="♥ Save" onPress={() => { saveName({ name: card.name, gender: card.gender }); setIdx((i) => i + 1); }} style={{ flex: 1 }} />
          </View>
        )}
      </View>

      <View style={{ gap: 8 }}>
        <PanelLabel>Saved names{savedNames.length ? ` · ${savedNames.length}` : ''}</PanelLabel>
        {savedNames.length === 0 ? <EmptyHint text="No saved names yet." /> : savedNames.map((n) => (
          <PanelRow key={n.id} title={n.name} sub={n.gender} onDelete={() => deleteName(n.id)} />
        ))}
      </View>
      <View style={{ gap: 10 }}>
        <PanelLabel>Add your own</PanelLabel>
        <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Maya" autoCapitalize="words" />
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

const COMFORT_LABELS = ['Painful', 'Some pain', 'Okay', 'Comfortable'];
const WATER_GOAL = 2200;

function RecoveryPanel() {
  const { recoveryLogs, addRecoveryLog, momCare, addMomCare } = useData();
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [lochia, setLochia] = useState<Lochia | null>(null);
  const [note, setNote] = useState('');
  const [hrs, setHrs] = useState('');
  const recent = recoveryLogs.slice(0, 3);

  const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();
  const todayWater = momCare.filter((m) => m.kind === 'water' && isToday(m.at)).reduce((s, m) => s + m.value, 0);
  const lastComfort = momCare.find((m) => m.kind === 'comfort');
  const comfortToday = lastComfort && isToday(lastComfort.at) ? lastComfort.value : null;
  const weekSleep = momCare.filter((m) => m.kind === 'sleep' && new Date(m.at).getTime() >= Date.now() - 7 * 86400000);
  const avgSleep = weekSleep.length ? (weekSleep.reduce((s, m) => s + m.value, 0) / weekSleep.length).toFixed(1) : null;

  const save = () => {
    if (!sys && !dia && !lochia && !note.trim()) return;
    addRecoveryLog({ systolic: numOrUndef(sys), diastolic: numOrUndef(dia), lochia: lochia ?? undefined, note: note.trim() || undefined });
    setSys(''); setDia(''); setLochia(null); setNote('');
  };
  const logSleep = () => { const v = numOrUndef(hrs); if (v == null) return; addMomCare({ kind: 'sleep', value: v }); setHrs(''); };

  return (
    <View style={{ gap: 14 }}>
      {/* Vitals */}
      <PanelLabel>Vitals</PanelLabel>
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

      {/* Looking after you */}
      <View style={{ height: 1, backgroundColor: color.hairline }} />
      <PanelLabel>Breastfeeding comfort today</PanelLabel>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {COMFORT_LABELS.map((c, i) => {
          const sel = comfortToday === i;
          return (
            <Pressable key={c} onPress={() => addMomCare({ kind: 'comfort', value: i })} style={{ flex: 1, paddingVertical: 10, borderRadius: radius.tile, alignItems: 'center', backgroundColor: sel ? color.maternalTeal : color.canvas }}>
              <Text style={{ fontFamily: font.body600, fontSize: 11, color: sel ? '#fff' : color.ink, textAlign: 'center' }}>{c}</Text>
            </Pressable>
          );
        })}
      </View>

      <PanelLabel>Your sleep · 7-day avg</PanelLabel>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
        <Text style={{ fontFamily: font.display700, fontSize: 22, color: color.ink }}>{avgSleep ? `${avgSleep}h` : '—'}</Text>
        <View style={{ flex: 1 }}><Field label="" value={hrs} onChangeText={setHrs} placeholder="Hours slept" /></View>
        <Button label="Log" onPress={logSleep} style={{ paddingHorizontal: 16 }} />
      </View>

      <PanelLabel>Hydration today · {(todayWater / 1000).toFixed(1)} / {(WATER_GOAL / 1000).toFixed(1)} L</PanelLabel>
      <ProgressBar pct={Math.min(100, Math.round((todayWater / WATER_GOAL) * 100))} track={color.canvas} colors={['#6BBFAE', color.maternalTeal]} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[250, 500].map((ml) => (
          <Pressable key={ml} onPress={() => addMomCare({ kind: 'water', value: ml })} style={{ flex: 1, paddingVertical: 11, borderRadius: radius.tile, alignItems: 'center', backgroundColor: color.canvas, borderWidth: 1, borderColor: color.hairline }}>
            <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.tealDeep }}>+{ml} ml</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const MAT_SEED = [
  { title: 'Midwife discharge', kind: 'check' as const, off: 5 },
  { title: 'Health visitor assessment', kind: 'check' as const, off: 14 },
  { title: '6-week GP check', kind: 'appointment' as const, off: 42, prep: 'Contraception, mental health, physical recovery, return to work' },
];

function MatApptsPanel({ maternalBirth }: { maternalBirth: string | null }) {
  const { matAppts, addMatAppt, deleteMatAppt } = useData();
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const isFuture = (iso: string) => new Date(iso).getTime() >= startOfToday.getTime();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayISO());
  const [prep, setPrep] = useState('');
  const upcoming = matAppts.filter((a) => isFuture(a.at)).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  const past = matAppts.filter((a) => !isFuture(a.at)).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const add = () => { if (!title.trim() || !date.trim()) return; addMatAppt({ title, at: `${date}T10:00:00`, kind: 'appointment', prep: prep.trim() || undefined }); setTitle(''); setDate(todayISO()); setPrep(''); };
  const seed = () => {
    const birth = maternalBirth ? ppTime(maternalBirth) : Date.now();
    MAT_SEED.forEach((s) => addMatAppt({ title: s.title, at: new Date(birth + s.off * PP_MS).toISOString(), kind: s.kind, prep: (s as any).prep }));
  };
  return (
    <View style={{ gap: 14 }}>
      {matAppts.length === 0 && (
        <View style={{ gap: 10 }}>
          <EmptyHint text="Seed the standard postpartum schedule from your birth date, or add your own below." />
          <Button label="Load standard schedule" variant="secondary" onPress={seed} />
        </View>
      )}
      {upcoming.length > 0 && (
        <View style={{ gap: 8 }}>
          <PanelLabel>Upcoming</PanelLabel>
          {upcoming.map((a) => (
            <PanelRow key={a.id} title={a.title} sub={`${apptDateLabel(a.at)}${a.prep ? ` · prep: ${a.prep}` : ''}`} onDelete={() => deleteMatAppt(a.id)} />
          ))}
        </View>
      )}
      {past.length > 0 && (
        <View style={{ gap: 8 }}>
          <PanelLabel>Past</PanelLabel>
          {past.map((a) => (
            <PanelRow key={a.id} title={a.title} sub={apptDateLabel(a.at)} onDelete={() => deleteMatAppt(a.id)} />
          ))}
        </View>
      )}
      <View style={{ gap: 10 }}>
        <PanelLabel>Add appointment</PanelLabel>
        <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. 6-week check" autoCapitalize="sentences" />
        <DateField label="Date" value={date} onChangeText={setDate} />
        <Field label="Prep questions (optional)" value={prep} onChangeText={setPrep} placeholder="e.g. contraception, mood" autoCapitalize="sentences" />
        <Button label="Add" onPress={add} />
      </View>
    </View>
  );
}

const PELVIC_STAGES = [
  { max: 3, name: 'Stage 1 · Weeks 0–3', note: 'Gentle reconnection. Rest is part of recovery.', ex: ['Deep core breathing — 10 breaths × 3', 'Gentle pelvic-floor squeezes — 5 holds', 'Short, slow walks'] },
  { max: 8, name: 'Stage 2 · Weeks 4–8', note: 'Walking up to 30 min is usually safe now.', ex: ['Kegel contractions — 10 holds × 10s × 3 sets', 'Deep core breathing — 10 breaths × 3', 'Gentle walking 20–30 min'] },
  { max: 999, name: 'Stage 3 · Weeks 9+', note: 'Progressive strength — listen to your body.', ex: ['Kegels with movement — 3 sets', 'Glute bridges — 10 × 3', 'Brisk walking / low-impact cardio'] },
];

function PelvicPanel({ maternalBirth }: { maternalBirth: string | null }) {
  const { pelvicLog, addPelvic } = useData();
  const week = maternalBirth ? Math.floor((Date.now() - ppTime(maternalBirth)) / (7 * PP_MS)) : 0;
  const stage = PELVIC_STAGES.find((s) => week <= s.max) ?? PELVIC_STAGES[2];
  const runDate = maternalBirth ? ppTime(maternalBirth) + 12 * 7 * PP_MS : null;
  const runWeeks = runDate ? Math.ceil((runDate - Date.now()) / (7 * PP_MS)) : null;
  const doneToday = (ex: string) => pelvicLog.some((p) => p.exercise === ex && new Date(p.at).toDateString() === new Date().toDateString());
  return (
    <View style={{ gap: 14 }}>
      {!maternalBirth && <EmptyHint text="Set your birth date to stage the program. Showing Stage 1." />}
      <View style={{ backgroundColor: color.maternalTeal, borderRadius: radius.tile, padding: 14 }}>
        <Text style={{ fontFamily: font.display700, fontSize: 16, color: '#fff' }}>{stage.name}</Text>
        <Text style={{ fontFamily: font.body500, fontSize: 12.5, color: 'rgba(255,255,255,0.92)', marginTop: 3 }}>{stage.note}</Text>
      </View>
      <View style={{ gap: 8 }}>
        <PanelLabel>Today's routine</PanelLabel>
        {stage.ex.map((ex) => {
          const done = doneToday(ex);
          return (
            <Pressable key={ex} onPress={() => !done && addPelvic(ex)} style={{ backgroundColor: color.canvas, borderRadius: radius.tile, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: done ? color.maternalTeal : color.faint, backgroundColor: done ? color.maternalTeal : 'transparent', alignItems: 'center', justifyContent: 'center' }}>{done && <Check size={13} color="#fff" />}</View>
              <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 13, color: color.ink, textDecorationLine: done ? 'line-through' : 'none' }}>{ex}</Text>
              {!done && <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.maternalTeal }}>Done</Text>}
            </Pressable>
          );
        })}
      </View>
      <View style={{ backgroundColor: '#FCE6D8', borderRadius: radius.tile, padding: 12 }}>
        <Text style={{ fontFamily: font.body600, fontSize: 12.5, color: '#B5662E' }}>Avoid crunches and planks until after your 6-week check — they can worsen abdominal separation.</Text>
      </View>
      {runDate && (
        <View style={{ backgroundColor: color.canvas, borderRadius: radius.tile, padding: 13 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>Return to running</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.inkSecondary, marginTop: 2 }}>Earliest safe ≈ week 12{runWeeks && runWeeks > 0 ? ` · about ${runWeeks} week${runWeeks === 1 ? '' : 's'} away` : ' · you may be ready — check with your provider'}.</Text>
        </View>
      )}
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
  const { lastPeriod, dueDate, epdsResults, recoveryLogs, pregArchive } = useData();
  const events = youStoryEvents({ lastPeriod, dueDate, maternalBirth, pregArchive, epdsResults, recoveryLogs });
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted }}>
        Your journey, built from what you track — preconception to now.
      </Text>
      {events.length === 0 ? (
        <EmptyHint text="Your story fills in as you track your cycle, pregnancy, birth and recovery." />
      ) : (
        events.map((e, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: color.maternalTeal, marginTop: 4 }} />
              {i < events.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: color.hairline, marginTop: 2 }} />}
            </View>
            <View style={{ flex: 1, backgroundColor: color.canvas, borderRadius: radius.tile, padding: 12, marginBottom: 2 }}>
              <Text style={{ fontFamily: font.body700, fontSize: 13.5, color: color.ink }}>{e.title}</Text>
              <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>{dateOnlyLabel(e.at)}{e.sub ? ` · ${e.sub}` : ''}</Text>
            </View>
          </View>
        ))
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
