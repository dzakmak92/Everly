# Everly — Feature Gap Analysis

A deep, screen-by-screen audit of all ~80 design surfaces vs. what is actually
functional. The `src/screens/` recreations are **static** (no `onPress`, no
`useState`, no inputs, no data — every value is a hardcoded literal). This report
catalogues, per screen, what each design promises and what is missing to ship it
as a real feature.

Modules audited: **Pregnancy** (P01–P17), **Maternal** (M01–M13), **App**
(A02–A15), **Onboarding** (O01–O09), **Landing** (L1–L5), **Fast-follow**
(S1–S7), **Admin** (D1–D5).

---

## Executive summary

What's functional today (≈10% of the designed surface):
- Auth + session gating, simple onboarding (create one child), 5-tab app shell.
- App tabs wired to one on-device store with 4 entry kinds (sleep/feed/diaper/note).
- Plans screen + Stripe checkout function, read-only admin console, two pregnancy
  tools (kick counter, contraction timer).

The designs describe a **far larger product**. The gaps cluster into a handful of
foundational systems that, once built, unblock dozens of screens.

## Cross-cutting themes (the foundations almost everything needs)

1. **Date / age / stage engine** — gestational week, postpartum week/day, child
   age, and the **6-stage life taxonomy** (Newborn→Baby→Preschool→School→Teen→
   Young Adult). Hardcoded on every screen ("Week 24", "Day 42", "4 months").
   Single biggest dependency; the `Child` model has no `stage` field.
2. **Per-module on-device data stores** — only the app module has a store.
   Pregnancy, maternal, and fast-follow have **zero** data layer.
3. **Richer entry model** — feed side/volume/duration, sleep as start→end
   intervals (not instants), diaper sub-type, a `pump` kind. Blocks A02/A03/A06/
   A07/A14 and the rhythm ring.
4. **Events / appointments model** — scheduled future items with reminders and
   countdowns. Needed by app (Today/Calendar/Kiosk), pregnancy (P13), maternal (M08).
5. **Notifications / reminder engine** (`expo-notifications`) — wake-window,
   vaccine, medication, appointments, weekly digest, wellbeing nudges. Absent.
6. **Premium entitlement gating** — `SproutLockBadge`/`LockGlyph` is decorative
   everywhere. Plans/Stripe exist but nothing enforces tiers, and the paywall
   currently advertises unbuilt features.
7. **Safeguarding / clinical engines (highest risk)** — EPDS scoring with banding
   and **Q10 self-harm special handling**; BP/lochia/mastitis red-flag thresholds;
   5-1-1 contraction detection. Must be correct, not cosmetic.
8. **Sharing / multi-user backend** — co-parent, partner-watch, support circle,
   mutual name likes. Contradicts the on-device privacy promise; needs invites +
   identity + an E2E relay. NB: a `relay_records` (ciphertext) table already
   exists in the Supabase schema and is the intended substrate.
9. **Device-capability integrations** — camera/barcode (safety scanner, snap-to-
   schedule), image picker (bump/timeline photos), audio playback (calm layer),
   PDF generation + OS share sheet, video export, `tel:` dialing, ASR + NLU
   (voice add).
10. **Content datasets** — 40-week pregnancy content, baby-names DB, food/med
    safety knowledge base, calm-audio catalog, parenting-tip library, crisis/
    support resources, vaccine schedules, WHO/CDC growth-percentile curves.
11. **Navigation gaps** — the "Family" tab is missing (no entry point to child
    profiles); FABs, bottom navs, and most deep-links are inert; no kiosk/
    landscape route; onboarding has no real carousel.
12. **Theming** — a dark/night theme + the Settings "Night mode" toggle (A03 dark
    vs A14 light) is unwired.
13. **Admin write-ops + RBAC + audit** — console is read-only; needs typed config
    editing, flag rollout/targeting (schema is boolean-only today), user/billing
    management, named roles + 2FA, and an immutable audit log (an `audit_log`
    table already exists in the schema) that every write must emit to.
