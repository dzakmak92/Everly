import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { color, font, radius, shadow } from '../theme/tokens';
import { ChevronLeft, ChevronRight, Calendar } from './icons';

/**
 * Tap-to-pick date input — a drop-in for the text `Field` used for dates.
 * Stores/returns an ISO `YYYY-MM-DD` string (the format the app already uses),
 * so it works on web and native with no extra dependencies.
 */

const pad = (n: number) => String(n).padStart(2, '0');
const toKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const monIndex = (jsDay: number) => (jsDay + 6) % 7;

function parseISO(v?: string) {
  if (!v) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v.trim());
  if (!m) return null;
  const y = +m[1], mo = +m[2] - 1, d = +m[3];
  const dt = new Date(y, mo, d);
  return Number.isNaN(dt.getTime()) ? null : { y, mo, d };
}
function pretty(v?: string) {
  const p = parseISO(v);
  if (!p) return '';
  return new Date(p.y, p.mo, p.d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function DateField({
  label,
  value,
  onChangeText,
  placeholder = 'Select a date',
  optional,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  optional?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const now = new Date();
  const [view, setView] = useState(() => {
    const s = parseISO(value);
    return s ? { y: s.y, m: s.mo } : { y: now.getFullYear(), m: now.getMonth() };
  });

  function openPicker() {
    const s = parseISO(value);
    setView(s ? { y: s.y, m: s.mo } : { y: now.getFullYear(), m: now.getMonth() });
    setOpen(true);
  }
  function shiftMonth(delta: number) {
    setView((v) => {
      const m = v.m + delta;
      if (m < 0) return { y: v.y - 1, m: 11 };
      if (m > 11) return { y: v.y + 1, m: 0 };
      return { y: v.y, m };
    });
  }
  function pick(d: number) {
    onChangeText(toKey(view.y, view.m, d));
    setOpen(false);
  }

  const sel = parseISO(value);
  const todayKey = toKey(now.getFullYear(), now.getMonth(), now.getDate());
  const firstWeekday = monIndex(new Date(view.y, view.m, 1).getDay());
  const dim = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);
  const monthLabel = new Date(view.y, view.m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <View style={{ gap: 7 }}>
      <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: color.muted }}>{label}</Text>
      <Pressable
        onPress={openPicker}
        style={{ backgroundColor: '#fff', borderRadius: radius.tile, borderWidth: 1, borderColor: color.hairline, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}
      >
        <Text style={{ flex: 1, fontFamily: font.body500, fontSize: 15, color: value ? color.ink : color.faint }}>
          {value ? pretty(value) || value : placeholder}
        </Text>
        <Calendar size={18} color={color.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.4)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, gap: 10 }, shadow.card]}>
            {/* header: ‹‹ year · ‹ month · title · month › · year ›› */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', gap: 2 }}>
                <NavBtn onPress={() => setView((v) => ({ ...v, y: v.y - 1 }))}><Text style={chev}>«</Text></NavBtn>
                <NavBtn onPress={() => shiftMonth(-1)}><ChevronLeft size={16} color={color.inkSecondary} strokeWidth={2.5} /></NavBtn>
              </View>
              <Text style={{ fontFamily: font.display700, fontSize: 16, color: color.ink }}>{monthLabel}</Text>
              <View style={{ flexDirection: 'row', gap: 2 }}>
                <NavBtn onPress={() => shiftMonth(1)}><ChevronRight size={16} color={color.inkSecondary} strokeWidth={2.5} /></NavBtn>
                <NavBtn onPress={() => setView((v) => ({ ...v, y: v.y + 1 }))}><Text style={chev}>»</Text></NavBtn>
              </View>
            </View>

            {/* weekday row */}
            <View style={{ flexDirection: 'row' }}>
              {WEEK.map((w, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 10, color: color.muted, opacity: i >= 5 ? 0.4 : 1 }}>{w}</Text>
                </View>
              ))}
            </View>

            {/* grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {cells.map((d, i) => {
                if (d === null) return <View key={`e${i}`} style={{ width: `${100 / 7}%`, height: 40 }} />;
                const k = toKey(view.y, view.m, d);
                const isSel = !!sel && sel.y === view.y && sel.mo === view.m && sel.d === d;
                const isToday = k === todayKey;
                const weekend = i % 7 >= 5;
                return (
                  <Pressable key={k} onPress={() => pick(d)} style={{ width: `${100 / 7}%`, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: isSel ? color.primary : 'transparent', borderWidth: isToday && !isSel ? 1.5 : 0, borderColor: color.primary }}>
                      <Text style={{ fontFamily: isSel || isToday ? font.body700 : font.body500, fontSize: 13.5, color: isSel ? '#fff' : weekend ? color.muted : color.ink }}>{d}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
              <Pressable onPress={() => { onChangeText(todayKey); setOpen(false); }} hitSlop={6} style={{ paddingVertical: 6 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>Today</Text>
              </Pressable>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                {optional && value ? (
                  <Pressable onPress={() => { onChangeText(''); setOpen(false); }} hitSlop={6} style={{ paddingVertical: 6 }}>
                    <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.rose }}>Clear</Text>
                  </Pressable>
                ) : null}
                <Pressable onPress={() => setOpen(false)} hitSlop={6} style={{ paddingVertical: 6 }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.muted }}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const chev = { fontFamily: font.body700, fontSize: 17, color: color.inkSecondary } as const;

function NavBtn({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F4F3FB', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </Pressable>
  );
}
