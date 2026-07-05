/**
 * Standard antenatal appointment schedule (UK NHS-style), keyed by gestational
 * week from the last menstrual period (LMP). Dates are computed from the user's
 * LMP, or back-calculated from the due date (due date = LMP + 280 days). Shared
 * by the Today appointments card and the full Appointments screen.
 */
export type AntenatalItem = { title: string; kind: 'appointment' | 'test'; week: number; detail: string };

export const PREG_ANTENATAL: AntenatalItem[] = [
  { title: 'Booking appointment', kind: 'appointment', week: 8, detail: 'Midwife booking — history, bloods & urine' },
  { title: 'Dating scan (12-week)', kind: 'test', week: 12, detail: 'Ultrasound + combined screening' },
  { title: '16-week midwife check', kind: 'appointment', week: 16, detail: 'Blood pressure, urine; discuss results' },
  { title: '20-week anomaly scan', kind: 'test', week: 20, detail: 'Detailed anatomy ultrasound' },
  { title: '25-week check (1st baby)', kind: 'appointment', week: 25, detail: 'BP, urine, fundal height' },
  { title: '28-week check', kind: 'appointment', week: 28, detail: 'Bloods, glucose, anti-D if needed' },
  { title: '31-week check (1st baby)', kind: 'appointment', week: 31, detail: 'BP, urine, fundal height' },
  { title: '34-week check', kind: 'appointment', week: 34, detail: 'BP, urine; talk through your birth plan' },
  { title: '36-week check', kind: 'appointment', week: 36, detail: 'Baby’s position; feeding chat' },
  { title: '38-week check', kind: 'appointment', week: 38, detail: 'BP, urine, fundal height' },
  { title: '40-week check (1st baby)', kind: 'appointment', week: 40, detail: 'BP, urine; discuss going overdue' },
  { title: '41-week check', kind: 'appointment', week: 41, detail: 'Membrane sweep offer; induction chat' },
];

/** The LMP anchor date from the last period, else back-calculated from the due
 *  date. Returns null when neither is known. */
export function lmpFrom(lastPeriod?: string | null, dueDate?: string | null): Date | null {
  if (lastPeriod) return new Date(`${lastPeriod}T00:00:00`);
  if (dueDate) return new Date(new Date(`${dueDate}T00:00:00`).getTime() - 280 * 86400000);
  return null;
}

export type DatedAntenatal = AntenatalItem & { iso: string };

/** The schedule with each appointment resolved to a calendar date (YYYY-MM-DD). */
export function datedAntenatal(lmp: Date): DatedAntenatal[] {
  return PREG_ANTENATAL.map((it) => {
    const d = new Date(lmp.getTime() + it.week * 7 * 86400000);
    return { ...it, iso: d.toISOString().slice(0, 10) };
  });
}
