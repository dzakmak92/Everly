import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ScrollView, View, Text, Pressable, Modal, TextInput, Linking, ActivityIndicator, Animated, Easing, PanResponder, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import Svg, { Circle, Rect, Polyline, Polygon, Line as SvgLine, Text as SvgText } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, childToken } from '../../../src/theme/tokens';
import { Button, Field } from '../../../src/components/forms';
import { Logo } from '../../../src/components/Logo';
import {
  ChevronRight, Bottle, Syringe,
  Heart, Calendar as CalIcon, Activity, Smile, Shield, CheckCircle, Star, Leaf, X, Plus, ChevronLeft, Check,
  HeartPulse, StarOutline, BarChart, User,
} from '../../../src/components/icons';
import { EntryIcon } from '../../../src/components/EntryIcon';
import { Silhouette, ProgressBar } from '../../../src/components/ui';
import { DateField } from '../../../src/components/DateField';
import { LocationField } from '../../../src/components/LocationField';
import { DurationField } from '../../../src/components/DurationField';
import { useSupabase } from '../../../src/lib/supabase';
import { ageLabel, stageFrom } from '../../../src/lib/age';
import {
  gestFromDueDate, weekContent, MOODS, PREG_SYMPTOMS, RED_FLAGS_CALL_NOW, RED_FLAGS_CALL_SOON, expectedSymptoms, dueDateFromLmp, TRIMESTER_TIPS, BABY_NAMES,
  bmiFrom, gainGoal, recommendedGain,
} from '../../../src/lib/pregnancy';
import { EPDS_QUESTIONS, scoreEpds, BAND_LABEL, CRISIS_RESOURCES } from '../../../src/lib/epds';
import { helplinesFor } from '../../../src/lib/helplines';
import { lmpFrom, datedAntenatal, type DatedAntenatal } from '../../../src/lib/antenatal';
import { youStoryEvents } from '../../../src/lib/story';
import { childRhythm, nextFeed, napWindow, childNudges, pregnancyNudges, fmtDur, type Nudge, type Prediction, type ChildRhythm } from '../../../src/lib/intelligence';
import { DayTimeline } from '../../../src/components/DayTimeline';
import { useFeedback } from '../../../src/components/Feedback';
import { useWeather, WeatherGlyph, wxLabel, searchCity, type WxLocation } from '../../../src/lib/weather';
import {
  useData, entriesOn, entryDetail, ENTRY_META, quickLogKinds, MOOD_LABELS, CHILD_COLORS,
  type EntryKind, type FeedSide, type DiaperType, type Child, type Lochia, type ChildColor, type PregArchive, type PregStatus,
  type Entry, type EventItem, type Vaccine, type Medication, type KickSession, type PregVital, type PregCheckin, type PregAppt, type BirthPrepItem,
} from '../../../src/lib/store';
import { useUnits } from '../../../src/lib/units';
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
  const u = useUnits();
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

  // Next due vaccine (this child) — a small reminder under the appointments card.
  const dueVax = forChild(vaccines).filter((v) => !v.givenDate)[0];

  function open(k: EntryKind) { setKind(k); setSide('left'); setDiaper('wet'); setMl(''); setMins(''); setNote(''); setMood(2); }
  function save() {
    if (!kind) return;
    const n = (s: string) => { const v = parseInt(s, 10); return isNaN(v) ? undefined : v; };
    const vol = (s: string) => { const v = parseFloat(s.replace(',', '.')); return isNaN(v) ? undefined : Math.round(u.bottleToMl(v)); };
    if (kind === 'feed') addEntry('feed', { side, volumeMl: side === 'bottle' ? vol(ml) : undefined, durationMin: n(mins), note });
    else if (kind === 'pump') addEntry('pump', { volumeMl: vol(ml), note });
    else if (kind === 'sleep') addEntry('sleep', { durationMin: n(mins), note });
    else if (kind === 'diaper') addEntry('diaper', { diaperType: diaper, note });
    else if (kind === 'activity') addEntry('activity', { durationMin: n(mins), note });
    else if (kind === 'mood') addEntry('mood', { mood, note });
    else addEntry(kind, { note }); // note / meal / medicine / potty
    setKind(null);
  }

  // On-device intelligence for the focused child / pregnancy.
  const now = Date.now();
  const rhythm = cid ? childRhythm(cid, entries, now) : null;
  const feedPred = rhythm ? nextFeed(rhythm, now) : null;
  const napPred = rhythm ? napWindow(rhythm, now) : null;
  // "Needs a look" now lives only on the family overview (as per-member pills);
  // the child/Mum&Me views no longer repeat the nudge list.
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
        {onOverview ? (
          // Family overview is the home — the app logo + a light greeting.
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 2 }}>
              <Logo width={22} height={26} />
              <Text style={{ fontFamily: font.display700, fontSize: 19, color: color.ink }}>Everly</Text>
            </View>
            <Text style={{ fontFamily: font.display700, fontSize: 20, color: color.ink, paddingHorizontal: 2, marginTop: 2 }}>{greeting()}, {name}</Text>
          </>
        ) : (
          // Inside a module the module's own title replaces the app logo/title.
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 2 }}>
            {multiModule && (
              <Pressable onPress={goOverview} hitSlop={8} accessibilityLabel="Back to family overview" style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 2, opacity: pressed ? 0.6 : 1 })}>
                <ChevronLeft size={18} color={color.primary} />
                <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>Family</Text>
              </Pressable>
            )}
            <Text style={{ flex: 1, fontFamily: font.display700, fontSize: 20, color: color.ink }} numberOfLines={1}>
              {activeCat ? catLabel : isYou ? `Mum&Me · ${youStatusLabel(dueDate, maternalBirth)}` : (activeChild ? `${activeChild.name}${activeChild.birthDate ? ` · ${ageLabel(activeChild.birthDate)}` : ''}` : '')}
            </Text>
          </View>
        )}
      </View>

      {/* Content + reserved rail */}
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {showDock && dockSide === 'left' && <RailDock {...railProps} side="left" onMirror={() => setDockSide('right')} />}
    {activeCat ? (
      <View style={{ flex: 1 }}><CategoryView cat={activeCat} /></View>
    ) : (
    <View style={{ flex: 1 }}>
      {/* Pregnancy / Postpartum tabs stay pinned above the scroll in Mum&Me */}
      {!onOverview && isYou && (
        <View style={{ paddingTop: 10, paddingBottom: 10, paddingLeft: padStart, paddingRight: padEnd, backgroundColor: color.canvas }}>
          <PhaseTabs phase={phase} setPhase={setPhase} />
        </View>
      )}
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: !onOverview && isYou ? 4 : 10, paddingBottom: 28, paddingLeft: padStart, paddingRight: padEnd, gap: 16 }}
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

      {/* Appointments — themed to this child, above the timeline */}
      {activeChild && <ChildAppointments childId={activeChild.id} colorKey={activeChild.color} />}

      {/* Next due vaccine reminder */}
      {dueVax && (
        <View style={{ gap: 10 }}>
          <Label>Up next</Label>
          <FeedRow chipBg="#FBE0EA" icon={<Syringe size={22} color={color.rose} />} title={dueVax.name}
            sub={dueVax.dueDate ? `Due ${dueVax.dueDate}` : 'Scheduled'} trailing={<Badge text="vaccine" bg="#FBE0EA" fg={color.rose} />} />
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
            {kind === 'feed' && side === 'bottle' && <Field label={`Amount (${u.bottleUnit})`} value={ml} onChangeText={setMl} placeholder={u.imperial ? 'e.g. 4' : 'e.g. 120'} />}
            {(kind === 'feed' || kind === 'sleep' || kind === 'activity') && <DurationField label="Duration" value={mins} onChange={setMins} />}
            {kind === 'pump' && <Field label={`Amount (${u.bottleUnit})`} value={ml} onChangeText={setMl} placeholder={u.imperial ? 'e.g. 3' : 'e.g. 90'} />}
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
    </View>
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

/* Reserved side rail — "More" category shortcuts on top, a divider, then the
   module avatars (with Mum&Me at the very bottom), and the mirror (handedness
   flip) pinned below that. */
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
          {/* More categories on top (mirrored order) */}
          {RAIL_CATS.filter((cat) => cat.key !== 'insights').slice().reverse().map((cat) => renderCat(cat, cat.key === activeCat, onNavigate))}

          <View style={{ width: 24, height: 1, backgroundColor: color.hairline, marginVertical: 2 }} />

          {/* Modules below: add, insights, children, then Mum&Me at the very bottom */}
          <Pressable onPress={onAdd} accessibilityLabel="Add a family member">
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: color.canvas, alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={17} color={color.muted} />
            </View>
          </Pressable>

          {RAIL_CATS.filter((cat) => cat.key === 'insights').map((cat) => renderCat(cat, cat.key === activeCat, onNavigate))}

          {children.slice().reverse().map((ch) => {
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

/** Pregnancy / Postpartum segmented toggle (pinned above the Mum&Me scroll). */
function PhaseTabs({ phase, setPhase }: { phase: 'pregnancy' | 'postpartum'; setPhase: (p: 'pregnancy' | 'postpartum') => void }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: '#EFEDF8', borderRadius: radius.pill, padding: 3 }}>
      {(['pregnancy', 'postpartum'] as const).map((p) => {
        const on = p === phase;
        return (
          <Pressable key={p} onPress={() => setPhase(p)} style={{ flex: 1, paddingVertical: 9, borderRadius: radius.pill, alignItems: 'center', backgroundColor: on ? color.rose : 'transparent' }}>
            <Text style={{ fontFamily: on ? font.body700 : font.body600, fontSize: 13, color: on ? '#fff' : color.inkSecondary }}>{p === 'pregnancy' ? 'Pregnancy' : 'Postpartum'}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MaternityView({
  phase, setPhase, dueDate, maternalBirth, pregAppts, matAppts, pregArchive, onArrived, onStartPregnancy,
}: {
  phase: 'pregnancy' | 'postpartum';
  setPhase: (p: 'pregnancy' | 'postpartum') => void;
  dueDate: string | null;
  maternalBirth: string | null;
  pregAppts: ApptLike[];
  matAppts: ApptLike[];
  pregArchive: PregArchive[];
  onArrived: () => void;
  onStartPregnancy: () => void;
}) {
  const u = useUnits();
  // Accordion grid: one card open at a time, panel renders full-width below.
  const [openCard, setOpenCard] = useState<string | null>(null);
  // Switching phase from the pinned tabs should collapse any open card.
  React.useEffect(() => { setOpenCard(null); }, [phase]);
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
  // Pregnancy's Monitoring & calls is rendered as its own full-width card
  // (below), so the grid is postpartum-only.
  const tiles: { key: string; label: string; bg: string; icon: React.ReactNode }[] =
    phase === 'pregnancy'
      ? []
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
      {/* Teal status hero */}
      <View style={[{ backgroundColor: color.rose, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
        {phase === 'pregnancy' ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ flex: 1, fontFamily: font.display700, fontSize: 24, color: '#fff' }}>{gest ? `Week ${gest.week}` : pregArchived ? 'Pregnancy complete 🎉' : 'Pregnancy'}</Text>
              {pregLive && (
                <Pressable onPress={onArrived} accessibilityLabel="Baby has arrived" hitSlop={6} style={({ pressed }) => [{ backgroundColor: '#fff', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 5, opacity: pressed ? 0.85 : 1 }, shadow.card]}>
                  <Text style={{ fontFamily: font.body700, fontSize: 11.5, color: color.rose }}>🎉 Baby's here</Text>
                </Pressable>
              )}
            </View>
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
                  {wk.lengthCm > 0 ? `~${u.fmtLength(wk.lengthCm, 0)}` : ''}{wk.weightG > 0 ? `${wk.lengthCm > 0 ? ' · ' : ''}~${u.fmtBabyWeight(wk.weightG)}` : ''} · tap for week-by-week
                </Text>
              )}
            </View>
          </Pressable>
        )}
      </View>

      {/* Appointments — full-width, above the kick counter */}
      {phase === 'pregnancy' && showGrid && <PregnancyAppointments />}

      {/* Care & check-in — full-width (replaces the check-in & care tiles) */}
      {phase === 'pregnancy' && showGrid && <CareCheckinCard />}

      {/* Labour & movement — below Care (pink) */}
      {phase === 'pregnancy' && showGrid && (
        <View style={{ gap: 10 }}>
          <Label>Labour & movement</Label>
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, gap: 14, borderWidth: 2, borderColor: color.rose }, shadow.card]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: '#FBE0EA', alignItems: 'center', justifyContent: 'center' }}><Activity size={20} color={color.rose} /></View>
              <Text style={{ flex: 1, fontFamily: font.display700, fontSize: 17, color: color.ink }}>Labour &amp; movement</Text>
            </View>
            <LabourPanel />
          </View>
        </View>
      )}

      {/* Getting ready — full-width, always open, below Labour */}
      {phase === 'pregnancy' && showGrid && (
        <View style={{ gap: 10 }}>
          <Label>Getting ready</Label>
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, gap: 14, borderWidth: 2, borderColor: color.rose }, shadow.card]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: '#FBE0EA', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={20} color={color.rose} /></View>
              <Text style={{ flex: 1, fontFamily: font.display700, fontSize: 17, color: color.ink }}>Getting ready</Text>
            </View>
            <GettingReadyPanel />
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

      {/* Monitoring & calls — one full-width card (pregnancy) */}
      {showGrid && phase === 'pregnancy' && (
        <View style={{ gap: 10 }}>
          <Label>More for you</Label>
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, gap: 14, borderWidth: 2, borderColor: color.rose }, shadow.card]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: '#FBE0EA', alignItems: 'center', justifyContent: 'center' }}><Shield size={20} color="#B04070" /></View>
              <Text style={{ flex: 1, fontFamily: font.display700, fontSize: 17, color: color.ink }}>Monitoring &amp; calls</Text>
            </View>
            <MonitorPanel />
          </View>
        </View>
      )}

      {/* Feature grid — tapping a card expands it inline, directly under its row */}
      {showGrid && tiles.length > 0 && (
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

      {/* Up next (postpartum only — pregnancy appointments live in their own card) */}
      {showGrid && phase === 'postpartum' && upNext.length > 0 && (
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
          <Pressable key={opt} onPress={() => onChange(opt)} style={{ paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: sel ? color.rose : '#fff', borderWidth: 1, borderColor: sel ? color.rose : color.hairline }}>
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
      <Pressable onPress={onToggle} hitSlop={8} style={{ width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: checked ? color.rose : '#fff', borderWidth: 1.5, borderColor: checked ? color.rose : color.hairline }}>
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
    case 'ready': return <GettingReadyPanel />;
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

/* ── Getting ready (birth prep + baby names, merged) ───────────────────────── */

/** Circular progress dial (rose). */
function Ring({ pct, size = 104, sw = 11, label }: { pct: number; size?: number; sw?: number; label?: string }) {
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, pct / 100)) * c;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#F0E3EA" strokeWidth={sw} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={color.rose} strokeWidth={sw} fill="none" strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <Text style={{ fontFamily: font.display700, fontSize: 22, color: color.rose }}>{pct}%</Text>
      {label ? <Text style={{ fontFamily: font.body500, fontSize: 9.5, color: color.muted, marginTop: 1 }}>{label}</Text> : null}
    </View>
  );
}

/** Small rose-tinted inline text input (for section add-rows / rename). */
function MiniInput({ value, onChangeText, placeholder, onSubmit }: { value: string; onChangeText: (t: string) => void; placeholder?: string; onSubmit?: () => void }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={color.faint}
      autoCapitalize="sentences"
      onSubmitEditing={onSubmit}
      returnKeyType="done"
      style={{ backgroundColor: color.canvas, borderRadius: radius.tile, paddingHorizontal: 12, paddingVertical: 10, fontFamily: font.body500, fontSize: 13, color: color.ink }}
    />
  );
}

