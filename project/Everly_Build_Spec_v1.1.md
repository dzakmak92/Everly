# Everly — Build Specification & UI Reconciliation (v1.1)

**Companion to:** `Everly_PRD_Master_Spec_v1.1.md` (authoritative product/architecture reference).
**Purpose of this doc:** translate the PRD into a *build-ready* spec — every screen that exists in the design files, its data sources, state, tier gating, where data lives, and the architecture rules a developer must honour. Reflects all design consolidations through June 2026.

> **Golden rule (from PRD §3):** all child/maternal/health data lives **on the device** and works offline. Only explicitly-shared records traverse the **zero-knowledge E2E relay** as ciphertext. The **thin server** holds *only* account, billing, config/flags, and audit — never child or health data.

---

## 0. Design source files (single source of truth for UI)

| File | Surface | Screens |
|---|---|---|
| `Everly Landing.dc.html` | Marketing web | 5 landing directions |
| `Everly Onboarding.dc.html` | First-run | 8 slides: Hero · Age-Adaptive · Snap-to-Schedule · Night Log · Health Hub · Co-Parent · Timeline · CTA |
| `Everly UI.dc.html` | Core app (mobile + tablet kiosk) | 13 primary screens + 6 fast-follow + kiosk/lock-screen |
| `Everly Pregnancy.dc.html` | Pregnancy stage | P01–P17 |
| `Everly Maternal.dc.html` | Maternal arc (v1.1) | M01–M11 |
| `Everly Admin.dc.html` | Operator console (desktop 1440px) | 5 screens |

**Design system:** lilac-white `#F4F3FB` canvas · white 22px cards · Quicksand (display) + Nunito (body) · periwinkle `#6B6FC9` · rose `#E98FB3` · gold `#E9C46A` · maternal/postpartum teal `#3A9B8A` · preconception sky `#4E8FD0` · deep-indigo night `#262539` · per-child pastel tokens · faceless rounded silhouettes · tree-of-life sprout logo (`viewBox 0 0 100 118`, sage `#76a878`/`#8AA87C`).

---

## 1. Consolidation log (changes since first UI build)

These are intentional and must be preserved in build — do **not** reintroduce the removed duplicates.

1. **Logo** — replaced everywhere with the tree-of-life mark (twisted twin trunk + central raised-arms figure + leaf canopy + root splay). One SVG, `currentColor` for tinting, `white` variant for dark chips.
2. **Contraction Timer de-duplicated** — `P03` is now **Kick Counter only**; the full 5-1-1 **Contraction Timer is `P12`** (single owner). No "Contractions" tab on P03.
3. **Onboarding de-duplicated** — removed the standalone Onboarding screen from `Everly UI.dc.html`. Onboarding is owned solely by `Everly Onboarding.dc.html`. UI file starts at Today/Dashboard.
4. **Weather folded into Calendar** (PRD §8 "weather on calendar days"). The standalone Weather fast-follow screen was removed. `Everly UI.dc.html` Calendar (04) now shows: a weather-alert banner ("rain forecast for Mia's Sports Day"), per-day weather glyphs on the date grid, and a "⛅ Dublin 18°" today chip. Weather is an *attribute of calendar days*, not its own destination.
5. **Dead code removed** — a hidden (`display:none`) duplicate of the entire S1–S7 fast-follow set (~445 lines) was deleted from the UI file.
6. **Admin feature flags extended** for v1.1 — added `maternal_postpartum_module` (40% rollout, kill-switchable), `preconception_ttc` (10% beta, EN/DE), `epds_mood_screening` (ships with module, **kill-switch locked** — free duty-of-care safety feature).

**Intentional parallels (NOT duplicates — keep both):** child Today vs maternal "You" card · child Lifelong Timeline vs Maternal Timeline · pregnancy Compassionate Outcomes vs postpartum Compassionate Outcomes (PRD §7.0b explicitly extends it) · pregnancy mood check-in vs postpartum EPDS · pregnancy Support Circle vs postpartum Partner-Watch · Night Log dark vs light theme.

---

## 2. The dual age-adaptive engine (PRD §6)

Two parallel subjects, each with a DOB/due-date-derived **stage** that drives which toolset surfaces. Everything else archives to the timeline.

**Child stages:** Pregnancy(pre-birth) → Newborn(0–12mo) → Baby/Toddler(1–3) → Preschool(3–5) → School(5–12) → Teen(12–18) → Young adult(18+).

**Maternal stages (v1.1):** Preconception(optional) → Pregnancy → Postpartum/4th trimester(birth→~12wk) → Maternal recovery(~3–12mo) → Ongoing maternal health(12mo+).

