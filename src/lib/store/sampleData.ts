import type {
  Child, Entry, EventItem, Vaccine, Medication, Growth, Milestone, Routine, Chore,
  Caregiver, Custody, Expense, PregCheckin, PregAppt, PregVital, KickSession,
  ContractionSession, BirthPrepItem, SavedName, TzContact, SavedTip,
} from './index';

/**
 * A rich demo dataset — two children of different ages plus an active
 * pregnancy — so every screen can be explored with realistic content.
 * Built fresh against "now" each time it's loaded.
 */
export function buildSampleData() {
  const now = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();
  const agoMin = (m: number) => iso(now - m * 60000);
  const agoDay = (d: number) => iso(now - d * 86400000);
  const inDay = (d: number) => iso(now + d * 86400000);
  const dateOnly = (ms: number) => new Date(ms).toISOString().slice(0, 10);

  const children: Child[] = [
    { id: 'c1', name: 'Oliver', color: 'mint', birthDate: dateOnly(now - 124 * 86400000) }, // ~4 months
    { id: 'c2', name: 'Mia', color: 'lilac', birthDate: dateOnly(now - 2300 * 86400000) },   // ~6 years
  ];

  const entries: Entry[] = [
    { id: 'e1', kind: 'feed', childId: 'c1', side: 'left', durationMin: 16, at: agoMin(35) },
    { id: 'e2', kind: 'diaper', childId: 'c1', diaperType: 'wet', at: agoMin(70) },
    { id: 'e3', kind: 'sleep', childId: 'c1', durationMin: 95, at: agoMin(150) },
    { id: 'e3b', kind: 'sleep', childId: 'c1', durationMin: 55, at: agoMin(330) },
    { id: 'e3c', kind: 'sleep', childId: 'c1', durationMin: 45, at: agoMin(540) },
    { id: 'e4', kind: 'feed', childId: 'c1', side: 'bottle', volumeMl: 120, at: agoMin(210) },
    { id: 'e5', kind: 'pump', childId: 'c1', volumeMl: 90, at: agoMin(250) },
    { id: 'e6', kind: 'mood', childId: 'c1', mood: 3, at: agoMin(300) },
    { id: 'e7', kind: 'note', childId: 'c1', note: 'Found his feet today and giggled!', at: agoMin(330) },
    { id: 'e8', kind: 'feed', childId: 'c1', side: 'right', durationMin: 14, at: agoDay(1) },
    { id: 'e9', kind: 'sleep', childId: 'c1', durationMin: 140, at: agoDay(1) },
    { id: 'e10', kind: 'meal', childId: 'c2', note: 'Porridge & berries', at: agoMin(420) },
    { id: 'e11', kind: 'activity', childId: 'c2', durationMin: 45, note: 'Ballet class', at: agoMin(180) },
    { id: 'e12', kind: 'mood', childId: 'c2', mood: 4, at: agoMin(120) },
    { id: 'e13', kind: 'potty', childId: 'c2', note: 'Independent', at: agoMin(95) },
    { id: 'e14', kind: 'medicine', childId: 'c2', note: 'Hayfever syrup 5ml', at: agoMin(500) },
  ];

  const events: EventItem[] = [
    { id: 'v1', childId: 'c1', title: 'Swim class', location: 'Leisure Centre', at: inDay(0.2) },
    { id: 'v2', childId: 'c1', title: 'Pediatrician check', location: 'Dr. Brennan', at: inDay(2) },
    { id: 'v3', childId: 'c2', title: 'Ballet recital', location: 'Town Hall', at: inDay(4) },
    { id: 'v4', title: 'Family dentist', location: 'Bright Smiles', at: inDay(6) },
    { id: 'v5', title: 'Midwife — glucose test', location: 'Maternity Unit', at: inDay(3) },
  ];

  const vaccines: Vaccine[] = [
    { id: 'x1', childId: 'c1', name: '6-in-1 (2nd dose)', dueDate: dateOnly(now + 9 * 86400000), provider: 'Dr. Brennan' },
    { id: 'x2', childId: 'c1', name: 'Rotavirus', givenDate: dateOnly(now - 30 * 86400000), provider: 'Dr. Brennan' },
    { id: 'x3', childId: 'c2', name: 'MMR', givenDate: dateOnly(now - 1200 * 86400000), provider: 'GP' },
    { id: 'x4', childId: 'c2', name: '4-in-1 preschool booster', dueDate: dateOnly(now + 20 * 86400000), provider: 'GP' },
  ];

  const medications: Medication[] = [
    { id: 'm1', childId: 'c1', name: 'Vitamin D drops', dose: '400 IU', schedule: 'Daily, morning', active: true },
    { id: 'm2', childId: 'c2', name: 'Antihistamine', dose: '5 ml', schedule: 'As needed (hayfever)', active: true },
    { id: 'm3', childId: 'c2', name: 'Amoxicillin', dose: '250 mg', schedule: 'Finished course', active: false },
  ];

  const growth: Growth[] = [
    { id: 'g1', childId: 'c1', at: agoDay(2), weightKg: 6.4, heightCm: 62, headCm: 41 },
    { id: 'g2', childId: 'c1', at: agoDay(35), weightKg: 5.6, heightCm: 59, headCm: 40 },
    { id: 'g3', childId: 'c2', at: agoDay(10), weightKg: 20.5, heightCm: 116 },
  ];

  const milestones: Milestone[] = [
    { id: 'ms1', childId: 'c1', title: 'First smile', date: dateOnly(now - 40 * 86400000), note: 'Melted our hearts' },
    { id: 'ms2', childId: 'c1', title: 'Rolled over', date: dateOnly(now - 8 * 86400000) },
    { id: 'ms3', childId: 'c2', title: 'Lost first tooth', date: dateOnly(now - 60 * 86400000), note: 'Tooth fairy came!' },
    { id: 'ms4', childId: 'c2', title: 'Started reception', date: dateOnly(now - 300 * 86400000) },
  ];

  const routines: Routine[] = [
    { id: 'r1', childId: 'c2', name: 'Morning routine', steps: [{ id: 's1', label: 'Get dressed', done: true }, { id: 's2', label: 'Brush teeth', done: true }, { id: 's3', label: 'Pack school bag', done: false }] },
    { id: 'r2', name: 'Bedtime', steps: [{ id: 's4', label: 'Bath', done: false }, { id: 's5', label: 'Story', done: false }, { id: 's6', label: 'Lights out', done: false }] },
  ];

  const chores: Chore[] = [
    { id: 'ch1', childId: 'c2', label: 'Tidy bedroom', points: 5, done: true },
    { id: 'ch2', childId: 'c2', label: 'Feed the cat', points: 3, done: false },
    { id: 'ch3', label: 'Water the plants', points: 2, done: false },
  ];

  const caregivers: Caregiver[] = [
    { id: 'cg1', name: 'James (Dad)', role: 'Partner' },
    { id: 'cg2', name: 'Susan', role: 'Grandparent' },
    { id: 'cg3', name: 'Aunt Beth', role: 'Carer' },
  ];

  const custody: Custody = { 0: 'With Mum', 1: 'With Mum', 2: 'With Dad', 3: 'With Dad', 4: 'With Mum', 5: 'With Mum', 6: 'With Dad' };

  const expenses: Expense[] = [
    { id: 'ex1', label: 'School shoes', amount: 45, paidBy: 'Mum', splitPct: 50, settled: false, at: agoDay(3) },
    { id: 'ex2', label: 'Ballet term fees', amount: 120, paidBy: 'Dad', splitPct: 50, settled: true, at: agoDay(20) },
    { id: 'ex3', label: 'Swim lessons', amount: 60, paidBy: 'Mum', splitPct: 50, settled: false, at: agoDay(7) },
  ];

  const dueDate = dateOnly(now + 70 * 86400000); // ~week 30
  const checkins: PregCheckin[] = [
    { id: 'p1', at: agoDay(0), mood: 3, symptoms: ['Backache', 'Tiredness'], weightKg: 72.5 },
    { id: 'p2', at: agoDay(2), mood: 4, symptoms: ['Heartburn'], weightKg: 72.2 },
    { id: 'p3', at: agoDay(5), mood: 2, symptoms: ['Swollen feet', 'Tiredness'], weightKg: 71.9 },
  ];
  const pregAppts: PregAppt[] = [
    { id: 'pa1', title: '28-week midwife', at: agoDay(14), kind: 'appointment', result: 'All healthy · BP 118/76' },
    { id: 'pa2', title: 'Glucose tolerance test', at: inDay(3), kind: 'test' },
    { id: 'pa3', title: '32-week growth scan', at: inDay(16), kind: 'appointment' },
  ];
  const pregVitals: PregVital[] = [
    { id: 'pv1', at: agoDay(1), kind: 'bp', systolic: 118, diastolic: 76, tag: 'Morning' },
    { id: 'pv2', at: agoDay(1), kind: 'glucose', glucose: 5.4, tag: 'Fasting' },
    { id: 'pv3', at: agoDay(4), kind: 'bp', systolic: 122, diastolic: 79 },
  ];
  const kickSessions: KickSession[] = [
    { id: 'k1', at: agoDay(0), count: 10, durationMin: 22 },
    { id: 'k2', at: agoDay(1), count: 10, durationMin: 35 },
  ];
  const contractionSessions: ContractionSession[] = [
    { id: 'co1', at: agoMin(40), durationSec: 45, intervalSec: 600 },
    { id: 'co2', at: agoMin(30), durationSec: 50, intervalSec: 580 },
  ];
  const birthPrep: BirthPrepItem[] = [
    { id: 'bp1', category: 'For Mum', label: 'Pack hospital bag', checked: true },
    { id: 'bp2', category: 'For Mum', label: 'Install car seat', checked: false },
    { id: 'bp3', category: 'For Baby', label: 'Wash newborn clothes', checked: true },
    { id: 'bp4', category: 'For Baby', label: 'Set up Moses basket', checked: false },
    { id: 'bp5', category: 'Birth plan', label: 'Decide pain relief preferences', checked: false },
  ];
  const savedNames: SavedName[] = [
    { id: 'n1', name: 'Aria', gender: 'girl' },
    { id: 'n2', name: 'Noah', gender: 'boy' },
    { id: 'n3', name: 'Sage', gender: 'neutral' },
  ];
  const tzContacts: TzContact[] = [
    { id: 't1', name: 'Grandma Rose', tz: 'America/New_York', location: 'Boston' },
    { id: 't2', name: 'Uncle Tom', tz: 'Australia/Sydney', location: 'Sydney' },
  ];
  const savedTips: SavedTip[] = [
    { id: 'tp1', at: agoDay(2), text: 'Practise your breathing exercises — they help during labour.' },
  ];

  return {
    children, activeId: 'c1', entries, events, vaccines, medications, growth, milestones,
    routines, chores, caregivers, custody, expenses, dueDate, checkins, pregStatus: 'active' as const,
    pregAppts, pregVitals, kickSessions, contractionSessions, birthPrep, savedNames, tzContacts, savedTips,
  };
}
