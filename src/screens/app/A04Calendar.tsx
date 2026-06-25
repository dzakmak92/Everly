import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import { color, font, radius, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* A04 · Calendar — month grid, custody bands, weather glyphs, today events. */
export default function A04Calendar({ embedded = false }: { embedded?: boolean }) {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      {!embedded && <StatusBar showIcons />}

      {/* weather alert (calendar-integrated) */}
      <View
        style={{
          marginTop: 8,
          marginHorizontal: 16,
          backgroundColor: '#DCEBFA',
          borderRadius: 14,
          paddingVertical: 11,
          paddingHorizontal: 14,
          flexDirection: 'row',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#4E8FD0" strokeWidth={2} strokeLinecap="round">
          <Path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
          <Line x1="8" y1="19" x2="8" y2="21" />
          <Line x1="12" y1="19" x2="12" y2="21" />
          <Line x1="16" y1="19" x2="16" y2="21" />
        </Svg>
        <Text style={{ flex: 1, fontFamily: f.body600, fontSize: 12, lineHeight: 17, color: '#2A5080' }}>
          Rain forecast for Mia's Sports Day (Fri 27) — pack waterproofs
        </Text>
      </View>

      {/* calendar card */}
      <View
        style={[
          {
            marginTop: 8,
            marginHorizontal: 16,
            backgroundColor: '#fff',
            borderRadius: radius.card,
            paddingTop: 20,
            paddingHorizontal: 18,
            paddingBottom: 16,
          },
          shadow.card,
        ]}
      >
        {/* month nav */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={navBtn}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6F6E86" strokeWidth={2.5} strokeLinecap="round">
              <Path d="M15 18l-6-6 6-6" />
            </Svg>
          </View>
          <Text style={{ fontFamily: f.display700, fontSize: 17, color: c.ink }}>June 2026</Text>
          <View style={navBtn}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6F6E86" strokeWidth={2.5} strokeLinecap="round">
              <Path d="M9 18l6-6-6-6" />
            </Svg>
          </View>
        </View>

        {/* view pills */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
          <View style={{ backgroundColor: '#6B6FC9', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 16 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#fff' }}>Month</Text>
          </View>
          <View
            style={{
              backgroundColor: c.canvas,
              borderRadius: 999,
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderColor: 'rgba(51,50,74,0.08)',
            }}
          >
            <Text style={{ fontFamily: f.body600, fontSize: 11, color: '#6F6E86' }}>Week</Text>
          </View>
          <View
            style={{
              backgroundColor: c.canvas,
              borderRadius: 999,
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderColor: 'rgba(51,50,74,0.08)',
            }}
          >
            <Text style={{ fontFamily: f.body600, fontSize: 11, color: '#6F6E86' }}>Agenda</Text>
          </View>
        </View>

        {/* day headers */}
        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
          {['M', 'T', 'W', 'T', 'F'].map((d, i) => (
            <View key={`h${i}`} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#9C9AB2' }}>{d}</Text>
            </View>
          ))}
          {['S', 'S'].map((d, i) => (
            <View key={`he${i}`} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#9C9AB2', opacity: 0.4 }}>{d}</Text>
            </View>
          ))}
        </View>

        {/* date grid (June 2026: Mon 1 → Sun 30) */}
        {/* row 1: 1–7 */}
        <View style={{ flexDirection: 'row' }}>
          <PlainCell n="1" />
          <PlainCell n="2" />
          <PlainCell n="3" />
          <PlainCell n="4" />
          <PlainCell n="5" />
          <PlainCell n="6" dim />
          <PlainCell n="7" dim />
        </View>
        {/* row 2: 8–14 — custody band (mint) */}
        <View style={{ flexDirection: 'row' }}>
          <PlainCell n="8" />
          <BandCell n="9" band="rgba(216,240,230,0.55)" dots={['#3FA98A']} />
          <BandCell n="10" band="rgba(216,240,230,0.55)" />
          <BandCell n="11" band="rgba(216,240,230,0.55)" dots={['#6B6FC9']} />
          <BandCell n="12" band="rgba(216,240,230,0.55)" />
          <BandCell n="13" band="rgba(216,240,230,0.3)" dim />
          <BandCell n="14" band="rgba(216,240,230,0.3)" dim />
        </View>
        {/* row 3: 15–21 */}
        <View style={{ flexDirection: 'row' }}>
          <PlainCell n="15" />
          <PlainCell n="16" dots={['#3FA98A']} />
          <PlainCell n="17" />
          <PlainCell n="18" />
          <PlainCell n="19" />
          <PlainCell n="20" dim />
          <PlainCell n="21" dim />
        </View>
        {/* row 4: 22–28, today=23, weather glyphs */}
        <View style={{ flexDirection: 'row' }}>
          <WeatherCell n="22" glyph="⛅" />
          <TodayCell n="23" glyph="☀️" dots={['#3FA98A', '#6B6FC9']} />
          <WeatherCell n="24" glyph="☀️" />
          <WeatherCell n="25" glyph="⛅" dots={['#D46E97']} />
          <WeatherCell n="26" glyph="⛅" />
          <WeatherCell n="27" glyph="🌧️" band="rgba(220,235,250,0.5)" rain />
          <WeatherCell n="28" glyph="⛅" dim />
        </View>
        {/* row 5: 29–30 */}
        <View style={{ flexDirection: 'row' }}>
          <PlainCell n="29" />
          <PlainCell n="30" />
          <View style={{ flex: 1 }} />
          <View style={{ flex: 1 }} />
          <View style={{ flex: 1 }} />
          <View style={{ flex: 1 }} />
          <View style={{ flex: 1 }} />
        </View>
      </View>

      {/* today events */}
      <View style={{ paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            paddingHorizontal: 4,
          }}
        >
          <Text style={{ fontFamily: f.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: '#9C9AB2' }}>
            Today · June 23
          </Text>
          <View
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: '#fff',
                borderRadius: 999,
                paddingVertical: 4,
                paddingHorizontal: 10,
              },
              shadow.row,
            ]}
          >
            <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#4E8FD0' }}>⛅ Dublin 18°</Text>
          </View>
        </View>

        {/* event 1 — Oliver checkup (mint) */}
        <EventRow
          chipBg="#D8F0E6"
          dot="#3FA98A"
          title="Oliver · 6-month checkup"
          sub="09:00 · Dr. Brennan"
          marginBottom={8}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#3FA98A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <Path d="M9 12l2 2 4-4" />
          </Svg>
        </EventRow>

        {/* event 2 — Mia piano (lilac) */}
        <EventRow chipBg="#E7E4FB" dot="#6B6FC9" title="Mia · Piano lesson" sub="15:30 · Music school">
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round">
            <Path d="M9 18V5l12-2v13" />
            <Path d="M6 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
            <Path d="M18 16m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
          </Svg>
        </EventRow>
      </View>

      {/* bottom nav (Calendar active) */}
      {!embedded && <CalendarBottomNav active="Calendar" />}
    </View>
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

/* ── grid cells ─────────────────────────────────────────────────────────── */

function Dots({ dots }: { dots?: string[] }) {
  if (!dots || dots.length === 0) return null;
  return (
    <View style={{ flexDirection: 'row', gap: 2, justifyContent: 'center', marginTop: 1 }}>
      {dots.map((d, i) => (
        <View key={i} style={{ width: 4, height: 4, backgroundColor: d, borderRadius: 2 }} />
      ))}
    </View>
  );
}

function PlainCell({ n, dim, dots }: { n: string; dim?: boolean; dots?: string[] }) {
  return (
    <View style={{ flex: 1, paddingVertical: 5, paddingHorizontal: 1 }}>
      <Text style={{ fontFamily: font.body400, fontSize: 12, color: dim ? '#9C9AB2' : color.ink, padding: 4, textAlign: 'center' }}>
        {n}
      </Text>
      <Dots dots={dots} />
    </View>
  );
}

function BandCell({ n, band, dim, dots }: { n: string; band: string; dim?: boolean; dots?: string[] }) {
  return (
    <View style={{ flex: 1, paddingVertical: 5, paddingHorizontal: 1, backgroundColor: band, borderRadius: 5 }}>
      <Text style={{ fontFamily: font.body400, fontSize: 12, color: dim ? '#9C9AB2' : color.ink, padding: 4, textAlign: 'center' }}>
        {n}
      </Text>
      <Dots dots={dots} />
    </View>
  );
}

function WeatherCell({
  n,
  glyph,
  band,
  rain,
  dim,
  dots,
}: {
  n: string;
  glyph: string;
  band?: string;
  rain?: boolean;
  dim?: boolean;
  dots?: string[];
}) {
  return (
    <View style={{ flex: 1, paddingVertical: 4, paddingHorizontal: 1, backgroundColor: band, borderRadius: band ? 5 : undefined }}>
      <Text
        style={{
          fontFamily: rain ? font.body700 : font.body400,
          fontSize: 12,
          color: rain ? '#4E8FD0' : dim ? '#9C9AB2' : color.ink,
          textAlign: 'center',
        }}
      >
        {n}
      </Text>
      <Text style={{ fontSize: 9, marginTop: 2, textAlign: 'center' }}>{glyph}</Text>
      <Dots dots={dots} />
    </View>
  );
}

function TodayCell({ n, glyph, dots }: { n: string; glyph: string; dots?: string[] }) {
  return (
    <View style={{ flex: 1, paddingVertical: 3, paddingHorizontal: 1 }}>
      <View
        style={{
          width: 24,
          height: 24,
          backgroundColor: '#6B6FC9',
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
        }}
      >
        <Text style={{ fontFamily: font.body700, fontSize: 12, color: '#fff' }}>{n}</Text>
      </View>
      <Text style={{ fontSize: 9, marginTop: 1, textAlign: 'center' }}>{glyph}</Text>
      <Dots dots={dots} />
    </View>
  );
}

/* ── event row ──────────────────────────────────────────────────────────── */

function EventRow({
  chipBg,
  dot,
  title,
  sub,
  marginBottom,
  children,
}: {
  chipBg: string;
  dot: string;
  title: string;
  sub: string;
  marginBottom?: number;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: '#fff',
          borderRadius: radius.cardSm,
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          gap: 12,
          alignItems: 'center',
          marginBottom,
        },
        shadow.card,
      ]}
    >
      <View style={{ width: 40, height: 40, backgroundColor: chipBg, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink, marginBottom: 3 }}>{title}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 12, color: '#9C9AB2' }}>{sub}</Text>
      </View>
      <View style={{ width: 8, height: 8, backgroundColor: dot, borderRadius: 4 }} />
    </View>
  );
}