**Build requirements:**
- `stage` is **derived** from `dob`/`dueDate`/`birthDate` but **manually overridable** (store override flag).
- Threshold crossing → gentle, dismissible suggestion ("switch on toddler routines?") + sprout motif growth. **Never delete data on transition** — only re-surface.
- Today shows each child in its correct stage simultaneously (swipeable per-child cards) **plus a "You" card** for the mother's maternal stage (Maternal M01).
- At birth: the pregnancy record **flows into** the maternal timeline (does not end); the bump journal flows into the child timeline.

---

## 3. Screen-by-screen build reference

Legend — **Data:** where the data lives · **Tier:** Free/Pro/Family · **Relay:** uses §4 E2E relay when shared.

### 3.1 Core app — `Everly UI.dc.html`

| # | Screen | Build notes | Data | Tier |
|---|---|---|---|---|
| 02 | **Today / Dashboard** | Per-child stage cards + "You" maternal card + "what's next" predictions + quick-log FAB. Multi-child swipeable. | Device | Free |
| 03 | **Night Log (dark)** | Two-tap Feed/Sleep/Diaper/Pump, deep-indigo `#262539`, dimmed, one-hand 3am ergonomics, duplicate-last, undo. | Device | Free |
| 04 | **Calendar (+weather)** | Month/week/agenda; per-child + per-caregiver color; density dots; **weather glyphs per day** + alert banner + today chip; locked events; custody shading; call-alert escalation. Two-way OS sync (Google/Apple/Outlook) **device-level, not our server**. | Device; ext sync via OS | Free (sync Pro) |
| 05 | **Health Hub** | Vaccines/boosters w/ due reminders, meds w/ **co-parent-mirrored dosage reminders** (relay), allergies/conditions, contacts, one-tap **Pediatrician PDF** (on-device). | **Special — device only** | Pro |
| 06 | **Child Profile** | Stage-adaptive hub; avatar token; stage timeline entry. | Device | Free |
| 07 | **Rhythm Ring** | Signature 24h radial clock; feeds/sleeps/diapers as arcs; tap segment to drill in. Night-mode variant. | Device | Free |
| 08 | **Routines & Chores** | Picture routines (little kids); points/stars → rewards/allowance (multi-currency); role-based approval; **partial late credit**. | Device; relay if shared | Pro |
| 09 | **Co-Parent** | Custody overlay (15 templates), expense split + receipts + settle-up, info-bank, activity log, **AI tone-scan**, DV Safety Mode. Basics free; Pro = expenses+tone-scan. iOS↔Android via relay. | Device + relay | Basics Free / Pro Family |
| 10 | **Lifelong Timeline** | Vertical story w/ growing sprout spine; auto-capture firsts; printable book (one-time); PDF/JSON export. | Device; relay if shared | Core; export Pro |
| 11 | **Paywall / Plans** | Free / Pro €3.99·€39.99 / Family €4.99·€49.99 / Lifetime €149.99. Stripe on web/PWA. | Server (billing) | — |
| 12 | **Settings** | Account, plan/billing, family/relay sharing, prefs, notifications, **data export/reset**, about. | Mixed | Free |
| 13 | **Child Profile · School age** | Timetable, homework, activities, chores/allowance surfacing. | Device | Free/Pro |
| 14 | **Night Log · Light** | Same as 03, light theme (auto/manual toggle). | Device | Free |
| S1–S7 | **Fast-follow** | Grocery list · Weekly Digest (on-device local notification) · Multi-Timezone · Wellbeing Nudge (feeds maternal mood ribbon) · Voice Add · WhatsApp Share. *(Weather removed — see §1.4.)* | Device | mixed |
| — | **Kiosk / Fridge** | Always-on PWA Family Command Centre (calendar+chores+today), 1024×660 landscape, kitchen-readable. | Device | Family |

### 3.2 Pregnancy stage — `Everly Pregnancy.dc.html`
All special-category, **on-device**. Safety features never paywalled.

