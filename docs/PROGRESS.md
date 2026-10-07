# Progress

## Phase 1: Scaffold, logo, tokens, theme, i18n (done)
- Done: Next 16 App Router + TS strict, Tailwind v4 tokens (light/dark CSS vars), next-themes (system default, saved, no flash), next-intl 7 locales (en strings only), fonts (Plus Jakarta Sans / IBM Plex Sans Arabic / Noto Sans SC), logo set, favicons, manifest, UI primitives, motion variants, Intl format helpers, placeholder home.
- Files: `app/[locale]/{layout,page}.tsx`, `app/{layout.tsx,globals.css,icon.svg,apple-icon.tsx,manifest.ts,pwa-icon/[size]/route.tsx}`, `proxy.ts`, `i18n/{routing,request,navigation}.ts`, `messages/en/{common,home}.json`, `components/{Providers,ThemeToggle,LanguageSwitcher}.tsx`, `components/brand/Logo.tsx`, `components/ui/{Button,Card,Badge,Tooltip,Tabs}.tsx`, `lib/{brand,cn,fonts,format,motion,icon-png}.ts(x)`, configs.
- Decisions: Scaffolded by hand (Bash was briefly unavailable) instead of create-next-app; same result. Next 16 uses `proxy.ts` (was middleware). `app/icon.svg` is the single logo-mark source; PNGs (apple 180, PWA 192/512/maskable) render from it via next/og. No `.ico` (SVG + PNG cover modern browsers).
- Decisions: messages split per namespace (`namespaces` list in `i18n/routing.ts`); missing locale files fall back to English until Phase 8. Language switcher keeps path, query and hash. Brand constants in `lib/brand.ts`; `NEXT_PUBLIC_SITE_URL` env sets the domain.
- Decisions: Framer Motion `MotionConfig reducedMotion="user"` + global CSS reduced-motion rule. Accent is cyan (#0891b2 light, #22d3ee dark) on deep indigo.
- Next: Phase 2, calculation engine in `lib/engine` + Vitest fixtures (brief section 9).

## Phase 2: Calculation engine (done)
- Done: pure engine in `lib/engine` (limits, metrics, confidence, projection, learning, estimates, google, split, plan orchestrator `buildPlan()`), step records for the calculation view, mode fixtures, 18 Vitest tests (all 4 brief fixtures pass).
- Files: `lib/engine/{types,constants,steps,limits,metrics,confidence,projection,learning,estimates,google,split,plan,fixtures,index}.ts`, `lib/engine/__tests__/{fixtures,split}.test.ts`; `vitest.config.ts` renamed `.mts`.
- Decisions: engine uses ratios (0.25 = 25%); form converts. Monthly base spend uses spend ÷ days × 30.4 per brief, so fixture budgets land ~0.4% under the brief's rounded values (4,527 vs 4,550; 7,130 vs 7,150); tests use 1% tolerance.
- Decisions: CRM funnel (bookings > 0) overrides rate inputs for existing lead accounts. Ecommerce "margin" in fixtures = product cost. Seasonality applied to new-account Meta costs only; existing accounts get an info warning. New-account Google CPA = avg CPC ÷ CVR × (1 + penalty). New ecommerce gives Google 20% (capped at max useful spend).
- Decisions: a platform whose share falls below its own minimum moves to the other platform (covers "low search volume → mostly Meta"). Google learning check counts 1 non-brand campaign. Health thresholds and step translation keys (`steps.<id>.*`, `split.reasons.*`, `warnings.<code>`) are defined for Phase 3/4 copy.
- Next: Phase 3, calculator form (brief sections 7, 8).

## Phase 3: Calculator form (done)
- Done: `/calculator` page with Step 0 (4 card questions, progress bar), summary chips, 6 mode-aware tabs with error/warning badges, Next/Back, Calculate (disabled while hard errors exist; "Show issues" link jumps to the first one), tooltips on every field, autosave, example data per mode, clear all, named scenarios + compare up to 3, URL-hash share link, CSV import with column mapping, My benchmarks library + "Use my benchmarks", seasonal grid, reset defaults. Minimal results card until Phase 4.
- Files: `lib/planner/{types,fields,options,validation,convert,storage,csv}.ts` + `__tests__/validation.test.ts`, `components/planner/{Planner,Step0,SummaryChips,TabPanel,Field,inputs,RowsEditor,CsvImport,BenchmarkPanel,ScenarioPanel,context}.tsx`, `components/ui/Toast.tsx`, `data/benchmarks.json`, `messages/en/planner.json`, `app/[locale]/calculator/page.tsx`.
- Decisions: every field is defined once in `lib/planner/fields.ts`; tabs, the generic Field and the Zod schema (base Step 0 schema `.extend()`ed per mode) are generated from it. Cross-field rules live in one `crossFieldRules()`; soft warnings in `softWarnings()`. Form stores percentages as 0 to 100; `toPlanInput()` converts.
- Decisions: RHF holds values; validation runs on every change for badges, inline messages show after blur or a calculate attempt. Existing lead accounts use CRM funnel rows, so booking/show/close inputs are optional there. Per-lead-source CRM split (when both sources ran) is not modelled: rows sum both sources. Toasts added globally (reused for Phase 6 deterrent toast).
- Decisions: "Use my benchmarks" averages the 3 most recent matching rows, else falls back to the placeholder JSON (source "Published benchmark"). Existing accounts blend low-volume data with the placeholder benchmark CPA.
- Next: Phase 4, results screen + "Show the calculation" view (brief sections 10, 11).

## Phase 4: Results + calculation view (done)
- Done: "Your Media Buying Plan" results in brief order: headline (count-up, range; new accounts show test plan first + scale estimate tagged "Estimate"), funnel, cost cards + verdict, split donut + why table + ramp, bottleneck, account health, scaling chart + table with profitable limit, decision rules/stop-loss, warnings, support banner, actions (PDF, share, save, recalculate). "See how we calculated this" timeline with formula, filled formula, colour tags, sources, collapse/expand all, progress rail.
- Files: `components/results/{Results,CalcView,Charts,Funnel,MetricCard,CountUp,useFormat}.tsx`, `components/SupportBanner.tsx`, `messages/en/results.json`, `lib/engine/__tests__/messages.test.ts`; engine adds `funnel` output, lead rates in limits, distinct step ids per variant.
- Decisions: PDF export uses the browser print dialog (Save as PDF) with a print stylesheet: plan only, logo, date, "estimates" note and a "Media Buying Planner" watermark. No PDF library was added (brief forbids extra libraries). Charts are lazy-loaded via next/dynamic.
- Decisions: formulas are one template per step (`results.steps.<id>.formula`) rendered twice: names, then tagged values. Scaling chart shows one measure (cost per result) on one axis with break-even and profitable-limit lines; the table carries results/CAC/ROAS. Chart colours use the validated categorical palette (`--series-1..5`); the split table doubles as legend and data table.
- Decisions: support banner built now (Phase 5 reuses it). A test asserts every step, value, warning, split reason and funnel stage the engine can emit has English copy.
- Next: Phase 5, pages, header, footer, support banner placement, home sections (brief sections 5, 6, 13, 14, 15).

## Phase 5: Pages, header, footer, home (done)
- Done: sticky blur header + RTL-aware mobile slide-in menu, 3-zone footer + bottom bar, cookie consent (GA4 only after consent), home (aurora canvas hero, word reveal, 3D-tilt dashboard, trust strip, features, stepper, planner preview, latest guides, top-6 FAQ, support banner), Features, How to Use (tab illustrations + where-to-find table), Guides index (cards with generated covers), FAQ (17), About, Services (anchors for footer links + expert section), Contact (form + `/api/contact`), 4 legal pages, localized 404 (catch-all) and 500 pages.
- Files: `lib/{site,metadata,contact}.ts`, `components/layout/{Header,Footer,CookieConsent}.tsx`, `components/content/{Reveal,ContentPage,LegalPage,FeatureGrid,FaqAccordion,HowStepper,GuideCard,ContactForm,ErrorView}.tsx`, `components/home/{Hero,AuroraCanvas}.tsx`, `components/ui/Icon.tsx`, all `app/[locale]/*` pages, `app/api/contact/route.ts`, `app/global-error.tsx`, messages `features, faq, guides, pages, legal` + common/home updates, `.env.example`.
- Decisions: one shared nav/feature/FAQ/guide config (`lib/site.ts`) drives header, footer, home, Features and Services. Brand never appears in message files: `{brand}` placeholders are filled from `lib/brand.ts`. Guide links 404 until Phase 7 writes the MDX articles; search/filter/reading time also land in Phase 7.
- Decisions: contact API fails closed in production without `TURNSTILE_SECRET_KEY` / `RESEND_API_KEY` + `CONTACT_FROM_EMAIL` (accepts and logs in development). Email via Resend REST (no extra library). Rate limit is in-memory per instance (5 per 10 min per IP). Honeypot submissions get a silent success. `global-error.tsx` is the one page without translations (root layout failed), so it shows brand, code and a reload icon only.
- Next: Phase 6, SEO (buildMetadata, hreflang, OG images, JSON-LD, sitemap, robots) and security (CSP nonces, headers, deterrents) (brief sections 16, 17).

## Deliverables
- [x] Animated "Your Media Buying Plan" results screen + "Show the calculation" view
- [x] Engine module with passing unit tests for all fixtures in 9.9
- [x] Logo set, favicons and web manifest
- [x] Light and dark mode, reduced-motion support (base)
