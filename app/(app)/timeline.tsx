import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal, TextInput, Share, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, radius, shadow, childToken } from '../../src/theme/tokens';
import { useData, type Milestone, type Child } from '../../src/lib/store';
import { ageLabel } from '../../src/lib/age';
import { BAND_LABEL, type EpdsBand } from '../../src/lib/epds';
import { youStoryEvents } from '../../src/lib/story';
import { Silhouette } from '../../src/components/ui';
import { Star, Heart, Camera, Bottle, Activity, Leaf, Download, Plus, Archive, X, ChevronLeft } from '../../src/components/icons';
import { DateField } from '../../src/components/DateField';

/* A10 · Lifelong Timeline — unified "Story" screen.
   A subject switcher at the top selects whose story to show:
   - a CHILD subject → that child's milestone spine (real data, inline add + long-press delete)
   - the "You" subject → the maternal story (preconception → recovery), ported from mat-timeline.
   Initial subject is read from ?subject=you or ?child=<id>; default = active child (or first child, or You). */

type Subject = { kind: 'child'; child: Child } | { kind: 'you' };

/** Choose a node color token + icon from the milestone title/note keywords. */
function glyphFor(m: Milestone): { fill: string; ink: string; icon: React.ReactNode } {
  const t = `${m.title} ${m.note ?? ''}`.toLowerCase();
  const tk = childToken;
  const mk = (k: keyof typeof childToken) => tk[k];
  if (/(smile|laugh|first word|star|word|talk|sing)/.test(t)) {
    const c = mk('butter');
    return { fill: c.fill, ink: c.stroke, icon: <Star size={14} color={c.stroke} /> };
  }
  if (/(love|hug|kiss|heart|cuddle)/.test(t)) {
    const c = mk('blush');
    return { fill: c.fill, ink: c.stroke, icon: <Heart size={13} color={c.stroke} filled /> };
  }
  if (/(photo|picture|bath|swim|pool|water)/.test(t)) {
    const c = mk('sky');
    return { fill: c.fill, ink: c.stroke, icon: <Camera size={14} color={c.stroke} /> };
  }
  if (/(solid|food|eat|feed|bottle|milk|wean|potato|taste)/.test(t)) {
    const c = mk('mint');
    return { fill: c.fill, ink: c.stroke, icon: <Bottle size={14} color={c.stroke} /> };
  }
  if (/(crawl|walk|step|roll|stand|move|run)/.test(t)) {
    const c = mk('peach');
    return { fill: c.fill, ink: c.stroke, icon: <Activity size={14} color={c.stroke} /> };
  }
  if (/(grow|tooth|sit|tall)/.test(t)) {
    const c = mk('sage');
    return { fill: c.fill, ink: c.stroke, icon: <Leaf size={14} color={c.stroke} /> };
  }
  // default — periwinkle star
  return { fill: color.primary, ink: color.primary, icon: <Star size={13} color="#fff" /> };
}