function GettingReadyPanel() {
  const [tab, setTab] = useState<'checklist' | 'names'>('checklist');
  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', backgroundColor: color.canvas, borderRadius: radius.pill, padding: 3 }}>
        {(['checklist', 'names'] as const).map((t) => {
          const on = t === tab;
          return (
            <Pressable key={t} onPress={() => setTab(t)} style={{ flex: 1, paddingVertical: 9, borderRadius: radius.pill, alignItems: 'center', backgroundColor: on ? color.rose : 'transparent' }}>
              <Text style={{ fontFamily: font.body700, fontSize: 13, color: on ? '#fff' : color.muted }}>{t === 'checklist' ? 'Checklist' : 'Names'}</Text>
            </Pressable>
          );
        })}
      </View>
      {tab === 'checklist' ? <PrepChecklist /> : <NamesPanel />}
    </View>
  );
}

function PrepChecklist() {
  const { birthPrep, addBirthPrep, toggleBirthPrep, deleteBirthPrep, prepSections, addPrepSection, renamePrepSection, deletePrepSection } = useData();
  const { toast } = useFeedback();
  const extra = Array.from(new Set(birthPrep.map((i) => i.category))).filter((c) => !prepSections.includes(c));
  const sections = [...prepSections, ...extra];
  const total = birthPrep.length;
  const done = birthPrep.filter((i) => i.checked).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const next = birthPrep.find((i) => !i.checked);

  const [open, setOpen] = useState<Record<string, boolean>>({});
  const isOpen = (s: string) => open[s] ?? false;
  const [adding, setAdding] = useState(false);
  const [secName, setSecName] = useState('');

  // Collapsed by default ("off"): show only the first 3 categories, with a
  // toggle to reveal the rest.
  const [showAll, setShowAll] = useState(false);
  const visibleSections = showAll ? sections : sections.slice(0, 3);
  const hiddenCount = sections.length - visibleSections.length;

  // Starter-list picker: choose which of the ten sections to load.
  const norm = (s: string) => s.trim().toLowerCase();
  const haveSet = new Set(birthPrep.map((i) => `${norm(i.category)}|${norm(i.label)}`));
  const catInfo = PREP_CATS.map((cat) => {
    const its = STARTER_PREP.filter((s) => s.category === cat);
    return { cat, total: its.length, fresh: its.filter((s) => !haveSet.has(`${norm(s.category)}|${norm(s.label)}`)).length };
  });
  const [loadOpen, setLoadOpen] = useState(false);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const openLoad = () => { setSel(new Set(catInfo.filter((c) => c.fresh > 0).map((c) => c.cat))); setLoadOpen(true); };
  const toggleSel = (cat: string) => setSel((s) => { const n = new Set(s); if (n.has(cat)) n.delete(cat); else n.add(cat); return n; });
  const selFresh = catInfo.filter((c) => sel.has(c.cat)).reduce((a, c) => a + c.fresh, 0);
  const doLoad = () => {
    let added = 0;
    PREP_CATS.forEach((cat) => {
      if (!sel.has(cat)) return;
      addPrepSection(cat);
      STARTER_PREP.filter((s) => s.category === cat && !haveSet.has(`${norm(s.category)}|${norm(s.label)}`)).forEach((s) => { addBirthPrep(s); added++; });
    });
    setLoadOpen(false);
    toast(added > 0 ? `Loaded ${added} item${added === 1 ? '' : 's'}` : 'Nothing new to add');
  };

  return (
    <View style={{ gap: 12 }}>
      {/* Centered dial */}
      <View style={{ alignItems: 'center', gap: 3 }}>
        <Ring pct={pct} label={`${done} / ${total} done`} />
        <Text style={{ fontFamily: font.body700, fontSize: 13.5, color: color.ink }}>Birth-prep checklist</Text>
        {next ? (
          <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.muted }}>Next: {next.label}</Text>
        ) : total > 0 ? (
          <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.rose }}>All done 🎉</Text>
        ) : (
          <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.muted }}>Add items or load the starter list</Text>
        )}
      </View>

      {visibleSections.map((sec) => (
        <PrepSection
          key={sec}
          name={sec}
          items={birthPrep.filter((i) => i.category === sec)}
          open={isOpen(sec)}
          onToggle={() => setOpen((o) => ({ ...o, [sec]: !isOpen(sec) }))}
          onAdd={(label) => addBirthPrep({ category: sec, label })}
          onToggleItem={toggleBirthPrep}
          onDeleteItem={deleteBirthPrep}
          onRename={(nn) => renamePrepSection(sec, nn)}
          onDelete={() => deletePrepSection(sec)}
        />
      ))}

      {sections.length > 3 && (
        <Pressable onPress={() => setShowAll((v) => !v)} style={({ pressed }) => [{ alignItems: 'center', paddingVertical: 6, opacity: pressed ? 0.6 : 1 }]}>
          <Text style={{ fontFamily: font.body700, fontSize: 12.5, color: color.roseInk }}>
            {showAll ? 'Show fewer' : `Show all ${sections.length} categories${hiddenCount ? ` (+${hiddenCount})` : ''}`}
          </Text>
        </Pressable>
      )}

      {adding ? (
        <View style={{ borderWidth: 1.5, borderColor: color.rose, borderStyle: 'dashed', borderRadius: radius.card, padding: 12, gap: 10 }}>
          <PanelLabel>New section</PanelLabel>
          <MiniInput value={secName} onChangeText={setSecName} placeholder="Section name…" onSubmit={() => { addPrepSection(secName); setSecName(''); setAdding(false); }} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Cancel" variant="secondary" onPress={() => { setAdding(false); setSecName(''); }} style={{ flex: 1 }} />
            <Button label="Add" tint={color.rose} onPress={() => { addPrepSection(secName); setSecName(''); setAdding(false); }} style={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <Pressable onPress={() => setAdding(true)} style={({ pressed }) => [{ borderWidth: 1.5, borderColor: '#E8C9D7', borderStyle: 'dashed', borderRadius: radius.card, paddingVertical: 13, alignItems: 'center', opacity: pressed ? 0.7 : 1 }]}>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.rose }}>＋ Add section</Text>
        </Pressable>
      )}

      <Button label="↻ Load starter checklist" variant="secondary" tint={color.rose} onPress={openLoad} />

      {/* Starter-list picker */}
      <Modal visible={loadOpen} transparent animationType="fade" onRequestClose={() => setLoadOpen(false)}>
        <Pressable onPress={() => setLoadOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: '#fff', borderRadius: 22, padding: 18, maxHeight: '82%' }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 17, color: color.ink }}>Load starter lists</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, marginTop: 3, marginBottom: 8 }}>Pick the sections to add. Anything already on your list is skipped.</Text>

            {(() => {
              const withFresh = catInfo.filter((c) => c.fresh > 0).map((c) => c.cat);
              const allOn = withFresh.length > 0 && withFresh.every((c) => sel.has(c));
              return (
                <Pressable onPress={() => setSel(allOn ? new Set() : new Set(withFresh))} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: color.hairline }}>
                  <View style={{ width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: allOn ? color.rose : '#D8C6D1', backgroundColor: allOn ? color.rose : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    {allOn ? <Text style={{ color: '#fff', fontSize: 12, fontFamily: font.body700 }}>✓</Text> : null}
                  </View>
                  <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.roseInk }}>{allOn ? 'Clear all' : 'Select all'}</Text>
                </Pressable>
              );
            })()}

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {catInfo.map(({ cat, total: t, fresh }) => {
                const doneCat = fresh === 0;
                const on = sel.has(cat);
                return (
                  <Pressable key={cat} disabled={doneCat} onPress={() => toggleSel(cat)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, opacity: doneCat ? 0.45 : 1 }}>
                    <View style={{ width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: on ? color.rose : '#D8C6D1', backgroundColor: on ? color.rose : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                      {on ? <Text style={{ color: '#fff', fontSize: 12, fontFamily: font.body700 }}>✓</Text> : null}
                    </View>
                    <Text style={{ flex: 1, fontFamily: font.body700, fontSize: 13.5, color: color.ink }} numberOfLines={1}>{cat}</Text>
                    <Text style={{ fontFamily: font.body500, fontSize: 11, color: color.muted }}>{doneCat ? 'Added' : `${fresh}${fresh < t ? ` of ${t}` : ''} item${fresh === 1 ? '' : 's'}`}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setLoadOpen(false)} style={{ flex: 1 }} />
              <Button label={selFresh > 0 ? `Load ${selFresh} item${selFresh === 1 ? '' : 's'}` : 'Load'} tint={color.rose} disabled={selFresh === 0} onPress={doLoad} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function PrepSection({ name, items, open, onToggle, onAdd, onToggleItem, onDeleteItem, onRename, onDelete }: {
  name: string;
  items: BirthPrepItem[];
  open: boolean;
  onToggle: () => void;
  onAdd: (label: string) => void;
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
}) {
  const done = items.filter((i) => i.checked).length;
  const total = items.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const [label, setLabel] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [rn, setRn] = useState(name);
  const [confirmDel, setConfirmDel] = useState(false);
  const submitAdd = () => { if (label.trim()) { onAdd(label.trim()); setLabel(''); } };

  return (
    <View style={{ borderWidth: 1, borderColor: color.hairline, borderRadius: radius.card, padding: 12 }}>
      {renaming ? (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View style={{ flex: 1 }}><MiniInput value={rn} onChangeText={setRn} placeholder="Section name…" onSubmit={() => { onRename(rn); setRenaming(false); }} /></View>
          <Button label="Save" tint={color.rose} onPress={() => { onRename(rn); setRenaming(false); }} />
          <Pressable onPress={() => { setRenaming(false); setRn(name); }} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 12, color: color.muted }}>Cancel</Text></Pressable>
        </View>
      ) : (
        <Pressable onPress={onToggle} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ flex: 1, fontFamily: font.body700, fontSize: 13, color: color.ink }}>{name}</Text>
          <Text style={{ fontFamily: font.body700, fontSize: 11.5, color: color.muted }}>{done} / {total}</Text>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.faint }}>{open ? '▾' : '▸'}</Text>
        </Pressable>
      )}

      <View style={{ height: 7, borderRadius: 4, backgroundColor: '#F0E3EA', overflow: 'hidden', marginTop: 8 }}>
        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: color.rose, borderRadius: 4 }} />
      </View>

      {open && !renaming && (
        <View style={{ marginTop: 10, gap: 6 }}>
          {items.map((i) => (
            <CheckRow key={i.id} label={i.label} checked={i.checked} onToggle={() => onToggleItem(i.id)} onDelete={() => onDeleteItem(i.id)} />
          ))}
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <View style={{ flex: 1 }}><MiniInput value={label} onChangeText={setLabel} placeholder={`Add to ${name}…`} onSubmit={submitAdd} /></View>
            <Button label="Add" tint={color.rose} onPress={submitAdd} />
          </View>
          {confirmDel ? (
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: color.hairline }}>
              <Text style={{ flex: 1, fontFamily: font.body500, fontSize: 12, color: color.roseInk }}>Delete “{name}” &amp; its items?</Text>
              <Pressable onPress={() => setConfirmDel(false)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 12, color: color.muted }}>Keep</Text></Pressable>
              <Pressable onPress={onDelete} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 12, color: color.rose }}>Delete</Text></Pressable>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 18, paddingTop: 8, borderTopWidth: 1, borderTopColor: color.hairline }}>
              <Pressable onPress={() => { setRenaming(true); setRn(name); }} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 11, color: color.muted }}>✎ Rename</Text></Pressable>
              <Pressable onPress={() => setConfirmDel(true)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 11, color: color.roseInk }}>🗑 Delete section</Text></Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

/* PREGNANCY ---------------------------------------------------------------- */

