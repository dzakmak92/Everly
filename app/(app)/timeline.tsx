import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal, TextInput, Share, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, radius, shadow, childToken } from '../../src/theme/tokens';
import { useData, type Milestone } from '../../src/lib/store';
import { ageLabel } from '../../src/lib/age';
import { Star, Heart, Camera, Bottle, Activity, Leaf, Download, Plus, Archive, X } from '../../src/components/icons';

/* A10 · Lifelong Timeline — "{child}'s story": milestone spine + keepsake export.
   Real data (milestones), inline add + long-press delete preserved. */

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

export default function TimelineTab() {
  const insets = useSafeAreaInsets();
  const { milestones, children, activeChild, addMilestone, deleteMilestone } = useData();

  const childName = (id?: string) => children.find((c) => c.id === id)?.name;

  // Default to the active child's story; fall back to the first child with milestones.
  const storyChild = activeChild ?? children[0] ?? null;
  const list = storyChild ? milestones.filter((m) => m.childId === storyChild.id) : milestones;

  const headerName = storyChild?.name ? `${storyChild.name}'s story` : 'Their story';
  const age = storyChild?.birthDate ? ageLabel(storyChild.birthDate) : '';
  const subtitle = [age, `${list.length} moment${list.length === 1 ? '' : 's'}`].filter(Boolean).join(' · ');

  // Add-memory modal state.
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
    if (!storyChild || !title.trim()) {
      setOpen(false);
      return;
    }
    addMilestone({
      childId: storyChild.id,
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
    <View style={{ flex: 1, backgroundColor: color.canvas }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 36, paddingHorizontal: 22 }}
        showsVerticalScrollIndicator={false}
      >
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
          {/* gradient spine (only when there is at least one node) */}
          {(list.length > 0) && (
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
                {storyChild
                  ? `No moments captured yet.\nAdd ${storyChild.name}'s first memory below.`
                  : 'Add a child on the Family tab to start their story.'}
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
                  {/* node */}
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
                  {/* card */}
                  <View style={[{ flex: 1, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16 }, shadow.card]}>
                    <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted, marginBottom: 4 }}>
                      {fmtDate(m.date)}
                      {childName(m.childId) && !storyChild ? ` · ${childName(m.childId)}` : ''}
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
      </ScrollView>

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

            {!storyChild ? (
              <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>
                Add a child on the Family tab first.
              </Text>
            ) : (
              <>
                <Field label="Milestone" value={title} onChangeText={setTitle} placeholder="e.g. First smile" autoCapitalize="sentences" />
                <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-06-25" />
                <Field label="Note (optional)" value={note} onChangeText={setNote} placeholder="Anything to remember" autoCapitalize="sentences" />
                <Pressable
                  onPress={save}
                  style={{ backgroundColor: color.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 2 }}
                >
                  <Text style={{ fontFamily: font.body700, fontSize: 15, color: '#fff' }}>Save moment</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
