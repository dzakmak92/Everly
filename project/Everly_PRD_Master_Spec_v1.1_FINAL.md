# Everly — Product Requirements Document & Master Specification

### *The only family app where your family's data stays on your device — and the only one that grows with both the child and the mother, from trying to conceive to first car.*

**Version:** 1.1 (build-ready) · **Date:** June 2026 · **Status:** authoritative product / architecture / build reference

> This PRD supersedes earlier Everly drafts. It folds in the Strategic Market Analysis (June 2026), resolves the local-vs-shared architecture into a deliberate **local-first core with a thin encrypted shared-records relay**, specifies every feature in build-level detail, and defines an **operator admin panel that controls the entire runtime environment without redeployment**. Working name "Everly" — placeholder; verify trademark.
>
> **v1.1 change:** adds the **maternal continuity arc** — the birthing parent becomes a first-class subject (preconception → pregnancy → postpartum → ongoing maternal health), not merely a logger of the child's data. This closes the "abandoned at delivery" gap *for the mother* (the same failure the strategy attacks in competitors), promotes postpartum/maternal wellness from a fast-follow to a primary module, and finishes prenatal features that were specified but unbuilt. Full detail: `Everly_Maternal_Feature_Spec.md`.

---

## Part I — Strategy

## 1. The opportunity in one page

The parenting-app market is **$1.71–1.93B growing ~12.8% CAGR**, yet structurally **fragmented into three silos that never connect**: newborn trackers (≈44% share, abandoned at age 2), family calendars (Cozi et al., nothing for babies), and co-parenting apps (≈22%, the priciest). A typical parent runs a **3–4 app stack costing $300–500/year** and **loses all data at every handoff**.

Three timing windows are open *right now*:

1. **Cozi's collapse** — a 2024 paywall cut free users to a 30-day window; Trustpilot ~2.1★, "bait and switch," one-way sync, no roles, no export. 20M+ users are reachable.
2. **The co-parenting free-tier vacuum** — AppClose (Jan 2026) and TalkingParents (Mar 2026) both killed their free tiers within 90 days; 1M+ users are actively seeking alternatives.
3. **The privacy opening** — 46% of parents cite data privacy as their top concern; most baby trackers sell data to ad networks and grant themselves unlimited-retention licenses.

**Everly's answer:** one **age-adaptive** app spanning birth→adult, **local-first** so "your family's data never leaves your device," with a **free-forever newborn tier** and **free Co-Parent Basics**, unifying the $300–500 stack for **~€40–50/year**. We don't need to beat Huckleberry at sleep; we need to be *good enough everywhere* and the *only one everywhere at once*.

A fourth window is open that the rest of the category leaves wide open: **the mother herself.** Every major pregnancy app (Flo, What to Expect, BabyCenter, Ovia, Pregnancy+, The Bump) tracks the baby and abandons the mother at delivery — exactly when the **fourth-trimester crisis peaks** (postpartum depression ~15–20%, postpartum anxiety ~25–35%, symptoms often peaking *months* after birth, with only a minority ever reaching care). No one owns the **preconception → pregnancy → postpartum → maternal-health** continuum, and the apps that track maternal data most (Ovia/Glow) are the ones whose employer/insurer data models women most distrust. Everly's local-first architecture turns maternal continuity into a moat competitors cannot copy without an architectural reversal.

## 2. Positioning, moats & non-goals

**Positioning statement (canonical):** *"The only family app that carries both your baby and you — from trying, through pregnancy, through the fourth trimester no one else shows up for, to first car — privately, on your device, for good."*

**The five reinforcing moats:**
1. **Data continuity** — 18+ years of one child's record *and* the mother's continuous maternal record; switching cost no competitor can match.
2. **Local-first privacy** — a claim cloud apps cannot make without an architectural reversal; uniquely powerful for special-category maternal/fertility data post-Roe.
3. **Cross-platform sync relay** — E2E-encrypted relay bridging mixed iOS/Android households; the gap no competitor closes.
4. **Emotional timeline** — leaving means abandoning your child's history *and* your own maternal journey; anti-churn by attachment.
5. **Dual age-adaptive engine** — stage-driven tool surfacing for both the child (newborn→adult) **and the mother** (preconception→postpartum→maternal health); a distinctive interaction model and the antidote to "apps abandon the mother at delivery."

**Explicit non-goals (v1):** we do **not** chase court-admissible/high-conflict co-parenting (OurFamilyWizard's fortified turf — needs neutral immutable server records that contradict local-first); we do **not** build a social network; we do **not** sell data, ever; we do **not** require an account to start.

---

## Part II — Architecture: the local / shared balance

## 3. Core principle — local-first, selectively shared

Everly is **local-first**: every child's data lives **on the device** as the source of truth and works fully offline. A **deliberately thin server** does only what local storage genuinely cannot: **identity, billing, the no-redeploy control plane, and a zero-knowledge relay for the few records that must reach another person's device.** The architecture is a *fine balance*, drawn feature-by-feature, not a slogan.

Three planes:

**A) On-device store (the source of truth).** All child profiles, logs (feed/sleep/diaper/pump), calendar, health records, routines/chores/allowance, expenses, custody schedule, timeline, preferences. Offline-first, instant, private. Persisted locally (IndexedDB/SQLite on web/PWA; OS secure storage on native), debounced writes, flush on unmount.

**B) Encrypted shared-records relay (the balance point).** A minimal, **zero-knowledge** sync service that stores **only** the records a user explicitly shares — a shared child between two caregivers, a co-parent custody/expense ledger — as **end-to-end-encrypted blobs the server cannot read.** This is the deliberate concession to reality: the market punishes laggy multi-caregiver sync ("nobody knew the other just gave a bottle"), and **CloudKit can't bridge iOS↔Android**, which most co-parents need. The relay is **per-record, opt-in, encrypted, and minimal** — it is *not* a cloud copy of the user's life.

**C) Control & commerce plane (thin server).** Accounts/auth, Stripe billing mirror, and the operator admin panel (live config, feature flags, audit, RBAC). **Holds no child or health data — ever.**

### What lives where (the balance table)

| Data | Default home | Shared how | Server can read it? |
|---|---|---|---|
| Child profile, calendar, routines, timeline, prefs | **Device** | E2E relay only if child is shared | **No** (ciphertext only) |
| Newborn logs (feed/sleep/diaper/pump) | **Device** | E2E relay to co-caregivers of that child | **No** |
| **Health records (special category)** | **Device** | E2E relay only on explicit *per-record* opt-in | **No** |
| Co-parent custody + expense ledger | **Device** | E2E relay between the two parents | **No** |
| Account (email, hash, locale) | Thin server | — | Yes (account only) |
| Billing (plan, Stripe ids, status) | Thin server + Stripe | — | Yes (billing only) |
| Config, feature flags, audit log | Thin server | — | Yes (operator only) |
| AI Snap-to-Schedule payload | On-device OCR; optional cloud parse | flyer text/image only, PII-free, no retention | transient only |

## 4. The shared-records relay in detail

