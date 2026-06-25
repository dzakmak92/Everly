import { ModuleDef } from '../types';
import A02Today from './A02Today';
import A03NightLog from './A03NightLog';
import A04Calendar from './A04Calendar';
import A05HealthHub from './A05HealthHub';
import A06ChildProfile from './A06ChildProfile';
import A07RhythmRing from './A07RhythmRing';
import A08Routines from './A08Routines';
import A09CoParent from './A09CoParent';
import A10Timeline from './A10Timeline';
import A11Plans from './A11Plans';
import A12Settings from './A12Settings';
import A13ChildSchool from './A13ChildSchool';
import A14NightLogLight from './A14NightLogLight';
import A15Kiosk from './A15Kiosk';

export const appModule: ModuleDef = {
  key: 'app',
  title: "Everly App",
  subtitle: "The core family app — Today, Calendar, child profiles, health, routines, co-parent, plans.",
  accent: '#4A4670',
  frameWidth: 390,
  screens: [
  { id: 'a01', code: '02', label: "02 · Today", title: "Today / Dashboard", tier: 'free', component: A02Today },
  { id: 'a02', code: '03', label: "03 · Night Log", title: "Night Log (dark)", tier: 'premium', component: A03NightLog, dark: true },
  { id: 'a03', code: '04', label: "04 · Calendar", title: "Calendar", tier: 'free', component: A04Calendar },
  { id: 'a04', code: '05', label: "05 · Health Hub", title: "Health Hub", tier: 'premium', component: A05HealthHub },
  { id: 'a05', code: '06', label: "06 · Child Profile", title: "Child Profile", tier: 'premium', component: A06ChildProfile },
  { id: 'a06', code: '07', label: "07 · Rhythm Ring", title: "Rhythm Ring", tier: 'premium', component: A07RhythmRing },
  { id: 'a07', code: '08', label: "08 · Routines & Chores", title: "Routines & Chores", tier: 'premium', component: A08Routines },
  { id: 'a08', code: '09', label: "09 · Co-Parent", title: "Co-Parent", tier: 'free', component: A09CoParent },
  { id: 'a09', code: '10', label: "10 · Lifelong Timeline", title: "Lifelong Timeline", tier: 'free', component: A10Timeline },
  { id: 'a10', code: '11', label: "11 · Plans", title: "Plans / Paywall", tier: 'premium', component: A11Plans },
  { id: 'a11', code: '12', label: "12 · Settings", title: "Settings", tier: 'free', component: A12Settings },
  { id: 'a12', code: '13', label: "13 · Child Profile · School Age", title: "Child Profile · School Age", tier: 'premium', component: A13ChildSchool },
  { id: 'a13', code: '14', label: "14 · Night Log · Light Mode", title: "Night Log · Light Mode", tier: 'premium', component: A14NightLogLight },
  { id: 'a14', code: '15', label: "15 · Kiosk Mode", title: "Kiosk Mode", tier: 'premium', component: A15Kiosk, width: 1024, frameRadius: 28 },
  ],
};
