import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, Modal, TextInput } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, radius, shadow } from '../../../src/theme/tokens';
import { Button, Field } from '../../../src/components/forms';
import { ChevronLeft, Clock, Calendar as CalIcon } from '../../../src/components/icons';
import { EntryIcon } from '../../../src/components/EntryIcon';
import { DurationField } from '../../../src/components/DurationField';
import { DateField } from '../../../src/components/DateField';
import { TimeField } from '../../../src/components/TimeField';
import { Silhouette } from '../../../src/components/ui';
import { stageFrom } from '../../../src/lib/age';
import {
  useData, entriesOn, entryDetail, ENTRY_META, quickLogKinds, MOOD_LABELS,
  type Entry, type EntryKind, type EntryDetails, type FeedSide, type DiaperType,
} from '../../../src/lib/store';
import { useFeedback } from '../../../src/components/Feedback';

/* ── header sun / moon glyphs ────────────────────────────────────────────── */
function Moon({ size = 20, color: c = '#9C9AB2' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </Svg>
  );
}
function Sun({ size = 20, color: c = '#C9A33B' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      <Path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </Svg>
  );
}

/** Per-kind icon tint for the dark (night) tiles. */
const NIGHT_TINT: Record<EntryKind, string> = {
  feed: '#3FA98A', sleep: '#B8B4F0', diaper: '#D9B84A', pump: '#E98FB3', note: '#8FA4D8',
  meal: '#E0A45C', mood: '#B8B4F0', activity: '#6FC29A', medicine: '#E98FB3', potty: '#7FB0D8',
};

const clockTime = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).toLowerCase();

