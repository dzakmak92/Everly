import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { color, font, radius, shadow } from '../theme/tokens';
import { Clock } from './icons';

/**
 * When-did-this-happen control for logging. Stores/returns a full ISO datetime.
 * Built for one-handed, tired-parent use: it defaults to "Now", but the 2am feed
 * you're logging at 7am is two taps away — quick offset chips, Today/Yesterday,
 * and hour/minute steppers, no keyboard required.
 */

function labelFor(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Now';
  const now = new Date();
  const t = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (Math.abs(now.getTime() - d.getTime()) < 90000) return 'Now';
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return `Today · ${t}`;
  if (d.toDateString() === y.toDateString()) return `Yesterday · ${t}`;
  return `${d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })} · ${t}`;
}

const OFFSETS: { label: string; min: number }[] = [
  { label: 'Now', min: 0 },
  { label: '−15m', min: 15 },
  { label: '−30m', min: 30 },
  { label: '−1h', min: 60 },
  { label: '−2h', min: 120 },
  { label: '−3h', min: 180 },
];

export function TimeField({ value, onChange, label = 'Time' }: {
  value: string;
  onChange: (iso: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const d = (() => { const x = new Date(value); return isNaN(x.getTime()) ? new Date() : x; })();

  const emit = (next: Date) => onChange(next.toISOString());
  const setOffset = (min: number) => emit(new Date(Date.now() - min * 60000));
  const shiftHour = (delta: number) => { const n = new Date(d); n.setHours(n.getHours() + delta); emit(n); };
  const shiftMin = (delta: number) => { const n = new Date(d); n.setMinutes(n.getMinutes() + delta); emit(n); };
  const setDay = (which: 'today' | 'yesterday') => {
    const base = new Date(); if (which === 'yesterday') base.setDate(base.getDate() - 1);
    const n = new Date(d); n.setFullYear(base.getFullYear(), base.getMonth(), base.getDate()); emit(n);
  };

  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  const isYest = d.toDateString() === yest.toDateString();

  return (
    <View style={{ gap: 7 }}>
      <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: color.muted }}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={{ backgroundColor: '#fff', borderRadius: radius.tile, borderWidth: 1, borderColor: color.hairline, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}
      >
        <Clock size={17} color={color.primary} />
        <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 15, color: color.ink }}>{labelFor(value)}</Text>
        <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>Change</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.4)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>When was this?</Text>

            {/* Big current value */}
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Text style={{ fontFamily: font.display700, fontSize: 30, color: color.ink }}>
                {d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </Text>
              <Text style={{ fontFamily: font.body600, fontSize: 12.5, color: color.muted }}>
                {isToday ? 'Today' : isYest ? 'Yesterday' : d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
              </Text>
            </View>

            {/* Quick offsets from now */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
              {OFFSETS.map((o) => (
                <Pressable key={o.label} onPress={() => setOffset(o.min)} style={{ paddingVertical: 8, paddingHorizontal: 13, borderRadius: radius.pill, backgroundColor: '#fff', borderWidth: 1, borderColor: color.hairline }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 12.5, color: color.ink }}>{o.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* Hour / minute steppers */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Stepper label="Hour" onMinus={() => shiftHour(-1)} onPlus={() => shiftHour(1)} />
              <Stepper label="Min · 5" onMinus={() => shiftMin(-5)} onPlus={() => shiftMin(5)} />
            </View>

            {/* Day toggle */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['today', 'yesterday'] as const).map((w) => {
                const on = w === 'today' ? isToday : isYest;
                return (
                  <Pressable key={w} onPress={() => setDay(w)} style={{ flex: 1, paddingVertical: 10, borderRadius: radius.tile, alignItems: 'center', backgroundColor: on ? color.primary : '#fff', borderWidth: 1, borderColor: on ? color.primary : color.hairline }}>
                    <Text style={{ fontFamily: font.body700, fontSize: 13, color: on ? '#fff' : color.ink }}>{w === 'today' ? 'Today' : 'Yesterday'}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable onPress={() => setOpen(false)} style={{ backgroundColor: color.primary, borderRadius: radius.tile, paddingVertical: 13, alignItems: 'center' }}>
              <Text style={{ fontFamily: font.body700, fontSize: 15, color: '#fff' }}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function Stepper({ label, onMinus, onPlus }: { label: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <View style={{ flex: 1, gap: 5 }}>
      <Text style={{ fontFamily: font.body700, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: color.muted, textAlign: 'center' }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: radius.tile, borderWidth: 1, borderColor: color.hairline, paddingHorizontal: 6, paddingVertical: 5 }}>
        <Pressable onPress={onMinus} hitSlop={8} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: color.canvas, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: font.body700, fontSize: 20, color: color.primary }}>−</Text>
        </Pressable>
        <Pressable onPress={onPlus} hitSlop={8} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: color.canvas, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: font.body700, fontSize: 20, color: color.primary }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}
