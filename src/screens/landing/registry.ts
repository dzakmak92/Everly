import { ModuleDef } from '../types';
import L1Origin from './L1Origin';
import L2Grove from './L2Grove';
import L3Journey from './L3Journey';
import L4Manifest from './L4Manifest';
import L5Cards from './L5Cards';

export const landingModule: ModuleDef = {
  key: 'landing',
  title: "Landing Pages",
  subtitle: "5 marketing directions — green/sage premium, the tree-of-life mark.",
  accent: '#3A6B4E',
  frameWidth: 390,
  screens: [
  { id: 'l1', code: 'L1', label: "L1 · Origin", title: "Origin", tier: 'marketing', component: L1Origin },
  { id: 'l2', code: 'L2', label: "L2 · Grove", title: "Grove", tier: 'marketing', component: L2Grove },
  { id: 'l3', code: 'L3', label: "L3 · Journey", title: "Journey", tier: 'marketing', component: L3Journey },
  { id: 'l4', code: 'L4', label: "L4 · Manifest", title: "Manifest", tier: 'marketing', component: L4Manifest },
  { id: 'l5', code: 'L5', label: "L5 · Cards", title: "Cards", tier: 'marketing', component: L5Cards },
  ],
};
