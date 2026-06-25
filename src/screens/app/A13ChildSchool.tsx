import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Ellipse, Rect } from 'react-native-svg';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* 13 · Child Profile · School Age — Mia, school-age variant. */
export default function A13ChildSchool() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar showIcons />

      {/* header: Mia, school */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            backgroundColor: '#E7E4FB',
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={28} height={32} viewBox="0 0 20 22" fill="#6B6FC9">
            <Circle cx="10" cy="6.5" r="5.5" />
            <Path d="M1.5 21Q1.5 14 10 14Q18.5 14 18.5 21Z" />
          </Svg>
        </View>
        <View>
          <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Mia</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted, marginTop: 5 }}>
            Mar 15, 2020 · 6 years
          </Text>
        </View>
        <View
          style={{
            marginLeft: 'auto',
            backgroundColor: '#6B6FC9',
            borderRadius: 999,
            paddingVertical: 7,
            paddingHorizontal: 16,
          }}
        >
          <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#fff' }}>School</Text>
        </View>
      </View>

      {/* stage spine: School active */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <View
          style={[
            {
              flexDirection: 'row',
              backgroundColor: '#fff',
              borderRadius: 16,
              overflow: 'hidden',
            },
            shadow.card,
          ]}
        >
          <StageCell
            label="Expecting"
            active={false}
            icon={
              <Svg viewBox="0 0 12 15" fill="#C8C6DC" width={10} height={13}>
                <Circle cx="6" cy="4" r="3.2" />
                <Path d="M1.5 13Q1.5 9.5 6 9.5Q9.5 9.5 10.5 11Q11.5 13 9 13Z" />
              </Svg>
            }
            labelSize={8}
          />
          <StageCell
            label="Newborn"
            active={false}
            icon={
              <Svg viewBox="0 0 12 16" fill="#C8C6DC" width={10} height={14}>
                <Ellipse cx="6" cy="5.5" rx="4" ry="5" />
                <Path d="M1.5 15Q1.5 11 6 11Q10.5 11 10.5 15Z" />
              </Svg>
            }
            labelSize={8}
          />
          <StageCell
            label="Baby"
            active={false}
            icon={
              <Svg viewBox="0 0 14 18" fill="#C8C6DC" width={12} height={16}>
                <Ellipse cx="7" cy="6" rx="4.5" ry="5.5" />
                <Path d="M1.5 17Q1.5 12 7 12Q12.5 12 12.5 17Z" />
              </Svg>
            }
          />
          <StageCell
            label="Preschool"
            active={false}
            icon={
              <Svg viewBox="0 0 15 19" fill="#C8C6DC" width={13} height={17}>
                <Ellipse cx="7.5" cy="6.5" rx="5" ry="6" />
                <Path d="M1.5 18Q1.5 13 7.5 13Q13.5 13 13.5 18Z" />
              </Svg>
            }
          />
          <StageCell
            label="School"
            active
            icon={
              <Svg viewBox="0 0 16 21" fill="#6B6FC9" width={14} height={18}>
                <Ellipse cx="8" cy="6.5" rx="5.5" ry="6" />
                <Path d="M1.5 20Q1.5 13.5 8 13.5Q14.5 13.5 14.5 20Z" />
              </Svg>
            }
          />
          <StageCell
            label="Teen"
            active={false}
            last
            icon={
              <Svg viewBox="0 0 17 23" fill="#C8C6DC" width={15} height={20}>
                <Ellipse cx="8.5" cy="7" rx="5.5" ry="6.5" />
                <Path d="M1.5 22Q1.5 14.5 8.5 14.5Q15.5 14.5 15.5 22Z" />
              </Svg>
            }
          />
        </View>
      </View>

      {/* school-age stats */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', gap: 8 }}>
        <StatCard value="2" label="Homework" note="due Fri" noteColor="#E98FB3" />
        <StatCard value="1" label="Activity" note="today" noteColor="#6B6FC9" />
        <StatCard value="1/3" label="Chores" note="done" noteColor="#C9A33B" />
      </View>

      {/* today's activity */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text
          style={{
            fontFamily: f.body700,
            fontSize: 11,
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            color: c.muted,
            marginBottom: 10,
            paddingLeft: 4,
          }}
        >
          Today
        </Text>
        <View
          style={[
            { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden' },
            shadow.card,
          ]}
        >
          <ActivityRow
            title="Piano lesson"
            sub="15:30 · Music school"
            chipBg="#E7E4FB"
            chipFg="#6B6FC9"
            chip="Today"
            iconBg="#E7E4FB"
            border
            icon={
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round">
                <Path d="M9 18V5l12-2v13" />
                <Circle cx="6" cy="18" r="3" />
                <Circle cx="18" cy="16" r="3" />
              </Svg>
            }
          />
          <ActivityRow
            title="Science homework"
            sub="Due Fri · Chapter 4"
            chipBg="#FBE0EA"
            chipFg="#D46E97"
            chip="Fri"
            iconBg="#FBE0EA"
            border
            icon={
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#D46E97" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </Svg>
            }
          />
          <ActivityRow
            title="Swim practice"
            sub="Yesterday · 45 min"
            chipBg="#D8F0E6"
            chipFg="#3FA98A"
            chip="Done ✓"
            iconBg="#D8F0E6"
            icon={
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#3FA98A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Circle cx="12" cy="12" r="10" />
                <Path d="M12 8v4l3 3" />
              </Svg>
            }
          />
        </View>
      </View>

      {/* bottom nav (school-age: Family active) */}
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
        <NavItem label="Today" active={false} icon={
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <Path d="M9 22V12h6v10" />
          </Svg>
        } />
        <NavItem label="Calendar" active={false} icon={
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Rect x="3" y="4" width="18" height="18" rx="3" />
            <Path d="M16 2v4M8 2v4M3 10h18" />
          </Svg>
        } />
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
        <NavItem label="Family" active icon={
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round">
            <Circle cx="9" cy="7" r="4" />
            <Path d="M2 20c0-3.31 3.13-6 7-6s7 2.69 7 6" />
            <Circle cx="19" cy="9" r="2.5" />
            <Path d="M16 20c0-2.21 1.35-4 3-4s3 1.79 3 4" />
          </Svg>
        } />
        <NavItem label="Settings" active={false} icon={
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
            <Circle cx="12" cy="12" r="3" />
            <Path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </Svg>
        } />
      </View>
    </View>
  );
}

function StageCell({
  label,
  icon,
  active,
  last = false,
  labelSize = 9,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  last?: boolean;
  labelSize?: number;
}) {
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: active ? 12 : labelSize === 8 ? 10 : 12,
        paddingHorizontal: labelSize === 8 ? 4 : 6,
        alignItems: 'center',
        gap: 4,
        backgroundColor: active ? '#E7E4FB' : 'transparent',
        borderRightWidth: last ? 0 : 1,
        borderRightColor: active ? 'rgba(51,50,74,0.08)' : 'rgba(51,50,74,0.06)',
      }}
    >
      {icon}
      <Text style={{ fontFamily: font.body700, fontSize: labelSize, color: active ? '#6B6FC9' : '#C8C6DC' }}>
        {label}
      </Text>
    </View>
  );
}

