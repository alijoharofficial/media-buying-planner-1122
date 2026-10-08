# Media Buying Planner

Ad budget calculator and media buying planner for Meta and Google Search. It turns business numbers
(client value, margin, funnel rates, or order value and costs) into a monthly budget, expected results,
a verdict and a budget split, and shows every formula behind the result.

- Lead generation and ecommerce, new accounts and accounts with data, Meta and Google Search
- 7 languages: English, Spanish, French, German, Arabic (right to left), Portuguese, Simplified Chinese
- 10 guides per language, written by the TECH24 team
- Planner inputs stay in the browser (local storage); nothing is sent to a server

## Stack

Next.js 16 (App Router) with TypeScript, Tailwind CSS v4, Framer Motion, next-intl, React Hook Form with
Zod, Recharts, MDX, next-themes and Vitest. Deploys to Vercel.

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000 (redirects to /en)
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Vitest: calculation engine fixtures and translation checks |

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public URL, without a trailing slash. Used for canonical links, hreflang, sitemap, structured data and Open Graph images. |
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics 4 measurement ID. Loaded only after the visitor accepts analytics cookies. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Production | Cloudflare Turnstile site key for the contact form. |
| `TURNSTILE_SECRET_KEY` | Production | Cloudflare Turnstile secret, checked on the server. |
| `RESEND_API_KEY` | Production | Resend API key for contact form emails. |
| `CONTACT_FROM_EMAIL` | Production | Sender address for contact form emails (a domain verified in Resend). |
| `CONTACT_TO_EMAIL` | Production | Inbox that receives contact form messages. |

The contact form is the only feature that needs these keys. In development the Turnstile check is
skipped; in production a missing Turnstile secret fails verification and missing Resend values show a
"could not send" message. Everything else works without them.

## Deploy to Vercel

1. Push the repository to GitHub and import it in Vercel (framework preset: Next.js, no extra settings).
2. Add the environment variables above for the Production environment. Set `NEXT_PUBLIC_SITE_URL` to the
   final domain, for example `https://example.com`.
3. Deploy, then add the custom domain in Vercel and redeploy if `NEXT_PUBLIC_SITE_URL` changed.
4. Check `/sitemap.xml`, `/robots.txt` and a page's `<link rel="canonical">` point at the final domain,
   then submit the sitemap in Google Search Console.

Pages render on request because every response carries a per-request Content Security Policy nonce
(`proxy.ts`), which also sets the security headers.

## Project structure

```
app/[locale]/        Pages (every URL is locale-prefixed: /en, /ar, ...)
app/                 Root files: manifest, icons, robots, sitemap, Open Graph image route, API
components/          UI primitives (components/ui), layout, planner, results, guides, content
content/guides/      Guide articles as MDX, one folder per locale
lib/engine/          Pure calculation engine and its tests (no UI imports)
lib/planner/         Planner fields, validation, storage and share links
messages/<locale>/   UI strings, split by namespace
i18n/                Locale routing and message loading
proxy.ts             Locale routing, CSP nonce and security headers
docs/                Build brief and progress log
```

## Adding or editing content

- **UI text:** edit `messages/<locale>/<namespace>.json`. Every locale must have the same keys and
  `{placeholders}` as English; `npm test` checks this. The brand name is never translated and lives
  in `lib/brand.ts`.
- **Guides:** add `content/guides/<locale>/<slug>.mdx`, register it in `GUIDES` (`lib/site.ts`, with
  optional translated slugs) and in `GUIDE_CONTENT` (`lib/guides.ts`). Titles and summaries come from
  `messages/<locale>/guides.json`.
- **Benchmarks and defaults:** placeholder benchmarks and planner defaults are in `data/` and
  `lib/planner/`. Replace them with real data before relying on them.

## Quality checks

- Engine: unit tests for every fixture in the brief (`lib/engine/__tests__`).
- Translations: key, placeholder, brand and punctuation checks for all locales.
- Lighthouse (mobile, simulated throttling), measured on the home page, planner, a guide and content
  pages in several languages: accessibility and SEO 100, best practices 96 to 100. Performance is 86 to
  97 on the home and content pages; the planner scores 82 to 87 on mobile (99 to 100 on desktop)
  because its interactive form needs more JavaScript. Results vary a few points between runs.
- Every page fits a 360px wide screen in all 7 languages; axe-core reports no WCAG 2.1 AA issues in
  light or dark mode.
