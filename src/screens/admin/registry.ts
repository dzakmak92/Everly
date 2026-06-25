import { ModuleDef } from '../types';
import D1Dashboard from './D1Dashboard';
import D2Config from './D2Config';
import D3Users from './D3Users';
import D4Billing from './D4Billing';
import D5Audit from './D5Audit';

export const adminModule: ModuleDef = {
  key: 'admin',
  title: "Operator Admin",
  subtitle: "Desktop console (1440) — aggregate, anonymous. No per-user child/health data.",
  accent: '#4A4670',
  frameWidth: 1440,
  frameRadius: 18,
  screens: [
  { id: 'd1', code: 'D1', label: "D1 · Revenue Dashboard", title: "Revenue Dashboard", tier: 'admin', component: D1Dashboard },
  { id: 'd2', code: 'D2', label: "D2 · Config & Feature Flags", title: "Config & Feature Flags", tier: 'admin', component: D2Config },
  { id: 'd3', code: 'D3', label: "D3 · User Search & Lifecycle", title: "User Search & Lifecycle", tier: 'admin', component: D3Users },
  { id: 'd4', code: 'D4', label: "D4 · Subscription & Billing", title: "Subscription & Billing", tier: 'admin', component: D4Billing },
  { id: 'd5', code: 'D5', label: "D5 · Audit Log & RBAC", title: "Audit Log & RBAC", tier: 'admin', component: D5Audit },
  ],
};
