import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';
import { color, font, radius, shadow, childToken } from '../../../src/theme/tokens';
import { Button, Field } from '../../../src/components/forms';
import { DateField } from '../../../src/components/DateField';
import { Silhouette } from '../../../src/components/ui';
import {
  ChevronLeft, Plus, Clock, Bottle, Syringe, Star, Activity as ActivityIcon,
  Heart, Shield, Check, Calendar, MessageSquare,
} from '../../../src/components/icons';
import { ageLabel, stageFrom, STAGE_LABEL, type Stage } from '../../../src/lib/age';
import {
  useData, entriesOn, upcomingEvents, entryDetail, ENTRY_META,
  CHILD_COLORS, type ChildColor,
} from '../../../src/lib/store';
import { useFeedback } from '../../../src/components/Feedback';

const num = (s: string) => { const v = parseFloat(s); return isNaN(v) ? undefined : v; };
const dateOf = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const fmtBirth = (iso?: string) => {
  if (!iso) return null;
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const PERIWINKLE = '#6B6FC9';
const LILAC = '#E7E4FB';
const FAINT = '#C8C6DC';
const HAIRLINE = 'rgba(51,50,74,0.05)';

/** The six visible spine cells (youngAdult folds into the Teen cell). */
const SPINE: { stage: Stage; label: string }[] = [
  { stage: 'expecting', label: 'Expecting' },
  { stage: 'newborn', label: 'Newborn' },
  { stage: 'baby', label: 'Baby' },
  { stage: 'preschool', label: 'Preschool' },
  { stage: 'school', label: 'School' },
  { stage: 'teen', label: 'Teen' },
];
/** Whether the dashboard should show the baby (logging) layout vs school layout. */
const BABY_STAGES: Stage[] = ['expecting', 'newborn', 'baby', 'preschool'];

export default function ChildProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const d = useData();
  const { toast } = useFeedback();
  const child = d.children.find((c) => c.id === id);

  const [modal, setModal] = useState<null | 'edit' | 'vaccine' | 'med' | 'growth' | 'milestone'>(null);
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [colorKey, setColorKey] = useState<ChildColor>(CHILD_COLORS[0]);
  const [f1, setF1] = useState('');
  const [f2, setF2] = useState('');

  if (!child) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.canvas, paddingHorizontal: 24, gap: 16 }}>
        <Text style={{ fontFamily: font.body600, fontSize: 15, color: color.ink }}>Child not found.</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.primary }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const t = childToken[child.color];
  const stage = child.birthDate ? stageFrom(child.birthDate) : 'newborn';
  // youngAdult shares the Teen spine cell.
  const activeStageCell: Stage = stage === 'youngAdult' ? 'teen' : stage;
  const isBaby = BABY_STAGES.includes(stage);

  const today = entriesOn(d.entries).filter((e) => e.childId === child.id);
  const recent = d.entries.filter((e) => e.childId === child.id).slice(0, 6);
  const myVaccines = d.vaccines.filter((v) => v.childId === child.id);
  const myMeds = d.medications.filter((m) => m.childId === child.id);
  const myGrowth = d.growth.filter((g) => g.childId === child.id);
  const latestGrowth = myGrowth[0];
  const myMilestones = d.milestones.filter((m) => m.childId === child.id);
  const myChores = d.chores.filter((c) => c.childId === child.id);
  const myEvents = upcomingEvents(d.events).filter((e) => e.childId === child.id);
  const isSameDay = (iso: string, ref: Date) => {
    const x = new Date(iso);
    return x.getFullYear() === ref.getFullYear() && x.getMonth() === ref.getMonth() && x.getDate() === ref.getDate();
  };
  const todayEvents = d.events.filter((e) => e.childId === child.id && isSameDay(e.at, new Date()));

  // Baby hero stats
  const feeds = today.filter((e) => e.kind === 'feed').length;
  const ml = today.filter((e) => e.kind === 'feed' || e.kind === 'pump').reduce((s, e) => s + (e.volumeMl ?? 0), 0);
  const sleepMin = today.filter((e) => e.kind === 'sleep').reduce((s, e) => s + (e.durationMin ?? 0), 0);
  const sleepLabel = sleepMin ? (sleepMin >= 60 ? `${Math.floor(sleepMin / 60)}h` : `${sleepMin}m`) : '—';
  const sleepCount = today.filter((e) => e.kind === 'sleep').length;

  // School hero stats
  const choresDone = myChores.filter((c) => c.done).length;
  const choresTotal = myChores.length;

  function openEdit() { setName(child!.name); setBirth(child!.birthDate ?? ''); setColorKey(child!.color); setModal('edit'); }
  function openAdd(m: 'vaccine' | 'med' | 'growth' | 'milestone') {
    setName(''); setF2('');
    setF1(m === 'milestone' ? new Date().toISOString().slice(0, 10) : '');
    setModal(m);
  }
  function save() {
    let ok = false;
    if (modal === 'edit') { d.updateChild(child!.id, { name, birthDate: birth, color: colorKey }); ok = true; }
    else if (modal === 'vaccine' && name.trim()) { d.addVaccine({ childId: child!.id, name, dueDate: f1 }); ok = true; }
    else if (modal === 'med' && name.trim()) { d.addMedication({ childId: child!.id, name, dose: f1, schedule: f2 }); ok = true; }
    else if (modal === 'growth') { const w = num(f1); const h = num(f2); if (w != null || h != null) { d.addGrowth({ childId: child!.id, weightKg: w, heightCm: h }); ok = true; } }
    else if (modal === 'milestone' && name.trim()) { d.addMilestone({ childId: child!.id, title: name, date: f1 || new Date().toISOString().slice(0, 10), note: f2 }); ok = true; }
    if (ok) toast('Saved');
    setModal(null);
  }
  function remove() { d.deleteChild(child!.id); router.back(); }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: insets.bottom + 36 }}
    >
      {/* Back */}
      <Pressable onPress={() => router.back()} style={{ width: 44, height: 44, marginLeft: 12, justifyContent: 'center', alignItems: 'center' }} hitSlop={8}>
        <ChevronLeft size={24} color={color.ink} />
      </Pressable>

      {/* Header: avatar · name · subtitle · stage pill */}
      <View style={{ paddingHorizontal: 22, paddingTop: 4, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: t.fill, alignItems: 'center', justifyContent: 'center' }}>
          <Silhouette size={30} fill={t.stroke} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.display700, fontSize: 22, color: color.ink }}>{child.name}</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 4 }}>
            {child.birthDate ? `${fmtBirth(child.birthDate)} · ${ageLabel(child.birthDate)}` : 'No birth date'}
          </Text>
        </View>
        <View style={{ backgroundColor: PERIWINKLE, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 16 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 12, color: '#fff' }}>{STAGE_LABEL[stage]}</Text>
        </View>
      </View>

      {/* Stage spine */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <View style={[{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' }, shadow.card]}>
          {SPINE.map((s, i) => (
            <StageCell key={s.stage} stage={s.stage} label={s.label} active={s.stage === activeStageCell} first={i === 0} last={i === SPINE.length - 1} />
          ))}
        </View>
      </View>

      {/* Age-adaptive hero: exactly 3 stat tiles */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 18, flexDirection: 'row', gap: 8 }}>
        {isBaby ? (
          <>
            <StatTile value={`${feeds}`} label="Feeds" sub={ml ? `${ml} ml` : 'none yet'} subColor={childToken.mint.stroke} />
            <StatTile value={sleepLabel} label="Sleep" sub={sleepCount ? `${sleepCount} naps` : 'none yet'} subColor={PERIWINKLE} />
            <StatTile
              value={latestGrowth?.weightKg ? `${latestGrowth.weightKg}` : '—'}
              label="Growth"
              sub={latestGrowth?.weightKg ? 'kg latest' : 'add weight'}
              subColor={color.gold}
            />
          </>
        ) : (
          <>
            <StatTile value={`${myEvents.length}`} label="Upcoming" sub={myEvents.length ? 'scheduled' : 'all clear'} subColor={color.rose} />
            <StatTile value={`${todayEvents.length}`} label="Today" sub={todayEvents.length ? 'today' : 'none today'} subColor={PERIWINKLE} />
            <StatTile
              value={choresTotal ? `${choresDone}/${choresTotal}` : '0'}
              label="Chores"
              sub={choresTotal ? (choresDone === choresTotal ? 'all done' : 'in progress') : 'none set'}
              subColor={color.gold}
            />
          </>
        )}
      </View>

      {/* Activity / Today — one grouped white card */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 18 }}>
        <SectionHeading>{isBaby ? 'Recent' : 'Today'}</SectionHeading>
        {isBaby ? (
          recent.length ? (
            <GroupCard>
              {recent.map((e, i) => {
                const meta = ENTRY_META[e.kind];
                const det = entryDetail(e);
                return (
                  <ListRow
                    key={e.id}
                    chipBg={meta.fill}
                    icon={kindIcon(e.kind, meta.ink)}
                    title={det ? `${meta.label} · ${det.split(' · ')[0]}` : meta.label}
                    sub={`${new Date(e.at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}${det && det.split(' · ').length > 1 ? ` · ${det.split(' · ').slice(1).join(' · ')}` : ''}`}
                    last={i === recent.length - 1}
                  />
                );
              })}
            </GroupCard>
          ) : (
            <Empty text="No activity logged yet." />
          )
        ) : myEvents.length ? (
          <GroupCard>
            {myEvents.slice(0, 5).map((e, i) => {
              const pill = eventPill(e.at);
              return (
                <ListRow
                  key={e.id}
                  chipBg={pill.bg}
                  icon={<Calendar size={18} color={pill.fg} />}
                  title={e.title}
                  sub={[new Date(e.at).toLocaleDateString(undefined, { weekday: 'short' }), e.location].filter(Boolean).join(' · ') || 'Scheduled'}
                  pill={pill}
                  last={i === Math.min(myEvents.length, 5) - 1}
                />
              );
            })}
          </GroupCard>
        ) : (
          <Empty text="Nothing scheduled. Add an activity from Calendar." />
        )}
      </View>

      {/* ── Management dashboard (below the designed summary) ── */}
      <View style={{ paddingHorizontal: 20, gap: 18 }}>
        {/* Quick actions */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {d.activeChild?.id !== child.id && (
            <Button label="Set active" variant="secondary" onPress={() => d.setActiveChild(child.id)} style={{ flex: 1 }} />
          )}
          <Button label="Edit" variant="secondary" onPress={openEdit} style={{ flex: 1 }} />
        </View>

        {/* Growth */}
        <View>
          <SectionHeading action={<AddLink onPress={() => openAdd('growth')} />}>Growth</SectionHeading>
          {latestGrowth ? (
            <GroupCard>
              <ListRow
                chipBg={childToken.butter.fill}
                icon={<ActivityIcon size={18} color={color.gold} />}
                title={`${latestGrowth.weightKg ? `${latestGrowth.weightKg} kg` : ''}${latestGrowth.heightCm ? `${latestGrowth.weightKg ? '  ·  ' : ''}${latestGrowth.heightCm} cm` : ''}` || 'Measurement'}
                sub={`latest · ${dateOf(latestGrowth.at)} · ${myGrowth.length} entr${myGrowth.length === 1 ? 'y' : 'ies'}`}
                last
              />
            </GroupCard>
          ) : (
            <Empty text="No measurements yet." />
          )}
        </View>

        {/* Vaccines */}
        <View>
          <SectionHeading action={<AddLink onPress={() => openAdd('vaccine')} />}>Vaccines</SectionHeading>
          {myVaccines.length ? (
            <GroupCard>
              {myVaccines.map((v, i) => (
                <ListRow
                  key={v.id}
                  chipBg={childToken.blush.fill}
                  icon={<Syringe size={18} color={childToken.blush.stroke} />}
                  title={v.name}
                  sub={v.givenDate ? `Given ${fmtBirth(v.givenDate)}` : v.dueDate ? `Due ${fmtBirth(v.dueDate)}` : 'Scheduled'}
                  trailing={
                    !v.givenDate ? (
                      <Pressable onPress={() => d.updateVaccine(v.id, { givenDate: new Date().toISOString().slice(0, 10) })} hitSlop={8}>
                        <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.maternalTeal }}>Mark given</Text>
                      </Pressable>
                    ) : (
                      <Check size={16} color={color.maternalTeal} />
                    )
                  }
                  onDelete={() => d.deleteVaccine(v.id)}
                  last={i === myVaccines.length - 1}
                />
              ))}
            </GroupCard>
          ) : (
            <Empty text="No vaccines tracked." />
          )}
        </View>

        {/* Medications */}
        <View>
          <SectionHeading action={<AddLink onPress={() => openAdd('med')} />}>Medications</SectionHeading>
          {myMeds.length ? (
            <GroupCard>
              {myMeds.map((m, i) => (
                <ListRow
                  key={m.id}
                  chipBg={childToken.mint.fill}
                  icon={<Heart size={18} color={childToken.mint.stroke} filled={false} />}
                  title={m.name}
                  sub={[m.dose, m.schedule].filter(Boolean).join(' · ') || 'No schedule'}
                  trailing={
                    <Pressable onPress={() => d.toggleMedication(m.id)} hitSlop={8}>
                      <Text style={{ fontFamily: font.body700, fontSize: 12, color: m.active ? color.maternalTeal : color.muted }}>
                        {m.active ? 'Active' : 'Paused'}
                      </Text>
                    </Pressable>
                  }
                  onDelete={() => d.deleteMedication(m.id)}
                  last={i === myMeds.length - 1}
                />
              ))}
            </GroupCard>
          ) : (
            <Empty text="No medications." />
          )}
        </View>

        {/* Milestones */}
        <View>
          <SectionHeading action={<AddLink onPress={() => openAdd('milestone')} />}>Milestones</SectionHeading>
          {myMilestones.length ? (
            <GroupCard>
              {myMilestones.map((m, i) => (
                <ListRow
                  key={m.id}
                  chipBg={childToken.lilac.fill}
                  icon={<Star size={18} color={PERIWINKLE} />}
                  title={m.title}
                  sub={[dateOf(m.date), m.note].filter(Boolean).join(' · ')}
                  onDelete={() => d.deleteMilestone(m.id)}
                  last={i === myMilestones.length - 1}
                />
              ))}
            </GroupCard>
          ) : (
            <Empty text="No milestones yet." />
          )}
        </View>

        {/* Delete */}
        <Pressable onPress={remove} style={{ alignItems: 'center', paddingVertical: 12 }} hitSlop={8}>
          <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.roseInk }}>Delete child</Text>
        </Pressable>
      </View>

      {/* Modal */}
      <Modal visible={modal !== null} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <Pressable onPress={() => setModal(null)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>
              {modal === 'edit' ? 'Edit child' : modal === 'vaccine' ? 'Add vaccine' : modal === 'med' ? 'Add medication' : modal === 'milestone' ? 'Add milestone' : 'Add measurement'}
            </Text>

            {modal === 'edit' && <>
              <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
              <DateField label="Birth date" value={birth} onChangeText={setBirth} placeholder="Pick birth date" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {CHILD_COLORS.map((k) => {
                  const ct = childToken[k]; const s = k === colorKey;
                  return <Pressable key={k} onPress={() => setColorKey(k)}><View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: ct.fill, borderWidth: s ? 3 : 1, borderColor: s ? ct.stroke : color.hairline }} /></Pressable>;
                })}
              </View>
            </>}
            {modal === 'vaccine' && <>
              <Field label="Vaccine" value={name} onChangeText={setName} placeholder="e.g. 6-in-1" autoCapitalize="sentences" />
              <DateField label="Due date (optional)" value={f1} onChangeText={setF1} optional />
            </>}
            {modal === 'med' && <>
              <Field label="Medication" value={name} onChangeText={setName} placeholder="e.g. Vitamin D" autoCapitalize="sentences" />
              <Field label="Dose (optional)" value={f1} onChangeText={setF1} placeholder="e.g. 0.5 ml" />
              <Field label="Schedule (optional)" value={f2} onChangeText={setF2} placeholder="e.g. Daily 08:00" />
            </>}
            {modal === 'growth' && <>
              <Field label="Weight (kg)" value={f1} onChangeText={setF1} placeholder="e.g. 6.4" />
              <Field label="Height (cm, optional)" value={f2} onChangeText={setF2} placeholder="e.g. 62" />
            </>}
            {modal === 'milestone' && <>
              <Field label="Milestone" value={name} onChangeText={setName} placeholder="e.g. First smile" autoCapitalize="sentences" />
              <DateField label="Date" value={f1} onChangeText={setF1} placeholder="Pick a date" />
              <Field label="Note (optional)" value={f2} onChangeText={setF2} placeholder="Anything to remember" autoCapitalize="sentences" />
            </>}

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setModal(null)} style={{ flex: 1 }} />
              <Button label="Save" onPress={save} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

