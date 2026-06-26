import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, fill } from '../../src/theme/tokens';
import { ChevronLeft, ChevronRight, Calendar, Shield, Activity, Heart, X, Search } from '../../src/components/icons';
import { Button, Field } from '../../src/components/forms';
import { useData, ENTRY_META, entryDetail, EntryKind, EventItem, Entry } from '../../src/lib/store';
import { useWeather, WeatherGlyph, searchCity, wxColor, type WxLocation, type DayWx } from '../../src/lib/weather';

/* Calendar — Monday-start month grid, view-mode pills, today-filled cell,
 * per-category dots, and rich selected-day rows. Design parity with A04. */

// Monday-start header letters; index 5,6 (Sat, Sun) are weekend → dimmed.
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const VIEWS = ['Month', 'Week', 'Agenda'] as const;
type ViewMode = (typeof VIEWS)[number];

const EVENT_COLOR = color.primary; // periwinkle/lilac for scheduled events
const ENTRY_COLOR = '#3FA98A'; // mint for logged entries

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
  const { entries, events, addEvent, deleteEvent, activeChild } = useData();
  const wx = useWeather();

  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [sel, setSel] = useState({ y: now.getFullYear(), m: now.getMonth(), d: now.getDate() });
  const [mode, setMode] = useState<ViewMode>('Month');
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [wxOpen, setWxOpen] = useState(false);

  const selKey = key(sel.y, sel.m, sel.d);
  const entryDays = new Set(entries.map((e) => dkey(e.at)));
  const eventDays = new Set(events.map((e) => dkey(e.at)));

  const firstWeekday = monIndex(new Date(view.y, view.m, 1).getDay());
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = new Date(view.y, view.m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const todayKey = key(now.getFullYear(), now.getMonth(), now.getDate());
  const selIsToday = selKey === todayKey;

  const selEvents = events.filter((e) => dkey(e.at) === selKey);
  const selEntries = entries.filter((e) => dkey(e.at) === selKey);

  // Agenda mode: upcoming events in the viewed month (and beyond), sorted ascending.
  const agendaEvents = [...events]
    .filter((e) => new Date(e.at) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  function shift(delta: number) {
    setView((v) => {
      const m = v.m + delta;
      if (m < 0) return { y: v.y - 1, m: 11 };
      if (m > 11) return { y: v.y + 1, m: 0 };
      return { y: v.y, m };
    });
  }

  function saveEvent() {
    if (!title.trim()) return;
    const [hh, mm] = time.split(':').map((x) => parseInt(x, 10));
    const at = new Date(sel.y, sel.m, sel.d, isNaN(hh) ? 9 : hh, isNaN(mm) ? 0 : mm).toISOString();
    addEvent({ title, at, childId: activeChild?.id });
    setTitle('');
    setTime('09:00');
    setAddOpen(false);
  }

  const selDateLabel = new Date(sel.y, sel.m, sel.d)
    .toLocaleDateString(undefined, { month: 'long', day: 'numeric' });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 28, paddingHorizontal: 22, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
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

        {/* View-mode pills */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
          {VIEWS.map((v) => {
            const active = mode === v;
            return (
              <Pressable
                key={v}
                onPress={() => setMode(v)}
                style={{
                  backgroundColor: active ? color.primary : color.canvas,
                  borderRadius: radius.pill,
                  paddingVertical: 6,
                  paddingHorizontal: 16,
                  borderWidth: active ? 0 : 1,
                  borderColor: color.hairline,
                }}
              >
                <Text style={{ fontFamily: active ? font.body700 : font.body600, fontSize: 11, color: active ? '#fff' : color.inkSecondary }}>
                  {v}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {mode === 'Month' || mode === 'Week' ? (
          <MonthGrid
            cells={mode === 'Week' ? weekCells(cells, sel, view) : cells}
            view={view}
            selKey={selKey}
            todayKey={todayKey}
            entryDays={entryDays}
            eventDays={eventDays}
            wxForDate={wx.wxForDate}
            onSelect={(d) => setSel({ y: view.y, m: view.m, d })}
          />
        ) : (
          <AgendaList
            events={agendaEvents}
            onSelect={(e) => {
              const d = new Date(e.at);
              setView({ y: d.getFullYear(), m: d.getMonth() });
              setSel({ y: d.getFullYear(), m: d.getMonth(), d: d.getDate() });
            }}
          />
        )}
      </View>

      {/* Selected-day header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: color.muted }}>
          {selIsToday ? 'Today · ' : ''}{selDateLabel}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <WeatherChip wx={wx} selDate={new Date(sel.y, sel.m, sel.d)} onPress={() => setWxOpen(true)} />
          <Pressable onPress={() => setAddOpen(true)} hitSlop={8}>
            <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.primary }}>+ Event</Text>
          </Pressable>
        </View>
      </View>

      {/* Events */}
      {selEvents.map((ev) => (
        <EventCard key={ev.id} ev={ev} onDelete={() => deleteEvent(ev.id)} />
      ))}

      {/* Logged entries */}
      {selEntries.map((e) => (
        <EntryCard key={e.id} entry={e} />
      ))}

      {/* Empty state */}
      {selEvents.length === 0 && selEntries.length === 0 && (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 20, alignItems: 'center' }, shadow.card]}>
          <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.muted }}>Nothing on this day.</Text>
        </View>
      )}

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

function WeatherChip({ wx, selDate, onPress }: { wx: ReturnType<typeof useWeather>; selDate: Date; onPress: () => void }) {
  if (!wx.location) {
    return (
      <Pressable onPress={onPress} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.muted }}>+ Weather</Text>
      </Pressable>
    );
  }
  const d: DayWx | null = wx.wxForDate(selDate) ?? wx.today;
  return (
    <Pressable onPress={onPress} hitSlop={8} style={[{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: 10 }, shadow.card]}>
      {d ? <WeatherGlyph code={d.code} size={16} /> : null}
      <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.inkSecondary }}>
        {d ? `${d.tMax}°` : wx.location.name}
      </Text>
      <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted }} numberOfLines={1}>{wx.location.name}</Text>
    </Pressable>
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
function weekCells(cells: (number | null)[], sel: { d: number }, view: { y: number; m: number }) {
  const idx = cells.findIndex((c) => c === sel.d);
  if (idx < 0) return cells.slice(0, 7);
  const start = Math.floor(idx / 7) * 7;
  return cells.slice(start, start + 7);
}