| # | Screen | Build notes | Tier |
|---|---|---|---|
| P01 | Pregnancy Dashboard | Week badge, days-to-go, progress bar, quick-log tiles, today summary, baby-size card. | Free |
| P02 | Week-by-Week Companion | 40-wk timeline, dual size comparison, Baby/Your body/Nutrition tabs, dev cards. Zero ads/data sale. | Free |
| P03 | **Kick Counter** | Baseline-aware counting, target ring, midwife red-flag note, recent sessions. *(Contractions → P12.)* | Free |
| P04 | Symptoms / Mood / Weight | 5-point mood, symptom chips, optional weight, save check-in. | Free |
| P05 | Safety Scanner | Barcode/search safety grading (food/meds/products), PII-free lookups, recent scans w/ Safe/Caution/Avoid. | Free (unlimited Pro) |
| P06 | Birth Prep Suite | Hospital bag (For Mum/Baby), birth plan, baby names tabs; progress banner. | Free/Pro |
| P07 | Baby Names | Swipe + search, mutual likes, meaning/popularity. | Free |
| P08 | Bump Journal | Weekly photo grid, milestones; **flows into child timeline at birth**. | Free |
| P09 | Partner & Support Circle | Granular revocable following (partner/midwife/grandparent) via relay; E2E note. | Full circle Family |
| P10 | Calm Layer | Meditations/sleep stories/breathing; dark UI. | Basic Free / full Pro |
| P11 | Compassionate Outcomes | Mark loss → pause notifications, supportive mode, resources, archive. **Never monetized.** | Free |
| P12 | **Contraction Timer (5-1-1)** | Running session, current/interval/avg, big tap, 5-1-1 status banner, contraction list, share to partner/doula. | Free (safety) |
| P13 | Appointments & Test Results | Upcoming appts; bloods/NT/GTT/**Group B Strep**/growth scans w/ Normal/Clear/Pending states. | Free; PDF Pro |
| P14 | Prenatal / Maternal Health PDF | On-device report (overview, meds, tests, mood/EPDS); OS share to provider. | Pro |
| P15 | Red-Flag "When to Call" Triage | Two tiers (call now / call today), quick-dial maternity unit. **Guidance not diagnosis.** | Free (safety) |
| P16 | High-Risk Add-Ons | GD glucose (fasting+post-meal targets), BP/pre-eclampsia log w/ ≥140/90 alert, multiples/bed-rest add-ons. | Pro |
| P17 | De-Shamed Weight + Bump Time-Lapse | Healthy-gain **band** (never single number/score) + bump time-lapse video export. | Pro |

### 3.3 Maternal arc — `Everly Maternal.dc.html` (v1.1)
All special-category, **on-device**. Safety/duty-of-care features free.

