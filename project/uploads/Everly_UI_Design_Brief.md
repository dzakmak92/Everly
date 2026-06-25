# Everly — UI Design Brief (for AI UI-generation tools)

*How to use this: paste **Part A (Style Block)** once at the top of your tool (Figma AI / Galileo / Uizard / v0 / Stitch / etc.), then generate **one screen at a time** using its prompt in Part B. Each screen prompt is self-contained and references the shared style. Specify a **mobile frame 390 × 844 px** for the app, **desktop 1440 px wide** for the admin dashboard.*

---

## PART A — GLOBAL STYLE BLOCK (paste first, every time)

**App:** "Everly" — a warm, calm, premium family app that tracks a child from newborn to teen (logs, calendar, health, routines, co-parenting, timeline). Audience: parents. Mood: soft, modern, reassuring, inclusive — NOT clinical, NOT childish, NOT corporate.

**Signature rule — FACELESS SILHOUETTES:** every depiction of a person is a simple rounded silhouette with a plain circle head and NO facial features (no eyes/mouth), in a flat pastel fill, sized by life-stage (baby = small, child = medium, adult = tall). Never use photos of people, emoji faces, or drawn faces anywhere. This is the brand's defining trait.

**Color tokens (use exactly):**
- Canvas background: `#F4F3FB` (cool lilac-white)
- Card surface: `#FFFFFF`, corner radius 22px, soft shadow `0 3px 16px rgba(51,50,74,.07)`
- Text ink: `#33324A` · secondary text: `#6F6E86` · muted/labels: `#9C9AB2`
- Hairline border: `rgba(51,50,74,.08)`
- **Primary = periwinkle `#6B6FC9`** (buttons, FAB, active states, links) · deep variant `#54579E` (text on pastel)
- Accent = rose `#E98FB3` · sparkle/celebrate = gold `#E9C46A`
- Night mode surfaces: `#262539` (bg) / `#312F49` (cards) with `#EDEBFA` text

**Per-child pastel tokens (each child owns one; pair each fill with its darker stroke for icons/text):**
| Token | Fill | Stroke |
|---|---|---|
| lilac | `#E7E4FB` | `#6B6FC9` |
| sky | `#DCEBFA` | `#4E8FD0` |
| mint | `#D8F0E6` | `#3FA98A` |
| blush | `#FBE0EA` | `#D46E97` |
| peach | `#FCE6D8` | `#D9824F` |
| butter | `#FBF1CE` | `#C9A33B` |
| sage | `#E6EFDD` | `#6E9A4E` |

**Typography:**
- Display / headings: **Quicksand** (weights 600, 700) — rounded, friendly
- Body / UI: **Nunito** (weights 400, 600, 700, 800)
- Scale: hero 40–56px / screen title 22–24px / section header 15–16px / body 14–15px / caption 11–12px / micro label 9–10px (uppercase, letter-spacing .1em, muted)

**Shape & spacing:** generous whitespace; card radius 22px; tile/button radius 14–16px; pills fully rounded (999px); 16–20px screen padding; soft shadows only (no hard borders except hairlines); faint dot-grain texture on the canvas (very subtle).

**Iconography:** flat **line icons**, 2px stroke, rounded caps, single color (use the contextual stroke color). Needed icons: calendar, baby-bottle, moon, heart, star, book, house, car, health-pulse, camera, bar-chart, sprout/leaf, coin/euro, pencil, clock, syringe, spoon, checkmark, map-pin, share. NO multicolor emoji in the UI.

