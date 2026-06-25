import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { font } from '../../theme/tokens';

const f = font;

const HAIR = 'rgba(51,50,74,0.07)';

/* 15 · Kiosk Mode — tablet landscape (1024) family command centre. */
export default function A15Kiosk() {
  return (
    <View style={{ width: 1024, backgroundColor: '#F4F3FB' }}>
      {/* the 660px-tall command-centre body */}
      <View style={{ height: 660, flexDirection: 'column' }}>
        {/* Header bar */}
        <View
          style={{
            height: 58,
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderBottomColor: HAIR,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 28,
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {/* Everly tree mark */}
            <Svg width={26} height={29} viewBox="0 0 24 27" fill="none">
              <Path
                d="M12 1C8 4 6 8 6 11.5 6 15 8.5 17.5 12 17.5S18 15 18 11.5C18 8 16 4 12 1z"
                fill="#76a878"
              />
              <Path d="M12 16v10" stroke="#76a878" strokeWidth={2} strokeLinecap="round" />
            </Svg>
            <Text style={{ fontFamily: f.display700, fontSize: 16, color: '#33324A' }}>Everly</Text>
            <View style={{ width: 1, height: 18, backgroundColor: 'rgba(51,50,74,0.1)', marginHorizontal: 10 }} />
            <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2' }}>Family command centre</Text>
          </View>
          <Text style={{ fontFamily: f.display700, fontSize: 20, color: '#33324A' }}>Monday, 23 June 2026</Text>
          <Text style={{ fontFamily: f.display700, fontSize: 32, color: '#33324A' }}>9:41</Text>
        </View>

        {/* Three-column content */}
        <View style={{ flex: 1, flexDirection: 'row', overflow: 'hidden' }}>
          {/* Left: Week Calendar (340px) */}
          <View
            style={{
              width: 340,
              paddingVertical: 22,
              paddingHorizontal: 20,
              borderRightWidth: 1,
              borderRightColor: HAIR,
            }}
          >
            <ColLabel>This week</ColLabel>
            <View style={{ flexDirection: 'column', gap: 8 }}>
              {/* Mon (today) */}
              <DayRow day="MON" date="23" today>
                <Tag bg="#D8F0E6" fg="#3FA98A">Oliver · checkup 9am</Tag>
                <Tag bg="#E7E4FB" fg="#6B6FC9">Mia · piano 15:30</Tag>
              </DayRow>
              {/* Tue */}
              <DayRow day="TUE" date="24">
                <Tag bg="#E7E4FB" fg="#6B6FC9">Mia · swim 16:00</Tag>
              </DayRow>
              {/* Wed */}
              <DayRow day="WED" date="25">
                <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#C8C6DC' }}>No events</Text>
              </DayRow>
              {/* Thu */}
              <DayRow day="THU" date="26">
                <Tag bg="#FBE0EA" fg="#D46E97">Mia · homework due</Tag>
              </DayRow>
              {/* Fri */}
              <DayRow day="FRI" date="27">
                <Tag bg="#E7E4FB" fg="#6B6FC9">Mia · school show</Tag>
              </DayRow>
            </View>
          </View>

          {/* Centre: Routines + Chores */}
          <View style={{ flex: 1, paddingVertical: 22, paddingHorizontal: 24, borderRightWidth: 1, borderRightColor: HAIR }}>
            <ColLabel>Morning · Today</ColLabel>
            {/* Routine steps */}
            <View style={{ flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              <RoutineRow state="done" label="Wake up · 7:00 am" />
              <RoutineRow state="done" label="Wash face & brush teeth" />
              <RoutineRow state="next" label="Get dressed · " nextLabel="Next up →" />
              <RoutineRow state="todo" label="Breakfast" />
            </View>

            {/* Chores */}
            <ColLabel style={{ marginBottom: 12 }}>Chores</ColLabel>
            <View style={{ flexDirection: 'column', gap: 8 }}>
              <ChoreRow done label="Mia · Tidy bedroom" points="+15" />
              <ChoreRow done={false} label="Mia · Set the table" points="+10" />
            </View>
          </View>

          {/* Right: Up Next (296px) */}
          <View style={{ width: 296, paddingVertical: 22, paddingHorizontal: 22 }}>
            <ColLabel>Up next</ColLabel>
            <View style={{ flexDirection: 'column', gap: 12 }}>
              {/* Event 1: soon */}
              <UpNextCard time="09:00" timeColor="#6B6FC9" title="Oliver's checkup">
                <Tag bg="#D8F0E6" fg="#3FA98A" small>Oliver</Tag>
                <Tag bg="#E7E4FB" fg="#6B6FC9" small>In 19 min</Tag>
              </UpNextCard>
              {/* Event 2 */}
              <UpNextCard time="15:30" timeColor="#33324A" title="Piano lesson">
                <Tag bg="#E7E4FB" fg="#6B6FC9" small>Mia</Tag>
                <Tag bg="#F4F3FB" fg="#9C9AB2" small>Music school</Tag>
              </UpNextCard>
              {/* Event 3 */}
              <UpNextCard time="Tomorrow" timeColor="#33324A" title="Swim practice" dim>
                <Tag bg="#E7E4FB" fg="#6B6FC9" small>Mia</Tag>
              </UpNextCard>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function ColLabel({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <Text
      style={[
        {
          fontFamily: f.body700,
          fontSize: 12,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: '#9C9AB2',
          marginBottom: 16,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

function Tag({
  children,
  bg,
  fg,
  small = false,
}: {
  children: React.ReactNode;
  bg: string;
  fg: string;
  small?: boolean;
}) {
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 999,
        paddingVertical: small ? 4 : 5,
        paddingHorizontal: small ? 10 : 11,
      }}
    >
      <Text style={{ fontFamily: f.body700, fontSize: 11, color: fg }}>{children}</Text>
    </View>
  );
}

function DayRow({
  day,
  date,
  today = false,
  children,
}: {
  day: string;
  date: string;
  today?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: '#fff',
          borderRadius: 14,
          paddingVertical: 10,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        today && {
          borderWidth: 1.5,
          borderColor: 'rgba(107,111,201,0.25)',
        },
        {
          shadowColor: '#33324A',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        },
      ]}
    >
      <View style={{ width: 36, alignItems: 'center' }}>
        <Text style={{ fontFamily: f.body700, fontSize: 11, color: today ? '#6B6FC9' : '#9C9AB2' }}>{day}</Text>
        <Text style={{ fontFamily: f.display700, fontSize: 20, color: today ? '#6B6FC9' : '#33324A', marginTop: 2 }}>
          {date}
        </Text>
      </View>
      <View style={{ flex: 1, flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>{children}</View>
    </View>
  );
}

function CheckBubble() {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        backgroundColor: '#D8F0E6',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#3FA98A" strokeWidth={2.5} strokeLinecap="round">
        <Path d="M5 13l4 4L19 7" />
      </Svg>
    </View>
  );
}

function RoutineRow({
  state,
  label,
  nextLabel,
}: {
  state: 'done' | 'next' | 'todo';
  label: string;
  nextLabel?: string;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: '#fff',
          borderRadius: 14,
          paddingVertical: 14,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        },
        state === 'next' && { borderWidth: 1.5, borderColor: '#6B6FC9' },
        state === 'todo' && { opacity: 0.5 },
        {
          shadowColor: '#33324A',
          shadowOpacity: 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        },
      ]}
    >
      {state === 'done' && <CheckBubble />}
      {state === 'next' && (
        <View
          style={{
            width: 28,
            height: 28,
            backgroundColor: '#E7E4FB',
            borderRadius: 14,
            borderWidth: 2,
            borderColor: '#6B6FC9',
          }}
        />
      )}
      {state === 'todo' && (
        <View
          style={{
            width: 28,
            height: 28,
            backgroundColor: '#F4F3FB',
            borderRadius: 14,
            borderWidth: 2,
            borderColor: '#C8C6DC',
            borderStyle: 'dashed',
          }}
        />
      )}
      <Text
        style={{
          fontFamily: f.body700,
          fontSize: 15,
          color: state === 'done' ? '#9C9AB2' : '#33324A',
          textDecorationLine: state === 'done' ? 'line-through' : 'none',
        }}
      >
        {label}
        {nextLabel ? <Text style={{ color: '#6B6FC9' }}>{nextLabel}</Text> : null}
      </Text>
    </View>
  );
}

function ChoreRow({ done, label, points }: { done: boolean; label: string; points: string }) {
  return (
    <View
      style={[
        {
          backgroundColor: '#fff',
          borderRadius: 14,
          paddingVertical: 12,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        {
          shadowColor: '#33324A',
          shadowOpacity: 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {done ? (
          <View
            style={{
              width: 24,
              height: 24,
              backgroundColor: '#D8F0E6',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#3FA98A" strokeWidth={2.5} strokeLinecap="round">
              <Path d="M5 13l4 4L19 7" />
            </Svg>
          </View>
        ) : (
          <View
            style={{
              width: 24,
              height: 24,
              backgroundColor: '#F4F3FB',
              borderRadius: 12,
              borderWidth: 2,
              borderColor: 'rgba(51,50,74,0.1)',
            }}
          />
        )}
        <Text
          style={{
            fontFamily: f.body600,
            fontSize: 14,
            color: done ? '#9C9AB2' : '#33324A',
            textDecorationLine: done ? 'line-through' : 'none',
          }}
        >
          {label}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="#E9C46A">
          <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </Svg>
        <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#C9A33B' }}>{points}</Text>
      </View>
    </View>
  );
}

function UpNextCard({
  time,
  timeColor,
  title,
  dim = false,
  children,
}: {
  time: string;
  timeColor: string;
  title: string;
  dim?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 18,
        },
        dim && { opacity: 0.65 },
        {
          shadowColor: '#33324A',
          shadowOpacity: 0.07,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 3 },
          elevation: 2,
        },
      ]}
    >
      <Text style={{ fontFamily: f.display700, fontSize: 36, color: timeColor, marginBottom: 6 }}>{time}</Text>
      <Text style={{ fontFamily: f.body700, fontSize: 15, color: '#33324A', marginBottom: 6 }}>{title}</Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>{children}</View>
    </View>
  );
}
