# Build brief for Claude Code: Media Buying Planner, a multilingual ad budget and media buying planner

## 0. How to work on this project (read first)

You are building this project in Claude Code. Follow these rules for the whole project.

**Project details:**
- Brand name: **Media Buying Planner**
- Short name (app icon, PWA): **MB Planner**
- Package / repo name: `media-buying-planner`
- Tagline (translated in every language): "Ad budget calculator and media buying planner for Meta and Google"
- Domain: [DOMAIN]
- Contact email: [EMAIL]
- The brand name "Media Buying Planner" is never translated. It stays in English in all 7 languages. The tagline and all other text are translated.
- Never use em dashes anywhere in the site copy.

**Setup on the first run only:**
1. Save this entire brief to `/docs/BRIEF.md` exactly as written.
2. Create a short `CLAUDE.md` (under 40 lines) in the project root containing: the project details above, the tech stack, the folder structure, the phase list below, and the credit-saver rules below.
3. Create `/docs/PROGRESS.md` and update it at the end of every phase with: what was done, files created, decisions made, and what is next (10 lines max per phase).
4. Then do Phase 1 only and stop.

**Phases (do one phase per session, then stop and wait for me to type "continue"):**

| Phase | Work | Brief sections |
|---|---|---|
| 1 | Project scaffold, logo, design tokens, light/dark theme, i18n setup (English strings only) | 2, 3, 4 |
| 2 | Calculation engine + unit tests | 9 |
| 3 | Calculator form: Step 0, tabs, fields, tooltips, validation | 7, 8 |
| 4 | Results screen + "Show the calculation" view | 10, 11 |
| 5 | Pages, header, footer, support banner, home sections (English) | 5, 6, 13, 14, 15 |
| 6 | SEO, sitemap, robots, structured data, security | 16, 17 |
| 7 | Guide articles in English | 12 |
| 8 | Translations into the other 6 languages (UI strings, then articles, one locale per session) | 4 |
| 9 | Performance, accessibility and final QA | 18, 19 |

**Global credit-saver rules (apply to every phase):**
- In each phase, read only the brief sections listed for that phase from `/docs/BRIEF.md`. Do not reread the whole brief.
- Read `CLAUDE.md` and `/docs/PROGRESS.md` instead of exploring the codebase. Only open files you are about to change.
- Never reread a file already in context. Read large files in line ranges, not in full.
- Edit files with targeted edits. Never rewrite a whole file to change a few lines.
- Do not print file contents, code or diffs back to me in chat. Report each phase in 5 lines max: what was done, any problems, what's next.
- Do not explain your plan at length. No summaries of the brief.
- Check `package.json` before installing anything. Install only what the brief needs, in one install command per phase.
- Run the build, lint and tests once at the end of a phase, not after every edit. Run only the test files related to the change.
- If a command fails, read only the relevant part of the error, fix it, and rerun once. If it fails twice, stop and tell me.
- Reuse components and utilities. Do not create near-duplicate files.
- Do not take screenshots, open a browser, or run Lighthouse until Phase 9.
- Do not ask me questions that the brief already answers. If something is truly unclear, make the simplest sensible choice, note it in PROGRESS.md, and continue.

## 1. Project overview

Build **Media Buying Planner**, a production-ready, SEO-friendly, multilingual web app that calculates the monthly ad budget a business needs on Meta and Google Search, and turns it into a clear media buying plan. It supports 4 modes:

1. Lead generation + has previous account data
2. Lead generation + new account (no data)
3. Ecommerce + has previous account data
4. Ecommerce + new account (no data)

The planner gives a clear recommended budget, expected results, a profitability verdict, a budget split, warnings, and an optional "Show the calculation" view that explains every step in simple language.

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: this section is context only. Do not generate anything from it.

## 2. Tech stack

- Next.js (latest stable, App Router) + TypeScript (strict mode)
- Tailwind CSS with design tokens via CSS variables
- Framer Motion for UI animation; a lightweight canvas effect for the hero only
- next-intl for internationalization
- React Hook Form + Zod for forms and validation
- Recharts for charts
- MDX for guide articles (compiled at build time)
- next-themes for light/dark mode
- Vitest for unit tests
- Static generation for all content pages; the calculator runs fully client-side
- Deploy-ready for Vercel

Keep the calculation engine in a separate pure TypeScript module (`/lib/engine`) so it can be tested without the UI.

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: scaffold with one `create-next-app` command (project name `media-buying-planner`) and one combined `npm install` for all packages listed here. Do not add extra libraries.

## 3. Brand, theme and design