function CheckinPanel({ onClose }: { onClose: () => void }) {
  const { checkins, addCheckin } = useData();
  const u = useUnits();
  const [mood, setMood] = useState<number>(2);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [weight, setWeight] = useState('');
  const latest = checkins[0];
  const toggleSym = (s: string) => setSymptoms((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  const save = () => { const w = numOrUndef(weight); addCheckin({ mood, symptoms, weightKg: w == null ? undefined : u.weightToKg(w) }); onClose(); };
  return (
    <View style={{ gap: 14 }}>
      {latest && (
        <View style={{ backgroundColor: color.canvas, borderRadius: radius.tile, padding: 12 }}>
          <PanelLabel>Latest check-in</PanelLabel>
          <Text style={{ fontFamily: font.body600, fontSize: 13, color: color.ink, marginTop: 4 }}>
            {MOODS[latest.mood] ?? '—'}{latest.weightKg ? ` · ${u.fmtWeight(latest.weightKg)}` : ''}{latest.symptoms.length ? ` · ${latest.symptoms.join(', ')}` : ''}
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
      <Field label={`Weight (${u.weightUnit})`} value={weight} onChangeText={setWeight} placeholder={u.imperial ? 'e.g. 151' : 'e.g. 68.5'} keyboardType="default" />
      <Button label="Save check-in" onPress={save} />
    </View>
  );
}

function WeekPanel({ dueDate }: { dueDate: string | null }) {
  const u = useUnits();
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
            <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.inkSecondary }}>{c.lengthCm > 0 ? `~${u.fmtLength(c.lengthCm, 0)}` : ''}{c.weightG > 0 ? `${c.lengthCm > 0 ? ' · ' : ''}~${u.fmtBabyWeight(c.weightG)}` : ''}</Text>
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

/** Blood glucose + blood pressure — trend charts (banded like the weight chart)
 *  with −/+ stepper inputs matching the water/sleep rows. Lives in the Care card
 *  below the sleep chart. */
function VitalsMonitoring() {
  const { pregVitals, addPregVital } = useData();
  const { toast } = useFeedback();
  const [tag, setTag] = useState('fasting');
  const [gVal, setGVal] = useState(5.2);          // glucose draft (mmol/L)
  const [sysV, setSysV] = useState(118);           // systolic draft
  const [diaV, setDiaV] = useState(74);            // diastolic draft
  const gluSeries = pregVitals.filter((v) => v.kind === 'glucose' && v.glucose != null).slice(0, 10).reverse();
  const bpSeries = pregVitals.filter((v) => v.kind === 'bp' && (v.systolic != null || v.diastolic != null)).slice(0, 10).reverse();
  const logGlucose = () => { addPregVital({ kind: 'glucose', glucose: gVal, tag }); toast('Glucose logged'); };
  const logBp = () => { addPregVital({ kind: 'bp', systolic: sysV, diastolic: diaV }); toast('Blood pressure logged'); };
  const gHigh = tag.includes('fasting') ? gVal >= 5.3 : gVal > 7.8;
  const bpHigh = sysV >= 140 || diaV >= 90;
  const roseInk = color.roseInk, teal = color.maternalTeal;
  const hint = { fontFamily: font.body400, fontSize: 11.5, color: color.muted, paddingVertical: 8, textAlign: 'center' as const };
  const block = { backgroundColor: '#FAF3F6', borderRadius: radius.tile, padding: 12 } as const;
  const stepRow = (emoji: string, name: string, val: string, unit: string, status: string, ok: boolean, onDec: () => void, onInc: () => void) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <Text style={{ fontSize: 16 }}>{emoji}</Text>
      <Text numberOfLines={1} style={{ flex: 1, minWidth: 0, fontFamily: font.body700, fontSize: 12, color: '#7d7a90' }}>{name}</Text>
      <Text style={{ fontFamily: font.display700, fontSize: 17, color: color.ink }}>{val}<Text style={{ fontFamily: font.body500, fontSize: 10, color: color.muted }}>{unit}</Text></Text>
      {status ? <View style={{ backgroundColor: ok ? '#E4F3EC' : '#FBE7D8', borderRadius: radius.pill, paddingVertical: 2, paddingHorizontal: 7 }}><Text style={{ fontFamily: font.body700, fontSize: 9, color: ok ? '#1E6C50' : '#B5662E' }}>{status}</Text></View> : null}
      <Stepper accent={roseInk} onDec={onDec} onInc={onInc} />
    </View>
  );
  const saveBtn = (onPress: () => void) => (
    <Pressable onPress={onPress} style={({ pressed }) => [{ alignSelf: 'flex-end', backgroundColor: color.rose, borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 18, marginTop: 9, opacity: pressed ? 0.85 : 1 }]}>
      <Text style={{ fontFamily: font.body700, fontSize: 12, color: '#fff' }}>Save</Text>
    </Pressable>
  );
  return (
    <>
      {/* Blood glucose */}
      <View style={[block, { marginBottom: 8 }]}>
        <PanelLabel>Blood glucose</PanelLabel>
        <View style={{ marginTop: 6, marginBottom: 8 }}><SelectChips options={['fasting', 'post-meal']} value={tag} onChange={setTag} /></View>
        {stepRow('💉', 'Glucose', gVal.toFixed(1), ' mmol/L', gHigh ? 'High' : 'In range', !gHigh, () => setGVal(Math.max(0, Math.round((gVal - 0.1) * 10) / 10)), () => setGVal(Math.round((gVal + 0.1) * 10) / 10))}
        {gluSeries.length >= 1 ? (() => {
          const n = gluSeries.length, W = 300, H = 116, xL = 18, top = 10, bot = 90;
          const vals = gluSeries.map((s) => s.glucose as number);
          const yMin = Math.min(4.5, ...vals) - 0.3, yMax = Math.max(6, ...vals) + 0.3;
          const gx = (i: number) => xL + (n <= 1 ? 0.5 : i / (n - 1)) * (W - xL - 8);
          const gy = (v: number) => top + (1 - (v - yMin) / ((yMax - yMin) || 1)) * (bot - top);
          return (
            <Svg width="100%" height={104} viewBox={`0 0 ${W} ${H}`}>
              <Rect x={xL} y={gy(5.3)} width={W - xL - 8} height={Math.max(0, bot - gy(5.3))} fill="#DCEFE3" />
              <SvgLine x1={xL} y1={gy(5.3)} x2={W - 8} y2={gy(5.3)} stroke="#5aa78c" strokeWidth={1} strokeDasharray="3 3" />
              <SvgText x={W - 8} y={gy(5.3) - 3} fontSize={7.5} fill="#3a8a6e" textAnchor="end">5.3 fasting</SvgText>
              {n > 1 && <Polyline points={gluSeries.map((s, i) => `${gx(i)},${gy(s.glucose as number)}`).join(' ')} fill="none" stroke={teal} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />}
              {gluSeries.map((s, i) => { const r = s.glucose as number; const fasting = (s.tag ?? '').includes('fasting'); const hi = fasting ? r >= 5.3 : r > 7.8; return <Circle key={i} cx={gx(i)} cy={gy(r)} r={3.2} fill={hi ? '#D8505A' : teal} stroke="#fff" strokeWidth={1.3} />; })}
              <SvgText x={W / 2} y={H - 2} fontSize={7.5} fill="#b0a6ae" textAnchor="middle">last {n} reading{n === 1 ? '' : 's'}</SvgText>
            </Svg>
          );
        })() : <Text style={hint}>Log a reading to see your trend.</Text>}
        {saveBtn(logGlucose)}
      </View>

      {/* Blood pressure */}
      <View style={block}>
        <PanelLabel>Blood pressure</PanelLabel>
        <View style={{ marginTop: 6 }}>
          {stepRow('🩺', 'Systolic', String(sysV), ' mmHg', bpHigh ? 'High' : 'Normal', !bpHigh, () => setSysV(Math.max(0, sysV - 1)), () => setSysV(sysV + 1))}
          {stepRow('💓', 'Diastolic', String(diaV), ' mmHg', '', true, () => setDiaV(Math.max(0, diaV - 1)), () => setDiaV(diaV + 1))}
        </View>
        {bpSeries.length >= 1 ? (() => {
          const n = bpSeries.length, W = 300, H = 116, xL = 22, top = 10, bot = 90;
          const sysVals = bpSeries.map((s) => s.systolic ?? 0), diaVals = bpSeries.map((s) => s.diastolic ?? 0);
          const yMin = Math.min(65, ...diaVals) - 5, yMax = Math.max(145, ...sysVals) + 5;
          const gx = (i: number) => xL + (n <= 1 ? 0.5 : i / (n - 1)) * (W - xL - 8);
          const gy = (v: number) => top + (1 - (v - yMin) / ((yMax - yMin) || 1)) * (bot - top);
          return (
            <Svg width="100%" height={104} viewBox={`0 0 ${W} ${H}`}>
              <SvgLine x1={xL} y1={gy(140)} x2={W - 8} y2={gy(140)} stroke="#D8505A" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
              <SvgLine x1={xL} y1={gy(90)} x2={W - 8} y2={gy(90)} stroke="#D8505A" strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />
              <SvgText x={W - 8} y={gy(140) - 3} fontSize={7.5} fill="#c0505a" textAnchor="end">140/90 limit</SvgText>
              {n > 1 && <Polyline points={bpSeries.map((s, i) => `${gx(i)},${gy(s.systolic ?? 0)}`).join(' ')} fill="none" stroke="#6B6FC9" strokeWidth={2.4} strokeLinejoin="round" />}
              {n > 1 && <Polyline points={bpSeries.map((s, i) => `${gx(i)},${gy(s.diastolic ?? 0)}`).join(' ')} fill="none" stroke="#A9A6E4" strokeWidth={2.2} strokeLinejoin="round" />}
              {bpSeries.map((s, i) => <Circle key={`s${i}`} cx={gx(i)} cy={gy(s.systolic ?? 0)} r={2.9} fill="#6B6FC9" />)}
              {bpSeries.map((s, i) => <Circle key={`d${i}`} cx={gx(i)} cy={gy(s.diastolic ?? 0)} r={2.7} fill="#A9A6E4" />)}
            </Svg>
          );
        })() : <Text style={hint}>Log a reading to see your trend.</Text>}
        {bpSeries.length >= 1 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
            <ChartKey sw="#6B6FC9" t="Systolic" /><ChartKey sw="#A9A6E4" t="Diastolic" /><ChartKey sw="#D8505A" t="140/90 limit" />
          </View>
        )}
        {saveBtn(logBp)}
      </View>
    </>
  );
}

/** Monitoring & calls — what to expect, the when-to-call triage, your support
 *  circle and helplines. (Vitals monitoring lives in the Care card.) */
function MonitorPanel() {
  const { dueDate, supportContacts, addSupportContact, deleteSupportContact } = useData();
  const { toast } = useFeedback();
  const wx = useWeather();
  const [expanded, setExpanded] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [nm, setNm] = useState(''); const [role, setRole] = useState(''); const [phone, setPhone] = useState('');
  const addContact = () => { if (!nm.trim()) return; addSupportContact({ name: nm, role, phone }); setNm(''); setRole(''); setPhone(''); setAdding(false); toast('Contact added'); };
  const week = gestFromDueDate(dueDate ?? undefined)?.week ?? null;
  const helplines = helplinesFor(wx.location?.country);
  const openTel = (tel?: string, detail?: string) => { const n = tel || dialable(detail ?? ''); if (n) Linking.openURL(`tel:${n}`); };
  const callTriage = () => {
    const c = supportContacts.find((c) => c.phone);
    if (c?.phone) { Linking.openURL(`tel:${c.phone}`); return; }
    const h = helplines.find((h) => h.tel || dialable(h.detail));
    const n = h ? (h.tel || dialable(h.detail)) : null;
    if (n) Linking.openURL(`tel:${n}`); else toast('Add your midwife’s number in Your circle below');
  };
  const secLbl = { fontFamily: font.body700, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase' as const, color: '#B7889F', marginBottom: 8, paddingHorizontal: 2 };
  const dotRow = { flexDirection: 'row' as const, gap: 9, alignItems: 'flex-start' as const, paddingVertical: 4 };
  const dot = { width: 7, height: 7, borderRadius: 4, marginTop: 6 };
  const dotTx = { flex: 1, fontFamily: font.body500, fontSize: 13, color: color.ink, lineHeight: 18 };

  return (
    <View style={{ gap: 14 }}>
      {/* What to expect this week — always visible (the collapsed preview) */}
      {week != null && (() => {
        const items = expectedSymptoms(week);
        return (
          <View>
            <Text style={secLbl}>What to expect · week {week}</Text>
            <View style={{ backgroundColor: '#EAF6EE', borderWidth: 1, borderColor: '#CDE7D5', borderRadius: 16, padding: 13 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <Text style={{ fontSize: 15 }}>🌱</Text>
                <Text style={{ fontFamily: font.body700, fontSize: 13, color: '#1E6C50' }}>Common now — usually normal</Text>
              </View>
              <Text style={{ fontFamily: font.body400, fontSize: 11, color: '#5e8a72', marginBottom: 4 }}>Around this week many mums notice:</Text>
              {items.map((s, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 7, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: 'rgba(46,125,91,0.12)' }}>
                  <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 15 }}>{s.emoji}</Text></View>
                  <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 13, color: color.ink }}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })()}

      {/* Expand — reveal monitoring, when to call & support */}
      <Pressable onPress={() => setExpanded((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.roseInk }}>{expanded ? 'Show less' : 'Monitoring, when to call & support'}</Text>
        <Text style={{ fontFamily: font.body700, fontSize: 11, color: color.roseInk }}>{expanded ? '▴' : '▾'}</Text>
      </Pressable>

      {expanded && (<>
      {/* When to call — severity list */}
      <View>
        <Text style={secLbl}>When to call</Text>
        <View style={{ borderWidth: 1.5, borderColor: '#F3C4CB', borderRadius: 16, overflow: 'hidden' }}>
          <View style={{ backgroundColor: '#FCE7E9', paddingVertical: 11, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 15 }}>📞</Text>
            <Text style={{ fontFamily: font.body700, fontSize: 13, color: '#B5303B' }}>Get help if you notice…</Text>
          </View>
          <View style={{ paddingHorizontal: 13, paddingBottom: 12, paddingTop: 2 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase', color: '#B5303B', marginTop: 10, marginBottom: 2 }}>Call your midwife now</Text>
            {RED_FLAGS_CALL_NOW.map((f, i) => (<View key={i} style={dotRow}><View style={[dot, { backgroundColor: '#B5303B' }]} /><Text style={dotTx}>{f}</Text></View>))}
            <Text style={{ fontFamily: font.body700, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase', color: color.goldInk, marginTop: 10, marginBottom: 2 }}>Call soon / same day</Text>
            {RED_FLAGS_CALL_SOON.map((f, i) => (<View key={i} style={dotRow}><View style={[dot, { backgroundColor: color.goldInk }]} /><Text style={dotTx}>{f}</Text></View>))}
            <Pressable onPress={callTriage} accessibilityLabel="Call maternity triage" style={{ marginTop: 11, backgroundColor: '#8E1F2C', borderRadius: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Text style={{ fontSize: 14 }}>📞</Text><Text style={{ fontFamily: font.body700, fontSize: 13.5, color: '#fff' }}>Call maternity triage</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Your support circle */}
      <View>
        <Text style={secLbl}>Your support circle</Text>
        {supportContacts.map((c) => (
          <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FAF3F6', borderRadius: radius.tile, paddingVertical: 9, paddingHorizontal: 11, marginBottom: 7 }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#FBE0EA', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: font.display700, fontSize: 13, color: color.roseInk }}>{c.name.charAt(0).toUpperCase()}</Text></View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.ink }}>{c.name}</Text>
              {c.role ? <Text style={{ fontFamily: font.body400, fontSize: 10, color: color.muted }}>{c.role}</Text> : null}
            </View>
            {c.phone ? <Pressable onPress={() => Linking.openURL(`tel:${c.phone}`)} style={{ backgroundColor: color.rose, borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 12 }}><Text style={{ fontFamily: font.body700, fontSize: 10.5, color: '#fff' }}>Call</Text></Pressable> : null}
            <Pressable onPress={() => deleteSupportContact(c.id)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 16, color: color.faint }}>×</Text></Pressable>
          </View>
        ))}
        {adding ? (
          <View style={{ gap: 8, backgroundColor: '#FAF3F6', borderRadius: radius.tile, padding: 12 }}>
            <Field label="Name" value={nm} onChangeText={setNm} placeholder="e.g. Sarah" autoCapitalize="words" />
            <Field label="Role (optional)" value={role} onChangeText={setRole} placeholder="Midwife, partner, doula…" autoCapitalize="sentences" />
            <Field label="Phone (optional)" value={phone} onChangeText={setPhone} placeholder="e.g. 07123 456789" />
            <View style={{ flexDirection: 'row', gap: 8 }}><Button label="Cancel" variant="secondary" onPress={() => setAdding(false)} style={{ flex: 1 }} /><Button label="Add" onPress={addContact} style={{ flex: 1 }} tint={color.rose} /></View>
          </View>
        ) : (
          <Pressable onPress={() => setAdding(true)} style={{ borderWidth: 1.4, borderColor: '#E0C2D2', borderStyle: 'dashed', borderRadius: radius.tile, paddingVertical: 10, alignItems: 'center' }}><Text style={{ fontFamily: font.body700, fontSize: 12, color: color.roseInk }}>＋ Add someone</Text></Pressable>
        )}
      </View>

      {/* Helplines (city-linked) */}
      <View>
        <Text style={secLbl}>Helplines</Text>
        <View style={{ backgroundColor: '#FBE0EA', borderRadius: radius.tile, padding: 13 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ flex: 1, fontFamily: font.body700, fontSize: 12.5, color: '#8A2F58' }}>Support, any time</Text>
            <Pressable onPress={() => setCityOpen(true)} style={{ backgroundColor: '#fff', borderRadius: radius.pill, paddingVertical: 3, paddingHorizontal: 9 }}>
              <Text style={{ fontFamily: font.body700, fontSize: 10, color: color.roseInk }}>📍 {wx.location ? `${wx.location.name} · Change` : 'Add your city'}</Text>
            </Pressable>
          </View>
          {helplines.map((h, i) => (
            <Pressable key={i} onPress={() => openTel(h.tel, h.detail)} accessibilityLabel={`Call ${h.name}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 7, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: 'rgba(176,64,112,0.14)' }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.ink }}>{h.name}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 11, color: '#7d6a74' }}>{h.detail}</Text>
              </View>
              <Text style={{ fontSize: 14 }}>📞</Text>
            </Pressable>
          ))}
        </View>
      </View>
      </>)}

      <CityPickerModal visible={cityOpen} wx={wx} onClose={() => setCityOpen(false)} />
    </View>
  );
}

/* ── Appointments card ──────────────────────────────────────────────────────
   One reusable, colour-themed card used across modules (Mum&Me + each child).
   Collapsed: a weather week strip + the next appointment. Expanded: the whole
   month. Location is stored per appointment and opens in Maps on tap. */

type ApptItem = { id: string; title: string; at: string; location?: string; mapsUrl?: string; kind?: 'appointment' | 'test'; result?: string };
/** Readable ink per child colour (matches the module accents). */
const CHILD_INK: Record<string, string> = { lilac: '#54579E', sky: '#2C5F90', mint: '#22806C', blush: '#B04070', peach: '#B5662E', butter: '#8A6A1E', sage: '#567F39' };
const apptDayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WD_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ── swipeable appointment overviews (mirror the main calendar's wheels) ──── */
const APPT_SPAN_DAYS = 120;
const APPT_GAP = 4;
const APPT_VISIBLE = 7;
const APPT_MONTH_SPAN = 12;
type DayWxLite = { code: number; tMax: number } | null;

/** Week view: a smooth momentum day-wheel; settling selects the centred day. */
function ApptWeekWheel({ days, selIndex, selectedKey, todayKey, apptDays, accent, fill, wxOf, onSelectDate }: {
  days: Date[]; selIndex: number; selectedKey: string; todayKey: string; apptDays: Set<string>;
  accent: string; fill: string; wxOf: (d: Date) => DayWxLite; onSelectDate: (d: Date) => void;
}) {
  const scRef = useRef<ScrollView>(null);
  const [cw, setCw] = useState(0); // 0 until measured, so the init scroll waits for the real width
  const lastX = useRef(0);
  const didInit = useRef(false);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const step = (cw || 46) + APPT_GAP;
  const clampLeft = (l: number) => Math.max(0, Math.min(days.length - APPT_VISIBLE, l));
  const onLayout = (e: NativeSyntheticEvent<{ layout: { width: number } }>) => { const w = e.nativeEvent.layout.width; if (w > 0) setCw((w - APPT_GAP * (APPT_VISIBLE - 1)) / APPT_VISIBLE); };
  useEffect(() => {
    if (cw <= 0 || didInit.current) return;
    didInit.current = true; const s = cw + APPT_GAP;
    requestAnimationFrame(() => scRef.current?.scrollTo({ x: clampLeft(selIndex - 3) * s, animated: false }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cw]);
  const settleAt = (x: number) => { const c = Math.max(0, Math.min(days.length - 1, Math.round(x / step) + 3)); onSelectDate(days[c]); };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => { const x = e.nativeEvent.contentOffset.x; lastX.current = x; if (!didInit.current) return; if (idle.current) clearTimeout(idle.current); idle.current = setTimeout(() => settleAt(x), 130); };
  const jumpWeek = (dir: number) => { const leftmost = Math.round(lastX.current / step); scRef.current?.scrollTo({ x: clampLeft(leftmost + dir * 7) * step, animated: true }); };
  const arw = { width: 22, borderRadius: 9, backgroundColor: color.canvas, alignItems: 'center' as const, justifyContent: 'center' as const, alignSelf: 'stretch' as const };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 4 }}>
      <Pressable onPress={() => jumpWeek(-1)} hitSlop={6} style={arw}><ChevronLeft size={15} color={color.muted} /></Pressable>
      <View style={{ flex: 1 }} onLayout={onLayout}>
        <ScrollView ref={scRef} horizontal showsHorizontalScrollIndicator={false} snapToInterval={step} decelerationRate="normal" scrollEventThrottle={16} onScroll={onScroll} contentContainerStyle={{ gap: APPT_GAP }}>
          {days.map((d, i) => {
            const k = apptDayKey(d); const isToday = k === todayKey; const isSel = k === selectedKey; const has = apptDays.has(k); const w = wxOf(d);
            const bg = isToday ? accent : isSel ? '#fff' : has ? fill : color.canvas;
            return (
              <Pressable key={i} onPress={() => { onSelectDate(d); scRef.current?.scrollTo({ x: clampLeft(i - 3) * step, animated: true }); }} style={{ width: cw, alignItems: 'center', paddingVertical: 6, borderRadius: 11, backgroundColor: bg, borderWidth: isSel && !isToday ? 1.5 : 0, borderColor: accent }}>
                <Text style={{ fontFamily: font.body700, fontSize: 8, color: isToday ? 'rgba(255,255,255,0.85)' : isSel ? accent : color.faint }}>{isToday ? 'TODAY' : WD_SHORT[d.getDay()].toUpperCase()}</Text>
                <Text style={{ fontFamily: font.display700, fontSize: 13, color: isToday ? '#fff' : isSel || has ? accent : color.ink, marginTop: 1 }}>{d.getDate()}</Text>
                {w ? <View style={{ marginTop: 3 }}><WeatherGlyph code={w.code} size={15} /></View> : null}
                {w ? <Text style={{ fontFamily: font.body700, fontSize: 8, color: isToday ? 'rgba(255,255,255,0.9)' : color.muted, marginTop: 1 }}>{w.tMax}°</Text> : null}
                <View style={{ width: has ? 12 : 0, height: 4, borderRadius: 2, marginTop: 3, backgroundColor: isToday ? '#fff' : has ? accent : 'transparent' }} />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <Pressable onPress={() => jumpWeek(1)} hitSlop={6} style={arw}><ChevronRight size={15} color={color.muted} /></Pressable>
    </View>
  );
}

/** One compact appointment month grid (fixed 6 rows). */
function ApptMonthGrid({ month, selectedKey, todayKey, apptDays, accent, onSelectDate }: {
  month: { y: number; m: number }; selectedKey: string; todayKey: string; apptDays: Set<string>; accent: string; onSelectDate: (d: Date) => void;
}) {
  const first = new Date(month.y, month.m, 1);
  const gridStart = new Date(month.y, month.m, 1 - ((first.getDay() + 6) % 7));
  const cells = Array.from({ length: 42 }, (_, i) => { const d = new Date(gridStart); d.setDate(gridStart.getDate() + i); return d; });
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: '#E7E1EF', borderRadius: 12, overflow: 'hidden' }}>
      {cells.map((d, i) => {
        const k = apptDayKey(d); const out = d.getMonth() !== month.m; const has = apptDays.has(k); const sel = k === selectedKey; const isToday = k === todayKey;
        const col = i % 7; const isWeekend = col >= 5; const lastRow = i >= 35;
        const cellBorder = { borderRightWidth: col === 6 ? 0 : 1, borderBottomWidth: lastRow ? 0 : 1, borderColor: '#EDE8F2' };
        const cellBg = isToday && !sel ? '#EDEBF9' : isWeekend ? '#F4F1FA' : 'transparent';
        return (
          <Pressable key={k} onPress={() => onSelectDate(d)} style={{ width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cellBg, ...cellBorder }}>
            <View style={{ width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? accent : 'transparent', borderWidth: isToday && !sel ? 1.5 : 0, borderColor: accent }}>
              <Text style={{ fontFamily: font.display700, fontSize: 12, color: sel ? '#fff' : isToday ? accent : out ? color.faint : color.inkSecondary }}>{d.getDate()}</Text>
            </View>
            <View style={{ width: has ? 10 : 0, height: 4, borderRadius: 2, marginTop: 3, backgroundColor: has && !sel ? accent : 'transparent' }} />
          </Pressable>
        );
      })}
    </View>
  );
}

/** Month view: a swipeable carousel of month grids — swipe anywhere to change. */
function ApptMonthCarousel({ months, curMonthIndex, monthJump, selectedKey, todayKey, apptDays, accent, onSelectDate, onSettleMonth }: {
  months: { y: number; m: number }[]; curMonthIndex: number; monthJump: { index: number; token: number };
  selectedKey: string; todayKey: string; apptDays: Set<string>; accent: string; onSelectDate: (d: Date) => void; onSettleMonth: (index: number) => void;
}) {
  const scRef = useRef<ScrollView>(null);
  const [pageW, setPageW] = useState(0);
  const lastX = useRef(0);
  const didInit = useRef(false);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clampIdx = (i: number) => Math.max(0, Math.min(months.length - 1, i));
  const onLayout = (e: NativeSyntheticEvent<{ layout: { width: number } }>) => { const w = e.nativeEvent.layout.width; if (w > 0 && w !== pageW) setPageW(w); };
  useEffect(() => {
    if (pageW <= 0 || didInit.current) return;
    didInit.current = true; lastX.current = clampIdx(curMonthIndex) * pageW;
    requestAnimationFrame(() => scRef.current?.scrollTo({ x: lastX.current, animated: false }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageW]);
  const settleAt = (x: number) => { if (!pageW) return; onSettleMonth(clampIdx(Math.round(x / pageW))); };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => { const x = e.nativeEvent.contentOffset.x; lastX.current = x; if (!didInit.current) return; if (idle.current) clearTimeout(idle.current); idle.current = setTimeout(() => settleAt(x), 130); };
  useEffect(() => {
    if (!didInit.current || !pageW) return;
    scRef.current?.scrollTo({ x: clampIdx(monthJump.index) * pageW, animated: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthJump.token]);
  return (
    <View onLayout={onLayout}>
      {pageW > 0 && (
        <ScrollView ref={scRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} decelerationRate="fast" scrollEventThrottle={16} onScroll={onScroll}>
          {months.map((mm) => (
            <View key={`${mm.y}-${mm.m}`} style={{ width: pageW }}>
              <ApptMonthGrid month={mm} selectedKey={selectedKey} todayKey={todayKey} apptDays={apptDays} accent={accent} onSelectDate={onSelectDate} />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function AppointmentsCard({ accent, fill, items, allowTests, standard, onAdd, onEdit, onDelete }: {
  accent: string; fill: string; items: ApptItem[]; allowTests?: boolean;
  standard?: DatedAntenatal[];
  onAdd: (i: { title: string; at: string; location?: string; kind?: 'appointment' | 'test'; result?: string }) => void;
  onEdit?: (id: string, patch: { title: string; at: string; location?: string; kind?: 'appointment' | 'test'; result?: string }) => void;
  onDelete: (id: string) => void;
}) {
  const { toast } = useFeedback();
  const wx = useWeather();
  const [expanded, setExpanded] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  // Standard-schedule loader (pregnancy only — `standard` provided).
  const normTitle = (s: string) => s.trim().toLowerCase();
  const haveTitles = new Set(items.map((i) => normTitle(i.title)));
  const startOfToday2 = new Date(); startOfToday2.setHours(0, 0, 0, 0);
  const stdList = (standard ?? []).map((s) => ({ ...s, have: haveTitles.has(normTitle(s.title)), past: new Date(`${s.iso}T00:00:00`).getTime() < startOfToday2.getTime() }));
  const [loadOpen, setLoadOpen] = useState(false);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const openLoad = () => { setSel(new Set(stdList.filter((s) => !s.have && !s.past).map((s) => s.title))); setLoadOpen(true); };
  const toggleSel = (t: string) => setSel((s) => { const n = new Set(s); if (n.has(t)) n.delete(t); else n.add(t); return n; });
  const selCount = stdList.filter((s) => sel.has(s.title) && !s.have).length;
  const doLoad = () => {
    let added = 0;
    stdList.forEach((s) => { if (!sel.has(s.title) || s.have) return; onAdd({ title: s.title, at: `${s.iso}T09:00:00`, kind: allowTests ? s.kind : undefined }); added++; });
    setLoadOpen(false);
    toast(added > 0 ? `Added ${added} appointment${added === 1 ? '' : 's'}` : 'Nothing new to add');
  };
  const [editId, setEditId] = useState<string | null>(null);
  const [kind, setKind] = useState<'appointment' | 'test'>('appointment');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState('09:00');
  const [location, setLocation] = useState('');
  const [result, setResult] = useState('');
  const [selKey, setSelKey] = useState<string | null>(null);
  const [month, setMonth] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  // Stable ranges for the swipeable day-wheel (week) + month carousel.
  const days = useMemo(() => {
    const base = new Date(); base.setHours(0, 0, 0, 0); base.setDate(base.getDate() - APPT_SPAN_DAYS);
    return Array.from({ length: APPT_SPAN_DAYS * 2 + 1 }, (_, i) => { const d = new Date(base); d.setDate(base.getDate() + i); return d; });
  }, []);
  const dayBase = days[0];
  const monthsList = useMemo(() => {
    const n = new Date();
    return Array.from({ length: APPT_MONTH_SPAN * 2 + 1 }, (_, i) => { const d = new Date(n.getFullYear(), n.getMonth() - APPT_MONTH_SPAN + i, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  }, []);
  const curMonthIndex = (month.y - monthsList[0].y) * 12 + (month.m - monthsList[0].m);
  const [monthJump, setMonthJump] = useState({ index: 0, token: 0 });
  const monthArrow = (dir: number) => setMonthJump((j) => ({ index: Math.max(0, Math.min(monthsList.length - 1, curMonthIndex + dir)), token: j.token + 1 }));
  const settleMonth = (idx: number) => { const mm = monthsList[idx]; if (mm) setMonth({ y: mm.y, m: mm.m }); };

  const now = Date.now();
  const sorted = [...items].sort((a, b) => a.at.localeCompare(b.at));
  const upcoming = sorted.filter((a) => new Date(a.at).getTime() >= now);
  const next = upcoming.find((a) => (a.kind ?? 'appointment') === 'appointment') ?? upcoming[0] ?? null;
  const nextThree = upcoming.slice(0, 3);
  const apptDays = new Set(items.map((a) => apptDayKey(new Date(a.at))));
  const todayKey = apptDayKey(new Date());
  const wxOf = (d: Date) => wx.wxForDate(d);

  const openMaps = (a: ApptItem) => {
    const url = a.mapsUrl || (a.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.location)}` : null);
    if (url) Linking.openURL(url);
  };
  const daysToGo = next ? Math.round((new Date(next.at).getTime() - now) / 86400000) : null;
  const countdown = daysToGo == null ? '' : daysToGo <= 0 ? 'today' : daysToGo === 1 ? 'tomorrow' : `in ${daysToGo} days`;
  const nextWx = next ? wxOf(new Date(next.at)) : null;

  const resetForm = () => { setTitle(''); setLocation(''); setResult(''); setKind('appointment'); setTime('09:00'); setDate(todayISO()); setAddOpen(false); setEditId(null); };
  const submit = () => {
    if (!title.trim()) return;
    const payload = { title, at: `${date}T${(time.trim() || '09:00')}:00`, location: location.trim() || undefined, kind: allowTests ? kind : undefined, result: allowTests && kind === 'test' ? result : undefined };
    if (editId && onEdit) onEdit(editId, payload); else onAdd(payload);
    toast(editId ? 'Appointment updated' : 'Appointment added');
    resetForm();
  };
  const startEdit = (a: ApptItem) => {
    const d = new Date(a.at);
    setEditId(a.id); setTitle(a.title); setDate(apptDayKey(d));
    setTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    setLocation(a.location ?? ''); setKind(a.kind ?? 'appointment'); setResult(a.result ?? ''); setAddOpen(true);
  };

  const selectedKey = selKey ?? (next ? apptDayKey(new Date(next.at)) : apptDayKey(new Date()));
  const selDayIndex = Math.round((new Date(`${selectedKey}T00:00:00`).getTime() - dayBase.getTime()) / 86400000);
  const pickDate = (d: Date) => { const k = apptDayKey(d); setSelKey(k); setDate(k); };
  const selAppts = items.filter((a) => apptDayKey(new Date(a.at)) === selectedKey).sort((a, b) => a.at.localeCompare(b.at));
  const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 15, gap: 12, borderWidth: 2, borderColor: accent }, shadow.card]}>
      {/* header + week/month toggle */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: fill, alignItems: 'center', justifyContent: 'center' }}><CalIcon size={18} color={accent} /></View>
        <Text style={{ flex: 1, fontFamily: font.display700, fontSize: 16, color: color.ink }}>Appointments</Text>
        <View style={{ flexDirection: 'row', backgroundColor: color.canvas, borderRadius: radius.pill, padding: 3 }}>
          {([['Week', false], ['Month', true]] as const).map(([l, e]) => {
            const on = expanded === e;
            return <Pressable key={l} onPress={() => setExpanded(e)} style={{ borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: 11, backgroundColor: on ? accent : 'transparent' }}><Text style={{ fontFamily: font.body700, fontSize: 10.5, color: on ? '#fff' : color.muted }}>{l}</Text></Pressable>;
          })}
        </View>
      </View>

      {!expanded ? (
        <ApptWeekWheel days={days} selIndex={selDayIndex} selectedKey={selectedKey} todayKey={todayKey} apptDays={apptDays} accent={accent} fill={fill} wxOf={wxOf} onSelectDate={pickDate} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
            <Pressable hitSlop={10} onPress={() => monthArrow(-1)}><ChevronLeft size={16} color={color.muted} /></Pressable>
            <Text style={{ fontFamily: font.display700, fontSize: 14, color: color.ink }}>{MONTH_NAMES[month.m]} {month.y}</Text>
            <Pressable hitSlop={10} onPress={() => monthArrow(1)}><ChevronRight size={16} color={color.muted} /></Pressable>
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 2 }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((l, i) => <Text key={i} style={{ flex: 1, textAlign: 'center', fontFamily: font.body700, fontSize: 9, color: color.faint }}>{l}</Text>)}
          </View>
          <ApptMonthCarousel months={monthsList} curMonthIndex={curMonthIndex} monthJump={monthJump} selectedKey={selectedKey} todayKey={todayKey} apptDays={apptDays} accent={accent} onSelectDate={pickDate} onSettleMonth={settleMonth} />
        </>
      )}

      {/* next appointments — the soonest 3 */}
      {nextThree.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 10, letterSpacing: 0.6, color: color.muted, paddingHorizontal: 2 }}>NEXT · {countdown}</Text>
          {nextThree.map((a, i) => {
            const d = Math.round((new Date(a.at).getTime() - now) / 86400000);
            const when = d <= 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`;
            const w = i === 0 ? nextWx : null;
            return (
              <View key={a.id} style={{ backgroundColor: fill, borderRadius: radius.tile, padding: 12, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ flex: 1, fontFamily: font.display700, fontSize: i === 0 ? 16 : 14, color: accent }} numberOfLines={1}>{a.title}</Text>
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: radius.pill, paddingVertical: 2, paddingHorizontal: 8 }}><Text style={{ fontFamily: font.body700, fontSize: 9.5, color: accent }}>{when}</Text></View>
                </View>
                <Text style={{ fontFamily: font.body500, fontSize: 11, color: color.inkSecondary }}>{apptDateLabel(a.at)}{a.kind === 'test' ? ' · scan' : ''}</Text>
                {w ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <WeatherGlyph code={w.code} size={14} />
                    <Text style={{ fontFamily: font.body500, fontSize: 10.5, color: color.inkSecondary }}>{wxLabel(w.code)}, {w.tMax}° that day</Text>
                  </View>
                ) : null}
                {a.location ? (
                  <Pressable onPress={() => openMaps(a)} accessibilityLabel="Open location in Maps" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: 10, padding: 8, marginTop: 4 }}>
                    <Text style={{ fontSize: 14 }}>📍</Text>
                    <View style={{ flex: 1, minWidth: 0 }}><Text style={{ fontFamily: font.body700, fontSize: 11, color: accent }} numberOfLines={1}>{a.location}</Text></View>
                    <Text style={{ fontFamily: font.body700, fontSize: 10, color: accent }}>Maps ›</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      {/* expanded: the selected day's appointments (with delete) */}
      {expanded && (
        <View style={{ gap: 7 }}>
          <PanelLabel>{new Date(`${selectedKey}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</PanelLabel>
          {selAppts.length === 0 ? <EmptyHint text="Nothing on this day." /> : selAppts.map((a) => (
            <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: color.canvas, borderRadius: radius.tile, paddingVertical: 9, paddingHorizontal: 11 }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 12.5, color: color.ink }}>{a.title}{a.kind === 'test' ? ' · test' : ''}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 10.5, color: color.muted }}>{timeLabel(a.at)}{a.location ? ` · ${a.location}` : ''}{a.result ? ` · ${a.result}` : ''}</Text>
              </View>
              {a.location ? <Pressable onPress={() => openMaps(a)} hitSlop={6}><Text style={{ fontSize: 14 }}>📍</Text></Pressable> : null}
              {onEdit ? <Pressable onPress={() => startEdit(a)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 12, color: accent }}>Edit</Text></Pressable> : null}
              <Pressable onPress={() => onDelete(a.id)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 17, color: color.faint }}>×</Text></Pressable>
            </View>
          ))}
        </View>
      )}

      {/* add / edit */}
      {addOpen ? (
        <View style={{ gap: 9, borderTopWidth: 1, borderTopColor: color.hairline, paddingTop: 12 }}>
          {editId ? <PanelLabel>Edit appointment</PanelLabel> : null}
          {allowTests && <SelectChips options={['appointment', 'test']} value={kind} onChange={(v) => setKind(v as 'appointment' | 'test')} />}
          <Field label="Title" value={title} onChangeText={setTitle} placeholder={allowTests && kind === 'test' ? 'e.g. GTT blood test' : 'e.g. 20-week scan'} autoCapitalize="sentences" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1.5 }}><DateField label="Date" value={date} onChangeText={setDate} /></View>
            <View style={{ flex: 1 }}><Field label="Time" value={time} onChangeText={setTime} placeholder="09:00" /></View>
          </View>
          <LocationField label="Location (optional)" value={location} onChange={setLocation} defaultCenter={wx.location ? { lat: wx.location.lat, lon: wx.location.lon } : undefined} />
          {location.trim() ? <Text style={{ fontFamily: font.body400, fontSize: 10.5, color: color.muted, marginTop: -3 }}>📍 Tap the location later to open it in Maps.</Text> : null}
          {allowTests && kind === 'test' && <Field label="Result (optional)" value={result} onChangeText={setResult} placeholder="e.g. Normal" autoCapitalize="sentences" />}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button label="Cancel" variant="secondary" onPress={resetForm} style={{ flex: 1 }} />
            <Button label={editId ? 'Save' : 'Add'} onPress={submit} style={{ flex: 1 }} tint={accent} />
          </View>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {stdList.length > 0 && (
            <Pressable onPress={openLoad} style={{ borderWidth: 1.4, borderColor: accent, borderRadius: radius.tile, paddingVertical: 11, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 7 }}>
              <Text style={{ fontFamily: font.body700, fontSize: 12.5, color: accent }}>↻ Load standard appointments</Text>
            </Pressable>
          )}
          <Pressable onPress={() => setAddOpen(true)} style={{ borderWidth: 1.4, borderColor: fill, borderStyle: 'dashed', borderRadius: radius.tile, paddingVertical: 11, alignItems: 'center' }}>
            <Text style={{ fontFamily: font.body700, fontSize: 12.5, color: accent }}>＋ Add appointment</Text>
          </Pressable>
        </View>
      )}

      {/* Standard antenatal schedule picker */}
      <Modal visible={loadOpen} transparent animationType="fade" onRequestClose={() => setLoadOpen(false)}>
        <Pressable onPress={() => setLoadOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: '#fff', borderRadius: 22, padding: 18, maxHeight: '84%' }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 17, color: color.ink }}>Standard antenatal schedule</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, marginTop: 3, marginBottom: 8 }}>Dates are estimated from your due date — tap any appointment afterwards to set its exact date, time & location. Anything already booked is skipped.</Text>

            {(() => {
              const pickable = stdList.filter((a) => !a.have);
              const allOn = pickable.length > 0 && pickable.every((a) => sel.has(a.title));
              return (
                <Pressable onPress={() => setSel(allOn ? new Set() : new Set(pickable.map((a) => a.title)))} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: color.hairline }}>
                  <View style={{ width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: allOn ? accent : '#CFC9E4', backgroundColor: allOn ? accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    {allOn ? <Text style={{ color: '#fff', fontSize: 12, fontFamily: font.body700 }}>✓</Text> : null}
                  </View>
                  <Text style={{ fontFamily: font.body700, fontSize: 13, color: accent }}>{allOn ? 'Clear all' : 'Select all'}</Text>
                </Pressable>
              );
            })()}

            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {stdList.map((a) => {
                const on = sel.has(a.title);
                return (
                  <Pressable key={a.title} disabled={a.have} onPress={() => toggleSel(a.title)} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 11, opacity: a.have ? 0.45 : 1 }}>
                    <View style={{ width: 22, height: 22, borderRadius: 7, borderWidth: 2, marginTop: 1, borderColor: on && !a.have ? accent : '#CFC9E4', backgroundColor: on && !a.have ? accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                      {on && !a.have ? <Text style={{ color: '#fff', fontSize: 12, fontFamily: font.body700 }}>✓</Text> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ flex: 1, fontFamily: font.body700, fontSize: 13.5, color: color.ink }} numberOfLines={1}>{a.title}</Text>
                        {a.kind === 'test' && <Text style={{ fontFamily: font.body700, fontSize: 9, color: accent, backgroundColor: fill, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>SCAN</Text>}
                      </View>
                      <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.muted, marginTop: 1 }}>{a.detail}</Text>
                      <Text style={{ fontFamily: font.body500, fontSize: 11, color: a.have ? color.muted : a.past ? color.faint : accent, marginTop: 2 }}>
                        Week {a.week} · {apptDateLabel(`${a.iso}T09:00:00`)}{a.have ? ' · already booked' : a.past ? ' · past' : ''}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setLoadOpen(false)} style={{ flex: 1 }} />
              <Button label={selCount > 0 ? `Add ${selCount}` : 'Add'} disabled={selCount === 0} onPress={doLoad} style={{ flex: 1 }} tint={accent} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/** Mum&Me variant — pregnancy appointments (with tests), rose theme. */
function PregnancyAppointments() {
  const { pregAppts, addPregAppt, updatePregAppt, deletePregAppt, lastPeriod, dueDate } = useData();
  const lmp = lmpFrom(lastPeriod, dueDate);
  return <AppointmentsCard accent={color.roseInk} fill="#FBE0EA" items={pregAppts} allowTests
    standard={lmp ? datedAntenatal(lmp) : undefined}
    onAdd={(i) => addPregAppt({ title: i.title, at: i.at, kind: i.kind ?? 'appointment', result: i.result, location: i.location })}
    onEdit={(id, p) => updatePregAppt(id, { title: p.title, at: p.at, kind: p.kind ?? 'appointment', result: p.result, location: p.location })}
    onDelete={deletePregAppt} />;
}

/** Child variant — the child's calendar events, themed to the child's colour. */
function ChildAppointments({ childId, colorKey }: { childId: string; colorKey: ChildColor }) {
  const { events, addEvent, updateEvent, deleteEvent } = useData();
  const items: ApptItem[] = events.filter((e) => e.childId === childId).map((e) => ({ id: e.id, title: e.title, at: e.at, location: e.location }));
  return <AppointmentsCard accent={CHILD_INK[colorKey] ?? color.primary} fill={childToken[colorKey].fill} items={items}
    onAdd={(i) => addEvent({ title: i.title, at: i.at, childId, location: i.location })}
    onEdit={(id, p) => updateEvent(id, { title: p.title, at: p.at, location: p.location })}
    onDelete={deleteEvent} />;
}

const labFmt = (ms: number) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const labDurSec = (secs: number) => { const m = Math.floor(secs / 60); return m > 0 ? `${m}m ${secs % 60}s` : `${secs}s`; };
const KICK_TARGET = 10;

/** Labour & movement — kick counter + contraction timer, matching kick-counter. */
function LabourPanel() {
  const { kickSessions, addKickSession, deleteKickSession, contractionSessions, addContraction, deleteContraction, kickDraft, setKickDraft, contractionStart, setContractionStart } = useData();
  const { toast } = useFeedback();
  const [mode, setMode] = useState<'kicks' | 'contractions'>('kicks');
  const [showKickHist, setShowKickHist] = useState(false);
  const [showConHist, setShowConHist] = useState(false);
  // Live count + timer start come from the store, so they survive navigation
  // and app restarts (only the ticking "now" clock is local, view-only).
  const kicks = kickDraft.count;
  const startedAt = kickDraft.startedAt;
  const [kickNow, setKickNow] = useState(Date.now());
  const kickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  React.useEffect(() => {
    if (startedAt && kicks < KICK_TARGET) {
      kickTimer.current = setInterval(() => setKickNow(Date.now()), 1000);
      return () => { if (kickTimer.current) clearInterval(kickTimer.current); };
    }
  }, [startedAt, kicks]);
  const recordKick = () => { if (kicks >= KICK_TARGET) return; const started = startedAt ?? Date.now(); if (!startedAt) setKickNow(Date.now()); setKickDraft({ count: kicks + 1, startedAt: started }); };
  const resetKicks = () => { const saved = kicks > 0 && startedAt; if (saved) addKickSession({ count: kicks, durationMin: Math.max(1, Math.round((kickNow - startedAt) / 60000)) }); setKickDraft({ count: 0, startedAt: null }); setKickNow(Date.now()); if (saved) toast('Session saved'); };
  const elapsed = startedAt ? Math.max(0, kickNow - startedAt) : 0;
  const done = kicks >= KICK_TARGET;

  const activeStart = contractionStart;
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
      addContraction({ durationSec, intervalSec }); setContractionStart(null); toast('Contraction logged');
    } else { setContractionStart(Date.now()); setConNow(Date.now()); }
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
          {kickSessions.length > 0 ? (
            <View style={{ gap: 8 }}>
              {/* Reset + Recent share one split bar to save vertical space */}
              <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: color.hairline, borderRadius: radius.tile, overflow: 'hidden' }}>
                <Pressable onPress={resetKicks} style={({ pressed }) => [{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 13, opacity: pressed ? 0.7 : 1 }]}>
                  <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>{kicks > 0 ? 'Save & reset' : 'Reset'}</Text>
                </Pressable>
                <View style={{ width: 1.5, alignSelf: 'stretch', backgroundColor: color.hairline }} />
                <Pressable onPress={() => setShowKickHist((v) => !v)} style={({ pressed }) => [{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 13, opacity: pressed ? 0.7 : 1 }]}>
                  <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.muted }}>Recent</Text>
                  <View style={{ backgroundColor: color.canvas, borderRadius: radius.pill, paddingVertical: 2, paddingHorizontal: 7 }}>
                    <Text style={{ fontFamily: font.body700, fontSize: 10.5, color: color.primary }}>{kickSessions.length}</Text>
                  </View>
                  <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.faint }}>{showKickHist ? '▾' : '▸'}</Text>
                </Pressable>
              </View>
              {showKickHist && kickSessions.slice(0, 4).map((s) => <PanelRow key={s.id} title={`${s.count} ${s.count === 1 ? 'movement' : 'movements'}${s.durationMin != null ? ` · ${s.durationMin}m` : ''}`} sub={dayTimeOf(s.at)} onDelete={() => deleteKickSession(s.id)} />)}
            </View>
          ) : (
            <Button label={kicks > 0 ? 'Save & reset' : 'Reset'} variant="secondary" onPress={resetKicks} />
          )}
        </>
      ) : (
        <>
          <View style={{ backgroundColor: color.canvas, borderRadius: radius.tile, padding: 16, alignItems: 'center', gap: 2 }}>
            <Text style={{ fontFamily: font.display700, fontSize: 36, color: activeStart ? color.rose : color.muted }}>{activeStart ? labDurSec(Math.round((conNow - activeStart) / 1000)) : '—'}</Text>
            <Text style={{ fontFamily: font.body600, fontSize: 12, color: color.muted }}>{activeStart ? 'in progress' : 'tap start when one begins'}</Text>
          </View>
          <Button label={activeStart ? 'Stop' : 'Start'} onPress={toggleCon} tint={color.rose} />
          {contractionSessions.length > 0 && (
            <View style={{ gap: 8 }}>
              <Pressable onPress={() => setShowConHist((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ flex: 1 }}><PanelLabel>{contractionSessions.length} recorded</PanelLabel></View>
                <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.faint }}>{showConHist ? '▾' : '▸'}</Text>
              </Pressable>
              {showConHist && contractionSessions.slice(0, 4).map((c) => <PanelRow key={c.id} title={labDurSec(c.durationSec)} sub={c.intervalSec != null ? `${labDurSec(c.intervalSec)} apart` : 'first'} onDelete={() => deleteContraction(c.id)} />)}
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

/** Emoji faces for the mood scale (indices line up with MOODS labels). */
const CARE_MOODS = ['😞', '😕', '🙂', '😀', '🤩'];
const careIsToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();
/** Pull a single dialable number out of a helpline detail string, if there is one. */
const dialable = (s: string) => (s.match(/\d[\d\s-]{4,}\d/) || [])[0]?.replace(/[\s-]/g, '');

/* ── Care & check-in — one card that folds the daily check-in and the care/
   support hub together: mood + weight/water/sleep (with trend charts) + meals,
   then what-to-expect this week, red-flag warnings, your circle and city-linked
   helplines. Replaces the old Daily-check-in and Care-&-support tiles. */

const MEAL_OPTS: { key: string; emoji: string; label: string }[] = [
  { key: 'breakfast', emoji: '🍳', label: 'B’fast' }, { key: 'lunch', emoji: '🥗', label: 'Lunch' },
  { key: 'dinner', emoji: '🍝', label: 'Dinner' }, { key: 'snacks', emoji: '🍎', label: 'Snacks' },
];
const ccMs = (iso: string) => new Date(iso).getTime();
const ccSameDay = (iso: string, d: Date) => { const a = new Date(iso); return a.getFullYear() === d.getFullYear() && a.getMonth() === d.getMonth() && a.getDate() === d.getDate(); };

/** Small −/+ stepper. */
function Stepper({ onDec, onInc, accent }: { onDec: () => void; onInc: () => void; accent: string }) {
  const btn = { width: 27, height: 27, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center' as const, justifyContent: 'center' as const };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Pressable onPress={onDec} hitSlop={6} style={[btn, shadow.row]}><Text style={{ fontFamily: font.body700, fontSize: 17, color: accent, lineHeight: 19 }}>−</Text></Pressable>
      <Pressable onPress={onInc} hitSlop={6} style={[btn, shadow.row]}><Text style={{ fontFamily: font.body700, fontSize: 16, color: accent, lineHeight: 19 }}>＋</Text></Pressable>
    </View>
  );
}

/** A block that gently pulses a red glow to draw the eye (the "when to call"). */
/** Compact city search to localise the helplines (reuses the weather location). */
function CityPickerModal({ visible, wx, onClose }: { visible: boolean; wx: ReturnType<typeof useWeather>; onClose: () => void }) {
  const { toast } = useFeedback();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<WxLocation[]>([]);
  const [busy, setBusy] = useState(false);
  const run = async () => { if (!q.trim()) return; setBusy(true); try { setResults(await searchCity(q)); } catch { /* ignore */ } finally { setBusy(false); } };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
        <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 12, maxHeight: '70%' }, shadow.card]}>
          <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Your city</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted }}>We use it to show local support numbers. Only the city is sent — never personal data.</Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}><Field label="Search city" value={q} onChangeText={setQ} placeholder="e.g. Vienna" autoCapitalize="words" /></View>
            <Pressable onPress={run} style={{ backgroundColor: color.rose, borderRadius: radius.tile, paddingHorizontal: 16, height: 46, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: font.body700, color: '#fff' }}>Go</Text></Pressable>
          </View>
          {busy ? <ActivityIndicator color={color.rose} /> : null}
          <ScrollView style={{ maxHeight: 220 }} keyboardShouldPersistTaps="handled"><View style={{ gap: 8 }}>
            {results.map((r, i) => (
              <Pressable key={`${r.lat},${r.lon},${i}`} onPress={() => { wx.setLocation(r); onClose(); toast(`City set to ${r.name}`); }} style={[{ backgroundColor: '#fff', borderRadius: radius.tile, padding: 12 }, shadow.card]}>
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{r.name}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>{[r.admin, r.country].filter(Boolean).join(' · ')}</Text>
              </Pressable>
            ))}
          </View></ScrollView>
          <Button label="Done" variant="secondary" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function CareCheckinCard() {
  const { checkins, upsertTodayCheckin, dueDate, startWeightKg, setStartWeightKg, heightCm, setHeightCm } = useData();
  const { toast } = useFeedback();
  const u = useUnits();
  // display helpers: canonical (kg/cm/L) → chosen-unit string, trailing zeros trimmed
  const wStr = (kg: number, dp = 1) => String(Math.round(u.weightFromKg(kg) * 10 ** dp) / 10 ** dp);
  const lStr = (cm: number, dp = 0) => String(Math.round(u.lengthFromCm(cm) * 10 ** dp) / 10 ** dp);
  const watStr = (l: number, dp = 1) => String(Math.round(u.waterFromL(l) * 10 ** dp) / 10 ** dp);
  const now = new Date();
  const gest = gestFromDueDate(dueDate ?? undefined);
  const week = gest?.week ?? null;

  const todayCheckin = checkins.find((c) => ccSameDay(c.at, now)) ?? null;
  const [weight, setWeight] = useState<number | null>(todayCheckin?.weightKg ?? null);
  const [water, setWater] = useState<number>(todayCheckin?.waterL ?? 0);
  const [sleep, setSleep] = useState<number | null>(todayCheckin?.sleepH ?? null);
  const [editField, setEditField] = useState<null | 'start' | 'height'>(null);
  const [fieldVal, setFieldVal] = useState('');

  // last recorded weight (for a sensible starting point when logging today)
  const lastWeight = checkins.filter((c) => c.weightKg != null).sort((a, b) => ccMs(b.at) - ccMs(a.at))[0]?.weightKg ?? 65;
  const wVal = weight ?? Math.round(lastWeight * 10) / 10;
  const sVal = sleep ?? 7;
  const openEdit = (f: 'start' | 'height') => {
    setEditField(f);
    const canon = f === 'start' ? startWeightKg : heightCm;
    const disp = canon == null ? null : f === 'start' ? u.weightFromKg(canon) : u.lengthFromCm(canon);
    setFieldVal(disp == null ? '' : String(Math.round(disp * 10) / 10));
  };
  const commitEdit = () => {
    const n = parseFloat(fieldVal.replace(',', '.'));
    const disp = isNaN(n) || n <= 0 ? null : n;
    const canon = disp == null ? null : editField === 'start' ? u.weightToKg(disp) : u.lengthToCm(disp);
    if (editField === 'start') setStartWeightKg(canon); else if (editField === 'height') setHeightCm(canon);
    setEditField(null); toast('Saved');
  };
  // Each chart saves its own metric into today's check-in.
  const saveWeight = () => { upsertTodayCheckin({ weightKg: wVal }); toast('Weight saved'); };
  const saveWater = () => { upsertTodayCheckin({ waterL: water || undefined }); toast('Water saved'); };
  const saveSleep = () => { upsertTodayCheckin({ sleepH: sVal }); toast('Sleep saved'); };

  /* ── weight: cumulative gain vs a BMI-based recommended corridor ── */
  const wSeries = checkins.filter((c) => c.weightKg != null).sort((a, b) => ccMs(a.at) - ccMs(b.at))
    .map((c) => ({ kg: c.weightKg as number, wk: gestFromDueDate(dueDate ?? undefined, new Date(c.at))?.week ?? 0 }));
  const firstLoggedKg = wSeries[0]?.kg ?? null;
  const startKg = startWeightKg ?? firstLoggedKg;                 // pre-pregnancy / booking baseline
  const bmi = startKg != null && heightCm != null ? bmiFrom(startKg, heightCm) : null;
  const goal = gainGoal(bmi);
  const goalMid = (goal.lo + goal.hi) / 2;
  const gainPts = startKg == null ? [] : wSeries.map((p) => ({ wk: p.wk, gain: p.kg - startKg, kg: p.kg }));
  const lastKg = wSeries[wSeries.length - 1]?.kg ?? null;
  const lastGain = gainPts.length ? gainPts[gainPts.length - 1].gain : null;
  const curWeek = week ?? (gainPts[gainPts.length - 1]?.wk ?? 0);
  const recNow = recommendedGain(curWeek, goal);
  const wStatus = lastGain == null ? '' : lastGain > recNow.hi + 0.4 ? 'Above range' : lastGain < recNow.lo - 0.4 ? 'Below range' : 'On track';
  const pace = gainPts.length >= 2 ? (gainPts[gainPts.length - 1].gain - gainPts[0].gain) / ((gainPts[gainPts.length - 1].wk - gainPts[0].wk) || 1) : null;
  const paceOk = pace == null ? true : pace >= 0.2 && pace <= 0.7;
  const projected = lastGain == null ? null : pace != null ? lastGain + pace * Math.max(0, 40 - curWeek) : lastGain;
  // chart geometry — plot gain (kg above start) across weeks
  const WW = 300, WH = 150, wpad = 14, xL = 22, plotBot = 120;
  const axMinWk = Math.max(0, Math.floor(Math.min(curWeek, gainPts[0]?.wk ?? curWeek)));
  const axMaxWk = 40;
  const corWks = Array.from({ length: 9 }, (_, i) => axMinWk + (i / 8) * (axMaxWk - axMinWk));
  const corridor = corWks.map((wk) => ({ wk, ...recommendedGain(wk, goal) }));
  const weekTicks = (() => { const t: number[] = []; for (let w = Math.ceil(axMinWk / 2) * 2; w <= 40; w += 2) t.push(w); return t; })();
  const gAll = [0, ...gainPts.map((p) => p.gain), ...(projected != null ? [projected] : []), ...corridor.flatMap((c) => [c.lo, c.hi])];
  const gMin = Math.min(...gAll) - 0.8, gMax = Math.max(...gAll) + 0.8;
  const gx = (wk: number) => xL + ((wk - axMinWk) / ((axMaxWk - axMinWk) || 1)) * (WW - xL - 8);
  const gy = (v: number) => wpad + (1 - (v - gMin) / ((gMax - gMin) || 1)) * (plotBot - wpad);
  const wStatusOk = wStatus === 'On track';
  // Carry-forward: if the current week has no fresh weigh-in, extend the line
  // flat from the last recorded value to today so there's no empty gap.
  const lastWk = gainPts.length ? gainPts[gainPts.length - 1].wk : null;
  const linePts = gainPts.length && lastGain != null && curWeek > (lastWk ?? 0)
    ? [...gainPts, { wk: curWeek, gain: lastGain, kg: lastKg ?? 0 }]
    : gainPts;
  // Whether there's a logged-weight trend to overlay. The corridor chart itself
  // shows whenever a due date is set, so the chart is never "missing".
  const hasWeightData = gainPts.length >= 1 && lastGain != null && startKg != null;

  /* ── water & sleep (last 7 days from check-ins) ── */
  const days7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - i)); return d; });
  const waterFor = (d: Date) => checkins.find((c) => ccSameDay(c.at, d) && c.waterL != null)?.waterL ?? 0;
  const sleepFor = (d: Date) => checkins.find((c) => ccSameDay(c.at, d) && c.sleepH != null)?.sleepH ?? 0;
  // Today's bar tracks the live (unsaved) value being edited above, so the chart
  // updates as you tap +/- — not only after Save.
  const waterVals = days7.map(waterFor); waterVals[6] = water;
  const sleepVals = days7.map(sleepFor); if (sleep != null) sleepVals[6] = sleep;
  const wMax = Math.max(2, ...waterVals);
  const sMax = Math.max(9, ...sleepVals);
  const dayLabels = days7.map((d) => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()]);
  const dayAxis = (
    <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
      {dayLabels.map((d, i) => <Text key={i} style={{ flex: 1, textAlign: 'center', fontFamily: i === 6 ? font.body700 : font.body500, fontSize: 8.5, color: i === 6 ? color.roseInk : '#a9a0b0' }}>{i === 6 ? 'Today' : d}</Text>)}
    </View>
  );


  const rose = color.rose, roseInk = color.roseInk;
  const label = (t: string, right?: React.ReactNode) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 8, paddingHorizontal: 2 }}>
      <Text style={{ fontFamily: font.body700, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: '#B7889F' }}>{t}</Text>
      {right ? <View style={{ marginLeft: 'auto' }}>{right}</View> : null}
    </View>
  );
  const blockStyle = { backgroundColor: '#FAF3F6', borderRadius: radius.tile, padding: 12 } as const;
  const metricRow = (emoji: string, name: string, val: string, unit: string, status: string, statusOk: boolean, onDec: () => void, onInc: () => void) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 9 }}>
      <Text style={{ fontSize: 16 }}>{emoji}</Text>
      <Text numberOfLines={1} style={{ flex: 1, minWidth: 0, fontFamily: font.body700, fontSize: 12, color: '#7d7a90' }}>{name}</Text>
      <Text style={{ fontFamily: font.display700, fontSize: 17, color: color.ink }}>{val}<Text style={{ fontFamily: font.body500, fontSize: 10, color: color.muted }}>{unit}</Text></Text>
      {status ? <View style={{ backgroundColor: statusOk ? '#E4F3EC' : '#FBE7D8', borderRadius: radius.pill, paddingVertical: 2, paddingHorizontal: 7 }}><Text style={{ fontFamily: font.body700, fontSize: 9, color: statusOk ? '#1E6C50' : '#B5662E' }}>{status}</Text></View> : null}
      <Stepper accent={roseInk} onDec={onDec} onInc={onInc} />
    </View>
  );
  // A small right-aligned Save button, sat under each chart.
  const saveBtn = (onPress: () => void) => (
    <Pressable onPress={onPress} style={({ pressed }) => [{ alignSelf: 'flex-end', backgroundColor: rose, borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 18, marginTop: 9, opacity: pressed ? 0.85 : 1 }]}>
      <Text style={{ fontFamily: font.body700, fontSize: 12, color: '#fff' }}>Save</Text>
    </Pressable>
  );

  return (
    <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, borderWidth: 2, borderColor: color.rose }, shadow.card]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 6 }}>
        <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: '#FBE0EA', alignItems: 'center', justifyContent: 'center' }}><Heart size={18} color={rose} filled /></View>
        <Text style={{ flex: 1, fontFamily: font.display700, fontSize: 16, color: color.ink }}>Care &amp; check-in</Text>
      </View>


      {/* Weight */}
      {label('Weight')}

      {/* Starting point — its own card, above the chart (anchors the chart & BMI) */}
      <View style={[blockStyle, { marginBottom: 10 }]}>
        <Text style={{ fontFamily: font.body700, fontSize: 9.5, letterSpacing: 0.5, textTransform: 'uppercase', color: '#B7889F', marginBottom: 8 }}>Starting point</Text>
        {editField ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TextInput value={fieldVal} onChangeText={setFieldVal} keyboardType="decimal-pad" autoFocus placeholder={editField === 'start' ? u.weightUnit : u.lengthUnit} placeholderTextColor={color.faint}
              style={{ flex: 1, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E0C2D2', borderRadius: 11, paddingVertical: 8, paddingHorizontal: 11, fontFamily: font.body700, fontSize: 15, color: color.ink }} />
            <Pressable onPress={commitEdit} style={{ backgroundColor: rose, borderRadius: 11, paddingVertical: 9, paddingHorizontal: 14 }}><Text style={{ fontFamily: font.body700, fontSize: 12, color: '#fff' }}>Save</Text></Pressable>
            <Pressable onPress={() => setEditField(null)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 12, color: color.muted }}>Cancel</Text></Pressable>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {/* left: the two edit tiles, stacked */}
            <View style={{ flex: 1.3, gap: 8 }}>
              {([['start', 'Start weight', startWeightKg, u.weightUnit], ['height', 'Height', heightCm, u.lengthUnit]] as const).map(([f, k, val, unit]) => (
                <Pressable key={f} onPress={() => openEdit(f)} style={{ backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#EBD9E3', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontFamily: font.body700, fontSize: 8.5, letterSpacing: 0.3, textTransform: 'uppercase', color: '#B7889F' }}>{k}</Text>
                    <Text style={{ fontFamily: font.display700, fontSize: 15, color: val != null ? color.ink : color.faint, marginTop: 2 }}>{val != null ? (f === 'start' ? wStr(val) : lStr(val)) : '—'}<Text style={{ fontFamily: font.body500, fontSize: 10, color: color.muted }}> {unit}</Text></Text>
                  </View>
                  <Text style={{ fontFamily: font.body700, fontSize: 11, color: roseInk }}>{val != null ? 'Edit' : 'Add'}</Text>
                </Pressable>
              ))}
            </View>
            {/* right: BMI spotlight (or a prompt to add height) */}
            {bmi != null ? (
              <View style={{ flex: 1, backgroundColor: '#EEF6F1', borderWidth: 1, borderColor: '#CFE7D8', borderRadius: 12, padding: 11, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: font.body700, fontSize: 8.5, letterSpacing: 0.3, textTransform: 'uppercase', color: '#3a6a52' }}>Pre-preg BMI</Text>
                <Text style={{ fontFamily: font.display700, fontSize: 25, color: '#3a6a52', lineHeight: 29 }}>{bmi.toFixed(1)}</Text>
                <Text style={{ fontFamily: font.body700, fontSize: 9.5, color: '#1E6C50', marginTop: 1 }}>{goal.category}</Text>
                <Text style={{ fontFamily: font.body500, fontSize: 9, color: '#3a6a52', marginTop: 2, textAlign: 'center' }}>goal {wStr(goal.lo)}–{wStr(goal.hi)} {u.weightUnit}</Text>
              </View>
            ) : (
              <View style={{ flex: 1, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#EBD9E3', borderRadius: 12, padding: 11, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: font.body400, fontSize: 10, color: color.muted, textAlign: 'center', lineHeight: 14 }}>Add height for a personalised BMI range — using {wStr(11.5)}–{wStr(16)} {u.weightUnit} for now.</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Chart card */}
      <View style={blockStyle}>
        {/* Title row — current weight (log today via steppers) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          <Text style={{ fontSize: 18 }}>⚖️</Text>
          <Text style={{ fontFamily: font.display700, fontSize: 25, color: color.ink, lineHeight: 27 }}>{wStr(wVal)}<Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}> {u.weightUnit}</Text></Text>
          {wStatus ? <View style={{ backgroundColor: wStatusOk ? '#E4F3EC' : '#FBE7D8', borderRadius: radius.pill, paddingVertical: 3, paddingHorizontal: 9 }}><Text style={{ fontFamily: font.body700, fontSize: 10, color: wStatusOk ? '#1E6C50' : '#B5662E' }}>{wStatus}</Text></View> : null}
          <View style={{ marginLeft: 'auto' }}><Stepper accent={roseInk} onDec={() => setWeight(Math.round((wVal - u.weightStepKg) * 100) / 100)} onInc={() => setWeight(Math.round((wVal + u.weightStepKg) * 100) / 100)} /></View>
        </View>

        {week != null ? (
          <>
            <Text style={{ fontFamily: font.body400, fontSize: 10.5, color: color.muted, marginTop: 6, marginBottom: 4, paddingHorizontal: 2 }}>
              {hasWeightData
                ? <>since {wStr(startKg!)} {u.weightUnit} start · <Text style={{ fontFamily: font.body700, color: roseInk }}>{lastGain! >= 0 ? '+' : ''}{wStr(lastGain!)} {u.weightUnit} gained</Text> · goal {wStr(goal.lo)}–{wStr(goal.hi)} {u.weightUnit} by birth</>
                : <>Log today’s weight to track your gain · goal {wStr(goal.lo)}–{wStr(goal.hi)} {u.weightUnit} by birth</>}
            </Text>

            {/* cumulative-gain corridor chart — always shown when pregnant */}
            <Svg width="100%" height={128} viewBox={`0 0 ${WW} ${WH}`}>
              {weekTicks.map((w, i) => <SvgLine key={`g${i}`} x1={gx(w)} y1={16} x2={gx(w)} y2={plotBot} stroke="#EBDCE4" strokeWidth={1} />)}
              <SvgLine x1={xL} y1={gy(0)} x2={WW - 8} y2={gy(0)} stroke="#D8C6D1" strokeWidth={1} strokeDasharray="3 3" />
              <SvgText x={xL - 3} y={gy(0) + 3} fontSize={7.5} fill="#b6acb4" textAnchor="end">0</SvgText>
              <Polygon points={[...corridor.map((c) => `${gx(c.wk)},${gy(c.hi)}`), ...corridor.map((c) => `${gx(c.wk)},${gy(c.lo)}`).reverse()].join(' ')} fill="#DCEFE3" />
              <SvgLine x1={gx(curWeek)} y1={16} x2={gx(curWeek)} y2={plotBot} stroke={rose} strokeWidth={1.4} strokeDasharray="3 3" opacity={0.55} />
              {hasWeightData && projected != null && <SvgLine x1={gx(curWeek)} y1={gy(lastGain!)} x2={gx(40)} y2={gy(projected)} stroke={rose} strokeWidth={2} strokeDasharray="4 4" opacity={0.45} />}
              {hasWeightData && linePts.length > 1 && <Polyline points={linePts.map((p) => `${gx(p.wk)},${gy(p.gain)}`).join(' ')} fill="none" stroke={rose} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />}
              {hasWeightData && gainPts.map((p, i) => { const r = recommendedGain(p.wk, goal); const bad = p.gain > r.hi + 0.4 || p.gain < r.lo - 0.4; return bad ? <Circle key={i} cx={gx(p.wk)} cy={gy(p.gain)} r={3.5} fill="#D8505A" stroke="#fff" strokeWidth={1.5} /> : null; })}
              {hasWeightData && <Circle cx={gx(curWeek)} cy={gy(lastGain!)} r={4.5} fill={rose} stroke="#fff" strokeWidth={2} />}
              {hasWeightData && projected != null && <Circle cx={gx(40)} cy={gy(projected)} r={4} fill="#fff" stroke={rose} strokeWidth={2} />}
              {hasWeightData && projected != null && <SvgText x={gx(40)} y={gy(projected) - 6} fontSize={7.5} fill={roseInk} textAnchor="end" fontWeight="700">≈{projected >= 0 ? '+' : ''}{wStr(projected, 0)} by 40w</SvgText>}
              {weekTicks.map((w, i) => <SvgText key={`t${i}`} x={gx(w)} y={WH - 16} fontSize={9.5} fill="#7d6a74" textAnchor="middle" fontWeight="700">{w}</SvgText>)}
              <SvgText x={gx((axMinWk + 40) / 2)} y={WH - 3} fontSize={8} fill="#b0a6ae" textAnchor="middle" fontWeight="700">weeks</SvgText>
            </Svg>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
              <ChartKey sw={rose} t="Your gain" />
              <ChartKey sw="#DCEFE3" t="Recommended range" />
              <ChartKey sw={rose} t="Projected" />
            </View>

            {/* insight stats — once there's a logged trend */}
            {hasWeightData && (
              <View style={{ flexDirection: 'row', gap: 7, marginTop: 10 }}>
                <MiniStat v={pace != null ? `${pace >= 0 ? '+' : ''}${wStr(pace, 2)}` : '—'} k={`${u.weightUnit} / week`} badge={pace != null ? (paceOk ? 'Good pace' : pace > 0.7 ? 'Fast' : 'Slow') : ''} ok={paceOk} />
                <MiniStat v={`${lastGain! >= 0 ? '+' : ''}${wStr(lastGain!)}`} k="total gain" badge={wStatus === 'On track' ? 'In range' : wStatus === 'Above range' ? 'High' : wStatus === 'Below range' ? 'Low' : ''} ok={wStatusOk} />
                <MiniStat v={projected != null ? `≈${wStr(projected, 0)}` : '—'} k="at birth" badge={projected != null ? (projected >= goal.lo && projected <= goal.hi ? 'On target' : projected > goal.hi ? 'Over' : 'Under') : ''} ok={projected != null && projected >= goal.lo && projected <= goal.hi} />
              </View>
            )}
          </>
        ) : (
          <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.muted, paddingVertical: 6 }}>Set your start weight above, then log today to see your gain against the recommended range.</Text>
        )}
        {saveBtn(saveWeight)}
      </View>

      {/* Water */}
      {label('Water')}
      <View style={blockStyle}>
        {metricRow('💧', 'Water', watStr(water), ` ${u.waterUnit}`, water >= 2 ? 'Goal met' : `Below ${watStr(2, 0)} ${u.waterUnit}`, water >= 2, () => setWater(Math.max(0, Math.round((water - u.waterStepL) * 1000) / 1000)), () => setWater(Math.round((water + u.waterStepL) * 1000) / 1000))}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 42, position: 'relative' }}>
          <View style={{ position: 'absolute', left: 0, right: 0, top: `${(1 - 2 / wMax) * 100}%`, borderTopWidth: 1.5, borderColor: '#9AB0C9', borderStyle: 'dashed' }} />
          {waterVals.map((v, i) => <View key={i} style={{ flex: 1, height: `${Math.max(4, (v / wMax) * 100)}%`, borderRadius: 3, backgroundColor: '#7FB0D8' }} />)}
        </View>
        {dayAxis}
        <Text style={{ fontFamily: font.body700, fontSize: 8, color: '#9AB0C9', textAlign: 'right', marginTop: 2 }}>– – {watStr(2, 0)} {u.waterUnit} goal</Text>
        {saveBtn(saveWater)}
      </View>

      {/* Sleep */}
      {label('Sleep')}
      <View style={blockStyle}>
        {metricRow('😴', 'Sleep', sVal.toFixed(1), 'h', sVal >= 7 && sVal <= 9 ? 'Good' : sVal < 7 ? 'Low' : 'High', sVal >= 7 && sVal <= 9, () => setSleep(Math.max(0, Math.round((sVal - 0.5) * 10) / 10)), () => setSleep(Math.round((sVal + 0.5) * 10) / 10))}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 42, position: 'relative' }}>
          <View style={{ position: 'absolute', left: 0, right: 0, top: `${(1 - 9 / sMax) * 100}%`, height: `${((9 - 7) / sMax) * 100}%`, backgroundColor: '#DCEFE3', borderRadius: 2 }} />
          {sleepVals.map((v, i) => <View key={i} style={{ flex: 1, height: `${Math.max(4, (v / sMax) * 100)}%`, borderRadius: 3, backgroundColor: '#B8A6E0' }} />)}
        </View>
        {dayAxis}
        <View style={{ flexDirection: 'row', gap: 11, marginTop: 6 }}><ChartKey sw="#B8A6E0" t="Hours slept" /><ChartKey sw="#DCEFE3" t="7–9h recommended" /></View>
        {saveBtn(saveSleep)}
      </View>

      {/* Monitoring — blood glucose & pressure trend charts, below sleep */}
      {label('Monitoring')}
      <VitalsMonitoring />
    </View>
  );
}