function fmtDate(iso: string) {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function fmtMonthYear(iso: string) {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

export default function TimelineTab({ embedded }: { embedded?: boolean }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ subject?: string; child?: string }>();
  const {
    milestones,
    children,
    activeChild,
    addMilestone,
    deleteMilestone,
    lastPeriod,
    dueDate,
    maternalBirth,
    epdsResults,
    recoveryLogs,
    pregArchive,
  } = useData();

  // ── Subject selection ────────────────────────────────────────────────────
  // Initial subject from params: subject=you → You; child=<id> → that child;
  // default = active child, else first child, else You.
  const initialKey = useMemo<string>(() => {
    if (params.subject === 'you') return 'you';
    if (params.child && children.some((c) => c.id === params.child)) return params.child;
    if (activeChild) return activeChild.id;
    if (children[0]) return children[0].id;
    return 'you';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedKey, setSelectedKey] = useState<string>(initialKey);

  // Resolve selected key → subject. If the selected child vanished, fall back.
  const subject: Subject = useMemo(() => {
    if (selectedKey !== 'you') {
      const c = children.find((ch) => ch.id === selectedKey);
      if (c) return { kind: 'child', child: c };
    }
    return { kind: 'you' };
  }, [selectedKey, children]);

  return (
    <View style={{ flex: 1, backgroundColor: color.canvas }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: embedded ? 4 : insets.top + 8, paddingBottom: insets.bottom + 36, paddingHorizontal: 22 }}
        showsVerticalScrollIndicator={false}
      >
        {/* back chevron */}
        {!embedded && (
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityLabel="Back"
            style={{ width: 40, height: 40, justifyContent: 'center', marginLeft: -8 }}
          >
            <ChevronLeft size={24} color={color.ink} />
          </Pressable>
        )}

        {/* subject switcher */}
        <SubjectSwitcher
          children={children}
          selectedKey={subject.kind === 'you' ? 'you' : subject.child.id}
          onSelect={setSelectedKey}
        />

        {subject.kind === 'child' ? (
          <ChildStory
            key={subject.child.id}
            child={subject.child}
            milestones={milestones}
            addMilestone={addMilestone}
            deleteMilestone={deleteMilestone}
          />
        ) : (
          <YouStory
            lastPeriod={lastPeriod}
            dueDate={dueDate}
            maternalBirth={maternalBirth}
            epdsResults={epdsResults}
            recoveryLogs={recoveryLogs}
            pregArchive={pregArchive}
          />
        )}
      </ScrollView>
    </View>
  );
}

/* ── Subject switcher: a chip per child (Silhouette + name) + a "You" chip ── */
function SubjectSwitcher({
  children,
  selectedKey,
  onSelect,
}: {
  children: Child[];
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  const Chip = ({
    active,
    onPress,
    tint,
    label,
    accessibilityLabel,
  }: {
    active: boolean;
    onPress: () => void;
    tint: string;
    label: string;
    accessibilityLabel: string;
  }) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
          paddingVertical: 7,
          paddingHorizontal: 12,
          borderRadius: radius.pill,
          backgroundColor: active ? color.primary : '#fff',
        },
        active ? shadow.row : shadow.row,
      ]}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: active ? 'rgba(255,255,255,0.25)' : '#F4F3FB',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Silhouette size={16} fill={active ? '#fff' : tint} />
      </View>
      <Text
        style={{
          fontFamily: font.body700,
          fontSize: 13,
          color: active ? '#fff' : color.inkSecondary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 10, paddingRight: 4 }}
      style={{ marginBottom: 8 }}
    >
      {children.map((c) => (
        <Chip
          key={c.id}
          active={selectedKey === c.id}
          onPress={() => onSelect(c.id)}
          tint={childToken[c.color]?.stroke ?? color.primary}
          label={c.name}
          accessibilityLabel={`Show ${c.name}'s story`}
        />
      ))}
      <Chip
        active={selectedKey === 'you'}
        onPress={() => onSelect('you')}
        tint={color.maternalTeal}
        label="You"
        accessibilityLabel="Show your story"
      />
    </ScrollView>
  );
}

