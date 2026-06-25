import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Rect, Polyline } from 'react-native-svg';
import { color, font, radius, shadow } from '../../theme/tokens';
import { StatusBar, Card } from '../../components/ui';

const f = font;
const c = color;

/* 08 · Routines & Chores — picture-routine tiles, chore board, points balance. */
export default function A08Routines() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar showIcons />

      {/* title row */}
      <View
        style={{
          paddingTop: 12,
          paddingHorizontal: 24,
          paddingBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontFamily: f.display700, fontSize: 20, color: c.ink }}>Routines</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: '#E7E4FB',
            borderRadius: radius.pill,
            paddingVertical: 5,
            paddingRight: 12,
            paddingLeft: 5,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              backgroundColor: '#6B6FC9',
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FaceGlyph size={10} fill="white" />
          </View>
          <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#6B6FC9' }}>Mia · 6yr</Text>
        </View>
      </View>

      {/* tabs */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 14, flexDirection: 'row', gap: 6 }}>
        <View style={{ backgroundColor: '#6B6FC9', borderRadius: radius.pill, paddingVertical: 7, paddingHorizontal: 18 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#fff' }}>Morning</Text>
        </View>
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: radius.pill,
            paddingVertical: 7,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: 'rgba(51,50,74,0.08)',
          }}
        >
          <Text style={{ fontFamily: f.body600, fontSize: 12, color: '#6F6E86' }}>Evening</Text>
        </View>
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: radius.pill,
            paddingVertical: 7,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: 'rgba(51,50,74,0.08)',
          }}
        >
          <Text style={{ fontFamily: f.body600, fontSize: 12, color: '#6F6E86' }}>Chores</Text>
        </View>
      </View>

      {/* routine step tiles (2-col grid) */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 16,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <StepTile chipBg="#FBF1CE" iconColor="#C9A33B" title="Wake up" time="7:00 am" done icon="sun" />
        <StepTile chipBg="#DCEBFA" iconColor="#4E8FD0" title="Wash face" time="7:10 am" done icon="drop" />
        <StepTile chipBg="#E7E4FB" iconColor="#6B6FC9" title="Get dressed" time="7:20 am" icon="shirt" />
        <StepTile chipBg="#FBE0EA" iconColor="#D46E97" title="Breakfast" time="7:30 am" icon="mug" />
      </View>

      {/* chore board */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
        <Text
          style={{
            fontFamily: f.body700,
            fontSize: 11,
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            color: '#9C9AB2',
            marginBottom: 10,
            paddingLeft: 4,
          }}
        >
          Chores today
        </Text>
        <Card style={{ overflow: 'hidden' }}>
          <ChoreRow icon="trash" title="Tidy bedroom" points="+15" status="done" border />
          <ChoreRow icon="lines" title="Set the table" points="+10" status="todo" border />
          <ChoreRow icon="chat" iconBg="#FBF1CE" iconColor="#C9A33B" title="Walk Biscuit" points="+20" status="late" />
        </Card>
      </View>

      {/* points balance */}
      <Card
        style={{
          marginTop: 8,
          marginHorizontal: 20,
          marginBottom: 16,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            backgroundColor: '#FBF1CE',
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <StarGlyph size={20} fill="#E9C46A" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.ink }}>Mia's Balance</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2', marginTop: 3 }}>
            45 pts · €6.50 earned
          </Text>
        </View>
        <View style={{ backgroundColor: '#6B6FC9', borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 16 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#fff' }}>Redeem</Text>
        </View>
      </Card>

      <PeriBottomNav />
    </View>
  );
}

/* ── picture-routine step tile ───────────────────────────────────────────── */
function StepTile({
  chipBg,
  iconColor,
  title,
  time,
  done = false,
  icon,
}: {
  chipBg: string;
  iconColor: string;
  title: string;
  time: string;
  done?: boolean;
  icon: 'sun' | 'drop' | 'shirt' | 'mug';
}) {
  return (
    <View
      style={[
        {
          width: '47.5%',
          flexGrow: 1,
          backgroundColor: '#fff',
          borderRadius: radius.cardSm,
          padding: 16,
          flexDirection: 'row',
          gap: 12,
          alignItems: 'center',
        },
        shadow.card,
      ]}
    >
      <View
        style={{
          width: 40,
          height: 40,
          backgroundColor: chipBg,
          borderRadius: 13,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <StepIcon name={icon} color={iconColor} />
      </View>
      <View>
        <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink }}>{title}</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 10, color: '#9C9AB2', marginTop: 3 }}>{time}</Text>
      </View>
      {done ? (
        <View
          style={{
            width: 20,
            height: 20,
            backgroundColor: '#D8F0E6',
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 'auto',
          }}
        >
          <Svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#3FA98A" strokeWidth={2.5} strokeLinecap="round">
            <Path d="M5 13l4 4L19 7" />
          </Svg>
        </View>
      ) : (
        <View
          style={{
            width: 20,
            height: 20,
            backgroundColor: '#F4F3FB',
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: 'rgba(51,50,74,0.1)',
            marginLeft: 'auto',
          }}
        />
      )}
    </View>
  );
}