14. **Lifecycle state machines** — pregnancy active/paused/archived, birth handoff
    (bump journal → child's first chapter), subsequent pregnancies, and per-subject
    free-vs-premium concurrency.

## Suggested build order (foundational → leaf)

1. **Foundations:** date/age/stage engine · expand the entry model + per-module
   stores · events/appointments model · notifications engine · entitlement gating.
2. **Domain engines:** health records (vaccine/med/growth) · routines/chores/points
   · co-parent/custody/expenses · milestones + media · pregnancy trackers · maternal
   recovery + EPDS safeguarding.
3. **Integrations:** camera/OCR · image picker · audio player · PDF + share · voice/ASR.
4. **Sharing backend:** co-parent/partner/circle over the existing relay.
5. **Admin:** write-ops + RBAC roles + audit log + Stripe billing ops.
6. **Growth surfaces:** full onboarding flow · marketing site (pick L3) · kiosk mode.

---

# Module: App (A02–A15)

_Gaps vs. the live functional tabs as well as the not-yet-built screens._

## Current functional foundation
5-tab Expo Router shell (Today/Calendar/Health/Timeline/Settings) + hidden routes
(plans, kick-counter, contractions, admin). One on-device store:
`Child = {id,name,color,birthDate?}`, `Entry = {id,kind,at,note?,childId?}` with
kind ∈ {sleep,feed,diaper,note}. No duration/side/volume/amount/sub-type,
no future events, milestones, health records, routines, points, custody, or
co-parent data — that single limitation drives most gaps.

- **A02 Today** — design is a forward "What's next" agenda (upcoming events +
  health reminders + "time since last feed/side" + per-child age pills + FAB). Mine
  is a generic quick-log + today-list. Missing: events/reminders concept, "time
  since last X", per-child age, feed side, vaccine rows, center FAB.
- **A03 Night Log (dark)** *(not built)* — dark one-handed logger: wake-window
  banner, 2×2 Feed/Sleep/Diaper/Pump, tally bar (feeds/sleep h/wet/ml). Needs
  pump kind + ml, diaper sub-type, sleep intervals, wake-window calculator, daily
  aggregates, dark theme.
- **A04 Calendar** — design has events model, Month/Week/Agenda views, custody
  bands, weather glyphs + alerts, per-child colored dots. Mine plots only logged
  entries (single rose dot) with a selected-day list; no events, views, custody,
  or weather.
- **A05 Health Hub** — design = vaccines (schedule/countdown/provider),
  medications (dose/reminder/taken), growth (percentiles + chart), pediatrician
  PDF. Mine is an analytics summary of the 4 generic kinds. Entire health-records
  domain missing.
- **A06 Child Profile** *(not built)* — avatar, age + life-stage spine, stat
  rollups, rich recent logs. Needs a Family tab/child-detail route (no entry point
  exists — my bar dropped "Family"), age/stage derivation, stat aggregation.
- **A07 Rhythm Ring** *(not built)* — 24h radial clock of feeds/sleeps/diapers;
  needs sleep intervals (arcs), polar mapping, rolling averages.
- **A08 Routines & Chores** *(not built)* — picture routines (timed ordered
  steps), chore board with points/late penalties, rewards ledger (pts→€, redeem).
  Whole engine absent.
- **A09 Co-Parent** *(not built)* — custody week strip, shared-expense ledger with
  split rules + running balance + settle-up. Needs caregiver entity, custody-day
  assignment (also feeds A04 bands), expense model, balance math.
- **A10 Lifelong Timeline** — design = curated milestones with photos + keepsake
  book export. Mine is a raw reverse-chron log feed. Missing milestone type,
  media, age-at-event, keepsake export, "add a memory" composer.
- **A11 Plans / Paywall** — functional counterpart exists; verify gating actually
  enforces advertised Pro/Family splits (most of which aren't built — paywall
  sells vapor).
- **A12 Settings** — mine is rich (account, children CRUD, nav, sign-out) but the
  embedded toggles are inert: night-mode, language/currency, wake-window/vaccine
  reminders, export-all / delete-all (store has unused `clearAll`), live billing row.
- **A13 Child Profile · School-Age** *(not built)* — A06 reskinned for older
  child: homework/activities model, chore rollup, **stage-conditional content**.
- **A14 Night Log · Light** *(not built)* — same engine as A03, light theme;
  proves need for a theme switch.
- **A15 Kiosk Mode** *(not built)* — 1024px landscape family command-centre
  aggregating events + routines + chores + up-next; depends on all those engines.

**App module data-model gaps:** richer entries (side/volume/duration/interval/
pump) · events/appointments · health records (vaccine/med/growth+percentiles) ·
life-stage derivation + Family tab · routines/chores/points · co-parent/custody/
expenses · milestones+media+keepsake · night theming · notifications · Settings
actions (export/delete/lang/currency) · kiosk/landscape · plan-gating integrity.

---

# Module: Pregnancy (P01–P17)

All 17 screens fully static. Per-screen highlights (full detail retained from audit):

- **P01 Dashboard** — needs pregnancy profile + gestational-age engine ("Week 24/
  112 days/60%" all literal); quick-tiles/cards/BottomNav inert; kick/mood/appt
  cards must aggregate from stores; baby-size from a weekly content dataset.
- **P02 Week-by-Week** — week paging state; **40-week content model** across
  Baby/Body/Nutrition tabs (only 3 cards of one tab exist); trimester bar computed.
- **P03 Kick Counter** — TAP counter + session model + multiples (Baby A/B/Combined)
  + threshold alerts. **Reconcile with the existing standalone kick counter.**
- **P04 Symptoms/Mood/Weight** — mood scale + multi-select symptom chips + **weight
  numeric input** (none today) + dated check-in model + "+0.3/week" delta calc.
- **P05 Safety Scanner** — `TextInput` search, `expo-camera` barcode, and a
  **food/med/barcode safety knowledge base** (heaviest data dependency) + result
  detail + recent-scans store.
- **P06 Birth Prep** — checklist toggle + count/% + seeded 42-item list; **Birth
  Plan tab unbuilt** (builder); Baby Names tab → P07; add-custom items.
- **P07 Baby Names** — card-stack state + swipe + **names dataset** + saved list +
  filters + partner mutual-likes (needs P09 relay).
- **P08 Bump Journal** — image picker/camera + weekly photo store + milestone
  model + multiples tag + **bridge into the app Timeline at birth**.
- **P09 Support Circle** — most backend-dependent; invites + per-member permission
  scopes + revoke + **E2E relay** (none exists). Powers P07/P12 sharing.
- **P10 Calm Layer** — tab state + `expo-av` audio player + audio catalog + media.
- **P11 Compassionate Outcomes** — pregnancy **status machine** (active/paused/
  archived) gating the whole module + notification pause + regional resources +
  archive/restore.
- **P12 Contraction Timer** — timer + contraction model + **5-1-1 detection** +
  rolling averages + share (P09). **Reconcile with existing contraction timer.**
- **P13 Appointments & Tests** — appointment + test-result models + countdowns +
  reminders; tabs (Test Results/Reports) render nothing; feeds P01 "next appt".
- **P14 Prenatal PDF** — `expo-print` + share sheet + **premium gate** +
  aggregation across profile/weight/meds/tests/mood; **no meds model exists**;
  EPDS referenced but no questionnaire.
- **P15 Red-Flag Triage** — lowest-effort: wire `Linking` `tel:` to a stored
  maternity-unit number (needs provider-contact profile field).
- **P16 High-Risk Add-ons** — glucose + BP models + input forms + enable/disable
  add-ons + thresholds + twins flag; premium gate.
- **P17 Weight + Bump Time-lapse** — weight history → IOM gain bands (BMI-adjusted,
  needs pre-pregnancy weight/height) + "on track" calc + video export (premium).

**Pregnancy module gaps:** pregnancy profile + due-date/gestational engine ·
on-device store (kicks/check-ins/weights/photos/milestones/appts/tests/glucose/BP/
names/checklist/circle) · 40-week content dataset · symptom/mood/**EPDS** model ·
**medications model (absent)** · safety knowledge base · content catalogs (names/
audio/triage/resources) · notifications · **sharing relay** · device integrations
(camera/barcode, image picker, audio, PDF, video, tel:) · calc utilities (gain
bands, 5-1-1, kick windows, GDM/BP thresholds) · premium enforcement · multiples
support · lifecycle/status machine + **Timeline handoff** · navigation wiring.
**Reconcile P03/P12 with the existing standalone tools (shared model).**

---

# Module: Maternal (M01–M13)

Free-forever, mother-centred, strong privacy + safeguarding. All 13 static.

- **M01 Today "You" card** — `Mother` profile + computed postpartum week/day;
  stats aggregate from M03/M05/M07; nav/FAB/CTA inert; pre-birth vs postpartum
  variants.
- **M02 Preconception/TTC** — `Cycle`/`CycleDay` model + fertile-window/ovulation
  algorithm (LH/BBT) + day logging inputs + region-aware preconception checklist.
- **M03 Postpartum Dashboard** — **recovery scoring model** (4 dimensions with
  defined inputs/weights) + 14-day mood ribbon from `DailyCheckIn` + trend slope.
- **M04 Recovery Tracker** *(safety)* — lochia/perineal/BP models + numeric BP
  input + **conditional red-flag engine** (BP≥140/90, clots after day 10) + healing
  model + birth-type metadata.
- **M05 EPDS** *(safety, highest risk)* — full 10-item bank with per-option 0–3
  (reverse-scored) + total banding/thresholds + **Q10 self-harm special handling →
  crisis resources** + state machine + history + scheduled re-screening.
- **M06 Pelvic Floor** — staged program (by week + birth type) + exercise content +
  guided/timed player + completion + diastasis gate + return-to-run = birth+12wk.
- **M07 Feeding & Sleep (mum)** — feeding-comfort/maternal-sleep/hydration models +
  inputs + 7-day avg + hydration goal (+500ml if breastfeeding) + mastitis checker.
- **M08 Appointments + Maternal PDF** *(premium-export)* — appointment model
  auto-seeded from birth date + reminders + editable prep-questions + on-device PDF
  (Recovery+EPDS+BP) behind **premium gate**. (Dates already stale vs 2026-06-25.)
- **M09 Partner-Watch** — the one real-backend/multi-user screen: invite/pairing +
  **consent scopes** + revoke + partner-facing role + E2E relay + suggestion engine.
- **M10 Compassionate Outcomes** *(safety)* — region-aware crisis resource
  directory + defined **soft-escalation** (ties to EPDS Q10) + `SensitivityMode`
  adapting copy across M01/M07/M12 + birth-story journaling.
- **M11 Maternal Timeline** — `TimelineEvent` log derived by stitching M02→
  pregnancy→M12→M03 + `BirthRecord` capture + premium export + multi-pregnancy
  chaptering.
- **M12 Birth Handoff** — birth-event trigger + birth-record write + **bump-journal
  → child first-chapter migration** + routing (free recovery vs premium newborn
  trial via Stripe) + child creation.
- **M13 Pregnant-again** — multi-subject model (mother w/ multiple pregnancies +
  children) + **per-subject entitlement** (free pregnancy alongside premium child)
  + subject switcher context.

**Maternal module gaps:** full data layer (Mother/Pregnancy/Child/Cycle/Recovery/
EPDS/PelvicFloor/Feeding/Sleep/Hydration/Appointment/DailyCheckIn/TimelineEvent/
BirthRecord/PartnerShare) · date/postpartum-week derivation · **recovery scoring
spec** · **EPDS scoring + safeguarding engine** · clinical red-flag engine ·
resource directory + soft-escalation + SensitivityMode · pelvic-floor scheduling +
player · appointment reminders + PDF export (premium) · partner-watch sharing
(multi-user/E2E) · multi-subject + per-subject entitlement · lifecycle transitions
· nav/FAB/check-in flow · encrypted-local privacy posture.

---

# Module: Onboarding (O01–O09) & Landing (L1–L5)

Both tagged `marketing`; fully static. The shared chrome (`_parts.tsx`: SkipLabel/
BackLabel/ProgressDots/NextButton) is non-interactive; O04/O05/O06 re-implement
footers inline. The real flow (`src/components/Onboarding.tsx`) is a separate
2-step component and ignores all nine O-screens.

**Onboarding screens:** O01 Hero (carousel entry) · O02 Mum&Me (implies a
pregnancy/due-date branch) · **O03 Age-Adaptive (the 6-stage taxonomy — the single
biggest data-model gap: `Child` has no `stage`)** · O04 Snap-to-Schedule (camera/
OCR + calendar write + permission priming) · O05 Night Log (notifications + theme)
· O06 Health Hub (vaccine/med/growth + PDF) · O07 Co-Parent (invite/multi-user/
sync — contradicts local-only) · O08 Timeline (photo permission) · O09 CTA (plan
chips + signup handoff — currently a dead end with a disabled "Done").

**Onboarding module gaps:** real carousel (swipe/pager/dots/skip/back/next +
"seen" persistence) · account/identity capture · **stage selection (6-stage)** ·
multiple children + "expecting" branch · pregnancy/Mum&Me branch (LMP/EDD) ·
permission priming (camera/notifications/photos) · notification setup · plan/
billing selection (reach existing Stripe) · co-parent invite · broader data capture
· consolidate footers.

**Landing screens:** five **marketing directions**, not a site. L1 Origin · L2
Grove (canonical 6-stage chips) · **L3 Journey (most page-like — has nav + 2 CTAs +
the only interactive element, a horizontal scroller)** · L4 Manifest (wants DM
Serif Display) · L5 Cards (hardcoded June-2026 calendar, absolute cards won't
reflow).

**Landing module gaps:** wire every (inert) CTA to real targets · pick one
direction (L3) and build the full page set (nav/hero/features/pricing/footer/legal)
· responsive web layout · **SEO** (title/meta/OG/canonical/sitemap, semantic `h1`)
· load proper fonts · analytics + consent · **reconcile local-first marketing
claims with the Supabase/co-parent reality** · de-hardcode content.

---

# Module: Fast-Follow (S1–S7) & Admin (D1–D5)

## Fast-follow (mobile, 390px; note: no S4)
- **S1 Grocery** *(premium)* — `grocery_lists`/`grocery_items` (qty/unit/category/
  store/assignee/checked) + store catalog + check toggle + add/edit + meal-plan
  import + person tags + real-time multi-user sync.
- **S2 Weekly Digest** *(free)* — push infra (`expo-notifications`+APNs/FCM) +
  scheduled tz-aware weekly job + aggregation (sleep/feeds/events/vaccines) +
  deep-link + in-app digest detail + prefs.
- **S3 Multi-Timezone** *(premium)* — `family_contacts` w/ IANA tz + live clocks +
  asleep/awake derivation + best-call-window algorithm + DST-correct tz lib +
  add/edit contacts.
- **S5 Wellbeing Nudge** *(free)* — bottom-sheet + insight rules engine over child
  trends + age-banded tip library w/ citations + `saved_tips`/`dismissed_nudges` +
  frequency caps.
- **S6 Voice Add** *(premium, dark)* — mic capture + ASR + real waveform + NLU
  intent/entity parser (cloud-LLM) + roster resolution + confirm + route to store.
  Shared engine behind S1 FAB + global quick-add.
- **S7 Share** *(free)* — native share API (replace fake sheet) + share-card image
  render (`view-shot`) + `milestones` source + caption/link + privacy gating.

**Fast-follow shared needs:** a unified child/family roster · notifications/
scheduler (S2,S5) · ASR+NLU/LLM (S6,S1) · tz lib (S3) · native share + image
render (S7).

## Admin (desktop, 1440px) — design vs the live read-only mobile console
The live `admin.tsx` gates on `isAdmin()` and reads only `profiles` count +
`feature_flags` (ON/OFF) + `config` (JSON), read-only. The design is a 5-page
console with a persistent sidebar.
- **D1 Revenue Dashboard** — MRR/subs/churn/trial-conversion KPIs + waterfall +
  funnel + plan-mix donut + cohort heatmap + live ops feed + range select + export.
- **D2 Config & Flags** — typed inline config editing + flag toggle + **rollout %**
  + **targeting rules** + kill-switch (with "locked" for safety flags). Schema gap:
  live `feature_flags` is `{key,enabled}` only; design needs `rollout_pct`,
  `targeting`, `locked`, `description`, `updated_at/by`.
- **D3 Users** — searchable/filterable/paginated directory + lifecycle status +
  Stripe join + write ops (change plan/reset pw/extend trial/retry/**GDPR erasure**).
  Entirely absent today.
- **D4 Billing** — Stripe integration + webhook ingestion + dunning queue +
  transactions + recovery metrics + retry/refund/cancel. Entirely absent (Stripe
  MCP tools exist in env but unused). Highest-risk surface.
- **D5 Audit & RBAC** — named roles + scoped permissions + per-admin 2FA +
  admin-account CRUD + **immutable append-only audit log w/ IP** that every write
  must emit to. Live RBAC is a single boolean.

**Admin sequencing:** Audit log (D5) + flag/config schema expansion (D2) are
foundational — no write op in D2/D3/D4 ships safely until roles + audit exist.
Billing (D4) is gated on a Stripe integration with zero app-side wiring today.
An `audit_log` table already exists in the Supabase schema.
