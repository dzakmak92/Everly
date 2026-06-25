import { ModuleDef } from '../types';
import M01TodayYou from './M01TodayYou';
import M02Preconception from './M02Preconception';
import M03PostpartumDashboard from './M03PostpartumDashboard';
import M04RecoveryTracker from './M04RecoveryTracker';
import M05EPDS from './M05EPDS';
import M06PelvicFloor from './M06PelvicFloor';
import M07FeedingSleep from './M07FeedingSleep';
import M08Appointments from './M08Appointments';
import M09PartnerWatch from './M09PartnerWatch';
import M10Compassionate from './M10Compassionate';
import M11Timeline from './M11Timeline';
import M12BirthHandoff from './M12BirthHandoff';
import M13PregnantAgain from './M13PregnantAgain';

export const maternalModule: ModuleDef = {
  key: 'maternal',
  title: "Maternal · Postpartum",
  subtitle: "The mother’s own continuous story — TTC → pregnancy → fourth trimester. Free-forever.",
  accent: '#1E5C50',
  frameWidth: 390,
  freeForever: true,
  screens: [
  { id: 'm01', code: 'M01', label: "M01 · Today — “You” Card", title: "Today — “You” Card", tier: 'free', component: M01TodayYou },
  { id: 'm02', code: 'M02', label: "M02 · Preconception / TTC", title: "Preconception / TTC", tier: 'free', component: M02Preconception },
  { id: 'm03', code: 'M03', label: "M03 · Postpartum Dashboard", title: "Postpartum Dashboard", tier: 'free', component: M03PostpartumDashboard },
  { id: 'm04', code: 'M04', label: "M04 · Recovery Tracker", title: "Recovery Tracker", tier: 'safety', component: M04RecoveryTracker },
  { id: 'm05', code: 'M05', label: "M05 · EPDS Mood Screening", title: "EPDS Mood Screening", tier: 'safety', component: M05EPDS },
  { id: 'm06', code: 'M06', label: "M06 · Pelvic-Floor & Movement Recovery", title: "Pelvic-Floor & Movement", tier: 'free', component: M06PelvicFloor },
  { id: 'm07', code: 'M07', label: "M07 · Feeding & Sleep for Mum", title: "Feeding & Sleep for Mum", tier: 'free', component: M07FeedingSleep },
  { id: 'm08', code: 'M08', label: "M08 · Postpartum Appointments & Maternal PDF", title: "Appointments & Maternal PDF", tier: 'premium-export', component: M08Appointments },
  { id: 'm09', code: 'M09', label: "M09 · Partner-Watch", title: "Partner-Watch", tier: 'free', component: M09PartnerWatch },
  { id: 'm10', code: 'M10', label: "M10 · Compassionate Postpartum Outcomes", title: "Compassionate Outcomes", tier: 'safety', component: M10Compassionate },
  { id: 'm11', code: 'M11', label: "M11 · Maternal Timeline", title: "Maternal Timeline", tier: 'free', component: M11Timeline },
  { id: 'm12', code: 'M12', label: "M12 · Birth Handoff — Mum&Me → Newborn", title: "Birth Handoff", tier: 'free', component: M12BirthHandoff },
  { id: 'm13', code: 'M13', label: "M13 · Today — Pregnant again, toddler at home", title: "Today — Pregnant again", tier: 'free', component: M13PregnantAgain },
  ],
};
