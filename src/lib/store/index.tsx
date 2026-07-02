import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { childToken } from '../../theme/tokens';
import type { Stage } from '../age';
import { buildSampleData } from './sampleData';

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

export type EntryKind = 'sleep' | 'feed' | 'diaper' | 'note' | 'pump' | 'meal' | 'mood' | 'activity' | 'medicine' | 'potty';
export type FeedSide = 'left' | 'right' | 'bottle';
export type DiaperType = 'wet' | 'dirty' | 'both';

/** Mood scale (index) used by the 'mood' entry kind. */
export const MOOD_LABELS = ['Rough', 'Okay', 'Good', 'Great', 'Amazing'] as const;

export type Entry = {
  id: string;
  kind: EntryKind;
  at: string; // ISO timestamp
  note?: string;
  childId?: string;
  // Optional, kind-specific details (all backward-compatible):
  side?: FeedSide; // feed
  volumeMl?: number; // feed (bottle) / pump
  durationMin?: number; // sleep / feed / activity
  diaperType?: DiaperType; // diaper
  mood?: number; // mood (index into MOOD_LABELS)
};

export type EntryDetails = Partial<Pick<Entry, 'note' | 'side' | 'volumeMl' | 'durationMin' | 'diaperType' | 'mood'>>;

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

/** A completed pregnancy, kept read-only once the baby has arrived. */
export type PregArchive = { id: string; dueDate: string; bornDate: string; checkins: PregCheckin[]; archivedAt: string };

export type BirthPrepItem = { id: string; category: string; label: string; checked: boolean };
export type SavedName = { id: string; name: string; gender: string };
export type PregStatus = 'active' | 'paused' | 'archived';
export type PregAppt = { id: string; title: string; at: string; kind: 'appointment' | 'test'; result?: string; location?: string; mapsUrl?: string };
export type PregVital = { id: string; at: string; kind: 'glucose' | 'bp'; glucose?: number; systolic?: number; diastolic?: number; tag?: string };

export type EpdsResult = { id: string; at: string; total: number; band: string; selfHarmFlag: boolean };
export type Lochia = 'none' | 'light' | 'moderate' | 'heavy';
export type RecoveryLog = { id: string; at: string; systolic?: number; diastolic?: number; lochia?: Lochia; note?: string };

export type TtcItem = { id: string; label: string; checked: boolean };
export type MomCare = { id: string; at: string; kind: 'comfort' | 'sleep' | 'water'; value: number };
export type PelvicLog = { id: string; at: string; exercise: string };
export type MatAppt = { id: string; title: string; at: string; kind: 'appointment' | 'check'; prep?: string };

export type KickSession = { id: string; at: string; count: number; durationMin?: number };
export type ContractionSession = { id: string; at: string; durationSec: number; intervalSec?: number };

export type TzContact = { id: string; name: string; tz: string; location?: string };
export type SavedTip = { id: string; at: string; text: string };
export type SupportContact = { id: string; name: string; role?: string; phone?: string };