**Core components (reuse across screens):**
- **Primary button:** periwinkle fill, white text, weight 800, radius 15px, soft periwinkle shadow.
- **Secondary button:** white fill, hairline border, muted text.
- **Pill tabs:** rounded; active = periwinkle fill + white text; inactive = white + hairline border + ink text; optional count badge.
- **Bottom nav bar:** 5 slots — Today · Calendar · center **FAB** · Children · Settings. FAB = periwinkle circle with a "+" line icon, slightly raised with shadow. Active nav item sits in a soft periwinkle-tint pill.
- **Card:** white, 22px radius, soft shadow.
- **List row:** left icon-chip (pastel square + line icon) · title (bold) + subtitle (muted) · right-aligned meta/status.
- **Tile:** pastel rounded square with a centered line icon (used for quick-log and categories).
- **Stat card:** small uppercase muted label + large Quicksand number; optional inline sparkline.
- **Chip:** white, hairline border, rounded, icon + short label.
- **Avatar:** faceless silhouette inside a pastel circle (child's token color).
- **Floating tiles + sparkles:** decorative pastel tiles and small gold ✦ sparkles may float behind hero/empty states.

**Device frames:** App screens = iPhone-style 390 × 844 with notch, content above a 72px bottom nav. Admin = responsive desktop, 1440px, left sidebar + main canvas.

---

## PART B — SCREEN LIST WITH DETAILED PROMPTS

*Generate each separately. Copy the description into your tool after the Style Block.*

### 1. Onboarding carousel (8 slides, mobile)
A swipeable first-run carousel on the lilac canvas. Each slide: a centered phone-mockup or hero illustration using **faceless pastel silhouettes** and floating pastel tiles + gold sparkles, a Quicksand headline (one accent word in periwinkle) and a one-line muted subtitle near the bottom, plus a bottom bar with a Back text-button (left), progress dots (center, active dot elongated periwinkle), and a periwinkle "Next →" button (right). Slides: (1) Hero "One app, from first feed to first car" with a family of silhouettes; (2) Age-adaptive — a horizontal stage spine of growing silhouettes baby→child→teen→adult; (3) Snap-to-Schedule — a flyer photo turning into event cards; (4) Newborn night-log in dark night-mode; (5) Health hub with a "Pediatrician PDF" button; (6) Co-parent — two adult silhouettes + a custody week strip; (7) Timeline — a vertical growth spine; (8) CTA "Start their story today" with plan chips and a primary button. Warm, airy, generous spacing.

### 2. Today / Dashboard (mobile, home screen)
The default home. Top: small greeting + date. A horizontal row of **child selector pills** (each = faceless silhouette avatar in its pastel + name + age). Below, a vertical feed of **list-row cards** showing "what's next" across children — e.g. "Last feed · Left side · 45 min ago" with a periwinkle "2h to next" tag, "Leo · Swim practice · 16:30", "Mia · 4-month check · Fri 09:00". Each row uses the child's pastel icon-chip. A prominent center **FAB (+)** for quick add. Bottom nav visible. Calm, scannable, lots of breathing room.

### 3. Calendar (mobile)
A month calendar on white card. Per-child **color-coded dot-indicators** under dates (stacked small dots in child tokens; busy days show more/larger dots). Custody periods render as **soft full-cell background bands** in a parent's pastel (not borders). Header: month name (Quicksand) + left/right chevron circle buttons + view toggle (Month/Week/Agenda) pills. Today is a filled periwinkle circle. Tapping a day opens a bottom sheet listing that day's events + logs as list-rows. Include a "locked event" lock glyph on protected events.

### 4. Child profile — stage-adaptive hub (mobile)
Header: child's faceless silhouette avatar (pastel) + name + an age/stage pill. A **horizontal stage spine** showing Newborn→Toddler→School→Teen with the current stage highlighted in periwinkle and others muted (growing silhouette sizes). Below, **stage-appropriate cards**: for a newborn — Feeds (6 today · 720 ml), Sleep (14h 20m), Growth (75th percentile) as list-rows with pastel icon-chips and tiny sparklines. A quick-log FAB. Show how the same screen would differ for a school-age child (timetable, homework, chores rows) as an alternate variant.

### 5. Newborn log — NIGHT MODE (mobile, signature screen)
Dark night-mode (`#262539` bg, `#312F49` cards, `#EDEBFA` text). Title "Night log" + a small "🌙 3:14" time. A 2×2 grid of large **quick-log tiles**: Feed / Sleep / Diaper / Pump, each a rounded dark card with a centered pastel line icon, label, and "tap to log". Below, a **wake-window banner** (filled accent card): clock icon + "Wake window · Next nap in ~35 min". Optimized for one-handed 3am use: big tap targets, low brightness, minimal text. Also generate a **light-mode variant** of the same screen.

### 6. Newborn "Rhythm Ring" detail (mobile — custom data-viz)
A hero **24-hour radial clock**: a thick ring where segments are colored arcs representing feeds (mint), sleeps (lilac), and diapers (peach) positioned by time of day, on a white card. Center of ring shows a big total (e.g. "14h 20m sleep"). Below the ring: a legend and **stat cards with sparklines** (7-day sleep, daily feeds, growth percentile). Tapping an arc reveals the entries behind it. Calm, encouraging, not clinical — soft colors, rounded everything.

### 7. Health Hub + Pediatrician PDF (mobile)
Title "Health · [child]". A vertical list of **health record rows**: vaccine ("6-in-1 vaccine · Due in 9 days" with a rose dot), medication ("Vitamin D drops · Daily 08:00" with a green check), growth ("Weight 6.4 kg · 75th percentile"). Each row has a pastel icon-chip (syringe, clock, chart). A faint shaded "typical range" band behind any growth mini-chart. Bottom: a full-width **primary periwinkle button "📄 Pediatrician PDF"**. A small lock/shield note: "Health data stays on this device." Trustworthy, clean, medical-but-warm.

### 8. Routines & Chores / Allowance (mobile)
Two modes on one screen. Top: **picture-routine cards** for young kids — visual step tiles (wake, brush teeth, dress) in pastel tiles with line icons. Below: a **chore board** with rows showing task, assigned child (silhouette avatar), points/star value, and status (To do / Done / Approve). Show "partial credit" on a late task. A **points→allowance** summary card with a balance ("Leo · ⭐ 45 pts · €6.50") and a settle/reward button. Gentle, gamified, non-surveillance tone.

### 9. Co-Parent mode (mobile)
Title "Co-parent" + child pill. A **custody week strip**: 5–7 day cells colored by which parent ("You" in mint, "Sam" in peach). Below, an **expense-split list**: rows with item, "€45 · split 50/50", and a balance tag ("Sam owes €22.50" in rose) + a settled row with green check. A **balance gauge** (two-sided horizontal bar) summarizing who owes what, with a "Settle up" button. Optional: a shared info-bank card (schools, doctors). Neutral, calm, fair-feeling — two adult faceless silhouettes as the parents.

### 10. Lifelong Timeline (mobile, retention screen)
Title "[child]'s story". A **vertical timeline spine** down the left with milestone nodes; a small **sprout/leaf motif that visibly grows larger** as you scroll through stages (seedling → leafy). Each entry = a list-row card with a pastel icon-chip and date: "First smile · 6 weeks", "First bath · 2 photos", "First solids · 17 weeks · sweet potato". Photo entries show a small rounded thumbnail (use abstract pastel placeholders, no faces). Bottom: a "Create keepsake book" button. Warm, emotional, scrapbook-like but minimal.

### 11. Kiosk / fridge-display mode (tablet/landscape)
An always-on **family command center** for a wall tablet (landscape, larger type, high glanceability). Three zones: a week calendar (color-coded by child), today's chore/routine checklist, and an "up next" column. Big rounded cards, large Quicksand labels, the lilac canvas, child pastel coding. Designed to be readable from across a kitchen.

### 12. Paywall / Plans (mobile)
A clean plan-selection screen. Headline "Start their story today". Four options as cards: **Free Forever (€0)**, **Pro (€3.99/mo · €39.99/yr)** highlighted as the recommended card in periwinkle, **Family (€4.99/mo · €49.99/yr)**, **Lifetime (€149.99 one-time)**. Each card lists 3–5 included features with checkmarks. A reassuring line "Newborn tracking free forever · no card needed". Primary periwinkle CTA. Trustworthy, not pushy.

### 13. Settings (mobile)
Standard grouped settings on the lilac canvas. Groups: Account (silhouette avatar + name + plan badge), Plan & Billing, Family & Sharing (manage caregivers/relay), Preferences (language, currency, units, theme incl. Night mode, start view), Notifications, Data & Privacy (Export all data, Reset — emphasize "your data is on this device"), About. Rows with line-icon chips, chevrons, and toggles in periwinkle.

### 14. Operator Admin Dashboard (DESKTOP 1440px — separate product)
A clean SaaS analytics dashboard, light theme on a near-white bg, left **sidebar nav** (Dashboard, Users, Billing, Config & Flags, Audit Log) with the periwinkle accent. Main canvas top: a **KPI hero strip** of 5 cards (MRR, Active Subs, Trial→Paid %, Churn %, Dunning) — each big Quicksand number + tiny sparkline + green/red delta. Below: an **MRR waterfall chart** (starting → +new → +expansion → −churned → ending). Then a row with a **trial→paid funnel** (horizontal, drop-off %) and a **plan-mix donut** (Free/Pro/Family/Lifetime). Below: a **cohort retention heatmap** (rows = signup month, columns = months-since, cells shaded periwinkle by % retained). Right rail: a **live ops feed** (new subs, cancellations, failed payments) with red **alert chips**. Use periwinkle as the primary data color, rose/gold as secondary series. Professional, calm, legible.

### 15. Admin — Config & Feature Flags (DESKTOP)
A control-plane screen. A table/list of **config values** (trial length, plan prices, enabled languages/currencies) inline-editable. Below, a **feature-flag board**: each flag a card with an on/off toggle, a **rollout-% slider**, targeting chips (plan/region/version), a kill-switch button, and a tiny adoption sparkline. Emphasize "changes apply without redeploy". Clean, dense-but-organized, periwinkle accents.

---

## PART C — DATA-VISUALIZATION NOTES (for the unusual charts)

Tell the tool these explicitly, since generators struggle with them:
- **Rhythm ring:** a donut/radial 24h clock; colored arcs by activity type positioned by time; big centered total; soft pastel fills, rounded arc caps.
- **Sparklines:** tiny 7-point line charts inside stat cards, no axes, single pastel stroke.
- **Growth chart:** line over a faint shaded "normal range" band; reassuring not clinical.
- **MRR waterfall:** floating bars showing incremental + and − contributions between a start and end total.
- **Cohort heatmap:** grid of cells shaded by intensity (light→periwinkle) = retention %.
- **Balance gauge:** a single horizontal bar split left/right from center showing who owes whom.

---

## PART D — TIPS FOR THE GENERATOR

1. Paste **Part A** first as the system/style context, then one screen prompt from Part B.
2. Always restate the two hard constraints in each prompt: **"faceless silhouettes, no faces"** and **"periwinkle #6B6FC9 primary on lilac #F4F3FB canvas, Quicksand + Nunito."**
3. Specify the frame: "mobile 390×844 with bottom nav" or "desktop 1440 dashboard."
4. Generate light + night-mode variants for newborn screens.
5. Ask for components as reusable symbols (button, card, list-row, nav, tile, avatar) so the tool builds a consistent library.
6. If the tool over-decorates, add "minimal, generous whitespace, soft shadows, no hard borders, no emoji."

*Everything here matches the Everly PRD (`Everly_PRD_Master_Spec.md`) — design system §15, screens §12, visualizations §7.9 & §10.7, pricing §13.*