- **Logo:** create an SVG logo for "Media Buying Planner": a simple icon (e.g. an upward path or compass-style arrow combined with a bar chart) plus a wordmark. Provide a full version (icon + "Media Buying Planner"), a compact version (icon + "MB Planner") for mobile, and an icon-only version. Generate the favicon set, apple-touch icon and web manifest from the icon. The logo must work in light and dark mode.
- Modern, premium SaaS look. Clean layout, generous spacing, glassmorphism cards used with restraint, soft shadows, rounded corners (12 to 20px).
- Palette: deep navy / indigo base with one electric accent (cyan or violet) and clear success / warning / danger colours for verdicts. Define every colour as a CSS variable token.
- Typography: Inter or Plus Jakarta Sans for Latin scripts, IBM Plex Sans Arabic for Arabic, Noto Sans SC for Chinese. Load via next/font with fallbacks.
- **Light and dark mode:** follow system preference by default, with a header toggle that saves the choice. Design both themes fully. No flash of the wrong theme on load.
- **Hero section with modern animation:**
  - Slow-moving animated gradient mesh / aurora background
  - A floating 3D-tilt "mini dashboard" card that responds to mouse movement, showing a sample media buying plan with count-up budget numbers, a self-drawing line chart and a verdict badge that pops in
  - Headline and subheadline reveal word by word
  - Primary CTA "Build my media plan" with a subtle shimmer; secondary CTA "How it works"
  - Scroll-triggered fade/slide reveals for the following sections
- All animation respects `prefers-reduced-motion`.
- Micro-interactions: button hovers, tab transitions, tooltip fades, input focus glow.

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: build the logo as one SVG component with size and variant props, and a small set of shared animation variants and UI primitives (Button, Card, Tooltip, Tabs, Badge) once, reused everywhere.

## 4. Languages (every word translated)

Support 7 languages with locale-prefixed routes:

| Locale | Language | Direction |
|---|---|---|
| en | English (default) | LTR |
| es | Spanish | LTR |
| fr | French | LTR |
| de | German | LTR |
| ar | Arabic | RTL |
| pt | Portuguese | LTR |
| zh | Chinese (Simplified) | LTR |

Requirements:
- Every visible string comes from translation files: navigation, hero, sections, form labels, placeholders, tooltip ("i") texts, validation messages, toasts, results, the calculation view, articles, FAQs, legal pages, footer, cookie banner, 404/500 pages, meta titles and descriptions, image alt text. No hardcoded strings.
- **Exception:** the brand name "Media Buying Planner" stays in English in every language, including in Arabic and Chinese text. Store it once as a constant, not in translation files.
- Natural, professional translations, not word-for-word. Keep standard ad acronyms (CPM, CTR, CPC, CPL, CPA, CAC, ROAS) and explain them in the local language on first use and in tooltips.
- Arabic fully RTL: `dir="rtl"`, CSS logical properties, mirrored icons and arrows, charts readable in RTL.
- Format numbers, currencies, percentages and dates with `Intl` for the active locale.
- The language switcher keeps the user on the same page and keeps calculator inputs.
- Auto-detect browser language on the first visit only, then respect the user's choice.

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: in Phases 1 to 7 write English strings only. In Phase 8, translate one locale per session, reading only `en.json` and writing only the target locale file. Split translation files by namespace so each one stays small.

## 5. Site map and pages

Create all pages in all 7 languages:

| Route | Page |
|---|---|
| `/` | Home |
| `/calculator` | Planner (calculator) |
| `/features` | Features |
| `/how-to-use` | How to Use |
| `/guides` | Guides and Tips (article index) |
| `/guides/[slug]` | Article pages |
| `/faq` | FAQs |
| `/about` | About |
| `/services` | Services (planner features as services + expert opinion) |
| `/contact` | Contact |
| `/privacy-policy` | Privacy Policy |
| `/terms` | Terms of Use |
| `/disclaimer` | Disclaimer (results are estimates, not guarantees) |
| `/cookie-policy` | Cookie Policy |
| 404 / 500 | Custom error pages |

Header: Media Buying Planner logo, nav (Planner, Features, How to Use, Guides, FAQ, About, Contact), language switcher, theme toggle; sticky with blur on scroll; mobile slide-in menu with the compact logo.

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: create one shared page layout and one reusable content-page template, and build the simple pages (legal, about, services) from it.

## 6. Home page sections (in order)

