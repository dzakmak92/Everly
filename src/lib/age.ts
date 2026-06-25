/**
 * Age + life-stage engine. Turns a birth date into a human age and the canonical
 * 6-stage taxonomy used across the app (L2/L3 designs). A future birth date is
 * treated as "Expecting".
 */

export type Stage =
  | 'expecting'
  | 'newborn'
  | 'baby'
  | 'preschool'
  | 'school'
  | 'teen'
  | 'youngAdult';

export const STAGE_LABEL: Record<Stage, string> = {
  expecting: 'Expecting',
  newborn: 'Newborn',
  baby: 'Baby',
  preschool: 'Preschool',
  school: 'School',
  teen: 'Teen',
  youngAdult: 'Young Adult',
};

export type Age = { years: number; months: number; days: number; totalDays: number };

/** Parse a YYYY-MM-DD (or ISO) string to a Date, or null if unparseable. */
export function parseDate(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s.length <= 10 ? `${s}T00:00:00` : s);
  return isNaN(d.getTime()) ? null : d;
}

/** Age broken into years/months/days plus total days (negative if in the future). */
export function ageFrom(birth?: string, now: Date = new Date()): Age | null {
  const b = parseDate(birth);
  if (!b) return null;
  const totalDays = Math.floor((now.getTime() - b.getTime()) / 86400000);
  let years = now.getFullYear() - b.getFullYear();
  let months = now.getMonth() - b.getMonth();
  let days = now.getDate() - b.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days, totalDays };
}

/** Compact age label: "12 days", "4 months", "6 years". */
export function ageLabel(birth?: string, now: Date = new Date()): string {
  const a = ageFrom(birth, now);
  if (!a) return '';
  if (a.totalDays < 0) return 'expecting';
  if (a.years >= 2) return `${a.years} years`;
  if (a.years === 1) return a.months > 0 ? `1 yr ${a.months} mo` : '1 year';
  const months = a.years * 12 + a.months;
  if (months >= 1) return `${months} month${months === 1 ? '' : 's'}`;
  return `${a.totalDays} day${a.totalDays === 1 ? '' : 's'}`;
}

/** Derive the life-stage from a birth date. */
export function stageFrom(birth?: string, now: Date = new Date()): Stage {
  const a = ageFrom(birth, now);
  if (!a) return 'newborn'; // no DOB → assume newborn
  if (a.totalDays < 0) return 'expecting';
  const months = a.years * 12 + a.months;
  if (months < 3) return 'newborn';
  if (months < 12) return 'baby';
  if (a.years < 5) return 'preschool';
  if (a.years < 12) return 'school';
  if (a.years < 18) return 'teen';
  return 'youngAdult';
}
