import React from 'react';
import { ScrollView, View, Text, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { color, font, radius, shadow, childToken } from '../../src/theme/tokens';
import { ChevronLeft, Star } from '../../src/components/icons';
import { Logo } from '../../src/components/Logo';
import { useData, upcomingEvents, EventItem, Child, ChildColor } from '../../src/lib/store';

const HAIR = 'rgba(51,50,74,0.07)';

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });

/** Per-event pastel tag token, keyed on the linked child's colour (falls back to lilac). */
function tokenFor(childById: Map<string, Child>, childId?: string) {
  const c = childId ? childById.get(childId) : undefined;
  const key: ChildColor = c ? c.color : 'lilac';
  return childToken[key];
}

const nameOf = (childById: Map<string, Child>, childId?: string) =>
  (childId ? childById.get(childId)?.name : undefined) ?? '';

/** Label shown on a day-row event tag: "Name · title" or just title. */
function eventTag(childById: Map<string, Child>, e: EventItem) {
  const n = nameOf(childById, e.childId);
  return n ? `${n} · ${e.title}` : e.title;
}

/** Kiosk — a glanceable landscape family command-centre (week · routines+chores · up next). */
export default function Kiosk() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { children, events, routines, chores } = useData();

  // Live clock — ticks every second.
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const narrow = width < 900; // stack to a single column on phones / portrait

  const childById = React.useMemo(() => new Map(children.map((c) => [c.id, c])), [children]);

  // ── Column 1: this week (Mon–Fri of the current week) ────────────────────
  const weekDays = React.useMemo(() => {
    const start = new Date(now);
    const dow = (start.getDay() + 6) % 7; // 0 = Monday
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - dow);
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toDateString();
      const dayEvents = events
        .filter((e) => new Date(e.at).toDateString() === key)
        .sort((a, b) => a.at.localeCompare(b.at));
      return {
        key,
        label: d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3).toUpperCase(),
        date: d.getDate(),
        isToday: key === now.toDateString(),
        events: dayEvents,
      };
    });
  }, [events, now]);

  // ── Column 2: morning routine + chores ───────────────────────────────────
  const routine = routines[0];
  const steps = routine?.steps ?? [];
  // Three-state: done / next (first not-done) / todo.
  const nextStepId = steps.find((s) => !s.done)?.id;

  // ── Column 3: up next (soonest upcoming events) ──────────────────────────
  const next = React.useMemo(() => upcomingEvents(events, now).slice(0, 3), [events, now]);

  return (
    <View style={{ flex: 1, backgroundColor: color.canvas, paddingTop: insets.top }}>
      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: HAIR,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 12,
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
        >
          <ChevronLeft size={24} color={color.ink} />
        </Pressable>

        <Logo width={24} height={27} color="#76a878" />
        <Text style={{ fontFamily: font.display700, fontSize: 16, color: color.ink }}>Everly</Text>
        {!narrow && (
          <>
            <View style={{ width: 1, height: 18, backgroundColor: 'rgba(51,50,74,0.1)', marginHorizontal: 4 }} />
            <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>Family command centre</Text>
          </>
        )}

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text
            style={{ fontFamily: font.display700, fontSize: narrow ? 14 : 20, color: color.ink }}
            numberOfLines={1}
          >
            {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>

        <Text style={{ fontFamily: font.display700, fontSize: narrow ? 22 : 32, color: color.ink }}>
          {now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: false })}
        </Text>
      </View>

      {/* ── Three-column body ──────────────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexDirection: narrow ? 'column' : 'row',
          paddingBottom: insets.bottom + 28,
        }}
      >
        {/* Column 1 · This week */}
        <View
          style={[
            { paddingVertical: 22, paddingHorizontal: 20 },
            narrow ? { width: '100%' } : { width: 340, borderRightWidth: 1, borderRightColor: HAIR },
          ]}
        >
          <ColLabel>This week</ColLabel>
          <View style={{ gap: 8 }}>
            {weekDays.map((d) => (
              <DayRow key={d.key} day={d.label} date={String(d.date)} today={d.isToday}>
                {d.events.length === 0 ? (
                  <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.faint }}>No events</Text>
                ) : (
                  d.events.map((e) => {
                    const t = tokenFor(childById, e.childId);
                    return (
                      <Tag key={e.id} bg={t.fill} fg={t.stroke}>
                        {eventTag(childById, e)}
                      </Tag>
                    );
                  })
                )}
              </DayRow>
            ))}
          </View>
        </View>

        {/* Column 2 · Morning routine + chores */}
        <View
          style={[
            { flex: narrow ? undefined : 1, paddingVertical: 22, paddingHorizontal: 24 },
            narrow ? { width: '100%' } : { borderRightWidth: 1, borderRightColor: HAIR },
          ]}
        >
          <ColLabel>{routine ? `${routine.name} · Today` : 'Morning · Today'}</ColLabel>
          <View style={{ gap: 8, marginBottom: 20 }}>
            {steps.length === 0 ? (
              <EmptyCard t="No routine steps yet." />
            ) : (
              steps.map((s) => (
                <RoutineRow
                  key={s.id}
                  state={s.done ? 'done' : s.id === nextStepId ? 'next' : 'todo'}
                  label={s.label}
                />
              ))
            )}
          </View>

          <ColLabel style={{ marginBottom: 12 }}>Chores</ColLabel>
          <View style={{ gap: 8 }}>
            {chores.length === 0 ? (
              <EmptyCard t="No chores set up." />
            ) : (
              chores.map((c) => (
                <ChoreRow
                  key={c.id}
                  done={c.done}
                  label={nameOf(childById, c.childId) ? `${nameOf(childById, c.childId)} · ${c.label}` : c.label}
                  points={`+${c.points}`}
                />
              ))
            )}
          </View>
        </View>

        {/* Column 3 · Up next */}
        <View
          style={[
            { paddingVertical: 22, paddingHorizontal: 22 },
            narrow ? { width: '100%' } : { width: 300 },
          ]}
        >
          <ColLabel>Up next</ColLabel>
          <View style={{ gap: 12 }}>
            {next.length === 0 ? (
              <EmptyCard t="Nothing scheduled." />
            ) : (
              next.map((e, i) => {
                const t = tokenFor(childById, e.childId);
                const evDate = new Date(e.at);
                const isToday = evDate.toDateString() === now.toDateString();
                const isTomorrow =
                  evDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
                const head = isToday ? timeOf(e.at) : isTomorrow ? 'Tomorrow' : evDate.toLocaleDateString(undefined, { weekday: 'short' });
                const minsAway = Math.round((evDate.getTime() - now.getTime()) / 60000);
                return (
                  <UpNextCard key={e.id} time={head} timeColor={i === 0 ? color.primary : color.ink} dim={!isToday}>
                    <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.ink, marginBottom: 6 }}>
                      {e.title}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {nameOf(childById, e.childId) ? (
                        <Tag bg={t.fill} fg={t.stroke} small>
                          {nameOf(childById, e.childId)}
                        </Tag>
                      ) : null}
                      {isToday && minsAway > 0 && minsAway <= 60 ? (
                        <Tag bg={childToken.lilac.fill} fg={childToken.lilac.stroke} small>
                          In {minsAway} min
                        </Tag>
                      ) : e.location ? (
                        <Tag bg={color.canvas} fg={color.muted} small>
                          {e.location}
                        </Tag>
                      ) : null}
                    </View>
                  </UpNextCard>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ── Building blocks ─────────────────────────────────────────────────────── */

function ColLabel({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <Text
      style={[
        {
          fontFamily: font.body700,
          fontSize: 12,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: color.muted,
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
        borderRadius: radius.pill,
        paddingVertical: small ? 4 : 5,
        paddingHorizontal: small ? 10 : 11,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ fontFamily: font.body700, fontSize: 11, color: fg }}>{children}</Text>
    </View>
  );
}

function EmptyCard({ t }: { t: string }) {
  return (
    <View style={[{ backgroundColor: '#fff', borderRadius: radius.tileSm, padding: 14 }, shadow.row]}>
      <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>{t}</Text>
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
          borderRadius: radius.tileSm,
          paddingVertical: 10,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        today && { borderWidth: 1.5, borderColor: 'rgba(107,111,201,0.25)' },
        shadow.row,
      ]}
    >
      <View style={{ width: 36, alignItems: 'center' }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, color: today ? color.primary : color.muted }}>
          {day}
        </Text>
        <Text
          style={{
            fontFamily: font.display700,
            fontSize: 20,
            color: today ? color.primary : color.ink,
            marginTop: 2,
          }}
        >
          {date}
        </Text>
      </View>
      <View style={{ flex: 1, flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {children}
      </View>
    </View>
  );
}

function CheckMark({ size = 14, c = childToken.mint.stroke }: { size?: number; c?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 13l4 4L19 7" />
    </Svg>
  );
}

function RoutineRow({ state, label }: { state: 'done' | 'next' | 'todo'; label: string }) {
  return (
    <View
      style={[
        {
          backgroundColor: '#fff',
          borderRadius: radius.tileSm,
          paddingVertical: 14,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        },
        state === 'next' && { borderWidth: 1.5, borderColor: color.primary },
        state === 'todo' && { opacity: 0.5 },
        shadow.row,
      ]}
    >
      {state === 'done' && (
        <View
          style={{
            width: 28,
            height: 28,
            backgroundColor: childToken.mint.fill,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckMark />
        </View>
      )}
      {state === 'next' && (
        <View
          style={{
            width: 28,
            height: 28,
            backgroundColor: childToken.lilac.fill,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: color.primary,
          }}
        />
      )}
      {state === 'todo' && (
        <View
          style={{
            width: 28,
            height: 28,
            backgroundColor: color.canvas,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: color.faint,
            borderStyle: 'dashed',
          }}
        />
      )}
      <Text
        style={{
          flex: 1,
          fontFamily: font.body700,
          fontSize: 15,
          color: state === 'done' ? color.muted : color.ink,
          textDecorationLine: state === 'done' ? 'line-through' : 'none',
        }}
      >
        {label}
        {state === 'next' ? <Text style={{ color: color.primary }}>{'  ·  Next up →'}</Text> : null}
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
          borderRadius: radius.tileSm,
          paddingVertical: 12,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        shadow.row,
      ]}
    >
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {done ? (
          <View
            style={{
              width: 24,
              height: 24,
              backgroundColor: childToken.mint.fill,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckMark size={12} />
          </View>
        ) : (
          <View
            style={{
              width: 24,
              height: 24,
              backgroundColor: color.canvas,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: 'rgba(51,50,74,0.1)',
            }}
          />
        )}
        <Text
          style={{
            flex: 1,
            fontFamily: font.body600,
            fontSize: 14,
            color: done ? color.muted : color.ink,
            textDecorationLine: done ? 'line-through' : 'none',
          }}
        >
          {label}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Star size={14} color={color.sparkleGold} />
        <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.gold }}>{points}</Text>
      </View>
    </View>
  );
}

function UpNextCard({
  time,
  timeColor,
  dim = false,
  children,
}: {
  time: string;
  timeColor: string;
  dim?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        { backgroundColor: '#fff', borderRadius: radius.tile, padding: 18 },
        dim && { opacity: 0.7 },
        shadow.card,
      ]}
    >
      <Text style={{ fontFamily: font.display700, fontSize: 36, color: timeColor, marginBottom: 6 }}>{time}</Text>
      {children}
    </View>
  );
}
