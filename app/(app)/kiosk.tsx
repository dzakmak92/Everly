import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { ChevronLeft } from '../../src/components/icons';
import { useData, upcomingEvents } from '../../src/lib/store';

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

/** Kiosk — a glanceable family command-centre (events + routines + chores + up next). */
export default function Kiosk() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { events, routines, chores } = useData();

  const now = new Date();
  const todayKey = now.toDateString();
  const todays = events.filter((e) => new Date(e.at).toDateString() === todayKey).sort((a, b) => a.at.localeCompare(b.at));
  const next = upcomingEvents(events).slice(0, 4);
  const routine = routines[0];
  const openChores = chores.filter((c) => !c.done);

  const Col = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={{ gap: 8 }}>
      <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>{title}</Text>
      {children}
    </View>
  );
  const Card = ({ children }: { children: React.ReactNode }) => <View style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14 }, shadow.card]}>{children}</View>;
  const Empty = ({ t }: { t: string }) => <Card><Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>{t}</Text></Card>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 18 }}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
      <View>
        <Text style={{ fontFamily: font.display700, fontSize: 30, color: color.ink }}>Family command centre</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 14, color: color.muted, marginTop: 2 }}>{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
      </View>

      <Col title="Today">
        {todays.length === 0 ? <Empty t="No events today." /> : todays.map((e) => (
          <Card key={e.id}>
            <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{e.title}</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>{timeOf(e.at)}{e.location ? ` · ${e.location}` : ''}</Text>
          </Card>
        ))}
      </Col>

      <Col title={routine ? routine.name + ' routine' : 'Routine'}>
        {!routine ? <Empty t="No routine set up." /> : (
          <Card>
            {routine.steps.length === 0 ? <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>No steps yet.</Text> : routine.steps.map((s) => (
              <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 }}>
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: s.done ? color.maternalTeal : color.canvas, borderWidth: s.done ? 0 : 1.5, borderColor: color.faint }} />
                <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.ink, textDecorationLine: s.done ? 'line-through' : 'none' }}>{s.label}</Text>
              </View>
            ))}
          </Card>
        )}
      </Col>

      <Col title="Chores to do">
        {openChores.length === 0 ? <Empty t="All chores done 🎉" /> : openChores.map((c) => (
          <Card key={c.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 14, color: color.ink }}>{c.label}</Text>
              <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.gold }}>+{c.points}</Text>
            </View>
          </Card>
        ))}
      </Col>

      <Col title="Up next">
        {next.length === 0 ? <Empty t="Nothing scheduled." /> : next.map((e) => (
          <Card key={e.id}>
            <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{e.title}</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>{new Date(e.at).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</Text>
          </Card>
        ))}
      </Col>
    </ScrollView>
  );
}