function ageLabel(birthDate?: string): string | null {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (isNaN(b.getTime())) return null;
  const months = Math.max(0, Math.floor((Date.now() - b.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
  return months < 24 ? `${months} mo` : `${Math.floor(months / 12)} yr`;
}

/** Free-text command → entry (shared with the typed "log a line" input). */
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
  return { kind: 'note', details: { note: text } };
}

const tileSubtitle = (kind: EntryKind, latest: Entry | undefined, sleepMin: number, pumpMl: number): string => {
  if (kind === 'sleep') return sleepMin > 0 ? `${Math.floor(sleepMin / 60)}h ${sleepMin % 60}m today` : 'Tap to log';
  if (kind === 'pump') return pumpMl > 0 ? `${pumpMl} ml today` : 'Tap to log';
  if (!latest) return 'Tap to log';
  if (kind === 'feed') { const d = entryDetail(latest); return d ? `${clockTime(latest.at)} · ${d}` : clockTime(latest.at); }
  if (kind === 'diaper') { const t = latest.diaperType === 'both' ? 'Wet + dirty' : latest.diaperType === 'dirty' ? 'Dirty' : 'Wet'; return `${t} · ${clockTime(latest.at)}`; }
  if (kind === 'mood') return typeof latest.mood === 'number' ? `${MOOD_LABELS[latest.mood]} · ${clockTime(latest.at)}` : clockTime(latest.at);
  return clockTime(latest.at);
};

export default function AddLog() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ night?: string }>();
  const { addEntry, updateEntry, deleteEntry, addEvent, entries, activeChild } = useData();
  const { toast: notify } = useFeedback();

  const [night, setNight] = useState(params.night === '1');
  const [kind, setKind] = useState<EntryKind | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [at, setAt] = useState(() => new Date().toISOString());
  const [side, setSide] = useState<FeedSide>('left');
  const [diaper, setDiaper] = useState<DiaperType>('wet');
  const [ml, setMl] = useState('');
  const [mins, setMins] = useState('');
  const [note, setNote] = useState('');
  const [mood, setMood] = useState(2);
  // Just-logged entry, so the toast can offer an Undo for a few seconds.
  const [undo, setUndo] = useState<{ id: string; label: string } | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (undoTimer.current) clearTimeout(undoTimer.current); }, []);
  const [cmd, setCmd] = useState('');
  const [toast, setToast] = useState('');
  // Appointment composer
  const [apptOpen, setApptOpen] = useState(false);
  const [apTitle, setApTitle] = useState('');
  const [apDate, setApDate] = useState('');
  const [apTime, setApTime] = useState('');
  const [apLoc, setApLoc] = useState('');
  const [apErr, setApErr] = useState('');

  // Scope to the active child.
  const cid = activeChild?.id;
  const mine = cid ? entries.filter((e) => e.childId === cid) : entries;
  // Quick-log tiles adapt to the active child's life-stage.
  const quick = quickLogKinds(activeChild?.birthDate ? stageFrom(activeChild.birthDate) : 'newborn');
  const today = entriesOn(mine);
  const sleepMin = today.filter((e) => e.kind === 'sleep').reduce((s, e) => s + (e.durationMin ?? 0), 0);
  const pumpMl = today.filter((e) => e.kind === 'pump').reduce((s, e) => s + (e.volumeMl ?? 0), 0);
  const latestOf = (k: EntryKind) => mine.find((e) => e.kind === k);

  // Wake window (shown in night mode) — derive next nap from last sleep (~2h window).
  const lastSleep = latestOf('sleep');
  const wakeMinsLeft = (() => {
    if (!lastSleep) return null;
    const since = Math.round((Date.now() - new Date(lastSleep.at).getTime()) / 60000);
    return 120 - since;
  })();

  // theme
  const t = night
    ? { bg: '#1A1730', card: '#262144', cardText: '#EDEBFA', sub: '#9C97C4', headText: '#EDEBFA', tileFill: '#2E2952' }
    : { bg: color.canvas, card: '#fff', cardText: color.ink, sub: color.muted, headText: color.ink, tileFill: '' };

  function open(k: EntryKind) { setKind(k); setEditId(null); setAt(new Date().toISOString()); setSide('left'); setDiaper('wet'); setMl(''); setMins(''); setNote(''); setMood(2); }
  function openEdit(e: Entry) {
    setKind(e.kind); setEditId(e.id); setAt(e.at);
    setSide(e.side ?? 'left'); setDiaper(e.diaperType ?? 'wet');
    setMl(e.volumeMl != null ? String(e.volumeMl) : ''); setMins(e.durationMin != null ? String(e.durationMin) : '');
    setNote(e.note ?? ''); setMood(e.mood ?? 2);
  }
  function flash(label: string) { setToast(`Logged ${label.toLowerCase()}${activeChild ? ` for ${activeChild.name}` : ''}.`); setTimeout(() => setToast(''), 2200); }
  function offerUndo(id: string, label: string) {
    setUndo({ id, label });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 6000);
  }

  function detailsFor(k: EntryKind): EntryDetails {
    const n = (s: string) => { const v = parseInt(s, 10); return isNaN(v) ? undefined : v; };
    const d: EntryDetails = { note };
    if (k === 'feed') { d.side = side; d.volumeMl = side === 'bottle' ? n(ml) : undefined; d.durationMin = n(mins); }
    else if (k === 'pump') d.volumeMl = n(ml);
    else if (k === 'sleep' || k === 'activity') d.durationMin = n(mins);
    else if (k === 'diaper') d.diaperType = diaper;
    else if (k === 'mood') d.mood = mood;
    return d;
  }

  function save() {
    if (!kind) return;
    const details = detailsFor(kind);
    if (editId) { updateEntry(editId, { ...details, at }); notify('Updated'); }
    else { const id = addEntry(kind, details, at); offerUndo(id, ENTRY_META[kind].label); flash(ENTRY_META[kind].label); notify('Saved'); }
    setKind(null); setEditId(null);
  }
  function del() {
    if (editId) { deleteEntry(editId); notify('Deleted'); }
    setKind(null); setEditId(null);
  }

  function openAppt() {
    const d = new Date();
    setApTitle(''); setApLoc(''); setApErr('');
    setApDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    setApTime('09:00');
    setApptOpen(true);
  }
  function saveAppt() {
    if (!apTitle.trim()) { setApErr('Add a title.'); return; }
    const t12 = apTime.trim() || '09:00';
    const at = new Date(`${apDate}T${t12.length === 5 ? t12 : '09:00'}:00`);
    if (isNaN(at.getTime())) { setApErr('Check the date and time.'); return; }
    addEvent({ title: apTitle.trim(), at: at.toISOString(), childId: cid, location: apLoc.trim() || undefined });
    setApptOpen(false);
    flash('Appointment');
    notify('Appointment added');
  }

  function runCmd() {
    const parsed = parse(cmd);
    if (!parsed) { setToast('Try "feed left 12" or "sleep 45".'); setTimeout(() => setToast(''), 2200); return; }
    addEntry(parsed.kind, parsed.details);
    flash(ENTRY_META[parsed.kind].label);
    setCmd('');
  }

  const childAge = ageLabel(activeChild?.birthDate);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 20, gap: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={{ width: 34, height: 34, justifyContent: 'center' }}>
            <ChevronLeft size={24} color={night ? t.headText : color.ink} />
          </Pressable>
          {night ? <Moon size={22} color="#B8B4F0" /> : null}
          <Text style={{ fontFamily: font.display700, fontSize: 22, color: t.headText }}>{night ? 'Night log' : 'Add'}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {activeChild ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: night ? t.card : '#E7E4FB', borderRadius: 999, paddingVertical: 5, paddingRight: 12, paddingLeft: 5 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: night ? '#3E386A' : '#6B6FC9', alignItems: 'center', justifyContent: 'center' }}>
                <Silhouette size={13} fill="#fff" />
              </View>
              <Text style={{ fontFamily: font.body700, fontSize: 12, color: night ? t.cardText : '#54579E' }}>{activeChild.name}{childAge ? ` · ${childAge}` : ''}</Text>
            </View>
          ) : null}
          {/* day / night toggle */}
          <Pressable onPress={() => setNight((v) => !v)} hitSlop={8} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: night ? t.card : '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: night ? '#3E386A' : color.hairline }}>
            {night ? <Sun size={20} color="#E9C46A" /> : <Moon size={20} color="#6B6FC9" />}
          </Pressable>
        </View>
      </View>

      {/* just-logged → offer an Undo for a few seconds */}
      {undo && (
        <View style={{ backgroundColor: '#33324A', borderRadius: radius.tile, paddingVertical: 11, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 13, color: '#fff' }}>Logged {undo.label.toLowerCase()}{activeChild ? ` for ${activeChild.name}` : ''}</Text>
          <Pressable onPress={() => { deleteEntry(undo.id); setUndo(null); }} hitSlop={8}>
            <Text style={{ fontFamily: font.body700, fontSize: 13, color: '#B7B9F0' }}>Undo</Text>
          </Pressable>
        </View>
      )}

      {/* wake-window banner (night) */}
      {night && (
        <LinearGradient colors={['#5B57B0', '#7E7AD6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: radius.card, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 14, color: '#fff' }}>Wake window</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
              {wakeMinsLeft == null ? 'Log a sleep to track nap timing' : wakeMinsLeft > 0 ? `Next nap in ~${wakeMinsLeft} min` : 'Nap window open'}
            </Text>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 11, color: '#fff' }}>Active</Text>
          </View>
        </LinearGradient>
      )}

      {/* big tap tiles (adapt to the child's stage) */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {quick.map((k) => {
          const m = ENTRY_META[k];
          const fill = night ? t.tileFill : m.fill;
          const ic = night ? NIGHT_TINT[k] : m.ink;
          const sub = tileSubtitle(k, latestOf(k), sleepMin, pumpMl);
          return (
            <Pressable
              key={k}
              onPress={() => open(k)}
              style={({ pressed }) => [{ width: '47.5%', flexGrow: 1, backgroundColor: fill, borderRadius: radius.card, paddingVertical: 22, paddingHorizontal: 18, alignItems: 'center', gap: 8, opacity: pressed ? 0.85 : 1 }, night ? null : shadow.card]}
            >
              <EntryIcon kind={k} color={ic} size={30} />
              <Text style={{ fontFamily: font.display700, fontSize: 18, color: night ? t.cardText : color.ink }}>{m.label}</Text>
              <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: t.sub, textAlign: 'center' }} numberOfLines={1}>{sub}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* add an appointment (event) */}
      <Pressable
        onPress={openAppt}
        style={({ pressed }) => [{ backgroundColor: t.card, borderRadius: radius.card, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.9 : 1 }, night ? null : shadow.card]}
      >
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: night ? '#2E2952' : '#DCEBFA', alignItems: 'center', justifyContent: 'center' }}>
          <CalIcon size={20} color={night ? '#8FA4D8' : '#2C5F90'} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 14.5, color: t.cardText }}>Add appointment</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 12, color: t.sub, marginTop: 2 }}>A visit, class or reminder — shows in Up next & Calendar</Text>
        </View>
        <Text style={{ fontFamily: font.body700, fontSize: 22, color: t.sub }}>+</Text>
      </Pressable>

      {/* type-to-log (command parser) */}
      <View style={[{ backgroundColor: t.card, borderRadius: radius.card, padding: 14, gap: 10 }, night ? null : shadow.card]}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: t.sub }}>Type to log</Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput
            value={cmd}
            onChangeText={setCmd}
            placeholder='e.g. "feed left 12"'
            placeholderTextColor={night ? '#6E699A' : color.faint}
            autoCapitalize="none"
            onSubmitEditing={runCmd}
            returnKeyType="done"
            style={{ flex: 1, fontFamily: font.body500, fontSize: 14, color: t.cardText, backgroundColor: night ? '#1F1B3A' : color.canvas, borderRadius: radius.tile, paddingHorizontal: 14, paddingVertical: 12 }}
          />
          <Pressable onPress={runCmd} style={{ backgroundColor: color.primary, borderRadius: radius.tile, paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 13, color: '#fff' }}>Log</Text>
          </Pressable>
        </View>
        {toast ? <Text style={{ fontFamily: font.body600, fontSize: 12, color: night ? '#9FE6C8' : '#2C8475' }}>{toast}</Text> : null}
      </View>

      {/* recent (active child, today) */}
      {today.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: t.sub, paddingLeft: 2 }}>
            Today · {today.length} {today.length === 1 ? 'entry' : 'entries'}
          </Text>
          {today.slice(0, 6).map((e) => {
            const m = ENTRY_META[e.kind]; const det = entryDetail(e);
            return (
              <Pressable key={e.id} onPress={() => openEdit(e)} style={({ pressed }) => [{ backgroundColor: t.card, borderRadius: radius.cardSm, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, opacity: pressed ? 0.9 : 1 }, night ? null : shadow.card]}>
                <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: night ? NIGHT_TINT[e.kind] : m.ink }} />
                <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 13, color: t.cardText }} numberOfLines={1}>{m.label}{det ? ` · ${det}` : ''}</Text>
                <Text style={{ fontFamily: font.body500, fontSize: 11, color: t.sub }}>{clockTime(e.at)}</Text>
                <Text style={{ fontFamily: font.body700, fontSize: 11, color: color.primary }}>Edit</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* detail modal (set side / volume / duration / type / note) */}
      <Modal visible={kind !== null} transparent animationType="fade" onRequestClose={() => setKind(null)}>
        <Pressable onPress={() => setKind(null)} style={{ flex: 1, backgroundColor: 'rgba(20,12,40,0.5)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: night ? t.card : color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: t.cardText }}>{kind ? `${editId ? 'Edit ' : ''}${ENTRY_META[kind].label}` : ''}</Text>
            {kind === 'feed' && <Chips night={night} options={[['left', 'Left'], ['right', 'Right'], ['bottle', 'Bottle']]} value={side} onChange={(v) => setSide(v as FeedSide)} />}
            {kind === 'feed' && side === 'bottle' && <Field label="Amount (ml)" value={ml} onChangeText={setMl} placeholder="e.g. 120" />}
            {(kind === 'feed' || kind === 'sleep' || kind === 'activity') && <DurationField label="Duration" value={mins} onChange={setMins} />}
            {kind === 'pump' && <Field label="Amount (ml)" value={ml} onChangeText={setMl} placeholder="e.g. 90" />}
            {kind === 'diaper' && <Chips night={night} options={[['wet', 'Wet'], ['dirty', 'Dirty'], ['both', 'Both']]} value={diaper} onChange={(v) => setDiaper(v as DiaperType)} />}
            {kind === 'mood' && <Chips night={night} options={MOOD_LABELS.map((l, i) => [String(i), l] as [string, string])} value={String(mood)} onChange={(v) => setMood(parseInt(v, 10))} />}
            {kind && <TimeField value={at} onChange={setAt} />}
            <Field label={kind === 'note' || kind === 'meal' || kind === 'medicine' || kind === 'potty' ? 'Note' : 'Note (optional)'} value={note} onChangeText={setNote} placeholder={kind === 'meal' ? 'What did they eat?' : kind === 'medicine' ? 'Medicine & dose' : kind === 'potty' ? 'e.g. pee / poo / accident' : 'Anything to add?'} autoCapitalize="sentences" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => { setKind(null); setEditId(null); }} style={{ flex: 1 }} />
              <Button label={editId ? 'Update' : 'Save'} onPress={save} style={{ flex: 1 }} />
            </View>
            {editId && (
              <Pressable onPress={del} hitSlop={6} style={{ alignItems: 'center', paddingTop: 2 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.rose }}>Delete entry</Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* appointment modal */}
      <Modal visible={apptOpen} transparent animationType="fade" onRequestClose={() => setApptOpen(false)}>
        <Pressable onPress={() => setApptOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(20,12,40,0.5)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 12 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>New appointment</Text>
            <Field label="Title" value={apTitle} onChangeText={(v) => { setApTitle(v); if (apErr) setApErr(''); }} placeholder="e.g. 6-week check" autoCapitalize="sentences" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1.4 }}><DateField label="Date" value={apDate} onChangeText={setApDate} /></View>
              <View style={{ flex: 1 }}><Field label="Time" value={apTime} onChangeText={setApTime} placeholder="14:30" /></View>
            </View>
            <Field label="Location (optional)" value={apLoc} onChangeText={setApLoc} placeholder="e.g. GP surgery" autoCapitalize="sentences" />
            {apErr ? <Text style={{ fontFamily: font.body500, fontSize: 12.5, color: color.rose }}>{apErr}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setApptOpen(false)} style={{ flex: 1 }} />
              <Button label="Add" onPress={saveAppt} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function Chips({ options, value, onChange, night }: { options: [string, string][]; value: string; onChange: (v: string) => void; night: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {options.map(([v, label]) => {
        const sel = v === value;
        return (
          <Pressable key={v} onPress={() => onChange(v)} style={{ flex: 1, paddingVertical: 11, borderRadius: radius.tile, alignItems: 'center', backgroundColor: sel ? color.primary : (night ? '#1F1B3A' : '#fff'), borderWidth: 1, borderColor: sel ? color.primary : (night ? '#3E386A' : color.hairline) }}>
            <Text style={{ fontFamily: font.body600, fontSize: 13, color: sel ? '#fff' : (night ? '#CFCBEC' : color.ink) }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
