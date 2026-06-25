import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { ChevronLeft, ChevronRight } from '../../src/components/icons';
import { Button, Field } from '../../src/components/forms';
import { useData, ENTRY_META, entryDetail } from '../../src/lib/store';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const key = (y: number, m: number, d: number) => `${y}-${m}-${d}`;
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const dkey = (iso: string) => { const d = new Date(iso); return key(d.getFullYear(), d.getMonth(), d.getDate()); };

export default function CalendarTab() {
  const insets = useSafeAreaInsets();
  const { entries, events, addEvent, deleteEvent, activeChild } = useData();

  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [sel, setSel] = useState({ y: now.getFullYear(), m: now.getMonth(), d: now.getDate() });
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');

  const selKey = key(sel.y, sel.m, sel.d);
  const entryDays = new Set(entries.map((e) => dkey(e.at)));
  const eventDays = new Set(events.map((e) => dkey(e.at)));

  const firstWeekday = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = new Date(view.y, view.m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const todayKey = key(now.getFullYear(), now.getMonth(), now.getDate());

  const selEvents = events.filter((e) => dkey(e.at) === selKey);
  const selEntries = entries.filter((e) => dkey(e.at) === selKey);

  function shift(delta: number) {
    setView((v) => { const m = v.m + delta; if (m < 0) return { y: v.y - 1, m: 11 }; if (m > 11) return { y: v.y + 1, m: 0 }; return { y: v.y, m }; });
  }
  function saveEvent() {
    if (!title.trim()) return;
    const [hh, mm] = time.split(':').map((x) => parseInt(x, 10));
    const at = new Date(sel.y, sel.m, sel.d, isNaN(hh) ? 9 : hh, isNaN(mm) ? 0 : mm).toISOString();
    addEvent({ title, at, childId: activeChild?.id });
    setTitle(''); setTime('09:00'); setAddOpen(false);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 28, paddingHorizontal: 22, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink }}>Calendar</Text>
        <Pressable onPress={() => setAddOpen(true)} style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: color.primary }}>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: '#fff' }}>+ Event</Text>
        </Pressable>
      </View>

      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16 }, shadow.card]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Pressable onPress={() => shift(-1)} hitSlop={10} style={{ padding: 4 }}><ChevronLeft size={20} color={color.muted} /></Pressable>
          <Text style={{ fontFamily: font.display700, fontSize: 16, color: color.ink }}>{monthLabel}</Text>
          <Pressable onPress={() => shift(1)} hitSlop={10} style={{ padding: 4 }}><ChevronRight size={20} color={color.muted} /></Pressable>
        </View>

        <View style={{ flexDirection: 'row' }}>
          {WEEKDAYS.map((w, i) => (
            <Text key={i} style={{ flex: 1, textAlign: 'center', fontFamily: font.body700, fontSize: 11, color: color.muted }}>{w}</Text>
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {cells.map((d, i) => {
            if (d === null) return <View key={`e${i}`} style={{ width: `${100 / 7}%`, height: 46 }} />;
            const k = key(view.y, view.m, d);
            const isSel = k === selKey;
            const isToday = k === todayKey;
            const hasEntry = entryDays.has(k);
            const hasEvent = eventDays.has(k);
            return (
              <Pressable key={k} onPress={() => setSel({ y: view.y, m: view.m, d })} style={{ width: `${100 / 7}%`, height: 46, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: isSel ? color.primary : 'transparent', borderWidth: isToday && !isSel ? 1.5 : 0, borderColor: color.primary }}>
                  <Text style={{ fontFamily: font.body600, fontSize: 14, color: isSel ? '#fff' : color.ink }}>{d}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 3, marginTop: 2, height: 5 }}>
                  {hasEvent ? <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: color.primary }} /> : null}
                  {hasEntry ? <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: color.accentRose }} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Selected day: events then entries */}
      {selEvents.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Events</Text>
          {selEvents.map((ev) => (
            <View key={ev.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color.primary }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{ev.title}</Text>
                {ev.location ? <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>{ev.location}</Text> : null}
              </View>
              <Text style={{ fontFamily: font.body500, fontSize: 12, color: color.muted }}>{timeOf(ev.at)}</Text>
              <Pressable onPress={() => deleteEvent(ev.id)} hitSlop={8} style={{ paddingHorizontal: 6 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>
          {selEntries.length} logged {selEntries.length === 1 ? 'entry' : 'entries'}
        </Text>
        {selEntries.length === 0 && selEvents.length === 0 ? (
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 20, alignItems: 'center' }, shadow.card]}>
            <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.muted }}>Nothing on this day.</Text>
          </View>
        ) : (
          selEntries.map((e) => {
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
              </View>
            );
          })
        )}
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
    </ScrollView>
  );
}