| # | Screen | Build notes | Tier |
|---|---|---|---|
| M01 | Today "You" Card | Maternal stage card beside children's cards: mood/sleep/recovery mini-metrics, week badge. | Free |
| M02 | Preconception / TTC | Cycle calendar (period/fertile window/ovulation), LH-surge prediction, preconception checklist, TTC journal. Strongest post-Roe privacy story. | Free |
| M03 | Postpartum Dashboard | 4-quadrant recovery (physical/mood/feeding/sleep), **14-day mood ribbon** (gentle, no harsh coloring), today actions. | Free |
| M04 | Recovery Tracker | Lochia w/ red-flag thresholds, perineal/**C-section incision** healing %, postpartum BP w/ pre-eclampsia alert, "what's normal this week". | Free (history Pro) |
| M05 | EPDS Mood Screening | Validated Edinburgh scale, tapering cadence, soft trend (no harsh score), positive→resources. **Support not diagnosis; never to employer/insurer.** | **Free** |
| M06 | Pelvic-Floor Recovery | Stage-keyed routine (weeks×birth type), diastasis awareness gate, return-to-run date. | Basic Free / full Pro |
| M07 | Feeding & Sleep for Mum | Breastfeeding comfort log, **mastitis red-flags**, her sleep-debt chart, hydration nudge. | Free |
| M08 | Postpartum Appointments + Maternal PDF | 6wk→annual maternal schedule (distinct from pediatric), prep questions, on-device Maternal Health PDF. | Free; PDF Pro |
| M09 | Partner-Watch | Consented relay view focused on *her* wellbeing ("she could use a hand"), revocable. | Family |
| M10 | Compassionate Postpartum Outcomes | Traumatic birth/NICU, feeding grief, PPD crisis; never forces a happy narrative. **Never monetized.** | Free |
| M11 | Maternal Timeline | Continuous story TTC→positive test→scans→birth→postpartum; pregnancy record flows in at birth. Export. | Core; export Pro |

### 3.4 Operator console — `Everly Admin.dc.html`
**Holds zero child/maternal/health data** (PRD §3, §10). Maternal features appear here ONLY as feature flags + billing entitlements — never as user data.

| # | Screen | Build notes |
|---|---|---|
| 01 | Revenue Dashboard | KPI hero strip (MRR/Active/Trial→Paid/Churn/Dunning + sparklines + deltas), **MRR waterfall**, trial funnel, **cohort retention heatmap**, live ops feed + alert chips. |
| 02 | Config & Feature Flags | Live config (no redeploy); flag board w/ rollout %, targeting chips, kill switches, adoption sparklines. **v1.1 flags:** `maternal_postpartum_module`, `preconception_ttc`, `epds_mood_screening` (kill-switch locked). |
| 03 | User Search & Lifecycle | 360° = **account + billing + entitlements only** (no child data exists server-side). Extend trial, change/comp plan, grant lifetime, toggle entitlements, suspend, **GDPR erasure = account+billing only**. No impersonation. |
| 04 | Subscription & Billing | Stripe-reconciled; dunning queue; refund/comp/cancel/reactivate; webhook listener. |
| 05 | Admin Auth, RBAC & Audit | 2FA admins; roles superadmin/admin/support per §10.6 matrix; **append-only audit log** (no update/delete endpoint). |

---

## 4. Architecture contracts (developer must honour)

- **On-device store** = source of truth (IndexedDB/SQLite web/PWA; OS secure storage native). Offline-first, debounced writes, flush on unmount.
- **E2E relay** (§4): X25519 key-wrap + XChaCha20-Poly1305; server stores ciphertext + minimal routing (recordId, recipients, version vector) only. LWW per field + version vector for conflicts; offline queue/merge; encrypted presence heartbeat (not stored). Per-record opt-in. Cross-platform iOS↔Android.
- **Thin server** = accounts/auth + Stripe mirror + config/flags + audit. Never child/health data. App tolerates stale config cache → safe defaults.
- **Snap-to-Schedule** (§5): on-device OCR first; optional cloud LLM parse receives **flyer text/image only**, PII-free, zero retention, kill-switchable (`snap_cloud_parse`).
- **Special-category data** (child health + all maternal/postpartum/fertility): device only; relay only as ciphertext on explicit per-record consent; **never** in analytics, AI, or thin server. EPDS/fertility never exposed to employers/insurers.
- **Backup/restore:** user-held-key encrypted backup (relay or user iCloud/Drive) + full local export. Never silently cloud-store unencrypted.

## 5. Data model
Use PRD §11 verbatim (on-device stores, maternal arc stores `Parent`/`MaternalLog`/`MaternalHealthRecord`/`PPScreening`/`MaternalTimelineItem`, relay ciphertext shape, thin-server `User`/`Config`/`FeatureFlag`/`AuditLog`). All maternal stores carry `special:true`.

## 6. Monetization & gating (PRD §13)
Free Forever €0 · Pro €3.99/mo·€39.99/yr · Family €4.99/mo·€49.99/yr · Lifetime €149.99. Stripe on web/PWA. **Always-free (top-of-funnel + duty of care):** preconception, contraction timer, red-flag triage, EPDS screening, compassionate outcomes, newborn suite, Co-Parent Basics. **Emotional upsells:** Pediatrician PDF, Maternal Health PDF, timeline book, co-parent balance, tone-scan, postpartum recovery/EPDS history, partner-watch.

## 7. Build order (PRD §17, maternal-aware)
1. On-device store + design system + night mode; thin server (auth + config/flags + audit/RBAC); Stripe skeleton.
2. Dual age-adaptive engine + Today/Calendar (OS sync, weather-on-days, dots, roles/locked events).
3. Pregnancy module (P01–P17) + free Newborn suite — unified conception→newborn funnel. *(Optional pre-step: Preconception/TTC M02.)*
3b. Postpartum/Maternal module (M01–M11) — ship right behind step 3.
4. Snap-to-Schedule + school/holiday packs (back-to-school 2026).
5. E2E relay → multi-caregiver + Co-Parent Basics (ride AppClose/TalkingParents vacuum).
6. Health Hub + Pediatrician PDF, Routines/Chores/Allowance.
7. Co-Parent Pro + Lifelong/Maternal Timeline + printable book.
8. Admin completion + GDPR tooling.
9. Secondary (grocery, wellbeing, kiosk, life-admin, daycare, digest, child-led teen).

## 8. Cross-cutting (PRD §9)
i18n EN/DE/ES/FR/TR/IT + region · multi-currency EUR/GBP/USD/JPY/CAD/AUD (JPY integer) · night mode · offline-first · reduced-motion · accessibility (≥44px targets, high-contrast, SR labels, grandparent large/simple view) · error boundary + boot splash · region-specific school-holiday packs.

---

*This build spec reflects the design files as of June 2026. Where this doc and the PRD diverge on a *number*, the PRD wins; where they diverge on a *screen's existence or composition*, the design files (and §1 consolidation log) win.*
