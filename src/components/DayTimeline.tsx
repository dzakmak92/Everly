import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { color, font } from '../theme/tokens';

/** A single point on the day timeline. */
export type TlItem = { id: string; title: string; at: string; color: string };

const tlTime = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

/** Switchable day overview — a horizontal ribbon or a 24-hour dial. */
export function DayTimeline({ items, layout }: { items: TlItem[]; layout: 'ribbon' | 'clock' }) {
  if (items.length === 0) return null;
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
        <SvgText x={cx} y={cy + 16} fontSize={11} fill={color.muted} textAnchor="middle">{items.length === 1 ? 'entry' : 'entries'}</SvgText>
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