/* ── Child story: milestone spine, inline add, long-press delete ─────────── */
function ChildStory({
  child,
  milestones,
  addMilestone,
  deleteMilestone,
}: {
  child: Child;
  milestones: Milestone[];
  addMilestone: (input: { childId: string; title: string; date: string; note?: string }) => void;
  deleteMilestone: (id: string) => void;
}) {
  const list = useMemo(() => milestones.filter((m) => m.childId === child.id), [milestones, child.id]);

  const headerName = `${child.name}'s story`;
  const age = child.birthDate ? ageLabel(child.birthDate) : '';
  const subtitle = [age, `${list.length} moment${list.length === 1 ? '' : 's'}`].filter(Boolean).join(' · ');

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  function openAdd() {
    setTitle('');
    setDate(new Date().toISOString().slice(0, 10));
    setNote('');
    setOpen(true);
  }
  function save() {
    if (!title.trim()) {
      setOpen(false);
      return;
    }
    addMilestone({
      childId: child.id,
      title,
      date: date.trim() || new Date().toISOString().slice(0, 10),
      note,
    });
    setOpen(false);
  }

  async function exportStory() {
    const lines = list.map(
      (m) => `• ${m.title} — ${fmtDate(m.date)}${m.note ? ` (${m.note})` : ''}`,
    );
    const text = list.length
      ? `${headerName}\n\n${lines.join('\n')}\n\nvia Everly`
      : `${headerName} — no moments captured yet.`;
    try {
      const nav = typeof navigator !== 'undefined' ? (navigator as any) : undefined;
      if (Platform.OS === 'web' && nav?.share) await nav.share({ text });
      else await Share.share({ message: text });
    } catch {
      /* user cancelled or unsupported — no-op */
    }
  }

  return (
    <>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink }}>{headerName}</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted, marginTop: 5 }}>{subtitle}</Text>
        </View>
        <Pressable
          onPress={exportStory}
          hitSlop={8}
          accessibilityLabel="Export story"
          style={[
            { width: 40, height: 40, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
            shadow.row,
          ]}
        >
          <Download size={18} color={color.primary} />
        </Pressable>
      </View>

      {/* spine + milestone cards */}
      <View style={{ position: 'relative' }}>
        {list.length > 0 && (
          <LinearGradient
            colors={[color.primary, 'rgba(107,111,201,0.18)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ position: 'absolute', left: 15, top: 14, bottom: 0, width: 2, borderRadius: 999 }}
          />
        )}

        {list.length === 0 ? (
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 22, alignItems: 'center' }, shadow.card]}>
            <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.muted, textAlign: 'center', lineHeight: 20 }}>
              {`No moments captured yet.\nAdd ${child.name}'s first memory below.`}
            </Text>
          </View>
        ) : (
          list.map((m) => {
            const g = glyphFor(m);
            return (
              <Pressable
                key={m.id}
                onLongPress={() => deleteMilestone(m.id)}
                delayLongPress={400}
                style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: g.fill,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 4,
                    zIndex: 1,
                  }}
                >
                  {g.icon}
                </View>
                <View style={[{ flex: 1, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16 }, shadow.card]}>
                  <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted, marginBottom: 4 }}>
                    {fmtDate(m.date)}
                  </Text>
                  <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.ink }}>{m.title}</Text>
                  {m.note ? (
                    <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.inkSecondary, lineHeight: 18, marginTop: 3 }}>
                      {m.note}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })
        )}

        {/* add a memory row (also sits on the spine) */}
        <Pressable
          onPress={openAdd}
          style={{ flexDirection: 'row', gap: 14, alignItems: 'center', marginTop: 2, marginBottom: 6 }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              backgroundColor: '#F4F3FB',
              borderRadius: 16,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: color.faint,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <Plus size={14} color={color.muted} strokeWidth={2.5} />
          </View>
          <Text style={{ fontFamily: font.body600, fontSize: 14, color: color.muted }}>Add a memory…</Text>
        </Pressable>
      </View>

      {/* keepsake CTA */}
      <Pressable
        onPress={exportStory}
        style={{
          marginTop: 18,
          borderWidth: 1.5,
          borderColor: color.primary,
          paddingVertical: 15,
          borderRadius: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
        }}
      >
        <Archive size={18} color={color.primary} />
        <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.primary }}>Create Keepsake Book</Text>
      </Pressable>

      {list.length > 0 ? (
        <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.faint, textAlign: 'center', marginTop: 12 }}>
          Long-press a moment to remove it.
        </Text>
      ) : null}

      {/* Add-memory modal */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}
        >
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Add a memory</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <X size={20} color={color.muted} />
              </Pressable>
            </View>

            <Field label="Milestone" value={title} onChangeText={setTitle} placeholder="e.g. First smile" autoCapitalize="sentences" />
            <DateField label="Date" value={date} onChangeText={setDate} placeholder="Pick a date" />
            <Field label="Note (optional)" value={note} onChangeText={setNote} placeholder="Anything to remember" autoCapitalize="sentences" />
            <Pressable
              onPress={save}
              style={{ backgroundColor: color.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 2 }}
            >
              <Text style={{ fontFamily: font.body700, fontSize: 15, color: '#fff' }}>Save moment</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

/* ── You story: maternal milestones (ported from mat-timeline.tsx) ───────── */
function YouStory({
  lastPeriod,
  dueDate,
  maternalBirth,
  epdsResults,
  recoveryLogs,
  pregArchive,
}: {
  lastPeriod: string | null;
  dueDate: string | null;
  maternalBirth: string | null;
  epdsResults: ReturnType<typeof useData>['epdsResults'];
  recoveryLogs: ReturnType<typeof useData>['recoveryLogs'];
  pregArchive: ReturnType<typeof useData>['pregArchive'];
}) {
  type Ev = { at: string; title: string; sub?: string };
  const evs = useMemo<Ev[]>(() => {
    return youStoryEvents({ lastPeriod, dueDate, maternalBirth, pregArchive, epdsResults, recoveryLogs });
  }, [lastPeriod, dueDate, maternalBirth, pregArchive, epdsResults, recoveryLogs]);

  return (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink }}>Your story</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted, marginTop: 5 }}>
          Built from your own milestones — preconception to now.
        </Text>
      </View>

      {evs.length === 0 ? (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, alignItems: 'center' }, shadow.card]}>
          <Text style={{ fontFamily: font.body500, fontSize: 14, color: color.muted, textAlign: 'center' }}>
            Your timeline fills in as you track your cycle, pregnancy, birth and recovery.
          </Text>
        </View>
      ) : (
        evs.map((e, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color.maternalTeal }} />
              {i < evs.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: color.hairline, marginTop: 2 }} />}
            </View>
            <View style={[{ flex: 1, backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, marginBottom: 6 }, shadow.card]}>
              <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{e.title}</Text>
              <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>
                {fmtMonthYear(e.at)}
                {e.sub ? ` · ${e.sub}` : ''}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'none',
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences';
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.inkSecondary }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={color.faint}
        autoCapitalize={autoCapitalize}
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontFamily: font.body500,
          fontSize: 14,
          color: color.ink,
        }}
      />
    </View>
  );
}
