import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow, childToken } from '../../../src/theme/tokens';
import { Button, Field, Notice } from '../../../src/components/forms';
import { DateField } from '../../../src/components/DateField';
import { ChevronRight } from '../../../src/components/icons';
import { Silhouette } from '../../../src/components/ui';
import { useData, CHILD_COLORS, type ChildColor } from '../../../src/lib/store';
import { ageLabel, stageFrom, STAGE_LABEL } from '../../../src/lib/age';
import { useFeedback } from '../../../src/components/Feedback';

const TZ_PRESETS = ['Europe/Dublin', 'Europe/London', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Asia/Tokyo', 'Australia/Sydney'];
const DIAL_COLORS = ['#2C8C7A', '#6B6FC9', '#B9902F', '#B5662E', '#567F39', '#2C5F90', '#B04070'];
function fmtTime(tz: string, now: Date) {
  try { return new Intl.DateTimeFormat([], { timeZone: tz, hour: 'numeric', minute: '2-digit', weekday: 'short' }).format(now); }
  catch { return 'Invalid zone'; }
}
function localHourF(tz: string, now: Date): number | null {
  try {
    const parts = new Intl.DateTimeFormat([], { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now);
    const h = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10) % 24;
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);
    return h + m / 60;
  } catch { return null; }
}
const tzAwake = (h: number | null) => h != null && ((h % 24) + 24) % 24 >= 7 && ((h % 24) + 24) % 24 < 22;
type TzPerson = { key: string; name: string; tz?: string; location?: string; color: string; initial: string; hour: number | null; role?: string; isYou?: boolean; onEdit?: () => void; onDelete?: () => void };

/** 24-hour day/night dial: twilight bands + each person at their local hour. */
function FamilyDial({ people }: { people: TzPerson[] }) {
  const cx = 100, cy = 100, R = 80;
  const ang = (h: number) => (h / 24) * 2 * Math.PI - Math.PI / 2;
  const P = (r: number, a: number): [number, number] => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const arc = (r: number, h0: number, h1: number) => {
    const [x0, y0] = P(r, ang(h0)); const [x1, y1] = P(r, ang(h1));
    const large = ((h1 - h0 + 24) % 24) > 12 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  };
  const bands: [number, number, string][] = [[21, 6, '#4C4680'], [6, 8, '#E8A57E'], [8, 17, '#F7CE86'], [17, 19, '#EC9A6A'], [19, 21, '#7E6BAE']];
  const placed = people.filter((p) => p.hour != null);
  const awakeN = placed.filter((p) => tzAwake(p.hour)).length;
  return (
    <Svg width={200} height={200} viewBox="0 0 200 200">
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
  );
}

const ROLES = ['Partner', 'Co-parent', 'Grandparent', 'Carer', 'Other'];
const ROLE_STYLE: Record<string, { emoji: string; bg: string; fg: string }> = {
  Partner: { emoji: '🧑', bg: '#DCEBFA', fg: '#2C5F90' },
  'Co-parent': { emoji: '👨‍👩‍👧', bg: '#E7E4FB', fg: '#6B6FC9' },
  Grandparent: { emoji: '👵', bg: '#FBF1CE', fg: '#7A5C20' },
  Carer: { emoji: '🧑‍🍼', bg: '#FBE0EA', fg: '#B04070' },
  Other: { emoji: '👤', bg: '#D8F0E6', fg: '#2C8475' },
};
const roleStyle = (r?: string) => ROLE_STYLE[r ?? 'Other'] ?? ROLE_STYLE.Other;

