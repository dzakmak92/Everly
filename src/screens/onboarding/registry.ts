import { ModuleDef } from '../types';
import O01Hero from './O01Hero';
import O02MumAndMe from './O02MumAndMe';
import O03AgeAdaptive from './O03AgeAdaptive';
import O04SnapToSchedule from './O04SnapToSchedule';
import O05NightLog from './O05NightLog';
import O06HealthHub from './O06HealthHub';
import O07CoParent from './O07CoParent';
import O08Timeline from './O08Timeline';
import O09CTA from './O09CTA';

export const onboardingModule: ModuleDef = {
  key: 'onboarding',
  title: "Onboarding",
  subtitle: "9-slide first-run carousel — from the first scan to first car.",
  accent: '#5A4670',
  frameWidth: 390,
  screens: [
  { id: 'ob01', code: '01', label: "01 · Hero", title: "Hero", tier: 'marketing', component: O01Hero },
  { id: 'ob02', code: '02', label: "02 · Mum&Me — free, forever", title: "Mum&Me — free, forever", tier: 'marketing', component: O02MumAndMe },
  { id: 'ob03', code: '03', label: "03 · Age-Adaptive", title: "Age-Adaptive", tier: 'marketing', component: O03AgeAdaptive },
  { id: 'ob04', code: '04', label: "04 · Snap to Schedule", title: "Snap to Schedule", tier: 'marketing', component: O04SnapToSchedule },
  { id: 'ob05', code: '05', label: "05 · Night Log", title: "Night Log", tier: 'marketing', component: O05NightLog },
  { id: 'ob06', code: '06', label: "06 · Health Hub", title: "Health Hub", tier: 'marketing', component: O06HealthHub },
  { id: 'ob07', code: '07', label: "07 · Co-Parent", title: "Co-Parent", tier: 'marketing', component: O07CoParent },
  { id: 'ob08', code: '08', label: "08 · Timeline", title: "Timeline", tier: 'marketing', component: O08Timeline },
  { id: 'ob09', code: '09', label: "09 · CTA", title: "CTA — Start your story", tier: 'marketing', component: O09CTA },
  ],
};