**Goal:** real-time-enough multi-device and multi-caregiver sync, cross-platform, without the server ever seeing plaintext.

- **Crypto model.** Each shared child (or co-parent ledger) has a **record key**. When owner invites a caregiver, the record key is wrapped to the invitee's public key (X25519) and delivered via the relay; thereafter both devices encrypt/decrypt locally (XChaCha20-Poly1305). The server stores **opaque ciphertext + minimal routing metadata** (record id, recipient device ids, version vector). Server compromise yields no readable family data.
- **Sync semantics.** Last-writer-wins per field with a version vector for conflict surfacing; offline edits queue and merge on reconnect. Presence ("Sam is online", "Dad logged a feed 2s ago") is a lightweight encrypted heartbeat, not stored.
- **Cross-platform.** Because the relay is a neutral encrypted blob store (not CloudKit), an **iPhone parent and an Android co-parent share seamlessly** — moat #3.
- **Scope discipline.** Only records the user actively shares enter the relay. A solo parent's data never touches it. A Family user who shares one child syncs one child.
- **Tier gating.** Single-device local use is **free**. The relay (multi-caregiver, co-parent) is the natural **Family-tier** capability; **Co-Parent Basics** (custody overlay + info-bank + read-only QR view) is free to ride the vacuum.
- **Backup/restore.** Local-first's one risk is device loss. Provide **encrypted backup** (user-held key) to the relay or the user's own iCloud/Drive, plus full local export; restore reconstructs the device store. Never silently cloud-store unencrypted.

## 5. Snap-to-Schedule pipeline (PII-free)

1. Camera/photo → **on-device OCR** (Apple Vision / Android ML Kit) extracts text + obvious dates offline. Works with no network and no server.
2. If the layout is messy and the user opts in, an **optional cloud LLM parse** receives **only the flyer text/image** (never child profiles), returns structured events, and **retains nothing for training**. Toggleable; off = fully local.
3. Parsed events are previewed as cards (title, date/time, child assignment, color), **deduped** against existing events, then committed on-device. Email-forward and paste-text fallbacks.

This keeps the regulated data on-device while delivering the "kill manual entry" feature that pulls families off Cozi.

---

## Part III — The product

## 6. Age-Adaptive Child Profiles — the engine

Every child has a profile with a **stage** derived from date of birth — and now, **before birth, an expecting stage** keyed to the due date (manually overridable). The stage drives which tools surface; everything else archives quietly into the timeline. The arc spans **conception → adult** — the moat no competitor has, and the antidote to both "apps die at age 2" *and* "pregnancy apps assume a live birth and abandon you at delivery."

**The engine now runs for two kinds of subject.** Alongside each child, the **birthing parent is a first-class profile** with her own stage derived from due date and birth date. The mother's tools surface and transition the same way the child's do, so the family app cares for the mother as a person — not only as the person logging the baby's data. Full detail: `Everly_Maternal_Feature_Spec.md`.

| Stage | Default age | Surfaced toolset |
|---|---|---|
| **Pregnancy** | pre-birth (40 wk) | Week-by-week companion, kick counter, contraction timer, symptoms/mood/weight, appointments + Prenatal PDF, safety scanner, bump journal, birth-prep, **compassionate outcomes**, calm layer (see §7.0) |
| **Newborn** | 0–12 mo | Feeds (breast side / bottle), sleep + wake-windows, diapers, pumping + stash, growth percentiles, "what's next" |
| **Baby/Toddler** | 1–3 yr | Naps, solids/meals, potty training, milestones, daycare notes |
| **Preschool** | 3–5 yr | Picture routines, activities, first appointments, milestones |
| **School** | 5–12 yr | Class timetable, homework, activities, term/holiday calendar, chores/allowance |
| **Teen** | 12–18 yr | Chores + real allowance, exams, driving/license, **child-led self-view**, appointments |
| **Young adult** | 18+ | Light shared calendar, archived lifelong timeline |

**Transition behavior.** Crossing a threshold triggers a gentle, dismissible suggestion ("Mia is turning 1 — switch on toddler routines?") with the **sprout motif visibly growing**; old data is never deleted, only re-surfaced. A parent with a newborn *and* a 9-year-old sees each child in their correct stage simultaneously. Multi-child = swipeable per-child cards on Today.

**The maternal arc (parallel subject).** The birthing parent has a **maternal stage** derived from due date and birth date, surfaced as a **"You" card** alongside the children on Today:

| Maternal stage | Window | Surfaced toolset |
|---|---|---|
| **Preconception** (optional) | pre-pregnancy | Private cycle/ovulation/fertility tracking, preconception checklist, TTC journal — the earliest top-of-funnel and the strongest post-Roe privacy story |
| **Pregnancy** | conception → birth | The §7.0 module (week-by-week, kick/contraction, symptoms/mood/weight, safety scanner, birth prep, bump journal, support circle, calm, compassionate outcomes) |
| **Postpartum / 4th trimester** | birth → ~12 wk | Recovery tracking, EPDS mood screening, pelvic-floor recovery, feeding-and-sleep-for-her, postpartum appointments, partner-watch (§7.0b) |
| **Maternal recovery** | ~3–12 mo | Continued mood check-ins, pelvic health, contraception/return-of-cycle, return-to-work, staged movement |
| **Ongoing maternal health** | 12 mo+ | Light maternal health hub, annual checks, archived maternal timeline; re-activates on a subsequent pregnancy |

At birth the pregnancy record **flows into a maternal timeline** (it does not end), exactly as the bump journal flows into the child's timeline — continuity for the mother mirroring continuity for the child.

## 7. Primary features — deep specification

### 7.0 🤰 Pregnancy module — *the earliest chapter* (full spec: `Everly_Pregnancy_Feature_Spec.md`)
Everly begins at the positive test, not at birth. The pregnancy stage attacks a crowded but **high-distrust** market (What to Expect, BabyCenter, Flo, Ovia, Pregnancy+ all sell or share sensitive data; none handle loss gracefully; all silo at delivery) with three pillars competitors can't copy: **private by architecture** (local-first — the data physically isn't on a server to sell or subpoena), **inclusive of every outcome**, and **continuous** (the bump becomes the baby in one timeline). Ten killer features, all special-category on-device:
1. **Week-by-Week Companion** — personalized 40-wk timeline, dual size comparisons, medically-reviewed, **zero ads / zero data sale**.
2. **Privacy Mode** — app-lock, discreet/stealth mode, no account needed, one-tap export/delete; the brand weapon answering post-Roe surveillance fear.
3. **Compassionate Outcomes** — the feature no one builds: marking a loss instantly and gently stops all baby notifications, switches to a supportive bereavement mode with resources, never auto-deletes or forces a restart. Free, never monetized — a duty of care.
4. **Smart Kick Counter + Contraction Timer** — baseline-aware movement counting + labor-ready timing with a 5-1-1 "time to call" indicator and partner/doula share; safety features never paywalled.
5. **Symptoms / Mood / Weight + Appointments + Prenatal PDF** — real perinatal-mental-health check-ins, high-risk add-ons, provider-ready report (bridges into the Health Hub).
6. **Safety Scanner** — barcode/search pregnancy-safety grading for food/meds/products, PII-free lookups.
7. **Partner & Support Circle** — deep, granular, revocable following for partner/doula/grandparent via the E2E relay (iOS↔Android).
8. **Birth Prep Suite** — hospital-bag checklist, exportable birth plan, baby names (**search *and* swipe**), readiness lists.
9. **Bump Journal → Lifelong Timeline** — weekly bump photos + time-lapse, milestones, optional heartbeat audio; **flows seamlessly into the child's timeline at birth** — the continuity moat.
10. **Calm Layer** — prenatal meditations, sleep stories, breathing — a non-toxic alternative to anxiety-inducing forums.

