# Sprig — Master Specification

*A birth-to-adult family scheduling & tracking app. One app you set up at birth and still use when they're learning to drive.*

> **Working name:** "Sprig" (a small green shoot that grows) — placeholder, rename freely. This document is the authoritative product/data/backend reference, written in the same format as the SmartCart master spec and reusing its proven architecture wherever marked **[from SmartCart]**.

---

## 1. Vision & positioning

The family-app market is split into three silos that never talk to each other:

- **Newborn trackers** (Huckleberry, Nara, Baby Tracker, ParentLove) — feeds, sleep, diapers. Excellent for 0–2, then abandoned.
- **Family calendars** (Cozi, TimeTree, Maple, Calendara) — shared color-coded calendars and lists. Nothing for babies.
- **Co-parenting / chore / teen apps** (OurFamilyWizard, Greenlight, OurHome, Life360) — custody, expenses, allowances.

A parent today buys a baby tracker, abandons it at age 2, adopts a calendar app, bolts on a chore app, and adds a co-parenting app if separated — four logins, data lost at every handoff.

**Sprig's wedge is continuity.** It captures parents at birth (peak motivation, when a *free* tracker earns trust) and never makes them re-platform. The same app reconfigures itself as the child grows. Owning the customer at birth means owning them for 18+ years and every paid tier along the way.

### The one-liner
*The only family app that grows with your child — from first feed to first car.*

### Why now
- Cozi (20M+ users) alienated its base with a 2024 paywall (Trustpilot ~2.1★, "bait and switch"), has one-way calendar sync, no roles/permissions, and no data export — a vulnerable incumbent.
- "Kill manual entry" is the universal 2026 demand; AI photo-to-events is the feature pulling families off Cozi.
- Baby-app users are paywall-fatigued and reward genuinely free, fast, private trackers.

---

## 2. Differentiation at a glance

| Pain point (verified from reviews) | Sprig's answer |
|---|---|
| Baby apps die at age 2 | Age-adaptive profiles that span birth→adult |
| Manual event entry | Snap-to-Schedule (AI flyer/photo → events) |
| Cozi: anyone can delete anything | Roles, permissions & locked events |
| Cozi: one-way Google sync | True two-way Google/Apple/Outlook sync |
| Cozi: no data export, lock-in | Full export (PDF/CSV/iCal), GDPR-native |
| Baby apps: paywall fatigue | Newborn tracking free forever |
| 3am logging is clumsy | Two-tap logging + night mode |
| Doctor visit recall | One-tap Pediatrician PDF |
| Fragmented across 4 apps | One per-child record, lifelong |

---

## 3. Core concept — Age-Adaptive Child Profiles (the moat)

Every child has a profile with a **stage** derived from date of birth (manually overridable). The stage determines which tools surface on the child's "Today" screen; everything else is quietly archived into the lifelong timeline (§5.8). No competitor does this.

| Stage | Age (default) | Surfaced tools |
|---|---|---|
| **Newborn** | 0–12 mo | Feeds (breast/bottle), sleep + wake-windows, diapers, pumping + stash, growth percentiles |
| **Baby/Toddler** | 1–3 yr | Naps, meals/solids, potty training, milestones, daycare schedule |
| **Preschool** | 3–5 yr | Routines, activities, milestones, first appointments |
| **School** | 5–12 yr | Class timetable, homework, activities, term/holiday calendar, chores |
| **Teen** | 12–18 yr | Chores + allowance, exams, driving/license, independence, appointments |
| **Young adult** | 18+ | Light-touch shared calendar + archived timeline |

**Stage transitions** are gentle: when a child crosses a threshold, Sprig suggests the new toolset ("Mia is turning 1 — want to switch on toddler routines?") and never deletes the old data. A parent with a newborn *and* a 9-year-old sees each child in their correct stage simultaneously.

---

## 4. Data architecture — **local-first**

