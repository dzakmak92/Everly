import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal, ActivityIndicator, Linking } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, fill, childToken } from '../../../src/theme/tokens';
import { ChevronLeft, ChevronRight, Calendar, Shield, Activity, Heart, X, Search, BabyBean } from '../../../src/components/icons';
import { Button, Field } from '../../../src/components/forms';
import { useData, ENTRY_META, entryDetail, EntryKind, EventItem, Entry } from '../../../src/lib/store';
import { useWeather, WeatherGlyph, searchCity, wxColor, type WxLocation, type DayWx } from '../../../src/lib/weather';

/* Calendar — Monday-start month grid, view-mode pills, today-filled cell,
 * per-category dots, and rich selected-day rows. Design parity with A04. */

// Monday-start header letters; index 5,6 (Sat, Sun) are weekend → dimmed.
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const VIEWS = ['Month', 'Week', 'Agenda'] as const;
type ViewMode = (typeof VIEWS)[number];

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
    ...(events.some((e) => !e.childId) ? [{ key: 'family', label: 'Family', dot: EVENT_COLOR, fill: fill.lilac, ink: color.primary }] : []),
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
  // Day-membership sets, filtered by the module selector.
  const entryDays = new Set(entries.filter((e) => shown(ownerOf(e.childId))).map((e) => dkey(e.at)));
  const eventDays = new Set(events.filter((e) => shown(ownerOf(e.childId))).map((e) => dkey(e.at)));
  const apptDays = new Set(shown('mumme') ? appts.map((a) => dkey(a.at)) : []);

  const firstWeekday = monIndex(new Date(view.y, view.m, 1).getDay());
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = new Date(view.y, view.m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const todayKey = key(now.getFullYear(), now.getMonth(), now.getDate());
  const selIsToday = selKey === todayKey;

  const selEvents = events.filter((e) => dkey(e.at) === selKey && shown(ownerOf(e.childId)));
  const selEntries = entries.filter((e) => dkey(e.at) === selKey && shown(ownerOf(e.childId)));
  const selAppts = appts.filter((a) => dkey(a.at) === selKey && shown('mumme'));

  // Timed items (events + appointments) for the day-timeline overview.
  const dayItems: TlItem[] = [
    ...selEvents.map((e) => ({ id: e.id, title: e.title, at: e.at, color: color.primary })),
    ...selAppts.map((a) => ({ id: a.id, title: a.title, at: a.at, color: color.maternalTeal })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  // Agenda mode: upcoming events in the viewed month (and beyond), sorted ascending.
  const agendaEvents = [...events]
    .filter((e) => new Date(e.at) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()) && shown(ownerOf(e.childId)))
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
            apptDays={apptDays}
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

      {/* Module selector pills — between the calendar and the selected-day section */}
      {owners.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, paddingHorizontal: 2 }}>
          <Pressable onPress={() => setHidden(new Set())} style={[{ borderRadius: radius.pill, paddingVertical: 7, paddingHorizontal: 14, backgroundColor: hidden.size === 0 ? color.primary : '#fff' }, shadow.card]}>
            <Text style={{ fontFamily: font.body700, fontSize: 11.5, color: hidden.size === 0 ? '#fff' : color.muted }}>All</Text>
          </Pressable>
          {owners.map((o) => {
            const on = shown(o.key);
            return (
              <Pressable key={o.key} onPress={() => toggleOwner(o.key)} style={[{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radius.pill, paddingVertical: 7, paddingLeft: 7, paddingRight: 13, backgroundColor: on ? o.dot : '#fff' }, shadow.card]}>
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: on ? 'rgba(255,255,255,0.28)' : o.fill, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: font.display700, fontSize: 10, color: on ? '#fff' : o.ink }}>{o.key === 'mumme' ? '♥' : o.label.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={{ fontFamily: font.body700, fontSize: 11.5, color: on ? '#fff' : color.muted }}>{o.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

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

      {/* Day timeline overview (ribbon / clock) */}
      {dayItems.length > 0 && (
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
          <DayTimeline items={dayItems} layout={tlLayout} />
        </View>
      )}

      {/* Events (colour-coded per child, editable) */}
      {selEvents.map((ev) => {
        const o = ownerMeta(ownerOf(ev.childId));
        return editId === ev.id
          ? <ScheduleEditForm key={ev.id} owner={o} title={ev.title} at={ev.at} location={ev.location}
              onCancel={() => setEditId(null)}
              onDelete={() => { deleteEvent(ev.id); setEditId(null); }}
              onSave={(p) => { updateEvent(ev.id, p); setEditId(null); }} />
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

      {/* Logged entries (read-only) */}
      {selEntries.map((e) => (
        <EntryCard key={e.id} entry={e} />
      ))}

      {/* Empty state */}
      {selEvents.length === 0 && selEntries.length === 0 && selAppts.length === 0 && (
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

/* ── day timeline overview (ribbon / clock) ─────────────────────────────── */

type TlItem = { id: string; title: string; at: string; color: string };
const tlTime = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

function DayTimeline({ items, layout }: { items: TlItem[]; layout: 'ribbon' | 'clock' }) {
  return layout === 'clock' ? <ClockTimeline items={items} /> : <RibbonTimeline items={items} />;
}

function RibbonTimeline({ items }: { items: TlItem[] }) {
  const hrs = items.map((i) => { const d = new Date(i.at); return d.getHours() + d.getMinutes() / 60; });
  const lo = Math.max(0, Math.min(7, Math.floor(Math.min(...hrs))));
  const hi = Math.min(24, Math.max(20, Math.ceil(Math.max(...hrs))));
  const span = hi - lo || 1;
  const pct = (h: number): `${number}%` => `${((h - lo) / span) * 100}%`;
  const now = new Date(); const nowH = now.getHours() + now.getMinutes() / 60;
  const ticks: number[] = []; for (let h = Math.ceil(lo / 4) * 4; h <= hi; h += 4) ticks.push(h);
  return (
    <View style={{ height: 62, position: 'relative', marginHorizontal: 14 }}>
      <View style={{ position: 'absolute', top: 34, left: 0, right: 0, height: 4, borderRadius: 2, backgroundColor: color.hairline }} />
      {ticks.map((h) => (
        <Text key={h} style={{ position: 'absolute', top: 44, left: pct(h), marginLeft: -16, width: 32, textAlign: 'center', fontFamily: font.body600, fontSize: 9.5, color: color.faint }}>{h === 24 ? '24:00' : `${h}:00`}</Text>
      ))}
      {nowH >= lo && nowH <= hi && (
        <View style={{ position: 'absolute', top: 27, left: pct(nowH), width: 2, height: 18, marginLeft: -1, backgroundColor: color.rose }} />
      )}
      {items.map((it, i) => (
        <React.Fragment key={it.id}>
          <Text style={{ position: 'absolute', top: 4, left: pct(hrs[i]), marginLeft: -20, width: 40, textAlign: 'center', fontFamily: font.body700, fontSize: 9.5, color: it.color }} numberOfLines={1}>{tlTime(it.at)}</Text>
          <View style={{ position: 'absolute', top: 26, left: pct(hrs[i]), marginLeft: -9, width: 18, height: 18, borderRadius: 9, backgroundColor: it.color, borderWidth: 3, borderColor: '#fff' }} />
        </React.Fragment>
      ))}
    </View>
  );
}

function ClockTimeline({ items }: { items: TlItem[] }) {
  const cx = 100, cy = 100, R = 78;
  const angle = (h: number) => (h / 24) * 2 * Math.PI - Math.PI / 2;
  return (
    <View style={{ alignItems: 'center', gap: 12 }}>
      <Svg width={196} height={196} viewBox="0 0 200 200">
        <Circle cx={cx} cy={cy} r={R} fill="none" stroke={color.hairline} strokeWidth={9} />
        {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => {
          const a = angle(h);
          return <Line key={h} x1={cx + (R - 8) * Math.cos(a)} y1={cy + (R - 8) * Math.sin(a)} x2={cx + (R + 8) * Math.cos(a)} y2={cy + (R + 8) * Math.sin(a)} stroke={color.faint} strokeWidth={2} />;
        })}
        {([[0, '12'], [6, '3'], [12, '6'], [18, '9']] as const).map(([h, label]) => {
          const a = angle(h);
          return <SvgText key={h} x={cx + (R - 22) * Math.cos(a)} y={cy + (R - 22) * Math.sin(a) + 4} fontSize={10} fill={color.muted} textAnchor="middle">{label}</SvgText>;
        })}
        <SvgText x={cx} y={cy - 1} fontSize={26} fontWeight="700" fill={color.ink} textAnchor="middle">{String(items.length)}</SvgText>
        <SvgText x={cx} y={cy + 16} fontSize={11} fill={color.muted} textAnchor="middle">{items.length === 1 ? 'event' : 'events'}</SvgText>
        {items.map((it) => {
          const d = new Date(it.at); const h = d.getHours() + d.getMinutes() / 60; const a = angle(h);
          return <Circle key={it.id} cx={cx + R * Math.cos(a)} cy={cy + R * Math.sin(a)} r={8} fill={it.color} stroke="#fff" strokeWidth={3} />;
        })}
      </Svg>
      <View style={{ alignSelf: 'stretch', gap: 7 }}>
        {items.map((it) => (
          <View key={it.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: it.color }} />
            <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.muted, width: 64 }}>{tlTime(it.at)}</Text>
            <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 13, color: color.ink }} numberOfLines={1}>{it.title}</Text>
          </View>
        ))}
      </View>
    </View>
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

function WeatherStrip({ wx, selKey, onSelect, onConfigure }: { wx: ReturnType<typeof useWeather>; selKey: string; onSelect: (d: Date) => void; onConfigure: () => void }) {
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => { const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i); return { d, wx: wx.wxForDate(d) }; });
  const have = days.filter((x) => x.wx);
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: color.muted }}>
          Forecast · {wx.location?.name}
        </Text>
        <Pressable onPress={onConfigure} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 12, color: color.primary }}>Change</Text></Pressable>
      </View>
      {have.length === 0 ? (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, alignItems: 'center' }, shadow.card]}>
          <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>{wx.loading ? 'Loading forecast…' : wx.error || 'No forecast available.'}</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 4, paddingVertical: 2 }}>
          {days.map(({ d, wx: w }, i) => {
            const k = key(d.getFullYear(), d.getMonth(), d.getDate());
            const sel = k === selKey;
            const label = i === 0 ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'short' });
            return (
              <Pressable key={k} onPress={() => onSelect(d)} style={[{ width: 74, borderRadius: radius.card, paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', gap: 8, backgroundColor: sel ? color.primary : '#fff' }, shadow.card]}>
                <Text style={{ fontFamily: font.body700, fontSize: 12, color: sel ? '#fff' : color.inkSecondary }}>{label}</Text>
                {w ? <WeatherGlyph code={w.code} size={32} color={sel ? '#fff' : undefined} /> : <Text style={{ fontFamily: font.body400, fontSize: 22, color: sel ? '#fff' : color.faint }}>·</Text>}
                {w ? (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontFamily: font.display700, fontSize: 16, color: sel ? '#fff' : color.ink }}>{w.tMax}°</Text>
                    <Text style={{ fontFamily: font.body500, fontSize: 12, color: sel ? 'rgba(255,255,255,0.8)' : color.muted }}>{w.tMin}°</Text>
                  </View>
                ) : <Text style={{ fontFamily: font.body500, fontSize: 12, color: sel ? 'rgba(255,255,255,0.8)' : color.faint }}>—</Text>}
              </Pressable>
            );
          })}
        </ScrollView>
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
  apptDays,
  wxForDate,
  onSelect,
}: {
  cells: (number | null)[];
  view: { y: number; m: number };
  selKey: string;
  todayKey: string;
  entryDays: Set<string>;
  eventDays: Set<string>;
  apptDays: Set<string>;
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
          const hasAppt = apptDays.has(k);
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
                {hasAppt ? <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: APPT_COLOR }} /> : null}
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
