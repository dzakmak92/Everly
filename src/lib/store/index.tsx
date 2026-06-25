import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { childToken } from '../../theme/tokens';

/**
 * On-device data layer (PRD privacy model: child/maternal/health data NEVER
 * leaves the device). Backed by AsyncStorage; the Supabase layer is only ever
 * used for account/billing/config — never for the records stored here.
 */

export type ChildColor = keyof typeof childToken;
export const CHILD_COLORS = Object.keys(childToken) as ChildColor[];

export type Child = {
  id: string;
  name: string;
  color: ChildColor;
  birthDate?: string; // ISO date (YYYY-MM-DD), optional
};

export type EntryKind = 'sleep' | 'feed' | 'diaper' | 'note' | 'pump';
export type FeedSide = 'left' | 'right' | 'bottle';
export type DiaperType = 'wet' | 'dirty' | 'both';

export type Entry = {
  id: string;
  kind: EntryKind;
  at: string; // ISO timestamp
  note?: string;
  childId?: string;
  // Optional, kind-specific details (all backward-compatible):
  side?: FeedSide; // feed
  volumeMl?: number; // feed (bottle) / pump
  durationMin?: number; // sleep / feed
  diaperType?: DiaperType; // diaper
};

export type EntryDetails = Partial<Pick<Entry, 'note' | 'side' | 'volumeMl' | 'durationMin' | 'diaperType'>>;

/** A scheduled future item (appointment, activity, reminder). */
export type EventItem = {
  id: string;
  title: string;
  at: string; // ISO datetime
  childId?: string;
  location?: string;
  note?: string;
};

/** Health records (per child) — all on-device. */
export type Vaccine = { id: string; childId: string; name: string; dueDate?: string; givenDate?: string; provider?: string };
export type Medication = { id: string; childId: string; name: string; dose?: string; schedule?: string; active: boolean };
export type Growth = { id: string; childId: string; at: string; weightKg?: number; heightCm?: number; headCm?: number };

export const ENTRY_META: Record<EntryKind, { label: string; verb: string; fill: string; ink: string }> = {
  sleep: { label: 'Sleep', verb: 'Logged sleep', fill: '#E7E4FB', ink: '#54579E' },
  feed: { label: 'Feed', verb: 'Logged a feed', fill: '#FCE6D8', ink: '#B5662E' },
  diaper: { label: 'Diaper', verb: 'Logged a change', fill: '#D8F0E6', ink: '#1E5C50' },
  pump: { label: 'Pump', verb: 'Logged a pump', fill: '#FBF1CE', ink: '#7A5C20' },
  note: { label: 'Note', verb: 'Added a note', fill: '#DCEBFA', ink: '#2C5F90' },
};

const ENTRIES_KEY = 'everly.entries.v1';
const CHILDREN_KEY = 'everly.children.v1';
const ACTIVE_KEY = 'everly.activeChild.v1';
const EVENTS_KEY = 'everly.events.v1';
const VACCINES_KEY = 'everly.vaccines.v1';
const MEDS_KEY = 'everly.meds.v1';
const GROWTH_KEY = 'everly.growth.v1';