export type Caregiver = { id: string; name: string; role?: string };
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
  meal: { label: 'Meal', verb: 'Logged a meal', fill: '#FCE6D8', ink: '#B5662E' },
  mood: { label: 'Mood', verb: 'Logged a mood', fill: '#E7E4FB', ink: '#54579E' },
  activity: { label: 'Activity', verb: 'Logged activity', fill: '#D8F0E6', ink: '#1E5C50' },
  medicine: { label: 'Medicine', verb: 'Logged medicine', fill: '#FBE0EA', ink: '#B04070' },
  potty: { label: 'Potty', verb: 'Logged potty', fill: '#DCEBFA', ink: '#2C5F90' },
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
const PREG_ARCHIVE_KEY = 'everly.pregArchive.v1';
const DOCK_SIDE_KEY = 'everly.dockSide.v1';
const MAT_BIRTH_KEY = 'everly.maternalBirth.v1';
const EPDS_KEY = 'everly.epds.v1';
const RECOVERY_KEY = 'everly.recovery.v1';
const TZ_KEY = 'everly.tzContacts.v1';
const TIPS_KEY = 'everly.savedTips.v1';
const BIRTHPREP_KEY = 'everly.birthPrep.v1';
const NAMES_KEY = 'everly.savedNames.v1';
const PREGSTATUS_KEY = 'everly.pregStatus.v1';
const PREGAPPT_KEY = 'everly.pregAppts.v1';
const PREGVITAL_KEY = 'everly.pregVitals.v1';
const LASTPERIOD_KEY = 'everly.lastPeriod.v1';
const CYCLELEN_KEY = 'everly.cycleLen.v1';
const TTC_KEY = 'everly.ttc.v1';
const PELVIC_KEY = 'everly.pelvic.v1';
const MOMCARE_KEY = 'everly.momCare.v1';
const MATAPPT_KEY = 'everly.matAppts.v1';
const KICKSESSIONS_KEY = 'everly.kickSessions.v1';
const CONTRACTIONS_KEY = 'everly.contractions.v1';
const DEMO_PREMIUM_KEY = 'everly.demoPremium.v1';
const PREPSECTIONS_KEY = 'everly.prepSections.v1';
const DEFAULT_PREP_SECTIONS = ['For Mum', 'For Baby', 'Birth plan'];
const SUPPORT_KEY = 'everly.supportContacts.v1';

