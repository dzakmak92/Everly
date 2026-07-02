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

/** Body & nutrition tips by trimester (P02 tabs). */
export const TRIMESTER_TIPS: Record<1 | 2 | 3, { body: string[]; nutrition: string[] }> = {
  1: {
    body: ['Fatigue and nausea are common — rest when you can.', 'Your blood volume is rising; stay hydrated.', 'Light movement and fresh air can ease symptoms.'],
    nutrition: ['Take a folic-acid supplement daily.', 'Small, frequent meals help with nausea.', 'Avoid raw/undercooked foods and limit caffeine.'],
  },
  2: {
    body: ['Energy often returns — a good time for gentle exercise.', 'You may feel first movements (quickening).', 'Skin and ligaments stretch; moisturise and stretch gently.'],
    nutrition: ['Prioritise iron and calcium-rich foods.', 'Aim for steady, balanced meals.', 'Keep hydrating — 2L+ a day.'],
  },
  3: {
    body: ['Baby is gaining weight; you may feel breathless.', 'Braxton Hicks (practice contractions) are normal.', 'Sleep on your side; use pillows for support.'],
    nutrition: ['Smaller meals ease heartburn.', 'Keep up iron, calcium and omega-3s.', 'Stay hydrated and watch sodium for swelling.'],
  },
};

/** A small curated names list for the swipe explorer (P07). */
export const BABY_NAMES: { name: string; gender: 'Girl' | 'Boy' | 'Unisex'; origin: string; meaning: string }[] = [
  { name: 'Olivia', gender: 'Girl', origin: 'Latin', meaning: 'Olive tree — peace' },
  { name: 'Noah', gender: 'Boy', origin: 'Hebrew', meaning: 'Rest, comfort' },
  { name: 'Emma', gender: 'Girl', origin: 'Germanic', meaning: 'Whole, universal' },
  { name: 'Liam', gender: 'Boy', origin: 'Irish', meaning: 'Strong-willed protector' },
  { name: 'Ava', gender: 'Girl', origin: 'Latin', meaning: 'Life, bird' },
  { name: 'Oliver', gender: 'Boy', origin: 'Latin', meaning: 'Olive tree' },
  { name: 'Mia', gender: 'Girl', origin: 'Italian', meaning: 'Mine, beloved' },
  { name: 'Arthur', gender: 'Boy', origin: 'Celtic', meaning: 'Bear, strong' },
  { name: 'Isla', gender: 'Girl', origin: 'Scottish', meaning: 'Island' },
  { name: 'Leo', gender: 'Boy', origin: 'Latin', meaning: 'Lion' },
  { name: 'Freya', gender: 'Girl', origin: 'Norse', meaning: 'Lady, goddess of love' },
  { name: 'Rowan', gender: 'Unisex', origin: 'Irish', meaning: 'Little red one; rowan tree' },
  { name: 'Maya', gender: 'Girl', origin: 'Sanskrit', meaning: 'Illusion; water' },
  { name: 'Finn', gender: 'Boy', origin: 'Irish', meaning: 'Fair, white' },
  { name: 'Sage', gender: 'Unisex', origin: 'Latin', meaning: 'Wise, healthy herb' },
  { name: 'Ruby', gender: 'Girl', origin: 'Latin', meaning: 'Red gemstone' },
  { name: 'Ezra', gender: 'Boy', origin: 'Hebrew', meaning: 'Helper' },
  { name: 'Aria', gender: 'Girl', origin: 'Italian', meaning: 'Air; melody' },
];

export const RED_FLAGS_CALL_NOW = [
  'Heavy vaginal bleeding',
  'Severe or constant abdominal pain',
  'A noticeable drop or stop in baby’s movements',
  'Severe headache with vision changes or swelling',
  'Waters breaking before 37 weeks',
  'Fever over 38°C with feeling unwell',
];
export const RED_FLAGS_CALL_SOON = [
  'Persistent vomiting, unable to keep fluids down',
  'Painful or burning urination',
  'Sudden swelling of face, hands or feet',
  'Itching, especially hands and feet at night',
];

/** Short, chip-friendly red flags (paired with the fuller list above). */
export const RED_FLAGS_SHORT: { emoji: string; label: string }[] = [
  { emoji: '🩸', label: 'Heavy bleeding' },
  { emoji: '🤕', label: 'Severe belly pain' },
  { emoji: '👶', label: 'Baby moving less' },
  { emoji: '👁️', label: 'Headache + vision' },
  { emoji: '💧', label: 'Waters break early' },
  { emoji: '🌡️', label: 'Fever over 38°' },
];

/** "What to expect" — common, usually-normal symptoms by trimester. */
const EXPECTED_BY_TRIMESTER: Record<1 | 2 | 3, { emoji: string; label: string }[]> = {
  1: [{ emoji: '🤢', label: 'Nausea' }, { emoji: '😴', label: 'Fatigue' }, { emoji: '🤱', label: 'Tender breasts' }, { emoji: '🚽', label: 'Frequent wee' }, { emoji: '🍋', label: 'Food aversions' }],
  2: [{ emoji: '⚡', label: 'More energy' }, { emoji: '🤰', label: 'Bump growing' }, { emoji: '👣', label: 'First kicks' }, { emoji: '🤧', label: 'Congestion' }, { emoji: '🦶', label: 'Mild swelling' }],
  3: [{ emoji: '🔥', label: 'Heartburn' }, { emoji: '😮‍💨', label: 'Breathlessness' }, { emoji: '🦶', label: 'Swollen feet' }, { emoji: '😴', label: 'Poor sleep' }, { emoji: '〰️', label: 'Braxton Hicks' }, { emoji: '🚽', label: 'Frequent wee' }],
};
export function expectedSymptoms(week: number): { emoji: string; label: string }[] {
  const tri = week <= 12 ? 1 : week <= 27 ? 2 : 3;
  return EXPECTED_BY_TRIMESTER[tri];
}

/* ── Pregnancy weight-gain guidance (IOM 2009, by pre-pregnancy BMI) ── */
export type GainGoal = { lo: number; hi: number; category: string };

/** Body-mass index from weight (kg) and height (cm). */
export function bmiFrom(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return m > 0 ? weightKg / (m * m) : 0;
}

/** Recommended total pregnancy weight-gain range for a pre-pregnancy BMI. */
export function gainGoal(bmi: number | null): GainGoal {
  if (bmi == null || bmi <= 0) return { lo: 11.5, hi: 16, category: 'Estimated' };
  if (bmi < 18.5) return { lo: 12.5, hi: 18, category: 'Underweight' };
  if (bmi < 25) return { lo: 11.5, hi: 16, category: 'Normal' };
  if (bmi < 30) return { lo: 7, hi: 11.5, category: 'Overweight' };
  return { lo: 5, hi: 9, category: 'Obese' };
}

/**
 * Cumulative recommended weight gain (kg above pre-pregnancy) at a gestational
 * week: a small T1 gain (~0.5–2 kg by week 13) then a steady rate to term that
 * lands on the goal range at week 40.
 */
export function recommendedGain(week: number, goal: GainGoal): { lo: number; hi: number } {
  const w = Math.max(0, Math.min(40, week));
  const t1lo = 0.5, t1hi = 2; // reached by ~week 13
  if (w <= 13) return { lo: (w / 13) * t1lo, hi: (w / 13) * t1hi };
  const rateLo = (goal.lo - t1lo) / 27;
  const rateHi = (goal.hi - t1hi) / 27;
  return { lo: t1lo + (w - 13) * rateLo, hi: t1hi + (w - 13) * rateHi };
}