function newId() {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

type DataValue = {
  loading: boolean;
  children: Child[];
  activeChild: Child | null;
  setActiveChild: (id: string) => void;
  addChild: (input: { name: string; color: ChildColor; birthDate?: string }) => void;
  updateChild: (id: string, patch: Partial<Pick<Child, 'name' | 'color' | 'birthDate'>>) => void;
  deleteChild: (id: string) => void;
  entries: Entry[]; // newest first
  addEntry: (kind: EntryKind, details?: EntryDetails) => void;
  deleteEntry: (id: string) => void;
  events: EventItem[]; // soonest first
  addEvent: (input: { title: string; at: string; childId?: string; location?: string; note?: string }) => void;
  deleteEvent: (id: string) => void;
  vaccines: Vaccine[];
  addVaccine: (input: { childId: string; name: string; dueDate?: string; givenDate?: string; provider?: string }) => void;
  updateVaccine: (id: string, patch: Partial<Vaccine>) => void;
  deleteVaccine: (id: string) => void;
  medications: Medication[];
  addMedication: (input: { childId: string; name: string; dose?: string; schedule?: string }) => void;
  toggleMedication: (id: string) => void;
  deleteMedication: (id: string) => void;
  growth: Growth[];
  addGrowth: (input: { childId: string; weightKg?: number; heightCm?: number; headCm?: number }) => void;
  deleteGrowth: (id: string) => void;
  clearAll: () => void;
};

const DataContext = createContext<DataValue | undefined>(undefined);

export function DataProvider({ children: node }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [growth, setGrowth] = useState<Growth[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [rawE, rawC, rawA, rawEv, rawV, rawM, rawG] = await Promise.all([
          AsyncStorage.getItem(ENTRIES_KEY),
          AsyncStorage.getItem(CHILDREN_KEY),
          AsyncStorage.getItem(ACTIVE_KEY),
          AsyncStorage.getItem(EVENTS_KEY),
          AsyncStorage.getItem(VACCINES_KEY),
          AsyncStorage.getItem(MEDS_KEY),
          AsyncStorage.getItem(GROWTH_KEY),
        ]);
        if (!active) return;
        if (rawE) setEntries(JSON.parse(rawE));
        if (rawC) setChildren(JSON.parse(rawC));
        if (rawA) setActiveId(JSON.parse(rawA));
        if (rawEv) setEvents(JSON.parse(rawEv));
        if (rawV) setVaccines(JSON.parse(rawV));
        if (rawM) setMedications(JSON.parse(rawM));
        if (rawG) setGrowth(JSON.parse(rawG));
      } catch {
        // Corrupt/missing cache → start empty. Never crash on storage.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => { if (!loading) AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries)).catch(() => {}); }, [entries, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(CHILDREN_KEY, JSON.stringify(children)).catch(() => {}); }, [children, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(activeId)).catch(() => {}); }, [activeId, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events)).catch(() => {}); }, [events, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(VACCINES_KEY, JSON.stringify(vaccines)).catch(() => {}); }, [vaccines, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(MEDS_KEY, JSON.stringify(medications)).catch(() => {}); }, [medications, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(GROWTH_KEY, JSON.stringify(growth)).catch(() => {}); }, [growth, loading]);

  const addChild = useCallback((input: { name: string; color: ChildColor; birthDate?: string }) => {
    const child: Child = { id: newId(), name: input.name.trim(), color: input.color, birthDate: input.birthDate?.trim() || undefined };
    setChildren((prev) => [...prev, child]);
    setActiveId((cur) => cur ?? child.id);
  }, []);

  const updateChild = useCallback((id: string, patch: Partial<Pick<Child, 'name' | 'color' | 'birthDate'>>) => {
    setChildren((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch, name: patch.name?.trim() ?? c.name, birthDate: patch.birthDate?.trim() || c.birthDate } : c)));
  }, []);

  const deleteChild = useCallback((id: string) => {
    setChildren((prev) => prev.filter((c) => c.id !== id));
    setActiveId((cur) => (cur === id ? null : cur));
    // Cascade: drop this child's records (entries kept as history).
    setVaccines((prev) => prev.filter((v) => v.childId !== id));
    setMedications((prev) => prev.filter((m) => m.childId !== id));
    setGrowth((prev) => prev.filter((g) => g.childId !== id));
    setEvents((prev) => prev.filter((e) => e.childId !== id));
  }, []);

  const setActiveChild = useCallback((id: string) => setActiveId(id), []);

  const addEntry = useCallback(
    (kind: EntryKind, details?: EntryDetails) => {
      setEntries((prev) => [
        {
          id: newId(),
          kind,
          at: new Date().toISOString(),
          childId: activeId ?? undefined,
          note: details?.note?.trim() || undefined,
          side: details?.side,
          volumeMl: details?.volumeMl,
          durationMin: details?.durationMin,
          diaperType: details?.diaperType,
        },
        ...prev,
      ]);
    },
    [activeId],
  );

  const deleteEntry = useCallback((id: string) => setEntries((prev) => prev.filter((e) => e.id !== id)), []);

  const addEvent = useCallback((input: { title: string; at: string; childId?: string; location?: string; note?: string }) => {
    setEvents((prev) =>
      [...prev, { id: newId(), title: input.title.trim(), at: input.at, childId: input.childId, location: input.location?.trim() || undefined, note: input.note?.trim() || undefined }]
        .sort((a, b) => a.at.localeCompare(b.at)),
    );
  }, []);

  const deleteEvent = useCallback((id: string) => setEvents((prev) => prev.filter((e) => e.id !== id)), []);

  const addVaccine = useCallback((input: { childId: string; name: string; dueDate?: string; givenDate?: string; provider?: string }) => {
    setVaccines((prev) => [...prev, { id: newId(), childId: input.childId, name: input.name.trim(), dueDate: input.dueDate?.trim() || undefined, givenDate: input.givenDate?.trim() || undefined, provider: input.provider?.trim() || undefined }]);
  }, []);
  const updateVaccine = useCallback((id: string, patch: Partial<Vaccine>) => setVaccines((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v))), []);
  const deleteVaccine = useCallback((id: string) => setVaccines((prev) => prev.filter((v) => v.id !== id)), []);

  const addMedication = useCallback((input: { childId: string; name: string; dose?: string; schedule?: string }) => {
    setMedications((prev) => [...prev, { id: newId(), childId: input.childId, name: input.name.trim(), dose: input.dose?.trim() || undefined, schedule: input.schedule?.trim() || undefined, active: true }]);
  }, []);
  const toggleMedication = useCallback((id: string) => setMedications((prev) => prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))), []);
  const deleteMedication = useCallback((id: string) => setMedications((prev) => prev.filter((m) => m.id !== id)), []);

  const addGrowth = useCallback((input: { childId: string; weightKg?: number; heightCm?: number; headCm?: number }) => {
    setGrowth((prev) => [{ id: newId(), childId: input.childId, at: new Date().toISOString(), weightKg: input.weightKg, heightCm: input.heightCm, headCm: input.headCm }, ...prev]);
  }, []);
  const deleteGrowth = useCallback((id: string) => setGrowth((prev) => prev.filter((g) => g.id !== id)), []);

  const clearAll = useCallback(() => { setEntries([]); setEvents([]); }, []);

  const activeChild = useMemo(() => children.find((c) => c.id === activeId) ?? null, [children, activeId]);

  const value = useMemo<DataValue>(
    () => ({
      loading, children, activeChild, setActiveChild, addChild, updateChild, deleteChild,
      entries, addEntry, deleteEntry, events, addEvent, deleteEvent,
      vaccines, addVaccine, updateVaccine, deleteVaccine,
      medications, addMedication, toggleMedication, deleteMedication,
      growth, addGrowth, deleteGrowth, clearAll,
    }),
    [loading, children, activeChild, setActiveChild, addChild, updateChild, deleteChild, entries, addEntry, deleteEntry, events, addEvent, deleteEvent, vaccines, addVaccine, updateVaccine, deleteVaccine, medications, addMedication, toggleMedication, deleteMedication, growth, addGrowth, deleteGrowth, clearAll],
  );

  return <DataContext.Provider value={value}>{node}</DataContext.Provider>;
}