/* ── pieces ─────────────────────────────────────────────────────────────── */

function SectionHeading({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingLeft: 4 }}>
      <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: color.muted }}>
        {children}
      </Text>
      {action}
    </View>
  );
}

function AddLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      <Plus size={14} color={color.primary} strokeWidth={2.5} />
      <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>Add</Text>
    </Pressable>
  );
}

function GroupCard({ children }: { children: React.ReactNode }) {
  return <View style={[{ backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden' }, shadow.card]}>{children}</View>;
}

function StatTile({ value, label, sub, subColor }: { value: string; label: string; sub: string; subColor: string }) {
  return (
    <View style={[{ flex: 1, backgroundColor: '#fff', borderRadius: 18, paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center' }, shadow.card]}>
      <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink }} numberOfLines={1}>{value}</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 9, color: color.muted, marginTop: 5, letterSpacing: 0.6, textTransform: 'uppercase' }} numberOfLines={1}>
        {label}
      </Text>
      <Text style={{ fontFamily: font.body400, fontSize: 10, color: subColor, marginTop: 5 }} numberOfLines={1}>{sub}</Text>
    </View>
  );
}

type PillSpec = { label: string; bg: string; fg: string };

function ListRow({
  chipBg, icon, title, sub, pill, trailing, onDelete, last = false,
}: {
  chipBg: string;
  icon: React.ReactNode;
  title: string;
  sub?: string;
  pill?: PillSpec;
  trailing?: React.ReactNode;
  onDelete?: () => void;
  last?: boolean;
}) {
  return (
    <View
      style={{
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: HAIRLINE,
      }}
    >
      <View style={{ width: 36, height: 36, backgroundColor: chipBg, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink, marginBottom: 2 }} numberOfLines={1}>{title}</Text>
        {!!sub && <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted }} numberOfLines={1}>{sub}</Text>}
      </View>
      {pill && (
        <View style={{ backgroundColor: pill.bg, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 10, color: pill.fg }}>{pill.label}</Text>
        </View>
      )}
      {trailing}
      {onDelete && (
        <Pressable onPress={onDelete} hitSlop={8} style={{ paddingLeft: 2 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text>
        </Pressable>
      )}
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <View style={[{ backgroundColor: '#fff', borderRadius: 18, padding: 18, alignItems: 'center' }, shadow.card]}>
      <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted, textAlign: 'center' }}>{text}</Text>
    </View>
  );
}

