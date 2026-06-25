# Everly — Developer Build File (BUILD.md) · Mobile Edition

**Companion to:** `Everly_PRD_Master_Spec_v1.1_FINAL.md` (authoritative product/architecture) and `Everly_Build_Spec_v1.1.md` (per-screen build notes).
**Purpose of this file:** a code-level, step-by-step plan a developer (or an AI coding agent) can execute to scaffold, build, and ship Everly as a **mobile-first React Native (Expo) app for iOS and Android**. It turns the specs into a repository layout, a tech stack, environment setup, data contracts, a monetization/entitlement design, and a phased work plan with acceptance criteria.

> **Golden rule (PRD §3):** all child / maternal / health data lives **on the device** and works offline. Only explicitly-shared records traverse the **zero-knowledge E2E relay** as ciphertext. The **thin server** holds *only* anonymous config/flags and an ops/audit spine — never child, health, **or account** data. Every build decision below must preserve this.

> **Platform decision (this edition):** mobile-first **React Native + Expo**, one codebase for iOS + Android, chosen over a PWA (Safari evicts IndexedDB — fatal for a lifelong local-first record, and no widgets/Watch/Live-Activities/OS-calendar/OCR on iOS), over Flutter (discards the React/TS + design-token investment), and over native Swift+Kotlin (two codebases undercut the cheap iOS↔Android parity that is moat #3). A **thin web surface** remains for only three things: the marketing site, the Stripe web-checkout page (optional, regional), and the no-account QR calendar view for grandparents.

> **Monetization decision (this edition):** **install-and-run, no account.** A **free-forever "Mum&Me" bundle** (preconception + pregnancy-with-baby + the whole postpartum/maternal arc, incl. multiples and every subsequent pregnancy) + a permanent **safety floor**. **At birth, Mum&Me hands the baby to the premium Newborn suite** (30-day trial → paywall); the mother's postpartum side stays free. Billing via **Stripe web-checkout preferred, native IAP fallback** — no Everly account either way. See §6.

---

## 0. What we are building (one paragraph)

A **local-first, birth-to-adult family app** delivered as a **React Native (Expo) app for iOS and Android**, with a **dual age-adaptive engine** that surfaces the right tools for both each child (newborn→young-adult) and the birthing parent (preconception→pregnancy→postpartum→maternal recovery→ongoing maternal health). Three planes: an **on-device store** (source of truth, offline-first, SQLite), a **zero-knowledge E2E relay** (syncs only explicitly-shared records as ciphertext, iOS↔Android), and a **thin FastAPI server** (anonymous config/flags + ops/audit only). A separate **operator admin console** (desktop web) controls the runtime environment without redeploy and holds no child/health/account data. The app installs and runs with **no sign-up**; premium is a 30-day trial then a native-IAP paywall, on top of a permanent free safety floor.

---

## 1. Tech stack (locked)

| Layer | Choice | Notes |
|---|---|---|
| Client (app) | **React Native + Expo (dev client) + TypeScript** | iOS + Android, one codebase. Use a custom Expo dev build (not Expo Go) so native modules work |
| Styling | **NativeWind** (Tailwind for RN) | Consumes the same design tokens as the design system |
| State | **Zustand** (UI/session) + **TanStack Query** (relay/config fetches) | On-device store kept separate from any server cache |
| On-device store | **SQLite via `op-sqlite`** (or `expo-sqlite`) | Durable, un-evictable; behind a `DeviceStore` interface |
| Secure storage | **`expo-secure-store`** (iOS Keychain / Android Keystore) | Trial clock, device keypair, license token — survives reinstall |
| Charts | **Victory Native** + **`react-native-svg`** | Rhythm Ring is custom SVG; calm/pastel, night variants |
| Crypto (relay) | **`react-native-libsodium`** (X25519 key-wrap, XChaCha20-Poly1305) | Native; all encrypt/decrypt on-device only |
| Billing | **`react-native-iap`** (StoreKit 2 / Play Billing) as primary | Apple/Google hold identity; optional Stripe web-checkout for margin (regional) |
| Notifications | **`expo-notifications`** + native scheduling | Wake-window nudge, weekly digest, call-alert escalation; local-first |
| OCR (Snap) | On-device **Apple Vision / Android ML Kit** via native module + **optional** PII-free cloud parse | Kill-switchable flag `snap_cloud_parse` |
| Camera / barcode | **`expo-camera`** + ML Kit barcode | Safety scanner |
| Calendar sync | **`expo-calendar`** (two-way OS: Google/Apple/Outlook at device level) | Not via our server |
| Native surfaces | **Expo config plugins** for widgets, Live Activities / Dynamic Island, Apple Watch / Wear OS quick-log | See §2 `native/` |
| Relay service | Small **FastAPI** storing **ciphertext + routing metadata only** | Zero-knowledge |
| Thin server | **FastAPI + Python 3.11**, **PostgreSQL** (EU region) | Anonymous config/flags + ops/audit. **No account/user table by default** (see §6) |
| Admin console | **React + Vite + TypeScript + Tailwind**, desktop 1440, **Recharts/Tremor** | Web; light + dark toggle |
| Web surface | **React + Vite** thin site: marketing + Stripe checkout + QR calendar view | Not a full app |
| i18n | **i18next / `expo-localization`** | EN/DE/ES/FR/TR/IT + region packs |
| Testing | **Vitest + Testing Library**, **Maestro** (RN e2e), **pytest** (server) | |
| Tooling | ESLint + Prettier + TS strict; **pnpm** monorepo; **EAS Build/Submit** | |

---

## 2. Repository layout

A pnpm monorepo. Create this structure first.

```
everly/
├─ pnpm-workspace.yaml
├─ package.json
├─ README.md
├─ .env.example
├─ docker-compose.yml              # postgres + thin server + relay for local dev
│
├─ packages/
│  ├─ design-tokens/               # the design system as code (single source)
│  │  ├─ tokens.ts                 # colors, radii, shadows, child pastel tokens
│  │  ├─ nativewind-preset.ts      # exports the Tailwind/NativeWind theme from tokens
│  │  └─ fonts.ts                  # Quicksand + Nunito (expo-font / useFonts)
│  │
│  ├─ ui/                          # reusable RN component library (§3 design brief)
│  │  ├─ Button.tsx  Card.tsx  ListRow.tsx  Tile.tsx  StatCard.tsx
│  │  ├─ Chip.tsx  PillTabs.tsx  BottomNav.tsx  FAB.tsx  Avatar.tsx
│  │  ├─ Silhouette.tsx            # faceless silhouette, sized by stage (SIGNATURE)
│  │  ├─ Sprout.tsx                # growth motif, grows by stage index
│  │  ├─ Logo.tsx                  # tree-of-life SVG, currentColor + white variant
│  │  └─ charts/                   # RhythmRing, Sparkline, GrowthBand, MoodRibbon,
│  │                               #   WakeWindowBar, BalanceGauge (Victory Native + svg)
│  │
│  ├─ device-store/                # on-device persistence (SQLite) + repositories
│  │  ├─ db.ts                     # op-sqlite schema (all on-device + maternal stores)
│  │  ├─ DeviceStore.ts            # interface (so impl can swap per platform)
│  │  ├─ repos/                    # child, log, health, routine, chore, expense,
│  │  │                            #   custody, timeline, parent, maternalLog,
│  │  │                            #   maternalHealth, ppScreening, prefs
│  │  └─ export.ts                 # full local export (PDF/CSV/iCal/JSON) + reset
│  │
│  ├─ entitlements/                # NO-ACCOUNT trial + IAP entitlement engine (§6)
│  │  ├─ trial.ts                  # firstLaunchAt in SecureStore; trialEndsAt = +30d
│  │  ├─ iap.ts                    # react-native-iap: products, purchase, restore
│  │  ├─ entitlement.ts            # isPremium = hasEntitlement || inTrial; SAFETY_FREE allow-list
│  │  └─ webCheckout.ts            # OPTIONAL Stripe external-link + license-token restore
│  │
│  ├─ stage-engine/                # dual age-adaptive engine (§6 PRD)
│  │  ├─ childStage.ts             # derive stage from dob; manual override flag
│  │  ├─ maternalStage.ts          # derive from dueDate/birthDate; override flag
│  │  ├─ toolsets.ts               # stage → surfaced tools map (child + maternal)
│  │  └─ transitions.ts            # threshold crossing → gentle suggestion, never delete
│  │
│  ├─ relay-client/                # E2E relay client (§4 PRD)
│  │  ├─ crypto.ts                 # X25519 wrap + XChaCha20-Poly1305 (react-native-libsodium)
│  │  ├─ keyring.ts                # device keypair (SecureStore), record keys, invite wrapping
│  │  ├─ sync.ts                   # LWW per field + version vector, offline queue/merge
│  │  └─ presence.ts               # encrypted heartbeat (not stored)
│  │
│  ├─ config-client/               # anonymous bootstrap config + feature flags + cache
│  │  ├─ config.ts                 # GET /api/config (NO identifiers), cache, safe defaults
│  │  └─ flags.ts                  # isEnabled(flag,{region,version}) + killSwitch
│  │
│  └─ i18n/                        # i18next setup + locale JSON (en,de,es,fr,tr,it)
│
├─ apps/
│  ├─ mobile/                      # the Expo app (parent-facing) — PRIMARY
│  │  ├─ app.config.ts             # Expo config + plugins (widgets, live-activity, watch, iap)
│  │  ├─ eas.json                  # EAS build/submit profiles (dev / preview / production)
│  │  ├─ index.ts  App.tsx
│  │  └─ src/
│  │     ├─ navigation/            # Expo Router or React Navigation; tabs: Today·Calendar·FAB·Children·Settings
│  │     ├─ ErrorBoundary.tsx  BootSplash.tsx
│  │     ├─ theme/ThemeProvider.tsx        # light / night (#262539) auto + manual
│  │     ├─ paywall/Paywall.tsx            # 11 plans; shown when trial lapses; Restore button
│  │     ├─ screens/
│  │     │  ├─ today/              # 02 Today + "You" maternal card + what's-next + FAB
│  │     │  ├─ nightlog/           # 03 dark + 14 light
│  │     │  ├─ calendar/           # 04 + weather glyphs/banner/today chip + custody + OS sync
│  │     │  ├─ health/             # 05 Health Hub + Pediatrician PDF (device-only)
│  │     │  ├─ child/              # 06 profile + 13 school-age + Rhythm Ring 07
│  │     │  ├─ routines/           # 08 picture routines + chores + allowance
│  │     │  ├─ coparent/           # 09 custody + expenses + info-bank + tone-scan
│  │     │  ├─ timeline/           # 10 lifelong timeline + book/export
│  │     │  ├─ settings/           # 12 plan/sharing/prefs/export/reset (NO login row)
│  │     │  ├─ pregnancy/          # P01–P17 (see Build Spec §3.2)
│  │     │  ├─ maternal/           # M01–M11 (see Build Spec §3.3)
│  │     │  ├─ onboarding/         # 9-slide carousel (owned here)
│  │     │  └─ kiosk/              # fridge/Family Command Centre (landscape)
│  │     └─ fastfollow/            # grocery, digest, multi-tz, wellbeing, voice, share
│  │  └─ native/                   # native modules / config-plugin code
│  │     ├─ widgets/               # iOS WidgetKit + Android App Widget (lock-screen quick-log)
│  │     ├─ live-activity/         # Live Activities / Dynamic Island (feed/sleep timers)
│  │     ├─ watch/                 # Apple Watch + Wear OS quick-log targets
│  │     └─ ocr/                   # Apple Vision / ML Kit bridge for Snap-to-Schedule
│  │
│  ├─ admin/                       # operator console (desktop web 1440)
│  │  └─ src/screens/
│  │     ├─ dashboard/             # 01 KPI strip + MRR/IAP-revenue + funnel + cohort + feed
│  │     ├─ config/                # 02 config + feature-flag board (rollout/kill switch)
│  │     ├─ ops/                   # 03 anonymous ops (NO per-user data — see §6)
│  │     └─ audit/                 # 05 admin auth, RBAC, append-only audit log
│  │
│  └─ web/                         # THIN web surface only
│     └─ src/                      # marketing site · Stripe checkout page · QR calendar view
│
└─ services/
   ├─ thin-server/                 # FastAPI: anonymous config/flags + ops/audit. NO user table by default
   │  ├─ app/main.py  app/db.py  app/security.py (admin argon2, jwt, 2FA)
   │  ├─ app/routers/ (config, flags, admin, audit, webhooks_optional)
   │  ├─ app/models/ (Config, FeatureFlag, AuditLog)   # add Entitlement only if web-checkout enabled
   │  ├─ app/rbac.py                # superadmin/admin/support matrix (§10.6)
   │  └─ tests/
   │
   └─ relay/                       # zero-knowledge relay: ciphertext + routing only
      ├─ app/main.py  app/db.py    # relay_record(recordId, ownerId, recipients[], versionVector, encryptedPayload)
      └─ tests/                    # MUST assert server never sees plaintext
```

---

## 3. Design system as code (build `packages/design-tokens` + `packages/ui` first)

Encode the design brief once; every screen consumes it via NativeWind. **Hard constraints enforced in review:** faceless silhouettes only (no faces, no photos of people, no emoji faces) and periwinkle `#6B6FC9` on lilac `#F4F3FB` with Quicksand + Nunito.

```ts
// packages/design-tokens/tokens.ts  (platform-agnostic; feeds NativeWind preset)
export const color = {
  canvas: '#F4F3FB', cardSurface: '#FFFFFF',
  ink: '#33324A', inkSecondary: '#6F6E86', muted: '#9C9AB2',
  hairline: 'rgba(51,50,74,.08)',
  primary: '#6B6FC9', primaryDeep: '#54579E',
  accentRose: '#E98FB3', sparkleGold: '#E9C46A',
  maternalTeal: '#3A9B8A', preconceptionSky: '#4E8FD0',
  night: { bg: '#262539', card: '#312F49', text: '#EDEBFA' },
} as const;

export const childToken = {
  lilac:{fill:'#E7E4FB',stroke:'#6B6FC9'}, sky:{fill:'#DCEBFA',stroke:'#4E8FD0'},
  mint:{fill:'#D8F0E6',stroke:'#3FA98A'},  blush:{fill:'#FBE0EA',stroke:'#D46E97'},
  peach:{fill:'#FCE6D8',stroke:'#D9824F'}, butter:{fill:'#FBF1CE',stroke:'#C9A33B'},
  sage:{fill:'#E6EFDD',stroke:'#6E9A4E'},
} as const;

export const radius = { card: 22, tile: 15, pill: 999 };
export const shadow = { card: '0 3px 16px rgba(51,50,74,.07)' };  // map to RN elevation/shadow props
export const font   = { display: 'Quicksand', body: 'Nunito' };
```

Component library (`packages/ui`) ships with light + night variants: `Button`, `Card`, `ListRow`, `Tile`, `StatCard`, `Chip`, `PillTabs`, `BottomNav` (Today · Calendar · FAB · Children · Settings), `FAB`, `Avatar`, `Silhouette`, `Sprout`, `Logo` (re-trace `logo-tree.png` → SVG), plus the chart set. Accessibility: ≥44px touch targets, screen-reader labels (`accessibilityLabel`), high-contrast + reduced-motion, grandparent "large/simple" view.

---

## 4. Data contracts (implement verbatim — PRD §11)

**On-device stores (SQLite tables; source of truth).** Each maternal store carries `special: true`.

```ts
Child        { id, name, avatarToken, dob, stage, stageOverride?, colorToken, sharedRecordId?, createdAt }
Event        { id, childIds[], title, start, end, allDay, recurrence, category, location,
               notes, reminders[], source/*manual|snap|ical|voice*/, lockedBy?, color }
LogEntry     { id, childId, type/*feed|sleep|diaper|pump|meal|potty|med*/, start, end?,
               detail:{ side?, lastSide?, amount?, unit?, wet?, dirty?, leak?, ... }, createdAt, createdBy }
HealthRecord { id, childId, kind/*vaccine|med|allergy|condition|visit|growth*/, data, special:true, createdAt }
Routine      { id, childId, title, steps[], schedule, points, rewardId }
Chore        { id, childId, title, schedule, points, status, lateCredit?, approvedBy? }
RewardLedger { id, childId, pointsBalance, allowanceBalance, currency }
ExpenseSplit { id, payerId, amount, currency, category, receiptUrl?, splitWith[], settled }
CustodyBlock { id, childId, start, end, parentId, template }
TimelineItem { id, childId, kind/*milestone|photo|first|note|appointment*/, title, media?, date }
Prefs        { locale, currency, theme, startView, units, notifications, handedness }

// Maternal arc (special-category):
Parent       { id, name, avatarToken, role/*birthing|partner|caregiver*/, maternalStage?,
               maternalStageOverride?, colorToken, sharedRecordId?, createdAt }
// Pregnancy is a first-class EPISODE so a parent can have several over time (subsequent
// pregnancies) and each can carry MULTIPLES. A parent has 0..n pregnancies; the maternal
// stage is derived from the active one. See §6 "Mum&Me".
Pregnancy    { id, parentId, dueDate, startedAt, babyCount/*1=singleton,2=twins,3+*/,
               babyLabels[]/*["A","B"] per-baby tags*/, outcome/*ongoing|birth|loss*/,
               birthDate?, spawnedChildIds[]/*set at birth, 1 per baby*/, special:true }
MaternalLog  { id, parentId, pregnancyId?, babyTag?/*A|B for multiples kick/scan*/,
               type/*mood|symptom|weight|bp|glucose|lochia|incision|sleep|
               feedingForHer|kick|contraction|hydration|pelvicFloor*/, value, detail:{...}, special:true, createdAt }
MaternalHealthRecord { id, parentId, pregnancyId?, babyTag?, kind/*appointment|testResult|screening|condition|med|visit*/, data, special:true, createdAt }
PPScreening  { id, parentId, instrument/*EPDS*/, items[], score, flagged, takenAt, special:true }
BumpJournalEntry { id, pregnancyId, babyTag?, week, media?, milestone?, note?, date, special:true } // forks into each spawned child's TimelineItem at birth
MaternalTimelineItem { id, parentId, pregnancyId?/*groups entries per pregnancy chapter*/,
               kind/*milestone|bumpPhoto|birthStory|recovery|note*/, title, media?, date }
```

**Local entitlement state (SecureStore, not a server):**
```ts
TrialState   { firstLaunchAt, trialEndsAt }                    # iOS Keychain / Android Keystore
Entitlement  { active:boolean, productId?, source/*iap|web*/, validatedAt }   # cached from StoreKit/Play
```

**Relay (E2E ciphertext only):** `{ recordId, ownerId, recipients[], versionVector, encryptedPayload }`

**Thin server (PostgreSQL — never child/health/account data):**
```
Config      { key, value, updatedBy, updatedAt }
FeatureFlag { key, enabled, rollout:{percent, regions[], minVersion}, killSwitch, updatedBy, updatedAt }
AuditLog    { id, actorAdminId, actorRole, action, subject, before, after, at, ip }  # append-only
# Entitlement { token, plan, status, ... }  ← ONLY if optional web-checkout path (§6) is enabled
```

**Thin-server API surface (no per-user endpoints by default):**
```
GET  /api/config                      # public, cached, NO identifiers in request
PUT  /api/admin/config/:key           → audit         (admin, RBAC, 2FA)
PUT  /api/admin/flags/:key            → audit
POST /api/webhooks/stripe             # ONLY if web-checkout path enabled; signature-verified
```

---

## 5. Architecture contracts (every PR must honour)

1. **On-device store is the source of truth.** Offline-first, debounced writes. Special-category data (child health + ALL maternal/postpartum/fertility) is **device-only** and **never** enters analytics, AI, or the thin server.
2. **No account, no server identity.** The app installs and runs with no sign-up. The thin server receives **no user identifiers** on any request. Entitlement lives on-device, validated against StoreKit/Play (§6).
3. **Relay is zero-knowledge.** Ciphertext + minimal routing only (recordId, recipients, version vector). Per-record opt-in. LWW per field + version vector; offline queue/merge; encrypted presence (not stored); iOS↔Android. A test must fail if any plaintext reaches the relay DB.
4. **Thin server = anonymous config/flags + ops/audit only.** App tolerates a stale config cache → safe defaults.
5. **Snap-to-Schedule:** on-device OCR first; optional cloud parse receives flyer text/image **only** (PII-free, zero retention), gated by `snap_cloud_parse`.
6. **Backup/restore:** user-held-key encrypted backup (relay or user iCloud/Drive) + full local export. Never silently cloud-store unencrypted.
7. **No-redeploy control plane:** anything you might change without shipping a build is config/flag, not a constant.

---

## 6. Monetization & entitlement — install-and-run, no account (this edition's core)

**Model.** Install-and-run with no sign-up. A **free-forever "Mum&Me" bundle** (the empathy promise — bold it in marketing) + a permanent **safety floor**; everything else is **premium**, offered as a **30-day trial then a paywall**, billed via **Stripe web-checkout preferred** with **native IAP as the regional fallback**. No server-side user record — billing identity lives with Stripe (opaque token) or Apple/Google, never as an Everly account.

**Prices (PRD §13):** Pro €3.99/mo · €39.99/yr · Family €4.99/mo · €49.99/yr · Lifetime €149.99. Mirror price strings from remote config so copy changes without redeploy.

### 6.1 Free forever — the Mum&Me bundle (NEVER gated, even after the trial lapses)
Mum&Me is the **mother's journey with the baby woven in, up to the moment of birth**, plus the entire postpartum/maternal arc. It is free because giving it away is near-zero-cost (local-first: no per-user server/storage) and it is the funnel + emotional moat that drives later conversion. Contents:
- **Preconception / TTC** (M02): cycle/fertility, preconception checklist, TTC journal.
- **Pregnancy (me + baby)**: dashboard, week-by-week companion, symptoms/mood/weight, de-shamed weight band, basic Calm layer, safety scanner, baby names, **bump journal**.
- **Pregnancy safety floor** (free as duty of care): **kick counter**, **contraction timer 5-1-1**, **red-flag "when to call" triage**, **appointments + test-results manager**, **compassionate outcomes**.
- **Birth prep** suite (basic).
- **Postpartum / maternal arc (M01–M11), free**: "You" card, postpartum dashboard, recovery tracker, **EPDS screening** (kill-switch-locked), feeding & sleep for the mother, basic pelvic-floor recovery, postpartum appointment schedule, **compassionate postpartum outcomes**, and the **maternal timeline**.

### 6.2 The handoff — Mum&Me → Newborn (premium)
**At birth, Mum&Me hands the baby off to the Newborn tracking suite, which is premium** (30-day trial → paywall). Concretely: at birth the app creates a `Child` record per baby (see 6.3), forks each `BumpJournalEntry` into that child's timeline, and the child's **feed/sleep/diaper/pump tracking, WHO growth, rhythm ring, "what's next"** sit behind the paywall. The **mother's postpartum side keeps running free** in parallel — the paywall lands on *baby tracking*, never on *her* recovery or any safety feature. (This intentionally supersedes the old PRD "free-forever newborn, 1 child" line; safety features remain free regardless.)

### 6.3 Multiples (twins/triplets) — first-class, inside free Mum&Me
A pregnancy carries `babyCount` + `babyLabels[]` (e.g. A/B). While carrying:
- **Week-by-week**: one shared gestation timeline (multiples share a due date) with per-baby development notes where they diverge.
- **Bump journal & milestones**: one bump, entries optionally **tagged per baby** ("Baby A first kick").
- **Kick counter**: optional per-baby toggle (clinically meaningful for multiples); combined by default.
- **Appointments/test results**: per-baby labels on growth scans.
- **Birth prep**: checklist quantities scale with `babyCount`.
- **At birth**: spawn **N `Child` records**, each linked to the originating `pregnancyId`, each inheriting the shared pregnancy record; each then enters the premium Newborn suite separately.
- The **medical** multiples monitoring (P16 high-risk add-ons: glucose, BP/pre-eclampsia, bed-rest) stays **premium**; the *structure* to track a twin pregnancy is free.

### 6.4 Subsequent pregnancy — re-opens free Mum&Me every time
The maternal engine re-activates the Pregnancy stage on a new `Pregnancy` episode **even while existing children are tracked**. So a mother can be in **free Mum&Me for her new pregnancy while her toddler is on premium tracking** — clean separation, and Mum&Me free re-engages (and re-opens the funnel) with every pregnancy. The **maternal timeline accumulates pregnancies as chapters** (`pregnancyId` groups entries); each new bump journal forks to its own new child record(s) at birth. Today shows existing children's cards beside the maternal "You" card back in its pregnancy stage.

### 6.5 Premium (30-day trial → paywall)
Everything outside 6.1: **Newborn suite + all later child stages** (toddler→teen tracking), unlimited children, Snap-to-Schedule, Health Hub + Pediatrician PDF, school sync, routines/chores/allowance, timeline export + keepsake book, multi-caregiver relay sharing, Co-Parent Pro, kiosk, **Maternal Health PDF**, **postpartum recovery/EPDS history & trends** (the screening itself is free; long-term history is premium), **high-risk pregnancy add-ons**, full pelvic-floor + Calm libraries, **bump time-lapse export**, partner-watch. Co-Parent **Basics** stays free to ride the vacuum.

### 6.6 Implementation (`packages/entitlements`)
1. **Trial clock.** On first launch write `firstLaunchAt` to **SecureStore** (iOS Keychain / Android Keystore — persists across reinstall on iOS). `trialEndsAt = firstLaunchAt + 30d`.
2. **Entitlement resolution.** `isPremium = hasActiveEntitlement || now <= trialEndsAt`, where `hasActiveEntitlement` = a valid Stripe license token in SecureStore **or** an active StoreKit/Play purchase; cache the result.
3. **Gating.** `canAccess(feature) = MUM_AND_ME.has(feature) || SAFETY_FREE.has(feature) || isPremium`. Two allow-lists, both authoritative, so neither the empathy bundle nor a safety feature can ever be paywalled by accident — covered by a unit test.
4. **Paywall screen (11).** Shown only when a *premium* feature is touched and `!isPremium`. **Stripe web-checkout** external link (branded) → issue an **opaque license token** (optionally tied to a restore email only) → store in SecureStore; **native IAP** path as the regional fallback with **Restore Purchases**. US external links are currently 0% commission; EU/other regions carry layered fees and may require offering IAP alongside — verify per region at build time.
5. **The architecture is the trial enforcement.** Because data is local-first, uninstalling to dodge the paywall **deletes the baby's history**; the switching cost is the user's own data. So do **not** add device fingerprinting (it can't read a MAC on modern iOS/Android anyway and would break the privacy promise). Accept small trial leakage.

**Honest limit:** the hard paywall must never reach Mum&Me or a safety feature (6.1) — only baby tracking and the convenience/scale layer (6.5).

---

## 7. Phased build order with acceptance criteria (PRD §17 / Build Spec §7)

Work top-to-bottom. Don't start a phase until the prior phase's acceptance criteria pass.

### Phase 0 — Repo, Expo app shell, foundations
Scaffold the monorepo (§2); `design-tokens` + `ui` (NativeWind) (§3); ThemeProvider (light + night); ErrorBoundary + BootSplash; i18n (EN first); `device-store` SQLite + repositories (§4); `entitlements` trial clock + IAP skeleton (§6); thin server with anonymous config/flags + admin auth/2FA + append-only audit; EAS dev build that runs on a real iOS + Android device.
**Done when:** the app installs and boots offline with **no sign-up**; a record writes/reads from SQLite and survives reload **and reinstall** (data lives only on device, so reinstall = fresh — confirm export/restore path exists); `firstLaunchAt` persists in SecureStore across a reinstall; `GET /api/config` carries no identifiers and the app falls back to safe defaults when offline; admin logs in with 2FA and every config/flag write writes an append-only audit row.

### Phase 1 — Dual age-adaptive engine + Today + Calendar
`stage-engine` (child + maternal, derived + overridable, transitions never delete). Today (02): swipeable per-child stage cards + maternal **"You"** card (M01) + "what's next" + quick-log FAB. Calendar (04): month/week/agenda, per-child + per-caregiver color, density dots, **weather glyphs + alert banner + today chip**, locked events, custody shading, call-alert escalation, two-way OS sync via `expo-calendar`, no-account QR view (web surface).
**Done when:** a newborn + a school-age child show in correct stages simultaneously plus a "You" card; a stage threshold shows a gentle dismissible suggestion and deletes nothing; calendar renders weather-on-days + locked events; an OS calendar event round-trips.

### Phase 2 — Mum&Me free bundle (Pregnancy P01–P17) + premium Newborn suite + handoff
Build the `Pregnancy` episode model (§4) and the **Mum&Me free bundle** (§6.1): pregnancy dashboard, **P03 kick counter only** (with per-baby toggle for multiples), **P12 contraction timer 5-1-1**, week-by-week, symptoms/mood/weight, de-shamed weight band, safety scanner (camera+ML Kit), baby names, **bump journal** (per-baby tags), birth prep (quantities scale with `babyCount`), appointments+results (per-baby labels), red-flag triage, compassionate outcomes. **Multiples** (§6.3): `babyCount`/`babyLabels[]`, shared gestation timeline. **Subsequent pregnancy** (§6.4): a new `Pregnancy` episode re-activates the stage alongside existing children. Then the **premium Newborn suite**: two-tap Feed (breast side + last side) / Sleep (adaptive wake-windows) / Diaper / Pump+stash, duplicate-last, undo, tallies, WHO growth, "what's next", night mode, Rhythm Ring (07) — gated behind the trial/paywall. **Handoff** (§6.2): at birth, spawn one `Child` per baby linked to `pregnancyId`, fork each `BumpJournalEntry` into that child's timeline.
**Done when:** every Mum&Me + safety feature is reachable with no account and after the trial would expire (ignores the paywall); a twin pregnancy spawns two child records at birth, each with the forked bump journal; a second pregnancy re-activates free Mum&Me while an existing child sits on the premium newborn suite; touching newborn tracking after day 30 raises the paywall while the mother's postpartum side stays free; marking a loss instantly stops baby notifications + switches to supportive mode without deleting data; de-shamed weight shows a band, never a single score.

### Phase 3 — Postpartum / Maternal module (M01–M11)
Postpartum dashboard, recovery tracker (lochia red-flags, incision healing, BP ≥140/90 alert), **EPDS (free, kill-switch locked)** + gentle escalation + soft trend ribbon, pelvic-floor recovery, feeding & sleep for mum (mastitis red-flags), postpartum appointments + maternal PDF, partner-watch, compassionate postpartum outcomes, maternal timeline (pregnancy record flows in at birth).
**Done when:** EPDS data is device-only and provably never sent to server/analytics; a positive screen routes to resources (support, not diagnosis); maternal timeline shows TTC→test→scans→birth→postpartum continuity.

### Phase 4 — Snap-to-Schedule + school/holiday packs
On-device OCR (Vision/ML Kit) → preview cards → dedupe → commit; optional PII-free cloud parse behind `snap_cloud_parse`; iCal school/holiday subscriptions; region packs.
**Done when:** a flyer photo becomes deduped event cards fully offline; cloud parse is off by default and killable live from admin.

### Phase 5 — E2E relay → multi-caregiver + Co-Parent Basics (free)
`relay-client` crypto + keyring (device keypair in SecureStore) + sync; relay service. Multi-caregiver newborn sharing; Co-Parent Basics free (custody overlay + info-bank + read-only QR view).
**Done when:** an iOS and an Android device share one child and see each other's logs near-real-time; relay DB holds only ciphertext + routing (asserted by test); offline edits queue and merge on reconnect.

### Phase 6 — Health Hub + Pediatrician PDF + Routines/Chores/Allowance
Health Hub (vaccines/meds with co-parent-mirrored dosage reminders via relay, allergies/conditions, contacts) + one-tap **on-device** Pediatrician PDF. Routines (picture routines), chores (points/stars → multi-currency allowance, role-based approval, **partial late credit**).
**Done when:** Pediatrician PDF generates entirely on-device; a dose reminder mirrors to a co-parent's device via relay; a late chore can receive partial credit.

### Phase 7 — Co-Parent Pro + Lifelong/Maternal Timeline + printable book
Co-Parent Pro (expense split + receipts + settle-up + balance gauge, AI tone-scan, activity log, DV Safety Mode). Lifelong timeline (growing sprout spine, auto-capture firsts) + printable keepsake book (one-time IAP) + PDF/JSON export.
**Done when:** tone-scan flags hostile phrasing before send; balance gauge + settle-up reconcile; timeline exports to PDF/JSON.

### Phase 8 — Admin completion (anonymous) + GDPR posture
Admin dashboard reads **aggregate, anonymous** metrics + App Store/Play Connect revenue (and Stripe only if web-checkout enabled): installs, trial→paid %, plan mix, churn proxies, feature-flag rollout board, geo/currency split, live ops feed + alert chips. **No per-user search exists** (there is no user data server-side). Config/flags + append-only audit + RBAC (§10.6).
**Done when:** the admin console surfaces zero child/maternal/health/account data; the audit log has no update/delete endpoint; RBAC matrix enforced; GDPR controllership is effectively nil because no personal data is held (document this).

### Phase 9 — Secondary / fast-follow
Grocery list, weekly on-device-notification digest, multi-timezone, wellbeing nudge (feeds maternal mood ribbon), voice add, WhatsApp share, kiosk/fridge mode, life-admin reminders, daycare-note capture, child-led teen mode, undo/confetti/favourites.

---

## 8. Cross-cutting requirements (PRD §9)

i18n EN/DE/ES/FR/TR/IT + region · multi-currency EUR/GBP/USD/JPY/CAD/AUD (JPY integer) · night mode (auto + manual) · offline-first · reduced-motion · accessibility (≥44px targets, high-contrast, SR labels, grandparent large/simple view) · error boundary + boot splash · region-specific school-holiday packs. Charts use the child's pastel token, have night-mode variants, and reassure rather than test (faint "typical range" bands, no harsh scoring/coloring).

---

## 9. Consolidations to preserve (do NOT reintroduce — Build Spec §1 / PRD §20)

- One **tree-of-life** logo everywhere (`currentColor` + white variant).
- **P03 = Kick Counter only**; full 5-1-1 **Contraction Timer is P12** (single owner). No "Contractions" tab on P03.
- **Onboarding** owned solely by the onboarding carousel; the app starts at Today.
- **Weather is an attribute of calendar days**, not a standalone screen.
- Keep the deliberate parallels (child Today vs maternal "You" card; child vs maternal timeline; pregnancy vs postpartum compassionate outcomes; pregnancy mood vs postpartum EPDS; Support Circle vs Partner-Watch; Night Log dark vs light) — intentional, not duplicates.
- v1.1 admin flags: `maternal_postpartum_module` (rollout, kill-switchable), `preconception_ttc` (beta), `epds_mood_screening` (**kill-switch locked**).

---

## 10. Local dev quick-start

```bash
# prerequisites: Node 20+, pnpm 9+, Python 3.11+, Docker, Xcode + Android Studio, EAS CLI
pnpm install
cp .env.example .env                       # RELAY_URL, config-server URL, (optional) STRIPE_*
docker compose up -d                        # postgres + thin-server + relay
pnpm --filter @everly/thin-server dev       # FastAPI config/flags/admin on :8000
pnpm --filter @everly/relay dev             # relay on :8010
pnpm --filter @everly/mobile ios            # Expo dev build → iOS simulator/device
pnpm --filter @everly/mobile android        # Expo dev build → Android emulator/device
pnpm --filter @everly/admin dev             # admin web on :5174
pnpm --filter @everly/web dev               # thin web surface on :5173
pnpm test                                   # vitest + pytest
# release: eas build --profile production --platform all ; eas submit
```

IAP requires a real device + App Store Connect / Play Console sandbox products configured before Phase 6/paywall testing. `.env.example` keys: config-server URL, `RELAY_URL`, optional `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / price IDs (web-checkout path only), `CLOUD_PARSE_URL` (optional), `EU_REGION`.

---

## 11. Definition of Done (per PR + global)

**Every PR:** type-checks (strict) · lint/format clean · unit tests for new logic · **no special-category data and no user identifier leaves the device** · safety-floor features never gated by the paywall · no hard-coded value that should be config/flag · accessibility (targets, SR labels, reduced-motion) · light + night variants where applicable · faceless-silhouette rule upheld.

**Global / handoff checklist (PRD §22, adapted):** logo re-traced to SVG · dual stage engine (derived + overridable) · on-device SQLite store first, offline-first, debounced · trial clock in SecureStore (survives reinstall) + IAP entitlement + Restore + SAFETY_FREE floor · E2E relay (X25519 + XChaCha20-Poly1305, per-record opt-in, iOS↔Android, version-vector conflicts) · thin server holds no child/health/account data · special-category data never in analytics/AI/server · calendar OS two-way sync + weather-on-days + density dots + locked events + call-alert escalation · build order honoured (maternal module ships right behind pregnancy) · i18n + region packs + multi-currency + night mode + accessibility · native surfaces (widgets, Live Activities, Watch/Wear quick-log) shipped via Expo config plugins.

---

*Where this build file and the PRD diverge on a number/policy, the PRD wins; where they diverge on a screen's existence or composition, the design files + Build Spec §1 consolidation log win. App Store / Play external-payment rules vary by region and change frequently — verify the current rules for each target market before enabling the optional web-checkout path in §6.*
