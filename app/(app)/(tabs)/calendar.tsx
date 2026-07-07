import React, { useState, useRef, useMemo } from 'react';
import { ScrollView, View, Text, Pressable, Modal, ActivityIndicator, Linking, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, fill, childToken } from '../../../src/theme/tokens';
import { ChevronLeft, ChevronRight, Calendar, Shield, Activity, Heart, X, Search, BabyBean } from '../../../src/components/icons';
import { Button, Field } from '../../../src/components/forms';
import { useData, ENTRY_META, entryDetail, EntryKind, EventItem, Entry } from '../../../src/lib/store';
import { useWeather, WeatherGlyph, wxLabel, searchCity, wxColor, type WxLocation, type DayWx } from '../../../src/lib/weather';
import { useFeedback } from '../../../src/components/Feedback';
import { DayTimeline, type TlItem } from '../../../src/components/DayTimeline';

/* Calendar — Monday-start month grid, view-mode pills, today-filled cell,
 * per-category dots, and rich selected-day rows. Design parity with A04. */

// Monday-start header letters; index 5,6 (Sat, Sun) are weekend → dimmed.
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const VIEWS = ['Month', 'Week'] as const;
type ViewMode = (typeof VIEWS)[number];
const SWITCH_TRACK = '#E9E2D6'; // warm cream track for the Month/Week switch
const RAIL_SPAN = 120; // days shown on each side of today in the Week rail wheel

const EVENT_COLOR = color.primary; // periwinkle/lilac for scheduled events
const ENTRY_COLOR = '#3FA98A'; // mint for logged entries
const APPT_COLOR = '#B04070'; // rose for pregnancy / Mum&Me appointments
/** Readable ink per child colour (matches the module accents). */
const CHILD_INK: Record<string, string> = { lilac: '#54579E', sky: '#2C5F90', mint: '#22806C', blush: '#B04070', peach: '#B5662E', butter: '#8A6A1E', sage: '#567F39' };

type Appt = { id: string; title: string; at: string; source: 'preg' | 'mat'; location?: string; kind?: string; result?: string; prep?: string };
type Owner = { key: string; label: string; dot: string; fill: string; ink: string };

const key = (y: number, m: number, d: number) => `${y}-${m}-${d}`;
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const dkey = (iso: string) => {
  const d = new Date(iso);
  return key(d.getFullYear(), d.getMonth(), d.getDate());
};
// Convert JS getDay() (0=Sun..6=Sat) to Monday-first column index (0=Mon..6=Sun).
const monIndex = (jsDay: number) => (jsDay + 6) % 7;

// Per-entry-kind icon tile colors + glyph for the selected-day rows.
function entryTile(kind: EntryKind): { bg: string; stroke: string; Icon: typeof Shield } {
  const m = ENTRY_META[kind];
  switch (kind) {
    case 'diaper':
      return { bg: m.fill, stroke: m.ink, Icon: Shield };
    case 'sleep':
    case 'note':
      return { bg: m.fill, stroke: m.ink, Icon: Heart };
    default:
      return { bg: m.fill, stroke: m.ink, Icon: Activity };
  }
}

