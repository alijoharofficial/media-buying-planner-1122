# Progress

## Phase 1: Scaffold, logo, tokens, theme, i18n (done)
- Done: Next 16 App Router + TS strict, Tailwind v4 tokens (light/dark CSS vars), next-themes (system default, saved, no flash), next-intl 7 locales (en strings only), fonts (Plus Jakarta Sans / IBM Plex Sans Arabic / Noto Sans SC), logo set, favicons, manifest, UI primitives, motion variants, Intl format helpers, placeholder home.
- Files: `app/[locale]/{layout,page}.tsx`, `app/{layout.tsx,globals.css,icon.svg,apple-icon.tsx,manifest.ts,pwa-icon/[size]/route.tsx}`, `proxy.ts`, `i18n/{routing,request,navigation}.ts`, `messages/en/{common,home}.json`, `components/{Providers,ThemeToggle,LanguageSwitcher}.tsx`, `components/brand/Logo.tsx`, `components/ui/{Button,Card,Badge,Tooltip,Tabs}.tsx`, `lib/{brand,cn,fonts,format,motion,icon-png}.ts(x)`, configs.
- Decisions: Scaffolded by hand (Bash was briefly unavailable) instead of create-next-app; same result. Next 16 uses `proxy.ts` (was middleware). `app/icon.svg` is the single logo-mark source; PNGs (apple 180, PWA 192/512/maskable) render from it via next/og. No `.ico` (SVG + PNG cover modern browsers).
- Decisions: messages split per namespace (`namespaces` list in `i18n/routing.ts`); missing locale files fall back to English until Phase 8. Language switcher keeps path, query and hash. Brand constants in `lib/brand.ts`; `NEXT_PUBLIC_SITE_URL` env sets the domain.
- Decisions: Framer Motion `MotionConfig reducedMotion="user"` + global CSS reduced-motion rule. Accent is cyan (#0891b2 light, #22d3ee dark) on deep indigo.
- Next: Phase 2, calculation engine in `lib/engine` + Vitest fixtures (brief section 9).

## Deliverables
- [x] Logo set, favicons and web manifest
- [x] Light and dark mode, reduced-motion support (base)