/** A compact insight tile (value + caption + status badge) for the weight chart. */
function MiniStat({ v, k, badge, ok }: { v: string; k: string; badge: string; ok: boolean }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 9, paddingHorizontal: 6, alignItems: 'center' }}>
      <Text style={{ fontFamily: font.display700, fontSize: 15, color: color.ink }}>{v}</Text>
      <Text style={{ fontFamily: font.body700, fontSize: 8.5, letterSpacing: 0.2, textTransform: 'uppercase', color: '#9a8f98', marginTop: 2 }}>{k}</Text>
      {badge ? <Text style={{ fontFamily: font.body700, fontSize: 8.5, color: ok ? '#1E6C50' : '#B5662E', marginTop: 3 }}>{badge}</Text> : null}
    </View>
  );
}

/** A tiny swatch + label used in the chart legends. */
function ChartKey({ sw, t, border }: { sw: string; t: string; border?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: sw, borderWidth: border ? 1.5 : 0, borderColor: border }} />
      <Text style={{ fontFamily: font.body700, fontSize: 8.5, color: '#8a889c' }}>{t}</Text>
    </View>
  );
}

/**
 * Care & support — the "looking after you" hub: a quick mood check with a
 * fortnight trend, self-care logging, your support circle, crisis helplines,
 * and (tucked at the foot) the pregnancy status control.
 */