Sprig is **local-first**. All child and family data lives **on the device** as the source of truth. A deliberately **thin server** exists for exactly three things and nothing else: **account/auth, Stripe subscription/billing, and the operator admin panel** (with its live config + audit/RBAC). **No child data — profiles, logs, health, calendar, routines, expenses, timeline — ever touches the server.**

### The two layers

**On-device (everything that matters):** child profiles, newborn logs (feed/sleep/diaper/pump), calendar events, health records, routines/chores/allowance, expense splits, custody schedule, timeline, preferences. Works fully offline, instant, private. Persisted locally (the SmartCart local store pattern: debounced writes, flush on unmount; on a native shell, OS secure storage).

**Thin server (account + money + admin only):**
- **Account/auth** — id, email, password hash (or OAuth subject), verification, locale — the minimum to log in and to attach a subscription.
- **Billing** — plan, trial/sub status, Stripe customer/subscription ids. *(Stripe is retained — you have one account running; see §13 for the platform-billing caveat.)*
- **Admin/back-office** — Config, FeatureFlag, AuditLog (the §11 panel operates here).

### Multi-device & sharing — via platform sync, not our server
Cross-device continuity and basic family/caregiver sharing use **platform cloud sync** (Apple CloudKit / iCloud shared records; Android Google Drive app-data) — Apple/Google host it, not us. The device remains the source of truth; the platform just relays an encrypted copy between a user's own devices and, where supported, between family members. **We run no sync backend and store no child data centrally.**

### Real-time co-parent presence — optional future backend
True real-time presence ("who's online, edits appear instantly across two separate households") is the one capability platform sync does *not* fully deliver cross-platform. It is **out of scope for v1** and documented as an **optional future sync service** (the earlier tiered local/shared model) that would sync *only shared children* if demand proves it out — local stays the default; that server would be opt-in for that one feature.

### Sensitive-data note
Child health data (vaccines, meds, conditions) is GDPR **special category**. Local-first means it is **never on our server** at all; if a user shares a child via platform sync, health records are shared only on explicit per-record opt-in, encrypted by the platform. Health data never enters analytics or the AI pipeline.

| Data category | Where it lives | Notes |
|---|---|---|
| Child profiles, calendar, routines, timeline | **Device** | Optional platform sync across user's devices / family |
| Newborn logs (feed/sleep/diaper/pump) | **Device** | Optional platform sync |
| **Health records (special category)** | **Device** | Platform-shared only on explicit per-record consent |
| Co-parent custody + expense splits | **Device** | Platform sync between the two parents (where supported) |
| Account + auth | Thin server | Minimum to log in |
| Billing / subscription | Thin server + Stripe | Stripe is system of record |
| Admin config, feature flags, audit log | Thin server | Operator panel only |
| Analytics, marketing | Consent, minimal | Off by default |
| AI (Snap-to-Schedule) | On-device OCR; optional cloud parse | PII-free; see §5.2 |

---

## 5. Primary features (the 8 killers)

### 5.1 Age-Adaptive Child Profiles
The moat (§3). Stage-driven tool surfacing, gentle transitions, simultaneous multi-stage children, lifelong data retention.

### 5.2 📸 Snap-to-Schedule (AI flyer extraction)
Photograph a school flyer, sports schedule, or appointment card → text + dates extracted, events created, assigned to the right child + color, reminders set, deduped against existing events. **Local-first:** **on-device OCR** (Apple Vision / Android ML Kit) does text + basic date parsing offline by default; an **optional cloud LLM parse** (toggleable, PII-free — sends only the flyer text/image, never child data, no training retention) handles messy layouts for higher accuracy. Paste-text fallback. **The acquisition feature** for school-age families.

### 5.3 🍼 Newborn Care Suite (free forever)
Two-tap logging, night-mode UI, one-handed. Feeds (breast — **tracks which side started + last side** — or bottle with oz↔ml auto-convert, "duplicate last"), sleep with **adaptive wake-window reminders**, diapers, pumping + milk stash (goals + expiry), auto-tallies (total sleep/feeds per day), WHO growth percentiles. Free forever to beat paywall fatigue and win trust at the top of the funnel.

