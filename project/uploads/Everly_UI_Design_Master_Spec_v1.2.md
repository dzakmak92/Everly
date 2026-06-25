# Everly — UI Design Master Spec (v1.2, for AI UI-generation tools)

*Supersedes the v1.1 UI Design Brief. Adds the **Mum&Me** free-forever bundle as a named surface, first-class **multiples (twins/triplets)** and **subsequent-pregnancy** screens, and the **free→premium handoff** visual language. Part A (global style) is unchanged from v1.1 — paste it once at the top of your tool (Figma AI / Galileo / Uizard / v0 / Stitch), then generate one screen at a time from Part B. App frame **390 × 844 px**; admin **1440 px**.*

---

## PART A — GLOBAL STYLE BLOCK (paste first, every time)

**App:** "Everly" — a warm, calm, premium family app that carries both **the mother and the child**, from trying-to-conceive through pregnancy and the fourth trimester, then the child from newborn to teen. Mood: soft, modern, reassuring, inclusive — NOT clinical, NOT childish, NOT corporate.

**Signature rule — FACELESS SILHOUETTES:** every depiction of a person is a simple rounded silhouette with a plain circle head and NO facial features, in a flat pastel fill, sized by life-stage (baby = small, child = medium, adult = tall; a pregnant silhouette = adult with a softly rounded bump). Never use photos of people, emoji faces, or drawn faces anywhere. This is the brand's defining trait.

**Color tokens (use exactly):**
- Canvas background: `#F4F3FB` (cool lilac-white)
- Card surface: `#FFFFFF`, corner radius 22px, soft shadow `0 3px 16px rgba(51,50,74,.07)`
- Text ink: `#33324A` · secondary `#6F6E86` · muted/labels `#9C9AB2`
- Hairline border: `rgba(51,50,74,.08)`
- **Primary = periwinkle `#6B6FC9`** (buttons, FAB, active states) · deep variant `#54579E` (text on pastel)
- Accent = rose `#E98FB3` · sparkle/celebrate = gold `#E9C46A`
- **Maternal/postpartum teal `#3A9B8A`** · **preconception sky `#4E8FD0`** (the Mum&Me family of tones)
- Night-mode surfaces: `#262539` (bg) / `#312F49` (cards) / `#EDEBFA` (text)

**Per-child pastel tokens (each child owns one; pair fill with its darker stroke):**
| Token | Fill | Stroke |
|---|---|---|
| lilac | `#E7E4FB` | `#6B6FC9` |
| sky | `#DCEBFA` | `#4E8FD0` |
| mint | `#D8F0E6` | `#3FA98A` |
| blush | `#FBE0EA` | `#D46E97` |
| peach | `#FCE6D8` | `#D9824F` |
| butter | `#FBF1CE` | `#C9A33B` |
| sage | `#E6EFDD` | `#6E9A4E` |

**Typography:** display/headings **Quicksand** (600/700); body/UI **Nunito** (400/600/700/800). Scale: hero 40–56 / title 22–24 / section 15–16 / body 14–15 / caption 11–12 / micro 9–10 (uppercase, .1em, muted).

**Shape & spacing:** card radius 22px; tile/button 14–16px; pills 999px; 16–20px screen padding; soft shadows only (hairlines, never hard borders); faint dot-grain on canvas.

**Iconography:** flat line icons, 2px stroke, rounded caps, single contextual stroke color. NO multicolor emoji in the UI.

**Core components (reuse):** primary button (periwinkle fill, white text, 800, radius 15, soft shadow); secondary (white, hairline, muted); pill tabs (active = periwinkle fill + white); **bottom nav** (5 slots — Today · Calendar · center **FAB +** · Children · Settings); card; list-row (pastel icon-chip · bold title + muted subtitle · right meta/status); tile (pastel rounded square + centered line icon); stat card (uppercase muted label + Quicksand number + optional sparkline); chip; **avatar** (faceless silhouette in pastel circle); floating pastel tiles + gold ✦ sparkles behind hero/empty states. **Sprout-growth motif** across stages.

**Device frames:** app = iPhone-style 390×844 with notch, content above a 72px bottom nav; admin = desktop 1440, left sidebar + main canvas.

---