/* ── bottom nav (Calendar active, periwinkle FAB) ───────────────────────── */

export function CalendarBottomNav({ active }: { active: 'Calendar' | 'Family' }) {
  const item = (label: string, isActive: boolean, icon: React.ReactNode) => (
    <View style={{ alignItems: 'center', gap: 3 }}>
      <View
        style={{
          width: 44,
          height: 32,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isActive ? '#E7E4FB' : 'transparent',
        }}
      >
        {icon}
      </View>
      <Text style={{ fontFamily: font.body600, fontSize: 9, letterSpacing: 0.4, color: isActive ? '#6B6FC9' : '#9C9AB2' }}>{label}</Text>
    </View>
  );
  const calActive = active === 'Calendar';
  const famActive = active === 'Family';
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: 'rgba(51,50,74,0.06)',
        paddingTop: 10,
        paddingHorizontal: 8,
        paddingBottom: 28,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 12,
      }}
    >
      {item(
        'Today',
        false,
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <Path d="M9 22V12h6v10" />
        </Svg>,
      )}
      {item(
        'Calendar',
        calActive,
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={calActive ? '#6B6FC9' : '#9C9AB2'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M3 4m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z" />
          <Path d="M16 2v4M8 2v4M3 10h18" />
        </Svg>,
      )}
      <View
        style={[
          {
            width: 52,
            height: 52,
            backgroundColor: '#6B6FC9',
            borderRadius: 26,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -18,
          },
          shadow.periwinkleButton,
        ]}
      >
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
          <Path d="M12 5v14M5 12h14" />
        </Svg>
      </View>
      {item(
        'Family',
        famActive,
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={famActive ? '#6B6FC9' : '#9C9AB2'} strokeWidth={2} strokeLinecap="round">
          <Path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
          <Path d="M2 20c0-3.31 3.13-6 7-6s7 2.69 7 6" />
          <Path d="M19 9m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0" />
          <Path d="M16 20c0-2.21 1.35-4 3-4s3 1.79 3 4" />
        </Svg>,
      )}
      {item(
        'Settings',
        false,
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
          <Path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
          <Path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </Svg>,
      )}
    </View>
  );
}
