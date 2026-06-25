import { ModuleDef } from '../types';
import S1Grocery from './S1Grocery';
import S2Digest from './S2Digest';
import S3MultiTimezone from './S3MultiTimezone';
import S5Wellbeing from './S5Wellbeing';
import S6VoiceAdd from './S6VoiceAdd';
import S7Share from './S7Share';

export const fastfollowModule: ModuleDef = {
  key: 'fastfollow',
  title: "Fast-Follow",
  subtitle: "Secondary screens — grocery, digest, multi-timezone, wellbeing, voice, share.",
  accent: '#6E6A90',
  frameWidth: 390,
  screens: [
  { id: 's01', code: 'S1', label: "S1 · Grocery List", title: "Grocery List", tier: 'premium', component: S1Grocery },
  { id: 's02', code: 'S2', label: "S2 · Weekly Digest", title: "Weekly Digest", tier: 'free', component: S2Digest },
  { id: 's03', code: 'S3', label: "S3 · Multi-Timezone", title: "Multi-Timezone", tier: 'premium', component: S3MultiTimezone },
  { id: 's04', code: 'S5', label: "S5 · Wellbeing Nudge", title: "Wellbeing Nudge", tier: 'free', component: S5Wellbeing },
  { id: 's05', code: 'S6', label: "S6 · Voice Add", title: "Voice Add", tier: 'premium', component: S6VoiceAdd, dark: true },
  { id: 's06', code: 'S7', label: "S7 · Share via WhatsApp", title: "Share via WhatsApp", tier: 'free', component: S7Share },
  ],
};
