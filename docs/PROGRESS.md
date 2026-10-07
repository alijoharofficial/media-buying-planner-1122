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

## Deliverables
- [x] Engine module with passing unit tests for all fixtures in 9.9
- [x] Logo set, favicons and web manifest
- [x] Light and dark mode, reduced-motion support (base)
