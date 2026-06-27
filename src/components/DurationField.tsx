import React, { useRef } from 'react';
import { View, Text, Pressable, PanResponder, GestureResponderEvent } from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { color, font, radius } from '../theme/tokens';

/** "1h 20m" / "20m" — empty string for zero. */
export function fmtDuration(total: number): string {
  if (!total || total <= 0) return '';
  const h = Math.floor(total / 60);
  const m = total % 60;
  return [h ? `${h}h` : '', m ? `${m}m` : '', !h && !m ? '0m' : ''].filter(Boolean).join(' ');
}

const SIZE = 168;
const C = SIZE / 2;
const R = SIZE / 2 - 16;

function arcPath(frac: number): string {
  const a0 = -Math.PI / 2;
  const a1 = a0 + frac * 2 * Math.PI;
  const sx = C + R * Math.cos(a0), sy = C + R * Math.sin(a0);
  const ex = C + R * Math.cos(a1), ey = C + R * Math.sin(a1);
  const large = frac > 0.5 ? 1 : 0;
  return `M ${sx} ${sy} A ${R} ${R} 0 ${large} 1 ${ex} ${ey}`;
}

/**
 * Inline duration picker: a radial dial (drag the knob for minutes) plus a
 * hours stepper, shown directly in the card. `value`/`onChange` are minute
 * strings (matching the entry forms). Stage: stacked & compact (design A).
 */
export function DurationField({
  label = 'Duration',
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const total = parseInt(value, 10) || 0;
  const hours = Math.floor(total / 60);
  const mins = total % 60;

  // Keep current hours available to the (once-created) pan responder.
  const hoursRef = useRef(hours);
  hoursRef.current = hours;

  const emit = (h: number, m: number) => { const t = h * 60 + m; onChange(t > 0 ? String(t) : ''); };

  const update = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    const dx = locationX - C, dy = locationY - C;
    let ang = Math.atan2(dy, dx) + Math.PI / 2; // 0 at the top
    if (ang < 0) ang += Math.PI * 2;
    const m = Math.round((ang / (Math.PI * 2)) * 60) % 60;
    emit(hoursRef.current, m);
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
    <View style={{ gap: 8 }}>
      <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: color.muted }}>{label}</Text>
      <View style={{ backgroundColor: '#fff', borderRadius: radius.tile, paddingVertical: 16, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: color.hairline }}>
        <View {...pan.panHandlers} style={{ width: SIZE, height: SIZE }}>
          <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <Circle cx={C} cy={C} r={R} fill="none" stroke="#EAE8F4" strokeWidth={11} />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = -Math.PI / 2 + (i / 12) * 2 * Math.PI;
              return <Line key={i} x1={C + (R - 10) * Math.cos(a)} y1={C + (R - 10) * Math.sin(a)} x2={C + (R - 15) * Math.cos(a)} y2={C + (R - 15) * Math.sin(a)} stroke="#cfcde0" strokeWidth={2} />;
            })}
            {mins > 0 && <Path d={arcPath(frac)} fill="none" stroke={color.primary} strokeWidth={11} strokeLinecap="round" />}
            <Circle cx={knob.x} cy={knob.y} r={11} fill="#fff" stroke={color.primary} strokeWidth={4} />
          </Svg>
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: font.display700, fontSize: 30, color: color.ink }}>{hours}:{String(mins).padStart(2, '0')}</Text>
            <Text style={{ fontFamily: font.body500, fontSize: 10.5, color: color.muted, marginTop: 1 }}>hours : minutes</Text>
          </View>
        </View>

        {/* Hours stepper */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Pressable onPress={() => emit(Math.max(0, hours - 1), mins)} style={stepBtn}><Text style={stepTxt}>−</Text></Pressable>
          <View style={{ alignItems: 'center', minWidth: 44 }}>
            <Text style={{ fontFamily: font.display700, fontSize: 19, color: color.ink }}>{hours}</Text>
            <Text style={{ fontFamily: font.body700, fontSize: 9.5, letterSpacing: 0.6, textTransform: 'uppercase', color: color.muted }}>hours</Text>
          </View>
          <Pressable onPress={() => emit(Math.min(12, hours + 1), mins)} style={stepBtn}><Text style={stepTxt}>+</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

const stepBtn = { width: 38, height: 38, borderRadius: 19, backgroundColor: color.canvas, borderWidth: 1.5, borderColor: color.hairline, alignItems: 'center' as const, justifyContent: 'center' as const };
const stepTxt = { fontFamily: font.display700, fontSize: 20, color: color.primary };