**Tiering:** privacy + all safety features + compassionate outcomes + basic tracking are **free**; Prenatal PDF, unlimited scanner, advanced health, exports, full Calm library are Pro; full Support Circle is Family. The pregnancy stage is Everly's **earliest top-of-funnel**, converting at the positive test and retaining unbroken into the free newborn tier.

**v1.1 — finish what the spec already promised.** Three prenatal features are specified above but were not yet built and must ship within this module: the **contraction timer** (the labour-day 5-1-1 timer; only the kick counter is currently implemented), the **Prenatal/Maternal Health PDF** (the named provider-report upsell, sibling to the Pediatrician PDF), and a real **appointment + test-results manager** (bloods, GTT, Group B Strep, growth scans). Add **high-risk add-ons** (GD glucose, BP/pre-eclampsia, multiples, bed-rest), a **symptom red-flag "when to call" triage** (safety, never diagnosis), **de-shamed weight** (healthy-gain band, never a single good/bad number — answering the category's most-cited emotional complaint), and **bump-photo time-lapse export**. Full detail: `Everly_Maternal_Feature_Spec.md` §3.

### 7.0b 🤱 Postpartum / Maternal Health module — *the fourth trimester no one shows up for* (full spec: `Everly_Maternal_Feature_Spec.md` §2)
Promoted from a §8 fast-follow to a **primary module**, because the fourth-trimester window is the single most under-served, highest-stakes gap in the category and the mother's direct continuation of the conception→newborn funnel. Where the newborn suite tracks the *baby*, this tracks the **mother** — with dignity, on-device, and free where safety demands it. Core features, all special-category on-device:
1. **Postpartum Recovery Tracker** — lochia/bleeding with red-flag thresholds, perineal/tear or **C-section incision** healing, afterpains, postpartum BP (pre-eclampsia can present after birth), "what's normal this week" cards.
2. **EPDS Mood Screening + gentle escalation** — validated Edinburgh Postnatal Depression Scale on a tapering cadence, soft trend ribbon (never a harsh score), positive screens routed to resources and provider-prep — **support, never diagnosis**; nothing ever reaches an employer/insurer (a direct jab at Ovia). Screening is **free** — a duty of care.
3. **Pelvic-Floor & Physical Recovery** — guided recovery, diastasis awareness, staged safe return-to-movement keyed to weeks-postpartum and birth type.
4. **Feeding & Sleep for the mother** — breastfeeding comfort/latch/pain, mastitis red-flags, pumping-for-her, *her* sleep debt — the only feeding log that treats the feeder as a person.
5. **Postpartum Appointments + Maternal Health PDF** — the 6-week-and-beyond maternal schedule (distinct from pediatric), prep-questions, provider-ready PDF.
6. **Partner-Watch** — a consented partner view focused on *her* wellbeing ("she could use a hand today"), not just baby logistics, via relay.
7. **Compassionate Postpartum Outcomes** — extends §7.0(3) to traumatic birth, NICU, feeding grief, and postpartum mental-health crisis; never forces a "happy" narrative; free, never monetized.

**Tiering:** recovery basics, mood/EPDS screening, red-flag triage, and compassionate outcomes are **free**; history/export, Maternal Health PDF, high-risk add-ons, full pelvic-floor & calm libraries are **Pro**; partner-watch and the full support circle around the mother are **Family**. **Data/where:** special-category — on-device, relay-shared only on explicit per-record consent, **never** on the thin server, in analytics, or in any AI feature.

Each spec below defines **what it is, exactly how it works, where the data lives, the tier, and the differentiator.** "Relay" = the §4 E2E shared-records relay.

### 7.1 🍼 Newborn Care Suite — *free forever* (the funnel)
**How it works.** A two-tap logging surface optimized for one hand at 3am. Quick-log buttons for **Feed / Sleep / Diaper / Pump**, each pre-filled from recent history ("duplicate last"), with one-tap undo.
- **Feeds:** breast (one-tap **left/right toggle**, tracks which side started **and** last side, running duration timer) or bottle (volume with **oz↔ml auto-convert**); optional notes (formula brand, reaction).
- **Sleep:** start/stop timer; **adaptive wake-window reminder** that learns the baby's emerging pattern and nudges "next nap in ~35 min."
- **Diapers:** wet/dirty/both, with color/consistency and leak flag; leaks auto-count as extra wets in trends.
- **Pumping + milk stash:** session volumes, stash with **freezer goals + expiry** warnings.
- **Auto-tallies & "what's next":** totals per day (sleep hours, feed count/volume) computed for the parent — and a predictive **"likely next feed/nap" window** from recent history. *This is the "coach not logger" layer the market rewards; pure tracking is commoditized.*
- **Growth:** weight/length/head entry plotted on **WHO percentiles** with trend lines.
- **Night mode:** deep-indigo, dimmed — iconic, screenshot-worthy.
- **Fast-log gradient:** lock-screen widgets, Apple Watch / Wear OS quick-log, iOS Live Activities / Dynamic Island.
**Data/where:** on-device; syncs to a partner/grandparent/nanny via **relay** when the child is shared (free single-device; multi-caregiver = Family). **Differentiator:** free, fast, private, *and* it grows past month 12 instead of dying at age 2.

### 7.2 📸 Snap-to-Schedule — the acquisition wedge
**How it works.** Per §5: photograph a school flyer/sports schedule/appointment card → on-device OCR (+ optional PII-free cloud parse) → preview cards (title, date/time, child, color, reminders) → dedupe → commit. Email-forward and paste-text fallbacks. Recurrence detected ("every Tuesday").
**Data/where:** events on-device; AI payload transient and PII-free. **Tier:** included in Pro (free tier gets manual + voice add). **Differentiator:** the single feature pulling families off Cozi; "2 hours → 2 minutes."

### 7.3 📅 Family Calendar + true two-way sync
**How it works.** Color-coded **per child and per caregiver**; month/week/agenda views; **dot-indicators** on days with events/logs; tap a day → events + logs. **Two-way** Google/Apple/Outlook sync runs **device-level through the OS calendar / providers' clouds** (not our server), so a working parent's work calendar and the family calendar finally coexist — fixing Cozi's #1 complaint. **Roles & locked events:** owner/co-parent/caregiver/child-view; critical events can be **locked** so no one (kid or co-parent) deletes a month by accident — a capability no calendar offers at scale. **Call-alert escalation:** for flagged critical events (school pickup), escalate a missed notification to an actual **phone call/alarm**. **No-account QR/link view** lets grandparents see the schedule without installing anything.
**Data/where:** on-device; shared calendars via relay; external sync via OS. **Differentiator:** two-way sync + roles + locked events + call alerts.

### 7.4 🩺 Health Hub + Pediatrician PDF
**How it works.** Per-child medical record: **vaccines/boosters** with due reminders, **medications** with **shared dosage reminders mirrored to a co-parent's device** (via relay) so a dose is never double-given or missed, **allergies/conditions**, doctor & insurance contacts, appointment history, growth charts. **One-tap Pediatrician PDF** generated **on-device** — the proven loyalty/upsell moment. Twins/multiples handled with clean per-child separation.
**Data/where:** **special category — on-device, never on our server**; relay-shared only on explicit **per-record** opt-in. **Tier:** Health Hub + PDF in Pro. **Differentiator:** lifelong health continuity + privacy guarantee no cloud app can make.

### 7.5 🏫 School & Holiday Auto-Sync
**How it works.** Subscribe to a school's **iCal** feed and/or a **regional school-holiday/term** calendar (fetching a public URL — no backend); term dates, INSET/closure days, holidays auto-populate per child. Region-aware via the i18n framework.
**Data/where:** on-device. **Tier:** Pro. **Differentiator:** ends "manually entering the school year"; region packs are a defensible i18n asset.

### 7.6 ⭐ Routines, Chores & Allowance
**How it works.** **Picture routines** for little kids (visual step cards); **points/stars → rewards or real allowance** for older kids with multi-currency; recurring schedules; per-child assignment; **completion approval** with roles (grandma marks done, parent approves); **partial credit for late tasks** (a specific, repeatedly-requested gap every competitor ignores). Non-surveillance framing — guidance, not spying.
**Data/where:** on-device; relay-synced for shared households. **Tier:** Pro. **Differentiator:** partial late credit + gentle, role-based, non-creepy design.

### 7.7 👨‍👩‍👧 Co-Parent Mode (low-conflict) — ride the vacuum
**How it works.** **Custody/handover schedule** overlaid on the calendar ("my time / their time" shading, 15 templates + custom, per-child); **shared expense splitting** with receipt photos, categories, running balances, and settle-up; **shared info-bank** (schools, doctors, allergies, sizes); a neutral timestamped **activity log**; and **AI tone-scan** that flags hostile phrasing before a note is sent (the feature TalkingParents gates behind $353/yr). **DV Safety Mode** (optional): covert app icon, GPS-stripping on shared photos, quick-exit. Two parents stay in sync via the **relay** — including **iOS↔Android**.
- **Co-Parent Basics = FREE** (custody overlay + info-bank + read-only QR view) to capture the AppClose/TalkingParents exodus.
- **Co-Parent Pro** (expenses + tone-scan + activity log) = Family tier or €3.99 add-on.
**Data/where:** on-device + relay between the two parents. **Non-goal:** court-admissibility (explicitly not claimed). **Differentiator:** unified with the whole family app, cross-platform, ~10× cheaper than OFW.

### 7.8 📔 Lifelong Child Timeline — the retention moat
**How it works.** Every milestone, photo, "first," appointment, and note rolls into one per-child vertical story from birth onward, with the **sprout-growth motif** marking stages. Add milestones inline; auto-capture key events (first solids, first day of school). **Printable keepsake book** via print-on-demand ($15–30 one-time) and full PDF/JSON export.
**Data/where:** on-device; relay only if the child is shared. **Tier:** core; export in Pro; photo book = one-time purchase. **Differentiator:** leaving Everly means abandoning your child's history — anti-churn by attachment.

### 7.9 📊 In-app data visualization (calm, encouraging, never clinical)
Every chart uses the child's **pastel token** as its series color, has a **night-mode variant** for newborn screens, and is built on **Recharts / Chart.js** with minimal axes and rounded Quicksand labels. The rule: charts should reassure, not test.
- **Newborn "rhythm ring" (signature visual).** A 24-hour radial clock with feeds/sleeps/diapers as colored arcs around the ring, so the day's rhythm is legible at a glance instead of as a list; tap a segment to expand the entries behind it.
- **Wake-window countdown bar.** A "time since last nap" bar that fills toward the predicted window and shifts mint → butter → blush as it approaches; pairs with the "what's next" prediction (§7.1).
- **Trend sparklines on stat cards.** Tiny inline sparklines beside each number (7-day sleep total, daily feeds) so trends live next to the metric, not on a separate screen.
- **Growth charts with a reassuring band.** WHO percentile lines over a faint shaded "typical range" band so percentiles read as context, not a score.
- **Stacked daily-totals bars** (week view), sleep split into night vs nap — the one place a conventional chart earns its keep, since parents genuinely compare days.
- **Calendar density dots.** Month view scales dot size / stacks per-child color dots so a busy week is visible before tapping in; custody blocks render as soft background bands, not borders.
- **Timeline growth-spine.** The lifelong timeline as a vertical spine where the sprout motif visibly grows past each stage marker — a progress visual doubling as the retention hook.
- **Co-parent balance gauge.** A two-sided horizontal bar showing the running expense balance ("Sam owes €22.50") with a one-tap settle-up.
- **Postpartum mood ribbon (opt-in).** A soft 14-day mood ribbon, gentle dots not a harsh line, with no judgmental coloring.
- **Interaction polish (applies to all):** count-up animation on numbers, skeleton-shimmer on load, haptic tick on logging, tap-a-segment-to-see-entries drill-down, and a one-tap day/week/month range toggle.

---

## 8. Secondary features (fast-follows)

- **🛒 Meal planning + shared grocery list** — lift SmartCart's list engine (stores, categories, favourites, voice-add); families conflate this with calendars (Cozi's most-retained feature).
- **🧘 Maternal/postpartum wellness** — *promoted to a primary module (§7.0b); see `Everly_Maternal_Feature_Spec.md`.* What remains here as fast-follow: lightweight hydration and gratitude/journaling nudges that feed the maternal mood ribbon.
- **📺 Kiosk / fridge-tablet mode** — an always-on PWA "family command center" view (calendar + chores + today) — Skylight's value without $300 hardware.
- **🗂️ Life-admin reminders** — region-specific recurring deadlines (vaccine due, passport, school registration windows) — tackles the "109 life-admin tasks/year" mental load.
- **🍼 Daycare-note capture** — snap the daily daycare sheet → "what happened today" summary into the child's log.
- **🎙️ Voice add** — native dictation: log an event or feed hands-free while holding a baby.
- **💬 WhatsApp share** — OS share sheet, fully local.
- **🌍 Multi-timezone** for far-away grandparents/co-parents; **🌦️ weather** on calendar days (API).
- **🔔 Weekly digest** — built and fired **on-device as a local notification** (no email server).
- **↩️ Undo toast, 🎉 milestone confetti, ⭐ favourites/quick-log** — delight primitives [from SmartCart].
- **🔌 Smart-nursery + EHR (future):** Hatch/Nanit/Owlet read; one-tap PDF → MyChart/Epic upload.
- **🌱 Child-led teen mode** — at 12+, the child gets their own (non-surveillance) self-view to prevent the Life360-style backlash.

