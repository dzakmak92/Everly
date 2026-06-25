import React from 'react';

/** A single recreated design screen. */
export type Tier = 'free' | 'safety' | 'premium' | 'premium-export' | 'marketing' | 'admin';

export type ScreenEntry = {
  id: string; // globally-unique route id, e.g. "p01", "m03", "a02", "d1", "ob1", "s1", "l1"
  code: string; // short code shown in lists, e.g. "P01", "M03", "02", "D1"
  label: string; // full caption used above the frame
  title: string; // short title for module lists
  tier: Tier;
  component: React.ComponentType;
  width?: number; // frame width override (defaults to the module frameWidth)
  dark?: boolean; // dark-surface screen (affects the full-screen route background)
  frameRadius?: number; // override the frame corner radius (e.g. wide desktop frames)
};

/** A group of screens recreated from one design file / product surface. */
export type ModuleDef = {
  key: string; // route key, e.g. "pregnancy", "maternal", "app", "onboarding", "fastfollow", "admin", "landing"
  title: string;
  subtitle: string;
  accent: string; // label + chrome accent color
  frameWidth: number; // default frame width for the module
  frameRadius?: number;
  freeForever?: boolean; // show the teal "Free forever" pill in the module header
  screens: ScreenEntry[];
};
