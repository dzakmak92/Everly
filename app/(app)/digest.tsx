import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { ChevronLeft } from '../../src/components/icons';
import { useData, upcomingEvents } from '../../src/lib/store';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function Digest() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entries, events, vaccines, children } = useData();

  const since = Date.now() - WEEK_MS;
  const weekEntries = entries.filter((e) => new Date(e.at).getTime() >= since);
  const nextWeekEnd = Date.now() + WEEK_MS;
  const soon = upcomingEvents(events).filter((e) => new Date(e.at).getTime() <= nextWeekEnd);

  function lineFor(childId?: string) {
    const es = weekEntries.filter((e) => e.childId === childId);
    const feeds = es.filter((e) => e.kind === 'feed').length;
    const sleepMin = es.filter((e) => e.kind === 'sleep').reduce((s, e) => s + (e.durationMin ?? 0), 0);
    const avgSleepH = (sleepMin / 60 / 7).toFixed(1);
    const diapers = es.filter((e) => e.kind === 'diaper').length;
    return `${feeds} feeds · ${avgSleepH}h avg sleep/day · ${diapers} diapers`;
  }

  const dueVaccines = vaccines.filter((v) => !v.givenDate);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
        <ChevronLeft size={24} color={color.ink} />
      </Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Weekly digest</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>Your family's last 7 days and the week ahead.</Text>

      {/* Per child */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>This week</Text>
        {children.length === 0 ? (
          <Card><Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>No children yet.</Text></Card>
        ) : children.map((ch) => (
          <Card key={ch.id}>
            <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.ink }}>{ch.name}</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary, marginTop: 2 }}>{lineFor(ch.id)}</Text>
          </Card>
        ))}
      </View>

      {/* Upcoming */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Coming up</Text>
        {soon.length === 0 ? (
          <Card><Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>No events in the next 7 days.</Text></Card>
        ) : soon.map((ev) => (
          <Card key={ev.id}>
            <Text style={{ fontFamily: font.body600, fontSize: 14, color: color.ink }}>{ev.title}</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>{new Date(ev.at).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</Text>
          </Card>
        ))}
      </View>

      {/* Reminders */}
      {dueVaccines.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Health reminders</Text>
          {dueVaccines.map((v) => (
            <Card key={v.id}><Text style={{ fontFamily: font.body600, fontSize: 14, color: color.ink }}>⚠ {v.name}{v.dueDate ? ` · due ${v.dueDate}` : ''}</Text></Card>
          ))}
        </View>
      )}

      <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, lineHeight: 18 }}>
        On a phone build, this digest can be delivered as a weekly push notification.
      </Text>
    </ScrollView>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14 }, shadow.card]}>{children}</View>;
}