## 9. Cross-cutting / global

- **i18n: 6 languages** (EN/DE/ES/FR/TR/IT) + region — *critical*, since school terms/holidays are region-specific.
- **Multi-currency** (EUR/GBP/USD/JPY/CAD/AUD) for allowance & expenses; JPY integer.
- **Night mode** (deep indigo) — auto + manual; iconic.
- **Offline-first** persistence; **reduced-motion**; **accessibility** (≥44px targets, high-contrast, screen-reader labels, grandparent "large/simple" view); **error boundary** + boot splash.

---

## Part IV — The control plane

## 10. Operator Admin Panel — *control the whole environment, never redeploy*

The panel is the runtime control plane. **Build its two foundations first** — the **live config store** and the **audit + RBAC spine** — then the dashboard, user, and billing tools sit on top. Because of §3, the panel operates on **accounts, billing, config, and audit only**; it has **zero access to child or health data** (none is on the server), which makes the user view inherently minimal and the GDPR-erasure job tiny.

**Design rule:** anything you might want to change without shipping a build is a **config value or feature flag**, not a constant. The goal is that pricing experiments, rollouts, content edits, and kill-switches are all panel actions.

### 10.1 Live config store & feature flags (no redeployment)
Server collections the app reads at bootstrap and caches; changes take effect on next load.
- **Config:** trial length; all plan prices (Pro/Family monthly+yearly, lifetime); enabled languages & currencies; enabled regions/school-holiday packs; upsell copy; What's-new & Help content; default feature toggles.
- **Feature flags:** per-feature `enabled` + **rollout targeting** (% of users, by plan, by region, by app version) + **kill switch** (e.g. disable the cloud-parse LLM, the relay, or smart-nursery integrations instantly if a provider breaks).
```
Config      { key, value, updatedBy, updatedAt }
FeatureFlag { key, enabled, rollout:{percent,plans[],regions[],minVersion}, killSwitch, updatedBy, updatedAt }
GET /api/config            # public cached bootstrap
PUT /api/admin/config/:key            → audit
PUT /api/admin/flags/:key             → audit
```
App must tolerate a stale cache and fall back to safe defaults if config is unreachable.

