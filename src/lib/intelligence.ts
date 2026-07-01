import type {
  Entry, Medication, Vaccine, EventItem, KickSession, PregVital, PregCheckin, PregAppt,
} from './store';

/**
 * On-device intelligence — pure functions over the locally-stored records.
 * Nothing leaves the device. Predictions are rhythm estimates (clearly badged
 * "est.") and are withheld until there's enough history to be meaningful.
 */

const MIN = 60000;
const DAY = 86400000;

export type Prediction = { label: string; window: string; minutesAway: number; sub: string };
export type Nudge = { id: string; icon: string; title: string; sub?: string; cta?: string; route?: string; priority: number };

const ms = (iso: string) => new Date(iso).getTime();
const within = (iso: string, days: number, now: number) => now - ms(iso) <= days * DAY && ms(iso) <= now;
const isToday = (iso: string, now: number) => {
  const a = new Date(iso); const b = new Date(now);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};

/** Mean gap (minutes) between consecutive timestamps; null if fewer than 3 points. */
function avgGapMin(timesAsc: number[]): number | null {
  if (timesAsc.length < 3) return null;
  let sum = 0;
  for (let i = 1; i < timesAsc.length; i++) sum += timesAsc[i] - timesAsc[i - 1];
  return Math.round(sum / (timesAsc.length - 1) / MIN);
}

