import { ModuleDef } from '../types';

import P01 from './P01PregnancyDashboard';
import P02 from './P02WeekByWeek';
import P03 from './P03KickCounter';
import P04 from './P04SymptomsMoodWeight';
import P05 from './P05SafetyScanner';
import P06 from './P06BirthPrep';
import P07 from './P07BabyNames';
import P08 from './P08BumpJournal';
import P09 from './P09SupportCircle';
import P10 from './P10CalmLayer';
import P11 from './P11CompassionateOutcomes';
import P12 from './P12ContractionTimer';
import P13 from './P13Appointments';
import P14 from './P14PrenatalPDF';
import P15 from './P15RedFlagTriage';
import P16 from './P16HighRisk';
import P17 from './P17WeightBump';

/** Mum&Me · Pregnancy — 17 screens recreated from `Everly Pregnancy.dc.html`. */
export const pregnancyModule: ModuleDef = {
  key: 'pregnancy',
  title: 'Mum&Me · Pregnancy',
  subtitle: 'The free-forever bundle — we carry you, not just the baby. Conception → Birth.',
  accent: '#6A4670',
  frameWidth: 390,
  freeForever: true,
  screens: [
    { id: 'p01', code: 'P01', label: 'P01 · Pregnancy Dashboard', title: 'Pregnancy Dashboard', tier: 'free', component: P01 },
    { id: 'p02', code: 'P02', label: 'P02 · Week-by-Week Companion', title: 'Week-by-Week Companion', tier: 'free', component: P02 },
    { id: 'p03', code: 'P03', label: 'P03 · Kick Counter', title: 'Kick Counter', tier: 'safety', component: P03 },
    { id: 'p04', code: 'P04', label: 'P04 · Symptoms, Mood & Weight', title: 'Symptoms, Mood & Weight', tier: 'free', component: P04 },
    { id: 'p05', code: 'P05', label: 'P05 · Safety Scanner', title: 'Safety Scanner', tier: 'free', component: P05 },
    { id: 'p06', code: 'P06', label: 'P06 · Birth Prep Suite', title: 'Birth Prep Suite', tier: 'free', component: P06 },
    { id: 'p07', code: 'P07', label: 'P07 · Baby Names', title: 'Baby Names', tier: 'free', component: P07 },
    { id: 'p08', code: 'P08', label: 'P08 · Bump Journal', title: 'Bump Journal', tier: 'free', component: P08 },
    { id: 'p09', code: 'P09', label: 'P09 · Partner & Support Circle', title: 'Partner & Support Circle', tier: 'free', component: P09 },
    { id: 'p10', code: 'P10', label: 'P10 · Calm Layer', title: 'Calm Layer', tier: 'free', component: P10, dark: true },
    { id: 'p11', code: 'P11', label: 'P11 · Compassionate Outcomes', title: 'Compassionate Outcomes', tier: 'safety', component: P11 },
    { id: 'p12', code: 'P12', label: 'P12 · Contraction Timer · 5-1-1', title: 'Contraction Timer', tier: 'safety', component: P12 },
    { id: 'p13', code: 'P13', label: 'P13 · Appointments & Test Results', title: 'Appointments & Test Results', tier: 'safety', component: P13 },
    { id: 'p14', code: 'P14', label: 'P14 · Prenatal / Maternal Health PDF', title: 'Prenatal / Maternal PDF', tier: 'premium-export', component: P14 },
    { id: 'p15', code: 'P15', label: 'P15 · Red-Flag "When to Call" Triage', title: 'Red-Flag Triage', tier: 'safety', component: P15 },
    { id: 'p16', code: 'P16', label: 'P16 · High-Risk Add-Ons', title: 'High-Risk Add-Ons', tier: 'premium', component: P16 },
    { id: 'p17', code: 'P17', label: 'P17 · De-Shamed Weight + Bump Time-Lapse', title: 'De-Shamed Weight + Time-Lapse', tier: 'premium-export', component: P17 },
  ],
};