export default function CalendarTab() {
  const insets = useSafeAreaInsets();
  const {
    entries, events, addEvent, updateEvent, deleteEvent, activeChild, children,
    pregAppts, updatePregAppt, deletePregAppt, matAppts, updateMatAppt, deleteMatAppt,
    dueDate, maternalBirth,
  } = useData();
  const wx = useWeather();
  const { toast } = useFeedback();

  // Pregnancy + Mum&Me appointments, unified for the calendar.
  const appts: Appt[] = [
    ...pregAppts.map((a) => ({ id: a.id, title: a.title, at: a.at, source: 'preg' as const, location: a.location, kind: a.kind, result: a.result })),
    ...matAppts.map((a) => ({ id: a.id, title: a.title, at: a.at, source: 'mat' as const, location: undefined, kind: a.kind, prep: a.prep })),
  ];

  // Colour-coded owners: Mum&Me (pink) + each child (their colour) + Family.
  const hasMumme = !!(dueDate || maternalBirth || pregAppts.length || matAppts.length);
  const owners: Owner[] = [
    ...(hasMumme ? [{ key: 'mumme', label: 'Mum&Me', dot: APPT_COLOR, fill: '#FBE0EA', ink: '#B04070' }] : []),
    ...children.map((c) => ({ key: c.id, label: c.name, dot: childToken[c.color].stroke, fill: childToken[c.color].fill, ink: CHILD_INK[c.color] ?? color.primary })),
  ];
  const ownerOf = (childId?: string) => (childId ? childId : 'family');
  const ownerMeta = (k: string) => owners.find((o) => o.key === k);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const shown = (k: string) => !hidden.has(k);
  const toggleOwner = (k: string) => setHidden((h) => { const n = new Set(h); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const [editId, setEditId] = useState<string | null>(null);

  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [sel, setSel] = useState({ y: now.getFullYear(), m: now.getMonth(), d: now.getDate() });
  const [mode, setMode] = useState<ViewMode>('Month');
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [wxOpen, setWxOpen] = useState(false);
  const [tlLayout, setTlLayout] = useState<'ribbon' | 'clock'>('ribbon');

  const selKey = key(sel.y, sel.m, sel.d);
  // Per-day markers (colour per item) — the calendar shows only *scheduled*
  // things (events + Mum&Me appointments). Quick logs (feeding, diaper, …) live
  // on the child's own tracking, not the shared calendar.
  const dayMarks = new Map<string, string[]>();
  const pushMark = (k: string, c: string) => { const a = dayMarks.get(k); if (a) a.push(c); else dayMarks.set(k, [c]); };
  events.filter((e) => shown(ownerOf(e.childId))).forEach((e) => pushMark(dkey(e.at), EVENT_COLOR));
  if (shown('mumme')) appts.forEach((a) => pushMark(dkey(a.at), APPT_COLOR));

  const firstWeekday = monIndex(new Date(view.y, view.m, 1).getDay());
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = new Date(view.y, view.m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const todayKey = key(now.getFullYear(), now.getMonth(), now.getDate());
  const selIsToday = selKey === todayKey;

  const selEvents = events.filter((e) => dkey(e.at) === selKey && shown(ownerOf(e.childId)));
  const selAppts = appts.filter((a) => dkey(a.at) === selKey && shown('mumme'));

  // Timed items (events + appointments) for the day-timeline overview.
  const dayItems: TlItem[] = [
    ...selEvents.map((e) => ({ id: e.id, title: e.title, at: e.at, color: color.primary })),
    ...selAppts.map((a) => ({ id: a.id, title: a.title, at: a.at, color: color.maternalTeal })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  function shift(delta: number) {
    setView((v) => {
      const m = v.m + delta;
      if (m < 0) return { y: v.y - 1, m: 11 };
      if (m > 11) return { y: v.y + 1, m: 0 };
      return { y: v.y, m };
    });
  }
  // Select a day (updates the day detail + keeps the month in sync).
  function selectDay(d: Date) {
    setSel({ y: d.getFullYear(), m: d.getMonth(), d: d.getDate() });
    setView({ y: d.getFullYear(), m: d.getMonth() });
  }
  // A wide, stable range of days for the Week rail so it can momentum-scroll
  // (wheel-style) smoothly in either direction. Index 0 = RAIL_SPAN days ago.
  const railDays = useMemo(() => {
    const base = new Date(); base.setHours(0, 0, 0, 0); base.setDate(base.getDate() - RAIL_SPAN);
    return Array.from({ length: RAIL_SPAN * 2 + 1 }, (_, i) => { const d = new Date(base); d.setDate(base.getDate() + i); return d; });
  }, []);
  const railBase = railDays[0];
  const selRailIndex = Math.round((new Date(sel.y, sel.m, sel.d).getTime() - railBase.getTime()) / 86400000);

  function saveEvent() {
    if (!title.trim()) return;
    const [hh, mm] = time.split(':').map((x) => parseInt(x, 10));
    const at = new Date(sel.y, sel.m, sel.d, isNaN(hh) ? 9 : hh, isNaN(mm) ? 0 : mm).toISOString();
    addEvent({ title, at, childId: activeChild?.id });
    setTitle('');
    setTime('09:00');
    setAddOpen(false);
    toast('Event added');
  }

  // "24 July" for the add-event bar.
  const addDayLabel = new Date(sel.y, sel.m, sel.d)
    .toLocaleDateString(undefined, { day: 'numeric', month: 'long' });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 28, paddingHorizontal: 22, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Weather forecast strip — above the calendar */}
      {wx.location ? (
        <WeatherStrip wx={wx} selKey={selKey} onSelect={(d) => { setView({ y: d.getFullYear(), m: d.getMonth() }); setSel({ y: d.getFullYear(), m: d.getMonth(), d: d.getDate() }); }} onConfigure={() => setWxOpen(true)} />
      ) : null}

      {/* Calendar card */}
      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, paddingTop: 20, paddingHorizontal: 18, paddingBottom: 16 }, shadow.card]}>
        {/* Month nav */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Pressable onPress={() => shift(-1)} hitSlop={10} style={navBtn}>
            <ChevronLeft size={16} color={color.inkSecondary} strokeWidth={2.5} />
          </Pressable>
          <Text style={{ fontFamily: font.display700, fontSize: 17, color: color.ink }}>{monthLabel}</Text>
          <Pressable onPress={() => shift(1)} hitSlop={10} style={navBtn}>
            <ChevronRight size={16} color={color.inkSecondary} strokeWidth={2.5} />
          </Pressable>
        </View>

        {mode === 'Month' ? (
          <MonthGrid
            cells={cells}
            view={view}
            selKey={selKey}
            todayKey={todayKey}
            dayMarks={dayMarks}
            wxForDate={wx.wxForDate}
            onSelect={(d) => setSel({ y: view.y, m: view.m, d })}
          />
        ) : (
          <WeekRail
            days={railDays}
            selRailIndex={selRailIndex}
            selKey={selKey}
            todayKey={todayKey}
            dayMarks={dayMarks}
            wxForDate={wx.wxForDate}
            onSelectDay={selectDay}
          />
        )}

        {/* Footer: whose-calendar filters (full width) + Month/Week switch below */}
        <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: color.hairline }}>
          {owners.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, paddingHorizontal: 1, alignItems: 'center' }}>
              {owners.map((o) => {
                const on = shown(o.key);
                return (
                  <Pressable key={o.key} onPress={() => toggleOwner(o.key)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radius.pill, paddingVertical: 5, paddingLeft: 5, paddingRight: 12, backgroundColor: on ? o.dot : color.canvas, borderWidth: 1, borderColor: on ? o.dot : color.hairline }}>
                    <View style={{ width: 19, height: 19, borderRadius: 9.5, backgroundColor: on ? 'rgba(255,255,255,0.3)' : o.fill, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontFamily: font.display700, fontSize: 10, color: on ? '#fff' : o.ink }}>{o.key === 'mumme' ? '♥' : o.label.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={{ fontFamily: font.body700, fontSize: 11.5, color: on ? '#fff' : color.muted }}>{o.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: owners.length > 1 ? 12 : 0 }}>
            <ModeSwitch mode={mode} onChange={setMode} />
          </View>
        </View>
      </View>

      {/* Add-event bar for the tapped day */}
      <Pressable
        onPress={() => setAddOpen(true)}
        style={{ borderWidth: 1.5, borderColor: '#CFC7DE', borderStyle: 'dashed', backgroundColor: '#FAF8FD', borderRadius: 14, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
      >
        <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.primary }}>+</Text>
        <Text style={{ fontFamily: font.body700, fontSize: 12.5, color: color.primary }}>
          {selIsToday ? 'Add event today' : `Add event on ${addDayLabel}`}
        </Text>
      </Pressable>

      {/* Events (colour-coded per child, editable) */}
      {selEvents.map((ev) => {
        const o = ownerMeta(ownerOf(ev.childId));
        return editId === ev.id
          ? <ScheduleEditForm key={ev.id} owner={o} title={ev.title} at={ev.at} location={ev.location}
              onCancel={() => setEditId(null)}
              onDelete={() => { deleteEvent(ev.id); setEditId(null); }}
              onSave={(p) => { updateEvent(ev.id, p); setEditId(null); toast('Saved'); }} />
          : <ScheduleRow key={ev.id} owner={o} title={ev.title} at={ev.at} location={ev.location} onEdit={() => setEditId(ev.id)} />;
      })}

      {/* Mum&Me appointments (editable) */}
      {selAppts.map((a) => {
        const o = ownerMeta('mumme');
        return editId === a.id
          ? <ScheduleEditForm key={a.id} owner={o} title={a.title} at={a.at} location={a.location} sublabel="Mum&Me"
              onCancel={() => setEditId(null)}
              onDelete={() => { a.source === 'preg' ? deletePregAppt(a.id) : deleteMatAppt(a.id); setEditId(null); }}
              onSave={(p) => { a.source === 'preg' ? updatePregAppt(a.id, { title: p.title, at: p.at, location: p.location }) : updateMatAppt(a.id, { title: p.title, at: p.at }); setEditId(null); }} />
          : <ScheduleRow key={a.id} owner={o} title={a.title} at={a.at} location={a.location} sublabel="Mum&Me" onEdit={() => setEditId(a.id)} />;
      })}

      {/* Empty state */}
      {selEvents.length === 0 && selAppts.length === 0 && (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 20, alignItems: 'center' }, shadow.card]}>
          <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.muted }}>Nothing scheduled on this day.</Text>
        </View>
      )}

      {/* Day timeline overview (ribbon / clock) — below the events */}
      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, gap: 12 }, shadow.card]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>Day overview</Text>
          <View style={{ flexDirection: 'row', backgroundColor: color.canvas, borderRadius: radius.pill, padding: 3 }}>
            {(['ribbon', 'clock'] as const).map((l) => {
              const on = tlLayout === l;
              return (
                <Pressable key={l} onPress={() => setTlLayout(l)} style={{ paddingVertical: 5, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: on ? color.primary : 'transparent' }}>
                  <Text style={{ fontFamily: on ? font.body700 : font.body600, fontSize: 11.5, color: on ? '#fff' : color.muted }}>{l === 'ribbon' ? 'Line' : 'Clock'}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <DayTimeline items={dayItems} layout={tlLayout} unit="event" />
      </View>

      {/* Add event modal */}
      <Modal visible={addOpen} transparent animationType="fade" onRequestClose={() => setAddOpen(false)}>
        <Pressable onPress={() => setAddOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>New event</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>
              {new Date(sel.y, sel.m, sel.d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
            <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. 6-month checkup" autoCapitalize="sentences" />
            <Field label="Time (HH:MM)" value={time} onChangeText={setTime} placeholder="09:00" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setAddOpen(false)} style={{ flex: 1 }} />
              <Button label="Add" onPress={saveEvent} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Weather location modal */}
      <WeatherModal visible={wxOpen} wx={wx} onClose={() => setWxOpen(false)} />
    </ScrollView>
  );
}

/* ── weather chip + location modal ──────────────────────────────────────── */

function WeatherStrip({ wx, selKey, onSelect, onConfigure }: { wx: ReturnType<typeof useWeather>; selKey: string; onSelect: (d: Date) => void; onConfigure: () => void }) {
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => { const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i); return { d, wx: wx.wxForDate(d) }; });
  const have = days.filter((x) => x.wx);
  const t = wx.today;
  const todayLabel = `${today.toLocaleDateString(undefined, { weekday: 'short' })} · ${today.getDate()} ${today.toLocaleDateString(undefined, { month: 'short' })}`;
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: color.muted }}>Weather</Text>
        <Pressable onPress={onConfigure} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 12, color: color.primary }}>Change</Text></Pressable>
      </View>
      {have.length === 0 ? (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, alignItems: 'center' }, shadow.card]}>
          <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>{wx.loading ? 'Loading forecast…' : wx.error || 'No forecast available.'}</Text>
        </View>
      ) : (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, paddingVertical: 13, paddingHorizontal: 14 }, shadow.card]}>
          {/* Today summary */}
          <Pressable onPress={() => onSelect(days[0].d)} style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingBottom: 11, borderBottomWidth: 1, borderBottomColor: color.hairline }}>
            {t ? <WeatherGlyph code={t.code} size={38} /> : null}
            <View style={{ minWidth: 0 }}>
              <Text style={{ fontFamily: font.display700, fontSize: 23, color: color.ink }}>{t ? `${t.tMax}°` : '—'}</Text>
              {t ? <Text style={{ fontFamily: font.body500, fontSize: 11.5, color: color.muted, marginTop: 1 }}>{wxLabel(t.code)}</Text> : null}
            </View>
            <View style={{ marginLeft: 'auto', alignItems: 'flex-end' }}>
              <Text style={{ fontFamily: font.body700, fontSize: 11.5, color: color.inkSecondary }} numberOfLines={1}>{wx.location?.name}</Text>
              <Text style={{ fontFamily: font.body500, fontSize: 11, color: color.muted, marginTop: 1 }}>{todayLabel}</Text>
              {t ? <Text style={{ fontFamily: font.body500, fontSize: 11, color: color.muted, marginTop: 2 }}>H:{t.tMax}° L:{t.tMin}°</Text> : null}
            </View>
          </Pressable>
          {/* Mini 6-day strip */}
          <View style={{ flexDirection: 'row', paddingTop: 10 }}>
            {days.slice(1, 7).map(({ d, wx: w }) => {
              const k = key(d.getFullYear(), d.getMonth(), d.getDate());
              const sel = k === selKey;
              return (
                <Pressable key={k} onPress={() => onSelect(d)} style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4, borderRadius: 10, backgroundColor: sel ? '#F0EEFA' : 'transparent' }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 9.5, color: sel ? color.primary : color.muted }}>{d.toLocaleDateString(undefined, { weekday: 'short' })}</Text>
                  <Text style={{ fontFamily: font.body700, fontSize: 11, color: sel ? color.primary : color.ink }}>{d.getDate()}</Text>
                  {w ? <WeatherGlyph code={w.code} size={17} /> : <Text style={{ fontFamily: font.body400, fontSize: 15, color: color.faint }}>·</Text>}
                  <Text style={{ fontFamily: font.body700, fontSize: 11, color: color.ink }}>{w ? `${w.tMax}°` : '—'}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

function WeatherModal({ visible, wx, onClose }: { visible: boolean; wx: ReturnType<typeof useWeather>; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<WxLocation[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function run() {
    if (!q.trim()) return;
    setBusy(true); setErr(''); setResults([]);
    try { setResults(await searchCity(q)); }
    catch { setErr('Search failed — check your connection.'); }
    finally { setBusy(false); }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
        <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14, maxHeight: '70%' }, shadow.card]}>
          <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Weather location</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, lineHeight: 18 }}>
            Pick a city to show the forecast on your calendar. Only the city is sent — never your personal data.
          </Text>

          {wx.location ? (
            <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 12 }, shadow.card]}>
              {wx.today ? <WeatherGlyph code={wx.today.code} size={20} /> : null}
              <Text style={{ flex: 1, fontFamily: font.body700, fontSize: 14, color: color.ink }}>
                {wx.location.name}{wx.location.admin ? `, ${wx.location.admin}` : ''}
              </Text>
              <Pressable onPress={() => { wx.setLocation(null); }} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 12, color: color.rose }}>Remove</Text></Pressable>
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <Field label="Search city" value={q} onChangeText={setQ} placeholder="e.g. Dublin" autoCapitalize="words" />
            </View>
            <Pressable onPress={run} style={{ backgroundColor: color.primary, borderRadius: radius.tile, paddingHorizontal: 14, height: 46, alignItems: 'center', justifyContent: 'center' }}>
              <Search size={18} color="#fff" />
            </Pressable>
          </View>

          {busy ? <ActivityIndicator color={color.primary} /> : null}
          {err ? <Text style={{ fontFamily: font.body500, fontSize: 12, color: color.rose }}>{err}</Text> : null}

          <ScrollView style={{ maxHeight: 220 }} keyboardShouldPersistTaps="handled">
            <View style={{ gap: 8 }}>
              {results.map((r, i) => (
                <Pressable key={`${r.lat},${r.lon},${i}`} onPress={() => { wx.setLocation(r); onClose(); }} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 13 }, shadow.card]}>
                  <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{r.name}</Text>
                  <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>
                    {[r.admin, r.country].filter(Boolean).join(' · ')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Button label="Done" variant="secondary" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const navBtn = {
  width: 32,
  height: 32,
  backgroundColor: '#F4F3FB',
  borderRadius: 16,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

/* ── month / week grid ──────────────────────────────────────────────────── */

// Trim the full month cell array down to the single week containing `sel`.
// Calendar cell palette — a framed hairline grid with a soft weekend tint.
const GRID_FRAME = '#E7E1EF';
const GRID_LINE = '#EDE8F2';
const WEEKEND_BG = '#F4F1FA';
const TODAY_BG = '#EDEBF9';

function MonthGrid({
  cells,
  view,
  selKey,
  todayKey,
  dayMarks,
  wxForDate,
  onSelect,
}: {
  cells: (number | null)[];
  view: { y: number; m: number };
  selKey: string;
  todayKey: string;
  dayMarks: Map<string, string[]>;
  wxForDate: (d: Date) => DayWx | null;
  onSelect: (d: number) => void;
}) {
  const rows = Math.ceil(cells.length / 7);
  return (
    <View>
      {/* Day headers (weekend dimmed) */}
      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        {WEEKDAYS.map((w, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontFamily: font.body700, fontSize: 10, color: color.muted, opacity: i >= 5 ? 0.4 : 1 }}>{w}</Text>
          </View>
        ))}
      </View>

      {/* Framed hairline grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: GRID_FRAME, borderRadius: 12, overflow: 'hidden' }}>
        {cells.map((d, i) => {
          const col = i % 7;
          const isWeekend = col >= 5;
          const lastRow = i >= (rows - 1) * 7;
          const cellBorder = { borderRightWidth: col === 6 ? 0 : 1, borderBottomWidth: lastRow ? 0 : 1, borderColor: GRID_LINE };
          if (d === null) return <View key={`e${i}`} style={{ width: `${100 / 7}%`, height: 54, backgroundColor: isWeekend ? WEEKEND_BG : 'transparent', ...cellBorder }} />;
          const k = key(view.y, view.m, d);
          const isSel = k === selKey;
          const isToday = k === todayKey;
          const marks = dayMarks.get(k) ?? [];
          const dayWx = wxForDate(new Date(view.y, view.m, d));
          const cellBg = isWeekend ? WEEKEND_BG : 'transparent';
          const numColor = isToday ? '#fff' : isSel ? color.primary : isWeekend ? color.muted : color.ink;
          return (
            <Pressable key={k} onPress={() => onSelect(d)} style={{ width: `${100 / 7}%`, height: 54, backgroundColor: cellBg, ...cellBorder }}>
              {/* whole-cell highlight — filled for today, outlined for the selected day */}
              {isToday ? (
                <View style={{ position: 'absolute', top: 3, left: 3, right: 3, bottom: 3, borderRadius: 9, backgroundColor: color.primary }} />
              ) : isSel ? (
                <View style={{ position: 'absolute', top: 3, left: 3, right: 3, bottom: 3, borderRadius: 9, borderWidth: 1.5, borderColor: color.primary }} />
              ) : null}
              {/* number — top-left */}
              <Text style={{ position: 'absolute', top: 6, left: 8, fontFamily: isToday || isSel ? font.body700 : font.body600, fontSize: 12, color: numColor }}>{d}</Text>
              {/* weather — top-right corner */}
              {dayWx ? <View style={{ position: 'absolute', top: 6, right: 7 }}><WeatherGlyph code={dayWx.code} size={12} /></View> : null}
              {/* item markers — bottom-centre, up to 3 bars + "+N" */}
              {marks.length > 0 && (
                <View style={{ position: 'absolute', bottom: 5, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  {marks.slice(0, 3).map((c, idx) => (
                    <View key={idx} style={{ width: 9, height: 4, borderRadius: 2, backgroundColor: isToday ? '#fff' : c, marginHorizontal: 1.2 }} />
                  ))}
                  {marks.length > 3 ? <Text style={{ fontFamily: font.body700, fontSize: 8, color: isToday ? '#fff' : '#8079a6', marginLeft: 1 }}>+{marks.length - 3}</Text> : null}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ── week rail — a swipeable 7-day column view (Week mode) ───────────────── */

const RAIL_GAP = 5;
const RAIL_VISIBLE = 7;

function WeekRail({ days, selRailIndex, selKey, todayKey, dayMarks, wxForDate, onSelectDay }: {
  days: Date[];
  selRailIndex: number;
  selKey: string;
  todayKey: string;
  dayMarks: Map<string, string[]>;
  wxForDate: (d: Date) => DayWx | null;
  onSelectDay: (d: Date) => void;
}) {
  const scRef = useRef<ScrollView>(null);
  const [cellW, setCellW] = useState(48);
  const lastX = useRef(0);
  const didInit = useRef(false);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const step = cellW + RAIL_GAP;

  const clampLeft = (leftmost: number) => Math.max(0, Math.min(days.length - RAIL_VISIBLE, leftmost));
  const scrollToCentered = (centerIdx: number, animated: boolean, s = step) => {
    scRef.current?.scrollTo({ x: clampLeft(centerIdx - 3) * s, animated });
  };

  const onLayout = (e: NativeSyntheticEvent<{ layout: { width: number } }>) => {
    const w = e.nativeEvent.layout.width;
    const cw = (w - RAIL_GAP * (RAIL_VISIBLE - 1)) / RAIL_VISIBLE;
    setCellW(cw);
    if (!didInit.current) {
      didInit.current = true;
      const s = cw + RAIL_GAP;
      lastX.current = clampLeft(selRailIndex - 3) * s;
      requestAnimationFrame(() => scRef.current?.scrollTo({ x: lastX.current, animated: false }));
    }
  };

  // Wheel settle: once scrolling has been idle briefly, the day nearest the
  // centre of the rail becomes the selected day. Works for drag, fling & wheel.
  const settleAt = (x: number) => {
    const center = Math.max(0, Math.min(days.length - 1, Math.round(x / step) + 3));
    onSelectDay(days[center]);
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    lastX.current = x;
    if (!didInit.current) return;
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => settleAt(x), 130);
  };
  const jumpWeek = (dir: number) => {
    const leftmost = Math.round(lastX.current / step);
    scrollToCentered(clampLeft(leftmost + dir * 7) + 3, true);
  };

  const sideArrow = { width: 24, borderRadius: 12, backgroundColor: color.canvas, alignItems: 'center' as const, justifyContent: 'center' as const, alignSelf: 'stretch' as const };
  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'stretch' }}>
        <Pressable onPress={() => jumpWeek(-1)} hitSlop={6} style={sideArrow}><ChevronLeft size={16} color={color.muted} strokeWidth={2.5} /></Pressable>
        <View style={{ flex: 1 }} onLayout={onLayout}>
          <ScrollView
            ref={scRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={step}
            decelerationRate="normal"
            scrollEventThrottle={16}
            onScroll={onScroll}
            contentContainerStyle={{ gap: RAIL_GAP }}
          >
            {days.map((d, i) => {
              const k = key(d.getFullYear(), d.getMonth(), d.getDate());
              const isSel = k === selKey;
              const isToday = k === todayKey;
              const marks = dayMarks.get(k) ?? [];
              const dayWx = wxForDate(d);
              const isWeekend = ((d.getDay() + 6) % 7) >= 5;
              const bg = isToday ? color.primary : isSel ? '#fff' : isWeekend ? WEEKEND_BG : color.canvas;
              const border = isToday ? color.primary : isSel ? color.primary : GRID_LINE;
              const onWk = isToday;
              return (
                <Pressable key={i} onPress={() => { onSelectDay(d); scrollToCentered(i, true); }} style={{ width: cellW, alignItems: 'center', gap: 3, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 2, minHeight: 100, backgroundColor: bg, borderWidth: isSel && !isToday ? 1.5 : 1, borderColor: border }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 8.5, color: onWk ? 'rgba(255,255,255,0.85)' : isSel ? color.primary : color.faint }}>{isToday ? 'TODAY' : d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3).toUpperCase()}</Text>
                  <Text style={{ fontFamily: font.display700, fontSize: 15, color: onWk ? '#fff' : isWeekend ? color.muted : color.ink }}>{d.getDate()}</Text>
                  {dayWx ? <WeatherGlyph code={dayWx.code} size={15} /> : <View style={{ height: 15 }} />}
                  <View style={{ marginTop: 2, gap: 3, width: '72%' }}>
                    {marks.slice(0, 4).map((c, idx) => <View key={idx} style={{ height: 5, borderRadius: 2, backgroundColor: onWk ? '#fff' : c }} />)}
                    {marks.length > 4 ? <Text style={{ fontFamily: font.body700, fontSize: 8, color: onWk ? '#fff' : '#8079a6', textAlign: 'center' }}>+{marks.length - 4}</Text> : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
        <Pressable onPress={() => jumpWeek(1)} hitSlop={6} style={sideArrow}><ChevronRight size={16} color={color.muted} strokeWidth={2.5} /></Pressable>
      </View>
      <Text style={{ textAlign: 'center', fontFamily: font.body600, fontSize: 10, color: color.faint, marginTop: 9 }}>scroll to glide through days · ‹ › jump a week</Text>
    </View>
  );
}

/* ── Month/Week switch (S1 — flanking labels, cream track) ───────────────── */

function ModeSwitch({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const week = mode === 'Week';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Pressable onPress={() => onChange('Month')} hitSlop={6}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, color: week ? color.muted : color.ink }}>Month</Text>
      </Pressable>
      <Pressable onPress={() => onChange(week ? 'Month' : 'Week')} style={{ width: 44, height: 25, borderRadius: 999, backgroundColor: SWITCH_TRACK, justifyContent: 'center' }}>
        <View style={{ position: 'absolute', top: 3, left: week ? 22 : 3, width: 19, height: 19, borderRadius: 999, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 3, shadowOffset: { width: 0, height: 2 }, elevation: 2 }} />
      </Pressable>
      <Pressable onPress={() => onChange('Week')} hitSlop={6}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, color: week ? color.ink : color.muted }}>Week</Text>
      </Pressable>
    </View>
  );
}

/* ── selected-day cards ─────────────────────────────────────────────────── */

const openInMaps = (loc?: string) => { if (loc) Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`); };

/** An owner-coloured schedule row with an Edit affordance. */
function ScheduleRow({ owner, title, at, location, sublabel, onEdit }: { owner?: Owner; title: string; at: string; location?: string; sublabel?: string; onEdit: () => void }) {
  const c = owner?.dot ?? EVENT_COLOR; const f = owner?.fill ?? fill.lilac; const ink = owner?.ink ?? color.primary;
  return (
    <View style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', gap: 11, alignItems: 'center', overflow: 'hidden' }, shadow.card]}>
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, backgroundColor: c }} />
      <View style={{ width: 36, height: 36, backgroundColor: f, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginLeft: 3 }}>
        <Text style={{ fontFamily: font.display700, fontSize: 14, color: ink }}>{owner?.key === 'mumme' ? '♥' : (owner?.label ?? '?').charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 13.5, color: color.ink }}>{title}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.muted, marginTop: 2 }}>
          {timeOf(at)}{sublabel ? ` · ${sublabel}` : ''}{location ? ' · ' : ''}
          {location ? <Text onPress={() => openInMaps(location)} style={{ fontFamily: font.body700, color: ink }}>📍 {location} ›</Text> : null}
        </Text>
      </View>
      <Pressable onPress={onEdit} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 12, color: color.primary }}>Edit</Text></Pressable>
    </View>
  );
}

/** Inline edit form for a schedule row (title / time / location + delete). */
function ScheduleEditForm({ owner, title, at, location, sublabel, onSave, onCancel, onDelete }: { owner?: Owner; title: string; at: string; location?: string; sublabel?: string; onSave: (p: { title: string; at: string; location?: string }) => void; onCancel: () => void; onDelete: () => void }) {
  const d0 = new Date(at);
  const [t, setT] = useState(title);
  const [tm, setTm] = useState(`${String(d0.getHours()).padStart(2, '0')}:${String(d0.getMinutes()).padStart(2, '0')}`);
  const [loc, setLoc] = useState(location ?? '');
  const save = () => {
    if (!t.trim()) return;
    const [hh, mm] = tm.split(':').map((x) => parseInt(x, 10));
    const at2 = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), isNaN(hh) ? 9 : hh, isNaN(mm) ? 0 : mm).toISOString();
    onSave({ title: t, at: at2, location: loc.trim() || undefined });
  };
  return (
    <View style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 14, gap: 9, borderWidth: 1.5, borderColor: owner?.dot ?? color.primary }]}>
      <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: owner?.ink ?? color.primary }}>Edit · {sublabel ?? owner?.label ?? 'event'}</Text>
      <Field label="Title" value={t} onChangeText={setT} autoCapitalize="sentences" />
      <Field label="Time (HH:MM)" value={tm} onChangeText={setTm} placeholder="09:00" />
      <Field label="Location (optional)" value={loc} onChangeText={setLoc} placeholder="e.g. City Hospital" autoCapitalize="sentences" />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable onPress={onDelete} style={{ backgroundColor: '#FCE8EC', borderRadius: radius.tile, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: font.body700, fontSize: 13, color: '#C0405F' }}>Delete</Text></Pressable>
        <Button label="Cancel" variant="secondary" onPress={onCancel} style={{ flex: 1 }} />
        <Button label="Save" onPress={save} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

function EntryCard({ entry }: { entry: Entry }) {
  const m = ENTRY_META[entry.kind];
  const tile = entryTile(entry.kind);
  const detail = entryDetail(entry);
  const sub = [timeOf(entry.at), detail].filter(Boolean).join(' · ');
  const Icon = tile.Icon;
  return (
    <View style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', gap: 12, alignItems: 'center' }, shadow.card]}>
      <View style={{ width: 40, height: 40, backgroundColor: tile.bg, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={tile.stroke} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink, marginBottom: 3 }}>{m.label}</Text>
        {sub ? <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>{sub}</Text> : null}
      </View>
      <View style={{ width: 8, height: 8, backgroundColor: ENTRY_COLOR, borderRadius: 4 }} />
    </View>
  );
}