1. Hero (section 3)
2. Trust strip: "Works for lead generation and ecommerce · Meta and Google Search · New or existing accounts · 7 languages"
3. **Features:** animated cards: Budget calculator, Lead funnel and CAC analysis, Ecommerce break-even and ROAS, New account test planner, Learning phase check, Scaling table, Budget split planner, Google search ceiling, Bottleneck finder, Show the calculation
4. **How to Use:** 4-step animated stepper: Choose your business type → Enter your numbers → Get your media plan → See the calculation
5. Planner preview with CTA
6. **Guides and Tips:** latest 3 articles
7. **FAQs:** accordion with the top 6 questions
8. **Support banner** (section 13)

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: drive the feature cards, steps and FAQ items from small data arrays mapped into one component each, not separate hand-written blocks.

## 7. Calculator: flow and inputs

### 7.1 Step 0: primary questions (before any form)

Large selectable cards, one question per screen, with a progress bar:

1. **Business type:** Lead generation / Ecommerce
2. **Account status:** New account / Has previous data
3. **Platforms:** Meta, Google Search (multi-select). Show Google Shopping/PMax, YouTube and TikTok as "Coming soon".
4. **Goal type:** Target number of results / Fixed monthly budget

The answers decide which tabs and fields appear. Users can change them later from a summary chip bar at the top of the form.

### 7.2 Tabs

Hide tabs and fields that don't apply to the selected mode.

1. Setup
2. Business Numbers
3. Account Data (only "Has previous data")
4. Estimates (only "New account")
5. Planning
6. Advanced Settings (collapsed, pre-filled defaults)

Every field has: label, "i" icon with a tooltip (hover, focus and tap), unit or suffix, example placeholder, required/optional marker and inline validation. Tooltips explain what the field means, where to find the number (e.g. "Ads Manager → Columns → Performance") and why it matters.

### 7.3 Tab 1: Setup

| Field | Type | Tooltip guidance |
|---|---|---|
| Niche | Searchable select grouped by profile: Ecommerce (fashion, beauty products, electronics, home, other), Lead-gen services (beauty clinic, body contouring, dental, real estate, legal, education, other), Messaging/booking services | Sets default benchmarks and seasonality |
| Region(s) | Multi-select countries | Ad costs vary a lot by country |
| Planning month | Month picker | Used for seasonal cost changes |
| Currency | Select, auto-suggested from region | All money fields use this |
| Target new clients / sales per month | Integer | Only if goal = target |
| Monthly budget available | Currency | Only if goal = fixed budget |

### 7.4 Tab 2: Business Numbers

**Lead generation:**

| Field | Type | Tooltip guidance |
|---|---|---|
| Average client value | Currency | What a new client pays (package or first purchase) |
| Margin % | 1–100 | Profit after delivering the service, before ads |
| Booking rate % | 0–100 | Share of leads who book a call or consultation |
| Show-up rate % | 0–100 | Share of bookings who attend |
| Close rate % | 0–100 | Share of attendees who buy |
| Source of these rates | CRM data / Client's estimate / Default | Sets confidence level |
| Lead source | Instant form / Landing page / Both | Instant forms are cheaper but usually book less |

**Ecommerce:**

| Field | Type | Tooltip guidance |
|---|---|---|
| Average order value | Currency | Use main product or bundle price for a new store |
| Product cost per order | Currency | |
| Shipping cost per order | Currency | |
| Payment fees % | 0–20 | |
| Return rate % | 0–80 | Important for fashion |
| Orders per customer (optional) | Number ≥ 1 | For lifetime value |
| Judge profit on | First order / Lifetime value | Default: first order |

### 7.5 Tab 3: Account Data (has previous data)

- Date range (days), 7–365
- **Meta campaign rows** (add/remove): campaign name, budget type (CBO / ABO / Advantage+), number of ad sets, ad sets getting meaningful spend (CBO only)
- **Meta performance** (one row per country, add/remove): amount spent, impressions, reach, link clicks, landing page views, then by mode:
  - Leads: instant form leads, landing page leads, and from CRM: bookings, shows and clients (per lead source if both ran)
  - Ecommerce: add to carts, checkouts initiated, purchases, purchase value
- Retargeting audience size (site visitors + engagers, last 30 days), optional
- **Google Search performance:** cost, impressions, clicks, conversions, conversion value (ecom), search impression share %, search lost IS (budget) %, search lost IS (rank) %, brand searches exist? (yes/no)
- **CSV import:** upload a Meta Ads Manager or Google Ads export, auto-map columns, let the user confirm the mapping, then fill the fields

### 7.6 Tab 4: Estimates (new account)

Each field has a **source label**: Your accounts / Meta estimate / Published benchmark / Guess.

**Meta:** CPM, CTR (link) %, landing page conversion rate % (hidden for instant forms), instant form completion rate % (instant forms only), add to cart → purchase rate % (ecommerce only), optional Meta "Estimated daily results" (min, max, daily budget used) as a cross-check.