function CarePanel() {
  const { pregStatus, setPregStatus, checkins, addCheckin, momCare, addMomCare, supportContacts, addSupportContact, deleteSupportContact } = useData();
  const u = useUnits();

  const now = Date.now();
  const todays = checkins.filter((c) => careIsToday(c.at)).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const todayMood = todays.length ? todays[0].mood : null;
  const recent = checkins.filter((c) => now - new Date(c.at).getTime() <= 14 * 86400000).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  const avgMood = recent.length ? Math.round(recent.reduce((s, c) => s + c.mood, 0) / recent.length) : null;

  const todayWater = momCare.filter((m) => m.kind === 'water' && careIsToday(m.at)).reduce((s, m) => s + m.value, 0);
  const weekSleep = momCare.filter((m) => m.kind === 'sleep' && now - new Date(m.at).getTime() <= 7 * 86400000);
  const avgSleep = weekSleep.length ? (weekSleep.reduce((s, m) => s + m.value, 0) / weekSleep.length).toFixed(1) : null;
  const restToday = momCare.filter((m) => m.kind === 'comfort' && careIsToday(m.at)).length;

  const [adding, setAdding] = useState(false);
  const [nm, setNm] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const addContact = () => { if (!nm.trim()) return; addSupportContact({ name: nm, role, phone }); setNm(''); setRole(''); setPhone(''); setAdding(false); };

  return (
    <View style={{ gap: 16 }}>
      <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted }}>However your journey unfolds, Everly adapts around you — private and free.</Text>

      {/* Today's mood */}
      <View style={{ gap: 9 }}>
        <PanelLabel>How are you feeling today?</PanelLabel>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {CARE_MOODS.map((emoji, i) => {
            const sel = todayMood === i;
            return (
              <Pressable key={i} accessibilityLabel={`Feeling ${MOODS[i]}`} onPress={() => { if (todayMood !== i) addCheckin({ mood: i, symptoms: [] }); }}
                style={{ flex: 1, aspectRatio: 1, borderRadius: radius.tile, backgroundColor: sel ? '#FBE0EA' : color.canvas, borderWidth: 1.5, borderColor: sel ? color.rose : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 22 }}>{emoji}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Fortnight mood trend */}
      {recent.length > 0 && avgMood !== null && (
        <View style={{ gap: 9 }}>
          <PanelLabel>Your mood · last 2 weeks</PanelLabel>
          <View style={{ backgroundColor: '#FAF3F6', borderRadius: radius.tile, padding: 13 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <Text style={{ fontFamily: font.display700, fontSize: 16, color: color.roseInk }}>{MOODS[avgMood]} {CARE_MOODS[avgMood]}</Text>
              <Text style={{ fontFamily: font.body500, fontSize: 11, color: color.muted }}>{recent.length} check-in{recent.length === 1 ? '' : 's'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 46 }}>
              {recent.slice(-14).map((c) => (
                <View key={c.id} style={{ flex: 1, height: `${((c.mood + 1) / 5) * 100}%`, minHeight: 4, borderRadius: 3, backgroundColor: c.mood >= 3 ? color.rose : '#E7A9C4' }} />
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Self-care */}
      <View style={{ gap: 9 }}>
        <PanelLabel>Self-care today</PanelLabel>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={() => addMomCare({ kind: 'water', value: 250 })} style={{ flex: 1, backgroundColor: '#FAF3F6', borderRadius: radius.tile, paddingVertical: 11, alignItems: 'center' }}>
            <Text style={{ fontFamily: font.display700, fontSize: 15, color: color.ink }}>{u.fmtWaterMl(todayWater, u.imperial ? 0 : 1)}</Text>
            <Text style={{ fontFamily: font.body600, fontSize: 9.5, color: color.muted, marginTop: 2 }}>💧 water · +250</Text>
          </Pressable>
          <View style={{ flex: 1, backgroundColor: '#FAF3F6', borderRadius: radius.tile, paddingVertical: 11, alignItems: 'center' }}>
            <Text style={{ fontFamily: font.display700, fontSize: 15, color: color.ink }}>{avgSleep ? `${avgSleep}h` : '—'}</Text>
            <Text style={{ fontFamily: font.body600, fontSize: 9.5, color: color.muted, marginTop: 2 }}>😴 sleep · 7d</Text>
          </View>
          <Pressable onPress={() => addMomCare({ kind: 'comfort', value: 3 })} style={{ flex: 1, backgroundColor: '#FAF3F6', borderRadius: radius.tile, paddingVertical: 11, alignItems: 'center' }}>
            <Text style={{ fontFamily: font.display700, fontSize: 15, color: color.ink }}>{restToday > 0 ? `${restToday}×` : '＋'}</Text>
            <Text style={{ fontFamily: font.body600, fontSize: 9.5, color: color.muted, marginTop: 2 }}>😌 rest</Text>
          </Pressable>
        </View>
      </View>

      {/* Support circle */}
      <View style={{ gap: 9 }}>
        <PanelLabel>Your support circle</PanelLabel>
        {supportContacts.map((c) => (
          <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FAF3F6', borderRadius: radius.tile, paddingVertical: 9, paddingHorizontal: 11 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FBE0EA', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: font.display700, fontSize: 14, color: color.roseInk }}>{c.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body700, fontSize: 12.5, color: color.ink }}>{c.name}</Text>
              {c.role ? <Text style={{ fontFamily: font.body400, fontSize: 10.5, color: color.muted, marginTop: 1 }}>{c.role}</Text> : null}
            </View>
            {c.phone ? (
              <Pressable onPress={() => Linking.openURL(`tel:${c.phone}`)} accessibilityLabel={`Call ${c.name}`} style={{ backgroundColor: color.rose, borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 13 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 11, color: '#fff' }}>Call</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={() => deleteSupportContact(c.id)} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 17, color: color.faint }}>×</Text></Pressable>
          </View>
        ))}
        {adding ? (
          <View style={{ gap: 8, backgroundColor: '#FAF3F6', borderRadius: radius.tile, padding: 12 }}>
            <Field label="Name" value={nm} onChangeText={setNm} placeholder="e.g. Sarah" autoCapitalize="words" />
            <Field label="Role (optional)" value={role} onChangeText={setRole} placeholder="e.g. Midwife, partner, doula" autoCapitalize="sentences" />
            <Field label="Phone (optional)" value={phone} onChangeText={setPhone} placeholder="e.g. 07123 456789" />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setAdding(false)} style={{ flex: 1 }} />
              <Button label="Add" onPress={addContact} style={{ flex: 1 }} tint={color.rose} />
            </View>
          </View>
        ) : (
          <Pressable onPress={() => setAdding(true)} style={{ borderWidth: 1.4, borderColor: '#E0C2D2', borderStyle: 'dashed', borderRadius: radius.tile, paddingVertical: 11, alignItems: 'center' }}>
            <Text style={{ fontFamily: font.body700, fontSize: 12.5, color: color.roseInk }}>＋ Add someone (partner, doula…)</Text>
          </Pressable>
        )}
      </View>

      {/* Crisis helplines — tappable where a number can be dialled */}
      <View style={{ backgroundColor: '#FBE0EA', borderRadius: radius.tile, padding: 14, gap: 4 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.roseInk, marginBottom: 4 }}>Support, any time</Text>
        {CRISIS_RESOURCES.map((r, i) => {
          const dial = dialable(r.detail);
          const body = (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 7, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: 'rgba(176,64,112,0.14)' }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 12.5, color: color.ink }}>{r.name}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.inkSecondary }}>{r.detail}</Text>
              </View>
              {dial ? <Text style={{ fontSize: 15 }}>📞</Text> : null}
            </View>
          );
          return dial
            ? <Pressable key={i} accessibilityLabel={`Call ${r.name}`} onPress={() => Linking.openURL(`tel:${dial}`)}>{body}</Pressable>
            : <View key={i}>{body}</View>;
        })}
      </View>

      {/* Pregnancy status — a quiet control at the foot */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: color.hairline }}>
        <Text style={{ fontFamily: font.body500, fontSize: 11.5, color: color.muted }}>This pregnancy</Text>
        <View style={{ flexDirection: 'row', backgroundColor: color.canvas, borderRadius: radius.pill, padding: 3, marginLeft: 'auto' }}>
          {PREG_STATUS.map((s) => {
            const sel = s.key === pregStatus;
            return (
              <Pressable key={s.key} onPress={() => setPregStatus(s.key)} style={{ borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: sel ? color.rose : 'transparent' }}>
                <Text style={{ fontFamily: font.body700, fontSize: 11, color: sel ? '#fff' : color.muted }}>{s.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const STARTER_PREP: { category: string; label: string }[] = [
  // Hospital bag — Mum
  { category: 'Hospital bag — Mum', label: 'ID & maternity notes' },
  { category: 'Hospital bag — Mum', label: 'Birth plan (printed copy)' },
  { category: 'Hospital bag — Mum', label: 'Nightwear & dressing gown' },
  { category: 'Hospital bag — Mum', label: 'Nursing bras & breast pads' },
  { category: 'Hospital bag — Mum', label: 'Maternity / postnatal pads' },
  { category: 'Hospital bag — Mum', label: 'Toiletries, lip balm & hair ties' },
  { category: 'Hospital bag — Mum', label: 'Loose going-home outfit' },
  { category: 'Hospital bag — Mum', label: 'Snacks & water bottle' },
  { category: 'Hospital bag — Mum', label: 'Phone & long charger' },
  // Hospital bag — Baby
  { category: 'Hospital bag — Baby', label: 'Bodysuits & sleepsuits (newborn)' },
  { category: 'Hospital bag — Baby', label: 'Muslin squares' },
  { category: 'Hospital bag — Baby', label: 'Cellular blanket' },
  { category: 'Hospital bag — Baby', label: 'Newborn nappies & cotton wool' },
  { category: 'Hospital bag — Baby', label: 'Hat, mittens & socks' },
  { category: 'Hospital bag — Baby', label: 'Going-home outfit' },
  // Hospital bag — Partner
  { category: 'Hospital bag — Partner', label: 'Snacks & drinks' },
  { category: 'Hospital bag — Partner', label: 'Change of clothes' },
  { category: 'Hospital bag — Partner', label: 'Charger & camera' },
  { category: 'Hospital bag — Partner', label: 'Cash / coins for parking' },
  // Feeding
  { category: 'Feeding', label: 'Bottles & steriliser' },
  { category: 'Feeding', label: 'First-infant formula (if bottle-feeding)' },
  { category: 'Feeding', label: 'Breast pump & storage bags' },
  { category: 'Feeding', label: 'Nursing pillow' },
  { category: 'Feeding', label: 'Bibs & muslins' },
  // Nappies & changing
  { category: 'Nappies & changing', label: 'Changing mat' },
  { category: 'Nappies & changing', label: 'Newborn nappies (stock up)' },
  { category: 'Nappies & changing', label: 'Water wipes / cotton wool' },
  { category: 'Nappies & changing', label: 'Barrier cream' },
  { category: 'Nappies & changing', label: 'Nappy bags or bin' },
  // Sleep & nursery
  { category: 'Sleep & nursery', label: 'Moses basket or crib' },
  { category: 'Sleep & nursery', label: 'Firm, flat mattress + fitted sheets' },
  { category: 'Sleep & nursery', label: 'Baby sleeping bags / swaddles' },
  { category: 'Sleep & nursery', label: 'Room thermometer (16–20°C)' },
  { category: 'Sleep & nursery', label: 'Baby monitor' },
  { category: 'Sleep & nursery', label: 'Blackout blind' },
  // Clothing & bathing
  { category: 'Clothing & bathing', label: 'Sleepsuits ×6' },
  { category: 'Clothing & bathing', label: 'Vests / bodysuits ×6' },
  { category: 'Clothing & bathing', label: 'Cardigan & pram suit' },
  { category: 'Clothing & bathing', label: 'Hooded towels' },
  { category: 'Clothing & bathing', label: 'Baby bath or bath support' },
  { category: 'Clothing & bathing', label: 'Soft brush & baby nail file' },
  // Out & about
  { category: 'Out & about', label: 'Rear-facing car seat (fitted & practised)' },
  { category: 'Out & about', label: 'Pram with lie-flat newborn mode' },
  { category: 'Out & about', label: 'Changing bag' },
  { category: 'Out & about', label: 'Rain cover & sunshade' },
  // Home & admin
  { category: 'Home & admin', label: 'Wash baby clothes (non-bio) first' },
  { category: 'Home & admin', label: 'Pack hospital bag by ~36 weeks' },
  { category: 'Home & admin', label: 'Fit & inspect the car seat' },
  { category: 'Home & admin', label: 'Register with a GP / paediatrician' },
  { category: 'Home & admin', label: 'Register the birth' },
  { category: 'Home & admin', label: 'Sort parental leave / pay' },
  { category: 'Home & admin', label: 'Batch-cook & freeze meals' },
  // Birth plan
  { category: 'Birth plan', label: 'Pain-relief preferences' },
  { category: 'Birth plan', label: 'Birth environment wishes' },
  { category: 'Birth plan', label: 'Your birth partner' },
  { category: 'Birth plan', label: 'Feeding intention (breast / bottle)' },
  { category: 'Birth plan', label: 'Skin-to-skin & delayed cord clamping' },
  { category: 'Birth plan', label: 'Vitamin K for baby' },
  { category: 'Birth plan', label: 'Postnatal ward preferences' },
];
const PREP_CATS = ['Hospital bag — Mum', 'Hospital bag — Baby', 'Hospital bag — Partner', 'Feeding', 'Nappies & changing', 'Sleep & nursery', 'Clothing & bathing', 'Out & about', 'Home & admin', 'Birth plan'];

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
            <Pressable key={f} onPress={() => { setFilter(f); setIdx(0); }} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: filter === f ? color.rose : '#fff', borderWidth: 1, borderColor: filter === f ? color.rose : color.hairline }}>
              <Text style={{ fontFamily: font.body600, fontSize: 12, color: filter === f ? '#fff' : color.ink }}>{f}</Text>
            </Pressable>
          ))}
        </View>
        {card ? (
          <View style={{ backgroundColor: color.canvas, borderRadius: radius.tile, padding: 18, alignItems: 'center', gap: 4 }}>
            <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink }}>{card.name}</Text>
            <Text style={{ fontFamily: font.body600, fontSize: 12.5, color: color.rose }}>{card.gender} · {card.origin}</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.inkSecondary, textAlign: 'center', marginTop: 2 }}>{card.meaning}</Text>
          </View>
        ) : (
          <EmptyHint text="You've been through them all for this filter." />
        )}
        {card && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Skip" variant="secondary" tint={color.rose} onPress={() => setIdx((i) => i + 1)} style={{ flex: 1 }} />
            <Button label="♥ Save" tint={color.rose} onPress={() => { saveName({ name: card.name, gender: card.gender }); setIdx((i) => i + 1); }} style={{ flex: 1 }} />
          </View>
        )}
      </View>

      {/* Add your own */}
      <View style={{ gap: 10 }}>
        <PanelLabel>Add your own</PanelLabel>
        <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Maya" autoCapitalize="words" />
        <SelectChips options={['Girl', 'Boy', 'Unisex']} value={gender} onChange={setGender} />
        <Button label="Save name" tint={color.rose} onPress={add} />
      </View>

      {/* Saved shortlist */}
      <View style={{ gap: 8 }}>
        <PanelLabel>Saved names{savedNames.length ? ` · ${savedNames.length}` : ''}</PanelLabel>
        {savedNames.length === 0 ? <EmptyHint text="No saved names yet." /> : savedNames.map((n) => (
          <PanelRow key={n.id} title={n.name} sub={n.gender} onDelete={() => deleteName(n.id)} />
        ))}
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
  const u = useUnits();
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

      <PanelLabel>Hydration today · {u.fmtWaterMl(todayWater, u.imperial ? 0 : 1)} / {u.fmtWaterMl(WATER_GOAL, u.imperial ? 0 : 1)}</PanelLabel>
      <ProgressBar pct={Math.min(100, Math.round((todayWater / WATER_GOAL) * 100))} track={color.canvas} colors={['#6BBFAE', color.maternalTeal]} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[250, 500].map((ml) => (
          <Pressable key={ml} onPress={() => addMomCare({ kind: 'water', value: ml })} style={{ flex: 1, paddingVertical: 11, borderRadius: radius.tile, alignItems: 'center', backgroundColor: color.canvas, borderWidth: 1, borderColor: color.hairline }}>
            <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.tealDeep }}>+{u.fmtBottle(ml)}</Text>
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
