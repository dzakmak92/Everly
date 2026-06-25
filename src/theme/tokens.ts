/**
 * Everly design tokens — single source of truth.
 * Mirrors `packages/design-tokens/tokens.ts` from Everly_BUILD.md §3, extended
 * with the exact literal values used across the Pregnancy (Mum&Me) design file.
 *
 * Hard constraints (enforced in review):
 *  - faceless silhouettes only (no faces / photos / emoji faces)
 *  - periwinkle #6B6FC9 on lilac #F4F3FB, Quicksand + Nunito
 */

export const color = {
  // canvas / surfaces
  canvas: '#F4F3FB', // cool lilac-white
  cardSurface: '#FFFFFF',
  gallery: '#C8C0CC', // the design-gallery page background

  // ink
  ink: '#33324A',
  inkSecondary: '#6F6E86',
  muted: '#9C9AB2',
  faint: '#C8C6DC',
  hairline: 'rgba(51,50,74,0.08)',

  // brand
  primary: '#6B6FC9', // periwinkle
  primaryDeep: '#54579E',
  accentRose: '#E98FB3',
  rose: '#D46E97', // deeper rose (blush stroke)
  roseInk: '#B04070',
  sparkleGold: '#E9C46A',
  gold: '#C9A33B',
  goldInk: '#7A5C20',

  // Mum&Me family
  maternalTeal: '#3A9B8A',
  tealDeep: '#2C8475',
  tealInk: '#1E5C50',
  preconceptionSky: '#4E8FD0',

  // night-mode surfaces
  nightBg: '#262539',
  nightCard: '#312F49',
  nightText: '#EDEBFA',

  // calm-layer dark gradient (P10)
  calmTop: '#2A1840',
  calmMid: '#3A2050',
  calmBottom: '#2C1A48',

  // scanner viewfinder
  scannerBg: '#1A1830',

  white: '#FFFFFF',
} as const;

/** Per-child / per-subject pastel tokens (fill paired with darker stroke). */
export const childToken = {
  lilac: { fill: '#E7E4FB', stroke: '#6B6FC9' },
  sky: { fill: '#DCEBFA', stroke: '#4E8FD0' },
  mint: { fill: '#D8F0E6', stroke: '#3FA98A' },
  blush: { fill: '#FBE0EA', stroke: '#D46E97' },
  peach: { fill: '#FCE6D8', stroke: '#D9824F' },
  butter: { fill: '#FBF1CE', stroke: '#C9A33B' },
  sage: { fill: '#E6EFDD', stroke: '#6E9A4E' },
} as const;

/** Extra fills referenced literally in the pregnancy screens. */
export const fill = {
  blush: '#FBE0EA',
  peach: '#FCE6D8',
  mint: '#D8F0E6',
  lilac: '#E7E4FB',
  butter: '#FBF1CE',
  sky: '#DCEBFA',
  tealSoft: '#E0F4EF', // first-chapter / reassurance banners
  mintGreen: '#3FA98A',
} as const;

export const radius = {
  phone: 44,
  card: 22,
  cardSm: 18,
  tile: 16,
  tileSm: 14,
  chip: 12,
  pill: 999,
} as const;

/** Soft shadow tokens mapped to RN shadow/elevation props. */
export const shadow = {
  card: {
    shadowColor: '#33324A',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  tile: {
    shadowColor: '#33324A',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  row: {
    shadowColor: '#33324A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  phone: {
    shadowColor: 'rgba(40,18,50,1)',
    shadowOpacity: 0.28,
    shadowRadius: 72,
    shadowOffset: { width: 0, height: 28 },
    elevation: 12,
  },
  pinkButton: {
    shadowColor: '#E98FB3',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  periwinkleButton: {
    shadowColor: '#6B6FC9',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
} as const;

/** Font families — loaded in app/_layout.tsx via @expo-google-fonts. */
export const font = {
  // Quicksand (display / headings)
  display500: 'Quicksand_500Medium',
  display600: 'Quicksand_600SemiBold',
  display700: 'Quicksand_700Bold',
  // Nunito (body / UI)
  body400: 'Nunito_400Regular',
  body500: 'Nunito_500Medium',
  body600: 'Nunito_600SemiBold',
  body700: 'Nunito_700Bold',
  body800: 'Nunito_800ExtraBold',
} as const;

/** Standard phone frame from the design (390 × content, 44px radius). */
export const PHONE_WIDTH = 390;