export function fmtDur(min: number): string {
  const h = Math.floor(min / 60); const m = Math.round(min % 60);
  if (h <= 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}
const clock = (t: number) => new Date(t).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const awayLabel = (min: number) => (min <= 0 ? 'now' : min < 60 ? `~${min} min away` : `~${fmtDur(min)} away`);

/* ── child rhythm ─────────────────────────────────────────────────────────── */
export type ChildRhythm = {
  avgFeedMin: number | null;
  avgAwakeMin: number | null;
  lastFeedAt: number | null;
  lastSleepEndAt: number | null;
  feedsToday: number;
  napsToday: number;
  sleepTodayMin: number;
};

export function childRhythm(childId: string, entries: Entry[], now: number): ChildRhythm {
  const mine = entries.filter((e) => e.childId === childId);
  const feeds = mine.filter((e) => e.kind === 'feed' && within(e.at, 7, now)).map((e) => ms(e.at)).sort((a, b) => a - b);
  const sleeps = mine.filter((e) => e.kind === 'sleep' && within(e.at, 7, now)).sort((a, b) => ms(a.at) - ms(b.at));

  // Awake-before-nap = gap from one sleep's *end* to the next sleep's *start*.
  const awakeGaps: number[] = [];
  for (let i = 1; i < sleeps.length; i++) {
    const prevEnd = ms(sleeps[i - 1].at) + (sleeps[i - 1].durationMin ?? 0) * MIN;
    const gap = (ms(sleeps[i].at) - prevEnd) / MIN;
    if (gap > 5 && gap < 600) awakeGaps.push(gap);
  }
  const avgAwakeMin = awakeGaps.length >= 2 ? Math.round(awakeGaps.reduce((a, b) => a + b, 0) / awakeGaps.length) : null;

  const lastFeed = mine.filter((e) => e.kind === 'feed').sort((a, b) => ms(b.at) - ms(a.at))[0];
  const lastSleep = mine.filter((e) => e.kind === 'sleep').sort((a, b) => ms(b.at) - ms(a.at))[0];

  return {
    avgFeedMin: avgGapMin(feeds),
    avgAwakeMin,
    lastFeedAt: lastFeed ? ms(lastFeed.at) : null,
    lastSleepEndAt: lastSleep ? ms(lastSleep.at) + (lastSleep.durationMin ?? 0) * MIN : null,
    feedsToday: mine.filter((e) => e.kind === 'feed' && isToday(e.at, now)).length,
    napsToday: mine.filter((e) => e.kind === 'sleep' && isToday(e.at, now)).length,
    sleepTodayMin: mine.filter((e) => e.kind === 'sleep' && isToday(e.at, now)).reduce((s, e) => s + (e.durationMin ?? 0), 0),
  };
}

export function nextFeed(r: ChildRhythm, now: number): Prediction | null {
  if (!r.avgFeedMin || !r.lastFeedAt) return null;
  const at = r.lastFeedAt + r.avgFeedMin * MIN;
  return { label: 'Next feed', window: clock(at), minutesAway: Math.round((at - now) / MIN), sub: `every ~${fmtDur(r.avgFeedMin)}` };
}

export function napWindow(r: ChildRhythm, now: number): Prediction | null {
  if (!r.avgAwakeMin || !r.lastSleepEndAt) return null;
  const start = r.lastSleepEndAt + r.avgAwakeMin * MIN;
  const end = start + 40 * MIN;
  const away = Math.round((start - now) / MIN);
  return { label: 'Predicted nap window', window: `${clock(start)} – ${clock(end)}`, minutesAway: away, sub: `${awayLabel(away)} · based on last 7 days` };
}

/* ── child nudges ─────────────────────────────────────────────────────────── */
export function childNudges(
  childId: string,
  data: { entries: Entry[]; medications: Medication[]; vaccines: Vaccine[] },
  r: ChildRhythm,
  now: number,
): Nudge[] {
  const out: Nudge[] = [];
  const mine = data.entries.filter((e) => e.childId === childId);
  const loggedToday = mine.filter((e) => isToday(e.at, now));

  // Active medication not logged today
  const med = data.medications.find((m) => m.childId === childId && m.active);
  if (med && !loggedToday.some((e) => e.kind === 'medicine')) {
    out.push({ id: 'med', icon: '💊', title: `${med.name} not logged today`, sub: med.schedule || 'Active medication', cta: 'Log', priority: 2 });
  }

  // Awake longer than usual
  if (r.avgAwakeMin && r.lastSleepEndAt) {
    const awake = Math.round((now - r.lastSleepEndAt) / MIN);
    if (awake > r.avgAwakeMin * 1.1) {
      out.push({ id: 'awake', icon: '🌙', title: `Awake ${fmtDur(awake)} — getting long`, sub: `usually naps after ~${fmtDur(r.avgAwakeMin)}`, cta: 'Start nap', priority: 1 });
    }
  }

  // Vaccine due soon
  const vax = data.vaccines
    .filter((v) => v.childId === childId && !v.givenDate && v.dueDate)
    .map((v) => ({ v, d: Math.round((ms(v.dueDate as string) - now) / DAY) }))
    .filter((x) => x.d <= 21)
    .sort((a, b) => a.d - b.d)[0];
  if (vax) {
    out.push({ id: 'vax', icon: '💉', title: `${vax.v.name} ${vax.d < 0 ? `${Math.abs(vax.d)}d overdue` : `due in ${vax.d} days`}`, sub: vax.v.provider, cta: 'View', priority: vax.d < 0 ? 0 : 3 });
  }

  // Nothing logged yet today
  if (loggedToday.length === 0) {
    out.push({ id: 'empty', icon: '📋', title: 'Nothing logged yet today', sub: 'Tap a quick-log button to start', priority: 4 });
  }
  return out.sort((a, b) => a.priority - b.priority);
}

/* ── pregnancy nudges ─────────────────────────────────────────────────────── */
export function pregnancyNudges(
  data: { kickSessions: KickSession[]; pregVitals: PregVital[]; checkins: PregCheckin[]; pregAppts: PregAppt[] },
  week: number | null,
  now: number,
): Nudge[] {
  const out: Nudge[] = [];

  // Kick count not done today (recommended from ~28 weeks)
  if ((week ?? 0) >= 28 && !data.kickSessions.some((k) => isToday(k.at, now))) {
    out.push({ id: 'kicks', icon: '🦶', title: 'Kick count not done today', sub: 'A daily count is recommended from week 28', cta: 'Count', priority: 1 });
  }

  // Upcoming appointment / test
  const appt = data.pregAppts
    .map((a) => ({ a, d: Math.round((ms(a.at) - now) / DAY) }))
    .filter((x) => x.d >= 0 && x.d <= 5)
    .sort((a, b) => a.d - b.d)[0];
  if (appt) {
    const fasting = appt.a.kind === 'test';
    out.push({ id: 'appt', icon: fasting ? '🩺' : '📅', title: `${appt.a.title} ${appt.d === 0 ? 'today' : `in ${appt.d} days`}`, sub: fasting ? 'May need fasting beforehand' : undefined, cta: 'View', priority: 2 });
  }

  // BP trend (last two readings)
  const bps = data.pregVitals.filter((v) => v.kind === 'bp' && v.systolic && v.diastolic).sort((a, b) => ms(b.at) - ms(a.at)).slice(0, 3);
  if (bps.length) {
    const s = Math.round(bps.reduce((t, v) => t + (v.systolic ?? 0), 0) / bps.length);
    const d = Math.round(bps.reduce((t, v) => t + (v.diastolic ?? 0), 0) / bps.length);
    const high = s >= 140 || d >= 90;
    out.push({ id: 'bp', icon: '📈', title: high ? `BP ${s}/${d} — check with your midwife` : `BP steady — ${s}/${d} avg`, sub: high ? 'Above the usual range' : 'In a healthy range', cta: 'Log', priority: high ? 0 : 4 });
  }

  // Daily check-in
  if (!data.checkins.some((c) => isToday(c.at, now))) {
    out.push({ id: 'checkin', icon: '🙂', title: 'Daily check-in not done', sub: 'Log mood & symptoms', cta: 'Check in', priority: 3 });
  }
  return out.sort((a, b) => a.priority - b.priority);
}
