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

export type RoutineStep = { id: string; label: string; done: boolean };
export type Routine = { id: string; childId?: string; name: string; steps: RoutineStep[] };
export type Chore = { id: string; childId?: string; label: string; points: number; done: boolean };
export type Milestone = { id: string; childId: string; title: string; date: string; note?: string };

export type PregCheckin = { id: string; at: string; mood: number; symptoms: string[]; weightKg?: number };

export type EpdsResult = { id: string; at: string; total: number; band: string; selfHarmFlag: boolean };
export type Lochia = 'none' | 'light' | 'moderate' | 'heavy';
export type RecoveryLog = { id: string; at: string; systolic?: number; diastolic?: number; lochia?: Lochia; note?: string };

export type Caregiver = { id: string; name: string };
/** Expense paidBy is 'me' or a caregiver id; splitPct = the other party's share. */
export type Expense = { id: string; label: string; amount: number; paidBy: string; splitPct: number; settled: boolean; at: string };
/** Weekly custody pattern: weekday 0(Sun)–6(Sat) → 'me' | caregiverId. */
export type Custody = Record<number, string>;

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
const ROUTINES_KEY = 'everly.routines.v1';
const CHORES_KEY = 'everly.chores.v1';
const MILESTONES_KEY = 'everly.milestones.v1';
const CAREGIVERS_KEY = 'everly.caregivers.v1';
const EXPENSES_KEY = 'everly.expenses.v1';
const CUSTODY_KEY = 'everly.custody.v1';
const PREG_DUE_KEY = 'everly.pregDue.v1';
const CHECKINS_KEY = 'everly.checkins.v1';
const MAT_BIRTH_KEY = 'everly.maternalBirth.v1';
const EPDS_KEY = 'everly.epds.v1';
const RECOVERY_KEY = 'everly.recovery.v1';

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
  routines: Routine[];
  addRoutine: (input: { name: string; childId?: string }) => void;
  addRoutineStep: (routineId: string, label: string) => void;
  toggleStep: (routineId: string, stepId: string) => void;
  resetRoutine: (routineId: string) => void;
  deleteRoutine: (id: string) => void;
  chores: Chore[];
  addChore: (input: { label: string; points: number; childId?: string }) => void;
  toggleChore: (id: string) => void;
  deleteChore: (id: string) => void;
  milestones: Milestone[];
  addMilestone: (input: { childId: string; title: string; date: string; note?: string }) => void;
  deleteMilestone: (id: string) => void;
  caregivers: Caregiver[];
  addCaregiver: (name: string) => void;
  deleteCaregiver: (id: string) => void;
  custody: Custody;
  setCustodyDay: (weekday: number, who: string) => void;
  expenses: Expense[];
  addExpense: (input: { label: string; amount: number; paidBy: string; splitPct: number }) => void;
  toggleExpenseSettled: (id: string) => void;
  deleteExpense: (id: string) => void;
  dueDate: string | null;
  setDueDate: (d: string | null) => void;
  checkins: PregCheckin[];
  addCheckin: (input: { mood: number; symptoms: string[]; weightKg?: number }) => void;
  deleteCheckin: (id: string) => void;
  maternalBirth: string | null;
  setMaternalBirth: (d: string | null) => void;
  epdsResults: EpdsResult[];
  addEpdsResult: (input: { total: number; band: string; selfHarmFlag: boolean }) => void;
  deleteEpdsResult: (id: string) => void;
  recoveryLogs: RecoveryLog[];
  addRecoveryLog: (input: { systolic?: number; diastolic?: number; lochia?: Lochia; note?: string }) => void;
  deleteRecoveryLog: (id: string) => void;
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
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [custody, setCustody] = useState<Custody>({});
  const [dueDate, setDueDateState] = useState<string | null>(null);
  const [checkins, setCheckins] = useState<PregCheckin[]>([]);
  const [maternalBirth, setMaternalBirthState] = useState<string | null>(null);
  const [epdsResults, setEpdsResults] = useState<EpdsResult[]>([]);
  const [recoveryLogs, setRecoveryLogs] = useState<RecoveryLog[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [rawE, rawC, rawA, rawEv, rawV, rawM, rawG, rawR, rawCh, rawMs, rawCg, rawEx, rawCu, rawDue, rawCi, rawMb, rawEp, rawRec] = await Promise.all([
          AsyncStorage.getItem(ENTRIES_KEY),
          AsyncStorage.getItem(CHILDREN_KEY),
          AsyncStorage.getItem(ACTIVE_KEY),
          AsyncStorage.getItem(EVENTS_KEY),
          AsyncStorage.getItem(VACCINES_KEY),
          AsyncStorage.getItem(MEDS_KEY),
          AsyncStorage.getItem(GROWTH_KEY),
          AsyncStorage.getItem(ROUTINES_KEY),
          AsyncStorage.getItem(CHORES_KEY),
          AsyncStorage.getItem(MILESTONES_KEY),
          AsyncStorage.getItem(CAREGIVERS_KEY),
          AsyncStorage.getItem(EXPENSES_KEY),
          AsyncStorage.getItem(CUSTODY_KEY),
          AsyncStorage.getItem(PREG_DUE_KEY),
          AsyncStorage.getItem(CHECKINS_KEY),
          AsyncStorage.getItem(MAT_BIRTH_KEY),
          AsyncStorage.getItem(EPDS_KEY),
          AsyncStorage.getItem(RECOVERY_KEY),
        ]);
        if (!active) return;
        if (rawE) setEntries(JSON.parse(rawE));
        if (rawC) setChildren(JSON.parse(rawC));
        if (rawA) setActiveId(JSON.parse(rawA));
        if (rawEv) setEvents(JSON.parse(rawEv));
        if (rawV) setVaccines(JSON.parse(rawV));
        if (rawM) setMedications(JSON.parse(rawM));
        if (rawG) setGrowth(JSON.parse(rawG));
        if (rawR) setRoutines(JSON.parse(rawR));
        if (rawCh) setChores(JSON.parse(rawCh));
        if (rawMs) setMilestones(JSON.parse(rawMs));
        if (rawCg) setCaregivers(JSON.parse(rawCg));
        if (rawEx) setExpenses(JSON.parse(rawEx));
        if (rawCu) setCustody(JSON.parse(rawCu));
        if (rawDue) setDueDateState(JSON.parse(rawDue));
        if (rawCi) setCheckins(JSON.parse(rawCi));
        if (rawMb) setMaternalBirthState(JSON.parse(rawMb));
        if (rawEp) setEpdsResults(JSON.parse(rawEp));
        if (rawRec) setRecoveryLogs(JSON.parse(rawRec));
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
  useEffect(() => { if (!loading) AsyncStorage.setItem(ROUTINES_KEY, JSON.stringify(routines)).catch(() => {}); }, [routines, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(CHORES_KEY, JSON.stringify(chores)).catch(() => {}); }, [chores, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(MILESTONES_KEY, JSON.stringify(milestones)).catch(() => {}); }, [milestones, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(CAREGIVERS_KEY, JSON.stringify(caregivers)).catch(() => {}); }, [caregivers, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses)).catch(() => {}); }, [expenses, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(CUSTODY_KEY, JSON.stringify(custody)).catch(() => {}); }, [custody, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(PREG_DUE_KEY, JSON.stringify(dueDate)).catch(() => {}); }, [dueDate, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(checkins)).catch(() => {}); }, [checkins, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(MAT_BIRTH_KEY, JSON.stringify(maternalBirth)).catch(() => {}); }, [maternalBirth, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(EPDS_KEY, JSON.stringify(epdsResults)).catch(() => {}); }, [epdsResults, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(RECOVERY_KEY, JSON.stringify(recoveryLogs)).catch(() => {}); }, [recoveryLogs, loading]);

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
    setRoutines((prev) => prev.filter((r) => r.childId !== id));
    setChores((prev) => prev.filter((c) => c.childId !== id));
    setMilestones((prev) => prev.filter((m) => m.childId !== id));
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

  const addRoutine = useCallback((input: { name: string; childId?: string }) => {
    setRoutines((prev) => [...prev, { id: newId(), name: input.name.trim(), childId: input.childId, steps: [] }]);
  }, []);
  const addRoutineStep = useCallback((routineId: string, label: string) => {
    setRoutines((prev) => prev.map((r) => (r.id === routineId ? { ...r, steps: [...r.steps, { id: newId(), label: label.trim(), done: false }] } : r)));
  }, []);
  const toggleStep = useCallback((routineId: string, stepId: string) => {
    setRoutines((prev) => prev.map((r) => (r.id === routineId ? { ...r, steps: r.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)) } : r)));
  }, []);
  const resetRoutine = useCallback((routineId: string) => {
    setRoutines((prev) => prev.map((r) => (r.id === routineId ? { ...r, steps: r.steps.map((s) => ({ ...s, done: false })) } : r)));
  }, []);
  const deleteRoutine = useCallback((id: string) => setRoutines((prev) => prev.filter((r) => r.id !== id)), []);

  const addChore = useCallback((input: { label: string; points: number; childId?: string }) => {
    setChores((prev) => [...prev, { id: newId(), label: input.label.trim(), points: input.points, childId: input.childId, done: false }]);
  }, []);
  const toggleChore = useCallback((id: string) => setChores((prev) => prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c))), []);
  const deleteChore = useCallback((id: string) => setChores((prev) => prev.filter((c) => c.id !== id)), []);

  const addMilestone = useCallback((input: { childId: string; title: string; date: string; note?: string }) => {
    setMilestones((prev) => [{ id: newId(), childId: input.childId, title: input.title.trim(), date: input.date, note: input.note?.trim() || undefined }, ...prev]
      .sort((a, b) => b.date.localeCompare(a.date)));
  }, []);
  const deleteMilestone = useCallback((id: string) => setMilestones((prev) => prev.filter((m) => m.id !== id)), []);

  const addCaregiver = useCallback((name: string) => setCaregivers((prev) => [...prev, { id: newId(), name: name.trim() }]), []);
  const deleteCaregiver = useCallback((id: string) => {
    setCaregivers((prev) => prev.filter((c) => c.id !== id));
    setCustody((prev) => { const next = { ...prev }; for (const k of Object.keys(next)) if (next[+k] === id) next[+k] = 'me'; return next; });
    setExpenses((prev) => prev.map((e) => (e.paidBy === id ? { ...e, paidBy: 'me' } : e)));
  }, []);
  const setCustodyDay = useCallback((weekday: number, who: string) => setCustody((prev) => ({ ...prev, [weekday]: who })), []);

  const addExpense = useCallback((input: { label: string; amount: number; paidBy: string; splitPct: number }) => {
    setExpenses((prev) => [{ id: newId(), label: input.label.trim(), amount: input.amount, paidBy: input.paidBy, splitPct: input.splitPct, settled: false, at: new Date().toISOString() }, ...prev]);
  }, []);
  const toggleExpenseSettled = useCallback((id: string) => setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, settled: !e.settled } : e))), []);
  const deleteExpense = useCallback((id: string) => setExpenses((prev) => prev.filter((e) => e.id !== id)), []);

  const setDueDate = useCallback((dd: string | null) => setDueDateState(dd?.trim() || null), []);
  const addCheckin = useCallback((input: { mood: number; symptoms: string[]; weightKg?: number }) => {
    setCheckins((prev) => [{ id: newId(), at: new Date().toISOString(), mood: input.mood, symptoms: input.symptoms, weightKg: input.weightKg }, ...prev]);
  }, []);
  const deleteCheckin = useCallback((id: string) => setCheckins((prev) => prev.filter((c) => c.id !== id)), []);

  const setMaternalBirth = useCallback((db: string | null) => setMaternalBirthState(db?.trim() || null), []);
  const addEpdsResult = useCallback((input: { total: number; band: string; selfHarmFlag: boolean }) => {
    setEpdsResults((prev) => [{ id: newId(), at: new Date().toISOString(), ...input }, ...prev]);
  }, []);
  const deleteEpdsResult = useCallback((id: string) => setEpdsResults((prev) => prev.filter((r) => r.id !== id)), []);
  const addRecoveryLog = useCallback((input: { systolic?: number; diastolic?: number; lochia?: Lochia; note?: string }) => {
    setRecoveryLogs((prev) => [{ id: newId(), at: new Date().toISOString(), ...input }, ...prev]);
  }, []);
  const deleteRecoveryLog = useCallback((id: string) => setRecoveryLogs((prev) => prev.filter((r) => r.id !== id)), []);

  const clearAll = useCallback(() => { setEntries([]); setEvents([]); }, []);

  const activeChild = useMemo(() => children.find((c) => c.id === activeId) ?? null, [children, activeId]);

  const value = useMemo<DataValue>(
    () => ({
      loading, children, activeChild, setActiveChild, addChild, updateChild, deleteChild,
      entries, addEntry, deleteEntry, events, addEvent, deleteEvent,
      vaccines, addVaccine, updateVaccine, deleteVaccine,
      medications, addMedication, toggleMedication, deleteMedication,
      growth, addGrowth, deleteGrowth,
      routines, addRoutine, addRoutineStep, toggleStep, resetRoutine, deleteRoutine,
      chores, addChore, toggleChore, deleteChore,
      milestones, addMilestone, deleteMilestone,
      caregivers, addCaregiver, deleteCaregiver,
      custody, setCustodyDay,
      expenses, addExpense, toggleExpenseSettled, deleteExpense,
      dueDate, setDueDate, checkins, addCheckin, deleteCheckin,
      maternalBirth, setMaternalBirth, epdsResults, addEpdsResult, deleteEpdsResult, recoveryLogs, addRecoveryLog, deleteRecoveryLog,
      clearAll,
    }),
    [loading, children, activeChild, setActiveChild, addChild, updateChild, deleteChild, entries, addEntry, deleteEntry, events, addEvent, deleteEvent, vaccines, addVaccine, updateVaccine, deleteVaccine, medications, addMedication, toggleMedication, deleteMedication, growth, addGrowth, deleteGrowth, routines, addRoutine, addRoutineStep, toggleStep, resetRoutine, deleteRoutine, chores, addChore, toggleChore, deleteChore, milestones, addMilestone, deleteMilestone, caregivers, addCaregiver, deleteCaregiver, custody, setCustodyDay, expenses, addExpense, toggleExpenseSettled, deleteExpense, dueDate, setDueDate, checkins, addCheckin, deleteCheckin, maternalBirth, setMaternalBirth, epdsResults, addEpdsResult, deleteEpdsResult, recoveryLogs, addRecoveryLog, deleteRecoveryLog, clearAll],
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
