# Everly — React Native (Expo) app

A faithful **React Native (Expo + TypeScript)** recreation of the **Everly** design
handoff (`project/`), covering the whole product across **7 modules / 69 screens**:
the free-forever **Mum&Me** pregnancy + maternal arc, the core family app, the
onboarding carousel, fast-follow screens, the desktop operator console, and the
marketing landing directions.

> _One app, from the first scan to first car._ Birth-to-adult · local-first ·
> Mum&Me free forever · safety features never gated.

## Modules

| Module | Screens | Source design | Notes |
|---|---|---|---|
| **Mum&Me · Pregnancy** | 17 (P01–P17) | `Everly Pregnancy.dc.html` | Free-forever; safety floor (kick counter, contraction timer, triage, compassionate outcomes) never gated |
| **Maternal · Postpartum** | 13 (M01–M13) | `Everly Maternal.dc.html` | TTC → pregnancy → 4th trimester, EPDS, birth handoff, maternal timeline |
| **Everly App** | 14 (02–15) | `Everly UI.dc.html` | Today, Calendar (+weather), Health Hub, Child Profile, Rhythm Ring, Routines, Co-Parent, Timeline, Plans, Settings, Night Log (dark+light), Kiosk |
| **Onboarding** | 9 slides | `Everly Onboarding.dc.html` | 9-slide first-run carousel |
| **Fast-Follow** | 6 (S1–S7) | `Everly UI.dc.html` | Grocery, Weekly Digest, Multi-Timezone, Wellbeing, Voice Add, Share |
| **Operator Admin** | 5 (D1–D5) | `Everly Admin.dc.html` | Desktop 1440 — aggregate/anonymous; revenue, config & flags, users, billing, audit/RBAC |
| **Landing Pages** | 5 (L1–L5) | `Everly Landing.dc.html` | Origin · Grove · Journey · Manifest · Cards |

Screenshots of every screen live in [`screenshots/`](screenshots) (one folder per module).

## Running

```bash
npm install
npm run start        # Expo dev server (press i / a / w for iOS / Android / web)
npm run ios          # iOS simulator
npm run android      # Android emulator
npm run web          # browser
npm run typecheck    # tsc --noEmit (passes clean)
```

The **home screen is a module launcher**. Tap a module → its gallery (mirrors the
source `.dc.html` layout: header + labelled frames). Tap any frame → the screen
full-screen. Wide frames (Kiosk 1024 / Admin 1440) scroll horizontally.

## Architecture

```
app/                          # expo-router routes
  _layout.tsx                 # Stack + font loading (Quicksand + Nunito)
  index.tsx                   # module launcher (home)
  module/[key].tsx            # a module's gallery of frames
  screen/[id].tsx             # full-screen view of one screen (cross-module)
src/
  theme/
    tokens.ts                 # design tokens (colors, fonts, radii, shadows) — from Everly_BUILD.md §3
    logoPath.ts               # tree-of-life logo path data
  components/
    Logo.tsx                  # tree-of-life mark (currentColor + white variant)
    icons.tsx                 # flat line-icon set (2px stroke, rounded caps)
    ui.tsx                    # PhoneFrame, StatusBar, Card, Pill, FreeForeverPill,
                              #   SectionLabel, IconChip, ProgressBar, Silhouette,
                              #   SproutLockBadge, PrimaryButton, BottomNav
  screens/
    types.ts                  # ScreenEntry / ModuleDef shared types
    pregnancy/  maternal/  app/  onboarding/  fastfollow/  admin/  landing/
      registry.ts(x)          # each module's screens (id, code, tier, width, dark)
      <Screen>.tsx            # one component per screen (renders the phone/desktop body)
  modules.ts                  # aggregates all module registries; screenById / moduleByKey
```

### Design-system fidelity
- **Tokens** are the single source of truth (`src/theme/tokens.ts`), mirroring
  `Everly_BUILD.md` §3: periwinkle `#6B6FC9` on lilac `#F4F3FB`, maternal teal
  `#3A9B8A`, preconception sky `#4E8FD0`, per-child pastels, **Quicksand + Nunito**.
- **Faceless silhouettes** only (brand signature) — `Silhouette`, no faces/photos.
- **Mum&Me free↔premium grammar** (UI Spec v1.2 / BUILD.md §6): the quiet teal
  **"Free forever"** pill; the calm **sprout-lock** PREMIUM badge appears only on
  premium exports (e.g. Maternal/Prenatal PDF, bump time-lapse, newborn handoff) —
  **never** on safety features.
- Consolidations preserved: one tree-of-life logo; P03 = Kick Counter only
  (5-1-1 timer is P12); weather is a calendar attribute; onboarding owned by the
  carousel; admin holds no per-user child/maternal/health data.

## Verification

- `npm run typecheck` → **0 errors** across all 69 screens + router.
- `npx expo export --platform web` → bundles cleanly (every screen/import/font resolves).
- All 69 screens (+ launcher) rendered to `screenshots/` via Playwright.

## Source design

The original design bundle is preserved in `project/` (the `.dc.html` prototypes,
PRD/build/UI specs) and `chats/` (the design-iteration transcripts). Where this app
and the specs diverged on a screen's composition, the design files won; where numbers
differed, the PRD won — per `Everly_BUILD.md`.
