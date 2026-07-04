@AGENTS.md

# CLAUDE.md — NutriTrack
# Project Bible for Claude Code

---

## 1. PROJECT OVERVIEW

**Product Name:** NutriTrack
**Type:** Consumer web app (installable PWA) — calorie & nutrition tracker
**Inspiration:** "Calories and Nutrition Tracker" (iOS App Store)
**Goal:** Let people log meals, scan barcodes for instant nutrition facts, track water and weight, and see daily calorie/macro progress at a glance.

---

## 2. CORE FEATURES

| Area | What it does |
|------|---------------|
| Diary | Log food to breakfast/lunch/dinner/snacks for any day; see calories remaining and macro progress |
| Food search | Search a shared food library (cached from Open Food Facts) plus your own custom foods |
| Barcode scanner | Scan a packaged product with the camera to pull nutrition facts instantly (`@zxing/browser` + Open Food Facts API). If the barcode isn't in Open Food Facts (or the scanner misreads it), falls back to a manual-entry form that caches the entry by barcode so a repeat scan is instant next time (`components/diary/BarcodeTab.tsx`) |
| AI photo scan | Take or upload a food photo; Claude (vision + structured outputs) decomposes each dish into its individual visible ingredients (e.g. a burger's bun/patty/cheese, a salad's greens/protein/dressing) as separate reviewable items with their own calories/macros, rather than one lumped entry per dish (`lib/anthropic/food-vision.ts`) |
| Custom foods & recipes | Save your own foods, and build multi-ingredient recipes that compute total nutrition automatically |
| Favorites | Star foods for one-tap re-logging |
| Water tracking | Quick-add buttons + custom amount, daily goal ring, 7-day history chart |
| Weight tracking | Log daily weight, see trend vs. previous entry and a chart over time |
| Settings | Daily calorie/macro/water goals, units (kg/lb), activity level, an "estimate for me" TDEE calculator |

---

## 3. TECH STACK

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack by default) |
| Language | TypeScript strict mode |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (`radix-nova` style) |
| Backend / DB | Supabase (PostgreSQL + Auth + RLS) |
| Auth | Supabase Auth — email/password + Google OAuth |
| Charts | Recharts (via shadcn `chart` wrapper) |
| Barcode scanning | `@zxing/browser` (camera-based, client-only) |
| Food data | Open Food Facts public API (barcode lookup + search fallback), cached into `foods` |
| AI vision | Anthropic API (`claude-opus-4-8`), structured outputs via `output_config.format` for guaranteed-valid JSON |
| PWA | `app/manifest.ts` + hand-rolled `public/sw.js` service worker |
| Hosting | Vercel (recommended) |

### Next.js 16 specifics (read before writing route/page code)

This project was generated with a real, current Next.js 16 install. Its bundled
docs live in `node_modules/next/dist/docs/` — read them before assuming an API
from training data still applies. The two changes that matter most here:

- **`params` / `searchParams` are `Promise`s** in every page, layout, and route
  handler. Always `await` them (see `app/(dashboard)/dashboard/page.tsx` for the
  pattern).
- **`middleware.ts` is renamed to `proxy.ts`**, and the exported function is
  named `proxy`, not `middleware`. Auth-gating logic lives in
  `lib/supabase/proxy.ts` and is wired up from root `proxy.ts`.

---

## 4. ENVIRONMENT VARIABLES

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

No API key is needed for Open Food Facts (public API, rate-limited — a
descriptive `User-Agent` is sent on every request per their usage policy).
`ANTHROPIC_API_KEY` powers the AI photo-scan feature (`lib/anthropic/`) —
without it, every other feature still works; only the photo tab in Add Food
will fail.

---

## 5. DATABASE SCHEMA

Full schema SQL is in `docs/schema.sql` — run it in the Supabase SQL Editor.
Tables: `profiles`, `foods` (shared library + user customs), `food_logs`,
`water_logs`, `weight_logs`, `recipes`, `favorites`. RLS is enabled on every
table; a Postgres trigger (`handle_new_user`) creates a `profiles` row on
signup.