export default function Family() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { children, activeChild, setActiveChild, addChild, caregivers, addCaregiver, updateCaregiver, deleteCaregiver } = useData();
  const { toast } = useFeedback();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [colorKey, setColorKey] = useState<ChildColor>(CHILD_COLORS[0]);
  const [error, setError] = useState('');

  // Family member (partner, grandparent, carer…) modal — add or edit.
  const [memberOpen, setMemberOpen] = useState(false);
  const [mEditId, setMEditId] = useState<string | null>(null);
  const [mName, setMName] = useState('');
  const [mRole, setMRole] = useState('Partner');
  const [mTz, setMTz] = useState('');
  const [mLoc, setMLoc] = useState('');
  const [mErr, setMErr] = useState('');

  // Family around the world — live day/night dial.
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(id); }, []);
  const myTz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; } })();
  const tzPeople: TzPerson[] = [
    { key: 'you', name: 'You', tz: myTz, location: myTz.split('/')[1]?.replace('_', ' ') || myTz, color: color.rose, initial: 'Y', hour: localHourF(myTz, now), isYou: true },
    ...caregivers.map((c, i) => ({
      key: c.id, name: c.name, tz: c.tz, location: c.location, color: DIAL_COLORS[i % DIAL_COLORS.length],
      initial: c.name.charAt(0).toUpperCase() || '·', hour: c.tz ? localHourF(c.tz, now) : null, role: c.role,
      onEdit: () => openMember(c.id), onDelete: () => deleteCaregiver(c.id),
    })),
  ];

  function openAdd() { setName(''); setBirth(''); setColorKey(CHILD_COLORS[children.length % CHILD_COLORS.length]); setError(''); setOpen(true); }
  function save() {
    if (!name.trim()) { setError("Enter the child's name."); return; }
    addChild({ name, color: colorKey, birthDate: birth });
    setOpen(false);
    toast('Child added');
  }
  function openMember(id?: string) {
    const cg = id ? caregivers.find((c) => c.id === id) : null;
    setMEditId(cg?.id ?? null);
    setMName(cg?.name ?? ''); setMRole(cg?.role ?? 'Partner'); setMTz(cg?.tz ?? ''); setMLoc(cg?.location ?? '');
    setMErr(''); setMemberOpen(true);
  }
  function saveMember() {
    if (!mName.trim()) { setMErr("Enter the person's name."); return; }
    if (mEditId) { updateCaregiver(mEditId, { name: mName, role: mRole, tz: mTz, location: mLoc }); toast('Saved'); }
    else { addCaregiver(mName, mRole, mTz, mLoc); toast('Member added'); }
    setMemberOpen(false);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 28, paddingHorizontal: 20, gap: 14 }} showsVerticalScrollIndicator={false}>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Family</Text>

      {children.length === 0 ? (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 22, gap: 12, alignItems: 'center' }, shadow.card]}>
          <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.muted, textAlign: 'center' }}>No children yet. Add your first to start tracking.</Text>
          <Button label="+ Add child" onPress={openAdd} />
        </View>
      ) : (
        <>
          <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Children</Text>
          {children.map((ch) => {
            const t = childToken[ch.color];
            const sel = ch.id === activeChild?.id;
            return (
              <Pressable key={ch.id} onPress={() => router.push(`/(app)/child/${ch.id}` as any)}>
                <View style={[{ backgroundColor: '#fff', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 10 }, shadow.card]}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: t.fill, alignItems: 'center', justifyContent: 'center' }}>
                    <Silhouette size={15} fill={t.stroke} />
                  </View>
                  <Text style={{ flex: 1, fontFamily: font.body400, fontSize: 13.5, color: color.muted }} numberOfLines={1}>
                    <Text style={{ fontFamily: font.display700, color: color.ink }}>{ch.name}</Text>
                    {ch.birthDate ? `  ·  ${ageLabel(ch.birthDate)} · ${STAGE_LABEL[stageFrom(ch.birthDate)]}` : '  ·  No birth date'}
                  </Text>
                  {sel ? (
                    <View style={{ backgroundColor: t.fill, borderRadius: 999, paddingVertical: 2, paddingHorizontal: 8 }}><Text style={{ fontFamily: font.body700, fontSize: 9, color: t.stroke }}>ACTIVE</Text></View>
                  ) : (
                    <Pressable onPress={() => setActiveChild(ch.id)} hitSlop={8} style={{ paddingHorizontal: 4 }}><Text style={{ fontFamily: font.body700, fontSize: 11.5, color: color.primary }}>Set active</Text></Pressable>
                  )}
                  <ChevronRight size={16} color={color.faint} />
                </View>
              </Pressable>
            );
          })}
          <Button label="+ Add child" variant="secondary" onPress={openAdd} />
        </>
      )}

      {/* Family & caregivers — live day/night dial + editable member list */}
      <View style={{ gap: 10, marginTop: 6 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Family &amp; caregivers</Text>
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 14, alignItems: 'center' }, shadow.card]}>
          <FamilyDial people={tzPeople} />
        </View>
        {tzPeople.map((p) => {
          const rs = roleStyle(p.role);
          const avatar = (
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: p.isYou ? p.color : rs.bg, alignItems: 'center', justifyContent: 'center' }}>
              {p.isYou ? <Text style={{ fontFamily: font.display700, fontSize: 14, color: '#fff' }}>{p.initial}</Text> : <Text style={{ fontSize: 15 }}>{rs.emoji}</Text>}
            </View>
          );
          const info = (
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }} numberOfLines={1}>{p.name}</Text>
              <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }} numberOfLines={1}>
                {p.isYou ? (p.location || p.tz) : [p.role ?? 'Caregiver', p.location].filter(Boolean).join(' · ')}
              </Text>
            </View>
          );
          return (
            <View key={p.key} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.card]}>
              {p.onEdit ? (
                <Pressable onPress={p.onEdit} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0 }}>{avatar}{info}</Pressable>
              ) : (
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0 }}>{avatar}{info}</View>
              )}
              {p.tz && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: font.body600, fontSize: 13, color: color.ink }}>{fmtTime(p.tz, now)}</Text>
                  <Text style={{ fontFamily: font.body500, fontSize: 11, color: tzAwake(p.hour) ? color.maternalTeal : color.muted }}>{tzAwake(p.hour) ? 'Awake' : 'Asleep'}</Text>
                </View>
              )}
              {p.onDelete && <Pressable onPress={p.onDelete} hitSlop={8} style={{ paddingLeft: 4 }}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>}
            </View>
          );
        })}
        <Button label="+ Add person" variant="secondary" onPress={() => openMember()} />
        <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.muted, lineHeight: 17 }}>Tap anyone to edit. The ring is a 24-hour day/night clock — anyone on the bright arc is likely awake (7am–10pm local). Add a timezone to place someone on it.</Text>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Add a child</Text>
            <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Oliver" autoCapitalize="words" />
            <DateField label="Birth date (optional)" value={birth} onChangeText={setBirth} optional />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {CHILD_COLORS.map((k) => {
                const t = childToken[k]; const sel = k === colorKey;
                return (
                  <Pressable key={k} onPress={() => setColorKey(k)}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: t.fill, borderWidth: sel ? 3 : 1, borderColor: sel ? t.stroke : color.hairline, alignItems: 'center', justifyContent: 'center' }}>
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: t.stroke }} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Notice text={error} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setOpen(false)} style={{ flex: 1 }} />
              <Button label="Add" onPress={save} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add family member modal */}
      <Modal visible={memberOpen} transparent animationType="fade" onRequestClose={() => setMemberOpen(false)}>
        <Pressable onPress={() => setMemberOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>{mEditId ? 'Edit person' : 'Add person'}</Text>
            <Field label="Name" value={mName} onChangeText={(t) => { setMName(t); if (mErr) setMErr(''); }} placeholder="e.g. James" autoCapitalize="words" />
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: color.muted }}>Relationship</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {ROLES.map((r) => {
                  const sel = r === mRole;
                  return (
                    <Pressable key={r} onPress={() => setMRole(r)} style={{ paddingVertical: 8, paddingHorizontal: 13, borderRadius: radius.pill, backgroundColor: sel ? color.primary : '#fff', borderWidth: 1, borderColor: sel ? color.primary : color.hairline }}>
                      <Text style={{ fontFamily: font.body600, fontSize: 12.5, color: sel ? '#fff' : color.ink }}>{r}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: color.muted }}>Timezone (optional)</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {mTz !== '' && !TZ_PRESETS.includes(mTz) && (
                  <View style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: color.primary, borderWidth: 1, borderColor: color.primary }}>
                    <Text style={{ fontFamily: font.body500, fontSize: 11, color: '#fff' }}>{mTz.split('/')[1]?.replace('_', ' ') || mTz}</Text>
                  </View>
                )}
                {TZ_PRESETS.map((p) => {
                  const sel = mTz === p;
                  return (
                    <Pressable key={p} onPress={() => setMTz(sel ? '' : p)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: sel ? color.primary : '#fff', borderWidth: 1, borderColor: sel ? color.primary : color.hairline }}>
                      <Text style={{ fontFamily: font.body500, fontSize: 11, color: sel ? '#fff' : color.inkSecondary }}>{p.split('/')[1]?.replace('_', ' ')}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted }}>Adding a timezone places them on the day/night ring.</Text>
            </View>
            <Field label="Location (optional)" value={mLoc} onChangeText={setMLoc} placeholder="e.g. London" autoCapitalize="words" />
            <Notice text={mErr} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setMemberOpen(false)} style={{ flex: 1 }} />
              <Button label={mEditId ? 'Save' : 'Add'} onPress={saveMember} style={{ flex: 1 }} />
            </View>
            {mEditId && (
              <Pressable onPress={() => { deleteCaregiver(mEditId); setMemberOpen(false); toast('Removed'); }} hitSlop={6} style={{ alignItems: 'center', paddingTop: 2 }}>
                <Text style={{ fontFamily: font.body600, fontSize: 13, color: '#B04070' }}>Remove person</Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
