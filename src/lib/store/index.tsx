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

export type EntryKind = 'sleep' | 'feed' | 'diaper' | 'note';

export type Entry = {
  id: string;
  kind: EntryKind;
  at: string; // ISO timestamp
  note?: string;
  childId?: string;
};

export const ENTRY_META: Record<EntryKind, { label: string; verb: string; fill: string; ink: string }> = {
  sleep: { label: 'Sleep', verb: 'Logged sleep', fill: '#E7E4FB', ink: '#54579E' },
  feed: { label: 'Feed', verb: 'Logged a feed', fill: '#FCE6D8', ink: '#B5662E' },
  diaper: { label: 'Diaper', verb: 'Logged a change', fill: '#D8F0E6', ink: '#1E5C50' },
  note: { label: 'Note', verb: 'Added a note', fill: '#DCEBFA', ink: '#2C5F90' },
};

const ENTRIES_KEY = 'everly.entries.v1';
const CHILDREN_KEY = 'everly.children.v1';
const ACTIVE_KEY = 'everly.activeChild.v1';

function newId() {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

type DataValue = {
  loading: boolean;
  children: Child[];
  activeChild: Child | null;
  setActiveChild: (id: string) => void;
  addChild: (input: { name: string; color: ChildColor; birthDate?: string }) => void;
  entries: Entry[]; // newest first
  addEntry: (kind: EntryKind, note?: string) => void;
  deleteEntry: (id: string) => void;
  clearAll: () => void;
};

const DataContext = createContext<DataValue | undefined>(undefined);

export function DataProvider({ children: node }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Load once on mount.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [rawE, rawC, rawA] = await Promise.all([
          AsyncStorage.getItem(ENTRIES_KEY),
          AsyncStorage.getItem(CHILDREN_KEY),
          AsyncStorage.getItem(ACTIVE_KEY),
        ]);
        if (!active) return;
        if (rawE) setEntries(JSON.parse(rawE));
        if (rawC) setChildren(JSON.parse(rawC));
        if (rawA) setActiveId(JSON.parse(rawA));
      } catch {
        // Corrupt/missing cache → start empty. Never crash on storage.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Persist after the initial load has settled.
  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries)).catch(() => {});
  }, [entries, loading]);
  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(CHILDREN_KEY, JSON.stringify(children)).catch(() => {});
  }, [children, loading]);
  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(activeId)).catch(() => {});
  }, [activeId, loading]);

  const addChild = useCallback((input: { name: string; color: ChildColor; birthDate?: string }) => {
    const child: Child = { id: newId(), name: input.name.trim(), color: input.color, birthDate: input.birthDate?.trim() || undefined };
    setChildren((prev) => [...prev, child]);
    setActiveId((cur) => cur ?? child.id); // first child becomes active
  }, []);

  const setActiveChild = useCallback((id: string) => setActiveId(id), []);

  const addEntry = useCallback(
    (kind: EntryKind, note?: string) => {
      setEntries((prev) => [
        { id: newId(), kind, at: new Date().toISOString(), note: note?.trim() || undefined, childId: activeId ?? undefined },
        ...prev,
      ]);
    },
    [activeId],
  );

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearAll = useCallback(() => setEntries([]), []);

  const activeChild = useMemo(() => children.find((c) => c.id === activeId) ?? null, [children, activeId]);

  const value = useMemo<DataValue>(
    () => ({ loading, children, activeChild, setActiveChild, addChild, entries, addEntry, deleteEntry, clearAll }),
    [loading, children, activeChild, setActiveChild, addChild, entries, addEntry, deleteEntry, clearAll],
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