/* Stage spine cell — faceless silhouette glyph, lilac highlight when active. */
function StageCell({ stage, label, active, first, last }: { stage: Stage; label: string; active: boolean; first: boolean; last: boolean }) {
  const tint = active ? PERIWINKLE : FAINT;
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 4,
        alignItems: 'center',
        gap: 4,
        backgroundColor: active ? LILAC : 'transparent',
        borderLeftWidth: first ? 0 : 1,
        borderLeftColor: active ? 'rgba(51,50,74,0.08)' : 'rgba(51,50,74,0.06)',
        borderRightWidth: active && !last ? 1 : 0,
        borderRightColor: 'rgba(51,50,74,0.08)',
      }}
    >
      <StageGlyph stage={stage} fill={tint} />
      <Text style={{ fontFamily: font.body700, fontSize: 8.5, color: tint }} numberOfLines={1}>{label}</Text>
    </View>
  );
}

/* Faceless person glyph that grows with the stage — never a face or letter. */
function StageGlyph({ stage, fill }: { stage: Stage; fill: string }) {
  switch (stage) {
    case 'expecting':
      return (
        <Svg viewBox="0 0 12 15" fill={fill} width={10} height={13}>
          <Circle cx="6" cy="4" r="3.2" />
          <Path d="M1.5 13Q1.5 9.5 6 9.5Q9.5 9.5 10.5 11Q11.5 13 9 13Z" />
        </Svg>
      );
    case 'newborn':
      return (
        <Svg viewBox="0 0 12 16" fill={fill} width={10} height={14}>
          <Ellipse cx="6" cy="5.5" rx="4" ry="5" />
          <Path d="M1.5 15Q1.5 11 6 11Q10.5 11 10.5 15Z" />
        </Svg>
      );
    case 'baby':
      return (
        <Svg viewBox="0 0 14 18" fill={fill} width={12} height={16}>
          <Ellipse cx="7" cy="6" rx="4.5" ry="5.5" />
          <Path d="M1.5 17Q1.5 12 7 12Q12.5 12 12.5 17Z" />
        </Svg>
      );
    case 'preschool':
      return (
        <Svg viewBox="0 0 15 19" fill={fill} width={13} height={17}>
          <Ellipse cx="7.5" cy="6.5" rx="5" ry="6" />
          <Path d="M1.5 18Q1.5 13 7.5 13Q13.5 13 13.5 18Z" />
        </Svg>
      );
    case 'school':
      return (
        <Svg viewBox="0 0 16 21" fill={fill} width={14} height={18}>
          <Ellipse cx="8" cy="6.5" rx="5.5" ry="6" />
          <Path d="M1.5 20Q1.5 13.5 8 13.5Q14.5 13.5 14.5 20Z" />
        </Svg>
      );
    default: // teen / youngAdult
      return (
        <Svg viewBox="0 0 17 23" fill={fill} width={15} height={20}>
          <Ellipse cx="8.5" cy="7" rx="5.5" ry="6.5" />
          <Path d="M1.5 22Q1.5 14.5 8.5 14.5Q15.5 14.5 15.5 22Z" />
        </Svg>
      );
  }
}

/* Per-entry-kind icon for the Recent (baby) list. */
function kindIcon(kind: keyof typeof ENTRY_META, ink: string) {
  switch (kind) {
    case 'feed': return <Bottle size={18} color={ink} />;
    case 'pump': return <Bottle size={18} color={ink} />;
    case 'sleep': return <Clock size={18} color={ink} />;
    case 'diaper': return <Shield size={18} color={ink} />;
    default: return <MessageSquare size={16} color={ink} />;
  }
}

/* Status pill for school-age activity rows: Today (lilac) / Soon (blush) / Done (mint). */
function eventPill(at: string): PillSpec {
  const now = new Date();
  const d = new Date(at);
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(d) - startOfDay(now)) / 86400000);
  if (dayDiff < 0) return { label: 'Done ✓', bg: childToken.mint.fill, fg: childToken.mint.stroke };
  if (dayDiff === 0) return { label: 'Today', bg: LILAC, fg: PERIWINKLE };
  return { label: d.toLocaleDateString(undefined, { weekday: 'short' }), bg: childToken.blush.fill, fg: childToken.blush.stroke };
}
