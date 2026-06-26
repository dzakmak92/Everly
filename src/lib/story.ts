import { BAND_LABEL, type EpdsBand } from './epds';
import type { PregArchive } from './store';

/** A single moment on the mum's "Your story" timeline. */
export type StoryEvent = { at: string; title: string; sub?: string };

const ms = (d: string) => new Date(d.length <= 10 ? `${d}T00:00:00` : d).getTime();
const shiftIso = (d: string, days: number) => new Date(ms(d) + days * 86400000).toISOString();

type Input = {
  lastPeriod: string | null;
  dueDate: string | null;
  maternalBirth: string | null;
  pregArchive: PregArchive[];
  epdsResults: { at: string; total: number; band: string }[];
  recoveryLogs: { at: string }[];
};

/**
 * Build the maternal "Your story" timeline from the data the mum has tracked.
 * Shared by Today's Mum&Me Story panel and the full Timeline page so they
 * always show the same moments — including archived (completed) pregnancies.
 */
export function youStoryEvents(d: Input): StoryEvent[] {
  const out: StoryEvent[] = [];
  if (d.lastPeriod) out.push({ at: d.lastPeriod, title: 'Preconception', sub: 'Started trying / cycle tracking' });

  // Completed (archived) pregnancies — pregnancy began + baby born.
  (d.pregArchive ?? []).forEach((a) => {
    out.push({ at: shiftIso(a.dueDate, -280), title: 'Pregnancy began', sub: `Due ${a.dueDate}` });
    out.push({ at: a.bornDate, title: 'Baby born', sub: 'Welcome to the world' });
  });

  // Live pregnancy (not yet born).
  if (d.dueDate) out.push({ at: shiftIso(d.dueDate, -280), title: 'Pregnancy began', sub: `Due ${d.dueDate}` });

  // A birth recorded without an archive entry (legacy / manual).
  const archBorn = new Set((d.pregArchive ?? []).map((a) => a.bornDate));
  if (d.maternalBirth && !archBorn.has(d.maternalBirth)) out.push({ at: d.maternalBirth, title: 'Baby born', sub: 'Welcome to the world' });

  d.epdsResults.forEach((r) => out.push({ at: r.at, title: 'Wellbeing check-in', sub: `${r.total}/30 · ${BAND_LABEL[r.band as EpdsBand] ?? r.band}` }));
  if (d.recoveryLogs.length) out.push({ at: d.recoveryLogs[d.recoveryLogs.length - 1].at, title: 'Recovery tracking began', sub: `${d.recoveryLogs.length} entries logged` });

  out.sort((a, b) => b.at.localeCompare(a.at));
  return out;
}