## PART A2 — NEW IN v1.2: MUM&ME PACKAGING & THE FREE↔PREMIUM LANGUAGE

These conventions apply across every Part B screen below.

**1. Mum&Me is a named, free-forever surface** — the mother's journey with the baby woven in, up to birth, plus the whole postpartum/maternal arc. Treat it as the warm heart of the app. Its tones lean on **teal `#3A9B8A`** (maternal) and **sky `#4E8FD0`** (preconception) alongside periwinkle. Wherever a Mum&Me surface appears, a small, quiet **"Free forever" pill** (teal-tint fill, teal text, rounded) sits near the title — a reassurance, never a nag.

**2. The free→premium boundary has a gentle visual grammar.** Premium (newborn tracking and the convenience/scale layer) is never hidden or scary. A premium-gated card shows a small **periwinkle sprout-lock glyph** (a sprout with a tiny lock leaf) in the top-right and, when tapped while locked, slides up a **calm upgrade sheet** — pastel, no red, no countdown-pressure. Free Mum&Me cards never show this glyph. The safety features (kick counter, contraction timer, red-flag triage, EPDS, compassionate outcomes) NEVER show it either.

**3. The handoff at birth is a celebratory, not transactional, moment.** When a pregnancy completes, show a soft full-card **"Welcome, [baby]" handoff** with the sprout motif blooming and a line like "Your bump journal has become [baby]'s first chapter." The newborn tracking it unlocks is premium — the upgrade ask comes *after* the welcome, gently, and the mother's own postpartum card stays clearly free beside it.

**4. Multiples** are first-class: any pregnant silhouette can carry two/three small bump dots; per-baby data uses **"Baby A / Baby B" pill toggles** in the child's pastel tokens.

**5. Subsequent pregnancy** is normal: Today can show existing children's cards AND the maternal "You" card returned to its pregnancy state, with no visual conflict.

---

## PART B — SCREEN LIST WITH DETAILED PROMPTS

*Generate each separately, after the Style Block + Part A2. Always restate: "faceless silhouettes, no faces" and "periwinkle #6B6FC9 on lilac #F4F3FB, Quicksand + Nunito." Mum&Me screens marked 🟢 are free-forever; premium screens marked 🟣 carry the sprout-lock grammar.*

### 1. Onboarding carousel (9 slides, mobile)
Swipeable first-run carousel on the lilac canvas. Each slide: a centered phone-mockup or hero with **faceless pastel silhouettes** + floating tiles + gold sparkles, a Quicksand headline (one accent word in periwinkle), a one-line muted subtitle, and a bottom bar (Back text-button · elongated periwinkle progress dots · periwinkle "Next →"). Slides: (1) Hero "One app, from **first scan** to first car"; (2) **"Mum&Me — free, forever"** with a pregnant silhouette holding a small bump-baby silhouette, teal accent, and the line "We carry you, not just the baby"; (3) Age-adaptive stage spine baby→child→teen→adult; (4) Snap-to-Schedule flyer→cards; (5) Newborn night-log dark mode; (6) Health Hub with a Pediatrician PDF button; (7) Co-parent two adult silhouettes + custody strip; (8) Timeline growth spine; (9) CTA "Start your story today" with plan chips + primary button. Slide 2 must feel like the emotional center.

### 2. Today / Dashboard 🟢/🟣 (mobile, home)
Top: greeting + date. A horizontal row of **subject pills** — each child (faceless silhouette in pastel + name + age) **and a maternal "You" pill** (teal silhouette + her stage badge, e.g. "Pregnant · 24 wk" or "Postpartum · wk 3"). Below, a vertical feed of list-row cards mixing the mother and children: a teal **"You" card** (mood/sleep/recovery mini-metric) sits naturally beside children's "what's next" rows. Free Mum&Me rows are clean; premium baby-tracking rows show the small sprout-lock when the trial has lapsed. Center **FAB (+)**. **Subsequent-pregnancy variant:** show a toddler's card (peach) next to the "You" card flipped back to a pregnancy state (teal) — both coexisting calmly.