function StatCard({
  value,
  label,
  note,
  noteColor,
}: {
  value: string;
  label: string;
  note: string;
  noteColor: string;
}) {
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: '#fff',
          borderRadius: 18,
          paddingVertical: 16,
          paddingHorizontal: 10,
          alignItems: 'center',
        },
        shadow.card,
      ]}
    >
      <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink }}>{value}</Text>
      <Text
        style={{
          fontFamily: font.body400,
          fontSize: 9,
          color: color.muted,
          marginTop: 5,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <Text style={{ fontFamily: font.body400, fontSize: 10, color: noteColor, marginTop: 5 }}>{note}</Text>
    </View>
  );
}

function ActivityRow({
  title,
  sub,
  chip,
  chipBg,
  chipFg,
  iconBg,
  icon,
  border = false,
}: {
  title: string;
  sub: string;
  chip: string;
  chipBg: string;
  chipFg: string;
  iconBg: string;
  icon: React.ReactNode;
  border?: boolean;
}) {
  return (
    <View
      style={{
        paddingVertical: 14,
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
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink, marginBottom: 2 }}>{title}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted }}>{sub}</Text>
      </View>
      <View style={{ backgroundColor: chipBg, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 10, color: chipFg }}>{chip}</Text>
      </View>
    </View>
  );
}

function NavItem({ label, active, icon }: { label: string; active: boolean; icon: React.ReactNode }) {
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
        {icon}
      </View>
      <Text style={{ fontFamily: font.body600, fontSize: 9, letterSpacing: 0.4, color: active ? '#6B6FC9' : color.muted }}>
        {label}
      </Text>
    </View>
  );
}