function newId() {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

type DataValue = {
  loading: boolean;
  children: Child[];
  activeChild: Child | null;
  setActiveChild: (id: string) => void;
  addChild: (input: { name: string; color: ChildColor; birthDate?: string }) => string;
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
  addCaregiver: (name: string, role?: string) => void;
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
  pregArchive: PregArchive[];
  closePregnancy: (bornDate: string) => void;
  dockSide: 'left' | 'right';
  setDockSide: (s: 'left' | 'right') => void;
  maternalBirth: string | null;
  setMaternalBirth: (d: string | null) => void;
  epdsResults: EpdsResult[];
  addEpdsResult: (input: { total: number; band: string; selfHarmFlag: boolean }) => void;
  deleteEpdsResult: (id: string) => void;
  recoveryLogs: RecoveryLog[];
  addRecoveryLog: (input: { systolic?: number; diastolic?: number; lochia?: Lochia; note?: string }) => void;
  deleteRecoveryLog: (id: string) => void;
  tzContacts: TzContact[];
  addTzContact: (input: { name: string; tz: string; location?: string }) => void;
  deleteTzContact: (id: string) => void;
  savedTips: SavedTip[];
  saveTip: (text: string) => void;
  deleteTip: (id: string) => void;
  birthPrep: BirthPrepItem[];
  addBirthPrep: (input: { category: string; label: string }) => void;
  toggleBirthPrep: (id: string) => void;
  deleteBirthPrep: (id: string) => void;
  prepSections: string[];
  addPrepSection: (name: string) => void;
  renamePrepSection: (oldName: string, newName: string) => void;
  deletePrepSection: (name: string) => void;
  savedNames: SavedName[];
  saveName: (input: { name: string; gender: string }) => void;
  deleteName: (id: string) => void;
  supportContacts: SupportContact[];
  addSupportContact: (input: { name: string; role?: string; phone?: string }) => void;
  deleteSupportContact: (id: string) => void;
  pregStatus: PregStatus;
  setPregStatus: (s: PregStatus) => void;
  pregAppts: PregAppt[];
  addPregAppt: (input: { title: string; at: string; kind: 'appointment' | 'test'; result?: string; location?: string; mapsUrl?: string }) => void;
  deletePregAppt: (id: string) => void;
  pregVitals: PregVital[];
  addPregVital: (input: { kind: 'glucose' | 'bp'; glucose?: number; systolic?: number; diastolic?: number; tag?: string }) => void;
  deletePregVital: (id: string) => void;
  lastPeriod: string | null;
  setLastPeriod: (d: string | null) => void;
  cycleLength: number;
  setCycleLength: (n: number) => void;
  ttcItems: TtcItem[];
  addTtc: (label: string) => void;
  toggleTtc: (id: string) => void;
  deleteTtc: (id: string) => void;
  momCare: MomCare[];
  addMomCare: (input: { kind: 'comfort' | 'sleep' | 'water'; value: number }) => void;
  deleteMomCare: (id: string) => void;
  pelvicLog: PelvicLog[];
  addPelvic: (exercise: string) => void;
  matAppts: MatAppt[];
  addMatAppt: (input: { title: string; at: string; kind: 'appointment' | 'check'; prep?: string }) => void;
  deleteMatAppt: (id: string) => void;
  kickSessions: KickSession[]; // newest first
  addKickSession: (input: { count: number; durationMin?: number }) => void;
  deleteKickSession: (id: string) => void;
  clearKickSessions: () => void;
  contractionSessions: ContractionSession[]; // newest first
  addContraction: (input: { durationSec: number; intervalSec?: number }) => void;
  deleteContraction: (id: string) => void;
  clearContractions: () => void;
  clearAll: () => void;
  /** Demo helpers: load a rich sample dataset and preview premium features. */
  demoPremium: boolean;
  setDemoPremium: (b: boolean) => void;
  loadSampleData: () => void;
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
  const [pregArchive, setPregArchive] = useState<PregArchive[]>([]);
  const [dockSide, setDockSideState] = useState<'left' | 'right'>('right');
  const [maternalBirth, setMaternalBirthState] = useState<string | null>(null);
  const [epdsResults, setEpdsResults] = useState<EpdsResult[]>([]);
  const [recoveryLogs, setRecoveryLogs] = useState<RecoveryLog[]>([]);
  const [tzContacts, setTzContacts] = useState<TzContact[]>([]);
  const [savedTips, setSavedTips] = useState<SavedTip[]>([]);
  const [birthPrep, setBirthPrep] = useState<BirthPrepItem[]>([]);
  const [prepSections, setPrepSections] = useState<string[]>(DEFAULT_PREP_SECTIONS);
  const [supportContacts, setSupportContacts] = useState<SupportContact[]>([]);
  const [savedNames, setSavedNames] = useState<SavedName[]>([]);
  const [pregStatus, setPregStatusState] = useState<PregStatus>('active');
  const [pregAppts, setPregAppts] = useState<PregAppt[]>([]);
  const [pregVitals, setPregVitals] = useState<PregVital[]>([]);
  const [lastPeriod, setLastPeriodState] = useState<string | null>(null);
  const [cycleLength, setCycleLengthState] = useState<number>(28);
  const [ttcItems, setTtcItems] = useState<TtcItem[]>([]);
  const [momCare, setMomCare] = useState<MomCare[]>([]);
  const [pelvicLog, setPelvicLog] = useState<PelvicLog[]>([]);
  const [matAppts, setMatAppts] = useState<MatAppt[]>([]);
  const [kickSessions, setKickSessions] = useState<KickSession[]>([]);
  const [contractionSessions, setContractionSessions] = useState<ContractionSession[]>([]);
  const [demoPremium, setDemoPremiumState] = useState(false);

  // Demo-premium flag is loaded/saved independently of the main hydration chain.
  useEffect(() => { AsyncStorage.getItem(DEMO_PREMIUM_KEY).then((v) => { if (v) setDemoPremiumState(JSON.parse(v)); }).catch(() => {}); }, []);
  const setDemoPremium = useCallback((b: boolean) => {
    setDemoPremiumState(b);
    AsyncStorage.setItem(DEMO_PREMIUM_KEY, JSON.stringify(b)).catch(() => {});
  }, []);

  // Birth-prep section names (user-editable) — loaded/saved independently.
  useEffect(() => { AsyncStorage.getItem(PREPSECTIONS_KEY).then((v) => { if (v) setPrepSections(JSON.parse(v)); }).catch(() => {}); }, []);
  const saveSections = (next: string[]) => { AsyncStorage.setItem(PREPSECTIONS_KEY, JSON.stringify(next)).catch(() => {}); return next; };

  // Support circle (midwife/partner/doula…) — loaded/saved independently.
  useEffect(() => { AsyncStorage.getItem(SUPPORT_KEY).then((v) => { if (v) setSupportContacts(JSON.parse(v)); }).catch(() => {}); }, []);
  const saveSupport = (next: SupportContact[]) => { AsyncStorage.setItem(SUPPORT_KEY, JSON.stringify(next)).catch(() => {}); return next; };
  const addSupportContact = useCallback((input: { name: string; role?: string; phone?: string }) => {
    setSupportContacts((prev) => saveSupport([...prev, { id: newId(), name: input.name.trim(), role: input.role?.trim() || undefined, phone: input.phone?.trim() || undefined }]));
  }, []);
  const deleteSupportContact = useCallback((id: string) => setSupportContacts((prev) => saveSupport(prev.filter((c) => c.id !== id))), []);
  const addPrepSection = useCallback((name: string) => {
    const n = name.trim(); if (!n) return;
    setPrepSections((prev) => (prev.includes(n) ? prev : saveSections([...prev, n])));
  }, []);
  const renamePrepSection = useCallback((oldName: string, newName: string) => {
    const nn = newName.trim(); if (!nn || nn === oldName) return;
    setPrepSections((prev) => saveSections(prev.map((s) => (s === oldName ? nn : s))));
    setBirthPrep((prev) => prev.map((i) => (i.category === oldName ? { ...i, category: nn } : i)));
  }, []);
  const deletePrepSection = useCallback((name: string) => {
    setPrepSections((prev) => saveSections(prev.filter((s) => s !== name)));
    setBirthPrep((prev) => prev.filter((i) => i.category !== name));
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [rawE, rawC, rawA, rawEv, rawV, rawM, rawG, rawR, rawCh, rawMs, rawCg, rawEx, rawCu, rawDue, rawCi, rawMb, rawEp, rawRec, rawTz, rawTip, rawBp, rawNm, rawPs, rawPa, rawPv, rawLp, rawCl, rawTtc, rawMc, rawPel, rawMa, rawKs, rawCon] = await Promise.all([
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
          AsyncStorage.getItem(TZ_KEY),
          AsyncStorage.getItem(TIPS_KEY),
          AsyncStorage.getItem(BIRTHPREP_KEY),
          AsyncStorage.getItem(NAMES_KEY),
          AsyncStorage.getItem(PREGSTATUS_KEY),
          AsyncStorage.getItem(PREGAPPT_KEY),
          AsyncStorage.getItem(PREGVITAL_KEY),
          AsyncStorage.getItem(LASTPERIOD_KEY),
          AsyncStorage.getItem(CYCLELEN_KEY),
          AsyncStorage.getItem(TTC_KEY),
          AsyncStorage.getItem(MOMCARE_KEY),
          AsyncStorage.getItem(PELVIC_KEY),
          AsyncStorage.getItem(MATAPPT_KEY),
          AsyncStorage.getItem(KICKSESSIONS_KEY),
          AsyncStorage.getItem(CONTRACTIONS_KEY),
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
        if (rawTz) setTzContacts(JSON.parse(rawTz));
        if (rawTip) setSavedTips(JSON.parse(rawTip));
        if (rawBp) setBirthPrep(JSON.parse(rawBp));
        if (rawNm) setSavedNames(JSON.parse(rawNm));
        if (rawPs) setPregStatusState(JSON.parse(rawPs));
        if (rawPa) setPregAppts(JSON.parse(rawPa));
        if (rawPv) setPregVitals(JSON.parse(rawPv));
        if (rawLp) setLastPeriodState(JSON.parse(rawLp));
        if (rawCl) setCycleLengthState(JSON.parse(rawCl));
        if (rawTtc) setTtcItems(JSON.parse(rawTtc));
        if (rawMc) setMomCare(JSON.parse(rawMc));
        if (rawPel) setPelvicLog(JSON.parse(rawPel));
        if (rawMa) setMatAppts(JSON.parse(rawMa));
        if (rawKs) setKickSessions(JSON.parse(rawKs));
        if (rawCon) setContractionSessions(JSON.parse(rawCon));
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
  useEffect(() => { if (!loading) AsyncStorage.setItem(PREG_ARCHIVE_KEY, JSON.stringify(pregArchive)).catch(() => {}); }, [pregArchive, loading]);
  useEffect(() => { AsyncStorage.getItem(PREG_ARCHIVE_KEY).then((r) => { if (r) setPregArchive(JSON.parse(r)); }).catch(() => {}); }, []);
  useEffect(() => { AsyncStorage.getItem(DOCK_SIDE_KEY).then((r) => { if (r === 'left' || r === 'right') setDockSideState(r); }).catch(() => {}); }, []);
  useEffect(() => { if (!loading) AsyncStorage.setItem(DOCK_SIDE_KEY, dockSide).catch(() => {}); }, [dockSide, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(MAT_BIRTH_KEY, JSON.stringify(maternalBirth)).catch(() => {}); }, [maternalBirth, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(EPDS_KEY, JSON.stringify(epdsResults)).catch(() => {}); }, [epdsResults, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(RECOVERY_KEY, JSON.stringify(recoveryLogs)).catch(() => {}); }, [recoveryLogs, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(TZ_KEY, JSON.stringify(tzContacts)).catch(() => {}); }, [tzContacts, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(TIPS_KEY, JSON.stringify(savedTips)).catch(() => {}); }, [savedTips, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(BIRTHPREP_KEY, JSON.stringify(birthPrep)).catch(() => {}); }, [birthPrep, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(NAMES_KEY, JSON.stringify(savedNames)).catch(() => {}); }, [savedNames, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(PREGSTATUS_KEY, JSON.stringify(pregStatus)).catch(() => {}); }, [pregStatus, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(PREGAPPT_KEY, JSON.stringify(pregAppts)).catch(() => {}); }, [pregAppts, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(PREGVITAL_KEY, JSON.stringify(pregVitals)).catch(() => {}); }, [pregVitals, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(LASTPERIOD_KEY, JSON.stringify(lastPeriod)).catch(() => {}); }, [lastPeriod, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(CYCLELEN_KEY, JSON.stringify(cycleLength)).catch(() => {}); }, [cycleLength, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(TTC_KEY, JSON.stringify(ttcItems)).catch(() => {}); }, [ttcItems, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(MOMCARE_KEY, JSON.stringify(momCare)).catch(() => {}); }, [momCare, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(PELVIC_KEY, JSON.stringify(pelvicLog)).catch(() => {}); }, [pelvicLog, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(MATAPPT_KEY, JSON.stringify(matAppts)).catch(() => {}); }, [matAppts, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(KICKSESSIONS_KEY, JSON.stringify(kickSessions)).catch(() => {}); }, [kickSessions, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(CONTRACTIONS_KEY, JSON.stringify(contractionSessions)).catch(() => {}); }, [contractionSessions, loading]);

  const addChild = useCallback((input: { name: string; color: ChildColor; birthDate?: string }) => {
    const child: Child = { id: newId(), name: input.name.trim(), color: input.color, birthDate: input.birthDate?.trim() || undefined };
    setChildren((prev) => [...prev, child]);
    setActiveId((cur) => cur ?? child.id);
    return child.id;
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
          mood: details?.mood,
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

  const addCaregiver = useCallback((name: string, role?: string) => setCaregivers((prev) => [...prev, { id: newId(), name: name.trim(), role: role?.trim() || undefined }]), []);
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
  // Close the live pregnancy: snapshot it into the read-only archive and clear
  // the live due date + check-ins (a new pregnancy reopens by setting a due date).
  const closePregnancy = useCallback((bornDate: string) => {
    setDueDateState((dd) => {
      if (dd) setPregArchive((prev) => [{ id: newId(), dueDate: dd, bornDate: bornDate.trim(), checkins, archivedAt: new Date().toISOString() }, ...prev]);
      return null;
    });
    setCheckins([]);
  }, [checkins]);
  const setDockSide = useCallback((s: 'left' | 'right') => setDockSideState(s), []);

  const setMaternalBirth = useCallback((db: string | null) => setMaternalBirthState(db?.trim() || null), []);
  const addEpdsResult = useCallback((input: { total: number; band: string; selfHarmFlag: boolean }) => {
    setEpdsResults((prev) => [{ id: newId(), at: new Date().toISOString(), ...input }, ...prev]);
  }, []);
  const deleteEpdsResult = useCallback((id: string) => setEpdsResults((prev) => prev.filter((r) => r.id !== id)), []);
  const addRecoveryLog = useCallback((input: { systolic?: number; diastolic?: number; lochia?: Lochia; note?: string }) => {
    setRecoveryLogs((prev) => [{ id: newId(), at: new Date().toISOString(), ...input }, ...prev]);
  }, []);
  const deleteRecoveryLog = useCallback((id: string) => setRecoveryLogs((prev) => prev.filter((r) => r.id !== id)), []);

  const addTzContact = useCallback((input: { name: string; tz: string; location?: string }) => {
    setTzContacts((prev) => [...prev, { id: newId(), name: input.name.trim(), tz: input.tz.trim(), location: input.location?.trim() || undefined }]);
  }, []);
  const deleteTzContact = useCallback((id: string) => setTzContacts((prev) => prev.filter((c) => c.id !== id)), []);
  const saveTip = useCallback((text: string) => setSavedTips((prev) => [{ id: newId(), at: new Date().toISOString(), text }, ...prev]), []);
  const deleteTip = useCallback((id: string) => setSavedTips((prev) => prev.filter((t) => t.id !== id)), []);

  const addBirthPrep = useCallback((input: { category: string; label: string }) => setBirthPrep((prev) => [...prev, { id: newId(), category: input.category, label: input.label.trim(), checked: false }]), []);
  const toggleBirthPrep = useCallback((id: string) => setBirthPrep((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))), []);
  const deleteBirthPrep = useCallback((id: string) => setBirthPrep((prev) => prev.filter((i) => i.id !== id)), []);

  const saveName = useCallback((input: { name: string; gender: string }) => setSavedNames((prev) => (prev.some((n) => n.name === input.name) ? prev : [{ id: newId(), name: input.name, gender: input.gender }, ...prev])), []);
  const deleteName = useCallback((id: string) => setSavedNames((prev) => prev.filter((n) => n.id !== id)), []);

  const setPregStatus = useCallback((s: PregStatus) => setPregStatusState(s), []);

  const addPregAppt = useCallback((input: { title: string; at: string; kind: 'appointment' | 'test'; result?: string; location?: string; mapsUrl?: string }) => {
    setPregAppts((prev) => [...prev, { id: newId(), title: input.title.trim(), at: input.at, kind: input.kind, result: input.result?.trim() || undefined, location: input.location?.trim() || undefined, mapsUrl: input.mapsUrl?.trim() || undefined }].sort((a, b) => a.at.localeCompare(b.at)));
  }, []);
  const deletePregAppt = useCallback((id: string) => setPregAppts((prev) => prev.filter((a) => a.id !== id)), []);

  const addPregVital = useCallback((input: { kind: 'glucose' | 'bp'; glucose?: number; systolic?: number; diastolic?: number; tag?: string }) => {
    setPregVitals((prev) => [{ id: newId(), at: new Date().toISOString(), ...input }, ...prev]);
  }, []);
  const deletePregVital = useCallback((id: string) => setPregVitals((prev) => prev.filter((v) => v.id !== id)), []);

  const setLastPeriod = useCallback((dd: string | null) => setLastPeriodState(dd?.trim() || null), []);
  const setCycleLength = useCallback((n: number) => setCycleLengthState(n > 0 ? n : 28), []);
  const addTtc = useCallback((label: string) => setTtcItems((prev) => [...prev, { id: newId(), label: label.trim(), checked: false }]), []);
  const toggleTtc = useCallback((id: string) => setTtcItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))), []);
  const deleteTtc = useCallback((id: string) => setTtcItems((prev) => prev.filter((i) => i.id !== id)), []);
  const addMomCare = useCallback((input: { kind: 'comfort' | 'sleep' | 'water'; value: number }) => setMomCare((prev) => [{ id: newId(), at: new Date().toISOString(), ...input }, ...prev]), []);
  const deleteMomCare = useCallback((id: string) => setMomCare((prev) => prev.filter((m) => m.id !== id)), []);
  const addPelvic = useCallback((exercise: string) => setPelvicLog((prev) => [{ id: newId(), at: new Date().toISOString(), exercise }, ...prev]), []);
  const addMatAppt = useCallback((input: { title: string; at: string; kind: 'appointment' | 'check'; prep?: string }) => {
    setMatAppts((prev) => [...prev, { id: newId(), title: input.title.trim(), at: input.at, kind: input.kind, prep: input.prep?.trim() || undefined }].sort((a, b) => a.at.localeCompare(b.at)));
  }, []);
  const deleteMatAppt = useCallback((id: string) => setMatAppts((prev) => prev.filter((a) => a.id !== id)), []);

  const addKickSession = useCallback((input: { count: number; durationMin?: number }) => {
    setKickSessions((prev) => [{ id: newId(), at: new Date().toISOString(), count: input.count, durationMin: input.durationMin }, ...prev]);
  }, []);
  const deleteKickSession = useCallback((id: string) => setKickSessions((prev) => prev.filter((s) => s.id !== id)), []);
  const clearKickSessions = useCallback(() => setKickSessions([]), []);

  const addContraction = useCallback((input: { durationSec: number; intervalSec?: number }) => {
    setContractionSessions((prev) => [{ id: newId(), at: new Date().toISOString(), durationSec: input.durationSec, intervalSec: input.intervalSec }, ...prev]);
  }, []);
  const deleteContraction = useCallback((id: string) => setContractionSessions((prev) => prev.filter((s) => s.id !== id)), []);
  const clearContractions = useCallback(() => setContractionSessions([]), []);

  const clearAll = useCallback(() => { setEntries([]); setEvents([]); }, []);

  // Populate the whole on-device store with a rich demo dataset (2 kids + an
  // active pregnancy) and turn on premium previews. Save effects persist it.
  const loadSampleData = useCallback(() => {
    const d = buildSampleData();
    setChildren(d.children); setActiveId(d.activeId); setEntries(d.entries); setEvents(d.events);
    setVaccines(d.vaccines); setMedications(d.medications); setGrowth(d.growth); setMilestones(d.milestones);
    setRoutines(d.routines); setChores(d.chores); setCaregivers(d.caregivers); setCustody(d.custody);
    setExpenses(d.expenses); setDueDateState(d.dueDate); setCheckins(d.checkins); setPregStatusState(d.pregStatus);
    setPregAppts(d.pregAppts); setPregVitals(d.pregVitals); setKickSessions(d.kickSessions);
    setContractionSessions(d.contractionSessions); setBirthPrep(d.birthPrep); setSavedNames(d.savedNames);
    setTzContacts(d.tzContacts); setSavedTips(d.savedTips);
    setMaternalBirthState(null); setPregArchive([]);
    setDemoPremium(true);
  }, [setDemoPremium]);

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
      dueDate, setDueDate, checkins, addCheckin, deleteCheckin, pregArchive, closePregnancy, dockSide, setDockSide,
      maternalBirth, setMaternalBirth, epdsResults, addEpdsResult, deleteEpdsResult, recoveryLogs, addRecoveryLog, deleteRecoveryLog,
      tzContacts, addTzContact, deleteTzContact, savedTips, saveTip, deleteTip,
      birthPrep, addBirthPrep, toggleBirthPrep, deleteBirthPrep,
      prepSections, addPrepSection, renamePrepSection, deletePrepSection,
      savedNames, saveName, deleteName,
      supportContacts, addSupportContact, deleteSupportContact,
      pregStatus, setPregStatus,
      pregAppts, addPregAppt, deletePregAppt,
      pregVitals, addPregVital, deletePregVital,
      lastPeriod, setLastPeriod, cycleLength, setCycleLength,
      ttcItems, addTtc, toggleTtc, deleteTtc,
      momCare, addMomCare, deleteMomCare,
      pelvicLog, addPelvic,
      matAppts, addMatAppt, deleteMatAppt,
      kickSessions, addKickSession, deleteKickSession, clearKickSessions,
      contractionSessions, addContraction, deleteContraction, clearContractions,
      clearAll,
      demoPremium, setDemoPremium, loadSampleData,
    }),
    [loading, children, activeChild, setActiveChild, addChild, updateChild, deleteChild, entries, addEntry, deleteEntry, events, addEvent, deleteEvent, vaccines, addVaccine, updateVaccine, deleteVaccine, medications, addMedication, toggleMedication, deleteMedication, growth, addGrowth, deleteGrowth, routines, addRoutine, addRoutineStep, toggleStep, resetRoutine, deleteRoutine, chores, addChore, toggleChore, deleteChore, milestones, addMilestone, deleteMilestone, caregivers, addCaregiver, deleteCaregiver, custody, setCustodyDay, expenses, addExpense, toggleExpenseSettled, deleteExpense, dueDate, setDueDate, checkins, addCheckin, deleteCheckin, pregArchive, closePregnancy, dockSide, setDockSide, maternalBirth, setMaternalBirth, epdsResults, addEpdsResult, deleteEpdsResult, recoveryLogs, addRecoveryLog, deleteRecoveryLog, tzContacts, addTzContact, deleteTzContact, savedTips, saveTip, deleteTip, birthPrep, addBirthPrep, toggleBirthPrep, deleteBirthPrep, prepSections, addPrepSection, renamePrepSection, deletePrepSection, savedNames, saveName, deleteName, supportContacts, addSupportContact, deleteSupportContact, pregStatus, setPregStatus, pregAppts, addPregAppt, deletePregAppt, pregVitals, addPregVital, deletePregVital, lastPeriod, setLastPeriod, cycleLength, setCycleLength, ttcItems, addTtc, toggleTtc, deleteTtc, momCare, addMomCare, deleteMomCare, pelvicLog, addPelvic, matAppts, addMatAppt, deleteMatAppt, kickSessions, addKickSession, deleteKickSession, clearKickSessions, contractionSessions, addContraction, deleteContraction, clearContractions, clearAll, demoPremium, setDemoPremium, loadSampleData],
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
  if (typeof e.mood === 'number' && MOOD_LABELS[e.mood]) bits.push(MOOD_LABELS[e.mood]);
  if (e.note) bits.push(e.note);
  return bits.join(' · ');
}

/** Which quick-log kinds make sense for a child's life-stage. */
export function quickLogKinds(stage: Stage): EntryKind[] {
  switch (stage) {
    case 'newborn':
    case 'baby':
      return ['feed', 'sleep', 'diaper', 'pump', 'note'];
    case 'preschool':
      return ['meal', 'sleep', 'potty', 'mood', 'note'];
    case 'school':
      return ['meal', 'sleep', 'activity', 'medicine', 'note'];
    case 'teen':
    case 'youngAdult':
      return ['mood', 'sleep', 'activity', 'note'];
    default:
      return ['feed', 'sleep', 'diaper', 'pump', 'note'];
  }
}
