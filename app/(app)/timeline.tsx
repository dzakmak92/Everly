import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal, TextInput, Share, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, radius, shadow, childToken } from '../../src/theme/tokens';
import { useData, type Milestone, type Child } from '../../src/lib/store';
import { pickMedia, type MediaRef } from '../../src/lib/pickMedia';
import { getMediaURL } from '../../src/lib/mediaStore';
import { MILESTONE_TEMPLATE, MILESTONE_STAGES, type MilestoneTemplate } from '../../src/lib/milestones';
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

/** Open a stored blob (used for playing a video) in a new browser tab (web). */
function openBlobTab(id: string) {
  getMediaURL(id).then((url) => {
    if (!url || Platform.OS !== 'web' || typeof document === 'undefined') return;
    const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.click();
  });
}

/** A row of photo/video thumbnails with an "add" tile. */
function MediaStrip({ items, onAdd, onOpen, onRemove }: { items: MediaRef[]; onAdd: () => void; onOpen: (m: MediaRef) => void; onRemove?: (m: MediaRef) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
      {items.map((m) => (
        <Pressable key={m.id} onPress={() => onOpen(m)} onLongPress={() => onRemove?.(m)} delayLongPress={400} style={{ width: 62, height: 62, borderRadius: 10, overflow: 'hidden', backgroundColor: '#ECE8F2' }}>
          {m.thumb ? <Image source={{ uri: m.thumb }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : null}
          {m.kind === 'video' ? (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.18)' }}>
              <Text style={{ color: '#fff', fontSize: 18 }}>▶</Text>
            </View>
          ) : null}
        </Pressable>
      ))}
      <Pressable onPress={onAdd} accessibilityLabel="Add photo or video" style={{ width: 62, height: 62, borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed', borderColor: color.faint, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <Camera size={17} color={color.muted} />
        <Text style={{ fontFamily: font.body700, fontSize: 8.5, color: color.muted }}>Add</Text>
      </Pressable>
    </View>
  );
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
  addMilestone: (input: { childId: string; title: string; date: string; note?: string }) => string;
  deleteMilestone: (id: string) => void;
}) {
  const { milestoneMedia, addMilestoneMedia, removeMilestoneMedia } = useData();
  const list = useMemo(() => milestones.filter((m) => m.childId === child.id), [milestones, child.id]);

  const headerName = `${child.name}'s story`;
  const age = child.birthDate ? ageLabel(child.birthDate) : '';

  // ── Template suggestions: template moments not yet captured, near this age ──
  const norm = (s: string) => s.trim().toLowerCase();
  const captured = useMemo(() => new Set(list.map((m) => norm(m.title))), [list]);
  const msDay = 86400000;
  const birthMs = child.birthDate ? new Date(`${child.birthDate}T00:00:00`).getTime() : null;
  const ageDaysNow = birthMs != null ? Math.floor((Date.now() - birthMs) / msDay) : 0;
  const suggestedDate = (t: MilestoneTemplate) => (birthMs != null ? new Date(birthMs + t.ageDays * msDay).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
  const uncaptured = useMemo(() => MILESTONE_TEMPLATE.filter((t) => !captured.has(norm(t.title))).sort((a, b) => a.ageDays - b.ageDays), [captured]);
  // inline suggestions: the moments closest to this child's current age, shown in order.
  const suggestions = useMemo(() => {
    const closest = [...uncaptured].sort((a, b) => Math.abs(a.ageDays - ageDaysNow) - Math.abs(b.ageDays - ageDaysNow)).slice(0, 6);
    return closest.sort((a, b) => a.ageDays - b.ageDays);
  }, [uncaptured, ageDaysNow]);

  const subtitle = [age, `${list.length} captured`, uncaptured.length ? `${uncaptured.length} to go ✨` : 'complete 🎉'].filter(Boolean).join(' · ');

  const [open, setOpen] = useState(false);
  const [browse, setBrowse] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [pending, setPending] = useState<MediaRef[]>([]);
  const [viewer, setViewer] = useState<{ ref: MediaRef; url: string | null } | null>(null);

  function openAdd(prefill?: { title: string; date: string }) {
    setTitle(prefill?.title ?? '');
    setDate(prefill?.date ?? new Date().toISOString().slice(0, 10));
    setNote('');
    setPending([]);
    setBrowse(false);
    setOpen(true);
  }
  function save() {
    if (!title.trim()) {
      setOpen(false);
      return;
    }
    const id = addMilestone({
      childId: child.id,
      title,
      date: date.trim() || new Date().toISOString().slice(0, 10),
      note,
    });
    if (pending.length) addMilestoneMedia(id, pending);
    setPending([]);
    setOpen(false);
  }
  const openMedia = (m: MediaRef) => {
    if (m.kind === 'video') { openBlobTab(m.id); return; }
    getMediaURL(m.id).then((url) => setViewer({ ref: m, url: url ?? m.thumb }));
  };

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

        {list.length === 0 && suggestions.length === 0 ? (
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
                  <MediaStrip
                    items={milestoneMedia[m.id] ?? []}
                    onAdd={() => pickMedia().then((picked) => addMilestoneMedia(m.id, picked))}
                    onOpen={openMedia}
                    onRemove={(md) => removeMilestoneMedia(m.id, md.id)}
                  />
                </View>
              </Pressable>
            );
          })
        )}

        {/* suggested moments from the template (tap to capture) */}
        {suggestions.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => openAdd({ title: t.title, date: suggestedDate(t) })}
            style={{ flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 12 }}
          >
            <View style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: color.faint, backgroundColor: '#F4F3FB', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
              <Text style={{ fontSize: 15 }}>{t.emoji}</Text>
            </View>
            <View style={{ flex: 1, borderWidth: 1.5, borderColor: '#E4E0EE', borderStyle: 'dashed', borderRadius: 16, paddingVertical: 11, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.muted }} numberOfLines={1}>{t.title}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.faint, marginTop: 1 }}>{t.hint} · tap to capture</Text>
              </View>
              <View style={{ backgroundColor: '#EEF0FF', borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: 11 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 11.5, color: color.primary }}>＋ Add</Text>
              </View>
            </View>
          </Pressable>
        ))}

        {/* add a memory row (also sits on the spine) */}
        <Pressable
          onPress={() => openAdd()}
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
          <Text style={{ fontFamily: font.body600, fontSize: 14, color: color.muted }}>Add your own memory…</Text>
        </Pressable>
      </View>

      {/* Browse the full milestone template */}
      <Pressable
        onPress={() => setBrowse(true)}
        style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 }}
      >
        <Star size={15} color={color.primary} />
        <Text style={{ fontFamily: font.body700, fontSize: 13.5, color: color.primary }}>Browse all milestones{uncaptured.length ? ` (${uncaptured.length})` : ''}</Text>
      </Pressable>

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

            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.inkSecondary }}>Photos &amp; video</Text>
              {pending.length > 0 ? (
                <MediaStrip items={pending} onAdd={() => pickMedia().then((p) => setPending((cur) => [...cur, ...p]))} onOpen={openMedia} onRemove={(m) => setPending((cur) => cur.filter((x) => x.id !== m.id))} />
              ) : (
                <Pressable onPress={() => pickMedia().then((p) => setPending((cur) => [...cur, ...p]))} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: '#DAD3E8', borderStyle: 'dashed', borderRadius: 12, paddingVertical: 13 }}>
                  <Camera size={17} color={color.primary} />
                  <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>Add photos or a video</Text>
                </Pressable>
              )}
            </View>

            <Pressable
              onPress={save}
              style={{ backgroundColor: color.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 2 }}
            >
              <Text style={{ fontFamily: font.body700, fontSize: 15, color: '#fff' }}>Save moment</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Full-screen media viewer (photos) */}
      <Modal visible={!!viewer} transparent animationType="fade" onRequestClose={() => setViewer(null)}>
        <Pressable onPress={() => setViewer(null)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          {viewer?.url ? <Image source={{ uri: viewer.url }} style={{ width: '100%', height: '82%' }} resizeMode="contain" /> : null}
          <Text style={{ fontFamily: font.body600, fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 14 }}>Tap to close</Text>
        </Pressable>
      </Modal>

      {/* Milestone template picker */}
      <Modal visible={browse} transparent animationType="fade" onRequestClose={() => setBrowse(false)}>
        <Pressable onPress={() => setBrowse(false)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 22 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 18, maxHeight: '84%' }, shadow.card]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Add a milestone</Text>
              <Pressable onPress={() => setBrowse(false)} hitSlop={8}><X size={20} color={color.muted} /></Pressable>
            </View>
            <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted, marginBottom: 8 }}>Pre-filled moments — tap one, then add your date, note and photo.</Text>
            <ScrollView style={{ maxHeight: '82%' }} showsVerticalScrollIndicator={false}>
              {MILESTONE_STAGES.map((stage) => {
                const items = MILESTONE_TEMPLATE.filter((t) => t.stage === stage);
                return (
                  <View key={stage} style={{ marginBottom: 6 }}>
                    <Text style={{ fontFamily: font.body700, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', color: color.muted, marginTop: 10, marginBottom: 6, paddingHorizontal: 2 }}>{stage}</Text>
                    {items.map((t) => {
                      const done = captured.has(norm(t.title));
                      return (
                        <Pressable key={t.key} disabled={done} onPress={() => openAdd({ title: t.title, date: suggestedDate(t) })}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#fff', borderRadius: 13, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 7, opacity: done ? 0.5 : 1 }}>
                          <Text style={{ fontSize: 18 }}>{t.emoji}</Text>
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text style={{ fontFamily: font.body700, fontSize: 13.5, color: color.ink }} numberOfLines={1}>{t.title}</Text>
                            <Text style={{ fontFamily: font.body400, fontSize: 10.5, color: color.muted }}>{t.hint}</Text>
                          </View>
                          {done
                            ? <Text style={{ fontFamily: font.body700, fontSize: 11, color: color.maternalTeal }}>Added ✓</Text>
                            : <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#EEF0FF', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: font.body700, fontSize: 16, color: color.primary }}>＋</Text></View>}
                        </Pressable>
                      );
                    })}
                  </View>
                );
              })}
            </ScrollView>
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