### 5.4 🩺 Health Hub + Pediatrician Report
Per-child medical record: vaccines/boosters (with due reminders), medications with **dosage reminders** (local notifications; mirrored to a co-parent's device when the child is platform-shared), allergies/conditions, doctor & insurance contacts, appointment history, growth charts. One-tap **Pediatrician PDF** generated **on-device**. Health data is on-device special-category, never on our server (§4).

### 5.5 🏫 School & Holiday Auto-Sync
Subscribe to a school's iCal feed and/or a regional school-holiday/term calendar (just fetching a public URL — no backend needed); term dates, closures, INSET/holiday days auto-populate per child. Two-way Google/Apple/Outlook sync runs **device-level through the OS calendar / the providers' own clouds** (not our server), so a working parent's work calendar and the family calendar coexist. Kills the "manually enter the school year" chore.

### 5.6 ⭐ Routines, Chores & Allowance (gentle, gamified)
Visual picture-routines for little kids; points/stars → rewards or real allowance for older kids; **partial credit for late tasks** (a specific, repeatedly-requested gap competitors ignore). Recurring schedules, per-child assignment, completion approval. Non-surveillance framing — guidance, not spying.

### 5.7 👨‍👩‍👧‍👦 Co-Parent Mode
Custody/handover schedule overlaid on the calendar ("my time / their time" shading), shared **expense splitting** with receipt photos and running balances, a neutral timestamped activity log, and a shared info-bank (schools, doctors, allergies) — the OurFamilyWizard toolset without the $99/yr price. **Local-first:** the two parents' devices stay in sync via **platform shared records** (CloudKit/Google), not our server. Sync is near-real-time on a shared platform; true cross-platform live presence is the **optional future backend** (§4). Data lives on the parents' devices, not centrally.

### 5.8 📔 Lifelong Child Timeline
Every milestone, photo, "first," appointment, and note rolls into one beautiful per-child story from birth onward. The emotional retention hook and the natural keepsake upsell (printable photo book / PDF export). This is what makes leaving Sprig feel like abandoning your child's history — the anti-churn moat.

---

## 6. Secondary features (fast-follows) **[several from SmartCart]**

- **🛒 Meal planning + shared grocery list** — lift SmartCart's list engine (stores, categories, favourites, voice-add) almost wholesale; families already conflate this with calendars (Cozi's #1 retained feature).
- **🔔 Weekly digest (local notification)** — the upcoming week per child, summarized on-device as a scheduled local notification *(no email — that would need a sender server; the digest is built and fired locally)*.
- **🌍 Multi-timezone** — for far-away grandparents/co-parents (device-local).
- **🌦️ Weather on calendar days** — third-party weather API call from the device ("does Mia need a raincoat for sports day?").
- **🧘 Opt-in wellbeing nudges** — gentle, research-based parenting prompts, generated/scheduled on-device, PII-free, never prescriptive.
- **🎙️ Voice add [from SmartCart]** — native on-device dictation; log an event or a feed hands-free while holding a baby.
- **💬 WhatsApp share [from SmartCart]** — OS share sheet, fully local.
- **↩️ Undo toast, 🎉 milestone confetti [from SmartCart]** — same delight primitives.
- **⭐ Favourites / quick-log [from SmartCart]** — frequent events ("swim practice", "5oz bottle") one tap.
- **📍 Location/check-in** — *dropped from v1* (sharing location between people needs a backend); revisit as platform-native if requested.

---

## 7. Cross-cutting / global **[from SmartCart]**

- **i18n: 6 languages** (EN/DE/ES/FR/TR/IT) + region — *critical*, since school terms/holidays are region-specific.
- **Multi-currency** (EUR/GBP/USD/JPY/CAD/AUD) for allowance & expense splitting; JPY integer.
- **Night mode** — deep warm charcoal, dimmed; non-negotiable for 3am logging (the one thing SmartCart didn't need).
- **Offline-first / local persistence** (debounced writes, flush on unmount).
- **Reduced-motion** (auto-detect + manual).
- **Accessibility** — ≥44px touch targets, high-contrast option, screen-reader labels.
- **Error boundary** + boot splash.

---

## 8. What transfers from SmartCart (reuse map)

| SmartCart asset | Sprig use |
|---|---|
| Local store pattern (debounced persistence, offline) | **The whole data layer** — all child data on-device (§4) |
| Tiered local/shared model + consent gate | Kept only as the **optional future sync backend** (§4) |
| Live sharing + presence engine | **Replaced by platform sync** (CloudKit/Google); real-time presence deferred |
| Admin panel (5 features) | **Retained, drop in wholesale** — operates on account/billing/admin only (§11) |
| Stripe + trial + plan logic | **Retained** — same billing spine, one Stripe account (§13) |
| 6-lang / multi-currency i18n | Direct transfer (§7) |
| AI pipeline (PII-free) | Snap-to-Schedule: on-device OCR + optional cloud parse |
| Favourites, voice-add, WhatsApp, undo, confetti | Secondary features (§6) |
| Calendar/History day-view with dot indicators | Becomes the family calendar day view |

---

## 9. Data model

Split by where it lives. **On-device stores** never leave the device (except via optional platform sync, which keeps the same shapes). **Server collections** are the thin account/billing/admin layer only.

### On-device stores (local-first — the source of truth)
```
Child { id, name, avatarToken, dob, stage, colorToken, createdAt }

Event { id, childIds:[], title, start, end, allDay, recurrence,
        category, location, notes, reminders:[], source, // manual|snap|ical
        lockedBy, color }

LogEntry { id, childId, type, // feed|sleep|diaper|pump|meal|potty|med
           start, end, detail:{ side, amount, unit, ... }, createdAt }

HealthRecord { id, childId, kind, // vaccine|med|allergy|condition|visit|growth
               data:{...}, special:true, createdAt }   // never server-side

Routine { id, childId, title, steps:[], schedule, points, rewardId }
Chore   { id, childId, title, schedule, points, status, lateCredit }
RewardLedger { id, childId, pointsBalance, allowanceBalance, currency }

ExpenseSplit { id, payerId, amount, currency, category,
               receiptUrl, splitWith:[], settled, createdAt }   // co-parent
CustodySchedule { id, blocks:[{ start, end, parentId }] }

TimelineItem { id, childId, kind, // milestone|photo|first|note|appointment
               title, media, date, sourceRef }

Prefs { locale, currency, theme, startView, units, notifications }

// optional platform-sync envelope (CloudKit/Google): { recordId, sharedWith:[], encryptedPayload }
```

### Server collections (thin — account + money + admin only)
```
User    { id, email, passwordHash, name, locale,
          plan, trialEndsAt, subStatus, stripeCustomerId, stripeSubId, createdAt }
// NO child data, ever.

// operator back-office [from SmartCart]
Config {...}  FeatureFlag {...}  AuditLog {...}
```

---

## 10. Screens

1. **Today / Dashboard** — per-child cards in their stage view; "what's next" timeline; quick-log FAB (center, periwinkle). Multi-child = swipeable cards.
2. **Calendar** — color-coded by child + caregiver; month/week/agenda; custody shading; dot-indicators **[from SmartCart History view]**; tap a day → events + logs.
3. **Child profile** — stage-adaptive hub: newborn log *or* timetable+chores *or* teen tools, plus growth, health shortcut, timeline entry.
4. **Newborn log** — two-tap feed/sleep/diaper/pump; night-mode; running tallies; wake-window banner.
5. **Health Hub** — record list, reminders, Pediatrician-PDF button.
6. **Routines & Chores** — visual routines; chore board with points/allowance; approval queue.
7. **Co-Parent** — custody calendar, expense splits + balances, info-bank, activity log.
8. **Timeline** — vertical per-child story; add milestone/photo; export/printable book.
9. **Settings** — account, plan/billing, family/sharing, preferences (units/lang/currency/theme/start-view), notifications, data export/reset, about. **[from SmartCart structure]**
10. **Onboarding** — see companion artifact.

Bottom nav: **Today · Calendar · ⊕ FAB · Children · Settings**. *(FAB = quick add: event / log / milestone, context-aware by stage.)*

---

## 11. Operator admin panel **[from SmartCart §16 — retained wholesale]**

**Retained as requested.** In the local-first model the panel operates on the **thin server only — accounts, billing, config, audit. It has zero access to child data** (profiles, logs, health, calendar), because none of that is on the server. This makes the 360° user view inherently minimal and the GDPR "erasure" job tiny (account + billing only). Same five features, same foundations-first build order:

1. **Live config store** — trial length, plan prices, enabled langs/currencies, feature flags w/ rollout targeting, kill switches (incl. AI extraction job), What's-new/Help content. No redeployment.
2. **Revenue dashboard** — MRR/ARR, new/expansion/churned MRR, churn %, trial→paid %, active subs by plan/tier, dunning, trials expiring, DAU/MAU; date+segment filters.
3. **User search + lifecycle** (no impersonation) — 360° view (**account + billing only**; no child data exists server-side to show), extend/reset trial, change/comp plan, suspend, password reset, GDPR erasure (account + billing + Stripe only — child data lives on the user's device and is erased by them locally).
4. **Subscription & billing control** — Stripe-reconciled state, dunning queue, one-click refund/comp/cancel/reactivate, webhook sync.
5. **Admin auth + RBAC + immutable audit log** — separate admin accounts, 2FA, superadmin/admin/support roles, append-only audit.

Build foundations (#1 config + #5 audit/RBAC) first; dashboard/user/billing on top.

---

## 12. GDPR & privacy — *radically simplified by local-first*

Because **no child or health data is ever on our server**, your data-controller surface shrinks to almost nothing — the single biggest reason to go local for a child app, and a real marketing line: *"your child's data never leaves your device."*

- **What we hold centrally:** only the account + billing record. That's the entire scope of our controllership for personal data.
- **Special-category (health) data:** never on our server at all — eliminates the hardest GDPR obligation outright.
- **Erasure:** trivial — delete the account + billing record and cancel Stripe. The child data is on the user's device and is theirs to delete (a local "reset all data"). No central cascade.
- **Access/portability:** full on-device export (PDF/CSV/iCal/JSON) — self-service, and a competitive feature vs Cozi's lock-in.
- **Processors/DPAs:** only the few the thin server touches — **Stripe** (billing) and your **host**; plus the **optional cloud-parse LLM** for Snap-to-Schedule if enabled (PII-free, no retention). Platform sync (CloudKit/Google) is processed under the user's own Apple/Google account.
- **Still do:** a short privacy policy + ToS, minimal **RoPA** for the account/billing data, EU hosting for the thin server, and a **72h** breach runbook (now scoped to account/billing only).
- **AI:** Snap-to-Schedule prefers **on-device OCR**; the optional cloud parse sends only flyer text/image, never child profiles, with no training retention.

*Not legal advice — confirm the (now minimal) privacy policy, ToS, and Stripe/host DPAs with an Austrian privacy lawyer.*

---

## 13. Monetization

- **10-day full-feature trial** (one-shot) **[from SmartCart]**.
- **Free forever:** newborn tracking, one child, single-caregiver, basic calendar — the trust-building top of funnel.
- **Sprig Pro** (~€2.99/mo · €19.99/yr) — unlimited children, Snap-to-Schedule, Health Hub + Pediatrician PDF, school sync, routines/chores, timeline export.
- **Sprig Family / Co-Parent** (~€4.99/mo · €34.99/yr) — everything in Pro + multi-caregiver sharing (via platform sync), co-parent mode, expense splitting, WhatsApp share.
- Billing via **Stripe** — retained (you have one account running): Checkout + Billing + Tax for EU VAT + Customer Portal; the thin server reconciles via webhooks and the admin panel reads it. **[from SmartCart]**

> **Platform-billing caveat.** Stripe is ideal on **web/PWA**, where it works cleanly. If Sprig ships as a **native iOS/Android app**, Apple/Google generally require **in-app purchase** for digital subscriptions (their 15–30% cut) rather than Stripe. Options: (a) keep it a **web/PWA** and bill with Stripe as specified; (b) go native and use **store IAP** (the store becomes billing; the admin panel then reconciles store receipts instead of Stripe); (c) hybrid — Stripe on web, IAP in the native apps. Since you already run Stripe, **(a) web/PWA-first keeps your existing setup intact.**

Upsell moments: the Pediatrician PDF (health), the printable Timeline book (memory), the co-parent expense balance (utility).

---

## 14. Design system — *distinct from SmartCart*

Sprig has its **own** identity: soft, cool, modern-pastel, and inclusive — deliberately *not* SmartCart's warm-oat/forest-serif look. Warm and family-friendly, but with **faceless silhouettes** (no drawn faces, no face-emoji) so every family sees themselves in it.

- **Base:** cool lilac-white `#F4F3FB`; cards `#FFFFFF`, ~22px radius, soft shadow; faint dot grain.
- **Type:** **Quicksand** (rounded geometric, 600/700) for display + **Nunito** for body — friendly and rounded, replacing Fraunces/Jakarta entirely.
- **Primary periwinkle `#6B6FC9`** — brand, FAB, active states, buttons (white text); deep `#54579E` for text on pastel. **Rose `#E98FB3`** accent; soft **gold `#E9C46A`** sparkles.
- **Per-child pastel tokens (cool set):** lilac `#E7E4FB`, sky `#DCEBFA`, mint `#D8F0E6`, blush `#FBE0EA`, peach `#FCE6D8`, butter `#FBF1CE`, sage `#E6EFDD` — each child owns one, carried across calendar, logs, timeline; each pairs with a darker same-family stroke for text/icons.
- **Faceless silhouette system (signature):** people are rendered as simple rounded silhouettes — a plain circle head with **no features** + soft shoulders — sized by stage (baby/child/adult). Used for avatars, the stage spine, hero art, and co-parent figures. No faces anywhere; inclusive and timeless.
- **Iconography:** flat rounded **line icons** (2px stroke, currentColor) in the palette — calendar, bottle, moon, pulse, camera, sprout, coin, house, etc. No multicolor emoji in the illustration layer (keeps the pastel palette cohesive).
- **Night mode:** deep indigo (`#262539` / `#312F49`), dimmed pastel accents; auto + manual — essential for 3am logging.
- **Components:** tile logging with check/heart/trash, bottom nav + center FAB, calendar dot-indicators, pill tabs, stat cards, confetti (structure **[from SmartCart]**, restyled to the new tokens).
- **Stage motif:** a sprout line-icon grows across stages (seedling → sprig → leafy) as a quiet progress metaphor in the timeline and brand mark.

---

## 15. Tech stack & Emergent build prompt

**Stack:** **Local-first** client — React + Tailwind as a **web/PWA** (React Native shell optional later), with all child data in an **on-device store** (IndexedDB/local persistence; OS secure storage on native), debounced writes, fully offline. **Thin server** — FastAPI + Python + a small DB (EU-region) holding **only** account/auth, Stripe billing mirror, and admin config/flags/audit. **Stripe** (Checkout/Billing/Tax/Portal) for subscriptions. **Platform sync** (CloudKit / Google Drive app-data) for multi-device + basic family/co-parent sharing — no sync backend of ours. **On-device OCR** (Vision/ML Kit) for Snap-to-Schedule, optional PII-free cloud LLM parse.

**Master build prompt (paste into Emergent):**
> Build "Sprig," a **local-first** birth-to-adult family scheduling & tracking app. ALL child/family data (profiles, feed/sleep/diaper/pump logs, calendar, health records, routines/chores/allowance, expenses, custody, timeline, prefs) lives **on the device** and works fully offline; it is NEVER sent to our server. A **thin server** stores ONLY: account/auth, Stripe subscription/billing, and an operator admin panel (live config + feature flags + audit/RBAC). Multi-device continuity and basic family/co-parent sharing use **platform cloud sync (Apple CloudKit / Android Google Drive app-data)**, not our backend; true real-time presence is out of scope (optional future sync service). Core: age-adaptive per-child profiles whose toolset changes by stage (newborn → toddler → school → teen → young adult) + a lifelong per-child timeline. Primary features: Snap-to-Schedule (on-device OCR + optional PII-free cloud LLM parse → events), free-forever newborn tracker (two-tap, night mode, wake-window reminders, growth percentiles), Health Hub with one-tap on-device Pediatrician PDF, device-level two-way Google/Apple/Outlook + public school-iCal sync, gentle gamified routines/chores/allowance with partial late credit, Co-Parent mode (custody shading + expense splitting + info-bank via platform sync), lifelong timeline with printable export. Secondary: meal/grocery list, voice-add (native dictation), WhatsApp share (OS share sheet), weekly digest as a LOCAL notification (no email server), multi-timezone, weather API, opt-in on-device wellbeing nudges. Global: 6 languages, 6 currencies, night mode, offline-first, reduced-motion, accessibility, error boundary. Billing: 10-day trial → Pro / Family via **Stripe** on web/PWA (Checkout+Billing+Tax+Portal); thin server reconciles via webhooks. Operator admin panel (operates on account/billing/admin only — no child data): live config store + feature flags (no redeploy), revenue dashboard (MRR/churn/conversion/dunning), user search & lifecycle (no impersonation; erasure = account+billing+Stripe only), Stripe-reconciled subscription control, admin auth + RBAC + immutable audit log. Design system (distinct, pastel, faceless): cool lilac-white #F4F3FB background, white ~22px cards, Quicksand (display) + Nunito (body), primary periwinkle #6B6FC9, rose #E98FB3 accent, gold #E9C46A sparkles, per-child cool pastel tokens (lilac/sky/mint/blush/peach/butter/sage), faceless rounded silhouettes for all people (circle head, no features), flat line icons, deep-indigo night mode #262539.

---

## 16. Build order

1. **Local foundations:** on-device store (offline persistence) + design system + night mode. **Thin server**: auth + live config/flags + audit/RBAC spine.
2. **Age-adaptive profile engine** (stages, transitions, per-child color) + **Today/Calendar** (device-level calendar + public iCal sync, dot-indicator day view).
3. **Free newborn suite** (two-tap logging, tallies, wake-windows, growth) — the funnel.
4. **Snap-to-Schedule** (on-device OCR + optional cloud parse) + **school/holiday iCal** — the acquisition wedge.
5. **Health Hub + on-device Pediatrician PDF**, **Routines/Chores/Allowance**.
6. **Platform-sync layer → Co-Parent mode** (custody + expenses via CloudKit/Google).
7. **Lifelong Timeline** + export/printable book.
8. **Stripe billing (web/PWA) + admin panel** [from SmartCart] + minimal GDPR tooling.
9. **Secondary features** (grocery/meal, voice, WhatsApp, local digest, weather, nudges).
10. *(Future, optional)* thin **sync backend** for true real-time co-parent presence — only if demand proves it.

---

*Companion artifacts: `Sprig_Onboarding.html` (first-run flow) and `Sprig_Concept_Board.html` (visual concept board), both in Sprig's own pastel + faceless-silhouette design system (§14), which is the authoritative visual reference.*
