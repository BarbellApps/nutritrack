# NutriTrack

A calorie & nutrition tracker — log meals, scan barcodes, and track calories,
macros, water, and weight. Built with Next.js 16, Supabase, and shadcn/ui as
an installable PWA.

See [`CLAUDE.md`](./CLAUDE.md) for the full project bible (feature list,
architecture, schema, and design system).

## Getting started

1. Copy `.env.example` to `.env.local` and fill in your Supabase project
   credentials.
2. Run `docs/schema.sql` in the Supabase SQL Editor to create the tables, RLS
   policies, and the signup trigger.
3. Install dependencies and start the dev server:

   ```bash
   npm install
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint with ESLint