`foods.user_id` is nullable: `null` means a shared/library food (from Open
Food Facts or seeded data), a real UUID means a user's private custom food.
The RLS insert policy allows authenticated users to insert rows with
`user_id = null` — this is what lets barcode/search results get cached into
the shared library without a service-role client.

---

## 6. FOLDER STRUCTURE

```
nutritrack/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── actions.ts          # signIn, signUp, signInWithGoogle, signOut (Server Actions)
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/route.ts   # OAuth code exchange
│   ├── (dashboard)/
│   │   ├── layout.tsx          # auth-gated shell: Sidebar + MobileNav
│   │   └── dashboard/
│   │       ├── page.tsx        # Diary (today's log) — default route
│   │       ├── water/page.tsx
│   │       ├── weight/page.tsx
│   │       ├── foods/page.tsx  # My Foods / Recipes / Favorites tabs
│   │       └── settings/page.tsx
│   ├── manifest.ts             # PWA manifest (App Router metadata route)
│   ├── icon.tsx / apple-icon.tsx / icon-192/route.tsx / icon-512/route.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                     # shadcn primitives
│   ├── diary/                  # DateNav, CalorieSummary, MealSection, AddFoodDialog, BarcodeScanner, PhotoScanTab
│   ├── water/  weight/  foods/ settings/  auth/  layout/  pwa/
├── lib/
│   ├── supabase/                # client.ts (browser), server.ts (RSC), admin.ts (service role), proxy.ts
│   ├── actions/                  # "use server" mutations: foods, logs, water, weight, recipes, favorites, profile, vision
│   ├── data/                     # server-only read helpers used directly by pages (profile, diary, weight, foods)
│   ├── off/client.ts             # Open Food Facts API client
│   ├── anthropic/                # client.ts, food-vision.ts (photo → structured nutrition estimate)
│   └── utils/                    # nutrition.ts (macro/TDEE math), date.ts
├── types/index.ts
├── proxy.ts                      # Next 16 middleware replacement — route protection
└── docs/schema.sql
```

---

## 7. DATA-ACCESS PATTERN

- **Reads** happen directly in Server Components via `lib/data/*` — no client
  fetch waterfalls for initial page data.
- **Mutations** are Server Actions in `lib/actions/*`, each starting with a
  `requireUserId()` check (throws if unauthenticated — never trust the
  client). Client Components call these directly as async functions (not just
  via `<form action>`), then `revalidatePath` refreshes the relevant page.
- Bind arguments with `.bind(null, id)` when passing a parameterized Server
  Action into a Client Component prop (see `DeleteFoodButton` usage in
  `app/(dashboard)/dashboard/foods/page.tsx`).

---

## 8. AUTH FLOW

- Supabase Auth, email/password + Google OAuth.
- `proxy.ts` protects everything under `/dashboard` and redirects logged-in
  users away from `/login` and `/signup`.
- On first dashboard load, `lib/data/profile.ts#getProfile` lazily creates a
  `profiles` row with sane defaults if the signup trigger hasn't fired yet
  (e.g. local dev without the SQL trigger applied).

---

## 9. DESIGN SYSTEM

**Aesthetic:** Apple Fitness-inspired — true black background, dark-gray
rounded cards, bold white headlines, a lime-green accent, and colored
concentric progress rings. Dark is the default theme (`defaultTheme="dark"`
in `app/layout.tsx`); light mode tokens still exist for the settings toggle
but the dark tokens are the primary, tuned experience.

**Color roles (see `app/globals.css`, `.dark` block):**
- `--background: #000000`, `--card: #1c1c1e` — true black page, dark-gray cards
- `--primary: #c6f135` — lime green; CTA text/buttons, active nav state, ring accents
- `--destructive`: used for "over goal" states
- Macro chart colors are fixed by role and modeled on Apple's Move/Exercise/Stand
  rings: `--chart-1` calories (pink-red), `--chart-2` protein (green), `--chart-3`
  carbs (cyan), `--chart-4` fat (amber), `--chart-5` water (teal) — reuse these
  everywhere macros/water are visualized so color coding stays consistent.