function StepIcon({ name, color: col }: { name: 'sun' | 'drop' | 'shirt' | 'mug'; color: string }) {
  if (name === 'sun')
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="5" />
        <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </Svg>
    );
  if (name === 'drop')
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth={2} strokeLinecap="round">
        <Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </Svg>
    );
  if (name === 'shirt')
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
      </Svg>
    );
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <Path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <Path d="M6 1v3M10 1v3M14 1v3" />
    </Svg>
  );
}

/* ── chore board row ─────────────────────────────────────────────────────── */
function ChoreRow({
  icon,
  iconBg = '#E7E4FB',
  iconColor = '#6B6FC9',
  title,
  points,
  status,
  border = false,
}: {
  icon: 'trash' | 'lines' | 'chat';
  iconBg?: string;
  iconColor?: string;
  title: string;
  points: string;
  status: 'done' | 'todo' | 'late';
  border?: boolean;
}) {
  return (
    <View
      style={{
        paddingVertical: 13,
        paddingHorizontal: 16,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        borderBottomWidth: border ? 1 : 0,
        borderBottomColor: 'rgba(51,50,74,0.05)',
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          backgroundColor: iconBg,
          borderRadius: 11,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChoreIcon name={icon} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink }}>{title}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <StarGlyph size={12} fill="#E9C46A" />
        <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#9C9AB2' }}>{points}</Text>
      </View>
      {status === 'done' && (
        <View
          style={{
            backgroundColor: '#D8F0E6',
            borderRadius: radius.pill,
            paddingVertical: 4,
            paddingHorizontal: 10,
            marginLeft: 4,
          }}
        >
          <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#3FA98A' }}>Done</Text>
        </View>
      )}
      {status === 'todo' && (
        <View
          style={{
            backgroundColor: '#F4F3FB',
            borderRadius: radius.pill,
            paddingVertical: 4,
            paddingHorizontal: 10,
            marginLeft: 4,
            borderWidth: 1,
            borderColor: 'rgba(51,50,74,0.08)',
          }}
        >
          <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#9C9AB2' }}>To do</Text>
        </View>
      )}
      {status === 'late' && (
        <View
          style={{
            backgroundColor: '#FBF1CE',
            borderRadius: radius.pill,
            paddingVertical: 4,
            paddingHorizontal: 10,
            marginLeft: 4,
          }}
        >
          <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#C9A33B' }}>Late +8</Text>
        </View>
      )}
    </View>
  );
}

function ChoreIcon({ name, color: col }: { name: 'trash' | 'lines' | 'chat'; color: string }) {
  if (name === 'trash')
    return (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Polyline points="3 6 5 6 21 6" />
        <Path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <Path d="M10 11v6M14 11v6" />
        <Path d="M9 6V4h6v2" />
      </Svg>
    );
  if (name === 'lines')
    return (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 3h18M3 9h18M3 15h18M3 21h18" />
      </Svg>
    );
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

/* ── shared glyphs ───────────────────────────────────────────────────────── */
function StarGlyph({ size, fill }: { size: number; fill: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={fill} />
    </Svg>
  );
}

function FaceGlyph({ size, fill }: { size: number; fill: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Circle cx="10" cy="7.5" r="5" fill={fill} />
      <Path d="M2 19Q2 13 10 13Q18 13 18 19Z" fill={fill} />
    </Svg>
  );
}

/* ── periwinkle bottom nav (Today active) ────────────────────────────────── */
export function PeriBottomNav() {
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
      }}
    >
      <NavItem label="Today" active>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <Path d="M9 22V12h6v10" />
        </Svg>
      </NavItem>
      <NavItem label="Calendar">
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Rect x="3" y="4" width="18" height="18" rx="3" />
          <Path d="M16 2v4M8 2v4M3 10h18" />
        </Svg>
      </NavItem>
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
      <NavItem label="Family">
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
          <Circle cx="9" cy="7" r="4" />
          <Path d="M2 20c0-3.31 3.13-6 7-6s7 2.69 7 6" />
          <Circle cx="19" cy="9" r="2.5" />
          <Path d="M16 20c0-2.21 1.35-4 3-4s3 1.79 3 4" />
        </Svg>
      </NavItem>
      <NavItem label="Settings">
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
          <Circle cx="12" cy="12" r="3" />
          <Path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </Svg>
      </NavItem>
    </View>
  );
}

function NavItem({ label, active = false, children }: { label: string; active?: boolean; children: React.ReactNode }) {
  return (
    <View style={{ alignItems: 'center', gap: 3 }}>
      <View
        style={{
          width: 44,
          height: 32,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? '#E7E4FB' : 'transparent',
        }}
      >
        {children}
      </View>
      <Text style={{ fontFamily: f.body600, fontSize: 9, letterSpacing: 0.4, color: active ? '#6B6FC9' : '#9C9AB2' }}>
        {label}
      </Text>
    </View>
  );
}