### 10.2 Revenue & growth dashboard
Five-second "are we healthy?" — from the billing mirror + Stripe events, filterable by date/plan/region/currency:
MRR/ARR; **new vs expansion vs churned MRR**; churn %; **trial→paid %**; active subs by plan/tier; **dunning** (past-due) count; trials expiring in 3/7 days; DAU/MAU; lifetime-vs-subscription mix. Definitions are explicit (MRR = active subs normalized monthly; churn = lost ÷ start-of-period).

### 10.3 User search & lifecycle (no impersonation)
Find any user by email/id; 360° view shows **account + billing + entitlements only** (no child data exists server-side to show). Actions, each RBAC-gated and audited: extend/reset trial, change/comp plan, grant **lifetime**, toggle individual **feature entitlements**, suspend/unsuspend, force password reset / resend verification, and **GDPR erasure** = delete account + billing + cancel Stripe (child data is on the user's device, erased by them locally). No "view as user."

### 10.4 Subscription & billing control (Stripe-reconciled)
Stripe is the system of record and invoice generator; the panel mirrors and acts. Shows per-user subscription state, the **dunning queue**, and one-click **refund / comp / cancel / reactivate** that call Stripe and reconcile locally. **Webhook listener** keeps state in sync:
```
invoice.paid · invoice.payment_failed · customer.subscription.updated
customer.subscription.deleted · checkout.session.completed
POST /api/webhooks/stripe   # signature-verified
```
Stripe Tax enabled for EU VAT; Customer Portal for self-service.

### 10.5 Content & remote ops (no-redeploy reach)
Beyond pricing: edit **What's-new / Help / onboarding copy**, push a **soft announcement banner**, toggle **maintenance mode**, manage **school-holiday/region packs** and **wellbeing-nudge content** — all as config, so marketing/ops move without engineering.

### 10.6 Admin auth, RBAC & immutable audit log
Separate admin accounts (not promoted users) with **2FA**. Roles: **superadmin** (all + manage admins/config), **admin** (users, billing, dashboard, content), **support** (extend trials, resend verification, read dashboards — **no** refunds/comps/config/erase). **Append-only audit log** (actor, action, subject, before/after, ip, at) — no update/delete endpoint exists; it is both an ops tool and the GDPR accountability record.
```
AuditLog { id, actorAdminId, actorRole, action, subjectUserId, before, after, at, ip }  # append-only
```

| Action | superadmin | admin | support |
|---|---|---|---|
| View dashboards / search users | ✓ | ✓ | ✓ |
| Extend/reset trial · resend verification | ✓ | ✓ | ✓ |
| Change/comp plan · grant lifetime · entitlements | ✓ | ✓ | — |
| Refund/cancel/reactivate · suspend · GDPR erase | ✓ | ✓ | — |
| Edit config / feature flags / content | ✓ | — | — |
| Manage admin accounts | ✓ | — | — |

### 10.7 Dashboard & data-visualization spec
The dashboard must read as a **five-second health check**, not a metrics dump. Library: **Recharts or Tremor** (Tremor is purpose-built for SaaS dashboards) on the Everly tokens; light/dark admin toggle.

- **KPI hero strip.** Top row of five cards — MRR, Active Subs, Trial→Paid %, Churn %, Dunning count — each with a **30-day sparkline** and a green/red **delta vs previous period**. Turns each number into a trend at a glance.
- **MRR waterfall** (the signature SaaS visual). One bar series breaking the month into **starting → +new → +expansion → −churned → ending**, answering "why did revenue move?" instantly — superior to a flat MRR line.
- **Trial → paid funnel.** Horizontal funnel (signups → activated → trial → converted) with drop-off % per step, filterable by acquisition window — shows exactly where users are lost.
- **Cohort retention heatmap.** Rows = signup month, columns = months-since, cells shaded by % still subscribed — the investor-grade view of whether retention is improving.
- **Plan-mix donut + Lifetime tracker.** Donut of Free/Pro/Family/Lifetime plus a running Lifetime-purchase tally (one-time revenue watched against the subscription-fatigue thesis).
- **Live ops feed + alert chips.** Right-rail activity stream (new subs, cancellations, failed payments, refunds) and **red alert chips** that surface only when action is needed ("12 cards failing", "flag X at 100% rollout") — the dashboard pulls attention rather than waiting to be read.
- **Feature-flag rollout board.** Visual board of active flags with rollout-% sliders and per-flag adoption sparklines — makes the no-redeploy control plane *visible*, not just toggleable.
- **Geographic & currency split.** Subs by region/currency (bar or map) — supports the i18n/region-pack strategy and EU-VAT (Stripe Tax) reconciliation.
- **Dashboard UX.** One global **date-range + segment filter** drives every chart at once; saved filter presets; per-chart CSV export; metric definitions on hover.

**Metric → visual mapping (build reference):** MRR & movement → waterfall; trend per KPI → sparkline + delta; conversion → funnel; retention → cohort heatmap; composition → donut; operational exceptions → alert chips + live feed; rollout adoption → flag board.

---

## Part V — Data, screens, build

## 11. Data model

**On-device stores (source of truth):**
```
Child        { id, name, avatarToken, dob, stage, colorToken, sharedRecordId?, createdAt }
Event        { id, childIds[], title, start, end, allDay, recurrence, category,
               location, notes, reminders[], source/*manual|snap|ical|voice*/, lockedBy, color }
LogEntry     { id, childId, type/*feed|sleep|diaper|pump|meal|potty|med*/, start, end,
               detail:{ side, amount, unit, wet, dirty, leak, ... }, createdAt, createdBy }
HealthRecord { id, childId, kind/*vaccine|med|allergy|condition|visit|growth*/, data, special:true, createdAt }
Routine      { id, childId, title, steps[], schedule, points, rewardId }
Chore        { id, childId, title, schedule, points, status, lateCredit, approvedBy }
RewardLedger { id, childId, pointsBalance, allowanceBalance, currency }
ExpenseSplit { id, payerId, amount, currency, category, receiptUrl, splitWith[], settled }
CustodyBlock { id, childId, start, end, parentId, template }
TimelineItem { id, childId, kind/*milestone|photo|first|note|appointment*/, title, media, date }
Prefs        { locale, currency, theme, startView, units, notifications, handedness }
```

**Maternal arc (on-device, special-category — v1.1):**
```
Parent        { id, name, avatarToken, role/*birthing|partner|caregiver*/, maternalStage?, dueDate?, birthDate?, colorToken, sharedRecordId?, createdAt }
MaternalLog   { id, parentId, type/*mood|symptom|weight|bp|glucose|lochia|incision|sleep|feedingForHer|kick|contraction|hydration|pelvicFloor*/, value, detail:{...}, special:true, createdAt }
MaternalHealthRecord { id, parentId, kind/*appointment|testResult|screening|condition|med|visit*/, data, special:true, createdAt }
PPScreening   { id, parentId, instrument/*EPDS*/, items[], score, flagged, takenAt, special:true }
MaternalTimelineItem { id, parentId, kind/*milestone|bumpPhoto|birthStory|recovery|note*/, title, media, date }
```
**Relay (E2E ciphertext only):** `{ recordId, ownerId, recipients[], versionVector, encryptedPayload }`
**Thin server:** `User { id, email, passwordHash, name, locale, plan, trialEndsAt, subStatus, entitlements[], stripeCustomerId, stripeSubId }` + `Config` + `FeatureFlag` + `AuditLog`. **No child data, ever.**

## 12. Screens

Today/Dashboard (per-child stage cards incl. expecting/pregnancy **+ a "You" card for the parent's maternal stage** + "what's next" + quick-log FAB) · **Pregnancy stage screens** (week-by-week companion, kick counter, **contraction timer**, symptoms/mood/weight, **prenatal/maternal PDF**, **appointment + test-results manager**, **high-risk add-ons**, **red-flag "when to call" triage**, safety scanner, partner/support circle, birth-prep, bump journal **+ time-lapse export**, compassionate-outcomes supportive mode, calm layer, **"you today" dashboard strip** — see `Everly_Maternal_Feature_Spec.md`) · **Postpartum/maternal screens** (postpartum dashboard, recovery tracker, EPDS mood check-in, pelvic-floor recovery, feeding-and-sleep-for-her, postpartum appointments, partner-watch, maternal timeline) · **Preconception/TTC screens** (optional: cycle/fertility, preconception checklist) · Calendar (color-coded, custody shading, dot-indicators, locked events) · Child profile (stage-adaptive hub) · Newborn log (two-tap, night mode, tallies, wake-window, **rhythm ring**) · Health Hub (records + Pediatrician PDF) · Routines & Chores (picture routines + allowance + approvals) · Co-Parent (custody + expenses + info-bank + tone-scan) · Timeline (story + export/print) · Kiosk mode (fridge display) · Settings (account, plan/billing, family/relay sharing, preferences, notifications, **data export/reset**, about). Operator dashboard screens (§10.7): KPI hero strip, MRR waterfall, trial→paid funnel, cohort heatmap, flag-rollout board. **Bottom nav:** Today · Calendar · ⊕ FAB · Children · Settings.

## 13. Monetization

| Tier | Price | Includes | Target |
|---|---|---|---|
| **Free Forever** | €0 | Newborn tracking (1 child), basic calendar, **Co-Parent Basics**, timeline, voice add, no account required to start | New parents at peak motivation |
| **Everly Pro** | **€3.99/mo · €39.99/yr** | Unlimited children, Snap-to-Schedule, Health Hub + Pediatrician PDF, school sync, routines/chores, timeline export | Growing families |
| **Everly Family** | **€4.99/mo · €49.99/yr** | Everything in Pro + **multi-caregiver relay sharing**, **Co-Parent Pro** (expenses + tone-scan), kiosk mode | Multi-parent / co-parent households |
| **Lifetime** | **€149.99 one-time** | Everything in Family, forever | Subscription-averse (39% of market) |

**Emotionally-triggered upsells** (convert 3–5× better than feature gates): Pediatrician PDF (health anxiety), printable Timeline book (attachment), co-parent expense balance (utility), tone-scan flag (safety), **Maternal Health PDF (maternal health anxiety), postpartum recovery & EPDS history (reassurance), partner-watch (relief)**. Preconception and all maternal *safety* features (contraction timer, red-flag triage, EPDS screening, compassionate outcomes) stay **free** — top-of-funnel and duty of care. **Billing:** Stripe on **web/PWA** (keeps your existing Stripe account, avoids 15–30% store cut); if native, hybrid IAP. **Free tier works without account creation** to maximize top-of-funnel.

## 14. GDPR & privacy — *the weapon*

Because **no child, maternal, or health data is ever on our server** (only E2E ciphertext in the relay, plus account/billing), controllership shrinks to almost nothing — and "your family's data never leaves your device" becomes the headline brand promise in a market where 46% fear data misuse.
- **Special-category health data (incl. maternal, postpartum-mental-health, and fertility data):** on-device; relay only as E2E ciphertext on explicit per-record consent; never in analytics/AI. Maternal mental-health screens (EPDS) and fertility/preconception data are never exposed to employers or insurers — the structural answer to the Ovia/Glow distrust and to post-Roe surveillance fear.
- **Erasure:** delete account + billing + cancel Stripe; local data is the user's to wipe (self-service reset). No central cascade.
- **Portability:** full on-device export (PDF/CSV/iCal/JSON) — a *right*, not a paywalled premium (a competitive jab at Cozi/Huckleberry).
- **Processors/DPAs:** Stripe, host, relay (zero-knowledge), optional cloud-parse LLM (PII-free, no retention). EU-region thin server; SCC/DPF where needed; 72h breach runbook (scoped to account/billing).
- *Not legal advice — confirm policy/ToS/DPAs with an Austrian privacy lawyer.*

## 15. Design system (distinct, pastel, faceless)

Cool **lilac-white `#F4F3FB`** canvas; white **22px** cards; **Quicksand** (display) + **Nunito** (body); **primary periwinkle `#6B6FC9`**, **rose `#E98FB3`** accent, **gold `#E9C46A`** sparkles; **per-child cool pastel tokens** (lilac/sky/mint/blush/peach/butter/sage, each with a darker stroke); **faceless rounded silhouettes** for all people (circle head, no features, sized by stage) as the signature; **flat line icons**; **deep-indigo night mode `#262539`**; the **sprout-growth motif** across stages. Distinct from SmartCart by design. *(Companion artifacts: `Everly_Onboarding.html`, `Everly_Concept_Board.html`.)*

## 16. Tech stack & Emergent build prompt

**Stack.** Local-first client: React + Tailwind **web/PWA** (React Native shell later), on-device store (IndexedDB/SQLite; OS secure storage native), offline-first. **Relay:** small service storing E2E-encrypted blobs + routing (X25519 key-wrap, XChaCha20-Poly1305), zero-knowledge. **Thin server:** FastAPI + Python + small EU DB — accounts, Stripe mirror, config/flags/audit. **Stripe** (Checkout/Billing/Tax/Portal). **On-device OCR** + optional PII-free cloud LLM for Snap-to-Schedule.

**Master build prompt (paste into Emergent):**
> Build "Everly," a **local-first**, birth-to-adult family scheduling & tracking app. ALL child/family data (profiles, feed/sleep/diaper/pump logs, calendar, health records, routines/chores/allowance, expenses, custody, timeline, prefs) lives **on the device** and works fully offline; it is NEVER stored in readable form on a server. Provide a **zero-knowledge E2E-encrypted relay** that syncs ONLY records a user explicitly shares (a shared child between caregivers; a co-parent ledger) as ciphertext the server cannot read, with cross-platform iOS↔Android support, presence, and offline merge. A **thin server** stores ONLY account/auth, a Stripe billing mirror, and an operator admin panel (live config + feature flags + audit + RBAC) — no child data. Core: **age-adaptive per-child profiles** whose toolset changes by stage (newborn→toddler→preschool→school→teen→young-adult) **plus a parallel age-adaptive maternal profile** for the birthing parent (preconception→pregnancy→postpartum→maternal-recovery→ongoing maternal health), surfaced as a "You" card beside the children + a lifelong per-child timeline **and a maternal timeline the pregnancy record flows into at birth**. Primary features, each in detail: free-forever **newborn suite** (two-tap feed [breast side + last side]/sleep [adaptive wake-windows]/diaper/pump+stash, auto-tallies, WHO growth, "what's next" predictions, night mode, lock-screen/Watch/Live-Activity quick-log); a **pregnancy module** (week-by-week, kick counter, contraction timer with 5-1-1, symptoms/mood/weight, prenatal/maternal PDF, appointment+results manager, high-risk add-ons, red-flag triage, safety scanner, bump journal+time-lapse, birth prep, compassionate outcomes, calm layer); a **postpartum/maternal module** (recovery tracking, EPDS mood screening with gentle escalation, pelvic-floor recovery, feeding-and-sleep-for-the-mother, postpartum appointments + maternal PDF, partner-watch, compassionate postpartum outcomes) — all maternal data special-category on-device; **Snap-to-Schedule** (on-device OCR + optional PII-free cloud LLM parse → deduped events); **family calendar** (per-child/per-caregiver color, two-way Google/Apple/Outlook via OS, dot-indicators, roles + locked events, call-alert escalation, no-account QR view); **Health Hub** + one-tap on-device **Pediatrician PDF** (special-category, on-device only); **school/holiday iCal auto-sync**; **routines/chores/allowance** (picture routines, points→real allowance, approvals, partial late credit); **Co-Parent mode** low-conflict (custody shading + expense splitting + info-bank + AI tone-scan + optional DV safety mode) via relay, with **Co-Parent Basics free**; **lifelong timeline** with printable book export. Secondary: meal/grocery list, postpartum wellness, kiosk/fridge mode, life-admin reminders, daycare-note capture, voice add, WhatsApp share, multi-timezone, weather, weekly local-notification digest, child-led teen mode, undo/confetti/favourites. Global: 6 languages, 6 currencies, night mode, offline-first, reduced-motion, accessibility incl. grandparent simple-view, error boundary. Monetization: Free / Pro €3.99mo·€39.99yr / Family €4.99mo·€49.99yr / Lifetime €149.99, via **Stripe on web/PWA**; free tier needs no account. **Operator admin panel (no redeployment):** live config store + feature flags with rollout targeting + kill switches + editable content; revenue dashboard (MRR/expansion/churn/conversion/dunning); user search & lifecycle (no impersonation; entitlements; GDPR erase = account+billing+Stripe only); Stripe-reconciled subscription control + webhooks; admin auth + 2FA + superadmin/admin/support RBAC + immutable append-only audit log. Design: cool lilac-white #F4F3FB, white 22px cards, Quicksand + Nunito, periwinkle #6B6FC9, rose #E98FB3, gold #E9C46A sparkles, per-child pastel tokens, **faceless rounded silhouettes** for all people, flat line icons, deep-indigo night mode #262539, sprout-growth motif.

## 17. Build order & GTM timing

1. **Foundations:** on-device store + design system + night mode; thin server (auth + **config/flags** + **audit/RBAC**); Stripe skeleton.
2. **Age-adaptive engine** + **Today/Calendar** (OS two-way + iCal, dot-indicators, roles/locked events).
3. **Pregnancy module** (week-by-week, privacy mode, compassionate outcomes, kick counter, **contraction timer**, symptoms/mood/weight, **prenatal/maternal PDF**, **appointment+results manager**, **high-risk add-ons**, **red-flag triage**, bump journal) + **free newborn suite** (two-tap, tallies, wake-windows, growth, "what's next") — the unified conception→newborn funnel, the earliest acquisition point. *(Optional pre-step: preconception/TTC stage — the earliest funnel of all.)*
3b. **Postpartum / Maternal stage** (recovery tracker, EPDS screening + gentle escalation, pelvic-floor recovery, feeding-and-sleep-for-her, postpartum appointments + maternal PDF, partner-watch, compassionate postpartum outcomes, maternal timeline, "You" card on Today) — the mother's direct continuation of the same funnel; ship right behind step 3.
4. **Snap-to-Schedule** + **school/holiday packs** — acquisition; heavy marketing **back-to-school 2026**.
5. **E2E relay** → multi-caregiver newborn sharing + **Co-Parent Basics (free)** — ship to ride the **AppClose/TalkingParents vacuum immediately**.
6. **Health Hub + Pediatrician PDF**, **Routines/Chores/Allowance**.
7. **Co-Parent Pro** (expenses + tone-scan + DV mode), **Lifelong Timeline** + printable book.
8. **Admin panel** completion (dashboard/billing/lifecycle) + GDPR tooling.
9. **Secondary** (meal/grocery, wellness, kiosk, life-admin, daycare capture, digest, child-led teen mode).

**GTM windows:** co-parent free tier → **immediate**; Snap-to-Schedule → **Q3/back-to-school 2026**; school auto-sync → **September**; "family organization" (calendar + meal + gift lists) → **Q4 holidays**.

---

*End of PRD. The balance is the point: everything personal — the child's record and the mother's — stays on the device; only what must reach another person travels — encrypted, minimal, per-record — through a relay we cannot read; the app grows with both the child and the mother rather than abandoning either; and the entire commercial environment is steered live from the admin panel without a single redeploy.*


---

# Part VI — Design & Build Reconciliation (authoritative for SCREENS)

> Added June 2026. This part reconciles the PRD with the **actual design files** and records every consolidation made during build. **Rule of precedence:** where this part and Parts I–V differ on a *number/policy*, Parts I–V win; where they differ on a *screen's existence or composition*, this part + the design files win. Full per-screen build notes live in the companion `Everly_Build_Spec_v1.1.md`.

## 18. Brand mark (logo)
The Everly logo is the **tree-of-life**: a sage-green tree whose two trunk lines splay into a leafy canopy, with a **central human figure (head + raised arms forming a heart)** at the heart of the tree and a splayed root base — symbolising family rooted, growing, and held. Assets in repo:
- `logo-tree.png` — sage on transparent, for light surfaces (794×900, content-cropped).
- `logo-tree-white.png` — white on transparent, for dark chips (PDF header, weekly-digest lock-screen, green tiles).
Used at every brand touchpoint (onboarding hero, app chrome, admin sidebar, provider PDF header). Dev note: ship as SVG re-trace for crisp scaling at all DPRs; the PNGs are the design reference. Sage token target ≈ `#76a878`/`#8AA87C`.

## 19. Design source files (single source of truth for UI)
| File | Surface | Screens |
|---|---|---|
| `Everly Landing.dc.html` | Marketing web | 5 landing directions |
| `Everly Onboarding.dc.html` | First-run | **9 slides:** Hero · **Pregnancy & You** · Age-Adaptive · Snap-to-Schedule · Night Log · Health Hub · Co-Parent · Timeline · CTA |
| `Everly UI.dc.html` | Core app + tablet kiosk | Today · Night Log (dark) · **Calendar (weather-integrated)** · Health Hub · Child Profile · Rhythm Ring · Routines/Chores · Co-Parent · Lifelong Timeline · Paywall · Settings · Child Profile (school) · Night Log (light) · fast-follow S1–S6 (Grocery, Digest, Multi-Timezone, Wellbeing, Voice, WhatsApp) · Kiosk/Fridge + lock-screen widgets |
| `Everly Pregnancy.dc.html` | Pregnancy stage | P01–P17 (dashboard, week-by-week, **kick counter**, symptoms/mood/weight, safety scanner, birth prep, baby names, bump journal, support circle, calm, compassionate outcomes, **contraction timer 5-1-1**, appointments+test results, prenatal/maternal PDF, red-flag triage, high-risk add-ons, de-shamed weight + bump time-lapse) |
| `Everly Maternal.dc.html` | Maternal arc (v1.1) | M01–M11 (You-card Today, preconception/TTC, postpartum dashboard, recovery tracker, EPDS screening, pelvic-floor recovery, feeding & sleep for her, postpartum appointments + maternal PDF, partner-watch, compassionate postpartum, maternal timeline) |
| `Everly Admin.dc.html` | Operator console (desktop) | Revenue dashboard · Config & feature flags · Users · Billing · Audit/RBAC |

## 20. Consolidation log (intentional — do NOT reintroduce duplicates)
1. **Logo** unified to the tree-of-life mark everywhere (see §18).
2. **Contraction timer** owned solely by Pregnancy **P12**; **P03 is Kick Counter only** (dormant "Contractions" tab removed).
3. **Onboarding** owned solely by `Everly Onboarding.dc.html`; the duplicate onboarding screen was removed from `Everly UI.dc.html`.
4. **Weather folded into the Calendar** (PRD §8 "weather on calendar days"): per-day weather glyphs + weather-alert banner + today chip on the Calendar screen. The standalone Weather fast-follow screen was **removed**.
5. **Dead code removed**: a hidden `display:none` duplicate of the entire S1–S7 fast-follow set was deleted from the UI file (~445 lines).
6. **Onboarding pregnancy entry**: added **Slide 02 "Pregnancy & You"** and changed the hero line from "first feed" → "first scan" so the funnel opens at the positive test, per v1.1.
7. **Admin feature flags** extended for v1.1: `maternal_postpartum_module` (gradual rollout, kill-switchable), `preconception_ttc` (beta), `epds_mood_screening` (**kill-switch locked** — free duty-of-care safety feature).

**Intentional parallels (keep both — NOT duplicates):** child Today vs maternal "You" card · child Lifelong Timeline vs Maternal Timeline · pregnancy vs postpartum Compassionate Outcomes (§7.0b extends §7.0(3)) · pregnancy mood check-in vs postpartum EPDS · pregnancy Support Circle vs postpartum Partner-Watch · Night Log dark vs light theme.

## 21. Privacy posture confirmed in the build
The Operator Admin console surfaces **no child/maternal/health data** — only accounts, billing, entitlements, config/flags, and audit (per §3, §10). Maternal features appear in admin **only** as feature flags and billing entitlements. GDPR erasure = account + billing only; on-device data is the user's to wipe. This is verified across all five admin screens.

## 22. Developer handoff checklist
- [ ] Re-trace `logo-tree.png` to SVG (sage + white variants) for crisp multi-DPR rendering.
- [ ] Implement the dual age-adaptive stage engine (child + maternal) per §6; stage derived but overridable.
- [ ] On-device store first (IndexedDB/SQLite); offline-first; debounced writes.
- [ ] E2E relay (X25519 + XChaCha20-Poly1305), per-record opt-in, iOS↔Android, version-vector conflict surfacing.
- [ ] Thin server: auth + Stripe mirror + config/flags + append-only audit + RBAC — never child/health data.
- [ ] Special-category data (child health + ALL maternal/postpartum/fertility) never in analytics/AI/thin-server.
- [ ] Calendar: OS two-way sync + weather-on-days + density dots + locked events + call-alert escalation.
- [ ] Tier gating per §13; safety features (contraction timer, red-flag triage, EPDS, compassionate outcomes, preconception) **always free**.
- [ ] Build order per §17 with maternal module shipped right behind the pregnancy module (step 3 → 3b).
- [ ] i18n EN/DE/ES/FR/TR/IT + region packs; multi-currency; night mode; accessibility ≥44px targets.

*End of Part VI. Companion build reference: `Everly_Build_Spec_v1.1.md` (per-screen tables, data sources, tiers, architecture contracts).*