export function useData(): DataValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within <DataProvider>');
  return ctx;
}

/** Entries whose timestamp falls on the local calendar day `ref` (default today). */
export function entriesOn(entries: Entry[], ref: Date = new Date()): Entry[] {
  const y = ref.getFullYear(), m = ref.getMonth(), d = ref.getDate();
  return entries.filter((e) => {
    const t = new Date(e.at);
    return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d;
  });
}

/** Upcoming events (at >= now), soonest first. */
export function upcomingEvents(events: EventItem[], now: Date = new Date()): EventItem[] {
  const iso = now.toISOString();
  return events.filter((e) => e.at >= iso).sort((a, b) => a.at.localeCompare(b.at));
}

/** A short human description of an entry's detail (side/volume/duration/type). */
export function entryDetail(e: Entry): string {
  const bits: string[] = [];
  if (e.side) bits.push(e.side === 'bottle' ? 'Bottle' : e.side === 'left' ? 'Left' : 'Right');
  if (e.volumeMl) bits.push(`${e.volumeMl} ml`);
  if (e.durationMin) bits.push(e.durationMin >= 60 ? `${Math.floor(e.durationMin / 60)}h ${e.durationMin % 60}m` : `${e.durationMin}m`);
  if (e.diaperType) bits.push(e.diaperType === 'both' ? 'Wet + dirty' : e.diaperType === 'wet' ? 'Wet' : 'Dirty');
  if (e.note) bits.push(e.note);
  return bits.join(' · ');
}
