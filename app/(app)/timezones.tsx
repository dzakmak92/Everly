import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { ChevronLeft } from '../../src/components/icons';
import { useData } from '../../src/lib/store';
import { useFeedback } from '../../src/components/Feedback';

const PRESETS = ['Europe/Dublin', 'Europe/London', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Asia/Tokyo', 'Australia/Sydney'];
/** Colours cycled for family members on the dial (You is always rose). */
const DIAL_COLORS = ['#2C8C7A', '#6B6FC9', '#B9902F', '#B5662E', '#567F39', '#2C5F90', '#B04070'];

function fmtTime(tz: string, now: Date) {
  try { return new Intl.DateTimeFormat([], { timeZone: tz, hour: 'numeric', minute: '2-digit', weekday: 'short' }).format(now); }
  catch { return 'Invalid zone'; }
}
/** Local hour as a float (h + m/60), or null if the zone is invalid. */
function localHourF(tz: string, now: Date): number | null {
  try {
    const parts = new Intl.DateTimeFormat([], { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now);
    const h = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10) % 24;
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);
    return h + m / 60;
  } catch { return null; }
}
const awake = (h: number | null) => h != null && ((h % 24) + 24) % 24 >= 7 && ((h % 24) + 24) % 24 < 22;

type Person = { key: string; name: string; tz: string; location?: string; color: string; initial: string; hour: number | null; onDelete?: () => void };

/** 24-hour day/night dial: twilight bands + each family member placed at their
 *  current local hour (matches the day-overview clock). */
function FamilyDial({ people }: { people: Person[] }) {
  const cx = 100, cy = 100, R = 80;
  const ang = (h: number) => (h / 24) * 2 * Math.PI - Math.PI / 2;
  const P = (r: number, a: number): [number, number] => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const arc = (r: number, h0: number, h1: number) => {
    const [x0, y0] = P(r, ang(h0)); const [x1, y1] = P(r, ang(h1));
    const large = ((h1 - h0 + 24) % 24) > 12 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  };
  const bands: [number, number, string][] = [
    [21, 6, '#4C4680'], [6, 8, '#E8A57E'], [8, 17, '#F7CE86'], [17, 19, '#EC9A6A'], [19, 21, '#7E6BAE'],
  ];
  const placed = people.filter((p) => p.hour != null);
  const awakeN = placed.filter((p) => awake(p.hour)).length;
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={220} height={220} viewBox="0 0 200 200">
        <Circle cx={cx} cy={cy} r={R} fill="none" stroke={color.hairline} strokeWidth={11} />
        {bands.map(([h0, h1, c], i) => <Path key={i} d={arc(R, h0, h1)} fill="none" stroke={c} strokeWidth={11} strokeLinecap="round" />)}
        {([[0, '0'], [6, '6'], [12, '12'], [18, '18']] as const).map(([h, label]) => {
          const [x, y] = P(R - 19, ang(h));
          return <SvgText key={h} x={x} y={y + 4} fontSize={12} fill={color.muted} textAnchor="middle" fontWeight="700">{label}</SvgText>;
        })}
        <SvgText x={cx} y={cy - 30} fontSize={13} textAnchor="middle">🌙</SvgText>
        <SvgText x={cx} y={cy + 44} fontSize={15} textAnchor="middle">☀️</SvgText>
        <SvgText x={cx} y={cy - 1} fontSize={24} fontWeight="700" fill={color.ink} textAnchor="middle">{String(awakeN)}</SvgText>
        <SvgText x={cx} y={cy + 16} fontSize={10} fill={color.muted} textAnchor="middle">awake now</SvgText>
        {placed.map((p) => {
          const [x, y] = P(R, ang(p.hour as number));
          return (
            <React.Fragment key={p.key}>
              <Circle cx={x} cy={y} r={12} fill={p.color} stroke="#fff" strokeWidth={3} />
              <SvgText x={x} y={y + 4} fontSize={11} fontWeight="800" fill="#fff" textAnchor="middle">{p.initial}</SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

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

  // Everyone on one list: You first, then family & friends.
  const people: Person[] = [
    { key: 'you', name: 'You', tz: myTz, location: myTz, color: color.rose, initial: 'Y', hour: localHourF(myTz, now) },
    ...tzContacts.map((c, i) => ({
      key: c.id, name: c.name, tz: c.tz, location: c.location, color: DIAL_COLORS[i % DIAL_COLORS.length],
      initial: c.name.charAt(0).toUpperCase() || '·', hour: localHourF(c.tz, now), onDelete: () => deleteTzContact(c.id),
    })),
  ];

  const Row = ({ p }: { p: Person }) => (
    <View style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: p.color, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: font.display700, fontSize: 14, color: '#fff' }}>{p.initial}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{p.name}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>{p.location || p.tz}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontFamily: font.body600, fontSize: 13, color: color.ink }}>{fmtTime(p.tz, now)}</Text>
        <Text style={{ fontFamily: font.body500, fontSize: 11, color: awake(p.hour) ? color.maternalTeal : color.muted }}>{awake(p.hour) ? 'Awake' : 'Asleep'}</Text>
      </View>
      {p.onDelete && <Pressable onPress={p.onDelete} hitSlop={8} style={{ paddingLeft: 4 }}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>}
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
        <Pressable onPress={() => setOpen(true)} style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: color.primary }}>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: '#fff' }}>+ Person</Text>
        </Pressable>
      </View>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Family timezones</Text>

      {/* Day/night dial — everyone at their current local hour */}
      <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, paddingVertical: 12, alignItems: 'center' }, shadow.card]}>
        <FamilyDial people={people} />
      </View>

      <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted, marginTop: 2 }}>Everyone</Text>
      {people.map((p) => <Row key={p.key} p={p} />)}

      <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, lineHeight: 18 }}>
        The ring is a 24-hour day/night clock — night, dawn, day, dusk. Anyone on the bright arc is likely awake (7am–10pm local). Updates live.
      </Text>

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
