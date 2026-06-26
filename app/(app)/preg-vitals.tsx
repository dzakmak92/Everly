import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal, Linking, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field } from '../../src/components/forms';
import { ChevronLeft, Phone } from '../../src/components/icons';
import { useData } from '../../src/lib/store';
import { RED_FLAGS_CALL_NOW, RED_FLAGS_CALL_SOON } from '../../src/lib/pregnancy';

const numF = (s: string) => { const v = parseFloat(s); return isNaN(v) ? undefined : v; };
const dateOf = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

function call(num: string) {
  const url = `tel:${num}`;
  if (Platform.OS === 'web' && typeof window !== 'undefined') window.location.href = url;
  else Linking.openURL(url).catch(() => {});
}

type Tab = 'monitoring' | 'triage';

export default function PregVitals() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { pregVitals, addPregVital, deletePregVital } = useData();
  const [tab, setTab] = useState<Tab>(params.tab === 'triage' ? 'triage' : 'monitoring');
  const [open, setOpen] = useState<null | 'glucose' | 'bp'>(null);
  const [g, setG] = useState('');
  const [tag, setTag] = useState('fasting');
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');

  const glucose = pregVitals.filter((v) => v.kind === 'glucose');
  const bp = pregVitals.filter((v) => v.kind === 'bp');

  function save() {
    if (open === 'glucose') addPregVital({ kind: 'glucose', glucose: numF(g), tag });
    else if (open === 'bp') addPregVital({ kind: 'bp', systolic: numF(sys), diastolic: numF(dia) });
    setG(''); setSys(''); setDia(''); setTag('fasting'); setOpen(null);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Monitoring & when to call</Text>

      {/* Segmented tab control */}
      <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: radius.pill, padding: 4, borderWidth: 1, borderColor: color.hairline }}>
        {([['monitoring', 'Monitoring'], ['triage', 'When to call']] as [Tab, string][]).map(([key, label]) => {
          const active = tab === key;
          return (
            <Pressable key={key} onPress={() => setTab(key)} style={{ flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: 'center', backgroundColor: active ? color.primary : 'transparent' }}>
              <Text style={{ fontFamily: font.body700, fontSize: 13, color: active ? '#fff' : color.muted }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'monitoring' ? (
        <>
          <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>For higher-risk pregnancies — log glucose and blood pressure, with gentle threshold alerts.</Text>

          {/* Glucose */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Blood glucose</Text>
              <Pressable onPress={() => setOpen('glucose')}><Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>+ Log</Text></Pressable>
            </View>
            {glucose.length === 0 ? <Empty t="No readings yet." /> : glucose.slice(0, 6).map((v) => {
              const high = (v.glucose ?? 0) > 7.8;
              return (
                <Row key={v.id} title={`${v.glucose} mmol/L`} sub={`${v.tag || ''} · ${dateOf(v.at)}`} flag={high ? 'High (target ≤7.8)' : undefined} onDelete={() => deletePregVital(v.id)} />
              );
            })}
          </View>

          {/* BP */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Blood pressure</Text>
              <Pressable onPress={() => setOpen('bp')}><Text style={{ fontFamily: font.body700, fontSize: 13, color: color.primary }}>+ Log</Text></Pressable>
            </View>
            {bp.length === 0 ? <Empty t="No readings yet." /> : bp.slice(0, 6).map((v) => {
              const high = (v.systolic ?? 0) >= 140 || (v.diastolic ?? 0) >= 90;
              return (
                <Row key={v.id} title={`${v.systolic}/${v.diastolic} mmHg`} sub={dateOf(v.at)} flag={high ? '⚠ High (≥140/90) — contact your midwife' : undefined} onDelete={() => deletePregVital(v.id)} />
              );
            })}
          </View>
        </>
      ) : (
        <>
          <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted, lineHeight: 19 }}>
            A triage guide, not medical advice. If in doubt, always contact your midwife or maternity unit — they would rather hear from you.
          </Text>

          <TriageSection title="Call your maternity unit now" tone="now" items={RED_FLAGS_CALL_NOW} />
          <TriageSection title="Call your midwife today" tone="soon" items={RED_FLAGS_CALL_SOON} />

          <Pressable onPress={() => call('112')} style={[{ backgroundColor: color.rose, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, shadow.pinkButton]}>
            <Phone size={18} color="#fff" />
            <Text style={{ fontFamily: font.body700, fontSize: 15, color: '#fff' }}>Call emergency services</Text>
          </Pressable>
          <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, textAlign: 'center' }}>
            Dials your local emergency number. Save your maternity unit's number in your phone for quick access.
          </Text>
        </>
      )}

      <Modal visible={open !== null} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <Pressable onPress={() => setOpen(null)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>{open === 'glucose' ? 'Log glucose' : 'Log blood pressure'}</Text>
            {open === 'glucose' ? <>
              <Field label="Glucose (mmol/L)" value={g} onChangeText={setG} placeholder="e.g. 5.2" />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['fasting', 'post-meal'].map((tg) => (
                  <Pressable key={tg} onPress={() => setTag(tg)} style={{ flex: 1, paddingVertical: 10, borderRadius: radius.tile, alignItems: 'center', backgroundColor: tag === tg ? color.primary : '#fff', borderWidth: 1, borderColor: tag === tg ? color.primary : color.hairline }}>
                    <Text style={{ fontFamily: font.body600, fontSize: 13, color: tag === tg ? '#fff' : color.ink }}>{tg}</Text>
                  </Pressable>
                ))}
              </View>
            </> : <>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}><Field label="Systolic" value={sys} onChangeText={setSys} placeholder="118" /></View>
                <View style={{ flex: 1 }}><Field label="Diastolic" value={dia} onChangeText={setDia} placeholder="74" /></View>
              </View>
            </>}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setOpen(null)} style={{ flex: 1 }} />
              <Button label="Save" onPress={save} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function TriageSection({ title, tone, items }: { title: string; tone: 'now' | 'soon'; items: string[] }) {
  return (
    <View style={{ backgroundColor: tone === 'now' ? '#FBE0EA' : '#FCE6D8', borderRadius: radius.card, padding: 16, gap: 8 }}>
      <Text style={{ fontFamily: font.body700, fontSize: 14, color: tone === 'now' ? color.roseInk : '#B5662E' }}>{title}</Text>
      {items.map((t) => (
        <View key={t} style={{ flexDirection: 'row', gap: 8 }}>
          <Text style={{ color: tone === 'now' ? color.roseInk : '#B5662E' }}>•</Text>
          <Text style={{ flex: 1, fontFamily: font.body500, fontSize: 13.5, color: color.ink, lineHeight: 19 }}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

function Empty({ t }: { t: string }) {
  return <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 14, alignItems: 'center' }, shadow.card]}><Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>{t}</Text></View>;
}
function Row({ title, sub, flag, onDelete }: { title: string; sub: string; flag?: string; onDelete: () => void }) {
  return (
    <View style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14 }, shadow.card]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.ink }}>{title}</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>{sub}</Text>
        </View>
        <Pressable onPress={onDelete} hitSlop={8}><Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text></Pressable>
      </View>
      {flag && <Text style={{ fontFamily: font.body600, fontSize: 12, color: color.roseInk, marginTop: 6 }}>{flag}</Text>}
    </View>
  );
}
