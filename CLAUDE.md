# Media Buying Planner (`media-buying-planner`)
Brand "Media Buying Planner" (never translated, constant in `lib/brand.ts`). Short name "MB Planner".
Tagline (translated): "Ad budget calculator and media buying planner for Meta and Google".
Domain: [DOMAIN] · Contact: [EMAIL] · Never use em dashes in site copy. Full brief: `docs/BRIEF.md`.

## Stack
Next.js App Router + TS strict · Tailwind v4 (tokens as CSS vars in `app/globals.css`) · Framer Motion ·
next-intl (7 locales: en default, es, fr, de, ar RTL, pt, zh) · RHF + Zod · Recharts · MDX · next-themes · Vitest · Vercel.

## Folders
- `app/[locale]/` pages (locale-prefixed) · `app/` root files (manifest, icons, globals.css)
- `components/ui/` primitives (Button, Card, Tooltip, Tabs, Badge) · `components/brand/Logo.tsx`
- `components/` shared (ThemeToggle, providers) · `lib/motion.ts` animation variants · `lib/format.ts` Intl helpers
- `lib/engine/` pure calculation engine (no UI imports) + tests
- `i18n/` routing + request config · `messages/<locale>/<namespace>.json` (split by namespace)
- `docs/` BRIEF.md, PROGRESS.md

## Phases (one per session, stop and wait for "continue")
1 Scaffold, logo, tokens, theme, i18n (EN) [§2,3,4] · 2 Engine + tests [§9] · 3 Calculator form [§7,8]
4 Results + calculation view [§10,11] · 5 Pages, header, footer, banner, home [§5,6,13,14,15]
6 SEO + security [§16,17] · 7 English guides [§12] · 8 Translations, one locale per session [§4]
9 Performance, a11y, QA [§18,19]

## Credit-saver rules
- Read only the phase's brief sections. Read CLAUDE.md + docs/PROGRESS.md instead of exploring.
- Open only files you will change; never reread files in context; large files in line ranges.
- Targeted edits, never full rewrites. No code/diffs in chat; report in 5 lines max.
- Check package.json before installing; one install command per phase.
- Build, lint, tests once at phase end; only related test files.
- Failing command: fix once, rerun; fails twice, stop and report.
- Reuse components; no near-duplicates. No browser/screenshots/Lighthouse before Phase 9.
- Unclear: pick the simplest sensible choice, note it in PROGRESS.md, continue.
- Update docs/PROGRESS.md at end of each phase (10 lines max).