function MonthGrid({
  cells,
  view,
  selKey,
  todayKey,
  entryDays,
  eventDays,
  wxForDate,
  onSelect,
}: {
  cells: (number | null)[];
  view: { y: number; m: number };
  selKey: string;
  todayKey: string;
  entryDays: Set<string>;
  eventDays: Set<string>;
  wxForDate: (d: Date) => DayWx | null;
  onSelect: (d: number) => void;
}) {
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

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((d, i) => {
          const isWeekend = i % 7 >= 5;
          if (d === null) return <View key={`e${i}`} style={{ width: `${100 / 7}%`, height: 46 }} />;
          const k = key(view.y, view.m, d);
          const isSel = k === selKey;
          const isToday = k === todayKey;
          const hasEntry = entryDays.has(k);
          const hasEvent = eventDays.has(k);
          const dayWx = wxForDate(new Date(view.y, view.m, d));
          return (
            <Pressable key={k} onPress={() => onSelect(d)} style={{ width: `${100 / 7}%`, height: 52, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 1 }}>
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isToday ? color.primary : isSel ? color.canvas : 'transparent',
                  borderWidth: isSel && !isToday ? 1.5 : 0,
                  borderColor: color.primary,
                }}
              >
                <Text
                  style={{
                    fontFamily: isToday ? font.body700 : font.body500,
                    fontSize: 13,
                    color: isToday ? '#fff' : isWeekend ? color.muted : color.ink,
                  }}
                >
                  {d}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 1, height: 16 }}>
                {dayWx ? <WeatherGlyph code={dayWx.code} size={13} /> : null}
                {hasEvent ? <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: EVENT_COLOR }} /> : null}
                {hasEntry ? <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: ENTRY_COLOR }} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ── agenda list (inside card) ──────────────────────────────────────────── */

function AgendaList({ events, onSelect }: { events: EventItem[]; onSelect: (e: EventItem) => void }) {
  if (events.length === 0) {
    return (
      <View style={{ paddingVertical: 24, alignItems: 'center' }}>
        <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.muted }}>No upcoming events.</Text>
      </View>
    );
  }
  return (
    <View style={{ gap: 10, paddingTop: 4 }}>
      {events.map((ev) => {
        const d = new Date(ev.at);
        const day = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        return (
          <Pressable key={ev.id} onPress={() => onSelect(ev)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, backgroundColor: fill.lilac, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} color={EVENT_COLOR} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink, marginBottom: 2 }}>{ev.title}</Text>
              <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>
                {day} · {timeOf(ev.at)}
              </Text>
            </View>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: EVENT_COLOR }} />
          </Pressable>
        );
      })}
    </View>
  );
}

/* ── selected-day cards ─────────────────────────────────────────────────── */

function EventCard({ ev, onDelete }: { ev: EventItem; onDelete: () => void }) {
  const sub = [timeOf(ev.at), ev.location].filter(Boolean).join(' · ');
  return (
    <View style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', gap: 12, alignItems: 'center' }, shadow.card]}>
      <View style={{ width: 40, height: 40, backgroundColor: fill.lilac, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
        <Calendar size={18} color={EVENT_COLOR} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink, marginBottom: 3 }}>{ev.title}</Text>
        {sub ? <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>{sub}</Text> : null}
      </View>
      <View style={{ width: 8, height: 8, backgroundColor: EVENT_COLOR, borderRadius: 4 }} />
      <Pressable onPress={onDelete} hitSlop={8} style={{ paddingLeft: 8 }}>
        <X size={16} color={color.faint} />
      </Pressable>
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
