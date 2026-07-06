import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path, Rect, Line as SvgLine, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { color, font } from '../theme/tokens';

/** A single point on the day timeline. */
export type TlItem = { id: string; title: string; at: string; color: string };

const tlTime = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

/* ── Day/night colour ramp (shared by the ribbon gradient) — deep-night indigo
   through dawn, midday gold, dusk, back to night. ── */
function lerpHex(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.substr(i, 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.substr(i, 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
const RAMP: [number, string][] = [[0, '#3B3568'], [5, '#544E88'], [6.5, '#E8A57E'], [9, '#F6C98A'], [13, '#FBD98A'], [17, '#F2B368'], [19, '#DE8A6B'], [21, '#6E5F9C'], [24, '#3B3568']];
function colorAt(h: number) {
  h = ((h % 24) + 24) % 24;
  for (let i = 0; i < RAMP.length - 1; i++) { const [h0, c0] = RAMP[i], [h1, c1] = RAMP[i + 1]; if (h >= h0 && h <= h1) return lerpHex(c0, c1, (h - h0) / (h1 - h0)); }
  return '#3B3568';
}

/** Switchable day overview — a horizontal ribbon or a sunrise→sunset dial. */
export function DayTimeline({ items, layout, unit = 'entry' }: { items: TlItem[]; layout: 'ribbon' | 'clock'; unit?: 'entry' | 'event' }) {
  return layout === 'clock' ? <ClockTimeline items={items} unit={unit} /> : <RibbonTimeline items={items} />;
}

/** Ribbon: a horizontal strip shaded by time of day (day/night gradient). */
function RibbonTimeline({ items }: { items: TlItem[] }) {
  const hrs = items.map((i) => { const d = new Date(i.at); return d.getHours() + d.getMinutes() / 60; });
  const lo = Math.max(0, Math.min(7, Math.floor(Math.min(...hrs))));
  const hi = Math.min(24, Math.max(20, Math.ceil(Math.max(...hrs))));
  const span = hi - lo || 1;
  const pct = (h: number): `${number}%` => `${((h - lo) / span) * 100}%`;
  const now = new Date(); const nowH = now.getHours() + now.getMinutes() / 60;
  const ticks: number[] = []; for (let h = Math.ceil(lo / 4) * 4; h <= hi; h += 4) ticks.push(h);

  const stops: React.ReactElement[] = [];
  for (let h = lo; h <= hi; h++) stops.push(<Stop key={h} offset={(h - lo) / span} stopColor={colorAt(h)} />);

  const glyphs: { h: number; g: string; size: number }[] = [];
  if (6.5 >= lo && 6.5 <= hi) glyphs.push({ h: 6.5, g: '🌅', size: 12 });
  if (12 >= lo && 12 <= hi) glyphs.push({ h: 12, g: '☀️', size: 13 });
  if (hi >= 20) glyphs.push({ h: hi - 0.6, g: '🌙', size: 11 });

  return (
    <View style={{ height: 70, position: 'relative', marginHorizontal: 14 }}>
      {/* day/night gradient bar */}
      <Svg width="100%" height={9} style={{ position: 'absolute', top: 38, left: 0, right: 0 }} viewBox="0 0 100 9" preserveAspectRatio="none">
        <Defs><LinearGradient id="dnbar" x1="0" y1="0" x2="1" y2="0">{stops}</LinearGradient></Defs>
        <Rect x={0} y={0} width={100} height={9} rx={4.5} fill="url(#dnbar)" />
      </Svg>
      {glyphs.map((gl, i) => (
        <Text key={`g${i}`} style={{ position: 'absolute', top: 2, left: pct(gl.h), marginLeft: -10, width: 20, textAlign: 'center', fontSize: gl.size }}>{gl.g}</Text>
      ))}
      {ticks.map((h) => (
        <Text key={`t${h}`} style={{ position: 'absolute', top: 52, left: pct(h), marginLeft: -16, width: 32, textAlign: 'center', fontFamily: font.body600, fontSize: 9.5, color: color.faint }}>{h === 24 ? '24:00' : `${h}:00`}</Text>
      ))}
      {nowH >= lo && nowH <= hi && (
        <View style={{ position: 'absolute', top: 33, left: pct(nowH), width: 2, height: 19, marginLeft: -1, backgroundColor: color.rose }} />
      )}
      {items.map((it, i) => (
        <React.Fragment key={it.id}>
          <Text style={{ position: 'absolute', top: 20, left: pct(hrs[i]), marginLeft: -20, width: 40, textAlign: 'center', fontFamily: font.body700, fontSize: 9.5, color: it.color }} numberOfLines={1}>{tlTime(it.at)}</Text>
          <View style={{ position: 'absolute', top: 33, left: pct(hrs[i]), marginLeft: -9, width: 18, height: 18, borderRadius: 9, backgroundColor: it.color, borderWidth: 3, borderColor: '#fff' }} />
        </React.Fragment>
      ))}
    </View>
  );
}

/** Clock: a sunrise→sunset dial. Sunrise on the left, noon at the top, sunset on
   the right, midnight at the bottom — day arc over the top, night below — with
   24-hour tick slots and time-of-day colour bands. */
function ClockTimeline({ items, unit }: { items: TlItem[]; unit: 'entry' | 'event' }) {
  const cx = 110, cy = 110, R = 86;
  // Map the hour so 6→left, 12→top, 18→right, 0→bottom.
  const angle = (h: number) => ((((h - 18) % 24) + 24) % 24) / 24 * 2 * Math.PI;
  const P = (r: number, a: number): [number, number] => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const arcPath = (r: number, h0: number, h1: number) => {
    const [x0, y0] = P(r, angle(h0)); const [x1, y1] = P(r, angle(h1));
    const span = (((h1 - h0) % 24) + 24) % 24;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${span > 12 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  const bands: [number, number, string][] = [
    [6, 8, '#E8A57E'], [8, 11, '#F7CE86'], [11, 13, '#FBD98A'], [13, 16, '#F5C878'],
    [16, 18, '#EC9A6A'], [18, 20, '#8C7AB8'], [20, 4, '#453F72'], [4, 6, '#6E5F9C'],
  ];
  const now = new Date(); const nowH = now.getHours() + now.getMinutes() / 60;
  const [nx, ny] = P(R, angle(nowH));
  const plural = unit === 'entry' ? 'entries' : 'events';
  return (
    <View style={{ alignItems: 'center', gap: 12 }}>
      <Svg width={210} height={210} viewBox="0 0 220 220">
        <Circle cx={cx} cy={cy} r={R} fill="none" stroke={color.hairline} strokeWidth={12} />
        {bands.map(([h0, h1, c], i) => <Path key={i} d={arcPath(R, h0, h1)} fill="none" stroke={c} strokeWidth={12} />)}
        {/* hour ticks — bold every 3h */}
        {Array.from({ length: 24 }, (_, h) => {
          const major = h % 3 === 0; const [x1, y1] = P(R - 6, angle(h)); const [x2, y2] = P(R - (major ? 13 : 9), angle(h));
          return <SvgLine key={`k${h}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={major ? 1.6 : 1} opacity={major ? 0.9 : 0.5} />;
        })}
        {/* 24-hour numbers */}
        {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => { const [x, y] = P(R - 24, angle(h)); return <SvgText key={`n${h}`} x={x} y={y + 3.5} fontSize={9.5} fill="#8a8098" textAnchor="middle" fontWeight="800">{String(h)}</SvgText>; })}
        <SvgText x={cx} y={cy - 32} fontSize={13} textAnchor="middle">☀️</SvgText>
        <SvgText x={cx} y={cy + 44} fontSize={13} textAnchor="middle">🌙</SvgText>
        <SvgText x={cx} y={cy - 2} fontSize={26} fontWeight="800" fill={color.ink} textAnchor="middle">{String(items.length)}</SvgText>
        <SvgText x={cx} y={cy + 16} fontSize={10.5} fill={color.muted} textAnchor="middle">{items.length === 1 ? unit : plural}</SvgText>
        {items.map((it) => {
          const d = new Date(it.at); const h = d.getHours() + d.getMinutes() / 60; const [x, y] = P(R, angle(h));
          return <Circle key={it.id} cx={x} cy={y} r={7} fill={it.color} stroke="#fff" strokeWidth={3} />;
        })}
        {/* live "now" sun token */}
        <Circle cx={nx} cy={ny} r={9} fill="#fff" stroke={color.rose} strokeWidth={2} />
        <SvgText x={nx} y={ny + 3.5} fontSize={9} textAnchor="middle">☀️</SvgText>
      </Svg>
      {items.length > 0 ? (
        <View style={{ alignSelf: 'stretch', gap: 7 }}>
          {items.map((it) => (
            <View key={it.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: it.color }} />
              <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.muted, width: 64 }}>{tlTime(it.at)}</Text>
              <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 13, color: color.ink }} numberOfLines={1}>{it.title}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ fontFamily: font.body500, fontSize: 12.5, color: color.muted }}>Nothing planned for this day yet.</Text>
      )}
    </View>
  );
}
