/**
 * Gestational-age engine + weekly content. A pregnancy is ~280 days (40 weeks)
 * from LMP; the due date (EDD) is LMP + 280d. Given a due date we can derive the
 * current week, days to go, trimester and progress.
 */

export const TERM_DAYS = 280;

export type GestState = {
  week: number; // completed weeks (0–42)
  day: number; // day within the current week (0–6)
  daysToGo: number;
  trimester: 1 | 2 | 3;
  progress: number; // 0–1
};

export function parseDate(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s.length <= 10 ? `${s}T00:00:00` : s);
  return isNaN(d.getTime()) ? null : d;
}

/** Derive gestational state from a due date (EDD). Returns null if no/!valid date. */
export function gestFromDueDate(dueDate?: string, now: Date = new Date()): GestState | null {
  const due = parseDate(dueDate);
  if (!due) return null;
  const msDay = 86400000;
  const daysToGo = Math.ceil((due.getTime() - now.getTime()) / msDay);
  const gestDays = Math.max(0, Math.min(TERM_DAYS + 14, TERM_DAYS - daysToGo));
  const week = Math.floor(gestDays / 7);
  const day = gestDays % 7;
  const trimester: 1 | 2 | 3 = week < 13 ? 1 : week < 27 ? 2 : 3;
  return { week, day, daysToGo: Math.max(0, daysToGo), trimester, progress: Math.max(0, Math.min(1, gestDays / TERM_DAYS)) };
}

/** Due date from a last-menstrual-period date (Naegele's rule: LMP + 280d). */
export function dueDateFromLmp(lmp: string): string {
  const d = parseDate(lmp);
  if (!d) return '';
  d.setDate(d.getDate() + TERM_DAYS);
  return d.toISOString().slice(0, 10);
}

type WeekContent = { size: string; lengthCm: number; weightG: number; note: string };

/** Baby size by week (representative milestones; nearest lower week is used). */
const WEEKS: Record<number, WeekContent> = {
  4: { size: 'Poppy seed', lengthCm: 0.1, weightG: 0, note: 'The neural tube is forming.' },
  6: { size: 'Lentil', lengthCm: 0.6, weightG: 0, note: 'A tiny heartbeat begins.' },
  8: { size: 'Raspberry', lengthCm: 1.6, weightG: 1, note: 'Fingers and toes are forming.' },
  10: { size: 'Strawberry', lengthCm: 3.1, weightG: 4, note: 'Vital organs are in place.' },
  12: { size: 'Lime', lengthCm: 5.4, weightG: 14, note: 'Reflexes are developing.' },
  14: { size: 'Lemon', lengthCm: 8.7, weightG: 43, note: 'Facial expressions begin.' },
  16: { size: 'Avocado', lengthCm: 11.6, weightG: 100, note: 'Baby can make tiny movements.' },
  18: { size: 'Bell pepper', lengthCm: 14.2, weightG: 190, note: 'Ears are in position; hearing starts.' },
  20: { size: 'Banana', lengthCm: 16.4, weightG: 300, note: 'Halfway! You may feel kicks.' },
  22: { size: 'Papaya', lengthCm: 27.8, weightG: 430, note: 'Senses are sharpening.' },
  24: { size: 'Corn on the cob', lengthCm: 30, weightG: 600, note: 'Lungs are developing rapidly.' },
  26: { size: 'Lettuce', lengthCm: 35.6, weightG: 760, note: 'Eyes begin to open.' },
  28: { size: 'Aubergine', lengthCm: 37.6, weightG: 1000, note: 'Third trimester begins.' },
  30: { size: 'Cabbage', lengthCm: 39.9, weightG: 1300, note: 'Baby is putting on fat.' },
  32: { size: 'Squash', lengthCm: 42.4, weightG: 1700, note: 'Practising breathing movements.' },
  34: { size: 'Cantaloupe', lengthCm: 45, weightG: 2100, note: 'Central nervous system maturing.' },
  36: { size: 'Romaine lettuce', lengthCm: 47.4, weightG: 2600, note: 'Getting into position for birth.' },
  38: { size: 'Leek', lengthCm: 49.8, weightG: 3100, note: 'Considered full term soon.' },
  40: { size: 'Pumpkin', lengthCm: 51.2, weightG: 3500, note: 'Ready to meet you!' },
};

export function weekContent(week: number): WeekContent {
  let best = WEEKS[4];
  for (const w of Object.keys(WEEKS).map(Number).sort((a, b) => a - b)) {
    if (w <= week) best = WEEKS[w];
  }
  return best;
}

export const PREG_SYMPTOMS = ['Nausea', 'Fatigue', 'Heartburn', 'Back pain', 'Swelling', 'Headache', 'Braxton Hicks', 'Cramps'];
export const MOODS = ['Rough', 'Okay', 'Good', 'Great', 'Amazing'];
