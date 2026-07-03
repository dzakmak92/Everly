import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { ChevronLeft } from '../../src/components/icons';
import { useData } from '../../src/lib/store';
import { useFeedback } from '../../src/components/Feedback';

const PRESETS = ['Europe/Dublin', 'Europe/London', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Asia/Tokyo', 'Australia/Sydney'];

function fmtTime(tz: string, now: Date) {
  try { return new Intl.DateTimeFormat([], { timeZone: tz, hour: 'numeric', minute: '2-digit', weekday: 'short' }).format(now); }
  catch { return 'Invalid zone'; }
}
function localHour(tz: string, now: Date): number | null {
  try { return parseInt(new Intl.DateTimeFormat([], { timeZone: tz, hour: '2-digit', hour12: false }).format(now), 10); }
  catch { return null; }
}
const awake = (h: number | null) => h != null && h >= 7 && h < 22;

export default function Timezones() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tzContacts, addTzContact, deleteTzContact } = useData();
  const { toast } = useFeedback();
  const [now, setNow] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [tz, setTz] = useState('');
  const [loc, setLoc] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const myTz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; } })();

  function save() {
    if (name.trim() && tz.trim()) { addTzContact({ name, tz, location: loc }); toast('Contact added'); }
    setName(''); setTz(''); setLoc(''); setOpen(false);
  }

  const Row = ({ name, tz, location, onDelete }: { name: string; tz: string; location?: string; onDelete?: () => void }) => {
    const h = localHour(tz, now);
    return (
      <View style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: awake(h) ? color.maternalTeal : color.faint }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{name}</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>{location || tz}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: font.body600, fontSize: 13, color: color.ink }}>{fmtTime(tz, now)}</Text>
          <Text style={{ fontFamily: font.body500, fontSize: 11, color: awake(h) ? color.maternalTeal : color.muted }}>{awake(h) ? 'Awake' : 'Asleep'}</Text>
        </View>
        {onDelete && <Pressable onPress={onDelete} hitSlop={8} style={{ paddingLeft: 4 }}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>}
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
        <Pressable onPress={() => setOpen(true)} style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: color.primary }}>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: '#fff' }}>+ Person</Text>
        </Pressable>
      </View>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Family timezones</Text>

      <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>You</Text>
      <Row name="You" tz={myTz} location={myTz} />

      {tzContacts.length > 0 && <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted, marginTop: 4 }}>Family & friends</Text>}
      {tzContacts.map((c) => <Row key={c.id} name={c.name} tz={c.tz} location={c.location} onDelete={() => deleteTzContact(c.id)} />)}

      {tzContacts.length > 0 && (
        <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, lineHeight: 18 }}>
          Green = likely awake (7am–10pm local). Times update live.
        </Text>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Add person</Text>
            <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Grandma" autoCapitalize="words" />
            <Field label="Timezone (IANA)" value={tz} onChangeText={setTz} placeholder="Europe/London" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {PRESETS.map((p) => (
                <Pressable key={p} onPress={() => setTz(p)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: tz === p ? color.primary : '#fff', borderWidth: 1, borderColor: tz === p ? color.primary : color.hairline }}>
                  <Text style={{ fontFamily: font.body500, fontSize: 11, color: tz === p ? '#fff' : color.inkSecondary }}>{p.split('/')[1]?.replace('_', ' ')}</Text>
                </Pressable>
              ))}
            </View>
            <Field label="Location (optional)" value={loc} onChangeText={setLoc} placeholder="e.g. London" autoCapitalize="words" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setOpen(false)} style={{ flex: 1 }} />
              <Button label="Add" onPress={save} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