### 3. Calendar (mobile)
Month calendar on white card. Per-child **color-coded dot-indicators** under dates; **custody periods** as soft full-cell background bands in a parent's pastel. **Weather glyphs** per day + a weather-alert banner + a "⛅ Dublin 18°" today chip. Header: month (Quicksand) + chevron circles + Month/Week/Agenda pills. Today = filled periwinkle circle. Tap a day → bottom sheet of events + logs. Show a lock glyph on locked events.

### 4. Mum&Me — Pregnancy dashboard 🟢 (mobile) — NEW emphasis
Title "Mum&Me" + a quiet teal **"Free forever"** pill. Hero card: a **week badge** ("Week 24"), days-to-go, a soft progress bar, and a baby-size line — beside a **pregnant faceless silhouette** in teal. Quick-log tiles (mood, symptom, weight, kick). A "this week, for you AND baby" two-column mini-card (left = your body, right = baby development). Calm, warm, teal+periwinkle. **Multiples variant:** the silhouette carries two bump dots; the baby column gets **"Baby A / Baby B" pill toggles**; size card shows both.

### 5. Mum&Me — Kick counter 🟢 (mobile, safety, free)
A big central **tap-to-count target ring** (mint), current count vs baseline, a recent-sessions list, and a gentle midwife red-flag note. NO paywall glyph anywhere. **Multiples variant:** a "Baby A / Baby B" toggle above the ring so movement can be counted per baby; combined is the default.

### 6. Mum&Me — Contraction timer 5-1-1 🟢 (mobile, safety, free)
A running-session screen: a large tap button ("Tap at start / end of a contraction"), live **current duration / interval / average** stat cards, a **5-1-1 status banner** (calm until criteria met, then a warm "it may be time to call" state), a contraction list, and a "share to partner/doula" secondary button. Safety tone: clear, unhurried, reassuring — never alarmist. No paywall.

### 7. Mum&Me — Bump journal 🟢 (mobile) — NEW
A weekly **photo grid** (rounded pastel placeholders, no faces) with week labels and milestone chips ("First kick felt", "Anatomy scan"). A note that it "becomes baby's first chapter at birth." **Multiples variant:** each entry can be tagged **Baby A / Baby B** (or "both"); at the top, two small bump dots. A bottom secondary "Bump time-lapse export" row carries the 🟣 sprout-lock (export is premium).

### 8. Mum&Me — Appointments & test results 🟢 (mobile, safety, free)
List of upcoming appointments + a results section (bloods, NT, GTT, **Group B Strep**, growth scans) each with a calm **Normal / Clear / Pending** state chip. **Multiples variant:** growth-scan rows labelled per baby ("Growth scan · Baby A · 28 wk"). The "Maternal Health PDF" button at the bottom carries the 🟣 sprout-lock (PDF is premium); everything else free.

### 9. Mum&Me — Birth handoff 🟢→🟣 (mobile) — NEW, the emotional pivot
A soft full-card celebration: sprout motif **blooming**, a faceless newborn silhouette emerging from the bump silhouette, headline "Welcome, [baby]", subline "Your bump journal is now [baby]'s first chapter." Below: a calm card showing **two destinations** — a free teal **"Your recovery (free)"** card (→ postpartum dashboard) and a periwinkle **"Track [baby]"** card with a gentle sprout-lock and "Start 30-day trial" (→ premium newborn suite). **Multiples variant:** spawns "Welcome, Baby A & Baby B" and two track-baby cards. No pressure, no red, no countdown.

### 10. Postpartum dashboard 🟢 (mobile, free) — Mum&Me continues
Title with teal "Free forever" pill. A **4-quadrant recovery card** (physical / mood / feeding / sleep), a gentle **14-day mood ribbon** (soft dots, no harsh coloring), and today's recovery actions. Warm teal. The EPDS entry point sits here (free).

### 11. EPDS mood screening 🟢 (mobile, safety, free)
A calm, validated questionnaire flow (one question per card, soft pill answers), a **soft trend ribbon** afterward (never a harsh score), and a positive-screen path that routes gently to resources + provider-prep — "support, not diagnosis." A quiet line: "Private to this device. Never shared with employers or insurers." No paywall, ever.

