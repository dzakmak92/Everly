import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button } from '../../src/components/forms';
import { ChevronLeft } from '../../src/components/icons';
import { useData } from '../../src/lib/store';
import { useFeedback } from '../../src/components/Feedback';

type Mode = 'kicks' | 'contractions';

const TARGET = 10;

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function dur(ms: number) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}
/** Format a duration given in whole seconds. */
function durSec(secs: number) {
  const m = Math.floor(secs / 60);
  return m > 0 ? `${m}m ${secs % 60}s` : `${secs}s`;
}
function clock(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** Labour & movement — Kick Counter + Contraction Timer in one screen. */
export default function LabourAndMovement() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<Mode>(params.mode === 'contractions' ? 'contractions' : 'kicks');

  const {
    kickSessions,
    addKickSession,
    deleteKickSession,
    contractionSessions,
    addContraction,
    deleteContraction,
  } = useData();
  const { toast } = useFeedback();

  // ── Kick counter state (in-progress is local; completed sessions persist) ──
  const [kicks, setKicks] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [kickNow, setKickNow] = useState(Date.now());
  const kickTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (startedAt && kicks < TARGET) {
      kickTimer.current = setInterval(() => setKickNow(Date.now()), 1000);
      return () => { if (kickTimer.current) clearInterval(kickTimer.current); };
    }
  }, [startedAt, kicks]);

  function recordKick() {
    if (kicks >= TARGET) return;
    if (!startedAt) setStartedAt(Date.now());
    setKicks((k) => k + 1);
  }
  // Save the current session (if any kicks recorded), then clear local state.
  function resetKicks() {
    const saved = kicks > 0 && startedAt;
    if (saved) {
      addKickSession({ count: kicks, durationMin: Math.max(1, Math.round((kickNow - startedAt) / 60000)) });
    }
    setKicks(0);
    setStartedAt(null);
    setKickNow(Date.now());
    if (saved) toast('Session saved');
  }

  const elapsed = startedAt ? kickNow - startedAt : 0;
  const done = kicks >= TARGET;

  // Auto-save the moment the target is reached, so a completed count is never lost.
  const savedRef = useRef(false);
  useEffect(() => {
    if (done && startedAt && !savedRef.current) {
      savedRef.current = true;
      addKickSession({ count: kicks, durationMin: Math.max(1, Math.round((kickNow - startedAt) / 60000)) });
    }
    if (!done) savedRef.current = false;
  }, [done, startedAt, kicks, kickNow, addKickSession]);

  // ── Contraction timer: in-progress contraction is local; finished ones persist ──
  const [activeStart, setActiveStart] = useState<number | null>(null);
  const [conNow, setConNow] = useState(Date.now());
  const conTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (activeStart) {
      conTimer.current = setInterval(() => setConNow(Date.now()), 250);
      return () => { if (conTimer.current) clearInterval(conTimer.current); };
    }
  }, [activeStart]);

  function toggleContraction() {
    if (activeStart) {
      const durationSec = Math.max(1, Math.round((Date.now() - activeStart) / 1000));
      // Interval = start-to-start gap from the most recent saved contraction.
      // Saved `at` is the stop time, so the previous start ≈ at − duration.
      const prev = contractionSessions[0];
      const prevStart = prev ? new Date(prev.at).getTime() - prev.durationSec * 1000 : null;
      const intervalSec = prevStart != null ? Math.max(0, Math.round((activeStart - prevStart) / 1000)) : undefined;
      addContraction({ durationSec, intervalSec });
      setActiveStart(null);
      toast('Contraction logged');
    } else {
      setActiveStart(Date.now());
      setConNow(Date.now());
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 18 }}
    >
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
        <ChevronLeft size={24} color={color.ink} />
      </Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Labour & movement</Text>

      {/* Mode toggle */}
      <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: radius.pill, padding: 4, ...shadow.card }}>
        {([
          { key: 'kicks', label: 'Kicks' },
          { key: 'contractions', label: 'Contractions' },
        ] as { key: Mode; label: string }[]).map(({ key, label }) => {
          const active = mode === key;
          return (
            <Pressable
              key={key}
              onPress={() => setMode(key)}
              style={{ flex: 1, paddingVertical: 11, borderRadius: radius.pill, alignItems: 'center', backgroundColor: active ? color.primary : 'transparent' }}
            >
              <Text style={{ fontFamily: font.body700, fontSize: 14, color: active ? '#fff' : color.inkSecondary }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {mode === 'kicks' ? (
        <>
          <Text style={{ fontFamily: font.body400, fontSize: 14, color: color.inkSecondary }}>
            Tap each time you feel a movement. Most people reach {TARGET} within two hours.
          </Text>

          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 24, alignItems: 'center', gap: 6 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 64, color: color.primary }}>{kicks}</Text>
            <Text style={{ fontFamily: font.body600, fontSize: 14, color: color.muted }}>of {TARGET} movements</Text>
            <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.inkSecondary, marginTop: 4 }}>
              {startedAt ? `Elapsed ${fmt(elapsed)}` : 'Not started'}
            </Text>
          </View>

          {done ? (
            <View style={[{ backgroundColor: '#D8F0E6', borderRadius: radius.card, padding: 18, alignItems: 'center' }]}>
              <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.tealInk }}>
                {TARGET} movements in {fmt(elapsed)} — nicely done.
              </Text>
            </View>
          ) : (
            <Pressable onPress={recordKick} style={({ pressed }) => [{ backgroundColor: color.accentRose, borderRadius: 28, paddingVertical: 28, alignItems: 'center', opacity: pressed ? 0.85 : 1 }, shadow.pinkButton]}>
              <Text style={{ fontFamily: font.body700, fontSize: 20, color: '#fff' }}>Record a kick</Text>
            </Pressable>
          )}

          <Button label={kicks > 0 ? 'Save & reset' : 'Reset'} variant="secondary" onPress={resetKicks} />

          {/* Recent sessions (persisted, newest first) */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>
              Recent sessions
            </Text>
            {kickSessions.length === 0 ? (
              <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 14, alignItems: 'center' }, shadow.card]}>
                <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>No sessions yet.</Text>
              </View>
            ) : (
              kickSessions.map((s) => (
                <View key={s.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center' }, shadow.card]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>
                      {s.count} {s.count === 1 ? 'movement' : 'movements'}{s.durationMin != null ? ` in ${s.durationMin}m` : ''}
                    </Text>
                    <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }}>{clock(s.at)}</Text>
                  </View>
                  <Pressable onPress={() => deleteKickSession(s.id)} hitSlop={8}>
                    <Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </>
      ) : (
        <>
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 24, alignItems: 'center', gap: 4 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 48, color: activeStart ? color.accentRose : color.muted }}>
              {activeStart ? dur(conNow - activeStart) : '—'}
            </Text>
            <Text style={{ fontFamily: font.body600, fontSize: 13, color: color.muted }}>
              {activeStart ? 'contraction in progress' : 'tap start when one begins'}
            </Text>
          </View>

          <Pressable onPress={toggleContraction} style={({ pressed }) => [{ backgroundColor: activeStart ? color.rose : color.primary, borderRadius: 24, paddingVertical: 22, alignItems: 'center', opacity: pressed ? 0.85 : 1 }, shadow.periwinkleButton]}>
            <Text style={{ fontFamily: font.body700, fontSize: 18, color: '#fff' }}>{activeStart ? 'Stop' : 'Start'}</Text>
          </Pressable>

          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>
              {contractionSessions.length} recorded
            </Text>
            {contractionSessions.length === 0 ? (
              <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 14, alignItems: 'center' }, shadow.card]}>
                <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>No contractions recorded yet.</Text>
              </View>
            ) : (
              contractionSessions.map((c) => (
                <View key={c.id} style={[{ backgroundColor: '#fff', borderRadius: radius.cardSm, padding: 14, flexDirection: 'row', alignItems: 'center' }, shadow.card]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{durSec(c.durationSec)}</Text>
                    <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted }}>
                      started {clock(new Date(new Date(c.at).getTime() - c.durationSec * 1000).toISOString())}
                    </Text>
                  </View>
                  {c.intervalSec != null && (
                    <Text style={{ fontFamily: font.body500, fontSize: 12, color: color.inkSecondary, marginRight: 12 }}>
                      {durSec(c.intervalSec)} apart
                    </Text>
                  )}
                  <Pressable onPress={() => deleteContraction(c.id)} hitSlop={8}>
                    <Text style={{ fontFamily: font.body700, fontSize: 18, color: color.faint }}>×</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
