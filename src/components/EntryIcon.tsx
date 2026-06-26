import React from 'react';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { Bottle, Activity, Smile } from './icons';
import type { EntryKind } from '../lib/store';

/** Single source of truth for entry-kind glyphs (used by Today + the Add logger). */
const st = (c: string, w = 2) => ({ fill: 'none' as const, stroke: c, strokeWidth: w, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

const Moon = ({ size, color: c }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" {...st(c)} /></Svg>
);
const Drop = ({ size, color: c }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" {...st(c)} /></Svg>
);
const DiaperG = ({ size, color: c }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M4 8l4-4 4 4 4-4 4 4v8l-4 4-4-4-4 4-4-4V8z" {...st(c)} /></Svg>
);
const NoteDoc = ({ size, color: c }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" {...st(c)} /><Path d="M14 2v6h6M8 13h8M8 17h6" {...st(c)} /></Svg>
);
const Meal = ({ size, color: c }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M4 12h16a8 8 0 0 1-16 0z" {...st(c)} />
    <Line x1="3" y1="12" x2="21" y2="12" {...st(c)} />
    <Path d="M8 3c0 1.4-1 1.6-1 3M12 3c0 1.4-1 1.6-1 3M16 3c0 1.4-1 1.6-1 3" {...st(c, 1.6)} />
  </Svg>
);
const Pill = ({ size, color: c }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M4.5 12.5l8-8a4.95 4.95 0 0 1 7 7l-8 8a4.95 4.95 0 0 1-7-7z" {...st(c)} />
    <Line x1="8.5" y1="8.5" x2="15.5" y2="15.5" {...st(c)} />
  </Svg>
);
const Potty = ({ size, color: c }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M5 9h14v2a7 7 0 0 1-14 0V9z" {...st(c)} />
    <Path d="M3.5 9h17" {...st(c)} />
    <Line x1="8" y1="18" x2="8" y2="21" {...st(c)} />
    <Line x1="16" y1="18" x2="16" y2="21" {...st(c)} />
  </Svg>
);

export function EntryIcon({ kind, color, size = 18 }: { kind: EntryKind; color: string; size?: number }) {
  switch (kind) {
    case 'feed': return <Bottle size={size} color={color} />;
    case 'pump': return <Drop size={size} color={color} />;
    case 'sleep': return <Moon size={size} color={color} />;
    case 'diaper': return <DiaperG size={size} color={color} />;
    case 'meal': return <Meal size={size} color={color} />;
    case 'mood': return <Smile size={size} color={color} mood="good" />;
    case 'activity': return <Activity size={size} color={color} />;
    case 'medicine': return <Pill size={size} color={color} />;
    case 'potty': return <Potty size={size} color={color} />;
    default: return <NoteDoc size={size} color={color} />; // note
  }
}