### 12. Child profile — stage-adaptive hub 🟣 (mobile)
Header: child's faceless silhouette avatar + name + age/stage pill. A **horizontal stage spine** (Newborn→Toddler→School→Teen; current = periwinkle, growing silhouette sizes). Stage-appropriate cards: newborn = Feeds / Sleep / Growth list-rows with pastel icon-chips + sparklines (premium — show sprout-lock if trial lapsed). Alternate school-age variant: timetable, homework, chores rows.

### 13. Newborn log — NIGHT MODE 🟣 (mobile, signature)
Dark (`#262539` bg, `#312F49` cards, `#EDEBFA` text). Title "Night log" + small "🌙 3:14". A 2×2 grid of large quick-log tiles (Feed / Sleep / Diaper / Pump), each a dark rounded card with a pastel line icon + "tap to log". A wake-window banner: "Next nap in ~35 min". One-handed 3am ergonomics: big targets, low brightness. Generate a light-mode variant too. (Premium; if trial lapsed, the screen shows a calm upgrade overlay rather than logging.)

### 14. Newborn "Rhythm Ring" 🟣 (mobile, custom data-viz)
A hero **24-hour radial clock**: thick ring with colored arcs for feeds (mint), sleeps (lilac), diapers (peach) positioned by time; center shows a big total ("14h 20m sleep"). Below: legend + stat cards with sparklines. Tap an arc → entries behind it. Calm, rounded, not clinical.

### 15. Health Hub + Pediatrician PDF 🟣 (mobile)
Title "Health · [child]". Health-record rows: vaccine ("6-in-1 · Due in 9 days", rose dot), medication ("Vitamin D · Daily 08:00", green check), growth ("6.4 kg · 75th pct") with a faint shaded "typical range" band behind the mini-chart. Each row a pastel icon-chip. Bottom: full-width primary "📄 Pediatrician PDF". A shield note: "Health data stays on this device." **Multiples:** clean per-child separation (a child selector at top).

### 16. Routines & Chores / Allowance 🟣 (mobile)
Picture-routine cards (visual step tiles in pastel) for little kids; a chore board (task, assigned child silhouette, points/star, status To-do/Done/Approve) showing **partial credit** on a late task; a points→allowance summary ("Leo · ⭐ 45 pts · €6.50") + settle/reward. Gentle, gamified, non-surveillance.

### 17. Co-Parent mode 🟢 basics / 🟣 pro (mobile)
A custody week strip (5–7 day cells colored by parent — "You" mint, "Sam" peach). Expense-split list (item, "€45 · split 50/50", balance tag "Sam owes €22.50" rose) + a two-sided **balance gauge** + "Settle up". A shared info-bank card. Two adult faceless silhouettes. Basics (custody + info-bank + QR view) free; expenses + tone-scan carry the sprout-lock.

### 18. Lifelong Timeline 🟢 view / 🟣 export (mobile)
Title "[child]'s story". A vertical timeline spine with milestone nodes and a **sprout that visibly grows** as you scroll stages. The **first chapter is the inherited bump journal** ("Before you were born · 9 photos"). Entries = list-row cards with pastel icon-chips + dates. Photo entries = rounded pastel thumbnails (no faces). Bottom "Create keepsake book" + export carry the sprout-lock.

### 19. Maternal Timeline 🟢 (mobile) — NEW, Mum&Me retention
The mother's own continuous story: a teal vertical spine TTC → positive test → scans → birth → recovery. **Subsequent pregnancies appear as distinct chapters** ("Second pregnancy · 2027"). Entries are her milestones, bump photos, birth stories, recovery notes. Warm, dignified, free. Export carries the sprout-lock.

### 20. Paywall / Plans 🟣 (mobile)
Headline "Keep going — track [baby] too". Reassurance line first: "**Mum&Me is always free.** This unlocks baby tracking and the rest of the family." Four cards: Free (Mum&Me + safety, €0, "you're already here"), **Pro €3.99/mo · €39.99/yr** (recommended, periwinkle), Family €4.99/mo · €49.99/yr, Lifetime €149.99 — each with 3–5 checkmark features. A "30 days free, then…" note. Calm, not pushy; no countdown timer.

