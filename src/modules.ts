import { ModuleDef, ScreenEntry } from './screens/types';
import { pregnancyModule } from './screens/pregnancy/registry';
import { maternalModule } from './screens/maternal/registry';
import { appModule } from './screens/app/registry';
import { onboardingModule } from './screens/onboarding/registry';
import { fastfollowModule } from './screens/fastfollow/registry';
import { adminModule } from './screens/admin/registry';
import { landingModule } from './screens/landing/registry';

/** All recreated design surfaces, in product order. */
export const MODULES: ModuleDef[] = [
  pregnancyModule,
  maternalModule,
  appModule,
  onboardingModule,
  fastfollowModule,
  adminModule,
  landingModule,
];

export const moduleByKey = (key?: string | string[]) =>
  MODULES.find((m) => m.key === (Array.isArray(key) ? key[0] : key));

export type ResolvedScreen = { module: ModuleDef; screen: ScreenEntry };

export const screenById = (id?: string | string[]): ResolvedScreen | undefined => {
  const target = Array.isArray(id) ? id[0] : id;
  for (const module of MODULES) {
    const screen = module.screens.find((s) => s.id === target);
    if (screen) return { module, screen };
  }
  return undefined;
};

export const totalScreens = () => MODULES.reduce((n, m) => n + m.screens.length, 0);
