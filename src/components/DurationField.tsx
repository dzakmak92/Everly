import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Modal, PanResponder, GestureResponderEvent } from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { color, font, radius, shadow } from '../theme/tokens';
import { Button } from './forms';

/** "1h 20m" / "20m" — empty string for zero. */
export function fmtDuration(total: number): string {
  if (!total || total <= 0) return '';
  const h = Math.floor(total / 60);
  const m = total % 60;
  return [h ? `${h}h` : '', m ? `${m}m` : '', !h && !m ? '0m' : ''].filter(Boolean).join(' ');
}

const SIZE = 232;
const C = SIZE / 2;
const R = 90;

/**
 * Tap-to-open duration field backed by a radial dial: drag the knob around the
 * ring to set minutes, tap −/+ for hours. `value`/`onChange` are minute strings
 * (matching the existing entry forms).
 */
export function DurationField({
  label,
  value,
  onChange,
  placeholder = 'Set duration',
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const total = parseInt(value, 10) || 0;
  const display = fmtDuration(total);
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.inkSecondary }}>{label}</Text> : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={{ backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1, borderColor: color.hairline, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Text style={{ fontFamily: font.body500, fontSize: 14, color: display ? color.ink : color.faint }}>{display || placeholder}</Text>
        <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.primary }}>{display ? 'Edit' : 'Set'}</Text>
      </Pressable>
      <DurationDialModal
        visible={open}
        initial={total}
        onCancel={() => setOpen(false)}
        onSet={(m) => { onChange(m ? String(m) : ''); setOpen(false); }}
      />
    </View>
  );
}

function arcPath(frac: number): string {
  const a0 = -Math.PI / 2;
  const a1 = a0 + frac * 2 * Math.PI;
  const sx = C + R * Math.cos(a0), sy = C + R * Math.sin(a0);
  const ex = C + R * Math.cos(a1), ey = C + R * Math.sin(a1);
  const large = frac > 0.5 ? 1 : 0;
  return `M ${sx} ${sy} A ${R} ${R} 0 ${large} 1 ${ex} ${ey}`;
}

function DurationDialModal({
  visible,
  initial,
  onCancel,
  onSet,
}: {
  visible: boolean;
  initial: number;
  onCancel: () => void;
  onSet: (min: number) => void;
}) {
  const [hours, setHours] = useState(Math.floor(initial / 60));
  const [mins, setMins] = useState(initial % 60);

  useEffect(() => {
    if (visible) { setHours(Math.floor(initial / 60)); setMins(initial % 60); }
  }, [visible, initial]);

  const update = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    const dx = locationX - C, dy = locationY - C;
    let ang = Math.atan2(dy, dx) + Math.PI / 2; // 0 at the top
    if (ang < 0) ang += Math.PI * 2;
    const m = Math.round((ang / (Math.PI * 2)) * 60) % 60;
    setMins(m);
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: update,
      onPanResponderMove: update,
    }),
  ).current;

  const frac = mins / 60;
  const a1 = -Math.PI / 2 + frac * 2 * Math.PI;
  const knob = { x: C + R * Math.cos(a1), y: C + R * Math.sin(a1) };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable onPress={onCancel} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
        <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14, alignItems: 'center' }, shadow.card]}>
          <Text style={{ alignSelf: 'flex-start', fontFamily: font.display700, fontSize: 18, color: color.ink }}>Duration</Text>

          <View {...pan.panHandlers} style={{ width: SIZE, height: SIZE }}>
            <Svg width={SIZE} height={SIZE}>
              <Circle cx={C} cy={C} r={R} fill="none" stroke="#EAE8F4" strokeWidth={12} />
              {Array.from({ length: 12 }).map((_, i) => {
                const a = -Math.PI / 2 + (i / 12) * 2 * Math.PI;
                return <Line key={i} x1={C + (R - 12) * Math.cos(a)} y1={C + (R - 12) * Math.sin(a)} x2={C + (R - 18) * Math.cos(a)} y2={C + (R - 18) * Math.sin(a)} stroke="#cfcde0" strokeWidth={2} />;
              })}
              {mins > 0 && <Path d={arcPath(frac)} fill="none" stroke={color.primary} strokeWidth={12} strokeLinecap="round" />}
              <Circle cx={knob.x} cy={knob.y} r={12} fill="#fff" stroke={color.primary} strokeWidth={4} />
            </Svg>
            {/* Centre readout (plain text overlays the SVG) */}
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: font.display700, fontSize: 34, color: color.ink }}>{hours}:{String(mins).padStart(2, '0')}</Text>
              <Text style={{ fontFamily: font.body500, fontSize: 11, color: color.muted, marginTop: 2 }}>hours : minutes</Text>
            </View>
          </View>

          {/* Hours stepper */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Pressable onPress={() => setHours((h) => Math.max(0, h - 1))} style={stepBtn}><Text style={stepTxt}>−</Text></Pressable>
            <View style={{ alignItems: 'center', minWidth: 56 }}>
              <Text style={{ fontFamily: font.display700, fontSize: 20, color: color.ink }}>{hours}</Text>
              <Text style={{ fontFamily: font.body700, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: color.muted }}>hours</Text>
            </View>
            <Pressable onPress={() => setHours((h) => Math.min(12, h + 1))} style={stepBtn}><Text style={stepTxt}>+</Text></Pressable>
          </View>

          {/* Quick minute taps for precision without dragging */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[0, 15, 30, 45].map((m) => {
              const on = mins === m;
              return (
                <Pressable key={m} onPress={() => setMins(m)} style={{ paddingVertical: 7, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: on ? color.primary : '#fff', borderWidth: 1, borderColor: on ? color.primary : color.hairline }}>
                  <Text style={{ fontFamily: font.body600, fontSize: 12.5, color: on ? '#fff' : color.ink }}>:{String(m).padStart(2, '0')}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch' }}>
            <Button label="Cancel" variant="secondary" onPress={onCancel} style={{ flex: 1 }} />
            <Button label="Set" onPress={() => onSet(hours * 60 + mins)} style={{ flex: 1 }} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const stepBtn = { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', borderWidth: 1.5, borderColor: color.hairline, alignItems: 'center' as const, justifyContent: 'center' as const };
const stepTxt = { fontFamily: font.display700, fontSize: 22, color: color.primary };