### 21. Settings 🟢 (mobile)
Grouped on lilac. Groups: Account (silhouette + plan badge — but "no account needed" messaging), Plan & Billing, Family & Sharing (caregivers/relay), Preferences (language, currency, units, theme incl. Night, start view), Notifications, **Data & Privacy** (Export all data, Reset — "your data is on this device"), About. Line-icon chips, chevrons, periwinkle toggles.

### 22. Kiosk / fridge mode 🟣 (tablet, landscape)
Always-on family command center: three zones — week calendar (color-coded by child), today's chore/routine checklist, "up next" column. Big rounded cards, large Quicksand labels, lilac canvas, child pastel coding. Readable across a kitchen.

### 23. Operator Admin Dashboard (DESKTOP 1440px — separate product)
Light SaaS dashboard, near-white bg, left sidebar (Dashboard, Config & Flags, Ops, Audit) periwinkle accent. **KPI hero strip** of 5 cards (Installs, Trial→Paid %, Active Subs, Churn %, Dunning) each with sparkline + green/red delta. Below: an **MRR waterfall** (start → +new → +expansion → −churned → end). Row: **trial→paid funnel** + **plan-mix donut** (Free/Pro/Family/Lifetime). **Cohort retention heatmap** (rows = signup month, cols = months-since, periwinkle shading). Right rail **live ops feed** + red **alert chips**. Note: **no per-user child/maternal/health data anywhere** — aggregate, anonymous only.

### 24. Admin — Config & Feature Flags (DESKTOP)
Inline-editable config values (trial length, plan prices, languages/currencies). A **feature-flag board**: each flag a card with on/off toggle, **rollout-% slider**, targeting chips (region/version), kill-switch, adoption sparkline. Include the v1.1 flags `maternal_postpartum_module`, `preconception_ttc`, `epds_mood_screening` (shown **kill-switch-locked**). "Changes apply without redeploy."

---

## PART C — DATA-VISUALIZATION NOTES (unusual charts)
- **Rhythm ring:** donut/radial 24h clock; colored arcs by activity positioned by time; big centered total; rounded arc caps.
- **Mood ribbon:** soft 14-day band, gentle dots not a harsh line, no judgmental coloring.
- **Growth chart:** line over a faint shaded "typical range" band; reassuring, not clinical.
- **Sparklines:** tiny 7-point lines in stat cards, no axes, single pastel stroke.
- **Balance gauge:** one horizontal bar split left/right from center.
- **MRR waterfall:** floating bars of incremental + and − between start and end totals.
- **Cohort heatmap:** grid shaded light→periwinkle by retention %.

## PART D — TIPS FOR THE GENERATOR
1. Paste Part A + Part A2 first as style context, then one Part B prompt.
2. Always restate the two hard constraints: "faceless silhouettes, no faces" and "periwinkle #6B6FC9 on lilac #F4F3FB, Quicksand + Nunito."
3. Specify the frame: "mobile 390×844 with bottom nav" or "desktop 1440 dashboard."
4. For Mum&Me screens, restate "free-forever, teal accent, no paywall glyph." For premium screens, restate "calm sprout-lock, no red, no countdown."
5. Generate light + night variants for newborn screens; generate the **multiples** and **subsequent-pregnancy** variants where noted.
6. If the tool over-decorates: "minimal, generous whitespace, soft shadows, no hard borders, no emoji."

---

### Change log v1.1 → v1.2
- Added **Part A2**: Mum&Me as a named free-forever surface; the free↔premium visual grammar (teal "Free forever" pill; calm sprout-lock; celebratory birth handoff); multiples and subsequent-pregnancy conventions.
- New/expanded screens: **4** Mum&Me pregnancy dashboard, **5** kick counter, **6** contraction timer, **7** bump journal, **8** appointments/results, **9** birth handoff (new), **10** postpartum dashboard, **11** EPDS, **19** maternal timeline (new), **20** paywall reframed around "Mum&Me is always free."
- Tier markers (🟢 free / 🟣 premium) added to every app screen; **safety + Mum&Me never gated**.
- Admin reframed to aggregate-anonymous (no per-user data), consistent with the no-account build.

*Matches `Everly_BUILD.md` (Mobile Edition) §6 monetization and §4 data model. Where design and PRD numbers differ, PRD wins; where screen composition differs, this spec + the design files win.*