**Google Search:** main keywords (tags, optional), monthly search volume, top-of-page bid low and high (from Keyword Planner), expected impression share %, expected CTR %, expected conversion rate %, brand searches exist? (yes/no).

A **"Use my benchmarks"** button fills these from the benchmark library (7.9).

### 7.7 Tab 5: Planning

Planned number of Meta ad sets, number of creatives to test, test duration in days (new account, default 14), include retargeting (yes/no).

### 7.8 Tab 6: Advanced Settings (editable defaults)

| Setting | Default |
|---|---|
| Meta learning threshold (results per ad set per week) | 50 |
| Google smart bidding minimum conversions per campaign per 30 days | 30 (tooltip: check Google's current guidance) |
| Cost increase per doubling of spend | 15% |
| Profit buffer | 25% |
| New account penalty | 25% |
| Creative testing spend per creative | 2.5 × target CPA |
| Scale threshold | ≤ 70% of break-even |
| Stop-loss | 2 to 3 × break-even with no results |
| Minimum results for confident data | 50 |
| Retargeting views per person per month | 8 |
| Retargeting cap | 20% of platform budget |
| Minimum retargeting audience | 1,000 |
| Brand campaign share of Google budget | 10% |
| Max budget increase per step | 20% every 3 days |
| Range multipliers by source (low / high) | Your accounts 0.85/1.2 · Meta estimate 0.8/1.3 · Published 0.8/1.4 · Guess 0.7/1.6 |
| Seasonal CPM multipliers by month and profile | 1.0 for all months; placeholders for ecommerce Nov 1.3 and Dec 1.2, marked as editable estimates |
| Default benchmarks per niche, region and platform | Placeholder values in one JSON file, marked to be replaced with real data |

"Reset to defaults" button.

### 7.9 Benchmark library

A "My benchmarks" panel where the user saves rows from their own accounts: niche, region, platform, month, CPM, CTR, conversion rate, CPL/CPA. Stored in localStorage. When used, the engine averages the most recent matching rows (same niche + region + platform) and labels the source "Your accounts".

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: define all fields once in a single typed config file (id, type, unit, validation, tooltip key, which modes show it) and render every tab from that config with one generic field component. Do not hand-write each field.

## 8. Form: validation and advanced features

- Zod schemas per mode; validate on blur and on submit; translated inline errors.
- Hard errors (block calculation):
  - Required fields empty, negative numbers, percentages outside 0–100
  - Reach > impressions, clicks > impressions, landing page views > clicks
  - Bookings > leads, shows > bookings, clients > shows
  - Product cost + shipping + fees + returns ≥ AOV
  - Ad sets getting spend > number of ad sets
- Soft warnings (allow calculation): purchases > checkouts, CTR above 10%, conversion rate above 50%, frequency above 5, fewer than 50 results in the period.
- Tab badges show error/warning counts; "Next" moves through tabs; Calculate stays disabled until there are no hard errors.
- Autosave inputs to localStorage, with "Clear all" and "Load example data" (one example per mode, using the fixtures in 9.9).
- Save named scenarios and compare up to 3 side by side.
- Share link: encode inputs in the URL hash (no server storage).
- Number inputs with thousand separators, currency prefix and keyboard-friendly steppers.
- Fully keyboard accessible and labelled for screen readers.

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: build one base Zod schema and extend it per mode. Put all cross-field rules in one refine function, not scattered across components.

## 9. Calculation engine (`/lib/engine`)

Pure functions, fully typed, unit tested. Constants: weeks per month = 4.345, days per month = 30.4.

### 9.1 Business limits

**Leads:**

    profitPerClient = clientValue × margin
    leadToClient    = bookingRate × showRate × closeRate
    maxCAC          = profitPerClient
    targetCAC       = maxCAC ÷ (1 + profitBuffer)
    maxCPL          = maxCAC × leadToClient
    targetCPL       = targetCAC × leadToClient

**Ecommerce:**

    profitPerOrder = AOV − productCost − shipping − (AOV × paymentFee) − (AOV × returnRate)
    breakEvenCPA   = profitPerOrder (× ordersPerCustomer if judging on lifetime value)
    breakEvenROAS  = AOV ÷ profitPerOrder
    targetCPA      = breakEvenCPA ÷ (1 + profitBuffer)

### 9.2 Existing account metrics (per platform, per country row, and totals)

    CPM = spend ÷ impressions × 1000
    CTR = linkClicks ÷ impressions
    CPC = spend ÷ linkClicks
    CVR = results ÷ linkClicks
    CPA (or CPL) = spend ÷ results
    ROAS = purchaseValue ÷ spend   (leads: clients × clientValue ÷ spend)
    Frequency = impressions ÷ reach
    Monthly base spend = spend ÷ days × 30.4
    Leads funnel: bookingRate, showRate, closeRate, costPerBooking, costPerShow, CAC = spend ÷ clients

With more than one country, calculate each separately and warn that a blended number can mislead.

### 9.3 Data confidence

    w = min(results ÷ minResultsForConfidence, 1)
    workingCPA = w × actualCPA + (1 − w) × benchmarkCPA

If there's no benchmark and results are below the minimum, use the actual CPA and show a low-confidence warning.

### 9.4 Scaling projection (diminishing returns)

    projectedCPA(S) = baseCPA × (1 + scalingPenalty) ^ log2(S ÷ baseSpend)   for S > baseSpend
    projectedCPA(S) = baseCPA                                               for S ≤ baseSpend
    projectedResults(S) = S ÷ projectedCPA(S)

Find the budget for a target with binary search on projectedResults(S) = target.
For leads, target results = targetClients ÷ leadToClient.

### 9.5 Learning-phase check

Effective ad sets per Meta campaign: ABO = all ad sets; CBO = ad sets getting spend; Advantage+ = 1.

    resultsPerAdSetPerWeek = monthlyResults ÷ weeksPerMonth ÷ effectiveAdSets
    floorPerMonth(n)       = learningThreshold × projectedCPA × n × weeksPerMonth
    supportedAdSets        = max(1, floor(weeklyProspectingBudget ÷ (learningThreshold × projectedCPA)))

Rules:
- Goal budget ≥ floor for 1 ad set: fine, recommend supportedAdSets.
- Below: don't force the budget up. Recommend 1 ad set and a broad audience, and show "Learning limited is acceptable if cost per result stays on target". For ecommerce, also suggest optimizing for Add to Cart.
- Google: check each campaign gets at least the smart bidding minimum conversions per 30 days.

### 9.6 New account estimates

    Meta landing page: estimatedCPL = CPM ÷ (1000 × CTR × landingPageCVR)
    Meta instant form: estimatedCPL = CPM ÷ (1000 × CTR × formCompletionRate)
    Ecommerce:         estimatedCPA = CPM ÷ (1000 × CTR × siteCVR)
    expected = estimated × (1 + newAccountPenalty) × seasonalMultiplier
    low / high = expected × range multipliers of the lowest-confidence source used

Decision-first outputs (the headline for new accounts):

    Leads test budget     = learningThreshold × maxCPL      ("up to")
    Ecommerce Option A    = learningThreshold × breakEvenCPA
    Ecommerce Option B    = recommended when the budget is below Option A:
                            optimize for Add to Cart in week 1, then switch to Purchase
                            guide: maxCostPerATC = breakEvenCPA × ATC→purchase rate (labelled as an estimate)
    Test daily budget     = test budget ÷ test duration days
    Creative check        = creatives × 2.5 × target CPA (warn if larger than the test budget)
    Stop-loss             = 2 to 3 × max CPL / break-even CPA with no results
    Decision rules after the test:
        real cost ≤ scaleThreshold × max  → Scale (switch to "has data" mode)
        between scaleThreshold and max    → Optimize and retest
        above max                         → Stop and fix offer, price or funnel
    Scale estimate (secondary, labelled "Estimate: replaced after test"):
        requiredResults × low / expected / high cost
    Viability: Viable (high ≤ max) / Risky (expected ≤ max < high) / Not viable (expected > max)
    Biggest assumption: name the input with the lowest-confidence source
    Leads warning: test leads × leadToClient = clients from the test (usually too few to confirm close rate)

### 9.7 Google Search model

New account:

    availableImpressions = monthlySearches × expectedImpressionShare
    maxClicks      = availableImpressions × CTR
    maxResults     = maxClicks × CVR
    avgCPC         = (bidLow + bidHigh) ÷ 2
    maxUsefulSpend = maxClicks × avgCPC

Existing account:

    extraImpressions = impressions × (lostISBudget ÷ searchImpressionShare)
    extraSpend       = extraImpressions × CTR × currentCPC
    ceiling          = current monthly spend + extraSpend
    Above the ceiling, apply the scaling penalty (rank-limited, CPC rises)

Always show "maximum available results" for Google.

### 9.8 Budget split

1. **Platform minimums:** Meta = 10 results per week × CPA × weeksPerMonth; Google = smart bidding minimum × CPA. If the total can't cover every selected platform's minimum, put everything on the platform with the lowest expected CAC/CPA and explain why.
2. **Has data:** allocate in steps (step = max(50, total ÷ 100)). Each step goes to the platform with the lowest marginal cost per result at its current allocation (Δspend ÷ Δresults from its projection curve). Google stops receiving steps at its ceiling.
3. **New account defaults:** Leads → Google Search first up to maxUsefulSpend, rest to Meta. Ecommerce → Meta first, Google smaller share. Low search volume → mostly Meta.
4. **Within Meta:** creative testing = creatives × 2.5 × target CPA; retargeting = audience × views per month × CPM ÷ 1000, capped at the retargeting cap, zero if the audience is below the minimum or the account is new ("add after 2 to 4 weeks"); prospecting = remainder.
5. **Within Google:** brand campaign = brand share (only if brand searches exist); non-brand = remainder.
6. **Ramp schedule:** from current daily spend (or test daily budget) to target daily spend, increasing by no more than the max step every 3 days. List the steps.
7. Every split line carries a short translated "why" reason.

Leads: compare platforms on CAC, never on CPL alone. Ecommerce: compare on CPA and ROAS.

### 9.9 Test fixtures (must pass)

- **Existing leads:** 30 days, spend 2,000, leads 80, bookings 32, shows 22, clients 13, client value 600, margin 60%, target 25 clients, penalty 15%.
  Expect: CPL 25.00, CAC ≈ 153.85, leadToClient ≈ 16.25%, maxCPL ≈ 58.5, required leads ≈ 154, budget ≈ 4,550, projected CPL ≈ 29.5.
- **Existing ecommerce:** 30 days, spend 3,000, impressions 250,000, reach 90,000, link clicks 3,750, purchases 100, value 9,000, AOV 90, margin 50%, buffer 25%, target 200.
  Expect: CPM 12, CTR 1.5%, CPA 30, ROAS 3.0, frequency ≈ 2.78, break-even CPA 45, target CPA 36, budget ≈ 7,150.
- **New leads:** CPM 20, CTR 1.2%, landing page CVR 8%, penalty 25%, booking 35%, show 65%, close 50%, client value 600, margin 60%.
  Expect: estimated CPL ≈ 20.83, expected ≈ 26.04, maxCPL ≈ 40.95, test budget ≈ 2,047.
- **New ecommerce:** AOV 60, product cost 18, shipping 5, fees 3%, returns 10%.
  Expect: profit per order 29.20, break-even ROAS ≈ 2.05, Option A test ≈ 1,460, scale threshold ≈ 20.44.

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: write the engine as small pure functions in a few files (limits, metrics, projection, learning, estimates, google, split). Write the 4 fixture tests first, run only the engine test folder, and fix only failing functions.

## 10. Results screen

Title the results "Your Media Buying Plan". Animated, modern and easy to read. Order:

1. **Headline card:** recommended monthly budget (count-up), daily budget, low–high range. New accounts: "What you can afford" + test plan first, scale estimate below with an "Estimate" tag.
2. **What it delivers:** animated funnel (leads → bookings → clients, or visits → carts → purchases → revenue) with ranges.
3. **Costs:** CPL/CPA, CAC, ROAS as metric cards.
4. **Verdict badge:** Profitable, room to scale / Optimize first / Not viable, with break-even numbers.
5. **Budget split:** animated donut + table with the "why" for each line, plus the ramp schedule.
6. **Bottleneck finder (leads with data):** weakest stage and the budget saved if it improves by 10 percentage points.
7. **Account health (with data):** CPM, CTR, CVR, frequency with green/amber/red flags.
8. **Scaling table + chart:** budget vs results vs CAC/CPA, with the profitable limit marked.
9. **Decision rules and stop-loss (new accounts).**
10. **Warnings:** learning phase, Google ceiling, low confidence, seasonality, multi-country blending, double counting across platforms ("use your CRM or store as the source of truth").
11. **Support banner** (section 13).
12. Actions: Export PDF titled "Media Buying Plan" with the Media Buying Planner logo, date and a "results are estimates" note; copy share link; save scenario; recalculate.

Staggered reveals, count-up numbers, bars and donut animating into view. Respect reduced motion.

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: build one generic MetricCard, one Funnel and one Chart wrapper, and render all result blocks from the engine's output object. Lazy-load the charts and PDF export.

## 11. "Show the calculation" view

A clear toggle under the headline: "See how we calculated this". When on, show a vertical timeline of step cards. Each card has:

- Step number and title (e.g. "Step 3: What you can afford per lead")
- One plain-language sentence explaining the step
- The formula with readable names
- The same formula with the user's numbers filled in
- The result as a highlighted chip
- Colour tags on each value: Your input (blue) / Assumption (amber) / Setting (grey), plus the source label

Long steps collapsed by default. "Expand all" and a mini progress rail. Fully translated and RTL-ready.

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: have each engine function return its own step record (title key, formula key, inputs, result), so this view simply maps over the steps. Do not write a separate explanation for each mode.

## 12. Guides and Tips (articles)

10 MDX articles, each 1,200–1,800 words, SEO-optimized (H1, H2/H3 structure, FAQ block at the end, internal links to the planner and related guides, a "Try it in Media Buying Planner" CTA box).

Each article shows a byline and credit: **"Guide by TECH24"** linking to https://tech24.cc, plus an author box "Written by the TECH24 team" with the same link.

1. How to calculate a Meta ads budget for a new ad account
2. Lead generation budgets: from cost per lead to cost per client (CAC)
3. Ecommerce break-even CPA and ROAS explained, including returns and fees
4. The Meta learning phase: why 50 results per ad set matters (CBO, ABO, Advantage+)
5. Scaling ad spend: why costs rise as budget grows
6. Meta vs Google Search: how to split your budget
7. Planning a test budget and the decision rules after it
8. Seasonality: how Q4 and peak months change your ad costs
9. Where to find CPM, CTR and conversion rate benchmarks before you launch
10. Finding the bottleneck in your lead funnel (booking, show-up and close rates)

Guides index: search, category filter, reading time, cards with original SVG cover illustrations (no stock photos of people).

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: write English articles in this phase, 2 to 3 articles per session. Use one shared MDX layout, byline and CTA component. Generate cover SVGs from one template with different icons and colours, not 10 separate drawings.

## 13. Support banner

Full-width animated banner (gradient border, subtle motion) on Home, after planner results, and at the end of every article:

- Tagline: "Your numbers are in. Want a pro to check them?"
- Subline: "Get an expert opinion on your budget, funnel and scaling plan."
- Button: "Get an expert opinion" → https://alijohar.work (new tab, `rel="noopener"`)

Translate all text.

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: build it once as a single component with an optional variant prop, and import it in the 3 places.

## 14. Footer

Three zones (stacks on mobile, mirrors in RTL):

- **Left:** Media Buying Planner logo, the translated tagline, and an "Expert opinion" link with short text ("Need a second pair of eyes on your budget?") → https://alijohar.work
- **Middle:** quick links: About, Services, Guides, FAQ, Contact, Privacy Policy, Terms, Disclaimer, Cookie Policy
- **Right:** all feature services as links: Lead budget calculator, Ecommerce budget calculator, New account test planner, Learning phase check, Scaling table, Budget split planner, Google search ceiling, Bottleneck finder. Below them: **"Free QR Code Generator"** → https://www.qrcodegenerator.us/
- **Bottom bar:** © [YEAR] Media Buying Planner · "Guides by TECH24" → https://tech24.cc · language switcher · theme toggle

External links open in a new tab with `rel="noopener"`.

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: keep all footer and header links in one shared navigation config file used by both.

## 15. Pages content

- **About:** what Media Buying Planner does, the methodology in plain language (business numbers set the limits, data or tests find the real cost), that results are estimates, credit to TECH24 for guides, expert opinion link.
- **Services:** one section per planner feature with icon, short description and "Use it" button; final section "Expert opinion" linking to alijohar.work.
- **Features:** detailed version of the home features with small animated illustrations.
- **How to Use:** step-by-step guide with illustrations of each tab and a short "where to find each number" table for Meta Ads Manager and Google Ads.
- **FAQ:** at least 15 questions, e.g. "Is the result guaranteed?", "What if I have no previous data?", "Why is the learning phase per ad set?", "Why compare platforms on CAC instead of CPL?", "Does it work for Google Ads?", "Where do I find impression share?", "Is my data stored?" (answer: inputs stay in your browser).
- **Contact:** form (name, email, message) with server-side validation, honeypot, Cloudflare Turnstile, rate limiting, success/error toasts. Sends to [EMAIL].
- **Legal pages:** privacy (no account data leaves the browser except the contact form; analytics only with consent), terms, disclaimer, cookie policy. Use "Media Buying Planner" as the service name throughout.
- Translated cookie consent banner, required before loading any analytics (GA4 optional, via env variable).

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: keep page copy short and scannable. Reuse the feature data array from the home page for Features and Services instead of rewriting the same content.

## 16. SEO

- Unique translated `<title>` and meta description for every page in every language.
- **Title patterns** (brand name stays in English, the rest is translated):
  - Home: "Media Buying Planner | Ad Budget Calculator for Meta and Google Ads"
  - Planner: "Ad Budget Calculator and Media Buying Plan | Media Buying Planner"
  - Inner pages: "[Page title] | Media Buying Planner"
  - Articles: "[Article title] | Media Buying Planner Guides"
- Canonical URLs; `hreflang` alternates for all 7 locales plus `x-default`.
- Open Graph and Twitter cards with generated OG images per page and article, showing the Media Buying Planner logo.
- JSON-LD: Organization (name "Media Buying Planner", logo), WebSite, WebApplication / SoftwareApplication (name "Media Buying Planner", free), FAQPage (FAQ page and article FAQs), Article (guides, publisher TECH24 credited as author), BreadcrumbList (inner pages).
- Semantic HTML: one H1 per page, logical headings, descriptive alt text and link text.
- All content rendered as static HTML so search engines can read it.
- Target keywords per page: "media buying planner", "media buying plan", "ad budget calculator", "Meta ads budget calculator", "Facebook ads budget calculator", "Google Ads budget calculator", "cost per lead calculator", "break-even ROAS calculator", plus translated equivalents.
- Clean URL slugs (translated slugs for articles).
- **sitemap.xml** via `app/sitemap.ts`: every page and article in every locale, with `alternates.languages` and `lastModified`.
- **robots.txt** via `app/robots.ts`: allow all, disallow `/api/`, include the sitemap URL.
- Core Web Vitals: Lighthouse 90+ on all four categories, mobile and desktop.

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: build one `buildMetadata()` helper and one JSON-LD helper, and call them from each page. Generate OG images from one dynamic template route.

## 17. Security

**Real protection (required):**
- Security headers via middleware/next.config: strict Content-Security-Policy with nonces, Strict-Transport-Security, X-Content-Type-Options: nosniff, frame-ancestors 'none' (and X-Frame-Options: DENY), Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy disabling camera, microphone and geolocation.
- No `eval`, no `dangerouslySetInnerHTML` with user input; all inputs parsed as numbers and validated with Zod on client and server.
- Contact API route: server-side validation, Turnstile, honeypot, per-IP rate limiting, generic error messages.
- No secrets in client code; env variables on the server only.
- Production source maps disabled; code minified.
- `npm audit` clean; lockfile committed.
- Share links contain only planner inputs, never personal data.

**Copy and inspect deterrents (required, must not break the site):**
- Disable the right-click menu on content areas.
- Disable text selection and copy/cut on content and articles, showing a small translated toast "This content is protected".
- Keep selection, copy and paste working inside form inputs.
- Block common shortcuts: F12, Ctrl/Cmd+Shift+I/J/C, Ctrl/Cmd+U, Ctrl/Cmd+S.
- Disable image dragging.
- Add a subtle "Media Buying Planner" watermark to exported PDFs.
- Must not affect keyboard navigation, screen readers or search engine crawling.

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: put all headers in one middleware/config file and all deterrents in one small client hook mounted once in the root layout.

## 18. Performance and accessibility

- Static generation for content pages; lazy-load charts and the hero effect; code-split the planner.
- next/image (AVIF/WebP); SVG illustrations preferred.
- WCAG 2.1 AA: contrast in both themes, focus states, ARIA for tabs, tooltips and accordions, skip-to-content link.
- Responsive from 360px wide.

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: run Lighthouse once per page type (home, planner, article, content page), not every page, and fix only items scoring below 90.

## 19. Deliverables checklist

- [ ] Complete Next.js project `media-buying-planner` with README (setup, env variables, deploy steps)
- [ ] Media Buying Planner logo set, favicons and web manifest
- [ ] All pages in 7 languages, Arabic fully RTL, brand name kept in English
- [ ] Planner with Step 0, 6 tabs, tooltips, validation, CSV import, autosave, scenarios, share link
- [ ] Engine module with passing unit tests for all fixtures in 9.9
- [ ] Animated "Your Media Buying Plan" results screen + "Show the calculation" view
- [ ] 10 guide articles in 7 languages with TECH24 credit
- [ ] Support banner and footer links exactly as specified
- [ ] sitemap.xml, robots.txt, structured data, hreflang
- [ ] Security headers and deterrents
- [ ] Light and dark mode, reduced-motion support
- [ ] Lighthouse 90+ in all categories

**⚡ Credit saver:** Do only this phase's work, read only the files and brief sections it needs, edit instead of rewriting, and report in 5 lines max. Section tip: tick items off in PROGRESS.md as each phase finishes, and in Phase 9 check only the unticked items.