- `CalorieSummary` renders calories/protein/carbs as three concentric rings
  (mirroring the Activity Rings card) plus a 2x2 stat-card grid for all four
  macros, styled after the Step Count/Step Distance cards.

**Component rules:**
- Radius: `--radius: 1.1rem` (rounder, friendlier than a data-dashboard app)
- Mobile-first: floating pill-shaped bottom tab bar (`MobileNav`) under `md`,
  left `Sidebar` at `md+`
- Page/section titles are bold and large (`text-3xl font-bold tracking-tight`
  or the `DateNav` date label), not small semibold labels
- Loading: skeletons / inline spinners, never full-page spinners
- Empty states: always include a CTA (see `EmptyState` in the Foods page)

---

## 10. PWA NOTES

- `app/manifest.ts` is the App Router metadata-route form of `manifest.json` —
  edit it there, not as a static file.
- Icons are generated at request time via `next/og`'s `ImageResponse`
  (`app/icon.tsx`, `app/apple-icon.tsx`, `app/icon-192/route.tsx`,
  `app/icon-512/route.tsx`) so there are no binary assets to keep in sync —
  edit the JSX if the brand mark changes.
- `public/sw.js` is a minimal network-first service worker with an offline
  fallback to `/dashboard`, registered client-side by
  `components/pwa/ServiceWorkerRegister.tsx`. It's enough to satisfy Chrome's
  installability criteria; iOS Safari installs via manifest + apple-touch-icon
  without needing the service worker at all.

---

## 11. CRITICAL RULES FOR CLAUDE CODE

1. **TypeScript strict mode, no `any`.**
2. **Never call Supabase or Open Food Facts directly from Client Components** —
   go through a Server Action (`lib/actions/*`) or have the Server Component
   pass data down as props.
3. **Every Server Action re-checks auth** via `requireUserId()` — don't trust a
   client-supplied `userId`.
4. **RLS is the source of truth** — every table has it enabled; don't add a
   feature that requires disabling it.
5. **Mobile-first** — build and test the bottom-nav mobile layout, not just
   desktop sidebar.
6. **No mock data** — empty states over fake rows.
7. **`params`/`searchParams` are Promises** — this is Next.js 16, not the App
   Router you remember from training; `await` them.

---

## 12. BUILD SEQUENCE

### Phase 1 — Foundation ✅ COMPLETE
- [x] Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui scaffold
- [x] Supabase schema (`docs/schema.sql`) — **run manually in Supabase dashboard**
- [x] Auth: signup, login, logout, Google OAuth
- [x] `proxy.ts` route protection
- [x] Dashboard shell: Sidebar, MobileNav
- [x] PWA manifest, icons, service worker

### Phase 2 — Core Tracking ✅ COMPLETE
- [x] Diary page: date nav, calorie/macro summary, meal sections
- [x] Food search (local + Open Food Facts fallback, cached)
- [x] Barcode scanning
- [x] Custom foods, recipes, favorites
- [x] Water tracking + 7-day chart
- [x] Weight tracking + trend chart
- [x] Settings: goals, units, activity level, TDEE estimate
- [x] AI photo scan: upload/capture a food photo, Claude vision estimates items + macros, review before logging

### Phase 3 — Polish + Launch (not started)
- [ ] Real Google OAuth credentials configured in Supabase
- [ ] Seed a starter set of common foods so search isn't 100% OFF-dependent on day one
- [ ] Onboarding flow (collect height/weight/goal on first login instead of defaults)
- [ ] Push notifications / reminders to log meals
- [ ] Error boundaries + loading.tsx per route
- [ ] Real device PWA install test (iOS + Android)
- [ ] Vercel deployment + custom domain

---

*Built with Claude Code.*
